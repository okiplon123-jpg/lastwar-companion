// ============================================================
// LASTWAR COMPANION — Hero definitions
// Source: lastwartutorial.com/heroes/
// ============================================================

export type HeroType = "Tank" | "Aircraft" | "Missile";
export type HeroRole = "Attacker" | "Defender" | "Support";
export type HeroRarity = "UR" | "SSR" | "SR";
export type GearType = "Cannon" | "Chip" | "Armor" | "Radar";
export type GearQuality = "none" | "common" | "rare" | "epic" | "legendary" | "mythic";

export interface HeroDef {
  id: string;
  name: string;
  rarity: HeroRarity;
  type: HeroType;
  role: HeroRole;
  title: string;
  recommendedGear: [GearType, GearType]; // primary 2 slots
  portraitUrl: string;
  promotable?: boolean; // SSR→UR promotable via season milestones
}

// Self-hosted images in /public/
export const TYPE_ICON_URLS: Record<HeroType, string> = {
  Tank:     "/icons/type-tank.png",
  Aircraft: "/icons/type-aircraft.png",
  Missile:  "/icons/type-missile.png",
};

export const ROLE_ICON_URLS: Record<HeroRole, string> = {
  Defender: "/icons/role-defender.png",
  Attacker: "/icons/role-attacker.png",
  Support:  "/icons/role-support.png",
};

export const RARITY_ICON_URLS: Record<HeroRarity, string> = {
  UR:  "/icons/rarity-ur.png",
  SSR: "/icons/rarity-ssr.png",
  SR:  "/icons/rarity-ssr.png", // reuse SSR icon for SR (blue tint applied via CSS)
};

export const GEAR_ICON_URLS: Record<GearType, string> = {
  Cannon: "/gear/cannon.png",
  Chip:   "/gear/chip.png",
  Armor:  "/gear/armor.png",
  Radar:  "/gear/radar.png",
};

// Quality-specific cannon icons
export const CANNON_QUALITY_URLS: Partial<Record<GearQuality, string>> = {
  rare:      "/gear/cannon-rare.png",
  epic:      "/gear/cannon-epic.png",
  legendary: "/gear/cannon.png",
};

// Colors by unit type (matches game palette)
export const TYPE_COLORS: Record<HeroType, string> = {
  Tank: "#3B82F6",
  Aircraft: "#10B981",
  Missile: "#EF4444",
};

export const TYPE_ICONS: Record<HeroType, string> = {
  Tank: "🛡",
  Aircraft: "✈",
  Missile: "🚀",
};

export const ROLE_ICONS: Record<HeroRole, string> = {
  Attacker: "⚔",
  Defender: "🛡",
  Support: "❤",
};

export const RARITY_COLORS: Record<HeroRarity, string> = {
  UR:  "#F59E0B",
  SSR: "#8B5CF6",
  SR:  "#3B82F6",
};

export const GEAR_QUALITY_COLORS: Record<GearQuality, string> = {
  none: "#374151",
  common: "#6B7280",
  rare: "#3B82F6",
  epic: "#8B5CF6",
  legendary: "#F59E0B",
  mythic: "#EC4899",
};

export const GEAR_QUALITY_LABELS: Record<GearQuality, string> = {
  none: "—",
  common: "C",
  rare: "R",
  epic: "E",
  legendary: "L",
  mythic: "M",
};

// Counter triangle: Tank > Missile > Aircraft > Tank (each takes 80% dmg from counter)
export const TYPE_COUNTERS: Record<HeroType, HeroType> = {
  Tank: "Missile",   // Tank beats Missile
  Missile: "Aircraft", // Missile beats Aircraft
  Aircraft: "Tank",  // Aircraft beats Tank
};

// Formation bonuses (requires City Clash Capitol conquest to unlock)
export const FORMATION_BONUSES = [
  { count: 3, same: true,  bonus: 5,  note: "3 same type" },
  { count: 4, same: false, bonus: 10, note: "3 same + 2 different" },
  { count: 4, same: true,  bonus: 15, note: "4 same type" },
  { count: 5, same: true,  bonus: 20, note: "5 same type" },
];

// Star shard costs
export const STAR_SHARD_COSTS = [25, 50, 100, 300, 500]; // stars 1–5
export const TOTAL_SHARDS_TO_5_STAR = 975;

export const HEROES: HeroDef[] = [
  // ── UR · TANK ─────────────────────────────────────────────
  { id: "murphy",   name: "Murphy",   rarity: "UR",  type: "Tank", role: "Defender", title: "Unyielding Warrior",  recommendedGear: ["Armor",  "Radar"], portraitUrl: "/heroes/murphy.webp" },
  { id: "kimberly", name: "Kimberly", rarity: "UR",  type: "Tank", role: "Attacker", title: "Rocket Shadow",       recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/kimberly.webp" },
  { id: "marshall", name: "Marshall", rarity: "UR",  type: "Tank", role: "Support",  title: "Blade of Legion",     recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/marshall.webp" },
  { id: "williams", name: "Williams", rarity: "UR",  type: "Tank", role: "Defender", title: "Storm Hunter",        recommendedGear: ["Armor",  "Radar"], portraitUrl: "/heroes/williams.webp" },
  { id: "stetmann", name: "Stetmann", rarity: "UR",  type: "Tank", role: "Attacker", title: "EM Hunter",           recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/stetmann.webp" },
  // ── UR · AIRCRAFT ─────────────────────────────────────────
  { id: "dva",      name: "D.Va",     rarity: "UR",  type: "Aircraft", role: "Attacker", title: "Sky Reaver",      recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/dva.webp" },
  { id: "carlie",   name: "Carlie",   rarity: "UR",  type: "Aircraft", role: "Defender", title: "Scamp",           recommendedGear: ["Armor",  "Radar"], portraitUrl: "/heroes/carlie.webp" },
  { id: "schuyler", name: "Schuyler", rarity: "UR",  type: "Aircraft", role: "Attacker", title: "Magblade",        recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/schuyler.webp" },
  { id: "lucius",   name: "Lucius",   rarity: "UR",  type: "Aircraft", role: "Defender", title: "Sky Knight",      recommendedGear: ["Armor",  "Radar"], portraitUrl: "/heroes/lucius.webp" },
  { id: "morrison", name: "Morrison", rarity: "UR",  type: "Aircraft", role: "Attacker", title: "The Reaper",      recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/morrison.webp" },
  // ── UR · MISSILE ──────────────────────────────────────────
  { id: "swift",    name: "Swift",    rarity: "UR",  type: "Missile", role: "Attacker", title: "Thunder",           recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/swift.webp" },
  { id: "tesla",    name: "Tesla",    rarity: "UR",  type: "Missile", role: "Attacker", title: "Magnetic Expert",   recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/tesla.webp" },
  { id: "mcgregor", name: "McGregor", rarity: "UR",  type: "Missile", role: "Defender", title: "Ironclad General",  recommendedGear: ["Armor",  "Radar"], portraitUrl: "/heroes/mcgregor.webp" },
  { id: "adam",     name: "Adam",     rarity: "UR",  type: "Missile", role: "Defender", title: "Titan",             recommendedGear: ["Armor",  "Radar"], portraitUrl: "/heroes/adam.webp" },
  { id: "fiona",    name: "Fiona",    rarity: "UR",  type: "Missile", role: "Attacker", title: "Lion Cub",          recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/fiona.webp" },
  // ── SSR→UR PROMOTABLE · TANK ──────────────────────────────
  { id: "mason",    name: "Mason",    rarity: "SSR", type: "Tank", role: "Attacker", title: "Raging Marksman",     recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/mason.webp",    promotable: true },
  { id: "violet",   name: "Violet",   rarity: "SSR", type: "Tank", role: "Defender", title: "Poison Mistress",     recommendedGear: ["Armor",  "Radar"], portraitUrl: "/heroes/violet.webp",   promotable: true },
  { id: "scarlett", name: "Scarlett", rarity: "SSR", type: "Tank", role: "Defender", title: "Iron Rose",           recommendedGear: ["Armor",  "Radar"], portraitUrl: "/heroes/scarlett.webp", promotable: true },
  // ── SSR→UR PROMOTABLE · AIRCRAFT ──────────────────────────
  { id: "sarah",    name: "Sarah",    rarity: "SSR", type: "Aircraft", role: "Support",  title: "Guardian Angel",  recommendedGear: ["Armor",  "Radar"], portraitUrl: "/heroes/sarah.webp",    promotable: true },
  // ── SSR→UR PROMOTABLE · MISSILE ───────────────────────────
  { id: "venom",    name: "Venom",    rarity: "SSR", type: "Missile", role: "Attacker", title: "Venomous Strike",  recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/venom.webp",    promotable: true },
  { id: "blaz",     name: "Blaz",     rarity: "SSR", type: "Missile", role: "Attacker", title: "Blaz",             recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/blaz.webp",     promotable: true },
  // ── SSR · TANK ────────────────────────────────────────────
  { id: "monica",   name: "Monica",   rarity: "SSR", type: "Tank", role: "Support",  title: "Monica",              recommendedGear: ["Armor",  "Radar"], portraitUrl: "/heroes/monica.webp" },
  { id: "richard",  name: "Richard",  rarity: "SSR", type: "Tank", role: "Attacker", title: "Richard",             recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/richard.webp" },
  { id: "farhad",   name: "Farhad",   rarity: "SSR", type: "Tank", role: "Attacker", title: "Farhad",              recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/farhad.webp" },
  // ── SSR · AIRCRAFT ────────────────────────────────────────
  { id: "maxwell",  name: "Maxwell",  rarity: "SSR", type: "Aircraft", role: "Attacker", title: "Maxwell",         recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/maxwell.webp" },
  // ── SSR · MISSILE ─────────────────────────────────────────
  { id: "cage",     name: "Cage",     rarity: "SSR", type: "Missile", role: "Defender", title: "Cage",             recommendedGear: ["Armor",  "Radar"], portraitUrl: "/heroes/cage.webp" },
  { id: "elsa",     name: "Elsa",     rarity: "SSR", type: "Missile", role: "Defender", title: "Elsa",             recommendedGear: ["Armor",  "Radar"], portraitUrl: "/heroes/elsa.webp" },
  // ── SR · TANK ─────────────────────────────────────────────
  { id: "loki",     name: "Loki",     rarity: "SR",  type: "Tank", role: "Defender", title: "Loki",                recommendedGear: ["Armor",  "Radar"], portraitUrl: "/heroes/loki.webp" },
  { id: "gump",     name: "Gump",     rarity: "SR",  type: "Tank", role: "Defender", title: "Gump",                recommendedGear: ["Armor",  "Radar"], portraitUrl: "/heroes/gump.webp" },
  // ── SR · AIRCRAFT ─────────────────────────────────────────
  { id: "ambolt",   name: "Ambolt",   rarity: "SR",  type: "Aircraft", role: "Attacker", title: "Ambolt",          recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/ambolt.webp" },
  // ── SR · MISSILE ──────────────────────────────────────────
  { id: "kane",     name: "Kane",     rarity: "SR",  type: "Missile", role: "Attacker", title: "Kane",             recommendedGear: ["Cannon", "Chip"],  portraitUrl: "/heroes/kane.webp" },
];

// All 4 gear slots per hero
export const ALL_GEAR_SLOTS: GearType[] = ["Cannon", "Chip", "Armor", "Radar"];

export const GEAR_SLOT_ICONS: Record<GearType, string> = {
  Cannon: "🔫",
  Chip: "💠",
  Armor: "🛡",
  Radar: "📡",
};

export const GEAR_QUALITIES: GearQuality[] = ["none", "common", "rare", "epic", "legendary", "mythic"];
