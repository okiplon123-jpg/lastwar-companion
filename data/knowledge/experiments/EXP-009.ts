import type { KnowledgeExperiment } from '../schema';

export const EXP009: KnowledgeExperiment = {
  id: 'EXP-009',
  mechanicIds: ['M-010'],
  researchQuestion:
    'What is the stat bonus or effect at every EW level from 1 to 30?',
  method:
    'One hero with EW (any starting level). ' +
    'Screenshot or record EW level description at each level 1–30. ' +
    'Record Squad Power delta before and after lv10 upgrade. ' +
    'Record Squad Power delta before and after lv20 upgrade.',
  requiredState:
    'One hero with an Exclusive Weapon. ' +
    'Resources to upgrade EW from lv1 to lv30 (or ability to read each level description in the upgrade UI).',
  expectedOutput:
    'Complete EW effect table lv1–30. ' +
    'Confirmed scope of lv10 "team buff" and lv20 "same troop type in formation."',
  effort: 'MEDIUM',
  priority: 'HIGH',
  status: 'PENDING',
  blockedBy: [],
  resultEvidenceId: null,
};
