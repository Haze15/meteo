
/* ===================================================================
   ∅ NÉANT — le style secret le plus rare (0,01 %) : encre sur papier
   Cinématique ≈ 40 s : tout s'efface → silence blanc → goutte d'encre → cercle → réécriture
   =================================================================== */
function voidPos() { const l = stage.dataset.lay; return l === 'center' ? [640, 160] : l === 'left-row' ? [620, 210] : l === 'right-row' ? [180, 210] : [392, 190]; }
const ENSO = r => { let d = '', w = ''; const a0 = -1.2, a1 = a0 + 5.75; for (let i = 0; i <= 60; i++) { const a = a0 + (a1 - a0) * i / 60, rr = r * (1 + Math.sin(i * .7) * .015); d += (i ? 'L' : 'M') + (Math.cos(a) * rr).toFixed(1) + ' ' + (Math.sin(a) * rr).toFixed(1); } return d; };
/* fond : gouttes d'encre qui tombent et s'étalent doucement */
let VDX = {drops: [], next: 0};
function drawInk(P, t) {
  if (!VDX.next) VDX.next = t + 4000;
  if (t > VDX.next) { VDX.drops.push({x: 60 + Math.random() * 680, y: 90 + Math.random() * 300, t, r: 6 + Math.random() * 14, k: Math.random()}); VDX.next = t + 7000 + Math.random() * 9000; if (VDX.drops.length > 6) VDX.drops.shift(); }
  VDX.drops.forEach(d => { const e = (t - d.t) / 14000; if (e > 1) return; const a = (1 - e) * .16, r = d.r * (1 + Math.sqrt(e) * 3.2); f.fillStyle = `rgba(20,20,24,${a.toFixed(3)})`; f.beginPath(); for (let i = 0; i <= 18; i++) { const an = i / 18 * 6.2832, rr = r * (1 + .12 * Math.sin(an * 3 + d.k * 9) + .06 * Math.sin(an * 7)); i ? f.lineTo(d.x + Math.cos(an) * rr, d.y + Math.sin(an) * rr) : f.moveTo(d.x + Math.cos(an) * rr, d.y + Math.sin(an) * rr); } f.fill(); });
  P.forEach((p, i) => { if (i > 18) return; p.y -= .06 * SPD; p.x += Math.sin(t / 2000 + p.p) * .15; if (p.y < -5) { p.y = 485; p.x = Math.random() * 800; } f.fillStyle = 'rgba(20,20,24,.18)'; f.fillRect(p.x, p.y, 1.2, 1.2); });
}
/* ----- La cinématique ----- */
let voidOn = false;
function voidCinematic(apply) {
  if (voidOn) return false; voidOn = true;
  let got = null; try { got = JSON.parse(localStorage.getItem('voidGot') || 'null'); } catch (e) {}
  const el = document.createElement('div'); el.id = 'vdc';
  el.innerHTML = `<canvas width="800" height="480"></canvas><div class="vd-paper"></div><canvas class="vd-ink" width="800" height="480"></canvas><div class="vd-line"></div>
    <div class="vd-title">${[...'∅ NÉANT'].map((c, i) => `<span style="--i:${i}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}</div>
    <div class="vd-sub">STYLE SECRET · 1 CHANCE SUR 10 000${got && got.n ? `<i>obtenu ×${got.n} · la première fois le ${new Date(got.t).toLocaleDateString('fr-FR')}</i>` : ''}</div><div class="vd-skip">touche 2 fois pour passer</div>`;
  stage.appendChild(el); if (typeof cinFX === 'function') cinFX(el, {bars: false, vig: false, light: true});
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), ink = el.querySelector('.vd-ink').getContext('2d'), tm = [], at = (s, fn) => tm.push(setTimeout(fn, s * 1000)), T0 = performance.now(), lite = !!cfg.lite;
  const music = !PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on ? (AMB.unlock(), AMB.void()) : null;
  /* 1. tout se décolore puis se dissout en poussière, élément par élément */
  stage.classList.add('vd-drain');
  const parts = [...document.querySelectorAll('#stage > header, #v1 #kick, #v1 #ic, #v1 #temp, #v1 #desc, #v1 #hl, #v1 #mt, #days, #hours, #deco2, #deco, #fest, #tick')].filter(e => e && e.offsetParent !== null || (e && e.id === 'deco'));
  const DUST = [];
  parts.forEach((e, i) => at(1 + i * .38, () => { const r = rel(e); e.classList.add('vd-gone'); const n = lite ? 25 : 60; for (let k = 0; k < n; k++) DUST.push({x: r.x + Math.random() * r.w, y: r.y + Math.random() * r.h, vx: -.2 - Math.random() * 1.4, vy: -.3 - Math.random() * 1.2, a: .5 + Math.random() * .4, s: .8 + Math.random() * 1.8, t: performance.now()}); }));
  at(6.6, () => { el.classList.add('white'); });
  at(7.6, () => { stage.classList.add('vd-hide'); parts.forEach(e => e.classList.remove('vd-gone')); stage.classList.remove('vd-drain'); });
  /* 2. le silence : quelques mots */
  const line = el.querySelector('.vd-line');
  [[7.9, 'Il n\'y a plus rien.'], [9.1, 'Pas de ciel.'], [10.1, 'Pas de temps.'], [11.1, 'Seulement…']].forEach(([s, w]) => at(s, () => { line.textContent = w; line.classList.remove('on'); void line.offsetWidth; line.classList.add('on'); }));
  at(12, () => { line.textContent = ''; });
  /* 3–4. la goutte, l'encre, le cercle (dessinés sur une feuille qui garde les traces) */
  const CX = 400, CY = 210, TEN = Array.from({length: lite ? 40 : 80}, () => { const a = Math.random() * 6.283; return {x: CX, y: CY, a, v: .25 + Math.random() * 1.1, w: Math.random() * 6.283, life: 1}; });
  at(12.2, () => { if (typeof impactFrames === 'function') impactFrames({host: el, x: CX, y: CY, snd: false, theme: 'void', seq: ['b', 'a', 'c', 'b'], dt: 60}); });
  at(23.4, () => el.classList.add('title'));
  if (apply) at(29.6, () => { if (typeof apply === 'function') apply(); });
  at(30, () => { stage.classList.remove('vd-hide'); stage.classList.add('vd-write'); el.classList.add('out'); });
  const fin = () => { tm.forEach(clearTimeout); el.remove(); voidOn = false; stage.classList.remove('vd-drain', 'vd-hide', 'vd-write'); parts.forEach(e => e.classList.remove('vd-gone')); };
  at(36.5, fin);
  let last = 0;
  el.addEventListener('pointerdown', e => { e.stopPropagation(); const n = Date.now(); el.querySelector('.vd-skip').classList.add('on'); if (n - last < 450) { if (music) music.stop(); tm.forEach(clearTimeout); if (apply && typeof apply === 'function') apply(); stage.classList.remove('vd-hide', 'vd-drain'); parts.forEach(x => x.classList.remove('vd-gone')); el.classList.add('out'); setTimeout(fin, 900); } last = n; });
  let ensoDone = 0;
  (function frame(now) {
    if (!el.isConnected) return; requestAnimationFrame(frame); const t = (now - T0) / 1000; g.clearRect(0, 0, 800, 480);
    try {
      /* poussière */
      if (t < 9) DUST.forEach(d => { const e = (now - d.t) / 1000; if (e > 3.5) return; d.x += d.vx * (1 + e); d.y += d.vy * (1 + e * .6) + Math.sin(e * 4 + d.s) * .3; g.fillStyle = `rgba(${t > 6.6 ? '40,40,44' : '230,230,235'},${(d.a * (1 - e / 3.5)).toFixed(2)})`; g.fillRect(d.x, d.y, d.s, d.s); });
      /* la goutte qui tombe */
      if (t > 11.6 && t < 12.2) { const q = (t - 11.6) / .6, y = -20 + q * q * (CY + 20); g.fillStyle = '#111'; g.beginPath(); g.ellipse(CX, y, 6, 9, 0, 0, 6.2832); g.fill(); }
      if (t > 12.2 && t < 18) { const e = t - 12.2; [0, .5, 1.1].forEach((o, i) => { const q = (e - o) / 3.5; if (q > 0 && q < 1) { g.strokeStyle = `rgba(20,20,24,${(1 - q) * .35})`; g.lineWidth = 1.2; g.beginPath(); g.ellipse(CX, CY, 10 + q * 330, (10 + q * 330) * .5, 0, 0, 6.2832); g.stroke(); } }); }
      /* l'encre qui se diffuse (traces gardées sur la feuille) */
      if (t > 12.2 && t < 20) { if (!el.dataset.splash) { el.dataset.splash = 1; ink.fillStyle = '#111'; ink.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * 6.2832, r = 16 * (1 + .25 * Math.sin(a * 5) + .1 * Math.sin(a * 11)); i ? ink.lineTo(CX + Math.cos(a) * r, CY + Math.sin(a) * r) : ink.moveTo(CX + Math.cos(a) * r, CY + Math.sin(a) * r); } ink.fill(); }
        TEN.forEach(p => { if (p.life <= 0) return; p.w += (Math.random() - .5) * .35; p.a += Math.sin(p.w) * .025; p.x += Math.cos(p.a) * p.v; p.y += Math.sin(p.a) * p.v * .7; p.life -= .006 + Math.random() * .003; ink.fillStyle = `rgba(17,17,20,${(.015 + p.life * .07).toFixed(3)})`; ink.beginPath(); ink.arc(p.x, p.y, .5 + p.life * 3.2, 0, 6.2832); ink.fill(); });
        const e = t - 12.2, br = 16 + Math.sqrt(e) * 34, bg = ink.createRadialGradient(CX, CY, 0, CX, CY, br); bg.addColorStop(0, 'rgba(17,17,20,.05)'); bg.addColorStop(.6, 'rgba(17,17,20,.025)'); bg.addColorStop(1, 'rgba(17,17,20,0)'); ink.fillStyle = bg; ink.beginPath(); ink.arc(CX, CY, br, 0, 6.2832); ink.fill(); }
      if (t > 18.5 && t < 20.5) { ink.globalCompositeOperation = 'destination-out'; ink.fillStyle = 'rgba(0,0,0,.035)'; ink.fillRect(0, 0, 800, 480); ink.globalCompositeOperation = 'source-over'; }
      if (t > 20.5 && !el.dataset.clr) { el.dataset.clr = 1; ink.clearRect(0, 0, 800, 480); }
      /* le cercle tracé au pinceau */
      if (t > 20.6 && t < 23.4) { const q = Math.min(1, (t - 20.6) / 2.5), a0 = -1.25, a1 = a0 + 5.7 * (1 - Math.pow(1 - q, 2)), R = 118; const N = 420, steps = 12, upto = Math.floor(q * N); for (let k = ensoDone; k < upto; k++) { const aa = a0 + 5.7 * k / N, w = 18 * (1 - k / (N * 1.08)) + 2.5, dry = k > N * .78 ? (k - N * .78) / (N * .22) : 0; for (let b = 0; b < steps; b++) { if (Math.random() < dry * .8) continue; const off = (b / (steps - 1) - .5) * w + (Math.random() - .5) * 1.2, x = CX + Math.cos(aa) * (R + off), y = CY + Math.sin(aa) * (R + off) * .98; ink.fillStyle = `rgba(17,17,20,${(.18 + Math.random() * .2).toFixed(2)})`; ink.beginPath(); ink.arc(x, y, 1.3 + Math.random() * 1.4, 0, 6.2832); ink.fill(); } } ensoDone = upto; }
      if (t > 30) { const q = Math.min(1, (t - 30) / 1.6); el.querySelector('.vd-ink').style.opacity = String(1 - q); }
    } catch (x) {}
  })(T0);
}
/* ----- Le style ----- */
Object.assign(SIG, {
  void: {name: '∅ Néant', icons: 'line', temp: 'text', noAstro: true, noClouds: true, ink: true, amb: 'ink', secret: true,
    deco: () => { const [x, y] = voidPos(); return `<svg class="vd-enso" style="left:${x - 130}px;top:${y - 130}px" viewBox="-130 -130 260 260" width="260" height="260"><defs><filter id="vdbr"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5"/></filter></defs><path d="${ENSO(108)}" fill="none" stroke="#141418" stroke-width="13" stroke-linecap="round" filter="url(#vdbr)" opacity=".85"/></svg>`; },
    deco2: () => { let d = ''; try { const x = JSON.parse(localStorage.getItem('voidGot') || 'null'); if (x) d = ` · obtenu le ${new Date(x.t).toLocaleDateString('fr-FR')}${x.n > 1 ? ' · ×' + x.n : ''}`; } catch (e) {} return `<div class="vd-badge">∅ OBJET SECRET · 0,01 %${esc(d)}</div>`; },
    cin: done => voidCinematic(done),
    v: {d: {clear: ['Le ciel est vide. C\'est parfait.'], clearN: ['La nuit. Le silence. Rien d\'autre.'], partly: ['Quelques nuages. Puis plus rien.'], partlyN: ['Une nuit calme.'], cloudy: ['Un ciel blanc, comme une page.'], cloudnight: ['Nuit grise.'], fog: ['Le brouillard efface tout. Enfin.'], drizzle: ['Quelques gouttes. Juste assez.'], rain: ['La pluie tombe. Rien de plus.'], pour: ['Beaucoup de pluie. Respire.'], storm: ['L\'orage passe. Le calme reviendra.'], hail: ['La grêle tombe. Puis s\'arrête.'], snow: ['La neige recouvre tout. Silence.'], blizzard: ['Tout est blanc.'], wind: ['Le vent passe et ne garde rien.'], heat: ['Chaleur. Ne fais rien.'], frost: ['Le givre. Immobile.'], rainbow: ['Une couleur, pour une fois.']}, tx: d => d,
      kick: () => `∅ NÉANT · ${HM(clock())}`, hl: c => `${c.mx}° / ${c.mn}°`, mt: c => `ressenti ${c.fe}° · humidité ${c.hu} % · vent ${c.wi} km/h`, day: dt => FR_D[dt.getDay()].slice(0, 3), hr: (h, n) => n ? String(h) : '·'}}
});
const VDQ = ['Rien.', 'Moins, c\'est plus.', 'Le vide est plein de possibilités.', 'Respire.', 'Ici, rien ne presse.'];
stage.addEventListener('pointerdown', e => {
  if (HT.id !== 'void') return; const s = stage.getBoundingClientRect(), k = s.width / 800, x = (e.clientX - s.left) / k, y = (e.clientY - s.top) / k, [cx, cy] = voidPos();
  VDX.drops.push({x, y, t: performance.now(), r: 8 + Math.random() * 8, k: Math.random()}); if (VDX.drops.length > 8) VDX.drops.shift();
  if (Math.hypot(x - cx, y - cy) < 130 && typeof toast === 'function') toast(VDQ[Math.random() * VDQ.length | 0]);
  if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on) AMB.one('chime');
});
EGGS.voidcin = () => voidCinematic(HT.id === 'void');
