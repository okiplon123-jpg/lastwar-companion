// ============================================================
// LASTWAR COMPANION — Player Profile
// Stored in localStorage under key "lw-profile"
// ============================================================

import { GearQuality, GearType } from "./heroes";

// ============================================================
// DRONE
// ============================================================

// The 6 drone component types
export const DRONE_COMPONENT_NAMES = [
  "Thermal Scope",    // 0 — left top
  "Turbo Engine",     // 1 — left mid
  "External Armor",   // 2 — left bot
  "Radar",            // 3 — right top
  "Fuel Cell",        // 4 — right mid
  "Airborne Missile", // 5 — right bot
] as const;

export const DRONE_COMPONENT_ICONS = ["🔭", "⚡", "🛡", "📡", "🔋", "🚀"] as const;

export type DroneChipRarity = "none" | "R" | "SR" | "SSR" | "UR";
export type DroneUnitType = "tank" | "aircraft" | "missile";

export interface DroneChipInfo {
  rarity: DroneChipRarity;
  stars: number;            // 1–10 (milestones: 2, 5, 6, 8, 10)
  unit: DroneUnitType | null;
}

export interface DroneChipSetData {
  initial:      DroneChipInfo; // Inicjujący (top position)
  attack:       DroneChipInfo; // Atak (left)
  defense:      DroneChipInfo; // Obrona (right)
  interference: DroneChipInfo; // Zakłócanie (bottom)
}

export interface DroneSave {
  level:            number;             // 0–250
  combatBoostLevel: number;             // 0–900+
  componentLevels:  number[];           // 6 items, index matches DRONE_COMPONENT_NAMES
  chipSets:         DroneChipSetData[]; // 4 sets (unlock at combat boost 10/150/300/diamonds)
  // Premia Drona — total flat drone HP/ATK/DEF read directly from game UI
  dronePremiaHp:  number;
  dronePremiaAtk: number;
  dronePremiaDef: number;
  // Konwersja — drone-to-hero flat conversion ratio (game default 18/19/18 %)
  droneConvHp:  number;
  droneConvAtk: number;
  droneConvDef: number;
  // Dron % — hero HP/ATK/DEF % read from the "Dron" row of the hero details screen.
  // When any is > 0 it replaces the pct derived from component levels.
  // Auto drone model (see computePlayerStats 11h): sub-level (0-4) within drone level, research progress %
  // (0-100) of each of the 6 components (order Radar, Turbo, Armor, Thermal, Fuel, Missile).
  subLevel?: number;
  componentProgress?: number[];
  droneHeroHpPct?:  number;
  droneHeroAtkPct?: number;
  droneHeroDefPct?: number;
  // Crit rate / crit damage % from the drone (row "Dron" in crit attributes; e.g. 1 and 3)
  droneHeroCritRate?: number;
  droneHeroCritDmg?:  number;
}

const EMPTY_CHIP: DroneChipInfo = { rarity: "none", stars: 1, unit: null };
const EMPTY_CHIP_SET: DroneChipSetData = {
  initial:      { ...EMPTY_CHIP },
  attack:       { ...EMPTY_CHIP },
  defense:      { ...EMPTY_CHIP },
  interference: { ...EMPTY_CHIP },
};

export const DEFAULT_DRONE: DroneSave = {
  level: 0,
  combatBoostLevel: 0,
  componentLevels: [0, 0, 0, 0, 0, 0],
  dronePremiaHp: 0,
  dronePremiaAtk: 0,
  dronePremiaDef: 0,
  droneConvHp: 18,
  droneConvAtk: 19,
  droneConvDef: 18,
  chipSets: [
    { ...EMPTY_CHIP_SET, initial: { ...EMPTY_CHIP }, attack: { ...EMPTY_CHIP }, defense: { ...EMPTY_CHIP }, interference: { ...EMPTY_CHIP } },
    { ...EMPTY_CHIP_SET, initial: { ...EMPTY_CHIP }, attack: { ...EMPTY_CHIP }, defense: { ...EMPTY_CHIP }, interference: { ...EMPTY_CHIP } },
    { ...EMPTY_CHIP_SET, initial: { ...EMPTY_CHIP }, attack: { ...EMPTY_CHIP }, defense: { ...EMPTY_CHIP }, interference: { ...EMPTY_CHIP } },
    { ...EMPTY_CHIP_SET, initial: { ...EMPTY_CHIP }, attack: { ...EMPTY_CHIP }, defense: { ...EMPTY_CHIP }, interference: { ...EMPTY_CHIP } },
  ],
};

export interface HeroGearSlot {
  quality: GearQuality;
  level: number; // 0–40
  stars: number; // 0–5 (post-level-40 promotion)
  tier?: number; // 4–25 promotion tier; default 4 + 5×stars. Hex stars lit = floor(tier/5)
}

export interface HeroSave {
  owned: boolean;
  stars: number;                       // 1–5 (shards)
  rank?: number;                       // 1–26 hero rank ("Premia rangi"); default derived from stars
  level: number;                       // 1–175 (capped by HQ level × 5)
  skillLevels: number[]; // per-group skill levels in group order; index 0=group0, 1=group1, etc.
  exclusiveWeaponLevel: number;        // 0 = not unlocked, 1–30 (requires 5★ UR)
  wallOfHonorLevel: number;            // 0–∞, +bonus% every 50 levels (requires 5★)
  gear: Record<GearType, HeroGearSlot>;
  critRate?: number; // 0.0–1.0 (e.g. 0.23 for 23% crit rate), read from game hero card
  critDmg?: number;  // 0.0+ (e.g. 0.5 for 50% crit damage bonus)
}

export const DEFAULT_HERO_SAVE: HeroSave = {
  owned: false,
  stars: 1,
  level: 1,
  skillLevels: [1, 1, 1],
  exclusiveWeaponLevel: 0,
  wallOfHonorLevel: 0,
  gear: {
    Cannon: { quality: "none", level: 0, stars: 0 },
    Chip:   { quality: "none", level: 0, stars: 0 },
    Armor:  { quality: "none", level: 0, stars: 0 },
    Radar:  { quality: "none", level: 0, stars: 0 },
  },
};

export interface PlayerProfile {
  drone: DroneSave;
  // Core
  hqLevel: number;          // 1–35
  vipLevel: number;         // 1–18
  // VS research
  vsTechLevel: number;      // 0–6 (0 = none)
  // Military
  barracksLevel: number;    // 1–30 (determines max troop tier)
  trainingSpeedPerHour: number; // troops/hour (0 = unknown)
  // Speed bonuses — total % shown in-game (Premie → Gospodarka)
  constructionSpeedBonus: number;  // % — Zwiększa szybkość budowy
  researchSpeedBonus: number;      // % — Zwiększa szybkość badań technologii
  trainingSpeedBonus: number;      // % — Zwiększa prędkość treningu jednostek
  trainingBatchBonus: number;      // % — Za każdym razem zwiększa liczbę trenowanych jednostek
  healingSpeedBonus: number;       // % — Zwiększa szybkość leczenia jednostek
  hospitalCapacityBonus: number;   // % — Zwiększa pojemność szpitala
  // Resource cost reductions (negative = cheaper)
  buildingCostReduction: number;   // % — Redukuje zasoby wymagane do budowy budynku
  researchCostReduction: number;   // % — Redukuje zasoby wymagane do badań
  healingCostReduction: number;    // % — Zmniejsza ilość zasobów wymaganych do leczenia
  trainingCostReduction: number;   // % — Redukcja kosztu treningu jednostek
  // Alliance
  allianceResearchDone: boolean;   // has alliance tech fully researched
  // Heroes roster — keyed by hero id from lib/heroes.ts
  heroes: Record<string, HeroSave>;
  // Squads — up to 4, each with 5 hero slots
  squads: SquadDef[];
  // Research progress — keyed as "treeId/nodeId" → current level (0 = not researched)
  researchLevels: Record<string, number>;
  // Building levels — keyed by building slug (e.g. "air-center") → current level
  // Note: hqLevel and barracksLevel remain as top-level fields for backwards compat
  buildingLevels: Record<string, number>;

  // ── M-NEW-A: Season Military Rank ────────────────────────────
  // Permanent hero % bonus from season rank progression
  seasonMilitaryRank: number;  // 0 = no rank, 1–19
  seasonFaction: 1 | 2;        // player's faction

  // ── M-021+: Decoration Gains ─────────────────────────────────
  // Permanent hero % bonuses from owned decorations (effect_gain stat)
  // Overlord (Władca) — "Ocena więzi" level + the three training lines (hero HP/ATK/DEF bonuses to ALL heroes)
  overlord?: { ratingLevel?: number; trainAtkLevel?: number; trainDefLevel?: number; trainHpLevel?: number; power?: number /* squad "Władca" power line (manual until derived) */ };
  squadTroops?: number[]; // per squad: total troop count (Σ hero capacity); unit power is computed from it
  squadTroopTier?: number[]; // per squad: troop tier (default 10)
  squadUnitPower?: number[]; // per squad (index = squad): "Moc jednostki" from the battle report/squad screen
  ownedDecorationIds: number[]; // base-skin/decoration IDs owned but NOT equipped (gain bonus)
  equippedDecorationId?: number; // equipped skin (wear bonus, hero % from decorations.json effect_wear)

  // ── M-019: Hero Honor Level ───────────────────────────────────
  // Flat HP added to each hero based on their quality class
  honorLevel: number; // 0–600, fractional allowed (interpolated between table rows)
  honorHp?: number;   // account-wide "Bonus honoru" HP from the hero screen (same for every hero); overrides honorLevel when > 0

  // ── Kosmetyka: hero % bonuses from cosmetics (the "Kosmetyka" row on hero details) ──
  cosmeticHpPct?:  number;
  cosmeticAtkPct?: number;
  cosmeticDefPct?: number;

  // ── Hero-screen overrides: when > 0 these REPLACE the computed building / drone flat ──
  // bonuses (rows "Premia budynku" / "Premia Drona" on the hero details screen).
  // Per-troop overrides (Aircraft / Missile heroes use different centers than Tank).
  buildingFlatByType?: Partial<Record<"Tank" | "Aircraft" | "Missile", { hp: number; atk: number; def: number }>>;
  buildingFlatHp?:  number;
  buildingFlatAtk?: number;
  buildingFlatDef?: number;
  droneFlatHp?:     number;
  droneFlatAtk?:    number;
  droneFlatDef?:    number;

  // ── M-020: Decoration Building Level ─────────────────────────
  // Per-group (1–43) level and progress; each group levels independently.
  // key = building group number (1–43), value = { level: 3–6, progress: 1–3 }
  // Missing key → group not yet upgraded.
  decorationBuildingGroups: Record<number, { level: number; progress: number }>;
  // Legacy single-pair fields kept for backward-compat migration only:
  decorationBuildingLevel: number;
  decorationBuildingProgress: number;
  // Manual override from game's "Szczegóły bonusów dekoracji" screen (HP/ATK/DEF Bohatera i Władcy).
  // When > 0 these replace the per-group simulation entirely.
  decorationBonusHp:  number;
  decorationBonusAtk: number;
  decorationBonusDef: number;

  // ── M-024: UAV Level ─────────────────────────────────────────
  // Cumulative flat drone HP/ATK/DEF from UAV unit upgrades
  uavLevel: number; // 0 = not upgraded, 1–300

  // ── APS Research: Hero Power nodes ───────────────────────────
  // keyed by science_id (string) → current level
  apsResearchLevels: Record<string, number>;
}

export interface SquadDef {
  heroIds: (string | null)[]; // exactly 5 slots
}

export const DEFAULT_SQUAD: SquadDef = {
  heroIds: [null, null, null, null, null],
};

export const DEFAULT_PROFILE: PlayerProfile = {
  hqLevel: 1,
  vipLevel: 1,
  vsTechLevel: 0,
  barracksLevel: 1,
  trainingSpeedPerHour: 0,
  constructionSpeedBonus: 0,
  researchSpeedBonus: 0,
  trainingSpeedBonus: 0,
  trainingBatchBonus: 0,
  healingSpeedBonus: 0,
  hospitalCapacityBonus: 0,
  buildingCostReduction: 0,
  researchCostReduction: 0,
  healingCostReduction: 0,
  trainingCostReduction: 0,
  allianceResearchDone: false,
  heroes: {},
  researchLevels: {},
  buildingLevels: {},
  drone: { ...DEFAULT_DRONE },
  seasonMilitaryRank: 0,
  seasonFaction: 1,
  ownedDecorationIds: [],
  honorLevel: 0,
  decorationBuildingGroups: {},
  decorationBuildingLevel: 0,
  decorationBuildingProgress: 0,
  decorationBonusHp:  0,
  decorationBonusAtk: 0,
  decorationBonusDef: 0,
  uavLevel: 0,
  apsResearchLevels: {},
  squads: [
    { heroIds: [null, null, null, null, null] },
    { heroIds: [null, null, null, null, null] },
    { heroIds: [null, null, null, null, null] },
    { heroIds: [null, null, null, null, null] },
  ],
};

const STORAGE_KEY = "lw-profile";

export function loadProfile(): PlayerProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;

    // Deep-merge heroes so old saves without new fields get defaults
    const heroes: Record<string, HeroSave> = {};
    for (const [id, saved] of Object.entries(parsed.heroes ?? {})) {
      heroes[id] = { ...DEFAULT_HERO_SAVE, ...(saved as HeroSave) };
    }

    return { ...DEFAULT_PROFILE, ...parsed, heroes };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: PlayerProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// ---- Derived values from profile ----

/** HQ barracks unlock thresholds → max troop tier */
const BARRACKS_TIER_UNLOCKS: { barracks: number; tier: number }[] = [
  { barracks: 1,  tier: 1 },
  { barracks: 4,  tier: 2 },
  { barracks: 6,  tier: 3 },
  { barracks: 10, tier: 4 },
  { barracks: 14, tier: 5 },
  { barracks: 17, tier: 6 },
  { barracks: 20, tier: 7 },
  { barracks: 24, tier: 8 },
  { barracks: 27, tier: 9 },
  { barracks: 30, tier: 10 },
];

export function getMaxTroopTier(barracksLevel: number): number {
  let tier = 1;
  for (const u of BARRACKS_TIER_UNLOCKS) {
    if (barracksLevel >= u.barracks) tier = u.tier;
  }
  return tier;
}

export function getVsTechMultiplier(vsTechLevel: number): number {
  const multipliers = [1.0, 1.1, 1.2, 1.35, 1.5, 1.75, 2.0];
  return multipliers[vsTechLevel] ?? 1.0;
}

/** VIP bonuses for construction/research speed */
export function getVipConstructionBonus(vipLevel: number): number {
  // Approximate VIP construction speed bonus %
  const bonuses = [0, 2, 5, 8, 12, 16, 20, 25, 30, 35, 40, 45, 50, 50, 50, 50, 50, 50, 50];
  return bonuses[Math.min(vipLevel, 18)] ?? 0;
}

export function getVipResearchBonus(vipLevel: number): number {
  // Approximate VIP research speed bonus %
  const bonuses = [0, 2, 4, 6, 10, 14, 18, 22, 26, 30, 35, 40, 45, 45, 45, 45, 45, 45, 45];
  return bonuses[Math.min(vipLevel, 18)] ?? 0;
}
