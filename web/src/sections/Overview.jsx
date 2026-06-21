import { Card, EcartMetre, Eyebrow, SectionTitle, StatTile } from '../ui.jsx'

export default function Overview({ data, onNavigate }) {
  const { echantillon, h1, h2a: h2, h3 } = data

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle sub={echantillon.resume}>Profil de l'échantillon</SectionTitle>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {echantillon.indicateurs.map((ind) => (
            <StatTile key={ind.label} valeur={ind.pct} label={ind.label} />
          ))}
        </div>
        <div className="mt-6 space-y-3">
          <Eyebrow>Positionnement politique déclaré</Eyebrow>
          <div className="space-y-2">
            {echantillon.politique.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <span className="w-44 shrink-0 font-body text-sm text-ink-soft">{p.label}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-bg">
                  <div className="h-full rounded-full bg-ink-soft" style={{ width: `${p.pct}%` }} />
                </div>
                <span className="w-10 shrink-0 text-right font-mono text-xs text-muted">{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <Eyebrow>L'écart en un coup d'œil, cliquez pour explorer</Eyebrow>
        <div className="grid gap-4 md:grid-cols-3">
          <EcartMetre
            titre={h1.titre}
            percu={h1.ecart.percu}
            reel={h1.ecart.reel}
            echelle={h1.ecart.echelle}
            cible="H1"
            onClick={() => onNavigate('h1')}
          />
          <EcartMetre
            titre={h2.titre}
            percu={h2.ecart.percu}
            reel={h2.ecart.reel}
            echelle={h2.ecart.echelle}
            cible="H2"
            onClick={() => onNavigate('h2')}
          />
          <EcartMetre
            titre={h3.titre}
            percu={h3.ecart.percu}
            reel={h3.ecart.reel}
            echelle={h3.ecart.echelle}
            cible="H3"
            onClick={() => onNavigate('h3')}
          />
        </div>
      </div>
    </div>
  )
}
