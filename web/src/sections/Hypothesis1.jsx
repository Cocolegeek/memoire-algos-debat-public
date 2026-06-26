import { useMemo } from 'react'
import { BarRow, Caption, Card, EcartMetre, Eyebrow, InfoButton, Nuage, SectionTitle, Signif, TableRobustesse } from '../ui.jsx'
import HypoHeader from './HypoHeader.jsx'

function frac(i) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function pointsPour(respondents, cle, jitter) {
  return respondents
    .filter((r) => r[cle] != null && r.hostilite != null)
    .map((r, i) => ({ x: jitter ? r[cle] + (frac(i) * 0.5 - 0.25) : r[cle], y: r.hostilite }))
}

const INFO_ECART = {
  titre: "L'écart-mètre H1",
  methodologie:
    "Corrélation de Pearson (r) entre l'index d'hostilité et, d'une part, la perception de bulle (Q9), d'autre part la plus forte des deux mesures d'usage (temps, exposition). L'écart-mètre affiche la valeur absolue de chaque r sur une échelle commune de 0 à 0,3.",
  donnees:
    "Index d'hostilité = moyenne(Q14a, Q14b, Q14c, 6 − Q14d), Q14d étant inversé. Q9 (perception de bulle, 1-5), Q7 (temps recodé 1-5), Q11a-d (exposition, moyenne recodée 1-5). n = 263.",
}

const INFO_REGRESSION = {
  titre: 'Ce qui pèse vraiment',
  methodologie:
    "Régression linéaire multiple (moindres carrés ordinaires) sur variables centrées-réduites : l'hostilité est expliquée simultanément par le temps passé, l'exposition aux contenus polémiques et la perception de bulle. Les coefficients (β) sont donc directement comparables entre eux. La significativité de chaque β est testée par un test t sur ses propres degrés de liberté.",
  donnees:
    "Mêmes variables que l'écart-mètre, restreintes aux répondants ayant une valeur sur les quatre variables (hostilité, temps, exposition, bulle).",
}

const INFO_ROBUSTESSE = {
  titre: 'H1 est-elle stable selon le profil ?',
  methodologie:
    "Mêmes corrélations bivariées que ci-dessus (Pearson, prédicteur contre index d'hostilité), recalculées indépendamment sur quatre sous-échantillons : les deux tranches d'âge les plus représentées et les deux bords politiques. Vérifie que le résultat principal n'est pas un artefact d'un seul profil de répondant. Les sous-échantillons étant plus petits, la puissance statistique est plus faible : une corrélation qui n'atteint pas la significativité dans un sous-groupe peut simplement refléter un n réduit.",
  donnees: 'Mêmes variables que la régression (Q7, Q11, Q9, index d\'hostilité), croisées avec Q1 (âge) et Q5 (bord politique).',
}

const INFO_NUAGE = (label) => ({
  titre: `${label} et l'hostilité`,
  methodologie:
    "Régression linéaire simple (moindres carrés) entre la variable et l'index d'hostilité, calculée indépendamment des deux autres facteurs. La droite orange résume la tendance. Un léger bruit aléatoire (« jitter ») est ajouté sur les variables à valeurs entières pour rendre visibles les points superposés ; il ne modifie pas le calcul.",
  donnees: "Un point par répondant (n = 263), valeurs brutes recodées sur l'échelle 1 à 5.",
})

export default function Hypothesis1({ data, respondents = [] }) {
  const { correlations, ecart, regression, scatters, robustesse, lecture } = data

  const nuages = useMemo(
    () =>
      scatters.map((s) => ({
        ...s,
        points: pointsPour(respondents, s.cle, s.cle !== 'exposition'),
        r: correlations.find((c) => c.cle === s.cle)?.r,
        p: correlations.find((c) => c.cle === s.cle)?.p,
      })),
    [scatters, correlations, respondents]
  )

  return (
    <div className="space-y-8">
      <HypoHeader code={data.code} titre={data.titre} enonce={data.enonce} verdict={data.verdict} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle
            info={INFO_ECART}
            sub="Synthèse : le lien avec l'hostilité est quasi nul pour la bulle, plus net pour l'usage."
          >
            L'écart-mètre
          </SectionTitle>
          <div className="mt-5">
            <EcartMetre percu={ecart.percu} reel={ecart.reel} echelle={ecart.echelle} />
          </div>
          <Caption>
            Le pôle orange (perception de bulle) et le pôle vert (intensité d'usage) montrent chacun
            le lien entre ce facteur et l'hostilité mesurée. Plus une barre est longue, plus ce facteur
            est associé à une hostilité forte.
          </Caption>
        </Card>

        <Card>
          <SectionTitle
            info={INFO_REGRESSION}
            sub={`Quel facteur pèse le plus sur l'hostilité une fois les deux autres neutralisés ? n = ${regression.n} ; le modèle explique environ ${Math.round(regression.r2 * 100)} % de l'hostilité observée.`}
          >
            Ce qui pèse vraiment
          </SectionTitle>
          <div className="mt-4 space-y-2">
            {regression.poids.map((w) => (
              <div key={w.cle}>
                <BarRow label={w.label} valeur={Math.abs(w.beta)} echelle={0.3} pole={w.pole} affiche={`β = ${String(w.beta).replace('.', ',')}`} />
                <div className="px-3 pb-2">
                  <Signif p={w.p} />
                </div>
              </div>
            ))}
          </div>
          <Caption>
            Le poids (β) de chaque facteur tient compte des deux autres en même temps, donc on peut les
            comparer directement : plus β est élevé, plus ce facteur pèse sur l'hostilité, à profil
            comparable sur les deux autres. Le détail facteur par facteur suit plus bas.
          </Caption>
        </Card>
      </div>

      <Card>
        <SectionTitle sub="Chaque facteur pris isolément, sans tenir compte des deux autres.">
          Chaque facteur face à l'hostilité
        </SectionTitle>
        <p className="mt-2 font-body text-sm text-ink-soft">
          <strong>r</strong> mesure l'intensité du lien entre ce facteur et l'hostilité (de -1 à 1 ;
          plus la valeur s'éloigne de zéro, plus le lien est marqué). <strong>p</strong> indique la
          fiabilité de ce lien : en dessous de 0,05, il est considéré comme probablement réel plutôt
          que dû au hasard.
        </p>
        <div className="mt-6 space-y-8 divide-y divide-line">
          {nuages.map((s) => (
            <div key={s.cle} className="pt-8 first:pt-0">
              <div className="flex items-center gap-2">
                <Eyebrow>{s.label}</Eyebrow>
                <InfoButton {...INFO_NUAGE(s.label)} />
              </div>
              <p className="mt-1 mb-3 font-mono text-xs text-ink-soft">
                r = {String(s.r).replace('.', ',')} · <Signif p={s.p} />
              </p>
              <Nuage
                points={s.points}
                droite={s}
                xLabel={s.label.replace(/ \(.*\)/, '')}
                yLabel="Hostilité ressentie"
                xDomain={s.cle === 'exposition' ? [1, 5] : [0.5, 5.5]}
                xTicks={[1, 2, 3, 4, 5]}
                yTicks={[1, 2, 3, 4, 5]}
                height={300}
              />
              <Caption>
                {s.cle === 'bulle'
                  ? 'Les points sont dispersés sans tendance nette : se sentir enfermé dans une bulle ne va pas de pair avec une hostilité plus ou moins marquée.'
                  : "La droite, bien que peu inclinée, traduit une tendance positive : plus ce facteur est élevé, plus l'hostilité moyenne tend à l'être également."}
              </Caption>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle
          info={INFO_ROBUSTESSE}
          sub="Les mêmes corrélations, recalculées séparément par tranche d'âge et par bord politique."
        >
          H1 est-elle stable selon le profil ?
        </SectionTitle>
        <div className="mt-4">
          <TableRobustesse groupes={robustesse.groupes} predicteurs={robustesse.predicteurs} />
        </div>
        <Caption>
          La perception de bulle ne ressort jamais comme significative dans aucun de ces groupes, ce
          qui renforce la conclusion principale. Le lien avec l'usage (temps, exposition) reste positif
          partout, mais n'est net que dans certains groupes : avec moins de répondants par groupe, cela
          reste attendu et appelle à la prudence plutôt qu'à une remise en cause du résultat principal.
        </Caption>
      </Card>

      <Card>
        <Eyebrow>Lecture</Eyebrow>
        <p className="mt-2 font-body text-sm text-ink-soft">{lecture}</p>
      </Card>
    </div>
  )
}
