
/* ===================================================================
   EFFETS ANIMÉS : météo, nuages, soleil, lune, éclairs, fêtes
   Tous réglables : intensité, vitesse, vent, couleur et taille des particules
   =================================================================== */
const f = $('fx').getContext('2d');
let LAY = [], CLD = [], SPD = 1, WND = 0, PCOL = '', PSZ = 1, BOLT = null, FROST = null, EMO = ['🍂'];
const BASEN = {aby: 110, rain: 90, storm: 160, snow: 70, stars: 70, confetti: 70, hearts: 26, leaves: 36, petals: 40, santa: 70, fog: 14, drizzle: 120, sleet: 110, hail: 90, blizzard: 220, wind: 50, rainbow: 40, aurora: 70, meteors: 70, sand: 240, lucky: 60, halloween: 44, bats: 16, ghosts: 6, notes: 34, crepes: 16, clovers: 30, bubbles: 34, fireflies: 34, frost: 30, emoji: 30, matrix: 34, eggs: 22, sunrays: 1, sparkles: 26, eyes: 6, shapes: 9, sakura: 16, hbub: 18, bh: 260, embers: 40, inf: 90, nova: 80, ink: 20, tes: 80, gen: 120, crea: 110, train: 1, pres: 1, x0s: 1};
const BACK = {aby: 1, stars: 1, aurora: 1, meteors: 1, sunrays: 1, bh: 1, inf: 1, nova: 1, tes: 1, gen: 1, crea: 1, train: 1, pres: 1, x0s: 1};
const np = () => ({x: Math.random() * 800, y: Math.random() * 480, v: 12 + Math.random() * 10, r: Math.random() * 1.8 + .6, p: Math.random() * 6.28, k: Math.random(), t: Math.random() * 1000 | 0, l: 0});
const pcol = a => PCOL ? hexA(PCOL, a) : null;
const segs = s => { s = String(s || '').replace(/\s+/g, ''); try { if (window.Intl && Intl.Segmenter) return [...new Intl.Segmenter().segment(s)].map(x => x.segment); } catch (e) {} return Array.from(s); };
function mkLayer(k, d) {
  const n = Math.round((cfg.lite ? .5 : 1) * (BASEN[k] || 0) * d), L = {k, P: Array.from({length: n}, np), B: []};
  if (k === 'matrix') L.P.forEach((p, i) => { p.x = (i + .5) * 800 / n; p.y = -Math.random() * 600; });
  if (k === 'ghosts' || k === 'eyes') L.P.forEach(p => { p.y = 60 + Math.random() * 300; });
  return L;
}
let lastFx = '';
function initFx() {
  SPD = clamp(+TH.spd || 1, .1, 4); WND = clamp(+TH.wind || 0, -5, 5); PCOL = /^#[0-9a-f]{6}$/i.test(TH.pc || '') ? TH.pc : ''; PSZ = clamp(+TH.ps || 1, .3, 4);
  const dn = clamp(TH.dens === '' || isNaN(+TH.dens) ? 1 : +TH.dens, 0, 3);
  if (TH.fx === 'santa' && lastFx !== 'santa') { SA.on = false; SA.next = performance.now() + 2500; } lastFx = TH.fx;
  LAY = [mkLayer(TH.fx, dn)];
  if (TH.fx2 && TH.fx2 !== 'none' && TH.fx2 !== TH.fx) LAY.push(mkLayer(TH.fx2, dn));
  if (TH.stars && TH.fx !== 'stars' && TH.fx2 !== 'stars') LAY.push(mkLayer('stars', 1));
  if (HT.amb) LAY.push(mkLayer(HT.amb, 1));
  const e = segs(TH.emo); EMO = e.length ? e : ['🍂', '🍁'];
  const nc = HT.noClouds ? 0 : Math.min(5, (+TH.clouds || 0) + boost);
  CLD = Array.from({length: nc * 2}, () => ({x: Math.random() * 900 - 100, y: 30 + Math.random() * 260, s: .7 + Math.random() * .9, v: .08 + Math.random() * .14, a: .5 + Math.random() * .5}));
  FROST = null; GCACHE = {};
}
let GCACHE = {};
function moon(x, y, r, col) {   // vraie phase de la lune
  const p = TH.mph === 'full' ? .5 : TH.mph === 'half' ? .25 : TH.mph === 'crescent' ? .12 : moonPhase(), k = Math.cos(2 * Math.PI * p), c = /^#[0-9a-f]{6}$/i.test(col || '') ? col : '#f6f2dc';
  f.save(); f.shadowColor = hexA(c, .8); f.shadowBlur = 40; f.fillStyle = hexA(c, .12); f.beginPath(); f.arc(x, y, r, 0, 6.2832); f.fill();
  if (p >= .5) { f.translate(2 * x, 0); f.scale(-1, 1); }
  f.fillStyle = c; f.beginPath(); f.arc(x, y, r, -Math.PI / 2, Math.PI / 2, false); f.ellipse(x, y, Math.abs(k) * r, r, 0, Math.PI / 2, -Math.PI / 2, k > 0); f.closePath(); f.fill(); f.restore();
}
const POS = {r: [640, 112], c: [400, 92], l: [150, 104], h: [400, 396], m: [392, 150]};
/* 'auto' : derrière le panneau en verre (style iOS), sinon dans l'espace libre entre la température et les jours */
const astro = () => POS[TH.pos] || (stage.classList.contains('sig') && cfg.layout.days === 'side' && cfg.layout.now === 'left' && cfg.show.days ? POS.m : POS.r);
function sunDraw(t) {
  const [x, y] = astro(), key = 'sun' + x + y;
  const g = GCACHE[key] || (GCACHE[key] = (() => { const g = f.createRadialGradient(x, y, 4, x, y, 240); g.addColorStop(0, 'rgba(255,248,210,.95)'); g.addColorStop(.13, 'rgba(255,232,150,.45)'); g.addColorStop(1, 'rgba(255,210,120,0)'); return g; })());
  f.fillStyle = g; f.fillRect(x - 240, y - 240, 480, 480);
  f.save(); f.translate(x, y); f.rotate(t / 9000); f.fillStyle = 'rgba(255,245,200,.045)';
  for (let i = 0; i < 12; i++) { f.rotate(Math.PI / 6); f.beginPath(); f.moveTo(0, 0); f.lineTo(260, -14); f.lineTo(260, 14); f.closePath(); f.fill(); }
  f.restore(); f.fillStyle = '#fff8d8'; f.beginPath(); f.arc(x, y, 32 + Math.sin(t / 900) * 1.2, 0, 6.2832); f.fill();
}
function cloud(c, col) {
  f.fillStyle = col; f.beginPath(); const s = c.s * 34;
  [[0, 0, 1], [1.1, .25, .8], [-1.1, .3, .75], [.5, -.55, .85], [-.45, -.4, .7]].forEach(a => { const x = c.x + a[0] * s, y = c.y + a[1] * s; f.moveTo(x + a[2] * s, y); f.arc(x, y, a[2] * s, 0, 6.2832); });
  f.fill();
}
function bat(x, y, s, a, col) {
  const w = s, h = s * .55 * a;
  const L = [[0, -.15 * s], [-.35 * w, -.35 * s - h, -w, -1.1 * h], [-.82 * w, -.3 * h + .12 * s, -.7 * w, .12 * s], [-.55 * w, .02 * s, -.42 * w, .2 * s], [-.28 * w, .08 * s, -.14 * w, .26 * s]];
  f.fillStyle = col; f.beginPath(); f.moveTo(x + L[0][0], y + L[0][1]);
  for (let i = 1; i < 5; i++) f.quadraticCurveTo(x + L[i][0], y + L[i][1], x + L[i][2], y + L[i][3]);
  f.lineTo(x, y + .3 * s); f.lineTo(x + .14 * w, y + .26 * s);
  for (let i = 4; i >= 1; i--) { const e = i > 1 ? L[i - 1] : L[0], ex = i > 1 ? -e[2] : -e[0], ey = i > 1 ? e[3] : e[1]; f.quadraticCurveTo(x - L[i][0], y + L[i][1], x + ex, y + ey); }
  f.closePath(); f.fill();
  f.beginPath(); f.moveTo(x - s * .13, y - s * .1); f.lineTo(x - s * .09, y - s * .36); f.lineTo(x - s * .02, y - s * .17); f.lineTo(x + s * .02, y - s * .17); f.lineTo(x + s * .09, y - s * .36); f.lineTo(x + s * .13, y - s * .1); f.closePath(); f.fill();
}
function ghost(x, y, r, al, t, ph) {
  f.fillStyle = `rgba(245,245,255,${al})`; f.beginPath(); f.arc(x, y, r, Math.PI, 0); f.lineTo(x + r, y + r * 1.3);
  for (let i = 0; i < 4; i++) { const x0 = x + r - i * r / 2; f.quadraticCurveTo(x0 - r / 4, y + r * 1.3 + (i % 2 ? -1 : 1) * r * .28 * Math.sin(t / 260 + ph), x0 - r / 2, y + r * 1.3); }
  f.closePath(); f.fill(); f.fillStyle = `rgba(25,10,35,${Math.min(1, al * 1.8)})`;
  [[-.36, -.08], [.36, -.08]].forEach(([dx, dy]) => { f.beginPath(); f.ellipse(x + dx * r, y + dy * r, r * .15, r * .24, 0, 0, 6.2832); f.fill(); });
  f.beginPath(); f.ellipse(x, y + r * .42, r * .14, r * .2 + Math.sin(t / 400 + ph) * r * .05, 0, 0, 6.2832); f.fill();
}
let GLOW = null;
const glow = () => GLOW || (GLOW = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'), r = g.createRadialGradient(16, 16, 0, 16, 16, 16); r.addColorStop(0, 'rgba(255,255,200,1)'); r.addColorStop(.25, 'rgba(220,255,120,.8)'); r.addColorStop(1, 'rgba(160,255,80,0)'); g.fillStyle = r; g.fillRect(0, 0, 32, 32); return c; })());
function buildFrost() {
  const c = document.createElement('canvas'); c.width = 800; c.height = 480; const g = c.getContext('2d');
  [[0, 0], [800, 0], [0, 480], [800, 480]].forEach(([x, y]) => { const r = g.createRadialGradient(x, y, 0, x, y, 260); r.addColorStop(0, 'rgba(235,248,255,.5)'); r.addColorStop(1, 'rgba(235,248,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 800, 480); });
  g.strokeStyle = 'rgba(240,250,255,.55)'; g.lineCap = 'round';
  const br = (x, y, a, l, d) => { const x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l; g.lineWidth = Math.max(.5, d * .45); g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); if (d > 0) { br(x2, y2, a + (Math.random() - .5) * .5, l * .78, d - 1); if (Math.random() < .75) br(x2, y2, a + .7 + Math.random() * .3, l * .5, d - 1); if (Math.random() < .75) br(x2, y2, a - .7 - Math.random() * .3, l * .5, d - 1); } };
  for (let i = 0; i < 70; i++) { const s = Math.random() * 4 | 0, u = Math.random(); let x, y, a; if (s === 0) { x = u * 800; y = 0; a = Math.PI / 2; } else if (s === 1) { x = u * 800; y = 480; a = -Math.PI / 2; } else if (s === 2) { x = 0; y = u * 480; a = 0; } else { x = 800; y = u * 480; a = Math.PI; } const corner = Math.min(x, 800 - x) < 160 || Math.min(y, 480 - y) < 120 ? 1 : .55; br(x, y, a + (Math.random() - .5) * .9, (14 + Math.random() * 22) * corner, 4); }
  return c;
}
const MCH = '01ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ<>=+*:.789Z'.split('');
const SA = {on: false, x: 0, y: 0, next: 2500};
function sleigh(x, y, t) {
  f.save(); f.translate(x, y); f.textAlign = 'center'; f.textBaseline = 'middle';
  for (let i = 0; i < 14; i++) { f.fillStyle = `rgba(255,236,150,${.55 - i * .04})`; f.beginPath(); f.arc(-34 - i * 9, 8 + Math.sin(t / 150 + i) * 5, Math.max(.6, 2.6 - i * .15), 0, 6.2832); f.fill(); }
  f.strokeStyle = '#7a4a1e'; f.lineWidth = 1.5; f.beginPath(); f.moveTo(30, 6);
  [[60, 0], [104, 1], [148, 2]].forEach(a => f.lineTo(a[0], 2 + Math.sin(t / 120 + a[1] * 1.3) * 4)); f.stroke();
  f.fillStyle = '#c1272d'; f.beginPath(); f.moveTo(-34, -8); f.quadraticCurveTo(-30, 14, 0, 16); f.lineTo(34, 16); f.quadraticCurveTo(40, 4, 42, -10); f.lineTo(18, -2); f.lineTo(-10, -2); f.closePath(); f.fill();
  f.strokeStyle = '#f2c14e'; f.lineWidth = 2.5; f.beginPath(); f.moveTo(-36, 24); f.lineTo(44, 24); f.quadraticCurveTo(54, 24, 52, 12); f.moveTo(-18, 16); f.lineTo(-18, 24); f.moveTo(26, 16); f.lineTo(26, 24); f.stroke();
  f.font = '20px serif'; f.fillText('🎁', -22, -12); f.font = '30px serif'; f.fillText('🎅', 6, -14);
  [60, 104, 148].forEach((dx, i) => { f.save(); f.translate(dx, 2 + Math.sin(t / 120 + i * 1.3) * 4); f.scale(-1, 1); f.font = '32px serif'; f.fillText('🦌', 0, 0); f.restore(); });
  f.shadowColor = '#ff2a2a'; f.shadowBlur = 14; f.fillStyle = '#ff2a2a'; f.beginPath(); f.arc(166, 4 + Math.sin(t / 120 + 2.6) * 4, 3.4, 0, 6.2832); f.fill(); f.shadowBlur = 0;
  f.font = 'bold 14px sans-serif'; f.fillStyle = 'rgba(255,255,255,.95)'; f.fillText('Ho ho ho !', 20, -46);
  f.restore();
}
const auroraG = c => GCACHE['a' + c] || (GCACHE['a' + c] = (() => { const g = f.createLinearGradient(0, 0, 0, 190); g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(.35, `rgba(${c},.4)`); g.addColorStop(1, `rgba(${c},0)`); return g; })());
const wrapX = p => { if (p.x > 840) p.x = -40; else if (p.x < -40) p.x = 840; };
function snowfall(P, t, a) { f.fillStyle = pcol(a) || `rgba(255,255,255,${a})`; const ink = HT.ink && !PCOL; if (ink) { f.strokeStyle = 'rgba(28,40,62,.45)'; f.lineWidth = 1; } P.forEach(p => { p.y += p.v * .12 * SPD; p.x += (Math.sin(t / 900 + p.p) * .4 + WND * .5) * SPD; wrapX(p); if (p.y > 480) { p.y = -4; p.x = Math.random() * 800; } f.beginPath(); f.arc(p.x, p.y, (p.r + .6) * PSZ * (ink ? 1.5 : 1), 0, 6.2832); f.fill(); if (ink) f.stroke(); }); }
function starsFx(P, t) { P.forEach(p => { f.fillStyle = pcol(.3 + .45 * Math.sin(t / 700 + p.p)) || `rgba(255,255,255,${.3 + .45 * Math.sin(t / 700 + p.p)})`; f.beginPath(); f.arc(p.x, p.y * .55, p.r * .7 * PSZ, 0, 6.2832); f.fill(); }); }
function fall(P, t, sp, sw, draw) { P.forEach(p => { p.y += p.v * sp * SPD; p.x += (Math.sin(t / 700 + p.p) * sw + WND * .6) * SPD; wrapX(p); if (p.y > 500) { p.y = -20; p.x = Math.random() * 800; } draw(p); }); }

function drawLayer(L, t) {
  const k = L.k, P = L.P;
  if (k === 'stars') starsFx(P, t);
  else if (k === 'rain' || k === 'storm') { const sl = (k === 'storm' ? 5 : 2) + WND * 2.4, ink = HT.ink && !PCOL, ln = ink ? 34 : 14; f.strokeStyle = pcol(.42) || (ink ? 'rgba(28,40,62,.42)' : 'rgba(255,255,255,.32)'); f.lineWidth = PSZ * (ink ? 1.2 : 1); f.beginPath(); P.forEach(p => { f.moveTo(p.x, p.y); f.lineTo(p.x - sl * (ink ? 2.2 : 1), p.y + ln * PSZ); p.y += p.v * SPD; p.x -= sl * .6 * SPD; if (p.y > 480) { p.y = -14; p.x = Math.random() * 900 - 50; } }); f.stroke(); }
  else if (k === 'snow') snowfall(P, t, .9);
  else if (k === 'confetti') fall(P, t, .22, .9, p => { f.fillStyle = pcol(1) || `hsl(${p.k * 360},90%,62%)`; f.fillRect(p.x, p.y, 6 * PSZ, 3 * PSZ); });
  else if (k === 'hearts') { f.textAlign = 'center'; P.forEach(p => { p.y -= p.v * .08 * SPD; p.x += (Math.sin(t / 800 + p.p) * .5 + WND * .5) * SPD; wrapX(p); if (p.y < -20) { p.y = 500; p.x = Math.random() * 800; } f.font = (12 + p.r * 7) * PSZ + 'px sans-serif'; f.fillStyle = pcol(.8) || `rgba(255,${90 + p.k * 80 | 0},${120 + p.k * 60 | 0},.8)`; f.fillText('♥', p.x, p.y); }); }
  else if (k === 'leaves') fall(P, t, .16, 1.1, p => { f.fillStyle = PCOL || ['#e8761a', '#b5471a', '#f2a33a'][p.k * 3 | 0]; f.beginPath(); f.ellipse(p.x, p.y, 6 * PSZ, 3 * PSZ, t / 400 + p.p, 0, 6.2832); f.fill(); });
  else if (k === 'petals') fall(P, t, .14, .7, p => { f.fillStyle = pcol(.85) || 'rgba(214,40,57,.85)'; f.beginPath(); f.ellipse(p.x, p.y, 4 * PSZ, 2.6 * PSZ, p.p + t / 900, 0, 6.2832); f.fill(); });
  else if (k === 'fireworks') {
    if (Math.random() < .02 * SPD * (L.boost || 1)) L.B.push({x: 100 + Math.random() * 600, y: 60 + Math.random() * 180, t: 0, h: Math.random() * 360});
    L.B = L.B.filter(b => b.t < 70);
    L.B.forEach(b => { b.t++; const r = b.t * 1.6 * PSZ; f.fillStyle = PCOL ? hexA(PCOL, 1 - b.t / 70) : `hsla(${b.h},95%,65%,${1 - b.t / 70})`; for (let i = 0; i < 22; i++) { const a = i / 22 * 6.2832; f.beginPath(); f.arc(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r + b.t * b.t * .004, 2, 0, 6.2832); f.fill(); } });
  }
  else if (k === 'santa') {
    snowfall(P, t, .9);
    if (!SA.on && t > SA.next) { SA.on = true; SA.x = -260; SA.y = 70 + Math.random() * 90; }
    if (SA.on) { SA.x += 3.1 * SPD; sleigh(SA.x, SA.y + Math.sin(SA.x / 55) * 16, t); if (SA.x > 860) { SA.on = false; SA.next = t + 22000 + Math.random() * 18000; } }
  }
  else if (k === 'fog') P.forEach(p => { p.x += (p.v * .03 + WND * .2) * SPD; if (p.x > 1000) p.x = -200; if (p.x < -200) p.x = 1000; const r = (140 + p.r * 60) * PSZ, g = f.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); g.addColorStop(0, pcol(.22) || 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,0)'); f.fillStyle = g; f.fillRect(p.x - r, p.y - r, r * 2, r * 2); });
  else if (k === 'drizzle') { f.strokeStyle = pcol(.3) || (HT.ink ? 'rgba(28,40,62,.3)' : 'rgba(255,255,255,.24)'); f.lineWidth = PSZ; f.beginPath(); P.forEach(p => { f.moveTo(p.x, p.y); f.lineTo(p.x - 1 - WND, p.y + 7 * PSZ); p.y += p.v * .7 * SPD; p.x -= (.5 + WND * .6) * SPD; if (p.y > 480) { p.y = -8; p.x = Math.random() * 860 - 30; } }); f.stroke(); }
  else if (k === 'sleet') {
    f.strokeStyle = pcol(.55) || 'rgba(190,230,255,.55)'; f.lineWidth = 1.2 * PSZ; f.beginPath();
    P.forEach(p => { const d = p.k < .55; if (d) { f.moveTo(p.x, p.y); f.lineTo(p.x - 2 - WND, p.y + 13); } p.y += p.v * (d ? 1 : .5) * SPD; p.x += (d ? -1.2 - WND : Math.sin(t / 700 + p.p) * .3 + WND * .5) * SPD; wrapX(p); if (p.y > 480) { p.y = -14; p.x = Math.random() * 840; } });
    f.stroke(); f.fillStyle = 'rgba(235,248,255,.95)'; P.forEach(p => { if (p.k >= .55) { f.beginPath(); f.arc(p.x, p.y, (p.r + .4) * PSZ, 0, 6.2832); f.fill(); } });
  }
  else if (k === 'hail') { f.fillStyle = pcol(.95) || 'rgba(238,246,255,.95)'; f.strokeStyle = 'rgba(170,190,225,.8)'; f.lineWidth = 1; P.forEach(p => { p.y += (p.v * .9 + 4) * SPD; p.x -= (2.2 + WND) * SPD; wrapX(p); if (p.y > 480) { p.y = -8; p.x = Math.random() * 840; } f.beginPath(); f.arc(p.x, p.y, (p.r + 1.4) * PSZ, 0, 6.2832); f.fill(); f.stroke(); }); }
  else if (k === 'blizzard') { f.fillStyle = pcol(.88) || 'rgba(255,255,255,.88)'; P.forEach(p => { p.x -= (p.v * .55 + 2 - WND * 1.5) * SPD; p.y += (p.v * .12 + Math.sin(t / 300 + p.p) * .8) * SPD; if (p.x < -6) { p.x = 806; p.y = Math.random() * 480; } if (p.x > 806) { p.x = -6; p.y = Math.random() * 480; } if (p.y > 480) p.y = -4; f.beginPath(); f.arc(p.x, p.y, (p.r + .5) * PSZ, 0, 6.2832); f.fill(); }); }
  else if (k === 'wind') {
    const dir = WND < 0 ? -1 : 1; f.strokeStyle = pcol(.3) || 'rgba(255,255,255,.3)'; f.lineWidth = 1.4 * PSZ; f.beginPath();
    P.forEach(p => { p.x += (p.v * .55 + 5 + Math.abs(WND)) * SPD * dir; if (p.x > 1000) { p.x = -80; p.y = Math.random() * 480; } if (p.x < -200) { p.x = 900; p.y = Math.random() * 480; } if (p.k < .72) { f.moveTo(p.x, p.y); f.lineTo(p.x - dir * (30 + p.r * 22), p.y + Math.sin(p.x / 50 + p.p) * 4); } });
    f.stroke(); P.forEach(p => { if (p.k >= .72) { f.fillStyle = PCOL || ['#8fbf4d', '#d8923a', '#b6552a'][(p.k * 10 | 0) % 3]; f.beginPath(); f.ellipse(p.x, p.y + Math.sin(p.x / 45 + p.p) * 10, 6 * PSZ, 3 * PSZ, t / 150 + p.p, 0, 6.2832); f.fill(); } });
  }
  else if (k === 'heat') {
    const g = GCACHE.heat || (GCACHE.heat = (() => { const g = f.createRadialGradient(650, 90, 10, 650, 90, 340); g.addColorStop(0, 'rgba(255,250,200,.95)'); g.addColorStop(.12, 'rgba(255,224,130,.55)'); g.addColorStop(1, 'rgba(255,200,80,0)'); return g; })()); f.fillStyle = g; f.fillRect(0, 0, 800, 480);
    f.fillStyle = '#fff6be'; f.beginPath(); f.arc(650, 90, 34 + Math.sin(t / 600) * 2, 0, 6.2832); f.fill();
    f.strokeStyle = pcol(.14) || 'rgba(255,255,255,.14)'; f.lineWidth = 2;
    for (let j = 0; j < 5; j++) { f.beginPath(); for (let x = 0; x <= 800; x += 10) { const y = 400 + j * 14 + Math.sin(x / 38 + t / 420 * SPD + j) * 4; x ? f.lineTo(x, y) : f.moveTo(x, y); } f.stroke(); }
  }
  else if (k === 'rainbow') {
    f.save(); f.lineWidth = 11; f.globalAlpha = .42 + .08 * Math.sin(t / 900);
    ['#ff4d4d', '#ff9f40', '#ffe14d', '#5ed16a', '#4db8ff', '#5a5cf0', '#a45ae8'].forEach((c, i) => { f.strokeStyle = c; f.beginPath(); f.arc(400, 560, 360 - i * 11, Math.PI, 2 * Math.PI); f.stroke(); });
    f.restore(); f.strokeStyle = pcol(.25) || 'rgba(255,255,255,.25)'; f.lineWidth = 1; f.beginPath(); P.forEach(p => { f.moveTo(p.x, p.y); f.lineTo(p.x - 1, p.y + 7); p.y += p.v * .5 * SPD; if (p.y > 480) { p.y = -8; p.x = Math.random() * 820; } }); f.stroke();
  }
  else if (k === 'aurora') {
    starsFx(P, t);
    [['60,255,170', 0], ['90,150,255', 2.1], ['190,90,255', 4.2]].forEach((b, i) => { f.fillStyle = auroraG(b[0]); for (let x = 0; x < 800; x += 8) { const y = 70 + i * 28 + Math.sin(x / 110 + t / 1700 * SPD + b[1]) * 34 + Math.sin(x / 37 + t / 900 * SPD + b[1]) * 9; f.fillRect(x, y, 9, 190); } });
  }
  else if (k === 'meteors') {
    starsFx(P, t);
    if (Math.random() < .025 * SPD) L.B.push({x: 200 + Math.random() * 700, y: Math.random() * 180, vx: -9 - Math.random() * 5, vy: 4 + Math.random() * 3, l: 0});
    L.B = L.B.filter(b => b.l < 40);
    L.B.forEach(b => { b.l++; b.x += b.vx; b.y += b.vy; const g = f.createLinearGradient(b.x, b.y, b.x - b.vx * 5, b.y - b.vy * 5); g.addColorStop(0, `rgba(255,255,255,${1 - b.l / 40})`); g.addColorStop(1, 'rgba(255,255,255,0)'); f.strokeStyle = g; f.lineWidth = 2; f.beginPath(); f.moveTo(b.x, b.y); f.lineTo(b.x - b.vx * 5, b.y - b.vy * 5); f.stroke(); });
  }
  else if (k === 'sand') {
    P.forEach(p => { p.x -= (p.v * .5 + 4 - WND) * SPD; p.y += Math.sin(t / 500 + p.p) * .6; if (p.x < -4) { p.x = 804; p.y = Math.random() * 480; } if (p.x > 806) { p.x = -4; } const d = p.k * 50 | 0; f.fillStyle = pcol(.55) || `rgba(${230 - d},${190 - d},120,.55)`; f.fillRect(p.x, p.y, (p.r + 1) * PSZ, (p.r * .6 + .8) * PSZ); });
    const g = GCACHE.sand || (GCACHE.sand = (() => { const g = f.createLinearGradient(0, 0, 800, 0); g.addColorStop(0, 'rgba(210,160,90,.28)'); g.addColorStop(.5, 'rgba(210,160,90,.08)'); g.addColorStop(1, 'rgba(210,160,90,.28)'); return g; })()); f.fillStyle = g; f.fillRect(0, 0, 800, 480);
  }
  else if (k === 'lucky') {
    f.save(); f.translate(400, 150); f.rotate(t / 7000); f.fillStyle = 'rgba(255,255,255,.16)';
    for (let i = 0; i < 14; i++) { f.rotate(Math.PI / 7); f.beginPath(); f.moveTo(0, 0); f.lineTo(700, -34); f.lineTo(700, 34); f.closePath(); f.fill(); }
    f.restore(); f.save(); f.textAlign = 'center'; f.textBaseline = 'middle';
    P.forEach(p => {
      p.y += p.v * .2 * SPD; p.x += Math.sin(t / 700 + p.p) * .8; if (p.y > 500) { p.y = -20; p.x = Math.random() * 800; }
      if (p.k < .4) { f.fillStyle = '#ffc400'; f.strokeStyle = '#b57f00'; f.lineWidth = 1.5; f.beginPath(); f.ellipse(p.x, p.y, Math.abs(Math.cos(t / 260 + p.p)) * 8 + 1.5, 8, 0, 0, 6.2832); f.fill(); f.stroke(); }
      else if (p.k < .7) { f.font = (16 + p.r * 6) + 'px serif'; f.fillText('🍀', p.x, p.y); }
      else { const s = 2 + p.r * 1.5; f.fillStyle = `rgba(255,255,255,${.55 + .45 * Math.sin(t / 200 + p.p)})`; f.fillRect(p.x - s * 1.6, p.y - .6, s * 3.2, 1.2); f.fillRect(p.x - .6, p.y - s * 1.6, 1.2, s * 3.2); }
    });
    f.restore();
  }
  /* ----- nouveaux effets ----- */
  else if (k === 'halloween' || k === 'bats' || k === 'ghosts') {
    if (k === 'halloween') for (let i = 0; i < 5; i++) { const x = ((t * .012 * SPD + i * 210) % 1050) - 120, y = 446 + Math.sin(t / 2000 + i) * 12, g = f.createRadialGradient(x, y, 0, x, y, 170); g.addColorStop(0, 'rgba(170,120,230,.2)'); g.addColorStop(1, 'rgba(170,120,230,0)'); f.fillStyle = g; f.fillRect(x - 170, y - 170, 340, 340); }
    P.forEach(p => {
      const isBat = k === 'bats' || (k === 'halloween' && p.k < .42), isGhost = k === 'ghosts' || (k === 'halloween' && p.k > .9);
      if (isBat) {
        const dir = p.p > 3.14 ? 1 : -1; p.x += (1.1 + p.r * .8) * SPD * dir; p.y += Math.sin(t / 420 + p.p) * .9;
        if (p.x > 880 || p.x < -80) { p.x = dir > 0 ? -60 : 860; p.y = 30 + Math.random() * 280; }
        f.strokeStyle = 'rgba(255,150,60,.55)'; f.lineWidth = 1; bat(p.x, p.y, (9 + p.r * 5) * PSZ, Math.sin(t / 65 + p.p * 3), PCOL ? hexA(PCOL, .95) : 'rgba(14,6,20,.94)'); f.stroke();
      } else if (isGhost) {
        p.x += (.22 + p.r * .08) * SPD; if (p.x > 860) { p.x = -60; p.y = 60 + Math.random() * 300; }
        const al = Math.max(0, .45 * Math.sin(t / 2600 + p.p)); if (al > .01) ghost(p.x, p.y + Math.sin(t / 900 + p.p) * 10, (15 + p.r * 6) * PSZ, al, t, p.p);
      } else fall([p], t, .15, 1.1, q => { f.fillStyle = PCOL || ['#e8761a', '#8a3fb8', '#f2a33a'][q.k * 3 | 0]; f.beginPath(); f.ellipse(q.x, q.y, 6 * PSZ, 3 * PSZ, t / 400 + q.p, 0, 6.2832); f.fill(); });
    });
  }
  else if (k === 'notes') { f.textAlign = 'center'; P.forEach(p => { p.y -= p.v * .09 * SPD; p.x += (Math.sin(t / 600 + p.p) * .8 + WND * .5) * SPD; wrapX(p); if (p.y < -30) { p.y = 510; p.x = Math.random() * 800; } f.font = (16 + p.r * 8) * PSZ + 'px "DejaVu Sans",serif'; f.fillStyle = pcol(.85) || `hsla(${p.k * 360},85%,72%,.85)`; f.fillText('♪♫♬♩'[p.k * 4 | 0], p.x, p.y); }); }
  else if (k === 'crepes') fall(P, t, .15, .6, p => { const sy = Math.cos(t / 280 * SPD + p.p), s = (13 + p.r * 4) * PSZ; f.save(); f.translate(p.x, p.y); f.rotate(Math.sin(t / 900 + p.p) * .3); f.scale(1, Math.abs(sy) * .85 + .15); f.fillStyle = sy > 0 ? '#eab866' : '#d39345'; f.beginPath(); f.arc(0, 0, s, 0, 6.2832); f.fill(); f.strokeStyle = 'rgba(150,90,30,.55)'; f.lineWidth = 2; f.stroke(); f.fillStyle = 'rgba(150,85,25,.5)'; [[-.4, -.2], [.3, .3], [.1, -.5], [-.2, .45]].forEach(([a, b]) => { f.beginPath(); f.arc(a * s, b * s, s * .12, 0, 6.2832); f.fill(); }); f.restore(); });
  else if (k === 'clovers') fall(P, t, .14, 1, p => { const s = (6 + p.r * 3) * PSZ; f.save(); f.translate(p.x, p.y); f.rotate(t / 1200 + p.p); f.fillStyle = pcol(.92) || (p.k < .5 ? '#2fbf4a' : '#1f9a3a'); for (let i = 0; i < 3; i++) { f.rotate(2.094); f.beginPath(); f.arc(-s * .3, -s * .55, s * .42, 0, 6.2832); f.arc(s * .3, -s * .55, s * .42, 0, 6.2832); f.fill(); } f.strokeStyle = f.fillStyle; f.lineWidth = s * .18; f.beginPath(); f.moveTo(0, 0); f.quadraticCurveTo(s * .3, s * .6, s * .1, s * 1.2); f.stroke(); f.restore(); });
  else if (k === 'bubbles') { P.forEach(p => { p.y -= p.v * .1 * SPD; p.x += (Math.sin(t / 500 + p.p) * .6 + WND * .4) * SPD; wrapX(p); if (p.y < -20) { p.y = 500; p.x = Math.random() * 800; } const r = (3 + p.r * 4) * PSZ; f.strokeStyle = pcol(.6) || 'rgba(220,245,255,.55)'; f.lineWidth = 1.2; f.beginPath(); f.arc(p.x, p.y, r, 0, 6.2832); f.stroke(); f.fillStyle = 'rgba(255,255,255,.6)'; f.beginPath(); f.arc(p.x - r * .35, p.y - r * .35, r * .25, 0, 6.2832); f.fill(); }); }
  else if (k === 'fireflies') { const G = glow(); P.forEach(p => { p.x += (Math.sin(t / 1100 + p.p) * .6 + WND * .2) * SPD; p.y += Math.cos(t / 1300 + p.p * 2) * .4 * SPD; wrapX(p); if (p.y < 0) p.y = 480; if (p.y > 480) p.y = 0; f.globalAlpha = Math.max(0, .15 + .85 * Math.sin(t / 500 + p.p * 5)); const s = (14 + p.r * 6) * PSZ; f.drawImage(G, p.x - s / 2, p.y - s / 2, s, s); }); f.globalAlpha = 1; }
  else if (k === 'frost') { if (!FROST) FROST = buildFrost(); f.globalAlpha = .9 + .1 * Math.sin(t / 1500); f.drawImage(FROST, 0, 0); f.globalAlpha = 1; P.forEach(p => { const a = Math.max(0, Math.sin(t / 600 + p.p * 7)); if (a < .6) return; const x = p.k < .5 ? (p.x < 400 ? p.x * .3 : 800 - (800 - p.x) * .3) : p.x, y = p.k < .5 ? p.y : (p.y < 240 ? p.y * .3 : 480 - (480 - p.y) * .3), s = 3 * a * PSZ; f.fillStyle = pcol(a) || `rgba(255,255,255,${a})`; f.fillRect(x - s, y - .5, s * 2, 1); f.fillRect(x - .5, y - s, 1, s * 2); }); }
  else if (k === 'emoji') { f.textAlign = 'center'; f.textBaseline = 'middle'; fall(P, t, .16, .9, p => { f.save(); f.translate(p.x, p.y); f.rotate(Math.sin(t / 800 + p.p) * .6); f.font = (16 + p.r * 7) * PSZ + 'px serif'; f.fillText(EMO[p.t % EMO.length], 0, 0); f.restore(); }); }
  else if (k === 'eggs') fall(P, t, .14, .8, p => { const s = (7 + p.r * 2.5) * PSZ; f.save(); f.translate(p.x, p.y); f.rotate(Math.sin(t / 700 + p.p) * .5); f.fillStyle = PCOL || `hsl(${p.k * 360},75%,74%)`; f.beginPath(); f.ellipse(0, 0, s * .78, s, 0, 0, 6.2832); f.fill(); f.strokeStyle = 'rgba(255,255,255,.9)'; f.lineWidth = 1.6; f.beginPath(); for (let i = -3; i <= 3; i++) f.lineTo(i * s * .24, (i % 2 ? -1 : 1) * s * .14); f.stroke(); f.restore(); });
  else if (k === 'matrix') { f.font = '15px "Share Tech Mono","DejaVu Sans Mono",monospace'; f.textAlign = 'center'; P.forEach(p => { p.y += p.v * .22 * SPD; if (p.y - 10 * 17 > 480) { p.y = -Math.random() * 240; p.t = Math.random() * 1000 | 0; } for (let j = 0; j < 10; j++) { const y = p.y - j * 17; if (y < -17 || y > 497) continue; f.fillStyle = j ? (pcol((1 - j / 10) * .7) || `rgba(57,255,106,${(1 - j / 10) * .7})`) : '#d8ffe0'; f.fillText(MCH[(p.t + j * 7 + (j ? 0 : (t / 90 | 0))) % MCH.length], p.x, y); } }); }
  else if (k === 'sunrays') { const [x, y] = astro(); f.save(); f.translate(x, y); f.rotate(t / 6000 * SPD); f.fillStyle = pcol(.08) || 'rgba(255,240,190,.08)'; for (let i = 0; i < 16; i++) { f.rotate(Math.PI / 8); f.beginPath(); f.moveTo(0, 0); f.lineTo(900, -50); f.lineTo(900, 50); f.closePath(); f.fill(); } f.restore(); }
  else if (k === 'sparkles') { f.textAlign = 'center'; P.forEach(p => { p.y -= p.v * .05 * SPD; p.x += Math.sin(t / 900 + p.p) * .4; if (p.y < -20) { p.y = 500; p.x = Math.random() * 800; } const a = .35 + .4 * Math.sin(t / 500 + p.p * 3); if (p.k < .5) { f.font = (10 + p.r * 6) + 'px sans-serif'; f.fillStyle = `rgba(255,${150 + p.k * 160 | 0},210,${a})`; f.fillText('♥', p.x, p.y); } else { const s = 3 + p.r * 2; f.fillStyle = `rgba(255,255,255,${a + .2})`; f.beginPath(); f.moveTo(p.x, p.y - s * 1.6); f.quadraticCurveTo(p.x, p.y, p.x + s * 1.6, p.y); f.quadraticCurveTo(p.x, p.y, p.x, p.y + s * 1.6); f.quadraticCurveTo(p.x, p.y, p.x - s * 1.6, p.y); f.quadraticCurveTo(p.x, p.y, p.x, p.y - s * 1.6); f.fill(); } }); }
  else if (k === 'shapes') { f.lineWidth = 1.6; P.forEach((p, i) => { p.y -= p.v * .02 * SPD; p.x += Math.sin(t / 3000 + p.p) * .2; if (p.y < -60) { p.y = 540; p.x = Math.random() * 800; } const r = (14 + p.r * 10) * PSZ, a = t / 4000 * (p.k < .5 ? 1 : -1) + p.p, n = [3, 4, 0, 3][i % 4]; f.strokeStyle = pcol(.55) || ['rgba(255,113,206,.55)', 'rgba(1,205,254,.55)', 'rgba(185,103,255,.55)', 'rgba(5,255,161,.5)'][i % 4]; f.beginPath(); if (!n) f.arc(p.x, p.y, r * .7, 0, 6.2832); else for (let j = 0; j <= n; j++) { const b = a + j / n * 6.2832; j ? f.lineTo(p.x + Math.cos(b) * r, p.y + Math.sin(b) * r) : f.moveTo(p.x + Math.cos(b) * r, p.y + Math.sin(b) * r); } f.stroke(); }); }
  else if (k === 'sakura') { const mo = clock().getMonth(), aut = mo >= 8 && mo <= 10, C = aut ? ['#c8402a', '#e0782e', '#a8321e'] : ['#f6c1cc', '#f9d7de', '#eaa3b3']; fall(P, t, .07, .9, p => { f.save(); f.translate(p.x, p.y); f.rotate(t / 700 + p.p); f.fillStyle = PCOL || C[p.k * 3 | 0]; f.beginPath(); if (aut) { const r = 7 * PSZ; f.moveTo(0, -r); f.quadraticCurveTo(r * .8, -r * .2, 0, r); f.quadraticCurveTo(-r * .8, -r * .2, 0, -r); f.fill(); f.strokeStyle = 'rgba(80,20,10,.5)'; f.lineWidth = 1; f.beginPath(); f.moveTo(0, -r * .8); f.lineTo(0, r * 1.25); f.stroke(); f.restore(); return; } else { f.ellipse(0, 0, 5 * PSZ, 3 * PSZ, 0, 0, 6.2832); } f.fill(); f.restore(); }); }
  else if (k === 'hbub') P.forEach(p => { p.y -= (p.v * .025 + .2) * SPD; p.x += Math.sin(t / 2400 + p.p) * .35; const r = (12 + p.r * 26) * PSZ; if (p.y < -r - 10) { p.y = 480 + r + Math.random() * 60; p.x = Math.random() * 800; } const key = 'hb' + (r | 0); const g = f.createRadialGradient(p.x - r * .35, p.y - r * .35, r * .1, p.x, p.y, r); g.addColorStop(0, 'rgba(140,200,255,.32)'); g.addColorStop(.7, 'rgba(40,110,220,.12)'); g.addColorStop(1, 'rgba(60,150,255,.38)'); f.fillStyle = g; f.beginPath(); f.arc(p.x, p.y, r, 0, 6.2832); f.fill(); f.strokeStyle = 'rgba(150,210,255,.35)'; f.lineWidth = 1.2; f.stroke(); f.fillStyle = 'rgba(255,255,255,.35)'; f.beginPath(); f.ellipse(p.x - r * .4, p.y - r * .45, r * .22, r * .12, -.6, 0, 6.2832); f.fill(); });
  else if (k === 'bh') drawBH(P, t);
  else if (k === 'inf') drawInf(P, t);
  else if (k === 'nova') drawNova(P, t);
  else if (k === 'ink') drawInk(P, t);
  else if (k === 'tes') drawTes(P, t);
  else if (k === 'gen') drawGen(P, t);
  else if (k === 'crea') drawCrea(P, t);
  else if (k === 'train') drawTrain(P, t);
  else if (k === 'pres') drawPres(P, t);
  else if (k === 'x0s') drawX0S(P, t);
  else if (k === 'aby') drawAby(P, t);
  else if (k === 'embers') { f.globalCompositeOperation = 'lighter'; P.forEach(p => { p.y -= (p.v * .03 + .25) * SPD; p.x += Math.sin(t / 600 + p.p) * .5; if (p.y < -10) { p.y = 490; p.x = Math.random() * 800; } const a = .35 + .45 * Math.abs(Math.sin(t / 300 + p.p * 5)), r = (p.r + .4) * PSZ; f.fillStyle = `rgba(255,${(120 + p.k * 90) | 0},20,${a})`; f.beginPath(); f.arc(p.x, p.y, r, 0, 6.2832); f.fill(); if (p.k > .85) { f.fillStyle = `rgba(255,220,150,${a * .8})`; f.fillRect(p.x - r * 3, p.y - .4, r * 6, .8); f.fillRect(p.x - .4, p.y - r * 3, .8, r * 6); } }); f.globalCompositeOperation = 'source-over'; }
  else if (k === 'eyes') { P.forEach(p => { const ph = ((t / 1000 + p.t) % 11) / 11; if (ph < p.l) { p.x = 40 + Math.random() * 720; p.y = 70 + Math.random() * 330; } p.l = ph; if (ph > .45) return; const a = Math.sin(ph / .45 * Math.PI), bl = Math.abs(Math.sin(t / 900 + p.p)) < .06 ? .1 : 1, s = 3 + p.r; f.fillStyle = p.k < .5 ? `rgba(255,220,60,${a})` : `rgba(140,255,80,${a})`; f.shadowColor = f.fillStyle; f.shadowBlur = 10; [-1, 1].forEach(d => { f.beginPath(); f.ellipse(p.x + d * s * 2.2, p.y, s, s * .7 * bl, d * .25, 0, 6.2832); f.fill(); }); f.shadowBlur = 0; }); }
}
function drawBolt(t) {
  const a = 1 - (t - BOLT.t) / 260; if (a <= 0) return;
  f.save(); f.strokeStyle = `rgba(240,245,255,${a})`; f.shadowColor = '#cfe0ff'; f.shadowBlur = 16; f.lineWidth = 2.6; f.beginPath();
  BOLT.pts.forEach((q, i) => i ? f.lineTo(q[0], q[1]) : f.moveTo(q[0], q[1])); f.stroke();
  if (BOLT.br.length) { f.lineWidth = 1.3; f.beginPath(); BOLT.br.forEach((q, i) => i ? f.lineTo(q[0], q[1]) : f.moveTo(q[0], q[1])); f.stroke(); }
  f.restore();
}
let fxN = 0;
function fx(t) {
  if (view === 2 || document.hidden || SLEEPING && (cfg.night || {}).mode !== 'dim' || (cfg.lite && (fxN++ & 1))) { requestAnimationFrame(fx); return; }
  f.clearRect(0, 0, 800, 480);
  const dark = lum(TH.c[1]) < .4;
  LAY.forEach(L => { if (BACK[L.k]) drawLayer(L, t); });
  if (TH.sun && !HT.noAstro) sunDraw(t);
  if (TH.moon && !HT.noAstro) { const [x, y] = TH.sun ? POS.c : astro(); moon(x, y, clamp(+TH.mr || 30, 10, 90), TH.mc); }
  const cc = /^#[0-9a-f]{6}$/i.test(TH.cc || '') ? TH.cc : null, cs = clamp(isNaN(+TH.cs) ? 1 : +TH.cs, 0, 6);
  CLD.forEach(c => { c.x += c.v * cs * (WND < 0 ? -1 : 1); if (c.x > 920) c.x = -140; if (c.x < -160) c.x = 900; cloud(c, cc ? hexA(cc, .4 * c.a) : dark ? `rgba(165,180,225,${.16 * c.a})` : `rgba(255,255,255,${.32 * c.a})`); });
  LAY.forEach(L => { if (!BACK[L.k]) drawLayer(L, t); });
  if (BOLT) drawBolt(t);
  requestAnimationFrame(fx);
}
let bt;
function flash() {
  $('fl').animate([{opacity: 0}, {opacity: .65}, {opacity: .05}, {opacity: .45}, {opacity: 0}], {duration: 520});
  const x = 120 + Math.random() * 560, pts = [[x, -10]], br = []; let y = -10, xx = x;
  while (y < 260 + Math.random() * 120) { y += 16 + Math.random() * 26; xx += (Math.random() - .5) * 48; pts.push([xx, y]); if (!br.length && y > 120 && Math.random() < .4) { let bx = xx, by = y; br.push([bx, by]); for (let i = 0; i < 4; i++) { bx += 10 + Math.random() * 18; by += 14 + Math.random() * 16; br.push([bx, by]); } } }
  BOLT = {t: performance.now(), pts, br};
  if (!PV && typeof AMB !== 'undefined') AMB.thunder(Math.random());
}
function schedBolt() {
  clearTimeout(bt);
  const m = TH.bolt || 'auto', auto = [TH.fx, TH.fx2].some(x => x === 'storm' || x === 'hail');
  const R = {rare: [7000, 16000], normal: [2500, 7000], often: [900, 3000]}[m === 'auto' ? (auto ? 'normal' : '') : m];
  if (!R) return;
  bt = setTimeout(() => { if (!document.hidden && view !== 2) flash(); schedBolt(); }, R[0] + Math.random() * (R[1] - R[0]));
}

/* ----- ✦ ----- */
let BHS = null, BHC = {}, BHX = {jet: 0, nextJet: 0, tde: null, nextTde: 0, shock: 0, flash: 0, inf: null};
function bhPos() { const l = stage.dataset.lay; return l === 'center' ? [640, 150] : l === 'left-row' ? [600, 210] : l === 'right-row' ? [200, 210] : [392, 180]; }
function bhHeat() { const T = CTX ? (cfg.unit === 'F' ? (CTX.T - 32) * 5 / 9 : CTX.T) : 15; return clamp((T + 5) / 40, 0, 1); }   // 0 = froid (rouge) → 1 = chaud (blanc-bleu)
function bhCache(R, h) {
  const key = R + ':' + h.toFixed(2); if (BHC.key === key) return BHC; BHC = {key};
  const hot = h, c1 = `rgba(255,${(235 + 20 * hot) | 0},${(200 + 55 * hot) | 0},`, c2 = `rgba(255,${(150 + 60 * hot) | 0},${(60 + 80 * hot) | 0},`, c3 = `rgba(${(200 - 40 * hot) | 0},${(60 + 40 * hot) | 0},${(70 + 120 * hot) | 0},`;
  const g = f.createRadialGradient(0, 0, R * 1.35, 0, 0, R * 4.4);
  g.addColorStop(0, c1 + '0)'); g.addColorStop(.04, c1 + '.95)'); g.addColorStop(.22, c2 + '.75)'); g.addColorStop(.55, c3 + '.35)'); g.addColorStop(1, c3 + '0)'); BHC.disk = g;
  const l = f.createRadialGradient(0, 0, R * 1.02, 0, 0, R * 1.75); l.addColorStop(0, c1 + '0)'); l.addColorStop(.18, c1 + '.9)'); l.addColorStop(.5, c2 + '.45)'); l.addColorStop(1, c2 + '0)'); BHC.lens = l;
  const pr = document.createElement('canvas'); pr.width = pr.height = R * 4; const q = pr.getContext('2d'); q.translate(R * 2, R * 2); q.shadowColor = `rgb(255,${(190 + 50 * hot) | 0},${(120 + 100 * hot) | 0})`; q.shadowBlur = 22; q.strokeStyle = 'rgba(255,245,225,.95)'; q.lineWidth = 2.4; q.beginPath(); q.arc(0, 0, R + 2.6, 0, 6.2832); q.stroke(); q.stroke(); BHC.ring = pr;
  const gl = f.createRadialGradient(0, 0, R, 0, 0, R * 6); gl.addColorStop(0, `rgba(255,${(160 + 50 * hot) | 0},90,.26)`); gl.addColorStop(.35, 'rgba(150,60,210,.1)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); BHC.glow = gl;
  return BHC;
}
function drawBH(P, t) {
  /* qualité automatique : si l'ordinateur est lent, on dessine moins de choses */
  if (BHX.lt) { const dt = t - BHX.lt; BHX.avg = BHX.avg ? BHX.avg * .97 + dt * .03 : dt; if (BHX.avg > 42 && !BHX.low) BHX.low = true; } BHX.lt = t;
  if (BHX.low && P.length > 110) P.length = 110; if (BHX.low && BHS && BHS.length > 100) BHS.length = 100;
  const [cx, cy] = bhPos(), R = 34, tilt = .24, h = bhHeat(), C = bhCache(R, h), storm = CTX && ['storm', 'hail'].includes(CTX.k);
  if (!BHS) BHS = Array.from({length: cfg.lite ? 90 : 240}, () => ({x: Math.random() * 800, y: Math.random() * 480, r: Math.random() * 1.3 + .3, p: Math.random() * 6.28, c: Math.random()}));
  /* étoiles déformées par la gravité (lentille) */
  BHS.forEach(s => { const dx = s.x - cx, dy = s.y - cy, d2 = dx * dx + dy * dy, d = Math.sqrt(d2) || 1; if (d < R * 1.2) return; const k = 1 + 1100 / d2, lx = cx + dx * k, ly = cy + dy * k, a = (.22 + .55 * Math.abs(Math.sin(t / 1100 + s.p))) * Math.min(1, (d - R) / 60); f.fillStyle = s.c < .15 ? `rgba(255,210,170,${a})` : s.c < .3 ? `rgba(170,200,255,${a})` : `rgba(235,240,255,${a})`; const st = 1 + Math.min(3, 2600 / d2 * 6); if (st < 1.35) { f.fillRect(lx, ly, s.r, s.r); return; } f.save(); f.translate(lx, ly); f.rotate(Math.atan2(dy, dx) + 1.5708); f.fillRect(-s.r / 2, -s.r * st / 2, s.r, s.r * st); f.restore(); });
  f.save(); f.translate(cx, cy); f.fillStyle = C.glow; f.fillRect(-R * 6, -R * 6, R * 12, R * 12); f.restore();
  /* jets relativistes (rares) */
  if (!BHX.nextJet) BHX.nextJet = t + 15000 + Math.random() * 20000;
  if (t > BHX.nextJet) { BHX.jet = t; BHX.nextJet = t + 35000 + Math.random() * 40000; }
  const je = (t - BHX.jet) / 4200;
  if (BHX.jet && je < 1) { const a = Math.sin(je * Math.PI) * (.75 + .25 * Math.sin(t / 40)); f.save(); f.globalCompositeOperation = 'lighter'; [-1, 1].forEach(s => { const g = f.createLinearGradient(cx, cy, cx, cy + s * 260); g.addColorStop(0, `rgba(200,225,255,${.8 * a})`); g.addColorStop(.4, `rgba(130,170,255,${.35 * a})`); g.addColorStop(1, 'rgba(90,120,255,0)'); f.fillStyle = g; f.beginPath(); f.moveTo(cx - 3, cy); f.lineTo(cx - 10 - 16 * je, cy + s * 260); f.lineTo(cx + 10 + 16 * je, cy + s * 260); f.lineTo(cx + 3, cy); f.fill(); }); f.restore(); }
  /* disque — moitié arrière */
  const orbit = [], back = [], front = [];
  P.forEach(p => { if (!p.o) { p.o = R * (1.45 + Math.pow(Math.random(), 1.5) * 2.8); p.a = Math.random() * 6.283; p.w = .7 + Math.random() * .3; p.in = Math.random() < .08; } const om = .0011 * SPD * Math.pow(R * 1.5 / p.o, 1.5) * p.w * 16; p.a += om; if (p.in) { p.o -= .05 + 4 / p.o; if (p.o < R * 1.05) { p.o = R * (3.4 + Math.random()); p.a = Math.random() * 6.283; } } const x = cx + Math.cos(p.a) * p.o, y = cy + Math.sin(p.a) * p.o * tilt; (Math.sin(p.a) < 0 ? back : front).push([x, y, p, om]); });
  const half = (top) => { f.save(); f.beginPath(); f.rect(cx - R * 5, top ? cy - R * 3 : cy, R * 10, R * 3); f.clip(); f.translate(cx, cy); f.scale(1, tilt); f.fillStyle = C.disk; f.beginPath(); f.arc(0, 0, R * 4.4, 0, 6.2832); f.arc(0, 0, R * 1.35, 0, 6.2832, true); f.fill(); f.restore(); };
  const dot = ([x, y, p, om]) => { const heat = clamp(1 - (p.o - R * 1.45) / (R * 2.8), 0, 1), dop = .5 + .5 * -Math.cos(p.a), a = (.25 + .7 * heat) * (.35 + .65 * dop) * (storm ? .7 + .3 * Math.random() : 1), L = 1.5 + om * p.o * 2.2; f.fillStyle = `rgba(255,${(170 + 85 * heat) | 0},${(90 + 140 * heat * dop + 60 * h) | 0},${a.toFixed(2)})`; const sl = Math.cos(p.a) * tilt * L * .5; f.fillRect(x - L / 2, y - .6 + (sl > 0 ? -sl / 2 : 0), L, 1.2 + heat * .6 + Math.abs(sl)); };
  half(true); f.globalCompositeOperation = 'lighter'; back.forEach(dot); f.globalCompositeOperation = 'source-over';
  /* image « lentillée » de l'arrière du disque : arc au-dessus et (faible) en dessous */
  f.save(); f.translate(cx, cy); f.fillStyle = C.lens; f.globalAlpha = .9; f.beginPath(); f.arc(0, 0, R * 1.75, Math.PI, 0); f.arc(0, 0, R * 1.02, 0, Math.PI, true); f.fill(); f.globalAlpha = .28; f.beginPath(); f.arc(0, 0, R * 1.5, 0, Math.PI); f.arc(0, 0, R * 1.02, Math.PI, 0, true); f.fill(); f.restore();
  /* anneau de photons + ombre */
  const fl = BHX.flash ? Math.max(0, 1 - (t - BHX.flash) / 900) : 0;
  f.globalAlpha = .85 + .15 * Math.sin(t / 500) + fl; f.drawImage(C.ring, cx - R * 2, cy - R * 2); f.globalAlpha = 1;
  if (fl) { f.save(); f.globalCompositeOperation = 'lighter'; f.fillStyle = `rgba(255,240,220,${fl * .5})`; f.beginPath(); f.arc(cx, cy, R * (2 + fl * 2), 0, 6.2832); f.fill(); f.restore(); }
  f.fillStyle = '#000'; f.beginPath(); f.arc(cx, cy, R, 0, 6.2832); f.fill();
  /* disque — moitié avant (passe devant l'ombre), effet Doppler (côté gauche plus brillant) */
  half(false);
  f.save(); f.beginPath(); f.rect(cx - R * 5, cy, R * 10, R * 3); f.clip(); f.translate(cx, cy); f.scale(1, tilt); const dg = f.createLinearGradient(-R * 4, 0, R * 4, 0); dg.addColorStop(0, 'rgba(255,255,255,.22)'); dg.addColorStop(.5, 'rgba(255,255,255,0)'); dg.addColorStop(1, 'rgba(0,0,0,.25)'); f.globalCompositeOperation = 'overlay'; f.fillStyle = dg; f.beginPath(); f.arc(0, 0, R * 4.4, 0, 6.2832); f.arc(0, 0, R * 1.35, 0, 6.2832, true); f.fill(); f.restore();
  f.globalCompositeOperation = 'lighter'; front.forEach(dot);
  /* étoile déchiquetée par les marées (rare) */
  if (!BHX.nextTde) BHX.nextTde = t + 30000 + Math.random() * 30000;
  if (!BHX.tde && t > BHX.nextTde) BHX.tde = {t, tr: []};
  if (BHX.tde) { const e = (t - BHX.tde.t) / 9000; if (e >= 1) { BHX.tde = null; BHX.flash = t; BHX.nextTde = t + 60000 + Math.random() * 60000; } else { const r = R * (7 - 5.9 * Math.pow(e, 1.4)), a = -.6 + e * 9.5, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * (.35 + .4 * (1 - e)); BHX.tde.tr.push([x, y]); if (BHX.tde.tr.length > 70) BHX.tde.tr.shift(); BHX.tde.tr.forEach(([qx, qy], i) => { const k = i / BHX.tde.tr.length; f.fillStyle = `rgba(255,${(200 + 55 * k) | 0},${(160 + 90 * k) | 0},${(k * .7).toFixed(2)})`; f.fillRect(qx - 1, qy - 1, 1.5 + k * 1.5, 1.5 + k * 1.5); }); f.fillStyle = '#fff'; f.beginPath(); f.arc(x, y, 2.4, 0, 6.2832); f.fill(); } }
  /* onde de choc (quand on touche le trou) */
  if (BHX.shock) { const e = (t - BHX.shock) / 1400; if (e > 1) BHX.shock = 0; else { f.strokeStyle = `rgba(220,200,255,${(1 - e) * .7})`; f.lineWidth = 3 * (1 - e) + .5; f.beginPath(); f.arc(cx, cy, R + e * 340, 0, 6.2832); f.stroke(); f.strokeStyle = `rgba(255,210,150,${(1 - e) * .5})`; f.beginPath(); f.arc(cx, cy, R + e * 240, 0, 6.2832); f.stroke(); } }
  f.globalCompositeOperation = 'source-over';
}
