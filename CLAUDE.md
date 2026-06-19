# CLAUDE.md — Brief de construction du projet

Tu es dans le dépôt `memoire-algos-debat-public` (compte GitHub `Cocolegeek`). Ce fichier est la source de vérité. Construis le projet en suivant ce brief.

Règle de travail imposée par Corentin : avance par étapes, montre le résultat de chaque étape, ne lance pas de longue tâche complexe sans validation. Ne fais rien qui ne soit pas demandé ici.

## 1. Objet

Application web de restitution d'une enquête (questionnaire en ligne) sur la perception des algorithmes de recommandation et la polarisation du débat public en France. Mémoire de Master, Paris 1 Panthéon-Sorbonne, Corentin Nicolas.

Angle : un écart entre ce que la recherche établit sur les algorithmes et ce que le public en perçoit, attribue et attend. Trois hypothèses (H1, H2, H3), testées sur les données de l'enquête.

## 2. État actuel du dépôt (déjà fait, ne pas refaire)

- `git init` fait, identité git réglée (Cocolegeek / corentin.nicolas03@gmail.com).
- Remote `origin` = `https://github.com/Cocolegeek/memoire-algos-debat-public` (lié, privé pour l'instant).
- Branche `main`. Premier commit poussé : `LICENSE` (MIT), `.gitignore`, `README.md`, `data/README.md`.

## 3. Décisions verrouillées

- Nom du dépôt : `memoire-algos-debat-public` (minuscules). Le `base` Vite doit valoir exactement `"/memoire-algos-debat-public/"`.
- Stack front : Vite + React + Tailwind CSS + Recharts + Framer Motion. 100 % statique.
- Stats : script Python `analysis/analyse.py` (pandas). Source de vérité unique des chiffres. Aucun chiffre saisi à la main dans le front.
- Hébergement : GitHub Pages, déploiement par GitHub Actions à chaque push.
- Repo doit passer public avant déploiement Pages (cohérent avec l'open source).

## 4. ⚠️ Décisions à trancher PAR CORENTIN avant les chiffres définitifs

Ne pas trancher seul. Si Corentin n'a pas répondu, applique le défaut indiqué et signale-le clairement dans la sortie.

1. **n canonique.** CSV brut = 265 réponses. Le mémoire rédigé dit 258, l'état d'avancement disait 253. Il faut un seul n, cohérent entre le texte du mémoire et l'app. Défaut proposé : recalculer le vrai n après nettoyage (voir point 2) et mettre à jour le texte du mémoire en conséquence.
2. **Mineurs.** 2 répondants ont 13-17 ans. Défaut proposé : les exclure (cohérent avec le consentement et la cible adulte), donc n = 263, puis réconcilier avec le 258 du mémoire. Variable `EXCLURE_MINEURS` dans analyse.py.
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
    sections/ Overview, Hypothesis1, Hypothesis2, Hypothesis3, HypoHeader, Datalake
.github/workflows/deploy.yml
```

## 6. Ordre de construction (étape par étape, valider à chaque palier)

1. Scaffold `web/` (Vite react), installer Tailwind + Recharts + Framer Motion, configurer `base`, lancer `npm run dev` une fois pour vérifier.
2. Poser le design system (tokens Tailwind + polices, section 7).
3. Construire le dashboard à onglets : Vue d'ensemble + H1 + H2 + H3, piloté par un `results.json` provisoire d'abord (pour voir l'UI tourner).
4. Écrire `analysis/analyse.py` (section 8), déposer le vrai CSV en `data/reponses.csv`, générer le vrai `results.json`.
5. Ajouter le module Datalake (section 9).
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

## 9. Module Datalake (ajout demandé par Corentin)

But : un onglet « Données » où n'importe qui explore le CSV, fabrique ses propres visualisations et exporte ce qu'il veut. Contrainte forte : tout côté navigateur, zéro serveur, pour rester sur l'hébergement statique gratuit sans expiration.

Fonctions minimales :

- Charge le CSV anonymisé livré avec le site (`data/reponses.csv` copié dans `web/public/`), avec PapaParse.
- L'utilisateur choisit une variable (n'importe quelle question) en X, une autre en Y ou un comptage, et un type de graphe (barres, points, histogramme).
- Filtres par segment (âge, bord politique, etc.).
- Exports : CSV filtré (téléchargement) et image du graphe (PNG).
- Avertir que les données affichées sont anonymisées et publiques.

Garder ce module simple et robuste. C'est un bac à sable, pas un outil de stats avancé. Le construire après que le dashboard et l'analyse marchent.

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
