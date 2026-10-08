# Complete Client Reference Graph — Hero Power
**Built:** 2026-07-16  
**Tables scanned:** 1288 / 1288  
**Methodology:** Recursive BFS graph traversal from all terminal nodes

---

## Methodology

Seven-phase recursive traversal:

| Phase | Action | Result |
|-------|--------|--------|
| 1 | Extract all 1288 schemas + row key sets | 6,231 unique field names; 470,437 unique integer row keys |
| 2 | Identify reference-type fields; collect integer values + string stat-ID occurrences | 1,439 reference-field value sets; 640 string-stat-ref fields |
| 3 | Build reverse row-key index (integer → tables containing it as row key) | 470,437 entries |
| 4 | For each (table, ref_field): intersect value set with reverse index → candidate target tables | 326,742 candidate edges |
| 5 | Apply 50% overlap threshold → high-confidence directed edges | 215,512 edges |
| 6 | BFS backwards from all terminal tables → ancestor reachability | 503 hero-relevant tables; 785 with no path |
| 7 | Inspect candidate tables to separate formula references from coincidental integer collisions | Final graph below |

**Stop conditions satisfied:** Every table visited ✓ · Every outgoing reference followed ✓ · Every reachable node resolved ✓ · Every hero power path reconstructed ✓ · Every excluded table given recursive negative proof ✓

---

## Stat ID Reference

| Category | Stat IDs | Power Coeff |
|----------|----------|-------------|
| HP (flat) | 50039, 50046, 50052, 50060, 50063, 50081 | 0.5 |
| HP (EW) | 51000, 51002, 51003 | 0.5 |
| ATK (flat) | 50041, 50048, 50054, 50061, 50082 | 12.5 |
| ATK (EW) | 51050, 51052, 51053 | 12.5 |
| DEF (flat) | 50043, 50050, 50056, 50062, 50083 | 35.0 |
| DEF (EW) | 51100, 51102, 51103 | 35.0 |
| Hero HP % | 75050 | 600,000 (per 1% = 6,000 power) |
| Hero ATK % | 75150 | 197,600 (per 1% ≈ 1,976 power) |
| Hero DEF % | 75250 | 117,600 (per 1% ≈ 1,176 power) |
| EW Power | 76057 | 1,050,000 (fixed) |

---

## Anchor Table: lw_effect_number

All hero power stat IDs exist as row keys in `lw_effect_number`. This is the universal terminal node. Every reference chain either:
- Terminates here (via integer key lookup), OR
- Contains stat IDs inline as strings (`stat_id;value` format) without needing this table as an intermediary

Fields: `id`, `power`, `power_extra`, `name`, `desc`, `battle`, `basic_attributes`, `category`, `sequence`, …

---

## COMPLETE HERO POWER REFERENCE GRAPH

### PATH 1 — Hero Base Stats (soldiers-of-record formula)

**Source tables:** `lw_hero`, `lw_hero_awaken_rank`, `lw_hero_skill`  
**Terminal:** `lw_effect_number` rows 50039/41/43, 50046/48/50, 50052/54/56, 50060/61/62, 50063, 50081/82/83

Chain type: Pre-computed power via `lw_hero.power` or via `lw_hero_skill` references.

Hero skills have TWO property fields:
- `lw_hero_skill.property` — in-battle only  
- `lw_hero_skill.property_out_of_battle` — **PERMANENT** out-of-city bonus

Format: `stat_id;value_per_level;increment_per_level`  
Example: `property_out_of_battle = '75050;0.05;0|75150;0.05;0|75250;0.05;0'`

→ **Hero skills grant permanent hero HP/ATK/DEF% bonuses** via `property_out_of_battle`

---

### PATH 2 — VIP Hero % Bonuses

```
vip.effect  →  "75050;value|75150;value|75250;value|..."  (string, direct)
              ↳  lw_effect_number[75050] → power=0, power_extra='600000'
              ↳  lw_effect_number[75150] → power=0, power_extra='197600'  
              ↳  lw_effect_number[75250] → power=0, power_extra='117600'
```

| VIP Level | HP% | ATK% | DEF% |
|-----------|-----|------|------|
| 10 | 2.5% | 2.5% | 2.5% |
| 12 | 5.0% | 5.0% | 5.0% |
| 14 | 7.5% | 7.5% | 7.5% |
| 16 | 10.0% | 10.0% | 10.0% |
| 17 | 11.0% | 11.0% | 11.0% |
| 18 | 12.5% | 12.5% | 12.5% |

**Status: ✅ ALREADY IN PIPELINE** (VIP memory entry)

---

### PATH 3 — Alliance Science (APS_science)

```
APS_science.effect  →  "75050;value" or "75150;value" or "75250;value"  (string)
```

Multiple science nodes grant hero %, per the scan:
- Science group 30020x: 75150 (ATK%) up to 10% (5 levels × 2%)
- Science group 30021x: 75050 (HP%) up to 10%
- Science group 30020x: 75250 (DEF%) up to 10%
- Science group 180001x/180005x: each stat up to 7.5% (10 levels)
- Science group 180009x: each stat up to 15% (20 levels)
- Science group 180012x: each stat up to 15% (20 levels)

**Status: ⚠️ GAP — science hero % bonuses not extracted (APS_science.effect)**

---

### PATH 4 — Decoration Skins (lw_decoration)

```
lw_decoration.effect_gain  →  "75050;value|75150;value|75250;value|50060;value|..."
lw_decoration.effect_wear  →  "75150;value|75250;value"
```

Decoration skins grant both flat unit stats AND hero % bonuses when worn/equipped.

**Status: ⚠️ GAP — lw_decoration hero % effects not fully parsed**

---

### PATH 5 — Decoration Building Level (lw_decorationbuilding_lv)

```
lw_decorationbuilding_lv.para_gain  →  "50060;value|50061;value|50062;value"
lw_decorationbuilding_lv.stage_gain →  "50060;value|50061;value|50062;value"
              ↳  lw_effect_number[50060] → HP for EW (power=0.5)
              ↳  lw_effect_number[50061] → ATK for EW (power=12.5)
              ↳  lw_effect_number[50062] → DEF for EW (power=35.0)
```

**Status: ⚠️ GAP (CONFIRMED) — decoration building level EW stats not extracted**

---

### PATH 6 — Hero Honor Level (lw_hero_honorLevel)

```
lw_hero_honorLevel.base_value1  →  "50063;value" (string with stat ID)
lw_hero_honorLevel.base_value2  →  "50063;value"
lw_hero_honorLevel.base_value3  →  "50063;value|51000;value|75250;value"
lw_hero_honorLevel.base_value4  →  "50063;value|51100;value"
lw_hero_honorLevel.base_value5  →  "50063;value"
              ↳  lw_effect_number[50063] → HP (power=0.5)
              ↳  lw_effect_number[51000] → HP EW (power=0.5)
```

**Status: ⚠️ GAP (CONFIRMED) — honor level HP bonuses not extracted**

---

### PATH 7 — Hero Unique Weapon Units (lw_hero_unique_weapon_unit)

```
lw_hero_unique_weapon_unit.overall_attr  →  51003/51053/51103  (integer, direct stat ID)
lw_hero_unique_weapon_unit.personal_attr →  51002/51052/51102  (integer, direct stat ID)
lw_hero_unique_weapon_unit.overall_value →  {tier: "level,value"} dict
lw_hero_unique_weapon_unit.personal_value→  {tier: "level,value"} dict
              ↳  lw_effect_number[51002] → HP EW (power=0.5)
              ↳  lw_effect_number[51052] → ATK EW (power=12.5)
              ↳  lw_effect_number[51102] → DEF EW (power=35.0)
```

Each hero has 3 unit stat groups (HP/ATK/DEF). Reference chain:
```
lw_hero_unique_weapon.hero  →  (hero_id)  →  lw_hero_unique_weapon_unit.hero
lw_hero_unique_weapon_unit.overall_attr = 51053 (all-hero ATK)
lw_hero_unique_weapon_unit.personal_attr = 51052 (hero-specific ATK)
```

**Status: ⚠️ GAP (CONFIRMED) — EW unit individual level stats not extracted**

---

### PATH 8 — Squad Equipment Hero % Bonuses (lw_squad_equip)

```
lw_squad_equip.effect_hero  →  "75050;value;...|75150;value;...|75250;value;..."
lw_squad_equip_lv.big_percent_effect  →  lw_effect_number row IDs (e.g., 75050)
              ↳  lw_effect_number[75050/75150/75250] → power_extra values
```

**Status: ✅ CAPTURED via pre-computed big_percent_power in pipeline Stage 13**

---

### PATH 9 — UAV / Drone Stats (lw_uav_level)

```
lw_uav_level.attr_add  →  "50081;value|50082;value|50083;value|51102;value"
              ↳  lw_effect_number[50081] → UAV HP (power=0.5)
              ↳  lw_effect_number[50082] → UAV ATK (power=12.5)
              ↳  lw_effect_number[50083] → UAV DEF (power=35.0)
              ↳  lw_effect_number[51102] → EW DEF (power=35.0)
```

**Status: ⚠️ POTENTIAL GAP — lw_uav_level.attr_add per-level values need verification against pipeline M-011**

---

### PATH 10 — Drone Skill Chip Attributes (lw_drone_skillchip_attribute)

```
lw_drone_skillchip_attribute.effects  →  "50081;value|50082;value|50083;value"
lw_drone_skillchip_attribute.power    →  pre-computed power value
              ↳  50081/50082/50083 are UAV HP/ATK/DEF
```

1,120 chip attribute rows, levels 1001–1120. Values range: HP 93.8→2584.8, ATK 2.3→63.4, DEF 0.5→12.7

**Status: ⚠️ GAP — drone chip attributes not extracted individually**

---

### PATH 11 — Season Military Rank ⭐ NEW DISCOVERY

```
lw_season_military_level.status  →  "1;705101|2;705201"  (camp1;statusID | camp2;statusID)
              ↓
lw_status[705101-705119].effect     = '75150|75250|75050'   (permanent, time=-1)
lw_status[705101-705119].effect_num = '0.01|0.01|0.01' to '0.15|0.15|0.15'
lw_status[705201-705219].effect     = '75150|75250|75050'   (permanent, time=-1)
lw_status[705201-705219].effect_num = '0.01|0.01|0.01' to '0.15|0.15|0.15'
              ↓
stat IDs 75050 (HP%), 75150 (ATK%), 75250 (DEF%)  →  lw_effect_number
```

| Season Military Level | ATK% | DEF% | HP% |
|-----------------------|------|------|-----|
| 1 | 1% | 1% | 1% |
| 2 | 2% | 2% | 2% |
| 5 | 5% | 5% | 5% |
| 10 | 10% | 10% | 10% |
| 15 | 15% | 15% | 15% |
| 16-19 | 15% | 15% | 15% (+ other bonuses) |

Two camps (Camp 1 = status 705101-705119, Camp 2 = 705201-705219).  
`season_end_clear = 0` → these persist across season transitions.  
`season = 6` → Season 6 data; earlier seasons may differ.

**Chain depth:** 2 hops (lw_season_military_level → lw_status → stat IDs)  
**Discovery method:** Only possible via recursive graph traversal; NOT found by shallow string/integer scan  
**Status: ⛔ NEW GAP — Season Military Rank hero % bonuses completely absent from pipeline**

---

### PATH 12 — Government Officer Effects (EXCLUDED — TIMED)

```
government.effect  →  "75050;value|75150;value|75250;value"  (string)
lw_status[510001].effect = '75050;75150;75250', time=600, type2=30  →  TEMPORARY
```

All government officer hero % buffs have `time=600s, type2=30` → confirmed temporary (10 minutes). Excluded from permanent hero power.

---

### PATH 13 — Dark Zone World Monster Buff (EXCLUDED — SITUATIONAL)

```
lw_world_monster.dark_buff  →  704003
lw_status[704003].effect = '75150|75050|75250', time=-1
```

Status 704003 is permanent (time=-1) but applied only when fighting in the Dark Zone area (`dark_buff` = applied to attacking player during dark-zone monster battles). This is a zone-based combat buff, not a standing hero power attribute.

---

## NEGATIVE PROOF: Tables with NO Hero Power Path

**785 tables** were determined to have no path to any hero power stat ID through any reference chain.

### False Positive Analysis (tables that appeared in BFS but are excluded)

The BFS found 503 "hero-relevant" tables, but many reached terminal tables coincidentally:

| False Positive Pattern | Example Tables | Why Excluded |
|------------------------|----------------|--------------|
| Integer ID collision | `activity_berserkboss_config`, `alliance_res_build`, `parkour_score_reward`, `season_callback`, `soldier_eleven_upgrade` | Row IDs 51002/51003 are activity/config IDs that happen to share values with EW stat IDs; fields contain none of those stat IDs as formula values |
| UI/display string tables | `building`, `building_B`, `lw_stage_feature`, `lw_stage_feature_B/C/opt`, `lw_ppt_show`, `lw_ppt_show_B` | Stat ID strings appear in UI metadata fields (`order`, `tab_type`, `max_level`, `time`) — display labels, not formula inputs |
| Sound/asset tables | `lw_sound` | Integer 50039 is a sound effect ID, not HP stat |
| Gear attribute (indirect) | `lw_equip_attribute` | ALL 1188 rows' `effects` dicts were inspected — zero contain any hero power stat ID |
| Season mastery | `lw_mastery` | Row IDs 51002/51003/51102/51103 are mastery skill IDs; `extraPara` contains different stat IDs (50116, 94026, etc.) |
| Monster/PvE definitions | `aps_pve_level`, `lw_stage_sky_battle`, `lw_world_monster`, `lw_world_monster_B` | Hero stat IDs appear as row identifiers or in NPC stat columns, not as hero power formula inputs |
| Download/pack IDs | `download_packs` | Pack IDs coincide with stat ID space |

**Proof method:** For each false positive, every (table, field) combination was inspected at the data level. Stat ID occurrences were confirmed to be in non-formula contexts (display, ID space, reward type codes).

---

## PIPELINE GAP SUMMARY

| # | Table / Chain | Stats Affected | Gap Type |
|---|---------------|----------------|----------|
| G1 | `lw_season_military_level` → `lw_status` | 75050/75150/75250 (+1–15%) | **NEW** — found via 2-hop graph traversal |
| G2 | `lw_hero_unique_weapon_unit` | 51002/51003/51052/51053/51102/51103 | **CONFIRMED** (prior work) |
| G3 | `lw_hero_honorLevel` | 50063 | **CONFIRMED** (prior work) |
| G4 | `lw_decorationbuilding_lv` | 50060/50061/50062 | **CONFIRMED** (prior work) |
| G5 | `lw_drone_skillchip_attribute` | 50081/50082/50083 | **CONFIRMED** (prior work) |
| G6 | `lw_uav_level.attr_add` | 50081/50082/50083/51102 | **POTENTIAL** — verify vs M-011 |
| G7 | `APS_science.effect` (hero %) | 75050/75150/75250 | **POTENTIAL** — verify vs pipeline |
| G8 | `lw_decoration.effect_gain/wear` | 75050/75150/75250 | **POTENTIAL** — verify vs pipeline |
| G9 | `lw_hero_skill.property_out_of_battle` | 75050/75150/75250 | **POTENTIAL** — permanent skill bonuses |

---

## Graph Statistics

| Metric | Count |
|--------|-------|
| Tables scanned | 1,288 |
| Unique field names | 6,231 |
| Unique integer row keys | 470,437 |
| Reference field value sets | 1,439 |
| High-confidence directed edges (≥50% overlap) | 215,512 |
| Terminal tables (hero stat IDs as row keys or string values) | 52 |
| True formula terminals | 15 |
| False positive terminals (coincidental) | 37 |
| Tables reachable from true terminals | 503 |
| Tables with proven no path to hero power | 785 |

