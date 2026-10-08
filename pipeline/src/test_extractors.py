"""
test_extractors.py — Unit tests for pipeline extractors.

Run with:  python -m pytest test_extractors.py -v
  or:      python test_extractors.py

Tests are self-contained: they build minimal VM dicts that match the Lua
schema-first columnar format instead of loading the real XAPK.
"""

from __future__ import annotations
import sys, unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from extractors import (
    extract_hero_skills,
    extract_decorations,
    extract_exclusive_weapons,
    extract_hero_honor_level,
    extract_decoration_building_levels,
    extract_uav_levels,
    extract_season_military_rank,
)


# ─────────────────────────────────────────────────────────────────────────────
# VM builder helpers
# ─────────────────────────────────────────────────────────────────────────────

def _make_vm(fields: list[str], rows: dict, vext: dict | None = None) -> dict:
    """Build a minimal schema-first VM dict."""
    index = {name: {1: i + 1, 2: "int"} for i, name in enumerate(fields)}
    return {"index": index, "data": rows, "vExt": vext or {}}


def _row(fields: list[str], **values) -> dict:
    """Build a positional row dict from field names → values."""
    index = {name: i + 1 for i, name in enumerate(fields)}
    return {index[k]: v for k, v in values.items() if k in index}


# ─────────────────────────────────────────────────────────────────────────────
# M-008+  Hero Skills — property_out_of_battle
# ─────────────────────────────────────────────────────────────────────────────

SKILL_FIELDS = [
    "id", "skill_cat", "name", "desc", "desc_para", "icon", "maxLevel",
    "maxStar", "star", "group", "need_rank", "power", "levelup_consume_sp",
    "enhance_fragment", "display_type", "displayCast_type",
    "displayCast_type_new", "awake_not_stop", "level_up_desc",
    "level_up_desc_param", "enhance_desc_pre", "effect_incity", "pre_cd",
    "attack_interval", "priority", "is_normal_attack", "is_focus",
    "damage_ratio", "damage_to_monster", "source_group",
    "property", "property_out_of_battle",
]


class TestHeroSkillsOutOfBattle(unittest.TestCase):

    def _make_skill_vm(self, skill_rows: dict, vext: dict) -> dict:
        return _make_vm(SKILL_FIELDS, skill_rows, vext)

    def _empty_b_vm(self) -> dict:
        return _make_vm(SKILL_FIELDS, {})

    def test_hero_pct_bonuses_extracted_via_vext(self):
        """property_out_of_battle vExt index resolves to hero % bonus string."""
        vext = {251: "75050;0.1;0|75150;0.1;0|75250;0.1;0"}
        row = _row(SKILL_FIELDS,
                   id=50040, skill_cat=1, name=None, desc=None, desc_para=None,
                   icon=None, maxLevel=6, maxStar=6, star=1, group=100,
                   need_rank=None, power=500, levelup_consume_sp=None,
                   enhance_fragment=None, display_type=None,
                   displayCast_type=None, displayCast_type_new=None,
                   awake_not_stop=None, level_up_desc=None,
                   level_up_desc_param=None, enhance_desc_pre=None,
                   effect_incity=None, pre_cd=None, attack_interval=None,
                   priority=None, is_normal_attack=None, is_focus=None,
                   damage_ratio=None, damage_to_monster=None,
                   source_group=None, property=None,
                   property_out_of_battle=251)
        vm = self._make_skill_vm({50040: row}, vext)
        records = extract_hero_skills(vm, self._empty_b_vm())
        self.assertEqual(len(records), 1)
        r = records[0]
        self.assertAlmostEqual(r["hp_pct_bonus"],  0.1)
        self.assertAlmostEqual(r["atk_pct_bonus"], 0.1)
        self.assertAlmostEqual(r["def_pct_bonus"], 0.1)

    def test_null_out_of_battle_yields_none_fields(self):
        """Skills without property_out_of_battle produce None bonus fields."""
        row = _row(SKILL_FIELDS,
                   id=50030, skill_cat=1, name=None, desc=None, desc_para=None,
                   icon=None, maxLevel=6, maxStar=6, star=1, group=99,
                   need_rank=None, power=100, levelup_consume_sp=None,
                   enhance_fragment=None, display_type=None,
                   displayCast_type=None, displayCast_type_new=None,
                   awake_not_stop=None, level_up_desc=None,
                   level_up_desc_param=None, enhance_desc_pre=None,
                   effect_incity=None, pre_cd=None, attack_interval=None,
                   priority=None, is_normal_attack=None, is_focus=None,
                   damage_ratio=None, damage_to_monster=None,
                   source_group=None, property="75953;0.04;0.001",
                   property_out_of_battle=None)
        vm = self._make_skill_vm({50030: row}, {})
        records = extract_hero_skills(vm, self._empty_b_vm())
        self.assertEqual(len(records), 1)
        r = records[0]
        self.assertIsNone(r["hp_pct_bonus"])
        self.assertIsNone(r["atk_pct_bonus"])
        self.assertIsNone(r["def_pct_bonus"])
        self.assertEqual(r["property"], "75953;0.04;0.001")

    def test_partial_bonus_string(self):
        """Only some hero % stats in out_of_battle string."""
        vext = {10: "75150;0.05;0"}
        row = _row(SKILL_FIELDS,
                   id=99001, skill_cat=1, name=None, desc=None, desc_para=None,
                   icon=None, maxLevel=3, maxStar=3, star=2, group=200,
                   need_rank=None, power=200, levelup_consume_sp=None,
                   enhance_fragment=None, display_type=None,
                   displayCast_type=None, displayCast_type_new=None,
                   awake_not_stop=None, level_up_desc=None,
                   level_up_desc_param=None, enhance_desc_pre=None,
                   effect_incity=None, pre_cd=None, attack_interval=None,
                   priority=None, is_normal_attack=None, is_focus=None,
                   damage_ratio=None, damage_to_merchant=None,
                   source_group=None, property=None,
                   property_out_of_battle=10)
        vm = self._make_skill_vm({99001: row}, vext)
        records = extract_hero_skills(vm, self._empty_b_vm())
        r = records[0]
        self.assertIsNone(r["hp_pct_bonus"])
        self.assertAlmostEqual(r["atk_pct_bonus"], 0.05)
        self.assertIsNone(r["def_pct_bonus"])

    def test_both_tables_processed(self):
        """Records come from both lw_hero_skill and lw_hero_skill_B."""
        vext = {1: "75050;0.1;0|75150;0.1;0|75250;0.1;0"}
        row_a = _row(SKILL_FIELDS, id=1, skill_cat=1, name=None, desc=None,
                     desc_para=None, icon=None, maxLevel=1, maxStar=1,
                     star=1, group=1, need_rank=None, power=10,
                     levelup_consume_sp=None, enhance_fragment=None,
                     display_type=None, displayCast_type=None,
                     displayCast_type_new=None, awake_not_stop=None,
                     level_up_desc=None, level_up_desc_param=None,
                     enhance_desc_pre=None, effect_incity=None, pre_cd=None,
                     attack_interval=None, priority=None,
                     is_normal_attack=None, is_focus=None, damage_ratio=None,
                     damage_to_monster=None, source_group=None, property=None,
                     property_out_of_battle=1)
        vm_a = self._make_skill_vm({1: row_a}, vext)
        vm_b = self._make_skill_vm({2: row_a}, vext)
        records = extract_hero_skills(vm_a, vm_b)
        self.assertEqual(len(records), 2)
        self.assertEqual(records[0]["_source_table"], "lw_hero_skill")
        self.assertEqual(records[1]["_source_table"], "lw_hero_skill_B")


# ─────────────────────────────────────────────────────────────────────────────
# M-021+  Decorations — stat parsing
# ─────────────────────────────────────────────────────────────────────────────

DEC_FIELDS = [
    "id", "type", "showgroup", "type_gain", "sex", "para_gain",
    "effect_wear", "effect_gain", "name", "icon", "image", "model",
    "model_world", "model_new", "model_world_new", "appearance", "quality",
    "order", "hot", "position", "custom_variable", "isShow",
    "show_condition", "serverid", "inner_server", "skill_id",
    "act_mod_open", "act_config", "act_random_config", "season",
    "effect_wear_hide", "effect_gain_hide",
    "callback_effect_gain_tips", "special_image", "act_idle_status_para",
    "callback_skill_id", "goto_buy", "is_advanced", "model_advanced",
    "model_world_advanced", "act_spec_status_para", "status_id",
    "rt_config", "if_vip",
]


class TestDecorationStatParsing(unittest.TestCase):

    def _make_dec_vm(self, rows: dict) -> dict:
        return _make_vm(DEC_FIELDS, rows)

    def _dec_row(self, **kw) -> dict:
        defaults = dict(id=10001, type=1, showgroup=None, type_gain=None,
                        sex=None, para_gain=None, effect_wear=None,
                        effect_gain=None, name=None, icon=None, image=None,
                        model=None, model_world=None, model_new=None,
                        model_world_new=None, appearance=None, quality=3,
                        order=None, hot=None, position=None,
                        custom_variable=None, isShow="1",
                        show_condition=None, serverid=None,
                        inner_server=None, skill_id=None,
                        act_mod_open=None, act_config=None,
                        act_random_config=None, season=None,
                        effect_wear_hide=None, effect_gain_hide=None,
                        callback_effect_gain_tips=None, special_image=None,
                        act_idle_status_para=None, callback_skill_id=None,
                        goto_buy=None, is_advanced=None, model_advanced=None,
                        model_world_advanced=None, act_spec_status_para=None,
                        status_id=None, rt_config=None, if_vip=None)
        defaults.update(kw)
        return _row(DEC_FIELDS, **defaults)

    def test_effect_gain_parsed(self):
        row = self._dec_row(id=10009, effect_gain="75150;0.05",
                            effect_wear="75150;0.05")
        vm = self._make_dec_vm({10009: row})
        records = extract_decorations(vm)
        r = records[0]
        self.assertAlmostEqual(r["atk_pct_bonus"], 0.05)
        self.assertIsNone(r["hp_pct_bonus"])
        self.assertIsNone(r["def_pct_bonus"])

    def test_effect_gain_multi_stat(self):
        row = self._dec_row(id=10010,
                            effect_gain="75150;0.05|75250;0.05",
                            effect_wear="75150;0.05")
        vm = self._make_dec_vm({10010: row})
        records = extract_decorations(vm)
        r = records[0]
        self.assertAlmostEqual(r["atk_pct_bonus"], 0.05)
        self.assertAlmostEqual(r["def_pct_bonus"], 0.05)
        self.assertIsNone(r["hp_pct_bonus"])

    def test_all_three_pct_stats(self):
        row = self._dec_row(id=10011,
                            effect_gain="75050;0.05|75150;0.05|75250;0.05",
                            effect_wear="75150;0.05")
        vm = self._make_dec_vm({10011: row})
        records = extract_decorations(vm)
        r = records[0]
        self.assertAlmostEqual(r["hp_pct_bonus"],  0.05)
        self.assertAlmostEqual(r["atk_pct_bonus"], 0.05)
        self.assertAlmostEqual(r["def_pct_bonus"], 0.05)

    def test_no_hero_pct_stat(self):
        row = self._dec_row(id=10099, effect_gain="75953;0.05",
                            effect_wear="75953;0.05")
        vm = self._make_dec_vm({10099: row})
        records = extract_decorations(vm)
        r = records[0]
        self.assertIsNone(r["hp_pct_bonus"])
        self.assertIsNone(r["atk_pct_bonus"])
        self.assertIsNone(r["def_pct_bonus"])

    def test_isshow_filter(self):
        """Decorations with isShow != '1' are excluded."""
        row = self._dec_row(id=99999, isShow="0",
                            effect_gain="75050;0.1")
        vm = self._make_dec_vm({99999: row})
        records = extract_decorations(vm)
        self.assertEqual(len(records), 0)

    def test_raw_strings_still_present(self):
        """effect_wear and effect_gain raw strings are preserved."""
        row = self._dec_row(id=10012,
                            effect_gain="75150;0.05|75250;0.05",
                            effect_wear="75150;0.05")
        vm = self._make_dec_vm({10012: row})
        records = extract_decorations(vm)
        r = records[0]
        self.assertEqual(r["effect_gain"], "75150;0.05|75250;0.05")
        self.assertEqual(r["effect_wear"], "75150;0.05")


# ─────────────────────────────────────────────────────────────────────────────
# M-010-B  EW Weapon Unit Stats
# ─────────────────────────────────────────────────────────────────────────────

EWU_FIELDS = ["id", "hero", "type", "max_lv", "overall_attr",
              "overall_value", "personal_attr", "personal_value"]

# Shared vExt from real client data (6 entries total)
EWU_VEXT = {
    1: {1: "50,4",    2: "100,4",   3: "150,6",  4: "200,6",  5: "250,8",  6: "300,8"},
    2: {1: "50,1750", 2: "100,1750",3: "150,1750",4: "200,1750",5: "250,1750",6: "300,1750"},
    3: {1: "50,200",  2: "100,200", 3: "150,300",4: "200,300",5: "250,400",6: "300,400"},
    4: {1: "50,42000",2: "100,42000",3:"150,42000",4:"200,42000",5:"250,42000",6:"300,42000"},
    5: {1: "50,1",    2: "100,1",   3: "150,1.5",4: "200,1.5",5: "250,2",  6: "300,2"},
    6: {1: "50,150",  2: "100,150", 3: "150,150",4: "200,150",5: "250,150",6: "300,150"},
}


class TestEWWeaponUnits(unittest.TestCase):

    def _make_ewu_vm(self, rows: dict) -> dict:
        return _make_vm(EWU_FIELDS, rows, EWU_VEXT)

    def test_atk_unit_record(self):
        """Unit type 1 (ATK): overall_attr=51053, personal_attr=51052."""
        row = _row(EWU_FIELDS, id=5000901, hero=50009, type=1, max_lv=300,
                   overall_attr=51053, overall_value=1,
                   personal_attr=51052, personal_value=2)
        vm = self._make_ewu_vm({5000901: row})
        records = extract_exclusive_weapons(
            lw_hero_unique_weapon_vm=_make_vm([], {}),
            lw_hero_unique_weapon_effect_vm=_make_vm([], {}),
            lw_hero_unique_weapon_unit_vm=vm,
        )
        _, _, unit_records = records
        self.assertEqual(len(unit_records), 1)
        r = unit_records[0]
        self.assertEqual(r["hero_id"], 50009)
        self.assertEqual(r["unit_type"], 1)
        self.assertEqual(r["overall_stat_id"],  51053)
        self.assertEqual(r["personal_stat_id"], 51052)
        # Tier milestone values: {tier: 'level,value'}
        self.assertEqual(r["overall_milestones"],  {1: (50, 4.0),   2: (100, 4.0),
                                                     3: (150, 6.0),  4: (200, 6.0),
                                                     5: (250, 8.0),  6: (300, 8.0)})
        self.assertEqual(r["personal_milestones"], {1: (50, 1750.0), 2: (100, 1750.0),
                                                    3: (150, 1750.0),4: (200, 1750.0),
                                                    5: (250, 1750.0),6: (300, 1750.0)})

    def test_hp_unit_record(self):
        """Unit type 2 (HP): overall_attr=51003, personal_attr=51002."""
        row = _row(EWU_FIELDS, id=5000902, hero=50009, type=2, max_lv=300,
                   overall_attr=51003, overall_value=3,
                   personal_attr=51002, personal_value=4)
        vm = self._make_ewu_vm({5000902: row})
        records = extract_exclusive_weapons(
            lw_hero_unique_weapon_vm=_make_vm([], {}),
            lw_hero_unique_weapon_effect_vm=_make_vm([], {}),
            lw_hero_unique_weapon_unit_vm=vm,
        )
        _, _, unit_records = records
        r = unit_records[0]
        self.assertEqual(r["overall_stat_id"],  51003)
        self.assertEqual(r["personal_stat_id"], 51002)

    def test_def_unit_record(self):
        """Unit type 3 (DEF): overall_attr=51103, personal_attr=51102."""
        row = _row(EWU_FIELDS, id=5000903, hero=50009, type=3, max_lv=300,
                   overall_attr=51103, overall_value=5,
                   personal_attr=51102, personal_value=6)
        vm = self._make_ewu_vm({5000903: row})
        records = extract_exclusive_weapons(
            lw_hero_unique_weapon_vm=_make_vm([], {}),
            lw_hero_unique_weapon_effect_vm=_make_vm([], {}),
            lw_hero_unique_weapon_unit_vm=vm,
        )
        _, _, unit_records = records
        r = unit_records[0]
        self.assertEqual(r["overall_stat_id"],  51103)
        self.assertEqual(r["personal_stat_id"], 51102)


# ─────────────────────────────────────────────────────────────────────────────
# M-019  Hero Honor Level
# ─────────────────────────────────────────────────────────────────────────────

HONOR_FIELDS = ["id", "shard_need", "base_value1", "base_value2",
                "base_value3", "base_value4", "base_value5",
                "shard_need_promotion"]


class TestHeroHonorLevel(unittest.TestCase):

    def _make_vm(self, rows: dict) -> dict:
        return _make_vm(HONOR_FIELDS, rows)

    def test_level_zero_baseline(self):
        """Level 0 row has no bonus — all class values None."""
        row = _row(HONOR_FIELDS, id=0, shard_need=10,
                   base_value1=None, base_value2=None, base_value3=None,
                   base_value4=None, base_value5=None, shard_need_promotion=20)
        vm = _make_vm(HONOR_FIELDS, {0: row})
        records = extract_hero_honor_level(vm)
        r = next(r for r in records if r["honor_level"] == 0)
        for cls in range(1, 6):
            self.assertIsNone(r[f"class_{cls}_hp"])

    def test_level_1_values(self):
        """Level 1 has stat 50063 values for each hero class."""
        row = _row(HONOR_FIELDS, id=1, shard_need=10,
                   base_value1="50063;10", base_value2="50063;25",
                   base_value3="50063;50", base_value4="50063;100",
                   base_value5="50063;200", shard_need_promotion=20)
        vm = _make_vm(HONOR_FIELDS, {1: row})
        records = extract_hero_honor_level(vm)
        r = records[0]
        self.assertEqual(r["honor_level"], 1)
        self.assertAlmostEqual(r["class_1_hp"], 10.0)
        self.assertAlmostEqual(r["class_2_hp"], 25.0)
        self.assertAlmostEqual(r["class_3_hp"], 50.0)
        self.assertAlmostEqual(r["class_4_hp"], 100.0)
        self.assertAlmostEqual(r["class_5_hp"], 200.0)

    def test_601_levels_sorted(self):
        """Records cover levels 0–600 in order."""
        rows = {}
        for lv in range(601):
            val = f"50063;{lv * 10}" if lv > 0 else None
            rows[lv] = _row(HONOR_FIELDS, id=lv, shard_need=10,
                            base_value1=val, base_value2=val,
                            base_value3=val, base_value4=val,
                            base_value5=val, shard_need_promotion=20)
        vm = _make_vm(HONOR_FIELDS, rows)
        records = extract_hero_honor_level(vm)
        self.assertEqual(len(records), 601)
        self.assertEqual(records[0]["honor_level"], 0)
        self.assertEqual(records[600]["honor_level"], 600)


# ─────────────────────────────────────────────────────────────────────────────
# M-020  Decoration Building Level
# ─────────────────────────────────────────────────────────────────────────────

DBL_FIELDS = ["id", "group", "level", "progress", "para_gain",
              "stage_gain", "stage_need", "cost_item", "stage_icon",
              "stage_info"]


class TestDecorationBuildingLevel(unittest.TestCase):

    def _make_vm(self, rows: dict) -> dict:
        return _make_vm(DBL_FIELDS, rows)

    def test_ew_hp_stat(self):
        """EW HP (50060) parsed from para_gain and stage_gain."""
        row = _row(DBL_FIELDS, id=1034010031, group=1, level=3, progress=1,
                   para_gain="50060;133.33", stage_gain="50060;200",
                   stage_need=6, cost_item="1", stage_icon=1, stage_info=None)
        vm = _make_vm(DBL_FIELDS, {1034010031: row})
        records = extract_decoration_building_levels(vm)
        r = records[0]
        self.assertAlmostEqual(r["para_ew_hp"],   133.33, places=2)
        self.assertAlmostEqual(r["stage_ew_hp"],  200.0)
        self.assertIsNone(r["para_ew_atk"])
        self.assertIsNone(r["para_ew_def"])

    def test_ew_atk_stat(self):
        row = _row(DBL_FIELDS, id=2000001, group=2, level=1, progress=1,
                   para_gain="50061;50.0", stage_gain="50061;100",
                   stage_need=3, cost_item="1", stage_icon=1, stage_info=None)
        vm = _make_vm(DBL_FIELDS, {2000001: row})
        records = extract_decoration_building_levels(vm)
        r = records[0]
        self.assertAlmostEqual(r["para_ew_atk"],  50.0)
        self.assertAlmostEqual(r["stage_ew_atk"], 100.0)
        self.assertIsNone(r["para_ew_hp"])

    def test_ew_def_stat(self):
        row = _row(DBL_FIELDS, id=3000001, group=3, level=1, progress=1,
                   para_gain="50062;20.0", stage_gain="50062;40",
                   stage_need=3, cost_item="1", stage_icon=1, stage_info=None)
        vm = _make_vm(DBL_FIELDS, {3000001: row})
        records = extract_decoration_building_levels(vm)
        r = records[0]
        self.assertAlmostEqual(r["para_ew_def"],  20.0)
        self.assertAlmostEqual(r["stage_ew_def"], 40.0)


# ─────────────────────────────────────────────────────────────────────────────
# M-024  UAV Per-Level Stats
# ─────────────────────────────────────────────────────────────────────────────

UAV_FIELDS = [
    "id", "uav_id", "level", "sub_level", "upgradeType",
    "progress_total", "progress_refund", "progress_add", "cost_resItem",
    "attr_add", "attr_per_progressAdd", "power", "skill_level", "skill",
    "bonus_rate", "promote_tips", "appearance", "need_building",
    "chip_background", "upgrade_id",
]


class TestUAVLevels(unittest.TestCase):

    def _make_vm(self, rows: dict, vext: dict) -> dict:
        return _make_vm(UAV_FIELDS, rows, vext)

    def test_attr_add_resolved_to_stats(self):
        """attr_add vExt index resolves to HP/ATK/DEF flat bonus string."""
        vext = {1: "50081;4320|50082;514.29|50083;20.58|50091;1000"}
        row = _row(UAV_FIELDS, id=1001, uav_id=1000, level=1, sub_level=0,
                   upgradeType=0, progress_total=5000, progress_refund=0,
                   progress_add=1250, cost_resItem="7037;1250",
                   attr_add=1, attr_per_progressAdd=None, power=2,
                   skill_level=1, skill=700100, bonus_rate=3,
                   promote_tips=None, appearance=1201, need_building=4,
                   chip_background=None, upgrade_id=1)
        vm = self._make_vm({1001: row}, vext)
        records = extract_uav_levels(vm)
        self.assertEqual(len(records), 1)
        r = records[0]
        self.assertEqual(r["uav_id"], 1000)
        self.assertEqual(r["level"], 1)
        self.assertAlmostEqual(r["hp_flat"],  4320.0)
        self.assertAlmostEqual(r["atk_flat"], 514.29, places=2)
        self.assertAlmostEqual(r["def_flat"],  20.58, places=2)
        self.assertEqual(r["power"], 2)

    def test_null_attr_add_yields_zero(self):
        """Missing attr_add vExt entry → all stat fields zero."""
        row = _row(UAV_FIELDS, id=1002, uav_id=1000, level=2, sub_level=0,
                   upgradeType=0, progress_total=5000, progress_refund=0,
                   progress_add=1250, cost_resItem="7037;1250",
                   attr_add=None, attr_per_progressAdd=None, power=6,
                   skill_level=1, skill=700100, bonus_rate=3,
                   promote_tips=None, appearance=1201, need_building=4,
                   chip_background=None, upgrade_id=1)
        vm = self._make_vm({1002: row}, {})
        records = extract_uav_levels(vm)
        r = records[0]
        self.assertEqual(r["hp_flat"],  0.0)
        self.assertEqual(r["atk_flat"], 0.0)
        self.assertEqual(r["def_flat"],  0.0)


# ─────────────────────────────────────────────────────────────────────────────
# M-NEW-A  Season Military Rank
# ─────────────────────────────────────────────────────────────────────────────

SML_FIELDS = [
    "id", "group", "level", "level_group", "status", "effect_desc",
    "effect_num", "daily_salary", "title", "title_show", "unlock_score",
    "unlock_score_desc", "unlock_condition_type", "unlock_condition_para",
    "unlock_condition_desc", "standard_level", "need_rank", "rank_value",
    "rank_desc", "final_rewards", "final_title", "name", "icon",
]

STATUS_FIELDS = [
    "id", "type", "type2", "type3", "unactive_condition", "time",
    "effect", "effect_num", "effect_overview_type", "level", "group",
    "parent", "priority", "order", "color", "name", "description",
    "icon", "buff_is_green", "buff_is_add", "max_layer", "extra_layer",
    "info", "music_sound", "para1", "buff_effect", "season_active_skill",
    "buff_show_config", "world_show", "mix_type", "skill_id",
    "activity_id", "season", "is_battlefield", "season_end_clear",
    "card_screen_effect", "card_march_icon_effect", "buff_origin",
    "buff_no_field",
]


class TestSeasonMilitaryRank(unittest.TestCase):

    def _make_sml_vm(self, rows: dict) -> dict:
        return _make_vm(SML_FIELDS, rows)

    def _make_status_vm(self, rows: dict) -> dict:
        return _make_vm(STATUS_FIELDS, rows)

    def _status_row(self, sid: int, effect: str, effect_num: str,
                    time: str = "-1", type2: str = "0") -> dict:
        return _row(STATUS_FIELDS, id=sid, type="1", type2=type2, type3="8",
                    unactive_condition=None, time=time,
                    effect=effect, effect_num=effect_num,
                    effect_overview_type="1", level="1", group="705100",
                    parent="1", priority="1", order=None, color="fccdce",
                    name=None, description=None, icon=None,
                    buff_is_green=None, buff_is_add=None, max_layer=None,
                    extra_layer=None, info=None, music_sound=None,
                    para1=None, buff_effect=None, season_active_skill=None,
                    buff_show_config=None, world_show=None, mix_type=None,
                    skill_id=None, activity_id=None, season=None,
                    is_battlefield=None, season_end_clear=None,
                    card_screen_effect=None, card_march_icon_effect=None,
                    buff_origin=None, buff_no_field=None)

    def test_rank_1_bonuses(self):
        """Rank 1 → +1% HP/ATK/DEF for both factions."""
        sml_row = _row(SML_FIELDS, id=101, group="60", level="1",
                       level_group="1", status="1;705101|2;705201",
                       effect_desc=1, effect_num="1;1;1",
                       daily_salary="109095428",
                       title=None, title_show=None, unlock_score=None,
                       unlock_score_desc=None, unlock_condition_type=None,
                       unlock_condition_para=None, unlock_condition_desc=None,
                       standard_level=None, need_rank=None, rank_value=None,
                       rank_desc=None, final_rewards=None, final_title=None,
                       name=None, icon=None)
        st_f1 = self._status_row(705101, "75150|75250|75050", "0.01|0.01|0.01")
        st_f2 = self._status_row(705201, "75150|75250|75050", "0.01|0.01|0.01")

        sml_vm = self._make_sml_vm({101: sml_row})
        st_vm  = self._make_status_vm({705101: st_f1, 705201: st_f2})

        records = extract_season_military_rank(sml_vm, st_vm)
        self.assertEqual(len(records), 2)

        for r in records:
            self.assertEqual(r["rank_level"], 1)
            self.assertAlmostEqual(r["hp_pct"],  0.01)
            self.assertAlmostEqual(r["atk_pct"], 0.01)
            self.assertAlmostEqual(r["def_pct"], 0.01)
        factions = {r["faction"] for r in records}
        self.assertEqual(factions, {1, 2})

    def test_rank_15_bonuses(self):
        """Rank 15 → +15% HP/ATK/DEF."""
        sml_row = _row(SML_FIELDS, id=115, group="60", level="15",
                       level_group="3", status="1;705115|2;705215",
                       effect_desc=1, effect_num="15;15;15;500",
                       daily_salary="109095442",
                       title=None, title_show=None, unlock_score=None,
                       unlock_score_desc=None, unlock_condition_type=None,
                       unlock_condition_para=None, unlock_condition_desc=None,
                       standard_level=None, need_rank=None, rank_value=None,
                       rank_desc=None, final_rewards=None, final_title=None,
                       name=None, icon=None)
        st_f1 = self._status_row(705115, "75150|75250|75050|41001",
                                 "0.15|0.15|0.15|500")
        st_f2 = self._status_row(705215, "75150|75250|75050|41001",
                                 "0.15|0.15|0.15|500")

        sml_vm = self._make_sml_vm({115: sml_row})
        st_vm  = self._make_status_vm({705115: st_f1, 705215: st_f2})

        records = extract_season_military_rank(sml_vm, st_vm)
        for r in records:
            self.assertAlmostEqual(r["hp_pct"],  0.15)
            self.assertAlmostEqual(r["atk_pct"], 0.15)
            self.assertAlmostEqual(r["def_pct"], 0.15)

    def test_permanent_only(self):
        """Status entries with time != -1 are excluded."""
        sml_row = _row(SML_FIELDS, id=101, group="60", level="1",
                       level_group="1", status="1;999001|2;999002",
                       effect_desc=1, effect_num="1;1;1",
                       daily_salary=None,
                       title=None, title_show=None, unlock_score=None,
                       unlock_score_desc=None, unlock_condition_type=None,
                       unlock_condition_para=None, unlock_condition_desc=None,
                       standard_level=None, need_rank=None, rank_value=None,
                       rank_desc=None, final_rewards=None, final_title=None,
                       name=None, icon=None)
        st_temp = self._status_row(999001, "75150|75250|75050", "0.01|0.01|0.01",
                                   time="600", type2="30")
        st_vm = self._make_status_vm({999001: st_temp})

        sml_vm = self._make_sml_vm({101: sml_row})
        records = extract_season_military_rank(sml_vm, st_vm)
        # temporary status and missing status both excluded → 0 records
        self.assertEqual(len(records), 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
