// ============================================================
// LASTWAR COMPANION — Hero Level & Skill Data
// Sources: lastwar.wiki, theriagames.com, grindnstrat.com
// Confidence: confirmed unless marked ~estimated
// ============================================================

// ── Hero Level Cap ────────────────────────────────────────────

/**
 * Hero max level = HQ Level × 5
 * Confirmed: lastwar.wiki (HQ 20 = L100, HQ 30 = L150)
 */
export function getHeroLevelCap(hqLevel: number): number {
  return Math.max(5, hqLevel * 5);
}

// ── EXP Required Per Level ────────────────────────────────────

/**
 * EXP cost to advance from level (key) to level (key+1).
 * Source: lastwar.wiki/items/hero-exp/ — confirmed.
 */
export const HERO_EXP_PER_LEVEL: Record<number, number> = {
  1: 100,  2: 200,  3: 300,  4: 400,  5: 500,
  6: 600,  7: 700,  8: 800,  9: 900,  10: 1000,
  11: 1100, 12: 1200, 13: 1300, 14: 1400, 15: 1500,
  16: 1600, 17: 1700, 18: 1800, 19: 1900, 20: 2000,
  21: 2100, 22: 2300, 23: 2700, 24: 3200, 25: 3900,
  26: 4600, 27: 5500, 28: 6600, 29: 8000, 30: 9500,
  31: 12000, 32: 14000, 33: 17000, 34: 20000, 35: 24000,
  36: 29000, 37: 35000, 38: 41000, 39: 49000, 40: 59000,
  41: 71000, 42: 85000, 43: 110000, 44: 130000, 45: 150000,
  46: 180000, 47: 220000, 48: 260000, 49: 310000, 50: 370000,
  51: 440000, 52: 530000, 53: 630000, 54: 760000, 55: 910000,
  56: 1100000, 57: 1400000, 58: 1600000, 59: 1900000, 60: 2100000,
  61: 2300000, 62: 2500000, 63: 2800000, 64: 3100000, 65: 3400000,
  66: 3700000, 67: 4100000, 68: 4500000, 69: 4900000, 70: 5400000,
  71: 5900000, 72: 6500000, 73: 7200000, 74: 7900000, 75: 8700000,
  76: 9500000, 77: 11000000, 78: 12000000, 79: 13000000, 80: 13000000,
  81: 14000000, 82: 14000000, 83: 15000000, 84: 16000000, 85: 17000000,
  86: 18000000, 87: 19000000, 88: 20000000, 89: 21000000, 90: 22000000,
  91: 23000000, 92: 24000000, 93: 25000000, 94: 26000000, 95: 27000000,
  96: 28000000, 97: 30000000, 98: 31000000, 99: 33000000, 100: 35000000,
  101: 37000000, 102: 39000000, 103: 41000000, 104: 43000000, 105: 45000000,
  106: 47000000, 107: 49000000, 108: 51000000, 109: 53000000, 110: 55000000,
  111: 57000000, 112: 59000000, 113: 61000000, 114: 63000000, 115: 65000000,
  116: 67000000, 117: 69000000, 118: 71000000, 119: 73000000, 120: 75000000,
  121: 77000000, 122: 79000000, 123: 81000000, 124: 83000000, 125: 85000000,
  126: 87000000, 127: 89000000, 128: 91000000, 129: 93000000, 130: 95000000,
  131: 97000000, 132: 100000000, 133: 105000000, 134: 108000000, 135: 115000000,
  136: 120000000, 137: 125000000, 138: 130000000, 139: 135000000, 140: 140000000,
  141: 145000000, 142: 150000000, 143: 155000000, 144: 160000000, 145: 165000000,
  146: 170000000, 147: 175000000, 148: 180000000, 149: 185000000,
};

/** Total EXP needed to reach targetLevel from level 1 */
export function getTotalExpToLevel(targetLevel: number): number {
  let total = 0;
  for (let l = 1; l < targetLevel; l++) {
    total += HERO_EXP_PER_LEVEL[l] ?? 0;
  }
  return total;
}

// ── Skill Level Cap ───────────────────────────────────────────

/**
 * Max skill level for upgradeable skills (Auto, Tactics, Passive).
 * Gated by star rank, extended by Exclusive Weapon.
 * Source: grindnstrat.com — confirmed.
 *
 * Stars → Cap:  0★=1, 1★=5, 2★=10, 3★=20, 4★=30, 5★=30
 * EW extends cap (only at 5★): EW10→33, EW20→36, EW30→40
 */
export function getSkillLevelCap(stars: number, ewLevel: number = 0): number {
  let base: number;
  if (stars >= 4) base = 30;
  else if (stars === 3) base = 20;
  else if (stars === 2) base = 10;
  else if (stars === 1) base = 5;
  else base = 1;

  if (stars >= 5) {
    if (ewLevel >= 30) return 40;
    if (ewLevel >= 20) return 36;
    if (ewLevel >= 10) return 33;
  }
  return base;
}

/**
 * Expertise (4th skill slot) unlocks permanently at 4★.
 * Effect: +20% HP, +20% ATK, +20% DEF, +10% Cooldown Rate (UR).
 * SSR pre-promotion: +10% HP/ATK/DEF only.
 * No medals required — it's a fixed passive.
 */
export function isExpertiseUnlocked(stars: number): boolean {
  return stars >= 4;
}

// ── Skill Medal Costs ─────────────────────────────────────────

/**
 * Medal cost to upgrade a UR skill from level N to N+1.
 * Index 0 = cost for L1→L2, index 38 = L39→L40.
 * Source: lastwar.wiki/items/skill-medal/ + theriagames.com (two sources agree).
 */
const SKILL_MEDAL_COSTS_UR: number[] = [
  200,   // 1→2
  200,   // 2→3
  400,   // 3→4
  400,   // 4→5
  600,   // 5→6
  600,   // 6→7
  800,   // 7→8
  800,   // 8→9
  1200,  // 9→10
  1600,  // 10→11
  2400,  // 11→12
  3200,  // 12→13
  4000,  // 13→14
  4800,  // 14→15
  5600,  // 15→16
  6400,  // 16→17
  7200,  // 17→18
  8000,  // 18→19
  9200,  // 19→20
  10400, // 20→21
  11600, // 21→22
  12800, // 22→23
  14000, // 23→24
  15200, // 24→25
  16400, // 25→26
  18000, // 26→27
  20000, // 27→28
  22000, // 28→29
  24000, // 29→30
  26000, // 30→31
  28000, // 31→32
  30000, // 32→33
  32000, // 33→34
  34000, // 34→35
  36000, // 35→36
  38000, // 36→37
  40000, // 37→38
  42000, // 38→39
  44000, // 39→40
];

/** Medal cost to upgrade skill from `fromLevel` to `fromLevel+1`. Returns 0 if maxed/invalid. */
export function getSkillMedalCost(
  rarity: "UR" | "SSR" | "SR",
  fromLevel: number,
): number {
  if (fromLevel < 1 || fromLevel >= 40) return 0;
  const urCost = SKILL_MEDAL_COSTS_UR[fromLevel - 1] ?? 0;
  if (rarity === "SSR") return Math.round(urCost * 0.9);
  if (rarity === "SR")  return Math.round(urCost * 0.8);
  return urCost;
}

/** Total medals needed to bring a skill from L1 to targetLevel. */
export function getTotalSkillMedalCost(
  rarity: "UR" | "SSR" | "SR",
  targetLevel: number,
): number {
  let total = 0;
  for (let l = 1; l < Math.min(targetLevel, 41); l++) {
    total += getSkillMedalCost(rarity, l);
  }
  return total;
}

// ── Skill Slot Metadata ───────────────────────────────────────

export const HERO_SKILL_SLOTS = [
  { index: 0, key: "auto",    namePL: "Auto-Atak",  nameEN: "Auto-Attack", icon: "⚔",  color: "#F87171", priority: 3 },
  { index: 1, key: "tactics", namePL: "Taktyka",    nameEN: "Tactics",     icon: "⚡",  color: "#FBBF24", priority: 1 },
  { index: 2, key: "passive", namePL: "Pasywna",    nameEN: "Passive",     icon: "🛡",  color: "#34D399", priority: 2 },
] as const;

/** Milestone levels that give extra bonus at that star-cap threshold */
export const SKILL_MILESTONE_LEVELS = [5, 10, 20, 30, 33, 36, 40];

/** Human-readable label for what unlocks at each skill cap */
export const SKILL_CAP_UNLOCK_LABEL: Record<number, string> = {
  5:  "1★",
  10: "2★",
  20: "3★",
  30: "4★",
  33: "EW L10",
  36: "EW L20",
  40: "EW L30",
};

// ── Exclusive Weapon (EW) ─────────────────────────────────────

/**
 * Exclusive Weapon system.
 * Sources: lastwarvault.com, lastwargame.online, lastwarhandbook.com, ldshop.gg — confirmed.
 *
 * UNLOCK: Hero at 5★ UR + 50 hero-named shards (Universal EW shards NOT accepted for initial unlock).
 *
 * SHARD COSTS (named OR universal shards accepted for upgrades after unlock):
 *   Lv 1 (unlock): 50 named
 *   Lv 2–5:  20/lvl
 *   Lv 6–10: 40/lvl
 *   Lv 11–15: 60/lvl
 *   Lv 16–20: 100/lvl  → cumulative total to Lv 20: 1,130 shards
 *   Lv 21–25: 150/lvl
 *   Lv 26–30: 200/lvl  → cumulative total to Lv 30: 2,880 shards
 *
 * OVER-CAP (unlocked after Lv 30):
 *   3 tracks in order: ATK → HP → DEF (next track unlocks after previous reaches Lv 10)
 *   Each track: 50 levels × 10 shards/level = 500 shards per track
 *   Total over-cap investment: 1,500 shards (grand total fully complete: ~4,380 shards)
 *   Community consensus: low priority until ALL squad weapons are at Lv 20
 *
 * KEY RULES:
 *   - Lv 20 is the main competitive threshold (unlocks +7.5% type bonus + gates S6 Awakening)
 *   - The +7.5% Type Specialist bonus does NOT stack across multiple weapons of the same type —
 *     one Lv 20 weapon per troop type is enough to activate it; additional Lv 20 weapons
 *     of the same type add their skill effects only, not another +7.5%
 *   - Skill level cap: +1 per 3 EW levels (base 30 → max 40 at EW Lv 30)
 *   - S6 Hero Awakening requires EW at Lv 20 as a hard prerequisite (no shortcut)
 */
export const EW_MILESTONES = [
  { level:  1, skillCap: 30, label: "Odblokowuje 2. umiejętność broni" },
  { level: 10, skillCap: 33, label: "Skill cap +3 (Lv.33) · Odblokowuje 3. umiejętność broni" },
  { level: 20, skillCap: 36, label: "Skill cap +6 (Lv.36) · +7.5% ATK/DEF/HP dla całego typu · Wymagane dla Przebudzenia (S6+)" },
  { level: 30, skillCap: 40, label: "Skill cap +10 (Lv.40) · Odblokowuje 4. umiejętność broni · Odblokowuje ścieżki over-cap" },
] as const;

/** Cumulative shard cost to reach EW level N from 0 (pre-unlock).
 *  Tiers: unlock=50, Lv2-5=20, Lv6-10=40, Lv11-15=60, Lv16-20=100, Lv21-25=150, Lv26-30=200.
 *  Verified totals: Lv20=1,130 · Lv30=2,880
 */
export function getEWShardsToLevel(targetLevel: number): number {
  if (targetLevel <= 0) return 0;
  let total = 50; // unlock cost
  for (let l = 2; l <= Math.min(targetLevel, 30); l++) {
    if      (l <= 5)  total += 20;
    else if (l <= 10) total += 40;
    else if (l <= 15) total += 60;
    else if (l <= 20) total += 100;
    else if (l <= 25) total += 150;
    else              total += 200;
  }
  return total;
}

/** Shards needed to go from currentLevel to targetLevel. */
export function getEWShardsRange(fromLevel: number, toLevel: number): number {
  return getEWShardsToLevel(toLevel) - getEWShardsToLevel(fromLevel);
}

/**
 * EW over-cap tracks unlocked after Lv 30.
 * Order: ATK first → HP second (unlocks at ATK Lv10) → DEF third (unlocks at HP Lv10).
 * Cost: 10 shards/level, 50 levels per track = 500 shards each.
 */
export const EW_OVERCAP_TRACKS = [
  { key: "atk", label: "ATK", maxLevel: 50, shardsPerLevel: 10 },
  { key: "hp",  label: "HP",  maxLevel: 50, shardsPerLevel: 10, unlocksPrevTrack: 10 },
  { key: "def", label: "DEF", maxLevel: 50, shardsPerLevel: 10, unlocksPrevTrack: 10 },
] as const;

// ── Wall of Honor (WoH) ───────────────────────────────────────

/**
 * Wall of Honor (Ściana Chwały) — passive, permanent, global stat bonuses.
 * Sources: lastwarvault.com, theriagames.com, lastwarguide.org, heaven-guardian.com — confirmed.
 *
 * UNLOCK: Hero at 5★ + corresponding troop building at Lv.20
 *   (Tank heroes → Tank Center Lv20; Aircraft → Aircraft Center Lv20; Missile → Missile Center Lv20)
 *
 * COST: 1 hero-specific OR 1 universal (purple) hero shard per WoH level — no escalation.
 *
 * BONUSES: Every 50 levels triggers a milestone; bonus rate depends on hero:
 *   +0.50% per 50 lvl — standard UR heroes
 *   +0.25% per 50 lvl — newer/reduced heroes (later seasons); Mason/Violet/Scarlett at SSR rarity
 *   +1.00% per 50 lvl — "load" heroes (Loki/Gump/Ambolt/Kane) BUT this is TROOP LOAD CAPACITY,
 *                        NOT a combat bonus — has zero impact on PvP/PvE damage or survival
 *
 * BONUS TYPE per hero: each hero contributes a specific stat (ATK, DEF, or HP) — not the same
 *   for all heroes. See WOH_BONUS_TYPE below.
 *
 * BONUS SCOPE: applies globally to ALL combat of the matching troop type, regardless of whether
 *   the hero is currently fielded. No need to equip the hero.
 *
 * STACKING: WoH bonuses from different heroes stack additively with each other
 *   (e.g., Morrison +ATK and Schuyler +ATK both apply = double the aircraft ATK bonus).
 *
 * SPECIAL — UR PROMOTION REFUND (Mason, Violet, Scarlett):
 *   These heroes start as SSR (+0.25%/50lvl) but can be promoted to UR (+0.50%/50lvl)
 *   via seasonal events. On promotion, ALL shards previously invested in their WoH are
 *   FULLY REFUNDED (both named and universal). After refund, their bonus rate upgrades to 0.50%.
 *   → Invest before promotion event on Versus Day to earn event points → get full refund → reinvest.
 *
 * VERSUS DAY: Investing WoH shards on Versus Day generates event points (~35M pts per large dump).
 *   NEVER do large WoH investments on non-Versus Days. Accumulate and batch.
 *
 * PRIORITY: ATK > DEF > HP | concentrate on one hero at a time to cross 50-lvl milestones.
 *   Avoid load heroes (Loki/Gump/Ambolt/Kane) — their bonus is useless for combat.
 */
export type WoHCategory = "standard" | "half" | "load";

/** WoH bonus rate category per hero. */
export const WOH_CATEGORY: Record<string, WoHCategory> = {
  // Standard +0.50%/50lvl — UR heroes
  murphy: "standard", kimberly: "standard", marshall: "standard",
  williams: "standard", stetmann: "standard", dva: "standard",
  carlie: "standard", schuyler: "standard", lucius: "standard",
  morrison: "standard", swift: "standard", tesla: "standard",
  mcgregor: "standard", adam: "standard", fiona: "standard",
  // Reduced +0.25%/50lvl — newer/later SSR and reduced-rate heroes
  // Note: mason/violet/scarlett are at 0.25% while SSR; upgrade to 0.50% after UR promotion (full refund on promotion)
  mason: "half", violet: "half", scarlett: "half",
  monica: "half", richard: "half", farhad: "half",
  cage: "half", sarah: "half", maxwell: "half", blaz: "half",
  elsa: "half", venom: "half",
  // Load: +1.00%/50lvl BUT = TROOP LOAD CAPACITY, NOT combat bonus (useless for PvP/PvE)
  loki: "load", gump: "load", ambolt: "load", kane: "load",
};

/**
 * Which stat each hero boosts via Wall of Honor.
 * "Load" = Troop Load Capacity (NOT ATK/DEF/HP — zero combat value).
 */
export type WoHBonusType = "ATK" | "DEF" | "HP" | "Load";

export const WOH_BONUS_TYPE: Record<string, WoHBonusType> = {
  // ATK bonuses
  kimberly: "ATK", morrison: "ATK", schuyler: "ATK",
  fiona: "ATK", swift: "ATK",
  mason: "ATK",   // +ATK (0.25% at SSR → 0.50% at UR after promotion)
  maxwell: "ATK", blaz: "ATK",
  // DEF bonuses
  marshall: "DEF", stetmann: "DEF", dva: "DEF",
  lucius: "DEF", tesla: "DEF",
  richard: "DEF", farhad: "DEF", venom: "DEF", sarah: "DEF",
  // HP bonuses
  murphy: "HP", williams: "HP", carlie: "HP",
  adam: "HP", mcgregor: "HP",
  violet: "HP",   // +HP (0.25% at SSR → 0.50% at UR after promotion)
  scarlett: "HP", // +HP (0.25% at SSR → 0.50% at UR after promotion)
  monica: "HP", cage: "HP", elsa: "HP",
  // Troop Load (NOT combat)
  loki: "Load", gump: "Load", ambolt: "Load", kane: "Load",
};

/** Heroes that can be promoted from SSR → UR (full WoH shard refund on promotion). */
export const WOH_UR_PROMOTABLE = new Set(["mason", "violet", "scarlett"]);

const WOH_RATE: Record<WoHCategory, number> = {
  standard: 0.50,
  half:     0.25,
  load:     1.00,
};

/** Returns total combat stat bonus % from Wall of Honor at a given level (0 for load heroes). */
export function getWoHBonus(heroId: string, wohLevel: number): number {
  const cat = WOH_CATEGORY[heroId] ?? "standard";
  if (cat === "load") return 0; // Troop Load, not a combat bonus
  const rate = WOH_RATE[cat];
  const milestones = Math.floor(wohLevel / 50);
  return milestones * rate;
}

/** Returns % per-milestone for display. */
export function getWoHRatePerMilestone(heroId: string): number {
  const cat = WOH_CATEGORY[heroId] ?? "standard";
  return WOH_RATE[cat];
}

/** Returns the bonus type (ATK/DEF/HP/Load) for display. */
export function getWoHBonusType(heroId: string): WoHBonusType {
  return WOH_BONUS_TYPE[heroId] ?? "ATK";
}
