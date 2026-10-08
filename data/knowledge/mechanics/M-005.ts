import type { KnowledgeMechanic } from '../schema';

export const M005: KnowledgeMechanic = {
  id: 'M-005',
  name: 'Hero Star Scaling (1★ → 5★)',
  domain: 'combat',
  system: 'hero_stars',
  whatItIs:
    'The multiplier or additive bonus applied to hero stats when promoted ' +
    'from 1 star to higher star counts via the shard promotion system.',
  whatItGives: [
    {
      stat: 'hero_ATK',
      valueType: 'unknown',
      value: null,
      condition: 'per star level above 1★',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
    {
      stat: 'hero_DEF',
      valueType: 'unknown',
      value: null,
      condition: 'per star level above 1★',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
    {
      stat: 'hero_HP',
      valueType: 'unknown',
      value: null,
      condition: 'per star level above 1★',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
  ],
  modifiedBy: ['M-003', 'M-004'],
  modifies: ['M-001', 'M-010'],
  whenActive: 'hero star level > 1★',
  stackingRule: 'Applied on top of M-003 base stats (after level scaling)',
  limits: '5★ is the maximum star count',
  isConditional: false,
  dependentSystems: ['M-010', 'M-001'],
  status: 'UNKNOWN',
  verifiedBy: [],
  partialEvidence: ['EV-003'],
  blockingExperiments: ['EXP-004'],
  researchQuestion:
    'What is the scaling factor per star promotion? Is it multiplicative (×1.X) ' +
    'or additive (+X% per star)? Does scaling differ between UR and SSR?',
  affectsEngine: ['engine/hero/star-scaling.ts'],
  affectsFeatures: ['Squad Power display', 'Hero stat display', 'Upgrade Planner'],
  estimatedImpact: 'CRITICAL',
  blocksImplementation: true,
  values: {
    maxStars: 5,
    ewUnlockRequirement: '5★',
    // Per-star scaling factors: null — not yet known
    scalingPerStar: null,
  },
  notes: [
    'Star system exists (1★ through 5★).',
    '5★ is required to unlock Exclusive Weapon (EV-003).',
    'Stats visibly increase with stars (direct observation, no quantification).',
    'OPEN Q1: Is scaling additive per star or a discrete multiplier per promotion?',
    'OPEN Q2: Is the 3★→4★ transition (Expertise unlock) also a stat increase?',
  ],
};
