/* ===== Configuration partagée (identique dans index.html et admin.html) ===== */
/* Réglages avancés communs à chaque thème météo et à chaque fête */
const TADV = {ang: 170, anim: false, dens: 1, spd: 1, wind: 0, pc: '', ps: 1, cc: '', cs: 1, sun: false, pos: 'auto', stars: false, fx2: 'none', bolt: 'auto', desc: '', msg: '', img: '', imgo: 0.5, emo: '', mr: 30, mc: '', mph: ''};
const DEFTHEMES = {
  clear: {name: 'Soleil', c: ['#1c6be6', '#56b0ff', '#bfe6ff'], fx: 'none', clouds: 1, moon: false, sun: true},
  cloudy: {name: 'Nuageux', c: ['#56697c', '#93a5b5', '#cdd7df'], fx: 'none', clouds: 3, moon: false},
  rain: {name: 'Pluie', c: ['#243244', '#44586f', '#76899c'], fx: 'rain', clouds: 3, moon: false},
  storm: {name: 'Orage', c: ['#0c101c', '#272c46', '#4a3e63'], fx: 'storm', clouds: 3, moon: false},
  snow: {name: 'Neige', c: ['#7e94ac', '#b7c7d8', '#e3ebf3'], fx: 'snow', clouds: 2, moon: false},
  night: {name: 'Nuit', c: ['#060a1d', '#13204a', '#2c3a6b'], fx: 'stars', clouds: 2, moon: true},
  cloudnight: {name: 'Nuit nuageuse', c: ['#070b18', '#1a2238', '#333c57'], fx: 'none', clouds: 3, moon: true},
  fullmoon: {name: 'Pleine lune', c: ['#02030c', '#0a1433', '#1d2b5c'], fx: 'stars', clouds: 1, moon: true, mr: 46, mph: 'full'},
  dawn: {name: 'Lever du soleil', c: ['#24325e', '#c0607c', '#ffc98a'], fx: 'none', clouds: 1, moon: false, sun: true, pos: 'h'},
  dusk: {name: 'Coucher du soleil', c: ['#191540', '#a8426a', '#ff9450'], fx: 'none', clouds: 1, moon: false, sun: true, pos: 'h'},
  fog: {name: 'Brouillard', c: ['#6b7785', '#a9b3bd', '#d5dbe0'], fx: 'fog', clouds: 2, moon: false},
  drizzle: {name: 'Bruine', c: ['#3a4a5c', '#5f7388', '#93a4b3'], fx: 'drizzle', clouds: 3, moon: false},
  sleet: {name: 'Pluie verglaçante', c: ['#35506b', '#6f93b3', '#c4def0'], fx: 'sleet', clouds: 3, moon: false},
  hail: {name: 'Grêle', c: ['#141a2c', '#34405e', '#6a7a9c'], fx: 'hail', clouds: 3, moon: false},
  blizzard: {name: 'Tempête de neige', c: ['#6d7f94', '#a5b4c4', '#e6edf4'], fx: 'blizzard', clouds: 3, moon: false},
  frost: {name: 'Gel', c: ['#173456', '#5f94bd', '#dff1ff'], fx: 'frost', clouds: 0, moon: false},
  wind: {name: 'Vent fort', c: ['#2f6fa8', '#6fb0d8', '#cfe9f3'], fx: 'wind', clouds: 3, moon: false},
  heat: {name: 'Canicule', c: ['#d9480f', '#ff9f1c', '#ffe08a'], fx: 'heat', clouds: 0, moon: false},
  rainbow: {name: 'Arc-en-ciel', c: ['#3a8dde', '#7cc4f5', '#e3f4ff'], fx: 'rainbow', clouds: 1, moon: false, sun: true},
  aurora: {name: 'Aurore boréale', c: ['#020712', '#06283a', '#0b4a4a'], fx: 'aurora', clouds: 0, moon: false},
  meteors: {name: 'Étoiles filantes', c: ['#03030f', '#0e1238', '#251b52'], fx: 'meteors', clouds: 0, moon: true},
  sand: {name: 'Tempête de sable', c: ['#8a5a2b', '#c98d4a', '#f0c98a'], fx: 'sand', clouds: 2, moon: false},
  lucky: {name: 'Jour de chance', c: ['#ff9d00', '#ffd23f', '#fff6b8'], fx: 'lucky', clouds: 0, moon: false, msg: '🍀 JOUR DE CHANCE 🍀'}
};
const DEFEVENTS = [
  {id: 'newyear', name: 'Nouvel An', from: '12-31', to: '01-02', on: true, c: ['#1a0b3b', '#3b1a7a', '#c07a2c'], fx: 'fireworks', clouds: 0, moon: true, msg: '✨ Bonne année !'},
  {id: 'chandeleur', name: 'Chandeleur', from: '02-02', to: '02-02', on: true, c: ['#5a2f0c', '#c27a2c', '#ffd98a'], fx: 'crepes', clouds: 1, moon: false, msg: '🥞 Bonne Chandeleur ! | Une crêpe, deux crêpes, trois crêpes…'},
  {id: 'valentin', name: 'Saint-Valentin', from: '02-13', to: '02-14', on: true, c: ['#5a0f3a', '#c2306f', '#ff9bb8'], fx: 'hearts', clouds: 1, moon: false, msg: '❤ Joyeuse Saint-Valentin'},
  {id: 'patrick', name: 'Saint-Patrick', from: '03-17', to: '03-17', on: true, c: ['#063a1c', '#10813f', '#9be37a'], fx: 'clovers', clouds: 1, moon: false, msg: '☘ Joyeuse Saint-Patrick'},
  {id: 'april', name: "Poisson d'avril", from: '04-01', to: '04-01', on: true, c: ['#0b4f7a', '#2aa3d8', '#b9ecff'], fx: 'bubbles', clouds: 1, moon: false, msg: "🐟 Poisson d'avril ! | Attention : un poisson s'est caché sur l'écran"},
  {id: 'easter', name: 'Pâques', from: 'easter', to: 'easter+1', on: true, c: ['#3fa7d6', '#9be3a6', '#fff3b0'], fx: 'eggs', clouds: 1, moon: false, msg: '🐣 Joyeuses Pâques | 🥚 3 œufs sont cachés sur l\'écran…'},
  {id: 'starwars', name: 'Star Wars Day', from: '05-04', to: '05-04', on: true, c: ['#000004', '#05051a', '#141433'], fx: 'stars', clouds: 0, moon: false, msg: '✨ Que la Force soit avec toi | May the 4th be with you'},
  {id: 'may8', name: '8 mai 1945', from: '05-08', to: '05-08', on: true, c: ['#12264d', '#2c4f8f', '#c9d6ee'], fx: 'none', clouds: 1, moon: false, msg: '8 mai 1945 · Victoire'},
  {id: 'music', name: 'Fête de la musique', from: '06-21', to: '06-21', on: true, c: ['#2b0a4a', '#7a1fa2', '#ff6fb1'], fx: 'notes', clouds: 0, moon: false, msg: '🎶 Bonne fête de la musique'},
  {id: 'bastille', name: 'Fête nationale', from: '07-13', to: '07-14', on: true, c: ['#0a1f5c', '#2a4fc4', '#e8edff'], fx: 'fireworks', clouds: 0, moon: true, msg: '🇫🇷 Bonne fête nationale'},
  {id: 'halloween', name: 'Halloween', from: '10-25', to: '10-31', on: true, c: ['#0d0614', '#3a1240', '#e8761a'], fx: 'halloween', clouds: 2, moon: true, mr: 46, mc: '#ffb35c', mph: 'full', msg: '🎃 Joyeux Halloween | 🦇 Attention aux chauves-souris… | 👻 Il y a quelqu\'un derrière toi ? | 🍬 Des bonbons ou un sort ?'},
  {id: 'nov11', name: '11 novembre', from: '11-10', to: '11-11', on: true, c: ['#0b1d3a', '#1d3f73', '#6f8db8'], fx: 'petals', clouds: 2, moon: false, msg: '11 novembre · Armistice 1918'},
  {id: 'xmas', name: 'Noël', from: '12-20', to: '12-26', on: true, c: ['#07261c', '#0f5a3d', '#b3262d'], fx: 'santa', clouds: 1, moon: true, msg: '🎄 Joyeux Noël | ⛄ Le père Noël passe bientôt…'},
  {id: 'fri13', name: 'Vendredi 13', from: 'fri13', to: 'fri13', on: true, c: ['#08080c', '#1d1b2a', '#3c3550'], fx: 'bats', clouds: 2, moon: true, msg: '🐈‍⬛ Vendredi 13… | Ne passe pas sous une échelle'}
];
const DEFEGGS = {halloween: true, fri13: true, newyear: true, april: true, starwars: true, xmas: true, easter: true, konami: true, bzh: true, ufo: true, wolf: true, snow1: true, nums: true, lcd: true};
const DEFWX = {golden: true, frost: true, fullmoon: true, cloudnight: true, rainbow: true, heat: 32, windG: 70, blizG: 55};
/* Version de l'application : l'admin prévient si l'écran a un index.html plus ancien */
const APPV = 41;
const DEFSND = {on: false, vol: 50, rain: true, wind: true, thunder: true, nature: true, style: true, quiet: 'low', qf: 22, qt: 7};
const DEFMASC = {on: false, src: '', mode: 'walk', pos: 'br', size: 110, spd: 1, every: 40, look: 'r', op: 1, talk: true, acc: true, say: ''};
/* empreinte d'une image (pour ne pas renvoyer la mascotte à chaque enregistrement) */
const imgHash = s => { let h = 7; const st = Math.max(1, s.length >> 10); for (let i = 0; i < s.length; i += st) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36) + s.length.toString(36); };
const DEFNIGHT = {on: false, from: 22, to: 7, mode: 'clock', lum: .5, wake: true};
const DEFBOOT = {on: true, style: 'linux', title: 'AZURE OS', sub: 'Welcome to'};
/* Galerie des styles : [id, nom, description, fond, couleur, police, graisse, petit texte] — sert aussi au roll */
const SIGLIST = [
  ['ios', 'iOS Liquid Glass', 'Verre dépoli, couleurs qui suivent la météo.', 'linear-gradient(170deg,#1c6be6,#56b0ff 60%,#bfe6ff)', '#fff', '-apple-system,Helvetica,Arial,sans-serif', 200, 'Ciel dégagé'],
  ['cyber', 'Cyberpunk', 'Ville néon la nuit : gratte-ciel aux fenêtres allumées, enseignes en kanji qui grésillent, voitures volantes, glitch.', 'linear-gradient(135deg,#0b0820,#2a0838)', '#fcee0a', 'Rajdhani,sans-serif', 700, 'UPLINK OK'],
  ['medieval', 'Grimoire médiéval', 'Parchemins, sceau de cire, lettrine, heures en chiffres romains.', 'radial-gradient(circle at 30% 30%,#5a3a1a,#1e1206)', '#f3d27a', 'Cinzel,serif', 700, 'Messire !'],
  ['retro', 'Terminal rétro', 'Écran CRT vert, icônes en ASCII, démarrage façon BIOS.', '#021a09', '#4dff7a', 'VT323,monospace', 400, '$ meteo_'],
  ['synth', 'Synthwave 84', 'Soleil rayé, montagnes néon et sol quadrillé qui défile.', 'linear-gradient(#12002a,#5a1080 60%,#ff2bd6)', '#ffe259', 'Monoton,sans-serif', 400, 'RADICAL'],
  ['steam', 'Steampunk', 'Thermomètre à aiguille en laiton, engrenages, vapeur.', 'radial-gradient(circle,#5a3a1a,#2a1707)', '#f0cf80', '"Special Elite",serif', 400, 'Modèle 1887'],
  ['pixel', 'Pixel RPG', 'Fenêtres de jeu de rôle, icônes pixel, barres de PV.', 'linear-gradient(#3b4cc0,#18206b)', '#ffcd75', '"Press Start 2P",monospace', 400, '+100 XP'],
  ['scifi', 'Hologramme sci-fi', 'Anneau holographique, faisceau de balayage, données.', 'radial-gradient(circle,#0a3a68,#03101f)', '#7fe0ff', 'Orbitron,sans-serif', 500, 'T0'],
  ['minimal', 'Suisse (minimal)', 'Typographie suisse noire sur papier, carré rouge.', '#f1efe9', '#111', 'Helvetica,Arial,sans-serif', 700, 'Clair.'],
  ['gazette', 'La Gazette', 'Une de journal : titre gothique et gros titres.', '#ece3cf', '#161412', '"Playfair Display",serif', 900, 'EXTRA !'],
  ['bd', 'Bande dessinée', 'Trames, bulles, explosion « KABOOM ! ».', '#ffd60a', '#e63946', 'Bangers,Impact,sans-serif', 400, 'PLIC !'],
  ['gameboy', 'Game Boy', '4 tons de vert, pixels, cadre de console.', '#9bbc0f', '#0f380f', 'Silkscreen,monospace', 400, '▶ START'],
  ['win95', 'Windows 95', 'Fenêtres grises, barre des tâches, bouton Démarrer.', '#008080', '#fff', 'Tahoma,Verdana,sans-serif', 700, 'meteo.exe'],
  ['chalk', 'Tableau noir', 'Craies de couleur, cadre en bois, formules de maths.', '#23412f', '#f3f3ea', '"Gochi Hand",cursive', 400, 'E = mc²'],
  ['cahier', 'Cahier Seyès', 'Lignes de cahier, post-it, stylo rouge.', 'repeating-linear-gradient(0deg,#fdfcf5 0 7px,#b9d3ee 7px 8px)', '#d32f2f', 'Caveat,cursive', 700, 'Exercice 1'],
  ['flap', 'Aéroport (split-flap)', 'Panneau des départs à palettes qui tournent.', '#141414', '#ffd400', 'Oswald,sans-serif', 600, 'À L\'HEURE'],
  ['cockpit', 'Cockpit (METAR)', 'Instruments d\'avion, boussole du vent, METAR.', '#050607', '#39ff7a', '"Share Tech Mono",monospace', 400, 'CAVOK'],
  ['lcd', 'Station LCD', 'Afficheur 7 segments, rétroéclairage (bouton LIGHT).', 'linear-gradient(160deg,#c3cfae,#9fae88)', '#1d2617', '"Share Tech Mono",monospace', 400, 'TEMP OUT'],
  ['neon', 'Enseigne néon', 'Tubes néon qui grésillent sur un mur de briques.', 'linear-gradient(#3a1a14,#1a0a08)', '#ff4fd8', '"Tilt Neon",sans-serif', 400, 'OUVERT'],
  ['deco', 'Art déco', 'Noir et or, rayons, élégance des années 20.', 'repeating-conic-gradient(from -90deg at 50% 118%,rgba(212,175,55,.25) 0 3deg,#0b0b0d 3deg 8deg)', '#d4af37', '"Poiret One",serif', 400, '✦ 1925 ✦'],
  ['kawaii', 'Kawaii', 'Pastel, icônes avec des petits visages, cœurs.', 'linear-gradient(#ffd6ec,#d6e2ff)', '#ff7ab8', 'Fredoka,sans-serif', 600, '(^o^)'],
  ['matrix', 'Matrix', 'Pluie de code verte et phrases mystérieuses.', '#000a02', '#39ff6a', '"Share Tech Mono",monospace', 400, 'Neo…'],
  ['blueprint', 'Plan d\'architecte', 'Quadrillage bleu, cotes, cartouche technique.', '#123f8c', '#fff', '"Architects Daughter",cursive', 400, 'FIG. 1'],
  ['western', 'Far West', 'Affiche WANTED, planches de bois, cactus, virevoltants.', 'linear-gradient(#7a5230,#5a3a1c)', '#ffe2a8', 'Rye,serif', 400, 'WANTED'],
  ['spooky', 'Manoir hanté', 'Halloween : bave verte, toiles d\'araignée, yeux dans le noir.', 'linear-gradient(#1a0420,#3a1240)', '#ff7518', 'Creepster,cursive', 400, 'Bouh !'],
  ['xmas', 'Noël', 'Sucre d\'orge, neige sur les cadres, guirlande lumineuse.', 'linear-gradient(#7a0d18,#0f5a34)', '#fff', '"Mountains of Christmas",serif', 700, 'Ho ho ho'],
  ['manga', 'Manga dramatique', 'Lignes de vitesse, cases de manga, onomatopées japonaises qui suivent la météo, « ドン ! » surprise.', 'repeating-conic-gradient(from 0deg at 30% 50%,#2b0a3d 0 2deg,#8a2be2 2deg 6deg)', '#fff36b', '"Dela Gothic One",Impact,sans-serif', 400, 'ゴゴゴ'],
  ['mecha', 'Centre de commandement', 'QG d\'anime de mechas : alvéoles orange, kanji, afficheur, bandeau ALERTE rouge par mauvais temps.', '#050506', '#ff8c00', '"Noto Serif JP",Georgia,serif', 900, '警告'],
  ['vapor', 'Vaporwave', 'Rose et cyan pastel, sol en damier qui défile, colonne en marbre, palmiers, cube 3D, fenêtres « .exe », texte ｅｓｔｈéｔｉｑｕｅ, magnéto VHS.', 'linear-gradient(#ff9ee6,#c58bff 50%,#7fd8ff)', '#fff', '"Bodoni Moda",serif', 900, 'ｖａｐｏｒ'],
  ['hacker', 'Terminal hacker', 'Fenêtres de terminal, température en gros pixels, texte qui s\'écrit tout seul, journaux qui défilent, barre d\'état en bas.', '#0d1117', '#3fb950', '"JetBrains Mono",monospace', 700, '$ ./meteo'],
  ['ukiyo', 'Estampe japonaise', 'Papier washi, ciel dégradé bleu de Prusse, soleil rouge, montagne, vague, brumes roses, sceau rouge, pluie à l\'encre, haïkus.', 'linear-gradient(#1c3a63,#efe3c8 45%)', '#c8402a', '"Shippori Mincho B1",serif', 800, '天気'],
  ['chan', 'Menu des chaînes', 'Façon menu de console de salon : tuiles blanches arrondies, barre grise ondulée avec la grande horloge, boutons ronds, main-curseur qui se promène.', 'linear-gradient(#f2f3f4,#dfe2e5)', '#35b6e8', 'Nunito,sans-serif', 800, 'Chaîne météo'],
  ['hbc', 'Chaîne homebrew', 'Fond sombre avec de grosses bulles bleues qui montent, liste façon applications, barre IP et version.', 'radial-gradient(circle at 30% 30%,#14306a,#02050f)', '#9fd0ff', 'Nunito,sans-serif', 800, 'meteo.dol'],
  ['pres', '👁 La Présence', 'Caméra de surveillance d\'un couloir, la nuit… et quelqu\'un au bout, qui se rapproche à chaque coupure de courant. L\'activation fait (très) peur. Jamais tiré au roll.', 'linear-gradient(180deg,#1a1f1a,#050605)', '#d8e6d8', 'VT323,monospace', 400, '● REC'],
  ['nova', 'Supernova', 'Nébuleuse colorée, pulsar qui tourne, éruptions. À l\'activation : l\'écran se coupe, se fissure et explose en morceaux !', 'radial-gradient(circle at 50% 50%,#fff 0 3%,#ff8a3c 8%,#c8287a 22%,#2a1460 45%,#05030c 70%)', '#fff', 'Orbitron,sans-serif', 700, '✸ BOOM'],
  ['marin', 'Marin (hublot)', 'Hublot en laiton, bulles, vagues, vent en nœuds.', 'linear-gradient(#1b4555,#0f2c38)', '#e7c37a', 'Oswald,sans-serif', 600, 'Cap au nord']
];
/* Rareté des styles pour le roll (façon caisse CS) */
const RARITY = [['blue', 'Courant', '#4b69ff', 55], ['purple', 'Rare', '#8847ff', 26], ['pink', 'Épique', '#d32ce6', 12], ['red', 'Légendaire', '#eb4b4b', 5.5], ['gold', '★ Exceptionnel', '#e4ae39', 1.5]];
const RAR = {nova: 'gold', ukiyo: 'gold', manga: 'gold', mecha: 'red', vapor: 'red', hbc: 'red', chan: 'red', cyber: 'pink', synth: 'pink', hacker: 'pink', spooky: 'pink', xmas: 'pink', steam: 'pink', scifi: 'pink', medieval: 'purple', pixel: 'purple', gameboy: 'purple', win95: 'purple', flap: 'purple', cockpit: 'purple', neon: 'purple', deco: 'purple', matrix: 'purple', marin: 'purple', western: 'purple'};
const DEFROLL = {mode: 'off', hour: 8, every: 6, tap: true, pool: []};
const NEWKEYS = {unit: 'C', festAuto: true, labels: {meteo: 'Météo', radar: 'Radar', infos: 'Infos'}, show: {hours: true, days: true, details: true, date: true, air: true, pollen: true}, layout: {now: 'left', days: 'side', hours: 'bottom', size: 'L'}};
const DEF = {v: 0, geo: true, name: 'Lycée Yves Thépot · Quimper', lat: 47.978, lon: -4.084, view: 'meteo', force: 'auto', refresh: 10, zoom: 7,
  tabs: {radar: true, infos: true}, rain: true, bolt: true, ticker: '', tickerOn: false, notice: null, fire: null, lite: false, radarQ: 8, hud: 'ios', layout: NEWKEYS.layout, unit: 'C', festAuto: true, festHud: 'all', voice: true, icao: 'LFRQ', labels: NEWKEYS.labels, show: NEWKEYS.show, eggs: DEFEGGS, wx: DEFWX, snd: DEFSND, masc: DEFMASC, night: DEFNIGHT, boot: DEFBOOT, roll: DEFROLL, themes: DEFTHEMES, events: DEFEVENTS,
  widgets: [{t: 'clock', title: 'Heure', tz: 'Europe/Paris', w: 1}]};
const norm = c => {
  c.tabs = Object.assign({radar: true, infos: true}, c.tabs);
  c.labels = Object.assign({}, NEWKEYS.labels, c.labels);
  c.layout = Object.assign({}, NEWKEYS.layout, c.layout); if (c.hud === 'glass') c.hud = 'ios';
  c.show = Object.assign({}, NEWKEYS.show, c.show);
  c.snd = Object.assign({}, DEFSND, c.snd); c.masc = Object.assign({}, DEFMASC, c.masc); c.night = Object.assign({}, DEFNIGHT, c.night); c.boot = Object.assign({}, DEFBOOT, c.boot); c.roll = Object.assign({}, DEFROLL, c.roll); if (!Array.isArray(c.roll.pool)) c.roll.pool = [];
  c.eggs = Object.assign({}, DEFEGGS, c.eggs); c.wx = Object.assign({}, DEFWX, c.wx);
  if (c.geo === undefined) c.geo = true;
  if (c.voice === undefined) c.voice = true; if (c.festHud === undefined) c.festHud = 'all'; if (!c.icao) c.icao = 'LFRQ';
  const T = {}; Object.keys(DEFTHEMES).forEach(k => T[k] = Object.assign({}, TADV, DEFTHEMES[k], (c.themes || {})[k]));
  c.themes = T;
  if (!Array.isArray(c.events)) c.events = JSON.parse(JSON.stringify(DEFEVENTS));
  if ((+c.evVer || 0) < 3) {   // migration : nouvelles fêtes + Halloween / musique améliorés
    const have = new Set(c.events.map(e => e.id));
    DEFEVENTS.forEach((d, i) => { if (!have.has(d.id)) c.events.splice(d.id === 'fri13' ? c.events.length : Math.min(c.events.length, i), 0, JSON.parse(JSON.stringify(d))); });
    c.events.forEach(e => {
      const d = DEFEVENTS.find(x => x.id === e.id);
      if (e.id === 'halloween' && e.fx === 'leaves') Object.assign(e, {fx: 'halloween', from: d.from, c: d.c, mr: d.mr, mc: d.mc, mph: d.mph, msg: d.msg});
      if (e.id === 'music' && e.fx === 'confetti') e.fx = 'notes';
    });
    c.evVer = 3;
  }
  c.events = c.events.map(e => Object.assign({}, TADV, e));
  c.events.forEach(e => { if (e.id === 'xmas' && e.fx === 'snow') e.fx = 'santa'; });   // migration : le père Noël passe
  return c;
};

/* ===== Serveur (GitHub) : la config vit dans config.json, sur la branche « config » du dépôt =====
   L'écran la lit (sans mot de passe) ; seule la page admin, déverrouillée par le mot de passe, peut l'écrire. */
const GHS = (() => { const h = location.hostname.match(/^([a-z0-9-]+)\.github\.io$/i), p = location.pathname.split('/').filter(Boolean); return {o: h ? h[1] : 'Haze15', r: h && p[0] && !/\.html?$/i.test(p[0]) ? p[0] : 'meteo', b: 'config'}; })();
const GHAPI = 'https://api.github.com/repos/' + GHS.o + '/' + GHS.r;
const b64u = s => { const b = new TextEncoder().encode(s); let t = ''; for (let i = 0; i < b.length; i += 8192) t += String.fromCharCode.apply(null, b.subarray(i, i + 8192)); return btoa(t); };
const ub64 = s => { const t = atob(s.replace(/\s/g, '')), u = new Uint8Array(t.length); for (let i = 0; i < t.length; i++) u[i] = t.charCodeAt(i); return new TextDecoder().decode(u); };
/* Lecture d'un fichier du serveur : {text, sha} ; null s'il n'existe pas encore ; exception si le serveur est injoignable */
async function ghGet(f, tok) {
  const h = {Accept: 'application/vnd.github+json'}; if (tok) h.Authorization = 'Bearer ' + tok;
  const r = await fetch(GHAPI + '/contents/' + f + '?ref=' + GHS.b, {cache: 'no-cache', headers: h});
  if (r.status === 404) return null; if (!r.ok) throw new Error('serveur ' + r.status);
  const j = await r.json(); let text = j.encoding === 'base64' && j.content ? ub64(j.content) : '';
  if (!text && j.download_url) text = await (await fetch(j.download_url + '?t=' + Date.now(), {cache: 'no-store'})).text();
  return {text, sha: j.sha};
}
