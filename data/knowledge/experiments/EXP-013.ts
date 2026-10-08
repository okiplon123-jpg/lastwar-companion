import type { KnowledgeExperiment } from '../schema';

export const EXP013: KnowledgeExperiment = {
  id: 'EXP-013',
  mechanicIds: ['M-015'],
  researchQuestion:
    'What is the full alliance technology node list with effects and bonus values?',
  method:
    'Full screenshot(s) of Alliance Technology research tree. ' +
    'Record each node\'s description, current level, and max level.',
  requiredState:
    'Access to the Alliance Technology research tree in-game.',
  expectedOutput:
    'Complete alliance tech node list with effect descriptions and bonus values. ' +
    'Determines: which stats are affected, global or type-specific, max levels.',
  effort: 'LOW',
  priority: 'HIGH',
  status: 'PENDING',
  blockedBy: [],
  resultEvidenceId: null,
};
