import { useMemo } from 'react'
import { BarRow, Card, EcartMetre, Eyebrow, Nuage, SectionTitle, Signif } from '../ui.jsx'
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
          <SectionTitle sub="Synthèse : le lien avec l'hostilité est quasi nul pour la bulle, plus net pour l'usage.">
            L'écart-mètre
          </SectionTitle>
          <div className="mt-5">
            <EcartMetre percu={ecart.percu} reel={ecart.reel} echelle={ecart.echelle} />
          </div>
        </Card>

        <Card>
          <SectionTitle sub={`Régression multiple : hostilité expliquée par les trois facteurs ensemble. Poids standardisés (β), n = ${regression.n}, R² = ${String(regression.r2).replace('.', ',')}.`}>
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
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {nuages.map((s) => (
          <Card key={s.cle}>
            <Eyebrow>{s.label}</Eyebrow>
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
