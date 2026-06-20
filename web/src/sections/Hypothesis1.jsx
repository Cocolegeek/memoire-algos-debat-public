import { useState } from 'react'
import { BarRow, Card, EcartMetre, Eyebrow, SectionTitle } from '../ui.jsx'
import HypoHeader from './HypoHeader.jsx'

export default function Hypothesis1({ data }) {
  const [sel, setSel] = useState(null)
  const { correlations, ecart, lecture } = data
  const max = ecart.echelle

  return (
    <div className="space-y-6">
      <HypoHeader code={data.code} titre={data.titre} enonce={data.enonce} verdict={data.verdict} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle sub="Perception de bulle contre intensité d'usage, mesurées par leur lien avec l'hostilité.">
            L'écart-mètre
          </SectionTitle>
          <div className="mt-5">
            <EcartMetre percu={ecart.percu} reel={ecart.reel} echelle={ecart.echelle} />
          </div>
        </Card>

        <Card>
          <SectionTitle sub="Corrélation de chaque facteur avec l'index d'hostilité. Échelle 0 à 0,3. Cliquez une barre.">
            Ce qui prédit l'hostilité
          </SectionTitle>
          <div className="mt-4 space-y-1">
            {correlations.map((c) => (
              <BarRow
                key={c.label}
                label={c.label}
                valeur={c.r}
                echelle={max}
                pole={c.pole}
                affiche={`r = ${c.r.toFixed(2)}`}
                active={sel === c.label}
                onClick={() => setSel(sel === c.label ? null : c.label)}
              />
            ))}
          </div>
          {sel && (
            <p className="mt-3 rounded-lg bg-bg p-3 font-body text-xs text-ink-soft">
              {describe(sel)}
            </p>
          )}
        </Card>
      </div>

      <Card>
        <Eyebrow>Lecture</Eyebrow>
        <p className="mt-2 font-body text-sm text-ink-soft">{lecture}</p>
      </Card>
    </div>
  )
}

function describe(label) {
  if (label.includes('bulle'))
    return "Corrélation quasi nulle : se sentir dans une bulle ne va pas de pair avec une hostilité plus forte."
  if (label.includes('Temps'))
    return "Plus le temps passé est élevé, plus l'hostilité tend à l'être, mais le lien reste modéré."
  return "L'exposition aux contenus clivants montre le lien le plus fort des trois facteurs testés."
}
