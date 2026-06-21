# État d'avancement — memoire-algos-debat-public

Journal de session. Mis à jour à la fin de chaque session de travail. Sert de point de reprise : lis ce fichier avant de demander « où on en est ».

## Dernière session : 2026-06-20

> **Clôture de session.** Étapes 1 à 4 faites et en ligne. Tout est commité et poussé sur `main` (rien en attente, sauf `.claude/settings.local.json` volontairement non versionné). Dépôt nettoyé (scaffold Vite retiré, favicon du projet, dossier assets vide supprimé). Tous les `.md` à jour.
> **À la reprise, quand Corentin dira « on continue » :** attaquer le **nuage 3D** (react-three-fiber, voir « Prochaine étape exacte » plus bas et CLAUDE.md §13). Trois points restent côté Corentin : aligner le n du mémoire (258 -> 263), figer les verdicts, interpréter le contraste politique de H2.

### Fait

- Repo créé et initialisé, identité git réglée (Cocolegeek / corentin.nicolas03@gmail.com).
- `gh` CLI installé (winget) et authentifié sur le compte `Cocolegeek`.
- Repo distant créé : `Cocolegeek/memoire-algos-debat-public`, lié en `origin`, **privé** pour l'instant.
- Premier commit poussé sur `main` : `LICENSE` (MIT), `.gitignore`, `README.md`, `data/README.md`.
- `CLAUDE.md` (brief de construction complet) déposé et poussé — commit `c8f96c4`.
- `data/reponses.csv` déposé : CSV brut de l'enquête extrait du zip fourni par Corentin. **265 réponses confirmées** par parsing CSV (pas `wc -l`, qui est faussé par des champs texte multilignes), 31 colonnes — conforme à CLAUDE.md §8. Commit `8983d3e`.
- Étape 1 du plan (CLAUDE.md §6) : scaffold `web/` avec Vite + React.
  - Tailwind installé en **v3.4.19** (et non v4, qui est arrivée par défaut via `npm install` mais utilise un format de config CSS-first incompatible avec le `tailwind.config.js` classique décrit en §7 — corrigé en désinstallant v4 et réinstallant v3).
  - Recharts et Framer Motion installés.
  - `tailwind.config.js` : tokens de couleur (ink, bg, panel, line, muted, reel/reel-soft, percu/percu-soft) et 3 familles de police (Space Grotesk, IBM Plex Sans, IBM Plex Mono) posés.
  - `vite.config.js` : `base: "/memoire-algos-debat-public/"`.
  - `src/index.css` : import Google Fonts, directives Tailwind, respect de `prefers-reduced-motion`.
  - `npm run dev` lancé et vérifié : serveur démarre, page servie avec le bon préfixe d'URL. Serveur arrêté après vérification.
  - Commit `f567716`.

### Bloqué sur / en attente de validation

Corentin doit valider l'étape 1 (scaffold + config) avant qu'on enchaîne sur l'étape 2 (poser le design system *dans l'UI*, pas seulement dans la config) puis l'étape 3 (dashboard à onglets piloté par un `results.json` provisoire).

### Décisions en attente, non tranchées par Corentin (CLAUDE.md §4)

Toujours sans réponse à ce stade. Tant que non tranchées, les défauts du brief s'appliquent et seront signalés explicitement au moment de l'analyse (étape 4) :

1. **n canonique** : 265 (CSV brut) vs 258 (mémoire rédigé) vs 253 (ancien état d'avancement). Défaut : recalculer après nettoyage et aligner le texte du mémoire dessus.
2. **Mineurs** : 2 répondants de 13-17 ans. Défaut : exclure (`EXCLURE_MINEURS`), donne n = 263.
3. **Formulation H1/H2/H3** : défaut déjà reporté tel quel depuis le PDF du mémoire dans CLAUDE.md §4.3 — pas de risque ici sauf si Corentin a une version plus récente du texte.

### Étape 2 réalisée + mise en ligne anticipée (2026-06-20)

Étape 2 du brief (design system dans l'UI) construite, puis **déploiement en ligne anticipé à la demande explicite de Corentin** (il voulait voir le rendu sans attendre les étapes 3-5).

Fait :
- `web/src/ui.jsx` : composants réutilisables (Eyebrow, Badge, Card, TabBar en pilule animée Framer Motion, EcartMetre corail/sarcelle à échelle paramétrable, gère l'unité %).
- `web/src/App.jsx` : masthead (titre, n = 265, badge "Chiffres provisoires", lien "Code source"), barre d'onglets (Vue d'ensemble / H1 / H2 / H3 / Données), écart-mètre de **démonstration** (données factices étiquetées) piloté par l'onglet actif.
- Scaffold Vite par défaut nettoyé : App.css, react.svg, vite.svg, hero.png, icons.svg supprimés ; index.html (titre, lang=fr) et web/README.md réécrits.
- `.github/workflows/deploy.yml` créé. **Étape Python rendue conditionnelle** (`if [ -f analysis/analyse.py ]`) car analyse.py n'existe pas encore : l'app se construit sur ses données de démo. À l'étape 4, écrire analyse.py suffira, le workflow l'exécutera automatiquement.
- `.claude/launch.json` ajouté (config preview locale, non versionné).

Déploiement :
- Dépôt passé **PUBLIC** (`gh repo edit --visibility public`). Décision verrouillée du brief, mais avancée plus tôt que prévu (le brief la plaçait après validation UI).
- GitHub Pages activé, source = GitHub Actions (`build_type: workflow`).
- PR #1 (claude/adoring-austin-0a6780 -> main) fusionné. Workflow "Déploiement" : **succès du premier coup**.
- **Site EN LIGNE et vérifié (HTTP 200)** : https://cocolegeek.github.io/memoire-algos-debat-public/

⚠️ Ce qui est en ligne est une **UI de démonstration avec des données factices**. Les vrais chiffres viendront de analyse.py (étape 4). Le badge "Chiffres provisoires" est affiché.

État git à la reprise : la branche `claude/adoring-austin-0a6780` a été fusionnée dans `main`. `main` porte tout (étape 2 + CI). Travailler depuis `main` à jour à la prochaine session.

### Étapes 3 et 4 faites + nouvelle direction dataviz (2026-06-20, suite)

**Étape 3 (dashboard à onglets)** : `App.jsx` branché sur `fetch(results.json)`, sections `Overview` / `Hypothesis1-3` / `Datalake` (placeholder) / `HypoHeader`, composants `ui.jsx` (BarRow, BigStat, StatTile, SegmentToggle, VerdictBadge, EcartMetre cliquable). Vérifié : navigation, écart-mètres cliquables, filtre politique H2, corrélations H1, grands chiffres H3. Déployé (PR #3).

**Étape 4 (analyse.py)** : `analysis/analyse.py` en **bibliothèque standard pure** (pas pandas, déviation assumée au §8, plus robuste/instantané en CI). Génère :
- `web/public/results.json` : vrais agrégats, `statut = "définitif"` (badge "provisoire" retiré).
- `web/public/respondents.json` : 263 lignes anonymisées (indices hostilité/exposition, recodages politique/géo/âge/DSA) pour les visualisations multivariées.
La CI exécute désormais analyse.py automatiquement. Déployé (PR #4), vérifié en ligne.

**Décisions §4 tranchées par Corentin cette session** :
- Mineurs exclus, **n = 263** (EXCLURE_MINEURS = True).
- Bibliothèque dataviz avancée : **react-three-fiber (three.js)**, pas Plotly.
- Première visualisation à construire : **nuage 3D coloré par bord politique**.

**Vrais chiffres obtenus (à valider par Corentin)** :
- H1 *Plutôt confirmée* : bulle Q9 r=0,03 (quasi nul) ; temps Q7 r=0,21 ; exposition Q11 r=0,18. Note : c'est le **temps** le plus corrélé, pas l'exposition comme le supposait le brief.
- H2 *Confirmée* : individus 4,42 > structures 3,80. Hiérarchie : producteurs 4,53 > partageurs 4,31 > plateformes 4,01 > médias 3,98 > État 3,41. Contrastes (point d'attention, possiblement contre-intuitif) : la **gauche** blâme PLUS les médias (4,18 vs 3,67) et l'État (3,59 vs 3,16) que la droite.
- H3 *Nuancée* : transparence 82 %, connaissance précise DSA 15 %. Demande selon DSA : connaît précisément 4,08 vs connaît mal/pas 4,21 (effet faible, 0,13, dans le sens attendu).

**Points d'attention pour le mémoire** :
- n = 263 ≠ 258 du mémoire rédigé : aligner le texte du mémoire sur 263 (ou expliquer un autre nettoyage prévu).
- Verdicts = interprétation automatique marquée "à valider", à trancher par Corentin.
- Contraste politique H2 à interpréter (gauche plus critique des médias/État).

### Nuage 3D fait (2026-06-21)

Premier palier dataviz avancée livré et déployé. `three` + `@react-three/fiber` + `@react-three/drei` installés. Composant `web/src/sections/Nuage3D.jsx`, nouvel onglet "Nuage 3D" (entre H3 et Données), **chargé en lazy** (chunk three.js séparé, ~282 ko gzip, hors bundle initial qui reste à ~104 ko gzip).

Fonctionnel et vérifié : 263 points (un par répondant) depuis `respondents.json`, couleur par bord politique (dégradé rouge vif → rouge → blanc → bleu → bleu vif, gris pour "ne se positionne pas"), **sélecteurs X/Y/Z** parmi 5 variables (hostilité, exposition, temps, perception de bulle, demande), jitter déterministe sur les axes discrets, cadre + graduations + labels d'axes, OrbitControls (rotation/zoom), survol avec infobulle, **légende cliquable** qui filtre (testé : masquer "Très à gauche" → 263 passe à 231, soit les 32 concernés). Build OK, aucune erreur console.

### Prochaine étape exacte (reprendre ici)

1. Selon priorités Corentin : croisements multivariés 2D (âge × variables, politique × blâme, urbain↔rural × demande), analyse de mots-clés des verbatims (fréquences à générer dans analyse.py), gradient géographique urbain↔rural. Tout peut réutiliser `respondents.json` et le même onglet d'exploration ou des onglets dédiés.
2. Onglet **Mémoire** (HTML façon wiki) : coquille à préparer quand Corentin fournira le contenu converti de son PDF.
3. Étape 5 : module Datalake (§9). Penser à reporter les deux URL dans le `Etat_d_avancement.md` du mémoire (§2.3.4, voir note en bas).

### Revue d'architecture (2026-06-20)

Relecture complète de l'arborescence à la demande de Corentin. Verdict : tout ce qui a été posé (vite.config.js, tailwind.config.js, package.json, index.css, racine du dépôt) est propre et conforme au brief. Seul reste du scaffold par défaut Vite, à nettoyer **en même temps** que l'étape 2 (pas un problème en soi, juste pas encore fait) :

- `web/src/App.jsx` : encore la démo Vite/React ("Get started", compteur, logos) — à réécrire entièrement.
- `web/src/App.css` : CSS de cette démo — à supprimer.
- `web/src/assets/react.svg`, `vite.svg`, `hero.png` : assets de démo — à supprimer.
- `web/public/icons.svg` : icônes de la démo (doc/social/GitHub/Discord/X/Bluesky) — à supprimer.
- `web/README.md` : README générique `create-vite`, jamais réécrit — à réécrire ou supprimer.

(Ce nettoyage a été réalisé pendant l'étape 2, voir plus haut.)

### Repo et liens

- Dépôt (désormais **PUBLIC**) : https://github.com/Cocolegeek/memoire-algos-debat-public
- Site **EN LIGNE** : https://cocolegeek.github.io/memoire-algos-debat-public/

### Document du mémoire (Etat_d_avancement.md, §2.3.4) — non traité

Corentin a demandé de reporter l'URL Pages et l'URL du dépôt dans un fichier `Etat_d_avancement.md`, section 2.3.4, pour boucler le renvoi promis depuis la section 2.1.5 du mémoire. **Ce fichier n'a pas été trouvé sur cette machine** (recherché dans le dépôt et sur le Bureau) — il s'agit probablement d'un document du mémoire géré ailleurs (autre dossier, Drive, etc.), distinct de ce dépôt de code.

Action à faire au moment du déploiement (étape 6-7 du plan) : demander à Corentin l'emplacement exact de ce fichier, puis y reporter les deux URL.
