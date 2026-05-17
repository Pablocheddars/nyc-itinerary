const CHECKLIST_DATA = [
  {
    category: "Cr\u00edtico \u2014 se agotan r\u00e1pido",
    icon: "\ud83c\udfab",
    items: [
      { id: "totr", label: "Top of the Rock", time: "Slot sunset ~19:00", day: "D\u00eda 2 \u00b7 Mi\u00e9 3 jun", price: "~$46 USD", url: "https://www.topoftherocknyc.com", urlLabel: "topoftherocknyc.com" },
      { id: "marquee", label: "Marquee Skydeck \u2014 Kozlow x Tolga x Orson", time: "23:00 \u2014 viernes", day: "D\u00eda 4 \u00b7 Vie 5 jun", price: "~$80 USD", url: "https://www.edgenyc.com/marquee-skydeck/", urlLabel: "edgenyc.com" },
      { id: "statue", label: "Estatua de la Libertad", time: "Ferry ~11:00 \u2014 pedestal", day: "D\u00eda 5 \u00b7 S\u00e1b 6 jun", price: "~$25 USD", url: "https://www.statuecruises.com", urlLabel: "statuecruises.com" },
      { id: "summit", label: "Summit One Vanderbilt", time: "Slot 18:30", day: "D\u00eda 7 \u00b7 Lun 8 jun", price: "$44\u201360 USD", url: "https://summitov.com", urlLabel: "summitov.com" }
    ]
  },
  {
    category: "Reservar en Resy",
    icon: "\ud83c\udf7d\ufe0f",
    items: [
      { id: "momofuku", label: "Momofuku Noodle Bar", time: "Mesa ~16:00", day: "D\u00eda 2 \u00b7 Mi\u00e9 3 jun", price: "", url: "https://resy.com", urlLabel: "Resy" },
      { id: "sipguzzle", label: "Sip & Guzzle", time: "~21:00", day: "D\u00eda 2 \u00b7 Mi\u00e9 3 jun", price: "", url: "https://resy.com", urlLabel: "Resy" },
      { id: "idachi", label: "Idachi", time: "19:30", day: "D\u00eda 5 \u00b7 S\u00e1b 6 jun", price: "", url: "https://resy.com", urlLabel: "Resy" },
      { id: "maison", label: "Maison Premiere", time: "18:30 \u2014 pedir terraza", day: "D\u00eda 6 \u00b7 Dom 7 jun", price: "", url: "https://resy.com", urlLabel: "Resy" },
      { id: "crane", label: "Crane Club", time: "17:30\u201318:00 (horario wagyu burger)", day: "D\u00eda 9 \u00b7 Mi\u00e9 10 jun", price: "", url: "https://resy.com", urlLabel: "Resy" },
      { id: "eo", label: "Employees Only", time: "20:30", day: "D\u00eda 9 \u00b7 Mi\u00e9 10 jun", price: "", url: "https://resy.com", urlLabel: "Resy" }
    ]
  },
  {
    category: "Comprar ticket online",
    icon: "\ud83c\udfdb\ufe0f",
    items: [
      { id: "911", label: "9/11 Memorial & Museum", time: "Slot 9:00\u201310:00", day: "D\u00eda 3 \u00b7 Jue 4 jun", price: "$25\u201336 USD", url: "https://www.911memorial.org", urlLabel: "911memorial.org" },
      { id: "whitney", label: "Whitney Museum", time: "10:00", day: "D\u00eda 4 \u00b7 Vie 5 jun", price: "~$25 USD", url: "https://whitney.org", urlLabel: "whitney.org" },
      { id: "vessel", label: "The Vessel", time: "15:30", day: "D\u00eda 4 \u00b7 Vie 5 jun", price: "Variable", url: "https://www.vesselnyc.com", urlLabel: "vesselnyc.com" },
      { id: "met", label: "The Met", time: "10:00", day: "D\u00eda 8 \u00b7 Mar 9 jun", price: "~$30 USD", url: "https://www.metmuseum.org", urlLabel: "metmuseum.org" }
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
        html += `  <div class="ck-check">${checked ? '\u2705' : '\u2b1c'}</div>`;
        html += `  <div class="ck-body">`;
        html += `    <div class="ck-name">${item.label}</div>`;
        html += `    <div class="ck-meta">`;
        html += `      <span class="ck-time">\ud83d\udd50 ${item.time}</span>`;
        html += `      <span class="ck-day">${item.day}</span>`;
        if (item.price) html += `<span class="ck-price">${item.price}</span>`;
        html += `    </div>`;
        html += `    <a class="ck-link" href="${item.url}" target="_blank" rel="noopener">${item.urlLabel} \u2197</a>`;
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
