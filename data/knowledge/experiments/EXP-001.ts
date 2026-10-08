import type { KnowledgeExperiment } from '../schema';

export const EXP001: KnowledgeExperiment = {
  id: 'EXP-001',
  mechanicIds: ['M-001', 'M-002'],
  researchQuestion:
    'What is the mathematical structure of the Squad Power formula? ' +
    'Is power = troops only? troops + hero? troops × modifier? Something else?',
  method:
    'Step 1: Squad with exactly 1000 T5 Tanks, zero heroes, zero research bonuses. ' +
    'Record Squad Power. Expected if base-only: 1000 × 200 = 200,000. Record actual. ' +
    'Step 2: Change count to 2000 T5 Tanks. Record power. If power doubles → count is linear. ' +
    'Step 3: Add one hero (lv1, 1★, no gear) to the squad. Record delta. ' +
    'This is the hero\'s power contribution at minimum state. ' +
    'Step 4: Add exactly 1 research node at lv1 (e.g. Tank ATK I = +2% Tank ATK). ' +
    'Record power delta. ' +
    'Compare observed values at each step to possible formula hypotheses. ' +
    'A confirmed hypothesis eliminates all others.',
  requiredState:
    'A squad where every variable is controlled: ' +
    'exactly N troops of one type/tier, zero heroes, zero or known research bonuses. ' +
    'Access to the ability to isolate exactly one research node.',
  expectedOutput:
    'Formula type confirmed: additive/multiplicative, hero contribution model. ' +
    'Actual Squad Power values at each step recorded.',
  effort: 'MEDIUM',
  priority: 'CRITICAL',
  status: 'PENDING',
  blockedBy: [],
  resultEvidenceId: null,
};
