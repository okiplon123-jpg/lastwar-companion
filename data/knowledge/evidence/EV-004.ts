import type { KnowledgeEvidence } from '../schema';

export const EV004: KnowledgeEvidence = {
  id: 'EV-004',
  mechanicIds: ['M-009'],
  sourceType: 'scrape',
  date: '2026',
  gameVersion: null,
  description:
    'Research tree structure and node effects scraped from cpt-hedge.com. ' +
    '19 research trees documented with all nodes, IDs, effect descriptions, and pctPerLv values.',
  observedValues: {
    treeCount: 19,
    dataFiles: ['lib/research-data.json', 'lib/research-effects.ts'],
    extractionMethod: 'Web scrape of cpt-hedge.com',
  },
  verificationStatus: 'UNVERIFIED',
  notes:
    'pctPerLv values come from the scraped effect description text, not from in-game stat measurements. ' +
    'Example: "+2% Tank ATK" → pctPerLv=2. Need to verify: does the game actually give +2.0% per level ' +
    'or is it +1.9%, +2.1%, etc. (i.e. is the text description exact)? Not cross-checked with in-game.',
};
