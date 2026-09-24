// Fetch or inline dataset fallback
async function loadData() {
  try {
    const res = await fetch('../data/aniimo_homeland_data.json');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Fetch failed (likely file:// protocol), using window.ANIIMO_DATA');
  }
  return window.ANIIMO_DATA || [];
}

let allAniimo = [];
let currentFormFilter = 'all';
let selectedTabs = {}; // id -> 'basic' | 'weather_0' | 'prismana'

const grid = document.getElementById('aniimoGrid');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const stageFilter = document.getElementById('stageFilter');
const elementFilter = document.getElementById('elementFilter');
const abilityFilter = document.getElementById('abilityFilter');
const minLevelFilter = document.getElementById('minLevelFilter');
const tagBtns = document.querySelectorAll('.tag-btn');
const resultsCount = document.getElementById('results-count');

function getElementEmoji(element) {
  const map = {
    Fire: '🔥', Grass: '🌱', Water: '💧', Earth: '⛰️',
    Lightning: '⚡', Ice: '❄️', Wind: '🍃', Dark: '🌑', Light: '✨'
  };
  return map[element] || '✨';
}

function getAbilityEmoji(ability) {
  const map = {
    Fire: '🔥', Grass: '🌱', Water: '💧', Earth: '⛰️',
    Lightning: '⚡', Ice: '❄️', Wind: '🍃', Dark: '🌑', Light: '✨',
    Carry: '📦', Artisanship: '🔨', Leisure: '☕', Perfumery: '🌸'
  };
  return map[ability] || '⭐';
}

function renderCards(list) {
  if (!list.length) {
    grid.innerHTML = `
      <div class="no-results">
        <h3>No Aniimo Found</h3>
        <p>Try clearing your filters or changing your search terms.</p>
      </div>
    `;
    resultsCount.textContent = 'Showing 0 Aniimo';
    return;
  }

  resultsCount.textContent = `Showing ${list.length} Aniimo`;

  grid.innerHTML = list.map(item => {
    const basicForm = item.forms.basic;
    const weatherForms = item.forms.weather || [];
    const prismanaForm = item.forms.prismana;

    // Active form for this card
    const activeTab = selectedTabs[item.id] || (currentFormFilter === 'prismana' ? 'prismana' : (currentFormFilter === 'weather' && weatherForms.length ? 'weather_0' : 'basic'));
    
    let activeFormData = basicForm;
    let activeFormType = 'Basic';
    let triggerText = basicForm.condition;

    if (activeTab === 'prismana') {
      activeFormData = prismanaForm;
      activeFormType = 'Prismana';
      triggerText = prismanaForm.condition;
    } else if (activeTab.startsWith('weather_')) {
      const idx = parseInt(activeTab.split('_')[1], 10);
      if (weatherForms[idx]) {
        activeFormData = weatherForms[idx];
        activeFormType = 'Weather';
        triggerText = activeFormData.condition;
      }
    }

    // Render Form Buttons
    let formBtnsHtml = `
      <button class="form-nav-btn ${activeTab === 'basic' ? 'active' : ''}" onclick="switchFormTab('${item.id}', 'basic')">Basic</button>
    `;

    weatherForms.forEach((wf, i) => {
      const isSelected = activeTab === `weather_${i}`;
      formBtnsHtml += `
        <button class="form-nav-btn ${isSelected ? 'active' : ''}" onclick="switchFormTab('${item.id}', 'weather_${i}')">
          ⚡ ${wf.name.replace(item.name, '').replace(/[()]/g, '').trim()}
        </button>
      `;
    });

    if (prismanaForm) {
      const isPris = activeTab === 'prismana';
      formBtnsHtml += `
        <button class="form-nav-btn is-prismana ${isPris ? 'active' : ''}" onclick="switchFormTab('${item.id}', 'prismana')">
          🌈 Prismana
        </button>
      `;
    }

    // Render Abilities
    const abilitiesHtml = Object.entries(activeFormData.abilities).map(([abil, lvl]) => {
      const percent = Math.min((lvl / 5) * 100, 100);
      return `
        <div class="ability-badge">
          <div class="ability-badge-top">
            <span class="ability-name">${getAbilityEmoji(abil)} ${abil}</span>
            <span class="ability-lvl">Lv.${lvl}</span>
          </div>
          <div class="ability-bar">
            <div class="ability-bar-fill lvl-${lvl}" style="width: ${percent}%;"></div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="card" id="card-${item.id}">
        <div class="card-top">
          <span class="id-badge">#${item.id}</span>
          <span class="stage-badge stage-${item.stage}">${item.stage}</span>
        </div>

        <div class="card-title-row">
          <h2 class="card-title">${item.name}</h2>
          <span class="element-pill el-${item.primary_element}">
            ${getElementEmoji(item.primary_element)} ${item.primary_element}
          </span>
          ${item.secondary_element ? `
            <span class="element-pill el-${item.secondary_element}">
              ${getElementEmoji(item.secondary_element)} ${item.secondary_element}
            </span>
          ` : ''}
        </div>

        <div class="card-evo">🧬 ${item.evolution_line}</div>

        <div class="card-role-box">
          <span class="role-label">Best Base Role</span>
          <span class="role-text">${item.best_role}</span>
        </div>

        <div class="card-forms-nav">
          ${formBtnsHtml}
        </div>

        <div class="form-view-panel">
          <div class="form-header">
            <span class="form-variant-name">${activeFormData.name}</span>
            <span class="form-trigger-tag" title="Condition to encounter or trigger">📍 ${triggerText}</span>
          </div>

          <div class="abilities-list">
            ${abilitiesHtml}
          </div>

          <div class="form-perk-box">
            <strong>Workplace Trait:</strong> ${activeFormData.perk}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.switchFormTab = function(id, tab) {
  selectedTabs[id] = tab;
  applyFilters();
};

function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  const stage = stageFilter.value;
  const element = elementFilter.value;
  const ability = abilityFilter.value;
  const minLvl = parseInt(minLevelFilter.value, 10);

  const filtered = allAniimo.filter(item => {
    // Stage check
    if (stage !== 'all' && item.stage !== stage) return false;

    // Element check
    if (element !== 'all' && item.primary_element !== element && item.secondary_element !== element) {
      return false;
    }

    // Check forms matching the quick focus
    const weatherForms = item.forms.weather || [];
    if (currentFormFilter === 'weather' && weatherForms.length === 0) return false;

    // Ability & Min Level check across active or all forms
    if (ability !== 'all') {
      const activeTab = selectedTabs[item.id] || (currentFormFilter === 'prismana' ? 'prismana' : (currentFormFilter === 'weather' && weatherForms.length ? 'weather_0' : 'basic'));
      let formAbilities = {};

      if (activeTab === 'prismana') {
        formAbilities = item.forms.prismana.abilities;
      } else if (activeTab.startsWith('weather_')) {
        const idx = parseInt(activeTab.split('_')[1], 10);
        formAbilities = weatherForms[idx] ? weatherForms[idx].abilities : {};
      } else {
        formAbilities = item.forms.basic.abilities;
      }

      // Check if ability exists and meets level
      const lvl = formAbilities[ability] || 0;
      if (lvl < minLvl) {
        // Also check if any form of this creature possesses it
        const hasInAnyForm = [
          item.forms.basic,
          ...(item.forms.weather || []),
          item.forms.prismana
        ].some(f => (f.abilities[ability] || 0) >= minLvl);

        if (!hasInAnyForm) return false;
      }
    }

    // Search query check
    if (query) {
      const basicStr = JSON.stringify(item.forms.basic);
      const weatherStr = JSON.stringify(item.forms.weather || []);
      const prismanaStr = JSON.stringify(item.forms.prismana);
      const text = `${item.name} ${item.evolution_line} ${item.best_role} ${item.primary_element} ${basicStr} ${weatherStr} ${prismanaStr}`.toLowerCase();
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

tagBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tagBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFormFilter = btn.dataset.form;

    // Reset or adapt selected tabs
    allAniimo.forEach(item => {
      const weatherForms = item.forms.weather || [];
      if (currentFormFilter === 'prismana') {
        selectedTabs[item.id] = 'prismana';
      } else if (currentFormFilter === 'weather' && weatherForms.length) {
        selectedTabs[item.id] = 'weather_0';
      } else if (currentFormFilter === 'basic') {
        selectedTabs[item.id] = 'basic';
      }
    });

    applyFilters();
  });
});

// Initialize
(async () => {
  allAniimo = await loadData();
  document.getElementById('stat-species').textContent = allAniimo.length;
  
  let totalForms = 0;
  allAniimo.forEach(i => {
    totalForms += 1 + (i.forms.weather ? i.forms.weather.length : 0) + (i.forms.prismana ? 1 : 0);
  });
  document.getElementById('stat-forms').textContent = totalForms;

  applyFilters();
})();
