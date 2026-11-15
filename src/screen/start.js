
/* ===== Démarrage ===== */
/* Version mobile : en portrait (téléphone), l'écran passe en colonne (480 px de large).
   Les cinématiques gardent leur format 800 × 480 et s'affichent dans un bandeau au milieu. ?mobile=1 / ?mobile=0 pour forcer. */
let MOBV = null, SW = 800, SH = 480;
const MBOX = document.createElement('div'); MBOX.id = 'mbox';
const MFIT = ['boot', 'lboot', 'roll', 'tsc', 'abc', 'crc', 'vdc', 'infc', 'x0sc', 'nvc', 'prc', 'trc', 'x0c', 'xrv', 'gnc', 'x0b'];
new MutationObserver(ms => { if (!MOBV) return; ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && MFIT.includes(n.id)) { if (!MBOX.isConnected) stage.appendChild(MBOX); MBOX.appendChild(n); } })); }).observe(stage, {childList: true});
function fit() {
  const q = QS.get('mobile'), mob = !PV && q !== '0' && (q === '1' || (innerHeight > innerWidth * 1.15 && innerWidth < 1000));
  if (mob) { SW = 480; SH = Math.round(Math.max(720, Math.min(1100, 480 * innerHeight / Math.max(1, innerWidth)))); } else { SW = 800; SH = 480; }
  const ch = mob !== MOBV || stage.offsetHeight !== SH; MOBV = mob;
  stage.classList.toggle('mob', mob); stage.style.width = SW + 'px'; stage.style.height = SH + 'px';
  const fk = SW / 800; stage.style.setProperty('--cov', Math.max(SW / 800, SH / 480).toFixed(4));
  MBOX.style.transform = `translate(0px,${((SH - 480 * fk) / 2).toFixed(1)}px) scale(${fk.toFixed(4)})`;
  const s = Math.min(innerWidth / SW, innerHeight / SH); stage.style.transform = `translate(${(innerWidth - SW * s) / 2}px,${(innerHeight - SH * s) / 2}px) scale(${s})`;
  if (ch && MOBV !== null) { try { if (typeof layoutHud === 'function' && typeof cfg !== 'undefined' && cfg.layout) layoutHud(); } catch (e) {} try { if (typeof map !== 'undefined' && map) setTimeout(() => map.invalidateSize(), 300); } catch (e) {} }
}
addEventListener('resize', fit); fit();
let skipB = false; try { skipB = sessionStorage.getItem('skipBoot') === '1'; sessionStorage.removeItem('skipBoot'); } catch (e) {}
if (!PV && !QS.get('noboot') && !skipB) runBoot();
let wInt; function resched() { clearInterval(wInt); wInt = setInterval(loadWeather, Math.max(2, +cfg.refresh || 10) * 60000); }
rollLucky(); if (!PV) initMap(); applyCfg(); show(PV ? 1 : cfg.view === 'radar' && cfg.tabs.radar ? 2 : cfg.view === 'infos' && cfg.tabs.infos ? 3 : 1);
requestAnimationFrame(fx); loadWeather(); resched(); setInterval(() => { if (view === 2 && radarStarted) loadRadar(); }, 5 * 60000);
if (QS.get('egg')) setTimeout(() => runEgg(QS.get('egg')), 1800);
if (PV) {
  /* Aperçu : page météo seule, sans radar ni liaison réseau ; la config arrive du panel admin */
  stage.classList.add('pv');
  addEventListener('message', e => {
    const d = e.data; if (!d) return;
    if (d.type === 'preview-egg' && d.egg) { eggBusy = 0; runEgg(d.egg); return; }
    if (d.type !== 'preview-config' || !d.cfg) return;
    const moved = +d.cfg.lat !== LAT || +d.cfg.lon !== LON;
    cfg = norm(Object.assign({}, DEF, d.cfg)); LAT = +cfg.lat; LON = +cfg.lon;
    applyCfg(); if (moved) loadWeather();
  });
  try { parent.postMessage({type: 'preview-ready'}, '*'); } catch (e) {}
} else {
connectWS(); setInterval(ageStrikes, 5000);
sync().then(() => { firstSync = false; }); setInterval(sync, 20000);
}
</script>
</body>
</html>
