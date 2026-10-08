import type { KnowledgeEvidence } from '../schema';

export const EV002: KnowledgeEvidence = {
  id: 'EV-002',
  mechanicIds: ['M-004'],
  sourceType: 'observation',
  date: 'unknown',
  gameVersion: null,
  description:
    'Hero level cap rule observed from in-game UI text: max level = HQ Level × 5, absolute maximum 175 at HQ Level 35.',
  observedValues: {
    levelCapFormula: 'HQ Level × 5',
    absoluteMax: 175,
    hqLevelForMax: 35,
  },
  verificationStatus: 'UNVERIFIED',
  notes:
    'UI clearly states this relationship. High confidence but not tested by attempting ' +
    'to level a hero past the cap.',
};
