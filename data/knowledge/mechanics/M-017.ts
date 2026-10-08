import type { KnowledgeMechanic } from '../schema';

export const M017: KnowledgeMechanic = {
  id: 'M-017',
  name: 'VIP Level — Combat Stat Bonuses',
  domain: 'progression',
  system: 'vip_combat',
  whatItIs:
    'Bonuses to hero ATK/DEF/HP stats conferred by VIP level.',
  whatItGives: [
    {
      stat: 'hero_ATK_pct',
      valueType: 'pct',
      value: null,
      condition: 'VIP level ≥ threshold',
      stacking: 'unknown',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-009'],
    },
    {
      stat: 'hero_DEF_pct',
      valueType: 'pct',
      value: null,
      condition: 'VIP level ≥ threshold',
      stacking: 'unknown',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-009'],
    },
    {
      stat: 'hero_HP_pct',
      valueType: 'pct',
      value: null,
      condition: 'VIP level ≥ threshold',
      stacking: 'unknown',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-009'],
    },
  ],
  modifiedBy: [],
  modifies: ['M-001'],
  whenActive: 'VIP level achieved — permanent passive bonus',
  stackingRule: 'UNKNOWN — stacks with other modifiers per M-016',
  limits: 'VIP max level: 18',
  isConditional: false,
  dependentSystems: ['M-001'],
  status: 'PARTIALLY_KNOWN',
  verifiedBy: [],
  partialEvidence: ['EV-009'],
  blockingExperiments: ['EXP-012'],
  researchQuestion:
    'What is the full VIP combat bonus table for levels 1–18? At which VIP levels do ' +
    'combat bonuses first appear? Do bonuses apply to all heroes or only active squad heroes?',
  affectsEngine: ['engine/modifiers/vip.ts'],
  affectsFeatures: ['Squad Power display'],
  estimatedImpact: 'MEDIUM',
  blocksImplementation: false,
  values: {
    maxLevel: 18,
    // Community-reported values (EV-009, NOT verified):
    lv10: { heroATKpct: 2.5, heroDEFpct: 2.5, heroHPpct: 2.5 },
    lv18: { heroATKpct: 12.5, heroDEFpct: 12.5, heroHPpct: 12.5 },
    // Full table lv1–18: null
    fullTable: null,
  },
  notes: [
    'VIP Lv10: +2.5% hero ATK/DEF/HP (community-reported, not verified).',
    'VIP Lv18: +12.5% hero HP/ATK/DEF (community-reported, not verified).',
    'All values from EV-009. Full table unknown.',
    'OPEN Q1: At which VIP levels do combat bonuses first appear?',
    'OPEN Q2: Is there a single in-game screen showing all VIP bonuses at all levels?',
  ],
};
