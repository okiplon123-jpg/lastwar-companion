import type { KnowledgeExperiment } from '../schema';

export const EXP016: KnowledgeExperiment = {
  id: 'EXP-016',
  mechanicIds: ['M-018'],
  researchQuestion:
    'Do building hero stat bonuses appear in Squad Power display? ' +
    'Are the bonus values in buildings-data.json accurate?',
  method:
    'Record Squad Power before and after upgrading a building that grants hero stat bonus. ' +
    'Compare delta to the bonus value in buildings-data.json. ' +
    'Repeat for a type-specific building (e.g. Air Center) with an Aircraft hero in the squad.',
  requiredState:
    'A building with a documented hero stat bonus available to upgrade. ' +
    'Squad with the relevant hero type.',
  expectedOutput:
    'Confirmed whether building bonuses appear in Squad Power. ' +
    'Verified or corrected building bonus values from scraped data.',
  effort: 'LOW',
  priority: 'MEDIUM',
  status: 'PENDING',
  blockedBy: [],
  resultEvidenceId: null,
};
