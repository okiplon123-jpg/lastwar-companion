import type { KnowledgeMechanic } from '../schema';

export const M020: KnowledgeMechanic = {
  id: 'M-020',
  name: 'Type Counter (Formation Advantage)',
  domain: 'combat',
  system: 'type_counter',
  whatItIs:
    'The damage modifier applied when a troop type fights against the type ' +
    'it counters in the game\'s triangle system.',
  whatItGives: [
    {
      stat: 'damage_taken_pct',
      valueType: 'multiplier',
      value: 0.80,
      condition: 'target is the countered type (e.g. Tank vs Missile)',
      stacking: 'unknown',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-012'],
    },
  ],
  modifiedBy: [],
  modifies: [],
  whenActive: 'in combat when troop types match the counter triangle',
  stackingRule: 'Likely separate from Squad Power display formula',
  limits: null,
  isConditional: true,
  dependentSystems: [],
  status: 'PARTIALLY_KNOWN',
  verifiedBy: [],
  partialEvidence: ['EV-012'],
  blockingExperiments: [],
  researchQuestion:
    'Does type counter affect Squad Power display (likely NO)? ' +
    'Is the 20% reduction a hard cap or soft modifier? Is it per-troop or per-squad?',
  affectsEngine: ['engine/combat/type-counter.ts'],
  affectsFeatures: ['Combat simulation (not Squad Power display)'],
  estimatedImpact: 'LOW',
  blocksImplementation: false,
  values: {
    triangle: 'Tank > Missile > Aircraft > Tank',
    counterDamageMultiplier: 0.80, // target takes 80% damage (20% reduction)
  },
  notes: [
    'Counter triangle: Tank beats Missile, Missile beats Aircraft, Aircraft beats Tank.',
    'Counter advantage: target takes 80% damage (20% reduction).',
    'Source: game tutorial + community. Broadly consistent.',
    'Whether this modifier affects Squad Power display: likely NO.',
    'OPEN Q1: If squads of different types fight, does the game apply counter to each troop individually or to the squad as a whole?',
  ],
};
