
/* ===================================================================
   ÉCRAN : sons d'ambiance + mascotte animée
   =================================================================== */
const inQuiet = (h, a, b) => a === b ? false : a > b ? (h >= a || h < b) : (h >= a && h < b);
let sndHintEl = null;
function sndHint(on) {
  if (!sndHintEl) { sndHintEl = document.createElement('div'); sndHintEl.id = 'sndh'; sndHintEl.className = 'glass'; sndHintEl.textContent = '🔈 Touchez l\'écran pour activer le son'; stage.appendChild(sndHintEl); }
  sndHintEl.classList.toggle('on', !!on);
}
function sndApply() {
  const S = cfg.snd || {};
  if (PV || !S.on) { if (AMB.state() !== 'off') AMB.setVol(0); sndHint(false); return; }
  const d = clock(), h = d.getHours(), q = S.quiet && S.quiet !== 'off' && inQuiet(h, +S.qf, +S.qt);
  const v = clamp(+S.vol || 0, 0, 100) / 100 * (q ? (S.quiet === 'mute' ? 0 : .3) : 1);
  AMB.setVol(v, cfg.lite);
  if (CTX) AMB.scene(sndScene(CTX.k, {cfg: S, hour: h, month: d.getMonth() + 1, T: cfg.unit === 'F' ? (CTX.T - 32) * 5 / 9 : CTX.T, gust: CTX.gu, style: HT.id}));
  setTimeout(() => sndHint(v > 0 && AMB.state() !== 'on'), 1200);
}
['pointerdown', 'keydown'].forEach(e => addEventListener(e, () => { if (!PV && cfg.snd && cfg.snd.on) { AMB.unlock(); setTimeout(() => sndHint(AMB.state() !== 'on'), 400); } }, true));
setInterval(() => { if (CTX) sndApply(); }, 5 * 60000);   // heures calmes

/* ----- Mascotte ----- */
const MS = {x: -300, y: 0, vx: 0, vy: 0, dir: -1, st: 'idle', t0: 0, next: performance.now() + 2500, jump: 0, bub: 0, talk: performance.now() + 15000, h: 0, mode: ''};
let mascEl = null, mascBub = null;
function nimbusSVG(k) {
  const wet = ['drizzle', 'rain', 'pour', 'sleet'].includes(k), storm = ['storm', 'hail'].includes(k), cold = ['snow', 'blizzard', 'frost'].includes(k), night = ['clearN', 'partlyN', 'cloudnight', 'fullmoon'].includes(k), sun = ['clear', 'heat', 'rainbow', 'lucky'].includes(k);
  const body = [[34, 62, 22], [58, 48, 28], [84, 58, 22], [60, 70, 24]];
  const ol = body.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 3}" fill="#5a7fb5"/>`).join('') + '<rect x="30" y="58" width="60" height="38" rx="18" fill="#5a7fb5"/>';
  const fill = body.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`).join('') + '<rect x="33" y="60" width="54" height="33" rx="16" fill="#fff"/><ellipse cx="50" cy="44" rx="12" ry="6" fill="#eef4ff"/>';
  let eyes = '<ellipse cx="50" cy="64" rx="4" ry="5.5" fill="#1d2a44"/><ellipse cx="72" cy="64" rx="4" ry="5.5" fill="#1d2a44"/><circle cx="51.5" cy="62" r="1.5" fill="#fff"/><circle cx="73.5" cy="62" r="1.5" fill="#fff"/>';
  let mouth = '<path d="M55 74Q61 80 67 74" stroke="#1d2a44" stroke-width="2.5" fill="none" stroke-linecap="round"/>', extra = '';
  if (night) { eyes = '<path d="M45 65Q50 69 55 65M67 65Q72 69 77 65" stroke="#1d2a44" stroke-width="2.5" fill="none" stroke-linecap="round"/>'; mouth = '<ellipse cx="61" cy="76" rx="3" ry="2" fill="#1d2a44"/>'; extra = '<text x="92" y="30" font-size="14" font-weight="700" fill="#9fb8e8" font-family="sans-serif">z</text><text x="102" y="18" font-size="10" font-weight="700" fill="#9fb8e8" font-family="sans-serif">z</text>'; }
  if (sun) eyes = '<path d="M40 60H82" stroke="#1d2a44" stroke-width="3"/><rect x="41" y="58" width="17" height="11" rx="4" fill="#1d2a44"/><rect x="64" y="58" width="17" height="11" rx="4" fill="#1d2a44"/><path d="M44 61l5 0" stroke="#7a8db3" stroke-width="2"/>';
  if (k === 'heat') { mouth = '<path d="M55 74Q61 81 67 74Z" fill="#1d2a44"/><ellipse cx="61" cy="78" rx="3" ry="3.5" fill="#ff6f8a"/>'; extra = '<path d="M90 40q4 7 0 10q-4-3 0-10z" fill="#7cc7ff"/>'; }
  if (storm) { eyes = '<circle cx="50" cy="63" r="6" fill="#fff" stroke="#1d2a44" stroke-width="2"/><circle cx="72" cy="63" r="6" fill="#fff" stroke="#1d2a44" stroke-width="2"/><circle cx="50" cy="64" r="2.2" fill="#1d2a44"/><circle cx="72" cy="64" r="2.2" fill="#1d2a44"/>'; mouth = '<ellipse cx="61" cy="77" rx="4" ry="5" fill="#1d2a44"/>'; extra = '<path d="M100 60l-8 14h7l-5 13 13-18h-7l5-9z" fill="#ffd23f" stroke="#c99a00" stroke-width="1"/>'; }
  if (k === 'wind') eyes = '<path d="M45 60l8 4-8 4M77 60l-8 4 8 4" stroke="#1d2a44" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  if (k === 'fog') extra = '<text x="92" y="36" font-size="18" font-weight="700" fill="#9fb8e8" font-family="sans-serif">?</text>';
  let top = '';
  if (wet) { top = '<path d="M60 22V100" stroke="#6b4a2a" stroke-width="3"/><path d="M60 100q0 6 6 6" stroke="#6b4a2a" stroke-width="3" fill="none"/><path d="M14 26Q60 -14 106 26Q95 20 83 26Q72 18 60 26Q48 18 37 26Q25 20 14 26Z" fill="#ff4f6d" stroke="#b8243e" stroke-width="2"/>'; mouth = '<path d="M56 76Q61 73 66 76" stroke="#1d2a44" stroke-width="2.5" fill="none" stroke-linecap="round"/>'; }
  if (cold) extra += '<path d="M32 84Q60 96 90 84L92 92Q60 104 30 92Z" fill="#e63946"/><rect x="74" y="88" width="9" height="20" rx="3" fill="#e63946"/><path d="M76 96h5M76 101h5" stroke="#fff" stroke-width="1.5"/>';
  const cheeks = '<ellipse cx="42" cy="73" rx="5" ry="3" fill="#ffb3c6" opacity=".8"/><ellipse cx="80" cy="73" rx="5" ry="3" fill="#ffb3c6" opacity=".8"/>';
  return `<svg viewBox="0 0 120 112" width="100%" style="display:block;overflow:visible">${top}${ol}${fill}${cheeks}${eyes}${mouth}${extra}<ellipse cx="60" cy="110" rx="30" ry="3" fill="rgba(0,0,0,.18)"/></svg>`;
}
const ACC = k => ({drizzle: '☂️', rain: '☂️', pour: '☂️', sleet: '☂️', storm: '⚡', hail: '⚡', snow: '🧣', blizzard: '🧣', frost: '🧣', clear: '😎', heat: '🥵', clearN: '💤', partlyN: '💤', cloudnight: '💤', fullmoon: '🌕', wind: '💨', fog: '🌫', rainbow: '🌈'})[k] || '';
function mascPhrase() {
  const c = CTX || {k: 'clear', T: 15}, T = c.T, cu = cfg.masc.say ? cfg.masc.say.split('|').map(x => x.trim()).filter(Boolean) : [];
  const P = {drizzle: ['💧 Petite pluie, petite capuche !'], rain: ['☔ N\'oublie pas ton parapluie !', '💧 Ça mouille dehors…'], pour: ['🌊 C\'est le déluge !'], storm: ['⚡ Reste bien à l\'abri !'], hail: ['🧊 Aïe, il grêle !'], snow: ['❄ Bataille de boules de neige ?'], blizzard: ['🌨 On ne voit plus rien !'], clear: ['😎 Quelle belle journée !', '☀ Profite du soleil !'], partly: ['⛅ Le soleil joue à cache-cache'], cloudy: ['☁ Un peu gris aujourd\'hui…'], fog: ['🌫 On n\'y voit rien !'], wind: ['💨 Tiens bien ton chapeau !'], heat: ['🥵 Bois beaucoup d\'eau !'], frost: ['🥶 Attention, ça glisse !'], clearN: ['🌙 Bonne nuit…', '✨ Regarde les étoiles !'], partlyN: ['🌙 Bonne nuit…'], cloudnight: ['🌙 Il est tard…'], fullmoon: ['🌕 Pleine lune ce soir !'], rainbow: ['🌈 Un arc-en-ciel !']}[c.k] || [];
  const all = P.concat([`Il fait ${T}° !`]).concat(T <= 5 ? [`🧣 Couvre-toi, il fait ${T}° !`] : T >= 28 ? ['🍦 Une glace ?'] : []).concat(cu, cu);
  return all[Math.random() * all.length | 0];
}
function mascSay(s, ms = 4500) { if (!mascBub) return; mascBub.textContent = s; MS.bub = performance.now() + ms; }
function mascTap(e) { e && e.stopPropagation(); MS.jump = performance.now(); mascSay(mascPhrase()); if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on) AMB.one('boing'); }
function mascGo() { MS.next = 0; if (MS.st === 'idle' || cfg.masc.mode === 'float' || cfg.masc.mode === 'bounce') { MS.jump = performance.now(); mascSay(mascPhrase()); } }
function mascRender() {
  const M = cfg.masc || {};
  if (!mascEl) { mascEl = document.createElement('div'); mascEl.id = 'masc'; mascBub = document.createElement('div'); mascBub.id = 'mascb'; stage.append(mascEl, mascBub); mascEl.addEventListener('pointerdown', mascTap); requestAnimationFrame(mascFrame); }
  mascEl.style.display = M.on ? '' : 'none'; if (!M.on) { mascBub.style.display = 'none'; return; }
  const k = CTX ? CTX.k : 'clear', src = M.src && !/^img:/.test(M.src) ? M.src : '', key = src ? 'i:' + src.length + src.slice(-40) : 'n:' + k;
  if (mascEl.dataset.key !== key) {
    mascEl.dataset.key = key; MS.h = 0;
    if (src) { mascEl.innerHTML = '<img alt="" draggable="false"><b class="acc"></b>'; const im = mascEl.firstChild; im.onload = () => MS.h = 0; im.onerror = () => { mascEl.dataset.key = ''; cfg.masc.src = ''; mascRender(); }; im.src = src; }
    else mascEl.innerHTML = nimbusSVG(k);
  }
  const a = mascEl.querySelector('.acc'); if (a) a.textContent = M.acc ? ACC(k) : '';
  mascEl.style.width = clamp(+M.size || 110, 30, 400) + 'px'; mascEl.style.opacity = clamp(+M.op || 1, .1, 1);
  if (MS.mode !== M.mode) { MS.mode = M.mode; MS.st = 'idle'; MS.vx = 0; MS.next = performance.now() + 800; }
}
function mascFrame(t) {
  requestAnimationFrame(mascFrame);
  const M = cfg.masc; if (!M || !M.on || !mascEl) return;
  if (document.hidden) return;
  const dt = Math.min(60, t - (MS.lt || t)); MS.lt = t;
  const k = dt / 16.7, sp = clamp(+M.spd || 1, .2, 4), W = clamp(+M.size || 110, 30, 400);
  if (!MS.h) MS.h = mascEl.offsetHeight || W;
  const H = MS.h, ev = clamp(+M.every || 40, 3, 3600) * 1000, look = M.look || 'r';
  let x = 0, y = 0, rot = 0, dir = 1, vis = view !== 2;
  if (M.mode === 'walk' || M.mode === 'fly') {
    if (MS.st === 'idle') { vis = false; if (t > MS.next) { MS.st = 'go'; MS.dir = M.mode === 'fly' ? (Math.random() < .5 ? 1 : -1) : -MS.dir; MS.x = MS.dir > 0 ? -W - 10 : 810; } }
    else { MS.x += MS.dir * (M.mode === 'fly' ? 1.8 : 1.2) * sp * k; if (MS.x > 830 || MS.x < -W - 30) { MS.st = 'idle'; MS.next = t + ev; } }
    x = MS.x; dir = MS.dir;
    if (M.mode === 'walk') { const ph = t / 170 * sp; y = 480 - H - 4 - Math.abs(Math.sin(ph)) * 9; rot = Math.sin(ph) * 4; }
    else { y = 64 + Math.sin(MS.x / 85) * 36; rot = Math.cos(MS.x / 85) * 8 * MS.dir; }
  } else if (M.mode === 'bounce') {
    if (!MS.vx) { MS.vx = 1.1; MS.vy = .75; MS.x = 120 + Math.random() * 300; MS.y = 100; }
    MS.x += MS.vx * sp * k; MS.y += MS.vy * sp * k;
    if (MS.x < 0 || MS.x > 800 - W) { MS.vx *= -1; MS.x = clamp(MS.x, 0, 800 - W); }
    if (MS.y < 0 || MS.y > 480 - H) { MS.vy *= -1; MS.y = clamp(MS.y, 0, 480 - H); }
    x = MS.x; y = MS.y; dir = MS.vx > 0 ? 1 : -1; rot = Math.sin(t / 500) * 5;
  } else if (M.mode === 'peek') {
    if (MS.st === 'idle') { vis = false; if (t > MS.next) { MS.st = 'up'; MS.t0 = t; MS.x = 30 + Math.random() * (740 - W); MS.dir = Math.random() < .5 ? 1 : -1; } }
    const e = (t - MS.t0) / 1000; let p = 0;
    if (MS.st === 'up') { p = Math.min(1, e / .7); if (e > .7) { MS.st = 'stay'; MS.t0 = t; if (M.talk) mascSay(mascPhrase(), 3500); } }
    else if (MS.st === 'stay') { p = 1; if (e > 4.5) { MS.st = 'down'; MS.t0 = t; } }
    else if (MS.st === 'down') { p = 1 - Math.min(1, e / .5); if (e > .5) { MS.st = 'idle'; MS.next = t + ev; } }
    const q = 1 - Math.pow(1 - p, 3); x = MS.x; y = 480 - H * .82 * q + (1 - q) * 12; dir = MS.dir; rot = MS.st === 'stay' ? Math.sin(t / 380) * 5 : 0;
  } else {   // float : reste dans un coin
    const Pp = {br: [800 - W - 16, 480 - H - 34], bl: [16, 480 - H - 34], tr: [800 - W - 16, 66], tl: [16, 66], m: [400 - W / 2, 240 - H / 2]}[M.pos] || [800 - W - 16, 480 - H - 34];
    x = Pp[0] + Math.sin(t / 1900) * 6; y = Pp[1] + Math.sin(t / 900 * sp) * 8; rot = Math.sin(t / 1300) * 4; dir = Math.sin(t / 9000) > 0 ? 1 : -1;
  }
  if (MS.jump) { const e = (t - MS.jump) / 650; if (e > 1) MS.jump = 0; else { y -= Math.sin(e * Math.PI) * 48; rot += Math.sin(e * Math.PI * 2) * 8; } }
  const sx = look === 'no' ? 1 : (look === 'l' ? -dir : dir);
  mascEl.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scaleX(${sx})`;
  mascEl.style.visibility = vis ? '' : 'hidden';
  if (M.talk && vis && t > MS.talk && M.mode !== 'peek') { MS.talk = t + 30000 + Math.random() * 40000; mascSay(mascPhrase()); }
  const show = vis && MS.bub > t;
  mascBub.style.display = show ? '' : 'none';
  if (show) { const bw = mascBub.offsetWidth, bx = clamp(x + W / 2 - bw / 2, 8, 792 - bw), by = Math.max(8, y - mascBub.offsetHeight - 10); mascBub.style.transform = `translate(${bx.toFixed(0)}px,${by.toFixed(0)}px)`; mascBub.style.setProperty('--tx', clamp(x + W / 2 - bx, 14, bw - 14).toFixed(0) + 'px'); }
}

/* ===================================================================
   QUALITÉ DE L'AIR + POLLENS (Open-Meteo, indice européen)
   =================================================================== */
let AQ = null, aqAt = 0;
async function loadAir() {
  if (!cfg.show || (cfg.show.air === false && cfg.show.pollen === false)) return;
  aqAt = Date.now();
  try {
    const r = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${LAT}&longitude=${LON}&current=european_aqi,pm2_5,pm10,ozone,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen&timezone=auto`);
    if (!r.ok) return; const j = await r.json(); if (!j || !j.current) return;
    AQ = j.current; if (lastW) renderW(lastW);
  } catch (e) {}
}
setInterval(loadAir, 30 * 60000);
const AQL = [[20, 'bon', '#50f0e6'], [40, 'correct', '#50ccaa'], [60, 'moyen', '#f0e641'], [80, 'médiocre', '#ff5050'], [100, 'mauvais', '#c8002f'], [1e9, 'très mauvais', '#9b2bd1']];
const POL = [['grass', 'graminées', [10, 50, 200]], ['birch', 'bouleau', [10, 50, 500]], ['alder', 'aulne', [10, 50, 500]], ['olive', 'olivier', [10, 50, 200]], ['mugwort', 'armoise', [5, 20, 50]], ['ragweed', 'ambroisie', [5, 20, 50]]];
const POLL = ['nul', 'faible', 'modéré', 'élevé', 'très élevé'];
function airInfo() {
  if (!AQ) return null;
  const o = {};
  if (AQ.european_aqi != null) { const v = Math.round(AQ.european_aqi), l = AQL.find(x => v < x[0]); o.aqi = v; o.lbl = l[1]; o.col = l[2]; o.bad = v >= 60; }
  let best = null;
  POL.forEach(([k, n, t]) => { const v = AQ[k + '_pollen']; if (v == null) return; const lv = v < 1 ? 0 : v < t[0] ? 1 : v < t[1] ? 2 : v < t[2] ? 3 : 4; if (!best || lv > best.lv || (lv === best.lv && v > best.v)) best = {n, lv, v}; });
  o.pol = best; return o;
}
function aqHTML() {
  if (Date.now() - aqAt > 35 * 60000) loadAir();
  const a = airInfo(), S = cfg.show || {}; if (!a) return '';
  const p = [];
  if (S.air !== false && a.aqi != null) p.push(`<i class="aqd" style="background:${a.col}"></i>Air ${a.lbl}`);
  if (S.pollen !== false && a.pol) p.push(a.pol.lv ? `🌿 Pollen ${a.pol.n} : <span class="${a.pol.lv >= 3 ? 'aqw' : ''}">${POLL[a.pol.lv]}</span>` : '🌿 Pollens : très peu');
  return p.length ? `<span class="aq"><br>${p.join(' · ')}</span>` : '';
}

/* ===================================================================
   MODE VEILLE LA NUIT : horloge sur fond noir (ou écran assombri)
   =================================================================== */
let SLEEPING = false, wakeUntil = 0, sleepEl = null, sleepMv = 0;
function sleepCheck() {
  const N = cfg.night || {}, d = clock(), h = d.getHours();
  const want = (PV && cfg.sleepPv) || (!!N.on && inQuiet(h, +N.from, +N.to) && Date.now() > wakeUntil);
  if (!sleepEl) { sleepEl = document.createElement('div'); sleepEl.id = 'sleep'; sleepEl.innerHTML = '<div class="sl-in"><div class="sl-t"></div><div class="sl-w"></div><div class="sl-d"></div></div>'; stage.appendChild(sleepEl); }
  SLEEPING = want; const mode = N.mode === 'dim' ? 'dim' : 'clock', lum = clamp(+N.lum || .5, .05, 1);
  sleepEl.className = want ? 'on ' + mode : '';
  stage.classList.toggle('asleep', want && mode === 'clock');
  if (!want) return;
  if (mode === 'dim') { sleepEl.style.background = `rgba(0,0,0,${(1 - lum).toFixed(2)})`; return; }
  sleepEl.style.background = '';
  const In = sleepEl.firstChild; In.style.opacity = lum;
  In.querySelector('.sl-t').textContent = HM(d);
  In.querySelector('.sl-d').textContent = longDate(d);
  if (lastW && CTX) { const c = lastW.current, s = HT.icons; HT.icons = 'line'; In.querySelector('.sl-w').innerHTML = ico(iconOf(c.weather_code, c.is_day), 40) + `<span>${CTX.T}°</span>`; HT.icons = s; }
  if (Date.now() - sleepMv > 60000) { sleepMv = Date.now(); In.style.transform = `translate(${Math.round(Math.random() * 120 - 60)}px,${Math.round(Math.random() * 70 - 35)}px)`; }   // bouge un peu : évite le marquage de l'écran
}
setInterval(sleepCheck, 15000);
addEventListener('pointerdown', e => { if (!SLEEPING) return; const N = cfg.night || {}; if (N.wake === false || (PV && cfg.sleepPv)) return; wakeUntil = Date.now() + 60000; sleepCheck(); e.stopPropagation(); e.preventDefault(); }, true);
