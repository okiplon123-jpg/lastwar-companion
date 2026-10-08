import type { KnowledgeEvidence } from '../schema';

export const EV006: KnowledgeEvidence = {
  id: 'EV-006',
  mechanicIds: ['M-012'],
  sourceType: 'community',
  date: 'unknown',
  gameVersion: null,
  description:
    'Wall of Honor bonus rates reported by community guides. ' +
    'Three categories of WoH heroes with different bonus rates per 50 WoH levels.',
  observedValues: {
    mainURPctPer50Levels: 0.50,
    mainURStat: 'ATK or DEF or HP (per-hero specific — not fully documented)',
    promotableSSRPctPer50Levels: 0.25,
    loadHeroPctPer50Levels: 1.00,
    loadHeroStat: 'Troop Load Capacity',
    stackingNote: 'Additive per hero across all owned WoH heroes',
  },
  verificationStatus: 'UNVERIFIED',
  notes:
    'Consistently reported across community sources. Specific hero → stat type ' +
    'mapping (which heroes give ATK vs DEF vs HP) not fully documented.',
};
