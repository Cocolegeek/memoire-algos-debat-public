# Algorithmes de recommandation et polarisation du débat public

[![Licence MIT](https://img.shields.io/badge/licence-MIT-blue.svg)](LICENSE)
[![Site en ligne](https://img.shields.io/badge/site-en%20ligne-1f8a86)](https://cocolegeek.github.io/memoire-algos-debat-public/)

Restitution interactive et entièrement reproductible d'une enquête sur la
perception des algorithmes de recommandation et la polarisation du débat
public en France.

Mémoire de Master (IMCDS), Université Paris 1 Panthéon-Sorbonne.
Auteur : Corentin Nicolas.

**Site en ligne :** https://cocolegeek.github.io/memoire-algos-debat-public/

## Idée directrice

Le travail étudie un écart : ce que la recherche établit sur les algorithmes
de recommandation d'un côté, ce que le public en perçoit, en attribue et en
attend de l'autre. Trois hypothèses sont testées sur les données d'une
enquête en ligne (n = 263 répondants adultes) :

- **H1** : l'intensité d'usage (temps passé, exposition aux contenus
  polémiques) prédit mieux l'hostilité perçue envers les opposants politiques
  que la perception de se savoir enfermé dans une bulle algorithmique.
- **H2** : face à la polarisation en ligne, le public attribue davantage une
  responsabilité individuelle (aux personnes qui produisent et partagent des
  contenus) qu'une responsabilité structurelle (aux plateformes, à l'État),
  ce qui réduit la légitimité perçue d'une régulation systémique.
- **H3** : la demande de régulation des algorithmes est massive, mais
  largement déconnectée de la connaissance réelle des dispositifs existants
  (le Digital Services Act, notamment).

L'application présente, pour chaque hypothèse, l'appareil statistique complet
(corrélations, p-values, effectifs) plutôt que des conclusions seules.

## Démarche open source

Code, données anonymisées et méthode d'analyse sont publiés ensemble, sous
licence libre, pour que les résultats puissent être vérifiés et reproduits
indépendamment :

- aucun chiffre n'est saisi à la main dans l'application : tout provient d'un
  unique script d'analyse (`analysis/analyse.py`) ;
- les données brutes anonymisées (`data/reponses.csv`) sont publiques et
  téléchargeables depuis le site ;
- le code de l'application de restitution est public et documenté.

## Structure du dépôt

    data/         données anonymisées de l'enquête (reponses.csv) + méthodologie de collecte
    analysis/     analyse.py, seule source de vérité des chiffres (bibliothèque standard, sans pandas)
    web/          application de restitution (Vite + React + Tailwind CSS + Recharts + Framer Motion)
      public/       reponses.csv, results.json, respondents.json (générés ou servis tels quels), memoire.pdf
      src/
        sections/   un composant par onglet (Accueil, H1, H2, H3, Données, Questionnaire, Mémoire)
        data/       questionnaire.js, reproduction du formulaire diffusé

## Reproduire l'analyse en local

    python analysis/analyse.py        # régénère web/public/results.json et respondents.json
    cd web && npm install && npm run dev

## Citer ce travail

    Nicolas, C. (2026). Algorithmes de recommandation et polarisation du débat
    public [Mémoire de master, Université Paris 1 Panthéon-Sorbonne].
    https://cocolegeek.github.io/memoire-algos-debat-public/

## Contribuer / signaler un problème

Les retours, corrections et questions sont bienvenus via les
[issues](https://github.com/Cocolegeek/memoire-algos-debat-public/issues) du
dépôt.

## Licence

Code et données sous licence MIT (voir [LICENSE](LICENSE)).
