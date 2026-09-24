// Aniimo Homeland Hub Frontend Application

let allAniimo = [];
let currentFormFocus = 'all';
let cardActiveTabs = {}; // id -> tab key

const grid = document.getElementById('aniimoGrid');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const stageFilter = document.getElementById('stageFilter');
const elementFilter = document.getElementById('elementFilter');
const abilityFilter = document.getElementById('abilityFilter');
const minLevelFilter = document.getElementById('minLevelFilter');
const pillBtns = document.querySelectorAll('.pill-btn');
const resultsBadge = document.getElementById('resultsBadge');

const detailModal = document.getElementById('detailModal');
const modalClose = document.getElementById('modalClose');
const modalBody = document.getElementById('modalBody');

// Element Colors & Icons Map
const elementMeta = {
  Fire: { emoji: '🔥', color1: '#ea580c', color2: '#f97316' },
  Grass: { emoji: '🌱', color1: '#16a34a', color2: '#22c55e' },
  Water: { emoji: '💧', color1: '#0284c7', color2: '#0ea5e9' },
  Earth: { emoji: '⛰️', color1: '#b45309', color2: '#d97706' },
  Lightning: { emoji: '⚡', color1: '#ca8a04', color2: '#eab308' },
  Ice: { emoji: '❄️', color1: '#0284c7', color2: '#38bdf8' },
  Wind: { emoji: '🍃', color1: '#0d9488', color2: '#14b8a6' },
  Dark: { emoji: '🌑', color1: '#7e22ce', color2: '#a855f7' },
  Light: { emoji: '✨', color1: '#d97706', color2: '#fbbf24' }
};

const abilityEmoji = {
  Fire: '🔥', Grass: '🌱', Water: '💧', Earth: '⛰️',
  Lightning: '⚡', Ice: '❄️', Wind: '🍃', Dark: '🌑', Light: '✨',
  Carry: '📦', Artisanship: '🔨', Leisure: '☕', Perfumery: '🌸'
};

// Generate high-resolution SVG portrait for any Aniimo based on name & element
function generateSvgPortrait(name, element, isPrismana = false) {
  const meta = elementMeta[element] || { color1: '#475569', color2: '#64748b', emoji: '🐾' };
  const c1 = isPrismana ? '#ec4899' : meta.color1;
  const c2 = isPrismana ? '#8b5cf6' : meta.color2;
  const c3 = isPrismana ? '#06b6d4' : '#0f172a';

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${encodeURIComponent(c1)}"/>
        <stop offset="60%" stop-color="${encodeURIComponent(c2)}"/>
        <stop offset="100%" stop-color="${encodeURIComponent(c3)}"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="white" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(%23bgGrad)"/>
    <circle cx="200" cy="90" r="70" fill="url(%23glow)"/>
    <!-- Elemental / Prismatic Particles -->
    <circle cx="80" cy="40" r="15" fill="white" opacity="0.15"/>
    <circle cx="330" cy="140" r="22" fill="white" opacity="0.12"/>
    <circle cx="310" cy="45" r="10" fill="white" opacity="0.2"/>
    <!-- Silhouette / Creature Icon -->
    <g transform="translate(160, 50)">
      <circle cx="40" cy="40" r="36" fill="rgba(15, 23, 42, 0.4)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
      <text x="40" y="52" font-size="34" text-anchor="middle" font-family="sans-serif">${meta.emoji}</text>
    </g>
    <!-- Label -->
    <text x="200" y="165" font-family="'Outfit', sans-serif" font-weight="700" font-size="19" fill="%23ffffff" text-anchor="middle" letter-spacing="1">${name}</text>
  </svg>`;
}

// Fetch Data from Node.js REST API
async function fetchAniimoData() {
  try {
    const res = await fetch('/api/aniimo');
    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.warn('API fetch failed, trying local JSON file');
  }

  try {
    const res = await fetch('/data/aniimo_homeland_data.json');
    if (res.ok) return await res.json();
  } catch (e) {
    console.error('All data loading failed', e);
  }
  return [];
}

// Render Card List
function renderCards(list) {
  if (!list.length) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: #94a3b8;">
        <h3 style="font-size: 1.5rem; color: white; margin-bottom: 0.5rem;">No Aniimo Matched</h3>
        <p>Try widening your search terms or resetting filters.</p>
      </div>
    `;
    resultsBadge.textContent = 'Showing 0 Aniimo';
    return;
  }

  resultsBadge.textContent = `Showing ${list.length} Aniimo`;

  grid.innerHTML = list.map(item => {
    const basicForm = item.forms.basic;
    const weatherForms = item.forms.weather || [];
    const prismanaForm = item.forms.prismana;

    const activeTabKey = cardActiveTabs[item.id] || 
      (currentFormFocus === 'prismana' ? 'prismana' : 
      (currentFormFocus === 'weather' && weatherForms.length ? 'weather_0' : 'basic'));

    let activeData = basicForm;
    let isPris = false;

    if (activeTabKey === 'prismana' && prismanaForm) {
      activeData = prismanaForm;
      isPris = true;
    } else if (activeTabKey.startsWith('weather_')) {
      const idx = parseInt(activeTabKey.split('_')[1], 10);
      if (weatherForms[idx]) activeData = weatherForms[idx];
    }

    // SVG portrait or custom photo
    const portraitSrc = generateSvgPortrait(item.name, activeData.element.split('/')[0].trim(), isPris);

    // Build form nav buttons
    let navBtns = `<button class="btn-form-tab ${activeTabKey === 'basic' ? 'active' : ''}" onclick="setCardTab('${item.id}', 'basic')">Basic</button>`;

    weatherForms.forEach((wf, i) => {
      const sel = activeTabKey === `weather_${i}`;
      const label = wf.name.replace(item.name, '').replace(/[()]/g, '').trim();
      navBtns += `<button class="btn-form-tab ${sel ? 'active' : ''}" onclick="setCardTab('${item.id}', 'weather_${i}')">⚡ ${label}</button>`;
    });

    if (prismanaForm) {
      navBtns += `<button class="btn-form-tab is-prismana ${isPris ? 'active' : ''}" onclick="setCardTab('${item.id}', 'prismana')">🌈 Prismana</button>`;
    }

    // Build abilities progress pills
    const abilitiesHtml = Object.entries(activeData.abilities).map(([abil, lvl]) => {
      const pct = Math.min((lvl / 5) * 100, 100);
      return `
        <div class="abil-pill">
          <div class="abil-pill-top">
            <span class="abil-pill-name">${abilityEmoji[abil] || '⭐'} ${abil}</span>
            <span class="abil-pill-lvl">Lv.${lvl}</span>
          </div>
          <div class="abil-progress-bar">
            <div class="abil-progress-fill lvl-${lvl}" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="card ${isPris ? 'is-prismana-active' : ''}" id="aniimo-${item.id}">
        <!-- Picture Portrait Banner -->
        <div class="card-portrait-wrap" onclick="openDetailModal('${item.id}')" style="cursor: pointer;" title="Click for detailed stats">
          <img src="/images/${item.id}.svg" class="portrait-img" alt="${item.name}" onerror="this.onerror=null; this.src='${portraitSrc}';">
          <div class="portrait-overlay">
            <span class="portrait-badge-id">#${item.id}</span>
            <span class="portrait-badge-stage stage-${item.stage}">${item.stage}</span>
          </div>
        </div>

        <!-- Title & Elements -->
        <div class="card-header-row">
          <h3 class="card-title" onclick="openDetailModal('${item.id}')" style="cursor: pointer;">${item.name}</h3>
          <div class="element-badges-wrap">
            <span class="el-badge el-${item.element}">
              ${elementMeta[item.element]?.emoji || ''} ${item.element}
            </span>
            ${item.secondary_element ? `
              <span class="el-badge el-${item.secondary_element}">
                ${elementMeta[item.secondary_element]?.emoji || ''} ${item.secondary_element}
              </span>
            ` : ''}
          </div>
        </div>

        <div class="card-evo-txt">🧬 ${item.evolution_line}</div>

        <div class="card-role-strip">
          <span class="role-tag">Optimal Homeland Role</span>
          <span class="role-desc">${item.best_role}</span>
        </div>

        <!-- Form Switcher -->
        <div class="form-nav-strip">
          ${navBtns}
        </div>

        <!-- Active Form Panel -->
        <div class="active-form-box">
          <div class="form-info-line">
            <span class="form-title-txt">${activeData.name}</span>
            <span class="form-loc-tag">📍 ${activeData.condition}</span>
          </div>

          <div class="ability-pill-grid">
            ${abilitiesHtml}
          </div>

          <div class="workplace-perk-box">
            <strong>Workplace Perk:</strong> ${activeData.perk}
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
  const item = allAniimo.find(a => a.id === id);
  if (!item) return;

  const basic = item.forms.basic;
  const weatherList = item.forms.weather || [];
  const prismana = item.forms.prismana;

  modalBody.innerHTML = `
    <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
      <div style="width: 180px; height: 120px; border-radius: 12px; overflow: hidden; background: #151d2c;">
        <img src="/images/${item.id}.svg" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='${generateSvgPortrait(item.name, item.element)}';">
      </div>
      <div>
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.4rem;">
          <span class="portrait-badge-id">#${item.id}</span>
          <span class="portrait-badge-stage stage-${item.stage}">${item.stage}</span>
          <span class="el-badge el-${item.element}">${elementMeta[item.element]?.emoji || ''} ${item.element}</span>
        </div>
        <h2 style="font-size: 2rem; font-weight: 800;">${item.name}</h2>
        <p style="color: #94a3b8; font-family: 'JetBrains Mono'; font-size: 0.85rem;">Evolution: ${item.evolution_line}</p>
        <p style="color: #38bdf8; font-size: 0.9rem; margin-top: 0.3rem;">Battle Role: <strong>${item.role || 'DPS'}</strong></p>
      </div>
    </div>

    <div style="background: rgba(10, 13, 20, 0.6); padding: 1rem; border-radius: 10px; margin-bottom: 1.5rem; border-left: 3px solid #38bdf8;">
      <strong style="color: #38bdf8; text-transform: uppercase; font-size: 0.75rem; display: block; margin-bottom: 0.2rem;">Best Base Assignment</strong>
      <span style="font-size: 0.95rem; color: #f1f5f9;">${item.best_role}</span>
    </div>

    <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">All Cataloged Forms & Homeland Ratings</h3>

    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <!-- Basic -->
      <div style="background: rgba(10, 13, 20, 0.4); border: 1px solid rgba(255,255,255,0.06); padding: 0.85rem; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
          <strong style="color: white;">${basic.name}</strong>
          <span style="font-size: 0.75rem; color: #94a3b8;">${basic.condition}</span>
        </div>
        <p style="font-size: 0.85rem; color: #38bdf8; margin-bottom: 0.4rem;">
          Abilities: ${Object.entries(basic.abilities).map(([a, l]) => `${a} Lv.${l}`).join(', ')}
        </p>
        <p style="font-size: 0.8rem; color: #cbd5e1;">${basic.perk}</p>
      </div>

      <!-- Weather Forms -->
      ${weatherList.map(wf => `
        <div style="background: rgba(10, 13, 20, 0.4); border: 1px solid rgba(255,255,255,0.06); padding: 0.85rem; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
            <strong style="color: #eab308;">⚡ ${wf.name}</strong>
            <span style="font-size: 0.75rem; color: #94a3b8;">Trigger: ${wf.condition}</span>
          </div>
          <p style="font-size: 0.85rem; color: #38bdf8; margin-bottom: 0.4rem;">
            Abilities: ${Object.entries(wf.abilities).map(([a, l]) => `${a} Lv.${l}`).join(', ')}
          </p>
          <p style="font-size: 0.8rem; color: #cbd5e1;">${wf.perk}</p>
        </div>
      `).join('')}

      <!-- Prismana -->
      ${prismana ? `
        <div style="background: linear-gradient(135deg, rgba(236,72,153,0.1), rgba(168,85,247,0.1)); border: 1px solid rgba(244,114,182,0.3); padding: 0.85rem; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
            <strong style="color: #f472b6;">🌈 ${prismana.name}</strong>
            <span style="font-size: 0.75rem; color: #f472b6;">${prismana.condition}</span>
          </div>
          <p style="font-size: 0.85rem; color: #f472b6; margin-bottom: 0.4rem;">
            Abilities: ${Object.entries(prismana.abilities).map(([a, l]) => `${a} Lv.${l}`).join(', ')}
          </p>
          <p style="font-size: 0.8rem; color: #fdf2f8;">${prismana.perk}</p>
        </div>
      ` : ''}
    </div>
  `;

  detailModal.classList.remove('hidden');
};

modalClose.addEventListener('click', () => detailModal.classList.add('hidden'));
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) detailModal.classList.add('hidden');
});

function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  const stage = stageFilter.value;
  const element = elementFilter.value;
  const ability = abilityFilter.value;
  const minLvl = parseInt(minLevelFilter.value, 10);

  const filtered = allAniimo.filter(item => {
    // Stage check
    if (stage !== 'all' && item.stage.toLowerCase() !== stage.toLowerCase()) return false;

    // Element check
    if (element !== 'all' && item.element !== element && item.secondary_element !== element) {
      return false;
    }

    // Weather form filter
    const weatherForms = item.forms.weather || [];
    if (currentFormFocus === 'weather' && weatherForms.length === 0) return false;

    // Ability check
    if (ability !== 'all') {
      const allForms = [
        item.forms.basic,
        ...(item.forms.weather || []),
        item.forms.prismana
      ].filter(Boolean);

      const meets = allForms.some(f => (f.abilities && (f.abilities[ability] || 0) >= minLvl));
      if (!meets) return false;
    }

    // Query text check
    if (query) {
      const formsStr = JSON.stringify(item.forms);
      const text = `${item.id} ${item.name} ${item.evolution_line} ${item.best_role} ${item.element} ${formsStr}`.toLowerCase();
      if (!text.includes(query)) return false;
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

stageFilter.addEventListener('change', applyFilters);
elementFilter.addEventListener('change', applyFilters);
abilityFilter.addEventListener('change', applyFilters);
minLevelFilter.addEventListener('change', applyFilters);

pillBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    pillBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFormFocus = btn.dataset.form;

    allAniimo.forEach(item => {
      const weatherForms = item.forms.weather || [];
      if (currentFormFocus === 'prismana') {
        cardActiveTabs[item.id] = 'prismana';
      } else if (currentFormFocus === 'weather' && weatherForms.length) {
        cardActiveTabs[item.id] = 'weather_0';
      } else if (currentFormFocus === 'basic') {
        cardActiveTabs[item.id] = 'basic';
      }
    });

    applyFilters();
  });
});

// App Startup
(async () => {
  allAniimo = await fetchAniimoData();
  document.getElementById('statSpecies').textContent = allAniimo.length;

  let totalForms = 0;
  let weatherCount = 0;
  allAniimo.forEach(i => {
    const wCount = (i.forms.weather ? i.forms.weather.length : 0);
    weatherCount += wCount;
    totalForms += 1 + wCount + (i.forms.prismana ? 1 : 0);
  });

  document.getElementById('statForms').textContent = `${totalForms}+`;
  document.getElementById('statWeatherCount').textContent = `${weatherCount}+`;

  applyFilters();
})();
