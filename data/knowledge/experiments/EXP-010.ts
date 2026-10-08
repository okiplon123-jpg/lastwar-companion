import type { KnowledgeExperiment } from '../schema';

export const EXP010: KnowledgeExperiment = {
  id: 'EXP-010',
  mechanicIds: ['M-011'],
  researchQuestion:
    'What stats does the drone provide and do they appear in Squad Power display?',
  method:
    'Record Squad Power at drone lv0, combat boost 0, no chips. ' +
    'Screenshot of drone stats panel (showing ATK%, DEF%, HP% if any). ' +
    'Increase drone level by 10 levels → record Squad Power delta.',
  requiredState:
    'Drone at lv0 or known level. Ability to upgrade drone by 10 levels in a controlled way.',
  expectedOutput:
    'Confirmed whether drone stats appear in Squad Power display. ' +
    'Stat type (ATK%/DEF%/HP% or flat) per drone level increase. ' +
    'Stat per chip rarity and star milestone.',
  effort: 'MEDIUM',
  priority: 'HIGH',
  status: 'PENDING',
  blockedBy: [],
  resultEvidenceId: null,
};
