import type { KnowledgeEvidence } from '../schema';

export const EV007: KnowledgeEvidence = {
  id: 'EV-007',
  mechanicIds: ['M-013'],
  sourceType: 'community',
  date: 'unknown',
  gameVersion: null,
  description:
    'Squad composition bonus values reported by community guides.',
  observedValues: {
    threeSameType: { composition: '3 same type', bonusPct: 5 },
    threePlusTwo: { composition: '3 of one type + 2 of another', bonusPct: 10 },
    fourSameType: { composition: '4 same type', bonusPct: 15 },
    fiveMono: { composition: '5 all same type', bonusPct: 20 },
    statAffected: 'ATK/DEF/HP (all three, per community)',
    otherCompositions: null,
  },
  verificationStatus: 'UNVERIFIED',
  notes:
    'Source untraced. Values not tested. Stat scope (troops vs heroes vs both) unknown.',
};
