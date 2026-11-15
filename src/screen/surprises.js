
/* ===================================================================
   EASTER EGGS & DÉCORS DE FÊTE
   Halloween : fantômes qui surgissent, araignées, chauves-souris, citrouilles (bonbons !),
   vendredi 13 : chat noir · Nouvel An : compte à rebours · 1er avril : poisson collé,
   4 mai : hyperespace · Pâques : œufs cachés · Noël : neige sur les cadres + guirlande,
   code Konami / 7 tapes : mode disco · OVNI (très rare, la nuit) · loup-garou (pleine lune)…
   =================================================================== */
const EGG = $('eggs'), UNDER = $('under'), SHELF = $('shelf');
const rel = el => { const r = el.getBoundingClientRect(), s = stage.getBoundingClientRect(), k = s.width / 800 || 1; return {x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k}; };
const vis = el => el && el.offsetParent !== null && el.style.display !== 'none' && $('v1').classList.contains('on');
function mk(parent, html, style, cls = 'egg') { const d = document.createElement('div'); d.className = cls; if (style) d.style.cssText = style; d.innerHTML = html || ''; parent.appendChild(d); return d; }
const gone = (a, el) => a.finished.then(() => el.remove()).catch(() => el.remove());
let eggBusy = 0;
const rnd = a => a[Math.random() * a.length | 0];
const busy = ms => { eggBusy = Date.now() + ms; };
function toast(txt, sec = 3.5) { const t = mk(EGG, '', '', 'egg toast'); t.textContent = txt; gone(t.animate([{opacity: 0, transform: 'translate(-50%,-10px)'}, {opacity: 1, transform: 'translate(-50%,0)', offset: .1}, {opacity: 1, offset: .85}, {opacity: 0}], {duration: sec * 1000}), t); }
function bubble(txt, x, y, ms = 2200, delay = 0) { const b = mk(EGG, '', `left:${x}px;top:${y}px;opacity:0`, 'egg bubble'); b.textContent = txt; gone(b.animate([{opacity: 0, transform: 'scale(.6)'}, {opacity: 1, transform: 'scale(1)', offset: .12}, {opacity: 1, offset: .85}, {opacity: 0}], {duration: ms, delay, fill: 'both'}), b); }

const GHOST_SVG = '<svg width="64" height="78" viewBox="0 0 64 78" style="stroke:none;filter:drop-shadow(0 4px 10px rgba(0,0,0,.35))"><path d="M32 2C15 2 4 15 4 32v40l7-6 7 6 7-6 7 6 7-6 7 6 7-6 7 6V32C60 15 49 2 32 2z" fill="#f6f4ff"/><ellipse cx="22" cy="30" rx="5" ry="7.5" fill="#1b1028"/><ellipse cx="42" cy="30" rx="5" ry="7.5" fill="#1b1028"/><ellipse cx="32" cy="47" rx="6" ry="8" fill="#1b1028"/><circle cx="20" cy="27" r="1.6" fill="#fff"/><circle cx="40" cy="27" r="1.6" fill="#fff"/><ellipse cx="13" cy="40" rx="4" ry="2.4" fill="#ffb3d1" opacity=".6"/><ellipse cx="51" cy="40" rx="4" ry="2.4" fill="#ffb3d1" opacity=".6"/></svg>';
const BAT_SVG = s => `<svg width="${s}" height="${s / 2}" viewBox="0 0 40 20" style="stroke:none;overflow:visible"><g class="flapw"><path d="M20 8Q14 0 2 2Q6 6 5 11Q9 9 11 13Q14 10 16 14L20 12L24 14Q26 10 29 13Q31 9 35 11Q34 6 38 2Q26 0 20 8Z" fill="#120818" stroke="rgba(255,150,60,.7)" stroke-width=".7"/></g><path d="M17 9l1-5 2 3 2-3 1 5q-3 3-6 0z" fill="#120818"/><circle cx="18.6" cy="8.4" r=".7" fill="#ffcf3a"/><circle cx="21.4" cy="8.4" r=".7" fill="#ffcf3a"/></svg>`;
const CAT_SVG = '<svg width="72" height="46" viewBox="0 0 72 46" style="stroke:none;overflow:visible"><path class="tail" d="M12 27C3 22 2 9 9 4" stroke="#0b0b10" stroke-width="4.5" fill="none" stroke-linecap="round" style="transform-origin:12px 27px"/><ellipse cx="30" cy="28" rx="20" ry="10" fill="#0b0b10"/><g class="legs" fill="#0b0b10"><rect x="14" y="31" width="4.5" height="14" rx="2"/><rect x="22" y="33" width="4.5" height="12" rx="2"/><rect x="36" y="33" width="4.5" height="12" rx="2"/><rect x="43" y="31" width="4.5" height="14" rx="2"/></g><circle cx="52" cy="18" r="9.5" fill="#0b0b10"/><path d="M44.5 13L46 1.5l6.5 8.5zM53.5 10l6-8.5 1.5 11.5z" fill="#0b0b10"/><g class="blinky" style="transform-origin:53px 17px"><ellipse cx="49.6" cy="17" rx="1.9" ry="2.4" fill="#ffd400"/><ellipse cx="56.6" cy="17" rx="1.9" ry="2.4" fill="#ffd400"/></g><path d="M58 20l9-1M58 22l9 1" stroke="#555" stroke-width=".6"/></svg>';
const PUMPKIN = s => `<svg width="${s}" height="${s * .9}" viewBox="0 0 60 54" style="stroke:none;overflow:visible"><path d="M28 9c0-5 3-8 7-8" stroke="#3d5a1f" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="18" cy="31" rx="15" ry="20" fill="#d9601a"/><ellipse cx="42" cy="31" rx="15" ry="20" fill="#d9601a"/><ellipse cx="30" cy="31" rx="15" ry="21" fill="#f07a24"/><g class="flick"><path d="M16 25l7-6 4 8zM44 25l-7-6-4 8z" fill="#ffd34d"/><path d="M14 36q16 14 32 0l-4 2-3-3-4 4-5-4-4 4-3-3z" fill="#ffd34d"/></g><ellipse cx="30" cy="31" rx="27" ry="19" fill="none" stroke="rgba(255,190,80,.0)"/></svg>`;
const CANDY = c => `<svg width="26" height="14" viewBox="0 0 26 14" style="stroke:none"><path d="M0 2l7 5-7 5zM26 2l-7 5 7 5z" fill="${c}"/><ellipse cx="13" cy="7" rx="7" ry="6" fill="${c}"/><path d="M9 3l4 8M13 2l4 9" stroke="rgba(255,255,255,.7)" stroke-width="1.4"/></svg>`;
const FISH = '<svg width="74" height="42" viewBox="0 0 74 42" style="stroke:none;overflow:visible"><path d="M8 21C18 4 44 2 56 21 44 40 18 38 8 21z" fill="#ff8a3d" stroke="#1d3b8b" stroke-width="2"/><path d="M56 21l14-12v24z" fill="#ffb03d" stroke="#1d3b8b" stroke-width="2" stroke-linejoin="round"/><circle cx="20" cy="18" r="3" fill="#1d3b8b"/><path d="M30 12q4 9 0 18M38 12q4 9 0 18" stroke="#1d3b8b" stroke-width="1.6" fill="none"/><rect x="24" y="-3" width="26" height="9" fill="rgba(240,232,200,.8)" transform="rotate(-8 37 1)"/></svg>';
const EGGP = c => `<svg width="26" height="32" viewBox="0 0 26 32" style="stroke:none"><ellipse cx="13" cy="17" rx="11" ry="14" fill="${c}"/><path d="M2.5 15l4-3 4 3 4-3 4 3 4-3 1.5 1" stroke="#fff" stroke-width="2" fill="none"/><circle cx="8" cy="22" r="1.6" fill="#fff"/><circle cx="14" cy="24" r="1.6" fill="#fff"/><circle cx="19" cy="21" r="1.6" fill="#fff"/></svg>`;
const UFO = '<svg width="96" height="48" viewBox="0 0 96 48" style="stroke:none;overflow:visible"><ellipse cx="48" cy="16" rx="18" ry="14" fill="rgba(160,255,220,.55)" stroke="#cfe" stroke-width="1"/><ellipse cx="48" cy="26" rx="46" ry="11" fill="#8c95a6"/><ellipse cx="48" cy="23" rx="40" ry="6" fill="#c3cad6"/><g class="flick"><circle cx="18" cy="29" r="3" fill="#ffd400"/><circle cx="36" cy="32" r="3" fill="#ff4d4d"/><circle cx="60" cy="32" r="3" fill="#4dff88"/><circle cx="78" cy="29" r="3" fill="#4db8ff"/></g></svg>';
const WOLF = '<svg width="70" height="64" viewBox="0 0 70 64" style="stroke:none"><path d="M6 64C8 48 14 40 22 36L30 22 28 8 34 16 40 6 40 18C46 22 47 30 44 36L56 46C62 50 66 56 66 64z" fill="#07070c"/><path d="M40 6l-2 10 6-6z" fill="#07070c"/></svg>';
const TUMBLE = '<svg width="44" height="44" viewBox="-22 -22 44 44" style="stroke:none"><g fill="none" stroke="#8a6a3a" stroke-width="1.4"><circle r="19"/><path d="M-18 -4Q0 -20 16 -8Q4 6 -14 12Q-2 -6 14 10Q-6 18 -12 -12Q8 -4 4 18M-8 -18Q12 0 -4 14"/></g><g fill="none" stroke="#b08850" stroke-width="1"><path d="M-14 -12Q6 -14 12 4Q-2 10 -16 2M10 -14Q-6 2 8 14"/></g></svg>';

/* ----- Animations ponctuelles ----- */
function eggGhost() {
  busy(8000); const d = $('days'), side = cfg.show.days && d.className === 'pnl' && vis(d);
  const R = side ? rel(d) : cfg.show.hours && vis($('hours')) ? rel($('hours')) : {x: 300, y: 480, w: 200, h: 0};
  const g = mk(UNDER, GHOST_SVG); let kf, bx, by;
  if (side) { const y = R.y + 20 + Math.random() * Math.max(10, R.h - 110); g.style.left = (R.x + 12) + 'px'; g.style.top = y + 'px'; kf = [{transform: 'translateX(0)'}, {transform: 'translateX(-72px) rotate(-10deg)', offset: .18}, {transform: 'translateX(-66px) rotate(6deg)', offset: .4}, {transform: 'translateX(-72px) rotate(-6deg)', offset: .7}, {transform: 'translateX(0)'}]; bx = R.x - 150; by = y - 12; }
  else { const x = R.x + 30 + Math.random() * Math.max(10, R.w - 120); g.style.left = x + 'px'; g.style.top = (R.y + 6) + 'px'; kf = [{transform: 'translateY(0)'}, {transform: 'translateY(-70px) rotate(6deg)', offset: .18}, {transform: 'translateY(-62px) rotate(-6deg)', offset: .45}, {transform: 'translateY(-70px)', offset: .7}, {transform: 'translateY(0)'}]; bx = x + 50; by = R.y - 92; }
  gone(g.animate(kf, {duration: 6200, easing: 'ease-in-out'}), g);
  bubble(rnd(['Bouh !', 'Hou hou !', 'Bouuuuh !', 'Coucou… 👻']), bx, by, 3200, 1100);
}
function eggSpider() {
  busy(9500); const x = 60 + Math.random() * 680, d = 110 + Math.random() * 160;
  const w = mk(EGG, `<div style="position:absolute;left:0;top:0;width:1px;height:100%;background:rgba(255,255,255,.65)"></div><div style="position:absolute;left:-15px;bottom:-24px">${SPIDER(30)}</div>`, `left:${x}px;top:0;height:0`);
  gone(w.animate([{height: '0px'}, {height: d + 'px', offset: .28}, {height: (d - 16) + 'px', offset: .4}, {height: d + 'px', offset: .52}, {height: (d - 8) + 'px', offset: .66}, {height: d + 'px', offset: .74}, {height: '0px'}], {duration: 9000, easing: 'ease-in-out'}), w);
  if (Math.random() < .5) bubble('Salut ! 🕷', x + 20, d - 10, 2400, 3000);
}
function eggBats() {
  busy(6500); const dir = Math.random() < .5 ? 1 : -1;
  for (let i = 0; i < 12; i++) {
    const s = 30 + Math.random() * 30, y0 = 30 + Math.random() * 300, b = mk(EGG, BAT_SVG(s), `top:${y0}px;left:${dir > 0 ? -70 : 850}px`);
    b.querySelector('.flapw').style.animationDuration = (.12 + Math.random() * .1) + 's';
    const kf = []; for (let j = 0; j <= 6; j++) kf.push({transform: `translate(${dir * j * 160}px,${Math.sin(j * 1.3 + i) * 44}px)`});
    gone(b.animate(kf, {duration: 3600 + Math.random() * 1800, delay: i * 130, fill: 'both'}), b);
  }
}
function eggCat() {
  busy(16000); const H = cfg.show.hours && vis($('hours')) ? rel($('hours')) : {x: 0, y: 480, w: 800};
  const c = mk(EGG, CAT_SVG, `left:${H.x - 76}px;top:${H.y - 44}px`), dist = H.w + 150, mid = dist * (.35 + Math.random() * .3);
  gone(c.animate([{transform: 'translateX(0)'}, {transform: `translateX(${mid}px)`, offset: .42}, {transform: `translateX(${mid}px)`, offset: .62}, {transform: `translateX(${dist}px)`}], {duration: 15000}), c);
  setTimeout(() => { const l = c.querySelector('.legs'); if (l) l.style.animation = 'none'; bubble(rnd(['Miaou.', 'Mrrr…', 'Miaou ? 🐾']), H.x - 76 + mid + 30, H.y - 84, 2600); }, 6300);
  setTimeout(() => { const l = c.querySelector('.legs'); if (l) l.style.animation = ''; }, 9300);
}
function eggCandy(x, y) {
  const C = ['#ff4d6d', '#ffd23f', '#7bdff2', '#b2f7a1', '#c77dff', '#ff9f1c'];
  for (let i = 0; i < 14; i++) { const e = mk(EGG, CANDY(C[i % C.length]), `left:${x - 13}px;top:${y - 7}px`), a = -Math.PI / 2 + (Math.random() - .5) * 2.4, v = 90 + Math.random() * 110, dx = Math.cos(a) * v, dy = Math.sin(a) * v, r = (Math.random() - .5) * 720;
    gone(e.animate([{transform: 'translate(0,0) rotate(0)', opacity: 1}, {transform: `translate(${dx * .6}px,${dy * .6}px) rotate(${r * .5}deg)`, offset: .35}, {transform: `translate(${dx}px,${dy + 180}px) rotate(${r}deg)`, opacity: 0}], {duration: 1500 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.5,1)'}), e); }
}
let fwBoost = null;
function boostFx(kind, ms, d = 2.5) { const L = mkLayer(kind, d); L.boost = 4; LAY.push(L); setTimeout(() => { LAY = LAY.filter(x => x !== L); }, ms); }
function eggCountdown(from = 10) {
  busy(from * 1000 + 9000); const el = mk(EGG, '', '', 'egg cnt'); let n = from;
  const step = () => {
    if (n > 0) { el.textContent = n; el.animate([{transform: 'scale(1.7)', opacity: 0}, {transform: 'scale(1)', opacity: 1, offset: .3}, {transform: 'scale(.9)', opacity: .15}], {duration: 980}); n--; setTimeout(step, 1000); return; }
    const d = clock(), y = d.getMonth() >= 6 ? d.getFullYear() + 1 : d.getFullYear();
    el.classList.add('msg'); el.textContent = `🎆 BONNE ANNÉE ${y} ! 🎆`;
    gone(el.animate([{transform: 'scale(.3)', opacity: 0}, {transform: 'scale(1.1)', opacity: 1, offset: .15}, {transform: 'scale(1)', opacity: 1, offset: .85}, {opacity: 0}], {duration: 9000}), el);
    boostFx('fireworks', 60000, 3); boostFx('confetti', 20000, 1.5);
  };
  step();
}
function eggAprilJoke() {
  busy(8000); const d = $('desc'), old = d.innerHTML;
  d.textContent = rnd(['Prévision : pluie de poissons 🐟', 'Alerte : banc de sardines à 14 h', 'Ciel couvert de poissons volants', 'Risque de maquereaux en fin de journée']);
  setTimeout(() => { d.innerHTML = old; toast("🐟 Poisson d'avril !"); }, 7000);
}
function eggHyper() {
  busy(4000); const c = document.createElement('canvas'); c.width = 800; c.height = 480; c.className = 'egg'; c.style.cssText = 'left:0;top:0'; EGG.appendChild(c);
  const g = c.getContext('2d'), S = Array.from({length: 170}, () => ({a: Math.random() * 6.283, r: Math.random() * 60, v: .6 + Math.random() * 1.6})), t0 = performance.now();
  const fr = now => { const e = (now - t0) / 2800; if (e >= 1) { gone(c.animate([{opacity: 1}, {opacity: 0}], {duration: 450}), c); return; }
    g.fillStyle = `rgba(0,0,10,${e < .15 ? e * 4 : .62})`; g.fillRect(0, 0, 800, 480); const sp = 1 + e * e * 50; g.strokeStyle = 'rgba(205,228,255,.75)'; g.lineWidth = 1.5; g.beginPath();
    S.forEach(s => { const r0 = s.r; s.r += s.v * sp; g.moveTo(400 + Math.cos(s.a) * r0, 240 + Math.sin(s.a) * r0); g.lineTo(400 + Math.cos(s.a) * s.r, 240 + Math.sin(s.a) * s.r); if (s.r > 560) s.r = Math.random() * 30; }); g.stroke();
    if (e > .88) { g.fillStyle = `rgba(255,255,255,${(e - .88) * 8})`; g.fillRect(0, 0, 800, 480); } requestAnimationFrame(fr); };
  requestAnimationFrame(fr); setTimeout(() => toast('✨ Que la Force soit avec toi'), 2900);
}
function eggDisco() {
  busy(13000); stage.classList.add('disco'); boostFx('confetti', 12000, 2);
  const ball = mk(EGG, '', 'left:370px;top:-70px;width:60px;height:60px;border-radius:50%;background:repeating-conic-gradient(rgba(255,255,255,.9) 0 10deg,rgba(120,130,150,.9) 10deg 20deg),radial-gradient(circle at 35% 30%,#fff,#99a 60%,#445);background-blend-mode:multiply;box-shadow:0 0 30px rgba(255,255,255,.6)');
  const cord = mk(EGG, '', 'left:399px;top:0;width:2px;height:0;background:#ccc');
  gone(ball.animate([{transform: 'translateY(0) rotate(0)'}, {transform: 'translateY(110px) rotate(180deg)', offset: .1}, {transform: 'translateY(110px) rotate(1600deg)', offset: .9}, {transform: 'translateY(0) rotate(1800deg)'}], {duration: 12000}), ball);
  gone(cord.animate([{height: '0px'}, {height: '112px', offset: .1}, {height: '112px', offset: .9}, {height: '0px'}], {duration: 12000}), cord);
  for (let i = 0; i < 10; i++) { const sp = mk(EGG, '', `left:${Math.random() * 760}px;top:${60 + Math.random() * 380}px;width:26px;height:26px;border-radius:50%;background:hsla(${i * 36},100%,70%,.55);filter:blur(4px)`); const kf = []; for (let j = 0; j < 6; j++) kf.push({transform: `translate(${(Math.random() - .5) * 500}px,${(Math.random() - .5) * 260}px)`}); gone(sp.animate(kf, {duration: 12000, direction: 'alternate'}), sp); }
  toast('🕺 Mode disco activé ! 🪩', 4); setTimeout(() => stage.classList.remove('disco'), 12000);
}
function eggUfo() {
  busy(12000); const y = 40 + Math.random() * 60, u = mk(EGG, UFO + '<div class="beam" style="position:absolute;left:18px;top:34px;width:60px;height:300px;opacity:0;background:linear-gradient(rgba(170,255,220,.55),rgba(170,255,220,0));clip-path:polygon(35% 0,65% 0,100% 100%,0 100%)"></div>', `left:-110px;top:${y}px`);
  gone(u.animate([{transform: 'translate(0,0)'}, {transform: 'translate(460px,14px)', offset: .38}, {transform: 'translate(468px,18px)', offset: .64}, {transform: 'translate(1020px,-40px)'}], {duration: 11000, easing: 'ease-in-out'}), u);
  u.querySelector('.beam').animate([{opacity: 0}, {opacity: 0, offset: .42}, {opacity: 1, offset: .46}, {opacity: .8, offset: .58}, {opacity: 0, offset: .62}, {opacity: 0}], {duration: 11000});
}
function eggWolf() {
  busy(8000); const [mx, my] = TH.sun ? POS.c : astro(), r = clamp(+TH.mr || 30, 10, 90), w = mk(UNDER, WOLF, `left:${mx - 30}px;top:${my - 6 + r * .2}px;opacity:0`);
  gone(w.animate([{opacity: 0}, {opacity: 1, offset: .15}, {opacity: 1, offset: .85}, {opacity: 0}], {duration: 7000}), w);
  bubble('Aouuuuuh…', mx - r - 150, my - 18, 3000, 1500);
}
function eggTumble() { const t = mk(EGG, TUMBLE, `left:-50px;top:${480 - (HT.L && HT.L.pad && HT.L.pad.b || 24) - 34}px`); const kf = []; for (let j = 0; j <= 8; j++) kf.push({transform: `translate(${j * 112}px,${j % 2 ? -18 : 0}px) rotate(${j * 160}deg)`}); gone(t.animate(kf, {duration: 6500, easing: 'linear'}), t); }
function eggImpact() {
  busy(3000); const l = mk(EGG, '', '', 'egg mg-lines'), t = mk(EGG, '', '', 'egg mg-boom'); t.textContent = rnd(['ドン！', 'ドドン！', 'バーン！', 'ゴゴゴ…']);
  stage.classList.add('shake'); setTimeout(() => stage.classList.remove('shake'), 500);
  gone(l.animate([{opacity: 0}, {opacity: 1, offset: .1}, {opacity: 0}], {duration: 1400}), l);
  gone(t.animate([{transform: 'scale(2.2) rotate(-14deg)', opacity: 0}, {transform: 'scale(1) rotate(-6deg)', opacity: 1, offset: .15}, {transform: 'scale(1.05) rotate(-6deg)', opacity: 1, offset: .8}, {opacity: 0}], {duration: 2200}), t);
}
function boot(lines) {
  if (PV) return; const b = mk(EGG, '', '', 'egg boot'); let i = 0;
  const add = () => { if (i < lines.length) { b.textContent += lines[i++] + '\n'; setTimeout(add, 150); } else setTimeout(() => { b.style.opacity = 0; setTimeout(() => b.remove(), 600); }, 500); };
  add();
}
function eggLight() { if (!cfg.eggs.lcd) return; stage.classList.add('lit'); clearTimeout(eggLight.t); eggLight.t = setTimeout(() => stage.classList.remove('lit'), 4000); }
const EGGS = {ghost: eggGhost, spider: eggSpider, bats: eggBats, cat: eggCat, countdown: () => eggCountdown(10), fish: eggAprilJoke, hyper: eggHyper, disco: eggDisco, ufo: eggUfo, wolf: eggWolf, tumble: eggTumble, light: eggLight,
  pumpkin: () => { eggCandy(400, 240); toast('🍬 Des bonbons ou un sort ?'); },
  snow1: () => showNotice({text: '❄ Première neige de la saison ! ❄', sec: 10}),
  boot: () => SIG.retro.onApply(),
  impact: () => eggImpact(),
  masc: () => mascGo(),
  azure: () => runBoot(true),
  roll: () => runRoll(),
  x0cin: () => x0Cinematic(HT.id === 'x0'),
  xrvault: () => xrVault(true),
  halloween: () => { eggBats(); setTimeout(eggGhost, 3500); setTimeout(eggSpider, 7500); }};
function runEgg(n) { const f = EGGS[n]; if (f) try { f(); } catch (e) {} }

/* ----- Décors persistants (citrouilles, neige sur les cadres, œufs, poisson…) ----- */
let decoKey = '', decoT;
function schedDecor() { clearTimeout(decoT); decoT = setTimeout(eggsDecor, 160); }
function panels() {
  const L = [], d = $('days'), h = $('hours');
  if (!$('v1').classList.contains('on')) return L;
  if (cfg.show.hours && vis(h)) L.push(rel(h));
  if (cfg.show.days && vis(d)) { if (d.className === 'row') d.querySelectorAll('.day').forEach(e => L.push(rel(e))); else if (d.className === 'pnl') L.push(rel(d)); }
  return L;
}
function eggsDecor() {
  const ev = curEv && curEv.id, E = cfg.eggs, P = panels(), key = [ev, HT.id, view, P.map(r => [r.x, r.y, r.w].map(Math.round).join(',')).join(';')].join('|');
  if (key === decoKey) return; decoKey = key; SHELF.innerHTML = '';
  const H = P[0] || {x: 28, y: 456, w: 744, h: 0};
  if (ev === 'halloween' && E.halloween) {
    if (HT.id !== 'spooky') SHELF.insertAdjacentHTML('beforeend', webSVG('egg" style="left:0;top:0;width:118px;height:118px;opacity:.75') + webSVG('egg" style="right:0;top:0;width:118px;height:118px;opacity:.75;transform:scaleX(-1)'));
    const dd = $('days'), px = cfg.show.days && dd.className === 'pnl' && cfg.layout.now === 'left' ? rel(dd).x - 128 : H.x + H.w - 118;
    const p1 = mk(SHELF, PUMPKIN(50), `left:${px}px;top:${H.y - 43}px;filter:drop-shadow(0 0 10px rgba(255,140,40,.6))`, 'egg tap'), p2 = mk(SHELF, PUMPKIN(36), `left:${px + 52}px;top:${H.y - 31}px;filter:drop-shadow(0 0 8px rgba(255,140,40,.6))`, 'egg tap');
    [p1, p2].forEach(p => p.dataset.egg = 'pumpkin');
  }
  if (ev === 'xmas' && E.xmas && HT.id !== 'xmas') {
    P.forEach(r => mk(SHELF, '', `left:${r.x - 4}px;top:${r.y - 9}px;width:${r.w + 8}px`, 'egg snowcap'));
    SHELF.insertAdjacentHTML('beforeend', SIG.xmas.deco2());
  }
  if (ev === 'easter' && E.easter) {
    let found = []; try { found = JSON.parse(localStorage.getItem('eggsFound') || '{}')[todayKey()] || []; } catch (e) {}
    const C = ['#ff9ec7', '#9be3a6', '#ffd23f'], spots = [[H.x + 40 + (todayKey().length * 37) % Math.max(1, H.w - 160), H.y - 30], P[1] ? [P[1].x + P[1].w - 40, P[1].y - 30] : [700, 70], [6, 300]];
    spots.forEach((s, i) => { if (found.includes(i)) return; const e = mk(SHELF, EGGP(C[i]), `left:${s[0]}px;top:${s[1]}px;rotate:${(i - 1) * 14}deg`, 'egg tap'); e.dataset.egg = 'easter'; e.dataset.i = i; });
  }
  if (ev === 'april' && E.april) {
    const r = P[(clock().getDate() + 1) % Math.max(1, P.length)] || H, fx = mk(SHELF, FISH, `left:${r.x + r.w * .55}px;top:${r.y + 4}px;rotate:-12deg`, 'egg tap'); fx.dataset.egg = 'fish';
  }
}
stage.addEventListener('click', e => {
  const t = e.target.closest('.tap'); if (!t) return; const n = t.dataset.egg, r = rel(t);
  if (n === 'pumpkin') { eggCandy(r.x + r.w / 2, r.y + r.h / 3); t.animate([{transform: 'scale(1)'}, {transform: 'scale(1.25) rotate(-8deg)'}, {transform: 'scale(1)'}], {duration: 450}); if (Math.random() < .3) bubble('Hé hé hé !', r.x - 40, r.y - 40, 1800); }
  else if (n === 'light') eggLight();
  else if (n === 'fish') { t.animate([{rotate: '-12deg'}, {rotate: '8deg'}, {rotate: '-20deg'}, {rotate: '-12deg'}], {duration: 600}); toast("🐟 Poisson d'avril !"); }
  else if (n === 'easter') { let all = {}; try { all = JSON.parse(localStorage.getItem('eggsFound') || '{}'); } catch (x) {} const k = todayKey(), L = all[k] = (all[k] || []).concat(+t.dataset.i); try { localStorage.setItem('eggsFound', JSON.stringify({[k]: L})); } catch (x) {} gone(t.animate([{transform: 'scale(1)'}, {transform: 'scale(1.6)', opacity: 0}], {duration: 500}), t); if (L.length >= 3) { toast('🐣 Bravo ! Tu as trouvé tous les œufs !', 5); boostFx('confetti', 6000, 2); } else toast(`🥚 Œuf trouvé ! (${L.length}/3)`); }
});

/* ----- Textes et nombres rigolos ----- */
const inBzh = () => LAT > 47.2 && LAT < 48.95 && LON > -5.3 && LON < -1;
function eggDesc(c) {
  if (!cfg.eggs.bzh || !inBzh()) return '';
  if (c.k === 'drizzle') return 'Crachin breton';
  if ((c.code === 80 || c.code === 81) && c.day && clock().getHours() % 2) return 'Il fait beau plusieurs fois par jour';
  return '';
}
let numKey = '';
function eggTemp(c) {
  if (!cfg.eggs.nums) return; const k = c.T + '-' + clock().getHours(); if (k === numKey) return;
  const m = cfg.unit === 'C' && {42: '42° · la réponse à la grande question 🌌', 0: 'Zéro pile ! 🧊', 37: '37° : la température du corps humain 🤒', '-1': 'Moins un… ça pique 🥶'}[c.T];
  if (m) { numKey = k; setTimeout(() => toast(m, 5), 2500); }
  if (curEv && curEv.id === 'fri13' && c.T === 13 && cfg.eggs.fri13) { numKey = k; setTimeout(eggCat, 4000); }
}
function eggsRender(c) {
  if (PV || !cfg.eggs.snow1 || (c.s !== 'snow' && c.s !== 'blizzard')) return;
  const d = clock(), season = d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1;
  try { if (localStorage.getItem('snow1') !== String(season)) { localStorage.setItem('snow1', season); showNotice({text: '❄ Première neige de la saison ! ❄', sec: 12}); } } catch (e) {}
}

/* ----- Planificateur des apparitions ----- */
function eggTick() {
  if (document.hidden || view !== 1 || Date.now() < eggBusy) return;
  const E = cfg.eggs, ev = curEv && curEv.id, d = clock(), night = lastW ? !lastW.current.is_day : (d.getHours() < 7 || d.getHours() > 19), r = Math.random();
  if (ev === 'halloween' && E.halloween) { const b = (d.getDate() === 31 ? 1.7 : 1) * (night ? 1.3 : 1); if (r < .05 * b) eggGhost(); else if (r < .085 * b) eggSpider(); else if (r < .115 * b) eggBats(); else if (r < .125 * b) eggCat(); }
  else if (ev === 'fri13' && E.fri13) { if (r < .06) eggCat(); else if (r < .08) eggBats(); }
  else if (ev === 'starwars' && E.starwars) { if (r < .03) eggHyper(); }
  else if (ev === 'april' && E.april) { if (r < .035) eggAprilJoke(); }
  if (Date.now() < eggBusy) return;
  if (E.ufo && night && Math.random() < 1 / 1080) eggUfo();
  else if (E.wolf && !HT.noAstro && (wState === 'fullmoon' || (night && moonFull())) && Math.random() < .012) eggWolf();
  else if (HT.id === 'manga' && Math.random() < .045) eggImpact();
  else if (HT.id === 'western' && Math.random() < (wState === 'wind' ? .25 : .05)) eggTumble();
}
setInterval(eggTick, 10000);
/* Nouvel An : compte à rebours géant à 23:59:50 */
let nyDone = '';
setInterval(() => { if (!cfg.eggs.newyear) return; const d = clock(); if (d.getMonth() === 11 && d.getDate() === 31 && d.getHours() === 23 && d.getMinutes() === 59 && d.getSeconds() >= 50 && nyDone !== String(d.getFullYear())) { nyDone = String(d.getFullYear()); eggCountdown(60 - d.getSeconds()); } }, 500);
/* Code secret : ↑ ↑ ↓ ↓ ← → ← → B A  (ou 7 tapes rapides sur la température) */
const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']; let kpos = 0, taps = [];
addEventListener('keydown', e => { if (!cfg.eggs.konami) return; const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; kpos = k === KONAMI[kpos] ? kpos + 1 : (k === KONAMI[0] ? 1 : 0); if (kpos === KONAMI.length) { kpos = 0; eggDisco(); } });
$('temp').addEventListener('click', () => { if (!cfg.eggs.konami) return; const n = Date.now(); taps = taps.filter(t => n - t < 3000).concat(n); if (taps.length >= 7) { taps = []; eggDisco(); } });
