# État d'avancement — memoire-algos-debat-public

Journal de session. Mis à jour à la fin de chaque session de travail. Sert de point de reprise : lis ce fichier avant de demander « où on en est ».

## Dernière session : 2026-06-20

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

### Revue d'architecture (2026-06-20, fin de session)

Relecture complète de l'arborescence à la demande de Corentin. Verdict : tout ce qui a été posé (vite.config.js, tailwind.config.js, package.json, index.css, racine du dépôt) est propre et conforme au brief. Seul reste du scaffold par défaut Vite, à nettoyer **en même temps** que l'étape 2 (pas un problème en soi, juste pas encore fait) :

- `web/src/App.jsx` : encore la démo Vite/React ("Get started", compteur, logos) — à réécrire entièrement.
- `web/src/App.css` : CSS de cette démo — à supprimer.
- `web/src/assets/react.svg`, `vite.svg`, `hero.png` : assets de démo — à supprimer.
- `web/public/icons.svg` : icônes de la démo (doc/social/GitHub/Discord/X/Bluesky) — à supprimer.
- `web/README.md` : README générique `create-vite`, jamais réécrit — à réécrire ou supprimer.

### Prochaine étape exacte (reprendre ici, prochaine session)

1. Étape 2 (CLAUDE.md §7) : construire le design system dans l'UI réelle — masthead (titre, n, badge "chiffres provisoires", lien code source), barre d'onglets en pilule, carte de base (`panel`/`line`/ombre/coins arrondis), écart-mètre réutilisable (corail = perçu, sarcelle = réel). Nettoyer le scaffold par défaut (liste ci-dessus) au passage.
2. Étape 3 : dashboard à onglets (Vue d'ensemble / H1 / H2 / H3) avec un `results.json` **provisoire** d'abord, pour voir l'UI tourner avant de brancher les vraies données.
3. Ne pas attaquer `analysis/analyse.py` (étape 4) avant validation de l'UI par Corentin.

### Repo et liens

- Dépôt (privé pour l'instant) : https://github.com/Cocolegeek/memoire-algos-debat-public
- Site en ligne : **pas encore déployé**. URL prévue une fois Pages activé : `https://cocolegeek.github.io/memoire-algos-debat-public/`

### Document du mémoire (Etat_d_avancement.md, §2.3.4) — non traité

Corentin a demandé de reporter l'URL Pages et l'URL du dépôt dans un fichier `Etat_d_avancement.md`, section 2.3.4, pour boucler le renvoi promis depuis la section 2.1.5 du mémoire. **Ce fichier n'a pas été trouvé sur cette machine** (recherché dans le dépôt et sur le Bureau) — il s'agit probablement d'un document du mémoire géré ailleurs (autre dossier, Drive, etc.), distinct de ce dépôt de code.

Action à faire au moment du déploiement (étape 6-7 du plan) : demander à Corentin l'emplacement exact de ce fichier, puis y reporter les deux URL.
