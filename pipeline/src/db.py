"""
db.py — Persist extracted records to JSON (and optionally SQLite).

For the vertical slice we write one JSON file per table:
  data/extracted/latest/<table_name>.json

The file contains:
  {
    "meta": {
      "table": "heroes_levelup",
      "game_version": "...",
      "extraction_run_id": "...",
      "extracted_at": "2026-07-14T...",
      "record_count": N
    },
    "records": [ {...}, {...}, ... ]
  }
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


_REPO_ROOT = Path(__file__).resolve().parents[2]
_OUTPUT_DIR = _REPO_ROOT / "data" / "extracted" / "latest"


def write_json(
    records: list[dict[str, Any]],
    *,
    table_name: str,
    game_version: str = "",
    extraction_run_id: str = "",
    output_dir: Path | None = None,
) -> Path:
    """
    Write a list of records to data/extracted/latest/<table_name>.json.

    Returns the path of the written file.
    """
    out_dir = Path(output_dir) if output_dir else _OUTPUT_DIR
    out_dir.mkdir(parents=True, exist_ok=True)

    out_path = out_dir / f"{table_name}.json"

    payload = {
        "meta": {
            "table": table_name,
            "game_version": game_version,
            "extraction_run_id": extraction_run_id,
            "extracted_at": datetime.now(timezone.utc).isoformat(),
            "record_count": len(records),
        },
        "records": records,
    }

    with out_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return out_path
