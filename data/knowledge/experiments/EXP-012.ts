import type { KnowledgeExperiment } from '../schema';

export const EXP012: KnowledgeExperiment = {
  id: 'EXP-012',
  mechanicIds: ['M-017'],
  researchQuestion:
    'What is the full VIP level combat bonus table for levels 1–18?',
  method:
    'Single screenshot of the in-game VIP benefits panel showing all bonuses ' +
    'at each VIP level 1–18.',
  requiredState:
    'Access to the in-game VIP benefits/rewards panel (should be viewable without reaching the level).',
  expectedOutput:
    'Complete VIP combat bonus table lv1–18 with exact % values per stat per level.',
  effort: 'TRIVIAL',
  priority: 'MEDIUM',
  status: 'PENDING',
  blockedBy: [],
  resultEvidenceId: null,
};
