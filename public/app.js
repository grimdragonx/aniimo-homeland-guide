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
        <div class="card-portrait-wrap" onclick="openDetailModal('${item.id}')" style="cursor: pointer;" title="Click for full handbook details">
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
  const item = allAniimo.find(a => a.id === id || a.slug === id || (typeof id === 'string' && id.startsWith(a.id)));
  if (!item) return;

  // Dynamic SEO Title and Deep Link Hash
  document.title = `${item.name} (${item.display_id}) Homeland Abilities & Forms | Aniimo Guide`;
  const searchStr = window.location.search || '';
  history.replaceState(null, null, `${window.location.pathname}${searchStr}#${item.id}-${item.slug}`);

  const basic = item.forms.basic;
  const regionalList = item.forms.regional || [];
  const weatherList = item.forms.weather || [];
  const prismana = (item.id === '030') ? null : item.forms.prismana;

  const seenModalForms = new Set();
  const allFormsList = [basic, ...regionalList, ...weatherList, prismana].filter(f => {
    if (!f) return false;
    const norm = f.form_name.trim().toLowerCase();
    if (seenModalForms.has(norm)) return false;
    seenModalForms.add(norm);
    return true;
  });

  const formsTableHtml = allFormsList.map(f => {
    const isPris = f.form_name.toLowerCase().includes('prismana');
    const pool = f.abilities || { ...(f.elements || {}), ...(f.utilities || {}) };
    const elemStr = Object.entries(pool).map(([k, v]) => {
      const meta = abilityMeta[k] || { emoji: '⭐', displayName: k, color: '#38bdf8' };
      return `<span class="homeland-pill" style="background-color: ${meta.color}; margin: 0.15rem 0.25rem 0.15rem 0;"><span class="pill-icon">${meta.emoji}</span> ${meta.displayName} <span class="pill-lvl">Lv.${v}</span></span>`;
    }).join('');
    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
          <img src="${f.image || item.image}" 
               style="width: 44px; height: 44px; object-fit: contain; border-radius: 6px; background: rgba(0,0,0,0.3);" 
               loading="lazy" 
               decoding="async" 
               alt="${f.form_name} - ${item.name}" 
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
             alt="${item.name} (${item.display_id}) Official Handbook Portrait" 
             loading="lazy" 
             decoding="async" 
             width="160" 
             height="160" 
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

function closeDetailModal() {
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

// Master Solver supporting Option 1 (Fewest skills first), Option 2 (Always multiple skills), Option 3 (Alternative squad)
function solveSquad(targetRolesWithCounts, teamSize, { mode = 'single', excludeCreatureIds = new Set(), allowPrismana = true, allowUnnumbered = true } = {}) {
  const targetRoles = Object.keys(targetRolesWithCounts);
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
  const roleCoveredLevels = {};
  const cycleExtraCounts = {};
  targetRoles.forEach(r => {
    roleCoveredCounts[r] = 0;
    roleCoveredLevels[r] = 0;
    cycleExtraCounts[r] = 0;
  });

  const teamSpeciesCount = {};

  for (let slot = 0; slot < teamSize; slot++) {
    // === PHASE 1: Base Target Role Fulfillment ===
    // Check if any role is NOT yet fulfilled
    let unmetRole = null;
    let maxDeficit = 0;

    // First check non-Carry specialized roles that still have unmet deficit
    for (const r of targetRoles) {
      if (r === 'Carry') continue;
      const needed = targetRolesWithCounts[r] || 1;
      const cur = roleCoveredCounts[r] || 0;
      const def = needed - cur;
      if (def > maxDeficit) {
        maxDeficit = def;
        unmetRole = r;
      }
    }

    // Only if all specialized roles are fulfilled, check Carry deficit
    if (!unmetRole && (targetRolesWithCounts['Carry'] || 0) > (roleCoveredCounts['Carry'] || 0)) {
      unmetRole = 'Carry';
      maxDeficit = (targetRolesWithCounts['Carry'] || 1) - (roleCoveredCounts['Carry'] || 0);
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

      let score = 100000 + candLvl * 5000;
      const skills = cand.totalSkillsCount;
      const maxAvail = maxLvlByRole[targetRole] || 4;

      if (mode === 'single') {
        const minPossible = minSkillsByRole[targetRole] || 1;
        if (skills === 1) score += 60000;
        else if (skills === minPossible) score += 30000;
        score -= (skills - 1) * 25000;

        if (candLvl === maxAvail) score += 15000;
        else if (candLvl >= 3) score += 8000;
        score += candLvl * 2000;
      } else if (mode === 'multiple') {
        if (skills >= 3) score += 60000;
        else if (skills === 2) score += 35000;
        else if (skills === 1) score -= 80000;

        if (candLvl === maxAvail) score += 20000;
        else if (candLvl >= 3) score += 10000;
        score += candLvl * 2000;
      } else {
        if (candLvl === maxAvail) score += 40000;
        else if (candLvl >= 3) score += 20000;
        score += candLvl * 3000;
      }

      if (!isSurplusPhase) {
        // Base phase: Big synergy bonus for covering OTHER currently unmet roles!
        for (const [r, l] of Object.entries(cand.relevantAbilities)) {
          if (r !== targetRole) {
            const def = (targetRolesWithCounts[r] || 1) - (roleCoveredCounts[r] || 0);
            if (def > 0) score += 35000 + l * 4000;
            else score += l * 500;
          }
        }
      } else {
        // Surplus rotation phase (+1 -> +2 cycle):
        // Candidate should also have Hauling (Carry) if possible!
        if (targetRole !== 'Carry' && cand.relevantAbilities['Carry']) {
          score += 25000 + cand.relevantAbilities['Carry'] * 3000;
        }
      }

      // Soft species diversity penalty
      const already = teamSpeciesCount[cand.creatureId] || 0;
      score -= already * 16000;

      if (score > bestScore) {
        bestScore = score;
        bestCand = cand;
      }
    }

    if (bestCand && bestScore > -20000) {
      let primaryRole = targetRole;
      if (!isSurplusPhase) {
        // Find which ability of bestCand had the highest deficit
        let highestDef = 0;
        let highestRole = targetRole;
        for (const [r, l] of Object.entries(bestCand.relevantAbilities)) {
          const def = (targetRolesWithCounts[r] || 1) - (roleCoveredCounts[r] || 0);
          if (def > highestDef) {
            highestDef = def;
            highestRole = r;
          }
        }
        primaryRole = highestRole;
      }

      selectedTeam.push({
        ...bestCand,
        primaryRole,
        primaryLvl: bestCand.relevantAbilities[primaryRole] || bestCand.maxRelevantLvl,
        isSurplus: isSurplusPhase,
        slotNumber: slot + 1
      });

      teamSpeciesCount[bestCand.creatureId] = (teamSpeciesCount[bestCand.creatureId] || 0) + 1;

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

  const coveredRoles = targetRoles.filter(r => (roleCoveredCounts[r] || 0) >= (targetRolesWithCounts[r] || 1));
  const level4Count = selectedTeam.filter(m => m.primaryLvl === 4).length;
  const level3Count = selectedTeam.filter(m => m.primaryLvl === 3).length;

  return {
    selectedTeam,
    roleCoveredCounts,
    roleCoveredLevels,
    coveredRoles,
    coveragePercent: targetRoles.length > 0 ? Math.round((coveredRoles.length / targetRoles.length) * 100) : 100,
    level4Count,
    level3Count
  };
}

function runOptimizer() {
  const targetRolesWithCounts = getSelectedRolesWithCounts();
  const targetRoles = Object.keys(targetRolesWithCounts);
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
  const targetRoles = Object.keys(targetRolesWithCounts);

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
            const assigned = currentOption.roleCoveredCounts[r] || 0;
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
