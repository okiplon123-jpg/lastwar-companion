import type { KnowledgeExperiment } from '../schema';

export const EXP011: KnowledgeExperiment = {
  id: 'EXP-011',
  mechanicIds: ['M-013'],
  researchQuestion:
    'Are the composition bonus values correct? What do they apply to (troops, heroes, or both)?',
  method:
    'Squad: 5 heroes of 5 different types (if possible) → record Squad Power P0. ' +
    'Swap to: 5 heroes all same type → record Squad Power P1. ' +
    'Delta = P1 - P0. ' +
    'What percentage of P0 is the delta?',
  requiredState:
    'Access to 5 heroes of different types AND 5 heroes of the same type. ' +
    'Requires EXP-001 to be completed first (need power formula to interpret delta).',
  expectedOutput:
    'Verified composition bonus % for mono-type squad. ' +
    'Confirmed stat scope (troops/heroes/both).',
  effort: 'LOW',
  priority: 'HIGH',
  status: 'PENDING',
  blockedBy: ['EXP-001'],
  resultEvidenceId: null,
};
