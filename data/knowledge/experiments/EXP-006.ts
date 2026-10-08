import type { KnowledgeExperiment } from '../schema';

export const EXP006: KnowledgeExperiment = {
  id: 'EXP-006',
  mechanicIds: ['M-007'],
  researchQuestion:
    'What is the gear stat lookup table: quality × level → stat delta?',
  method:
    'Use whichever slot was confirmed as ATK from EXP-005 (e.g. Cannon). ' +
    'Equip each piece, record delta vs no-gear baseline: ' +
    '- Common lv1 → ATK delta. ' +
    '- Common lv10 → ATK delta. ' +
    '- Common lv20 → ATK delta. ' +
    '- Common lv40 → ATK delta. ' +
    '- Rare lv1 → ATK delta (to establish quality ratio). ' +
    '- Legendary lv1 → ATK delta (upper bound). ' +
    'Plot level vs stat to identify growth curve type. ' +
    'Compute quality ratios from lv1 values.',
  requiredState:
    'Common gear pieces at levels 1, 10, 20, 40 for the confirmed ATK slot. ' +
    'Rare lv1 and Legendary lv1 pieces for the same slot.',
  expectedOutput:
    'Growth curve type (linear/stepped/other) + quality ratios at lv1.',
  effort: 'MEDIUM',
  priority: 'HIGH',
  status: 'PENDING',
  blockedBy: ['EXP-005'],
  resultEvidenceId: null,
};
