# Guide d'utilisation

Ce guide explique comment installer l'écran, se connecter à l'admin et se servir de chaque onglet. Il ne dévoile pas les styles secrets.

- Écran : https://haze15.github.io/meteo/
- Réglages : https://haze15.github.io/meteo/admin.html

## 1. Installer l'écran

L'écran est une simple page web prévue pour un affichage de 800 × 480 px (elle s'adapte aux autres tailles).

1. Sur l'ordinateur ou le Raspberry Pi relié à l'écran, ouvre https://haze15.github.io/meteo/ dans Chrome ou Chromium.
2. Passe en plein écran avec **F11**. Pour un affichage permanent, lance le navigateur en mode kiosque :
   ```sh
   chromium --kiosk https://haze15.github.io/meteo/
   ```
3. Désactive la mise en veille de l'ordinateur pour que l'écran reste allumé.
4. Les sons ne démarrent qu'après un premier toucher ou clic sur la page : c'est une règle des navigateurs.

Sur un Raspberry Pi, active le **Mode léger** (Affichage › Affichage) : moins d'effets, et l'écran reste fluide.

L'écran se recharge tout seul quand une nouvelle version est publiée, et il récupère les réglages toutes les 20 secondes.

## 2. Se connecter à l'admin

Ouvre https://haze15.github.io/meteo/admin.html et tape le mot de passe. Coche « Rester connecté sur cet appareil » pour ne pas le retaper à chaque fois. Le bouton **Se déconnecter** (onglet Écran) efface la connexion.

### Sur téléphone

Ouvre le même lien, puis :
- **iPhone** : bouton Partager › « Sur l'écran d'accueil ».
- **Android** : menu ⋮ › « Ajouter à l'écran d'accueil ».

Une icône « Admin Météo » apparaît et ouvre l'admin en plein écran, comme une appli.

### Première connexion (ou nouveau jeton)

L'admin écrit les réglages dans le dépôt GitHub du site. Pour ça, il a besoin d'un **jeton GitHub**, qui est ensuite chiffré avec le mot de passe :

1. Sur GitHub : photo de profil › **Settings › Developer settings › Personal access tokens › Fine-grained tokens › Generate new token**.
2. Nom : `meteo admin`. Expiration : la plus longue proposée.
3. **Repository access** : *Only select repositories* › `meteo`.
4. **Permissions** › *Repositories* › **Contents : Read and write**.
5. **Generate token**, puis copie le jeton (il commence par `github_pat_`).
6. Dans l'admin, colle le jeton et choisis le mot de passe (6 caractères minimum).

Le fichier qui contient le jeton chiffré est public : choisis un vrai mot de passe.

## 3. Les onglets de l'admin

Chaque modification est **enregistrée toute seule** sur le serveur environ 2 secondes après. Le bouton **Enregistrer** force l'envoi tout de suite. La ligne d'état sous le titre dit si c'est bon.

| Onglet | À quoi il sert |
|---|---|
| **Écran** | État du serveur, dernier enregistrement, recharger les réglages, changer le mot de passe ou le jeton, se déconnecter. **Envoyer une info maintenant** affiche un message en haut de l'écran pendant quelques secondes. |
| **Aperçu** | La page de l'écran en direct, avec tes réglages, avant même qu'ils soient envoyés. |
| **Affichage** | Ville (automatique ou à la main), nom affiché, fréquence de mise à jour, unité, radar, onglets, bandeau défilant, disposition, ce qui est affiché (5 jours, heures, qualité de l'air, pollens…), **Mode léger**, écran de démarrage, **mode veille la nuit** (horloge ou écran assombri), météos spéciales (canicule, vent fort, arc-en-ciel…). |
| **Style** | Le style de l'interface (cyberpunk, médiéval, Game Boy, Windows 95, néon, estampe japonaise…), le **roll des styles** et les options du style. |
| **Météos** | Pour chaque météo (soleil, nuages, pluie, neige…) : couleurs, effets, nuages, soleil, lune, intensité, vent, texte ou image de fond. Le bouton 👁 la montre dans l'aperçu sans l'enregistrer. |
| **Fêtes** | Les dates spéciales (Noël, Halloween, Nouvel An…) avec leurs couleurs, effets et messages. Les dates s'écrivent `MM-JJ` (ex. `12-25`), ou `easter` pour Pâques, ou `fri13` pour chaque vendredi 13. |
| **Surprises** | Les animations cachées des fêtes. Les boutons ▶ les lancent sur l'aperçu ou sur l'écran, pour tester. |
| **Sons & mascotte** | Sons d'ambiance qui suivent la vraie météo (pluie, vent, orage, nature…), volume, heures calmes, et la petite mascotte animée. |
| **Widgets** | Les cases de la page Infos : texte, horloge, compte à rebours, image, valeur lue sur une URL, lien. |
| **Sauvegarde** | Télécharger ou restaurer toute la configuration (fichier JSON), l'importer, ou tout réinitialiser. |

### Le roll des styles

Le roll tire un style au hasard, comme une caisse de jeu vidéo, avec des raretés. Il peut se lancer **à chaque démarrage**, **une fois par jour**, **toutes les N heures**, ou seulement à la demande (triple tape sur le nom de la ville). Certains styles sont secrets et extrêmement rares… Quand le roll automatique est actif, il remplace le style choisi à la main au prochain tirage.

## 4. En cas de souci

| Problème | Solution |
|---|---|
| « Serveur injoignable » | Vérifie la connexion Internet, puis recharge la page. Si GitHub a un problème, réessaie plus tard. |
| « Ce jeton peut lire mais pas écrire » | Sur GitHub, modifie le jeton (Edit) : accès au dépôt `meteo` et **Contents : Read and write**. Puis réessaie avec le même jeton. |
| « Jeton refusé » | Le jeton a expiré ou a été supprimé. Crée-en un nouveau, puis Écran › **Changer le jeton**. |
| Mot de passe oublié | Le jeton chiffré ne peut plus être lu. Sur GitHub, dans le dépôt `meteo`, branche **config**, supprime le fichier `admin.json`. L'admin redemandera un jeton et un nouveau mot de passe ; les réglages sont gardés. |
| L'écran ne change pas | Attends une minute, puis recharge l'écran. Si un **roll automatique** est actif, il peut remplacer le style choisi. |
| Pas de son | Touche ou clique une fois sur l'écran, et vérifie que les sons sont activés dans l'admin et que l'heure n'est pas dans les heures calmes. |
| Écran saccadé | Active le **Mode léger** (Affichage), surtout sur Raspberry Pi. |

## 5. Mettre à jour le site

Le site se met à jour avec `git push` (voir le [README](../README.md)). Sans git : sur github.com/Haze15/meteo, **Add file › Upload files**, glisse les nouveaux `index.html` et `admin.html`, puis **Commit changes**. GitHub Pages publie en 1 à 2 minutes.
