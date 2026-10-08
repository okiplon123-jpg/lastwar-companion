import type { KnowledgeMechanic } from '../schema';

export const M012: KnowledgeMechanic = {
  id: 'M-012',
  name: 'Wall of Honor (WoH) — Formation Bonuses',
  domain: 'combat',
  system: 'wall_of_honor',
  whatItIs:
    'Persistent percentage bonuses to troops of a specific type, earned by ' +
    'leveling heroes on the Wall of Honor.',
  whatItGives: [
    {
      stat: 'troop_ATK_or_DEF_or_HP_pct',
      valueType: 'pct',
      value: null,
      condition: 'WoH hero leveled; troop type matches hero type',
      stacking: 'additive',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-006'],
    },
  ],
  modifiedBy: [],
  modifies: ['M-001'],
  whenActive: 'WoH heroes are leveled — permanent passive bonus',
  stackingRule: 'Additive per hero (stacks across all owned WoH heroes)',
  limits: 'Bonus accrues per 50 WoH levels per hero. 31 heroes on WoH.',
  isConditional: false,
  dependentSystems: ['M-001'],
  status: 'PARTIALLY_KNOWN',
  verifiedBy: [],
  partialEvidence: ['EV-006'],
  blockingExperiments: ['EXP-008'],
  researchQuestion:
    'Do WoH bonuses appear in Squad Power display? Do they apply globally to ' +
    'all squads or only to squads containing that hero? What stat does each hero give?',
  affectsEngine: ['engine/modifiers/wall-of-honor.ts'],
  affectsFeatures: ['Squad Power display', 'WoH optimizer'],
  estimatedImpact: 'HIGH',
  blocksImplementation: false,
  values: {
    heroCount: 31,
    // Community-reported rates (EV-006, NOT verified):
    mainURpctPer50Levels: 0.50,
    promotableSSRpctPer50Levels: 0.25,
    loadHeroPctPer50Levels: 1.00,
    loadHeroStat: 'Troop Load Capacity',
    // Per-hero stat type (ATK/DEF/HP) mapping: not fully verified
    heroStatTypeMap: null,
  },
  notes: [
    'Three categories of WoH heroes: Main UR (+0.50%/50lvl), Promotable SSR→UR (+0.25%/50lvl), Load heroes (+1.00%/50lvl).',
    'All rates from EV-006 (community sources, NOT verified by personal test).',
    'Bonuses are additive per hero (stacks across all owned WoH heroes).',
    'OPEN Q1: Does WoH apply globally to all squads or only to squads containing that hero?',
    'OPEN Q2: Is the complete per-hero WoH stat type (ATK/DEF/HP) documented anywhere verified?',
  ],
};
