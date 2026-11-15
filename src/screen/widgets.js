/* ===== Widgets personnalisés ===== */
let wTimers = [];
const su = u => /^(https?:\/\/|\/|\.\/|data:image\/)/i.test(String(u || '').trim()) ? String(u).trim() : '';
const jpath = (o, p) => String(p || '').split(/[.\[\]]+/).filter(Boolean).reduce((a, k) => a == null ? a : a[k], o);
function renderWidgets() {
  wTimers.forEach(clearInterval); wTimers = []; const g = $('v3');
  if (!cfg.widgets.length) { g.innerHTML = '<div id="empty">Aucun widget.<br>Ajoute-en depuis la page admin.</div>'; return; }
  g.innerHTML = cfg.widgets.map((w, i) => {
    const cs = Math.min(3, +w.w || 1), rs = Math.min(3, +w.h || 1), ih = rs * 104 + (rs - 1) * 12 - 56; let b;
    if (w.t === 'image') b = `<img id="wv${i}" alt="" src="${esc(su(w.url))}">`;
    else if (w.t === 'web') b = `<iframe id="wv${i}" src="${esc(su(w.url))}" style="height:${ih}px" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" referrerpolicy="no-referrer"></iframe>`;
    else if (w.t === 'link') b = `<a class="v sm" id="wv${i}" href="${esc(su(w.url))}" target="_blank" rel="noopener">${esc(w.text || w.url)}</a>`;
    else b = `<div class="v ${w.t === 'text' && !w.big ? 'sm' : ''}" id="wv${i}">${w.t === 'text' ? esc(w.text) : '…'}</div>`;
    return `<div class="wg glass" style="grid-column:span ${cs};grid-row:span ${rs}"><span class="l">${esc(w.title)}</span>${b}</div>`;
  }).join('');
  cfg.widgets.forEach((w, i) => {
    const el = $('wv' + i);
    if (w.t === 'clock') { const f = () => { try { el.textContent = new Date().toLocaleTimeString('fr-FR', {timeZone: w.tz || undefined, hour: '2-digit', minute: '2-digit', second: '2-digit'}); } catch (e) { el.textContent = 'Fuseau invalide'; } }; f(); wTimers.push(setInterval(f, 1000)); }
    else if (w.t === 'count') { const f = () => { const t = new Date(String(w.date).replace(' ', 'T')) - Date.now(); if (isNaN(t)) { el.textContent = 'Date invalide'; return; } if (t <= 0) { el.textContent = 'Terminé'; return; } const s = Math.floor(t / 1000); el.textContent = `${Math.floor(s / 86400)}j ${String(Math.floor(s % 86400 / 3600)).padStart(2, '0')}:${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }; f(); wTimers.push(setInterval(f, 1000)); }
    else if (w.t === 'web') { if (+w.every > 0) wTimers.push(setInterval(() => { el.src = su(w.url); }, Math.max(5, +w.every) * 1000)); }
    else if (w.t === 'value') { const f = async () => { try { const r = await fetch(w.url); const v = (r.headers.get('content-type') || '').includes('json') ? jpath(await r.json(), w.path) : (await r.text()).trim(); el.textContent = (v == null ? '—' : typeof v === 'object' ? JSON.stringify(v) : v) + (w.unit ? ' ' + w.unit : ''); } catch (e) { el.textContent = 'Erreur'; } }; f(); wTimers.push(setInterval(f, Math.max(5, +w.every || 60) * 1000)); }
  });
}
