const CATEGORIES = [
  { key: 'food', label: 'Comida', icon: '\ud83c\udf55' },
  { key: 'drinks', label: 'Drinks / Bar', icon: '\ud83c\udf78' },
  { key: 'shop', label: 'Tienda', icon: '\ud83d\udecd\ufe0f' },
  { key: 'sight', label: 'Lugar / Paseo', icon: '\ud83d\udcf7' },
  { key: 'other', label: 'Otro', icon: '\u2b50' }
];

function getItems() {
  return JSON.parse(localStorage.getItem('nyc-wishlist') || '[]');
}

function saveItems(items) {
  localStorage.setItem('nyc-wishlist', JSON.stringify(items));
}

function buildFormHTML() {
  const catOpts = CATEGORIES.map(c => `<option value="${c.key}">${c.icon} ${c.label}</option>`).join('');
  return `
    <div class="wl-form">
      <div class="wl-form-row">
        <input type="text" id="wl-name" class="wl-input" placeholder="Nombre del lugar" />
        <select id="wl-cat" class="wl-select">${catOpts}</select>
      </div>
      <div class="wl-form-row">
        <input type="text" id="wl-note" class="wl-input wl-input-wide" placeholder="Nota (opcional) \u2014 direcci\u00f3n, qu\u00e9 probar, qui\u00e9n lo recomend\u00f3..." />
        <button id="wl-add" class="wl-btn">+ Agregar</button>
      </div>
    </div>`;
}

function buildListHTML() {
  const items = getItems();
  if (items.length === 0) {
    return '<div class="wl-empty">No hay lugares guardados a\u00fan. \u00a1Agreguen los que vayan descubriendo!</div>';
  }

  const grouped = {};
  for (const cat of CATEGORIES) grouped[cat.key] = [];
  for (const item of items) {
    if (!grouped[item.cat]) grouped[item.cat] = [];
    grouped[item.cat].push(item);
  }

  let html = `<div class="wl-count">${items.length} lugar${items.length !== 1 ? 'es' : ''} guardado${items.length !== 1 ? 's' : ''}</div>`;

  for (const cat of CATEGORIES) {
    const catItems = grouped[cat.key];
    if (catItems.length === 0) continue;
    html += `<div class="wl-group">`;
    html += `<div class="ck-cat">${cat.icon} ${cat.label}</div>`;
    for (const item of catItems) {
      const done = item.done ? ' done' : '';
      html += `<div class="wl-item${done}" data-id="${item.id}">`;
      html += `  <div class="wl-check" data-action="toggle">${item.done ? '\u2705' : '\u2b1c'}</div>`;
      html += `  <div class="wl-body">`;
      html += `    <div class="ck-name">${item.name}</div>`;
      if (item.note) html += `<div class="wl-note">${item.note}</div>`;
      html += `    <div class="wl-date">Agregado ${item.added}</div>`;
      html += `  </div>`;
      html += `  <button class="wl-del" data-action="delete" title="Eliminar">\u00d7</button>`;
      html += `</div>`;
    }
    html += `</div>`;
  }
  return html;
}

export function renderWishlist() {
  return `<div id="wishlist-root">${buildFormHTML()}${buildListHTML()}</div>`;
}

export function initWishlistEvents() {
  const root = document.getElementById('wishlist-root');
  if (!root) return;

  function refresh() {
    root.innerHTML = buildFormHTML() + buildListHTML();
    bind();
  }

  function bind() {
    const addBtn = document.getElementById('wl-add');
    const nameInput = document.getElementById('wl-name');
    const noteInput = document.getElementById('wl-note');
    const catSelect = document.getElementById('wl-cat');

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) { nameInput.focus(); return; }
        const items = getItems();
        items.push({
          id: 'wl-' + Date.now(),
          name: name,
          note: noteInput.value.trim(),
          cat: catSelect.value,
          done: false,
          added: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
        });
        saveItems(items);
        refresh();
      });
    }

    if (nameInput) {
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addBtn.click();
      });
    }

    root.querySelectorAll('.wl-item').forEach(el => {
      el.addEventListener('click', (e) => {
        const action = e.target.dataset.action || e.target.closest('[data-action]')?.dataset.action;
        if (!action) return;
        const items = getItems();
        const idx = items.findIndex(i => i.id === el.dataset.id);
        if (idx === -1) return;
        if (action === 'toggle') {
          items[idx].done = !items[idx].done;
          saveItems(items);
          refresh();
        } else if (action === 'delete') {
          items.splice(idx, 1);
          saveItems(items);
          refresh();
        }
      });
    });
  }

  window.__wishlistInit = refresh;
  refresh();
}
