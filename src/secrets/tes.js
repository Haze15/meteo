
/* ===================================================================
   ◈ TESSERACT v2 — style secret ultime (1 chance sur 100 000)
   Un cube de cubes : l'ombre en 3D d'un objet à 4 dimensions.
   =================================================================== */
const TV4 = Array.from({length: 16}, (_, i) => [i & 1 ? 1 : -1, i & 2 ? 1 : -1, i & 4 ? 1 : -1, i & 8 ? 1 : -1]);
const TE4 = []; for (let i = 0; i < 16; i++) for (let b = 0; b < 4; b++) { const j = i ^ (1 << b); if (j > i) TE4.push([i, j, b]); }
const TCOL = ['90,240,255', '255,90,220', '255,214,90', '190,170,255'];   // axes X, Y, Z, W
/* les 24 carrés (faces) : [v0, v1, v2, v3, axeA, axeB] */
const TF4 = []; for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) { const o = [0, 1, 2, 3].filter(k => k !== a && k !== b); for (let m = 0; m < 4; m++) { const base = (m & 1 ? 1 << o[0] : 0) | (m & 2 ? 1 << o[1] : 0); TF4.push([base, base | 1 << a, base | 1 << a | 1 << b, base | 1 << b, a, b]); } }
/* les 8 cubes (cellules) : axe fixé, signe, 8 sommets (ordre local), 12 arêtes locales */
const TC4 = []; for (let a = 0; a < 4; a++) for (let s = 0; s < 2; s++) { const fr = [0, 1, 2, 3].filter(k => k !== a), vs = Array.from({length: 8}, (_, l) => (s ? 1 << a : 0) | (l & 1 ? 1 << fr[0] : 0) | (l & 2 ? 1 << fr[1] : 0) | (l & 4 ? 1 << fr[2] : 0)), es = []; for (let l = 0; l < 8; l++) for (let q = 0; q < 3; q++) { const m = l ^ (1 << q); if (m > l) es.push([l, m, fr[q]]); } TC4.push({a, s, vs, es}); }
/* place de chaque cube dans le patron (la croix) : x−, x+, y−, y+, z−, z+, w− (centre), w+ (au bout) */
const TNETPOS = [[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1], [0, 0, 0], [0, 2, 0]];
const TCELLCOL = ['90,240,255', '120,200,255', '255,90,220', '255,140,235', '255,214,90', '255,180,120', '190,170,255', '255,255,255'];
const tesCov = () => +stage.style.getPropertyValue('--cov') || 1, tesK = () => stage.classList.contains('mob') ? 1.25 / tesCov() : 1;
function tesPos() { if (stage.classList.contains('mob') && typeof SH !== 'undefined') { const c = tesCov(); return [400 + (480 * .64 - 240) / c, 240 + (SH * .5 - SH / 2) / c]; } const l = stage.dataset.lay; return l === 'center' ? [655, 150] : l === 'left-row' ? [625, 200] : l === 'right-row' ? [175, 200] : l === 'right' ? [480, 160] : [332, 146]; }
const tcl = x => x < 0 ? 0 : x > 1 ? 1 : x, tez = x => x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
/* projection 4D → 3D → 2D. A = angles des 6 plans de rotation */
function tes4(A, cx, cy, sc, dw = 3, dz = 2.2, V = TV4) {
  const c = {}, s = {}; for (const k in A) { c[k] = Math.cos(A[k]); s[k] = Math.sin(A[k]); }
  return V.map(([x, y, z, w]) => {
    let t;
    if (A.xw) { t = x * c.xw - w * s.xw; w = x * s.xw + w * c.xw; x = t; }
    if (A.yw) { t = y * c.yw - w * s.yw; w = y * s.yw + w * c.yw; y = t; }
    if (A.zw) { t = z * c.zw - w * s.zw; w = z * s.zw + w * c.zw; z = t; }
    if (A.xy) { t = x * c.xy - y * s.xy; y = x * s.xy + y * c.xy; x = t; }
    if (A.xz) { t = x * c.xz - z * s.xz; z = x * s.xz + z * c.xz; x = t; }
    if (A.yz) { t = y * c.yz - z * s.yz; z = y * s.yz + z * c.yz; y = t; }
    const k4 = 1 / (dw - w); x *= k4; y *= k4; z *= k4;
    const k3 = 1 / (dz - z); return [cx + x * k3 * sc, cy + y * k3 * sc, w, z];
  });
}
/* version simple (utilisée aussi par le style Créateur) */
function tesEdges(g, P, al = 1, lw = 1.6, glow = true, E = TE4, col = TCOL) {
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  E.forEach(([i, j, b]) => { const a = P[i], q = P[j]; if (!a || !q) return; const d = Math.max(0, Math.min(1, ((a[2] + q[2]) / 2 + 1) / 2)), al2 = al * (.3 + .7 * d);
    if (glow) { g.strokeStyle = `rgba(${col[b]},${(al2 * .16).toFixed(3)})`; g.lineWidth = lw * 5; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(q[0], q[1]); g.stroke(); }
    g.strokeStyle = `rgba(${col[b]},${(al2 * .92).toFixed(3)})`; g.lineWidth = lw; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(q[0], q[1]); g.stroke(); });
  P.forEach(p => { const k = Math.max(0, Math.min(1, (p[2] + 1) / 2)); g.fillStyle = `rgba(255,255,255,${(al * (.35 + .65 * k)).toFixed(3)})`; g.beginPath(); g.arc(p[0], p[1], lw * (1 + k), 0, 6.2832); g.fill(); });
  g.restore();
}
/* rendu complet : faces translucides triées, décalage RVB, arêtes lumineuses, sommets, surlignages */
function tesDraw(g, P, o = {}) {
  const al = o.al == null ? 1 : o.al, lw = o.lw || 1.6, ch = o.chroma || 0; if (al <= 0) return;
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
  if (o.faces) {
    TF4.map(f => ({f, z: (P[f[0]][3] + P[f[1]][3] + P[f[2]][3] + P[f[3]][3]) / 4})).sort((p, q) => p.z - q.z).forEach(({f}, fi) => {
      const fa = (typeof o.faces === 'function' ? o.faces(f, fi) : o.faces) * al; if (fa <= .002) return;
      const A = P[f[0]], C = P[f[2]], gr = g.createLinearGradient(A[0], A[1], C[0], C[1]); gr.addColorStop(0, `rgba(${TCOL[f[4]]},${fa.toFixed(3)})`); gr.addColorStop(1, `rgba(${TCOL[f[5]]},${fa.toFixed(3)})`);
      g.fillStyle = gr; g.beginPath(); g.moveTo(A[0], A[1]); for (let k = 1; k < 4; k++) g.lineTo(P[f[k]][0], P[f[k]][1]); g.closePath(); g.fill(); });
  }
  if (ch) [[-ch, '255,60,210'], [ch, '60,230,255']].forEach(([dx, c]) => { g.strokeStyle = `rgba(${c},${(.28 * al).toFixed(3)})`; g.lineWidth = lw; g.beginPath(); TE4.forEach(([i, j]) => { g.moveTo(P[i][0] + dx, P[i][1] + dx * .3); g.lineTo(P[j][0] + dx, P[j][1] + dx * .3); }); g.stroke(); });
  TE4.forEach(([i, j, b], ei) => { const a = P[i], q = P[j], d = tcl(((a[2] + q[2]) / 2 + 1) / 2), hi = o.edgeHi ? o.edgeHi(ei) : 0, al2 = Math.min(1.4, al * (.3 + .7 * d) + hi);
    if (o.glow !== false) { g.strokeStyle = `rgba(${TCOL[b]},${(al2 * .16).toFixed(3)})`; g.lineWidth = lw * (5 + hi * 4); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(q[0], q[1]); g.stroke(); }
    g.strokeStyle = hi > .3 ? `rgba(255,255,255,${Math.min(1, al2).toFixed(3)})` : `rgba(${TCOL[b]},${Math.min(1, al2 * .92).toFixed(3)})`; g.lineWidth = lw * (1 + hi * 1.4); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(q[0], q[1]); g.stroke(); });
  P.forEach((p, vi) => { const k = tcl((p[2] + 1) / 2), hi = o.vHi ? o.vHi(vi) : 0; g.fillStyle = `rgba(255,255,255,${(al * (.35 + .65 * k)).toFixed(3)})`; g.beginPath(); g.arc(p[0], p[1], lw * (1 + k), 0, 6.2832); g.fill();
    if (hi > 0) { const r = 6 + hi * 16, hg = g.createRadialGradient(p[0], p[1], 0, p[0], p[1], r); hg.addColorStop(0, `rgba(255,255,255,${hi})`); hg.addColorStop(.3, `rgba(${TCOL[vi % 4]},${(hi * .6).toFixed(2)})`); hg.addColorStop(1, `rgba(${TCOL[vi % 4]},0)`); g.fillStyle = hg; g.fillRect(p[0] - r, p[1] - r, r * 2, r * 2); g.strokeStyle = `rgba(255,255,255,${(hi * .8).toFixed(2)})`; g.lineWidth = 1; g.beginPath(); g.moveTo(p[0] - r * 1.2, p[1]); g.lineTo(p[0] + r * 1.2, p[1]); g.moveTo(p[0], p[1] - r * 1.2); g.lineTo(p[0], p[1] + r * 1.2); g.stroke(); } });
  g.restore();
}
/* les 8 cubes dessinés séparément (pour l'éclatement et le dépliage). CP : 8 × 8 points */
function tesCells(g, CP, o = {}) {
  const al = o.al == null ? 1 : o.al, lw = o.lw || 1.6; if (al <= 0) return;
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  TC4.forEach((c, ci) => { if (o.only != null && ci !== o.only) return; const P = CP[ci], hi = o.hi ? o.hi(ci) : 0;
    c.es.forEach(([l, m, ax]) => { const a = P[l], q = P[m], col = hi > .2 ? TCELLCOL[ci] : TCOL[ax];
      g.strokeStyle = `rgba(${col},${(al * (.14 + hi * .2)).toFixed(3)})`; g.lineWidth = lw * (5 + hi * 3); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(q[0], q[1]); g.stroke();
      g.strokeStyle = `rgba(${col},${Math.min(1, al * (.75 + hi)).toFixed(3)})`; g.lineWidth = lw * (1 + hi); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(q[0], q[1]); g.stroke(); });
    if (o.fill || hi > 0) { const fa = (o.fill || 0) + hi * .12; [[0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4], [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]].forEach(q => { g.fillStyle = `rgba(${TCELLCOL[ci]},${(fa * al).toFixed(3)})`; g.beginPath(); q.forEach((k, n) => n ? g.lineTo(P[k][0], P[k][1]) : g.moveTo(P[k][0], P[k][1])); g.closePath(); g.fill(); }); }
    P.forEach(p => { g.fillStyle = `rgba(255,255,255,${(al * .8).toFixed(2)})`; g.beginPath(); g.arc(p[0], p[1], lw * 1.1, 0, 6.2832); g.fill(); });
  });
  g.restore();
}
const tesCellPts = P => TC4.map(c => c.vs.map(v => P[v]));
/* le patron en croix, projeté (S : taille d'un cube en pixels) */
function tesNet(cx, cy, S, ay, ax) {
  const ca = Math.cos(ay), sa = Math.sin(ay), cb = Math.cos(ax), sb = Math.sin(ax);
  return TC4.map((c, ci) => { const o = TNETPOS[ci]; return Array.from({length: 8}, (_, l) => { let x = (l & 1 ? .5 : -.5) + o[0], y = (l & 2 ? .5 : -.5) + o[1] - .5, z = (l & 4 ? .5 : -.5) + o[2], t = x * ca + z * sa; z = -x * sa + z * ca; x = t; t = y * cb - z * sb; z = y * sb + z * cb; y = t; const k = 4.2 / (4.2 - z); return [cx + x * k * S, cy + y * k * S, z]; }); });
}
const tesLerpCells = (A, B, m) => A.map((P, ci) => { const k = typeof m === 'function' ? m(ci) : m; return P.map((p, l) => [p[0] + (B[ci][l][0] - p[0]) * k, p[1] + (B[ci][l][1] - p[1]) * k, 0]); });
/* coupe par l'hyperplan w = c : enveloppe convexe des points d'intersection */
function tesSlice(g, P, c, al) {
  const pts = []; TE4.forEach(([i, j]) => { const a = P[i], b = P[j]; if ((a[2] - c) * (b[2] - c) < 0) { const u = (c - a[2]) / (b[2] - a[2]); pts.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]); } });
  if (pts.length < 3) return; pts.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  pts.forEach(p => { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  const H = lo.slice(0, -1).concat(up.slice(0, -1));
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createLinearGradient(H[0][0], H[0][1], H[H.length >> 1][0], H[H.length >> 1][1]); gr.addColorStop(0, `rgba(90,240,255,${(.22 * al).toFixed(3)})`); gr.addColorStop(1, `rgba(255,90,220,${(.22 * al).toFixed(3)})`);
  g.fillStyle = gr; g.beginPath(); H.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
  g.strokeStyle = `rgba(255,255,255,${(.9 * al).toFixed(3)})`; g.lineWidth = 1.6; g.stroke();
  pts.forEach(p => { g.fillStyle = `rgba(255,255,255,${al.toFixed(2)})`; g.beginPath(); g.arc(p[0], p[1], 2.2, 0, 6.2832); g.fill(); });
  g.restore();
}
/* boussole à 4 axes : montre où pointent X, Y, Z et W */
function tesCompass(g, x, y, A, al = .75) {
  const U = tes4(A, x, y, 150, 3, 2.2, [[0, 0, 0, 0], [.8, 0, 0, 0], [0, .8, 0, 0], [0, 0, .8, 0], [0, 0, 0, .8]]);
  g.save(); g.globalAlpha = al; g.strokeStyle = 'rgba(190,200,255,.18)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, 26, 0, 6.2832); g.stroke();
  g.globalCompositeOperation = 'lighter'; g.font = '700 8px "JetBrains Mono",monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
  ['X', 'Y', 'Z', 'W'].forEach((n, i) => { const p = U[i + 1]; g.strokeStyle = `rgba(${TCOL[i]},.9)`; g.lineWidth = 1.6; g.beginPath(); g.moveTo(U[0][0], U[0][1]); g.lineTo(p[0], p[1]); g.stroke(); const dx = p[0] - U[0][0], dy = p[1] - U[0][1], d = Math.hypot(dx, dy) || 1; g.fillStyle = `rgb(${TCOL[i]})`; g.fillText(n, p[0] + dx / d * 7, p[1] + dy / d * 7); });
  g.fillStyle = '#fff'; g.beginPath(); g.arc(U[0][0], U[0][1], 1.6, 0, 6.2832); g.fill();
  g.restore();
}

/* ===================================================================
   Le fond du style : la pièce-cube, la poussière qui traverse notre
   dimension, le tesseract, ses vagues et ses ÉVÉNEMENTS 4D
   =================================================================== */
const TSEV = {inv: 'INVERSION', expl: 'ÉCLATEMENT · 8 CUBES', net: 'DÉPLIAGE EN CROIX', slice: 'COUPE · HYPERPLAN'};
let TSX = {spin: 0, a: 0, last: 0, ev: null, evT: 0, next: 0, pulses: [], lastQ: null, dust: null, sliceW: 0};
function tesEvent(t, k) { const L = ['inv', 'expl', 'net', 'slice'], prev = TSX.ev && TSX.ev.k; let e = k || L[Math.random() * 4 | 0]; if (!k && e === TSX.lastEv) e = L[(L.indexOf(e) + 1) % 4]; TSX.ev = {k: e, t, d: {inv: 2600, expl: 3400, net: 6200, slice: 4200}[e]}; TSX.lastEv = e; TSX.next = t + 26000 + Math.random() * 16000; if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on) AMB.one(e === 'net' ? 'chime' : 'ping'); }
function drawTes(P, t) {
  const [cx, cy0] = tesPos(), dt = TSX.last ? Math.min(60, t - TSX.last) : 16; TSX.last = t;
  const T = t / 1000, cy = cy0 + Math.sin(t / 1800) * 4;
  if (!TSX.next) TSX.next = t + 15000;
  if (t > TSX.next && !TSX.ev) tesEvent(t);
  const boost = TSX.spin ? Math.max(0, 1 - (t - TSX.spin) / 1800) : 0; if (boost <= 0) TSX.spin = 0;
  TSX.a += dt / 1000 * (.3 + boost * 3);
  const hue = 200 + 70 * Math.sin(T * .07);
  /* --- la pièce-cube vue de l'intérieur --- */
  const vx = 400, vy = 236, bw = 150, bh = 90; f.save(); f.lineWidth = 1;
  const C4 = [[0, 0], [800, 0], [800, 480], [0, 480]], IN = [[vx - bw, vy - bh], [vx + bw, vy - bh], [vx + bw, vy + bh], [vx - bw, vy + bh]];
  f.strokeStyle = `hsla(${hue},80%,72%,.10)`; f.beginPath(); C4.forEach((p, i) => { f.moveTo(p[0], p[1]); f.lineTo(IN[i][0], IN[i][1]); }); f.stroke();
  for (let k = 0; k < 8; k++) { const z = ((k + (t / 5200) % 1) / 8), e = Math.pow(z, 2.2); f.strokeStyle = `hsla(${hue + k * 8},80%,72%,${(.025 + .09 * (1 - z)).toFixed(3)})`; f.strokeRect(vx - bw - (400 - bw) * e, vy - bh - (vy - bh) * e, (bw + (400 - bw) * e) * 2, (bh + (vy - bh) * e) + (bh + (480 - vy - bh) * e)); }
  for (let i = 1; i < 8; i++) { const u = i / 8; f.strokeStyle = `hsla(${hue + 40},80%,72%,.045)`; f.beginPath(); f.moveTo(800 * u, 480); f.lineTo(vx - bw + 2 * bw * u, vy + bh); f.moveTo(800 * u, 0); f.lineTo(vx - bw + 2 * bw * u, vy - bh); f.stroke(); }
  const vg = f.createRadialGradient(vx, vy, 0, vx, vy, 170); vg.addColorStop(0, `hsla(${hue},90%,70%,.07)`); vg.addColorStop(1, 'rgba(0,0,0,0)'); f.fillStyle = vg; f.fillRect(vx - 170, vy - 170, 340, 340);
  f.restore();
  /* --- poussière qui traverse notre tranche d'univers (elle n'existe que quand W ≈ 0) --- */
  if (!TSX.dust) TSX.dust = Array.from({length: cfg.lite ? 26 : 56}, () => ({x: Math.random() * 800, y: Math.random() * 480, f: .3 + Math.random() * .8, p: Math.random() * 6.28, c: Math.random() * 4 | 0, dx: (Math.random() - .5) * .2, dy: (Math.random() - .5) * .2}));
  f.save(); f.globalCompositeOperation = 'lighter';
  TSX.dust.forEach(d => { d.x += d.dx * SPD; d.y += d.dy * SPD; if (d.x < 0) d.x += 800; if (d.x > 800) d.x -= 800; if (d.y < 0) d.y += 480; if (d.y > 480) d.y -= 480; const w = Math.sin(T * d.f + d.p), a = Math.exp(-w * w * 9); if (a < .03) return; const r = 1 + a * 3.2; f.fillStyle = `rgba(${TCOL[d.c]},${(a * .7).toFixed(2)})`; f.beginPath(); f.moveTo(d.x, d.y - r * 2); f.lineTo(d.x + r * .4, d.y); f.lineTo(d.x, d.y + r * 2); f.lineTo(d.x - r * .4, d.y); f.closePath(); f.moveTo(d.x - r * 2, d.y); f.lineTo(d.x, d.y + r * .4); f.lineTo(d.x + r * 2, d.y); f.lineTo(d.x, d.y - r * .4); f.closePath(); f.fill(); });
  f.restore();
  /* --- le tesseract --- */
  const a = TSX.a, A = {xw: a * .9, yw: a * .55, zw: a * .37, xz: .52 + Math.sin(a * .2) * .15, yz: -.35}, sc = 205 * tesK() * (1 + boost * .15);
  let ev = TSX.ev, q = 0; if (ev) { q = (t - ev.t) / ev.d; if (q >= 1) { TSX.ev = ev = null; q = 0; } }
  let chroma = 1.2 + boost * 3, mode = 'main';
  if (ev && ev.k === 'inv') { A.xw += Math.PI * tez(q); chroma += 5 * Math.sin(q * Math.PI); }
  /* vagues : une à chaque quart de tour dans le plan XW */
  const qt = Math.floor(A.xw / (Math.PI / 2)); if (TSX.lastQ !== null && qt !== TSX.lastQ) { TSX.pulses.push(t); if (TSX.pulses.length > 5) TSX.pulses.shift(); } TSX.lastQ = qt;
  f.save(); f.globalCompositeOperation = 'lighter'; TSX.pulses.forEach((p, i) => { const e = (t - p) / 2600; if (e < 0 || e > 1) return; const s = 30 + e * 190; f.save(); f.translate(cx, cy + 70); f.scale(1, .32); f.rotate(Math.PI / 4 + e * .3); f.strokeStyle = `rgba(${TCOL[i % 4]},${((1 - e) * .32).toFixed(3)})`; f.lineWidth = 2.5; f.strokeRect(-s, -s, s * 2, s * 2); f.restore(); }); f.restore();
  const halo = f.createRadialGradient(cx, cy, 0, cx, cy, 120); halo.addColorStop(0, `hsla(${hue + 40},90%,70%,.16)`); halo.addColorStop(1, 'rgba(60,40,140,0)'); f.fillStyle = halo; f.fillRect(cx - 130, cy - 130, 260, 260);
  const PP = tes4(A, cx, cy, sc);
  if (ev && ev.k === 'expl') {
    const k = Math.sin(tcl(q) * Math.PI), CP = tesCellPts(PP).map(c => { const mx = c.reduce((s, p) => s + p[0], 0) / 8, my = c.reduce((s, p) => s + p[1], 0) / 8, dx = (mx - cx) * k * .6, dy = (my - cy) * k * .6; return c.map(p => [p[0] + dx, p[1] + dy]); });
    tesCells(f, CP, {al: .95, lw: 1.3, fill: .03 * k, hi: ci => k * .5 * (Math.sin(T * 6 + ci) * .5 + .5)}); mode = 'cells';
  } else if (ev && ev.k === 'net') {
    const m = q < .28 ? tez(q / .28) : q > .72 ? tez((1 - q) / .28) : 1, net = tesNet(cx, cy - 4, 27, T * .6, -.42 + Math.sin(T * .5) * .1);
    tesCells(f, tesLerpCells(tesCellPts(PP), net, ci => tcl(m * 1.35 - ci * .05)), {al: .95, lw: 1.3, fill: .03 * m}); mode = 'cells';
  }
  if (mode === 'main') {
    if (!cfg.lite) for (let k = 2; k >= 1; k--) { const B = Object.assign({}, A, {xw: A.xw - k * .045 * (1 + boost * 5), yw: A.yw - k * .03 * (1 + boost * 5)}); tesDraw(f, tes4(B, cx, cy, sc), {al: .09 / k, lw: 1.2, glow: false}); }
    tesDraw(f, PP, {al: ev && ev.k === 'slice' ? .55 : .95, lw: 1.5, faces: .045, chroma});
    if (ev && ev.k === 'slice') { TSX.sliceW = -1.5 + tez(q) * 3; tesSlice(f, PP, TSX.sliceW, Math.sin(tcl(q) * Math.PI)); }
  }
  if (tesK() < 1) { const k = tesK(); f.save(); f.translate(cx + 100 * k, cy0 - 60 * k); f.scale(k, k); tesCompass(f, 0, 0, A, .7); f.restore(); } else tesCompass(f, cx + 112, cy0 - 64, A, .7);
}
const tesW = () => { const w = Math.sin(TSX.a * .9); return (w >= 0 ? '+' : '−') + Math.abs(w).toFixed(3); };
let tesLast = '';

/* ===================================================================
   La cinématique v2 (≈ 43 s) : 2D → 0D → 1D → 2D → 3D → 4D …
   =================================================================== */
let tesOn = false;
function tesCinematic(apply) {
  if (tesOn) return false; tesOn = true;
  let got = null; try { got = JSON.parse(localStorage.getItem('tesGot') || 'null'); } catch (e) {}
  const el = document.createElement('div'); el.id = 'tsc';
  el.innerHTML = `<canvas width="800" height="480"></canvas><div class="ts-world"><div class="ts-slab"></div></div><svg class="ts-trace" viewBox="0 0 800 480"><rect x="2" y="2" width="796" height="476" pathLength="100"/></svg>
    <div class="ts-dim"><small>DIMENSIONS</small><b>2</b></div><div class="ts-plane"></div><div class="ts-facts"></div><div class="ts-cap"></div><div class="ts-flash"></div>
    <div class="ts-title">${[...'TESSERACT'].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</div>
    <div class="ts-sub"><b>STYLE SECRET DÉBLOQUÉ</b><span>1 CHANCE SUR 100 000${got && got.n ? ` · OBTENU ×${got.n}` : ''}</span></div><div class="ts-skip">touche 2 fois pour passer</div>`;
  stage.appendChild(el); if (typeof cinFX === 'function') cinFX(el);
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), tm = [], at = (s, fn) => tm.push(setTimeout(fn, s * 1000)), T0 = performance.now(), lite = !!cfg.lite;
  const music = !PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on ? (AMB.unlock(), AMB.tes()) : null;
  const $$ = s => el.querySelector(s), DIM = $$('.ts-dim b'), PL = $$('.ts-plane'), FA = $$('.ts-facts');
  const cap = (s, d = 2.4) => { const c = $$('.ts-cap'); c.classList.remove('on'); setTimeout(() => { c.innerHTML = s; c.classList.add('on'); }, 200); if (d) tm.push(setTimeout(() => c.classList.remove('on'), (d + .2) * 1000)); };
  const dim = (n, glitch) => { DIM.textContent = n; DIM.classList.remove('tk', 'gl'); void DIM.offsetWidth; DIM.classList.add('tk'); if (glitch) DIM.classList.add('gl'); };
  const plane = s => { PL.classList.remove('on'); void PL.offsetWidth; PL.innerHTML = s; PL.classList.add('on'); };
  const fact = (n, s) => { const d = document.createElement('div'); d.className = 'ts-fact'; d.innerHTML = `<b>${n}</b>${s}`; FA.appendChild(d); };
  /* 0. l'écran (2D) s'écrase en une ligne (1D) puis en un point (0D) */
  const slab = $$('.ts-slab'), keep = ['ovb', 'deco', 'under', 'v1', 'v2', 'v3', 'deco2', 'eggs', 'fest', 'tick', 'shelf', 'fx'];
  at(.05, () => el.classList.add('trace'));
  at(1.25, () => el.classList.add('hud'));
  at(.85, () => { [...stage.children].filter(e => e !== el && (e.classList.contains('bg') || e.tagName === 'HEADER' || keep.includes(e.id))).forEach(e => { if (getComputedStyle(e).display === 'none') return; const k = e.cloneNode(true); if (e.tagName === 'CANVAS') { try { k.getContext('2d').drawImage(e, 0, 0); } catch (x) {} } slab.appendChild(k); }); el.classList.add('slab'); stage.classList.add('ts-hide'); });
  at(1.05, () => el.classList.add('flat'));
  at(1.6, () => dim(1));
  at(1.75, () => el.classList.add('pt'));
  at(2.15, () => { dim(0); el.classList.add('gone'); });
  /* 1. on reconstruit : point → ligne → carré → cube → tesseract */
  at(2.4, () => cap('<i>0 dimension</i> · un point.', 1.5));
  at(4.0, () => { dim(1); cap('On le tire… <i>1 dimension</i> · une ligne.', 2.2); });
  at(6.6, () => { dim(2); cap('On tire la ligne… <i>2 dimensions</i> · un carré.', 2.2); });
  at(9.2, () => { dim(3); cap('On tire le carré… <i>3 dimensions</i> · un cube.', 2.6); });
  at(12.6, () => { DIM.textContent = '3…'; cap('Et si on tirait le cube… dans une direction <i>qui n\'existe pas</i> ?', 3.8); });
  at(14.5, () => DIM.classList.add('gl'));
  const IMP1 = 16.8;
  at(IMP1, () => { dim(4, true); if (typeof impactFrames === 'function') impactFrames({host: el, x: 400, y: 236, theme: 'tes', snd: false, r: 18}); });
  at(IMP1 + .34, () => el.classList.add('flash1'));
  at(17.5, () => cap('<i>4 dimensions</i> · un <b>tesseract</b>. Tu ne vois que son ombre en 3D.', 3.4));
  /* 2. les quatre plans de rotation, et ce qu'il contient */
  const PLN = [[17.4, 'PLAN <b style="color:rgb(90,240,255)">X</b><b style="color:rgb(190,170,255)">W</b>'], [19.6, 'PLAN <b style="color:rgb(255,90,220)">Y</b><b style="color:rgb(190,170,255)">W</b>'], [21.8, 'PLAN <b style="color:rgb(255,214,90)">Z</b><b style="color:rgb(190,170,255)">W</b>'], [24, 'DOUBLE · <b style="color:rgb(90,240,255)">X</b><b style="color:rgb(190,170,255)">W</b> + <b style="color:rgb(255,90,220)">Y</b><b style="color:rgb(255,214,90)">Z</b>']];
  PLN.forEach(([s, h]) => at(s, () => plane('ROTATION · ' + h)));
  at(18, () => fact(16, 'SOMMETS')); at(20.2, () => fact(32, 'ARÊTES')); at(22.4, () => fact(24, 'CARRÉS')); at(24.6, () => fact(8, 'CUBES'));
  at(26.4, () => { FA.classList.add('gone'); PL.classList.remove('on'); });
  at(26.8, () => cap('Plongée dans la quatrième dimension…', 2.8));
  /* 3. effondrement, éclair, le patron en croix, le titre */
  const IMP2 = 31.2;
  at(IMP2, () => { if (typeof impactFrames === 'function') impactFrames({host: el, x: 400, y: 236, snd: false, theme: 'tes', r: 22, lines: 90}); });
  at(IMP2 + .34, () => el.classList.add('flash'));
  at(33.4, () => { el.classList.add('title'); el.classList.remove('hud'); });
  at(38.4, () => { el.classList.remove('title'); el.classList.add('untitle'); cap('… et maintenant, il vit sur ton écran.', 2.6); });
  const AP = 41.4;
  at(AP, () => { if (apply && typeof apply === 'function') apply(); TSX.a = handA; TSX.last = performance.now(); TSX.next = performance.now() + 20000; stage.classList.remove('ts-hide'); stage.classList.add('ts-in'); el.classList.add('out'); });
  const fin = () => { tm.forEach(clearTimeout); el.remove(); tesOn = false; stage.classList.remove('ts-hide', 'ts-in'); };
  at(AP + 2.2, fin);
  let last = 0;
  el.addEventListener('pointerdown', e => { e.stopPropagation(); const n = Date.now(); $$('.ts-skip').classList.add('on'); if (n - last < 450) { if (music) music.stop(); tm.forEach(clearTimeout); if (apply && typeof apply === 'function') apply(); stage.classList.remove('ts-hide'); el.classList.add('out', 'skip'); setTimeout(fin, 900); } last = n; });

  /* ----- canevas ----- */
  const ST = Array.from({length: lite ? 120 : 260}, () => ({x: (Math.random() - .5) * 2, y: (Math.random() - .5) * 2, z: Math.random(), c: Math.random() * 4 | 0}));
  const eo = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3), cl = (a, b, x) => tcl((x - a) / (b - a));
  const themeA = a => ({xw: a * .9, yw: a * .55, zw: a * .37, xz: .52 + Math.sin(a * .2) * .15, yz: -.35});
  let lastT = 0, rXW = 0, rYW = 0, rZW = 0, rYZ = 0, zoom = 0, handA = 0;
  const X = 400, Y = 236;
  (function frame(now) {
    if (!el.isConnected) return; requestAnimationFrame(frame); const t = (now - T0) / 1000, dt = Math.min(.06, t - lastT); lastT = t;
    try {
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      const dark = cl(.9, 1.6, t), trail = (t > 24 && t < 31.2);
      if (trail) { g.fillStyle = 'rgba(3,2,12,.28)'; g.fillRect(0, 0, 800, 480); } else { g.clearRect(0, 0, 800, 480); if (dark) { g.fillStyle = `rgba(3,2,12,${dark.toFixed(3)})`; g.fillRect(0, 0, 800, 480); } }
      if (t > AP + .05) { g.globalAlpha = 1 - cl(AP, AP + .9, t); }
      /* étoiles (vitesse liée à l'action) */
      if (dark) {
        const sp = t < 17 ? .0015 : t < 26.6 ? .004 : t < 31 ? .01 + (t - 26.6) * .008 : .002;
        g.globalCompositeOperation = 'lighter';
        ST.forEach(s => { const z0 = s.z; s.z -= sp * dt * 60; if (s.z <= .02) { s.z = 1; s.x = (Math.random() - .5) * 2; s.y = (Math.random() - .5) * 2; return; } const x1 = X + s.x / s.z * 200, y1 = Y + s.y / s.z * 200, x0 = X + s.x / z0 * 200, y0 = Y + s.y / z0 * 200; g.strokeStyle = `rgba(${TCOL[s.c]},${((1 - s.z) * .7 * dark).toFixed(2)})`; g.lineWidth = (1 - s.z) * 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); });
        g.globalCompositeOperation = 'source-over';
      }
      /* le point qui apparaît quand l'écran s'est écrasé */
      if (t > 1.9 && t < 4.3) { const a = cl(1.9, 2.2, t), pr = 5 + Math.sin(t * 6) * 1.2, pg = g.createRadialGradient(X, Y, 0, X, Y, pr * 7); pg.addColorStop(0, `rgba(255,255,255,${a})`); pg.addColorStop(.25, `rgba(190,170,255,${(a * .6).toFixed(2)})`); pg.addColorStop(1, 'rgba(90,240,255,0)'); g.globalCompositeOperation = 'lighter'; g.fillStyle = pg; g.fillRect(X - pr * 7, Y - pr * 7, pr * 14, pr * 14); g.globalCompositeOperation = 'source-over'; }
      /* 1. construction : chaque axe « s'étire » à son tour */
      if (t >= 3.9 && t < 17.6) {
        const px = tez(cl(4, 5.4, t)), py = tez(cl(6.6, 8, t)), pz = tez(cl(9.2, 10.8, t)), pw = tez(cl(13.4, 16.6, t)), p = [px, py, pz, pw];
        const sweep = t < 6.4 ? 0 : t < 9 ? 1 : t < 12.4 ? 2 : 3, sk = [px, py, pz, pw][sweep], sAct = Math.sin(sk * Math.PI);
        const V = TV4.map(v => v.map((c, k) => c * p[k] * (k === 3 ? 1 : 1)));
        const view = tez(cl(9.6, 11.6, t)), A = {xz: .55 * view, yz: -.4 * view, xw: t > 16.6 ? (t - 16.6) * .5 : 0};
        const PP = tes4(A, X, Y, 520, 3, 2.2, V);
        /* traînées de l'étirement */
        for (let n = 4; n >= 1; n--) { const pk = p.slice(); pk[sweep] = Math.max(0, p[sweep] - n * .06 * sAct); tesDraw(g, tes4(A, X, Y, 520, 3, 2.2, TV4.map(v => v.map((c, k) => c * pk[k]))), {al: .12 / n, lw: 1.6, glow: false}); }
        tesDraw(g, PP, {al: 1, lw: 2.2, faces: (f) => ((f[4] === sweep || f[5] === sweep) ? .09 * sAct : 0) + (t > 16.6 ? .04 : 0) + (sweep >= 2 && f[4] < sweep && f[5] < sweep ? .03 : 0), chroma: t > 14.5 ? 2 + Math.sin(t * 20) * 1.5 : 0});
        if (t > IMP1 - .05 && t < IMP1 + .9) { const e = (t - IMP1) / .9, r = 40 + e * 520; g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(190,170,255,${((1 - e) * .8).toFixed(2)})`; g.lineWidth = 6 * (1 - e) + 1; g.beginPath(); g.ellipse(X, Y, r, r * .7, 0, 0, 6.2832); g.stroke(); g.restore(); }
      }
      /* 2. les quatre plans de rotation (17,4 → 26,6) */
      if (t >= 17.6 && t < 26.8) {
        const w = 1.5 * dt;
        if (t < 19.6) rXW += w; else if (t < 21.8) rYW += w; else if (t < 24) rZW += w; else { rXW += w * 1.7; rYZ += w * 1.7; }
        const A = {xw: rXW + 1, yw: rYW, zw: rZW, xz: .55, yz: -.4 + rYZ}, sc = 520 + Math.sin(t * .9) * 18;
        const sw = [17.4, 19.6, 21.8, 24].some(s => t > s && t < s + .35);
        for (let k = 2; k >= 1; k--) { const B = Object.assign({}, A, {xw: A.xw - k * .05, yw: A.yw - k * .04, zw: A.zw - k * .04, yz: A.yz - k * .04 * (t > 24 ? 1 : 0)}); tesDraw(g, tes4(B, X, Y, sc), {al: .1 / k, lw: 1.6, glow: false}); }
        const PP = tes4(A, X, Y, sc);
        const vHi = vi => { const s = 18 + vi * .085; return t > s && t < s + .55 ? Math.sin((t - s) / .55 * Math.PI) : 0; };
        const eHi = ei => { const s = 20.2 + ei * (1.25 / 32); return t > s && t < s + .7 ? 1 - (t - s) / .7 : 0; };
        const fFl = t > 22.4 && t < 23.9 ? Math.sin(cl(22.4, 23.9, t) * Math.PI) : 0;
        tesDraw(g, PP, {al: 1, lw: 2.2, faces: .04 + fFl * .2, chroma: sw ? 6 : 1.5, vHi, edgeHi: eHi});
        if (t > 24.6 && t < 26.6) { const ci = Math.floor((t - 24.6) / .22); if (ci < 8) { const k = Math.sin(((t - 24.6) % .22) / .22 * Math.PI); tesCells(g, tesCellPts(PP), {only: ci, al: .9 * k + .1, lw: 2, hi: () => k, fill: .02}); } }
      }
      /* 3. plongée : tesseracts emboîtés à l'infini, puis effondrement (26,6 → 31,2) */
      if (t >= 26.6 && t < IMP2 + .05) {
        rXW += dt * (1.2 + (t - 26.6) * .6); rYZ += dt * .8; zoom += dt * (.5 + (t - 26.6) * .35);
        const A = {xw: rXW, yw: rYW, zw: rZW, xz: .55, yz: -.4 + rYZ}, K = 2.4, f0 = zoom % 1, coll = cl(30.6, IMP2, t);
        for (let n = -2; n <= 3; n++) { const sc = 520 * Math.pow(K, n + f0) * (1 - coll * .985); if (sc < 6 || sc > 9000) continue; const al = Math.min(1, sc / 120) * Math.min(1, 2400 / sc); tesDraw(g, tes4(Object.assign({}, A, {xy: (n + f0) * .4}), X, Y, sc), {al: al, lw: 1.4 + Math.min(4, sc / 600), glow: sc < 2000, chroma: 2 + (t - 26.6)}); }
      }
      /* 4. renaissance, patron en croix, puis retour vers le style */
      if (t >= IMP2 + .1) {
        const e = t - IMP2, grow = eo(cl(.15, .9, e)), ay = t * .5, ax = -.4 + Math.sin(t * .45) * .1;
        let A, cx = X, cy = Y, sc = 420 * grow;
        /* à partir du repli, les angles suivent exactement la formule du style */
        if (t >= 38.4) { handA = (t - 38.4) * .3; A = themeA(handA); const mv = tez(cl(39.6, AP - .1, t)), [tx, ty] = tesPos(); cx = X + (tx - X) * mv; cy = Y + (ty - Y) * mv; sc = 420 + (205 - 420) * mv; }
        else A = {xw: rXW + e * .6, yw: rYW, zw: rZW, xz: .55, yz: -.4 + rYZ};
        const PP = tes4(A, cx, cy, sc), CP = tesCellPts(PP), net = tesNet(X, 176, 46, ay, ax);
        /* m : 0 = tesseract, 1 = patron (chaque cube part un peu après l'autre) */
        const mOut = ci => tez(cl(32 + ci * .14, 33.1 + ci * .14, t)), mBack = ci => 1 - tez(cl(38.4 + (7 - ci) * .1, 39.5 + (7 - ci) * .1, t));
        const m = ci => t < 38.4 ? mOut(ci) : mBack(ci);
        const any = TC4.some((_, ci) => m(ci) > .001);
        if (e > .3 && e < .8) { const fl = 1 - (e - .3) * 2, fg = g.createRadialGradient(X, Y, 0, X, Y, 420); fg.addColorStop(0, `rgba(255,255,255,${fl})`); fg.addColorStop(.4, `rgba(190,170,255,${(fl * .5).toFixed(2)})`); fg.addColorStop(1, 'rgba(90,240,255,0)'); g.globalCompositeOperation = 'lighter'; g.fillStyle = fg; g.fillRect(0, 0, 800, 480); g.globalCompositeOperation = 'source-over'; }
        if (any) {
          if (t > 33 && t < 38.6) { const hl = g.createRadialGradient(X, 176, 0, X, 176, 260); hl.addColorStop(0, 'rgba(150,110,255,.22)'); hl.addColorStop(1, 'rgba(40,20,120,0)'); g.globalCompositeOperation = 'lighter'; g.fillStyle = hl; g.fillRect(140, 0, 520, 420); g.globalCompositeOperation = 'source-over'; }
          tesCells(g, tesLerpCells(CP, net, m), {al: 1, lw: 1.8, fill: .035, hi: ci => t > 33.2 && t < 38.4 ? .35 + .35 * Math.sin(t * 3 + ci * .8) : 0});
        } else {
          const fin2 = t >= 39.6;
          tesDraw(g, PP, {al: 1, lw: fin2 ? 1.5 + (1 - cl(39.6, AP, t)) * .7 : 2, faces: .045, chroma: 1.2});
          if (t > 40.4) tesCompass(g, cx + 112, cy - 64, A, .7 * cl(40.4, AP, t));
        }
      }
    } catch (x) { g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  })(T0);
  return true;
}

/* ----- Le style ----- */
Object.assign(SIG, {
  tes: {name: '◈ Tesseract', icons: 'line', temp: 'text', noAstro: true, noClouds: true, amb: 'tes', secret: true,
    deco2: () => { let d = ''; try { const x = JSON.parse(localStorage.getItem('tesGot') || 'null'); if (x) d = ` · obtenu le ${new Date(x.t).toLocaleDateString('fr-FR')}${x.n > 1 ? ' · ×' + x.n : ''}`; } catch (e) {} return `<div class="ts-badge">◈ OBJET SECRET · 0,001 % · 4 DIMENSIONS${esc(d)}</div>`; },
    cin: done => tesCinematic(done),
    descHTML: d => { const same = d === tesLast; tesLast = d; return d.split(' ').map((w, i) => `<span class="tsw${same ? '' : ' an'}" style="animation-delay:${(i * .08).toFixed(2)}s">${esc(w)}</span>`).join(' '); },
    v: {d: {clear: ['Ciel dégagé, dans les quatre dimensions.'], clearN: ['Nuit claire. Quelque part en W, il fait jour.'], partly: ['Quelques nuages, vus sous un angle inédit.'], partlyN: ['Des nuages projetés sur la nuit.'], cloudy: ['Ciel couvert dans notre tranche d\'univers.'], cloudnight: ['Nuit couverte, en trois dimensions seulement.'], fog: ['Brouillard : même la 3D devient floue.'], drizzle: ['Une bruine qui tombe selon trois axes.'], rain: ['Il pleut. Dans une autre dimension, peut-être pas.'], pour: ['Averse ! Même en 4D, prends un parapluie.'], storm: ['Orage : l\'espace-temps grésille.'], hail: ['Grêle : des petits cubes de glace.'], snow: ['Il neige, chaque flocon est un cristal en 3D.'], blizzard: ['Tempête de neige, axes brouillés.'], wind: ['Le vent souffle selon l\'axe X.'], heat: ['Chaleur sur tous les axes. Hydrate-toi !'], frost: ['Gel : même la quatrième dimension frissonne.'], rainbow: ['Un arc-en-ciel : la lumière dépliée.']},
      kick: c => TSX.ev ? `◈ 4D · ${TSEV[TSX.ev.k]}${TSX.ev.k === 'slice' ? ` W = ${(TSX.sliceW >= 0 ? '+' : '−') + Math.abs(TSX.sliceW).toFixed(2)}` : ''}` : `◈ TESSERACT · ${UP(c.city)} · W ${tesW()}`, hl: c => `MAX ${c.mx}° · MIN ${c.mn}°`, mt: c => `ressenti ${c.fe}° · humidité ${c.hu} % · vent ${c.wi} km/h`, day: D3, hr: (h, n) => n ? pad2(h) + 'h' : 'NOW'}}
});
setInterval(() => { if (HT.id !== 'tes' || typeof CTX === 'undefined' || !CTX) return; const k = $('kick'); if (k) { const s = HT.v.kick(CTX); if (k.textContent !== s) k.textContent = s; k.classList.toggle('ev', !!TSX.ev); } }, 250);
const TSQ = ['Tu ne vois que son ombre en 3D.', 'Un cube fait de 8 cubes.', '16 sommets, 32 arêtes, 24 carrés, 8 cubes.', 'Il ne tourne pas : c\'est toi qui le regardes de travers.', 'Bienvenue dans la quatrième dimension.', 'Les points qui clignotent traversent notre dimension.'];
stage.addEventListener('pointerdown', e => {
  if (HT.id !== 'tes') return; const s = stage.getBoundingClientRect(), mob = stage.classList.contains('mob'), k = s.width / (mob ? 480 : 800), c = mob ? tesCov() : 1, sx = (e.clientX - s.left) / k, sy = (e.clientY - s.top) / k, x = mob ? 400 + (sx - 240) / c : sx, y = mob ? 240 + (sy - stage.offsetHeight / 2) / c : sy, [cx, cy] = tesPos();
  if (Math.hypot(x - cx, y - cy) < 110) { TSX.spin = performance.now(); if (!TSX.ev) tesEvent(performance.now()); if (typeof toast === 'function') toast(TSQ[Math.random() * TSQ.length | 0]); }
});
EGGS.tescin = () => tesCinematic(HT.id === 'tes');
