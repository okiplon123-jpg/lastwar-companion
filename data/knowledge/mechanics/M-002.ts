import type { KnowledgeMechanic } from '../schema';

export const M002: KnowledgeMechanic = {
  id: 'M-002',
  name: 'Troop Tier Base Power',
  domain: 'combat',
  system: 'troops',
  whatItIs:
    'A fixed power value assigned to each troop of a given tier, which forms ' +
    'the baseline troop contribution to Squad Power before any modifiers.',
  whatItGives: [
    {
      stat: 'troop_base_power',
      valueType: 'flat',
      value: null, // table of values, see values field
      condition: 'always',
      stacking: 'additive',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-001'],
    },
  ],
  modifiedBy: [],
  modifies: ['M-001'],
  whenActive: 'always — fixed game constant per tier',
  stackingRule: 'Additive: each troop contributes its base power value once',
  limits: null,
  isConditional: false,
  dependentSystems: ['M-001'],
  status: 'PARTIALLY_KNOWN',
  verifiedBy: [],
  partialEvidence: ['EV-001'],
  blockingExperiments: ['EXP-001'],
  researchQuestion:
    'Are the community-reported base power values (T1=24…T10=1647) exact? ' +
    'Do values differ by troop type (Tank vs Aircraft vs Missile) at the same tier?',
  affectsEngine: ['engine/power/troop-power.ts'],
  affectsFeatures: ['Squad Power display'],
  estimatedImpact: 'CRITICAL',
  blocksImplementation: true,
  values: {
    // Source: EV-001 (community — NOT VERIFIED)
    T1: 24,
    T2: 50,
    T3: 80,
    T4: 120,
    T5: 200,
    T6: 300,
    T7: 500,
    T8: 800,
    T9: 1200,
    T10: 1647,
  },
  notes: [
    'All values are community-reported via EV-001. Personal verification has not been performed.',
    'T10=1647 is a non-round number — suggests lookup table rather than formula.',
    'Multiple independent community sources agree on these values.',
    'OPEN Q1: Are T1–T10 values identical for all troop types, or type-specific?',
    'OPEN Q2: Is T10=1647 an exact game value or a rounded community observation?',
  ],
};
