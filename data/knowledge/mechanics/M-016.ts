import type { KnowledgeMechanic } from '../schema';

export const M016: KnowledgeMechanic = {
  id: 'M-016',
  name: 'Bonus Stacking Order (Additive vs Multiplicative)',
  domain: 'combat',
  system: 'stacking_order',
  whatItIs:
    'The order of operations that determines how multiple percentage bonuses ' +
    'from different sources (research, WoH, EW, drone, buildings, VIP, etc.) ' +
    'are combined before being applied to troop or hero base values.',
  whatItGives: [
    {
      stat: 'effective_stat_multiplier',
      valueType: 'multiplier',
      value: null,
      condition: 'multiple bonus sources active',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
  ],
  modifiedBy: ['M-003', 'M-009'],
  modifies: [
    'M-001', 'M-009', 'M-010', 'M-011', 'M-012', 'M-013', 'M-014',
    'M-015', 'M-017', 'M-018', 'M-021',
  ],
  whenActive: 'any time multiple bonus sources are active simultaneously',
  stackingRule: 'UNKNOWN — the stacking rule IS the subject of this mechanic',
  limits: null,
  isConditional: false,
  dependentSystems: ['M-001'],
  status: 'UNKNOWN',
  verifiedBy: [],
  partialEvidence: [],
  blockingExperiments: ['EXP-014'],
  researchQuestion:
    'Do % bonuses from different sources stack additively (H1) or multiplicatively (H2) ' +
    'or in a hybrid model (H3)? Which model does the game use?',
  affectsEngine: ['engine/power/stacking.ts'],
  affectsFeatures: ['Squad Power display', 'Upgrade Planner (all ROI calculations)'],
  estimatedImpact: 'CRITICAL',
  blocksImplementation: true,
  values: {
    // Three hypotheses — none verified:
    H1_additive: 'stat = base × (1 + Σ all_bonus_pct)',
    H2_full_multiplicative: 'stat = base × Π (1 + source_pct)',
    H3_hybrid: 'stat = base × (1 + Σ research_pct) × (1 + Σ building_pct) × ...',
    confirmedModel: null,
  },
  notes: [
    'Multiple independent sources provide % bonuses. How they combine is completely UNKNOWN.',
    'H1 (Additive): All sources sum into one pool, applied once.',
    'H2 (Full Multiplicative): Each source multiplies independently.',
    'H3 (Hybrid): Some categories additive within category, then categories multiplied together.',
    'Do NOT implement any hypothesis. Record as null until EXP-014 confirms.',
    'This unknown has compounding effect: if the formula is H2 and we implement H1, error increases non-linearly as more bonus sources are added.',
    'OPEN Q1: If research gives +50% ATK and WoH gives +20% ATK, is effective ATK +70% (additive) or +80% (multiplicative)?',
  ],
};
