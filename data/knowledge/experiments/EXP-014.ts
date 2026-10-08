import type { KnowledgeExperiment } from '../schema';

export const EXP014: KnowledgeExperiment = {
  id: 'EXP-014',
  mechanicIds: ['M-016'],
  researchQuestion:
    'Do % bonuses from different sources stack additively or multiplicatively?',
  method:
    'Using research bonuses as isolated % source (research is controllable): ' +
    '- Record Squad Power at 0% Tank ATK research bonus → P0. ' +
    '- Record Squad Power at +10% Tank ATK research bonus → P1. ' +
    '- Record Squad Power at +20% Tank ATK research bonus → P2. ' +
    '- Check: is (P1 - P0) == (P2 - P1)? → linear (additive within source). ' +
    'Then add a second independent source (e.g. WoH): ' +
    '- Record Squad Power at +10% research + +10% WoH → P3. ' +
    '- If P3 - P0 = 20% × base: additive across sources. ' +
    '- If P3 - P0 > 20% × base: multiplicative across sources.',
  requiredState:
    'Ability to precisely control research node levels (can unlock one node at a time). ' +
    'A controllable WoH bonus for comparison. ' +
    'EXP-001 and EXP-007 must be completed first.',
  expectedOutput:
    'Confirmed stacking model: H1 (additive), H2 (multiplicative), or H3 (hybrid).',
  effort: 'HIGH',
  priority: 'CRITICAL',
  status: 'PENDING',
  blockedBy: ['EXP-001', 'EXP-007'],
  resultEvidenceId: null,
};
