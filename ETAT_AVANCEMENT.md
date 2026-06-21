# État d'avancement — memoire-algos-debat-public

Journal de session. Mis à jour à la fin de chaque session de travail. Sert de point de reprise : lis ce fichier avant de demander « où on en est ».

## Dernière session : 2026-06-21

> **Clôture de session.** Nuage 3D construit puis retiré (hors cadre académique). Recadrage complet : `analyse.py` refondu avec tests statistiques (régression H1, H2.b ajoutée, H2.a corrigé), front refait pour afficher l'appareil statistique, icônes méthodologie cliquables sur chaque graphe, paragraphes explicatifs par graphe, contrôle de robustesse de H1 par sous-groupe. Puis passe de finition : vocabulaire aligné sur les énoncés exacts des hypothèses, palette politique cohérente partout, titres de graphiques moins techniques, légendes d'axe Y, aération. Tout est commité, poussé et déployé sur `main` (PR #8 à #12 fusionnés). Site en ligne à jour : https://cocolegeek.github.io/memoire-algos-debat-public/
> **Décisions de Corentin actées cette session :** n = 263 confirmé ; verdicts conservés tels que testés (pas de validation à 100 %, c'est le principe même d'une hypothèse testée) ; H3 reste « partiellement confirmée », assumé tel quel dans le texte.
> **À la reprise :** rien de bloquant côté code. Voir « Prochaine étape exacte » plus bas pour les pistes dataviz restantes (toujours filtrées par la règle « éprouve une hypothèse, ne décore pas »).

### Session du 2026-06-21 : recadrage académique complet

Le nuage 3D livré en fin de session précédente a été jugé non pertinent par Corentin : joli mais n'éprouvant aucune hypothèse précise. Toute la suite de la session a porté sur le recentrage strict autour de H1, H2.a, H2.b, H3, avec les énoncés exacts du mémoire.

**1. Retrait du 3D** : `three`/`@react-three/fiber`/`@react-three/drei` désinstallés, `Nuage3D.jsx` et son onglet supprimés.

**2. `analyse.py` refondu** (voir détail dans la section précédente du journal, plus bas) : H2.a corrigé (structurel = plateformes + État, sans les médias) ; H1 passé en régression multiple standardisée (β) ; H2.b ajoutée (corrélation décalage individus/structures × demande Q18) ; H3 enrichie (demande par bord politique, test de différence selon connaissance DSA). Toutes les p-values calculées via `math.erf` (stdlib).

**3. Front refait** pour H1/H2/H3, avec l'appareil statistique visible (β, r, p, n) : composants `Nuage` (scatter Recharts + droite de régression) et `Signif`/`fmtP` ajoutés à `ui.jsx`.

**4. Icônes méthodologie + paragraphes explicatifs** (demande explicite de Corentin) : `InfoButton` dans `ui.jsx`, icône "i" cliquable à côté de chaque titre de graphe (13 au total : 6 sur H1, 4 sur H2, 3 sur H3), ouvre une fenêtre flottante (fond flouté, fermeture Échap/clic extérieur, animée Framer Motion) avec deux blocs : Méthodologie (test exact utilisé) et Données en entrée (colonnes Q*, recodages, n). Chaque graphe reçoit aussi un `Caption`, paragraphe explicatif court sous le graphe, écrit pour rester clair en relecture future, distinct du paragraphe de synthèse global "Lecture" en fin de section. Vérifié à la main (ouverture, contenu, fermeture, aucune erreur console).

**5. Contrôle de robustesse de H1** (piste choisie par Corentin pour explorer les données restantes, plutôt que mots-clés ou rien) : les corrélations bivariées de H1 (temps, exposition, bulle vs hostilité) recalculées sur 4 sous-échantillons (18-34 ans, 35 ans et plus, gauche, droite). Nouveau composant `TableRobustesse` (tableau prédicteur × sous-groupe, astérisque de significativité). Résultat intéressant : **la bulle ne devient significative dans aucun sous-groupe** (renforce la conclusion principale), alors que temps/exposition ne sont significatifs que dans certains sous-groupes (effectifs réduits, donc prudence plutôt qu'infirmation).

**Verdicts finaux (n=263, testés)** : H1 Confirmée · H2.a Confirmée · H2.b Confirmée · H3 Partiellement confirmée (déconnexion confirmée, mais l'effet « connaissance DSA → moins de demande » n'est pas significatif, p=0,50).

Décision explicite de Corentin à respecter pour la suite : **ne pas multiplier les visualisations**. Chaque ajout doit éprouver une hypothèse, pas décorer. Pistes écartées pour l'instant car jugées moins prioritaires : mots-clés des verbatims, lecture urbain/rural.

### Passe de finition (même session, 2026-06-21)

Décisions de Corentin : n = 263 confirmé ; verdicts conservés tels que testés ; H3 reste « partiellement confirmée » (assumé, conforme au principe qu'une hypothèse se teste, ne se valide pas à 100 %). Puis trois demandes concrètes traitées :

1. **Vocabulaire** : tous les textes visibles (labels, sous-titres, paragraphes de lecture) reprennent désormais les mots exacts des énoncés d'hypothèses : « intensité d'usage », « responsabilité individuelle / structurelle », « légitimité perçue de la régulation systémique », « demande de régulation des algorithmes », « consensuelle », « connaissance des dispositifs existants », « volonté de régulation ». H3 cite la phrase exacte de l'hypothèse pour annoncer que le test DSA n'est pas significatif. Au passage, des chiffres qui étaient écrits en dur dans le texte de lecture H3 (82 %, 15 %, p=0,50) ont été corrigés pour être interpolés depuis les valeurs calculées (l'ancien texte violait CLAUDE.md §3 sans qu'on s'en rende compte).
2. **Noms de graphiques moins techniques** : les titres visibles ne disent plus « Nuage de points : X » ni « Régression multiple », remplacés par des titres en langage clair (« X et l'hostilité », « Ce qui pèse vraiment »). Le détail méthodologique technique reste accessible via l'icône info, c'est sa place.
3. **Couleurs et légendes cohérentes** : nouvelle palette politique exportée (`BORD_COULEURS` dans `ui.jsx`, rouge vif à gauche → bleu vif à droite, gris neutre), appliquée partout où un graphe distingue les bords politiques : répartition politique de Vue d'ensemble, colonnes gauche/droite du tableau de robustesse H1, barres et sous-texte des contrastes H2.a (colorées selon le filtre actif), demande par bord politique de H3 (6 catégories). `BarRow`/`Track` acceptent une couleur explicite en plus du système percu/reel existant (qui reste la palette corail/sarcelle, sémantique différente : perception vs réalité, non remplacée). Légende d'axe Y ajoutée sur tous les nuages de points (l'axe X l'avait déjà). Badge « Verdict provisoire » devenu « Verdict » (les chiffres sont définitifs). Aération générale (espacements augmentés sur les conteneurs de section et les listes de barres).

Déployé et vérifié à la main (build, couleurs par onglet, icônes, axes, aucune erreur console). PR #12 fusionné.

## Session du 2026-06-20

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

### Nuage 3D : fait puis RETIRÉ (2026-06-21)

Le nuage 3D (three.js) a été construit, déployé, puis **retiré à la demande de Corentin** : exploration libre séduisante mais qui n'éprouvait aucune hypothèse précise, donc hors cadre académique. `three` / `@react-three/fiber` / `@react-three/drei` désinstallés, `Nuage3D.jsx` supprimé, onglet retiré. (Le code reste dans l'historique git si besoin.)

### Recadrage académique : tout au service des hypothèses (2026-06-21)

Refonte pour que chaque écran serve une démonstration testée. Énoncés exacts du mémoire reportés mot pour mot. Décisions de Corentin : retirer le 3D ; mesurer H2.b via Q18 ; afficher l'appareil statistique complet.

**analyse.py refondu (tests + p-values via `math.erf`, stdlib)** :
- Correction H2.a : structurel = plateformes + État seulement (les médias étaient à tort inclus). Médias traités comme acteur à part.
- H1 : régression multiple standardisée (β comparables) + corrélations bivariées, toutes avec p.
- H2.b ajoutée : corrélation entre décalage (individus − structures) et demande de régulation (Q18).
- H3 : demande par bord politique (consensus gradué) + test de différence selon connaissance DSA.
- `results.json` : clés `h1`, `h2a`, `h2b`, `h3`. `respondents.json` enrichi (individus, structures, décalage).

**Vrais résultats testés (n = 263)** :
- H1 **Confirmée** : β temps 0,18 (p=0,004), β exposition 0,14 (p=0,021), β bulle 0,05 (p=0,38, NS). R² = 0,067.
- H2.a **Confirmée** : individus 4,42 vs structures 3,71 ; écart +0,71 (p<0,001) ; 67 % blâment plus les individus. Hiérarchie : producteurs 4,53 > partageurs 4,31 > plateformes 4,01 > médias 3,98 > État 3,41.
- H2.b **Confirmée** : r = −0,21 (p<0,001) entre décalage et demande de régulation.
- H3 **Partiellement confirmée** : transparence 82 %, connaissance précise 15 % (déconnexion nette) ; consensus gradué (gauche/centre ~90 %, droite 69 %, très à droite 56 %) ; effet connaissance DSA → demande NON significatif (p=0,50).

**Front refondu** : H1 (écart-mètre + régression β + 3 nuages Recharts avec droite), H2 (a : hiérarchie + test apparié + contrastes ; b : nuage décalage×demande + r/p), H3 (grands chiffres + demande par bord + significativité DSA). Composants ajoutés à ui.jsx : `Nuage` (scatter Recharts), `Signif`, `fmtP`. Build + tous onglets vérifiés, aucune erreur. Déployé.

### Prochaine étape exacte (reprendre ici)

1. Décisions de mémoire en attente côté Corentin : aligner n (258 → 263) ; figer les verdicts ; noter que la 2e partie de H3 (connaissance → demande) n'est pas soutenue statistiquement (p=0,50) ; interpréter les contrastes politiques de H2.a.
2. ✅ Fait (2026-06-21) : robustesse de H1 par sous-groupe (âge, bord politique). Pistes dataviz restantes, **uniquement si elles éprouvent une hypothèse** (consigne explicite de Corentin, pas de décoration) : mots-clés des verbatims Q19/Q20 ; lecture géographique urbain↔rural si pertinente pour une hypothèse précise.
3. Onglet **Mémoire** (HTML façon wiki) : coquille à préparer quand Corentin fournira le contenu converti de son PDF.
4. Étape 5 : module Datalake (§9). Penser à reporter les deux URL dans le `Etat_d_avancement.md` du mémoire (§2.3.4, voir note en bas).

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
