import type { KnowledgeMechanic } from '../schema';

export const M009: KnowledgeMechanic = {
  id: 'M-009',
  name: 'Research % Bonuses',
  domain: 'combat',
  system: 'research_bonuses',
  whatItIs:
    'Percentage bonuses to troop and hero stats provided by completing ' +
    'research nodes across 19 research trees.',
  whatItGives: [
    {
      stat: 'troop_ATK_pct',
      valueType: 'pct',
      value: null, // varies per node; stored in lib/research-effects.ts
      condition: 'research node completed',
      stacking: 'unknown',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-004'],
    },
    {
      stat: 'troop_DEF_pct',
      valueType: 'pct',
      value: null,
      condition: 'research node completed',
      stacking: 'unknown',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-004'],
    },
    {
      stat: 'troop_HP_pct',
      valueType: 'pct',
      value: null,
      condition: 'research node completed',
      stacking: 'unknown',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-004'],
    },
    {
      stat: 'hero_ATK_pct',
      valueType: 'pct',
      value: null,
      condition: 'hero-specific research node completed',
      stacking: 'unknown',
      status: 'PARTIALLY_KNOWN',
      evidenceIds: ['EV-004'],
    },
  ],
  modifiedBy: [],
  modifies: ['M-001', 'M-016'],
  whenActive: 'research node completed — permanent passive bonus',
  stackingRule: 'UNKNOWN — see M-016 (additive or multiplicative with other sources)',
  limits: 'Node max levels vary (typically 1–5). ~100+ nodes across 19 trees.',
  isConditional: false,
  dependentSystems: ['M-001', 'M-016'],
  status: 'PARTIALLY_KNOWN',
  verifiedBy: [],
  partialEvidence: ['EV-004'],
  blockingExperiments: ['EXP-007'],
  researchQuestion:
    'Do research bonuses appear in the Squad Power display? Are pctPerLv values ' +
    'from scraped data accurate? Is "Squad ATK" the same as "Troop ATK"?',
  affectsEngine: ['engine/modifiers/research.ts'],
  affectsFeatures: ['Squad Power display', 'Upgrade Planner'],
  estimatedImpact: 'HIGH',
  blocksImplementation: false,
  values: {
    treeCount: 19,
    // Per-node data is in lib/research-effects.ts and lib/research-data.json
    nodeDataSource: 'lib/research-effects.ts',
    pctPerLvVerified: false,
  },
  notes: [
    '19 research trees confirmed via cpt-hedge.com scraping (EV-004).',
    'Effect data stored in lib/research-effects.ts.',
    'pctPerLv values come from scraped text, not from in-game stat measurements.',
    'Nodes with troop="all" affect all troop types.',
    'OPEN Q1: Does "+2% Troop ATK" add to ATK% pool (additive) or multiply it?',
    'OPEN Q2: Is "Squad ATK" the same modifier stack as "Troop ATK"?',
    'OPEN Q3: Whether research bonuses affect the power display or only actual combat.',
  ],
};
