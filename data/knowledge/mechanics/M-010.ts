import type { KnowledgeMechanic } from '../schema';

export const M010: KnowledgeMechanic = {
  id: 'M-010',
  name: 'Exclusive Weapon (EW) — Level Effects (1–30)',
  domain: 'combat',
  system: 'exclusive_weapon',
  whatItIs:
    'Stat bonuses conferred by upgrading a hero\'s Exclusive Weapon from ' +
    'level 1 to 30, with known milestone effects at levels 10 and 20.',
  whatItGives: [
    {
      stat: 'hero_stat_pct',
      valueType: 'pct',
      value: null, // Lv10: +5% (stat unknown), Lv20: +7.5% ATK/DEF/HP
      condition: 'EW at level 10+; only heroes of same troop type in formation',
      stacking: 'unknown',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-005'],
    },
  ],
  modifiedBy: ['M-005'],
  modifies: ['M-001', 'M-013'],
  whenActive: 'EW equipped on hero; hero is 5★ (required to unlock EW)',
  stackingRule: 'UNKNOWN — stacks with other modifiers per M-016',
  limits: 'EW max level: 30. Requires hero at 5★ to unlock.',
  isConditional: false,
  dependentSystems: ['M-001'],
  status: 'PARTIALLY_KNOWN',
  verifiedBy: [],
  partialEvidence: ['EV-005'],
  blockingExperiments: ['EXP-009'],
  researchQuestion:
    'What is the exact stat bonus at each EW level 1–30? What scope does lv20 ' +
    '"same troop type in formation" mean? What does lv10 "+5% team buff" affect?',
  affectsEngine: ['engine/modifiers/exclusive-weapon.ts'],
  affectsFeatures: ['Squad Power display', 'Hero stat display', 'Upgrade Planner'],
  estimatedImpact: 'HIGH',
  blocksImplementation: false,
  values: {
    maxLevel: 30,
    unlockRequirement: '5★',
    // Community-reported (EV-005, NOT verified):
    lv10Effect: '+5% team buff (stat type and scope UNKNOWN)',
    lv20Effect: '+7.5% ATK/DEF/HP to all heroes of same troop type in formation',
    lv30Effect: null,
    // Levels 1–9, 11–19, 21–29: all null
    effectsByLevel: null,
  },
  notes: [
    'EW Lv10: "+5% team buff" — which stat, which scope: UNKNOWN.',
    'EW Lv20: "+7.5% ATK/DEF/HP to all heroes of same troop type in formation." "Formation" scope is ambiguous.',
    'EW Lv30: UNKNOWN.',
    'All values are community-reported via EV-005. Not personally verified.',
    'OPEN Q1: Is the lv10 "+5% team buff" limited to one stat or all three (ATK/DEF/HP)?',
    'OPEN Q2: Does "same troop type in formation" mean only heroes of that type in the squad, or globally?',
  ],
};
