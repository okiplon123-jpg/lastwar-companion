"use client";

import { useState, useEffect } from "react";
import {
  getCurrentArmsRacePhase,
  ARMS_RACE_PHASES,
  SPEEDUP_ITEMS,
  ArmsRacePhase,
} from "@/lib/gameData";
import Countdown from "@/components/Countdown";

// ---- Weekly schedule: day ranges for each phase ----
const PHASE_SCHEDULE = [
  { phase: 1, dayRange: "Mon 07:00 – Tue 07:00 UTC" },
  { phase: 2, dayRange: "Tue 07:00 – Wed 07:00 UTC" },
  { phase: 3, dayRange: "Wed 07:00 – Thu 07:00 UTC" },
  { phase: 4, dayRange: "Thu 07:00 – Fri 07:00 UTC" },
  { phase: 5, dayRange: "Fri 07:00 – Sat 07:00 UTC" },
  { phase: 6, dayRange: "Sat 07:00 – Sun 07:00 UTC" },
  { phase: 0, dayRange: "Sun 07:00 – Mon 07:00 UTC" },
];

// ---- Points calculator ----
function PointsCalculator({ currentPhase }: { currentPhase: ArmsRacePhase | null }) {
  const [quantities, setQuantities] = useState<number[]>(SPEEDUP_ITEMS.map(() => 0));

  const totalMinutes = SPEEDUP_ITEMS.reduce(
    (sum, item, i) => sum + item.minutes * (quantities[i] || 0),
    0
  );

  const ptsPerMin = currentPhase?.pointsPerMinute ?? 10;
  const multiplier = currentPhase?.bonusMultiplier ?? 1;
  const totalARPoints = totalMinutes * ptsPerMin * multiplier;

  const hoursStr = Math.floor(totalMinutes / 60);
  const minsStr = totalMinutes % 60;

  function setQty(i: number, val: string) {
    const n = Math.max(0, parseInt(val) || 0);
    setQuantities((prev) => {
      const next = [...prev];
      next[i] = n;
      return next;
    });
  }

  function reset() {
    setQuantities(SPEEDUP_ITEMS.map(() => 0));
  }

  const isDevPhase = currentPhase && currentPhase.pointsPerMinute > 0;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 24,
        marginBottom: 24,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "var(--text-dim)",
            textTransform: "uppercase",
            marginBottom: 4,
            fontFamily: "monospace",
          }}
        >
          / Points Calculator
        </div>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          Enter how many of each speedup item you have. Calculates Arms Race points for construction/research speedups.
        </p>
      </div>

      {!isDevPhase && currentPhase && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 6,
            padding: "10px 14px",
            marginBottom: 16,
            fontSize: "0.8rem",
            color: "var(--red)",
          }}
        >
          ⚠️ Current phase ({currentPhase.name}) gives 0 pts for construction/research speedups. Switch to a Dev/Force/Decisive phase to earn points.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {SPEEDUP_ITEMS.map((item, i) => (
          <div key={item.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label
              style={{
                fontSize: "0.72rem",
                color: "var(--text-secondary)",
                fontWeight: 500,
              }}
            >
              {item.name} speedup
              <span style={{ color: "var(--text-dim)", marginLeft: 4 }}>
                ({item.arPoints.toLocaleString("en-US")} pts)
              </span>
            </label>
            <input
              type="number"
              min={0}
              value={quantities[i] === 0 ? "" : quantities[i]}
              onChange={(e) => setQty(i, e.target.value)}
              placeholder="0"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 5,
                padding: "6px 10px",
                color: "var(--text-primary)",
                fontFamily: "monospace",
                fontSize: "0.9rem",
                width: "100%",
                outline: "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* Totals */}
      <div
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>
            TOTAL SPEEDUP TIME
          </div>
          <div style={{ fontSize: "1.5rem", fontFamily: "monospace", color: "var(--text-primary)", fontWeight: 700 }}>
            {hoursStr}h {minsStr.toString().padStart(2, "0")}m
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
            {totalMinutes.toLocaleString("en-US")} minutes
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>
            ARMS RACE POINTS
          </div>
          <div
            style={{
              fontSize: "1.5rem",
              fontFamily: "monospace",
              color: isDevPhase ? "var(--gold)" : "var(--text-dim)",
              fontWeight: 700,
            }}
          >
            {totalARPoints.toLocaleString("en-US")}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
            {ptsPerMin} pts/min{multiplier > 1 ? ` × ${multiplier} bonus` : ""}
          </div>
        </div>
        <button
          onClick={reset}
          style={{
            marginLeft: "auto",
            padding: "8px 16px",
            background: "var(--surface-3)",
            border: "1px solid var(--border)",
            borderRadius: 5,
            color: "var(--text-secondary)",
            fontSize: "0.8rem",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// ---- What to do NOW panel ----
function WhatToDoNow({ arState }: { arState: ReturnType<typeof getCurrentArmsRacePhase> }) {
  const phase = arState.phase ? ARMS_RACE_PHASES[arState.phase - 1] : null;

  const content = arState.isRest
    ? {
        title: "Rest Period",
        color: "var(--text-secondary)",
        icon: "💤",
        tips: [
          "Stock up on speedup items from alliance shop and events",
          "Plan your troop training queue for next Arms Race",
          "Coordinate with alliance on Phase 5 & 6 combat strategy",
          "Review chest thresholds and set VS Day targets",
          "Save your combat boosts for Phase 3 and Phase 5",
        ],
      }
    : phase?.pointsPerMinute === 0
    ? {
        title: `${phase.name} — Hold Your Speedups`,
        color: phase.color,
        icon: "🛡️",
        tips: [
          "Do NOT use construction or research speedups — 0 pts right now",
          "Focus on zombie kills for Arms Race points",
          "Coordinate alliance rallies on enemy buildings",
          "Gather resources from the map",
          "Use combat boosts now — they won't help in dev phases",
        ],
      }
    : {
        title: `${phase?.name ?? "Dev Phase"} — Burn Speedups Now`,
        color: phase?.color ?? "var(--gold)",
        icon: phase?.bonusMultiplier ? "🔥" : "⚡",
        tips: phase?.topActions ?? [],
      };

  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid var(--border)`,
        borderLeft: `3px solid ${content.color}`,
        borderRadius: 8,
        padding: 24,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "var(--text-dim)",
          textTransform: "uppercase",
          marginBottom: 12,
          fontFamily: "monospace",
        }}
      >
        / What To Do NOW
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: "1.4rem" }}>{content.icon}</span>
        <span style={{ fontWeight: 700, fontSize: "1rem", color: content.color }}>
          {content.title}
        </span>
      </div>
      <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
        {content.tips.map((tip) => (
          <li
            key={tip}
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              lineHeight: 1.7,
            }}
          >
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---- Phase card ----
function PhaseCard({
  phase,
  isActive,
  isCurrent,
}: {
  phase: ArmsRacePhase;
  isActive: boolean;
  isCurrent: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${isCurrent ? phase.color : "var(--border)"}`,
        borderTop: `3px solid ${phase.color}`,
        borderRadius: 8,
        padding: 18,
        opacity: isActive ? 1 : 0.7,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isCurrent && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: phase.color,
            background: `${phase.color}22`,
            border: `1px solid ${phase.color}44`,
            borderRadius: 3,
            padding: "2px 6px",
            fontFamily: "monospace",
          }}
        >
          ACTIVE
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: phase.color,
            marginTop: 3,
            flexShrink: 0,
            boxShadow: isCurrent ? `0 0 6px ${phase.color}` : undefined,
          }}
        />
        <div>
          <div style={{ fontWeight: 700, color: phase.color, fontSize: "0.85rem" }}>
            Phase {phase.id}
          </div>
          <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
            {phase.name}
          </div>
        </div>
      </div>
      <p style={{ margin: "0 0 12px", fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {phase.description}
      </p>
      <ul style={{ margin: 0, padding: "0 0 0 14px" }}>
        {phase.topActions.map((action) => (
          <li key={action} style={{ fontSize: "0.73rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            {action}
          </li>
        ))}
      </ul>
      {phase.pointsPerMinute > 0 && (
        <div
          style={{
            marginTop: 10,
            fontSize: "0.68rem",
            fontWeight: 700,
            color: "var(--gold)",
            fontFamily: "monospace",
          }}
        >
          {phase.pointsPerMinute} pts/min speedups
          {phase.bonusMultiplier ? ` × ${phase.bonusMultiplier} BONUS` : ""}
        </div>
      )}
    </div>
  );
}

export default function ArmsRacePage() {
  const [arState, setArState] = useState(getCurrentArmsRacePhase);

  useEffect(() => {
    const id = setInterval(() => setArState(getCurrentArmsRacePhase()), 30_000);
    return () => clearInterval(id);
  }, []);

  const currentPhaseData = arState.phase ? ARMS_RACE_PHASES[arState.phase - 1] : null;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "var(--gold)",
            fontFamily: "monospace",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          / Arms Race
        </div>
        <h1 style={{ margin: "0 0 6px", fontSize: "1.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Arms Race Dashboard
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Weekly cycle — Mon 07:00 UTC to Sun 07:00 UTC. 6 phases × 24h each.
        </p>
      </div>

      {/* Live Phase Timer */}
      <div
        style={{
          background: "var(--surface)",
          border: `1px solid var(--border)`,
          borderTop: `4px solid ${currentPhaseData?.color ?? "var(--border)"}`,
          borderRadius: 8,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "var(--text-dim)",
            textTransform: "uppercase",
            marginBottom: 16,
            fontFamily: "monospace",
          }}
        >
          / Live Phase Timer
        </div>

        {arState.isRest ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: "1.8rem" }}>😴</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--text-secondary)" }}>
                  Rest Period
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)" }}>
                  Arms Race resets Monday 07:00 UTC
                </div>
              </div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 4, fontFamily: "monospace" }}>
              NEW CYCLE STARTS IN
            </div>
            <div style={{ fontSize: "3rem", fontFamily: "monospace", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "0.04em" }}>
              <Countdown target={arState.nextPhaseStartUTC} />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 32, alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: currentPhaseData?.color,
                    boxShadow: `0 0 12px ${currentPhaseData?.color}`,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.3rem", color: currentPhaseData?.color }}>
                    Phase {arState.phase} — {arState.phaseName}
                  </div>
                  {currentPhaseData?.bonusMultiplier && (
                    <div style={{ fontSize: "0.75rem", color: "var(--gold)", fontWeight: 700, fontFamily: "monospace" }}>
                      🔥 BONUS MULTIPLIER ×{currentPhaseData.bonusMultiplier} — everything counts double
                    </div>
                  )}
                </div>
              </div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 6 }}>
                TIME REMAINING IN PHASE
              </div>
              <div
                style={{
                  fontSize: "3.5rem",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                <Countdown target={arState.phaseEndUTC} />
              </div>
            </div>
            <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 32 }}>
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 6 }}>
                POINTS PER MINUTE (SPEEDUPS)
              </div>
              <div
                style={{
                  fontSize: "2rem",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  color: currentPhaseData?.pointsPerMinute === 0 ? "var(--red)" : "var(--gold)",
                }}
              >
                {currentPhaseData?.pointsPerMinute === 0
                  ? "0"
                  : `${(currentPhaseData?.pointsPerMinute ?? 10) * (currentPhaseData?.bonusMultiplier ?? 1)}`}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginTop: 2 }}>
                {currentPhaseData?.pointsPerMinute === 0
                  ? "Combat phase — speedups don't score"
                  : "pts per minute of construction/research"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* What To Do Now */}
      <WhatToDoNow arState={arState} />

      {/* Points Calculator */}
      <PointsCalculator currentPhase={currentPhaseData} />

      {/* Weekly Schedule Table */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 24,
          marginBottom: 24,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "var(--text-dim)",
            textTransform: "uppercase",
            marginBottom: 16,
            fontFamily: "monospace",
          }}
        >
          / Weekly Schedule
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--text-dim)", fontWeight: 600, width: 80 }}>Phase</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--text-dim)", fontWeight: 600 }}>Name</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--text-dim)", fontWeight: 600 }}>Schedule (UTC)</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--text-dim)", fontWeight: 600 }}>Pts/Min</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--text-dim)", fontWeight: 600 }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {PHASE_SCHEDULE.map(({ phase, dayRange }) => {
              const phaseData = phase > 0 ? ARMS_RACE_PHASES[phase - 1] : null;
              const isCurrent = arState.phase === phase || (phase === 0 && arState.isRest);
              return (
                <tr
                  key={phase}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: isCurrent ? `${phaseData?.color ?? "var(--gold)"}11` : "transparent",
                  }}
                >
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: phaseData?.color ?? "var(--text-dim)",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: phaseData?.color ?? "var(--text-dim)", fontWeight: 700, fontFamily: "monospace" }}>
                        {phase === 0 ? "—" : `P${phase}`}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ color: isCurrent ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: isCurrent ? 600 : 400 }}>
                      {phase === 0 ? "Rest Period" : phaseData?.name}
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: "0.58rem",
                          fontWeight: 700,
                          color: phaseData?.color ?? "var(--gold)",
                          background: `${phaseData?.color ?? "var(--gold)"}22`,
                          border: `1px solid ${phaseData?.color ?? "var(--gold)"}44`,
                          borderRadius: 3,
                          padding: "1px 5px",
                          fontFamily: "monospace",
                          verticalAlign: "middle",
                        }}
                      >
                        NOW
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--text-secondary)", fontFamily: "monospace", fontSize: "0.78rem" }}>
                    {dayRange}
                  </td>
                  <td style={{ padding: "10px 12px", fontFamily: "monospace", fontWeight: 700 }}>
                    <span
                      style={{
                        color:
                          phase === 0
                            ? "var(--text-dim)"
                            : phaseData?.pointsPerMinute === 0
                            ? "var(--red)"
                            : "var(--gold)",
                      }}
                    >
                      {phase === 0 ? "—" : phaseData?.pointsPerMinute === 0 ? "0" : phaseData?.pointsPerMinute}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                    {phase === 0
                      ? "Rest"
                      : phaseData?.pointsPerMinute === 0
                      ? "⚔️ Combat"
                      : phaseData?.bonusMultiplier
                      ? "🔥 Dev + Bonus"
                      : "⚡ Dev"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* All Phase Cards */}
      <div>
        <div
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            color: "var(--text-dim)",
            textTransform: "uppercase",
            marginBottom: 16,
            fontFamily: "monospace",
          }}
        >
          / All Phases
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {ARMS_RACE_PHASES.map((phase) => (
            <PhaseCard
              key={phase.id}
              phase={phase}
              isActive={true}
              isCurrent={arState.phase === phase.id}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
