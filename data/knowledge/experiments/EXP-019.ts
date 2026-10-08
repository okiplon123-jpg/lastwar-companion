import type { KnowledgeExperiment } from '../schema';

export const EXP019: KnowledgeExperiment = {
  id: 'EXP-019',
  mechanicIds: ['M-021'],
  researchQuestion:
    'What are the exact stat values per decoration per level? Do decorations affect Squad Power?',
  method:
    'Record hero base stats (no decoration equipped). ' +
    'Equip one UR decoration at level 1. Record stat delta. ' +
    'Upgrade decoration to level 3 (when % bonuses appear per community). ' +
    'Record stat delta at level 3.',
  requiredState:
    'One UR decoration available to equip and upgrade to level 3. ' +
    'Hero at known base state (M-003 resolved).',
  expectedOutput:
    'Flat stat value at decoration lv1 and lv3. ' +
    'Whether % bonuses appear in power display. ' +
    'Starting point for building decoration stat table.',
  effort: 'LOW',
  priority: 'MEDIUM',
  status: 'PENDING',
  blockedBy: [],
  resultEvidenceId: null,
};
