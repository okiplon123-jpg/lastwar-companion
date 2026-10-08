"""
extractors.py — Per-mechanic extraction and normalisation functions.

Each function:
  1. Accepts raw VM output dicts for the required tables
  2. Returns a list of canonical records ready for db.write_json()

Naming convention: extract_<mechanic_id_snake>(...) → list[dict]
"""

from __future__ import annotations
from typing import Any


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _schema(vm: dict) -> dict[str, int]:
    """Return {field_name: col_index} from a schema-first VM result."""
    return {k: v[1] for k, v in vm["index"].items()}


def _rows(vm: dict) -> dict:
    """Return the data row dict from a schema-first VM result."""
    return vm["data"]


def _val(row: dict, col: int) -> Any:
    """Read a value from a positional row; coerce integer-floats."""
    v = row.get(col)
    if isinstance(v, float) and v == int(v):
        return int(v)
    return v


def _row_as_dict(row: dict, schema: dict[str, int]) -> dict:
    """Convert a positional row to a named dict using the schema."""
    return {field: _val(row, col) for field, col in schema.items()}


# ─────────────────────────────────────────────────────────────────────────────
# M-003  Hero Base Stats
# ─────────────────────────────────────────────────────────────────────────────

# Maps lw_hero.quality integer → rarity label
# Derived from: quality=5 has the most player-facing heroes (54 displayed),
# quality=4 next (12 displayed), quality=3 (13 displayed).
# Colors in aps_heroes_quality: type=1→green(R), type=2→blue(SR/SSR/UR).
# We label cautiously; the exact R/SR/SSR/UR names need Assembly confirmation.
_QUALITY_LABEL = {
    1: "R",
    2: "SR",
    3: "SSR",
    4: "UR",
    5: "UR+",   # Highest tier — displayed heroes with template_id=2 or 1
}

# lw_hero.army_type: 1=Infantry, 2=Cavalry(Shooter), 3=?
# lw_hero.army_job: role classification
_ARMY_TYPE_LABEL = {1: "infantry", 2: "shooter", 3: "support"}
_ARMY_JOB_LABEL  = {1: "front", 2: "back", 3: "support"}


def extract_hero_base(
    lw_hero_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> list[dict]:
    """
    M-003: Extract hero base stats from lw_hero.

    base_hp, base_patk, base_pdef are the hero's stats at level 1.
    This is confirmed by lw_template_property growth multiplier = 1.0 at lv1,
    meaning base_stat IS the lv1 stat.

    Only heroes with display_in_hero_list='1' are included (player-facing).
    """
    sch = _schema(lw_hero_vm)
    records: list[dict] = []

    for row_key, row in sorted(_rows(lw_hero_vm).items()):
        displayed = _val(row, sch["display_in_hero_list"])
        if displayed != "1":
            continue

        quality = _val(row, sch["quality"])
        army_type = _val(row, sch["army_type"])
        army_job  = _val(row, sch["army_job"])

        rec = {
            "id":             _val(row, sch["id"]),
            "quality":        quality,
            "rarity":         _QUALITY_LABEL.get(quality, f"q{quality}"),
            "template_id":    _val(row, sch["template_id"]),
            "army_type":      army_type,
            "army_type_name": _ARMY_TYPE_LABEL.get(army_type, f"type{army_type}"),
            "army_job":       army_job,
            "army_job_name":  _ARMY_JOB_LABEL.get(army_job, f"job{army_job}"),
            "base_hp":        _val(row, sch["base_hp"]),
            "base_atk":       _val(row, sch["base_patk"]),
            "base_def":       _val(row, sch["base_pdef"]),
            "base_crit":      _val(row, sch["base_crit"]),
            "base_acc":       _val(row, sch["base_acc"]),
            "base_load":      _val(row, sch["base_load"]),
            "max_rank":       _val(row, sch["max_rank"]),
            # Skills / weapon are foreign-key references handled by M-008/M-010
            "skills":         _val(row, sch["skills"]),
            "weapon":         _val(row, sch["weapon"]),
            # Provenance
            "_source_table":       "lw_hero",
            "_game_version":       game_version,
            "_extraction_run_id":  extraction_run_id,
            "_notes": (
                "base_hp/base_atk/base_def = lv1 stats (lv1 mult=1.0 confirmed). "
                "rarity label needs Assembly confirmation. "
                "Stars/rank modifiers not included (see lw_hero_rank)."
            ),
        }
        records.append(rec)

    records.sort(key=lambda r: r["id"])
    return records  # M-003 end


# ─────────────────────────────────────────────────────────────────────────────
# M-004  Hero Level Growth
# ─────────────────────────────────────────────────────────────────────────────

def extract_hero_level_growth(
    lw_template_property_vm: dict,
    heroes_levelup_vm: dict,
    lw_hero_level_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> list[dict]:
    """
    M-004: Combine three tables into a single per-level growth record.

    For each level 1..175:
      - stat_multiplier_t1/t2: multiply hero.base_stat to get stat at this level
        (lw_template_property, types 1 and 2; type 3 is all-zero placeholder)
      - troop_atk_t1..t4, troop_def_t1..t4: flat bonuses from heroes_levelup
        (only covers levels 1..100; above 100 set to null)
      - army_num: total troops the hero can command (heroes_levelup)
      - army_num_t1..t4: per-tier troop slots
      - xp_to_next: XP needed to level up (lw_hero_level.next_exp)
      - breakthrough: gem cost and require item at level cap (heroes_levelup.spend / break_require)
    """
    # ── lw_template_property: build mult[type][level] ─────────────────────────
    tp_sch = _schema(lw_template_property_vm)
    col_tp_type = tp_sch["type"]
    col_tp_level = tp_sch["level"]
    col_tp_hp    = tp_sch["base_hp"]

    by_type: dict[int, dict[int, float]] = {}
    for row in _rows(lw_template_property_vm).values():
        t = _val(row, col_tp_type)
        lv = _val(row, col_tp_level)
        hp = row.get(col_tp_hp)
        if hp is None:
            continue
        hp = float(hp)
        by_type.setdefault(t, {})[lv] = hp

    # Compute multipliers relative to lv1
    def _mult(tp: int) -> dict[int, float]:
        if tp not in by_type:
            return {}
        base = by_type[tp].get(1, 1.0)
        if base == 0:
            return {lv: 0.0 for lv in by_type[tp]}
        return {lv: round(hp / base, 6) for lv, hp in by_type[tp].items()}

    mult_t1 = _mult(1)
    mult_t2 = _mult(2)
    max_tmpl_level = max(max(mult_t1.keys(), default=0), max(mult_t2.keys(), default=0))

    # ── heroes_levelup: troop bonuses per level ────────────────────────────────
    hl_sch  = _schema(heroes_levelup_vm)
    hl_by_lv: dict[int, dict] = {}
    for row in _rows(heroes_levelup_vm).values():
        lv = _val(row, hl_sch["id"])
        hl_by_lv[lv] = row

    # ── lw_hero_level: xp per level ───────────────────────────────────────────
    hll_sch = _schema(lw_hero_level_vm)
    col_lv  = hll_sch["level"]
    col_nxp = hll_sch["next_exp"]
    xp_by_lv: dict[int, Any] = {}
    for row in _rows(lw_hero_level_vm).values():
        lv = _val(row, col_lv)
        xp_by_lv[lv] = _val(row, col_nxp)

    # ── Build unified records ──────────────────────────────────────────────────
    records: list[dict] = []
    for lv in range(1, max_tmpl_level + 1):
        hl = hl_by_lv.get(lv)

        def hl_val(field: str):
            if hl is None:
                return None
            col = hl_sch.get(field)
            return _val(hl, col) if col is not None else None

        rec = {
            "level": lv,
            # Stat multipliers (apply to hero.base_hp/base_atk/base_def)
            "stat_mult_t1": mult_t1.get(lv),
            "stat_mult_t2": mult_t2.get(lv),
            # Troop capacity (heroes_levelup, lv 1-100 only)
            "army_num":    hl_val("army_num"),
            "army_num_t1": hl_val("army_num1"),
            "army_num_t2": hl_val("army_num2"),
            "army_num_t3": hl_val("army_num3"),
            "army_num_t4": hl_val("army_num4"),
            # Flat troop ATK/DEF bonuses per tier (from heroes_levelup)
            "troop_atk_t1": hl_val("lv_attr_atk1"),
            "troop_atk_t2": hl_val("lv_attr_atk2"),
            "troop_atk_t3": hl_val("lv_attr_atk3"),
            "troop_atk_t4": hl_val("lv_attr_atk4"),
            "troop_def_t1": hl_val("lv_attr_def1"),
            "troop_def_t2": hl_val("lv_attr_def2"),
            "troop_def_t3": hl_val("lv_attr_def3"),
            "troop_def_t4": hl_val("lv_attr_def4"),
            # Breakthrough (only at certain gate levels)
            "breakthrough_cost":    hl_val("spend")    or None,
            "breakthrough_require": hl_val("break_require") or None,
            # XP cost to advance from this level to next
            "xp_to_next": xp_by_lv.get(lv),
            # Provenance
            "_sources": ["lw_template_property", "heroes_levelup", "lw_hero_level"],
            "_game_version": game_version,
            "_extraction_run_id": extraction_run_id,
        }
        records.append(rec)

    return records  # M-004 end


# ─────────────────────────────────────────────────────────────────────────────
# M-005  Hero Stars / Awakening
# ─────────────────────────────────────────────────────────────────────────────

def extract_hero_stars(
    lw_hero_rank_reset_vm: dict,
    lw_hero_awaken_vm: dict,
    lw_hero_awaken_rank_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> tuple[list[dict], list[dict]]:
    """
    M-005: Returns (star_ranks, awaken_ranks) as two lists.

    star_ranks: 22 records — each rank stage of the hero star system.
      attr_ratio = cumulative multiplier applied to all hero base stats.
      Formula: hero_stat_at_rank = base_stat × attr_ratio
      7 visible stars × 3 sub-ranks + 1 base rank = 22 total.

    awaken_ranks: 78 records (25 per awakened hero × 3 heroes = 75 + some shared).
      fix_power = FIXED power contribution per rank (not computed from stats).
      This feeds directly into M-001 Power Formula.

    NOTE: attr_add values reference stat IDs 50006/50007/50009 — unresolved enum.
    NOTE: max visible stars = 7 (not 5 as previously assumed).
    """
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}

    # ── Star ranks ─────────────────────────────────────────────────────────────
    sch = _schema(lw_hero_rank_reset_vm)
    star_records: list[dict] = []
    for k in sorted(_rows(lw_hero_rank_reset_vm).keys()):
        row = _rows(lw_hero_rank_reset_vm)[k]
        rank_id   = _val(row, sch["id"])
        star_show = _val(row, sch["star_show"])
        ratio     = _val(row, sch["attr_ratio"])
        shard     = _val(row, sch["shard_need"])
        attr_add  = _val(row, sch["attr_add"])

        if star_show:
            parts = str(star_show).split(";")
            sub_star = int(parts[0])
            sub_of   = int(parts[1]) if len(parts) > 1 else 1
        else:
            sub_star, sub_of = 0, 1

        visible_stars = 0 if rank_id == 1 else (rank_id - 2) // 3 + 1

        rec = {
            "rank":          rank_id,
            "visible_stars": visible_stars,
            "sub_star":      sub_star,
            "sub_of":        sub_of,
            "attr_ratio":    float(ratio),
            "shard_cost":    int(shard) if shard is not None else 0,
            "attr_add_raw":  attr_add,
            "_source_table": "lw_hero_rank_reset",
            **prov,
            "_notes": (
                "attr_ratio = cumulative multiplier for ALL hero stats at this rank. "
                "attr_add_raw stat IDs (50006/50007/50009) need Assembly resolution. "
                "max_stars=7 (corrects prior assumption of 5)."
            ),
        }
        star_records.append(rec)

    # ── Awakened hero ranks ────────────────────────────────────────────────────
    aw_sch = _schema(lw_hero_awaken_vm)
    ar_sch = _schema(lw_hero_awaken_rank_vm)
    awaken_records: list[dict] = []
    for k in sorted(_rows(lw_hero_awaken_rank_vm).keys()):
        row = _rows(lw_hero_awaken_rank_vm)[k]
        rec = {
            "id":            _val(row, ar_sch["id"]),
            "hero_id":       _val(row, ar_sch["hero_id"]),
            "level":         _val(row, ar_sch["level"]),
            "attr_add":      _val(row, ar_sch["attr_add"]),
            "rank_cost":     _val(row, ar_sch["rank_cost"]),
            "fix_power":     _val(row, ar_sch["fix_power"]),
            "_source_table": "lw_hero_awaken_rank",
            **prov,
            "_notes": (
                "fix_power is a FIXED power contribution (not derived from stats). "
                "Scales in 5-level brackets: 250K→500K→750K→1M→1.25M→1.55M. "
                "attr_add is an unresolved index."
            ),
        }
        awaken_records.append(rec)

    return star_records, awaken_records


# ─────────────────────────────────────────────────────────────────────────────
# M-008  Hero Skills
# ─────────────────────────────────────────────────────────────────────────────

def extract_hero_skills(
    lw_hero_skill_vm: dict,
    lw_hero_skill_b_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> list[dict]:
    """
    M-008: Extract all skill entries with their per-level power contribution.

    Each record represents one skill at one level (group × star).
    power = squad power contribution of this skill at this level.
    CONFIRMED: skills DO affect squad power (power field varies widely: 1–2490).

    property_out_of_battle: vExt-resolved string 'stat_id;value;?|…' containing
    permanent hero % bonuses (75050=HP%, 75150=ATK%, 75250=DEF%). Parsed into
    hp_pct_bonus, atk_pct_bonus, def_pct_bonus fields (fractional, e.g. 0.1 = 10%).

    NOTE: hero→skill group mapping unresolved for player heroes (groups 36, 45, 63…
    not found in either skill table — possibly compiled differently).
    """
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}
    records: list[dict] = []

    HP_PCT_ID, ATK_PCT_ID, DEF_PCT_ID = 75050, 75150, 75250

    for table_name, vm in [("lw_hero_skill", lw_hero_skill_vm),
                            ("lw_hero_skill_B", lw_hero_skill_b_vm)]:
        sch = _schema(vm)
        vext = vm.get("vExt", {})
        has_poob = "property_out_of_battle" in sch

        for k in sorted(_rows(vm).keys()):
            row = _rows(vm)[k]
            rec: dict[str, Any] = {
                "id":        _val(row, sch["id"]),
                "group":     _val(row, sch["group"]),
                "star":      _val(row, sch["star"]),
                "max_level": _val(row, sch["maxLevel"]),
                "power":     _val(row, sch["power"]),
                "need_rank": _val(row, sch.get("need_rank", 0)) if sch.get("need_rank") else None,
                "hp_pct_bonus":  None,
                "atk_pct_bonus": None,
                "def_pct_bonus": None,
                "_source_table": table_name,
                **prov,
            }
            if "property" in sch:
                rec["property"] = _val(row, sch["property"])

            if has_poob:
                raw = _val(row, sch["property_out_of_battle"])
                # raw is a vExt index when non-null; resolve then parse
                if isinstance(raw, int) and raw in vext:
                    raw = vext[raw]
                if isinstance(raw, str) and raw:
                    stats = _parse_stat_string(raw)
                    rec["hp_pct_bonus"]  = stats.get(HP_PCT_ID)
                    rec["atk_pct_bonus"] = stats.get(ATK_PCT_ID)
                    rec["def_pct_bonus"] = stats.get(DEF_PCT_ID)

            records.append(rec)

    return records


# ─────────────────────────────────────────────────────────────────────────────
# M-010  Exclusive Weapons
# ─────────────────────────────────────────────────────────────────────────────

def extract_exclusive_weapons(
    lw_hero_unique_weapon_vm: dict,
    lw_hero_unique_weapon_effect_vm: dict,
    lw_hero_unique_weapon_unit_vm: dict | None = None,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> tuple[list[dict], list[dict], list[dict]]:
    """
    M-010: Returns (weapon_levels, weapon_effects, weapon_units).

    weapon_levels: per-hero per-level records. power=250000 per level (fixed).
    weapon_effects: per-effect-group per-level. power field = effect power.
    weapon_units: per-hero per-unit-type records from lw_hero_unique_weapon_unit.
      Each unit has an overall_stat_id and personal_stat_id (EW HP/ATK/DEF
      stat IDs: 51002/51003/51052/51053/51102/51103). Values are milestone-keyed:
      overall_milestones / personal_milestones = {tier_idx: (milestone_level, value)}.

    Total EW power = sum of weapon_levels[lv].power + all active weapon_effects[lv].power.
    EW unit stats are additive on top (different stat IDs from base EW stats).
    """
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}

    sch = _schema(lw_hero_unique_weapon_vm)
    wep_records = []
    for k in sorted(_rows(lw_hero_unique_weapon_vm).keys()):
        row = _rows(lw_hero_unique_weapon_vm)[k]
        rec = {
            "id":          _val(row, sch["id"]),
            "hero_id":     _val(row, sch["hero"]),
            "level":       _val(row, sch["lv"]),
            "power":       _val(row, sch["power"]),
            "skill_level": _val(row, sch["skill_level"]),
            "_source_table": "lw_hero_unique_weapon",
            **prov,
            "_notes": "power=250000 per EW level (fixed per level, same across heroes).",
        }
        wep_records.append(rec)

    eff_sch = _schema(lw_hero_unique_weapon_effect_vm)
    eff_records = []
    for k in sorted(_rows(lw_hero_unique_weapon_effect_vm).keys()):
        row = _rows(lw_hero_unique_weapon_effect_vm)[k]
        rec = {
            "id":        _val(row, eff_sch["id"]),
            "group":     _val(row, eff_sch["group"]),
            "level":     _val(row, eff_sch["level"]),
            "level_max": _val(row, eff_sch["level_max"]),
            "power":     _val(row, eff_sch["power"]),
            "_source_table": "lw_hero_unique_weapon_effect",
            **prov,
        }
        eff_records.append(rec)

    unit_records: list[dict] = []
    if lw_hero_unique_weapon_unit_vm:
        unit_sch  = _schema(lw_hero_unique_weapon_unit_vm)
        unit_vext = lw_hero_unique_weapon_unit_vm.get("vExt", {})
        for k in sorted(_rows(lw_hero_unique_weapon_unit_vm).keys()):
            row = _rows(lw_hero_unique_weapon_unit_vm)[k]
            ov_idx = _val(row, unit_sch["overall_value"])
            pv_idx = _val(row, unit_sch["personal_value"])
            rec = {
                "id":                  _val(row, unit_sch["id"]),
                "hero_id":             _val(row, unit_sch["hero"]),
                "unit_type":           _val(row, unit_sch["type"]),
                "max_lv":              _val(row, unit_sch["max_lv"]),
                "overall_stat_id":     _val(row, unit_sch["overall_attr"]),
                "personal_stat_id":    _val(row, unit_sch["personal_attr"]),
                "overall_milestones":  _parse_ewu_milestones(unit_vext.get(ov_idx, {})),
                "personal_milestones": _parse_ewu_milestones(unit_vext.get(pv_idx, {})),
                "_source_table": "lw_hero_unique_weapon_unit",
                **prov,
            }
            unit_records.append(rec)

    return wep_records, eff_records, unit_records


# ─────────────────────────────────────────────────────────────────────────────
# M-007  Gear Attributes  /  M-006  Gear Slots
# ─────────────────────────────────────────────────────────────────────────────

def extract_gear(
    lw_equip_vm: dict,
    lw_equip_promote_vm: dict,
    lw_equip_upgrade_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> tuple[list[dict], list[dict], list[dict]]:
    """
    M-007 + M-006: Returns (gear_items, gear_promote, gear_upgrade).

    gear_items: 84 gear pieces. power = direct squad power contribution.
      Slots: 1=Weapon, 2=Armor, 3=Boots (inferred from slot field).
      quality: 2=SR, 3=SSR, 4=UR (needs Assembly confirmation).
    gear_promote: 26 promotion levels (upgrade costs).
    gear_upgrade: 64 rows defining highest level per slot/quality/army_type.

    NOTE: basic_attributes / addition_attributes are reference IDs to
    lw_equip_attribute.effects (stat IDs unresolved).
    """
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}

    sch = _schema(lw_equip_vm)
    gear_records = []
    for k in sorted(_rows(lw_equip_vm).keys()):
        row = _rows(lw_equip_vm)[k]
        rec = {
            "id":             _val(row, sch["id"]),
            "slot":           _val(row, sch["slot"]),
            "quality":        _val(row, sch["quality"]),
            "army_type":      _val(row, sch["army_type"]),
            "unlock_level":   _val(row, sch["unlock_level"]),
            "power":          _val(row, sch["power"]),
            "basic_attr_ref": _val(row, sch["basic_attributes"]),
            "add_attr_ref":   _val(row, sch["addition_attributes"]),
            "_source_table":  "lw_equip",
            **prov,
            "_notes": "basic_attr_ref/add_attr_ref → lw_equip_attribute.effects (stat IDs unresolved).",
        }
        gear_records.append(rec)

    prom_sch = _schema(lw_equip_promote_vm)
    prom_records = []
    for k in sorted(_rows(lw_equip_promote_vm).keys()):
        row = _rows(lw_equip_promote_vm)[k]
        rec = {
            "id":            _val(row, prom_sch["id"]),
            "level":         _val(row, prom_sch["level"]),
            "cost_resource": _val(row, prom_sch["cost_resource"]),
            "cost_items":    _val(row, prom_sch["cost_resItem"]),
            "_source_table": "lw_equip_promote",
            **prov,
        }
        prom_records.append(rec)

    upg_sch = _schema(lw_equip_upgrade_vm)
    upg_records = []
    for k in sorted(_rows(lw_equip_upgrade_vm).keys()):
        row = _rows(lw_equip_upgrade_vm)[k]
        rec = {
            "id":            _val(row, upg_sch["id"]),
            "slot":          _val(row, upg_sch["slot"]),
            "quality":       _val(row, upg_sch["quality"]),
            "army_type":     _val(row, upg_sch["army_type"]),
            "highest_level": _val(row, upg_sch["highest_level"]),
            "_source_table": "lw_equip_upgrade",
            **prov,
        }
        upg_records.append(rec)

    return gear_records, prom_records, upg_records


# ─────────────────────────────────────────────────────────────────────────────
# M-009  Research (Camp Science)
# ─────────────────────────────────────────────────────────────────────────────

def extract_research(
    lw_camp_science_detail_vm: dict,
    lw_camp_science_tab_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> tuple[list[dict], list[dict]]:
    """
    M-009: Returns (research_nodes, research_levels).

    research_nodes: top-level research definitions from lw_camp_science_tab.
    research_levels: per-node per-level records from lw_camp_science_detail.
      para2 = effect value at that level (e.g. '0.03' = 3% bonus).
      para1 = stat type ID (unresolved).
      buff_type = buff category.

    NOTE: Research does not have a direct 'power' field —
    its effect on squad power is indirect (via buffs).
    """
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}

    tab_sch = _schema(lw_camp_science_tab_vm)
    node_records = []
    for k in sorted(_rows(lw_camp_science_tab_vm).keys()):
        row = _rows(lw_camp_science_tab_vm)[k]
        rec = {
            "id":       _val(row, tab_sch["id"]),
            "max_lv":   _val(row, tab_sch["max_lv"]),
            "_source_table": "lw_camp_science_tab",
            **prov,
        }
        node_records.append(rec)

    det_sch = _schema(lw_camp_science_detail_vm)
    level_records = []
    for k in sorted(_rows(lw_camp_science_detail_vm).keys()):
        row = _rows(lw_camp_science_detail_vm)[k]
        rec = {
            "id":          _val(row, det_sch["id"]),
            "science_id":  _val(row, det_sch["science_id"]),
            "science_lv":  _val(row, det_sch["science_lv"]),
            "max_lv":      _val(row, det_sch["max_lv"]),
            "stat_id":     _val(row, det_sch["para1"]),     # unresolved stat enum
            "stat_value":  _val(row, det_sch["para2"]),     # effect magnitude
            "buff_type":   _val(row, det_sch.get("buff_type", 0)),
            "_source_table": "lw_camp_science_detail",
            **prov,
        }
        level_records.append(rec)

    return node_records, level_records


# ─────────────────────────────────────────────────────────────────────────────
# M-015  Alliance Tech
# ─────────────────────────────────────────────────────────────────────────────

def extract_alliance_tech(
    lw_alliance_science_detail_vm: dict,
    lw_alliance_science_tab_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> tuple[list[dict], list[dict]]:
    """M-015: Alliance tech tree (same structure as camp research)."""
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}

    tab_sch = _schema(lw_alliance_science_tab_vm)
    node_records = []
    for k in sorted(_rows(lw_alliance_science_tab_vm).keys()):
        row = _rows(lw_alliance_science_tab_vm)[k]
        rec = {
            "id":     _val(row, tab_sch["id"]),
            "max_lv": _val(row, tab_sch["max_lv"]),
            "_source_table": "lw_alliance_science_tab",
            **prov,
        }
        node_records.append(rec)

    det_sch = _schema(lw_alliance_science_detail_vm)
    level_records = []
    for k in sorted(_rows(lw_alliance_science_detail_vm).keys()):
        row = _rows(lw_alliance_science_detail_vm)[k]
        rec = {
            "id":         _val(row, det_sch["id"]),
            "science_id": _val(row, det_sch["science_id"]),
            "science_lv": _val(row, det_sch["science_lv"]),
            "max_lv":     _val(row, det_sch["max_lv"]),
            "stat_id":    _val(row, det_sch["para1"]),
            "stat_value": _val(row, det_sch["para2"]),
            "_source_table": "lw_alliance_science_detail",
            **prov,
        }
        level_records.append(rec)

    return node_records, level_records


# ─────────────────────────────────────────────────────────────────────────────
# M-018  Buildings
# ─────────────────────────────────────────────────────────────────────────────

def extract_buildings(
    building_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> list[dict]:
    """
    M-018: Extract building definitions with their power and level info.

    NOTE: Most buildings have power=0. Building levels unlock features
    (e.g. HQ level = hero level cap × 5) but don't directly give squad power.
    The Engine uses building data primarily to resolve unlock conditions.
    """
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}
    sch = _schema(building_vm)
    records = []
    for k in sorted(_rows(building_vm).keys()):
        row = _rows(building_vm)[k]
        rec = {
            "id":          _val(row, sch["id"]),
            "max_level":   _val(row, sch["max_level"]),
            "build_type":  _val(row, sch["build_type"]),
            "tab_type":    _val(row, sch["tab_type"]),
            "power":       _val(row, sch["power"]),
            "time":        _val(row, sch["time"]),
            "_source_table": "building",
            **prov,
        }
        records.append(rec)
    return records


# ─────────────────────────────────────────────────────────────────────────────
# M-011  Drone / UAV
# ─────────────────────────────────────────────────────────────────────────────

def extract_drone(
    lw_drone_battlesystem_level_vm: dict,
    lw_drone_skillchip_attribute_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> tuple[list[dict], list[dict]]:
    """
    M-011: Returns (drone_levels, chip_attributes).

    drone_levels: per-level records from lw_drone_battlesystem_level.
      level_attribute is a vExt index → {stat_id: value} dict (CUMULATIVE at each level).
      Stat IDs: 50081=drone HP, 50082=drone ATK, 50083=drone DEF.
      Power formula: hp×0.5 + atk×12.5 + def×35.0.

    chip_attributes: 1200 rows — drone chip effects with power and stat IDs.
    """
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}
    vext = lw_drone_battlesystem_level_vm.get("vExt", {})

    HP_COEFF, ATK_COEFF, DEF_COEFF = 0.5, 12.5, 35.0
    HP_ID, ATK_ID, DEF_ID = 50081, 50082, 50083

    drone_sch = _schema(lw_drone_battlesystem_level_vm)
    drone_records = []
    for k in sorted(_rows(lw_drone_battlesystem_level_vm).keys()):
        row = _rows(lw_drone_battlesystem_level_vm)[k]
        attr_idx = _val(row, drone_sch["level_attribute"])
        stats = vext.get(attr_idx, {}) if isinstance(attr_idx, (int, float)) else {}

        hp  = stats.get(HP_ID, 0.0)
        atk = stats.get(ATK_ID, 0.0)
        df  = stats.get(DEF_ID, 0.0)
        power_computed = round(hp * HP_COEFF + atk * ATK_COEFF + df * DEF_COEFF, 2)

        rec = {
            "id":              _val(row, drone_sch["id"]),
            "level":           _val(row, drone_sch["level"]),
            "system_tier":     _val(row, drone_sch["system_tier"]),
            "exp_cost":        _val(row, drone_sch["exp_cost"]),
            "hp":              hp,
            "atk":             atk,
            "def":             df,
            "power_computed":  power_computed,
            "_source_table":   "lw_drone_battlesystem_level",
            **prov,
            "_notes": (
                "hp/atk/def are CUMULATIVE totals at this level (resolved from vExt). "
                "power_computed = hp×0.5 + atk×12.5 + def×35.0."
            ),
        }
        drone_records.append(rec)

    chip_sch = _schema(lw_drone_skillchip_attribute_vm)
    chip_records = []
    for k in sorted(_rows(lw_drone_skillchip_attribute_vm).keys()):
        row = _rows(lw_drone_skillchip_attribute_vm)[k]
        rec = {
            "id":      _val(row, chip_sch["id"]),
            "effects": _val(row, chip_sch["effects"]),  # 'stat_id;value|…'
            "power":   _val(row, chip_sch["power"]),
            "_source_table": "lw_drone_skillchip_attribute",
            **prov,
            "_notes": "effects format: 'stat_id;value|…'.",
        }
        chip_records.append(rec)

    return drone_records, chip_records


# ─────────────────────────────────────────────────────────────────────────────
# M-021  Decorations
# ─────────────────────────────────────────────────────────────────────────────

def extract_decorations(
    lw_decoration_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> list[dict]:
    """
    M-021: Extract decoration definitions with their stat effects.

    effect_wear: stat bonus while wearing (e.g. '75150;0.05' = hero ATK% +5%).
    effect_gain: permanent stat gain after earning.
    hp_pct_bonus / atk_pct_bonus / def_pct_bonus: parsed from effect_gain
      (stat IDs 75050/75150/75250 respectively). effect_wear is the bonus while
      the item is equipped; effect_gain is the permanent bonus for owning it.
      Both raw strings are preserved alongside the parsed fields.
    quality: rarity tier (3=SSR, 5=UR inferred).
    """
    HP_PCT_ID, ATK_PCT_ID, DEF_PCT_ID = 75050, 75150, 75250
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}
    sch = _schema(lw_decoration_vm)
    records = []
    for k in sorted(_rows(lw_decoration_vm).keys()):
        row = _rows(lw_decoration_vm)[k]
        if _val(row, sch["isShow"]) != "1":
            continue
        effect_gain = _val(row, sch["effect_gain"])
        effect_wear = _val(row, sch["effect_wear"])
        gain_stats  = _parse_stat_string(effect_gain or "")
        rec = {
            "id":            _val(row, sch["id"]),
            "type":          _val(row, sch["type"]),
            "quality":       _val(row, sch["quality"]),
            "effect_wear":   effect_wear,
            "effect_gain":   effect_gain,
            "para_gain":     _val(row, sch["para_gain"]),
            "hp_pct_bonus":  gain_stats.get(HP_PCT_ID),
            "atk_pct_bonus": gain_stats.get(ATK_PCT_ID),
            "def_pct_bonus": gain_stats.get(DEF_PCT_ID),
            "_source_table": "lw_decoration",
            **prov,
        }
        records.append(rec)
    return records


# ─────────────────────────────────────────────────────────────────────────────
# M-017  VIP
# ─────────────────────────────────────────────────────────────────────────────

def _parse_ewu_milestones(vext_entry: dict) -> dict[int, tuple[int, float]]:
    """Parse an EW weapon-unit vExt milestone dict.

    Input:  {tier_idx: 'milestone_level,stat_value', …}
    Output: {tier_idx: (milestone_level, stat_value), …}
    """
    result: dict[int, tuple[int, float]] = {}
    for tier_idx, raw in vext_entry.items():
        if not isinstance(raw, str):
            continue
        parts = raw.split(",")
        if len(parts) == 2:
            try:
                result[int(tier_idx)] = (int(parts[0]), float(parts[1]))
            except (ValueError, TypeError):
                pass
    return result


def _parse_stat_string(s: str) -> dict[int, float]:
    """Parse 'stat_id;value|stat_id;value|…' into {stat_id: value}."""
    result: dict[int, float] = {}
    if not s:
        return result
    for part in str(s).split("|"):
        bits = part.split(";")
        if len(bits) >= 2:
            try:
                sid = int(bits[0])
                val = float(bits[1])
                result[sid] = val
            except (ValueError, TypeError):
                pass
    return result


def extract_vip(
    vip_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> list[dict]:
    """
    M-017: VIP levels (18 tiers, 1-based: VIP1 through VIP18).

    'effect' integer = vExt index within the vip table.
    The resolved vExt value is a pipe-separated buff string: 'stat_id;value|…'.
    Hero stat % bonuses (75050/75150/75250) appear from VIP10 onward.
    """
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}
    sch = _schema(vip_vm)
    vext = vip_vm.get("vExt", {})

    _HERO_STAT_IDS = {75050, 75150, 75250}

    records = []
    for k in sorted(_rows(vip_vm).keys()):
        row = _rows(vip_vm)[k]
        vip_id = _val(row, sch["id"])
        effect_idx = _val(row, sch["effect"])

        resolved = vext.get(effect_idx, "") if isinstance(effect_idx, (int, float)) else ""
        all_stats = _parse_stat_string(resolved)
        hero_stats = {sid: all_stats.get(sid, 0.0) for sid in _HERO_STAT_IDS}

        rec = {
            "id":                _val(row, sch["id"]),
            "point":             _val(row, sch["point"]),
            "hero_hp_pct":       hero_stats[75050],   # army-type hero HP % bonus
            "hero_atk_pct":      hero_stats[75150],   # army-type hero ATK % bonus
            "hero_def_pct":      hero_stats[75250],   # army-type hero DEF % bonus
            "effect_raw":        resolved,             # full buff string for audit
            "_source_table": "vip",
            **prov,
            "_notes": (
                "hero_*_pct: additive % applied to army-type hero stats (stat IDs 75050/75150/75250). "
                "VIP1-9: 0.000; VIP10-11: 0.025; VIP12-13: 0.050; VIP14-15: 0.075; "
                "VIP16: 0.100; VIP17: 0.110; VIP18: 0.125."
            ),
        }
        records.append(rec)
    return records


# ─────────────────────────────────────────────────────────────────────────────
# M-022  Military Centers (Hero stat flat grants)
# ─────────────────────────────────────────────────────────────────────────────

_MILITARY_CENTER_IDS = {
    10116: 1,   # army_type=1 (Tank): HP=50039, ATK=50041, DEF=50043
    10117: 2,   # army_type=2 (Infantry): HP=50046, ATK=50048, DEF=50050
    10118: 3,   # army_type=3 (Aircraft): HP=50052, ATK=50054, DEF=50056
}


def extract_military_centers(
    building_b_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> list[dict]:
    """
    M-022: Military Center hero stat grants from building_B.

    Row key in building_B = building_id * 1000 + level.
    Level 0 row contains bd_effect_result (declares stat IDs).
    Levels 1..35 contain building_effect_last (cumulative stat totals at that level).

    All three centers have identical HP/ATK/DEF values per level but different
    army-type-specific stat IDs. Assignments (assumed sequential):
      10116 → army_type=1 (Tank)
      10117 → army_type=2 (Infantry)
      10118 → army_type=3 (Aircraft)
    """
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}
    vext = building_b_vm.get("vExt", {})
    sch = {k: v[1] for k, v in building_b_vm["index"].items()}
    data = building_b_vm["data"]

    bel_col = sch["building_effect_last"]
    ber_col = sch["bd_effect_result"]

    def resolve(val):
        if isinstance(val, int):
            return vext.get(val, val)
        return val

    records = []
    for building_id, army_type in sorted(_MILITARY_CENTER_IDS.items()):
        # Level 0 row: read stat IDs from bd_effect_result
        row0 = data.get(building_id * 1000)
        bd_effect_result = resolve(row0.get(ber_col)) if row0 else ""

        for level in range(1, 36):
            key = building_id * 1000 + level
            row = data.get(key)
            if row is None:
                continue
            bel = resolve(row.get(bel_col))
            stats = _parse_stat_string(bel) if isinstance(bel, str) else {}

            rec = {
                "building_id":    building_id,
                "army_type":      army_type,
                "level":          level,
                "stats":          stats,
                "bd_effect_result": bd_effect_result,
                "_source_table":  "building_B",
                **prov,
                "_notes": (
                    "stats = cumulative hero flat stat grants at this level "
                    "(parse from building_effect_last). "
                    "army_type assignment is sequential assumption: verify in-game."
                ),
            }
            records.append(rec)

    return records


# ─────────────────────────────────────────────────────────────────────────────
# M-023  APS Science Research
# ─────────────────────────────────────────────────────────────────────────────

def extract_aps_research(
    aps_science_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> tuple[list[dict], list[dict]]:
    """
    M-023: APS Science Research tree. Returns (nodes, levels).

    power field = CUMULATIVE total at this level (direct lookup, not sum).
    effect = 'stat_id;value' (single stat per level).
    Row key = science_id + level.
    """
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}
    sch = _schema(aps_science_vm)

    nodes: dict[int, dict] = {}
    level_records: list[dict] = []

    for k in sorted(_rows(aps_science_vm).keys()):
        row = _rows(aps_science_vm)[k]
        science_id = _val(row, sch["science_id"])
        level = _val(row, sch["level"])
        max_level = _val(row, sch["max_level"])
        power = _val(row, sch["power"])
        effect = _val(row, sch["effect"])

        if science_id not in nodes:
            nodes[science_id] = {
                "science_id":    science_id,
                "max_level":     max_level,
                "tab":           _val(row, sch["tab"]),
                "_source_table": "APS_science",
                **prov,
            }

        stats = _parse_stat_string(effect) if effect else {}
        level_records.append({
            "id":          _val(row, sch["id"]),
            "science_id":  science_id,
            "level":       level,
            "max_level":   max_level,
            "power":       power,    # CUMULATIVE at this level
            "effect":      effect,
            "stat_id":     next(iter(stats), None),
            "stat_value":  next(iter(stats.values()), None),
            "_source_table": "APS_science",
            **prov,
            "_notes": "power is CUMULATIVE total (direct lookup at current_level, not sum).",
        })

    return list(nodes.values()), level_records


# ─────────────────────────────────────────────────────────────────────────────
# M-002  Troops
# ─────────────────────────────────────────────────────────────────────────────

def extract_troops(
    lw_soldier_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> list[dict]:
    """
    M-002: Troop Tier Base Power.

    lw_soldier.power = the direct squad power contribution PER TROOP.
    lw_soldier.soldier_lv = troop tier (T1=1, T2=2, T3=3, T4=4).
    lw_soldier.type = troop type (1=Infantry, 2=Cavalry, 3=Shooter, …).
    soldier_effect_number = base combat stats ('stat_id;value|…').
    level_factor = stat scaling factor (percentage as string, e.g. '205').
    """
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}
    sch = _schema(lw_soldier_vm)
    records = []
    for k in sorted(_rows(lw_soldier_vm).keys()):
        row = _rows(lw_soldier_vm)[k]
        rec = {
            "id":                 _val(row, sch["id"]),
            "type":               _val(row, sch["type"]),
            "soldier_lv":         _val(row, sch["soldier_lv"]),    # tier 1-4
            "quality":            _val(row, sch["quality"]),
            "power":              _val(row, sch["power"]),          # power per troop
            "level_factor":       _val(row, sch["level_factor"]),
            "soldier_effect_number": _val(row, sch["soldier_effect_number"]),  # combat stats
            "train_time":         _val(row, sch["train_time"]),
            "_source_table": "lw_soldier",
            **prov,
            "_notes": "power = direct squad power per troop unit. soldier_effect_number = combat stats (stat_id;value|…).",
        }
        records.append(rec)
    return records


# ─────────────────────────────────────────────────────────────────────────────
# M-019  Hero Honor Level
# ─────────────────────────────────────────────────────────────────────────────

def extract_hero_honor_level(
    lw_hero_honorLevel_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> list[dict]:
    """
    M-019: Per-level HP bonuses from the Hero Honor Level system (601 levels, 0–600).

    base_value1–5 correspond to hero rarity class 1–5 (string 'stat_id;value').
    Stat ID 50063 = honor-level HP flat bonus. Level 0 row has no bonuses (baseline).
    """
    HP_STAT_ID = 50063
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}
    sch = _schema(lw_hero_honorLevel_vm)
    records = []
    for k in sorted(_rows(lw_hero_honorLevel_vm).keys()):
        row = _rows(lw_hero_honorLevel_vm)[k]
        cls_hp: list[float | None] = []
        for col in ("base_value1", "base_value2", "base_value3",
                    "base_value4", "base_value5"):
            raw = _val(row, sch[col])
            if isinstance(raw, str) and raw:
                stats = _parse_stat_string(raw)
                cls_hp.append(stats.get(HP_STAT_ID))
            else:
                cls_hp.append(None)
        rec = {
            "honor_level": _val(row, sch["id"]),
            "class_1_hp":  cls_hp[0],
            "class_2_hp":  cls_hp[1],
            "class_3_hp":  cls_hp[2],
            "class_4_hp":  cls_hp[3],
            "class_5_hp":  cls_hp[4],
            "shard_need":             _val(row, sch["shard_need"]),
            "shard_need_promotion":   _val(row, sch["shard_need_promotion"]),
            "_source_table": "lw_hero_honorLevel",
            **prov,
        }
        records.append(rec)
    return records


# ─────────────────────────────────────────────────────────────────────────────
# M-020  Decoration Building Level
# ─────────────────────────────────────────────────────────────────────────────

def extract_decoration_building_levels(
    lw_decorationbuilding_lv_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> list[dict]:
    """
    M-020: Per-stage EW HP/ATK/DEF gains from Decoration Building upgrades.

    Stat IDs: 50060=EW HP, 50061=EW ATK, 50062=EW DEF.
    para_gain: incremental gain per progress step (string 'stat_id;value').
    stage_gain: cumulative gain at this stage unlock (string 'stat_id;value').
    Both fields are parsed into structured flat fields.
    """
    EW_HP, EW_ATK, EW_DEF = 50060, 50061, 50062
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}
    sch = _schema(lw_decorationbuilding_lv_vm)
    records = []
    for k in sorted(_rows(lw_decorationbuilding_lv_vm).keys()):
        row = _rows(lw_decorationbuilding_lv_vm)[k]
        para  = _parse_stat_string(_val(row, sch["para_gain"])  or "")
        stage = _parse_stat_string(_val(row, sch["stage_gain"]) or "")
        rec = {
            "id":            _val(row, sch["id"]),
            "building_group": _val(row, sch["group"]),
            "level":         _val(row, sch["level"]),
            "progress":      _val(row, sch["progress"]),
            "stage_need":    _val(row, sch["stage_need"]),
            "para_ew_hp":    para.get(EW_HP),
            "para_ew_atk":   para.get(EW_ATK),
            "para_ew_def":   para.get(EW_DEF),
            "stage_ew_hp":   stage.get(EW_HP),
            "stage_ew_atk":  stage.get(EW_ATK),
            "stage_ew_def":  stage.get(EW_DEF),
            "_source_table": "lw_decorationbuilding_lv",
            **prov,
        }
        records.append(rec)
    return records


# ─────────────────────────────────────────────────────────────────────────────
# M-024  UAV Per-Level Stats
# ─────────────────────────────────────────────────────────────────────────────

def extract_uav_levels(
    lw_uav_level_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> list[dict]:
    """
    M-024: Per-level HP/ATK/DEF gains for individual UAV unit upgrades.

    attr_add is a vExt index resolving to 'stat_id;value|…' strings.
    Stat IDs: 50081=drone HP, 50082=drone ATK, 50083=drone DEF (flat increments).
    These are INCREMENTAL per-level additions, independent from M-011's
    lw_drone_battlesystem_level cumulative totals.
    """
    HP_ID, ATK_ID, DEF_ID = 50081, 50082, 50083
    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}
    sch  = _schema(lw_uav_level_vm)
    vext = lw_uav_level_vm.get("vExt", {})
    records = []
    for k in sorted(_rows(lw_uav_level_vm).keys()):
        row = _rows(lw_uav_level_vm)[k]
        attr_idx = _val(row, sch["attr_add"])
        attr_str = vext.get(attr_idx, "") if isinstance(attr_idx, int) else ""
        stats = _parse_stat_string(attr_str) if isinstance(attr_str, str) else {}
        rec = {
            "id":        _val(row, sch["id"]),
            "uav_id":    _val(row, sch["uav_id"]),
            "level":     _val(row, sch["level"]),
            "sub_level": _val(row, sch["sub_level"]),
            "hp_flat":   stats.get(HP_ID, 0.0),
            "atk_flat":  stats.get(ATK_ID, 0.0),
            "def_flat":  stats.get(DEF_ID, 0.0),
            "power":     _val(row, sch["power"]),
            "_source_table": "lw_uav_level",
            **prov,
        }
        records.append(rec)
    return records


# ─────────────────────────────────────────────────────────────────────────────
# M-NEW-A  Season Military Rank
# ─────────────────────────────────────────────────────────────────────────────

def extract_season_military_rank(
    lw_season_military_level_vm: dict,
    lw_status_vm: dict,
    *,
    game_version: str = "",
    extraction_run_id: str = "",
) -> list[dict]:
    """
    M-NEW-A: Permanent hero % bonuses from Season Military Rank progression.

    lw_season_military_level.status = 'faction;status_id|…' pairs.
    Each status_id resolves in lw_status to effect/effect_num parallel arrays
    with time=-1 (permanent) HP/ATK/DEF % bonuses (75050/75150/75250).
    Ranks 1–15 grant +1–15% HP/ATK/DEF. Ranks 16–19 add 76150 on top.
    Two factions (1 and 2) each have independent status IDs but identical bonuses.
    Only status entries with time='-1' are included (permanent buffs only).
    """
    HP_PCT_ID, ATK_PCT_ID, DEF_PCT_ID = 75050, 75150, 75250

    prov = {"_game_version": game_version, "_extraction_run_id": extraction_run_id}
    sml_sch = _schema(lw_season_military_level_vm)
    st_sch  = _schema(lw_status_vm)
    st_rows = _rows(lw_status_vm)

    records = []
    for k in sorted(_rows(lw_season_military_level_vm).keys()):
        row = _rows(lw_season_military_level_vm)[k]
        rank_level = _val(row, sml_sch["level"])
        status_str = _val(row, sml_sch["status"]) or ""

        for pair in status_str.split("|"):
            parts = pair.split(";")
            if len(parts) != 2:
                continue
            try:
                faction    = int(parts[0])
                status_id  = int(parts[1])
            except ValueError:
                continue

            st_row = st_rows.get(status_id)
            if st_row is None:
                continue
            if _val(st_row, st_sch["time"]) != "-1":
                continue  # not permanent

            effect_str = _val(st_row, st_sch["effect"])     or ""
            enum_str   = _val(st_row, st_sch["effect_num"]) or ""
            effects    = effect_str.split("|")
            values     = enum_str.split("|")

            stat_map: dict[int, float] = {}
            for eff, val in zip(effects, values):
                try:
                    stat_map[int(eff)] = float(val)
                except (ValueError, TypeError):
                    pass

            rec = {
                "id":          _val(row, sml_sch["id"]),
                "rank_level":  int(rank_level) if rank_level is not None else None,
                "faction":     faction,
                "status_id":   status_id,
                "hp_pct":      stat_map.get(HP_PCT_ID),
                "atk_pct":     stat_map.get(ATK_PCT_ID),
                "def_pct":     stat_map.get(DEF_PCT_ID),
                "_source_table": "lw_season_military_level",
                **prov,
            }
            records.append(rec)
    return records
