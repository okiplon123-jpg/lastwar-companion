"""
locale_parser.py  —  Canonical Last War locale binary parser.

Format : gzip-compressed binary, 4-byte header, then repeated key/value pairs.
Encoding: LEB128 (unsigned)
Verified: 52,733 entries from en.bin

Usage
-----
    from locale_parser import load_locale
    locale = load_locale(raw_bytes_from_xapk)

Version history
---------------
v1  BROKEN  — used 4-byte LE, truncated at ~13,123 entries
v2  FIXED   — uses LEB128, returns full 52,733 entries
"""
import gzip


def _read_len(data: bytes, pos: int):
    """Read unsigned LEB128 integer. Return (value: int, new_pos: int)."""
    result = 0
    shift = 0
    while pos < len(data):
        b = data[pos]
        pos += 1
        result |= (b & 0x7F) << shift
        shift += 7
        if (b & 0x80) == 0:
            break
    return result, pos


def load_locale(data: bytes) -> dict:
    """Parse Last War locale binary. Returns {key: value} dict."""
    try:
        data = gzip.decompress(data)
    except Exception:
        pass

    pos = 4  # skip 4-byte file header
    out: dict = {}

    while pos < len(data) - 4:
        try:
            klen, pos = _read_len(data, pos)
            if klen == 0 or klen > 500:
                break
            key = data[pos:pos + klen].decode("utf-8", errors="replace")
            pos += klen
            vlen, pos = _read_len(data, pos)
            if vlen > 50_000:
                break
            val = data[pos:pos + vlen].decode("utf-8", errors="replace")
            pos += vlen
            out[key] = val
        except Exception:
            break

    return out
