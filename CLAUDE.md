# CLAUDE.md — Brief de construction du projet

Tu es dans le dépôt `memoire-algos-debat-public` (compte GitHub `Cocolegeek`). Ce fichier est la source de vérité. Construis le projet en suivant ce brief.

Règle de travail imposée par Corentin : avance par étapes, montre le résultat de chaque étape, ne lance pas de longue tâche complexe sans validation. Ne fais rien qui ne soit pas demandé ici.

**Règle de fusion (2026-06-22) : push et fusionne directement dans `main` à la fin de chaque tâche, sans attendre une confirmation explicite.** Corentin veut voir les changements en temps réel côté cloud (déploiement GitHub Pages) plutôt que d'avoir à valider des previews. Ouvrir la PR, la fusionner (squash) tout de suite après vérification (build + lint), sauf si Corentin dit explicitement d'attendre.

**En début de session, lis aussi `ETAT_AVANCEMENT.md` à la racine du dépôt : c'est le journal daté qui dit exactement où on s'est arrêté et quelle est la prochaine action.**

## 1. Objet

Application web de restitution d'une enquête (questionnaire en ligne) sur la perception des algorithmes de recommandation et la polarisation du débat public en France. Mémoire de Master, Paris 1 Panthéon-Sorbonne, Corentin Nicolas.

Angle : un écart entre ce que la recherche établit sur les algorithmes et ce que le public en perçoit, attribue et attend. Trois hypothèses (H1, H2, H3), testées sur les données de l'enquête.

## 2. État actuel du dépôt (déjà fait, ne pas refaire)

- `git init` fait, identité git réglée (Cocolegeek / corentin.nicolas03@gmail.com). `gh` CLI installé et authentifié (compte Cocolegeek).
- Remote `origin` = `https://github.com/Cocolegeek/memoire-algos-debat-public` (lié, privé pour l'instant).
- Branche `main`. Commits poussés jusqu'ici :
  - `LICENSE` (MIT), `.gitignore`, `README.md`, `data/README.md`.
  - `CLAUDE.md` (ce fichier).
  - `data/reponses.csv` : CSV brut de l'enquête déposé, **265 réponses confirmées** (parsing CSV propre, pas `wc -l` à cause des champs multilignes), 31 colonnes — cohérent avec la section 8.
  - Scaffold `web/` (étape 1 de la section 6) : Vite + React, **Tailwind v3.4.19** (volontairement pas v4, pour garder le format `tailwind.config.js` classique attendu en section 7), Recharts, Framer Motion. Tokens de couleur et les 3 polices posés dans `tailwind.config.js` / `src/index.css`. `vite.config.js` : `base: "/memoire-algos-debat-public/"`. `npm run dev` vérifié (page servie avec le bon préfixe d'URL).
- **Étapes 1 à 4 faites et déployées (au 2026-06-20).** Design system dans l'UI (étape 2), dashboard à onglets piloté par `results.json` (étape 3), `analysis/analyse.py` qui génère les vrais chiffres + `respondents.json` (étape 4). Repo public, CI GitHub Pages active, **site en ligne** : https://cocolegeek.github.io/memoire-algos-debat-public/
- Direction en cours : visualisations multivariées riches (voir section 13). Prochaine action concrète à la reprise : le **nuage 3D** (three.js) coloré par bord politique.
- Détail complet, vrais chiffres, décisions et point de reprise exact : voir `ETAT_AVANCEMENT.md` (journal daté, source de reprise).

## 3. Décisions verrouillées

- Nom du dépôt : `memoire-algos-debat-public` (minuscules). Le `base` Vite doit valoir exactement `"/memoire-algos-debat-public/"`.
- Stack front : Vite + React + Tailwind CSS + Recharts + Framer Motion, plus **three.js / react-three-fiber** pour les visualisations 3D (décision du 2026-06-20). 100 % statique.
- Stats : script Python `analysis/analyse.py`. Source de vérité unique des chiffres. Aucun chiffre saisi à la main dans le front. **Écrit en bibliothèque standard pure (pas pandas)** : déviation assumée au §8, plus robuste et instantané en CI. Génère `results.json` (agrégats) et `respondents.json` (jeu anonymisé par répondant pour les viz).
- Hébergement : GitHub Pages, déploiement par GitHub Actions à chaque push.
- Repo doit passer public avant déploiement Pages (cohérent avec l'open source).

## 4. ⚠️ Décisions à trancher PAR CORENTIN avant les chiffres définitifs

Ne pas trancher seul. Si Corentin n'a pas répondu, applique le défaut indiqué et signale-le clairement dans la sortie.

1. **n canonique.** ✅ TRANCHÉ (2026-06-20) : **n = 263** (CSV brut 265 moins 2 mineurs). Reste à faire **par Corentin** : aligner le texte du mémoire rédigé (qui dit 258) sur 263.
2. **Mineurs.** ✅ TRANCHÉ (2026-06-20) : **exclus** (`EXCLURE_MINEURS = True` dans analyse.py), donc n = 263.
3. **Formulation des hypothèses.** Le mémoire rédigé (PDF) fait foi sur les énoncés. Reporter exactement :
   - H1 : « L'intensité d'usage (temps passé, exposition aux contenus polémiques) prédit mieux l'hostilité que la perception de se savoir enfermé dans une bulle. »
   - H2.a : le public attribue davantage une responsabilité individuelle (producteurs, partageurs) que structurelle (plateformes, État).
   - H2.b : ce décalage diminue la légitimité perçue d'une régulation systémique.
   - H3 : demande de régulation massive mais déconnectée de la connaissance des dispositifs ; « une meilleure connaissance du DSA réduit la volonté de régulation ». Dans l'app, H2 peut rester un seul onglet présentant H2.a et H2.b.

## 5. Arborescence cible

```
data/         CSV anonymisé (reponses.csv) + README
analysis/     analyse.py + requirements.txt   -> écrit web/public/results.json
web/          app Vite/React
  public/results.json   (généré par analyse.py ; un provisoire est versionné)
  src/
    main.jsx, App.jsx, index.css, ui.jsx
    sections/ Overview, Hypothesis1, Hypothesis2, Hypothesis3, HypoHeader, Verbatims
.github/workflows/deploy.yml
```

## 6. Ordre de construction (étape par étape, valider à chaque palier)

1. Scaffold `web/` (Vite react), installer Tailwind + Recharts + Framer Motion, configurer `base`, lancer `npm run dev` une fois pour vérifier.
2. Poser le design system (tokens Tailwind + polices, section 7).
3. Construire le dashboard à onglets : Vue d'ensemble + H1 + H2 + H3, piloté par un `results.json` provisoire d'abord (pour voir l'UI tourner).
4. Écrire `analysis/analyse.py` (section 8), déposer le vrai CSV en `data/reponses.csv`, générer le vrai `results.json`.
5. ~~Ajouter le module Datalake~~ : construit puis retiré, voir section 9.
6. Ajouter la CI `deploy.yml` (section 10), passer le repo public, activer Pages.
7. Pousser, vérifier le site en ligne.

Faire valider l'UI par Corentin (capture/au navigateur) avant d'enchaîner sur la CI et le déploiement.

## 7. Design (rendu premium, pas un dashboard générique)

Signature : un « écart-mètre » récurrent, fil rouge des trois onglets. Deux pôles opposés, une barre chacun : perception du public (corail) vs réalité mesurée / documentée (sarcelle). La longueur des barres rend visible l'écart.

Polices (Google Fonts) :

- Display (titres, grands chiffres, onglets) : Space Grotesk
- Corps : IBM Plex Sans
- Données / étiquettes / eyebrows : IBM Plex Mono

Tokens Tailwind (`tailwind.config.js`, `theme.extend.colors`) :

```
ink: "#15172B", "ink-soft": "#2C2E4A",
bg: "#ECEDF1", panel: "#FFFFFF", line: "#D9DBE3", muted: "#6B6F80",
reel: "#1F8A86", "reel-soft": "#D5EAE9",
percu: "#E06A3B", "percu-soft": "#F7DED2"
```

Layout : masthead (titre + n + badge « chiffres provisoires » tant que les données ne sont pas figées + lien « Code source » vers le repo), barre d'onglets en pilule (Vue d'ensemble / H1 / H2 / H3 / Données), contenu en cartes (`panel`, bord `line`, ombre douce, coins arrondis ~1.25rem).

Interactions par onglet :

- Vue d'ensemble : profil de l'échantillon (4 indicateurs + répartition politique en barres) + les 3 écart-mètres cliquables qui mènent à chaque onglet.
- H1 : écart-mètre (perception de bulle vs intensité d'usage) + graphe des corrélations (barres cliquables : bulle Q9, temps Q7, exposition Q11), échelle 0-0,3.
- H2 : hiérarchie des 5 acteurs (barres, individus en corail, structures en sarcelle) + bloc « blâme politiquement orienté » avec filtre cliquable Tous / Gauche / Droite.
- H3 : deux grands chiffres (demande de transparence vs connaissance précise du DSA) + comparaison de la demande selon la connaissance du DSA (2 barres cliquables).

Plancher qualité : responsive mobile, focus clavier visible, `prefers-reduced-motion` respecté (désactiver les animations), animations discrètes (révélation au scroll, légère pilule d'onglet, compte des nombres).

Avant de coder l'UI, lis le skill `frontend-design` s'il est disponible.

## 8. Données et analyse (`analysis/analyse.py`)

Le CSV (export Google Forms) a 31 colonnes, une par question, en-têtes préfixés `Q1`, `Q2`, ... `Q20` (Q11a-d, Q14a-d, Q16a-e). Les échelles 1-5 sont déjà numériques (Q9, Q10, Q12, Q13, Q14a-d, Q15, Q16a-e, Q18). Restent en texte : Q5 (politique), Q7 (temps), Q11a-d (fréquence), Q17 (DSA).

Mappe les colonnes par préfixe de code (robuste aux espaces parasites) : `code = colonne.split(" -")[0].strip()` donne `"Q9"`, `"Q11a"`, etc.

Recodages :

```python
TEMPS = {"Moins de 30 min":1, "30 min - 1h":2, "1-2h":3, "2-4h":4, "Plus de 4h":5}
FREQ  = {"Jamais":1, "Rarement":2, "Parfois":3, "Souvent":4, "Très souvent":5}
# Bord politique : contient "gauche" -> gauche, "droite" -> droite,
#   "centre" -> centre, sinon "autre" (gère "Je ne me positionne pas / Préfère ne pas répondre")
# DSA : contient "précisément" -> "precis" ; "vaguement" -> "vague" ;
#   "première fois" -> "non". Groupe "mal ou pas" = vague + non.
```

Index d'hostilité (polarisation affective) : Q14d est inversé (plus la note est haute, plus l'autre est jugé respectable, donc moins d'hostilité).

```
index = moyenne(Q14a, Q14b, Q14c, 6 - Q14d)
```

Calculs par hypothèse :

- H1 : corrélations de Pearson entre l'index et, respectivement, Q9 (bulle), Q7 recodé (temps), moyenne(Q11a-d recodés) (exposition). Vérifié sur le brut : Q9 ≈ 0,03 (quasi nul), temps et exposition plus élevés. Échelle d'affichage 0-0,3.
- H2 : moyennes Q16a-e. Groupe individus = moyenne(Q16c producteurs, Q16e partageurs) ; structures = moyenne(Q16a plateformes, Q16b État, Q16d médias). Contrastes par bord (gauche vs droite) sur au moins : blâme des médias (Q16d), responsabilité de l'État (Q16b), blâme des partageurs (Q16e).
- H3 : % de transparence = part de Q18 ∈ {4,5} ; % connaissance précise = part de Q17 = "precis". Demande moyenne (Q18) chez « connaît précisément » vs « connaît mal ou pas ». (Données brutes : ~15 % connaissent précisément le DSA, ~85 % mal ou pas. Recalculer proprement après nettoyage.)
- Verbatims : collecter Q19 (≈134 réponses non vides) et Q20 (≈117), en retirer les vides, en garder un échantillon représentatif pour le pied de page.

Sortie : écrire `web/public/results.json` selon le schéma de la section 11. Mettre `meta.statut = "définitif"`, `meta.n = <n après nettoyage>`, `meta.genere_le = date du jour`. Tant que le CSV est absent, ne pas écraser le `results.json` provisoire (le site reste déployable).

`requirements.txt` : `pandas>=2.0` et `numpy>=1.24`.

## 9. Module Datalake : construit puis retiré (décision de Corentin, 2026-06-21)

L'onglet « Données » (bac à sable d'exploration libre du CSV, PapaParse, choix de variables, export CSV/PNG) a été construit conformément à l'ancienne version de cette section, puis **retiré** : jugé sans intérêt par Corentin (« c'est nul »), cohérent avec le principe directeur de la section 13 (chaque écran doit éprouver une hypothèse, pas décorer). L'onglet et `web/src/sections/Datalake.jsx` ont été supprimés, ainsi que la dépendance `papaparse`.

À la place : une simple icône de téléchargement sur la page Vue d'ensemble, qui pointe directement vers `reponses.csv` (servi tel quel depuis `web/public/`, toujours synchronisé en CI). Quiconque veut explorer les données récupère le fichier brut et utilise son propre outil, pas de bac à sable maison à maintenir.

## 10. Déploiement (GitHub Pages)

`vite.config.js` :

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins: [react()], base: "/memoire-algos-debat-public/" });
```

Le front lit `results.json` via `fetch(import.meta.env.BASE_URL + "results.json")`.

`.github/workflows/deploy.yml` :

```yaml
name: Déploiement
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: |
          pip install -r analysis/requirements.txt
          python analysis/analyse.py
      - uses: actions/setup-node@v4
        with: { node-version: "20", cache: npm, cache-dependency-path: web/package-lock.json }
      - working-directory: web
        run: |
          npm ci
          npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: web/dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Étapes finales (commandes) :

```bash
# rendre le repo public (gh authentifié)
gh repo edit Cocolegeek/memoire-algos-debat-public --visibility public --accept-visibility-change-consequences
# activer Pages côté GitHub : Settings > Pages > Source = GitHub Actions
git add . && git commit -m "App, analyse, CI" && git push
```

Site en ligne : `https://cocolegeek.github.io/memoire-algos-debat-public/` (une à deux minutes après le push).

## 11. Schéma de `results.json`

```json
{
  "meta": { "n": 263, "statut": "définitif", "genere_le": "AAAA-MM-JJ", "source": "..." },
  "echantillon": {
    "resume": "Échantillon de convenance, non représentatif...",
    "indicateurs": [{ "label": "18-34 ans", "pct": 0 }, "..."],
    "politique": [{ "label": "Gauche / très à gauche", "pct": 0 }, "..."]
  },
  "h1": {
    "code": "H1", "titre": "...", "enonce": "...", "verdict": "...",
    "ecart": { "percu": {"label":"Perception de bulle","valeur":0.03,"sous":"..."},
               "reel": {"label":"Intensité d'usage","valeur":0.0,"sous":"..."},
               "echelle": 0.3 },
    "correlations": [{ "label":"Perception de bulle (Q9)","r":0.03,"pole":"percu" }, "..."],
    "lecture": "..."
  },
  "h2": {
    "code":"H2","titre":"...","enonce":"...","verdict":"...",
    "ecart": { "percu":{"label":"Individus","valeur":0,"sous":"..."},
               "reel":{"label":"Structures","valeur":0,"sous":"..."}, "echelle":5 },
    "hierarchie": [{ "acteur":"Utilisateurs producteurs","note":0,"type":"individu" }, "..."],
    "contrastes_politiques": [{ "item":"Blâme des médias traditionnels","gauche":0,"droite":0 }, "..."],
    "lecture":"..."
  },
  "h3": {
    "code":"H3","titre":"...","enonce":"...","verdict":"...",
    "ecart": { "percu":{"label":"Demande de transparence","valeur":0,"unite":"%","sous":"..."},
               "reel":{"label":"Connaissance du DSA","valeur":0,"unite":"%","sous":"..."}, "echelle":100 },
    "demande_selon_dsa": [{ "label":"Connaît précisément le DSA","note":0 },
                          { "label":"Connaît mal ou pas le DSA","note":0 }],
    "lecture":"..."
  },
  "verbatims": { "q19": ["..."], "q20": ["..."] }
}
```

Le front utilise `ecart.echelle` comme maximum de l'écart-mètre (0,3 pour H1, 5 pour H2, 100 pour H3) et `ecart.percu.unite === "%"` pour le format.

## 12. Préférences de forme (héritées du projet mémoire)

- Pas de tirets longs (—) : virgules, parenthèses, deux-points.
- Pas d'anglicismes inutiles, français soutenu mais naturel.
- Dire « algorithmes », « systèmes de recommandation », « systèmes automatisés », pas de sémantique « IA » abusive.
- Démarche open source assumée (licence MIT, données et code reproductibles).

## 13. Cap : tout au service des hypothèses (recadré par Corentin le 2026-06-21)

Principe directeur : chaque écran doit éprouver une hypothèse, clairement et de façon académique. Les visualisations « jolies mais sans hypothèse » sont écartées. Le **nuage 3D a été construit puis retiré** pour cette raison (three.js désinstallé).

Énoncés exacts (mot pour mot, font foi) :
- **H1** : « L'intensité d'usage, mesurée par le temps passé et l'exposition aux contenus polémiques, prédit mieux l'hostilité que la perception de se savoir enfermé dans une bulle. »
- **H2.a** : « Face à la polarisation en ligne, le public attribue davantage une responsabilité individuelle (aux individus qui produisent et partagent les contenus), plutôt qu'une responsabilité structurelle (aux plateformes et à l'État). »
- **H2.b** : « Le décalage entre la responsabilité individuelle et la responsabilité structurelle diminue la légitimité perçue de toute régulation systémique. »
- **H3** : « La demande de régulation des algorithmes est massive et largement consensuelle, mais déconnectée de la connaissance des dispositifs existants. Une meilleure connaissance du DSA réduit la volonté de régulation. »

Décisions verrouillées (2026-06-21) :
- Structurel (H2.a) = plateformes + État seulement (PAS les médias).
- H2.b : « légitimité de la régulation systémique » mesurée par la demande de transparence imposée par l'État (Q18).
- Appareil statistique **visible** dans l'app : régression, corrélations, p-values, n. Couleurs par bord politique : rouge à gauche, bleu à droite, blanc centre, gris « ne se positionne pas ».
- Dataviz : **Recharts** (2D), pas de 3D.

État : H1, H2.a, H2.b, H3 refondus et déployés avec leurs tests (voir ETAT_AVANCEMENT.md pour les chiffres). Résultats : H1, H2.a, H2.b confirmées ; H3 partiellement (la 2e partie « connaissance → demande » n'est pas significative, p=0,50).

Chaque graphe a une icône méthodologie cliquable (fenêtre flottante, fond flouté : méthodologie + données en entrée) et un paragraphe explicatif propre sous le graphe, écrit pour rester clair en relecture future. Contrôle de robustesse de H1 fait (mêmes corrélations recalculées par tranche d'âge et bord politique) : la bulle ne devient significative dans aucun sous-groupe.

**Règle explicite de Corentin pour toute nouvelle visualisation** : ne pas multiplier les graphes. Chaque ajout doit éprouver une hypothèse précise, pas décorer. Toujours accompagné d'une icône méthodologie et d'un paragraphe explicatif.

**Décisions finales de Corentin (2026-06-21)** : n = 263 confirmé (à reporter dans le texte du mémoire, 258 → 263) ; verdicts conservés tels que calculés, sans chercher une validation à 100 % (« le but d'une hypothèse est d'être testée, pas validée à 100 % ») ; H3 reste « partiellement confirmée », assumé tel quel.

**Conventions de forme verrouillées (2026-06-21)**, à respecter pour tout ajout futur :
- Le **vocabulaire visible** (labels, titres, paragraphes) reprend les mots exacts des énoncés d'hypothèses ci-dessus, pas des paraphrases.
- Les **titres de graphiques** sont en langage clair, jamais le nom technique du type de graphique (pas de « nuage de points », « régression multiple » en titre visible : ce vocabulaire reste dans l'icône méthodologie, à sa place).
- **Couleur du bord politique cohérente partout** : `BORD_COULEURS` dans `web/src/ui.jsx` (rouge vif extrême gauche → rouge gauche → gris centre → bleu droite → bleu vif extrême droite, gris neutre pour « ne se positionne pas »), à réutiliser via `BarRow`/`Track` (prop `couleur`) dès qu'un graphe distingue des bords politiques. Le système percu/reel (corail/sarcelle) reste pour l'axe perception/réalité, sémantique différente, ne pas confondre les deux palettes.
- **Légendes d'axes obligatoires** sur tout nuage de points (X et Y).

✅ Fait (PR #14, en cours de revue) : passe de clarté demandée par Corentin : vocabulaire « orange/vert » dans les textes au lieu de « corail/sarcelle » (les tokens techniques `percu`/`reel` ne changent pas) ; jargon statistique réduit dans les paragraphes visibles (régression H1) ; nuages de points empilés en pleine largeur avec légendes d'axes et segmentation (ligne de référence H2.b) ; notations type « Q18 ∈ {4,5} » réécrites en toutes lettres ; demande de régulation par bord politique en nuage de points coloré (H3) ; verbatims différenciés par onglet avec analyse sémantique par thèmes (Q19/Q20), au lieu des mêmes citations partout.

Pistes restantes (au service des hypothèses, à valider avant de coder) : lecture urbain↔rural (Q4 = type de territoire, pas la région, donc pas de carte régionale). Onglet **Mémoire** (HTML façon wiki depuis le PDF) : coquille à préparer quand Corentin aura terminé son texte.
