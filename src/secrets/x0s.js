
/* ===================================================================
   ✨ SINGULARITÉ SHINY — la version chromatique (1 sur 4096 quand on tire la Singularité)
   Le trou noir s'est fendu en deux et a explosé : il en reste un PULSAR.
   =================================================================== */
const SHC = ['120,240,255', '255,120,220', '200,160,255', '255,240,170'];   // cyan, rose, lilas, or pâle
/* étoile scintillante à 4 branches (l'effet « shiny ») */
function shinyStar(g, x, y, r, a, rot = 0, col = '255,255,255') {
  if (a <= 0 || r <= 0) return; g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = Math.min(1, a); g.globalCompositeOperation = 'lighter';
  const gl = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.6); gl.addColorStop(0, `rgba(${col},.7)`); gl.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gl; g.fillRect(-r * 1.6, -r * 1.6, r * 3.2, r * 3.2);
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(r * .1, -r * .1, r, 0); g.quadraticCurveTo(r * .1, r * .1, 0, r); g.quadraticCurveTo(-r * .1, r * .1, -r, 0); g.quadraticCurveTo(-r * .1, -r * .1, 0, -r); g.fill();
  g.restore();
}
/* le pulsar : étoile à neutrons, lignes de champ, deux faisceaux qui balaient */
function drawPulsar(g, x, y, t, o = {}) {
  const sc = o.sc || 1, spin = o.spin == null ? t * 2.2 : o.spin, al = o.a == null ? 1 : o.a, tilt = .35, ba = o.beam == null ? 1 : o.beam;
  g.save(); g.globalAlpha = al; g.globalCompositeOperation = 'lighter';
  /* nébuleuse du vent de pulsar */
  const nb = g.createRadialGradient(x, y, 0, x, y, 150 * sc); nb.addColorStop(0, 'rgba(160,220,255,.22)'); nb.addColorStop(.4, 'rgba(200,120,255,.10)'); nb.addColorStop(1, 'rgba(255,120,220,0)'); g.fillStyle = nb; g.fillRect(x - 150 * sc, y - 150 * sc, 300 * sc, 300 * sc);
  /* lignes de champ magnétique (dipôle) */
  g.lineWidth = 1; for (let k = 1; k <= 4; k++) { const L = 22 * k * sc; g.strokeStyle = `rgba(${SHC[k % 4]},${(.22 - k * .03).toFixed(2)})`; [-1, 1].forEach(s => { g.beginPath(); for (let i = 0; i <= 30; i++) { const th = i / 30 * Math.PI, r = L * Math.pow(Math.sin(th), 2), px = s * r * Math.sin(th), py = r * Math.cos(th); const ca = Math.cos(spin * .15), sa = Math.sin(spin * .15); i ? g.lineTo(x + px * ca - py * sa * .3, y + px * sa * .3 + py * ca) : g.moveTo(x + px * ca - py * sa * .3, y + px * sa * .3 + py * ca); } g.stroke(); }); }
  /* faisceaux (projetés : cône qui tourne autour d'un axe incliné) */
  [0, Math.PI].forEach((o2, bi) => { const a = spin + o2, dx = Math.cos(a), dy = Math.sin(a) * tilt - .55 * (bi ? -1 : 1) * .5, len = 340 * sc, ang = Math.atan2(dy, dx), front = Math.sin(a) > 0, w = 16 * sc * (front ? 1.3 : .8);
    g.save(); g.translate(x, y); g.rotate(ang); const bg = g.createLinearGradient(0, 0, len, 0); bg.addColorStop(0, `rgba(255,255,255,${((front ? .9 : .5) * ba).toFixed(2)})`); bg.addColorStop(.2, `rgba(${SHC[bi]},${((front ? .55 : .3) * ba).toFixed(2)})`); bg.addColorStop(1, `rgba(${SHC[bi + 2]},0)`); g.fillStyle = bg; g.beginPath(); g.moveTo(0, -2); g.lineTo(len, -w); g.lineTo(len, w); g.lineTo(0, 2); g.fill(); g.restore(); });
  /* l'étoile à neutrons */
  const pr = 7 * sc * (1 + .08 * Math.sin(spin * 2)), pg = g.createRadialGradient(x, y, 0, x, y, pr * 6); pg.addColorStop(0, '#fff'); pg.addColorStop(.18, 'rgba(210,245,255,.95)'); pg.addColorStop(.45, 'rgba(160,140,255,.35)'); pg.addColorStop(1, 'rgba(255,120,220,0)'); g.fillStyle = pg; g.fillRect(x - pr * 6, y - pr * 6, pr * 12, pr * 12);
  g.restore();
}
/* fragments du trou noir brisé : deux demi-anneaux irisés qui dérivent */
function drawShards(g, x, y, t, sep, al) {
  g.save(); g.globalAlpha = al; g.globalCompositeOperation = 'lighter';
  [-1, 1].forEach((s, i) => { const ox = x + s * sep, rot = s * Math.sin(t * .3) * .12; g.save(); g.translate(ox, y); g.rotate(rot); g.scale(1, .3); for (let k = 0; k < 7; k++) { const r = 70 + k * 12; g.strokeStyle = `rgba(${SHC[(k + i) % 4]},${(.16 - k * .015).toFixed(3)})`; g.lineWidth = 7; g.beginPath(); g.arc(0, 0, r, s < 0 ? Math.PI * .62 : -Math.PI * .38, s < 0 ? Math.PI * 1.38 : Math.PI * .38); g.stroke(); } g.restore(); });
  g.restore();
}
/* ----- fond du style ----- */
let X0SX = {stars: null, burst: 0, next: 0, pulses: []};
function drawX0S(P, t) {
  const [cx, cy] = bhPos(), T = t / 1000;
  if (!X0SX.stars) X0SX.stars = Array.from({length: cfg.lite ? 90 : 200}, () => ({x: Math.random() * 800, y: Math.random() * 480, r: Math.random() * 1.3 + .3, p: Math.random() * 6.28, c: Math.random() * 4 | 0}));
  X0SX.stars.forEach(s => { f.fillStyle = s.c === 0 ? `rgba(${SHC[s.p * 10 % 4 | 0]},${(.3 + .4 * Math.abs(Math.sin(T * .9 + s.p))).toFixed(2)})` : `rgba(235,240,255,${(.25 + .4 * Math.abs(Math.sin(T * .7 + s.p))).toFixed(2)})`; f.fillRect(s.x, s.y, s.r, s.r); });
  drawShards(f, cx, cy, T, 120 + Math.sin(T * .2) * 8, .9);
  const spin = T * 2.4;
  /* une onde à chaque tour */
  if (Math.floor(spin / Math.PI) !== X0SX.lp) { X0SX.lp = Math.floor(spin / Math.PI); X0SX.pulses.push(T); if (X0SX.pulses.length > 6) X0SX.pulses.shift(); }
  f.save(); f.globalCompositeOperation = 'lighter'; X0SX.pulses.forEach((p, i) => { const e = (T - p) / 3; if (e < 0 || e > 1) return; f.strokeStyle = `rgba(${SHC[i % 4]},${((1 - e) * .25).toFixed(3)})`; f.lineWidth = 2; f.beginPath(); f.ellipse(cx, cy, 10 + e * 260, (10 + e * 260) * .55, 0, 0, 6.2832); f.stroke(); }); f.restore();
  drawPulsar(f, cx, cy, T, {spin, beam: .5, sc: 1 + (X0SX.burst ? Math.max(0, 1 - (t - X0SX.burst) / 1200) * .3 : 0)});
  /* scintillement « shiny » de temps en temps */
  if (!X0SX.next) X0SX.next = t + 6000;
  if (t > X0SX.next) { X0SX.burst = t; X0SX.next = t + 9000 + Math.random() * 9000; if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on && Math.random() < .5) AMB.one('shiny'); }
  if (X0SX.burst) { const e = (t - X0SX.burst) / 1300; if (e < 1) for (let k = 0; k < 8; k++) { const a = k / 8 * 6.2832 + e, d = 30 + e * 70, s = 7 * Math.sin(Math.min(1, e * 1.4) * Math.PI); shinyStar(f, cx + Math.cos(a) * d, cy + Math.sin(a) * d * .8, s, 1 - e * .3, e * 2, SHC[k % 4]); } }
}

/* ===================================================================
   La cinématique (≈ 31 s) : shiny → trou noir → il se FEND EN DEUX → PULSAR
   =================================================================== */
let x0sOn = false;
function x0sCinematic(apply) {
  if (x0sOn) return false; x0sOn = true;
  const el = document.createElement('div'); el.id = 'x0sc';
  el.innerHTML = `<canvas width="800" height="480"></canvas><div class="xs-shiny">✨ SHINY ✨</div><div class="xs-cap"></div><div class="xs-white"></div>
    <div class="xs-title">${[...'SINGULARITÉ'].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</div><div class="xs-tag">✨ SHINY ✨</div>
    <div class="xs-sub"><em>Le trou noir s'est fendu en deux… et il est né une étoile.</em><b>1 CHANCE SUR 500 × 1 CHANCE SUR 4 096 = 1 SUR 2 048 000</b></div><div class="xs-skip">touche 2 fois pour passer</div>`;
  stage.appendChild(el); if (typeof cinFX === 'function') cinFX(el);
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), tm = [], at = (s, fn) => tm.push(setTimeout(fn, s * 1000)), T0 = performance.now(), lite = !!cfg.lite;
  const music = !PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on ? (AMB.unlock(), AMB.x0s()) : null;
  const $$ = s => el.querySelector(s), cap = (s, d = 2.6) => { const c = $$('.xs-cap'); c.classList.remove('on'); setTimeout(() => { c.innerHTML = s; c.classList.add('on'); }, 200); if (d) tm.push(setTimeout(() => c.classList.remove('on'), (d + .2) * 1000)); };
  const X = 400, Y = 205;
  /* 1. ✨ shiny ! */
  at(.2, () => el.classList.add('sh'));
  at(2.6, () => { el.classList.remove('sh'); stage.classList.add('xs-suck'); });
  at(4, () => { stage.classList.remove('xs-suck'); stage.classList.add('xs-hide'); });
  at(5.4, () => cap('Une singularité… chromatique.', 2.8));
  at(9, () => cap('Elle est instable.', 2.2));
  /* 2. elle se fend en deux */
  const SP = 13.2, BOOM = 15.6;
  at(SP, () => { el.classList.add('crack'); if (typeof impactFrames === 'function') impactFrames({host: el, x: X, y: Y, theme: 'x0s', seq: ['a', 'b', 'c'], dt: 50, snd: false}); });
  at(BOOM, () => { el.classList.add('boom'); if (typeof impactFrames === 'function') impactFrames({host: el, x: X, y: Y, theme: 'x0s', snd: false, lines: 90}); });
  at(17.6, () => cap('Il en est né un <b>pulsar</b> : une étoile qui tourne 700 fois par seconde.', 3.6));
  at(22, () => el.classList.add('title'));
  const AP = 28.2;
  at(AP - .9, () => el.classList.add('out'));
  at(AP, () => { if (apply && typeof apply === 'function') apply(); stage.classList.remove('xs-hide'); stage.classList.add('xs-in'); X0SX.burst = performance.now(); });
  const fin = () => { tm.forEach(clearTimeout); el.remove(); x0sOn = false; stage.classList.remove('xs-hide', 'xs-in', 'xs-suck'); };
  at(AP + 2.4, fin);
  let last = 0;
  el.addEventListener('pointerdown', e => { e.stopPropagation(); const n = Date.now(); $$('.xs-skip').classList.add('on'); if (n - last < 450) { if (music) music.stop(); tm.forEach(clearTimeout); if (apply && typeof apply === 'function') apply(); stage.classList.remove('xs-hide', 'xs-suck'); el.classList.add('out', 'skip'); setTimeout(fin, 900); } last = n; });

  /* ----- canevas ----- */
  const cl = (a, b, x) => Math.max(0, Math.min(1, (x - a) / (b - a))), eo = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3), eIn = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x;
  const ST = Array.from({length: 220}, () => ({x: Math.random() * 800, y: Math.random() * 480, r: Math.random() * 1.3 + .3, p: Math.random() * 6.28}));
  const DK = Array.from({length: lite ? 380 : 800}, () => ({a: Math.random() * 6.283, o: 1.45 + Math.pow(Math.random(), 1.4) * 2.8, w: .7 + Math.random() * .3, c: Math.random() * 4 | 0}));
  const DEB = Array.from({length: lite ? 260 : 560}, () => ({a: Math.random() * 6.283, v: .4 + Math.pow(Math.random(), .6) * 4, s: Math.random() * 1.8 + .6, c: Math.random() * 4 | 0}));
  const SPK = Array.from({length: 24}, (_, i) => ({a: i / 24 * 6.283, d: 60 + Math.random() * 120, p: Math.random() * 6.28}));
  let spin = 0, lt = 0, pulses = [], lastHalf = -1;
  const stars = a => ST.forEach(s => { g.fillStyle = `rgba(235,240,255,${(a * (.3 + .4 * Math.abs(Math.sin(lt * 1.2 + s.p)))).toFixed(2)})`; g.fillRect(s.x, s.y, s.r, s.r); });
  /* le trou noir shiny (disque cyan/rose) ; half : -1 gauche, 1 droite, 0 entier */
  const hole = (cx, cy, R, t, al, half = 0, ox = 0, rot = 0) => {
    g.save(); g.globalAlpha = al;
    if (half) { g.translate(cx + ox, cy); g.rotate(rot); g.beginPath(); g.rect(half < 0 ? -R * 6 : 0, -R * 6, R * 6, R * 12); g.clip(); g.translate(-cx, -cy); }
    g.globalCompositeOperation = 'lighter';
    const gl = g.createRadialGradient(cx, cy, R, cx, cy, R * 5.5); gl.addColorStop(0, 'rgba(150,230,255,.45)'); gl.addColorStop(.35, 'rgba(230,110,230,.16)'); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(cx - R * 6, cy - R * 6, R * 12, R * 12);
    const tilt = .22, band = front => { for (let k = 0; k < 14; k++) { const o = 1.42 + k * .2, hk = k / 14, lg = g.createLinearGradient(cx - o * R, 0, cx + o * R, 0); lg.addColorStop(0, `rgba(235,250,255,${(.24 - hk * .12).toFixed(3)})`); lg.addColorStop(.5, `rgba(${SHC[k % 2 ? 1 : 0]},${(.16 - hk * .08).toFixed(3)})`); lg.addColorStop(1, `rgba(${SHC[2]},${(.1 - hk * .05).toFixed(3)})`); g.strokeStyle = lg; g.lineWidth = R * .3; g.beginPath(); g.ellipse(cx, cy, o * R, o * R * tilt, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); g.stroke(); } };
    const pts = front => DK.forEach(p => { const s = Math.sin(p.a); if ((s >= 0) !== front) return; const heat = Math.max(0, 1 - (p.o - 1.45) / 2.8), b = (1 + .6 * Math.cos(p.a)) * (.35 + heat * .65); g.fillStyle = `rgba(${SHC[p.c]},${Math.min(1, .35 * b).toFixed(2)})`; g.fillRect(cx + Math.cos(p.a) * p.o * R, cy + s * p.o * R * tilt, 1.2, 1.2); });
    band(false); pts(false);
    for (let k = 0; k < 10; k++) { const rr = R * (1.12 + k * .05), a2 = .1 * (1 - k / 10); g.strokeStyle = `rgba(${SHC[k % 4]},${a2.toFixed(3)})`; g.lineWidth = 4; g.beginPath(); g.ellipse(cx, cy, rr * 1.06, rr, 0, Math.PI, Math.PI * 2); g.stroke(); }
    g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.fill();
    g.globalCompositeOperation = 'lighter'; g.strokeStyle = `hsla(${(t * 90) % 360},100%,85%,.95)`; g.lineWidth = 2.2; g.beginPath(); g.arc(cx, cy, R * 1.05, 0, 6.2832); g.stroke();
    band(true); pts(true);
    g.restore();
  };
  (function frame(nw) {
    if (!el.isConnected) return; requestAnimationFrame(frame); const t = (nw - T0) / 1000, dt = Math.min(.06, t - lt); lt = t;
    try {
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, 800, 480);
      /* 1. étincelles shiny sur l'ancien écran */
      if (t < 2.8) { const e = t - .2; SPK.forEach((s, i) => { const k = e - i * .05; if (k < 0) return; const r = 10 * Math.sin(Math.min(1, k / 1.4) * Math.PI), d = s.d * (1 + k * .3); shinyStar(g, X + Math.cos(s.a + k * .5) * d, Y + Math.sin(s.a + k * .5) * d * .8, r, 1, k * 2, SHC[i % 4]); }); }
      if (t >= 3 && t < BOOM + .2) {
        const dk = cl(3, 4.2, t); g.fillStyle = `rgba(3,2,10,${dk.toFixed(2)})`; g.fillRect(0, 0, 800, 480); stars(dk * .8);
        DK.forEach(p => p.a += .02 * Math.pow(1.45 / p.o, 1.5) * p.w * (1 + cl(5, 13, t) * 2.5));
        const R = (8 + eo(cl(3.2, 6, t)) * 46) * (1 + Math.sin(t * 9) * .03 * cl(9, 13, t)), wob = cl(9, 13, t) * 5;
        if (t < SP) {
          hole(X + (Math.random() - .5) * wob, Y + (Math.random() - .5) * wob, R, t, 1);
          if (t > 10.5) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = 'rgba(220,250,255,.8)'; g.lineWidth = 1.5; for (let k = 0; k < 3; k++) { if (Math.random() < .5) continue; let a = Math.random() * 6.283, x = X + Math.cos(a) * R * 1.05, y = Y + Math.sin(a) * R * 1.05; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 5; j++) { a += (Math.random() - .5) * 1.2; x += Math.cos(a) * 14; y += Math.sin(a) * 14; g.lineTo(x, y); } g.stroke(); } g.restore(); }
          if (t > 12.4) { const q = cl(12.4, SP, t); g.save(); g.globalCompositeOperation = 'lighter'; const lg = g.createLinearGradient(X - 6, 0, X + 6, 0); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(.5, `rgba(255,255,255,${(q * .9).toFixed(2)})`); lg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = lg; g.fillRect(X - 6, Y - R * 2.5 * q, 12, R * 5 * q); g.restore(); }
        } else {
          /* il se FEND EN DEUX : deux moitiés qui s'écartent, de la lumière jaillit entre elles */
          const e = t - SP, sep = eIn(Math.min(1, e / 2.3)) * 150, rot = e * .25;
          const beam = Math.min(1, e / .3), bw = 8 + sep * .5, bg = g.createLinearGradient(X - bw, 0, X + bw, 0); bg.addColorStop(0, 'rgba(255,255,255,0)'); bg.addColorStop(.5, `rgba(255,255,255,${beam})`); bg.addColorStop(1, 'rgba(255,255,255,0)'); g.globalCompositeOperation = 'lighter'; g.fillStyle = bg; g.fillRect(X - bw, 0, bw * 2, 480);
          const cg = g.createRadialGradient(X, Y, 0, X, Y, 60 + sep); cg.addColorStop(0, `rgba(255,255,255,${(.5 + e * .2).toFixed(2)})`); cg.addColorStop(1, 'rgba(180,230,255,0)'); g.fillStyle = cg; g.fillRect(0, 0, 800, 480); g.globalCompositeOperation = 'source-over';
          hole(X, Y, R, t, 1, -1, -sep, -rot); hole(X, Y, R, t, 1, 1, sep, rot);
        }
      }
      /* 3. explosion → pulsar */
      if (t >= BOOM) {
        const e = t - BOOM, out = cl(AP - .9, AP + .4, t);
        g.fillStyle = `rgba(3,2,10,${(1 - out).toFixed(2)})`; g.fillRect(0, 0, 800, 480); stars(1 - out);
        g.globalCompositeOperation = 'lighter';
        DEB.forEach(p => { const d = e * p.v * 130 * (1 - Math.min(.6, e * .05)), x = X + Math.cos(p.a) * d, y = Y + Math.sin(p.a) * d * .8, al = Math.max(0, 1 - e / 4) * (1 - out); if (al <= 0) return; g.strokeStyle = `rgba(${SHC[p.c]},${al.toFixed(2)})`; g.lineWidth = p.s; g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(p.a) * p.v * 8, y - Math.sin(p.a) * p.v * 6); g.stroke(); });
        [0, .12, .3, .6].forEach((o, i) => { const q = (e - o) / 2.8; if (q > 0 && q < 1) { const r = 10 + eo(q) * 640; g.strokeStyle = `rgba(${SHC[i]},${((1 - q) * .75).toFixed(2)})`; g.lineWidth = 10 * (1 - q) + 1; g.beginPath(); g.ellipse(X, Y, r, r * .8, 0, 0, 6.2832); g.stroke(); } });
        const fl = Math.max(0, 1 - e * 1.6); if (fl > 0) { const fg = g.createRadialGradient(X, Y, 0, X, Y, 520); fg.addColorStop(0, `rgba(255,255,255,${fl})`); fg.addColorStop(.4, `rgba(200,240,255,${(fl * .6).toFixed(2)})`); fg.addColorStop(1, 'rgba(255,150,230,0)'); g.fillStyle = fg; g.fillRect(0, 0, 800, 480); }
        g.globalCompositeOperation = 'source-over';
        /* le pulsar démarre doucement puis tourne à toute vitesse */
        const w = .6 + Math.pow(cl(.3, 5, e), 1.6) * 3.4; spin += w * dt * 2;
        const half = Math.floor(spin / Math.PI); if (half !== lastHalf) { lastHalf = half; pulses.push(t); if (pulses.length > 8) pulses.shift(); }
        g.save(); g.globalCompositeOperation = 'lighter'; pulses.forEach((p, i) => { const q = (t - p) / 2.4; if (q < 0 || q > 1) return; g.strokeStyle = `rgba(${SHC[i % 4]},${((1 - q) * .35 * (1 - out)).toFixed(3)})`; g.lineWidth = 2; g.beginPath(); g.ellipse(X, Y, 10 + q * 300, (10 + q * 300) * .55, 0, 0, 6.2832); g.stroke(); }); g.restore();
        drawShards(g, X, Y, t, 150 + e * 6, cl(.6, 2.5, e) * (1 - out));
        drawPulsar(g, X, Y, t, {spin, sc: eo(cl(.1, 1.2, e)) * 1.25, a: 1 - out});
        if (t > 22) { const k = (t - 22) % 2.4 / 2.4; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.2832 + t * .4, d = 110 + Math.sin(t + i) * 20; shinyStar(g, X + Math.cos(a) * d, Y + Math.sin(a) * d * .6, 6 * Math.sin(((k + i / 6) % 1) * Math.PI), 1 - out, t, SHC[i % 4]); } }
        if (t > AP + .4) g.clearRect(0, 0, 800, 480);
      }
    } catch (x) { g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  })(T0);
  return true;
}

/* ----- Le style : la Singularité en version shiny ----- */
Object.assign(SIG, {
  x0s: Object.assign({}, SIG.x0, {name: '✨ Singularité shiny', amb: 'x0s',
    deco2: () => { let d = ''; try { const x = JSON.parse(localStorage.getItem('x0sGot') || 'null'); if (x) d = ` · obtenu le ${new Date(x.t).toLocaleDateString('fr-FR')}${x.n > 1 ? ' · ×' + x.n : ''}`; } catch (e) {} return `<div class="x0-vig"></div><div class="xs-badge">✨ SHINY · 1 SUR 2 048 000${esc(d)} ✨</div>`; },
    cin: done => x0sCinematic(done),
    v: Object.assign({}, SIG.x0.v, {d: {clear: ['Un pulsar veille sur un ciel dégagé.'], clearN: ['Nuit claire : le pulsar bat comme un cœur.'], partly: ['Des nuages traversent les faisceaux.'], partlyN: ['Les faisceaux percent les nuages.'], cloudy: ['Ciel couvert, mais le pulsar tourne toujours.'], cloudnight: ['Nuit couverte. Bip… bip… bip…'], fog: ['Brouillard : les faisceaux deviennent visibles.'], drizzle: ['Une bruine scintillante.'], rain: ['Il pleut des étincelles chromatiques.'], pour: ['Averse ! Même le pulsar est trempé.'], storm: ['Orage magnétique en approche.'], hail: ['Grêle : des éclats du trou noir retombent.'], snow: ['Il neige des cristaux irisés.'], blizzard: ['Tempête : le vent de pulsar souffle fort.'], wind: ['Le vent du pulsar balaie la ville.'], heat: ['Chaleur : 1 million de degrés au centre. Ici, moins.'], frost: ['Gel : le froid de l\'espace, en plus brillant.'], rainbow: ['Un arc-en-ciel… version shiny.']},
      kick: c => `✨ SINGULARITÉ SHINY · ${UP(c.city)} · ${(700 + Math.floor((Date.now() / 1000) % 60)).toString()} TOURS/S`})})
});
setInterval(() => { if (HT.id !== 'x0s' || !CTX) return; const k = $('kick'); if (k) k.textContent = HT.v.kick(CTX); }, 1000);
const XSQ = ['✨ Shiny !', 'Ce pulsar tourne 700 fois par seconde.', '1 chance sur 2 048 000. Respect.', 'Avant, c\'était un trou noir. Il s\'est fendu en deux.', 'Bip… bip… bip… c\'est le pulsar.'];
stage.addEventListener('pointerdown', e => {
  if (HT.id !== 'x0s') return; const s = stage.getBoundingClientRect(), k = s.width / 800, x = (e.clientX - s.left) / k, y = (e.clientY - s.top) / k, [cx, cy] = bhPos();
  if (Math.hypot(x - cx, y - cy) < 110) { X0SX.burst = performance.now(); if (typeof toast === 'function') toast(XSQ[Math.random() * XSQ.length | 0]); if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on) AMB.one('shiny'); }
});
EGGS.x0scin = () => x0sCinematic(HT.id === 'x0s');
