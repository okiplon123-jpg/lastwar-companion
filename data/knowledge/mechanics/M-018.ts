import type { KnowledgeMechanic } from '../schema';

export const M018: KnowledgeMechanic = {
  id: 'M-018',
  name: 'Buildings — Hero Stat Bonuses',
  domain: 'combat',
  system: 'buildings_combat',
  whatItIs:
    'Hero ATK/DEF/HP percentage bonuses provided by upgrading specific ' +
    'buildings to higher levels.',
  whatItGives: [
    {
      stat: 'hero_ATK_pct',
      valueType: 'pct',
      value: null,
      condition: 'building at required level',
      stacking: 'unknown',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-010'],
    },
    {
      stat: 'hero_DEF_pct',
      valueType: 'pct',
      value: null,
      condition: 'building at required level',
      stacking: 'unknown',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-010'],
    },
    {
      stat: 'hero_HP_pct',
      valueType: 'pct',
      value: null,
      condition: 'building at required level',
      stacking: 'unknown',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-010'],
    },
  ],
  modifiedBy: ['M-001', 'M-016'],
  modifies: ['M-001'],
  whenActive: 'building is at the level that grants the bonus — permanent passive',
  stackingRule: 'UNKNOWN — stacks with other modifiers per M-016',
  limits: '62 buildings documented in buildings-data.json',
  isConditional: false,
  dependentSystems: ['M-001'],
  status: 'PARTIALLY_KNOWN',
  verifiedBy: [],
  partialEvidence: ['EV-010'],
  blockingExperiments: ['EXP-016'],
  researchQuestion:
    'Do building hero stat bonuses appear in Squad Power display? ' +
    'Are the bonus values in buildings-data.json accurate (scraped from third-party)?',
  affectsEngine: ['engine/modifiers/buildings.ts'],
  affectsFeatures: ['Squad Power display', 'Building upgrade optimizer'],
  estimatedImpact: 'MEDIUM',
  blocksImplementation: false,
  values: {
    buildingCount: 62,
    dataSource: 'lib/buildings-data.json',
    dataSourceVerified: false,
    // Some buildings are type-specific (Air Center → Aircraft heroes, etc.)
    typeScopedBonuses: true,
  },
  notes: [
    'buildings-data.json contains bonus data for 62 buildings scraped from cpt-hedge.com.',
    'Buildings list hero HP%, hero ATK%, hero DEF% as bonus types.',
    'Some buildings are type-specific (Air Center → Aircraft heroes, etc.).',
    'Data source was a web scrape; values have not been cross-validated.',
    'OPEN Q1: Do building bonuses affect the Squad Power number or only actual combat stats?',
  ],
};
