import type { KnowledgeMechanic } from '../schema';

export const M008: KnowledgeMechanic = {
  id: 'M-008',
  name: 'Hero Skills → Stat / Power Contribution',
  domain: 'combat',
  system: 'hero_skills',
  whatItIs:
    'Whether hero skill levels (Auto-Attack, Tactics, Passive) contribute to ' +
    'the Squad Power display number, and if so, how.',
  whatItGives: [
    {
      stat: 'squad_power',
      valueType: 'unknown',
      value: null,
      condition: 'if skill levels affect power display — UNKNOWN',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
  ],
  modifiedBy: ['M-001'],
  modifies: [],
  whenActive: 'UNKNOWN — may not affect Squad Power display at all',
  stackingRule: 'UNKNOWN',
  limits: 'Skill levels: 1–40 per skill. Expertise at 4★+.',
  isConditional: true,
  dependentSystems: [],
  status: 'UNKNOWN',
  verifiedBy: [],
  partialEvidence: [],
  blockingExperiments: ['EXP-015'],
  researchQuestion:
    'Does upgrading a hero skill level change the Squad Power display? ' +
    'Does expertise unlocking at 4★ increase Squad Power?',
  affectsEngine: ['engine/hero/skill-power.ts'],
  affectsFeatures: ['Squad Power display'],
  estimatedImpact: 'MEDIUM',
  blocksImplementation: false,
  values: null,
  notes: [
    '3 primary skills exist per hero: Auto-Attack, Tactics, Passive (levels 1–40).',
    'Expertise skill exists at 4★+ heroes.',
    'Skill Medals are used to level skills.',
    'Whether skill levels affect the Squad Power display or only combat performance: UNKNOWN.',
    'OPEN Q1: Does upgrading a skill by 1 level change Squad Power?',
  ],
};
