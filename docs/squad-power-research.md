# Last War: Survival — Squad Power Research
> Kompleksowe badanie wszystkich czynników wpływających na moc squadów
> Źródła: in-game UI, community wikis, Reddit, lastwartutorial.com

---

## 1. STRUKTURA SQUADU

Squad = do **5 bohaterów** + **1 dron** wspólny dla wszystkich zestawów.

Moc squadu (Battle Power) = Σ(moc każdego bohatera) + moc drona

---

## 2. BOHATEROWIE — CO WPŁYWA NA MOC

### 2.1 Rzadkość (Rarity)
| Rzadkość | Kolor | Baza mocy | Uwaga |
|----------|-------|-----------|-------|
| SR       | Niebieski | Najniższa | Podstawowi bohaterowie |
| SSR      | Fioletowy | Średnia | Awansowalni do UR przez sezony |
| UR       | Złoty | Najwyższa | Top tier |

SSR → UR awans (promotable heroes: Mason, Violet, Scarlett, Sarah, Venom, Blaz) — po awansie moc jak UR.

### 2.2 Poziom bohatera (Hero Level)
- Max poziom zależy od liczby gwiazdek (stars) — patrz tabela poniżej
- Każdy poziom += ~liniowy przyrost mocy
- Bohater musi być odblokowany (owned: true) żeby liczyć do mocy

| Gwiazdki | Max poziom |
|----------|-----------|
| 1★ | 30 |
| 2★ | 60 |
| 3★ | 80 |
| 4★ | 100 |
| 5★ | 120 |

### 2.3 Gwiazdki (Stars) — odblokowanie przez odłamki (shards)
| Gwiazdka | Koszt odłamków | Łącznie |
|----------|---------------|---------|
| 1★ → 2★ | 25 | 25 |
| 2★ → 3★ | 50 | 75 |
| 3★ → 4★ | 100 | 175 |
| 4★ → 5★ | 300 | 475 |
| 5★ (max) | 500 | 975 |

Gwiazdki dają: +odblokowanie poziomów + znaczny % boost mocy (gwiazdka to największy skok mocy poza ekwipunkiem UR).

### 2.4 Umiejętności (Skills)
Każdy bohater ma **4 umiejętności** (1 aktywna + 3 pasywne):
- Levelowanie umiejętności: Skill Medals (medale umiejętności)
- Max poziom każdej umiejętności: 5
- Wpływ na moc: każdy poziom umiejętności += mała ilość mocy
- Ważniejszy jest **efekt bojowy** niż liczba power points

### 2.5 Ekwipunek (Gear) — 4 sloty na bohatera
Sloty: **Cannon** (Działo) | **Chip** (Czip) | **Armor** (Pancerz) | **Radar** (Radar)

#### Jakość ekwipunku (GearQuality):
| Jakość | Kolor | Tier |
|--------|-------|------|
| none | Szary | Brak — 0 mocy |
| common | Biały | Tier 1 |
| rare | Niebieski | Tier 2 |
| epic | Fioletowy | Tier 3 |
| legendary | Złoty/Pomarańczowy | Tier 4 — MAX |

**Skok mocy między jakościami jest ogromny** — legendary jest wielokrotnie silniejsze niż epic.

#### Poziom ekwipunku (0–40):
- Poziomowanie: zużywa materiały (Armament Materials / Armament Cores)
- Każdy poziom += mała ilość mocy
- Poziom 40 = cap — potem odblokowanie gwiazdek

#### Gwiazdki ekwipunku (post-level 40):
- Dostępne tylko na legendary gear (orangowy)
- Gwiazdki 0–5 po osiągnięciu poziomu 40
- Każda gwiazdka = duży skok mocy
- **Gwiazdkowanie legendary gear to najefektywniejsze źródło mocy** w grze

#### Rekomendacje slotów (z kodu):
| Rola | Priorytetowe sloty |
|------|-------------------|
| Attacker | Cannon + Chip |
| Defender | Armor + Radar |
| Support | Armor + Radar |

---

## 3. TYPY JEDNOSTEK I TRÓJKĄT ZALEŻNOŚCI

### 3.1 Trójkąt kontrowania:
```
     Tank
    /    \
Aircraft  Missile
    \    /
```
- **Tank** kontruję **Missile** (Missile bierze 80% więcej obrażeń od Tanku)
- **Missile** kontruję **Aircraft**
- **Aircraft** kontruję **Tank**

### 3.2 Typy bohaterów a typ oddziałów:
Każdy bohater buffuje **swój typ oddziału** w polu bitwy:
| Typ | Buffuje |
|-----|---------|
| Tank heroes | Czołgi (Tank troops) |
| Aircraft heroes | Lotnictwo (Air troops) |
| Missile heroes | Rakiety (Missile troops) |

Optymalny squad: **dopasuj typ bohaterów do składu wojsk**.

---

## 4. BONUSY FORMACJI (Formation Bonuses)

Wymagają odblokowania przez: **City Clash Capitol** conquest.

| Skład squadu | Bonus do mocy |
|-------------|--------------|
| 3 bohaterów tego samego typu | +5% |
| 3 same + 2 różne | +10% |
| 4 tego samego typu | +15% |
| 5 tego samego typu | +20% |

**Wniosek:** Pełny squad jednego typu (5×Tank / 5×Aircraft / 5×Missile) = +20% bonus na całą moc squadu.

---

## 5. DRON — WSZYSTKIE ŹRÓDŁA MOCY

Dron jest **wspólny dla wszystkich 4 zestawów chipów** i całego profilu gracza.

### 5.1 Poziom drona (Drone Level 1–250)
- Każdy poziom += bazowa moc drona
- Milestone levels: 50, 100, 150, 200, 250 (większe skoki)
- Max level 250 = bardzo duży contributor do mocy

### 5.2 Combat Boost (Wzmocnienie Bojowe)
Odblokowania:
| Poziom CB | Efekt | Co odblokowuje |
|-----------|-------|----------------|
| 10 | Odblokowuje 1. zestaw chipów | Set 1 |
| 150 | Odblokowuje 2. zestaw chipów | Set 2 |
| 300 | Odblokowuje 3. zestaw chipów | Set 3 |
| 900+ | 4. zestaw chipów (diamenty?) | Set 4 |

Każdy poziom Combat Boost += moc + % boost do statystyk drona.

### 5.3 Komponenty drona (6 komponentów)
| # | Nazwa | Ikona | Pozycja |
|---|-------|-------|---------|
| 0 | Thermal Scope (Zakres Termiczny) | 🔭 | Lewy górny |
| 1 | Turbo Engine (Silnik Turbo) | ⚡ | Lewy środek |
| 2 | External Armor (Pancerz Zewnętrzny) | 🛡 | Lewy dolny |
| 3 | Radar | 📡 | Prawy górny |
| 4 | Fuel Cell (Ogniwo Paliwowe) | 🔋 | Prawy środek |
| 5 | Airborne Missile (Pocisk Powietrzny) | 🚀 | Prawy dolny |

Każdy komponent ma **osobny poziom** (nie ma globalnego max — rośnie z zasobami).
Każdy poziom komponentu += moc + specyficzny bonus (np. Armor → HP oddziałów, Turbo Engine → prędkość marszy).

### 5.4 Zestawy chipów (4 Chip Sets) — KLUCZOWE DLA MOCY BOJOWEJ

Każdy zestaw ma **4 sloty chipów**:

| Slot | Nazwa PL | Efekt |
|------|----------|-------|
| **Initial** (Inicjujący) | Aktywuje zestaw | Ogólny boost mocy całego zestawu |
| **Attack** (Atak) | Chip ataku | Atak oddziałów danego typu (Tank/Aircraft/Missile) |
| **Defense** (Obrona) | Chip obrony | HP i obrona oddziałów danego typu |
| **Interference** (Zakłócanie) | Chip zakłócania | Debuff wrogów / redukcja obrony wroga |

#### Rzadkość chipów:
| Rzadkość | Kolor | Moc |
|----------|-------|-----|
| SSR | Fioletowy | Bazowa |
| UR | Złoty/Pomarańczowy | ~2–3× silniejszy niż SSR |

#### Typ jednostki chipa:
Każdy chip jest dedykowany typowi: **Tank / Aircraft / Missile**

**Zasada:** chip Tank buffuje TYLKO oddziały czołgowe. Chip musi pasować do składu wojsk i bohaterów w squadzie.

#### Optymalny zestaw:
- Wybierz **jeden typ** dla całego zestawu (np. wszystkie 4 chipy = Tank)
- UR > SSR pod każdym względem
- Wszystkie 4 sloty wypełnione = max moc zestawu

---

## 6. TIERY WOJSK — MOC I WARTOŚĆ

### 6.1 Wartość bojowa trupów per tier:
Dane z VS Day "Enemy Slayer" (punkty za zabicie przez rywala):

| Tier | VS punkty za zabitego | Względna siła |
|------|-----------------------|---------------|
| T1 | 25 | 1.0× |
| T3 | 45 | 1.8× |
| T5 | 75 | 3.0× |
| T8 | 108 | 4.3× |
| T10 | 138 | 5.5× |

**T10 jest ~5.5× bardziej wartościowy niż T1.**

### 6.2 Wymagania do odblokowania tierów (koszarów):
| Poziom koszar | Max tier |
|---------------|----------|
| 1 | T1 |
| 4 | T2 |
| 6 | T3 |
| 10 | T4 |
| 14 | T5 |
| 17 | T6 |
| 20 | T7 |
| 24 | T8 |
| 27 | T9 |
| 30 | T10 |

### 6.3 Punkty za trening:
| Tier | VS punkty za 1 żołnierza |
|------|--------------------------|
| T1 | 46 |
| T3 | 94 |
| T5 | 130 |
| T8 | 202 |
| T10 | 258 |

---

## 7. RESEARCH — WPŁYW NA MOC SQUADÓW

### 7.1 VS Tech Research (Technologia VS)
| Poziom | Mnożnik VS punktów | Efekt bojowy |
|--------|--------------------|--------------|
| 0 | ×1.0 | Brak |
| I | ×1.1 | +10% |
| II | ×1.2 | +20% |
| III | ×1.35 | +35% |
| IV | ×1.5 | +50% |
| V | ×1.75 | +75% |
| VI | ×2.0 | +100% (2×) |

Uwaga: VS Tech wpływa na punkty VS Day, **niekoniecznie bezpośrednio na moc squadu** w liczbach — ale zwiększa efektywność bojową przez lepsze bonusy.

### 7.2 Military Research Tree (szacunki):
Typowe buffsy z drzewka militarnego Last War:
- **Troop ATK** +X% (czołgi / lotnictwo / rakiety osobno)
- **Troop HP** +X%
- **Troop DEF** +X%
- **March Speed** +X%
- **Troop Capacity** +X (więcej wojsk w marszu)
- **Rally ATK** +X% (bonus do ataków sojuszniczych)

### 7.3 Alliance Research:
Globalny bonus dla wszystkich członków sojuszu:
- **allianceResearchDone: true** w profilu = wszystkie bonusy aliansu aktywne
- Typowe: +% ATK, +% DEF, +% HP wszystkich typów

---

## 8. VIP I HQ — WPŁYW NA MOC

### 8.1 HQ Level (1–35):
- Wyższe HQ odblokuje wyższe budynki
- Budynki → wyższe tiery wojsk (koszary) → wyższa moc
- HQ 30+ = T10 dostępne = max tier wojsk

### 8.2 VIP Level — bonusy do prędkości (wpływ pośredni):
| VIP | Budowa | Research |
|-----|--------|----------|
| 1 | +2% | +2% |
| 5 | +16% | +14% |
| 10 | +40% | +35% |
| 15 | +50% | +45% |
| 18 | +50% | +45% |

VIP nie daje bezpośrednio mocy bojowej, ale przyspiesza rozbudowę → szybciej wyższy poziom budynków/research.

---

## 9. FORMUŁA MOCY SQUADU (szacunkowa)

```
Squad Power = Σ(Hero_i Power) + Drone Power + Formation Bonus

Hero_i Power = Base_Rarity × Level_Mult × Stars_Mult × Gear_Total
  gdzie:
    Base_Rarity: SR=1.0, SSR=2.0, UR=4.0 (szacunki)
    Level_Mult: liniowy wzrost z poziomem
    Stars_Mult: mnożnik per gwiazdka (największy skok)
    Gear_Total = Σ(slot_j: Quality_Mult × Level_Bonus × Stars_Bonus)

Drone Power = DroneLevel × CB_Mult × Components_Sum + Chips_Power

Formation Bonus = 0% / 5% / 10% / 15% / 20% (patrz tabela)
```

### Priorytety inwestycji (od najefektywniejszego):
1. 🥇 **Gwiazdki legendary gear** (post-40 stars) — największy ROI
2. 🥈 **Awans bohaterów do wyższych gwiazdek** (★ upgrades)
3. 🥉 **Jakość gear: epic → legendary** na all 4 slotach
4. 🏅 **UR chipy** zamiast SSR — 2-3× lepsza moc
5. 🎖 **Poziom komponentów drona** (szczególnie Thermal Scope i Airborne Missile)
6. ⭐ **Poziom Combat Boost** (odblokowanie kolejnych chip setów)
7. 📈 **Tier wojsk T10** > niższe tiery
8. 🔬 **Military Research** (ATK/HP/DEF bonusy)
9. 🤝 **Alliance Research** (globalne bonusy)

---

## 10. CHIP TYPE vs SQUAD COMPOSITION — MATRYCA

| Chip type \ Squad type | Tank squad | Aircraft squad | Missile squad |
|-----------------------|-----------|---------------|---------------|
| Tank chip | ✅ Optimal | ❌ Wasted | ❌ Wasted |
| Aircraft chip | ❌ Wasted | ✅ Optimal | ❌ Wasted |
| Missile chip | ❌ Wasted | ❌ Wasted | ✅ Optimal |

**Zasada:** typ chipa MUSI pasować do typu oddziałów w squadzie.

Jeśli masz mieszany squad (np. 3×Tank + 2×Aircraft):
- Użyj Tank chipów (większość squadu = Tank)
- Lub rozważ dwa oddzielne zestawy chipów w różnych setach

---

## 11. CO JESZCZE WARTO DODAĆ DO KALKURLATORA

### Brakujące dane (do uzupełnienia z in-game screenshotów):
- [ ] Dokładne wartości mocy per poziom gear (1-40)
- [ ] Dokładne wartości mocy per gwiazdka gear (post-40)
- [ ] Dokładne wartości mocy per poziom bohatera
- [ ] Wartości bonusów chipów SSR vs UR (procentowo)
- [ ] Dokładne wartości mocy per poziom komponentu drona
- [ ] Wartości bonusów z specific research nodes
- [ ] Moc bazowa każdego bohatera per rarity

### Potwierdzone formuły (community):
- Formation bonus: MNOŻNIKOWY (stosuje się do całej sumy mocy)
- Counter triangle: victim bierze ×1.8 (80% extra dmg) od kontrującego
- Chip buff: Addytywny do base ATK/DEF/HP odpowiedniego tieru wojsk

---

---

## 12. EKSKLUZYWNE BRONIE (Exclusive Weapons)

### 12.1 Czym są?
Ekskluzywna broń to **osobny system** — NIE jest 5. slotem gear. Każdy bohater ma swoją unikalną broń (np. Murphy → "Mitigation Master", D.Va → "Energy Master", Tesla → "Inductive Current"). Bronie **nie są wymienne** między bohaterami.

### 12.2 Wymagania odblokowania
- Bohater musi mieć **5 gwiazdek (5★)** — ekskluzywna broń nie jest dostępna wcześniej
- Odblokowanie: **50 shardów** dedykowanych danemu bohaterowi

### 12.3 Dwa typy shardów:
| Typ | Opis |
|-----|------|
| **Named shards** | Tylko dla konkretnego bohatera |
| **Universal EW shards** | Można użyć na dowolnego bohatera |

### 12.4 Koszt shardów — tabela poziomów 1–30:
| Poziomy | Shardy na poziom | Łącznie |
|---------|-----------------|---------|
| 1 (odblokowanie) | 50 | 50 |
| 2–4 | 20 każdy | 110 |
| 5–9 | 40 każdy | 310 |
| 10–14 | 60 każdy | 610 |
| 15–19 | 100 każdy | 1 110 |
| 20–24 | 150 każdy | 1 860 |
| 25–30 | 200 każdy | **~3 060 łącznie** |

Kluczowe milestony: **~1 130 shardów do Lv.20**, **~2 880–3 060 do Lv.30**.

### 12.5 System po Lv.30 — ścieżki ATK/HP/DEF:
Po osiągnięciu Lv.30 otwierają się 3 oddzielne tory ulepszania:
- **ATK**: 10 shardów/poziom (odblokowanie pierwsze)
- **HP**: odblokowanie po ATK Lv.10, 10 shardów/poziom
- **DEF**: odblokowanie po HP Lv.10, 10 shardów/poziom
- Co 50 poziomów w każdym torze: dodatkowy milestone bonus

### 12.6 Kluczowe milestony mocy:

| Milestone | Efekt |
|-----------|-------|
| **Lv.1** | Bazowy buff statów + specjalny atak automatyczny |
| **Lv.10** | Znacząca poprawa skalowania skilla Tactics |
| **Lv.20** | **+7.5% ATK, HP i DEF dla WSZYSTKICH bohaterów tego samego typu** w formacji (nie tylko właściciela!) |
| **Lv.30** | Ultimate upgrade skilla Tactics |

> ⭐ **Lv.20 to "meta sweet spot"** — bonus +7.5% do całej drużyny tego samego typu (Tank/Aircraft/Missile), nawet bohaterów bez własnej ekskluzywnej broni.

### 12.7 Interakcja z umiejętnościami:
Co 3 poziomy ekskluzywnej broni = **+1 poziom umiejętności** powyżej normalnego cap (Lv.30).
- Broń Lv.30 → umiejętności mogą osiągnąć **Lv.40** (max dla UR)
- Bez ekskluzywnej broni: max umiejętności = Lv.30 (przy 5★)

### 12.8 Wkład w Battle Power:
| Etap | Przyrost BP |
|------|-------------|
| Odblokowanie (Lv.1) | ~+0.3M |
| Lv.10 | ~+0.3M |
| Lv.20 | ~+0.3M |
| Lv.30 | ~+0.3M |
| **Razem Lv.30** | **~+1.2M BP** |

### 12.9 Skąd brać shardy:
- Battle Pass (Tygodnie 1, 3, 5 sezonu)
- Black Market (Tydzień 8)
- VS Day — **Czwartek "Trenuj bohaterów"** (najlepsza farma shardów)
- Kingdom Clash, Alliance War, Choice Chests
- Sezonowe eventy

---

## 13. UMIEJĘTNOŚCI BOHATERÓW — SZCZEGÓŁY

### 13.1 Struktura — 4 sloty na bohatera (tak samo dla wszystkich):

| Slot | Typ | Opis |
|------|-----|------|
| Lewy górny | **Auto-Attack** | Ataki bazowe ~co 1.5–1.6 sek. Skaluje się z poziomem (fizyczne lub energetyczne) |
| Prawy górny | **Tactics** | Aktywna zdolność ~co 10 sek. Największy burst (np. salwa rakiet, tarcza, AOE). **Najwyższy priorytet levelowania** |
| Lewy dolny | **Passive** | Zawsze aktywna. Zależnie od roli: reducja DMG (Defender), boost ATK (Attacker), buff/CD reduction (Support) |
| Prawy dolny | **Expertise** | **Odblokowanie przy 4★ TYLKO**. Stały bonus: **+20% HP, +20% ATK, +20% DEF, +10% CD Reduction** — ten sam dla wszystkich bohaterów |

### 13.2 Odblokowanie poziomów umiejętności przez gwiazdki:

| Gwiazdki | Max poziom umiejętności |
|----------|------------------------|
| 1★ | Lv.1 |
| 2★ | Lv.5 |
| 3★ | Lv.10 |
| 4★ | Lv.20 + Expertise odblokowuje |
| 5★ | Lv.30 + Wall of Honor |
| EW Lv.1–30 (tylko UR) | Lv.31–40 (+1 co 3 poziomy broni) |

### 13.3 Koszt medali umiejętności per poziom (na 1 umiejętność, 1 bohatera):

| Poziom | UR | SSR | SR |
|--------|----|-----|-----|
| 2–3 | 200 | 180 | 160 |
| 4–5 | 400 | 360 | 320 |
| 6–7 | 600 | 540 | 480 |
| 8–9 | 800 | 720 | 640 |
| 10 | 1 200 | 1 080 | 960 |
| 11 | 1 600 | — | — |
| 12 | 2 400 | — | — |
| 15 | 4 800 | — | — |
| 20 | 9 200 | 8 280 | 7 360 |
| 25 | 15 200 | — | — |
| 30 | 24 000 | 21 600 | 19 200 |
| 31–40 | Tylko UR + EW (koszt niepotwierdzony) | — | — |

### 13.4 Łączny koszt medali (1 bohater, 4 umiejętności):
| Rarity | Lv.1→30 (1 skill) | Lv.1→30 (4 skille) | Lv.1→40 (4 skille, UR) |
|--------|-------------------|--------------------|-----------------------|
| SR | ~301 440 | ~1.2M | — |
| SSR | ~331 440 | ~1.3M | — |
| UR | ~(brak potwierdzenia) | — | **~3.37M medali** |

> 🚨 Pełne maxowanie 1 UR bohatera = ~3.37M medali. Medale są bardzo cenne — priorytetyzuj Tactics > Passive > Auto-Attack > Expertise.

### 13.5 Ważne: refund medali przy awansie SSR → UR
Kiedy SSR bohater jest awansowany do UR, **wszystkie wydane medale wracają**. Można bezpiecznie levelować SSR bohaterów (Mason, Violet, Scarlett, Sarah, Venom, Blaz).

### 13.6 Czy umiejętności liczą się do Battle Power?
**TAK** — każdy poziom umiejętności podnosi widoczny BP. Formuła BP zawiera: Bohaterowie + Gear + Umiejętności + Dron + Research + Budynki + Dekoracje.

---

## 14. WALL OF HONOR (Ściana Chwały)

### 14.1 Wymagania odblokowania:
- Bohater musi osiągnąć **5★**
- Budynek odpowiedniego typu (koszary czołgów/lotnictwa/rakiet) musi być na **Lv.20**
- Po spełnieniu obu warunków: bohater automatycznie trafia do Wall of Honor

### 14.2 Jak działa:
- Wkładasz **dodatkowe shardy** tego bohatera (ponad 5★) aby poziomować jego wpis w Wall
- Daje globalne, permanentne bonusy dla CAŁEGO konta

### 14.3 Bonusy per 50 poziomów w Wall of Honor:
| Typ bohatera | Bonus | UR rate | SSR rate |
|-------------|-------|---------|---------|
| Większość UR bohaterów | +ATK lub +HP lub +DEF | +0.50% / 50 lvl | +0.25% / 50 lvl |
| Load heroes (Loki, Gump, Ambolt, Kane) | +Troop Load | +1.00% / 50 lvl | — |

Przykłady: Mason → +0.50% ATK, Violet → +0.50% HP, Marshall → +0.50% DEF (per 50 lvl w WoH).

> ⚠️ **Brak limitu poziomów** — Wall of Honor to teoretycznie nieskończona inwestycja długoterminowa.

---

## 15. HERO BONDS (Więzi Bohaterów)

Kiedy zrekrutujesz i rozwiniesz wymaganych bohaterów z jednej grupy "Bond", bonus **aktywuje się automatycznie** i daje **permanentne, pasywne buffy** dla całego squadu.

Typy bonusów: ATK%, DEF%, HP%, March Size (pojemność marszu).

> ✅ Więzi liczą się do widocznego Battle Power jako stałe bonusy konta.
> ℹ️ Dokładne składy grup więzi i wartości % nie są publicznie udokumentowane — dane z in-game screenshotów będą tu potrzebne.

---

## 16. DEKORACJE (Decorations / Decoration Gallery)

System permanentnych globalnych bonusów do statystyk wszystkich oddziałów i marszy:
- Odblokowanie: przez in-game achievements lub zakupy
- Działają na całe konto (wszystkie marsze, wszystkie squady)
- Wliczają się do Battle Power

---

## 17. VALOR BADGES — MILITARY RESEARCH

Valor Badges (Odznaki Waleczności) = waluta do Tech Center (Centrum Technologiczne):
- **NIE** są ekwipunkiem bohaterów
- Odblokowują gałęzie militarnego research:
  - Special Forces upgrades
  - Alliance Duel enhancements
  - Intercity Truck improvements
  - Siege warfare technologies
- Koszty: 50–100 badges (niższe) do 5 000–20 000 badges (elitarne)
- Źródła: Alliance VS eventy, Warzone VS, Glittering Market, zakupy

---

## 18. ZAKTUALIZOWANE PRIORYTETY INWESTYCJI

Od najefektywniejszego (ROI):

1. 🥇 **Gwiazdki legendary gear** (post-40 promotion stars) — największy BP skok
2. 🥈 **Ekskluzywna broń → Lv.20** (+7.5% buff dla całej drużyny tego typu)
3. 🥉 **5★ awans bohaterów** (odblokowuje Expertise +20% HP/ATK/DEF)
4. 🏅 **Jakość gear: epic → legendary** na 4 slotach
5. 🎖 **UR chipy vs SSR** (2–3× lepsza moc bojowa)
6. ⭐ **Skill Tactics → max poziom** (Lv.20 w pierwszej kolejności, potem Lv.30)
7. 📈 **Wall of Honor** — długoterminowe shardy po 5★
8. 🔬 **Hero Bonds** — bezpłatne buffy przez kompletowanie grup bohaterów
9. 🤝 **Military Research** (ATK/HP/DEF)
10. 🏆 **Ekskluzywna broń → Lv.30** (Ultimate Tactics skill)

---

## 19. KOMPLETNA LISTA CONTRIBUTORÓW DO BATTLE POWER

```
Battle Power = 
  Σ Hero_i (
    Rarity base
    + Level
    + Stars (max lvl cap, +Expertise at 4★)
    + 4× Gear slots (quality + level 0-40 + stars post-40)
    + 4× Skills (level 1-30/40, Tactics priorytet)
    + Exclusive Weapon (level 1-30, post-30 ATK/HP/DEF tracks)
  )
  + Drone (
    Level 1-250
    + Combat Boost level
    + 6× Components levels
    + 4× Chip Sets × 4 slots (SSR/UR, Tank/Aircraft/Missile)
  )
  + Account-wide (
    Formation Bonus (0-20%)
    Hero Bonds (permanentne)
    Wall of Honor (permanentne)
    Decorations (permanentne)
    Military Research nodes
    Alliance Research
    Valor Badge research
  )
```

---

*Dokument: 2026-07-12 | Źródła: lastwartutorial.com, cpt-hedge.com, lastwarhandbook.com, lastwarvault.com, lastwar.wiki, heaven-guardian.com, community guides*
