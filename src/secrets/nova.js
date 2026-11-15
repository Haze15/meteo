
/* ===================================================================
   ✸ SUPERNOVA — style + cinématique : coupure, fissures, explosion de l'écran
   =================================================================== */
function novaPos() { const l = stage.dataset.lay; return l === 'center' ? [640, 150] : l === 'left-row' ? [620, 210] : l === 'right-row' ? [180, 210] : [392, 190]; }
/* Nébuleuse pré-dessinée une fois (rapide à afficher ensuite) */
let NEB = null;
function nebula(seed = 5) {
  if (NEB) return NEB; const c = document.createElement('canvas'); c.width = c.height = 520; const g = c.getContext('2d'), R = srnd(seed);
  g.translate(260, 260); g.globalCompositeOperation = 'lighter';
  const C = ['255,90,60', '255,160,60', '255,60,140', '120,90,255', '60,200,255', '255,220,140'];
  for (let i = 0; i < 90; i++) { const a = R() * 6.283, d = 70 + R() * 150, x = Math.cos(a) * d, y = Math.sin(a) * d * .8, r = 20 + R() * 60, col = C[(R() * C.length) | 0], gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${(.08 + R() * .12).toFixed(2)})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  g.lineCap = 'round';
  for (let i = 0; i < 140; i++) { const a = R() * 6.283, d0 = 90 + R() * 60, d1 = d0 + 30 + R() * 90, col = C[(R() * C.length) | 0]; g.strokeStyle = `rgba(${col},${(.06 + R() * .18).toFixed(2)})`; g.lineWidth = .6 + R() * 1.8; g.beginPath(); g.moveTo(Math.cos(a) * d0, Math.sin(a) * d0 * .8); g.quadraticCurveTo(Math.cos(a + .15) * (d0 + d1) / 2, Math.sin(a + .15) * (d0 + d1) / 2 * .8, Math.cos(a + .05) * d1, Math.sin(a + .05) * d1 * .8); g.stroke(); }
  const core = g.createRadialGradient(0, 0, 0, 0, 0, 80); core.addColorStop(0, 'rgba(180,220,255,.35)'); core.addColorStop(1, 'rgba(80,120,255,0)'); g.fillStyle = core; g.fillRect(-80, -80, 160, 160);
  return NEB = c;
}
let NVX = {flare: 0, next: 0};
function drawNova(P, t) {
  const [cx, cy] = novaPos(), N = nebula();
  P.forEach((p, i) => { if (i > 70) return; f.fillStyle = `rgba(230,235,255,${(.25 + .5 * Math.abs(Math.sin(t / 900 + p.p))).toFixed(2)})`; f.fillRect(p.x, p.y, p.r * .9, p.r * .9); });
  f.save(); f.globalCompositeOperation = 'lighter'; f.translate(cx, cy); f.rotate(t / 60000); const s = 1 + Math.sin(t / 2600) * .025; f.scale(s, s); f.globalAlpha = .9; f.drawImage(N, -260, -260); f.restore();
  f.save(); f.globalCompositeOperation = 'lighter'; f.translate(cx, cy);
  const a = t / 900; [0, Math.PI].forEach(o => { f.save(); f.rotate(a + o); const g = f.createLinearGradient(0, 0, 260, 0); g.addColorStop(0, 'rgba(200,230,255,.55)'); g.addColorStop(1, 'rgba(120,160,255,0)'); f.fillStyle = g; f.beginPath(); f.moveTo(0, 0); f.lineTo(260, -10); f.lineTo(260, 10); f.fill(); f.restore(); });
  const pr = 5 + Math.sin(t / 60) * 1.2, pg = f.createRadialGradient(0, 0, 0, 0, 0, pr * 6); pg.addColorStop(0, '#fff'); pg.addColorStop(.25, 'rgba(180,220,255,.8)'); pg.addColorStop(1, 'rgba(100,150,255,0)'); f.fillStyle = pg; f.fillRect(-pr * 6, -pr * 6, pr * 12, pr * 12);
  if (!NVX.next) NVX.next = t + 20000; if (t > NVX.next) { NVX.flare = t; NVX.next = t + 25000 + Math.random() * 20000; }
  if (NVX.flare) { const e = (t - NVX.flare) / 2200; if (e > 1) NVX.flare = 0; else { f.strokeStyle = `rgba(255,200,150,${(1 - e) * .6})`; f.lineWidth = 3 * (1 - e) + .5; f.beginPath(); f.ellipse(0, 0, 20 + e * 420, (20 + e * 420) * .8, 0, 0, 6.2832); f.stroke(); } }
  f.restore();
}
/* ----- Éclats de l'écran : chaque morceau est une copie de l'affichage, découpée ----- */
function novaShards(cx, cy) {
  const L = document.createElement('div'); L.className = 'nv-shards';
  const fxc = $('fx'), keep = ['ovb', 'deco', 'under', 'v1', 'deco2', 'eggs', 'fest', 'tick', 'shelf'];
  const parts = [...stage.children].filter(e => e.classList.contains('bg') || e.tagName === 'HEADER' || keep.includes(e.id) || e.id === 'fx');
  const NS = cfg.lite ? 7 : 9, RINGS = [0, 70 + Math.random() * 30, 190 + Math.random() * 40, 1000], ang = Array.from({length: NS}, (_, i) => (i + Math.random() * .6) / NS * 6.283);
  const pt = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r * .9];
  const pieces = [];
  for (let ri = 0; ri < 3; ri++) for (let j = 0; j < NS; j++) {
    const a0 = ang[j], a1 = ang[(j + 1) % NS] + (j === NS - 1 ? 6.283 : 0), r0 = RINGS[ri], r1 = RINGS[ri + 1];
    const poly = ri === 0 ? [[cx, cy], pt(a0, r1), pt((a0 + a1) / 2, r1 * 1.05), pt(a1, r1)] : [pt(a0, r0), pt((a0 + a1) / 2, r0 * 1.04), pt(a1, r0), pt(a1, r1), pt((a0 + a1) / 2, r1 * .97), pt(a0, r1)];
    const pc = document.createElement('div'); pc.className = 'nv-piece'; pc.style.clipPath = `polygon(${poly.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`;
    const cl = document.createElement('div'); cl.className = 'nv-clone';
    parts.forEach(e => { const k = e.cloneNode(true); if (e.tagName === 'CANVAS') { try { k.getContext('2d').drawImage(e, 0, 0); } catch (x) {} } cl.appendChild(k); });
    pc.appendChild(cl); const gl = document.createElement('div'); gl.className = 'nv-gl'; gl.style.background = `linear-gradient(${(Math.random() * 360) | 0}deg,rgba(255,255,255,.55),rgba(255,255,255,0) 35%,rgba(255,255,255,.18) 55%,rgba(255,255,255,0) 70%)`; pc.appendChild(gl); L.appendChild(pc);
    const mx = poly.reduce((s, p) => s + p[0], 0) / poly.length, my = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    pieces.push({el: pc, dx: mx - cx, dy: my - cy, ri});
  }
  return {L, pieces};
}
let novaOn = false;
/* Étoile géante rouge (phase « avant ») : surface qui bouillonne, assombrissement du bord */
let RGG = null;
function redGiantSpots() { if (RGG) return RGG; const R = srnd(11); return RGG = Array.from({length: 34}, () => ({a: R() * 6.283, d: Math.sqrt(R()) * .85, r: .12 + R() * .22, s: (R() - .5) * .4, k: R() < .55})); }
function redGiant(g, x, y, R, t, beat) {
  const glow = g.createRadialGradient(x, y, R * .6, x, y, R * (2.6 + beat * .6)); glow.addColorStop(0, `rgba(255,90,40,${(.32 + beat * .25).toFixed(3)})`); glow.addColorStop(.4, 'rgba(200,40,30,.12)'); glow.addColorStop(1, 'rgba(120,10,20,0)');
  g.fillStyle = glow; g.fillRect(x - R * 3.4, y - R * 3.4, R * 6.8, R * 6.8);
  const b = g.createRadialGradient(x - R * .18, y - R * .2, R * .05, x, y, R); b.addColorStop(0, '#fff3c4'); b.addColorStop(.28, '#ffc061'); b.addColorStop(.62, '#f0612a'); b.addColorStop(.9, '#a8231a'); b.addColorStop(1, '#5a0c12');
  g.fillStyle = b; g.beginPath(); g.arc(x, y, R, 0, 6.2832); g.fill();
  g.save(); g.beginPath(); g.arc(x, y, R, 0, 6.2832); g.clip();
  redGiantSpots().forEach(s => { const a = s.a + t * s.s * .3, sx = x + Math.cos(a) * s.d * R, sy = y + Math.sin(a) * s.d * R, r = s.r * R * (1 + .15 * Math.sin(t * 1.7 + s.a * 5)), gg = g.createRadialGradient(sx, sy, 0, sx, sy, r); gg.addColorStop(0, s.k ? 'rgba(255,230,160,.22)' : 'rgba(90,10,10,.28)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gg; g.fillRect(sx - r, sy - r, r * 2, r * 2); });
  g.restore();
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';   // vent stellaire : filaments qui ondulent au bord
  for (let i = 0; i < 54; i++) { const a = i / 54 * 6.2832 + Math.sin(t * .3 + i) * .03, l = R * (.05 + .22 * Math.pow(Math.abs(Math.sin(t * .7 + i * 2.7)), 3) + beat * .06), al = .05 + .13 * Math.abs(Math.sin(t * .9 + i * 1.3)) + beat * .12; g.strokeStyle = `rgba(255,${(110 + 60 * Math.sin(i)) | 0},60,${al.toFixed(3)})`; g.lineWidth = 2 + (i % 3) * 1.5; g.beginPath(); g.moveTo(x + Math.cos(a) * R * .98, y + Math.sin(a) * R * .98); g.quadraticCurveTo(x + Math.cos(a + .04) * (R + l * .6), y + Math.sin(a + .04) * (R + l * .6), x + Math.cos(a + .02) * (R + l), y + Math.sin(a + .02) * (R + l)); g.stroke(); }
  const rim = g.createRadialGradient(x, y, R * .92, x, y, R * 1.12); rim.addColorStop(0, 'rgba(255,120,60,0)'); rim.addColorStop(.4, `rgba(255,150,80,${(.35 + beat * .3).toFixed(3)})`); rim.addColorStop(1, 'rgba(255,80,40,0)'); g.fillStyle = rim; g.beginPath(); g.arc(x, y, R * 1.12, 0, 6.2832); g.fill();
  g.restore();
}
function novaCinematic(apply) {
  if (novaOn) return false; novaOn = true;
  let got = null; try { got = JSON.parse(localStorage.getItem('novaGot') || 'null'); } catch (e) {}
  const el = document.createElement('div'); el.id = 'nvc';
  const [cx, cy] = [400 + (Math.random() - .5) * 90, 214 + (Math.random() - .5) * 40];
  el.innerHTML = `<canvas width="800" height="480"></canvas><svg class="nv-crack" viewBox="0 0 800 480"><defs><filter id="nvgl"><feGaussianBlur stdDeviation="3"/></filter></defs><g class="nv-glow"></g><g class="nv-lines"></g></svg>
    <div class="nv-crt t"></div><div class="nv-crt b"></div><div class="nv-dot"></div><div class="nv-log"></div><div class="nv-flash"></div>
    <div class="nv-title">${[...'SUPERNOVA'].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</div><div class="nv-sub">Une étoile vient de mourir… un style vient de naître.</div><div class="nv-skip">touche 2 fois pour passer</div>`;
  stage.appendChild(el); if (typeof cinFX === 'function') cinFX(el);
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), tm = [], at = (s, fn) => tm.push(setTimeout(fn, s * 1000)), T0 = performance.now(), lite = !!cfg.lite;
  const music = !PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on ? (AMB.unlock(), AMB.nova()) : null;
  /* 1. l'écran tremble, grésille… et se coupe comme un vieux téléviseur */
  stage.classList.add('nv-shake'); at(.5, () => stage.classList.add('nv-glitch'));
  at(1.2, () => { stage.classList.remove('nv-glitch', 'nv-shake'); el.classList.add('crt'); });
  at(1.75, () => { el.classList.add('off'); stage.classList.add('nv-hide'); });
  /* 2. dans le noir : une géante rouge, son cœur bat de plus en plus vite */
  const LOG = el.querySelector('.nv-log'), log = (s, cls = '') => { LOG.insertAdjacentHTML('beforeend', `<div class="${cls}">${s}</div>`); };
  at(2.5, () => { el.classList.add('dark'); log('◉ ÉTOILE GÉANTE ROUGE · 19 MASSES SOLAIRES'); });
  at(3.9, () => log('le cœur brûle son dernier combustible…'));
  at(5.3, () => log('fer dans le noyau · fusion impossible', 'w'));
  at(6.5, () => log('⚠ EFFONDREMENT DU CŒUR', 'r'));
  const BEATS = [2.9, 3.85, 4.7, 5.45, 6.1, 6.65, 7.1];
  at(7.45, () => { LOG.classList.add('gone'); });
  /* 3. le courant revient, buggé… et la vitre se fissure sous la lumière */
  at(8.7, () => { el.classList.remove('crt', 'off', 'dark'); el.classList.add('on'); stage.classList.remove('nv-hide'); stage.classList.add('nv-bad'); });
  const lines = el.querySelector('.nv-lines'), glow = el.querySelector('.nv-glow');
  const crack = (n, len, w) => { let s = ''; for (let i = 0; i < n; i++) { let x = cx, y = cy, a = Math.random() * 6.283, d = `M${x.toFixed(0)} ${y.toFixed(0)}`; const steps = 4 + (Math.random() * 5 | 0); for (let k = 0; k < steps; k++) { a += (Math.random() - .5) * .9; const l = len * (.4 + Math.random() * .8); x += Math.cos(a) * l; y += Math.sin(a) * l; d += `L${x.toFixed(0)} ${y.toFixed(0)}`; if (Math.random() < .35) { const b = a + (Math.random() < .5 ? 1 : -1) * (.6 + Math.random() * .6), bx = x + Math.cos(b) * l * .7, by = y + Math.sin(b) * l * .7; s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)}L${bx.toFixed(0)} ${by.toFixed(0)}" style="stroke-width:${(w * .6).toFixed(1)}"/>`; } } s += `<path d="${d}" style="stroke-width:${w}"/>`; } return s; };
  const ring = r => { let d = ''; const n = 14; for (let i = 0; i <= n; i++) { const a = i / n * 6.283, rr = r * (.85 + Math.random() * .3); d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(0) + ' ' + (cy + Math.sin(a) * rr * .9).toFixed(0); } return `<path d="${d}" style="stroke-width:1.2"/>`; };
  const hit = (html, big) => { lines.insertAdjacentHTML('beforeend', html); glow.innerHTML = lines.innerHTML; el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); if (big) el.classList.add('hot'); };
  at(9.4, () => hit(crack(5, 26, 2.2) + ring(22)));
  at(10.45, () => hit(crack(7, 48, 2) + ring(60)));
  at(11.55, () => hit(crack(12, 95, 1.8) + ring(125) + ring(210), true));
  at(11.9, () => el.classList.add('leak'));
  /* 4. EXPLOSION : l'écran part en morceaux */
  const X = 13.2; let SH = null;
  at(X, () => {
    stage.classList.remove('nv-bad');
    SH = novaShards(cx, cy); el.insertBefore(SH.L, el.querySelector('.nv-crack')); stage.classList.add('nv-hide'); el.classList.add('boom'); if (typeof impactFrames === 'function') impactFrames({host: el, x: cx, y: cy, snd: false, theme: 'nova'});
    SH.pieces.forEach(p => { const d = Math.hypot(p.dx, p.dy) || 1, ux = p.dx / d, uy = p.dy / d, sp = (560 + Math.random() * 420) * (1.15 - p.ri * .12), rz = (Math.random() - .5) * 420, rx = (Math.random() - .5) * 200, ry = (Math.random() - .5) * 200;
      p.el.animate([{transform: 'translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1)', opacity: 1, filter: 'brightness(3) saturate(1.4)'}, {transform: `translate3d(${(ux * sp * .16).toFixed(0)}px,${(uy * sp * .16).toFixed(0)}px,160px) rotateX(${(rx * .18).toFixed(0)}deg) rotateY(${(ry * .18).toFixed(0)}deg) rotateZ(${(rz * .18).toFixed(0)}deg) scale(1.06)`, opacity: 1, filter: 'brightness(1.8) saturate(1.3)', offset: .3}, {transform: `translate3d(${(ux * sp).toFixed(0)}px,${(uy * sp + 260).toFixed(0)}px,-200px) rotateX(${rx.toFixed(0)}deg) rotateY(${ry.toFixed(0)}deg) rotateZ(${rz.toFixed(0)}deg) scale(.6)`, opacity: 0, filter: 'brightness(1.1)'}], {duration: 2700 + Math.random() * 900, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards'}); });
  });
  at(X + .15, () => { el.querySelector('.nv-crack').style.display = 'none'; });
  at(X + 3.8, () => { if (SH) SH.L.remove(); });
  /* 5. titre, puis la nébuleuse s'installe */
  at(X + 1.7, () => el.classList.add('title'));
  if (got && got.n) at(X + 1.7, () => { const s = el.querySelector('.nv-sub'); if (s) s.insertAdjacentHTML('beforeend', `<small>obtenu ×${got.n}</small>`); });
  /* 6. reconstruction dans le nouveau style */
  const AP = X + 5.6;
  at(AP, () => { if (apply && typeof apply === 'function') apply(); });
  at(AP + .3, () => { stage.classList.remove('nv-hide'); stage.classList.add('nv-in'); el.classList.add('out'); });
  const fin = () => { tm.forEach(clearTimeout); el.remove(); novaOn = false; stage.classList.remove('nv-glitch', 'nv-shake', 'nv-hide', 'nv-bad', 'nv-in'); NVX.flare = performance.now(); };
  at(AP + 2.6, fin);
  let last = 0;
  el.addEventListener('pointerdown', e => { e.stopPropagation(); const n = Date.now(); el.querySelector('.nv-skip').classList.add('on'); if (n - last < 450) { if (music) music.stop(); tm.forEach(clearTimeout); if (apply && typeof apply === 'function') apply(); stage.classList.remove('nv-hide', 'nv-bad', 'nv-glitch', 'nv-shake'); el.classList.add('out'); setTimeout(fin, 900); } last = n; });
  /* ----- le canevas ----- */
  const EJ = Array.from({length: lite ? 260 : 640}, () => { const a = Math.random() * 6.283, v = .5 + Math.pow(Math.random(), .6) * 4.2; return {a, v, x: 0, y: 0, s: Math.random() * 1.8 + .6}; });
  const IN = Array.from({length: lite ? 90 : 220}, () => ({a: Math.random() * 6.283, d: 180 + Math.random() * 380, v: .6 + Math.random() * .8}));
  const SK = Array.from({length: 170}, () => ({x: Math.random() * 800, y: Math.random() * 480, r: Math.random() * 1.3 + .3, p: Math.random() * 6.28}));
  const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3), eIn = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * x;
  const beatAt = t => BEATS.reduce((m, b) => t >= b ? Math.max(m, Math.exp(-(t - b) * 7) + .55 * Math.exp(-Math.max(0, t - b - .2) * 9) * (t > b + .2 ? 1 : 0)) : m, 0);
  const [ex, ey] = novaPos();
  (function frame(now) {
    if (!el.isConnected) return; requestAnimationFrame(frame); const t = (now - T0) / 1000; g.clearRect(0, 0, 800, 480);
    try {
      /* l'étoile géante, dans le noir (2.3 → 8.6 s) */
      if (t > 2.2 && t < 8.7) {
        g.fillStyle = '#020005'; g.fillRect(0, 0, 800, 480);
        const fade = Math.min(1, (t - 2.2) / 1.2);
        SK.forEach(s => { g.fillStyle = `rgba(230,225,255,${(fade * (.35 + .35 * Math.sin(t * 2 + s.p))).toFixed(2)})`; g.fillRect(s.x, s.y, s.r, s.r); });
        const bt = beatAt(t), grow = 1 + (t - 2.2) * .035;
        if (t < 7.45) {
          const R = (88 + bt * 9) * grow * (.65 + .35 * ease(fade)), sh = t > 6.4 ? (t - 6.4) * 4 : 0;
          g.globalAlpha = fade; redGiant(g, cx + (Math.random() - .5) * sh, cy + (Math.random() - .5) * sh, R, t, bt); g.globalAlpha = 1;
        } else {
          /* effondrement : l'étoile s'écrase sur elle-même */
          const q = Math.min(1, (t - 7.45) / .55), R = Math.max(2, 120 * (1 - eIn(q)));
          if (q < 1) redGiant(g, cx, cy, R, t, 1 - q);
          g.globalCompositeOperation = 'lighter';
          IN.forEach(p => { const d = p.d * (1 - eIn(Math.min(1, q * p.v * 1.3))); if (d < 3) return; g.strokeStyle = `rgba(255,${(150 + p.v * 80) | 0},120,${(.5 * (1 - q * .5)).toFixed(2)})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx + Math.cos(p.a) * d, cy + Math.sin(p.a) * d); g.lineTo(cx + Math.cos(p.a) * (d + 30 + q * 40), cy + Math.sin(p.a) * (d + 30 + q * 40)); g.stroke(); });
          const pt = t > 8 ? 1 : q, pr = 6 + pt * 18 + Math.sin(t * 40) * 2, pg = g.createRadialGradient(cx, cy, 0, cx, cy, pr * 4); pg.addColorStop(0, '#fff'); pg.addColorStop(.2, 'rgba(200,230,255,.9)'); pg.addColorStop(1, 'rgba(120,170,255,0)'); g.fillStyle = pg; g.fillRect(cx - pr * 4, cy - pr * 4, pr * 8, pr * 8);
          if (t > 8) { g.strokeStyle = 'rgba(220,240,255,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - 90, cy); g.lineTo(cx + 90, cy); g.moveTo(cx, cy - 60); g.lineTo(cx, cy + 60); g.stroke(); }
          g.globalCompositeOperation = 'source-over';
        }
      }
      /* le point lumineux reste derrière la vitre, et grossit */
      if (t >= 8.7 && t < X) {
        const q = (t - 8.7) / (X - 8.7), pr = 10 + q * q * 70 + Math.sin(t * 30) * 2; g.globalCompositeOperation = 'lighter';
        const pg = g.createRadialGradient(cx, cy, 0, cx, cy, pr * 3); pg.addColorStop(0, `rgba(255,255,255,${(.6 + q * .4).toFixed(2)})`); pg.addColorStop(.25, `rgba(255,220,170,${(.25 + q * .5).toFixed(2)})`); pg.addColorStop(1, 'rgba(255,120,60,0)'); g.fillStyle = pg; g.fillRect(cx - pr * 3, cy - pr * 3, pr * 6, pr * 6);
        if (t > 11.6) { const k = (t - 11.6) / (X - 11.6), lg = g.createRadialGradient(cx, cy, 0, cx, cy, 60 + k * 300); lg.addColorStop(0, `rgba(255,255,255,${(.25 + k * .6).toFixed(2)})`); lg.addColorStop(.3, `rgba(255,200,120,${(k * .35).toFixed(2)})`); lg.addColorStop(1, 'rgba(255,120,60,0)'); g.fillStyle = lg; g.fillRect(0, 0, 800, 480); }
        g.globalCompositeOperation = 'source-over';
      }
      if (t >= X) {
        const e = t - X, out = t > AP + .3 ? Math.min(1, (t - AP - .3) / 1.8) : 0;
        const mv = ease(Math.max(0, (e - 3.4) / 2.2)), ox = cx + (ex - cx) * mv, oy = cy + (ey - cy) * mv;
        g.fillStyle = `rgba(2,1,8,${1 - out})`; g.fillRect(0, 0, 800, 480);
        SK.forEach(s => { g.fillStyle = `rgba(230,235,255,${(.6 * (1 - out)).toFixed(2)})`; g.fillRect(s.x, s.y, s.r, s.r); });
        g.globalCompositeOperation = 'lighter';
        if (e > 1) { const na = Math.min(1, (e - 1) / 2.5) * (1 - out * .6); g.save(); g.translate(ox, oy); g.rotate(e * .02); const sc = .4 + ease(Math.min(1, (e - .8) / 3)) * .7; g.scale(sc, sc); g.globalAlpha = na; g.drawImage(nebula(), -260, -260); g.restore(); g.globalAlpha = 1; }
        EJ.forEach(p => { const dr = Math.max(.0, 1 - e * .18); p.x += Math.cos(p.a) * p.v * 4 * dr; p.y += Math.sin(p.a) * p.v * 3.4 * dr; const sp = p.v * dr, col = sp > 2.6 ? '200,225,255' : sp > 1.4 ? '255,230,170' : sp > .7 ? '255,150,80' : '220,70,110', al = Math.max(0, 1 - e / 5.5) * (1 - out); g.strokeStyle = `rgba(${col},${al.toFixed(2)})`; g.lineWidth = p.s; g.beginPath(); g.moveTo(cx + p.x, cy + p.y); g.lineTo(cx + p.x - Math.cos(p.a) * sp * 6, cy + p.y - Math.sin(p.a) * sp * 5); g.stroke(); });
        [0, .12, .3, .9].forEach((o, i) => { const q = (e - o) / (i === 3 ? 3.6 : 2.6); if (q > 0 && q < 1) { const r = 20 + ease(q) * 640; g.strokeStyle = i === 1 ? `rgba(255,200,140,${(1 - q) * .8})` : i === 3 ? `rgba(255,110,170,${(1 - q) * .45})` : `rgba(200,220,255,${(1 - q) * .7})`; g.lineWidth = (i === 3 ? 22 : 10) * (1 - q) + 1; g.beginPath(); g.ellipse(cx, cy, r, r * .82, 0, 0, 6.2832); g.stroke(); } });
        const cr = e < .35 ? 30 + e * 600 : Math.max(6, 240 * Math.exp(-(e - .35) * 2.2)), cg = g.createRadialGradient(ox, oy, 0, ox, oy, cr); cg.addColorStop(0, `rgba(255,255,255,${1 - out * .5})`); cg.addColorStop(.35, `rgba(255,240,200,${.8 * (1 - out)})`); cg.addColorStop(1, 'rgba(255,160,80,0)'); g.fillStyle = cg; g.fillRect(ox - cr, oy - cr, cr * 2, cr * 2);
        if (e > 2.2) { const ba = Math.min(1, (e - 2.2) / 1) * (1 - out); g.save(); g.translate(ox, oy); g.rotate(e * 2.2); [0, Math.PI].forEach(o => { g.save(); g.rotate(o); const bg = g.createLinearGradient(0, 0, 340, 0); bg.addColorStop(0, `rgba(200,230,255,${.7 * ba})`); bg.addColorStop(1, 'rgba(120,160,255,0)'); g.fillStyle = bg; g.beginPath(); g.moveTo(0, 0); g.lineTo(340, -12); g.lineTo(340, 12); g.fill(); g.restore(); }); g.restore(); }
        g.globalCompositeOperation = 'source-over';
      }
    } catch (x) { g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  })(T0);
}
/* ----- Le style ----- */
Object.assign(SIG, {
  nova: {name: 'Supernova', icons: 'line', temp: 'text', noAstro: true, noClouds: true, amb: 'nova',
    deco2: '<div class="nv-vig"></div><div class="nv-badge">✸ SUPERNOVA · RESTE D\'ÉTOILE Nº 1054 ✸</div>',
    cin: done => novaCinematic(done),
    v: {d: {clear: ['Un soleil éclatant… espérons qu\'il tienne encore quelques milliards d\'années.'], clearN: ['Nuit claire : les étoiles brillent, certaines sont déjà mortes.'], partly: ['Quelques nuages devant les étoiles.'], partlyN: ['Une nébuleuse de nuages cette nuit.'], cloudy: ['Ciel couvert : un voile de poussière d\'étoile.'], cloudnight: ['Nuit couverte, le cosmos se cache.'], fog: ['Brouillard : on dirait une nébuleuse.'], drizzle: ['Une pluie fine de poussière céleste.'], rain: ['Il pleut… même les étoiles pleurent.'], pour: ['Averse cosmique !'], storm: ['Orage : l\'énergie d\'une supernova au-dessus de nous.'], hail: ['Grêle : une pluie de météorites miniatures !'], snow: ['Il neige des fragments d\'étoile.'], blizzard: ['Tempête blanche, comme une onde de choc.'], wind: ['Un vent solaire souffle sur la ville.'], heat: ['Chaleur stellaire. Hydrate-toi !'], frost: ['Froid sidéral ce matin.'], rainbow: ['Un arc-en-ciel… les couleurs d\'une nébuleuse.']},
      kick: c => `✸ SUPERNOVA · CIEL DE ${UP(c.city)}`, hl: c => `MAX ${c.mx}° · MIN ${c.mn}°`, mt: c => `Ressenti ${c.fe}° · Humidité ${c.hu} % · Vent ${c.wi} km/h`, day: D3, hr: (h, n) => n ? pad2(h) + 'h' : 'T0'}}
});
stage.addEventListener('pointerdown', e => {
  if (HT.id !== 'nova') return; const s = stage.getBoundingClientRect(), k = s.width / 800, x = (e.clientX - s.left) / k, y = (e.clientY - s.top) / k, [cx, cy] = novaPos();
  if (Math.hypot(x - cx, y - cy) < 70) { NVX.flare = performance.now(); if (typeof toast === 'function') toast(['Ce pulsar tourne 30 fois par seconde !', 'Tu es fait de poussière d\'étoile.', 'Boum. Il y a 1000 ans, c\'était une étoile.', 'Attention aux rayons gamma !'][Math.random() * 4 | 0]); }
});
EGGS.novacin = () => novaCinematic(HT.id === 'nova');
