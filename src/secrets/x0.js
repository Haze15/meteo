
/* ===================================================================
   ✦ SINGULARITÉ — grande cinématique (≈ 31 s)
   L'interface est aspirée et étirée, le temps ralentit, on traverse l'horizon, trou blanc.
   =================================================================== */
function x0Cinematic(apply) {
  if (x0cOn) return false; x0cOn = true;
  let got = null; try { got = JSON.parse(localStorage.getItem('x0Got') || 'null'); } catch (e) {}
  const el = document.createElement('div'); el.id = 'x0b';
  el.innerHTML = `<canvas width="800" height="480"></canvas><div class="xb-warn"></div><div class="xb-clock"></div><div class="xb-msg"></div>
    <div class="xb-title">${[...'✦ SINGULARITÉ ✦'].map((c, i) => `<span style="--i:${Math.abs(i - 7)}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}</div>
    <div class="xb-sub">STYLE SECRET DÉBLOQUÉ · 1 CHANCE SUR 500${got && got.n ? ` · OBTENU ×${got.n}` : ''}</div><div class="xb-flash"></div><div class="xb-skip">touche 2 fois pour passer</div>`;
  stage.appendChild(el); if (typeof cinFX === 'function') cinFX(el);
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), tm = [], at = (s, fn) => tm.push(setTimeout(fn, s * 1000)), T0 = performance.now(), lite = !!cfg.lite;
  const music = !PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on ? (AMB.unlock(), AMB.x0big()) : null;
  const CX = 400, CY = 220, [ex, ey] = typeof bhPos === 'function' ? bhPos() : [392, 180];
  /* 1. alerte */
  stage.classList.add('x0glitch'); const W = el.querySelector('.xb-warn');
  ['⚠ ANOMALIE GRAVITATIONNELLE DÉTECTÉE', 'masse : ∞ · rayon : 0 m', 'les distances se déforment…'].forEach((l, i) => at(.2 + i * .5, () => { W.innerHTML += esc(l) + '<br>'; }));
  at(2.6, () => stage.classList.remove('x0glitch'));
  /* 2. l'interface est aspirée : chaque bloc est étiré et tourne vers le centre */
  const UI = [...document.querySelectorAll('#stage > header, #now, #days, #hours, #deco2, #deco, #fest, #tick, #eggs, #shelf, #under')].filter(e => e && (e.offsetParent !== null || ['deco', 'eggs', 'shelf', 'under'].includes(e.id)));
  const ST = UI.map((e, i) => { const r = rel(e); return {e, t: e.style.transform, tr: e.style.transition, o: e.style.opacity, f: e.style.filter, cx: r.x + r.w / 2, cy: r.y + r.h / 2, d: i * .35 + Math.random() * .3}; });
  ST.forEach(s => { s.e.style.transition = 'none'; });
  const restore = () => ST.forEach(s => { s.e.style.transform = s.t; s.e.style.transition = s.tr; s.e.style.opacity = s.o; s.e.style.filter = s.f; });
  at(9.2, () => { el.classList.add('dark'); stage.classList.add('x0hide'); restore(); });
  /* 3. le temps ralentit */
  const CK = el.querySelector('.xb-clock'), MS = el.querySelector('.xb-msg');
  at(9.6, () => { el.classList.add('clk'); MS.textContent = 'le temps ralentit…'; });
  at(13.6, () => { el.classList.remove('clk'); MS.textContent = ''; });
  /* 4. traversée */
  at(16.2, () => { MS.textContent = 'HORIZON DES ÉVÉNEMENTS FRANCHI'; MS.classList.add('big'); });
  at(18.6, () => { MS.textContent = ''; MS.classList.remove('big'); });
  /* 5. trou blanc */
  at(22, () => { el.classList.add('flash'); if (typeof impactFrames === 'function') impactFrames({host: el, x: CX, y: CY, snd: false, theme: 'x0', r: 30}); });
  at(23, () => el.classList.add('title'));
  if (apply) at(27.6, () => { if (typeof apply === 'function') apply(); });
  at(28, () => { stage.classList.remove('x0hide'); stage.classList.add('x0emerge'); el.classList.add('out'); });
  const fin = () => { tm.forEach(clearTimeout); restore(); el.remove(); x0cOn = false; stage.classList.remove('x0glitch', 'x0hide', 'x0emerge'); if (typeof BHX !== 'undefined') BHX.flash = performance.now(); };
  at(31, fin);
  let last = 0;
  el.addEventListener('pointerdown', e => { e.stopPropagation(); const n = Date.now(); el.querySelector('.xb-skip').classList.add('on'); if (n - last < 450) { if (music) music.stop(); tm.forEach(clearTimeout); restore(); if (apply && typeof apply === 'function') apply(); stage.classList.remove('x0hide', 'x0glitch'); el.classList.add('out'); setTimeout(fin, 900); } last = n; });
  /* dessin */
  const SK = Array.from({length: lite ? 150 : 320}, () => ({a: Math.random() * 6.283, r: 40 + Math.random() * 520, s: Math.random() * 1.4 + .3, c: Math.random()}));
  const DK = Array.from({length: lite ? 160 : 380}, () => ({a: Math.random() * 6.283, o: 1.45 + Math.pow(Math.random(), 1.5) * 2.8, w: .7 + Math.random() * .3}));
  const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3), eIn = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * x;
  function hole(x, y, R, al, t) {
    if (R < 1) return; const tilt = .24;
    const gl = g.createRadialGradient(x, y, R, x, y, R * 6); gl.addColorStop(0, `rgba(255,190,110,${.32 * al})`); gl.addColorStop(.35, `rgba(150,60,210,${.12 * al})`); gl.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gl; g.fillRect(x - R * 6, y - R * 6, R * 12, R * 12);
    const disk = top => { g.save(); g.beginPath(); g.rect(x - R * 5, top ? y - R * 3 : y, R * 10, R * 3); g.clip(); g.translate(x, y); g.scale(1, tilt); const d = g.createRadialGradient(0, 0, R * 1.35, 0, 0, R * 4.4); d.addColorStop(0, 'rgba(255,245,225,0)'); d.addColorStop(.04, `rgba(255,245,225,${.95 * al})`); d.addColorStop(.22, `rgba(255,180,90,${.75 * al})`); d.addColorStop(.55, `rgba(180,80,150,${.35 * al})`); d.addColorStop(1, 'rgba(120,60,160,0)'); g.fillStyle = d; g.beginPath(); g.arc(0, 0, R * 4.4, 0, 6.2832); g.arc(0, 0, R * 1.35, 0, 6.2832, true); g.fill(); g.restore(); };
    const pts = front => { g.globalCompositeOperation = 'lighter'; DK.forEach(p => { const s = Math.sin(p.a); if ((s >= 0) !== front) return; const px = x + Math.cos(p.a) * p.o * R, py = y + s * p.o * R * tilt, heat = Math.max(0, 1 - (p.o - 1.45) / 2.8), dop = .5 - .5 * Math.cos(p.a); g.fillStyle = `rgba(255,${(170 + 85 * heat) | 0},${(100 + 150 * heat * dop) | 0},${((.25 + .7 * heat) * (.35 + .65 * dop) * al).toFixed(2)})`; g.fillRect(px, py, 2 + R / 16, 1 + R / 90); }); g.globalCompositeOperation = 'source-over'; };
    disk(true); pts(false);
    g.save(); g.translate(x, y); const l = g.createRadialGradient(0, 0, R * 1.02, 0, 0, R * 1.75); l.addColorStop(0, 'rgba(255,240,215,0)'); l.addColorStop(.18, `rgba(255,240,215,${.9 * al})`); l.addColorStop(.5, `rgba(255,180,100,${.45 * al})`); l.addColorStop(1, 'rgba(255,180,100,0)'); g.fillStyle = l; g.beginPath(); g.arc(0, 0, R * 1.75, Math.PI, 0); g.arc(0, 0, R * 1.02, 0, Math.PI, true); g.fill(); g.restore();
    g.save(); g.shadowColor = '#ffb46b'; g.shadowBlur = 10 + R / 3; g.strokeStyle = `rgba(255,245,225,${al})`; g.lineWidth = 1.5 + R / 25; g.beginPath(); g.arc(x, y, R * 1.06, 0, 6.2832); g.stroke(); g.restore();
    g.fillStyle = '#000'; g.beginPath(); g.arc(x, y, R, 0, 6.2832); g.fill(); disk(false); pts(true);
  }
  (function frame(now) {
    if (!el.isConnected) return; requestAnimationFrame(frame); const t = (now - T0) / 1000; g.clearRect(0, 0, 800, 480);
    try {
      /* aspiration (3 → 9,2 s) */
      if (t > 2.6 && t < 9.2) {
        const q = (t - 2.6) / 6.6, R = 6 + eIn(q) * 64;
        g.fillStyle = `rgba(0,0,0,${(q * .75).toFixed(2)})`; g.fillRect(0, 0, 800, 480);
        ST.forEach(s => { const k = eIn(Math.max(0, Math.min(1, (t - 3 - s.d) / 5.2))), dx = CX - s.cx, dy = CY - s.cy, ang = Math.atan2(dy, dx), stretch = 1 + k * 2.6; s.e.style.transform = `translate(${(dx * k).toFixed(1)}px,${(dy * k).toFixed(1)}px) rotate(${(k * 160).toFixed(1)}deg) rotate(${(ang * 57.3).toFixed(1)}deg) scale(${stretch.toFixed(2)},${Math.max(.02, 1 - k).toFixed(3)}) rotate(${(-ang * 57.3).toFixed(1)}deg) ${s.t || ''}`; s.e.style.opacity = String(Math.max(0, 1 - k * 1.05)); s.e.style.filter = `blur(${(k * 3).toFixed(1)}px) brightness(${(1 + k * 1.5).toFixed(2)})`; });
        g.globalCompositeOperation = 'lighter'; SK.forEach(p => { p.r -= .4 + q * 3.5; p.a += .002 + q * .03 + 6 / Math.max(40, p.r) * .02; if (p.r < R * 1.2) p.r = 380 + Math.random() * 200; const x = CX + Math.cos(p.a) * p.r, y = CY + Math.sin(p.a) * p.r * .8; g.strokeStyle = `rgba(230,220,255,${(.25 + q * .5).toFixed(2)})`; g.lineWidth = p.s; g.beginPath(); g.moveTo(x, y); g.lineTo(CX + Math.cos(p.a - .05 - q * .1) * (p.r + 8 + q * 30), CY + Math.sin(p.a - .05 - q * .1) * (p.r + 8 + q * 30) * .8); g.stroke(); }); g.globalCompositeOperation = 'source-over';
        DK.forEach(p => p.a += .03 * Math.pow(1.45 / p.o, 1.5) * p.w * (1 + q * 3)); hole(CX, CY, R, 1, t);
      }
      /* le temps ralentit (9,2 → 14) */
      else if (t >= 9.2 && t < 14) {
        g.fillStyle = '#000'; g.fillRect(0, 0, 800, 480); const q = (t - 9.2) / 4.8, slow = Math.exp(-q * 3);
        DK.forEach(p => p.a += .03 * Math.pow(1.45 / p.o, 1.5) * p.w * slow * 2); hole(CX, CY, 70 + Math.sin(t * 2) * 2, 1, t);
        const sim = 9.6 + (1 - Math.exp(-(t - 9.6) * .9)) * 1.1; if (t > 9.6) CK.textContent = `T + 00:00:${sim.toFixed(3).padStart(6, '0')}`;
      }
      /* traversée de l'horizon (14 → 22) */
      else if (t >= 14 && t < 22) {
        g.fillStyle = '#000'; g.fillRect(0, 0, 800, 480);
        if (t < 16.2) { const q = eIn((t - 14) / 2.2); DK.forEach(p => p.a += .04 * Math.pow(1.45 / p.o, 1.5) * p.w); hole(CX, CY, 70 + q * 900, 1, t); }
        else { const e = t - 16.2, sp = .02 + e * .012; g.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 14; i++) { const z = ((i / 14) + e * (.25 + e * .05)) % 1, r = Math.pow(z, 2.2) * 700; g.strokeStyle = `hsla(${(i * 26 + e * 90) % 360},100%,${55 + z * 25}%,${(z * .8).toFixed(2)})`; g.lineWidth = 1 + z * 6; g.beginPath(); g.ellipse(CX, CY, r, r * .8, e * .3, 0, 6.2832); g.stroke(); }
          SK.forEach(p => { p.r += (3 + p.r * sp); p.a += .01; if (p.r > 700) p.r = 2 + Math.random() * 20; const x = CX + Math.cos(p.a) * p.r, y = CY + Math.sin(p.a) * p.r * .8, l = 4 + p.r * .08; g.strokeStyle = p.c < .3 ? `rgba(255,200,140,.8)` : `rgba(210,220,255,.85)`; g.lineWidth = p.s * (1 + p.r / 300); g.beginPath(); g.moveTo(x, y); g.lineTo(CX + Math.cos(p.a) * (p.r - l), CY + Math.sin(p.a) * (p.r - l) * .8); g.stroke(); });
          const cg = g.createRadialGradient(CX, CY, 0, CX, CY, 60 + e * 40); cg.addColorStop(0, `rgba(255,255,255,${Math.min(1, e / 5.8).toFixed(2)})`); cg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = cg; g.fillRect(0, 0, 800, 480);
          g.globalCompositeOperation = 'source-over'; }
      }
      /* trou blanc, titre, retour (22 → 31) */
      else if (t >= 22) {
        const out = t > 28 ? ease((t - 28) / 2.4) : 0; g.fillStyle = `rgba(0,0,0,${(1 - out).toFixed(2)})`; g.fillRect(0, 0, 800, 480);
        if (t < 25) { const e = (t - 22) / 3; g.globalCompositeOperation = 'lighter'; [0, .12, .26].forEach((o, i) => { const q = (e - o); if (q > 0 && q < 1) { g.strokeStyle = i === 1 ? `rgba(255,210,150,${1 - q})` : `rgba(220,210,255,${1 - q})`; g.lineWidth = 8 * (1 - q) + 1; g.beginPath(); g.ellipse(CX, CY, 30 + q * 620, (30 + q * 620) * .8, 0, 0, 6.2832); g.stroke(); } }); g.globalCompositeOperation = 'source-over'; }
        const q = ease((t - 23) / 2), mv = ease(Math.max(0, (t - 27.5) / 2.6)), R = (5 + q * 60) * (1 - mv) + 34 * mv, x = CX + (ex - CX) * mv, y = (CY - 70) * (1 - mv) + ey * mv;
        DK.forEach(p => p.a += .02 * Math.pow(1.45 / p.o, 1.5) * p.w); if (t > 23) hole(x, y, R, 1 - out * .9, t);
      }
    } catch (x) { g.globalCompositeOperation = 'source-over'; }
  })(T0);
  /* horloge qui ralentit : on la remet à jour en dehors du canevas aussi */
}
