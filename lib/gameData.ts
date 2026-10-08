// ============================================================
// LASTWAR COMPANION — Core Game Data
// Last War: Survival game constants and mechanics
// ============================================================

// ----- ARMS RACE -----

export interface ArmsRacePhase {
  id: number;
  name: string;
  duration: number; // hours
  color: string;
  description: string;
  topActions: string[];
  pointsPerMinute: number; // construction/research speedups
  bonusMultiplier?: number;
}

// Arms Race runs Mon 07:00 UTC → Sun 07:00 UTC (7 days)
// 6 phases of 4h each, then open/rest, repeating
// Schedule: each phase starts at hour within the week
// Weekly cycle (UTC):
// Phase 1: Mon 07:00 – Tue 07:00  (combat day)
// Phase 2: Tue 07:00 – Wed 07:00
// Phase 3: Wed 07:00 – Thu 07:00
// Phase 4: Thu 07:00 – Fri 07:00
// Phase 5: Fri 07:00 – Sat 07:00
// Phase 6: Sat 07:00 – Sun 07:00
// Rest:     Sun 07:00 – Mon 07:00

export const ARMS_RACE_PHASES: ArmsRacePhase[] = [
  {
    id: 1,
    name: "Tech Development",
    duration: 24,
    color: "#3B82F6", // blue
    description: "Research & Construction focused phase. Use all construction/research speedups here for maximum points.",
    topActions: [
      "Construction speedups (10 pts/min)",
      "Research speedups (10 pts/min)",
      "Upgrade buildings",
      "Complete research",
    ],
    pointsPerMinute: 10,
  },
  {
    id: 2,
    name: "Force Development",
    duration: 24,
    color: "#8B5CF6", // purple
    description: "Training & Hero focused. Train troops and upgrade heroes for big point gains.",
    topActions: [
      "Training speedups (10 pts/min)",
      "Hero EXP items",
      "Hero advancement",
      "Troop training",
    ],
    pointsPerMinute: 10,
  },
  {
    id: 3,
    name: "Warfare",
    duration: 24,
    color: "#EF4444", // red
    description: "Combat phase. Attack zombies, gather resources, and PvP for points.",
    topActions: [
      "Kill zombies (pts per kill)",
      "Attack enemy buildings",
      "Gather resources on map",
      "Use battle speedups",
    ],
    pointsPerMinute: 0,
  },
  {
    id: 4,
    name: "Development",
    duration: 24,
    color: "#10B981", // green
    description: "All-around development. Balanced construction, research, and training.",
    topActions: [
      "Construction speedups (10 pts/min)",
      "Research speedups (10 pts/min)",
      "Training speedups (10 pts/min)",
      "Use resource items",
    ],
    pointsPerMinute: 10,
  },
  {
    id: 5,
    name: "Combat",
    duration: 24,
    color: "#F59E0B", // amber/gold
    description: "Heavy combat. Alliance battles, rallies, and zombie hunting.",
    topActions: [
      "Alliance rallies",
      "Kill high-level zombies",
      "Use combat boosts",
      "Coordinate with alliance",
    ],
    pointsPerMinute: 0,
  },
  {
    id: 6,
    name: "Decisive Battle",
    duration: 24,
    color: "#EC4899", // pink
    description: "Final phase. Everything counts double. Burn remaining speedups NOW.",
    topActions: [
      "ALL speedups (max pts/min)",
      "Emergency construction",
      "Last-minute training",
      "Alliance boss attacks",
    ],
    pointsPerMinute: 10,
    bonusMultiplier: 2,
  },
];

// Arms Race starts Monday 07:00 UTC
export const ARMS_RACE_START_DAY = 1; // Monday (0=Sun, 1=Mon)
export const ARMS_RACE_START_HOUR = 7; // 07:00 UTC

// ----- VS DAY -----
// VS runs Mon–Sat (6 days), Sun = rest
// Day 1 = Mon, Day 2 = Tue, ..., Day 6 = Sat
// Point values sourced directly from in-game "VS Theme" screen

export interface VsDayTheme {
  day: number;       // 1=Mon ... 6=Sat (matches JS getUTCDay() for Mon–Sat)
  vsDay: number;     // in-game day number (1–6)
  name: string;      // English name
  namePL: string;    // Polish in-game name
  color: string;
  icon: string;
  vsPoints: number;  // VS alliance match points weight for this day
  topActions: VsDayAction[];
}

export interface VsDayAction {
  name: string;
  points: number;
  unit: string;
  tip?: string;
  highlight?: boolean; // top earner — should be shown prominently
}

// Base point values are WITHOUT VS Tech research boost.
// VS Tech research increases all point values by a multiplier (see VS_TECH_LEVELS).
// Example: base 120 pts/min speedup × VS Tech IV (1.25x) = 150 pts/min in-game.
export const VS_DAY_THEMES: VsDayTheme[] = [
  {
    day: 1, // Monday
    vsDay: 1,
    name: "Radar Training",
    namePL: "Szkolenie radarowe",
    color: "#3B82F6",
    icon: "📡",
    vsPoints: 1,
    topActions: [
      { name: "Complete 1 Radar Task", points: 25000, unit: "per task", highlight: true, tip: "Best earner on Day 1 — do all radar tasks" },
      { name: "Use 1 Stamina", points: 300, unit: "per stamina" },
      { name: "Open Drone Data Chip chest", points: 2000, unit: "per chest" },
      { name: "Gather 100 food / 100 iron / 60 coins", points: 40, unit: "per gather" },
      { name: "Use 660+ Hero EXP", points: 6, unit: "per 660 EXP" },
      { name: "Buy diamond packages (1 diamond)", points: 30, unit: "per diamond" },
    ],
  },
  {
    day: 2, // Tuesday
    vsDay: 2,
    name: "Base Expansion",
    namePL: "Rozbudowa bazy",
    color: "#10B981",
    icon: "🏗️",
    vsPoints: 2,
    topActions: [
      { name: "Send Legendary Trade Truck", points: 200000, unit: "one-time", highlight: true, tip: "Huge one-time points — do this first!" },
      { name: "Complete 1 Legendary Secret Task", points: 150000, unit: "per task", highlight: true },
      { name: "Recruit Survivor", points: 3000, unit: "per recruit" },
      { name: "Use 1 Armament Core", points: 6250, unit: "per core" },
      { name: "Construction speedup (1 min)", points: 120, unit: "per 1-min speedup", tip: "~120 base pts/min, boosted by VS Tech research" },
      { name: "Increase building power by 1", points: 21, unit: "per power" },
      { name: "Use 1 Armament Material", points: 2.5, unit: "per material" },
    ],
  },
  {
    day: 3, // Wednesday
    vsDay: 3,
    name: "Age of Science",
    namePL: "Wiek nauki",
    color: "#8B5CF6",
    icon: "🔬",
    vsPoints: 2,
    topActions: [
      { name: "Complete 1 Radar Mission", points: 23000, unit: "per mission", highlight: true },
      { name: "Use 1 Valor Badge", points: 600, unit: "per badge" },
      { name: "Research speedup (1 min)", points: 120, unit: "per 1-min speedup", highlight: true, tip: "~120 base pts/min, boosted by VS Tech research" },
      { name: "Increase Technological Power by 1", points: 21, unit: "per power" },
      { name: "Buy diamond packages (1 diamond)", points: 30, unit: "per diamond" },
    ],
  },
  {
    day: 4, // Thursday
    vsDay: 4,
    name: "Train Heroes",
    namePL: "Trenuj bohaterów",
    color: "#F59E0B",
    icon: "⭐",
    vsPoints: 2,
    topActions: [
      { name: "Use 1 Legendary (UR) hero shard", points: 20000, unit: "per shard", highlight: true },
      { name: "Use 1 exclusive weapon shard", points: 20000, unit: "per shard", highlight: true },
      { name: "Use 1 Epic (SSR) hero shard", points: 7000, unit: "per shard" },
      { name: "Use 1 Rare (SR) hero shard", points: 2000, unit: "per shard" },
      { name: "Elite Hero Recruitment", points: 3750, unit: "per recruitment" },
      { name: "Use 1 Skill Medal", points: 20, unit: "per medal" },
      { name: "Use 660+ Hero EXP", points: 6, unit: "per 660 EXP" },
      { name: "Buy diamond packages (1 diamond)", points: 30, unit: "per diamond" },
    ],
  },
  {
    day: 5, // Friday
    vsDay: 5,
    name: "Total Mobilization",
    namePL: "Totalna mobilizacja",
    color: "#EC4899",
    icon: "🪖",
    vsPoints: 2,
    topActions: [
      { name: "Complete 1 Radar Mission", points: 23000, unit: "per mission", highlight: true },
      { name: "Train T10 soldiers", points: 258, unit: "per soldier", highlight: true, tip: "Highest troop pts — focus on high-tier troops" },
      { name: "Train T8 soldiers", points: 202, unit: "per soldier" },
      { name: "Train T5 soldiers", points: 130, unit: "per soldier" },
      { name: "Train T3 soldiers", points: 94, unit: "per soldier" },
      { name: "Train T1 soldiers", points: 46, unit: "per soldier" },
      { name: "Training speedup (1 min)", points: 122, unit: "per 1-min speedup" },
      { name: "Construction speedup (1 min)", points: 120, unit: "per 1-min speedup" },
      { name: "Research speedup (1 min)", points: 120, unit: "per 1-min speedup" },
      { name: "Increase building power by 1", points: 21, unit: "per power" },
    ],
  },
  {
    day: 6, // Saturday
    vsDay: 6,
    name: "Enemy Slayer",
    namePL: "Pogromca wrogów",
    color: "#EF4444",
    icon: "💀",
    vsPoints: 4,
    topActions: [
      { name: "Send Legendary Trade Truck", points: 200000, unit: "one-time", highlight: true, tip: "Do this FIRST — massive one-time bonus" },
      { name: "Complete 1 Legendary Secret Task", points: 150000, unit: "per task", highlight: true },
      { name: "T10 killed by rival alliance", points: 138, unit: "per unit", highlight: true, tip: "You earn pts when your T10 are killed by rival — let them hit!" },
      { name: "T8 killed by rival alliance", points: 108, unit: "per unit" },
      { name: "T5 killed by rival alliance", points: 75, unit: "per unit" },
      { name: "T3 killed by rival alliance", points: 45, unit: "per unit" },
      { name: "T1 killed by rival alliance", points: 25, unit: "per unit" },
      { name: "T10 self kills", points: 28, unit: "per unit" },
      { name: "T5 self kills", points: 15, unit: "per unit" },
      { name: "T1 self kills", points: 5, unit: "per unit" },
      { name: "T10 troops lost", points: 20, unit: "per unit" },
      { name: "T5 troops lost", points: 12, unit: "per unit" },
      { name: "T1 troops lost", points: 6, unit: "per unit" },
      { name: "Construction speedup (1 min)", points: 120, unit: "per 1-min speedup" },
      { name: "Research speedup (1 min)", points: 120, unit: "per 1-min speedup" },
      { name: "Training speedup (1 min)", points: 122, unit: "per 1-min speedup" },
      { name: "Healing speedup (1 min)", points: 122, unit: "per 1-min speedup" },
      { name: "Buy diamond packages (1 diamond)", points: 30, unit: "per diamond" },
    ],
  },
];

// VS Day starts Monday 07:00 UTC, ends Saturday midnight UTC
export const VS_DAY_START_HOUR = 7; // 07:00 UTC

// ----- CHEST THRESHOLDS -----

export interface ChestThreshold {
  chest: number;
  points: number;
  rewards: string[];
}

// Personal VS Day chest thresholds
export const CHEST_THRESHOLDS: ChestThreshold[] = [
  { chest: 1, points: 40000, rewards: ["Speedups 30min x5", "Silver x500K"] },
  { chest: 2, points: 150000, rewards: ["Speedups 1h x5", "Gold x200", "Silver x1M"] },
  { chest: 3, points: 540000, rewards: ["Speedups 3h x3", "Gold x500", "EXP book x10"] },
  { chest: 4, points: 660000, rewards: ["Speedups 8h x2", "Gold x1000"] },
  { chest: 5, points: 1000000, rewards: ["Speedups 24h x1", "Gold x2000", "Epic hero shards"] },
  { chest: 6, points: 2300000, rewards: ["Speedups 24h x3", "Gold x3000", "Purple gear mat"] },
  { chest: 7, points: 2600000, rewards: ["Speedups 72h x1", "Gold x5000", "Epic gear mat"] },
  { chest: 8, points: 3600000, rewards: ["Speedups 72h x2", "Gold x8000", "Legendary shard"] },
  { chest: 9, points: 7200000, rewards: ["Speedups 72h x5", "Gold x15000", "Legendary hero"] },
];

// ----- VS TECH MULTIPLIERS -----

export interface VsTechLevel {
  level: number;
  name: string;
  multiplier: number; // chest point multiplier
  description: string;
}

export const VS_TECH_LEVELS: VsTechLevel[] = [
  { level: 0, name: "None", multiplier: 1.0, description: "No VS Tech researched" },
  { level: 1, name: "VS Tech I", multiplier: 1.1, description: "+10% VS points" },
  { level: 2, name: "VS Tech II", multiplier: 1.2, description: "+20% VS points" },
  { level: 3, name: "VS Tech III", multiplier: 1.35, description: "+35% VS points" },
  { level: 4, name: "VS Tech IV", multiplier: 1.5, description: "+50% VS points" },
  { level: 5, name: "VS Tech V", multiplier: 1.75, description: "+75% VS points" },
  { level: 6, name: "VS Tech VI (Max)", multiplier: 2.0, description: "+100% VS points (2x)" },
];

// ----- SPEEDUP CALCULATOR -----

export interface SpeedupItem {
  name: string;
  minutes: number;
  arPoints: number; // Arms Race points (10pts/min for construction/research)
  vsPoints: number; // VS Day points (varies by day, ~1pt/min on dev days, 2pt/min on VS Day)
}

export const SPEEDUP_ITEMS: SpeedupItem[] = [
  { name: "1 min", minutes: 1, arPoints: 10, vsPoints: 1 },
  { name: "5 min", minutes: 5, arPoints: 50, vsPoints: 5 },
  { name: "15 min", minutes: 15, arPoints: 150, vsPoints: 15 },
  { name: "30 min", minutes: 30, arPoints: 300, vsPoints: 30 },
  { name: "1 hour", minutes: 60, arPoints: 600, vsPoints: 60 },
  { name: "3 hours", minutes: 180, arPoints: 1800, vsPoints: 180 },
  { name: "8 hours", minutes: 480, arPoints: 4800, vsPoints: 480 },
  { name: "24 hours", minutes: 1440, arPoints: 14400, vsPoints: 1440 },
  { name: "72 hours", minutes: 4320, arPoints: 43200, vsPoints: 4320 },
];

// ----- TIME UTILITIES -----

/**
 * Returns the current Arms Race phase (1-6) or 0 if in rest period
 */
export function getCurrentArmsRacePhase(): {
  phase: number | null;
  phaseName: string;
  phaseStartUTC: Date;
  phaseEndUTC: Date;
  nextPhaseStartUTC: Date;
  weekStart: Date;
  weekEnd: Date;
  isRest: boolean;
} {
  const now = new Date();
  const nowUTC = new Date(now.toISOString());

  // Find the most recent Monday 07:00 UTC
  const monday7 = getLastMonday7UTC(nowUTC);
  const weekEnd = new Date(monday7.getTime() + 7 * 24 * 60 * 60 * 1000); // next Monday 07:00

  const msIntoWeek = nowUTC.getTime() - monday7.getTime();
  const hoursIntoWeek = msIntoWeek / (1000 * 60 * 60);

  // 6 phases × 24h each = 144h, then rest until 168h (Sunday 07:00 → Monday 07:00)
  let phase: number | null = null;
  let isRest = false;
  let phaseStart: Date;
  let phaseEnd: Date;
  let nextPhaseStart: Date;

  if (hoursIntoWeek < 0 || hoursIntoWeek >= 168) {
    // Shouldn't happen but safety
    isRest = true;
    phaseStart = monday7;
    phaseEnd = weekEnd;
    nextPhaseStart = weekEnd;
  } else if (hoursIntoWeek < 144) {
    // In one of 6 phases
    phase = Math.floor(hoursIntoWeek / 24) + 1;
    phaseStart = new Date(monday7.getTime() + (phase - 1) * 24 * 60 * 60 * 1000);
    phaseEnd = new Date(phaseStart.getTime() + 24 * 60 * 60 * 1000);
    nextPhaseStart = phase < 6 ? phaseEnd : weekEnd;
  } else {
    // Rest period (day 7: Sunday 07:00 → Monday 07:00)
    isRest = true;
    phaseStart = new Date(monday7.getTime() + 144 * 60 * 60 * 1000);
    phaseEnd = weekEnd;
    nextPhaseStart = weekEnd;
  }

  const phaseData = phase ? ARMS_RACE_PHASES[phase - 1] : null;

  return {
    phase,
    phaseName: isRest ? "Rest Period" : (phaseData?.name ?? "Unknown"),
    phaseStartUTC: phaseStart,
    phaseEndUTC: phaseEnd,
    nextPhaseStartUTC: nextPhaseStart,
    weekStart: monday7,
    weekEnd,
    isRest,
  };
}

function getLastMonday7UTC(now: Date): Date {
  const d = new Date(now);
  d.setUTCHours(7, 0, 0, 0);
  // Go back to Monday
  const day = d.getUTCDay(); // 0=Sun, 1=Mon
  const daysToMonday = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - daysToMonday);
  // If we haven't reached Monday 07:00 yet this week, go back another week
  if (d.getTime() > now.getTime()) {
    d.setUTCDate(d.getUTCDate() - 7);
  }
  return d;
}

/**
 * Returns current VS Day theme (null if Sunday = rest)
 */
export function getCurrentVsDay(): {
  theme: VsDayTheme | null;
  isRest: boolean;
  dayStart: Date;
  dayEnd: Date;
} {
  const now = new Date();
  const dayUTC = now.getUTCDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  // VS Day runs Mon (1) through Sat (6), 07:00 UTC each day
  const dayStart = new Date(now);
  dayStart.setUTCHours(7, 0, 0, 0);
  if (dayStart.getTime() > now.getTime()) {
    // Haven't hit 07:00 yet today — use yesterday's theme
    dayStart.setUTCDate(dayStart.getUTCDate() - 1);
  }

  const currentDay = dayStart.getUTCDay();
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  if (currentDay === 0) {
    // Sunday = rest
    return { theme: null, isRest: true, dayStart, dayEnd };
  }

  const theme = VS_DAY_THEMES.find((t) => t.day === currentDay) ?? null;
  return { theme, isRest: false, dayStart, dayEnd };
}

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  if (ms <= 0) return "0m";
  const totalSecs = Math.floor(ms / 1000);
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hours > 0) {
    return `${hours}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  }
  return `${secs}s`;
}

/**
 * Format UTC date to local time string
 */
export function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatLocalDate(date: Date): string {
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
