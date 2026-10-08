import type { KnowledgeMechanic } from '../schema';

export const M006: KnowledgeMechanic = {
  id: 'M-006',
  name: 'Gear Slot → Stat Type Mapping',
  domain: 'combat',
  system: 'hero_gear',
  whatItIs:
    'Which specific stat (ATK, DEF, HP, or other) each of the 4 gear slots ' +
    '(Cannon, Chip, Armor, Radar) provides when equipped.',
  whatItGives: [
    {
      stat: 'unknown_stat_per_slot',
      valueType: 'unknown',
      value: null,
      condition: 'gear equipped in slot',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
  ],
  modifiedBy: ['M-003'],
  modifies: ['M-007', 'M-001'],
  whenActive: 'gear piece equipped in slot',
  stackingRule: 'UNKNOWN — depends on which stat each slot provides',
  limits: null,
  isConditional: false,
  dependentSystems: ['M-007'],
  status: 'UNKNOWN',
  verifiedBy: [],
  partialEvidence: [],
  blockingExperiments: ['EXP-005'],
  researchQuestion:
    'Which stat does each gear slot (Cannon, Chip, Armor, Radar) affect? ' +
    'Does any slot affect multiple stats? Does Chip affect a non-standard stat?',
  affectsEngine: ['engine/hero/gear-stats.ts'],
  affectsFeatures: ['Squad Power display', 'Gear recommendations'],
  estimatedImpact: 'HIGH',
  blocksImplementation: true,
  values: {
    slots: ['Cannon', 'Chip', 'Armor', 'Radar'],
    // Community hypothesis (NOT verified):
    // Cannon → ATK | Chip → ? | Armor → DEF | Radar → HP
    slotStatMap: null,
  },
  notes: [
    'Community hypothesis (NOT verified): Cannon → ATK, Chip → ?, Armor → DEF, Radar → HP.',
    'Hypothesis is inferred from slot names only. No measurement confirms this.',
    'OPEN Q1: Does Chip provide a combat stat at all, or a secondary stat not in the power formula?',
    'OPEN Q2: Are all 4 slots independent, or do combinations matter?',
  ],
};
