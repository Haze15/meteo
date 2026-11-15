
/* ===================================================================
   SONS D'AMBIANCE — tout est synthétisé en direct (aucun fichier audio)
   Pluie, gouttes, grêle, vent, tonnerre, oiseaux, grillons, chouette,
   vagues, ville, nappe vaporwave, clavier, carillon japonais.
   =================================================================== */
const AMB = (() => {
  let C = null, M = null, NB = null, BB = null, vol = 0, lite = false, iv = null, chordI = 0;
  const ch = {}, lvl = {}, ev = {};
  const A = () => window.AudioContext || window.webkitAudioContext;
  const now = () => C.currentTime;
  const R = (a, b) => a + Math.random() * (b - a);
  function init() {
    if (C) return C; const K = A(); if (!K) return null;
    try { C = new K(); } catch (e) { return null; }
    const comp = C.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
    M = C.createGain(); M.gain.value = 0; M.connect(comp); comp.connect(C.destination);
    NB = C.createBuffer(1, C.sampleRate * 2, C.sampleRate); const w = NB.getChannelData(0); for (let i = 0; i < w.length; i++) w[i] = Math.random() * 2 - 1;
    BB = C.createBuffer(1, C.sampleRate * 5, C.sampleRate); const b = BB.getChannelData(0); let l = 0; for (let i = 0; i < b.length; i++) { l = (l + .02 * (Math.random() * 2 - 1)) / 1.02; b[i] = l * 3.5; }
    iv = setInterval(tickEv, 100);
    return C;
  }
  const G = v => { const g = C.createGain(); g.gain.value = v; return g; };
  const F = (type, f, q) => { const x = C.createBiquadFilter(); x.type = type; x.frequency.value = f; if (q != null) x.Q.value = q; return x; };
  const P = v => { if (!C.createStereoPanner) return G(1); const p = C.createStereoPanner(); p.pan.value = v; return p; };
  const link = (...n) => { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[0]; };
  const src = (buf, loop = true) => { const s = C.createBufferSource(); s.buffer = buf; s.loop = loop; return s; };
  const ramp = (p, v, tc = .9) => { p.cancelScheduledValues(now()); p.setTargetAtTime(v, now(), tc); };

  /* ----- Sons continus (créés à la demande, puis gardés) ----- */
  const BUILD = {
    rain() { const o = G(0), s = src(NB), s2 = src(BB); link(s, F('highpass', 500), F('lowpass', 7000), G(.55), o); link(s2, F('lowpass', 1100), G(.6), o); o.connect(M); s.start(0, R(0, 1.9)); s2.start(0, R(0, 4)); return {o}; },
    wind() { const o = G(0), bp = F('bandpass', 420, .7), s = src(NB), g = G(1); link(s, bp, g, o); o.connect(M); s.start(0, R(0, 1.9)); return {o, bp, g}; },
    sea() { const o = G(0), g = G(.4), s = src(BB); link(s, F('lowpass', 700), g, o); o.connect(M); s.start(); return {o, g}; },
    city() { const o = G(0), s = src(BB), h = C.createOscillator(); h.frequency.value = 55; link(s, F('lowpass', 180), G(1), o); link(h, G(.035), o); o.connect(M); s.start(); h.start(); return {o}; },
    pad() {
      const o = G(0), lp = F('lowpass', 900, 2), lfo = C.createOscillator(), lg = G(380); lfo.frequency.value = .07; link(lfo, lg); lg.connect(lp.frequency); lfo.start();
      const osc = [0, 1, 2, 3].map(i => { const x = C.createOscillator(); x.type = i % 2 ? 'sawtooth' : 'triangle'; x.detune.value = (i - 1.5) * 9; link(x, G(.16), lp); x.start(); return x; });
      link(lp, o); o.connect(M); return {o, osc};
    },
    drone() { const o = G(0), lp = F('lowpass', 160, 1.5), s = src(BB), lfo = C.createOscillator(), lg = G(70); lfo.frequency.value = .05; link(lfo, lg); lg.connect(lp.frequency); lfo.start(); link(s, lp, G(.9), o); [[41.2, 'sine', .5], [41.6, 'sine', .45], [61.7, 'triangle', .12], [82.4, 'sine', .08]].forEach(([fq, ty, v]) => { const x = C.createOscillator(); x.type = ty; x.frequency.value = fq; link(x, G(v), o); x.start(); }); o.connect(M); s.start(); return {o}; },
    train() { const o = G(0), s = src(BB), h = C.createOscillator(); h.frequency.value = 46; link(s, F('lowpass', 200), G(1), o); link(h, G(.05), o); o.connect(M); s.start(); h.start(); return {o}; },
    deep() { const o = G(0), lp = F('lowpass', 150, 1.2), s = src(BB), lfo = C.createOscillator(), lg = G(60), h = C.createOscillator(), h2 = C.createOscillator(); lfo.frequency.value = .04; link(lfo, lg); lg.connect(lp.frequency); lfo.start(); link(s, lp, G(1), o); h.frequency.value = 36.7; h2.frequency.value = 55.2; link(h, G(.06), o); link(h2, G(.025), o); o.connect(M); s.start(); h.start(); h2.start(); return {o}; },
    snow() { const o = G(0), s = src(NB); link(s, F('lowpass', 380), F('highpass', 90), G(.5), o); o.connect(M); s.start(0, R(0, 1.9)); return {o}; }
  };
  const CH = (k) => ch[k] || (ch[k] = BUILD[k]());

  /* ----- Sons ponctuels ----- */
  function blip(f0, f1, dur, vl, type = 'sine', pan = 0, at = 0) {
    const t = now() + at, o = C.createOscillator(), g = G(0); o.type = type;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vl, t + Math.min(.02, dur / 4)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    link(o, g, P(pan), M); o.start(t); o.stop(t + dur + .05);
  }
  function tick(f, q, dur, vl, pan = R(-.8, .8), at = 0) {
    const t = now() + at, s = src(NB, false), g = G(0);
    g.gain.setValueAtTime(vl, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    link(s, F('bandpass', f, q), g, P(pan), M); s.start(t, R(0, 1.8)); s.stop(t + dur + .02);
  }
  const ONE = {
    drop: v => tick(R(1800, 5200), R(4, 9), R(.012, .03), .5 * v),
    hail: v => { tick(R(2500, 6000), 3, .02, 1.1 * v); if (Math.random() < .4) tick(R(900, 1600), 5, .04, .5 * v); },
    bird: () => { const p = R(-.9, .9), n = 2 + (Math.random() * 5 | 0), base = R(2200, 4200); let at = 0; for (let i = 0; i < n; i++) { const d = R(.05, .13); blip(base * R(.85, 1.15), base * R(1.1, 1.6), d, .09, 'sine', p, at); at += d + R(.02, .09); } },
    cricket: () => { const p = R(-.7, .7), f = R(4200, 4800); for (let r = 0; r < 3; r++) for (let i = 0; i < 3; i++) blip(f, f * .98, .028, .035, 'sine', p, r * .32 + i * .045); },
    owl: () => { const p = R(-.6, .6); blip(410, 380, .55, .13, 'sine', p); blip(400, 370, .28, .1, 'sine', p, .9); blip(410, 360, .7, .12, 'sine', p, 1.25); },
    chime: (v = 1) => { const S = [1568, 1760, 2093, 2349, 2637, 3136], f = S[Math.random() * S.length | 0], p = R(-.5, .5); [[1, .1], [2.76, .045], [5.4, .02]].forEach(([m, a]) => blip(f * m, f * m * .998, R(1.8, 3), a * v, 'sine', p)); },
    key: () => tick(R(2400, 4200), 6, .012, .22, R(-.3, .3)),
    startup: () => { [[261.6, 0], [329.6, .14], [392, .28], [523.3, .42], [784, .7]].forEach(([f, at], i) => { blip(f, f, 2.4, .07, 'sine', (i - 2) * .25, at); blip(f * 2, f * 2, 1.6, .02, 'triangle', 0, at); }); },
    rtick: () => { tick(3800, 3, .012, .45, 0); blip(1900, 1500, .03, .05, 'square'); },
    win: () => { [523.3, 659.3, 784, 1046.5].forEach((f, i) => blip(f, f, .5, .08, 'triangle', 0, i * .09)); },
    jackpot: () => { [523.3, 659.3, 784, 1046.5, 1318.5, 1568].forEach((f, i) => { blip(f, f, 1.2, .08, 'triangle', (i % 2 ? .4 : -.4), i * .08); blip(f * 2, f * 2, .8, .02, 'sine', 0, i * .08); }); },
    ping: () => { blip(1318, 1310, 2.2, .05, 'sine', -.3); blip(1318, 1305, 1.8, .025, 'sine', .3, .45); blip(659, 655, 2.5, .03, 'sine', 0, .02); },
    x0cin: () => {
      const sw = (type, f0, f1, at, dur, v, lp) => { const t = now() + at, o = C.createOscillator(), gg = G(0); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(v, t + dur * .85); gg.gain.linearRampToValueAtTime(0, t + dur); const ch = lp ? link(o, F('lowpass', lp), gg) : link(o, gg); gg.connect(M); o.start(t); o.stop(t + dur + .05); };
      const nz = (at, dur, v, f0, f1, type = 'lowpass', buf = BB, fade = 'up') => { const t = now() + at, s = src(buf, true), fl = F(type, f0, 1.2), gg = G(0); fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + dur); if (fade === 'up') { gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(v, t + dur * .9); gg.gain.linearRampToValueAtTime(0, t + dur); } else { gg.gain.setValueAtTime(v, t); gg.gain.exponentialRampToValueAtTime(.0001, t + dur); } link(s, fl, gg, M); s.start(t, Math.random()); s.stop(t + dur + .05); };
      for (let i = 0; i < 9; i++) tick(R(400, 5000), 2, R(.03, .12), .5, R(-.8, .8), R(0, 1.2));   // parasites
      nz(.9, 3, .9, 70, 700); sw('sine', 32, 75, .9, 3, .35); sw('sine', 1800, 6200, 1.6, 2.3, .03);   // aspiration
      nz(3.9, 2.6, 1.1, 1400, 90, 'lowpass', NB, 'down'); sw('sine', 70, 28, 3.9, 2.8, .0001); { const t = now() + 3.9, o = C.createOscillator(), gg = G(0); o.frequency.setValueAtTime(62, t); o.frequency.exponentialRampToValueAtTime(26, t + 2.6); gg.gain.setValueAtTime(.7, t); gg.gain.exponentialRampToValueAtTime(.0001, t + 2.8); link(o, gg, M); o.start(t); o.stop(t + 2.9); }   // effondrement
      nz(4.3, 1.8, .35, 300, 2600, 'bandpass', NB);   // tourbillon
      [261.6, 392, 493.9, 587.3, 740].forEach((fq, i) => { const t = now() + 6 + i * .06, o = C.createOscillator(), o2 = C.createOscillator(), gg = G(0); o.frequency.value = fq; o2.frequency.value = fq * 1.004; o2.type = 'triangle'; gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(.045, t + .9); gg.gain.setValueAtTime(.045, t + 1.8); gg.gain.linearRampToValueAtTime(0, t + 2.9); link(o, gg); link(o2, G(.4), gg); gg.connect(P((i - 2) * .3)); gg.connect(M); o.start(t); o2.start(t); o.stop(t + 3); o2.stop(t + 3); });
      [1568, 2093, 2637, 3136, 2349, 1760].forEach((fq, i) => blip(fq, fq, 1.2, .025, 'sine', R(-.6, .6), 6.1 + i * .13));   // étincelles
    },
    vault: () => { for (let i = 0; i < 10; i++) tick(R(2600, 3400), 8, .015, .5, 0, .2 + i * .09); [1.25, 1.45, 1.65, 1.85].forEach(at => { tick(900, 3, .06, .9, 0, at); blip(140, 60, .18, .25, 'triangle', 0, at); }); { const t = now() + 2.1, s = src(BB, false), gg = G(0); gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(.8, t + .3); gg.gain.exponentialRampToValueAtTime(.0001, t + 1.4); link(s, F('lowpass', 500), gg, M); s.start(t, Math.random()); s.stop(t + 1.5); } blip(80, 40, .6, .4, 'sine', 0, 2.1); [523.3, 659.3, 784, 1046.5].forEach((f, i) => blip(f, f, .7, .07, 'triangle', 0, 2.9 + i * .08)); },
    chest: () => { [0, .12, .24].forEach(at => tick(700, 4, .05, .5, 0, at)); [392, 523.3, 659.3, 784, 1046.5].forEach((f, i) => blip(f, f, .55, .07, 'triangle', 0, .55 + i * .11)); [1568, 2093, 2637].forEach((f, i) => blip(f, f * 1.01, 1.2, .03, 'sine', (i - 1) * .4, 1.2 + i * .07)); },
    ykalert: () => { [0, .18, .36].forEach(at => { blip(1760, 1760, .1, .07, 'square', 0, at); blip(2350, 2350, .08, .05, 'square', 0, at + .09); }); },
    ykpop: () => { blip(300, 900, .14, .14, 'sine'); blip(900, 600, .2, .06, 'triangle', 0, .12); },
    boing: () => { blip(240, 720, .16, .14, 'triangle'); blip(720, 380, .2, .08, 'sine', 0, .14); },
    shiny: () => { [2637, 3136, 3951, 4699, 5274].forEach((f, i) => { [[1, .035], [2.76, .012]].forEach(([m, a]) => blip(f * m, f * m * .998, 1.2, a, 'sine', (i - 2) * .35, .05 + i * .07)); }); },
    steps: () => { const p = R(-.7, .7); for (let i = 0; i < 3; i++) { const at = i * .55 + R(0, .05), t = now() + at, sb = src(BB, false), g = G(0); g.gain.setValueAtTime(.22, t); g.gain.exponentialRampToValueAtTime(.0001, t + .16); link(sb, F('lowpass', 420), g, P(p), M); sb.start(t, R(0, 4)); sb.stop(t + .2); } },
    clack: (v = 1) => { tick(900, 3, .05, .55 * v, -.2); tick(700, 3, .05, .5 * v, .2, .13); blip(120, 60, .08, .12 * v, 'sine', 0); },
    whistle: () => { [523.3, 659.3, 784].forEach(f => { const t = now(), o = C.createOscillator(), g = G(0), lf = C.createOscillator(), lg = G(6); o.type = 'triangle'; o.frequency.value = f; lf.frequency.value = 5.5; link(lf, lg); lg.connect(o.frequency); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .1); g.gain.setValueAtTime(.05, t + .9); g.gain.linearRampToValueAtTime(0, t + 1.2); link(o, F('bandpass', f * 1.5, .8), g, M); o.start(t); lf.start(t); o.stop(t + 1.3); lf.stop(t + 1.3); }); },
    sonar: () => { const p = R(-.3, .3); [0, .46, .92, 1.38].forEach((d, i) => blip(1180, 1172, .55, .05 * Math.pow(.42, i), 'sine', p * (i % 2 ? -1 : 1), d)); },
    whale: () => { const p = R(-.6, .6), t = now(), o = C.createOscillator(), o2 = C.createOscillator(), g = G(0), lf = C.createOscillator(), lg = G(7); o.type = 'sine'; o2.type = 'triangle'; o.frequency.setValueAtTime(R(180, 260), t); o.frequency.exponentialRampToValueAtTime(R(420, 560), t + 1.4); o.frequency.exponentialRampToValueAtTime(R(240, 320), t + 3.2); o2.frequency.value = 0; lf.frequency.value = 5; link(lf, lg); lg.connect(o.frequency); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .6); g.gain.setValueAtTime(.05, t + 2.4); g.gain.linearRampToValueAtTime(0, t + 3.3); link(o, F('lowpass', 900), g, P(p), M); o.start(t); lf.start(t); o.stop(t + 3.4); lf.stop(t + 3.4); },
    bubble: () => { const p = R(-.8, .8), n = 2 + (Math.random() * 5 | 0); for (let i = 0; i < n; i++) { const f0 = R(300, 700); blip(f0, f0 * R(1.6, 2.4), R(.04, .08), .035, 'sine', p, i * R(.05, .14)); } },
    impact: () => { const t = now(), o = C.createOscillator(), g = G(0); o.frequency.setValueAtTime(160, t); o.frequency.exponentialRampToValueAtTime(30, t + .5); g.gain.setValueAtTime(.9, t); g.gain.exponentialRampToValueAtTime(.0001, t + .6); link(o, g, M); o.start(t); o.stop(t + .65); tick(2500, .7, .18, 1, 0); tick(600, .8, .3, .9, 0); },
    siren: () => { const t = now(), o = C.createOscillator(), g = G(0), lfo = C.createOscillator(), lg = G(140); o.frequency.value = 760; lfo.frequency.value = .55; link(lfo, lg); lg.connect(o.frequency); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.02, t + 2); g.gain.linearRampToValueAtTime(0, t + 6); link(o, F('lowpass', 1300), g, P(R(-1, 1)), M); o.start(t); lfo.start(t); o.stop(t + 6.2); lfo.stop(t + 6.2); }
  };
  function thunder(near = Math.random()) {
    if (!C || !vol || lvl.thunder === 0) return;
    const at = (1 - near) * 2.5 + .25, t = now() + at, s = src(BB, false), lp = F('lowpass', 900), g = G(0), dur = R(3.5, 7), v = (lvl.thunder || 1) * (.45 + near * .6);
    lp.frequency.setValueAtTime(near > .6 ? 2200 : 900, t); lp.frequency.exponentialRampToValueAtTime(110, t + dur * .8);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + R(.08, .4)); g.gain.setTargetAtTime(v * .55, t + .6, .4); g.gain.linearRampToValueAtTime(v * R(.5, .9), t + R(1.2, 2)); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    link(s, lp, g, P(R(-.6, .6)), M); s.start(t, R(0, 1)); s.stop(t + dur + .1);
    if (near > .55) { const c = src(NB, false), cg = G(0); cg.gain.setValueAtTime(.7 * v, t); cg.gain.exponentialRampToValueAtTime(.0001, t + .25); link(c, F('highpass', 1200), cg, M); c.start(t, R(0, 1.5)); c.stop(t + .3); }
  }
  /* ----- ∞ : partition générative d'une minute ----- */
  function infScore() {
    const T0 = now() + .05, bus = G(1); bus.connect(M);
    const osc = (type, f0, f1, at, dur, v, att = .02, pan = 0, ramp = 'exp') => { const t = T0 + at, o = C.createOscillator(), g = G(0); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) (ramp === 'exp' ? o.frequency.exponentialRampToValueAtTime(f1, t + dur) : o.frequency.linearRampToValueAtTime(f1, t + dur)); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + att); g.gain.setTargetAtTime(0, t + Math.max(att, dur * .7), dur * .15); link(o, g, P(pan), bus); o.start(t); o.stop(t + dur + .5); };
    const pad = (fs, at, dur, v, att = 1.2) => fs.forEach((f, i) => { const t = T0 + at; [0, 7].forEach((det, j) => { const o = C.createOscillator(), g = G(0), lp = F('lowpass', 1400); o.type = j ? 'sawtooth' : 'triangle'; o.frequency.value = f; o.detune.value = det - 3; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v * (j ? .35 : 1), t + att); g.gain.setValueAtTime(v * (j ? .35 : 1), t + dur - .8); g.gain.linearRampToValueAtTime(0, t + dur); link(o, lp, g, P((i - fs.length / 2) * .2), bus); o.start(t); o.stop(t + dur + .1); }); });
    const noise = (type, f0, f1, at, dur, v, shape = 'up', buf = NB) => { const t = T0 + at, s = src(buf, true), fl = F(type, f0, 1.4), g = G(0); fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + dur); if (shape === 'up') { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + dur * .95); g.gain.linearRampToValueAtTime(0, t + dur); } else { g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); } link(s, fl, g, bus); s.start(t, Math.random()); s.stop(t + dur + .05); };
    const kick = (at, v = .8) => { osc('sine', 130, 38, at, .32, v, .005); noise('lowpass', 900, 120, at, .08, v * .5, 'down'); };
    const hit = at => { kick(at, 1); osc('sine', 60, 24, at, 3, .7, .005); noise('lowpass', 3000, 80, at, 2.6, 1, 'down', BB); noise('highpass', 3000, 9000, at, 3.2, .35, 'down'); };
    const Am = [110, 130.8, 164.8, 220], Fm = [87.3, 110, 130.8, 174.6], Cm = [130.8, 164.8, 196, 261.6], Gm = [98, 123.5, 146.8, 196];
    /* acte 1 : la réalité se fissure */
    for (let i = 0; i < 26; i++) { const at = Math.random() * 4.4; osc('square', 200 + Math.random() * 3000, 100 + Math.random() * 600, at, .04 + Math.random() * .08, .05, .002, Math.random() * 2 - 1); }
    noise('lowpass', 50, 400, 0, 4.6, .9, 'up', BB); hit(4.6);
    /* acte 2 : battements de cœur + compte à rebours */
    let t = 5.2, gap = 1.0; while (t < 12) { kick(t, .9); kick(t + .22, .55); osc('sine', 1760, 1760, t, .09, .05, .003); t += gap; gap = Math.max(.5, gap * .93); }
    pad([55, 82.4], 5, 7.2, .07, 3);
    /* acte 3 : l'hyperespace — riser + arpège qui accélère */
    noise('bandpass', 200, 6000, 12, 10, .35); pad(Am, 12, 5, .05); pad(Fm, 17, 5, .05);
    const arp = [220, 261.6, 329.6, 440, 523.3, 440, 329.6, 261.6]; let a = 12, n = 0; while (a < 32) { const rate = 4 + (a - 12) * .5; osc('triangle', arp[n % 8] * (a > 22 ? 2 : 1), arp[n % 8] * (a > 22 ? 2 : 1), a, .18, .045, .005, (n % 2 ? .4 : -.4)); a += 1 / rate; n++; }
    for (let b = 12; b < 22; b += 1) kick(b, .5);
    /* acte 4 : la spirale — grille Am F C G */
    [[Am, 22], [Fm, 24.5], [Cm, 27], [Gm, 29.5]].forEach(([ch, at]) => pad(ch, at, 2.6, .06, .4));
    for (let b = 22; b < 32; b += .5) kick(b, .6);
    /* acte 5 : montée finale */
    noise('highpass', 400, 9000, 32, 8, .5); osc('sine', 120, 2400, 32, 8, .12, 6, 0); osc('sawtooth', 60, 480, 32, 8, .04, 7, 0);
    let s = 32, sg = .25; while (s < 40) { noise('bandpass', 1800, 2200, s, .06, .35, 'down'); s += sg; sg = Math.max(.03, sg * .92); }
    for (let b = 32; b < 40; b += .25) kick(b, .45 + (b - 32) * .05);
    /* acte 6 : silence… puis le point */
    osc('sine', 2093, 2093, 41, 1.2, .04, .01);
    /* acte 7 : l'explosion ∞ */
    hit(42); pad([65.4, 130.8, 164.8, 196, 293.7, 392, 523.3], 42, 13, .055, 1.5);
    [1568, 2093, 2349, 2637, 3136, 3520, 4186].forEach((f, i) => osc('sine', f, f, 42.4 + i * .18, 1.6, .03, .01, (i % 2 ? .6 : -.6)));
    /* acte 8 : thème final, arpège lumineux en do majeur */
    const fin = [523.3, 659.3, 784, 1046.5, 784, 659.3]; for (let i = 0; i < 40; i++) osc('triangle', fin[i % 6], fin[i % 6], 46 + i * .25, .5, .03 * (1 - i / 48), .01, Math.sin(i) * .5);
    pad([130.8, 196, 261.6, 329.6], 50, 9, .045, 2);
    return {stop() { bus.gain.cancelScheduledValues(now()); bus.gain.setTargetAtTime(0, now(), .15); setTimeout(() => { try { bus.disconnect(); } catch (e) {} }, 1500); }};
  }
  /* ----- outils communs aux grandes cinématiques ----- */
  function kit(T0, bus) {
    const osc = (type, f0, f1, at, dur, v, att = .01, pan = 0) => { const t = T0 + at, o = C.createOscillator(), g = G(0); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + att); g.gain.setTargetAtTime(0, t + Math.max(att, dur * .6), dur * .2); link(o, g, P(pan), bus); o.start(t); o.stop(t + dur + .8); };
    const nz = (type, f0, f1, at, dur, v, shape = 'down', buf = NB, q = 1) => { const t = T0 + at, s = src(buf, true), fl = F(type, f0, q), g = G(0); fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + dur); if (shape === 'up') { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + dur * .95); g.gain.linearRampToValueAtTime(0, t + dur); } else if (shape === 'swell') { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + dur * .5); g.gain.linearRampToValueAtTime(0, t + dur); } else { g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); } link(s, fl, g, bus); s.start(t, Math.random()); s.stop(t + dur + .05); };
    const pad = (fs, at, dur, v, att = 1.2, type = 'triangle') => fs.forEach((f, i) => { const t = T0 + at, o = C.createOscillator(), o2 = C.createOscillator(), g = G(0); o.type = type; o.frequency.value = f; o2.frequency.value = f * 1.003; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + att); g.gain.setValueAtTime(v, t + Math.max(att, dur - 1)); g.gain.linearRampToValueAtTime(0, t + dur); link(o, g); link(o2, G(.5), g); g.connect(P((i - fs.length / 2) * .18)).connect(bus); o.start(t); o2.start(t); o.stop(t + dur + .1); o2.stop(t + dur + .1); });
    const bell = (f, at, v = .06, dur = 4, pan = 0) => [[1, 1], [2.76, .4], [5.4, .18], [8.9, .08]].forEach(([m, a]) => osc('sine', f * m, f * m * .999, at, dur / Math.sqrt(m), v * a, .004, pan));
    const stop = () => { bus.gain.cancelScheduledValues(now()); bus.gain.setTargetAtTime(0, now(), .12); setTimeout(() => { try { bus.disconnect(); } catch (e) {} }, 1500); };
    return {osc, nz, pad, bell, stop};
  }
  /* ----- Supernova (≈ 21 s) : géante rouge, battements de cœur, effondrement, fissures, explosion, accord majeur ----- */
  let SHAPE = null;
  const crunch = () => { if (SHAPE) return SHAPE; const n = 1024, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = Math.tanh(x * 3.2); } return SHAPE = c; };
  function novaScore() {
    const T0 = now() + .03, bus = G(1); bus.connect(M); const {osc, nz, pad, bell, stop} = kit(T0, bus);
    const ws = C.createWaveShaper(); ws.curve = crunch(); const dist = G(.55); link(ws, F('lowpass', 2400), dist, bus);
    const brass = (fs, at, dur, v, f0 = 300, f1 = 3200) => fs.forEach((f, i) => { const t = T0 + at, lp = F('lowpass', f0, 3), g = G(0); lp.frequency.setValueAtTime(f0, t); lp.frequency.exponentialRampToValueAtTime(f1, t + 1.6); lp.frequency.exponentialRampToValueAtTime(f1 * .5, t + dur); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .35); g.gain.setValueAtTime(v, t + dur - 1.6); g.gain.linearRampToValueAtTime(0, t + dur); link(lp, g, P((i - fs.length / 2) * .22), bus); [-8, 0, 8].forEach(d => { const o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; link(o, G(.33), lp); o.start(t); o.stop(t + dur + .1); }); });
    const heart = (at, v) => { [0, .2].forEach((d, k) => { osc('sine', 78, 34, at + d, .32, v * (k ? .6 : 1), .006); nz('lowpass', 260, 60, at + d, .16, v * .5 * (k ? .6 : 1), 'down', BB); }); };
    const timp = (at, f, v = .6) => { osc('sine', f * 1.5, f, at, 1.6, v, .004); osc('triangle', f * 2.02, f * 2, at, .9, v * .2, .004); nz('lowpass', 1200, 90, at, .4, v * .5, 'down', BB); };
    const glassTick = (at, v) => { nz('bandpass', 2400 + Math.random() * 4000, 1800 + Math.random() * 3000, at, .05, v, 'down', NB, 14); };
    /* 1. tremblement + parasites numériques, puis extinction du téléviseur */
    nz('lowpass', 40, 260, 0, 1.3, .9, 'up', BB);
    for (let i = 0; i < 20; i++) { const t = T0 + .4 + Math.random() * .8, o = C.createOscillator(), g = G(0); o.type = 'square'; o.frequency.setValueAtTime(80 + Math.random() * 900, t); g.gain.setValueAtTime(.12, t); g.gain.setValueAtTime(0, t + .03 + Math.random() * .06); link(o, g, ws); o.start(t); o.stop(t + .12); }
    osc('sine', 2600, 40, 1.2, .55, .16, .003); nz('highpass', 4000, 9000, 1.2, .25, .25); osc('sine', 60, 30, 1.75, .35, .5, .003);
    /* 2. le noir : bourdon grave en ré mineur, souffle, et le cœur de l'étoile */
    pad([36.7, 73.4], 2.2, 6, .1, 1.5, 'sine'); pad([146.8, 174.6, 220], 2.6, 5.4, .022, 2.5, 'sawtooth');
    osc('sine', 2349, 2349, 3, 4.4, .008, 2);   // sifflement glacé
    [2.9, 3.85, 4.7, 5.45, 6.1, 6.65, 7.1].forEach((b, i) => heart(b, .45 + i * .07));
    /* 3. effondrement : souffle inversé, aspiration… puis silence */
    nz('highpass', 300, 7000, 6.6, .85, .5, 'up'); osc('sine', 520, 28, 7.45, .6, .6, .003); nz('lowpass', 3000, 50, 7.45, .55, .7, 'down', BB);
    osc('sine', 5274, 5274, 8.05, .6, .006, .05);   // acouphène
    /* 4. retour du courant : bourdonnement électrique + fissures de glace */
    { const t = T0 + 8.7, o = C.createOscillator(), g = G(0); o.type = 'sawtooth'; o.frequency.value = 50; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.09, t + .08); g.gain.setValueAtTime(.09, t + 4.3); g.gain.linearRampToValueAtTime(0, t + 4.5); link(o, g, ws); o.start(t); o.stop(t + 4.6); }
    const iceCrack = (at, big) => { nz('highpass', 2500, 7000, at, .12, big ? 1 : .7); for (let i = 0; i < (big ? 18 : 9); i++) glassTick(at + Math.random() * (big ? .6 : .3), .25 + Math.random() * .3); bell(big ? 523.3 : 784, at + .02, big ? .05 : .035, 2.2, Math.random() - .5); osc('sawtooth', 110, 55, at, .3, big ? .14 : .08, .004); };
    iceCrack(9.4, false); iceCrack(10.45, false); iceCrack(11.55, true);
    /* 5. montée : glissando + battements devenus trémolo */
    nz('lowpass', 80, 3000, 11.6, 1.6, 1, 'up', BB); osc('sawtooth', 110, 880, 11.6, 1.6, .05, 1.5); osc('sine', 220, 1760, 11.8, 1.4, .06, 1.2);
    for (let b = 11.7, g2 = .2; b < 13.15; b += g2, g2 = Math.max(.045, g2 * .82)) osc('sine', 90, 40, b, .12, .3, .004);
    /* 6. EXPLOSION (13.2 s) */
    const X = 13.2;
    { const t = T0 + X, o = C.createOscillator(), g = G(0); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(18, t + 5); g.gain.setValueAtTime(1.2, t); g.gain.exponentialRampToValueAtTime(.0001, t + 5.2); link(o, g, ws); o.start(t); o.stop(t + 5.3); }
    osc('sine', 55, 20, X, 5, 1, .003); nz('lowpass', 7000, 40, X, 5.5, 1.3, 'down', BB); nz('highpass', 1500, 9000, X, 3.8, .55, 'down');
    for (let i = 0; i < 46; i++) glassTick(X + .05 + Math.pow(Math.random(), 1.6) * 2.6, .1 + Math.random() * .3);   // pluie d'éclats
    nz('bandpass', 300, 2500, X + .2, 2.2, .35, 'swell', NB, .8);
    /* 7. le titre : accord de ré MAJEUR (la lumière après la mort), timbales */
    brass([73.4, 110, 146.8, 185, 220, 293.7], X + 1.6, 6.4, .05); timp(X + 1.6, 73.4, .7); timp(X + 2.05, 73.4, .5); timp(X + 2.3, 110, .55);
    [1174.7, 1480, 1760, 2349.3, 2960, 3520].forEach((f, i) => bell(f, X + 2.2 + i * .23, .022, 2.6, i % 2 ? .55 : -.55));
    for (let p = X + 3.4; p < X + 7.2; p += .5) { osc('sine', 3136, 3100, p, .05, .035, .002, -.4); osc('sine', 3136, 3100, p + .1, .05, .02, .002, .4); }   // pulsar
    /* 8. reconstruction */
    nz('bandpass', 300, 6000, X + 5.4, 1, .3, 'up', NB, 2); bell(293.7, X + 6, .06, 4); bell(440, X + 6.12, .04, 3.5); bell(587.3, X + 6.24, .04, 3.2);
    return {stop};
  }
  /* ----- ◈ Tesseract v2 (≈ 43 s) : 2D→0D, puis 0D→4D, les 4 plans, plongée, patron, retour ----- */
  function tesScore() {
    const T0 = now() + .03, bus = G(1); bus.connect(M); const {osc, nz, pad, bell, stop} = kit(T0, bus);
    const shepard = (at, dur, per, v) => { const N = 6, life = per * N, curve = new Float32Array(64); for (let i = 0; i < 64; i++) curve[i] = Math.pow(Math.sin(i / 63 * Math.PI), 2) * v;
      for (let s = at - life + per; s < at + dur; s += per) { const t0 = Math.max(s, at), t1 = Math.min(s + life, at + dur); if (t1 - t0 < .05) continue; const p0 = (t0 - s) / life, p1 = (t1 - s) / life, t = T0 + t0, o = C.createOscillator(), g = G(0), o2 = C.createOscillator(); o.frequency.setValueAtTime(40 * Math.pow(64, p0), t); o.frequency.exponentialRampToValueAtTime(40 * Math.pow(64, p1), T0 + t1); o2.type = 'triangle'; o2.frequency.setValueAtTime(80 * Math.pow(64, p0), t); o2.frequency.exponentialRampToValueAtTime(80 * Math.pow(64, p1), T0 + t1);
        const sub = curve.slice(Math.floor(p0 * 63), Math.max(Math.floor(p0 * 63) + 2, Math.ceil(p1 * 63) + 1)); try { g.gain.setValueCurveAtTime(sub, t, t1 - t0); } catch (e) { g.gain.setValueAtTime(v * .5, t); }
        link(o, g, bus); link(o2, G(.25), g); o.start(t); o2.start(t); o.stop(T0 + t1 + .05); o2.stop(T0 + t1 + .05); } };
    const kick = (at, v = .55) => { osc('sine', 150, 42, at, .28, v, .004); nz('lowpass', 1200, 100, at, .06, v * .4, 'down'); };
    const hat = (at, v = .1) => nz('highpass', 7000, 9000, at, .04, v, 'down');
    const snare = (at, v = .25) => { nz('bandpass', 1800, 1200, at, .14, v, 'down', NB, .8); osc('triangle', 220, 180, at, .08, v * .4, .002); };
    const clunk = (at, f, v = .6) => { nz('lowpass', 900, 80, at, .22, v, 'down', BB); osc('sine', f * 2, f, at, .45, v * .5, .003); bell(f * 4, at + .01, .03, 1.5, Math.random() - .5); };
    const boom = at => { osc('sine', 70, 22, at, 3, 1, .002); nz('lowpass', 6000, 60, at, 3, 1.1, 'down', BB); nz('highpass', 2000, 9000, at, 2, .45); };
    /* 0. contour qui s'allume, puis l'écran s'écrase : 2D → 1D → 0D */
    osc('sine', 300, 1200, 0, .8, .05, .6); for (let i = 0; i < 8; i++) { const a = .85 + i * .03; osc('square', 300 + Math.random() * 1500, 200, a, .04, .04, .002, Math.random() - .5); }
    nz('bandpass', 3000, 200, 1.05, .7, .45, 'down', NB, 1.4); bell(493.9, 1.6, .05, 1.6); osc('sine', 900, 60, 1.75, .45, .25, .01); bell(329.6, 2.15, .06, 2.4);
    /* 1. reconstruction : chaque dimension ajoute une note à l'accord (mi majeur 7e) */
    bell(1318.5, 2.25, .06, 3); pad([41.2], 2.2, 15, .09, 2, 'sine');
    osc('sine', 330, 660, 4, 1.4, .04, .3); nz('bandpass', 500, 3000, 4, 1.4, .25, 'swell', NB, 1.5); pad([82.4, 123.5], 4, 13, .045, 1.2, 'triangle'); bell(659.3, 4, .045, 2);
    nz('bandpass', 400, 2600, 6.6, 1.4, .25, 'swell', NB, 1.5); pad([207.7], 6.6, 10.4, .035, 1.2, 'triangle'); bell(830.6, 6.6, .045, 2);
    [329.6, 493.9, 415.3, 493.9].forEach((f, i) => { for (let r = 0; r < 2; r++) osc('triangle', f, f, 6.6 + (r * 4 + i) * .32, .3, .03, .004, i % 2 ? .3 : -.3); });
    nz('bandpass', 300, 2400, 9.2, 1.6, .28, 'swell', NB, 1.5); pad([311.1], 9.2, 7.6, .028, 1.2, 'sawtooth'); bell(987.8, 9.2, .045, 2.2);
    for (let i = 0; i < 14; i++) osc('triangle', [329.6, 415.3, 493.9, 622.3][i % 4], [329.6, 415.3, 493.9, 622.3][i % 4], 9.2 + i * .25, .2, .03, .004, i % 2 ? .35 : -.35);
    [9.2, 10.2, 11.2, 12.2].forEach(b => kick(b, .3));
    /* … et la quatrième direction : gamme de Shepard, montée */
    shepard(13.2, 3.6, 1.2, .05); nz('highpass', 300, 9000, 13.4, 3.4, .45, 'up'); osc('sawtooth', 55, 440, 13.4, 3.4, .035, 3);
    for (let i = 0; i < 33; i++) { const f = [659.3, 830.6, 987.8, 1244.5][i % 4] * (i > 16 ? 2 : 1); osc('triangle', f, f, 12.6 + i * .125, .1, .025, .003, Math.sin(i) * .6); }
    boom(16.8); pad([82.4, 123.5, 164.8, 207.7, 246.9, 311.1, 415.3], 16.85, 3, .045, .05, 'triangle'); [1318.5, 1661.2, 1975.5, 2489, 2637].forEach((f, i) => bell(f, 16.9 + i * .1, .025, 2, (i - 2) * .35));
    /* 2. les quatre plans : groove, accords mi – do#m – la – si */
    for (let b = 17.4, n = 0; b < 26.6; b += .5, n++) { kick(b, .45); hat(b + .25); if (n % 2) snare(b, .18); }
    [[[82.4, 164.8, 207.7, 246.9], 17.4, 2.2], [[69.3, 138.6, 164.8, 207.7], 19.6, 2.2], [[55, 110, 138.6, 164.8], 21.8, 2.2], [[61.7, 123.5, 155.6, 185], 24, 2.6]].forEach(([ch, a, d]) => { pad(ch, a, d, .035, .15, 'sawtooth'); nz('bandpass', 400, 4000, a - .3, .4, .35, 'up', NB, 1.2); for (let i = 0; i < d * 8; i++) { const f = ch[1 + (i % 3)] * 4; osc('triangle', f, f, a + i * .125, .1, .022, .003, i % 2 ? .4 : -.4); } });
    [523.3, 587.3, 659.3, 784, 880, 1046.5, 1174.7, 1318.5, 1568, 1760, 2093, 2349.3, 2637, 3136, 3520, 4186].forEach((f, i) => bell(f, 18 + i * .085, .025, 1, Math.sin(i) * .7));   // 16 sommets
    for (let i = 0; i < 32; i++) { nz('bandpass', 2500 + i * 60, 2500 + i * 60, 20.2 + i * (1.25 / 32), .03, .3, 'down', NB, 6); osc('sine', 600 + i * 45, 600 + i * 45, 20.2 + i * (1.25 / 32), .05, .03, .002); }   // 32 arêtes
    pad([1318.5, 1661.2, 1975.5, 2489], 22.4, 1.6, .02, .1, 'sine'); nz('highpass', 4000, 8000, 22.4, 1.5, .2, 'swell');   // 24 carrés
    [98, 110, 123.5, 146.8, 164.8, 196, 220, 246.9].forEach((f, i) => clunk(24.6 + i * .22, f, .5));   // 8 cubes
    /* 3. plongée puis effondrement */
    shepard(26.6, 4, .7, .06); nz('highpass', 300, 9000, 26.6, 4, .5, 'up'); osc('sawtooth', 55, 880, 26.6, 4, .04, 3.6);
    for (let s = 26.6, g2 = .25; s < 30.6; s += g2, g2 = Math.max(.035, g2 * .9)) snare(s, .1 + (s - 26.6) * .04);
    osc('sine', 1200, 40, 30.6, .6, .3, .01); nz('lowpass', 6000, 100, 30.6, .6, .4, 'up');
    boom(31.2); pad([82.4, 164.8, 246.9], 31.25, 2, .04, .05, 'triangle');
    /* 4. le patron se déplie, le titre */
    for (let ci = 0; ci < 8; ci++) clunk(32.4 + ci * .14, [164.8, 185, 207.7, 246.9, 277.2, 311.1, 329.6, 415.3][ci], .35);
    pad([82.4, 123.5, 164.8, 207.7, 246.9, 329.6, 415.3], 33.4, 5.2, .045, .8, 'sawtooth'); osc('sine', 123.5, 82.4, 33.4, 1.6, .6, .004); osc('sine', 123.5, 82.4, 33.85, 1.4, .4, .004);
    const arp = [659.3, 830.6, 987.8, 1318.5, 1661.2, 1975.5, 2637]; for (let i = 0; i < 26; i++) bell(arp[(i * 3) % 7], 33.6 + i * .18, .016, 1.8, Math.sin(i * 1.3) * .7);
    /* 5. repli et retour sur l'écran */
    nz('bandpass', 3000, 400, 38.4, 1.4, .3, 'swell', NB, 1.2); for (let i = 0; i < 8; i++) bell([2637, 1975.5, 1661.2, 1318.5, 987.8, 830.6, 659.3, 493.9][i], 38.5 + i * .14, .025, 1.6, (i % 2 ? .4 : -.4));
    osc('sine', 400, 900, 39.6, 1.6, .04, 1.2); bell(329.6, 41.4, .06, 3); bell(82.4, 41.5, .08, 5); pad([164.8, 207.7, 246.9, 329.6], 41.3, 3, .03, .5, 'sine');
    return {stop};
  }
  /* ----- ✺ Genèse (≈ 70 s) : rembobinage, Big Bang, premières étoiles, galaxie, Soleil, Terre, titre ----- */
  function genScore(starT) {
    const T0 = now() + .03, bus = G(1); bus.connect(M); const {osc, nz, pad, bell, stop} = kit(T0, bus);
    const ws = C.createWaveShaper(); ws.curve = crunch(); link(ws, F('lowpass', 2200), G(.5), bus);
    const brass = (fs, at, dur, v, f0 = 260, f1 = 2800) => fs.forEach((f, i) => { const t = T0 + at, lp = F('lowpass', f0, 2.5), g = G(0); lp.frequency.setValueAtTime(f0, t); lp.frequency.exponentialRampToValueAtTime(f1, t + 1.8); lp.frequency.exponentialRampToValueAtTime(f1 * .45, t + dur); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .4); g.gain.setValueAtTime(v, t + dur - 2); g.gain.linearRampToValueAtTime(0, t + dur); link(lp, g, P((i - fs.length / 2) * .2), bus); [-7, 0, 7].forEach(d => { const o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; link(o, G(.33), lp); o.start(t); o.stop(t + dur + .1); }); });
    const strings = (fs, at, dur, v, att = 1.5) => fs.forEach((f, i) => { const t = T0 + at, lp = F('lowpass', 1500, .7), g = G(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + att); g.gain.setValueAtTime(v, t + Math.max(att, dur - 1.2)); g.gain.linearRampToValueAtTime(0, t + dur); link(lp, g, P((i - fs.length / 2) * .25), bus); [-11, -4, 4, 11].forEach(d => { const o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; const lf = C.createOscillator(), lg = G(4); lf.frequency.value = 4.5 + Math.random(); link(lf, lg); lg.connect(o.detune); link(o, G(.22), lp); o.start(t); lf.start(t); o.stop(t + dur + .1); lf.stop(t + dur + .1); }); });
    const timp = (at, f, v = .6) => { osc('sine', f * 1.5, f, at, 1.8, v, .004); osc('triangle', f * 2.02, f * 2, at, 1, v * .2, .004); nz('lowpass', 1100, 80, at, .45, v * .5, 'down', BB); };
    const kick = (at, v = .4) => { osc('sine', 120, 40, at, .35, v, .004); };
    /* 0. rembobinage */
    for (let i = 0; i < 14; i++) { const a = .2 + i * .27 * (1 - i / 22); osc('sawtooth', 300 + i * 90, 1600 + i * 200, a, .2, .025, .01, (i % 2 ? .5 : -.5)); }
    [1.3, 1.85, 2.3, 2.7, 3.05, 3.4].forEach((a, i) => { osc('sine', 880 * Math.pow(1.19, i), 880 * Math.pow(1.19, i), a, .3, .07, .003); nz('bandpass', 3000, 3000, a, .05, .3, 'down', NB, 3); });
    nz('lowpass', 2000, 60, .3, 4, .5, 'swell', BB); osc('sine', 600, 40, 3.4, 1, .2, .01);
    /* le néant avant tout */
    osc('sine', 4186, 4186, 4.6, 3.2, .006, 1.2); pad([32.7, 49], 4.4, 3.7, .12, 2, 'sine');
    nz('highpass', 300, 8000, 6.2, 1.75, .6, 'up'); osc('sine', 30, 120, 6.2, 1.75, .3, 1.6);
    /* 1. BIG BANG */
    const B = 8;
    { const t = T0 + B, o = C.createOscillator(), g = G(0); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(16, t + 7); g.gain.setValueAtTime(1.3, t); g.gain.exponentialRampToValueAtTime(.0001, t + 7.2); link(o, g, ws); o.start(t); o.stop(t + 7.3); }
    osc('sine', 60, 18, B, 7, 1, .002); nz('lowpass', 9000, 40, B, 7.5, 1.4, 'down', BB); nz('highpass', 1500, 9000, B, 4, .6, 'down'); nz('bandpass', 200, 3000, B + .3, 5, .3, 'swell', NB, .6);
    brass([65.4, 98, 130.8, 196], B + .05, 5.5, .05, 2000, 300);
    strings([130.8, 155.6, 196, 261.6], B + 2.5, 6, .03, 3);   // do mineur qui refroidit
    /* fond diffus : petites étincelles */
    for (let i = 0; i < 16; i++) bell([2093, 2349, 2637, 3136, 3520][i % 5], 13.2 + i * .3 + Math.random() * .1, .012, 2, Math.random() * 1.6 - .8);
    /* âges sombres */
    pad([32.7, 49, 65.4], 17.5, 6, .09, 2.5, 'sine'); nz('bandpass', 300, 600, 17.5, 6, .25, 'swell', BB, .8); strings([98, 116.5, 146.8], 18, 5, .022, 2.5);
    /* premières étoiles : une note par étoile */
    const pent = [523.3, 587.3, 659.3, 784, 880, 1046.5, 1174.7, 1318.5, 1568]; (starT || []).forEach((s, i) => bell(pent[(i * 2 + (i >> 2)) % pent.length], s, .035, 3, Math.sin(i * 1.7) * .7));
    strings([130.8, 196, 293.7, 329.6], 22.3, 8.5, .03, 3);
    /* galaxies : thème principal (la mineur – fa – do – sol), arpèges */
    const prog = [[[110, 164.8, 220, 261.6, 329.6], 30.5], [[87.3, 130.8, 174.6, 220, 261.6], 33.5], [[65.4, 130.8, 196, 261.6, 329.6], 36.5], [[98, 146.8, 196, 246.9, 293.7], 39.5]];
    prog.forEach(([ch, a]) => { strings(ch, a, 3.3, .026, .9); pad([ch[0] / 2], a, 3.2, .1, .3, 'sine'); for (let k = 0; k < 12; k++) osc('triangle', ch[1 + (k % 4)] * 2, ch[1 + (k % 4)] * 2, a + k * .25, .22, .028, .004, k % 2 ? .35 : -.35); });
    for (let b = 34.5; b < 42.4; b += 1.5) kick(b, .35);
    /* le Soleil, les planètes */
    strings([87.3, 174.6, 220, 261.6, 329.6], 42.4, 5, .028, 1.2); bell(1046.5, 42.5, .05, 4);
    [47.6, 48.1, 48.6, 49.1, 49.6].forEach((a, i) => bell([659.3, 784, 987.8, 1174.7, 1318.5][i], a, .03, 2.5, (i - 2) * .3));
    strings([98, 196, 246.9, 293.7, 392], 47.4, 4.5, .028, 1);
    /* la Terre : montée émotionnelle */
    [[[65.4, 130.8, 196, 261.6, 329.6], 51.8], [[61.7, 123.5, 196, 246.9, 293.7], 53.8], [[55, 110, 164.8, 220, 261.6], 55.8], [[43.7, 87.3, 174.6, 220, 261.6], 57.8]].forEach(([ch, a]) => { strings(ch, a, 2.2, .032, .5); pad([ch[0]], a, 2.1, .11, .2, 'sine'); });
    nz('highpass', 300, 9000, 57.3, 2.4, .5, 'up'); osc('sawtooth', 110, 880, 57.3, 2.4, .035, 2.2);
    for (let s = 58, g2 = .2; s < 59.7; s += g2, g2 = Math.max(.04, g2 * .85)) nz('bandpass', 1800, 1300, s, .12, .14 + (s - 58) * .1, 'down', NB, .8);
    /* 2. arrivée : impact + grand accord de do majeur */
    const A = 59.7;
    osc('sine', 80, 20, A, 4, 1, .002); nz('lowpass', 7000, 60, A, 4, 1.1, 'down', BB); nz('highpass', 2000, 9000, A, 2.2, .45);
    { const t = T0 + A, o = C.createOscillator(), g = G(0); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(30, t + .6); g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(.0001, t + .7); link(o, g, ws); o.start(t); o.stop(t + .8); }
    brass([65.4, 98, 130.8, 164.8, 196, 261.6], A + .5, 7.5, .045); strings([261.6, 329.6, 392, 523.3, 659.3], A + .5, 7.5, .022, 1);
    timp(A + .5, 65.4, .75); timp(A + .95, 65.4, .5); timp(A + 1.2, 98, .55);
    [1046.5, 1318.5, 1568, 2093, 2637, 3136, 4186].forEach((f, i) => bell(f, A + 1.1 + i * .2, .022, 3, i % 2 ? .55 : -.55));
    /* le nouveau monde */
    [523.3, 659.3, 784, 1046.5, 1318.5].forEach((f, i) => bell(f, 67.2 + i * .1, .03, 3, (i - 2) * .3)); bell(65.4, 67.4, .08, 6); pad([130.8, 196, 261.6, 329.6], 67, 3.5, .03, .6, 'sine');
    return {stop};
  }
  /* ----- ♛ Créateur (≈ 65 s) : terminal, code, six reliques, fusion, cristal, fanfare ----- */
  function creaScore() {
    const T0 = now() + .03, bus = G(1); bus.connect(M); const {osc, nz, pad, bell, stop} = kit(T0, bus);
    const ws = C.createWaveShaper(); ws.curve = crunch(); link(ws, F('lowpass', 2400), G(.5), bus);
    const brass = (fs, at, dur, v, f0 = 280, f1 = 3000) => fs.forEach((f, i) => { const t = T0 + at, lp = F('lowpass', f0, 2.5), g = G(0); lp.frequency.setValueAtTime(f0, t); lp.frequency.exponentialRampToValueAtTime(f1, t + 1.4); lp.frequency.exponentialRampToValueAtTime(f1 * .5, t + dur); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .3); g.gain.setValueAtTime(v, t + dur - 1.5); g.gain.linearRampToValueAtTime(0, t + dur); link(lp, g, P((i - fs.length / 2) * .2), bus); [-7, 0, 7].forEach(d => { const o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; link(o, G(.33), lp); o.start(t); o.stop(t + dur + .1); }); });
    const strings = (fs, at, dur, v, att = 1.2) => fs.forEach((f, i) => { const t = T0 + at, lp = F('lowpass', 1600, .7), g = G(0); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + att); g.gain.setValueAtTime(v, t + Math.max(att, dur - 1)); g.gain.linearRampToValueAtTime(0, t + dur); link(lp, g, P((i - fs.length / 2) * .25), bus); [-10, -3, 4, 11].forEach(d => { const o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = d; link(o, G(.22), lp); o.start(t); o.stop(t + dur + .1); }); });
    const timp = (at, f, v = .6) => { osc('sine', f * 1.5, f, at, 1.6, v, .004); nz('lowpass', 1100, 80, at, .4, v * .5, 'down', BB); };
    const kick = (at, v = .5) => { osc('sine', 140, 40, at, .3, v, .004); nz('lowpass', 1200, 100, at, .05, v * .4, 'down'); };
    const key = at => nz('bandpass', 2400 + Math.random() * 1800, 2000, at, .02, .35, 'down', NB, 6);
    const hit = (at, v = .8) => { osc('sine', 70, 24, at, 2, v, .003); nz('lowpass', 5000, 60, at, 2, v, 'down', BB); };
    /* I. terminal : frappe au clavier, bip de validation, glitch */
    [[.2, 34], [1.5, 30]].forEach(([a, n]) => { for (let i = 0; i < n; i++) key(a + i * .034 + Math.random() * .01); });
    osc('square', 880, 880, 2.6, .08, .05, .002); osc('square', 1320, 1320, 2.7, .12, .05, .002);
    for (let i = 0; i < 20; i++) key(3.3 + i * .025);
    for (let i = 0; i < 18; i++) { const t = T0 + 4.1 + Math.random() * 1.5, o = C.createOscillator(), g = G(0); o.type = 'square'; o.frequency.setValueAtTime(100 + Math.random() * 1500, t); g.gain.setValueAtTime(.1, t); g.gain.setValueAtTime(0, t + .04 + Math.random() * .05); link(o, g, ws); o.start(t); o.stop(t + .12); }
    osc('sine', 1800, 40, 5.5, .4, .2, .003);
    /* II. le code : séquenceur numérique qui accélère */
    const sq = [329.6, 392, 493.9, 587.3, 659.3, 587.3, 493.9, 392];
    for (let t = 6, k = 0, st = .25; t < 13.6; t += st, k++, st = Math.max(.07, st * .975)) osc('triangle', sq[k % 8] * (t > 10 ? 2 : 1), sq[k % 8] * (t > 10 ? 2 : 1), t, .1, .03, .003, k % 2 ? .4 : -.4);
    pad([82.4, 123.5], 6, 7.6, .09, 1.5, 'sine'); strings([164.8, 196, 246.9], 7, 6.6, .02, 2);
    nz('highpass', 300, 8000, 12, 2, .5, 'up');
    /* III. les six légendes : chacune a son motif (4,6 s) */
    const R0 = 14, RD = 4.6;
    // ✸ supernova : cœur qui bat, effondrement, explosion, accord de ré, pulsar
    [.15, .55, .88, 1.12].forEach((b, i) => { osc('sine', 78, 34, R0 + b, .3, .5 + i * .1, .006); nz('lowpass', 260, 60, R0 + b, .14, .3, 'down', BB); });
    osc('sine', 520, 28, R0 + 1.3, .25, .5, .003); hit(R0 + 1.5, 1); nz('highpass', 1500, 9000, R0 + 1.5, 2.5, .45); brass([73.4, 110, 146.8, 185, 220], R0 + 1.6, 3, .045); timp(R0 + 1.7, 73.4); for (let p = R0 + 2.4; p < R0 + 4.4; p += .45) { osc('sine', 3136, 3100, p, .05, .03, .002, -.4); osc('sine', 3136, 3100, p + .1, .05, .02, .002, .4); }
    // ✦ singularité : grave qui aspire, tic-tac qui ralentit, chœur doré
    hit(R0 + RD, .7); osc('sine', 28, 75, R0 + RD, 4.4, .5, 2.4); nz('lowpass', 50, 900, R0 + RD, 4.2, .6, 'up', BB); { let tt = R0 + RD + .4, gp = .18, f = 1900; while (tt < R0 + 2 * RD - .3) { osc('sine', f, f, tt, .06, .06, .002); tt += gp; gp *= 1.28; f *= .9; } } pad([65.4, 98, 130.8, 196], R0 + RD + .5, 4, .035, 1.2);
    // ∞ infini : la comète trace l'infini (glissando) puis arpège arc-en-ciel
    hit(R0 + 2 * RD, .5); osc('sine', 220, 1760, R0 + 2 * RD + .05, 1.6, .05, 1.2); nz('bandpass', 400, 5000, R0 + 2 * RD, 1.7, .25, 'up'); { const ar = [440, 523.3, 659.3, 880, 1046.5, 880, 659.3, 523.3]; for (let k = 0; k < 34; k++) osc('triangle', ar[k % 8] * (k > 16 ? 2 : 1), ar[k % 8] * (k > 16 ? 2 : 1), R0 + 2 * RD + 1.7 + k * .08, .12, .035, .003, Math.sin(k) * .7); } pad([110, 164.8, 220, 329.6], R0 + 2 * RD + 1.6, 3, .04, .3);
    // ∅ néant : silence… une goutte, une cloche, le pinceau, le sceau
    osc('sine', 1400, 300, R0 + 3 * RD + .55, .18, .24, .002); osc('sine', 600, 900, R0 + 3 * RD + .67, .12, .08, .002); bell(130.8, R0 + 3 * RD + .6, .08, 4.5); nz('bandpass', 400, 2400, R0 + 3 * RD + 1.05, 1.9, .3, 'swell', NB, .7); bell(392, R0 + 3 * RD + 2.4, .03, 3); nz('lowpass', 900, 120, R0 + 3 * RD + 3.05, .12, .6, 'down', BB); osc('sine', 180, 90, R0 + 3 * RD + 3.05, .2, .25, .003);
    // ◈ tesseract : quatre « clonc », la 4e dimension s'ouvre (glissando sans fin)
    hit(R0 + 4 * RD, .6); [0, .3, .6, .9].forEach((d, i) => { nz('lowpass', 900, 80, R0 + 4 * RD + .2 + d, .2, .6, 'down', BB); bell([98, 110, 123.5, 146.8][i] * 4, R0 + 4 * RD + .21 + d, .035, 1.4); }); osc('sine', 110, 1760, R0 + 4 * RD + 1.3, 3, .05, 2.5); osc('sine', 55, 880, R0 + 4 * RD + 1.6, 2.8, .04, 2.4); pad([82.4, 123.5, 185, 246.9], R0 + 4 * RD + 1.3, 3.2, .03, .8, 'sawtooth');
    // ✺ genèse : un point, un Big Bang, puis les cordes en do majeur
    osc('sine', 4186, 4186, R0 + 5 * RD, .35, .01, .2); hit(R0 + 5 * RD + .35, 1); nz('highpass', 2000, 9000, R0 + 5 * RD + .35, 2, .4); strings([130.8, 196, 261.6, 329.6, 392], R0 + 5 * RD + .6, 4.2, .032, 1); [1046.5, 1318.5, 1568, 2093, 2637].forEach((f, i) => bell(f, R0 + 5 * RD + 1.6 + i * .3, .025, 2.5, (i - 2) * .35));
    /* IV. fusion : les six motifs ensemble, montée */
    const F0 = 41.8; strings([110, 164.8, 220, 261.6, 329.6], F0, 4.6, .028, 1.5); strings([87.3, 174.6, 220, 261.6, 349.2], F0 + 4.6, 4.8, .03, .5);
    for (let b = F0, gp = .5; b < 51.1; b += gp, gp = Math.max(.08, gp * .94)) kick(b, .35 + (b - F0) * .04);
    nz('highpass', 300, 9000, 46.6, 4.6, .55, 'up'); osc('sawtooth', 55, 1100, 46.6, 4.6, .04, 4.2); osc('sine', 220, 1760, 47.6, 3.6, .05, 3);
    /* V. le cristal : impact + chœur scintillant en mi majeur */
    const X = 51.2;
    { const t = T0 + X, o = C.createOscillator(), g = G(0); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(20, t + 4); g.gain.setValueAtTime(1.2, t); g.gain.exponentialRampToValueAtTime(.0001, t + 4.2); link(o, g, ws); o.start(t); o.stop(t + 4.3); }
    hit(X, 1); nz('highpass', 2000, 9000, X, 2.5, .5);
    pad([82.4, 123.5, 164.8, 207.7, 246.9, 329.6, 415.3], X + .3, 8, .045, 1.6, 'triangle'); strings([329.6, 415.3, 493.9, 659.3], X + 1, 7, .02, 2.5);
    const arp = [659.3, 830.6, 987.8, 1318.5, 1661.2, 1975.5, 2637]; for (let i = 0; i < 30; i++) bell(arp[(i * 3) % 7], X + 1 + i * .2, .018, 2, Math.sin(i * 1.3) * .7);
    /* VI. titre : fanfare en mi majeur, timbales */
    const TT = 58.2;
    brass([82.4, 123.5, 164.8, 207.7, 246.9, 329.6], TT, 8.6, .05); timp(TT, 82.4, .8); timp(TT + .45, 82.4, .5); timp(TT + .7, 123.5, .6);
    brass([110, 138.6, 164.8, 220, 277.2], TT + 3.2, 2.2, .035); brass([123.5, 155.6, 185, 246.9, 311.1], TT + 5.4, 1.9, .035);
    [1318.5, 1661.2, 1975.5, 2637, 3322.4].forEach((f, i) => bell(f, TT + .5 + i * .18, .025, 3, i % 2 ? .5 : -.5));
    /* VII. la réalité se recompose */
    nz('bandpass', 300, 6000, 66.8, 1.4, .3, 'up', NB, 2); [659.3, 830.6, 987.8, 1318.5].forEach((f, i) => bell(f, 67 + i * .1, .03, 3, (i - 1.5) * .3)); bell(82.4, 67.2, .08, 5);
    return {stop};
  }
  /* ----- 🚂 Le Dernier Train (≈ 44 s) : billet, sifflet, vapeur, quai, voyage, valse ----- */
  function trainScore() {
    const T0 = now() + .03, bus = G(1); bus.connect(M); const {osc, nz, pad, bell, stop} = kit(T0, bus);
    const whistle = (at, dur = 1.4, v = .07) => [523.3, 659.3, 784].forEach((f, i) => { const t = T0 + at, o = C.createOscillator(), g = G(0), lf = C.createOscillator(), lg = G(6); o.type = 'triangle'; o.frequency.value = f * .98; o.frequency.linearRampToValueAtTime(f, t + .15); lf.frequency.value = 5.5; link(lf, lg); lg.connect(o.frequency); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .12); g.gain.setValueAtTime(v, t + dur - .3); g.gain.linearRampToValueAtTime(0, t + dur); link(o, F('bandpass', f * 1.5, .8), g, bus); o.start(t); lf.start(t); o.stop(t + dur + .1); lf.stop(t + dur + .1); nz('bandpass', f * 2, f * 2, at, dur, .05, 'swell', NB, 2); });
    const clack = (at, v = .5) => { nz('bandpass', 900, 700, at, .05, v, 'down', NB, 3); nz('bandpass', 700, 600, at + .13, .05, v * .9, 'down', NB, 3); osc('sine', 120, 60, at, .08, v * .3, .003); };
    const chuff = (at, v = .5) => nz('lowpass', 1800, 300, at, .22, v, 'down', NB, .7);
    const piano = (f, at, v = .05, pan = 0) => { osc('triangle', f, f, at, 1.4, v, .004, pan); osc('sine', f * 2, f * 2, at, .8, v * .3, .004, pan); };
    /* 1. le billet d'or : scintillement, machine à composter */
    [1568, 1975.5, 2349.3, 3136].forEach((f, i) => bell(f, .15 + i * .12, .025, 1.6, (i - 1.5) * .4));
    for (let i = 0; i < 6; i++) nz('bandpass', 3000, 3000, 1.2 + i * .09, .03, .25, 'down', NB, 5);
    nz('lowpass', 1200, 100, 2.8, .2, .9, 'down', BB); osc('sine', 180, 60, 2.8, .25, .5, .003); nz('bandpass', 4000, 2000, 2.85, .08, .5, 'down', NB, 2);
    /* 2. sifflet, vapeur, quai */
    whistle(3.7, 1.6, .08); nz('highpass', 600, 3000, 3.6, 3.6, .5, 'swell'); for (let i = 0; i < 4; i++) chuff(4.2 + i * .6, .4);
    pad([73.4, 110], 5.5, 7, .07, 2, 'sine'); pad([293.7, 370, 440], 6, 6, .018, 2.5, 'sine');
    nz('lowpass', 60, 500, 7, 3.6, 1, 'up', BB); osc('sine', 40, 70, 7, 3.6, .3, 3);
    whistle(9.4, 1.2, .1); { for (let i = 0; i < 16; i++) clack(10.3 + i * (.12 + i * .02), .5 - i * .02); } nz('highpass', 2000, 800, 11.2, 1, .3, 'down');
    /* portes */
    nz('lowpass', 900, 80, 12.9, .3, .9, 'down', BB); osc('sine', 110, 50, 12.9, .3, .4, .003); bell(880, 13.2, .03, 1.2); bell(1108.7, 13.4, .03, 1.2);
    /* 3. départ : le train accélère */
    for (let t = 13.6, gp = .7; t < 18; t += gp, gp = Math.max(.24, gp * .86)) chuff(t, .5);
    for (let t = 15, gp = 1.1; t < 41.5; t += gp) clack(t, (t > 19.8 && t < 21.8) || (t > 33.8 && t < 36) ? .7 : .38);
    { const t = T0 + 13.6, s = src(BB, true), g = G(0), lp = F('lowpass', 160); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5, t + 4); g.gain.setValueAtTime(.5, t + 25); g.gain.linearRampToValueAtTime(0, t + 30); link(s, lp, g, bus); s.start(t); s.stop(t + 30.2); }
    /* la valse du voyage (ré majeur, 3 temps) */
    const W0 = 15, BT = .42, chords = [[73.4, 146.8, 185, 220], [61.7, 123.5, 146.8, 185], [49, 98, 123.5, 146.8], [55, 110, 138.6, 164.8]];
    const mel = [587.3, 659.3, 740, 880, 740, 659.3, 587.3, 493.9, 587.3, 659.3, 587.3, 554.4, 587.3, 740, 880, 987.8, 880, 740, 659.3, 587.3, 659.3, 554.4, 587.3, 440];
    for (let bar = 0; bar < 16; bar++) { const a = W0 + bar * BT * 3, ch = chords[(bar >> 1) % 4], muf = (a > 19.8 && a < 21.6) || (a > 33.8); if (muf) continue; piano(ch[0], a, .06); piano(ch[1], a + BT, .025, -.3); piano(ch[2], a + BT, .025, .3); piano(ch[1], a + BT * 2, .025, -.3); piano(ch[3], a + BT * 2, .025, .3); piano(mel[(bar * 3) % mel.length], a, .045, .1); piano(mel[(bar * 3 + 1) % mel.length], a + BT * 1.5, .035, .1); }
    /* tunnels : grondement */
    [[19.8, 2], [27.7, 1.3], [33.8, 2.2]].forEach(([a, d]) => { nz('lowpass', 300, 120, a, d, .8, 'swell', BB); nz('bandpass', 400, 400, a, d, .2, 'swell', NB, .5); });
    /* aurores : nappe scintillante */
    pad([146.8, 220, 277.2, 329.6, 440], 22, 6.4, .03, 2, 'sine'); for (let i = 0; i < 14; i++) bell([1174.7, 1318.5, 1480, 1760][i % 4], 22.4 + i * .42, .016, 2.2, Math.sin(i) * .7);
    /* la mer */
    pad([98, 146.8, 196, 246.9, 293.7], 29, 5, .03, 1.5, 'sine'); nz('lowpass', 400, 900, 29, 5, .3, 'swell', BB);
    /* 4. éclair + titre : grand accord et sifflet final */
    osc('sine', 70, 22, 35.2, 3, .9, .002); nz('lowpass', 6000, 60, 35.2, 3, 1, 'down', BB); nz('highpass', 2000, 9000, 35.2, 2, .4);
    [[73.4, 146.8, 220, 293.7, 370, 440, 587.3], [55, 138.6, 220, 277.2, 329.6, 440]].forEach((ch, k) => ch.forEach((f, i) => { const t = 35.7 + k * 3.4; osc('sawtooth', f, f, t, 3.4, .012, .3, (i - 3) * .15); osc('triangle', f, f, t, 3.6, .03, .4, (i - 3) * .15); }));
    [1174.7, 1480, 1760, 2349.3].forEach((f, i) => bell(f, 36 + i * .25, .03, 3, (i - 1.5) * .4));
    whistle(38.6, 2, .09); pad([73.4, 146.8, 220, 293.7], 40.8, 3.6, .04, .8, 'sine'); bell(587.3, 42.6, .05, 3); bell(73.4, 42.8, .08, 5);
    return {stop};
  }
  /* ----- 👁 La Présence (≈ 27 s) : grésillement, caméras, pas qui approchent, JUMPSCARE, boîte à musique ----- */
  function presScore() {
    const T0 = now() + .03, bus = G(1); bus.connect(M); const {osc, nz, pad, bell, stop} = kit(T0, bus);
    const ws = C.createWaveShaper(); ws.curve = crunch(); link(ws, F('lowpass', 5000), G(.7), bus);
    const step = (at, v) => { nz('lowpass', 500, 90, at, .16, v, 'down', BB); osc('sine', 90, 45, at, .12, v * .4, .003); };
    const stat = (at, d, v = .3) => nz('bandpass', 3000, 2500, at, d, v, 'down', NB, .4);
    /* 1. néons qui grésillent puis coupure */
    { const t = T0, o = C.createOscillator(), g = G(0); o.type = 'sawtooth'; o.frequency.value = 100; g.gain.setValueAtTime(.05, t); for (let i = 0; i < 10; i++) { const a = t + .2 + i * .22 + Math.random() * .08; g.gain.setValueAtTime(Math.random() < .5 ? 0 : .07, a); } g.gain.setValueAtTime(0, t + 2.4); link(o, F('lowpass', 900), g, bus); o.start(t); o.stop(t + 2.5); }
    for (let i = 0; i < 9; i++) nz('highpass', 3000, 6000, .2 + i * .24, .03, .4, 'down');
    osc('sine', 60, 30, 2.4, .5, .5, .003); nz('lowpass', 800, 60, 2.4, .5, .5, 'down', BB);
    /* 2. caméras : statique à chaque changement, drone, cœur */
    [4, 7, 10].forEach((a, i) => { stat(a, .35, .45); osc('sine', 50, 30, a, .6, .35 + i * .1, .003); });
    pad([36.7, 38.9], 4, 9, .1, 1.5, 'sine'); pad([73.4, 77.8], 7, 6, .025, 2, 'sawtooth');
    for (let b = 5, gp = 1.1; b < 13; b += gp, gp = Math.max(.45, gp * .92)) { osc('sine', 70, 34, b, .28, .4, .005); osc('sine', 70, 34, b + .2, .2, .25, .005); }
    /* « il t'a vu » : grappe dissonante */
    [1046.5, 1108.7, 1174.7, 1244.5].forEach((f, i) => { osc('sawtooth', f, f * 1.01, 11.2, 1.6, .012, .05, (i - 1.5) * .5); osc('sine', f / 2, f / 2 * 1.02, 11.2, 1.8, .03, .05); });
    /* 3. signal perdu… silence… des pas qui approchent */
    stat(13, 1.2, .5); nz('bandpass', 3000, 2000, 13.6, 3.5, .06, 'swell', NB, .5);
    [13.9, 14.7, 15.4, 15.95, 16.4, 16.75, 17.0].forEach((a, i) => step(a, .12 + i * .09));
    osc('sine', 3000, 4200, 15.5, 1.65, .02, 1.5);   // tension aiguë
    /* LE JUMPSCARE */
    const J = 17.2;
    [[420, 1400], [455, 1520], [610, 2100], [890, 2700]].forEach(([a, b], i) => { const t = T0 + J, o = C.createOscillator(), g = G(0); o.type = 'sawtooth'; o.frequency.setValueAtTime(a, t); o.frequency.exponentialRampToValueAtTime(b, t + .25); o.frequency.exponentialRampToValueAtTime(b * .8, t + .85); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.32, t + .02); g.gain.setValueAtTime(.32, t + .9); g.gain.linearRampToValueAtTime(0, t + 1.1); link(o, g, P((i - 1.5) * .4), ws); o.start(t); o.stop(t + 1.15); });
    nz('bandpass', 2500, 4000, J, 1.1, 1.2, 'down', NB, .6); osc('sine', 90, 25, J, 1.2, 1, .002); nz('lowpass', 4000, 60, J, 1.4, 1, 'down', BB);
    /* silence, puis la boîte à musique désaccordée */
    const MB = J + 3.4, lul = [659.3, 587.3, 523.3, 493.9, 523.3, 440, 493.9, 392, 440, 523.3, 493.9, 440];
    lul.forEach((f, i) => { const dt = (Math.random() - .5) * .06; osc('triangle', f * (1 + (Math.random() - .5) * .012), f * .995, MB + i * .55 + dt, 1.4, .05, .003, -.3 + Math.sin(i) * .3); osc('sine', f * 2.01, f * 2, MB + i * .55 + dt, .6, .015, .003); });
    pad([55, 58.3], MB - 1, 8, .08, 2.5, 'sine');
    stat(MB + 6.6, 1.4, .2);
    return {stop};
  }
  /* ----- ✨ Singularité shiny (≈ 31 s) : scintillement, trou noir, déchirure, explosion, pulsar ----- */
  function x0sScore() {
    const T0 = now() + .03, bus = G(1); bus.connect(M); const {osc, nz, pad, bell, stop} = kit(T0, bus);
    const ws = C.createWaveShaper(); ws.curve = crunch(); link(ws, F('lowpass', 3000), G(.55), bus);
    /* ✨ le son « shiny » */
    [2637, 3136, 3951, 4699, 5274].forEach((f, i) => bell(f, .2 + i * .07, .03, 1.4, (i - 2) * .35)); [2637, 3951].forEach((f, i) => bell(f, .9 + i * .1, .025, 1.2, i ? .5 : -.5));
    /* aspiration de l'écran */
    nz('lowpass', 60, 1400, 2.6, 1.5, .8, 'up', BB); osc('sine', 600, 40, 2.8, 1.3, .25, .01);
    /* le trou noir : grave qui enfle, chœur cristallin */
    pad([36.7, 55], 3.6, 10, .1, 2, 'sine'); pad([220, 277.2, 329.6, 440], 5, 8, .018, 3, 'sawtooth');
    for (let i = 0; i < 16; i++) bell([1760, 2217.5, 2637, 3520][i % 4], 5.2 + i * .45, .014, 1.6, Math.sin(i) * .7);
    /* instabilité : crépitements, le grave monte */
    for (let i = 0; i < 26; i++) nz('highpass', 3000, 7000, 10.4 + Math.random() * 2.8, .04, .3 + Math.random() * .3, 'down');
    osc('sawtooth', 55, 220, 9, 4.2, .06, 3.5); nz('highpass', 400, 8000, 11, 2.2, .45, 'up');
    /* LA DÉCHIRURE (13,2) */
    const S = 13.2; { const t = T0 + S, o = C.createOscillator(), g = G(0); o.type = 'sawtooth'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(30, t + 2.3); g.gain.setValueAtTime(.7, t); g.gain.exponentialRampToValueAtTime(.0001, t + 2.4); link(o, g, ws); o.start(t); o.stop(t + 2.5); }
    nz('bandpass', 4000, 300, S, 2.3, .8, 'down', NB, 1.2); osc('sine', 3000, 6000, S, 2.3, .03, 2);
    /* EXPLOSION (15,6) */
    const B = 15.6; osc('sine', 70, 18, B, 4.5, 1, .002); nz('lowpass', 8000, 40, B, 4.8, 1.3, 'down', BB); nz('highpass', 2000, 9000, B, 3, .5);
    { const t = T0 + B, o = C.createOscillator(), g = G(0); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(25, t + .8); g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(.0001, t + .9); link(o, g, ws); o.start(t); o.stop(t + 1); }
    /* le pulsar : des « tic » qui accélèrent jusqu'à devenir une note */
    let tt = B + .4, gp = .6; while (tt < 27.6) { osc('sine', 1400, 900, tt, .03, .08, .001, Math.sin(tt * 3) * .5); tt += gp; gp = Math.max(.045, gp * .94); }
    { const t = T0 + 22.5, o = C.createOscillator(), g = G(0), lf = C.createOscillator(), lg = G(.06); o.frequency.value = 440; lf.frequency.value = 22; link(lf, lg); lg.connect(g.gain); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + 1); g.gain.setValueAtTime(.05, t + 4.6); g.gain.linearRampToValueAtTime(0, t + 5.6); link(o, g, bus); o.start(t); lf.start(t); o.stop(t + 5.7); lf.stop(t + 5.7); }
    /* titre : accord de la majeur lumineux + scintillement shiny */
    pad([55, 110, 164.8, 220, 277.2, 329.6, 440], 22, 6.4, .045, 1.2, 'triangle');
    [1760, 2217.5, 2637, 3520, 4434.9].forEach((f, i) => bell(f, 22.3 + i * .16, .028, 2.4, (i - 2) * .4));
    [2637, 3136, 3951, 4699, 5274].forEach((f, i) => bell(f, 24.5 + i * .07, .03, 1.4, (i - 2) * .35));
    bell(110, 28.2, .07, 4); [2637, 3951].forEach((f, i) => bell(f, 28.3 + i * .1, .025, 1.4, i ? .5 : -.5));
    return {stop};
  }
  /* ----- ∅ Néant (≈ 40 s) : effacement, silence, goutte d'encre, cercle, réécriture ----- */
  function voidScore() {
    const T0 = now() + .03, bus = G(1); bus.connect(M); const {osc, nz, pad, bell, stop} = kit(T0, bus);
    for (let i = 0; i < 30; i++) nz('bandpass', 3000 + Math.random() * 5000, 1000 + Math.random() * 2000, Math.random() * 6, .3 + Math.random() * .6, .05, 'swell', NB, 3);   // poussière qui s'envole
    nz('lowpass', 900, 80, 0, 6.5, .4, 'swell', BB); osc('sine', 220, 55, 2, 4.5, .06, 2);
    osc('sine', 3520, 3520, 8, 4.5, .008, 2);   // presque le silence
    /* la goutte */
    osc('sine', 1400, 300, 12.2, .18, .25, .002); osc('sine', 600, 900, 12.32, .12, .08, .002); osc('sine', 65.4, 65.4, 12.2, 7, .18, .02); bell(130.8, 12.25, .05, 7);
    for (let i = 0; i < 6; i++) bell(261.6 * [1, 1.5, 2, 1.25, 3, 2.5][i], 13.6 + i * 1.05, .022, 5, Math.sin(i) * .6);
    /* le cercle à l'encre + titre */
    nz('bandpass', 400, 2400, 20, 3, .35, 'swell', NB, .7); bell(98, 23.2, .1, 9); bell(146.8, 23.25, .05, 8); pad([65.4, 98, 130.8, 196], 23.2, 9, .035, 2.5, 'sine');
    /* la réécriture : petites notes pentatoniques */
    const pent = [523.3, 587.3, 659.3, 784, 880, 1046.5]; for (let i = 0; i < 18; i++) bell(pent[(i * 3 + (i >> 2)) % 6], 30 + i * .42, .03, 2.4, (i % 3 - 1) * .5);
    bell(65.4, 38.4, .07, 6); pad([130.8, 196, 261.6], 37.8, 4, .03, 1, 'sine');
    return {stop};
  }
  /* ----- Singularité (≈ 31 s) : aspiration, temps ralenti, traversée, trou blanc ----- */
  function x0Score() {
    const T0 = now() + .03, bus = G(1); bus.connect(M); const {osc, nz, pad, bell, stop} = kit(T0, bus);
    for (let i = 0; i < 22; i++) osc('square', 200 + Math.random() * 2800, 120 + Math.random() * 500, Math.random() * 2.8, .05 + Math.random() * .08, .045, .003, Math.random() * 2 - 1);
    /* aspiration de l'interface */
    nz('lowpass', 50, 1200, 3, 6, 1, 'up', BB); osc('sine', 28, 90, 3, 6, .5, 4); osc('sawtooth', 55, 220, 4, 5, .03, 4);
    for (let i = 0; i < 18; i++) nz('bandpass', 4000, 300, 3.5 + i * .3, .5, .12, 'down', NB, 2);   // morceaux aspirés
    osc('sine', 60, 25, 9, 2.5, .8, .005); nz('lowpass', 2000, 60, 9, 2.5, .9, 'down', BB);
    /* le temps ralentit : tic-tac de plus en plus lent et grave */
    let tt = 9.6, gap = .25, f = 1800; while (tt < 14) { osc('sine', f, f, tt, .06, .06, .002); tt += gap; gap *= 1.22; f *= .9; }
    pad([41.2, 61.7], 9.5, 5, .08, 2, 'sine');
    /* traversée de l'horizon */
    nz('highpass', 300, 9000, 14, 8, .5, 'up'); osc('sine', 110, 1760, 14, 8, .08, 6); pad([110, 138.6, 164.8, 220], 14, 4, .05); pad([98, 123.5, 146.8, 196], 18, 4, .05);
    for (let b = 14; b < 22; b += .5 - (b - 14) * .04) osc('sine', 120, 40, b, .25, .4, .004);
    /* trou blanc : explosion lumineuse + chœur */
    osc('sine', 70, 22, 22, 4, 1, .004); nz('lowpass', 5000, 80, 22, 4, 1.1, 'down', BB); nz('highpass', 2000, 9000, 22, 3, .5);
    pad([65.4, 130.8, 196, 261.6, 329.6, 392, 523.3], 22.2, 8.5, .05, 1.2);
    [1568, 2093, 2637, 3136, 3520, 4186, 3136, 2637].forEach((fq, i) => bell(fq, 22.6 + i * .2, .025, 2.5, (i % 2 ? .5 : -.5)));
    bell(130.8, 28.5, .06, 5);
    return {stop};
  }
  /* ----- 🌊 Abysse (≈ 90 s) : l'inondation, la descente zone par zone, le fond, l'œil, la lumière ----- */
  function abyScore() {
    const T0 = now() + .03, bus = G(1); bus.connect(M); const {osc, nz, pad, bell, stop} = kit(T0, bus);
    const ub = G(1); link(ub, F('lowpass', 1100, .8), bus); const U = kit(T0, ub);   // sons étouffés, comme sous l'eau
    const dl = C.createDelay(2); dl.delayTime.value = .46; const fb = G(.42), eb = G(1); link(eb, dl); link(dl, fb, dl); link(dl, F('lowpass', 2600), bus); const E = kit(T0, eb);   // écho du sonar
    const drop = at => { osc('sine', 1900, 650, at, .14, .22, .002); osc('sine', 980, 520, at + .02, .1, .1, .002); nz('bandpass', 3200, 1400, at, .05, .18, 'down', NB, 4); };
    const bub = (at, v = .04) => { const f0 = 280 + Math.random() * 520; U.osc('sine', f0, f0 * (1.7 + Math.random() * .7), at, .07, v, .003, Math.random() * 1.6 - .8); };
    const ping = (at, v = .09) => { E.osc('sine', 1180, 1172, at, .6, v, .002); osc('sine', 1180, 1172, at, .6, v * .6, .002); };
    const whale = (at, f, v = .07) => { U.osc('sine', f, f * 2, at, 1.7, v, .5); U.osc('sine', f * 2, f * 1.3, at + 1.6, 2, v * .9, .3); U.osc('triangle', f * 1.01, f * 2.02, at, 1.7, v * .25, .5); };
    const creak = (at, v = .5) => { nz('bandpass', 260 + Math.random() * 120, 160, at, .7, v, 'swell', NB, 14); U.osc('sawtooth', 72, 54, at, .6, .035, .05); };
    const heart = (at, v = .3) => { U.osc('sine', 62, 34, at, .26, v, .005); U.osc('sine', 58, 32, at + .22, .22, v * .65, .005); };
    const glass = (at, v = .4) => { nz('highpass', 3500, 9000, at, .09, v); for (let i = 0; i < 6; i++) nz('bandpass', 2500 + Math.random() * 4000, 2000 + Math.random() * 3000, at + Math.random() * .25, .05, .2, 'down', NB, 14); };
    /* 0. l'écran prend l'eau */
    [.6, 1.2, 1.7, 2.05, 2.3].forEach(drop);
    nz('lowpass', 260, 1600, 2, 4.4, .45, 'up', BB); for (let i = 0; i < 46; i++) bub(2 + Math.random() * 4.3, .03 + Math.random() * .03);
    nz('lowpass', 6000, 160, 6.35, 1.4, .9, 'down', NB); osc('sine', 95, 28, 6.35, 1, .7, .004); for (let i = 0; i < 30; i++) bub(6.4 + Math.random() * 1.6, .05);
    /* le grand bleu, étouffé, sous tout le reste */
    nz('lowpass', 200, 120, 6.5, 62, .42, 'swell', BB); U.osc('sine', 41.2, 41.2, 6.5, 62, .16, 4);
    /* 1. zone éclairée : chaud, lumineux */
    pad([164.8, 207.7, 246.9, 370], 7, 11.4, .032, 2.6); [659.3, 830.6, 987.8, 1244.5, 1480].forEach((f, i) => bell(f, 7.6 + i * .5, .02, 3, (i % 2 ? .4 : -.4)));
    whale(12.4, 230); for (let i = 0; i < 18; i++) bub(8 + Math.random() * 9);
    /* 2. zone crépusculaire : plus sombre, le sonar, des étincelles */
    pad([138.6, 164.8, 207.7, 277.2], 18.2, 12.4, .03, 2.4); ping(19); ping(23.6); ping(27.9);
    const pent = [1318.5, 1480, 1661.2, 1975.5, 2217.5]; for (let i = 0; i < 26; i++) bell(pent[Math.random() * 5 | 0] * (Math.random() < .3 ? .5 : 1), 20 + Math.random() * 10, .009 + Math.random() * .01, 1.8, Math.random() * 1.6 - .8);
    /* 3. zone de minuit : le noir, la coque qui grince, la lanterne */
    pad([55, 82.4, 110], 30.2, 14, .04, 3); osc('sine', 300, 2400, 30.9, .25, .05, .01); [31, 31.08, 31.2].forEach(a => nz('bandpass', 2000, 1500, a, .03, .4, 'down', NB, 6));
    creak(33.2); creak(39.6, .4); creak(42.6, .45);
    U.osc('sine', 1760, 1660, 34.6, 7.4, .022, 2.4); U.osc('sine', 2637, 2490, 35.4, 6, .01, 2.4); bell(1975.5, 39.6, .02, 4); bell(2349.3, 40.1, .015, 4);
    /* 4. les abysses : le léviathan */
    pad([49, 73.4, 98], 44.2, 12, .045, 3); [45.6, 46.6, 47.4, 48.1, 48.7, 49.2, 49.6, 50, 50.4, 51.6, 53.2].forEach((a, i) => ping(a, .06 + i * .004));
    whale(47.2, 68, .16); whale(51.6, 61, .18); for (let b = 46; b < 55.6; b += .9) heart(b, .22);
    nz('lowpass', 400, 90, 47, 8, .5, 'swell', BB);
    /* 5. la fosse : on plonge, la pression monte, la coque craque */
    for (let i = 0; i < 22; i++) { const f = 880 * Math.pow(.92, i); U.osc('triangle', f, f * .94, 56.2 + i * .5, .7, .03, .02, (i % 2 ? .3 : -.3)); }
    nz('lowpass', 120, 900, 56.2, 10.6, .4, 'up', BB); creak(57.8, .5); creak(59.6, .55); glass(61.2, .45); creak(62.4, .6); glass(63.3, .35); creak(64.6, .65); glass(65.6, .4);
    for (let b = 58; b < 66.8; b += .6 - (b - 58) * .03) heart(b, .2 + (b - 58) * .02);
    osc('sine', 85, 28, 67, 1.3, .85, .004); nz('lowpass', 900, 60, 67, 2.2, .7, 'down', BB);
    /* panne : relais, chute de tension, silence */
    [68.6, 68.72, 68.85, 68.97, 69.1, 69.25].forEach(a => nz('bandpass', 1800, 1200, a, .03, .45, 'down', NB, 5)); osc('sawtooth', 240, 36, 68.7, .9, .05, .01);
    [69.8, 71, 72.2, 73.3, 74.4, 75.4, 76.3, 77.1, 77.8, 78.4, 78.9].forEach(a => heart(a, .26));
    /* l'œil s'ouvre */
    U.osc('sine', 2637, 2637, 71.5, 3, .012, 1.5); pad([82.4], 72.6, 6.7, .05, 4); pad([123.5], 74, 5.3, .04, 3); pad([164.8, 246.9], 75.5, 3.8, .035, 2.4); pad([329.6, 493.9], 77, 2.3, .03, 1.4);
    nz('highpass', 300, 9000, 76, 3.2, .45, 'up'); osc('sine', 110, 880, 76.4, 2.85, .06, 2.4);
    /* la lumière */
    osc('sine', 70, 22, 79.25, 4, 1, .002); nz('lowpass', 6000, 60, 79.25, 3.6, 1.1, 'down', BB); nz('highpass', 2000, 9000, 79.25, 2.6, .4);
    pad([82.4, 164.8, 246.9, 329.6, 415.3, 493.9, 740], 79.4, 8, .045, .6);
    const arp = [659.3, 740, 830.6, 987.8, 1108.7, 1318.5, 1480, 1661.2, 1975.5, 2217.5]; for (let i = 0; i < 40; i++) bell(arp[(i * 3) % 10] * (i > 26 ? 2 : 1), 79.6 + i * .13, .016, 2, Math.sin(i * 1.7) * .7);
    bell(164.8, 81, .07, 5); bell(659.3, 81.05, .045, 4); bell(82.4, 86.6, .07, 5); pad([164.8, 207.7, 246.9, 329.6], 86.4, 3, .03, .5, 'sine');
    return {stop};
  }
  /* ----- Boucle des sons ponctuels ----- */
  const RATE = {sonar: 0, whale: 0, bubble: 0, steps: 0, ping: 0, drop: 0, hail: 0, bird: 0, cricket: 0, owl: 0, chime: 0, key: 0, siren: 0};
  function tickEv() {
    if (!C || C.state !== 'running' || !vol) return;
    Object.keys(RATE).forEach(k => { const r = RATE[k] * (lite ? .5 : 1); if (r && Math.random() < r * .1) ONE[k](k === 'drop' || k === 'hail' ? (lvl[k] || 1) : undefined); });
    if (ch.train && lvl.train) { if (!ev.clk || now() >= ev.clk) { ONE.clack(lvl.train * .7); ev.clk = now() + 1.1 + R(-.04, .04); } }
    if (ch.wind && lvl.wind && Math.random() < .05) { const w = lvl.wind; ramp(ch.wind.bp.frequency, R(250, 950), .8); ramp(ch.wind.g.gain, R(.35, 1) * (1 + w * .4), .7); if (RATE.chime && Math.random() < .5) ONE.chime(.8); }
    if (ch.sea && lvl.sea) { const ph = (now() % 9) / 9; ch.sea.g.gain.setTargetAtTime(.18 + .5 * Math.pow(Math.sin(ph * Math.PI), 2), now(), .5); }
    if (ch.pad && lvl.pad && Math.random() < .012) setChord();
  }
  const CHORDS = [[261.6, 329.6, 392, 493.9], [220, 261.6, 329.6, 392], [174.6, 220, 261.6, 329.6], [196, 246.9, 293.7, 349.2]];
  function setChord() { if (!ch.pad) return; chordI = (chordI + 1) % CHORDS.length; ch.pad.osc.forEach((o, i) => o.frequency.setTargetAtTime(CHORDS[chordI][i] / 2, now(), 1.4)); }

  /* ----- API ----- */
  return {
    state: () => !C ? 'off' : C.state === 'running' ? 'on' : 'locked',
    unlock() { if (!init()) return; if (C.state !== 'running') C.resume().catch(() => {}); },
    setVol(v, isLite) { lite = !!isLite; const w = Math.max(0, Math.min(1, +v || 0)); vol = w; if (!w && !C) return; if (!init()) return; ramp(M.gain, w * w, .6); if (w && C.state !== 'running') C.resume().catch(() => {}); },
    /* scene : niveaux 0..1 des sons continus + fréquence (par seconde) des sons ponctuels */
    scene(s) {
      if (!init()) return;
      ['rain', 'wind', 'sea', 'city', 'pad', 'snow', 'drone', 'train', 'deep'].forEach(k => { const v = +s[k] || 0; lvl[k] = v; if (v || ch[k]) ramp(CH(k).o.gain, k === 'pad' ? v * .08 : k === 'city' ? v * .5 : v * .55, 1.6); });
      if (s.pad && ch.pad && !chordI) setChord();
      Object.keys(RATE).forEach(k => RATE[k] = +s['r_' + k] || 0);
      lvl.drop = s.dropV || 1; lvl.hail = s.hailV || 1; lvl.thunder = s.thunder == null ? 1 : s.thunder;
    },
    thunder, one: k => { if (init() && ONE[k]) ONE[k](); },
    /* bande-son de la cinématique ∞ (≈ 60 s) : renvoie {stop} pour la couper si on passe */
    inf() { if (!init() || !vol) return null; return infScore(); },
    nova() { if (!init() || !vol) return null; return novaScore(); },
    void() { if (!init() || !vol) return null; return voidScore(); },
    x0big() { if (!init() || !vol) return null; return x0Score(); },
    tes() { if (!init() || !vol) return null; return tesScore(); },
    gen(st) { if (!init() || !vol) return null; return genScore(st); },
    crea() { if (!init() || !vol) return null; return creaScore(); },
    train() { if (!init() || !vol) return null; return trainScore(); },
    pres() { if (!init() || !vol) return null; return presScore(); },
    x0s() { if (!init() || !vol) return null; return x0sScore(); },
    aby() { if (!init() || !vol) return null; return abyScore(); },
    type: n => { if (!C || !vol || C.state !== 'running' || !RATE.key) return; let at = 0; for (let i = 0; i < Math.min(n, 40); i++) { at += R(.04, .1); tick(R(2400, 4200), 6, .012, .2, R(-.3, .3), at); } }
  };
})();
/* Scène sonore à partir de la météo (utilisé par l'écran et l'admin) */
function sndScene(k, o) {
  o = o || {}; const S = o.cfg || {}, hr = o.hour == null ? 12 : o.hour, T = o.T == null ? 15 : o.T, mo = o.month == null ? 6 : o.month, gu = o.gust || 0, st = o.style || '';
  const s = {};
  const wet = {drizzle: .22, rain: .55, pour: .95, storm: .8, hail: .65, sleet: .45}[k] || 0;
  if (S.rain !== false && wet) { s.rain = wet; s.r_drop = wet * 14; s.dropV = .6 + wet * .6; if (k === 'hail') { s.r_hail = 9; s.hailV = 1; } }
  if (S.wind !== false) { let w = {wind: .75, blizzard: .85, storm: .35, pour: .25, fog: .06}[k] || 0; w = Math.max(w, Math.min(.9, (gu - 25) / 70)); if (w > .03) s.wind = w; if (k === 'snow') s.snow = .35; if (k === 'blizzard') s.snow = .5; }
  s.thunder = S.thunder === false ? 0 : 1;
  const calm = !wet && !['wind', 'blizzard', 'snow', 'fog'].includes(k), day = hr >= 6 && hr < 21;
  if (S.nature !== false && calm) {
    if (day && T > -2) s.r_bird = (hr < 10 ? .55 : .22) * (k === 'cloudy' ? .5 : 1);
    if (!day && T >= 13 && mo >= 4 && mo <= 9) s.r_cricket = .9;
    if (!day && (hr >= 22 || hr < 5)) s.r_owl = .012 + (st === 'spooky' ? .03 : 0);
  }
  if (S.style !== false) {
    const X = {marin: {sea: .7}, cyber: {city: .55, r_siren: .006}, vapor: {pad: 1}, hacker: {r_key: .5}, ukiyo: {r_chime: .14}, spooky: {r_owl: .05}, x0: {drone: 1, r_ping: .025}, nova: {drone: .5, r_ping: .03}, void: {r_chime: .04}, tes: {pad: .7, drone: .3, r_ping: .02}, gen: {pad: .9, r_chime: .03}, crea: {pad: .8, r_chime: .05, r_ping: .015}, train: {train: 1}, pres: {drone: .7, city: .25, r_steps: .004}, x0s: {drone: .6, r_ping: .03}, aby: {deep: 1, r_sonar: .03, r_whale: .007, r_bubble: .08}}[st];
    if (X) Object.keys(X).forEach(q => s[q] = Math.max(s[q] || 0, X[q]));
  }
  return s;
}
