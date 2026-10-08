# Last War — Knowledge Database Progress
*Updated: 2026-07-16T10:20:00.000000+00:00*

## INFRASTRUCTURE
| Component | Version | Status |
|-----------|---------|--------|
| Locale Parser | v2 LEB128 | FIXED — 52,733 entries |
| Stat Dictionary | — | 873 entries |

## VERIFIED MODULES
| # | Module | Records | Status | Locale | Location |
|---|--------|---------|--------|--------|----------|
| 1 | APS_science Research | 380 nodes / 2,739 levels | VERIFIED | v2 | data/extracted/latest/ |
| 2 | Battle Cards | 161 cards / 85 star rows | VERIFIED | v2 | data/extracted/latest/ |
| 3 | Mastery Tree | 981 nodes | VERIFIED | v2 | data/extracted/latest/ |
| 4 | Military Rank | 70 stages × 3 prof + 8 tiers | EXCLUDED (combat-only) | v2 | knowledge/ |
| 5 | Honor Level System | 3,005 records | VERIFIED | v2 | knowledge/ |
| 6 | Pentagon System | 25 flat records | VERIFIED | v2 | knowledge/ |
| 7 | Hero Special Attributes | 437 specials / 565 flat rows | VERIFIED | v2 | knowledge/ |
| 8 | Career Effects | 60 effects / 79 flat rows / 5×10 progression | EXCLUDED (OTA locale) | v2 | knowledge/ |
| 9 | Squad Equipment | 72 items / 141 flat rows | VERIFIED | v2 | knowledge/ |
| 10 | Drone Battle System | 900 levels / 7 tiers / 32 chips | VERIFIED | v2 | knowledge/ |
| 11 | Decoration Building Progress | 516 records / 43 groups / 1,500 flat rows | VERIFIED | v2 | knowledge/ |
| 12 | Status Effect Chain | 1,010 records (lw_status 889 + lw_status_effect 10 + status 111) | EXCLUDED (battle-only) | v2 | knowledge/ |
| 13 | Hero Core Collection | 634 records (hero_core 7 + lw_hero_rank 26 + lw_hero_honorLevel 601) | VERIFIED | v2 | knowledge/ |
| 14 | Hero Gear | 84 items / upgrade levels (Q2:1, Q3:16, Q4:31, Q5/Q6:41) / 25 promote tiers | VERIFIED | v2 | knowledge/ |
| 15 | Hero Skills | 25,935 skill_a + 8,660 skill_b records (per-level expanded) | VERIFIED | v2 | knowledge/ |

## BLOCKER RESOLUTIONS
### BLOCKER 1 — Hero Gear (RESOLVED 2026-07-16)
**Problem:** `gear_items.json` had base power only; upgrade/promote stat chain unresolved.
**Root Cause:** Double vExt chain: `lw_equip.basic_attributes` → `equip_vext[ref]` → `{level_idx: attr_id}` → `lw_equip_attribute[attr_id].effects` → `attr_vext[ref]` → `{stat_id: value}`.
**Fix:** Fully resolved the 2-hop chain. Per-level stat grants extracted for all 84 items × all upgrade levels.
**Power Formula:** `total_power = army_scale × Σ(hero_stat × coeff)` where hero stats = {50005, 50008, 50010} only.
**Army Scale:** `power_game / hero_only_power_at_lv1`; = 1.0 for army_type=0, ≈ 0.735–0.833 for specific armies (Q4/Q5), ≈ 2.935 for Q6 (baked-in promote bonuses).
**Output:** `knowledge/hero_gear.json` (4.5 MB) + `knowledge/hero_gear_flat.json` (1.7 MB)

### BLOCKER 2 — Hero Skills (RESOLVED 2026-07-16)
**Problem:** `hero_skills.json` reported `power=1` for virtually all skills.
**Root Cause:** `power` field in both `lw_hero_skill` and `lw_hero_skill_B` is type='array' (a vExt reference), not a direct value. The old extractor read the ref index (always 1 for most skills) as the power value.
**Fix:** Resolved `vExt[power_ref] = {1: base_power, 2: level_increment}`. Power at level L = `base_power + (L-1) × level_increment`.
**Verified:** Power range 800–1,272,000. 85 unique base powers. Per-level increments captured.
**Output:** `knowledge/hero_skills.json` (13.8 MB) + `knowledge/hero_skills_flat.json` (13.8 MB)

## READINESS AUDIT RESULT (2026-07-16)
**Audit v2.2 — PASSED 40/40 checks — ZERO BLOCKERS**

| Module | Power Source | Status |
|--------|-------------|--------|
| APS Research | `node.levels[].power_game` | ✓ VERIFIED |
| Battle Cards | `card.power_game_max` | ✓ VERIFIED |
| Mastery Tree | `node.power_computed` (stat×coeff) | ✓ VERIFIED |
| Military Rank | — | ✓ EXCLUDED |
| Honor Level | `record.power_computed` | ✓ VERIFIED |
| Pentagon | `coeff.power_per_point` | ✓ VERIFIED |
| Hero Special Attrs | `record.total_power` | ✓ VERIFIED |
| Career Effects | — | ✓ EXCLUDED |
| Squad Equipment | `flat.power` (pre-computed) | ✓ VERIFIED |
| Drone Battle | `level.total_power` (pre-computed) | ✓ VERIFIED |
| Decoration Buildings | `record.para_power`/`stage_power` | ✓ VERIFIED |
| Status Effects | — | ✓ EXCLUDED |
| Hero Core | `honor_level.total_power` | ✓ VERIFIED |
| **Hero Gear** | `item.power_game` × `army_scale` × level scaling | ✓ **VERIFIED (WAS BLOCKER)** |
| **Hero Skills** | `vExt[power_ref][1] + (L-1)×vExt[power_ref][2]` | ✓ **VERIFIED (WAS BLOCKER)** |

## FILE LOCATIONS
- Modules 1–3 (APS_science, Battle Cards, Mastery): `data/extracted/latest/`
- Modules 4–15: `knowledge/`

## STATUS: ★ COMPLETE — CLEARED FOR HERO POWER ENGINE ★
All client-side mechanics contributing to Hero Power have been extracted and verified.
Both original blockers are resolved. The Hero Power Engine may now be implemented.
