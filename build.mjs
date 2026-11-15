#!/usr/bin/env node
/* Assemble l'écran (index.html) et l'admin (admin.html) à partir des morceaux de src/.
 *
 *   node build.mjs          → fichiers minifiés (ce qui est publié)
 *   node build.mjs --dev    → fichiers lisibles, pour déboguer
 *
 * La minification utilise esbuild (npm install). S'il n'est pas installé,
 * le build marche quand même et produit des fichiers non minifiés.
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const src = f => readFileSync(join(ROOT, 'src', f), 'utf8');
const DEV = process.argv.includes('--dev');

/* L'ordre compte : tout finit dans un seul <style> et un seul <script>, et chaque
   morceau utilise ce qui a été déclaré avant lui. */
const SCREEN = [
  'page/head.html',                 // <head>, polices, début du <style>
  'css/themes-a.css', 'css/themes-b.css', 'css/themes-c.css', 'css/special.css',
  'page/body.html',                 // fin du <style>, HTML de l'écran, début du <script>
  'screen/core.js',                 // réglages, météo, rendu (reçoit shared/config.js)
  'screen/engine.js',               // styles (HUD), cinématiques, priorités (reçoit screen/huds.js)
  'screen/fx.js', 'screen/surprises.js', 'shared/sound.js', 'screen/ambiance.js',
  'screen/boot.js', 'screen/roll.js',
  'secrets/x0-lock.js', 'screen/geo.js', 'secrets/xr.js', 'secrets/cinefx.js',
  'secrets/inf.js', 'secrets/nova.js', 'secrets/void.js', 'secrets/x0.js', 'secrets/tes.js',
  'secrets/gen.js', 'secrets/crea.js', 'secrets/train.js', 'secrets/pres-images.js',
  'secrets/pres.js', 'secrets/x0s.js', 'secrets/aby.js',
  'screen/widgets.js', 'screen/radar-sync.js',
  'screen/start.js',                // démarrage, fin du <script>
];

function screen() {
  return SCREEN.map(f => {
    let s = src(f);
    if (f === 'screen/core.js') s = s.replace('/*__SHARED_CONFIG__*/', src('shared/config.js'));
    if (f === 'screen/engine.js') s = s.replace('/*__ORIG_HUDS__*/', src('screen/huds.js'));
    return s;
  }).join('\n');
}
function admin() {
  return src('admin/admin.html').replace('/*__SHARED_CONFIG__*/', src('shared/config.js') + '\n' + src('shared/sound.js'))
    + src('admin/ui.js') + '\n' + src('admin/server.js') + '</script>\n</body>\n</html>\n';
}

/* Minifie chaque <style> et chaque <script> en ligne. Les noms globaux sont gardés
   (les morceaux s'appellent entre eux), seules les variables locales sont raccourcies. */
async function minify(html, name) {
  let esb; try { esb = await import('esbuild'); } catch (e) { console.warn(`  ${name} : esbuild absent, pas de minification (npm install)`); return html; }
  const parts = []; let last = 0;
  for (const m of html.matchAll(/<(style|script)>([\s\S]*?)<\/\1>/g)) {
    parts.push(html.slice(last, m.index));
    const {code} = await esb.transform(m[2], m[1] === 'style' ? {loader: 'css', minify: true} : {loader: 'js', minify: true, charset: 'utf8', legalComments: 'none'});
    parts.push(`<${m[1]}>${code.trim()}</${m[1]}>`); last = m.index + m[0].length;
  }
  parts.push(html.slice(last));
  return parts.join('').replace(/>\s*\n\s*</g, '>\n<');
}

for (const [file, make] of [['index.html', screen], ['admin.html', admin]]) {
  const raw = make(), out = DEV ? raw : await minify(raw, file);
  writeFileSync(join(ROOT, file), out);
  console.log(`${file} : ${(raw.length / 1024).toFixed(0)} Ko → ${(Buffer.byteLength(out) / 1024).toFixed(0)} Ko${DEV ? ' (dev)' : ''}`);
}
