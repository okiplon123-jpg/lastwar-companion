import type { KnowledgeExperiment } from '../schema';

export const EXP015: KnowledgeExperiment = {
  id: 'EXP-015',
  mechanicIds: ['M-008'],
  researchQuestion:
    'Does upgrading a hero skill level change Squad Power?',
  method:
    'Record Squad Power with a hero at skill level X. ' +
    'Upgrade one skill by 1 level. ' +
    'Record Squad Power after upgrade. ' +
    'If delta > 0 → skills contribute to Squad Power display.',
  requiredState:
    'One hero with an upgradable skill. Skill Medals available.',
  expectedOutput:
    'Confirmed whether skill levels affect Squad Power display. ' +
    'If yes: power delta per skill level.',
  effort: 'TRIVIAL',
  priority: 'MEDIUM',
  status: 'PENDING',
  blockedBy: [],
  resultEvidenceId: null,
};
