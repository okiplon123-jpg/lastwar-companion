import type { KnowledgeMechanic } from '../schema';

export const M003: KnowledgeMechanic = {
  id: 'M-003',
  name: 'Hero Base Stats (ATK / DEF / HP at Level 1, 1★, No Modifiers)',
  domain: 'combat',
  system: 'hero_base',
  whatItIs:
    'The raw ATK, DEF, and HP values of a hero at the minimum state: level 1, ' +
    '1 star, no gear, no Exclusive Weapon, no decorations, no Wall of Honor. ' +
    'These are the inputs to all hero stat calculations.',
  whatItGives: [
    {
      stat: 'hero_ATK',
      valueType: 'flat',
      value: null,
      condition: 'hero at lv1, 1★, no gear, no modifiers',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
    {
      stat: 'hero_DEF',
      valueType: 'flat',
      value: null,
      condition: 'hero at lv1, 1★, no gear, no modifiers',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
    {
      stat: 'hero_HP',
      valueType: 'flat',
      value: null,
      condition: 'hero at lv1, 1★, no gear, no modifiers',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
  ],
  modifiedBy: [],
  modifies: ['M-004', 'M-005', 'M-006', 'M-007', 'M-008', 'M-021'],
  whenActive: 'always — base values at minimum hero state',
  stackingRule: 'These are the base inputs; they are not stacked themselves',
  limits: null,
  isConditional: false,
  dependentSystems: ['M-004', 'M-005', 'M-006', 'M-007', 'M-010', 'M-012', 'M-021'],
  status: 'UNKNOWN',
  verifiedBy: [],
  partialEvidence: [],
  blockingExperiments: ['EXP-002'],
  researchQuestion:
    'What are the exact ATK, DEF, HP values of each hero rarity (UR, SSR, SR) ' +
    'at level 1, 1★, with no gear or other modifiers? Do all UR heroes share identical base stats?',
  affectsEngine: ['engine/hero/base-stats.ts'],
  affectsFeatures: ['Squad Power display', 'Hero stat display', 'Gear recommendations', 'Upgrade Planner'],
  estimatedImpact: 'CRITICAL',
  blocksImplementation: true,
  values: null,
  notes: [
    'Heroes have ATK, DEF, HP stats visible on the hero detail screen.',
    'Stats increase with level, stars, gear, and other modifiers (observed).',
    'No baseline values have been recorded.',
    'This is the single most important unknown for hero power calculation.',
    'Without it, no hero contribution can be computed.',
    'Obtaining this requires: one hero, lv1, 1★, zero gear, screenshot.',
    'OPEN Q1: Do all UR heroes share the same ATK/DEF/HP base stats?',
    'OPEN Q2: Is the stat distribution (ATK vs DEF vs HP) fixed per rarity or per hero?',
    'OPEN Q3: Does the game display exact integer values or rounded values?',
  ],
};
