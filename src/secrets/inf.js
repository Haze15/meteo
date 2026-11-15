
/* ===================================================================
   ∞ INFINI — style secret (0,1 %) et sa cinématique d'une minute
   =================================================================== */
const LEM = (a, s) => { const d = 1 + Math.sin(a) ** 2; return [s * Math.cos(a) / d, s * Math.sin(a) * Math.cos(a) / d]; };   // lemniscate de Bernoulli (∞)
function infPos() { const l = stage.dataset.lay; return l === 'center' ? [640, 150] : l === 'left-row' ? [620, 210] : l === 'right-row' ? [180, 210] : [392, 190]; }
let INFX = {spin: 0, shock: 0};
/* Fond du style : tunnel infini + ∞ parcouru de particules */
function drawInf(P, t) {
  const [cx, cy] = infPos(), lite = cfg.lite, N = lite ? 9 : 16, ph = (t / 5200) % 1, k = 1.32;
  f.save(); f.lineWidth = 1.2;
  for (let i = 0; i < N; i++) { const s = 34 * Math.pow(k, i + ph), a = (i + ph) * .21 + t / 9000; if (s > 900) continue; f.strokeStyle = `hsla(${(i * 24 + t / 40) % 360},90%,65%,${Math.min(.32, .05 + i * .02) * (1 - s / 900)})`; f.save(); f.translate(400, 240); f.rotate(a); f.strokeRect(-s, -s * .6, s * 2, s * 1.2); f.restore(); }
  f.restore();
  const sp = 1 + (INFX.spin > t ? 6 : 0), S = 92;
  f.globalCompositeOperation = 'lighter';
  f.lineWidth = 2; f.strokeStyle = 'rgba(200,180,255,.18)'; f.beginPath(); for (let a = 0; a <= 6.3; a += .05) { const [x, y] = LEM(a, S); a ? f.lineTo(cx + x, cy + y) : f.moveTo(cx + x, cy + y); } f.stroke();
  P.forEach((p, i) => { p.a = (p.a == null ? Math.random() * 6.283 : p.a) + .006 * sp * SPD * (.7 + p.k * .6); const [x, y] = LEM(p.a, S + Math.sin(t / 700 + p.p) * 4), hue = (p.a * 57 + t / 25) % 360, r = 1 + p.r * .9; f.fillStyle = `hsla(${hue},100%,70%,.85)`; f.beginPath(); f.arc(cx + x, cy + y, r, 0, 6.2832); f.fill(); if (i % 4 === 0) { f.fillStyle = `hsla(${hue},100%,80%,.18)`; f.beginPath(); f.arc(cx + x, cy + y, r * 4, 0, 6.2832); f.fill(); } });
  const g = f.createRadialGradient(cx, cy, 0, cx, cy, 34); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(.3, 'rgba(200,170,255,.35)'); g.addColorStop(1, 'rgba(120,80,255,0)'); f.fillStyle = g; f.fillRect(cx - 34, cy - 34, 68, 68);
  if (INFX.shock) { const e = (t - INFX.shock) / 1200; if (e > 1) INFX.shock = 0; else { f.strokeStyle = `hsla(${(t / 5) % 360},100%,75%,${1 - e})`; f.lineWidth = 3; f.beginPath(); f.ellipse(cx, cy, 30 + e * 380, (30 + e * 380) * .6, 0, 0, 6.2832); f.stroke(); } }
  f.globalCompositeOperation = 'source-over';
}
/* ----- La cinématique (≈ 60 s, 8 actes). Deux touchers rapides pour passer. ----- */
let infOn = false;
function infCinematic(apply) {
  if (infOn) return false; infOn = true;
  let got = null; try { got = JSON.parse(localStorage.getItem('infGot') || 'null'); } catch (e) {}
  const el = document.createElement('div'); el.id = 'infc';
  el.innerHTML = `<canvas width="800" height="480"></canvas><svg class="ic-crack" viewBox="0 0 800 480"></svg>
    <div class="ic-sig"></div><div class="ic-num"></div><div class="ic-word"></div><div class="ic-count"></div>
    <div class="ic-title">${[...'∞ INFINI ∞'].map((c, i) => `<span style="--i:${i}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}</div>
    <div class="ic-sub"><b>STYLE SECRET DÉBLOQUÉ</b><span>1 CHANCE SUR 1000 · TU FAIS PARTIE DES 0,1 %</span>${got && got.n ? `<i>OBTENU ×${got.n} · PREMIÈRE FOIS LE ${new Date(got.t).toLocaleDateString('fr-FR')}</i>` : ''}</div>
    <div class="ic-white"></div><div class="ic-skip">touche 2 fois pour passer</div>`;
  stage.appendChild(el); if (typeof cinFX === 'function') cinFX(el);
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), lite = !!cfg.lite, T0 = performance.now(), tm = [];
  const $$ = s => el.querySelector(s), at = (s, fn) => tm.push(setTimeout(fn, s * 1000));
  const music = !PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on ? (AMB.unlock(), AMB.inf()) : null;
  /* acte 1 : fissures */
  const crack = $$('.ic-crack'); let cpath = '';
  for (let i = 0; i < 9; i++) at(.3 + i * .45, () => { let x = 400 + (Math.random() - .5) * 120, y = 240 + (Math.random() - .5) * 80, d = `M${x.toFixed(0)} ${y.toFixed(0)}`; const a0 = Math.random() * 6.283; for (let j = 0; j < 7; j++) { x += Math.cos(a0 + (Math.random() - .5) * 1.2) * (30 + Math.random() * 50); y += Math.sin(a0 + (Math.random() - .5) * 1.2) * (30 + Math.random() * 50); d += `L${x.toFixed(0)} ${y.toFixed(0)}`; } cpath += `<path d="${d}"/>`; crack.innerHTML = cpath; });
  stage.classList.add('infquake'); at(4.6, () => { stage.classList.remove('infquake'); el.classList.add('a2'); });
  /* acte 2 : signal + compte à rebours */
  at(5.1, () => { $$('.ic-sig').textContent = '⚠ SIGNAL INCONNU · ORIGINE : ∞'; });
  [7, 6, 5, 4, 3, 2, 1].forEach((n, i) => at(5.3 + i * .95, () => { const e = $$('.ic-num'); e.textContent = n; e.classList.remove('beat'); void e.offsetWidth; e.classList.add('beat'); }));
  at(12, () => { el.classList.add('a3'); $$('.ic-num').textContent = ''; $$('.ic-sig').textContent = ''; });
  /* acte 3 : mots qui flashent */
  [[13.4, 'AU-DELÀ DU CIEL'], [16, 'AU-DELÀ DU TEMPS'], [18.6, 'AU-DELÀ DES NOMBRES'], [21, '∞']].forEach(([s, w]) => at(s, () => { const e = $$('.ic-word'); e.textContent = w; e.classList.remove('fl'); void e.offsetWidth; e.classList.add('fl'); }));
  /* acte 4 : compteur qui file vers l'infini */
  at(22, () => el.classList.add('a4'));
  /* acte 5 : montée + blanc */
  at(32, () => { el.classList.add('a5'); $$('.ic-count').textContent = '∞'; });
  at(39.6, () => el.classList.add('white'));
  at(40, () => { el.classList.add('a6'); el.classList.remove('white', 'a4', 'a5'); });
  at(42, () => { el.classList.add('a7', 'a7q'); stage.classList.add('infquake'); if (typeof impactFrames === 'function') impactFrames({host: el, snd: false, theme: 'inf', lines: 90}); });
  at(43.2, () => { stage.classList.remove('infquake'); el.classList.remove('a7q'); });
  at(45, () => el.classList.add('t1'));
  at(47.5, () => el.classList.add('t2'));
  if (apply) at(55.6, () => { if (typeof apply === 'function') apply(); });
  at(56, () => el.classList.add('out'));
  const fin = () => { tm.forEach(clearTimeout); stage.classList.remove('infquake'); el.remove(); infOn = false; INFX.shock = performance.now(); };
  at(60, fin);
  let lastTap = 0;
  el.addEventListener('pointerdown', e => { e.stopPropagation(); const n = Date.now(); if (n - lastTap < 450) { if (music) music.stop(); if (apply && typeof apply === 'function' && !el.classList.contains('out')) apply(); el.classList.add('out'); tm.forEach(clearTimeout); setTimeout(fin, 900); } lastTap = n; $$('.ic-skip').classList.add('on'); });
  /* dessin */
  const ST = Array.from({length: lite ? 160 : 380}, () => ({x: (Math.random() - .5) * 2, y: (Math.random() - .5) * 2, z: Math.random(), h: Math.random() * 360}));
  const PT = Array.from({length: lite ? 120 : 260}, () => ({a: Math.random() * 6.283, r: 300 + Math.random() * 300, v: .5 + Math.random()}));
  const LP = Array.from({length: lite ? 90 : 200}, (_, i) => ({a: i / 200 * 6.283, k: Math.random()}));
  const [ex, ey] = infPos(); const cnt = $$('.ic-count');
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹', sup = n => String(n).split('').map(d => SUP[+d]).join('');
  (function frame(now) {
    if (!el.isConnected) return; requestAnimationFrame(frame); const t = (now - T0) / 1000; g.clearRect(0, 0, 800, 480);
    try {
    if (t < 4.6) { g.fillStyle = `rgba(0,0,0,${Math.min(.7, t / 6)})`; g.fillRect(0, 0, 800, 480); if (Math.random() < .5) for (let i = 0; i < 4; i++) { g.fillStyle = ['rgba(255,0,90,.3)', 'rgba(0,230,255,.3)', 'rgba(255,255,255,.2)'][i % 3]; g.fillRect(0, Math.random() * 480, 800, 2 + Math.random() * 10); } }
    else if (t < 12) { g.fillStyle = '#000'; g.fillRect(0, 0, 800, 480); const b = Math.max(0, ((t - 5.3) % .95) / .95); g.strokeStyle = `rgba(255,60,90,${(1 - b) * .5})`; g.lineWidth = 3; g.beginPath(); g.arc(400, 230, 60 + b * 260, 0, 6.2832); g.stroke(); }
    else if (t < 22) {   // tunnel hyperespace
      g.fillStyle = '#000006'; g.fillRect(0, 0, 800, 480); const sp = .004 + Math.pow((t - 12) / 10, 2) * .05;
      g.globalCompositeOperation = 'lighter';
      ST.forEach(s => { const z0 = s.z; s.z -= sp; if (s.z <= .02) { s.z = 1; s.x = (Math.random() - .5) * 2; s.y = (Math.random() - .5) * 2; return; } const x1 = 400 + s.x / s.z * 220, y1 = 240 + s.y / s.z * 220, x0 = 400 + s.x / z0 * 220, y0 = 240 + s.y / z0 * 220; g.strokeStyle = `hsla(${(s.h + t * 40) % 360},100%,${70 + (1 - s.z) * 25}%,${1 - s.z})`; g.lineWidth = (1 - s.z) * 2.5; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); });
      for (let i = 0; i < 8; i++) { const z = ((i / 8) - (t * (.3 + (t - 12) * .08)) % 1 + 1) % 1, s = 30 / (z + .05); g.strokeStyle = `hsla(${(i * 45 + t * 60) % 360},100%,60%,${(1 - z) * .35})`; g.lineWidth = 2; g.save(); g.translate(400, 240); g.rotate(t * .4 + i * .3); g.beginPath(); for (let k = 0; k <= 6; k++) { const a = k / 6 * 6.283; k ? g.lineTo(Math.cos(a) * s, Math.sin(a) * s) : g.moveTo(Math.cos(a) * s, Math.sin(a) * s); } g.stroke(); g.restore(); }
      g.globalCompositeOperation = 'source-over';
    }
    else if (t < 40) {   // spirale infinie (Droste) puis convergence
      g.fillStyle = '#000'; g.fillRect(0, 0, 800, 480); const ph = ((t - 22) * (.35 + (t - 22) * .04)) % 1, k = 1.28, N = lite ? 14 : 24;
      g.save(); g.translate(400, 240);
      for (let i = N; i >= 0; i--) { const s = 6 * Math.pow(k, i + ph); if (s > 1200) continue; g.save(); g.rotate((i + ph) * .26 + t * .15); g.fillStyle = i % 2 ? `hsla(${(i * 22 + t * 50) % 360},85%,${12 + (t > 32 ? (t - 32) * 5 : 0)}%,1)` : '#000'; g.strokeStyle = `hsla(${(i * 22 + t * 50) % 360},100%,65%,.9)`; g.lineWidth = 1.5; g.beginPath(); g.rect(-s, -s * .62, s * 2, s * 1.24); g.fill(); g.stroke(); g.restore(); }
      g.restore();
      if (t < 32) { const p = (t - 22) / 10, e = Math.floor(Math.pow(p, 1.6) * 120); cnt.textContent = e < 3 ? String(Math.round(Math.pow(10, e + p * 3))) : '10' + sup(e); }
      if (t > 32) { g.globalCompositeOperation = 'lighter'; const q = (t - 32) / 8; PT.forEach(p => { p.r -= p.v * (2 + q * 22); p.a += .01 + q * .05; if (p.r < 4) p.r = 200 + Math.random() * 400; const x = 400 + Math.cos(p.a) * p.r, y = 240 + Math.sin(p.a) * p.r * .7; g.strokeStyle = `hsla(${(p.a * 57) % 360},100%,75%,${.4 + q * .6})`; g.lineWidth = 1 + q * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(400 + Math.cos(p.a - .08) * (p.r + 30 + q * 60), 240 + Math.sin(p.a - .08) * (p.r + 30 + q * 60) * .7); g.stroke(); }); g.globalCompositeOperation = 'source-over'; g.fillStyle = `rgba(255,255,255,${Math.pow(q, 3) * .9})`; g.fillRect(0, 0, 800, 480); }
    }
    else if (t < 42) { g.fillStyle = '#000'; g.fillRect(0, 0, 800, 480); const r = 2 + Math.abs(Math.sin(t * 6)) * 2; g.fillStyle = '#fff'; g.shadowColor = '#fff'; g.shadowBlur = 16; g.beginPath(); g.arc(400, 230, r, 0, 6.2832); g.fill(); g.shadowBlur = 0; }
    else {   // ∞ qui se dessine, explosion, puis vers sa place
      const q = Math.min(1, (t - 42) / 2.2), out = t > 54.5 ? Math.min(1, (t - 54.5) / 2) : 0, e2 = out * out * (3 - 2 * out);
      const cx = 400 + (ex - 400) * e2, cy = 200 + (ey - 200) * e2, S = 190 + (92 - 190) * e2;
      g.fillStyle = `rgba(0,0,0,${1 - e2})`; g.fillRect(0, 0, 800, 480);
      g.globalCompositeOperation = 'lighter';
      if (t > 42 && t < 46) { const e = (t - 42) / 4; [0, .15, .3].forEach((o, i) => { const ee = e - o; if (ee > 0) { g.strokeStyle = `hsla(${i * 120 + t * 60},100%,70%,${(1 - ee) * .8})`; g.lineWidth = 4 * (1 - ee); g.beginPath(); g.ellipse(400, 200, 20 + ee * 600, (20 + ee * 600) * .65, 0, 0, 6.2832); g.stroke(); } }); }
      if (t > 42.2) { g.save(); g.translate(cx, cy); g.rotate(t * .25); const rays = 18; for (let i = 0; i < rays; i++) { g.rotate(6.283 / rays); g.fillStyle = `hsla(${(i * 20 + t * 40) % 360},100%,70%,${.06 * (1 - e2)})`; g.beginPath(); g.moveTo(0, 0); g.lineTo(500, -22); g.lineTo(500, 22); g.fill(); } g.restore(); }
      g.lineWidth = 5 - e2 * 3; g.shadowBlur = 20; const steps = 160;
      for (let i = 0; i < steps * q; i++) { const a0 = i / steps * 6.283, a1 = (i + 1) / steps * 6.283, [x0, y0] = LEM(a0, S), [x1, y1] = LEM(a1, S), h = (i / steps * 360 + t * 80) % 360; g.strokeStyle = `hsl(${h},100%,68%)`; g.shadowColor = g.strokeStyle; g.beginPath(); g.moveTo(cx + x0, cy + y0); g.lineTo(cx + x1, cy + y1); g.stroke(); }
      g.shadowBlur = 0;
      if (q >= 1) LP.forEach(p => { p.a += .012 * (1 + (1 - e2) * 1.5); const [x, y] = LEM(p.a, S), h = (p.a * 57 + t * 60) % 360; g.fillStyle = `hsla(${h},100%,80%,.9)`; g.beginPath(); g.arc(cx + x + (Math.random() - .5) * 3, cy + y + (Math.random() - .5) * 3, 1.5 + p.k * 1.5, 0, 6.2832); g.fill(); });
      const pg = g.createRadialGradient(cx, cy, 0, cx, cy, 60); pg.addColorStop(0, `rgba(255,255,255,${.9 * q})`); pg.addColorStop(1, 'rgba(160,120,255,0)'); g.fillStyle = pg; g.fillRect(cx - 60, cy - 60, 120, 120);
      g.globalCompositeOperation = 'source-over';
    }
    } catch (x) { g.globalCompositeOperation = 'source-over'; g.shadowBlur = 0; }
  })(T0);
}
/* ----- Le style ----- */
Object.assign(SIG, {
  inf: {name: '∞ Infini', icons: 'line', temp: 'text', noAstro: true, noClouds: true, amb: 'inf', secret: true,
    deco2: () => { let d = ''; try { const x = JSON.parse(localStorage.getItem('infGot') || 'null'); if (x) d = ` · obtenu le ${new Date(x.t).toLocaleDateString('fr-FR')}${x.n > 1 ? ' · ×' + x.n : ''}`; } catch (e) {} return `<div class="inf-vig"></div><div class="inf-badge">∞ OBJET SECRET · 0,1 %${esc(d)} ∞</div>`; },
    cin: done => infCinematic(done),
    v: {d: {clear: ['Un ciel infini, sans aucune limite.', 'Le soleil brille… pour toujours.'], clearN: ['Une infinité d\'étoiles cette nuit.'], partly: ['Des nuages à l\'infini, et du soleil entre eux.'], partlyN: ['La nuit continue… encore et encore.'], cloudy: ['Un plafond de nuages qui ne finit jamais.'], cloudnight: ['Nuit couverte, profonde comme l\'infini.'], fog: ['Le brouillard s\'étend à perte de vue.'], drizzle: ['Une infinité de petites gouttes.'], rain: ['Une infinité de gouttes… et chacune est unique.'], pour: ['La pluie tombe comme si elle ne devait jamais s\'arrêter.'], storm: ['L\'orage gronde jusqu\'au bout de l\'univers.'], hail: ['Des grêlons en nombre infini.'], snow: ['Une infinité de flocons, aucun n\'est pareil.'], blizzard: ['Tempête blanche sans fin.'], wind: ['Le vent souffle depuis le début des temps.'], heat: ['Chaleur sans limite.'], frost: ['Le froid fige l\'éternité.'], rainbow: ['Un arc-en-ciel qui ne finit nulle part.']},
      kick: () => { const d = clock(), s = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds(); return `∞ INFINI · ITÉRATION ${s.toLocaleString('fr-FR')}`; }, hl: c => `MAX ${c.mx}° · MIN ${c.mn}°`, mt: c => `Ressenti ${c.fe}° · Humidité ${c.hu} % · Vent ${c.wi} km/h`, day: D3, hr: (h, n) => n ? pad2(h) + 'h' : '∞'}}
});
setInterval(() => { if (HT.id !== 'inf' || !CTX) return; const k = $('kick'); if (k) k.textContent = HT.v.kick(CTX); }, 1000);
const INFQ = ['Tu as compté jusqu\'à l\'infini ? Deux fois ?', 'L\'infini, c\'est long… surtout vers la fin.', '∞ + 1 = ∞', 'Ce symbole ne s\'arrête jamais de tourner.', 'Tu viens de faire une boucle infinie.'];
stage.addEventListener('pointerdown', e => {
  if (HT.id !== 'inf') return; const s = stage.getBoundingClientRect(), k = s.width / 800, x = (e.clientX - s.left) / k, y = (e.clientY - s.top) / k, [cx, cy] = infPos();
  if (Math.abs(x - cx) < 110 && Math.abs(y - cy) < 60) { INFX.spin = performance.now() + 2500; INFX.shock = performance.now(); if (typeof toast === 'function') toast(INFQ[Math.random() * INFQ.length | 0]); if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on) AMB.one('ping'); }
});
EGGS.infcin = () => infCinematic(HT.id === 'inf');
