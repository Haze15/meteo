# Météo du lycée

Un écran météo pour le hall du lycée (800 × 480 px), avec plus de 30 styles visuels, des fêtes animées, des sons d'ambiance, et une page de réglages protégée par mot de passe qu'on peut utiliser depuis un ordinateur ou un téléphone.

| | Lien |
|---|---|
| **Écran** | https://haze15.github.io/meteo/ |
| **Réglages (admin)** | https://haze15.github.io/meteo/admin.html |

## En bref

- **L'écran** affiche la météo du jour, les prévisions sur 5 jours, l'heure par heure, la qualité de l'air, un radar de pluie et des infos (widgets). Il se met à jour tout seul.
- **L'admin** règle tout : lieu, style, couleurs par météo, fêtes, sons, mascotte, widgets, messages à afficher tout de suite.
- **Tout passe par le serveur** : chaque réglage est enregistré en ligne, et tous les écrans ouverts sur le site l'appliquent en moins d'une minute. Il n'y a rien à appairer.
- **Sur téléphone** : ouvre le lien des réglages puis « Ajouter à l'écran d'accueil ». L'admin s'ouvre alors comme une appli.

## Documentation

- [Guide d'utilisation](docs/GUIDE.md) : installer l'écran, se connecter à l'admin, à quoi sert chaque onglet, que faire en cas de souci.
- [Documentation technique](docs/DEVELOPPEUR.md) : comment le code est organisé, comment il se construit, comment ajouter un style. ⚠ Elle parle des styles secrets.

## Construire le site

Le code lisible est dans `src/`. Les fichiers publiés (`index.html` et `admin.html`, à la racine) sont générés à partir de lui :

```sh
npm install        # une seule fois (installe esbuild, pour la minification)
npm run build      # fichiers minifiés, ceux qu'on publie
npm run dev        # fichiers lisibles, pour déboguer
```

Ensuite, on publie avec `git push` : GitHub Pages met le site à jour en 1 à 2 minutes.

## Crédits

Météo et qualité de l'air : [Open-Meteo](https://open-meteo.com) · Radar : [RainViewer](https://www.rainviewer.com) · Cartes : OpenStreetMap, Leaflet · Polices : Google Fonts.
