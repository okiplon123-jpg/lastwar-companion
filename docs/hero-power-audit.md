# Hero Power — Kompletny Audyt Knowledge Database

**Zasada:** "gotowe" = każdy wiersz ma status + dowód z pliku JSON.  
**Data:** odczytane z surowych danych, nie z pamięci sesji.

---

## Definicja hero power w compute.ts

Compute.ts oblicza 6 wartości:
- `heroHpPct`, `heroAtkPct`, `heroDefPct` — % bonusy do HP/ATK/DEF bohatera (stat_ids: 75050/75150/75250)
- `heroFlatHp`, `heroFlatAtk`, `heroFlatDef` — flat addytywne HP/ATK/DEF bohatera (stat_ids: 50005/50008/50010)
- Plus: `droneFlatHp/Atk/Def`, `ewFlatHp/Atk/Def`, troop ATK/DEF/HP%, economy stats

---

## Status każdego pliku (42 pliki)

### WIRED — podłączone do compute.ts

| Plik | Co daje | Dowód z danych | Gdzie w compute.ts |
|---|---|---|---|
| `vip_levels.json` | hero_hp_pct/atk_pct/def_pct (0.025–0.125) | `records[9].hero_hp_pct = 0.025` (VIP 10) | Step 4 |
| `aps_research_levels.json` | stat_id 75050/75150/75250, 195 records | `records[0].stat_id=75150, stat_value=0.02` | Step 16 |
| `season_military_rank.json` | hp_pct, atk_pct, def_pct per rank | `records[0].hp_pct` field present | Step 5 |
| `decorations.json` | effect_gain → hero HP/ATK/DEF% | `records[0].effect_gain` field | Step 7 |
| `decoration_building_levels.json` | EW flat HP/ATK/DEF | cumulative per tier/progress | Step 8 |
| `ew_weapon_units.json` | hero_id + unit skill_level | `records[0].hero_id` field | Step 12 |
| `ew_weapon_levels.json` | hero_id + flat HP/ATK/DEF per level | `records[0].hero_id` field | Step 12 |
| `ew_weapon_effects.json` | effect bonuses per group/level | `records[0].group, level` | Step 12 |
| `gear_stats.json` | heroFlatHp/Atk/Def + heroHpPct/AtkPct/DefPct per quality/slot/level | `"legendary_Cannon".levels["1"].heroFlatAtk=895.87` | Step 15 |
| `hero_honor_levels.json` | class_1_hp through class_4_hp flat HP per hero class | `records[0].class_1_hp` field | Step 6 |
| `hero_skill_groups.json` | hero_id → group_id mapping | `records[0].hero_id, group_id` | Step 14 |
| `skill_group_bonuses.json` | hp_pct/atk_pct/def_pct per group/stars | `records[0].hp_pct, atk_pct, def_pct` | Step 14 |
| `uav_levels.json` | hp_flat/atk_flat/def_flat drone stats | `records[0].hp_flat, atk_flat, def_flat` | Step 11 |
| `hero_name_to_id.json` | lookup ID→name | helper only | lookup |

### NIEISTOTNE — brak hero power statów (potwierdzone z danych)

| Plik | Klucze/stat_ids | Powód odrzucenia |
|---|---|---|
| `alliance_tech_levels.json` | stat_id=90015 | 0 rekordów z stat_id w {75050,75150,75250,50005,50008,50010} |
| `alliance_tech_nodes.json` | metadata | brak stat_ids |
| `aps_research_nodes.json` | metadata | brak stat_ids |
| `aps_science_research.json` | metadata | brak records |
| `aps_science_research_flat.json` | science_id, name, tab | metadata/nazwy, brak wartości |
| `battle_cards.json` | metadata | brak records |
| `battle_cards_flat.json` | card_id, type, color, rarity | brak hero stat_ids |
| `buildings.json` | id, max_level, build_type | brak hero statów (to jest lista budynków, nie bonusy) |
| `decoration_names.json` | id, name | lookup only |
| `gear_items.json` | id, slot, quality, army_type | metadata gear items |
| `gear_upgrade.json` | id, slot, quality, highest_level | koszty ulepszania, brak statów |
| `mastery.json` | metadata | brak records |
| `mastery_flat.json` | mastery_id, effects | 0 rekordów z hero stat_ids w effects |
| `military_rank.json` | metadata | brak records |
| `military_rank_flat.json` | require_hero_lv | wymagania poziomu, brak bonusów |
| `research_nodes.json` | metadata | brak stat_ids |
| `troops.json` | id, type, quality, power | statsy jednostek, nie bohaterów |

### POTWIERDZONE BUGI — naprawione w tej sesji

| Bug | Plik | Fix |
|---|---|---|
| UAV sumowanie rekordów cumulative jako incremental → 2.97B HP | `uav_levels.json` | Zamiast sumowania: lookup `level === uavLevel && sub_level === 0` (wartości cumulative) |
| Honor Level etykieta `"Honor Lv600: Kimberly"` nie pasuje do `startsWith("Kimberly")` → honor pomijany w heroAbsoluteStats | `compute.ts` step 9 | Zmiana etykiety na `"${hero.name}: Honor Lv${level}"` |
| heroAbsoluteStats globalFlat brała Building contributions wszystkich Centers (Tank+Air+Missile) dla każdego bohatera | `compute.ts` step 16 | Filter: HQ (dla wszystkich) + Center pasujący do type bohatera (Tank/Air/Missile) |

### NIEZNANE — brak źródła w danych

| Contributor (z gry) | Kimberly wartość | Status |
|---|---|---|
| Premia Drona (flat hero HP) | 927,397 HP | UNKNOWN — nie znaleziono w drone_levels.json, uav_levels.json, drone_chip_attributes.json |
| Dron % bonus (hero ATK/HP/DEF%) | +5%/+5.5% | UNKNOWN |
| Wzmocnienie treningu Władcy | 33,095 HP, 976 ATK | UNKNOWN |
| Urzędnicy (Officials) | 0% | UNKNOWN |

---

### LUKI — podłączone częściowo lub wcale

| Plik | Co zawiera | Problem | Priorytet |
|---|---|---|---|
| `drone_chip_attributes.json` | stat_ids 50081/50082/50083 (drone HP/ATK/DEF), 1200 rekordów | Profil ma `chipSets[4]` ale compute.ts nie oblicza wartości chipów | WYSOKI |
| `drone_levels.json` | hp/atk/def per component tier (7 tierów, 900 rekordów) | Profil ma `componentLevels[6]` ale compute.ts ignoruje składniki drona | WYSOKI |
| `gear_promote.json` | level, cost_resource, cost_items | Tylko koszty — BRAK statów po promocji (lv41+). Profil ma `stars` w HeroGearSlot ale gear_stats.json ma max_level=41. Brak danych o bonusach post-41. | NIEZNANY — dane mogą nie istnieć |
| `hero_awaken_ranks.json` | fix_power (stały wkład w power), attr_add (unresolved) | fix_power to STAŁY POWER (nie HP/ATK/DEF%). Jeśli app ma liczyć total power score — brakuje. | ZALEŻY od celu aplikacji |
| `hero_base.json` | base_hp/atk/def dla każdego bohatera | Potrzebne tylko do obliczania absolutnych statów. Compute.ts liczy % bonusy, nie absolutne wartości. | ZALEŻY od celu |
| `hero_levels.json` | stat_mult_t1/t2 per level | Mnożnik poziomu — potrzebny do absolutnych statów | ZALEŻY od celu |
| `hero_stars.json` | attr_ratio per rank | Mnożnik gwiazdek — potrzebny do absolutnych statów | ZALEŻY od celu |
| `heroes_levelup.json` | lv_attr_atk/def/hp increments | Przyrosty per level — potrzebne do absolutnych statów | ZALEŻY od celu |
| `research_levels.json` | stat_id, stat_value per level | Duplikat danych z research-data.json (XAPK extract). Sprawdzić czy pokrywa te same węzły. | DO SPRAWDZENIA |
| `military_centers.json` | building_id, army_type, level, stats | Może pokrywać się z buildings-data.json (Military Centers). Sprawdzić. | DO SPRAWDZENIA |

---

## Otwarte pytania (wymagają decyzji, nie danych)

1. **Czy compute.ts ma obliczać absolutne staty bohatera?**  
   Jeśli TAK → `hero_base.json` + `hero_levels.json` + `hero_stars.json` + `heroes_levelup.json` muszą być podłączone.  
   Jeśli NIE (tylko % i flat bonusy) → te pliki są zbędne.

2. **Czy składniki drona (components + chips) mają wpływać na droneFlatHp/Atk/Def?**  
   Jeśli TAK → `drone_levels.json` + `drone_chip_attributes.json` + mapping stat_id→drone stat muszą być podłączone.

3. **Czy hero_awaken_ranks.fix_power ma być uwzględniony?**  
   To nie jest HP/ATK/DEF bonus — to stały wkład do power score. Zależy od tego co aplikacja ma pokazywać.

---

## Jak używać tego pliku

Na początku każdej sesji: przeczytaj ten plik zanim powiesz "gotowe".  
Przed zamknięciem sesji: zaktualizuj statusy jeśli coś się zmieniło.
