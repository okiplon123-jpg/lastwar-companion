import type { KnowledgeEvidence } from '../schema';

export const EV012: KnowledgeEvidence = {
  id: 'EV-012',
  mechanicIds: ['M-020'],
  sourceType: 'observation',
  date: 'unknown',
  gameVersion: null,
  description:
    'Type counter triangle and damage reduction reported by game tutorial and community sources.',
  observedValues: {
    triangle: 'Tank > Missile > Aircraft > Tank',
    counterDamageTaken: 0.80, // counter type takes 80% damage (20% reduction)
    counterDamageReduction: 0.20,
  },
  verificationStatus: 'UNVERIFIED',
  notes:
    'Source: game tutorial + community. Broadly consistent across sources. ' +
    'High community consensus but not measured with controlled test.',
};
