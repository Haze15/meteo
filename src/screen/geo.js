
/* ===================================================================
   POSITION AUTOMATIQUE : l'écran détecte tout seul sa ville
   1) GPS / position du navigateur (si autorisée)  2) sinon, position de la connexion Internet
   Le résultat est gardé en mémoire et vérifié toutes les 6 heures.
   =================================================================== */
let GEO = null;
const geoOn = () => cfg.geo !== false && !PV;
try { const g = JSON.parse(localStorage.getItem('geoCache') || 'null'); if (g && isFinite(g.lat) && isFinite(g.lon) && geoOn()) { GEO = g; LAT = +g.lat; LON = +g.lon; } } catch (e) {}
/* Nom affiché : la partie après le dernier « · » est remplacée par la ville détectée */
function dispName() {
  const n = String(cfg.name || '');
  if (!geoOn() || !GEO || !GEO.city) return n;
  if (n.includes('·')) return n.slice(0, n.lastIndexOf('·')).trim() + ' · ' + GEO.city;
  return n ? n + ' · ' + GEO.city : GEO.city;
}
const jget = async (u, ms = 8000) => { const c = window.AbortController ? new AbortController() : null, t = c && setTimeout(() => c.abort(), ms); try { const r = await fetch(u, c ? {signal: c.signal} : {}); if (!r.ok) throw 0; return await r.json(); } finally { clearTimeout(t); } };
let geoBusy = false;
async function geoDetect() {
  if (!geoOn() || geoBusy) return; geoBusy = true;
  try {
    let p = null, city = '';
    /* GPS seulement si déjà autorisé (sinon une demande d'autorisation sans réponse bloquerait tout) */
    let perm = 'unknown'; try { if (navigator.permissions) perm = (await navigator.permissions.query({name: 'geolocation'})).state; } catch (e) {}
    if (navigator.geolocation && perm !== 'denied' && perm !== 'prompt') try { p = await Promise.race([new Promise((ok, ko) => navigator.geolocation.getCurrentPosition(x => ok({lat: x.coords.latitude, lon: x.coords.longitude}), ko, {timeout: 9000, maximumAge: 6 * 3600e3})), new Promise((_, ko) => setTimeout(ko, 10000))]); } catch (e) { p = null; }
    if (p) try { const j = await jget(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${p.lat}&longitude=${p.lon}&localityLanguage=fr`); city = j.city || j.locality || ''; } catch (e) {}
    if (!p || !city) for (const u of ['https://ipwho.is/?lang=fr', 'https://get.geojs.io/v1/ip/geo.json']) {
      try { const j = await jget(u), la = +j.latitude, lo = +j.longitude; if (j.success === false || !isFinite(la) || !isFinite(lo) || (!la && !lo)) continue; if (!p) p = {lat: la, lon: lo}; city = city || j.city || ''; break; } catch (e) {}
    }
    if (!p) return;
    const moved = Math.hypot((p.lat - LAT) * 111, (p.lon - LON) * 111 * Math.cos(LAT * Math.PI / 180)) > 3;
    GEO = {lat: +(+p.lat).toFixed(4), lon: +(+p.lon).toFixed(4), city: city || (GEO && GEO.city) || '', t: Date.now()};
    try { localStorage.setItem('geoCache', JSON.stringify(GEO)); } catch (e) {}
    if (moved) {   // nouvelle position : on recharge une fois (météo, radar, air) sans rejouer le démarrage
      try { sessionStorage.setItem('skipBoot', '1'); } catch (e) {}
      location.reload(); return;
    }
    updHeader(); if (lastW) renderW(lastW);
  } finally { geoBusy = false; }
}
setTimeout(geoDetect, cfg.boot && cfg.boot.on !== false && !QS.get('noboot') ? 8000 : 2500); setInterval(geoDetect, 6 * 3600e3);
