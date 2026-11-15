
/* ===================================================================
   Habillage commun des cinématiques : bandes cinéma, grain de pellicule, vignette
   =================================================================== */
let GRAIN = null;
function grainURL() {
  if (GRAIN !== null) return GRAIN;
  try { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'), d = g.createImageData(128, 128); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 40; } g.putImageData(d, 0, 0); GRAIN = c.toDataURL(); } catch (e) { GRAIN = ''; }
  return GRAIN;
}
function cinFX(el, o = {}) {
  const cv = el.querySelector('canvas'), after = n => { if (cv && cv.parentNode === el) el.insertBefore(n, cv.nextSibling); else el.prepend(n); };
  if (o.vig !== false) { const v = document.createElement('div'); v.className = 'cfx-vig'; after(v); }
  if (o.bars !== false) { const b = document.createElement('div'); b.className = 'cfx-bars'; b.innerHTML = '<i></i><i></i>'; after(b); requestAnimationFrame(() => requestAnimationFrame(() => b.classList.add('on'))); }
  if (!cfg.lite && o.grain !== false) { const u = grainURL(); if (u) { const gr = document.createElement('div'); gr.className = 'cfx-grain' + (o.light ? ' l' : ''); gr.style.backgroundImage = `url(${u})`; el.appendChild(gr); } }
}

/* ----- IMPACT FRAMES (façon anime), une version par thème :
   quelques images (≈ 0,3 s) en négatif ultra contrasté, avec des traits qui convergent vers l'impact ----- */
const IMPT = {
  base: {lines: 'burst', a: {filter: 'invert(1) grayscale(1) contrast(6) brightness(1.15)', fill: '#fff'}, b: {bg: '#fff', fill: '#000'}, c: {bg: '#000', fill: '#fff'}},
  /* ✸ supernova : négatif feu, éclats de verre */
  nova: {lines: 'shards', a: {filter: 'invert(1) grayscale(1) contrast(6) sepia(1) saturate(7) hue-rotate(-25deg)', fill: '#fff'}, b: {bg: '#fff1d6', fill: '#d81e05'}, c: {bg: '#140100', fill: '#ffb347'}},
  /* ✦ singularité : tout s'enroule vers le trou noir */
  x0: {lines: 'swirl', a: {filter: 'invert(1) grayscale(1) contrast(6) sepia(1) saturate(4) hue-rotate(210deg)', fill: '#fff'}, b: {bg: '#ffe7b0', fill: '#1d0630'}, c: {bg: '#000', fill: '#ffd27a'}},
  /* ∞ infini : traits arc-en-ciel */
  inf: {lines: 'burst', rainbow: true, a: {filter: 'invert(1) grayscale(1) contrast(6) brightness(1.1)', fill: '#fff'}, b: {bg: '#fff'}, c: {bg: '#000'}},
  /* ◈ tesseract : grille en perspective, couleurs RVB décalées */
  tes: {lines: 'grid', a: {filter: 'invert(1) grayscale(1) contrast(6) sepia(1) saturate(8) hue-rotate(140deg)', fill: '#fff'}, b: {bg: '#07051a', fill: '#5af0ff', ghost: '#ff5adc'}, c: {bg: '#f4f8ff', fill: '#ff2fc8', ghost: '#00c8ff'}},
  /* ✺ légendaire : éclat d'étoile doré */
  gen: {lines: 'star', a: {filter: 'invert(1) grayscale(1) contrast(5) sepia(1) saturate(3) hue-rotate(-5deg) brightness(1.1)', fill: '#fff'}, b: {bg: '#fffaf0', fill: '#b8862c'}, c: {bg: '#04030c', fill: '#ffe3a0'}},
  /* ♛ créateur : éclats prismatiques arc-en-ciel */
  crea: {lines: 'shards', rainbow: true, a: {filter: 'invert(1) grayscale(1) contrast(6) sepia(1) saturate(5) hue-rotate(250deg)', fill: '#fff'}, b: {bg: '#fff'}, c: {bg: '#05030f'}},
  /* 🚂 dernier train : sépia et or, comme une vieille affiche */
  train: {lines: 'burst', a: {filter: 'invert(1) grayscale(1) contrast(6) sepia(1) saturate(2.5) hue-rotate(5deg)', fill: '#fff'}, b: {bg: '#f3e3bd', fill: '#3a2410'}, c: {bg: '#0b0f22', fill: '#e8c77a'}},
  /* 👁 présence : négatif froid, fissures */
  pres: {lines: 'shards', a: {filter: 'invert(1) grayscale(1) contrast(9)', fill: '#fff'}, b: {bg: '#e9eee6', fill: '#000'}, c: {bg: '#000', fill: '#e9eee6'}},
  /* ✨ singularité shiny : spirale arc-en-ciel */
  x0s: {lines: 'swirl', rainbow: true, a: {filter: 'invert(1) grayscale(1) contrast(6) sepia(1) saturate(6) hue-rotate(160deg)', fill: '#fff'}, b: {bg: '#f4fbff'}, c: {bg: '#05030f'}},
  /* ∅ néant : éclaboussure d'encre sur papier */
  /* 🌊 abysse : l'iris, bleu des grands fonds */
  aby: {lines: 'iris', a: {filter: 'invert(1) grayscale(1) contrast(6) sepia(1) saturate(7) hue-rotate(150deg)', fill: '#fff'}, b: {bg: '#00101c', fill: '#5ff4ff', ghost: '#8a5cff'}, c: {bg: '#eafcff', fill: '#00324a', ghost: '#2fd8ff'}},
  void: {lines: 'ink', a: {filter: 'grayscale(1) contrast(9) brightness(1.1)', fill: '#141418'}, b: {bg: '#f4f1ea', fill: '#141418'}, c: {bg: '#141418', fill: '#f4f1ea'}}
};
function impLines(kind, cx, cy, n, r0) {
  const rnd = Math.random, pt = (a, r) => (cx + Math.cos(a) * r).toFixed(0) + ',' + (cy + Math.sin(a) * r).toFixed(0), R = 1100; let o = '';
  const wedge = (a, w, r1, r2, h) => `<polygon style="--h:${h | 0}" points="${pt(a - w, r2)} ${pt(a + w, r2)} ${pt(a, r1)}"/>`;
  if (kind === 'burst') for (let i = 0; i < n; i++) o += wedge(rnd() * 6.2832, .004 + rnd() * .022, r0 + rnd() * 150, R, i * 360 / n);
  if (kind === 'shards') {   // éclats de verre anguleux qui partent du point d'impact
    for (let i = 0; i < n * .7; i++) { const a = rnd() * 6.2832, r1 = r0 + rnd() * 120, r2 = r1 + 120 + rnd() * 500, w = .02 + rnd() * .06, k = (rnd() - .5) * .12; o += `<polygon points="${pt(a, r1)} ${pt(a + w + k, r1 + (r2 - r1) * .45)} ${pt(a + k * .5, r2)} ${pt(a - w + k, r1 + (r2 - r1) * .55)}"/>`; }
    for (let i = 0; i < 30; i++) o += wedge(rnd() * 6.2832, .003 + rnd() * .008, r0 + 200 + rnd() * 200, R, 0);
  }
  if (kind === 'swirl') for (let i = 0; i < n * .8; i++) {   // traits en spirale aspirés vers le centre
    const a = rnd() * 6.2832, w = .02 + rnd() * .05, tw = 1.6 + rnd() * .8, L = [], Rr = [];
    for (let k = 0; k <= 12; k++) { const q = k / 12, r = R * (1 - q) + (r0 + rnd() * 20) * q, an = a + tw * q * q, ww = w * (1 - q * .9); L.push(pt(an - ww, r)); Rr.unshift(pt(an + ww, r)); }
    o += `<polygon points="${L.concat(Rr).join(' ')}"/>`;
  }
  if (kind === 'grid') {   // la pièce en perspective : rayons + cadres emboîtés
    for (let i = 0; i < 28; i++) o += wedge(i / 28 * 6.2832 + rnd() * .05, .006 + rnd() * .006, r0, R, 0);
    for (let k = 0; k < 9; k++) { const s = Math.pow(1.55, k) * 18, sw = 1.5 + k * .9; o += `<rect x="${(cx - s * 1.66).toFixed(0)}" y="${(cy - s).toFixed(0)}" width="${(s * 3.33).toFixed(0)}" height="${(s * 2).toFixed(0)}" style="fill:none;stroke:var(--f);stroke-width:${sw.toFixed(1)}"/>`; }
  }
  if (kind === 'star') {   // éclat d'étoile : rayons fins, grande croix, poussière d'étoiles
    for (let i = 0; i < n * .8; i++) o += wedge(rnd() * 6.2832, .002 + rnd() * .012, r0 + rnd() * 220, R, 0);
    [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach((a, i) => { const L = i % 2 ? 480 : 820, w = 9; o += `<polygon points="${(cx + Math.cos(a) * L).toFixed(0)},${(cy + Math.sin(a) * L).toFixed(0)} ${(cx + Math.cos(a + 1.5708) * w).toFixed(0)},${(cy + Math.sin(a + 1.5708) * w).toFixed(0)} ${cx},${cy} ${(cx + Math.cos(a - 1.5708) * w).toFixed(0)},${(cy + Math.sin(a - 1.5708) * w).toFixed(0)}"/>`; });
    for (let i = 0; i < 70; i++) { const a = rnd() * 6.2832, r = 90 + rnd() * 420; o += `<circle cx="${(cx + Math.cos(a) * r).toFixed(0)}" cy="${(cy + Math.sin(a) * r * .8).toFixed(0)}" r="${(1 + rnd() * 2.6).toFixed(1)}"/>`; }
  }
  if (kind === 'iris') {   // l'œil de l'abîme : fibres de l'iris, longues lignes, plancton
    for (let i = 0; i < 120; i++) { const a = i / 120 * 6.2832 + rnd() * .03, w = .008 + rnd() * .012; o += `<polygon points="${pt(a - w, r0)} ${pt(a + w, r0)} ${pt(a, r0 + 60 + rnd() * 100)}"/>`; }
    for (let i = 0; i < n * .6; i++) o += wedge(rnd() * 6.2832, .003 + rnd() * .01, r0 + 190 + rnd() * 120, R, 0);
    for (let i = 0; i < 46; i++) { const a = rnd() * 6.2832, r = 210 + rnd() * 380; o += `<circle cx="${(cx + Math.cos(a) * r).toFixed(0)}" cy="${(cy + Math.sin(a) * r * .8).toFixed(0)}" r="${(1 + rnd() * 2.4).toFixed(1)}"/>`; }
  }
  if (kind === 'ink') {   // éclaboussure : tache centrale, coulures effilées, gouttelettes
    let d = ''; for (let i = 0; i <= 36; i++) { const a = i / 36 * 6.2832, r = 46 * (1 + .25 * Math.sin(a * 5 + rnd()) + .18 * rnd()); d += (i ? 'L' : 'M') + pt(a, r); } o += `<path d="${d}Z"/>`;
    for (let i = 0; i < 26; i++) { const a = rnd() * 6.2832, r2 = 90 + rnd() * 260, w = .05 + rnd() * .07; o += `<polygon points="${pt(a - w, 34)} ${pt(a + w, 34)} ${pt(a + w * .2, r2)} ${pt(a - w * .2, r2)}"/><circle cx="${(cx + Math.cos(a) * (r2 + 8)).toFixed(0)}" cy="${(cy + Math.sin(a) * (r2 + 8)).toFixed(0)}" r="${(2 + rnd() * 5).toFixed(1)}"/>`; }
    for (let i = 0; i < 50; i++) { const a = rnd() * 6.2832, r = 60 + rnd() * 400; o += `<circle cx="${(cx + Math.cos(a) * r).toFixed(0)}" cy="${(cy + Math.sin(a) * r).toFixed(0)}" r="${(.8 + rnd() * 3).toFixed(1)}"/>`; }
  }
  return o;
}
function impactFrames(o = {}) {
  const T = IMPT[o.theme] || IMPT.base, host = o.host || stage, cx = o.x == null ? 400 : o.x, cy = o.y == null ? 240 : o.y, dt = o.dt || 55;
  const seq = o.seq || ['a', 'b', 'a', 'c', 'b', 'a'], lines = impLines(T.lines, cx, cy, o.lines || 64, o.r0 || 40);
  const d = document.createElement('div'); d.className = 'imp' + (T.rainbow ? ' rb' : '');
  const ring = T.lines === 'ink' ? '' : `<circle class="imp-c" cx="${cx}" cy="${cy}" r="${o.r || 46}"/>`;
  const hasG = ['a', 'b', 'c'].some(k => T[k] && T[k].ghost);
  d.innerHTML = `<svg viewBox="0 0 800 480" preserveAspectRatio="none">${hasG ? `<g class="imp-g">${lines}</g>` : ''}<g class="imp-l">${lines}${ring}</g></svg>`;
  host.appendChild(d);
  const f0 = stage.style.filter, done = () => { stage.style.filter = f0; d.remove(); };
  seq.forEach((k, i) => setTimeout(() => { const F = T[k] || IMPT.base[k]; stage.style.filter = F.filter || f0; d.dataset.k = k; d.style.background = F.bg || 'transparent'; d.style.setProperty('--f', F.fill || '#fff'); d.style.setProperty('--g', F.ghost || 'transparent'); d.style.transform = `translate(${((Math.random() - .5) * 14).toFixed(0)}px,${((Math.random() - .5) * 10).toFixed(0)}px) scale(${(1 + Math.random() * .04).toFixed(3)})`; }, i * dt));
  setTimeout(done, seq.length * dt);
  if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on && o.snd !== false) AMB.one('impact');
}
