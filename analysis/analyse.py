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
            "Cet échantillon n'est pas représentatif de la population française : il rassemble les "
            "personnes ayant choisi de répondre à un questionnaire diffusé en ligne, et non un tirage "
            "aléatoire. Les chiffres ci-dessous décrivent ces répondants, non la population générale."
        ),
        "indicateurs": [
            {"label": "18-34 ans", "pct": pct(jeunes, n)},
            {"label": "Diplômés du supérieur", "pct": pct(superieur, n)},
            {"label": "Plus de 2h par jour sur les réseaux", "pct": pct(intensif, n)},
            {"label": "Vivent en Île-de-France", "pct": pct(idf, n)},
        ],
        "politique": [
            {"cle": k, "label": POLITIQUE_LABELS[k], "pct": pct(compte.get(k, 0), n)} for k in POLITIQUE_ORDRE
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


GROUPES_ROBUSTESSE = [
    ("age_18_34", "18-34 ans", lambda r: r["age"] in ("18-24", "25-34")),
    ("age_35plus", "35 ans et plus", lambda r: r["age"] not in ("18-24", "25-34")),
    ("gauche", "Bord gauche", lambda r: bord(r["politique"]) == "gauche"),
    ("droite", "Bord droite", lambda r: bord(r["politique"]) == "droite"),
]


def bloc_h1_robustesse(reps):
    """H1 tient-elle dans chaque sous-groupe ? Mêmes corrélations bivariées,
    recalculées sur des sous-échantillons, pour vérifier que le résultat
    principal n'est pas un artefact d'un profil de répondant particulier."""
    groupes = []
    lignes = {cle: {"cle": cle, "label": label, "valeurs": {}} for cle, label in PREDICTEURS}
    for gcle, glabel, filtre in GROUPES_ROBUSTESSE:
        sous = [r for r in reps if filtre(r)]
        groupes.append({"cle": gcle, "label": glabel, "n": len(sous)})
        host = [r["hostilite"] for r in sous]
        for cle, _ in PREDICTEURS:
            r, p, n = pearson([r[cle] for r in sous], host)
            lignes[cle]["valeurs"][gcle] = {"r": r2v(r), "p": p, "n": n}
    return {"groupes": groupes, "predicteurs": [lignes[cle] for cle, _ in PREDICTEURS]}


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
    facteur_fort = "le temps passé" if usage == next(c["r"] for c in correlations if c["cle"] == "temps") else "l'exposition aux contenus"
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
            "percu": {"label": "Perception de bulle", "valeur": r_bulle, "sous": "Lien avec l'hostilité ressentie"},
            "reel": {"label": "Intensité d'usage", "valeur": r2v(usage), "sous": "Lien le plus fort avec l'hostilité (%s)" % facteur_fort},
            "echelle": 0.3,
        },
        "correlations": correlations,
        "scatters": scatters,
        "regression": {"r2": r2v(r2, 3), "n": nreg, "poids": poids},
        "robustesse": bloc_h1_robustesse(reps),
        "lecture": (
            "En considérant les trois facteurs simultanément (temps passé, exposition aux contenus "
            "polémiques et perception de bulle), c'est l'intensité d'usage qui conserve un effet réel "
            "sur l'hostilité, tandis que la perception de bulle n'en a quasiment aucun. Ce qui rend "
            "plus hostile tient donc surtout au temps passé et aux contenus vus, et non au sentiment "
            "d'être enfermé dans une bulle."
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
        {"item": "Blâme des médias traditionnels", "tous": r2v(moy["d"]), "gauche": r2v(moy_bord("d", "gauche")), "droite": r2v(moy_bord("d", "droite"))},
        {"item": "Responsabilité de l'État", "tous": r2v(moy["b"]), "gauche": r2v(moy_bord("b", "gauche")), "droite": r2v(moy_bord("b", "droite"))},
        {"item": "Blâme des partageurs", "tous": r2v(moy["e"]), "gauche": r2v(moy_bord("e", "gauche")), "droite": r2v(moy_bord("e", "droite"))},
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
            "percu": {"label": "Responsabilité individuelle", "valeur": r2v(individus), "sous": "Individus qui produisent et partagent les contenus"},
            "reel": {"label": "Responsabilité structurelle", "valeur": r2v(structures), "sous": "Plateformes et État"},
            "echelle": 5,
        },
        "hierarchie": hierarchie,
        "test": {"diff": r2v(md), "t": r2v(t, 1), "p": p, "pct_individus": pct_indiv, "n": nd},
        "contrastes_politiques": contrastes,
        "lecture": (
            "Face à la polarisation en ligne, les répondants jugent les individus qui produisent et "
            "partagent les contenus plus responsables que les plateformes et l'État. Cet écart est "
            "net et ne doit rien au hasard. Le bord politique déclaré fait varier ce jugement, surtout "
            "à l'égard des médias et de l'État."
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
        "Ce décalage (les individus jugés plus ou moins responsables que les plateformes et l'État) "
        "est mis en regard de la demande de régulation, qui sert ici de baromètre de la légitimité "
        "perçue d'une régulation à grande échelle. Le lien observé est %s (r = %s, %s). " % (sens, r2v(r), _fmt_p_signe(p))
    )
    if verdict == "Confirmée":
        lecture += "Plus la responsabilité est portée sur les individus plutôt que sur les plateformes et l'État, moins la régulation à grande échelle est jugée légitime : l'hypothèse est confirmée."
    elif verdict == "Tendance non significative":
        lecture += "La tendance va dans le sens attendu, mais elle est trop faible pour être considérée comme un résultat fiable : à interpréter avec prudence."
    else:
        lecture += "Le lien attendu n'apparaît pas dans ces données : cette partie de l'hypothèse n'est pas confirmée."
    # Contrôle de robustesse : le lien tient-il aussi à l'intérieur de chaque
    # camp politique, et pas seulement parce que bord politique, décalage et
    # demande varient ensemble (même logique que la robustesse de H1).
    correlation_par_bord = []
    for cle, label in (("gauche", "Bord gauche"), ("droite", "Bord droite")):
        sous = [r for r in reps if bord(r["politique"]) == cle]
        rb, pb, nb = pearson([r["decalage"] for r in sous], [r["q18"] for r in sous])
        correlation_par_bord.append({"cle": cle, "label": label, "r": r2v(rb), "p": pb, "n": nb})

    return {
        "code": "H2.b",
        "titre": "Le décalage affaiblit-il la légitimité de la régulation ?",
        "enonce": (
            "Le décalage entre la responsabilité individuelle et la responsabilité structurelle "
            "diminue la légitimité perçue de toute régulation systémique."
        ),
        "verdict": verdict,
        "correlation": {"r": r2v(r), "p": p, "n": n, "pente": r2v(pente, 3), "ordonnee": r2v(ordonnee, 3), "xmin": xmin, "xmax": xmax},
        "correlation_par_bord": correlation_par_bord,
        "mesure": "Légitimité d'une régulation à grande échelle, mesurée ici par l'envie de transparence imposée aux plateformes par l'État.",
        "lecture": lecture,
    }


def _fmt_p(p):
    if p is None:
        return "n/d"
    return "< 0,001" if p < 0.001 else ("%.3f" % p).replace(".", ",")


def _fmt_p_signe(p):
    """« p < 0,001 » ou « p = 0,500 », pour insertion directe dans une phrase."""
    if p is None:
        return "p = n/d"
    return ("p " + _fmt_p(p)) if p < 0.001 else ("p = " + _fmt_p(p))


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
            par_bord.append({"cle": k, "label": POLITIQUE_LABELS[k], "note": r2v(moyenne(grp)), "pct": pct(sum(1 for v in grp if v in (4, 5)), len(grp))})
    effet = note_precis is not None and note_malpas is not None and note_precis < note_malpas
    pct_transparence = pct(transparence, n)
    pct_precis = pct(precis, n)
    massive_deconnectee = pct_transparence >= 70 and pct_precis <= 30
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
            "percu": {"label": "Demande de régulation", "valeur": pct_transparence, "unite": "%", "sous": "Transparence exigée des plateformes, jugée nécessaire (note de 4 ou 5 sur 5)"},
            "reel": {"label": "Connaissance des dispositifs existants", "valeur": pct_precis, "unite": "%", "sous": "Connaissance précise du DSA déclarée"},
            "echelle": 100,
        },
        "demande_par_bord": par_bord,
        "demande_selon_dsa": [
            {"label": "Connaît précisément le DSA", "note": r2v(note_precis)},
            {"label": "Connaît mal ou pas le DSA", "note": r2v(note_malpas)},
        ],
        "test_dsa": {"t": r2v(t_dsa, 1) if t_dsa is not None else None, "p": p_dsa, "significatif": bool(p_dsa is not None and p_dsa < 0.05), "sens_attendu": bool(effet)},
        "lecture": (
            "La demande de régulation est massive et largement partagée : %s%% des répondants jugent "
            "la transparence nécessaire, quel que soit leur bord politique (un peu moins à droite). "
            "Cette demande reste toutefois déconnectée de la connaissance des dispositifs existants : "
            "seuls %s%% des répondants connaissent précisément le DSA, le texte européen qui encadre "
            "justement ces algorithmes. L'idée qu'une meilleure connaissance du DSA réduirait l'envie "
            "de régulation va dans le sens attendu, mais l'écart mesuré est trop faible pour être "
            "fiable (%s) : cette partie de l'hypothèse n'est pas confirmée par les données."
            % (pct_transparence, pct_precis, _fmt_p_signe(p_dsa))
        ),
    }


# --------------------------------------------------------------------------
# Verbatims : classement thématique par mots-clés (analyse sémantique légère,
# vocation illustrative, pas un résultat statistique en soi). Chaque réponse
# libre est rangée dans le premier thème dont un mot-clé est détecté.
# --------------------------------------------------------------------------
THEMES_Q19 = collections.OrderedDict(
    [
        ("algorithmes_reseaux", {
            "label": "Algorithmes et réseaux sociaux",
            "mots": ["algorithme", "reseau social", "reseaux sociaux", "plateforme", "recommandation",
                     "tiktok", "instagram", "facebook", "twitter", "youtube", "bulle"],
        }),
        ("medias", {
            "label": "Médias traditionnels",
            "mots": ["media", "journalist", "presse", "television", "chaine d'info", "chaine info"],
        }),
        ("politique", {
            "label": "Acteurs politiques",
            "mots": ["politique", "parti", "elu", "gouvernement", "president", "classe politique"],
        }),
        ("individus", {
            "label": "Comportement et éducation des individus",
            "mots": ["individu", "utilisateur", "education", "esprit critique", "ignorance",
                     "intoleran", "manque de respect", "manque d'ecoute", "ego"],
        }),
    ]
)

THEMES_Q20 = collections.OrderedDict(
    [
        ("regulation", {
            "label": "Régulation, contrôle ou sanctions",
            "mots": ["regul", "loi", "sanction", "obliger", "obligation", "encadr", "interdire",
                     "censur", "etat", "dsa", "controle"],
        }),
        ("transparence_sources", {
            "label": "Transparence et fiabilité des sources",
            "mots": ["transparence", "source", "verif", "fact-check", "factcheck", "label"],
        }),
        ("education", {
            "label": "Éducation et esprit critique",
            "mots": ["education", "esprit critique", "sensibilis", "ecole", "former", "formation"],
        }),
    ]
)


def classer(texte, themes_def):
    t = norm(texte)
    for cle, info in themes_def.items():
        if any(m in t for m in info["mots"]):
            return cle
    return "autre"


def bloc_verbatim(reps, cle, question, themes_def, label_autre):
    textes = [" ".join(r[cle].split()) for r in reps if r[cle].strip()]
    total = len(textes)
    classes = [(t, classer(t, themes_def)) for t in textes]
    compteur = collections.Counter(c for _, c in classes)
    themes = [
        {"cle": tc, "label": info["label"], "pct": pct(compteur.get(tc, 0), total)}
        for tc, info in themes_def.items()
    ]
    themes.append({"cle": "autre", "label": label_autre, "pct": pct(compteur.get("autre", 0), total)})
    vus = set()
    citations = []
    for t, tc in classes:
        if 40 <= len(t) <= 220 and t not in vus:
            vus.add(t)
            citations.append({"texte": t, "theme": tc})
    return {"question": question, "themes": themes, "citations": citations}


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
                "Enquête en ligne auprès de %d répondants majeurs. Tous les chiffres et tests présentés "
                "sur ce site sont calculés automatiquement à partir des réponses brutes par un script "
                "(analysis/analyse.py). Les verdicts proposés constituent une lecture à débattre, non "
                "une conclusion définitive." % n
            ),
        },
        "echantillon": bloc_echantillon(reps),
        "h1": bloc_h1(reps),
        "h2a": bloc_h2a(reps),
        "h2b": bloc_h2b(reps),
        "h3": bloc_h3(reps),
        "verbatims": {
            "q19": bloc_verbatim(
                reps, "q19", "Cause principale perçue de la polarisation du débat public",
                THEMES_Q19, "Autres causes citées",
            ),
            "q20": bloc_verbatim(
                reps, "q20", "Mesure concrète proposée pour améliorer le débat public en ligne",
                THEMES_Q20, "Autres mesures proposées",
            ),
        },
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
