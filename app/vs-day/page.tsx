"use client";

import { useState, useEffect } from "react";
import {
  getCurrentVsDay,
  VS_DAY_THEMES,
  CHEST_THRESHOLDS,
  VS_TECH_LEVELS,
  SPEEDUP_ITEMS,
  VsDayTheme,
} from "@/lib/gameData";
import { loadProfile } from "@/lib/profile";
import Countdown from "@/components/Countdown";

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return n.toString();
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ---- Day Selector (top tabs) ----
function DaySelector({
  selectedVsDay,
  todayVsDay,
  onSelect,
  vsState,
}: {
  selectedVsDay: number;
  todayVsDay: number | null;
  onSelect: (d: number) => void;
  vsState: ReturnType<typeof getCurrentVsDay>;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", fontFamily: "monospace" }}>
          / Select Day
        </div>
        {todayVsDay && selectedVsDay !== todayVsDay && (
          <button
            onClick={() => onSelect(todayVsDay)}
            style={{
              fontSize: "0.7rem", padding: "3px 10px", borderRadius: 4,
              background: "var(--gold-glow)", border: "1px solid var(--gold)",
              color: "var(--gold)", cursor: "pointer", fontFamily: "inherit",
            }}
          >
            ← Back to today
          </button>
        )}
        {!todayVsDay && (
          <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>Sunday — rest day, no VS</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {VS_DAY_THEMES.map((theme) => {
          const isToday = todayVsDay === theme.vsDay;
          const isSelected = selectedVsDay === theme.vsDay;
          const isPast = todayVsDay !== null && theme.vsDay < todayVsDay;
          const isFuture = todayVsDay !== null && theme.vsDay > todayVsDay;

          return (
            <button
              key={theme.vsDay}
              onClick={() => onSelect(theme.vsDay)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "10px 16px",
                borderRadius: 7,
                border: `1px solid ${isSelected ? theme.color : isToday ? `${theme.color}60` : "var(--border)"}`,
                background: isSelected
                  ? `${theme.color}18`
                  : isToday
                  ? `${theme.color}08`
                  : "var(--surface-2)",
                cursor: "pointer",
                transition: "all 0.15s",
                opacity: isPast ? 0.6 : 1,
                minWidth: 80,
                position: "relative",
              }}
            >
              <div style={{ fontSize: "1.3rem" }}>{theme.icon}</div>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, fontFamily: "monospace", color: isSelected ? theme.color : "var(--text-dim)" }}>
                D{theme.vsDay}
              </div>
              <div style={{ fontSize: "0.6rem", color: isSelected ? theme.color : "var(--text-secondary)", textAlign: "center", lineHeight: 1.2, maxWidth: 72 }}>
                {theme.name}
              </div>
              {isToday && (
                <div style={{
                  position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                  fontSize: "0.5rem", fontWeight: 700, background: theme.color,
                  color: "#000", borderRadius: 3, padding: "1px 5px", fontFamily: "monospace", whiteSpace: "nowrap",
                }}>
                  TODAY
                </div>
              )}
              {isPast && (
                <div style={{ fontSize: "0.52rem", color: "var(--text-dim)", fontFamily: "monospace" }}>done</div>
              )}
              {isFuture && (
                <div style={{ fontSize: "0.52rem", color: "var(--text-dim)", fontFamily: "monospace" }}>upcoming</div>
              )}
              <div style={{ fontSize: "0.55rem", color: `${theme.color}99`, fontFamily: "monospace" }}>
                {theme.vsPoints} VS pt{theme.vsPoints > 1 ? "s" : ""}
              </div>
            </button>
          );
        })}

        {/* Sunday rest */}
        <button
          disabled
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "10px 16px", borderRadius: 7, border: "1px solid var(--border)",
            background: "var(--surface-2)", cursor: "not-allowed", opacity: 0.35, minWidth: 80,
          }}
        >
          <div style={{ fontSize: "1.3rem" }}>😴</div>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, fontFamily: "monospace", color: "var(--text-dim)" }}>SUN</div>
          <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", textAlign: "center" }}>Rest</div>
        </button>
      </div>

      {/* Countdown row */}
      {!vsState.isRest && vsState.theme && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>
              TODAY (D{vsState.theme.vsDay}) ENDS IN
            </div>
            <div style={{ fontSize: "1.1rem", fontFamily: "monospace", fontWeight: 700, color: "var(--text-primary)" }}>
              <Countdown target={vsState.dayEnd} />
            </div>
          </div>
          {vsState.theme.vsDay < 6 && (
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", alignSelf: "flex-end", paddingBottom: 2 }}>
              Next: <span style={{ color: VS_DAY_THEMES[vsState.theme.vsDay]?.color }}>
                D{vsState.theme.vsDay + 1} · {VS_DAY_THEMES[vsState.theme.vsDay]?.name}
              </span>
            </div>
          )}
        </div>
      )}
      {vsState.isRest && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
          <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>NEW VS WEEK STARTS IN</div>
          <div style={{ fontSize: "1.1rem", fontFamily: "monospace", fontWeight: 700, color: "var(--text-primary)" }}>
            <Countdown target={vsState.dayEnd} />
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Day detail panel ----
function DayDetailPanel({
  theme,
  isToday,
  vsState,
}: {
  theme: VsDayTheme;
  isToday: boolean;
  vsState: ReturnType<typeof getCurrentVsDay>;
}) {
  const todayVsDay = vsState.theme?.vsDay ?? null;
  const isPast = todayVsDay !== null && theme.vsDay < todayVsDay;
  const isFuture = todayVsDay !== null && theme.vsDay > todayVsDay;

  return (
    <div style={{
      background: "var(--surface)",
      border: `1px solid var(--border)`,
      borderTop: `4px solid ${theme.color}`,
      borderRadius: 8, padding: 24, marginBottom: 24,
    }}>
      {/* Status banner */}
      {isPast && (
        <div style={{ marginBottom: 14, padding: "6px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 5, fontSize: "0.75rem", color: "var(--text-dim)" }}>
          ✓ This day has already passed this VS week.
        </div>
      )}
      {isFuture && (
        <div style={{ marginBottom: 14, padding: "6px 12px", background: `${theme.color}08`, border: `1px solid ${theme.color}30`, borderRadius: 5, fontSize: "0.75rem", color: theme.color }}>
          ⏳ Upcoming — prepare your resources now!
        </div>
      )}
      {isToday && (
        <div style={{ marginBottom: 14, padding: "6px 12px", background: `${theme.color}12`, border: `1px solid ${theme.color}40`, borderRadius: 5, fontSize: "0.75rem", color: theme.color, fontWeight: 600 }}>
          ⚡ Active now — ends in <Countdown target={vsState.dayEnd} />
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 28 }}>
        {/* Left: theme info */}
        <div style={{ flex: "1 1 240px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <span style={{ fontSize: "2.8rem" }}>{theme.icon}</span>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>
                Day {theme.vsDay} · {DAY_LABELS[theme.day]}
              </div>
              <div style={{ fontWeight: 700, fontSize: "1.6rem", color: theme.color, lineHeight: 1.1 }}>{theme.name}</div>
              <div style={{ fontSize: "0.76rem", color: "var(--text-dim)", fontStyle: "italic" }}>{theme.namePL}</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ padding: "10px 14px", background: `${theme.color}10`, border: `1px solid ${theme.color}30`, borderRadius: 6 }}>
              <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>VS VICTORY WEIGHT</div>
              <div style={{ fontSize: "1.4rem", fontFamily: "monospace", fontWeight: 700, color: theme.color }}>
                {theme.vsPoints} point{theme.vsPoints > 1 ? "s" : ""}
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: 2 }}>
                {theme.vsPoints === 4
                  ? "⚠️ Final day — 4× weight. Highest impact of the week!"
                  : theme.vsPoints === 1
                  ? "Lowest weight day — warm-up round."
                  : "Standard 2-point day."}
              </div>
            </div>

            <div style={{ padding: "10px 14px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6 }}>
              <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 4 }}>TOP STRATEGY</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {theme.vsDay === 1 && "Complete all radar tasks first. Use stamina and gather resources to stack points."}
                {theme.vsDay === 2 && "Send Legendary Trade Truck immediately (huge one-time bonus). Then burn construction speedups."}
                {theme.vsDay === 3 && "Complete radar missions, use Valor badges, then burn research speedups."}
                {theme.vsDay === 4 && "Use UR & exclusive weapon shards for massive points. SSR shards next. Save regular speedups for other days."}
                {theme.vsDay === 5 && "Complete radar missions first. Train high-tier troops (T10 = 258 pts each). Use remaining speedups."}
                {theme.vsDay === 6 && "Send Legendary Trade Truck first! Complete UR secret missions. Get killed by rivals (big points). Use all remaining speedups."}
              </div>
            </div>
          </div>
        </div>

        {/* Right: full actions list */}
        <div style={{ flex: "2 1 360px" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 10 }}>
            All Point-Earning Actions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {theme.topActions.map((action, i) => (
              <div key={i} style={{
                background: action.highlight ? `${theme.color}10` : "var(--surface-2)",
                border: `1px solid ${action.highlight ? `${theme.color}40` : "var(--border)"}`,
                borderRadius: 5, padding: "8px 12px",
                display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.82rem", color: action.highlight ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: action.highlight ? 600 : 400 }}>
                    {action.highlight && <span style={{ color: theme.color, marginRight: 5 }}>★</span>}
                    {action.name}
                  </div>
                  {action.tip && (
                    <div style={{ fontSize: "0.68rem", color: "var(--gold)", marginTop: 2 }}>💡 {action.tip}</div>
                  )}
                </div>
                <div style={{ fontSize: "0.82rem", fontFamily: "monospace", fontWeight: 700, color: action.points > 0 ? theme.color : "var(--text-dim)", whiteSpace: "nowrap", flexShrink: 0 }}>
                  {action.points > 0 ? `+${fmt(action.points)}` : "—"}
                  <span style={{ fontWeight: 400, color: "var(--text-dim)", fontSize: "0.68rem" }}> {action.unit}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: "0.68rem", color: "var(--text-dim)" }}>
            * Base values without VS Tech research boost.
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Day Calculator ----

type CalcField = { label: string; pts: number; unit: string; maxVal?: number };

const DAY_CALC_CONFIG: Record<number, { sections: { title: string; fields: CalcField[] }[] }> = {
  1: {
    sections: [
      {
        title: "Radar",
        fields: [
          { label: "Complete radar tasks", pts: 25000, unit: "per task" },
        ],
      },
      {
        title: "Chests & Items",
        fields: [
          { label: "Open Drone Data Chip chests", pts: 2000, unit: "per chest" },
          { label: "Use Stamina", pts: 300, unit: "per stamina" },
          { label: "Hero EXP uses (660+ per use)", pts: 6, unit: "per use" },
        ],
      },
      {
        title: "Gathering & Diamonds",
        fields: [
          { label: "Gather sets (100 food/100 iron/60 coins)", pts: 40, unit: "per set" },
          { label: "Buy diamond packs (per diamond)", pts: 30, unit: "per diamond" },
        ],
      },
    ],
  },
  2: {
    sections: [
      {
        title: "One-Time Bonuses",
        fields: [
          { label: "Send Legendary Trade Truck", pts: 200000, unit: "one-time", maxVal: 1 },
          { label: "Complete Legendary Secret Tasks", pts: 150000, unit: "per task" },
          { label: "Recruit Survivors", pts: 3000, unit: "per recruit" },
          { label: "Use Armament Cores", pts: 6250, unit: "per core" },
        ],
      },
      {
        title: "Speedups & Power",
        fields: [
          { label: "Construction speedup minutes", pts: 120, unit: "per minute" },
          { label: "Increase building power by 1", pts: 21, unit: "per power" },
        ],
      },
      {
        title: "Materials & Diamonds",
        fields: [
          { label: "Use Armament Materials", pts: 2.5, unit: "per material" },
          { label: "Buy diamond packs (per diamond)", pts: 30, unit: "per diamond" },
        ],
      },
    ],
  },
  3: {
    sections: [
      {
        title: "Radar & Badges",
        fields: [
          { label: "Complete Radar Missions", pts: 23000, unit: "per mission" },
          { label: "Use Valor Badges", pts: 600, unit: "per badge" },
        ],
      },
      {
        title: "Speedups",
        fields: [
          { label: "Research speedup minutes", pts: 120, unit: "per minute" },
        ],
      },
      {
        title: "Tech Power & Diamonds",
        fields: [
          { label: "Increase Tech Power by 1", pts: 21, unit: "per power" },
          { label: "Buy diamond packs (per diamond)", pts: 30, unit: "per diamond" },
        ],
      },
    ],
  },
  4: {
    sections: [
      {
        title: "Hero Shards",
        fields: [
          { label: "Use UR/Legendary hero shards", pts: 20000, unit: "per shard" },
          { label: "Use Exclusive Weapon shards", pts: 20000, unit: "per shard" },
          { label: "Use SSR/Epic hero shards", pts: 7000, unit: "per shard" },
          { label: "Use SR/Rare hero shards", pts: 2000, unit: "per shard" },
          { label: "Elite Hero Recruitment", pts: 3750, unit: "per recruitment" },
        ],
      },
      {
        title: "Items & Diamonds",
        fields: [
          { label: "Use Skill Medals", pts: 20, unit: "per medal" },
          { label: "Hero EXP uses (660+ per use)", pts: 6, unit: "per use" },
          { label: "Buy diamond packs (per diamond)", pts: 30, unit: "per diamond" },
        ],
      },
    ],
  },
  5: {
    sections: [
      {
        title: "Radar",
        fields: [
          { label: "Complete Radar Missions", pts: 23000, unit: "per mission" },
        ],
      },
      {
        title: "Troop Training",
        fields: [
          { label: "Train T10 soldiers", pts: 258, unit: "per soldier" },
          { label: "Train T8 soldiers", pts: 202, unit: "per soldier" },
          { label: "Train T5 soldiers", pts: 130, unit: "per soldier" },
          { label: "Train T3 soldiers", pts: 94, unit: "per soldier" },
          { label: "Train T1 soldiers", pts: 46, unit: "per soldier" },
        ],
      },
      {
        title: "Speedups",
        fields: [
          { label: "Training speedup minutes", pts: 122, unit: "per minute" },
          { label: "Construction speedup minutes", pts: 120, unit: "per minute" },
          { label: "Research speedup minutes", pts: 120, unit: "per minute" },
        ],
      },
      {
        title: "Diamonds",
        fields: [
          { label: "Buy diamond packs (per diamond)", pts: 30, unit: "per diamond" },
        ],
      },
    ],
  },
  6: {
    sections: [
      {
        title: "One-Time Bonuses",
        fields: [
          { label: "Send Legendary Trade Truck", pts: 200000, unit: "one-time", maxVal: 1 },
          { label: "Complete UR Secret Tasks", pts: 150000, unit: "per task" },
        ],
      },
      {
        title: "Combat — Enemy Kills",
        fields: [
          { label: "T10 killed by rival alliance", pts: 138, unit: "per unit" },
          { label: "T8 killed by rival alliance", pts: 108, unit: "per unit" },
          { label: "T5 killed by rival alliance", pts: 75, unit: "per unit" },
          { label: "T3 killed by rival alliance", pts: 45, unit: "per unit" },
          { label: "T1 killed by rival alliance", pts: 25, unit: "per unit" },
        ],
      },
      {
        title: "Combat — Self Kills & Losses",
        fields: [
          { label: "T10 self kills", pts: 28, unit: "per unit" },
          { label: "T5 self kills", pts: 15, unit: "per unit" },
          { label: "T1 self kills", pts: 5, unit: "per unit" },
          { label: "T10 troops lost", pts: 20, unit: "per unit" },
          { label: "T5 troops lost", pts: 12, unit: "per unit" },
          { label: "T1 troops lost", pts: 6, unit: "per unit" },
        ],
      },
      {
        title: "Speedups",
        fields: [
          { label: "Construction speedup minutes", pts: 120, unit: "per minute" },
          { label: "Research speedup minutes", pts: 120, unit: "per minute" },
          { label: "Training speedup minutes", pts: 122, unit: "per minute" },
          { label: "Healing speedup minutes", pts: 122, unit: "per minute" },
        ],
      },
      {
        title: "Diamonds",
        fields: [
          { label: "Buy diamond packs (per diamond)", pts: 30, unit: "per diamond" },
        ],
      },
    ],
  },
};

function buildInitialValues(vsDay: number): number[] {
  const config = DAY_CALC_CONFIG[vsDay];
  if (!config) return [];
  return config.sections.flatMap((s) => s.fields.map(() => 0));
}

function DayCalculator({ selectedVsDay }: { selectedVsDay: number }) {
  const config = DAY_CALC_CONFIG[selectedVsDay];
  const [values, setValues] = useState<number[]>(() => buildInitialValues(selectedVsDay));

  useEffect(() => {
    setValues(buildInitialValues(selectedVsDay));
  }, [selectedVsDay]);

  if (!config) return null;

  const theme = VS_DAY_THEMES.find((t) => t.vsDay === selectedVsDay);
  const themeColor = theme?.color ?? "var(--gold)";

  // Flatten fields in same order as values array
  const allFields = config.sections.flatMap((s) => s.fields);

  const total = allFields.reduce((sum, field, i) => {
    const val = Math.max(0, field.maxVal !== undefined ? Math.min(values[i] ?? 0, field.maxVal) : (values[i] ?? 0));
    return sum + val * field.pts;
  }, 0);

  const reachedChest = [...CHEST_THRESHOLDS].reverse().find((c) => c.points <= total) ?? null;
  const nextChest = CHEST_THRESHOLDS.find((c) => c.points > total) ?? null;

  const totalColor = total === 0 ? "var(--text-dim)" : reachedChest ? "var(--gold)" : "#EC4899";

  function setValue(flatIdx: number, raw: string) {
    const n = Math.max(0, parseInt(raw.replace(/\D/g, "")) || 0);
    setValues((prev) => {
      const next = [...prev];
      next[flatIdx] = n;
      return next;
    });
  }

  function reset() {
    setValues(buildInitialValues(selectedVsDay));
  }

  // Walk sections and keep a running flat index
  let fieldIdx = 0;

  return (
    <div style={{
      background: "var(--surface)",
      border: `1px solid var(--border)`,
      borderTop: `4px solid ${themeColor}`,
      borderRadius: 8,
      padding: 24,
      marginBottom: 24,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", fontFamily: "monospace" }}>
          / D{selectedVsDay} Points Calculator
        </div>
        <button
          onClick={reset}
          style={{
            fontSize: "0.7rem", padding: "4px 12px", borderRadius: 4,
            background: "var(--surface-2)", border: "1px solid var(--border)",
            color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit",
            letterSpacing: "0.05em",
          }}
        >
          Reset
        </button>
      </div>

      {/* Input sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 24 }}>
        {config.sections.map((section) => {
          const sectionFields = section.fields;
          const sectionStartIdx = fieldIdx;
          fieldIdx += sectionFields.length;

          return (
            <div key={section.title}>
              <div style={{
                fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em",
                color: "var(--text-dim)", textTransform: "uppercase",
                fontFamily: "monospace", marginBottom: 8,
                paddingBottom: 4, borderBottom: "1px solid var(--border)",
              }}>
                {section.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sectionFields.map((field, si) => {
                  const fi = sectionStartIdx + si;
                  const val = values[fi] ?? 0;
                  const effectiveVal = field.maxVal !== undefined ? Math.min(val, field.maxVal) : val;
                  const contrib = effectiveVal * field.pts;
                  return (
                    <div key={field.label} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: contrib > 0 ? `${themeColor}08` : "var(--surface-2)",
                      border: `1px solid ${contrib > 0 ? `${themeColor}25` : "var(--border)"}`,
                      borderRadius: 5, padding: "7px 10px",
                      transition: "all 0.15s",
                    }}>
                      {/* Label */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.3 }}>
                          {field.label}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", fontFamily: "monospace" }}>
                          {field.pts.toLocaleString("en-US")} pts · {field.unit}
                          {field.maxVal !== undefined && <span style={{ color: "#EC4899", marginLeft: 4 }}>(max {field.maxVal})</span>}
                        </div>
                      </div>
                      {/* Contribution */}
                      <div style={{
                        fontSize: "0.75rem", fontFamily: "monospace", fontWeight: 700,
                        color: contrib > 0 ? themeColor : "var(--text-dim)",
                        minWidth: 72, textAlign: "right", flexShrink: 0,
                      }}>
                        {contrib > 0 ? `+${fmt(contrib)}` : "—"}
                      </div>
                      {/* Input */}
                      <input
                        type="number"
                        min={0}
                        max={field.maxVal}
                        value={val === 0 ? "" : val}
                        onChange={(e) => setValue(fi, e.target.value)}
                        placeholder="0"
                        style={{
                          width: 70, background: "var(--surface-3, var(--surface))",
                          border: "1px solid var(--border-bright, var(--border))",
                          borderRadius: 4, padding: "5px 8px",
                          color: "var(--text-primary)", fontFamily: "monospace",
                          fontSize: "0.9rem", outline: "none", textAlign: "right", flexShrink: 0,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total bar */}
      <div style={{
        background: "var(--surface-2)", border: `1px solid ${reachedChest ? "rgba(245,158,11,0.35)" : "var(--border)"}`,
        borderRadius: 8, padding: "16px 20px",
        display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center",
      }}>
        {/* Total points */}
        <div style={{ flex: "1 1 180px" }}>
          <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 4, letterSpacing: "0.08em" }}>
            TOTAL VS POINTS
          </div>
          <div style={{ fontSize: "2rem", fontFamily: "monospace", fontWeight: 700, color: totalColor, lineHeight: 1 }}>
            {total.toLocaleString("en-US")}
          </div>
          {total > 0 && (
            <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: 4, fontFamily: "monospace" }}>
              ≈ {fmt(total)}
            </div>
          )}
        </div>

        {/* Chest reached */}
        <div style={{ flex: "1 1 140px" }}>
          <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 4, letterSpacing: "0.08em" }}>
            CHEST REACHED
          </div>
          {reachedChest ? (
            <div>
              <div style={{ fontSize: "1.4rem", fontFamily: "monospace", fontWeight: 700, color: "var(--gold)" }}>
                #{reachedChest.chest}
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: 2 }}>
                {reachedChest.rewards.slice(0, 2).join(" · ")}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "1.4rem", fontFamily: "monospace", fontWeight: 700, color: "var(--text-dim)" }}>
              None
            </div>
          )}
        </div>

        {/* Next chest */}
        {nextChest && total > 0 && (
          <div style={{ flex: "2 1 200px" }}>
            <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 4, letterSpacing: "0.08em" }}>
              NEXT: CHEST #{nextChest.chest}
            </div>
            <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginBottom: 4 }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, Math.floor((total / nextChest.points) * 100))}%`,
                background: "var(--gold)", borderRadius: 3, transition: "width 0.3s",
              }} />
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", fontFamily: "monospace" }}>
              {fmt(total)} / {fmt(nextChest.points)} — need {fmt(nextChest.points - total)} more
            </div>
          </div>
        )}

        {!nextChest && total > 0 && (
          <div style={{ flex: "1 1 160px", fontSize: "0.85rem", fontWeight: 700, color: "#10B981" }}>
            All 9 chests unlocked!
          </div>
        )}
      </div>
    </div>
  );
}

// ---- VS Tech selector ----
function VsTechSelector({ selectedLevel, onChange }: { selectedLevel: number; onChange: (l: number) => void }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 20, marginBottom: 24 }}>
      <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 14, fontFamily: "monospace" }}>
        / VS Tech Research Level (affects chest thresholds)
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {VS_TECH_LEVELS.map((tech) => (
          <button key={tech.level} onClick={() => onChange(tech.level)} style={{
            padding: "7px 14px",
            background: selectedLevel === tech.level ? "var(--gold-glow)" : "var(--surface-2)",
            border: `1px solid ${selectedLevel === tech.level ? "var(--gold)" : "var(--border)"}`,
            borderRadius: 5, color: selectedLevel === tech.level ? "var(--gold)" : "var(--text-secondary)",
            fontSize: "0.8rem", fontWeight: selectedLevel === tech.level ? 700 : 400,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}>
            {tech.name}
            <span style={{ marginLeft: 6, fontSize: "0.7rem", color: selectedLevel === tech.level ? "var(--gold-dim)" : "var(--text-dim)" }}>
              ×{tech.multiplier}
            </span>
          </button>
        ))}
      </div>
      {selectedLevel > 0 && (
        <div style={{ marginTop: 10, fontSize: "0.78rem", color: "var(--text-secondary)" }}>
          {VS_TECH_LEVELS[selectedLevel].description} — chest thresholds reduced accordingly.
        </div>
      )}
    </div>
  );
}

// ---- Chest tracker ----
function ChestTracker({ techMultiplier }: { techMultiplier: number }) {
  const [inputVal, setInputVal] = useState("");
  const [currentPoints, setCurrentPoints] = useState(0);

  function handleInput(val: string) {
    setInputVal(val);
    setCurrentPoints(parseInt(val.replace(/\D/g, "")) || 0);
  }

  const adjusted = CHEST_THRESHOLDS.map((c) => ({
    ...c,
    adjPts: Math.floor(c.points / techMultiplier),
  }));

  const nextChest = adjusted.find((c) => c.adjPts > currentPoints);
  const allDone = currentPoints > 0 && !nextChest;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 24, marginBottom: 24 }}>
      <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 16, fontFamily: "monospace" }}>
        / Chest Threshold Tracker
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20, alignItems: "flex-end" }}>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>
            Your current VS Day points
          </label>
          <input type="text" inputMode="numeric" value={inputVal} onChange={(e) => handleInput(e.target.value)} placeholder="e.g. 540000" style={{
            background: "var(--surface-2)", border: "1px solid var(--border-bright)", borderRadius: 5,
            padding: "8px 12px", color: "var(--text-primary)", fontFamily: "monospace",
            fontSize: "1rem", width: 220, outline: "none",
          }} />
        </div>
        {nextChest && currentPoints > 0 && (
          <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 14px", fontSize: "0.8rem" }}>
            <span style={{ color: "var(--text-dim)" }}>Next: </span>
            <span style={{ color: "var(--gold)", fontWeight: 700, fontFamily: "monospace" }}>Chest {nextChest.chest}</span>
            <span style={{ color: "var(--text-secondary)", marginLeft: 8 }}>need {fmt(nextChest.adjPts - currentPoints)} more</span>
          </div>
        )}
        {allDone && (
          <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 6, padding: "8px 14px", fontSize: "0.8rem", color: "var(--green)", fontWeight: 700 }}>
            🏆 All 9 chests unlocked!
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {adjusted.map((chest) => {
          const unlocked = currentPoints >= chest.adjPts;
          const isNext = nextChest?.chest === chest.chest;
          const progress = isNext ? Math.min(100, Math.floor((currentPoints / chest.adjPts) * 100)) : unlocked ? 100 : 0;
          return (
            <div key={chest.chest} style={{
              background: unlocked ? "rgba(245,158,11,0.07)" : "var(--surface-2)",
              border: `1px solid ${isNext ? "var(--gold)" : unlocked ? "rgba(245,158,11,0.25)" : "var(--border)"}`,
              borderRadius: 6, padding: "10px 14px", opacity: unlocked || isNext ? 1 : 0.55,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: unlocked ? "var(--gold)" : "var(--surface-3)",
                  border: `1px solid ${unlocked ? "var(--gold)" : "var(--border)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 700,
                  color: unlocked ? "#000" : "var(--text-dim)", flexShrink: 0, fontFamily: "monospace",
                }}>
                  {unlocked ? "✓" : chest.chest}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontFamily: "monospace", color: unlocked ? "var(--gold)" : isNext ? "var(--text-primary)" : "var(--text-secondary)", fontSize: "0.9rem" }}>
                      {fmt(chest.adjPts)} pts
                    </span>
                    {techMultiplier !== 1 && (
                      <span style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>(base: {fmt(chest.points)})</span>
                    )}
                    <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>— {chest.rewards.join(" · ")}</span>
                  </div>
                  {isNext && currentPoints > 0 && (
                    <div style={{ marginTop: 5 }}>
                      <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${progress}%`, background: "var(--gold)", borderRadius: 2, transition: "width 0.3s" }} />
                      </div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", marginTop: 2, fontFamily: "monospace" }}>
                        {progress}% — {fmt(currentPoints)} / {fmt(chest.adjPts)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Speedup estimator ----
function PointsEstimator({ currentTheme }: { currentTheme: VsDayTheme | null }) {
  const [quantities, setQuantities] = useState<number[]>(SPEEDUP_ITEMS.map(() => 0));
  const BASE_PTS_PER_MIN = 120;
  const totalMinutes = SPEEDUP_ITEMS.reduce((sum, item, i) => sum + item.minutes * (quantities[i] || 0), 0);
  const estimatedVsPoints = totalMinutes * BASE_PTS_PER_MIN;
  const isSpeedupDay = currentTheme && [2, 3, 5, 6].includes(currentTheme.vsDay);

  function setQty(i: number, val: string) {
    const n = Math.max(0, parseInt(val) || 0);
    setQuantities((prev) => { const next = [...prev]; next[i] = n; return next; });
  }

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 24, marginBottom: 24 }}>
      <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", marginBottom: 4, fontFamily: "monospace" }}>
        / VS Points Estimator — Speedups
      </div>
      <p style={{ margin: "0 0 16px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
        Base rate: ~120 pts per 1-min speedup (construction/research).
        {isSpeedupDay && <strong style={{ color: "var(--gold)" }}> Today ({currentTheme!.name}) is a speedup day!</strong>}
        {!isSpeedupDay && currentTheme && <span style={{ color: "var(--text-dim)" }}> Current day ({currentTheme.name}) is not primarily a speedup day.</span>}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: 20 }}>
        {SPEEDUP_ITEMS.map((item, i) => (
          <div key={item.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              {item.name}
              <span style={{ color: "var(--text-dim)", marginLeft: 4 }}>({fmt(item.minutes * BASE_PTS_PER_MIN)} pts)</span>
            </label>
            <input type="number" min={0} value={quantities[i] === 0 ? "" : quantities[i]} onChange={(e) => setQty(i, e.target.value)} placeholder="0" style={{
              background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5,
              padding: "6px 10px", color: "var(--text-primary)", fontFamily: "monospace",
              fontSize: "0.9rem", width: "100%", outline: "none",
            }} />
          </div>
        ))}
      </div>
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, display: "flex", flexWrap: "wrap", gap: 24 }}>
        <div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>TOTAL MINUTES</div>
          <div style={{ fontSize: "1.4rem", fontFamily: "monospace", fontWeight: 700, color: "var(--text-primary)" }}>{totalMinutes.toLocaleString("en-US")}</div>
        </div>
        <div>
          <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>ESTIMATED VS POINTS (base)</div>
          <div style={{ fontSize: "1.4rem", fontFamily: "monospace", fontWeight: 700, color: "var(--pink)" }}>{estimatedVsPoints.toLocaleString("en-US")}</div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>× your VS Tech multiplier = actual in-game pts</div>
        </div>
        {estimatedVsPoints > 0 && (
          <div>
            <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 2 }}>REACHES CHEST</div>
            <div style={{ fontSize: "1.4rem", fontFamily: "monospace", fontWeight: 700, color: "var(--gold)" }}>
              {(() => {
                const reached = [...CHEST_THRESHOLDS].reverse().find((c) => c.points <= estimatedVsPoints);
                return reached ? `#${reached.chest}` : "None";
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Main page ----
export default function VsDayPage() {
  const [vsState, setVsState] = useState(getCurrentVsDay);
  const [selectedVsDay, setSelectedVsDay] = useState<number>(
    () => getCurrentVsDay().theme?.vsDay ?? 1
  );
  const [techLevel, setTechLevel] = useState(0);

  // Load VS Tech level from profile on mount
  useEffect(() => {
    const profile = loadProfile();
    if (profile.vsTechLevel > 0) setTechLevel(profile.vsTechLevel);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setVsState(getCurrentVsDay()), 30_000);
    return () => clearInterval(id);
  }, []);

  const techMultiplier = VS_TECH_LEVELS[techLevel]?.multiplier ?? 1;
  const todayVsDay = vsState.theme?.vsDay ?? null;
  const selectedTheme = VS_DAY_THEMES.find((t) => t.vsDay === selectedVsDay) ?? VS_DAY_THEMES[0];
  const isToday = todayVsDay === selectedVsDay;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", color: "#EC4899", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 8 }}>
          / VS Day
        </div>
        <h1 style={{ margin: "0 0 6px", fontSize: "1.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
          VS Day Dashboard
        </h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          6-day Alliance Duel — Mon (Day 1) through Sat (Day 6). Sunday is rest. Day 6 carries 4× VS victory weight.
        </p>
      </div>

      {/* Day selector */}
      <DaySelector
        selectedVsDay={selectedVsDay}
        todayVsDay={todayVsDay}
        onSelect={setSelectedVsDay}
        vsState={vsState}
      />

      {/* Selected day detail */}
      <DayDetailPanel
        theme={selectedTheme}
        isToday={isToday}
        vsState={vsState}
      />

      {/* Per-day points calculator */}
      <DayCalculator selectedVsDay={selectedVsDay} />

      {/* Chest + tech (always visible) */}
      <VsTechSelector selectedLevel={techLevel} onChange={setTechLevel} />
      <ChestTracker techMultiplier={techMultiplier} />
      <PointsEstimator currentTheme={vsState.theme} />
    </div>
  );
}
