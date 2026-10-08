import type { KnowledgeExperiment } from '../schema';

export const EXP008: KnowledgeExperiment = {
  id: 'EXP-008',
  mechanicIds: ['M-012'],
  researchQuestion:
    'Do WoH bonuses appear in Squad Power? Is the +0.50%/50 levels bonus rate correct?',
  method:
    'Squad with one hero (known type), controlled troops. ' +
    'Record Squad Power at WoH lv0. ' +
    'Add WoH levels to the hero (minimum 50 levels for first bonus tier). ' +
    'Record Squad Power delta. ' +
    'Compare to expected +0.50% for main UR hero.',
  requiredState:
    'One main UR hero on WoH. Ability to add exactly 50 WoH levels.',
  expectedOutput:
    'Confirmed whether WoH bonuses appear in Squad Power display. ' +
    'Verified or corrected bonus rate. ' +
    'Confirmed whether bonus is squad-local or global.',
  effort: 'MEDIUM',
  priority: 'HIGH',
  status: 'PENDING',
  blockedBy: [],
  resultEvidenceId: null,
};
