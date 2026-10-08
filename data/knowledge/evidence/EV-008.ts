import type { KnowledgeEvidence } from '../schema';

export const EV008: KnowledgeEvidence = {
  id: 'EV-008',
  mechanicIds: ['M-014'],
  sourceType: 'community',
  date: 'unknown',
  gameVersion: null,
  description:
    'VS Technology multipliers for levels 0–6 reported by community / cpt-hedge.com.',
  observedValues: {
    multipliersByLevel: {
      0: 1.00,
      1: 1.10,
      2: 1.20,
      3: 1.35,
      4: 1.50,
      5: 1.75,
      6: 2.00,
    },
  },
  verificationStatus: 'UNVERIFIED',
  notes:
    'Non-linear progression (not uniform steps between levels). ' +
    'Confirmed by multiple sources. Not personally tested.',
};
