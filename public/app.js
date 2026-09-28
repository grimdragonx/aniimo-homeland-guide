// Aniimo Homeland Hub Frontend Application (Client-Side)
const defaultPageTitle = document.title;

let allAniimo = [];
let currentFormFilter = 'all';
let cardActiveTabs = {}; // id -> tab key

const grid = document.getElementById('aniimoGrid');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const tierFilter = document.getElementById('tierFilter');
const elementFilter = document.getElementById('elementFilter');
const minLevelFilter = document.getElementById('minLevelFilter');
const pillBtns = document.querySelectorAll('.pill-btn');
const resultsBadge = document.getElementById('resultsBadge');

const detailModal = document.getElementById('detailModal');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');

// Element & Homeland Utility colors, icons, and official definitions
// Element & Homeland Utility colors, icons, and official definitions
const abilityMeta = {
  // Elemental Roles & Production
  Fire: { name: 'Fire', displayName: 'Fire', emoji: '🔥', color: '#ef4444', desc: 'Fire Aniimo specialize in cooking, smelting, and supplying heat.', category: 'element' },
  Grass: { name: 'Grass', displayName: 'Grass', emoji: '🍃', color: '#22c55e', desc: 'Grass-type Aniimo specialize in planting seeds and gathering resources.', category: 'element' },
  Water: { name: 'Water', displayName: 'Water', emoji: '💧', color: '#3b82f6', desc: 'Water Aniimo specialize in brewing, fetching water, and watering plants.', category: 'element' },
  Earth: { name: 'Earth', displayName: 'Earth', emoji: '⛰️', color: '#b45309', desc: 'Earth-type Aniimo specialize in reclaiming land and mining resources.', category: 'element' },
  Lightning: { name: 'Lightning', displayName: 'Lightning', emoji: '⚡', color: '#eab308', desc: 'Lightning-type Aniimo specialize in manipulating electricity.', category: 'element' },
  Ice: { name: 'Ice', displayName: 'Ice', emoji: '❄️', color: '#06b6d4', desc: 'Ice-type Aniimo specialize in cooling your homeland environment.', category: 'element' },
  Wind: { name: 'Wind', displayName: 'Wind', emoji: '🌀', color: '#14b8a6', desc: 'Wind-type Aniimo specialize in controlling the wind to process products.', category: 'element' },
  Dark: { name: 'Dark', displayName: 'Dark', emoji: '🌑', color: '#9333ea', desc: 'Dark Aniimo specialize in harvesting crops, cutting down plants, pickling, and drying items.', category: 'element' },
  Light: { name: 'Light', displayName: 'Light', emoji: '✨', color: '#f59e0b', desc: 'Light-type Aniimo specialize in illuminating your homeland.', category: 'element' },
  // Facility Jobs & Utilities
  Carry: { name: 'Carry', displayName: 'Hauling', emoji: '🛒', color: '#6366f1', desc: 'Aniimo with the Hauling ability can pick up stockpiled produce from facilities and carry it to the Home storage.', category: 'facility' },
  Artisanship: { name: 'Artisanship', displayName: 'Artisanship', emoji: '✂️', color: '#84cc16', desc: 'Crafty Aniimo create a variety of handcrafted goods.', category: 'facility' },
  Leisure: { name: 'Leisure', displayName: 'Leisure', emoji: '🌸', color: '#ec4899', desc: 'Playful Aniimo happily produce various items while they play and have fun.', category: 'facility' },
  Perfumery: { name: 'Perfumery', displayName: 'Perfumery', emoji: '🧴', color: '#a855f7', desc: 'Aniimo that specialize in perfumery can work effectively at the perfume station.', category: 'facility' }
};
// Aliases for canonical naming compatibility
abilityMeta.Electric = abilityMeta.Lightning;
abilityMeta.Holy = abilityMeta.Light;
abilityMeta.Rock = abilityMeta.Earth;
const elementMeta = abilityMeta;

// Fetch Data from Node.js REST API
async function fetchAniimoData() {
  try {
    const res = await fetch('/api/aniimo');
    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.warn('API fetch failed, falling back to local JSON data file', err);
  }

  try {
    const res = await fetch('data/aniimo_homeland_data.json');
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('All data loading failed', e);
  }
  return [];
}

// Fetch Stats or Calculate Client-Side
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const stats = await res.json();
      const elSpecies = document.getElementById('statSpecies');
      const elForms = document.getElementById('statForms');
      const elRegional = document.getElementById('statRegional');
      const elPrismana = document.getElementById('statPrismana');

      if (elSpecies) elSpecies.textContent = stats.numberedSpeciesCount || 82;
      if (elForms) elForms.textContent = stats.unnumberedSpeciesCount !== undefined ? stats.unnumberedSpeciesCount : 10;
      if (elRegional) elRegional.textContent = stats.regionalVariantsCount || 88;
      if (elPrismana) elPrismana.textContent = stats.prismanaCount || 24;
      return;
    }
  } catch (err) {
    console.warn('Stats fetch error, calculating client-side:', err);
  }

  // Fallback: Calculate metrics directly from allAniimo
  if (allAniimo && allAniimo.length) {
    const elSpecies = document.getElementById('statSpecies');
    const elForms = document.getElementById('statForms');
    const elRegional = document.getElementById('statRegional');
    const elPrismana = document.getElementById('statPrismana');

    const numbered = allAniimo.filter(i => !i.is_unnumbered).length;
    const unnumbered = allAniimo.filter(i => i.is_unnumbered).length;
    let regCount = 0;
    let prisCount = 0;
    allAniimo.forEach(i => {
      if (i.forms.regional) regCount += i.forms.regional.length;
      if (i.forms.prismana && i.id !== '030') prisCount += 1;
    });

    if (elSpecies) elSpecies.textContent = numbered || 82;
    if (elForms) elForms.textContent = unnumbered || 10;
    if (elRegional) elRegional.textContent = regCount || 88;
    if (elPrismana) elPrismana.textContent = prisCount || 24;
  }
}

// Render Card List
function renderCards(list) {
  if (!list.length) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: #94a3b8;">
        <h3 style="font-size: 1.5rem; color: white; margin-bottom: 0.5rem;">No Aniimo Matched</h3>
        <p>Try widening your search terms or clearing your filters.</p>
      </div>
    `;
    resultsBadge.textContent = 'Showing 0 Aniimo';
    return;
  }

  const numberedInList = list.filter(i => !i.is_unnumbered).length;
  const unnumberedInList = list.filter(i => i.is_unnumbered).length;
  resultsBadge.textContent = `Showing ${list.length} Aniimo (${numberedInList} numbered + ${unnumberedInList} #????)`;

  grid.innerHTML = list.map(item => {
    const basicForm = item.forms.basic;
    const regionalForms = item.forms.regional || [];
    const weatherForms = item.forms.weather || [];
    const prismanaForm = item.forms.prismana;

    const activeTabKey = cardActiveTabs[item.id] || 'basic';

    let activeData = basicForm;
    let isPris = false;

    if (activeTabKey === 'prismana' && prismanaForm) {
      activeData = prismanaForm;
      isPris = true;
    } else if (activeTabKey.startsWith('regional_')) {
      const idx = parseInt(activeTabKey.split('_')[1], 10);
      if (regionalForms[idx]) activeData = regionalForms[idx];
    } else if (activeTabKey.startsWith('weather_')) {
      const idx = parseInt(activeTabKey.split('_')[1], 10);
      if (weatherForms[idx]) activeData = weatherForms[idx];
    }

    // Build form nav buttons
    let navBtns = '';
    
    // For Somniwing (#030), inherently a Prismana form creature
    if (item.id === '030') {
      navBtns = `<button class="btn-form-tab is-prismana active">🌈 Prismana Form</button>`;
      isPris = true;
    } else {
      navBtns = `<button class="btn-form-tab ${activeTabKey === 'basic' ? 'active' : ''}" onclick="setCardTab('${item.id}', 'basic')">Basic</button>`;

      const seenLabels = new Set(['basic']);

      regionalForms.forEach((rf, i) => {
        const label = rf.form_name.replace('Form', '').trim();
        const norm = label.toLowerCase();
        if (seenLabels.has(norm)) return;
        seenLabels.add(norm);
        const sel = activeTabKey === `regional_${i}`;
        navBtns += `<button class="btn-form-tab ${sel ? 'active' : ''}" onclick="setCardTab('${item.id}', 'regional_${i}')">🗺️ ${label}</button>`;
      });

      weatherForms.forEach((wf, i) => {
        const label = wf.form_name.replace('Form', '').trim();
        const norm = label.toLowerCase();
        if (seenLabels.has(norm)) return;
        seenLabels.add(norm);
        const sel = activeTabKey === `weather_${i}`;
        navBtns += `<button class="btn-form-tab ${sel ? 'active' : ''}" onclick="setCardTab('${item.id}', 'weather_${i}')">⚡ ${label}</button>`;
      });

      if (prismanaForm) {
        navBtns += `<button class="btn-form-tab is-prismana ${isPris ? 'active' : ''}" onclick="setCardTab('${item.id}', 'prismana')">🌈 Prismana</button>`;
      }
    }

    // Build ability proficiency pills (Elements + Homeland Utilities)
    const activeAbilities = activeData.abilities || { ...(activeData.elements || {}), ...(activeData.utilities || {}) };
    const elementsHtml = Object.entries(activeAbilities).map(([abilName, lvl]) => {
      const meta = abilityMeta[abilName] || { emoji: '⭐', displayName: abilName, color: '#38bdf8', desc: abilName };
      return `
        <span class="homeland-pill" style="background-color: ${meta.color};" title="${meta.desc}">
          <span class="pill-icon">${meta.emoji}</span>
          <span class="pill-name">${meta.displayName}</span>
          <span class="pill-lvl">Lv.${lvl}</span>
        </span>
      `;
    }).join('');

    // Determine current displayed image
    const currentImg = activeData.image || item.image || `images/${item.slug}.png`;

    return `
      <div class="card ${isPris ? 'is-prismana-active' : ''} ${item.is_unnumbered ? 'is-unnumbered-card' : ''}" id="aniimo-${item.id}">
        <!-- Picture Portrait Banner -->
        <div class="card-portrait-wrap" onclick="openDetailModal('${item.id}', '${activeTabKey}')" style="cursor: pointer;" title="Click for full handbook details">
          <img src="${currentImg}" 
               class="portrait-img" 
               alt="${item.name} (${item.display_id}) Handbook Portrait - Aniimo Homeland Guide" 
               loading="lazy" 
               decoding="async"
               width="160"
               height="160"
               onerror="if (!this.dataset.fallback) { this.dataset.fallback='1'; this.src='images/${item.slug}.png'; } else if (this.dataset.fallback==='1') { this.dataset.fallback='2'; this.src='images/${item.id}.png'; } else if (this.dataset.fallback==='2') { this.dataset.fallback='3'; this.src='images/unknown.png'; }">
          <div class="portrait-overlay">
            <span class="portrait-badge-id" style="${item.is_unnumbered ? 'background: rgba(234, 88, 12, 0.4); border: 1px solid rgba(234, 88, 12, 0.7);' : ''}">${item.display_id}</span>
            <span class="portrait-badge-stage stage-${item.tier}">${item.tier}</span>
          </div>
        </div>

        <!-- Title & Elements -->
        <div class="card-header-row">
          <h3 class="card-title" onclick="openDetailModal('${item.id}', '${activeTabKey}')" style="cursor: pointer;">
            ${item.name}
          </h3>
          <div class="element-badges-wrap">
            <span class="el-badge">
              ${activeData.element_display || 'Standard'}
            </span>
          </div>
        </div>

        <!-- Trait Strip -->
        <div class="card-role-strip">
          <span class="role-tag">Passive Trait</span>
          <span class="role-desc"><strong>${item.trait || 'Standard'}</strong>: ${item.trait_effect || 'Standard Homeland support.'}</span>
        </div>

        <!-- Form Switcher -->
        <div class="form-nav-strip">
          ${navBtns}
        </div>

        <!-- Active Form Panel -->
        <div class="active-form-box">
          <div class="form-info-line">
            <span class="form-title-txt">${activeData.form_name}</span>
            <span class="form-loc-tag">📍 Catch Rate: ${activeData.catch_rate || '—'}</span>
          </div>

          <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 0.75rem;">
            🗺️ <em>${activeData.region || 'Idyll Native Habitat'}</em>
          </div>

          <!-- Element Levels -->
          <div class="ability-pill-grid">
            ${elementsHtml}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.setCardTab = function(id, tab) {
  cardActiveTabs[id] = tab;
  applyFilters();
};


// Official Wiki 3D Animation & Full Illustration Asset Mapping (90 species)
const wikiMediaMap = {"001":{"id":"001","name":"Emberpup","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10051.png","assetNum":"1005100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10051.png","assetNum":"1005100"},"regional_1":{"formName":"Mountain Woods Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005104.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005104.png","assetNum":"1005104"},"Mountain Woods Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005104.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005104.png","assetNum":"1005104"},"regional_0":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005101.png","assetNum":"1005101"},"Highland Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005101.png","assetNum":"1005101"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10051.png","assetNum":"10051"},"002":{"id":"002","name":"Flameruff","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10052.png","assetNum":"1005200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10052.png","assetNum":"1005200"},"regional_1":{"formName":"Mountain Woods Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005204.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005204.png","assetNum":"1005204"},"Mountain Woods Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005204.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005204.png","assetNum":"1005204"},"regional_0":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005201.png","assetNum":"1005201"},"Highland Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005201.png","assetNum":"1005201"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10052.png","assetNum":"10052"},"003":{"id":"003","name":"Scorchhowl","forms":{"regional_0":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005301.png","assetNum":"1005301"},"Highland Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005301.png","assetNum":"1005301"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10053.png","assetNum":"1005300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10053.png","assetNum":"1005300"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005303.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005303.png","assetNum":"1005303"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005303.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005303.png","assetNum":"1005303"},"weather_0":{"formName":"Thunderstorm Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005302.png","assetNum":"1005302"},"Thunderstorm Form":{"formKey":"weather_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005302.png","assetNum":"1005302"},"regional_1":{"formName":"Mountain Woods Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005304.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005304.png","assetNum":"1005304"},"Mountain Woods Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005304.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005304.png","assetNum":"1005304"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10053.png","assetNum":"10053"},"004":{"id":"004","name":"Inferlupa","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10055.png","assetNum":"1005500"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10055.png","assetNum":"1005500"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005503.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005503.png","assetNum":"1005503"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005503.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1005503.png","assetNum":"1005503"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1005500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10055.png","assetNum":"10055"},"005":{"id":"005","name":"Celestis","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1001100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10011.png","assetNum":"1001100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1001100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10011.png","assetNum":"1001100"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1001100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10011.png","assetNum":"10011"},"006":{"id":"006","name":"Stellarys","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1001200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10012.png","assetNum":"1001200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1001200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10012.png","assetNum":"1001200"},"weather_0":{"formName":"Rainstorm Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1001201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1001201.png","assetNum":"1001201"},"Rainstorm Form":{"formKey":"weather_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1001201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1001201.png","assetNum":"1001201"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1001202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1001202.png","assetNum":"1001202"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1001202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1001202.png","assetNum":"1001202"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1001200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10012.png","assetNum":"10012"},"007":{"id":"007","name":"Chirpi","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10181.png","assetNum":"1018100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10181.png","assetNum":"1018100"},"regional_1":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018103.png","assetNum":"1018103"},"Highland Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018103.png","assetNum":"1018103"},"regional_0":{"formName":"Beach Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018101.png","assetNum":"1018101"},"Beach Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018101.png","assetNum":"1018101"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10181.png","assetNum":"10181"},"008":{"id":"008","name":"Tromber","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10184.png","assetNum":"1018400"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10184.png","assetNum":"1018400"},"regional_1":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018403.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018403.png","assetNum":"1018403"},"Highland Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018403.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018403.png","assetNum":"1018403"},"regional_0":{"formName":"Beach Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018401.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018401.png","assetNum":"1018401"},"Beach Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018401.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018401.png","assetNum":"1018401"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10184.png","assetNum":"10184"},"009":{"id":"009","name":"Cornet","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10185.png","assetNum":"1018500"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10185.png","assetNum":"1018500"},"regional_0":{"formName":"Beach Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018501.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018501.png","assetNum":"1018501"},"Beach Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018501.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018501.png","assetNum":"1018501"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018502.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018502.png","assetNum":"1018502"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018502.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018502.png","assetNum":"1018502"},"regional_1":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018503.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018503.png","assetNum":"1018503"},"Highland Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018503.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018503.png","assetNum":"1018503"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10185.png","assetNum":"10185"},"010":{"id":"010","name":"Tubster","forms":{"regional_0":{"formName":"Beach Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018701.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018701.png","assetNum":"1018701"},"Beach Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018701.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018701.png","assetNum":"1018701"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018700.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10187.png","assetNum":"1018700"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018700.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10187.png","assetNum":"1018700"},"regional_1":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018703.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018703.png","assetNum":"1018703"},"Highland Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018703.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1018703.png","assetNum":"1018703"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1018700.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10187.png","assetNum":"10187"},"011":{"id":"011","name":"Iris","forms":{"regional_0":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021101.png","assetNum":"1021101"},"Highland Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021101.png","assetNum":"1021101"},"regional_3":{"formName":"Mountain Woods Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021106.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021106.png","assetNum":"1021106"},"Mountain Woods Form":{"formKey":"regional_3","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021106.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021106.png","assetNum":"1021106"},"regional_1":{"formName":"Forest Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021102.png","assetNum":"1021102"},"Forest Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021102.png","assetNum":"1021102"},"regional_2":{"formName":"Grassland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021103.png","assetNum":"1021103"},"Grassland Form":{"formKey":"regional_2","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021103.png","assetNum":"1021103"},"weather_0":{"formName":"Plateau Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021105.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021105.png","assetNum":"1021105"},"Plateau Form":{"formKey":"weather_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021105.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021105.png","assetNum":"1021105"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10211.png","assetNum":"1021100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10211.png","assetNum":"1021100"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021104.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021104.png","assetNum":"1021104"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021104.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021104.png","assetNum":"1021104"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10211.png","assetNum":"10211"},"012":{"id":"012","name":"Irisal","forms":{"regional_0":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021201.png","assetNum":"1021201"},"Highland Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021201.png","assetNum":"1021201"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10212.png","assetNum":"1021200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10212.png","assetNum":"1021200"},"regional_2":{"formName":"Grassland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021203.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021203.png","assetNum":"1021203"},"Grassland Form":{"formKey":"regional_2","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021203.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021203.png","assetNum":"1021203"},"regional_1":{"formName":"Forest Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021202.png","assetNum":"1021202"},"Forest Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021202.png","assetNum":"1021202"},"regional_3":{"formName":"Mountain Woods Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021206.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021206.png","assetNum":"1021206"},"Mountain Woods Form":{"formKey":"regional_3","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021206.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021206.png","assetNum":"1021206"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021204.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021204.png","assetNum":"1021204"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021204.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021204.png","assetNum":"1021204"},"weather_0":{"formName":"Plateau Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021205.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021205.png","assetNum":"1021205"},"Plateau Form":{"formKey":"weather_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021205.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1021205.png","assetNum":"1021205"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1021200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10212.png","assetNum":"10212"},"013":{"id":"013","name":"Skippy","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10041.png","assetNum":"1004100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10041.png","assetNum":"1004100"},"regional_0":{"formName":"Sea of Flowers Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1004101.png","assetNum":"1004101"},"Sea of Flowers Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1004101.png","assetNum":"1004101"},"regional_1":{"formName":"Snowfield Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1004102.png","assetNum":"1004102"},"Snowfield Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1004102.png","assetNum":"1004102"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10041.png","assetNum":"10041"},"014":{"id":"014","name":"Pranky","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10042.png","assetNum":"1004200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10042.png","assetNum":"1004200"},"regional_1":{"formName":"Snowfield Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1004202.png","assetNum":"1004202"},"Snowfield Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1004202.png","assetNum":"1004202"},"regional_0":{"formName":"Sea of Flowers Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1004201.png","assetNum":"1004201"},"Sea of Flowers Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1004201.png","assetNum":"1004201"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10042.png","assetNum":"10042"},"015":{"id":"015","name":"Glacy","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10043.png","assetNum":"1004300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10043.png","assetNum":"1004300"},"regional_1":{"formName":"Snowfield Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1004302.png","assetNum":"1004302"},"Snowfield Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1004302.png","assetNum":"1004302"},"regional_0":{"formName":"Sea of Flowers Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1004301.png","assetNum":"1004301"},"Sea of Flowers Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1004301.png","assetNum":"1004301"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004303.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1004303.png","assetNum":"1004303"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004303.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1004303.png","assetNum":"1004303"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10043.png","assetNum":"10043"},"016":{"id":"016","name":"Leafy","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10045.png","assetNum":"1004500"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10045.png","assetNum":"1004500"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1004500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10045.png","assetNum":"10045"},"017":{"id":"017","name":"Nimbi","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10261.png","assetNum":"1026100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10261.png","assetNum":"1026100"},"weather_2":{"formName":"Plateau Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026105.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1026105.png","assetNum":"1026105"},"Plateau Form":{"formKey":"weather_2","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026105.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1026105.png","assetNum":"1026105"},"weather_0":{"formName":"Rainstorm Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1026101.png","assetNum":"1026101"},"Rainstorm Form":{"formKey":"weather_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1026101.png","assetNum":"1026101"},"weather_1":{"formName":"Cloudmist Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1026102.png","assetNum":"1026102"},"Cloudmist Form":{"formKey":"weather_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1026102.png","assetNum":"1026102"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10261.png","assetNum":"10261"},"018":{"id":"018","name":"Turbo","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10262.png","assetNum":"1026200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10262.png","assetNum":"1026200"},"weather_0":{"formName":"Rainstorm Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1026201.png","assetNum":"1026201"},"Rainstorm Form":{"formKey":"weather_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1026201.png","assetNum":"1026201"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026204.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1026204.png","assetNum":"1026204"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026204.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1026204.png","assetNum":"1026204"},"weather_1":{"formName":"Cloudmist Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1026202.png","assetNum":"1026202"},"Cloudmist Form":{"formKey":"weather_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1026202.png","assetNum":"1026202"},"weather_2":{"formName":"Plateau Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026205.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1026205.png","assetNum":"1026205"},"Plateau Form":{"formKey":"weather_2","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026205.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1026205.png","assetNum":"1026205"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10262.png","assetNum":"10262"},"019":{"id":"019","name":"Dreaple","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10263.png","assetNum":"1026300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10263.png","assetNum":"1026300"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1026300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10263.png","assetNum":"10263"},"020":{"id":"020","name":"Hummin","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10201.png","assetNum":"1020100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10201.png","assetNum":"1020100"},"regional_0":{"formName":"Mountain Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1020101.png","assetNum":"1020101"},"Mountain Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1020101.png","assetNum":"1020101"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10201.png","assetNum":"10201"},"021":{"id":"021","name":"Witchin","forms":{"regional_0":{"formName":"Mountain Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1020301.png","assetNum":"1020301"},"Mountain Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1020301.png","assetNum":"1020301"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10203.png","assetNum":"1020300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10203.png","assetNum":"1020300"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1020302.png","assetNum":"1020302"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1020302.png","assetNum":"1020302"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10203.png","assetNum":"10203"},"022":{"id":"022","name":"Tuckin","forms":{"regional_0":{"formName":"Mountain Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020701.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1020701.png","assetNum":"1020701"},"Mountain Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020701.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1020701.png","assetNum":"1020701"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020700.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10207.png","assetNum":"1020700"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020700.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10207.png","assetNum":"1020700"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1020700.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10207.png","assetNum":"10207"},"023":{"id":"023","name":"Budclaw","forms":{"regional_0":{"formName":"Mudflat Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1016101.png","assetNum":"1016101"},"Mudflat Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1016101.png","assetNum":"1016101"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10161.png","assetNum":"1016100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10161.png","assetNum":"1016100"},"regional_2":{"formName":"Bay Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1016103.png","assetNum":"1016103"},"Bay Form":{"formKey":"regional_2","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1016103.png","assetNum":"1016103"},"regional_1":{"formName":"Beach Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1016102.png","assetNum":"1016102"},"Beach Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1016102.png","assetNum":"1016102"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10161.png","assetNum":"10161"},"024":{"id":"024","name":"Shrubclaw","forms":{"regional_0":{"formName":"Mudflat Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1016201.png","assetNum":"1016201"},"Mudflat Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1016201.png","assetNum":"1016201"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10162.png","assetNum":"1016200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10162.png","assetNum":"1016200"},"regional_2":{"formName":"Bay Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016203.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1016203.png","assetNum":"1016203"},"Bay Form":{"formKey":"regional_2","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016203.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1016203.png","assetNum":"1016203"},"regional_1":{"formName":"Beach Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1016202.png","assetNum":"1016202"},"Beach Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1016202.png","assetNum":"1016202"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10162.png","assetNum":"10162"},"025":{"id":"025","name":"Geoclaw","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10163.png","assetNum":"1016300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10163.png","assetNum":"1016300"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1016300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10163.png","assetNum":"10163"},"026":{"id":"026","name":"Sparki","forms":{"regional_1":{"formName":"Forest Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1033102.png","assetNum":"1033102"},"Forest Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1033102.png","assetNum":"1033102"},"regional_0":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1033101.png","assetNum":"1033101"},"Highland Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1033101.png","assetNum":"1033101"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10331.png","assetNum":"1033100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10331.png","assetNum":"1033100"},"regional_2":{"formName":"Sea of Flowers Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1033103.png","assetNum":"1033103"},"Sea of Flowers Form":{"formKey":"regional_2","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1033103.png","assetNum":"1033103"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10331.png","assetNum":"10331"},"027":{"id":"027","name":"Flamerion","forms":{"regional_1":{"formName":"Forest Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1033302.png","assetNum":"1033302"},"Forest Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1033302.png","assetNum":"1033302"},"regional_2":{"formName":"Sea of Flowers Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033303.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1033303.png","assetNum":"1033303"},"Sea of Flowers Form":{"formKey":"regional_2","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033303.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1033303.png","assetNum":"1033303"},"regional_0":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1033301.png","assetNum":"1033301"},"Highland Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1033301.png","assetNum":"1033301"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10333.png","assetNum":"1033300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10333.png","assetNum":"1033300"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1033300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10333.png","assetNum":"10333"},"028":{"id":"028","name":"Flutternym","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10231.png","assetNum":"1023100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10231.png","assetNum":"1023100"},"regional_0":{"formName":"Sea of Flowers Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1023101.png","assetNum":"1023101"},"Sea of Flowers Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1023101.png","assetNum":"1023101"},"regional_2":{"formName":"Mountain Woods Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1023103.png","assetNum":"1023103"},"Mountain Woods Form":{"formKey":"regional_2","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1023103.png","assetNum":"1023103"},"regional_1":{"formName":"Nighttime Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1023102.png","assetNum":"1023102"},"Nighttime Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1023102.png","assetNum":"1023102"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10231.png","assetNum":"10231"},"029":{"id":"029","name":"Gracewing","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10232.png","assetNum":"1023200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10232.png","assetNum":"1023200"},"regional_0":{"formName":"Sea of Flowers Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1023201.png","assetNum":"1023201"},"Sea of Flowers Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1023201.png","assetNum":"1023201"},"regional_1":{"formName":"Nighttime Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1023202.png","assetNum":"1023202"},"Nighttime Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1023202.png","assetNum":"1023202"},"regional_2":{"formName":"Mountain Woods Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023203.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1023203.png","assetNum":"1023203"},"Mountain Woods Form":{"formKey":"regional_2","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023203.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1023203.png","assetNum":"1023203"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10232.png","assetNum":"10232"},"030":{"id":"030","name":"Somniwing","forms":{"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10233.png","assetNum":"1023300"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1023300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10233.png","assetNum":"1023300"}}},"031":{"id":"031","name":"Eko","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1044100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10441.png","assetNum":"1044100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1044100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10441.png","assetNum":"1044100"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1044100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10441.png","assetNum":"10441"},"032":{"id":"032","name":"Eklue","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1044300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10443.png","assetNum":"1044300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1044300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10443.png","assetNum":"1044300"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1044300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10443.png","assetNum":"10443"},"033":{"id":"033","name":"Budsquire","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10321.png","assetNum":"1032100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10321.png","assetNum":"1032100"},"regional_0":{"formName":"Towerwood Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1032103.png","assetNum":"1032103"},"Towerwood Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1032103.png","assetNum":"1032103"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10321.png","assetNum":"10321"},"034":{"id":"034","name":"Thornblade","forms":{"regional_0":{"formName":"Towerwood Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032303.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1032303.png","assetNum":"1032303"},"Towerwood Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032303.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1032303.png","assetNum":"1032303"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1032302.png","assetNum":"1032302"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1032302.png","assetNum":"1032302"},"weather_0":{"formName":"Thunderstorm Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1032301.png","assetNum":"1032301"},"Thunderstorm Form":{"formKey":"weather_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1032301.png","assetNum":"1032301"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10323.png","assetNum":"1032300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10323.png","assetNum":"1032300"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10323.png","assetNum":"10323"},"035":{"id":"035","name":"Melloblum","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10324.png","assetNum":"1032400"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10324.png","assetNum":"1032400"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032402.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1032402.png","assetNum":"1032402"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032402.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1032402.png","assetNum":"1032402"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1032400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10324.png","assetNum":"10324"},"036":{"id":"036","name":"Pomegg","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10471.png","assetNum":"1047100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10471.png","assetNum":"1047100"},"regional_2":{"formName":"Sea of Flowers Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1047103.png","assetNum":"1047103"},"Sea of Flowers Form":{"formKey":"regional_2","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1047103.png","assetNum":"1047103"},"regional_0":{"formName":"Snowfield Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1047101.png","assetNum":"1047101"},"Snowfield Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1047101.png","assetNum":"1047101"},"regional_1":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1047102.png","assetNum":"1047102"},"Highland Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1047102.png","assetNum":"1047102"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10471.png","assetNum":"10471"},"037":{"id":"037","name":"Pomawk","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10475.png","assetNum":"1047500"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10475.png","assetNum":"1047500"},"regional_0":{"formName":"Snowfield Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047501.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1047501.png","assetNum":"1047501"},"Snowfield Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047501.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1047501.png","assetNum":"1047501"},"regional_1":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047502.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1047502.png","assetNum":"1047502"},"Highland Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047502.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1047502.png","assetNum":"1047502"},"regional_2":{"formName":"Sea of Flowers Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047503.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1047503.png","assetNum":"1047503"},"Sea of Flowers Form":{"formKey":"regional_2","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047503.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1047503.png","assetNum":"1047503"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1047500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10475.png","assetNum":"10475"},"038":{"id":"038","name":"Dewy","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1035100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10351.png","assetNum":"1035100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1035100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10351.png","assetNum":"1035100"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1035100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10351.png","assetNum":"10351"},"039":{"id":"039","name":"Fragrancier","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1035200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10352.png","assetNum":"1035200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1035200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10352.png","assetNum":"1035200"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1035200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10352.png","assetNum":"10352"},"040":{"id":"040","name":"Wisptis","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10031.png","assetNum":"1003100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10031.png","assetNum":"1003100"},"regional_0":{"formName":"Forest Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1003101.png","assetNum":"1003101"},"Forest Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1003101.png","assetNum":"1003101"},"regional_1":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1003103.png","assetNum":"1003103"},"Highland Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003103.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1003103.png","assetNum":"1003103"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10031.png","assetNum":"10031"},"041":{"id":"041","name":"Ignitis","forms":{"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1003202.png","assetNum":"1003202"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1003202.png","assetNum":"1003202"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10032.png","assetNum":"1003200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10032.png","assetNum":"1003200"},"regional_0":{"formName":"Forest Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1003201.png","assetNum":"1003201"},"Forest Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1003201.png","assetNum":"1003201"},"regional_1":{"formName":"Highland Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003203.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1003203.png","assetNum":"1003203"},"Highland Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003203.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1003203.png","assetNum":"1003203"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1003200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10032.png","assetNum":"10032"},"042":{"id":"042","name":"Bonesky","forms":{"regional_0":{"formName":"Nighttime Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1013102.png","assetNum":"1013102"},"Nighttime Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1013102.png","assetNum":"1013102"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10131.png","assetNum":"1013100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10131.png","assetNum":"1013100"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10131.png","assetNum":"10131"},"043":{"id":"043","name":"Fenrier","forms":{"regional_0":{"formName":"Nighttime Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1013202.png","assetNum":"1013202"},"Nighttime Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1013202.png","assetNum":"1013202"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10132.png","assetNum":"1013200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10132.png","assetNum":"1013200"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10132.png","assetNum":"10132"},"044":{"id":"044","name":"Glynsera","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10133.png","assetNum":"1013300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10133.png","assetNum":"1013300"},"regional_0":{"formName":"Nighttime Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1013302.png","assetNum":"1013302"},"Nighttime Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1013302.png","assetNum":"1013302"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1013301.png","assetNum":"1013301"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1013301.png","assetNum":"1013301"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1013300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10133.png","assetNum":"10133"},"045":{"id":"045","name":"Bolty","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1022100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10221.png","assetNum":"1022100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1022100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10221.png","assetNum":"1022100"},"regional_0":{"formName":"Mountain Woods Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1022102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1022102.png","assetNum":"1022102"},"Mountain Woods Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1022102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1022102.png","assetNum":"1022102"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1022100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10221.png","assetNum":"10221"},"046":{"id":"046","name":"Blazen","forms":{"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1022201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1022201.png","assetNum":"1022201"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1022201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1022201.png","assetNum":"1022201"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1022200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10222.png","assetNum":"1022200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1022200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10222.png","assetNum":"1022200"},"regional_0":{"formName":"Mountain Woods Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1022202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1022202.png","assetNum":"1022202"},"Mountain Woods Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1022202.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1022202.png","assetNum":"1022202"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1022200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10222.png","assetNum":"10222"},"047":{"id":"047","name":"Squarrel","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1051100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10511.png","assetNum":"1051100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1051100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10511.png","assetNum":"1051100"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1051100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10511.png","assetNum":"10511"},"048":{"id":"048","name":"Squashel","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1051200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10512.png","assetNum":"1051200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1051200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10512.png","assetNum":"1051200"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1051200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10512.png","assetNum":"10512"},"049":{"id":"049","name":"Susuta","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10171.png","assetNum":"1017100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10171.png","assetNum":"1017100"},"regional_0":{"formName":"Nighttime Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1017101.png","assetNum":"1017101"},"Nighttime Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1017101.png","assetNum":"1017101"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10171.png","assetNum":"10171"},"050":{"id":"050","name":"Popota","forms":{"regional_0":{"formName":"Nighttime Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1017201.png","assetNum":"1017201"},"Nighttime Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1017201.png","assetNum":"1017201"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10172.png","assetNum":"1017200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10172.png","assetNum":"1017200"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10172.png","assetNum":"10172"},"051":{"id":"051","name":"Piopiota","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10173.png","assetNum":"1017300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10173.png","assetNum":"1017300"},"regional_0":{"formName":"Nighttime Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1017301.png","assetNum":"1017301"},"Nighttime Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1017301.png","assetNum":"1017301"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10173.png","assetNum":"10173"},"052":{"id":"052","name":"Panpanta","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10174.png","assetNum":"1017400"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10174.png","assetNum":"1017400"},"regional_0":{"formName":"Nighttime Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017401.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1017401.png","assetNum":"1017401"},"Nighttime Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017401.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1017401.png","assetNum":"1017401"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017402.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1017402.png","assetNum":"1017402"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017402.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1017402.png","assetNum":"1017402"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1017400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10174.png","assetNum":"10174"},"053":{"id":"053","name":"Shelly","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1019100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10191.png","assetNum":"1019100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1019100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10191.png","assetNum":"1019100"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1019100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10191.png","assetNum":"10191"},"054":{"id":"054","name":"Sheldon","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1019200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10192.png","assetNum":"1019200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1019200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10192.png","assetNum":"1019200"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1019200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10192.png","assetNum":"10192"},"055":{"id":"055","name":"Sherro","forms":{"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1019402.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1019402.png","assetNum":"1019402"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1019402.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1019402.png","assetNum":"1019402"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1019400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10194.png","assetNum":"1019400"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1019400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10194.png","assetNum":"1019400"},"weather_0":{"formName":"Thunderstorm Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1019401.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1019401.png","assetNum":"1019401"},"Thunderstorm Form":{"formKey":"weather_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1019401.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1019401.png","assetNum":"1019401"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1019400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10194.png","assetNum":"10194"},"056":{"id":"056","name":"Baleetle","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10451.png","assetNum":"1045100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10451.png","assetNum":"1045100"},"regional_0":{"formName":"Snowfield Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1045101.png","assetNum":"1045101"},"Snowfield Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1045101.png","assetNum":"1045101"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10451.png","assetNum":"10451"},"057":{"id":"057","name":"Waleetle","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10453.png","assetNum":"1045300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10453.png","assetNum":"1045300"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1045302.png","assetNum":"1045302"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1045302.png","assetNum":"1045302"},"regional_0":{"formName":"Snowfield Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1045301.png","assetNum":"1045301"},"Snowfield Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1045301.png","assetNum":"1045301"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10453.png","assetNum":"10453"},"058":{"id":"058","name":"Bouldus","forms":{"regional_0":{"formName":"Snowfield Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045401.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1045401.png","assetNum":"1045401"},"Snowfield Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045401.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1045401.png","assetNum":"1045401"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10454.png","assetNum":"1045400"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10454.png","assetNum":"1045400"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1045400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10454.png","assetNum":"10454"},"059":{"id":"059","name":"Fentuft","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1029100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10291.png","assetNum":"1029100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1029100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10291.png","assetNum":"1029100"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1029100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10291.png","assetNum":"10291"},"060":{"id":"060","name":"Fenmane","forms":{"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1029301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1029301.png","assetNum":"1029301"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1029301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1029301.png","assetNum":"1029301"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1029300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10293.png","assetNum":"1029300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1029300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10293.png","assetNum":"1029300"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1029300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10293.png","assetNum":"10293"},"061":{"id":"061","name":"Helmut","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10021.png","assetNum":"1002100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10021.png","assetNum":"1002100"},"regional_0":{"formName":"Snowfield Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002101.png","assetNum":"1002101"},"Snowfield Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002101.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002101.png","assetNum":"1002101"},"regional_1":{"formName":"Mountain Woods Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002102.png","assetNum":"1002102"},"Mountain Woods Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002102.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002102.png","assetNum":"1002102"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10021.png","assetNum":"10021"},"062":{"id":"062","name":"Pawney","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002600.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10026.png","assetNum":"1002600"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002600.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10026.png","assetNum":"1002600"},"regional_0":{"formName":"Snowfield Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002601.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002601.png","assetNum":"1002601"},"Snowfield Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002601.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002601.png","assetNum":"1002601"},"regional_1":{"formName":"Mountain Woods Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002602.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002602.png","assetNum":"1002602"},"Mountain Woods Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002602.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002602.png","assetNum":"1002602"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002603.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002603.png","assetNum":"1002603"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002603.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002603.png","assetNum":"1002603"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002600.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10026.png","assetNum":"10026"},"063":{"id":"063","name":"Rookey","forms":{"regional_0":{"formName":"Snowfield Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002701.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002701.png","assetNum":"1002701"},"Snowfield Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002701.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002701.png","assetNum":"1002701"},"regional_1":{"formName":"Mountain Woods Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002702.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002702.png","assetNum":"1002702"},"Mountain Woods Form":{"formKey":"regional_1","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002702.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002702.png","assetNum":"1002702"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002700.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10027.png","assetNum":"1002700"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002700.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10027.png","assetNum":"1002700"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002700.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10027.png","assetNum":"10027"},"064":{"id":"064","name":"Jawling","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10024.png","assetNum":"1002400"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10024.png","assetNum":"1002400"},"regional_0":{"formName":"Mountain Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002401.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002401.png","assetNum":"1002401"},"Mountain Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002401.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002401.png","assetNum":"1002401"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10024.png","assetNum":"10024"},"065":{"id":"065","name":"Helmwhelp","forms":{"regional_0":{"formName":"Mountain Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002201.png","assetNum":"1002201"},"Mountain Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002201.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002201.png","assetNum":"1002201"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10022.png","assetNum":"1002200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10022.png","assetNum":"1002200"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10022.png","assetNum":"10022"},"066":{"id":"066","name":"Helgon","forms":{"regional_0":{"formName":"Mountain Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002301.png","assetNum":"1002301"},"Mountain Form":{"formKey":"regional_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002301.png","assetNum":"1002301"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10023.png","assetNum":"1002300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10023.png","assetNum":"1002300"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10023.png","assetNum":"10023"},"067":{"id":"067","name":"Infergon","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10025.png","assetNum":"1002500"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10025.png","assetNum":"1002500"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002503.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002503.png","assetNum":"1002503"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002503.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1002503.png","assetNum":"1002503"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1002500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10025.png","assetNum":"10025"},"068":{"id":"068","name":"Cubbo","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1050100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10501.png","assetNum":"1050100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1050100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10501.png","assetNum":"1050100"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1050100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10501.png","assetNum":"10501"},"069":{"id":"069","name":"Grizbo","forms":{"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1050301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1050301.png","assetNum":"1050301"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1050301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1050301.png","assetNum":"1050301"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1050300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10503.png","assetNum":"1050300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1050300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10503.png","assetNum":"1050300"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1050300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10503.png","assetNum":"10503"},"070":{"id":"070","name":"Pebbling","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10281.png","assetNum":"1028100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10281.png","assetNum":"1028100"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10281.png","assetNum":"10281"},"071":{"id":"071","name":"Lavazar","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10282.png","assetNum":"1028200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10282.png","assetNum":"1028200"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10282.png","assetNum":"10282"},"072":{"id":"072","name":"Magmarex","forms":{"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1028301.png","assetNum":"1028301"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1028301.png","assetNum":"1028301"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10283.png","assetNum":"1028300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10283.png","assetNum":"1028300"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10283.png","assetNum":"10283"},"073":{"id":"073","name":"Geodeback","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10284.png","assetNum":"1028400"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10284.png","assetNum":"1028400"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028400.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10284.png","assetNum":"10284"},"074":{"id":"074","name":"Minespine","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10285.png","assetNum":"1028500"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10285.png","assetNum":"1028500"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1028500.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10285.png","assetNum":"10285"},"075":{"id":"075","name":"Cozite","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1043100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10431.png","assetNum":"1043100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1043100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10431.png","assetNum":"1043100"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1043100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10431.png","assetNum":"10431"},"076":{"id":"076","name":"Bailite","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1043300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10433.png","assetNum":"1043300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1043300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10433.png","assetNum":"1043300"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1043300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10433.png","assetNum":"10433"},"077":{"id":"077","name":"Bulbly","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1014100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10141.png","assetNum":"1014100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1014100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10141.png","assetNum":"1014100"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1014100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10141.png","assetNum":"10141"},"078":{"id":"078","name":"Veilfloat","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1014200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10142.png","assetNum":"1014200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1014200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10142.png","assetNum":"1014200"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1014200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10142.png","assetNum":"10142"},"079":{"id":"079","name":"Luminelle","forms":{"weather_0":{"formName":"Rainstorm Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1014301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1014301.png","assetNum":"1014301"},"Rainstorm Form":{"formKey":"weather_0","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1014301.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1014301.png","assetNum":"1014301"},"prismana":{"formName":"Prismana Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1014302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1014302.png","assetNum":"1014302"},"Prismana Form":{"formKey":"prismana","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1014302.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_1014302.png","assetNum":"1014302"},"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1014300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10143.png","assetNum":"1014300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1014300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10143.png","assetNum":"1014300"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1014300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10143.png","assetNum":"10143"},"080":{"id":"080","name":"Fahloo","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1048100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10481.png","assetNum":"1048100"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1048100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10481.png","assetNum":"1048100"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1048100.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10481.png","assetNum":"10481"},"081":{"id":"081","name":"Erlath","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1048300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10483.png","assetNum":"1048300"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1048300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10483.png","assetNum":"1048300"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1048300.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10483.png","assetNum":"10483"},"082":{"id":"082","name":"Besauce","forms":{"basic":{"formName":"Basic Form","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1012200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10122.png","assetNum":"1012200"},"Basic Form":{"formKey":"basic","videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1012200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10122.png","assetNum":"1012200"}},"videoUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/1012200.mp4","imageUrl":"https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_10122.png","assetNum":"10122"},"083":{"id":"083","name":"Dazmand","forms":{}},"084":{"id":"084","name":"Fulmintis","forms":{}},"085":{"id":"085","name":"Fennelun","forms":{}},"086":{"id":"086","name":"Lunara","forms":{}},"087":{"id":"087","name":"Soleon","forms":{}},"088":{"id":"088","name":"Helion","forms":{}},"089":{"id":"089","name":"Morphling","forms":{}},"090":{"id":"090","name":"Jabster","forms":{}},"091":{"id":"091","name":"Little Fire Spirit (Sparkelf)","forms":{}},"092":{"id":"092","name":"Irisalis","forms":{}}};

const wikiAssetNums = {"001":"10051","002":"10052","003":"10053","004":"10055","005":"10011","006":"10012","007":"10181","008":"10184","009":"10185","010":"10187","011":"10211","012":"10212","013":"10041","014":"10042","015":"10043","016":"10045","017":"10261","018":"10262","019":"10263","020":"10201","021":"10203","022":"10207","023":"10161","024":"10162","025":"10163","026":"10331","027":"10333","028":"10231","029":"10232","031":"10441","032":"10443","033":"10321","034":"10323","035":"10324","036":"10471","037":"10475","038":"10351","039":"10352","040":"10031","041":"10032","042":"10131","043":"10132","044":"10133","045":"10221","046":"10222","047":"10511","048":"10512","049":"10171","050":"10172","051":"10173","052":"10174","053":"10191","054":"10192","055":"10194","056":"10451","057":"10453","058":"10454","059":"10291","060":"10293","061":"10021","062":"10026","063":"10027","064":"10024","065":"10022","066":"10023","067":"10025","068":"10501","069":"10503","070":"10281","071":"10282","072":"10283","073":"10284","074":"10285","075":"10431","076":"10433","077":"10141","078":"10142","079":"10143","080":"10481","081":"10483","082":"10122","030":"10233","083":"10474","084":"10033","085":"10373","086":"10371","087":"10363","088":"10361","091":"69993","092":"10212"};

let currentViewer = null;

function destroy3DViewer() {
  if (currentViewer) {
    if (currentViewer.animId) {
      cancelAnimationFrame(currentViewer.animId);
      currentViewer.animId = null;
    }
    if (currentViewer.video) {
      currentViewer.video.onplay = null;
      currentViewer.video.onerror = null;
      currentViewer.video.onabort = null;
      currentViewer.video.pause();
      currentViewer.video.src = '';
      currentViewer.video = null;
    }
    if (currentViewer.gl) {
      try {
        const loseExt = currentViewer.gl.getExtension('WEBGL_lose_context');
        if (loseExt) loseExt.loseContext();
      } catch (e) {}
      currentViewer.gl = null;
    }
    currentViewer = null;
  }
}

function init3DViewer(canvas, videoUrl, loaderEl) {
  destroy3DViewer();
  if (!canvas || !videoUrl) return;

  let gl = null;
  try {
    gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true });
  } catch (e) {
    console.warn('WebGL initialization failed:', e);
  }

  if (!gl) {
    if (loaderEl) loaderEl.innerHTML = '<span style="color:#ef4444; font-size: 0.8rem;">WebGL not supported</span>';
    return;
  }

  const vsSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  const fsSource = `
    precision mediump float;
    uniform sampler2D u_video;
    varying vec2 v_texCoord;
    void main() {
      vec2 colorUv = vec2(v_texCoord.x, v_texCoord.y * 0.5);
      vec2 alphaUv = vec2(v_texCoord.x, 0.5 + v_texCoord.y * 0.5);
      vec4 color = texture2D(u_video, colorUv);
      float alpha = texture2D(u_video, alphaUv).r;
      alpha = smoothstep(0.03, 0.97, alpha);
      gl_FragColor = vec4(color.rgb * alpha, alpha);
    }
  `;

  function createShader(gl, type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return s;
  }

  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vsSource));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(program);
  gl.useProgram(program);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // Position buffer
  const posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1,
  ]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Texcoord buffer
  const texBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 1,
    1, 1,
    0, 0,
    1, 0,
  ]), gl.STATIC_DRAW);

  const aTex = gl.getAttribLocation(program, 'a_texCoord');
  gl.enableVertexAttribArray(aTex);
  gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0);

  // Texture
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.src = videoUrl;
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  currentViewer = { canvas, gl, video, animId: null };

  let hasShownFirstFrame = false;
  function render() {
    if (!currentViewer || currentViewer.canvas !== canvas) return;
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      if (!hasShownFirstFrame) {
        hasShownFirstFrame = true;
        if (loaderEl) {
          loaderEl.style.opacity = '0';
          setTimeout(() => { if (loaderEl) loaderEl.style.display = 'none'; }, 200);
        }
      }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    currentViewer.animId = requestAnimationFrame(render);
  }

  video.onerror = (e) => {
    console.warn('3D Video load notice:', e);
    if (loaderEl) {
      loaderEl.innerHTML = '<span style="color:#94a3b8; font-size: 0.8rem;">Loading 3D stream...</span>';
    }
  };

  video.play().then(() => {
    render();
  }).catch(err => {
    console.warn('Video autoplay notice:', err);
    render();
  });
}

window.setModalVisualMode = function(mode) {
  const canvas = document.getElementById('modal3DCanvas');
  const img = document.getElementById('modalFullImg');
  const btn3D = document.getElementById('btnToggle3D');
  const btn2D = document.getElementById('btnToggle2D');
  const badge = document.getElementById('modalVisualBadge');

  if (mode === '3d') {
    if (canvas) canvas.style.display = 'block';
    if (img) img.style.display = 'none';
    if (btn3D) btn3D.classList.add('active');
    if (btn2D) btn2D.classList.remove('active');
    if (badge) badge.textContent = '🌀 3D Animation';
    if (currentViewer && currentViewer.video && currentViewer.video.paused) {
      currentViewer.video.play().catch(() => {});
    }
  } else {
    if (canvas) canvas.style.display = 'none';
    if (img) img.style.display = 'block';
    if (btn3D) btn3D.classList.remove('active');
    if (btn2D) btn2D.classList.add('active');
    if (badge) badge.textContent = '🖼️ Full Illustration';
    if (currentViewer && currentViewer.video) {
      currentViewer.video.pause();
    }
  }
};

function getActiveFormData(item, tabKey) {
  const basic = item.forms.basic;
  const regionalForms = item.forms.regional || [];
  const weatherForms = item.forms.weather || [];
  const prismanaForm = (item.id === '030') ? item.forms.basic : item.forms.prismana;

  if (item.id === '030') {
    return { data: basic, tabKey: 'prismana', isPris: true };
  }

  if (tabKey && tabKey.startsWith('regional_')) {
    const idx = parseInt(tabKey.split('_')[1], 10);
    if (regionalForms[idx]) return { data: regionalForms[idx], tabKey, isPris: false };
  }
  if (tabKey && tabKey.startsWith('weather_')) {
    const idx = parseInt(tabKey.split('_')[1], 10);
    if (weatherForms[idx]) return { data: weatherForms[idx], tabKey, isPris: false };
  }
  if (tabKey === 'prismana' && prismanaForm) {
    return { data: prismanaForm, tabKey: 'prismana', isPris: true };
  }

  // Also match by form name string if passed directly
  if (tabKey && tabKey !== 'basic') {
    const regIdx = regionalForms.findIndex(rf => rf.form_name && (rf.form_name.toLowerCase() === tabKey.toLowerCase() || tabKey.toLowerCase().includes(rf.form_name.toLowerCase())));
    if (regIdx !== -1) return { data: regionalForms[regIdx], tabKey: `regional_${regIdx}`, isPris: false };

    const weaIdx = weatherForms.findIndex(wf => wf.form_name && (wf.form_name.toLowerCase() === tabKey.toLowerCase() || tabKey.toLowerCase().includes(wf.form_name.toLowerCase())));
    if (weaIdx !== -1) return { data: weatherForms[weaIdx], tabKey: `weather_${weaIdx}`, isPris: false };

    if (prismanaForm && (tabKey.toLowerCase().includes('prismana') || (prismanaForm.form_name && tabKey.toLowerCase().includes(prismanaForm.form_name.toLowerCase())))) {
      return { data: prismanaForm, tabKey: 'prismana', isPris: true };
    }
  }

  return { data: basic, tabKey: 'basic', isPris: false };
}

function renderModalFormTabs(item, activeTabKey) {
  const regionalForms = item.forms.regional || [];
  const weatherForms = item.forms.weather || [];
  const prismanaForm = (item.id === '030') ? null : item.forms.prismana;

  const totalForms = 1 + regionalForms.length + weatherForms.length + (prismanaForm ? 1 : 0);
  if (totalForms <= 1) return '';

  let tabs = [];
  tabs.push(`
    <button type="button" class="btn-modal-form-tab ${activeTabKey === 'basic' ? 'active' : ''}" 
            onclick="switchModalForm('${item.id}', 'basic')">
      Basic Form
    </button>
  `);

  regionalForms.forEach((rf, i) => {
    const key = `regional_${i}`;
    tabs.push(`
      <button type="button" class="btn-modal-form-tab ${activeTabKey === key ? 'active' : ''}" 
              onclick="switchModalForm('${item.id}', '${key}')">
        🗺️ ${rf.form_name}
      </button>
    `);
  });

  weatherForms.forEach((wf, i) => {
    const key = `weather_${i}`;
    tabs.push(`
      <button type="button" class="btn-modal-form-tab ${activeTabKey === key ? 'active' : ''}" 
              onclick="switchModalForm('${item.id}', '${key}')">
        ⚡ ${wf.form_name}
      </button>
    `);
  });

  if (prismanaForm) {
    tabs.push(`
      <button type="button" class="btn-modal-form-tab is-prismana ${activeTabKey === 'prismana' ? 'active' : ''}" 
              onclick="switchModalForm('${item.id}', 'prismana')">
        🌈 Prismana Form
      </button>
    `);
  }

  return `
    <div class="modal-form-tabs-bar">
      ${tabs.join('')}
    </div>
  `;
}

window.switchModalForm = function(id, tabKey) {
  cardActiveTabs[id] = tabKey;
  openDetailModal(id, tabKey);
  // Also keep background card in sync
  const card = document.getElementById(`aniimo-${id}`);
  if (card) {
    applyFilters();
  }
};

window.openDetailModal = function(id, selectedTabKey) {
  const item = allAniimo.find(a => a.id === id || a.slug === id || (typeof id === 'string' && id.startsWith(a.id)));
  if (!item) return;

  // Destroy previous 3D viewer
  destroy3DViewer();

  // Determine active form (defaults to card's active form if selectedTabKey not provided)
  const activeTab = selectedTabKey || cardActiveTabs[item.id] || 'basic';
  const { data: activeForm, tabKey: currentTabKey, isPris } = getActiveFormData(item, activeTab);

  // Dynamic SEO Title and Deep Link Hash
  document.title = `${item.name} (${item.display_id}) ${activeForm.form_name} | Aniimo Guide`;
  const searchStr = window.location.search || '';
  history.replaceState(null, null, `${window.location.pathname}${searchStr}#${item.id}-${item.slug}`);

  // Official Wiki Asset (3D animation video and official full-res illustration)
  const creatureMedia = wikiMediaMap[item.id] || null;
  let formMedia = null;
  if (creatureMedia && creatureMedia.forms) {
    formMedia = creatureMedia.forms[currentTabKey] ||
                creatureMedia.forms[activeForm.form_name] ||
                creatureMedia.forms[activeTab] ||
                (currentTabKey === 'basic' ? (creatureMedia.forms['Basic Form'] || creatureMedia.forms['basic']) : null);
  }

  // Form-specific 3D Video URL
  const baseAssetNum = creatureMedia?.assetNum || wikiAssetNums[item.id] || null;
  const video3DUrl = formMedia?.videoUrl || 
                     (currentTabKey === 'basic' && creatureMedia?.videoUrl) ||
                     (currentTabKey === 'basic' && baseAssetNum ? `https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/${baseAssetNum}00.mp4` : null);

  const has3D = Boolean(video3DUrl);

  // Form-specific Full-Res Illustration URL
  const fullIllustrationUrl = formMedia?.imageUrl || 
                              (currentTabKey !== 'basic' && activeForm.image ? activeForm.image : null) ||
                              creatureMedia?.imageUrl || 
                              (baseAssetNum ? `https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/init/Wiki_Aniimo_${baseAssetNum}.png` : (item.image || `images/${item.slug}.png`));

  // Primary element glow backdrop
  const elementGlows = {
    Fire: 'rgba(239, 68, 68, 0.32)',
    Grass: 'rgba(34, 197, 94, 0.28)',
    Water: 'rgba(59, 130, 246, 0.32)',
    Earth: 'rgba(217, 119, 6, 0.3)',
    Lightning: 'rgba(234, 179, 8, 0.3)',
    Ice: 'rgba(6, 182, 212, 0.32)',
    Wind: 'rgba(20, 184, 166, 0.3)',
    Dark: 'rgba(168, 85, 247, 0.32)',
    Light: 'rgba(245, 158, 11, 0.3)'
  };
  const activeAbilities = activeForm.abilities || { ...(activeForm.elements || {}), ...(activeForm.utilities || {}) };
  const primaryEl = (activeForm.elements && Object.keys(activeForm.elements)[0]) || Object.keys(activeAbilities)[0] || 'Fire';
  const glowColor = elementGlows[primaryEl] || 'rgba(56, 189, 248, 0.3)';
  const showcaseBg = `radial-gradient(circle at 50% 50%, ${glowColor} 0%, rgba(15, 23, 42, 0.7) 65%, rgba(10, 15, 30, 0.98) 100%)`;

  // Proficiency pills for this active form
  const elementsHtml = Object.entries(activeAbilities).map(([abilName, lvl]) => {
    const meta = abilityMeta[abilName] || { emoji: '⭐', displayName: abilName, color: '#38bdf8', desc: abilName };
    return `
      <span class="homeland-pill" style="background-color: ${meta.color};" title="${meta.desc}">
        <span class="pill-icon">${meta.emoji}</span>
        <span class="pill-name">${meta.displayName}</span>
        <span class="pill-lvl">Lv.${lvl}</span>
      </span>
    `;
  }).join('');

  // Form Switcher Tabs bar
  const formTabsHtml = renderModalFormTabs(item, currentTabKey);

  modalBody.innerHTML = `
    <div class="modal-hero-grid">
      <!-- Left Visual Showcase Column (Full Form 3D Animation & Full Illustration) -->
      <div class="modal-visual-column">
        <div class="modal-visual-showcase" style="background: ${showcaseBg};">
          <span class="modal-visual-badge" id="modalVisualBadge">${has3D ? '🌀 3D Animation' : '🖼️ Full Illustration'}</span>
          
          ${has3D ? `
            <canvas id="modal3DCanvas" class="modal-viewer-canvas" width="512" height="512"></canvas>
            <img id="modalFullImg" class="modal-viewer-img" src="${fullIllustrationUrl}" alt="${item.name} (${activeForm.form_name})" style="display: none;" onerror="this.onerror=null; this.src='images/${item.slug}.png';">
            <div id="modalViewerLoader" class="modal-viewer-loader">
              <div class="modal-spinner"></div>
              <span>Loading 3D Model...</span>
            </div>
          ` : `
            <img id="modalFullImg" class="modal-viewer-img" src="${fullIllustrationUrl}" alt="${item.name} (${activeForm.form_name})" onerror="this.onerror=null; this.src='images/${item.slug}.png';">
          `}
        </div>

        ${has3D ? `
          <div class="modal-visual-toolbar">
            <button type="button" class="btn-visual-toggle active" id="btnToggle3D" onclick="setModalVisualMode('3d')">
              <span>🌀</span> 3D Animation
            </button>
            <button type="button" class="btn-visual-toggle" id="btnToggle2D" onclick="setModalVisualMode('2d')">
              <span>🖼️</span> View Illustration
            </button>
          </div>
        ` : ''}
      </div>

      <!-- Right Meta Info Column -->
      <div class="modal-meta-column">
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap;">
          <span class="portrait-badge-id" style="${item.is_unnumbered ? 'background: rgba(234, 88, 12, 0.4); border: 1px solid rgba(234, 88, 12, 0.7);' : ''}">${item.display_id}</span>
          <span class="portrait-badge-stage stage-${item.tier}">${item.tier}</span>
          ${item.is_unnumbered ? '<span style="font-size: 0.75rem; color: #fb923c; background: rgba(234,88,12,0.15); padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 600;">Unnumbered in Current Dex</span>' : ''}
        </div>
        <h2 style="font-size: 2.1rem; font-weight: 800; margin-bottom: 0.15rem; line-height: 1.2;">${item.name}</h2>
        
        <!-- Active Form Title & Catch Rate -->
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
          <span style="font-size: 1.15rem; font-weight: 700; color: ${isPris ? '#ec4899' : '#38bdf8'};">${activeForm.form_name}</span>
          <span class="form-loc-tag" style="font-size: 0.8rem; padding: 0.2rem 0.5rem; border-radius: 4px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);">📍 Catch Rate: ${activeForm.catch_rate || '—'}</span>
        </div>

        <!-- Homeland Abilities of Current Form -->
        <div style="margin-bottom: 0.85rem;">
          <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 0.35rem;">Homeland Abilities & Roles</div>
          <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
            ${elementsHtml}
          </div>
        </div>

        <!-- Spawn Region -->
        <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.85rem; background: rgba(15, 23, 42, 0.5); padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
          <span style="color: #94a3b8; font-weight: 600;">🗺️ Spawn Region:</span> ${activeForm.region || 'Idyll Native Habitat'}
        </div>
        
        <!-- Passive Trait -->
        <div style="background: rgba(30, 41, 59, 0.7); padding: 0.65rem 0.9rem; border-radius: 8px; border-left: 3px solid #38bdf8; margin-bottom: 0.75rem;">
          <div style="font-size: 0.7rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em;">Passive Trait</div>
          <div style="color: white; font-weight: 700; margin: 0.15rem 0; font-size: 0.95rem;">${item.trait}</div>
          <div style="color: #cbd5e1; font-size: 0.82rem; line-height: 1.35;">${item.trait_effect}</div>
        </div>

        <!-- Matchups -->
        ${item.matchups && (item.matchups.weak_to.length || item.matchups.resists.length) ? `
          <div style="font-size: 0.8rem; display: flex; gap: 0.75rem; flex-wrap: wrap; background: rgba(15, 23, 42, 0.4); padding: 0.4rem 0.75rem; border-radius: 6px;">
            ${item.matchups.weak_to.length ? `<div><span style="color: #f87171; font-weight: bold;">Weak:</span> ${item.matchups.weak_to.join(', ')}</div>` : ''}
            ${item.matchups.resists.length ? `<div><span style="color: #4ade80; font-weight: bold;">Resists:</span> ${item.matchups.resists.join(', ')}</div>` : ''}
          </div>
        ` : ''}
      </div>
    </div>

    <!-- Form Switcher Navigation Bar inside Modal -->
    ${formTabsHtml}
  `;

  detailModal.classList.remove('hidden');

  if (has3D) {
    const canvas = document.getElementById('modal3DCanvas');
    const loader = document.getElementById('modalViewerLoader');
    init3DViewer(canvas, video3DUrl, loader);
  }
};

function closeDetailModal() {
  destroy3DViewer();
  detailModal.classList.add('hidden');
  document.title = defaultPageTitle;
  const searchStr = window.location.search || '';
  history.replaceState(null, null, `${window.location.pathname}${searchStr}`);
}

modalClose.addEventListener('click', closeDetailModal);
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) closeDetailModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !detailModal.classList.contains('hidden')) {
    closeDetailModal();
  }
});

// Filter Engine
function applyFilters() {
  const query = (searchInput.value || '').toLowerCase().trim();
  const selectedTier = tierFilter ? tierFilter.value : 'all';
  const selectedElement = elementFilter ? elementFilter.value : 'all';
  const minLvl = parseInt(minLevelFilter ? minLevelFilter.value : 1, 10) || 1;
  const sortBy = document.getElementById('sortByFilter')?.value || 'id_asc';

  let filtered = allAniimo.filter(item => {
    // Search query
    if (query) {
      const matchText = `${item.id} ${item.display_id} ${item.name} ${item.slug} ${item.tier} ${item.trait} ${item.trait_effect} ${JSON.stringify(item.forms)}`.toLowerCase();
      if (!matchText.includes(query)) return false;
    }

    // Tier filter
    if (selectedTier !== 'all' && item.tier !== selectedTier) {
      return false;
    }

    // Unnumbered form pill
    if (currentFormFilter === 'unnumbered' && !item.is_unnumbered) {
      return false;
    }

    // Candidate forms based on form filter
    let candidateForms = [];
    if (currentFormFilter === 'basic') {
      if (item.forms.basic) candidateForms.push({ key: 'basic', data: item.forms.basic });
    } else if (currentFormFilter === 'regional') {
      (item.forms.regional || []).forEach((rf, i) => candidateForms.push({ key: `regional_${i}`, data: rf }));
    } else if (currentFormFilter === 'weather') {
      (item.forms.weather || []).forEach((wf, i) => candidateForms.push({ key: `weather_${i}`, data: wf }));
    } else if (currentFormFilter === 'prismana') {
      if (item.id === '030') {
        candidateForms.push({ key: 'basic', data: item.forms.basic });
      } else if (item.forms.prismana) {
        candidateForms.push({ key: 'prismana', data: item.forms.prismana });
      }
    } else {
      if (item.forms.basic) candidateForms.push({ key: 'basic', data: item.forms.basic });
      (item.forms.regional || []).forEach((rf, i) => candidateForms.push({ key: `regional_${i}`, data: rf }));
      (item.forms.weather || []).forEach((wf, i) => candidateForms.push({ key: `weather_${i}`, data: wf }));
      if (item.forms.prismana && item.id !== '030') {
        candidateForms.push({ key: 'prismana', data: item.forms.prismana });
      }
    }

    if (candidateForms.length === 0) return false;

    // Ability / Element filter
    if (selectedElement !== 'all') {
      const hasMatchingAbility = candidateForms.some(({ data }) => {
        const abs = data.abilities || { ...(data.elements || {}), ...(data.utilities || {}) };
        return abs[selectedElement] && abs[selectedElement] >= minLvl;
      });
      if (!hasMatchingAbility) return false;
    } else if (minLvl > 1) {
      const hasAnyMinLvl = candidateForms.some(({ data }) => {
        const abs = data.abilities || { ...(data.elements || {}), ...(data.utilities || {}) };
        return Object.values(abs).some(lvl => lvl >= minLvl);
      });
      if (!hasAnyMinLvl) return false;
    }

    return true;
  });

  // Sorting
  const tierRank = { 'S-Tier': 4, 'A-Tier': 3, 'B-Tier': 2, 'C-Tier': 1 };
  filtered.sort((a, b) => {
    if (sortBy === 'max_lvl_desc') {
      const getMax = item => {
        let max = 0;
        const forms = [item.forms.basic, ...(item.forms.regional || []), ...(item.forms.weather || []), item.forms.prismana].filter(Boolean);
        forms.forEach(f => {
          const abs = f.abilities || { ...(f.elements || {}), ...(f.utilities || {}) };
          Object.values(abs).forEach(l => { if (l > max) max = l; });
        });
        return max;
      };
      return getMax(b) - getMax(a);
    }
    if (sortBy === 'tier_desc') {
      return (tierRank[b.tier] || 0) - (tierRank[a.tier] || 0);
    }
    if (sortBy === 'name_asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'catch_rate_asc') {
      const getRate = item => {
        const rateStr = item.forms?.basic?.catch_rate || '50%';
        return parseInt(rateStr, 10) || 50;
      };
      return getRate(a) - getRate(b);
    }
    // Default id_asc
    if (a.is_unnumbered && !b.is_unnumbered) return 1;
    if (!a.is_unnumbered && b.is_unnumbered) return -1;
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });

  renderCards(filtered);
  syncUrlParams();
}

function syncUrlParams() {
  const params = new URLSearchParams();
  const q = (searchInput.value || '').trim();
  if (q) params.set('search', q);
  if (tierFilter && tierFilter.value !== 'all') params.set('tier', tierFilter.value);
  if (elementFilter.value !== 'all') params.set('element', elementFilter.value);
  if (minLevelFilter.value !== '1') params.set('minLevel', minLevelFilter.value);
  if (currentFormFilter !== 'all') params.set('form', currentFormFilter);

  const searchStr = params.toString() ? '?' + params.toString() : '';
  const currentHash = window.location.hash || '';
  history.replaceState(null, null, `${window.location.pathname}${searchStr}${currentHash}`);
}

// Event Listeners
searchInput.addEventListener('input', applyFilters);
clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  applyFilters();
});

if (tierFilter) tierFilter.addEventListener('change', applyFilters);
elementFilter.addEventListener('change', applyFilters);

  const sortByFilter = document.getElementById('sortByFilter');
  if (sortByFilter) sortByFilter.addEventListener('change', applyFilters);

  

  const elSelect = document.getElementById('elementFilter');
  if (elSelect) {
    elSelect.addEventListener('change', () => {
      document.querySelectorAll('.btn-abil-filter').forEach(b => {
        b.classList.toggle('active', b.dataset.role === elSelect.value);
      });
    });
  }

minLevelFilter.addEventListener('change', applyFilters);

pillBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    pillBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFormFilter = btn.dataset.form;
    applyFilters();
  });
});

// App Initialization
(async function init() {
  // Restore filter state from URL search params
  const params = new URLSearchParams(window.location.search);
  if (params.get('search')) searchInput.value = params.get('search');
  if (params.get('tier') && tierFilter) tierFilter.value = params.get('tier');
  if (params.get('element')) elementFilter.value = params.get('element');
  if (params.get('minLevel')) minLevelFilter.value = params.get('minLevel');
  if (params.get('form')) {
    currentFormFilter = params.get('form');
    pillBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.form === currentFormFilter);
    });
  }

  fetchStats();
  allAniimo = await fetchAniimoData();
  applyFilters();
  initOptimizer();
  initSquadBuilder();
  initMainViewTabs();

  // Check URL hash or ?aniimo= to auto-open creature modal
  const hash = window.location.hash.replace('#', '').trim();
  const aniimoParam = params.get('aniimo');
  const target = aniimoParam || hash;
  if (target) {
    const idMatch = target.match(/^(\d{3}|[a-zA-Z0-9_-]+)/);
    const targetKey = idMatch ? idMatch[1] : target;
    const match = allAniimo.find(a => a.id === targetKey || a.slug === targetKey || target.startsWith(a.id));
    if (match) {
      openDetailModal(match.id);
    }
  }

  // Handle hash changes (back/forward browser navigation)
  window.addEventListener('hashchange', () => {
    const h = window.location.hash.replace('#', '').trim();
    if (!h) {
      if (!detailModal.classList.contains('hidden')) {
        detailModal.classList.add('hidden');
        document.title = defaultPageTitle;
      }
    } else {
      const match = allAniimo.find(a => h.startsWith(a.id) || h === a.slug);
      if (match) openDetailModal(match.id);
    }
  });

  // Back to Top button listener
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

// ==========================================================================
// Main View Tab Switcher (Directory / Optimizer / Squad / Guide)
// ==========================================================================
let currentMainView = 'dex';

window.switchMainView = function(viewName, shouldScroll = true) {
  const validViews = ['dex', 'optimizer', 'squad', 'guide'];
  if (!validViews.includes(viewName)) viewName = 'dex';
  currentMainView = viewName;

  // 1. Update Tab Buttons
  const tabButtons = document.querySelectorAll('.btn-nav-tab');
  tabButtons.forEach(btn => {
    const isCurrent = btn.getAttribute('data-view') === viewName;
    btn.classList.toggle('active', isCurrent);
    btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
  });

  // 2. DOM Elements
  const heroSection = document.getElementById('heroSection');
  const controlsCard = document.getElementById('controlsCard');
  const aniimoGrid = document.getElementById('aniimoGrid');
  const optimizerSection = document.getElementById('optimizerSection');
  const squadCardSection = document.getElementById('squadCardSection');
  const guideAccordionSection = document.getElementById('guideAccordionSection');
  const homelandGuide = document.getElementById('homelandGuide');

  const toggleEl = (el, show) => {
    if (!el) return;
    if (show) {
      el.classList.remove('view-section-hidden');
    } else {
      el.classList.add('view-section-hidden');
    }
  };

  // 3. View display mapping
  if (viewName === 'dex') {
    toggleEl(heroSection, true);
    toggleEl(controlsCard, true);
    toggleEl(aniimoGrid, true);
    toggleEl(optimizerSection, false);
    toggleEl(squadCardSection, false);
    toggleEl(guideAccordionSection, false);
    toggleEl(homelandGuide, false);
  } else if (viewName === 'optimizer') {
    toggleEl(heroSection, false);
    toggleEl(controlsCard, false);
    toggleEl(aniimoGrid, false);
    toggleEl(optimizerSection, true);
    toggleEl(squadCardSection, false);
    toggleEl(guideAccordionSection, false);
    toggleEl(homelandGuide, false);
  } else if (viewName === 'squad') {
    toggleEl(heroSection, false);
    toggleEl(controlsCard, false);
    toggleEl(aniimoGrid, false);
    toggleEl(optimizerSection, false);
    toggleEl(squadCardSection, true);
    toggleEl(guideAccordionSection, false);
    toggleEl(homelandGuide, false);
  } else if (viewName === 'guide') {
    toggleEl(heroSection, false);
    toggleEl(controlsCard, false);
    toggleEl(aniimoGrid, false);
    toggleEl(optimizerSection, false);
    toggleEl(squadCardSection, false);
    toggleEl(guideAccordionSection, true);
    toggleEl(homelandGuide, true);
    // Auto-expand accordion body for fast reading
    const body = document.getElementById('guideBody');
    const toggleBtn = document.getElementById('btnGuideToggle');
    const toggleText = document.getElementById('guideToggleText');
    if (body && body.classList.contains('hidden')) {
      body.classList.remove('hidden');
      if (toggleBtn) toggleBtn.classList.add('expanded');
      if (toggleText) toggleText.textContent = 'Collapse Guide';
    }
  }

  // 4. Update URL parameter without reloading
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', viewName);
    window.history.replaceState({ tab: viewName }, '', url.toString());
  } catch (e) {
    // Ignore URL errors in restricted environments
  }

  // 5. Scroll to top
  if (shouldScroll) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function initMainViewTabs() {
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const hash = (window.location.hash || '').toLowerCase();

  if (tabParam && ['dex', 'optimizer', 'squad', 'guide'].includes(tabParam)) {
    window.switchMainView(tabParam, false);
  } else if (hash.includes('optimizer')) {
    window.switchMainView('optimizer', false);
  } else if (hash.includes('squad')) {
    window.switchMainView('squad', false);
  } else if (hash.includes('guide')) {
    window.switchMainView('guide', false);
  } else {
    window.switchMainView('dex', false);
  }
}



// --- Homeland Estate Team Optimizer Logic ---
// Exponential level weights: Heavily prioritize Lv. 4 & Lv. 3; completely suppress Lv. 1 & 2
const LEVEL_WEIGHTS = { 4: 10000, 3: 1500, 2: 50, 1: 1 };

let optimizerInitialized = false;
let activeTeamOptionIndex = 0;
let cachedTeamOptions = [];
let hasCalculatedOnce = false;

function getWorkerSlots() {
  const input = document.getElementById('optWorkerSlots');
  if (!input) return 8;
  let val = parseInt(input.value, 10);
  if (isNaN(val) || val < 1) val = 1;
  return val; // No upper limit
}

function syncSlotChipsUI(val) {
  document.querySelectorAll('.btn-slot-chip').forEach(chip => {
    chip.classList.toggle('active', parseInt(chip.dataset.slots, 10) === val);
  });
}

function syncRoleCardsUI() {
  document.querySelectorAll('.role-pill-card').forEach(card => {
    const cb = card.querySelector('input[type="checkbox"]');
    if (cb) {
      card.classList.toggle('active', cb.checked);
    }
  });
}

function getSelectedRolesWithCounts() {
  const result = {};
  document.querySelectorAll('.role-pill-card').forEach(card => {
    const cb = card.querySelector('input[type="checkbox"]');
    if (cb && cb.checked) {
      const numInput = card.querySelector('.role-qty-num');
      let qty = parseInt(numInput ? numInput.value : 1, 10);
      if (isNaN(qty) || qty < 1) qty = 1;
      result[cb.value] = qty;
    }
  });
  return result;
}

function initOptimizer() {
  if (optimizerInitialized) {
    return;
  }
  optimizerInitialized = true;

  const slotsInput = document.getElementById('optWorkerSlots');
  const btnMinus = document.getElementById('btnSlotMinus');
  const btnPlus = document.getElementById('btnSlotPlus');

  if (slotsInput) {
    slotsInput.addEventListener('input', () => {
      let val = getWorkerSlots();
      syncSlotChipsUI(val);
      if (hasCalculatedOnce) triggerCalculation(false);
    });
    slotsInput.addEventListener('change', () => {
      let val = getWorkerSlots();
      slotsInput.value = val;
      syncSlotChipsUI(val);
      if (hasCalculatedOnce) triggerCalculation(false);
    });
  }

  if (btnMinus && slotsInput) {
    btnMinus.addEventListener('click', () => {
      let val = getWorkerSlots();
      if (val > 1) {
        slotsInput.value = val - 1;
        syncSlotChipsUI(val - 1);
        if (hasCalculatedOnce) triggerCalculation(false);
      }
    });
  }

  if (btnPlus && slotsInput) {
    btnPlus.addEventListener('click', () => {
      let val = getWorkerSlots();
      slotsInput.value = val + 1; // No upper cap
      syncSlotChipsUI(val + 1);
      if (hasCalculatedOnce) triggerCalculation(false);
    });
  }

  // Quick preset chips for slots
  document.querySelectorAll('.btn-slot-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const s = parseInt(chip.dataset.slots, 10);
      if (s && slotsInput) {
        slotsInput.value = s;
        syncSlotChipsUI(s);
        if (hasCalculatedOnce) triggerCalculation(false);
      }
    });
  });

  // Role card interactions: checkboxes & quantity steppers (NO MAX)
  document.querySelectorAll('.role-pill-card').forEach(card => {
    const cb = card.querySelector('input[type="checkbox"]');
    const numInput = card.querySelector('.role-qty-num');

    if (cb) {
      cb.addEventListener('change', () => {
        syncRoleCardsUI();
        if (hasCalculatedOnce) triggerCalculation(false);
      });
    }

    if (numInput) {
      numInput.addEventListener('input', () => {
        let val = parseInt(numInput.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (cb && !cb.checked) {
          cb.checked = true;
          syncRoleCardsUI();
        }
        if (hasCalculatedOnce) triggerCalculation(false);
      });

      numInput.addEventListener('change', () => {
        let val = parseInt(numInput.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        numInput.value = val;
        if (hasCalculatedOnce) triggerCalculation(false);
      });
    }

    // Role Steppers (+ / -) without upper cap
    const btnDec = card.querySelector('.btn-role-step[data-action="dec"]');
    const btnInc = card.querySelector('.btn-role-step[data-action="inc"]');

    if (btnDec && numInput) {
      btnDec.addEventListener('click', (e) => {
        e.stopPropagation();
        let val = parseInt(numInput.value, 10) || 1;
        if (val > 1) {
          numInput.value = val - 1;
          if (hasCalculatedOnce) triggerCalculation(false);
        }
      });
    }

    if (btnInc && numInput) {
      btnInc.addEventListener('click', (e) => {
        e.stopPropagation();
        let val = parseInt(numInput.value, 10) || 1;
        numInput.value = val + 1; // No upper cap!
        if (cb && !cb.checked) {
          cb.checked = true;
          syncRoleCardsUI();
        }
        if (hasCalculatedOnce) triggerCalculation(false);
      });
    }
  });

  // Quick actions
  const btnSelectAllRoles = document.getElementById('btnSelectAllRoles');
  if (btnSelectAllRoles) {
    btnSelectAllRoles.addEventListener('click', () => {
      document.querySelectorAll('.role-pill-card').forEach(card => {
        const cb = card.querySelector('input[type="checkbox"]');
        if (cb) cb.checked = true;
      });
      syncRoleCardsUI();
      if (hasCalculatedOnce) triggerCalculation(false);
    });
  }

  const btnFacilitiesOnly = document.getElementById('btnFacilitiesOnly');
  if (btnFacilitiesOnly) {
    btnFacilitiesOnly.addEventListener('click', () => {
      const facilities = ['Carry', 'Artisanship', 'Leisure', 'Perfumery'];
      document.querySelectorAll('.role-pill-card').forEach(card => {
        const cb = card.querySelector('input[type="checkbox"]');
        if (cb) cb.checked = facilities.includes(cb.value);
      });
      syncRoleCardsUI();
      if (hasCalculatedOnce) triggerCalculation(false);
    });
  }

  const btnClearRoles = document.getElementById('btnClearRoles');
  if (btnClearRoles) {
    btnClearRoles.addEventListener('click', () => {
      document.querySelectorAll('.role-pill-card').forEach(card => {
        const cb = card.querySelector('input[type="checkbox"]');
        if (cb) cb.checked = false;
      });
      syncRoleCardsUI();
      if (hasCalculatedOnce) triggerCalculation(false);
    });
  }

  // Options
  const optAllowPrismana = document.getElementById('optAllowPrismana');
  const optAllowUnnumbered = document.getElementById('optAllowUnnumbered');
  if (optAllowPrismana) optAllowPrismana.addEventListener('change', () => { if (hasCalculatedOnce) triggerCalculation(false); });
  if (optAllowUnnumbered) optAllowUnnumbered.addEventListener('change', () => { if (hasCalculatedOnce) triggerCalculation(false); });

  // Main Optimizer Button Click Handler
  const btnRunOptimizer = document.getElementById('btnRunOptimizer');
  if (btnRunOptimizer) {
    btnRunOptimizer.addEventListener('click', () => {
      triggerCalculation(true);
    });
  }

  // Initial sync UI (do NOT auto-calculate on initial page load)
  syncRoleCardsUI();
}

function triggerCalculation(shouldScroll = true) {
  const btnRunOptimizer = document.getElementById('btnRunOptimizer');
  if (btnRunOptimizer) {
    btnRunOptimizer.classList.add('is-calculating');
    btnRunOptimizer.innerHTML = '⚡ Calculating Optimal Squads...';
  }

  setTimeout(() => {
    runOptimizer();
    hasCalculatedOnce = true;

    if (btnRunOptimizer) {
      btnRunOptimizer.classList.remove('is-calculating');
      btnRunOptimizer.innerHTML = '🚀 Recalculate Optimal Team';
    }

    if (shouldScroll) {
      const resultsEl = document.getElementById('optimizerResults');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, 80);
}

function getRolePriority(role) {
  const cat = abilityMeta[role]?.category;
  if (cat === 'element') return 1; // Priority 1: Elemental Roles (Fire, Water, Grass, Earth, Wind, Ice, Lightning, Dark, Light)
  if (cat === 'facility' && role !== 'Carry') return 2; // Priority 2: Facility Jobs (Artisanship, Leisure, Perfumery)
  return 3; // Priority 3: Utilities / Hauling (Carry)
}

// Master Solver supporting Option 1 (Fewest skills first), Option 2 (Always multiple skills), Option 3 (Alternative squad)
function solveSquad(targetRolesWithCounts, teamSize, { mode = 'single', excludeCreatureIds = new Set(), allowPrismana = true, allowUnnumbered = true } = {}) {
  const targetRoles = Object.keys(targetRolesWithCounts).sort((a, b) => {
    const pA = getRolePriority(a);
    const pB = getRolePriority(b);
    if (pA !== pB) return pA - pB;
    return a.localeCompare(b);
  });
  if (targetRoles.length === 0) return null;

  // 1. Gather all candidates
  const allCandidates = [];
  for (const creature of allAniimo) {
    if (!allowUnnumbered && creature.is_unnumbered) continue;
    if (excludeCreatureIds.has(creature.id)) continue;

    const forms = [];
    if (creature.forms.basic) forms.push({ ...creature.forms.basic, formKey: 'basic' });
    if (creature.forms.regional) {
      creature.forms.regional.forEach((r, idx) => forms.push({ ...r, formKey: 'regional_' + idx }));
    }
    if (creature.forms.weather) {
      creature.forms.weather.forEach((w, idx) => forms.push({ ...w, formKey: 'weather_' + idx }));
    }
    if (allowPrismana && creature.forms.prismana) {
      forms.push({ ...creature.forms.prismana, formKey: 'prismana' });
    }

    for (const form of forms) {
      if (!allowPrismana && (form.form_name || '').toLowerCase().includes('prismana')) continue;

      const abilities = form.abilities || form.homeland_abilities || {};
      const totalSkillsCount = Object.keys(abilities).length;
      const relevantAbilities = {};
      let maxLvl = 0;

      for (const role of targetRoles) {
        if (abilities[role]) {
          relevantAbilities[role] = abilities[role];
          if (abilities[role] > maxLvl) maxLvl = abilities[role];
        }
      }

      if (maxLvl > 0) {
        allCandidates.push({
          creatureId: creature.id,
          creatureName: creature.name,
          formName: form.form_name,
          formKey: form.formKey,
          displayId: creature.display_id,
          slug: creature.slug,
          image: form.image || creature.image,
          abilities,
          relevantAbilities,
          totalSkillsCount,
          maxRelevantLvl: maxLvl
        });
      }
    }
  }

  // Pre-find the minimum total skills available for each role
  const minSkillsByRole = {};
  const maxLvlByRole = {};
  targetRoles.forEach(r => {
    let minS = 99;
    let maxL = 0;
    allCandidates.forEach(c => {
      if (c.relevantAbilities[r]) {
        if (c.totalSkillsCount < minS) minS = c.totalSkillsCount;
        if (c.relevantAbilities[r] > maxL) maxL = c.relevantAbilities[r];
      }
    });
    minSkillsByRole[r] = minS;
    maxLvlByRole[r] = maxL;
  });

  const selectedTeam = [];
  const roleCoveredCounts = {};
  const roleAssignedCounts = {};
  const roleCoveredLevels = {};
  const cycleExtraCounts = {};
  targetRoles.forEach(r => {
    roleCoveredCounts[r] = 0;
    roleAssignedCounts[r] = 0;
    roleCoveredLevels[r] = 0;
    cycleExtraCounts[r] = 0;
  });

  const teamSpeciesCount = {};

  for (let slot = 0; slot < teamSize; slot++) {
    // === PHASE 1: Base Target Role Fulfillment ===
    // Priority order: Elemental Roles > Facility Jobs > Carry/Hauling
    let unmetRole = null;
    let maxDeficit = 0;
    let bestPriority = 999;

    for (const r of targetRoles) {
      const needed = targetRolesWithCounts[r] || 1;
      const assigned = roleAssignedCounts[r] || 0;
      const def = needed - assigned;
      if (def > 0) {
        const priority = getRolePriority(r);
        if (priority < bestPriority || (priority === bestPriority && def > maxDeficit)) {
          bestPriority = priority;
          maxDeficit = def;
          unmetRole = r;
        }
      }
    }

    let isSurplusPhase = false;
    let targetRole = unmetRole;

    // === PHASE 2: Rotating Surplus Cycles (+1 cycle, then +2 cycle...) ===
    // Only starts AFTER all base roles have been 100% fulfilled!
    if (!targetRole) {
      isSurplusPhase = true;
      let minCycle = Infinity;
      for (const r of targetRoles) {
        if (cycleExtraCounts[r] < minCycle) minCycle = cycleExtraCounts[r];
      }
      for (const r of targetRoles) {
        if (cycleExtraCounts[r] === minCycle) {
          targetRole = r;
          break;
        }
      }
    }

    let bestCand = null;
    let bestScore = -Infinity;

    for (const cand of allCandidates) {
      const candLvl = cand.relevantAbilities[targetRole];
      if (!candLvl) continue;

      let score = 100000;
      const skills = cand.totalSkillsCount;
      const maxAvail = maxLvlByRole[targetRole] || 4;

      // Heavy priority reward for maximizing skill level in the target role!
      score += (candLvl - maxAvail) * 40000;
      if (candLvl === maxAvail) score += 30000;
      score += candLvl * 5000;

      if (mode === 'single') {
        const minPossible = minSkillsByRole[targetRole] || 1;
        if (skills === 1) score += 35000;
        else if (skills === minPossible) score += 18000;
        score -= (skills - 1) * 12000;
      } else if (mode === 'multiple') {
        if (skills >= 3) score += 50000;
        else if (skills === 2) score += 25000;
        else if (skills === 1) score -= 60000;
      } else {
        score += candLvl * 4000;
      }

      if (!isSurplusPhase) {
        // Base phase: Synergy bonus for supporting other currently unmet assignments
        for (const [r, l] of Object.entries(cand.relevantAbilities)) {
          if (r !== targetRole) {
            const def = (targetRolesWithCounts[r] || 1) - (roleAssignedCounts[r] || 0);
            if (def > 0) score += 12000 + l * 1500;
            else score += l * 300;
          }
        }
      } else {
        // Surplus rotation phase: Candidate should also have Hauling (Carry) if possible!
        if (targetRole !== 'Carry' && cand.relevantAbilities['Carry']) {
          score += 25000 + cand.relevantAbilities['Carry'] * 3000;
        }
      }

      // Strong species diversity penalty
      const already = teamSpeciesCount[cand.creatureId] || 0;
      score -= already * 80000;

      if (score > bestScore) {
        bestScore = score;
        bestCand = cand;
      }
    }

    if (bestCand && bestScore > -50000) {
      const primaryRole = targetRole;

      selectedTeam.push({
        ...bestCand,
        primaryRole,
        primaryLvl: bestCand.relevantAbilities[primaryRole] || bestCand.maxRelevantLvl,
        isSurplus: isSurplusPhase,
        slotNumber: slot + 1
      });

      teamSpeciesCount[bestCand.creatureId] = (teamSpeciesCount[bestCand.creatureId] || 0) + 1;
      roleAssignedCounts[primaryRole] = (roleAssignedCounts[primaryRole] || 0) + 1;

      for (const [r, l] of Object.entries(bestCand.relevantAbilities)) {
        roleCoveredCounts[r] = (roleCoveredCounts[r] || 0) + 1;
        if (l > (roleCoveredLevels[r] || 0)) {
          roleCoveredLevels[r] = l;
        }
      }

      if (isSurplusPhase) {
        cycleExtraCounts[targetRole] = (cycleExtraCounts[targetRole] || 0) + 1;
      }
    } else {
      break;
    }
  }

  const coveredRoles = targetRoles.filter(r => (roleAssignedCounts[r] || 0) >= (targetRolesWithCounts[r] || 1));
  const level4Count = selectedTeam.filter(m => m.primaryLvl === 4).length;
  const level3Count = selectedTeam.filter(m => m.primaryLvl === 3).length;

  return {
    selectedTeam,
    roleCoveredCounts,
    roleAssignedCounts,
    roleCoveredLevels,
    coveredRoles,
    coveragePercent: targetRoles.length > 0 ? Math.round((coveredRoles.length / targetRoles.length) * 100) : 100,
    level4Count,
    level3Count
  };
}

function runOptimizer() {
  const targetRolesWithCounts = getSelectedRolesWithCounts();
  const targetRoles = Object.keys(targetRolesWithCounts).sort((a, b) => getRolePriority(a) - getRolePriority(b));
  const allowPrismana = document.getElementById('optAllowPrismana')?.checked ?? true;
  const allowUnnumbered = document.getElementById('optAllowUnnumbered')?.checked ?? true;
  const resultsContainer = document.getElementById('optimizerResults');
  if (!resultsContainer) return;

  if (targetRoles.length === 0) {
    resultsContainer.innerHTML = `
      <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); padding: 1.5rem; border-radius: 12px; text-align: center; color: #fca5a5;">
        <h3 style="font-size: 1.15rem; font-weight: 700;">⚠️ No Roles Selected</h3>
        <p style="margin-top: 0.5rem; font-size: 0.9rem;">Please check at least one target role (e.g., Carry, Artisanship, Leisure) and set the desired quantity, then click Calculate Optimal Team.</p>
      </div>
    `;
    return;
  }

  const teamSize = getWorkerSlots();

  // Option 1: 🎯 Single-Skill Specialists (Focuses on 1-skill only, then 2, then 3)
  const option1 = solveSquad(targetRolesWithCounts, teamSize, {
    mode: 'single',
    allowPrismana,
    allowUnnumbered
  });
  option1.title = 'Single-Skill Specialists';
  option1.subtitle = 'Focuses on Aniimo with 1 skill only (then 2, then 3) to prevent worker distraction on tasks.';
  option1.badge = 'Option 1';
  option1.icon = '🎯';

  // Option 2: ⚡ Multi-Skill Synergy (Always chooses multiple skills: 3 skills > 2 skills)
  const option2 = solveSquad(targetRolesWithCounts, teamSize, {
    mode: 'multiple',
    allowPrismana,
    allowUnnumbered
  });
  option2.title = 'Multi-Skill Synergy';
  option2.subtitle = 'Always chooses Aniimo with multiple skills (2-3 skills) to multitask across your estate.';
  option2.badge = 'Option 2';
  option2.icon = '⚡';

  // Option 3: 🛡️ Alternative Squad (Alternative high-level lineup)
  const topCreatureIds = new Set(option1.selectedTeam.slice(0, Math.min(3, option1.selectedTeam.length)).map(m => m.creatureId));
  const option3 = solveSquad(targetRolesWithCounts, teamSize, {
    mode: 'alternative',
    excludeCreatureIds: topCreatureIds,
    allowPrismana,
    allowUnnumbered
  });
  option3.title = 'Alternative Lineup';
  option3.subtitle = 'Alternative high-level squad using different species in case you have not caught Option 1 yet.';
  option3.badge = 'Option 3';
  option3.icon = '🛡️';

  cachedTeamOptions = [option1, option2, option3];
  if (activeTeamOptionIndex >= cachedTeamOptions.length) {
    activeTeamOptionIndex = 0;
  }

  renderTeamResultsUI();
}

function renderTeamResultsUI() {
  const resultsContainer = document.getElementById('optimizerResults');
  if (!resultsContainer || cachedTeamOptions.length === 0) return;

  const currentOption = cachedTeamOptions[activeTeamOptionIndex] || cachedTeamOptions[0];
  const targetRolesWithCounts = getSelectedRolesWithCounts();
  const targetRoles = Object.keys(targetRolesWithCounts).sort((a, b) => getRolePriority(a) - getRolePriority(b));

  // Tabs for 3 options
  const tabsHtml = cachedTeamOptions.map((opt, idx) => `
    <button type="button" class="btn-team-tab ${idx === activeTeamOptionIndex ? 'active' : ''}" onclick="window.selectTeamOption(${idx})">
      <div class="tab-badge-pill">${opt.badge}</div>
      <div class="tab-name">${opt.icon} ${opt.title}</div>
      <div class="tab-sub">${opt.selectedTeam.length} Workers • ${opt.level4Count}x Lv.4 • ${opt.coveragePercent}% Met</div>
    </button>
  `).join('');

  // Roster member cards
  const memberCardsHtml = currentOption.selectedTeam.map((member, slotIdx) => {
    const absRows = Object.entries(member.abilities).map(([r, l]) => {
      const isTarget = targetRoles.includes(r);
      const isPrimary = (r === member.primaryRole);
      const meta = abilityMeta[r] || { emoji: '✨' };
      return `
        <span class="homeland-pill" style="background-color: ${meta.color}; ${isPrimary ? 'box-shadow: 0 0 12px ' + meta.color + '; border: 1.5px solid #ffffff;' : ''}">
          <span class="pill-icon">${meta.emoji}</span>
          <span class="pill-name">${meta.displayName}</span>
          <span class="pill-lvl">Lv.${l}</span>
          ${isPrimary ? '<span style="font-size: 0.65rem; background: rgba(0,0,0,0.4); padding: 0.1rem 0.35rem; border-radius: 4px; margin-left: 0.2rem;">ASSIGNED</span>' : ''}
        </span>
      `;
    }).join('');

    return `
      <div class="team-member-card">
        <div class="team-member-top">
          <div class="team-member-avatar" onclick="openDetailModal('${member.creatureId}')" style="cursor: pointer;" title="Click for handbook details">
            <img src="${member.image}" alt="${member.creatureName}" onerror="this.src='images/${member.slug}.png'">
          </div>
          <div class="team-member-info">
            <div class="team-member-meta">
              <span class="team-member-slot-num">Slot #${slotIdx + 1}</span>
              <span class="portrait-badge-id">${member.displayId}</span>
              <span class="team-member-primary-role">${member.primaryRole} Lv.${member.primaryLvl}</span>
            </div>
            <h4 class="team-member-name" onclick="openDetailModal('${member.creatureId}')" style="cursor: pointer;">${member.creatureName}</h4>
            <div class="team-member-form">${member.formName} • <span style="color: #94a3b8; font-size: 0.75rem;">${member.totalSkillsCount} Skill${member.totalSkillsCount > 1 ? 's' : ''}</span></div>
          </div>
        </div>
        <div class="team-member-abilities">
          ${absRows}
        </div>
      </div>
    `;
  }).join('');

  resultsContainer.innerHTML = `
    <!-- 3 Outcome Options Selection Tabs -->
    <div class="team-options-tabs">
      ${tabsHtml}
    </div>

    <!-- Active Option Stats Banner -->
    <div class="team-stats-banner">
      <div class="team-score-group">
        <div class="team-score-box">
          <span class="team-score-num">${currentOption.coveragePercent}%</span>
          <span class="team-score-label">Role Target Met</span>
        </div>
        <div class="team-score-box">
          <span class="team-score-num" style="color: #facc15;">${currentOption.level4Count} / ${currentOption.selectedTeam.length}</span>
          <span class="team-score-label">Master Lv. 4 Workers</span>
        </div>
        <div class="team-checklist">
          ${targetRoles.map(r => {
            const assigned = (currentOption.roleAssignedCounts && currentOption.roleAssignedCounts[r] !== undefined) ? currentOption.roleAssignedCounts[r] : (currentOption.roleCoveredCounts[r] || 0);
            const needed = targetRolesWithCounts[r] || 1;
            const isMet = assigned >= needed;
            return `<span class="coverage-pill ${isMet ? 'covered' : 'missing'}">
              ${isMet ? '✓' : '⚠️'} ${r}: ${assigned}/${needed} (Max Lv. ${currentOption.roleCoveredLevels[r] || 0})
            </span>`;
          }).join('')}
        </div>
      </div>

      <div class="team-actions-row">
        <button type="button" id="btnCopyTeam" class="btn-team-action">
          📋 Copy ${currentOption.badge} for Discord
        </button>
      </div>
    </div>

    <!-- Active Option Roster Grid -->
    <div class="team-roster-grid">
      ${memberCardsHtml}
    </div>
  `;

  // Attach Copy Handler
  const btnCopyTeam = document.getElementById('btnCopyTeam');
  if (btnCopyTeam) {
    btnCopyTeam.addEventListener('click', () => {
      const summaryLines = [
        `🏡 **Aniimo Estate Squad — ${currentOption.badge}: ${currentOption.title} (${currentOption.selectedTeam.length} Workers - ${currentOption.coveragePercent}% Met)**`,
        `*Optimized via https://aniimo-homeland-guide.vercel.app/*`,
        ``
      ];
      currentOption.selectedTeam.forEach((m, i) => {
        const absStr = Object.entries(m.relevantAbilities).map(([k, v]) => `${k} Lv. ${v}`).join(', ');
        summaryLines.push(`Slot #${i + 1}. **${m.creatureName}** (${m.formName}) [${m.displayId}] ➔ Assigned: **${m.primaryRole} Lv.${m.primaryLvl}** (All: ${absStr})`);
      });
      navigator.clipboard.writeText(summaryLines.join('\n')).then(() => {
        btnCopyTeam.innerHTML = `✅ Copied to Clipboard!`;
        setTimeout(() => {
          btnCopyTeam.innerHTML = `📋 Copy ${currentOption.badge} for Discord`;
        }, 2500);
      });
    });
  }
}

window.selectTeamOption = function(idx) {
  activeTeamOptionIndex = idx;
  renderTeamResultsUI();
};


// Guide Accordion & Quick Filter Helpers
window.toggleGuideAccordion = function(e) {
  if (e) e.stopPropagation();
  const body = document.getElementById('guideBody');
  const toggleBtn = document.getElementById('btnGuideToggle');
  const toggleText = document.getElementById('guideToggleText');
  if (!body) return;
  const isCurrentlyHidden = body.classList.contains('hidden');
  if (isCurrentlyHidden) {
    body.classList.remove('hidden');
    if (toggleBtn) toggleBtn.classList.add('expanded');
    if (toggleText) toggleText.textContent = 'Collapse Guide';
  } else {
    body.classList.add('hidden');
    if (toggleBtn) toggleBtn.classList.remove('expanded');
    if (toggleText) toggleText.textContent = 'Expand Guide';
  }
};

window.filterByAbility = function(role) {
  if (currentMainView !== 'dex') {
    window.switchMainView('dex', false);
  }
  const select = document.getElementById('elementFilter');
  if (select) {
    select.value = role;
  }
  document.querySelectorAll('.btn-abil-filter').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === role);
  });
  applyFilters();

  const searchControls = document.querySelector('.search-controls');
  if (searchControls) {
    searchControls.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};


// ==========================================================================
// 4-Aniimo Battle & Adventure Squad Card Generator Logic
// ==========================================================================
let squadSlots = [null, null, null, null];
let currentPickingSlotIndex = 0;

function initSquadBuilder() {
  const slotsGrid = document.getElementById('squadSlotsGrid');
  const btnGenerate = document.getElementById('btnGenerateSquadCard');
  const btnClear = document.getElementById('btnClearSquad');
  const btnDownload = document.getElementById('btnDownloadSquadPng');
  const btnCopy = document.getElementById('btnCopySquadImage');
  const pickerModal = document.getElementById('squadPickerModal');
  const pickerClose = document.getElementById('squadPickerClose');
  const pickerSearch = document.getElementById('squadPickerSearch');

  if (!slotsGrid) return;

  renderSquadSlots();

  if (pickerClose) {
    pickerClose.addEventListener('click', closeSquadPicker);
  }
  if (pickerModal) {
    pickerModal.addEventListener('click', (e) => {
      if (e.target === pickerModal) closeSquadPicker();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && pickerModal && !pickerModal.classList.contains('hidden')) {
      closeSquadPicker();
    }
  });

  if (pickerSearch) {
    pickerSearch.addEventListener('input', () => {
      renderSquadPickerList(pickerSearch.value.trim().toLowerCase());
    });
  }

  if (btnGenerate) {
    btnGenerate.addEventListener('click', generateSquadCard);
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      squadSlots = [null, null, null, null];
      renderSquadSlots();
      const previewArea = document.getElementById('squadCardPreviewArea');
      if (previewArea) previewArea.classList.add('hidden');
    });
  }

  if (btnDownload) {
    btnDownload.addEventListener('click', downloadSquadCardPng);
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', copySquadCardToClipboard);
  }
}

function renderSquadSlots() {
  const slotsGrid = document.getElementById('squadSlotsGrid');
  const btnGenerate = document.getElementById('btnGenerateSquadCard');
  const btnClear = document.getElementById('btnClearSquad');
  if (!slotsGrid) return;

  const filledCount = squadSlots.filter(Boolean).length;

  const slotsHtml = squadSlots.map((slot, idx) => {
    if (!slot) {
      return `
        <div class="squad-slot-box is-empty" onclick="openSquadPicker(${idx})" title="Click to choose Aniimo for Slot #${idx + 1}">
          <div class="squad-slot-plus-btn">+</div>
          <div class="squad-slot-num-tag">Slot #${idx + 1}</div>
          <div class="squad-slot-cta">Choose Aniimo</div>
        </div>
      `;
    }

    const primaryEl = slot.primaryElement || 'Fire';
    const meta = abilityMeta[primaryEl] || { emoji: '⭐', color: '#38bdf8' };
    const glowStyle = `background: radial-gradient(circle at 50% 50%, ${meta.color}25 0%, rgba(15, 23, 42, 0.7) 70%); border: 1.5px solid ${meta.color}66;`;

    return `
      <div class="squad-slot-box is-filled" style="${glowStyle}" onclick="openSquadPicker(${idx})" title="Click to change Aniimo for Slot #${idx + 1}">
        <div class="squad-slot-top-row" style="justify-content: flex-end;">
          <button type="button" class="squad-slot-remove-btn" onclick="event.stopPropagation(); removeSquadMember(${idx})" title="Remove Aniimo">&times;</button>
        </div>
        <div class="squad-slot-portrait-wrap">
          <img src="${slot.imageUrl}" alt="${slot.name}" class="squad-slot-portrait-img" onerror="this.onerror=null; this.src='images/${slot.slug}.png';">
        </div>
        <div class="squad-slot-info" style="text-align: center;">
          <div class="squad-slot-name-row" style="justify-content: center;">
            <span class="squad-slot-name">${slot.name}</span>
          </div>
          <div style="margin-top: 4px;">
            <span class="squad-slot-form-badge" style="${slot.isPris ? 'color: #ec4899; border-color: rgba(236,72,153,0.4); background: rgba(236,72,153,0.15);' : ''}">${slot.formName}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  slotsGrid.innerHTML = slotsHtml;

  if (btnGenerate) {
    if (filledCount >= 1) {
      btnGenerate.disabled = false;
      btnGenerate.innerHTML = filledCount === 4 ? 'Generate Squad Card (Ready!)' : `Generate Squad Card (${filledCount} Selected)`;
    } else {
      btnGenerate.disabled = true;
      btnGenerate.innerHTML = 'Generate Squad Card (Choose Aniimo)';
    }
  }

  if (btnClear) {
    btnClear.style.display = filledCount > 0 ? 'inline-block' : 'none';
  }
}

window.openSquadPicker = function(slotIdx) {
  currentPickingSlotIndex = slotIdx;
  const pickerModal = document.getElementById('squadPickerModal');
  const tag = document.getElementById('squadPickerTag');
  const title = document.getElementById('squadPickerTitle');
  const searchInput = document.getElementById('squadPickerSearch');

  if (tag) tag.textContent = `SLOT #${slotIdx + 1} SELECTION`;
  if (title) title.textContent = `Choose Aniimo for Slot #${slotIdx + 1}`;
  if (searchInput) searchInput.value = '';

  renderSquadPickerList('');
  if (pickerModal) pickerModal.classList.remove('hidden');
  if (searchInput) searchInput.focus();
};

window.closeSquadPicker = function() {
  const pickerModal = document.getElementById('squadPickerModal');
  if (pickerModal) pickerModal.classList.add('hidden');
};

function renderSquadPickerList(filterText) {
  const listEl = document.getElementById('squadPickerList');
  if (!listEl) return;

  const query = (filterText || '').toLowerCase().trim();

  let filtered = allAniimo;
  if (query) {
    filtered = allAniimo.filter(item => {
      const matchStr = `${item.id} ${item.display_id} ${item.name} ${item.slug} ${item.tier} ${JSON.stringify(item.forms)}`.toLowerCase();
      return matchStr.includes(query);
    });
  }

  const itemsHtml = filtered.map(item => {
    const creatureMedia = wikiMediaMap[item.id] || null;
    const baseImg = creatureMedia?.imageUrl || item.image || `images/${item.slug}.png`;

    // Collect available forms
    const formsList = [];
    formsList.push({
      formKey: 'basic',
      formName: 'Basic Form',
      isPris: false,
      data: item.forms.basic
    });

    if (item.forms.regional && Array.isArray(item.forms.regional)) {
      item.forms.regional.forEach((rf, i) => {
        formsList.push({
          formKey: `regional_${i}`,
          formName: rf.form_name || 'Regional Form',
          isPris: false,
          data: rf
        });
      });
    }

    if (item.forms.weather && Array.isArray(item.forms.weather)) {
      item.forms.weather.forEach((wf, i) => {
        formsList.push({
          formKey: `weather_${i}`,
          formName: wf.form_name || 'Weather Form',
          isPris: false,
          data: wf
        });
      });
    }

    if (item.forms.prismana) {
      formsList.push({
        formKey: 'prismana',
        formName: 'Prismana Form',
        isPris: true,
        data: item.forms.prismana
      });
    }

    const formButtonsHtml = formsList.map(f => `
      <button type="button" class="btn-pick-form ${f.isPris ? 'is-prismana' : ''}" onclick="window.selectSquadMember('${item.id}', '${f.formKey}', '${f.formName.replace(/'/g, "\\'")}')">
        <span>${f.isPris ? '🌈' : (f.formKey.startsWith('regional') ? '🗺️' : (f.formKey.startsWith('weather') ? '⚡' : '🔹'))} ${f.formName}</span>
        <span style="font-size: 0.7rem; color: #94a3b8;">Choose &rarr;</span>
      </button>
    `).join('');

    return `
      <div class="squad-picker-item">
        <div class="squad-picker-item-top">
          <img src="${baseImg}" alt="${item.name}" class="squad-picker-item-avatar" onerror="this.onerror=null; this.src='images/${item.slug}.png';">
          <div class="squad-picker-item-info">
            <div class="squad-picker-item-name">${item.name}</div>
            <div class="squad-picker-item-meta">${item.display_id} • <span class="stage-${item.tier}">${item.tier}</span></div>
          </div>
        </div>
        <div class="squad-picker-item-forms">
          ${formButtonsHtml}
        </div>
      </div>
    `;
  }).join('');

  listEl.innerHTML = itemsHtml || '<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 2rem;">No Aniimo match your search.</div>';
}

window.selectSquadMember = function(id, formKey, formName) {
  const item = allAniimo.find(a => a.id === id);
  if (!item) return;

  const { data: activeForm, isPris } = getActiveFormData(item, formKey);

  // Official 3D illustration media
  const creatureMedia = wikiMediaMap[item.id] || null;
  const baseAssetNum = creatureMedia?.assetNum || wikiAssetNums[item.id] || null;
  const formMedia = creatureMedia?.forms ? (
    creatureMedia.forms[formKey] ||
    creatureMedia.forms[formName] ||
    (formKey === 'basic' ? (creatureMedia.forms['Basic Form'] || creatureMedia.forms['basic']) : null)
  ) : null;

  const videoUrl = formMedia?.videoUrl || 
                   (formKey === 'basic' && creatureMedia?.videoUrl) ||
                   (formKey === 'basic' && baseAssetNum ? `https://worldx-website-cdn.aniimo.com/official-website/worldx/wiki_stage/newVFX/${baseAssetNum}00.mp4` : null);

  const imageUrl = formMedia?.imageUrl || creatureMedia?.imageUrl || activeForm.image || item.image || `images/${item.slug}.png`;

  const elements = activeForm.elements || activeForm.abilities || {};
  const primaryElement = (activeForm.elements && Object.keys(activeForm.elements)[0]) || Object.keys(elements)[0] || 'Fire';
  const elementDisplay = activeForm.element_display || primaryElement;

  squadSlots[currentPickingSlotIndex] = {
    id: item.id,
    display_id: item.display_id,
    name: item.name,
    slug: item.slug,
    tier: item.tier,
    formKey: formKey,
    formName: activeForm.form_name || formName,
    isPris: isPris,
    primaryElement: primaryElement,
    elementDisplay: elementDisplay,
    videoUrl: videoUrl,
    imageUrl: imageUrl
  };

  closeSquadPicker();
  renderSquadSlots();
};

window.removeSquadMember = function(slotIdx) {
  squadSlots[slotIdx] = null;
  renderSquadSlots();
};


function drawAniimoWikiBackground(ctx, width, height) {
  // 1. Soft Blue Sky Gradient (Aniimo Wiki theme)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#75b9ea');
  skyGrad.addColorStop(0.4, '#87c4ee');
  skyGrad.addColorStop(1, '#9fd3f5');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Translucent Diagonal Watermark Stamp Pattern
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 2.5;

  const symbols = ['leaf', 'swirl', 'flower', 'sparkle'];
  const stepX = 140;
  const stepY = 120;

  for (let y = -40; y < height + 80; y += stepY) {
    const rowOffset = (Math.floor(y / stepY) % 2) * (stepX / 2);
    for (let x = -40; x < width + 80; x += stepX) {
      const symIdx = (Math.floor((x + y) / 100) % symbols.length + symbols.length) % symbols.length;
      const sym = symbols[symIdx];
      const px = x + rowOffset;
      const py = y;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-Math.PI / 12);

      if (sym === 'leaf') {
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.quadraticCurveTo(18, 0, 0, 18);
        ctx.quadraticCurveTo(-18, 0, 0, -18);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(0, 14);
        ctx.stroke();
      } else if (sym === 'swirl') {
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 7, Math.PI * 0.5, Math.PI * 2);
        ctx.stroke();
      } else if (sym === 'flower') {
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const ang = (i * 2 * Math.PI) / 5;
          ctx.arc(Math.cos(ang) * 9, Math.sin(ang) * 9, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (sym === 'sparkle') {
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(4, -4);
        ctx.lineTo(15, 0);
        ctx.lineTo(4, 4);
        ctx.lineTo(0, 15);
        ctx.lineTo(-4, 4);
        ctx.lineTo(-15, 0);
        ctx.lineTo(-4, -4);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }
  ctx.restore();

  // 3. Ground / Floor Ambient Light
  const floorLight = ctx.createLinearGradient(0, height * 0.52, 0, height);
  floorLight.addColorStop(0, 'rgba(255, 255, 255, 0)');
  floorLight.addColorStop(0.65, 'rgba(255, 255, 255, 0.35)');
  floorLight.addColorStop(1, 'rgba(255, 255, 255, 0.55)');
  ctx.fillStyle = floorLight;
  ctx.fillRect(0, height * 0.52, width, height * 0.48);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function capture3DModelFrame(videoUrl, fallbackImageUrl) {
  if (!videoUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve({ canvasOrImg: img, is3D: false, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ canvasOrImg: null, is3D: false, width: 0, height: 0 });
      img.src = fallbackImageUrl;
    });
  }

  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    let settled = false;
    const fallbackToImg = () => {
      if (settled) return;
      settled = true;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve({ canvasOrImg: img, is3D: false, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ canvasOrImg: null, is3D: false, width: 0, height: 0 });
      img.src = fallbackImageUrl;
    };

    const timer = setTimeout(fallbackToImg, 5000);

    video.onloadeddata = () => {
      try {
        video.currentTime = Math.min(0.2, (video.duration || 1) * 0.1);
      } catch (e) {
        fallbackToImg();
      }
    };

    video.onseeked = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      try {
        const vw = video.videoWidth || 600;
        const vh = video.videoHeight || 1200;
        const outW = vw;
        const outH = Math.floor(vh / 2);

        const offCanvas = document.createElement('canvas');
        offCanvas.width = outW;
        offCanvas.height = outH;

        const gl = offCanvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
        if (!gl) {
          fallbackToImg();
          return;
        }

        const vs = `
          attribute vec2 a_position;
          attribute vec2 a_texCoord;
          varying vec2 v_texCoord;
          void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            v_texCoord = a_texCoord;
          }
        `;
        const fs = `
          precision mediump float;
          uniform sampler2D u_video;
          varying vec2 v_texCoord;
          void main() {
            vec2 colorUv = vec2(v_texCoord.x, v_texCoord.y * 0.5);
            vec2 alphaUv = vec2(v_texCoord.x, 0.5 + v_texCoord.y * 0.5);
            vec4 color = texture2D(u_video, colorUv);
            float alpha = texture2D(u_video, alphaUv).r;
            alpha = smoothstep(0.04, 0.96, alpha);
            gl_FragColor = vec4(color.rgb, alpha);
          }
        `;

        const compile = (type, src) => {
          const s = gl.createShader(type);
          gl.shaderSource(s, src);
          gl.compileShader(s);
          return s;
        };

        const prog = gl.createProgram();
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(prog);
        gl.useProgram(prog);

        const posBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
          -1, -1,   1, -1,  -1,  1,
          -1,  1,   1, -1,   1,  1
        ]), gl.STATIC_DRAW);

        const aPos = gl.getAttribLocation(prog, 'a_position');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        const texBuf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
          0, 1,   1, 1,   0, 0,
          0, 0,   1, 1,   1, 0
        ]), gl.STATIC_DRAW);

        const aTex = gl.getAttribLocation(prog, 'a_texCoord');
        gl.enableVertexAttribArray(aTex);
        gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0);

        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

        gl.viewport(0, 0, outW, outH);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        resolve({ canvasOrImg: offCanvas, is3D: true, width: outW, height: outH });
      } catch (err) {
        console.warn('Capture 3D error:', err);
        fallbackToImg();
      }
    };

    video.onerror = fallbackToImg;
    video.src = videoUrl;
  });
}

async function generateSquadCard() {
  const canvas = document.getElementById('squadGraphicCanvas');
  const previewArea = document.getElementById('squadCardPreviewArea');
  const customNameInput = document.getElementById('squadCustomName');
  const btnGenerate = document.getElementById('btnGenerateSquadCard');
  
  const chosenSlots = squadSlots.filter(Boolean);
  const chosenCount = chosenSlots.length;
  if (!canvas || chosenCount === 0) return;

  if (btnGenerate) {
    btnGenerate.disabled = true;
    btnGenerate.innerHTML = 'Rendering 3D Models...';
  }

  const squadName = (customNameInput?.value || '').trim() || (chosenCount === 1 ? `${chosenSlots[0].name} Showcase` : 'Aniimo Adventure Squad');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;  // 1200
  const height = canvas.height; // 675

  // Show preview area immediately
  if (previewArea) previewArea.classList.remove('hidden');

  // Load chosen 3D models concurrently
  const loadedModels = await Promise.all(chosenSlots.map(async (slot, idx) => {
    try {
      const result = await capture3DModelFrame(slot.videoUrl, slot.imageUrl);
      return { ...result, slot };
    } catch (e) {
      console.warn('Failed capturing 3D model for slot', idx, e);
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve({ canvasOrImg: img, is3D: false, width: img.naturalWidth, height: img.naturalHeight, slot });
        img.onerror = () => resolve({ canvasOrImg: null, is3D: false, width: 0, height: 0, slot });
        img.src = slot.imageUrl;
      });
    }
  }));

  // 1. Draw Aniimo Wiki Soft Sky-Blue Wallpaper Background
  drawAniimoWikiBackground(ctx, width, height);

  // 2. Header Area: Centered in the middle (Right side branding completely removed!)
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0c2340';
  ctx.font = '800 36px "Outfit", sans-serif';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
  ctx.shadowBlur = 8;
  ctx.fillText(squadName, width / 2, 58);

  // Subtitle centered beneath title (dynamically updates count)
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#0284c7';
  ctx.font = '700 15px "Outfit", sans-serif';
  const formationSubtitle = chosenCount === 1 ? '1-ANIIMO FORMATION' : `${chosenCount}-ANIIMO BATTLE SQUAD FORMATION`;
  ctx.fillText(formationSubtitle, width / 2, 85);
  ctx.restore();

  // 3. Ground & Dynamic Center Positions (1, 2, 3, or 4 Aniimo)
  const groundY = 515;
  let centers = [];
  if (chosenCount === 1) {
    centers = [width / 2]; // 600 (exact middle!)
  } else if (chosenCount === 2) {
    centers = [420, 780]; // duo evenly spaced around center
  } else if (chosenCount === 3) {
    centers = [270, 600, 930]; // trio evenly spaced around center
  } else {
    centers = [180, 455, 745, 1020]; // 4-Aniimo formation
  }

  const elementColors = {
    Fire: '#ef4444',
    Water: '#3b82f6',
    Grass: '#22c55e',
    Earth: '#d97706',
    Lightning: '#eab308',
    Ice: '#06b6d4',
    Wind: '#14b8a6',
    Dark: '#a855f7',
    Light: '#f59e0b'
  };

  // Step 3A: Draw floor shadows
  loadedModels.forEach((item, i) => {
    const cx = centers[i];
    ctx.save();
    const shadowGrad = ctx.createRadialGradient(cx, groundY + 12, 10, cx, groundY + 12, 140);
    shadowGrad.addColorStop(0, 'rgba(25, 70, 130, 0.40)');
    shadowGrad.addColorStop(0.5, 'rgba(35, 90, 150, 0.16)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.ellipse(cx, groundY + 12, 140, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Step 3B: Draw 3D Aniimo standing side by side
  const maxH = chosenCount === 1 ? 430 : 400;
  const maxW = chosenCount === 1 ? 400 : 340;

  loadedModels.forEach((item, i) => {
    const cx = centers[i];
    const source = item.canvasOrImg;
    if (!source) return;

    ctx.save();
    const srcW = source.width || source.naturalWidth || 600;
    const srcH = source.height || source.naturalHeight || 600;
    const scale = Math.min(maxH / srcH, maxW / srcW);
    const drawW = srcW * scale;
    const drawH = srcH * scale;
    const drawX = cx - drawW / 2;
    const drawY = groundY - drawH + 18;

    // Draw 3D model
    ctx.drawImage(source, drawX, drawY, drawW, drawH);
    ctx.restore();
  });

  // Step 3C: Draw creature info plates beneath them (Aniimo Name + Form only)
  loadedModels.forEach((item, i) => {
    const { slot } = item;
    const cx = centers[i];
    const elColor = elementColors[slot.primaryElement] || '#0284c7';

    const plateW = 220;
    const plateH = 62;
    const plateX = cx - plateW / 2;
    const plateY = 566;

    ctx.save();
    // Frosted glass background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.shadowColor = 'rgba(20, 50, 90, 0.16)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    roundRect(ctx, plateX, plateY, plateW, plateH, 12);
    ctx.fill();

    // Border
    ctx.strokeStyle = elColor + '66';
    ctx.lineWidth = 1.5;
    roundRect(ctx, plateX, plateY, plateW, plateH, 12);
    ctx.stroke();

    // Aniimo Name
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 20px "Outfit", sans-serif';
    ctx.fillText(slot.name, cx, plateY + 27);

    // Form Name Underneath
    ctx.fillStyle = slot.isPris ? '#db2777' : '#0284c7';
    ctx.font = '700 13px "Outfit", sans-serif';
    const formTxt = slot.formName;
    ctx.fillText(formTxt, cx, plateY + 48);

    ctx.restore();
  });

  if (btnGenerate) {
    btnGenerate.disabled = false;
    btnGenerate.innerHTML = chosenCount === 4 ? 'Generate Squad Card (Ready!)' : `Generate Squad Card (${chosenCount} Selected)`;
  }

  // Scroll preview into view
  previewArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function downloadSquadCardPng() {
  const canvas = document.getElementById('squadGraphicCanvas');
  const customNameInput = document.getElementById('squadCustomName');
  if (!canvas) return;

  const rawName = (customNameInput?.value || 'aniimo-squad').trim();
  const slugName = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'aniimo-squad';
  const filename = `${slugName}.png`;

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


function copySquadCardToClipboard() {
  const canvas = document.getElementById('squadGraphicCanvas');
  const btnCopy = document.getElementById('btnCopySquadImage');
  if (!canvas) return;

  canvas.toBlob(blob => {
    if (!blob) return;
    if (navigator.clipboard && navigator.clipboard.write) {
      navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]).then(() => {
        if (btnCopy) {
          const orig = btnCopy.innerHTML;
          btnCopy.innerHTML = `✅ Copied to Clipboard!`;
          setTimeout(() => { btnCopy.innerHTML = orig; }, 2500);
        }
      }).catch(err => {
        console.warn('Clipboard write failed:', err);
        downloadSquadCardPng();
      });
    } else {
      downloadSquadCardPng();
    }
  }, 'image/png');
}
