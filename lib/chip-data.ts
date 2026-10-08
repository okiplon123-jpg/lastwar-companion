// ============================================================
// LASTWAR COMPANION — Drone Chip Data
// All 24 chips: 4 slots × 3 vehicles × 2 rarities
// Sources: lastwar.fandom.com/wiki/Chip_Index, reddit, packsify, grindnstrat
// ============================================================

import type { DroneUnitType, DroneChipRarity } from "./profile";

export type ChipSlotKey = "initial" | "attack" | "defense" | "interference";

// ── Polish labels ──────────────────────────────────────────
export const CHIP_SLOT_LABELS: Record<ChipSlotKey, string> = {
  initial:       "Inicjujący",
  attack:        "Atak",
  defense:       "Obrona",
  interference:  "Zakłócanie",
};

export const UNIT_LABELS: Record<DroneUnitType, string> = {
  tank:     "Czołg",
  aircraft: "Lotnictwo",
  missile:  "Pojazd rakietowy",
};

// ── Milestone stars (give special bonus) ──────────────────
// 2★, 5★, 6★, 8★, 10★ are key milestones
export const CHIP_STAR_MILESTONES = [2, 5, 6, 8, 10] as const;
export const CHIP_MAX_STARS = 10;

// ── Star upgrade costs (copies of the same chip needed) ───
// Index 0 = equip (need 2 copies to place in slot)
// Index 1 = 1★→2★, Index 2 = 2★→3★, ... Index 9 = 9★→10★
export const CHIP_UPGRADE_COSTS: number[] = [2, 2, 3, 5, 7, 10, 15, 20, 30, 40];
// Cumulative: [2, 4, 7, 12, 19, 29, 44, 64, 94, 134]

export function getChipCumulativeCost(targetStar: number): number {
  let total = 0;
  for (let i = 0; i < targetStar && i < CHIP_UPGRADE_COSTS.length; i++) {
    total += CHIP_UPGRADE_COSTS[i];
  }
  return total;
}

// ── BP per star ────────────────────────────────────────────
// Confirmed values from in-game screenshots
// UR: 1★=65500, 2★=74500, 5★=111900 (confirmed)
// SSR: ~41400 at 3★, ~55900 at 4★ or 5★ (confirmed range)
// 3★,4★ UR and 6-10★ are interpolated/estimated

const UR_BP: (number | null)[] = [
  null,    // 0★ (not equipped)
  65500,   // 1★ confirmed
  74500,   // 2★ confirmed
  84000,   // 3★ estimated
  98000,   // 4★ estimated
  111900,  // 5★ confirmed
  128000,  // 6★ estimated
  148000,  // 7★ estimated
  172000,  // 8★ estimated
  200000,  // 9★ estimated
  235000,  // 10★ estimated
];

const SSR_BP: (number | null)[] = [
  null,    // 0★
  28000,   // 1★ estimated
  35000,   // 2★ estimated
  41400,   // 3★ estimated (confirmed ~this range)
  55900,   // 4★ estimated (confirmed ~this range)
  68000,   // 5★ estimated
  82000,   // 6★ estimated
  98000,   // 7★ estimated
  116000,  // 8★ estimated
  137000,  // 9★ estimated
  160000,  // 10★ estimated
];

export function getChipBP(rarity: DroneChipRarity, stars: number): number | null {
  if (rarity === "none" || rarity === "R") return null;
  const table = rarity === "UR" ? UR_BP : SSR_BP;
  return table[stars] ?? null;
}

// ── Chip milestone notes ───────────────────────────────────
export interface ChipMilestone {
  stars: number;
  note: string; // what bonus unlocks at this star level
}

// ── Full chip definition ───────────────────────────────────
export interface ChipDef {
  namePL: string;
  nameEN: string;
  slot: ChipSlotKey;
  rarity: "SSR" | "UR";
  trigger: string;           // when it activates
  effect: string;            // base effect description (use {unit} placeholder for vehicle type)
  effectAtStars: Partial<Record<number, string>>; // override descriptions at specific stars
  milestones: ChipMilestone[];
  craftCost: number;         // chip materials needed to craft one
  craftMaterialType: "basic" | "premium"; // SSR=basic, UR=premium
  canBeUsedAsBoostMaterial: boolean;
}

// ── THE 24 CHIP DEFINITIONS ───────────────────────────────

const UR_INITIAL: Omit<ChipDef, "namePL" | "nameEN"> = {
  slot: "initial",
  rarity: "UR",
  trigger: "Początek bitwy",
  effect: "Cały oddział otrzymuje Tarczę o stałej wartości 800K. Twoi bohaterowie {unit} otrzymują dodatkową Tarczę = 10% HP Drona na 9 sek. Po zniknięciu tarczy: globalna redukcja otrzymywanych obrażeń.",
  effectAtStars: {
    1: "Cały oddział: Tarcza 800K. Bohaterowie {unit}: +Tarcza 10% HP Drona, 9 sek. Redukcja obrażeń: 12%.",
    8: "Cały oddział: Tarcza 800K. Bohaterowie {unit}: +Tarcza 10% HP Drona, 9 sek. Redukcja obrażeń: 16%.",
  },
  milestones: [
    { stars: 2, note: "Efekt tarczy wzmocniony" },
    { stars: 5, note: "Wartość tarczy rośnie znacząco" },
    { stars: 8, note: "Redukcja obrażeń: 12% → 16% (ważny milestone!)" },
    { stars: 10, note: "Maksymalny poziom — Tarcza mityczna" },
  ],
  craftCost: 800,
  craftMaterialType: "premium",
  canBeUsedAsBoostMaterial: false,
};

const SSR_INITIAL: Omit<ChipDef, "namePL" | "nameEN"> = {
  slot: "initial",
  rarity: "SSR",
  trigger: "Początek bitwy",
  effect: "Bohaterowie {unit} w pierwszym rzędzie otrzymują Tarczę = 18% HP Drona na 8 sek.",
  effectAtStars: {
    1:  "Bohaterowie {unit} w pierwszym rzędzie: Tarcza = 18% HP Drona, 8 sek.",
    5:  "Bohaterowie {unit} w pierwszym rzędzie: Tarcza = 24% HP Drona, 8 sek.",
    10: "Bohaterowie {unit} w pierwszym rzędzie: Tarcza = 30%+ HP Drona, 8 sek.",
  },
  milestones: [
    { stars: 2, note: "Wartość tarczy zwiększona" },
    { stars: 5, note: "Wartość tarczy podniesiona do 350K (ważny milestone!)" },
    { stars: 8, note: "Tarcza wzmocniona do poziomu legendarnego" },
    { stars: 10, note: "Maksymalny poziom" },
  ],
  craftCost: 400,
  craftMaterialType: "basic",
  canBeUsedAsBoostMaterial: true,
};

const UR_ATTACK: Omit<ChipDef, "namePL" | "nameEN"> = {
  slot: "attack",
  rarity: "UR",
  trigger: "Każde bombardowanie drona",
  effect: "Liczba celów bombardowania +3. Po bombardowaniu: bohaterowie {unit} otrzymują Atak = 9% Ataku Drona przez 4,5 sek.",
  effectAtStars: {
    1:  "+1 cel bombardowania. Bohaterowie {unit}: +3% Atak przez 3 sek.",
    2:  "+1 cel bombardowania. Bohaterowie {unit}: +5% Atak przez 3 sek. [MILESTONE: atak do 5%]",
    5:  "+3 cele bombardowania łącznie. Bohaterowie {unit}: +9% Atak przez 4,5 sek. [WAŻNY MILESTONE: +2 cele]",
    6:  "+3 cele bombardowania. Bohaterowie {unit}: +11% Atak przez 4,5 sek. [MILESTONE: atak do 11%]",
    10: "+3 cele bombardowania. Bohaterowie {unit}: +14%+ Atak przez 5 sek.",
  },
  milestones: [
    { stars: 2, note: "Premia do ataku zwiększona do 5%" },
    { stars: 5, note: "Dron uderza w 2 dodatkowe cele (łącznie +3)! [WAŻNY]" },
    { stars: 6, note: "Premia do ataku zwiększona do 11%" },
    { stars: 8, note: "Kolejne wzmocnienie ataku" },
    { stars: 10, note: "Maksymalny poziom — Atak mityczny" },
  ],
  craftCost: 800,
  craftMaterialType: "premium",
  canBeUsedAsBoostMaterial: false,
};

const SSR_ATTACK: Omit<ChipDef, "namePL" | "nameEN"> = {
  slot: "attack",
  rarity: "SSR",
  trigger: "Każde bombardowanie drona",
  effect: "Po bombardowaniu: bohaterowie {unit} otrzymują Atak = 10% Ataku Drona przez 4 sek.",
  effectAtStars: {
    1:  "Bohaterowie {unit}: +4% Atak przez 3 sek.",
    2:  "Bohaterowie {unit}: +5% Atak przez 3 sek. [MILESTONE: do 5%]",
    5:  "Bohaterowie {unit}: +8% Atak przez 4 sek. [MILESTONE: do 8%]",
    10: "Bohaterowie {unit}: +10%+ Atak przez 4 sek.",
  },
  milestones: [
    { stars: 2, note: "Premia do ataku zwiększona do 5%" },
    { stars: 5, note: "Premia do ataku zwiększona do 8%" },
    { stars: 8, note: "Premia do ataku wzmocniona" },
    { stars: 10, note: "Maksymalny poziom" },
  ],
  craftCost: 400,
  craftMaterialType: "basic",
  canBeUsedAsBoostMaterial: true,
};

const UR_DEFENSE: Omit<ChipDef, "namePL" | "nameEN"> = {
  slot: "defense",
  rarity: "UR",
  trigger: "Początek bitwy (przez całą bitwę)",
  effect: "Cały oddział: Obrona = 24% Obrony Drona przez 30 sek. Gdy tarcza aktywna — bohaterowie {unit}: dodatkowa Obrona = 30% Obrony Drona.",
  effectAtStars: {
    1:  "Cały oddział: +13% Obrona przez całą bitwę. Bohaterowie {unit}: +15% Obrona gdy tarcza aktywna.",
    2:  "Cały oddział: +15% Obrona przez całą bitwę. Bohaterowie {unit}: +18% Obrona gdy tarcza. [MILESTONE: do 13%+15%]",
    5:  "Cały oddział: +20% Obrona przez całą bitwę. Bohaterowie {unit}: +24% Obrona gdy tarcza.",
    8:  "Cały oddział: +24% Obrona Drona × 30 sek. Bohaterowie {unit}: +30% Obrona Drona gdy tarcza.",
    10: "Cały oddział: +28%+ Obrona przez całą bitwę. Bohaterowie {unit}: +35%+ gdy tarcza.",
  },
  milestones: [
    { stars: 2, note: "Premia do obrony zwiększona do 13%" },
    { stars: 5, note: "Obrona znacznie zwiększona [WAŻNY]" },
    { stars: 8, note: "Premia do obrony w pełni aktywna: 24% + 30%" },
    { stars: 10, note: "Maksymalny poziom — Obrona mityczna" },
  ],
  craftCost: 800,
  craftMaterialType: "premium",
  canBeUsedAsBoostMaterial: false,
};

const SSR_DEFENSE: Omit<ChipDef, "namePL" | "nameEN"> = {
  slot: "defense",
  rarity: "SSR",
  trigger: "Początek bitwy",
  effect: "Bohaterowie {unit} w pierwszym rzędzie: Tarcza = 24% Obrony Drona przez 8 sek.",
  effectAtStars: {
    1:  "Bohaterowie {unit} w 1. rzędzie: Tarcza = 8% Obrony Drona, 8 sek.",
    2:  "Bohaterowie {unit} w 1. rzędzie: Tarcza = 10% Obrony Drona, 8 sek.",
    5:  "Bohaterowie {unit} w 1. rzędzie: Tarcza = 18% Obrony Drona, 8 sek.",
    8:  "Bohaterowie {unit} w 1. rzędzie: Tarcza = 24% Obrony Drona, 8 sek.",
    10: "Bohaterowie {unit} w 1. rzędzie: Tarcza = 28%+ Obrony Drona, 8 sek.",
  },
  milestones: [
    { stars: 2, note: "Wartość tarczy zwiększona" },
    { stars: 5, note: "Premia do obrony wzmocniona" },
    { stars: 8, note: "Tarcza osiąga pełną wartość 24% Obrony Drona" },
    { stars: 10, note: "Maksymalny poziom" },
  ],
  craftCost: 400,
  craftMaterialType: "basic",
  canBeUsedAsBoostMaterial: true,
};

const UR_INTERFERENCE: Omit<ChipDef, "namePL" | "nameEN"> = {
  slot: "interference",
  rarity: "UR",
  trigger: "Każde bombardowanie drona",
  effect: "Tylny rząd: +15% Burst Obrażeń. Bohaterowie {unit}: obrażenia dodatkowe = 10% Ataku Drona przez 5 sek. Redukuje obrażenia od taktyk wroga.",
  effectAtStars: {
    1:  "Bohaterowie {unit} (tylny rząd): +7% Obrażeń przez 3 sek. Obrażenia od taktyk wroga: -3% na 3 sek.",
    2:  "Bohaterowie {unit} (tylny rząd): +8% Obrażeń. Redukcja obrażeń od taktyk wroga AKTYWNA. [MILESTONE: aktywacja redukcji]",
    5:  "Tylny rząd: +12% Burst Obrażeń. Bohaterowie {unit}: +10% Ataku Drona przez 5 sek. Redukcja taktyk wroga: -5%.",
    6:  "Tylny rząd: +14% Burst Obrażeń. Bohaterowie {unit}: +11% Ataku Drona przez 5 sek. [MILESTONE: do 16% efekt]",
    8:  "Tylny rząd: +15% Burst Obrażeń. Bohaterowie {unit}: +12% Ataku Drona przez 5 sek. Redukcja taktyk: -7%.",
    10: "Tylny rząd: +18%+ Burst. Bohaterowie {unit}: +14%+ Ataku Drona. Redukcja taktyk: -9%+.",
  },
  milestones: [
    { stars: 2, note: "AKTYWUJE redukcję obrażeń od taktyk wroga! [PRIORYTET]" },
    { stars: 5, note: "Burst obrażeń znacznie zwiększony" },
    { stars: 6, note: "Efekt obrażeń do 16%" },
    { stars: 8, note: "Pełny efekt zakłócania" },
    { stars: 10, note: "Maksymalny poziom — Zakłócanie mityczne" },
  ],
  craftCost: 800,
  craftMaterialType: "premium",
  canBeUsedAsBoostMaterial: false,
};

const SSR_INTERFERENCE: Omit<ChipDef, "namePL" | "nameEN"> = {
  slot: "interference",
  rarity: "SSR",
  trigger: "Każde bombardowanie drona",
  effect: "Bohaterowie {unit}: +15% Wzrost Obrażeń przez 3 sek.",
  effectAtStars: {
    1:  "Bohaterowie {unit}: +5% Wzrost Obrażeń przez 3 sek.",
    2:  "Bohaterowie {unit}: +6% Wzrost Obrażeń przez 3 sek.",
    3:  "Bohaterowie {unit} (tylny rząd): +8% Obrażeń przez 3 sek.",
    4:  "Bohaterowie {unit} (tylny rząd): +8,6% Obrażeń przez 3 sek.",
    5:  "Bohaterowie {unit}: +10% Wzrost Obrażeń przez 3 sek. [MILESTONE: do 10%]",
    10: "Bohaterowie {unit}: +15% Wzrost Obrażeń przez 3 sek.",
  },
  milestones: [
    { stars: 2, note: "Efekt obrażeń zwiększony" },
    { stars: 5, note: "Premia do obrażeń zwiększona do 10% [WAŻNY]" },
    { stars: 8, note: "Wzmocnienie obrażeń" },
    { stars: 10, note: "Maksymalny poziom" },
  ],
  craftCost: 400,
  craftMaterialType: "basic",
  canBeUsedAsBoostMaterial: true,
};

// ── Main chip registry ──────────────────────────────────────
// Key: `${rarity}-${slot}` — same chip for all vehicle types (vehicle just changes the hero targeting)

export const CHIP_DEFS: Record<string, ChipDef> = {
  "UR-initial": {
    ...UR_INITIAL,
    namePL: "Absolutne pole kwantowe",
    nameEN: "Absolute Quantum Field",
  },
  "SSR-initial": {
    ...SSR_INITIAL,
    namePL: "Tarcza EM III",
    nameEN: "EM Shield III",
  },
  "UR-attack": {
    ...UR_ATTACK,
    namePL: "Śmiercionośna burza ognia",
    nameEN: "Lethal Firestorm",
  },
  "SSR-attack": {
    ...SSR_ATTACK,
    namePL: "Ultra Częstotliwość Rezonansu III",
    nameEN: "Ultra Frequency Resonance III",
  },
  "UR-defense": {
    ...UR_DEFENSE,
    namePL: "Pancerz rezonansu grawitacyjnego",
    nameEN: "Gravitational Resonance Armor",
  },
  "SSR-defense": {
    ...SSR_DEFENSE,
    namePL: "Fotonowy Pancerz III",
    nameEN: "Photon Armor III",
  },
  "UR-interference": {
    ...UR_INTERFERENCE,
    namePL: "Pamięć Ultra Rozszczepienie",
    nameEN: "Memory Ultra Fission",
  },
  "SSR-interference": {
    ...SSR_INTERFERENCE,
    namePL: "Impuls Przeciwpancerny III",
    nameEN: "Armor-Piercing Pulse III",
  },
};

// ── Lookup helpers ─────────────────────────────────────────

export function getChipDef(rarity: "SSR" | "UR", slot: ChipSlotKey): ChipDef | null {
  return CHIP_DEFS[`${rarity}-${slot}`] ?? null;
}

/** Get effect description at a given star level for a specific vehicle */
export function getChipEffectAtStars(
  rarity: "SSR" | "UR",
  slot: ChipSlotKey,
  stars: number,
  unit: DroneUnitType,
): string {
  const def = getChipDef(rarity, slot);
  if (!def) return "";
  const unitLabel = UNIT_LABELS[unit];

  // Find the closest star level description at or below current stars
  const knownStars = Object.keys(def.effectAtStars)
    .map(Number)
    .sort((a, b) => a - b);

  let desc = def.effect;
  for (const s of knownStars) {
    if (s <= stars) desc = def.effectAtStars[s] ?? desc;
  }

  return desc.replace(/{unit}/g, unitLabel);
}

/** Get milestone for the NEXT milestone above current stars */
export function getNextMilestone(
  rarity: "SSR" | "UR",
  slot: ChipSlotKey,
  currentStars: number,
): ChipMilestone | null {
  const def = getChipDef(rarity, slot);
  if (!def) return null;
  return def.milestones.find(m => m.stars > currentStars) ?? null;
}

/** Crafting priority order (lower = higher priority) */
export const CRAFT_PRIORITY: ChipSlotKey[] = [
  "interference",  // 1st — unlocks enemy tactic reduction at 2★
  "defense",       // 2nd — permanent defense buff
  "initial",       // 3rd — opening shield
  "attack",        // 4th — bomb synergy, lower priority
];

export const STAR_UPGRADE_ORDER = [
  { targetStar: 2, note: "Wszystkie czipy do 2★ (odblokowuje bonusy milestone)" },
  { targetStar: 5, note: "Wszystkie czipy do 5★ (ważny milestone ataku: +2 cele)" },
  { targetStar: 8, note: "Inicjujący do 8★ PIERWSZY (redukcja obrażeń 12→16%)" },
  { targetStar: 8, note: "Obrona i Zakłócanie do 8★" },
  { targetStar: 10, note: "Wszystkie do 10★ — mityczny poziom" },
];
