
/* ===================================================================
   ✺ GENÈSE — le style le plus rare de tous (1 chance sur 1 000 000)
   L'histoire de l'univers, du Big Bang jusqu'à la météo d'aujourd'hui.
   =================================================================== */
function genPos() { const l = stage.dataset.lay; return l === 'center' ? [400, 190] : l === 'left-row' ? [560, 190] : l === 'right-row' ? [240, 190] : l === 'right' ? [470, 200] : [380, 205]; }
/* ----- la galaxie, pré-dessinée une fois ----- */
let GALX = null;
function galaxy() {
  if (GALX) return GALX;
  const S = 640, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), R = srnd(1977), gs = () => (R() + R() + R() - 1.5) / 1.5;
  g.translate(S / 2, S / 2);
  const halo = g.createRadialGradient(0, 0, 0, 0, 0, 310); halo.addColorStop(0, 'rgba(255,225,170,.35)'); halo.addColorStop(.25, 'rgba(200,170,255,.10)'); halo.addColorStop(1, 'rgba(60,60,140,0)'); g.fillStyle = halo; g.fillRect(-320, -320, 640, 640);
  g.globalCompositeOperation = 'lighter';
  const N = cfg.lite ? 5000 : 12000, ARMS = 2, K = 3.1;
  /* disque diffus (étoiles entre les bras) */
  for (let i = 0; i < N * .45; i++) { const r = -Math.log(1 - R() * .97) * 70, th = R() * 6.2832, x = Math.cos(th) * r, y = Math.sin(th) * r; if (r > 310) continue; const w = r < 60; g.fillStyle = w ? `rgba(255,228,190,${(.2 + R() * .4).toFixed(2)})` : `rgba(220,225,255,${(.12 + R() * .3).toFixed(2)})`; const sz = .5 + R() * .9; g.fillRect(x, y, sz, sz); }
  for (let i = 0; i < N; i++) {
    const arm = i % ARMS, f = Math.pow(R(), .62), r = 14 + f * 292 + gs() * 16, th = arm * Math.PI + Math.log(r / 14) * K / 2.2 + gs() * (.62 - f * .22), x = Math.cos(th) * r, y = Math.sin(th) * r;
    const col = f < .18 ? [255, 222, 170] : f < .45 ? (R() < .5 ? [255, 244, 225] : [210, 220, 255]) : (R() < .75 ? [150, 185, 255] : [255, 250, 245]);
    const a = (.25 + R() * .6) * (1 - f * .35), s = .5 + R() * (f < .2 ? 1.6 : 1.1);
    g.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a.toFixed(2)})`; g.fillRect(x, y, s, s);
    if (f > .3 && R() < .007) { const rr = 3 + R() * 7, hg = g.createRadialGradient(x, y, 0, x, y, rr); hg.addColorStop(0, 'rgba(255,130,190,.38)'); hg.addColorStop(1, 'rgba(255,90,170,0)'); g.fillStyle = hg; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }   // nébuleuses roses
    if (R() < .06) { const rr = 12 + R() * 26, hg = g.createRadialGradient(x, y, 0, x, y, rr); hg.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},.06)`); hg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = hg; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  }
  /* bandes de poussière sombre le long des bras */
  g.globalCompositeOperation = 'source-over';
  for (let i = 0; i < (cfg.lite ? 900 : 1800); i++) { const arm = i % ARMS, f = .12 + Math.pow(R(), .8) * .7, r = 14 + f * 292, th = arm * Math.PI + Math.log(r / 14) * K / 2.2 - .2 + gs() * .12, x = Math.cos(th) * r, y = Math.sin(th) * r, rr = 3 + R() * 7; g.fillStyle = `rgba(8,4,16,${(.08 + R() * .1).toFixed(2)})`; g.beginPath(); g.arc(x, y, rr, 0, 6.2832); g.fill(); }
  g.globalCompositeOperation = 'lighter';
  const core = g.createRadialGradient(0, 0, 0, 0, 0, 70); core.addColorStop(0, 'rgba(255,255,240,1)'); core.addColorStop(.18, 'rgba(255,236,190,.8)'); core.addColorStop(.5, 'rgba(255,190,120,.25)'); core.addColorStop(1, 'rgba(255,160,90,0)'); g.fillStyle = core; g.fillRect(-70, -70, 140, 140);
  return GALX = c;
}
function drawGalaxy(g, x, y, sc, rot, tilt, al = 1, tw = -.32) {
  if (al <= 0 || sc <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, al); g.translate(x, y); g.rotate(tw); g.scale(sc, sc * tilt); g.rotate(rot); g.drawImage(galaxy(), -320, -320); g.restore();
}
/* ----- fond du style ----- */
let GNX = {shoot: null, next: 0, pulse: 0};
function drawGen(P, t) {
  const [cx, cy] = genPos();
  P.forEach((p, i) => { const a = .25 + .55 * Math.abs(Math.sin(t / (1400 + p.k * 1600) + p.p)); f.fillStyle = i % 9 ? `rgba(235,235,255,${a.toFixed(2)})` : `rgba(255,220,170,${a.toFixed(2)})`; f.fillRect(p.x, p.y, p.r * .8, p.r * .8); });
  const pu = GNX.pulse ? Math.max(0, 1 - (t - GNX.pulse) / 2500) : 0;
  drawGalaxy(f, cx, cy, .66 + Math.sin(t / 9000) * .01 + pu * .05, -t / 70000, .42, .82 + pu * .3);
  if (!GNX.next) GNX.next = t + 9000;
  if (t > GNX.next) { const a = .3 + Math.random() * .5; GNX.shoot = {t, x: 100 + Math.random() * 600, y: 20 + Math.random() * 140, a}; GNX.next = t + 14000 + Math.random() * 16000; }
  if (GNX.shoot) { const s = GNX.shoot, e = (t - s.t) / 900; if (e > 1) GNX.shoot = null; else { const x = s.x + Math.cos(s.a) * e * 260, y = s.y + Math.sin(s.a) * e * 260, gr = f.createLinearGradient(x, y, x - Math.cos(s.a) * 90, y - Math.sin(s.a) * 90); gr.addColorStop(0, `rgba(255,250,235,${(1 - e) * .9})`); gr.addColorStop(1, 'rgba(255,250,235,0)'); f.strokeStyle = gr; f.lineWidth = 1.6; f.beginPath(); f.moveTo(x, y); f.lineTo(x - Math.cos(s.a) * 90, y - Math.sin(s.a) * 90); f.stroke(); } }
}

/* ===================================================================
   La cinématique (≈ 70 s) — 13,8 milliards d'années en une minute
   =================================================================== */
/* texture du rayonnement fossile (taches bleues / orange) */
function cmbTex() { const W = 160, H = 96, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), d = g.createImageData(W, H), R = srnd(380), oct = [];
  for (let o = 0; o < 5; o++) { const n = 6 << o, grid = Array.from({length: (n + 1) * (n + 1)}, () => R()); oct.push([n, grid]); }
  const val = (x, y) => { let v = 0, amp = 1, tot = 0; oct.forEach(([n, gr]) => { const fx = x * n, fy = y * n, ix = Math.min(n - 1, fx | 0), iy = Math.min(n - 1, fy | 0), u = fx - ix, w = fy - iy, s = q => q * q * (3 - 2 * q), a = gr[iy * (n + 1) + ix], b = gr[iy * (n + 1) + ix + 1], cc = gr[(iy + 1) * (n + 1) + ix], dd = gr[(iy + 1) * (n + 1) + ix + 1]; v += amp * (a + (b - a) * s(u) + (cc - a) * s(w) + (a - b - cc + dd) * s(u) * s(w)); tot += amp; amp *= .55; }); return v / tot; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = Math.max(0, Math.min(1, (val(x / W, y / H) - .5) * 2.4 + .5)), i = (y * W + x) * 4, A = [20, 60, 200], B = [250, 240, 200], Cc = [240, 110, 30], col = v < .5 ? A.map((q, k) => q + (B[k] - q) * v * 2) : B.map((q, k) => q + (Cc[k] - q) * (v - .5) * 2); d.data[i] = col[0]; d.data[i + 1] = col[1]; d.data[i + 2] = col[2]; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0); return c; }
/* texture de la Terre (équirectangulaire, procédurale) */
function earthTex() { const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), d = g.createImageData(W, H), R = srnd(4600), oct = [];
  for (let o = 0; o < 6; o++) { const n = 4 << o, grid = Array.from({length: (n + 1) * (n + 1)}, () => R()); oct.push([n, grid]); }
  const val = (x, y) => { let v = 0, amp = 1, tot = 0; oct.forEach(([n, gr]) => { const fx = x * n, fy = y * n, ix = Math.min(n - 1, fx | 0), iy = Math.min(n - 1, fy | 0), u = fx - ix, w = fy - iy, s = q => q * q * (3 - 2 * q), xi1 = (ix + 1) % n, a = gr[iy * (n + 1) + ix], b = gr[iy * (n + 1) + xi1], cc = gr[(iy + 1) * (n + 1) + ix], dd = gr[(iy + 1) * (n + 1) + xi1]; v += amp * (a + (b - a) * s(u) + (cc - a) * s(w) + (a - b - cc + dd) * s(u) * s(w)); tot += amp; amp *= .5; }); return v / tot; };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const lat = Math.abs(y / H - .5) * 2, v = val(x / W, y / H), i = (y * W + x) * 4; let col;
    if (lat > .86) col = [240, 246, 255]; else if (v > .53) { const h = (v - .53) * 4; col = lat > .6 ? [150, 150, 130] : h > .5 ? [150, 120, 80] : [60 + h * 90, 120 - h * 20, 50]; } else { const dp = (.53 - v) * 3; col = [10, 50 + 40 * (1 - dp), 120 + 70 * (1 - dp)]; }
    d.data[i] = col[0]; d.data[i + 1] = col[1]; d.data[i + 2] = col[2]; d.data[i + 3] = 255; }
  g.putImageData(d, 0, 0);
  /* nuages */
  /* nuages : amas de bouffées douces, quelques spirales de dépression */
  const puff = (x, y, rr, a) => { [0, -W, W].forEach(dx => { const cg = g.createRadialGradient(x + dx, y, 0, x + dx, y, rr); cg.addColorStop(0, `rgba(255,255,255,${a})`); cg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = cg; g.beginPath(); g.ellipse(x + dx, y, rr * 1.8, rr, 0, 0, 6.2832); g.fill(); }); };
  for (let k = 0; k < 70; k++) { let x = R() * W, y = H * (.1 + R() * .8); const n = 4 + R() * 10 | 0, sz = 3 + R() * 7; for (let q = 0; q < n; q++) { puff(x, y, sz * (.6 + R() * .8), .28 + R() * .25); x += (R() - .3) * sz * 2.2; y += (R() - .5) * sz * .9; } }
  for (let k = 0; k < 4; k++) { const cx = R() * W, cy = H * (.25 + R() * .5); for (let q = 0; q < 26; q++) { const a = q * .45, rr = 2 + q * .9; puff(cx + Math.cos(a) * rr * 1.6, cy + Math.sin(a) * rr * .8, 3 + q * .12, .3); } }
  return c; }
let EARTH = null;
function drawEarth(g, x, y, r, t, al = 1) {
  if (r < 1 || al <= 0) return;
  if (!EARTH) { const T = earthTex(), N = cfg.lite ? 140 : 200, c = document.createElement('canvas'); c.width = c.height = N; EARTH = {src: T.getContext('2d').getImageData(0, 0, 512, 256).data, c, g: c.getContext('2d'), N, img: null, last: -1}; EARTH.img = EARTH.g.createImageData(N, N); }
  const E = EARTH, N = E.N, rot = t * .09, sx = -.78, sy = -.3, sz = .55, D = E.img.data, S = E.src;
  if (Math.abs(rot - E.last) > .004) { E.last = rot;
    for (let j = 0; j < N; j++) { const ny = (j + .5) / N * 2 - 1; for (let i = 0; i < N; i++) { const nx = (i + .5) / N * 2 - 1, q = nx * nx + ny * ny, o = (j * N + i) * 4; if (q > 1) { D[o + 3] = 0; continue; } const nz = Math.sqrt(1 - q), lat = Math.asin(-ny), lon = Math.atan2(nx, nz) + rot, u = ((lon / 6.2832 % 1) + 1) % 1, v = .5 - lat / Math.PI, p = ((v * 255 | 0) * 512 + (u * 511 | 0)) * 4, l = Math.max(0, nx * sx + ny * sy + nz * sz), sh = .12 + .95 * Math.pow(l, .8), rim = Math.pow(1 - nz, 3) * .5;
      D[o] = Math.min(255, S[p] * sh + 60 * rim); D[o + 1] = Math.min(255, S[p + 1] * sh + 110 * rim); D[o + 2] = Math.min(255, S[p + 2] * sh + 200 * rim); D[o + 3] = 255;
      if (l < .03 && S[p + 1] > S[p + 2] && S[p] < 200 && ((Math.imul(p, 2654435761) >>> 0) % 41 === 0)) { D[o] = 255; D[o + 1] = 210; D[o + 2] = 120; } } }   // lumières des villes côté nuit
    E.g.putImageData(E.img, 0, 0); }
  g.save(); g.globalAlpha = al;
  const atm = g.createRadialGradient(x, y, r * .96, x, y, r * 1.2); atm.addColorStop(0, 'rgba(120,180,255,.6)'); atm.addColorStop(1, 'rgba(60,120,255,0)'); g.fillStyle = atm; g.beginPath(); g.arc(x, y, r * 1.2, 0, 6.2832); g.fill();
  g.imageSmoothingEnabled = true; try { g.imageSmoothingQuality = 'high'; } catch (e) {} g.drawImage(E.c, x - r, y - r, r * 2, r * 2);
  g.restore();
}
let genOn = false;
function genCinematic(apply) {
  if (genOn) return false; genOn = true;
  let got = null; try { got = JSON.parse(localStorage.getItem('genGot') || 'null'); } catch (e) {}
  const city = (CTX && CTX.city) || (typeof shortCity === 'function' ? shortCity() : '') || 'ici', temp = CTX && CTX.T != null ? CTX.T : null;
  const el = document.createElement('div'); el.id = 'gnc';
  el.innerHTML = `<canvas width="800" height="480"></canvas><div class="gn-snap"></div><div class="gn-year"></div><div class="gn-q"></div><div class="gn-cap"></div><div class="gn-pin"><i></i><b>${esc(UP(city))}</b></div><div class="gn-white"></div>
    <div class="gn-title">${[...'GENÈSE'].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</div>
    <div class="gn-sub"><em>13,8 milliards d'années pour arriver jusqu'ici.</em><b>${esc(UP(city))} · AUJOURD'HUI${temp != null ? ` · ${temp}°` : ''}</b><span>STYLE SECRET DÉBLOQUÉ · 1 CHANCE SUR 1 000 000${got && got.n ? ` · OBTENU ×${got.n}` : ''}</span></div><div class="gn-skip">touche 2 fois pour passer</div>`;
  stage.appendChild(el); if (typeof cinFX === 'function') cinFX(el);
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), tm = [], at = (s, fn) => tm.push(setTimeout(fn, s * 1000)), T0 = performance.now(), lite = !!cfg.lite;
  /* les premières étoiles : moments fixes, partagés avec la musique */
  const RS = srnd(7), STARS = Array.from({length: 34}, (_, i) => ({t: 22.3 + Math.pow(i / 34, 1.25) * 7.2 + RS() * .2, x: 60 + RS() * 680, y: 40 + RS() * 380, r: .8 + RS() * 1.8, c: RS()}));
  const music = !PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on ? (AMB.unlock(), AMB.gen(STARS.slice(0, 18).map(s => s.t))) : null;
  const $$ = s => el.querySelector(s), cap = (s, d = 3.2) => { const c = $$('.gn-cap'); c.classList.remove('on'); setTimeout(() => { c.innerHTML = s; c.classList.add('on'); }, 260); if (d) tm.push(setTimeout(() => c.classList.remove('on'), (d + .26) * 1000)); };
  /* 0. on rembobine : l'écran actuel se replie en un point, les années défilent à l'envers */
  const snapEl = $$('.gn-snap'), keep = ['ovb', 'deco', 'under', 'v1', 'v2', 'v3', 'deco2', 'eggs', 'fest', 'tick', 'shelf', 'fx'];
  [...stage.children].filter(e => e !== el && (e.classList.contains('bg') || e.tagName === 'HEADER' || keep.includes(e.id))).forEach(e => { if (getComputedStyle(e).display === 'none') return; const k = e.cloneNode(true); if (e.tagName === 'CANVAS') { try { k.getContext('2d').drawImage(e, 0, 0); } catch (x) {} } snapEl.appendChild(k); });
  at(.15, () => { stage.classList.add('gn-hide'); el.classList.add('rew'); $$('.gn-q').textContent = '… et si on rembobinait l\'univers ?'; });
  const Y = $$('.gn-year'), YRS = [[1.3, String(new Date().getFullYear())], [1.85, '1492'], [2.3, '− 3 000'], [2.7, '− 66 000 000'], [3.05, '− 4 600 000 000'], [3.4, '− 13 800 000 000']];
  YRS.forEach(([s, v]) => at(s, () => { Y.textContent = v; Y.classList.remove('tk'); void Y.offsetWidth; Y.classList.add('tk'); }));
  at(4.2, () => { el.classList.add('void'); Y.classList.add('gone'); $$('.gn-q').classList.add('gone'); });
  at(5.1, () => cap('Avant le début, il n\'y avait rien.', 2.4));
  /* 1. BIG BANG */
  at(8, () => { el.classList.add('bang'); if (typeof impactFrames === 'function') impactFrames({host: el, x: 400, y: 240, snd: false, theme: 'gen', seq: ['a', 'b', 'a', 'c', 'b', 'a', 'b'], lines: 90, r0: 10, r: 26}); });
  at(8.9, () => cap('<i>t = 0</i> · le Big Bang', 2));
  at(11.1, () => cap('l\'univers se dilate, brûlant, aveuglant…', 1.9));
  at(13.4, () => cap('<i>380 000 ans</i> · la lumière s\'échappe enfin', 3));
  at(18.2, () => cap('les âges sombres', 2.6));
  at(22.3, () => cap('<i>200 millions d\'années</i> · les premières étoiles s\'allument', 4.6));
  at(30.6, () => cap('<i>1 milliard d\'années</i> · naissance des galaxies', 5));
  at(42.4, () => cap('<i>9 milliards d\'années</i> · une étoile ordinaire… notre Soleil', 4));
  at(47.4, () => cap('… et une petite planète bleue', 4));
  at(53.6, () => cap('<i>4,5 milliards d\'années plus tard</i>', 2.6));
  at(56.8, () => { el.classList.add('pin'); });
  at(57.6, () => cap('ici. maintenant.', 1.9));
  /* 2. arrivée : impact + titre */
  at(59.7, () => { el.classList.add('arrive'); if (typeof impactFrames === 'function') impactFrames({host: el, x: 400, y: 240, snd: false, theme: 'gen'}); });
  at(60.2, () => el.classList.add('title'));
  const AP = 67.2;
  at(AP - 1, () => el.classList.add('out'));
  at(AP, () => { if (apply && typeof apply === 'function') apply(); stage.classList.remove('gn-hide'); stage.classList.add('gn-in'); });
  const fin = () => { tm.forEach(clearTimeout); el.remove(); genOn = false; stage.classList.remove('gn-hide', 'gn-in'); GNX.pulse = performance.now(); };
  at(AP + 2.8, fin);
  let last = 0;
  el.addEventListener('pointerdown', e => { e.stopPropagation(); const n = Date.now(); $$('.gn-skip').classList.add('on'); if (n - last < 450) { if (music) music.stop(); tm.forEach(clearTimeout); if (apply && typeof apply === 'function') apply(); stage.classList.remove('gn-hide'); el.classList.add('out', 'skip'); setTimeout(fin, 900); } last = n; });

  /* ----- canevas ----- */
  const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, eo = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3), cl = (a, b, x) => Math.max(0, Math.min(1, (x - a) / (b - a)));
  const PL = Array.from({length: lite ? 160 : 360}, () => ({a: Math.random() * 6.283, v: .4 + Math.random() * 1.6, s: 20 + Math.random() * 80, o: Math.random()}));
  const GAS = Array.from({length: 26}, () => ({x: Math.random() * 800, y: Math.random() * 480, r: 60 + Math.random() * 140, p: Math.random() * 6.28}));
  const SW = Array.from({length: lite ? 260 : 600}, () => { const arm = Math.random() < .5 ? 0 : Math.PI, f = Math.pow(Math.random(), .7); return {arm, f, th0: Math.random() * 6.283, r0: 300 + Math.random() * 300, c: Math.random()}; });
  const BG = Array.from({length: 220}, () => ({x: Math.random() * 800, y: Math.random() * 480, r: Math.random() * 1.3 + .3, p: Math.random() * 6.28}));
  const DISK = Array.from({length: lite ? 200 : 420}, () => ({a: Math.random() * 6.283, d: 30 + Math.pow(Math.random(), .6) * 150, s: Math.random() * 1.6 + .4}));
  let CMB = null;
  const stars = (al, t, zoom = 1) => BG.forEach(s => { const x = 400 + (s.x - 400) * zoom, y = 240 + (s.y - 240) * zoom; if (x < 0 || x > 800 || y < 0 || y > 480) return; g.fillStyle = `rgba(235,235,255,${(al * (.3 + .4 * Math.abs(Math.sin(t * 1.3 + s.p)))).toFixed(2)})`; g.fillRect(x, y, s.r, s.r); });
  (function frame(now) {
    if (!el.isConnected) return; requestAnimationFrame(frame); const t = (now - T0) / 1000;
    try {
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, 800, 480);
      if (t < 4.2) {   // rembobinage : lignes de lumière qui convergent vers le point
        const q = cl(1.2, 4.2, t); g.fillStyle = `rgba(2,2,8,${(q * .9).toFixed(2)})`; g.fillRect(0, 0, 800, 480);
        g.globalCompositeOperation = 'lighter'; PL.forEach(p => { const d = (1 - ((t * p.v * .5 + p.o) % 1)) * 520 * (1 - q * .6), l = p.s * (.4 + q); g.strokeStyle = `rgba(200,210,255,${(.08 + q * .3).toFixed(2)})`; g.lineWidth = 1; g.beginPath(); g.moveTo(400 + Math.cos(p.a) * d, 240 + Math.sin(p.a) * d); g.lineTo(400 + Math.cos(p.a) * (d + l), 240 + Math.sin(p.a) * (d + l)); g.stroke(); });
        return;
      }
      g.fillStyle = '#010104'; g.fillRect(0, 0, 800, 480);
      /* le point, avant tout */
      if (t < 8) { const sw = 1 + cl(6, 8, t) * 2.5, j = cl(6.6, 8, t) * 3, x = 400 + (Math.random() - .5) * j, y = 240 + (Math.random() - .5) * j, pr = (3 + Math.sin(t * 5) * .8) * sw, pg = g.createRadialGradient(x, y, 0, x, y, pr * 5); pg.addColorStop(0, '#fff'); pg.addColorStop(.3, 'rgba(255,240,220,.6)'); pg.addColorStop(1, 'rgba(255,220,200,0)'); g.globalCompositeOperation = 'lighter'; g.fillStyle = pg; g.fillRect(x - pr * 5, y - pr * 5, pr * 10, pr * 10); return; }
      g.globalCompositeOperation = 'lighter';
      /* Big Bang → plasma qui se refroidit (8 → 15) */
      if (t < 15.5) { const e = t - 8, R = 30 + eo(Math.min(1, e / 2.4)) * 900, heat = Math.max(0, 1 - e / 5.5), fade = 1 - cl(12.6, 15.5, t);
        const pg = g.createRadialGradient(400, 240, 0, 400, 240, R); pg.addColorStop(0, `rgba(255,255,255,${(heat * fade).toFixed(2)})`); pg.addColorStop(.25, `rgba(255,${(220 * heat + 120 * (1 - heat)) | 0},${(160 * heat + 40) | 0},${(.9 * fade).toFixed(2)})`); pg.addColorStop(.6, `rgba(${(255 - 60 * (1 - heat)) | 0},${(110 * heat + 30) | 0},${(60 * heat + 20) | 0},${(.6 * fade).toFixed(2)})`); pg.addColorStop(1, 'rgba(120,20,30,0)'); g.fillStyle = pg; g.fillRect(0, 0, 800, 480);
        PL.forEach(p => { const d = e * p.v * 160 * (1 - e * .04), x = 400 + Math.cos(p.a) * d, y = 240 + Math.sin(p.a) * d * .85; if (x < -50 || x > 850 || y < -50 || y > 530) return; const r = 6 + p.s * .5 * (1 + e * .3), bg = g.createRadialGradient(x, y, 0, x, y, r); bg.addColorStop(0, `rgba(255,${(150 + heat * 100) | 0},${(80 + heat * 150) | 0},${(.12 * fade).toFixed(3)})`); bg.addColorStop(1, 'rgba(255,100,60,0)'); g.fillStyle = bg; g.fillRect(x - r, y - r, r * 2, r * 2); });
      }
      /* rayonnement fossile (13 → 18,5) */
      if (t > 12.8 && t < 18.6) { if (!CMB) CMB = cmbTex(); const a = cl(12.8, 14.2, t) * (1 - cl(17, 18.6, t)); g.save(); g.globalCompositeOperation = 'source-over'; g.globalAlpha = a; g.beginPath(); g.ellipse(400, 236, 330, 165, 0, 0, 6.2832); g.clip(); g.imageSmoothingEnabled = true; const dr = (t - 12.8) * 4; g.drawImage(CMB, 70 - dr, 71 - dr * .5, 660 + dr * 2, 330 + dr); g.restore(); g.save(); g.globalAlpha = a * .8; g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1; g.beginPath(); g.ellipse(400, 236, 330, 165, 0, 0, 6.2832); g.stroke(); g.restore(); }
      /* âges sombres : gaz gris qui se rassemble (17 → 24) */
      if (t > 17 && t < 26) { const a = cl(17, 19, t) * (1 - cl(23, 26, t)); GAS.forEach(p => { const x = p.x + Math.sin(t * .3 + p.p) * 20, y = p.y + Math.cos(t * .25 + p.p) * 14, bg = g.createRadialGradient(x, y, 0, x, y, p.r); bg.addColorStop(0, `rgba(90,90,130,${(.07 * a).toFixed(3)})`); bg.addColorStop(1, 'rgba(40,40,70,0)'); g.fillStyle = bg; g.fillRect(x - p.r, y - p.r, p.r * 2, p.r * 2); }); }
      /* premières étoiles (22 → 31) */
      if (t > 22 && t < 33) { const fa = 1 - cl(30, 33, t), z = 1 + cl(26, 33, t) * .6;
        STARS.forEach(s => { const e = t - s.t; if (e < 0) return; const x = 400 + (s.x - 400) * z, y = 240 + (s.y - 240) * z, col = s.c < .3 ? '170,200,255' : s.c < .7 ? '255,250,235' : '255,210,150', fl = Math.max(0, 1 - e * 1.6);
          if (fl > 0) { g.strokeStyle = `rgba(${col},${(fl * .6).toFixed(2)})`; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, 4 + (1 - fl) * 40, 0, 6.2832); g.stroke(); g.strokeStyle = `rgba(${col},${(fl * .9).toFixed(2)})`; g.beginPath(); g.moveTo(x - 26 * fl - 4, y); g.lineTo(x + 26 * fl + 4, y); g.moveTo(x, y - 20 * fl - 4); g.lineTo(x, y + 20 * fl + 4); g.stroke(); }
          const r = s.r * (1.4 + fl * 3), pg = g.createRadialGradient(x, y, 0, x, y, r * 4); pg.addColorStop(0, `rgba(255,255,255,${fa.toFixed(2)})`); pg.addColorStop(.3, `rgba(${col},${(.5 * fa).toFixed(2)})`); pg.addColorStop(1, `rgba(${col},0)`); g.fillStyle = pg; g.fillRect(x - r * 4, y - r * 4, r * 8, r * 8); }); }
      /* galaxies (30 → 46) : la matière tourbillonne et dessine les bras */
      if (t > 29.5 && t < 47) {
        const fin2 = cl(41.6, 46, t), zoom = 1 + Math.pow(fin2, 2.4) * 9, gx = 400 - 120 * ease(fin2) * zoom * .2, gy = 240 + 40 * ease(fin2) * zoom * .2;
        stars(cl(29.5, 32, t) * (1 - fin2), t, 1 + fin2 * 2);
        const form = eo(cl(30, 38, t)), rot = -t * .05 - (1 - form) * 3, tilt = 1 - ease(cl(34, 41, t)) * .56;
        const sc = (.35 + form * .5) * zoom;
        drawGalaxy(g, gx, gy, sc, rot, tilt, form * (1 - cl(44.5, 46.5, t)), -.25 * ease(cl(34, 41, t)));
        if (t < 39) SW.forEach(p => { const k = cl(29.8, 37.5, t), r = p.r0 * (1 - k) + (14 + p.f * 292) * k, th = p.arm + Math.log(Math.max(14, r) / 14) * 3.1 / 2.2 + p.th0 * (1 - k) + rot, x = Math.cos(th) * r * sc, y = Math.sin(th) * r * sc * tilt, al = (1 - cl(36, 39, t)) * .7; g.fillStyle = p.c < .5 ? `rgba(200,215,255,${al.toFixed(2)})` : `rgba(255,236,200,${al.toFixed(2)})`; g.fillRect(gx + x, gy + y, 1.3, 1.3); });
      }
      /* le Soleil et son disque (43,5 → 52) */
      if (t > 43.5 && t < 53.5) {
        const a = cl(43.5, 45.5, t), out = cl(51, 53.5, t), sx = 400 - ease(cl(47, 51, t)) * 230, sy = 240, R = 18 + a * 10;
        stars(a * .6 * (1 - out), t, 1);
        const sg = g.createRadialGradient(sx, sy, 0, sx, sy, R * 5); sg.addColorStop(0, `rgba(255,255,240,${a})`); sg.addColorStop(.18, `rgba(255,220,140,${(.9 * a).toFixed(2)})`); sg.addColorStop(.5, `rgba(255,170,60,${(.25 * a).toFixed(2)})`); sg.addColorStop(1, 'rgba(255,140,40,0)'); g.fillStyle = sg; g.fillRect(sx - R * 5, sy - R * 5, R * 10, R * 10);
        const cond = cl(45, 49, t);   // le disque de poussière se condense en planètes
        DISK.forEach(p => { const ang = p.a + t * (40 / p.d) * .4, x = sx + Math.cos(ang) * p.d, y = sy + Math.sin(ang) * p.d * .3; g.fillStyle = `rgba(255,200,150,${((1 - cond) * .5 * a).toFixed(2)})`; g.fillRect(x, y, p.s, p.s); });
        const PLN = [[52, '200,180,160', 2.2, 4.1], [78, '240,200,140', 3, 1.6], [110, '90,160,255', 3.4, 1], [150, '230,120,80', 2.6, .53], [230, '220,190,150', 6, .084]];
        PLN.forEach(([d, col, r, w], i) => { g.strokeStyle = `rgba(255,255,255,${(.13 * cond * (1 - out)).toFixed(2)})`; g.lineWidth = 1; g.beginPath(); g.ellipse(sx, sy, d * (1 + ease(cl(47, 51, t)) * .8), d * .3 * (1 + ease(cl(47, 51, t)) * .8), 0, 0, 6.2832); g.stroke();
          const ang = t * w * .9 + i, dd = d * (1 + ease(cl(47, 51, t)) * .8), x = sx + Math.cos(ang) * dd, y = sy + Math.sin(ang) * dd * .3; g.fillStyle = `rgba(${col},${(cond * (1 - out)).toFixed(2)})`; g.beginPath(); g.arc(x, y, r * (i === 2 ? 1 + ease(cl(48, 51, t)) * .6 : 1), 0, 6.2832); g.fill();
          if (i === 2 && t > 47.4) { g.strokeStyle = `rgba(140,200,255,${(.8 * (1 - out) * (.6 + .4 * Math.sin(t * 5))).toFixed(2)})`; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, 9, 0, 6.2832); g.stroke(); } });
      }
      /* la Terre (51 → 60) */
      if (t > 51 && t < 61) {
        const a = cl(51, 53, t), zin = ease(cl(51, 55, t)), zz = ease(cl(58, 59.8, t)), R = 20 + zin * 130 + zz * 900, ex = 400 + zz * 120, ey = 240 + zz * 200;
        stars(a * (1 - zz), t, 1); g.globalCompositeOperation = 'source-over';
        drawEarth(g, ex, ey, R, t, a);
        const pin = el.querySelector('.gn-pin'); if (t > 56.8) { pin.style.left = (ex - R * .32).toFixed(0) + 'px'; pin.style.top = (ey - R * .38).toFixed(0) + 'px'; }
      }
      /* titre : la galaxie revient, majestueuse (60 → fin) */
      if (t > 59.7) { const a = cl(59.8, 61.5, t) * (1 - cl(AP - 1, AP + .6, t)); stars(a, t, 1); drawGalaxy(g, 400, 168, .62, -t * .02, .4, a, -.3); if (t > AP) g.clearRect(0, 0, 800, 480); }
    } catch (x) { g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  })(T0);
  return true;
}

/* ----- Le style ----- */
Object.assign(SIG, {
  gen: {name: '✺ Genèse', icons: 'line', temp: 'text', noAstro: true, noClouds: true, amb: 'gen', secret: true,
    deco2: () => { let d = ''; try { const x = JSON.parse(localStorage.getItem('genGot') || 'null'); if (x) d = ` · obtenu le ${new Date(x.t).toLocaleDateString('fr-FR')}${x.n > 1 ? ' · ×' + x.n : ''}`; } catch (e) {} return `<div class="gn-badge">✺ OBJET SECRET · 1 SUR 1 000 000${esc(d)} ✺</div>`; },
    cin: done => genCinematic(done),
    v: {d: {clear: ['Ciel limpide. 13,8 milliards d\'années pour en arriver là.'], clearN: ['Nuit claire : regarde, c\'est notre galaxie.'], partly: ['Quelques nuages devant les étoiles.'], partlyN: ['Des nuages passent devant la Voie lactée.'], cloudy: ['Ciel couvert, mais l\'univers est toujours là-haut.'], cloudnight: ['Nuit couverte. Les étoiles attendent.'], fog: ['Brouillard : comme l\'univers avant la lumière.'], drizzle: ['Une bruine fine, venue de très loin.'], rain: ['Il pleut : de l\'eau plus vieille que le Soleil.'], pour: ['Averse ! Des océans qui reviennent du ciel.'], storm: ['Orage : un petit Big Bang au-dessus de nous.'], hail: ['Grêle : des petits astéroïdes de glace.'], snow: ['Il neige : chaque flocon est unique, comme chaque étoile.'], blizzard: ['Tempête blanche : une nébuleuse en bas de chez toi.'], wind: ['Le vent souffle, comme un vent solaire.'], heat: ['Grosse chaleur : merci le Soleil. Hydrate-toi !'], frost: ['Gel ce matin : le froid de l\'espace s\'invite.'], rainbow: ['Un arc-en-ciel : la lumière des étoiles, dépliée.']},
      kick: c => `✺ GENÈSE · ${UP(c.city)} · T + 13,8 Ga`, hl: c => `MAX ${c.mx}° · MIN ${c.mn}°`, mt: c => `Ressenti ${c.fe}° · Humidité ${c.hu} % · Vent ${c.wi} km/h`, day: D3, hr: (h, n) => n ? pad2(h) + 'h' : 'MAINT.'}}
});
const GNQ = ['Tu es fait de poussière d\'étoiles.', 'Cette galaxie compte 200 milliards d\'étoiles.', 'La lumière de ce ciel a voyagé des milliers d\'années.', '13,8 milliards d\'années… et te voilà.', 'Tout a commencé par un point.'];
stage.addEventListener('pointerdown', e => {
  if (HT.id !== 'gen') return; const s = stage.getBoundingClientRect(), k = s.width / 800, x = (e.clientX - s.left) / k, y = (e.clientY - s.top) / k, [cx, cy] = genPos();
  if (Math.hypot(x - cx, (y - cy) * 2) < 200) { GNX.pulse = performance.now(); if (typeof toast === 'function') toast(GNQ[Math.random() * GNQ.length | 0]); if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on) AMB.one('chime'); }
});
EGGS.gencin = () => genCinematic(HT.id === 'gen');
