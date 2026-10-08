import type { KnowledgeMechanic } from '../schema';

export const M007: KnowledgeMechanic = {
  id: 'M-007',
  name: 'Gear Stat Values (Quality × Level × Slot)',
  domain: 'combat',
  system: 'hero_gear',
  whatItIs:
    'The numeric stat value provided by each gear piece at each quality tier ' +
    '(Common, Rare, Epic, Legendary) and level (1–40), for each slot.',
  whatItGives: [
    {
      stat: 'hero_stat_per_slot',
      valueType: 'flat',
      value: null,
      condition: 'gear equipped at specific quality and level',
      stacking: 'additive',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
  ],
  modifiedBy: ['M-006'],
  modifies: ['M-001'],
  whenActive: 'gear equipped',
  stackingRule: 'UNKNOWN — assumed additive per slot, but not verified',
  limits: 'Gear max level: 40. Star promotions exist after lv40 (star count unknown).',
  isConditional: false,
  dependentSystems: ['M-001'],
  status: 'UNKNOWN',
  verifiedBy: [],
  partialEvidence: [],
  blockingExperiments: ['EXP-006'],
  researchQuestion:
    'What is the base stat at lv1 for each quality tier? What is the stat ' +
    'increase per level? Is the growth curve linear or stepped?',
  affectsEngine: ['engine/hero/gear-stats.ts'],
  affectsFeatures: ['Squad Power display', 'Gear recommendations', 'Upgrade Planner'],
  estimatedImpact: 'HIGH',
  blocksImplementation: true,
  values: {
    qualityTiers: ['Common', 'Rare', 'Epic', 'Legendary'],
    levelRange: { min: 1, max: 40 },
    // All stat values: null — not yet known
    statsByQualityAndLevel: null,
    // Star promotions after lv40: count unknown
    starPromotionsAfterMax: null,
  },
  notes: [
    '4 quality tiers exist: Common, Rare, Epic, Legendary.',
    'Gear can be leveled from 1 to 40.',
    'After lv40, star promotions exist (star count unknown).',
    'Higher quality and level clearly provide higher stats (observed).',
    'OPEN Q1: Is gear stat scaling linear (same increase per level) or stepped?',
    'OPEN Q2: Are quality ratios consistent across all slots?',
  ],
};
