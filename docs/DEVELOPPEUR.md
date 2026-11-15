# Documentation technique

> ⚠ **Spoilers** : cette page cite les styles secrets, leurs fichiers et leurs probabilités.

## Vue d'ensemble

Le projet produit **deux pages HTML autonomes**, sans framework ni serveur à nous :

| Fichier publié | Rôle |
|---|---|
| `index.html` | L'écran (800 × 480). Lit la météo et sa configuration, dessine tout. |
| `admin.html` | La page de réglages. Écrit la configuration sur le serveur. |
| `admin.webmanifest`, `icon-*.png` | Rendent l'admin installable sur l'écran d'accueil d'un téléphone. |
| `assets/` | Images chargées seulement quand elles servent (cinématique 👁). |

Les deux pages sont **générées** à partir de `src/` par `build.mjs`. Ne modifie jamais `index.html` ou `admin.html` à la main : ils sont écrasés à chaque build.

Services externes utilisés (tous sans clé) : Open-Meteo (prévisions, qualité de l'air, pollens), RainViewer (radar), OpenStreetMap + Leaflet (cartes), géolocalisation par IP (ipwho.is, GeoJS, BigDataCloud), Google Fonts, et l'API GitHub (configuration).

## Construire

```sh
npm install      # installe esbuild (une fois)
npm run build    # index.html + admin.html minifiés
npm run dev      # mêmes fichiers, lisibles (pour déboguer dans le navigateur)
```

`build.mjs` **concatène** les morceaux de `src/` dans un ordre fixe (liste `SCREEN`), puis minifie chaque `<style>` et `<script>` avec esbuild. Les noms globaux ne sont pas renommés, car les morceaux s'appellent entre eux ; seules les variables locales sont raccourcies. Sans esbuild, le build marche quand même, sans minification.

Deux remplacements ont lieu pendant l'assemblage :
- `/*__SHARED_CONFIG__*/` dans `screen/core.js` et `admin/admin.html` ← `shared/config.js` (et `shared/sound.js` pour l'admin) ;
- `/*__ORIG_HUDS__*/` dans `screen/engine.js` ← `screen/huds.js`.

## Organisation de `src/`

```
src/
├─ page/        head.html (début du <style>, polices) · body.html (HTML de l'écran, début du <script>)
├─ css/         themes-a.css, themes-b.css, themes-c.css (styles publics) · special.css (secrets, roll, cinématiques, impact frames)
├─ shared/      config.js (valeurs par défaut, liste des styles, accès au serveur) · sound.js (moteur audio WebAudio)
├─ screen/      le code de l'écran
│   core.js        réglages, normalisation, rendu de base, registre des styles (SIG)
│   huds.js        les styles publics (textes, icônes, décors)
│   engine.js      météo, rendu, application d'un style (applyHud), porte des cinématiques, priorités
│   fx.js          le canevas d'effets (pluie, neige, étoiles…) et les couches par style
│   surprises.js   fêtes animées et easter eggs (EGGS, runEgg, toast)
│   ambiance.js    qualité de l'air, pollens, sons d'ambiance selon la météo
│   boot.js        écran de démarrage (façon Linux)
│   roll.js        le roll des styles (raretés, tirage, animation de caisse)
│   geo.js         détection de la ville
│   widgets.js     page Infos
│   radar-sync.js  radar, synchronisation avec le serveur, rechargement auto à chaque nouvelle version
│   start.js       démarrage
├─ secrets/     un fichier par style secret (voir plus bas) + cinefx.js (outils de cinématique)
└─ admin/       admin.html (structure + CSS) · ui.js (formulaires, aperçu) · server.js (mot de passe, serveur, sauvegarde)
```

## Le serveur : la configuration

Il n'y a pas de serveur à nous : **le dépôt GitHub sert de serveur**.

- La configuration est le fichier `config.json` sur la branche **`config`** du dépôt (et pas `main`, pour ne pas relancer GitHub Pages à chaque réglage).
- **L'écran** lit `config.json` toutes les 20 s via l'API GitHub (`ghGet` dans `shared/config.js`), sans authentification. Les requêtes utilisent `cache: 'no-cache'` : le navigateur renvoie l'ETag et GitHub répond `304` quand rien n'a changé, ce qui ne compte pas dans la limite de 60 requêtes par heure. En cas de limite atteinte (403/429), l'écran patiente 5 min.
- Une config n'est appliquée que si son champ `v` (horodatage) est plus récent que celui déjà appliqué.
- **L'admin** écrit `config.json` avec un jeton GitHub (`ghPut` dans `admin/server.js`). Les enregistrements sont regroupés (1,8 s après la dernière modification) et jamais envoyés en parallèle.

### Le mot de passe

Le jeton GitHub est stocké **chiffré** dans `admin.json` (branche `config`) :
- clé dérivée du mot de passe avec PBKDF2-SHA256, 250 000 itérations, sel aléatoire de 16 octets ;
- chiffrement AES-256-GCM (IV aléatoire de 12 octets), via WebCrypto ;
- un mauvais mot de passe fait échouer le déchiffrement : c'est la vérification.

`admin.json` est public. La sécurité repose donc sur la solidité du mot de passe. Le jeton déchiffré reste en `sessionStorage` (ou `localStorage` si « Rester connecté »).

## L'écran

### Les styles (`SIG`)

Chaque style est une entrée du registre `SIG` (dans `screen/core.js`, complété par `huds.js` et les fichiers de `secrets/`) :

```js
SIG.id = {
  name: 'Nom affiché', icons: 'line', temp: 'text',   // jeu d'icônes, rendu de la température
  amb: 'id',             // couche d'effets dessinée par fx.js (voir BACK / BASEN / drawLayer)
  deco, deco2,           // HTML ajouté derrière / devant l'interface (badge, vignette…)
  cin: done => …,        // cinématique d'activation (facultatif), appelle done() pour appliquer le style
  descHTML: d => …,      // mise en forme de la phrase météo
  v: {d: {clear: […], rain: […], …}, kick, hl, mt, day, hr},   // textes et formats
  secret: true           // n'apparaît pas dans la liste publique
};
```

La liste des styles publics affichée dans l'admin est `SIGLIST` (`shared/config.js`).

### Appliquer un style

`applyCfg()` → `effHud()` choisit le style effectif → `applyHud(id)`.

`effHud` suit un ordre de priorité : paramètre d'URL `?hud=`, puis les styles secrets (choisis dans l'admin ou obtenus au roll), puis le style festif, puis le roll, puis le style choisi.

**Porte des cinématiques** : quand un style avec `cin` devient actif, `applyHud` ne l'applique pas tout de suite. Il lance la cinématique **par-dessus l'ancien style**, et le nouveau style n'est appliqué qu'à la fin (`done()`), pour une transition sans coupure. Une seule cinématique à la fois (`cinGate`), avec un délai de secours de 100 s si une cinématique n'appelle jamais `done()`.

### Les effets (`fx.js`)

Un seul canevas d'effets, une boucle `requestAnimationFrame`. Elle **ne dessine rien** quand la page est cachée, quand l'onglet Radar est ouvert, ou en veille de nuit. En **Mode léger**, elle dessine une image sur deux. Chaque style peut avoir sa couche (`drawLayer`) : `BASEN` donne le nombre de particules, `BACK` dit si elle passe derrière l'interface.

### Les cinématiques

Toutes suivent le même modèle :
- une `div` plein écran ajoutée au `#stage`, avec un canevas et une boucle `requestAnimationFrame` qui s'arrête d'elle-même quand la `div` est retirée ;
- une ligne de temps `at(secondes, fonction)` à base de `setTimeout` ;
- la classe `X-hide` sur le `#stage` cache l'interface pendant la scène ;
- un double tap passe la cinématique ;
- `cinefx.js` fournit `cinFX()` (grain, vignette, bandes) et `impactFrames()` (images d'impact, une palette par style, table `IMPT`).

La musique de chaque cinématique est **synthétisée** dans `shared/sound.js` (fonctions `xxxScore`, exposées par `AMB.xxx()`), sans aucun fichier audio.

### Les styles secrets

| Fichier | Style | Obtention |
|---|---|---|
| `x0.js` (+ `x0-lock.js`) | ✦ Singularité | roll, 1 sur 500 |
| `x0s.js` | ✨ Singularité *shiny* | 1 sur 4 096 quand la Singularité tombe |
| `inf.js` | ∞ Infini | roll, 1 sur 1 000 |
| `void.js` | ∅ Néant | roll, 1 sur 10 000 |
| `tes.js` | ◈ Tesseract | roll, 1 sur 100 000 |
| `gen.js` | ✺ Genèse | roll, 1 sur 1 000 000 |
| `aby.js` | 🌊 Abysse | roll, 1 sur 2 000 000 |
| `train.js` | 🚂 Le Dernier Train | roll, 1 sur 10 000 000 |
| `crea.js` | ♛ Créateur | admin seulement (jamais au roll) |
| `pres.js` (+ `pres-images.js`) | 👁 La Présence | admin seulement, jumpscare uniquement dans la cinématique |
| `xr.js` | 🔒 Accès restreint | admin seulement, protégé par un code personnel ; s'ouvre comme un coffre-fort |

`nova.js` contient Supernova, un style **public** mais avec sa propre cinématique.

Les probabilités sont dans `screen/roll.js` (constantes `XP`, `IP`, `VP`, `TP`, `GP`, `ABP`, `TRP`).

## L'appli iOS (`ios/`)

Une petite appli SwiftUI qui affiche le site dans une WebView : l'écran en plein écran, et un bouton ⚙ qui bascule sur l'admin. Elle charge toujours la version en ligne, donc elle n'a pas besoin d'être recompilée quand le site change.

- `ios/project.yml` décrit le projet pour XcodeGen ; `ios/Meteo/` contient le code et l'icône.
- Le workflow `.github/workflows/ios.yml` compile un `.ipa` **non signé** sur un Mac de GitHub Actions à chaque modification de `ios/` (ou à la demande), et le publie en artefact et en Release. Pour l'installer sur un iPhone, il faut le signer soi-même (par exemple avec un outil de sideload).

## Paramètres d'URL utiles pour tester

| Paramètre | Effet |
|---|---|
| `?hud=tes` | Force un style (sans cinématique) |
| `?nocin=1` | Désactive les cinématiques |
| `?noboot=1` | Saute l'écran de démarrage |
| `?w=rain` | Force une météo (`clear`, `rain`, `snow`, `storm`…) |
| `?date=2026-12-24` | Simule une date (fêtes) |
| `?egg=ghost` | Lance une surprise au démarrage |
| `?rollx=1` … `?rollx=8` | Force un secret au prochain roll (tests) |
| `?mobile=1` / `?mobile=0` | Force ou désactive la mise en page portrait |

## Ajouter un style

1. **Public** : ajoute une entrée dans `SIGLIST` (`shared/config.js`) et sa définition `SIG.id` dans `screen/huds.js`, puis son CSS (`#stage[data-hud=id] …`) dans un fichier de `css/`.
2. **Secret** : crée `src/secrets/id.js` (définition `SIG`, couche d'effets, cinématique), ajoute-le à la liste `SCREEN` de `build.mjs`, puis :
   - `screen/fx.js` : `BASEN`, `BACK` et une branche dans `drawLayer` ;
   - `screen/engine.js` : sa place dans `effHud` ;
   - `screen/roll.js` : constantes, `pickRoll`, `rarOf`, `rollCard`, et ce qui se passe quand il tombe ;
   - `shared/sound.js` : sa musique (`AMB.id`) et son ambiance (scène dans `sndScene`) ;
   - `secrets/cinefx.js` : sa palette d'impact frames (`IMPT`) ;
   - `admin/ui.js` : sa carte dans Style et son bouton dans Surprises.
3. Lance `npm run dev`, teste avec `?hud=id` puis avec la cinématique, puis `npm run build` et publie.

## Publier

```sh
npm run build
git add -A && git commit -m "…" && git push
```

GitHub Pages publie la branche `main` en 1 à 2 minutes. Les écrans ouverts vérifient toutes les 10 minutes si `index.html` a changé (ETag) et se rechargent d'eux-mêmes, en attendant la fin d'une éventuelle cinématique ou d'un roll.
