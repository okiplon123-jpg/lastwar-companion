"""
hero_level_normalizer.py — Normalize the heroes_levelup VM output into records.

The heroes_levelup Lua table uses a schema-first columnar format:

  result = {
    1: {                        ← outer table
      'index': {                ← schema dict
        'id':      {1: 1, 2: 'number'},
        'exp':     {1: 2, 2: 'number'},
        'army_num':{1: 3, 2: 'number'},
        ...
      }
    },
    2: {                        ← data dict (Lua integer keys 1..N)
      1: {1: 1, 2: 15, 3: 30, ...},   ← positional array for row 1
      2: {1: 2, 2: 20, 3: 40, ...},
      ...
    }
  }

The normalizer:
  1. Extracts the schema: field_name → col_index (1-based)
  2. Extracts data rows: row_key → positional dict
  3. For each row, builds {field_name: positional_dict[col_index]}
  4. Returns a list of HeroLevel dicts with provenance fields added.
"""

from __future__ import annotations

from typing import Any


# ── Output schema ──────────────────────────────────────────────────────────────

# All fields produced by this normalizer, in declaration order.
# The source table has these 17 columns (1-based):
#   1=id, 2=exp, 3=army_num, 4=lv_attr_atk1, 5=lv_attr_atk2, 6=lv_attr_atk3,
#   7=lv_attr_atk4, 8=lv_attr_def1, 9=lv_attr_def2, 10=lv_attr_def3,
#   11=lv_attr_def4, 12=lv_attr_arm1, 13=lv_attr_arm2, 14=lv_attr_arm3,
#   15=lv_attr_arm4, 16=spend, 17=break_require

_EXPECTED_FIELDS = {
    "id", "exp", "army_num",
    "lv_attr_atk1", "lv_attr_atk2", "lv_attr_atk3", "lv_attr_atk4",
    "lv_attr_def1", "lv_attr_def2", "lv_attr_def3", "lv_attr_def4",
    "army_num1", "army_num2", "army_num3", "army_num4",
    "spend", "break_require",
}


# ── Public API ─────────────────────────────────────────────────────────────────

class NormalizationError(Exception):
    """Raised when the VM output doesn't match the expected structure."""


def normalize(
    vm_result: Any,
    *,
    source_table: str = "heroes_levelup",
    source_file: str = "",
    game_version: str = "",
    extraction_run_id: str = "",
) -> list[dict]:
    """
    Convert the raw VM output dict into a list of canonical hero-level records.

    Parameters
    ----------
    vm_result        : return value of lua_bytecode.execute_table()
    source_table     : Lua table name (for provenance)
    source_file      : path to the .luac file (for provenance)
    game_version     : game APK version string (for provenance)
    extraction_run_id: unique run ID (ISO timestamp or UUID, for provenance)

    Returns
    -------
    List of dicts, one per hero level, sorted by id ascending.
    """
    if not isinstance(vm_result, dict):
        raise NormalizationError(
            f"VM returned {type(vm_result).__name__}, expected dict"
        )

    # ── Step 1: extract schema ─────────────────────────────────────────────────
    # The outer table returned by the VM uses string keys: {'index': ..., 'data': ...}
    index_raw = vm_result.get("index")
    if not isinstance(index_raw, dict):
        raise NormalizationError(
            f"Expected vm_result['index'] to be a dict (field schema), "
            f"got {type(index_raw).__name__}. Keys: {list(vm_result.keys())[:10]}"
        )

    # index_raw: { field_name: {1: col_index, 2: type_string} }
    schema: dict[str, int] = {}
    for field_name, meta in index_raw.items():
        if not isinstance(meta, dict):
            continue
        col_idx = meta.get(1)
        if col_idx is None:
            raise NormalizationError(
                f"Schema entry '{field_name}' has no col_index (key 1): {meta}"
            )
        schema[field_name] = int(col_idx)

    if not schema:
        raise NormalizationError("Schema is empty — no fields found in index_raw")

    missing = _EXPECTED_FIELDS - set(schema.keys())
    if missing:
        raise NormalizationError(
            f"Schema is missing expected fields: {sorted(missing)}"
        )

    # ── Step 2: extract data rows ──────────────────────────────────────────────
    data_raw = vm_result.get("data")
    if not isinstance(data_raw, dict):
        raise NormalizationError(
            f"Expected vm_result['data'] to be a dict (data rows), "
            f"got {type(data_raw).__name__}"
        )

    # ── Step 3: build output records ───────────────────────────────────────────
    records: list[dict] = []
    for row_key, positional in sorted(data_raw.items(), key=lambda kv: int(kv[0])):
        if not isinstance(positional, dict):
            continue

        row: dict[str, Any] = {}
        for field_name, col_idx in schema.items():
            val = positional.get(col_idx)
            # Coerce integer-typed floats (Lua may store as float64)
            if isinstance(val, float) and val == int(val):
                val = int(val)
            row[field_name] = val

        # Provenance fields
        row["_source_table"] = source_table
        row["_source_file"] = source_file
        row["_game_version"] = game_version
        row["_extraction_run_id"] = extraction_run_id

        records.append(row)

    if not records:
        raise NormalizationError("No data rows produced — data_raw may be empty")

    # Sort by hero level id
    records.sort(key=lambda r: r.get("id", 0))
    return records
