# LAST WAR — REVERSE ENGINEERING DATABASE
# Single Source of Truth for Simulation Engine, AI Advisor, OCR, Upgrade Planner
#
# Version:      0.2
# Created:      2026-07-13
# Last Updated: 2026-07-13
# Status:       Active Research — Pre-Engine Phase
#
# METHODOLOGY
# ─────────────────────────────────────────────────────────────────────────────
# VERIFIED        = Confirmed by personal in-game test with screenshot/video,
#                   or confirmed by game datamine with source link.
# PARTIALLY_KNOWN = Consistent across multiple community sources but not
#                   personally confirmed by direct test.
# UNKNOWN         = No reliable information exists.
#
# RULE: No formula, coefficient, or mechanic description may be marked
# VERIFIED without a corresponding Evidence ID in the Evidence Database.
# Community guides alone = PARTIALLY_KNOWN at most.
#
# RULE: No numerical estimate may appear in this document unless it is an
# Observed Value from an Evidence entry. Do not invent ranges, guesses,
# or "approximately X" unless labeled explicitly as HYPOTHESIS.
#
# RULE: UNKNOWN means UNKNOWN. Not "probably X." Not "likely similar to Y."
# ─────────────────────────────────────────────────────────────────────────────


═══════════════════════════════════════════════════════════════════════════════
ENGINE STATUS
Last Updated: 2026-07-13
═══════════════════════════════════════════════════════════════════════════════

  Can the engine produce a Squad Power value?       NO
  Reason: Power formula unknown (M-001), hero base stats unknown (M-003)

  Mechanics status:
    VERIFIED                                         0
    PARTIALLY_KNOWN                                  9
    UNKNOWN                                         16

  Experiments:
    Open                                            13
    In Progress                                      0
    Completed                                        0

  Current research blocker:                        M-001 (Power Formula)
  Without M-001, all other mechanics cannot be integrated into output.

  Next required action:
    Run EXP-001 (Power Formula Calibration)
    Run EXP-002 (Hero Base Stats)

═══════════════════════════════════════════════════════════════════════════════


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — MECHANICS DATABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mechanics are organized by dependency order, not alphabetically.
Resolve in this order: formula → base values → modifiers → outputs.

───────────────────────────────────────────────────────────────────────────────
M-001 | SQUAD POWER FORMULA
───────────────────────────────────────────────────────────────────────────────
Status:      UNKNOWN
Importance:  CRITICAL
Blocks:      Everything. No output can be produced without this.

Description:
  The mathematical formula the game uses to combine troop contributions,
  hero stat contributions, and percentage modifiers into the single integer
  displayed as "Squad Power."

Current Verified Knowledge:
  - The game displays a single Squad Power integer per squad.
  - The number changes when troops, heroes, or bonuses change.
  - No formula has been confirmed.

Current Unknowns:
  - Whether troop power and hero power are summed or combined differently.
  - Whether % modifiers multiply the total, multiply components separately,
    or are summed into a single multiplier applied at the end.
  - Whether ATK%, DEF%, HP% contribute equally to power or have different weights.
  - Whether the formula is the same for all troop types.
  - Whether hero stats add flat points to squad power or scale existing troop power.

Dependencies:
  Depends on: [nothing — this is the top-level output formula]

Affected Systems:
  - Squad Power display
  - Account Power (sum of squad powers)
  - VS Points (derived from power)
  - AI Advisor (all recommendations)
  - Upgrade Planner (all ROI calculations)

Evidence:        [none]

Experiments:     EXP-001

Open Questions:
  Q1: Is squad power = f(troops) + g(heroes) or f(troops + hero contribution)?
  Q2: Do modifiers apply before or after combining troop and hero values?
  Q3: Is there a floor or cap on the formula output?

Notes:
  Until EXP-001 is completed, no other mechanic can be integrated into
  an output value. This is the single highest-priority unknown.

───────────────────────────────────────────────────────────────────────────────
M-002 | TROOP TIER BASE POWER
───────────────────────────────────────────────────────────────────────────────
Status:      PARTIALLY_KNOWN
Importance:  CRITICAL

Description:
  A fixed power value assigned to each troop of a given tier, which forms
  the baseline troop contribution to Squad Power before any modifiers.

Current Verified Knowledge:
  None. All values below are from community sources (see EV-001).
  Personal verification has not been performed.

Community-Reported Values (NOT verified — from EV-001):
  T1=24, T2=50, T3=80, T4=120, T5=200, T6=300, T7=500, T8=800, T9=1200, T10=1647

Current Unknowns:
  - Whether T10=1647 is exact or rounded from a calculation.
  - Whether base power differs by troop type (Tank vs Aircraft vs Missile)
    at the same tier.
  - Whether these values are truly fixed or updated between game patches.

Dependencies:
  Depends on: [none — game constant]

Affected Systems:
  - Troop power component of Squad Power (M-001)

Evidence:        EV-001

Experiments:     EXP-001 (verification step)

Open Questions:
  Q1: Are T1–T10 values identical for all troop types, or type-specific?
  Q2: Is T10=1647 an exact game value or a rounded community observation?

───────────────────────────────────────────────────────────────────────────────
M-003 | HERO BASE STATS (ATK / DEF / HP at Level 1, 1★, No Modifiers)
───────────────────────────────────────────────────────────────────────────────
Status:      UNKNOWN
Importance:  CRITICAL

Description:
  The raw ATK, DEF, and HP values of a hero at the minimum state: level 1,
  1 star, no gear, no Exclusive Weapon, no decorations, no Wall of Honor.
  These are the inputs to all hero stat calculations.

Current Verified Knowledge:
  - Heroes have ATK, DEF, HP stats visible on the hero detail screen.
  - Stats increase with level, stars, gear, and other modifiers (observed).
  - No baseline values have been recorded.

Current Unknowns:
  - Base ATK, DEF, HP at lv1, 1★ for any hero.
  - Whether all UR heroes share identical base stats or each has unique values.
  - Whether SSR base stats differ from UR base stats.
  - Whether SR base stats differ from SSR base stats.
  - Whether hero type (Tank/Aircraft/Missile) affects base stat distribution.
  - Whether hero role (Attacker/Defender/Support) affects base stat distribution.

Dependencies:
  Depends on: [none — ground truth input]

Affected Systems:
  - Hero Level Growth (M-004)
  - Hero Star Scaling (M-005)
  - All gear/modifier outputs (M-006 through M-012)
  - Hero contribution to Squad Power (M-001)

Evidence:        [none]

Experiments:     EXP-002

Open Questions:
  Q1: Do all UR heroes share the same ATK/DEF/HP base stats?
  Q2: Is the stat distribution (ATK vs DEF vs HP) fixed per rarity or per hero?
  Q3: Does the game display exact integer values or rounded values?

Notes:
  This is the single most important unknown for hero power calculation.
  Without it, no hero contribution can be computed.
  Obtaining this requires: one hero, lv1, 1★, zero gear, screenshot.
  This is easy to collect — it only requires in-game access.

───────────────────────────────────────────────────────────────────────────────
M-004 | HERO STAT GROWTH PER LEVEL (1 → 175)
───────────────────────────────────────────────────────────────────────────────
Status:      UNKNOWN
Importance:  CRITICAL

Description:
  The formula or lookup table that determines how a hero's ATK, DEF, HP
  increase as their level increases from 1 to 175.

Current Verified Knowledge:
  - Hero level cap = HQ Level × 5, maximum 175 (EV-002).
  - Stats visibly increase with level (direct observation, no quantification).

Current Unknowns:
  - Growth formula type: linear, piecewise, polynomial, or lookup table.
  - Growth rate (absolute increase per level).
  - Whether growth rate is uniform across all levels or changes at breakpoints.
  - Whether ATK, DEF, HP have identical growth rates or differ.
  - Whether growth rate differs between UR, SSR, SR heroes.

Dependencies:
  Depends on: M-003 (base stats at lv1 are the input to this formula)

Affected Systems:
  - Hero stats at any level
  - Hero contribution to Squad Power (M-001)

Evidence:        EV-002 (level cap rule only)

Experiments:     EXP-003

Open Questions:
  Q1: Is growth linear (fixed +X per level) or curved?
  Q2: Are there breakpoints where growth rate changes (e.g. at lv100, lv150)?
  Q3: Is the growth formula the same for all heroes of the same rarity?

Notes:
  Requires M-003 first. Cannot determine growth without knowing lv1 baseline.
  Minimum data needed: same hero at 5+ different levels, all other variables constant.

───────────────────────────────────────────────────────────────────────────────
M-005 | HERO STAR SCALING (1★ → 5★)
───────────────────────────────────────────────────────────────────────────────
Status:      UNKNOWN
Importance:  CRITICAL

Description:
  The multiplier or additive bonus applied to hero stats when promoted
  from 1 star to higher star counts via the shard promotion system.

Current Verified Knowledge:
  - Star system exists (1★ through 5★).
  - 5★ is required to unlock Exclusive Weapon (EV-003).
  - Stats visibly increase with stars (direct observation, no quantification).

Current Unknowns:
  - Whether the scaling is multiplicative (×1.X per star) or additive (+X% per star).
  - The exact value per star step: 1★→2★, 2★→3★, 3★→4★, 4★→5★.
  - Whether scaling applies differently to ATK vs DEF vs HP.
  - Whether UR and SSR stars use the same scaling formula.

Dependencies:
  Depends on: M-003 (base stats), M-004 (level must be held constant for test)

Affected Systems:
  - Hero stats at any star level
  - Hero contribution to Squad Power (M-001)
  - EW unlock requirement (M-010)

Evidence:        EV-003 (5★ requirement for EW only)

Experiments:     EXP-004

Open Questions:
  Q1: Is scaling additive per star or a discrete multiplier per promotion?
  Q2: Is the 3★→4★ transition (Expertise unlock) also a stat increase?

───────────────────────────────────────────────────────────────────────────────
M-006 | GEAR SLOT → STAT TYPE MAPPING
───────────────────────────────────────────────────────────────────────────────
Status:      UNKNOWN
Importance:  HIGH

Description:
  Which specific stat (ATK, DEF, HP, or other) each of the 4 gear slots
  (Cannon, Chip, Armor, Radar) provides when equipped.

Current Verified Knowledge:
  None. The mapping below is a community hypothesis, not verified.

Community Hypothesis (NOT verified):
  Cannon → ATK | Chip → ? | Armor → DEF | Radar → HP
  Source: Inferred from slot names. No measurement confirms this.

Current Unknowns:
  - Which stat each of the 4 slots provides.
  - Whether any slot affects multiple stats simultaneously.
  - Whether Chip affects a unique stat type (e.g. Skill Damage, Crit Rate).
  - Whether recommended vs non-recommended slots give different values.

Dependencies:
  Depends on: M-003 (need a hero with known base stats to measure deltas)

Affected Systems:
  - Gear stat calculation (M-007)
  - Hero total stats
  - Squad Power (M-001)

Evidence:        [none]

Experiments:     EXP-005

Open Questions:
  Q1: Does Chip provide a combat stat at all, or a secondary stat not in the power formula?
  Q2: Are all 4 slots independent, or do combinations matter?

───────────────────────────────────────────────────────────────────────────────
M-007 | GEAR STAT VALUES (QUALITY × LEVEL × SLOT)
───────────────────────────────────────────────────────────────────────────────
Status:      UNKNOWN
Importance:  HIGH

Description:
  The numeric stat value provided by each gear piece at each quality tier
  (Common, Rare, Epic, Legendary) and level (1–40), for each slot.

Current Verified Knowledge:
  - 4 quality tiers exist: Common, Rare, Epic, Legendary.
  - Gear can be leveled from 1 to 40.
  - After lv40, star promotions exist (star count unknown).
  - Higher quality and level clearly provide higher stats (observed).

Current Unknowns:
  - Base stat at lv1 for each quality tier for each slot.
  - Stat increase per level (linear? stepped? polynomial?).
  - Quality ratio (e.g. Legendary lv1 vs Common lv1 ratio).
  - Star promotion values after lv40.
  - Whether the lv1→40 growth curve is uniform or has breakpoints.

Dependencies:
  Depends on: M-006 (must know which stat a slot provides before measuring it)

Affected Systems:
  - Hero stats
  - Squad Power (M-001)

Evidence:        [none]

Experiments:     EXP-006

Open Questions:
  Q1: Is gear stat scaling linear (same increase per level) or stepped (bigger jumps at certain levels)?
  Q2: Are quality ratios consistent across all slots?

───────────────────────────────────────────────────────────────────────────────
M-008 | HERO SKILLS → STAT / POWER CONTRIBUTION
───────────────────────────────────────────────────────────────────────────────
Status:      UNKNOWN
Importance:  MEDIUM

Description:
  Whether hero skill levels (Auto-Attack, Tactics, Passive) contribute to
  the Squad Power display number, and if so, how.

Current Verified Knowledge:
  - 3 primary skills exist per hero: Auto-Attack, Tactics, Passive (levels 1–40).
  - Expertise skill exists at 4★+ heroes.
  - Skill Medals are used to level skills.

Current Unknowns:
  - Whether skill levels affect the Squad Power display or only combat performance.
  - Whether expertise unlocking increases Squad Power.
  - Whether skill damage stats appear in the power formula.

Dependencies:
  Depends on: M-001 (power formula — to know if skills are even a term)

Affected Systems:
  - Squad Power (M-001) — unknown if applicable

Evidence:        [none]

Experiments:     EXP-015

Open Questions:
  Q1: Does upgrading a skill by 1 level change Squad Power?

───────────────────────────────────────────────────────────────────────────────
M-009 | RESEARCH % BONUSES
───────────────────────────────────────────────────────────────────────────────
Status:      PARTIALLY_KNOWN
Importance:  HIGH

Description:
  Percentage bonuses to troop and hero stats provided by completing
  research nodes across 19 research trees.

Current Verified Knowledge (source EV-004):
  - 19 research trees exist (confirmed via cpt-hedge.com scraping).
  - Each research node has a documented effect (e.g. "+2% Tank ATK per level").
  - Node max levels vary (typically 1–5).
  - Effect data is stored in lib/research-effects.ts.
  - Nodes with troop="all" affect all troop types.
  - Nodes with troop="tank/aircraft/missile" are type-specific.

Current Unknowns:
  - Whether pctPerLv is truly constant across all node levels (may increase at higher levels).
  - Whether research bonuses are additive with other bonus sources (M-016).
  - Whether "Squad ATK" and "Troop ATK" are mechanically identical or distinct.
  - Whether research bonuses affect the power display or only actual combat.

Dependencies:
  Depends on: [none — research is a base modifier]

Affected Systems:
  - Troop ATK%, DEF%, HP% → Squad Power (M-001)
  - Hero ATK%, DEF%, HP% (hero-specific research nodes)
  - Economy stats (speed/cost research nodes)

Evidence:        EV-004

Experiments:     EXP-007

Open Questions:
  Q1: Does "+2% Troop ATK" add to ATK% pool (additive with other sources) or multiply it?
  Q2: Is "Squad ATK" the same modifier stack as "Troop ATK"?

───────────────────────────────────────────────────────────────────────────────
M-010 | EXCLUSIVE WEAPON (EW) — LEVEL EFFECTS (1–30)
───────────────────────────────────────────────────────────────────────────────
Status:      PARTIALLY_KNOWN (lv10 and lv20 only; all others UNKNOWN)
Importance:  HIGH

Description:
  Stat bonuses conferred by upgrading a hero's Exclusive Weapon from
  level 1 to 30, with known milestone effects at levels 10 and 20.

Current Verified Knowledge:
  None. All values are community-reported (EV-005):
  - EW Lv10: "+5% team buff" — which stat, which scope: UNKNOWN.
  - EW Lv20: "+7.5% ATK/DEF/HP to all heroes of same troop type in formation."
    "Formation" scope is ambiguous. Not personally verified.
  - EW Lv30: UNKNOWN.

Current Unknowns:
  - Effects at EW levels 1–9, 11–19, 21–29, 30.
  - Lv10 effect: which stat and which scope ("team buff" is ambiguous).
  - Lv20 effect: does "formation" mean the active squad only or all owned heroes?
  - Whether EW bonuses apply to troops, heroes, or both.
  - Whether EW stars (after reaching max level) provide additional bonuses.

Dependencies:
  Depends on: M-005 (requires 5★ to unlock EW)

Affected Systems:
  - Hero stats → Squad Power (M-001)
  - Formation bonuses (M-013)

Evidence:        EV-005

Experiments:     EXP-009

Open Questions:
  Q1: Is the lv10 "+5% team buff" limited to one stat or all three (ATK/DEF/HP)?
  Q2: Does "same troop type in formation" mean only heroes of that type in the squad,
      or does it apply globally to all troops when that hero is in any squad?

───────────────────────────────────────────────────────────────────────────────
M-011 | DRONE — STAT CONTRIBUTIONS
───────────────────────────────────────────────────────────────────────────────
Status:      UNKNOWN
Importance:  HIGH

Description:
  All stat bonuses contributed by the drone system: drone level,
  combat boost level, component levels, chip rarity/stars, and chip
  set composition.

Current Verified Knowledge:
  - Drone system exists with: Level (0–250), Combat Boost Level, 6 Components,
    4 Chip Slots (Initial/Attack/Defense/Interference), up to 4 chip sets.
  - Chip rarities: R, SR, SSR, UR.
  - Chip star milestones: 2, 5, 6, 8, 10.
  - Unit types for chips: tank, aircraft, missile.

Current Unknowns:
  - Which stats drone level affects and by how much.
  - Which stats combat boost level affects and by how much.
  - Which stat each of the 6 components (Thermal Scope, Turbo Engine, External
    Armor, Radar, Fuel Cell, Airborne Missile) provides.
  - Base stat per chip rarity at 1★.
  - Stat scaling per star milestone.
  - Whether chip set bonuses exist for matching unit types.
  - Whether drone stats appear in Squad Power display.

Dependencies:
  Depends on: [none — drone is a base modifier source]

Affected Systems:
  - Troop and/or hero stats → Squad Power (M-001)

Evidence:        [none]

Experiments:     EXP-010

Open Questions:
  Q1: Does drone level give ATK%/DEF%/HP% or flat stat bonuses?
  Q2: Are drone bonuses applied to troops, heroes, or both?

───────────────────────────────────────────────────────────────────────────────
M-012 | WALL OF HONOR (WoH) — FORMATION BONUSES
───────────────────────────────────────────────────────────────────────────────
Status:      PARTIALLY_KNOWN
Importance:  HIGH

Description:
  Persistent percentage bonuses to troops of a specific type, earned by
  leveling heroes on the Wall of Honor.

Current Verified Knowledge (source EV-006):
  - Three categories of WoH heroes exist:
    - Main UR: grants +0.50% per 50 WoH levels to one stat (ATK or DEF or HP)
      for all troops of that hero's type.
    - Promotable SSR→UR: grants +0.25% per 50 WoH levels to same.
    - Load heroes: grants +1.00% per 50 WoH levels to Troop Load Capacity only.
  - Bonuses are additive per hero (stacks across all owned WoH heroes).

Current Unknowns:
  - Which specific stat (ATK, DEF, or HP) each of the 31 heroes provides.
    The complete per-hero list has not been verified for all heroes.
  - Whether WoH bonuses appear in Squad Power display or only in combat.
  - Whether WoH bonuses apply to the specific squad containing that hero,
    or globally to all troops of that type in any squad.

Dependencies:
  Depends on: [none — WoH is a base modifier source]

Affected Systems:
  - Troop ATK% or DEF% or HP% (type-specific) → Squad Power (M-001)

Evidence:        EV-006

Experiments:     EXP-008

Open Questions:
  Q1: Does WoH apply globally to all squads or only to squads containing that hero?
  Q2: Is the complete per-hero WoH stat type (ATK/DEF/HP) documented anywhere verified?

───────────────────────────────────────────────────────────────────────────────
M-013 | SQUAD COMPOSITION BONUS
───────────────────────────────────────────────────────────────────────────────
Status:      PARTIALLY_KNOWN
Importance:  HIGH

Description:
  Bonus ATK/DEF/HP awarded based on the type distribution of heroes
  occupying the 5 squad slots.

Current Verified Knowledge (source EV-007):
  Community-reported values (NOT verified by personal test):
  | Hero type distribution       | Reported bonus        |
  |------------------------------|-----------------------|
  | 3 heroes of same type        | +5% ATK/DEF/HP        |
  | 3 of one type + 2 of another | +10% ATK/DEF/HP       |
  | 4 heroes of same type        | +15% ATK/DEF/HP       |
  | 5 heroes all same type       | +20% ATK/DEF/HP       |

Current Unknowns:
  - Whether these percentage values are correct.
  - Whether the bonus applies to troops, heroes, or both.
  - Whether all three stats (ATK/DEF/HP) are boosted equally.
  - Whether this bonus appears in Squad Power display.
  - What happens with compositions not in this table (e.g. 2+2+1).

Dependencies:
  Depends on: M-001 (need power formula to know what the bonus affects)

Affected Systems:
  - Squad Power (M-001)

Evidence:        EV-007

Experiments:     EXP-011

Open Questions:
  Q1: What bonus does a 2+2+1 composition receive?
  Q2: Are empty squad slots counted as a hero "type"?

───────────────────────────────────────────────────────────────────────────────
M-014 | VS TECHNOLOGY MULTIPLIER
───────────────────────────────────────────────────────────────────────────────
Status:      PARTIALLY_KNOWN
Importance:  HIGH

Description:
  A global multiplier on troop stats (or squad power) determined by the
  VS Technology research level (0–6).

Current Verified Knowledge (source EV-008):
  Community-reported values (NOT verified by personal test):
  | VS Tech Level | Reported Multiplier |
  |---------------|---------------------|
  | 0             | ×1.00               |
  | 1             | ×1.10               |
  | 2             | ×1.20               |
  | 3             | ×1.35               |
  | 4             | ×1.50               |
  | 5             | ×1.75               |
  | 6             | ×2.00               |

Current Unknowns:
  - Whether VS Tech multiplies Squad Power display or only combat stats.
  - What exactly is multiplied: total power, troop power, troop stats, or hero stats.
  - Whether the multiplier is applied before or after other modifiers.

Dependencies:
  Depends on: M-016 (stacking order determines when VS Tech is applied)

Affected Systems:
  - Squad Power (M-001)

Evidence:        EV-008

Experiments:     EXP-017

Open Questions:
  Q1: Does VS Tech ×2.0 (lv6) double the displayed Squad Power, or does it only
      double the underlying troop combat stats before the power formula runs?

───────────────────────────────────────────────────────────────────────────────
M-015 | ALLIANCE TECHNOLOGY BONUSES
───────────────────────────────────────────────────────────────────────────────
Status:      UNKNOWN
Importance:  HIGH

Description:
  Stat bonuses provided by the Alliance Technology research tree.

Current Verified Knowledge:
  - Alliance tech system exists.
  - It is known to affect combat and economy (community consensus).

Current Unknowns:
  - Which stats are affected (ATK%, DEF%, HP%, type-specific or global?).
  - Bonus values per tech node per level.
  - Maximum level per tech node.
  - Whether bonuses are personal or shared with all alliance members.
  - Whether bonuses appear in Squad Power display.

Dependencies:
  Depends on: [none — alliance tech is a base modifier source]

Affected Systems:
  - Troop stats → Squad Power (M-001)

Evidence:        [none]

Experiments:     EXP-013

Open Questions:
  Q1: Is alliance tech capped at a maximum level, or do seasons add new tiers?

───────────────────────────────────────────────────────────────────────────────
M-016 | BONUS STACKING ORDER (ADDITIVE vs MULTIPLICATIVE)
───────────────────────────────────────────────────────────────────────────────
Status:      UNKNOWN
Importance:  CRITICAL

Description:
  The order of operations that determines how multiple percentage bonuses
  from different sources (research, WoH, EW, drone, buildings, VIP, etc.)
  are combined before being applied to troop or hero base values.

Current Verified Knowledge:
  - Multiple independent sources provide % bonuses.
  - How they combine is completely unknown.

Hypotheses (unverified — do not implement):
  H1 (Additive): All sources sum into one pool, applied once.
    stat = base × (1 + Σ all_bonus_pct)
  H2 (Full Multiplicative): Each source multiplies independently.
    stat = base × Π (1 + source_pct)
  H3 (Hybrid): Some categories are additive within category,
    then categories are multiplied together.
    stat = base × (1 + Σ research_pct) × (1 + Σ building_pct) × ...

Current Unknowns:
  - Which of H1/H2/H3 (or a fourth model) the game uses.
  - Whether different bonus categories stack differently from each other.

Dependencies:
  Depends on: M-003, M-009 (need isolated bonus sources to test)

Affected Systems:
  - All % modifier calculations → Squad Power (M-001)
  - This determines the accuracy ceiling of the engine.

Evidence:        [none]

Experiments:     EXP-014

Open Questions:
  Q1: If research gives +50% ATK and WoH gives +20% ATK, is effective ATK
      +70% (additive) or +80% (multiplicative)?

Notes:
  This unknown has compounding effect. If the formula is H2 and we implement H1,
  error increases non-linearly as more bonus sources are added. Must be resolved
  before engine produces calibrated output.

───────────────────────────────────────────────────────────────────────────────
M-017 | VIP LEVEL — COMBAT STAT BONUSES
───────────────────────────────────────────────────────────────────────────────
Status:      PARTIALLY_KNOWN (lv10 and lv18 only)
Importance:  MEDIUM

Description:
  Bonuses to hero ATK/DEF/HP stats conferred by VIP level.

Current Verified Knowledge (source EV-009):
  - VIP Lv10: +2.5% hero ATK/DEF/HP (community-reported, not verified).
  - VIP Lv18: +12.5% hero HP/ATK/DEF (community-reported, not verified).

Current Unknowns:
  - Complete bonus table for VIP levels 1–18.
  - Whether VIP combat bonuses apply to all heroes or only active squad heroes.
  - Whether VIP bonuses affect the Squad Power display.

Dependencies:
  Depends on: [none — VIP is a base modifier source]

Affected Systems:
  - Hero stats → Squad Power (M-001)

Evidence:        EV-009

Experiments:     EXP-012

Open Questions:
  Q1: At which VIP levels do combat bonuses first appear?
  Q2: Is there a single in-game screen showing all VIP bonuses at all levels?

───────────────────────────────────────────────────────────────────────────────
M-018 | BUILDINGS — HERO STAT BONUSES
───────────────────────────────────────────────────────────────────────────────
Status:      PARTIALLY_KNOWN
Importance:  MEDIUM

Description:
  Hero ATK/DEF/HP percentage bonuses provided by upgrading specific
  buildings to higher levels.

Current Verified Knowledge (source EV-010):
  - buildings-data.json contains bonus data for 62 buildings scraped from cpt-hedge.com.
  - Buildings list hero HP%, hero ATK%, hero DEF% as bonus types.
  - Some buildings are type-specific (Air Center → Aircraft heroes, etc.).
  - Data source was a web scrape; values have not been cross-validated.

Current Unknowns:
  - Whether building hero stat bonuses appear in Squad Power display.
  - Whether bonus values in buildings-data.json are accurate.
  - Whether building bonuses stack additively with research bonuses (M-016).

Dependencies:
  Depends on: M-001, M-016

Affected Systems:
  - Hero stats → Squad Power (M-001)

Evidence:        EV-010

Experiments:     EXP-016

Open Questions:
  Q1: Do building bonuses affect the Squad Power number or only actual combat stats?

───────────────────────────────────────────────────────────────────────────────
M-019 | PROFESSION BONUSES
───────────────────────────────────────────────────────────────────────────────
Status:      PARTIALLY_KNOWN
Importance:  LOW (conditional — likely not in static power display)

Description:
  Conditional stat bonuses based on the player's chosen Profession,
  active only in specific battle contexts.

Current Verified Knowledge (source EV-011):
  - Homeland Defender: +5% ATK/DEF when own city is under attack.
  - Invasion Force: +5% ATK/DEF when attacking another player.
  - Reinforcement: +1% ATK/DEF/HP when reinforcing an ally.
  Source: community guides. None personally verified.

Current Unknowns:
  - Whether profession bonuses appear in Squad Power display (likely NO).
  - Exact trigger conditions for each profession bonus.

Dependencies:
  Depends on: Battle context (situational)

Affected Systems:
  - Combat modifiers only (not Squad Power display — hypothesis)

Evidence:        EV-011

Experiments:     EXP-018 (low priority)

Open Questions:
  Q1: If profession bonuses don't affect Squad Power display, they are
      out of scope for the base power engine (still needed for combat simulation).

───────────────────────────────────────────────────────────────────────────────
M-020 | TYPE COUNTER (FORMATION ADVANTAGE)
───────────────────────────────────────────────────────────────────────────────
Status:      PARTIALLY_KNOWN
Importance:  LOW (combat mechanic, likely not in Squad Power display)

Description:
  The damage modifier applied when a troop type fights against the type
  it counters in the game's triangle system.

Current Verified Knowledge (source EV-012):
  - Counter triangle: Tank > Missile > Aircraft > Tank.
  - Counter type takes 80% damage (20% reduction).
  Source: game tutorial + community. Broadly consistent.

Current Unknowns:
  - Whether this modifier affects Squad Power display (likely NO).
  - Whether the 20% is a hard reduction or soft cap that interacts with other modifiers.

Evidence:        EV-012

Experiments:     [none — low priority]

Open Questions:
  Q1: If squads of different types fight, does the game apply counter to each troop
      individually or to the squad as a whole?

───────────────────────────────────────────────────────────────────────────────
M-021 | DECORATION STAT BONUSES
───────────────────────────────────────────────────────────────────────────────
Status:      UNKNOWN
Importance:  MEDIUM

Description:
  Hero ATK/DEF/HP bonuses (flat or %) provided by equipping and upgrading
  Decorations.

Current Verified Knowledge:
  - Decoration system exists.
  - UR decorations are known to provide hero stat bonuses.
  - Percentage bonuses (Crit, Skill Damage, Damage Reduction) appear at level 3+.

Current Unknowns:
  - Exact flat stat values per decoration per level.
  - Whether decorations provide flat bonuses, % bonuses, or both.
  - Whether decorations affect Squad Power display.
  - Complete list of decorations and their stats.
  - Whether set bonuses exist for owning multiple decorations.

Dependencies:
  Depends on: M-003 (need baseline hero stats to measure delta)

Affected Systems:
  - Hero stats → Squad Power (M-001)

Evidence:        [none with numeric values]

Experiments:     EXP-019

Open Questions:
  Q1: Since there are 62+ decorations, what is the most efficient subset to test?

───────────────────────────────────────────────────────────────────────────────
M-022 | COMMANDER SYSTEM — STAT CONTRIBUTIONS
───────────────────────────────────────────────────────────────────────────────
Status:      UNKNOWN
Importance:  MEDIUM

Description:
  Bonuses provided by the Commander system (level, skills, etc.)
  that affect combat or economy stats.

Current Verified Knowledge:
  - Commander system exists.
  - It provides bonuses of some kind.

Current Unknowns:
  - All numeric values.
  - Which stats are affected.
  - Whether it affects Squad Power display.

Evidence:        [none]
Experiments:     EXP-020


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — EVIDENCE DATABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Format: Evidence entries are immutable once created. New data creates a new
entry. Contradictions are recorded as separate entries with notes.

───────────────────────────────────────────────────────────────────────────────
EV-001 | TROOP TIER BASE POWER VALUES
───────────────────────────────────────────────────────────────────────────────
Game Version:  Unknown
Date:          Unknown (community source, pre-2026)
Source Type:   Community (multiple guides, Reddit)
Mechanic:      M-002

Observed Values:
  T1=24, T2=50, T3=80, T4=120, T5=200, T6=300, T7=500, T8=800, T9=1200, T10=1647

Verification Status:  NOT VERIFIED (community-sourced only)
Notes:
  T10=1647 is a non-round number. If correct, suggests base power is looked
  up from a table rather than computed from a formula.
  Multiple independent community sources agree on these values.
  Personal verification required before any engine implementation.

───────────────────────────────────────────────────────────────────────────────
EV-002 | HERO LEVEL CAP RULE
───────────────────────────────────────────────────────────────────────────────
Game Version:  Unknown
Date:          Observed in current build
Source Type:   Direct observation (in-game UI text)
Mechanic:      M-004

Observed Values:
  Hero max level = HQ Level × 5
  Absolute maximum = 175 (at HQ Level 35)

Verification Status:  NOT VERIFIED (read from UI, not tested by hitting the cap)
Notes:
  UI clearly states this relationship. High confidence but not tested by
  attempting to level a hero past the cap.

───────────────────────────────────────────────────────────────────────────────
EV-003 | EXCLUSIVE WEAPON UNLOCK REQUIREMENT
───────────────────────────────────────────────────────────────────────────────
Game Version:  Unknown
Date:          Observed in current build
Source Type:   Direct observation (in-game UI)
Mechanic:      M-010, M-005

Observed Values:
  Exclusive Weapon requires hero to be at 5★.

Verification Status:  NOT VERIFIED (no screenshot on file)
Notes: UI locks EW behind 5★ promotion. Community universally agrees.

───────────────────────────────────────────────────────────────────────────────
EV-004 | RESEARCH TREE STRUCTURE AND NODE EFFECTS
───────────────────────────────────────────────────────────────────────────────
Game Version:  Unknown
Date:          2026 (scraped during project development)
Source Type:   Web scrape (cpt-hedge.com)
Mechanic:      M-009

Observed Values:
  19 research trees documented.
  All nodes with ID, name, effect description, pctPerLv.
  Full data stored in: lib/research-data.json, lib/research-effects.ts

Verification Status:  NOT VERIFIED (scraped from third-party site, not cross-checked with in-game)
Notes:
  pctPerLv values come from the scraped effect description text, not from
  in-game stat measurements. Example: "+2% Tank ATK" → pctPerLv=2.
  Need to verify: does the game actually give +2.0% per level or is it
  +1.9%, +2.1%, etc. (i.e. is the text description exact)?

───────────────────────────────────────────────────────────────────────────────
EV-005 | EXCLUSIVE WEAPON LV10 AND LV20 EFFECTS
───────────────────────────────────────────────────────────────────────────────
Game Version:  Unknown
Date:          Unknown (community source)
Source Type:   Community guides
Mechanic:      M-010

Observed Values:
  EW Lv10: "+5% team buff" (stat type and scope unknown)
  EW Lv20: "+7.5% ATK/DEF/HP to all heroes of same troop type in formation"

Verification Status:  NOT VERIFIED
Notes:
  "Team buff" at lv10 is vague — unknown if ATK only, or ATK+DEF+HP.
  "Same troop type in formation" scope is ambiguous.
  Both values are unverified community claims.

───────────────────────────────────────────────────────────────────────────────
EV-006 | WALL OF HONOR BONUS RATES
───────────────────────────────────────────────────────────────────────────────
Game Version:  Unknown
Date:          Unknown (community source)
Source Type:   Community guides
Mechanic:      M-012

Observed Values:
  Main UR heroes:         +0.50% per 50 WoH levels to troop ATK or DEF or HP
  Promotable SSR→UR:      +0.25% per 50 WoH levels
  Load/utility heroes:    +1.00% per 50 WoH levels to Troop Load Capacity

Verification Status:  NOT VERIFIED
Notes:
  Consistently reported across community sources. Specific hero → stat type
  mapping (which heroes give ATK vs DEF vs HP) not fully documented.

───────────────────────────────────────────────────────────────────────────────
EV-007 | SQUAD COMPOSITION BONUS VALUES
───────────────────────────────────────────────────────────────────────────────
Game Version:  Unknown
Date:          Unknown (community source)
Source Type:   Community guides
Mechanic:      M-013

Observed Values:
  3 same type:      +5% ATK/DEF/HP
  3+2 composition:  +10% ATK/DEF/HP
  4 same type:      +15% ATK/DEF/HP
  5 mono:           +20% ATK/DEF/HP

Verification Status:  NOT VERIFIED
Notes:
  Source untraced. Values not tested. Stat scope (troops vs heroes vs both) unknown.

───────────────────────────────────────────────────────────────────────────────
EV-008 | VS TECHNOLOGY MULTIPLIERS
───────────────────────────────────────────────────────────────────────────────
Game Version:  Unknown
Date:          Unknown (community source)
Source Type:   Community / cpt-hedge.com
Mechanic:      M-014

Observed Values:
  Lv0=×1.00, Lv1=×1.10, Lv2=×1.20, Lv3=×1.35, Lv4=×1.50, Lv5=×1.75, Lv6=×2.00

Verification Status:  NOT VERIFIED
Notes:
  Non-linear progression. Confirmed by multiple sources. Not personally tested.

───────────────────────────────────────────────────────────────────────────────
EV-009 | VIP HIGH-LEVEL COMBAT BONUSES
───────────────────────────────────────────────────────────────────────────────
Game Version:  Unknown
Date:          Unknown (community source)
Source Type:   Community guides
Mechanic:      M-017

Observed Values:
  VIP Lv10: +2.5% hero ATK/DEF/HP
  VIP Lv18: +12.5% hero HP/ATK/DEF

Verification Status:  NOT VERIFIED
Notes:
  Only lv10 and lv18 values reported. Full table unknown.

───────────────────────────────────────────────────────────────────────────────
EV-010 | BUILDINGS DATA (62 BUILDINGS)
───────────────────────────────────────────────────────────────────────────────
Game Version:  Unknown
Date:          2026 (scraped during project development)
Source Type:   Web scrape (cpt-hedge.com)
Mechanic:      M-018

Observed Values:
  62 buildings documented with: name, season, levels, costs, bonuses.
  Stored in lib/buildings-data.json.

Verification Status:  NOT VERIFIED (scraped from third-party)
Notes:
  Bonus values (e.g. +X% Hero HP) come from scraped text.
  Whether these match actual in-game values has not been confirmed.

───────────────────────────────────────────────────────────────────────────────
EV-011 | PROFESSION BONUSES
───────────────────────────────────────────────────────────────────────────────
Game Version:  Unknown
Date:          Unknown (community source)
Source Type:   Community guides
Mechanic:      M-019

Observed Values:
  Homeland Defender: +5% ATK/DEF when defending own city
  Invasion Force:    +5% ATK/DEF when attacking another player
  Reinforcement:     +1% ATK/DEF/HP when reinforcing

Verification Status:  NOT VERIFIED

───────────────────────────────────────────────────────────────────────────────
EV-012 | TYPE COUNTER RULE
───────────────────────────────────────────────────────────────────────────────
Game Version:  Unknown
Date:          From game tutorial + community
Source Type:   Game Tutorial + Community
Mechanic:      M-020

Observed Values:
  Triangle: Tank beats Missile, Missile beats Aircraft, Aircraft beats Tank.
  Counter advantage: target takes 80% damage (20% reduction).

Verification Status:  NOT VERIFIED (high community consensus but not measured)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — EXPERIMENT DATABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

───────────────────────────────────────────────────────────────────────────────
EXP-001 | SQUAD POWER FORMULA CALIBRATION
───────────────────────────────────────────────────────────────────────────────
Goal:
  Determine the mathematical structure of the Squad Power formula.
  Does power = troops_only? troops + hero? troops × modifier? Something else?

Status:         PENDING
Priority:       CRITICAL — blocks all other mechanics from producing output
Mechanic:       M-001, M-002

Required Setup:
  - A squad where every variable is controlled:
    - Exactly N troops of one type, one tier (e.g. 1000 T5 Tank)
    - Zero heroes in the squad
    - Zero research bonuses (or a known fixed baseline)
  - Record Squad Power

Required Data (step by step):
  Step 1: Squad with 1000 T5 Tanks, zero heroes, zero bonuses.
          Record Squad Power. Expected if base-only: 1000 × 200 = 200,000
          Actual: [PENDING]

  Step 2: Change count to 2000 T5 Tanks. Record power.
          If power doubles → count is linear in formula.
          Actual: [PENDING]

  Step 3: Add one hero (lv1, 1★, no gear) to the squad.
          Record delta. This is the hero's power contribution at minimum state.
          Actual: [PENDING]

  Step 4: Add exactly 1 research node at lv1 (e.g. Tank ATK I = +2% Tank ATK).
          Record power delta.
          Actual: [PENDING]

Method:
  Compare observed values at each step to possible formula hypotheses.
  A confirmed hypothesis eliminates all others.

Expected Result:
  Formula type confirmed: additive/multiplicative, hero contribution model.

Actual Result:  PENDING
Evidence Generated: [none yet]

Next Steps after completion:
  If M-001 resolved → immediately begin EXP-002 (hero base stats).

───────────────────────────────────────────────────────────────────────────────
EXP-002 | HERO BASE STATS AT MINIMUM STATE
───────────────────────────────────────────────────────────────────────────────
Goal:
  Record the base ATK, DEF, HP of multiple heroes at level 1, 1★,
  with no gear, no EW, no decorations.

Status:         PENDING
Priority:       CRITICAL
Mechanic:       M-003

Required Data:
  For each hero: lv1, 1★, no gear, EW=0, WoH=0, no decorations.
  Record: ATK, DEF, HP from hero detail screen.

  Minimum hero set:
    - 1 UR Tank hero
    - 1 UR Aircraft hero
    - 1 UR Missile hero
    - 1 SSR hero (any type)
    - 1 SR hero if available

Method:
  Screenshot each hero's stat screen. Record exact integers.
  Note: the game may display rounded values. Record all visible digits.

Expected Result:
  Base stat table per rarity/type.
  Determines: are UR base stats identical across all UR heroes?

Actual Result:  PENDING
Evidence Generated: [none yet]

Next Steps after completion:
  → Begin EXP-003 (level growth formula)

───────────────────────────────────────────────────────────────────────────────
EXP-003 | HERO STAT GROWTH PER LEVEL
───────────────────────────────────────────────────────────────────────────────
Goal:
  Determine the formula by which hero ATK/DEF/HP scale from level 1 to 175.

Status:         PENDING — requires EXP-002 first
Priority:       CRITICAL
Mechanic:       M-004

Required Data:
  Same hero, same star (1★), same gear (none), different levels:
  - Level 1, 25, 50, 75, 100, 125, 150, 175
  - Record ATK, DEF, HP at each level.
  Minimum 5 data points. 8 preferred.

Method:
  1. Collect stat values at each level checkpoint.
  2. Compute first differences (delta between consecutive levels).
  3. If first differences are constant → linear growth.
  4. If first differences increase → polynomial/exponential.
  5. If first differences have jumps at specific levels → piecewise.
  6. Fit the appropriate formula to the data.

Expected Result:
  Formula type + coefficients, OR a lookup table if no formula fits.

Actual Result:  PENDING
Evidence Generated: [none yet]

───────────────────────────────────────────────────────────────────────────────
EXP-004 | HERO STAR SCALING (1★ → 5★)
───────────────────────────────────────────────────────────────────────────────
Goal:
  Determine the multiplier or additive bonus per star promotion.

Status:         PENDING — requires EXP-002 first
Priority:       CRITICAL
Mechanic:       M-005

Required Data:
  Same hero, same level (fix at e.g. lv100), same gear (none):
  - At 1★, 2★, 3★, 4★, 5★
  - Record ATK, DEF, HP at each star level.

Method:
  Compute ratio between consecutive star levels.
  If ratios are constant → uniform multiplier per star.
  If ratios differ → per-transition table.

Expected Result:
  Per-star multiplier table or additive % per star.

Actual Result:  PENDING
Evidence Generated: [none yet]

───────────────────────────────────────────────────────────────────────────────
EXP-005 | GEAR SLOT TO STAT TYPE MAPPING
───────────────────────────────────────────────────────────────────────────────
Goal:
  Confirm which stat (ATK/DEF/HP/other) each of the 4 gear slots provides.

Status:         PENDING — requires EXP-002 first (need baseline hero stats)
Priority:       HIGH
Mechanic:       M-006

Required Data (4 tests, each isolating one slot):
  Baseline: hero with zero gear → ATK, DEF, HP
  Test 1: equip ONLY Common Cannon lv1 → record ATK, DEF, HP delta
  Test 2: equip ONLY Common Chip lv1 → record ATK, DEF, HP delta
  Test 3: equip ONLY Common Armor lv1 → record ATK, DEF, HP delta
  Test 4: equip ONLY Common Radar lv1 → record ATK, DEF, HP delta

Method:
  Each test: equip one piece, compare all three stats.
  The stat that changes identifies the slot's primary contribution.
  Check if multiple stats change in a single test.

Expected Result:
  Map: { Cannon: "ATK", Chip: "?", Armor: "?", Radar: "?" }

Actual Result:  PENDING
Evidence Generated: [none yet]

───────────────────────────────────────────────────────────────────────────────
EXP-006 | GEAR STAT VALUES (QUALITY AND LEVEL SCALING)
───────────────────────────────────────────────────────────────────────────────
Goal:
  Build a partial gear stat lookup table: quality × level → stat delta.

Status:         PENDING — requires EXP-005 first
Priority:       HIGH
Mechanic:       M-007

Required Data (minimum viable):
  For Cannon (or whichever slot is confirmed as ATK from EXP-005):
  - Common lv1 → ATK delta
  - Common lv10 → ATK delta
  - Common lv20 → ATK delta
  - Common lv40 → ATK delta
  - Rare lv1 → ATK delta (to establish quality ratio)
  - Legendary lv1 → ATK delta (upper bound)

Method:
  Equip gear, record delta vs no-gear baseline.
  Plot level vs stat to identify growth curve type.
  Compute quality ratios from lv1 values.

Expected Result:
  Growth curve type (linear/stepped/other) + quality ratios.

Actual Result:  PENDING
Evidence Generated: [none yet]

───────────────────────────────────────────────────────────────────────────────
EXP-007 | RESEARCH BONUS → SQUAD POWER DELTA VERIFICATION
───────────────────────────────────────────────────────────────────────────────
Goal:
  Verify that a known research bonus (e.g. +2% Tank ATK) causes a predictable
  Squad Power change, and determine whether the % is applied to troop base
  power or to something else.

Status:         PENDING — requires EXP-001 first
Priority:       HIGH
Mechanic:       M-009, M-016

Required Data:
  - Controlled squad: N Tank troops of one tier, zero heroes, known power.
  - Unlock Tank ATK I research at lv1 (+2% Tank ATK).
  - Record new Squad Power.
  - Delta / (N × tier_base) should equal 2% if applied to troop base.

Actual Result:  PENDING
Evidence Generated: [none yet]

───────────────────────────────────────────────────────────────────────────────
EXP-008 | WALL OF HONOR → SQUAD POWER DELTA
───────────────────────────────────────────────────────────────────────────────
Goal:
  Confirm WoH bonuses appear in Squad Power and verify the bonus rate.

Status:         PENDING
Priority:       HIGH
Mechanic:       M-012

Required Data:
  - Squad with one hero (known type), controlled troops.
  - Record Squad Power at WoH lv0.
  - Add WoH levels to the hero (minimum 50 levels for first bonus tier).
  - Record Squad Power delta.
  - Compare to expected +0.50% for main UR hero.

Actual Result:  PENDING

───────────────────────────────────────────────────────────────────────────────
EXP-009 | EXCLUSIVE WEAPON FULL LEVEL TABLE (1–30)
───────────────────────────────────────────────────────────────────────────────
Goal:
  Document stat bonus or effect at every EW level from 1 to 30.

Status:         PENDING
Priority:       HIGH
Mechanic:       M-010

Required Data:
  - One hero with EW (any level is fine to start from)
  - Screenshot or record of EW level description at each level 1–30
  - Power delta before and after lv10 upgrade
  - Power delta before and after lv20 upgrade

Actual Result:  PENDING

───────────────────────────────────────────────────────────────────────────────
EXP-010 | DRONE STAT CONTRIBUTION
───────────────────────────────────────────────────────────────────────────────
Goal:
  Determine what stats the drone provides and whether they appear in
  Squad Power display.

Status:         PENDING
Priority:       HIGH
Mechanic:       M-011

Required Data:
  - Squad Power at drone lv0, combat boost 0, no chips.
  - Screenshot of drone stats panel (showing ATK%, DEF%, HP% if any).
  - Increase drone level by 10 levels → record power delta.

Actual Result:  PENDING

───────────────────────────────────────────────────────────────────────────────
EXP-011 | COMPOSITION BONUS VERIFICATION
───────────────────────────────────────────────────────────────────────────────
Goal:
  Verify composition bonus values and determine what they are applied to.

Status:         PENDING — requires EXP-001 first
Priority:       HIGH
Mechanic:       M-013

Required Data:
  - Squad: 5 heroes of 5 different types (if possible) → Squad Power P0
  - Swap to: 5 heroes all same type → Squad Power P1
  - Delta = P1 - P0
  - What percentage of P0 is the delta?

Actual Result:  PENDING

───────────────────────────────────────────────────────────────────────────────
EXP-012 | VIP COMBAT BONUS FULL TABLE
───────────────────────────────────────────────────────────────────────────────
Goal:
  Document all VIP level bonuses that affect combat stats.

Status:         PENDING
Priority:       MEDIUM
Mechanic:       M-017

Required Data:
  Single screenshot of the in-game VIP benefits panel
  showing all bonuses at each VIP level 1–18.

Actual Result:  PENDING

───────────────────────────────────────────────────────────────────────────────
EXP-013 | ALLIANCE TECHNOLOGY — FULL BONUS TABLE
───────────────────────────────────────────────────────────────────────────────
Goal:
  Document every alliance tech node with its effect and bonus values.

Status:         PENDING
Priority:       HIGH
Mechanic:       M-015

Required Data:
  Full screenshot(s) of Alliance Technology research tree.
  Each node's description, current level, and max level.

Actual Result:  PENDING

───────────────────────────────────────────────────────────────────────────────
EXP-014 | BONUS STACKING ORDER TEST
───────────────────────────────────────────────────────────────────────────────
Goal:
  Determine whether % bonuses from different sources stack additively or
  multiplicatively with each other.

Status:         PENDING — requires EXP-001 and EXP-007 first
Priority:       CRITICAL
Mechanic:       M-016

Required Data:
  Using research bonuses as isolated % source (research is controllable):
  - Squad Power at 0% Tank ATK research bonus → P0
  - Squad Power at +10% Tank ATK research bonus → P1
  - Squad Power at +20% Tank ATK research bonus → P2
  - Check: is (P1 - P0) == (P2 - P1)?  → linear (additive within source)

  Then add a second independent source (e.g. WoH):
  - Squad Power at +10% research + +10% WoH → P3
  - If P3 - P0 = 20% × base: additive across sources
  - If P3 - P0 > 20% × base: multiplicative across sources

Actual Result:  PENDING


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — DEPENDENCY GRAPH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Read as: "X ← Y" means Y must be resolved before X can be computed.

SQUAD POWER (M-001)
  ← TROOP POWER COMPONENT
      ← Troop count (profile input)
      ← Troop tier (profile input)
      ← Troop tier base power (M-002)
  ← HERO POWER COMPONENT (formula unknown)
      ← Hero stats at current state
          ← Hero base stats (M-003) ← [CRITICAL UNKNOWN]
          ← Level growth (M-004)   ← M-003
          ← Star scaling (M-005)   ← M-003
          ← Gear contribution
              ← Gear slot mapping (M-006) ← M-003
              ← Gear stat values (M-007)  ← M-006
  ← % MODIFIERS APPLIED TO [unknown target]
      ← Research bonuses (M-009)
      ← Wall of Honor (M-012)
      ← Exclusive Weapon (M-010)     ← M-005 (requires 5★)
      ← Drone stats (M-011)
      ← Composition bonus (M-013)
      ← VS Tech multiplier (M-014)
      ← Alliance Tech (M-015)
      ← VIP combat bonus (M-017)
      ← Buildings hero bonus (M-018)
      ← Decorations (M-021)
  ← STACKING ORDER (M-016) — determines how all modifiers combine
                              ← All modifier sources above

CRITICAL PATH TO FIRST OUTPUT:
  M-002 → EXP-001 → M-001 (formula) → M-003 → M-004 → M-005 → first power estimate

Nothing in HERO POWER COMPONENT can be computed until M-003 is solved.
Nothing in the OUTPUT can be calibrated until M-001 is solved.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — RESEARCH TIMELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Milestones are defined by capability, not by arbitrary accuracy percentages.
A milestone is complete when the engine can produce the described output.

───────────────────────────────────────────────────────────────────────────────
MILESTONE 1 | FIRST REPRODUCIBLE SQUAD POWER ESTIMATE
───────────────────────────────────────────────────────────────────────────────
Definition:
  The engine can compute a Squad Power value for a given squad configuration
  that we can explain and defend — even if it has systematic error.

Status:  BLOCKED

Required before this milestone:
  ✗ M-001 — Power formula (EXP-001)
  ✗ M-002 — Troop base power (verification step in EXP-001)
  ✗ M-003 — Hero base stats (EXP-002)

What this milestone enables:
  - The engine produces a number.
  - We can show a user their squad power with a known margin of error.
  - All subsequent milestones are refinements of this output.

Experiments required: EXP-001, EXP-002

───────────────────────────────────────────────────────────────────────────────
MILESTONE 2 | HERO STATS FULLY MODELED
───────────────────────────────────────────────────────────────────────────────
Definition:
  The engine can compute a hero's ATK/DEF/HP at any level and star count,
  and can apply gear contributions. Hero contribution to squad power
  is computed from first principles, not approximated.

Status:  BLOCKED on Milestone 1

Required before this milestone:
  ✗ M-004 — Hero level growth formula (EXP-003)
  ✗ M-005 — Hero star scaling (EXP-004)
  ✗ M-006 — Gear slot mapping (EXP-005)
  ✗ M-007 — Gear stat values (EXP-006)

What this milestone enables:
  - Full hero stat calculation without approximation.
  - Gear recommendations become possible.
  - Upgrade planner can compute hero power contribution.

───────────────────────────────────────────────────────────────────────────────
MILESTONE 3 | ALL MAJOR MODIFIER SOURCES CALIBRATED
───────────────────────────────────────────────────────────────────────────────
Definition:
  All major sources of % bonuses (research, WoH, EW, composition,
  alliance tech, buildings, drone) are verified and integrated.
  Stacking order is confirmed.

Status:  BLOCKED on Milestone 2

Required before this milestone:
  ✗ M-016 — Bonus stacking order (EXP-014)
  ✗ M-009 — Research → power delta verified (EXP-007)
  ✗ M-012 — WoH → power delta verified (EXP-008)
  ✗ M-010 — EW full level table (EXP-009)
  ✗ M-011 — Drone stat contribution (EXP-010)
  ✗ M-013 — Composition bonus verified (EXP-011)
  ✗ M-015 — Alliance tech values (EXP-013)

What this milestone enables:
  - Engine output matches game within measurement noise for most squads.
  - Meaningful ROI comparisons between upgrade paths become possible.

───────────────────────────────────────────────────────────────────────────────
MILESTONE 4 | ENGINE OUTPUT MATCHES GAME WITHIN MEASUREMENT PRECISION
───────────────────────────────────────────────────────────────────────────────
Definition:
  Given a full squad configuration (all heroes, all gear, all bonuses),
  the engine output matches the in-game Squad Power display exactly,
  or within ±1% which may be explained by rounding differences.

Status:  BLOCKED on Milestone 3

Required before this milestone:
  ✗ M-017 — VIP full combat table (EXP-012)
  ✗ M-021 — Decoration stat values (EXP-019)
  ✗ M-022 — Commander contributions (EXP-020)
  ✗ Systematic calibration across diverse squad configurations

What this milestone enables:
  - Engine can be trusted for all user-facing calculations.
  - AI Advisor recommendations are based on verified math.
  - OCR validation against game screenshots becomes meaningful.

───────────────────────────────────────────────────────────────────────────────
MILESTONE 5 | COMBAT SIMULATION (BEYOND POWER DISPLAY)
───────────────────────────────────────────────────────────────────────────────
Definition:
  Engine can simulate actual combat outcomes, not just Squad Power numbers.
  Includes type counters, profession bonuses, situational modifiers,
  warzone/season buffs.

Status:  BLOCKED on Milestone 4

Required before this milestone:
  ✗ M-019 — Profession bonuses (EXP-018)
  ✗ M-020 — Type counter mechanics fully verified
  ✗ Warzone/season buff research (not yet in database)
  ✗ Temporary buff item research (not yet in database)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6 — PRIORITY MATRIX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Priority is determined by position in the critical path to Milestone 1.
Research items not on the critical path to Milestone 1 are DEFERRED until
Milestone 1 is achieved.

CRITICAL — Blocks Milestone 1 entirely
  M-001  Squad Power Formula
  M-002  Troop Base Power (verification)
  M-003  Hero Base Stats
  M-016  Bonus Stacking Order (blocks calibration)

HIGH — Required for Milestone 2 or 3
  M-004  Hero Level Growth
  M-005  Hero Star Scaling
  M-006  Gear Slot Mapping
  M-007  Gear Stat Values
  M-009  Research → Power delta
  M-010  EW Full Level Table
  M-011  Drone Stats
  M-012  WoH → Power delta
  M-013  Composition Bonus
  M-015  Alliance Tech Values

MEDIUM — Required for Milestone 4
  M-017  VIP Full Combat Table
  M-018  Buildings Bonus Verification
  M-021  Decoration Stats
  M-022  Commander Contributions
  M-014  VS Tech Effect Verification

LOW — Required for Milestone 5 only
  M-019  Profession Bonuses
  M-020  Type Counter (in combat sim only)
  Warzone/Season buffs (not yet in database)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 7 — OPEN QUESTIONS REGISTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions that cut across multiple mechanics and must be answered
before the engine can be confidently implemented.

OQ-001: Does the game display rounded Squad Power or exact Squad Power?
  Impact: If rounded, small errors in the engine may be invisible or
  exaggerated by rounding. Determines required precision of formulas.
  Resolve by: recording Squad Power while knowing the exact expected value.

OQ-002: Are % bonuses applied to troops, heroes, or the combined power total?
  Impact: Fundamental to the power formula. Changes which inputs the engine
  applies each modifier to.
  Resolve by: EXP-001 (isolation tests).

OQ-003: Are all percentage bonuses from the same category pooled and applied
  once, or does each source compound independently?
  Impact: This is M-016. Determines whether engine uses additive or
  multiplicative stacking.
  Resolve by: EXP-014.

OQ-004: Do WoH, EW, and composition bonuses apply only to the active squad,
  or persist globally across all squads?
  Impact: If global, the engine must compute them once per account.
  If per-squad, the engine must compute them per-squad.
  Resolve by: Compare Squad Power of two different squads after changing WoH.

OQ-005: Are empty squad slots treated as neutral (no bonus, no penalty),
  or do they disable composition bonuses entirely?
  Impact: Affects squads with fewer than 5 heroes.
  Resolve by: Build a 3-hero squad vs 5-hero squad with same heroes.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 8 — CHANGELOG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2026-07-13  v0.2  Complete rewrite. Removed all estimated percentages and
                  arbitrary confidence values. Strict VERIFIED/PARTIALLY_KNOWN/
                  UNKNOWN methodology. Added Open Questions register.
                  Added full Research Timeline with capability-based milestones.

2026-07-13  v0.1  Initial draft (contained unverified estimates — superseded).


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF DATABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
