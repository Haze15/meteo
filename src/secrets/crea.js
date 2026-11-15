
/* ===================================================================
   ♛ CRÉATEUR — le style exclusif de l'admin (introuvable au roll)
   Le cristal du créateur, entouré des six reliques (les styles secrets).
   =================================================================== */
function crPos() { const l = stage.dataset.lay; return l === 'center' ? [400, 178] : l === 'left-row' ? [560, 190] : l === 'right-row' ? [240, 190] : l === 'right' ? [470, 196] : [412, 142]; }
const RELICS = [
  {id: 'nova', g: '✸', n: 'SUPERNOVA', r: 'EXCEPTIONNEL · 1,5 %', c: '255,150,70', f: 'Orbitron,sans-serif'},
  {id: 'x0', g: '✦', n: 'SINGULARITÉ', r: 'SECRET · 1 SUR 500', c: '255,205,120', f: 'Orbitron,sans-serif'},
  {id: 'inf', g: '∞', n: 'INFINI', r: 'SECRET · 1 SUR 1 000', c: '200,120,255', f: 'Orbitron,sans-serif'},
  {id: 'void', g: '∅', n: 'NÉANT', r: 'SECRET · 1 SUR 10 000', c: '235,232,225', f: '"Shippori Mincho B1",serif'},
  {id: 'tes', g: '◈', n: 'TESSERACT', r: 'SECRET · 1 SUR 100 000', c: '90,240,255', f: 'Audiowide,sans-serif'},
  {id: 'gen', g: '✺', n: 'GENÈSE', r: 'LÉGENDAIRE · 1 SUR 1 000 000', c: '255,217,138', f: 'Cinzel,serif'}
];
/* ----- le cristal (octaèdre irisé, faces triées par profondeur) ----- */
const GEM_V = [[0, -1.55, 0], [1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1], [0, 1.25, 0]];
const GEM_F = [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1], [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 1, 4]];
function drawGem(g, x, y, R, t, al = 1, hue = 0) {
  if (R <= 0 || al <= 0) return;
  const ay = t * .55, ax = .32 + Math.sin(t * .4) * .06, cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
  const P = GEM_V.map(([a, b, c]) => { let X = a * cy + c * sy, Z = -a * sy + c * cy, Y = b * cx - Z * sx; Z = b * sx + Z * cx; const k = 3.2 / (3.2 - Z * .6); return [x + X * R * k, y + Y * R * k, Z]; });
  const F = GEM_F.map(f => { const [A, B, C] = f.map(i => P[i]), nz = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]); return {f, z: (A[2] + B[2] + C[2]) / 3, nz}; }).sort((p, q) => p.z - q.z);
  g.save(); g.globalAlpha = al;
  const halo = g.createRadialGradient(x, y, 0, x, y, R * 3.2); halo.addColorStop(0, 'rgba(255,255,255,.28)'); halo.addColorStop(.3, `hsla(${(hue + t * 30) % 360},90%,75%,.12)`); halo.addColorStop(1, 'rgba(120,100,255,0)'); g.globalCompositeOperation = 'lighter'; g.fillStyle = halo; g.fillRect(x - R * 3.2, y - R * 3.2, R * 6.4, R * 6.4);
  g.globalCompositeOperation = 'source-over';
  F.forEach(({f, nz}, i) => { const [A, B, C] = f.map(k => P[k]), front = nz < 0, h = (hue + t * 40 + f[1] * 52 + f[2] * 31) % 360, gr = g.createLinearGradient(A[0], A[1], (B[0] + C[0]) / 2, (B[1] + C[1]) / 2);
    gr.addColorStop(0, `hsla(${h},95%,${front ? 88 : 60}%,${front ? .55 : .35})`); gr.addColorStop(1, `hsla(${(h + 70) % 360},95%,${front ? 62 : 40}%,${front ? .42 : .3})`);
    g.fillStyle = gr; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.lineTo(C[0], C[1]); g.closePath(); g.fill();
    g.strokeStyle = `rgba(255,255,255,${front ? .85 : .25})`; g.lineWidth = front ? 1.4 : .8; g.stroke(); });
  /* étincelle qui glisse sur une arête */
  g.globalCompositeOperation = 'lighter'; const e = (t * .7) % 1, a = P[0], b = P[1 + ((t * .7 | 0) % 4)], sx2 = a[0] + (b[0] - a[0]) * e, sy2 = a[1] + (b[1] - a[1]) * e, sg = g.createRadialGradient(sx2, sy2, 0, sx2, sy2, 12); sg.addColorStop(0, 'rgba(255,255,255,.95)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sg; g.fillRect(sx2 - 12, sy2 - 12, 24, 24);
  g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 1; g.beginPath(); g.moveTo(sx2 - 9, sy2); g.lineTo(sx2 + 9, sy2); g.moveTo(sx2, sy2 - 9); g.lineTo(sx2, sy2 + 9); g.stroke();
  g.restore();
}
/* faisceaux prismatiques (dispersion de la lumière) */
function prismBeams(g, x, y, L, t, al) {
  if (al <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; g.translate(x, y);
  for (let i = 0; i < 7; i++) { const a = -.32 + i * .107 + Math.sin(t * .3) * .05, gr = g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, `hsla(${i * 46},100%,65%,0)`); gr.addColorStop(.25, `hsla(${i * 46},100%,65%,${(.16 * al).toFixed(3)})`); gr.addColorStop(1, `hsla(${i * 46},100%,60%,0)`); g.save(); g.rotate(a); g.fillStyle = gr; g.beginPath(); g.moveTo(0, -1); g.lineTo(L, -10); g.lineTo(L, 10); g.lineTo(0, 1); g.fill(); g.restore(); }
  const w = g.createLinearGradient(0, 0, -L * .8, 0); w.addColorStop(0, `rgba(255,255,255,${(.16 * al).toFixed(3)})`); w.addColorStop(1, 'rgba(255,255,255,0)'); g.rotate(Math.PI + .02); g.fillStyle = w; g.fillRect(0, -2, L * .8, 4);
  g.restore();
}
/* médaillon d'une relique */
function relicMed(g, x, y, s, rl, al) {
  if (al <= 0 || s <= 0) return; g.save(); g.globalAlpha = Math.min(1, al);
  const gl = g.createRadialGradient(x, y, s * .6, x, y, s * 2.3); gl.addColorStop(0, `rgba(${rl.c},.5)`); gl.addColorStop(1, `rgba(${rl.c},0)`); g.globalCompositeOperation = 'lighter'; g.fillStyle = gl; g.fillRect(x - s * 2.4, y - s * 2.4, s * 4.8, s * 4.8);
  g.globalCompositeOperation = 'source-over';
  /* anneau métallique */
  let rim; try { rim = g.createConicGradient(performance.now() / 1600, x, y); [0, .18, .35, .5, .68, .85, 1].forEach((p, i) => rim.addColorStop(p, ['#ffffff', `rgb(${rl.c})`, '#3a3350', '#ffffff', `rgb(${rl.c})`, '#2a2440', '#ffffff'][i])); } catch (e) { rim = `rgb(${rl.c})`; }
  g.fillStyle = rim; g.beginPath(); g.arc(x, y, s, 0, 6.2832); g.fill();
  const inn = g.createRadialGradient(x - s * .2, y - s * .25, 0, x, y, s * .84); inn.addColorStop(0, `rgba(${rl.c},.55)`); inn.addColorStop(.55, 'rgba(18,12,40,.95)'); inn.addColorStop(1, 'rgba(6,4,16,1)'); g.fillStyle = inn; g.beginPath(); g.arc(x, y, s * .84, 0, 6.2832); g.fill();
  g.font = `700 ${(s * 1.05).toFixed(0)}px "DejaVu Sans",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = `rgb(${rl.c})`; g.shadowBlur = s * .7; g.fillStyle = '#fff'; g.fillText(rl.g, x, y + s * .06); g.shadowBlur = 0;
  g.fillStyle = `rgba(${rl.c},.85)`; g.fillText(rl.g, x, y + s * .06);
  const sh = g.createLinearGradient(x - s, y - s, x, y); sh.addColorStop(0, 'rgba(255,255,255,.45)'); sh.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sh; g.beginPath(); g.arc(x, y, s * .84, Math.PI * 1.05, Math.PI * 1.7); g.arc(x, y, s * .55, Math.PI * 1.7, Math.PI * 1.05, true); g.fill();
  g.restore();
}
/* ----- fond du style ----- */
let CRX = {spin: 0, last: 0, a: 0};
function drawCrea(P, t) {
  const [cx, cy] = crPos(), dt = CRX.last ? Math.min(60, t - CRX.last) : 16; CRX.last = t;
  const boost = CRX.spin ? Math.max(0, 1 - (t - CRX.spin) / 2400) : 0; if (!boost) CRX.spin = 0;
  CRX.a += dt / 1000 * (.25 + boost * 3.5);
  P.forEach((p, i) => { const a = .2 + .5 * Math.abs(Math.sin(t / (1500 + p.k * 1500) + p.p)); f.fillStyle = i % 7 ? `rgba(235,235,255,${a.toFixed(2)})` : `hsla(${(i * 47 + t / 50) % 360},90%,80%,${a.toFixed(2)})`; f.fillRect(p.x, p.y, p.r * .8, p.r * .8); });
  prismBeams(f, cx, cy, 460, t / 1000, .8 + boost);
  const T = t / 1000, ORB = RELICS.map((rl, i) => { const a = CRX.a + i / 6 * 6.2832, z = Math.sin(a); return {rl, x: cx + Math.cos(a) * 150, y: cy + z * 40 + 6, z, i}; });
  ORB.filter(o => o.z < 0).forEach(o => relicMed(f, o.x, o.y, 11 + o.z * 3, o.rl, .55 + o.z * .25));
  f.save(); f.strokeStyle = 'rgba(255,255,255,.08)'; f.lineWidth = 1; f.beginPath(); f.ellipse(cx, cy + 6, 150, 40, 0, 0, 6.2832); f.stroke(); f.restore();
  drawGem(f, cx, cy + Math.sin(T * 1.1) * 4, 46 * (1 + boost * .12), T);
  ORB.filter(o => o.z >= 0).forEach(o => relicMed(f, o.x, o.y, 11 + o.z * 3, o.rl, .75 + o.z * .25));
}

/* ===================================================================
   La cinématique (≈ 65 s) — l'admin réécrit la réalité
   =================================================================== */
/* ===================================================================
   Les six légendes : une mini-scène soignée pour chacune (≈ 4,6 s)
   =================================================================== */
function relicState(lite) {
  const n = k => lite ? k >> 1 : k, R = Math.random;
  return {
    stars: Array.from({length: 220}, () => ({x: R() * 800, y: R() * 480, r: R() * 1.3 + .3, p: R() * 6.28})),
    ej: Array.from({length: n(520)}, () => { const a = R() * 6.283; return {a, v: .4 + Math.pow(R(), .6) * 4.2, s: R() * 1.8 + .6}; }),
    inw: Array.from({length: n(160)}, () => ({a: R() * 6.283, d: 160 + R() * 360, v: .6 + R() * .8})),
    disk: Array.from({length: n(900)}, () => ({a: R() * 6.283, o: 1.45 + Math.pow(R(), 1.4) * 2.9, w: .7 + R() * .3})),
    spir: Array.from({length: n(260)}, () => ({a: R() * 6.283, r: 120 + R() * 380, s: R() * 1.4 + .4})),
    hyp: Array.from({length: n(260)}, () => ({x: (R() - .5) * 2, y: (R() - .5) * 2, z: R(), h: R() * 360})),
    orb: Array.from({length: 14}, (_, i) => ({o: i / 14, s: 1 + R() * 2})),
    ink: Array.from({length: n(70)}, () => ({a: R() * 6.283, v: .25 + R() * 1.1, w: R() * 6.283})),
    drops: Array.from({length: 18}, () => ({a: R() * 6.283, d: 30 + R() * 90, r: 1.5 + R() * 4})),
    burst: Array.from({length: n(420)}, () => ({a: R() * 6.283, v: .3 + Math.pow(R(), .7) * 3, c: R(), arm: R() < .5 ? 0 : Math.PI, f: Math.pow(R(), .7), th0: R() * 6.283})),
    ensoDone: 0
  };
}
function crRelic(g, id, e, ap, t, S, RD) {
  const X = 400, Y = 190, cl = (a, b, x) => Math.max(0, Math.min(1, (x - a) / (b - a))), eo = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3), eIn = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * x;
  const stars = (al, tint = '235,235,255') => S.stars.forEach(s => { g.fillStyle = `rgba(${tint},${(al * (.25 + .45 * Math.abs(Math.sin(t * 1.3 + s.p)))).toFixed(2)})`; g.fillRect(s.x, s.y, s.r, s.r); });
  const bg = (c0, tint, ta) => { g.globalCompositeOperation = 'source-over'; g.fillStyle = c0; g.fillRect(0, 0, 800, 480); const r = g.createRadialGradient(X, Y, 0, X, Y, 520); r.addColorStop(0, `rgba(${tint},${ta})`); r.addColorStop(1, `rgba(${tint},0)`); g.fillStyle = r; g.fillRect(0, 0, 800, 480); };
  const cam = 1 + e / RD * .08;   // lent travelling avant
  g.save(); g.globalAlpha = ap;
  /* ---------------- ✸ SUPERNOVA : géante rouge → effondrement → explosion ---------------- */
  if (id === 'nova') {
    bg('#05020a', '255,80,40', .1); stars(.7);
    const B = [.15, .55, .88, 1.12], beat = B.reduce((m, b) => e >= b ? Math.max(m, Math.exp(-(e - b) * 9)) : m, 0);
    if (e < 1.3) { const sh = e > 1 ? (e - 1) * 10 : 0; redGiant(g, X + (Math.random() - .5) * sh, Y + (Math.random() - .5) * sh, (64 + beat * 7) * cam, t, beat); }
    else if (e < 1.5) { const q = (e - 1.3) / .2, R = Math.max(2, 70 * (1 - eIn(q))); redGiant(g, X, Y, R, t, 1 - q); g.globalCompositeOperation = 'lighter'; S.inw.forEach(p => { const d = p.d * (1 - eIn(Math.min(1, q * p.v * 1.3))); if (d < 3) return; g.strokeStyle = 'rgba(255,190,140,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(X + Math.cos(p.a) * d, Y + Math.sin(p.a) * d); g.lineTo(X + Math.cos(p.a) * (d + 40), Y + Math.sin(p.a) * (d + 40)); g.stroke(); }); }
    else {
      const E = e - 1.5; g.globalCompositeOperation = 'lighter';
      g.save(); g.translate(X, Y); g.rotate(E * .04); const sc = (.25 + eo(Math.min(1, E / 2.4)) * .5) * cam; g.scale(sc, sc); g.globalAlpha = ap * Math.min(1, E / 1.2); g.drawImage(nebula(), -260, -260); g.restore(); g.globalAlpha = ap;
      S.ej.forEach(p => { const d = E * p.v * 120 * (1 - E * .06), x = X + Math.cos(p.a) * d, y = Y + Math.sin(p.a) * d * .85, sp = p.v * (1 - E * .2), col = sp > 2.6 ? '200,225,255' : sp > 1.4 ? '255,230,170' : sp > .7 ? '255,150,80' : '230,70,110', al = Math.max(0, 1 - E / 3.2); g.strokeStyle = `rgba(${col},${al.toFixed(2)})`; g.lineWidth = p.s; g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(p.a) * sp * 7, y - Math.sin(p.a) * sp * 6); g.stroke(); });
      [0, .1, .28].forEach((o, i) => { const q = (E - o) / 2.2; if (q > 0 && q < 1) { const r = 10 + eo(q) * 560; g.strokeStyle = i === 1 ? `rgba(255,200,140,${(1 - q) * .8})` : `rgba(200,220,255,${(1 - q) * .7})`; g.lineWidth = 9 * (1 - q) + 1; g.beginPath(); g.ellipse(X, Y, r, r * .8, 0, 0, 6.2832); g.stroke(); } });
      const fl = Math.max(0, 1 - E * 2.2); if (fl > 0) { const fg = g.createRadialGradient(X, Y, 0, X, Y, 500); fg.addColorStop(0, `rgba(255,255,255,${fl})`); fg.addColorStop(.4, `rgba(255,220,170,${fl * .6})`); fg.addColorStop(1, 'rgba(255,150,80,0)'); g.fillStyle = fg; g.fillRect(0, 0, 800, 480); }
      const pr = 7 + Math.sin(E * 40) * 1.5, pg = g.createRadialGradient(X, Y, 0, X, Y, pr * 6); pg.addColorStop(0, '#fff'); pg.addColorStop(.3, 'rgba(190,225,255,.8)'); pg.addColorStop(1, 'rgba(120,170,255,0)'); g.fillStyle = pg; g.fillRect(X - pr * 6, Y - pr * 6, pr * 12, pr * 12);
      if (E > .7) { const ba = Math.min(1, (E - .7) / .6); g.save(); g.translate(X, Y); g.rotate(E * 2.6); [0, Math.PI].forEach(o => { g.save(); g.rotate(o); const b2 = g.createLinearGradient(0, 0, 360, 0); b2.addColorStop(0, `rgba(210,235,255,${(.75 * ba).toFixed(2)})`); b2.addColorStop(1, 'rgba(120,160,255,0)'); g.fillStyle = b2; g.beginPath(); g.moveTo(0, 0); g.lineTo(360, -11); g.lineTo(360, 11); g.fill(); g.restore(); }); g.restore(); }
    }
  }
  /* ---------------- ✦ SINGULARITÉ : disque d'accrétion, anneau de lumière déviée ---------------- */
  if (id === 'x0') {
    bg('#020104', '150,70,220', .12);
    const R = 50 * cam, tilt = .2, dop = a => 1 + .65 * Math.cos(a);   // effet Doppler : un côté plus brillant
    g.globalCompositeOperation = 'lighter';
    S.spir.forEach(p => { p.r -= .5 + 120 / Math.max(30, p.r); p.a += 1.6 / Math.max(40, p.r); if (p.r < R * 1.3) { p.r = 300 + Math.random() * 200; p.a = Math.random() * 6.283; } const x = X + Math.cos(p.a) * p.r, y = Y + Math.sin(p.a) * p.r * .75, l = Math.min(18, 600 / p.r); g.strokeStyle = `rgba(220,215,255,${Math.min(.7, 60 / p.r).toFixed(2)})`; g.lineWidth = p.s; g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.sin(p.a) * l, y + Math.cos(p.a) * l * .75); g.stroke(); });
    const glow = g.createRadialGradient(X, Y, R, X, Y, R * 5.5); glow.addColorStop(0, 'rgba(255,190,110,.45)'); glow.addColorStop(.35, 'rgba(160,70,220,.15)'); glow.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = glow; g.fillRect(X - R * 6, Y - R * 6, R * 12, R * 12);
    const pts = front => S.disk.forEach(p => { p.a += .022 * Math.pow(1.45 / p.o, 1.5) * p.w; const s = Math.sin(p.a); if ((s >= 0) !== front) return; const heat = Math.max(0, 1 - (p.o - 1.45) / 2.9), b = dop(p.a) * (.35 + heat * .65); g.fillStyle = `rgba(255,${(150 + heat * 100) | 0},${(90 + heat * 150) | 0},${Math.min(1, .3 * b).toFixed(2)})`; const sz = .7 + heat * 1.1; g.fillRect(X + Math.cos(p.a) * p.o * R, Y + s * p.o * R * tilt, sz, sz); });
    const band = front => { for (let k = 0; k < 16; k++) { const o = 1.42 + k * .19, heat = 1 - k / 16, al = .05 + heat * .1, lg = g.createLinearGradient(X - o * R, 0, X + o * R, 0); lg.addColorStop(0, `rgba(255,245,220,${Math.min(1, al * 1.9).toFixed(3)})`); lg.addColorStop(.5, `rgba(255,${(150 + heat * 70) | 0},90,${al.toFixed(3)})`); lg.addColorStop(1, `rgba(255,110,60,${(al * .45).toFixed(3)})`); g.strokeStyle = lg; g.lineWidth = R * .32; g.beginPath(); g.ellipse(X, Y, o * R, o * R * tilt, 0, front ? 0 : Math.PI, front ? Math.PI : Math.PI * 2); g.stroke(); } };
    band(false); pts(false);
    /* l'image du disque déviée par la gravité : un anneau au-dessus (et un plus fin dessous) */
    for (let k = 0; k < 12; k++) { const rr = R * (1.12 + k * .045), al = .09 * (1 - k / 12), lg = g.createLinearGradient(X - rr, 0, X + rr, 0); lg.addColorStop(0, `rgba(255,245,220,${(al * 1.8).toFixed(3)})`); lg.addColorStop(.5, `rgba(255,200,120,${al.toFixed(3)})`); lg.addColorStop(1, `rgba(255,140,80,${(al * .6).toFixed(3)})`); g.strokeStyle = lg; g.lineWidth = 4; g.beginPath(); g.ellipse(X, Y - R * .02, rr * 1.06, rr, 0, Math.PI, Math.PI * 2); g.stroke(); g.lineWidth = 1.6; g.beginPath(); g.ellipse(X, Y + R * .02, rr * 1.02, rr * .96, 0, 0, Math.PI); g.stroke(); }
    g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.beginPath(); g.arc(X, Y, R, 0, 6.2832); g.fill();
    g.globalCompositeOperation = 'lighter'; g.save(); g.shadowColor = '#ffc27a'; g.shadowBlur = 16; g.strokeStyle = 'rgba(255,240,215,.95)'; g.lineWidth = 2; g.beginPath(); g.arc(X, Y, R * 1.05, 0, 6.2832); g.stroke(); g.restore();
    band(true);
    pts(true);
  }
  /* ---------------- ∞ INFINI : la comète trace l'infini dans l'hyperespace ---------------- */
  if (id === 'inf') {
    bg('#04020c', '140,80,255', .14);
    g.globalCompositeOperation = 'lighter';
    S.hyp.forEach(s => { const z0 = s.z; s.z -= .012; if (s.z <= .02) { s.z = 1; s.x = (Math.random() - .5) * 2; s.y = (Math.random() - .5) * 2; return; } const x1 = X + s.x / s.z * 200, y1 = Y + s.y / s.z * 200, x0 = X + s.x / z0 * 200, y0 = Y + s.y / z0 * 200; g.strokeStyle = `hsla(${(s.h + t * 60) % 360},100%,70%,${(1 - s.z) * .7})`; g.lineWidth = (1 - s.z) * 2.2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); });
    const Sz = (196 + Math.sin(e * 3) * 6) * cam, prog = eo(Math.min(1, e / 1.7)), N = 220, upto = Math.floor(prog * N);
    g.lineCap = 'round';
    for (let k = 0; k < upto; k++) { const a1 = k / N * 6.2832 - 1.5708, a2 = (k + 1) / N * 6.2832 - 1.5708, [x1, y1] = LEM(a1, Sz), [x2, y2] = LEM(a2, Sz), h = (k / N * 360 + t * 90) % 360, fresh = prog < 1 ? Math.max(0, 1 - (upto - k) / 60) : 0; g.strokeStyle = `hsla(${h},100%,${60 + fresh * 30}%,.22)`; g.lineWidth = 16; g.beginPath(); g.moveTo(X + x1, Y + y1); g.lineTo(X + x2, Y + y2); g.stroke(); g.strokeStyle = `hsla(${h},100%,${66 + fresh * 30}%,.95)`; g.lineWidth = 4 + fresh * 3; g.beginPath(); g.moveTo(X + x1, Y + y1); g.lineTo(X + x2, Y + y2); g.stroke(); }
    if (prog >= 1) { const pul = .5 + .5 * Math.sin(e * 5); for (let k = 0; k < N; k += 2) { const [x1, y1] = LEM(k / N * 6.2832, Sz * 1.12), [x2, y2] = LEM((k + 2) / N * 6.2832, Sz * 1.12); g.strokeStyle = `hsla(${(k / N * 360 + t * 90 + 180) % 360},100%,70%,${(.12 + pul * .1).toFixed(2)})`; g.lineWidth = 2; g.beginPath(); g.moveTo(X + x1, Y + y1); g.lineTo(X + x2, Y + y2); g.stroke(); } S.orb.forEach(o => { const [ox, oy] = LEM((o.o + e * .35) * 6.2832, Sz); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(X + ox, Y + oy, o.s, 0, 6.2832); g.fill(); }); }
    const ha = prog < 1 ? prog * 6.2832 - 1.5708 : e * 2.4, [hx, hy] = LEM(ha, Sz), hg = g.createRadialGradient(X + hx, Y + hy, 0, X + hx, Y + hy, 34); hg.addColorStop(0, '#fff'); hg.addColorStop(.3, `hsla(${(t * 120) % 360},100%,80%,.8)`); hg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hg; g.fillRect(X + hx - 34, Y + hy - 34, 68, 68);
    const cg = g.createRadialGradient(X, Y, 0, X, Y, 40); cg.addColorStop(0, `rgba(255,255,255,${(.5 + .3 * Math.sin(e * 6)).toFixed(2)})`); cg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = cg; g.fillRect(X - 40, Y - 40, 80, 80);
  }
  /* ---------------- ∅ NÉANT : goutte d'encre, cercle au pinceau, sceau rouge ---------------- */
  if (id === 'void') {
    g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, 800, 480); const vg = g.createRadialGradient(X, Y, 120, X, Y, 520); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(60,50,30,.18)'); g.fillStyle = vg; g.fillRect(0, 0, 800, 480);
    if (e > .1 && e < .55) { const q = (e - .1) / .45, y = -20 + q * q * (Y + 20); g.fillStyle = '#141418'; g.beginPath(); g.ellipse(X, y, 5, 8, 0, 0, 6.2832); g.fill(); }
    if (e >= .55) {
      const E = e - .55, bl = Math.min(1, E / .8), br = 10 + Math.sqrt(E) * 26;
      const ig = g.createRadialGradient(X, Y, 0, X, Y, br * 2.2); ig.addColorStop(0, `rgba(20,20,24,${(.25 * (1 - cl(1.6, 3.2, E))).toFixed(2)})`); ig.addColorStop(1, 'rgba(20,20,24,0)'); g.fillStyle = ig; g.beginPath(); g.arc(X, Y, br * 2.2, 0, 6.2832); g.fill();
      S.drops.forEach(d => { const k = eo(Math.min(1, E / .35)); g.fillStyle = `rgba(20,20,24,${(.8 * (1 - cl(1.4, 3, E))).toFixed(2)})`; g.beginPath(); g.arc(X + Math.cos(d.a) * d.d * k, Y + Math.sin(d.a) * d.d * k * .9, d.r * (1 - cl(1.4, 3, E) * .6), 0, 6.2832); g.fill(); });
      S.ink.forEach(p => { const L = Math.min(1, E / 1.6) * 90 * p.v; g.strokeStyle = `rgba(20,20,24,${(.12 * (1 - cl(1.6, 3.2, E))).toFixed(2)})`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X, Y); for (let s = 1; s <= 8; s++) { const r = L * s / 8, a = p.a + Math.sin(p.w + s * .7) * .25; g.lineTo(X + Math.cos(a) * r, Y + Math.sin(a) * r * .9); } g.stroke(); });
      /* l'ensō au pinceau sec */
      const q = eo(cl(.5, 2.4, E)), P = new Path2D(ENSO(112)); g.save(); g.translate(X, Y); g.lineCap = 'round';
      g.setLineDash([720 * q, 3000]); g.strokeStyle = '#141418'; g.lineWidth = 15; g.stroke(P);
      for (let k = 0; k < 5; k++) { g.save(); g.translate(Math.sin(k * 2.1) * 3, Math.cos(k * 1.7) * 3); g.setLineDash([720 * q * (.86 + k * .03), 3000]); g.strokeStyle = `rgba(20,20,24,${(.25 + k * .05).toFixed(2)})`; g.lineWidth = 2 + k * .6; g.stroke(P); g.restore(); }
      g.setLineDash([]); g.restore();
      /* sceau rouge */
      if (E > 2.5) { const k = eo(Math.min(1, (E - 2.5) / .25)), s = 1 + (1 - k) * .6; g.save(); g.translate(X + 150, Y + 92); g.rotate(-.06); g.scale(s, s); g.globalAlpha = ap * k; g.fillStyle = '#c4362c'; g.fillRect(-19, -19, 38, 38); g.fillStyle = '#f4f1ea'; g.font = '700 24px "Shippori Mincho B1",serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('∅', 0, 2); g.strokeStyle = '#f4f1ea'; g.lineWidth = 1.5; g.strokeRect(-15, -15, 30, 30); g.restore(); }
    }
  }
  /* ---------------- ◈ TESSERACT : la pièce-cube, le cube qui s'ouvre en 4D ---------------- */
  if (id === 'tes') {
    bg('#05041a', '120,90,255', .14);
    const vx = 400, vy = 196, bw = 150, bh = 90; g.lineWidth = 1;
    g.strokeStyle = 'rgba(140,160,255,.14)'; g.beginPath(); [[0, 0], [800, 0], [800, 480], [0, 480]].forEach((p, i) => { const q = [[vx - bw, vy - bh], [vx + bw, vy - bh], [vx + bw, vy + bh], [vx - bw, vy + bh]][i]; g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }); g.stroke();
    for (let k = 0; k < 7; k++) { const z = ((k + (t * .5) % 1) / 7), ez = Math.pow(z, 2.2); g.strokeStyle = `rgba(150,140,255,${(.04 + .12 * (1 - z)).toFixed(3)})`; g.strokeRect(vx - bw - (400 - bw) * ez, vy - bh - (vy - bh) * ez, (bw + (400 - bw) * ez) * 2, (bh + (vy - bh) * ez) + (bh + (480 - vy - bh) * ez)); }
    const open = eo(cl(.3, 1.5, e)), V = TV4.map(([x, y, z, w]) => [x, y, z, w * open - (1 - open)]), ang = e * .9;
    for (let k = 3; k >= 0; k--) { const a2 = ang - k * .05, A = {xw: a2, yw: a2 * .6 * open, zw: a2 * .35 * open, xz: .55 + e * .08, yz: -.38}; tesEdges(g, tes4(A, X, Y, 470 * cam, 3, 2.2, V), k ? .12 : 1, k ? 1.2 : 2.2, !k); }
  }
  /* ---------------- ✺ GENÈSE : un point, un Big Bang, une galaxie qui se forme ---------------- */
  if (id === 'gen') {
    bg('#020108', '120,90,255', .1);
    if (e < .35) { const q = e / .35, pr = 3 + q * 10, pg = g.createRadialGradient(X, Y, 0, X, Y, pr * 6); pg.addColorStop(0, '#fff'); pg.addColorStop(.3, 'rgba(255,240,220,.7)'); pg.addColorStop(1, 'rgba(255,220,200,0)'); g.globalCompositeOperation = 'lighter'; g.fillStyle = pg; g.fillRect(X - pr * 6, Y - pr * 6, pr * 12, pr * 12); }
    else {
      const E = e - .35; stars(Math.min(1, E / 1.2));
      const fl = Math.max(0, 1 - E * 1.6); if (fl > 0) { const fg = g.createRadialGradient(X, Y, 0, X, Y, 60 + E * 500); fg.addColorStop(0, `rgba(255,255,255,${fl})`); fg.addColorStop(.35, `rgba(255,230,170,${fl * .7})`); fg.addColorStop(1, 'rgba(255,170,90,0)'); g.globalCompositeOperation = 'lighter'; g.fillStyle = fg; g.fillRect(0, 0, 800, 480); }
      const form = eo(cl(.5, 3, E)), rot = -t * .06 - (1 - form) * 3, tilt = 1 - eo(cl(1.2, 3.4, E)) * .58, sc = (.22 + form * .42) * cam;
      drawGalaxy(g, X, Y, sc, rot, tilt, form, -.28 * eo(cl(1.2, 3.4, E)));
      g.globalCompositeOperation = 'lighter';
      S.burst.forEach(p => { const k = eo(cl(.4, 2.6, E)), out = (1 - k) * Math.min(1, E * 1.5), r0 = E * p.v * 140, r1 = (14 + p.f * 292) * sc, r = r0 * out + r1 * k, th = (p.arm + Math.log(Math.max(14, 14 + p.f * 292) / 14) * 3.1 / 2.2) * k + p.a * (1 - k) + rot * k, x = X + Math.cos(th) * r, y = Y + Math.sin(th) * r * (k ? tilt * k + (1 - k) : 1), al = .8 * (1 - cl(2.4, 3.4, E)); if (al <= 0) return; g.fillStyle = p.c < .5 ? `rgba(210,220,255,${al.toFixed(2)})` : `rgba(255,232,190,${al.toFixed(2)})`; g.fillRect(x, y, 1.4, 1.4); });
    }
  }
  g.restore();
}
let creaOn = false;
function creaCinematic(apply) {
  if (creaOn) return false; creaOn = true;
  const el = document.createElement('div'); el.id = 'crc';
  el.innerHTML = `<canvas width="800" height="480"></canvas><div class="cr-term"></div><div class="cr-cap"></div><div class="cr-relic"></div><div class="cr-white"></div>
    <div class="cr-crown">♛</div><div class="cr-title">${[...'CRÉATEUR'].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</div>
    <div class="cr-sub"><em>Le seul style qu'aucun roll ne peut donner.</em><b>RÉSERVÉ À L'ADMIN · MODE CRÉATEUR ACTIVÉ</b></div><div class="cr-skip">touche 2 fois pour passer</div>`;
  stage.appendChild(el); if (typeof cinFX === 'function') cinFX(el);
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), tm = [], at = (s, fn) => tm.push(setTimeout(fn, s * 1000)), T0 = performance.now(), lite = !!cfg.lite;
  const music = !PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on ? (AMB.unlock(), AMB.crea()) : null;
  const $$ = s => el.querySelector(s), cap = (s, d = 2.6) => { const c = $$('.cr-cap'); c.classList.remove('on'); setTimeout(() => { c.innerHTML = s; c.classList.add('on'); }, 220); if (d) tm.push(setTimeout(() => c.classList.remove('on'), (d + .22) * 1000)); };
  /* I. accès administrateur */
  const TERM = $$('.cr-term'), line = (s, cls = '') => TERM.insertAdjacentHTML('beforeend', `<div class="${cls}">${s}</div>`);
  at(.2, () => { TERM.classList.add('on'); line('<i>admin@meteo</i>:~$ sudo reality --mode=createur'); });
  at(1.5, () => line('[sudo] mot de passe : ••••••••••'));
  at(2.6, () => line('✔ identité confirmée : <b>ADMIN</b>', 'ok'));
  at(3.3, () => line('› ouverture du code source de la réalité…', 'w'));
  at(4.1, () => stage.classList.add('cr-gl'));
  at(5.6, () => { stage.classList.remove('cr-gl'); stage.classList.add('cr-hide'); TERM.classList.add('gone'); });
  /* II. le code source */
  at(6.6, () => cap('Tout ce que tu vois est écrit quelque part.', 2.8));
  at(10, () => cap('… et c\'est toi qui l\'as écrit.', 2.6));
  /* III. les six reliques, chacune avec son impact */
  const R0 = 14, RD = 4.6, RB = $$('.cr-relic'), RS = relicState(lite);
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'], RDEL = {nova: 1.55, x0: .5, inf: 1.2, void: 2.9, tes: 1.3, gen: 1.6};
  RELICS.forEach((rl, i) => at(R0 + i * RD, () => {
    const IMPD = {nova: 1.5, void: .55, gen: .35}; setTimeout(() => { if (el.isConnected && typeof impactFrames === 'function') impactFrames({host: el, x: 400, y: 190, theme: rl.id, seq: ['a', 'b', 'c', 'b'], dt: 55, snd: false, lines: 70}); }, (IMPD[rl.id] || 0) * 1000);
    RB.className = 'cr-relic'; void RB.offsetWidth;
    RB.innerHTML = `<i>LÉGENDE ${ROMAN[i]} / VI</i><b>${[...(rl.g + ' ' + rl.n)].map((c, k) => `<span style="--k:${k}">${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</b><em>${rl.r}</em>`;
    RB.style.setProperty('--rc', `rgb(${rl.c})`); RB.style.setProperty('--d', RDEL[rl.id] + 's'); RB.classList.add('on', 'r-' + rl.id);
  }));
  at(R0 + 6 * RD - .4, () => RB.classList.remove('on'));
  /* IV. fusion */
  at(42.6, () => cap('Six légendes.', 2.2));
  at(45.4, () => cap('Un seul créateur.', 2.6));
  /* V. le cristal */
  const XC = 51.2;
  at(XC, () => { el.classList.add('boom'); if (typeof impactFrames === 'function') impactFrames({host: el, x: 400, y: 200, theme: 'crea', seq: ['a', 'b', 'a', 'c', 'b', 'a', 'c'], lines: 90, snd: false, r0: 10, r: 22}); });
  /* VI. titre */
  at(58.2, () => el.classList.add('title'));
  const AP = 67;
  at(AP - .9, () => el.classList.add('out'));
  at(AP, () => { if (apply && typeof apply === 'function') apply(); stage.classList.remove('cr-hide'); stage.classList.add('cr-in'); });
  const fin = () => { tm.forEach(clearTimeout); el.remove(); creaOn = false; stage.classList.remove('cr-hide', 'cr-in', 'cr-gl'); CRX.spin = performance.now(); };
  at(AP + 2.6, fin);
  let last = 0;
  el.addEventListener('pointerdown', e => { e.stopPropagation(); const n = Date.now(); $$('.cr-skip').classList.add('on'); if (n - last < 450) { if (music) music.stop(); tm.forEach(clearTimeout); if (apply && typeof apply === 'function') apply(); stage.classList.remove('cr-hide', 'cr-gl'); el.classList.add('out', 'skip'); setTimeout(fin, 900); } last = n; });

  /* ----- canevas ----- */
  const cl = (a, b, x) => Math.max(0, Math.min(1, (x - a) / (b - a))), ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, eo = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3);
  /* le vrai code de cette page, découpé en lignes */
  let SRC = []; try { const s = [...document.scripts].map(x => x.textContent).join('\n'), st = Math.floor(Math.random() * Math.max(1, s.length - 20000)); SRC = s.slice(st, st + 20000).split('\n').map(l => l.trim()).filter(l => l.length > 3).map(l => l.slice(0, 90)); } catch (e) {}
  if (SRC.length < 40) SRC = Array.from({length: 120}, (_, i) => `const ciel${i} = meteo.render({temp: ${i}, vent: ${i * 3}});`);
  const KW = /\b(const|let|function|return|if|else|for|new|true|false|null|await)\b/g;
  const BG = Array.from({length: 200}, () => ({x: Math.random() * 800, y: Math.random() * 480, r: Math.random() * 1.3 + .3, p: Math.random() * 6.28}));
  const SPK = Array.from({length: lite ? 70 : 160}, () => ({a: Math.random() * 6.283, d: 20 + Math.random() * 260, v: .3 + Math.random(), h: Math.random() * 360}));
  const stars = (al, t) => BG.forEach(s => { g.fillStyle = `rgba(235,235,255,${(al * (.3 + .4 * Math.abs(Math.sin(t * 1.3 + s.p)))).toFixed(2)})`; g.fillRect(s.x, s.y, s.r, s.r); });
  let trail = false;
  (function frame(now) {
    if (!el.isConnected) return; requestAnimationFrame(frame); const t = (now - T0) / 1000;
    try {
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      const inFus = t > R0 + 6 * RD + .2 && t < XC;
      if (inFus) { g.fillStyle = 'rgba(3,2,10,.38)'; g.fillRect(0, 0, 800, 480); } else g.clearRect(0, 0, 800, 480);
      /* II. pluie de code (4 → 14) */
      if (t > 4 && t < 14.2) {
        const a = cl(4, 6, t), out = cl(12.6, 14.2, t);
        g.fillStyle = `rgba(4,3,12,${(a * (t > 5.6 ? 1 : .75)).toFixed(2)})`; g.fillRect(0, 0, 800, 480);
        g.font = '11px "JetBrains Mono","DejaVu Sans Mono",monospace'; g.textBaseline = 'top';
        const sp = 18 + Math.pow(cl(6, 13, t), 2) * 220, off = (t - 4) * sp;
        for (let c = 0; c < 2; c++) for (let k = 0; k < 34; k++) {
          const yy = k * 15 - (off % 15), idx = (Math.floor(off / 15) + k + c * 57) % SRC.length, txt = SRC[idx], x0 = 18 + c * 396;
          const fade = Math.min(1, yy / 60, (480 - yy) / 60) * a * (1 - out); if (fade <= 0) continue;
          const conv = cl(12.4, 14.2, t), cx2 = x0 + (400 - x0) * conv * conv, cy2 = yy + (220 - yy) * conv * conv;
          const hot = (idx * 7) % 23 === 0; g.fillStyle = hot ? `rgba(255,217,138,${fade.toFixed(2)})` : `rgba(${KW.test(txt) ? '255,140,230' : '190,220,255'},${(fade * .75).toFixed(2)})`; KW.lastIndex = 0;
          g.fillText(txt.slice(0, 54), cx2, cy2);
        }
        if (t > 12.4) { const q = cl(12.4, 14.2, t), pg = g.createRadialGradient(400, 220, 0, 400, 220, 40 + q * 120); pg.addColorStop(0, `rgba(255,255,255,${q.toFixed(2)})`); pg.addColorStop(1, 'rgba(255,255,255,0)'); g.globalCompositeOperation = 'lighter'; g.fillStyle = pg; g.fillRect(0, 0, 800, 480); g.globalCompositeOperation = 'source-over'; }
      }
      /* III. les six légendes (14 → 41,6) */
      if (t >= R0 && t < R0 + 6 * RD + .1) {
        const i = Math.min(5, Math.floor((t - R0) / RD)), e = t - R0 - i * RD, ap = cl(0, .2, e) * (i === 5 ? 1 : 1 - cl(RD - .18, RD, e));
        crRelic(g, RELICS[i].id, e, ap, t, RS, RD);
      }
      /* IV. fusion (36 → 45,6) : les six médaillons tournent et convergent */
      if (inFus) {
        const q = cl(R0 + 6 * RD + .2, XC - .2, t), R = 250 * (1 - Math.pow(q, 1.6)), w = t * (.8 + Math.pow(q, 2) * 9), pts = RELICS.map((rl, i) => { const a = w + i / 6 * 6.2832; return [400 + Math.cos(a) * R, 205 + Math.sin(a) * R * .55, rl]; });
        g.globalCompositeOperation = 'lighter';
        g.strokeStyle = `rgba(255,255,255,${(.1 + q * .3).toFixed(2)})`; g.lineWidth = 1; g.beginPath(); [0, 2, 4, 0].forEach((k, j) => j ? g.lineTo(pts[k][0], pts[k][1]) : g.moveTo(pts[k][0], pts[k][1])); g.moveTo(pts[1][0], pts[1][1]); [3, 5, 1].forEach(k => g.lineTo(pts[k][0], pts[k][1])); g.stroke();   // hexagramme
        const cg = g.createRadialGradient(400, 205, 0, 400, 205, 30 + q * 90); cg.addColorStop(0, `rgba(255,255,255,${(.2 + q * .7).toFixed(2)})`); cg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = cg; g.fillRect(0, 0, 800, 480);
        g.globalCompositeOperation = 'source-over';
        pts.forEach(([x, y, rl]) => relicMed(g, x, y, 15 * (1 - q * .6), rl, 1));
      }
      /* V–VI. le cristal (45,6 → fin) */
      if (t >= XC) {
        const e = t - XC, out = cl(AP - .9, AP + .5, t), a = cl(.3, 1.6, e) * (1 - out);
        g.fillStyle = `rgba(3,2,10,${(1 - out).toFixed(2)})`; g.fillRect(0, 0, 800, 480); stars(a, t);
        prismBeams(g, 400, 168, 700, t, a * (1 + Math.max(0, 1 - e) * 3));
        g.globalCompositeOperation = 'lighter'; SPK.forEach(p => { const d = p.d + e * 30 * p.v, x = 400 + Math.cos(p.a + e * .1) * d, y = 168 + Math.sin(p.a + e * .1) * d * .6, tw = Math.abs(Math.sin(t * 3 + p.h)); g.fillStyle = `hsla(${(p.h + t * 40) % 360},100%,80%,${(a * tw * .8).toFixed(2)})`; g.fillRect(x, y, 1.6, 1.6); }); g.globalCompositeOperation = 'source-over';
        const sc = eo(cl(0, 2.2, e)), shrink = 1 - ease(cl(6.4, 7.6, e)) * .35, R = 92 * sc * shrink, cy = 168;
        const ORB = RELICS.map((rl, i) => { const an = t * .5 + i / 6 * 6.2832, z = Math.sin(an); return {rl, x: 400 + Math.cos(an) * 175 * sc, y: cy + 10 + z * 44 * sc, z}; });
        ORB.filter(o => o.z < 0).forEach(o => relicMed(g, o.x, o.y, 13 + o.z * 3, o.rl, a * cl(2, 3.4, e) * (.6 + o.z * .25)));
        drawGem(g, 400, cy + Math.sin(t) * 4, R, t, a);
        ORB.filter(o => o.z >= 0).forEach(o => relicMed(g, o.x, o.y, 13 + o.z * 3, o.rl, a * cl(2, 3.4, e)));
        if (t > AP) g.clearRect(0, 0, 800, 480);
      }
    } catch (x) { g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  })(T0);
  return true;
}

/* ----- Le style ----- */
Object.assign(SIG, {
  crea: {name: '♛ Créateur', icons: 'line', temp: 'text', noAstro: true, noClouds: true, amb: 'crea', secret: true,
    deco2: '<div class="cr-badge">♛ STYLE EXCLUSIF · RÉSERVÉ À L\'ADMIN · INTROUVABLE AU ROLL ♛</div>',
    cin: done => creaCinematic(done),
    v: {d: {clear: ['Grand soleil. Tu l\'as commandé, le voilà.'], clearN: ['Nuit claire. Toutes les étoiles sont à leur place.'], partly: ['Quelques nuages, placés avec goût.'], partlyN: ['Quelques nuages devant les étoiles. Validé.'], cloudy: ['Ciel couvert. Même le créateur laisse faire la nature.'], cloudnight: ['Nuit couverte. Repos pour tout le monde.'], fog: ['Brouillard : la réalité se charge encore…'], drizzle: ['Une bruine. Pas grave, ça arrose les idées.'], rain: ['Il pleut. Même le créateur ne contrôle pas tout.'], pour: ['Grosse averse ! Ce n\'est pas toi, promis.'], storm: ['Orage : la nature reprend la main.'], hail: ['Grêle ! Ce n\'était pas dans le cahier des charges.'], snow: ['Il neige. Une mise à jour très réussie.'], blizzard: ['Tempête de neige. Reste au chaud, chef.'], wind: ['Ça souffle fort. Accroche ta couronne.'], heat: ['Grosse chaleur. Hydrate-toi, créateur.'], frost: ['Gel ce matin. Mets un pull.'], rainbow: ['Un arc-en-ciel : la lumière du cristal.']},
      kick: c => `♛ CRÉATEUR · ${UP(c.city)} · ADMIN`, hl: c => `MAX ${c.mx}° · MIN ${c.mn}°`, mt: c => `Ressenti ${c.fe}° · Humidité ${c.hu} % · Vent ${c.wi} km/h`, day: D3, hr: (h, n) => n ? pad2(h) + 'h' : 'NOW'}}
});
const CRQ = ['Tu as créé tout ça.', 'Mode créateur : tous les pouvoirs.', 'Aucun roll ne peut donner ce style.', 'Six reliques. Un seul créateur.', 'La réalité attend tes ordres.'];
stage.addEventListener('pointerdown', e => {
  if (HT.id !== 'crea') return; const s = stage.getBoundingClientRect(), k = s.width / 800, x = (e.clientX - s.left) / k, y = (e.clientY - s.top) / k, [cx, cy] = crPos();
  if (Math.hypot(x - cx, (y - cy) * 1.6) < 170) { CRX.spin = performance.now(); if (typeof toast === 'function') toast(CRQ[Math.random() * CRQ.length | 0]); if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on) AMB.one('chime'); }
});
EGGS.creacin = () => creaCinematic(HT.id === 'crea');
