import type { KnowledgeExperiment } from '../schema';

export const EXP018: KnowledgeExperiment = {
  id: 'EXP-018',
  mechanicIds: ['M-019'],
  researchQuestion:
    'Do profession bonuses appear in Squad Power display? ' +
    'What are the exact trigger conditions for each profession?',
  method:
    'Check if Squad Power changes when the account is in a profession-triggered state ' +
    '(e.g. own city is under attack for Homeland Defender). ' +
    'Compare Squad Power in-trigger vs out-of-trigger.',
  requiredState:
    'Ability to enter a profession-triggering state (e.g. arrange an incoming attack from an ally).',
  expectedOutput:
    'Confirmed whether profession bonuses affect Squad Power display (expected: NO). ' +
    'Verified trigger conditions.',
  effort: 'MEDIUM',
  priority: 'LOW',
  status: 'PENDING',
  blockedBy: [],
  resultEvidenceId: null,
};
