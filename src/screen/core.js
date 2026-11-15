const $ = id => document.getElementById(id), stage = $('stage');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const QS = new URLSearchParams(location.search);   // tests : ?w=hail  ?hud=retro  ?date=2026-10-31T21:00  ?egg=ghost  ?chance=1
/* Horloge (décalable pour tester les fêtes : ?date=AAAA-MM-JJTHH:MM) */
const TOFF = (() => { const d = QS.get('date'); if (!d) return 0; const t = new Date(d).getTime(); return isNaN(t) ? 0 : t - Date.now(); })();
const clock = () => new Date(Date.now() + TOFF);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const hexA = (h, a) => { const n = parseInt(String(h).replace('#', ''), 16) || 0; return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
const noAcc = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const UP = s => String(s).toUpperCase();
const pad2 = n => String(n).padStart(2, '0');
const ROMAN = n => { if (n <= 0) return ''; const R = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]; let s = '', v = n; if (v >= 1000) { s += 'M'.repeat(Math.floor(v / 1000)); v %= 1000; } [[900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL']].concat(R).forEach(([k, r]) => { while (v >= k) { s += r; v -= k; } }); return s; };
const FR_D = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'], FR_M = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/*__SHARED_CONFIG__*/

let cfg;
try { cfg = Object.assign({}, DEF, JSON.parse(localStorage.getItem('meteoCfgCache') || '{}')); } catch (e) { cfg = Object.assign({}, DEF); }
cfg = norm(cfg);
const PV = QS.get('preview') === '1';   // aperçu intégré dans le panel admin
let LAT = +cfg.lat, LON = +cfg.lon;
const CID = Math.random().toString(36).slice(2, 10);
let lastV = cfg.v || 0, firstSync = true, lastNotice = (cfg.notice || {}).id || 0, lastFire = (cfg.fire || {}).id || 0;
const shortCity = () => (typeof GEO !== 'undefined' && GEO && GEO.city && typeof geoOn === 'function' && geoOn()) ? GEO.city : (String(cfg.name || '').split('·').pop().trim() || cfg.name);

/* ===================================================================
   ICÔNES : 7 familles (traits, glyphes, pixel, mono LCD, ASCII, BD, kawaii)
   =================================================================== */
const CL = '<path d="M7 18h10a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 7.1 9.2 4.4 4.4 0 0 0 7 18z"/>', UPC = '<g transform="translate(0,-4)">' + CL + '</g>', Y = 'stroke="#FFD25A"';
const PCL = '<path d="M8 19h10a3.8 3.8 0 0 0 .5-7.57A5 5 0 0 0 9 10.8 4 4 0 0 0 8 19z"/>';
const I = {
  sun: `<circle cx="12" cy="12" r="4" ${Y}/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" ${Y}/>`,
  partly: `<circle cx="8" cy="8" r="2.6" ${Y}/><path d="M8 2.5v1M2.5 8h1M3.9 3.9l.7.7M12.1 3.9l-.7.7" ${Y}/>` + PCL,
  pnight: '<path d="M10.2 8.6A3.8 3.8 0 0 1 5.4 3.8a3.8 3.8 0 1 0 4.8 4.8z" style="stroke:var(--moon,#E8ECFF)"/>' + PCL,
  cloud: CL, fog: UPC + '<path d="M6 17h12M8 20h8"/>', rain: UPC + '<path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>',
  storm: UPC + `<path d="M12.5 14l-2.5 4h3l-1.5 3.5" ${Y}/>`,
  snow: UPC + '<circle cx="8" cy="18" r=".7" fill="currentColor"/><circle cx="12" cy="20" r=".7" fill="currentColor"/><circle cx="16" cy="18" r=".7" fill="currentColor"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" style="stroke:var(--moon,#E8ECFF)"/>'
};
const GLY = {sun: '☀\uFE0E', partly: '☁\uFE0E', pnight: '☾', cloud: '☁\uFE0E', fog: '≋', rain: '☂\uFE0E', storm: 'ϟ', snow: '❄\uFE0E', moon: '☾'};
const ASC = {
  sun: '    \\   /\n     .-.\n  ― (   ) ―\n     `-’\n    /   \\',
  partly: '   \\  /\n _ /"".-.\n   \\_(   ).\n   /(___(__)\n',
  pnight: '    _\n   ( `.-.\n    `(   ).\n    (___(__)\n',
  cloud: '\n     .--.\n  .-(    ).\n (___.__)__)\n',
  fog: '\n _ - _ - _ -\n  _ - _ - _\n _ - _ - _ -\n',
  rain: '     .-.\n    (   ).\n   (___(__)\n    ‘ ‘ ‘ ‘\n   ‘ ‘ ‘ ‘',
  storm: '     .-.\n    (   ).\n   (___(__)\n    ⚡‘‘⚡‘‘\n   ‘ ⚡‘ ‘',
  snow: '     .-.\n    (   ).\n   (___(__)\n    *  *  *\n   *  *  *',
  moon: '    _..\n  .\'  .-\'\n :   :\n  \'. \'.__.;\n    \'-..-\''
};
const ASCS = {sun: '[SOL]', partly: '[ECL]', pnight: '[NUA]', cloud: '[NUA]', fog: '[BRM]', rain: '[PLU]', storm: '[ORG]', snow: '[NEI]', moon: '[LUN]'};
/* Icônes pixel 16x16 : . vide  y jaune  o orange  w blanc  g gris  d contour  b bleu  c cyan  k nuage sombre  m lune */
const PXC = {y: '#ffd23f', o: '#f08a24', w: '#f4f4f4', g: '#a8b2c2', d: '#2b2f45', b: '#3fa9f5', c: '#bfe8ff', k: '#646c82', m: '#f6efc4'};
const PXCLOUD = ['......dddd......', '.....dwwwwd.....', '...ddwwwwwwd....', '..dwwwwwwwwwdd..', '..dwwwwwwwwwwwd.', '.dwwwwwwwwwwwwwd', '.dwwwwwwwwwwwwwd', '.dgwwwwwwwwwwwgd', '..dggggggggggd..', '...dddddddddd...'];
const PXDARK = PXCLOUD.map(r => r.replace(/w/g, 'k').replace(/g/g, 'd'));
const PX = {
  sun: ['................', '.......yy.......', '..y....yy....y..', '...y........y...', '......oooo......', '.....oyyyyo.....', '....oyyyyyyo....', '.yy.oyyyyyyo.yy.', '.yy.oyyyyyyo.yy.', '....oyyyyyyo....', '.....oyyyyo.....', '......oooo......', '...y........y...', '..y....yy....y..', '.......yy.......', '................'],
  moon: ['................', '......mmmm......', '....mmmm........', '...mmmm.........', '..mmmm..........', '..mmm...........', '.mmmm...........', '.mmmm...........', '.mmmm...........', '.mmmmm..........', '..mmmmm.......m.', '..mmmmmmm...mmm.', '...mmmmmmmmmmm..', '....mmmmmmmmm...', '......mmmmm.....', '................'],
  cloud: ['................', '................', '................'].concat(PXCLOUD, ['...', '...', '...']),
  partly: ['..y.............', '...y.oooo.......', '....oyyyyo......', '...oyyyyyyo.....', 'yy.oyy' + PXCLOUD[0].slice(6), '...oy' + PXCLOUD[1].slice(5), '....' + PXCLOUD[2].slice(4)].concat(PXCLOUD.slice(3), ['', '', '']),
  pnight: ['..mmm...........', '.mm.............', 'mmm.............', 'mmm...' + PXCLOUD[0].slice(6), '.mmm.' + PXCLOUD[1].slice(5), '..mm' + PXCLOUD[2].slice(4)].concat(PXCLOUD.slice(3), ['', '', '', '']),
  rain: PXCLOUD.concat(['................', '..b...b...b...b.', '.b...b...b...b..', '................', '...b...b...b....', '..b...b...b.....']),
  storm: PXDARK.concat(['................', '.......yyyy.....', '......yyyy......', '.....yyyyyyy....', '.......yyy......', '......yy........']),
  snow: PXCLOUD.concat(['................', '..c....c....c...', '.ccc..ccc..ccc..', '..c....c....c...', '....c....c......', '...ccc..ccc.....']),
  fog: ['................', '................'].concat(PXCLOUD.slice(0, 8), ['................', '.gggggggggggggg.', '................', '...gggggggggg...', '................', '.ggggggggggggg..'])
};
function pix(k, s, mono) {
  const rows = PX[k] || PX.cloud; let r = '';
  rows.forEach((row, y) => { let x = 0; while (x < 16) { const ch = row[x] || '.'; let n = 1; while (x + n < 16 && (row[x + n] || '.') === ch) n++; if (ch !== '.') { const col = mono ? 'currentColor' : PXC[ch], op = mono ? (ch === 'w' ? 0 : 'gck'.includes(ch) ? .45 : 1) : 1; if (op) r += `<rect x="${x}" y="${y}" width="${n}" height="1" fill="${col}"${op < 1 ? ` opacity="${op}"` : ''}/>`; } x += n; } });
  return `<svg class="px" width="${s}" height="${s}" viewBox="0 0 16 16" shape-rendering="crispEdges">${r}</svg>`;
}
/* BD (contours noirs, aplats) et kawaii (pastel + petits visages) */
function duo(k, kw) {
  const S = kw ? '#8a5a8a' : '#151515', W = kw ? 1.3 : 1.6;
  const cl = (dy, f) => `<path transform="translate(0,${dy})" d="M7 18h10a4 4 0 0 0 .6-7.96A5.5 5.5 0 0 0 7.1 9.2 4.4 4.4 0 0 0 7 18z" fill="${f}" stroke="${S}" stroke-width="${W}"/>`;
  const pcl = f => `<path d="M8 19h10a3.8 3.8 0 0 0 .5-7.57A5 5 0 0 0 9 10.8 4 4 0 0 0 8 19z" fill="${f}" stroke="${S}" stroke-width="${W}"/>`;
  const sun = (cx, cy, r, rl) => { let p = ''; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, c = Math.cos(a), s = Math.sin(a); p += `M${(cx + c * (r + 1.6)).toFixed(1)} ${(cy + s * (r + 1.6)).toFixed(1)}L${(cx + c * (r + 1.6 + rl)).toFixed(1)} ${(cy + s * (r + 1.6 + rl)).toFixed(1)}`; } return `<path d="${p}" stroke="${kw ? '#ffb36b' : '#f59e0b'}" stroke-width="${W + .4}" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${kw ? '#ffe28a' : '#ffd23f'}" stroke="${S}" stroke-width="${W}"/>`; };
  const moon = (sc, tx, ty) => `<path transform="translate(${tx},${ty}) scale(${sc})" d="M18.5 14.5A7.5 7.5 0 0 1 9.5 5.5a7.5 7.5 0 1 0 9 9z" fill="${kw ? '#fff1b8' : '#ffe9a8'}" stroke="${S}" stroke-width="${W / sc}"/>`;
  const face = (x, y, m, z = 1) => { if (!kw) return ''; const e = m === 'sleep' ? `<path d="M${x - 2.2 * z} ${y}q${.8 * z} ${.7 * z} ${1.6 * z} 0M${x + .6 * z} ${y}q${.8 * z} ${.7 * z} ${1.6 * z} 0" stroke="${S}" stroke-width=".8" fill="none"/>` : `<circle cx="${x - 1.5 * z}" cy="${y}" r="${.6 * z}" fill="${S}"/><circle cx="${x + 1.5 * z}" cy="${y}" r="${.6 * z}" fill="${S}"/>`; const mo = m === 'sad' ? `<path d="M${x - .9 * z} ${y + 1.9 * z}q${.9 * z} -${.8 * z} ${1.8 * z} 0" stroke="${S}" stroke-width=".8" fill="none"/>` : m === 'wow' ? `<circle cx="${x}" cy="${y + 1.7 * z}" r="${.55 * z}" fill="${S}"/>` : `<path d="M${x - .9 * z} ${y + 1.2 * z}q${.9 * z} ${.9 * z} ${1.8 * z} 0" stroke="${S}" stroke-width=".8" fill="none"/>`; return e + mo + `<circle cx="${x - 2.6 * z}" cy="${y + 1.1 * z}" r="${.7 * z}" fill="#ff9ec7" opacity=".7"/><circle cx="${x + 2.6 * z}" cy="${y + 1.1 * z}" r="${.7 * z}" fill="#ff9ec7" opacity=".7"/>`; };
  const W0 = kw ? '#f7f8ff' : '#fff';
  switch (k) {
    case 'sun': return sun(12, 12, 5.2, 2.2) + face(12, 11.6, 'happy', 1.05);
    case 'moon': return moon(1, 0, 0) + face(10.5, 14, 'sleep', .9);
    case 'partly': return sun(8, 8, 3.3, 1.5) + pcl(W0) + face(13.2, 14.6, 'happy', .9);
    case 'pnight': return moon(.55, 1, 0) + pcl(W0) + face(13.2, 14.6, 'sleep', .9);
    case 'cloud': return cl(0, W0) + face(12.2, 13.6, 'happy', .95);
    case 'fog': return cl(-4, kw ? '#eef0f8' : '#e8ecf2') + `<path d="M5 17h14M7 20.5h10" stroke="#9aa4b5" stroke-width="2" stroke-linecap="round"/>` + face(12.2, 9.6, 'sleep', .9);
    case 'rain': return cl(-4, W0) + [[8, 17.5], [12, 19.5], [16, 17.5]].map(([x, y]) => `<path d="M${x} ${y - 1.8}c-1.2 1.6-1.5 2.4-1.5 3a1.5 1.5 0 0 0 3 0c0-.6-.3-1.4-1.5-3z" fill="${kw ? '#8fd0ff' : '#3fa9f5'}" stroke="${S}" stroke-width=".9"/>`).join('') + face(12.2, 9.6, 'sad', .9);
    case 'storm': return cl(-4, kw ? '#c6cbe0' : '#8a94a8') + `<path d="M12.6 13.2l-3.2 5h3l-1.6 4.4 4.8-6.2h-3.1l1.7-3.2z" fill="#ffd23f" stroke="${S}" stroke-width="${W * .8}" stroke-linejoin="round"/>` + face(12.2, 9.6, 'wow', .9);
    case 'snow': return cl(-4, W0) + [[8, 18], [12, 20.5], [16, 18]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="${kw ? '#fff' : '#d9f2ff'}" stroke="${S}" stroke-width=".9"/>`).join('') + face(12.2, 9.6, 'happy', .9);
  }
  return cl(0, W0);
}
let HT;   // thème d'interface actif (défini plus bas)
function ico(k, s = 28, big) {
  const m = (HT && HT.icons) || 'line';
  if (m === 'ascii') return big ? `<pre class="asc">${esc(ASC[k] || ASC.cloud)}</pre>` : `<span class="ico asc-s">${ASCS[k] || '[---]'}</span>`;
  if (m === 'glyph') return `<span class="ico gl g-${k}" style="font-size:${Math.round(s * .9)}px;width:${s}px;height:${s}px">${GLY[k] || '☁'}</span>`;
  if (m === 'pixel' || m === 'mono') return `<span class="ico">${pix(k, s, m === 'mono')}</span>`;
  if (m === 'duo' || m === 'kawaii') return `<span class="ico"><svg class="duo" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">${duo(k, m === 'kawaii')}</svg></span>`;
  return `<span class="ico"><svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">${I[k] || I.cloud}</svg></span>`;
}
const iconOf = (c, d) => c <= 1 ? (d ? 'sun' : 'moon') : c === 2 ? (d ? 'partly' : 'pnight') : c === 3 ? 'cloud' : (c === 45 || c === 48) ? 'fog' : c >= 95 ? 'storm' : ((c >= 71 && c <= 77) || c === 85 || c === 86) ? 'snow' : 'rain';

/* ===================================================================
   RENDUS DE LA TEMPÉRATURE : afficheur 7 segments, jauge, anneau, hublot, palettes
   =================================================================== */
const SEGS = {a: [6, 1.2, 'h'], b: [10.8, 6.1, 'v'], c: [10.8, 15.9, 'v'], d: [6, 20.8, 'h'], e: [1.2, 15.9, 'v'], f: [1.2, 6.1, 'v'], g: [6, 11, 'h']};
const DIG = {0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg', '-': 'g', ' ': ''};
const segPoly = (cx, cy, o, L = 8.6, t = 2.2) => { const h = L / 2, q = t / 2; return o === 'h' ? `${cx - h},${cy} ${cx - h + q},${cy - q} ${cx + h - q},${cy - q} ${cx + h},${cy} ${cx + h - q},${cy + q} ${cx - h + q},${cy + q}` : `${cx},${cy - h} ${cx + q},${cy - h + q} ${cx + q},${cy + h - q} ${cx},${cy + h} ${cx - q},${cy + h - q} ${cx - q},${cy - h + q}`; };
function seg(str, deg) {
  let x = 0, out = '';
  [...String(str)].forEach(ch => { const on = DIG[ch] ?? ''; Object.keys(SEGS).forEach(s => { const [cx, cy, o] = SEGS[s]; out += `<polygon points="${segPoly(cx + x, cy, o)}" class="${on.includes(s) ? 'on' : 'off'}"/>`; }); x += 13.4; });
  if (deg) { out += `<circle cx="${x + 2.2}" cy="3.4" r="2.3" fill="none" stroke="currentColor" stroke-width="1.5"/>`; x += 6.5; }
  const w = x + 2;
  return `<svg class="seg" viewBox="-1 -1 ${w} 24" style="width:${(w / 24).toFixed(3)}em;height:1em"><g transform="skewX(-7) translate(2,0)" fill="currentColor">${out}</g></svg>`;
}
const arc = (r, a0, a1) => { const p = a => [100 + r * Math.sin(a * Math.PI / 180), 100 - r * Math.cos(a * Math.PI / 180)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
const TR = () => cfg.unit === 'F' ? [14, 104, 18] : [-10, 40, 10];
const angT = v => { const [lo, hi] = TR(); return -135 + clamp((v - lo) / (hi - lo), 0, 1) * 270; };
const GAUGE = {
  gauge: () => {
    const [lo, hi, st] = TR(); let tk = '', lb = '';
    for (let v = lo; v <= hi + .01; v += st / 5) { const a = angT(v), M = Math.abs((v - lo) % st) < .01, r0 = M ? 64 : 69, s = Math.sin(a * Math.PI / 180), c = Math.cos(a * Math.PI / 180); tk += `<line x1="${100 + 76 * s}" y1="${100 - 76 * c}" x2="${100 + r0 * s}" y2="${100 - r0 * c}" stroke="#2a1707" stroke-width="${M ? 2.6 : 1.2}"/>`; if (M) lb += `<text x="${100 + 52 * s}" y="${104 - 52 * c}" text-anchor="middle" font-size="11" fill="#2a1707">${Math.round(v)}</text>`; }
    return `<svg class="gz" viewBox="0 0 200 200"><defs><radialGradient id="gzb" cx=".35" cy=".3"><stop offset="0" stop-color="#ffe7a8"/><stop offset=".5" stop-color="#c8913e"/><stop offset="1" stop-color="#6b4512"/></radialGradient><radialGradient id="gzf" cx=".4" cy=".35"><stop offset="0" stop-color="#fbf1d6"/><stop offset="1" stop-color="#d9c08a"/></radialGradient></defs>
      <circle cx="100" cy="100" r="97" fill="url(#gzb)"/><circle cx="100" cy="100" r="86" fill="#3b2410"/><circle cx="100" cy="100" r="83" fill="url(#gzf)"/>
      <path d="${arc(73, -135, angT(cfg.unit === 'F' ? 32 : 0))}" stroke="#3b7fc4" stroke-width="7" fill="none" opacity=".7"/><path d="${arc(73, angT(cfg.unit === 'F' ? 86 : 30), 135)}" stroke="#c43b2b" stroke-width="7" fill="none" opacity=".75"/>
      ${tk}<g font-family="Special Elite,Georgia,serif">${lb}<text x="100" y="138" text-anchor="middle" font-size="8" letter-spacing="2" fill="#5a3a12">THERMOMÈTRE</text><text class="gv" x="100" y="166" text-anchor="middle" font-size="26" fill="#2a1707">--°</text></g>
      <g class="nd" style="transform:rotate(-135deg)"><path d="M100 30l4 70h-8z" fill="#8b1a1a"/><path d="M98 100h4l-1 22h-2z" fill="#2a1707"/></g><circle cx="100" cy="100" r="9" fill="url(#gzb)" stroke="#3b2410" stroke-width="2"/>
      ${[45, 135, 225, 315].map(a => `<circle cx="${100 + 91 * Math.sin(a * Math.PI / 180)}" cy="${100 - 91 * Math.cos(a * Math.PI / 180)}" r="3" fill="#5a3a12"/>`).join('')}</svg>`;
  },
  ring: () => {
    let tk = ''; for (let i = 0; i < 60; i++) { const a = i * 6, s = Math.sin(a * Math.PI / 180), c = Math.cos(a * Math.PI / 180), L = i % 5 ? 4 : 9; tk += `<line x1="${100 + 96 * s}" y1="${100 - 96 * c}" x2="${100 + (96 - L) * s}" y2="${100 - (96 - L) * c}" stroke="#7fe0ff" stroke-width="${i % 5 ? 1 : 2}" opacity="${i % 5 ? .45 : .9}"/>`; }
    return `<svg class="gz" viewBox="0 0 200 200"><g class="spin">${tk}</g><circle class="spin2" cx="100" cy="100" r="80" fill="none" stroke="#7fe0ff" stroke-width="1" stroke-dasharray="3 9" opacity=".6"/>
      <path d="${arc(70, -135, 135)}" stroke="rgba(127,224,255,.18)" stroke-width="9" fill="none"/><path class="pr" d="${arc(70, -135, 135)}" stroke="#7fe0ff" stroke-width="9" fill="none" stroke-linecap="round" style="stroke-dasharray:0 400;filter:drop-shadow(0 0 6px #7fe0ff)"/>
      <circle cx="100" cy="100" r="58" fill="rgba(8,36,68,.55)" stroke="rgba(127,224,255,.4)"/><text x="100" y="76" text-anchor="middle" font-family="Orbitron,Rajdhani,sans-serif" font-size="9" letter-spacing="3" fill="#7fe0ff">TEMP · EXT</text>
      <text class="gv" x="100" y="120" text-anchor="middle" font-family="Orbitron,Rajdhani,sans-serif" font-size="44" font-weight="500" fill="#fff" style="filter:drop-shadow(0 0 8px #7fe0ff)">--°</text><text class="gu" x="100" y="140" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="9" letter-spacing="2" fill="#7fe0ff"></text></svg>`;
  },
  port: () => `<svg class="gz" viewBox="0 0 200 200"><defs><radialGradient id="pob" cx=".35" cy=".3"><stop offset="0" stop-color="#ffe7a8"/><stop offset=".55" stop-color="#c8913e"/><stop offset="1" stop-color="#5a3a12"/></radialGradient><radialGradient id="pog" cx=".35" cy=".3"><stop offset="0" stop-color="rgba(160,220,255,.55)"/><stop offset="1" stop-color="rgba(10,40,60,.85)"/></radialGradient></defs>
      <circle cx="100" cy="100" r="98" fill="url(#pob)"/><circle cx="100" cy="100" r="80" fill="#3b2410"/><circle cx="100" cy="100" r="76" fill="url(#pog)"/>
      ${Array.from({length: 10}, (_, i) => { const a = i * 36 * Math.PI / 180; return `<circle cx="${100 + 89 * Math.sin(a)}" cy="${100 - 89 * Math.cos(a)}" r="4.4" fill="#e9d29a" stroke="#5a3a12" stroke-width="1.5"/>`; }).join('')}
      <path d="M52 64Q74 36 112 34" stroke="rgba(255,255,255,.55)" stroke-width="6" fill="none" stroke-linecap="round"/>
      <text class="gv" x="100" y="120" text-anchor="middle" font-family="Oswald,Arial Narrow,sans-serif" font-size="58" font-weight="600" fill="#fff" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))">--°</text></svg>`
};
const GUPD = {
  gauge: (el, v) => { el.querySelector('.gv').textContent = v + '°'; const n = el.querySelector('.nd'); setTimeout(() => { n.style.transform = `rotate(${angT(v)}deg)`; }, 60); },
  ring: (el, v) => { el.querySelector('.gv').textContent = v + '°'; el.querySelector('.gu').textContent = cfg.unit === 'F' ? 'FAHRENHEIT' : 'CELSIUS'; const [lo, hi] = TR(), L = 2 * Math.PI * 70 * .75, p = el.querySelector('.pr'); setTimeout(() => { p.style.strokeDasharray = `${(L * clamp((v - lo) / (hi - lo), .01, 1)).toFixed(1)} 400`; }, 60); },
  port: (el, v) => { el.querySelector('.gv').textContent = v + '°'; }
};
function flapHTML(str, prev) { const P = [...String(prev || '')]; return '<span class="flap">' + [...String(str)].map((ch, i) => ch === ' ' ? '<b class="sp"> </b>' : `<b class="${P[i] !== ch ? 'fl' : ''}" style="animation-delay:${i * 70}ms">${esc(ch)}</b>`).join('') + '</span>'; }
function setTemp(v) {
  const el = $('temp'), m = HT.temp || 'text', s = v + '°';
  if (m === 'text') { el.textContent = s; return; }
  if (m === 'chars') { const bz = HT.id === 'neon' ? (clock().getDate() + v) % s.length : -1; el.innerHTML = [...s].map((c, i) => `<span${i === bz ? ' class="bz"' : ''}>${esc(c)}</span>`).join(''); return; }
  if (m === 'seg') { el.innerHTML = seg(String(v), true); return; }
  if (m === 'fig') { el.innerHTML = figHTML(s); return; }
  if (m === 'flap') { if (el.dataset.prev !== s) { el.innerHTML = flapHTML(s, el.dataset.prev); el.dataset.prev = s; } return; }
  if (GAUGE[m]) { if (el.dataset.m !== m) { el.innerHTML = GAUGE[m](); el.dataset.m = m; } GUPD[m](el, v); }
}

/* ===================================================================
   TEXTES D'AMBIANCE : chaque thème a sa « voix »
   =================================================================== */
function kindOf(code, day, s) {
  if (['wind', 'heat', 'rainbow', 'lucky', 'dawn', 'dusk', 'frost', 'fullmoon', 'cloudnight', 'blizzard'].includes(s)) return s;
  if (code <= 1) return day ? 'clear' : 'clearN';
  if (code === 2) return day ? 'partly' : 'partlyN';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if (code >= 96) return 'hail';
  if (code === 95) return 'storm';
  if ([56, 57, 66, 67].includes(code)) return 'sleet';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 51 && code <= 55) return 'drizzle';
  if (code === 65 || code === 82) return 'pour';
  return 'rain';
}
const KFB = {pour: 'rain', sleet: 'rain', hail: 'storm', blizzard: 'snow', partlyN: 'cloudy', cloudnight: 'cloudy', fullmoon: 'clearN'};
const pickP = a => Array.isArray(a) ? a[(clock().getHours() + clock().getDate()) % a.length] : a;
const dShort = dt => dt.toLocaleDateString('fr-FR', {weekday: 'short'}).replace('.', '');
const VD = {
  hl: c => `Max ${c.mx}° · Min ${c.mn}°`,
  mt: c => `Ressenti ${c.fe}° · Humidité ${c.hu}% · Vent ${c.wi} km/h`,
  day: dShort, hr: (h, n) => n ? h + 'h' : 'Now', tx: d => d,
  city: () => typeof dispName === 'function' ? dispName() : cfg.name,
  date: dt => cap(dt.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'})) + ' · ' + dt.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})
};
const D3 = dt => UP(noAcc(dShort(dt))).slice(0, 3);
const HM = dt => pad2(dt.getHours()) + ':' + pad2(dt.getMinutes());
const longDate = dt => cap(FR_D[dt.getDay()]) + ' ' + dt.getDate() + ' ' + FR_M[dt.getMonth()];
const bar = (v, w) => `<span class="bar${w ? ' w' : ''}"><i style="width:${clamp(v, 0, 100)}%"></i></span>`;
function voiceDesc(V, c) {
  const k = c.k, P = V.d && (V.d[k] || V.d[KFB[k]]);
  return P ? pickP(P) : (V.tx || VD.tx)(c.base, c);
}
/* Statuts du tableau des départs (thème aéroport) */
const FLST = k => ({clear: ['À L\'HEURE', 'ok'], clearN: ['À L\'HEURE', 'ok'], partly: ['À L\'HEURE', 'ok'], partlyN: ['À L\'HEURE', 'ok'], cloudy: ['EMBARQUEMENT', 'wt'], cloudnight: ['EMBARQUEMENT', 'wt'], fog: ['RETARDÉ', 'dl'], drizzle: ['RETARDÉ', 'dl'], rain: ['RETARDÉ', 'dl'], snow: ['RETARDÉ', 'dl'], sleet: ['RETARDÉ', 'dl'], wind: ['RETARDÉ', 'dl'], pour: ['ANNULÉ', 'cx'], storm: ['ANNULÉ', 'cx'], hail: ['ANNULÉ', 'cx'], blizzard: ['ANNULÉ', 'cx']}[k] || ['À L\'HEURE', 'ok']);
/* METAR (thème cockpit) */
function metar(c) {
  const d = clock(), u = `${pad2(d.getUTCDate())}${pad2(d.getUTCHours())}${pad2(Math.floor(d.getUTCMinutes() / 30) * 30)}Z`;
  const kt = Math.round(c.wi / 1.852), gk = Math.round((c.gu || 0) / 1.852), dir = c.wd == null ? 'VRB' : pad2(Math.round(c.wd / 10) * 10 % 360 || 360).padStart(3, '0');
  const vis = c.vis == null ? '9999' : c.vis >= 9999 ? '9999' : String(Math.round(c.vis / 100) * 100).padStart(4, '0');
  const W = {drizzle: 'DZ', rain: 'RA', pour: '+RA', sleet: 'FZRA', snow: 'SN', blizzard: '+SN', storm: 'TSRA', hail: 'TSGR', fog: 'FG'}[c.k] || '';
  const cc = c.cc == null ? 50 : c.cc, cl = cc < 6 ? 'NSC' : cc < 25 ? 'FEW030' : cc < 50 ? 'SCT025' : cc < 88 ? 'BKN018' : 'OVC010';
  const T = v => v < 0 ? 'M' + pad2(-v) : pad2(v), Tc = cfg.unit === 'F' ? Math.round((c.T - 32) * 5 / 9) : c.T, Td = cfg.unit === 'F' ? Math.round((c.td - 32) * 5 / 9) : c.td;
  return `METAR ${UP(cfg.icao || 'LFRQ')} ${u} ${dir}${pad2(kt).padStart(2, '0')}${gk > kt + 9 ? 'G' + gk : ''}KT ${vis}${W ? ' ' + W : ''} ${cl} ${T(Tc)}/${T(isNaN(Td) ? Tc - 4 : Td)} Q${Math.round(c.qnh || 1013)}`;
}
function compass(c) {
  let t = ''; for (let i = 0; i < 36; i++) { const a = i * 10 * Math.PI / 180, L = i % 9 ? (i % 3 ? 4 : 7) : 10; t += `<line x1="${56 * Math.sin(a)}" y1="${-56 * Math.cos(a)}" x2="${(56 - L) * Math.sin(a)}" y2="${-(56 - L) * Math.cos(a)}" stroke="#cfd8dc" stroke-width="${i % 9 ? 1 : 2}"/>`; }
  const L = (s, a) => `<text x="${40 * Math.sin(a * Math.PI / 180)}" y="${-40 * Math.cos(a * Math.PI / 180) + 4}" text-anchor="middle" font-size="11" fill="${s === 'N' ? '#ff4fd8' : '#3fd0ff'}">${s}</text>`;
  const kt = Math.round(c.wi / 1.852), r = (c.wd || 0) + 180;
  return `<svg width="124" height="124" viewBox="-62 -62 124 124" style="stroke:none"><circle r="60" fill="#000" stroke="#2f3439" stroke-width="2"/>${t}${L('N', 0)}${L('E', 90)}${L('S', 180)}${L('O', 270)}
    <g style="transform:rotate(${r}deg);transition:transform 2s"><path d="M0 -50L7 -34H2V30H-2V-34H-7Z" fill="#39ff7a"/></g><circle r="15" fill="#000" stroke="#39ff7a" stroke-width="1"/><text y="2" text-anchor="middle" font-size="11" fill="#39ff7a">${kt}</text><text y="11" text-anchor="middle" font-size="6" fill="#3fd0ff">KT</text></svg>`;
}
/* Petites déco SVG */
function gearSVG(n, R, cls, style) {
  const r1 = R * .78; let d = '';
  for (let i = 0; i < n; i++) { const a = i / n * 2 * Math.PI, w = Math.PI / n; [[a - w * .55, r1], [a - w * .3, R], [a + w * .3, R], [a + w * .55, r1]].forEach(([b, r], j) => { d += (i === 0 && j === 0 ? 'M' : 'L') + (r * Math.cos(b)).toFixed(1) + ' ' + (r * Math.sin(b)).toFixed(1); }); }
  return `<svg class="${cls}" style="${style}" viewBox="${-R} ${-R} ${2 * R} ${2 * R}"><path d="${d}Z" fill="#a8742e" stroke="#4a2e0f" stroke-width="2"/><circle r="${R * .5}" fill="#c99a4a" stroke="#4a2e0f" stroke-width="2"/><circle r="${R * .16}" fill="#2a1707"/>${[0, 1, 2, 3, 4].map(i => `<circle cx="${R * .33 * Math.cos(i * 1.2566)}" cy="${R * .33 * Math.sin(i * 1.2566)}" r="${R * .07}" fill="#4a2e0f"/>`).join('')}</svg>`;
}
function webSVG(cls) {
  let p = ''; const A = [0, 15, 30, 45, 60, 75, 90].map(a => a * Math.PI / 180);
  A.forEach(a => p += `M0 0L${150 * Math.cos(a)} ${150 * Math.sin(a)}`);
  [28, 52, 78, 104, 132].forEach(r => { for (let i = 0; i < A.length - 1; i++) { const a0 = A[i], a1 = A[i + 1], m = (a0 + a1) / 2; p += `M${r * Math.cos(a0)} ${r * Math.sin(a0)}Q${r * .82 * Math.cos(m)} ${r * .82 * Math.sin(m)} ${r * Math.cos(a1)} ${r * Math.sin(a1)}`; } });
  return `<svg class="${cls}" viewBox="0 0 150 150"><path d="${p}" stroke="rgba(255,255,255,.42)" stroke-width="1" fill="none"/></svg>`;
}
const SPIDER = (s = 26) => `<svg width="${s}" height="${s}" viewBox="-13 -13 26 26" style="stroke:none"><g stroke="#111" stroke-width="1.6" fill="none" stroke-linecap="round">${[-1, 1].map(k => `<path d="M${2 * k} -1l${7 * k} -7l${3 * k} 3M${2 * k} 1l${8 * k} -1l${3 * k} 4M${2 * k} 2l${7 * k} 5l${2 * k} 4M${1 * k} 3l${5 * k} 7"/>`).join('')}</g><ellipse cx="0" cy="2" rx="4.6" ry="5.4" fill="#151515"/><circle cx="0" cy="-4" r="3.2" fill="#222"/><circle cx="-1.2" cy="-4.4" r=".9" fill="#ff3b3b"/><circle cx="1.2" cy="-4.4" r=".9" fill="#ff3b3b"/></svg>`;

/* ===================================================================
   THÈMES D'INTERFACE « SIGNATURE »
   =================================================================== */
const SIG = {
  cyber: {name: 'Cyberpunk', icons: 'line', temp: 'text', snd: 'city',
    deco: () => cySky(),
    deco2: () => `<div class="cy-hex">0x7F3A 0x1C9E 0xA4F1 0x00B7 0xE29D 0x5C10 0x9AF3 0x3E7B</div><div class="cy-warn"></div><div class="cy-bar"></div><div class="cy-gl a"></div><div class="cy-gl b"></div><div class="cy-gl c"></div><div class="cy-cor tl"></div><div class="cy-cor br"></div>`,
    v: {d: {clear: ['CIEL DÉGAGÉ // VISIBILITÉ MAX', 'SOLEIL ACTIF // UV EN HAUSSE'], clearN: ['NUIT CLAIRE // NÉONS ALLUMÉS'], partly: ['ÉCLAIRCIES // COUVERTURE PARTIELLE'], cloudy: ['CIEL COUVERT // SIGNAL SOLAIRE PERDU'], fog: ['BROUILLARD // CAPTEURS AVEUGLES'], drizzle: ['BRUINE // HUMIDITÉ CRITIQUE'], rain: ['PRÉCIPITATIONS DÉTECTÉES', 'PLUIE ACIDE ? NÉGATIF.'], pour: ['DÉLUGE // ÉVACUEZ LES RUES'], storm: ['ALERTE // DÉCHARGES ÉLECTRIQUES'], snow: ['NEIGE // REFROIDISSEMENT SYSTÈME'], wind: ['VENT FORT // DRONES AU SOL'], heat: ['SURCHAUFFE // REFROIDISSEMENT REQUIS']}, tx: UP,
      hl: c => `T.MAX ${c.mx}° | T.MIN ${c.mn}°`, mt: c => `RESS ${c.fe}° | HUM ${c.hu}% | VENT ${c.wi} KM/H`,
      kick: c => `// NET.MÉTÉO · SECT. ${UP(noAcc(c.city)).slice(0, 10)}-${pad2(c.code)} · UPLINK OK`, hr: (h, n) => n ? pad2(h) + ':00' : 'LIVE'}},
  medieval: {name: 'Grimoire médiéval', icons: 'glyph', temp: 'text',
    deco: '<div class="md-torch l"></div><div class="md-torch r"></div>', deco2: '<div class="md-orn">❦ ✠ ❦</div>',
    v: {d: {clear: ['Le ciel est clément, messire', 'Le soleil bénit le royaume'], clearN: ['La lune veille sur le royaume', 'Nuit étoilée sur les remparts'], partly: ['Quelques nuées passent sur le royaume'], cloudy: ['Le ciel se voile de gris', 'Les nuées couvrent le château'], fog: ['Une brume ensorcelée enveloppe la contrée'], drizzle: ['Une bruine de sorcière tombe sur les terres'], rain: ['Les cieux déversent leurs larmes', 'Il pleut sur les remparts'], pour: ['Un déluge digne de Noé !'], storm: ['Le courroux des cieux gronde !', 'Les dragons crachent la foudre !'], snow: ['Un blanc manteau couvre le royaume'], wind: ['Le souffle d\'Éole fait claquer les bannières'], heat: ['Le soleil darde ses rayons brûlants']},
      hl: c => `Au plus chaud ${c.mx}° · Au plus froid ${c.mn}°`, mt: c => `On ressent ${c.fe}° · Humeur des airs ${c.hu} % · Souffle ${c.wi} km/h`,
      kick: () => '✠ Augure du jour ✠', day: dt => cap(dShort(dt)) + '.', hr: (h, n) => !n ? 'Céans' : h === 0 ? 'Minuit' : h === 12 ? 'Midi' : ROMAN(h) + ' h',
      date: dt => `${cap(FR_D[dt.getDay()])} ${dt.getDate()} ${FR_M[dt.getMonth()]}, an de grâce ${ROMAN(dt.getFullYear())} · ${HM(dt)}`}},
  retro: {name: 'Terminal rétro', icons: 'ascii', temp: 'text', deco2: '<div class="crt"></div>',
    onApply: () => boot(['BIOS MÉTÉO v2.6 — (c) 1987 Lycée Systems', 'Mémoire : 640 Ko… OK', 'Détection des capteurs atmosphériques… OK', 'Chargement de meteo.exe ' + '.'.repeat(12) + ' OK', 'Connexion au satellite… OK', '', '> Prêt.']),
    v: {d: {storm: ['ALERTE : ORAGE EN COURS'], heat: ['WARN : SURCHAUFFE'], pour: ['ALERTE : DÉLUGE']}, tx: d => 'STATUT : ' + UP(noAcc(d)).replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, ''),
      hl: c => `max=${c.mx}°C  min=${c.mn}°C`, mt: c => `ressenti=${c.fe}°C hum=${c.hu}% vent=${c.wi}km/h`,
      kick: c => `$ meteo --live --ville=${noAcc(c.city).toLowerCase().replace(/\W+/g, '-')}`, city: () => '> ' + (typeof dispName === 'function' ? dispName() : cfg.name), day: D3, hr: (h, n) => n ? pad2(h) + 'h' : 'NOW',
      date: dt => `[${pad2(dt.getDate())}/${pad2(dt.getMonth() + 1)}/${dt.getFullYear()} ${HM(dt)}]`}},
  synth: {name: 'Synthwave 84', icons: 'line', temp: 'text',
    deco: '<div class="sw-glow"></div><div class="sw-sun"></div><svg class="sw-mtn" viewBox="0 0 800 82" preserveAspectRatio="none"><path d="M0 82L60 42L120 66L190 18L260 60L330 36L400 70L470 30L540 62L610 14L690 58L750 36L800 58V82Z" fill="#1a0436" stroke="#ff2bd6" stroke-width="2"/></svg><div class="sw-floor"></div><div class="sw-hz"></div>',
    v: {d: {clear: ['SOLEIL RADICAL'], clearN: ['NUIT NÉON'], partly: ['SOLEIL INTERMITTENT'], cloudy: ['CIEL EN MODE VEILLE'], fog: ['BRUME DE CASSETTE'], drizzle: ['BRUINE SYNTHÉTIQUE'], rain: ['PLUIE SUR L\'AUTOROUTE'], storm: ['ORAGE TURBO ⚡'], snow: ['NEIGE HI-FI'], wind: ['VENT EN STÉRÉO'], heat: ['CHALEUR MAXIMUM']}, tx: UP,
      hl: c => `MAX ${c.mx}° · MIN ${c.mn}°`, kick: () => '★ RADIO MÉTÉO 84.0 FM ★'}},
  steam: {name: 'Steampunk', icons: 'line', temp: 'gauge', grid: true,
    deco2: () => gearSVG(14, 54, 'st-gear', 'left:-46px;bottom:-46px;width:108px;height:108px;position:absolute') + gearSVG(10, 34, 'st-gear r', 'left:44px;bottom:-22px;width:68px;height:68px;position:absolute') + gearSVG(12, 46, 'st-gear r', 'right:-38px;bottom:-38px;width:92px;height:92px;position:absolute') +
      '<div class="st-pipe"></div><svg class="st-valve" viewBox="-13 -13 26 26" style="stroke:none"><circle r="11" fill="none" stroke="#8b1a1a" stroke-width="3"/><path d="M-11 0H11M0 -11V11" stroke="#8b1a1a" stroke-width="2.5"/><circle r="3.5" fill="#c99a4a"/></svg><div class="st-puff"></div><div class="st-puff b"></div><div class="st-puff c"></div>',
    v: {d: {clear: ['Ciel limpide — pression nominale'], clearN: ['Nuit claire — chaudières au repos'], partly: ['Éclaircies — vapeur dissipée'], cloudy: ['Ciel couvert — grisaille industrielle'], fog: ['Brouillard londonien — allumez les lanternes'], drizzle: ['Bruine — huilez les rouages'], rain: ['Précipitations aqueuses en cours'], storm: ['Tempête électrique — gare aux paratonnerres !'], snow: ['Neige — chaudières à pleine puissance'], wind: ['Vent violent — arrimez les dirigeables'], heat: ['Chaleur extrême — soupapes ouvertes']},
      hl: c => `Max. ${c.mx}° — Min. ${c.mn}°`, mt: c => `Ressenti ${c.fe}° · Hygrométrie ${c.hu} %<br>Anémomètre ${c.wi} km/h`, kick: () => 'Manomètre atmosphérique · modèle 1887'}},
  pixel: {name: 'Pixel RPG', icons: 'pixel', temp: 'text', tempScale: .66,
    v: {d: {clear: ['Le soleil brille ! Vos PV sont restaurés.'], clearN: ['La nuit tombe… Les monstres rôdent.'], partly: ['Des nuages approchent. Restez sur vos gardes.'], cloudy: ['Des nuages bloquent le soleil. Moral -1.'], fog: ['Brouillard ! La précision baisse.'], drizzle: ['Une petite pluie… Rien de critique.'], rain: ['Il pleut ! Les attaques EAU sont renforcées.'], pour: ['Déluge ! Achetez une POTION de séchage.'], storm: ['Un ORAGE sauvage apparaît !'], snow: ['La neige tombe… DÉFENSE +2.'], wind: ['Rafales ! Votre cape s\'envole.'], heat: ['Canicule ! Vous perdez 1 PV par tour.'], hail: ['GRÊLE ! Coup critique !'], rainbow: ['Un arc-en-ciel ! +100 XP'], lucky: ['JOUR DE CHANCE ! Butin rare !'], frost: ['Gel ! Le sol est glissant.']},
      hl: c => `MAX ${c.mx}°  MIN ${c.mn}°`, mt: c => `HUM ${bar(c.hu)} ${c.hu}%<br>VENT${bar(c.wi, 1)}${c.wi}`, kick: c => '► ZONE : ' + UP(noAcc(c.city)), day: D3, hr: (h, n) => n ? h + 'H' : 'NOW'}},
  scifi: {name: 'Hologramme sci-fi', icons: 'line', temp: 'ring', grid: true,
    deco: '<div class="sf-hex"></div><div class="sf-beam"></div>',
    deco2: () => `<div class="sf-data bl">LAT ${Math.abs(LAT).toFixed(3)}°${LAT >= 0 ? 'N' : 'S'} · LON ${Math.abs(LON).toFixed(3)}°${LON >= 0 ? 'E' : 'O'} · ALT 0 M</div><div class="sf-data br">SYS OK · CAPTEURS 12/12 · LIAISON ▮▮▮▮▯</div>`,
    v: {d: {clear: ['CONDITIONS NOMINALES · CIEL DÉGAGÉ'], clearN: ['CYCLE NOCTURNE · CIEL DÉGAGÉ'], partly: ['COUVERTURE NUAGEUSE PARTIELLE'], cloudy: ['COUVERTURE NUAGEUSE TOTALE'], fog: ['VISIBILITÉ RÉDUITE · CAPTEURS IR ACTIFS'], drizzle: ['MICRO-PRÉCIPITATIONS'], rain: ['PRÉCIPITATIONS ACTIVES'], storm: ['ALERTE · ACTIVITÉ ÉLECTRIQUE'], snow: ['CRISTAUX DE GLACE DÉTECTÉS'], wind: ['VENTS AU-DELÀ DES TOLÉRANCES'], heat: ['TEMPÉRATURE CRITIQUE']}, tx: UP,
      hl: c => `▲ ${c.mx}°   ▼ ${c.mn}°`, mt: c => `RESSENTI ${c.fe}° · HYGRO ${c.hu}%<br>VENT ${c.wi} KM/H`, kick: () => '◈ ANALYSE ATMOSPHÉRIQUE', hr: (h, n) => n ? '+' + n + 'H' : 'T0'}},
  minimal: {name: 'Suisse (minimal)', icons: 'line', temp: 'text', noClouds: true, noAstro: true, deco2: '<div class="mn-stripe"></div>',
    v: {d: {clear: ['Ensoleillé.'], clearN: ['Nuit claire.'], partly: ['Éclaircies.'], cloudy: ['Couvert.'], fog: ['Brouillard.'], drizzle: ['Bruine.'], rain: ['Pluie.'], pour: ['Forte pluie.'], storm: ['Orage.'], snow: ['Neige.'], wind: ['Vent fort.'], heat: ['Chaleur.']}, tx: d => d.replace(/\.?$/, '.'),
      hl: c => `${c.mx}° / ${c.mn}°`, mt: c => `Ressenti ${c.fe}° — Humidité ${c.hu} % — Vent ${c.wi} km/h`,
      kick: () => `Météo — ${Math.abs(LAT).toFixed(2).replace('.', ',')}° ${LAT >= 0 ? 'N' : 'S'} / ${Math.abs(LON).toFixed(2).replace('.', ',')}° ${LON >= 0 ? 'E' : 'O'}`, hr: (h, n) => n ? h + ':00' : 'Maint.'}},
  gazette: {name: 'La Gazette', icons: 'line', temp: 'text', noClouds: true, noAstro: true, L: {pad: {t: 136}, hh: 82},
    v: {d: {clear: ['Nos experts recommandent lunettes de soleil et bonne humeur.'], clearN: ['Une nuit claire, idéale pour observer les étoiles.'], partly: ['Le soleil joue à cache-cache avec les nuages.'], cloudy: ['Un ciel gris, mais pas de quoi faire la une.'], fog: ['« On n\'y voit pas à trois pas », témoignent les passants.'], drizzle: ['Une petite pluie fine, typique de la saison.'], rain: ['« Sortez les parapluies », préviennent nos experts.'], storm: ['Les autorités conseillent de rester à l\'abri.'], snow: ['Les écoliers croisent les doigts.'], wind: ['Chapeaux et parapluies se sont envolés.'], heat: ['La population est invitée à boire de l\'eau.'], hail: ['Les carrossiers se frottent les mains.'], frost: ['Les pare-brise ont souffert ce matin.']},
      hl: c => `Températures : maximale ${c.mx}°, minimale ${c.mn}°.`, mt: c => `Ressenti ${c.fe}°, humidité ${c.hu} %, vent ${c.wi} km/h.`,
      kick: c => { const v = UP(c.city); return ({clear: `GRAND SOLEIL SUR ${v}`, clearN: `NUIT CLAIRE SUR ${v}`, partly: `ÉCLAIRCIES ATTENDUES À ${v}`, partlyN: `NUIT CALME À ${v}`, cloudy: `LE CIEL SE COUVRE SUR ${v}`, cloudnight: `NUIT GRISE SUR ${v}`, fog: `${v} DANS LE BROUILLARD`, drizzle: `BRUINE SUR ${v} : RIEN DE GRAVE`, rain: `LA PLUIE S'INVITE À ${v}`, pour: `DÉLUGE SUR ${v} !`, sleet: `VERGLAS : PRUDENCE À ${v}`, storm: `ORAGES : ${v} EN ALERTE`, hail: `GRÊLE SUR ${v} !`, snow: `${v} SOUS LA NEIGE`, blizzard: `TEMPÊTE DE NEIGE SUR ${v}`, wind: `COUP DE VENT SUR ${v}`, heat: `CANICULE : ${v} SUFFOQUE`, rainbow: `UN ARC-EN-CIEL AU-DESSUS DE ${v}`, frost: `GEL : ${v} GRELOTTE`, fullmoon: `PLEINE LUNE SUR ${v}`, dawn: `${v} SE RÉVEILLE`, dusk: `SOIRÉE DORÉE À ${v}`, lucky: `INCROYABLE : JOUR DE CHANCE À ${v} !`}[c.k] || `LA MÉTÉO À ${v}`); },
      city: () => 'La Gazette de ' + shortCity(), date: dt => { const n = Math.ceil((dt - new Date(dt.getFullYear(), 0, 1)) / 864e5); return `N° ${n} — ${longDate(dt)} ${dt.getFullYear()} — Édition de ${dt.getHours()} h ${pad2(dt.getMinutes())} — ${shortCity()} — 10 centimes`; }}},
  bd: {name: 'Bande dessinée', icons: 'duo', temp: 'text',
    v: {d: {clear: ['Quel soleil, mille sabords !', 'Un temps magnifique !'], clearN: ['Belle nuit étoilée !'], partly: ['Des nuages ? Bah, ça passe !'], cloudy: ['Ciel tout gris, quelle déprime !'], fog: ['On n\'y voit rien du tout !'], drizzle: ['Une petite pluie de rien du tout !'], rain: ['Sapristi, il pleut !'], pour: ['C\'est le déluge !'], storm: ['Tonnerre de Brest !'], snow: ['De la neige ! Bataille de boules !'], wind: ['Attention, ça souffle fort !'], heat: ['Quelle chaleur, j\'en fonds !'], hail: ['Aïe ! Il grêle !']},
      kick: c => ({clear: 'WAOUH !', clearN: 'ZZZ…', partly: 'BOF !', partlyN: 'ZZZ…', cloudy: 'PFFF…', fog: 'HEIN ?!', drizzle: 'PLIC…', rain: 'PLIC ! PLOC !', pour: 'SPLASH !', storm: 'KABOOM !', snow: 'FLOC ! FLOC !', wind: 'FWOOOSH !', heat: 'OUF !', hail: 'BONK !', rainbow: 'OOOH !', frost: 'BRRR !', lucky: 'JACKPOT !'}[c.k] || 'TADAM !')}},
  gameboy: {name: 'Game Boy', icons: 'mono', temp: 'text', noAstro: true, tempScale: .7, deco2: '<div class="gb-bez"></div><div class="gb-lbl">DOT MATRIX WITH STEREO SOUND</div><div class="gb-led"></div>',
    v: {d: {clear: ['Un SOLEIL sauvage apparaît !'], clearN: ['Il fait nuit. Les SPECTRES sortent…'], partly: ['NUAGE utilise ÉCRAN !'], cloudy: ['NUAGE utilise GRISAILLE !'], fog: ['BROUILLARD utilise BRUME ! La précision baisse.'], drizzle: ['Une petite pluie… Ce n\'est pas très efficace.'], rain: ['Il pleut ! C\'est super efficace !'], storm: ['ORAGE utilise TONNERRE !'], snow: ['La neige tombe. C\'est très efficace !'], wind: ['VENT utilise TORNADE !'], heat: ['SOLEIL utilise ZÉNITH ! Ça brûle !']},
      hl: c => `MAX ${c.mx}  MIN ${c.mn}`, mt: c => `HUM ${bar(c.hu)}${c.hu}%`, kick: () => '▶ MÉTÉO SAUVAGE', day: D3, hr: (h, n) => n ? h + 'H' : 'NOW'}},
  win95: {name: 'Windows 95', icons: 'duo', temp: 'text', L: {pad: {b: 44}, hh: 104},
    deco2: '<div class="w95-bar"></div><div class="w95-start">Démarrer</div><div class="w95-tray" id="w95c"></div>',
    tick: () => { const e = $('w95c'); if (e) e.textContent = (CTX ? CTX.T + '°  ·  ' : '') + HM(clock()); },
    v: {d: {clear: ['Il fait beau. Voulez-vous sortir maintenant ?'], clearN: ['Il fait nuit. Mise en veille recommandée.'], partly: ['Éclaircies détectées. Mise à jour du ciel…'], cloudy: ['Le ciel est couvert. Veuillez patienter…'], fog: ['Visibilité faible. Nettoyez votre écran ?'], drizzle: ['Bruine : ceci n\'est pas une erreur fatale.'], rain: ['Il pleut. Voulez-vous de l\'aide pour trouver un parapluie ?'], storm: ['Erreur critique : orage en cours. Restez à l\'abri.'], snow: ['Neige détectée. Installation de l\'hiver… 99 %'], wind: ['Vent fort : vos fenêtres risquent de se fermer.'], heat: ['Surchauffe du système. Hydratez-vous.']},
      hl: c => `Max : ${c.mx}°C    Min : ${c.mn}°C`, kick: c => `C:\\METEO> meteo.exe /ville:${UP(noAcc(c.city)).replace(/\s+/g, '_')}`}},
  chalk: {name: 'Tableau noir', icons: 'line', temp: 'text', L: {pad: {b: 30}},
    deco: '<div class="ch-doodle" style="left:250px;top:56px;font-size:19px;rotate:-4deg">E = mc²</div><div class="ch-doodle" style="left:360px;top:60px;font-size:15px;rotate:3deg">3x + 2 = 11 ⇒ x = 3</div><div class="ch-doodle" style="left:540px;top:60px;font-size:15px;rotate:-3deg">π ≈ 3,14</div>',
    deco2: '<div class="ch-frame"></div><div class="ch-ledge"></div><div class="ch-stick" style="left:120px;width:46px;background:#f4f4ee"></div><div class="ch-stick" style="left:180px;width:30px;background:#ffd6e0"></div><div class="ch-stick" style="left:224px;width:36px;background:#cfe8ff"></div><div class="ch-erase"></div>',
    v: {d: {clear: ['Grand soleil : sortez les lunettes, pas les excuses !'], clearN: ['Nuit étoilée : au lit, demain il y a cours !'], partly: ['Éclaircies : la récré sera ensoleillée.'], cloudy: ['Ciel gris, mais on garde le moral !'], fog: ['Brouillard : on n\'y voit pas plus clair qu\'en maths.'], drizzle: ['Petite pluie : capuche conseillée.'], rain: ['Pluie : pensez au parapluie (et aux devoirs).'], pour: ['Grosse averse : récré sous le préau !'], storm: ['Orage : tout le monde reste à l\'intérieur !'], snow: ['Neige ! Non, ce n\'est pas un jour férié.'], wind: ['Vent fort : tenez bien vos copies !'], heat: ['Canicule : hydratez-vous !']},
      hl: c => `Max : ${c.mx}°    Min : ${c.mn}°`, kick: () => 'Météo du jour :', date: dt => longDate(dt) + ' · ' + HM(dt)}},
  cahier: {name: 'Cahier Seyès', icons: 'line', temp: 'text', noClouds: true, noAstro: true, L: {pad: {l: 74}},
    deco: '<div class="ca-hole" style="top:110px"></div><div class="ca-hole" style="top:232px"></div><div class="ca-hole" style="top:354px"></div><div class="ca-doodle" style="left:12px;top:22px">☆</div><div class="ca-doodle" style="left:16px;top:420px;rotate:-12deg">☺</div>',
    v: {d: {clear: ['Il fait beau ! (enfin…)'], clearN: ['Nuit claire, dodo !'], partly: ['Quelques nuages, ça va.'], cloudy: ['Nuageux, bof.'], fog: ['Brouillard… on voit rien !'], drizzle: ['Petite bruine, rien de grave.'], rain: ['Pluie. Ne pas oublier le parapluie !!'], pour: ['Grosse pluie… trempé(e) garanti !'], storm: ['ORAGE ⚡ (pas de sport ??)'], snow: ['NEIGE !!! ❄ (cours annulés ??)'], wind: ['Vent fort, accrochez vos feuilles !'], heat: ['Trop chaud pour réfléchir…']}, tx: d => '→ ' + d,
      hl: c => `max : ${c.mx}°  —  min : ${c.mn}°`, mt: c => `ressenti ${c.fe}° · humidité ${c.hu} % · vent ${c.wi} km/h`, kick: () => 'Exercice 1 : Quel temps fait-il ?', date: dt => longDate(dt) + ' ' + dt.getFullYear()}},
  flap: {name: 'Aéroport (split-flap)', icons: 'line', temp: 'flap', L: {hh: 98},
    daysHead: '<div class="dh"><span>JOUR</span><span>CIEL</span><span>TEMP.</span><span style="text-align:right">ÉTAT</span></div>',
    dayRow: (dt, ic, mx, mn, k) => { const s = FLST(k); return `<div class="day"><span>${D3(dt)} ${pad2(dt.getDate())}</span>${ic}<span class="mm"><span>${mx}</span><i>${mn}</i></span><em class="st ${s[1]}">${s[0]}</em></div>`; },
    hourCell: (lbl, ic, t) => `<div class="h"><small>${lbl}</small>${ic}${flapHTML(t)}</div>`,
    descHTML: d => flapHTML(UP(noAcc(d)).slice(0, 26)),
    v: {tx: d => d, hl: c => `MAX <b>${c.mx}°</b> · MIN <b>${c.mn}°</b>`, mt: c => `RESSENTI <b>${c.fe}°</b> · HUMIDITÉ <b>${c.hu}%</b> · VENT <b>${c.wi} KM/H</b>`,
      kick: () => 'TEMPÉRATURE EXTÉRIEURE', city: () => '✈ DÉPARTS · ' + UP(shortCity()), date: dt => 'HEURE LOCALE ' + HM(dt), hr: (h, n) => n ? pad2(h) + ':00' : 'MAINT.'}},
  cockpit: {name: 'Cockpit (METAR)', icons: 'line', temp: 'text', mainIcon: compass,
    deco2: '<div class="ck-screw" style="left:6px;top:6px"></div><div class="ck-screw" style="right:6px;top:6px"></div><div class="ck-screw" style="left:6px;bottom:6px"></div><div class="ck-screw" style="right:6px;bottom:6px"></div><div class="ck-lbl" style="left:28px">EFIS · MÉTÉO</div><div class="ck-lbl" style="right:28px">PFD 1 · ND 1</div>',
    v: {d: {clear: ['CAVOK · CIEL CLAIR'], clearN: ['CAVOK · NUIT CLAIRE'], partly: ['FEW · ÉCLAIRCIES'], cloudy: ['OVC · CIEL COUVERT'], fog: ['FG · VISIBILITÉ RÉDUITE'], drizzle: ['DZ · BRUINE'], rain: ['RA · PLUIE'], pour: ['+RA · FORTE PLUIE'], storm: ['TS · ORAGE — ÉVITEMENT'], snow: ['SN · NEIGE'], wind: ['VENT FORT · TURBULENCES'], heat: ['OAT ÉLEVÉE · DENSITÉ ALTITUDE']}, tx: UP,
      hl: c => `MAX ${c.mx}° · MIN ${c.mn}°`, mt: c => `QNH ${Math.round(c.qnh || 1013)} · TD ${c.td}° · HR ${c.hu}%`, kick: metar, day: D3, hr: (h, n) => pad2(h) + ':00'}},
  lcd: {name: 'Station LCD', icons: 'mono', temp: 'seg', noClouds: true, noAstro: true, L: {pad: {t: 90, l: 40, r: 40, b: 34}},
    num: v => seg(String(v), true),
    deco: '<div class="lcd-scr"></div>', deco2: '<div class="lcd-lbl l">WEATHER STATION · WS-2026 · ALARM · CHRONO</div><div class="lcd-light tap" data-egg="light">● LIGHT</div><div class="lcd-btn l1"></div><div class="lcd-btn l2"></div><div class="lcd-btn r1 tap" data-egg="light"></div>',
    v: {tx: d => UP(noAcc(d)), hl: c => `MAX ${c.mx}° · MIN ${c.mn}°`, mt: c => `HUMID. ${c.hu}% · VENT ${c.wi} KM/H`, kick: () => 'TEMP OUT', city: () => UP(shortCity()), day: D3, hr: (h, n) => n ? pad2(h) + 'H' : 'NOW'}},
  neon: {name: 'Enseigne néon', icons: 'line', temp: 'chars',
    v: {d: {clear: ['CIEL CLAIR · ENTREZ !'], clearN: ['OUVERT TARD · NUIT CLAIRE'], partly: ['QUELQUES NUAGES · ON EST OUVERT'], cloudy: ['CIEL GRIS · AMBIANCE TAMISÉE'], fog: ['BROUILLARD · SUIVEZ LA LUMIÈRE'], drizzle: ['BRUINE · ENTREZ VOUS SÉCHER'], rain: ['IL PLEUT · ENTREZ VOUS ABRITER'], storm: ['ORAGE · COUPURE DE COURANT ?'], snow: ['NEIGE · CHOCOLAT CHAUD'], wind: ['VENT FORT · FERMEZ LA PORTE'], heat: ['CANICULE · CLIM À FOND']}, tx: UP, kick: () => '● OUVERT ●'}},
  deco: {name: 'Art déco', icons: 'line', temp: 'text', deco: '<div class="dc-fan" style="left:330px"></div>', deco2: '<div class="dc-line"></div>',
    v: {d: {clear: ['Un ciel d\'une rare clarté'], clearN: ['Une nuit de velours étoilé'], partly: ['Quelques nuages, avec élégance'], cloudy: ['Un ciel de soie grise'], fog: ['Un brouillard plein de mystère'], drizzle: ['Une bruine discrète et distinguée'], rain: ['Une pluie élégante sur la ville'], storm: ['L\'orage fait une entrée fracassante'], snow: ['La neige, poudre de diamant'], wind: ['Un vent à faire voler les chapeaux'], heat: ['Une chaleur digne de la Riviera']},
      hl: c => `MAX ${c.mx}° · MIN ${c.mn}°`, kick: () => '— ✦ BULLETIN DU JOUR ✦ —'}},
  kawaii: {name: 'Kawaii', icons: 'kawaii', temp: 'text', amb: 'sparkles',
    v: {d: {clear: ['Grand soleil ! \\(^o^)/'], clearN: ['Bonne nuit ! (-_-)zzz'], partly: ['Un peu de nuages (^_^)'], cloudy: ['Tout gris… (._.)'], fog: ['Brouillard… (o_O)'], drizzle: ['Petite pluie (^_^;)'], rain: ['Il pleut… (T_T)'], storm: ['Orage !! (>_<)'], snow: ['Il neige ! (*^▽^*)'], wind: ['Ça souffle ! (@_@)'], heat: ['Trop chaud… (×_×)']}, tx: d => d + ' (^_^)',
      hl: c => `max ${c.mx}° ♡ min ${c.mn}°`, kick: () => '✿ coucou ! ✿'}},
  matrix: {name: 'Matrix', icons: 'line', temp: 'text', amb: 'matrix',
    v: {d: {clear: ['Le ciel est dégagé. Ou est-ce une simulation ?'], clearN: ['Il n\'y a pas de soleil. Seulement la nuit.'], partly: ['Des nuages… un bug dans la Matrice ?'], cloudy: ['Ciel couvert. Signal faible.'], fog: ['Brouillard : le code devient flou.'], drizzle: ['Bruine : quelques octets tombent.'], rain: ['Il pleut des données.'], storm: ['Anomalie électrique détectée.'], snow: ['La Matrice refroidit.'], wind: ['Le vent réécrit le code.'], heat: ['Surchauffe du système.']},
      hl: c => `max: ${c.mx}° | min: ${c.mn}°`, mt: c => `ressenti: ${c.fe}° | hum: ${c.hu}% | vent: ${c.wi} km/h`, kick: () => '> suis le lapin blanc'}},
  blueprint: {name: 'Plan d\'architecte', icons: 'line', temp: 'text',
    deco: '<div class="bp-circ" style="left:-40px;top:70px;width:340px;height:340px"></div><div class="bp-circ" style="left:40px;top:150px;width:180px;height:180px"></div>',
    deco2: '<div class="bp-ruler"></div><div class="bp-ruler v"></div><div class="bp-north">N<br>↑</div><div class="bp-cart"><span>PROJET : MÉTÉO</span><span>ÉCH. 1:1</span><span>DESSINÉ PAR : LYCÉE</span><span>FEUILLE 1/1</span></div>',
    v: {d: {clear: ['Ciel : dégagé (tolérance ± 0 nuage)'], clearN: ['Ciel nocturne : dégagé'], partly: ['Couverture nuageuse : partielle'], cloudy: ['Couverture nuageuse : 100 %'], fog: ['Visibilité : réduite (< 1 km)'], drizzle: ['Précipitations : liquides, débit faible'], rain: ['Précipitations : liquides, débit modéré'], storm: ['Décharges électriques : présentes'], snow: ['Précipitations : solides (neige)'], wind: ['Vent : supérieur aux tolérances'], heat: ['Température : hors cahier des charges']},
      hl: c => `T.max = ${c.mx}°   T.min = ${c.mn}°`, mt: c => `Ressenti = ${c.fe}° · HR = ${c.hu} % · V = ${c.wi} km/h`, kick: () => 'FIG. 1 — TEMPÉRATURE EXTÉRIEURE (ÉCH. 1:1)'}},
  western: {name: 'Far West', icons: 'line', temp: 'text',
    deco2: '<svg style="left:2px;bottom:0;width:34px;height:56px;position:absolute" viewBox="0 0 34 56"><path d="M14 56V12a4 4 0 0 1 8 0v44zM14 34H7a3 3 0 0 1-3-3V20a2.5 2.5 0 0 1 5 0v9h5zM22 28h6v-9a2.5 2.5 0 0 1 5 0v11a3 3 0 0 1-3 3h-8z" fill="#2f4a1e"/></svg><svg style="right:4px;bottom:0;width:26px;height:42px;position:absolute" viewBox="0 0 34 56"><path d="M14 56V12a4 4 0 0 1 8 0v44zM22 28h6v-9a2.5 2.5 0 0 1 5 0v11a3 3 0 0 1-3 3h-8z" fill="#2f4a1e"/></svg>',
    v: {d: {clear: ['Recherché pour : grand soleil sur le comté'], clearN: ['Recherché pour : nuit étoilée au ranch'], partly: ['Recherché pour : nuages en bande organisée'], cloudy: ['Recherché pour : ciel gris et menaçant'], fog: ['Recherché pour : brouillard à couper au couteau'], drizzle: ['Recherché pour : bruine sournoise'], rain: ['Recherché pour : pluie sur tout le comté'], storm: ['Recherché pour : orage armé et dangereux'], snow: ['Recherché pour : neige sur la prairie'], wind: ['Recherché pour : vent à décorner les bœufs'], heat: ['Recherché pour : chaleur du désert']}, tx: d => 'Recherché pour : ' + d.toLowerCase(),
      hl: c => `Mort ou vif — Max ${c.mx}° · Min ${c.mn}°`, kick: () => 'WANTED'}},
  spooky: {name: 'Manoir hanté', icons: 'line', temp: 'chars', amb: 'eyes',
    L: {hh: 100}, deco: () => webSVG('sp-web l') + webSVG('sp-web r'), deco2: () => `<div class="sp-hang">${SPIDER(26)}</div>`,
    v: {d: {clear: ['Ciel dégagé… trop calme pour être honnête'], clearN: ['Nuit noire. Ne te retourne pas…'], partly: ['Des nuages rôdent au-dessus du manoir'], cloudy: ['Nuages menaçants au-dessus du manoir'], fog: ['Brouillard : quelqu\'un rôde…'], drizzle: ['Une bruine glacée te frôle la nuque'], rain: ['Il pleut des larmes de fantôme'], storm: ['L\'orage réveille les morts !'], snow: ['Neige… blanche comme un spectre'], wind: ['Le vent hurle comme un loup-garou'], heat: ['Chaleur infernale'], fullmoon: ['Pleine lune… les loups-garous sortent']},
      hl: c => `Max ${c.mx}° · Min ${c.mn}°`, kick: () => '☠ Bulletin d\'outre-tombe ☠'}},
  xmas: {name: 'Noël', icons: 'line', temp: 'text',
    deco2: () => { let b = ''; const C = ['#ff3b3b', '#ffd23f', '#3ddc84', '#4fb3ff', '#ff7ae0']; for (let i = 0; i < 17; i++) { const x = 18 + i * 47, y = 9 + Math.sin(i * 1.1) * 5 + 6, c = C[i % 5]; b += `<div class="xm-bulb" style="left:${x}px;top:${y}px;background:${c};box-shadow:0 0 10px ${c};animation-delay:${i % 2 ? -.8 : 0}s"></div>`; } return `<svg class="xm-wire" viewBox="0 0 800 30" preserveAspectRatio="none"><path d="M0 12 Q 24 22 47 14 T 94 13 T 141 15 T 188 12 T 235 16 T 282 13 T 329 15 T 376 12 T 423 16 T 470 13 T 517 15 T 564 12 T 611 16 T 658 13 T 705 15 T 752 12 T 800 14" stroke="#2f5a2a" stroke-width="2" fill="none"/></svg>` + b; },
    v: {d: {clear: ['Ciel dégagé : idéal pour le traîneau !'], clearN: ['Nuit claire : le père Noël fait sa tournée'], partly: ['Quelques nuages sur le pôle Nord'], cloudy: ['Ciel gris : chocolat chaud conseillé'], fog: ['Brouillard : les rennes ont besoin d\'un phare !'], drizzle: ['Bruine : les lutins sortent les capuches'], rain: ['Pluie : le père Noël sort son ciré'], storm: ['Orage : les rennes ont peur !'], snow: ['Neige ! Un Noël tout blanc ✨'], wind: ['Vent fort : tenez vos bonnets !'], heat: ['Chaleur : le bonhomme de neige fond…']},
      kick: () => '❄ Ho ho ho ! ❄'}},
  manga: {name: 'Manga dramatique', icons: 'line', temp: 'text', noAstro: true,
    deco: '<div id="mgsfx" style="left:318px;top:92px;width:160px;height:250px"></div>',
    onRender: c => { const s = MGSFX[c.k] || 'ゴ', e = $('mgsfx'); if (e && e.dataset.s !== s) { e.dataset.s = s; e.innerHTML = [[0, 0], [72, 54], [6, 118], [88, 182]].map(([x, y]) => `<span class="mg-sfx" style="position:absolute;left:${x}px;top:${y}px">${s}</span>`).join(''); } },
    v: {d: {clear: ['Ce ciel… il est beaucoup trop bleu !!', 'Le soleil… se dresse devant nous !'], clearN: ['La nuit… elle nous observe…'], partly: ['Ces nuages… ils préparent quelque chose !'], cloudy: ['Une pression écrasante… le ciel est couvert !'], fog: ['Impossible… le brouillard s\'épaissit tout seul ?!'], drizzle: ['Cette bruine… elle n\'est pas naturelle !'], rain: ['La pluie… elle frappe sans s\'arrêter !!'], pour: ['Quel déluge… c\'est absurde !!'], storm: ['Quelle puissance… ce tonnerre !!'], snow: ['La neige… tombe en silence…'], wind: ['Ce vent… il veut nous arrêter !!'], heat: ['Cette chaleur… elle est hors du commun !!'], frost: ['Le froid… paralyse tout !']}, tx: d => d + ' !!',
      hl: c => `MAX ${c.mx}° !!  MIN ${c.mn}°`, kick: c => { const d = clock(), n = Math.ceil((d - new Date(d.getFullYear(), 0, 1)) / 864e5); return `第${n}話 — « LE CIEL DE ${UP(c.city)} »`; }, day: D3}},
  mecha: {name: 'Centre de commandement', icons: 'line', temp: 'seg', noAstro: true, L: {hh: 104},
    deco: () => { const L = [['気象', 0], ['観測', 1], ['風', 0], ['雨', 0], ['正常', 1], ['雲', 0], ['温度', 0], ['湿度', 1], ['警報', 0], ['予報', 0]]; return L.map(([t, on], i) => { const c = i % 3, r = Math.floor(i / 3); return `<div class="mc-hex${on ? ' on' : ''}" style="left:${330 + c * 48 + (r % 2) * 24}px;top:${118 + r * 40}px;animation-delay:${-i * .7}s">${t}</div>`; }).join(''); },
    deco2: () => '<div class="mc-side">気象観測システム · 第三観測所</div><div class="mc-alert"><span>警告 · ALERTE MÉTÉO</span></div><div class="mc-bar">' + '<i></i>'.repeat(20) + '</div>',
    onRender: c => { stage.classList.toggle('mc-al', ['storm', 'hail', 'pour', 'wind', 'blizzard', 'sleet'].includes(c.k)); const b = document.querySelectorAll('.mc-bar i'); b.forEach((x, i) => x.classList.toggle('on', i < Math.round(c.hu / 100 * b.length))); },
    v: {d: {clear: ['Ciel dégagé. Aucune anomalie détectée.'], clearN: ['Nuit claire. Surveillance nocturne active.'], partly: ['Couverture nuageuse partielle. Situation stable.'], cloudy: ['Ciel couvert. Capteurs optiques limités.'], fog: ['Visibilité nulle. Passage aux capteurs infrarouges.'], drizzle: ['Bruine détectée. Aucun danger.'], rain: ['Précipitations confirmées. Parapluie recommandé.'], pour: ['Précipitations massives. Évitez les sorties.'], storm: ['Alerte : activité orageuse. Restez à l\'abri.'], snow: ['Neige détectée. Températures en baisse.'], wind: ['Vents violents. Sécurisez les structures.'], heat: ['Surchauffe atmosphérique. Hydratation obligatoire.'], frost: ['Gel confirmé. Sols glissants.']}, tx: d => d + '. Situation sous contrôle.',
      hl: c => `MAX ${c.mx}° / MIN ${c.mn}°`, mt: c => `RESSENTI ${c.fe}° · HUMIDITÉ ${c.hu}% · VENT ${c.wi} KM/H`, kick: () => '観測中 · ANALYSE ATMOSPHÉRIQUE EN COURS', day: D3, hr: (h, n) => pad2(h) + ':00',
      date: dt => `${D3(dt)} ${pad2(dt.getDate())}.${pad2(dt.getMonth() + 1)}.${dt.getFullYear()} // ${HM(dt)}`}},
  vapor: {name: 'Vaporwave', icons: 'line', temp: 'text', noAstro: true, noClouds: true, amb: 'shapes', L: {pad: {t: 92}, hh: 100},
    deco: () => `<div class="vp-floor"></div><div class="vp-hz"></div>${vpCol(310, 168)}${vpPalm(452, 150, 1, 'a')}${vpPalm(268, 190, -1, 'b')}<div class="vp-cube"><i></i><i></i><i></i><i></i><i></i><i></i></div>`,
    deco2: '<div class="vp-osd"><b>▶ PLAY</b>　<span id="vptc">SP 0:00:00</span>　CH 03</div><div class="vp-jp">天気予報・気象情報・夢</div>', descHTML: d => esc(d.length <= 16 ? FW(d.toLowerCase()) : d.toLowerCase()),
    tick: () => { const e = $('vptc'); if (e) { const d = clock(); e.textContent = `SP ${d.getHours() % 10}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`; } },
    v: {d: {clear: ['soleil éternel', 'un dimanche sans fin'], clearN: ['nuit en boucle', 'minuit au centre commercial'], partly: ['nuages en pastel'], partlyN: ['nuit douce'], cloudy: ['ciel en mode veille'], fog: ['brume analogique'], drizzle: ['bruine lo-fi'], rain: ['pluie de minuit'], pour: ['déluge en VHS'], storm: ['orage en haute fidélité'], snow: ['neige numérique'], wind: ['vent stéréo'], heat: ['chaleur tropicale'], frost: ['gel cristallin'], rainbow: ['arc-en-ciel 1995']}, tx: d => FW(d.toLowerCase()),
      hl: c => `ＭＡＸ ${c.mx}°　／　ＭＩＮ ${c.mn}°`, mt: c => `ressenti ${c.fe}° · humidité ${c.hu}% · vent ${c.wi} km/h`, kick: () => '天気予報 · ＭＥＴＥＯ．ＥＸＥ', city: () => FW(shortCity().toLowerCase()), day: D3, hr: (h, n) => n ? h + 'h' : 'ＭＡＩＮＴ.'}, snd: 'pad'},
  hacker: {name: 'Terminal hacker', icons: 'line', temp: 'fig', noAstro: true, noClouds: true, L: {pad: {t: 80, b: 34}, hh: 96},
    deco: () => `<div class="hk-log"><div>${hkLog()}</div></div>`,
    deco2: '<div class="hk-bar"><span class="a">[meteo]</span> <span class="w">0:météo*</span> 1:radar 2:infos<span class="r" id="hkst"></span></div>',
    tick: () => { const e = $('hkst'); if (e) { const d = clock(); e.textContent = `"${noAcc(shortCity()).toLowerCase()}" ${HM(d)} ${pad2(d.getDate())}-${FR_M[d.getMonth()].slice(0, 3)}-${String(d.getFullYear()).slice(2)}`; } },
    onRender: c => hkType(),
    v: {d: {clear: ['ciel dégagé. aucune menace détectée.'], clearN: ['nuit claire. tous les systèmes au vert.'], partly: ['nuages partiels. surveillance en cours.'], cloudy: ['couverture nuageuse : 100 %.'], fog: ['brouillard détecté. visibilité réduite.'], drizzle: ['bruine détectée. impact faible.'], rain: ['précipitations en cours. prends un parapluie.'], pour: ['alerte : déluge. reste à l\'intérieur.'], storm: ['alerte : orage. coupure réseau possible.'], snow: ['neige détectée. refroidissement du système.'], wind: ['rafales détectées. sécurise tes affaires.'], heat: ['surchauffe. hydratation requise.'], frost: ['gel détecté. sol glissant.']}, tx: d => d.toLowerCase(),
      hl: c => `max=${c.mx}°  min=${c.mn}°`, mt: c => `<i>ressenti</i>=<b>${c.fe}°</b>  <i>humidité</i>=<b>${c.hu}%</b>  <i>vent</i>=<b>${c.wi}km/h</b>`,
      kick: c => `meteo@${noAcc(c.city).toLowerCase().replace(/\W+/g, '-')}:~$ ./meteo --live`, city: () => '~/meteo/' + noAcc(shortCity()).toLowerCase().replace(/\W+/g, '-'), day: dt => FR_D[dt.getDay()].slice(0, 3) + ' ' + pad2(dt.getDate()), hr: (h, n) => n ? pad2(h) + ':00' : 'now',
      date: dt => `[${FR_D[dt.getDay()].slice(0, 3)} ${pad2(dt.getDate())} ${FR_M[dt.getMonth()].slice(0, 3)} ${dt.getFullYear()} · ${HM(dt)}]`}, snd: 'keys'},
  ukiyo: {name: 'Estampe japonaise', icons: 'line', temp: 'chars', noAstro: true, noClouds: true, ink: true, amb: 'sakura',
    deco: () => `<div class="uk-sun"></div><div class="uk-moon"></div>${ukMount()}<div class="uk-mist a"></div><div class="uk-mist b"></div><div class="uk-mist c"></div>${ukWave()}`,
    deco2: '<div class="uk-seal">天<br>気</div>',
    onRender: c => { stage.classList.toggle('uk-n', !c.day); stage.classList.toggle('uk-w', ['rain', 'pour', 'storm', 'hail', 'drizzle', 'sleet', 'snow', 'blizzard', 'fog', 'cloudy'].includes(c.k)); },
    descHTML: d => esc(d).replace(/ \/ /g, '<br>'),
    v: {d: {clear: ['Soleil d\'automne / sur les toits de la ville'], clearN: ['Lune claire / le silence des toits'], partly: ['Nuages paresseux / le soleil joue entre eux'], partlyN: ['Nuit voilée / une étoile, puis une autre'], cloudy: ['Ciel de cendre / les corbeaux se taisent'], fog: ['Brume du matin / le pont disparaît'], drizzle: ['Pluie fine / les parapluies s\'ouvrent'], rain: ['Averse soudaine / les passants courent sur le pont'], pour: ['Déluge / la rivière gronde'], storm: ['Le tonnerre roule / derrière la montagne'], snow: ['Neige tombante / le monde se tait'], blizzard: ['Tempête blanche / plus de chemin'], wind: ['Le vent se lève / les chapeaux s\'envolent'], heat: ['Chaleur d\'été / les cigales chantent'], frost: ['Givre au matin / l\'herbe est d\'argent'], dawn: ['Aube rose / la montagne s\'éveille'], dusk: ['Soir doré / les lanternes s\'allument'], fullmoon: ['Pleine lune / les lièvres dansent'], rainbow: ['Arc-en-ciel / un pont vers les nuages']}, tx: d => d,
      hl: c => `Haut ${c.mx}° · Bas ${c.mn}°`, mt: c => `Ressenti ${c.fe}° · Humidité ${c.hu} % · Vent ${c.wi} km/h`,
      kick: c => { const d = clock(), n = Math.ceil((d - new Date(d.getFullYear(), 0, 1)) / 864e5) % 36 + 1; return `Vue n° ${n} du ciel de ${c.city}`; }, day: dt => cap(dShort(dt))}, snd: 'chime'},
  chan: {name: 'Menu des chaînes', icons: 'line', temp: 'text', noAstro: true, noClouds: true, L: {pad: {t: 74, b: 108}, hh: 86},
    deco2: () => `<div class="ch-bar"><svg viewBox="0 0 800 100" preserveAspectRatio="none"><path d="M0 16C200 16 250 16 300 26Q400 46 500 26C550 16 600 16 800 16V100H0Z" fill="url(#chg)"/><path d="M0 16C200 16 250 16 300 26Q400 46 500 26C550 16 600 16 800 16" fill="none" stroke="#35b6e8" stroke-width="3"/><defs><linearGradient id="chg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f5f6"/><stop offset="1" stop-color="#cfd3d8"/></linearGradient></defs></svg><div class="ch-clk"><span id="chh">00</span><i>:</i><span id="chm">00</span></div><div class="ch-dt" id="chdt"></div><div class="ch-btn l">MENU</div><div class="ch-sd"></div><div class="ch-btn r"><svg viewBox="0 0 24 24" width="30" height="30"><rect x="3" y="6" width="18" height="12" rx="2" fill="#9aa1a8"/><path d="M3.5 7l8.5 6.5L20.5 7" stroke="#fff" stroke-width="1.6" fill="none"/></svg><b>${1 + (clock().getDate() % 4)}</b></div></div><div class="ch-hand" id="chhand"><svg viewBox="0 0 40 50" width="38" height="48"><path d="M13 5a4 4 0 0 1 8 0v15l1.5-.4a3.6 3.6 0 0 1 4.3 2l.2.4a3.6 3.6 0 0 1 5 2.6v.4a3.6 3.6 0 0 1 5 3.2v8.3C37 43 32 48 25.5 48h-5.2c-4.2 0-7.3-2-9.4-5.2L3.6 31.6a3.6 3.6 0 0 1 5.3-4.7L13 30.5z" fill="#fff" stroke="#2f9fd8" stroke-width="2.4" stroke-linejoin="round"/></svg><b>1</b></div>`,
    tick: () => { const d = clock(), h = $('chh'); if (!h) return; h.textContent = pad2(d.getHours()); $('chm').textContent = pad2(d.getMinutes()); $('chdt').textContent = `${cap(FR_D[d.getDay()]).slice(0, 3)} ${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`; },
    onApply: () => setTimeout(chanHover, 600),
    v: {d: {clear: ['Grand soleil aujourd\'hui !'], clearN: ['Belle nuit étoilée.'], partly: ['Quelques nuages, mais du soleil.'], cloudy: ['Ciel gris toute la journée.'], fog: ['Brouillard : prudence sur la route.'], drizzle: ['Petite bruine.'], rain: ['De la pluie aujourd\'hui.'], pour: ['Fortes pluies !'], storm: ['Orages : restez à l\'abri.'], snow: ['De la neige !'], wind: ['Beaucoup de vent.'], heat: ['Il fait très chaud !']},
      kick: () => 'Chaîne météo', hl: c => `Max ${c.mx}° · Min ${c.mn}°`, day: dt => cap(FR_D[dt.getDay()]).slice(0, 3) + '.', hr: (h, n) => n ? h + ' h' : 'Maint.'}},
  hbc: {name: 'Chaîne homebrew', icons: 'line', temp: 'text', noAstro: true, noClouds: true, amb: 'hbub', L: {pad: {t: 74, b: 40}, hh: 86},
    deco2: () => `<div class="hb-top">météo · chaîne homebrew <span>v1.1.2</span></div><div class="hb-bot"><span>IP : 192.168.1.${20 + (Math.abs(Math.round(LAT * 100)) % 200)}</span><span>Wi‑Fi connecté ✓</span><span class="r">▲▼ naviguer · Ⓐ lancer · ⌂ menu</span></div>`,
    dayRow: (dt, ic, mx, mn) => `<div class="day"><span class="hb-ic">${ic}</span><span class="hb-tx"><b>${cap(FR_D[dt.getDay()])} ${dt.getDate()}</b><small>météo.dol · ${cap(FR_M[dt.getMonth()])}</small></span><span class="mm"><span>${mx}</span><i>${mn}</i></span></div>`,
    v: {d: {clear: ['Ciel dégagé. Lancement réussi.'], clearN: ['Nuit claire. Système en veille.'], partly: ['Éclaircies chargées.'], cloudy: ['Ciel couvert.'], fog: ['Brouillard détecté.'], drizzle: ['Bruine en cours.'], rain: ['Pluie en cours de téléchargement…'], pour: ['Déluge : mémoire pleine !'], storm: ['Orage : ne débranchez pas la console !'], snow: ['Neige installée avec succès.'], wind: ['Vent fort détecté.'], heat: ['Surchauffe : aérez la console !']},
      kick: () => 'meteo.dol · par la communauté', hl: c => `Max ${c.mx}° · Min ${c.mn}°`, hr: (h, n) => n ? pad2(h) + 'h' : 'Maint.'}},
  x0: {name: '✦ Singularité', icons: 'line', temp: 'text', noAstro: true, noClouds: true, amb: 'bh', secret: true,
    deco2: () => { let d = ''; try { const x = JSON.parse(localStorage.getItem('x0Got') || 'null'); if (x) d = ` · obtenu le ${new Date(x.t).toLocaleDateString('fr-FR')}${x.n > 1 ? ' · ×' + x.n : ''}`; } catch (e) {} return `<div class="x0-vig"></div><div class="x0-badge">✦ OBJET SECRET · 0,2 %${esc(d)} ✦</div>`; },
    cin: done => typeof x0Cinematic === 'function' ? x0Cinematic(done) : false,
    descHTML: d => { const same = d === x0Last; x0Last = d; return d.split(' ').map((w, i) => `<span class="x0w${same ? '' : ' an'}" style="animation-delay:${(i * .09).toFixed(2)}s">${esc(w)}</span>`).join(' '); },
    v: {d: {clear: ['L\'horizon des événements est calme.'], clearN: ['Même la lumière ne s\'échappe pas cette nuit.'], partly: ['Des nuages tournent autour de la singularité.'], cloudy: ['Le ciel est englouti par les nuages.'], fog: ['La matière se dissout dans la brume.'], drizzle: ['Quelques gouttes tombent… vers le centre.'], rain: ['La pluie est aspirée par la gravité.'], pour: ['Un déluge spaghettifié.'], storm: ['Rayonnement de Hawking détecté : orage !'], snow: ['Des flocons en orbite.'], wind: ['Vents relativistes.'], heat: ['Disque d\'accrétion en surchauffe.'], frost: ['Zéro absolu… presque.']},
      kick: c => `✦ SINGULARITÉ · ${UP(c.city)} · T+${Math.floor((Date.now() / 1000) % 86400)} s`, hl: c => `MAX ${c.mx}° · MIN ${c.mn}°`, mt: c => `Ressenti ${c.fe}° · Humidité ${c.hu} % · Vent ${c.wi} km/h`, day: D3, hr: (h, n) => n ? pad2(h) + 'h' : 'T0'}},
  xr: {name: '🔒 Accès restreint', icons: 'line', temp: 'text', noAstro: true, noClouds: true, amb: 'embers', secret: true, L: {pad: {b: 38}},
    deco: '<div class="xr-grid"></div><div class="xr-beam"></div><div class="xr-beam b"></div>',
    deco2: '<div class="xr-tape t"></div><div class="xr-tape b"></div><div class="xr-stamp">ACCÈS<br>RESTREINT</div><div class="xr-badge">★ ULTRA LÉGENDAIRE ★</div>',
    onApply: () => { if (typeof xrVault === 'function') xrVault(); },
    v: {d: {clear: ['Il fait chaud… très chaud 🔥', 'Le soleil se montre sans pudeur ☀'], clearN: ['Nuit étoilée, ambiance tamisée 🕯'], partly: ['Les nuages jouent à cache-cache 😏'], partlyN: ['La lune fait sa timide 🌙'], cloudy: ['Le ciel se couvre… dommage 😏'], cloudnight: ['Nuit couverte, tout reste secret 🤫'], fog: ['Brouillard : on ne voit rien, et c\'est voulu 🙈'], drizzle: ['Petite bruine toute timide 💧'], rain: ['Mieux vaut rester bien au chaud ☔'], pour: ['Le ciel se lâche complètement 🌊'], storm: ['Ça devient électrique ⚡'], hail: ['Ça tape fort là-haut 🧊'], snow: ['Tout en blanc ce soir ❄'], blizzard: ['Tempête blanche : on reste sous la couette 🛏'], wind: ['Ça souffle fort… accrochez-vous 💨'], heat: ['Chaud bouillant 🥵'], frost: ['Il gèle… viens te réchauffer ☕'], dawn: ['Lever du soleil tout en douceur 🌅'], dusk: ['Coucher de soleil… romantique 🌇']},
      kick: () => { const d = clock(), n = (d.getMonth() + 1) * 100 + d.getDate(); return `🔒 DOSSIER Nº ${n} · ACCÈS AUTORISÉ`; }, hl: c => `MAX ${c.mx}° · MIN ${c.mn}°`, mt: c => `Ressenti ${c.fe}° · Humidité ${c.hu} % · Vent ${c.wi} km/h`, day: D3, hr: (h, n) => n ? pad2(h) + 'h' : 'LIVE'}},
  marin: {name: 'Marin (hublot)', icons: 'line', temp: 'port', grid: true, amb: 'bubbles',
    deco: '<svg class="ma-wave" viewBox="0 0 1600 28" preserveAspectRatio="none"><path d="M0 14Q50 0 100 14T200 14T300 14T400 14T500 14T600 14T700 14T800 14T900 14T1000 14T1100 14T1200 14T1300 14T1400 14T1500 14T1600 14V28H0Z" fill="rgba(120,200,230,.35)"/></svg><svg class="ma-wave b" viewBox="0 0 1600 28" preserveAspectRatio="none"><path d="M0 14Q50 26 100 14T200 14T300 14T400 14T500 14T600 14T700 14T800 14T900 14T1000 14T1100 14T1200 14T1300 14T1400 14T1500 14T1600 14V28H0Z" fill="rgba(60,140,190,.45)"/></svg>',
    v: {d: {clear: ['Mer calme, ciel clair, capitaine !'], clearN: ['Nuit claire : suivez l\'étoile polaire.'], partly: ['Quelques nuages à tribord.'], cloudy: ['Ciel bouché, mais on garde le cap.'], fog: ['Brume de mer : cornes de brume !'], drizzle: ['Crachin sur le pont.'], rain: ['Grain en approche, capitaine !'], storm: ['Tempête ! Tout le monde aux postes !'], snow: ['Neige sur le pont : attention à la glissade !'], wind: ['Coup de vent : réduisez la voilure !'], heat: ['Chaleur tropicale à bord.']},
      mt: c => `Ressenti ${c.fe}° · Humidité ${c.hu} %<br>Vent ${Math.round(c.wi / 1.852)} nœuds (${c.wi} km/h)`, kick: () => '⚓ Bulletin de la capitainerie'}}
};
const MGSFX = {clear: 'ゴ', clearN: 'ゴ', partly: 'ゴ', partlyN: 'ゴ', cloudy: 'ゴ', cloudnight: 'ゴ', storm: 'ド', hail: 'ド', pour: 'ザー', rain: 'ザー', sleet: 'ザー', drizzle: 'ポツ', snow: 'シン', blizzard: 'ビュウ', wind: 'ビュウ', fog: 'モヤ', heat: 'ジリ', frost: 'キン'};
/* ----- Aides des styles Vaporwave / Hacker / Cyberpunk / Estampe ----- */
const FW = s => String(s).replace(/[!-~]/g, c => String.fromCharCode(c.charCodeAt(0) + 0xFEE0)).replace(/ /g, '　');
const srnd = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
function vpCol(x, y) { return `<svg class="vp-col" style="left:${x}px;top:${y}px" width="44" height="140" viewBox="0 0 44 140"><defs><linearGradient id="vpm" x1="0" x2="1"><stop offset="0" stop-color="#ffd6f5"/><stop offset=".5" stop-color="#fff"/><stop offset="1" stop-color="#c9b8ff"/></linearGradient></defs><rect x="0" y="0" width="44" height="10" fill="url(#vpm)"/><rect x="4" y="10" width="36" height="6" fill="url(#vpm)"/><rect x="7" y="16" width="30" height="112" fill="url(#vpm)"/>${[12, 17, 22, 27, 32].map(v => `<line x1="${v}" y1="18" x2="${v}" y2="126" stroke="#d9a8ff" stroke-width="1"/>`).join('')}<rect x="2" y="128" width="40" height="12" fill="url(#vpm)"/></svg>`; }
function vpPalm(x, y, d, c) { return `<svg class="vp-palm ${c}" style="left:${x}px;top:${y}px;transform:scaleX(${d})" width="70" height="120" viewBox="0 0 70 120"><path d="M33 120C34 90 36 60 38 34" stroke="#2a1458" stroke-width="5" fill="none"/>${[[-60, 30], [-20, 34], [20, 32], [60, 28], [100, 24], [-100, 22]].map(([a, l]) => { const r = a * Math.PI / 180, ex = 38 + Math.cos(r) * l, ey = 34 + Math.sin(r) * l * .5 + l * .35; return `<path d="M38 34Q${38 + Math.cos(r) * l * .5} ${30 + Math.sin(r) * l * .2 - 8} ${ex} ${ey}" stroke="#2a1458" stroke-width="4" fill="none" stroke-linecap="round"/>`; }).join('')}</svg>`; }
function cySky() {
  const R = srnd(7), C = ['#fcee0a', '#02d7f2', '#ff2a6d', '#ffb86b'], K = ['雨', '夜市', '電気', 'ホテル', '未来', '酒', '天気', 'バー'];
  let b = '', s = '';
  [[0, '#1b1036', 150, 280, .55], [1, '#120a26', 110, 230, .8], [2, '#08050f', 70, 190, 1]].forEach(([L, col, h0, h1, op]) => {
    let x = -10; while (x < 810) { const w = 34 + R() * 46, h = h0 + R() * (h1 - h0), y = 480 - h; b += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${col}"/>`;
      if (L > 0) for (let wy = y + 10; wy < 470; wy += 9) for (let wx = x + 5; wx < x + w - 5; wx += 7) if (R() < .16) b += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="3" height="4" fill="${C[R() * 4 | 0]}" opacity="${(.25 + R() * .5).toFixed(2)}"${R() < .08 ? ' class="cy-fl"' : ''}/>`;
      if (L === 1 && R() < .28 && x > 230 && x < 540) { const c = C[R() * 3 | 0], k = K[R() * K.length | 0]; s += `<div class="cy-sign" style="left:${(x + w / 2 - 10).toFixed(0)}px;top:${(y + 14).toFixed(0)}px;color:${c};border-color:${c};animation-delay:${(-R() * 9).toFixed(1)}s">${k.split('').join('<br>')}</div>`; }
      x += w + 2; } });
  return `<svg class="cy-city" viewBox="0 0 800 480" preserveAspectRatio="none">${b}</svg>${s}<div class="cy-holo">天気<small>24H · LIVE</small></div><div class="cy-car a"></div><div class="cy-car b"></div><div class="cy-car c"></div><div class="cy-wet"></div>`;
}
function hkLog() {
  const L = [], R = srnd(Date.now() % 9973 + 1), H = () => (R() * 65535 | 0).toString(16).padStart(4, '0');
  const M = [() => `[  OK  ] GET /v1/forecast?lat=${LAT.toFixed(3)}&lon=${LON.toFixed(3)} 200 (${20 + (R() * 80 | 0)} ms)`, () => `[ INFO ] parse.json → ${(R() * 900 | 0) + 100} octets`, () => `[ INFO ] capteur.${H()} : ${(R() * 30).toFixed(1)}°C`, () => `0x${H()}${H()}  ${H()} ${H()} ${H()} ${H()}  ${H()} ${H()}`, () => `[ WARN ] nuage.${H()} détecté à ${(R() * 9 | 0) + 1} km`, () => `[  OK  ] radar.sync() terminé`, () => `$ tail -f /var/log/ciel.log`, () => `[ INFO ] vent=${(R() * 40 | 0)}km/h dir=${(R() * 360 | 0)}°`];
  for (let i = 0; i < 80; i++) L.push(esc(M[R() * M.length | 0]()));
  const t = L.join('<br>'); return t + '<br>' + t;
}
let hkT;
function hkType() {
  const e = $('desc'), s = e.textContent; if (e.dataset.ty === s) return; e.dataset.ty = s; clearInterval(hkT);
  let i = 0; const step = () => { i = Math.min(s.length, i + 1); e.innerHTML = `<span class="ty">${esc(s.slice(0, i))}</span><span class="tr">${esc(s.slice(i))}</span>`; if (i >= s.length) clearInterval(hkT); };
  e.innerHTML = `<span class="ty"></span><span class="tr">${esc(s)}</span>`; hkT = setInterval(step, 55); if (typeof AMB !== 'undefined') AMB.type(s.length);
}
const FIGD = {'°': '1111000000', '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001001010010', '8': '111101111101111', '9': '111101111001111', '-': '000000111000000'};
const figHTML = s => { const rows = ['', '', '', '', '']; [...s].forEach((c, n) => { const g = FIGD[c]; if (!g) return; const w = g.length / 5; for (let r = 0; r < 5; r++) rows[r] += (n ? ' ' : '') + g.slice(r * w, r * w + w).replace(/1/g, '██').replace(/0/g, '  '); }); return `<pre class="fig">${rows.join('\n')}</pre>`; };
function ukMount() { return `<svg class="uk-mtn" viewBox="0 0 220 110" width="220" height="110"><path d="M0 110L82 22Q110 6 138 22L220 110Z" fill="#2c4a73"/><path d="M82 22Q110 6 138 22L156 42L144 38L134 48L122 38L110 50L98 38L86 48L76 40L64 42Z" fill="#f6f1e4"/><path d="M40 110L96 60L108 72L120 60L180 110Z" fill="#1f3756" opacity=".55"/></svg>`; }
function ukWave() {
  let foam = ''; for (let i = 0; i < 9; i++) { const a = -2.6 + i * .3, x = 120 + Math.cos(a) * 74, y = 92 + Math.sin(a) * 70; foam += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(5 - i * .3).toFixed(1)}" fill="#f6f1e4"/>`; }
  return `<svg class="uk-wave" viewBox="0 0 260 130" width="260" height="130"><path d="M0 130C10 90 40 50 90 30C140 10 200 28 210 70C200 52 176 44 160 54C176 62 180 84 166 96C150 80 128 82 120 100C108 122 70 128 0 130Z" fill="#23466f"/><path d="M14 130C30 96 60 64 104 48C142 34 184 44 196 62C180 54 160 56 150 66C134 60 112 70 106 92C96 116 60 124 14 130Z" fill="#5b88b5"/><path d="M40 130C60 108 84 90 110 80" stroke="#f6f1e4" stroke-width="2" fill="none" opacity=".7"/>${foam}<path d="M180 130Q220 110 260 120V130Z" fill="#23466f"/></svg>`;
}
/* Menu des chaînes : la main-curseur se promène et surligne une tuile */
let chanI = 0;
function chanHover() {
  if (HT.id !== 'chan') return; const hd = $('chhand'); if (!hd) return;
  document.querySelectorAll('.ch-hov').forEach(e => e.classList.remove('ch-hov'));
  const T = ['now', 'days', 'hours'].map($).filter(e => e && vis(e) && $('v1').classList.contains('on'));
  if (!T.length) return; const e = T[chanI++ % T.length], r = rel(e);
  e.classList.add('ch-hov'); hd.style.transform = `translate(${Math.round(r.x + r.w * (.78 + Math.random() * .12))}px,${Math.round(r.y + r.h * (.55 + Math.random() * .25))}px) rotate(${Math.round(Math.random() * 16 - 8)}deg)`;
}
setInterval(chanHover, 4200);
/* ✦ : compteur en direct, toucher le centre */
let x0Last = '';
setInterval(() => { if (HT.id !== 'x0' || !CTX) return; const k = $('kick'); if (k) k.textContent = HT.v.kick(CTX); }, 1000);
const X0Q = ['Ne t\'approche pas trop…', 'Tu viens de perdre 3 secondes. Relativement.', 'Rien ne s\'échappe d\'ici. Sauf la météo.', 'Spaghettification évitée de justesse.', 'Le temps ralentit près du bord…', 'Attention : la gravité est forte aujourd\'hui.'];
stage.addEventListener('pointerdown', e => {
  if (HT.id !== 'x0' || typeof bhPos !== 'function') return; const s = stage.getBoundingClientRect(), k = s.width / 800, x = (e.clientX - s.left) / k, y = (e.clientY - s.top) / k, [cx, cy] = bhPos();
  if (Math.hypot(x - cx, y - cy) < 80) { BHX.shock = performance.now(); BHX.flash = BHX.shock; if (typeof toast === 'function') toast(X0Q[Math.random() * X0Q.length | 0]); if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on) AMB.one('ping'); }
});
const FESTHUD = {halloween: 'spooky', xmas: 'xmas'};
