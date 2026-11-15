
/* ===================================================================
   👁 LA PRÉSENCE — caméra de surveillance d'un couloir, la nuit.
   Quelqu'un se tient au bout. À chaque coupure de courant, il est plus près.
   (Le jumpscare n'existe que dans l'animation d'activation.)
   =================================================================== */
const PRV = {vx: 400, vy: 206, F: 250, fl: -.85, ce: 1.05, w: 1.15, zf: 12};
const prP = (X, Y, z) => [PRV.vx + X * PRV.F / z, PRV.vy - Y * PRV.F / z];
let PRX = {d: 0, next: 0, off: 0, offUntil: 0, gone: false, glitch: 0, cam: 3};
/* le couloir, en caméra de surveillance (niveaux de gris verdâtres) */
function prCorridor(g, t, o = {}) {
  const lit = o.lit == null ? 1 : o.lit, {w, fl, ce, zf} = PRV, Z0 = .55;
  const q = (pts, c) => { g.fillStyle = c; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };
  g.fillStyle = '#050605'; g.fillRect(0, 0, 800, 480);
  const L = v => `rgb(${(v * 1.0) | 0},${(v * 1.08) | 0},${(v * 1.0) | 0})`;
  /* sol, plafond, murs (dégradé de lumière vers le fond) */
  const steps = 14;
  for (let k = 0; k < steps; k++) { const z1 = Z0 * Math.pow(zf / Z0, k / steps), z2 = Z0 * Math.pow(zf / Z0, (k + 1) / steps), fade = Math.pow(1 - k / steps, 1.4) * lit + .04;
    q([prP(-w, fl, z1), prP(w, fl, z1), prP(w, fl, z2), prP(-w, fl, z2)], L(18 + 70 * fade));
    q([prP(-w, ce, z1), prP(w, ce, z1), prP(w, ce, z2), prP(-w, ce, z2)], L(10 + 34 * fade));
    q([prP(-w, fl, z1), prP(-w, ce, z1), prP(-w, ce, z2), prP(-w, fl, z2)], L(14 + 52 * fade));
    q([prP(w, fl, z1), prP(w, ce, z1), prP(w, ce, z2), prP(w, fl, z2)], L(12 + 48 * fade)); }
  /* carrelage */
  g.strokeStyle = `rgba(0,0,0,${(.25 * lit + .1).toFixed(2)})`; g.lineWidth = 1; g.beginPath();
  for (let i = -3; i <= 3; i++) { const a = prP(i / 3 * w, fl, Z0), b = prP(i / 3 * w, fl, zf); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); }
  for (let z = 1; z < zf; z *= 1.28) { const a = prP(-w, fl, z), b = prP(w, fl, z); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); } g.stroke();
  /* portes de classe avec leur petite vitre */
  [2.2, 4.3, 6.6, 9].forEach((z, i) => [-1, 1].forEach(s => { const X = s * w, a = prP(X, fl, z), b = prP(X, .55, z), c = prP(X, .55, z + .85), d = prP(X, fl, z + .85), fade = Math.max(.05, 1 - z / zf) * lit; q([a, b, c, d], L(8 + 30 * fade)); const wa = prP(X, .1, z + .2), wb = prP(X, .45, z + .2), wc = prP(X, .45, z + .55), wd = prP(X, .1, z + .55); q([wa, wb, wc, wd], `rgba(0,0,0,${(.6 + .3 * (1 - fade)).toFixed(2)})`);
    if (i === 2 && s === 1 && o.door) { const op = o.door; q([a, b, prP(X - op * .7, .55, z + .1), prP(X - op * .7, fl, z + .1)], '#020302'); } }));
  /* le fond : une porte ouverte sur le noir */
  const e1 = prP(-.45, fl, zf), e2 = prP(.45, .75, zf); g.fillStyle = '#000'; g.fillRect(e1[0], e2[1], e2[0] - e1[0], e1[1] - e2[1]);
  /* néons */
  [1.6, 3.6, 6, 8.8].forEach((z, i) => { const on = lit * (i === 1 ? (o.flick == null ? 1 : o.flick) : 1); const a = prP(-.22, ce - .01, z), b = prP(.22, ce - .01, z + 1.1); g.fillStyle = `rgba(225,240,225,${(.15 + .8 * on * Math.max(.2, 1 - z / zf)).toFixed(2)})`; g.fillRect(Math.min(a[0], b[0]), a[1], Math.abs(b[0] - a[0]) || 2, Math.max(2, (b[1] - a[1]) * .25 + 3));
    if (on > .1) { const cx = (a[0] + b[0]) / 2, cy = a[1] + 14, r = 260 / z, hg = g.createRadialGradient(cx, cy, 0, cx, cy, r); hg.addColorStop(0, `rgba(210,235,210,${(.16 * on).toFixed(3)})`); hg.addColorStop(1, 'rgba(210,235,210,0)'); g.fillStyle = hg; g.fillRect(cx - r, cy - r, r * 2, r * 2); } });
}
/* la silhouette */
function prFigure(g, t, z, o = {}) {
  if (z <= .3) return; const base = prP(0, PRV.fl, z), top = prP(0, PRV.fl + 1.85, z), H = base[1] - top[1], sw = Math.sin(t * .7) * H * .006, cx = base[0] + (o.dx || 0) / z * PRV.F;
  g.save(); g.fillStyle = `rgba(0,0,0,${o.a == null ? .96 : o.a})`;
  /* corps long et maigre */
  g.beginPath(); g.moveTo(cx - H * .07, base[1]); g.lineTo(cx - H * .095 + sw, top[1] + H * .22); g.quadraticCurveTo(cx + sw, top[1] + H * .16, cx + H * .095 + sw, top[1] + H * .22); g.lineTo(cx + H * .07, base[1]); g.closePath(); g.fill();
  /* bras trop longs */
  g.lineWidth = Math.max(1, H * .022); g.strokeStyle = g.fillStyle; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx - H * .09 + sw, top[1] + H * .24); g.quadraticCurveTo(cx - H * .13, top[1] + H * .55, cx - H * .11, top[1] + H * .8); g.moveTo(cx + H * .09 + sw, top[1] + H * .24); g.quadraticCurveTo(cx + H * .13, top[1] + H * .55, cx + H * .115, top[1] + H * .82); g.stroke();
  /* tête penchée */
  g.beginPath(); g.ellipse(cx + sw * 2 + H * .01, top[1] + H * .1, H * .055, H * .085, .18, 0, 6.2832); g.fill();
  /* deux points pâles */
  if (o.eyes !== false) { const ex = cx + sw * 2 + H * .01, ey = top[1] + H * .09, ea = o.eyes == null ? .55 : o.eyes; g.fillStyle = `rgba(230,240,230,${ea})`; g.beginPath(); g.arc(ex - H * .02, ey, Math.max(.6, H * .007), 0, 6.2832); g.arc(ex + H * .02, ey + H * .004, Math.max(.6, H * .007), 0, 6.2832); g.fill(); }
  g.restore();
}
/* bruit vidéo + lignes */
function prNoise(g, t, a = .12) { for (let k = 0; k < 3; k++) { const y = ((t * 60 + k * 170) % 520) - 20; g.fillStyle = `rgba(255,255,255,${(a * .4).toFixed(3)})`; g.fillRect(0, y, 800, 2 + k); } g.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`; for (let i = 0; i < 160; i++) g.fillRect(Math.random() * 800, Math.random() * 480, 1 + Math.random() * 2, 1); }
/* ----- fond du style ----- */
function drawPres(P, t) {
  const T = t / 1000, X = PRX;
  if (!X.next) X.next = T + 40 + Math.random() * 40;
  if (T > X.next && !X.offUntil) { X.offUntil = T + .5 + Math.random() * .9; X.next = T + 70 + Math.random() * 90; }
  let lit = 1, flick = .8 + .2 * Math.sin(T * 37) * Math.sin(T * 11);
  if ((T * 7.3 % 13) < .12) flick = .1;   // un néon fatigué
  if (X.offUntil) { lit = Math.random() < .25 ? .35 : .02; if (T > X.offUntil) { X.offUntil = 0; if (X.gone) { X.gone = false; X.d = 0; } else { X.d += .14 + Math.random() * .1; if (X.d > .82) { X.gone = true; } } if (X.d > .5 && Math.random() < .5) X.glitch = T; } }
  prCorridor(f, T, {lit, flick, door: X.d > .4 ? Math.min(1, (X.d - .4) * 2) * .6 : 0});
  if (!X.gone && lit > .3) prFigure(f, T, PRV.zf - .6 - X.d * 8.6, {a: .92, eyes: .25 + X.d * .5});
  prNoise(f, T, .07 + (lit < .3 ? .25 : 0));
  /* texte qui se dérègle une fraction de seconde */
  if (X.glitch && T - X.glitch < .35) { const d = $('desc'); if (d && !d.dataset.pg) { d.dataset.pg = d.textContent; d.textContent = ['il est là.', 'derrière toi.', 'ne te retourne pas.', 'il se rapproche.'][Math.random() * 4 | 0]; } }
  else { const d = $('desc'); if (d && d.dataset.pg) { d.textContent = d.dataset.pg; delete d.dataset.pg; } }
}
setInterval(() => { if (HT.id !== 'pres') return; const e = document.querySelector('.pr-ts'); if (e) { const n = clock(); e.textContent = n.toLocaleDateString('fr-FR') + '  ' + [n.getHours(), n.getMinutes(), n.getSeconds()].map(v => String(v).padStart(2, '0')).join(':'); } }, 1000);

/* ===================================================================
   L'animation d'activation (≈ 27 s) — avec LE jumpscare
   =================================================================== */
let presOn = false;
function presCinematic(apply) {
  if (presOn) return false; presOn = true;
  const el = document.createElement('div'); el.id = 'prc';
  el.innerHTML = `<canvas width="800" height="480"></canvas><div class="pr-cosd"><span class="rec">● REC</span> <span class="cam">CAM 01 · HALL</span><span class="ts"></span></div><div class="pr-cmsg"></div>
    <div class="pr-title">${[...'LA PRÉSENCE'].map((c, i) => `<span style="--i:${i}">${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</div><div class="pr-sub">Ne quitte pas l'écran des yeux.</div><div class="pr-skip">touche 2 fois pour passer</div>`;
  stage.appendChild(el); if (typeof cinFX === 'function') cinFX(el, {bars: false});
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), tm = [], at = (s, fn) => tm.push(setTimeout(fn, s * 1000)), T0 = performance.now();
  const music = !PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on ? (AMB.unlock(), AMB.pres()) : null;
  const IMG = {}; if (typeof PRIMG !== 'undefined') ['dog', 'face'].forEach(k => { const im = new Image(); im.src = PRIMG[k]; IMG[k] = im; });
  const ok = im => im && im.complete && im.naturalWidth > 0;
  const $$ = s => el.querySelector(s), osd = $$('.pr-cosd'), cam = $$('.cam'), msg = $$('.pr-cmsg'), say = (s, d = 2) => { msg.textContent = s; msg.classList.add('on'); tm.push(setTimeout(() => msg.classList.remove('on'), d * 1000)); };
  const tsI = setInterval(() => { const n = new Date(); $$('.ts').textContent = n.toLocaleDateString('fr-FR') + '  ' + [n.getHours(), n.getMinutes(), n.getSeconds()].map(v => String(v).padStart(2, '0')).join(':'); }, 250);
  /* 1. les lumières vacillent */
  stage.classList.add('pr-flk');
  at(2.4, () => { stage.classList.remove('pr-flk'); stage.classList.add('pr-hide'); });
  /* 2. le signal revient */
  at(4, () => { el.classList.add('cctv'); say('SIGNAL RÉTABLI', 1.6); });
  at(7, () => cam.textContent = 'CAM 02 · ESCALIER B');
  at(10, () => { cam.textContent = 'CAM 03 · COULOIR B'; });
  at(11.2, () => say('IL T\'A VU', 1.2));
  at(13, () => { el.classList.add('lost'); say('SIGNAL PERDU', 4); });
  /* 3. LE JUMPSCARE */
  const JS = 17.2;
  at(JS, () => el.classList.add('scare'));
  at(JS + .95, () => { if (typeof impactFrames === 'function') impactFrames({host: el, x: 400, y: 220, theme: 'pres', seq: ['a', 'b', 'c'], dt: 45, snd: false, r: 0}); });
  at(JS + 1.1, () => { el.classList.remove('scare', 'cctv', 'lost'); el.classList.add('black'); });
  at(JS + 2.1, () => { say('IL EST TOUJOURS LÀ.', 2.4); });
  at(JS + 4.6, () => el.classList.add('title'));
  const AP = JS + 8.6;
  at(AP - .8, () => el.classList.add('out'));
  at(AP, () => { if (apply && typeof apply === 'function') apply(); stage.classList.remove('pr-hide'); stage.classList.add('pr-in'); PRX.d = 0; PRX.gone = false; });
  const fin = () => { tm.forEach(clearTimeout); clearInterval(tsI); el.remove(); presOn = false; stage.classList.remove('pr-hide', 'pr-in', 'pr-flk'); };
  at(AP + 2.2, fin);
  let last = 0;
  el.addEventListener('pointerdown', e => { e.stopPropagation(); const n = Date.now(); $$('.pr-skip').classList.add('on'); if (n - last < 450) { if (music) music.stop(); tm.forEach(clearTimeout); if (apply && typeof apply === 'function') apply(); stage.classList.remove('pr-hide', 'pr-flk'); el.classList.add('out', 'skip'); setTimeout(fin, 900); } last = n; });
  /* ----- canevas ----- */
  (function frame(nw) {
    if (!el.isConnected) return; requestAnimationFrame(frame); const t = (nw - T0) / 1000;
    try {
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, 800, 480);
      if (t > 2.4 && t < 4) { g.fillStyle = '#000'; g.fillRect(0, 0, 800, 480); return; }
      if (t >= 4 && t < 13) {
        const shot = t < 7 ? 0 : t < 10 ? 1 : 2, e = t - [4, 7, 10][shot];
        g.save(); if (shot === 1) { g.translate(400, 240); g.scale(1.25, 1.25); g.translate(-400, -250); } if (shot === 2) { g.translate(400, 240); g.scale(1.5, 1.5); g.translate(-400, -232); }
        prCorridor(g, t, {lit: 1, flick: .7 + .3 * Math.sin(t * 40), door: shot === 2 ? Math.min(.6, e * .3) : 0});
        prFigure(g, t, [11.4, 7.5, 3.2][shot] - e * [.05, .1, .2][shot], {a: .95, eyes: [.4, .6, .9][shot]});
        g.restore();
        prNoise(g, t, .1 + (e < .25 ? .6 : 0));
        if (shot === 2 && e > 1.15 && e < 1.32 && ok(IMG.face)) { g.globalAlpha = .55; const ih = 480, iw = IMG.face.naturalWidth * ih / IMG.face.naturalHeight; g.drawImage(IMG.face, 400 - iw / 2, 0, iw, ih); g.globalAlpha = 1; }
        if (e < .2) { g.fillStyle = 'rgba(255,255,255,.25)'; for (let k = 0; k < 40; k++) g.fillRect(0, Math.random() * 480, 800, 1 + Math.random() * 3); }
      }
      if (t >= 13 && t < JS) {   // signal perdu : couloir vide, lumières qui meurent
        const e = t - 13, lit = e < 1.2 ? (Math.random() < .5 ? .1 : .8) : Math.max(0, .5 - (e - 1.2) * .12);
        g.save(); g.translate(400, 240); g.scale(1.5, 1.5); g.translate(-400, -232); prCorridor(g, t, {lit, flick: lit, door: .6}); g.restore();
        prNoise(g, t, .12 + (e > 3 ? (e - 3) * .1 : 0));
      }
      if (t >= JS && t < JS + 1.1 && ok(IMG.dog)) {   // le jumpscare, avec les images
        const e = t - JS, sub = (e > .36 && e < .5) || (e > .68 && e < .78), im = sub && ok(IMG.face) ? IMG.face : IMG.dog, z = sub ? 1.15 : 1.02 + e * .42 + Math.sin(e * 60) * .015, jx = (Math.random() - .5) * 28, jy = (Math.random() - .5) * 22;
        g.fillStyle = '#000'; g.fillRect(0, 0, 800, 480);
        const iw = im.naturalWidth, ih = im.naturalHeight, fx = im === IMG.dog ? .665 : .5, fy = im === IMG.dog ? .5 : .32, sc = Math.max(800 / iw, 480 / ih) * z * (im === IMG.dog ? 1.25 : 1.05), dw = iw * sc, dh = ih * sc, dx = 400 - fx * dw + jx, dy = 240 - fy * dh + jy;
        g.globalAlpha = .55; g.drawImage(im, dx - 9, dy, dw, dh); g.drawImage(im, dx + 9, dy + 2, dw, dh); g.globalAlpha = 1; g.drawImage(im, dx, dy, dw, dh);
        g.globalCompositeOperation = 'multiply'; g.fillStyle = sub ? '#9a9a9a' : '#ff6a5a'; g.fillRect(0, 0, 800, 480); g.globalCompositeOperation = 'source-over';
        const vg = g.createRadialGradient(400, 240, 140, 400, 240, 470); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.9)'); g.fillStyle = vg; g.fillRect(0, 0, 800, 480);
        g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < 480; y += 3) g.fillRect(0, y, 800, 1);
        prNoise(g, t, .3); for (let k = 0; k < 10; k++) { const y = Math.random() * 480; g.drawImage(cv, 0, y, 800, 10, (Math.random() - .5) * 70, y, 800, 10); }
      }
      else if (t >= JS && t < JS + .9) {   // le visage (de secours, si les images ne chargent pas)
        const e = t - JS, s = 1 + e * .25, jx = (Math.random() - .5) * 26, jy = (Math.random() - .5) * 20;
        g.fillStyle = '#000'; g.fillRect(0, 0, 800, 480);
        const face = (dx, mono, tint) => { g.save(); g.translate(400 + jx + dx, 238 + jy); g.rotate(-.07 + Math.sin(e * 47) * .025); g.scale(s * .95, s * 1.1);
          g.beginPath(); g.moveTo(0, -250); g.bezierCurveTo(130, -250, 170, -120, 150, -10); g.bezierCurveTo(135, 110, 70, 230, 6, 275); g.bezierCurveTo(-60, 235, -140, 120, -158, -6); g.bezierCurveTo(-176, -130, -120, -250, 0, -250); g.closePath();
          if (!mono) { g.fillStyle = tint; g.fill(); g.restore(); return; }
          const sk = g.createLinearGradient(0, -250, 0, 275); sk.addColorStop(0, '#d6dacf'); sk.addColorStop(.45, '#a3a89b'); sk.addColorStop(1, '#1d201b'); g.fillStyle = sk; g.fill(); g.save(); g.clip();
          const ed = g.createRadialGradient(-20, -40, 60, 0, 0, 260); ed.addColorStop(0, 'rgba(0,0,0,0)'); ed.addColorStop(1, 'rgba(0,0,0,.85)'); g.fillStyle = ed; g.fillRect(-200, -260, 400, 560);
          [[-62, -52, 78], [64, -44, 84]].forEach(([x, y, r]) => { const sg = g.createRadialGradient(x, y, 8, x, y, r); sg.addColorStop(0, 'rgba(0,0,0,1)'); sg.addColorStop(.45, 'rgba(0,0,0,.9)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sg; g.fillRect(x - r, y - r, r * 2, r * 2); });
          g.fillStyle = '#000'; g.beginPath(); g.ellipse(-60, -48, 24, 40, -.25, 0, 6.2832); g.ellipse(64, -40, 26, 44, .3, 0, 6.2832); g.fill();
          g.fillStyle = 'rgba(235,245,235,.95)'; g.beginPath(); g.arc(-56, -42, 2.6, 0, 6.2832); g.fill();   // un seul œil qui brille
          g.fillStyle = 'rgba(0,0,0,.8)'; g.beginPath(); g.ellipse(-12, 40, 5, 12, .3, 0, 6.2832); g.ellipse(12, 42, 5, 12, -.3, 0, 6.2832); g.fill();
          const mh = 120 + e * 90, mg = g.createLinearGradient(0, 80, 0, 80 + mh); mg.addColorStop(0, '#000'); mg.addColorStop(1, '#050505'); g.fillStyle = mg; g.beginPath(); g.moveTo(-26, 92); g.bezierCurveTo(-40, 92 + mh * .5, -22, 92 + mh, 4, 92 + mh); g.bezierCurveTo(30, 92 + mh, 42, 92 + mh * .4, 24, 90); g.quadraticCurveTo(0, 82, -26, 92); g.fill();
          g.strokeStyle = 'rgba(20,22,18,.55)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-30, -200); g.lineTo(-18, -150); g.lineTo(-34, -110); g.moveTo(70, -150); g.lineTo(96, -100); g.lineTo(88, -60); g.moveTo(-110, 40); g.lineTo(-80, 70); g.stroke();
          g.restore(); g.restore(); };
        g.globalCompositeOperation = 'lighter'; face(-10, false, 'rgba(160,20,20,.35)'); face(10, false, 'rgba(20,120,120,.3)'); g.globalCompositeOperation = 'source-over'; face(0, true);
        const vg = g.createRadialGradient(400, 240, 120, 400, 240, 460); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.9)'); g.fillStyle = vg; g.fillRect(0, 0, 800, 480);
        prNoise(g, t, .35); for (let k = 0; k < 12; k++) { const y = Math.random() * 480; g.drawImage(cv, 0, y, 800, 8, (Math.random() - .5) * 60, y, 800, 8); }
      }
      if (t >= JS + 1.1) { g.fillStyle = '#000'; g.fillRect(0, 0, 800, 480); if (t > AP - .8) g.globalAlpha = 1 - Math.min(1, (t - AP + .8) / 1); prNoise(g, t, .05); if (t > AP + .2) g.clearRect(0, 0, 800, 480); }
    } catch (x) { g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; }
  })(T0);
  return true;
}
/* ----- Le style ----- */
Object.assign(SIG, {
  pres: {name: '👁 La Présence', icons: 'line', temp: 'text', noAstro: true, noClouds: true, amb: 'pres',
    deco: () => `<div class="pr-grain" style="background-image:url(${typeof grainURL === 'function' ? grainURL() : ''})"></div><div class="pr-scan"></div>`,
    deco2: '<div class="pr-osd"><span class="rec">● REC</span><span class="pr-ts"></span></div>',
    cin: done => presCinematic(done),
    v: {d: {clear: ['Ciel dégagé. Rien ne bouge. Pour l\'instant.'], clearN: ['Nuit claire. Tu as entendu ce bruit ?'], partly: ['Quelques nuages. Une ombre est passée. Un nuage, sûrement.'], partlyN: ['Des nuages cachent la lune. Il préfère le noir.'], cloudy: ['Ciel couvert. Les couloirs sont vides. Normalement.'], cloudnight: ['Nuit noire. Ne regarde pas le fond du couloir.'], fog: ['Brouillard. Tu ne verras pas qui approche.'], drizzle: ['Bruine. Des pas mouillés sur le carrelage.'], rain: ['La pluie couvre le bruit des pas.'], pour: ['Averse. Personne ne t\'entendra.'], storm: ['Orage. Au prochain éclair, compte les silhouettes.'], hail: ['Grêle. Quelque chose tape aux fenêtres.'], snow: ['Il neige. Les traces de pas s\'arrêtent net.'], blizzard: ['Tempête. Reste à l\'intérieur. Avec lui.'], wind: ['Ce n\'est que le vent. Sûrement.'], heat: ['Chaleur. Pourtant, tu as froid dans le dos.'], frost: ['Gel. Ton souffle fait de la buée. Le sien aussi.'], rainbow: ['Un arc-en-ciel. Il n\'aime pas les couleurs.']},
      kick: c => `CAM 03 · COULOIR B · ${UP(c.city)}`, hl: c => `MAX ${c.mx}° · MIN ${c.mn}°`, mt: c => `ressenti ${c.fe}° · humidité ${c.hu} % · vent ${c.wi} km/h`, day: D3, hr: (h, n) => n ? pad2(h) + 'h' : 'LIVE'}}
});
const PRQ = ['Ne le regarde pas.', 'Il t\'a vu toucher l\'écran.', 'Trop tard.', 'Il n\'aime pas qu\'on le dérange.', 'Chut.'];
stage.addEventListener('pointerdown', e => {
  if (HT.id !== 'pres' || PRX.gone) return; const s = stage.getBoundingClientRect(), k = s.width / 800, x = (e.clientX - s.left) / k, y = (e.clientY - s.top) / k, z = PRV.zf - .6 - PRX.d * 8.6, b = prP(0, PRV.fl, z), tp = prP(0, PRV.fl + 1.85, z);
  if (Math.abs(x - b[0]) < 40 && y > tp[1] - 20 && y < b[1] + 10) { PRX.offUntil = performance.now() / 1000 + .4; PRX.gone = true; if (typeof toast === 'function') toast(PRQ[Math.random() * PRQ.length | 0]); if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on) AMB.one('steps'); }
});
EGGS.prescin = () => presCinematic(HT.id === 'pres');
