"""
unpack.py — Extract a named .luac entry from a Last War XAPK.

XAPK nesting:
  game.xapk  (ZIP)
    └── install_time_pack.apk  (ZIP)
          └── assets/table/table_<hash>.data  (ZIP)
                └── <entry_name>  (raw Lua bytecode, no .luac extension inside)
"""

import io
import zipfile
from pathlib import Path


_TABLE_PREFIX = "assets/table/table_"


def extract_luac(xapk_path: str | Path, entry_name: str) -> bytes:
    """
    Extract a single Lua bytecode entry from a Last War XAPK.

    Parameters
    ----------
    xapk_path : path to the .xapk file
    entry_name : the table name inside the data archive (e.g. "heroes_levelup")

    Returns
    -------
    Raw bytes of the .luac file.

    Raises
    ------
    FileNotFoundError  if the XAPK, APK, or entry cannot be located.
    """
    xapk_path = Path(xapk_path)
    if not xapk_path.exists():
        raise FileNotFoundError(f"XAPK not found: {xapk_path}")

    # Layer 1: XAPK → install_time_pack.apk
    with zipfile.ZipFile(xapk_path) as xz:
        apk_names = xz.namelist()
        if "install_time_pack.apk" not in apk_names:
            raise FileNotFoundError(
                f"install_time_pack.apk not found inside {xapk_path.name}. "
                f"Available: {apk_names[:10]}"
            )
        apk_data = xz.read("install_time_pack.apk")

    # Layer 2: APK → assets/table/table_*.data
    with zipfile.ZipFile(io.BytesIO(apk_data)) as apk:
        table_entries = [
            n for n in apk.namelist()
            if n.startswith(_TABLE_PREFIX) and n.endswith(".data")
        ]
        if not table_entries:
            raise FileNotFoundError(
                "No assets/table/table_*.data found inside install_time_pack.apk"
            )
        # There should be exactly one; pick the first
        table_zip_name = table_entries[0]
        table_data = apk.read(table_zip_name)

    # Layer 3: table data ZIP → named entry (no extension inside)
    with zipfile.ZipFile(io.BytesIO(table_data)) as tz:
        entries = tz.namelist()
        if entry_name not in entries:
            raise FileNotFoundError(
                f"'{entry_name}' not found in {table_zip_name}. "
                f"Available ({len(entries)} entries): {entries[:20]}"
            )
        return tz.read(entry_name)
