import { useState } from 'react'
import { BarRow, BigStat, Card, Eyebrow, SectionTitle } from '../ui.jsx'
import HypoHeader from './HypoHeader.jsx'

export default function Hypothesis3({ data }) {
  const [sel, setSel] = useState(null)
  const { ecart, demande_selon_dsa, lecture } = data

  return (
    <div className="space-y-6">
      <HypoHeader code={data.code} titre={data.titre} enonce={data.enonce} verdict={data.verdict} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle>Le grand écart</SectionTitle>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <BigStat
              valeur={ecart.percu.valeur}
              unite="%"
              label={ecart.percu.label}
              sous={ecart.percu.sous}
              pole="percu"
            />
            <BigStat
              valeur={ecart.reel.valeur}
              unite="%"
              label={ecart.reel.label}
              sous={ecart.reel.sous}
              pole="reel"
            />
          </div>
        </Card>

        <Card>
          <SectionTitle sub="Demande moyenne de régulation (1 à 5) selon la connaissance du DSA. Cliquez une barre.">
            Connaître change-t-il la demande ?
          </SectionTitle>
          <div className="mt-4 space-y-1">
            {demande_selon_dsa.map((d) => (
              <BarRow
                key={d.label}
                label={d.label}
                valeur={d.note}
                echelle={5}
                pole={d.label.includes('précisément') ? 'reel' : 'percu'}
                affiche={d.note.toFixed(1)}
                active={sel === d.label}
                onClick={() => setSel(sel === d.label ? null : d.label)}
              />
            ))}
          </div>
          {sel && (
            <p className="mt-3 rounded-lg bg-bg p-3 font-body text-xs text-ink-soft">
              {sel.includes('précisément')
                ? "Ceux qui connaissent précisément le DSA demandent un peu moins de régulation supplémentaire."
                : "Ceux qui connaissent mal le dispositif en réclament le plus, sans toujours savoir ce qui existe déjà."}
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
