# 🏡 Aniimo Homeland Master Platform

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express REST API](https://img.shields.io/badge/express-4.21.2-blue.svg)](https://expressjs.com/)
[![Verified Aniimo](https://img.shields.io/badge/Aniimodex-92%20Species-orange.svg)](https://www.dexerto.com/wikis/aniimo/aniimodex/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A modern, full-stack **Aniimo Homeland Master Platform** built with **Node.js, Express, and modern JavaScript**. Contains complete, canonical, fact-checked data for all **92 Aniimo species**, their verified **Basic, Regional, Weather, and Prismana forms**, real creature handbook images, and comprehensive Homeland workplace abilities.

---

## 🌟 Key Features

1. **Strictly Fact-Checked Form Catalog (92 Species):**
   - No fabricated weather forms (e.g. verified Emberpup has Basic, Highland, and Mountain Woods forms; Glynsera has Basic, Nighttime, and Prismana forms).
   - Form-specific element affinities (`Fire 1`, `Earth 1`, `Ice 3 / Dark 2`, etc.), catch rates, and native spawn regions.
2. **Official Creature Artwork:**
   - Real high-resolution PNG creature handbook portraits and form artwork downloaded and served locally from `/images/`.
3. **Interactive Modern Web Dashboard:**
   - Real-time search by ID, name, trait, region, or ability.
   - Dynamic form tab switcher inside each card that dynamically updates form artwork, stats, and workplace abilities.
   - Full handbook inspection modal with element matchups (weaknesses/resistances) and verified form comparison tables.
4. **Node.js REST API:**
   - `/api/aniimo`: Full catalog with search, tier, element, ability, and form filters.
   - `/api/aniimo/:id`: Single creature endpoint by Dex number or slug.
   - `/api/abilities`: Canonical workplace abilities reference.
   - `/api/stats`: Live statistics on total species, form variants, and tier breakdown.

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

## 📁 Project Structure

```
aniimo-homeland-guide/
├── data/
│   ├── aniimo_homeland_data.json   # Master JSON database (92 species)
│   └── aniimo_homeland_data.csv    # Exported CSV database
├── public/
│   ├── images/                     # Official creature PNG artwork
│   │   ├── forms/                  # Form-specific variant artwork
│   │   ├── 001.png ... 092.png     # Creature handbook portraits
│   │   └── emberpup.png ...        # Slug alias images
│   ├── index.html                  # Modern web application UI
│   ├── style.css                   # Glassmorphism dark-mode styling
│   └── app.js                      # Client-side reactivity and filtering
├── ANIIMO_DATABASE.md              # Full 92-creature Markdown catalog
├── BEST_WORKERS_TIER_LIST.md       # Workplace station tier list
├── HOMELAND_GUIDE.md               # Base automation blueprint guide
├── server.js                       # Express REST API backend
├── package.json                    # Node.js project manifest
└── README.md                       # Platform documentation
```

---

## 📡 REST API Reference

| Endpoint | Method | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/api/aniimo` | `GET` | `search`, `tier`, `element`, `ability`, `minLevel`, `form` | Query creatures with multi-faceted filters |
| `/api/aniimo/:id`| `GET` | `id` (e.g. `001`, `044`, `emberpup`, `glynsera`) | Retrieve single creature profile |
| `/api/abilities` | `GET` | None | Get list of all Homeland work abilities |
| `/api/stats` | `GET` | None | Aggregate database statistics |

---

## 📜 License
Distributed under the MIT License. Data credited to Pawprint Studio and Dexerto Aniimo Wiki.
