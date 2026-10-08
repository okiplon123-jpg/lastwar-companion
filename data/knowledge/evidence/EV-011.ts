import type { KnowledgeEvidence } from '../schema';

export const EV011: KnowledgeEvidence = {
  id: 'EV-011',
  mechanicIds: ['M-019'],
  sourceType: 'community',
  date: 'unknown',
  gameVersion: null,
  description:
    'Profession bonus values reported by community guides for all three professions.',
  observedValues: {
    HomelandDefender: {
      ATKpct: 5,
      DEFpct: 5,
      condition: 'when defending own city',
    },
    InvasionForce: {
      ATKpct: 5,
      DEFpct: 5,
      condition: 'when attacking another player',
    },
    Reinforcement: {
      ATKpct: 1,
      DEFpct: 1,
      HPpct: 1,
      condition: 'when reinforcing an ally',
    },
  },
  verificationStatus: 'UNVERIFIED',
  notes:
    'All values from community guides. None personally verified.',
};
