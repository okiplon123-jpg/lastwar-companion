// ============================================================
// LASTWAR COMPANION — Research Node Effects
// Maps node IDs to effect descriptions and combat tags.
// Category: "atk" | "def" | "hp" | "load" | "speed" | "economy" | "other"
// Troop:    "all" | "tank" | "aircraft" | "missile" | "hero" | "drone" | null
// pctPerLv: approximate % bonus per level (null = unknown/non-%)
// ============================================================

export type EffectCategory = "atk" | "def" | "hp" | "load" | "speed" | "economy" | "heal" | "other";
export type EffectTroop = "all" | "tank" | "aircraft" | "missile" | "hero" | "drone" | null;

export interface NodeEffect {
  effect: string;          // Human-readable description
  category: EffectCategory;
  troop: EffectTroop;
  pctPerLv: number | null; // % per level (null = flat/unlock/unknown)
}

// ── Helpers ──────────────────────────────────────────────────

function e(effect: string, category: EffectCategory, troop: EffectTroop, pctPerLv: number | null): NodeEffect {
  return { effect, category, troop, pctPerLv };
}

// ── Node effect map ───────────────────────────────────────────

const EFFECTS: Record<string, NodeEffect> = {

  // ═══════════════ DEVELOPMENT ═══════════════
  "fast-builder-1":          e("+2% Construction Speed", "speed", null, 2),
  "fast-builder-2":          e("+2% Construction Speed", "speed", null, 2),
  "fast-builder-3":          e("+2% Construction Speed", "speed", null, 2),
  "fast-builder-4":          e("+2% Construction Speed", "speed", null, 2),
  "fast-builder-5":          e("+2% Construction Speed", "speed", null, 2),
  "infirmary-expansion-1":   e("+2% Hospital Capacity", "heal", null, 2),
  "infirmary-expansion-2":   e("+2% Hospital Capacity", "heal", null, 2),
  "infirmary-expansion-3":   e("+2% Hospital Capacity", "heal", null, 2),
  "infirmary-expansion-4":   e("+2% Hospital Capacity", "heal", null, 2),
  "barrack-expansion-1":     e("+2% Training Batch Size", "other", null, 2),
  "barrack-expansion-2":     e("+2% Training Batch Size", "other", null, 2),
  "barrack-expansion-3":     e("+2% Training Batch Size", "other", null, 2),
  "barrack-expansion-4":     e("+2% Training Batch Size", "other", null, 2),
  "research-enhancement-1":  e("+2% Research Speed", "speed", null, 2),
  "research-enhancement-2":  e("+2% Research Speed", "speed", null, 2),
  "research-enhancement-3":  e("+2% Research Speed", "speed", null, 2),
  "research-enhancement-4":  e("+2% Research Speed", "speed", null, 2),
  "rapid-field-dressing-1":  e("+2% Healing Speed", "heal", null, 2),
  "rapid-field-dressing-2":  e("+2% Healing Speed", "heal", null, 2),
  "rapid-field-dressing-3":  e("+2% Healing Speed", "heal", null, 2),
  "rapid-field-dressing-4":  e("+2% Healing Speed", "heal", null, 2),
  "focused-training-1":      e("+2% Training Speed", "speed", null, 2),
  "focused-training-2":      e("+2% Training Speed", "speed", null, 2),
  "focused-training-3":      e("+2% Training Speed", "speed", null, 2),
  "focused-training-4":      e("+2% Training Speed", "speed", null, 2),
  "master-craftsman":        e("+2% Gear Crafting Speed", "speed", null, 2),
  "extra-barracks":          e("Unlock Extra Barracks", "other", null, null),
  "efficient-healing":       e("+2% Healing Cost Reduction", "heal", null, 2),
  "drill-ground-expansion":  e("+2% Training Batch Size", "other", null, 2),
  "survival-skills":         e("+2% Troop HP", "hp", "all", 2),

  // ═══════════════ ECONOMY ═══════════════
  "food-output-1":     e("+5% Food Production", "economy", null, 5),
  "food-output-2":     e("+5% Food Production", "economy", null, 5),
  "food-output-3":     e("+5% Food Production", "economy", null, 5),
  "food-output-4":     e("+5% Food Production", "economy", null, 5),
  "iron-output-1":     e("+5% Iron Production", "economy", null, 5),
  "iron-output-2":     e("+5% Iron Production", "economy", null, 5),
  "iron-output-3":     e("+5% Iron Production", "economy", null, 5),
  "iron-output-4":     e("+5% Iron Production", "economy", null, 5),
  "coin-output-1":     e("+5% Gold Production", "economy", null, 5),
  "coin-output-2":     e("+5% Gold Production", "economy", null, 5),
  "coin-output-3":     e("+5% Gold Production", "economy", null, 5),
  "coin-output-4":     e("+5% Gold Production", "economy", null, 5),
  "gathering-food-1":  e("+5% Gathering Speed (Food)", "economy", null, 5),
  "gathering-food-2":  e("+5% Gathering Speed (Food)", "economy", null, 5),
  "gathering-food-3":  e("+5% Gathering Speed (Food)", "economy", null, 5),
  "gathering-food-4":  e("+5% Gathering Speed (Food)", "economy", null, 5),
  "gathering-iron-1":  e("+5% Gathering Speed (Iron)", "economy", null, 5),
  "gathering-iron-2":  e("+5% Gathering Speed (Iron)", "economy", null, 5),
  "gathering-iron-3":  e("+5% Gathering Speed (Iron)", "economy", null, 5),
  "gathering-iron-4":  e("+5% Gathering Speed (Iron)", "economy", null, 5),
  "gathering-coins-1": e("+5% Gathering Speed (Gold)", "economy", null, 5),
  "gathering-coins-2": e("+5% Gathering Speed (Gold)", "economy", null, 5),
  "gathering-coins-3": e("+5% Gathering Speed (Gold)", "economy", null, 5),
  "gathering-coins-4": e("+5% Gathering Speed (Gold)", "economy", null, 5),
  "more-farmlands":    e("Unlock Extra Farm Plot", "economy", null, null),
  "more-iron-mines":   e("Unlock Extra Iron Mine", "economy", null, null),
  "more-gold-mines":   e("Unlock Extra Gold Mine", "economy", null, null),
  "food-protection":   e("+5% Food Protection", "economy", null, 5),
  "iron-protection":   e("+5% Iron Protection", "economy", null, 5),
  "coin-protection":   e("+5% Gold Protection", "economy", null, 5),

  // ═══════════════ HERO ═══════════════
  "tank-mastery-1":        e("+2% Tank Hero ATK", "atk", "tank", 2),
  "tank-mastery-2":        e("+2% Tank Hero ATK", "atk", "tank", 2),
  "cannon-enhancement-1":  e("+1% Hero ATK I", "atk", "hero", 1),
  "cannon-enhancement-2":  e("+2% Hero ATK II", "atk", "hero", 2),
  "armor-hardening-1":     e("+1% Hero DEF I", "def", "hero", 1),
  "armor-hardening-2":     e("+2% Hero DEF II", "def", "hero", 2),
  "track-fortification-1": e("+1% Hero HP I", "hp", "hero", 1),
  "track-fortification-2": e("+2% Hero HP II", "hp", "hero", 2),
  "aircraft-mastery-1":    e("+2% Aircraft Hero ATK", "atk", "aircraft", 2),
  "aircraft-mastery-2":    e("+2% Aircraft Hero ATK", "atk", "aircraft", 2),
  "airborne-weapon-1":     e("+2% Aircraft ATK", "atk", "aircraft", 2),
  "airborne-weapon-2":     e("+2% Aircraft ATK", "atk", "aircraft", 2),
  "reinforced-body-1":     e("+2% Aircraft HP", "hp", "aircraft", 2),
  "reinforced-body-2":     e("+2% Aircraft HP", "hp", "aircraft", 2),
  "wingman-tactics-1":     e("+2% Aircraft DEF", "def", "aircraft", 2),
  "wingman-tactics-2":     e("+2% Aircraft DEF", "def", "aircraft", 2),
  "missile-mastery-1":     e("+2% Missile Hero ATK", "atk", "missile", 2),
  "missile-mastery-2":     e("+2% Missile Hero ATK", "atk", "missile", 2),
  "precision-targeting-1": e("+2% Missile ATK", "atk", "missile", 2),
  "precision-targeting-2": e("+2% Missile ATK", "atk", "missile", 2),
  "metal-barricade-1":     e("+2% Missile DEF", "def", "missile", 2),
  "metal-barricade-2":     e("+2% Missile DEF", "def", "missile", 2),
  "missile-expansion-1":   e("+2% Missile HP", "hp", "missile", 2),
  "missile-expansion-2":   e("+2% Missile HP", "hp", "missile", 2),
  "firepower-boost":       e("+2% All Troop ATK", "atk", "all", 2),
  "weapons-upgrade":       e("+2% Gear ATK Bonus", "atk", "hero", 2),
  "armor-enhancement":     e("+2% Gear DEF Bonus", "def", "hero", 2),
  "endurance-upgrade":     e("+2% All Troop HP", "hp", "all", 2),

  // ═══════════════ UNITS ═══════════════
  "weapon-training-1":  e("+2% Troop ATK", "atk", "all", 2),
  "weapon-training-2":  e("+2% Troop ATK", "atk", "all", 2),
  "weapon-training-3":  e("+2% Troop ATK", "atk", "all", 2),
  "weapon-training-4":  e("+2% Troop ATK", "atk", "all", 2),
  "weapon-training-5":  e("+2% Troop ATK", "atk", "all", 2),
  "defense-training-1": e("+2% Troop DEF", "def", "all", 2),
  "defense-training-2": e("+2% Troop DEF", "def", "all", 2),
  "defense-training-3": e("+2% Troop DEF", "def", "all", 2),
  "defense-training-4": e("+2% Troop DEF", "def", "all", 2),
  "defense-training-5": e("+2% Troop DEF", "def", "all", 2),
  "advanced-armor-1":   e("+2% Troop HP", "hp", "all", 2),
  "advanced-armor-2":   e("+2% Troop HP", "hp", "all", 2),
  "advanced-armor-3":   e("+2% Troop HP", "hp", "all", 2),
  "advanced-armor-4":   e("+2% Troop HP", "hp", "all", 2),
  "advanced-armor-5":   e("+2% Troop HP", "hp", "all", 2),
  "load-training-1":    e("+2% Troop Load Capacity", "load", "all", 2),
  "load-training-2":    e("+2% Troop Load Capacity", "load", "all", 2),
  "load-training-3":    e("+2% Troop Load Capacity", "load", "all", 2),
  "load-training-4":    e("+2% Troop Load Capacity", "load", "all", 2),
  "load-training-5":    e("+2% Troop Load Capacity", "load", "all", 2),

  // ═══════════════ SQUAD 1–4 (same effects, different tier) ═══════════════
  // Tier I (squad-1): base
  "terminator-1":           e("+2% Damage to Zombies", "other", null, 2),
  "virus-resistance-1":     e("+2% Virus Resistance", "other", null, 2),
  "assault-training-1":     e("+2% Squad ATK", "atk", "all", 2),
  "formation-training-1":   e("+2% Squad Formation ATK", "atk", "all", 2),
  "survival-training-1":    e("+2% Squad HP", "hp", "all", 2),
  "resource-reaper-1":      e("+2% Gathering Capacity", "economy", null, 2),
  "power-boost-1":          e("+2% Squad ATK & DEF", "atk", "all", 2),
  "zombie-radar-1":         e("+2% Zombie Scout Speed", "other", null, 2),
  "assault-tactics-1":      e("+2% Squad ATK", "atk", "all", 2),
  "fast-exploration-1":     e("+2% March Speed", "speed", null, 2),
  "rapid-march-1":          e("+2% March Speed", "speed", null, 2),
  "fierce-assault-1":       e("+2% Squad ATK", "atk", "all", 2),
  "counter-defense-1":      e("+2% DEF when Defending", "def", "all", 2),
  "vigilant-formation-1":   e("+2% DEF Formation Bonus", "def", "all", 2),
  "solid-defense-1":        e("+2% Squad DEF", "def", "all", 2),
  "final-stand-1":          e("+2% HP when Below 50%", "hp", "all", 2),
  "hold-the-line-1":        e("+2% DEF when Defending", "def", "all", 2),
  "physical-suppression-1": e("+2% Physical Damage", "atk", "all", 2),
  "energy-barrage-1":       e("+2% Energy Damage", "atk", "all", 2),
  "fatal-strike-1":         e("+2% Critical Damage", "atk", "all", 2),
  // Tier II
  "terminator-2":           e("+3% Damage to Zombies", "other", null, 3),
  "virus-resistance-2":     e("+3% Virus Resistance", "other", null, 3),
  "assault-training-2":     e("+3% Squad ATK", "atk", "all", 3),
  "formation-training-2":   e("+3% Squad Formation ATK", "atk", "all", 3),
  "survival-training-2":    e("+3% Squad HP", "hp", "all", 3),
  "resource-reaper-2":      e("+3% Gathering Capacity", "economy", null, 3),
  "power-boost-2":          e("+3% Squad ATK & DEF", "atk", "all", 3),
  "zombie-radar-2":         e("+3% Zombie Scout Speed", "other", null, 3),
  "assault-tactics-2":      e("+3% Squad ATK", "atk", "all", 3),
  "fast-exploration-2":     e("+3% March Speed", "speed", null, 3),
  "rapid-march-2":          e("+3% March Speed", "speed", null, 3),
  "fierce-assault-2":       e("+3% Squad ATK", "atk", "all", 3),
  "counter-defense-2":      e("+3% DEF when Defending", "def", "all", 3),
  "vigilant-formation-2":   e("+3% DEF Formation Bonus", "def", "all", 3),
  "solid-defense-2":        e("+3% Squad DEF", "def", "all", 3),
  "final-stand-2":          e("+3% HP when Below 50%", "hp", "all", 3),
  "hold-the-line-2":        e("+3% DEF when Defending", "def", "all", 3),
  "physical-suppression-2": e("+3% Physical Damage", "atk", "all", 3),
  "energy-barrage-2":       e("+3% Energy Damage", "atk", "all", 3),
  "fatal-strike-2":         e("+3% Critical Damage", "atk", "all", 3),
  // Tier III
  "terminator-3":           e("+4% Damage to Zombies", "other", null, 4),
  "virus-resistance-3":     e("+4% Virus Resistance", "other", null, 4),
  "assault-training-3":     e("+4% Squad ATK", "atk", "all", 4),
  "formation-training-3":   e("+4% Squad Formation ATK", "atk", "all", 4),
  "survival-training-3":    e("+4% Squad HP", "hp", "all", 4),
  "resource-reaper-3":      e("+4% Gathering Capacity", "economy", null, 4),
  "power-boost-3":          e("+4% Squad ATK & DEF", "atk", "all", 4),
  "zombie-radar-3":         e("+4% Zombie Scout Speed", "other", null, 4),
  "assault-tactics-3":      e("+4% Squad ATK", "atk", "all", 4),
  "fast-exploration-3":     e("+4% March Speed", "speed", null, 4),
  "rapid-march-3":          e("+4% March Speed", "speed", null, 4),
  "fierce-assault-3":       e("+4% Squad ATK", "atk", "all", 4),
  "counter-defense-3":      e("+4% DEF when Defending", "def", "all", 4),
  "vigilant-formation-3":   e("+4% DEF Formation Bonus", "def", "all", 4),
  "solid-defense-3":        e("+4% Squad DEF", "def", "all", 4),
  "final-stand-3":          e("+4% HP when Below 50%", "hp", "all", 4),
  "hold-the-line-3":        e("+4% DEF when Defending", "def", "all", 4),
  "physical-suppression-3": e("+4% Physical Damage", "atk", "all", 4),
  "energy-barrage-3":       e("+4% Energy Damage", "atk", "all", 4),
  "fatal-strike-3":         e("+4% Critical Damage", "atk", "all", 4),
  // Tier IV
  "terminator-4":           e("+5% Damage to Zombies", "other", null, 5),
  "virus-resistance-4":     e("+5% Virus Resistance", "other", null, 5),
  "assault-training-4":     e("+5% Squad ATK", "atk", "all", 5),
  "formation-training-4":   e("+5% Squad Formation ATK", "atk", "all", 5),
  "survival-training-4":    e("+5% Squad HP", "hp", "all", 5),
  "resource-reaper-4":      e("+5% Gathering Capacity", "economy", null, 5),
  "power-boost-4":          e("+5% Squad ATK & DEF", "atk", "all", 5),
  "zombie-radar-4":         e("+5% Zombie Scout Speed", "other", null, 5),
  "assault-tactics-4":      e("+5% Squad ATK", "atk", "all", 5),
  "fast-exploration-4":     e("+5% March Speed", "speed", null, 5),
  "rapid-march-4":          e("+5% March Speed", "speed", null, 5),
  "fierce-assault-4":       e("+5% Squad ATK", "atk", "all", 5),
  "counter-defense-4":      e("+5% DEF when Defending", "def", "all", 5),
  "vigilant-formation-4":   e("+5% DEF Formation Bonus", "def", "all", 5),
  "solid-defense-4":        e("+5% Squad DEF", "def", "all", 5),
  "final-stand-4":          e("+5% HP when Below 50%", "hp", "all", 5),
  "hold-the-line-4":        e("+5% DEF when Defending", "def", "all", 5),
  "physical-suppression-4": e("+5% Physical Damage", "atk", "all", 5),
  "energy-barrage-4":       e("+5% Energy Damage", "atk", "all", 5),
  "fatal-strike-4":         e("+5% Critical Damage", "atk", "all", 5),

  // ═══════════════ ALLIANCE DUEL ═══════════════
  "incentive-radar":                e("+X% Duel Points (Radar)", "other", null, null),
  "incentive-speed-up":             e("+X% Duel Points (Speed-ups)", "other", null, null),
  "incentive-recruitment":          e("+X% Duel Points (Recruitment)", "other", null, null),
  "advanced-rewards":               e("Unlock Advanced Duel Rewards", "other", null, null),
  "duel-expert":                    e("+X% Alliance Duel Score", "other", null, null),
  "incentive-building":             e("+X% Duel Points (Building)", "other", null, null),
  "incentive-research":             e("+X% Duel Points (Research)", "other", null, null),
  "incentive-training":             e("+X% Duel Points (Training)", "other", null, null),
  "incentive-enemy-kills":          e("+X% Duel Points (Kills)", "other", null, null),
  "super-bonus":                    e("Unlock Super Bonus Multiplier", "other", null, null),
  "incentive-intercity-trade":      e("+X% Duel Points (Intercity)", "other", null, null),
  "incentive-secret-mobile-squad":  e("+X% Duel Points (Mobile Squad)", "other", null, null),
  "incentive-survivor-recruit":     e("+X% Duel Points (Survivors)", "other", null, null),
  "duel-master-2":                  e("+X% Duel Score Tier II", "other", null, null),
  "infinite-roulette":              e("Unlock Infinite Roulette", "other", null, null),

  // ═══════════════ INTERCITY TRUCK ═══════════════
  "basic-goods":        e("+5% Intercity Trade Goods", "economy", null, 5),
  "attack-boost":       e("+2% Intercity March ATK", "atk", "all", 2),
  "defense-boost":      e("+2% Intercity March DEF", "def", "all", 2),
  "rapid-transit":      e("+5% Intercity March Speed", "speed", null, 5),
  "plunder":            e("+5% Plunder Capacity", "economy", null, 5),
  "lucky":              e("+5% Extra Loot Chance", "economy", null, 5),
  "extra-truck":        e("Unlock Extra Intercity Truck", "other", null, null),
  "ultimate-guard":     e("Unlock Ultimate Guard", "def", null, null),
  "reindeer-sleigh-ride": e("Unlock Reindeer Sleigh Ride", "other", null, null),

  // ═══════════════ SPECIAL FORCES ═══════════════
  "hp-boost-1":            e("+2% All Troop HP", "hp", "all", 2),
  "hp-boost-2":            e("+3% All Troop HP", "hp", "all", 3),
  "hp-boost-3":            e("+4% All Troop HP", "hp", "all", 4),
  "attack-boost-1":        e("+2% All Troop ATK", "atk", "all", 2),
  "attack-boost-2":        e("+3% All Troop ATK", "atk", "all", 3),
  "attack-boost-3":        e("+4% All Troop ATK", "atk", "all", 4),
  "defense-boost-1":       e("+2% All Troop DEF", "def", "all", 2),
  "defense-boost-2":       e("+3% All Troop DEF", "def", "all", 3),
  "defense-boost-3":       e("+4% All Troop DEF", "def", "all", 4),
  "advanced-protection-1": e("+2% HP & DEF", "def", "all", 2),
  "advanced-protection":   e("+2% HP & DEF", "def", "all", 2),
  "defense-training-7":    e("+3% Troop DEF", "def", "all", 3),
  "defense-training-8":    e("+3% Troop DEF", "def", "all", 3),
  "weapon-training-7":     e("+3% Troop ATK", "atk", "all", 3),
  "weapon-training-8":     e("+3% Troop ATK", "atk", "all", 3),
  "advanced-armor-7":      e("+3% Troop HP", "hp", "all", 3),
  "advanced-armor-8":      e("+3% Troop HP", "hp", "all", 3),
  "morale":                e("+3% ATK & HP (Morale)", "atk", "all", 3),
  "barracks-expansion-1":  e("+5% Training Batch Size", "other", null, 5),
  "unit-x":                e("Unlock Elite Unit X", "other", null, null),

  // ═══════════════ SIEGE TO SEIZE ═══════════════
  "extra-drill-ground":    e("Unlock Extra Drill Ground", "other", null, null),
  "resource-protection":   e("+5% Resource Protection", "economy", null, 5),

  // ═══════════════ DEFENSE FORTIFICATIONS ═══════════════
  "extra-hospitals":        e("Unlock Extra Hospital", "heal", null, null),
  "defense-fortifications": e("+2% Fortification DEF", "def", null, 2),

  // ═══════════════ TANK MASTERY ═══════════════
  "tank-synergy-hp-1":          e("+1% Tank HP (Synergy I)", "hp", "tank", 1),
  "tank-synergy-hp-2":          e("+1% Tank HP (Synergy II)", "hp", "tank", 1),
  "tank-synergy-attack-1":      e("+1% Tank ATK (Synergy I)", "atk", "tank", 1),
  "tank-synergy-attack-2":      e("+1% Tank ATK (Synergy II)", "atk", "tank", 1),
  "tank-synergy-defense-1":     e("+1% Tank DEF (Synergy I)", "def", "tank", 1),
  "tank-synergy-defense-2":     e("+1% Tank DEF (Synergy II)", "def", "tank", 1),
  "tank-synergy-damage-1":      e("+2% Tank Damage (Synergy I)", "atk", "tank", 2),
  "tank-synergy-damage-2":      e("+2% Tank Damage (Synergy II)", "atk", "tank", 2),
  "tank-march-size-1":          e("+2% Tank March Size I", "other", null, 2),
  "tank-march-size-2":          e("+2% Tank March Size II", "other", null, 2),
  "tank-hp-1":                  e("+1% Tank HP I", "hp", "tank", 1),
  "tank-hp-2":                  e("+1% Tank HP II", "hp", "tank", 1),
  "tank-attack-1":              e("+1% Tank ATK I", "atk", "tank", 1),
  "tank-attack-2":              e("+1% Tank ATK II", "atk", "tank", 1),
  "tank-defense-1":             e("+1% Tank DEF I", "def", "tank", 1),
  "tank-defense-2":             e("+1% Tank DEF II", "def", "tank", 1),
  "tank-damage-1":              e("+2% Tank Damage I", "atk", "tank", 2),
  "tank-damage-2":              e("+2% Tank Damage II", "atk", "tank", 2),
  "tank-ultimate-defense-1":    e("+1% Tank Ultimate DEF I", "def", "tank", 1),
  "tank-ultimate-defense-2":    e("+1% Tank Ultimate DEF II", "def", "tank", 1),

  // ═══════════════ MISSILE MASTERY ═══════════════
  "missile-vehicle-synergy-hp-1":       e("+1% Missile HP (Synergy I)", "hp", "missile", 1),
  "missile-vehicle-synergy-hp-2":       e("+1% Missile HP (Synergy II)", "hp", "missile", 1),
  "missile-vehicle-synergy-attack-1":   e("+1% Missile ATK (Synergy I)", "atk", "missile", 1),
  "missile-vehicle-synergy-attack-2":   e("+1% Missile ATK (Synergy II)", "atk", "missile", 1),
  "missile-vehicle-synergy-defense-1":  e("+1% Missile DEF (Synergy I)", "def", "missile", 1),
  "missile-vehicle-synergy-defense-2":  e("+1% Missile DEF (Synergy II)", "def", "missile", 1),
  "missile-vehicle-synergy-damage-1":   e("+2% Missile Damage (Synergy I)", "atk", "missile", 2),
  "missile-vehicle-synergy-damage-2":   e("+2% Missile Damage (Synergy II)", "atk", "missile", 2),
  "missile-vehicle-march-size-1":       e("+2% Missile March Size I", "other", null, 2),
  "missile-vehicle-march-size-2":       e("+2% Missile March Size II", "other", null, 2),
  "missile-vehicle-hp-1":               e("+1% Missile HP I", "hp", "missile", 1),
  "missile-vehicle-hp-2":               e("+1% Missile HP II", "hp", "missile", 1),
  "missile-vehicle-attack-1":           e("+1% Missile ATK I", "atk", "missile", 1),
  "missile-vehicle-attack-2":           e("+1% Missile ATK II", "atk", "missile", 1),
  "missile-vehicle-defense-1":          e("+1% Missile DEF I", "def", "missile", 1),
  "missile-vehicle-defense-2":          e("+1% Missile DEF II", "def", "missile", 1),
  "missile-vehicle-damage-1":           e("+2% Missile Damage I", "atk", "missile", 2),
  "missile-vehicle-damage-2":           e("+2% Missile Damage II", "atk", "missile", 2),
  "missile-vehicle-ultimate-defense-1": e("+1% Missile Ultimate DEF I", "def", "missile", 1),
  "missile-vehicle-ultimate-defense-2": e("+1% Missile Ultimate DEF II", "def", "missile", 1),

  // ═══════════════ AIRCRAFT MASTERY ═══════════════
  "aircraft-synergy-hp-1":       e("+1% Aircraft HP (Synergy I)", "hp", "aircraft", 1),
  "aircraft-synergy-hp-2":       e("+1% Aircraft HP (Synergy II)", "hp", "aircraft", 1),
  "aircraft-synergy-attack-1":   e("+1% Aircraft ATK (Synergy I)", "atk", "aircraft", 1),
  "aircraft-synergy-attack-2":   e("+1% Aircraft ATK (Synergy II)", "atk", "aircraft", 1),
  "aircraft-synergy-defense-1":  e("+1% Aircraft DEF (Synergy I)", "def", "aircraft", 1),
  "aircraft-synergy-defense-2":  e("+1% Aircraft DEF (Synergy II)", "def", "aircraft", 1),
  "aircraft-synergy-damage-1":   e("+2% Aircraft Damage (Synergy I)", "atk", "aircraft", 2),
  "aircraft-synergy-damage-2":   e("+2% Aircraft Damage (Synergy II)", "atk", "aircraft", 2),
  "aircraft-march-size-1":       e("+2% Aircraft March Size I", "other", null, 2),
  "aircraft-march-size-2":       e("+2% Aircraft March Size II", "other", null, 2),
  "aircraft-hp-1":               e("+1% Aircraft HP I", "hp", "aircraft", 1),
  "aircraft-hp-2":               e("+1% Aircraft HP II", "hp", "aircraft", 1),
  "aircraft-attack-1":           e("+1% Aircraft ATK I", "atk", "aircraft", 1),
  "aircraft-attack-2":           e("+1% Aircraft ATK II", "atk", "aircraft", 1),
  "aircraft-defense-1":          e("+1% Aircraft DEF I", "def", "aircraft", 1),
  "aircraft-defense-2":          e("+1% Aircraft DEF II", "def", "aircraft", 1),
  "aircraft-damage-1":           e("+2% Aircraft Damage I", "atk", "aircraft", 2),
  "aircraft-damage-2":           e("+2% Aircraft Damage II", "atk", "aircraft", 2),
  "aircraft-ultimate-defense-1": e("+1% Aircraft Ultimate DEF I", "def", "aircraft", 1),
  "aircraft-ultimate-defense-2": e("+1% Aircraft Ultimate DEF II", "def", "aircraft", 1),

  // ═══════════════ THE AGE OF OIL ═══════════════
  "unlock-oil-well":       e("Unlock Oil Well", "economy", null, null),
  "food-output-5":         e("+5% Food Production V", "economy", null, 5),
  "iron-output-5":         e("+5% Iron Production V", "economy", null, 5),
  "coin-output-5":         e("+5% Gold Production V", "economy", null, 5),
  "oil-output-1":          e("+5% Oil Production I", "economy", null, 5),
  "oil-output-2":          e("+5% Oil Production II", "economy", null, 5),
  "oil-output-3":          e("+5% Oil Production III", "economy", null, 5),
  "research-enhancement-5": e("+2% Research Speed V", "speed", null, 2),
  "focused-training-5":    e("+2% Training Speed V", "speed", null, 2),
  "rapid-field-dressing-5": e("+2% Healing Speed V", "heal", null, 2),
  "infirmary-expansion-5": e("+2% Hospital Capacity V", "heal", null, 2),
  "emergency-capacity-1":  e("+3% Hospital Capacity", "heal", null, 3),
  "more-oil-wells":        e("Unlock More Oil Wells", "economy", null, null),
  "training-cost-1":       e("-2% Training Cost", "other", null, 2),
  "healing-cost-2":        e("-2% Healing Cost", "heal", null, 2),
  "parts-workshop":        e("Unlock Parts Workshop", "other", null, null),
  "base-expansion":        e("Unlock Base Expansion", "other", null, null),
  "3rd-tech-center":       e("Unlock 3rd Tech Center", "other", null, null),

  // ═══════════════ TACTICAL WEAPON ═══════════════
  "support-hero-hp-1":           e("+2% Hero HP I", "hp", "hero", 2),
  "support-hero-hp-2":           e("+2% Hero HP II", "hp", "hero", 2),
  "support-hero-hp-3":           e("+3% Hero HP III", "hp", "hero", 3),
  "support-hero-hp-4":           e("+3% Hero HP IV", "hp", "hero", 3),
  "support-hero-attack-1":       e("+2% Hero ATK I", "atk", "hero", 2),
  "support-hero-attack-2":       e("+2% Hero ATK II", "atk", "hero", 2),
  "support-hero-attack-3":       e("+3% Hero ATK III", "atk", "hero", 3),
  "support-hero-attack-4":       e("+3% Hero ATK IV", "atk", "hero", 3),
  "support-hero-defense-1":      e("+2% Hero DEF I", "def", "hero", 2),
  "support-hero-defense-2":      e("+2% Hero DEF II", "def", "hero", 2),
  "support-hero-defense-3":      e("+3% Hero DEF III", "def", "hero", 3),
  "support-hero-defense-4":      e("+3% Hero DEF IV", "def", "hero", 3),
  "enhancement-drone-hp-1":      e("+2% Drone HP I", "hp", "drone", 2),
  "enhancement-drone-hp-2":      e("+2% Drone HP II", "hp", "drone", 2),
  "enhancement-drone-hp-3":      e("+3% Drone HP III", "hp", "drone", 3),
  "enhancement-drone-attack-1":  e("+2% Drone ATK I", "atk", "drone", 2),
  "enhancement-drone-attack-2":  e("+2% Drone ATK II", "atk", "drone", 2),
  "enhancement-drone-attack-3":  e("+3% Drone ATK III", "atk", "drone", 3),
  "enhancement-drone-defense-1": e("+2% Drone DEF I", "def", "drone", 2),
  "enhancement-drone-defense-2": e("+2% Drone DEF II", "def", "drone", 2),
  "enhancement-drone-defense-3": e("+3% Drone DEF III", "def", "drone", 3),
  "assistance-hp-conversion-1":  e("+2% HP Conversion (assists)", "hp", "all", 2),
  "assistance-hp-conversion-2":  e("+2% HP Conversion II", "hp", "all", 2),
  "assistance-hp-conversion-3":  e("+2% HP Conversion III", "hp", "all", 2),
  "assistance-attack-conversion-1":  e("+2% ATK Conversion (assists)", "atk", "all", 2),
  "assistance-attack-conversion-2":  e("+2% ATK Conversion II", "atk", "all", 2),
  "assistance-attack-conversion-3":  e("+2% ATK Conversion III", "atk", "all", 2),
  "assistance-defense-conversion-1": e("+2% DEF Conversion (assists)", "def", "all", 2),
  "assistance-defense-conversion-2": e("+2% DEF Conversion II", "def", "all", 2),
  "assistance-defense-conversion-3": e("+2% DEF Conversion III", "def", "all", 2),
  "limit-break-skill-star-1":    e("Unlock Limit Break: Skill Star I", "other", null, null),
  "limit-break-skill-star-2":    e("Unlock Limit Break: Skill Star II", "other", null, null),
  "limit-break-level-cap":       e("+1 Hero Level Cap per level", "other", "hero", null),
  "limit-break-chip-skill-boost": e("Unlock Chip Skill Boost", "other", null, null),
};

// ── Public API ────────────────────────────────────────────────

/** Get effect data for a node. Returns a generic fallback if unknown. */
export function getNodeEffect(nodeId: string): NodeEffect {
  return EFFECTS[nodeId] ?? e("Unknown effect", "other", null, null);
}

/** Get total % bonus for a category+troop from a set of research levels.
 *  researchLevels: Record<"treeId/nodeId", currentLevel>
 *  Returns sum of pctPerLv × currentLevel for all matching nodes.
 */
export function sumResearchBonus(
  researchLevels: Record<string, number>,
  category: EffectCategory,
  troop: EffectTroop | "all",
): number {
  let total = 0;
  for (const [key, level] of Object.entries(researchLevels)) {
    if (level <= 0) continue;
    const nodeId = key.includes("/") ? key.split("/")[1] : key;
    const eff = EFFECTS[nodeId];
    if (!eff || eff.pctPerLv === null) continue;
    if (eff.category !== category) continue;
    if (troop !== "all" && eff.troop !== null && eff.troop !== troop && eff.troop !== "all") continue;
    total += eff.pctPerLv * level;
  }
  return total;
}

/** Category colors for UI */
export const CATEGORY_COLOR: Record<EffectCategory, string> = {
  atk:      "#F87171",
  def:      "#60A5FA",
  hp:       "#34D399",
  load:     "#F59E0B",
  speed:    "#A78BFA",
  economy:  "#6EE7B7",
  heal:     "#F9A8D4",
  other:    "#6B7280",
};

export const CATEGORY_LABEL: Record<EffectCategory, string> = {
  atk:      "ATK",
  def:      "DEF",
  hp:       "HP",
  load:     "Load",
  speed:    "Speed",
  economy:  "Economy",
  heal:     "Heal",
  other:    "Other",
};
