import type { KnowledgeExperiment } from '../schema';

export const EXP017: KnowledgeExperiment = {
  id: 'EXP-017',
  mechanicIds: ['M-014'],
  researchQuestion:
    'Does VS Tech multiply the Squad Power display or only underlying combat stats? ' +
    'What exactly is multiplied: total power, troop power, or troop/hero stats?',
  method:
    'Record Squad Power at current VS Tech level. ' +
    'Advance VS Tech by one level. ' +
    'Record new Squad Power. ' +
    'Compute ratio: new/old. Compare to expected multiplier from EV-008. ' +
    'If ratio matches the multiplier exactly → VS Tech multiplies Squad Power display. ' +
    'If ratio differs → VS Tech multiplies a sub-component.',
  requiredState:
    'VS Tech research available to advance by exactly one level. ' +
    'Controlled squad (all other variables constant).',
  expectedOutput:
    'Confirmed what VS Tech multiplies (display power vs. combat stats). ' +
    'Verified multiplier values from EV-008.',
  effort: 'LOW',
  priority: 'MEDIUM',
  status: 'PENDING',
  blockedBy: [],
  resultEvidenceId: null,
};
