#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analyse de l'enquête sur la perception des algorithmes et la polarisation.

Source de vérité unique des chiffres de l'application : aucun chiffre n'est
saisi à la main dans le front. Lit data/reponses.csv et écrit deux fichiers
dans web/public/ :
  - results.json      : agrégats par hypothèse (schéma de CLAUDE.md section 11)
  - respondents.json  : jeu anonymisé, une ligne par répondant, pour les
                        visualisations multivariées (nuage 3D, etc.)

Aucune dépendance externe : bibliothèque standard uniquement (volontaire,
pour une exécution reproductible et instantanée en intégration continue).
"""

import csv
import json
import math
import unicodedata
import collections
from pathlib import Path
from datetime import date

RACINE = Path(__file__).resolve().parent.parent
CSV_ENTREE = RACINE / "data" / "reponses.csv"
DOSSIER_SORTIE = RACINE / "web" / "public"

# Décision §4.2 tranchée par Corentin : on exclut les 2 répondants mineurs.
EXCLURE_MINEURS = True


# --------------------------------------------------------------------------
# Outils de normalisation (robustes aux accents et aux espaces parasites)
# --------------------------------------------------------------------------
def deburr(s):
    """Retire les accents : 'Très' -> 'Tres'. Rend les comparaisons sûres."""
    return "".join(
        c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c)
    )


def norm(s):
    return deburr(s or "").strip().lower()


# --------------------------------------------------------------------------
# Recodages (CLAUDE.md section 8)
# --------------------------------------------------------------------------
TEMPS = {
    "moins de 30 min": 1,
    "30 min - 1h": 2,
    "1-2h": 3,
    "2-4h": 4,
    "plus de 4h": 5,
}
FREQ = {
    "jamais": 1,
    "rarement": 2,
    "parfois": 3,
    "souvent": 4,
    "tres souvent": 5,
}

POLITIQUE_LABELS = {
    "extreme_gauche": "Très à gauche",
    "gauche": "Plutôt à gauche",
    "centre": "Plutôt au centre",
    "droite": "Plutôt à droite",
    "extreme_droite": "Très à droite",
    "autre": "Ne se positionne pas",
}
POLITIQUE_ORDRE = ["extreme_gauche", "gauche", "centre", "droite", "extreme_droite", "autre"]

GEO_LABELS = {
    "paris": "Paris / Île-de-France",
    "metropole": "Métropole de province",
    "ville_moyenne": "Ville moyenne",
    "petite_ville": "Petite ville",
    "rural": "Village / rural",
}


def recode_temps(v):
    return TEMPS.get(norm(v))


def recode_freq(v):
    return FREQ.get(norm(v))


def recode_politique(v):
    s = norm(v)
    if "centre" in s:
        return "centre"
    if "gauche" in s:
        return "gauche" if "plutot" in s else "extreme_gauche"
    if "droite" in s:
        return "droite" if "plutot" in s else "extreme_droite"
    return "autre"


def bord(politique):
    """Regroupement gauche / droite pour les contrastes politiques."""
    if politique in ("gauche", "extreme_gauche"):
        return "gauche"
    if politique in ("droite", "extreme_droite"):
        return "droite"
    return None


def recode_dsa(v):
    s = norm(v)
    if "vaguement" in s:
        return "vague"
    if "precis" in s:
        return "precis"
    if s.startswith("oui"):
        return "precis"
    return "non"


def recode_geo(v):
    s = norm(v)
    if "paris" in s or "ile-de-france" in s or "ile de france" in s:
        return "paris"
    if "metropole" in s or "grande" in s:
        return "metropole"
    if "moyenne" in s:
        return "ville_moyenne"
    if "petite" in s:
        return "petite_ville"
    if "village" in s or "rural" in s:
        return "rural"
    return "autre"


# --------------------------------------------------------------------------
# Statistiques (bibliothèque standard)
# --------------------------------------------------------------------------
def moyenne(valeurs):
    vals = [v for v in valeurs if v is not None]
    return sum(vals) / len(vals) if vals else None


def pearson(xs, ys):
    paires = [(x, y) for x, y in zip(xs, ys) if x is not None and y is not None]
    n = len(paires)
    if n < 3:
        return None
    mx = sum(p[0] for p in paires) / n
    my = sum(p[1] for p in paires) / n
    num = sum((p[0] - mx) * (p[1] - my) for p in paires)
    dx = math.sqrt(sum((p[0] - mx) ** 2 for p in paires))
    dy = math.sqrt(sum((p[1] - my) ** 2 for p in paires))
    if dx == 0 or dy == 0:
        return None
    return num / (dx * dy)


def pct(condition_vraie, total):
    return round(100 * condition_vraie / total) if total else 0


def r2(x):
    return round(x, 2) if x is not None else None


# --------------------------------------------------------------------------
# Chargement
# --------------------------------------------------------------------------
def charger():
    with open(CSV_ENTREE, encoding="utf-8") as f:
        lignes = list(csv.reader(f))
    entetes = lignes[0]
    # Mapping par préfixe de code : 'Q11a - ...' -> 'Q11a'
    index = {}
    for i, h in enumerate(entetes):
        code = h.split(" -")[0].strip()
        index[code] = i

    def cell(row, code):
        i = index.get(code)
        if i is None or i >= len(row):
            return ""
        return row[i].strip()

    def cell_num(row, code):
        v = cell(row, code)
        try:
            return float(v)
        except ValueError:
            return None

    reps = []
    for row in lignes[1:]:
        if not any(c.strip() for c in row):
            continue
        age = cell(row, "Q1")
        if EXCLURE_MINEURS and "13-17" in age:
            continue
        q11 = [recode_freq(cell(row, c)) for c in ("Q11a", "Q11b", "Q11c", "Q11d")]
        q14 = [cell_num(row, c) for c in ("Q14a", "Q14b", "Q14c", "Q14d")]
        hostilite = None
        if all(v is not None for v in q14):
            hostilite = moyenne([q14[0], q14[1], q14[2], 6 - q14[3]])
        reps.append(
            {
                "age": age,
                "politique": recode_politique(cell(row, "Q5")),
                "geo": recode_geo(cell(row, "Q4")),
                "etudes": cell(row, "Q2"),
                "temps": recode_temps(cell(row, "Q7")),
                "bulle": cell_num(row, "Q9"),
                "exposition": moyenne(q11),
                "hostilite": hostilite,
                "q16": {c: cell_num(row, "Q16" + c) for c in "abcde"},
                "q18": cell_num(row, "Q18"),
                "dsa": recode_dsa(cell(row, "Q17")),
                "q19": cell(row, "Q19"),
                "q20": cell(row, "Q20"),
            }
        )
    return reps


# --------------------------------------------------------------------------
# Échantillon
# --------------------------------------------------------------------------
def bloc_echantillon(reps):
    n = len(reps)
    jeunes = sum(1 for r in reps if r["age"] in ("18-24", "25-34"))
    superieur = sum(1 for r in reps if "bac+" in norm(r["etudes"]))
    intensif = sum(1 for r in reps if r["temps"] is not None and r["temps"] >= 4)
    idf = sum(1 for r in reps if r["geo"] == "paris")

    compte_pol = collections.Counter(r["politique"] for r in reps)
    politique = [
        {"label": POLITIQUE_LABELS[k], "pct": pct(compte_pol.get(k, 0), n)}
        for k in POLITIQUE_ORDRE
    ]
    return {
        "resume": (
            "Échantillon de convenance, non représentatif de la population française. "
            "Questionnaire diffusé en ligne, donc soumis à un biais d'auto-sélection. "
            "Les proportions ci-dessous décrivent les répondants, pas la population générale."
        ),
        "indicateurs": [
            {"label": "18-34 ans", "pct": pct(jeunes, n)},
            {"label": "Diplômés du supérieur", "pct": pct(superieur, n)},
            {"label": "Plus de 2h par jour sur les réseaux", "pct": pct(intensif, n)},
            {"label": "Vivent en Île-de-France", "pct": pct(idf, n)},
        ],
        "politique": politique,
    }


# --------------------------------------------------------------------------
# H1
# --------------------------------------------------------------------------
def bloc_h1(reps):
    host = [r["hostilite"] for r in reps]
    r_bulle = pearson([r["bulle"] for r in reps], host)
    r_temps = pearson([r["temps"] for r in reps], host)
    r_expo = pearson([r["exposition"] for r in reps], host)
    usage_fort = max(r_temps, r_expo)
    facteur_fort = "temps passé" if r_temps >= r_expo else "exposition aux contenus"
    verdict = "Plutôt confirmée" if abs(r_bulle) < 0.12 and usage_fort > abs(r_bulle) else "Nuancée"
    return {
        "code": "H1",
        "titre": "Usage réel ou bulle imaginée ?",
        "enonce": (
            "L'intensité d'usage (temps passé, exposition aux contenus polémiques) prédit "
            "mieux l'hostilité que la perception de se savoir enfermé dans une bulle."
        ),
        "verdict": verdict,
        "ecart": {
            "percu": {"label": "Perception de bulle", "valeur": r2(r_bulle), "sous": "Corrélation avec l'index d'hostilité"},
            "reel": {"label": "Intensité d'usage", "valeur": r2(usage_fort), "sous": "Corrélation la plus forte (%s)" % facteur_fort},
            "echelle": 0.3,
        },
        "correlations": [
            {"label": "Perception de bulle (Q9)", "r": r2(r_bulle), "pole": "percu"},
            {"label": "Temps passé (Q7)", "r": r2(r_temps), "pole": "reel"},
            {"label": "Exposition aux contenus (Q11)", "r": r2(r_expo), "pole": "reel"},
        ],
        "lecture": (
            "Se sentir enfermé dans une bulle n'a quasiment aucun lien avec l'hostilité mesurée "
            "(corrélation proche de zéro). Ce sont le temps passé et surtout l'exposition aux "
            "contenus clivants qui accompagnent une hostilité plus forte."
        ),
    }


# --------------------------------------------------------------------------
# H2
# --------------------------------------------------------------------------
ACTEURS = [
    ("a", "Plateformes", "structure"),
    ("b", "État et pouvoirs publics", "structure"),
    ("c", "Utilisateurs producteurs", "individu"),
    ("d", "Médias traditionnels", "structure"),
    ("e", "Utilisateurs partageurs", "individu"),
]


def bloc_h2(reps):
    moy = {c: moyenne([r["q16"][c] for r in reps]) for c in "abcde"}
    individus = moyenne([moy["c"], moy["e"]])
    structures = moyenne([moy["a"], moy["b"], moy["d"]])
    hierarchie = sorted(
        [{"acteur": nom, "note": r2(moy[c]), "type": t} for c, nom, t in ACTEURS],
        key=lambda x: x["note"],
        reverse=True,
    )

    def moy_bord(code, b):
        return moyenne([r["q16"][code] for r in reps if bord(r["politique"]) == b])

    contrastes = [
        {"item": "Blâme des médias traditionnels", "gauche": r2(moy_bord("d", "gauche")), "droite": r2(moy_bord("d", "droite"))},
        {"item": "Responsabilité de l'État", "gauche": r2(moy_bord("b", "gauche")), "droite": r2(moy_bord("b", "droite"))},
        {"item": "Blâme des partageurs", "gauche": r2(moy_bord("e", "gauche")), "droite": r2(moy_bord("e", "droite"))},
    ]
    verdict = "Confirmée" if individus > structures else "Infirmée"
    return {
        "code": "H2",
        "titre": "Qui le public tient-il pour responsable ?",
        "enonce": (
            "Le public attribue davantage une responsabilité individuelle (producteurs, "
            "partageurs) que structurelle (plateformes, État, médias), ce qui fragilise la "
            "légitimité perçue d'une régulation systémique."
        ),
        "verdict": verdict,
        "ecart": {
            "percu": {"label": "Individus", "valeur": r2(individus), "sous": "Moyenne producteurs et partageurs"},
            "reel": {"label": "Structures", "valeur": r2(structures), "sous": "Moyenne plateformes, État, médias"},
            "echelle": 5,
        },
        "hierarchie": hierarchie,
        "contrastes_politiques": contrastes,
        "lecture": (
            "Les répondants chargent d'abord les individus qui produisent et partagent les "
            "contenus, avant les structures qui organisent leur diffusion. Le blâme se déplace "
            "nettement selon le bord politique, surtout sur les médias et l'État."
        ),
    }


# --------------------------------------------------------------------------
# H3
# --------------------------------------------------------------------------
def bloc_h3(reps):
    n = len(reps)
    transparence = sum(1 for r in reps if r["q18"] in (4, 5))
    precis = sum(1 for r in reps if r["dsa"] == "precis")
    note_precis = moyenne([r["q18"] for r in reps if r["dsa"] == "precis"])
    note_malpas = moyenne([r["q18"] for r in reps if r["dsa"] in ("vague", "non")])
    verdict = "Nuancée" if note_precis is not None and note_malpas is not None and note_precis < note_malpas else "À discuter"
    return {
        "code": "H3",
        "titre": "Réguler sans connaître ?",
        "enonce": (
            "La demande de régulation est massive mais déconnectée de la connaissance des "
            "dispositifs : une meilleure connaissance du DSA s'accompagne d'une volonté de "
            "régulation plus mesurée."
        ),
        "verdict": verdict,
        "ecart": {
            "percu": {"label": "Demande de transparence", "valeur": pct(transparence, n), "unite": "%", "sous": "Part jugeant la transparence nécessaire (Q18 ∈ {4,5})"},
            "reel": {"label": "Connaissance précise du DSA", "valeur": pct(precis, n), "unite": "%", "sous": "Part qui en connaît précisément le contenu (Q17)"},
            "echelle": 100,
        },
        "demande_selon_dsa": [
            {"label": "Connaît précisément le DSA", "note": r2(note_precis)},
            {"label": "Connaît mal ou pas le DSA", "note": r2(note_malpas)},
        ],
        "lecture": (
            "La transparence est réclamée très largement, alors qu'une petite minorité connaît "
            "précisément le dispositif européen censé l'imposer. Ceux qui le connaissent le mieux "
            "en demandent un peu moins, signe d'une attente moins inconditionnelle une fois les "
            "dispositifs connus."
        ),
    }


# --------------------------------------------------------------------------
# Verbatims (échantillon nettoyé, non identifiant)
# --------------------------------------------------------------------------
def echantillon_verbatims(reps, cle, n=6):
    vus = []
    for r in reps:
        t = " ".join(r[cle].split())
        if 30 <= len(t) <= 220 and t not in vus:
            vus.append(t)
    if len(vus) <= n:
        return vus
    pas = len(vus) / n
    return [vus[int(i * pas)] for i in range(n)]


# --------------------------------------------------------------------------
# Jeu par répondant (anonymisé) pour les visualisations
# --------------------------------------------------------------------------
def jeu_repondants(reps):
    sortie = []
    for r in reps:
        sortie.append(
            {
                "politique": r["politique"],
                "bord": bord(r["politique"]),
                "age": r["age"],
                "geo": r["geo"],
                "temps": r["temps"],
                "bulle": r["bulle"],
                "exposition": r2(r["exposition"]),
                "hostilite": r2(r["hostilite"]),
                "demande": r["q18"],
                "dsa": r["dsa"],
            }
        )
    return sortie


# --------------------------------------------------------------------------
# Programme principal
# --------------------------------------------------------------------------
def main():
    reps = charger()
    n = len(reps)

    results = {
        "meta": {
            "n": n,
            "statut": "définitif",
            "genere_le": date.today().isoformat(),
            "source": (
                "Enquête en ligne, %d répondants après exclusion des mineurs. "
                "Chiffres calculés par analysis/analyse.py. Les verdicts restent une "
                "interprétation à valider." % n
            ),
        },
        "echantillon": bloc_echantillon(reps),
        "h1": bloc_h1(reps),
        "h2": bloc_h2(reps),
        "h3": bloc_h3(reps),
        "verbatims": {
            "q19": echantillon_verbatims(reps, "q19"),
            "q20": echantillon_verbatims(reps, "q20"),
        },
    }

    repondants = {
        "meta": {"n": n, "genere_le": date.today().isoformat()},
        "labels": {"politique": POLITIQUE_LABELS, "geo": GEO_LABELS},
        "repondants": jeu_repondants(reps),
    }

    DOSSIER_SORTIE.mkdir(parents=True, exist_ok=True)
    (DOSSIER_SORTIE / "results.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (DOSSIER_SORTIE / "respondents.json").write_text(
        json.dumps(repondants, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Récapitulatif console
    print("n =", n)
    print("H1 corrélations :", results["h1"]["correlations"])
    print("H2 individus/structures :", results["h2"]["ecart"]["percu"]["valeur"], "/", results["h2"]["ecart"]["reel"]["valeur"])
    print("H2 hiérarchie :", [(a["acteur"], a["note"]) for a in results["h2"]["hierarchie"]])
    print("H2 contrastes :", results["h2"]["contrastes_politiques"])
    print("H3 transparence/precis :", results["h3"]["ecart"]["percu"]["valeur"], "% /", results["h3"]["ecart"]["reel"]["valeur"], "%")
    print("H3 demande selon DSA :", results["h3"]["demande_selon_dsa"])
    print("Verdicts :", results["h1"]["verdict"], "|", results["h2"]["verdict"], "|", results["h3"]["verdict"])


if __name__ == "__main__":
    main()
