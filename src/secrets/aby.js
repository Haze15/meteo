
/* ===================================================================
   🌊 ABYSSE — 1 chance sur 2 000 000
   Une descente en bathyscaphe jusqu'au fond de la fosse des Mariannes,
   et ce qui nous y attend.
   =================================================================== */
const abC = (a, b, x) => x <= a ? 0 : x >= b ? 1 : (x - a) / (b - a);
const abE = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3);
const abS = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
const abIO = x => x <= 0 ? 0 : x >= 1 ? 1 : x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const abN = n => Math.round(n).toLocaleString('fr-FR');
const AB_H = [188, 172, 200, 268, 300, 160];

/* ----- une méduse : ombrelle qui pulse, bord lumineux, tentacules ----- */
function abJelly(g, x, y, s, t, hue, al, ph) {
  if (al <= .01 || y < -s * 2.4 || y > 480 + s * 1.2 || x < -s * 1.5 || x > 800 + s * 1.5) return;
  const pl = Math.sin(t * 1.7 + ph), cw = 1 + pl * .09, chh = 1 - pl * .12, bw = s * .5 * cw, bh = s * .44 * chh;
  g.save(); g.translate(x, y); g.globalCompositeOperation = 'lighter';
  const hg = g.createRadialGradient(0, -bh * .4, 0, 0, -bh * .4, s * 1.3); hg.addColorStop(0, `hsla(${hue},100%,60%,${(.16 * al).toFixed(3)})`); hg.addColorStop(1, `hsla(${hue},100%,50%,0)`); g.fillStyle = hg; g.fillRect(-s * 1.3, -bh * .4 - s * 1.3, s * 2.6, s * 2.6);
  g.lineWidth = Math.max(.6, s * .012);
  for (let i = 0; i < 10; i++) { const tx = (i - 4.5) / 4.5 * bw * .92; g.strokeStyle = `hsla(${hue + (i % 3) * 12},100%,72%,${(.3 * al).toFixed(3)})`; g.beginPath(); g.moveTo(tx, -bh * .05); for (let k = 1; k <= 9; k++) { const q = k / 9; g.lineTo(tx * (1 - q * .3) + Math.sin(t * 1.4 + ph + k * .55 + i * 1.3) * s * .14 * q, q * s * 1.5 * (1 + (i % 4) * .12)); } g.stroke(); }
  g.lineWidth = Math.max(1, s * .035);
  for (let i = 0; i < 4; i++) { const tx = (i - 1.5) * bw * .18; g.strokeStyle = `hsla(${hue + 30},100%,78%,${(.2 * al).toFixed(3)})`; g.beginPath(); g.moveTo(tx, -bh * .1); for (let k = 1; k <= 6; k++) { const q = k / 6; g.lineTo(tx + Math.sin(t * 1.1 + ph + k * .8 + i * 2) * s * .1 * q, q * s * .8); } g.stroke(); }
  const bg = g.createRadialGradient(0, -bh * .55, s * .02, 0, -bh * .3, bw * 1.15); bg.addColorStop(0, `hsla(${hue},100%,92%,${(.5 * al).toFixed(3)})`); bg.addColorStop(.45, `hsla(${hue},100%,65%,${(.22 * al).toFixed(3)})`); bg.addColorStop(1, `hsla(${hue},100%,55%,${(.04 * al).toFixed(3)})`);
  g.fillStyle = bg; g.beginPath(); g.moveTo(-bw, 0); g.bezierCurveTo(-bw * 1.02, -bh * 1.32, bw * 1.02, -bh * 1.32, bw, 0); g.quadraticCurveTo(0, -bh * .28, -bw, 0); g.fill();
  g.strokeStyle = `hsla(${hue},100%,85%,${(.16 * al).toFixed(3)})`; g.lineWidth = Math.max(.5, s * .01);
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * bw * .08, -bh * .98); g.quadraticCurveTo(i * bw * .3, -bh * .6, i * bw * .27, -bh * .12); g.stroke(); }
  for (let i = 0; i <= 14; i++) { const q = i / 14, fl = .4 + .6 * Math.max(0, Math.sin(t * 3 + i * .9 + ph)); g.fillStyle = `hsla(${hue + 20},100%,85%,${(.8 * al * fl).toFixed(3)})`; g.beginPath(); g.arc(-bw + q * 2 * bw, -Math.sin(q * Math.PI) * bh * .14, Math.max(.8, s * .018), 0, 6.2832); g.fill(); }
  g.restore();
}
/* ----- petits poissons argentés (le banc) ----- */
function abFish(g, x, y, s, dir) { g.save(); g.translate(x, y); g.scale(dir * s, s); g.beginPath(); g.moveTo(10, 0); g.quadraticCurveTo(2, -4.2, -6, -1); g.lineTo(-11, -4.5); g.lineTo(-9.5, 0); g.lineTo(-11, 4.5); g.lineTo(-6, 1); g.quadraticCurveTo(2, 4.2, 10, 0); g.fill(); g.restore(); }
/* ----- poisson-lanterne : corps sombre, rangée de points bleus ----- */
function abLantern(g, x, y, s, dir, t, al) {
  g.save(); g.translate(x, y); g.scale(dir * s, s);
  g.fillStyle = `rgba(6,14,22,${al})`; g.beginPath(); g.moveTo(14, 0); g.quadraticCurveTo(4, -6, -8, -2); g.lineTo(-15, -6); g.lineTo(-13, 0); g.lineTo(-15, 6); g.lineTo(-8, 2); g.quadraticCurveTo(4, 6, 14, 0); g.fill();
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) { const fl = .5 + .5 * Math.sin(t * 6 + i); g.fillStyle = `rgba(110,190,255,${(al * fl).toFixed(3)})`; g.beginPath(); g.arc(9 - i * 3.2, 2.6 + Math.sin(i) * .4, 1.1, 0, 6.2832); g.fill(); }
  g.fillStyle = `rgba(160,230,255,${(al * .9).toFixed(3)})`; g.beginPath(); g.arc(9, -1, 1.4, 0, 6.2832); g.fill();
  g.restore();
}
/* ----- siphonophore : une longue chaîne de perles lumineuses ----- */
function abSipho(g, x0, y0, t, al, n) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const x = x0 + i * 8, y = y0 + Math.sin(i * .32 - t * 1.6) * 14 + i * 3.2, w = .35 + .65 * Math.max(0, Math.sin(i * .5 - t * 4)), h = i % 3 ? 190 : 300;
    const gr = g.createRadialGradient(x, y, 0, x, y, 7); gr.addColorStop(0, `hsla(${h},100%,85%,${(al * w).toFixed(3)})`); gr.addColorStop(1, `hsla(${h},100%,60%,0)`); g.fillStyle = gr; g.fillRect(x - 7, y - 7, 14, 14); }
  g.restore();
}
/* ----- étincelles de bioluminescence ----- */
function abSpark(L, x, y, n, hue, sp) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.2832, v = sp * (.3 + Math.random()); L.push({x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 0, m: .8 + Math.random() * 1.4, h: hue + (Math.random() - .5) * 30, r: .8 + Math.random() * 1.6}); } }
function abSparkDraw(g, L, dt) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = L.length - 1; i >= 0; i--) { const p = L[i]; p.l += dt; if (p.l > p.m) { L.splice(i, 1); continue; } const k = Math.pow(.15, dt); p.vx *= k; p.vy *= k; p.x += p.vx * dt; p.y += p.vy * dt - 6 * dt; const a = 1 - p.l / p.m;
    g.fillStyle = `hsla(${p.h},100%,75%,${(a * .9).toFixed(3)})`; g.beginPath(); g.arc(p.x, p.y, p.r * (.6 + a * .6), 0, 6.2832); g.fill(); }
  g.restore();
}
/* ----- la baudroie des abysses : sa lanterne, puis son corps éclairé par elle ----- */
function abAngler(g, lx, ly, s, body, mouth, lureA) {
  const k = 200 * s, ox = lx + .62 * k, oy = ly + .62 * k;
  if (body > .01) {
    g.save(); g.translate(ox, oy);
    const up = new Path2D(); up.moveTo(-.58 * k, -.04 * k); up.bezierCurveTo(-.5 * k, -.42 * k, -.05 * k, -.56 * k, .28 * k, -.38 * k); up.bezierCurveTo(.5 * k, -.26 * k, .62 * k, -.12 * k, .7 * k, -.04 * k); up.lineTo(.95 * k, -.26 * k); up.quadraticCurveTo(.9 * k, 0, .95 * k, .24 * k); up.lineTo(.7 * k, .05 * k); up.bezierCurveTo(.5 * k, .3 * k, .1 * k, .36 * k, -.22 * k, .12 * k); up.lineTo(-.26 * k, .04 * k); up.closePath();
    const jaw = new Path2D(); jaw.moveTo(-.24 * k, .02 * k); jaw.lineTo(-.64 * k, .06 * k); jaw.quadraticCurveTo(-.6 * k, .3 * k, -.2 * k, .34 * k); jaw.quadraticCurveTo(-.05 * k, .3 * k, -.1 * k, .1 * k); jaw.closePath();
    const lit = p => { g.fillStyle = `rgba(4,7,12,${body.toFixed(3)})`; g.fill(p); g.save(); g.clip(p); const lg = g.createRadialGradient(lx - ox, ly - oy, 0, lx - ox, ly - oy, 1.15 * k); lg.addColorStop(0, `rgba(150,225,245,${(.8 * body * lureA).toFixed(3)})`); lg.addColorStop(.5, `rgba(50,110,140,${(.32 * body * lureA).toFixed(3)})`); lg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = lg; g.fillRect(-k * 1.2, -k, k * 2.4, k * 2); g.restore(); };
    lit(up); g.strokeStyle = `rgba(130,195,215,${(.3 * body * lureA).toFixed(3)})`; g.lineWidth = 1.2; g.stroke(up);
    g.fillStyle = `rgba(225,236,242,${(.85 * body).toFixed(3)})`;
    for (let i = 0; i < 8; i++) { const q = i / 7, x = -.56 * k + q * .3 * k, y = -.03 * k + q * .05 * k, h = (.08 + (i % 2) * .05) * k * (1 - q * .4); g.beginPath(); g.moveTo(x - .012 * k, y); g.lineTo(x + .012 * k, y); g.lineTo(x + .004 * k, y + h); g.fill(); }
    g.save(); g.translate(-.24 * k, .04 * k); g.rotate(mouth * .5); g.translate(.24 * k, -.04 * k); lit(jaw);
    g.fillStyle = `rgba(225,236,242,${(.85 * body).toFixed(3)})`;
    for (let i = 0; i < 7; i++) { const q = i / 6, x = -.62 * k + q * .34 * k, h = (.07 + (i % 2) * .05) * k * (1 - q * .4); g.beginPath(); g.moveTo(x - .012 * k, .06 * k); g.lineTo(x + .012 * k, .06 * k); g.lineTo(x + .004 * k, .06 * k - h); g.fill(); }
    g.restore();
    g.fillStyle = `rgba(150,205,225,${(.55 * body).toFixed(3)})`; g.beginPath(); g.arc(-.3 * k, -.2 * k, .035 * k, 0, 6.2832); g.fill(); g.fillStyle = `rgba(0,0,0,${body.toFixed(3)})`; g.beginPath(); g.arc(-.3 * k, -.2 * k, .02 * k, 0, 6.2832); g.fill();
    g.restore();
  }
  const bx = ox - .14 * k, by = oy - .5 * k;
  g.strokeStyle = `rgba(120,175,195,${(.4 * Math.max(body, .3) * lureA).toFixed(3)})`; g.lineWidth = Math.max(1, 2 * s); g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx - .12 * k, ly - .2 * k, lx, ly); g.stroke();
  g.save(); g.globalCompositeOperation = 'lighter'; const r = 60 * s + 12, lg = g.createRadialGradient(lx, ly, 0, lx, ly, r); lg.addColorStop(0, `rgba(235,255,255,${(.95 * lureA).toFixed(3)})`); lg.addColorStop(.12, `rgba(140,240,255,${(.6 * lureA).toFixed(3)})`); lg.addColorStop(1, 'rgba(40,140,255,0)'); g.fillStyle = lg; g.fillRect(lx - r, ly - r, r * 2, r * 2); g.restore();
}
/* ----- le léviathan : un corps immense, invisible sauf ses lumières ----- */
function abLev(g, X, Y, S, t, al, rim) {
  const N = 64, L = 1500 * S, C = [];
  for (let i = 0; i <= N; i++) { const u = i / N, x = X + u * L, y = Y + Math.sin(u * 4.2 - t * 1.1) * 46 * S * (.25 + u) + Math.sin(u * 9 - t * 1.7) * 6 * S, th = S * (u < .07 ? 26 + 34 * Math.sin(u / .07 * 1.5708) : 60 * Math.pow(1 - (u - .07) / .93, .7) + 3); C.push([x, y, th, u]); }
  if (C[N][0] < -40 || X > 840) return;
  g.save(); g.globalAlpha = al; g.fillStyle = '#000';
  g.beginPath(); C.forEach(([x, y, th], i) => i ? g.lineTo(x, y - th) : g.moveTo(x, y - th)); for (let i = N; i >= 0; i--) g.lineTo(C[i][0], C[i][1] + C[i][2] * .85); g.closePath(); g.fill();
  if (rim > .01) { g.strokeStyle = `rgba(110,170,200,${(.3 * rim).toFixed(3)})`; g.lineWidth = 1.3; g.beginPath(); C.forEach(([x, y, th], i) => i ? g.lineTo(x, y - th) : g.moveTo(x, y - th)); g.stroke(); }
  g.globalCompositeOperation = 'lighter';
  for (let i = 2; i < N - 1; i++) { const [x, y, th, u] = C[i]; if (x < -20 || x > 820) continue; const w = Math.max(0, Math.sin(u * 26 - t * 5)), w2 = Math.max(0, Math.sin(u * 26 - t * 5 + 1.6)), r = 1.2 + 2.2 * S;
    g.fillStyle = `rgba(120,255,235,${(.25 + .75 * w).toFixed(3)})`; g.beginPath(); g.arc(x, y - th * .35, r, 0, 6.2832); g.fill();
    g.fillStyle = `rgba(120,255,235,${(.12 * w).toFixed(3)})`; g.beginPath(); g.arc(x, y - th * .35, r * 3.2, 0, 6.2832); g.fill();
    if (i % 2 === 0) { g.fillStyle = `rgba(140,170,255,${(.2 + .7 * w2).toFixed(3)})`; g.beginPath(); g.arc(x, y + th * .4, r * .8, 0, 6.2832); g.fill(); } }
  const [ex, ey, eth] = C[2], gl = .5 + .5 * Math.sin(t * 2);
  g.fillStyle = `rgba(255,214,140,${(.5 + .4 * gl).toFixed(3)})`; g.beginPath(); g.arc(ex - 4 * S, ey - eth * .25, 7 * S, 0, 6.2832); g.fill();
  g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.beginPath(); g.arc(ex - 4 * S, ey - eth * .25, 4 * S, 0, 6.2832); g.fill();
  g.restore();
}
/* ----- l'œil de l'abîme ----- */
function abEye(g, cx, cy, R, open, pup, t, al) {
  if (R < 1 || al <= 0) return;
  const W = R * 1.75, H = R * 1.05 * open;
  g.save();
  if (open > .02) {
    const lid = new Path2D(); lid.moveTo(cx - W, cy); lid.quadraticCurveTo(cx, cy - H * 2, cx + W, cy); lid.quadraticCurveTo(cx, cy + H * 2, cx - W, cy); lid.closePath();
    g.save(); g.clip(lid);
    const sc = g.createRadialGradient(cx, cy, R * .5, cx, cy, W); sc.addColorStop(0, `rgba(10,42,62,${al.toFixed(3)})`); sc.addColorStop(1, `rgba(2,8,14,${al.toFixed(3)})`); g.fillStyle = sc; g.fillRect(cx - W, cy - H - 2, W * 2, H * 2 + 4);
    g.globalCompositeOperation = 'lighter'; g.lineWidth = 1.3;
    for (let i = 0; i < 150; i++) { const a = i / 150 * 6.2832 + Math.sin(i * 7.3) * .02, h = 185 + 70 * Math.sin(a * 3 + t * .4) + (i % 5) * 4, w = .35 + .65 * Math.pow(Math.max(0, Math.sin(a * 6 - t * 2.2 + i * .3)), 2), r0 = pup * (1 + .05 * Math.sin(i)), r1 = R * (.86 + .14 * Math.sin(i * 1.7)), am = a + Math.sin(i) * .06;
      g.strokeStyle = `hsla(${h | 0},100%,${(55 + 20 * w) | 0}%,${(al * (.25 + .6 * w)).toFixed(3)})`; g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.quadraticCurveTo(cx + Math.cos(am) * (r0 + r1) * .5, cy + Math.sin(am) * (r0 + r1) * .5, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.stroke(); }
    for (let k = 0; k < 3; k++) { const q = (t * .5 + k / 3) % 1; g.strokeStyle = `rgba(160,255,250,${(al * .35 * (1 - q)).toFixed(3)})`; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, pup + q * (R - pup), 0, 6.2832); g.stroke(); }
    g.strokeStyle = `rgba(150,110,255,${(al * .8).toFixed(3)})`; g.lineWidth = R * .05; g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.stroke();
    const ig = g.createRadialGradient(cx, cy, pup, cx, cy, R * 1.3); ig.addColorStop(0, `rgba(95,244,255,${(al * .35).toFixed(3)})`); ig.addColorStop(1, 'rgba(95,244,255,0)'); g.fillStyle = ig; g.fillRect(cx - R * 1.3, cy - R * 1.3, R * 2.6, R * 2.6);
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = `rgba(0,0,0,${al.toFixed(3)})`; g.beginPath(); g.arc(cx, cy, pup, 0, 6.2832); g.fill();
    g.fillStyle = `rgba(230,255,255,${(al * .85).toFixed(3)})`; g.beginPath(); g.ellipse(cx - pup * .38, cy - pup * .42, pup * .16, pup * .11, -.5, 0, 6.2832); g.fill();
    g.restore();
  }
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i <= 40; i++) { const q = i / 40, x = cx - W + q * 2 * W, yo = (1 - Math.pow(2 * q - 1, 2)) * H; for (let j = 0; j < 2; j++) { const fl = .4 + .6 * Math.max(0, Math.sin(t * 3 + i * .7 + j)); g.fillStyle = `rgba(120,250,255,${(al * .7 * fl).toFixed(3)})`; g.fillRect(x - 1, cy + (j ? yo : -yo) - 1, 2.2, 2.2); } }
  g.restore();
}

/* ===================================================================
   Le style : le fond de l'océan, en direct
   =================================================================== */
const ABX = {j: null, sp: [], ev: null, evNext: 0, lure: null, lureNext: 0, ping: 0, last: 0, bg: null, depth: 10994};
function drawAby(P, t) {
  const T = t / 1000, g = f, dt = ABX.last ? Math.max(0, Math.min(.06, T - ABX.last)) : .016, lite = !!cfg.lite; ABX.last = T;
  if (!ABX.j) ABX.j = [{x: 640, y: 340, s: 58, h: 188, ph: 0, vx: -5, vy: -5}, {x: 230, y: 420, s: 40, h: 285, ph: 2, vx: 4, vy: -4}, {x: 480, y: 130, s: 28, h: 320, ph: 4, vx: -3, vy: -6}].slice(0, lite ? 2 : 3);
  if (!ABX.bg) { const b = g.createLinearGradient(0, 0, 0, 480); b.addColorStop(0, '#04192c'); b.addColorStop(.45, '#020b17'); b.addColorStop(1, '#000306'); ABX.bg = b; }
  g.fillStyle = ABX.bg; g.fillRect(0, 0, 800, 480);
  /* une lueur, très loin au-dessus */
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 4; k++) { const x0 = 170 + k * 150 + Math.sin(T * .08 + k) * 40, w = 30 + (k % 2) * 30, a = .022 + .018 * Math.sin(T * .22 + k * 1.7), rg = g.createLinearGradient(0, 0, 0, 360); rg.addColorStop(0, `rgba(120,200,255,${a.toFixed(3)})`); rg.addColorStop(1, 'rgba(120,200,255,0)'); g.fillStyle = rg; g.beginPath(); g.moveTo(x0 - w * .3, 0); g.lineTo(x0 + w * .3, 0); g.lineTo(x0 + w + 70, 360); g.lineTo(x0 - w - 30, 360); g.fill(); }
  g.restore();
  /* neige marine (les flocons lointains passent derrière le léviathan) */
  P.forEach(p => { p.y += (.1 + p.r * .05) * SPD * dt * 30; p.x += Math.sin(T * .3 + p.p) * .1; if (p.y > 486) { p.y = -6; p.x = Math.random() * 800; } });
  const snow = far => P.forEach(p => { if ((p.k < .6) !== far) return; const a = .16 + .42 * p.k, r = p.r * (.6 + p.k * .6); g.fillStyle = `rgba(205,230,245,${a.toFixed(2)})`; g.fillRect(p.x, p.y, r, r); });
  snow(true);
  /* le léviathan passe au loin, de temps en temps */
  if (!ABX.evNext) ABX.evNext = T + 40 + Math.random() * 30;
  if (!ABX.ev && T > ABX.evNext) ABX.ev = {k: 'lev', t0: T};
  if (ABX.ev) { const e = T - ABX.ev.t0, X = 860 - e * 80; abLev(g, X, 300 + Math.sin(e * .25) * 24, .5, T, .85, 0); if (X < -820) { ABX.ev = null; ABX.evNext = T + 75 + Math.random() * 60; } }
  snow(false);
  /* méduses */
  ABX.j.forEach(j => { j.x += j.vx * dt; j.y += (j.vy - Math.max(0, Math.sin(T * 1.7 + j.ph)) * 8) * dt; if (j.y < -j.s * 2.4) { j.y = 480 + j.s; j.x = 80 + Math.random() * 640; } if (j.x < -j.s * 1.5) j.x = 800 + j.s; if (j.x > 800 + j.s * 1.5) j.x = -j.s; abJelly(g, j.x, j.y, j.s, T, j.h, .85, j.ph); });
  /* la lanterne d'une baudroie qui rôde */
  if (!ABX.lureNext) ABX.lureNext = T + 25 + Math.random() * 20;
  if (!ABX.lure && T > ABX.lureNext) ABX.lure = {t0: T, y: 330 + Math.random() * 90, d: Math.random() < .5 ? 1 : -1};
  if (ABX.lure) { const e = T - ABX.lure.t0, q = e / 22, x = ABX.lure.d > 0 ? -60 + q * 920 : 860 - q * 920, a = Math.min(1, e / 2, (22 - e) / 2); if (a > 0) { g.save(); g.globalCompositeOperation = 'lighter'; const y = ABX.lure.y + Math.sin(e * 1.4) * 8, lg = g.createRadialGradient(x, y, 0, x, y, 34); lg.addColorStop(0, `rgba(230,255,255,${(.85 * a).toFixed(3)})`); lg.addColorStop(.15, `rgba(140,240,255,${(.45 * a).toFixed(3)})`); lg.addColorStop(1, 'rgba(40,140,255,0)'); g.fillStyle = lg; g.fillRect(x - 34, y - 34, 68, 68); g.restore(); } if (e > 22) { ABX.lure = null; ABX.lureNext = T + 50 + Math.random() * 40; } }
  /* plancton qui scintille */
  if (!lite && Math.random() < dt * 1.2) abSpark(ABX.sp, Math.random() * 800, 60 + Math.random() * 400, 6, 180 + Math.random() * 40, 14);
  /* sonar */
  if (T - ABX.ping > 10) ABX.ping = T; const pe = T - ABX.ping;
  if (pe < 4.5) { g.strokeStyle = `rgba(95,244,255,${(.2 * (1 - pe / 4.5)).toFixed(3)})`; g.lineWidth = 1.2; g.beginPath(); g.arc(150, 200, 20 + pe * 170, 0, 6.2832); g.stroke(); }
  abSparkDraw(g, ABX.sp, dt);
  ABX.depth = 10994 + Math.round(Math.sin(T * .05) * 3 + Math.sin(T * .013) * 2);
}

/* ===================================================================
   La cinématique (≈ 90 s) : la descente
   =================================================================== */
let abOn = false;
function abyCinematic(apply) {
  if (abOn) return false; abOn = true;
  let got = null; try { got = JSON.parse(localStorage.getItem('abyGot') || 'null'); } catch (e) {}
  const lite = !!cfg.lite, GD = [0, 200, 1000, 4000, 6000, 11000], GP = [0, .12, .3, .55, .72, 1], GH = 330;
  const gpos = d => { for (let i = 0; i < GD.length - 1; i++) if (d <= GD[i + 1]) return GP[i] + (GP[i + 1] - GP[i]) * (d - GD[i]) / (GD[i + 1] - GD[i]); return 1; };
  const rv = []; for (let i = 0; i < 14; i++) { const q = i / 14, [x, y] = q < .25 ? [24 + q / .25 * 752, 12] : q < .5 ? [788, 24 + (q - .25) / .25 * 432] : q < .75 ? [776 - (q - .5) / .25 * 752, 468] : [12, 456 - (q - .75) / .25 * 432]; rv.push(`<i style="left:${(x - 3).toFixed(0)}px;top:${(y - 3).toFixed(0)}px"></i>`); }
  const el = document.createElement('div'); el.id = 'abc'; if (lite) el.classList.add('lite');
  el.innerHTML = `<svg class="ab-svg" width="0" height="0" aria-hidden="true"><filter id="abwarp" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.011 0.028" numOctaves="2" seed="7"><animate attributeName="baseFrequency" dur="5s" values="0.011 0.028;0.015 0.035;0.011 0.028" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="16" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
    <div class="ab-slab"></div><canvas width="800" height="480"></canvas><div class="ab-hull">${rv.join('')}</div>
    <div class="ab-hud"><div class="ab-dl"><small>PROFONDEUR</small><b>0</b><i>m</i></div><div class="ab-meta"><span>PRESSION <b class="ab-p">1</b> bar</span><span>EAU <b class="ab-tp">18</b> °C</span><span>LUMIÈRE <b class="ab-li">100</b> %</span></div><div class="ab-st"></div></div>
    <div class="ab-gauge"><div class="ab-tr"><i class="ab-fill"></i></div>${GD.map((d, i) => `<span style="top:${(GP[i] * GH).toFixed(0)}px">${abN(d)}</span>`).join('')}<b class="ab-mk"></b></div>
    <div class="ab-zone"><small></small><b></b><span></span></div><div class="ab-cap"></div><div class="ab-flash"></div>
    <div class="ab-title">${[...'ABYSSE'].map((c, i) => `<span style="--i:${i}">${c}</span>`).join('')}</div>
    <div class="ab-sub"><b>STYLE SECRET DÉBLOQUÉ</b><span>1 CHANCE SUR 2 000 000 · 10 994 MÈTRES${got && got.n ? ` · OBTENU ×${got.n}` : ''}</span></div><div class="ab-skip">touche 2 fois pour passer</div>`;
  stage.appendChild(el); if (typeof cinFX === 'function') cinFX(el, {bars: false});
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), tm = [], at = (s, fn) => tm.push(setTimeout(fn, s * 1000)), T0 = performance.now();
  const music = !PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on ? (AMB.unlock(), AMB.aby ? AMB.aby() : null) : null;
  const $$ = s => el.querySelector(s), HD = {d: $$('.ab-dl b'), p: $$('.ab-p'), tp: $$('.ab-tp'), li: $$('.ab-li'), st: $$('.ab-st'), ticks: [...el.querySelectorAll('.ab-gauge span')]}, last = {};
  const cap = (s, d = 3.4) => { const c = $$('.ab-cap'); c.classList.remove('on'); setTimeout(() => { c.innerHTML = s; c.classList.add('on'); }, 260); if (d) tm.push(setTimeout(() => c.classList.remove('on'), (d + .26) * 1000)); };
  const zone = (i, n, s) => { const z = $$('.ab-zone'); z.querySelector('small').textContent = `ZONE ${i} / 5`; z.querySelector('b').textContent = n; z.querySelector('span').textContent = s; z.classList.add('on'); tm.push(setTimeout(() => z.classList.remove('on'), 3600)); };
  const setSt = s => { if (last.st !== s) { last.st = s; HD.st.innerHTML = s; } };
  /* 0. l'écran prend l'eau : on garde une copie de l'ancien style, déformée sous la surface */
  const slab = $$('.ab-slab'), keep = ['ovb', 'deco', 'under', 'v1', 'v2', 'v3', 'deco2', 'eggs', 'fest', 'tick', 'shelf', 'fx'];
  at(1.5, () => { [...stage.children].filter(e => e !== el && (e.classList.contains('bg') || e.tagName === 'HEADER' || keep.includes(e.id))).forEach(e => { if (getComputedStyle(e).display === 'none') return; const k = e.cloneNode(true); if (e.tagName === 'CANVAS') { try { k.getContext('2d').drawImage(e, 0, 0); } catch (x) {} } slab.appendChild(k); }); el.classList.add('wet'); });
  at(3.2, () => cap('L\'écran prend l\'eau…', 2.4));
  at(6.35, () => { stage.classList.add('ab-hide'); el.classList.add('sunk'); el.style.setProperty('--wl', '0px'); });
  at(6.9, () => el.classList.add('hull', 'hud'));
  /* 1. la descente, zone par zone */
  at(7.4, () => zone(1, 'ZONE ÉCLAIRÉE', 'épipélagique · 0 – 200 m'));
  at(11.4, () => cap('Tout commence à la surface, dans la lumière.', 3.2));
  at(15, () => cap('À 200 mètres, il ne reste presque plus de soleil.', 3));
  at(18.2, () => zone(2, 'ZONE CRÉPUSCULAIRE', 'mésopélagique · 200 – 1 000 m'));
  at(22, () => cap('Ici, les animaux fabriquent leur propre lumière.', 3.2));
  at(26.2, () => cap('Les trois quarts des animaux des profondeurs <i>brillent</i>.', 3.2));
  at(30.2, () => zone(3, 'ZONE DE MINUIT', 'bathypélagique · 1 000 – 4 000 m'));
  at(31, () => setSt('◉ PROJECTEURS ALLUMÉS'));
  at(34, () => cap('1 000 mètres. Plus un seul rayon de soleil. Jamais.', 3));
  at(38.4, () => cap('La baudroie des abysses pêche avec une <i>lanterne</i>…', 3.4));
  at(44.2, () => zone(4, 'LES ABYSSES', 'abyssopélagique · 4 000 – 6 000 m'));
  at(46.6, () => { el.classList.add('contact'); setSt('<em>◉ SONAR · CONTACT</em>'); });
  at(48.2, () => cap('Le sonar détecte quelque chose.', 2.6));
  at(51.4, () => cap('Quelque chose de très, <i>très</i> grand.', 3));
  at(55.4, () => { el.classList.remove('contact'); setSt('◉ CONTACT PERDU'); });
  at(56.2, () => zone(5, 'LA FOSSE', 'hadopélagique · 6 000 – 11 000 m'));
  at(58.4, () => setSt('◉ FOSSE DES MARIANNES'));
  at(60, () => cap('La fosse des Mariannes, plus profonde que l\'Everest n\'est haut.', 3.4));
  at(61.2, () => setSt('<em>⚠ COQUE SOUS PRESSION</em>'));
  at(64, () => cap('La pression : plus de 1 000 fois celle de la surface.', 2.8));
  at(67.1, () => { setSt('◉ FOND ATTEINT'); cap('Fond atteint. <i>10 994 mètres.</i>', 1.4); });
  /* 2. la panne, le noir, et ce qui nous regarde */
  at(68.6, () => el.classList.add('flick'));
  at(69.3, () => { el.classList.remove('flick'); el.classList.add('emg'); setSt('<em>⚠ ÉNERGIE DE SECOURS</em>'); });
  at(72.6, () => cap('« Quand tu regardes longtemps l\'abîme, l\'abîme regarde aussi en toi. »<small>FRIEDRICH NIETZSCHE</small>', 5.4));
  const IMP = 79.25;
  at(IMP, () => { el.classList.add('bloom'); if (typeof impactFrames === 'function') impactFrames({host: el, x: 400, y: 236, theme: 'aby', snd: false, r: 58, lines: 80}); });
  /* 3. le titre, puis le style */
  at(81, () => el.classList.add('title'));
  at(85.6, () => { el.classList.remove('title'); el.classList.add('untitle'); });
  const AP = 86.6;
  at(AP, () => { if (apply && typeof apply === 'function') apply(); ABX.last = 0; stage.classList.remove('ab-hide'); stage.classList.add('ab-in'); el.classList.add('out'); });
  const fin = () => { tm.forEach(clearTimeout); el.remove(); abOn = false; stage.classList.remove('ab-hide', 'ab-in'); };
  at(AP + 2.6, fin);
  let lastTap = 0;
  el.addEventListener('pointerdown', e => { e.stopPropagation(); const n = Date.now(); $$('.ab-skip').classList.add('on'); if (n - lastTap < 450) { if (music) music.stop(); tm.forEach(clearTimeout); if (apply && typeof apply === 'function') apply(); stage.classList.remove('ab-hide'); el.classList.add('out', 'skip'); setTimeout(fin, 900); } lastTap = n; });

  /* ----- canevas ----- */
  const DK = [[6.4, 0], [18, 200], [30, 1000], [44, 4000], [56, 6000], [67, 10994]];
  const D = t => { if (t <= DK[0][0]) return 0; for (let i = 0; i < DK.length - 1; i++) { const [t0, d0] = DK[i], [t1, d1] = DK[i + 1]; if (t < t1) { let q = (t - t0) / (t1 - t0); if (i === 0) q = q * q; if (i === DK.length - 2) q = 1 - (1 - q) * (1 - q); return d0 + (d1 - d0) * q; } } return 10994; };
  const BGK = [[0, [30, 150, 190], [10, 80, 120]], [40, [16, 104, 150], [6, 54, 92]], [200, [8, 52, 86], [3, 26, 48]], [700, [3, 18, 34], [1, 8, 16]], [1500, [1, 7, 14], [0, 2, 6]], [11000, [0, 3, 8], [0, 1, 3]]];
  const bgAt = d => { let i = 0; while (i < BGK.length - 2 && d > BGK[i + 1][0]) i++; const [d0, a0, b0] = BGK[i], [d1, a1, b1] = BGK[i + 1], q = Math.max(0, Math.min(1, (d - d0) / (d1 - d0))), m = (x, y) => x.map((v, k) => Math.round(v + (y[k] - v) * q)); return [m(a0, a1), m(b0, b1)]; };
  const SN = Array.from({length: lite ? 90 : 190}, () => ({x: Math.random() * 800, y: Math.random() * 480, z: .25 + Math.random() * .75, p: Math.random() * 6.28}));
  const DR = [[.25, 300], [.85, 520], [1.35, 180], [1.7, 640], [1.95, 410]], BU = [], SP = [], SILT = [], RIP = [];
  const FS = Array.from({length: lite ? 24 : 46}, () => ({a: Math.random() * 6.28, r: .25 + Math.random() * .75, y: Math.random() - .5, w: .7 + Math.random() * .6, s: .75 + Math.random() * .55}));
  const JE = [[560, 18.4, 70, 188, 0], [210, 19.8, 46, 285, 2], [700, 21.6, 34, 320, 4], [360, 23.4, 58, 172, 1], [120, 25.6, 30, 205, 3], [620, 27, 44, 268, 5]].slice(0, lite ? 4 : 6);
  const BJ = Array.from({length: lite ? 4 : 8}, (_, i) => ({x: 60 + i * (680 / (lite ? 3 : 7)) + (Math.random() - .5) * 60, y: 160 + Math.random() * 300, s: 26 + Math.random() * 46, h: AB_H[i % AB_H.length], ph: Math.random() * 6, v: 8 + Math.random() * 10}));
  const CR = [[18, 20, .6], [782, 30, 2.4], [780, 462, 3.7], [26, 452, 5.5]].map(([x, y, a0]) => { const pts = [[x, y]]; let a = a0, px = x, py = y; for (let i = 0; i < 9; i++) { a += (Math.random() - .5) * .9; const l = 14 + Math.random() * 22; px += Math.cos(a) * l; py += Math.sin(a) * l; pts.push([px, py]); } return pts; });
  let BL = null, lt = 0, scroll = 0, wall = 0;
  (function frame(nw) {
    if (!el.isConnected) return; requestAnimationFrame(frame); const t = (nw - T0) / 1000, dt = Math.max(0, Math.min(.06, t - lt)); lt = t;
    try {
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, 800, 480);
      const d = D(t), v = (d - D(Math.max(0, t - .1))) / .1, up = t > 6.4 && t < 67.4 ? 26 + 70 * Math.log10(1 + v) : 4;
      /* ---------- 0. l'inondation ---------- */
      if (t < 6.45) {
        const L = 480 - 525 * abIO(abC(2, 6.35, t)), wave = x => L + Math.sin(x * .018 + t * 2.6) * 5 + Math.sin(x * .043 - t * 3.4) * 3;
        el.style.setProperty('--wl', Math.max(0, L).toFixed(1) + 'px');
        DR.forEach(([t0, x]) => { const e = t - t0; if (e > 0 && e < .36) { const y = -12 + 490 * e * e / (.36 * .36); g.fillStyle = 'rgba(200,240,255,.75)'; g.beginPath(); g.moveTo(x, y - 14); g.quadraticCurveTo(x + 5, y, x, y + 4); g.quadraticCurveTo(x - 5, y, x, y - 14); g.fill(); } else if (e >= .36 && !RIP.some(r => r.t0 === t0)) RIP.push({t0, x, y: Math.min(472, L + 2)}); });
        RIP.forEach(r => { const e = t - r.t0 - .36; if (e < 0 || e > 1.4) return; for (let k = 0; k < 3; k++) { const q = e - k * .18; if (q < 0) continue; g.strokeStyle = `rgba(210,245,255,${(.6 * (1 - q / 1.4)).toFixed(3)})`; g.lineWidth = 1.2; g.beginPath(); g.ellipse(r.x, r.y, 8 + q * 90, 2 + q * 12, 0, 0, 6.2832); g.stroke(); } });
        if (L < 482) {
          const wg = g.createLinearGradient(0, L, 0, 480); wg.addColorStop(0, 'rgba(40,150,200,.28)'); wg.addColorStop(1, 'rgba(5,60,105,.55)'); g.fillStyle = wg;
          g.beginPath(); g.moveTo(0, 480); for (let x = 0; x <= 800; x += 20) g.lineTo(x, wave(x)); g.lineTo(800, 480); g.fill();
          g.save(); g.globalCompositeOperation = 'lighter';
          for (let k = 0; k < 7; k++) { const yy = L + 40 + k * 60; if (yy > 480) break; g.strokeStyle = `rgba(150,230,255,${(.08 + .05 * Math.sin(t * 2 + k)).toFixed(3)})`; g.lineWidth = 1.5; g.beginPath(); for (let x = 0; x <= 800; x += 25) { const y = yy + Math.sin(x * .03 + t * 1.8 + k) * 9; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
          g.strokeStyle = 'rgba(230,252,255,.85)'; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= 800; x += 20) x ? g.lineTo(x, wave(x)) : g.moveTo(x, wave(x)); g.stroke();
          g.strokeStyle = 'rgba(180,240,255,.35)'; g.lineWidth = 6; g.stroke();
          g.restore();
          if (Math.random() < dt * 30) BU.push({x: Math.random() * 800, y: 486, r: 1.5 + Math.random() * 3.5, v: 60 + Math.random() * 90, p: Math.random() * 6});
        }
        if (t > 6.2 && !el.dataset.plouf) { el.dataset.plouf = 1; for (let i = 0; i < (lite ? 50 : 110); i++) BU.push({x: Math.random() * 800, y: 200 + Math.random() * 300, r: 1.5 + Math.random() * 6, v: 200 + Math.random() * 300, p: Math.random() * 6}); }
        for (let i = BU.length - 1; i >= 0; i--) { const b = BU[i]; b.y -= b.v * dt; b.x += Math.sin(t * 4 + b.p) * .5; if (b.y < Math.max(-10, wave(b.x))) { BU.splice(i, 1); continue; } g.strokeStyle = 'rgba(220,250,255,.6)'; g.lineWidth = 1; g.beginPath(); g.arc(b.x, b.y, b.r, 0, 6.2832); g.stroke(); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(b.x - b.r * .4, b.y - b.r * .5, 1.2, 1.2); }
      }
      /* ---------- 1 à 5. la descente ---------- */
      if (t >= 6.3 && t < 79.3) {
        const [c0, c1] = bgAt(d), bA = .5 + .5 * abC(6.35, 9.4, t), bg = g.createLinearGradient(0, 0, 0, 480);
        bg.addColorStop(0, `rgba(${c0},${bA.toFixed(3)})`); bg.addColorStop(1, `rgba(${c1},${bA.toFixed(3)})`); g.fillStyle = bg; g.fillRect(0, 0, 800, 480);
        const sun = 1 - abC(120, 900, d), pr = t < 31 || t > 69.3 ? 0 : t > 68.6 ? [1, 0, 1, 0, .6, 0, 0][Math.floor((t - 68.6) / .1)] || 0 : abC(31, 31.15, t) * (t < 31.5 ? (Math.sin(t * 90) > 0 ? 1 : .3) : 1);
        /* la surface vue d'en dessous, les rayons du soleil */
        if (d < 34) { const ys = 40 - d * 2.6, a = 1 - abC(0, 34, d), sg = g.createLinearGradient(0, ys - 70, 0, ys + 34); sg.addColorStop(0, `rgba(225,252,255,${(.9 * a).toFixed(3)})`); sg.addColorStop(.6, `rgba(150,232,255,${(.45 * a).toFixed(3)})`); sg.addColorStop(1, 'rgba(120,210,255,0)'); g.fillStyle = sg; g.fillRect(0, ys - 70, 800, 104);
          g.save(); g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 4; k++) { g.strokeStyle = `rgba(255,255,255,${(.3 * a).toFixed(3)})`; g.lineWidth = 1.2; g.beginPath(); for (let x = 0; x <= 800; x += 20) { const y = ys - 6 + k * 7 + Math.sin(x * .025 + t * 2 + k * 1.3) * 4; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } g.restore(); }
        if (sun > .01) { g.save(); g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 7; k++) { const x0 = 60 + k * 115 + Math.sin(t * .2 + k * 2) * 30, w = 26 + (k % 3) * 20, a = sun * (.07 + .05 * Math.sin(t * .7 + k * 1.9)), rg = g.createLinearGradient(0, 0, 0, 480); rg.addColorStop(0, `rgba(190,245,255,${a.toFixed(3)})`); rg.addColorStop(1, 'rgba(190,245,255,0)'); g.fillStyle = rg; g.beginPath(); g.moveTo(x0 - w * .25, 0); g.lineTo(x0 + w * .25, 0); g.lineTo(x0 + w + 110, 480); g.lineTo(x0 - w + 30, 480); g.fill(); } g.restore(); }
        /* les projecteurs du bathyscaphe */
        if (pr > 0) { g.save(); g.globalCompositeOperation = 'lighter'; [[40, 480], [760, 480]].forEach(([x0, y0]) => { const bm = g.createLinearGradient(x0, y0, 400, 230); bm.addColorStop(0, `rgba(200,235,255,${(.13 * pr).toFixed(3)})`); bm.addColorStop(1, 'rgba(200,235,255,0)'); g.fillStyle = bm; g.beginPath(); g.moveTo(x0 - 30, y0); g.lineTo(x0 + 30, y0); g.lineTo(400 + (x0 < 400 ? 120 : -120), 160); g.lineTo(400 + (x0 < 400 ? -40 : 40), 150); g.fill(); }); const cg = g.createRadialGradient(400, 250, 0, 400, 250, 330); cg.addColorStop(0, `rgba(120,190,220,${(.1 * pr).toFixed(3)})`); cg.addColorStop(1, 'rgba(120,190,220,0)'); g.fillStyle = cg; g.fillRect(0, 0, 800, 480); g.restore(); }
        /* neige marine et plancton (éclairés par le soleil ou les projecteurs) */
        const snow = far => SN.forEach(p => { if ((p.z < .6) !== far) return; const pf = Math.max(0, 1 - Math.hypot((p.x - 400) / 430, (p.y - 250) / 300)), a = (.12 + .55 * p.z) * Math.max(sun * .9, pr * pf * 1.3, .07); if (a < .02) return; const r = .7 + p.z * 1.6; g.fillStyle = sun > .3 ? `rgba(220,250,255,${a.toFixed(3)})` : `rgba(200,222,236,${a.toFixed(3)})`; g.fillRect(p.x, p.y, r, r); });
        SN.forEach(p => { p.y -= up * p.z * dt; p.y += 6 * dt; p.x += Math.sin(t * .4 + p.p) * .15; if (p.y < -4) { p.y = 484; p.x = Math.random() * 800; } if (p.y > 486) p.y = -2; });
        snow(true);
        /* le banc de poissons */
        if (t > 8.8 && t < 17.6) { const e = t - 8.8, cx = -220 + e / 8.8 * 1260, cy = 250 + Math.sin(e * .7) * 50, a = Math.min(1, e / .8, (8.8 - e) / .8);
          FS.forEach(q => { const an = q.a + t * q.w * 1.4, ox = Math.cos(an) * q.r * 130, oy = q.y * 80 + Math.sin(an) * q.r * 36, dir = (-Math.sin(an) * q.r * 130 * q.w * 1.4 + 143) > 0 ? 1 : -1, fl = Math.pow(Math.max(0, Math.cos(an * 2)), 8); g.fillStyle = `rgba(${(180 + 70 * fl) | 0},${(220 + 35 * fl) | 0},255,${(a * (.45 + .45 * fl) * Math.max(.3, sun)).toFixed(3)})`; abFish(g, cx + ox, cy + oy, q.s, dir); }); }
        /* méduses, siphonophore, poissons-lanternes */
        JE.forEach(([x, t0, s, h, ph]) => { const e = t - t0; if (e < 0) return; const y = 560 - e * 96, a = Math.min(1, e / 1.2); abJelly(g, x + Math.sin(e * .5 + ph) * 16, y, s, t, h, a * (1 - sun * .4), ph); });
        if (t > 23.6 && t < 31.5) { const e = t - 23.6; abSipho(g, 820 - e * 120, 520 - e * 92, t, Math.min(1, e, (7.9 - e) * 1.5), lite ? 26 : 40); }
        if (t > 26.4 && t < 31) { const e = t - 26.4; for (let i = 0; i < 9; i++) abLantern(g, 860 - e * 260 + (i % 3) * 40 + i * 14, 140 + i * 22 + Math.sin(e * 3 + i) * 6 - e * 30, 1.1 + (i % 2) * .3, -1, t, Math.min(1, e * 2)); }
        /* zone de minuit : éclairs de bioluminescence */
        if (t > 30.4 && t < 67 && Math.random() < dt * (lite ? .9 : 1.6)) abSpark(SP, 60 + Math.random() * 680, 60 + Math.random() * 360, lite ? 10 : 18, 180 + Math.random() * 40, 50 + Math.random() * 40);
        /* la baudroie */
        if (t > 34.2 && t < 43) { const e = t - 34.2, ap = abS(abC(0, 5.6, e)), ex = e > 7 ? Math.pow(e - 7, 2) * 140 : 0, lx = 610 - 190 * ap + Math.sin(e * 1.3) * 10 - ex, ly = 250 - 34 * ap + Math.sin(e * 1.9) * 8, s = .3 + .8 * abS(abC(0, 6, e)), body = abC(4.2, 5.6, e) * (1 - abC(7.2, 8.4, e)), mouth = abS(abC(5.4, 6.3, e)) * (1 - abS(abC(6.7, 7.3, e))), la = Math.min(1, e / 1.2) * (1 - abC(7.6, 8.6, e)); abAngler(g, lx, ly, s, body, mouth, la); }
        /* le léviathan */
        if (t > 46.8 && t < 56) { const X = 1000 - (t - 46.8) * 360; abLev(g, X, 238, 1, t, 1, pr * .8); }
        snow(false);
        abSparkDraw(g, SP, dt);
        /* le sonar */
        if (t > 45.6 && t < 55.8) { const a = Math.min(1, (t - 45.6) * 2, (55.8 - t) * 2), cx = 96, cy = 396, R = 44; g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(0,20,26,.55)'; g.beginPath(); g.arc(cx, cy, R, 0, 6.2832); g.fill(); g.strokeStyle = 'rgba(95,244,255,.5)'; g.lineWidth = 1; [1, .66, .33].forEach(k => { g.beginPath(); g.arc(cx, cy, R * k, 0, 6.2832); g.stroke(); }); g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke();
          const sw = t * 2.6; g.globalCompositeOperation = 'lighter'; for (let k = 0; k < 14; k++) { const aa = sw - k * .05; g.strokeStyle = `rgba(95,244,255,${(.5 * (1 - k / 14)).toFixed(3)})`; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(aa) * R, cy + Math.sin(aa) * R); g.stroke(); }
          const lx = 1000 - (t - 46.8) * 360, bxx = cx + Math.max(-1, Math.min(1, (lx - 400) / 1400)) * R * .7, sz = 6 + 22 * abC(46, 50, t); g.fillStyle = 'rgba(255,170,90,.55)'; g.beginPath(); g.ellipse(bxx, cy - 12, sz, sz * .35, 0, 0, 6.2832); g.fill();
          g.font = '600 8px "JetBrains Mono",monospace'; g.fillStyle = 'rgba(159,244,255,.85)'; g.textAlign = 'center'; g.fillText('SONAR', cx, cy + R + 12); g.restore(); }
        /* la fosse : parois, cheminées hydrothermales */
        if (t > 55.8 && t < 69.4) { wall += up * dt * 1.3; const inA = abE(abC(55.8, 58.6, t)), wl = y => -260 + inA * (300 + 70 * abC(58.6, 66, t)) + Math.sin((y + wall) * .009) * 40 + Math.sin((y + wall) * .031) * 16 + Math.sin((y + wall) * .11) * 5, wr = y => 1060 - inA * (300 + 70 * abC(58.6, 66, t)) + Math.sin((y + wall) * .008 + 2) * 40 + Math.sin((y + wall) * .029 + 1) * 16 + Math.sin((y + wall) * .1) * 5;
          [wl, wr].forEach((W, side) => { const rk = g.createLinearGradient(side ? 800 : 0, 0, side ? 430 : 370, 0); rk.addColorStop(0, '#010205'); rk.addColorStop(1, `rgb(${(14 + 22 * pr) | 0},${(22 + 30 * pr) | 0},${(30 + 36 * pr) | 0})`); g.fillStyle = rk; g.beginPath(); g.moveTo(side ? 800 : 0, -10); for (let y = -10; y <= 490; y += 14) g.lineTo(W(y), y); g.lineTo(side ? 800 : 0, 490); g.fill(); g.strokeStyle = `rgba(120,180,205,${(.2 + .45 * pr).toFixed(3)})`; g.lineWidth = 2; g.beginPath(); for (let y = -10; y <= 490; y += 14) y > -10 ? g.lineTo(W(y), y) : g.moveTo(W(y), y); g.stroke(); });
          for (let k = 0; k < 3; k++) { const vy = 600 + k * 520 - wall % 1560, side = k % 2, W = side ? wr : wl; if (vy < -120 || vy > 600) continue; const vx = W(vy) + (side ? -4 : 4); g.save(); g.translate(vx, vy); g.scale(side ? -1.5 : 1.5, 1.5);
            g.fillStyle = '#05070b'; g.beginPath(); g.moveTo(-6, 30); g.lineTo(18, 30); g.lineTo(13, -36); g.lineTo(3, -40); g.closePath(); g.fill();
            g.globalCompositeOperation = 'lighter'; const og = g.createRadialGradient(8, -40, 0, 8, -40, 26); og.addColorStop(0, 'rgba(255,140,60,.55)'); og.addColorStop(1, 'rgba(255,90,30,0)'); g.fillStyle = og; g.fillRect(-20, -66, 56, 52); g.globalCompositeOperation = 'source-over';
            for (let s = 0; s < 6; s++) { const q = ((t * .6 + s / 6) % 1), sy = -44 - q * 140, sx = 8 + Math.sin(q * 6 + s) * 10 * q, r = 8 + q * 26; const sg = g.createRadialGradient(sx, sy, 0, sx, sy, r); sg.addColorStop(0, `rgba(20,22,28,${(.7 * (1 - q)).toFixed(3)})`); sg.addColorStop(1, 'rgba(20,22,28,0)'); g.fillStyle = sg; g.fillRect(sx - r, sy - r, r * 2, r * 2); }
            for (let w = 0; w < 6; w++) { const wx = 22 + w * 5, wh = 14 + (w * 7 % 11); g.strokeStyle = 'rgba(225,225,215,.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(wx, 30); g.lineTo(wx + Math.sin(t * 2 + w) * 2, 30 - wh); g.stroke(); g.fillStyle = 'rgba(230,50,60,.9)'; g.beginPath(); g.arc(wx + Math.sin(t * 2 + w) * 2, 30 - wh, 2.4, 0, 6.2832); g.fill(); }
            g.restore(); } }
        /* le fond : de la vase, éclairée par les projecteurs */
        if (t > 64.4) { const fy = 300 + 220 * (1 - abE(abC(64.4, 67, t))), fg = g.createLinearGradient(0, fy, 0, 480); fg.addColorStop(0, `rgba(40,52,58,${(.85 * pr).toFixed(3)})`); fg.addColorStop(1, `rgba(10,14,18,${(.9 * pr).toFixed(3)})`); g.fillStyle = '#000'; g.beginPath(); g.moveTo(0, 480); for (let x = 0; x <= 800; x += 40) g.lineTo(x, fy + Math.sin(x * .013) * 8 + Math.sin(x * .05) * 3); g.lineTo(800, 480); g.fill(); g.fillStyle = fg; g.fill();
          if (t > 67 && !el.dataset.silt) { el.dataset.silt = 1; for (let i = 0; i < (lite ? 40 : 90); i++) SILT.push({x: 220 + Math.random() * 360, y: fy + 30 + Math.random() * 60, vx: (Math.random() - .5) * 90, vy: -20 - Math.random() * 60, r: 6 + Math.random() * 20, l: 0}); } }
        SILT.forEach(s => { s.l += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= Math.pow(.4, dt); s.vy *= Math.pow(.4, dt); s.r += 10 * dt; const a = Math.max(0, .3 * (1 - s.l / 3.6)) * pr; if (a <= 0) return; const sg = g.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r); sg.addColorStop(0, `rgba(120,118,104,${a.toFixed(3)})`); sg.addColorStop(1, 'rgba(120,118,104,0)'); g.fillStyle = sg; g.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2); });
        /* la coque craque */
        if (t > 61 && t < 79.25) { const gr = abC(61, 66.5, t); g.save(); g.strokeStyle = 'rgba(225,245,255,.55)'; g.lineWidth = 1; CR.forEach((pts, i) => { const n = Math.floor(gr * (pts.length - 1) * (1 - i * .12)); if (n < 1) return; g.beginPath(); for (let k = 0; k <= n; k++) k ? g.lineTo(pts[k][0], pts[k][1]) : g.moveTo(pts[k][0], pts[k][1]); g.stroke(); }); g.restore(); }
        /* ---------- l'œil ---------- */
        if (t > 71.5) { const e = t - 71.5, R = 6 + 144 * abIO(abC(2.2, 5.6, e)), open = abIO(abC(3.4, 6.2, e)), sx = Math.sin(e * 1.3) * 3 * abC(4, 5, e), pup = R * (.3 + .1 * abS(abC(5.8, 7.1, e))) + R * .62 * abS(abC(7.3, 7.74, e));
          const pg = g.createRadialGradient(400, 236, 0, 400, 236, 30 + R); pg.addColorStop(0, `rgba(170,255,250,${(.9 * abC(0, 2.4, e) * (1 - open * .7)).toFixed(3)})`); pg.addColorStop(.2, `rgba(60,200,255,${(.3 * abC(0, 2.4, e)).toFixed(3)})`); pg.addColorStop(1, 'rgba(40,120,255,0)'); g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = pg; g.fillRect(400 - 30 - R, 236 - 30 - R, 60 + R * 2, 60 + R * 2); g.restore();
          abEye(g, 400 + sx, 236, R, Math.max(open, .015 * abC(1.6, 2.4, e)), pup, t, Math.min(1, e / 2)); }
      }
      /* ---------- 6. l'explosion de lumière ---------- */
      if (t >= 79.25) {
        if (!BL) { BL = Array.from({length: lite ? 380 : 900}, () => { const a = Math.random() * 6.2832, sp = 80 + Math.pow(Math.random(), .5) * 860; return {x: 400, y: 236, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .75, h: AB_H[Math.random() * AB_H.length | 0] + (Math.random() - .5) * 24, m: 4 + Math.random() * 4, r: .8 + Math.random() * 1.8, p: Math.random() * 6}; }); }
        const e = t - 79.25, fade = 1 - abC(85.4, 87.6, t), lit = abC(0, 1.2, e);
        const bg = g.createLinearGradient(0, 0, 0, 480); bg.addColorStop(0, '#04192c'); bg.addColorStop(.45, '#020b17'); bg.addColorStop(1, '#000306'); g.fillStyle = bg; g.fillRect(0, 0, 800, 480);
        g.save(); g.globalCompositeOperation = 'lighter';
        const gl = g.createRadialGradient(400, 236, 0, 400, 236, 520); gl.addColorStop(0, `rgba(120,240,255,${(.55 * (1 - abC(0, 3.6, e))).toFixed(3)})`); gl.addColorStop(.35, `rgba(40,120,255,${(.22 * (1 - abC(0, 5, e))).toFixed(3)})`); gl.addColorStop(1, 'rgba(20,40,120,0)'); g.fillStyle = gl; g.fillRect(0, 0, 800, 480);
        const fy = 330, fl = g.createLinearGradient(0, fy, 0, 480); fl.addColorStop(0, `rgba(60,200,230,${(.18 * lit * fade).toFixed(3)})`); fl.addColorStop(1, 'rgba(10,40,70,0)'); g.fillStyle = fl; g.beginPath(); g.moveTo(0, 480); for (let x = 0; x <= 800; x += 40) g.lineTo(x, fy + Math.sin(x * .013) * 8 + Math.sin(x * .05) * 3); g.lineTo(800, 480); g.fill();
        g.restore();
        BJ.forEach(j => { j.y -= j.v * dt; abJelly(g, j.x, j.y, j.s, t, j.h, lit * fade * .95, j.ph); });
        g.save(); g.globalCompositeOperation = 'lighter';
        BL.forEach(p => { const k = Math.pow(.2, dt); p.vx *= k; p.vy *= k; if (e > .6) { const dx = p.x - 400, dy = p.y - 236; p.vx += -dy * .55 * dt; p.vy += (dx * .55 - 40) * dt; } const ox = p.x, oy = p.y; p.x += p.vx * dt; p.y += p.vy * dt; const a = Math.max(0, 1 - e / p.m) * fade * (.55 + .45 * Math.sin(t * 5 + p.p)); if (a <= .01) return;
          g.strokeStyle = `hsla(${p.h | 0},100%,72%,${a.toFixed(3)})`; g.lineWidth = p.r; g.beginPath(); g.moveTo(ox - (p.x - ox) * 2, oy - (p.y - oy) * 2); g.lineTo(p.x, p.y); g.stroke(); });
        g.restore();
        abSparkDraw(g, SP, dt);
        if (t > AP) { g.globalCompositeOperation = 'destination-out'; g.fillStyle = `rgba(0,0,0,${abC(AP, AP + 1.4, t).toFixed(3)})`; g.fillRect(0, 0, 800, 480); g.globalCompositeOperation = 'source-over'; }
      }
      /* ---------- l'affichage du bathyscaphe ---------- */
      if (t > 6.6 && t < 79.3) {
        const s = abN(d), pz = abN(1 + d / 10), tp = d < 1000 ? Math.round(18 - 14 * abS(d / 1000)) : Math.round(4 - 2 * (d - 1000) / 9994), li = Math.round(100 * Math.exp(-d / 42)), gp = (gpos(d) * GH).toFixed(1) + 'px';
        if (last.d !== s) { last.d = s; HD.d.textContent = s; } if (last.p !== pz) { last.p = pz; HD.p.textContent = pz; } if (last.tp !== tp) { last.tp = tp; HD.tp.textContent = tp; } if (last.li !== li) { last.li = li; HD.li.textContent = li; }
        if (last.gp !== gp) { last.gp = gp; el.style.setProperty('--gp', gp); HD.ticks.forEach((k, i) => k.classList.toggle('on', d >= GD[i] - 1)); }
      }
    } catch (x) { g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  })(T0);
  return true;
}

/* ----- Le style ----- */
let abLastD = '';
Object.assign(SIG, {
  aby: {name: '🌊 Abysse', icons: 'line', temp: 'text', noAstro: true, noClouds: true, amb: 'aby', secret: true,
    deco: '<div class="ab-vig"></div>',
    deco2: () => { let d = ''; try { const x = JSON.parse(localStorage.getItem('abyGot') || 'null'); if (x) d = ` · ATTEINT LE ${new Date(x.t).toLocaleDateString('fr-FR')}${x.n > 1 ? ' · ×' + x.n : ''}`; } catch (e) {} return `<div class="ab-badge">◉ ABYSSE · 1 CHANCE SUR 2 000 000 · −10 994 M${esc(d)}</div>`; },
    cin: done => abyCinematic(done),
    descHTML: d => { const same = d === abLastD; abLastD = d; return d.split(' ').map((w, i) => `<span class="abw${same ? '' : ' an'}" style="animation-delay:${(i * .11).toFixed(2)}s">${esc(w)}</span>`).join(' '); },
    v: {d: {clear: ['Grand soleil là-haut. Ici, on ne l\'a jamais vu.'], clearN: ['Nuit claire à la surface. Ici, il fait nuit depuis toujours.'], partly: ['Quelques nuages, 11 kilomètres au-dessus de nous.'], partlyN: ['Des nuages passent sur la lune, très loin là-haut.'], cloudy: ['Ciel couvert à la surface. Les abysses s\'en moquent.'], cloudnight: ['Nuit couverte. Ici, la seule lumière vient des animaux.'], fog: ['Brouillard à la surface. Ici, c\'est la neige marine.'], drizzle: ['Il bruine là-haut. Une goutte de plus dans l\'océan.'], rain: ['Il pleut. L\'océan n\'est pas à une goutte près.'], pour: ['Grosse averse à la surface ! Ici, pas une ride.'], storm: ['Orage en surface. À 11 000 m, le calme absolu.'], hail: ['Grêle là-haut. Elle fondra bien avant d\'arriver ici.'], snow: ['Il neige dehors. Ici aussi : c\'est la neige marine.'], blizzard: ['Tempête de neige en surface. Ici, rien ne bouge.'], wind: ['Grand vent à la surface. Les vagues ne descendent pas jusqu\'ici.'], heat: ['Grosse chaleur là-haut. Ici, l\'eau reste à 2 °C.'], frost: ['Gel en surface. Ici, l\'eau ne gèle jamais.'], rainbow: ['Un arc-en-ciel là-haut. Ici, ce sont les méduses qui brillent.']},
      kick: c => ABX.ev ? `◉ SONAR · CONTACT À ${abN(Math.max(120, 900 - (performance.now() / 1000 - ABX.ev.t0) * 40))} M · TAILLE ???` : `◉ ${UP(c.city)} · −${abN(ABX.depth)} M · 1 100 BAR`, hl: c => `MAX ${c.mx}° · MIN ${c.mn}°`, mt: c => `ressenti ${c.fe}° · humidité ${c.hu} % · vent ${c.wi} km/h`, day: D3, hr: (h, n) => n ? pad2(h) + 'h' : 'ICI'}}
});
setInterval(() => { if (HT.id !== 'aby' || typeof CTX === 'undefined' || !CTX) return; const k = $('kick'); if (k) { const s = HT.v.kick(CTX); if (k.textContent !== s) k.textContent = s; k.classList.toggle('ev', !!ABX.ev); } }, 500);
const ABQ = ['La lumière du soleil ne descend pas sous 1 000 m.', 'Les trois quarts des animaux des profondeurs produisent leur propre lumière.', 'La fosse des Mariannes est plus profonde que l\'Everest n\'est haut.', 'À 11 000 m, la pression dépasse 1 000 fois celle de la surface.', 'L\'eau des abysses reste entre 1 et 4 °C.', 'La neige marine met des semaines à tomber jusqu\'au fond.', 'La baudroie des abysses pêche avec une lanterne.', 'On connaît mieux la surface de la Lune que le fond des océans.'];
stage.addEventListener('pointerdown', e => {
  if (HT.id !== 'aby') return; const s = stage.getBoundingClientRect(), k = s.width / 800, x = (e.clientX - s.left) / k, y = (e.clientY - s.top) / k;
  abSpark(ABX.sp, x, y, cfg.lite ? 18 : 36, 175 + Math.random() * 50, 90);
  if (Math.random() < .5 && typeof toast === 'function') toast(ABQ[Math.random() * ABQ.length | 0]);
});
EGGS.abycin = () => abyCinematic(HT.id === 'aby');
