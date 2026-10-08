import type { KnowledgeEvidence } from '../schema';

export const EV005: KnowledgeEvidence = {
  id: 'EV-005',
  mechanicIds: ['M-010'],
  sourceType: 'community',
  date: 'unknown',
  gameVersion: null,
  description:
    'Exclusive Weapon level 10 and level 20 effects reported by community guides.',
  observedValues: {
    lv10: '+5% team buff (stat type and scope unknown)',
    lv20: '+7.5% ATK/DEF/HP to all heroes of same troop type in formation',
    lv30: null,
    otherLevels: null,
  },
  verificationStatus: 'UNVERIFIED',
  notes:
    '"Team buff" at lv10 is vague — unknown if ATK only, or ATK+DEF+HP. ' +
    '"Same troop type in formation" scope is ambiguous. ' +
    'Both values are unverified community claims.',
};
