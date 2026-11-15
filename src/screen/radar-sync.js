/* ===== Radar : fond Esri + radar LibreWXR/RainViewer + foudre Blitzortung ===== */
let map = null, frames = [], fi = 0, rplay = true, LP = cfg.rain, LO = cfg.bolt, hold = 0, liveIdx = 0, radarKey = '', boltLayer = null, radarStarted = false, lastRadar = 0;
const strikes = [], rg = $('rg');
const setPlay = () => { $('pi').innerHTML = rplay ? '<path d="M8 5v14M16 5v14"/>' : '<path d="M7 5l12 7-12 7z" fill="currentColor"/>'; }; setPlay();
$('cp').classList.toggle('on', LP); $('cl').classList.toggle('on', LO);
const PROV = [
  {n: 'LibreWXR', u: 'https://api.librewxr.net/public/weather-maps.json', c: 6, q: '?cells=light', z: 10, g: 'linear-gradient(90deg,#2fd05a,#e8e03a,#f08a24,#e02828)'},
  {n: 'RainViewer', u: 'https://api.rainviewer.com/public/weather-maps.json', c: 2, q: '', z: 7, g: 'linear-gradient(90deg,#8fd3ff,#2f8cff,#1b3dd6,#fff)'}
];
function initMap() {
  if (!window.L) { $('tl').textContent = 'Carte indisponible'; return; }
  map = L.map('map', {zoomControl: false, minZoom: 5, maxZoom: 10, zoomSnap: 1, preferCanvas: true, fadeAnimation: false, markerZoomAnimation: false, wheelDebounceTime: 80}).setView([LAT, LON], +cfg.zoom || 7);
  map.attributionControl.setPrefix(false); L.control.zoom({position: 'topright'}).addTo(map);
  const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/';
  const base = L.layerGroup([L.tileLayer(ESRI + 'World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {maxNativeZoom: 16, maxZoom: 19, zIndex: 1, attribution: 'Fond © Esri, HERE, Garmin, © OpenStreetMap · Radar LibreWXR / RainViewer · Foudre Blitzortung'}), L.tileLayer(ESRI + 'World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {maxNativeZoom: 16, maxZoom: 19, zIndex: 8})]).addTo(map);
  let bad = 0, good = 0;
  base.getLayers()[0].on('tileload', () => good++).on('tileerror', () => { if (++bad >= 4 && !good) { map.removeLayer(base); L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, zIndex: 1, className: 'osmdark', attribution: '© OpenStreetMap contributors · Radar LibreWXR / RainViewer · Foudre Blitzortung'}).addTo(map); } });
  [50, 100].forEach(km => L.circle([LAT, LON], {radius: km * 1000, color: '#fff', weight: 1, opacity: .3, dashArray: '4 6', fill: false, interactive: false}).addTo(map));
  L.marker([LAT, LON], {icon: L.divIcon({className: '', html: '<div class="me"></div>', iconSize: [14, 14]}), keyboard: false}).bindTooltip(cfg.name.split('·')[0].trim(), {permanent: true, direction: 'right', offset: [10, 0], className: 'tt'}).addTo(map);
  boltLayer = L.layerGroup(); if (LO) boltLayer.addTo(map);
}
const tileXY = z => { const n = 2 ** z, r = Math.PI / 180; return [Math.floor((LON + 180) / 360 * n), Math.floor((1 - Math.log(Math.tan(LAT * r) + 1 / Math.cos(LAT * r)) / Math.PI) / 2 * n)]; };
const probe = url => new Promise(res => { const im = new Image(); im.onload = () => res(true); im.onerror = () => res(false); im.src = url; setTimeout(() => res(false), 8000); });
async function loadRadar() {
  if (!map) return; lastRadar = Date.now();
  for (const p of PROV) {
    try {
      const r = await fetch(p.u); if (!r.ok) continue;
      const j = await r.json(), q = Math.max(3, +cfg.radarQ || 8), past = ((j.radar && j.radar.past) || []).slice(-q), nc = ((j.radar && j.radar.nowcast) || []).slice(0, 3); if (!past.length) continue;
      const key = p.n + past[past.length - 1].time + nc.length; if (key === radarKey) return;
      const mk = x => `${j.host}${x.path}/256/{z}/{x}/{y}/${p.c}/1_1.png${p.q}`, [tx, ty] = tileXY(5);
      if (!await probe(mk(past[past.length - 1]).replace('{z}', 5).replace('{x}', tx).replace('{y}', ty))) continue;
      radarKey = key; frames.forEach(x => map.removeLayer(x.layer));
      frames = past.map(a => [a, 0]).concat(nc.map(a => [a, 1])).map(a => ({time: a[0].time, nc: a[1], layer: L.tileLayer(mk(a[0]), {opacity: 0, maxNativeZoom: p.z, maxZoom: 10, zIndex: 5, className: 'rd', updateWhenIdle: true, updateWhenZooming: false, keepBuffer: 0}).addTo(map)}));
      liveIdx = past.length - 1; rg.max = frames.length - 1; $('leg').innerHTML = `Radar ${p.n} <b style="background:${p.g}"></b>`; showFrame(liveIdx); return;
    } catch (e) {}
  }
  $('tl').textContent = 'Radar indisponible';
}
function showFrame(i) {
  if (!frames.length) return; const prev = fi; fi = i; rg.value = i; if (frames[prev] && prev !== i) frames[prev].layer.setOpacity(0); frames[i].layer.setOpacity(LP ? .8 : 0);
  const q = frames[i], hh = new Date(q.time * 1000).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
  $('tl').textContent = q.nc ? hh + ' · prévision' : i === liveIdx ? hh + ' · live' : hh + ' · −' + Math.round((frames[liveIdx].time - q.time) / 60) + ' min';
}
$('play').onclick = () => { rplay = !rplay; setPlay(); };
rg.oninput = () => { rplay = false; setPlay(); showFrame(+rg.value); };
$('cp').onclick = e => { LP = !LP; e.currentTarget.classList.toggle('on', LP); showFrame(fi); };
$('cl').onclick = e => { LO = !LO; e.currentTarget.classList.toggle('on', LO); if (map) LO ? boltLayer.addTo(map) : map.removeLayer(boltLayer); };
setInterval(() => { if (document.hidden || view !== 2 || !rplay || frames.length < 2) return; if (fi === frames.length - 1 && hold++ < 3) return; hold = 0; showFrame((fi + 1) % frames.length); }, 650);

/* Foudre : Blitzortung (flux communautaire non officiel) */
function lzw(b) { let a, e = {}, d = b.split(''), c = d[0], g = c, o = [c], h = 256, n = h; for (let i = 1; i < d.length; i++) { a = d[i].charCodeAt(0); a = h > a ? d[i] : e[a] ? e[a] : g + c; o.push(a); c = a.charAt(0); e[n] = g + c; n++; g = a; } return o.join(''); }
const km = (la, lo) => { const r = Math.PI / 180, x = (la - LAT) * r, y = (lo - LON) * r, a = Math.sin(x / 2) ** 2 + Math.cos(LAT * r) * Math.cos(la * r) * Math.sin(y / 2) ** 2; return 12742 * Math.asin(Math.sqrt(a)); };
function addStrike(la, lo) { if (!map || Math.abs(la - LAT) > 4 || Math.abs(lo - LON) > 6) return; const m = L.circleMarker([la, lo], {radius: 4, color: '#fff3a0', weight: 1, fillColor: '#ffd21f', fillOpacity: 1, interactive: false}).addTo(boltLayer); strikes.push({t: Date.now(), d: km(la, lo), m}); if (strikes.length > 250) boltLayer.removeLayer(strikes.shift().m); }
let ws, wsOk = false, wsN = 0;
function connectWS() { try { ws = new WebSocket(`wss://ws${[1, 7, 8, 3][wsN++ % 4]}.blitzortung.org/`); ws.onopen = () => { wsOk = true; ws.send('{"a":111}'); }; ws.onmessage = e => { try { const d = JSON.parse(lzw(e.data)); addStrike(d.lat, d.lon); } catch (_) {} }; ws.onerror = () => ws.close(); ws.onclose = () => { wsOk = false; setTimeout(connectWS, 6000); }; } catch (_) { setTimeout(connectWS, 10000); } }
function ageStrikes() {
  const now = Date.now(); while (strikes.length && now - strikes[0].t > 30 * 60000) boltLayer.removeLayer(strikes.shift().m);
  if (view === 2) strikes.forEach(s => { const a = (now - s.t) / 60000; s.m.setStyle({fillOpacity: Math.max(.25, 1 - a / 30), opacity: Math.max(.2, 1 - a / 30)}); });
  $('cl').textContent = wsOk ? 'Orages · ' + strikes.filter(s => s.d <= 100).length : 'Orages'; updAlert();
}
function updAlert() { const now = Date.now(), near = strikes.filter(s => now - s.t < 15 * 60000 && s.d <= 50).map(s => s.d); $('al').textContent = near.length ? `⚡ Foudre à ${Math.round(Math.min(...near))} km` : stormAt ? `⚡ Orage prévu vers ${stormAt}` : ''; }

/* ===== Synchronisation : l'écran lit sa config sur le serveur (config.json du dépôt GitHub) =====
   Rien à appairer : tous les écrans ouverts sur le site suivent la même config. */
let srvOk = null, srvWait = 0;
async function sync() {
  if (Date.now() < srvWait) return;
  try {
    const f = await ghGet('config.json'); srvOk = true;
    if (f && f.text) applyRemote(JSON.parse(f.text));
  } catch (e) { srvOk = false; if (/ 40[39]| 429/.test(e.message)) srvWait = Date.now() + 5 * 60000; }   // limite du serveur : on patiente
}
/* L'image de la mascotte n'est envoyée qu'une fois : ensuite l'admin envoie seulement « img:empreinte » */
function mascResolve(j, old) {
  const m = j && j.masc; if (!m || !m.src) return;
  try {
    if (/^data:/.test(m.src)) localStorage.setItem('mascImg', JSON.stringify({h: imgHash(m.src), src: m.src}));
    else if (/^img:/.test(m.src)) { const h = m.src.slice(4), c = JSON.parse(localStorage.getItem('mascImg') || 'null'), o = old && old.masc && old.masc.src; m.src = c && c.h === h ? c.src : o && /^data:/.test(o) && imgHash(o) === h ? o : ''; }
  } catch (e) {}
}
function applyRemote(j) {
  if (!j || !j.v || +j.v <= +lastV) return;   // ignore une config plus ancienne que celle déjà appliquée
  lastV = j.v; const old = cfg; mascResolve(j, old); cfg = norm(Object.assign({}, DEF, j));
  if (!PV) try { localStorage.setItem('meteoCfgCache', JSON.stringify(cfg)); } catch (e) {}
  if (+cfg.lat !== +old.lat || +cfg.lon !== +old.lon || +cfg.zoom !== +old.zoom || (cfg.geo !== false) !== (old.geo !== false)) { location.reload(); return; }
  applyCfg(); resched();
  if (cfg.notice && cfg.notice.id && cfg.notice.id !== lastNotice) { lastNotice = cfg.notice.id; if (!firstSync) showNotice(cfg.notice); }
  if (cfg.fire && cfg.fire.id && cfg.fire.id !== lastFire) { lastFire = cfg.fire.id; if (!firstSync && Math.abs(Date.now() - cfg.fire.id) < 600000) setTimeout(() => runEgg(cfg.fire.egg), 400); }   // test d'un easter egg depuis l'admin
  firstSync = false;
}


/* ===== Nouvelle version du site : l'écran se recharge tout seul =====
   Toutes les 10 min, on demande à GitHub Pages si index.html a changé (ETag).
   On attend qu'aucune cinématique ni aucun roll ne soit en cours. */
let siteTag = null;
async function checkSite() {
  if (!/^https?:/.test(location.protocol) || PV) return;
  try {
    const r = await fetch(location.pathname, {method: 'HEAD', cache: 'no-cache'}), tag = r.headers.get('etag') || r.headers.get('last-modified');
    if (!r.ok || !tag) return;
    if (siteTag === null) { siteTag = tag; return; }
    if (tag !== siteTag && !cinGate && !document.querySelector('#roll')) location.reload();
  } catch (e) {}
}
checkSite(); setInterval(checkSite, 10 * 60000);
