# Last War: Survival — Hero Level & Skill System Research
**Compiled:** 2026-07-12  
**Sources:** lastwar.wiki, theriagames.com, grindnstrat.com, heaven-guardian.com, lastwarvault.com, lastwargame.online, lastwartutorial.com, packsify.com, and community guides  
**Purpose:** Power calculator companion app — exact numbers where confirmed, estimates flagged

---

## TABLE OF CONTENTS
1. [Hero Level System](#section-1-hero-level-system)
2. [Hero Skill System](#section-2-hero-skill-system)
3. [Specific Hero Skills](#section-3-specific-hero-skills)
4. [Upgrade Priority Guide](#section-4-upgrade-priority-guide)

---

## SECTION 1: Hero Level System

### 1.1 Level Cap Overview

Hero maximum level is gated by **two independent systems**:
1. **HQ Level** — hard ceiling, increases by +5 per HQ level
2. **Star Rank** — secondary ceiling per hero's own progression (see 1.2)

The effective cap is whichever limit is lower.

| HQ Level | Hero Level Cap | Notes |
|----------|---------------|-------|
| 1        | 5             | ~estimated |
| 2–5      | 10–25         | ~estimated (HQ×5 formula) |
| 10       | 50            | confirmed |
| 15       | 75            | confirmed |
| 16       | 80            | confirmed (wiki table) |
| 17       | 85            | confirmed |
| 18       | 90            | confirmed |
| 19       | 95            | confirmed |
| 20       | 100           | confirmed |
| 21       | 105           | confirmed |
| 22       | 110           | confirmed |
| 23       | 115           | confirmed |
| 24       | 120           | confirmed |
| 25       | 125           | confirmed |
| 26       | 130           | confirmed |
| 27       | 135           | confirmed |
| 28       | 140           | confirmed |
| 29       | 145           | confirmed |
| 30       | 150           | confirmed (current maximum pre-Season 7+) |
| 35       | 175           | confirmed (Season 3+ content) |

**Formula:** Hero Level Cap = HQ Level × 5 (confirmed)

---

### 1.2 Star Rank Skill Level Caps

Star rank gates both **skill level caps** and **hero attributes**. This is separate from the HQ-based hero level cap.

| Star Rank | Max Skill Level | Unlock Notes |
|-----------|----------------|-------------|
| 0★        | 1              | Hero acquired, skills at base |
| 1★        | 5              | confirmed (grindnstrat.com) |
| 2★        | 10             | confirmed |
| 3★        | 20             | confirmed |
| 4★        | 30 + Expertise | Expertise "Super Sensing" unlocked; confirmed |
| 5★        | 30 + Wall of Honor | Wall of Honor unlocked; confirmed |
| Exclusive Weapon | 40     | Requires Exclusive Weapon (EW) to unlock levels 31–40 |

> **Note on Exclusive Weapon unlock tiers:**  
> - EW Level 10 → Max skill level 33  
> - EW Level 20 → Max skill level 36  
> - EW Level 30 → Max skill level 40  
> (Source: grindnstrat.com — confirmed)

---

### 1.3 Star Rank Shard Costs

| Progression | Shards Per Sub-Rank | Total Shards |
|-------------|--------------------:|-------------:|
| 0★ → 1★     | 5 (×5 sub-ranks)   | 25           |
| 1★ → 2★     | 10 (×5)             | 50           |
| 2★ → 3★     | 20 (×5)             | 100          |
| 3★ → 4★     | 60 (×5)             | 300          |
| 4★ → 5★     | 100 (×5)            | 500          |
| **Total 0★→5★** |                | **975**      |

> **Special case:** Mason, Violet, Scarlett, Sarah, and Venom are SSR heroes promotable to UR. After UR promotion, star rank 3→4 and 4→5 shard costs **double** (SSR shards still used but refunded at promotion — all medals and shards are refunded on UR promotion).

---

### 1.4 Attribute Increase Per Star Rank

Star rank boosts hero base ATK, HP, and DEF. Exact per-level values are hero-specific (not universal), but the pattern is:

- **~8% increase per sub-rank** (each of the 5 partial stars within a full rank)
- Full star = ~40% total attribute increase over that star tier
- Source: grindnstrat.com (~estimated, community-derived)

**Exclusive Weapon Stat Bonuses (Murphy as example — absolute values, not %)**

| EW Level | HP Bonus    | ATK Bonus | DEF Bonus | Damage Resistance |
|----------|------------|-----------|-----------|------------------|
| 10       | +94,649    | +2,875    | +873      | +3%              |
| 20       | +223,718   | +6,795    | +2,065    | +4%              |
| 30       | +410,149   | +12,459   | +3,786    | +5%              |

Source: grindnstrat.com (confirmed for Murphy; other heroes will differ)

---

### 1.5 Hero EXP Required Per Level (Full Table L1–L150)

**Source:** lastwar.wiki/items/hero-exp/ — confirmed

Each row shows EXP needed to reach that level (i.e., to go from L(n-1) → Ln).

| Level | EXP Required | HQ Req | Level | EXP Required  | HQ Req |
|-------|-------------|--------|-------|--------------|--------|
| 1     | —           | —      | 76    | 8,700,000    | 16     |
| 2     | 100         | 1      | 77    | 9,500,000    | 16     |
| 3     | 200         | 1      | 78    | 11,000,000   | 16     |
| 4     | 300         | 1      | 79    | 12,000,000   | 16     |
| 5     | 400         | 1      | 80    | 13,000,000   | 16     |
| 6     | 500         | 2      | 81    | 13,000,000   | 17     |
| 7     | 600         | 2      | 82    | 14,000,000   | 17     |
| 8     | 700         | 2      | 83    | 14,000,000   | 17     |
| 9     | 800         | 2      | 84    | 15,000,000   | 17     |
| 10    | 900         | 2      | 85    | 16,000,000   | 17     |
| 11    | 1,000       | 3      | 86    | 17,000,000   | 18     |
| 12    | 1,100       | 3      | 87    | 18,000,000   | 18     |
| 13    | 1,200       | 3      | 88    | 19,000,000   | 18     |
| 14    | 1,300       | 3      | 89    | 20,000,000   | 18     |
| 15    | 1,400       | 3      | 90    | 21,000,000   | 18     |
| 16    | 1,500       | 4      | 91    | 22,000,000   | 19     |
| 17    | 1,600       | 4      | 92    | 23,000,000   | 19     |
| 18    | 1,700       | 4      | 93    | 24,000,000   | 19     |
| 19    | 1,800       | 4      | 94    | 25,000,000   | 19     |
| 20    | 1,900       | 4      | 95    | 26,000,000   | 19     |
| 21    | 2,000       | 5      | 96    | 27,000,000   | 20     |
| 22    | 2,100       | 5      | 97    | 28,000,000   | 20     |
| 23    | 2,300       | 5      | 98    | 30,000,000   | 20     |
| 24    | 2,700       | 5      | 99    | 31,000,000   | 20     |
| 25    | 3,200       | 5      | 100   | 33,000,000   | 20     |
| 26    | 3,900       | 6      | 101   | 35,000,000   | 21     |
| 27    | 4,600       | 6      | 102   | 37,000,000   | 21     |
| 28    | 5,500       | 6      | 103   | 39,000,000   | 21     |
| 29    | 6,600       | 6      | 104   | 41,000,000   | 21     |
| 30    | 8,000       | 6      | 105   | 43,000,000   | 21     |
| 31    | 9,500       | 7      | 106   | 45,000,000   | 22     |
| 32    | 12,000      | 7      | 107   | 47,000,000   | 22     |
| 33    | 14,000      | 7      | 108   | 49,000,000   | 22     |
| 34    | 17,000      | 7      | 109   | 51,000,000   | 22     |
| 35    | 20,000      | 7      | 110   | 53,000,000   | 22     |
| 36    | 24,000      | 8      | 111   | 55,000,000   | 23     |
| 37    | 29,000      | 8      | 112   | 57,000,000   | 23     |
| 38    | 35,000      | 8      | 113   | 59,000,000   | 23     |
| 39    | 41,000      | 8      | 114   | 61,000,000   | 23     |
| 40    | 49,000      | 8      | 115   | 63,000,000   | 23     |
| 41    | 59,000      | 9      | 116   | 65,000,000   | 24     |
| 42    | 71,000      | 9      | 117   | 67,000,000   | 24     |
| 43    | 85,000      | 9      | 118   | 69,000,000   | 24     |
| 44    | 110,000     | 9      | 119   | 71,000,000   | 24     |
| 45    | 130,000     | 9      | 120   | 73,000,000   | 24     |
| 46    | 150,000     | 10     | 121   | 75,000,000   | 25     |
| 47    | 180,000     | 10     | 122   | 77,000,000   | 25     |
| 48    | 220,000     | 10     | 123   | 79,000,000   | 25     |
| 49    | 260,000     | 10     | 124   | 81,000,000   | 25     |
| 50    | 310,000     | 10     | 125   | 83,000,000   | 25     |
| 51    | 370,000     | 11     | 126   | 85,000,000   | 26     |
| 52    | 440,000     | 11     | 127   | 87,000,000   | 26     |
| 53    | 530,000     | 11     | 128   | 89,000,000   | 26     |
| 54    | 630,000     | 11     | 129   | 91,000,000   | 26     |
| 55    | 760,000     | 11     | 130   | 93,000,000   | 26     |
| 56    | 910,000     | 12     | 131   | 95,000,000   | 27     |
| 57    | 1,100,000   | 12     | 132   | 97,000,000   | 27     |
| 58    | 1,400,000   | 12     | 133   | 100,000,000  | 27     |
| 59    | 1,600,000   | 12     | 134   | 105,000,000  | 27     |
| 60    | 1,900,000   | 12     | 135   | 108,000,000  | 27     |
| 61    | 2,100,000   | 13     | 136   | 115,000,000  | 28     |
| 62    | 2,300,000   | 13     | 137   | 120,000,000  | 28     |
| 63    | 2,500,000   | 13     | 138   | 125,000,000  | 28     |
| 64    | 2,800,000   | 13     | 139   | 130,000,000  | 28     |
| 65    | 3,100,000   | 13     | 140   | 135,000,000  | 28     |
| 66    | 3,400,000   | 14     | 141   | 140,000,000  | 29     |
| 67    | 3,700,000   | 14     | 142   | 145,000,000  | 29     |
| 68    | 4,100,000   | 14     | 143   | 150,000,000  | 29     |
| 69    | 4,500,000   | 14     | 144   | 155,000,000  | 29     |
| 70    | 4,900,000   | 14     | 145   | 160,000,000  | 29     |
| 71    | 5,400,000   | 15     | 146   | 165,000,000  | 30     |
| 72    | 5,900,000   | 15     | 147   | 170,000,000  | 30     |
| 73    | 6,500,000   | 15     | 148   | 175,000,000  | 30     |
| 74    | 7,200,000   | 15     | 149   | 180,000,000  | 30     |
| 75    | 7,900,000   | 15     | 150   | 185,000,000  | 30     |

**Cumulative EXP milestones (L1→Ln total):**
- L1→L30: ~66,600 EXP (~estimated from table)
- L1→L50: ~2,800,000 EXP (~estimated)
- L1→L60: ~10,700,000 EXP (~estimated)
- L1→L80: ~100,000,000+ EXP (~estimated)
- L1→L100: ~250,000,000 EXP (~estimated)
- L1→L150: Exceeds 1 billion EXP total (~estimated)

---

### 1.6 EXP Items

Exact item names and values are **not consistently documented** in any scraped source. The following is pieced together from community references:

| Item Name              | EXP Value | Notes |
|------------------------|----------:|-------|
| Hero EXP I (Small)     | ~1,000    | ~estimated — common early drop |
| Hero EXP II (Medium)   | ~5,000    | ~estimated |
| Hero EXP III (Large)   | ~10,000   | ~estimated |
| Hero EXP IV (Huge)     | ~50,000   | ~estimated — event reward |
| Hero EXP V (Legendary) | ~100,000  | ~estimated — rare drop |
| Arena Victory EXP      | 500,000   | confirmed — per arena win (up to 5×/day) |

> **Missing data:** Exact item tiers and EXP values per item are not confirmed in any source scraped. The calculator at dracgon.tech uses "10K EXP per chest" as a reference unit. Treat item values above as community estimates pending in-game verification.

**Primary EXP Sources (confirmed):**
- Training Base (passive generation, rate scales with building level)
- Arena Battles: 500,000 EXP per win, max 5 wins/day = 2,500,000/day potential
- Zombie Invasion Event (best burst source)
- Radar Missions (Legendary/purple tier)
- Spec Ops (best pre-stage 30)
- Honorable Campaign (golden EXP medals)
- Daily tasks and activity missions

---

### 1.7 Stat Gains Per Level

No source provides exact per-level ATK/HP/DEF delta values that are universal. The system works as follows:

- Hero stats scale with **both level AND star rank simultaneously**
- Base stats are hero-specific (UR > SSR > SR)
- Level increases provide linear stat growth within each star tier
- Star promotions provide larger step-up bonuses (~40% per full star tier per stat)

**Available reference (Williams at 5★, max level — absolute values):**
- HP: ~120,000–180,000 range (contextual from troop examples)
- ATK: ~1,200–2,500 range
- DEF: ~1,000–2,000 range

> **Missing data:** No source provides a universal "stat per level" formula. This would need to be reverse-engineered from in-game screenshots at L1 vs L50 vs L100 for the same hero at the same star rank.

---

### 1.8 BP (Battle Power) Per Hero Level

**No confirmed source** provides the exact BP formula per hero level. General findings:

- Hero Power is one component of Total Power: `Total Power = Building Power + Research Power + Troop Power + Hero Power + Equipment Power + Alliance Power`
- Hero Power is contributed by: hero level stats, star rank, skill levels, and exclusive weapon
- Community consensus: hero leveling is **lower ROI for BP** compared to skill upgrades and gear
- Troop comparison point: Level 1 troops = 24 power; Level 10 troops = 1,647 power (exponential, not linear)

> **Missing data:** Exact BP per hero level not found in any source. Needs in-game testing.

---

### 1.9 Exclusive Weapon (EW) System

Exclusive Weapons unlock after a hero reaches 5★ (via seasonal events). They:
1. Unlock skill levels 31–40 in tiers (EW L10 → cap 33, EW L20 → cap 36, EW L30 → cap 40)
2. Add a new EW-specific skill (replaces or augments existing skills in the UI)
3. Grant large absolute stat bonuses (confirmed for Murphy above)
4. At EW Level 20: grant +7.5% ATK, HP, DEF to **all heroes of that formation type**

**EW Shard Costs (cumulative):**

| EW Level Range | Cost Per Level | Total Cost (Range) |
|---------------|---------------|--------------------|
| Level 1        | 50 shards     | 50                 |
| Levels 2–5     | 20 shards each | +80 (130 total)   |
| Levels 6–10    | 40 shards each | +200 (330 total)  |
| Levels 11–15   | 60 shards each | +300 (630 total)  |
| Levels 16–20   | 100 shards each | +500 (1,130 total)|
| Levels 21–25   | 150 shards each | +750 (1,880 total)|
| Levels 26–30   | 200 shards each | +1,000 (2,880 total)|

**EW Season assignments (confirmed):**

| Season | Tank EW   | Aircraft EW | Missile EW |
|--------|-----------|-------------|------------|
| S1     | Kimberly  | DVA         | Tesla      |
| S2     | Murphy    | Carlie      | Swift      |
| S3     | Marshall  | Schuyler    | McGregor   |
| S4     | Williams  | Lucius      | Adam       |
| S5     | Stetmann  | Morrison    | Fiona      |

---

## SECTION 2: Hero Skill System

### 2.1 Four Skill Slot Types

Every hero has exactly 4 skill slots with defined types. The UI layout is a 2×2 grid:

| Grid Position | Skill Type  | Unlock Condition | Notes |
|---------------|------------|-----------------|-------|
| Top-Left      | Auto-Attack | Available from 0★ | Fires automatically every ~1–1.5s in battle |
| Top-Right     | Tactics     | Available from 0★ | Active ability with ~9–12s cooldown |
| Bottom-Left   | Passive     | Available from 0★ | Always-active stat buff or conditional effect |
| Bottom-Right  | Expertise   | Unlocks at **4★** | "Super Sensing" — universal across all heroes |

> **Important:** The Expertise slot (Bottom-Right) does NOT consume skill medals to upgrade — it is a fixed bonus that activates permanently at 4★. Some sources label it separately from the 3 medal-upgraded skills.

---

### 2.2 Skill Types — Generic Descriptions

**Auto-Attack (Top-Left)**
- Fires automatically every ~1.0–1.55 seconds depending on hero
- Deals damage to 1 or 2 random enemies (some heroes target lowest-HP enemy)
- Damage expressed as % of Hero ATK
- Physical or Energy damage depending on hero
- Medal investment: generally lowest priority for tanks; medium for DPS

**Tactics (Top-Right)**
- Active ability triggered by AI on cooldown (~9–12 seconds)
- Most impactful skill for DPS heroes — highest damage multiplier
- For support heroes: team-wide ATK/DEF buff for 6–10 seconds
- For tank heroes: damage reduction buff or debuff on enemies
- Medal investment: highest priority for almost all heroes

**Passive (Bottom-Left)**
- Always active, no trigger condition
- Common effects: % damage boost, % crit rate, % damage reduction, % specific-type damage
- For tank heroes: damage reduction (self or team)
- For DPS heroes: flat % damage type boost or crit rate
- Medal investment: second priority for most heroes

**Expertise / Super Sensing (Bottom-Right)**
- Unlocks at exactly 4★ — cannot be unlocked earlier
- Effect is identical for every UR hero: **Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%**
- SSR heroes (like Mason pre-promotion) have weaker version: **Self HP +10%, ATK +10%, DEF +10%** (no cooldown bonus)
- Does NOT scale with skill levels — it is a fixed passive
- No medals required

---

### 2.3 Star-Based Skill Level Caps (Confirmed)

| Star Rank | Max Skill Level | What Unlocks |
|-----------|----------------|-------------|
| 0★        | 1              | Base skill only |
| 1★        | 5              | Skill scaling tier 1 |
| 2★        | 10             | Skill scaling tier 2 |
| 3★        | 20             | Skill scaling tier 3 |
| 4★        | 30             | Skill scaling tier 4 + Expertise unlocked |
| 5★        | 30             | Wall of Honor unlocked (no additional skill cap) |
| EW L1–L9  | 30             | No cap increase until EW L10 |
| EW L10    | 33             | Skill levels 31–33 accessible |
| EW L20    | 36             | Skill levels 34–36 accessible |
| EW L30    | 40             | Skill levels 37–40 accessible |

Source: grindnstrat.com (confirmed)

---

### 2.4 Skill Medal Costs Per Level

**Source:** lastwar.wiki/items/skill-medal/ and theriagames.com/guide/last-war-survival-skill-medal-guide/ (confirmed from two independent sources)

The SSR ratio is 90% of UR cost; SR is 80% of UR cost.

#### Complete Cost Table

| Level | UR Cost   | SSR Cost  | SR Cost   | UR Cumul.  | SSR Cumul. | SR Cumul.  |
|-------|----------:|----------:|----------:|-----------:|-----------:|-----------:|
| 1→2   | 200       | 180       | 160       | 200        | 180        | 160        |
| 2→3   | 200       | 180       | 160       | 400        | 360        | 320        |
| 3→4   | 400       | 360       | 320       | 800        | 720        | 640        |
| 4→5   | 400       | 360       | 320       | 1,200      | 1,080      | 960        |
| 5→6   | 600       | 540       | 480       | 1,800      | 1,620      | 1,440      |
| 6→7   | 600       | 540       | 480       | 2,400      | 2,160      | 1,920      |
| 7→8   | 800       | 720       | 640       | 3,200      | 2,880      | 2,560      |
| 8→9   | 800       | 720       | 640       | 4,000      | 3,600      | 3,200      |
| 9→10  | 1,200     | 1,080     | 960       | 5,200      | 4,680      | 4,160      |
| 10→11 | 1,600     | 1,440     | 1,280     | 6,800      | 6,120      | 5,440      |
| 11→12 | 2,400     | 2,160     | 1,920     | 9,200      | 8,280      | 7,360      |
| 12→13 | 3,200     | 2,880     | 2,560     | 12,400     | 11,160     | 9,920      |
| 13→14 | 4,000     | 3,600     | 3,200     | 16,400     | 14,760     | 13,120     |
| 14→15 | 4,800     | 4,320     | 3,840     | 21,200     | 19,080     | 16,960     |
| 15→16 | 5,600     | 5,040     | 4,480     | 26,800     | 24,120     | 21,440     |
| 16→17 | 6,400     | 5,760     | 5,120     | 33,200     | 29,880     | 26,560     |
| 17→18 | 7,200     | 6,480     | 5,760     | 40,400     | 36,360     | 32,320     |
| 18→19 | 8,000     | 7,200     | 6,400     | 48,400     | 43,560     | 38,720     |
| 19→20 | 9,200     | 8,280     | 7,360     | 57,600     | 51,840     | 46,080     |
| 20→21 | 10,400    | 9,360     | 8,320     | 68,000     | 61,200     | 54,400     |
| 21→22 | 11,600    | 10,440    | 9,280     | 79,600     | 71,640     | 63,680     |
| 22→23 | 12,800    | 11,520    | 10,240    | 92,400     | 83,160     | 73,920     |
| 23→24 | 14,000    | 12,600    | 11,200    | 106,400    | 95,760     | 85,120     |
| 24→25 | 15,200    | 13,680    | 12,160    | 121,600    | 109,440    | 97,280     |
| 25→26 | 16,400    | 14,760    | 13,320    | 138,000    | 124,200    | 110,600    |
| 26→27 | 18,000    | 16,200    | 14,400    | 156,000    | 140,400    | 125,000    |
| 27→28 | 20,000    | 18,000    | 16,000    | 176,000    | 158,400    | 141,000    |
| 28→29 | 22,000    | 19,800    | 17,600    | 198,000    | 178,200    | 158,600    |
| 29→30 | 24,000    | 21,600    | 19,200    | 222,000    | 199,800    | 177,800    |
| 30→31 | 26,000    | N/A       | N/A       | 248,000    | —          | —          |
| 31→32 | 28,000    | N/A       | N/A       | 276,000    | —          | —          |
| 32→33 | 30,000    | N/A       | N/A       | 306,000    | —          | —          |
| 33→34 | 32,000    | N/A       | N/A       | 338,000    | —          | —          |
| 34→35 | 34,000    | N/A       | N/A       | 372,000    | —          | —          |
| 35→36 | 36,000    | N/A       | N/A       | 408,000    | —          | —          |
| 36→37 | 38,000    | N/A       | N/A       | 446,000    | —          | —          |
| 37→38 | 40,000    | N/A       | N/A       | 486,000    | —          | —          |
| 38→39 | 42,000    | N/A       | N/A       | 528,000    | —          | —          |
| 39→40 | 44,000    | N/A       | N/A       | 572,000    | —          | —          |

**Total medal cost to max a single skill:**
- SR hero (L1→L30): ~177,800 medals
- SSR hero (L1→L30): ~199,800 medals
- UR hero (L1→L30): ~222,000 medals
- UR hero (L1→L40): ~572,000 medals

**Total medals for 3 upgradeable skills on one UR hero:**
- L1→L30 (×3 skills): ~666,000 medals
- L1→L40 (×3 skills): ~1,716,000 medals

> Note: Expertise/Super Sensing (4th skill) requires NO medals — it's a fixed unlock at 4★.

---

### 2.5 Skill Effect Scaling By Level

**No source provides a per-level effect progression table** (e.g., what % does Tactics do at skill level 7 vs level 12). What is documented:

- Base effect = skill effect at level 1 (before any medals)
- Star bonuses = discrete jumps at 1★, 2★, 3★, 4★, 5★ (5 upgrade tiers)
- Between star tiers, skill level upgrades likely provide linear incremental increases to the base %, but no source has captured exact intermediate values

**Star bonus pattern (consistent across most skills):**
- Skills with damage: star bonuses add +30%, +70%, +120%, +185%, +270% additional damage on top of base
- Skills with % buffs (e.g., damage reduction): star bonuses add fixed % increments (e.g., +3% per star for 5 stars = +15% total)

**What is confirmed at milestone levels:**

| Milestone | Key Observations |
|-----------|-----------------|
| L1        | Base effect active (see per-hero tables below) |
| L5        | First star cap — skill tier 1 complete |
| L10       | Second star cap — "first meaningful threshold" (lastwarvault) |
| L20       | Third star cap — "noticeable power increase" |
| L30       | Fourth star cap — "efficient breakpoint; cost-to-benefit drops after 30" |
| L40       | Maximum (UR + EW only) |

---

### 2.6 BP Contribution Per Skill Level

**No confirmed source.** Community consensus suggests:
- Skill upgrades contribute more BP per medal spent than hero leveling in mid-game
- Tactics skill upgrades give highest BP per level (due to larger effect values)
- ROI drops sharply after level 30 for UR heroes (costs jump from 24,000 to 26,000+ per level)

> **Missing data:** Exact BP numbers per skill level not found. Needs in-game testing.

---

### 2.7 Wall of Honor

Unlocks when a hero reaches 5★ AND the corresponding type building reaches Level 20.

- Grants passive stat bonuses that scale every 50 Wall of Honor levels
- No level cap
- Bonus: +0.25% per milestone (HP, ATK, DEF, or Troop Load depending on hero)
- Every 50 Wall of Honor levels = +0.25% to that stat type
- Also grants +100 HP to corresponding troop type heroes per WoH level

---

## SECTION 3: Specific Hero Skills

### 3.1 Skill Data Notation

For each hero the following data is provided:
- **Type:** UR/SSR/SR
- **Formation:** Tank / Aircraft / Missile
- **Role:** Attacker / Defender / Support
- **Damage Type:** Physical / Energy
- **Skills:** Base % at L1, star bonus scaling, cooldown

**Star bonus pattern key:**
- "30/70/120/185/270" = at 1★/2★/3★/4★/5★, additional damage % on top of base
- "3% per star" = each star adds 3% to the stated effect (5 stars = +15%)

---

### 3.2 Murphy — Unyielding Warrior

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Tank |
| Role | Defender |
| Damage | Physical |
| Available | Day 1 (free) |

**Skill 1: Cannon Fire (Auto-Attack)**
- Base damage: **490.99% ATK** Physical
- Cooldown: 1.50s
- Target: 1 random enemy
- Star bonuses (additional %): 30 / 70 / 120 / 185 / 270

**Skill 2: Ironclad Barrier (Tactics)**
- Effect: Reduces Physical Damage taken by front-row units by **29%** for 5s after casting
- Cooldown: 10.00s
- Star bonuses: Duration extends (+1s each), effect % increases by ~5% per tier
- Priority: HIGH — team defense cornerstone

**Skill 3: Stand Firm (Passive)**
- Effect: Reduces all damage taken by front-row units by **17%** in battle
- Star bonuses: +3% per star (total +15% at 5★ = 32% damage reduction)
- Note: Some sources swap Ironclad Barrier and Stand Firm labels; the 17% passive and 29% tactics are confirmed values

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%

**Upgrade Priority:** Ironclad Barrier (Tactics) > Stand Firm (Passive) > Cannon Fire (Auto)

---

### 3.3 Kimberly — Rocket Shadow

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Tank |
| Role | Attacker |
| Damage | Energy |
| Available | Day 1 (purchase) |

**Skill 1: Energy Assault (Auto-Attack)**
- Base damage: **472.12% ATK** Energy
- Cooldown: 1.55s
- Target: 1 enemy; critical hits grant 1 stack of Energy Amplification (up to = number of Tank heroes in squad)
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 2: Energy Boost (Passive)**
- Effect: Boosts all of Kimberly's Energy Damage by **+30%** in battle
- Star bonuses: +3% per star (max +45% at 5★)

**Skill 3: Barrage Strike (Tactics)**
- Base: Fires 8 rockets at random enemies, each dealing **286.88% ATK** Energy damage
- With EW L10: fires 16 rockets, each dealing ~302% ATK
- Cooldown: 10s
- Note: Each stack of Energy Amplification adds 3 rockets (up to 25 total rockets at full stacks)
- Maximum total damage at max stacks: ~3,501% ATK
- Star bonuses: 30 / 70 / 120 / 185 / 270 (damage per rocket)

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%

**Upgrade Priority:** Barrage Strike (Tactics) > Energy Assault (Auto) > Energy Boost (Passive)

---

### 3.4 Marshall — Blade of Legion

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Tank |
| Role | Support |
| Damage | Energy |
| Available | Day 22–29 |

**Skill 1: Triad Harmony (Auto-Attack)**
- Base damage: **381.47% ATK** Energy (penetration type — hits through defense)
- Cooldown: 1.25s
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 2: Rapid Start (Passive)**
- Effect: Boosts skill cooldown speed by **30%** and reduces damage taken by the highest-ATK hero by **12%**
- Star bonuses: ~+3% cooldown speed and ~+1% damage reduction per star (max ~45% / ~17%)

**Skill 3: Command Strategy (Tactics)**
- Effect: Increases ATK of **all team members by +16.50%** for 6 seconds
- Cooldown: 12s
- Star bonuses: Duration extends to 7–8s; Crit Rate +10% added; ATK boost +3% per tier
- Priority: VERY HIGH — primary reason Marshall is a top support

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%

**Upgrade Priority:** Command Strategy (Tactics) > Super Sensing (Expertise) > Rapid Start (Passive) > Triad Harmony (Auto)

---

### 3.5 Mason — Raging Marksman

| Field | Value |
|-------|-------|
| Type | SSR → UR (Season 1 promotion) |
| Formation | Tank |
| Role | Attacker |
| Damage | Physical |
| Available | Season 1 upgrade |

**Skill 1: Quick Reload (Auto-Attack)**
- Base damage: **69.89% ATK** Physical
- Cooldown: 1.10s
- Note: Very low base % due to rapid fire mechanic
- Star bonuses (additional %): 20 / 45 / 70 / 100 / 150

**Skill 2: Zombie Purge (Passive)**
- Effect: Boosts back-row Tank heroes' damage vs Monsters by **+8.50%**
- Star bonuses: +2% per star (max +18.50% at 5★)
- Note: PvE-focused skill

**Skill 3: Fire Cover (Tactics)**
- Base damage: **568.69% ATK** Physical
- Cooldown: 9.00s
- Star bonuses: 20 / 45 / 70 / 100 / 150

**Skill 4: Super Sensing (Expertise)**
- SSR version (pre-UR promotion): Self HP +10%, ATK +10%, DEF +10%
- UR version (post-promotion): Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%
- Unlocks: 4★

> **IMPORTANT:** All medals spent on Mason are refunded upon UR promotion. Invest freely at SSR.

**Upgrade Priority:** Fire Cover (Tactics) > Quick Reload (Auto) > Zombie Purge (Passive)

---

### 3.6 Williams — Storm Hunter

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Tank |
| Role | Defender |
| Damage | Physical |
| Available | Day 29 |

**Skill 1: Stun Bomb (Auto-Attack)**
- Base damage: **408.11% ATK** Physical
- Cooldown: 1.35s
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 2: All-Around Armor (Passive)**
- Effect: Reduces all damage taken by this hero by **30%** in battle
- Star bonuses: +3% per star (max 45% at 5★)
- Priority: HIGH — best self-damage reduction passive

**Skill 3: Iron Will (Tactics)**
- Effect: Boosts defense of front 2 units by **+50%** for 10 seconds
- Cooldown: 10s
- Star bonuses: Effect boosts by 10%, extends to full squad, duration can increase to 10s
- EW L30 version (Iron Will II): +55% DEF for all troops for 10s + -12% Energy Damage taken debuff on all enemies for 4s

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%

**Upgrade Priority:** All-Around Armor (Passive) > Stun Bomb (Auto) > Iron Will (Tactics) [some guides reverse Passive/Tactics]

---

### 3.7 Stetmann — EM Hunter

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Tank |
| Role | Attacker |
| Damage | Energy |
| Available | Day 57 |

**Skill 1: Orb Lightning (Auto-Attack)**
- Effect: Fires electric ball dealing Energy damage
- Star bonuses (additional %): 30 / 70 / 120 / 185 / 270
- Note: Exact base % not confirmed from sources; ~estimated 408–472% range based on comparable Tank attackers

**Skill 2: Critical Charge (Passive)**
- Effect: Boosts critical strike rate
- Star values: +33% / +36% / +39% / +42% / +45%
- Note: Source gives per-star absolute values not incremental; likely base is ~30%

**Skill 3: Lightning Rush (Active/Tactics)**
- Effect: Unleashes electric balls at random enemies dealing massive Energy damage
- Star bonuses: +30% damage / +1 lightning ball / +70% / +1 ball / +120%
- Starts with 1 ball; reaches 3 balls at 5★

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%

**Upgrade Priority:** Orb Lightning (Auto) > Lightning Rush (Tactics) > Critical Charge (Passive)

---

### 3.8 DVA (D.Va) — Blade Striker

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Aircraft |
| Role | Attacker |
| Damage | Energy |
| Available | Day 8 |

**Skill 1: Vortex Missile (Auto-Attack)**
- Base damage: **408.11% ATK** Energy
- Cooldown: 1.35s
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 2: Armament Upgrade (Passive)**
- Effect: Boosts DVA's Crit Rate by **+30%** in battle
- Star bonuses: +3% per star (max 45% at 5★)

**Skill 3: Steel Barrage (Tactics)**
- Base damage: **718.17% ATK** Energy, targets all enemies
- Cooldown: 10s
- EW L30 bonus: Casts Steel Barrage instantly on 2 front-row units at battle start
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%

**Upgrade Priority:** Steel Barrage (Tactics) > Vortex Missile (Auto) > Armament Upgrade (Passive)

---

### 3.9 Carlie — Scamp

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Aircraft |
| Role | Defender |
| Damage | Physical |
| Available | Day 8 |

**Skill 1: Dual-string Rocket (Auto-Attack)**
- Base damage: **309.32% ATK** Physical
- Cooldown: 1.00s
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 2: Energy Adaption (Passive)**
- Effect: Reduces hero's Energy Damage taken by **40%** in battle
- Star bonuses: +4% per star (max 60% at 5★)
- Note: Counter to energy-type enemies

**Skill 3: Inferno Blaze (Tactics)**
- Base damage: **183.26% ATK** Physical to ALL enemies
- Effect: Reduces targets' Energy Damage output by **15%** for 5s
- Cooldown: 10s
- Star bonuses: +30% damage / +3% energy reduction / +70% / +3% / +120%

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%

**Upgrade Priority:** Energy Adaption (Passive) > Inferno Blaze (Tactics) > Dual-string Rocket (Auto)

---

### 3.10 Schuyler (Shuyler) — Magblade

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Aircraft |
| Role | Attacker |
| Damage | Energy |
| Available | Day 36 |

**Skill 1: Power Barrage (Auto-Attack)**
- Base damage: **309.32% ATK** Energy (alt source: 445.48% — discrepancy noted)
- Cooldown: 1.00s
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 2: Antimatter Armor (Passive)**
- Effect: Boosts hero's own ATK by **+40%** in battle
- Star bonuses: +4% per star (max +60% at 5★)

**Skill 3: Blast Frenzy (Tactics)**
- Base damage: **927.52% ATK** Energy to 1 back-row unit
- Effect: 20% chance to stun target for 2 seconds
- Cooldown: 10s
- Star bonuses: +30% damage / +1 target / +70% / +1 target / +120%
- Max targets at 5★: 3 back-row units

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%

**Upgrade Priority:** Blast Frenzy (Tactics) > Power Barrage (Auto) > Antimatter Armor (Passive)

> **Note on Power Barrage base %:** One source (theriagames) states 309.32%, another (grindnstrat search) states 445.48%. The 309.32% figure is shared by several slow-attack tank/aircraft defenders (Adam, Morrison, Lucius, Carlie) so 445.48% may be the correct Schuyler-specific value. Mark as ~uncertain.

---

### 3.11 Lucius — Sky Knight

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Aircraft |
| Role | Defender |
| Damage | Physical |
| Available | Day 64 |

**Skill 1: Lightning Triple Strike (Auto-Attack)**
- Base damage: **309.32% ATK** Physical to random front-row enemy
- Cooldown: 1.00s
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 2: Silver Armor (Passive)**
- Effect: Boosts damage reduction of front-row heroes by **13%** and reduces Energy Damage taken by **13%**
- Star bonuses: +1.5% per star (max +7.5% = 20.5% at 5★)
- Note: Applies to front-row allies, not just self

**Skill 3: Knight's Spirit (Tactics)**
- Effect: Boosts ALL allies' Energy Damage Reduction by **19.90%** for 5s after casting
- Cooldown: 10s
- Star bonuses: +1s duration / +7% aircraft energy reduction / +1s / +15% aircraft energy reduction / +1s
- Max duration: 8s at 5★; Aircraft heroes get up to 15% additional energy damage reduction

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%

**Upgrade Priority:** Knight's Spirit (Tactics) > Silver Armor (Passive) > Lightning Triple Strike (Auto)

---

### 3.12 Morrison — The Reaper

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Aircraft |
| Role | Attacker |
| Damage | Physical |
| Available | Day 71 |

**Skill 1: Full-Auto Machine Gun (Auto-Attack)**
- Base damage: **309.32% ATK** Physical
- Cooldown: 1.00s
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 2: Full Firepower (Passive)**
- Effect: Boosts hero's Physical Damage by **+30%** in battle
- Star bonuses: +3% per star (max 45% at 5★)

**Skill 3: Armor-Piercing Shot (Tactics)**
- Base: Fires minigun at random enemies **10 times**, each hit dealing **193.38% ATK** Physical
- Defense shred: Each hit reduces target DEF by **5%** (stacks up to 25% on same target) for 9s
- Cooldown: 10s
- Star bonuses: +30% damage / +5 attacks (15 total) / +70% / +5 attacks (20 total) / +120%
- Max at 5★: 20 attacks × 193.38% = ~3,867% theoretical total (with full defense reduction = higher effective)

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%

**Upgrade Priority:** Armor-Piercing Shot (Tactics) > Full-Auto Machine Gun (Auto) > Full Firepower (Passive)

---

### 3.13 Tesla — Magnetic Expert

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Missile Vehicle |
| Role | Attacker |
| Damage | Energy |
| Available | Day 15 |

**Skill 1: Lightning Chain (Auto-Attack)**
- Base damage: **408.11% ATK** Energy
- Cooldown: 1.35s
- EW L1 version (Lightning Chain II): 408.48% ATK (incremental)
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 2: Electric Power Boost (Passive)**
- Effect: Boosts all of Tesla's Energy Damage by **+30%** in battle
- Star bonuses: +3% per star (max 45% at 5★)

**Skill 3: Electric Grid Lockdown (Tactics)**
- Base damage: **1,127.02% ATK** Energy to 3 back-row units
- EW L10 version (Electric Grid Lockdown II): 1,182.52–1,312.02% ATK
- Cooldown: 10s
- Star bonuses: 30 / 70 / 120 / 185 / 270
- EW mechanic: Auto attacks apply "Inductive Current" stacks; each stack increases damage by 1% (max 15% at 15 stacks)

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%
- Season 6 Awakening: Tesla becomes S-tier post-awakening (Week 5)

**Upgrade Priority:** Electric Grid Lockdown (Tactics) > Lightning Chain (Auto) > Electric Power Boost (Passive)

---

### 3.14 Swift — Thunder

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Missile Vehicle |
| Role | Attacker |
| Damage | Physical |
| Available | Day 15 |

**Skill 1: Targeted Strike (Auto-Attack)**
- Base damage: **408.11% ATK** Physical
- Target: Enemy with lowest HP percentage
- Cooldown: 1.35s
- EW L1 version: 408.48% ATK
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 2: Precise Guidance (Passive)**
- Effect: Boosts hero's Crit Rate by **+30%** in battle
- Star bonuses: +3% per star (max 45% at 5★)

**Skill 3: Weakness Targeting (Tactics)**
- Base damage: **793.4% ATK** Physical to 3 random enemies
- EW L1 version (Weakness Targeting II): 826.54% ATK
- Special: Each cast permanently boosts own ATK by 5% (stacks infinitely); 5★ version boosts by 10%
- Cooldown: 10s
- Star bonuses: +30% / 5% self-ATK stack / +70% / 10% self-ATK stack / +120%

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%

**Upgrade Priority:** Precise Guidance (Passive) > Weakness Targeting (Tactics) > Targeted Strike (Auto)

---

### 3.15 McGregor — Ironclad General

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Missile Vehicle |
| Role | Defender |
| Damage | Physical |
| Available | Day 43 |

**Skill 1: Forward Rush (Auto-Attack)**
- Base damage: **408.11% ATK** Physical (machine gun)
- Cooldown: 1.30s
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 2: HP Boost (Passive)**
- Effect: Reduces all damage taken by this hero by **30%**
- Star bonuses: +3% per star (max 45% at 5★)

**Skill 3: Unyielding Heart (Tactics)**
- Effect: Taunts 2 front enemies, reducing their ATK by **16.50%** for 8s
- Cooldown: 10s
- Star bonuses: +duration / +15% counterattack damage / +duration / Counter Defense for front row / +15% counterattack damage

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%

**Upgrade Priority:** Unyielding Heart (Tactics) > HP Boost (Passive) > Forward Rush (Auto)

---

### 3.16 Adam — Titan

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Missile Vehicle |
| Role | Defender |
| Damage | Physical |
| Available | Day 85 |

**Skill 1: MK43 Vehicle-Mounted Machine Gun (Auto-Attack)**
- Base damage: **309.32% ATK** Physical
- Cooldown: 1.00s
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 2: Spike Armor (Passive)**
- Effect: Reduces all damage taken by front-row units by **13%**; effect is **doubled for Missile Vehicle heroes in Counter Defense state**
- Star bonuses: +1.5% per star (max 13% + 7.5% = 20.5% base at 5★; doubled = 41% in Counter Defense)

**Skill 3: Counter Defense (Tactics)**
- Effect: Enters Counter Defense state for 8.8s; auto-counterattacks upon taking damage (max once per second)
- Cooldown: 10s
- Star bonuses: +duration / +15% counterattack damage / +duration / front-row allies also get Counter Defense / +15% counterattack damage

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%

**Upgrade Priority:** Counter Defense (Tactics) > Spike Armor (Passive) > MK43 (Auto)

---

### 3.17 Fiona — Lion Cub

| Field | Value |
|-------|-------|
| Type | UR |
| Formation | Missile Vehicle |
| Role | Attacker |
| Damage | Physical |
| Available | Day 99 |

**Skill 1: Double Trajectory (Auto-Attack)**
- Base damage: **408.11% ATK** Physical
- Cooldown: 1.35s
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 2: Ballistic Boost (Passive)**
- Effect: Boosts hero's Physical Damage by **+30%** in battle
- Star bonuses: +3% per star (max 45% at 5★)

**Skill 3: Atomic Blast (Tactics)**
- Base damage: **718.17% ATK** Physical rocket hitting ALL enemies
- Cooldown: 10s
- EW effect: Leaves "Rocket Fuel" DoT on enemies: 5% ATK/s for 20s; stacks = Missile Vehicle count × 2 (max 10 stacks)
- Star bonuses: 30 / 70 / 120 / 185 / 270

**Skill 4: Super Sensing (Expertise)**
- Unlocks: 4★
- Effect: Self HP +20%, ATK +20%, DEF +20%, Skill Cooldown Rate +10%

**Upgrade Priority:** Atomic Blast (Tactics) > Double Trajectory (Auto) > Ballistic Boost (Passive)

---

### 3.18 Violet — SSR Tank (Poison)

| Field | Value |
|-------|-------|
| Type | SSR → UR (promotable) |
| Formation | Tank |
| Role | Attacker/Hybrid |
| Damage | Physical |

**Skill 1: Poison Frog Spray (Auto-Attack)**
- Base damage: **300.00% ATK** Physical (toxic gas, continuous spray)
- Cooldown: 1.60s
- Star bonuses: 20 / 45 / 70 / 100 / 150

**Skill 2: Z-Armor (Passive)**
- Effect: Reduces hero's damage from Monsters by **37%** in battle
- Star bonuses: +3% per star (max 52% at 5★)
- Note: PvE-focused; strong for monster hunting

**Skill 3: Poison Gas Corrosion (Tactics)**
- Base damage: **642.75% ATK** Physical targeting front 2 units
- Effect: Reduces target ATK by **6%** for 4s
- Cooldown: 9.00s
- Star bonuses: 20 / 45 / 70 / 100 / 150

**Skill 4: Special Tactics (Expertise / SSR version)**
- Effect: Self HP +10%, ATK +10%, DEF +10%
- Upgrades to UR Expertise (+20% / +20% / +20% + cooldown) after UR promotion

**Upgrade Priority:** Poison Frog Spray (Auto) first [reduces enemy damage], then Poison Gas Corrosion (Tactics)

> Note: Violet's skill upgrade priority is **unusual** — Auto-Attack is recommended first because it applies a damage-reduction debuff. This is an exception to the typical Tactics-first rule.

---

### 3.19 Scarlett — SSR Tank (Fire)

| Field | Value |
|-------|-------|
| Type | SSR → UR (promotable) |
| Formation | Tank |
| Role | Defender |
| Damage | Physical |

**Skill 1: Flame Burst (Auto-Attack)**
- Base damage: **155.10% ATK** Physical (flamethrower)
- Cooldown: 4.00s (very slow — likely AoE)
- Star bonuses: 20 / 45 / 70 / 100 / 150

**Skill 2: T-5 Armor (Passive)**
- Effect: Boosts self DEF by **+21%** in battle
- Star bonuses: +10% per star (max 21% + 50% = 71% at 5★ — ~uncertain, unusually large)

**Skill 3: Bastion Guard (Tactics)**
- Effect: Reduces damage from Monsters by **10.30%** for 7s after casting
- Cooldown: 9.00s
- Star bonuses: +5% damage reduction (stars 1, 3, 5); duration +1s (stars 2, 4)
- Max at 5★: ~25.30% monster damage reduction for 9s

**Skill 4: Special Tactics (Expertise / SSR version)**
- Effect: Self HP +10%, ATK +10%, DEF +10%

**Upgrade Priority:** Bastion Guard (Tactics) > T-5 Armor (Passive) > Flame Burst (Auto)

---

### 3.20 Sarah — SSR Aircraft (Support)

| Field | Value |
|-------|-------|
| Type | SSR → UR (promotable, Season 4) |
| Formation | Aircraft |
| Role | Support |
| Damage | ~unknown |

**Overview:** Sarah functions as a Marshall substitute in full Aircraft formations for PvE/monster-focused content. She enhances backline damage dealers by increasing their damage against monsters.

**Skill Structure (names ~uncertain, effects confirmed at a general level):**
- Tactics: Team ATK buff (similar to Command Strategy) — priority 1
- Passive: Squad survivability buff — priority 2
- Auto: Personal damage — priority 3

> **Missing data:** Sarah's exact skill names and percentages were not captured in sources scraped. Treat as placeholder pending in-game verification. Sources confirm: Tactics > Passive > Auto upgrade priority.

---

### 3.21 Venom — SSR (Poison/DoT)

| Field | Value |
|-------|-------|
| Type | SSR → UR (promotable) |
| Formation | ~unknown (likely Tank or Missile) |
| Role | Attacker (DoT focus) |

**Overview:** Venom deals damage over time via poison. Strong in long battles where poison stacks compound. Weaker in burst scenarios. Best in missions requiring sustained damage.

> **Missing data:** Exact skill names and percentages not captured from scraped sources.

---

### 3.22 Blaz — SR

| Field | Value |
|-------|-------|
| Type | SR |
| Formation | ~unknown |
| Role | Attacker |

**Overview:** Basic physical damage dealer with no standout utility. Low investment priority — outclassed at SR rarity.

> **Missing data:** Exact skills not captured.

---

### 3.23 Loki — SR Tank

| Field | Value |
|-------|-------|
| Type | SR |
| Formation | Tank |
| Role | Defender |

**Overview:** Early-game SR tank. Absorbs damage but quickly outclassed by UR defenders. Investment not recommended beyond early game.

> **Missing data:** Exact skills not captured.

---

### 3.24 Gump — SR Tank

| Field | Value |
|-------|-------|
| Type | SR |
| Formation | Tank |
| Role | Defender |

**Overview:** Standard SR defensive tank. Low cultivation priority. Not a long-term investment target.

> **Missing data:** Exact skills not captured.

---

### 3.25 Ambolt — SR Support

| Field | Value |
|-------|-------|
| Type | SR |
| Formation | ~unknown |
| Role | Support (minor healing) |

**Overview:** Minor healing support hero. Mainly useful in very early stages. No competitive role at higher levels.

> **Missing data:** Exact skills not captured.

---

### 3.26 Kane — SR Missile Attacker

| Field | Value |
|-------|-------|
| Type | SR |
| Formation | Missile Vehicle |
| Role | Attacker |

**Overview:** Minimal damage output with no support utility. Not recommended for resource investment if better missile options are available.

> **Missing data:** Exact skills not captured.

---

### 3.27 Monica — SSR Support

**Overview:** Support hero with PvE damage focus.
- **Skill priority:** Passive (Bottom-Left) > Tactics > Auto — unusual for a support
- Reason: Her Passive boosts anti-monster damage which is her primary role

> **Missing data:** Exact skill names and percentages not captured.

---

### 3.28 Richard — ~unknown

> **Missing data:** Richard appears on the hero roster at lastwar-guide.org but no build or skill data was found in scraped sources.

---

## SECTION 4: Upgrade Priority Guide

### 4.1 Universal Skill Priority Framework

**General rule by hero role:**

| Role | Priority Order | Reason |
|------|---------------|--------|
| Tank/Defender | Tactics > Passive > Auto | Tactics provides team defense; Passive provides self-sustain; Auto is last |
| DPS/Attacker | Tactics > Auto > Passive | Tactics = highest damage spike; Auto = sustained DPS; Passive = flat % |
| Support | Tactics > Passive > Auto | Tactics = team buff; Passive = secondary buff; Auto = irrelevant |
| Exceptions | Violet: Auto > Tactics; Monica: Passive > Tactics | Role-specific mechanics override general rule |

**Expertise (4th skill):** Does not consume medals. Unlock by reaching 4★. Priority is therefore — reach 4★ as soon as feasible.

---

### 4.2 Skill Level Milestones and ROI

| Level Milestone | Medal Cost (UR, cumulative) | ROI Assessment |
|-----------------|--------------------------|---------------|
| L1→L5           | 1,200                    | Very high — low cost, first star tier bonus |
| L5→L10          | 4,000 additional (5,200 total) | High — second star tier bonus at L10 |
| L10→L20         | 52,400 additional (57,600 total) | High — largest jump in base effect values |
| L20→L30         | 164,400 additional (222,000 total) | Medium — significant but expensive |
| L30→L40         | 350,000 additional (572,000 total) | Low ROI — costs nearly double the entire L1-L30 investment; requires EW |

**Key insight:** The cost curve after L30 is brutal. Levels 31–40 cost 1.58× the total cost of levels 1–30. Reserve L31+ investment for your absolute primary hero only.

---

### 4.3 Skill vs Gear vs Hero Level ROI

Based on community consensus from multiple guides:

| Upgrade Type | ROI (Early) | ROI (Mid) | ROI (Late) | Notes |
|-------------|------------|----------|-----------|-------|
| Skill levels 1–10 | Very High | Very High | High | Unlock star-gated effects cheaply |
| Skill levels 11–20 | High | High | Medium | Good power/cost ratio |
| Skill levels 21–30 | Medium | Medium | Low | Expensive; ensure star rank first |
| Hero Leveling | Medium | Low | Low | Stat gains are smaller than skill gains per resource |
| Star Rank | High | High | High | Gate-unlock for skill caps + Expertise; always worth pursuing |
| Gear | Medium | High | High | Becomes dominant in mid-late game |
| Skill levels 31–40 | N/A | N/A | Low | Requires EW; extreme cost |
| Wall of Honor | N/A | Medium | High | Passive, cumulative; no cap |

---

### 4.4 Squad-Level Strategy

**Recommended level gaps between skills within one hero:**
- Keep primary and secondary skills within **5–10 levels** of each other
- If primary skill is L15, bring secondary to L10–15 before pushing further

**Recommended gap between main squad and secondary squad:**
- Main squad skills: ~10 levels ahead of secondary squad
- Example: Main squad at L20 → secondary squad at L10–15

---

### 4.5 Medal Refund Policy

When an SSR hero is promoted to UR (Mason, Violet, Scarlett, Sarah, Venom):
- **All skill medals are refunded** in full
- This makes pre-promotion SSR investment risk-free
- Invest in SSR heroes freely knowing you'll recoup the medals

---

### 4.6 Prioritized Hero Investment Order (Pre-S6 Meta)

**Tank formation:**
1. Kimberly (S-tier AoE carry; Awakening Week 1)
2. Murphy (best pure tank; foundation of defensive meta)
3. Williams (best damage reduction; team-wide DEF)
4. Marshall (support upgrade priority; Command Strategy first)
5. Mason (after UR promotion; medals refund)

**Aircraft formation:**
1. DVA (burst damage carry; Awakening Week 3)
2. Lucius (mandatory frontline anchor)
3. Carlie (second frontline)
4. Morrison (DPS; Armor-Piercing Shot priority)
5. Schuyler (situational; lowest medal priority in aircraft)

**Missile formation:**
1. Adam (mandatory front-row; Counter Defense enables Spike Armor doubling)
2. Fiona (primary damage carry)
3. Tesla (precision energy DPS; S-tier post-Awakening Week 5)
4. McGregor (second frontline)
5. Swift (finisher/execution role)

---

### 4.7 Formation Bonus

Running 5 heroes of the **same formation type** (all Tank, all Aircraft, or all Missile) grants:
- **+20% HP, ATK, and DEF** for the entire squad (~estimated: confirmed as "mono-type bonus")
- Running 4 of same + 1 flex: reduced bonus (~35% effective vs 44% with full mono)
- This makes mono-formation investment substantially more efficient than mixed teams

---

## APPENDIX A: Data Confidence Summary

| Data Point | Confidence | Source |
|------------|-----------|--------|
| Full EXP table L1–L150 | Confirmed | lastwar.wiki |
| HQ level → Hero level cap | Confirmed | lastwar.wiki, lastwarvault |
| Skill medal costs L1–L30 | Confirmed | lastwar.wiki, theriagames (2 sources agree) |
| Skill medal costs L31–L40 | Confirmed | lastwar.wiki |
| Star rank shard costs | Confirmed | multiple sources |
| Skill level caps per star | Confirmed | grindnstrat.com |
| EW → skill cap unlock tiers | Confirmed | grindnstrat.com |
| Expertise unlock at 4★ | Confirmed | multiple sources |
| Expertise effect values (UR: +20%) | Confirmed | multiple sources |
| Hero skill base %s (UR heroes) | Confirmed (individual) | theriagames, heaven-guardian per hero |
| Star bonus scaling (30/70/120/185/270) | Confirmed | multiple heroes, consistent pattern |
| EXP item values | ~estimated | No confirmed source found |
| BP per hero level | UNKNOWN | No source found — needs in-game testing |
| BP per skill level | UNKNOWN | No source found — needs in-game testing |
| Per-level effect scaling (skill L1–L30) | UNKNOWN | No source documents intermediate values |
| Universal ATK/HP/DEF per level | UNKNOWN | No source found — hero-specific only |
| Sarah/Venom/Blaz/Loki/Gump/Ambolt/Kane exact skills | UNKNOWN | Not captured in any accessible source |

---

## APPENDIX B: Known Data Gaps for Calculator

The following data points are required for a complete power calculator but were NOT found in any scraped source:

1. **Exact BP value per hero level** — needs in-game screenshot at L1 vs L2
2. **Exact BP value per skill level** — needs in-game comparison at SL1 vs SL2
3. **Per-level skill effect interpolation** — what % does Cannon Fire do at skill L7 vs L14 vs L22? (only star-tier jumps are documented)
4. **EXP item exact values** — what is "Hero EXP I/II/III/IV" worth exactly?
5. **Training Base EXP output rate** — per hour/per minute at each building level
6. **Hero base ATK/HP/DEF at L1, L50, L100** — per hero, for stat growth formula derivation
7. **SR hero skill data** — Blaz, Loki, Gump, Ambolt, Kane exact skills not found
8. **Sarah/Venom exact skill percentages** — only role descriptions found
9. **Farhad, Richard, Maxwell, Cage, Elsa exact skills** — these heroes exist but no guides found

---

*Document compiled from web research on 2026-07-12. All "confirmed" data should still be cross-validated against current in-game values as game patches may alter numbers. "~estimated" values require in-game verification before use in a power calculator.*
