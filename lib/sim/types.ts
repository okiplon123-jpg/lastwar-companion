// ============================================================
// LASTWAR SIM ENGINE — Core types
// ============================================================

export interface Contribution {
  label: string;
  value: number;  // % (or flat for cost reductions)
  nodeId?: string;
  group?: string; // e.g. "Research", "WoH", "EW", "VIP", "Profile"
}

/** A percentage value with full source breakdown */
export interface TracedPct {
  total: number;          // sum in %
  contributions: Contribution[];
}

/** ATK/DEF/HP % bonuses for one troop type */
export interface TroopTypeStats {
  atkPct: TracedPct;
  defPct: TracedPct;
  hpPct: TracedPct;
}

export interface PlayerStats {
  // Per-type troop combat bonuses (research + WoH + EW, includes all-troop contributions)
  tank:     TroopTypeStats;
  aircraft: TroopTypeStats;
  missile:  TroopTypeStats;
  // Hero-specific % bonuses (research, season rank, decorations, skills)
  heroAtkPct: TracedPct;
  heroDefPct: TracedPct;
  heroHpPct:  TracedPct;
  // Hero flat HP/ATK/DEF (from honor level, buildings — sum across all owned heroes)
  heroFlatHp:  TracedPct;
  heroFlatAtk: TracedPct;
  heroFlatDef: TracedPct;
  // EW flat stats (from decoration buildings — cumulative at current building level)
  ewFlatHp:  TracedPct;
  ewFlatAtk: TracedPct;
  ewFlatDef: TracedPct;
  // Drone flat stats (from UAV level — cumulative sum of incremental per-level gains)
  droneFlatHp:  TracedPct;
  droneFlatAtk: TracedPct;
  droneFlatDef: TracedPct;
  // VS Tech multiplier (e.g. 1.35 for Lv3)
  vsTechMultiplier: number;

  // Absolute hero stats per hero (only for heroes with base data)
  heroAbsoluteStats: Record<string, { hp: number; atk: number; def: number }>;
  // Hero power (moc bohatera) = fix_power(stars) + gear_power(slots) + ew_power
  heroPower: Record<string, number>;
  heroPowerBreakdown: Record<string, {
    propertyPower: number; skillPower: number; gearPower: number; ewPower: number;
    flatHp: number; flatAtk: number; flatDef: number; critRate: number; critDmg: number;
    upgradePow: number; promotePow: number;
  }>;
  // Economy
  economy: {
    constructionSpeedPct: TracedPct;
    researchSpeedPct:     TracedPct;
    trainingSpeedPct:     TracedPct;
    trainingBatchPct:     TracedPct;
    healingSpeedPct:      TracedPct;
    hospitalCapacityPct:  TracedPct;
  };
  costReductions: {
    buildingCostPct:  TracedPct;
    researchCostPct:  TracedPct;
    healingCostPct:   TracedPct;
    trainingCostPct:  TracedPct;
  };
}

/** Simulation result: before/after delta for watched outputs */
export interface ValueDelta {
  label: string;
  unit: string;
  before: number;
  after: number;
  delta: number;
}
