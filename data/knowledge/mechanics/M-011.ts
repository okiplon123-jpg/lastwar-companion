import type { KnowledgeMechanic } from '../schema';

export const M011: KnowledgeMechanic = {
  id: 'M-011',
  name: 'Drone — Stat Contributions',
  domain: 'combat',
  system: 'drone',
  whatItIs:
    'All stat bonuses contributed by the drone system: drone level, ' +
    'combat boost level, component levels, chip rarity/stars, and chip ' +
    'set composition.',
  whatItGives: [
    {
      stat: 'unknown_stat',
      valueType: 'unknown',
      value: null,
      condition: 'drone equipped and active',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
  ],
  modifiedBy: [],
  modifies: ['M-001'],
  whenActive: 'drone equipped',
  stackingRule: 'UNKNOWN',
  limits: 'Drone Level: 0–250. Chip stars: 2, 5, 6, 8, 10.',
  isConditional: false,
  dependentSystems: ['M-001'],
  status: 'UNKNOWN',
  verifiedBy: [],
  partialEvidence: [],
  blockingExperiments: ['EXP-010'],
  researchQuestion:
    'Which stats does the drone affect (ATK%, DEF%, HP%, or flat)? Do drone ' +
    'stats appear in Squad Power display? What does each chip rarity/star give?',
  affectsEngine: ['engine/modifiers/drone.ts'],
  affectsFeatures: ['Squad Power display', 'Drone optimizer'],
  estimatedImpact: 'HIGH',
  blocksImplementation: false,
  values: {
    droneLevel: { min: 0, max: 250 },
    combatBoostLevel: { min: 0, max: null }, // max unknown
    components: [
      'Thermal Scope',
      'Turbo Engine',
      'External Armor',
      'Radar',
      'Fuel Cell',
      'Airborne Missile',
    ],
    chipSlots: ['Initial', 'Attack', 'Defense', 'Interference'],
    chipRarities: ['R', 'SR', 'SSR', 'UR'],
    chipStarMilestones: [2, 5, 6, 8, 10],
    chipUnitTypes: ['tank', 'aircraft', 'missile'],
    // All stat values: null — not yet known
    statsByDroneLevel: null,
    statsByCombatBoost: null,
    statsByChipRarityAndStar: null,
  },
  notes: [
    'Drone system exists with: Level (0–250), Combat Boost Level, 6 Components, 4 Chip Slots.',
    'Chip rarities: R, SR, SSR, UR.',
    'Chip star milestones: 2, 5, 6, 8, 10.',
    'Unit types for chips: tank, aircraft, missile.',
    'OPEN Q1: Does drone level give ATK%/DEF%/HP% or flat stat bonuses?',
    'OPEN Q2: Are drone bonuses applied to troops, heroes, or both?',
    'OPEN Q3: Whether chip set bonuses exist for matching unit types.',
  ],
};
