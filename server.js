const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load canonical data
const dataPath = path.join(__dirname, 'data', 'aniimo_homeland_data.json');
let aniimoData = [];

try {
  const raw = fs.readFileSync(dataPath, 'utf-8');
  aniimoData = JSON.parse(raw);
  console.log(`[INFO] Loaded ${aniimoData.length} Aniimo records successfully.`);
} catch (err) {
  console.error('[ERROR] Failed to load Aniimo data:', err);
}

// REST API Endpoints
app.get('/api/aniimo', (req, res) => {
  let results = [...aniimoData];
  const { search, element, minLevel, form, tier, dexStatus } = req.query;

  // Filter by Dex Status (numbered, unnumbered)
  if (dexStatus && dexStatus !== 'all') {
    if (dexStatus === 'numbered') {
      results = results.filter(item => !item.is_unnumbered);
    } else if (dexStatus === 'unnumbered') {
      results = results.filter(item => item.is_unnumbered);
    }
  }

  // Filter by Tier (S-Tier, A-Tier, B-Tier, C-Tier)
  if (tier && tier !== 'all') {
    results = results.filter(item => item.tier && item.tier.toLowerCase() === tier.toLowerCase());
  }

  // Filter by Form Type
  if (form && form !== 'all') {
    if (form === 'regional') {
      results = results.filter(item => item.forms.regional && item.forms.regional.length > 0);
    } else if (form === 'weather') {
      results = results.filter(item => item.forms.weather && item.forms.weather.length > 0);
    } else if (form === 'prismana') {
      results = results.filter(item => (item.id === '030') || (item.forms.prismana !== null && item.forms.prismana !== undefined));
    } else if (form === 'basic') {
      results = results.filter(item => item.forms.basic);
    } else if (form === 'unnumbered') {
      results = results.filter(item => item.is_unnumbered);
    }
  }

  // Filter by Element or Homeland Utility and/or Min Level
  const minLvl = parseInt(minLevel, 10) || 1;
  const hasElement = element && element !== 'all';
  const hasMinLvl = minLvl > 1;

  if (hasElement || hasMinLvl) {
    const elLower = hasElement ? element.toLowerCase() : null;
    results = results.filter(item => {
      let formsToCheck = [];
      if (form === 'basic') {
        if (item.forms.basic) formsToCheck.push(item.forms.basic);
      } else if (form === 'regional') {
        formsToCheck = item.forms.regional || [];
      } else if (form === 'weather') {
        formsToCheck = item.forms.weather || [];
      } else if (form === 'prismana') {
        if (item.id === '030') formsToCheck.push(item.forms.basic);
        else if (item.forms.prismana) formsToCheck.push(item.forms.prismana);
      } else {
        formsToCheck = [
          item.forms.basic,
          ...(item.forms.regional || []),
          ...(item.forms.weather || []),
          item.forms.prismana
        ].filter(Boolean);
      }

      return formsToCheck.some(f => {
        const pool = { ...(f.elements || {}), ...(f.abilities || {}), ...(f.utilities || {}) };
        if (elLower) {
          for (const [k, v] of Object.entries(pool)) {
            if (k.toLowerCase() === elLower && v >= minLvl) return true;
          }
          return false;
        } else {
          return Object.values(pool).some(v => v >= minLvl);
        }
      });
    });
  }

  // Search across name, id, slug, display_id, trait, region, elements
  if (search) {
    const q = search.toLowerCase().trim();
    results = results.filter(item => {
      const textToSearch = `${item.id} ${item.display_id} ${item.name} ${item.slug} ${item.tier} ${item.trait} ${item.trait_effect} ${JSON.stringify(item.forms)}`.toLowerCase();
      return textToSearch.includes(q);
    });
  }

  res.json({
    total: results.length,
    numberedCount: results.filter(r => !r.is_unnumbered).length,
    unnumberedCount: results.filter(r => r.is_unnumbered).length,
    data: results
  });
});

app.get('/api/aniimo/:id', (req, res) => {
  const param = req.params.id.toLowerCase();
  const item = aniimoData.find(a => 
    a.id === req.params.id || 
    a.slug === param || 
    a.name.toLowerCase() === param ||
    (param === '????' && a.is_unnumbered)
  );

  if (!item) {
    return res.status(404).json({ error: 'Aniimo not found' });
  }
  res.json(item);
});

// Elements & Homeland Utilities reference
app.get('/api/elements', (req, res) => {
  res.json([
    { name: 'Fire', emoji: '🔥', type: 'element', homelandRole: 'Smelting, Campfire Cooking & Kindling' },
    { name: 'Water', emoji: '💧', type: 'element', homelandRole: 'Farmland Irrigation, Aquaculture & Beverage Brewing' },
    { name: 'Grass', emoji: '🌱', type: 'element', homelandRole: 'Crop Planting, Harvesting & Timber Logging' },
    { name: 'Earth', emoji: '⛰️', type: 'element', homelandRole: 'Quarry Mining, Masonry Sculpting & Construction' },
    { name: 'Lightning', emoji: '⚡', type: 'element', homelandRole: 'Dynamo Power Generation & Electrical Grid' },
    { name: 'Ice', emoji: '❄️', type: 'element', homelandRole: 'Cold Storage, Food Preservation & Freezing' },
    { name: 'Wind', emoji: '🍃', type: 'element', homelandRole: 'Grain Windmills, Hauling & Material Logistics' },
    { name: 'Dark', emoji: '🌑', type: 'element', homelandRole: 'Night Operations & 24/7 Uninterrupted Shift Labor' },
    { name: 'Light', emoji: '✨', type: 'element', homelandRole: 'Base Illumination, Morale Radiant Warming & Hatching' },
    { name: 'Carry', emoji: '📦', type: 'utility', homelandRole: 'Logistics Hauling, Item Transport & Depot Storage' },
    { name: 'Artisanship', emoji: '🔨', type: 'utility', homelandRole: 'Workbench Crafting, RV Construction & Gear Assembly' },
    { name: 'Leisure', emoji: '☕', type: 'utility', homelandRole: 'Camp Morale, Hot Spring Resting & Worker Sanity Recovery' },
    { name: 'Perfumery', emoji: '🌸', type: 'utility', homelandRole: 'Botanical Distillation, Scent Diffusers & Herbal Alchemy' }
  ]);
});

// Stats endpoint
app.get('/api/stats', (req, res) => {
  const numberedList = aniimoData.filter(i => !i.is_unnumbered);
  const unnumberedList = aniimoData.filter(i => i.is_unnumbered);

  let regionalVariantsCount = 0;
  let weatherVariantsCount = 0;
  let prismanaCount = 0;
  let totalFormsCount = 0;
  const tiers = { 'S-Tier': 0, 'A-Tier': 0, 'B-Tier': 0, 'C-Tier': 0 };

  aniimoData.forEach(item => {
    if (item.tier in tiers) tiers[item.tier] = (tiers[item.tier] || 0) + 1;
    totalFormsCount += 1; // Basic Form
    if (item.forms.regional) {
      regionalVariantsCount += item.forms.regional.length;
      totalFormsCount += item.forms.regional.length;
    }
    if (item.forms.weather) {
      weatherVariantsCount += item.forms.weather.length;
      totalFormsCount += item.forms.weather.length;
    }
    if (item.forms.prismana && item.id !== '030') {
      prismanaCount += 1;
      totalFormsCount += 1;
    }
  });

  res.json({
    numberedSpeciesCount: numberedList.length,
    unnumberedSpeciesCount: unnumberedList.length,
    totalSpeciesCount: aniimoData.length,
    tiers,
    regionalVariantsCount,
    weatherVariantsCount,
    prismanaCount,
    totalFormsCount
  });
});

// Serve frontend static assets
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🏡 Aniimo Homeland Guide (Node.js Server) is running!`);
    console.log(`🌐 Local URL: http://localhost:${PORT}`);
    console.log(`📡 REST API:  http://localhost:${PORT}/api/aniimo`);
    console.log(`====================================================`);
  });
}

module.exports = app;
