import type { KnowledgeEvidence } from '../schema';

export const EV003: KnowledgeEvidence = {
  id: 'EV-003',
  mechanicIds: ['M-010', 'M-005'],
  sourceType: 'observation',
  date: 'unknown',
  gameVersion: null,
  description:
    'Exclusive Weapon unlock requirement observed from in-game UI: requires hero to be at 5★.',
  observedValues: {
    ewUnlockRequirement: '5★',
  },
  verificationStatus: 'UNVERIFIED',
  notes:
    'UI locks EW behind 5★ promotion. Community universally agrees. No screenshot on file.',
};
