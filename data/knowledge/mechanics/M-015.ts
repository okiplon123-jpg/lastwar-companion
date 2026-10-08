import type { KnowledgeMechanic } from '../schema';

export const M015: KnowledgeMechanic = {
  id: 'M-015',
  name: 'Alliance Technology Bonuses',
  domain: 'alliance',
  system: 'alliance_tech',
  whatItIs:
    'Stat bonuses provided by the Alliance Technology research tree.',
  whatItGives: [
    {
      stat: 'unknown_stat',
      valueType: 'unknown',
      value: null,
      condition: 'alliance tech node researched',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
  ],
  modifiedBy: [],
  modifies: ['M-001'],
  whenActive: 'alliance tech node researched — permanent passive bonus',
  stackingRule: 'UNKNOWN',
  limits: 'UNKNOWN — whether nodes have max level caps or seasonal tiers',
  isConditional: false,
  dependentSystems: ['M-001'],
  status: 'UNKNOWN',
  verifiedBy: [],
  partialEvidence: [],
  blockingExperiments: ['EXP-013'],
  researchQuestion:
    'Which stats does alliance tech affect (ATK%, DEF%, HP%, type-specific or global)? ' +
    'What are the bonus values per node per level? Are bonuses personal or shared with all alliance members?',
  affectsEngine: ['engine/modifiers/alliance-tech.ts'],
  affectsFeatures: ['Squad Power display', 'Alliance recommendations'],
  estimatedImpact: 'HIGH',
  blocksImplementation: false,
  values: null,
  notes: [
    'Alliance tech system exists and is known to affect combat and economy (community consensus).',
    'OPEN Q1: Is alliance tech capped at a maximum level, or do seasons add new tiers?',
    'OPEN Q2: Are bonuses personal (per player) or shared with all alliance members?',
  ],
};
