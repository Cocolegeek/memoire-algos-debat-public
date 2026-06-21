# memoire-algos-debat-public

Restitution interactive et reproductible d'une enquête sur la perception des
algorithmes de recommandation et la polarisation du débat public en France.

Mémoire de Master, Université Paris 1 Panthéon-Sorbonne. Auteur : Corentin Nicolas.

**Site en ligne :** https://cocolegeek.github.io/memoire-algos-debat-public/

## Idée directrice

Le travail étudie un écart : ce que la recherche établit sur les algorithmes
d'un côté, ce que le public en perçoit, en attribue et en attend de l'autre.
Trois hypothèses (H1, H2, H3) sont testées sur les données de l'enquête (n = 263).

## Structure

    data/        données anonymisées de l'enquête (reponses.csv)
    analysis/    analyse.py, source de vérité des chiffres (bibliothèque standard)
    web/         application de restitution (Vite + React + Tailwind + three.js)

## Lancer en local

    python analysis/analyse.py        # génère web/public/results.json et respondents.json
    cd web && npm install && npm run dev

## Déploiement

Automatique via GitHub Actions à chaque push sur `main` (build de `web/`,
publication sur GitHub Pages). Voir `.github/workflows/deploy.yml`.

## Suivi du projet

`ETAT_AVANCEMENT.md` (journal daté, point de reprise) et `CLAUDE.md` (brief de
construction, décisions verrouillées).

## Licence

Code et données sous licence MIT (voir LICENSE).
