import type { KnowledgeMechanic } from '../schema';

export const M001: KnowledgeMechanic = {
  id: 'M-001',
  name: 'Squad Power Formula',
  domain: 'combat',
  system: 'power_formula',
  whatItIs:
    'The mathematical formula the game uses to combine troop contributions, ' +
    'hero stat contributions, and percentage modifiers into the single integer ' +
    'displayed as "Squad Power."',
  whatItGives: [
    {
      stat: 'squad_power_display',
      valueType: 'unknown',
      value: null,
      condition: 'always',
      stacking: 'unknown',
      status: 'UNKNOWN',
      evidenceIds: [],
    },
  ],
  modifiedBy: [
    'M-002', // troop base power feeds in
    'M-003', // hero base stats feed in
    'M-009', // research % bonuses
    'M-010', // EW bonuses
    'M-011', // drone stats
    'M-012', // WoH bonuses
    'M-013', // composition bonus
    'M-014', // VS tech multiplier
    'M-015', // alliance tech
    'M-016', // stacking order
    'M-017', // VIP combat
    'M-018', // buildings hero bonus
    'M-021', // decorations
  ],
  modifies: ['account_power', 'vs_points'],
  whenActive: 'always — squad power is always displayed',
  stackingRule: 'UNKNOWN — the formula itself is the stacking model',
  limits: null,
  isConditional: false,
  dependentSystems: [
    'M-002', 'M-003', 'M-004', 'M-005', 'M-006', 'M-007', 'M-008',
    'M-009', 'M-010', 'M-011', 'M-012', 'M-013', 'M-014', 'M-015',
    'M-016', 'M-017', 'M-018', 'M-021', 'M-022',
  ],
  status: 'UNKNOWN',
  verifiedBy: [],
  partialEvidence: [],
  blockingExperiments: ['EXP-001'],
  researchQuestion:
    'What is the mathematical formula that combines troop power, hero stats, ' +
    'and % modifiers into the Squad Power integer? Are components summed or combined differently?',
  affectsEngine: ['engine/power/squad-power.ts'],
  affectsFeatures: ['Squad Power display', 'Account Power', 'VS Points', 'AI Advisor', 'Upgrade Planner'],
  estimatedImpact: 'CRITICAL',
  blocksImplementation: true,
  values: null,
  notes: [
    'The game displays a single Squad Power integer per squad.',
    'The number changes when troops, heroes, or bonuses change.',
    'No formula has been confirmed.',
    'OPEN Q1: Is squad power = f(troops) + g(heroes) or f(troops + hero contribution)?',
    'OPEN Q2: Do modifiers apply before or after combining troop and hero values?',
    'OPEN Q3: Is there a floor or cap on the formula output?',
    'Until EXP-001 is completed, no other mechanic can be integrated into an output value.',
    'This is the single highest-priority unknown.',
  ],
};
