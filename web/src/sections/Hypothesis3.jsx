import { BarRow, BigStat, Card, Eyebrow, SectionTitle, Signif } from '../ui.jsx'
import HypoHeader from './HypoHeader.jsx'

export default function Hypothesis3({ data }) {
  const { ecart, demande_par_bord, demande_selon_dsa, test_dsa, lecture } = data

  return (
    <div className="space-y-6">
      <HypoHeader code={data.code} titre={data.titre} enonce={data.enonce} verdict={data.verdict} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle sub="Une demande quasi unanime face à une connaissance rare du dispositif européen.">
            Le grand écart
          </SectionTitle>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <BigStat valeur={ecart.percu.valeur} unite="%" label={ecart.percu.label} sous={ecart.percu.sous} pole="percu" />
            <BigStat valeur={ecart.reel.valeur} unite="%" label={ecart.reel.label} sous={ecart.reel.sous} pole="reel" />
          </div>
        </Card>

        <Card>
          <SectionTitle sub="Demande moyenne de régulation (1 à 5) selon la connaissance du DSA.">
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
                affiche={d.note.toFixed(1).replace('.', ',')}
              />
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-bg p-3 font-mono text-xs text-ink-soft">
            Différence entre les deux groupes : <Signif p={test_dsa.p} />
            {!test_dsa.significatif && (
              <span className="mt-1 block text-muted">
                L'effet « mieux connaître réduit la demande » n'est pas établi statistiquement.
              </span>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle sub="Part jugeant la transparence nécessaire (Q18 ∈ {4,5}) et note moyenne, par bord politique. La demande est forte partout, mais graduée.">
          Une demande consensuelle, mais graduée
        </SectionTitle>
        <div className="mt-4 space-y-1">
          {demande_par_bord.map((d) => (
            <BarRow
              key={d.label}
              label={d.label}
              valeur={d.note}
              echelle={5}
              pole="neutral"
              affiche={`${d.note.toFixed(1).replace('.', ',')} · ${d.pct}%`}
            />
          ))}
        </div>
      </Card>

      <Card>
        <Eyebrow>Lecture</Eyebrow>
        <p className="mt-2 font-body text-sm text-ink-soft">{lecture}</p>
      </Card>
    </div>
  )
}
