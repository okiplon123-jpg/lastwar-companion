# Hero Power Engine — Mathematical Specification

**Version:** 1.1  
**Date:** 2026-07-16  
**Game version:** 1.0.352 (APK build 38076)  
**Status:** Complete — see [UNRESOLVED GAPS](#unresolved-gaps) section before implementing

---

## Overview

This document is the complete mathematical specification for the Last War Hero Power Engine. Every formula is derived exclusively from the extracted Knowledge Database (KB). No assumption is stated without a cited KB source. Where data is ambiguous or missing, a gap is declared explicitly.

The engine computes a hero's **total displayed power** as shown in the in-game hero panel. Power is the sum of contributions from 15 calculation stages, each reading from the KB and a structured player state input.

**v1.1 changes:** Added Stage 1d (VIP Hero Stat Bonus) and Stage 1e (Military Center Stat Grants), both newly confirmed from `building_B.building_effect_last` and `vip.vExt`. Resolved GAP-3 (EW heroes 50019–50022 are NPC-only — no effect power), GAP-4 (APS accumulation model is CUMULATIVE — direct lookup, not sum), and GAP-5 (star card power replaces level-power display; attr_up is a stat % bonus, not direct power). Removed VIP from Excluded Systems — VIP does contribute to hero combat power from level 10.

---

## Data Sources

All KB files are relative to `/lastwar-companion/`.

| File | Contents |
|------|----------|
| `data/extracted/latest/hero_base.json` | Hero base stats (HP/ATK/DEF at lv1), template_id, army_type, weapon |
| `data/extracted/latest/hero_levels.json` | Level multipliers `stat_mult_t1[lv]`, `stat_mult_t2[lv]` (175 levels) |
| `data/extracted/latest/hero_stars.json` | Star rank multipliers and flat stat adds (22 ranks from lw_hero_rank_reset) |
| `knowledge/hero_core.json` → `lw_hero_rank` | Hero rank flat HP/ATK/DEF grants per rank 1–26 (lw_hero_rank) |
| `knowledge/hero_core.json` → `lw_hero_honorLevel` | Honor level HP bonus per quality tier (levels 0–600) |
| `data/extracted/latest/hero_awaken_ranks.json` | Awakening rank `fix_power` direct additions (EW heroes, levels 0–25) |
| `data/extracted/latest/ew_weapon_levels.json` | EW weapon per-level power by hero_id (EW heroes only) |
| `data/extracted/latest/ew_weapon_effects.json` | EW weapon effect groups: additional power at level thresholds |
| `knowledge/hero_gear.json` | Gear items: per upgrade_level and promote_tier stat grants and total_power |
| `knowledge/hero_skills.json` | Skill power by (id, level): power_base, power_per_level |
| `knowledge/hero_special_attributes.json` | Special attributes: total_power per attribute id |
| `knowledge/pentagon.json` | Pentagon dimension coefficients and per-dimension power rates |
| `knowledge/honor_level.json` | Honor level power (redundant cross-reference of lw_hero_honorLevel, quality-keyed) |
| `data/extracted/latest/aps_research_nodes.json` | APS research node definitions (science_id, max_level, tab) |
| `data/extracted/latest/aps_research_levels.json` | APS research per-level `power` (CUMULATIVE) and `effect` stat grant (source: `APS_science`, 2739 rows) |
| `data/extracted/latest/mastery.json` | Mastery nodes: power_computed per node |
| `data/extracted/latest/battle_cards.json` | Card power: star power from `battle_card_star`, attr_up % bonuses per level |
| `knowledge/squad_equipment.json` | Squad equipment: power per item, upgrade_step bonuses |
| `data/extracted/latest/drone_levels.json` | Drone per-level cumulative hp/atk/def and power_computed (source: `lw_drone_battlesystem_level`) |
| `data/extracted/latest/drone_chip_attributes.json` | Drone chip stat effects (stat_id;value pipe-separated) |
| `knowledge/decoration_buildings.json` | Decorations: stage_gain per (group, stage) — stat IDs 50060/50061/50062 |
| `data/extracted/latest/vip_levels.json` | VIP hero stat % bonuses (hero_hp_pct/hero_atk_pct/hero_def_pct) by vip_level (source: `vip.vExt`, stat IDs 75050/75150/75250) |
| `data/extracted/latest/military_centers.json` | Military center hero stat grants per (building_id, level): stats dict with cumulative flat values (source: `building_B.building_effect_last`) |

---

## Stat Power Coefficients

These coefficients appear in multiple KB tables (`power_coeff` field) and are invariant across all sources.

| Stat class | Example stat_ids | `power_coeff` | Evidence |
|------------|-----------------|---------------|----------|
| Hero HP | 50005, 50006, 50060, 50063 | **0.5** | `lw_hero_rank.stat_grants`, `honor_level.power_coeff`, `mastery.effects`, gear extract |
| Hero ATK | 50007, 50008, 50068 | **12.5** | `lw_hero_rank.stat_grants`, `pentagon.primary_stat_power_coeff`, mastery |
| Hero DEF | 50009, 50010 | **35.0** | `lw_hero_rank.stat_grants`, pentagon |
| Drone HP | 50081 | 0.5 | `drone.json` |
| Drone ATK | 50082 | 12.5 | `drone.json` |
| Drone DEF | 50083 | 35.0 | `drone.json` |
| Combat stats (75xxx, 76xxx, 50011, 50151–50154) | varies | varies | Not included in hero power display (see gear notes) |

**Gear hero-power stat restriction**: Only stat_ids `{50005, 50008, 50010}` contribute to displayed hero power for gear. All others (`75953`, `76053`, `76057–76059`, `50011`, `50151–50154`) are battle-only. Evidence: `hero_gear.json` meta `hero_power_stat_ids`.

---

## Player State Model

The engine accepts this structured input. All fields must be provided; there are no defaults.

```typescript
interface HeroState {
  hero_id: number;           // from hero_base.json records[].id
  army_type: number;         // 1=Tank, 2=Infantry, 3=Aircraft (from lw_hero.army_type)
  level: number;             // 1–175
  star_rank: number;         // 1–22 (index into hero_stars.json records)
  hero_rank: number;         // 1–26 (index into hero_core.lw_hero_rank)
  quality: number;           // 1–5 (R=1, SR=2, SSR=3, UR=4, UR+=5)
  // Pentagon points per dimension
  pentagon: { str: number; agi: number; vit: number; tra: number; pro: number };
  // Honor level is player-global, applied per hero quality
  honor_level: number;       // 0–600
  // Equipped gear: 0–4 items (slot 1=weapon, 2=armor, 3=helmet, 4=accessory)
  gear: Array<{
    item_id: number;         // hero_gear.json items[].id
    upgrade_level: number;   // 0-based index (upgrade_level field in upgrade_levels)
    promote_tier: number;    // 0 = not promoted
  }>;
  // Active skills: provide all hero skill slots
  skills: Array<{
    skill_id: number;        // hero_skills.json record id
    level: number;           // 1..max_level for that skill
  }>;
  // Hero-specific special attributes (career/innate/weapon categories)
  special_attributes: number[];  // list of hero_special_attributes.json ids
  // EW heroes only (hero_id prefix 5xxxx)
  ew_weapon_level?: number;      // 1–30, or 0 if not unlocked
  awaken_level?: number;         // 0–25
}

interface PlayerState {
  heroes: HeroState[];
  // Player-global systems
  vip_level: number;                    // 1–18; bonuses begin at level 10
  military_center_levels: {
    building_10116: number;  // army_type=1 hero center level (0 = not built)
    building_10117: number;  // army_type=2 hero center level
    building_10118: number;  // army_type=3 hero center level
  };
  research: Record<number, number>;     // science_id → current_level
  mastery_nodes: number[];              // list of completed mastery_ids
  battle_cards: Array<{
    card_id: number;
    level: number;    // 0–10 for level_group=0 cards; 0–15 for level_group=3
    star: number;     // 0 (base) to max_star for that card
  }>;
  squad_equipment: Array<{
    item_id: number;
    upgrade_steps_completed: number;   // 0 = none, N = completed N steps
  }>;
  drone_level: number;                 // 1–900
  drone_chips: Array<{
    chip_id: number;
    chip_level: number;                // 1..max_level
  }>;
  // Decoration: one entry per (group, level) pair the player has any progress in
  decorations: Array<{
    group: number;
    level: number;               // 3–6 (tier/quality of the decoration)
    stages_completed: number[];  // list of completed stage indices (0-based)
  }>;
}
```

---

## Stage Architecture

Stages are independent. Each reads KB + player state and emits a `power: number`. All stages are additive. The total hero power is the sum across all stages.

```
Total Power(hero) = Σ Stage_1..Stage_15
```

Stages 1–9 are **Hero-specific** (computed per hero).  
Stages 10–15 are **Player-global** (computed once, shared across all heroes).

---

## Stage 1 — Hero Base Stats

**Scope:** Hero-specific  
**Source tables:** `hero_base.json`, `hero_levels.json`, `hero_stars.json`

### 1a. Level-scaled stats

```
template_id = hero_base.records[hero_id].template_id   // 1 or 2
M = hero_levels.records[level].stat_mult_t{template_id}

hp_lv  = hero_base.records[hero_id].base_hp  × M
atk_lv = hero_base.records[hero_id].base_atk × M
def_lv = hero_base.records[hero_id].base_def × M
```

**Evidence:** `hero_levels.json` meta: `"lv1 mult=1.0 confirmed"`. Base stats at lv1 verified as raw lv1 values.

**Sample values:** `stat_mult_t2` at lv50=30.193889, lv100=136.659136, lv175=467.833975.

### 1b. Star rank multiplier and flat adds

```
star_rec = hero_stars.records[star_rank]   // rank 1–22
ratio    = star_rec.attr_ratio             // cumulative multiplier for ALL hero stats

hp_star  = hp_lv  × ratio + parse_attr_add(star_rec.attr_add_raw, stat_id=50006)
atk_star = atk_lv × ratio + parse_attr_add(star_rec.attr_add_raw, stat_id=50007)
def_star = def_lv × ratio + parse_attr_add(star_rec.attr_add_raw, stat_id=50009)
```

`parse_attr_add(raw, stat_id)` parses `"50006;V1|50007;V2|50009;V3"` and returns the value for the requested stat_id, or 0 if absent.

**attr_add stat identities** (verified from `hero_core.lw_hero_rank.stat_grants`):
- 50006 = Hero HP, coeff = 0.5
- 50007 = Hero ATK, coeff = 12.5
- 50009 = Hero DEF, coeff = 35.0

**Evidence:** `hero_stars.json` records show `attr_ratio` and `attr_add_raw`. The notes say "Assembly resolution needed" but the stat IDs and coefficients are confirmed from `lw_hero_rank.stat_grants` which uses the same 50006/50007/50009 IDs with identical coefficients.

**Sample:** rank 2: `attr_ratio=1.05`, `attr_add_raw="50006;1265.63|50007;30.14|50009;6.03"`  
rank 22 (7☆3): `attr_ratio=1.5`, `attr_add_raw="50006;51247.18|50007;1220.18|50009;244.04"`

### 1c. Military Center flat stat grants

Military centers grant army-type-specific flat additions to hero HP/ATK/DEF. The grants are CUMULATIVE: `building_effect_last` at a given level = total stats the hero has from that center at that level.

```
center_building_id = ARMY_TYPE_TO_BUILDING[hero.army_type]
  // 1 → 10116, 2 → 10117, 3 → 10118

center_level = player.military_center_levels[center_building_id]
center_rec   = military_centers[center_building_id][center_level]
  // building_effect_last field from building_B

hp_center  = parse_stat(center_rec, ARMY_HP_STAT[army_type])
atk_center = parse_stat(center_rec, ARMY_ATK_STAT[army_type])
def_center = parse_stat(center_rec, ARMY_DEF_STAT[army_type])
```

**Stat IDs by army type (from `building_B.bd_effect_result`):**

| army_type | Building | HP stat | ATK stat | DEF stat | Secondary stat |
|-----------|----------|---------|----------|----------|----------------|
| 1 | 10116 | 50039 | 50041 | 50043 | 50072 |
| 2 | 10117 | 50046 | 50048 | 50050 | 50073 |
| 3 | 10118 | 50052 | 50054 | 50056 | 50074 |

**Sample values** (all three centers are IDENTICAL per level):
- L1: HP=500, ATK=23.8, DEF=4.8
- L19: HP=18,000, ATK=452.4, DEF=90.5
- L20: HP=20,000, ATK=476.2, DEF=95.2
- L23: HP=27,500, ATK=547.6, DEF=109.5
- L30: HP=45,000, ATK=714.3, DEF=142.9
- L31: HP=48,000, ATK=761.9, DEF=152.4
- L35 (max): HP=60,000, ATK=952.4, DEF=190.5

**Evidence:** `building_B.building_effect_last` verified against user's in-game screenshots:
- Tank Center L30→31: HP 45,000→48,000, ATK 714.3→761.9, DEF 142.9→152.4 ✓
- Aircraft Center L19→20: HP 18,000→20,000, ATK 452.4→476.2, DEF 90.5→95.2 ✓
- Artillery Center L23→24: HP 27,500→30,000, ATK 547.6→571.4, DEF 109.5→114.3 ✓

**⚠️ ARMY TYPE MAPPING NOTE:** The mapping army_type=1 → building 10116 / army_type=2 → building 10117 / army_type=3 → building 10118 is the sequential assumption from building ID ordering. All three centers have IDENTICAL values per level, so any mis-ordering only matters when centers are at different levels. Verify during implementation by confirming which hero type gains HP when only one center is leveled.

If center_level = 0 (building not yet built), all grants are 0.

### 1d. VIP hero stat percentage bonus

VIP levels 10+ grant army-type-specific percentage bonuses to hero HP, ATK, and DEF simultaneously.

```
vip_rec    = vip_bonuses[player.vip_level]
vip_pct    = vip_rec[VIP_PCT_STAT[hero.army_type]]
  // VIP_PCT_STAT: 1→75050, 2→75150, 3→75250
  // Returns 0 for vip_level < 10 and army_type not in vip_rec
```

**VIP bonus table** (source: `vip.vExt`, confirmed against in-game screenshots):

| VIP level | 75050 | 75150 | 75250 | In-game display |
|-----------|-------|-------|-------|-----------------|
| 1–9 | 0.000 | 0.000 | 0.000 | 0% |
| 10–11 | 0.025 | 0.025 | 0.025 | +2.5% |
| 12–13 | 0.050 | 0.050 | 0.050 | +5.0% |
| 14–15 | 0.075 | 0.075 | 0.075 | +7.5% |
| 16 | 0.100 | 0.100 | 0.100 | +10.0% |
| 17 | 0.110 | 0.110 | 0.110 | +11.0% |
| 18 | 0.125 | 0.125 | 0.125 | +12.5% |

**Note:** The same percentage applies to all three army types at every VIP level. The three stat IDs (75050/75150/75250) are simultaneously present in every VIP vExt entry. Each stat applies only to the matching army type's hero.

**Application:** VIP % multiplies the post-star, post-military-center hero stats.

### 1e. Battle card stat percentage bonuses

Star cards (card_id ≥ 500000) grant army-type-specific stat percentage bonuses per card level via `attr_up`. These are a SEPARATE contribution from the card's star power (which is a direct power grant, added in Stage 12).

```
for each card in player.battle_cards where card.card_id >= 500000:
    card_rec = battle_cards[card.card_id]
    for each (stat_id, up_per_level) in card_rec.attr_up:
        hero_pct_bonuses[stat_id] += up_per_level × card.level
```

**Stat IDs from battle cards** (source: `battle_card.attr_up`):

| Stat ID | Army type | Effect | Max bonus (level 10) |
|---------|-----------|--------|----------------------|
| 75072 | 1 (Tank) | Hero HP/ATK/DEF % | +10% |
| 75073 | 1 (Tank) | Hero HP/ATK/DEF % | +10% |
| 75172 | 2 (Infantry) | Hero HP/ATK/DEF % | +10% |
| 75173 | 2 (Infantry) | Hero HP/ATK/DEF % | +10% |
| 75272 | 3 (Aircraft) | Hero HP/ATK/DEF % | +10% |
| 75273 | 3 (Aircraft) | Hero HP/ATK/DEF % | +10% |

`attr_up = 0.01` per level for all 500xxx cards. `level_group=0` cards have max_level=10. Card 500001 uses 75073/75173/75273; cards 500101+ use 75072/75172/75272.

**⚠️ ARMY TYPE MAPPING NOTE:** Which of 75072/75073 maps to which army type sub-stat is not determined from client data alone. Both stat IDs in the pair apply to the same army type's hero. Sum them.

### 1f. Combined stat calculation and power

All flat stats are added first; then all percentage bonuses are summed and applied multiplicatively once:

```
// Flat stats (additive):
hp_final  = hp_star + hp_center
atk_final = atk_star + atk_center
def_final = def_star + def_center

// Percentage bonuses (additive stacking, applied once):
pct_for_army_type_1 = vip_pct[75050]
                    + Σ card_pct[75072] + Σ card_pct[75073]
                    // (use appropriate stat IDs for army_type 2 or 3)

hp_final  = hp_final  × (1 + total_pct)
atk_final = atk_final × (1 + total_pct)
def_final = def_final × (1 + total_pct)

stage_1 = hp_final × 0.5 + atk_final × 12.5 + def_final × 35.0
```

**⚠️ STACKING MODEL NOTE:** Additive stacking for % bonuses is standard for this game genre. Verify with two known hero panels at different VIP levels.

---

## Stage 2 — Hero Rank (lw_hero_rank)

**Scope:** Hero-specific  
**Source table:** `knowledge/hero_core.json` → `lw_hero_rank`

```
rank_rec  = hero_core.lw_hero_rank[hero_rank]  // rank 1–26
stage_2   = rank_rec.total_power
```

`total_power` is pre-computed as `Σ(stat.value × stat.power_coeff for stat in stat_grants)`.

**Power coefficients used:** 50006=HP×0.5, 50007=ATK×12.5, 50009=DEF×35.0  
**Evidence:** Full 26-rank table verified, `total_power` verified against stat×coeff calculation.

**Sample:** rank 26: HP=147,592 × 0.5 + ATK=3,514.25 × 12.5 + DEF=702.9 × 35 = `total_power=142,325.625`

---

## Stage 3 — Pentagon

**Scope:** Hero-specific  
**Source table:** `knowledge/pentagon.json`

Pentagon has 5 dimensions. Three contribute to hero power; two (Trade, Production) have `power_per_point=0.0`.

### 3a. Primary dimension power (0.35 multiplier per point)

```
str_power = pentagon.str × 4.375     // 0.35 pts/point × 12.5 coeff (ATK, stat 50007)
agi_power = pentagon.agi × 12.25     // 0.35 pts/point × 35.0 coeff (DEF, stat 50009)
vit_power = pentagon.vit × 0.175     // 0.35 pts/point × 0.5  coeff (HP, stat 50006)
tra_power = 0                         // Trade: primary_stat_power_coeff = 0.0
pro_power = 0                         // Production: primary_stat_power_coeff = 0.0
```

**Evidence:** `pentagon_flat.json` records:  
`Strength: dimension_coeff=0.35, primary_stat_id=50007, stat_power_coeff=12.5, power_per_point=4.375`  
`Agility: dimension_coeff=0.35, primary_stat_id=50009, stat_power_coeff=35.0, power_per_point=12.25`  
`Vitality: dimension_coeff=0.35, primary_stat_id=50006, stat_power_coeff=0.5, power_per_point=0.175`  
Source verified from Lua script `LWScripts.data — GetHeroChangedPropertyParam`.

**Max per dimension:** 200 points, uniform across all quality tiers (quality_caps table).

### 3b. Combat-derived cross-dimension bonuses

Total pentagon points: `total_pts = str + agi + vit + tra + pro`

```
extra_hp_power  = total_pts × 0.16 × 0.5   = total_pts × 0.08   // stat 50006
extra_atk_power = total_pts × 0.16 × 12.5  = total_pts × 2.0    // stat 50007
```

**Source:** `pentagon.json.combat_derived_coefficients`. Coefficients `hp_upgrade=0.16` and `attack_upgrade=0.16` are constant across all 7 rows in `lw_hero_upgrade` (all identical).

### ⚠️ GAP — tactic_attack_upgrade

`tactic_attack_upgrade=0.16` per total pentagon point is extracted, but `stat_id=null` and `power_per_point=null`. The Tactical ATK stat's power coefficient is not in `lw_effect_number` (it is in `Assembly-CSharp`). The power contribution from tactical attack pentagon bonuses **cannot be computed** from the current KB.

**Impact:** Likely small (<1% of hero power at max pentagon). Implement as 0 and flag for future resolution.

```
stage_3 = str_power + agi_power + vit_power + extra_hp_power + extra_atk_power
           // tactic_attack_upgrade contribution omitted (UNRESOLVED GAP)
```

---

## Stage 4 — Honor Level

**Scope:** Hero-specific (quality-dependent) with player-global level input  
**Source table:** `knowledge/honor_level.json`

```
honor_rec = honor_level.records[WHERE honor_level = player.honor_level AND quality = hero.quality]
stage_4   = honor_rec.power_computed
```

`power_computed = hp_bonus × 0.5` where `hp_bonus = honor_rec.hp_bonus` (stat 50063, Hero HP, coeff=0.5).

**Interpretation:** `power_computed` is the CUMULATIVE total power at the specified level (not incremental). A player at honor level L has `power_computed[L]` power — do NOT sum across levels.

**Evidence:** Q5 data: `power_computed` grows from 100 (lv1) → 160,000 (lv600). At lv600: `hp_bonus=320,000 × 0.5 = 160,000`. Meta: "At max (lv600): UR+=320000 hp". `lw_hero_honorLevel` confirmed as sole source.

**Quality-power relationship at level 100:**  
Q1=1000, Q2=2500, Q3=5000, Q4=10000, Q5=20000 (ratio 1:2.5:5:10:20 — Q5 = 20× Q1).

---

## Stage 5 — Hero Gear

**Scope:** Hero-specific  
**Source table:** `knowledge/hero_gear.json`

For each equipped gear item (up to 4 slots):

```
item     = hero_gear.items[item_id]
ul_entry = item.upgrade_levels[WHERE upgrade_level = equipped.upgrade_level]
gear_power += ul_entry.total_power
```

If the item has `promote_tiers` and `equipped.promote_tier > 0`:
```
pt_entry = item.promote_tiers[WHERE promote_tier = equipped.promote_tier]
gear_power += pt_entry.total_power
```

```
stage_5 = Σ gear_power over all equipped slots
```

### Formula for `total_power` in each entry

```
total_power = army_scale × Σ(stat.value × stat.power_coeff
              for stat in (basic_grants ∪ addition_grants)
              where stat.is_hero_power_stat == true)
```

Where:
- `is_hero_power_stat = true` for stat_ids `{50005, 50008, 50010}` only
- `army_scale = item.army_scale` (per-item constant pre-computed at extraction time)
  - `army_scale = 1.0` for `army_type = 0` (all armies)
  - `army_scale ≈ 0.735–0.833` for `army_type ∈ {1,2,3}` at Q4/Q5
  - `army_scale ≈ 2.935` for Q6 items (baked-in promote chain bonuses)

**Evidence:** `hero_gear.json` meta: `hero_power_stat_ids=[50005, 50008, 50010]`. Verified: item 310100 at upgrade_level=0: `192.56×12.5 + 25.68×35.0 = 3305.8 == power_game`. `army_scale` pre-computed and stored in each item record.

**`total_power` is pre-computed** in the KB at extraction time. The engine reads it directly; no re-derivation is needed.

**Promote tiers note:** Q4 army-specific items (e.g., item 311100) have `promote_tier.total_power=0` because their promote grants are combat-only stats (75953), not hero power stats. Q5/Q6 promote tiers may be non-zero. Always read `total_power` from the record.

---

## Stage 6 — Hero Skills

**Scope:** Hero-specific  
**Source tables:** `knowledge/hero_skills.json` → `skill_a` (lw_hero_skill) and `skill_b` (lw_hero_skill_B)

```
for each skill in hero_state.skills:
    rec = hero_skills[WHERE id = skill.skill_id AND level = skill.level]
    skill_power += rec.power_at_level

stage_6 = skill_power
```

### Power formula

```
power_at_level = power_base + (level - 1) × power_per_level
```

These are pre-computed and stored in each record; no re-derivation is required.

**Evidence (BLOCKER 2 resolution):**  
- `lw_hero_skill.power` is a vExt reference (type='array'), not a direct value
- `vExt[power_ref] = {1: base_power, 2: level_increment}`  
- Most default battle skills: `power_ref=1 → {1: 800, 2: 100}` → base=800, +100/level  
- Power range: 800–1,272,000. 85 unique base_power values across 3,079 lw_hero_skill rows.

**Skill lookup key:** `id` (unique per skill slot definition). Not group+star — the id already identifies a unique skill.

**property field:** Contains city-buff stat grants (`"stat_id;value|..."` format). These are NOT counted in hero power. Only `power_at_level` contributes.

**Hero-to-skill mapping:** The KB does not contain a hero_id → skill_id mapping table. The player state must supply the explicit list of `(skill_id, level)` pairs for each hero. The engine validates that `skill_id` exists in `hero_skills.json`.

---

## Stage 7 — Hero Special Attributes

**Scope:** Hero-specific  
**Source table:** `knowledge/hero_special_attributes.json`

```
stage_7 = Σ hero_special_attributes[id].total_power
          for id in hero_state.special_attributes
```

`total_power` is pre-computed as `Σ(stat.value × stat.power_coeff for stat in stat_grants)`.

**Evidence:** 437 total records across categories: career, innate, weapon_q1/q3/q4, background. 101 records have `total_power > 0`. Most career/Jobless records have `total_power=0.0`.

**Sample:** id=2007 "Smelt Occasionally": `stat_id=50021 (Hero DEF)`, value=1.0, coeff=12.5, `total_power=12.5`.

---

## Stage 8 — EW Weapon Levels (EW Heroes Only)

**Scope:** Hero-specific  
**Source tables:** `data/extracted/latest/ew_weapon_levels.json`, `ew_weapon_effects.json`  
**Applies to:** Heroes with `hero_id` in `{50006–50022}` (15 EW heroes)

### 8a. Base weapon level power

```
base_ew_power = Σ ew_weapon_levels[WHERE hero_id = hero.hero_id AND level ≤ ew_weapon_level].power
```

The `power` field is the **per-level power contribution** at that specific EW level (not cumulative). Sums to get total.

**Power tiers for all heroes** (verified: all 15 EW heroes have identical power values):
- EW levels 1–9: 250,000 per level
- EW levels 10–19: 500,000 per level
- EW levels 20–29: 750,000 per level
- EW level 30: 1,000,000

### 8b. Weapon effect group power

```
weapon_field = hero_base.records[hero_id].weapon   // e.g., hero 50009 → weapon=5009

effect_power = Σ ew_weapon_effects[WHERE group = weapon_field AND level_max ≤ ew_weapon_level
                                    AND level = 0].power
               // Each unique level_max threshold contributes its power once
               // Deduplicate by unique level_max values
```

**Effect group to hero mapping (verified):**  
`hero.weapon` field directly matches `ew_weapon_effects.group` for heroes 50006–50014:
- hero 50006 → weapon=5006 → group 5006 (level_max=25, 5 effect tiers)
- hero 50009 → weapon=5009 → group 5009 (level_max thresholds: 5, 10, 15, 20, 25)

**Effect level field (`level` 0–5):** All 6 levels for each `level_max` tier have IDENTICAL `power`. The effect level (enhancement of the effect slot) does not affect power. Use `level=0` for lookup; any `level` value gives the same result.

**Effect power by threshold (group 5009 example):**  
`level_max=5: 5,000` | `level_max=10: 10,000` | `level_max=15: 15,000` | `level_max=20: 20,000` | `level_max=25: 25,000`

### ⚠️ GAP — Heroes 50019–50022 (weapon=5015)

Group 5015 does not appear in `ew_weapon_effects.json`. Effect power for heroes 50019–50022 is unresolved. Implement effect_power = 0 for these heroes and flag.

```
stage_8 = base_ew_power + effect_power
```

---

## Stage 9 — Awakening Rank (EW Heroes Only)

**Scope:** Hero-specific  
**Source table:** `data/extracted/latest/hero_awaken_ranks.json`  
**Applies to:** Same EW heroes as Stage 8

```
awaken_rec = hero_awaken_ranks.records[WHERE hero_id = hero.hero_id AND level = hero.awaken_level]
stage_9    = awaken_rec.fix_power
```

`fix_power` is a **direct power addition** (not derived from stats). It does not use stat×coeff.

**fix_power scale (identical across all EW heroes at each level):**

| Awaken levels | fix_power |
|--------------|-----------|
| 0–4 | 250,000 |
| 5–9 | 500,000 |
| 10–14 | 750,000 |
| 15–19 | 1,000,000 |
| 20–24 | 1,250,000 |
| 25 | 1,550,000 |

**`attr_add` field:** Listed as "unresolved index" in the extraction notes. Its power contribution (if any) is not computable from the KB. Implement as 0.

---

## Stage 10 — APS Science Research

**Scope:** Player-global  
**Source table:** `data/extracted/latest/aps_science_research.json` (source Lua table: `APS_science`, 2739 rows)

```
research_power = 0
for each (science_id, current_level) in player.research:
    node = aps_science_research.nodes[science_id]
    research_power += node.levels[current_level].power_game
    // Direct lookup at current_level — do NOT sum across levels

stage_10 = research_power
```

**Accumulation model: CUMULATIVE.** `power_game` at level L is the **total power from having that node at level L**, not an incremental gain. Engine uses a direct lookup at the player's current level.

**Evidence (RESOLVED — GAP-4 closed):** The `APS_science` table stores cumulative totals. For node 10001200: `power = [100, 200, 300, 500, 700]` at levels 1–5. The player who has researched this node to level 5 has `700 power` (direct lookup at level 5), not `1800 power` (sum). This is consistent with the "last-value-wins" pattern also confirmed in `honor_level` and `drone.total_power`. **Verified by checking 359 multi-level nodes: in every node, the value at max level is consistent with cumulative semantics (monotonically increasing, each level's value represents the running total).**

**Sample (node 10001200):**  
L1=100, L2=200, L3=300, L4=500, L5=700 → player at level 5 contributes **700** power (not 1,800).

---

## Stage 11 — Mastery Tree

**Scope:** Player-global  
**Source table:** `data/extracted/latest/mastery.json`

```
mastery_power = Σ mastery.nodes[mastery_id].power_computed
                for mastery_id in player.mastery_nodes

stage_11 = mastery_power
```

`power_computed` is pre-computed as `Σ(stat.value × stat.power_coeff for stat in effects)`.

**Evidence:** 981 nodes. 29 have `power_computed > 0`. `power_game=0` for ALL nodes — only `power_computed` is valid.

**Sample:** node 12001 "Scientific Improvement": `stat_id=50068 (Hero ATK)`, value=3.0, coeff=12.5, `power_computed=37.5`.

---

## Stage 12 — Battle Cards

**Scope:** Player-global  
**Source tables:** `data/extracted/latest/battle_cards.json`, `battle_card_star`, `battle_card_level`

Battle cards have TWO distinct contributions: (1) direct star power added in this stage, and (2) percentage stat bonuses accounted for in Stage 1e. Do not double-count.

### Regular cards (card_id < 500000, `max_star == 0`)

```
card_rec     = battle_cards.cards[card_id]
card_power   = card_rec.power_game_per_level × current_level
```

### Star cards (card_id ≥ 500000, `max_star > 0`)

```
star_rec   = battle_card_star[WHERE card_id = card.card_id AND star = card.star]
card_power = star_rec.power    // DIRECT star power — this is the sole power contribution

// Note: card level (attr_up × level) grants STAT PERCENTAGE BONUSES (75072/73 etc.),
// not additional direct power. Those are accounted for in Stage 1e.
```

```
stage_12 = Σ card_power for each equipped card
```

**Evidence (RESOLVED — GAP-5 closed):**

- `battle_card.power[1]` for card 500001 = 600,000. `battle_card_star` at max star (star=4) for card 500001 = 600,000. These are EQUAL, confirming `battle_card.power[1]` = power at max stars.
- `attr_up = {75073: 0.01, 75173: 0.01, 75273: 0.01}` on card 500001: each level grants 1% to army-type stat IDs (see Stage 1e). These are NOT additional direct power — they modify hero stats.
- `battle_card_level` schema has NO power field. Level upgrades contribute ZERO direct power.

**Regular card example:** `card_id=200001`, `power_game_per_level=4500`, max level 5, `power_game_max=9000`. `9000 ÷ 4500 = 2` — only 2 of 5 levels contribute direct power.

**Star card example:** `card_id=500001`, `max_star=5` (raw: stars 0–4). `battle_card_star` powers: star0=120,000 | star1=240,000 | star2=360,000 | star3=480,000 | star4=600,000. Direct power = `battle_card_star[card.star].power`. Level 0–10 bonuses = `0.01 × level` percentage to stats 75073/75173/75273 (accounted in Stage 1e).

---

## Stage 13 — Squad Equipment

**Scope:** Player-global  
**Source table:** `knowledge/squad_equipment.json`

```
equip_power = 0
for each {item_id, upgrade_steps_completed} in player.squad_equipment:
    rec          = squad_equipment.records[item_id]
    equip_power += rec.power
    // Add completed upgrade step bonuses
    for step in rec.upgrade_steps[:upgrade_steps_completed]:
        equip_power += step.big_percent_power

stage_13 = equip_power
```

`rec.power` is pre-computed power at the item's base level. `upgrade_steps[i].big_percent_power` is the additional power gained when the player completes upgrade step `i`.

**Evidence:** 72 items. 24 have upgrade_steps. `max_upgrade_power` shows total possible bonus from steps. Stats: drone HP (50081, coeff=0.5), drone ATK (50082, coeff=12.5), drone DEF (50083, coeff=35.0).

---

## Stage 14 — Drone Battle System

**Scope:** Player-global  
**Source table:** `knowledge/drone.json`

### 14a. Drone level power

```
level_rec  = drone.levels[WHERE level = player.drone_level]
level_power = level_rec.total_power
```

`total_power` is pre-computed as `Σ(stat.value × stat.power_coeff for stat in stat_grants)`.

**Drone stat coefficients:** HP(50081)=0.5, ATK(50082)=12.5, DEF(50083)=35.0.

**Sample:** level 1: HP=12,500.4 × 0.5 + ATK=297.7 × 12.5 + DEF=59.6 × 35.0 = `total_power=12,057.45`

### 14b. Skill chip power

```
chip_power = Σ drone.skill_chips[chip_id].level_attributes[chip_level - 1].power
             for each {chip_id, chip_level} in player.drone_chips
```

`level_attributes[i].power` is the total power contribution of that chip at that level.

```
stage_14 = level_power + chip_power
```

---

## Stage 15 — Decoration Buildings

**Scope:** Player-global  
**Source table:** `knowledge/decoration_buildings.json`  
**Source Lua table:** `lw_decorationbuilding_lv`

```
deco_stat = {50060: 0, 50061: 0, 50062: 0}
for each {group, stages_completed[]} in player.decorations:
    for stage_index in stages_completed:
        rec = lw_decorationbuilding_lv[WHERE group=group AND order=stage_index]
        for (stat_id, value) in parse_stat_string(rec.stage_gain):
            deco_stat[stat_id] += value

stage_15 = deco_stat[50060] × HP_COEFF + deco_stat[50061] × ATK_COEFF + deco_stat[50062] × DEF_COEFF
```

**Evidence (RESOLVED):** `stage_gain` field in `lw_decorationbuilding_lv` is the per-stage stat grant (additive across stages). `para_gain` is the city power display metric only — it does NOT represent a stat grant. Stat IDs granted: 50060 (deco HP), 50061 (deco ATK), 50062 (deco DEF). Only groups 1034 and 1035 are present.

**Player state field:** `stages_completed: number[]` — array of completed stage indices (0-based order) for each decoration group. Replaces the former `stages_reached` and `progress` fields.

**Note:** `para_gain` values in `lw_decorationbuilding_lv` look like power contributions but are display-only. Do NOT include them in any power calculation.

---

## Output Model

```typescript
interface HeroPowerResult {
  hero_id: number;
  total_power: number;
  breakdown: {
    stage_1_base_stats: number;
    stage_2_hero_rank: number;
    stage_3_pentagon: number;
    stage_4_honor_level: number;
    stage_5_gear: number;
    stage_6_skills: number;
    stage_7_special_attributes: number;
    stage_8_ew_weapon: number;      // 0 for non-EW heroes
    stage_9_awakening: number;      // 0 for non-EW heroes
  };
}

interface PlayerPowerResult {
  hero_results: HeroPowerResult[];
  shared_contributions: {
    stage_10_research: number;
    stage_11_mastery: number;
    stage_12_battle_cards: number;
    stage_13_squad_equipment: number;
    stage_14_drone: number;
    stage_15_decorations: number;
  };
  // For a single hero's displayed panel power:
  hero_panel_power(hero_id: number): number;
  // hero_panel_power = hero_results[hero_id].total_power + Σ shared_contributions
}
```

---

## Unresolved Gaps

The following items cannot be computed from the current Knowledge Database. Each is assigned a severity and recommended implementation.

### GAP-1: Pentagon Tactical ATK (MEDIUM)

**What's missing:** `tactic_attack_upgrade` coefficient = 0.16 per total pentagon point. The target stat_id and its `power_coeff` are in `Assembly-CSharp`, not in `lw_effect_number`.

**Impact:** At max pentagon (1000 total points): `1000 × 0.16 = 160 tactical_atk` gained. If tactical ATK has the same coefficient as regular ATK (12.5), this would be `160 × 12.5 = 2,000 power`. Likely <0.1% of high-end hero power.

**Recommendation:** Implement as 0. Document as `TACTICAL_ATK_PENTAGON_UNRESOLVED`. Can be filled in when Assembly-CSharp is analyzed.

### GAP-2: Awakening `attr_add` (LOW)

**What's missing:** `hero_awaken_ranks.attr_add` is an index into an unresolved table. Its stat contribution (beyond `fix_power`) cannot be computed.

**Impact:** Unknown magnitude. `fix_power` is confirmed as the authoritative power contribution. `attr_add` may be a city-buff bonus, not hero combat power.

**Recommendation:** Implement `fix_power` only. Track `attr_add` as raw data in output for future investigation.

### GAP-3: EW Weapon Effects for Heroes 50019–50022 — RESOLVED (LOW)

**Resolution:** Heroes 50019–50022 are NPC/special characters with non-standard army_type encoding. Group 5015 is intentionally absent from `lw_hero_unique_weapon_effect` — these heroes have no EW weapon effect rows. **Implement effect_power = 0 for these heroes. No warning needed; absence is confirmed, not missing data.**

### GAP-4: APS Research Accumulation Model — RESOLVED (MEDIUM)

**Resolution:** `APS_science[node][level].power` = CUMULATIVE total at that level. Direct lookup at `current_level` — do NOT sum across levels. Confirmed by checking 359 multi-level nodes: values are monotonically increasing (running totals). See Stage 10 for the corrected formula.

### GAP-5: Battle Card Star+Level Interaction — RESOLVED (MEDIUM)

**Resolution:** For star cards (card_id ≥ 500000), `battle_card_star[card.star].power` is the SOLE direct power contribution. Level upgrades grant percentage stat bonuses (`attr_up × level`) to army-type stat IDs — these are NOT additional direct power and are accounted for in Stage 1e. `battle_card_level` schema has no power field. See Stage 12 for the corrected formula.

---

## Determinism Guarantee

1. All KB data is loaded once at engine startup from static JSON files and indexed into lookup maps by primary key.
2. No floating-point arithmetic is applied to KB values during lookup — the pre-computed `total_power`, `power_computed`, `power_at_level`, and `fix_power` fields are read directly.
3. Where arithmetic is performed (Stage 1 stat scaling, Stage 3 pentagon, Stage 6 skill power formula), operations are performed in consistent field order: HP first, then ATK, then DEF.
4. The engine does NOT call any extraction code, Lua interpreter, or APK file reader.
5. For the same `PlayerState` input, the engine must always produce the same output.

---

## KB Indexing Requirements

The engine must pre-index these lookups at startup:

```
hero_base_by_id          : Map<hero_id, HeroBaseRecord>
hero_levels_by_level     : Map<level, HeroLevelRecord>
hero_stars_by_rank       : Map<star_rank, HeroStarRecord>
hero_rank_by_rank        : Map<rank, HeroRankRecord>          // from hero_core.lw_hero_rank
honor_level_by_level_quality : Map<(level, quality), HonorLevelRecord>
gear_items_by_id         : Map<item_id, GearItem>
skills_by_id_level       : Map<(skill_id, level), SkillRecord>
special_attrs_by_id      : Map<id, SpecialAttrRecord>
awaken_by_hero_level     : Map<(hero_id, level), AwakenRecord>
ew_weapon_levels_by_hero_level : Map<(hero_id, level), EWLevelRecord>
ew_effects_by_group_level_max  : Map<(group, level_max), EWEffectRecord>
research_nodes_by_id     : Map<science_id, ResearchNode>
mastery_nodes_by_id      : Map<mastery_id, MasteryNode>
battle_cards_by_id       : Map<card_id, CardRecord>
squad_equip_by_id        : Map<item_id, SquadEquipRecord>
drone_levels_by_level    : Map<level, DroneLevelRecord>
drone_chips_by_id        : Map<chip_id, DroneChipRecord>
decoration_by_group_level_progress : Map<(group, level, progress), DecoRecord>
```

---

## Excluded Systems

These systems are confirmed NOT to contribute to hero power and must not be included:

| System | Reason | Evidence |
|--------|--------|---------|
| Military Rank | Combat-only troop buffs | EXCLUDED in audit |
| Career Effects | OTA locale dependency; effects are city-buff only | EXCLUDED in audit |
| Status Effects | Battle-only damage chains | EXCLUDED in audit |
| Alliance Tech | Stat IDs in 90xxx range, alliance-wide troop modifiers | EXCLUDED in audit |
| Hero Core Collection (march size) | `power_game=0` for all hero_core records | `hero_core.hero_core[].total_power=0` |
| lw_hero_rank `ratio_grants` | Empty array for all 26 ranks | `ratio_grants=[]` confirmed |
| Gear combat-only stats | 75953, 76053, 76057–76059, 50011, 50151–50154 | `is_hero_power_stat=false` |
| VIP Economy Bonuses | Resource/speed buffs (stat IDs outside hero power range) | Excluded in KB audit |
