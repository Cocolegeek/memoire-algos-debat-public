# État d'avancement — memoire-algos-debat-public

Journal de session. Mis à jour à la fin de chaque session de travail. Sert de point de reprise : lis ce fichier avant de demander « où on en est ».

## Dernière session : 2026-06-22 (logos dans le menu, page Accueil, onglets Questionnaire et Mémoire)

> **Demande de Corentin, traitée en autonomie complète** (PDF du questionnaire fourni en pièce jointe pour transcription) :
> 1. **Logos déplacés du header vers la barre flottante** (`App.jsx`) : les deux logos (Paris 1, IMCDS) ne sont plus dans l'en-tête, ils vivent désormais dans `FloatingNav`, dans un bouton cliquable (`aria-label="Aller à l'accueil"`) qui ramène sur l'onglet Accueil.
> 2. **Onglet « Vue d'ensemble » renommé « Accueil »** (`TABS` dans `App.jsx`), plus clair selon Corentin.
> 3. **En-tête (titre, paragraphe de présentation, badges, citation APA) conditionné à l'onglet Accueil** (`active === 'overview'`) : ne s'affiche plus sur les autres onglets, qui gagnent l'espace vertical correspondant.
> 4. **Bouton de bascule clair/sombre animé** (`ThemeToggle` dans `ui.jsx`) : l'icône soleil/lune anime désormais une rotation/fondu (`framer-motion`, `AnimatePresence mode="wait"`) au changement de mode, au lieu d'un remplacement instantané.
> 5. **Effet de dégradé ancré en haut et en bas du viewport** (`App.jsx`) : deux bandeaux `fixed`, `pointer-events-none`, hauteur modeste (`h-16 sm:h-20`, conformément à la consigne « pas trop gros » de Corentin), `z-30` (sous la barre flottante en `z-40`), pour un effet de focus discret sur le contenu qui défile dessous.
> 6. **Libellés complets dans l'onglet Données** (`Donnees.jsx`) : le sélecteur de colonnes, les filtres, le sélecteur de regroupement et les en-têtes de tableau (vue groupée et vue plate) affichent désormais le texte intégral de la question (`c.titre`, l'en-tête CSV brut) au lieu du seul code compact (`Q1`, `Q2`...). L'export CSV utilise aussi les en-têtes complets, par cohérence avec le CSV source.
> 7. **Onglet « Questionnaire » recréé** (`web/src/data/questionnaire.js` + `web/src/sections/Questionnaire.jsx`) : reproduction fidèle du questionnaire diffusé (7 sections, 20 questions, libellés et options mot pour mot, transcrits depuis le PDF d'export Google Forms fourni par Corentin), rendu en lecture seule avec les composants du design system existant (`Card`, `SectionTitle`, `Eyebrow`, `InfoButton`).
> 8. **Onglet « Mémoire » créé en coquille** (`web/src/sections/Memoire.jsx`) : vérifie par `HEAD` si `memoire.pdf` existe dans `public/` et l'embarque dans un `<iframe>` le cas échéant, sinon affiche un message « en préparation ». Prêt à recevoir le PDF du mémoire de Corentin dès qu'il sera déposé dans `web/public/memoire.pdf`.
> **Vérifications faites** : `npm run build` sans erreur, `npm run lint` revenu exactement aux 2 erreurs préexistantes de `ui.jsx` (hors périmètre) plus l'avertissement React Compiler déjà connu sur `useReactTable` (pas une erreur, pas de régression). Serveur `vite` lancé localement, page principale et les nouveaux fichiers (`questionnaire.js`, `Questionnaire.jsx`, `Memoire.jsx`) confirmés servis (HTTP 200) au bon chemin de base. Pas de vérification visuelle dans un vrai navigateur (aucun navigateur headless disponible dans cet environnement distant) : à valider par Corentin, en particulier le placement des logos dans la barre flottante, l'effet de dégradé au défilement et l'animation du bouton de thème.
> **À la reprise** : validation visuelle par Corentin. Seul point bloquant restant : déposer le PDF du mémoire dans `web/public/memoire.pdf` pour que l'onglet Mémoire affiche le contenu réel au lieu du message « en préparation ».

## Session précédente : 2026-06-22 (refonte header/navigation, mode sombre, Données sur CSV brut)

> **Quatre demandes traitées dans la même session, sans retour intermédiaire (consigne explicite de Corentin) :**
> 1. **Navigation détachée et flottante** : `TabBar` n'est plus `sticky` dans le flux, elle vit désormais dans `FloatingNav` (`ui.jsx`), une barre `fixed` ancrée en haut du viewport, toujours visible dès le chargement. Effet de défilement discret (`framer-motion`, `useScroll`/`useMotionValueEvent`) : légère contraction et accentuation de l'ombre après un petit scroll, pas d'animation brutale.
> 2. **En-tête raccourci** : logos et titre réduits, citation APA repliée par défaut derrière un bouton « Citer cette page » (`App.jsx`), pour atteindre le contenu sans défilement forcé.
> 3. **Mode sombre** : tokens de couleur (`tailwind.config.js`) convertis en variables CSS (`index.css`, blocs `:root` / `.dark`), `darkMode: 'class'`. Nouveau `theme-context.js` (contexte + hook `useTheme`) et `theme.jsx` (`ThemeProvider`, persistance `localStorage`, valeur initiale `prefers-color-scheme`), monté dans `main.jsx`. Bouton bascule (`ThemeToggle`, icône soleil/lune) dans la barre flottante. Les graphes Recharts (`Nuage` dans `ui.jsx`) utilisaient des couleurs hexadécimales brutes en props SVG (grille, axes, points, dégradé) : extraites dans une palette `CHART.light`/`CHART.dark` choisie via `useTheme`, pour que les graphiques suivent aussi le mode sombre.
> 4. **Onglet Données refondu sur le CSV brut** : `Donnees.jsx` ne lit plus `respondents.json` (jeu recodé, sans les champs texte) mais `fetch` + `papaparse` directement sur `reponses.csv` (réintroduction délibérée de la dépendance, retirée en 2026-06-21 pour un usage différent : ici elle sert un import CSV générique, pas un bac à sable de visualisation). Détection automatique du type de chaque colonne du CSV (numérique, catégorielle si peu de valeurs distinctes, texte libre sinon) au lieu d'un schéma de 13 colonnes câblé en dur : les 31 colonnes brutes sont disponibles, y compris Q19/Q20 (réponses libres). Tableau non contraint en largeur (défilement horizontal dans la carte). Panneau de paramètres (colonnes affichées, filtres, regroupement) déplacé dans une barre latérale gauche repliable (`PanneauFiltres`), au lieu d'être au-dessus du tableau.
> **Vérifications faites** : `npm install papaparse`, `npm run build` sans erreur, `npm run lint` revenu aux 2 erreurs préexistantes de `ui.jsx` (hors périmètre) plus l'avertissement React Compiler déjà connu sur `useReactTable` (pas une erreur). Serveur `vite` lancé localement, page et `reponses.csv` confirmés servis (HTTP 200) au bon chemin de base. Pas de vérification visuelle dans un vrai navigateur (aucun navigateur headless disponible dans cet environnement distant) : à valider par Corentin, en particulier le rendu du mode sombre et la barre flottante au défilement.
> **À la reprise** : validation visuelle par Corentin. Seul point bloquant restant identifié : l'onglet Mémoire, qui attend le contenu converti du PDF de Corentin.

## Session précédente : 2026-06-22 (onglet « Données », nouvelle règle de fusion directe)

> **Nouvelle règle de workflow actée par Corentin** : push et fusion (squash) directe dans `main` à la fin de chaque tâche, sans attendre une confirmation explicite ("fusionne"), pour voir les changements en temps réel côté cloud. Documenté dans `CLAUDE.md` (en tête de fichier). S'applique à partir de cette session.
> **Onglet « Données » ajouté** (`web/src/sections/Donnees.jsx`), nouvelle version du concept retiré en §9 : pas un bac à sable de visualisation, un vrai tableau réutilisable. Tableau d'une ligne par répondant (source `respondents.json`, même jeu que les nuages H1/H2), avec : sélecteur de colonnes affichées (boutons pilule), filtres par colonne (liste déroulante pour les catégorielles, plage min/max pour les numériques), tri par clic sur l'en-tête, regroupement façon Power BI (choix d'une colonne catégorielle, groupes repliables avec effectif et moyenne des colonnes numériques affichées), export CSV qui respecte exactement la vue courante (colonnes choisies + filtres, et le résumé par groupe si un regroupement est actif). Librairie : `@tanstack/react-table` (headless, gratuite, pas de palier payant comme AG Grid pour le regroupement), habillage entièrement en Tailwind avec les tokens existants plutôt qu'un kit UI tiers (Mantine aurait importé tout un framework parallèle). Proposition validée par Corentin avant codage (choix de librairie, source de données, 4 fonctionnalités).
> **Vérifications faites** : `npm run build` sans erreur, `npm run lint` toujours à 2 erreurs préexistantes (`ui.jsx`, hors périmètre) plus un avertissement (pas une erreur) de React Compiler sur l'incompatibilité connue de `useReactTable` avec la mémoïsation automatique, sans impact fonctionnel sur un tableau de 263 lignes. Pas de vérification visuelle dans un vrai navigateur (aucun navigateur headless disponible dans cet environnement distant) : à valider par Corentin.
> **À la reprise** : valider visuellement l'onglet Données. Seul point bloquant restant identifié : l'onglet Mémoire, qui attend le contenu converti du PDF de Corentin.

## Session précédente : 2026-06-21 (en-tête : logos à gauche, nouveau logo IMCDS)

> **Clôture de session.** Demande de Corentin : retirer l'eyebrow « Mémoire de Master IMCDS · Paris 1 Panthéon-Sorbonne » de l'en-tête (`App.jsx`), regrouper les deux logos (Paris 1 et IMCDS) à gauche au lieu de les répartir aux deux extrémités, et remplacer le logo IMCDS par une déclinaison fournie directement par Corentin (PNG transparent, sans lettrage « IDS », plus simple que la version fond bleu marine utilisée jusqu'ici). Fichier `logo-master-imcds.jpeg` supprimé, remplacé par `logo-master-imcds.png` (rognage automatique au plus près du contenu, transparence native du fichier source conservée). Classe Tailwind du logo IMCDS simplifiée (plus de fond/ombre/coins arrondis, devenus inutiles sur un logo déjà transparent et circulaire).
> **Vérifications faites** : `npm run build` sans erreur, `npm run lint` toujours à 2 erreurs préexistantes (`ui.jsx`, hors périmètre, aucune régression). Pas de vérification visuelle dans un vrai navigateur cette session (aucun navigateur headless disponible dans cet environnement distant) : à valider par Corentin.
> **PR #18 ouverte en brouillon**, pas encore fusionnée.
> **À la reprise** : suivre la PR #18 (validation visuelle de Corentin, puis fusion sur instruction explicite). Seul point bloquant restant identifié : l'onglet Mémoire, qui attend le contenu converti du PDF de Corentin.

## Session précédente : 2026-06-21 (retrait du module Datalake + phrase de présentation)

> **Clôture de session.** Corentin a jugé le module Datalake livré dans la session précédente sans intérêt (« c'est nul »). Retrait complet : onglet « Données » supprimé de `App.jsx`, `web/src/sections/Datalake.jsx` supprimé, dépendance `papaparse` désinstallée. À la place : une simple icône de téléchargement sur la page Vue d'ensemble (`Overview.jsx`), qui pointe directement vers `reponses.csv` (toujours servi depuis `web/public/`, toujours synchronisé en CI). `CLAUDE.md` §9 et l'arborescence cible (§5) mis à jour pour documenter ce retrait, sur le même principe que le nuage 3D retiré en juin.
> **Deuxième correction demandée dans la même session** : le bloc de citations « Ce qu'en disent les répondants » sur la page Vue d'ensemble affichait aussi un mini graphique en barres des thèmes détectés (répartition des causes citées). Corentin a jugé ce graphique sans lien avec la page (pas d'hypothèse précise associée sur l'onglet Vue d'ensemble). Retiré uniquement pour cet onglet dans `Verbatims.jsx` (`tab !== 'overview'` autour du bloc de barres) : les citations textuelles restent, le graphique de répartition reste affiché sur H1/H2/H3 où il est rattaché à une hypothèse précise via le texte de lecture.
> **Troisième ajout** : courte phrase de présentation ajoutée dans l'en-tête (`App.jsx`, sous le titre), pour planter la démarche en une phrase simple, sans jargon : l'écart entre ce que la recherche établit sur les algorithmes et ce que le public en perçoit, attribue et attend. Visible sur tous les onglets puisque l'en-tête est commun.
> **Vérifications faites** : `npm run build` sans erreur, `npm run lint` toujours à 2 erreurs préexistantes (`ui.jsx`, hors périmètre), `reponses.csv` confirmé présent dans `dist/` pour que le lien de téléchargement fonctionne une fois déployé.
> **PR #16 et #17 fusionnées dans `main`.**
> **À la reprise** : plus aucune tâche concrète identifiée dans CLAUDE.md. Seul point bloquant restant : l'onglet Mémoire, qui attend le contenu converti du PDF de Corentin.

## Session précédente : 2026-06-21 (module Datalake, §9, construit puis retiré)

> **Clôture de session.** Étape 5 du brief (CLAUDE.md §9) réalisée : l'onglet « Données » n'est plus un placeholder, c'est un vrai bac à sable d'exploration. `web/src/sections/Datalake.jsx` réécrit en entier : chargement du CSV anonymisé côté navigateur (PapaParse), détection automatique des colonnes numériques vs catégorielles, choix libre de variable en X et en Y (ou comptage), trois types de graphe (barres, points, histogramme), filtres par segment cumulables, export du CSV filtré et export PNG du graphe (canvas, sans dépendance supplémentaire), bandeau de rappel sur l'anonymisation/le caractère public des données. Option « colorer par bord politique » sur les nuages de points, qui réutilise la palette `BORD_COULEURS` déjà en place sur H2/H3 (reprend une remarque précédente de Corentin, scatter plot par bord politique). La lecture urbain/rural de Q4 (piste laissée ouverte depuis la session précédente) est désormais couverte par ce module générique plutôt que par un graphique dédié à une hypothèse qu'elle ne sert pas précisément.
> **CSV public** : `data/reponses.csv` copié vers `web/public/reponses.csv` pour que le module puisse le `fetch`. CI (`deploy.yml`) modifiée pour copier ce fichier à chaque build, afin d'éviter toute dérive entre les deux copies.
> **Vérifications faites** : script Node autonome rejouant la logique de parsing/recodage sur le vrai CSV (265 lignes, 30 colonnes hors Horodateur, 15 colonnes numériques correctement détectées, recodage du bord politique vérifié catégorie par catégorie) ; `npm run build` passé sans erreur ; `npm run lint` toujours à 2 erreurs (préexistantes, `ui.jsx`, hors périmètre, aucune régression introduite) ; serveur `vite preview` lancé localement pour confirmer que `reponses.csv` est bien servi (HTTP 200) depuis le bon chemin de base.
> **Limite connue** : pas de vérification visuelle dans un vrai navigateur cette session (Playwright bloqué par la politique réseau du bac à sable) ; à faire par Corentin ou lors d'une prochaine session avec affichage.
> **À la reprise** : suivre la PR ouverte pour ce travail. Pistes restantes : onglet Mémoire (bloqué, attend le contenu de Corentin). Plus aucune tâche concrète et non bloquée identifiée dans CLAUDE.md à ce stade.

## Session précédente : 2026-06-21 (suite, passe de clarté)

> **Clôture de session.** Nouvelle passe de clarté demandée par Corentin sur l'app déjà déployée : vocabulaire courant dans les textes (« orange/vert » au lieu de « corail/sarcelle »), jargon statistique réduit dans le paragraphe de régression H1, nuages de points H1/H2.b passés en pleine largeur avec légendes d'axes et segmentation (ligne de référence à l'égalité individus/structures sur H2.b), notations type « Q18 ∈ {4,5} » réécrites en toutes lettres, demande de régulation par bord politique (H3) remplacée par un nuage de points coloré par bord avec légende écrite, verbatims rendus différents par onglet (au lieu des mêmes citations partout) avec une classification thématique légère (analyse sémantique illustrative, pas statistique) ajoutée à `analyse.py`. Travail poussé sur la branche `claude/mobile-build-push-spns32`, **PR #14 ouverte en brouillon**, pas encore fusionnée.
> **Vérifications faites :** `analyse.py` ré-exécuté, chiffres H1/H2/H3 inchangés (seule la structure des verbatims a changé) ; build `web` passé (`npm ci && npm run build`) ; lint pré-existant (2 erreurs dans `ui.jsx` sur `react-refresh/only-export-components`) confirmé antérieur à cette session, non traité (hors périmètre).
> **Limite connue :** pas de vérification visuelle dans un vrai navigateur cette session (téléchargement du navigateur Playwright bloqué par la politique réseau du bac à sable) ; à faire par Corentin ou lors d'une prochaine session avec affichage.
> **À la reprise :** suivre la PR #14 (statut CI/relecture). Au moment de la clôture de session précédente : aucun check CI configuré sur les PR (le déploiement ne se déclenche que sur push vers `main`), aucun commentaire de revue. Rien de bloquant côté code.

## Session précédente : 2026-06-21 (recadrage académique)

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

### Passe de clarté (même journée, 2026-06-21, PR #14)

Demande de Corentin : huit retouches ciblées sur l'app déjà en ligne, pour la rendre lisible par un public diplômé non spécialiste des statistiques, sans toucher au fond des chiffres ni aux passages cités tels quels.

1. **Vocabulaire courant** : « corail »/« sarcelle » remplacés par « orange »/« vert » dans les paragraphes explicatifs (H1, H2.a, H2.b). Les tokens techniques `percu`/`reel` dans le code ne changent pas, seul le texte visible change.
2. **Jargon réduit** : le paragraphe expliquant la régression H1 (poids β, p) reformulé pour rester compréhensible sans bagage statistique, sans perdre l'information.
3. **Nuages de points propres** : H1 (3 nuages) et H2.b (1 nuage) passés d'une grille en plusieurs colonnes à un empilement en pleine largeur, avec graduations d'axe harmonisées (échelle 1-5) et légendes d'axes X/Y systématiques.
4. **r et p définis précisément** : les paragraphes accompagnant chaque nuage explicitent ce que mesurent r et p, sans raccourci.
5. **Segmentation propre sur les nuages** : ligne de référence verticale ajoutée sur le nuage H2.b (décalage de responsabilité × demande de régulation), marquant le point d'égalité entre responsabilité individuelle et structurelle.
6. **Verbatims différenciés par onglet** : nouveau composant `Verbatims.jsx`, qui sélectionne un sous-ensemble de citations pertinent pour l'onglet actif (Vue d'ensemble : thèmes Q19 généraux ; H1 : thème « usage des réseaux/algorithmes » de Q19 ; H2 : thèmes « responsabilité individuelle » vs « responsabilité politique/médias » de Q19 ; H3 : thème « régulation » de Q20), au lieu des 4 mêmes citations partout. `analyse.py` enrichi d'une classification thématique légère par mots-clés (`THEMES_Q19`, `THEMES_Q20`, fonction `classer`), explicitement présentée comme une lecture illustrative et non un test statistique. Schéma `results.json.verbatims.q19/q20` changé : `{question, themes:[{cle,label,pct}], citations:[{texte,theme}]}` au lieu d'un simple tableau de chaînes.
7. **Notations en toutes lettres** : suppression des raccourcis type « Q18 ∈ {4,5} » dans les textes visibles (icônes méthodologie et sous-titres), remplacés par des formulations en français complet.
8. **Demande par bord politique (H3) en nuage de points** : le bloc « Une demande consensuelle, mais graduée » passe d'une liste de barres à un nuage de points (un point par bord politique, couleur = `BORD_COULEURS`, taille = ampleur de l'accord), avec légende écrite. Le paragraphe cité par Corentin mot pour mot n'a pas été modifié, conformément à sa consigne explicite.

Vérifications faites : `analyse.py` ré-exécuté (chiffres H1/H2/H3 inchangés, seule la structure des verbatims a changé) ; `npm run build` passé sans erreur. Vérification visuelle dans un vrai navigateur **non faite** cette session (téléchargement du navigateur Playwright bloqué par la politique réseau du bac à sable) : à faire par Corentin ou lors d'une prochaine session avec affichage.

Poussé sur la branche `claude/mobile-build-push-spns32`, **PR #14 ouverte en brouillon** (pas encore fusionnée dans `main`, donc pas encore sur le site en ligne). Au moment de la clôture de cette session : aucun check CI sur la PR (le workflow de déploiement ne se déclenche que sur push vers `main`, pas sur les PR), aucun commentaire de revue en attente.

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
2. ✅ Fait (2026-06-21) : robustesse de H1 par sous-groupe (âge, bord politique). ✅ Fait (PR #14) : mots-clés des verbatims Q19/Q20. Lecture géographique urbain↔rural : couverte par le module Datalake (§9, voir ci-dessous) plutôt que par un graphique dédié, puisqu'elle ne sert aucune hypothèse précise.
3. Onglet **Mémoire** (HTML façon wiki) : coquille à préparer quand Corentin fournira le contenu converti de son PDF. **Seule tâche restante identifiée, bloquée côté contenu.**
4. ✅ Fait (2026-06-21) : étape 5, module Datalake (§9). Reste à reporter les deux URL dans le `Etat_d_avancement.md` du mémoire (§2.3.4, voir note en bas) : document hors de ce dépôt, action pour Corentin.

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
