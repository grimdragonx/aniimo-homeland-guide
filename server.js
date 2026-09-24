const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Load data
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
  const { search, stage, element, ability, minLevel, form } = req.query;

  if (stage && stage !== 'all') {
    results = results.filter(item => item.stage.toLowerCase() === stage.toLowerCase());
  }

  if (element && element !== 'all') {
    results = results.filter(item => 
      (item.element && item.element.toLowerCase() === element.toLowerCase()) ||
      (item.secondary_element && item.secondary_element.toLowerCase() === element.toLowerCase())
    );
  }

  if (form && form !== 'all') {
    if (form === 'weather') {
      results = results.filter(item => item.forms.weather && item.forms.weather.length > 0);
    } else if (form === 'prismana') {
      results = results.filter(item => item.forms.prismana);
    }
  }

  if (ability && ability !== 'all') {
    const minLvl = parseInt(minLevel, 10) || 1;
    results = results.filter(item => {
      const allForms = [
        item.forms.basic,
        ...(item.forms.weather || []),
        item.forms.prismana
      ].filter(Boolean);

      return allForms.some(f => (f.abilities && (f.abilities[ability] || 0) >= minLvl));
    });
  }

  if (search) {
    const q = search.toLowerCase().trim();
    results = results.filter(item => {
      const fullText = `${item.id} ${item.name} ${item.evolution_line} ${item.best_role} ${item.element} ${JSON.stringify(item.forms)}`.toLowerCase();
      return fullText.includes(q);
    });
  }

  res.json({
    total: results.length,
    data: results
  });
});

app.get('/api/aniimo/:id', (req, res) => {
  const item = aniimoData.find(a => a.id === req.params.id || a.name.toLowerCase() === req.params.id.toLowerCase());
  if (!item) {
    return res.status(404).json({ error: 'Aniimo not found' });
  }
  res.json(item);
});

app.get('/api/abilities', (req, res) => {
  res.json({
    elemental: [
      { name: 'Fire', emoji: '🔥', description: 'Cooking, Smeltery & Blast Furnaces' },
      { name: 'Grass', emoji: '🌱', description: 'Planting, Weeding & Timber Logging' },
      { name: 'Water', emoji: '💧', description: 'Farmland Irrigation & Beverage Brewing' },
      { name: 'Earth', emoji: '⛰️', description: 'Quarry Mining & Masonry Sculpting' },
      { name: 'Lightning', emoji: '⚡', description: 'Dynamo Generators & Electrical Grids' },
      { name: 'Ice', emoji: '❄️', description: 'Cold Storage & Food Preservation' },
      { name: 'Wind', emoji: '🍃', description: 'Grain Windmills & Textile Looms' },
      { name: 'Dark', emoji: '🌑', description: 'Night Shift Operations & Shadow Alchemy' },
      { name: 'Light', emoji: '✨', description: 'Base Illumination & Hatchinator Warming' }
    ],
    utility: [
      { name: 'Carry', emoji: '📦', description: 'Item Hauling, Silo Sorting & Logistics' },
      { name: 'Artisanship', emoji: '🔨', description: 'Workbench Handiwork & RV Upgrades' },
      { name: 'Leisure', emoji: '☕', description: 'Worker Morale, Sanity & Recreation' },
      { name: 'Perfumery', emoji: '🌸', description: 'Botanical Oils, Incense & Fertilizers' }
    ]
  });
});

app.get('/api/stats', (req, res) => {
  let weatherVariantsCount = 0;
  const elements = {};
  const stages = { Lumin: 0, Gamma: 0, Nova: 0 };

  aniimoData.forEach(item => {
    stages[item.stage] = (stages[item.stage] || 0) + 1;
    elements[item.element] = (elements[item.element] || 0) + 1;
    if (item.forms.weather) {
      weatherVariantsCount += item.forms.weather.length;
    }
  });

  res.json({
    totalSpecies: aniimoData.length,
    stages,
    elements,
    weatherVariantsCount,
    prismanaVariantsCount: aniimoData.length,
    totalForms: aniimoData.length * 2 + weatherVariantsCount
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
