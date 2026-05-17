const D = "d" + "iv";

const TAG_LABELS = {
  pizza: "Pizza research",
  bakery: "Bakery benchmark",
  breakfast: "Desayuno",
  burger: "Burger research",
  bar: "Bar",
  sight: "Paseo",
  shop: "Compras",
  must: "Must",
};

function el(cls, inner) {
  return `<${D} class="${cls}">${inner}</${D}>`;
}

function tagLabel(tag) {
  if (typeof tag === "string") return TAG_LABELS[tag] || tag;
  return tag.label;
}

function tagClass(tag) {
  return typeof tag === "string" ? tag : tag.key;
}

function renderTags(tags) {
  if (!tags?.length) return "";
  const spans = tags
    .map((tag) => {
      const key = tagClass(tag);
      const label = tagLabel(tag);
      if (tag.inline || key === "logistic") {
        return `<span class="tg" style="background:#EFF6FF;color:var(--logistic)">${label}</span>`;
      }
      return `<span class="tg ${key}">${label}</span>`;
    })
    .join("");
  return el("c-tags", spans);
}

function renderEvent(event) {
  const classes = ["card"];
  if (event.isNew) classes.push("new");
  if (event.isReplaced) classes.push("replaced");
  const style = event.isLogistic
    ? ' style="border-left:3px solid var(--logistic)"'
    : "";

  let inner = "";
  if (event.isReplaced) {
    inner =
      el("c-name", event.name) + el("c-replaced-note", event.replacedNote);
  } else {
    inner = el("c-name", event.name);
    if (event.desc) inner += el("c-desc", event.desc);
    if (event.addr) inner += el("c-addr", event.addr);
    inner += renderTags(event.tags);
    if (event.tip) inner += el("c-tip", event.tip.html);
  }

  const bodyInner = inner
    .split("\n")
    .map((line) => (line ? `    ${line}` : line))
    .join("\n");
  const body = `<${D} class="c-body">\n${bodyInner}\n  </${D}>`;
  const row = `  <${D} class="c-row"><span class="c-time">${event.time}</span>${body}</${D}>`;

  return `<${D} class="${classes.join(" ")}"${style}>\n${row}\n</${D}>`;
}

function renderNightEvent(event) {
  return renderEvent(event)
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
}

function renderPhase(phase) {
  if (phase.type === "night") {
    const cards = phase.events.map(renderNightEvent).join("\n\n");
    return `<${D} class="night-block">
  ${el("night-title", phase.nightTitle)}
  ${el("night-sub", phase.nightSub)}

${cards}
</${D}>`;
  }

  const dot = phase.type;
  const label = phase.label;
  const cards = phase.events.map(renderEvent).join("\n\n");
  return `${el("phase", `<span class="dot ${dot}"></span>${label}`)}

${cards}`;
}

export function renderDay(dayData, isFirst = false) {
  const onClass = isFirst ? " on" : "";
  const alert = dayData.alert ? el("bari", dayData.alert) : "";
  const phases = dayData.phases.map(renderPhase).join("\n\n");

  return `<${D} class="sec${onClass}" id="${dayData.id}">
<${D} class="dh">
  ${el("dh-num", dayData.number)}
  ${el("dh-title", dayData.title)}
  ${el("dh-date", dayData.date)}
  ${el("dh-note", dayData.note)}
</${D}>

${alert}

${phases}
</${D}>`;
}
