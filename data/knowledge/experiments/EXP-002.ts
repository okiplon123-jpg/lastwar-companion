import type { KnowledgeExperiment } from '../schema';

export const EXP002: KnowledgeExperiment = {
  id: 'EXP-002',
  mechanicIds: ['M-003'],
  researchQuestion:
    'What are the base ATK, DEF, HP of multiple heroes at level 1, 1★, ' +
    'with no gear, no EW, no decorations?',
  method:
    'For each hero: ensure lv1, 1★, no gear, EW=0, WoH=0, no decorations. ' +
    'Record ATK, DEF, HP from hero detail screen. ' +
    'Screenshot each hero\'s stat screen. Record exact integers. ' +
    'Note: the game may display rounded values. Record all visible digits.',
  requiredState:
    'Minimum hero set: 1 UR Tank hero, 1 UR Aircraft hero, 1 UR Missile hero, ' +
    '1 SSR hero (any type), 1 SR hero if available. ' +
    'All heroes at lv1, 1★ with zero gear equipped.',
  expectedOutput:
    'Base stat table per rarity/type. ' +
    'Determines: are UR base stats identical across all UR heroes?',
  effort: 'LOW',
  priority: 'CRITICAL',
  status: 'PENDING',
  blockedBy: [],
  resultEvidenceId: null,
};
