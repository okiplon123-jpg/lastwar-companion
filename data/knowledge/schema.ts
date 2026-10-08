// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE DATABASE SCHEMA
// Single source of truth for all game mechanics, evidence, and experiments.
//
// METHODOLOGY
// VERIFIED        = Confirmed by personal in-game test with screenshot/video.
// PARTIALLY_KNOWN = Consistent across multiple community sources but not
//                   personally confirmed by direct test.
// UNKNOWN         = No reliable information exists.
//
// RULE: No formula, coefficient, or mechanic description may be marked
// VERIFIED without a corresponding Evidence ID in the Evidence Database.
// Community guides alone = PARTIALLY_KNOWN at most.
// ─────────────────────────────────────────────────────────────────────────────

export type KnowledgeStatus = 'VERIFIED' | 'PARTIALLY_KNOWN' | 'UNKNOWN';

export type GameDomain = 'combat' | 'economy' | 'progression' | 'alliance' | 'resource';

export type GameSystem =
  | 'power_formula'
  | 'troops'
  | 'hero_base'
  | 'hero_level'
  | 'hero_stars'
  | 'hero_gear'
  | 'hero_skills'
  | 'exclusive_weapon'
  | 'wall_of_honor'
  | 'squad_composition'
  | 'drone'
  | 'stacking_order'
  | 'vs_tech'
  | 'research_bonuses'
  | 'alliance_tech'
  | 'buildings_combat'
  | 'decorations'
  | 'commander'
  | 'profession'
  | 'type_counter'
  | 'construction'
  | 'research_speed'
  | 'training'
  | 'healing'
  | 'vip_economy'
  | 'vip_combat'
  | 'resource_production';

export interface EffectDescription {
  /** Stat affected: e.g. "ATK", "DEF", "HP", "troop_ATK", "hero_ATK", etc. */
  stat: string;
  valueType: 'pct' | 'flat' | 'multiplier' | 'gate' | 'unknown';
  /** null when UNKNOWN */
  value: number | null;
  /** Human-readable condition string, e.g. "always" or "when defending own city" */
  condition: string;
  stacking: 'additive' | 'multiplicative' | 'unknown';
  status: KnowledgeStatus;
  /** Evidence IDs supporting this specific effect */
  evidenceIds: string[];
}

export interface KnowledgeMechanic {
  id: string;                    // "M-001"
  name: string;
  domain: GameDomain;
  system: GameSystem;
  /** Plain-language description of what this mechanic is */
  whatItIs: string;
  /** Effects this mechanic provides */
  whatItGives: EffectDescription[];
  /** IDs of other mechanics that modify this one */
  modifiedBy: string[];
  /** Stat IDs or mechanic IDs that this mechanic modifies or feeds into */
  modifies: string[];
  /** Condition under which this mechanic is active */
  whenActive: string;
  /** How this mechanic stacks with other modifiers */
  stackingRule: string;
  /** Hard limits or caps, null if none or unknown */
  limits: string | null;
  isConditional: boolean;
  /** Other systems that depend on this mechanic being known */
  dependentSystems: string[];
  status: KnowledgeStatus;
  /** Evidence IDs that verify this mechanic */
  verifiedBy: string[];
  /** Evidence IDs with partial information */
  partialEvidence: string[];
  /** Experiment IDs that will resolve unknowns in this mechanic */
  blockingExperiments: string[];
  /** The specific question that needs to be answered to resolve this mechanic */
  researchQuestion: string;
  /** Engine modules that will read this mechanic's values once known */
  affectsEngine: string[];
  /** User-facing features that depend on this mechanic being known */
  affectsFeatures: string[];
  estimatedImpact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  /** If true, the engine cannot produce correct output without this mechanic */
  blocksImplementation: boolean;
  /** All known numeric values. null means the entire values object is UNKNOWN.
   *  Individual keys with null values mean that specific value is UNKNOWN. */
  values: Record<string, unknown> | null;
  /** Free-form notes, open questions, hypotheses */
  notes: string[];
}

export interface KnowledgeEvidence {
  id: string;               // "EV-001"
  /** Mechanics this evidence informs */
  mechanicIds: string[];
  sourceType: 'personal_test' | 'community' | 'datamine' | 'scrape' | 'observation';
  /** ISO date string or "unknown" */
  date: string;
  gameVersion: string | null;
  /** What was observed */
  description: string;
  /** Exact numeric or categorical values extracted from the observation */
  observedValues: Record<string, unknown>;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED';
  notes: string;
}

export interface KnowledgeExperiment {
  id: string;               // "EXP-001"
  /** Mechanics this experiment will resolve */
  mechanicIds: string[];
  researchQuestion: string;
  /** Step-by-step method for running the experiment */
  method: string;
  /** What state the game/account must be in to run this experiment */
  requiredState: string;
  /** What data will be produced on completion */
  expectedOutput: string;
  effort: 'TRIVIAL' | 'LOW' | 'MEDIUM' | 'HIGH';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  /** Experiment IDs that must be completed before this one can run */
  blockedBy: string[];
  /** Evidence ID produced when this experiment is completed, null while PENDING */
  resultEvidenceId: string | null;
}
