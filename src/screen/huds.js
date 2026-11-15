const FONTS = {
  mono: 'ui-monospace,"SF Mono","JetBrains Mono",Consolas,Menlo,"DejaVu Sans Mono",monospace',
  serif: 'Georgia,"Times New Roman","DejaVu Serif",serif',
  round: '"SF Pro Rounded","Nunito","Arial Rounded MT Bold","Trebuchet MS","DejaVu Sans",sans-serif',
  cond: '"Arial Narrow","Roboto Condensed","Liberation Sans Narrow","DejaVu Sans Condensed",sans-serif',
  imp: 'Impact,"Arial Black","Liberation Sans",sans-serif',
  comic: '"Comic Sans MS","Chalkboard SE","Comic Neue",cursive,sans-serif'
};
const SCAN = 'repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,transparent 1px 3px)';
const hud = (ac, o) => Object.assign({r: 4, bw: 1, blur: 0, fnt: 'mono', tf: 'mono', nf: 'mono', tw: 200, lc: 'uppercase', ll: '.14em', lcol: ac, ac, fg: '#e6f4ff', gl: 'rgba(6,14,26,.62)', ln: ac + '55', cor: 1, ob: 'rgba(3,10,20,.5)', tsh: '0 0 28px ' + ac, sh: 'none', tabon: ac, tabtx: '#021018'}, o || {});
const HUDS0 = [
  // --- iOS (couleurs suivant la météo) ---
  ['ios', 'iOS Liquid Glass', {}],
  ['ios-flat', 'iOS épuré', {r: 20, bw: 0, blur: 8, sh: 'none'}],
  ['bulles', 'Bulles', {r: 44, rt: 999, rb: 999, fnt: 'round', tf: 'round', nf: 'round'}],
  ['cristal', 'Cristal', {r: 30, blur: 44, ln: 'rgba(255,255,255,.7)', sh: '0 12px 40px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.7)'}],
  ['minimal-ios', 'Minimal (iOS)', {gl: 'transparent', bw: 0, sh: 'none', blur: 0, r: 0}],
  // --- HUD technologiques ---
  ['hud-cyan', 'HUD Cyan', hud('#00e5ff')],
  ['terminal', 'Terminal vert', hud('#33ff66', {fg: '#c8ffd8', gl: 'rgba(0,18,6,.7)', ob: 'rgba(0,14,4,.78)', ot: SCAN, tabtx: '#001a08'})],
  ['crt-ambre', 'CRT ambre', hud('#ffb000', {fg: '#ffe2a0', gl: 'rgba(24,14,0,.7)', ob: 'rgba(20,10,0,.78)', ot: SCAN, tabtx: '#1a0f00'})],
  ['alerte', 'Alerte rouge', hud('#ff3b3b', {fg: '#ffd9d9', gl: 'rgba(28,4,4,.68)', ob: 'rgba(24,0,0,.72)', tabtx: '#fff'})],
  ['cyber-neon', 'Cyber néon', hud('#ff2bd6', {fg: '#ffe6fa', gl: 'rgba(20,4,28,.68)', ob: 'rgba(14,0,26,.7)', tsh: '0 0 24px #ff2bd6,0 0 48px #00e5ff', tabtx: '#fff'})],
  ['blueprint', 'Blueprint', hud('#ffffff', {fg: '#fff', gl: 'rgba(255,255,255,.08)', ln: 'rgba(255,255,255,.6)', ob: 'rgba(8,48,130,.88)', ot: 'linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px)', tops: '24px 24px', tabtx: '#0a3a8a', tsh: 'none', lcol: '#cfe3ff'})],
  ['matrix', 'Matrix', hud('#00ff41', {ob: 'rgba(0,8,0,.85)', ot: SCAN, fg: '#b8ffc8', gl: 'rgba(0,16,0,.7)', tabtx: '#001a05', tsh: '0 0 18px #00ff41,0 0 40px #00ff41'})],
  ['sci-orange', 'Sci-fi orange', hud('#ff7a1a', {fg: '#ffe3cc', gl: 'rgba(24,10,0,.68)', ob: 'rgba(18,6,0,.7)', tabtx: '#180800'})],
  ['cockpit', 'Cockpit', hud('#7dff9b', {r: 0, tw: 300, ob: 'rgba(0,0,0,.82)', gl: 'rgba(0,10,4,.75)', fg: '#d8ffe2', tsh: 'none'})],
  ['sonar', 'Sonar', hud('#3dff7a', {ob: 'rgba(0,12,6,.8)', ot: 'repeating-radial-gradient(circle at 50% 50%,rgba(61,255,122,.10) 0 1px,transparent 1px 48px)', fg: '#d0ffe0', gl: 'rgba(0,16,8,.7)', tabtx: '#001a0a'})],
  ['tron', 'Tron', hud('#22d3ff', {r: 2, bw: 2, ob: 'rgba(0,6,14,.82)', gl: 'rgba(0,16,28,.55)', sh: '0 0 14px #22d3ff88, inset 0 0 14px #22d3ff33', tsh: '0 0 30px #22d3ff, 0 0 60px #22d3ff'})],
  ['warp', 'Violet warp', hud('#b388ff', {ob: 'rgba(10,4,28,.74)', gl: 'rgba(20,8,44,.62)', fg: '#efe6ff', tabtx: '#120628'})],
  ['lime', 'Lime acide', hud('#c6ff00', {ob: 'rgba(10,14,0,.8)', gl: 'rgba(16,22,0,.65)', fg: '#f3ffc9', tabtx: '#101800'})],
  ['militaire', 'Militaire', hud('#a8b38a', {r: 0, ob: 'rgba(14,18,8,.84)', gl: 'rgba(26,32,14,.7)', fg: '#e4ebcf', tsh: 'none', tw: 400})],
  ['glace', 'Glace polaire', hud('#9fe8ff', {r: 10, fnt: null, tf: null, nf: null, ob: 'rgba(4,18,30,.55)', gl: 'rgba(160,230,255,.12)', ln: 'rgba(190,240,255,.5)', tsh: '0 0 24px #9fe8ff99', blur: 14, cor: 0, lc: 'none', ll: '.04em', tw: 100})],
  ['hologramme', 'Hologramme', hud('#7df9ff', {ob: 'rgba(2,10,26,.6)', gl: 'linear-gradient(135deg,rgba(0,229,255,.14),rgba(255,43,214,.12))', ln: 'rgba(125,249,255,.5)', tsh: '0 0 20px #7df9ff,0 0 40px #ff2bd6'})],
  ['furtif', 'Furtif', hud('#8a97a6', {ob: 'rgba(0,0,0,.84)', gl: 'rgba(18,22,28,.7)', fg: '#aeb8c4', tsh: 'none', tw: 300, ln: 'rgba(138,151,166,.25)'})],
  // --- rétro ---
  ['papier', 'Papier', {r: 6, bw: 1, blur: 0, fnt: 'serif', tf: 'serif', nf: 'serif', fg: '#2b2418', gl: 'rgba(255,250,235,.72)', ln: 'rgba(60,45,20,.35)', ac: '#8a5a00', lcol: '#8a5a00', lc: 'uppercase', ll: '.12em', ob: 'rgba(247,239,220,.9)', sh: '0 2px 6px rgba(60,40,0,.15)', tw: 300, tabon: '#2b2418', tabtx: '#f7efdc', tsh: 'none'}],
  ['journal', 'Journal', {r: 0, bw: 2, blur: 0, fnt: 'serif', tf: 'serif', nf: 'serif', fg: '#111', gl: 'rgba(255,255,255,.55)', ln: '#111', ac: '#111', lcol: '#111', lc: 'uppercase', ll: '.2em', ob: 'rgba(236,232,222,.93)', sh: 'none', tw: 700, tl: '-.05em', tabon: '#111', tabtx: '#eee', tsh: 'none'}],
  ['console', 'Console', {r: 0, bw: 1, blur: 0, fnt: 'mono', tf: 'mono', nf: 'mono', fg: '#e8e8e8', gl: 'rgba(30,30,30,.8)', ln: '#555', ac: '#9cdcfe', lcol: '#9cdcfe', lc: 'lowercase', ll: '.04em', ob: 'rgba(20,20,22,.88)', sh: 'none', tw: 300, tabon: '#9cdcfe', tabtx: '#111', tsh: 'none'}],
  ['vaporwave', 'Vaporwave', {r: 22, bw: 2, blur: 8, fnt: 'round', tf: 'round', nf: 'round', fg: '#fff0fb', gl: 'rgba(255,113,206,.16)', ln: 'rgba(1,205,254,.6)', ac: '#05ffa1', lcol: '#fffb96', ob: 'linear-gradient(180deg,rgba(60,0,110,.6),rgba(255,70,170,.35))', sh: '0 0 22px rgba(255,113,206,.35)', tsh: '4px 4px 0 #01cdfe', tw: 300, tabon: '#ff71ce', tabtx: '#2a003a'}],
  ['synthwave', 'Synthwave', {r: 6, bw: 1, blur: 0, fnt: 'cond', tf: 'cond', nf: 'cond', fg: '#ffe9ff', gl: 'rgba(40,0,70,.55)', ln: '#ff2bd6', ac: '#ff2bd6', lcol: '#00e5ff', lc: 'uppercase', ll: '.18em', ob: 'rgba(14,0,40,.78)', ot: 'repeating-linear-gradient(0deg,rgba(255,43,214,.10) 0 1px,transparent 1px 30px)', sh: '0 0 18px #ff2bd666', tsh: '0 0 20px #ff2bd6,0 0 50px #7a1fa2', tw: 400, tabon: '#ff2bd6', tabtx: '#fff'}],
  ['lcd', 'LCD vert', {r: 3, bw: 2, blur: 0, fnt: 'mono', tf: 'mono', nf: 'mono', fg: '#1c2b10', gl: 'rgba(120,140,90,.45)', ln: '#2f4020', ac: '#1c2b10', lcol: '#1c2b10', lc: 'uppercase', ll: '.1em', ob: 'rgba(155,176,122,.96)', sh: 'none', tw: 500, tabon: '#1c2b10', tabtx: '#9bb07a', tsh: 'none'}],
  ['gameboy', 'Game Boy', {r: 6, bw: 3, blur: 0, fnt: 'mono', tf: 'mono', nf: 'mono', fg: '#0f380f', gl: 'rgba(139,172,15,.5)', ln: '#0f380f', ac: '#0f380f', lcol: '#0f380f', lc: 'uppercase', ll: '.08em', ob: 'rgba(155,188,15,.96)', sh: 'none', tw: 600, tabon: '#0f380f', tabtx: '#9bbc0f', tsh: 'none'}],
  ['c64', 'Commodore 64', {r: 0, bw: 3, blur: 0, fnt: 'mono', tf: 'mono', nf: 'mono', fg: '#a5a5ff', gl: 'rgba(64,49,141,.6)', ln: '#a5a5ff', ac: '#fff', lcol: '#fff', lc: 'uppercase', ll: '.08em', ob: 'rgba(53,40,121,.96)', sh: 'none', tw: 600, tabon: '#a5a5ff', tabtx: '#352879', tsh: 'none'}],
  ['dos', 'DOS bleu', {r: 0, bw: 3, bs: 'double', blur: 0, fnt: 'mono', tf: 'mono', nf: 'mono', fg: '#fff', gl: 'rgba(0,0,170,.7)', ln: '#fff', ac: '#ff5', lcol: '#ff5', lc: 'uppercase', ll: '.06em', ob: 'rgba(0,0,140,.95)', sh: 'none', tw: 500, tabon: '#aaa', tabtx: '#000', tsh: 'none'}],
  // --- modernes ---
  ['material', 'Material', {r: 12, bw: 0, blur: 8, sh: '0 8px 20px rgba(0,0,0,.28)', lc: 'none', ll: '0'}],
  ['neumorphisme', 'Neumorphisme', {r: 22, bw: 0, blur: 0, fg: '#44506a', gl: '#e0e5ec', ln: 'transparent', sh: '8px 8px 16px #a3b1c6,-8px -8px 16px #fff', ob: 'rgba(224,229,236,.97)', ac: '#6c7a96', lcol: '#6c7a96', tw: 200, tabon: '#e0e5ec', tabtx: '#44506a', tsh: 'none'}],
  ['brutaliste', 'Brutaliste', {r: 0, bw: 4, blur: 0, fnt: 'imp', tf: 'imp', nf: 'imp', fg: '#000', gl: 'rgba(255,230,0,.92)', ln: '#000', ac: '#000', lcol: '#000', lc: 'uppercase', ll: '.04em', ob: 'rgba(255,255,255,.96)', sh: '6px 6px 0 #000', tw: 400, tabon: '#000', tabtx: '#ffe600', tsh: 'none'}],
  ['verre-noir', 'Verre noir', {r: 20, bw: 1, blur: 30, fg: '#fff', gl: 'rgba(0,0,0,.42)', ln: 'rgba(255,255,255,.18)', ob: 'rgba(0,0,0,.35)', sh: '0 10px 30px rgba(0,0,0,.4)', ac: '#fff'}],
  ['verre-clair', 'Verre clair', {r: 22, blur: 30, fg: '#1a2433', gl: 'rgba(255,255,255,.55)', ln: 'rgba(255,255,255,.9)', ob: 'rgba(255,255,255,.38)', sh: '0 8px 24px rgba(20,40,80,.18)', lcol: '#1a2433', tabon: 'rgba(255,255,255,.9)', tabtx: '#1a2433'}],
  ['pilules', 'Pilules', {r: 34, rt: 999, rb: 999}],
  ['carre', 'Carré net', {r: 0, rt: 0, rb: 0, bw: 1, sh: 'none', blur: 12}],
  ['double', 'Double filet', {r: 8, bw: 4, bs: 'double', sh: 'none'}],
  ['pointille', 'Pointillé', {r: 16, bw: 2, bs: 'dashed', blur: 0, sh: 'none'}],
  ['fil', 'Fil fin', {gl: 'transparent', bw: 0, sh: 'none', blur: 0, r: 0}],
  ['elegant', 'Élégant', {r: 2, bw: 1, blur: 0, fnt: 'serif', tf: 'serif', nf: 'serif', fg: '#f3e9d2', gl: 'rgba(20,16,8,.6)', ln: 'rgba(212,175,55,.55)', ac: '#d4af37', lcol: '#d4af37', lc: 'uppercase', ll: '.22em', ob: 'rgba(10,8,4,.72)', sh: 'none', tw: 200, tabon: '#d4af37', tabtx: '#1a1405', tsh: 'none'}],
  ['luxe', 'Luxe noir et or', {r: 0, bw: 2, blur: 0, cor: 1, fnt: 'serif', tf: 'serif', nf: 'serif', fg: '#f7e7b4', gl: 'rgba(0,0,0,.72)', ln: '#d4af37', ac: '#d4af37', lcol: '#d4af37', lc: 'uppercase', ll: '.28em', ob: 'rgba(0,0,0,.86)', sh: 'none', tw: 100, tabon: '#d4af37', tabtx: '#000', tsh: '0 0 30px rgba(212,175,55,.5)'}],
  ['ludique', 'Ludique', {r: 30, bw: 3, blur: 6, fnt: 'round', tf: 'round', nf: 'round', fg: '#fff', gl: 'rgba(255,255,255,.22)', ln: '#ffd23f', ac: '#ffd23f', lcol: '#ffd23f', lc: 'none', tw: 700, sh: '0 6px 0 rgba(0,0,0,.2)', tsh: '3px 3px 0 rgba(0,0,0,.25)', tabon: '#ffd23f', tabtx: '#3a2a00'}],
  ['bd', 'Bande dessinée', {r: 14, bw: 3, blur: 0, fnt: 'comic', tf: 'comic', nf: 'comic', fg: '#111', gl: 'rgba(255,255,255,.92)', ln: '#111', ac: '#e63946', lcol: '#e63946', lc: 'uppercase', sh: '5px 5px 0 #111', ob: 'rgba(255,214,10,.5)', tw: 700, tsh: '3px 3px 0 #fff', tabon: '#e63946', tabtx: '#fff'}],
  ['aurore', 'Aurore', {r: 26, bw: 1, blur: 30, sh: '0 0 24px rgba(120,255,220,.35), inset 0 1px 0 rgba(255,255,255,.4)', ln: 'rgba(150,255,230,.55)', ac: '#7dffe0'}],
  ['degrades', 'Cartes dégradées', {r: 22, blur: 20, gl: 'linear-gradient(135deg,rgba(255,255,255,.24),rgba(255,255,255,.06))', ln: 'rgba(255,255,255,.35)'}],
  ['sobre-mono', 'Sobre mono', {fnt: 'mono', tf: 'mono', nf: 'mono', lc: 'uppercase', ll: '.12em', r: 6, blur: 12, tw: 200}],
  ['condense', 'Condensé', {fnt: 'cond', tf: 'cond', nf: 'cond', tw: 300, lc: 'uppercase', ll: '.1em', r: 10}],
  ['serif-doux', 'Serif doux', {fnt: 'serif', tf: 'serif', nf: 'serif', tw: 300, r: 18}],
  ['impact', 'Impact', {fnt: 'imp', tf: 'imp', nf: 'imp', tw: 400, lc: 'uppercase', r: 8, bw: 2}]
];
const HMAP = {r: ['--r', 'px'], rt: ['--rt', 'px'], rb: ['--rb', 'px'], bw: ['--bw', 'px'], blur: ['--blur', 'px'], bs: ['--bs'], sh: ['--sh'], fnt: ['--font'], tf: ['--tf'], tw: ['--tw'], tl: ['--tl'], tsh: ['--tsh'], nf: ['--nf'], lf: ['--lf'], lc: ['--lc'], ll: ['--ll'], lcol: ['--lcol'], fg: ['--fg'], gl: ['--glass'], ln: ['--line'], ac: ['--ac'], ob: ['--bgo'], ot: ['--top'], tops: ['--tops'], tabon: ['--tabon'], tabtx: ['--tabtx']};
