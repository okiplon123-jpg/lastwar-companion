"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import RESEARCH_DATA from "@/lib/research-data.json";
import { loadProfile, saveProfile } from "@/lib/profile";
import { getNodeEffect, CATEGORY_COLOR, CATEGORY_LABEL } from "@/lib/research-effects";

// ── Types ────────────────────────────────────────────────────

interface ResearchLevel {
  level: number;
  iron: number;
  food: number;
  gold: number;
  techCenterLevel: number;
  researchTime: string;
  requirements: { elementId?: string; id?: string; minLevel?: number; level?: number }[];
}

interface ResearchNode {
  id: string;
  name: string;
  image: string;
  maxLevel: number;
  effect: string;
  requirements: { id: string; level: number }[];
  levels: ResearchLevel[];
}

interface ResearchRow {
  id: string;
  elems: string[];
  conns: { from: string; to: string[] }[];
}

interface ResearchTree {
  id: string;
  name: string;
  rows: ResearchRow[];
  nodes: ResearchNode[];
}

const TREES = RESEARCH_DATA.trees as ResearchTree[];

// ── Layout constants ─────────────────────────────────────────

const NODE_W = 80;
const NODE_H = 92;
const ROW_GAP = 64;   // vertical gap between rows
const COL_STEP = 112; // horizontal step between columns

// Canvas is 3 columns wide, centered
const CANVAS_W = COL_STEP * 3;  // 336px
const COL_CENTERS = [COL_STEP * 0.5, COL_STEP * 1.5, COL_STEP * 2.5]; // [56, 168, 280]

function getNodePositions(rows: ResearchRow[]): Record<string, { x: number; y: number }> {
  const pos: Record<string, { x: number; y: number }> = {};
  rows.forEach((row, rowIdx) => {
    const count = row.elems.length;
    const y = rowIdx * (NODE_H + ROW_GAP) + NODE_H / 2;
    row.elems.forEach((nodeId, colIdx) => {
      let x: number;
      if (count === 1) x = COL_CENTERS[1];
      else if (count === 2) x = colIdx === 0 ? COL_CENTERS[0] + 16 : COL_CENTERS[2] - 16;
      else x = COL_CENTERS[colIdx];
      pos[nodeId] = { x, y };
    });
  });
  return pos;
}

// ── Tree selector tab bar ────────────────────────────────────

const TREE_CATEGORIES = [
  { label: "Główne", ids: ["development", "economy", "hero", "units"] },
  { label: "Drużyny", ids: ["squad-1", "squad-2", "squad-3", "squad-4"] },
  { label: "Bojowe", ids: ["special-forces", "siege-to-seize", "defense-fortifications", "alliance-duel"] },
  { label: "Mastery", ids: ["tank-mastery", "missile-mastery", "aircraft-mastery"] },
  { label: "Sezonowe", ids: ["the-age-of-oil", "tactical-weapon", "intercity-truck", "t10-special-forces"] },
];

const TREE_NAME: Record<string, string> = Object.fromEntries(TREES.map(t => [t.id, t.name]));

// ── Node detail bottom sheet ──────────────────────────────────

function NodeDetail({
  tree,
  node,
  currentLevel,
  onLevelChange,
  onClose,
}: {
  tree: ResearchTree;
  node: ResearchNode;
  currentLevel: number;
  onLevelChange: (level: number) => void;
  onClose: () => void;
}) {
  const [closing, setClosing] = useState(false);

  function close() {
    if (closing) return;
    setClosing(true);
    setTimeout(onClose, 320);
  }

  const nextLevel = node.levels[currentLevel]; // levels are 0-indexed relative to current
  const totalCost = node.levels.slice(currentLevel).reduce(
    (acc, l) => ({ iron: acc.iron + l.iron, food: acc.food + l.food, gold: acc.gold + l.gold }),
    { iron: 0, food: 0, gold: 0 }
  );

  return (
    <>
      <style>{`
        @keyframes ndUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
        @keyframes ndDown { from { transform: translateY(0) } to { transform: translateY(100%) } }
        @keyframes bdIn { from { opacity:0 } to { opacity:1 } }
        @keyframes bdOut { from { opacity:1 } to { opacity:0 } }
      `}</style>
      <div onClick={close} style={{
        position: "fixed", inset: 0, zIndex: 90,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)",
        animation: closing ? "bdOut 0.3s both" : "bdIn 0.2s both",
      }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
        background: "var(--surface)", borderTop: "2px solid var(--border)",
        borderRadius: "14px 14px 0 0", maxHeight: "70vh", overflow: "hidden",
        display: "flex", flexDirection: "column",
        animation: closing ? "ndDown 0.32s cubic-bezier(0.32,0,0.67,0) both" : "ndUp 0.38s cubic-bezier(0.32,0.72,0,1) both",
      }}>
        {/* Handle */}
        <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 14px" }} />
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", border: "1px solid var(--border)", flexShrink: 0 }}>
              <img src={node.image} alt={node.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>{node.name}</div>
              <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", marginTop: 2 }}>
                {tree.name} · Max Lv.{node.maxLevel} · Tech Center Lv.{node.levels[0]?.techCenterLevel ?? "?"}+
              </div>
              {(() => { const eff = getNodeEffect(node.id); return eff.category !== "other" ? (
                <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{
                    fontSize: "0.55rem", fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                    background: `${CATEGORY_COLOR[eff.category]}20`,
                    border: `1px solid ${CATEGORY_COLOR[eff.category]}50`,
                    color: CATEGORY_COLOR[eff.category],
                  }}>{CATEGORY_LABEL[eff.category]}</span>
                  <span style={{ fontSize: "0.58rem", color: "var(--text-secondary)" }}>{eff.effect}</span>
                </div>
              ) : null; })()}
            </div>
            <button onClick={close} style={{
              width: 32, height: 32, borderRadius: 8, background: "var(--surface-2)",
              border: "1px solid var(--border)", color: "var(--text-dim)", cursor: "pointer", fontSize: "1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>
        </div>

        {/* Scrollable */}
        <div style={{ overflowY: "auto", padding: "0 16px 24px", flex: 1 }}>
          {/* Level stepper */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.06em", marginBottom: 8 }}>
              AKTUALNY POZIOM
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => onLevelChange(Math.max(0, currentLevel - 1))}
                style={{
                  width: 36, height: 36, borderRadius: 8, fontSize: "1.2rem", fontWeight: 700,
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  color: currentLevel <= 0 ? "var(--text-dim)" : "var(--text-secondary)",
                  cursor: currentLevel <= 0 ? "not-allowed" : "pointer",
                  opacity: currentLevel <= 0 ? 0.4 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>−</button>
              <div style={{ flex: 1 }}>
                <input
                  type="range" min={0} max={node.maxLevel} value={currentLevel}
                  onChange={e => onLevelChange(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.5rem", color: "var(--text-dim)" }}>
                  <span>0</span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#06B6D4" }}>Lv.{currentLevel} / {node.maxLevel}</span>
                  <span>MAX</span>
                </div>
              </div>
              <button
                onClick={() => onLevelChange(Math.min(node.maxLevel, currentLevel + 1))}
                style={{
                  width: 36, height: 36, borderRadius: 8, fontSize: "1.2rem", fontWeight: 700,
                  background: currentLevel >= node.maxLevel ? "var(--surface-2)" : "rgba(6,182,212,0.15)",
                  border: `1px solid ${currentLevel >= node.maxLevel ? "var(--border)" : "#06B6D4"}`,
                  color: currentLevel >= node.maxLevel ? "var(--text-dim)" : "#06B6D4",
                  cursor: currentLevel >= node.maxLevel ? "not-allowed" : "pointer",
                  opacity: currentLevel >= node.maxLevel ? 0.4 : 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>+</button>
              <button
                onClick={() => onLevelChange(node.maxLevel)}
                style={{
                  fontSize: "0.58rem", padding: "6px 10px", borderRadius: 6,
                  background: "var(--surface-2)", border: "1px solid var(--border)",
                  color: "var(--text-dim)", cursor: "pointer", fontFamily: "inherit",
                }}>MAX</button>
            </div>
          </div>

          {/* Next level cost */}
          {currentLevel < node.maxLevel && nextLevel && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.06em", marginBottom: 6 }}>
                KOSZT NASTĘPNEGO POZIOMU (Lv.{currentLevel + 1})
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {nextLevel.iron > 0 && (
                  <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", fontSize: "0.7rem", fontFamily: "monospace" }}>
                    🔩 {nextLevel.iron.toLocaleString()}
                  </div>
                )}
                {nextLevel.food > 0 && (
                  <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", fontSize: "0.7rem", fontFamily: "monospace" }}>
                    🌾 {nextLevel.food.toLocaleString()}
                  </div>
                )}
                {nextLevel.gold > 0 && (
                  <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", fontSize: "0.7rem", fontFamily: "monospace" }}>
                    🪙 {nextLevel.gold.toLocaleString()}
                  </div>
                )}
                <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", fontSize: "0.7rem", fontFamily: "monospace" }}>
                  ⏱ {nextLevel.researchTime}
                </div>
              </div>
            </div>
          )}

          {/* Cost to complete */}
          {currentLevel < node.maxLevel && (
            <div>
              <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", fontFamily: "monospace", letterSpacing: "0.06em", marginBottom: 6 }}>
                ŁĄCZNY KOSZT DO UKOŃCZENIA ({node.maxLevel - currentLevel} lvl)
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {totalCost.iron > 0 && (
                  <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid #06B6D430", borderRadius: 6, padding: "6px 10px", fontSize: "0.7rem", fontFamily: "monospace", color: "#06B6D4" }}>
                    🔩 {totalCost.iron.toLocaleString()}
                  </div>
                )}
                {totalCost.food > 0 && (
                  <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid #06B6D430", borderRadius: 6, padding: "6px 10px", fontSize: "0.7rem", fontFamily: "monospace", color: "#06B6D4" }}>
                    🌾 {totalCost.food.toLocaleString()}
                  </div>
                )}
                {totalCost.gold > 0 && (
                  <div style={{ background: "rgba(6,182,212,0.08)", border: "1px solid #06B6D430", borderRadius: 6, padding: "6px 10px", fontSize: "0.7rem", fontFamily: "monospace", color: "#06B6D4" }}>
                    🪙 {totalCost.gold.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentLevel >= node.maxLevel && (
            <div style={{ textAlign: "center", padding: "16px 0", color: "#06B6D4", fontSize: "0.9rem", fontWeight: 700 }}>
              ✓ Ukończone (Max Lv.{node.maxLevel})
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Visual tree renderer ──────────────────────────────────────

function ResearchTreeView({
  tree,
  researchLevels,
  onNodeTap,
}: {
  tree: ResearchTree;
  researchLevels: Record<string, number>;
  onNodeTap: (node: ResearchNode) => void;
}) {
  const nodeMap = Object.fromEntries(tree.nodes.map(n => [n.id, n]));
  const positions = getNodePositions(tree.rows);

  const totalRows = tree.rows.length;
  const svgH = totalRows * (NODE_H + ROW_GAP) - ROW_GAP + 16;

  // Build connection lines
  const lines: { x1: number; y1: number; x2: number; y2: number; done: boolean }[] = [];
  tree.rows.forEach(row => {
    row.conns.forEach(conn => {
      const from = positions[conn.from];
      if (!from) return;
      conn.to.forEach(toId => {
        const to = positions[toId];
        if (!to) return;
        const fromKey = `${tree.id}/${conn.from}`;
        const toKey = `${tree.id}/${toId}`;
        const fromLevel = researchLevels[fromKey] ?? 0;
        const fromNode = nodeMap[conn.from];
        const done = fromLevel >= (fromNode?.maxLevel ?? 1);
        lines.push({
          x1: from.x, y1: from.y + NODE_H / 2,
          x2: to.x, y2: to.y - NODE_H / 2,
          done,
        });
      });
    });
  });

  // Progress stats
  const totalNodes = tree.nodes.length;
  const doneNodes = tree.nodes.filter(n => (researchLevels[`${tree.id}/${n.id}`] ?? 0) >= n.maxLevel).length;
  const partialNodes = tree.nodes.filter(n => {
    const lv = researchLevels[`${tree.id}/${n.id}`] ?? 0;
    return lv > 0 && lv < n.maxLevel;
  }).length;

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.58rem", color: "var(--text-dim)", marginBottom: 4 }}>
          <span>{doneNodes}/{totalNodes} ukończone</span>
          <span>{partialNodes} w trakcie</span>
          <span>{Math.round((doneNodes / totalNodes) * 100)}%</span>
        </div>
        <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg, #06B6D480, #06B6D4)", width: `${(doneNodes / totalNodes) * 100}%`, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Scrollable tree canvas */}
      <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}>
        <div style={{ position: "relative", width: CANVAS_W, height: svgH, margin: "0 auto" }}>
          {/* SVG connection lines */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            {lines.map((l, i) => (
              <line key={i}
                x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                stroke={l.done ? "#06B6D4" : "rgba(255,255,255,0.12)"}
                strokeWidth={l.done ? 2 : 1.5}
                strokeDasharray={l.done ? "none" : "4 3"}
              />
            ))}
          </svg>

          {/* Nodes */}
          {tree.rows.map(row =>
            row.elems.map(nodeId => {
              const node = nodeMap[nodeId];
              if (!node) return null;
              const pos = positions[nodeId];
              if (!pos) return null;
              const key = `${tree.id}/${nodeId}`;
              const currentLevel = researchLevels[key] ?? 0;
              const isMaxed = currentLevel >= node.maxLevel;
              const isStarted = currentLevel > 0;

              return (
                <div
                  key={nodeId}
                  onClick={() => onNodeTap(node)}
                  style={{
                    position: "absolute",
                    left: pos.x - NODE_W / 2,
                    top: pos.y - NODE_H / 2,
                    width: NODE_W,
                    height: NODE_H,
                    borderRadius: 10,
                    background: isMaxed
                      ? "rgba(6,182,212,0.15)"
                      : isStarted
                      ? "rgba(6,182,212,0.07)"
                      : "var(--surface-2)",
                    border: `1.5px solid ${isMaxed ? "#06B6D4" : isStarted ? "#06B6D450" : "var(--border)"}`,
                    cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "flex-start", padding: "6px 4px 4px",
                    gap: 3,
                    transition: "border-color 0.15s, background 0.15s",
                    boxShadow: isMaxed ? "0 0 10px #06B6D430" : "none",
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0,
                    border: `1px solid ${isMaxed ? "#06B6D460" : "rgba(255,255,255,0.08)"}`,
                    filter: currentLevel === 0 ? "grayscale(0.7) brightness(0.65)" : "none",
                    transition: "filter 0.2s",
                  }}>
                    <img src={node.image} alt={node.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                  </div>

                  {/* Name */}
                  <div style={{
                    fontSize: "0.48rem", fontWeight: 600,
                    color: isMaxed ? "#06B6D4" : isStarted ? "var(--text-secondary)" : "var(--text-dim)",
                    textAlign: "center", lineHeight: 1.25,
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const,
                    wordBreak: "break-word",
                    maxHeight: 24,
                  }}>
                    {node.name}
                  </div>

                  {/* Effect badge */}
                  {(() => { const eff = getNodeEffect(node.id); return (eff.category === "atk" || eff.category === "def" || eff.category === "hp") ? (
                    <div style={{
                      fontSize: "0.38rem", fontWeight: 800, padding: "1px 4px", borderRadius: 3,
                      background: `${CATEGORY_COLOR[eff.category]}25`,
                      color: CATEGORY_COLOR[eff.category],
                      letterSpacing: "0.04em",
                    }}>{CATEGORY_LABEL[eff.category]}{eff.troop && eff.troop !== "all" ? ` ${eff.troop.slice(0,3).toUpperCase()}` : ""}</div>
                  ) : null; })()}

                  {/* Level indicator */}
                  <div style={{
                    fontSize: "0.52rem", fontFamily: "monospace", fontWeight: 700,
                    color: isMaxed ? "#06B6D4" : "var(--text-dim)",
                  }}>
                    {isMaxed ? "✓" : `${currentLevel}/${node.maxLevel}`}
                  </div>

                  {/* Progress dots */}
                  {!isMaxed && node.maxLevel <= 10 && (
                    <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
                      {Array.from({ length: node.maxLevel }).map((_, i) => (
                        <div key={i} style={{
                          width: 4, height: 4, borderRadius: 2,
                          background: i < currentLevel ? "#06B6D4" : "rgba(255,255,255,0.15)",
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function ResearchPage() {
  const [researchLevels, setResearchLevels] = useState<Record<string, number>>({});
  const [selectedCat, setSelectedCat] = useState(0);
  const [selectedTreeId, setSelectedTreeId] = useState(TREE_CATEGORIES[0].ids[0]);
  const [activeNode, setActiveNode] = useState<ResearchNode | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const profile = loadProfile();
    setResearchLevels(profile.researchLevels ?? {});
  }, []);

  const updateLevel = useCallback((treeId: string, nodeId: string, level: number) => {
    const key = `${treeId}/${nodeId}`;
    setResearchLevels(prev => {
      const next = { ...prev, [key]: level };
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        const profile = loadProfile();
        saveProfile({ ...profile, researchLevels: next });
      }, 400);
      return next;
    });
  }, []);

  const selectedTree = TREES.find(t => t.id === selectedTreeId)!;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "0 0 40px" }}>
      {/* Header */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <a href="/" style={{ fontSize: "0.72rem", color: "var(--text-dim)", textDecoration: "none" }}>← Wróć</a>
          <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "#fff" }}>🔬 Badania</span>
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 8 }}>
          {TREE_CATEGORIES.map((cat, i) => (
            <button key={cat.label} onClick={() => { setSelectedCat(i); setSelectedTreeId(cat.ids[0]); }} style={{
              flexShrink: 0, fontSize: "0.65rem", fontWeight: 600, padding: "5px 12px", borderRadius: 20,
              background: selectedCat === i ? "rgba(6,182,212,0.18)" : "var(--surface-2)",
              border: `1px solid ${selectedCat === i ? "#06B6D4" : "var(--border)"}`,
              color: selectedCat === i ? "#06B6D4" : "var(--text-dim)",
              cursor: "pointer", fontFamily: "inherit",
            }}>{cat.label}</button>
          ))}
        </div>

        {/* Tree selector within category */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 12 }}>
          {TREE_CATEGORIES[selectedCat].ids.map(treeId => {
            const tree = TREES.find(t => t.id === treeId);
            if (!tree) return null;
            const done = tree.nodes.filter(n => (researchLevels[`${treeId}/${n.id}`] ?? 0) >= n.maxLevel).length;
            const pct = Math.round((done / tree.nodes.length) * 100);
            return (
              <button key={treeId} onClick={() => setSelectedTreeId(treeId)} style={{
                flexShrink: 0, fontSize: "0.6rem", fontWeight: 600, padding: "5px 10px", borderRadius: 8,
                background: selectedTreeId === treeId ? "rgba(6,182,212,0.15)" : "var(--surface-2)",
                border: `1px solid ${selectedTreeId === treeId ? "#06B6D4" : "var(--border)"}`,
                color: selectedTreeId === treeId ? "#06B6D4" : "var(--text-dim)",
                cursor: "pointer", fontFamily: "inherit", textAlign: "center" as const,
              }}>
                <div>{TREE_NAME[treeId]}</div>
                {pct > 0 && <div style={{ fontSize: "0.5rem", color: pct === 100 ? "#06B6D4" : "var(--text-dim)", marginTop: 1 }}>{pct}%</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tree view */}
      <div style={{ padding: "0 16px" }}>
        {selectedTree && (
          <ResearchTreeView
            key={selectedTree.id}
            tree={selectedTree}
            researchLevels={researchLevels}
            onNodeTap={node => setActiveNode(node)}
          />
        )}
      </div>

      {/* Node detail panel */}
      {activeNode && selectedTree && (
        <NodeDetail
          tree={selectedTree}
          node={activeNode}
          currentLevel={researchLevels[`${selectedTree.id}/${activeNode.id}`] ?? 0}
          onLevelChange={level => updateLevel(selectedTree.id, activeNode.id, level)}
          onClose={() => setActiveNode(null)}
        />
      )}
    </div>
  );
}
