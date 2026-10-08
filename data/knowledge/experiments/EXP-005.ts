import type { KnowledgeExperiment } from '../schema';

export const EXP005: KnowledgeExperiment = {
  id: 'EXP-005',
  mechanicIds: ['M-006'],
  researchQuestion:
    'Which stat (ATK/DEF/HP/other) does each of the 4 gear slots (Cannon, Chip, Armor, Radar) provide?',
  method:
    'Baseline: hero with zero gear → record ATK, DEF, HP. ' +
    'Test 1: equip ONLY Common Cannon lv1 → record ATK, DEF, HP delta. ' +
    'Test 2: equip ONLY Common Chip lv1 → record ATK, DEF, HP delta. ' +
    'Test 3: equip ONLY Common Armor lv1 → record ATK, DEF, HP delta. ' +
    'Test 4: equip ONLY Common Radar lv1 → record ATK, DEF, HP delta. ' +
    'Each test: equip one piece, compare all three stats. ' +
    'The stat that changes identifies the slot\'s primary contribution. ' +
    'Check if multiple stats change in a single test.',
  requiredState:
    'Hero with known baseline stats (zero gear). ' +
    'One Common lv1 piece for each slot: Cannon, Chip, Armor, Radar.',
  expectedOutput:
    'Mapping: { Cannon: "stat", Chip: "stat", Armor: "stat", Radar: "stat" }',
  effort: 'LOW',
  priority: 'HIGH',
  status: 'PENDING',
  blockedBy: ['EXP-002'],
  resultEvidenceId: null,
};
