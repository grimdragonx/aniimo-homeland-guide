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
          const aliases = {
            lightning: ['lightning', 'electric'],
            electric: ['lightning', 'electric'],
            light: ['light', 'holy'],
            holy: ['light', 'holy'],
            earth: ['earth', 'rock'],
            rock: ['earth', 'rock']
          };
          const targetKeys = aliases[elLower] || [elLower];
          for (const [k, v] of Object.entries(pool)) {
            if (targetKeys.includes(k.toLowerCase()) && v >= minLvl) return true;
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

// Elements & Facility Jobs reference
app.get('/api/elements', (req, res) => {
  res.json([
    { name: 'Fire', emoji: '🔥', type: 'element', category: 'Elemental Roles', homelandRole: 'Cooking, smelting, and supplying heat' },
    { name: 'Water', emoji: '💧', type: 'element', category: 'Elemental Roles', homelandRole: 'Brewing, fetching water, and watering plants' },
    { name: 'Grass', emoji: '🌱', type: 'element', category: 'Elemental Roles', homelandRole: 'Planting seeds and gathering resources' },
    { name: 'Earth', emoji: '⛰️', type: 'element', category: 'Elemental Roles', homelandRole: 'Reclaiming land and mining resources' },
    { name: 'Lightning', emoji: '⚡', type: 'element', category: 'Elemental Roles', homelandRole: 'Manipulating electricity' },
    { name: 'Ice', emoji: '❄️', type: 'element', category: 'Elemental Roles', homelandRole: 'Cooling the Homeland environment' },
    { name: 'Wind', emoji: '🍃', type: 'element', category: 'Elemental Roles', homelandRole: 'Controlling wind to process products' },
    { name: 'Dark', emoji: '🌑', type: 'element', category: 'Elemental Roles', homelandRole: 'Harvesting crops, cutting down plants, and drying items' },
    { name: 'Light', emoji: '✨', type: 'element', category: 'Elemental Roles', homelandRole: 'Illuminating the Homeland' },
    { name: 'Carry', emoji: '📦', type: 'facility_job', category: 'Facility Jobs', homelandRole: 'Transporting stockpiled produce to Home Storage' },
    { name: 'Artisanship', emoji: '🔨', type: 'facility_job', category: 'Facility Jobs', homelandRole: 'Crafting furniture, appearance items, and Home goods' },
    { name: 'Leisure', emoji: '☕', type: 'facility_job', category: 'Facility Jobs', homelandRole: 'Producing items while playing and engaging in leisure activities' },
    { name: 'Perfumery', emoji: '🌸', type: 'facility_job', category: 'Facility Jobs', homelandRole: 'Working effectively at the perfume bench to craft scented goods' }
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

// SEO routes
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.get('/googleb4b043a56c142eb5.html', (req, res) => {
  res.type('text/html');
  res.send('google-site-verification: googleb4b043a56c142eb5.html');
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
