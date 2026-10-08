import type { KnowledgeEvidence } from '../schema';

export const EV001: KnowledgeEvidence = {
  id: 'EV-001',
  mechanicIds: ['M-002'],
  sourceType: 'community',
  date: 'unknown',
  gameVersion: null,
  description:
    'Troop tier base power values T1–T10, collected from multiple community guides and Reddit posts.',
  observedValues: {
    T1: 24,
    T2: 50,
    T3: 80,
    T4: 120,
    T5: 200,
    T6: 300,
    T7: 500,
    T8: 800,
    T9: 1200,
    T10: 1647,
  },
  verificationStatus: 'UNVERIFIED',
  notes:
    'T10=1647 is a non-round number. If correct, suggests base power is looked up from a table ' +
    'rather than computed from a formula. Multiple independent community sources agree on these values. ' +
    'Personal verification required before any engine implementation.',
};
