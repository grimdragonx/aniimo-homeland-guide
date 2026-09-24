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
  const { search, element, ability, minLevel, form, tier } = req.query;

  // Filter by Tier (S-Tier, A-Tier, B-Tier, C-Tier)
  if (tier && tier !== 'all') {
    results = results.filter(item => item.tier && item.tier.toLowerCase() === tier.toLowerCase());
  }

  // Filter by Element
  if (element && element !== 'all') {
    const elLower = element.toLowerCase();
    results = results.filter(item => {
      const basic = item.forms && item.forms.basic;
      const elemStr = (basic ? basic.element_display : '') || '';
      return elemStr.toLowerCase().includes(elLower);
    });
  }

  // Filter by Form Type
  if (form && form !== 'all') {
    if (form === 'regional') {
      results = results.filter(item => item.forms.regional && item.forms.regional.length > 0);
    } else if (form === 'weather') {
      results = results.filter(item => item.forms.weather && item.forms.weather.length > 0);
    } else if (form === 'prismana') {
      results = results.filter(item => item.forms.prismana !== null && item.forms.prismana !== undefined);
    } else if (form === 'basic') {
      results = results.filter(item => item.forms.basic);
    }
  }

  // Filter by Homeland Ability
  if (ability && ability !== 'all') {
    const minLvl = parseInt(minLevel, 10) || 1;
    results = results.filter(item => {
      const allForms = [
        item.forms.basic,
        ...(item.forms.regional || []),
        ...(item.forms.weather || []),
        item.forms.prismana
      ].filter(Boolean);

      return allForms.some(f => (f.abilities && (f.abilities[ability] || 0) >= minLvl));
    });
  }

  // Search across name, id, slug, trait, habitat, abilities
  if (search) {
    const q = search.toLowerCase().trim();
    results = results.filter(item => {
      const textToSearch = `${item.id} ${item.name} ${item.slug} ${item.tier} ${item.trait} ${item.trait_effect} ${JSON.stringify(item.forms)}`.toLowerCase();
      return textToSearch.includes(q);
    });
  }

  res.json({
    total: results.length,
    data: results
  });
});

app.get('/api/aniimo/:id', (req, res) => {
  const param = req.params.id.toLowerCase();
  const item = aniimoData.find(a => 
    a.id === req.params.id || 
    a.slug === param || 
    a.name.toLowerCase() === param
  );

  if (!item) {
    return res.status(404).json({ error: 'Aniimo not found' });
  }
  res.json(item);
});

app.get('/api/abilities', (req, res) => {
  res.json({
    elemental: [
      { name: 'Fire', emoji: '🔥', description: 'Cooking, Smeltery & Blast Furnaces' },
      { name: 'Farming', emoji: '🌱', description: 'Crop Planting, Irrigation & Harvesting' },
      { name: 'Water', emoji: '💧', description: 'Farmland Irrigation & Beverage Brewing' },
      { name: 'Mining', emoji: '⛰️', description: 'Quarry Mining & Masonry Sculpting' },
      { name: 'Electricity', emoji: '⚡', description: 'Dynamo Generators & Electrical Grids' },
      { name: 'Cooling', emoji: '❄️', description: 'Cold Storage & Food Preservation' },
      { name: 'Transport', emoji: '🍃', description: 'Hauling, Grain Windmills & Dispersal' },
      { name: 'Night Labor', emoji: '🌑', description: 'Night Shift Operations & Shadow Crafting' },
      { name: 'Illumination', emoji: '✨', description: 'Base Lighting & Radiant Blessing' }
    ],
    utility: [
      { name: 'Carry', emoji: '📦', description: 'Item Transport, Silo Logistics & Hauling' },
      { name: 'Artisanship', emoji: '🔨', description: 'Workbench Crafting, Assembly & RV Upgrades' },
      { name: 'Lumbering', emoji: '🪓', description: 'Timber Logging & Wood Processing' }
    ]
  });
});

app.get('/api/stats', (req, res) => {
  let regionalVariantsCount = 0;
  let weatherVariantsCount = 0;
  let prismanaCount = 0;
  let totalFormsCount = 0;
  const tiers = { 'S-Tier': 0, 'A-Tier': 0, 'B-Tier': 0, 'C-Tier': 0 };

  aniimoData.forEach(item => {
    tiers[item.tier] = (tiers[item.tier] || 0) + 1;
    totalFormsCount += 1; // Basic Form
    if (item.forms.regional) {
      regionalVariantsCount += item.forms.regional.length;
      totalFormsCount += item.forms.regional.length;
    }
    if (item.forms.weather) {
      weatherVariantsCount += item.forms.weather.length;
      totalFormsCount += item.forms.weather.length;
    }
    if (item.forms.prismana) {
      prismanaCount += 1;
      totalFormsCount += 1;
    }
  });

  res.json({
    totalSpecies: aniimoData.length,
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

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🏡 Aniimo Homeland Guide (Node.js Server) is running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`📡 REST API:  http://localhost:${PORT}/api/aniimo`);
  console.log(`====================================================`);
});
