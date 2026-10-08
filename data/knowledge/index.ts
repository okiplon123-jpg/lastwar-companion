// ─────────────────────────────────────────────────────────────────────────────
// KNOWLEDGE DATABASE — INDEX
// This file is the single source of truth for all reverse-engineered game
// mechanics, evidence, and experiments.
//
// USAGE:
//   import { ALL_MECHANICS, ALL_EVIDENCE, ALL_EXPERIMENTS } from '@/data/knowledge';
//
// RULE: The engine reads from this database. When a mechanic is discovered,
// only the mechanic file changes — no engine code changes needed.
// ─────────────────────────────────────────────────────────────────────────────

export type {
  KnowledgeStatus,
  GameDomain,
  GameSystem,
  EffectDescription,
  KnowledgeMechanic,
  KnowledgeEvidence,
  KnowledgeExperiment,
} from './schema';

// ── Mechanics ─────────────────────────────────────────────────────────────────
import { M001 } from './mechanics/M-001';
import { M002 } from './mechanics/M-002';
import { M003 } from './mechanics/M-003';
import { M004 } from './mechanics/M-004';
import { M005 } from './mechanics/M-005';
import { M006 } from './mechanics/M-006';
import { M007 } from './mechanics/M-007';
import { M008 } from './mechanics/M-008';
import { M009 } from './mechanics/M-009';
import { M010 } from './mechanics/M-010';
import { M011 } from './mechanics/M-011';
import { M012 } from './mechanics/M-012';
import { M013 } from './mechanics/M-013';
import { M014 } from './mechanics/M-014';
import { M015 } from './mechanics/M-015';
import { M016 } from './mechanics/M-016';
import { M017 } from './mechanics/M-017';
import { M018 } from './mechanics/M-018';
import { M019 } from './mechanics/M-019';
import { M020 } from './mechanics/M-020';
import { M021 } from './mechanics/M-021';
import { M022 } from './mechanics/M-022';

import type { KnowledgeMechanic } from './schema';

export const ALL_MECHANICS: KnowledgeMechanic[] = [
  M001, M002, M003, M004, M005, M006, M007, M008, M009, M010,
  M011, M012, M013, M014, M015, M016, M017, M018, M019, M020,
  M021, M022,
];

// ── Evidence ──────────────────────────────────────────────────────────────────
import { EV001 } from './evidence/EV-001';
import { EV002 } from './evidence/EV-002';
import { EV003 } from './evidence/EV-003';
import { EV004 } from './evidence/EV-004';
import { EV005 } from './evidence/EV-005';
import { EV006 } from './evidence/EV-006';
import { EV007 } from './evidence/EV-007';
import { EV008 } from './evidence/EV-008';
import { EV009 } from './evidence/EV-009';
import { EV010 } from './evidence/EV-010';
import { EV011 } from './evidence/EV-011';
import { EV012 } from './evidence/EV-012';

import type { KnowledgeEvidence } from './schema';

export const ALL_EVIDENCE: KnowledgeEvidence[] = [
  EV001, EV002, EV003, EV004, EV005, EV006,
  EV007, EV008, EV009, EV010, EV011, EV012,
];

// ── Experiments ───────────────────────────────────────────────────────────────
import { EXP001 } from './experiments/EXP-001';
import { EXP002 } from './experiments/EXP-002';
import { EXP003 } from './experiments/EXP-003';
import { EXP004 } from './experiments/EXP-004';
import { EXP005 } from './experiments/EXP-005';
import { EXP006 } from './experiments/EXP-006';
import { EXP007 } from './experiments/EXP-007';
import { EXP008 } from './experiments/EXP-008';
import { EXP009 } from './experiments/EXP-009';
import { EXP010 } from './experiments/EXP-010';
import { EXP011 } from './experiments/EXP-011';
import { EXP012 } from './experiments/EXP-012';
import { EXP013 } from './experiments/EXP-013';
import { EXP014 } from './experiments/EXP-014';
import { EXP015 } from './experiments/EXP-015';
import { EXP016 } from './experiments/EXP-016';
import { EXP017 } from './experiments/EXP-017';
import { EXP018 } from './experiments/EXP-018';
import { EXP019 } from './experiments/EXP-019';
import { EXP020 } from './experiments/EXP-020';

import type { KnowledgeExperiment } from './schema';

export const ALL_EXPERIMENTS: KnowledgeExperiment[] = [
  EXP001, EXP002, EXP003, EXP004, EXP005, EXP006, EXP007, EXP008,
  EXP009, EXP010, EXP011, EXP012, EXP013, EXP014, EXP015, EXP016,
  EXP017, EXP018, EXP019, EXP020,
];

// ── Convenience queries ───────────────────────────────────────────────────────

/** All mechanics with blocksImplementation = true */
export const BLOCKING_MECHANICS = ALL_MECHANICS.filter(m => m.blocksImplementation);

/** All experiments with status PENDING that have no unresolved blockers */
export const READY_EXPERIMENTS = ALL_EXPERIMENTS.filter(
  exp => exp.status === 'PENDING' && exp.blockedBy.length === 0,
);

/** All mechanics by status */
export const MECHANICS_BY_STATUS = {
  VERIFIED: ALL_MECHANICS.filter(m => m.status === 'VERIFIED'),
  PARTIALLY_KNOWN: ALL_MECHANICS.filter(m => m.status === 'PARTIALLY_KNOWN'),
  UNKNOWN: ALL_MECHANICS.filter(m => m.status === 'UNKNOWN'),
};

/** Summary counts */
export const KNOWLEDGE_SUMMARY = {
  mechanics: {
    total: ALL_MECHANICS.length,
    VERIFIED: MECHANICS_BY_STATUS.VERIFIED.length,
    PARTIALLY_KNOWN: MECHANICS_BY_STATUS.PARTIALLY_KNOWN.length,
    UNKNOWN: MECHANICS_BY_STATUS.UNKNOWN.length,
  },
  evidence: {
    total: ALL_EVIDENCE.length,
    VERIFIED: ALL_EVIDENCE.filter(e => e.verificationStatus === 'VERIFIED').length,
    UNVERIFIED: ALL_EVIDENCE.filter(e => e.verificationStatus === 'UNVERIFIED').length,
  },
  experiments: {
    total: ALL_EXPERIMENTS.length,
    PENDING: ALL_EXPERIMENTS.filter(e => e.status === 'PENDING').length,
    IN_PROGRESS: ALL_EXPERIMENTS.filter(e => e.status === 'IN_PROGRESS').length,
    COMPLETED: ALL_EXPERIMENTS.filter(e => e.status === 'COMPLETED').length,
    BLOCKED: ALL_EXPERIMENTS.filter(e => e.status === 'BLOCKED').length,
  },
};
