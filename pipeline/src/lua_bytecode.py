"""
lua_bytecode.py — Lua 5.3 bytecode reader for Last War's custom format.

Last War uses a modified Lua 5.3 with:
  - Format byte = 0x01 (stripped — no debug info)
  - Header omits sizeof(Instruction) (always 4)
  - Proto header has one extra byte after is_vararg (upvalue count pre-cached)
  - sizeof(size_t) = 4 (32-bit even on 64-bit platforms)

The data tables use a schema-first columnar format:
  1. A field schema is built: {field_name: [col_index, type_string]}
  2. Each data row is a positional array matching the schema's column indices
  3. The outer table is: {index: schema_dict, data: {1: row1, 2: row2, ...}}

We interpret the instruction stream with a minimal VM — only the opcodes
needed for table construction: NEWTABLE, LOADK, SETLIST, SETTABLE, RETURN.
"""

import struct
from typing import Any


# ── Lua 5.3 header ────────────────────────────────────────────────────────────
LUA_MAGIC   = b"\x1bLua"
LUA_VERSION = 0x53
LUA_FORMAT  = 0x01   # Last War custom (stripped)
LUAC_DATA   = b"\x19\x93\x0d\x0a\x1a\x0a"
LUAC_INT    = 0x5678
LUAC_NUM    = 370.5
HEADER_SIZE = 32     # 4+1+1+6+1+1+1+1+8+8  (no sizeof_instruction byte)

# ── Lua 5.3 opcodes (standard numbering) ──────────────────────────────────────
OP_LOADK    = 1
OP_NEWTABLE = 11
OP_SETTABLE = 10
OP_SETLIST  = 43
OP_RETURN   = 38

# ── RK decoding: bit 8 set in B/C → constant index ────────────────────────────
RK_BIT = 0x100

def _rk_idx(rk: int) -> int:
    """Return constant index (strip the RK bit)."""
    return rk & 0xFF


# ── Low-level reader ───────────────────────────────────────────────────────────

class _Reader:
    """Stateful byte reader over a bytes buffer."""

    def __init__(self, data: bytes, pos: int = 0):
        self._d = data
        self.pos = pos

    def byte(self) -> int:
        v = self._d[self.pos]; self.pos += 1; return v

    def int32(self) -> int:
        v = struct.unpack_from("<i", self._d, self.pos)[0]; self.pos += 4; return v

    def uint32(self) -> int:
        v = struct.unpack_from("<I", self._d, self.pos)[0]; self.pos += 4; return v

    def int64(self) -> int:
        v = struct.unpack_from("<q", self._d, self.pos)[0]; self.pos += 8; return v

    def float64(self) -> float:
        v = struct.unpack_from("<d", self._d, self.pos)[0]; self.pos += 8; return v

    def skip(self, n: int):
        self.pos += n

    def lua_string(self) -> str | None:
        """Compact Lua 5.3 string: 0=NULL, 0xFF=long (size_t follows), else byte=len+1."""
        sb = self.byte()
        if sb == 0:
            return None
        if sb == 0xFF:
            slen = self.uint32() - 1
        else:
            slen = sb - 1
        s = self._d[self.pos: self.pos + slen].decode("utf-8", errors="replace")
        self.pos += slen
        return s

    def raw(self, n: int) -> bytes:
        b = self._d[self.pos: self.pos + n]; self.pos += n; return b


# ── Constant pool parser ───────────────────────────────────────────────────────

# Lua 5.3 constant type tags
_CT_NIL   = 0x00
_CT_FALSE = 0x01
_CT_TRUE  = 0x11
_CT_FLT   = 0x03
_CT_INT   = 0x13
_CT_SSTR  = 0x04
_CT_LSTR  = 0x14


def _read_constants(r: _Reader, n: int) -> list[Any]:
    constants: list[Any] = []
    for _ in range(n):
        ct = r.byte()
        if ct == _CT_NIL:
            constants.append(None)
        elif ct == _CT_FALSE:
            constants.append(False)
        elif ct == _CT_TRUE:
            constants.append(True)
        elif ct == _CT_FLT:
            constants.append(r.float64())
        elif ct == _CT_INT:
            constants.append(r.int64())
        elif ct in (_CT_SSTR, _CT_LSTR):
            constants.append(r.lua_string())
        else:
            raise ValueError(
                f"Unknown constant type 0x{ct:02x} at byte {r.pos - 1}"
            )
    return constants


# ── Instruction decoder (ABC / ABx formats) ───────────────────────────────────

def _decode_instruction(word: int) -> tuple[int, int, int, int, int]:
    """Return (opcode, A, B, C, Bx)."""
    op  = word & 0x3F
    A   = (word >> 6)  & 0xFF
    C   = (word >> 14) & 0x1FF
    B   = (word >> 23) & 0x1FF
    Bx  = (word >> 14) & 0x3FFFF
    return op, A, B, C, Bx


# ── Minimal Lua VM — table-construction only ───────────────────────────────────

class _MiniVM:
    """
    Interprets only the opcodes needed to reconstruct a Lua data table:
      NEWTABLE, LOADK, SETLIST, SETTABLE, RETURN.

    All other opcodes are silently skipped; they do not affect table layout.
    """

    def __init__(self, instructions: list[int], constants: list[Any]):
        self._instrs = instructions
        self._K = constants
        self._R: dict[int, Any] = {}   # register file

    def _k(self, idx: int) -> Any:
        return self._K[idx]

    def _rk(self, rk: int) -> Any:
        """Resolve RK value: constant if bit 8 set, else register."""
        if rk & RK_BIT:
            return self._K[rk & 0xFF]
        return self._R.get(rk)

    def run(self) -> Any:
        """Execute instructions and return the value placed in register 0."""
        for i, word in enumerate(self._instrs):
            op, A, B, C, Bx = _decode_instruction(word)

            if op == OP_NEWTABLE:
                self._R[A] = {}

            elif op == OP_LOADK:
                self._R[A] = self._K[Bx]

            elif op == OP_SETTABLE:
                # R[A][RK(B)] = RK(C)
                tbl = self._R.get(A, {})
                key = self._rk(B)
                val = self._rk(C)
                if key is not None:
                    tbl[key] = val
                self._R[A] = tbl

            elif op == OP_SETLIST:
                # R[A][(C-1)*FPF + i] = R[A+i]  for 1 <= i <= B
                # C is the block number (usually 1), B is count
                # FPF = LFIELDS_PER_FLUSH = 50
                FPF = 50
                tbl = self._R.get(A, {})
                if not isinstance(tbl, dict):
                    tbl = {}
                count = B
                block = C
                base = (block - 1) * FPF
                for j in range(1, count + 1):
                    val = self._R.get(A + j)
                    tbl[base + j] = val    # 1-indexed Lua array
                self._R[A] = tbl

            elif op == OP_RETURN:
                # Return R[A] ... R[A + B - 2]
                if B == 2:
                    return self._R.get(A)
                elif B == 1:
                    return None
                break

        return self._R.get(0)


# ── Proto reader ───────────────────────────────────────────────────────────────

def _read_proto(r: _Reader) -> tuple[list[int], list[Any]]:
    """
    Read one function proto and return (instructions, constants).
    Nested protos are skipped — top-level data tables never need them.
    """
    # Source name
    r.lua_string()

    # Line info (both 0 in stripped format)
    r.int32()   # linedefined
    r.int32()   # lastlinedefined

    # Stack info
    r.byte()    # numparams
    r.byte()    # is_vararg
    r.byte()    # extra byte (nups cached in header by this custom Lua build)
    r.byte()    # maxstacksize

    # Instructions
    n_instr = r.int32()
    raw_words = struct.unpack_from(f"<{n_instr}I", r._d, r.pos)
    r.skip(n_instr * 4)

    # Constants
    n_const = r.int32()
    constants = _read_constants(r, n_const)

    # Upvalues (skip: each is 2 bytes)
    n_upval = r.int32()
    r.skip(n_upval * 2)

    # Nested protos (skip — not needed for data tables)
    n_proto = r.int32()
    for _ in range(n_proto):
        _skip_proto(r)

    # Debug info (stripped format: all counts are 0)
    r.int32()   # sizelineinfo (= 0)
    r.int32()   # sizelocvars (= 0)
    r.int32()   # sizeupvalues (= 0)

    return list(raw_words), constants


def _skip_proto(r: _Reader):
    """Skip a nested function proto without parsing it."""
    r.lua_string()
    r.int32(); r.int32()
    r.byte(); r.byte(); r.byte(); r.byte()
    n = r.int32(); r.skip(n * 4)
    n = r.int32()
    for _ in range(n):
        ct = r.byte()
        if ct in (_CT_FLT, _CT_INT): r.skip(8)
        elif ct in (_CT_SSTR, _CT_LSTR):
            sb = r.byte()
            slen = (r.uint32() - 1) if sb == 0xFF else (sb - 1)
            r.skip(slen)
    n = r.int32(); r.skip(n * 2)
    n = r.int32()
    for _ in range(n): _skip_proto(r)
    r.int32(); r.int32(); r.int32()


# ── Header validator ───────────────────────────────────────────────────────────

def _validate_header(data: bytes):
    if data[:4] != LUA_MAGIC:
        raise ValueError(f"Bad Lua magic: {data[:4].hex()}")
    if data[4] != LUA_VERSION:
        raise ValueError(f"Expected Lua 5.3 (0x53), got 0x{data[4]:02x}")
    if data[5] != LUA_FORMAT:
        raise ValueError(
            f"Expected format 0x01 (Last War custom), got 0x{data[5]:02x}"
        )
    if data[6:12] != LUAC_DATA:
        raise ValueError("LUAC_DATA mismatch")
    luac_int = struct.unpack_from("<q", data, 16)[0]
    luac_num = struct.unpack_from("<d", data, 24)[0]
    if luac_int != LUAC_INT:
        raise ValueError(f"LUAC_INT mismatch: got {luac_int}")
    if abs(luac_num - LUAC_NUM) > 0.001:
        raise ValueError(f"LUAC_NUM mismatch: got {luac_num}")


# ── Public API ─────────────────────────────────────────────────────────────────

def execute_table(luac_bytes: bytes) -> dict | None:
    """
    Decompile and execute a Last War Lua 5.3 data table bytecode file.

    Returns the Lua table as a Python dict (Lua 1-indexed arrays are
    returned as dicts with integer keys), or None if execution fails.
    """
    _validate_header(luac_bytes)
    r = _Reader(luac_bytes, HEADER_SIZE)
    instructions, constants = _read_proto(r)
    vm = _MiniVM(instructions, constants)
    return vm.run()
