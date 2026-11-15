let S = norm(JSON.parse(JSON.stringify(DEF)));
const WT = {
  text: ['Texte', [['title', 'Titre'], ['text', 'Texte', 'area'], ['big', 'Grande police', 'chk']]],
  value: ['Valeur (URL)', [['title', 'Titre'], ['url', 'URL (JSON ou texte)'], ['path', 'Chemin JSON'], ['unit', 'Unité'], ['every', 'Rafraîchir (s)']]],
  image: ['Image', [['title', 'Titre'], ['url', "URL de l'image"]]],
  clock: ['Horloge', [['title', 'Titre'], ['tz', 'Fuseau horaire']]],
  count: ['Compte à rebours', [['title', 'Titre'], ['date', 'Date AAAA-MM-JJ HH:MM']]],
  web: ['Page web (URL)', [['title', 'Titre'], ['url', 'URL de la page (https://…)'], ['every', 'Recharger toutes les (s, 0 = jamais)']]],
  link: ['Lien (URL)', [['title', 'Titre'], ['text', 'Texte du lien'], ['url', 'URL (https://…)']]]
};
const R = (l, h, c = '') => `<div class="row ${c}"><label>${l}</label>${h}</div>`;
const getK = k => k.split('.').reduce((a, x) => a == null ? a : a[x], S);
const sel = (k, opts) => `<select data-g="${k}">${opts.map(o => `<option value="${o[0]}" ${String(getK(k)) === String(o[0]) ? 'selected' : ''}>${o[1]}</option>`).join('')}</select>`;
const num = (k, ex = '') => `<input type="number" data-g="${k}" value="${esc(getK(k))}" ${ex}>`;
const yn = [[true, 'Oui'], [false, 'Non']];

/* ----- Styles d'interface : galerie ----- */
const VARIANTS = [['ios-flat', 'iOS épuré'], ['bulles', 'Bulles'], ['cristal', 'Cristal'], ['minimal-ios', 'Minimal (iOS)'], ['hud-cyan', 'HUD Cyan'], ['terminal', 'Terminal vert'], ['crt-ambre', 'CRT ambre'], ['alerte', 'Alerte rouge'], ['cyber-neon', 'Cyber néon'], ['sci-orange', 'Sci-fi orange'], ['sonar', 'Sonar'], ['tron', 'Tron'], ['warp', 'Violet warp'], ['lime', 'Lime acide'], ['militaire', 'Militaire'], ['glace', 'Glace polaire'], ['hologramme', 'Hologramme'], ['furtif', 'Furtif'], ['papier', 'Papier'], ['journal', 'Journal'], ['console', 'Console'], ['vaporwave', 'Vaporwave'], ['synthwave', 'Synthwave'], ['c64', 'Commodore 64'], ['dos', 'DOS bleu'], ['material', 'Material'], ['neumorphisme', 'Neumorphisme'], ['brutaliste', 'Brutaliste'], ['verre-noir', 'Verre noir'], ['verre-clair', 'Verre clair'], ['pilules', 'Pilules'], ['carre', 'Carré net'], ['double', 'Double filet'], ['pointille', 'Pointillé'], ['fil', 'Fil fin'], ['elegant', 'Élégant'], ['luxe', 'Luxe noir et or'], ['ludique', 'Ludique'], ['aurore', 'Aurore'], ['degrades', 'Cartes dégradées'], ['sobre-mono', 'Sobre mono'], ['condense', 'Condensé'], ['serif-doux', 'Serif doux'], ['impact', 'Impact']];
const PRE = {classic: {now: 'left', days: 'side', hours: 'bottom', size: 'L'}, mirror: {now: 'right', days: 'side', hours: 'bottom', size: 'L'}, center: {now: 'center', days: 'row', hours: 'bottom', size: 'L'}, compact: {now: 'left', days: 'row', hours: 'top', size: 'M'}};
document.addEventListener('change', e => { const t = e.target; if (t.id !== 'lpre' || !t.value) return; S.layout = Object.assign({}, S.layout, PRE[t.value]); drawForm(); pvSched(); schedSave(); });
const FXO = [['none', 'Aucun'], ['rain', 'Pluie'], ['storm', 'Pluie + éclairs'], ['drizzle', 'Bruine'], ['sleet', 'Pluie verglaçante'], ['hail', 'Grêle'], ['snow', 'Neige'], ['blizzard', 'Tempête de neige'], ['frost', 'Givre (bords gelés)'], ['fog', 'Brouillard'], ['wind', 'Vent + feuilles'], ['sand', 'Tempête de sable'], ['heat', 'Canicule'], ['sunrays', 'Rayons de soleil'], ['rainbow', 'Arc-en-ciel'], ['stars', 'Étoiles'], ['meteors', 'Étoiles filantes'], ['aurora', 'Aurore boréale'], ['fireflies', 'Lucioles'], ['bubbles', 'Bulles'],
  ['confetti', 'Confettis'], ['fireworks', "Feux d'artifice"], ['hearts', 'Cœurs'], ['leaves', 'Feuilles'], ['petals', 'Pétales'], ['notes', 'Notes de musique'], ['clovers', 'Trèfles'], ['crepes', 'Crêpes'], ['eggs', 'Œufs de Pâques'], ['halloween', 'Halloween (chauves-souris, fantômes, brume)'], ['bats', 'Chauves-souris'], ['ghosts', 'Fantômes'], ['santa', 'Père Noël + neige'], ['matrix', 'Code Matrix'], ['sparkles', 'Paillettes kawaii'], ['emoji', 'Emoji personnalisés'], ['lucky', 'Jour de chance']];
const POSO = [['auto', 'Auto'], ['r', 'En haut à droite'], ['c', 'En haut au centre'], ['l', 'En haut à gauche'], ['m', 'Au milieu'], ['h', 'À l\'horizon']];
const BOLTO = [['auto', 'Auto (si orage)'], ['none', 'Jamais'], ['rare', 'Rares'], ['normal', 'Normaux'], ['often', 'Fréquents']];
const MPHO = [['', 'Phase réelle'], ['full', 'Pleine lune'], ['half', 'Demi-lune'], ['crescent', 'Croissant']];
const opt = (cur, list) => list.map(o => `<option value="${o[0]}" ${String(cur) === String(o[0]) ? 'selected' : ''}>${o[1]}</option>`).join('');
const grad = o => `linear-gradient(${isNaN(+o.ang) ? 90 : +o.ang - 80}deg,${o.c[0]},${o.c[1]},${o.c[2]})`;
const forceOpts = () => [['auto', 'Automatique (météo + fêtes)']].concat(Object.keys(S.themes).map(k => [k, S.themes[k].name])).concat(S.events.map(e => [e.id, '🎉 ' + e.name]));
const rng = (at, k, v, a, b, st) => `<div class="rg"><input type="range" ${at} data-k="${k}" min="${a}" max="${b}" step="${st}" value="${v}"><span>${v}</span></div>`;
const col = (at, k, v) => `<div class="cc"><input type="color" ${at} data-k="${k}" value="${/^#[0-9a-f]{6}$/i.test(v || '') ? v : '#ffffff'}" class="${v ? '' : 'auto'}" title="Couleur personnalisée"><button class="mini" data-clr="1" ${at} data-k="${k}" title="Revenir à la couleur automatique">auto</button></div>`;
const ADVOPEN = new Set();
document.addEventListener('toggle', e => { const d = e.target; if (d.classList && d.classList.contains('adv')) d.open ? ADVOPEN.add(d.dataset.key) : ADVOPEN.delete(d.dataset.key); }, true);
const thFields = (at, o) => `<div class="pv" style="background:${grad(o)}"></div>` +
  `<div class="row full" title="Couleurs : haut / milieu / bas"><div class="cc">${[0, 1, 2].map(n => `<input type="color" ${at} data-k="c.${n}" value="${o.c[n]}">`).join('')}</div></div>` +
  R('Effet', `<select ${at} data-k="fx">${opt(o.fx, FXO)}</select>`) +
  R('Nuages', `<select ${at} data-k="clouds">${opt(o.clouds, [[0, 'Aucun'], [1, 'Peu'], [2, 'Moyen'], [3, 'Beaucoup'], [4, 'Énormément']])}</select>`) +
  R('Lune', `<select ${at} data-k="moon">${opt(o.moon, yn)}</select>`) + R('Soleil', `<select ${at} data-k="sun">${opt(o.sun, yn)}</select>`) +
  `<details class="adv" data-key="${esc(at)}" ${ADVOPEN.has(at) ? 'open' : ''}><summary>Réglages avancés</summary><div class="g s">` +
  R('Effet n°2 (en plus)', `<select ${at} data-k="fx2">${opt(o.fx2, FXO)}</select>`, 'full') +
  R('Intensité', rng(at, 'dens', o.dens, 0, 3, .1)) + R('Vitesse', rng(at, 'spd', o.spd, .2, 3, .1)) + R('Vent ← →', rng(at, 'wind', o.wind, -5, 5, .5)) + R('Taille', rng(at, 'ps', o.ps, .4, 3, .1)) +
  R('Couleur des particules', col(at, 'pc', o.pc)) + R('Couleur des nuages', col(at, 'cc', o.cc)) + R('Vitesse des nuages', rng(at, 'cs', o.cs, 0, 4, .1)) +
  R('Étoiles en plus', `<select ${at} data-k="stars">${opt(o.stars, yn)}</select>`) + R('Éclairs', `<select ${at} data-k="bolt">${opt(o.bolt, BOLTO)}</select>`) +
  R('Position soleil / lune', `<select ${at} data-k="pos">${opt(o.pos, POSO)}</select>`) + R('Taille de la lune', rng(at, 'mr', o.mr, 14, 80, 1)) + R('Couleur de la lune', col(at, 'mc', o.mc)) + R('Phase de la lune', `<select ${at} data-k="mph">${opt(o.mph, MPHO)}</select>`) +
  R('Angle du dégradé', rng(at, 'ang', o.ang, 0, 360, 5)) + R('Dégradé animé', `<select ${at} data-k="anim">${opt(o.anim, yn)}</select>`) +
  R('Emoji qui tombent (effet « Emoji »)', `<input ${at} data-k="emo" value="${esc(o.emo)}" placeholder="🍂🍁🌰">`, 'full') +
  R('Texte à la place de la description', `<input ${at} data-k="desc" value="${esc(o.desc)}" placeholder="vide = texte automatique du style">`, 'full') +
  R('Message du bandeau (| pour alterner)', `<input ${at} data-k="msg" value="${esc(o.msg)}" placeholder="ex : Prenez un parapluie ! | Bonne journée">`, 'full') +
  R('Image de fond (URL)', `<input ${at} data-k="img" value="${esc(o.img)}" placeholder="https://… (vide = dégradé)">`, 'full') + R('Visibilité de l\'image', rng(at, 'imgo', o.imgo, 0, 1, .05)) +
  '</div></details>';
function drawStyle() {
  $('gal').innerHTML = `<button class="hc hcrea ${S.hud === 'crea' ? 'on' : ''}" data-hudcrea="1"><div class="sw"><b>♛</b><i>RÉSERVÉ À L'ADMIN</i></div><div class="nm">♛ Style créateur${S.hud === 'crea' ? '<em>✓ actif</em>' : ''}</div><div class="tg">Le style exclusif de l'admin : introuvable au roll, il réunit les six reliques secrètes autour du cristal du créateur. La plus grosse cinématique de toutes (≈ 65 s).</div></button>` + SIGLIST.map(([id, n, tg, bg, fg, ft, fw, sm]) => `<button class="hc ${S.hud === id ? 'on' : ''}" data-hud="${id}"><div class="sw" style="background:${bg};color:${fg};font-family:${esc(ft)}"><b style="font-weight:${fw}">14°</b><i>${esc(sm)}</i></div><div class="nm">${esc(n)}${S.hud === id ? '<em>✓ actif</em>' : ''}</div><div class="tg">${esc(tg)}</div></button>`).join('') +
    `<button class="hc hx ${S.hud === 'x0' ? 'on' : ''}" data-hudx="1"><div class="sw"><b>✦</b><i>? ? ?</i></div><div class="nm">✦ Style secret${S.hud === 'x0' ? '<em>✓ actif</em>' : ''}</div><div class="tg">Normalement, on ne l'obtient qu'avec 0,2 % de chance au roll. Clique pour l'activer quand tu veux (attention, spoil !).</div></button>` +
    `<button class="hc hx hx0s ${S.hud === 'x0s' ? 'on' : ''}" data-hudx0s="1"><div class="sw"><b>✨</b><i>SHINY</i></div><div class="nm">✨ Singularité shiny${S.hud === 'x0s' ? '<em>✓ actif</em>' : ''}</div><div class="tg">La version chromatique : quand la Singularité tombe au roll, 1 chance sur 4096 qu'elle soit shiny (1 sur 2 048 000 au total). Le trou noir se fend en deux et explose en pulsar.</div></button>` +
    `<button class="hc hx hinf ${S.hud === 'inf' ? 'on' : ''}" data-hudinf="1"><div class="sw"><b>∞</b><i>? ? ?</i></div><div class="nm">∞ Style infini${S.hud === 'inf' ? '<em>✓ actif</em>' : ''}</div><div class="tg">Le plus rare : 0,1 % au roll, avec une cinématique d'une minute. Clique pour l'activer quand tu veux (attention, spoil !).</div></button>` +
    `<button class="hc hx hvoid ${S.hud === 'void' ? 'on' : ''}" data-hudvoid="1"><div class="sw"><b>∅</b><i>· · ·</i></div><div class="nm">∅ Style néant${S.hud === 'void' ? '<em>✓ actif</em>' : ''}</div><div class="tg">Ultra rare : 0,01 % au roll (1 chance sur 10 000), avec sa cinématique. Clique pour l'activer quand tu veux (attention, spoil !).</div></button>` +
    `<button class="hc hx haby ${S.hud === 'aby' ? 'on' : ''}" data-hudaby="1"><div class="sw"><b>◉</b><i>1 / 2 000 000</i></div><div class="nm">🌊 Abysse${S.hud === 'aby' ? '<em>✓ actif</em>' : ''}</div><div class="tg">Ultra rare : 1 chance sur 2 000 000 au roll, avec une cinématique de 90 s. Clique pour l'activer quand tu veux (attention, énorme spoil !).</div></button>` +
    `<button class="hc hx htrain ${S.hud === 'train' ? 'on' : ''}" data-hudtrain="1"><div class="sw"><b>🎫</b><i>1 / 10 000 000</i></div><div class="nm">🎫 Style billet d'or${S.hud === 'train' ? '<em>✓ actif</em>' : ''}</div><div class="tg">Le plus rare de TOUS : 1 chance sur 10 000 000 au roll, avec sa cinématique (≈ 44 s). Clique pour l'activer quand tu veux (attention, spoil !).</div></button>` +
    `<button class="hc hx hgen ${S.hud === 'gen' ? 'on' : ''}" data-hudgen="1"><div class="sw"><b>✺</b><i>1 / 1 000 000</i></div><div class="nm">✺ Style légendaire${S.hud === 'gen' ? '<em>✓ actif</em>' : ''}</div><div class="tg">Ultra rare : 1 chance sur 1 000 000 au roll, avec une très longue cinématique (≈ 70 s). Clique pour l'activer quand tu veux (attention, énorme spoil !).</div></button>` +
    `<button class="hc hx htes ${S.hud === 'tes' ? 'on' : ''}" data-hudtes="1"><div class="sw"><b>◈</b><i>? ? ? ?</i></div><div class="nm">◈ Style ultime${S.hud === 'tes' ? '<em>✓ actif</em>' : ''}</div><div class="tg">Hyper rare : 0,001 % au roll (1 chance sur 100 000), avec une énorme cinématique. Clique pour l'activer quand tu veux (attention, gros spoil !).</div></button>` +
    `<button class="hc hxr ${S.hud === 'xr' ? 'on' : ''}" data-hudxr="1"><div class="sw"><b>🔒</b><i>ACCÈS RESTREINT</i></div><div class="nm">🔒 Accès restreint${S.hud === 'xr' ? '<em>✓ actif</em>' : ''}</div><div class="tg">★ Ultra légendaire. Se déverrouille uniquement avec ton code${S.xlock ? '' : ' (tu le choisis au premier clic)'}. Code oublié : supprime « xlock » dans l'onglet Sauvegarde.</div></button>`;
  $('vars').innerHTML = VARIANTS.map(([id, n]) => `<button class="btn xs ${S.hud === id ? '' : 's'}" data-hud="${id}">${esc(n)}</button>`).join('');
  $('rollf').innerHTML = R('Roll automatique', sel('roll.mode', [['off', 'Désactivé (seulement à la demande)'], ['boot', 'À chaque démarrage'], ['daily', 'Une fois par jour'], ['interval', 'Toutes les N heures']])) + R('Heure (une fois par jour)', sel('roll.hour', Array.from({length: 24}, (_, h) => [h, h + ' h']))) + R('Toutes les (heures)', num('roll.every', 'min="1" max="168"')) + R('Triple tape sur le nom = roll', sel('roll.tap', yn)) +
    `<div class="row full"><label>Chances</label><div style="font-size:12px;display:flex;flex-wrap:wrap;gap:10px">${RARITY.map(r => `<span style="color:${r[2]};font-weight:700">■ ${r[1]} ${String(r[3]).replace('.', ',')} %</span>`).join('')}</div></div>`;
  const pool = S.roll.pool || [];
  $('rpool').innerHTML = SIGLIST.filter(x => x[0] !== 'pres').map(([id, n]) => { const q = RARITY.find(r => r[0] === (RAR[id] || 'blue')); return `<label style="--rc:${q[2]}" title="${esc(q[1])}"><input type="checkbox" data-pool="${id}" ${!pool.length || pool.includes(id) ? 'checked' : ''}>${esc(n)}</label>`; }).join('');
  $('app').innerHTML = R('Textes d\'ambiance (phrases du style)', sel('voice', [[true, 'Activés'], [false, 'Désactivés (texte météo simple)']])) +
    R('Style festif automatique', sel('festHud', [['all', 'Oui, remplace le style'], [true, 'Seulement si style iOS'], [false, 'Non']])) +
    R('Code OACI (style Cockpit)', `<input data-g="icao" value="${esc(S.icao)}" maxlength="4" style="text-transform:uppercase">`);
}
function drawThemes() {
  $('thm').innerHTML = Object.keys(S.themes).map(k => `<div class="w"><div class="wh"><input class="nm" data-th="${k}" data-k="name" value="${esc(S.themes[k].name)}"><button class="mini ${pvForce === k ? 'on' : ''}" data-eye="${k}" title="Voir dans l'aperçu">👁</button></div><div class="g s">${thFields(`data-th="${k}"`, S.themes[k])}</div></div>`).join('');
  $('evl').innerHTML = S.events.map((e, i) => `<div class="w"><div class="wh"><input class="nm" data-ev="${i}" data-k="name" value="${esc(e.name)}"><button class="mini ${pvForce === e.id ? 'on' : ''}" data-eye="${esc(e.id)}" title="Voir dans l'aperçu">👁</button><button class="mini" style="color:var(--bad)" data-ea="del" data-i="${i}">Supprimer</button></div><div class="g s">` +
    R('Active', `<select data-ev="${i}" data-k="on">${opt(e.on, yn)}</select>`) + R('Début (MM-JJ)', `<input data-ev="${i}" data-k="from" value="${esc(e.from)}">`) + R('Fin (MM-JJ)', `<input data-ev="${i}" data-k="to" value="${esc(e.to)}">`) +
    R('Message affiché (| pour alterner)', `<input data-ev="${i}" data-k="msg" value="${esc(e.msg)}">`, 'full') + thFields(`data-ev="${i}"`, e) + '</div></div>').join('');
}
/* ----- Surprises (easter eggs) ----- */
const EGGLIST = [
  ['halloween', '🎃 Halloween', 'Pendant la fête : fantômes qui surgissent derrière les cadres, araignées qui descendent, nuées de chauves-souris, chat noir, citrouilles à toucher (pluie de bonbons !) et toiles d\'araignée. Le 31 au soir, c\'est encore plus fréquent. Avec « Style festif », l\'écran passe en Manoir hanté.', [['halloween', 'Démo'], ['ghost', 'Fantôme'], ['spider', 'Araignée'], ['bats', 'Chauves-souris'], ['cat', 'Chat noir'], ['pumpkin', 'Bonbons']]],
  ['fri13', '🐈‍⬛ Vendredi 13', 'Un chat noir traverse l\'écran de temps en temps (et s\'il fait 13°, il passe à coup sûr).', [['cat', 'Chat noir']]],
  ['newyear', '🎆 Nouvel An', 'Compte à rebours géant à 23:59:50 le 31 décembre, puis pluie de feux d\'artifice.', [['countdown', 'Compte à rebours']]],
  ['april', '🐟 1er avril', 'Un poisson en papier est collé sur un cadre (on peut le toucher) et de fausses prévisions apparaissent.', [['fish', 'Fausse prévision']]],
  ['starwars', '✨ 4 mai', 'Saut en hyperespace de temps en temps.', [['hyper', 'Hyperespace']]],
  ['xmas', '🎄 Noël', 'Neige sur le haut des cadres et guirlande lumineuse, quel que soit le style.', []],
  ['easter', '🐣 Pâques', '3 œufs sont cachés sur les cadres : touche-les pour les trouver !', []],
  ['konami', '🕹 Code secret', 'Au clavier ↑ ↑ ↓ ↓ ← → ← → B A, ou 7 tapes rapides sur la température : mode disco !', [['disco', 'Mode disco']]],
  ['ufo', '🛸 OVNI', 'Très rare, seulement la nuit : une soucoupe traverse le ciel et allume son rayon.', [['ufo', 'OVNI']]],
  ['wolf', '🐺 Loup-garou', 'Les nuits de pleine lune, un loup hurle devant la lune.', [['wolf', 'Loup-garou']]],
  ['bzh', '🌧 Crachin breton', 'En Bretagne, la bruine devient « Crachin breton » et les averses « Il fait beau plusieurs fois par jour ».', []],
  ['snow1', '❄ Première neige', 'Un message spécial s\'affiche à la première neige de la saison.', [['snow1', 'Message']]],
  ['nums', '🔢 Nombres rigolos', 'Petits messages quand il fait 42°, 37°, 0° ou -1°.', []],
  ['lcd', '💡 Rétroéclairage', 'Avec le style « Station LCD », toucher LIGHT allume l\'écran comme une vraie montre.', [['light', 'Allumer']]],
  [null, '🍀 Jour de chance', 'Une chance sur 100 000 à chaque actualisation : la météo devient dorée toute la journée. Toujours actif.', []],
  [null, '🖥 Petits bonus de style', 'Démarrage BIOS du Terminal rétro, virevoltants du Far West quand il y a du vent…', [['boot', 'Démarrage BIOS'], ['tumble', 'Virevoltant'], ['impact', 'Impact manga']]],
  [null, '✨ Singularité shiny', 'Rejoue la cinématique de la version shiny : le trou noir se fend en deux et explose en pulsar. Deux touchers rapides pour la passer.', [['x0scin', 'Cinématique ✨']]],
  [null, '👁 La Présence', 'Rejoue l\'animation d\'activation du style qui fait peur (avec le jumpscare !). Deux touchers rapides pour la passer.', [['prescin', 'Animation 👁']]],
  [null, '🌊 Abysse', 'Rejoue la cinématique (≈ 90 s) du style à 1 chance sur 2 000 000 : la descente jusqu\'au fond des océans (attention, énorme spoil !). Deux touchers rapides pour la passer.', [['abycin', 'Cinématique 🌊']]],
  [null, '🚂 Style billet d\'or', 'Rejoue la cinématique (≈ 44 s) du style à 1 chance sur 10 000 000 (attention, spoil !). Deux touchers rapides pour la passer.', [['traincin', 'Cinématique 🚂']]],
  [null, '♛ Style créateur', 'Rejoue la cinématique (≈ 65 s) du style exclusif de l\'admin : accès administrateur, code source, les six reliques, le cristal. Deux touchers rapides pour la passer.', [['creacin', 'Cinématique ♛']]],
  [null, '✺ Style légendaire', 'Rejoue la très longue cinématique (≈ 70 s) du style à 1 chance sur 1 000 000 (attention, énorme spoil !). Deux touchers rapides pour la passer.', [['gencin', 'Cinématique ✺']]],
  [null, '◈ Style ultime', 'Rejoue la cinématique (≈ 43 s) du style à 1 chance sur 100 000 (attention, gros spoil !). Deux touchers rapides pour la passer. Sur l\'écran, touche l\'objet pour le faire réagir.', [['tescin', 'Cinématique ◈']]],
  [null, '∅ Style néant', 'Rejoue la cinématique du style le plus rare (attention, spoil !). Deux touchers rapides pour la passer.', [['voidcin', 'Cinématique ∅']]],
  [null, '✸ Supernova', 'Rejoue l\'animation du style Supernova (≈ 21 s) : coupure de l\'écran, l\'étoile qui meurt, fissures, explosion en morceaux. Deux touchers rapides pour la passer.', [['novacin', 'Explosion supernova']]],
  [null, '∞ Style infini', 'Rejoue la cinématique d\'une minute du style infini (attention, spoil !). Deux touchers rapides pour la passer.', [['infcin', 'Cinématique ∞ (1 min)']]],
  [null, '🔒 Accès restreint', 'Rejoue l\'ouverture du coffre-fort du style à code.', [['xrvault', 'Coffre-fort']]],
  [null, '✦ Style secret', 'Rejoue la grande cinématique (≈ 30 s) du style secret (attention, spoil !). Deux touchers rapides pour la passer. Elle se joue aussi toute seule quand on l\'obtient au roll ou quand on l\'active.', [['x0cin', 'Animation secrète']]]
];
function drawEggs() {
  $('egl').innerHTML = EGGLIST.map(([k, t, d, tests]) => `<div class="eg"><div class="t"><span>${t}</span>${k ? `<label class="sw2" title="Activer / désactiver"><input type="checkbox" data-egg="${k}" ${S.eggs[k] ? 'checked' : ''}><i></i></label>` : ''}</div><p>${esc(d)}</p>${tests.length ? `<div class="b">${tests.map(([e, l]) => `<button class="btn s xs" data-test="${e}">▶ ${esc(l)}</button>`).join('')}</div>` : ''}</div>`).join('');
}
function drawForm() {
  $('gen').innerHTML = R('Ville et position', sel('geo', [[true, 'Automatique (l\'écran détecte sa ville)'], [false, 'Manuelle (latitude / longitude ci-dessous)']]), 'full') + `<div class="row full"><span class="foot" id="geoinfo">${esc(geoTxt())}</span></div>` + R('Nom affiché', `<input data-g="name" value="${esc(S.name)}">`) + R('Latitude', num('lat', 'step="0.0001"' + (S.geo !== false ? ' disabled' : ''))) + R('Longitude', num('lon', 'step="0.0001"' + (S.geo !== false ? ' disabled' : ''))) + R('Météo : rafraîchir (min)', num('refresh', 'min="2"')) + R('Zoom du radar (5-10)', num('zoom', 'min="5" max="10" step="0.5"')) + R('Unité de température', sel('unit', [['C', '°C'], ['F', '°F']]));
  $('aff').innerHTML = R('Page au démarrage', sel('view', [['meteo', 'Météo'], ['radar', 'Radar'], ['infos', 'Infos']])) +
    R('Fond animé', sel('force', forceOpts())) + R('Thèmes de fête automatiques', sel('festAuto', yn)) +
    R('Onglet Radar', sel('tabs.radar', [[true, 'Visible'], [false, 'Masqué']])) + R('Onglet Infos', sel('tabs.infos', [[true, 'Visible'], [false, 'Masqué']])) +
    R('Radar : pluie au démarrage', sel('rain', yn)) + R('Radar : orages au démarrage', sel('bolt', yn)) +
    R('Mode léger (Raspberry Pi)', sel('lite', [[true, 'Activé'], [false, 'Désactivé']])) + R('Radar : nombre d\'images', sel('radarQ', [[5, '5 (léger)'], [8, '8 (normal)'], [12, '12 (complet)']])) +
    R('Bandeau défilant', sel('tickerOn', [[true, 'Activé'], [false, 'Désactivé']])) + `<div class="row col"><label>Texte du bandeau</label><textarea data-g="ticker" rows="2">${esc(S.ticker)}</textarea></div>`;
  $('lay').innerHTML = R('Disposition rapide', `<select id="lpre"><option value="">Choisir…</option><option value="classic">Classique</option><option value="mirror">Inversée</option><option value="center">Centrée</option><option value="compact">Compacte</option></select>`) + R('Température', sel('layout.now', [['left', 'À gauche'], ['center', 'Au centre'], ['right', 'À droite']])) + R('Taille des degrés', sel('layout.size', [['S', 'Petite'], ['M', 'Moyenne'], ['L', 'Grande'], ['XL', 'Géante']])) + R('Jours suivants', sel('layout.days', [['side', 'En colonne'], ['row', 'En ligne']])) + R('Prochaines heures', sel('layout.hours', [['bottom', 'En bas'], ['top', 'En haut']])) +
    R('Nom onglet 1', `<input data-g="labels.meteo" value="${esc(S.labels.meteo)}">`) + R('Nom onglet 2', `<input data-g="labels.radar" value="${esc(S.labels.radar)}">`) + R('Nom onglet 3', `<input data-g="labels.infos" value="${esc(S.labels.infos)}">`) +
    R('Afficher la date et l\'heure', sel('show.date', yn)) + R('Afficher les détails (vent…)', sel('show.details', yn)) + R('Afficher les prochaines heures', sel('show.hours', yn)) + R('Afficher les 5 jours', sel('show.days', yn)) + R('Qualité de l\'air', sel('show.air', yn)) + R('Pollens', sel('show.pollen', yn));
  $('wxc').innerHTML = R('Lever / coucher du soleil', sel('wx.golden', yn)) + R('Gel (≤ 0°)', sel('wx.frost', yn)) + R('Pleine lune', sel('wx.fullmoon', yn)) + R('Nuit nuageuse', sel('wx.cloudnight', yn)) + R('Arc-en-ciel après la pluie', sel('wx.rainbow', yn)) +
    R('Canicule à partir de (°C)', num('wx.heat', 'min="20" max="50"')) + R('Vent fort : rafales (km/h)', num('wx.windG', 'min="30" max="150"')) + R('Tempête de neige : rafales (km/h)', num('wx.blizG', 'min="20" max="150"'));
  const hrs = Array.from({length: 24}, (_, h) => [h, h + ' h']);
  $('bootf').innerHTML = R('Animation de démarrage', sel('boot.on', [[true, 'Activée'], [false, 'Désactivée']])) + R('Style', sel('boot.style', [['linux', 'Linux (GRUB, messages du noyau, logo, connexion)'], ['azure', 'Cinématique (particules et logo)']])) + R('Petit texte au-dessus', `<input data-g="boot.sub" value="${esc(S.boot.sub)}" maxlength="40">`) + R('Grand titre', `<input data-g="boot.title" value="${esc(S.boot.title)}" maxlength="24" style="text-transform:uppercase">`, 'full');
  $('slp').innerHTML = R('Mode veille', sel('night.on', [[true, 'Activé'], [false, 'Désactivé']])) + R('Affichage', sel('night.mode', [['clock', 'Horloge sur fond noir'], ['dim', 'Écran assombri']])) +
    R('De', sel('night.from', hrs)) + R('À', sel('night.to', hrs)) + R('Luminosité', rngG('night.lum', .05, 1, .05)) + R('Réveil au toucher (1 min)', sel('night.wake', yn));
  drawW(); drawStyle(); drawThemes(); drawEggs(); drawAmb();
}
function drawW() {
  $('wl').innerHTML = S.widgets.map((w, i) => `<div class="w"><div class="wh"><span>${WT[w.t][0]}</span><button class="mini" data-a="up" data-i="${i}">↑</button><button class="mini" data-a="dn" data-i="${i}">↓</button><button class="mini" style="color:var(--bad)" data-a="del" data-i="${i}">Supprimer</button></div><div class="g s">` +
    WT[w.t][1].map(([k, l, ty]) => ty === 'area' ? R(l, `<textarea data-w="${i}" data-k="${k}" rows="2">${esc(w[k])}</textarea>`, 'full') : ty === 'chk' ? R(l, `<input type="checkbox" data-w="${i}" data-k="${k}" ${w[k] ? 'checked' : ''}>`) : R(l, `<input data-w="${i}" data-k="${k}" value="${esc(w[k])}">`, ['title', 'url', 'text'].includes(k) ? 'full' : '')).join('') +
    R('Largeur', `<select data-w="${i}" data-k="w">${opt(w.w || 1, [[1, '1 colonne'], [2, '2 colonnes'], [3, '3 colonnes']])}</select>`) + R('Hauteur', `<select data-w="${i}" data-k="h">${opt(w.h || 1, [[1, '1 ligne'], [2, '2 lignes'], [3, '3 lignes']])}</select>`) + '</div></div>').join('');
}
const thObj = t => t.dataset.th ? S.themes[t.dataset.th] : S.events[+t.dataset.ev];
document.addEventListener('input', e => {
  const t = e.target; if (!t.closest('main')) return; let v = t.type === 'checkbox' ? t.checked : t.value; if (v === 'true') v = true; if (v === 'false') v = false;
  if (t.type === 'range') { v = +v; const s = t.nextElementSibling; if (s) s.textContent = v; }
  if (t.dataset.egg && t.type === 'checkbox') { S.eggs[t.dataset.egg] = t.checked; return; }
  if (t.dataset.g) { const p = t.dataset.g.split('.'); if (p.length === 2) S[p[0]][p[1]] = (t.type === 'number' && v !== '') ? +v : v; else S[p[0]] = (t.type === 'number' && v !== '') ? +v : v; }
  else if (t.dataset.w) S.widgets[+t.dataset.w][t.dataset.k] = (t.dataset.k === 'w' || t.dataset.k === 'h') ? +v : v;
  else if (t.dataset.th || t.dataset.ev !== undefined) {
    const o = thObj(t), p = t.dataset.k.split('.');
    if (p.length === 2) o[p[0]][+p[1]] = v; else o[p[0]] = p[0] === 'clouds' ? +v : v;
    if (t.type === 'color') t.classList.remove('auto');
    const pv = t.closest('.w').querySelector('.pv'); if (pv) pv.style.background = grad(o);
  }
});
document.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.ea === 'del') { if (!confirm('Supprimer « ' + S.events[+t.dataset.i].name + ' » ?')) return; S.events.splice(+t.dataset.i, 1); drawForm(); schedSave(); }
  else if (t.dataset.hud) { S.hud = t.dataset.hud; drawStyle(); pvSched(); schedSave(); }
  else if (t.dataset.clr) { const o = thObj(t); o[t.dataset.k] = ''; const c = t.previousElementSibling; if (c) c.classList.add('auto'); pvSched(); schedSave(); }
  else if (t.dataset.eye !== undefined) { pvForce = pvForce === t.dataset.eye ? '' : t.dataset.eye; drawThemes(); showDock(true); pvLast(); pvSched(); }
  else if (t.dataset.test) {
    const egg = t.dataset.test;
    if ($('eggto').value === 'scr') { S.fire = {id: Date.now(), egg}; push('Surprise envoyée à l\'écran'); }
    else { showDock(true); setTimeout(() => pvEgg(egg), PVF.some(P => P.loaded) ? 0 : 2500); }
  }
});
$('eva').onclick = () => { S.events.push(Object.assign({}, TADV, {id: 'ev' + Date.now(), name: 'Mon événement', from: '01-01', to: '01-01', on: true, c: ['#2b0a4a', '#7a1fa2', '#ff6fb1'], fx: 'confetti', clouds: 0, moon: false, msg: '🎉 Mon message'})); drawForm(); schedSave(); };

/* ----- Enregistrement automatique ----- */
let saveT;
const schedSave = () => { clearTimeout(saveT); status('Modification…', null); saveT = setTimeout(() => { try { localStorage.setItem('adminDraft', JSON.stringify(S)); } catch (e) {} push('Enregistré'); }, 1800); };
document.addEventListener('change', e => { const d = e.target.dataset; if (e.target.closest('main') && (d.g || d.w || d.th || d.ev !== undefined || d.egg)) schedSave(); });
document.addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.a) { const i = +t.dataset.i, W = S.widgets; if (t.dataset.a === 'del') W.splice(i, 1); else { const j = t.dataset.a === 'up' ? i - 1 : i + 1; if (j >= 0 && j < W.length) [W[i], W[j]] = [W[j], W[i]]; } drawW(); schedSave(); }
});
$('wa').onclick = () => { const ty = $('nw').value; S.widgets.push({t: ty, title: WT[ty][0], text: '', url: '', path: '', unit: '', every: 60, tz: 'Europe/Paris', date: '', big: false, w: 1, h: 1}); drawW(); schedSave(); };

/* ----- Aperçu : grand (onglet Aperçu) + flottant ----- */
var pvForce = '', pvT;
const PVF = [{f: 'pvf', box: 'pvbox', loaded: false, last: ''}, {f: 'pvd', box: 'dbox', loaded: false, last: ''}];
function pvUrl() { const u = ($('pvu').value || '').trim() || 'index.html'; return u + (u.includes('?') ? '&' : '?') + 'preview=1'; }
function ensurePv(i) { const P = PVF[i], f = $(P.f); if (!P.loaded) { P.loaded = true; f.onload = () => { P.last = ''; pvPost(); }; f.src = pvUrl(); } fitPv(); pvPost(); }
function fitPv() { PVF.forEach(P => { const k = $(P.box).clientWidth / 800; if (k > 0) $(P.f).style.transform = 'scale(' + k + ')'; }); }
var pvSleep = false;
function pvPayload() { const c = JSON.parse(JSON.stringify(S)); if (pvForce) c.force = pvForce; if (pvSleep) c.sleepPv = 1; return c; }
function pvLast() { PVF.forEach(P => P.last = ''); const n = pvForce && (S.themes[pvForce] ? S.themes[pvForce].name : (S.events.find(e => e.id === pvForce) || {}).name); $('pvforce').textContent = n ? '👁 Aperçu forcé : ' + n + ' (non enregistré)' : ''; $('pvforce').classList.toggle('on', !!n); }
function pvPost() { const j = JSON.stringify(pvPayload()); PVF.forEach(P => { if (!P.loaded) return; const w = $(P.f).contentWindow; if (!w || j === P.last) return; P.last = j; w.postMessage({type: 'preview-config', cfg: JSON.parse(j)}, '*'); }); }
function pvEgg(egg) { PVF.forEach(P => { const w = P.loaded && $(P.f).contentWindow; if (w) w.postMessage({type: 'preview-egg', egg}, '*'); }); }
function pvSched() { clearTimeout(pvT); pvT = setTimeout(pvPost, 250); }
addEventListener('resize', fitPv);
['input', 'change', 'click'].forEach(ev => document.addEventListener(ev, pvSched));
try { $('pvu').value = localStorage.getItem('adminPv') || ''; } catch (e) {}
$('pvu').onchange = () => { try { localStorage.setItem('adminPv', $('pvu').value); } catch (e) {} PVF.forEach(P => P.loaded = false); ensurePv(0); if ($('dock').classList.contains('on')) ensurePv(1); };
let dockOn = true; try { dockOn = localStorage.getItem('adminDock') !== '0'; } catch (e) {}
const DOCKP = ['display', 'style', 'themes', 'events', 'eggs', 'amb'];
let curPage = 'screen';
function showDock(force) { if (force && !dockOn) { dockOn = true; try { localStorage.setItem('adminDock', '1'); } catch (e) {} } const on = dockOn && DOCKP.includes(curPage); $('dock').classList.toggle('on', on); document.querySelector('main').classList.toggle('dock', on); if (on) ensurePv(1); }
$('dockb').onclick = () => { dockOn = !dockOn; try { localStorage.setItem('adminDock', dockOn ? '1' : '0'); } catch (e) {} showDock(); };
$('dockx').onclick = () => { dockOn = false; try { localStorage.setItem('adminDock', '0'); } catch (e) {} showDock(); };
function go(p) { curPage = p; document.querySelectorAll('.pg').forEach(e => e.classList.toggle('on', e.dataset.p === p)); document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.go === p)); try { localStorage.setItem('adminTab', p); } catch (e) {} if (p === 'preview') ensurePv(0); showDock(); }
document.addEventListener('click', e => { if (e.target.dataset.go) { go(e.target.dataset.go); if (e.target.closest('#nav')) try { e.target.scrollIntoView({inline: 'center', block: 'nearest', behavior: 'smooth'}); window.scrollTo(0, 0); } catch (x) {} } });
let tab0 = 'screen'; try { tab0 = localStorage.getItem('adminTab') || 'screen'; } catch (e) {}
go(document.querySelector(`.pg[data-p="${tab0}"]`) ? tab0 : 'screen');

/* ----- Sons d'ambiance + mascotte ----- */
const rngG = (k, a, b, st) => `<div class="rg"><input type="range" data-g="${k}" min="${a}" max="${b}" step="${st}" value="${esc(getK(k))}"><span>${esc(getK(k))}</span></div>`;
const SNDT = [['rain', '🌧 Pluie'], ['pour', '🌊 Averse'], ['storm', '⛈ Orage'], ['hail', '🧊 Grêle'], ['wind', '💨 Vent'], ['blizzard', '🌨 Tempête de neige'], ['birds', '🐦 Matin'], ['night', '🦗 Nuit d\'été'], ['owl', '🦉 Chouette'], ['marin', '🌊 Vagues'], ['cyber', '🌃 Ville'], ['vapor', '🎹 Vaporwave'], ['hacker', '⌨ Clavier'], ['ukiyo', '🎐 Carillon'], ['stop', '■ Stop']];
function drawAmb() {
  const hrs = Array.from({length: 24}, (_, h) => [h, h + ' h']);
  $('sndf').innerHTML = R('Sons d\'ambiance', sel('snd.on', [[true, 'Activés'], [false, 'Désactivés']])) + R('Volume', rngG('snd.vol', 0, 100, 5)) +
    R('Pluie, gouttes et grêle', sel('snd.rain', yn)) + R('Vent', sel('snd.wind', yn)) + R('Tonnerre (avec les éclairs)', sel('snd.thunder', yn)) +
    R('Nature (oiseaux, grillons, chouette)', sel('snd.nature', yn)) + R('Ambiance du style', sel('snd.style', yn)) +
    R('Heures calmes', sel('snd.quiet', [['off', 'Non'], ['low', 'Son réduit'], ['mute', 'Silence']])) + R('De', sel('snd.qf', hrs)) + R('À', sel('snd.qt', hrs));
  $('sndt').innerHTML = SNDT.map(([k, l]) => `<button class="btn ${k === 'stop' ? '' : 's'} xs" data-snd="${k}">${k === 'stop' ? '' : '▶ '}${esc(l)}</button>`).join('');
  $('mscf').innerHTML = R('Mascotte', sel('masc.on', [[true, 'Activée'], [false, 'Désactivée']])) +
    R('Mouvement', sel('masc.mode', [['walk', 'Traverse l\'écran en marchant'], ['fly', 'Vole dans le ciel'], ['bounce', 'Rebondit partout'], ['float', 'Flotte dans un coin'], ['peek', 'Surgit du bas de l\'écran']])) +
    R('Coin (mode « Flotte »)', sel('masc.pos', [['br', 'En bas à droite'], ['bl', 'En bas à gauche'], ['tr', 'En haut à droite'], ['tl', 'En haut à gauche'], ['m', 'Au milieu']])) +
    R('Passe toutes les (s)', num('masc.every', 'min="3" max="3600"')) + R('Taille', rngG('masc.size', 40, 260, 5)) + R('Vitesse', rngG('masc.spd', .3, 3, .1)) + R('Opacité', rngG('masc.op', .2, 1, .05)) +
    R('L\'image regarde vers', sel('masc.look', [['r', 'La droite'], ['l', 'La gauche'], ['no', 'Ne jamais retourner']])) +
    R('Parle de la météo (bulles)', sel('masc.talk', yn)) + R('Petit accessoire météo (☂ 😎 🧣…)', sel('masc.acc', yn)) +
    R('Lien vers une image (au lieu d\'un fichier)', `<input id="murl" value="${esc(/^data:|^img:/.test(S.masc.src) ? '' : S.masc.src)}" placeholder="https://…/perso.gif">`, 'full') +
    R('Phrases en plus (| pour séparer)', `<input data-g="masc.say" value="${esc(S.masc.say)}" placeholder="ex : Bonne journée ! | Vive les vacances">`, 'full');
  $('mthumb').innerHTML = S.masc.src && !/^img:/.test(S.masc.src) ? `<img src="${esc(S.masc.src)}" alt="">` : '<span style="font-size:64px">☁️</span>';
}
let sndStopT;
function sndTest(k) {
  clearTimeout(sndStopT);
  if (k === 'stop') { AMB.setVol(0); return; }
  AMB.unlock(); AMB.setVol(Math.max(.2, (+S.snd.vol || 50) / 100));
  const X = {cfg: {}, hour: 14, T: 15, month: 6}, sc = {
    rain: sndScene('rain', X), pour: sndScene('pour', X), storm: sndScene('storm', X), hail: sndScene('hail', X), wind: sndScene('wind', X), blizzard: sndScene('blizzard', X),
    birds: sndScene('clear', Object.assign({}, X, {hour: 8})), night: sndScene('clearN', Object.assign({}, X, {hour: 22, T: 20, month: 7})), owl: {r_owl: .35},
    marin: sndScene('cloudy', Object.assign({}, X, {style: 'marin'})), cyber: Object.assign(sndScene('cloudy', Object.assign({}, X, {style: 'cyber'})), {r_siren: .12}), vapor: sndScene('cloudy', Object.assign({}, X, {style: 'vapor'})), hacker: sndScene('cloudy', Object.assign({}, X, {style: 'hacker'})), ukiyo: Object.assign(sndScene('cloudy', Object.assign({}, X, {style: 'ukiyo'})), {r_chime: .6})
  }[k];
  if (!sc) return; AMB.scene(sc);
  if (k === 'storm') { setTimeout(() => AMB.thunder(.9), 600); setTimeout(() => AMB.thunder(.3), 5200); }
  if (k === 'owl') AMB.one('owl');
  sndStopT = setTimeout(() => AMB.setVol(0), 10000);
}
document.addEventListener('click', e => { const b = e.target.closest('[data-snd]'); if (b) sndTest(b.dataset.snd); });
async function mascImg(f) {
  if (f.type === 'image/gif') {
    if (f.size > 150000) throw new Error('Ce GIF fait ' + Math.round(f.size / 1000) + ' Ko : le maximum est 150 Ko. Réduis-le (moins d\'images ou plus petit), ou colle plutôt un lien vers l\'image.');
    return await new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => ko(new Error('Fichier illisible')); r.readAsDataURL(f); });
  }
  const u = URL.createObjectURL(f), im = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(new Error('Image illisible')); i.src = u; });
  const k = Math.min(1, 280 / Math.max(im.width, im.height)), w = Math.max(1, Math.round(im.width * k)), h = Math.max(1, Math.round(im.height * k)), c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.drawImage(im, 0, 0, w, h); URL.revokeObjectURL(u);
  if ($('mcut').checked) cutBg(g, w, h);
  let d = c.toDataURL('image/webp', .9); if (!/^data:image\/webp/.test(d)) d = c.toDataURL('image/png'); return d;
}
/* Détourage : enlève le fond uni en partant des 4 coins (avec un bord adouci) */
function cutBg(g, w, h) {
  const D = g.getImageData(0, 0, w, h), p = D.data, C = [0, w - 1, (h - 1) * w, h * w - 1];
  if (C.filter(i => p[i * 4 + 3] < 20).length >= 3) return;   // déjà transparent
  const seen = new Uint8Array(w * h), T = 42;
  C.forEach(c0 => {
    if (seen[c0] || p[c0 * 4 + 3] < 200) return; const r = p[c0 * 4], gg = p[c0 * 4 + 1], b = p[c0 * 4 + 2], st = [c0];
    while (st.length) {
      const i = st.pop(); if (seen[i]) continue; const o = i * 4, d = Math.abs(p[o] - r) + Math.abs(p[o + 1] - gg) + Math.abs(p[o + 2] - b);
      if (d > T * 1.8) continue; seen[i] = 1;
      if (d >= T) { p[o + 3] = Math.min(p[o + 3], Math.round(255 * (d - T) / (T * .8))); continue; }
      p[o + 3] = 0; const x = i % w;
      if (x > 0) st.push(i - 1); if (x < w - 1) st.push(i + 1); if (i >= w) st.push(i - w); if (i < w * (h - 1)) st.push(i + w);
    }
  });
  g.putImageData(D, 0, 0);
}
$('mfile').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try { status('Préparation de l\'image…', null); S.masc.src = await mascImg(f); S.masc.on = true; drawAmb(); pvSched(); schedSave(); } catch (x) { alert(x.message || x); status('Image refusée', false); } };
$('mnim').onclick = () => { S.masc.src = ''; S.masc.on = true; drawAmb(); pvSched(); schedSave(); };
$('mresend').onclick = () => push('Image renvoyée à l\'écran');
document.addEventListener('change', e => { if (e.target.id === 'murl') { S.masc.src = e.target.value.trim(); if (S.masc.src) S.masc.on = true; drawAmb(); pvSched(); schedSave(); } });
$('slpv').onclick = () => { pvSleep = !pvSleep; $('slpv').textContent = pvSleep ? '✕ Quitter l\'aperçu du mode veille' : '👁 Voir dans l\'aperçu'; showDock(true); PVF.forEach(P => P.last = ''); pvSched(); };
document.addEventListener('change', e => { if (!e.target.dataset.pool) return; const all = [...document.querySelectorAll('[data-pool]')], on = all.filter(x => x.checked).map(x => x.dataset.pool); S.roll.pool = on.length === all.length ? [] : on; pvSched(); schedSave(); });
$('rollscr').onclick = () => { S.fire = {id: Date.now(), egg: 'roll'}; push('Roll envoyé à l\'écran'); };
document.addEventListener('click', e => { const b = e.target.closest('[data-hudx]'); if (!b) return; if (S.hud !== 'x0' && !confirm('Activer le style secret ? Tu vas le découvrir dans l\'aperçu (spoil !).')) return; S.hud = 'x0'; drawStyle(); pvSched(); schedSave(); if (S.roll.mode !== 'off') setTimeout(() => status('⚠ Le roll automatique est activé : il remplacera ce style au prochain tirage (Style › Roll › Désactivé pour le garder)', false), 1500); });
function geoTxt() { return S.geo === false ? 'Position fixe : latitude et longitude ci-dessous.' : '📍 L\'écran détectera sa ville tout seul (elle remplace la partie après le « · » du nom affiché).'; }
document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.g === 'geo') drawForm(); });
/* 🔒 Accès restreint : code personnel (on ne garde qu'une empreinte du code, jamais le code lui-même) */
const xrHash = s => 'h' + imgHash('🔒' + String(s).trim().toLowerCase() + '#meteo');
document.addEventListener('click', e => {
  const b = e.target.closest('[data-hudxr]'); if (!b) return;
  if (S.hud === 'xr') return;
  if (!S.xlock) { const c1 = prompt('🔒 Choisis un code secret pour ce style (4 caractères minimum) :'); if (c1 == null) return; if (String(c1).trim().length < 4) { alert('Code trop court (4 caractères minimum).'); return; } const c2 = prompt('Retape le code pour confirmer :'); if (c2 == null) return; if (String(c1).trim() !== String(c2).trim()) { alert('Les deux codes ne correspondent pas.'); return; } S.xlock = xrHash(c1); }
  else { const c = prompt('🔒 ACCÈS RESTREINT\nEntre ton code :'); if (c == null) return; if (xrHash(c) !== S.xlock) { alert('⛔ Code incorrect.'); return; } }
  S.hud = 'xr'; drawStyle(); pvSched(); schedSave(); status('🔓 Accès autorisé', true);
});
document.addEventListener('click', e => { const b = e.target.closest('[data-hudinf]'); if (!b) return; if (S.hud !== 'inf' && !confirm('Activer le style infini ? Sa cinématique d\'une minute va se jouer (spoil !).')) return; S.hud = 'inf'; drawStyle(); pvSched(); schedSave(); if (S.roll.mode !== 'off') setTimeout(() => status('⚠ Le roll automatique est activé : il remplacera ce style au prochain tirage', false), 1500); });
document.addEventListener('click', e => { const b = e.target.closest('[data-hudcrea]'); if (!b) return; S.hud = 'crea'; drawStyle(); pvSched(); schedSave(); status('♛ Mode créateur activé', true); if (S.roll.mode !== 'off') setTimeout(() => status('⚠ Le roll automatique est activé : il remplacera ce style au prochain tirage', false), 1800); });
document.addEventListener('click', e => { const b = e.target.closest('[data-hudx0s]'); if (!b) return; if (S.hud !== 'x0s' && !confirm('Activer la Singularité shiny ? Sa cinématique va se jouer (spoil !).')) return; S.hud = 'x0s'; drawStyle(); pvSched(); schedSave(); if (S.roll.mode !== 'off') setTimeout(() => status('⚠ Le roll automatique est activé : il remplacera ce style au prochain tirage', false), 1500); });
document.addEventListener('click', e => { const b = e.target.closest('[data-hudaby]'); if (!b) return; if (S.hud !== 'aby' && !confirm('Activer le style Abysse (1 sur 2 000 000) ? Sa cinématique de 90 s va se jouer (énorme spoil !).')) return; S.hud = 'aby'; drawStyle(); pvSched(); schedSave(); if (S.roll.mode !== 'off') setTimeout(() => status('⚠ Le roll automatique est activé : il remplacera ce style au prochain tirage', false), 1500); });
document.addEventListener('click', e => { const b = e.target.closest('[data-hudtrain]'); if (!b) return; if (S.hud !== 'train' && !confirm('Activer le style billet d\'or (1 sur 10 000 000) ? Sa cinématique va se jouer (spoil !).')) return; S.hud = 'train'; drawStyle(); pvSched(); schedSave(); if (S.roll.mode !== 'off') setTimeout(() => status('⚠ Le roll automatique est activé : il remplacera ce style au prochain tirage', false), 1500); });
document.addEventListener('click', e => { const b = e.target.closest('[data-hudgen]'); if (!b) return; if (S.hud !== 'gen' && !confirm('Activer le style légendaire (1 sur 1 000 000) ? Sa cinématique de 70 s va se jouer (énorme spoil !).')) return; S.hud = 'gen'; drawStyle(); pvSched(); schedSave(); if (S.roll.mode !== 'off') setTimeout(() => status('⚠ Le roll automatique est activé : il remplacera ce style au prochain tirage', false), 1500); });
document.addEventListener('click', e => { const b = e.target.closest('[data-hudtes]'); if (!b) return; if (S.hud !== 'tes' && !confirm('Activer le style ultime, le plus rare de tous ? Sa cinématique va se jouer (gros spoil !).')) return; S.hud = 'tes'; drawStyle(); pvSched(); schedSave(); if (S.roll.mode !== 'off') setTimeout(() => status('⚠ Le roll automatique est activé : il remplacera ce style au prochain tirage', false), 1500); });
document.addEventListener('click', e => { const b = e.target.closest('[data-hudvoid]'); if (!b) return; if (S.hud !== 'void' && !confirm('Activer le style néant, le plus rare ? Sa cinématique va se jouer (spoil !).')) return; S.hud = 'void'; drawStyle(); pvSched(); schedSave(); if (S.roll.mode !== 'off') setTimeout(() => status('⚠ Le roll automatique est activé : il remplacera ce style au prochain tirage', false), 1500); });
