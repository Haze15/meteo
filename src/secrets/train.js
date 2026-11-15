
/* ===================================================================
   🚂 LE DERNIER TRAIN — 1 chance sur 10 000 000
   L'écran devient la fenêtre d'un train de nuit. Dehors : la vraie météo.
   =================================================================== */
const TRV = (() => {
  const R = srnd(1857), P = 1600, M = [], H = [], V = [], B = [];
  const s = [[1, R() * 6.28, 60], [3, R() * 6.28, 28], [7, R() * 6.28, 12], [13, R() * 6.28, 6]];
  for (let x = 0; x <= P; x += 16) { M.push(s.reduce((a, [k, p, A]) => a + Math.sin(x / P * 6.2832 * k + p) * A, 0)); }
  const s2 = [[2, R() * 6.28, 18], [5, R() * 6.28, 9], [11, R() * 6.28, 4]];
  for (let x = 0; x <= P; x += 16) { H.push(s2.reduce((a, [k, p, A]) => a + Math.sin(x / P * 6.2832 * k + p) * A, 0)); }
  for (let i = 0; i < 9; i++) { const cx = R() * P, n = 3 + (R() * 9 | 0); for (let j = 0; j < n; j++) V.push({x: cx + (R() - .5) * 70, dy: R() * 14, r: .8 + R() * 1.4, f: R()}); }   // villages
  for (let x = 0; x < 2000; x += 26 + R() * 30) B.push({x, w: 22 + R() * 36, h: 30 + R() * 110, win: Array.from({length: 18}, () => R() < .45)});   // ville
  const ST = Array.from({length: 160}, () => ({x: R() * 800, y: R() * 300, r: R() * 1.2 + .3, p: R() * 6.28}));
  return {P, M, H, V, B, ST};
})();
let TRX = {drops: [], lastT: 0, tunnel: 0, nextTun: 0};
/* dessine la vue par la fenêtre. o : {day, scene, speed, tunnel, rain, snow, fog, cloud, aurora, bob} */
function trainView(g, t, x, o) {
  const day = !!o.day, hz = 292, W = 800;
  /* ciel */
  const sky = g.createLinearGradient(0, 0, 0, hz + 40);
  if (day) { sky.addColorStop(0, o.cloud ? '#4b566b' : '#3f7fcf'); sky.addColorStop(1, o.cloud ? '#8f99aa' : '#a9cdf2'); }
  else { sky.addColorStop(0, '#03061a'); sky.addColorStop(.7, '#0c1a42'); sky.addColorStop(1, o.scene === 'city' ? '#3a2a4a' : '#1a2a5a'); }
  g.fillStyle = sky; g.fillRect(0, 0, W, 480);
  if (!day && !o.cloud) TRV.ST.forEach(s => { g.fillStyle = `rgba(235,235,255,${(.3 + .45 * Math.abs(Math.sin(t * .8 + s.p))).toFixed(2)})`; g.fillRect(s.x, s.y, s.r, s.r); });
  /* aurore boréale */
  if (o.aurora) { g.save(); g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 3; k++) { g.beginPath(); for (let px = 0; px <= W; px += 10) { const yy = 70 + k * 26 + Math.sin(px / 140 + t * .6 + k) * 22 + Math.sin(px / 53 - t * .9) * 8; px ? g.lineTo(px, yy) : g.moveTo(px, yy); } for (let px = W; px >= 0; px -= 10) { const yy = 70 + k * 26 + Math.sin(px / 140 + t * .6 + k) * 22 + Math.sin(px / 53 - t * .9) * 8 + 90 + Math.sin(px / 90 + t) * 20; g.lineTo(px, yy); } g.closePath(); const ag = g.createLinearGradient(0, 40, 0, 240); ag.addColorStop(0, `rgba(${k === 1 ? '170,90,255' : '60,255,170'},0)`); ag.addColorStop(.35, `rgba(${k === 1 ? '170,90,255' : '60,255,170'},${(.16 * o.aurora).toFixed(3)})`); ag.addColorStop(1, 'rgba(40,200,150,0)'); g.fillStyle = ag; g.fill(); } g.restore(); }
  /* lune ou soleil */
  if (!o.cloud) { const mx = 640, my = 82; if (day) { const sg = g.createRadialGradient(mx, my, 0, mx, my, 70); sg.addColorStop(0, 'rgba(255,250,220,.95)'); sg.addColorStop(.25, 'rgba(255,240,180,.5)'); sg.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = sg; g.fillRect(mx - 70, my - 70, 140, 140); } else { const mg = g.createRadialGradient(mx, my, 10, mx, my, 70); mg.addColorStop(0, 'rgba(220,230,255,.35)'); mg.addColorStop(1, 'rgba(220,230,255,0)'); g.fillStyle = mg; g.fillRect(mx - 70, my - 70, 140, 140); g.fillStyle = '#eef2ff'; g.beginPath(); g.arc(mx, my, 17, 0, 6.2832); g.fill(); g.fillStyle = 'rgba(180,190,220,.35)'; g.beginPath(); g.arc(mx - 5, my - 3, 4, 0, 6.2832); g.arc(mx + 6, my + 5, 3, 0, 6.2832); g.fill(); } }
  /* nuages */
  if (o.cloud) { for (let k = 0; k < 7; k++) { const cx = ((k * 190 - x * .02) % 1100 + 1100) % 1100 - 150, cy = 50 + (k * 37 % 120); g.fillStyle = day ? 'rgba(255,255,255,.35)' : 'rgba(120,130,170,.18)'; g.beginPath(); g.ellipse(cx, cy, 110, 26, 0, 0, 6.2832); g.ellipse(cx + 50, cy - 12, 70, 22, 0, 0, 6.2832); g.fill(); } }
  const by = o.bob || 0; g.save(); g.translate(0, by);
  /* montagnes au loin */
  if (o.scene !== 'sea') { const off = x * .06 % TRV.P; g.fillStyle = day ? '#5d7392' : o.scene === 'snow' ? '#16234a' : '#0a1330'; g.beginPath(); g.moveTo(0, 480); for (let px = 0; px <= W + 16; px += 16) { const i = Math.floor(((px + off) % TRV.P) / 16); g.lineTo(px, hz - 40 - TRV.M[i] * (o.scene === 'snow' ? 1.6 : 1)); } g.lineTo(W, 480); g.fill();
    if (o.scene === 'snow') { g.save(); g.beginPath(); g.moveTo(0, 480); for (let px = 0; px <= W + 16; px += 16) { const i = Math.floor(((px + off) % TRV.P) / 16); g.lineTo(px, hz - 40 - TRV.M[i] * 1.6); } g.lineTo(W, 480); g.closePath(); g.clip(); const sl = hz - 40 - 52, sg2 = g.createLinearGradient(0, sl - 90, 0, sl + 14); sg2.addColorStop(0, 'rgba(225,235,255,.85)'); sg2.addColorStop(.8, 'rgba(200,215,250,.55)'); sg2.addColorStop(1, 'rgba(200,215,250,0)'); g.fillStyle = sg2; g.fillRect(0, 0, W, sl + 14); g.restore(); } }
  /* la mer, avec le reflet de la lune */
  if (o.scene === 'sea') { const sg = g.createLinearGradient(0, hz, 0, 480); sg.addColorStop(0, '#0d1b46'); sg.addColorStop(1, '#030612'); g.fillStyle = sg; g.fillRect(0, hz, W, 200); g.save(); g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 26; k++) { const yy = hz + 6 + k * 7, w = 18 + Math.sin(t * 2 + k) * 10 + k * 1.5; g.fillStyle = `rgba(220,230,255,${(.35 - k * .012).toFixed(3)})`; g.fillRect(640 - w / 2 + Math.sin(t * 3 + k * 1.7) * 6, yy, w, 1.6); } g.restore(); }
  /* collines et villages / ville */
  if (o.scene === 'city') { const off = x * .3 % 2000; TRV.B.forEach(b => { let bx = b.x - off; if (bx < -80) bx += 2000; if (bx > W) return; g.fillStyle = '#080a1c'; g.fillRect(bx, hz + 20 - b.h, b.w, b.h + 200); for (let k = 0; k < b.win.length; k++) { if (!b.win[k]) continue; const wx = bx + 4 + (k % 3) * (b.w / 3 - 1), wy = hz + 26 - b.h + Math.floor(k / 3) * 14; if (wy > hz + 16) continue; g.fillStyle = 'rgba(255,214,140,.85)'; g.fillRect(wx, wy, 4, 5); } }); }
  else if (o.scene !== 'sea') { const off = x * .25 % TRV.P; g.fillStyle = day ? '#3d5a3a' : '#060b1e'; g.beginPath(); g.moveTo(0, 480); for (let px = 0; px <= W + 16; px += 16) { const i = Math.floor(((px + off) % TRV.P) / 16); g.lineTo(px, hz + 10 - TRV.H[i]); } g.lineTo(W, 480); g.fill();
    if (!day) { g.save(); g.globalCompositeOperation = 'lighter'; TRV.V.forEach(v => { let vx = v.x - off; if (vx < 0) vx += TRV.P; if (vx > W + 10) return; const i = Math.floor(((vx + off) % TRV.P) / 16), vy = hz + 14 - TRV.H[i] + v.dy, fl = .7 + .3 * Math.sin(t * 3 + v.f * 20); g.fillStyle = `rgba(255,${(200 + v.f * 40) | 0},120,${(.85 * fl).toFixed(2)})`; g.fillRect(vx, vy, v.r * 1.6, v.r * 1.6); const hg = g.createRadialGradient(vx, vy, 0, vx, vy, 8); hg.addColorStop(0, 'rgba(255,200,120,.25)'); hg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = hg; g.fillRect(vx - 8, vy - 8, 16, 16); }); g.restore(); } }
  /* sol, poteaux, caténaires (ou arches du viaduc) */
  g.fillStyle = day ? '#25331f' : '#02030a'; g.fillRect(0, 404, W, 90);
  const near = x * 1.25;
  if (o.scene === 'sea') { for (let k = -1; k < 5; k++) { const ax = k * 220 - (near % 220); g.fillStyle = '#04060e'; g.fillRect(ax, 360, 24, 140); g.beginPath(); g.moveTo(ax + 24, 404); g.quadraticCurveTo(ax + 122, 330, ax + 220, 404); g.lineTo(ax + 220, 372); g.quadraticCurveTo(ax + 122, 300, ax + 24, 372); g.fill(); } g.fillStyle = '#04060e'; g.fillRect(0, 350, W, 12); }
  else { const pw = 300, off2 = near % pw; g.strokeStyle = day ? 'rgba(30,30,30,.7)' : 'rgba(0,0,0,.85)'; g.lineWidth = 1.2; for (let k = -1; k < 4; k++) { const px = k * pw - off2; g.fillStyle = day ? '#2b2b2b' : '#010204'; g.fillRect(px, 150, 7, 300); g.fillRect(px - 16, 158, 39, 4); g.beginPath(); g.moveTo(px - 14, 160); g.quadraticCurveTo(px - 14 + pw / 2, 200, px - 14 + pw, 160); g.moveTo(px + 21, 160); g.quadraticCurveTo(px + 21 + pw / 2, 192, px + 21 + pw, 160); g.stroke(); } }
  /* flou de vitesse au sol */
  g.fillStyle = day ? 'rgba(60,70,50,.5)' : 'rgba(20,25,40,.6)'; for (let k = 0; k < 14; k++) { const lx = ((k * 97 - near * 2.2) % 900 + 900) % 900 - 50; g.fillRect(lx, 420 + (k * 13 % 50), 60 + (k * 17 % 80), 1.5); }
  g.restore();
  /* brouillard */
  if (o.fog) { const fg = g.createLinearGradient(0, 150, 0, 480); fg.addColorStop(0, `rgba(${day ? '210,215,225' : '60,70,95'},0)`); fg.addColorStop(.5, `rgba(${day ? '210,215,225' : '60,70,95'},${(.55 * o.fog).toFixed(2)})`); fg.addColorStop(1, `rgba(${day ? '210,215,225' : '60,70,95'},${(.75 * o.fog).toFixed(2)})`); g.fillStyle = fg; g.fillRect(0, 0, W, 480); }
  /* tunnel */
  if (o.tunnel > 0) { g.fillStyle = `rgba(4,3,6,${Math.min(1, o.tunnel * 1.2).toFixed(2)})`; g.fillRect(0, 0, W, 480); if (o.tunnel > .6) { g.save(); g.globalCompositeOperation = 'lighter'; const lp = 170, off3 = (x * 1.6) % lp; for (let k = -1; k < 6; k++) { const lx = k * lp - off3, lg = g.createLinearGradient(lx - 120, 0, lx, 0); lg.addColorStop(0, 'rgba(255,150,60,0)'); lg.addColorStop(1, `rgba(255,170,80,${(.8 * (o.tunnel - .6) * 2.5).toFixed(2)})`); g.fillStyle = lg; g.fillRect(lx - 120, 96, 120, 4); const hg = g.createRadialGradient(lx, 98, 0, lx, 98, 40); hg.addColorStop(0, `rgba(255,160,70,${(.3 * (o.tunnel - .6) * 2.5).toFixed(2)})`); hg.addColorStop(1, 'rgba(255,160,70,0)'); g.fillStyle = hg; g.fillRect(lx - 40, 58, 80, 80); } g.restore(); } }
  /* la vitre : pluie, neige, reflets */
  if (o.rain) { g.save(); g.strokeStyle = `rgba(200,215,255,${(.25 * o.rain + .1).toFixed(2)})`; g.lineWidth = 1; const n = Math.round(40 * o.rain); for (let k = 0; k < n; k++) { const sx = ((k * 61 + t * 900) % 900) - 50, sy = (k * 37 + t * 300) % 480; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx - 26, sy + 9); g.stroke(); } const dt = TRX.lastT ? Math.min(.05, t - TRX.lastT) : .016; if (Math.random() < o.rain * .5 && TRX.drops.length < 70) TRX.drops.push({x: 820, y: Math.random() * 460, r: 1.5 + Math.random() * 2.5, v: 120 + Math.random() * 200}); TRX.drops = TRX.drops.filter(d => { d.x -= d.v * dt; d.y += 14 * dt; g.fillStyle = 'rgba(210,225,255,.35)'; g.beginPath(); g.ellipse(d.x, d.y, d.r * 1.8, d.r, -.25, 0, 6.2832); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(d.x - d.r * .6, d.y - d.r * .5, 1.2, 1.2); return d.x > -20; }); g.restore(); }
  if (o.snow) { g.fillStyle = 'rgba(255,255,255,.85)'; for (let k = 0; k < 70 * o.snow; k++) { const sx = ((k * 83 - t * 520) % 900 + 900) % 900 - 50, sy = (k * 47 + t * 60 + Math.sin(k + t) * 10) % 480; g.beginPath(); g.arc(sx, sy, 1 + (k % 3) * .6, 0, 6.2832); g.fill(); } }
  TRX.lastT = t;
  if (day) { g.fillStyle = 'rgba(10,14,30,.28)'; g.fillRect(0, 0, W, 480); }
  const rf = g.createLinearGradient(0, 0, W, 480); rf.addColorStop(0, 'rgba(255,255,255,0)'); rf.addColorStop(.38, 'rgba(255,255,255,0)'); rf.addColorStop(.42, 'rgba(255,255,255,.05)'); rf.addColorStop(.47, 'rgba(255,255,255,0)'); g.fillStyle = rf; g.fillRect(0, 0, W, 480);
}
/* ----- fond du style ----- */
function drawTrain(P, t) {
  const T = t / 1000, c = typeof CTX !== 'undefined' && CTX ? CTX : {}, s = c.s || 'clear', day = !!c.day;
  const wet = {drizzle: .35, rain: .7, pour: 1, storm: .9, hail: .6, sleet: .5}[s] || 0, sn = {snow: .6, blizzard: 1, sleet: .3}[s] || 0;
  if (!TRX.nextTun) TRX.nextTun = T + 30;
  if (T > TRX.nextTun) { TRX.tunStart = T; TRX.nextTun = T + 45 + Math.random() * 40; }
  const te = TRX.tunStart ? T - TRX.tunStart : 99, tun = te < 3.2 ? Math.min(1, te / .35, (3.2 - te) / .35) : 0;
  trainView(f, T, T * 240, {day, scene: sn ? 'snow' : 'country', cloud: /cloud|overcast|fog|rain|drizzle|pour|storm|snow|blizzard|sleet|hail/.test(s) || (c.cc > 70), rain: wet, snow: sn, fog: s === 'fog' ? .8 : 0, tunnel: tun, bob: Math.sin(T * 5.4) * .8 + (((T * .87) % 1) < .06 ? 1.2 : 0)});
}

/* ===================================================================
   La cinématique (≈ 44 s) — le billet d'or
   =================================================================== */
let trainOn = false;
function trainCinematic(apply) {
  if (trainOn) return false; trainOn = true;
  let got = null; try { got = JSON.parse(localStorage.getItem('trainGot') || 'null'); } catch (e) {}
  const now0 = new Date(), stamp = now0.toLocaleDateString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric'}).toUpperCase() + ' · ' + String(now0.getHours()).padStart(2, '0') + ':' + String(now0.getMinutes()).padStart(2, '0');
  const city = (typeof CTX !== 'undefined' && CTX && CTX.city) || '';
  const el = document.createElement('div'); el.id = 'trc';
  el.innerHTML = `<canvas width="800" height="480"></canvas>
    <div class="tr-ticket"><div class="tk-l"><small>COMPAGNIE DES TRAINS DE NUIT</small><b>BILLET D'OR</b><span>Nº 0000001</span><em>Départ : ${esc(UP(city || 'ICI'))} · Quai Nº 0</em><em class="dst">Destination : <i></i></em></div><div class="tk-r"><small>CLASSE</small><b>∞</b><small>VOITURE</small><b>1</b></div><div class="tk-hole"></div><div class="tk-stamp">COMPOSTÉ<br>${esc(stamp)}</div></div>
    <div class="tr-door l"><i></i></div><div class="tr-door r"><i></i></div><div class="tr-cap"></div><div class="tr-flash"></div>
    <div class="tr-title">${[...'LE DERNIER TRAIN'].map((c, i) => `<span style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</div>
    <div class="tr-sub"><em>Il ne passe qu'une fois sur dix millions.</em><b>BILLET Nº 0000001 · VALABLE POUR TOUJOURS${got && got.n ? ` · PRIS ×${got.n}` : ''}</b></div><div class="tr-skip">touche 2 fois pour passer</div>`;
  stage.appendChild(el); if (typeof cinFX === 'function') cinFX(el);
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), tm = [], at = (s, fn) => tm.push(setTimeout(fn, s * 1000)), T0 = performance.now(), lite = !!cfg.lite;
  const music = !PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on ? (AMB.unlock(), AMB.train()) : null;
  const $$ = s => el.querySelector(s), cap = (s, d = 3) => { const c = $$('.tr-cap'); c.classList.remove('on'); setTimeout(() => { c.innerHTML = s; c.classList.add('on'); }, 240); if (d) tm.push(setTimeout(() => c.classList.remove('on'), (d + .24) * 1000)); };
  /* 1. le billet d'or */
  at(.1, () => el.classList.add('tk'));
  at(1.2, () => { const d = $$('.dst i'); let k = 0; const w = '? ? ?'; const iv = setInterval(() => { d.textContent = w.slice(0, ++k); if (k >= w.length) clearInterval(iv); }, 90); });
  at(2.8, () => { el.classList.add('punch'); if (typeof impactFrames === 'function') impactFrames({host: el, x: 548, y: 236, theme: 'train', seq: ['a', 'b', 'c', 'b'], snd: false, r: 16}); });
  at(4, () => el.classList.add('tkout'));
  /* 2. la vapeur, le quai, le train qui arrive */
  at(5.4, () => stage.classList.add('tr-hide'));
  at(7.6, () => cap('Un train qu\'on ne voit passer qu\'une fois sur dix millions…', 3.6));
  at(12.1, () => { el.classList.add('doors'); cap('En voiture !', 1.6); });
  at(13.6, () => el.classList.add('open'));
  /* 3. le voyage */
  at(15, () => cap('Destination : là où il fait beau… ou pas.', 3.4));
  at(22.6, () => cap('Le Grand Nord, ses montagnes et ses aurores.', 3.6));
  at(29.2, () => cap('La mer, la nuit, la lune.', 3.2));
  /* 4. dernier tunnel, éclair, titre */
  at(35.2, () => { el.classList.add('flash'); if (typeof impactFrames === 'function') impactFrames({host: el, x: 400, y: 200, theme: 'train', snd: false}); });
  at(35.7, () => el.classList.add('title'));
  const AP = 42.6;
  at(AP - .9, () => el.classList.add('out'));
  at(AP, () => { if (apply && typeof apply === 'function') apply(); stage.classList.remove('tr-hide'); stage.classList.add('tr-in'); });
  const fin = () => { tm.forEach(clearTimeout); el.remove(); trainOn = false; stage.classList.remove('tr-hide', 'tr-in'); };
  at(AP + 2.4, fin);
  let last = 0;
  el.addEventListener('pointerdown', e => { e.stopPropagation(); const n = Date.now(); $$('.tr-skip').classList.add('on'); if (n - last < 450) { if (music) music.stop(); tm.forEach(clearTimeout); if (apply && typeof apply === 'function') apply(); stage.classList.remove('tr-hide'); el.classList.add('out', 'skip'); setTimeout(fin, 900); } last = n; });

  /* ----- canevas ----- */
  const cl = (a, b, x) => Math.max(0, Math.min(1, (x - a) / (b - a))), eo = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3), eIn = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x;
  const PUFF = Array.from({length: lite ? 26 : 50}, () => ({x: Math.random() * 800, d: Math.random() * 1.6, r: 60 + Math.random() * 110, v: .6 + Math.random() * .6, s: Math.random() * 6.28}));
  let dist = 0, lt = 0;
  (function frame(nw) {
    if (!el.isConnected) return; requestAnimationFrame(frame); const t = (nw - T0) / 1000, dt = Math.min(.06, t - lt); lt = t;
    try {
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, 800, 480);
      /* le quai, la nuit (5,4 → 13,6) */
      if (t > 5 && t < 13.8) {
        g.fillStyle = '#04050d'; g.fillRect(0, 0, 800, 480);
        const sky = g.createLinearGradient(0, 0, 0, 260); sky.addColorStop(0, '#03061a'); sky.addColorStop(1, '#141c3c'); g.fillStyle = sky; g.fillRect(0, 0, 800, 260);
        TRV.ST.forEach(s => { g.fillStyle = `rgba(235,235,255,${(.3 + .4 * Math.abs(Math.sin(t + s.p))).toFixed(2)})`; g.fillRect(s.x, s.y * .8, s.r, s.r); });
        /* voie et quai en perspective */
        g.fillStyle = '#0b0c14'; g.beginPath(); g.moveTo(0, 480); g.lineTo(330, 262); g.lineTo(470, 262); g.lineTo(800, 480); g.fill();
        g.fillStyle = '#16161e'; g.beginPath(); g.moveTo(0, 480); g.lineTo(330, 262); g.lineTo(350, 262); g.lineTo(150, 480); g.fill();
        g.strokeStyle = 'rgba(200,170,110,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(150, 480); g.lineTo(350, 262); g.stroke();
        g.strokeStyle = 'rgba(160,160,180,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(330, 480); g.lineTo(400, 262); g.moveTo(560, 480); g.lineTo(430, 262); g.stroke();
        /* lampadaires */
        [[90, 1], [220, .62], [292, .4], [328, .27]].forEach(([lx, k]) => { const ly = 262 + (480 - 262) * (1 - k) * .0 - 0, top = 262 - 210 * k; g.fillStyle = '#05060c'; g.fillRect(lx - 2 * k, top, 4 * k, 210 * k + 10); const hg = g.createRadialGradient(lx, top, 0, lx, top, 90 * k); hg.addColorStop(0, 'rgba(255,210,140,.75)'); hg.addColorStop(.2, 'rgba(255,190,110,.25)'); hg.addColorStop(1, 'rgba(255,170,90,0)'); g.globalCompositeOperation = 'lighter'; g.fillStyle = hg; g.fillRect(lx - 90 * k, top - 90 * k, 180 * k, 180 * k); g.globalCompositeOperation = 'source-over'; });
        /* panneau */
        g.fillStyle = '#0d1330'; g.fillRect(160, 150, 110, 34); g.strokeStyle = '#d8b46a'; g.lineWidth = 2; g.strokeRect(160, 150, 110, 34); g.fillStyle = '#f3e3bd'; g.font = '700 15px "Poiret One","DejaVu Sans",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('QUAI Nº 0', 215, 168);
        /* le train arrive : phare puis voitures éclairées */
        const ar = cl(7, 10.4, t), hx = 470 - 70 * ar, hy = 262 + 30 * eIn(ar), hr = 6 + eIn(ar) * 160;
        if (t < 10.6) { const lg = g.createRadialGradient(hx, hy, 0, hx, hy, hr); lg.addColorStop(0, 'rgba(255,250,230,1)'); lg.addColorStop(.15, 'rgba(255,235,190,.7)'); lg.addColorStop(1, 'rgba(255,220,160,0)'); g.globalCompositeOperation = 'lighter'; g.fillStyle = lg; g.fillRect(0, 0, 800, 480); g.globalCompositeOperation = 'source-over'; }
        if (t > 10.3) { const v = Math.max(0, 1 - (t - 10.3) / 1.6), off = (t - 10.3) * 900 * (1 - (t - 10.3) / 3.4); g.fillStyle = '#0a0d1e'; g.fillRect(0, 150, 800, 290); g.fillStyle = '#1a2350'; g.fillRect(0, 176, 800, 6); g.fillStyle = '#d8b46a'; g.fillRect(0, 384, 800, 3);
          for (let k = -1; k < 6; k++) { const wx = ((k * 170 - off) % 1020 + 1020) % 1020 - 120; const wg = g.createLinearGradient(wx, 200, wx, 330); wg.addColorStop(0, 'rgba(255,214,150,.95)'); wg.addColorStop(1, 'rgba(255,170,90,.75)'); g.fillStyle = wg; g.fillRect(wx, 200, 120, 130); g.fillStyle = 'rgba(30,20,10,.35)'; g.fillRect(wx + 10, 300, 40, 30); g.fillRect(wx + 70, 290, 36, 40); }
          if (v > 0) { g.fillStyle = `rgba(255,220,170,${(.25 * v).toFixed(2)})`; for (let k = 0; k < 12; k++) g.fillRect(0, 200 + k * 11, 800, 1); }
          g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, 150, 800, 290); }
      }
      /* la vapeur (3,6 → 8) */
      if (t > 3.4 && t < 9) { const a = cl(3.4, 4.6, t) * (1 - cl(7, 9, t)); PUFF.forEach(p => { const e = t - 3.4 - p.d; if (e < 0) return; const y = 520 - e * 120 * p.v, x = p.x + Math.sin(e + p.s) * 30, r = p.r * (1 + e * .35), pg = g.createRadialGradient(x, y, 0, x, y, r); pg.addColorStop(0, `rgba(235,235,240,${(.55 * a).toFixed(2)})`); pg.addColorStop(1, 'rgba(235,235,240,0)'); g.fillStyle = pg; g.fillRect(x - r, y - r, r * 2, r * 2); }); }
      /* le voyage par la fenêtre (13,6 → fin) */
      if (t > 13.4) {
        const sp = 40 + eIn(cl(13.6, 18, t)) * 400 - cl(38, 42, t) * 240; dist += sp * dt;
        const scene = t < 21.6 ? 'city' : t < 28.6 ? 'snow' : 'sea';
        const tun = Math.max(cl(19.8, 20.4, t) * (1 - cl(21.2, 21.8, t)), cl(27.7, 28.3, t) * (1 - cl(28.5, 29, t)), cl(33.8, 34.6, t) * (1 - cl(35.2, 36, t)));
        trainView(g, t, dist, {scene, day: false, rain: scene === 'city' ? .8 : 0, snow: scene === 'snow' ? .5 : 0, aurora: scene === 'snow' ? cl(22, 24, t) : 0, tunnel: tun, bob: Math.sin(t * 5.4) * 1.2 + (((t * .87) % 1) < .06 ? 1.6 : 0)});
        if (t > 35.6) { g.fillStyle = `rgba(2,3,10,${(.45 * (1 - cl(AP - .9, AP + .3, t))).toFixed(2)})`; g.fillRect(0, 0, 800, 480); }
        if (t < 14.4) { g.fillStyle = `rgba(0,0,0,${(1 - cl(13.6, 14.4, t)).toFixed(2)})`; g.fillRect(0, 0, 800, 480); }
        if (t > AP) g.globalAlpha = 1 - cl(AP, AP + 1.2, t);
        if (t > AP + 1.2) g.clearRect(0, 0, 800, 480);
      }
    } catch (x) { g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  })(T0);
  return true;
}

/* ----- Le style ----- */
Object.assign(SIG, {
  train: {name: '🚂 Le Dernier Train', icons: 'line', temp: 'text', noAstro: true, noClouds: true, amb: 'train', secret: true,
    deco: '<div class="tr-frame"></div>',
    deco2: () => { let d = ''; try { const x = JSON.parse(localStorage.getItem('trainGot') || 'null'); if (x) d = ` · PRIS LE ${new Date(x.t).toLocaleDateString('fr-FR')}${x.n > 1 ? ' · ×' + x.n : ''}`; } catch (e) {} return `<div class="tr-badge">🚂 BILLET D'OR Nº 0000001 · 1 CHANCE SUR 10 000 000${esc(d)}</div>`; },
    cin: done => trainCinematic(done),
    v: {d: {clear: ['Grand ciel dégagé derrière la vitre. Bon voyage.'], clearN: ['Nuit claire : la lune suit le train.'], partly: ['Quelques nuages filent dans l\'autre sens.'], partlyN: ['Des nuages passent devant la lune.'], cloudy: ['Ciel gris sur la campagne. On roule quand même.'], cloudnight: ['Nuit couverte. Les villages brillent au loin.'], fog: ['Brouillard : on ne voit même plus les poteaux.'], drizzle: ['Quelques gouttes glissent sur la vitre.'], rain: ['La pluie raye la vitre. On est bien au chaud.'], pour: ['Grosse averse sur la vitre ! Le train ne s\'arrête pas.'], storm: ['Orage au loin. Le contrôleur n\'a pas peur.'], hail: ['La grêle tape sur le toit du wagon !'], snow: ['Il neige sur les rails. Paysage de carte postale.'], blizzard: ['Tempête de neige : le train fend la poudreuse.'], wind: ['Le vent pousse le train. Ou l\'inverse.'], heat: ['Grosse chaleur. Heureusement, le wagon est climatisé.'], frost: ['Givre sur la vitre ce matin.'], rainbow: ['Un arc-en-ciel au-dessus des rails !']},
      kick: c => `🚂 LE DERNIER TRAIN · ${UP(c.city)} · VOITURE 1`, hl: c => `MAX ${c.mx}° · MIN ${c.mn}°`, mt: c => `Ressenti ${c.fe}° · Humidité ${c.hu} % · Vent ${c.wi} km/h`, day: D3, hr: (h, n) => n ? pad2(h) + 'h' : 'DÉPART'}}
});
const TRQ = ['Tchou tchou !', 'Prochain arrêt : nulle part.', 'Billet Nº 0000001, merci.', 'Le contrôleur vous salue.', 'Ce train ne passe qu\'une fois sur dix millions.'];
stage.addEventListener('pointerdown', e => {
  if (HT.id !== 'train') return; const s = stage.getBoundingClientRect(), k = s.width / 800, y = (e.clientY - s.top) / k;
  if (y > 360 || Math.random() < .3) { TRX.tunStart = performance.now() / 1000; if (typeof toast === 'function') toast(TRQ[Math.random() * TRQ.length | 0]); if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on) AMB.one('whistle'); }
});
EGGS.traincin = () => trainCinematic(HT.id === 'train');
