import { useMemo, useState } from 'react'
import { BarRow, BORD_COULEURS, Caption, Card, EcartMetre, Eyebrow, Nuage, SectionTitle, Signif, SegmentToggle } from '../ui.jsx'
import HypoHeader from './HypoHeader.jsx'

const FILTRES = [
  { value: 'tous', label: 'Tous' },
  { value: 'gauche', label: 'Gauche' },
  { value: 'droite', label: 'Droite' },
]

const LABELS_BORD = {
  extreme_gauche: 'Très à gauche',
  gauche: 'Plutôt à gauche',
  centre: 'Plutôt au centre',
  droite: 'Plutôt à droite',
  extreme_droite: 'Très à droite',
  autre: 'Ne se positionne pas',
}

const POLE = { individu: 'percu', structure: 'reel', autre: 'neutral' }

function frac(i) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const INFO_HIERARCHIE = {
  titre: 'Hiérarchie des responsables',
  methodologie:
    "Note moyenne de responsabilité attribuée à chaque acteur, calculée sur l'ensemble des répondants ayant répondu à la question correspondante. C'est un classement descriptif : aucun test statistique n'est appliqué entre les acteurs.",
  donnees: 'Note de responsabilité (1 à 5) attribuée séparément aux plateformes, à l\'État, aux producteurs de contenus, aux médias traditionnels et aux partageurs. n = 263.',
}

const INFO_ECART_2A = {
  titre: 'L’écart de responsabilité',
  methodologie:
    'Pour chaque répondant, on calcule un écart : sa note moyenne donnée aux individus (producteurs, partageurs) moins sa note moyenne donnée aux structures (plateformes, État). Cet écart est ensuite comparé à zéro par un test statistique adapté à des paires de mesures prises sur les mêmes personnes.',
  donnees: 'Notes de responsabilité (1 à 5) données aux individus et aux structures par chaque répondant. n = 263.',
}

const INFO_CONTRASTES = {
  titre: 'Un blâme politiquement orienté',
  methodologie:
    "Notes moyennes calculées séparément chez les répondants se déclarant à gauche et ceux se déclarant à droite. Présentation descriptive : aucun test de différence formel n'est appliqué entre les deux groupes sur ce graphique.",
  donnees: 'Notes de responsabilité (1 à 5) données à l\'État, aux médias traditionnels et aux partageurs, croisées avec le positionnement politique déclaré.',
}

const INFO_NUAGE_2B = {
  titre: 'Le décalage et la demande de régulation',
  methodologie:
    "On met en regard, pour chaque répondant, son décalage entre responsabilité individuelle et structurelle (calculé en H2.a) et sa demande de régulation. La droite orange résume la tendance générale entre les deux variables, sur l'ensemble des répondants. Un léger décalage aléatoire écarte les points superposés sans changer le calcul. La couleur de chaque point indique le bord politique déclaré, pour vérifier que le lien ne tient pas seulement à l'intérieur d'un seul camp : la même tendance est recalculée séparément à gauche et à droite (cartouche ci-dessous).",
  donnees: 'Décalage de responsabilité (voir H2.a), demande de régulation (1 à 5), couleur et tendances par camp selon le positionnement politique déclaré. n = 263.',
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
          couleur: BORD_COULEURS[r.politique] ?? BORD_COULEURS.autre,
        })),
    [respondents]
  )

  return (
    <div className="space-y-12">
      {/* ---- H2.a ---- */}
      <section className="space-y-8">
        <HypoHeader code={a.code} titre={a.titre} enonce={a.enonce} verdict={a.verdict} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <SectionTitle
              info={INFO_HIERARCHIE}
              sub="Note moyenne de responsabilité (1 à 5). Individus en orange, structures (plateformes, État) en vert, médias à part."
            >
              Hiérarchie des responsables
            </SectionTitle>
            <div className="mt-4 space-y-2">
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
              Les personnes qui produisent et partagent des contenus (en orange) arrivent en tête,
              devant les plateformes et l'État (en vert). Les médias traditionnels ne comptent ni comme
              responsabilité individuelle ni comme responsabilité structurelle au sens de l'hypothèse :
              ils sont indiqués juste à titre de comparaison.
            </Caption>
          </Card>

          <Card>
            <SectionTitle
              info={INFO_ECART_2A}
              sub="Comparaison appariée, par répondant, entre responsabilité individuelle et responsabilité structurelle."
            >
              L'écart de responsabilité
            </SectionTitle>
            <div className="mt-5">
              <EcartMetre percu={a.ecart.percu} reel={a.ecart.reel} echelle={a.ecart.echelle} />
            </div>
            <div className="mt-4 rounded-lg bg-bg p-3 font-mono text-xs text-ink-soft">
              Écart moyen = {String(a.test.diff).replace('.', ',')} point · <Signif p={a.test.p} />
              <br />
              {a.test.pct_individus}% des répondants attribuent une responsabilité plus forte aux individus (n = {a.test.n}).
            </div>
            <Caption>
              L'écart-mètre résume l'hypothèse : la responsabilité individuelle est jugée plus forte
              que la responsabilité structurelle. Le test statistique, qui compare cet écart chez chaque
              répondant plutôt qu'entre deux groupes différents, confirme qu'il n'est pas dû au hasard.
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
          <div className="mt-4 space-y-2">
            {a.contrastes_politiques.map((c) => {
              const val = bord === 'gauche' ? c.gauche : bord === 'droite' ? c.droite : Number(((c.gauche + c.droite) / 2).toFixed(2))
              const couleur = bord === 'tous' ? undefined : BORD_COULEURS[bord]
              return (
                <BarRow
                  key={c.item}
                  label={c.item}
                  valeur={val}
                  echelle={5}
                  pole="neutral"
                  couleur={couleur}
                  affiche={val.toFixed(1).replace('.', ',')}
                  sous={
                    bord === 'tous' ? (
                      <>
                        <span style={{ color: BORD_COULEURS.gauche }}>Gauche {String(c.gauche).replace('.', ',')}</span>
                        {' · '}
                        <span style={{ color: BORD_COULEURS.droite }}>Droite {String(c.droite).replace('.', ',')}</span>
                      </>
                    ) : undefined
                  }
                />
              )
            })}
          </div>
          <Caption>
            Lecture descriptive, sans test statistique associé : l'objectif est de voir l'ampleur des
            différences entre bords politiques, pas de les valider formellement.
          </Caption>
        </Card>

        <Card>
          <Eyebrow>Lecture</Eyebrow>
          <p className="mt-2 font-body text-sm text-ink-soft">{a.lecture}</p>
        </Card>
      </section>

      {/* ---- H2.b ---- */}
      <section className="space-y-8 border-t border-line pt-10">
        <HypoHeader code={b.code} titre={b.titre} enonce={b.enonce} verdict={b.verdict} />

        <div className="space-y-6">
          <Card>
            <SectionTitle
              info={INFO_NUAGE_2B}
              sub="Chaque point est un répondant. En abscisse, le décalage de responsabilité (individuelle moins structurelle) ; en ordonnée, la demande de régulation (Q18)."
            >
              Le décalage et la demande de régulation
            </SectionTitle>
            <div className="mt-4">
              <Nuage
                points={pointsB}
                droite={b.correlation}
                xLabel="Décalage de responsabilité"
                yLabel="Demande de régulation"
                xDomain={[-4, 4]}
                yDomain={[1, 5]}
                xTicks={[-4, -2, 0, 2, 4]}
                yTicks={[1, 2, 3, 4, 5]}
                refX={0}
                refXLabel="Égalité individus / structures"
                height={300}
              />
              <div className="mt-3 flex flex-wrap gap-3">
                {Object.entries(LABELS_BORD).map(([cle, label]) => (
                  <span key={cle} className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BORD_COULEURS[cle] }} aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </div>
              <p className="mt-2 font-mono text-xs text-muted">Couleur = bord politique déclaré (Q5).</p>
            </div>
            <Caption>
              Une pente qui descend voudrait dire que plus un répondant fait porter la responsabilité
              sur les individus (plutôt que sur les structures), moins il demande de régulation à
              grande échelle : c'est ce que prédit l'hypothèse. La ligne pointillée verticale marque le
              point d'équilibre où les deux types de responsabilité sont jugés égaux : à droite,
              l'individuelle domine ; à gauche, la structurelle domine.
            </Caption>
          </Card>

          <Card>
            <SectionTitle sub="Le lien tient-il aussi à l'intérieur de chaque camp politique, ou n'est-il qu'un effet du bord politique sur les deux variables ?">
              Le test
            </SectionTitle>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-bg p-3 font-mono text-xs text-ink-soft">
                Ensemble des répondants : r = {String(b.correlation.r).replace('.', ',')} · <Signif p={b.correlation.p} /> (n = {b.correlation.n})
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {b.correlation_par_bord.map((c) => (
                  <div key={c.cle} className="rounded-lg bg-bg p-3 font-mono text-xs" style={{ color: BORD_COULEURS[c.cle] }}>
                    {c.label} : r = {String(c.r).replace('.', ',')} (n = {c.n})
                    <br />
                    <Signif p={c.p} />
                  </div>
                ))}
              </div>
              <p className="font-body text-xs text-muted">{b.mesure}</p>
              <p className="font-body text-sm text-ink-soft">{b.lecture}</p>
              <p className="font-body text-sm text-ink-soft">
                Le lien va dans le même sens des deux côtés de l'échiquier politique, ce qui exclut
                qu'il ne soit qu'un effet du bord politique. Il est net à droite, mais trop faible pour
                être fiable à gauche : à prendre avec prudence côté gauche, plutôt qu'à écarter.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}
