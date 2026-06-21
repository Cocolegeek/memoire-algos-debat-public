import { useMemo, useState } from 'react'
import { BarRow, Caption, Card, EcartMetre, Eyebrow, Nuage, SectionTitle, Signif, SegmentToggle } from '../ui.jsx'
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

const INFO_HIERARCHIE = {
  titre: 'Hiérarchie des responsables',
  methodologie:
    "Moyenne simple de la note de responsabilité attribuée à chaque acteur, calculée sur l'ensemble des répondants ayant répondu à l'item correspondant. Aucun test de significativité n'est appliqué ici : il s'agit d'un classement descriptif.",
  donnees: 'Q16a (plateformes), Q16b (État), Q16c (producteurs), Q16d (médias traditionnels), Q16e (partageurs), échelle 1-5. n = 263.',
}

const INFO_ECART_2A = {
  titre: "L'écart individus / structures",
  methodologie:
    'Pour chaque répondant, écart = moyenne(producteurs, partageurs) − moyenne(plateformes, État). Cet écart est ensuite testé contre zéro par un test t pour échantillon apparié (un score par répondant, pas deux groupes indépendants).',
  donnees: 'Q16c, Q16e (individus) et Q16a, Q16b (structures), échelle 1-5. n = 263.',
}

const INFO_CONTRASTES = {
  titre: 'Blâme politiquement orienté',
  methodologie:
    "Moyennes calculées séparément sur le sous-échantillon se déclarant à gauche (Q5 = très à gauche ou plutôt à gauche) et à droite (Q5 = très à droite ou plutôt à droite). Présentation descriptive : aucun test formel de différence entre les deux groupes n'est appliqué sur ce graphique.",
  donnees: 'Q16b, Q16d, Q16e (échelle 1-5) croisées avec Q5 (positionnement politique).',
}

const INFO_NUAGE_2B = {
  titre: 'Décalage et demande de régulation',
  methodologie:
    "Corrélation de Pearson entre le décalage individus moins structures (calculé par répondant, voir H2.a) et la demande de régulation (Q18). La droite corail résume la régression linéaire simple entre les deux variables. Un léger bruit aléatoire décolle les points superposés sans modifier le calcul.",
  donnees: 'Décalage dérivé de Q16a, Q16b, Q16c, Q16e ; demande = Q18 (1-5). n = 263.',
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
            <SectionTitle
              info={INFO_HIERARCHIE}
              sub="Note moyenne de responsabilité (1 à 5). Individus en corail, structures (plateformes, État) en sarcelle, médias à part."
            >
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
            <Caption>
              Les utilisateurs qui produisent et partagent des contenus (corail) arrivent en tête,
              devant les plateformes et l'État (sarcelle). Les médias traditionnels, qui ne relèvent
              ni de l'un ni de l'autre pôle selon l'énoncé de l'hypothèse, sont indiqués à titre de
              comparaison.
            </Caption>
          </Card>

          <Card>
            <SectionTitle
              info={INFO_ECART_2A}
              sub="Comparaison appariée, par répondant, du blâme adressé aux individus et aux structures."
            >
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
            <Caption>
              L'écart-mètre résume l'hypothèse : la note moyenne attribuée aux individus dépasse celle
              attribuée aux structures. Le test apparié, qui compare cet écart au sein de chaque
              répondant plutôt qu'entre deux groupes, confirme qu'il n'est pas dû au hasard.
            </Caption>
          </Card>
        </div>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionTitle info={INFO_CONTRASTES} sub="Le blâme se déplace selon le bord politique déclaré.">
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
          <Caption>
            Lecture descriptive, sans test de significativité associé : l'objectif est de visualiser
            l'ampleur des différences entre bords politiques, pas de les valider statistiquement.
          </Caption>
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
            <SectionTitle
              info={INFO_NUAGE_2B}
              sub="Chaque point est un répondant. En abscisse, le décalage individus moins structures ; en ordonnée, la demande de régulation (Q18)."
            >
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
            <Caption>
              Une pente négative indiquerait que plus un répondant blâme les individus plutôt que les
              structures, moins il demande de régulation systémique : c'est ce que prédit l'hypothèse.
            </Caption>
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
