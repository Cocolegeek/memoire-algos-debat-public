import { useMemo } from 'react'
import { BarRow, Caption, Card, EcartMetre, Eyebrow, InfoButton, Nuage, SectionTitle, Signif } from '../ui.jsx'
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
  titre: 'Régression multiple',
  methodologie:
    "Régression linéaire multiple (moindres carrés ordinaires) sur variables centrées-réduites : l'hostilité est expliquée simultanément par le temps, l'exposition et la perception de bulle. Les coefficients (β) sont donc directement comparables entre eux. La significativité de chaque β est testée par un test t sur ses propres degrés de liberté.",
  donnees:
    "Mêmes variables que l'écart-mètre, restreintes aux répondants ayant une valeur sur les quatre variables (hostilité, temps, exposition, bulle).",
}

const INFO_NUAGE = (label) => ({
  titre: `Nuage de points : ${label}`,
  methodologie:
    'Régression linéaire simple (moindres carrés) entre la variable et l’index d’hostilité, calculée indépendamment des deux autres facteurs. La droite corail résume la tendance. Un léger bruit aléatoire (« jitter ») est ajouté sur les variables à valeurs entières pour rendre visibles les points superposés ; il ne modifie pas le calcul.',
  donnees: 'Un point par répondant (n = 263), valeurs brutes recodées sur l’échelle 1 à 5.',
})

export default function Hypothesis1({ data, respondents = [] }) {
  const { correlations, ecart, regression, scatters, lecture } = data

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
    <div className="space-y-6">
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
            Le pôle corail (perception de bulle) et le pôle sarcelle (intensité d'usage) représentent
            chacun la corrélation de ce facteur avec l'hostilité mesurée. Plus une barre est longue,
            plus le facteur correspondant est lié à une hostilité plus forte.
          </Caption>
        </Card>

        <Card>
          <SectionTitle
            info={INFO_REGRESSION}
            sub={`Hostilité expliquée par les trois facteurs ensemble. Poids standardisés (β), n = ${regression.n}, R² = ${String(regression.r2).replace('.', ',')}.`}
          >
            Ce qui pèse vraiment
          </SectionTitle>
          <div className="mt-4 space-y-1">
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
            Contrairement aux corrélations simples, ces poids tiennent compte des trois facteurs à la
            fois : ils répondent directement à la question « qui prédit le mieux l'hostilité, une fois
            les autres facteurs neutralisés ? ». Un β non significatif (p ≥ 0,05) ne permet pas de
            conclure à un effet réel de ce facteur.
          </Caption>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {nuages.map((s) => (
          <Card key={s.cle}>
            <div className="flex items-center gap-2">
              <Eyebrow>{s.label}</Eyebrow>
              <InfoButton {...INFO_NUAGE(s.label)} />
            </div>
            <p className="mt-1 mb-2 font-mono text-xs text-ink-soft">
              r = {String(s.r).replace('.', ',')} · <Signif p={s.p} />
            </p>
            <Nuage
              points={s.points}
              droite={s}
              xLabel={s.label.replace(/ \(.*\)/, '')}
              yLabel="Hostilité"
              xDomain={s.cle === 'exposition' ? [1, 5] : [0.5, 5.5]}
            />
            <Caption>
              {s.cle === 'bulle'
                ? 'Le nuage est dispersé sans pente nette : se sentir enfermé dans une bulle ne va pas de pair avec une hostilité plus ou moins forte.'
                : 'La droite, bien que peu inclinée, traduit une tendance positive : plus ce facteur est élevé, plus l\'hostilité moyenne tend à l\'être.'}
            </Caption>
          </Card>
        ))}
      </div>

      <Card>
        <Eyebrow>Lecture</Eyebrow>
        <p className="mt-2 font-body text-sm text-ink-soft">{lecture}</p>
      </Card>
    </div>
  )
}
