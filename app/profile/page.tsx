"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  PlayerProfile,
  DEFAULT_PROFILE,
  DEFAULT_HERO_SAVE,
  DEFAULT_DRONE,
  HeroSave,
  HeroGearSlot,
  SquadDef,
  DroneSave,
  DroneChipRarity,
  DroneUnitType,
  DroneChipInfo,
  DroneChipSetData,
  DRONE_COMPONENT_NAMES,
  DRONE_COMPONENT_ICONS,
  loadProfile,
  saveProfile,
  clearProfile,
  getMaxTroopTier,
  getVsTechMultiplier,
  getVipConstructionBonus,
  getVipResearchBonus,
} from "@/lib/profile";
import {
  getHeroLevelCap,
  getSkillLevelCap,
  isExpertiseUnlocked,
  getSkillMedalCost,
  HERO_SKILL_SLOTS,
  SKILL_CAP_UNLOCK_LABEL,
  EW_MILESTONES,
  getEWShardsToLevel,
  getEWShardsRange,
  getWoHBonus,
  getWoHRatePerMilestone,
  getWoHBonusType,
  WOH_UR_PROMOTABLE,
} from "@/lib/hero-data";
import {
  HEROES,
  HeroDef,
  HeroType,
  GearType,
  GearQuality,
  TYPE_COLORS,
  TYPE_ICONS,
  ROLE_ICONS,
  RARITY_COLORS,
  GEAR_QUALITY_COLORS,
  GEAR_QUALITY_LABELS,
  ALL_GEAR_SLOTS,
  GEAR_SLOT_ICONS,
  GEAR_QUALITIES,
  TYPE_ICON_URLS,
  ROLE_ICON_URLS,
  RARITY_ICON_URLS,
  GEAR_ICON_URLS,
} from "@/lib/heroes";
import { VS_TECH_LEVELS } from "@/lib/gameData";
import {
  getChipDef,
  getChipEffectAtStars,
  getNextMilestone,
  getChipBP,
  CHIP_MAX_STARS,
} from "@/lib/chip-data";
import SKILL_ICONS from "@/public/skills/index.json";
import EW_ICONS from "@/public/ew/index.json";
import RESEARCH_DATA from "@/lib/research-data.json";
import DECO_DATA from "@/data/extracted/latest/decorations.json";
import DECO_NAMES from "@/data/extracted/latest/decoration_names.json";
import { computeGearSlot, computeSquadExtras, computeUnitPower, computeSquadTroops } from "@/lib/sim/compute";
import { getNodeEffect, CATEGORY_COLOR, CATEGORY_LABEL } from "@/lib/research-effects";
import BUILDINGS_DATA from "@/lib/buildings-data.json";
import { computePlayerStats, TROOP_BASE_POWER } from "@/lib/sim/compute";
import type { TracedPct, TroopTypeStats } from "@/lib/sim/types";

// ── Shared UI helpers ──────────────────────────────────────

function StatBadge({ label, value, color = "var(--gold)" }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 14px", textAlign: "center" }}>
      <div style={{ fontSize: "0.58rem", color: "var(--text-dim)", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: "1.1rem", fontFamily: "monospace", fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  );
}

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: 24, marginBottom: 20 }}>
      <div style={{
        fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em",
        color: accent ?? "var(--text-dim)", textTransform: "uppercase", fontFamily: "monospace",
        marginBottom: 18, paddingBottom: 10, borderBottom: "1px solid var(--border)",
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function BonusInput({ label, hint, value, max = 999, placeholder, onChange }: {
  label: string; hint?: string; value: number; max?: number; placeholder?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
        {label} <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(%)</span>
      </label>
      <input
        type="number" min={0} max={max} value={value || ""}
        onChange={(e) => onChange(Math.max(0, Math.min(max, parseInt(e.target.value) || 0)))}
        placeholder={placeholder ?? "0"}
        style={{
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: 5, padding: "8px 12px", color: "var(--text-primary)",
          fontFamily: "monospace", fontSize: "1rem", outline: "none",
        }}
      />
      {hint && <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>{hint}</div>}
    </div>
  );
}

// ── Buildings types & constants ────────────────────────────

interface BldLevel {
  level: number;
  food: number; gold: number; iron: number; oil: number;
  time: string; power: number;
  bonuses: Record<string, number | string>;
}
interface BldDef {
  id: string; name: string; season: string | null;
  description: string;
  bonusColumns: string[];
  levels: BldLevel[];
}

const ALL_BUILDINGS = BUILDINGS_DATA.buildings as BldDef[];
const BLD_SEASON_TABS = ["Core","S1","S2","S3","S4","S5","S6"] as const;

// Columns relevant to combat power (highlighted in UI)
const BLD_COMBAT_COLS = new Set([
  "Hero Level Cap","Hero Hp","Hero Attack","Hero Defense",
  "Aircraft Hero Hp","Aircraft Hero Attack","Aircraft Hero Defense","Aircraft Hero March Size",
  "Tank Hero Hp","Tank Hero Attack","Tank Hero Defense","Tank Hero March Size",
  "Missile Hero Hp","Missile Hero Attack","Missile Hero Defense","Missile Hero March Size",
]);

const BLD_COL_SHORT: Record<string, string> = {
  "Hero Level Cap": "Hero Lv Cap",
  "Hero Hp": "Hero HP", "Hero Attack": "Hero ATK", "Hero Defense": "Hero DEF",
  "Aircraft Hero Hp": "Air HP", "Aircraft Hero Attack": "Air ATK", "Aircraft Hero Defense": "Air DEF",
  "Aircraft Hero March Size": "Air March",
  "Tank Hero Hp": "Tank HP", "Tank Hero Attack": "Tank ATK", "Tank Hero Defense": "Tank DEF",
  "Tank Hero March Size": "Tank March",
  "Missile Hero Hp": "Msle HP", "Missile Hero Attack": "Msle ATK", "Missile Hero Defense": "Msle DEF",
  "Missile Hero March Size": "Msle March",
  "Unit Training Level": "Troop Tier",
  "Unit Training Cap": "Train Cap",
  "Research Speedup": "Research Spd",
  "Help Received": "Alliance Help",
  "Anti Scout Probability": "Anti-Scout",
  "Scout Level": "Scout Lv",
};

function bldFmtNum(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}G`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}k`;
  return `${n}`;
}

function bldFmtBonus(val: number | string, col: string): string {
  if (typeof val === "string") return val;
  if (col.toLowerCase().includes("hp") && val >= 1000) return bldFmtNum(val);
  if (Number.isInteger(val)) return `${val}`;
  return val.toFixed(1);
}

// ── BuildingsPanel component ────────────────────────────────

function BuildingsPanel({
  buildingLevels,
  onUpdate,
}: {
  buildingLevels: Record<string, number>;
  onUpdate: (id: string, level: number) => void;
}) {
  const [season, setSeason] = useState<typeof BLD_SEASON_TABS[number]>("Core");
  const [expanded, setExpanded] = useState<string | null>(null);

  const buildings = ALL_BUILDINGS.filter(b => (b.season ?? "Core") === season);

  return (
    <div>
      {/* Season tabs */}
      <div style={{ display:"flex", gap:5, overflowX:"auto", paddingBottom:6, marginBottom:14 }}>
        {BLD_SEASON_TABS.map(s => (
          <button key={s} onClick={() => { setSeason(s); setExpanded(null); }} style={{
            flexShrink:0, padding:"4px 12px", borderRadius:20, fontSize:"0.65rem", fontWeight:600,
            background: season===s ? "rgba(245,158,11,0.18)" : "var(--surface-2)",
            border: `1px solid ${season===s ? "var(--gold)" : "var(--border)"}`,
            color: season===s ? "var(--gold)" : "var(--text-dim)",
            cursor:"pointer", fontFamily:"inherit",
          }}>{s}</button>
        ))}
      </div>

      {/* Building list */}
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {buildings.map(b => {
          const maxLv = b.levels.length;
          const curLv = buildingLevels[b.id] ?? 0;
          const isExpanded = expanded === b.id;
          const curData = curLv > 0 ? b.levels[curLv - 1] : null;
          const nextData = curLv < maxLv ? b.levels[curLv] : null;
          const hasCombat = b.bonusColumns.some(c => BLD_COMBAT_COLS.has(c));

          // Top bonuses to show in collapsed view (prefer combat cols)
          const topCols = [
            ...b.bonusColumns.filter(c => BLD_COMBAT_COLS.has(c)),
            ...b.bonusColumns.filter(c => !BLD_COMBAT_COLS.has(c)),
          ].slice(0, 3);

          return (
            <div key={b.id} style={{
              background:"var(--surface-2)", borderRadius:10,
              border: `1px solid ${hasCombat ? "rgba(245,158,11,0.25)" : "var(--border)"}`,
              overflow:"hidden",
            }}>
              {/* Header row */}
              <div
                onClick={() => setExpanded(isExpanded ? null : b.id)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", cursor:"pointer" }}
              >
                {/* Building image */}
                <div style={{
                  width:44, height:44, borderRadius:8, overflow:"hidden", flexShrink:0,
                  border:`1px solid ${hasCombat ? "rgba(245,158,11,0.4)" : "var(--border)"}`,
                  background:"var(--surface)", display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <img
                    src={`/buildings/${b.id}.png`}
                    alt={b.name}
                    style={{ width:"100%", height:"100%", objectFit:"cover",
                      filter: curLv === 0 ? "grayscale(0.8) brightness(0.5)" : "none" }}
                    loading="lazy"
                  />
                </div>

                {/* Name + combat badge */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:2 }}>
                    <span style={{ fontSize:"0.72rem", fontWeight:700, color: hasCombat ? "var(--gold)" : "#fff" }}>
                      {b.name}
                    </span>
                    {hasCombat && (
                      <span style={{ fontSize:"0.45rem", padding:"1px 4px", borderRadius:3,
                        background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.4)",
                        color:"var(--gold)", fontWeight:700, letterSpacing:"0.05em" }}>COMBAT</span>
                    )}
                  </div>
                  {/* Bonus preview */}
                  {curData && (
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {topCols.map(col => {
                        const val = curData.bonuses[col];
                        if (val === undefined || val === 0) return null;
                        const isCombat = BLD_COMBAT_COLS.has(col);
                        return (
                          <span key={col} style={{ fontSize:"0.5rem", color: isCombat ? "#FCD34D" : "var(--text-dim)" }}>
                            {BLD_COL_SHORT[col] ?? col}: <strong>{bldFmtBonus(val, col)}</strong>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {!curData && (
                    <span style={{ fontSize:"0.5rem", color:"var(--text-dim)" }}>Nie zbudowany</span>
                  )}
                </div>

                {/* Level stepper */}
                <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}
                  onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onUpdate(b.id, Math.max(0, curLv - 1))}
                    disabled={curLv <= 0}
                    style={{ width:26, height:26, borderRadius:6, fontSize:"0.9rem", fontWeight:700,
                      background:"var(--surface)", border:"1px solid var(--border)",
                      color:curLv<=0?"var(--text-dim)":"var(--text-secondary)",
                      cursor:curLv<=0?"not-allowed":"pointer", opacity:curLv<=0?0.4:1,
                      display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                  <div style={{ minWidth:38, textAlign:"center" }}>
                    <div style={{ fontSize:"0.75rem", fontWeight:800, fontFamily:"monospace",
                      color: curLv >= maxLv ? "#06B6D4" : curLv > 0 ? "#fff" : "var(--text-dim)" }}>
                      {curLv >= maxLv ? "MAX" : `${curLv}`}
                    </div>
                    <div style={{ fontSize:"0.45rem", color:"var(--text-dim)" }}>/{maxLv}</div>
                  </div>
                  <button
                    onClick={() => onUpdate(b.id, Math.min(maxLv, curLv + 1))}
                    disabled={curLv >= maxLv}
                    style={{ width:26, height:26, borderRadius:6, fontSize:"0.9rem", fontWeight:700,
                      background: curLv>=maxLv ? "var(--surface)" : "rgba(6,182,212,0.15)",
                      border:`1px solid ${curLv>=maxLv?"var(--border)":"#06B6D4"}`,
                      color:curLv>=maxLv?"var(--text-dim)":"#06B6D4",
                      cursor:curLv>=maxLv?"not-allowed":"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                </div>

                {/* Chevron */}
                <span style={{ fontSize:"0.6rem", color:"var(--text-dim)", flexShrink:0,
                  transform: isExpanded?"rotate(180deg)":"none", transition:"transform 0.2s" }}>▼</span>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ borderTop:"1px solid var(--border)", padding:"10px 12px" }}>
                  {/* Level slider */}
                  <div style={{ marginBottom:10 }}>
                    <input type="range" min={0} max={maxLv} value={curLv}
                      onChange={e => onUpdate(b.id, Number(e.target.value))}
                      style={{ width:"100%", accentColor:"var(--gold)" }} />
                    <div style={{ display:"flex", justifyContent:"space-between",
                      fontSize:"0.48rem", color:"var(--text-dim)", marginTop:2 }}>
                      <span>0</span>
                      <span style={{ color:"var(--gold)", fontWeight:700, fontSize:"0.6rem" }}>Lv.{curLv} / {maxLv}</span>
                      <span>MAX</span>
                    </div>
                  </div>

                  {/* All bonuses at current level */}
                  {curData && b.bonusColumns.length > 0 && (
                    <div style={{ marginBottom:10 }}>
                      <div style={{ fontSize:"0.5rem", color:"var(--text-dim)", fontFamily:"monospace",
                        letterSpacing:"0.07em", marginBottom:5 }}>AKTUALNE BONUSY</div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))", gap:4 }}>
                        {b.bonusColumns.map(col => {
                          const val = curData.bonuses[col];
                          const isCombat = BLD_COMBAT_COLS.has(col);
                          return (
                            <div key={col} style={{ padding:"5px 7px", borderRadius:6,
                              background: isCombat ? "rgba(245,158,11,0.08)" : "var(--surface)",
                              border:`1px solid ${isCombat ? "rgba(245,158,11,0.3)" : "var(--border)"}` }}>
                              <div style={{ fontSize:"0.45rem", color:"var(--text-dim)", marginBottom:1 }}>
                                {BLD_COL_SHORT[col] ?? col}
                              </div>
                              <div style={{ fontSize:"0.65rem", fontWeight:700, fontFamily:"monospace",
                                color: isCombat ? "var(--gold)" : "var(--text-secondary)" }}>
                                {val !== undefined ? bldFmtBonus(val, col) : "—"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Next level cost */}
                  {nextData && (
                    <div>
                      <div style={{ fontSize:"0.5rem", color:"var(--text-dim)", fontFamily:"monospace",
                        letterSpacing:"0.07em", marginBottom:5 }}>KOSZT NASTĘPNEGO POZIOMU (Lv.{curLv + 1})</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {[
                          { label:"🌾 Food", val:nextData.food },
                          { label:"⚙ Iron", val:nextData.iron },
                          { label:"💰 Gold", val:nextData.gold },
                          { label:"🛢 Oil",  val:nextData.oil },
                        ].filter(r => r.val > 0).map(r => (
                          <div key={r.label} style={{ padding:"4px 8px", borderRadius:5,
                            background:"var(--surface)", border:"1px solid var(--border)",
                            fontSize:"0.6rem", fontFamily:"monospace" }}>
                            <span style={{ color:"var(--text-dim)" }}>{r.label} </span>
                            <strong style={{ color:"var(--text-secondary)" }}>{bldFmtNum(r.val)}</strong>
                          </div>
                        ))}
                        {nextData.time && nextData.time !== "0" && (
                          <div style={{ padding:"4px 8px", borderRadius:5,
                            background:"var(--surface)", border:"1px solid var(--border)",
                            fontSize:"0.6rem", fontFamily:"monospace" }}>
                            <span style={{ color:"var(--text-dim)" }}>⏱ </span>
                            <strong style={{ color:"var(--text-secondary)" }}>{nextData.time}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {!nextData && curLv >= maxLv && (
                    <div style={{ padding:"8px", borderRadius:6, textAlign:"center",
                      background:"rgba(6,182,212,0.07)", border:"1px solid #06B6D430",
                      color:"#06B6D4", fontSize:"0.65rem", fontWeight:700 }}>✓ Maksymalny poziom</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Research types & constants ─────────────────────────────

interface ResearchLevel {
  level: number; iron: number; food: number; gold: number;
  techCenterLevel: number; researchTime: string;
  requirements: { elementId?: string; id?: string; minLevel?: number; level?: number }[];
}
interface ResearchNode {
  id: string; name: string; image: string; maxLevel: number; effect: string;
  requirements: { id: string; level: number }[];
  levels: ResearchLevel[];
}
interface ResearchRow { id: string; elems: string[]; conns: { from: string; to: string[] }[]; }
interface ResearchTree { id: string; name: string; rows: ResearchRow[]; nodes: ResearchNode[]; }

const R_TREES = RESEARCH_DATA.trees as ResearchTree[];
const R_TREE_NAME: Record<string, string> = Object.fromEntries(R_TREES.map(t => [t.id, t.name]));
const R_TREE_CATEGORIES = [
  { label: "Główne",   ids: ["development", "economy", "hero", "units"] },
  { label: "Drużyny",  ids: ["squad-1", "squad-2", "squad-3", "squad-4"] },
  { label: "Bojowe",   ids: ["special-forces", "siege-to-seize", "defense-fortifications", "alliance-duel"] },
  { label: "Mastery",  ids: ["tank-mastery", "missile-mastery", "aircraft-mastery"] },
  { label: "Sezonowe", ids: ["the-age-of-oil", "tactical-weapon", "intercity-truck", "t10-special-forces"] },
];

const R_NODE_W = 80, R_NODE_H = 92, R_ROW_GAP = 64, R_COL_STEP = 112;
const R_CANVAS_W = R_COL_STEP * 3;
const R_COL_CENTERS = [R_COL_STEP * 0.5, R_COL_STEP * 1.5, R_COL_STEP * 2.5];

function rGetNodePositions(rows: ResearchRow[]): Record<string, { x: number; y: number }> {
  const pos: Record<string, { x: number; y: number }> = {};
  rows.forEach((row, rowIdx) => {
    const count = row.elems.length;
    const y = rowIdx * (R_NODE_H + R_ROW_GAP) + R_NODE_H / 2;
    row.elems.forEach((nodeId, colIdx) => {
      let x: number;
      if (count === 1) x = R_COL_CENTERS[1];
      else if (count === 2) x = colIdx === 0 ? R_COL_CENTERS[0] + 16 : R_COL_CENTERS[2] - 16;
      else x = R_COL_CENTERS[colIdx];
      pos[nodeId] = { x, y };
    });
  });
  return pos;
}

// ── ResearchTreeView (embedded in Profile) ─────────────────

function ResearchTreeViewEmbed({
  tree, researchLevels, onNodeTap,
}: { tree: ResearchTree; researchLevels: Record<string, number>; onNodeTap: (n: ResearchNode) => void }) {
  const nodeMap = Object.fromEntries(tree.nodes.map(n => [n.id, n]));
  const positions = rGetNodePositions(tree.rows);
  const canvasH = tree.rows.length * (R_NODE_H + R_ROW_GAP);

  const lines: { x1: number; y1: number; x2: number; y2: number; done: boolean }[] = [];
  tree.rows.forEach(row => {
    row.conns.forEach(conn => {
      const fromPos = positions[conn.from];
      if (!fromPos) return;
      const fromLv = researchLevels[`${tree.id}/${conn.from}`] ?? 0;
      conn.to.forEach(toId => {
        const toPos = positions[toId];
        if (!toPos) return;
        const toLv = researchLevels[`${tree.id}/${toId}`] ?? 0;
        lines.push({ x1: fromPos.x, y1: fromPos.y + R_NODE_H / 2, x2: toPos.x, y2: toPos.y - R_NODE_H / 2, done: fromLv > 0 && toLv > 0 });
      });
    });
  });

  return (
    <div style={{ overflowX: "auto", paddingBottom: 8 }}>
      <div style={{ position: "relative", width: R_CANVAS_W, height: canvasH, margin: "0 auto" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          {lines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={l.done ? "#06B6D4" : "rgba(255,255,255,0.12)"}
              strokeWidth={l.done ? 2 : 1.5} strokeDasharray={l.done ? "none" : "4 3"} />
          ))}
        </svg>
        {tree.rows.map(row => row.elems.map(nodeId => {
          const node = nodeMap[nodeId]; if (!node) return null;
          const pos = positions[nodeId]; if (!pos) return null;
          const currentLevel = researchLevels[`${tree.id}/${nodeId}`] ?? 0;
          const isMaxed = currentLevel >= node.maxLevel;
          const isStarted = currentLevel > 0;
          return (
            <div key={nodeId} onClick={() => onNodeTap(node)} style={{
              position: "absolute", left: pos.x - R_NODE_W / 2, top: pos.y - R_NODE_H / 2,
              width: R_NODE_W, height: R_NODE_H, borderRadius: 10, cursor: "pointer",
              background: isMaxed ? "rgba(6,182,212,0.15)" : isStarted ? "rgba(6,182,212,0.07)" : "var(--surface-2)",
              border: `1.5px solid ${isMaxed ? "#06B6D4" : isStarted ? "#06B6D450" : "var(--border)"}`,
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "flex-start", padding: "6px 4px 4px", gap: 3,
              transition: "border-color 0.15s, background 0.15s",
              boxShadow: isMaxed ? "0 0 10px #06B6D430" : "none",
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0,
                border: `1px solid ${isMaxed ? "#06B6D460" : "rgba(255,255,255,0.08)"}`,
                filter: currentLevel === 0 ? "grayscale(0.7) brightness(0.65)" : "none",
              }}>
                <img src={node.image} alt={node.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
              </div>
              <div style={{ fontSize: "0.48rem", fontWeight: 600,
                color: isMaxed ? "#06B6D4" : isStarted ? "var(--text-secondary)" : "var(--text-dim)",
                textAlign: "center", lineHeight: 1.25, overflow: "hidden",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                wordBreak: "break-word", maxHeight: 24,
              }}>{node.name}</div>
              {(() => { const eff = getNodeEffect(node.id); return (eff.category === "atk" || eff.category === "def" || eff.category === "hp") ? (
                <div style={{ fontSize: "0.38rem", fontWeight: 800, padding: "1px 4px", borderRadius: 3,
                  background: `${CATEGORY_COLOR[eff.category]}25`, color: CATEGORY_COLOR[eff.category], letterSpacing: "0.04em",
                }}>{CATEGORY_LABEL[eff.category]}{eff.troop && eff.troop !== "all" ? ` ${eff.troop.slice(0,3).toUpperCase()}` : ""}</div>
              ) : null; })()}
              <div style={{ fontSize: "0.52rem", fontFamily: "monospace", fontWeight: 700,
                color: isMaxed ? "#06B6D4" : "var(--text-dim)",
              }}>{isMaxed ? "✓" : `${currentLevel}/${node.maxLevel}`}</div>
              {!isMaxed && node.maxLevel <= 10 && (
                <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                  {Array.from({ length: node.maxLevel }).map((_, i) => (
                    <div key={i} style={{ width: 4, height: 4, borderRadius: 2,
                      background: i < currentLevel ? "#06B6D4" : "rgba(255,255,255,0.15)" }} />
                  ))}
                </div>
              )}
            </div>
          );
        }))}
      </div>
    </div>
  );
}

// ── NodeDetailEmbed (bottom sheet for Research tab) ────────

function NodeDetailEmbed({
  tree, node, currentLevel, onLevelChange, onClose,
}: { tree: ResearchTree; node: ResearchNode; currentLevel: number; onLevelChange: (l: number) => void; onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  function close() { if (closing) return; setClosing(true); setTimeout(onClose, 320); }
  const totalCost = node.levels.slice(currentLevel).reduce(
    (acc, l) => ({ iron: acc.iron + l.iron, food: acc.food + l.food, gold: acc.gold + l.gold }),
    { iron: 0, food: 0, gold: 0 }
  );
  return (
    <>
      <style>{`@keyframes rndUp{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes rndDown{from{transform:translateY(0)}to{transform:translateY(100%)}}@keyframes rbdIn{from{opacity:0}to{opacity:1}}@keyframes rbdOut{from{opacity:1}to{opacity:0}}`}</style>
      <div onClick={close} style={{ position:"fixed", inset:0, zIndex:90, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(2px)", animation: closing?"rbdOut 0.3s both":"rbdIn 0.2s both" }} />
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:100, background:"var(--surface)", borderTop:"2px solid var(--border)", borderRadius:"14px 14px 0 0", maxHeight:"70vh", overflow:"hidden", display:"flex", flexDirection:"column", animation: closing?"rndDown 0.32s cubic-bezier(0.32,0,0.67,0) both":"rndUp 0.38s cubic-bezier(0.32,0.72,0,1) both" }}>
        <div style={{ padding:"12px 16px 0", flexShrink:0 }}>
          <div style={{ width:40, height:4, borderRadius:2, background:"rgba(255,255,255,0.15)", margin:"0 auto 14px" }} />
          <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
            <div style={{ width:52, height:52, borderRadius:10, overflow:"hidden", border:"1px solid var(--border)", flexShrink:0 }}>
              <img src={node.image} alt={node.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"1rem", fontWeight:800, color:"#fff" }}>{node.name}</div>
              <div style={{ fontSize:"0.6rem", color:"var(--text-dim)", marginTop:2 }}>{tree.name} · Max Lv.{node.maxLevel}</div>
              {(() => { const eff = getNodeEffect(node.id); return eff.category !== "other" ? (
                <div style={{ marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ fontSize:"0.55rem", fontWeight:700, padding:"1px 6px", borderRadius:4,
                    background:`${CATEGORY_COLOR[eff.category]}20`, border:`1px solid ${CATEGORY_COLOR[eff.category]}50`, color:CATEGORY_COLOR[eff.category] }}>{CATEGORY_LABEL[eff.category]}</span>
                  <span style={{ fontSize:"0.58rem", color:"var(--text-secondary)" }}>{eff.effect}</span>
                </div>
              ) : null; })()}
            </div>
            <button onClick={close} style={{ width:32, height:32, borderRadius:8, background:"var(--surface-2)", border:"1px solid var(--border)", color:"var(--text-dim)", cursor:"pointer", fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
        </div>
        <div style={{ overflowY:"auto", padding:"0 16px 24px", flex:1 }}>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:"0.6rem", color:"var(--text-dim)", fontFamily:"monospace", letterSpacing:"0.06em", marginBottom:8 }}>AKTUALNY POZIOM</div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button onClick={() => onLevelChange(Math.max(0, currentLevel-1))} style={{ width:36, height:36, borderRadius:8, fontSize:"1.2rem", fontWeight:700, background:"var(--surface-2)", border:"1px solid var(--border)", color:currentLevel<=0?"var(--text-dim)":"var(--text-secondary)", cursor:currentLevel<=0?"not-allowed":"pointer", opacity:currentLevel<=0?0.4:1, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
              <div style={{ flex:1 }}>
                <input type="range" min={0} max={node.maxLevel} value={currentLevel} onChange={e=>onLevelChange(Number(e.target.value))} style={{ width:"100%" }} />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.5rem", color:"var(--text-dim)" }}>
                  <span>0</span><span style={{ fontSize:"0.7rem", fontWeight:700, color:"#06B6D4" }}>Lv.{currentLevel} / {node.maxLevel}</span><span>MAX</span>
                </div>
              </div>
              <button onClick={() => onLevelChange(Math.min(node.maxLevel, currentLevel+1))} style={{ width:36, height:36, borderRadius:8, fontSize:"1.2rem", fontWeight:700, background:currentLevel>=node.maxLevel?"var(--surface-2)":"rgba(6,182,212,0.15)", border:`1px solid ${currentLevel>=node.maxLevel?"var(--border)":"#06B6D4"}`, color:currentLevel>=node.maxLevel?"var(--text-dim)":"#06B6D4", cursor:currentLevel>=node.maxLevel?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
            </div>
          </div>
          {currentLevel < node.maxLevel && (
            <div style={{ padding:"10px 14px", borderRadius:8, background:"var(--surface-2)", border:"1px solid var(--border)", display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, fontSize:"0.6rem" }}>
              {totalCost.iron>0&&<div style={{textAlign:"center"}}><div style={{color:"var(--text-dim)",marginBottom:2}}>⚙ Iron</div><div style={{fontFamily:"monospace",fontWeight:700}}>{totalCost.iron.toLocaleString()}</div></div>}
              {totalCost.food>0&&<div style={{textAlign:"center"}}><div style={{color:"var(--text-dim)",marginBottom:2}}>🌾 Food</div><div style={{fontFamily:"monospace",fontWeight:700}}>{totalCost.food.toLocaleString()}</div></div>}
              {totalCost.gold>0&&<div style={{textAlign:"center"}}><div style={{color:"var(--text-dim)",marginBottom:2}}>💰 Gold</div><div style={{fontFamily:"monospace",fontWeight:700}}>{totalCost.gold.toLocaleString()}</div></div>}
            </div>
          )}
          {currentLevel >= node.maxLevel && (
            <div style={{ padding:"12px", borderRadius:8, background:"rgba(6,182,212,0.08)", border:"1px solid #06B6D440", textAlign:"center", color:"#06B6D4", fontSize:"0.7rem", fontWeight:700 }}>✓ Zmaxowany</div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Tab bar ───────────────────────────────────────────────

const TABS = [
  { id: "core",     label: "Profile",  icon: "👤" },
  { id: "heroes",   label: "Heroes",   icon: "🦸" },
  { id: "drone",    label: "Drone",    icon: "🤖" },
  { id: "squads",   label: "Squads",   icon: "⚔" },
  { id: "research",  label: "Badania",  icon: "🔬" },
  { id: "buildings", label: "Budynki",  icon: "🏗️" },
  { id: "military",  label: "Military", icon: "🪖" },
  { id: "economy",  label: "Economy",  icon: "📊" },
] as const;

type TabId = typeof TABS[number]["id"];

// ── Hero gear slot picker (redesigned — readable) ─────────

const QUALITY_LABELS_FULL: Record<GearQuality, string> = {
  none:      "None",
  common:    "Common",
  rare:      "Rare",
  epic:      "Epic",
  legendary: "Leg.",
  mythic:    "Mythic",
};

const SKIN_LIST: { id: number; name: string; wear: string; gain: string }[] = (() => {
  const names = new Map((DECO_NAMES.records as { id: number; name: string }[]).map(r => [r.id, r.name]));
  const pc = (v: number | null) => (v ? Math.round(v * 1000) / 10 : 0);
  return (DECO_DATA.records as { id: number; type: number; effect_wear: string | null; hp_pct_bonus: number | null; atk_pct_bonus: number | null; def_pct_bonus: number | null }[])
    .filter(r => r.type === 1 && (r.hp_pct_bonus || r.atk_pct_bonus || r.def_pct_bonus || r.effect_wear))
    .map(r => {
      const wear = (r.effect_wear ?? "").split("|").filter(Boolean).map(x => { const [sid, v] = x.split(";"); const n = ({ "75050": "HP", "75150": "ATK", "75250": "DEF" } as Record<string, string>)[sid]; return n ? `${n} ${Math.round(parseFloat(v) * 1000) / 10}%` : ""; }).filter(Boolean).join("+");
      const gain = [["HP", r.hp_pct_bonus], ["ATK", r.atk_pct_bonus], ["DEF", r.def_pct_bonus]].filter(([, v]) => v).map(([n, v]) => `${n} ${pc(v as number)}%`).join("+");
      return { id: r.id, name: names.get(r.id) ?? String(r.id), wear: wear || "—", gain };
    });
})();

function GearSlotPicker({ slot, data, onChange, recommended }: {
  slot: GearType;
  data: HeroGearSlot;
  onChange: (d: HeroGearSlot) => void;
  recommended?: boolean;
}) {
  const qualityColor = GEAR_QUALITY_COLORS[data.quality];
  const hasGear = data.quality !== "none";

  return (
    <div style={{
      background: "rgba(0,0,0,0.35)",
      border: `1px solid ${hasGear ? qualityColor + "55" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img src={GEAR_ICON_URLS[slot]} alt={slot} width={30} height={30} style={{ objectFit: "contain" }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: hasGear ? qualityColor : "var(--text-secondary)" }}>{slot}</div>
          {recommended && <div style={{ fontSize: "0.6rem", color: "#e07820", letterSpacing: "0.04em", marginTop: 1 }}>★ RECOMMENDED</div>}
        </div>
        {hasGear && (
          <div style={{ fontSize: "1rem", fontWeight: 800, fontFamily: "monospace", color: qualityColor }}>
            Lv.{data.level}
          </div>
        )}
      </div>

      {/* Quality pills */}
      <div style={{ display: "flex", gap: 4 }}>
        {GEAR_QUALITIES.map((q) => (
          <button key={q} onClick={() => onChange({ ...data, quality: q })} style={{
            flex: 1, padding: "5px 2px", borderRadius: 5,
            fontSize: "0.58rem", fontWeight: 700,
            background: data.quality === q ? GEAR_QUALITY_COLORS[q] + "28" : "rgba(255,255,255,0.04)",
            border: `1px solid ${data.quality === q ? GEAR_QUALITY_COLORS[q] : "rgba(255,255,255,0.09)"}`,
            color: data.quality === q ? GEAR_QUALITY_COLORS[q] : "rgba(255,255,255,0.3)",
            cursor: "pointer", transition: "all 0.1s", whiteSpace: "nowrap", overflow: "hidden",
          }}>
            {QUALITY_LABELS_FULL[q]}
          </button>
        ))}
      </div>

      {/* Level input */}
      {hasGear && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.68rem", color: "var(--text-dim)", minWidth: 16 }}>Lv</span>
          <input
            type="number" min={0} max={40} value={data.level || ""}
            onChange={(e) => onChange({ ...data, level: Math.max(0, Math.min(40, parseInt(e.target.value) || 0)) })}
            placeholder="0"
            style={{
              flex: 1, background: "rgba(0,0,0,0.4)", border: `1px solid ${qualityColor}45`,
              borderRadius: 6, padding: "7px 10px", color: qualityColor,
              fontFamily: "monospace", fontSize: "1.05rem", fontWeight: 700, outline: "none", textAlign: "center",
            }}
          />
          <span style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>/40</span>
        </div>
      )}

      {/* Promocja X/25 (kupowane poziomy promocji; ★ = floor(X/5)) */}
      {hasGear && (() => {
        const eff = data.tier ?? Math.min(4, Math.floor(Math.max(0, data.level) / 10)) + 5 * (data.stars ?? 0);
        const g = (data.quality === "legendary" || data.quality === "mythic" || data.quality === "epic")
          ? computeGearSlot({ ...data, tier: data.quality === "epic" ? undefined : eff }, slot) : null;
        const pct = (v: number) => `${Math.round(v * 10000) / 100}%`;
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "0.68rem", color: "var(--text-dim)", minWidth: 62 }}>Promocja</span>
              <input
                type="number" min={0} max={25} value={eff}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(25, parseInt(e.target.value) || 0));
                  onChange({ ...data, tier: v, stars: Math.min(5, Math.floor(v / 5)) });
                }}
                style={{
                  flex: 1, background: "rgba(0,0,0,0.4)", border: `1px solid ${qualityColor}45`,
                  borderRadius: 6, padding: "5px 10px", color: qualityColor,
                  fontFamily: "monospace", fontSize: "0.95rem", fontWeight: 700, outline: "none", textAlign: "center",
                }}
              />
              <span style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>/25 · ★{Math.min(5, Math.floor(eff / 5))}</span>
            </div>
            {g && (
              <div style={{ fontSize: "0.6rem", fontFamily: "monospace", color: "var(--text-dim)" }}>
                {[g.atkPct && `ATK ${pct(g.atkPct)}`, g.hpPct && `HP ${pct(g.hpPct)}`, g.defPct && `DEF ${pct(g.defPct)}`].filter(Boolean).join(" · ")}
                {g.flatAtk ? ` · +${Math.round(g.flatAtk)} ATK` : ""}{g.flatHp ? ` · +${Math.round(g.flatHp)} HP` : ""}{g.flatDef ? ` · +${Math.round(g.flatDef)} DEF` : ""}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ── Hero card constants ────────────────────────────────────

const RARITY_BG: Record<string, string> = {
  UR:  "linear-gradient(170deg, #6b3200 0%, #3a1a00 100%)",
  SSR: "linear-gradient(170deg, #2e1a5e 0%, #180d38 100%)",
  SR:  "linear-gradient(170deg, #0d2348 0%, #061220 100%)",
};
const RARITY_BORDER: Record<string, string> = {
  UR:  "#e07820",
  SSR: "#7c4dcc",
  SR:  "#3B82F6",
};
const RARITY_TEXT_COLOR: Record<string, string> = {
  UR:  "#FFB627",
  SSR: "#C084FC",
  SR:  "#60A5FA",
};
const RARITY_GLOW: Record<string, string> = {
  UR:  "#FF8C00",
  SSR: "#7B2FBE",
  SR:  "#1D4ED8",
};

// ── Compact hero card (click = select, no inline expansion) ─

function HeroCard({ hero, data, selected, onSelect, onChange }: {
  hero: HeroDef;
  data: HeroSave;
  selected: boolean;
  onSelect: () => void;
  onChange: (d: HeroSave) => void;
}) {
  const owned = data.owned;
  const borderColor = selected ? "#FFD700" : owned ? RARITY_BORDER[hero.rarity] : "#252b40";

  return (
    <div
      onClick={() => owned ? onSelect() : undefined}
      style={{
        position: "relative",
        borderRadius: 9,
        border: `2px solid ${borderColor}`,
        background: owned ? RARITY_BG[hero.rarity] : "#0d1117",
        overflow: "hidden",
        cursor: owned ? "pointer" : "default",
        aspectRatio: "3/4",
        filter: owned ? "none" : "grayscale(80%) brightness(0.35)",
        transition: "border-color 0.15s, box-shadow 0.15s, filter 0.2s",
        boxShadow: selected
          ? `0 0 18px #FFD70050, 0 0 6px #FFD70030`
          : owned ? `0 0 8px ${borderColor}30` : "none",
      }}
    >
      {/* Portrait */}
      <img src={hero.portraitUrl} alt={hero.name}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />

      {/* Type icon — top left */}
      <div style={{
        position: "absolute", top: 5, left: 5,
        width: 24, height: 24, borderRadius: 5,
        background: "rgba(0,0,0,0.72)", display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${borderColor}70`,
      }}>
        <img src={TYPE_ICON_URLS[hero.type]} alt={hero.type} width={16} height={16} style={{ objectFit: "contain" }} />
      </div>

      {/* Rarity — top right */}
      <div style={{ position: "absolute", top: 4, right: 7 }}>
        <span style={{
          fontSize: "0.78rem", fontWeight: 900, fontStyle: "italic",
          color: RARITY_TEXT_COLOR[hero.rarity] ?? "#C084FC",
          textShadow: `0 0 7px ${RARITY_GLOW[hero.rarity] ?? "#7B2FBE"}`,
          fontFamily: "Georgia, serif",
        }}>{hero.rarity}</span>
      </div>

      {/* Bottom: name + stars */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(transparent, rgba(0,0,0,0.92) 45%)",
        padding: "20px 7px 7px",
      }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#fff", textShadow: "0 1px 4px #000", marginBottom: 3 }}>
          {hero.name}
        </div>
        <div style={{ display: "flex", gap: 1 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} style={{
              fontSize: "0.62rem",
              color: owned && s <= data.stars ? "#FFD700" : "rgba(255,255,255,0.15)",
              textShadow: "0 1px 2px #000",
            }}>★</span>
          ))}
        </div>
      </div>

      {/* Not owned overlay */}
      {!owned && (
        <button
          onClick={(e) => { e.stopPropagation(); onChange({ ...data, owned: true }); }}
          style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span style={{
            fontSize: "0.72rem", fontWeight: 700, color: "#fff",
            background: "rgba(0,0,0,0.65)", padding: "4px 10px", borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.25)",
          }}>+ Add</span>
        </button>
      )}
    </div>
  );
}

// ── Hero detail panel — full width, below the grid ─────────

function HeroDetailPanel({ hero, data, onChange, onClose, hqLevel }: {
  hero: HeroDef;
  data: HeroSave;
  onChange: (d: HeroSave) => void;
  onClose: () => void;
  hqLevel: number;
}) {
  const [closing, setClosing] = useState(false);
  const borderColor = RARITY_BORDER[hero.rarity];

  function triggerClose() {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 380);
  }

  function setGear(slot: GearType, g: HeroGearSlot) {
    onChange({ ...data, gear: { ...data.gear, [slot]: g } });
  }

  const levelCap = getHeroLevelCap(hqLevel);
  const heroLevel = data.level ?? 1;
  const skillLevels = data.skillLevels ?? [1, 1, 1];
  const ewLevel = data.exclusiveWeaponLevel ?? 0;
  const skillCap = getSkillLevelCap(data.stars, ewLevel);
  const expertiseUnlocked = isExpertiseUnlocked(data.stars);
  const heroRarity = (hero.rarity === "SR" ? "SR" : hero.rarity === "SSR" ? "SSR" : "UR") as "UR" | "SSR" | "SR";

  return (
    <>
      {/* Keyframe animations */}
      <style>{`
        @keyframes lwDrawerUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes lwDrawerDown {
          from { transform: translateY(0); }
          to   { transform: translateY(100%); }
        }
        @keyframes lwBackdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lwBackdropOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={triggerClose}
        style={{
          animation: closing
            ? "lwBackdropOut 0.35s ease-in both"
            : "lwBackdropIn 0.28s ease-out both",
          position: "fixed", inset: 0, zIndex: 90,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)",
        }}
      />

      {/* Drawer — slides up from bottom */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "var(--surface)",
        borderTop: `3px solid ${borderColor}`,
        borderRadius: "16px 16px 0 0",
        padding: "0 0 env(safe-area-inset-bottom)",
        maxHeight: "75vh",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: `0 -8px 40px ${borderColor}40, 0 -2px 0 ${borderColor}70`,
        animation: closing
          ? "lwDrawerDown 0.38s cubic-bezier(0.32, 0, 0.67, 0) both"
          : "lwDrawerUp 0.45s cubic-bezier(0.32, 0.72, 0, 1) both",
      }}>
        {/* Drag handle + header */}
        <div style={{
          padding: "12px 16px 0",
          background: `linear-gradient(180deg, ${borderColor}12 0%, transparent 100%)`,
          flexShrink: 0,
        }}>
          {/* Handle bar */}
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 14px" }} />

          {/* Hero header */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 14 }}>
            <div style={{
              width: 72, height: 88, borderRadius: 8, overflow: "hidden", flexShrink: 0,
              border: `2px solid ${borderColor}`, boxShadow: `0 0 12px ${borderColor}50`,
            }}>
              <img src={hero.portraitUrl} alt={hero.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>{hero.name}</span>
                <span style={{
                  fontSize: "0.9rem", fontWeight: 900, fontStyle: "italic", fontFamily: "Georgia, serif",
                  color: RARITY_TEXT_COLOR[hero.rarity] ?? "#C084FC",
                  textShadow: `0 0 6px ${RARITY_GLOW[hero.rarity] ?? "#7B2FBE"}`,
                }}>{hero.rarity}</span>
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontStyle: "italic", marginBottom: 8 }}>{hero.title}</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <img src={TYPE_ICON_URLS[hero.type]} alt={hero.type} width={16} height={16} style={{ objectFit: "contain" }} />
                <span style={{ fontSize: "0.72rem", fontWeight: 600, color: TYPE_COLORS[hero.type] }}>{hero.type}</span>
                <span style={{ color: "var(--border)" }}>·</span>
                <img src={ROLE_ICON_URLS[hero.role]} alt={hero.role} width={14} height={14} style={{ objectFit: "contain" }} />
                <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{hero.role}</span>
              </div>
            </div>
            <button onClick={triggerClose} style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: 8,
              background: "var(--surface-2)", border: "1px solid var(--border)",
              color: "var(--text-dim)", cursor: "pointer", fontSize: "1.1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>

          {/* Stars + Remove */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.62rem", color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.06em", marginRight: 4 }}>STARS</span>
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => onChange({ ...data, stars: s })} style={{
                width: 36, height: 30, borderRadius: 6, fontSize: "0.75rem", fontWeight: 700,
                background: s <= data.stars ? "rgba(255,215,0,0.14)" : "var(--surface-2)",
                border: `1px solid ${s <= data.stars ? "#FFD700" : "var(--border)"}`,
                color: s <= data.stars ? "#FFD700" : "var(--text-dim)",
                cursor: "pointer", transition: "all 0.1s",
              }}>★</button>
            ))}
            <button
              onClick={() => { onChange({ ...data, owned: false }); triggerClose(); }}
              style={{
                marginLeft: "auto", fontSize: "0.7rem", padding: "5px 12px", borderRadius: 6,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
                color: "#EF4444", cursor: "pointer", fontFamily: "inherit",
              }}
            >✕ Remove</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", padding: "0 16px 24px", flex: 1 }}>

          {/* ── Hero Level ── */}
          <div style={{ marginBottom: 16 }}>
            <style>{`
              .lw-level-slider {
                -webkit-appearance: none;
                appearance: none;
                width: 100%;
                height: 6px;
                border-radius: 3px;
                outline: none;
                cursor: pointer;
                background: linear-gradient(
                  to right,
                  ${borderColor} 0%,
                  ${borderColor} ${Math.round(((heroLevel - 1) / (levelCap - 1)) * 100)}%,
                  var(--surface-2) ${Math.round(((heroLevel - 1) / (levelCap - 1)) * 100)}%,
                  var(--surface-2) 100%
                );
              }
              .lw-level-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: ${borderColor};
                box-shadow: 0 0 8px ${borderColor}80;
                border: 2px solid #fff2;
                cursor: pointer;
              }
              .lw-level-slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: ${borderColor};
                box-shadow: 0 0 8px ${borderColor}80;
                border: 2px solid #fff2;
                cursor: pointer;
              }
            `}</style>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.06em" }}>POZIOM BOHATERA</span>
              <span style={{ fontSize: "1.1rem", fontWeight: 900, color: borderColor, fontFamily: "monospace" }}>Lv.{heroLevel}</span>
            </div>
            <input
              type="range"
              className="lw-level-slider"
              min={1}
              max={levelCap}
              value={heroLevel}
              onChange={e => onChange({ ...data, level: Number(e.target.value) })}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: "0.5rem", color: "var(--text-dim)" }}>Lv.1</span>
              <span style={{ fontSize: "0.5rem", color: "var(--text-dim)" }}>Max: Lv.{levelCap} (HQ {hqLevel})</span>
            </div>
          </div>

          {/* ── Exclusive Weapon (EW) — UR only ── */}
          {hero.rarity === "UR" && (() => {
            const ewColor = "#A78BFA";
            const isEWUnlockable = data.stars >= 5;
            const currentEW = data.exclusiveWeaponLevel ?? 0;
            const nextMilestone = EW_MILESTONES.find(m => m.level > currentEW);
            const shardsTotal = currentEW > 0 ? getEWShardsToLevel(currentEW) : 0;
            const shardsToNext = nextMilestone ? getEWShardsRange(currentEW, nextMilestone.level) : 0;

            return (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.6rem", color: ewColor, fontFamily: "monospace", letterSpacing: "0.06em" }}>
                    ⚔ BROŃ EKSKLUZYWNA
                  </span>
                  <span style={{ fontSize: "0.6rem", color: "var(--text-dim)" }}>
                    {isEWUnlockable
                      ? (currentEW > 0 ? `${shardsTotal.toLocaleString()} odłamków zainwestowanych` : "Nie odblokowana · Wymaga 50 nazwanych odłamków")
                      : "Wymaga 5★ UR"}
                  </span>
                </div>

                {/* Milestone badges */}
                {(() => {
                  const heroEWIcons = (EW_ICONS as Record<string, Record<string, string>>)[hero.id] ?? {};
                  const MILESTONE_KEY: Record<number, string> = { 1: "lv1", 10: "lv10", 20: "lv20", 30: "lv30" };
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10 }}>
                      {EW_MILESTONES.map(m => {
                        const reached = currentEW >= m.level;
                        const isNext = nextMilestone?.level === m.level;
                        const iconUrl = heroEWIcons[MILESTONE_KEY[m.level]];
                        return (
                          <div key={m.level} style={{
                            padding: "6px 8px", borderRadius: 7,
                            background: reached ? `${ewColor}14` : isNext ? "rgba(167,139,250,0.05)" : "var(--surface-2)",
                            border: `1px solid ${reached ? ewColor : isNext ? ewColor + "50" : "var(--border)"}`,
                            display: "flex", gap: 8, alignItems: "center",
                          }}>
                            {/* Skill icon */}
                            {iconUrl ? (
                              <div style={{
                                width: 36, height: 36, borderRadius: 6, overflow: "hidden", flexShrink: 0,
                                border: `1px solid ${reached ? ewColor + "80" : "var(--border)"}`,
                                opacity: reached ? 1 : 0.4,
                                filter: reached ? "none" : "grayscale(1)",
                              }}>
                                <img src={iconUrl} alt={`EW Lv.${m.level}`}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              </div>
                            ) : (
                              <div style={{
                                width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                                background: `${ewColor}15`, border: `1px solid ${ewColor}30`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "1.1rem", opacity: reached ? 1 : 0.35,
                              }}>⚔</div>
                            )}
                            {/* Text */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: "0.58rem", fontWeight: 700,
                                color: reached ? ewColor : isNext ? ewColor + "cc" : "var(--text-dim)",
                                marginBottom: 1,
                              }}>
                                Lv.{m.level}
                                {reached && <span style={{ marginLeft: 4 }}>✓</span>}
                              </div>
                              <div style={{
                                fontSize: "0.52rem",
                                color: reached ? "var(--text-secondary)" : "var(--text-dim)",
                                lineHeight: 1.3,
                              }}>{m.label}</div>
                            </div>
                            {/* Shard cost to reach this milestone */}
                            {isNext && currentEW > 0 && (
                              <div style={{
                                flexShrink: 0, fontSize: "0.54rem", fontFamily: "monospace",
                                color: ewColor, background: `${ewColor}18`,
                                padding: "2px 6px", borderRadius: 4,
                              }}>
                                −{shardsToNext}
                              </div>
                            )}
                            {!reached && !isNext && m.level > 1 && (
                              <div style={{
                                flexShrink: 0, fontSize: "0.52rem", fontFamily: "monospace",
                                color: "var(--text-dim)",
                              }}>
                                {getEWShardsRange(currentEW, m.level)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {currentEW === 30 && (
                        <div style={{
                          fontSize: "0.54rem", padding: "5px 8px", borderRadius: 6,
                          background: `${ewColor}10`, border: `1px solid ${ewColor}50`,
                          color: ewColor,
                        }}>
                          ✓ MAX · Over-cap odblokowane: ATK → HP → DEF (50 lvl × 10 odłamków każda)
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Stepper */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: isEWUnlockable ? 1 : 0.4 }}>
                  <button
                    onClick={() => { if (isEWUnlockable) onChange({ ...data, exclusiveWeaponLevel: Math.max(0, currentEW - 1) }); }}
                    style={{
                      width: 34, height: 34, borderRadius: 8, fontSize: "1.1rem", fontWeight: 700,
                      background: "var(--surface-2)", border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                      cursor: (!isEWUnlockable || currentEW <= 0) ? "not-allowed" : "pointer",
                      opacity: (!isEWUnlockable || currentEW <= 0) ? 0.35 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>−</button>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: 900, color: currentEW > 0 ? ewColor : "var(--text-dim)" }}>
                      {currentEW === 0 ? "—" : `Lv.${currentEW}`}
                    </span>
                    {currentEW > 0 && currentEW < 30 && (
                      <div style={{ height: 3, background: "var(--surface-2)", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 2,
                          background: `linear-gradient(90deg, ${ewColor}80, ${ewColor})`,
                          width: `${Math.round((currentEW / 30) * 100)}%`,
                        }} />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { if (isEWUnlockable) onChange({ ...data, exclusiveWeaponLevel: Math.min(30, currentEW + 1) }); }}
                    style={{
                      width: 34, height: 34, borderRadius: 8, fontSize: "1.1rem", fontWeight: 700,
                      background: (!isEWUnlockable || currentEW >= 30) ? "var(--surface-2)" : `${ewColor}20`,
                      border: `1px solid ${(!isEWUnlockable || currentEW >= 30) ? "var(--border)" : ewColor}`,
                      color: (!isEWUnlockable || currentEW >= 30) ? "var(--text-dim)" : ewColor,
                      cursor: (!isEWUnlockable || currentEW >= 30) ? "not-allowed" : "pointer",
                      opacity: (!isEWUnlockable || currentEW >= 30) ? 0.35 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>+</button>
                  <button
                    onClick={() => { if (isEWUnlockable) onChange({ ...data, exclusiveWeaponLevel: 30 }); }}
                    style={{
                      fontSize: "0.58rem", padding: "5px 8px", borderRadius: 6,
                      background: "var(--surface-2)", border: "1px solid var(--border)",
                      color: "var(--text-dim)", cursor: isEWUnlockable ? "pointer" : "not-allowed",
                      fontFamily: "inherit", whiteSpace: "nowrap",
                      opacity: isEWUnlockable ? 1 : 0.4,
                    }}>MAX</button>
                </div>
              </div>
            );
          })()}

          {/* ── Skills — 2×2 grid matching game UI ── */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.06em" }}>UMIEJĘTNOŚCI</span>
              <span style={{ fontSize: "0.6rem", color: "var(--text-dim)" }}>
                Cap: Lv.{skillCap}{SKILL_CAP_UNLOCK_LABEL[skillCap] ? ` · ${SKILL_CAP_UNLOCK_LABEL[skillCap]}` : ""}
              </span>
            </div>

            {/* 2×2 grid: [Auto, Tactics] / [Passive, Expertise] */}
            {(() => {
              const heroSkillIcons = (SKILL_ICONS as Record<string, Record<string, string>>)[hero.id] ?? {};
              // Slot order in the grid: auto (0), tactics (1), passive (2), expertise
              const SKILL_KEY_MAP: Record<string, string> = { auto: "auto", tactics: "tactics", passive: "passive" };

              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {HERO_SKILL_SLOTS.map((slot) => {
                    const currentLevel = skillLevels[slot.index] ?? 1;
                    const isMaxed = currentLevel >= skillCap;
                    const nextCost = !isMaxed ? getSkillMedalCost(heroRarity, currentLevel) : 0;
                    const isMilestone = [5, 10, 20, 30, 33, 36, 40].includes(currentLevel);
                    const iconUrl = heroSkillIcons[SKILL_KEY_MAP[slot.key]];

                    return (
                      <div key={slot.key} style={{
                        background: "var(--surface-2)", borderRadius: 10, padding: "10px 12px",
                        border: `1px solid ${isMilestone ? slot.color + "70" : "var(--border)"}`,
                        display: "flex", flexDirection: "column", gap: 8,
                      }}>
                        {/* Skill icon + name */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {iconUrl ? (
                            <div style={{
                              width: 40, height: 40, borderRadius: 8, overflow: "hidden", flexShrink: 0,
                              border: `2px solid ${slot.color}50`,
                              boxShadow: `0 0 8px ${slot.color}30`,
                            }}>
                              <img src={iconUrl} alt={slot.nameEN}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                          ) : (
                            <div style={{
                              width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                              background: `${slot.color}15`, border: `2px solid ${slot.color}40`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "1.3rem",
                            }}>{slot.icon}</div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: slot.color, lineHeight: 1.2 }}>{slot.namePL}</div>
                            <div style={{ fontSize: "0.48rem", color: "var(--text-dim)", lineHeight: 1.2 }}>{slot.nameEN}</div>
                          </div>
                        </div>
                        {/* Level display */}
                        <div style={{ textAlign: "center" }}>
                          <span style={{
                            fontSize: "1.6rem", fontWeight: 900, lineHeight: 1,
                            color: isMilestone ? "#FFD700" : "#fff",
                            textShadow: isMilestone ? "0 0 8px #FFD70060" : "none",
                          }}>Lv.{currentLevel}</span>
                        </div>
                        {/* Next cost hint */}
                        <div style={{ fontSize: "0.48rem", color: "var(--text-dim)", textAlign: "center", minHeight: 12 }}>
                          {isMaxed
                            ? <span style={{ color: slot.color }}>✓ MAX</span>
                            : <span>🏅 {nextCost.toLocaleString()} → Lv.{currentLevel + 1}</span>
                          }
                        </div>
                        {/* +/- controls */}
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={() => {
                              const next = [...skillLevels] as [number, number, number];
                              next[slot.index] = Math.max(1, currentLevel - 1);
                              onChange({ ...data, skillLevels: next });
                            }}
                            style={{
                              flex: 1, height: 30, borderRadius: 7, fontSize: "1rem", fontWeight: 700,
                              background: "var(--surface)", border: "1px solid var(--border)",
                              color: "var(--text-secondary)", cursor: currentLevel <= 1 ? "not-allowed" : "pointer",
                              opacity: currentLevel <= 1 ? 0.35 : 1,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>−</button>
                          <button
                            onClick={() => {
                              const next = [...skillLevels] as [number, number, number];
                              next[slot.index] = Math.min(skillCap, currentLevel + 1);
                              onChange({ ...data, skillLevels: next });
                            }}
                            style={{
                              flex: 1, height: 30, borderRadius: 7, fontSize: "1rem", fontWeight: 700,
                              background: isMaxed ? "var(--surface)" : `${slot.color}20`,
                              border: `1px solid ${isMaxed ? "var(--border)" : slot.color}`,
                              color: isMaxed ? "var(--text-dim)" : slot.color,
                              cursor: isMaxed ? "not-allowed" : "pointer",
                              opacity: isMaxed ? 0.35 : 1,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>+</button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Expertise — 4th cell, fixed at 4★ */}
                  {(() => {
                    const exIcon = heroSkillIcons["expertise"];
                    return (
                      <div style={{
                        background: expertiseUnlocked ? "rgba(253,211,77,0.06)" : "var(--surface-2)",
                        borderRadius: 10, padding: "10px 12px",
                        border: `1px solid ${expertiseUnlocked ? "#FCD34D50" : "var(--border)"}`,
                        opacity: expertiseUnlocked ? 1 : 0.45,
                        display: "flex", flexDirection: "column", gap: 8,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {exIcon ? (
                            <div style={{
                              width: 40, height: 40, borderRadius: 8, overflow: "hidden", flexShrink: 0,
                              border: `2px solid ${expertiseUnlocked ? "#FCD34D50" : "var(--border)"}`,
                              boxShadow: expertiseUnlocked ? "0 0 8px #FCD34D30" : "none",
                            }}>
                              <img src={exIcon} alt="Expertise"
                                style={{ width: "100%", height: "100%", objectFit: "cover",
                                  filter: expertiseUnlocked ? "none" : "grayscale(1) brightness(0.5)" }} />
                            </div>
                          ) : (
                            <div style={{
                              width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                              background: expertiseUnlocked ? "rgba(253,211,77,0.12)" : "var(--surface)",
                              border: `2px solid ${expertiseUnlocked ? "#FCD34D40" : "var(--border)"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "1.3rem",
                            }}>🔮</div>
                          )}
                          <div>
                            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: expertiseUnlocked ? "#FCD34D" : "var(--text-dim)", lineHeight: 1.2 }}>Ekspertyza</div>
                            <div style={{ fontSize: "0.48rem", color: "var(--text-dim)", lineHeight: 1.2 }}>Expertise</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <span style={{ fontSize: "1.6rem", fontWeight: 900, color: expertiseUnlocked ? "#FCD34D" : "var(--text-dim)" }}>
                            {expertiseUnlocked ? "✓" : "🔒"}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.48rem", color: "var(--text-dim)", textAlign: "center", minHeight: 12 }}>
                          {expertiseUnlocked
                            ? (hero.rarity === "UR" ? "+20% HP·ATK·DEF +10% CD" : "+10% HP·ATK·DEF")
                            : "Odblokuj przy 4★"}
                        </div>
                        <div style={{ height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "0.58rem", color: expertiseUnlocked ? "#FCD34D" : "var(--text-dim)", fontStyle: "italic" }}>
                            {expertiseUnlocked ? "Aktywna" : "Wymaga 4★"}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>

          {/* ── Gear ── */}
          <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.08em", marginBottom: 10 }}>
            GEAR ·{" "}
            <span style={{ color: "var(--text-secondary)" }}>Recommended:</span>{" "}
            <span style={{ color: "#e07820", fontWeight: 700 }}>{hero.recommendedGear.join(" + ")}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {ALL_GEAR_SLOTS.map((slot) => (
              <GearSlotPicker
                key={slot}
                slot={slot}
                data={data.gear[slot]}
                onChange={(g) => setGear(slot, g)}
                recommended={hero.recommendedGear.includes(slot)}
              />
            ))}
          </div>

          {/* ── Crit stats (read from hero card) ── */}
          {(() => {
            const critRate = data.critRate ?? 0;
            const critDmg  = data.critDmg  ?? 0;
            return (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: "0.6rem", color: "#F472B6", fontFamily: "monospace", letterSpacing: "0.06em", marginBottom: 6 }}>
                  🎯 KRIT (z karty bohatera)
                </div>
                <div style={{ fontSize: "0.56rem", color: "var(--text-dim)", marginBottom: 8 }}>
                  Wpisz wartości z ekranu bohatera (Atrybuty). Szansa krytu: np. 0.23 = 23%. Obrażenia krytu: np. 0.5 = 50%.
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <label style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.56rem", color: "var(--text-dim)", marginBottom: 3 }}>Szansa krytu (0–1)</div>
                    <input
                      type="number" min={0} max={1} step={0.01}
                      value={critRate}
                      onChange={e => onChange({ ...data, critRate: Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)) })}
                      style={{
                        width: "100%", padding: "6px 8px", borderRadius: 6, fontSize: "0.9rem", fontWeight: 700,
                        background: "var(--surface-2)", border: "1px solid #F472B650", color: "#F472B6",
                        outline: "none", boxSizing: "border-box",
                      }}
                    />
                  </label>
                  <label style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.56rem", color: "var(--text-dim)", marginBottom: 3 }}>Obrażenia krytu (0+)</div>
                    <input
                      type="number" min={0} step={0.01}
                      value={critDmg}
                      onChange={e => onChange({ ...data, critDmg: Math.max(0, parseFloat(e.target.value) || 0) })}
                      style={{
                        width: "100%", padding: "6px 8px", borderRadius: 6, fontSize: "0.9rem", fontWeight: 700,
                        background: "var(--surface-2)", border: "1px solid #F472B650", color: "#F472B6",
                        outline: "none", boxSizing: "border-box",
                      }}
                    />
                  </label>
                </div>
              </div>
            );
          })()}

          {/* ── Wall of Honor ── */}
          {(() => {
            const wohLevel = data.wallOfHonorLevel ?? 0;
            const bonus = getWoHBonus(hero.id, wohLevel);
            const ratePerMilestone = getWoHRatePerMilestone(hero.id);
            const bonusType = getWoHBonusType(hero.id);
            const wohColor = bonusType === "Load" ? "#F59E0B" : "#34D399";
            const requires5star = data.stars < 5;
            const nextMilestoneLevel = (Math.floor(wohLevel / 50) + 1) * 50;
            const milestonesReached = Math.floor(wohLevel / 50);
            const isLoadHero = bonusType === "Load";
            const isPromotable = WOH_UR_PROMOTABLE.has(hero.id);

            const BONUS_TYPE_COLOR: Record<string, string> = {
              ATK: "#F87171", DEF: "#60A5FA", HP: "#34D399", Load: "#F59E0B",
            };
            const typeColor = BONUS_TYPE_COLOR[bonusType] ?? "#34D399";

            return (
              <div style={{ marginTop: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: "0.6rem", color: wohColor, fontFamily: "monospace", letterSpacing: "0.06em" }}>
                    🏛 ŚCIANA CHWAŁY
                  </span>
                  {/* Bonus type badge */}
                  <span style={{
                    fontSize: "0.56rem", padding: "2px 7px", borderRadius: 4, fontWeight: 700,
                    background: `${typeColor}18`, border: `1px solid ${typeColor}50`, color: typeColor,
                  }}>
                    {bonusType === "Load" ? "⚠ Ładunek wojsk" : `+${bonusType}`}
                  </span>
                </div>

                {/* Info row */}
                <div style={{ fontSize: "0.56rem", color: "var(--text-dim)", marginBottom: 8, lineHeight: 1.5 }}>
                  {requires5star && (
                    <span style={{ color: "#F59E0B" }}>🔒 Wymaga 5★ + Centrum Wojsk Lv.20 · </span>
                  )}
                  {isLoadHero && (
                    <span style={{ color: "#F59E0B" }}>
                      ⚠ Ten bohater daje bonus do ładunku wojsk, NIE do walki (zero wartości PvP/PvE)
                    </span>
                  )}
                  {!isLoadHero && !requires5star && (
                    <span>
                      +{ratePerMilestone}% {bonusType} co 50 lvl · {milestonesReached > 0 ? `${milestonesReached} milestone${milestonesReached > 1 ? "s" : ""}` : "Brak milestone"}
                      {" · "}globalnie, nie wymaga bohatera w drużynie
                    </span>
                  )}
                  {isPromotable && (
                    <span style={{ color: "#C084FC", display: "block", marginTop: 2 }}>
                      ♻ Po promocji SSR→UR: pełny zwrot odłamków + bonus wzrośnie do +0.50% · Inwestuj w Dzień VS!
                    </span>
                  )}
                  {!isLoadHero && !isPromotable && !requires5star && (
                    <span style={{ display: "block", marginTop: 2, color: "#A78BFA" }}>
                      💡 Inwestuj odłamki w Dzień VS (Versus Day) — generuje ~35M punktów eventowych
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: requires5star ? 0.4 : 1 }}>
                  <button
                    onClick={() => { if (!requires5star) onChange({ ...data, wallOfHonorLevel: Math.max(0, wohLevel - 1) }); }}
                    style={{
                      width: 34, height: 34, borderRadius: 8, fontSize: "1.1rem", fontWeight: 700,
                      background: "var(--surface-2)", border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                      cursor: (requires5star || wohLevel <= 0) ? "not-allowed" : "pointer",
                      opacity: (requires5star || wohLevel <= 0) ? 0.35 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>−</button>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: 900, color: wohLevel > 0 ? wohColor : "var(--text-dim)" }}>
                      Lv.{wohLevel}
                    </span>
                    {!isLoadHero && bonus > 0 && (
                      <div style={{ fontSize: "0.62rem", fontWeight: 700, color: typeColor, marginTop: 1 }}>
                        +{bonus.toFixed(2)}% {bonusType} globalnie
                      </div>
                    )}
                    {isLoadHero && wohLevel > 0 && (
                      <div style={{ fontSize: "0.56rem", color: "#F59E0B", marginTop: 1 }}>
                        +{(milestonesReached * 1.0).toFixed(0)}% Ładunek
                      </div>
                    )}
                    {!requires5star && (
                      <div style={{ fontSize: "0.47rem", color: "var(--text-dim)", marginTop: 2 }}>
                        Następny milestone: Lv.{nextMilestoneLevel}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { if (!requires5star) onChange({ ...data, wallOfHonorLevel: wohLevel + 1 }); }}
                    style={{
                      width: 34, height: 34, borderRadius: 8, fontSize: "1.1rem", fontWeight: 700,
                      background: requires5star ? "var(--surface-2)" : `${wohColor}20`,
                      border: `1px solid ${requires5star ? "var(--border)" : wohColor}`,
                      color: requires5star ? "var(--text-dim)" : wohColor,
                      cursor: requires5star ? "not-allowed" : "pointer",
                      opacity: requires5star ? 0.35 : 1,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>+</button>
                  <input type="number" min={0} value={wohLevel}
                    onChange={(e) => { if (!requires5star) onChange({ ...data, wallOfHonorLevel: Math.max(0, parseInt(e.target.value) || 0) }); }}
                    style={{ width: 60, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, padding: "4px 6px", color: "var(--text-primary)", fontFamily: "monospace", textAlign: "center" }} />
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}

// ── Formation bonus indicator ──────────────────────────────

function FormationPanel({ heroes, heroData }: { heroes: HeroDef[]; heroData: Record<string, HeroSave> }) {
  const ownedHeroes = heroes.filter((h) => heroData[h.id]?.owned);
  const counts: Record<HeroType, number> = { Tank: 0, Aircraft: 0, Missile: 0 };
  ownedHeroes.forEach((h) => counts[h.type]++);
  const total = ownedHeroes.length;
  const maxCount = Math.max(counts.Tank, counts.Aircraft, counts.Missile);
  const dominantType = (Object.keys(counts) as HeroType[]).find((t) => counts[t] === maxCount && maxCount > 0);

  let formationBonus = 0;
  if (total >= 5 && maxCount === 5) formationBonus = 20;
  else if (total >= 4 && maxCount >= 4) formationBonus = 15;
  else if (total >= 5 && maxCount >= 3) formationBonus = 10;
  else if (total >= 3 && maxCount >= 3) formationBonus = 5;

  return (
    <div style={{
      background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6,
      padding: "12px 16px", marginBottom: 20,
    }}>
      <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 10, letterSpacing: "0.08em" }}>
        FORMATION / SQUAD
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        {(["Tank", "Aircraft", "Missile"] as HeroType[]).map((t) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <img src={TYPE_ICON_URLS[t]} alt={t} width={20} height={20} style={{ objectFit: "contain" }} />
            <span style={{ fontFamily: "monospace", fontWeight: 700, color: TYPE_COLORS[t], fontSize: "1.1rem" }}>{counts[t]}</span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>{t}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto" }}>
          {formationBonus > 0 ? (
            <span style={{
              fontSize: "0.85rem", fontWeight: 700, fontFamily: "monospace",
              color: TYPE_COLORS[dominantType ?? "Tank"],
              background: `${TYPE_COLORS[dominantType ?? "Tank"]}15`,
              border: `1px solid ${TYPE_COLORS[dominantType ?? "Tank"]}30`,
              padding: "4px 10px", borderRadius: 5,
            }}>
              +{formationBonus}% HP/ATK/DEF ({dominantType})
            </span>
          ) : (
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>No formation bonus</span>
          )}
        </div>
      </div>
      <div style={{ fontSize: "0.62rem", color: "var(--text-dim)", marginTop: 8 }}>
        Formation bonus: 3 same=+5% · 3+2 mix=+10% · 4 same=+15% · 5 same=+20% (unlock via City Clash)
      </div>
    </div>
  );
}

// ── Squad Builder ─────────────────────────────────────────

// Slot positions (% inside the 500×280 formation box, card size 80×96)
const SQUAD_SLOT_POS = [
  { top: "6%",  left: "16%" },  // 0 back-left
  { top: "2%",  left: "57%" },  // 1 back-right
  { top: "53%", left: "1%"  },  // 2 front-left
  { top: "51%", left: "40%" },  // 3 front-center
  { top: "51%", left: "73%" },  // 4 front-right
];

function SquadBuilder({
  squads,
  getHeroData,
  onUpdateSquad,
}: {
  squads: SquadDef[];
  getHeroData: (id: string) => HeroSave;
  onUpdateSquad: (idx: number, squad: SquadDef) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [filter, setFilter] = useState<"all" | HeroType>("all");
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const dragHeroId = useRef<string | null>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null, null]);

  const currentSquad: SquadDef = squads[activeIdx] ?? { heroIds: [null, null, null, null, null] };

  function getSlotAt(x: number, y: number): number | null {
    for (let i = 0; i < 5; i++) {
      const el = slotRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return i;
    }
    return null;
  }

  function startDrag(heroId: string, e: React.PointerEvent) {
    e.preventDefault();
    const capturedSquadIds = [...currentSquad.heroIds];
    const capturedSquadIdx = activeIdx;
    dragHeroId.current = heroId;
    setDragPos({ x: e.clientX, y: e.clientY });

    function onMove(ev: PointerEvent) {
      setDragPos({ x: ev.clientX, y: ev.clientY });
      setHoveredSlot(getSlotAt(ev.clientX, ev.clientY));
    }

    function onUp(ev: PointerEvent) {
      const slot = getSlotAt(ev.clientX, ev.clientY);
      const hid = dragHeroId.current;
      if (slot !== null && hid) {
        const ids = [...capturedSquadIds] as (string | null)[];
        // Remove hero from its current slot in this squad (if any)
        const existingIdx = ids.indexOf(hid);
        if (existingIdx !== -1) ids[existingIdx] = null;
        // Swap if target is occupied
        const targetHero = capturedSquadIds[slot];
        const srcSlot = capturedSquadIds.indexOf(hid);
        if (existingIdx !== -1 && targetHero && targetHero !== hid) {
          ids[existingIdx] = targetHero;
        }
        ids[slot] = hid;
        onUpdateSquad(capturedSquadIdx, { heroIds: ids });
      }
      dragHeroId.current = null;
      setDragPos(null);
      setHoveredSlot(null);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }

  function removeFromSlot(slotIdx: number) {
    const ids = [...currentSquad.heroIds];
    ids[slotIdx] = null;
    onUpdateSquad(activeIdx, { heroIds: ids });
  }

  const ownedHeroes = HEROES.filter((h) => getHeroData(h.id).owned);
  const filteredHeroes = filter === "all" ? ownedHeroes : ownedHeroes.filter((h) => h.type === filter);
  const heroIdsInSquad = new Set(currentSquad.heroIds.filter(Boolean) as string[]);

  const draggingHero = dragPos && dragHeroId.current
    ? HEROES.find((h) => h.id === dragHeroId.current) ?? null
    : null;

  return (
    <div>
      {/* Squad selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[0, 1, 2, 3].map((i) => {
          const filled = (squads[i]?.heroIds ?? []).filter(Boolean).length;
          const active = activeIdx === i;
          return (
            <button key={i} onClick={() => setActiveIdx(i)} style={{
              flex: 1, padding: "10px 4px", borderRadius: 7,
              fontSize: "0.82rem", fontWeight: 700,
              background: active ? "rgba(245,158,11,0.12)" : "var(--surface-2)",
              border: `1px solid ${active ? "var(--gold)" : "var(--border)"}`,
              color: active ? "var(--gold)" : "var(--text-dim)",
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            }}>
              <span>Oddział {i + 1}</span>
              <span style={{ fontSize: "0.62rem", fontWeight: 400, color: active ? "var(--gold)" : "var(--text-dim)", opacity: 0.7 }}>
                {filled}/5
              </span>
            </button>
          );
        })}
      </div>

      {/* Formation field */}
      <div style={{ maxWidth: 500, margin: "0 auto 20px" }}>
        <div style={{
          position: "relative", height: 280,
          background: "linear-gradient(160deg, #1b2c18 0%, #0d1a0b 60%, #101a12 100%)",
          borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)",
          overflow: "visible",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.5)",
        }}>
          {/* Platform grid lines */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06, pointerEvents: "none" }}>
            {[...Array(6)].map((_, i) => (
              <line key={`v${i}`} x1={`${(i + 1) * (100 / 7)}%`} y1="0" x2={`${(i + 1) * (100 / 7)}%`} y2="100%" stroke="white" strokeWidth="1" />
            ))}
            {[...Array(4)].map((_, i) => (
              <line key={`h${i}`} x1="0" y1={`${(i + 1) * 25}%`} x2="100%" y2={`${(i + 1) * 25}%`} stroke="white" strokeWidth="1" />
            ))}
          </svg>

          {/* Watermark */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "1.6rem", fontWeight: 900, fontFamily: "monospace",
            letterSpacing: "0.3em", color: "rgba(255,255,255,0.03)",
            userSelect: "none", pointerEvents: "none", whiteSpace: "nowrap",
          }}>FORMATION</div>

          {/* Row labels */}
          <div style={{ position: "absolute", top: 8, right: 10, fontSize: "0.52rem", fontFamily: "monospace", color: "rgba(255,255,255,0.18)", letterSpacing: "0.12em" }}>BACK</div>
          <div style={{ position: "absolute", bottom: 8, right: 10, fontSize: "0.52rem", fontFamily: "monospace", color: "rgba(255,255,255,0.18)", letterSpacing: "0.12em" }}>FRONT</div>

          {/* Divider line */}
          <div style={{
            position: "absolute", top: "47%", left: "4%", right: "4%",
            height: 1, background: "rgba(255,255,255,0.05)",
          }} />

          {/* 5 formation slots */}
          {SQUAD_SLOT_POS.map((pos, slotIdx) => {
            const heroId = currentSquad.heroIds[slotIdx] ?? null;
            const hero = heroId ? HEROES.find((h) => h.id === heroId) ?? null : null;
            const hData = hero ? getHeroData(hero.id) : null;
            const isHovered = hoveredSlot === slotIdx;

            return (
              <div
                key={slotIdx}
                ref={(el) => { slotRefs.current[slotIdx] = el; }}
                style={{
                  position: "absolute",
                  top: pos.top, left: pos.left,
                  width: 80, height: 96,
                  borderRadius: 8,
                  border: isHovered
                    ? "2px dashed #FFD700"
                    : hero
                    ? `2px solid ${RARITY_BORDER[hero.rarity]}90`
                    : "2px dashed rgba(255,255,255,0.14)",
                  background: isHovered
                    ? "rgba(255,215,0,0.1)"
                    : hero
                    ? RARITY_BG[hero.rarity]
                    : "rgba(0,0,0,0.4)",
                  overflow: "hidden",
                  display: "flex", flexDirection: "column",
                  cursor: hero ? "grab" : "default",
                  transition: "border-color 0.1s, background 0.1s",
                  boxShadow: isHovered
                    ? "0 0 16px rgba(255,215,0,0.35)"
                    : hero
                    ? `0 0 10px ${RARITY_BORDER[hero.rarity]}40`
                    : "none",
                  userSelect: "none",
                  touchAction: "none",
                }}
                onPointerDown={hero ? (e) => startDrag(hero.id, e) : undefined}
              >
                {hero ? (
                  <>
                    <img
                      src={hero.portraitUrl} alt={hero.name}
                      draggable={false}
                      style={{ width: "100%", height: "66%", objectFit: "cover", objectPosition: "center top", pointerEvents: "none" }}
                    />
                    <div style={{
                      flex: 1, background: "rgba(0,0,0,0.75)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      padding: "2px 4px",
                    }}>
                      <div style={{ fontSize: "0.58rem", fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.1 }}>
                        {hero.name}
                      </div>
                      <div style={{ display: "flex", gap: 1, marginTop: 2 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} style={{ fontSize: "0.45rem", color: s <= (hData?.stars ?? 1) ? "#FFD700" : "rgba(255,255,255,0.15)" }}>★</span>
                        ))}
                      </div>
                    </div>
                    {/* Type icon top-left */}
                    <div style={{ position: "absolute", top: 3, left: 3, width: 16, height: 16, borderRadius: 3, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={TYPE_ICON_URLS[hero.type]} alt={hero.type} width={11} height={11} style={{ objectFit: "contain" }} />
                    </div>
                    {/* Remove btn top-right */}
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => removeFromSlot(slotIdx)}
                      style={{
                        position: "absolute", top: 3, right: 3,
                        width: 16, height: 16, borderRadius: 4, padding: 0,
                        background: "rgba(0,0,0,0.7)", border: "none",
                        color: "rgba(255,255,255,0.55)", cursor: "pointer",
                        fontSize: "0.55rem", display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >✕</button>
                  </>
                ) : (
                  <div style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 4,
                  }}>
                    <span style={{ fontSize: "1.4rem", color: "rgba(255,255,255,0.12)", lineHeight: 1 }}>+</span>
                    <span style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.1)", fontFamily: "monospace", letterSpacing: "0.05em" }}>SLOT {slotIdx + 1}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hero picker */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {([
            { val: "all",      label: "ALL",      icon: null },
            { val: "Tank",     label: "Tank",     icon: TYPE_ICON_URLS.Tank },
            { val: "Aircraft", label: "Aircraft", icon: TYPE_ICON_URLS.Aircraft },
            { val: "Missile",  label: "Missile",  icon: TYPE_ICON_URLS.Missile },
          ] as { val: string; label: string; icon: string | null }[]).map(({ val, label, icon }) => {
            const color = val === "all" ? "var(--text-secondary)" : TYPE_COLORS[val as HeroType];
            const active = filter === val;
            return (
              <button key={val} onClick={() => setFilter(val as typeof filter)} style={{
                flex: 1, padding: "7px 4px", borderRadius: 6, fontSize: "0.72rem",
                fontWeight: active ? 700 : 400,
                border: `1px solid ${active ? color : "var(--border)"}`,
                background: active ? `${color}18` : "var(--surface-2)",
                color: active ? color : "var(--text-dim)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}>
                {icon && <img src={icon} alt={val} width={13} height={13} style={{ objectFit: "contain" }} />}
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: "0.58rem", color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.07em", marginBottom: 10 }}>
          PRZECIĄGNIJ BOHATERA NA SLOT · {filteredHeroes.length} dostępnych
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))", gap: 6 }}>
          {filteredHeroes.map((hero) => {
            const hData = getHeroData(hero.id);
            const slotNum = currentSquad.heroIds.indexOf(hero.id);
            const inSquad = slotNum !== -1;
            return (
              <div
                key={hero.id}
                onPointerDown={(e) => startDrag(hero.id, e)}
                style={{
                  position: "relative",
                  borderRadius: 7,
                  border: `2px solid ${inSquad ? RARITY_BORDER[hero.rarity] : RARITY_BORDER[hero.rarity] + "50"}`,
                  background: inSquad ? RARITY_BG[hero.rarity] : "#0d1117",
                  overflow: "hidden",
                  aspectRatio: "3/4",
                  cursor: "grab",
                  opacity: inSquad ? 0.6 : 1,
                  transition: "opacity 0.15s, border-color 0.15s",
                  userSelect: "none",
                  touchAction: "none",
                }}
              >
                <img
                  src={hero.portraitUrl} alt={hero.name} draggable={false}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block", pointerEvents: "none" }}
                />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(transparent, rgba(0,0,0,0.88) 55%)",
                  padding: "10px 3px 4px", textAlign: "center",
                }}>
                  <div style={{ fontSize: "0.55rem", fontWeight: 700, color: "#fff" }}>{hero.name}</div>
                </div>
                {inSquad && (
                  <div style={{
                    position: "absolute", top: 3, right: 3,
                    width: 16, height: 16, borderRadius: 4,
                    background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.6rem", fontWeight: 900, color: "#000",
                  }}>{slotNum + 1}</div>
                )}
              </div>
            );
          })}
          {filteredHeroes.length === 0 && (
            <div style={{
              gridColumn: "1 / -1", padding: "28px 16px", textAlign: "center",
              color: "var(--text-dim)", fontSize: "0.8rem",
            }}>
              Brak bohaterów w tym typie — dodaj ich w zakładce <strong>Heroes</strong>
            </div>
          )}
        </div>
      </div>

      {/* Drag ghost */}
      {draggingHero && dragPos && (
        <div style={{
          position: "fixed",
          left: dragPos.x - 40, top: dragPos.y - 48,
          width: 80, height: 96,
          borderRadius: 8,
          border: `2px solid ${RARITY_BORDER[draggingHero.rarity]}`,
          background: RARITY_BG[draggingHero.rarity],
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 9999,
          opacity: 0.92,
          boxShadow: `0 8px 28px rgba(0,0,0,0.55), 0 0 14px ${RARITY_BORDER[draggingHero.rarity]}60`,
          transform: "scale(1.1) rotate(-2deg)",
          transition: "transform 0.05s",
        }}>
          <img
            src={draggingHero.portraitUrl} alt={draggingHero.name}
            style={{ width: "100%", height: "68%", objectFit: "cover", objectPosition: "center top" }}
          />
          <div style={{ background: "rgba(0,0,0,0.8)", padding: "4px", textAlign: "center" }}>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#fff" }}>{draggingHero.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Combat Bonus Panel (sim engine powered) ──────────────

/** Expandable breakdown list for a single TracedPct */
function BonusBreakdown({ pct, color }: { pct: TracedPct; color: string }) {
  const [open, setOpen] = useState(false);
  if (pct.contributions.length === 0) return <span style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>—</span>;
  return (
    <div>
      <button onClick={() => setOpen(o => !o)} style={{
        background: "none", border: "none", padding: 0, cursor: "pointer",
        color, fontFamily: "monospace", fontSize: "0.82rem", fontWeight: 800,
        display: "flex", alignItems: "center", gap: 4,
      }}>
        +{pct.total.toFixed(1)}%
        <span style={{ fontSize: "0.55rem", color: "var(--text-dim)", fontWeight: 400 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 4, paddingLeft: 4, borderLeft: `2px solid ${color}40` }}>
          {pct.contributions.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.58rem", color: "var(--text-dim)", padding: "1px 0" }}>
              <span>{c.label}</span>
              <span style={{ color, fontFamily: "monospace", marginLeft: 8 }}>+{c.value.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Single troop-type card: ATK / DEF / HP with breakdown */
function TypeCombatCard({ type, stats, color, icon }: {
  type: string;
  stats: TroopTypeStats;
  color: string;
  icon: string;
}) {
  const totalAny = stats.atkPct.total + stats.defPct.total + stats.hpPct.total;
  return (
    <div style={{
      background: "var(--surface-2)", border: `1px solid ${color}30`,
      borderRadius: 12, padding: "14px 16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <img src={icon} alt={type} style={{ width: 20, height: 20, objectFit: "contain" }} />
        <span style={{ fontSize: "0.72rem", fontWeight: 800, color, letterSpacing: "0.05em" }}>{type.toUpperCase()}</span>
        {totalAny === 0 && (
          <span style={{ fontSize: "0.55rem", color: "var(--text-dim)", marginLeft: "auto" }}>no bonuses</span>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {[
          { label: "ATK", pct: stats.atkPct, col: "#F87171" },
          { label: "DEF", pct: stats.defPct, col: "#60A5FA" },
          { label: "HP",  pct: stats.hpPct,  col: "#34D399" },
        ].map(({ label, pct, col }) => (
          <div key={label} style={{ background: "var(--surface)", borderRadius: 8, padding: "8px 10px" }}>
            <div style={{ fontSize: "0.52rem", color: "var(--text-dim)", marginBottom: 5, fontFamily: "monospace" }}>{label}</div>
            <BonusBreakdown pct={pct} color={col} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** VS Tech banner */
function VsTechBanner({ multiplier, vsTechLevel }: { multiplier: number; vsTechLevel: number }) {
  if (vsTechLevel === 0) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "8px 14px",
      background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
      borderRadius: 8, marginBottom: 12,
    }}>
      <span style={{ fontSize: "0.62rem", color: "var(--gold)", fontFamily: "monospace", fontWeight: 700 }}>
        VS TECH Lv{vsTechLevel}
      </span>
      <span style={{ fontSize: "0.68rem", color: "var(--gold)", fontFamily: "monospace", fontWeight: 800 }}>
        ×{multiplier.toFixed(2)}
      </span>
      <span style={{ fontSize: "0.58rem", color: "var(--text-dim)", marginLeft: "auto" }}>
        Troop stat multiplier (all types)
      </span>
    </div>
  );
}

/** Troop power calculator: enter counts per tier, see estimated power */
function TroopPowerCalc({ stats }: { stats: ReturnType<typeof computePlayerStats> }) {
  const MAX_TIER = 10;
  const [counts, setCounts] = useState<Record<number, string>>({});
  const [type, setType] = useState<"Tank" | "Aircraft" | "Missile">("Tank");

  const typeStats = type === "Tank" ? stats.tank : type === "Aircraft" ? stats.aircraft : stats.missile;
  const typeColor = type === "Tank" ? "#3B82F6" : type === "Aircraft" ? "#10B981" : "#EF4444";

  const atkMult = 1 + typeStats.atkPct.total / 100;
  const defMult = 1 + typeStats.defPct.total / 100;
  const hpMult  = 1 + typeStats.hpPct.total / 100;
  const combatMult = ((atkMult + defMult + hpMult) / 3) * stats.vsTechMultiplier;

  const tiers = Array.from({ length: MAX_TIER }, (_, i) => i + 1);

  const totalBase = tiers.reduce((s, t) => {
    const c = parseInt(counts[t] ?? "0") || 0;
    return s + c * (TROOP_BASE_POWER[t] ?? 0);
  }, 0);

  const estimated = Math.round(totalBase * combatMult);

  const fmt = (n: number) => n >= 1_000_000 ? `${(n/1_000_000).toFixed(2)}M` : n >= 1_000 ? `${(n/1_000).toFixed(1)}K` : `${n}`;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.08em", marginBottom: 10 }}>
        TROOP POWER ESTIMATOR
      </div>

      {/* Type selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {(["Tank", "Aircraft", "Missile"] as const).map(t => {
          const tc = t === "Tank" ? "#3B82F6" : t === "Aircraft" ? "#10B981" : "#EF4444";
          return (
            <button key={t} onClick={() => setType(t)} style={{
              fontSize: "0.62rem", fontWeight: 600, padding: "4px 12px", borderRadius: 20,
              background: type === t ? `${tc}22` : "var(--surface-2)",
              border: `1px solid ${type === t ? tc : "var(--border)"}`,
              color: type === t ? tc : "var(--text-dim)",
              cursor: "pointer", fontFamily: "inherit",
            }}>{t}</button>
          );
        })}
      </div>

      {/* Tier inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 12 }}>
        {tiers.map(t => (
          <div key={t} style={{
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "6px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: "0.52rem", color: "var(--text-dim)", marginBottom: 4, fontFamily: "monospace" }}>
              T{t} ({TROOP_BASE_POWER[t]}⚡)
            </div>
            <input
              type="number" min={0} placeholder="0"
              value={counts[t] ?? ""}
              onChange={e => setCounts(prev => ({ ...prev, [t]: e.target.value }))}
              style={{
                width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 5, padding: "3px 4px", color: "var(--text-primary)",
                fontFamily: "monospace", fontSize: "0.75rem", outline: "none", textAlign: "center",
              }}
            />
          </div>
        ))}
      </div>

      {/* Result */}
      {totalBase > 0 && (
        <div style={{
          background: `${typeColor}10`, border: `1px solid ${typeColor}30`,
          borderRadius: 10, padding: "12px 16px",
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10,
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.52rem", color: "var(--text-dim)", marginBottom: 3, fontFamily: "monospace" }}>BASE POWER</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800, fontFamily: "monospace", color: "var(--text-primary)" }}>{fmt(totalBase)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.52rem", color: "var(--text-dim)", marginBottom: 3, fontFamily: "monospace" }}>MULT</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800, fontFamily: "monospace", color: "var(--gold)" }}>×{combatMult.toFixed(3)}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.52rem", color: "var(--text-dim)", marginBottom: 3, fontFamily: "monospace" }}>EST. POWER</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 800, fontFamily: "monospace", color: typeColor }}>{fmt(estimated)}</div>
          </div>
        </div>
      )}
      <div style={{ fontSize: "0.5rem", color: "var(--text-dim)", marginTop: 6 }}>
        Mult = avg(ATK/DEF/HP bonus) × VS Tech. Base power from T1=24 … T10=1647. Estimate only.
      </div>
    </div>
  );
}

// ── Squad Power Panel ────────────────────────────────────

const BONUS_TYPE_COLOR: Record<string, string> = {
  ATK: "#F87171", DEF: "#60A5FA", HP: "#34D399", Load: "#F59E0B",
};

function SquadPowerPanel({ heroes }: { heroes: Record<string, import("@/lib/profile").HeroSave> }) {
  const TROOP_TYPES: HeroType[] = ["Tank", "Aircraft", "Missile"];

  // Per-type WoH bonus sums
  const wohByType = Object.fromEntries(
    TROOP_TYPES.map(t => {
      let atk = 0, def = 0, hp = 0;
      HEROES.forEach(h => {
        const s = heroes[h.id];
        if (!s?.owned || s.wallOfHonorLevel <= 0 || h.type !== t) return;
        const bonus = getWoHBonus(h.id, s.wallOfHonorLevel);
        const bt = getWoHBonusType(h.id);
        if (bt === "ATK") atk += bonus;
        else if (bt === "DEF") def += bonus;
        else if (bt === "HP") hp += bonus;
      });
      return [t, { atk, def, hp }];
    })
  ) as Record<HeroType, { atk: number; def: number; hp: number }>;

  // EW type specialist: any owned hero of that type with EW≥20
  const ewByType = Object.fromEntries(
    TROOP_TYPES.map(t => {
      const has = HEROES.some(h => h.type === t && (heroes[h.id]?.owned) && (heroes[h.id]?.exclusiveWeaponLevel ?? 0) >= 20);
      return [t, has ? 7.5 : 0];
    })
  ) as Record<HeroType, number>;

  // Heroes with WoH, sorted by bonus desc
  const wohHeroes = HEROES.filter(h => heroes[h.id]?.owned && (heroes[h.id]?.wallOfHonorLevel ?? 0) > 0)
    .sort((a, b) => (heroes[b.id]?.wallOfHonorLevel ?? 0) - (heroes[a.id]?.wallOfHonorLevel ?? 0));

  const anyWoH = wohHeroes.length > 0;
  const anyEW20 = HEROES.some(h => heroes[h.id]?.owned && (heroes[h.id]?.exclusiveWeaponLevel ?? 0) >= 20);

  if (!anyWoH && !anyEW20) {
    return (
      <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 10, background: "var(--surface-2)", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", textAlign: "center" }}>
          🌍 Globalne bonusy (WoH / EW) pojawią się tu gdy dodasz poziomy w zakładce Heroes
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 20 }}>
      {/* Header */}
      <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.08em", marginBottom: 10 }}>
        🌍 GLOBALNE BONUSY DO WOJSK (WoH + EW)
      </div>

      {/* Type cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {TROOP_TYPES.map(type => {
          const w = wohByType[type];
          const ew = ewByType[type];
          const tc = TYPE_COLORS[type];
          const totalAtk = w.atk + ew;
          const totalDef = w.def + ew;
          const totalHp  = w.hp  + ew;
          if (totalAtk + totalDef + totalHp === 0) return null;
          return (
            <div key={type} style={{
              background: "var(--surface-2)", border: `1px solid ${tc}40`,
              borderRadius: 10, padding: "10px 12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <img src={TYPE_ICON_URLS[type]} alt={type} style={{ width: 18, height: 18, objectFit: "contain" }} />
                <span style={{ fontSize: "0.7rem", fontWeight: 800, color: tc }}>{type}</span>
                {ew > 0 && (
                  <span style={{ fontSize: "0.5rem", color: "#FBBF24", background: "rgba(251,191,36,0.12)", border: "1px solid #FBBF2440", borderRadius: 4, padding: "1px 5px", marginLeft: 4 }}>
                    EW Lv20+ ⚡
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { label: "ATK", value: totalAtk, color: "#F87171" },
                  { label: "DEF", value: totalDef, color: "#60A5FA" },
                  { label: "HP",  value: totalHp,  color: "#34D399" },
                ].map(s => (
                  <div key={s.label} style={{
                    flex: 1, background: "var(--surface)", borderRadius: 7, padding: "6px 4px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: "0.48rem", color: "var(--text-dim)", marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: "0.75rem", fontWeight: 800, fontFamily: "monospace", color: s.value > 0 ? s.color : "var(--text-dim)" }}>
                      {s.value > 0 ? `+${s.value.toFixed(2)}%` : "—"}
                    </div>
                  </div>
                ))}
              </div>
              {/* Breakdown */}
              <div style={{ marginTop: 5, fontSize: "0.48rem", color: "var(--text-dim)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {w.atk > 0 && <span>WoH ATK +{w.atk.toFixed(2)}%</span>}
                {w.def > 0 && <span>WoH DEF +{w.def.toFixed(2)}%</span>}
                {w.hp  > 0 && <span>WoH HP +{w.hp.toFixed(2)}%</span>}
                {ew    > 0 && <span style={{ color: "#FBBF24" }}>EW Spec. +{ew}% ATK/DEF/HP</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* WoH hero list */}
      {anyWoH && (
        <>
          <div style={{ fontSize: "0.58rem", color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.07em", marginBottom: 8 }}>
            ŚCIANA CHWAŁY — AKTYWNI BOHATEROWIE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {wohHeroes.map(h => {
              const s = heroes[h.id]!;
              const bonus = getWoHBonus(h.id, s.wallOfHonorLevel);
              const bt = getWoHBonusType(h.id);
              const tc = TYPE_COLORS[h.type];
              return (
                <div key={h.id} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "5px 10px", borderRadius: 7,
                  background: "var(--surface-2)", border: `1px solid ${tc}25`,
                }}>
                  <img src={h.portraitUrl} alt={h.name}
                    style={{ width: 26, height: 26, borderRadius: 5, objectFit: "cover", objectPosition: "top" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "#fff" }}>{h.name}</div>
                    <div style={{ fontSize: "0.48rem", color: "var(--text-dim)" }}>{h.type} · WoH Lv.{s.wallOfHonorLevel}</div>
                  </div>
                  <div style={{ fontSize: "0.65rem", fontWeight: 800, fontFamily: "monospace", color: BONUS_TYPE_COLOR[bt] ?? "#fff" }}>
                    +{bonus.toFixed(2)}% {bt}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Drone Panel ──────────────────────────────────────────

// Combat boost milestone data
const COMBAT_MILESTONES = [
  { level: 10,  label: "Chips unlock",     sets: 1, boost: 0 },
  { level: 150, label: "+Zestaw 2 · Boost+1", sets: 2, boost: 1 },
  { level: 300, label: "+Zestaw 3 · Boost+2", sets: 3, boost: 2 },
  { level: 450, label: "+Zestaw 4 · Boost+3", sets: 4, boost: 3 },
  { level: 900, label: "Max moc",           sets: 4, boost: 3 },
] as const;

const DRONE_LEVEL_MILESTONES = [50, 100, 150, 200, 250] as const;

function getCombatInfo(lv: number) {
  if (lv >= 900) return { stage: 5, sets: 4, boost: 3, next: null };
  if (lv >= 450) return { stage: 4, sets: 4, boost: 3, next: 900 };
  if (lv >= 300) return { stage: 3, sets: 3, boost: 2, next: 450 };
  if (lv >= 150) return { stage: 2, sets: 2, boost: 1, next: 300 };
  if (lv >= 10)  return { stage: 1, sets: 1, boost: 0, next: 150 };
  return { stage: 0, sets: 0, boost: 0, next: 10 };
}

function compColor(lv: number): string {
  if (lv === 0) return "#374151";
  if (lv <= 3)  return "#3B82F6";
  if (lv <= 6)  return "#10B981";
  if (lv === 7) return "#F59E0B";
  return "#EF4444";
}

const DRONE_RARITY_COLORS: Record<DroneChipRarity, string> = {
  none: "#374151",
  R:    "#3B82F6",
  SR:   "#8B5CF6",
  SSR:  "#F59E0B",
  UR:   "#F97316",
};

const CHIP_UNIT_COLORS: Record<"tank"|"aircraft"|"missile", string> = {
  tank:     "#3B82F6",
  aircraft: "#10B981",
  missile:  "#EF4444",
};

const CHIP_UNIT_ICONS: Record<"tank"|"aircraft"|"missile", string> = {
  tank:     "/icons/type-tank.png",
  aircraft: "/icons/type-aircraft.png",
  missile:  "/icons/type-missile.png",
};

// Real game component images (40×40 sprites from game CDN)
const DRONE_COMPONENT_IMAGES = [
  "/drone/thermal-scope.webp",    // 0 — Thermal Scope
  "/drone/turbo-engine.webp",     // 1 — Turbo Engine
  "/drone/external-armor.webp",   // 2 — External Armor
  "/drone/radar.webp",            // 3 — Radar
  "/drone/fuel-cell.webp",        // 4 — Fuel Cell
  "/drone/airborne-missile.webp", // 5 — Airborne Missile
] as const;

function getChipImage(unit: DroneUnitType, slot: ChipSlotKey, rarity: DroneChipRarity): string {
  const suffix = rarity === "UR" ? "-ur" : "";
  return `/drone/chip-${unit}-${slot}${suffix}.png`;
}

const DRONE_RARITY_BG: Record<DroneChipRarity, string> = {
  none: "#0a1628",
  R:    "rgba(59,130,246,0.12)",
  SR:   "rgba(139,92,246,0.15)",
  SSR:  "rgba(245,158,11,0.12)",
  UR:   "rgba(249,115,22,0.12)",
};

const DRONE_SUBTABS = [
  { id: "atrybuty",  label: "Atrybuty",  icon: "📊" },
  { id: "komponent", label: "Komponent", icon: "🔧" },
  { id: "chip",      label: "Chip",      icon: "💠" },
] as const;

type DroneSubTab = typeof DRONE_SUBTABS[number]["id"];

// Slot key type for chip sets
type ChipSlotKey = "initial" | "attack" | "defense" | "interference";

const CHIP_SLOTS: { key: ChipSlotKey; label: string; pos: "top" | "left" | "right" | "bottom" }[] = [
  { key: "initial",      label: "Inicjujący", pos: "top" },
  { key: "attack",       label: "Atak",       pos: "left" },
  { key: "defense",      label: "Obrona",     pos: "right" },
  { key: "interference", label: "Zakłócanie", pos: "bottom" },
];

// Symbols matching game overlay icons for each chip slot type
const CHIP_SLOT_SYMBOLS: Record<ChipSlotKey, string> = {
  initial:      "✏",
  attack:       "⚡",
  defense:      "🛡",
  interference: "📡",
};

const CHIP_SLOT_COLORS_MAP: Record<ChipSlotKey, string> = {
  initial:      "#60A5FA",
  attack:       "#F87171",
  defense:      "#34D399",
  interference: "#A78BFA",
};

const CHIP_SLOT_LABELS_MAP: Record<ChipSlotKey, string> = {
  initial:      "Inicjujący",
  attack:       "Atak",
  defense:      "Obrona",
  interference: "Zakłócanie",
};

function DronePanel({
  drone,
  onChange,
  uavLevel,
  onUavLevelChange,
}: {
  drone: DroneSave;
  onChange: (patch: Partial<DroneSave>) => void;
  uavLevel: number;
  onUavLevelChange: (v: number) => void;
}) {
  const [subTab, setSubTab] = useState<DroneSubTab>("atrybuty");
  const [activeSet, setActiveSet] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<ChipSlotKey | null>(null);
  const [chipDrawerOpen, setChipDrawerOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingChip, setDraggingChip] = useState<{ slot: ChipSlotKey; rarity: "SR" | "UR" } | null>(null);
  const draggingRef = useRef(false);

  const combatInfo = getCombatInfo(drone.combatBoostLevel);

  function updateComponentLevel(idx: number, lv: number) {
    const next = [...drone.componentLevels];
    next[idx] = Math.max(0, Math.min(99, lv));
    onChange({ componentLevels: next });
  }

  function updateChip(setIdx: number, slot: ChipSlotKey, patch: Partial<DroneChipInfo>) {
    const sets = drone.chipSets.map((s, i) =>
      i === setIdx ? { ...s, [slot]: { ...s[slot], ...patch } } : s
    );
    onChange({ chipSets: sets });
  }

  const chipSet = drone.chipSets[activeSet] ?? {
    initial:      { rarity: "none" as DroneChipRarity, stars: 1, unit: null },
    attack:       { rarity: "none" as DroneChipRarity, stars: 1, unit: null },
    defense:      { rarity: "none" as DroneChipRarity, stars: 1, unit: null },
    interference: { rarity: "none" as DroneChipRarity, stars: 1, unit: null },
  };

  // Unit type is shared by all 4 chips in a set — read from initial slot
  const setUnit = chipSet.initial.unit;

  function setChipSetUnit(unit: DroneUnitType | null) {
    const slots: ChipSlotKey[] = ["initial", "attack", "defense", "interference"];
    const sets = drone.chipSets.map((s, i) => {
      if (i !== activeSet) return s;
      const next = { ...s };
      for (const slot of slots) {
        next[slot] = {
          ...s[slot],
          unit,
          ...(unit === null
            ? { rarity: "none" as DroneChipRarity, stars: 1 }
            : {}),
        };
      }
      return next;
    });
    onChange({ chipSets: sets });
  }

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 20,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 8, padding: 4,
      }}>
        {DRONE_SUBTABS.map((t) => {
          const active = subTab === t.id;
          return (
            <button key={t.id} onClick={() => setSubTab(t.id)} style={{
              flex: 1, padding: "9px 8px", borderRadius: 6,
              fontSize: "0.78rem", fontWeight: active ? 700 : 400,
              background: active ? "#0f1e3d" : "transparent",
              border: `1px solid ${active ? "#3B82F6" : "transparent"}`,
              color: active ? "#60A5FA" : "var(--text-secondary)",
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            }}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── ATRYBUTY ── */}
      {subTab === "atrybuty" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Drone level */}
          <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: "0.58rem", fontFamily: "monospace", color: "#60A5FA", letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase" }}>
              Poziom Drona
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ fontSize: "2.2rem", lineHeight: 1 }}>🚁</div>
              <input type="number" min={1} max={250} value={drone.level || ""}
                onChange={(e) => onChange({ level: Math.max(1, Math.min(250, parseInt(e.target.value) || 1)) })}
                placeholder="1"
                style={{
                  width: 88, background: "#0f1e3d", border: "2px solid #1e3a5f",
                  borderRadius: 8, padding: "10px 12px", color: "#60A5FA",
                  fontFamily: "monospace", fontSize: "1.7rem", fontWeight: 700,
                  outline: "none", textAlign: "center",
                }} />
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>/ 250</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {DRONE_LEVEL_MILESTONES.map((m) => {
                const reached = drone.level >= m;
                return (
                  <div key={m} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: "0.68rem", fontWeight: 700,
                    fontFamily: "monospace",
                    background: reached ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${reached ? "#3B82F6" : "rgba(255,255,255,0.08)"}`,
                    color: reached ? "#60A5FA" : "var(--text-dim)",
                  }}>
                    {reached ? "✓ " : ""}Lv.{m}
                  </div>
                );
              })}
            </div>
          </div>

          {/* UAV Level */}
          <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: "0.58rem", fontFamily: "monospace", color: "#60A5FA", letterSpacing: "0.12em", marginBottom: 14, textTransform: "uppercase" }}>
              Poziom Jednostki UAV
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: "2.2rem", lineHeight: 1 }}>🛸</div>
              <input type="number" min={0} max={300} value={uavLevel || ""}
                onChange={(e) => onUavLevelChange(Math.max(0, Math.min(300, parseInt(e.target.value) || 0)))}
                placeholder="0"
                style={{
                  width: 88, background: "#0f1e3d", border: "2px solid #1e3a5f",
                  borderRadius: 8, padding: "10px 12px", color: "#60A5FA",
                  fontFamily: "monospace", fontSize: "1.7rem", fontWeight: 700,
                  outline: "none", textAlign: "center",
                }} />
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>/ 300</div>
            </div>
          </div>

          {/* Combat Boost */}
          <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 10, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontSize: "0.58rem", fontFamily: "monospace", color: "#60A5FA", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Wzmocnienie Bojowe
              </div>
              {combatInfo.stage > 0 && (
                <div style={{
                  fontSize: "0.65rem", fontWeight: 700, padding: "3px 12px", borderRadius: 20,
                  background: "rgba(59,130,246,0.2)", border: "1px solid #3B82F6", color: "#60A5FA",
                  fontFamily: "monospace", whiteSpace: "nowrap",
                }}>
                  Etap {["","I","II","III","IV","V"][combatInfo.stage]}
                  {combatInfo.boost > 0 && ` · Boost +${combatInfo.boost}`}
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <div style={{ fontSize: "2.2rem", lineHeight: 1 }}>⚡</div>
              <input type="number" min={0} max={9999} value={drone.combatBoostLevel || ""}
                onChange={(e) => onChange({ combatBoostLevel: Math.max(0, parseInt(e.target.value) || 0) })}
                placeholder="0"
                style={{
                  width: 110, background: "#0f1e3d", border: "2px solid #1e3a5f",
                  borderRadius: 8, padding: "10px 12px", color: "#60A5FA",
                  fontFamily: "monospace", fontSize: "1.7rem", fontWeight: 700, outline: "none", textAlign: "center",
                }} />
              {combatInfo.next !== null && (
                <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
                  do Lv.{combatInfo.next}<br/>
                  <span style={{ color: "#F59E0B", fontWeight: 700 }}>+{combatInfo.next - drone.combatBoostLevel}</span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {COMBAT_MILESTONES.map((m) => {
                const reached = drone.combatBoostLevel >= m.level;
                return (
                  <div key={m.level} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 7,
                    background: reached ? "rgba(59,130,246,0.08)" : "transparent",
                    border: `1px solid ${reached ? "#1e3a5f" : "rgba(255,255,255,0.04)"}`,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                      background: reached ? "#1e3a5f" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${reached ? "#3B82F6" : "rgba(255,255,255,0.08)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.62rem", fontWeight: 900, fontFamily: "monospace",
                      color: reached ? "#60A5FA" : "var(--text-dim)",
                    }}>
                      {reached ? "✓" : m.level}
                    </div>
                    <div>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: reached ? "#fff" : "var(--text-dim)" }}>Lv.{m.level}</div>
                      <div style={{ fontSize: "0.6rem", color: reached ? "#60A5FA" : "var(--text-dim)" }}>{m.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Postęp badań komponentów + poziom drona */}
          <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: "0.58rem", fontFamily: "monospace", color: "#60A5FA", letterSpacing: "0.12em", marginBottom: 4, textTransform: "uppercase" }}>
              Dron (automatyczne liczenie)
            </div>
            <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", marginBottom: 14 }}>
              Wpisz sub-poziom drona (0–4), postęp badań komponentów w % i poziomy komponentów powyżej. Premia Drona i procenty liczą się same; wpisanie postępu włącza tryb automatyczny.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
              {["Radar", "Turbo", "Pancerz", "Kamera", "Ogniwo", "Pocisk"].map((nm, i) => (
                <div key={nm}>
                  <div style={{ fontSize: "0.55rem", fontFamily: "monospace", color: "var(--text-dim)", textAlign: "center", marginBottom: 4 }}>{nm} %</div>
                  <input type="number" min={0} max={100} value={drone.componentProgress?.[i] ?? ""}
                    onChange={(e) => {
                      const cur = [...(drone.componentProgress ?? [0, 0, 0, 0, 0, 0])];
                      cur[i] = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                      onChange({ componentProgress: cur });
                    }}
                    style={{ width: "100%", boxSizing: "border-box", background: "#0f1e3d", border: "2px solid #1e3a5f", borderRadius: 8, padding: "6px 4px", color: "#60A5FA", fontFamily: "monospace", textAlign: "center" }} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: "0.55rem", fontFamily: "monospace", color: "var(--text-dim)", textAlign: "center", marginBottom: 4 }}>Sub-poz.</div>
                <input type="number" min={0} max={4} value={drone.subLevel ?? 0}
                  onChange={(e) => onChange({ subLevel: Math.max(0, Math.min(4, parseInt(e.target.value) || 0)) })}
                  style={{ width: "100%", boxSizing: "border-box", background: "#0f1e3d", border: "2px solid #1e3a5f", borderRadius: 8, padding: "6px 4px", color: "#60A5FA", fontFamily: "monospace", textAlign: "center" }} />
              </div>
            </div>
          </div>

          {/* Premia Drona */}
          <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: "0.58rem", fontFamily: "monospace", color: "#60A5FA", letterSpacing: "0.12em", marginBottom: 4, textTransform: "uppercase" }}>
              Premia Drona
            </div>
            <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", marginBottom: 14 }}>
              Wpisz bezpośrednio z ekranu Atrybuty Drona w grze
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
              {([["HP", "dronePremiaHp"], ["ATK", "dronePremiaAtk"], ["DEF", "dronePremiaDef"]] as const).map(([lbl, key]) => (
                <div key={key}>
                  <div style={{ fontSize: "0.55rem", fontFamily: "monospace", color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 4, textAlign: "center" }}>{lbl}</div>
                  <input type="number" min={0} value={(drone[key] as number) || ""}
                    onChange={(e) => onChange({ [key]: Math.max(0, parseInt(e.target.value) || 0) })}
                    placeholder="0"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      background: "#0f1e3d", border: "2px solid #1e3a5f",
                      borderRadius: 8, padding: "8px 6px", color: "#60A5FA",
                      fontFamily: "monospace", fontSize: "1rem", fontWeight: 700,
                      outline: "none", textAlign: "center",
                    }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: "0.58rem", fontFamily: "monospace", color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>
              Dron % bohatera (wiersz „Dron” w Atrybutach ataku / obrony)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 14 }}>
              {([["HP", "droneHeroHpPct"], ["ATK", "droneHeroAtkPct"], ["DEF", "droneHeroDefPct"], ["KRYT %", "droneHeroCritRate"], ["OBR. KRYT %", "droneHeroCritDmg"]] as const).map(([lbl, key]) => (
                <div key={key}>
                  <div style={{ fontSize: "0.55rem", fontFamily: "monospace", color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 4, textAlign: "center" }}>{lbl}</div>
                  <input type="number" min={0} step={0.5} value={(drone[key] as number) || ""}
                    onChange={(e) => onChange({ [key]: Math.max(0, parseFloat(e.target.value) || 0) })}
                    placeholder="0"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      background: "#0f1e3d", border: "2px solid #1e3a5f",
                      borderRadius: 8, padding: "8px 6px", color: "#60A5FA",
                      fontFamily: "monospace", fontSize: "1rem", fontWeight: 700,
                      outline: "none", textAlign: "center",
                    }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: "0.58rem", fontFamily: "monospace", color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 8, textTransform: "uppercase" }}>
              Konwersja Drona → Bohater (%)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {([["HP", "droneConvHp", 18], ["ATK", "droneConvAtk", 19], ["DEF", "droneConvDef", 18]] as const).map(([lbl, key, def]) => (
                <div key={key}>
                  <div style={{ fontSize: "0.55rem", fontFamily: "monospace", color: "var(--text-dim)", letterSpacing: "0.08em", marginBottom: 4, textAlign: "center" }}>{lbl}</div>
                  <input type="number" min={0} max={100} value={(drone[key] as number) ?? def}
                    onChange={(e) => onChange({ [key]: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })}
                    placeholder={String(def)}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      background: "#0f1e3d", border: "2px solid #1e3a5f",
                      borderRadius: 8, padding: "8px 6px", color: "#F59E0B",
                      fontFamily: "monospace", fontSize: "1rem", fontWeight: 700,
                      outline: "none", textAlign: "center",
                    }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── KOMPONENT ── */}
      {subTab === "komponent" && (
        <div>
          <div style={{ fontSize: "0.58rem", fontFamily: "monospace", color: "var(--text-dim)", letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>
            Lv.1–7 przez merge · Lv.8+ przez research
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {DRONE_COMPONENT_NAMES.map((name, idx) => {
              const lv = drone.componentLevels[idx] ?? 0;
              const color = compColor(lv);
              return (
                <div key={idx} style={{
                  background: lv > 0 ? `${color}10` : "#0a1628",
                  border: `2px solid ${lv > 0 ? color + "70" : "#1e3a5f"}`,
                  borderRadius: 10, padding: "14px 8px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  transition: "all 0.2s",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={DRONE_COMPONENT_IMAGES[idx]} alt={name} style={{
                    width: 56, height: 56, objectFit: "contain",
                    imageRendering: "pixelated",
                    filter: lv > 0
                      ? `drop-shadow(0 0 6px ${color}) brightness(1.1)`
                      : "grayscale(1) opacity(0.35)",
                    transition: "filter 0.2s",
                  }} />
                  <div style={{
                    fontSize: "0.58rem", fontWeight: 700, textAlign: "center",
                    color: lv > 0 ? "#e5e7eb" : "var(--text-dim)", lineHeight: 1.3,
                    minHeight: "2.2em",
                  }}>
                    {name}
                  </div>
                  <div style={{
                    padding: "3px 12px", borderRadius: 20,
                    background: lv > 0 ? `${color}20` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${lv > 0 ? color + "90" : "rgba(255,255,255,0.08)"}`,
                    fontFamily: "monospace", fontSize: "0.78rem", fontWeight: 800,
                    color: lv > 0 ? color : "var(--text-dim)",
                  }}>
                    {lv === 0 ? "—" : `Lv.${lv}`}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <button onClick={() => updateComponentLevel(idx, lv - 1)} style={{
                      width: 28, height: 28, borderRadius: 7,
                      border: `1px solid ${lv > 0 ? color + "60" : "rgba(255,255,255,0.08)"}`,
                      background: "rgba(0,0,0,0.4)",
                      color: lv > 0 ? color : "var(--text-dim)",
                      cursor: lv > 0 ? "pointer" : "not-allowed",
                      fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: lv === 0 ? 0.3 : 1,
                    }}>−</button>
                    <button onClick={() => updateComponentLevel(idx, lv + 1)} style={{
                      width: 28, height: 28, borderRadius: 7,
                      border: `1px solid ${color}60`,
                      background: lv > 0 ? `${color}15` : "rgba(0,0,0,0.4)",
                      color: color, cursor: "pointer",
                      fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CHIP ── */}
      {subTab === "chip" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Set selector */}
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2, 3].map((i) => {
              const unlocked = combatInfo.sets > i;
              const active = activeSet === i;
              const reqLabel = i === 0 ? "Lv.10" : i === 1 ? "Lv.150" : i === 2 ? "Lv.300" : "💎";
              return (
                <button key={i} onClick={() => { if (unlocked) setActiveSet(i); }} style={{
                  flex: 1, padding: "10px 4px", borderRadius: 8,
                  fontFamily: "inherit", cursor: unlocked ? "pointer" : "not-allowed",
                  background: active ? "rgba(59,130,246,0.2)" : unlocked ? "#0a1628" : "rgba(0,0,0,0.3)",
                  border: `2px solid ${active ? "#3B82F6" : unlocked ? "#1e3a5f" : "rgba(255,255,255,0.05)"}`,
                  color: active ? "#60A5FA" : unlocked ? "var(--text-secondary)" : "var(--text-dim)",
                  opacity: unlocked ? 1 : 0.4, transition: "all 0.15s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>Zestaw {i + 1}</span>
                  <span style={{ fontSize: "0.55rem", color: active ? "#3B82F6" : "var(--text-dim)" }}>
                    {unlocked ? (active ? "●" : "○") : `🔒 ${reqLabel}`}
                  </span>
                </button>
              );
            })}
          </div>

          {combatInfo.sets > 0 ? (
            <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 10, padding: "14px 12px" }}>

              {/* Unit type selector — sets vehicle for all 4 chips in this set */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {(["tank", "aircraft", "missile"] as DroneUnitType[]).map((unit) => {
                  const uc = CHIP_UNIT_COLORS[unit];
                  const sel = setUnit === unit;
                  const uLabel = unit === "tank" ? "Czołg" : unit === "aircraft" ? "Lotnictwo" : "Rakieta";
                  return (
                    <button key={unit} onClick={() => setChipSetUnit(sel ? null : unit)} style={{
                      flex: 1, borderRadius: 10, padding: "8px 4px",
                      border: `2px solid ${sel ? uc : `${uc}30`}`,
                      background: sel ? `${uc}15` : "rgba(255,255,255,0.02)",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                      cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      boxShadow: sel ? `0 0 12px ${uc}35` : "none",
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/drone/chip-${unit}-initial.png`} alt={uLabel} style={{
                        width: 56, height: 56, objectFit: "cover", borderRadius: 6,
                        filter: sel ? `drop-shadow(0 0 6px ${uc})` : "grayscale(0.6) opacity(0.55)",
                        transition: "filter 0.15s",
                      }} />
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, color: sel ? uc : "var(--text-dim)" }}>{uLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── Chip Gallery — kliknij lub przeciągnij do slota ── */}
              {setUnit && (() => {
                // Slot direction arrows matching the cross layout positions
                const SLOT_DIR: Record<ChipSlotKey, string> = {
                  initial:      "↑",   // top
                  attack:       "←",   // left
                  defense:      "→",   // right
                  interference: "↓",   // bottom
                };
                const SLOTS_ORDER: ChipSlotKey[] = ["initial", "attack", "defense", "interference"];

                const makeChipCard = (slot: ChipSlotKey, rar: "SR" | "UR") => {
                  const rarColor = rar === "UR" ? "#F97316" : "#8B5CF6";
                  const isEquipped = chipSet[slot].rarity === rar;
                  const stars = chipSet[slot].stars ?? 1;
                  const slotColor = CHIP_SLOT_COLORS_MAP[slot];
                  return (
                    <div
                      key={`${rar}-${slot}`}
                      draggable
                      onDragStart={(e) => {
                        draggingRef.current = true;
                        setDraggingChip({ slot, rarity: rar });
                        e.dataTransfer.setData("lw-chip", JSON.stringify({ slot, rarity: rar }));
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDraggingChip(null);
                        setTimeout(() => { draggingRef.current = false; }, 50);
                      }}
                      onClick={() => {
                        if (draggingRef.current) return;
                        if (isEquipped) {
                          updateChip(activeSet, slot, { rarity: "none" as DroneChipRarity });
                        } else {
                          updateChip(activeSet, slot, { rarity: rar as DroneChipRarity, unit: setUnit });
                          setSelectedSlot(slot);
                        }
                      }}
                      title={CHIP_SLOT_LABELS_MAP[slot]}
                      style={{
                        width: 62, flexShrink: 0,
                        borderRadius: 7, padding: "4px 3px 3px",
                        border: isEquipped ? `2px solid ${rarColor}` : `2px solid ${rarColor}25`,
                        background: isEquipped ? `${rarColor}15` : "rgba(255,255,255,0.02)",
                        cursor: "grab", textAlign: "center", position: "relative",
                        boxShadow: isEquipped ? `0 0 10px ${rarColor}35` : "none",
                        transition: "all 0.12s", userSelect: "none",
                      }}
                    >
                      {/* Direction arrow — shows which slot in the cross */}
                      <div style={{
                        fontSize: "0.55rem", fontWeight: 900,
                        color: isEquipped ? rarColor : `${slotColor}80`,
                        lineHeight: 1, marginBottom: 2,
                      }}>
                        {SLOT_DIR[slot]}
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getChipImage(setUnit, slot, rar)}
                        alt={slot}
                        draggable={false}
                        style={{ width: "100%", borderRadius: 4, display: "block", pointerEvents: "none" }}
                      />
                      {/* Slot label */}
                      <div style={{
                        fontSize: "0.38rem", fontWeight: 700,
                        color: isEquipped ? rarColor : `${slotColor}70`,
                        marginTop: 2, lineHeight: 1.2,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {CHIP_SLOT_LABELS_MAP[slot]}
                      </div>
                      {/* Stars badge */}
                      {isEquipped && (
                        <div style={{
                          position: "absolute", top: 2, right: 2,
                          background: "rgba(0,0,0,0.75)", borderRadius: 3,
                          fontSize: "0.38rem", fontWeight: 900, color: "#FFD700",
                          padding: "1px 2px", lineHeight: 1.4,
                        }}>★{stars}</div>
                      )}
                      {/* Equipped checkmark */}
                      {isEquipped && (
                        <div style={{
                          position: "absolute", top: 2, left: 2,
                          background: rarColor, borderRadius: "50%",
                          width: 9, height: 9, fontSize: "0.35rem",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 900,
                        }}>✓</div>
                      )}
                    </div>
                  );
                };

                return (
                  <div style={{ marginBottom: 14 }}>
                    {/* SSR row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                      <span style={{ fontSize: "0.52rem", fontWeight: 800, color: "#8B5CF6", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>SSR</span>
                      <div style={{ display: "flex", gap: 5 }}>
                        {SLOTS_ORDER.map(slot => makeChipCard(slot, "SR"))}
                      </div>
                    </div>
                    {/* UR row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: "0.52rem", fontWeight: 800, color: "#F97316", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>UR</span>
                      <div style={{ display: "flex", gap: 5 }}>
                        {SLOTS_ORDER.map(slot => makeChipCard(slot, "UR"))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Cross layout — T-shape matching the game:
                    [Inicjujący — top]
                         |
                [Atak] [ZAKŁÓCANIE — center, large] [Obrona]
              */}
              <div
                onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "86px 104px 86px",
                  gridTemplateRows: "86px 104px",
                  gap: 10,
                  margin: "0 auto", width: "fit-content",
                  borderRadius: 12, padding: 10,
                  border: isDragOver ? "2px dashed #60A5FA" : "2px dashed transparent",
                  background: isDragOver ? "rgba(59,130,246,0.06)" : "transparent",
                  transition: "all 0.15s",
                }}>

                {/* Row 1 Col 2: Inicjujący (top, centered above the hub) */}
                <div style={{ gridColumn: 2, gridRow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <ChipSlot slotKey="initial" label="Inicjujący" data={chipSet.initial} setUnit={setUnit}
                    onRarityChange={(r) => updateChip(activeSet, "initial", { rarity: r })}
                    onStarsChange={(s) => updateChip(activeSet, "initial", { stars: s })}
                    onSelect={() => { setSelectedSlot("initial"); setChipDrawerOpen(true); }}
                    isSelected={selectedSlot === "initial" && chipDrawerOpen}
                    isDragTarget={draggingChip?.slot === "initial"}
                    isBlocked={draggingChip !== null && draggingChip.slot !== "initial"}
                    onChipDrop={() => {
                      if (draggingChip && setUnit) {
                        updateChip(activeSet, "initial", { rarity: draggingChip.rarity as DroneChipRarity, unit: setUnit });
                        setSelectedSlot("initial"); setChipDrawerOpen(true);
                      }
                    }} />
                </div>

                {/* Row 2 Col 1: Atak (left) */}
                <div style={{ gridColumn: 1, gridRow: 2, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                  <ChipSlot slotKey="attack" label="Atak" data={chipSet.attack} setUnit={setUnit}
                    onRarityChange={(r) => updateChip(activeSet, "attack", { rarity: r })}
                    onStarsChange={(s) => updateChip(activeSet, "attack", { stars: s })}
                    onSelect={() => { setSelectedSlot("attack"); setChipDrawerOpen(true); }}
                    isSelected={selectedSlot === "attack" && chipDrawerOpen}
                    isDragTarget={draggingChip?.slot === "attack"}
                    isBlocked={draggingChip !== null && draggingChip.slot !== "attack"}
                    onChipDrop={() => {
                      if (draggingChip && setUnit) {
                        updateChip(activeSet, "attack", { rarity: draggingChip.rarity as DroneChipRarity, unit: setUnit });
                        setSelectedSlot("attack"); setChipDrawerOpen(true);
                      }
                    }} />
                </div>

                {/* Row 2 Col 2: Zakłócanie (CENTER hub — largest, most important) */}
                <div style={{ gridColumn: 2, gridRow: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ChipSlot slotKey="interference" label="Zakłócanie" data={chipSet.interference} setUnit={setUnit}
                    size={104}
                    onRarityChange={(r) => updateChip(activeSet, "interference", { rarity: r })}
                    onStarsChange={(s) => updateChip(activeSet, "interference", { stars: s })}
                    onSelect={() => { setSelectedSlot("interference"); setChipDrawerOpen(true); }}
                    isSelected={selectedSlot === "interference" && chipDrawerOpen}
                    isDragTarget={draggingChip?.slot === "interference"}
                    isBlocked={draggingChip !== null && draggingChip.slot !== "interference"}
                    onChipDrop={() => {
                      if (draggingChip && setUnit) {
                        updateChip(activeSet, "interference", { rarity: draggingChip.rarity as DroneChipRarity, unit: setUnit });
                        setSelectedSlot("interference"); setChipDrawerOpen(true);
                      }
                    }} />
                </div>

                {/* Row 2 Col 3: Obrona (right) */}
                <div style={{ gridColumn: 3, gridRow: 2, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                  <ChipSlot slotKey="defense" label="Obrona" data={chipSet.defense} setUnit={setUnit}
                    onRarityChange={(r) => updateChip(activeSet, "defense", { rarity: r })}
                    onStarsChange={(s) => updateChip(activeSet, "defense", { stars: s })}
                    onSelect={() => { setSelectedSlot("defense"); setChipDrawerOpen(true); }}
                    isSelected={selectedSlot === "defense" && chipDrawerOpen}
                    isDragTarget={draggingChip?.slot === "defense"}
                    isBlocked={draggingChip !== null && draggingChip.slot !== "defense"}
                    onChipDrop={() => {
                      if (draggingChip && setUnit) {
                        updateChip(activeSet, "defense", { rarity: draggingChip.rarity as DroneChipRarity, unit: setUnit });
                        setSelectedSlot("defense"); setChipDrawerOpen(true);
                      }
                    }} />
                </div>
              </div>

              {/* Chip Drawer is rendered at DronePanel root — see below */}
            </div>
          ) : (
            <div style={{
              background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 10,
              padding: 32, textAlign: "center",
              color: "var(--text-dim)", fontSize: "0.82rem", lineHeight: 1.6,
            }}>
              🔒<br />Odblokuj chipy<br />
              <span style={{ color: "#60A5FA", fontWeight: 700 }}>Wzmocnienie Bojowe Lv.10</span>
            </div>
          )}
        </div>
      )}

      {/* ── Chip Detail Drawer ── */}
      {chipDrawerOpen && selectedSlot && (
        <ChipDrawer
          slotKey={selectedSlot}
          data={chipSet[selectedSlot]}
          unit={setUnit}
          onRarityChange={(r) => updateChip(activeSet, selectedSlot, { rarity: r })}
          onStarsChange={(s) => updateChip(activeSet, selectedSlot, { stars: s })}
          onRemove={() => updateChip(activeSet, selectedSlot, { rarity: "none", stars: 1, unit: null })}
          onClose={() => setChipDrawerOpen(false)}
        />
      )}
    </div>
  );
}

// ── Chip Slot ────────────────────────────────────────────────

// Milestone star levels that give special bonuses (max = 10)
const CHIP_STAR_MILESTONES = [2, 5, 6, 8, 10];

function ChipSlot({
  slotKey, label, data, setUnit, onRarityChange, onStarsChange, onSelect, isSelected,
  isDragTarget, isBlocked, onChipDrop, size,
}: {
  slotKey: ChipSlotKey;
  label: string;
  data: DroneChipInfo;
  setUnit: DroneUnitType | null;
  onRarityChange: (r: DroneChipRarity) => void;
  onStarsChange: (s: number) => void;
  onSelect: () => void;
  isSelected: boolean;
  isDragTarget?: boolean;
  isBlocked?: boolean;
  onChipDrop?: () => void;
  size?: number;
}) {
  const px = size ?? 86;
  const hasChip = data.rarity !== "none" && setUnit !== null;
  const rarityColor = DRONE_RARITY_COLORS[data.rarity];
  const slotColor = CHIP_SLOT_COLORS_MAP[slotKey];
  const rarityOrder: DroneChipRarity[] = ["SR", "UR"];
  const stars = data.stars ?? 1;
  const isMilestone = CHIP_STAR_MILESTONES.includes(stars);

  // Border & glow based on drag state
  const borderStyle = isDragTarget
    ? `2px dashed #22C55E`
    : isSelected
      ? `2px solid #FCD34D`
      : hasChip ? `2px solid ${rarityColor}` : `2px dashed ${slotColor}40`;

  const boxShadowStyle = isDragTarget
    ? `0 0 20px #22C55E60`
    : isSelected ? `0 0 18px #FCD34D60`
    : hasChip ? `0 0 14px ${rarityColor}35` : "none";

  return (
    <div
      onClick={!isBlocked ? onSelect : undefined}
      onDragOver={(e) => { if (isDragTarget) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; } }}
      onDrop={(e) => {
        if (!isDragTarget) return;
        e.preventDefault();
        onChipDrop?.();
      }}
      style={{
        width: px, height: px, borderRadius: 8, overflow: "hidden",
        border: borderStyle,
        background: isDragTarget ? "rgba(34,197,94,0.08)" : "#060d1a",
        boxShadow: boxShadowStyle,
        position: "relative",
        cursor: isBlocked ? "not-allowed" : "pointer",
        opacity: isBlocked ? 0.35 : 1,
        transition: "all 0.15s",
      }}>
      {hasChip && setUnit ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={getChipImage(setUnit, slotKey, data.rarity)} alt={`${setUnit} ${slotKey}`} style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
          }} />
          {/* Rarity badge top-right — click to cycle SSR↔UR */}
          <button onClick={(e) => {
            e.stopPropagation();
            const idx = rarityOrder.indexOf(data.rarity);
            onRarityChange(rarityOrder[(idx + 1) % rarityOrder.length]);
          }} style={{
            position: "absolute", top: 2, right: 2,
            background: `rgba(0,0,0,0.75)`, border: `1.5px solid ${rarityColor}`,
            borderRadius: 4, padding: "2px 6px",
            fontSize: "0.6rem", fontWeight: 900, color: rarityColor,
            cursor: "pointer", fontFamily: "inherit", lineHeight: 1.4,
            backdropFilter: "blur(2px)",
            boxShadow: `0 0 6px ${rarityColor}60`,
          }}>
            {data.rarity}
          </button>
          {/* Slot type badge top-left */}
          <div style={{
            position: "absolute", top: 3, left: 3,
            background: "rgba(0,0,0,0.6)", borderRadius: 3,
            padding: "1px 4px", fontSize: "0.45rem", color: slotColor, fontWeight: 700,
            lineHeight: 1.7,
          }}>
            {CHIP_SLOT_SYMBOLS[slotKey]}
          </div>
          {/* Stars level bottom-left — click to increment (1→2→…→8→1) */}
          <button onClick={(e) => {
            e.stopPropagation();
            onStarsChange(stars < 10 ? stars + 1 : 1);
          }} style={{
            position: "absolute", bottom: 2, left: 2,
            background: isMilestone ? "rgba(255,215,0,0.25)" : "rgba(0,0,0,0.65)",
            border: isMilestone ? "1px solid #FFD700" : "none",
            borderRadius: 3, padding: "1px 4px",
            fontSize: "0.58rem", fontWeight: 900,
            color: isMilestone ? "#FFD700" : "rgba(255,255,255,0.55)",
            cursor: "pointer", fontFamily: "inherit", lineHeight: 1.4,
          }}>★{stars}</button>
          {/* Remove button bottom-right */}
          <button onClick={(e) => {
            e.stopPropagation();
            onRarityChange("none");
          }} style={{
            position: "absolute", bottom: 2, right: 2,
            background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 3,
            padding: "1px 4px", fontSize: "0.55rem", color: "rgba(255,255,255,0.4)",
            cursor: "pointer", fontFamily: "inherit", lineHeight: 1.4,
          }}>×</button>
        </>
      ) : (
        <div style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 6,
        }}>
          <div style={{ fontSize: "0.42rem", fontWeight: 700, color: `${slotColor}80`, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {CHIP_SLOT_SYMBOLS[slotKey]} {label}
          </div>
          {setUnit && (
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => onRarityChange("SR")} style={{
                background: "rgba(139,92,246,0.15)", border: "1.5px solid #8B5CF6",
                borderRadius: 4, padding: "3px 6px", fontSize: "0.55rem", fontWeight: 900,
                color: "#8B5CF6", cursor: "pointer", fontFamily: "inherit", lineHeight: 1.3,
              }}>SSR</button>
              <button onClick={() => onRarityChange("UR")} style={{
                background: "rgba(249,115,22,0.15)", border: "1.5px solid #F97316",
                borderRadius: 4, padding: "3px 6px", fontSize: "0.55rem", fontWeight: 900,
                color: "#F97316", cursor: "pointer", fontFamily: "inherit", lineHeight: 1.3,
              }}>UR</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Chip Drawer ──────────────────────────────────────────────

function ChipDrawer({
  slotKey, data, unit, onRarityChange, onStarsChange, onRemove, onClose,
}: {
  slotKey: ChipSlotKey;
  data: DroneChipInfo;
  unit: DroneUnitType | null;
  onRarityChange: (r: DroneChipRarity) => void;
  onStarsChange: (s: number) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);

  function triggerClose() {
    setClosing(true);
    setTimeout(onClose, 380);
  }

  const hasChip = data.rarity !== "none" && unit !== null;
  const rarityKey = data.rarity === "SR" ? "SSR" : data.rarity === "UR" ? "UR" : null;
  const def = rarityKey ? getChipDef(rarityKey, slotKey) : null;
  const stars = data.stars ?? 1;
  const rarityColor = DRONE_RARITY_COLORS[data.rarity] ?? CHIP_SLOT_COLORS_MAP[slotKey];
  const bp = rarityKey ? getChipBP(data.rarity as "SR" | "UR", stars) : null;
  const nextMilestone = rarityKey ? getNextMilestone(rarityKey, slotKey, stars) : null;
  const effect = (rarityKey && unit && hasChip) ? getChipEffectAtStars(rarityKey, slotKey, stars, unit) : null;

  const CHIP_MILESTONES_SET = new Set(CHIP_STAR_MILESTONES);

  return (
    <>
      <style>{`
        @keyframes lwChipDrawerUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes lwChipDrawerDown {
          from { transform: translateY(0); }
          to   { transform: translateY(100%); }
        }
        @keyframes lwChipBackdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lwChipBackdropOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={triggerClose}
        style={{
          animation: closing ? "lwChipBackdropOut 0.35s ease-in both" : "lwChipBackdropIn 0.28s ease-out both",
          position: "fixed", inset: 0, zIndex: 90,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "var(--surface)",
        borderTop: `3px solid ${rarityColor}`,
        borderRadius: "16px 16px 0 0",
        padding: "0 0 env(safe-area-inset-bottom)",
        maxHeight: "80vh",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        boxShadow: `0 -8px 40px ${rarityColor}40, 0 -2px 0 ${rarityColor}70`,
        animation: closing
          ? "lwChipDrawerDown 0.38s cubic-bezier(0.32, 0, 0.67, 0) both"
          : "lwChipDrawerUp 0.45s cubic-bezier(0.32, 0.72, 0, 1) both",
      }}>
        {/* Drag handle + header */}
        <div style={{
          padding: "12px 16px 0",
          background: `linear-gradient(180deg, ${rarityColor}12 0%, transparent 100%)`,
          flexShrink: 0,
        }}>
          {/* Handle bar */}
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 14px" }} />

          {/* Chip header */}
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
            {/* Chip image or placeholder */}
            <div style={{
              width: 72, height: 72, borderRadius: 10, overflow: "hidden", flexShrink: 0,
              border: `2px solid ${rarityColor}`, boxShadow: `0 0 14px ${rarityColor}50`,
              background: "#060d1a", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {hasChip && unit ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getChipImage(unit, slotKey, data.rarity)} alt={def?.namePL ?? slotKey}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "2rem" }}>{CHIP_SLOT_SYMBOLS[slotKey]}</span>
              )}
            </div>

            {/* Names + badges */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.65rem", color: CHIP_SLOT_COLORS_MAP[slotKey], fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>
                {CHIP_SLOT_SYMBOLS[slotKey]} {CHIP_SLOT_LABELS_MAP[slotKey]}
              </div>
              {def ? (
                <>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: rarityColor, lineHeight: 1.2, marginBottom: 2 }}>
                    {def.namePL}
                  </div>
                  <div style={{ fontSize: "0.62rem", color: "var(--text-dim)", marginBottom: 6 }}>{def.nameEN}</div>
                </>
              ) : (
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-dim)", marginBottom: 6 }}>
                  {unit ? "Wybierz rzadkość" : "Wybierz typ pojazdu"}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {hasChip && (
                  <span style={{
                    background: `${rarityColor}20`, border: `1px solid ${rarityColor}`,
                    borderRadius: 4, padding: "1px 7px", fontSize: "0.62rem", fontWeight: 700, color: rarityColor,
                  }}>{data.rarity}</span>
                )}
                {hasChip && bp && (
                  <span style={{
                    background: "rgba(96,165,250,0.12)", border: "1px solid #60A5FA60",
                    borderRadius: 4, padding: "1px 7px", fontSize: "0.62rem", fontWeight: 700, color: "#60A5FA",
                  }}>{bp.toLocaleString()} BP</span>
                )}
              </div>
            </div>

            {/* Close button */}
            <button onClick={triggerClose} style={{
              flexShrink: 0, width: 34, height: 34, borderRadius: 8,
              background: "var(--surface-2)", border: "1px solid var(--border)",
              color: "var(--text-dim)", cursor: "pointer", fontSize: "1.1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>

          {/* Rarity picker (only if chip slot has a vehicle unit set) */}
          {unit && (
            <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
              <span style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.06em" }}>RZADKOŚĆ</span>
              {(["SR", "UR"] as DroneChipRarity[]).map((r) => (
                <button key={r} onClick={() => onRarityChange(r)} style={{
                  padding: "5px 14px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 900,
                  background: data.rarity === r ? `${DRONE_RARITY_COLORS[r]}20` : "var(--surface-2)",
                  border: `1.5px solid ${data.rarity === r ? DRONE_RARITY_COLORS[r] : "var(--border)"}`,
                  color: data.rarity === r ? DRONE_RARITY_COLORS[r] : "var(--text-dim)",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.1s",
                }}>{r === "SR" ? "SSR" : "UR"}</button>
              ))}
              {hasChip && (
                <button onClick={() => { onRemove(); triggerClose(); }} style={{
                  marginLeft: "auto", fontSize: "0.68rem", padding: "5px 12px", borderRadius: 6,
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)",
                  color: "#EF4444", cursor: "pointer", fontFamily: "inherit",
                }}>Usuń czip</button>
              )}
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "0 16px 24px" }}>
          {hasChip ? (
            <>
              {/* ★ Star selector — 2 rows: 1-5 (Legendary) and 6-10 (Mythic) */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.06em" }}>POZIOM GWIAZDEK</span>
                  <span style={{ fontSize: "0.6rem", color: "var(--text-dim)" }}>
                    {stars <= 5 ? "✦ Legendary" : "⬟ Mythic"} · ★{stars}/10
                  </span>
                </div>

                {/* Row 1 — stars 1–5 (Legendary) */}
                <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                  {[1, 2, 3, 4, 5].map((s) => {
                    const isMile = CHIP_MILESTONES_SET.has(s);
                    const isActive = s === stars;
                    const isPast = s < stars;
                    return (
                      <button key={s} onClick={() => onStarsChange(s)} style={{
                        flex: 1, minWidth: 44, height: 44, borderRadius: 8,
                        fontSize: "0.75rem", fontWeight: 800,
                        background: isActive
                          ? (isMile ? "rgba(255,215,0,0.22)" : `${rarityColor}20`)
                          : isPast ? "rgba(255,255,255,0.05)" : "var(--surface-2)",
                        border: isActive
                          ? `2px solid ${isMile ? "#FFD700" : rarityColor}`
                          : isMile ? "1.5px dashed #FFD70050" : "1px solid var(--border)",
                        color: isActive
                          ? (isMile ? "#FFD700" : rarityColor)
                          : isMile ? "#FFD70070" : "var(--text-secondary)",
                        cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.1s",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                        boxShadow: isActive && isMile ? "0 0 10px #FFD70040" : isActive ? `0 0 8px ${rarityColor}40` : "none",
                      }}>
                        ★{s}
                        {isMile && <span style={{ fontSize: "0.38rem", opacity: 0.8, lineHeight: 1 }}>MILE</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Row 2 — stars 6–10 (Mythic) */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[6, 7, 8, 9, 10].map((s) => {
                    const isMile = CHIP_MILESTONES_SET.has(s);
                    const isActive = s === stars;
                    const isPast = s < stars;
                    return (
                      <button key={s} onClick={() => onStarsChange(s)} style={{
                        flex: 1, minWidth: 44, height: 44, borderRadius: 8,
                        fontSize: "0.75rem", fontWeight: 800,
                        background: isActive
                          ? (isMile ? "rgba(255,215,0,0.22)" : `${rarityColor}20`)
                          : isPast ? "rgba(255,255,255,0.05)" : "var(--surface-2)",
                        border: isActive
                          ? `2px solid ${isMile ? "#FFD700" : rarityColor}`
                          : isMile ? "1.5px dashed #FFD70050" : "1px solid var(--border)",
                        color: isActive
                          ? (isMile ? "#FFD700" : rarityColor)
                          : isMile ? "#FFD70070" : "var(--text-secondary)",
                        cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.1s",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                        boxShadow: isActive && isMile ? "0 0 10px #FFD70040" : isActive ? `0 0 8px ${rarityColor}40` : "none",
                      }}>
                        ★{s}
                        {isMile && <span style={{ fontSize: "0.38rem", opacity: 0.8, lineHeight: 1 }}>MILE</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trigger info */}
              {def && (
                <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", marginBottom: 10 }}>
                  <span style={{ color: "#94A3B8", fontWeight: 700 }}>Wyzwalacz: </span>{def.trigger}
                </div>
              )}

              {/* Effect at current stars */}
              {effect && (
                <div style={{
                  background: "rgba(15,30,61,0.8)", borderRadius: 10, padding: "12px 14px",
                  fontSize: "0.75rem", color: "#E2E8F0", lineHeight: 1.65, marginBottom: 12,
                  border: "1px solid rgba(59,130,246,0.2)",
                }}>
                  {effect}
                </div>
              )}

              {/* Next milestone */}
              {nextMilestone && (
                <div style={{
                  background: "rgba(253,211,77,0.08)", border: "1px solid #FCD34D50",
                  borderRadius: 10, padding: "10px 14px",
                  display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12,
                }}>
                  <span style={{ fontSize: "1rem", flexShrink: 0 }}>🎯</span>
                  <div>
                    <div style={{ fontSize: "0.62rem", color: "#FCD34D", fontWeight: 700, marginBottom: 3 }}>
                      Następny milestone: ★{nextMilestone.stars}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#E2E8F0", lineHeight: 1.5 }}>
                      {nextMilestone.note}
                    </div>
                  </div>
                </div>
              )}

              {/* Craft note */}
              <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", lineHeight: 1.5 }}>
                {data.rarity === "UR" && "⚠ Wymaga 2 kopii do aktywacji · Nie można użyć jako materiał Wzmocnienia Bojowego"}
                {data.rarity === "SR" && "✓ Można użyć jako materiał Wzmocnienia Bojowego"}
              </div>
            </>
          ) : (
            <div style={{
              textAlign: "center", padding: "32px 16px",
              color: "var(--text-dim)", fontSize: "0.8rem", lineHeight: 1.7,
            }}>
              {unit
                ? <>Wybierz rzadkość czipa (<strong style={{ color: DRONE_RARITY_COLORS.SR }}>SSR</strong> lub <strong style={{ color: DRONE_RARITY_COLORS.UR }}>UR</strong>) powyżej</>
                : <>Najpierw wybierz typ pojazdu dla tego zestawu czipów</>
              }
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<PlayerProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [decBldFillLv, setDecBldFillLv] = useState(0);
  const [decBldFillPr, setDecBldFillPr] = useState(3);
  const [activeTab, setActiveTab] = useState<TabId>("core");
  const [heroFilter, setHeroFilter] = useState<"all" | "owned" | HeroType>("all");
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [rSelectedCat, setRSelectedCat] = useState(0);
  const [rSelectedTreeId, setRSelectedTreeId] = useState(R_TREE_CATEGORIES[0].ids[0]);
  const [rActiveNode, setRActiveNode] = useState<ResearchNode | null>(null);
  const rSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
    setLoaded(true);
  }, []);

  function update<K extends keyof PlayerProfile>(key: K, value: PlayerProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function updateHero(heroId: string, data: HeroSave) {
    setProfile((prev) => ({
      ...prev,
      heroes: { ...prev.heroes, [heroId]: data },
    }));
    setSaved(false);
  }

  function getHeroData(heroId: string): HeroSave {
    return profile.heroes[heroId] ?? DEFAULT_HERO_SAVE;
  }

  function updateDrone(patch: Partial<DroneSave>) {
    setProfile((prev) => ({
      ...prev,
      drone: { ...DEFAULT_DRONE, ...prev.drone, ...patch },
    }));
    setSaved(false);
  }

  function getSquads(): SquadDef[] {
    const saved = profile.squads ?? [];
    return Array.from({ length: 4 }, (_, i) => saved[i] ?? { heroIds: [null, null, null, null, null] });
  }

  function updateSquad(idx: number, squad: SquadDef) {
    const squads = getSquads();
    squads[idx] = squad;
    update("squads", squads);
  }

  function updateBuildingLevel(id: string, level: number) {
    setProfile(prev => {
      const next: PlayerProfile = {
        ...prev,
        buildingLevels: { ...prev.buildingLevels, [id]: level },
        // Keep top-level fields in sync for backwards compat
        hqLevel: id === "headquarters" ? level : prev.hqLevel,
        barracksLevel: id === "barracks" ? level : prev.barracksLevel,
      };
      saveProfile(next);
      return next;
    });
    setSaved(false);
  }

  function updateResearchLevel(treeId: string, nodeId: string, level: number) {
    const key = `${treeId}/${nodeId}`;
    setProfile(prev => {
      const next = { ...prev, researchLevels: { ...prev.researchLevels, [key]: level } };
      if (rSaveTimeout.current) clearTimeout(rSaveTimeout.current);
      rSaveTimeout.current = setTimeout(() => saveProfile(next), 400);
      return next;
    });
    setSaved(false);
  }

  function handleSave() {
    saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    if (!confirm("Reset profile to defaults?")) return;
    clearProfile();
    setProfile(DEFAULT_PROFILE);
    setSaved(false);
  }

  const maxTroopTier = getMaxTroopTier(profile.barracksLevel);
  const vsTechMult = getVsTechMultiplier(profile.vsTechLevel);
  const vipConBonus = getVipConstructionBonus(profile.vipLevel);
  const vipResBonus = getVipResearchBonus(profile.vipLevel);
  const simStats = useMemo(() => computePlayerStats(profile), [profile]);
  const ownedCount = HEROES.filter((h) => profile.heroes[h.id]?.owned).length;

  const filteredHeroes = HEROES.filter((h) => {
    if (heroFilter === "owned") return profile.heroes[h.id]?.owned;
    if (heroFilter === "all") return true;
    return h.type === heroFilter;
  });

  if (!loaded) return null;

  const SaveBar = () => (
    <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
      <button onClick={handleReset} style={{
        padding: "8px 16px", borderRadius: 6, fontSize: "0.8rem",
        background: "var(--surface-2)", border: "1px solid var(--border)",
        color: "var(--text-secondary)", cursor: "pointer", fontFamily: "inherit",
      }}>
        Reset
      </button>
      <button onClick={handleSave} style={{
        padding: "8px 20px", borderRadius: 6, fontSize: "0.85rem", fontWeight: 700,
        background: saved ? "rgba(16,185,129,0.15)" : "var(--gold-glow)",
        border: `1px solid ${saved ? "rgba(16,185,129,0.5)" : "var(--gold)"}`,
        color: saved ? "#10B981" : "var(--gold)",
        cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
      }}>
        {saved ? "✓ Saved" : "Save"}
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", color: "var(--gold)", fontFamily: "monospace", textTransform: "uppercase", marginBottom: 8 }}>
          / Profile
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: "1.8rem", fontWeight: 700, color: "var(--text-primary)" }}>Player Profile</h1>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.875rem" }}>
              Saved locally · used by all calculators
            </p>
          </div>
          <SaveBar />
        </div>
      </div>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8, marginBottom: 24 }}>
        <StatBadge label="HQ" value={`${profile.hqLevel}`} />
        <StatBadge label="VIP" value={`${profile.vipLevel}`} color="var(--text-primary)" />
        <StatBadge label="Max Tier" value={`T${maxTroopTier}`} color={maxTroopTier >= 8 ? "var(--gold)" : "var(--text-secondary)"} />
        <StatBadge label="VS Tech" value={`×${vsTechMult}`} color="#EC4899" />
        <StatBadge label="Build" value={`+${vipConBonus + profile.constructionSpeedBonus}%`} color="#10B981" />
        <StatBadge label="Research" value={`+${vipResBonus + profile.researchSpeedBonus}%`} color="#8B5CF6" />
        <StatBadge label="Training" value={`+${profile.trainingSpeedBonus}%`} color="#F59E0B" />
        <StatBadge label="Heroes" value={`${ownedCount}/${HEROES.length}`} color="#EC4899" />
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 24,
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 8, padding: 4, overflowX: "auto",
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, minWidth: 100, padding: "9px 16px", borderRadius: 6, fontSize: "0.82rem", fontWeight: 600,
              background: activeTab === tab.id ? "var(--surface-2)" : "transparent",
              border: `1px solid ${activeTab === tab.id ? "var(--border)" : "transparent"}`,
              color: activeTab === tab.id ? "var(--gold)" : "var(--text-secondary)",
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, whiteSpace: "nowrap",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ════════════════ TAB: CORE ════════════════ */}
      {activeTab === "core" && (
        <>
          <Section title="/ Base — HQ & VIP">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {/* HQ Level */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  HQ Level <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(1–35)</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="range" min={1} max={35} value={profile.hqLevel}
                    onChange={(e) => update("hqLevel", parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: "var(--gold)" }} />
                  <input type="number" min={1} max={35} value={profile.hqLevel}
                    onChange={(e) => update("hqLevel", Math.max(1, Math.min(35, parseInt(e.target.value) || 1)))}
                    style={{ width: 56, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, padding: "5px 8px", color: "var(--text-primary)", fontFamily: "monospace", fontSize: "0.9rem", outline: "none", textAlign: "center" }} />
                </div>
              </div>
              {/* VIP Level */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  VIP Level <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(1–18)</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="range" min={1} max={18} value={profile.vipLevel}
                    onChange={(e) => update("vipLevel", parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: "var(--gold)" }} />
                  <input type="number" min={1} max={18} value={profile.vipLevel}
                    onChange={(e) => update("vipLevel", Math.max(1, Math.min(18, parseInt(e.target.value) || 1)))}
                    style={{ width: 56, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, padding: "5px 8px", color: "var(--text-primary)", fontFamily: "monospace", fontSize: "0.9rem", outline: "none", textAlign: "center" }} />
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
                  +{vipConBonus}% build · +{vipResBonus}% research
                </div>
              </div>
              {/* Honor Level (Poziom honoru) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Poziom honoru <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(0–600 · wartość wewnętrzna)</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="range" min={0} max={600} value={profile.honorLevel ?? 0}
                    onChange={(e) => update("honorLevel", parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: "var(--gold)" }} />
                  <input type="number" min={0} max={600} step={0.5} value={profile.honorLevel ?? 0}
                    onChange={(e) => update("honorLevel", Math.max(0, Math.min(600, parseFloat(e.target.value) || 0)))}
                    style={{ width: 56, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, padding: "5px 8px", color: "var(--text-primary)", fontFamily: "monospace", fontSize: "0.9rem", outline: "none", textAlign: "center" }} />
                </div>
                <label style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>
                  Bonus honoru HP (z ekranu bohatera, ta sama wartość dla wszystkich; nadpisuje poziom)
                  <input type="number" min={0} value={profile.honorHp ?? 0}
                    onChange={(e) => update("honorHp", Math.max(0, parseFloat(e.target.value) || 0))}
                    style={{ marginLeft: 8, width: 90, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, padding: "4px 8px", color: "var(--text-primary)", fontFamily: "monospace", textAlign: "center" }} />
                </label>
                <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
                  Dobierz tak, by HP honoru zgadzało się z „Bonus honoru” z ekranu bohatera (UR: 23 500 HP → 217,5; ułamki są interpolowane).
                </div>
              </div>
              {/* Premia budynku / Premia Drona z ekranu bohatera */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Płaskie bonusy z ekranu bohatera <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(nadpisują obliczone, 0 = licz automatycznie)</span>
                </label>
                {([["Premia budynku", "building"], ["Premia Drona", "drone"]] as const).map(([title, pre]) => (
                  <div key={pre} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-dim)", width: 96 }}>{title}</span>
                    {([["HP", "Hp"], ["ATK", "Atk"], ["DEF", "Def"]] as const).map(([lbl, suf]) => {
                      const key = `${pre}Flat${suf}` as "buildingFlatHp" | "buildingFlatAtk" | "buildingFlatDef" | "droneFlatHp" | "droneFlatAtk" | "droneFlatDef";
                      return (
                        <label key={key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: "var(--text-dim)" }}>
                          {lbl}
                          <input type="number" min={0} value={profile[key] ?? 0}
                            onChange={(e) => update(key, Math.max(0, parseFloat(e.target.value) || 0))}
                            style={{ width: 84, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, padding: "5px 8px", color: "var(--text-primary)", fontFamily: "monospace", fontSize: "0.9rem", outline: "none", textAlign: "center" }} />
                        </label>
                      );
                    })}
                  </div>
                ))}
              </div>
              {/* Skórki bazy (dane z gry) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Skórki bazy <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(założona = bonus „założona”, posiadane = bonus „w ekwipunku”)</span>
                </label>
                <select value={profile.equippedDecorationId ?? ""}
                  onChange={(e) => update("equippedDecorationId", e.target.value ? parseInt(e.target.value) : undefined)}
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, padding: "5px 8px", color: "var(--text-primary)" }}>
                  <option value="">założona: brak / domyślna</option>
                  {SKIN_LIST.map(sk => <option key={sk.id} value={sk.id}>{sk.name} — zał. {sk.wear}</option>)}
                </select>
                <div style={{ maxHeight: 180, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 6, padding: 6, display: "flex", flexDirection: "column", gap: 2 }}>
                  {SKIN_LIST.map(sk => (
                    <label key={sk.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.68rem", color: "var(--text-dim)" }}>
                      <input type="checkbox" checked={(profile.ownedDecorationIds ?? []).includes(sk.id)}
                        onChange={(e) => {
                          const cur = new Set(profile.ownedDecorationIds ?? []);
                          if (e.target.checked) cur.add(sk.id); else cur.delete(sk.id);
                          update("ownedDecorationIds", [...cur]);
                        }} />
                      {sk.name} <span style={{ opacity: 0.6 }}>(posiadana: {sk.gain || "—"})</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Kosmetyka */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Inne skórki % <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(spoza listy powyżej, opcjonalnie)</span>
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {([["HP", "cosmeticHpPct"], ["ATK", "cosmeticAtkPct"], ["DEF", "cosmeticDefPct"]] as const).map(([lbl, key]) => (
                    <label key={key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.7rem", color: "var(--text-dim)" }}>
                      {lbl}
                      <input type="number" min={0} step={0.5} value={profile[key] ?? 0}
                        onChange={(e) => update(key, Math.max(0, parseFloat(e.target.value) || 0))}
                        style={{ width: 56, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, padding: "5px 8px", color: "var(--text-primary)", fontFamily: "monospace", fontSize: "0.9rem", outline: "none", textAlign: "center" }} />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          <Section title="/ VS Tech — Duel VS Technology">
            <p style={{ margin: "0 0 14px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Multiplies all VS Day points. Unlocked with Valor Badges from Duel VS.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {VS_TECH_LEVELS.map((tech) => (
                <button key={tech.level} onClick={() => update("vsTechLevel", tech.level)} style={{
                  padding: "9px 16px", borderRadius: 6,
                  border: `1px solid ${profile.vsTechLevel === tech.level ? "#EC4899" : "var(--border)"}`,
                  background: profile.vsTechLevel === tech.level ? "rgba(236,72,153,0.12)" : "var(--surface-2)",
                  color: profile.vsTechLevel === tech.level ? "#EC4899" : "var(--text-secondary)",
                  fontWeight: profile.vsTechLevel === tech.level ? 700 : 400,
                  fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}>
                  {tech.name}
                  <span style={{ marginLeft: 6, fontSize: "0.7rem", opacity: 0.8, fontFamily: "monospace" }}>×{tech.multiplier}</span>
                </button>
              ))}
            </div>
            {profile.vsTechLevel > 0 && (
              <div style={{ padding: "10px 14px", background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.2)", borderRadius: 6, fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                All VS Day actions give <strong style={{ color: "#EC4899" }}>×{vsTechMult} pts</strong>.
                Example: 120 pts/min base → <strong style={{ color: "#EC4899" }}>{Math.round(120 * vsTechMult)} pts/min</strong> for you.
              </div>
            )}
          </Section>
        </>
      )}

      {/* ════════════════ TAB: HEROES ════════════════ */}
      {activeTab === "heroes" && (
        <>
          {/* Formation overview */}
          <FormationPanel heroes={HEROES} heroData={profile.heroes} />

          {/* Filter bar */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
            {([
              { val: "all",      label: "All",                  color: "var(--text-secondary)", icon: null },
              { val: "owned",    label: `Mine (${ownedCount})`, color: "var(--gold)",          icon: null },
              { val: "Tank",     label: "Tank",                 color: TYPE_COLORS.Tank,        icon: TYPE_ICON_URLS.Tank },
              { val: "Aircraft", label: "Aircraft",             color: TYPE_COLORS.Aircraft,    icon: TYPE_ICON_URLS.Aircraft },
              { val: "Missile",  label: "Missile",              color: TYPE_COLORS.Missile,     icon: TYPE_ICON_URLS.Missile },
            ] as { val: string; label: string; color: string; icon: string | null }[]).map(({ val, label, color, icon }) => (
              <button key={val} onClick={() => {
                setHeroFilter(val as typeof heroFilter);
                setSelectedHeroId(null);
              }} style={{
                padding: "7px 16px", borderRadius: 7, fontSize: "0.82rem",
                border: `1px solid ${heroFilter === val ? color : "var(--border)"}`,
                background: heroFilter === val ? `${color}18` : "var(--surface-2)",
                color: heroFilter === val ? color : "var(--text-secondary)",
                fontWeight: heroFilter === val ? 700 : 400,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {icon && <img src={icon} alt={val} width={16} height={16} style={{ objectFit: "contain" }} />}
                {label}
              </button>
            ))}
          </div>

          {/* Type counter strip */}
          <div style={{
            display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", marginBottom: 16,
            padding: "9px 14px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 7,
            fontSize: "0.72rem",
          }}>
            <span style={{ fontFamily: "monospace", letterSpacing: "0.06em", fontSize: "0.6rem", color: "var(--text-dim)" }}>COUNTERS:</span>
            {([
              { attacker: "Tank", victim: "Missile" },
              { attacker: "Aircraft", victim: "Tank" },
              { attacker: "Missile", victim: "Aircraft" },
            ] as { attacker: HeroType; victim: HeroType }[]).map(({ attacker, victim }) => (
              <span key={attacker} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <img src={TYPE_ICON_URLS[attacker]} alt={attacker} width={16} height={16} style={{ objectFit: "contain" }} />
                <strong style={{ color: TYPE_COLORS[attacker] }}>beats</strong>
                <img src={TYPE_ICON_URLS[victim]} alt={victim} width={16} height={16} style={{ objectFit: "contain" }} />
              </span>
            ))}
            <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: "var(--text-dim)" }}>
              counter type takes <strong style={{ color: "#fff" }}>80% dmg</strong>
            </span>
          </div>

          {/* Hero grid — compact portrait cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
            {filteredHeroes.map((hero) => (
              <HeroCard
                key={hero.id}
                hero={hero}
                data={getHeroData(hero.id)}
                selected={selectedHeroId === hero.id}
                onSelect={() => setSelectedHeroId(selectedHeroId === hero.id ? null : hero.id)}
                onChange={(d) => {
                  updateHero(hero.id, d);
                  if (!d.owned && selectedHeroId === hero.id) setSelectedHeroId(null);
                }}
              />
            ))}
          </div>

          {/* Detail panel — shown below grid, full width */}
          {(() => {
            const selHero = selectedHeroId ? HEROES.find((h) => h.id === selectedHeroId) : null;
            if (!selHero) return null;
            const selData = getHeroData(selHero.id);
            if (!selData.owned) return null;
            return (
              <HeroDetailPanel
                hero={selHero}
                data={selData}
                onChange={(d) => updateHero(selHero.id, d)}
                onClose={() => setSelectedHeroId(null)}
                hqLevel={profile.hqLevel}
              />
            );
          })()}
        </>
      )}

      {/* ════════════════ TAB: DRONE ════════════════ */}
      {activeTab === "drone" && (
        <DronePanel
          drone={{ ...DEFAULT_DRONE, ...profile.drone }}
          onChange={updateDrone}
          uavLevel={profile.uavLevel ?? 0}
          onUavLevelChange={(v) => update("uavLevel", v)}
        />
      )}

      {/* ════════════════ TAB: SQUADS ════════════════ */}
      {activeTab === "squads" && (
        <>
          <SquadBuilder
            squads={getSquads()}
            getHeroData={getHeroData}
            onUpdateSquad={updateSquad}
          />
          {/* Squad power summary */}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {getSquads().map((squad, i) => {
              const heroIds = squad.heroIds.filter(Boolean) as string[];
              const heroTotal = heroIds.reduce((sum, id) => sum + (simStats.heroPower[id] ?? 0), 0);
              const extras = computeSquadExtras(profile, i, heroIds.length);
              const troops = profile.squadTroops?.[i] || computeSquadTroops(profile, heroIds);
              const tier = profile.squadTroopTier?.[i] ?? 10;
              const firstType = HEROES.find(x => x.id === heroIds[0])?.type;
              const troopType = firstType === "Aircraft" ? 3 : firstType === "Missile" ? 2 : 1;
              const unitPower = troops > 0 ? computeUnitPower(profile, troops, tier, troopType) : (profile.squadUnitPower?.[i] ?? 0);
              const total = heroTotal;
              const squadStrength = heroTotal + extras.droneSkillPower + extras.chipPower + extras.overlordPower + unitPower;
              const heroes = heroIds.map(id => {
                const h = HEROES.find(x => x.id === id);
                const pw = simStats.heroPower[id] ?? 0;
                return { name: h?.name ?? id, pw };
              });
              if (total === 0 && heroIds.length === 0) return null;
              return (
                <div key={i} style={{
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  borderRadius: 10, padding: "12px 14px",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                      Zestaw {i + 1}
                    </span>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#06B6D4" }}>
                      {total > 0 ? `Siła oddziału: ${(squadStrength / 1e6).toFixed(2)}M` : "—"}
                    </span>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.65rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                    <tbody>
                      {([["Moc bohatera", heroTotal], ["Moc jednostki", unitPower], ["Moc umiejętności drona", extras.droneSkillPower], ["Moc chipa umiejętności", extras.chipPower], ["Władca (moc własna, wpisz z gry)", extras.overlordPower]] as [string, number][]).map(([lbl, v]) => (
                        <tr key={lbl}><td style={{ padding: "1px 0" }}>{lbl}</td>
                          <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                            {lbl.startsWith("Moc jednostki") ? (
                              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                                <input type="number" min={0} title="Liczba żołnierzy w oddziale (liczona z pojemności bohaterów i Władcy; wpisz wartość, aby nadpisać)" placeholder="żołnierze" value={troops || ""}
                                  onChange={(e) => { const arr = [...(profile.squadTroops ?? [])]; arr[i] = Math.max(0, parseInt(e.target.value) || 0); update("squadTroops", arr); }}
                                  style={{ width: 70, background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 5, padding: "2px 6px", color: "var(--text-primary)", textAlign: "right" }} />
                                <input type="number" min={1} max={11} title="Tier żołnierzy" value={tier}
                                  onChange={(e) => { const arr = [...(profile.squadTroopTier ?? [])]; arr[i] = Math.max(1, Math.min(11, parseInt(e.target.value) || 10)); update("squadTroopTier", arr); }}
                                  style={{ width: 40, background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 5, padding: "2px 6px", color: "var(--text-primary)", textAlign: "right" }} />
                                {Math.round(v).toLocaleString("pl-PL")}
                              </span>
                            ) : Math.round(v).toLocaleString("pl-PL")}
                          </td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {heroes.map(({ name, pw }) => (
                      <span key={name} style={{
                        fontSize: "0.6rem", background: "var(--surface-3, var(--surface-1))",
                        border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px",
                        color: "var(--text-secondary)",
                      }}>
                        {name}: {pw > 0 ? `${(pw / 1e6).toFixed(2)}M` : "—"}
                      </span>
                    ))}
                  </div>
                  {/* Per-hero power breakdown */}
                  {heroIds.map(id => {
                    const bd = simStats.heroPowerBreakdown?.[id];
                    if (!bd) return null;
                    const h = HEROES.find(x => x.id === id);
                    const fmt = (n: number) => Math.round(n).toLocaleString("pl-PL");
                    return (
                      <div key={id} style={{ marginTop: 10, fontSize: "0.65rem", color: "var(--text-secondary)" }}>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                          {h?.name ?? id} — rozkład mocy
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <tbody>
                            {[
                              ["Właściwości (HP/ATK/DEF/Crit)", bd.propertyPower],
                              ["  HP × 0.5", Math.round(bd.flatHp * 0.5)],
                              ["  ATK × 12.5", Math.round(bd.flatAtk * 12.5)],
                              ["  DEF × 35", Math.round(bd.flatDef * 35)],
                              ["  CritRate × 313600", Math.round(bd.critRate * 313600)],
                              ["  CritDmg × 78400", Math.round(bd.critDmg * 78400)],
                              ["Umiejętności", bd.skillPower],
                              ["Ekwipunek (upgrade)", bd.upgradePow],
                              ["Ekwipunek (promote)", bd.promotePow],
                              ["Broń ekskluzywna", bd.ewPower],
                              ["RAZEM", bd.propertyPower + bd.skillPower + bd.gearPower + bd.ewPower],
                            ].map(([label, val]) => (
                              <tr key={label as string} style={label === "RAZEM" ? { fontWeight: 700, color: "var(--text-primary)" } : {}}>
                                <td style={{ padding: "1px 0", paddingRight: 8 }}>{label}</td>
                                <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmt(val as number)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <SquadPowerPanel heroes={profile.heroes} />

          {/* Debug download button */}
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => {
                const debugData = {
                  profile: {
                    hqLevel: profile.hqLevel,
                    vipLevel: profile.vipLevel,
                    honorLevel: profile.honorLevel,
                    heroes: profile.heroes,
                    drone: profile.drone,
                    researchLevels: profile.researchLevels,
                    apsResearchLevels: profile.apsResearchLevels,
                    buildingLevels: profile.buildingLevels,
                    decorationBonusHp: profile.decorationBonusHp,
                    decorationBonusAtk: profile.decorationBonusAtk,
                    decorationBonusDef: profile.decorationBonusDef,
                    decorationBuildingGroups: profile.decorationBuildingGroups,
                    ownedDecorationIds: profile.ownedDecorationIds,
                    seasonMilitaryRank: profile.seasonMilitaryRank,
                    uavLevel: profile.uavLevel,
                  },
                  sim: {
                    heroAbsoluteStats: simStats.heroAbsoluteStats,
                    heroPower: simStats.heroPower,
                    heroPowerBreakdown: simStats.heroPowerBreakdown,
                    heroHpPct: simStats.heroHpPct,
                    heroAtkPct: simStats.heroAtkPct,
                    heroDefPct: simStats.heroDefPct,
                    heroFlatHp: simStats.heroFlatHp,
                    heroFlatAtk: simStats.heroFlatAtk,
                    heroFlatDef: simStats.heroFlatDef,
                    droneFlatHp: simStats.droneFlatHp,
                    droneFlatAtk: simStats.droneFlatAtk,
                    droneFlatDef: simStats.droneFlatDef,
                  },
                };
                const blob = new Blob([JSON.stringify(debugData, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "lastwar-sim-debug.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={{
                fontSize: "0.72rem", padding: "5px 12px",
                background: "var(--surface-2)", border: "1px solid var(--border)",
                borderRadius: 6, color: "var(--text-secondary)", cursor: "pointer",
              }}
            >
              ⬇ Pobierz dane debug (JSON)
            </button>
          </div>
        </>
      )}

      {/* ════════════════ TAB: RESEARCH ════════════════ */}
      {activeTab === "research" && (() => {
        const researchLevels = profile.researchLevels ?? {};
        const rSelectedTree = R_TREES.find(t => t.id === rSelectedTreeId)!;
        return (
          <div>
            {/* Category tabs */}
            <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:8, marginBottom:8 }}>
              {R_TREE_CATEGORIES.map((cat, i) => (
                <button key={cat.label} onClick={() => { setRSelectedCat(i); setRSelectedTreeId(cat.ids[0]); }} style={{
                  flexShrink:0, fontSize:"0.65rem", fontWeight:600, padding:"5px 12px", borderRadius:20,
                  background: rSelectedCat===i ? "rgba(6,182,212,0.18)" : "var(--surface-2)",
                  border:`1px solid ${rSelectedCat===i ? "#06B6D4" : "var(--border)"}`,
                  color: rSelectedCat===i ? "#06B6D4" : "var(--text-dim)",
                  cursor:"pointer", fontFamily:"inherit",
                }}>{cat.label}</button>
              ))}
            </div>

            {/* Tree selector */}
            <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
              {R_TREE_CATEGORIES[rSelectedCat].ids.map(treeId => {
                const tree = R_TREES.find(t => t.id === treeId);
                if (!tree) return null;
                const done = tree.nodes.filter(n => (researchLevels[`${treeId}/${n.id}`] ?? 0) >= n.maxLevel).length;
                const pct = Math.round((done / tree.nodes.length) * 100);
                return (
                  <button key={treeId} onClick={() => setRSelectedTreeId(treeId)} style={{
                    flexShrink:0, fontSize:"0.6rem", fontWeight:600, padding:"5px 10px", borderRadius:8,
                    background: rSelectedTreeId===treeId ? "rgba(6,182,212,0.15)" : "var(--surface-2)",
                    border:`1px solid ${rSelectedTreeId===treeId ? "#06B6D4" : "var(--border)"}`,
                    color: rSelectedTreeId===treeId ? "#06B6D4" : "var(--text-dim)",
                    cursor:"pointer", fontFamily:"inherit", textAlign:"center" as const,
                  }}>
                    <div>{R_TREE_NAME[treeId]}</div>
                    {pct>0 && <div style={{ fontSize:"0.5rem", color:pct===100?"#06B6D4":"var(--text-dim)", marginTop:1 }}>{pct}%</div>}
                  </button>
                );
              })}
            </div>

            {/* Tree view */}
            {rSelectedTree && (
              <ResearchTreeViewEmbed
                key={rSelectedTree.id}
                tree={rSelectedTree}
                researchLevels={researchLevels}
                onNodeTap={node => setRActiveNode(node)}
              />
            )}

            {/* Node detail sheet */}
            {rActiveNode && rSelectedTree && (
              <NodeDetailEmbed
                tree={rSelectedTree}
                node={rActiveNode}
                currentLevel={researchLevels[`${rSelectedTree.id}/${rActiveNode.id}`] ?? 0}
                onLevelChange={level => updateResearchLevel(rSelectedTree.id, rActiveNode.id, level)}
                onClose={() => setRActiveNode(null)}
              />
            )}
          </div>
        );
      })()}

      {/* ════════════════ TAB: BUILDINGS ════════════════ */}
      {activeTab === "buildings" && (() => {
        // Merge top-level hqLevel/barracksLevel into buildingLevels for display
        const bldLevels: Record<string, number> = {
          headquarters: profile.hqLevel,
          barracks: profile.barracksLevel,
          ...profile.buildingLevels,
        };
        return (
          <>
            <BuildingsPanel
              buildingLevels={bldLevels}
              onUpdate={updateBuildingLevel}
            />
            {/* Decoration Building Level — per-group */}
            {(() => {
              // Stat types per group (which stats each group can give)
              const GRP_STATS: Record<number, string[]> = {
                1:[" HP"],2:["DEF"],3:[" HP"],4:["ATK"],5:[" HP"],6:["ATK"],7:["DEF"],
                8:[" HP","ATK"],9:[" HP","ATK","DEF"],10:[" HP","DEF"],11:["ATK","DEF"],
                12:[" HP","ATK","DEF"],13:[" HP","ATK","DEF"],14:["ATK"],15:["ATK"],
                16:["ATK"],17:["ATK"],18:[" HP"],19:["ATK"],20:["DEF"],21:[" HP"],
                22:["ATK"],23:[" HP"],24:["ATK"],25:[" HP"],26:["ATK"],27:["ATK"],
                28:[" HP"],29:[" HP","ATK"],30:[" HP"],31:[" HP"],32:["ATK"],33:[" HP"],
                34:["ATK"],35:[" HP"],36:[" HP"],37:[" HP"],38:["ATK"],39:["ATK"],
                40:[" HP"],41:[" HP"],42:["ATK"],43:[" HP"],
              };
              const STAT_COLOR: Record<string, string> = {" HP":"#34D399","ATK":"#F87171","DEF":"#60A5FA"};
              // Names derived from in-game locale strings (building_name* / item_name* / desc)
              const GRP_NAMES: Record<number, string> = {
                1:"Loyal Dog",2:"Silver Aircraft",3:"Silver Tank",4:"Silver Missile",
                5:"Gold Tank",6:"Gold Missile",7:"Gold Aircraft",8:"Clock Tower",
                9:"Liberty Statue",10:"Eiffel Tower",11:"Ferris Wheel",12:"Neon Sign",
                13:"Jack-o'-Lantern",14:"Harvest Float",15:"Silver Warrior",
                16:"Golden Marshal",17:"Christmas Tree",18:"Christmas Snowman",
                19:"Win in 2024",20:"Military Monument",21:"Training Tire",
                22:"Tower of Victory",23:"Spring Bell",24:"New Year Dragon",
                25:"Valentine Bear",26:"Spring Garden",27:"Easter Bunny",
                28:"Easter Egg",29:"Adventure Stele",30:"Foodie Float",
                31:"Colorful Float",32:"Music Box",33:"Concert Stage",
                34:"Olympic Torch",35:"Moon Rocket",36:"Starry Rocket",
                37:"Halloween Pumpkin",38:"Cornucopia",39:"New Year 2025",
                40:"Christmas Scene",41:"Flower Carriage",42:"Assault Trooper",
                43:"Memorial Statue",
              };
              // Rarity tier per group (SR=silver, SSR=gold, UR=ultra)
              const GRP_RARITY: Record<number, "SR"|"SSR"|"UR"> = {
                1:"SR", 2:"SR", 3:"SR", 4:"SR", 15:"SR",
                5:"SSR", 6:"SSR", 7:"SSR", 8:"SSR", 10:"SSR", 11:"SSR",
                17:"SSR", 18:"SSR", 20:"SSR", 21:"SSR",
                9:"UR", 12:"UR", 13:"UR", 14:"UR", 16:"UR", 19:"UR",
                22:"UR", 23:"UR", 24:"UR", 25:"UR", 26:"UR", 27:"UR",
                28:"UR", 29:"UR", 30:"UR", 31:"UR", 32:"UR", 33:"UR",
                34:"UR", 35:"UR", 36:"UR", 37:"UR", 38:"UR", 39:"UR",
                40:"UR", 41:"UR", 42:"UR", 43:"UR",
              };
              const RARITY_ORDER: ("UR"|"SSR"|"SR")[] = ["UR","SSR","SR"];
              const RARITY_COLOR: Record<string,string> = { UR:"#F59E0B", SSR:"#A78BFA", SR:"#94A3B8" };
              const sortedGrps = Array.from({length:43},(_,i)=>i+1).sort((a,b)=>{
                const ra = RARITY_ORDER.indexOf(GRP_RARITY[a]??"SR");
                const rb = RARITY_ORDER.indexOf(GRP_RARITY[b]??"SR");
                return ra !== rb ? ra - rb : a - b;
              });

              const groups = profile.decorationBuildingGroups ?? {};

              const updateGroup = (grp: number, level: number, progress: number) => {
                const next = { ...groups };
                if (!level) { delete next[grp]; }
                else { next[grp] = { level, progress: progress || 1 }; }
                update("decorationBuildingGroups", next);
              };

              // Quick-fill: set all 43 groups to given level/progress
              const fillLv = decBldFillLv;
              const setFillLv = setDecBldFillLv;
              const fillPr = decBldFillPr;
              const setFillPr = setDecBldFillPr;

              const applyFill = () => {
                if (!fillLv) { update("decorationBuildingGroups", {}); return; }
                const next: Record<number, {level:number;progress:number}> = {};
                for (let g = 1; g <= 43; g++) next[g] = { level: fillLv, progress: fillPr };
                update("decorationBuildingGroups", next);
              };

              const activeCount = Object.keys(groups).length;

              const ovHp  = profile.decorationBonusHp  ?? 0;
              const ovAtk = profile.decorationBonusAtk ?? 0;
              const ovDef = profile.decorationBonusDef ?? 0;
              const hasOverride = ovHp > 0 || ovAtk > 0 || ovDef > 0;

              return (
                <div style={{ marginTop: 16, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "16px 18px" }}>

                  {/* Manual override from game "Szczegóły bonusów dekoracji" */}
                  <div style={{ marginBottom: 14, padding: "10px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}>
                    <div style={{ fontSize: "0.6rem", fontFamily: "monospace", color: "#A78BFA", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                      📋 Szczegóły bonusów dekoracji — override
                    </div>
                    <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", marginBottom: 8 }}>
                      Wpisz wartości z ekranu „HP/ATK/DEF Bohatera i Władcy". Jeśli wypełnione, sim używa tych wartości zamiast per-group.
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {([["HP","decorationBonusHp","#F87171"],["ATK","decorationBonusAtk","#FB923C"],["DEF","decorationBonusDef","#34D399"]] as const).map(([label, key, color]) => (
                        <label key={key} style={{ display:"flex", flexDirection:"column", gap:3 }}>
                          <span style={{ fontSize:"0.58rem", color, fontFamily:"monospace" }}>{label}</span>
                          <input
                            type="number" min={0} value={(profile[key] as number) || ""}
                            placeholder="0"
                            onChange={e => update(key, Number(e.target.value) || 0)}
                            style={{ width:100, background:"var(--surface-2)", border:`1px solid ${hasOverride ? color : "var(--border)"}`, borderRadius:5, color:"var(--text-primary)", fontSize:"0.75rem", padding:"4px 7px" }}
                          />
                        </label>
                      ))}
                      {hasOverride && (
                        <button onClick={() => { update("decorationBonusHp",0); update("decorationBonusAtk",0); update("decorationBonusDef",0); }}
                          style={{ alignSelf:"flex-end", fontSize:"0.65rem", padding:"4px 10px", background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:5, color:"var(--text-dim)", cursor:"pointer" }}>
                          Wyczyść
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: "0.58rem", fontFamily: "monospace", color: "#A78BFA", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                        🏛️ Budynki Dekoracji ({activeCount}/43 aktywnych) {hasOverride && <span style={{color:"#F59E0B"}}>— OVERRIDE aktywny</span>}
                      </div>
                      <div style={{ fontSize: "0.58rem", color: "#F59E0B", marginTop: 2 }}>
                        ⚠ Lv1/Lv2 — szacowane (para_ew×9); dokładność ~±20%
                      </div>
                    </div>
                    {/* Quick-fill all groups */}
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-dim)" }}>Wszystkie →</span>
                      <select value={fillLv} onChange={e => setFillLv(Number(e.target.value))}
                        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-primary)", fontSize: "0.7rem", padding: "3px 6px" }}>
                        <option value={0}>—</option>
                        {[1,2,3,4,5,6].map(l => <option key={l} value={l}>{l<=2?`Lv${l}⚠`:`Lv${l}`}</option>)}
                      </select>
                      <select value={fillPr} onChange={e => setFillPr(Number(e.target.value))}
                        style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 5, color: "var(--text-primary)", fontSize: "0.7rem", padding: "3px 6px" }}>
                        {[1,2,3].map(p => <option key={p} value={p}>★{p}</option>)}
                      </select>
                      <button onClick={applyFill}
                        style={{ background: "#7C3AED", color: "#fff", border: "none", borderRadius: 5, padding: "3px 10px", fontSize: "0.65rem", cursor: "pointer", fontWeight: 700 }}>
                        Ustaw
                      </button>
                    </div>
                  </div>

                  {/* Grid: 43 building groups, sorted UR → SSR → SR */}
                  {RARITY_ORDER.map(rarity => {
                    const rarityGrps = sortedGrps.filter(g => (GRP_RARITY[g] ?? "SR") === rarity);
                    return (
                      <div key={rarity} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: "0.55rem", fontFamily: "monospace", letterSpacing: "0.12em", textTransform: "uppercase", color: RARITY_COLOR[rarity], marginBottom: 5, paddingLeft: 2 }}>
                          {rarity} — {rarityGrps.length} budynków
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 5 }}>
                          {rarityGrps.map(grp => {
                            const cur = groups[grp];
                            const stats = GRP_STATS[grp] ?? [];
                            return (
                              <div key={grp} style={{
                                background: cur ? "rgba(124,58,237,0.10)" : "var(--surface)",
                                border: `1px solid ${cur ? RARITY_COLOR[rarity]+"66" : "var(--border)"}`,
                                borderRadius: 7, padding: "7px 9px",
                                display: "flex", alignItems: "center", gap: 7
                              }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: "0.68rem", color: cur ? "var(--text-primary)" : "var(--text-dim)", fontWeight: cur ? 600 : 400, lineHeight: 1.3 }}>
                                    {GRP_NAMES[grp] ?? `#${grp}`}
                                  </div>
                                  <div style={{ display: "flex", gap: 3, marginTop: 3 }}>
                                    {stats.map(s => (
                                      <span key={s} style={{ fontSize: "0.52rem", fontWeight: 700, color: STAT_COLOR[s], background: STAT_COLOR[s]+"22", borderRadius: 3, padding: "1px 4px" }}>{s.trim()}</span>
                                    ))}
                                  </div>
                                </div>
                                <select value={cur?.level ?? 0}
                                  onChange={e => updateGroup(grp, Number(e.target.value), cur?.progress ?? 3)}
                                  style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-primary)", fontSize: "0.68rem", padding: "2px 5px" }}>
                                  <option value={0}>—</option>
                                  {[1,2,3,4,5,6].map(l => <option key={l} value={l}>{l<=2?`Lv${l}⚠`:`Lv${l}`}</option>)}
                                </select>
                                <select value={cur?.progress ?? 1}
                                  disabled={!cur?.level}
                                  onChange={e => updateGroup(grp, cur?.level ?? 3, Number(e.target.value))}
                                  style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 4, color: cur ? "var(--text-primary)" : "var(--text-dim)", fontSize: "0.68rem", padding: "2px 5px" }}>
                                  {[1,2,3].map(p => <option key={p} value={p}>★{p}</option>)}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </>
        );
      })()}

      {/* ════════════════ TAB: MILITARY ════════════════ */}
      {activeTab === "military" && (
        <>
          {/* Combat Bonus Summary */}
          <Section title="/ Combat Bonuses (Research + WoH + EW)">
            <VsTechBanner multiplier={simStats.vsTechMultiplier} vsTechLevel={profile.vsTechLevel} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 16 }}>
              <TypeCombatCard type="Tank"     stats={simStats.tank}     color={TYPE_COLORS["Tank"]}     icon={TYPE_ICON_URLS["Tank"]} />
              <TypeCombatCard type="Aircraft" stats={simStats.aircraft} color={TYPE_COLORS["Aircraft"]} icon={TYPE_ICON_URLS["Aircraft"]} />
              <TypeCombatCard type="Missile"  stats={simStats.missile}  color={TYPE_COLORS["Missile"]}  icon={TYPE_ICON_URLS["Missile"]} />
            </div>
            {/* Hero research bonuses */}
            {(simStats.heroAtkPct.total > 0 || simStats.heroDefPct.total > 0 || simStats.heroHpPct.total > 0) && (
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: "0.58rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 8 }}>HERO STAT BONUSES (Research)</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[
                    { label: "ATK", pct: simStats.heroAtkPct, col: "#F87171" },
                    { label: "DEF", pct: simStats.heroDefPct, col: "#60A5FA" },
                    { label: "HP",  pct: simStats.heroHpPct,  col: "#34D399" },
                  ].map(({ label, pct, col }) => pct.total > 0 ? (
                    <div key={label} style={{ background: "var(--surface)", borderRadius: 7, padding: "7px 12px", minWidth: 80 }}>
                      <div style={{ fontSize: "0.52rem", color: "var(--text-dim)", marginBottom: 4, fontFamily: "monospace" }}>{label}</div>
                      <BonusBreakdown pct={pct} color={col} />
                    </div>
                  ) : null)}
                </div>
              </div>
            )}
          </Section>

          {/* Troop power estimator */}
          <Section title="/ Troop Power Estimator">
            <TroopPowerCalc stats={simStats} />
          </Section>

          <Section title="/ Barracks & Military">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Barracks Level <span style={{ color: "var(--text-dim)", fontWeight: 400 }}>(1–30)</span>
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="range" min={1} max={30} value={profile.barracksLevel}
                    onChange={(e) => update("barracksLevel", parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: "var(--gold)" }} />
                  <input type="number" min={1} max={30} value={profile.barracksLevel}
                    onChange={(e) => update("barracksLevel", Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                    style={{ width: 56, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, padding: "5px 8px", color: "var(--text-primary)", fontFamily: "monospace", fontSize: "0.9rem", outline: "none", textAlign: "center" }} />
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
                  Max tier: <strong style={{ color: "var(--gold)" }}>T{maxTroopTier}</strong>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Training speed (troops/h)
                </label>
                <input type="number" min={0} value={profile.trainingSpeedPerHour || ""}
                  onChange={(e) => update("trainingSpeedPerHour", Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="e.g. 120"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 5, padding: "8px 12px", color: "var(--text-primary)", fontFamily: "monospace", fontSize: "1rem", outline: "none" }} />
                <div style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>
                  Visible in Barracks → training queue
                </div>
              </div>
            </div>

            {/* Tier unlock grid */}
            <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 8, letterSpacing: "0.08em" }}>
              UNLOCKED TIERS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 6 }}>
              {[
                { tier: 1, barracks: 1 }, { tier: 2, barracks: 4 }, { tier: 3, barracks: 6 },
                { tier: 4, barracks: 10 }, { tier: 5, barracks: 14 }, { tier: 6, barracks: 17 },
                { tier: 7, barracks: 20 }, { tier: 8, barracks: 24 }, { tier: 9, barracks: 27 },
                { tier: 10, barracks: 30 },
              ].map(({ tier, barracks }) => {
                const unlocked = profile.barracksLevel >= barracks;
                const isCurrent = tier === maxTroopTier;
                return (
                  <div key={tier} style={{
                    padding: "6px 8px", borderRadius: 5, textAlign: "center",
                    background: isCurrent ? "rgba(245,158,11,0.12)" : unlocked ? "rgba(16,185,129,0.06)" : "var(--surface-2)",
                    border: `1px solid ${isCurrent ? "var(--gold)" : unlocked ? "rgba(16,185,129,0.3)" : "var(--border)"}`,
                    opacity: unlocked ? 1 : 0.45,
                  }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, fontFamily: "monospace", color: isCurrent ? "var(--gold)" : unlocked ? "#10B981" : "var(--text-dim)" }}>
                      T{tier}
                    </div>
                    <div style={{ fontSize: "0.55rem", color: "var(--text-dim)" }}>B{barracks}</div>
                    <div style={{ fontSize: "0.55rem", color: unlocked ? "#10B981" : "var(--text-dim)" }}>{unlocked ? "✓" : "🔒"}</div>
                  </div>
                );
              })}
            </div>
          </Section>
        </>
      )}

      {/* ════════════════ TAB: ECONOMY ════════════════ */}
      {activeTab === "economy" && (
        <>
          {/* Computed totals summary */}
          <Section title="/ Computed Totals">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
              {[
                { label: "Construction",   pct: simStats.economy.constructionSpeedPct, col: "#A78BFA", suffix: "% speed" },
                { label: "Research",       pct: simStats.economy.researchSpeedPct,     col: "#A78BFA", suffix: "% speed" },
                { label: "Training Spd",   pct: simStats.economy.trainingSpeedPct,     col: "#A78BFA", suffix: "% speed" },
                { label: "Training Batch", pct: simStats.economy.trainingBatchPct,     col: "#F59E0B", suffix: "%" },
                { label: "Healing Spd",    pct: simStats.economy.healingSpeedPct,      col: "#F9A8D4", suffix: "% speed" },
                { label: "Hospital Cap",   pct: simStats.economy.hospitalCapacityPct,  col: "#F9A8D4", suffix: "%" },
                { label: "Build Cost",     pct: simStats.costReductions.buildingCostPct,  col: "#6EE7B7", suffix: "% red." },
                { label: "Research Cost",  pct: simStats.costReductions.researchCostPct,  col: "#6EE7B7", suffix: "% red." },
                { label: "Heal Cost",      pct: simStats.costReductions.healingCostPct,   col: "#6EE7B7", suffix: "% red." },
                { label: "Train Cost",     pct: simStats.costReductions.trainingCostPct,  col: "#6EE7B7", suffix: "% red." },
              ].map(({ label, pct, col, suffix }) => (
                <div key={label} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: "0.52rem", color: "var(--text-dim)", fontFamily: "monospace", marginBottom: 6 }}>{label.toUpperCase()}</div>
                  <BonusBreakdown pct={pct} color={col} />
                  {pct.total === 0 && <span style={{ fontSize: "0.6rem", color: "var(--text-dim)" }}>+0{suffix}</span>}
                </div>
              ))}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: "0.62rem", color: "var(--text-dim)" }}>
              Click any value to expand sources. Research contributions auto-detected from Badania tab.
            </p>
          </Section>

          <Section title="/ Speed Bonuses (Perks → Economy)">
            <p style={{ margin: "0 0 16px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Enter totals shown in-game. VIP build/research bonus is added automatically — enter the rest here.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <BonusInput label="Construction Speed" value={profile.constructionSpeedBonus}
                hint={`Total: +${vipConBonus + profile.constructionSpeedBonus}% (VIP ${vipConBonus}% + ${profile.constructionSpeedBonus}%)`}
                placeholder="e.g. 59" onChange={(v) => update("constructionSpeedBonus", v)} />
              <BonusInput label="Research Speed" value={profile.researchSpeedBonus}
                hint={`Total: +${vipResBonus + profile.researchSpeedBonus}% (VIP ${vipResBonus}% + ${profile.researchSpeedBonus}%)`}
                placeholder="e.g. 59" onChange={(v) => update("researchSpeedBonus", v)} />
              <BonusInput label="Training Speed" value={profile.trainingSpeedBonus}
                placeholder="e.g. 24" onChange={(v) => update("trainingSpeedBonus", v)} />
              <BonusInput label="Training Batch" value={profile.trainingBatchBonus}
                hint="Increases number of troops trained each batch"
                placeholder="e.g. 13" onChange={(v) => update("trainingBatchBonus", v)} />
            </div>
          </Section>

          <Section title="/ Healing">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <BonusInput label="Healing Speed" value={profile.healingSpeedBonus}
                max={9999} placeholder="e.g. 136" onChange={(v) => update("healingSpeedBonus", v)} />
              <BonusInput label="Hospital Capacity" value={profile.hospitalCapacityBonus}
                placeholder="e.g. 18" onChange={(v) => update("hospitalCapacityBonus", v)} />
            </div>
          </Section>

          <Section title="/ Cost Reductions">
            <p style={{ margin: "0 0 16px", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Enter absolute values (e.g. 14 for -14%). Shown as negative values in Perks → Economy.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <BonusInput label="Construction Cost" value={profile.buildingCostReduction}
                max={100} placeholder="e.g. 14" hint="Reduces resources required to construct buildings"
                onChange={(v) => update("buildingCostReduction", v)} />
              <BonusInput label="Research Cost" value={profile.researchCostReduction}
                max={100} placeholder="e.g. 8" hint="Reduces resources required for research"
                onChange={(v) => update("researchCostReduction", v)} />
              <BonusInput label="Healing Cost" value={profile.healingCostReduction}
                max={100} placeholder="e.g. 11" hint="Reduces resources required to heal troops"
                onChange={(v) => update("healingCostReduction", v)} />
              <BonusInput label="Training Cost" value={profile.trainingCostReduction}
                max={100} placeholder="e.g. 2" hint="Reduces troop training resource cost"
                onChange={(v) => update("trainingCostReduction", v)} />
            </div>
          </Section>
        </>
      )}

      {/* Save footer */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
        <SaveBar />
      </div>
    </div>
  );
}
