import { BORD_COULEURS, Card, EcartMetre, Eyebrow, SectionTitle, StatTile } from '../ui.jsx'

export default function Overview({ data, onNavigate }) {
  const { echantillon, h1, h2a: h2, h3 } = data

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <SectionTitle sub={echantillon.resume}>Profil de l'échantillon</SectionTitle>
          <a
            href={import.meta.env.BASE_URL + 'reponses.csv'}
            download
            title="Télécharger les données brutes anonymisées (CSV)"
            aria-label="Télécharger les données brutes anonymisées (CSV)"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition hover:border-ink-soft hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0-4-4m4 4 4-4M5 19h14" />
            </svg>
          </a>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {echantillon.indicateurs.map((ind) => (
            <StatTile key={ind.label} valeur={ind.pct} label={ind.label} />
          ))}
        </div>
        <div className="mt-6 space-y-3">
          <Eyebrow>Positionnement politique déclaré</Eyebrow>
          <div className="space-y-2.5">
            {echantillon.politique.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <span className="w-44 shrink-0 font-body text-sm text-ink-soft">{p.label}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-bg">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${p.pct}%`, backgroundColor: BORD_COULEURS[p.cle] ?? BORD_COULEURS.autre }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-mono text-xs text-muted">{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <Eyebrow>L'écart en un coup d'œil, cliquez pour explorer</Eyebrow>
        <div className="grid gap-6 md:grid-cols-3">
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
