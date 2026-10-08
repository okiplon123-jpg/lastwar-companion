import type { KnowledgeEvidence } from '../schema';

export const EV009: KnowledgeEvidence = {
  id: 'EV-009',
  mechanicIds: ['M-017'],
  sourceType: 'community',
  date: 'unknown',
  gameVersion: null,
  description:
    'VIP high-level combat stat bonuses at level 10 and level 18 reported by community guides.',
  observedValues: {
    lv10: { heroATKpct: 2.5, heroDEFpct: 2.5, heroHPpct: 2.5 },
    lv18: { heroATKpct: 12.5, heroDEFpct: 12.5, heroHPpct: 12.5 },
    fullTable: null,
  },
  verificationStatus: 'UNVERIFIED',
  notes:
    'Only lv10 and lv18 values reported. Full table lv1–18 unknown. ' +
    'No screenshot or in-game source on file.',
};
