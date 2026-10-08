import type { KnowledgeExperiment } from '../schema';

export const EXP003: KnowledgeExperiment = {
  id: 'EXP-003',
  mechanicIds: ['M-004'],
  researchQuestion:
    'What is the formula by which hero ATK/DEF/HP scale from level 1 to 175?',
  method:
    'Same hero, same star (1★), same gear (none), different levels: ' +
    'levels 1, 25, 50, 75, 100, 125, 150, 175. Record ATK, DEF, HP at each level. ' +
    '1. Collect stat values at each level checkpoint. ' +
    '2. Compute first differences (delta between consecutive levels). ' +
    '3. If first differences are constant → linear growth. ' +
    '4. If first differences increase → polynomial/exponential. ' +
    '5. If first differences have jumps at specific levels → piecewise. ' +
    '6. Fit the appropriate formula to the data.',
  requiredState:
    'Same hero available at multiple level checkpoints with 1★, no gear. ' +
    'Minimum 5 data points, 8 preferred.',
  expectedOutput:
    'Formula type (linear/piecewise/polynomial) + coefficients, ' +
    'OR a lookup table if no formula fits.',
  effort: 'HIGH',
  priority: 'CRITICAL',
  status: 'PENDING',
  blockedBy: ['EXP-002'],
  resultEvidenceId: null,
};
