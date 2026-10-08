import type { KnowledgeMechanic } from '../schema';

export const M013: KnowledgeMechanic = {
  id: 'M-013',
  name: 'Squad Composition Bonus',
  domain: 'combat',
  system: 'squad_composition',
  whatItIs:
    'Bonus ATK/DEF/HP awarded based on the type distribution of heroes ' +
    'occupying the 5 squad slots.',
  whatItGives: [
    {
      stat: 'ATK_DEF_HP_pct',
      valueType: 'pct',
      value: null,
      condition: 'squad has 3+ heroes of same type',
      stacking: 'unknown',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-007'],
    },
  ],
  modifiedBy: ['M-001'],
  modifies: ['M-001'],
  whenActive: 'squad has 3 or more heroes of the same type',
  stackingRule: 'UNKNOWN — stacks with other modifiers per M-016',
  limits: 'Squad size: 5 heroes. Bonus depends on type distribution.',
  isConditional: true,
  dependentSystems: ['M-001'],
  status: 'PARTIALLY_KNOWN',
  verifiedBy: [],
  partialEvidence: ['EV-007'],
  blockingExperiments: ['EXP-011'],
  researchQuestion:
    'Are the reported composition bonus values correct? Does the bonus apply to ' +
    'troops, heroes, or both? What is the bonus for a 2+2+1 composition?',
  affectsEngine: ['engine/modifiers/squad-composition.ts'],
  affectsFeatures: ['Squad Power display', 'Squad optimizer'],
  estimatedImpact: 'HIGH',
  blocksImplementation: false,
  values: {
    // Community-reported values (EV-007, NOT verified by personal test):
    threeOfSameType: { heroCount: 3, bonusPct: 5, label: '3 same type' },
    threePlusTwo: { heroCount: '3+2', bonusPct: 10, label: '3 of one type + 2 of another' },
    fourOfSameType: { heroCount: 4, bonusPct: 15, label: '4 same type' },
    fiveMono: { heroCount: 5, bonusPct: 20, label: '5 all same type' },
    // 2+2+1 and other distributions: null
    otherDistributions: null,
  },
  notes: [
    'All values are community-reported via EV-007. Not verified by personal test.',
    'Whether these % values apply to troops, heroes, or both: UNKNOWN.',
    'Whether all three stats (ATK/DEF/HP) are boosted equally: UNKNOWN.',
    'Whether bonus appears in Squad Power display: UNKNOWN.',
    'OPEN Q1: What bonus does a 2+2+1 composition receive?',
    'OPEN Q2: Are empty squad slots counted as a hero "type"?',
  ],
};
