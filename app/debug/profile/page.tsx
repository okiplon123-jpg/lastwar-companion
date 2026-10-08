"use client";

import { useState, useMemo } from "react";
import type { PlayerProfile, HeroSave, HeroGearSlot } from "@/lib/profile";
import { DEFAULT_PROFILE, DEFAULT_HERO_SAVE } from "@/lib/profile";
import { HEROES, ALL_GEAR_SLOTS, GEAR_QUALITIES, GEAR_QUALITY_COLORS } from "@/lib/heroes";
import type { HeroDef, GearType, GearQuality } from "@/lib/heroes";
import { computePlayerStats } from "@/lib/sim/compute";
import type { TracedPct } from "@/lib/sim/types";
import DECO_RAW from "@/data/extracted/latest/decorations.json";
import DECO_NAMES_RAW from "@/data/extracted/latest/decoration_names.json";
import BUILDINGS_DATA from "@/lib/buildings-data.json";

// ── Static data ───────────────────────────────────────────────────────────────

type DecRecord = {
  id: number; type: number; quality: number;
  hp_pct_bonus: number | null;
  atk_pct_bonus: number | null;
  def_pct_bonus: number | null;
};

const BONUS_DECOS: DecRecord[] = (
  DECO_RAW as { records: DecRecord[] }
).records.filter(
  (d) => d.hp_pct_bonus != null || d.atk_pct_bonus != null || d.def_pct_bonus != null,
);

const DECO_NAME_MAP = new Map<number, string>(
  (DECO_NAMES_RAW as { records: Array<{ id: number; name: string }> })
    .records.map((r) => [r.id, r.name]),
);

type BldLevel = { level: number; bonuses: Record<string, number> };
type BldDef   = { id: string; name: string; levels: BldLevel[] };
const BLD_MAP  = new Map<string, BldDef>(
  (BUILDINGS_DATA as { buildings: BldDef[] }).buildings.map((b) => [b.id, b]),
);

const QUALITY_SHORT: Record<GearQuality, string> = {
  none: "—", common: "C", rare: "R", epic: "E", legendary: "L", mythic: "M",
};
const QUALITY_COLOR: Record<GearQuality, string> = GEAR_QUALITY_COLORS;

const UR_HEROES  = HEROES.filter((h) => h.rarity === "UR");
const SSR_HEROES = HEROES.filter((h) => h.rarity === "SSR");
const SR_HEROES  = HEROES.filter((h) => h.rarity === "SR");

const QUALITY_LABELS: Record<number, string> = { "-1": "None", 0: "R", 3: "SSR", 4: "UR", 5: "UR+" };

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(v: number, digits = 2) { return v.toFixed(digits) + "%"; }
function fmtFlat(v: number) { return Math.round(v).toLocaleString(); }

type GroupTotals = Record<string, number>;

function sumByGroup(pcts: TracedPct[]): GroupTotals {
  const out: GroupTotals = {};
  for (const p of pcts) {
    for (const c of p.contributions) {
      const g = c.group ?? "Other";
      out[g] = (out[g] ?? 0) + c.value;
    }
  }
  return out;
}

// ── Small UI atoms ────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: "0.58rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    color: "var(--text-dim)",
    textTransform: "uppercase" as const,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: "1px solid var(--border)",
  },
  label: {
    fontSize: "0.6rem",
    color: "var(--text-dim)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    display: "block",
    marginBottom: 3,
  },
  numInput: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    color: "var(--text-primary)",
    padding: "3px 6px",
    fontSize: "0.8rem",
    fontFamily: "monospace",
  },
  textInput: {
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    color: "var(--text-primary)",
    padding: "4px 8px",
    fontSize: "0.8rem",
    fontFamily: "monospace",
    width: "100%",
  },
};

function Card({
  title,
  accent,
  children,
}: {
  title: string;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={S.card}>
      <div style={{ ...S.cardTitle, color: accent ?? "var(--text-dim)" }}>{title}</div>
      {children}
    </div>
  );
}

function NI({
  value,
  onChange,
  min = 0,
  max,
  w = 60,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  w?: number;
  disabled?: boolean;
}) {
  return (
    <input
      type="number"
      disabled={disabled}
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Math.min(max ?? 99999, Math.max(min, Number(e.target.value))))}
      style={{ ...S.numInput, width: w, opacity: disabled ? 0.35 : 1 }}
    />
  );
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "4px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)" }}>{label}</span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "0.82rem",
          fontWeight: 600,
          color: color ?? "var(--text-primary)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Module breakdown row labels ───────────────────────────────────────────────

const GROUP_LABELS: Record<string, string> = {
  Research:    "Research",
  WoH:         "Wall of Honor",
  EW:          "EW Lv20 Specialist",
  VIP:         "VIP",
  Profile:     "Manual Entry",
  Season:      "Season Military Rank",
  Decoration:  "Decorations",
  HonorLevel:  "Hero Honor Level",
  DecBuilding: "Decoration Building",
  UAV:         "UAV Level",
  HeroSkill:   "Hero Skills (OOB)",
  EWUnit:      "EW Weapon Units",
  Building:    "Buildings (HQ / Centers)",
  Other:       "Other",
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ValidationProfilePage() {
  // Profile state — initialize bare (no heroes owned, all zeros)
  const [profile, setProfile] = useState<PlayerProfile>({
    ...DEFAULT_PROFILE,
    heroes: {},
    ownedDecorationIds: [],
    honorLevel: 0,
    uavLevel: 0,
    seasonMilitaryRank: 0,
    seasonFaction: 1,
    decorationBuildingLevel: 0,
    decorationBuildingProgress: 0,
    apsResearchLevels: {},
  });

  // Validation inputs (expected %)
  const [expHp,  setExpHp]  = useState("");
  const [expAtk, setExpAtk] = useState("");
  const [expDef, setExpDef] = useState("");

  // Decoration filter
  const [decoFilter, setDecoFilter] = useState<"all" | "owned" | "unowned">("all");

  // Collapse state for SSR/SR sections
  const [showSsr, setShowSsr] = useState(true);
  const [showSr,  setShowSr]  = useState(false);

  // ── Profile mutators ─────────────────────────────────────────────────────

  function setG<K extends keyof PlayerProfile>(key: K, val: PlayerProfile[K]) {
    setProfile((p) => ({ ...p, [key]: val }));
  }

  function hero(id: string): HeroSave {
    return profile.heroes[id] ?? { ...DEFAULT_HERO_SAVE };
  }

  function setHero(id: string, patch: Partial<HeroSave>) {
    setProfile((p) => ({
      ...p,
      heroes: {
        ...p.heroes,
        [id]: { ...(p.heroes[id] ?? { ...DEFAULT_HERO_SAVE }), ...patch },
      },
    }));
  }

  function setBuilding(id: string, level: number) {
    setProfile((p) => ({
      ...p,
      buildingLevels: { ...p.buildingLevels, [id]: level },
    }));
  }

  function toggleDeco(id: number) {
    setProfile((p) => {
      const ids = p.ownedDecorationIds ?? [];
      return {
        ...p,
        ownedDecorationIds: ids.includes(id)
          ? ids.filter((x) => x !== id)
          : [...ids, id],
      };
    });
  }

  // ── Engine ───────────────────────────────────────────────────────────────

  const stats = useMemo(() => computePlayerStats(profile), [profile]);

  // Per-group aggregations for the breakdown panel
  const grpHp  = useMemo(() => sumByGroup([stats.heroHpPct]),  [stats]);
  const grpAtk = useMemo(() => sumByGroup([stats.heroAtkPct]), [stats]);
  const grpDef = useMemo(() => sumByGroup([stats.heroDefPct]), [stats]);
  // Flat accumulators: group by source tag
  const grpFlatHeroHp   = useMemo(() => sumByGroup([stats.heroFlatHp]),  [stats]);
  const grpFlatHeroAtk  = useMemo(() => sumByGroup([stats.heroFlatAtk]), [stats]);
  const grpFlatHeroDef  = useMemo(() => sumByGroup([stats.heroFlatDef]), [stats]);
  const grpFlatEwHp     = useMemo(() => sumByGroup([stats.ewFlatHp]),    [stats]);
  const grpFlatEwAtk    = useMemo(() => sumByGroup([stats.ewFlatAtk]),   [stats]);
  const grpFlatEwDef    = useMemo(() => sumByGroup([stats.ewFlatDef]),   [stats]);
  const grpFlatDroneHp  = useMemo(() => sumByGroup([stats.droneFlatHp]),  [stats]);
  const grpFlatDroneAtk = useMemo(() => sumByGroup([stats.droneFlatAtk]), [stats]);
  const grpFlatDroneDef = useMemo(() => sumByGroup([stats.droneFlatDef]), [stats]);

  const allGroups = useMemo(() => {
    const s = new Set<string>();
    [grpHp, grpAtk, grpDef,
     grpFlatHeroHp, grpFlatHeroAtk, grpFlatHeroDef,
     grpFlatEwHp, grpFlatEwAtk, grpFlatEwDef,
     grpFlatDroneHp, grpFlatDroneAtk, grpFlatDroneDef]
      .forEach((g) => Object.keys(g).forEach((k) => s.add(k)));
    return Array.from(s).sort();
  }, [grpHp, grpAtk, grpDef,
      grpFlatHeroHp, grpFlatHeroAtk, grpFlatHeroDef,
      grpFlatEwHp, grpFlatEwAtk, grpFlatEwDef,
      grpFlatDroneHp, grpFlatDroneAtk, grpFlatDroneDef]);

  const ownedDecoSet = useMemo(
    () => new Set(profile.ownedDecorationIds ?? []),
    [profile.ownedDecorationIds],
  );

  const visibleDecos = useMemo(() => {
    if (decoFilter === "owned")   return BONUS_DECOS.filter((d) => ownedDecoSet.has(d.id));
    if (decoFilter === "unowned") return BONUS_DECOS.filter((d) => !ownedDecoSet.has(d.id));
    return BONUS_DECOS;
  }, [decoFilter, ownedDecoSet]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "20px 16px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.1em", color: "var(--gold)", margin: 0 }}>
          VALIDATION PROFILE EDITOR
        </h1>
        <p style={{ fontSize: "0.67rem", color: "var(--text-dim)", margin: "4px 0 0" }}>
          Internal debug tool — manually recreate an account to validate Hero Power Engine output
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 20, alignItems: "start" }}>

        {/* ── LEFT: Editor ─────────────────────────────────────────── */}
        <div>

          {/* ── Global Account ── */}
          <Card title="Global Account">
            <div style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Core</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={S.label}>VIP Level (1–18)</label>
                <NI value={profile.vipLevel} onChange={(v) => setG("vipLevel", v)} min={1} max={18} w={60} />
              </div>
              <div>
                <label style={S.label}>VS Tech (0–6)</label>
                <NI value={profile.vsTechLevel} onChange={(v) => setG("vsTechLevel", v)} max={6} w={60} />
              </div>
              <div>
                <label style={S.label}>Honor Level (0–600)</label>
                <NI value={profile.honorLevel} onChange={(v) => setG("honorLevel", v)} max={600} w={80} />
              </div>
              <div>
                <label style={S.label}>UAV Level (0–300)</label>
                <NI value={profile.uavLevel} onChange={(v) => setG("uavLevel", v)} max={300} w={80} />
              </div>
            </div>
            <div style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Season</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={S.label}>Season Rank (0–19)</label>
                <NI value={profile.seasonMilitaryRank} onChange={(v) => setG("seasonMilitaryRank", v)} max={19} w={60} />
              </div>
              <div>
                <label style={S.label}>Season Faction</label>
                <select
                  value={profile.seasonFaction}
                  onChange={(e) => setG("seasonFaction", Number(e.target.value) as 1 | 2)}
                  style={{ ...S.numInput, width: "auto", padding: "3px 8px" }}
                >
                  <option value={1}>1 — Attack</option>
                  <option value={2}>2 — Defense</option>
                </select>
              </div>
            </div>
            <div style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Decoration Building</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              <div>
                <label style={S.label}>Level (0–6)</label>
                <NI value={profile.decorationBuildingLevel} onChange={(v) => setG("decorationBuildingLevel", v)} max={6} w={60} />
              </div>
              <div>
                <label style={S.label}>Progress (0–3)</label>
                <NI value={profile.decorationBuildingProgress} onChange={(v) => setG("decorationBuildingProgress", v)} max={3} w={60} />
              </div>
            </div>
          </Card>

          {/* ── Military Centers ── */}
          <Card title="Buildings" accent="#06B6D4">
            <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", marginBottom: 10 }}>
              Give flat HP / ATK / DEF to heroes of that troop type.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { id: "headquarters",  label: "HQ",             max: 35, bld: BLD_MAP.get("headquarters")  },
                { id: "tank-center",   label: "Tank Center",    max: 35, bld: BLD_MAP.get("tank-center")   },
                { id: "air-center",    label: "Air Center",     max: 35, bld: BLD_MAP.get("air-center")    },
                { id: "missile-center",label: "Missile Center", max: 35, bld: BLD_MAP.get("missile-center")},
              ].map(({ id, label, max, bld }) => {
                const lv = profile.buildingLevels[id] ?? 0;
                const row = bld?.levels.filter(l => l.level <= lv).at(-1);
                const hp  = row?.bonuses?.["Hero Hp"] ?? row?.bonuses?.["Tank Hero Hp"] ?? row?.bonuses?.["Aircraft Hero Hp"] ?? row?.bonuses?.["Missile Hero Hp"];
                return (
                  <div key={id}>
                    <label style={S.label}>{label} (0–{max})</label>
                    <NI value={lv} onChange={(v) => setBuilding(id, v)} max={max} w={60} />
                    {hp != null && lv > 0 && (
                      <div style={{ fontSize: "0.58rem", color: "var(--text-dim)", marginTop: 2 }}>
                        +{Math.round(hp).toLocaleString()} HP
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ── APS Research (Hero Power nodes) ── */}
          <Card title="APS Research — Hero Power" accent="#A855F7">
            <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", marginBottom: 10 }}>
              Hero HP% / ATK% / DEF% from APS Science research trees.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {([
                { id: "30021200", label: "Endurance Upgrade (HP%)",  max: 5,  perLv: 2.0 },
                { id: "30020100", label: "Weapons Upgrade (ATK%)",   max: 5,  perLv: 2.0 },
                { id: "30020300", label: "Armor Enhancement (DEF%)", max: 5,  perLv: 2.0 },
                { id: "180001100", label: "TW: Hero HP I",   max: 10, perLv: 0.75 },
                { id: "180001200", label: "TW: Hero ATK I",  max: 10, perLv: 0.75 },
                { id: "180001300", label: "TW: Hero DEF I",  max: 10, perLv: 0.75 },
                { id: "180005100", label: "TW: Hero HP II",  max: 10, perLv: 0.75 },
                { id: "180005200", label: "TW: Hero ATK II", max: 10, perLv: 0.75 },
                { id: "180005300", label: "TW: Hero DEF II", max: 10, perLv: 0.75 },
                { id: "180009100", label: "TW: Hero HP III",  max: 20, perLv: 0.75 },
                { id: "180009200", label: "TW: Hero ATK III", max: 20, perLv: 0.75 },
                { id: "180009300", label: "TW: Hero DEF III", max: 20, perLv: 0.75 },
                { id: "180012100", label: "TW: Hero HP IV",  max: 20, perLv: 0.75 },
                { id: "180012200", label: "TW: Hero ATK IV", max: 20, perLv: 0.75 },
                { id: "180012300", label: "TW: Hero DEF IV", max: 20, perLv: 0.75 },
              ] as { id: string; label: string; max: number; perLv: number }[]).map(({ id, label, max, perLv }) => {
                const lv = profile.apsResearchLevels?.[id] ?? 0;
                return (
                  <div key={id}>
                    <label style={S.label}>{label} (0–{max})</label>
                    <NI
                      value={lv}
                      onChange={(v) => setG("apsResearchLevels", { ...(profile.apsResearchLevels ?? {}), [id]: v })}
                      max={max}
                      w={60}
                    />
                    {lv > 0 && (
                      <div style={{ fontSize: "0.58rem", color: "var(--text-dim)", marginTop: 2 }}>
                        +{(lv * perLv).toFixed(2)}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* ── UR Heroes ── */}
          <Card title={`UR Heroes (${UR_HEROES.length})`} accent="var(--gold)">
            <HeroTable heroes={UR_HEROES} hero={hero} setHero={setHero} showEw absStats={stats.heroAbsoluteStats} />
          </Card>

          {/* ── SSR Heroes ── */}
          <Card title={`SSR Heroes (${SSR_HEROES.length})`}>
            <button
              onClick={() => setShowSsr((v) => !v)}
              style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.7rem", marginBottom: showSsr ? 10 : 0 }}
            >
              {showSsr ? "▼ Collapse" : "▶ Expand"}
            </button>
            {showSsr && <HeroTable heroes={SSR_HEROES} hero={hero} setHero={setHero} />}
          </Card>

          {/* ── SR Heroes ── */}
          <Card title={`SR Heroes (${SR_HEROES.length})`}>
            <button
              onClick={() => setShowSr((v) => !v)}
              style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.7rem", marginBottom: showSr ? 10 : 0 }}
            >
              {showSr ? "▼ Collapse" : "▶ Expand"}
            </button>
            {showSr && <HeroTable heroes={SR_HEROES} hero={hero} setHero={setHero} />}
          </Card>

          {/* ── Hero Gear ── */}
          <Card title="Hero Gear" accent="#C084FC">
            <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", marginBottom: 10 }}>
              Gear contributes Hero HP/ATK/DEF flat and % bonuses. Set quality then upgrade level (0–40). Milestones at lv 10/20/30/40 are included.
            </div>
            {HEROES.filter((h) => hero(h.id).owned).length === 0 ? (
              <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>No heroes owned yet.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "3px 6px", textAlign: "left", fontSize: "0.55rem", color: "var(--text-dim)", textTransform: "uppercase" as const }}>Hero</th>
                      {ALL_GEAR_SLOTS.map((slot) => (
                        <th key={slot} style={{ padding: "3px 6px", textAlign: "center", fontSize: "0.55rem", color: "var(--text-dim)", textTransform: "uppercase" as const }}>{slot}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HEROES.filter((h) => hero(h.id).owned).map((h) => {
                      const s = hero(h.id);
                      return (
                        <tr key={h.id} style={{ borderTop: "1px solid var(--border)" }}>
                          <td style={{ padding: "4px 6px", fontWeight: 600, color: "var(--text-secondary)", whiteSpace: "nowrap" as const }}>{h.name}</td>
                          {ALL_GEAR_SLOTS.map((slot) => {
                            const g: HeroGearSlot = s.gear?.[slot] ?? { quality: "none", level: 0, stars: 0 };
                            return (
                              <td key={slot} style={{ padding: "4px 6px" }}>
                                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" as const, justifyContent: "center" }}>
                                  {GEAR_QUALITIES.map((q) => (
                                    <button
                                      key={q}
                                      onClick={() => setHero(h.id, {
                                        gear: { ...(s.gear ?? {}), [slot]: { ...g, quality: q, level: q === "none" ? 0 : g.level } }
                                      } as Partial<HeroSave>)}
                                      style={{
                                        width: 22, height: 22, borderRadius: 3, border: `1px solid ${g.quality === q ? QUALITY_COLOR[q] : "rgba(255,255,255,0.1)"}`,
                                        background: g.quality === q ? QUALITY_COLOR[q] + "33" : "transparent",
                                        color: g.quality === q ? QUALITY_COLOR[q] : "var(--text-dim)",
                                        fontSize: "0.5rem", fontWeight: 700, cursor: "pointer", padding: 0,
                                      }}
                                    >
                                      {QUALITY_SHORT[q]}
                                    </button>
                                  ))}
                                </div>
                                {g.quality !== "none" && (
                                  <div style={{ textAlign: "center", marginTop: 2 }}>
                                    <input
                                      type="number" min={0} max={40} value={g.level || ""}
                                      onChange={(e) => setHero(h.id, {
                                        gear: { ...(s.gear ?? {}), [slot]: { ...g, level: Math.max(0, Math.min(40, Number(e.target.value) || 0)) } }
                                      } as Partial<HeroSave>)}
                                      placeholder="Lv"
                                      style={{ ...S.numInput, width: 40, textAlign: "center" }}
                                    />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* ── Decorations ── */}
          <Card title={`Decorations — ${ownedDecoSet.size} / ${BONUS_DECOS.length} owned`}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {(["all", "owned", "unowned"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setDecoFilter(f)}
                  style={{
                    background: decoFilter === f ? "var(--surface-3)" : "var(--surface-2)",
                    border: `1px solid ${decoFilter === f ? "var(--border-bright)" : "var(--border)"}`,
                    borderRadius: 4,
                    color: decoFilter === f ? "var(--text-primary)" : "var(--text-dim)",
                    cursor: "pointer",
                    fontSize: "0.65rem",
                    padding: "3px 10px",
                    textTransform: "capitalize",
                  }}
                >
                  {f}
                </button>
              ))}
              <button
                onClick={() => setProfile((p) => ({ ...p, ownedDecorationIds: BONUS_DECOS.map((d) => d.id) }))}
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-dim)", cursor: "pointer", fontSize: "0.65rem", padding: "3px 10px" }}
              >
                All On
              </button>
              <button
                onClick={() => setProfile((p) => ({ ...p, ownedDecorationIds: [] }))}
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-dim)", cursor: "pointer", fontSize: "0.65rem", padding: "3px 10px" }}
              >
                All Off
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: 5,
                maxHeight: 360,
                overflowY: "auto",
              }}
            >
              {visibleDecos.map((d) => {
                const owned = ownedDecoSet.has(d.id);
                const name = DECO_NAME_MAP.get(d.id) ?? `#${d.id}`;
                const bonusStr = [
                  d.hp_pct_bonus  != null ? `HP+${(d.hp_pct_bonus  * 100).toFixed(0)}%` : null,
                  d.atk_pct_bonus != null ? `ATK+${(d.atk_pct_bonus * 100).toFixed(0)}%` : null,
                  d.def_pct_bonus != null ? `DEF+${(d.def_pct_bonus * 100).toFixed(0)}%` : null,
                ].filter(Boolean).join(" ");
                return (
                  <label
                    key={d.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 7,
                      padding: "5px 7px",
                      background: owned ? "var(--surface-3)" : "var(--surface-2)",
                      border: `1px solid ${owned ? "var(--border-bright)" : "var(--border)"}`,
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={owned}
                      onChange={() => toggleDeco(d.id)}
                      style={{ marginTop: 1, flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                        {name}
                      </div>
                      <div style={{ fontSize: "0.58rem", color: "var(--text-dim)" }}>
                        Q{QUALITY_LABELS[d.quality] ?? d.quality}
                        <span style={{ color: "var(--gold-dim)", marginLeft: 4 }}>{bonusStr}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </Card>

        </div>

        {/* ── RIGHT: Results + Debug + Validation ───────────────────── */}
        <div style={{ position: "sticky", top: 70 }}>

          {/* Computed Stats */}
          <Card title="Calculated Hero Power" accent="var(--gold)">
            <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", marginBottom: 8 }}>% Bonuses</div>
            <StatRow label="Hero HP%"  value={fmt(stats.heroHpPct.total)}  color="var(--blue)"  />
            <StatRow label="Hero ATK%" value={fmt(stats.heroAtkPct.total)} color="var(--gold)"  />
            <StatRow label="Hero DEF%" value={fmt(stats.heroDefPct.total)} color="var(--green)" />

            <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", marginTop: 10, marginBottom: 8 }}>Hero Flat Stats</div>
            <StatRow label="Hero Flat HP"   value={fmtFlat(stats.heroFlatHp.total)}  color="var(--blue)"  />
            <StatRow label="Hero Flat ATK"  value={fmtFlat(stats.heroFlatAtk.total)} color="var(--gold)"  />
            <StatRow label="Hero Flat DEF"  value={fmtFlat(stats.heroFlatDef.total)} color="var(--green)" />
            <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", marginTop: 10, marginBottom: 8 }}>EW Flat Stats</div>
            <StatRow label="EW Flat HP"     value={fmtFlat(stats.ewFlatHp.total)}    />
            <StatRow label="EW Flat ATK"    value={fmtFlat(stats.ewFlatAtk.total)}   />
            <StatRow label="EW Flat DEF"    value={fmtFlat(stats.ewFlatDef.total)}   />
            <div style={{ fontSize: "0.65rem", color: "var(--text-dim)", marginTop: 10, marginBottom: 8 }}>Drone Flat Stats</div>
            <StatRow label="Drone Flat HP"  value={fmtFlat(stats.droneFlatHp.total)}  />
            <StatRow label="Drone Flat ATK" value={fmtFlat(stats.droneFlatAtk.total)} />
            <StatRow label="Drone Flat DEF" value={fmtFlat(stats.droneFlatDef.total)} />
          </Card>

          {/* Module Breakdown */}
          <Card title="Module Breakdown">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.68rem" }}>
              <thead>
                <tr style={{ color: "var(--text-dim)", fontSize: "0.55rem", textTransform: "uppercase" }}>
                  <th style={{ textAlign: "left",  padding: "2px 3px" }}>Source</th>
                  <th style={{ textAlign: "right", padding: "2px 3px", color: "var(--blue)"  }}>HP%</th>
                  <th style={{ textAlign: "right", padding: "2px 3px", color: "var(--gold)"  }}>ATK%</th>
                  <th style={{ textAlign: "right", padding: "2px 3px", color: "var(--green)" }}>DEF%</th>
                  <th style={{ textAlign: "right", padding: "2px 3px" }}>Flat</th>
                </tr>
              </thead>
              <tbody>
                {allGroups.map((g) => {
                  const hp    = grpHp[g]  ?? 0;
                  const atk   = grpAtk[g] ?? 0;
                  const def   = grpDef[g] ?? 0;
                  const fHeroHp   = grpFlatHeroHp[g]  ?? 0;
                  const fHeroAtk  = grpFlatHeroAtk[g] ?? 0;
                  const fHeroDef  = grpFlatHeroDef[g] ?? 0;
                  const fEwHp     = grpFlatEwHp[g]    ?? 0;
                  const fEwAtk    = grpFlatEwAtk[g]   ?? 0;
                  const fEwDef    = grpFlatEwDef[g]   ?? 0;
                  const fDrHp     = grpFlatDroneHp[g]  ?? 0;
                  const fDrAtk    = grpFlatDroneAtk[g] ?? 0;
                  const fDrDef    = grpFlatDroneDef[g] ?? 0;
                  const hasFlat   = fHeroHp || fHeroAtk || fHeroDef || fEwHp || fEwAtk || fEwDef || fDrHp || fDrAtk || fDrDef;
                  if (!hp && !atk && !def && !hasFlat) return null;

                  const flatParts: string[] = [];
                  if (fHeroHp)  flatParts.push(`H-HP:${fmtFlat(fHeroHp)}`);
                  if (fHeroAtk) flatParts.push(`H-ATK:${fmtFlat(fHeroAtk)}`);
                  if (fHeroDef) flatParts.push(`H-DEF:${fmtFlat(fHeroDef)}`);
                  if (fEwHp)    flatParts.push(`EW-HP:${fmtFlat(fEwHp)}`);
                  if (fEwAtk)   flatParts.push(`EW-ATK:${fmtFlat(fEwAtk)}`);
                  if (fEwDef)   flatParts.push(`EW-DEF:${fmtFlat(fEwDef)}`);
                  if (fDrHp)    flatParts.push(`Dr-HP:${fmtFlat(fDrHp)}`);
                  if (fDrAtk)   flatParts.push(`Dr-ATK:${fmtFlat(fDrAtk)}`);
                  if (fDrDef)   flatParts.push(`Dr-DEF:${fmtFlat(fDrDef)}`);

                  return (
                    <tr key={g} style={{ borderTop: "1px solid var(--border)" }}>
                      <td style={{ padding: "3px 3px", color: "var(--text-secondary)" }}>
                        {GROUP_LABELS[g] ?? g}
                      </td>
                      <td style={{ padding: "3px 3px", textAlign: "right", color: hp ? "var(--blue)" : "var(--text-dim)" }}>
                        {hp ? `+${hp.toFixed(1)}%` : "—"}
                      </td>
                      <td style={{ padding: "3px 3px", textAlign: "right", color: atk ? "var(--gold)" : "var(--text-dim)" }}>
                        {atk ? `+${atk.toFixed(1)}%` : "—"}
                      </td>
                      <td style={{ padding: "3px 3px", textAlign: "right", color: def ? "var(--green)" : "var(--text-dim)" }}>
                        {def ? `+${def.toFixed(1)}%` : "—"}
                      </td>
                      <td style={{ padding: "3px 3px", textAlign: "right", fontSize: "0.55rem", color: "var(--text-dim)" }}>
                        {flatParts.join(" ") || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Validation */}
          <Card title="Validation">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div>
                <label style={S.label}>Expected HP%</label>
                <input value={expHp}  onChange={(e) => setExpHp(e.target.value)}  placeholder="e.g. 250.5" style={S.textInput} />
              </div>
              <div>
                <label style={S.label}>Expected ATK%</label>
                <input value={expAtk} onChange={(e) => setExpAtk(e.target.value)} placeholder="e.g. 200"   style={S.textInput} />
              </div>
              <div>
                <label style={S.label}>Expected DEF%</label>
                <input value={expDef} onChange={(e) => setExpDef(e.target.value)} placeholder="e.g. 180"   style={S.textInput} />
              </div>
            </div>

            {[
              { label: "HP%",  calc: stats.heroHpPct.total,  exp: expHp  },
              { label: "ATK%", calc: stats.heroAtkPct.total, exp: expAtk },
              { label: "DEF%", calc: stats.heroDefPct.total, exp: expDef },
            ].map(({ label, calc, exp }) => {
              const expNum = parseFloat(exp);
              const hasExp = !isNaN(expNum) && exp.trim() !== "";
              const diff   = hasExp ? calc - expNum : null;
              const exact  = diff !== null && Math.abs(diff) < 0.005;

              return (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "5px 8px",
                    marginBottom: 4,
                    background: "var(--surface-2)",
                    border: `1px solid ${exact ? "var(--green)" : hasExp ? "var(--border-bright)" : "var(--border)"}`,
                    borderRadius: 4,
                  }}
                >
                  <span style={{ fontSize: "0.65rem", color: "var(--text-dim)", width: 36 }}>{label}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>
                    Calc: <b>{calc.toFixed(2)}%</b>
                  </span>
                  {hasExp && (
                    <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      Exp: <b>{expNum.toFixed(2)}%</b>
                    </span>
                  )}
                  {diff !== null && (
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: exact
                          ? "var(--green)"
                          : diff > 0
                          ? "var(--gold)"
                          : "var(--red)",
                      }}
                    >
                      {exact ? "✓ 0" : `${diff >= 0 ? "+" : ""}${diff.toFixed(2)}`}
                    </span>
                  )}
                </div>
              );
            })}
          </Card>

        </div>
      </div>
    </div>
  );
}

// ── HeroTable sub-component ────────────────────────────────────────────────────

function HeroTable({
  heroes,
  hero,
  setHero,
  showEw,
  absStats,
}: {
  heroes: HeroDef[];
  hero: (id: string) => HeroSave;
  setHero: (id: string, patch: Partial<HeroSave>) => void;
  showEw?: boolean;
  absStats?: Record<string, { hp: number; atk: number; def: number }>;
}) {
  const TH: React.CSSProperties = {
    padding: "3px 6px",
    fontSize: "0.58rem",
    fontWeight: 600,
    color: "var(--text-dim)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    textAlign: "center" as const,
    whiteSpace: "nowrap" as const,
  };
  const TD: React.CSSProperties = {
    padding: "5px 6px",
    textAlign: "center" as const,
    verticalAlign: "middle" as const,
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
        <thead>
          <tr>
            <th style={{ ...TH, textAlign: "left" }}>Hero</th>
            <th style={TH}>Owned</th>
            <th style={TH}>Stars</th>
            <th style={TH}>Level</th>
            {showEw && <th style={TH}>EW Lv</th>}
            <th style={TH}>WoH Lv</th>
            {absStats && <th style={{ ...TH, color: "var(--blue)" }}>HP</th>}
            {absStats && <th style={{ ...TH, color: "var(--gold)" }}>ATK</th>}
            {absStats && <th style={{ ...TH, color: "var(--green)" }}>DEF</th>}
          </tr>
        </thead>
        <tbody>
          {heroes.map((h) => {
            const s = hero(h.id);
            const active = s.owned;
            const TYPE_COLOR: Record<string, string> = {
              Tank: "var(--blue)",
              Aircraft: "var(--green)",
              Missile: "var(--red)",
            };
            return (
              <tr
                key={h.id}
                style={{
                  borderTop: "1px solid var(--border)",
                  background: active ? "rgba(255,255,255,0.02)" : "transparent",
                  opacity: active ? 1 : 0.55,
                }}
              >
                <td style={{ ...TD, textAlign: "left" }}>
                  <span style={{ fontWeight: 600, color: active ? "var(--text-primary)" : "var(--text-dim)" }}>
                    {h.name}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: TYPE_COLOR[h.type] ?? "var(--text-dim)",
                      marginLeft: 5,
                    }}
                  >
                    {h.type}
                  </span>
                </td>
                <td style={TD}>
                  <input
                    type="checkbox"
                    checked={s.owned}
                    onChange={(e) => setHero(h.id, { owned: e.target.checked })}
                  />
                </td>
                <td style={TD}>
                  <NI
                    value={s.stars}
                    onChange={(v) => setHero(h.id, { stars: v })}
                    min={1}
                    max={5}
                    w={48}
                    disabled={!active}
                  />
                </td>
                <td style={TD}>
                  <NI
                    value={s.level}
                    onChange={(v) => setHero(h.id, { level: v })}
                    min={1}
                    max={175}
                    w={56}
                    disabled={!active}
                  />
                </td>
                {showEw && (
                  <td style={TD}>
                    <NI
                      value={s.exclusiveWeaponLevel}
                      onChange={(v) => setHero(h.id, { exclusiveWeaponLevel: v })}
                      max={30}
                      w={48}
                      disabled={!active}
                    />
                  </td>
                )}
                <td style={TD}>
                  <NI
                    value={s.wallOfHonorLevel}
                    onChange={(v) => setHero(h.id, { wallOfHonorLevel: v })}
                    w={56}
                    disabled={!active}
                  />
                </td>
                {absStats && (() => {
                  const abs = absStats[h.id];
                  const fmt = (n: number) => n > 0 ? Math.round(n).toLocaleString() : "—";
                  return (
                    <>
                      <td style={{ ...TD, color: "var(--blue)",  fontSize: "0.7rem" }}>{abs ? fmt(abs.hp)  : "—"}</td>
                      <td style={{ ...TD, color: "var(--gold)",  fontSize: "0.7rem" }}>{abs ? fmt(abs.atk) : "—"}</td>
                      <td style={{ ...TD, color: "var(--green)", fontSize: "0.7rem" }}>{abs ? fmt(abs.def) : "—"}</td>
                    </>
                  );
                })()}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
