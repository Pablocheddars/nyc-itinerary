const CHECKLIST_DATA = [
  {
    category: "Crítico — se agotan rápido",
    icon: "🎫",
    items: [
      { id: "totr", label: "Top of the Rock", time: "Slot sunset ~19:00", day: "Día 2 · Mié 3 jun", price: "~$46 USD", url: "https://www.topoftherocknyc.com", urlLabel: "topoftherocknyc.com" },
      { id: "statue", label: "Estatua de la Libertad", time: "Ferry ~11:00 — pedestal", day: "Día 5 · Sáb 6 jun", price: "~$25 USD", url: "https://www.statuecruises.com", urlLabel: "statuecruises.com" },
      { id: "summit", label: "Summit One Vanderbilt", time: "Slot 18:30", day: "Día 7 · Lun 8 jun", price: "$44–60 USD", url: "https://summitov.com", urlLabel: "summitov.com" }
    ]
  },
  {
    category: "Reservar en Resy",
    icon: "🍽️",
    items: [
      { id: "sipguzzle", label: "Sip & Guzzle", time: "~21:00", day: "Día 2 · Mié 3 jun", price: "", url: "https://resy.com", urlLabel: "Resy" },
      { id: "idashi", label: "Idashi", time: "19:30", day: "Día 5 · Sáb 6 jun", price: "", url: "https://resy.com", urlLabel: "Resy ✅" },
      { id: "chezma", label: "Chez Ma Tante (brunch)", time: "10:00 — pancakes", day: "Día 6 · Dom 7 jun", price: "", url: "https://resy.com", urlLabel: "Resy" },
      { id: "maison", label: "Maison Premiere (garden)", time: "18:30 — garden", day: "Día 6 · Dom 7 jun", price: "", url: "https://resy.com", urlLabel: "Resy ✅" },
      { id: "eo", label: "Employees Only", time: "20:30", day: "Día 9 · Mié 10 jun", price: "", url: "https://resy.com", urlLabel: "Resy" }
    ]
  },
  {
    category: "Reservar en OpenTable / SevenRooms",
    icon: "📝",
    items: [
      { id: "momofuku", label: "Momofuku Noodle Bar", time: "Mesa ~17:00", day: "Día 2 · Mié 3 jun", price: "", url: "https://www.opentable.com/r/momofuku-noodle-bar-new-york", urlLabel: "OpenTable" },
      { id: "crane", label: "Crane Club", time: "17:30–18:00 (wagyu burger)", day: "Día 9 · Mié 10 jun", price: "", url: "https://taogroup.com/venues/crane-club-restaurant-new-york/reservations/", urlLabel: "SevenRooms / OpenTable" }
    ]
  },
  {
    category: "Comprar ticket online",
    icon: "🏛️",
    items: [
      { id: "911", label: "9/11 Memorial & Museum", time: "Slot 9:00–10:00", day: "Día 3 · Jue 4 jun", price: "$25–36 USD", url: "https://www.911memorial.org", urlLabel: "911memorial.org" },
      { id: "whitney", label: "Whitney Museum", time: "10:00", day: "Día 4 · Vie 5 jun", price: "~$25 USD", url: "https://whitney.org", urlLabel: "whitney.org" },
      { id: "vessel", label: "The Vessel", time: "15:30", day: "Día 4 · Vie 5 jun", price: "Variable", url: "https://www.vesselnyc.com", urlLabel: "vesselnyc.com" },
      { id: "met", label: "The Met", time: "10:00", day: "Día 8 · Mar 9 jun", price: "~$30 USD", url: "https://www.metmuseum.org", urlLabel: "metmuseum.org" }
    ]
  }
];

export function renderChecklist() {
  const saved = JSON.parse(localStorage.getItem('nyc-checklist') || '{}');

  function toggle(id) {
    const s = JSON.parse(localStorage.getItem('nyc-checklist') || '{}');
    s[id] = !s[id];
    localStorage.setItem('nyc-checklist', JSON.stringify(s));
    document.getElementById('checklist-root').innerHTML = buildHTML();
    bindEvents();
  }

  function buildHTML() {
    const s = JSON.parse(localStorage.getItem('nyc-checklist') || '{}');
    const done = Object.values(s).filter(Boolean).length;
    const total = CHECKLIST_DATA.reduce((n, g) => n + g.items.length, 0);

    let html = `<div class="ck-progress"><span class="ck-count">${done}/${total}</span> reservas confirmadas</div>`;

    for (const group of CHECKLIST_DATA) {
      html += `<div class="ck-group">`;
      html += `<div class="ck-cat">${group.icon} ${group.category}</div>`;
      for (const item of group.items) {
        const checked = s[item.id];
        const cls = checked ? 'ck-item done' : 'ck-item';
        html += `<div class="${cls}" data-id="${item.id}">`;
        html += `  <div class="ck-check">${checked ? '✅' : '⬜'}</div>`;
        html += `  <div class="ck-body">`;
        html += `    <div class="ck-name">${item.label}</div>`;
        html += `    <div class="ck-meta">`;
        html += `      <span class="ck-time">🕐 ${item.time}</span>`;
        html += `      <span class="ck-day">${item.day}</span>`;
        if (item.price) html += `<span class="ck-price">${item.price}</span>`;
        html += `    </div>`;
        html += `    <a class="ck-link" href="${item.url}" target="_blank" rel="noopener">${item.urlLabel} ↗</a>`;
        html += `  </div>`;
        html += `</div>`;
      }
      html += `</div>`;
    }
    return html;
  }

  function bindEvents() {
    document.querySelectorAll('.ck-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') return;
        toggle(el.dataset.id);
      });
    });
  }

  window.__checklistInit = function() {
    document.getElementById('checklist-root').innerHTML = buildHTML();
    bindEvents();
  };

  return `<div id="checklist-root">${buildHTML()}</div>`;
}

export function initChecklistEvents() {
  if (window.__checklistInit) window.__checklistInit();
}
