
/* ===================================================================
   ROLL DES STYLES — façon ouverture de caisse : les styles défilent,
   ralentissent et le résultat (aléatoire, pondéré par la rareté) s'applique
   =================================================================== */
let ROLLED = null, rolling = false;
try { if (!PV) ROLLED = JSON.parse(localStorage.getItem('rollHud') || 'null'); } catch (e) {}
function rollHud() { return ROLLED && ROLLED.base === cfg.hud && SIG[ROLLED.id] ? ROLLED.id : null; }
const XSEC = 'x0', XP = .002, ISEC = 'inf', IP = .001, VSEC = 'void', VP = .0001, TSEC = 'tes', TP = .00001, GSEC = 'gen', GP = .000001, TRSEC = 'train', TRP = .0000001, ABSEC = 'aby', ABP = .0000005;
function rollPool() { const P = (cfg.roll && cfg.roll.pool) || []; return SIGLIST.map(r => r[0]).filter(id => SIG[id] && id !== 'pres' && (!P.length || P.includes(id))); }
const rarOf = id => id === ABSEC ? ['secret', '◉ ? ? ? ◉', '#ffffff', .00005] : id === TRSEC ? ['secret', '🚂 ? ? ? 🚂', '#ffffff', .00001] : id === GSEC ? ['secret', '✺ ? ? ? ✺', '#ffffff', .0001] : id === TSEC ? ['secret', '◈ ? ? ? ◈', '#ffffff', .001] : id === VSEC ? ['secret', '∅ NÉANT', '#ffffff', .01] : id === ISEC ? ['secret', '∞ INFINI ∞', '#ffffff', .1] : id === XSEC ? ['secret', '✦ SECRET ✦', '#ffffff', .2] : RARITY.find(r => r[0] === (RAR[id] || 'blue')) || RARITY[0];
function pickRoll(pool, avoid) {
  if (avoid !== '~filler' && SIG[TRSEC] && (Math.random() < TRP || (QS.get('rollx') === '6' && avoid !== '~f'))) return TRSEC;
  if (avoid !== '~filler' && SIG[ABSEC] && (Math.random() < ABP || (QS.get('rollx') === '8' && avoid !== '~f'))) return ABSEC;
  if (avoid !== '~filler' && SIG[GSEC] && (Math.random() < GP || (QS.get('rollx') === '5' && avoid !== '~f'))) return GSEC;
  if (avoid !== '~filler' && SIG[TSEC] && (Math.random() < TP || (QS.get('rollx') === '4' && avoid !== '~f'))) return TSEC;
  if (avoid !== '~filler' && SIG[VSEC] && (Math.random() < VP || (QS.get('rollx') === '3' && avoid !== '~f'))) return VSEC;
  if (avoid !== '~filler' && SIG[ISEC] && (Math.random() < IP || (QS.get('rollx') === '2' && avoid !== '~f'))) return ISEC;
  if (avoid !== '~filler' && SIG[XSEC] && (Math.random() < XP || (['1', '7'].includes(QS.get('rollx')) && avoid !== '~f'))) return XSEC;
  const tiers = RARITY.filter(r => pool.some(id => (RAR[id] || 'blue') === r[0])), tot = tiers.reduce((a, r) => a + r[3], 0);
  for (let n = 0; n < 6; n++) {
    let x = Math.random() * tot, t = tiers[tiers.length - 1]; for (const r of tiers) { if ((x -= r[3]) < 0) { t = r; break; } }
    const L = pool.filter(id => (RAR[id] || 'blue') === t[0]), id = L[Math.random() * L.length | 0];
    if (id !== avoid || pool.length < 2) return id;
  }
  return pool.find(id => id !== avoid);
}
function rollCard(id) {
  if (id === ABSEC) return `<div class="rl-c rl-x rl-aby" style="--rc:#fff"><div class="rl-sw"><b>◉</b><i>???</i></div><div class="rl-n">◉ ? ? ? ◉</div></div>`;
  if (id === TRSEC) return `<div class="rl-c rl-x rl-train" style="--rc:#fff"><div class="rl-sw"><b>🎫</b><i>???</i></div><div class="rl-n">🚂 ? ? ? 🚂</div></div>`;
  if (id === GSEC) return `<div class="rl-c rl-x rl-gen" style="--rc:#fff"><div class="rl-sw"><b>✺</b><i>???</i></div><div class="rl-n">✺ ? ? ? ✺</div></div>`;
  if (id === TSEC) return `<div class="rl-c rl-x rl-tes" style="--rc:#fff"><div class="rl-sw"><b>◈</b><i>???</i></div><div class="rl-n">◈ ? ? ? ◈</div></div>`;
  if (id === VSEC) return `<div class="rl-c rl-x rl-void" style="--rc:#fff"><div class="rl-sw"><b>∅</b><i>???</i></div><div class="rl-n">· · ·</div></div>`;
  if (id === ISEC) return `<div class="rl-c rl-x rl-inf" style="--rc:#fff"><div class="rl-sw"><b>∞</b><i>???</i></div><div class="rl-n">? ? ? ? ?</div></div>`;
  if (id === XSEC) return `<div class="rl-c rl-x" style="--rc:#fff"><div class="rl-sw"><b>?</b><i>???</i></div><div class="rl-n">✦ ? ? ? ✦</div></div>`;
  const r = SIGLIST.find(x => x[0] === id) || [id, id, '', '#333', '#fff', 'sans-serif', 700, ''], q = rarOf(id);
  return `<div class="rl-c" style="--rc:${q[2]}"><div class="rl-sw" style="background:${r[3]};color:${r[4]};font-family:${esc(r[5])}"><b style="font-weight:${r[6]}">14°</b><i>${esc(r[7])}</i></div><div class="rl-n">${esc(r[1])}</div></div>`;
}
function runRoll() {
  if (rolling) return; if (typeof bootOn !== 'undefined' && bootOn) { setTimeout(runRoll, 1200); return; }
  const pool = rollPool(); if (pool.length < 2) return;
  rolling = true; if (typeof SLEEPING !== 'undefined' && SLEEPING) wakeUntil = Date.now() + 20000;
  const cur = HT.id, win = pickRoll(pool, cur), N = 58, WI = 50, CW = 150;
  const cards = Array.from({length: N}, (_, i) => i === WI ? win : (Math.random() < .012 ? XSEC : Math.random() < .006 ? ISEC : Math.random() < .004 ? VSEC : Math.random() < .003 ? TSEC : Math.random() < .002 ? GSEC : Math.random() < .0015 ? TRSEC : Math.random() < .0015 ? ABSEC : pickRoll(pool, '~f')));
  const el = document.createElement('div'); el.id = 'roll';
  el.innerHTML = `<div class="rl-top">🎰 ROLL DU STYLE</div><div class="rl-box"><div class="rl-strip">${cards.map(rollCard).join('')}</div><div class="rl-mark"></div></div><div class="rl-odds">${RARITY.map(r => `<span style="color:${r[2]}">■ ${r[1]} ${String(r[3]).replace('.', ',')} %</span>`).join('')}<span class="rl-xs">✦ ??? 0,2 % (✨ 1/4096)</span><span class="rl-xs">∞ ??? 0,1 %</span><span class="rl-xs">∅ ??? 0,01 %</span><span class="rl-xs">◈ ??? 0,001 %</span><span class="rl-xs">✺ ??? 0,0001 %</span><span class="rl-xs">◉ ??? 0,00005 %</span><span class="rl-xs">🚂 ??? 0,00001 %</span></div><div class="rl-res"></div>`;
  stage.appendChild(el);
  const strip = el.querySelector('.rl-strip'), target = 400 - (WI * CW + 70) + (Math.random() - .5) * 112, snd = !PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on;
  strip.style.transform = 'translateX(0px)'; strip.getBoundingClientRect();
  requestAnimationFrame(() => { strip.style.transition = 'transform 6.6s cubic-bezier(.06,.62,.1,1)'; strip.style.transform = `translateX(${target.toFixed(1)}px)`; });
  let lastIdx = -1;
  (function tk() {   // petit « clic » à chaque carte qui passe sous le repère
    if (!el.isConnected || el.classList.contains('done')) return;
    const m = new DOMMatrixReadOnly(getComputedStyle(strip).transform), i = Math.floor((400 - m.m41) / CW);
    if (i !== lastIdx) { lastIdx = i; if (snd) AMB.one('rtick'); }
    requestAnimationFrame(tk);
  })();
  setTimeout(() => {
    el.classList.add('done'); const wc = strip.children[WI]; wc.classList.add('win');
    const q = rarOf(win), r = SIGLIST.find(x => x[0] === win);
    el.querySelector('.rl-res').innerHTML = `<small style="color:${q[2]}">${esc(q[1])}</small><b>${esc(r ? r[1] : (SIG[win] ? SIG[win].name.replace(/✦\s*/g, '') : win))}</b><span>Nouveau style !</span>`;
    el.style.setProperty('--rc', q[2]); if (q[0] === 'gold' || q[0] === 'red') el.classList.add('big');
    const SHINY = win === XSEC && SIG.x0s && (Math.random() < 1 / 4096 || QS.get('rollx') === '7');
    if (SHINY && !PV) try { const g = JSON.parse(localStorage.getItem('x0sGot') || 'null') || {t: Date.now(), n: 0}; g.n++; localStorage.setItem('x0sGot', JSON.stringify(g)); } catch (e) {}
    if (win === XSEC && !PV) try { const g = JSON.parse(localStorage.getItem('x0Got') || 'null') || {t: Date.now(), n: 0}; g.n++; localStorage.setItem('x0Got', JSON.stringify(g)); } catch (e) {}
    if (win === XSEC) { el.classList.add('big', 'xwin'); const rc = wc.querySelector('.rl-n'), sb = wc.querySelector('.rl-sw b'); if (rc) rc.textContent = SHINY ? '✨ SINGULARITÉ SHINY ✨' : '✦ Singularité ✦'; if (sb) sb.textContent = SHINY ? '✨' : '✦'; if (SHINY) { wc.classList.add('rl-shiny'); el.classList.add('shiny'); if (snd) setTimeout(() => AMB.one('shiny'), 1300); } if (snd) { AMB.one('jackpot'); setTimeout(() => AMB.one('jackpot'), 700); } }
    if (snd) AMB.one(q[0] === 'gold' || q[0] === 'red' ? 'jackpot' : 'win');
    if (win === TRSEC) {   // 1 chance sur 10 000 000
      if (!PV) try { const g = JSON.parse(localStorage.getItem('trainGot') || 'null') || {t: Date.now(), n: 0}; g.n++; localStorage.setItem('trainGot', JSON.stringify(g)); } catch (e) {}
      el.classList.add('big', 'xwin'); const rc = wc.querySelector('.rl-n'); if (rc) rc.textContent = '🎫 BILLET D\'OR 🎫';
      setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); rolling = false; }, 700); ROLLED = {id: win, base: cfg.hud, t: Date.now()}; if (!PV) try { localStorage.setItem('rollHud', JSON.stringify(ROLLED)); localStorage.setItem('rollLast', String(Date.now())); } catch (e) {} applyCfg(); }, 3200);
      return;
    }
    if (win === ABSEC) {   // 1 chance sur 2 000 000
      if (!PV) try { const g = JSON.parse(localStorage.getItem('abyGot') || 'null') || {t: Date.now(), n: 0}; g.n++; localStorage.setItem('abyGot', JSON.stringify(g)); } catch (e) {}
      el.classList.add('big', 'xwin'); const rc = wc.querySelector('.rl-n'); if (rc) rc.textContent = '◉ 1 / 2 000 000 ◉';
      setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); rolling = false; }, 700); ROLLED = {id: win, base: cfg.hud, t: Date.now()}; if (!PV) try { localStorage.setItem('rollHud', JSON.stringify(ROLLED)); localStorage.setItem('rollLast', String(Date.now())); } catch (e) {} applyCfg(); }, 3200);
      return;
    }
    if (win === GSEC) {   // 1 chance sur 1 000 000
      if (!PV) try { const g = JSON.parse(localStorage.getItem('genGot') || 'null') || {t: Date.now(), n: 0}; g.n++; localStorage.setItem('genGot', JSON.stringify(g)); } catch (e) {}
      el.classList.add('big', 'xwin'); const rc = wc.querySelector('.rl-n'); if (rc) rc.textContent = '✺ 1 / 1 000 000 ✺';
      setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); rolling = false; }, 700); ROLLED = {id: win, base: cfg.hud, t: Date.now()}; if (!PV) try { localStorage.setItem('rollHud', JSON.stringify(ROLLED)); localStorage.setItem('rollLast', String(Date.now())); } catch (e) {} applyCfg(); }, 3200);
      return;
    }
    if (win === TSEC) {   // le plus rare de tous : 1 sur 100 000
      if (!PV) try { const g = JSON.parse(localStorage.getItem('tesGot') || 'null') || {t: Date.now(), n: 0}; g.n++; localStorage.setItem('tesGot', JSON.stringify(g)); } catch (e) {}
      el.classList.add('big', 'xwin'); const rc = wc.querySelector('.rl-n'); if (rc) rc.textContent = '◈ TESSERACT ◈';
      setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); rolling = false; }, 700); ROLLED = {id: win, base: cfg.hud, t: Date.now()}; if (!PV) try { localStorage.setItem('rollHud', JSON.stringify(ROLLED)); localStorage.setItem('rollLast', String(Date.now())); } catch (e) {} applyCfg(); }, 2800);
      return;
    }
    if (win === VSEC) {   // le plus rare de tous
      if (!PV) try { const g = JSON.parse(localStorage.getItem('voidGot') || 'null') || {t: Date.now(), n: 0}; g.n++; localStorage.setItem('voidGot', JSON.stringify(g)); } catch (e) {}
      el.classList.add('big', 'xwin'); const rc = wc.querySelector('.rl-n'); if (rc) rc.textContent = '∅ NÉANT';
      setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); rolling = false; }, 700); ROLLED = {id: win, base: cfg.hud, t: Date.now()}; if (!PV) try { localStorage.setItem('rollHud', JSON.stringify(ROLLED)); localStorage.setItem('rollLast', String(Date.now())); } catch (e) {} applyCfg();   /* la cinématique part toute seule, sur l'ancien style */ }, 2600);
      return;
    }
    if (win === ISEC) {   // l'infini a droit à sa cinématique d'une minute
      if (!PV) try { const g = JSON.parse(localStorage.getItem('infGot') || 'null') || {t: Date.now(), n: 0}; g.n++; localStorage.setItem('infGot', JSON.stringify(g)); } catch (e) {}
      el.classList.add('big', 'xwin'); const rc = wc.querySelector('.rl-n'), sb = wc.querySelector('.rl-sw b'); if (rc) rc.textContent = '∞ INFINI ∞';
      setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); rolling = false; }, 700); ROLLED = {id: win, base: cfg.hud, t: Date.now()}; if (!PV) try { localStorage.setItem('rollHud', JSON.stringify(ROLLED)); localStorage.setItem('rollLast', String(Date.now())); } catch (e) {} applyCfg();   /* la cinématique part toute seule, sur l'ancien style */ }, 2200);
      return;
    }
    if (win === XSEC) {   // le secret a droit à sa cinématique complète
      setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); rolling = false; }, 700); ROLLED = {id: SHINY ? 'x0s' : win, base: cfg.hud, t: Date.now()}; if (!PV) try { localStorage.setItem('rollHud', JSON.stringify(ROLLED)); localStorage.setItem('rollLast', String(Date.now())); } catch (e) {} applyCfg();   /* la cinématique part toute seule, sur l'ancien style */ }, 2200);
      return;
    }
    setTimeout(() => {
      ROLLED = {id: win, base: cfg.hud, t: Date.now()};
      if (!PV) try { localStorage.setItem('rollHud', JSON.stringify(ROLLED)); localStorage.setItem('rollLast', String(Date.now())); } catch (e) {}
      el.classList.add('out'); applyCfg();
      setTimeout(() => { el.remove(); rolling = false; }, 700);
    }, win === XSEC ? 5200 : 3000);
  }, 6900);
}
/* Rolls automatiques : au démarrage, une fois par jour, ou toutes les N heures */
function rollAuto() {
  const R = cfg.roll || {}; if (PV || rolling || (typeof bootOn !== 'undefined' && bootOn) || (typeof SLEEPING !== 'undefined' && SLEEPING)) return;
  const now = clock(); let last = 0; try { last = +(localStorage.getItem('rollLast') || 0); } catch (e) {}
  if (R.mode === 'daily') { const day = now.toDateString(); let done = ''; try { done = localStorage.getItem('rollDay'); } catch (e) {} if (now.getHours() >= +R.hour && done !== day) { try { localStorage.setItem('rollDay', day); } catch (e) {} runRoll(); } }
  else if (R.mode === 'interval' && Date.now() - last > clamp(+R.every || 6, 1, 168) * 3600e3) runRoll();
}
setInterval(rollAuto, 30000);
if (!PV && cfg.roll && cfg.roll.mode === 'boot') setTimeout(runRoll, cfg.boot && cfg.boot.on !== false && !QS.get('noboot') ? 7700 : 1500);
else if (!PV) setTimeout(rollAuto, 9000);
/* Triple tape sur le nom en haut à gauche = roll */
let rtaps = [];
$('city').addEventListener('pointerdown', () => { if (!cfg.roll || cfg.roll.tap === false) return; const t = Date.now(); rtaps = rtaps.filter(x => t - x < 900); rtaps.push(t); if (rtaps.length >= 3) { rtaps = []; runRoll(); } });
