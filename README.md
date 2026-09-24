# 🏡 Aniimo Homeland Guide & Abilities Platform (Node.js)

[![Aniimo Version](https://img.shields.io/badge/Aniimo-v1.0-blue.svg)](https://aniimo.com)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-REST%20API-black.svg)](https://expressjs.com)
[![Homeland Abilities](https://img.shields.io/badge/Homeland%20Abilities-13%20Jobs-emerald.svg)](#-the-13-homeland-abilities)
[![Species](https://img.shields.io/badge/Species-89%2B%20Tracked-orange.svg)](#-database-summary)
[![Forms](https://img.shields.io/badge/Total%20Forms-272%20Cataloged-purple.svg)](#-form-systems--homeland-impact)

A full-stack, modern **Node.js platform**, interactive database, and optimization handbook for the **Homeland (RV Housing, Base Building & Farming)** system in **Aniimo**.

This project provides verified canonical creature profiles for **89+ Aniimo species** across **Basic Forms**, **Weather Variants**, and **Prismana Forms**, detailing visual picture portraits, **Homeland Abilities (Levels 1 to 5)**, workplace perks, and optimal facility placements.

---

## 🚀 Quick Start (Node.js Platform)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/grimdragonx/aniimo-homeland-guide.git
cd aniimo-homeland-guide
npm install
```

### 2. Launch Server
Start the Express server:
```bash
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

### 3. Developer Mode (Auto-Reload)
```bash
npm run dev
```

---

## 📡 REST API Endpoints

The Node.js server includes a built-in REST API for querying Aniimo data:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/aniimo` | `GET` | Retrieve list of Aniimo. Supports query params: `?search=...&stage=...&element=...&ability=...&minLevel=...&form=...` |
| `/api/aniimo/:id` | `GET` | Get single Aniimo by ID (`001`, `044`, etc.) or name (`glynsera`, `scorchhowl`) |
| `/api/abilities` | `GET` | Returns breakdown of all 13 Homeland abilities (Elemental & General Utility) |
| `/api/stats` | `GET` | High-level statistics on species, stage distribution, and variant counts |

---

## 🖼️ Picture & Portrait System

Every Aniimo in the catalog features visual picture portraits:
* **High-Res Vector Portraits:** Automatically generated SVG illustrations in `public/images/` reflecting elemental gradients, creature badges, and glowing auras.
* **Custom Picture Support:** Drop custom `.png` illustrations into `public/images/{id}.png` (e.g. `044.png`) and the app will automatically prioritize them over fallback SVGs!
* **Dynamic Form Auras:** Shifting tabs between **Basic**, **Weather Form**, and **Prismana Form** dynamically updates visual themes, lighting, and passive perks.

---

## 🧬 Form Systems & Homeland Impact

Every Aniimo can exist in up to three form categories that redefine its productivity at your base:

```
[Basic Form]           ──►  [Weather Form]          ──►  [Prismana Form]
Default habitat & stats     Dynamic weather/time shift    Rainbow aura / Prismana Flow
Baseline abilities (Lv1-3)  Adds elements & +1 skill      Max skills (Lv4-5), -25% stamina
```

1. **Basic Form:** Standard variants caught under temperate conditions (e.g., *Glynsera* in Beast Fang Ridge with `Ice Lv.3`, `Dark Lv.2`).
2. **Weather / Environmental Forms:** 
   * Variants triggered by specific weather or time conditions.
   * *Example:* **Glynsera (Nighttime Form)** spawns strictly at night in Rosetower Woods, boosting its stats to `Ice Lv.3`, `Dark Lv.3`, and `Artisanship Lv.3` with the *Nighttime Hunter* perk (+30% night shift speed, zero fatigue).
   * *Example:* **Scorchhowl (Thunderstorm)** gains `Lightning Lv.2` alongside `Fire Lv.3` to power generators while smelting.
3. **Prismana Forms:** 
   * Ultra-rare variants with shifting rainbow auras discovered during **Prismana Flow** weather or through the **Prismana Pact**.
   * Grants **+1 Level Boost** to primary work skills (reaching Lv 4–5), reduces stamina consumption by 25%, and unlocks exclusive passive perks.

---

## 🌟 The 13 Homeland Abilities

In *Aniimo*, base station efficiency is dictated strictly by an Aniimo's **Homeland Ability Level** (Lv 1 to Lv 5), completely independent from combat stats:

### ⚡ Elemental Roles (9 Abilities)
* **🔥 Fire:** Campfire cooking, smelteries, and blast furnace operations.
* **🌱 Grass:** Crop seeding, weeding, greenhouse farming, and timber logging.
* **💧 Water:** Irrigation trenches, water tanks, brewing vats, and well filling.
* **⛰️ Earth:** Quarrying boulders, ore excavation, and masonry sculpting.
* **⚡ Lightning:** Dynamo turbines, industrial battery banks, and electric automation.
* **❄️ Ice:** Chilling food pantries, cold storage preservation, and cryo vaults.
* **🍃 Wind:** Windmill flour grinding, seed separation, and fabric looms.
* **🌑 Dark:** Shadow alchemy, transmutation altars, and 24/7 night-shift coverage.
* **✨ Light:** Illumination beacons, relic polishing, and Hatchinator warming.

### 🛠️ General Utility Roles (4 Abilities)
* **📦 Carry:** Automated hauling of harvested crops, minerals, and crafted goods into storage bins.
* **🔨 Artisanship:** Handiwork at workbenches, furniture construction, and RV upgrades.
* **☕ Leisure:** Entertaining workers in recreational areas to recover morale and prevent slacking.
* **🌸 Perfumery:** Distilling botanical elixirs, incense buffs, and organic crop growth stimulants.

---

## 📑 Repository Structure

```text
aniimo-homeland-guide/
├── server.js                      # Express Node.js web server & REST API
├── package.json                   # Node.js project configuration
├── public/                        # Modern Web App Frontend
│   ├── index.html                 # App layout with search & filter panels
│   ├── style.css                  # Responsive glassmorphism dark UI
│   ├── app.js                     # Client logic, SVG portrait generator & modal
│   └── images/                    # 89+ SVG creature portraits
├── HOMELAND_GUIDE.md              # In-depth guide: RV progression, Hatchinators, Bud Tickets
├── ANIIMO_DATABASE.md             # Full encyclopedia of 89+ canonical Aniimo species
├── BEST_WORKERS_TIER_LIST.md      # Facility-by-facility worker rankings (S-Tier to B-Tier)
└── data/
    ├── aniimo_homeland_data.json  # Complete structured JSON dataset
    └── aniimo_homeland_data.csv   # Spreadsheet-compatible CSV export
```

---

## 📊 Database Summary

* **89+ Canonical Species** indexed (#001 through #094)
* **272 Total Forms Cataloged** (Basic, Nighttime/Weather, and Prismana variants)
* **Fact-Checked Accuracy** verified against in-game dex and official community registries.

---

## 🛠️ Contributing & Data Updates
Feel free to open an issue or pull request as new Aniimo patches, seasonal weather forms, or Prismana events are discovered!
