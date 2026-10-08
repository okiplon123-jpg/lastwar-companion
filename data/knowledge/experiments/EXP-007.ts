import type { KnowledgeExperiment } from '../schema';

export const EXP007: KnowledgeExperiment = {
  id: 'EXP-007',
  mechanicIds: ['M-009', 'M-016'],
  researchQuestion:
    'Does a known research bonus (e.g. +2% Tank ATK) cause a predictable Squad Power change? ' +
    'Is the % applied to troop base power or to something else?',
  method:
    'Controlled squad: N Tank troops of one tier, zero heroes, known Squad Power. ' +
    'Unlock Tank ATK I research at lv1 (+2% Tank ATK). ' +
    'Record new Squad Power. ' +
    'Delta / (N × tier_base) should equal 2% if applied to troop base power.',
  requiredState:
    'Squad with N troops of one type/tier, zero heroes. ' +
    'Research node Tank ATK I available to unlock at exactly lv1.',
  expectedOutput:
    'Confirmed whether research % is applied to troop base power or total squad power. ' +
    'Actual delta value recorded.',
  effort: 'LOW',
  priority: 'HIGH',
  status: 'PENDING',
  blockedBy: ['EXP-001'],
  resultEvidenceId: null,
};
