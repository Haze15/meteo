/* ===== Serveur + mot de passe =====
   La config est enregistrée dans config.json (branche « config » du dépôt GitHub du site).
   Le jeton GitHub qui permet d'écrire est stocké chiffré (AES-256, clé tirée du mot de passe) dans admin.json :
   sans le mot de passe, personne ne peut modifier l'écran. */
const status = (m, ok) => { $('st').innerHTML = `<span class="dot ${ok === true ? 'ok' : ok === false ? 'bad' : ''}"></span>${m}`; };
const setConn = (ok, t) => { $('conn').innerHTML = `<span class="dot ${ok ? 'ok' : 'bad'}"></span>${t}`; };
$('repo').textContent = 'github.com/' + GHS.o + '/' + GHS.r + ' · branche ' + GHS.b; $('lkrepo').textContent = GHS.o + '/' + GHS.r;
const b2u = b => { let t = ''; new Uint8Array(b).forEach(x => t += String.fromCharCode(x)); return btoa(t); }, u2b = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
async function pwKey(pw, salt) { const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveKey']); return crypto.subtle.deriveKey({name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256'}, k, {name: 'AES-GCM', length: 256}, false, ['encrypt', 'decrypt']); }
async function seal(tok, pw) { const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12)); const d = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, await pwKey(pw, salt), new TextEncoder().encode(tok)); return {v: 1, kdf: 'PBKDF2-SHA256-250000', s: b2u(salt), i: b2u(iv), d: b2u(d)}; }
async function unseal(a, pw) { const d = await crypto.subtle.decrypt({name: 'AES-GCM', iv: u2b(a.i)}, await pwKey(pw, u2b(a.s)), u2b(a.d)); return new TextDecoder().decode(d); }
let TOK = '', ADM = null;
try { TOK = sessionStorage.getItem('ghTok') || localStorage.getItem('ghTok') || ''; } catch (e) {}
const api = (path, o = {}) => fetch(GHAPI + path, Object.assign({cache: 'no-store'}, o, {headers: Object.assign({Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + TOK}, o.headers || {})}));
async function ghPut(f, text, msg, tries = 2) {
  const cur = await ghGet(f, TOK);
  const r = await api('/contents/' + f, {method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({message: msg, content: b64u(text), branch: GHS.b, sha: cur ? cur.sha : undefined})});
  if ((r.status === 409 || r.status === 422) && tries > 1) return ghPut(f, text, msg, tries - 1);
  if (r.status === 401) throw new Error('jeton');
  if (r.status === 403 || r.status === 404) throw new Error('droits');
  if (!r.ok) throw new Error('serveur ' + r.status);
}
/* La branche « config » est créée au premier enregistrement (à partir de main) */
async function ensureBranch() {
  let r = await api('/git/ref/heads/' + GHS.b); if (r.ok) return;
  const repo = await (await api('')).json(), m = await (await api('/git/ref/heads/' + (repo.default_branch || 'main'))).json();
  r = await api('/git/refs', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ref: 'refs/heads/' + GHS.b, sha: m.object.sha})});
  if (r.status === 403 || r.status === 404) throw new Error('droits');
  if (!r.ok && r.status !== 422) throw new Error('branche ' + r.status);
}
async function checkTok(t) { const r = await fetch(GHAPI, {cache: 'no-store', headers: {Accept: 'application/vnd.github+json', Authorization: 'Bearer ' + t}}); if (!r.ok) return false; const j = await r.json(); return !!(j.permissions && j.permissions.push); }

/* ----- Écran de verrouillage ----- */
let lockMode = 'login';
function lockUI(mode, msg) {
  lockMode = mode; $('lock').hidden = false; $('lkerr').textContent = ''; $('lkmsg').textContent = msg;
  $('lksetup').hidden = !(mode === 'setup' || mode === 'token'); $('lkpw').hidden = mode === 'wait' || mode === 'token';
  $('lkp2w').hidden = !(mode === 'setup' || mode === 'newpw'); $('lkgo').hidden = mode === 'wait';
  $('lkcancel').hidden = !(mode === 'newpw' || mode === 'token');
  $('lkgo').textContent = mode === 'setup' ? 'Créer le mot de passe' : mode === 'newpw' ? 'Changer le mot de passe' : mode === 'token' ? 'Enregistrer le jeton' : 'Déverrouiller';
  $('lkp1').value = ''; $('lkp2').value = ''; $('lktok').value = '';
  $('lkp1').setAttribute('autocomplete', mode === 'login' ? 'current-password' : 'new-password');
  setTimeout(() => { const f = mode === 'setup' || mode === 'token' ? $('lktok') : $('lkp1'); if (f && !f.closest('[hidden]')) f.focus(); }, 50);
}
const unlocked = (keep) => {
  try { sessionStorage.setItem('ghTok', TOK); if (keep) localStorage.setItem('ghTok', TOK); else localStorage.removeItem('ghTok'); } catch (e) {}
  $('lock').hidden = true; loadSrv(true);
};
$('lkcancel').onclick = () => { $('lock').hidden = true; };
$('lockf').onsubmit = async e => {
  e.preventDefault(); const err = m => { $('lkerr').textContent = m; $('lkgo').disabled = false; }; $('lkgo').disabled = true;
  const p1 = $('lkp1').value, p2 = $('lkp2').value, tk = $('lktok').value.trim();
  try {
    if (lockMode === 'login') {
      try { TOK = await unseal(ADM, p1); } catch (x) { return err('Mot de passe incorrect.'); }
      $('lkgo').disabled = false; return unlocked($('lkkeep').checked);
    }
    if (lockMode === 'setup' || lockMode === 'token') {
      if (!/^(github_pat_|ghp_)\w{20,}$/.test(tk)) return err('Ce jeton ne ressemble pas à un jeton GitHub (il commence par github_pat_).');
      if (!(await checkTok(tk))) return err('Ce jeton ne peut pas écrire dans ' + GHS.o + '/' + GHS.r + ' : vérifie l\'accès « Contents : Read and write ».');
    }
    if (lockMode === 'setup' || lockMode === 'newpw') {
      if (p1.length < 6) return err('6 caractères minimum.'); if (p1 !== p2) return err('Les deux mots de passe sont différents.');
      if (lockMode === 'setup') { TOK = tk; await ensureBranch(); }
      ADM = await seal(TOK, p1); await ghPut('admin.json', JSON.stringify(ADM), 'Mot de passe de l\'admin');
      if (lockMode === 'setup' && !(await ghGet('config.json', TOK))) await ghPut('config.json', JSON.stringify(Object.assign({}, S, {v: Date.now()})), 'Config de l\'écran');
      $('lkgo').disabled = false; status('🔒 Mot de passe enregistré', true); return unlocked($('lkkeep').checked);
    }
    if (lockMode === 'token') { TOK = tk; $('lkgo').disabled = false; lockUI('newpw', 'Jeton valide. Choisis le mot de passe (tu peux reprendre le même).'); return; }
  } catch (x) { err(x.message === 'droits' ? 'Ce jeton peut lire mais pas écrire. Sur GitHub (Fine-grained tokens → ton jeton → Edit), mets Repository access sur « meteo » et Permissions → Contents sur « Read and write », enregistre, puis réessaie avec le même jeton.' : x.message === 'jeton' ? 'Jeton refusé par GitHub (expiré ou mal copié).' : 'Le serveur ne répond pas (' + x.message + '). Réessaie dans un instant.'); }
};
$('chpw').onclick = () => lockUI('newpw', 'Choisis le nouveau mot de passe.');
$('chtok').onclick = () => lockUI('token', 'Colle le nouveau jeton GitHub.');
$('logout').onclick = () => { try { sessionStorage.removeItem('ghTok'); localStorage.removeItem('ghTok'); } catch (e) {} TOK = ''; location.reload(); };

async function start() {
  lockUI('wait', 'Connexion au serveur…');
  try { const a = await ghGet('admin.json', TOK || undefined); ADM = a ? JSON.parse(a.text) : null; }
  catch (e) { lockUI('wait', 'Serveur injoignable. Vérifie la connexion Internet, puis recharge la page.'); return; }
  if (!ADM) return lockUI('setup', 'Première connexion : colle le jeton GitHub qui donne accès au site, puis choisis le mot de passe de l\'admin.');
  if (TOK && await checkTok(TOK).catch(() => false)) { $('lock').hidden = true; return loadSrv(true); }
  TOK = ''; lockUI('login', 'Entre le mot de passe pour modifier l\'écran.');
}

/* ----- Charger / enregistrer la config ----- */
async function loadSrv(first) {
  status('Chargement depuis le serveur…', null);
  try {
    const f = await ghGet('config.json', TOK);
    if (f && f.text) { S = norm(Object.assign({}, DEF, JSON.parse(f.text))); drawForm(); pvSched(); }
    setConn(true, 'Connecté'); status(first ? 'Connecté au serveur · les modifications sont enregistrées en ligne' : 'Config rechargée', true);
  } catch (e) { setConn(false, 'Injoignable'); status('Serveur injoignable : vérifie ta connexion Internet', false); }
}
function load() { loadSrv(false); }
$('test').onclick = load;
let saving = null, again = null;
async function push(label) {
  try { localStorage.setItem('adminDraft', JSON.stringify(S)); } catch (e) {}
  if (!TOK) { status('Verrouillé : entre le mot de passe pour enregistrer', false); return; }
  if (saving) { again = label; return; }
  S.v = Date.now(); const body = JSON.stringify(S); status('Enregistrement…', null);
  saving = ghPut('config.json', body, label + ' · ' + new Date().toLocaleString('fr-FR'))
    .then(() => { const t = new Date().toLocaleTimeString('fr-FR'); setConn(true, 'Connecté'); $('lastsave').textContent = t; status(label + ' · ' + t + ' · les écrans suivent en moins d\'une minute', true); })
    .catch(e => { if (e.message === 'droits') { status('Le jeton n\'a pas le droit d\'écrire (Contents : Read and write)', false); } else if (e.message === 'jeton') { status('Jeton refusé : il a expiré ou a été supprimé (Écran › Changer le jeton)', false); } else { setConn(false, 'Injoignable'); status('Enregistrement impossible : vérifie ta connexion Internet', false); } })
    .finally(() => { saving = null; if (again) { const l = again; again = null; push(l); } });
}
$('send').onclick = () => push('Enregistré');
$('sn').onclick = () => { const t = $('nt').value.trim(); if (!t) return; S.notice = {id: Date.now(), text: t, sec: +$('ns').value || 15}; push('Message envoyé'); };

/* ----- Sauvegarde ----- */
$('exb').onclick = () => { const c = JSON.parse(JSON.stringify(S)); delete c.notice; $('ex').value = JSON.stringify(c, null, 1); };
$('imb').onclick = () => { try { S = norm(Object.assign({}, DEF, JSON.parse($('ex').value))); drawForm(); status('Importé : pense à envoyer', null); } catch (e) { alert('JSON invalide'); } };
$('dl').onclick = () => { const c = JSON.parse(JSON.stringify(S)); delete c.notice; const l = document.createElement('a'); l.href = URL.createObjectURL(new Blob([JSON.stringify(c, null, 1)], {type: 'application/json'})); l.download = 'meteo-sauvegarde-' + new Date().toISOString().slice(0, 10) + '.json'; l.click(); status('Sauvegarde téléchargée', true); };
$('up').onclick = () => $('fl').click();
$('fl').onchange = async e => { try { S = norm(Object.assign({}, DEF, JSON.parse(await e.target.files[0].text()))); drawForm(); schedSave(); } catch (x) { alert('Fichier invalide'); } e.target.value = ''; };
$('rst').onclick = () => { if (confirm('Remettre la configuration par défaut (non envoyée) ?')) { S = norm(JSON.parse(JSON.stringify(DEF))); drawForm(); pvSched(); } };


try { const d = JSON.parse(localStorage.getItem('adminDraft') || 'null'); if (d) S = norm(Object.assign({}, DEF, d)); } catch (e) {}
drawForm(); pvSched(); start();

/* ===== ♛ Apparence de l'admin : Créateur / Classique ===== */
(() => {
  const H = document.documentElement, b = document.getElementById('skinb');
  const lab = () => { if (b) b.textContent = H.classList.contains('crea') ? '◻ Classique' : '♛ Créateur'; };
  lab();
  if (b) b.addEventListener('click', () => { const on = !H.classList.contains('crea'); H.classList.toggle('crea', on); try { localStorage.setItem('adminSkin', on ? 'crea' : 'classic'); } catch (e) {} lab(); if (on) splash(true); });
  function splash(force) {
    if (!H.classList.contains('crea')) return;
    try { if (!force && sessionStorage.getItem('crSplash')) return; sessionStorage.setItem('crSplash', '1'); } catch (e) {}
    const d = document.createElement('div'); d.id = 'crsplash';
    d.innerHTML = '<div class="k">♛</div><div class="t">ACCÈS ADMINISTRATEUR</div><div class="l">› mode créateur : tous les pouvoirs</div><div class="bar2"><i></i></div>';
    document.body.appendChild(d);
    const go = () => { d.classList.add('out'); setTimeout(() => d.remove(), 800); };
    d.addEventListener('click', go); setTimeout(go, 2300);
  }
  splash(false);
})();
