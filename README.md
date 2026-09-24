# 🏡 Aniimo Homeland Master Platform

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express REST API](https://img.shields.io/badge/express-4.21.2-blue.svg)](https://expressjs.com/)
[![Verified Species](https://img.shields.io/badge/Aniimodex-92%20Total%20Aniimo-orange.svg)](https://www.dexerto.com/wikis/aniimo/aniimodex/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, full-stack **Aniimo Homeland Master Platform** built with **Node.js, Express, and modern JavaScript**. Features the complete canonical catalog of all **92 Aniimo species** (82 numbered `#001`–`#082` in active Dex + 10 unnumbered `#????` species), official creature handbook artwork, verified **Basic, Regional, Weather, and Prismana forms**, and elemental workplace proficiencies.

---

## 🌟 Key Highlights

1. **All 92 Aniimo with Real Data (82 Numbered + 10 `#????`):**
   - Numbered species `#001 Emberpup` to `#082 Besauce` match the current in-game numbered Dex.
   - Species whose Dex number has not yet been assigned in the release Dex (Dazmand, Fulmintis, Fennelun, Lunara, Soleon, Helion, Morphling, Jabster, Sparkelf, Irisalis) are displayed with their authentic names, images, traits, and forms, marked as **`#????`** so players won't be confused.
2. **Pure Elemental System:**
   - Workplace proficiencies are displayed directly as **Elements & Elemental Levels** (`Fire Lv.1`, `Earth Lv.1`, `Ice Lv.3`, `Dark Lv.2`, `Grass Lv.3`, etc.), matching official game mechanics.
3. **Fact-Checked Forms:**
   - Zero fictional forms (Emberpup has Basic, Highland, and Mountain Woods; Glynsera has Basic, Nighttime, and Prismana).
   - **Somniwing (#030)** verified as the authentic Prismana Form evolution of the Flutternym line.
4. **Official Creature Artwork:**
   - 296 local high-resolution PNG creature portraits and form images served from `/images/`.
5. **Interactive Modern Web Dashboard:**
   - Live search by ID, name, element, trait, or region.
   - Dynamic form tab switcher that updates artwork, catch rates, and elemental proficiencies in real-time.
   - Comprehensive creature inspection modal with elemental matchups and complete form comparison tables.
6. **Express REST API:**
   - `/api/aniimo`: Query creatures with element, tier, and form filters.
   - `/api/aniimo/:id`: Retrieve single creature profile (by ID, slug, or name).
   - `/api/elements`: Canonical element reference.
   - `/api/stats`: Live aggregate database statistics.

---

## 🚀 Quick Start Guide

### 1. Requirements
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/grimdragonx/aniimo-homeland-guide.git

# Navigate to project folder
cd aniimo-homeland-guide

# Install dependencies
npm install
```

### 3. Launch Server
```bash
npm start
```
The server will boot on `http://localhost:3000`:
- **Web UI:** [http://localhost:3000](http://localhost:3000)
- **REST API:** [http://localhost:3000/api/aniimo](http://localhost:3000/api/aniimo)
- **Live Stats:** [http://localhost:3000/api/stats](http://localhost:3000/api/stats)

---

## 📡 REST API Reference

| Endpoint | Method | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/api/aniimo` | `GET` | `search`, `tier`, `element`, `minLevel`, `form`, `dexStatus` | Query creatures with elemental filters |
| `/api/aniimo/:id`| `GET` | `id` (e.g. `001`, `044`, `dazmand`, `fulmintis`) | Retrieve single creature profile |
| `/api/elements` | `GET` | None | List of elements and Homeland workstations |
| `/api/stats` | `GET` | None | Live aggregate database statistics |

---

## 📜 License
Distributed under the MIT License. Data credited to Pawprint Studio and Dexerto Aniimo Wiki.
