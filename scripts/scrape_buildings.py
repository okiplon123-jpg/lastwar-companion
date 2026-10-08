#!/usr/bin/env python3
"""Scrape building data from cpt-hedge.com and save as JSON."""

import json
import re
import subprocess
import time
from html.parser import HTMLParser

BUILDINGS = {
    "core": [
        "air-center", "alert-tower", "alliance-center", "armament-institute",
        "barracks", "builders-hut", "chip-lab", "coin-vault",
        "component-factory", "drill-ground", "drone-parts-workshop",
        "emergency-center", "farmland", "food-warehouse", "gear-factory",
        "gold-mine", "headquarters", "hospital", "iron-mine",
        "iron-warehouse", "material-workshop", "missile-center", "oil-well",
        "recon-plane", "smelter", "squad", "tactical-institute",
        "tank-center", "tavern", "tech-center", "training-base", "wall",
    ],
    "S1": [
        "air-force-base", "missile-base", "protein-farm", "tank-base",
        "virus-research-institute",
    ],
    "S2": [
        "air-force-base-s2", "high-heat-furnace", "missile-base-s2",
        "tank-base-s2", "titanium-alloy-factory",
    ],
    "S3": [
        "altar", "blessing-fountain", "curse-research-lab",
        "protectors-field", "optoelectronic-lab",
    ],
    "S4": ["protectors-field-s4", "quartz-workshop"],
    "S5": [
        "caffeine-institute", "coffee-factory", "missileer-bar", "pilot-bar",
        "protectors-field-s5", "tanker-bar",
    ],
    "S6": [
        "bear-totem", "eagle-totem", "fungus-institute", "jaguar-totem",
        "protectors-field-s6", "spore-factory",
    ],
}

# These are the "standard" columns that get mapped to fixed keys.
# Anything not in this set becomes a bonus column.
STANDARD_COL_MAP = {
    "Level": "level",
    "Food": "food",
    "Gold": "gold",
    "Iron": "iron",
    "Oil": "oil",
    "Time": "time",
    "Power": "power",
}


def fetch_html(slug):
    url = f"https://cpt-hedge.com/buildings/{slug}"
    result = subprocess.run(
        [
            "curl", "-s", "-A",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            url,
        ],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout


def parse_number(value):
    """Convert '1.80k'->1800, '1.90M'->1900000, '2.10G'->2100000000, etc.
    Time strings and other non-numeric values are returned as-is."""
    if not value or value == "-" or value == "":
        return 0
    v = value.strip()
    if not v or v == "-":
        return 0

    # Time strings: keep as string
    if re.match(r"^\d{2}:\d{2}:\d{2}$", v) or re.match(r"^\d+d \d{2}:\d{2}:\d{2}$", v):
        return v

    # Percentage strings: keep as string
    if v.endswith("%"):
        return v

    # Suffixed numbers
    multipliers = [
        ("G", 1_000_000_000),
        ("B", 1_000_000_000),
        ("M", 1_000_000),
        ("m", 1_000_000),
        ("k", 1_000),
        ("K", 1_000),
    ]
    for suffix, mult in multipliers:
        if v.endswith(suffix):
            try:
                return round(float(v[:-1]) * mult)
            except ValueError:
                pass

    # Plain numbers
    try:
        cleaned = v.replace(",", "")
        f = float(cleaned)
        # Return int if it's a whole number
        if f == int(f):
            return int(f)
        return round(f, 4)
    except ValueError:
        # Return as-is if we can't parse
        return v


class TableParser(HTMLParser):
    """Parse the first table on the page, extracting headers and rows."""

    def __init__(self):
        super().__init__()
        self.in_table = False
        self.in_thead = False
        self.in_tbody = False
        self.in_cell = False
        self.headers = []
        self.rows = []
        self.current_row = []
        self.current_cell = []
        self.depth_table = 0

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self.depth_table += 1
            if self.depth_table == 1:
                self.in_table = True
        elif self.in_table:
            if tag == "thead":
                self.in_thead = True
            elif tag == "tbody":
                self.in_tbody = True
            elif tag == "tr":
                self.current_row = []
            elif tag in ("th", "td"):
                self.in_cell = True
                self.current_cell = []

    def handle_endtag(self, tag):
        if tag == "table":
            self.depth_table -= 1
            if self.depth_table == 0:
                self.in_table = False
                self.in_thead = False
                self.in_tbody = False
        elif self.in_table:
            if tag == "thead":
                self.in_thead = False
            elif tag == "tbody":
                self.in_tbody = False
            elif tag == "tr":
                if self.current_row:
                    row_text = [" ".join(c).strip() for c in self.current_row]
                    if self.in_thead:
                        self.headers = row_text
                    else:
                        self.rows.append(row_text)
                self.current_row = []
            elif tag in ("th", "td"):
                self.current_row.append(self.current_cell)
                self.current_cell = []
                self.in_cell = False

    def handle_data(self, data):
        if self.in_table and self.in_cell:
            text = data.strip()
            if text:
                self.current_cell.append(text)


def extract_name(html):
    """Extract building name from the second h1 tag."""
    h1s = re.findall(r"<h1[^>]*>(.*?)</h1>", html, re.DOTALL)
    # Strip HTML tags from each
    cleaned = []
    for h in h1s:
        text = re.sub(r"<[^>]+>", "", h).strip()
        if text and text != "Building Information":
            cleaned.append(text)
    return cleaned[0] if cleaned else ""


def extract_description(html):
    """Extract the main description paragraph."""
    # Find p tags, clean them, skip nav/boilerplate
    paras = re.findall(r"<p[^>]*>(.*?)</p>", html, re.DOTALL)
    skip_patterns = [
        r"^Home", r"^Contact", r"Levels \d+", r"Found incorrect",
        r"^Discord", r"^Reddit",
    ]
    for p in paras:
        text = re.sub(r"<[^>]+>", "", p).strip()
        text = re.sub(r"\s+", " ", text)
        if not text:
            continue
        if any(re.search(pat, text) for pat in skip_patterns):
            continue
        # Must be reasonably long to be a description
        if len(text) > 30:
            return text
    return ""


def scrape_building(slug, season):
    html = fetch_html(slug)
    if not html or len(html) < 100:
        print(f"  ERROR: empty response for {slug}")
        return None

    name = extract_name(html)
    if not name:
        # Fallback: titlecase the slug
        name = slug.replace("-", " ").title()

    description = extract_description(html)

    # Parse table
    table_parser = TableParser()
    table_parser.feed(html)

    if not table_parser.headers:
        print(f"  ERROR: no table headers found for {slug}")
        return None

    headers = table_parser.headers
    rows = table_parser.rows

    print(f"  {slug}: {len(rows)} levels, headers: {headers}")

    # Identify bonus columns (anything that's not a standard column)
    bonus_cols = [h for h in headers if h not in STANDARD_COL_MAP]

    # Cost columns for season buildings (non-standard cost resources)
    cost_cols = [h for h in headers if h not in STANDARD_COL_MAP and h not in ("Time", "Level")]

    levels = []
    for row in rows:
        if not row:
            continue

        # Map by position using headers
        col_map = {}
        for i, header in enumerate(headers):
            col_map[header] = row[i] if i < len(row) else ""

        # Level must be parseable as int
        level_raw = col_map.get("Level", "")
        try:
            level_num = int(level_raw)
        except ValueError:
            continue

        # Time value
        time_val = col_map.get("Time", "")

        # Power
        power_raw = col_map.get("Power", "0")
        power_val = parse_number(power_raw) if power_raw else 0

        entry = {
            "level": level_num,
            "food": parse_number(col_map.get("Food", "0")) if "Food" in col_map else 0,
            "gold": parse_number(col_map.get("Gold", "0")) if "Gold" in col_map else 0,
            "iron": parse_number(col_map.get("Iron", "0")) if "Iron" in col_map else 0,
            "oil": parse_number(col_map.get("Oil", "0")) if "Oil" in col_map else 0,
            "time": time_val,
            "power": power_val if isinstance(power_val, (int, float)) else 0,
            "bonuses": {},
        }

        for bc in bonus_cols:
            raw = col_map.get(bc, "")
            entry["bonuses"][bc] = parse_number(raw) if raw else 0

        levels.append(entry)

    return {
        "id": slug,
        "name": name,
        "season": season,
        "description": description,
        "bonusColumns": bonus_cols,
        "levels": levels,
    }


def main():
    all_buildings = []
    total = sum(len(v) for v in BUILDINGS.values())
    count = 0

    for season_key, slugs in BUILDINGS.items():
        season_val = None if season_key == "core" else season_key
        for slug in slugs:
            count += 1
            print(f"[{count}/{total}] Fetching {slug} (season={season_val})...")
            try:
                building = scrape_building(slug, season_val)
                if building:
                    all_buildings.append(building)
            except Exception as e:
                import traceback
                print(f"  EXCEPTION for {slug}: {e}")
                traceback.print_exc()
            time.sleep(0.3)

    output = {"buildings": all_buildings}
    out_path = "/Users/oskarhejn/Last war/lastwar-companion/lib/buildings-data.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"\nDone! Scraped {len(all_buildings)} buildings -> {out_path}")


if __name__ == "__main__":
    main()
