// Aniimo Homeland Hub Frontend Application (Client-Side)

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

// Element & Homeland Utility colors and icons
const abilityMeta = {
  // Elements
  Fire: { emoji: '🔥', color1: '#ea580c', color2: '#f97316' },
  Grass: { emoji: '🌱', color1: '#16a34a', color2: '#22c55e' },
  Water: { emoji: '💧', color1: '#0284c7', color2: '#0ea5e9' },
  Earth: { emoji: '⛰️', color1: '#b45309', color2: '#d97706' },
  Lightning: { emoji: '⚡', color1: '#ca8a04', color2: '#eab308' },
  Ice: { emoji: '❄️', color1: '#0284c7', color2: '#38bdf8' },
  Wind: { emoji: '🍃', color1: '#0d9488', color2: '#14b8a6' },
  Dark: { emoji: '🌑', color1: '#7e22ce', color2: '#a855f7' },
  Light: { emoji: '✨', color1: '#d97706', color2: '#fbbf24' },
  // Homeland Utilities
  Carry: { emoji: '📦', color1: '#d97706', color2: '#f59e0b' },
  Artisanship: { emoji: '🔨', color1: '#475569', color2: '#94a3b8' },
  Leisure: { emoji: '☕', color1: '#059669', color2: '#10b981' },
  Perfumery: { emoji: '🌸', color1: '#db2777', color2: '#f43f5e' }
};
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

      regionalForms.forEach((rf, i) => {
        const sel = activeTabKey === `regional_${i}`;
        const label = rf.form_name.replace('Form', '').trim();
        navBtns += `<button class="btn-form-tab ${sel ? 'active' : ''}" onclick="setCardTab('${item.id}', 'regional_${i}')">🗺️ ${label}</button>`;
      });

      weatherForms.forEach((wf, i) => {
        const sel = activeTabKey === `weather_${i}`;
        const label = wf.form_name.replace('Form', '').trim();
        navBtns += `<button class="btn-form-tab ${sel ? 'active' : ''}" onclick="setCardTab('${item.id}', 'weather_${i}')">⚡ ${label}</button>`;
      });

      if (prismanaForm) {
        navBtns += `<button class="btn-form-tab is-prismana ${isPris ? 'active' : ''}" onclick="setCardTab('${item.id}', 'prismana')">🌈 Prismana</button>`;
      }
    }

    // Build ability proficiency pills (Elements + Homeland Utilities)
    const activeAbilities = activeData.abilities || { ...(activeData.elements || {}), ...(activeData.utilities || {}) };
    const elementsHtml = Object.entries(activeAbilities).map(([abilName, lvl]) => {
      const meta = abilityMeta[abilName] || { emoji: '⭐', color1: '#38bdf8', color2: '#818cf8' };
      const pct = Math.min((lvl / 5) * 100, 100);
      const isUtility = ['Carry', 'Artisanship', 'Leisure', 'Perfumery'].includes(abilName);
      return `
        <div class="abil-pill ${isUtility ? 'is-utility-pill' : 'is-element-pill'}">
          <div class="abil-pill-top">
            <span class="abil-pill-name" style="${isUtility ? 'color: #f8fafc; font-weight: 700;' : ''}">${meta.emoji} ${abilName}</span>
            <span class="abil-pill-lvl" style="${isUtility ? 'color: #f59e0b;' : ''}">Lv.${lvl}</span>
          </div>
          <div class="abil-progress-bar">
            <div class="abil-progress-fill lvl-${lvl}" style="width: ${pct}%; background: linear-gradient(90deg, ${meta.color1}, ${meta.color2});"></div>
          </div>
        </div>
      `;
    }).join('');

    // Determine current displayed image
    const currentImg = activeData.image || item.image || `images/${item.slug}.png`;

    return `
      <div class="card ${isPris ? 'is-prismana-active' : ''} ${item.is_unnumbered ? 'is-unnumbered-card' : ''}" id="aniimo-${item.id}">
        <!-- Picture Portrait Banner -->
        <div class="card-portrait-wrap" onclick="openDetailModal('${item.id}')" style="cursor: pointer;" title="Click for full handbook details">
          <img src="${currentImg}" 
               class="portrait-img" 
               alt="${item.name}" 
               loading="lazy" 
               onerror="if (!this.dataset.fallback) { this.dataset.fallback='1'; this.src='images/${item.slug}.png'; } else if (this.dataset.fallback==='1') { this.dataset.fallback='2'; this.src='images/${item.id}.png'; } else if (this.dataset.fallback==='2') { this.dataset.fallback='3'; this.src='images/unknown.png'; }">
          <div class="portrait-overlay">
            <span class="portrait-badge-id" style="${item.is_unnumbered ? 'background: rgba(234, 88, 12, 0.4); border: 1px solid rgba(234, 88, 12, 0.7);' : ''}">${item.display_id}</span>
            <span class="portrait-badge-stage stage-${item.tier}">${item.tier}</span>
          </div>
        </div>

        <!-- Title & Elements -->
        <div class="card-header-row">
          <h3 class="card-title" onclick="openDetailModal('${item.id}')" style="cursor: pointer;">
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

window.openDetailModal = function(id) {
  const item = allAniimo.find(a => a.id === id || a.slug === id);
  if (!item) return;

  const basic = item.forms.basic;
  const regionalList = item.forms.regional || [];
  const weatherList = item.forms.weather || [];
  const prismana = (item.id === '030') ? null : item.forms.prismana;

  const allFormsList = [basic, ...regionalList, ...weatherList, prismana].filter(Boolean);

  const formsTableHtml = allFormsList.map(f => {
    const isPris = f.form_name.toLowerCase().includes('prismana');
    const pool = f.abilities || { ...(f.elements || {}), ...(f.utilities || {}) };
    const elemStr = Object.entries(pool).map(([k, v]) => {
      const meta = abilityMeta[k] || { emoji: '' };
      return `${meta.emoji} ${k} Lv.${v}`;
    }).join(' • ');
    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
          <img src="${f.image || item.image}" 
               style="width: 44px; height: 44px; object-fit: contain; border-radius: 6px; background: rgba(0,0,0,0.3);" 
               onerror="this.onerror=null; this.src='images/${item.slug}.png';">
          <strong>${f.form_name}</strong>
        </td>
        <td style="padding: 0.75rem; color: ${isPris ? '#ec4899' : '#38bdf8'}; font-weight: 600;">${f.element_display}</td>
        <td style="padding: 0.75rem;">${f.catch_rate || '—'}</td>
        <td style="padding: 0.75rem; font-size: 0.85rem; color: #cbd5e1;">${f.region || '—'}</td>
        <td style="padding: 0.75rem; font-family: 'JetBrains Mono'; font-size: 0.85rem; color: #facc15;">${elemStr || 'Standard'}</td>
      </tr>
    `;
  }).join('');

  modalBody.innerHTML = `
    <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
      <div style="width: 180px; height: 180px; border-radius: 12px; overflow: hidden; background: #0f172a; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.1);">
        <img src="${item.image}" 
             style="max-width: 90%; max-height: 90%; object-fit: contain;" 
             alt="${item.name}" 
             onerror="this.onerror=null; this.src='images/${item.slug}.png';">
      </div>
      <div style="flex: 1; min-width: 250px;">
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.4rem;">
          <span class="portrait-badge-id" style="${item.is_unnumbered ? 'background: rgba(234, 88, 12, 0.4); border: 1px solid rgba(234, 88, 12, 0.7);' : ''}">${item.display_id}</span>
          <span class="portrait-badge-stage stage-${item.tier}">${item.tier}</span>
          ${item.is_unnumbered ? '<span style="font-size: 0.75rem; color: #fb923c; background: rgba(234,88,12,0.15); padding: 0.2rem 0.5rem; border-radius: 4px;">Unnumbered in Current Dex</span>' : ''}
        </div>
        <h2 style="font-size: 2.2rem; font-weight: 800; margin-bottom: 0.25rem;">${item.name}</h2>
        <p style="color: #94a3b8; font-family: 'JetBrains Mono'; font-size: 0.9rem; margin-bottom: 0.75rem;">Slug: ${item.slug}</p>
        
        <div style="background: rgba(30, 41, 59, 0.7); padding: 0.75rem 1rem; border-radius: 8px; border-left: 3px solid #38bdf8; margin-bottom: 0.75rem;">
          <div style="font-size: 0.8rem; text-transform: uppercase; color: #94a3b8; font-weight: 700;">Passive Trait</div>
          <div style="color: white; font-weight: 700; margin: 0.2rem 0;">${item.trait}</div>
          <div style="color: #cbd5e1; font-size: 0.85rem;">${item.trait_effect}</div>
        </div>

        ${item.matchups && (item.matchups.weak_to.length || item.matchups.resists.length) ? `
          <div style="font-size: 0.85rem; display: flex; gap: 1rem; flex-wrap: wrap;">
            ${item.matchups.weak_to.length ? `<div><span style="color: #f87171; font-weight: bold;">Weak:</span> ${item.matchups.weak_to.join(', ')}</div>` : ''}
            ${item.matchups.resists.length ? `<div><span style="color: #4ade80; font-weight: bold;">Resists:</span> ${item.matchups.resists.join(', ')}</div>` : ''}
          </div>
        ` : ''}
      </div>
    </div>

    <h3 style="font-size: 1.25rem; font-weight: 700; margin: 1.5rem 0 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
      Verified Form Catalog (${allFormsList.length} Forms)
    </h3>
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
        <thead>
          <tr style="border-bottom: 2px solid rgba(255,255,255,0.2); color: #94a3b8; font-size: 0.8rem; text-transform: uppercase;">
            <th style="padding: 0.5rem 0.75rem;">Form</th>
            <th style="padding: 0.5rem 0.75rem;">Elements</th>
            <th style="padding: 0.5rem 0.75rem;">Catch Rate</th>
            <th style="padding: 0.5rem 0.75rem;">Spawn Region</th>
            <th style="padding: 0.5rem 0.75rem;">Elemental Proficiencies</th>
          </tr>
        </thead>
        <tbody>
          ${formsTableHtml}
        </tbody>
      </table>
    </div>
  `;

  detailModal.classList.remove('hidden');
};

modalClose.addEventListener('click', () => {
  detailModal.classList.add('hidden');
});

detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) detailModal.classList.add('hidden');
});

// Filter Engine
function applyFilters() {
  const query = (searchInput.value || '').toLowerCase().trim();
  const selectedTier = tierFilter ? tierFilter.value : 'all';
  const selectedElement = elementFilter.value;
  const minLvl = parseInt(minLevelFilter.value, 10) || 1;

  const filtered = allAniimo.filter(item => {
    // Search query
    if (query) {
      const matchText = `${item.id} ${item.display_id} ${item.name} ${item.slug} ${item.tier} ${item.trait} ${item.trait_effect} ${JSON.stringify(item.forms)}`.toLowerCase();
      if (!matchText.includes(query)) return false;
    }

    // Quick Form pill
    if (currentFormFilter === 'regional') {
      if (!item.forms.regional || item.forms.regional.length === 0) return false;
    } else if (currentFormFilter === 'weather') {
      if (!item.forms.weather || item.forms.weather.length === 0) return false;
    } else if (currentFormFilter === 'prismana') {
      if (!item.forms.prismana) return false;
    } else if (currentFormFilter === 'basic') {
      if (!item.forms.basic) return false;
    } else if (currentFormFilter === 'unnumbered') {
      if (!item.is_unnumbered) return false;
    }

    // Tier filter
    if (selectedTier !== 'all' && item.tier !== selectedTier) {
      return false;
    }

    // Element & Homeland Utility filter
    if (selectedElement !== 'all') {
      const allForms = [
        item.forms.basic,
        ...(item.forms.regional || []),
        ...(item.forms.weather || []),
        item.forms.prismana
      ].filter(Boolean);

      const hasMatch = allForms.some(f => {
        const pool = { ...(f.elements || {}), ...(f.abilities || {}), ...(f.utilities || {}) };
        for (const [k, v] of Object.entries(pool)) {
          if (k.toLowerCase() === selectedElement.toLowerCase() && v >= minLvl) return true;
        }
        return false;
      });

      if (!hasMatch) return false;
    }

    return true;
  });

  renderCards(filtered);
}

// Event Listeners
searchInput.addEventListener('input', applyFilters);
clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  applyFilters();
});

if (tierFilter) tierFilter.addEventListener('change', applyFilters);
elementFilter.addEventListener('change', applyFilters);
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
  fetchStats();
  allAniimo = await fetchAniimoData();
  applyFilters();
})();
