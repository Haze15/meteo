
/* ===================================================================
   ÉCRAN DE DÉMARRAGE « Welcome to AZURE OS » (≈ 6 s)
   =================================================================== */
let bootOn = false;
function runBoot(force) {
  const B = cfg.boot || {}; if (bootOn || (!force && B.on === false)) return; bootOn = true;
  if (B.style !== 'azure') return runLinuxBoot();
  const title = String(B.title || 'AZURE OS').slice(0, 24), sub = String(B.sub == null ? 'Welcome to' : B.sub).slice(0, 40);
  const el = document.createElement('div'); el.id = 'boot';
  el.innerHTML = `<canvas width="800" height="480"></canvas><div class="bt-grid"></div><div class="bt-halo"></div>
    <svg class="bt-logo" viewBox="-62 -62 124 124" aria-hidden="true"><defs><linearGradient id="btg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9ffcff"/><stop offset=".5" stop-color="#22b8ff"/><stop offset="1" stop-color="#2a5cff"/></linearGradient></defs>
      <circle class="bt-orb" r="58"/><path class="bt-hex" d="M0 -48L41.6 -24V24L0 48L-41.6 24V-24Z"/><path class="bt-hex2" d="M0 -36L31.2 -18V18L0 36L-31.2 18V-18Z"/><path class="bt-a" d="M-17 20L0 -22L17 20M-9.5 6H9.5"/></svg>
    <div class="bt-sub">${esc(sub)}</div>
    <div class="bt-title">${[...title].map((c, i) => `<span style="animation-delay:${(2.35 + i * .08).toFixed(2)}s">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}</div>
    <div class="bt-bar"><i></i></div><div class="bt-st"></div><div class="bt-flash"></div>`;
  stage.appendChild(el);
  /* particules qui convergent vers le logo, tournent autour, puis explosent */
  const cv = el.querySelector('canvas'), g = cv.getContext('2d'), CX = 400, CY = 150, t0 = performance.now();
  const P = Array.from({length: cfg.lite ? 70 : 150}, (_, i) => { const a = Math.random() * 6.283, d = 420 + Math.random() * 260; return {sx: CX + Math.cos(a) * d, sy: CY + Math.sin(a) * d * .7, a: i / 150 * 6.283 * 3, r: 64 + Math.random() * 46, s: .6 + Math.random() * 1.8, sp: (.4 + Math.random() * .8) * (Math.random() < .5 ? 1 : -1), h: 190 + Math.random() * 30, dl: Math.random() * .7}; });
  const ease = x => x < 0 ? 0 : x > 1 ? 1 : 1 - Math.pow(1 - x, 3);
  (function draw(now) {
    if (!el.isConnected) return;
    const t = (now - t0) / 1000; g.clearRect(0, 0, 800, 480); g.globalCompositeOperation = 'lighter';
    P.forEach(p => {
      const ang = p.a + t * p.sp, ox = CX + Math.cos(ang) * p.r, oy = CY + Math.sin(ang) * p.r * .92;
      let x, y, al;
      if (t < 2.4) { const k = ease((t - .2 - p.dl) / 1.7); x = p.sx + (ox - p.sx) * k; y = p.sy + (oy - p.sy) * k; al = Math.min(1, Math.max(0, (t - .2) * 2)) * .9; }
      else if (t < 5.1) { x = ox; y = oy; al = .55 + .35 * Math.sin(t * 3 + p.a); }
      else { const k = (t - 5.1) * 2.4, dx = ox - CX, dy = oy - CY; x = ox + dx * k * k * 3; y = oy + dy * k * k * 3; al = Math.max(0, 1 - k); }
      const r = p.s * (t > 5.1 ? 1.6 : 1);
      g.fillStyle = `hsla(${p.h},100%,70%,${al})`; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
      if (t < 2.4 && t > .3) { g.strokeStyle = `hsla(${p.h},100%,70%,${al * .25})`; g.lineWidth = r; g.beginPath(); g.moveTo(x, y); const k2 = ease((t - .32 - p.dl) / 1.7); g.lineTo(p.sx + (ox - p.sx) * k2, p.sy + (oy - p.sy) * k2); g.stroke(); }
    });
    requestAnimationFrame(draw);
  })(t0);
  const ST = ['Initialisation du noyau…', 'Calibrage des capteurs atmosphériques…', 'Connexion au satellite météo…', 'Chargement des thèmes…', 'Système prêt.'], st = el.querySelector('.bt-st');
  ST.forEach((s, i) => setTimeout(() => { st.textContent = s; }, 3100 + i * 440));
  if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on) setTimeout(() => { try { AMB.unlock(); if (AMB.state() === 'on') AMB.one('startup'); } catch (e) {} }, 2300);
  let done = false;
  const end = () => { if (done) return; done = true; el.classList.add('out'); setTimeout(() => { el.remove(); bootOn = false; }, 900); };
  setTimeout(end, 5300);
  el.addEventListener('pointerdown', e => { e.stopPropagation(); end(); });
}

/* ----- Variante « Linux » : GRUB → messages du noyau → logo → connexion (≈ 7 s) ----- */
function runLinuxBoot() {
  const B = cfg.boot || {}, T = String(B.title || 'AZURE OS').slice(0, 24), name = T.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).replace(/\bos\b/i, 'OS'), host = noAcc(T).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'azure-os';
  const el = document.createElement('div'); el.id = 'lboot';
  el.innerHTML = `<div class="lb-grub"><div class="lb-gh">GNU GRUB  version 2.12</div><div class="lb-gm"><div class="on">*${esc(name)}</div><div>Options avancées pour ${esc(name)}</div><div>Test de la mémoire (memtest86+)</div><div>Paramètres du micrologiciel UEFI</div></div><div class="lb-gf">Utilisez les touches ↑ et ↓ pour choisir une entrée.<br>Démarrage automatique de l'entrée sélectionnée dans <span id="lbc">1</span> s.</div></div>
    <div class="lb-log"></div>
    <div class="lb-splash"><svg viewBox="-62 -62 124 124"><path d="M0 -48L41.6 -24V24L0 48L-41.6 24V-24Z" fill="rgba(34,140,255,.15)" stroke="#22b8ff" stroke-width="3.2"/><path d="M-17 20L0 -22L17 20M-9.5 6H9.5" fill="none" stroke="#fff" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/></svg><b>${esc(T.toUpperCase())}</b><div class="lb-dots"><i></i><i></i><i></i><i></i><i></i></div></div>
    <div class="lb-tty"></div>`;
  stage.appendChild(el);
  const log = el.querySelector('.lb-log'), R = srnd(Date.now() % 7919 + 3), d = clock();
  let ts = 0;
  const K = s => { ts += .02 + R() * .18; return `<span class="ts">[${ts.toFixed(6).padStart(12, ' ')}]</span> ${esc(s)}`; };
  const OK = s => `<span class="ok">[  <b>OK</b>  ]</span> ${esc(s)}`, ST = s => `         ${esc(s)}`, WR = s => `<span class="ok">[ <span class="wr">WARN</span> ]</span> ${esc(s)}`;
  const nT = Object.keys(SIG).length + (typeof HUDS !== 'undefined' ? HUDS.length : 0);
  const L = [
    K(`Linux version 6.8.0-${host} (meteo@lycee) (gcc 13.2.0) #1 SMP PREEMPT ${d.getFullYear()}`), K(`Command line: BOOT_IMAGE=/vmlinuz-6.8.0-${host} root=/dev/mmcblk0p2 ro quiet splash`),
    K('Memory: 3897412K/4194304K available'), K('CPU: ARMv8 Processor rev 3 (v8l) 4 cœurs, 1.8 GHz'), K('Calibrating delay loop... 108.00 BogoMIPS'),
    K('mmc0: new high speed SDXC card at address aaaa'), K('usb 1-1: new high-speed USB device number 2'), K('input: écran tactile 800x480 as /devices/platform/touch0'),
    K('vc4-drm gpu: [drm] Initialized vc4 0.0.0 for gpu on minor 0'), K('EXT4-fs (mmcblk0p2): mounted filesystem with ordered data mode'),
    K(`systemd[1]: systemd 255 running in system mode`), K(`systemd[1]: Hostname set to <${host}>.`),
    OK('Created slice Slice /system/getty.'), OK('Reached target Local File Systems.'), OK('Started Journal Service.'), ST('Starting Load Kernel Modules...'),
    OK('Finished Load Kernel Modules.'), OK('Started Network Manager.'), OK('Reached target Network.'), ST('Starting Network Time Synchronization...'),
    OK('Started Network Time Synchronization.'), OK(`Mounted /home/meteo.`), ST('Starting Atmospheric Sensors Daemon...'), OK('Started Atmospheric Sensors Daemon.'),
    OK(`Started Open-Meteo sync (lat ${LAT.toFixed(3)}, lon ${LON.toFixed(3)}).`), OK('Started Rain Radar Service.'), OK('Started Lightning Detector (Blitzortung).'),
    ...(cfg.snd && cfg.snd.on ? [OK('Started Ambient Sound Synthesizer.')] : []), ...(cfg.masc && cfg.masc.on ? [OK('Started Mascot Animation Daemon.')] : []),
    ...(R() < .5 ? [WR('nuage-0x3f: couverture nuageuse supérieure à la normale.')] : []),
    OK(`Loaded ${nT} themes (actif : ${cfg.hud}).`), OK('Reached target Graphical Interface.'), ST(`Starting ${name} Display Manager...`), OK(`Started ${name} Display Manager.`)
  ];
  const tm = []; const at = (ms, f) => tm.push(setTimeout(f, ms));
  let c = 1; at(450, () => { const e = el.querySelector('#lbc'); if (e) e.textContent = c = 0; });
  at(900, () => { el.classList.add('p2'); });
  L.forEach((l, i) => at(950 + i * (2450 / L.length) + R() * 40, () => { const dv = document.createElement('div'); dv.innerHTML = l; log.appendChild(dv); while (log.children.length > 34) log.firstChild.remove(); if (i % 6 === 0 && typeof AMB !== 'undefined' && !PV && cfg.snd && cfg.snd.on) AMB.type(3); }));
  at(3550, () => el.classList.add('p3'));
  if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on) at(3700, () => { try { AMB.unlock(); if (AMB.state() === 'on') AMB.one('startup'); } catch (e) {} });
  const tty = el.querySelector('.lb-tty');
  at(5550, () => {
    el.classList.add('p4'); const now = clock();
    const TTY = [`${name} 26.10 LTS ${host} tty1`, '', `${host} login: meteo (connexion automatique)`, `Dernière connexion : ${FR_D[now.getDay()].slice(0, 3)} ${now.getDate()} ${FR_M[now.getMonth()].slice(0, 3)} ${HM(now)} sur tty1`, '', `Bienvenue sur ${name} ! Météo à ${shortCity()} : ${CTX ? CTX.T + '°, ' + String(CTX.base || '').toLowerCase() : 'chargement…'}`];
    TTY.forEach((l, i) => at(50 + i * 110, () => { tty.innerHTML += esc(l) + '<br>'; }));
    at(50 + TTY.length * 110, () => { tty.innerHTML += `meteo@${esc(host)}:~$ <span class="typ"></span><span class="cur"></span>`; const tp = tty.querySelector('.typ'); [...'startx meteo'].forEach((ch, j) => at(60 + j * 35, () => { tp.textContent += ch; })); });
  });
  let done = false;
  const end = () => { if (done) return; done = true; tm.forEach(clearTimeout); el.classList.add('out'); setTimeout(() => { el.remove(); bootOn = false; }, 700); };
  at(7050, end);
  el.addEventListener('pointerdown', e => { e.stopPropagation(); end(); });
}
