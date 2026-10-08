// ============================================================
// LASTWAR SIM ENGINE — Pure computation functions
// Input: PlayerProfile → Output: PlayerStats (fully traced)
// ============================================================

import {
  PlayerProfile,
  getVipConstructionBonus,
  getVipResearchBonus,
  getVsTechMultiplier,
} from "@/lib/profile";
import { getNodeEffect } from "@/lib/research-effects";
import { HEROES, HeroType, GearType } from "@/lib/heroes";
import { getWoHBonus, getWoHBonusType } from "@/lib/hero-data";
import type { Contribution, TracedPct, TroopTypeStats, PlayerStats } from "./types";


// ── Hero gear model ──────────────────────────────────────────
// Verified against in-game hero detail screens (Williams, Stetmann, Marshall, Kimberly):
//  - gear_stats.json is indexed by (in-game level + 1) and its "Armor"/"Chip" keys are
//    swapped relative to the game ("Armor" key = ATK chip stats, "Chip" key = HP armor stats).
//  - In-game stars (hexes) map to promote tiers of hero_gear.json: tier = 4 + 5 × stars (cap 25).
//  - Each star also grants an extra flat bonus (≈ 2/3 of the tier's "addition" grant).
//  - Legendary Cannon base crit is 20% (file says 17.125%).
export interface GearSlotStats {
  flatHp: number; flatAtk: number; flatDef: number;
  hpPct: number; atkPct: number; defPct: number; // fractions (0.085 = 8.5%)
  crit: number; // fraction
  resistPower: number; // equip.power share NOT already counted in hero stats (damage resistances)
}

const GEAR_FILE_KEY: Record<GearType, GearType> = { Cannon: "Cannon", Chip: "Armor", Armor: "Chip", Radar: "Radar" };
const GEAR_TIER_ITEM: Record<GearType, number> = { Cannon: 410100, Armor: 410200, Chip: 410300, Radar: 410400 };
const GEAR_STAR_EXTRA: Record<number, Record<GearType, { atk?: number; hp?: number; def?: number; crit?: number }>> = {
  5: { Cannon: { atk: 500 }, Chip: { atk: 500 }, Armor: { hp: 42000 }, Radar: { def: 200 } },
  6: { Cannon: { atk: 300, crit: 0.01 }, Chip: { atk: 300 }, Armor: { hp: 25200 }, Radar: { def: 120 } },
};
const GEAR_QUALITY_NUM_H: Record<string, number> = { common: 2, rare: 3, epic: 4, legendary: 5, mythic: 6 };

type GearFile = Record<string, { max_level: number; levels: Record<string, {
  heroFlatHp?: number; heroFlatAtk?: number; heroFlatDef?: number;
  heroHpPct?: number; heroAtkPct?: number; heroDefPct?: number; critRatePct?: number;
}> }>;
type HeroGearFile = { items: Array<{ id: number;
  upgrade_levels: Array<{ upgrade_level: number;
    basic_grants: Array<{ stat_id: number; value: number; power_coeff: number }>;
    addition_grants: Array<{ stat_id: number; value: number; power_coeff: number }>;
  }>;
  promote_tiers: Array<{
    promote_tier: number; basic_grants: Array<{ stat_id: number; value: number; power_coeff: number }>;
  }> }> };
// stat ids of damage resistances: 76057 all types, 76058 physical, 76059 energy
const HERO_STAT_IDS = new Set([50005, 50008, 50010, 50011, 75050, 75150, 75250]);

function nonStatGearPower(item: HeroGearFile["items"][number] | undefined, level: number, tierGrants?: Array<{ stat_id: number; value: number; power_coeff: number }>): number {
  if (!item) return 0;
  const isExtra = (id: number) => !HERO_STAT_IDS.has(id);
  let total = 0;
  const up = item.upgrade_levels.find(x => x.upgrade_level === Math.min(Math.max(level, 0), 40));
  if (up) for (const g of up.basic_grants) if (isExtra(g.stat_id)) total += g.value * g.power_coeff;
  for (const m of [10, 20, 30, 40]) {
    if (level < m) continue;
    const mu = item.upgrade_levels.find(x => x.upgrade_level === m);
    if (mu) for (const g of mu.addition_grants) if (isExtra(g.stat_id)) total += g.value * g.power_coeff;
  }
  if (tierGrants) for (const g of tierGrants) if (isExtra(g.stat_id)) total += g.value * g.power_coeff;
  return total;
}

export function computeGearSlot(
  slot: { quality: string; level: number; stars?: number; tier?: number } | undefined,
  slotName: GearType,
): GearSlotStats | null {
  if (!slot || slot.quality === "none") return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const gearData = require("@/data/extracted/latest/gear_stats.json") as GearFile;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const heroGear = require("@/knowledge/hero_gear.json") as HeroGearFile;
  const qualNum = GEAR_QUALITY_NUM_H[slot.quality];
  const entry = gearData[`${slot.quality}_${GEAR_FILE_KEY[slotName]}`];
  if (!entry) return null;
  const idx = Math.min(Math.max((slot.level <= 0 ? 0 : slot.level) + 1, 1), entry.max_level);
  const lv = entry.levels[String(idx)];
  if (!lv) return null;
  const out: GearSlotStats = {
    flatHp: lv.heroFlatHp ?? 0, flatAtk: lv.heroFlatAtk ?? 0, flatDef: lv.heroFlatDef ?? 0,
    hpPct: lv.heroHpPct ?? 0, atkPct: lv.heroAtkPct ?? 0, defPct: lv.heroDefPct ?? 0,
    crit: lv.critRatePct ?? 0,
    resistPower: 0,
  };
  if (qualNum === 5 || qualNum === 6) {
    // Promote tiers 1–4 unlock with gear level milestones (10/20/30/40); each ★ adds 5 more tiers.
    const levelTier = Math.min(4, Math.floor(Math.max(0, slot.level) / 10));
    const tier = Math.max(0, Math.min(25, slot.tier ?? levelTier + 5 * Math.max(0, Math.min(5, slot.stars ?? 0))));
    const stars = Math.min(5, Math.floor(tier / 5));
    const item = heroGear.items.find(i => i.id === GEAR_TIER_ITEM[slotName]);
    const t = tier > 0 ? item?.promote_tiers.find(x => x.promote_tier === tier) : undefined;
    // Non-stat power (resistances, damage boost/reduction); see nonStatGearPower.
    const up = item?.upgrade_levels.find(x => x.upgrade_level === Math.min(Math.max(slot.level, 0), 40));
    out.resistPower += nonStatGearPower(item, slot.level, t?.basic_grants);
    // Mythic Cannon at ★5 carries ~15.7k of resistance power (empirical, Kimberly); scaled by stars.
    if (qualNum === 6 && slotName === "Cannon") out.resistPower += 15703 * (stars / 5);
    if (qualNum === 5 || qualNum === 6) {
      // Crit: basic row at this level + additional-attribute milestones (levels 20 and 40).
      out.crit = (up?.basic_grants.find(g => g.stat_id === 50011)?.value ?? 0);
      for (const m of [20, 40]) {
        if (slot.level < m) continue;
        const mu = item?.upgrade_levels.find(x => x.upgrade_level === m);
        out.crit += mu?.addition_grants.find(g => g.stat_id === 50011)?.value ?? 0;
      }
    }
    if (t) {
      for (const g of t.basic_grants) {
        if (g.stat_id === 50005) out.flatHp  += g.value;
        else if (g.stat_id === 50008) out.flatAtk += g.value;
        else if (g.stat_id === 50010) out.flatDef += g.value;
        else if (g.stat_id === 75050) out.hpPct  += g.value;
        else if (g.stat_id === 75150) out.atkPct += g.value;
        else if (g.stat_id === 75250) out.defPct += g.value;
        else if (g.stat_id === 50011) out.crit   += g.value;
      }
    }
    const ex = GEAR_STAR_EXTRA[qualNum]?.[slotName];
    if (ex && stars > 0) {
      out.flatAtk += (ex.atk ?? 0) * stars;
      out.flatHp  += (ex.hp  ?? 0) * stars;
      out.flatDef += (ex.def ?? 0) * stars;
      out.crit    += (ex.crit ?? 0) * stars;
    }
  }
  if (qualNum >= 2 && qualNum <= 4) {
    const slotIdx = { Cannon: 1, Armor: 2, Chip: 3, Radar: 4 }[slotName];
    const item = heroGear.items.find(i => i.id === (qualNum - 1) * 100000 + 10000 + slotIdx * 100);
    out.resistPower += nonStatGearPower(item, slot.level);
  }
  return out;
}

const HERO_TYPED_RESEARCH: Record<string, { type: HeroType; stat: "atk" | "def" | "hp" }> = {
  "cannon-enhancement": { type: "Tank", stat: "atk" }, "armor-hardening": { type: "Tank", stat: "def" }, "track-fortification": { type: "Tank", stat: "hp" },
  "airborne-weapon": { type: "Aircraft", stat: "atk" }, "reinforced-body": { type: "Aircraft", stat: "def" }, "wingman-tactics": { type: "Aircraft", stat: "hp" },
  "precision-targeting": { type: "Missile", stat: "atk" }, "metal-barricade": { type: "Missile", stat: "def" }, "missile-expansion": { type: "Missile", stat: "hp" },
};
// SSR / promoted-SSR heroes: base-stat row id (hero_base.json), base multiplier (promoted ×1.5) and
// their 4 skill groups (verified from in-game power, Elsa/Mason; others by skill names).
const SSR_HEROES: Record<string, { baseId: number; mult: number; groups: number[] }> = {
  elsa:     { baseId: 40007, mult: 1,   groups: [50050, 50060, 50070, 50080] },
  venom:    { baseId: 40018, mult: 1,   groups: [51700, 51710, 51720, 51730] },
  mason:    { baseId: 40010, mult: 1.5, groups: [502300, 502310, 502320, 502330] },
  violet:   { baseId: 40012, mult: 1.5, groups: [502500, 502510, 502520, 502530] },
  scarlett: { baseId: 40006, mult: 1.5, groups: [502600, 502610, 502620, 502630] },
};
const HERO_UNATTRIBUTED_POWER = 34175;
const HERO_UNATTRIBUTED_POWER_SSR = 33672; // fitted on Elsa (plain SSR); Mason/Violet/Scarlett/Venom unverified
// EW stat power. ew_power_by_hero.json is NOT scaled by hero base stats (it is ~equal for every
// hero), but its per-level SHAPE is right. Raw EW lv20 stats (before × base/10000) derived from
// Kimberly's in-game EW row (HP 223,718 / ATK 6,795 / DEF 2,065); verified on Marshall lv11
// (in-game 134,220 vs 134,230 computed).
const EW20_RAW = { hp: 383342, atk: 4562.6, def: 2281.3 };

// ── Helpers ──────────────────────────────────────────────────

function emptyPct(): TracedPct {
  return { total: 0, contributions: [] };
}

function add(pct: TracedPct, label: string, value: number, group?: string, nodeId?: string) {
  if (value === 0) return;
  pct.total += value;
  pct.contributions.push({ label, value, group, nodeId });
}

function emptyTroopStats(): TroopTypeStats {
  return { atkPct: emptyPct(), defPct: emptyPct(), hpPct: emptyPct() };
}

// ── Research node name lookup (built once per call, cheap) ─

function buildNodeNames(): Record<string, string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const data = require("@/lib/research-data.json") as { trees: Array<{ id: string; nodes: Array<{ id: string; name: string }> }> };
  const map: Record<string, string> = {};
  for (const tree of data.trees) {
    for (const node of tree.nodes) {
      map[node.id] = node.name;
    }
  }
  return map;
}

// ── Double-stat effects ───────────────────────────────────────
// Some nodes give bonuses to two stats. We special-case them.
// Effect string patterns → secondary stat to also apply:
function secondaryStat(effectStr: string): "atk" | "def" | "hp" | null {
  const e = effectStr.toLowerCase();
  if (e.includes("atk & def") || e.includes("atk & amp; def")) return "def";
  if (e.includes("atk & hp")  || e.includes("atk & amp; hp"))  return "hp";
  if (e.includes("hp & def")  || e.includes("hp & amp; def"))  return "atk"; // rare, treat primary as hp → secondary atk is not right; just skip
  if (e.includes("def & hp")  || e.includes("def & amp; hp"))  return "hp";
  return null;
}

// ── Troop types ───────────────────────────────────────────────

const TROOP_TYPES: HeroType[] = ["Tank", "Aircraft", "Missile"];

// ── Base troop power per tier (T1–T10) ───────────────────────
// Source: community-confirmed values
export const TROOP_BASE_POWER: Record<number, number> = {
  1:  24,
  2:  50,
  3:  80,
  4:  120,
  5:  200,
  6:  300,
  7:  500,
  8:  800,
  9:  1200,
  10: 1647,
};

// ── Main computation ─────────────────────────────────────────

export function computePlayerStats(profile: PlayerProfile): PlayerStats {
  const nodeNames = buildNodeNames();

  // Per-type combat stats
  const tank     = emptyTroopStats();
  const aircraft = emptyTroopStats();
  const missile  = emptyTroopStats();

  // Hero-specific stats
  const heroAtkPct = emptyPct();
  const heroDefPct = emptyPct();
  const heroHpPct  = emptyPct();
  const heroFlatHp  = emptyPct();
  const heroFlatAtk = emptyPct();
  const heroFlatDef = emptyPct();

  // EW flat stats (decoration buildings — M-020)
  const ewFlatHp  = emptyPct();
  const ewFlatAtk = emptyPct();
  const ewFlatDef = emptyPct();

  // Drone flat stats (UAV level — M-024)
  const droneFlatHp  = emptyPct();
  const droneFlatAtk = emptyPct();
  const droneFlatDef = emptyPct();

  // Economy
  const constructionSpeedPct = emptyPct();
  const researchSpeedPct     = emptyPct();
  const trainingSpeedPct     = emptyPct();
  const trainingBatchPct     = emptyPct();
  const healingSpeedPct      = emptyPct();
  const hospitalCapacityPct  = emptyPct();

  // Cost reductions
  const buildingCostPct  = emptyPct();
  const researchCostPct  = emptyPct();
  const healingCostPct   = emptyPct();
  const trainingCostPct  = emptyPct();

  // ── 1. Research bonuses ─────────────────────────────────────

  const resLevels = profile.researchLevels ?? {};

  for (const [key, level] of Object.entries(resLevels)) {
    if (!level || level <= 0) continue;
    const nodeId = key.includes("/") ? key.split("/")[1] : key;
    const eff = getNodeEffect(nodeId);
    if (eff.effect === "Unknown effect" || eff.pctPerLv === null) continue;

    const bonus = eff.pctPerLv * level;
    const name  = nodeNames[nodeId] ?? nodeId;

    // Hero research is specific to the hero's troop type (verified in-game: Missile heroes get
    // Precision Targeting / Metal Barricade / Missile Expansion, not the tank nodes).
    const typed = HERO_TYPED_RESEARCH[nodeId.replace(/-[12]$/, "")];
    if (typed) {
      const target = typed.stat === "atk" ? heroAtkPct : typed.stat === "def" ? heroDefPct : heroHpPct;
      // Hero research: tier I = 1% per level, tier II = 2% per level (aps_science_research.json).
      add(target, `${typed.type}: ${name}`, (nodeId.endsWith("-2") ? 2 : 1) * level, "ResearchType", nodeId);
      continue;
    }

    const { category, troop, effect: effectStr } = eff;
    const secondary = secondaryStat(effectStr);

    // Combat stats
    if (category === "atk" || category === "def" || category === "hp") {
      const targets: HeroType[] =
        troop === "all"      ? TROOP_TYPES :
        troop === "tank"     ? ["Tank"] :
        troop === "aircraft" ? ["Aircraft"] :
        troop === "missile"  ? ["Missile"] :
        [];

      if (targets.length > 0) {
        for (const t of targets) {
          const ts = t === "Tank" ? tank : t === "Aircraft" ? aircraft : missile;
          const statKey = category === "atk" ? "atkPct" : category === "def" ? "defPct" : "hpPct";
          add(ts[statKey], name, bonus, "Research", nodeId);
          // Secondary stat (e.g. "ATK & DEF" nodes)
          if (secondary) {
            const secKey = secondary === "atk" ? "atkPct" : secondary === "def" ? "defPct" : "hpPct";
            if (secKey !== statKey) add(ts[secKey], name, bonus, "Research", nodeId);
          }
        }
      } else if (troop === "hero") {
        // Hero-specific research bonuses
        const statKey = category === "atk" ? heroAtkPct : category === "def" ? heroDefPct : heroHpPct;
        add(statKey, name, bonus, "Research", nodeId);
        if (secondary) {
          const secPct = secondary === "atk" ? heroAtkPct : secondary === "def" ? heroDefPct : heroHpPct;
          add(secPct, name, bonus, "Research", nodeId);
        }
      }
      // drone / null troop → skip for now
    }

    // Economy: speed
    if (category === "speed") {
      const e = effectStr.toLowerCase();
      if (e.includes("construction"))       add(constructionSpeedPct, name, bonus, "Research", nodeId);
      else if (e.includes("research speed")) add(researchSpeedPct,    name, bonus, "Research", nodeId);
      else if (e.includes("training speed")) add(trainingSpeedPct,    name, bonus, "Research", nodeId);
      // march speed → skip (not tracked here)
    }

    // Economy: heal
    if (category === "heal") {
      const e = effectStr.toLowerCase();
      if (e.includes("healing speed"))        add(healingSpeedPct,     name, bonus, "Research", nodeId);
      else if (e.includes("hospital capacity")) add(hospitalCapacityPct, name, bonus, "Research", nodeId);
      else if (e.includes("healing cost"))     add(healingCostPct,      name, bonus, "Research", nodeId);
    }

    // Economy: other (batch, cost reductions)
    if (category === "other") {
      const e = effectStr.toLowerCase();
      if (e.includes("training batch"))       add(trainingBatchPct, name, bonus, "Research", nodeId);
      else if (e.includes("training cost"))   add(trainingCostPct,  name, bonus, "Research", nodeId);
    }
  }

  // ── 2. Wall of Honor bonuses ────────────────────────────────

  for (const hero of HEROES) {
    const save = profile.heroes[hero.id];
    if (!save?.owned || (save.wallOfHonorLevel ?? 0) <= 0) continue;

    const bonus  = getWoHBonus(hero.id, save.wallOfHonorLevel);
    const bt     = getWoHBonusType(hero.id); // "ATK" | "DEF" | "HP"
    const ts     = hero.type === "Tank" ? tank : hero.type === "Aircraft" ? aircraft : missile;
    const label  = `WoH: ${hero.name}`;

    if (bt === "ATK")      add(ts.atkPct, label, bonus, "WoH");
    else if (bt === "DEF") add(ts.defPct, label, bonus, "WoH");
    else                   add(ts.hpPct,  label, bonus, "WoH");
    // In the game the Wall of Honor row ("Ściana Honoru") sits inside the hero ATK/DEF/HP % lists of
    // heroes of the same troop type.
    const heroTarget = bt === "ATK" ? heroAtkPct : bt === "DEF" ? heroDefPct : heroHpPct;
    add(heroTarget, `${hero.type}: Ściana Honoru ${hero.name}`, bonus, "ResearchType");
  }

  // ── 3. Exclusive Weapon Lv20 specialist bonus ───────────────
  // EW Lv20: +7.5% ATK/DEF/HP to all heroes of same troop type in formation

  for (const type of TROOP_TYPES) {
    const hasEW20 = HEROES.some(
      h => h.type === type
        && profile.heroes[h.id]?.owned
        && (profile.heroes[h.id]?.exclusiveWeaponLevel ?? 0) >= 20,
    );
    if (!hasEW20) continue;

    const ts = type === "Tank" ? tank : type === "Aircraft" ? aircraft : missile;
    const label = `EW Lv20 (${type} Specialist)`;
    add(ts.atkPct, label, 7.5, "EW");
    add(ts.defPct, label, 7.5, "EW");
    add(ts.hpPct,  label, 7.5, "EW");
  }

  // ── 4. VIP bonuses ──────────────────────────────────────────

  const vipConBonus = getVipConstructionBonus(profile.vipLevel);
  const vipResBonus = getVipResearchBonus(profile.vipLevel);
  add(constructionSpeedPct, `VIP Lv${profile.vipLevel}`, vipConBonus, "VIP");
  add(researchSpeedPct,     `VIP Lv${profile.vipLevel}`, vipResBonus, "VIP");

  {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const vipData = require("@/data/extracted/latest/vip_levels.json") as {
      records: Array<{ id: number; hero_hp_pct: number; hero_atk_pct: number; hero_def_pct: number }>;
    };
    const vipRow = vipData.records.find(r => r.id === profile.vipLevel);
    if (vipRow) {
      const lbl = `VIP Lv${profile.vipLevel}`;
      if (vipRow.hero_hp_pct)  add(heroHpPct,  lbl, vipRow.hero_hp_pct  * 100, "VIP");
      if (vipRow.hero_atk_pct) add(heroAtkPct, lbl, vipRow.hero_atk_pct * 100, "VIP");
      if (vipRow.hero_def_pct) add(heroDefPct, lbl, vipRow.hero_def_pct * 100, "VIP");
    }
  }

  // ── 5. Profile-entered bonuses ──────────────────────────────
  // (User reads these totals from in-game Perks → Economy screen)

  add(constructionSpeedPct, "Perks (manual)", profile.constructionSpeedBonus, "Profile");
  add(researchSpeedPct,     "Perks (manual)", profile.researchSpeedBonus,     "Profile");
  add(trainingSpeedPct,     "Perks (manual)", profile.trainingSpeedBonus,     "Profile");
  add(trainingBatchPct,     "Perks (manual)", profile.trainingBatchBonus,     "Profile");
  add(healingSpeedPct,      "Perks (manual)", profile.healingSpeedBonus,      "Profile");
  add(hospitalCapacityPct,  "Perks (manual)", profile.hospitalCapacityBonus,  "Profile");
  add(buildingCostPct,      "Perks (manual)", profile.buildingCostReduction,  "Profile");
  add(researchCostPct,      "Perks (manual)", profile.researchCostReduction,  "Profile");
  add(healingCostPct,       "Perks (manual)", profile.healingCostReduction,   "Profile");
  add(trainingCostPct,      "Perks (manual)", profile.trainingCostReduction,  "Profile");

  // ── 6. VS Tech multiplier ───────────────────────────────────

  const vsTechMultiplier = getVsTechMultiplier(profile.vsTechLevel);

  // ── 7. Season Military Rank (M-NEW-A) ───────────────────────
  // Permanent hero HP/ATK/DEF % bonus from season progression rank.
  // Source: data/extracted/latest/season_military_rank.json
  // Values are decimal fractions (0.01 = 1%); multiply by 100 for %.

  if ((profile.seasonMilitaryRank ?? 0) > 0) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const smrData = require("@/data/extracted/latest/season_military_rank.json") as {
      records: Array<{ rank_level: number; faction: number; hp_pct: number; atk_pct: number; def_pct: number }>;
    };
    const rank = smrData.records.find(
      r => r.rank_level === profile.seasonMilitaryRank && r.faction === (profile.seasonFaction ?? 1),
    );
    if (rank) {
      const label = `Season Rank ${profile.seasonMilitaryRank}`;
      add(heroHpPct,  label, rank.hp_pct  * 100, "Season");
      add(heroAtkPct, label, rank.atk_pct * 100, "Season");
      add(heroDefPct, label, rank.def_pct * 100, "Season");
    }
  }

  // ── 8. Decoration Gains (M-021+) ────────────────────────────
  // Permanent hero HP/ATK/DEF % bonus from owned decorations.
  // effect_gain fires once when the decoration is first acquired.
  // Source: data/extracted/latest/decorations.json
  // Values are decimal fractions (0.05 = 5%); multiply by 100 for %.

  {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const decoData = require("@/data/extracted/latest/decorations.json") as {
      records: Array<{ id: number; effect_wear: string | null; hp_pct_bonus: number | null; atk_pct_bonus: number | null; def_pct_bonus: number | null }>;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const decoNames = require("@/data/extracted/latest/decoration_names.json") as { records: Array<{ id: number; name: string }> };
    const nameById = new Map(decoNames.records.map(r => [r.id, r.name]));
    const decoById = new Map(decoData.records.map(r => [r.id, r]));
    const eq = profile.equippedDecorationId;
    // Equipped skin: only its "wear" effect (stat ids 75050/75150/75250 = hero HP/ATK/DEF %).
    const worn = eq != null ? decoById.get(eq) : undefined;
    if (worn?.effect_wear) {
      for (const part of worn.effect_wear.split("|")) {
        const [sid, val] = part.split(";");
        const v = parseFloat(val) * 100;
        const label = `Kosmetyka: ${nameById.get(worn.id) ?? worn.id} (założona)`;
        if (sid === "75050") add(heroHpPct,  label, v, "Cosmetic");
        if (sid === "75150") add(heroAtkPct, label, v, "Cosmetic");
        if (sid === "75250") add(heroDefPct, label, v, "Cosmetic");
      }
    }
    // Owned, not equipped: "gain" effect.
    for (const decoId of profile.ownedDecorationIds ?? []) {
      if (decoId === eq) continue;
      const deco = decoById.get(decoId);
      if (!deco) continue;
      const label = `Kosmetyka: ${nameById.get(decoId) ?? decoId}`;
      if (deco.hp_pct_bonus  != null) add(heroHpPct,  label, deco.hp_pct_bonus  * 100, "Cosmetic");
      if (deco.atk_pct_bonus != null) add(heroAtkPct, label, deco.atk_pct_bonus * 100, "Cosmetic");
      if (deco.def_pct_bonus != null) add(heroDefPct, label, deco.def_pct_bonus * 100, "Cosmetic");
    }
  }
  if (profile.cosmeticHpPct)  add(heroHpPct,  "Kosmetyka", profile.cosmeticHpPct,  "Cosmetic");
  if (profile.cosmeticAtkPct) add(heroAtkPct, "Kosmetyka", profile.cosmeticAtkPct, "Cosmetic");
  if (profile.cosmeticDefPct) add(heroDefPct, "Kosmetyka", profile.cosmeticDefPct, "Cosmetic");

  // ── 9. Hero Honor Level (M-019) ─────────────────────────────
  // Flat HP bonus per hero based on their quality class and the
  // player's current honor level (0–600, global across all heroes).
  // Source: data/extracted/latest/hero_honor_levels.json
  // class_N_hp: flat HP added to each hero of quality class N.
  // Quality class mapping: SR=2, SSR=3, UR=4 (UR+=5, not in hero list).

  // Honor HP ("HP wszystkich bohaterów" on the Wall of Honor) = Σ over heroes of the hero's
  // honor level (hexagon number on the wall = wallOfHonorLevel) looked up in lw_hero_honorLevel
  // by the hero's quality class; the same total is granted to every hero.
  let honorFromWall = 0;
  {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const hh = require("@/data/extracted/latest/hero_honor_levels.json") as { records: Array<Record<string, number | null>> };
    const hRow = new Map(hh.records.map(r => [r.honor_level as number, r]));
    for (const hero of HEROES) {
      const lvl = profile.heroes[hero.id]?.wallOfHonorLevel ?? 0;
      if (lvl <= 0) continue;
      const ssr = SSR_HEROES[hero.id];
      // Fitted on the in-game wall: UR and promoted SSR -> class 5, SSR -> 4, SR -> 3 (total 23,500 exactly).
      const cls = hero.rarity === "UR" ? 5 : hero.rarity === "SR" ? 3 : (ssr && ssr.mult !== 1 ? 5 : 4);
      honorFromWall += (hRow.get(Math.min(600, lvl))?.[`class_${cls}_hp`] as number | null) ?? 0;
    }
  }
  const honorTotal = (profile.honorHp ?? 0) > 0 ? profile.honorHp! : honorFromWall;
  if (honorTotal > 0) {
    // Observed in-game: the same flat "Bonus honoru" HP for every hero (UR+, UR and SSR alike).
    for (const hero of HEROES) {
      if (!profile.heroes[hero.id]?.owned) continue;
      add(heroFlatHp, `${hero.name}: Honor`, honorTotal, "HonorLevel");
    }
  } else if ((profile.honorLevel ?? 0) > 0) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const honorData = require("@/data/extracted/latest/hero_honor_levels.json") as {
      records: Array<{
        honor_level: number;
        class_1_hp: number | null; class_2_hp: number | null;
        class_3_hp: number | null; class_4_hp: number | null;
        class_5_hp: number | null;
      }>;
    };
    const lvl = profile.honorLevel ?? 0;
    const lo = Math.floor(lvl), hi = Math.ceil(lvl);
    const rowLo = honorData.records.find(r => r.honor_level === lo);
    const rowHi = honorData.records.find(r => r.honor_level === hi) ?? rowLo;
    const honorRow = rowLo && rowHi ? (() => {
      const t = hi === lo ? 0 : lvl - lo;
      const mix = (k: keyof typeof rowLo) => {
        const a = rowLo[k] as number | null, b = rowHi[k] as number | null;
        return a == null || b == null ? a : a + (b - a) * t;
      };
      return { class_1_hp: mix("class_1_hp"), class_2_hp: mix("class_2_hp"), class_3_hp: mix("class_3_hp"), class_4_hp: mix("class_4_hp"), class_5_hp: mix("class_5_hp") };
    })() : undefined;
    if (honorRow) {
      const RARITY_TO_CLASS: Record<string, 1 | 2 | 3 | 4 | 5> = { SR: 4, SSR: 4, UR: 4 };
      for (const hero of HEROES) {
        const save = profile.heroes[hero.id];
        if (!save?.owned) continue;
        const cls = RARITY_TO_CLASS[hero.rarity];
        if (!cls) continue;
        const key = `class_${cls}_hp` as keyof typeof honorRow;
        const flatHp = honorRow[key] as number | null;
        if (flatHp != null && flatHp > 0) {
          // Label starts with hero name so heroAbsoluteStats per-hero filter catches it
          add(heroFlatHp, `${hero.name}: Honor Lv${profile.honorLevel}`, flatHp, "HonorLevel");
        }
      }
    }
  }

  // ── 10. Decoration Building Level (M-020) ───────────────────
  // 43 building groups, each tracked independently with its own (level, progress).
  // stage_ew_hp/atk/def: INCREMENTAL Hero HP/ATK/DEF at each milestone (not cumulative).
  // Each group is summed cumulatively from (1) up to that group's current (level, progress).
  //
  // Lv1 & Lv2: game table only has lv3-6. Derived formula (calibrated from screenshot):
  //   lv1_gain = lv2_gain = para_ew_X (from any lv3 record) × 9
  //   (= para_ew × stage_need_pr3 / 2 = para_ew × 18/2)
  //
  // Source: data/extracted/latest/decoration_building_levels.json

  {
    // Per-group simulation (when groups are configured)
    let totalHp = 0, totalAtk = 0, totalDef = 0;
    if (profile.decorationBuildingGroups && Object.keys(profile.decorationBuildingGroups).length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const dbData = require("@/data/extracted/latest/decoration_building_levels.json") as {
        records: Array<{
          building_group: number; level: number; progress: number;
          para_ew_hp: number | null; para_ew_atk: number | null; para_ew_def: number | null;
          stage_ew_hp: number | null; stage_ew_atk: number | null; stage_ew_def: number | null;
        }>;
      };
      const ORDER: [number, number][] = [
        [3,1],[3,2],[3,3],[4,1],[4,2],[4,3],[5,1],[5,2],[5,3],[6,1],[6,2],[6,3],
      ];
      for (const [grpStr, { level: targetLevel, progress: targetProgress }] of Object.entries(profile.decorationBuildingGroups)) {
        const grp = Number(grpStr);
        if (!targetLevel) continue;
        const grpRecs = dbData.records.filter(r => r.building_group === grp);

        // Lv1 & Lv2 synthetic bonuses (derived from lv3 para rate × 9)
        const lv3Rec = grpRecs.find(r => r.level === 3 && r.progress === 1);
        if (lv3Rec) {
          const lv1hp  = (lv3Rec.para_ew_hp  ?? 0) * 9;
          const lv1atk = (lv3Rec.para_ew_atk ?? 0) * 9;
          const lv1def = (lv3Rec.para_ew_def ?? 0) * 9;
          if (targetLevel >= 1) { totalHp += lv1hp; totalAtk += lv1atk; totalDef += lv1def; }
          if (targetLevel >= 2) { totalHp += lv1hp; totalAtk += lv1atk; totalDef += lv1def; }
        }

        // Lv3-6 milestone bonuses
        if (targetLevel >= 3 && targetProgress) {
          for (const [lv, pr] of ORDER) {
            const rec = grpRecs.find(r => r.level === lv && r.progress === pr);
            if (rec) {
              totalHp  += rec.stage_ew_hp  ?? 0;
              totalAtk += rec.stage_ew_atk ?? 0;
              totalDef += rec.stage_ew_def ?? 0;
            }
            if (lv === targetLevel && pr === targetProgress) break;
          }
        }
      }
    }
    // Manual override from game "Szczegóły bonusów dekoracji" takes precedence when set
    const ovHp  = profile.decorationBonusHp  ?? 0;
    const ovAtk = profile.decorationBonusAtk ?? 0;
    const ovDef = profile.decorationBonusDef ?? 0;
    const useHp  = ovHp  > 0 ? ovHp  : totalHp;
    const useAtk = ovAtk > 0 ? ovAtk : totalAtk;
    const useDef = ovDef > 0 ? ovDef : totalDef;
    if (useHp  > 0) add(heroFlatHp,  "Dec. Buildings", useHp,  "Building");
    if (useAtk > 0) add(heroFlatAtk, "Dec. Buildings", useAtk, "Building");
    if (useDef > 0) add(heroFlatDef, "Dec. Buildings", useDef, "Building");
  }

  // ── 11. UAV Level (M-024) ────────────────────────────────────
  // Cumulative flat drone HP/ATK/DEF from UAV unit upgrades (level 1–300).
  // Each level record stores the INCREMENTAL gain for that level; total is
  // the running sum from level 1 to the player's current uavLevel.
  // Source: data/extracted/latest/uav_levels.json (uav_id = 1000)

  if ((profile.uavLevel ?? 0) > 0) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const uavData = require("@/data/extracted/latest/uav_levels.json") as {
      records: Array<{ uav_id: number; level: number; sub_level: number; hp_flat: number | null; atk_flat: number | null; def_flat: number | null }>;
    };
    // Values are CUMULATIVE at each (level, sub_level). Use sub_level=0 for the base value at that level.
    const uavRec = uavData.records.find(r => r.uav_id === 1000 && r.level === profile.uavLevel && r.sub_level === 0);
    if (uavRec) {
      const label = `UAV Lv${profile.uavLevel}`;
      if ((uavRec.hp_flat  ?? 0) > 0) add(droneFlatHp,  label, uavRec.hp_flat!,  "UAV");
      if ((uavRec.atk_flat ?? 0) > 0) add(droneFlatAtk, label, uavRec.atk_flat!, "UAV");
      if ((uavRec.def_flat ?? 0) > 0) add(droneFlatDef, label, uavRec.def_flat!, "UAV");
    }
  }

  // ── 11b. Drone Components ────────────────────────────────────
  // profile.drone.componentLevels[0..5] → system_tier 1–6 in drone_levels.json
  // hp/atk/def are cumulative at each level.
  {
    const compLevels = profile.drone?.componentLevels ?? [];
    if (compLevels.some(l => l > 0)) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const droneData = require("@/data/extracted/latest/drone_levels.json") as {
        records: Array<{ system_tier: number; level: number; hp: number; atk: number; def: number }>;
      };
      for (let i = 0; i < 6; i++) {
        const lv = compLevels[i] ?? 0;
        if (lv <= 0) continue;
        const tier = i + 1;
        const rec = droneData.records.find(r => r.system_tier === tier && r.level === lv);
        if (!rec) continue;
        const label = `Drone Component ${tier} Lv${lv}`;
        if (rec.hp  > 0) add(droneFlatHp,  label, rec.hp,  "Drone");
        if (rec.atk > 0) add(droneFlatAtk, label, rec.atk, "Drone");
        if (rec.def > 0) add(droneFlatDef, label, rec.def, "Drone");
      }
    }
  }

  // ── 11c. UAV Combat Skill hero % bonus ──────────────────────
  // lw_hero_skill 700100–700105 (Wzmocnienie bojowe) property_out_of_battle lists
  // 75050;0.2;0 but calibration shows this does NOT appear in the game's permanent
  // hero HP breakdown — it is an active combat bonus only. Removed to match game.

  const autoDrone = !!profile.drone?.componentProgress;
  let autoDroneCrit = 0, autoDroneCritDmg = 0;

  // ── 11h. Drone (auto) ────────────────────────────────────────
  // Verified against the in-game "Atrybuty Drona"/"Komponent" screens:
  //  drone total = Combat Boost level table + UAV level/sub-level table + component drone stats
  //                + skin TD-2 (+5000 ATK, drone level >= 50);
  //  hero bonus  = total x ratio (18/19/19 %) + component hero flats; pct from components and
  //                skin TD-3 (+5% hero ATK, drone level >= 100).
  // Components at Lv8+ gain 'small' per-1% research progress and 'big' bonuses at 20/40/60/80/100 %.
  if (autoDrone) {
    const dr = profile.drone!;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cbT = require("@/knowledge/drone_combat_boost.json") as { levels: Record<string, { hp: number; atk: number; def: number }> };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const uavT = require("@/data/extracted/latest/uav_levels.json") as { records: Array<{ uav_id: number; level: number; sub_level: number; hp_flat?: number; atk_flat?: number; def_flat?: number }> };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sqT = require("@/knowledge/squad_equipment.json") as { records: Array<{
      slot: number; level: number;
      effect: Array<{ stat_id: number; value: number }>; effect_hero: Array<{ stat_id: number; value: number }>;
      upgrade_steps: Array<{ pct_min: number; pct_max: number;
        small_percent_effect: Array<{ stat_id: number; value: number }>; small_percent_effect_hero: Array<{ stat_id: number; value: number }>;
        big_percent_effect: Array<{ stat_id: number; value: number }>;
      }>;
    }> };
    const cb = cbT.levels[String(dr.combatBoostLevel ?? 0)];
    const uav = uavT.records.find(r => r.uav_id === 1000 && r.level === (dr.level ?? 0) && r.sub_level === (dr.subLevel ?? 0));
    const st: Record<number, number> = {};
    const addSt = (id: number, v: number) => { st[id] = (st[id] ?? 0) + v; };
    for (let i = 0; i < 6; i++) {
      const lv = dr.componentLevels?.[i] ?? 0;
      const rec = sqT.records.find(r => r.slot === i + 1 && r.level === lv);
      if (!rec) continue;
      for (const e of rec.effect) addSt(e.stat_id, e.value);
      for (const e of rec.effect_hero) addSt(e.stat_id, e.value);
      const prog = Math.max(0, Math.min(100, Math.floor(dr.componentProgress?.[i] ?? 0)));
      for (const stp of rec.upgrade_steps ?? []) {
        const n = Math.max(0, Math.min(prog, stp.pct_max) - stp.pct_min + 1);
        for (const e of stp.small_percent_effect) addSt(e.stat_id, e.value * n);
        for (const e of stp.small_percent_effect_hero) addSt(e.stat_id, e.value * n);
        if (prog >= stp.pct_max) for (const e of stp.big_percent_effect) addSt(e.stat_id, e.value);
      }
    }
    const droneLv = dr.level ?? 0;
    const skinAtk = droneLv >= 50 ? 5000 : 0;
    const dHp  = (cb?.hp  ?? 0) + (uav?.hp_flat  ?? 0) + (st[50081] ?? 0);
    const dAtk = (cb?.atk ?? 0) + (uav?.atk_flat ?? 0) + (st[50082] ?? 0) + skinAtk;
    const dDef = (cb?.def ?? 0) + (uav?.def_flat ?? 0) + (st[50083] ?? 0);
    add(heroFlatHp,  "Dron (auto) HP",  Math.round(dHp  * (dr.droneConvHp  ?? 18) / 100) + (st[50094] ?? 0), "Drone");
    add(heroFlatAtk, "Dron (auto) ATK", Math.round(dAtk * (dr.droneConvAtk ?? 19) / 100) + (st[50095] ?? 0), "Drone");
    add(heroFlatDef, "Dron (auto) DEF", Math.round(dDef * (dr.droneConvDef ?? 19) / 100) + (st[50096] ?? 0), "Drone");
    add(heroHpPct,  "Dron (auto)", (st[75050] ?? 0) * 100, "Drone");
    add(heroAtkPct, "Dron (auto)", (st[75150] ?? 0) * 100 + (droneLv >= 100 ? 5 : 0), "Drone");
    add(heroDefPct, "Dron (auto)", (st[75250] ?? 0) * 100, "Drone");
    autoDroneCrit = st[50011] ?? 0;
    autoDroneCritDmg = st[50012] ?? 0;
  }

  // ── 11d. Drone Component hero flat + % bonus (squad equipment) ──────
  // Drone components at Red quality (level 8–12) grant hero HP/ATK/DEF flat (effect field)
  // AND hero HP%/ATK%/DEF% (effect_hero field, stat_ids 75050/75150/75250).
  // Slots: 2=Frame→HP flat+pct, 3=Rotor→DEF flat+pct, 6=Engine→ATK flat+pct.
  // componentLevels[i] = unified level 1–12 (quality 1=White…6=Red).
  // Source: knowledge/squad_equipment_flat.json

  if (!autoDrone) {
    const compLevels = profile.drone?.componentLevels ?? [];
    const dHp = profile.drone?.droneHeroHpPct ?? 0, dAtk = profile.drone?.droneHeroAtkPct ?? 0, dDef = profile.drone?.droneHeroDefPct ?? 0;
    const directDronePct = dHp > 0 || dAtk > 0 || dDef > 0;
    if (directDronePct) {
      if (dHp  > 0) add(heroHpPct,  "Dron (z gry)", dHp,  "Drone");
      if (dAtk > 0) add(heroAtkPct, "Dron (z gry)", dAtk, "Drone");
      if (dDef > 0) add(heroDefPct, "Dron (z gry)", dDef, "Drone");
    }
    if (compLevels.some(l => l >= 8)) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sqData = require("@/knowledge/squad_equipment_flat.json") as {
        records: Array<{ slot: number; level: number; stat_id: number; value: number; name: string }>;
      };
      const HP_FLAT = 50094, ATK_FLAT = 50095, DEF_FLAT = 50096;
      const HP_PCT  = 75050, ATK_PCT  = 75150, DEF_PCT  = 75250;
      for (let i = 0; i < 6; i++) {
        const lv = compLevels[i] ?? 0;
        if (lv < 8) continue;
        const slot = i + 1;
        for (const rec of sqData.records) {
          if (rec.slot !== slot || rec.level !== lv) continue;
          if (rec.stat_id === HP_FLAT)  add(heroFlatHp,  `Drone ${rec.name} Lv${lv}`, rec.value, "Drone");
          if (rec.stat_id === ATK_FLAT) add(heroFlatAtk, `Drone ${rec.name} Lv${lv}`, rec.value, "Drone");
          if (rec.stat_id === DEF_FLAT) add(heroFlatDef, `Drone ${rec.name} Lv${lv}`, rec.value, "Drone");
          if (directDronePct && (rec.stat_id === HP_PCT || rec.stat_id === ATK_PCT || rec.stat_id === DEF_PCT)) continue;
          if (rec.stat_id === HP_PCT)   add(heroHpPct,   `Drone ${rec.name} Lv${lv}`, rec.value * 100, "Drone");
          if (rec.stat_id === ATK_PCT)  add(heroAtkPct,  `Drone ${rec.name} Lv${lv}`, rec.value * 100, "Drone");
          if (rec.stat_id === DEF_PCT)  add(heroDefPct,  `Drone ${rec.name} Lv${lv}`, rec.value * 100, "Drone");
        }
      }
    }
  }

  // ── 11e. Premia Drona → hero flat HP/ATK/DEF ────────────────
  // User reads total flat drone HP/ATK/DEF directly from game (Atrybuty Drona screen)
  // and enters conversion ratios (game default 18/19/18 %).
  // Applies to all heroes uniformly (group "Drone" → picked up by globalFlat filter).
  if (!autoDrone) {
    const premHp  = profile.drone?.dronePremiaHp  ?? 0;
    const premAtk = profile.drone?.dronePremiaAtk ?? 0;
    const premDef = profile.drone?.dronePremiaDef ?? 0;
    const convHp  = profile.drone?.droneConvHp  ?? 18;
    const convAtk = profile.drone?.droneConvAtk ?? 19;
    const convDef = profile.drone?.droneConvDef ?? 18;
    if (premHp  > 0) add(heroFlatHp,  "Premia Drona HP",  premHp  * convHp  / 100, "Drone");
    if (premAtk > 0) add(heroFlatAtk, "Premia Drona ATK", premAtk * convAtk / 100, "Drone");
    if (premDef > 0) add(heroFlatDef, "Premia Drona DEF", premDef * convDef / 100, "Drone");
  }

  // ── 11f. Combat Boost Level → hero flat HP/ATK/DEF ─────────────
  // lw_drone_battlesystem_level vExt stats (effect IDs 50081/50082/50083).
  // Same power coefficients as hero HP/ATK/DEF; added directly as flat.
  if (!autoDrone) {
    const cbLv = profile.drone?.combatBoostLevel ?? 0;
    if (cbLv > 0) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const cbData = require("@/knowledge/drone_combat_boost.json") as {
        levels: Record<string, { hp: number; atk: number; def: number }>;
      };
      const cbStats = cbData.levels[String(cbLv)];
      if (cbStats) {
        add(heroFlatHp,  `Combat Boost Lv${cbLv}`, cbStats.hp,  "Drone");
        add(heroFlatAtk, `Combat Boost Lv${cbLv}`, cbStats.atk, "Drone");
        add(heroFlatDef, `Combat Boost Lv${cbLv}`, cbStats.def, "Drone");
      }
    }
  }

  // ── 11g. Drone ChipSets → hero flat HP/ATK/DEF ──────────────────
  // chipSets[0] = active set; slots: initial(1), attack(2), defense(3), interference(4).
  // Stats sourced from lw_drone_skillchip_attribute via drone_chip_stats.json.
  if (!autoDrone) {
    const activeSet = profile.drone?.chipSets?.[0];
    if (activeSet) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const chipData = require("@/knowledge/drone_chip_stats.json") as {
        chips: Record<string, { stars: Record<string, { hp: number; atk: number; def: number }> }>;
      };
      const SLOTS: [keyof typeof activeSet, number][] = [
        ["initial", 1], ["attack", 2], ["defense", 3], ["interference", 4],
      ];
      for (const [slotName, slotType] of SLOTS) {
        const chip = activeSet[slotName];
        if (!chip || chip.rarity === "none") continue;
        const unit = chip.unit ?? "tank";
        const key = `${chip.rarity}_${slotType}_${unit}`;
        const chipEntry = chipData.chips[key];
        if (!chipEntry) continue;
        const stats = chipEntry.stars[String(chip.stars ?? 1)];
        if (!stats) continue;
        const label = `Chip ${slotName} ${chip.rarity}★${chip.stars}`;
        add(heroFlatHp,  label, stats.hp,  "Drone");
        add(heroFlatAtk, label, stats.atk, "Drone");
        add(heroFlatDef, label, stats.def, "Drone");
      }
    }
  }

  // ── 12. Hero Skill Out-of-Battle (M-008+) ───────────────────
  // Each UR hero has 4 skill slots. Slots 1–3 are always active for owned
  // heroes; slot 4 (Expertise) requires ≥4 stars. property_out_of_battle
  // values are constant across star levels 0–5 (confirmed from lw_hero_skill).
  // Source: hero_skill_groups.json + skill_group_bonuses.json + hero_name_to_id.json
  // Values are decimal fractions (0.1 = 10%); multiply by 100 for %.

  {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nameToId = require("@/data/extracted/latest/hero_name_to_id.json") as Record<string, number>;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const skillGroupsData = require("@/data/extracted/latest/hero_skill_groups.json") as {
      records: Array<{ hero_id: number; hero_name: string; skill_groups: number[] }>;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const skillBonusData = require("@/data/extracted/latest/skill_group_bonuses.json") as {
      records: Array<{ group_id: number; hp_pct?: number; atk_pct?: number; def_pct?: number }>;
    };

    const groupsByGameId = new Map(skillGroupsData.records.map(r => [r.hero_id, r.skill_groups]));
    const bonusByGroup   = new Map(skillBonusData.records.map(r => [r.group_id, r]));

    // SSR / promoted-SSR heroes: slot 4 Expertise gives +10% (SSR) or +20% (promoted) HP/ATK/DEF.
    for (const hero of HEROES) {
      const ssr = SSR_HEROES[hero.id];
      const save = profile.heroes[hero.id];
      if (!ssr || !save?.owned || (save.stars ?? 1) < 4) continue;
      const v = ssr.mult !== 1 ? 20 : 10;
      const label = `${hero.name} Skill 4 (OOB)`;
      add(heroHpPct, label, v, "HeroSkill");
      add(heroAtkPct, label, v, "HeroSkill");
      add(heroDefPct, label, v, "HeroSkill");
    }

    for (const hero of HEROES) {
      if (hero.rarity !== "UR") continue;
      const save = profile.heroes[hero.id];
      if (!save?.owned) continue;

      const gameId = nameToId[hero.id];
      if (!gameId) continue;
      const groups = groupsByGameId.get(gameId);
      if (!groups) continue;

      groups.forEach((groupId, slotIdx) => {
        // Only expertise slot (slot 4, index 3) grants hero HP/ATK/DEF pct OOB.
        // Slots 1–3 give troop bonuses; skill_group_bonuses hp/atk/def_pct for those slots is placeholder data.
        if (slotIdx !== 3) return;
        if ((save.stars ?? 1) < 4) return; // Expertise requires 4★
        const bonus = bonusByGroup.get(groupId);
        if (!bonus) return;
        const label = `${hero.name} Skill 4 (OOB)`;
        if (bonus.hp_pct)  add(heroHpPct,  label, bonus.hp_pct  * 100, "HeroSkill");
        if (bonus.atk_pct) add(heroAtkPct, label, bonus.atk_pct * 100, "HeroSkill");
        if (bonus.def_pct) add(heroDefPct, label, bonus.def_pct * 100, "HeroSkill");
      });
    }
  }

  // ── 13. EW Weapon Unit Stats (M-010-B) ───────────────────────
  // Training EW units unlocks milestone rewards. overall_milestones apply
  // to flat EW stat accumulators (stat IDs 51002/51003, 51052/51053, 51102/51103).
  // The player's exclusiveWeaponLevel (1–30) maps to a unit skill_level via
  // ew_weapon_levels; milestones fire when skill_level ≥ required_level.
  // Source: ew_weapon_units.json + ew_weapon_levels.json + hero_name_to_id.json

  {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nameToId = require("@/data/extracted/latest/hero_name_to_id.json") as Record<string, number>;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ewUnitsData = require("@/data/extracted/latest/ew_weapon_units.json") as {
      records: Array<{
        hero_id: number;
        overall_stat_id: number;
        personal_stat_id: number;
        overall_milestones:  Record<string, [number, number]>;
        personal_milestones: Record<string, [number, number]>;
      }>;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ewLevelsData = require("@/data/extracted/latest/ew_weapon_levels.json") as {
      records: Array<{ hero_id: number; level: number; skill_level: number }>;
    };

    // stat_id → flat accumulator (51002/51052/51102 = EW HP; 51003/51053/51103 = EW ATK)
    const EW_STAT_ACC: Partial<Record<number, TracedPct>> = {
      51002: ewFlatHp,  51003: ewFlatAtk,
      51052: ewFlatHp,  51053: ewFlatAtk,
      51102: ewFlatHp,  51103: ewFlatAtk,
    };

    // hero_id → (ew_level → unit_skill_level)
    const ewLvMap = new Map<number, Map<number, number>>();
    for (const rec of ewLevelsData.records) {
      if (!ewLvMap.has(rec.hero_id)) ewLvMap.set(rec.hero_id, new Map());
      ewLvMap.get(rec.hero_id)!.set(rec.level, rec.skill_level);
    }

    for (const hero of HEROES) {
      if (hero.rarity !== "UR") continue;
      const save = profile.heroes[hero.id];
      if (!save?.owned || (save.exclusiveWeaponLevel ?? 0) <= 0) continue;

      const gameId = nameToId[hero.id];
      if (!gameId) continue;
      const skillLevel = ewLvMap.get(gameId)?.get(save.exclusiveWeaponLevel) ?? 0;

      const unitRows = ewUnitsData.records.filter(r => r.hero_id === gameId);
      for (const unit of unitRows) {
        const label = `EW ${hero.name} unit`;
        for (const [, ms] of Object.entries(unit.overall_milestones)) {
          const [reqLv, reward] = ms;
          if (skillLevel >= reqLv) {
            const acc = EW_STAT_ACC[unit.overall_stat_id];
            if (acc) add(acc, `${label} overall`, reward, "EWUnit");
          }
        }
        for (const [, ms] of Object.entries(unit.personal_milestones)) {
          const [reqLv, reward] = ms;
          if (skillLevel >= reqLv) {
            const acc = EW_STAT_ACC[unit.personal_stat_id];
            if (acc) add(acc, `${label} personal`, reward, "EWUnit");
          }
        }
      }
    }
  }

  // ── 14. Military Centers + HQ flat hero stats (M-BLD) ─────────
  // HQ gives flat HP/ATK/DEF to ALL heroes.
  // Tank/Air/Missile Centers give flat HP/ATK/DEF to that type's heroes.
  // Bonuses are cumulative at each level (read from buildings-data.json).
  // Source: lib/buildings-data.json (bonuses column at player's buildingLevels[id])

  {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bldData = require("@/lib/buildings-data.json") as {
      buildings: Array<{
        id: string;
        name: string;
        levels: Array<{ level: number; bonuses: Record<string, number> }>;
      }>;
    };
    const bldLevels = profile.buildingLevels ?? {};
    const bldMap = new Map(bldData.buildings.map(b => [b.id, b]));

    function getBuildingBonus(bldId: string, key: string): number {
      const bld = bldMap.get(bldId);
      if (!bld) return 0;
      const lv = bldLevels[bldId] ?? 0;
      if (lv <= 0) return 0;
      const row = bld.levels.find(l => l.level === lv) ?? bld.levels.filter(l => l.level <= lv).at(-1);
      return row?.bonuses[key] ?? 0;
    }

    // HQ — all heroes. hqLevel is a legacy top-level field; buildingLevels["headquarters"]
    // takes precedence if set, otherwise fall back to profile.hqLevel.
    if (!bldLevels["headquarters"] && profile.hqLevel) {
      bldLevels["headquarters"] = profile.hqLevel;
    }
    const hqHp  = getBuildingBonus("headquarters", "Hero Hp");
    const hqAtk = getBuildingBonus("headquarters", "Hero Attack");
    const hqDef = getBuildingBonus("headquarters", "Hero Defense");
    const hqLv  = bldLevels["headquarters"] ?? 0;
    if (hqHp  > 0) add(heroFlatHp,  `HQ Lv${hqLv}`, hqHp,  "Building");
    if (hqAtk > 0) add(heroFlatAtk, `HQ Lv${hqLv}`, hqAtk, "Building");
    if (hqDef > 0) add(heroFlatDef, `HQ Lv${hqLv}`, hqDef, "Building");

    // Military Centers — per troop type
    const CENTERS = [
      { id: "tank-center",    label: "Tank Center",     hpKey: "Tank Hero Hp",      atkKey: "Tank Hero Attack",      defKey: "Tank Hero Defense" },
      { id: "air-center",     label: "Air Center",      hpKey: "Aircraft Hero Hp",  atkKey: "Aircraft Hero Attack",  defKey: "Aircraft Hero Defense" },
      { id: "missile-center", label: "Missile Center",  hpKey: "Missile Hero Hp",   atkKey: "Missile Hero Attack",   defKey: "Missile Hero Defense" },
    ] as const;
    for (const c of CENTERS) {
      const lv  = bldLevels[c.id] ?? 0;
      if (lv <= 0) continue;
      const hp  = getBuildingBonus(c.id, c.hpKey);
      const atk = getBuildingBonus(c.id, c.atkKey);
      const def = getBuildingBonus(c.id, c.defKey);
      if (hp  > 0) add(heroFlatHp,  `${c.label} Lv${lv}`, hp,  "Building");
      if (atk > 0) add(heroFlatAtk, `${c.label} Lv${lv}`, atk, "Building");
      if (def > 0) add(heroFlatDef, `${c.label} Lv${lv}`, def, "Building");
    }
  }

  // ── 14b. Hero-screen overrides for building / drone flat bonuses ─────────
  {
    const replaceGroup = (pct: TracedPct, group: string, label: string, value: number | undefined) => {
      if (!value || value <= 0) return;
      pct.contributions = pct.contributions.filter(c => c.group !== group);
      pct.total = pct.contributions.reduce((a, c) => a + c.value, 0);
      add(pct, label, value, group);
    };
    // Tank values live in buildingFlat{Hp,Atk,Def}; other troop types in buildingFlatByType.
    const hasOverride = [profile.buildingFlatHp, profile.buildingFlatAtk, profile.buildingFlatDef].some(v => (v ?? 0) > 0)
      || Object.values(profile.buildingFlatByType ?? {}).some(v => v && (v.hp > 0 || v.atk > 0 || v.def > 0));
    if (hasOverride) {
      for (const pct of [heroFlatHp, heroFlatAtk, heroFlatDef]) {
        pct.contributions = pct.contributions.filter(c => c.group !== "Building");
        pct.total = pct.contributions.reduce((a, c) => a + c.value, 0);
      }
      const byType = { Tank: { hp: profile.buildingFlatHp ?? 0, atk: profile.buildingFlatAtk ?? 0, def: profile.buildingFlatDef ?? 0 }, ...(profile.buildingFlatByType ?? {}) };
      for (const [type, v] of Object.entries(byType)) {
        if (!v) continue;
        add(heroFlatHp,  `Premia budynku (z gry) ${type}`, v.hp,  "Building");
        add(heroFlatAtk, `Premia budynku (z gry) ${type}`, v.atk, "Building");
        add(heroFlatDef, `Premia budynku (z gry) ${type}`, v.def, "Building");
      }
    }
    replaceGroup(heroFlatHp,  "Drone",    "Premia Drona (z gry)",   profile.droneFlatHp);
    replaceGroup(heroFlatAtk, "Drone",    "Premia Drona (z gry)",   profile.droneFlatAtk);
    replaceGroup(heroFlatDef, "Drone",    "Premia Drona (z gry)",   profile.droneFlatDef);
  }

  // ── 15. Hero Gear Stats ──────────────────────────────────────
  // See computeGearSlot() above for the verified model (level+1 index, promote tiers, star extras).

  {
    const GEAR_SLOTS = ["Cannon", "Chip", "Armor", "Radar"] as const;

    for (const hero of HEROES) {
      const save = profile.heroes[hero.id];
      if (!save?.owned) continue;

      for (const slotName of GEAR_SLOTS) {
        const gearSlot = save.gear?.[slotName];
        const g = computeGearSlot(gearSlot, slotName);
        if (!gearSlot || !g) continue;
        const stars = Math.max(0, Math.min(5, gearSlot.stars ?? 0));
        const label = `${hero.name} ${slotName} (${gearSlot.quality} Lv${gearSlot.level} ★${stars}${gearSlot.tier ? ` T${gearSlot.tier}` : ""})`;
        if (g.flatHp)  add(heroFlatHp,  label, g.flatHp,       "Gear");
        if (g.flatAtk) add(heroFlatAtk, label, g.flatAtk,      "Gear");
        if (g.flatDef) add(heroFlatDef, label, g.flatDef,      "Gear");
        if (g.hpPct)   add(heroHpPct,   label, g.hpPct  * 100, "Gear");
        if (g.atkPct)  add(heroAtkPct,  label, g.atkPct * 100, "Gear");
        if (g.defPct)  add(heroDefPct,  label, g.defPct * 100, "Gear");
      }
    }
  }

  // ── 16. Absolute hero stats per hero ─────────────────────────
  // Formula: template_stat(lv) × (base_stat/10000) × attr_ratio × (1 + pct) + rank_vExt × (base_stat/10000) × (1 + pct) + flat
  // template_stat(type=2, lv) = T2_LV1 × stat_mult_t2(lv). All 15 tracked UR+ heroes use template_id=2.
  // Confirmed against Murphy in-game breakdown: <0.01% error on level, rank, and EW contributions.
  const heroAbsoluteStats: Record<string, { hp: number; atk: number; def: number }> = {};
  const heroPower: Record<string, number> = {};
  const overlordBonus = profile.overlord ? computeOverlordHeroBonus(profile) : null;
  const heroPowerBreakdown: Record<string, {
    propertyPower: number; skillPower: number; gearPower: number; ewPower: number;
    flatHp: number; flatAtk: number; flatDef: number; critRate: number; critDmg: number;
    upgradePow: number; promotePow: number;
  }> = {};
  {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const heroBaseData = require("@/data/extracted/latest/hero_base.json") as {
      records: Array<{ id: number; base_hp: number; base_atk: number; base_def: number }>;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const heroLevelData = require("@/data/extracted/latest/hero_levels.json") as {
      records: Array<{ level: number; stat_mult_t2: number }>;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const heroOldRanksData = require("@/data/extracted/latest/hero_old_ranks.json") as {
      records: Array<{ rank: number; hp: number; atk: number; def: number }>;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const heroNameToId = require("@/data/extracted/latest/hero_name_to_id.json") as Record<string, number>;

    const baseById = new Map(heroBaseData.records.map(r => [r.id, r]));
    const multByLv = new Map(heroLevelData.records.map(r => [r.level, r.stat_mult_t2]));
    // Old system (lw_hero_rank): all 15 tracked UR+ heroes use this table, attr_ratio=1.0 at all ranks.
    // stars → old rank mapping (7★ max = rank 26; interpolated for lower stars)
    // Old system: 5★ is the maximum (rank 26). Confirmed: Murphy stars=5 → game Premia rangi = 315,445 = rank26 vExt × 1.59
    const OLD_STARS_TO_RANK: Record<number, number> = { 0: 0, 1: 1, 2: 5, 3: 10, 4: 15, 5: 26, 6: 26, 7: 26 };
    const oldRankByRank = new Map(heroOldRanksData.records.map(r => [r.rank, r]));

    // lw_template_property type=2 lv1 absolute values (confirmed from game data)
    const T2_HP_LV1  = 1620;
    const T2_ATK_LV1 = 38.58;
    const T2_DEF_LV1 = 7.72;

    // ── Hero power lookup tables ──────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const gearFlatData = require("@/knowledge/hero_gear_flat.json") as {
      records: Array<{
        quality: number; slot: number; row_type: string;
        upgrade_level: number | null; promote_tier: number | null;
        hero_only_power: number;
      }>;
    };
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ewLevelsRaw = require("@/data/extracted/latest/ew_weapon_levels.json") as {
      records: Array<{ hero_id: number; level: number; power: number; skill_level: number }>;
    };
    // EW weapon power — FIXED cumulative milestone power per (hero, ew_level).
    // Does NOT scale with hero level (lw_hero_unique_weapon.power).
    const ewWeaponPowerMap = new Map<string, number>();
    for (const r of ewLevelsRaw.records) {
      ewWeaponPowerMap.set(`${r.hero_id}_${r.level}`, r.power);
    }
    // EW property power — property power (HP*0.5+ATK*12.5+DEF*35) from EW weapon HP/ATK/DEF stats.
    // Pre-computed constant per (hero, ew_level): raw_stat*(base_stat/10000), no hero-level scaling.
    // Source: lw_hero_unique_weapon vExt, stat IDs 51000=HP 51050=ATK 51100=DEF.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ewPropRaw = require("@/knowledge/ew_power_by_hero.json") as {
      heroes: Record<string, { ew_power: number[] }>;
    };
    const ewPropertyPowerMap = new Map<string, number>();
    for (const [hSlug, hData] of Object.entries(ewPropRaw.heroes)) {
      for (let lv = 0; lv < hData.ew_power.length; lv++) {
        ewPropertyPowerMap.set(`${hSlug}_${lv}`, hData.ew_power[lv]);
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const skillData = require("@/knowledge/hero_skills.json") as {
      skill_a: Array<{
        group: number; star: number; level: number; max_level: number;
        power_base: number; power_per_level: number;
      }>;
      skill_b: Array<{
        group: number; star: number; level: number; max_level: number;
        power_base: number; power_per_level: number;
      }>;
    };

    const upgradeMap = new Map<string, number>();
    const promoteMap = new Map<string, number>();
    for (const r of gearFlatData.records) {
      if (r.row_type === "upgrade" && r.upgrade_level !== null)
        upgradeMap.set(`${r.quality}_${r.slot}_${r.upgrade_level}`, r.hero_only_power);
      else if (r.row_type === "promote" && r.promote_tier !== null)
        promoteMap.set(`${r.quality}_${r.slot}_${r.promote_tier}`, r.hero_only_power);
    }

    // skill_a lookup: (group, star) → { power_base, power_per_level, max_level } at level=1
    const skillBaseMap = new Map<string, { power_base: number; power_per_level: number; max_level: number }>();
    for (const r of skillData.skill_a) {
      if (r.level === 1) skillBaseMap.set(`${r.group}_${r.star}`, r);
    }
    // skill_b lookup: same structure (covers 500xxx hero skills, 300xxx squad, 400xxx evolve)
    const skillBMap = new Map<string, { power_base: number; power_per_level: number; max_level: number }>();
    for (const r of skillData.skill_b) {
      if (r.level === 1) skillBMap.set(`${r.group}_${r.star}`, r);
    }
    // hero_id → sorted skill groups: group prefix = ((hero_id % 10000) + 5000) × 100
    const heroSkillGroups = (heroId: number): number[] => {
      const prefix = ((heroId % 10000) + 5000) * 100;
      return [prefix, prefix + 10, prefix + 20, prefix + 30];
    };
    // squad skill groups (300xxx): 3 groups — prefix, prefix+10, prefix+30 (no +20)
    const heroSquadSkillGroups = (heroId: number): number[] => {
      const prefix = ((heroId % 10000) + 3000) * 100;
      return [prefix, prefix + 10, prefix + 30];
    };
    // evolve skill groups (400xxx): 4 groups
    const heroEvolveSkillGroups = (heroId: number): number[] => {
      const prefix = ((heroId % 10000) + 4000) * 100;
      return [prefix, prefix + 10, prefix + 20, prefix + 30];
    };

    const QUALITY_NUM: Record<string, number> = { common: 2, rare: 3, epic: 4, legendary: 5, mythic: 6 };
    const SLOT_NUM: Record<GearType, number> = { Cannon: 1, Armor: 2, Chip: 3, Radar: 4 };
    const MAX_UPGRADE_LV: Record<number, number> = { 2: 0, 3: 15, 4: 30, 5: 40, 6: 40 };

    const heroEntries: Array<[string, number]> = [...Object.entries(heroNameToId), ...Object.entries(SSR_HEROES).map(([k, v]) => [k, v.baseId] as [string, number])];
    for (const [heroSlug, heroId] of heroEntries) {
      const save = profile.heroes[heroSlug];
      if (!save?.owned) continue;
      const ssr = SSR_HEROES[heroSlug];
      const rawBase = baseById.get(heroId);
      if (!rawBase) continue;
      const base = ssr && ssr.mult !== 1 ? { ...rawBase, base_hp: rawBase.base_hp * ssr.mult, base_atk: rawBase.base_atk * ssr.mult, base_def: rawBase.base_def * ssr.mult } : rawBase;

      const lv    = Math.max(1, Math.min(save.level ?? 1, 175));
      const stars = Math.max(0, Math.min(save.stars ?? 1, 7));
      const mult  = multByLv.get(lv) ?? 1;
      const oldRank = Math.max(0, Math.min(26, Math.round(save.rank ?? OLD_STARS_TO_RANK[stars] ?? 0)));
      const oldRankRec = oldRankByRank.get(oldRank);

      const heroInfo = HEROES.find(h => h.id === heroSlug);
      const heroName = heroInfo?.name ?? heroSlug;

      // Pct factors for displayed stats (not used in power — power uses flat only)
      const pctForHero = (pct: TracedPct) => {
        let total = 0;
        for (const c of pct.contributions) {
          if (c.group === "ResearchType") { if (c.label.startsWith(`${heroInfo?.type}: `)) total += c.value; continue; }
          const isPerHero = c.group === "Gear" || c.group === "HeroSkill";
          if (!isPerHero || c.label.startsWith(heroName + " ")) total += c.value;
        }
        return total;
      };
      const hpPctFactor  = 1 + pctForHero(heroHpPct)  / 100;
      const atkPctFactor = 1 + pctForHero(heroAtkPct) / 100;
      const defPctFactor = 1 + pctForHero(heroDefPct) / 100;
      const perHeroFlatHp  = heroFlatHp.contributions.filter(c => c.label.startsWith(heroName)).reduce((s, c) => s + c.value, 0);
      const perHeroFlatAtk = heroFlatAtk.contributions.filter(c => c.label.startsWith(heroName)).reduce((s, c) => s + c.value, 0);
      const perHeroFlatDef = heroFlatDef.contributions.filter(c => c.label.startsWith(heroName)).reduce((s, c) => s + c.value, 0);
      const centerPrefix = heroInfo?.type === "Tank" ? "Tank" : heroInfo?.type === "Aircraft" ? "Air" : "Missile";
      const isBuildingForHero = (label: string) =>
        label.startsWith("HQ") || label.startsWith(`${centerPrefix} Center`) || label === "Dec. Buildings"
          || label === `Premia budynku (z gry) ${heroInfo?.type}`;
      const isGlobal = (c: { group?: string; label: string }) =>
        (c.group === "Building" && isBuildingForHero(c.label)) || c.group === "Drone";
      const globalFlatHp  = heroFlatHp.contributions.filter(isGlobal).reduce((s, c) => s + c.value, 0);
      const globalFlatAtk = heroFlatAtk.contributions.filter(isGlobal).reduce((s, c) => s + c.value, 0);
      const globalFlatDef = heroFlatDef.contributions.filter(isGlobal).reduce((s, c) => s + c.value, 0);

      const levelHpBase  = T2_HP_LV1  * mult * (base.base_hp  / 10000);
      const levelAtkBase = T2_ATK_LV1 * mult * (base.base_atk / 10000);
      const levelDefBase = T2_DEF_LV1 * mult * (base.base_def / 10000);

      const rankHpBase  = (oldRankRec?.hp  ?? 0) * (base.base_hp  / 10000);
      const rankAtkBase = (oldRankRec?.atk ?? 0) * (base.base_atk / 10000);
      const rankDefBase = (oldRankRec?.def ?? 0) * (base.base_def / 10000);

      // Displayed stats (level+rank with %, plus all flat including gear and EW unit milestones)
      const hp  = Math.round((levelHpBase  + rankHpBase)  * hpPctFactor  + perHeroFlatHp  + globalFlatHp + ewFlatHp.total);
      const atk = Math.round((levelAtkBase + rankAtkBase) * atkPctFactor + perHeroFlatAtk + globalFlatAtk + ewFlatAtk.total);
      const def = Math.round((levelDefBase + rankDefBase) * defPctFactor + perHeroFlatDef + globalFlatDef + ewFlatDef.total);
      heroAbsoluteStats[heroSlug] = { hp, atk, def };

      // ── propertyPower: uses full displayed stats (same as heroAbsoluteStats, including gear) ──
      // Game's propertyData.GetProperty() returns displayed stats which include gear contributions.
      // equipPower from hero_gear_flat.json covers the gear's pre-computed power — no double-count
      // because the game adds both propertyPower (full stats × factors) and equipPower separately.
      // Lord's Training (Wzmocnienie treningu Władcy): fixed flat bonus for all owned heroes.
      // Confirmed from game screenshots: HP=188,358, ATK=4,486, DEF=898.
      // "Wzmocnienie treningu Władcy" (Overlord training + bond rating) — counted in hero stats AND power.
      // Computed from profile.overlord when set; otherwise the old constants (training ~Lv79 / rating 13).
      const LT_HP = overlordBonus ? overlordBonus.hp : 188358;
      const LT_ATK = overlordBonus ? overlordBonus.atk : 4486;
      const LT_DEF = overlordBonus ? overlordBonus.def : 898;
      const flatHp  = (levelHpBase  + rankHpBase)  * hpPctFactor  + perHeroFlatHp  + globalFlatHp + ewFlatHp.total  + LT_HP;
      const flatAtk = (levelAtkBase + rankAtkBase) * atkPctFactor + perHeroFlatAtk + globalFlatAtk + ewFlatAtk.total + LT_ATK;
      const flatDef = (levelDefBase + rankDefBase) * defPctFactor + perHeroFlatDef + globalFlatDef + ewFlatDef.total + LT_DEF;
      // Crit rate: auto-computed from gear (base from Cannon upgrade + promote milestones)
      let critRateFromGear = 0;
      for (const slotN of Object.keys(SLOT_NUM) as GearType[]) {
        critRateFromGear += computeGearSlot(save.gear[slotN], slotN)?.crit ?? 0;
      }
      const critRate = critRateFromGear + (autoDrone ? autoDroneCrit : (profile.drone?.droneHeroCritRate ?? 0) / 100);
      const critDmg  = (save.critDmg ?? 0) + (autoDrone ? autoDroneCritDmg : (profile.drone?.droneHeroCritDmg ?? 0) / 100);
      const propertyPower = Math.floor(
        flatHp * 0.5 + flatAtk * 12.5 + flatDef * 35
        + critRate * 313600 + critDmg * 78400
      );

      // ── skillPower: hero skills (500xxx) only. Squad (300xxx) and evolve (400xxx) skill groups
      // do NOT contribute to hero power (verified: Williams/Stetmann/Marshall in-game power).
      const starKey = Math.min(stars, 5);
      let skillPowerSum = 0;
      const skillLevels = save.skillLevels ?? [];
      const heroGroups = ssr ? ssr.groups : heroSkillGroups(heroId);
      for (let i = 0; i < heroGroups.length; i++) {
        if (i === 3 && stars < 4) continue; // Supersensory (expertise) unlocks at 4 skill stars
        const rec = skillBaseMap.get(`${heroGroups[i]}_${starKey}`);
        if (!rec) continue;
        // Table stops at max_level (30) but Exclusive Weapon raises the cap to 40; power stays linear.
        const skillLv = Math.max(1, Math.min(skillLevels[i] ?? rec.max_level, Math.max(rec.max_level, 40)));
        skillPowerSum += rec.power_base + (skillLv - 1) * rec.power_per_level;
      }
      // Constant per-hero power not yet attributed to a source (≈34.3k, identical for Williams,
      // Stetmann and Marshall at lv155 / 5 stars).
      const skillPower = Math.floor(skillPowerSum) + (ssr && ssr.mult === 1 ? HERO_UNATTRIBUTED_POWER_SSR : HERO_UNATTRIBUTED_POWER);

      // ── equipPower: item power = stat power (already in the displayed stats above) + damage
      // resistance power. Only the resistance part is added here to avoid double counting.
      let gearPower = 0;
      for (const slotName of Object.keys(SLOT_NUM) as GearType[]) {
        gearPower += computeGearSlot(save.gear[slotName], slotName)?.resistPower ?? 0;
      }
      const totalUpgradePow = gearPower;
      const totalPromotePow = 0;

      // EW power = weapon power (fixed milestone reward) + property power (HP/ATK/DEF stats from EW).
      const ewLv = Math.min(save.exclusiveWeaponLevel ?? 0, 30);
      const ewWeaponPow = ewLv > 0 ? (ewWeaponPowerMap.get(`${heroId}_${ewLv}`) ?? 0) : 0;
      // Per-level shape is identical for every hero; use Kimberly's (unmodified) row as canonical.
      const ew20Table = ewPropertyPowerMap.get("kimberly_20") ?? 0;
      const ewScale   = ewLv > 0 && ew20Table > 0 ? (ewPropertyPowerMap.get(`kimberly_${ewLv}`) ?? 0) / ew20Table : 0;
      const ewPropPow = Math.round(ewScale * (
        0.5  * EW20_RAW.hp  * base.base_hp  / 10000 +
        12.5 * EW20_RAW.atk * base.base_atk / 10000 +
        35   * EW20_RAW.def * base.base_def / 10000));
      const ewPower = ewWeaponPow + ewPropPow;

      heroPower[heroSlug] = propertyPower + skillPower + gearPower + ewPower;
      heroPowerBreakdown[heroSlug] = {
        propertyPower, skillPower, gearPower, ewPower,
        flatHp, flatAtk, flatDef, critRate, critDmg,
        upgradePow: totalUpgradePow, promotePow: totalPromotePow,
      };
    }
  }

  // ── 17. APS Research hero bonuses ───────────────────────────
  {
    const apsLevels = profile.apsResearchLevels ?? {};
    if (Object.keys(apsLevels).length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const apsData = require("@/data/extracted/latest/aps_research_levels.json") as {
        records: Array<{ science_id: number; level: number; stat_id: number; stat_value: number }>;
      };
      for (const [sciIdStr, lv] of Object.entries(apsLevels)) {
        if (!lv || lv <= 0) continue;
        const sciId = Number(sciIdStr);
        const row = apsData.records.find(r => r.science_id === sciId && r.level === lv);
        if (!row) continue;
        const label = `APS Research ${sciIdStr} Lv${lv}`;
        if (row.stat_id === 75050) add(heroHpPct,  label, row.stat_value * 100, "APS");
        if (row.stat_id === 75150) add(heroAtkPct, label, row.stat_value * 100, "APS");
        if (row.stat_id === 75250) add(heroDefPct, label, row.stat_value * 100, "APS");
      }
    }
  }

  return {
    tank, aircraft, missile,
    heroAtkPct, heroDefPct, heroHpPct,
    heroFlatHp, heroFlatAtk, heroFlatDef,
    ewFlatHp, ewFlatAtk, ewFlatDef,
    droneFlatHp, droneFlatAtk, droneFlatDef,
    heroAbsoluteStats,
    heroPower,
    heroPowerBreakdown,
    vsTechMultiplier,
    economy: {
      constructionSpeedPct,
      researchSpeedPct,
      trainingSpeedPct,
      trainingBatchPct,
      healingSpeedPct,
      hospitalCapacityPct,
    },
    costReductions: {
      buildingCostPct,
      researchCostPct,
      healingCostPct,
      trainingCostPct,
    },
  };
}

// ── Simulation: what-if ──────────────────────────────────────

/**
 * Clone the profile, apply a patch, recompute, return deltas
 * for the specified output paths.
 */
export type StatPath =
  | "tank.atkPct"    | "tank.defPct"    | "tank.hpPct"
  | "aircraft.atkPct"| "aircraft.defPct"| "aircraft.hpPct"
  | "missile.atkPct" | "missile.defPct" | "missile.hpPct"
  | "economy.constructionSpeedPct"
  | "economy.researchSpeedPct"
  | "economy.trainingSpeedPct";

export function getStatValue(stats: PlayerStats, path: StatPath): number {
  const parts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = stats;
  for (const p of parts) cur = cur?.[p];
  if (typeof cur === "object" && "total" in cur) return (cur as TracedPct).total;
  return typeof cur === "number" ? cur : 0;
}

export interface SimDelta {
  path: StatPath;
  label: string;
  unit: string;
  before: number;
  after: number;
  delta: number;
}

export function simulate(
  profile: PlayerProfile,
  patch: Partial<PlayerProfile>,
  watch: StatPath[],
): SimDelta[] {
  const before = computePlayerStats(profile);
  const patched = { ...profile, ...patch };
  const after  = computePlayerStats(patched);

  return watch.map(path => ({
    path,
    label: path,
    unit: "%",
    before: getStatValue(before, path),
    after:  getStatValue(after, path),
    delta:  getStatValue(after, path) - getStatValue(before, path),
  }));
}


// ── Squad unit power (verified vs battle report: 2,330 T10 tanks → 7,740,098 vs 7,740,090 in game) ──
// Per troop: power = 0.5·HP + 12.5·ATK + 35·DEF, where HP/ATK/DEF = (lw_soldier base + Special Forces
// "Unit Base" flats) × (1 + Units/Special Forces "Unit HP/Attack/Defense Boost" research). Hero-type
// research (Tank Mastery, Hero tab, Squad tabs) does NOT affect troops.
export function computeUnitPower(profile: PlayerProfile, troopCount: number, tier = 10, troopType = 1): number {
  if (!(troopCount > 0)) return 0;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ur = require("@/knowledge/unit_research.json") as { nodes: Record<string, Array<Record<string, number>>>; troops: Record<string, Record<string, { hp: number; atk: number; def: number }>> };
  const base = ur.troops[String(troopType)]?.[String(tier)];
  if (!base) return 0;
  const sum = { hp: 0, atk: 0, def: 0, baseHp: 0, baseAtk: 0, baseDef: 0 } as Record<string, number>;
  for (const [key, levels] of Object.entries(ur.nodes)) {
    const lv = Math.min(profile.researchLevels?.[key] ?? 0, levels.length);
    if (lv <= 0) continue;
    for (const [stat, v] of Object.entries(levels[lv - 1])) sum[stat] += v;
  }
  const hp = (base.hp + sum.baseHp) * (1 + sum.hp);
  const atk = (base.atk + sum.baseAtk) * (1 + sum.atk);
  const def = (base.def + sum.baseDef) * (1 + sum.def);
  return Math.round(troopCount * (0.5 * hp + 12.5 * atk + 35 * def));
}

// ── Squad troop count ("Pojemność oddziału") ────────────────────────────────
// Per hero = level bonus (2·level + 50 for level ≥ 100, fitted on lv150 → 350 and lv155 → 360; the APK table
// heroes_levelup.army_num stops at lv100) + 1 (survivor) + military-center "March Size" (103 at center Lv31)
// + 2 (other building source, seen on every hero: 466 = 360 + 1 + 105). Overlord adds its bond-rating
// capacity (296 at rating 14) + 3 (building) → 299. Verified: 5 tank heroes lv155 → 2,330; with Overlord → 2,629.
export function computeSquadTroops(profile: PlayerProfile, heroIds: string[]): number {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const bld = require("@/lib/buildings-data.json") as { buildings: Array<{ id: string; levels: Array<{ level: number; bonuses: Record<string, number> }> }> };
  const marchSize = (centerId: string, key: string) => {
    const lv = profile.buildingLevels?.[centerId] ?? 0;
    const b = bld.buildings.find(x => x.id === centerId);
    const row = b?.levels.filter(l => l.level <= lv).at(-1);
    return row?.bonuses[key] ?? 0;
  };
  let total = 0;
  for (const id of heroIds) {
    const hs = profile.heroes?.[id];
    const info = HEROES.find(h => h.id === id);
    if (!hs || !info) continue;
    const lvl = hs.level ?? 1;
    const levelBonus = lvl >= 100 ? 2 * lvl + 50 : 5 * lvl + 25;
    const t = info.type;
    const center = t === "Tank" ? marchSize("tank-center", "Tank Hero March Size")
      : t === "Aircraft" ? marchSize("air-center", "Aircraft Hero March Size")
      : marchSize("missile-center", "Missile Hero March Size");
    total += levelBonus + 1 + center + 2;
  }
  if (profile.overlord) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ot = require("@/knowledge/overlord_train.json") as Record<string, Record<string, number[]>>;
    total += (ot.rating?.[String(profile.overlord.ratingLevel ?? 0)]?.[3] ?? 0) + 3;
  }
  return total;
}

// ── Squad power extras (verified against an in-game battle report) ──────────
// Squad strength = hero power + unit power + drone skill power + skill chip power.
//  - drone skill power: lw_hero_skill 700100 at the drone's star level (stars 1/2/3/4/5 at drone
//    level 30/50/70/90/110; 5 stars = 1,004,000 at drone level 135 — matches the game).
//  - chip power: Σ chip skill power at each equipped chip's stars (see chip_skill_power.json).
// Overlord (Władca): training lines + "Ocena więzi" give every hero flat HP/ATK/DEF ("Wzmocnienie treningu
// Władcy": +233,094 / +5,551 / +1,111 at training 104/104/104 + rating 14). These ARE counted in hero stats and
// hero power (verified on Kimberly: 10-6 188,358 HP → 10-7 233,094 HP explains most of the +53K power change).
// The squad's separate "Władca" power line (1,343,792) is the Overlord's OWN power (its stats + skills) — not
// derived yet, so it is a manual field: profile.overlord.power.
export function computeOverlordHeroBonus(profile: PlayerProfile): { hp: number; atk: number; def: number } {
  const ov = profile.overlord;
  if (!ov) return { hp: 0, atk: 0, def: 0 };
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ot = require("@/knowledge/overlord_train.json") as Record<string, Record<string, number[]>>;
  const rating = ot.rating?.[String(ov.ratingLevel ?? 0)] ?? [0, 0, 0];
  return {
    hp: (ot.hp?.[String(ov.trainHpLevel ?? 0)]?.[0] ?? 0) + rating[0],
    atk: (ot.atk?.[String(ov.trainAtkLevel ?? 0)]?.[1] ?? 0) + rating[1],
    def: (ot.def?.[String(ov.trainDefLevel ?? 0)]?.[2] ?? 0) + rating[2],
  };
}

export function computeSquadExtras(profile: PlayerProfile, squadIdx: number, heroCount = 5): { droneSkillPower: number; chipPower: number; overlordPower: number } {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sk = require("@/knowledge/hero_skills.json") as { skill_a: Array<{ group: number; star: number; level: number; power_at_level: number }> };
  const lvl = profile.drone?.level ?? 0;
  const star = lvl >= 110 ? 5 : lvl >= 90 ? 4 : lvl >= 70 ? 3 : lvl >= 50 ? 2 : lvl >= 30 ? 1 : 0;
  const droneSkillPower = lvl > 0 ? (sk.skill_a.find(r => r.group === 700100 && r.star === star && r.level === 1)?.power_at_level ?? 0) : 0;

  // Chip power = lw_hero_skill power of the chip's skill at its star, at skill level
  // 1 + Chip Skill Boost (+1 per combat-boost stage: levels 150/300/450/600/750).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cp = require("@/knowledge/chip_skill_power.json") as { power: Record<string, Record<string, Record<string, number>>> };
  const cb = profile.drone?.combatBoostLevel ?? 0;
  const boost = [150, 300, 450, 600, 750].filter(t => cb >= t).length;
  const skillLv = String(Math.min(6, 1 + boost));
  const set = profile.drone?.chipSets?.[squadIdx];
  let chipPower = 0;
  if (set) {
    for (const slot of [set.initial, set.attack, set.defense, set.interference]) {
      if (!slot || slot.rarity === "none") continue;
      chipPower += cp.power[slot.rarity]?.[String(Math.max(0, Math.min(10, slot.stars ?? 0)))]?.[skillLv] ?? 0;
    }
  }
  const ob = computeOverlordHeroBonus(profile);
  void ob; void heroCount;
  const overlordPower = profile.overlord?.power ?? 0;
  return { droneSkillPower, chipPower, overlordPower };
}
