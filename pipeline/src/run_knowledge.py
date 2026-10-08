"""
run_knowledge.py — Build the Knowledge Database mechanic by mechanic.

Usage:
    python run_knowledge.py --xapk path/to/game.xapk [--version 38076]

Each mechanic is extracted in order.  If one fails the rest continue.
Output: data/extracted/latest/<table>.json for each mechanic.
"""

from __future__ import annotations

import argparse
import io
import sys
import uuid
import zipfile
from pathlib import Path
from typing import Any

_SRC = Path(__file__).resolve().parent
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from lua_bytecode import execute_table
from db import write_json
from extractors import (
    extract_hero_base,
    extract_hero_level_growth,
    extract_hero_stars,
    extract_hero_skills,
    extract_exclusive_weapons,
    extract_gear,
    extract_research,
    extract_alliance_tech,
    extract_buildings,
    extract_drone,
    extract_decorations,
    extract_vip,
    extract_troops,
    extract_military_centers,
    extract_aps_research,
    extract_hero_honor_level,
    extract_decoration_building_levels,
    extract_uav_levels,
    extract_season_military_rank,
)


# ─────────────────────────────────────────────────────────────────────────────
# XAPK loader
# ─────────────────────────────────────────────────────────────────────────────

_TABLE_PREFIX = "assets/table/table_"


class XapkLoader:
    """Lazy loader that opens the nested XAPK once and caches table bytes."""

    def __init__(self, xapk_path: str | Path):
        self._path = Path(xapk_path)
        self._cache: dict[str, bytes] = {}
        self._table_zip: bytes | None = None

    def _get_table_zip(self) -> bytes:
        if self._table_zip is None:
            with zipfile.ZipFile(self._path) as xz:
                apk_data = xz.read("install_time_pack.apk")
            with zipfile.ZipFile(io.BytesIO(apk_data)) as apk:
                tnames = [n for n in apk.namelist()
                          if n.startswith(_TABLE_PREFIX) and n.endswith(".data")]
                self._table_zip = apk.read(tnames[0])
        return self._table_zip

    def load(self, name: str) -> dict:
        """Extract and execute a Lua table by name, return the VM result dict."""
        if name not in self._cache:
            tz_bytes = self._get_table_zip()
            with zipfile.ZipFile(io.BytesIO(tz_bytes)) as tz:
                raw = tz.read(name)
            self._cache[name] = raw
        return execute_table(self._cache[name])


# ─────────────────────────────────────────────────────────────────────────────
# Mechanic runners
# ─────────────────────────────────────────────────────────────────────────────

def _run_m003(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-003 Hero Base Stats → hero_base.json"""
    lw_hero = loader.load("lw_hero")
    records = extract_hero_base(lw_hero, game_version=ver, extraction_run_id=run_id)
    path = write_json(records, table_name="hero_base", game_version=ver, extraction_run_id=run_id)
    return str(path), len(records), "PARTIALLY_KNOWN"


def _run_m004(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-004 Hero Level Growth → hero_levels.json"""
    records = extract_hero_level_growth(
        loader.load("lw_template_property"),
        loader.load("heroes_levelup"),
        loader.load("lw_hero_level"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    path = write_json(records, table_name="hero_levels", game_version=ver, extraction_run_id=run_id)
    return str(path), len(records), "VERIFIED"


def _run_m005(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-005 Hero Stars / Awakening → hero_stars.json + hero_awaken_ranks.json"""
    star_records, awaken_records = extract_hero_stars(
        loader.load("lw_hero_rank_reset"),
        loader.load("lw_hero_awaken"),
        loader.load("lw_hero_awaken_rank"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    write_json(star_records, table_name="hero_stars", game_version=ver, extraction_run_id=run_id)
    write_json(awaken_records, table_name="hero_awaken_ranks", game_version=ver, extraction_run_id=run_id)
    total = len(star_records) + len(awaken_records)
    return "hero_stars.json + hero_awaken_ranks.json", total, "PARTIALLY_KNOWN"


def _run_m008(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-008 Hero Skills → hero_skills.json"""
    records = extract_hero_skills(
        loader.load("lw_hero_skill"),
        loader.load("lw_hero_skill_B"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    path = write_json(records, table_name="hero_skills", game_version=ver, extraction_run_id=run_id)
    return str(path), len(records), "PARTIALLY_KNOWN"


def _run_m010(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-010 Exclusive Weapons → ew_weapon_levels.json + ew_weapon_effects.json + ew_weapon_units.json"""
    wep_records, eff_records, unit_records = extract_exclusive_weapons(
        loader.load("lw_hero_unique_weapon"),
        loader.load("lw_hero_unique_weapon_effect"),
        loader.load("lw_hero_unique_weapon_unit"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    write_json(wep_records,  table_name="ew_weapon_levels", game_version=ver, extraction_run_id=run_id)
    write_json(eff_records,  table_name="ew_weapon_effects", game_version=ver, extraction_run_id=run_id)
    write_json(unit_records, table_name="ew_weapon_units",  game_version=ver, extraction_run_id=run_id)
    total = len(wep_records) + len(eff_records) + len(unit_records)
    return "ew_weapon_levels.json + ew_weapon_effects.json + ew_weapon_units.json", total, "VERIFIED"


def _run_m007_m006(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-007 + M-006 Gear → gear_items.json + gear_promote.json + gear_upgrade.json"""
    gear, prom, upg = extract_gear(
        loader.load("lw_equip"),
        loader.load("lw_equip_promote"),
        loader.load("lw_equip_upgrade"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    write_json(gear, table_name="gear_items",   game_version=ver, extraction_run_id=run_id)
    write_json(prom, table_name="gear_promote",  game_version=ver, extraction_run_id=run_id)
    write_json(upg,  table_name="gear_upgrade",  game_version=ver, extraction_run_id=run_id)
    total = len(gear) + len(prom) + len(upg)
    return "gear_items.json + gear_promote.json + gear_upgrade.json", total, "PARTIALLY_KNOWN"


def _run_m009(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-009 Research → research_nodes.json + research_levels.json"""
    nodes, levels = extract_research(
        loader.load("lw_camp_science_detail"),
        loader.load("lw_camp_science_tab"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    write_json(nodes,  table_name="research_nodes",  game_version=ver, extraction_run_id=run_id)
    write_json(levels, table_name="research_levels", game_version=ver, extraction_run_id=run_id)
    total = len(nodes) + len(levels)
    return "research_nodes.json + research_levels.json", total, "PARTIALLY_KNOWN"


def _run_m018(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-018 Buildings → buildings.json"""
    records = extract_buildings(
        loader.load("building"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    path = write_json(records, table_name="buildings", game_version=ver, extraction_run_id=run_id)
    return str(path), len(records), "PARTIALLY_KNOWN"


def _run_m011(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-011 Drone Battle System → drone_levels.json + drone_chip_attributes.json"""
    drone, chips = extract_drone(
        loader.load("lw_drone_battlesystem_level"),
        loader.load("lw_drone_skillchip_attribute"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    write_json(drone, table_name="drone_levels",          game_version=ver, extraction_run_id=run_id)
    write_json(chips, table_name="drone_chip_attributes", game_version=ver, extraction_run_id=run_id)
    total = len(drone) + len(chips)
    return "drone_levels.json + drone_chip_attributes.json", total, "VERIFIED"


def _run_m022(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-022 Military Centers → military_centers.json"""
    records = extract_military_centers(
        loader.load("building_B"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    path = write_json(records, table_name="military_centers", game_version=ver, extraction_run_id=run_id)
    return str(path), len(records), "VERIFIED"


def _run_m023(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-023 APS Science Research → aps_research_nodes.json + aps_research_levels.json"""
    nodes, levels = extract_aps_research(
        loader.load("APS_science"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    write_json(nodes,  table_name="aps_research_nodes",  game_version=ver, extraction_run_id=run_id)
    write_json(levels, table_name="aps_research_levels", game_version=ver, extraction_run_id=run_id)
    total = len(nodes) + len(levels)
    return "aps_research_nodes.json + aps_research_levels.json", total, "VERIFIED"


def _run_m015(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-015 Alliance Tech → alliance_tech_nodes.json + alliance_tech_levels.json"""
    nodes, levels = extract_alliance_tech(
        loader.load("lw_alliance_science_detail"),
        loader.load("lw_alliance_science_tab"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    write_json(nodes,  table_name="alliance_tech_nodes",  game_version=ver, extraction_run_id=run_id)
    write_json(levels, table_name="alliance_tech_levels", game_version=ver, extraction_run_id=run_id)
    total = len(nodes) + len(levels)
    return "alliance_tech_nodes.json + alliance_tech_levels.json", total, "PARTIALLY_KNOWN"


def _run_m021(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-021 Decorations → decorations.json"""
    records = extract_decorations(
        loader.load("lw_decoration"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    path = write_json(records, table_name="decorations", game_version=ver, extraction_run_id=run_id)
    return str(path), len(records), "PARTIALLY_KNOWN"


def _run_m017(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-017 VIP → vip_levels.json"""
    records = extract_vip(
        loader.load("vip"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    path = write_json(records, table_name="vip_levels", game_version=ver, extraction_run_id=run_id)
    return str(path), len(records), "PARTIALLY_KNOWN"


def _run_m002(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-002 Troops → troops.json"""
    records = extract_troops(
        loader.load("lw_soldier"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    path = write_json(records, table_name="troops", game_version=ver, extraction_run_id=run_id)
    return str(path), len(records), "VERIFIED"


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def _run_m019(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-019 Hero Honor Level → hero_honor_levels.json"""
    records = extract_hero_honor_level(
        loader.load("lw_hero_honorLevel"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    path = write_json(records, table_name="hero_honor_levels", game_version=ver, extraction_run_id=run_id)
    return str(path), len(records), "VERIFIED"


def _run_m020(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-020 Decoration Building Levels → decoration_building_levels.json"""
    records = extract_decoration_building_levels(
        loader.load("lw_decorationbuilding_lv"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    path = write_json(records, table_name="decoration_building_levels", game_version=ver, extraction_run_id=run_id)
    return str(path), len(records), "VERIFIED"


def _run_m024(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-024 UAV Per-Level Stats → uav_levels.json"""
    records = extract_uav_levels(
        loader.load("lw_uav_level"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    path = write_json(records, table_name="uav_levels", game_version=ver, extraction_run_id=run_id)
    return str(path), len(records), "VERIFIED"


def _run_m_new_a(loader: XapkLoader, ver: str, run_id: str) -> tuple[str, int, str]:
    """M-NEW-A Season Military Rank → season_military_rank.json"""
    records = extract_season_military_rank(
        loader.load("lw_season_military_level"),
        loader.load("lw_status"),
        game_version=ver,
        extraction_run_id=run_id,
    )
    path = write_json(records, table_name="season_military_rank", game_version=ver, extraction_run_id=run_id)
    return str(path), len(records), "VERIFIED"


MECHANICS: list[tuple[str, str, Any]] = [
    ("M-003",   "Hero Base Stats",              _run_m003),
    ("M-004",   "Hero Level Growth",            _run_m004),
    ("M-005",   "Hero Stars/Awakening",         _run_m005),
    ("M-008",   "Hero Skills",                  _run_m008),
    ("M-010",   "Exclusive Weapons",            _run_m010),
    ("M-007",   "Gear Attributes/Slots",        _run_m007_m006),
    ("M-009",   "Research",                     _run_m009),
    ("M-018",   "Buildings",                    _run_m018),
    ("M-011",   "Drone Battle System",          _run_m011),
    ("M-015",   "Alliance Tech",                _run_m015),
    ("M-021",   "Decorations",                  _run_m021),
    ("M-017",   "VIP",                          _run_m017),
    ("M-002",   "Troops",                       _run_m002),
    ("M-022",   "Military Centers",             _run_m022),
    ("M-023",   "APS Science Research",         _run_m023),
    ("M-019",   "Hero Honor Level",             _run_m019),
    ("M-020",   "Decoration Building Levels",   _run_m020),
    ("M-024",   "UAV Per-Level Stats",          _run_m024),
    ("M-NEW-A", "Season Military Rank",         _run_m_new_a),
]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Build the Last War Knowledge Database from XAPK."
    )
    parser.add_argument("--xapk", required=True, metavar="PATH")
    parser.add_argument("--version", default="", metavar="VER")
    parser.add_argument("--run-id", default="", metavar="ID")
    parser.add_argument("--only", default="", metavar="M-NNN",
                        help="Run only this mechanic (e.g. --only M-003)")
    args = parser.parse_args(argv)

    run_id = args.run_id or str(uuid.uuid4())[:8]
    loader = XapkLoader(args.xapk)

    print(f"[knowledge] XAPK    : {args.xapk}")
    print(f"[knowledge] Version : {args.version or '(unknown)'}")
    print(f"[knowledge] Run ID  : {run_id}")
    print()

    results = []
    for mid, mname, runner in MECHANICS:
        if args.only and args.only.upper() != mid:
            continue
        print(f"── {mid}  {mname} ──────────────────────")
        try:
            path, count, status = runner(loader, args.version, run_id)
            print(f"   ✓  {count} records → {path}")
            print(f"   Knowledge status: {status}")
            results.append((mid, mname, "OK", count, status))
        except Exception as e:
            print(f"   ✗  FAILED: {e}")
            results.append((mid, mname, "FAIL", 0, "—"))
        print()

    # Summary
    print("═" * 60)
    print("SUMMARY")
    print("═" * 60)
    for mid, mname, outcome, count, status in results:
        mark = "✓" if outcome == "OK" else "✗"
        print(f"  {mark}  {mid}  {mname:30s}  {count:5d} records  {status}")

    failed = sum(1 for r in results if r[2] == "FAIL")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
