import type { KnowledgeMechanic } from '../schema';

export const M022: KnowledgeMechanic = {
  id: 'M-022',
  name: 'Commander System — Stat Contributions',
  domain: 'combat',
  system: 'commander',
  whatItIs:
    'Bonuses provided by the Commander system (level, skills, etc.) ' +
    'that affect combat or economy stats.',
  whatItGives: [
    {
      stat: 'unknown_stat',
      valueType: 'unknown',
      value: null,
      condition: 'commander system active',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
  ],
  modifiedBy: [],
  modifies: ['M-001'],
  whenActive: 'commander system active',
  stackingRule: 'UNKNOWN',
  limits: 'UNKNOWN',
  isConditional: false,
  dependentSystems: ['M-001'],
  status: 'UNKNOWN',
  verifiedBy: [],
  partialEvidence: [],
  blockingExperiments: ['EXP-020'],
  researchQuestion:
    'Which stats does the Commander system affect? What are the bonus values? ' +
    'Does it affect Squad Power display?',
  affectsEngine: ['engine/modifiers/commander.ts'],
  affectsFeatures: ['Squad Power display'],
  estimatedImpact: 'MEDIUM',
  blocksImplementation: false,
  values: null,
  notes: [
    'Commander system exists and provides bonuses of some kind.',
    'All numeric values, affected stats, and display behavior: UNKNOWN.',
  ],
};
