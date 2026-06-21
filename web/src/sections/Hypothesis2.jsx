import { useMemo, useState } from 'react'
import { BarRow, Card, EcartMetre, Eyebrow, Nuage, SectionTitle, Signif, SegmentToggle } from '../ui.jsx'
import HypoHeader from './HypoHeader.jsx'

const FILTRES = [
  { value: 'tous', label: 'Tous' },
  { value: 'gauche', label: 'Gauche' },
  { value: 'droite', label: 'Droite' },
]

const POLE = { individu: 'percu', structure: 'reel', autre: 'neutral' }

function frac(i) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export default function Hypothesis2({ a, b, respondents = [] }) {
  const [bord, setBord] = useState('tous')

  const pointsB = useMemo(
    () =>
      respondents
        .filter((r) => r.decalage != null && r.demande != null)
        .map((r, i) => ({
          x: r.decalage + (frac(i) * 0.3 - 0.15),
          y: r.demande + (frac(i + 7) * 0.5 - 0.25),
        })),
    [respondents]
  )

  return (
    <div className="space-y-12">
      {/* ---- H2.a ---- */}
      <section className="space-y-6">
        <HypoHeader code={a.code} titre={a.titre} enonce={a.enonce} verdict={a.verdict} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <SectionTitle sub="Note moyenne de responsabilité (1 à 5). Individus en corail, structures (plateformes, État) en sarcelle, médias à part.">
              Hiérarchie des responsables
            </SectionTitle>
            <div className="mt-4 space-y-1">
              {a.hierarchie.map((acteur) => (
                <BarRow
                  key={acteur.acteur}
                  label={acteur.acteur}
                  valeur={acteur.note}
                  echelle={5}
                  pole={POLE[acteur.type]}
                  affiche={acteur.note.toFixed(1).replace('.', ',')}
                />
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle sub="Comparaison appariée, par répondant, du blâme adressé aux individus et aux structures.">
              L'écart individus / structures
            </SectionTitle>
            <div className="mt-5">
              <EcartMetre percu={a.ecart.percu} reel={a.ecart.reel} echelle={a.ecart.echelle} />
            </div>
            <div className="mt-4 rounded-lg bg-bg p-3 font-mono text-xs text-ink-soft">
              Écart moyen = {String(a.test.diff).replace('.', ',')} point · <Signif p={a.test.p} />
              <br />
              {a.test.pct_individus}% des répondants blâment davantage les individus (n = {a.test.n}).
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionTitle sub="Le blâme se déplace selon le bord politique déclaré.">
              Un blâme politiquement orienté
            </SectionTitle>
            <SegmentToggle options={FILTRES} value={bord} onChange={setBord} label="Filtre par bord politique" />
          </div>
          <div className="mt-4 space-y-1">
            {a.contrastes_politiques.map((c) => {
              const val = bord === 'gauche' ? c.gauche : bord === 'droite' ? c.droite : Number(((c.gauche + c.droite) / 2).toFixed(2))
              return (
                <BarRow
                  key={c.item}
                  label={c.item}
                  valeur={val}
                  echelle={5}
                  pole="neutral"
                  affiche={val.toFixed(1).replace('.', ',')}
                  sous={bord === 'tous' ? `Gauche ${String(c.gauche).replace('.', ',')} · Droite ${String(c.droite).replace('.', ',')}` : undefined}
                />
              )
            })}
          </div>
        </Card>

        <Card>
          <Eyebrow>Lecture</Eyebrow>
          <p className="mt-2 font-body text-sm text-ink-soft">{a.lecture}</p>
        </Card>
      </section>

      {/* ---- H2.b ---- */}
      <section className="space-y-6 border-t border-line pt-10">
        <HypoHeader code={b.code} titre={b.titre} enonce={b.enonce} verdict={b.verdict} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <SectionTitle sub="Chaque point est un répondant. En abscisse, le décalage individus moins structures ; en ordonnée, la demande de régulation (Q18).">
              Décalage et demande de régulation
            </SectionTitle>
            <div className="mt-4">
              <Nuage
                points={pointsB}
                droite={b.correlation}
                xLabel="Décalage individus − structures"
                yLabel="Demande"
                xDomain={[-4, 4]}
                yDomain={[1, 5]}
              />
            </div>
          </Card>

          <Card>
            <SectionTitle>Le test</SectionTitle>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-bg p-3 font-mono text-xs text-ink-soft">
                Corrélation r = {String(b.correlation.r).replace('.', ',')} · <Signif p={b.correlation.p} /> (n = {b.correlation.n})
              </div>
              <p className="font-body text-xs text-muted">{b.mesure}</p>
              <p className="font-body text-sm text-ink-soft">{b.lecture}</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
