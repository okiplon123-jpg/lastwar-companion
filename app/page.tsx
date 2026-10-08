"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getCurrentArmsRacePhase,
  getCurrentVsDay,
  ARMS_RACE_PHASES,
  VS_DAY_THEMES,
} from "@/lib/gameData";
import Countdown from "@/components/Countdown";

// ---- Nav cards to all tools ----
const TOOL_CARDS = [
  {
    href: "/arms-race",
    icon: "🏆",
    title: "Arms Race",
    desc: "Live phase timer, weekly schedule, points calculator",
    color: "#F59E0B",
  },
  {
    href: "/vs-day",
    icon: "⚔️",
    title: "VS Day",
    desc: "Daily theme, chest tracker, tech multipliers, estimator",
    color: "#EC4899",
  },
  {
    href: "/training",
    icon: "🪖",
    title: "Training Planner",
    desc: "VS Day D5 points calculator — speedup inventory, troops trained, tier efficiency",
    color: "#8B5CF6",
  },
  {
    href: "/buildings",
    icon: "🏗️",
    title: "Buildings",
    desc: "Upgrade tracker and construction priority guide",
    color: "#10B981",
  },
  {
    href: "/research",
    icon: "🔬",
    title: "Research",
    desc: "Wizualne drzewka badań — 19 drzewek, 402 nody, ikony 1:1 z gry",
    color: "#06B6D4",
  },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function MiniCalendar() {
  const arPhase = getCurrentArmsRacePhase();
  const vsDay = getCurrentVsDay();
  const todayUTC = new Date().getUTCDay();

  const arDayToPhase: Record<number, number | null> = {
    0: null, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6,
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.72rem" }}>
        <thead>
          <tr>
            {DAY_NAMES.map((d, i) => (
              <th
                key={d}
                style={{
                  padding: "4px 4px",
                  color: i === todayUTC ? "var(--gold)" : "var(--text-dim)",
                  fontWeight: i === todayUTC ? 700 : 400,
                  textAlign: "center",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Arms Race row */}
          <tr>
            {DAY_NAMES.map((_, i) => {
              const phaseIdx = arDayToPhase[i];
              const phase = phaseIdx ? ARMS_RACE_PHASES[phaseIdx - 1] : null;
              const isCurrentPhase = arPhase.phase === phaseIdx;
              return (
                <td key={i} style={{ padding: "5px 2px", textAlign: "center" }}>
                  <div
                    style={{
                      borderRadius: 4,
                      padding: "3px 2px",
                      background: isCurrentPhase ? `${phase?.color}22` : "transparent",
                      border: isCurrentPhase ? `1px solid ${phase?.color}88` : "1px solid transparent",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: phase ? phase.color : "var(--border)",
                        margin: "0 auto 2px",
                      }}
                    />
                    <div
                      style={{
                        color: phase ? phase.color : "var(--text-dim)",
                        fontSize: "0.58rem",
                        fontWeight: 600,
                      }}
                    >
                      {phase ? `P${phaseIdx}` : "—"}
                    </div>
                  </div>
                </td>
              );
            })}
          </tr>
          {/* VS Day row */}
          <tr>
            {DAY_NAMES.map((_, i) => {
              const vsTheme = VS_DAY_THEMES.find((t) => t.day === i) ?? null;
              const isCurrentVs = vsDay.theme?.day === i;
              return (
                <td key={i} style={{ padding: "5px 2px", textAlign: "center" }}>
                  <div
                    style={{
                      borderRadius: 4,
                      padding: "3px 2px",
                      background: isCurrentVs ? `${vsTheme?.color}22` : "transparent",
                      border: isCurrentVs ? `1px solid ${vsTheme?.color}88` : "1px solid transparent",
                    }}
                  >
                    <div style={{ fontSize: "0.85rem", lineHeight: 1 }}>
                      {vsTheme ? vsTheme.icon : "😴"}
                    </div>
                    <div
                      style={{
                        color: vsTheme ? vsTheme.color : "var(--text-dim)",
                        fontSize: "0.52rem",
                        fontWeight: 600,
                        marginTop: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 38,
                      }}
                    >
                      {vsTheme ? vsTheme.name.split(" ")[0] : "Rest"}
                    </div>
                  </div>
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
      <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: "0.62rem", color: "var(--text-dim)" }}>
        <span>Row 1: Arms Race phases</span>
        <span>Row 2: VS Day themes</span>
      </div>
    </div>
  );
}

function QuickTipCard() {
  const arPhase = getCurrentArmsRacePhase();
  const vsDay = getCurrentVsDay();

  const arIsDevPhase = arPhase.phase !== null && [1, 4].includes(arPhase.phase!);
  const vsIsDev = vsDay.theme && (vsDay.theme.day === 1 || vsDay.theme.day === 4);
  const vsIsSaturday = vsDay.theme?.day === 6;

  let tipTitle = "Tactical Advisory";
  let tipText = "";
  let tipColor = "var(--text-secondary)";
  let tipIcon = "📋";

  if (!arPhase.isRest && arIsDevPhase && vsIsDev) {
    tipTitle = "DOUBLE-DIP ALERT";
    tipText = "Construction & Research speedups score in BOTH Arms Race AND VS Day right now. Burn every minute you have!";
    tipColor = "var(--gold)";
    tipIcon = "🔥";
  } else if (!arPhase.isRest && arIsDevPhase && vsIsSaturday) {
    tipTitle = "TRIPLE THREAT";
    tipText = "Arms Race Dev phase + VS Day Saturday — construction speedups earn AR points AND 2x VS points simultaneously. Maximum efficiency window.";
    tipColor = "var(--gold)";
    tipIcon = "⚡";
  } else if (arPhase.phase === 6) {
    tipTitle = "DECISIVE BATTLE — FINAL PHASE";
    tipText = "Last 24h of Arms Race. Burn ALL remaining speedups now. Phase 6 is your last chance to climb the leaderboard.";
    tipColor = "#EC4899";
    tipIcon = "🚨";
  } else if (arPhase.phase === 3 || arPhase.phase === 5) {
    tipTitle = "Combat Phase Active";
    tipText = "Save your speedups — construction/research give NO Arms Race points right now. Focus on zombies and rallies.";
    tipColor = "var(--red)";
    tipIcon = "🛡️";
  } else if (arPhase.isRest) {
    tipTitle = "Rest Period";
    tipText = "Arms Race resets Monday 07:00 UTC. Stock up on speedups, plan hero upgrades, and coordinate your alliance.";
    tipColor = "var(--text-secondary)";
    tipIcon = "💤";
  } else if (vsIsSaturday) {
    tipTitle = "VS Day Main Event";
    tipText = "Today is Saturday VS Day — the main event. All Arms Race points you earn today also count toward your VS Day score.";
    tipColor = "#EC4899";
    tipIcon = "🏆";
  } else if (vsDay.isRest) {
    tipTitle = "VS Day Rest (Sunday)";
    tipText = "No VS Day today. Good time to let timers run, gather resources, and prepare for Monday reset.";
    tipColor = "var(--text-dim)";
    tipIcon = "😴";
  } else {
    const phaseData = arPhase.phase ? ARMS_RACE_PHASES[arPhase.phase - 1] : null;
    tipTitle = arPhase.phaseName + " Active";
    tipText = phaseData?.description ?? "Track your Arms Race progress and plan your speedup usage.";
    tipColor = phaseData?.color ?? "var(--text-secondary)";
    tipIcon = "🎯";
  }

  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid var(--border)`,
        borderLeft: `3px solid ${tipColor}`,
        borderRadius: 8,
        padding: "16px",
      }}
    >
      <div
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "var(--text-dim)",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        Tactical Advisory
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: "1.4rem", lineHeight: 1, flexShrink: 0 }}>{tipIcon}</span>
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.88rem",
              color: tipColor,
              marginBottom: 6,
              fontFamily: "monospace",
              letterSpacing: "0.02em",
            }}
          >
            {tipTitle}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem", lineHeight: 1.55, margin: 0 }}>
            {tipText}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [arPhase, setArPhase] = useState(getCurrentArmsRacePhase);
  const [vsDay, setVsDay] = useState(getCurrentVsDay);

  useEffect(() => {
    const id = setInterval(() => {
      setArPhase(getCurrentArmsRacePhase());
      setVsDay(getCurrentVsDay());
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  const currentPhaseData = arPhase.phase ? ARMS_RACE_PHASES[arPhase.phase - 1] : null;

  return (
    <div className="tactical-grid" style={{ minHeight: "100%" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>

        {/* Hero */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              fontSize: "0.62rem",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--gold)",
              background: "var(--gold-glow)",
              border: "1px solid var(--gold-dim)",
              borderRadius: 4,
              padding: "3px 10px",
              marginBottom: 16,
              fontFamily: "monospace",
            }}
          >
            TACTICAL OPERATIONS CENTER
          </div>
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              color: "var(--text-primary)",
              margin: "0 0 10px",
              letterSpacing: "-0.02em",
            }}
          >
            LastWar{" "}
            <span style={{ color: "var(--gold)" }}>Companion</span>
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1rem",
              margin: "0 auto",
              maxWidth: 480,
            }}
          >
            Your tactical advantage in Last War: Survival
          </p>
        </div>

        {/* Status cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {/* Arms Race card */}
          <div
            className="card-hover"
            style={{
              background: "var(--surface)",
              border: `1px solid var(--border)`,
              borderTop: `3px solid ${currentPhaseData?.color ?? "var(--border)"}`,
              borderRadius: 8,
              padding: 20,
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
              }}
            >
              Arms Race — Current Phase
            </div>
            {arPhase.isRest ? (
              <>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                  😴 Rest Period
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginBottom: 12 }}>
                  Next cycle starts Monday 07:00 UTC
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Resets in{" "}
                  <Countdown target={arPhase.nextPhaseStartUTC} />
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: currentPhaseData?.color,
                      boxShadow: `0 0 8px ${currentPhaseData?.color}88`,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: currentPhaseData?.color }}>
                    Phase {arPhase.phase} — {arPhase.phaseName}
                  </span>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginBottom: 4, fontFamily: "monospace" }}>
                    TIME REMAINING
                  </div>
                  <div style={{ fontSize: "1.8rem", color: "var(--text-primary)", fontFamily: "monospace" }}>
                    <Countdown target={arPhase.phaseEndUTC} />
                  </div>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  {currentPhaseData?.pointsPerMinute === 10
                    ? "✅ Speedups score 10 pts/min"
                    : "⚔️ Combat phase — save speedups"}
                </div>
                {currentPhaseData?.bonusMultiplier && (
                  <div style={{ marginTop: 6, fontSize: "0.7rem", fontWeight: 700, color: "var(--gold)", fontFamily: "monospace" }}>
                    🔥 BONUS MULTIPLIER ×{currentPhaseData.bonusMultiplier}
                  </div>
                )}
              </>
            )}
          </div>

          {/* VS Day card */}
          <div
            className="card-hover"
            style={{
              background: "var(--surface)",
              border: `1px solid var(--border)`,
              borderTop: `3px solid ${vsDay.theme?.color ?? "var(--border)"}`,
              borderRadius: 8,
              padding: 20,
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
              }}
            >
              VS Day — Today&apos;s Theme
            </div>
            {vsDay.isRest ? (
              <>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                  😴 Sunday Rest
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginBottom: 12 }}>
                  VS Day resumes Monday 07:00 UTC
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Starts in <Countdown target={vsDay.dayEnd} />
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: "1.5rem" }}>{vsDay.theme?.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.95rem", color: vsDay.theme?.color }}>
                    {vsDay.theme?.name}
                  </span>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginBottom: 4, fontFamily: "monospace" }}>
                    THEME CHANGES IN
                  </div>
                  <div style={{ fontSize: "1.8rem", color: "var(--text-primary)", fontFamily: "monospace" }}>
                    <Countdown target={vsDay.dayEnd} />
                  </div>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--text-dim)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Top actions:
                  </div>
                  <ul style={{ margin: 0, padding: "0 0 0 14px", lineHeight: 1.8 }}>
                    {vsDay.theme?.topActions.slice(0, 3).map((a) => (
                      <li key={a.name}>{a.name}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Quick Tip */}
          <QuickTipCard />

          {/* Weekly Calendar */}
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 20,
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
              }}
            >
              Weekly Schedule
            </div>
            <MiniCalendar />
          </div>
        </div>

        {/* Tool Navigation */}
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
            / TOOLS
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {TOOL_CARDS.map((card) => (
              <Link key={card.href} href={card.href} style={{ textDecoration: "none" }}>
                <div
                  className="card-hover"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: 18,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        background: `${card.color}22`,
                        border: `1px solid ${card.color}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                        flexShrink: 0,
                      }}
                    >
                      {card.icon}
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                      {card.title}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {card.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
