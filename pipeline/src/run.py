"""
run.py — Entry point for the Last War extraction pipeline.

Usage:
    python run.py --xapk path/to/game.xapk [--version 38076] [--run-id auto]

Produces:
    data/extracted/latest/heroes_levelup.json
"""

from __future__ import annotations

import argparse
import sys
import uuid
from pathlib import Path

# Allow running from the pipeline/src directory or from repo root
_SRC = Path(__file__).resolve().parent
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from unpack import extract_luac
from lua_bytecode import execute_table
from hero_level_normalizer import normalize, NormalizationError
from db import write_json


_TABLE = "heroes_levelup"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Extract Last War game data from XAPK."
    )
    parser.add_argument(
        "--xapk", required=True, metavar="PATH",
        help="Path to the .xapk file",
    )
    parser.add_argument(
        "--version", default="", metavar="VER",
        help="Game version string (e.g. '38076'). Used for provenance only.",
    )
    parser.add_argument(
        "--run-id", default="", metavar="ID",
        help="Unique run identifier. Defaults to a new UUID.",
    )
    args = parser.parse_args(argv)

    xapk_path = Path(args.xapk)
    game_version = args.version
    run_id = args.run_id or str(uuid.uuid4())

    print(f"[pipeline] XAPK    : {xapk_path}")
    print(f"[pipeline] Table   : {_TABLE}")
    print(f"[pipeline] Version : {game_version or '(unknown)'}")
    print(f"[pipeline] Run ID  : {run_id}")

    # ── Phase 1: unpack ────────────────────────────────────────────────────────
    print(f"\n[1/4] Extracting {_TABLE}.luac from XAPK …")
    try:
        luac_bytes = extract_luac(xapk_path, _TABLE)
    except FileNotFoundError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        return 1
    print(f"      {len(luac_bytes):,} bytes extracted.")

    # ── Phase 2: decompile ─────────────────────────────────────────────────────
    print("[2/4] Executing Lua bytecode …")
    try:
        vm_result = execute_table(luac_bytes)
    except Exception as e:
        print(f"ERROR during bytecode execution: {e}", file=sys.stderr)
        return 1
    if vm_result is None:
        print("ERROR: VM returned None — bytecode may be malformed.", file=sys.stderr)
        return 1
    print(f"      VM returned a dict with {len(vm_result)} top-level keys.")

    # ── Phase 3: normalize ─────────────────────────────────────────────────────
    print("[3/4] Normalizing records …")
    try:
        records = normalize(
            vm_result,
            source_table=_TABLE,
            source_file=str(xapk_path),
            game_version=game_version,
            extraction_run_id=run_id,
        )
    except NormalizationError as e:
        print(f"ERROR during normalization: {e}", file=sys.stderr)
        return 1
    print(f"      {len(records):,} records produced.")

    # ── Phase 4: write ─────────────────────────────────────────────────────────
    print("[4/4] Writing JSON …")
    out_path = write_json(
        records,
        table_name=_TABLE,
        game_version=game_version,
        extraction_run_id=run_id,
    )
    print(f"      Written to: {out_path}")

    # ── Spot-check ─────────────────────────────────────────────────────────────
    r1 = next((r for r in records if r.get("id") == 1), None)
    if r1:
        print("\n[pipeline] Spot-check — Level 1:")
        for k, v in r1.items():
            if not k.startswith("_"):
                print(f"  {k:20s} = {v!r}")

    print("\n[pipeline] Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
