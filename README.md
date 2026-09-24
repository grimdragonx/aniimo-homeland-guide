# 🏡 Aniimo Homeland Guide & Abilities Database

[![Aniimo Version](https://img.shields.io/badge/Aniimo-v1.0-blue.svg)](https://aniimo.com)
[![Platform Support](https://img.shields.io/badge/Platform-PC%20%7C%20Console%20%7C%20Mobile-orange.svg)](#)
[![Homeland Abilities](https://img.shields.io/badge/Homeland%20Abilities-13%20Jobs-emerald.svg)](#the-13-homeland-abilities)
[![Forms Supported](https://img.shields.io/badge/Forms-Basic%20%7C%20Weather%20%7C%20Prismana-purple.svg)](#form-systems--homeland-impact)

A comprehensive guide, interactive database, and optimization handbook for the **Homeland (RV Housing, Base Building & Farming)** system in **Aniimo**.

This repository details each Aniimo species across **Basic Forms**, **Weather Forms**, and rare **Prismana Forms**, mapping out their specific **Homeland Abilities (Levels 1 to 5)**, work perks, and optimal facility placements.

---

## 📑 Repository Contents

| Document | Description |
| :--- | :--- |
| 📖 [**`HOMELAND_GUIDE.md`**](./HOMELAND_GUIDE.md) | In-depth walkthrough on unlocking Homeland, upgrading the RV, managing worker morale/hunger, Hatchinator incubation, and Bud Tickets. |
| 🐾 [**`ANIIMO_DATABASE.md`**](./ANIIMO_DATABASE.md) | Full creature encyclopedia listing 32+ Aniimo species, their evolution lines, Basic/Weather/Prismana forms, and exact ability levels. |
| 🏆 [**`BEST_WORKERS_TIER_LIST.md`**](./BEST_WORKERS_TIER_LIST.md) | S-Tier through B-Tier rankings for all 13 jobs (Smelting, Watering, Farming, Mining, Power, Cooling, Transport, etc.). |
| 💻 [**`web/index.html`**](./web/index.html) | Modern interactive web dashboard with real-time search, filters by stage/element/ability/level, and tabbed form comparisons. |
| 📊 [**`data/`**](./data/) | Machine-readable datasets available in both [`aniimo_homeland_data.json`](./data/aniimo_homeland_data.json) and [`aniimo_homeland_data.csv`](./data/aniimo_homeland_data.csv). |

---

## 🌟 The 13 Homeland Abilities

In *Aniimo*, efficiency at base stations is dictated by an Aniimo's **Homeland Ability Level** (Lv 1 to Lv 5), completely independent from combat stats:

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

## 🧬 Form Systems & Homeland Impact

Every Aniimo can exist in up to three form categories that redefine its productivity at your base:

```
[Basic Form]           ──►  [Weather Form]          ──►  [Prismana Form]
Default habitat & stats     Dynamic weather shift         Rainbow aura / Prismana Flow
Baseline abilities (Lv1-3)  Adds elements & +1 skill      Max skills (Lv4-5), -25% stamina
```

1. **Basic Form:** The standard variant caught under normal weather. Has baseline abilities suited to its evolution tier (Lumin, Gamma, or Nova).
2. **Weather Forms:** Variants that trigger in specific weather conditions (Rainstorm, Thunderstorm, Snowfield, Sandstorm, Heatwave). These forms frequently gain **secondary elements** and unlock additional Homeland roles (e.g., *Scorchhowl Thunderstorm* gains Lightning Lv 2 to power machines while retaining Fire Lv 3 for smelting).
3. **Prismana Forms:** Ultra-rare, shimmering rainbow variants obtained during *Prismana Flow* weather or via the *Prismana Pact*. These variants boast:
   * **+1 Level Boost** to primary work skills (reaching Lv 4 or Lv 5).
   * **Unique Prismatic Workplace Traits** (e.g. 50% carry capacity, zero food decay, 25% faster night shifts, and bonus Bud Ticket drops).

---

## 🚀 Interactive Web Dashboard

To run the interactive Aniimo Homeland Guide locally:
1. Navigate into the `web/` folder.
2. Double-click `index.html` to open it in any web browser (no web server required).
3. Features:
   * **Instant Search:** Type any name, evolution line, or work role.
   * **Form Switcher Tabs:** Compare an Aniimo's Basic, Weather, and Prismana abilities side-by-side.
   * **Skill Level Filtering:** Find all Aniimo with specific abilities (e.g., *Water Lv 3+* or *Carry Lv 4*).
   * **Clean Responsive Dark Mode UI.**

---

## 📊 Sample Data Preview

| Aniimo | Stage | Basic Form Abilities | Weather Form Abilities | Prismana Form Abilities |
| :--- | :--- | :--- | :--- | :--- |
| **Scorchhowl** | Nova | `Fire Lv.3`, `Artisanship Lv.2`, `Carry Lv.2` | *Thunderstorm:* `Fire Lv.3`, `Lightning Lv.2`, `Carry Lv.3` | `Fire Lv.4`, `Lightning Lv.2`, `Artisanship Lv.3` (*Blazing Foundry*) |
| **Inferlupa** | Nova | `Fire Lv.3`, `Dark Lv.2`, `Artisanship Lv.2` | *Eclipse/Night:* `Fire Lv.3`, `Dark Lv.3`, `Artisanship Lv.2` | `Fire Lv.4`, `Dark Lv.3`, `Artisanship Lv.3` (*Prismatic Nether*) |
| **Leafy** | Nova | `Water Lv.3`, `Grass Lv.3`, `Perfumery Lv.2` | *Rainstorm:* `Water Lv.4`, `Grass Lv.3`, `Perfumery Lv.2` | `Water Lv.4`, `Grass Lv.4`, `Perfumery Lv.3` (*Miracle Bloom*) |
| **Bouldus** | Nova | `Earth Lv.4`, `Carry Lv.3` | *Sandstorm:* `Earth Lv.4`, `Fire Lv.1`, `Carry Lv.3` | `Earth Lv.5`, `Carry Lv.3` (*Titan Quarry*) |
| **Tubster** | Nova | `Wind Lv.3`, `Earth Lv.2`, `Carry Lv.3` | *Sandstorm:* `Earth Lv.3`, `Wind Lv.2`, `Carry Lv.3` | `Wind Lv.3`, `Earth Lv.3`, `Carry Lv.4` (*Titan Porter*) |
| **Melloblum** | Nova | `Grass Lv.3`, `Perfumery Lv.3`, `Leisure Lv.2` | *Sunny Bloom:* `Grass Lv.4`, `Perfumery Lv.3`, `Leisure Lv.3` | `Grass Lv.4`, `Perfumery Lv.4`, `Leisure Lv.3` (*Sweet Nectar*) |

*See [`ANIIMO_DATABASE.md`](./ANIIMO_DATABASE.md) for the full 32+ species encyclopedia.*

---

## 🛠️ Contributing & Data Updates
Feel free to open an issue or pull request as new Aniimo patches, seasonal weather forms, or Prismana events are discovered!
