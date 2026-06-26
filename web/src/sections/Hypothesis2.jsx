import { useMemo } from 'react'
import { BarRow, BORD_COULEURS, Caption, Card, EcartMetre, Eyebrow, Nuage, SectionTitle, Signif } from '../ui.jsx'
import HypoHeader from './HypoHeader.jsx'

const LABELS_BORD = {
  extreme_gauche: 'Très à gauche',
  gauche: 'Plutôt à gauche',
  centre: 'Plutôt au centre',
  droite: 'Plutôt à droite',
  extreme_droite: 'Très à droite',
  autre: 'Ne se positionne pas',
}

const POLE = { individu: 'percu', structure: 'reel', autre: 'neutral' }

function BarreContraste({ label, valeur, couleur }) {
  const pct = Math.min(100, Math.max(0, (valeur / 5) * 100))
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 font-mono text-[11px] text-muted">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: couleur }} />
      </div>
      <span className="w-8 shrink-0 text-right font-mono text-[11px]" style={{ color: couleur }}>
        {String(valeur).replace('.', ',')}
      </span>
    </div>
  )
}

function frac(i) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const INFO_HIERARCHIE = {
  titre: 'Hiérarchie des responsables',
  methodologie:
    "Note moyenne de responsabilité attribuée à chaque acteur (Q16a-e), calculée sur l'ensemble des répondants ayant répondu à la question correspondante. Classement descriptif : aucun test statistique n'est appliqué entre les acteurs.",
  donnees: "Note de responsabilité (1 à 5) attribuée séparément aux plateformes (Q16a), à l'État (Q16b), aux producteurs de contenus (Q16c), aux médias traditionnels (Q16d) et aux partageurs (Q16e). n = 263.",
  questions: ['Q16a', 'Q16b', 'Q16c', 'Q16d', 'Q16e'],
}

const INFO_ECART_2A = {
  titre: "L'écart de responsabilité",
  methodologie:
    "Pour chaque répondant, écart = moyenne(Q16c, Q16e) − moyenne(Q16a, Q16b), c'est-à-dire responsabilité individuelle moins responsabilité structurelle. Cet écart est ensuite comparé à zéro par un test t pour échantillons appariés.",
  donnees: "Notes de responsabilité (1 à 5) données aux individus (Q16c, Q16e) et aux structures (Q16a, Q16b) par chaque répondant. n = 263.",
  questions: ['Q16c', 'Q16e', 'Q16a', 'Q16b'],
}

const INFO_CONTRASTES = {
  titre: 'Un blâme politiquement orienté',
  methodologie:
    "Notes moyennes calculées sur l'ensemble des répondants, puis séparément chez ceux se déclarant à gauche et ceux se déclarant à droite (Q5). Présentation descriptive : aucun test de différence formel n'est appliqué entre les groupes sur ce graphique.",
  donnees: "Notes de responsabilité (1 à 5) données à l'État (Q16b), aux médias traditionnels (Q16d) et aux partageurs (Q16e), croisées avec le positionnement politique déclaré (Q5).",
  questions: ['Q16b', 'Q16d', 'Q16e', 'Q5'],
}

const INFO_NUAGE_2B = {
  titre: 'Le décalage et la demande de régulation',
  methodologie:
    "Corrélation de Pearson entre le décalage de responsabilité (individuelle moins structurelle, calculé en H2.a) et la demande de régulation (Q18), sur l'ensemble des répondants puis séparément à gauche et à droite (Q5). La droite orange résume la tendance générale. Un léger bruit aléatoire (« jitter ») écarte les points superposés sans modifier le calcul.",
  donnees: "Décalage de responsabilité (voir H2.a), demande de régulation (Q18, 1 à 5), couleur et corrélations par camp selon le positionnement politique déclaré (Q5). n = 263.",
  questions: ['Q16c', 'Q16e', 'Q16a', 'Q16b', 'Q18', 'Q5'],
}

export default function Hypothesis2({ a, b, respondents = [] }) {
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
              devant les plateformes et l'État (en vert). Les médias traditionnels ne relèvent ni de la
              responsabilité individuelle ni de la responsabilité structurelle au sens de l'hypothèse :
              ils figurent ici à titre de comparaison.
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
          <SectionTitle info={INFO_CONTRASTES} sub="Le blâme se déplace selon le bord politique déclaré.">
            Un blâme politiquement orienté
          </SectionTitle>
          <div className="mt-4 flex flex-wrap gap-3 font-mono text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BORD_COULEURS.centre }} aria-hidden="true" />
              Tous
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BORD_COULEURS.gauche }} aria-hidden="true" />
              Gauche
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BORD_COULEURS.droite }} aria-hidden="true" />
              Droite
            </span>
          </div>
          <div className="mt-4 space-y-5">
            {a.contrastes_politiques.map((c) => (
              <div key={c.item}>
                <p className="font-body text-sm text-ink-soft">{c.item}</p>
                <div className="mt-2 space-y-1.5">
                  <BarreContraste label="Tous" valeur={c.tous} couleur={BORD_COULEURS.centre} />
                  <BarreContraste label="Gauche" valeur={c.gauche} couleur={BORD_COULEURS.gauche} />
                  <BarreContraste label="Droite" valeur={c.droite} couleur={BORD_COULEURS.droite} />
                </div>
              </div>
            ))}
          </div>
          <Caption>
            Lecture descriptive, sans test statistique associé : l'objectif est d'observer l'ampleur
            des différences entre bords politiques, non de les valider formellement.
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
