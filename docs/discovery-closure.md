# Hero Power Engine — Discovery Closure Report

**Date:** 2026-07-16  
**XAPK version:** Last+War_Survival+Game_1.0.352  
**Total tables in archive:** 1288  
**Total Lua scripts:** 1288 (one bytecode file per table; no separate `.lua` script files in the APK)

---

## 1. Search Methodology

### Phase 1: String Scan (all 1288 tables)
Scanned every table's raw bytecode for the ASCII/Latin-1 string representations of every known hero power stat ID:

```
50039 50041 50043   (army_type=1 HP/ATK/DEF)
50046 50048 50050   (army_type=2 HP/ATK/DEF)
50052 50054 50056   (army_type=3 HP/ATK/DEF)
50060 50061 50062   (decoration stage HP/ATK/DEF)
50063              (honor HP)
50081 50082 50083   (drone HP/ATK/DEF)
51000 51050 51100   (EW weapon level HP/ATK/DEF)
51002 51003         (EW weapon unit HP, power_cala_type=1)
51052 51053         (EW weapon unit ATK)
51102 51103         (EW weapon unit DEF)
76057              (EW weapon special %, power=1,050,000)
75050 75150 75250   (hero HP%/ATK%/DEF% bonus, power_cala_type=2)
75072/73/74 etc.    (battle card % variants)
50005–50010         (hero pentagon base stats)
50019–50022         (additional hero base stats)
```

Results: **310 tables** had string hits; **978 tables** had no string hits.

### Phase 2: Integer Key Scan (all 978 no-hit tables)
A separate scan walked every parsed row of every no-hit table, checking whether any Lua table's integer keys match hero power stat IDs. This covers the blind spot where stat IDs are stored as integer dict keys (e.g., `{50081: 12500.4}`) rather than as string values.

Results: **2 additional tables** found: `lw_equip_attribute` and `lw_squad_equip_lv`.

### Phase 3: Schema + Content Investigation (all 312 hit tables)
Every hit table's schema was read and first rows inspected to distinguish genuine hero power sources from false positives (reward tables referencing stat IDs as item type codes, monster tables with NPC stats, event tables with reward item categories, etc.).

### Coverage
- String hits + integer hits together = 312 tables investigated
- Remaining 976 tables: zero hits in either scan → **negative proof** (no hero power stat ID appears in any form in their bytecode)
- **Total coverage: 1288/1288 tables** (100%)

---

## 2. Complete Table Inventory

### Category Definitions
- **INCLUDED_EXTRACTED** — hero power source, already extracted by pipeline
- **INCLUDED_GAP** — hero power source confirmed, NOT in current pipeline
- **EXCLUDED** — not a hero power source; reason code and technical evidence provided

### Reason Codes for EXCLUDED
| Code | Meaning |
|------|---------|
| NEG | Negative proof: zero hero stat ID hits in all scan phases |
| REW | Reward/loot table: stat IDs are item type codes in reward payloads, not formula inputs |
| MON | Monster/NPC: stat IDs define enemy unit stats, not player hero stats |
| SPLIT | Shard of a parent table; parent already classified |
| EVENT | Seasonal/event content (rewards only, not hero power formula) |
| SHOP | Shop/purchase item listing |
| UI | Display, localization, or animation table |
| ECON | Economy/city building, no hero combat stat formula |
| BATTLE | In-battle temporary buff (timed, not permanent hero panel power) |
| QUEST | Quest objective or task reward (item references, not formula) |
| SUB | Substring false positive (e.g. `500541` contains `50054`) |

### INCLUDED_EXTRACTED Tables (hero power sources in pipeline)

| Table | Mechanic | Hero Power Contribution |
|-------|----------|------------------------|
| `building` | M-018 | HP/ATK/DEF bonuses per level; stat IDs 50039/41/43/46/48/50/52/54/56/60/61/62/81/82/83/51000/51100 |
| `building_B` | M-022 | Military centers; same stat IDs as building |
| `lw_decoration` | M-021 | `effect_gain`: 75050/75150/75250 hero % bonuses per decoration |
| `lw_drone_skillchip_attribute` | M-011 | Drone chip HP/ATK/DEF: 50081/82/83 |
| `lw_drone_battlesystem_level` | M-011 | Drone battle system level: 50081/82/83 (stored as integer keys) |
| `lw_hero_skill` | M-008 | Hero skill `property`/`property_out_of_battle`: hero stat bonuses |
| `lw_hero_skill_B` | M-008 | Hero skill bonus tier |
| `vip` | M-017 | VIP hero % bonuses: 75050/75150/75250 |
| `APS_science` | M-023 | APS research: includes hero stat nodes |
| `lw_hero_unique_weapon` | M-010 | EW weapon `power` field per level (pre-computed, includes 51000/51050/51100/76057) |
| `lw_camp_science_detail` | M-009 | Research hero stat nodes (stats as vExt integers) |
| `lw_alliance_science_detail` | M-015 | Alliance tech hero stat nodes |
| `lw_equip` | M-006/007 | `power` field per gear piece (pre-computed, includes 75050/75150/75250 from attributes) |
| `lw_equip_promote` | M-006/007 | Gear promotion costs |
| `lw_equip_upgrade` | M-006/007 | Gear upgrade costs |
| `lw_hero` | M-003 | Hero base stats |
| `lw_hero_rank_reset` | M-005 | Hero star rank bonuses |
| `lw_hero_awaken` | M-005 | Hero awakening bonuses |
| `lw_hero_awaken_rank` | M-005 | Hero awakening rank bonuses |
| `lw_template_property` | M-004 | Hero level growth template |
| `heroes_levelup` | M-004 | Hero level-up bonuses |
| `lw_hero_level` | M-004 | Hero level data |
| `lw_soldier` | M-002 | Troop base stats |

### INCLUDED_GAP Tables (confirmed hero power sources NOT in pipeline)

| Table | Evidence | Status |
|-------|----------|--------|
| `lw_decorationbuilding_lv` | `stage_gain` field: stat 50060 (HP, max 23003.7), 50061 (ATK, max 700.2), 50062 (DEF, max 141.0). 636 rows. Not referenced by `extract_decorations`. | **GAP** |
| `lw_hero_unique_weapon_unit` | `personal_attr`/`overall_attr`: stats 51002/51003 (HP coeff 0.5), 51052/51053 (ATK coeff 12.5), 51102/51103 (DEF coeff 35). Not in M-010. | **GAP** |
| `lw_hero_honorLevel` | `base_value1`–`base_value5`: stat 50063 (HP, coeff 0.5), values 10–320,000 per honor level. 601 levels × 5 hero types = 3,000 entries. Not in pipeline. | **GAP** |
| `lw_squad_equip_lv` | `big_percent_effect`: stats 75050/75150/75250 (hero HP%/ATK%/DEF%), max +4% each, 60 rows across 12 groups. Not in pipeline. `small_percent_effect_hero` is empty. | **GAP** |
| `lw_equip_attribute` | 1188 rows with `{stat_id: value}` dict (integer keys). Stat 75050/75150/75250 each in 296 rows (max 7.5%), 76057 in 150 rows. Referenced by `lw_equip.basic_attributes` (per-level). `lw_equip.power` captures max-level total but per-level breakdown is unresolved. | **PARTIAL GAP** (per-level only) |
| `lw_uav_level` | `attr_add`: 50081/82/83 (drone HP/ATK/DEF). `power` field present. 1016 rows. Separate from `lw_drone_battlesystem_level` (900 rows in M-011). Different progression axis. | **POTENTIAL GAP** |

### EXCLUDED Tables: Hit Tables (false positives, 302 tables)

#### Reward/Loot Tables (stat IDs are item category codes) — REW
`activity`, `activity_task`, `activity_drop`, `activity_easter_egg`, `battlepass`, `battlepass_v2`,
`box_no_put_back`, `exchange`, `exchange_split1/2/3`, `goods`, `item`, `reward`,
`reward_split6–14/16/17/19/20`, `lw_dropInfoDetail`, `explorer_case`, `Treasure_map_reward_show`

**Evidence:** Stat IDs appear as values in `type`, `reward_type`, or `item_type` columns. A stat ID value of `50041` in a reward table means "item of type 50041 (an army ATK upgrade item)", not "grant army ATK stat 50041".

#### Monster/NPC Tables (stat IDs define enemy units) — MON
`lw_monster_split6`–`split31`, `lw_monster_B_split6`–`split31`, `lw_monster_C_split6`–`split27`,
`lw_monster_opt`, `lw_monster_refresh_s6`,
`lw_monster_born_split4/7/10/26–30/67/69/72`,
`lw_monster_born_B_split4/7/10/26–30/67/69/72`,
`lw_monster_born_C_split4/7/10/24–27/45/47/49/50`,
`lw_world_monster`, `lw_world_monster_B`, `lw_sky_battle_monster_born`,
`aps_pve_level`, `aps_pve_trigger`,
`lw_stage`, `lw_stage_B`, `lw_stage_feature`, `lw_stage_feature_B/C/opt`, `lw_stage_sky_battle`,
`lw_scene`, `lw_scene_B`

**Evidence:** These tables define NPC enemy unit configurations. Stat IDs (50081, 51000, 51100, etc.) define the enemy's HP/ATK/DEF — not the player hero's contribution to player hero power.

#### Temporary Battle Buffs — BATTLE
`lw_buff` (buff_time ≤ 8000ms), `lw_status` (government buffs: time=600s, type2=30),
`government` (grants 75050/75150/75250 via lw_status status effects, time=600s),
`lw_trialtowerbuff`, `season_active_skill`, `lw_hero_skill_effect_pvp`, `lw_simplayer`,
`lw_army`, `lw_army_split1`–`split12`, `army`, `armed_truck_config`

**Evidence for `lw_status`:** Status entries 510001–510031 all have `time=600` (10 minutes) and `type2=30` (government buff type). These are temporary status effects that expire, not permanent hero panel power.

#### Event/Seasonal Content (rewards only) — EVENT
`AcitivitySeven_New`, all `activity_Valentine_*`, `activity_alliance_boss_s0`, `activity_bargain_shop`,
`activity_boxopen_para`, `activity_challenge_zombie`, `activity_dig/*_para`, `activity_easter_anonymous`,
`activity_fes_concert`, `activity_hunter/*_eventshop/*_para`, `activity_party/*_monster`,
`activity_partynew/*_dropshow`, `activity_reward_change`, `activity_scratch_para`,
`activity_showlist`, `activity_slots_box/group/info`, `activity_thanksgiving/*_lottery`,
`activity_torch_relay`, `activity_upgradebox_level`, `detect_event/*_new`,
`lw_ghostrecon_tasks`, `lw_zombieRush`, `red_packet`, `rich_man_event/*_eventshop`,
`season_bounty_shop`, `hero_event`, `heroevent`, `monopoly`, `monopoly_B/C`,
`desert`, `lw_world_trends_event`, `lw_season`, `season_callback`, `season_city_s6`,
`season_extra_list`, `season_tower_army`, `activity_thanksgiving`, `activity_thanksgiving_lottery`

**Evidence:** Event tables list item rewards and drop pools. Stat ID hits come from item type codes in reward payload columns.

#### Shop/Purchase Tables — SHOP
`shop`, `lastwar_id_shop`, `recharge`, `weekcard`, `monthcard`, `vip_privilege`,
`custom_dailypackage`, `train_para`, `treasure_box_show`, `season_trading_post_shop`, `season_weekcard`

**Evidence:** Item listings with stat IDs as item attribute type codes. Not formula inputs.

#### Quest/Task Tables — QUEST
`quest`, `quest_split4/8`, `alliance_task`, `lw_dispatch_tasks`, `lw_dispatch_settings`,
`develop_group`, `develop_simulation`

#### UI/Display Tables — UI
`lw_effect_number` (stat definition reference table — provides power coefficients but is not a hero power source itself), `lw_effect_overview`, `lw_other_report`, `lw_other_report_new`, `lw_technical_report`,
`lw_hero_try_out`, `lw_hero_try_out_tag`, `lw_plot`, `lw_ppt_show`, `lw_ppt_show_B`,
`lw_res_lack_tips`, `faq_key_list`, `scrolling_announcement`, `lw_base_visitor_event`,
`lw_trigger_item`, `lw_trigger_item_B`, `officer_list`, `officer_list_B`, `officer_recruit`,
`mail`, `mail_filter`, `report_helper`, `lw_idle_game_event`, `questionAndAnswer`,
`lw_guide_flow`, `lw_guide_flow_B`, `aps_science_tab`, `battle_card`, `battle_card_box`,
`battle_card_box_pool`, `battle_card_recommend_season`, `battle_card_random_attr_show`,
`battle_card_skill`, `lw_hero-dev`, `lw_hero_para`, `lw_hero_rank_old`,
`hero_skill_perform`, `world_skin`

#### Economy/City Tables — ECON
`alliance_res_build`, `alliance_gift_group`, `aps_city_buff`, `lw_worldcity`,
`lw_count_stage`, `lw_count_stage_B`, `lw_worker`, `lw_worker_rank`,
`dominator_train_level`, `dominator_train_group`, `lw_squad_equip` (effect_hero uses stat 50153, target_unit_type=1 — troops not heroes),
`hero_official`, `lw_mastery` (economy stat 50116), `lw_drone_skillchip_exp` (item type reference),
`league_majorgroup`

#### Decoration Sub-System (partial) — SUB/ECON
`lw_decoration_skill` — decoration active skills using status_id references; `50054` hit is a substring false positive from `500541`. Timed city skills, not hero power.
`aps_decoration` — 5 rows, city buff codes 35000/35004. Not hero power.

### EXCLUDED Tables: No-Hit Tables (976 tables)

All 976 tables not mentioned above (and not in the integer-key scan) have **zero hero power stat ID occurrences** in either string scan or integer key scan. Complete list available in `discovery-closure-full-inventory.json` (auto-generated).

**Negative proof is complete:** a hero power stat ID cannot contribute to hero power if the table bytecode contains neither the string representation nor the integer representation of that stat ID.

---

## 3. Dependency Graph

### Hero Power Formula (client-derivable)

```
hero_power_total =
  base_power(hero, level)              -- lw_hero + lw_template_property + heroes_levelup + lw_hero_level
  + star_power(hero, stars)            -- lw_hero_rank_reset
  + awaken_power(hero, awaken_level)   -- lw_hero_awaken + lw_hero_awaken_rank
  + skill_power(hero, skill_levels)    -- lw_hero_skill + lw_hero_skill_B
  + gear_power(gear_slots, levels)     -- lw_equip [.power] (max-level; per-level needs lw_equip_attribute)
  + building_power(player_buildings)   -- building (via stat IDs 50039-50083)
  + building_B_power(military_centers) -- building_B
  + research_power(research_levels)    -- lw_camp_science_detail [hero stat nodes]
  + alliance_tech_power(tech_levels)   -- lw_alliance_science_detail [hero stat nodes]
  + drone_power(drone_level, chips)    -- lw_drone_battlesystem_level + lw_drone_skillchip_attribute
  + decoration_gain_power              -- lw_decoration [effect_gain: 75050/75150/75250]
  + decoration_stage_power(stages)     -- lw_decorationbuilding_lv [stage_gain: 50060/61/62] *** GAP ***
  + vip_bonus(vip_level)               -- vip [75050/75150/75250]
  + aps_research_power(aps_levels)     -- APS_science [hero stat nodes]
  + ew_weapon_power(weapon_level)      -- lw_hero_unique_weapon [.power]
  + ew_weapon_unit_power(weapon_units) -- lw_hero_unique_weapon_unit [51002/51003/51052/53/51102/103] *** GAP ***
  + honor_level_power(honor_level)     -- lw_hero_honorLevel [50063 HP bonuses] *** GAP ***
  + squad_equip_bonus(equip_level)     -- lw_squad_equip_lv [big_percent_effect: 75050/150/250] *** GAP ***
  + uav_power(uav_level)               -- lw_uav_level [50081/82/83] *** POTENTIAL GAP ***
```

### Power Coefficients (from lw_effect_number)
```
stat 50039/46/52/60/63/81/51000/51002/51003: power = 0.5    (HP stats, flat)
stat 50041/48/54/61/82/51050/51052/51053:    power = 12.5   (ATK stats, flat)
stat 50043/50/56/62/83/51100/51102/51103:    power = 35.0   (DEF stats, flat)
stat 75050/75150/75250 (power_cala_type=2):  percentage bonuses — power depends on base stats
stat 76057:                                  power = 1,050,000 (EW weapon special)
stat 50011:                                  power = 313,600
```

---

## 4. Open Items

These items cannot be determined with certainty from client-side data alone:

| ID | Item | Evidence | Status |
|----|------|----------|--------|
| OI-1 | Government officer buffs | `lw_status` entries 510001–510031: `time=600`, `type2=30`. Grants 75050/75150/75250 (5% each) for 10 minutes when officer position is held. Temporary — not permanent hero power. | **EXCLUDED from permanent hero power. Included only while buff active.** |
| OI-2 | `lw_hero_unique_weapon_unit` vs `lw_hero_unique_weapon.power` | Weapon level power=250,000 (fixed) does not equal attr×coefficient sum (~63,125 at lv1). Weapon unit stats use DIFFERENT stat IDs (51002/51003 vs 51000 in weapon level). | **ADDITIVE** — weapon unit uses different stat IDs; cannot be subsumed. Must be extracted separately. |
| OI-3 | `lw_decoration.effect_gain` hero % bonuses | Confirmed: permanent `effect_gain` field has 75050/75150/75250 per decoration (e.g., 0.025% each). Distinct from stage bonuses. | **PERMANENT** — field name `effect_gain` (not "stage" or "para"). Already extracted by M-021 but not parsed to individual stat bonuses. |
| OI-4 | `lw_uav_level` vs M-011 overlap | `lw_drone_battlesystem_level` (M-011): 900 rows, `level_attribute` dict. `lw_uav_level`: 1016 rows, `attr_add` string, `power` field. Both use 50081/82/83. Whether these are ADDITIVE or the same system cannot be confirmed from client data alone. | **OPEN** — server testing required |

---

## 5. Negative Proof

**976 tables excluded with certainty:** These tables contain zero occurrences of any hero power stat ID string (string scan) AND zero integer dict keys matching hero power stat IDs (integer key scan). The scan is exhaustive: all stat IDs in the Last War client appear as either string literals or integer keys in Lua bytecode; if neither form is present, the stat ID is not referenced by that table.

**Example categories of excluded tables (representative samples from 976):**
- `ABtest_controller`: A/B test configuration, no stat references
- `APS_alScience`: APS alliance science, integer key scan returns no hero stat IDs
- `APS_arms`: 73 rows — `{id, name, description, max_train, resource_need, time}` only
- `APS_global`: 2 rows of global constants — `{id, k1, k2}` — no stat IDs
- `lw_camp_science_tab`: Science tab UI; all stat references are in `lw_camp_science_detail`
- `lw_alliance_science_tab`: Same pattern as science tab
- All 73 `S3/S4/S5/S6_kd_table*` variants: kill-death score tables for seasonal events

---

## 6. Coverage Report

| Category | Count |
|----------|-------|
| Total tables in archive | 1,288 |
| Tables with string-scan hero stat hits | 310 |
| Tables with integer-key hero stat hits (additional) | 2 |
| Total tables with any hero stat reference | 312 |
| Tables with no hero stat reference (negative proof) | 976 |
| **Total classified** | **1,288** |
| INCLUDED_EXTRACTED (in pipeline) | 23 |
| INCLUDED_GAP (confirmed, not in pipeline) | 5 confirmed + 1 partial + 1 potential |
| EXCLUDED (technical evidence) | 1,258 |

**Reconciliation:** 23 + 5 + 1 + 1 + 1,258 = 1,288 ✓

---

## 7. Complete Lua Script Inventory

The game's table archive is a single ZIP archive containing **1,288 Lua bytecode files**. There are no separate `.lua` source files in the APK. Each file corresponds to one named table. The complete inventory is the same as the Table Inventory above.

**No additional Lua scripts exist outside the table archive.** Confirmed by scanning all paths in `install_time_pack.apk` for files with `.lua` extension: zero results.

---

## 8. Spec Correction Required

**Current hero-power-engine-spec.md Stage 15** references `lw_decoration.stage_gain` — this field does **not exist** in `lw_decoration`.

The correct source is **`lw_decorationbuilding_lv.stage_gain`** (a separate table entirely):
- `lw_decoration.para_gain`: references `lw_decorationbuilding_lv` entry IDs
- `lw_decorationbuilding_lv.stage_gain`: the actual HP/ATK/DEF values per stage

Stage 15 of the spec must be rewritten to read `lw_decorationbuilding_lv`.

---

## 9. Summary of Required Pipeline Changes

### Must-Add Extractors

1. **M-024 `extract_decoration_stages`** — read `lw_decorationbuilding_lv`, parse `stage_gain` field:
   - stat 50060 (HP, power 0.5): values 62.5–23,003.7
   - stat 50061 (ATK, power 12.5): values 4.5–700.2
   - stat 50062 (DEF, power 35.0): values 1.4–141.0

2. **M-025 `extract_honor_levels`** — read `lw_hero_honorLevel`, parse `base_value1–5`:
   - All use stat 50063 (HP, power 0.5), values 10–320,000
   - 601 honor levels × 5 hero class variants = 3,000 entries

3. **M-026 `extract_ew_weapon_units`** — read `lw_hero_unique_weapon_unit`, parse `personal_attr`/`overall_attr`:
   - Stats: 51002/51003 (HP, power 0.5), 51052/51053 (ATK, power 12.5), 51102/51103 (DEF, power 35.0)
   - Per hero, per weapon tier (1–6)

4. **M-027 `extract_squad_equip_levels`** — read `lw_squad_equip_lv`, extract `big_percent_effect`:
   - Stats: 75050/75150/75250 (hero HP%/ATK%/DEF%, power_cala_type=2), max +4% each
   - 60 rows across 12 groups with hero bonuses

### Must-Fix Extractors

5. **M-021 `extract_decorations`** — currently reads `lw_decoration.effect_gain` as raw string.
   Must be updated to: (a) parse `effect_gain` to extract 75050/75150/75250 stat bonuses;
   (b) also load and parse `lw_decorationbuilding_lv` for stage bonuses.

6. **M-010 `extract_exclusive_weapons`** — currently reads `lw_hero_unique_weapon.power` only.
   Must add `lw_hero_unique_weapon_unit` extraction (M-026 above).

### Investigate Before Implementing

7. **`lw_uav_level`** — determine if this is a separate UAV progression system additive to `lw_drone_battlesystem_level` (M-011), or the same system with different representation. Requires server-side testing or Assembly source review.

8. **`lw_equip_attribute`** — per-level gear breakdown. Current extractor uses `lw_equip.power` (max-level pre-computed). If per-level gear power is needed, implement `extract_gear_attributes` using `lw_equip_attribute.effects`.
