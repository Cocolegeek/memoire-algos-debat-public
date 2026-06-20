import { useState } from 'react'
import { BarRow, Card, Eyebrow, SectionTitle, SegmentToggle } from '../ui.jsx'
import HypoHeader from './HypoHeader.jsx'

const FILTRES = [
  { value: 'tous', label: 'Tous' },
  { value: 'gauche', label: 'Gauche' },
  { value: 'droite', label: 'Droite' },
]

export default function Hypothesis2({ data }) {
  const [bord, setBord] = useState('tous')
  const { hierarchie, contrastes_politiques, lecture } = data

  return (
    <div className="space-y-6">
      <HypoHeader code={data.code} titre={data.titre} enonce={data.enonce} verdict={data.verdict} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle sub="Note moyenne de responsabilité (1 à 5). Individus en corail, structures en sarcelle.">
            Hiérarchie des responsables
          </SectionTitle>
          <div className="mt-4 space-y-1">
            {hierarchie.map((a) => (
              <BarRow
                key={a.acteur}
                label={a.acteur}
                valeur={a.note}
                echelle={5}
                pole={a.type === 'individu' ? 'percu' : 'reel'}
                affiche={a.note.toFixed(1)}
              />
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionTitle sub="Le blâme se déplace selon le bord politique déclaré.">
              Un blâme politiquement orienté
            </SectionTitle>
            <SegmentToggle options={FILTRES} value={bord} onChange={setBord} label="Filtre par bord politique" />
          </div>
          <div className="mt-4 space-y-1">
            {contrastes_politiques.map((c) => (
              <BarRow
                key={c.item}
                label={c.item}
                valeur={valeurSelon(c, bord)}
                echelle={5}
                pole="neutral"
                affiche={valeurSelon(c, bord).toFixed(1)}
                sous={bord === 'tous' ? `Gauche ${c.gauche.toFixed(1)} · Droite ${c.droite.toFixed(1)}` : undefined}
              />
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <Eyebrow>Lecture</Eyebrow>
        <p className="mt-2 font-body text-sm text-ink-soft">{lecture}</p>
      </Card>
    </div>
  )
}

function valeurSelon(c, bord) {
  if (bord === 'gauche') return c.gauche
  if (bord === 'droite') return c.droite
  return Number(((c.gauche + c.droite) / 2).toFixed(2))
}
