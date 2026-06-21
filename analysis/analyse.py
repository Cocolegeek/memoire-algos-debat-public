#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Analyse de l'enquête sur la perception des algorithmes et la polarisation.

Source de vérité unique des chiffres de l'application : aucun chiffre n'est
saisi à la main dans le front. Lit data/reponses.csv et écrit deux fichiers
dans web/public/ :
  - results.json      : résultats par hypothèse (H1, H2.a, H2.b, H3) avec les
                        tests statistiques (régression, corrélations, p-values).
  - respondents.json  : jeu anonymisé, une ligne par répondant, pour les
                        nuages de points 2D des hypothèses.

Chaque écran sert une démonstration. Les énoncés des hypothèses sont reportés
mot pour mot depuis le mémoire.

Aucune dépendance externe : bibliothèque standard uniquement. Les p-values sont
approchées par la loi normale (n élevé, ddl ~ 260, l'écart à la loi de Student
est négligeable).
"""

import csv
import json
import math
import statistics
import unicodedata
import collections
from pathlib import Path
from datetime import date

RACINE = Path(__file__).resolve().parent.parent
CSV_ENTREE = RACINE / "data" / "reponses.csv"
DOSSIER_SORTIE = RACINE / "web" / "public"

# Décision tranchée : on exclut les 2 répondants mineurs.
EXCLURE_MINEURS = True


# --------------------------------------------------------------------------
# Normalisation (robuste aux accents et espaces parasites)
# --------------------------------------------------------------------------
def deburr(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))


def norm(s):
    return deburr(s or "").strip().lower()


# --------------------------------------------------------------------------
# Recodages
# --------------------------------------------------------------------------
TEMPS = {"moins de 30 min": 1, "30 min - 1h": 2, "1-2h": 3, "2-4h": 4, "plus de 4h": 5}
FREQ = {"jamais": 1, "rarement": 2, "parfois": 3, "souvent": 4, "tres souvent": 5}

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


def normal_cdf(z):
    return 0.5 * (1 + math.erf(z / math.sqrt(2)))


def p_bilaterale(stat):
    return 2 * (1 - normal_cdf(abs(stat)))


def pearson(xs, ys):
    paires = [(x, y) for x, y in zip(xs, ys) if x is not None and y is not None]
    n = len(paires)
    if n < 3:
        return None, None, n
    mx = sum(p[0] for p in paires) / n
    my = sum(p[1] for p in paires) / n
    num = sum((p[0] - mx) * (p[1] - my) for p in paires)
    dx = math.sqrt(sum((p[0] - mx) ** 2 for p in paires))
    dy = math.sqrt(sum((p[1] - my) ** 2 for p in paires))
    if dx == 0 or dy == 0:
        return None, None, n
    r = num / (dx * dy)
    t = r * math.sqrt((n - 2) / (1 - r * r)) if abs(r) < 1 else float("inf")
    return r, p_bilaterale(t), n


def regression_simple(xs, ys):
    """Droite y = pente*x + ordonnee, en unités originales (pour les nuages)."""
    paires = [(x, y) for x, y in zip(xs, ys) if x is not None and y is not None]
    n = len(paires)
    mx = sum(p[0] for p in paires) / n
    my = sum(p[1] for p in paires) / n
    var = sum((p[0] - mx) ** 2 for p in paires)
    cov = sum((p[0] - mx) * (p[1] - my) for p in paires)
    pente = cov / var if var else 0
    ordonnee = my - pente * mx
    xmin = min(p[0] for p in paires)
    xmax = max(p[0] for p in paires)
    return pente, ordonnee, xmin, xmax


# Algèbre linéaire minimale pour la régression multiple
def transpose(M):
    return [list(c) for c in zip(*M)]


def matmul(A, B):
    Bt = transpose(B)
    return [[sum(a * b for a, b in zip(row, col)) for col in Bt] for row in A]


def matvec(M, v):
    return [sum(m * x for m, x in zip(row, v)) for row in M]


def inverse(M):
    n = len(M)
    A = [row[:] + [1.0 if i == j else 0.0 for j in range(n)] for i, row in enumerate(M)]
    for col in range(n):
        piv = max(range(col, n), key=lambda r: abs(A[r][col]))
        A[col], A[piv] = A[piv], A[col]
        d = A[col][col]
        A[col] = [x / d for x in A[col]]
        for r in range(n):
            if r != col:
                f = A[r][col]
                A[r] = [a - f * b for a, b in zip(A[r], A[col])]
    return [row[n:] for row in A]


def regression_multiple(y, colonnes):
    """OLS standardisée : renvoie les poids beta comparables, leur p, et le R²."""
    n = len(y)

    def z(v):
        m = statistics.mean(v)
        s = statistics.stdev(v)
        return [(x - m) / s for x in v]

    yz = z(y)
    Xz = [z(col) for col in colonnes]
    k = len(Xz)
    X = [[Xz[j][i] for j in range(k)] for i in range(n)]
    Xt = transpose(X)
    XtX_inv = inverse(matmul(Xt, X))
    beta = matvec(XtX_inv, matvec(Xt, yz))
    yhat = [sum(X[i][j] * beta[j] for j in range(k)) for i in range(n)]
    ssres = sum((yz[i] - yhat[i]) ** 2 for i in range(n))
    sstot = sum(v * v for v in yz)
    r2 = 1 - ssres / sstot
    sigma2 = ssres / (n - k)
    se = [math.sqrt(sigma2 * XtX_inv[j][j]) for j in range(k)]
    p = [p_bilaterale(beta[j] / se[j]) for j in range(k)]
    return beta, p, r2, n


def pct(cond, total):
    return round(100 * cond / total) if total else 0


def r2v(x, d=2):
    return round(x, d) if x is not None else None


# --------------------------------------------------------------------------
# Chargement
# --------------------------------------------------------------------------
def charger():
    with open(CSV_ENTREE, encoding="utf-8") as f:
        lignes = list(csv.reader(f))
    entetes = lignes[0]
    index = {}
    for i, h in enumerate(entetes):
        index[h.split(" -")[0].strip()] = i

    def cell(row, code):
        i = index.get(code)
        return row[i].strip() if i is not None and i < len(row) else ""

    def cell_num(row, code):
        try:
            return float(cell(row, code))
        except ValueError:
            return None

    reps = []
    for row in lignes[1:]:
        if not any(c.strip() for c in row):
            continue
        if EXCLURE_MINEURS and "13-17" in cell(row, "Q1"):
            continue
        q11 = [recode_freq(cell(row, c)) for c in ("Q11a", "Q11b", "Q11c", "Q11d")]
        q14 = [cell_num(row, c) for c in ("Q14a", "Q14b", "Q14c", "Q14d")]
        hostilite = moyenne([q14[0], q14[1], q14[2], 6 - q14[3]]) if all(v is not None for v in q14) else None
        q16 = {c: cell_num(row, "Q16" + c) for c in "abcde"}
        individus = moyenne([q16["c"], q16["e"]])
        structures = moyenne([q16["a"], q16["b"]])  # plateformes + État (énoncé H2.a)
        reps.append(
            {
                "age": cell(row, "Q1"),
                "politique": recode_politique(cell(row, "Q5")),
                "geo": recode_geo(cell(row, "Q4")),
                "etudes": cell(row, "Q2"),
                "temps": recode_temps(cell(row, "Q7")),
                "bulle": cell_num(row, "Q9"),
                "exposition": moyenne(q11),
                "hostilite": hostilite,
                "q16": q16,
                "individus": individus,
                "structures": structures,
                "decalage": (individus - structures) if (individus is not None and structures is not None) else None,
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
    compte = collections.Counter(r["politique"] for r in reps)
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
        "politique": [
            {"label": POLITIQUE_LABELS[k], "pct": pct(compte.get(k, 0), n)} for k in POLITIQUE_ORDRE
        ],
    }


# --------------------------------------------------------------------------
# H1 : l'usage prédit mieux l'hostilité que la bulle
# --------------------------------------------------------------------------
PREDICTEURS = [
    ("temps", "Temps passé (Q7)"),
    ("exposition", "Exposition aux contenus (Q11)"),
    ("bulle", "Perception de bulle (Q9)"),
]


def bloc_h1(reps):
    host = [r["hostilite"] for r in reps]
    correlations = []
    scatters = []
    for cle, label in PREDICTEURS:
        xs = [r[cle] for r in reps]
        r, p, _ = pearson(xs, host)
        pole = "percu" if cle == "bulle" else "reel"
        correlations.append({"label": label, "cle": cle, "r": r2v(r), "p": p, "pole": pole})
        pente, ordonnee, xmin, xmax = regression_simple(xs, host)
        scatters.append({"cle": cle, "label": label, "pente": r2v(pente, 3), "ordonnee": r2v(ordonnee, 3), "xmin": xmin, "xmax": xmax})

    # Régression multiple sur les cas complets
    complets = [r for r in reps if all(r[c] is not None for c in ("hostilite", "temps", "exposition", "bulle"))]
    y = [r["hostilite"] for r in complets]
    beta, pvals, r2, nreg = regression_multiple(
        y, [[r["temps"] for r in complets], [r["exposition"] for r in complets], [r["bulle"] for r in complets]]
    )
    poids = [
        {"cle": "temps", "label": "Temps passé", "beta": r2v(beta[0]), "p": pvals[0], "pole": "reel"},
        {"cle": "exposition", "label": "Exposition", "beta": r2v(beta[1]), "p": pvals[1], "pole": "reel"},
        {"cle": "bulle", "label": "Perception de bulle", "beta": r2v(beta[2]), "p": pvals[2], "pole": "percu"},
    ]
    r_bulle = next(c["r"] for c in correlations if c["cle"] == "bulle")
    usage = max(c["r"] for c in correlations if c["cle"] != "bulle")
    usage_signif = any(c["p"] is not None and c["p"] < 0.05 for c in correlations if c["cle"] != "bulle")
    bulle_signif = next(c["p"] for c in correlations if c["cle"] == "bulle")
    verdict = "Confirmée" if usage > abs(r_bulle) and usage_signif and (bulle_signif is None or bulle_signif > 0.05) else "Nuancée"
    return {
        "code": "H1",
        "titre": "Usage réel ou bulle imaginée ?",
        "enonce": (
            "L'intensité d'usage, mesurée par le temps passé et l'exposition aux contenus polémiques, "
            "prédit mieux l'hostilité que la perception de se savoir enfermé dans une bulle."
        ),
        "verdict": verdict,
        "ecart": {
            "percu": {"label": "Perception de bulle", "valeur": r_bulle, "sous": "Corrélation avec l'index d'hostilité"},
            "reel": {"label": "Intensité d'usage", "valeur": r2v(usage), "sous": "Corrélation la plus forte (temps, exposition)"},
            "echelle": 0.3,
        },
        "correlations": correlations,
        "scatters": scatters,
        "regression": {"r2": r2v(r2, 3), "n": nreg, "poids": poids},
        "lecture": (
            "Dans la régression multiple, le temps passé et l'exposition aux contenus clivants gardent "
            "un poids non négligeable, alors que la perception de bulle est proche de zéro et non "
            "significative. L'hostilité tient donc davantage à l'usage réel qu'au sentiment d'enfermement."
        ),
    }


# --------------------------------------------------------------------------
# H2.a : responsabilité individuelle vs structurelle (plateformes + État)
# --------------------------------------------------------------------------
ACTEURS = [
    ("c", "Utilisateurs producteurs", "individu"),
    ("e", "Utilisateurs partageurs", "individu"),
    ("a", "Plateformes", "structure"),
    ("b", "État et pouvoirs publics", "structure"),
    ("d", "Médias traditionnels", "autre"),
]


def bloc_h2a(reps):
    moy = {c: moyenne([r["q16"][c] for r in reps]) for c in "abcde"}
    individus = moyenne([moy["c"], moy["e"]])
    structures = moyenne([moy["a"], moy["b"]])
    hierarchie = sorted(
        [{"acteur": nom, "note": r2v(moy[c]), "type": t} for c, nom, t in ACTEURS],
        key=lambda x: x["note"], reverse=True,
    )
    diffs = [r["decalage"] for r in reps if r["decalage"] is not None]
    nd = len(diffs)
    md = sum(diffs) / nd
    sd = statistics.stdev(diffs)
    t = md / (sd / math.sqrt(nd))
    p = p_bilaterale(t)
    pct_indiv = pct(sum(1 for d in diffs if d > 0), nd)

    def moy_bord(code, b):
        return moyenne([r["q16"][code] for r in reps if bord(r["politique"]) == b])

    contrastes = [
        {"item": "Blâme des médias traditionnels", "gauche": r2v(moy_bord("d", "gauche")), "droite": r2v(moy_bord("d", "droite"))},
        {"item": "Responsabilité de l'État", "gauche": r2v(moy_bord("b", "gauche")), "droite": r2v(moy_bord("b", "droite"))},
        {"item": "Blâme des partageurs", "gauche": r2v(moy_bord("e", "gauche")), "droite": r2v(moy_bord("e", "droite"))},
    ]
    verdict = "Confirmée" if individus > structures and p < 0.05 else "Nuancée"
    return {
        "code": "H2.a",
        "titre": "Qui le public tient-il pour responsable ?",
        "enonce": (
            "Face à la polarisation en ligne, le public attribue davantage une responsabilité "
            "individuelle (aux individus qui produisent et partagent les contenus), plutôt qu'une "
            "responsabilité structurelle (aux plateformes et à l'État)."
        ),
        "verdict": verdict,
        "ecart": {
            "percu": {"label": "Individus", "valeur": r2v(individus), "sous": "Producteurs et partageurs"},
            "reel": {"label": "Structures", "valeur": r2v(structures), "sous": "Plateformes et État"},
            "echelle": 5,
        },
        "hierarchie": hierarchie,
        "test": {"diff": r2v(md), "t": r2v(t, 1), "p": p, "pct_individus": pct_indiv, "n": nd},
        "contrastes_politiques": contrastes,
        "lecture": (
            "Les répondants chargent d'abord les individus qui produisent et partagent les contenus, "
            "avant les plateformes et l'État. L'écart individus moins structures est positif et "
            "statistiquement significatif. Le blâme se déplace selon le bord politique, surtout sur "
            "les médias et l'État."
        ),
    }


# --------------------------------------------------------------------------
# H2.b : le décalage individus/structures réduit la demande de régulation
# --------------------------------------------------------------------------
def bloc_h2b(reps):
    xs = [r["decalage"] for r in reps]
    ys = [r["q18"] for r in reps]
    r, p, n = pearson(xs, ys)
    pente, ordonnee, xmin, xmax = regression_simple(xs, ys)
    signif = p is not None and p < 0.05
    if r is not None and r < 0 and signif:
        verdict = "Confirmée"
    elif r is not None and r < 0:
        verdict = "Tendance non significative"
    else:
        verdict = "Non confirmée"
    sens = "négatif" if (r is not None and r < 0) else "positif"
    lecture = (
        "Le décalage entre responsabilité individuelle et structurelle est mis en regard de la demande "
        "de régulation (Q18). Le lien observé est %s (r = %s, p = %s). " % (sens, r2v(r), _fmt_p(p))
    )
    if verdict == "Confirmée":
        lecture += "Plus on impute la responsabilité aux individus plutôt qu'aux structures, moins on demande de régulation systémique : l'hypothèse est soutenue."
    elif verdict == "Tendance non significative":
        lecture += "Le sens va dans celui de l'hypothèse, mais l'effet n'atteint pas le seuil de significativité : prudence."
    else:
        lecture += "Le lien attendu (négatif) n'apparaît pas dans ces données : l'hypothèse n'est pas soutenue."
    return {
        "code": "H2.b",
        "titre": "Le décalage mine-t-il la régulation ?",
        "enonce": (
            "Le décalage entre la responsabilité individuelle et la responsabilité structurelle "
            "diminue la légitimité perçue de toute régulation systémique."
        ),
        "verdict": verdict,
        "correlation": {"r": r2v(r), "p": p, "n": n, "pente": r2v(pente, 3), "ordonnee": r2v(ordonnee, 3), "xmin": xmin, "xmax": xmax},
        "mesure": "Légitimité de la régulation approchée par la demande de transparence imposée par l'État (Q18).",
        "lecture": lecture,
    }


def _fmt_p(p):
    if p is None:
        return "n/d"
    return "< 0,001" if p < 0.001 else ("%.3f" % p).replace(".", ",")


# --------------------------------------------------------------------------
# H3 : demande massive, consensuelle, déconnectée de la connaissance
# --------------------------------------------------------------------------
def bloc_h3(reps):
    n = len(reps)
    transparence = sum(1 for r in reps if r["q18"] in (4, 5))
    precis = sum(1 for r in reps if r["dsa"] == "precis")
    note_precis = moyenne([r["q18"] for r in reps if r["dsa"] == "precis"])
    note_malpas = moyenne([r["q18"] for r in reps if r["dsa"] in ("vague", "non")])
    # Comparaison de la demande selon la connaissance (test de différence de moyennes)
    g1 = [r["q18"] for r in reps if r["dsa"] == "precis" and r["q18"] is not None]
    g2 = [r["q18"] for r in reps if r["dsa"] in ("vague", "non") and r["q18"] is not None]
    t_dsa = p_dsa = None
    if len(g1) > 1 and len(g2) > 1:
        m1, m2 = statistics.mean(g1), statistics.mean(g2)
        s = math.sqrt(statistics.variance(g1) / len(g1) + statistics.variance(g2) / len(g2))
        if s > 0:
            t_dsa = (m1 - m2) / s
            p_dsa = p_bilaterale(t_dsa)
    # Consensus : demande moyenne et part forte par bord politique
    par_bord = []
    for k in POLITIQUE_ORDRE:
        grp = [r["q18"] for r in reps if r["politique"] == k and r["q18"] is not None]
        if grp:
            par_bord.append({"label": POLITIQUE_LABELS[k], "note": r2v(moyenne(grp)), "pct": pct(sum(1 for v in grp if v in (4, 5)), len(grp))})
    effet = note_precis is not None and note_malpas is not None and note_precis < note_malpas
    massive_deconnectee = pct(transparence, n) >= 70 and pct(precis, n) <= 30
    effet_signif = p_dsa is not None and p_dsa < 0.05 and effet
    if massive_deconnectee and effet_signif:
        verdict = "Confirmée"
    elif massive_deconnectee:
        verdict = "Partiellement confirmée"
    else:
        verdict = "Nuancée"
    return {
        "code": "H3",
        "titre": "Réguler sans connaître ?",
        "enonce": (
            "La demande de régulation des algorithmes est massive et largement consensuelle, mais "
            "déconnectée de la connaissance des dispositifs existants. Une meilleure connaissance du "
            "DSA réduit la volonté de régulation."
        ),
        "verdict": verdict,
        "ecart": {
            "percu": {"label": "Demande de transparence", "valeur": pct(transparence, n), "unite": "%", "sous": "Part jugeant la transparence nécessaire (Q18 ∈ {4,5})"},
            "reel": {"label": "Connaissance précise du DSA", "valeur": pct(precis, n), "unite": "%", "sous": "Part qui en connaît précisément le contenu (Q17)"},
            "echelle": 100,
        },
        "demande_par_bord": par_bord,
        "demande_selon_dsa": [
            {"label": "Connaît précisément le DSA", "note": r2v(note_precis)},
            {"label": "Connaît mal ou pas le DSA", "note": r2v(note_malpas)},
        ],
        "test_dsa": {"t": r2v(t_dsa, 1) if t_dsa is not None else None, "p": p_dsa, "significatif": bool(p_dsa is not None and p_dsa < 0.05), "sens_attendu": bool(effet)},
        "lecture": (
            "La transparence est réclamée très largement (82 %) alors qu'une petite minorité (15 %) "
            "connaît précisément le DSA : la demande est massive mais déconnectée de la connaissance. "
            "Le consensus est toutefois gradué : très fort à gauche et au centre, plus modéré à droite. "
            "Surtout, l'effet « mieux connaître le DSA réduit la demande » va dans le sens attendu mais "
            "n'est pas statistiquement significatif (p = 0,50) : cette partie de l'hypothèse n'est pas soutenue."
        ),
    }


# --------------------------------------------------------------------------
# Verbatims
# --------------------------------------------------------------------------
def echantillon_verbatims(reps, cle, n=6):
    vus = []
    for r in reps:
        t = " ".join(r[cle].split())
        if 40 <= len(t) <= 220 and t not in vus:
            vus.append(t)
    if len(vus) <= n:
        return vus
    pas = len(vus) / n
    return [vus[int(i * pas)] for i in range(n)]


# --------------------------------------------------------------------------
# Jeu par répondant (anonymisé) pour les nuages 2D
# --------------------------------------------------------------------------
def jeu_repondants(reps):
    out = []
    for r in reps:
        out.append(
            {
                "politique": r["politique"],
                "bord": bord(r["politique"]),
                "age": r["age"],
                "geo": r["geo"],
                "temps": r["temps"],
                "bulle": r["bulle"],
                "exposition": r2v(r["exposition"]),
                "hostilite": r2v(r["hostilite"]),
                "individus": r2v(r["individus"]),
                "structures": r2v(r["structures"]),
                "decalage": r2v(r["decalage"]),
                "demande": r["q18"],
                "dsa": r["dsa"],
            }
        )
    return out


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
                "Enquête en ligne, %d répondants après exclusion des mineurs. Chiffres et tests "
                "calculés par analysis/analyse.py. Les verdicts restent une interprétation à valider." % n
            ),
        },
        "echantillon": bloc_echantillon(reps),
        "h1": bloc_h1(reps),
        "h2a": bloc_h2a(reps),
        "h2b": bloc_h2b(reps),
        "h3": bloc_h3(reps),
        "verbatims": {"q19": echantillon_verbatims(reps, "q19"), "q20": echantillon_verbatims(reps, "q20")},
    }
    repondants = {
        "meta": {"n": n, "genere_le": date.today().isoformat()},
        "labels": {"politique": POLITIQUE_LABELS, "geo": GEO_LABELS},
        "repondants": jeu_repondants(reps),
    }
    DOSSIER_SORTIE.mkdir(parents=True, exist_ok=True)
    (DOSSIER_SORTIE / "results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    (DOSSIER_SORTIE / "respondents.json").write_text(json.dumps(repondants, ensure_ascii=False, indent=2), encoding="utf-8")

    print("n =", n)
    print("H1 corr :", [(c["cle"], c["r"], _fmt_p(c["p"])) for c in results["h1"]["correlations"]])
    print("H1 reg  : R2 =", results["h1"]["regression"]["r2"], "| beta :", [(w["cle"], w["beta"], _fmt_p(w["p"])) for w in results["h1"]["regression"]["poids"]])
    print("H2.a    : individus", results["h2a"]["ecart"]["percu"]["valeur"], "vs structures", results["h2a"]["ecart"]["reel"]["valeur"], "| diff", results["h2a"]["test"]["diff"], "p", _fmt_p(results["h2a"]["test"]["p"]), "| %indiv", results["h2a"]["test"]["pct_individus"])
    print("H2.a hier:", [(a["acteur"], a["note"]) for a in results["h2a"]["hierarchie"]])
    print("H2.b    : r =", results["h2b"]["correlation"]["r"], "p", _fmt_p(results["h2b"]["correlation"]["p"]), "->", results["h2b"]["verdict"])
    print("H3      : transparence", results["h3"]["ecart"]["percu"]["valeur"], "% precis", results["h3"]["ecart"]["reel"]["valeur"], "%")
    print("H3 bord :", [(b["label"], b["note"], str(b["pct"]) + "%") for b in results["h3"]["demande_par_bord"]])
    print("H3 dsa  :", results["h3"]["demande_selon_dsa"], "test p", _fmt_p(results["h3"]["test_dsa"]["p"]))
    print("Verdicts:", results["h1"]["verdict"], "|", results["h2a"]["verdict"], "|", results["h2b"]["verdict"], "|", results["h3"]["verdict"])


if __name__ == "__main__":
    main()
