# Hero Power Architecture

This document maps every game system that may contribute to Hero Power.
It does NOT contain formulas. It contains systems, their data sources, and the
evidence status of each relationship.

---

## Architectural Question (OPEN)

**Model A**: All stat sources → final HP/ATK/DEF → single formula → Hero Power  
**Model B**: Each source → its own Power component → sum → Hero Power

Key evidence pointing toward Model B:
- Protobuf debug file exposes fields: `gearPower`, `weaponPower`, `sciencePower`,
  `honorPower`, `decoPower`, `formationEquipPower`, `soldierPower`, `totalHeroPower`
- These are **power values**, not stat values
- `gearPower` is computed in `compute.ts` but deliberately **never used** — dead code
  that suggests the original author knew about this component but chose wrong
- Delta test: displayed HP/ATK/DEF → formula predicts +20,350 power change;
  actual change was +9,760 — REJECTS Model A with displayed stats as inputs

---

## System Map

### 1. Fix Power (Awakening / Stars)

| | |
|---|---|
| **Files** | `lw_hero_awaken_rank`, `hero_awaken_ranks.json` |
| **Produces** | A flat power value per awakening level |
| **Affects combat stats** | NO |
| **Affects Hero Power** | YES — CONFIRMED |
| **Relationship proven?** | YES — fixPower=1,250,000 at awakening_lv=20 matches protobuf `fixPower` field |
| **Evidence** | Protobuf field `fixPower` = 1,250,000; confirmed across heroes |

---

### 2. Hero Level / Rank (Premia poziomu / Premia rangi)

| | |
|---|---|
| **Files** | `lw_hero_level`, `lw_hero_rank`, hero base stats in `lw_hero` |
| **Produces** | Flat HP/ATK/DEF shown in "Szczegóły bohatera" as "Premia poziomu" and "Premia rangi" |
| **Affects combat stats** | YES |
| **Affects Hero Power** | ASSUMED — never directly confirmed |
| **Relationship proven?** | NO |
| **Evidence** | Visible in stat breakdown; no direct proof it feeds into power formula |
| **Open question** | Is "Premia poziomu" a pre-pct raw value that gets multiplied internally, or post-pct? |

---

### 3. Gear (Premia wyposażenia)

| | |
|---|---|
| **Files** | `hero_gear_flat.json`, `squad_equipment_flat.json`, `lw_equip_attribute` |
| **Produces** | (a) Flat HP/ATK/DEF (shown in stat breakdown) AND (b) % bonuses (HP%, ATK%, DEF%, crit%) AND (c) a separate `gearPower` value (upgradePow + promotePow) |
| **Affects combat stats** | YES |
| **Affects Hero Power** | UNKNOWN — two competing mechanisms exist in the codebase |
| **Relationship proven?** | NO |
| **Evidence** | `compute.ts` computes `gearPower` from upgrade/promote tables but **drops it** (dead code). Current sim uses gear's flat stat contributions instead. Neither approach has been confirmed against game data. |
| **Critical open question** | Does the game use gear's flat stats × coefficients, OR gear's direct `upgradePow + promotePow` as an independent power component? |

---

### 4. Exclusive Weapon / EW (Bonus broni ekskluzywnej)

| | |
|---|---|
| **Files** | `ew_power_by_hero.json`, `lw_hero_unique_weapon_unit` (data gap) |
| **Produces** | Flat HP/ATK/DEF (shown in stat breakdown) AND resistance % |
| **Affects combat stats** | YES |
| **Affects Hero Power** | YES — but mechanism ASSUMED |
| **Relationship proven?** | PARTIAL |
| **Evidence** | Protobuf field `weaponPower` exists — this IS a separate component. Current sim uses pre-computed ewPower = HP_ew×0.5 + ATK_ew×12.5 + DEF_ew×35. Whether the game uses this formula or a direct `weaponPower` table value is UNKNOWN. |
| **Open question** | Does `weaponPower` = EW stats × coefficients, or is it read directly from a progression table? |

---

### 5. Research / Technology (Premia technologii)

| | |
|---|---|
| **Files** | Research tree data (not fully extracted) |
| **Produces** | % bonuses shown in "Atrybuty ataku/obrony" section (HP%, ATK%, DEF%, hero damage%, etc.) — does NOT appear as flat stat |
| **Affects combat stats** | YES (via % multiplier) |
| **Affects Hero Power** | UNKNOWN |
| **Relationship proven?** | NO |
| **Evidence** | Protobuf field `sciencePower` exists — research may contribute power DIRECTLY, independently of HP/ATK/DEF stats. If so, the % bonuses shown in "Atrybuty" are combat-only and irrelevant to power. |
| **Critical question** | Does Murphy's "Premia technologii +15% ATK" affect power via ATK stat, OR does research have its own `sciencePower` independent of any stat? |

---

### 6. Buildings (Premia budynku)

| | |
|---|---|
| **Files** | `lw_decorationbuilding_lv` (data gap — not extracted), `lw_building` |
| **Produces** | Flat HP/ATK/DEF (shown in stat breakdown) AND % bonuses (Kosmetyka, monster damage, etc.) |
| **Affects combat stats** | YES |
| **Affects Hero Power** | UNKNOWN |
| **Relationship proven?** | NO |
| **Evidence** | Protobuf field `decoPower` exists. Building flat stats are visible (budynek HP=213,074 for Murphy and Kimberly — same, as expected for global sources). Whether these go through HP formula or contribute directly to `decoPower` is unknown. |

---

### 7. Drone (Premia Drona)

| | |
|---|---|
| **Files** | `squad_equipment_flat.json` (component levels), `lw_hero_unique_weapon_unit` |
| **Produces** | Very large flat HP/ATK/DEF (HP=938,771 for Murphy) AND % bonuses (HP%, ATK%, DEF%) |
| **Affects combat stats** | YES |
| **Affects Hero Power** | UNKNOWN |
| **Relationship proven?** | NO |
| **Evidence** | No `dronepower` protobuf field observed — drone may go through stat formula, OR be absorbed into another component. Largest single flat stat contributor. |

---

### 8. Honor (Bonus honoru)

| | |
|---|---|
| **Files** | `hero_honor_levels.json` |
| **Produces** | Flat HP only (class_4_hp = honor_level × 100) |
| **Affects combat stats** | YES |
| **Affects Hero Power** | UNKNOWN |
| **Relationship proven?** | NO |
| **Evidence** | Protobuf field `honorPower` exists — honor may contribute directly to power rather than via HP stat. Murphy honorLevel=102 → 10,200 flat HP. |

---

### 9. Lord Training (Wzmocnienie treningu Władcy)

| | |
|---|---|
| **Files** | Unknown |
| **Produces** | Small flat HP/ATK/DEF (HP=33,095, ATK=976, DEF=158 for Murphy) |
| **Affects combat stats** | YES |
| **Affects Hero Power** | UNKNOWN |
| **Relationship proven?** | NO |
| **Evidence** | Appears in stat breakdown. No protobuf field named for it. May be absorbed into level stat or irrelevant to power. |

---

### 10. Skills / Umiejętności (S4 OOB)

| | |
|---|---|
| **Files** | `skill_group_bonuses.json` |
| **Produces** | % HP/ATK/DEF bonus (20% each from Skill 4 OOB per owned 5★ UR hero) |
| **Affects combat stats** | YES (via % multiplier — appears in "Atrybuty" section) |
| **Affects Hero Power** | UNKNOWN |
| **Relationship proven?** | NO |
| **Evidence** | Skills appear in % bonus section ("Umiejętności +20%"), NOT in flat stats. Same question as Research: does this % affect power via stats, or is power computed before % bonuses? |

---

### 11. Formation Equipment (formationEquipPower)

| | |
|---|---|
| **Files** | Unknown |
| **Produces** | Unknown |
| **Affects combat stats** | Unknown |
| **Affects Hero Power** | YES — protobuf field exists |
| **Relationship proven?** | NO |
| **Evidence** | Protobuf field `formationEquipPower` observed. Not modeled in simulator at all. |

---

### 12. VIP (Premia VIP)

| | |
|---|---|
| **Files** | `vip_levels.json` |
| **Produces** | % HP/ATK/DEF bonus (5% each at VIP12) — appears in "Atrybuty" % section |
| **Affects combat stats** | YES |
| **Affects Hero Power** | UNKNOWN |
| **Relationship proven?** | NO |
| **Evidence** | Same question as Research/Skills: % bonus in combat section. Does it affect power? |

---

### 13. Cosmetics / Kosmetyka

| | |
|---|---|
| **Files** | Unknown |
| **Produces** | +5% ATK bonus for Murphy (appears in "Atrybuty ataku" section), +0% HP/DEF |
| **Affects combat stats** | YES (ATK only) |
| **Affects Hero Power** | UNKNOWN |
| **Relationship proven?** | NO |
| **Evidence** | Only appears in % bonus section. No flat stat contribution. |

---

## The Central Unresolved Split

Every system above produces EITHER:
- **Flat stats** (shown in "Bazowe statystyki" breakdown)
- **% bonuses** (shown in "Atrybuty ataku/obrony" section)
- **Both**
- **A direct power value** (protobuf fields)

The game clearly separates flat stats from % bonuses in its UI. This separation may reflect the internal architecture:

> The displayed HP/ATK/DEF may be a **display-only computation** for the player's information, while Hero Power is computed from a completely different set of inputs.

If true, then every investigation that starts from displayed HP/ATK/DEF is investigating the wrong layer.

---

## What Would Distinguish Model A from Model B

| Test | Model A predicts | Model B predicts |
|------|-----------------|-----------------|
| Remove one gear piece, check power | Power drops by (gear flat stats) × coefficients | Power drops by gear's own `upgradePow` |
| Upgrade research by known amount | Power changes proportional to % bonus × base stat | Power changes by fixed `sciencePower` delta |
| Two heroes with identical % but different flat stats | Different power scaling | Independent of % bonus |
| In-game power breakdown screen | Shows HP/ATK/DEF contributions | Shows gear/weapon/science/honor etc. |

The most diagnostic single test: **does the game have a power breakdown screen** (tapping the power number) that shows components? If yes, that screen directly reveals Model A vs Model B.

---

## Summary Status

| System | Power relationship | Confidence |
|--------|-------------------|------------|
| Fix Power | Direct flat power | CONFIRMED |
| EW / Weapon | Direct (`weaponPower` protobuf) | OPEN — mechanism unknown |
| Gear | Unknown — two candidates exist | OPEN |
| Research | Direct (`sciencePower` protobuf) | OPEN |
| Buildings | Direct (`decoPower` protobuf) | OPEN |
| Honor | Direct (`honorPower` protobuf) | OPEN |
| Formation Equip | Direct (`formationEquipPower`) | OPEN |
| Level/Rank stats | Via HP formula OR direct | OPEN |
| Drone | Unknown, no dedicated protobuf field | OPEN |
| Skills | Unknown — % bonus only | OPEN |
| VIP | Unknown — % bonus only | OPEN |
| Lord Training | Unknown | OPEN |
