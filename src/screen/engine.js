
/* ===== Jour de chance : 0,001 % de chance (1 sur 100 000) à chaque actualisation de la météo, puis actif toute la journée ===== */
const LUCKY_P = 0.00001;
let luckyDay = '';
const todayKey = () => { const n = clock(); return n.getFullYear() + '-' + (n.getMonth() + 1) + '-' + n.getDate(); };
function luckyActive() {
  if (QS.get('chance')) return true;
  if (luckyDay === todayKey()) return true;
  try { return localStorage.getItem('luckyDay') === todayKey(); } catch (e) { return false; }
}
function rollLucky() {
  if (luckyActive() || Math.random() >= LUCKY_P) return;
  luckyDay = todayKey(); try { localStorage.setItem('luckyDay', luckyDay); } catch (e) {}
  if (lastW) renderW(lastW); else setBg();
  setTimeout(() => showNotice({text: "🍀 JOUR DE CHANCE ! Une météo ultra rare (0,001 %) vient d'apparaître 🍀", sec: 15}), 1200);
}
/* ===== Phase de la lune (0 = nouvelle, 0,5 = pleine) ===== */
const moonPhase = () => ((Date.now() + TOFF - 947182440000) / 86400000 % 29.530588) / 29.530588;
const moonFull = () => Math.abs(moonPhase() - .5) < .034;
/* ===== Choix de la météo affichée (toutes les météos possibles) ===== */
const isRainC = c => (c >= 51 && c <= 67) || (c >= 80 && c <= 82);
function golden(j, c) {
  try { const t = new Date(c.time).getTime(), sr = new Date(j.daily.sunrise[0]).getTime(), ss = new Date(j.daily.sunset[0]).getTime(), W = 40 * 60000; if (Math.abs(t - sr) <= W) return 'dawn'; if (Math.abs(t - ss) <= W) return 'dusk'; } catch (e) {}
  return '';
}
function stateFor(c, day, prev, j) {
  const k = c.weather_code, g = c.wind_gusts_10m || 0, W = cfg.wx, snow = (k >= 71 && k <= 77) || k === 85 || k === 86;
  if (luckyActive()) return {s: 'lucky', d: '🍀 Jour de chance'};
  if (k >= 96) return {s: 'hail'};
  if (k === 95) return {s: 'storm'};
  if (k === 56 || k === 57 || k === 66 || k === 67) return {s: 'sleet'};
  if (snow) return {s: (k === 75 || k === 86 || g >= +W.blizG) ? 'blizzard' : 'snow'};
  if (k === 45 || k === 48) return {s: 'fog'};
  if (k >= 51 && k <= 55) return {s: 'drizzle'};
  if (isRainC(k)) return {s: 'rain'};
  if (g >= +W.windG) return {s: 'wind', d: 'Vent fort'};
  if (W.rainbow && day && k <= 2 && isRainC(prev)) return {s: 'rainbow', d: 'Arc-en-ciel'};
  if (day && c.temperature_2m >= +W.heat) return {s: 'heat', d: 'Fortes chaleurs'};
  if (W.frost && c.temperature_2m <= 0) return {s: 'frost', d: 'Gel · ' + (DESC[k] || '')};
  if (W.golden && k <= 2 && j) { const gh = golden(j, c); if (gh) return {s: gh, d: gh === 'dawn' ? 'Lever du soleil' : 'Coucher du soleil'}; }
  if (!day && k <= 1 && W.fullmoon && moonFull()) return {s: 'fullmoon', d: 'Pleine lune'};
  if (!day && k === 3 && W.cloudnight) return {s: 'cloudnight'};
  return {s: k <= 2 ? (day ? 'clear' : 'night') : 'cloudy'};
}
const DESC = {0: 'Ciel dégagé', 1: 'Plutôt dégagé', 2: 'Éclaircies', 3: 'Couvert', 45: 'Brouillard', 48: 'Brouillard givrant', 51: 'Bruine légère', 53: 'Bruine', 55: 'Bruine dense', 56: 'Bruine verglaçante', 57: 'Bruine verglaçante', 61: 'Pluie faible', 63: 'Pluie', 65: 'Forte pluie', 66: 'Pluie verglaçante', 67: 'Pluie verglaçante', 71: 'Neige faible', 73: 'Neige', 75: 'Forte neige', 77: 'Grains de neige', 80: 'Averses', 81: 'Averses', 82: 'Fortes averses', 85: 'Averses de neige', 86: 'Averses de neige', 95: 'Orage', 96: 'Orage avec grêle', 99: 'Orage violent'};
const lum = h => { const n = parseInt(String(h).replace('#', ''), 16) || 0; return (.299 * (n >> 16 & 255) + .587 * (n >> 8 & 255) + .114 * (n & 255)) / 255; };
let TH = DEFTHEMES.clear, wState = 'clear', boost = 0, bgi = 0, lastG = '', curEv = null, CTX = null;
const bgs = [0, 1].map(() => { const d = document.createElement('div'); d.className = 'bg'; stage.insertBefore(d, stage.firstChild); return d; });
const easter = y => { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, g = Math.floor((b - Math.floor((b + 8) / 25) + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mo - 1, da); };
const tokDate = (tok, y) => { tok = String(tok).trim(); if (/^easter/.test(tok)) { const e = easter(y); return new Date(e.getFullYear(), e.getMonth(), e.getDate() + (+tok.slice(6) || 0)); } const p = tok.split('-').map(Number); return new Date(y, p[0] - 1, p[1]); };
function activeEvent() {
  const n = clock(), t0 = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  for (const ev of cfg.events) {
    if (!ev.on) continue;
    if (ev.from === 'fri13') { if (n.getDay() === 5 && n.getDate() === 13) return ev; continue; }
    for (const y of [n.getFullYear() - 1, n.getFullYear()]) { const a = tokDate(ev.from, y); let b = tokDate(ev.to || ev.from, y); if (b < a) b = tokDate(ev.to, y + 1); if (t0 >= a && t0 <= b) return ev; }
  }
  return null;
}
function pickTheme() {
  const fo = QS.get('w') || cfg.force;
  if (fo && fo !== 'auto') { if (cfg.themes[fo]) return {th: cfg.themes[fo]}; const ev = cfg.events.find(e => e.id === fo); if (ev) return {th: ev, ev}; }
  if (luckyActive()) return {th: cfg.themes.lucky};
  const ev = cfg.festAuto ? activeEvent() : null; if (ev) return {th: ev, ev};
  return {th: cfg.themes[wState] || Object.assign({}, TADV, DEFTHEMES[wState] || DEFTHEMES.clear)};
}
/* Style festif : 'all' = remplace n'importe quel style, true = seulement le style iOS par défaut, false = jamais */
const effHud = p => { if (QS.get('hud')) return QS.get('hud'); if (cfg.hud === 'x0s' || (typeof rollHud === 'function' && rollHud() === 'x0s')) return 'x0s'; if (cfg.hud === 'x0' || (typeof rollHud === 'function' && rollHud() === 'x0')) return 'x0'; if (cfg.hud === 'xr') return 'xr'; if (cfg.hud === 'inf' || (typeof rollHud === 'function' && rollHud() === 'inf')) return 'inf'; if (cfg.hud === 'void' || (typeof rollHud === 'function' && rollHud() === 'void')) return 'void'; if (cfg.hud === 'tes' || (typeof rollHud === 'function' && rollHud() === 'tes')) return 'tes'; if (cfg.hud === 'gen' || (typeof rollHud === 'function' && rollHud() === 'gen')) return 'gen'; if (cfg.hud === 'crea') return 'crea'; if (cfg.hud === 'train' || (typeof rollHud === 'function' && rollHud() === 'train')) return 'train'; if (cfg.hud === 'aby' || (typeof rollHud === 'function' && rollHud() === 'aby')) return 'aby'; const f = p && p.ev && FESTHUD[p.ev.id]; if (f && (cfg.festHud === 'all' || (cfg.festHud === true && cfg.hud === 'ios'))) return f; const r = typeof rollHud === 'function' ? rollHud() : null; return r || cfg.hud; };
let festMsgs = [], festI = 0, festT = 0;
function setFest(list) {
  const j = JSON.stringify(list); if (j === JSON.stringify(festMsgs)) return;
  festMsgs = list; festI = 0; clearInterval(festT); const m = $('fest');
  if (!list.length) { m.style.display = 'none'; return; }
  m.textContent = list[0]; m.style.display = 'block';
  if (list.length > 1) festT = setInterval(() => { m.classList.add('fade'); setTimeout(() => { festI = (festI + 1) % festMsgs.length; m.textContent = festMsgs[festI]; m.classList.remove('fade'); }, 420); }, 8000);
}
function setBg(k) {
  if (k) wState = k;
  const p = pickTheme(); TH = p.th; curEv = p.ev || null;
  if (applyHud(effHud(p))) { updHeader(); tick(); }
  const a = isNaN(+TH.ang) ? 170 : +TH.ang, o = clamp(+TH.imgo || 0, 0, 1), im = su(TH.img);
  const g = im ? `linear-gradient(${a}deg,${hexA(TH.c[0], 1 - o)},${hexA(TH.c[1], 1 - o)} 58%,${hexA(TH.c[2], 1 - o)}),url("${im.replace(/"/g, '%22')}") center/cover` : `linear-gradient(${a}deg,${TH.c[0]},${TH.c[1]} 58%,${TH.c[2]})`;
  if (g !== lastG) { lastG = g; bgi ^= 1; bgs[bgi].style.background = g; bgs[bgi].classList.add('on'); bgs[1 - bgi].classList.remove('on'); }
  bgs.forEach(b => b.classList.toggle('anim', !!TH.anim && !im));
  stage.dataset.w = lum(TH.c[1]) > .62 ? 'snow' : 'dark';
  stage.style.setProperty('--wc', TH.c[1]);
  setFest(String((curEv && curEv.msg) || TH.msg || '').split('|').map(s => s.trim()).filter(Boolean));
  initFx(); schedBolt(); eggsDecor();
}

/* ===== Météo réelle (Open-Meteo) ===== */
let lastW = null, stormAt = null;
async function loadWeather() {
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,pressure_msl,cloud_cover,dew_point_2m,visibility&hourly=temperature_2m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=6&wind_speed_unit=kmh`);
    if (!r.ok) throw 0; lastW = await r.json(); rollLucky(); renderW(lastW);
  } catch (e) { if (!lastW) $('desc').textContent = 'Météo indisponible'; }
}
const T = v => Math.round(cfg.unit === 'F' ? v * 9 / 5 + 32 : v);
function renderW(j) {
  const c = j.current, h = j.hourly, d = j.daily, day = !!c.is_day;
  boost = (c.weather_code === 2 || c.weather_code === 3) ? 1 : 0;
  const ix = Math.max(0, h.time.indexOf(c.time.slice(0, 13) + ':00')), st = stateFor(c, day, ix > 0 ? h.weather_code[ix - 1] : -1, j);
  setBg(st.s);   // peut changer le style d'interface (fêtes)
  const V = HT.v, num = HT.num || (v => v + '°'), k = kindOf(c.weather_code, day, st.s);
  const ctx = CTX = {k, s: st.s, code: c.weather_code, day, T: T(c.temperature_2m), mx: T(d.temperature_2m_max[0]), mn: T(d.temperature_2m_min[0]), fe: T(c.apparent_temperature), hu: Math.round(c.relative_humidity_2m), wi: Math.round(c.wind_speed_10m), gu: c.wind_gusts_10m, wd: c.wind_direction_10m, qnh: c.pressure_msl, td: T(c.dew_point_2m ?? c.temperature_2m - 4), cc: c.cloud_cover, vis: c.visibility, city: shortCity()};
  ctx.base = st.d || DESC[c.weather_code] || '—';
  let desc = TH.desc || eggDesc(ctx) || (cfg.voice !== false ? voiceDesc(V, ctx) : ctx.base);
  $('ic').innerHTML = HT.mainIcon ? HT.mainIcon(ctx) : ico(st.s === 'lucky' ? 'sun' : iconOf(c.weather_code, day), 48, true);
  setTemp(ctx.T); eggTemp(ctx);
  if (HT.descHTML) $('desc').innerHTML = HT.descHTML(desc); else $('desc').textContent = desc;
  const kk = V.kick ? V.kick(ctx) : ''; $('kick').textContent = kk; $('kick').classList.toggle('on', !!kk);
  if (HT.onRender) try { HT.onRender(ctx); } catch (x) { console.error(x); }
  $('hl').innerHTML = esc((V.hl || VD.hl)(ctx)).replace(/&lt;(\/?)(b|br)&gt;/g, '<$1$2>');
  $('mt').innerHTML = (V.mt || VD.mt)(ctx) + (typeof aqHTML === 'function' ? aqHTML() : '');
  let i0 = h.time.indexOf(c.time.slice(0, 13) + ':00'); if (i0 < 0) i0 = 0;
  const hc = HT.hourCell || ((lbl, ic, t) => `<div class="h"><small>${lbl}</small>${ic}<span>${t}</span></div>`);
  $('hours').innerHTML = [0, 1, 2, 3, 4, 5].map(n => { const i = Math.min(h.time.length - 1, i0 + n), hh = +h.time[i].slice(11, 13); return hc((V.hr || VD.hr)(hh, n), ico(iconOf(h.weather_code[i], h.is_day[i])), HT.temp === 'flap' ? T(h.temperature_2m[i]) + '°' : num(T(h.temperature_2m[i]))); }).join('');
  const dr = HT.dayRow || ((dt, ic, mx, mn) => `<div class="day"><span>${(V.day || VD.day)(dt)}</span>${ic}<span class="mm"><span>${mx}</span><i>${mn}</i></span></div>`);
  $('days').innerHTML = (HT.daysHead || '') + [1, 2, 3, 4, 5].map(n => { const dt = new Date(d.time[n] + 'T12:00:00'); return dr(dt, ico(iconOf(d.weather_code[n], 1), 26), num(T(d.temperature_2m_max[n])), num(T(d.temperature_2m_min[n])), kindOf(d.weather_code[n], 1, '')); }).join('');
  stormAt = null;
  for (let n = 1; n <= 12 && i0 + n < h.time.length; n++) if (h.weather_code[i0 + n] >= 95) { stormAt = h.time[i0 + n].slice(11, 13) + 'h'; break; }
  updAlert(); layoutHud(); eggsRender(ctx);
  if (typeof sndApply === 'function') { try { sndApply(); } catch (x) {} mascRender(); sleepCheck(); }
}

/* ===== Onglets, en-tête, bandeau, notification ===== */
function tick() { const n = clock(); $('date').textContent = (HT.v.date || VD.date)(n); if (HT.tick) HT.tick(); }
setInterval(tick, 15000);
function updHeader() { $('city').textContent = (HT.v.city || VD.city)(); }
let view = 1;
function show(v) { view = v; [1, 2, 3].forEach(n => { $('v' + n).classList.toggle('on', n === v); $('n' + n).classList.toggle('on', n === v); }); if (v === 2 && map) { setTimeout(() => map.invalidateSize(), 60); if (!radarStarted) { radarStarted = true; loadRadar(); } else if (Date.now() - lastRadar > 300000) loadRadar(); } }
[1, 2, 3].forEach(n => $('n' + n).onclick = () => show(n));
let nt;
function showNotice(n) { $('note').textContent = n.text; $('note').classList.add('on'); clearTimeout(nt); nt = setTimeout(() => $('note').classList.remove('on'), Math.max(3, +n.sec || 10) * 1000); }

/* ===== Styles « simples » (variables CSS) ===== */
/*__ORIG_HUDS__*/
const HUDS = HUDS0.filter(h => !SIG[h[0]]);
const HTD = {icons: 'line', temp: 'text'};
HT = Object.assign({id: 'ios', v: VD}, HTD);
let curHud = null;
/* Cinématiques : on garde l'ANCIEN style à l'écran pendant toute l'animation,
   le nouveau n'est posé qu'au moment de la révélation (done). */
let cinGate = null, CINPASS = null;
function applyHud(id) {
  if (id === 'glass') id = 'ios';
  if (!SIG[id] && !HUDS.find(x => x[0] === id)) id = 'ios';
  if (id === curHud) return false;
  const first = curHud === null, sig = SIG[id];
  if (cinGate) return false;   // une cinématique est en cours : elle posera le style à la fin
  if (!first && sig && sig.cin && CINPASS !== id && !QS.get('nocin')) {
    cinGate = id; let ok = true;
    const done = () => { if (cinGate !== id) return; cinGate = null; CINPASS = id; try { applyCfg(); } finally { CINPASS = null; } };
    try { ok = sig.cin(done) !== false; } catch (x) { console.error(x); ok = false; }
    if (!ok) { cinGate = null; CINPASS = id; try { return applyHud(id); } finally { CINPASS = null; } }
    setTimeout(() => { if (cinGate === id) done(); }, 100000);   // filet de sécurité
    return false;
  }
  curHud = id;
  HT = Object.assign({id}, HTD, sig || {}); HT.v = Object.assign({}, VD, (sig && sig.v) || {});
  stage.dataset.hud = sig ? id : 'glass'; stage.classList.toggle('sig', !!sig);
  const h = (!sig && HUDS.find(x => x[0] === id)) || HUDS[0], o = sig ? {} : h[2], st = stage.style;
  Object.values(HMAP).forEach(m => st.removeProperty(m[0])); ['--lc2', '--ll2', '--pl'].forEach(k => st.removeProperty(k));
  Object.keys(o).forEach(k => { const m = HMAP[k]; if (!m || o[k] == null) return; let v = o[k]; if (k === 'fnt' || k === 'tf' || k === 'nf' || k === 'lf') v = FONTS[v] || v; st.setProperty(m[0], m[1] ? v + m[1] : String(v)); });
  if (o.lc) st.setProperty('--lc2', o.lc); if (o.ll) st.setProperty('--ll2', o.ll); if (o.ln) st.setProperty('--pl', o.ln);
  stage.classList.toggle('c-cor', !!o.cor);
  const dv = x => typeof x === 'function' ? x() : (x || '');
  $('deco').innerHTML = dv(HT.deco); $('deco2').innerHTML = dv(HT.deco2);
  $('now').classList.toggle('g', !!HT.grid);
  const te = $('temp'); te.dataset.m = ''; te.dataset.prev = ''; te.innerHTML = '';
  stage.classList.remove('lit', 'mc-al');
  if (HT.onApply && !first) try { HT.onApply(); } catch (x) { console.error(x); }
  setTimeout(() => { if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (lastW) layoutHud(); }); }, 80);   // polices du style chargées → on recalcule la place
  return true;
}

const SZ = {S: .6, M: .82, L: 1, XL: 1.3};
function layoutHud() {
  if (stage.classList.contains('mob')) return layoutMob();
  const L = cfg.layout, X = HT.L || {}, P = Object.assign({t: 84, b: 24, l: 28, r: 28}, X.pad), tk = stage.classList.contains('tk'), vb = P.b + (tk ? 26 : 0);
  ['v1', 'v2', 'v3'].forEach(id => { const s = $(id).style; s.top = P.t + 'px'; s.bottom = vb + 'px'; s.left = P.l + 'px'; s.right = P.r + 'px'; });
  const ts = $('tick').style; ts.bottom = (P.b - 10) + 'px'; ts.left = P.l + 'px'; ts.right = P.r + 'px';
  const W = 800 - P.l - P.r, H = 480 - P.t - vb, HH = X.hh || 90, DR = X.dr || 78, DW = X.dw || 290, G = 10;
  const now = $('now'), days = $('days'), hrs = $('hours'), hOn = !!cfg.show.hours, dOn = !!cfg.show.days, ns = now.style, ds = days.style, hs = hrs.style;
  let top = 0, bot = H, nowX = 0, nowW = W, dm = L.days;
  if (dm === 'side' && L.now === 'center') dm = 'row';
  stage.dataset.lay = !cfg.show.days ? (L.now === 'right' ? 'right-row' : L.now === 'center' ? 'center' : 'left-row') : dm === 'row' ? (L.now === 'center' ? 'center' : L.now + '-row') : L.now;
  hs.left = '0'; hs.right = '0'; hs.height = HH + 'px';
  if (hOn) { if (L.hours === 'top') { hs.top = '0'; hs.bottom = 'auto'; top = HH + G; } else { hs.top = 'auto'; hs.bottom = '0'; bot -= HH + G; } }
  if (dOn && dm === 'row') {
    days.className = 'row'; ds.left = '0'; ds.right = '0'; ds.width = 'auto'; ds.height = DR + 'px'; ds.top = 'auto';
    ds.bottom = (hOn && L.hours !== 'top' ? HH + G : 0) + 'px'; bot -= DR + G;
  } else if (dOn) {
    days.className = stage.dataset.hud && stage.dataset.hud !== 'glass' ? 'pnl' : ''; ds.width = DW + 'px'; ds.height = 'auto'; ds.top = top + 'px'; ds.bottom = 'auto'; nowW = W - DW - 24;
    if (L.now === 'right') { ds.left = '0'; ds.right = 'auto'; nowX = DW + 24; } else { ds.right = '0'; ds.left = 'auto'; }
  }
  days.querySelectorAll('.day').forEach(e => e.classList.toggle('glass', dOn && dm === 'row'));
  ds.transform = ''; if (dOn && dm !== 'row') { const dh = days.offsetHeight, av = bot - top; if (dh > av && av > 40) { ds.transformOrigin = L.now === 'right' ? 'top left' : 'top right'; ds.transform = 'scale(' + (av / dh).toFixed(3) + ')'; } }
  ns.left = nowX + 'px'; ns.width = nowW + 'px'; ns.top = top + 'px'; ns.textAlign = L.now; ns.transform = 'none';
  $('temp').style.fontSize = Math.round(110 * (SZ[L.size] || 1) * (HT.tempScale || 1)) + 'px';
  const fh = Math.max(60, bot - top); now.classList.remove('cp'); let nh = now.offsetHeight || 1;
  if (nh > fh + 40 && !HT.grid) { now.classList.add('cp'); nh = now.offsetHeight || 1; }   // place juste : l'icône passe à côté des degrés
  const k = Math.min(1, (fh + 8) / nh);
  ns.transformOrigin = L.now === 'right' ? 'top right' : L.now === 'center' ? 'top center' : 'top left';
  if (k < 1) ns.transform = 'scale(' + k.toFixed(3) + ')'; else if (L.now === 'center') ns.top = (top + (fh - nh) / 2) + 'px';
  schedDecor();
}
/* Disposition mobile (portrait) : la météo du moment en haut, les jours, puis les heures en bas */
function layoutMob() {
  const SHh = stage.offsetHeight || 800, P = {t: 122, b: 22, l: 18, r: 18}, tk = stage.classList.contains('tk'), vb = P.b + (tk ? 26 : 0);
  ['v1', 'v2', 'v3'].forEach(id => { const s = $(id).style; s.top = P.t + 'px'; s.bottom = vb + 'px'; s.left = P.l + 'px'; s.right = P.r + 'px'; });
  const ts = $('tick').style; ts.bottom = (P.b - 10) + 'px'; ts.left = P.l + 'px'; ts.right = P.r + 'px';
  const W = 480 - P.l - P.r, H = SHh - P.t - vb, HH = 92, G = 14;
  const now = $('now'), days = $('days'), hrs = $('hours'), hOn = !!cfg.show.hours, dOn = !!cfg.show.days, ns = now.style, ds = days.style, hs = hrs.style;
  stage.dataset.lay = 'mob'; let bot = H;
  hs.left = '0'; hs.right = '0'; hs.height = HH + 'px'; hs.top = 'auto'; hs.bottom = '0'; if (hOn) bot -= HH + G;
  if (dOn) {
    days.className = stage.dataset.hud && stage.dataset.hud !== 'glass' ? 'pnl' : 'glass mobd'; ds.left = '0'; ds.right = '0'; ds.width = 'auto'; ds.height = 'auto'; ds.top = 'auto'; ds.transform = '';
    days.querySelectorAll('.day').forEach(e => e.classList.remove('glass'));
    ds.bottom = (hOn ? HH + G : 0) + 'px'; bot -= days.offsetHeight + G;
  }
  ns.left = '0'; ns.width = W + 'px'; ns.top = '0'; ns.textAlign = 'left'; ns.transform = 'none'; ns.transformOrigin = 'top left';
  $('temp').style.fontSize = Math.round(118 * (SZ[cfg.layout.size] || 1) * (HT.tempScale || 1)) + 'px';
  const fh = Math.max(60, bot); now.classList.remove('cp'); let nh = now.offsetHeight || 1;
  const k = Math.min(1, (fh + 8) / nh); if (k < 1) ns.transform = 'scale(' + k.toFixed(3) + ')'; else ns.top = Math.max(0, (fh - nh) * .35) + 'px';
  schedDecor();
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layoutHud());
function applyCfg() {
  applyHud(effHud(pickTheme()));
  updHeader();
  $('n1').textContent = cfg.labels.meteo; $('n2').textContent = cfg.labels.radar; $('n3').textContent = cfg.labels.infos;
  $('n2').style.display = cfg.tabs.radar ? '' : 'none'; $('n3').style.display = cfg.tabs.infos ? '' : 'none';
  $('hours').style.display = cfg.show.hours ? '' : 'none'; $('days').style.display = cfg.show.days ? '' : 'none';
  $('mt').style.display = cfg.show.details ? '' : 'none'; $('date').style.display = cfg.show.date ? '' : 'none';
  stage.classList.toggle('tk', !!(cfg.tickerOn && cfg.ticker)); $('tks').textContent = cfg.ticker; stage.classList.toggle('lite', !!cfg.lite);
  tick(); renderWidgets(); if (lastW) renderW(lastW); else setBg('clear');
  layoutHud();
}
