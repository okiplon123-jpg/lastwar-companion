import type { KnowledgeExperiment } from '../schema';

export const EXP020: KnowledgeExperiment = {
  id: 'EXP-020',
  mechanicIds: ['M-022'],
  researchQuestion:
    'Which stats does the Commander system affect and do they appear in Squad Power display?',
  method:
    'Record Squad Power before and after upgrading Commander level or Commander skills. ' +
    'Screenshot the Commander stats panel to record all visible bonus values.',
  requiredState:
    'Commander system accessible. Resources to upgrade Commander level or skill.',
  expectedOutput:
    'Confirmed whether Commander contributions appear in Squad Power. ' +
    'Stat type and value per Commander level/skill upgrade.',
  effort: 'LOW',
  priority: 'MEDIUM',
  status: 'PENDING',
  blockedBy: [],
  resultEvidenceId: null,
};
