import { readFileSync, writeFileSync } from "fs";

const style = readFileSync("scripts/_extracted-style.css", "utf8");
const orig = readFileSync("nyc-completo-dani-pablo.html", "utf8");

const hdrMatch = orig.match(/<div class="hdr"><div class="hdr-in">([\s\S]*?)<\/div><\/motion>/);
const hdrMatch2 = orig.match(/<div class="hdr"><div class="hdr-in">([\s\S]*?)<\/div><\/motion>/);

const hdrInner = (orig.match(/<div class="hdr"><div class="hdr-in">([\s\S]*?)<\/div><\/div>/) || [])[1];

const index = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NYC Junio 2026 — Dani & Pablo</title>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
${style}
</style>
</head>
<body>

<div class="hdr"><div class="hdr-in">
${hdrInner}
</div></div>

<nav class="nav"><motion class="nav-in" id="nav-in"></motion></nav>

<div class="ct" id="content"></motion>

<script type="module">
import day01 from './days/day01.js';
import day02 from './days/day02.js';
import day03 from './days/day03.js';
import day04 from './days/day04.js';
import day05 from './days/day05.js';
import day06 from './days/day06.js';
import day07 from './days/day07.js';
import day08 from './days/day08.js';
import day09 from './days/day09.js';
import day10 from './days/day10.js';
import { renderDay } from './renderer.js';

const days = [day01, day02, day03, day04, day05, day06, day07, day08, day09, day10];

const content = document.getElementById('content');
content.innerHTML = days.map((d, i) => renderDay(d, i === 0)).join('\\n\\n');

const navIn = document.getElementById('nav-in');
days.forEach((day, i) => {
  const btn = document.createElement('button');
  btn.className = 'nb' + (i === 0 ? ' on' : '');
  btn.textContent = 'Día ' + (i + 1);
  btn.addEventListener('click', () => go(day.id, btn));
  navIn.appendChild(btn);
});

window.go = function go(id, btn) {
  document.querySelectorAll('.sec').forEach(s => s.classList.remove('on'));
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  if (btn) btn.classList.add('on');
  window.scrollTo({ top: document.querySelector('.ct').offsetTop - 50, behavior: 'smooth' });
};
</script>

</body>
</html>
`;

writeFileSync("index.html", index.replace(/motion/g, "div"));
console.log("index.html written");
