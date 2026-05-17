import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const D = "d" + "iv";
const html = readFileSync("nyc-completo-dani-pablo.html", "utf8");

function trim(s) {
  return s?.trim() ?? null;
}

function parseCard(cardHtml) {
  const isNew = /class="card new"/.test(cardHtml);
  const isReplaced = /class="card replaced"/.test(cardHtml);
  const isLogistic = /border-left:3px solid var\(--logistic\)/.test(cardHtml);
  const time = (cardHtml.match(/<span class="c-time">([^<]*)<\/span>/) || ["", ""])[1];

  const nameM = cardHtml.match(new RegExp(`<${D} class="c-name">([\\s\\S]*?)<\\/${D}>`));
  const name = trim(nameM?.[1]);

  const descM = cardHtml.match(new RegExp(`<${D} class="c-desc">([\\s\\S]*?)<\\/${D}>`));
  const desc = descM ? trim(descM[1]) : null;

  const addrM = cardHtml.match(new RegExp(`<${D} class="c-addr">([\\s\\S]*?)<\\/${D}>`));
  const addr = addrM ? trim(addrM[1]) : null;

  const tipM = cardHtml.match(new RegExp(`<${D} class="c-tip">([\\s\\S]*?)<\\/${D}>`));
  const tip = tipM ? { html: trim(tipM[1]) } : null;

  const repM = cardHtml.match(
    new RegExp(`<${D} class="c-replaced-note">([\\s\\S]*?)<\\/${D}>`)
  );
  const replacedNote = repM ? trim(repM[1]) : null;

  const tags = [];
  const tagRe = /<span class="tg([^"]*)"([^>]*)>([^<]*)<\/span>/g;
  let tm;
  while ((tm = tagRe.exec(cardHtml)) !== null) {
    const cls = tm[1].trim();
    const attrs = tm[2];
    const label = tm[3];
    if (attrs.includes("logistic") || label === "Logística") {
      tags.push({ key: "logistic", label: "Logística", inline: true });
    } else if (cls) {
      tags.push({ key: cls, label });
    }
  }

  return {
    time,
    name,
    desc,
    addr,
    tags,
    tip,
    isNew,
    isReplaced,
    replacedNote: isReplaced ? replacedNote : null,
    isLogistic,
  };
}

function parseCards(chunk) {
  const events = [];
  const open = `<${D} class="card`;
  let search = 0;
  while (search < chunk.length) {
    const start = chunk.indexOf(open, search);
    if (start === -1) break;
    let depth = 0;
    let end = start;
    for (let i = start; i < chunk.length; i++) {
      if (chunk.startsWith(`<${D}`, i)) depth++;
      if (chunk.startsWith(`</${D}>`, i)) {
        depth--;
        if (depth === 0) {
          end = i + `</${D}>`.length;
          break;
        }
      }
    }
    events.push(parseCard(chunk.slice(start, end)));
    search = end;
  }
  return events;
}

function parseNightBlock(blockHtml) {
  const nightTitle = trim(
    (blockHtml.match(new RegExp(`<${D} class="night-title">([\\s\\S]*?)<\\/${D}>`)) || [])[1]
  );
  const nightSub = trim(
    (blockHtml.match(new RegExp(`<${D} class="night-sub">([\\s\\S]*?)<\\/${D}>`)) || [])[1]
  );
  const body = blockHtml.replace(
    new RegExp(`^[\\s\\S]*?<${D} class="night-sub">[\\s\\S]*?<\\/${D}>\\s*`),
    ""
  );
  return {
    type: "night",
    label: null,
    nightTitle,
    nightSub,
    events: parseCards(body),
  };
}

function parseDay(inner, dayNum) {
  const id = `d${dayNum}`;
  const number = String(dayNum).padStart(2, "0");
  const title = trim(
    (inner.match(new RegExp(`<${D} class="dh-title">([\\s\\S]*?)<\\/${D}>`)) || [])[1]
  );
  const date = trim(
    (inner.match(new RegExp(`<${D} class="dh-date">([\\s\\S]*?)<\\/${D}>`)) || [])[1]
  );
  const note = trim(
    (inner.match(new RegExp(`<${D} class="dh-note">([\\s\\S]*?)<\\/${D}>`)) || [])[1]
  );

  const bariM = inner.match(new RegExp(`<${D} class="bari">([\\s\\S]*?)<\\/${D}>`));
  const alert = bariM ? trim(bariM[1]) : null;

  let body = inner.replace(
    new RegExp(`<${D} class="dh">[\\s\\S]*?<\\/${D}>\\s*`),
    ""
  );
  if (alert) {
    body = body.replace(
      new RegExp(`<${D} class="bari">[\\s\\S]*?<\\/${D}>\\s*`),
      ""
    );
  }

  const phases = [];
  const parts = body.split(
    new RegExp(`(?=<${D} class="phase">|<${D} class="night-block">)`)
  );

  for (const part of parts) {
    if (!part.trim()) continue;
    if (part.startsWith(`<${D} class="night-block">`)) {
      phases.push(parseNightBlock(part));
      continue;
    }
    if (part.startsWith(`<${D} class="phase">`)) {
      const dotM = part.match(
        /<span class="dot (am|pm|night)"><\/span>([^<]*)/
      );
      const type = dotM ? dotM[1] : "am";
      const label = dotM ? dotM[2].trim() : "";
      const afterPhase = part.replace(
        new RegExp(`<${D} class="phase">[\\s\\S]*?<\\/${D}>\\s*`),
        ""
      );
      phases.push({ type, label, events: parseCards(afterPhase) });
    }
  }

  return { id, number, title, date, note, alert, phases };
}

mkdirSync("days", { recursive: true });

function extractDayInners(source) {
  const markers = [
    ...source.matchAll(/<!-- ===================== DÍA (\d+) ===================== -->/g),
  ];
  return markers.map((m, i) => {
    const n = parseInt(m[1], 10);
    const start = m.index + m[0].length;
    const end =
      i + 1 < markers.length
        ? markers[i + 1].index
        : source.indexOf("\n\n<script>");
    let chunk = source.slice(start, end);
    chunk = chunk.replace(/^\s*<div class="sec[^"]*"[^>]*>\s*/, "");
    chunk = chunk.replace(/\s*<\/div>\s*$/m, "");
    return { n, inner: chunk };
  });
}

const days = [];
for (const { n, inner } of extractDayInners(html)) {
  const day = parseDay(inner, n);
  days.push(day);
  const file = join("days", `day${String(n).padStart(2, "0")}.js`);
  writeFileSync(file, `export default ${JSON.stringify(day, null, 2)};\n`);
  const events = day.phases.reduce((s, p) => s + p.events.length, 0);
  const cards = (inner.match(new RegExp(`<${D} class="card"`, "g")) || []).length;
  console.log(
    `day${String(n).padStart(2, "0")}.js — ${events} events (${cards} cards in source)`
  );
}

if (days.length !== 10) {
  console.error("Expected 10 days, got", days.length);
  process.exit(1);
}

const style = (html.match(/<style>([\s\S]*?)<\/style>/) || [])[1];
writeFileSync("scripts/_extracted-style.css", style);
console.log("OK");
