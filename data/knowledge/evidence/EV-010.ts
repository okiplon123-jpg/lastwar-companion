import type { KnowledgeEvidence } from '../schema';

export const EV010: KnowledgeEvidence = {
  id: 'EV-010',
  mechanicIds: ['M-018'],
  sourceType: 'scrape',
  date: '2026',
  gameVersion: null,
  description:
    '62 buildings documented with name, season, levels, costs, and bonus data scraped from cpt-hedge.com.',
  observedValues: {
    buildingCount: 62,
    dataFile: 'lib/buildings-data.json',
    bonusTypes: ['hero HP%', 'hero ATK%', 'hero DEF%'],
    typeScopedExamples: ['Air Center → Aircraft heroes'],
    extractionMethod: 'Web scrape of cpt-hedge.com',
  },
  verificationStatus: 'UNVERIFIED',
  notes:
    'Bonus values (e.g. +X% Hero HP) come from scraped text. ' +
    'Whether these match actual in-game values has not been confirmed.',
};
