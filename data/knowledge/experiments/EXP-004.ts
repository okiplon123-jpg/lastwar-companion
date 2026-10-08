import type { KnowledgeExperiment } from '../schema';

export const EXP004: KnowledgeExperiment = {
  id: 'EXP-004',
  mechanicIds: ['M-005'],
  researchQuestion:
    'What is the multiplier or additive bonus per star promotion (1★ → 5★)?',
  method:
    'Same hero, same level (fix at e.g. lv100), same gear (none): ' +
    'record ATK, DEF, HP at 1★, 2★, 3★, 4★, 5★. ' +
    'Compute ratio between consecutive star levels. ' +
    'If ratios are constant → uniform multiplier per star. ' +
    'If ratios differ → per-transition table.',
  requiredState:
    'Same hero available at multiple star counts with same level and no gear. ' +
    'All five star levels (1★–5★) accessible.',
  expectedOutput:
    'Per-star multiplier table or additive % per star.',
  effort: 'MEDIUM',
  priority: 'CRITICAL',
  status: 'PENDING',
  blockedBy: ['EXP-002'],
  resultEvidenceId: null,
};
