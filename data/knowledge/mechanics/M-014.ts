import type { KnowledgeMechanic } from '../schema';

export const M014: KnowledgeMechanic = {
  id: 'M-014',
  name: 'VS Technology Multiplier',
  domain: 'combat',
  system: 'vs_tech',
  whatItIs:
    'A global multiplier on troop stats (or squad power) determined by the ' +
    'VS Technology research level (0–6).',
  whatItGives: [
    {
      stat: 'squad_power_or_troop_stats',
      valueType: 'multiplier',
      value: null,
      condition: 'VS Tech level > 0',
      stacking: 'multiplicative',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-008'],
    },
  ],
  modifiedBy: ['M-016'],
  modifies: ['M-001'],
  whenActive: 'VS Tech researched — permanent passive multiplier',
  stackingRule: 'Multiplicative (applied after other modifiers, per community — unverified)',
  limits: 'VS Tech max level: 6',
  isConditional: false,
  dependentSystems: ['M-001', 'M-016'],
  status: 'PARTIALLY_KNOWN',
  verifiedBy: [],
  partialEvidence: ['EV-008'],
  blockingExperiments: ['EXP-017'],
  researchQuestion:
    'Does VS Tech multiply the Squad Power display or only combat stats? ' +
    'What exactly is multiplied: total power, troop power, troop stats, or hero stats? ' +
    'Is the multiplier applied before or after other modifiers?',
  affectsEngine: ['engine/modifiers/vs-tech.ts'],
  affectsFeatures: ['Squad Power display', 'VS Points optimizer'],
  estimatedImpact: 'MEDIUM',
  blocksImplementation: false,
  values: {
    // Community-reported multipliers (EV-008, NOT verified by personal test):
    byLevel: {
      0: 1.00,
      1: 1.10,
      2: 1.20,
      3: 1.35,
      4: 1.50,
      5: 1.75,
      6: 2.00,
    },
    maxLevel: 6,
  },
  notes: [
    'All multiplier values are community-reported via EV-008. Not personally tested.',
    'Non-linear progression (not uniform steps).',
    'OPEN Q1: Does VS Tech ×2.0 (lv6) double the displayed Squad Power, or does it only double the underlying combat stats before the power formula runs?',
  ],
};
