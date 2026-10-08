import type { KnowledgeMechanic } from '../schema';

export const M021: KnowledgeMechanic = {
  id: 'M-021',
  name: 'Decoration Stat Bonuses',
  domain: 'combat',
  system: 'decorations',
  whatItIs:
    'Hero ATK/DEF/HP bonuses (flat or %) provided by equipping and upgrading ' +
    'Decorations.',
  whatItGives: [
    {
      stat: 'hero_stat',
      valueType: 'unknown',
      value: null,
      condition: 'decoration equipped',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
  ],
  modifiedBy: ['M-003'],
  modifies: ['M-001'],
  whenActive: 'decoration equipped on hero',
  stackingRule: 'UNKNOWN',
  limits: 'UNKNOWN — over 62 decorations exist',
  isConditional: false,
  dependentSystems: ['M-001'],
  status: 'UNKNOWN',
  verifiedBy: [],
  partialEvidence: [],
  blockingExperiments: ['EXP-019'],
  researchQuestion:
    'What are the exact flat stat values per decoration per level? ' +
    'Do decorations provide flat bonuses, % bonuses, or both? ' +
    'Do decorations affect Squad Power display?',
  affectsEngine: ['engine/modifiers/decorations.ts'],
  affectsFeatures: ['Squad Power display', 'Hero stat display'],
  estimatedImpact: 'MEDIUM',
  blocksImplementation: false,
  values: null,
  notes: [
    'Decoration system exists.',
    'UR decorations are known to provide hero stat bonuses.',
    'Percentage bonuses (Crit, Skill Damage, Damage Reduction) appear at level 3+.',
    'OPEN Q1: Since there are 62+ decorations, what is the most efficient subset to test?',
  ],
};
