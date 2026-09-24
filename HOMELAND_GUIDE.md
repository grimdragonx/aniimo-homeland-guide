# 🏡 Aniimo Homeland Mechanics & Strategy Guide

> **Status:** Canonical Complete Edition • 2026  
> **Cataloged Species:** 92 Aniimo (82 Numbered `#001`–`#082` + 10 Discovered `#????`)  

---

## 🎯 1. Overview of Homeland Base Building

In *Aniimo*, your Homeland acts as your operational sanctuary, crafting hub, and resource generation engine. Aniimo assigned to your Homeland automate tasks based on two complementary systems:

1. **Elemental Affinities:** Drive workstation functions such as furnaces (Fire), irrigation sprinklers (Water), lumber mills (Grass), quarries (Earth), generators (Lightning), and food freezers (Ice).
2. **Homeland Utility Roles:** Specialize in operational labor:
   - 📦 **Carry:** Automatically moves materials from work sites and farms into designated storage chests.
   - 🔨 **Artisanship:** Crafts gear, machines RV parts, and constructs base blueprints.
   - ☕ **Leisure:** Generates comforting auras that restore worker sanity and prevent exhaustion.
   - 🌸 **Perfumery:** Synthesizes botanical fertilizers, essential oils, and therapeutic fragrances.

---

## 🌈 2. Creature Forms & Homeland Synergy

### Standard Forms
The baseline form encountered across Idyll. Forms establish the foundational elemental affinities and utility proficiencies.

### 🗺️ Regional Variants
Certain Aniimo adapt to regional biomes (e.g., Emberpup Highland Form gains Earth Lv.1 + Artisanship Lv.1). Regional variants expand workstation versatility.

### ⚡ Weather Variants
Specific climate phenomena (Rainstorms, Heatwaves, Thunderstorms, Snowstorms) induce temporary or permanent weather morphs that boost relevant elemental work output by +1 level.

### 🌈 Prismana Forms
Form attained during rare Prismana Flow events. Prismana forms possess enhanced elemental mastery (Lv.3 to Lv.4) and upgraded utility levels, making them pinnacle workers.

*Note on Somniwing (#030):* Somniwing is cataloged exclusively as its authentic **Prismana Form** (`Grass 3 / Wind 2` with `Perfumery 3` and `Leisure 1`).

---

## 🛠️ 3. Full REST API Reference

The application includes an integrated Node.js Express server providing full REST endpoints:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/aniimo` | `GET` | Query all Aniimo with filters (`search`, `element`, `minLevel`, `form`, `tier`, `dexStatus`) |
| `/api/aniimo/:id` | `GET` | Get detailed creature object by numeric ID, slug, or name |
| `/api/elements` | `GET` | List all 9 Elemental affinities and 4 Homeland Utility roles with descriptions |
| `/api/stats` | `GET` | Aggregate database metrics (species counts, forms counts, tier distributions) |

### Launching the Application Locally
```bash
npm install
npm start
# Open browser at http://localhost:3000
```