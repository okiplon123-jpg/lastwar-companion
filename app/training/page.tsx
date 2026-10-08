"use client";

import { useState, useEffect, useMemo } from "react";
import { SPEEDUP_ITEMS } from "@/lib/gameData";
import { loadProfile, getMaxTroopTier } from "@/lib/profile";

// VS Day D5 points per troop tier (base, no VS Tech boost)
const TROOP_TIERS = [
  { tier: "T10", vsPts: 258, color: "#F59E0B" },
  { tier: "T8",  vsPts: 202, color: "#EC4899" },
  { tier: "T5",  vsPts: 130, color: "#8B5CF6" },
  { tier: "T3",  vsPts: 94,  color: "#3B82F6" },
  { tier: "T1",  vsPts: 46,  color: "#6B7280" },
];

const TRAINING_SPEEDUP_PTS_PER_MIN = 122; // VS Day D5 base rate

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toFixed(0);
}

// ---- Speedup Inventory ----
function SpeedupInventory({
  quantities,
  totalMins,
  onChange,
}: {
  quantities: number[];
  totalMins: number;
  onChange: (i: number, val: string) => void;
}) {
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
      <div
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "var(--text-dim)",
          textTransform: "uppercase",
          fontFamily: "monospace",
          marginBottom: 4,
        }}
      >
        / Training Speedup Inventory
      </div>
      <p style={{ margin: "0 0 16px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
        Enter how many of each training speedup you have. Use training-type speedups only.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {SPEEDUP_ITEMS.map((item, i) => (
          <div key={item.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              {item.name}
              <span style={{ color: "var(--text-dim)", marginLeft: 4, fontFamily: "monospace" }}>
                ({item.minutes}m)
              </span>
            </label>
            <input
              type="number"
              min={0}
              value={quantities[i] === 0 ? "" : quantities[i]}
              onChange={(e) => onChange(i, e.target.value)}
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

      <div
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: "12px 16px",
          display: "flex",
          gap: 32,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>
            TOTAL TRAINING MINUTES
          </div>
          <div style={{ fontSize: "1.6rem", fontFamily: "monospace", fontWeight: 700, color: "var(--text-primary)" }}>
            {totalMins.toLocaleString("en-US")}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>
            TOTAL HOURS
          </div>
          <div style={{ fontSize: "1.6rem", fontFamily: "monospace", fontWeight: 700, color: "var(--text-secondary)" }}>
            {(totalMins / 60).toFixed(1)}h
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>
            VS PTS FROM SPEEDUPS ALONE (D5 base)
          </div>
          <div style={{ fontSize: "1.6rem", fontFamily: "monospace", fontWeight: 700, color: "#8B5CF6" }}>
            {fmt(totalMins * TRAINING_SPEEDUP_PTS_PER_MIN)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Troop Calculator ----
function TroopCalculator({
  totalTrainingMins,
  troopsPerHour,
  onTroopsPerHourChange,
  maxTier,
}: {
  totalTrainingMins: number;
  troopsPerHour: string;
  onTroopsPerHourChange: (v: string) => void;
  maxTier: number;
}) {
  const [selectedTier, setSelectedTier] = useState(0);
  const [manualTroops, setManualTroops] = useState<string>("");

  const tier = TROOP_TIERS[selectedTier];
  const tph = parseFloat(troopsPerHour) || 0;

  const troopsFromSpeedups = tph > 0 ? Math.floor((totalTrainingMins / 60) * tph) : 0;
  const manualTroopsNum = parseInt(manualTroops) || 0;

  // When speedup inventory is filled AND training speed given, use calc; otherwise use manual
  const useSpeedupCalc = totalTrainingMins > 0 && tph > 0;
  const troopsToCalc = useSpeedupCalc ? troopsFromSpeedups : manualTroopsNum;

  const vsPtsFromTroops = troopsToCalc * tier.vsPts;
  const vsPtsFromSpeedups = totalTrainingMins * TRAINING_SPEEDUP_PTS_PER_MIN;
  const totalVsPts = vsPtsFromTroops + (useSpeedupCalc ? vsPtsFromSpeedups : 0);

  const effectivePtsPerMin =
    tph > 0
      ? TRAINING_SPEEDUP_PTS_PER_MIN + (tph / 60) * tier.vsPts
      : TRAINING_SPEEDUP_PTS_PER_MIN;

  const hasResults = troopsToCalc > 0 || (useSpeedupCalc && totalTrainingMins > 0);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid var(--border)`,
        borderTop: `4px solid ${tier.color}`,
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
          fontFamily: "monospace",
          marginBottom: 16,
        }}
      >
        / VS Day Training Calculator (D5 — Total Mobilization)
      </div>

      {/* Tier selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: 8, fontWeight: 600 }}>
          Troop Tier
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TROOP_TIERS.map((t, i) => {
            const tierNum = parseInt(t.tier.replace("T", ""));
            const locked = tierNum > maxTier;
            return (
              <button
                key={t.tier}
                onClick={() => !locked && setSelectedTier(i)}
                disabled={locked}
                title={locked ? `Requires Barracks level to unlock T${tierNum}` : undefined}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: `1px solid ${selectedTier === i ? t.color : locked ? "var(--border)" : "var(--border)"}`,
                  background: selectedTier === i ? `${t.color}18` : "var(--surface-2)",
                  color: locked ? "var(--text-dim)" : selectedTier === i ? t.color : "var(--text-secondary)",
                  fontWeight: selectedTier === i ? 700 : 400,
                  fontSize: "0.85rem",
                  cursor: locked ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  opacity: locked ? 0.4 : 1,
                }}
              >
                {t.tier}
                {locked
                  ? <span style={{ marginLeft: 5, fontSize: "0.65rem" }}>🔒</span>
                  : <span style={{ marginLeft: 6, fontSize: "0.7rem", opacity: 0.75, fontFamily: "monospace" }}>+{t.vsPts} pts</span>
                }
              </button>
            );
          })}
        </div>
        {maxTier < 10 && (
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: 6 }}>
            Your max tier: T{maxTier} — update Barracks level in{" "}
            <a href="/profile" style={{ color: "var(--gold)", textDecoration: "none" }}>Profile</a>{" "}
            to unlock higher tiers.
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Training speed */}
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: 6, fontWeight: 600 }}>
            Training speed (troops/hour)
          </label>
          <input
            type="number"
            min={0}
            value={troopsPerHour}
            onChange={(e) => onTroopsPerHourChange(e.target.value)}
            placeholder="e.g. 120"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-bright, var(--border))",
              borderRadius: 5,
              padding: "8px 12px",
              color: "var(--text-primary)",
              fontFamily: "monospace",
              fontSize: "1rem",
              width: "100%",
              outline: "none",
            }}
          />
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: 4 }}>
            See your barracks training queue in-game — it shows troops/hour.
          </div>
        </div>

        {/* Manual entry */}
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: 6, fontWeight: 600 }}>
            Or: enter number of troops directly
          </label>
          <input
            type="number"
            min={0}
            value={manualTroops}
            onChange={(e) => setManualTroops(e.target.value)}
            placeholder="e.g. 500"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-bright, var(--border))",
              borderRadius: 5,
              padding: "8px 12px",
              color: "var(--text-primary)",
              fontFamily: "monospace",
              fontSize: "1rem",
              width: "100%",
              outline: "none",
            }}
          />
          <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: 4 }}>
            Useful if you know exactly how many troops you&apos;ll finish today.
          </div>
        </div>
      </div>

      {/* Results */}
      {hasResults ? (
        <div
          style={{
            background: "var(--surface-2)",
            border: `1px solid ${tier.color}30`,
            borderRadius: 8,
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: "0.6rem",
              color: "var(--text-dim)",
              fontFamily: "monospace",
              marginBottom: 14,
              letterSpacing: "0.1em",
            }}
          >
            RESULTS — D5 TOTAL MOBILIZATION
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 16,
              marginBottom: 16,
            }}
          >
            {useSpeedupCalc && (
              <div>
                <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>
                  {tier.tier} TROOPS TRAINED
                </div>
                <div style={{ fontSize: "1.8rem", fontFamily: "monospace", fontWeight: 700, color: tier.color }}>
                  {troopsFromSpeedups.toLocaleString("en-US")}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>
                PTS FROM TROOPS
              </div>
              <div style={{ fontSize: "1.8rem", fontFamily: "monospace", fontWeight: 700, color: tier.color }}>
                {fmt(vsPtsFromTroops)}
              </div>
            </div>

            {useSpeedupCalc && (
              <div>
                <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>
                  PTS FROM SPEEDUPS
                </div>
                <div style={{ fontSize: "1.8rem", fontFamily: "monospace", fontWeight: 700, color: "#8B5CF6" }}>
                  {fmt(vsPtsFromSpeedups)}
                </div>
              </div>
            )}

            <div>
              <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>
                TOTAL VS POINTS
              </div>
              <div style={{ fontSize: "2rem", fontFamily: "monospace", fontWeight: 700, color: "var(--gold)" }}>
                {fmt(totalVsPts)}
              </div>
            </div>
          </div>

          {tph > 0 && useSpeedupCalc && (
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              <span style={{ color: tier.color, fontFamily: "monospace", fontWeight: 700 }}>
                ~{effectivePtsPerMin.toFixed(0)} effective pts/min
              </span>
              {" "}while training {tier.tier}{" "}
              <span style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>
                (122 from speedup + {((tph / 60) * tier.vsPts).toFixed(1)} from troops per min)
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            padding: "20px 0",
            fontSize: "0.8rem",
            color: "var(--text-dim)",
            textAlign: "center",
            fontFamily: "monospace",
          }}
        >
          Enter your speedup inventory and training speed above to see results.
        </div>
      )}
    </div>
  );
}

// ---- Tier Efficiency Table ----
function TierEfficiencyTable({ troopsPerHour }: { troopsPerHour: number }) {
  const maxPts =
    troopsPerHour > 0
      ? TRAINING_SPEEDUP_PTS_PER_MIN + (troopsPerHour / 60) * TROOP_TIERS[0].vsPts
      : TRAINING_SPEEDUP_PTS_PER_MIN;

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
      <div
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "var(--text-dim)",
          textTransform: "uppercase",
          fontFamily: "monospace",
          marginBottom: 4,
        }}
      >
        / VS Points Efficiency by Tier (D5)
      </div>
      <p style={{ margin: "0 0 16px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
        Effective VS points per training minute — includes both speedup points (122/min) and soldier points.
        {troopsPerHour > 0 ? (
          <span style={{ color: "var(--gold)" }}>
            {" "}Based on your {troopsPerHour} troops/hour speed.
          </span>
        ) : (
          <span style={{ color: "var(--text-dim)" }}>
            {" "}Enter your training speed in the calculator above.
          </span>
        )}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {TROOP_TIERS.map((t) => {
          const troopPtsPerMin = troopsPerHour > 0 ? (troopsPerHour / 60) * t.vsPts : 0;
          const totalPtsPerMin = TRAINING_SPEEDUP_PTS_PER_MIN + troopPtsPerMin;
          const barPct = Math.min(100, (totalPtsPerMin / (maxPts * 1.05)) * 100);

          return (
            <div
              key={t.tier}
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "10px 14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: troopsPerHour > 0 ? 8 : 0,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    minWidth: 36,
                    fontWeight: 700,
                    color: t.color,
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                  }}
                >
                  {t.tier}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                    {t.vsPts} pts/troop
                  </span>
                  {troopsPerHour > 0 && (
                    <span style={{ marginLeft: 12, fontSize: "0.78rem", color: "var(--text-dim)" }}>
                      +{troopPtsPerMin.toFixed(1)} troop pts/min
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: troopsPerHour > 0 ? t.color : "var(--text-secondary)",
                    fontSize: "0.95rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {troopsPerHour > 0
                    ? `${totalPtsPerMin.toFixed(0)} pts/min`
                    : `122 + ${t.vsPts} pts/troop`}
                </div>
              </div>
              {troopsPerHour > 0 && (
                <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${barPct}%`,
                      background: t.color,
                      borderRadius: 2,
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 12,
          padding: "10px 14px",
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 6,
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
        }}
      >
        💡 <strong style={{ color: "var(--gold)" }}>Always train the highest tier you can.</strong>{" "}
        Higher tier = more VS points per troop. The speedup points (122/min) are the same regardless of tier.
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function TrainingPage() {
  const [quantities, setQuantities] = useState<number[]>(SPEEDUP_ITEMS.map(() => 0));
  const [troopsPerHour, setTroopsPerHour] = useState<string>("");
  const [profileMaxTier, setProfileMaxTier] = useState<number>(10);

  // Load training speed and max tier from profile on mount
  useEffect(() => {
    const p = loadProfile();
    if (p.trainingSpeedPerHour > 0) setTroopsPerHour(String(p.trainingSpeedPerHour));
    setProfileMaxTier(getMaxTroopTier(p.barracksLevel));
  }, []);

  const totalTrainingMins = useMemo(
    () => SPEEDUP_ITEMS.reduce((sum, item, i) => sum + item.minutes * (quantities[i] || 0), 0),
    [quantities]
  );

  function setQty(i: number, val: string) {
    const n = Math.max(0, parseInt(val) || 0);
    setQuantities((prev) => {
      const next = [...prev];
      next[i] = n;
      return next;
    });
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: "#8B5CF6",
            fontFamily: "monospace",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          / Training
        </div>
        <h1 style={{ margin: "0 0 6px", fontSize: "1.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Training Planner
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Calculate VS Day points from troop training — speedups needed, troops trained, and total
          points earned on D5 Total Mobilization.
        </p>
      </div>

      {/* Context banner */}
      <div
        style={{
          background: "rgba(139,92,246,0.06)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: 8,
          padding: "12px 16px",
          marginBottom: 24,
          fontSize: "0.78rem",
          color: "var(--text-secondary)",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>🪖</span>
        <div>
          <strong style={{ color: "#8B5CF6" }}>VS Day D5 — Total Mobilization</strong> is the
          primary training day. You earn{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            122 pts per training speedup minute
          </strong>{" "}
          PLUS{" "}
          <strong style={{ color: "var(--text-primary)" }}>
            258 pts per T10 soldier trained
          </strong>{" "}
          (base values — multiply by your VS Tech research level for actual in-game points).
        </div>
      </div>

      {/* Speedup inventory */}
      <SpeedupInventory quantities={quantities} totalMins={totalTrainingMins} onChange={setQty} />

      {/* Calculator (owns training speed input, shared via lifted state) */}
      <TroopCalculator
        totalTrainingMins={totalTrainingMins}
        troopsPerHour={troopsPerHour}
        onTroopsPerHourChange={setTroopsPerHour}
        maxTier={profileMaxTier}
      />

      {/* Efficiency table (reads from same troopsPerHour) */}
      <TierEfficiencyTable troopsPerHour={parseFloat(troopsPerHour) || 0} />

      {/* Quick reference */}
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
            fontFamily: "monospace",
            marginBottom: 14,
          }}
        >
          / D5 Quick Reference — VS Points by Troop Tier
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
          {TROOP_TIERS.map((t) => (
            <div
              key={t.tier}
              style={{
                background: "var(--surface-2)",
                border: `1px solid ${t.color}40`,
                borderRadius: 6,
                padding: "10px 12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: t.color, fontFamily: "monospace", marginBottom: 4 }}>
                {t.tier}
              </div>
              <div style={{ fontSize: "1rem", fontFamily: "monospace", fontWeight: 700, color: "var(--text-primary)" }}>
                +{t.vsPts}
              </div>
              <div style={{ fontSize: "0.6rem", color: "var(--text-dim)" }}>pts/troop</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontSize: "0.72rem", color: "var(--text-dim)" }}>
          * Base values (no VS Tech boost). Training speedups give{" "}
          <span style={{ color: "#8B5CF6" }}>122 pts/min</span> on top of troop pts.
        </div>
      </div>
    </div>
  );
}
