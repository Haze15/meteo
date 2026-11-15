
/* ===================================================================
   🔒 ACCÈS RESTREINT : ouverture façon coffre-fort (≈ 3,8 s)
   =================================================================== */
let xrOn = false;
function xrVault() {
  if (xrOn) return; xrOn = true;
  const el = document.createElement('div'); el.id = 'xrv';
  const bolts = Array.from({length: 8}, (_, i) => `<i style="--r:${i * 45}deg"></i>`).join('');
  const ticks = Array.from({length: 40}, (_, i) => `<b style="transform:rotate(${i * 9}deg) translateY(-50px)"></b>`).join('');
  el.innerHTML = `<div class="xv-door"><div class="xv-ring"></div><div class="xv-bolts">${bolts}</div><div class="xv-dial"><div class="xv-ticks">${ticks}</div><div class="xv-knob"></div></div><div class="xv-handle"><span></span><span></span><span></span></div></div><div class="xv-msg">ACCÈS AUTORISÉ</div><div class="xv-glow"></div>`;
  stage.appendChild(el);
  if (!PV && typeof AMB !== 'undefined' && cfg.snd && cfg.snd.on) AMB.one('vault');
  setTimeout(() => el.classList.add('s1'), 1150);   // les pênes rentrent
  setTimeout(() => el.classList.add('s2'), 1950);   // la poignée tourne
  setTimeout(() => el.classList.add('s3'), 2350);   // la porte s'ouvre
  setTimeout(() => el.classList.add('out'), 3300);
  setTimeout(() => { el.remove(); xrOn = false; }, 4000);
  el.addEventListener('pointerdown', e => e.stopPropagation());
}
