import type { KnowledgeMechanic } from '../schema';

export const M004: KnowledgeMechanic = {
  id: 'M-004',
  name: 'Hero Stat Growth Per Level (1 → 175)',
  domain: 'combat',
  system: 'hero_level',
  whatItIs:
    'The formula or lookup table that determines how a hero\'s ATK, DEF, HP ' +
    'increase as their level increases from 1 to 175.',
  whatItGives: [
    {
      stat: 'hero_ATK',
      valueType: 'unknown',
      value: null,
      condition: 'per hero level above 1',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
    {
      stat: 'hero_DEF',
      valueType: 'unknown',
      value: null,
      condition: 'per hero level above 1',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
    {
      stat: 'hero_HP',
      valueType: 'unknown',
      value: null,
      condition: 'per hero level above 1',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
  ],
  modifiedBy: ['M-003'],
  modifies: ['M-001'],
  whenActive: 'hero level > 1',
  stackingRule: 'Applied on top of M-003 base stats',
  limits: 'Hero level cap = HQ Level × 5, max 175 (EV-002)',
  isConditional: false,
  dependentSystems: ['M-005', 'M-001'],
  status: 'UNKNOWN',
  verifiedBy: [],
  partialEvidence: ['EV-002'],
  blockingExperiments: ['EXP-003'],
  researchQuestion:
    'What is the formula (linear, piecewise, polynomial, or lookup table) by which ' +
    'hero ATK/DEF/HP increase per level? Are there growth breakpoints?',
  affectsEngine: ['engine/hero/level-growth.ts'],
  affectsFeatures: ['Squad Power display', 'Hero stat display', 'Upgrade Planner'],
  estimatedImpact: 'CRITICAL',
  blocksImplementation: true,
  values: {
    maxLevel: 175,
    levelCapRule: 'HQ Level × 5',
    // Growth formula: null — not yet known
    growthFormula: null,
  },
  notes: [
    'Hero level cap = HQ Level × 5, maximum 175 (EV-002).',
    'Stats visibly increase with level (direct observation, no quantification).',
    'Requires M-003 first. Cannot determine growth without knowing lv1 baseline.',
    'Minimum data needed: same hero at 5+ different levels, all other variables constant.',
    'OPEN Q1: Is growth linear (fixed +X per level) or curved?',
    'OPEN Q2: Are there breakpoints where growth rate changes (e.g. at lv100, lv150)?',
    'OPEN Q3: Is the growth formula the same for all heroes of the same rarity?',
  ],
};
