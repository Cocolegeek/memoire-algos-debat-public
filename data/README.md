# Données

`reponses.csv` : export anonymisé du questionnaire en ligne (Google Forms),
265 réponses brutes, 31 colonnes (une par question, en-têtes préfixés `Q1`...`Q20`).
Aucune donnée identifiante : le fichier est publié avec le dépôt.

L'analyse retient **263 répondants** après exclusion des 2 mineurs (13-17 ans),
décision tranchée pour rester cohérent avec le consentement et la cible adulte.

Le traitement est entièrement effectué par `analysis/analyse.py`, seule source
de vérité des chiffres affichés dans l'application.
