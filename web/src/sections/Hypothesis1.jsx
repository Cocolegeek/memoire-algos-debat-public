import { useMemo } from 'react'
import { BarRow, Caption, Card, EcartMetre, Eyebrow, InfoButton, Nuage, SectionTitle, Signif, TableRobustesse } from '../ui.jsx'
import HypoHeader from './HypoHeader.jsx'

function frac(i) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function pointsPour(respondents, cle, jitter) {
  return respondents
    .filter((r) => r[cle] != null && r.hostilite != null)
    .map((r, i) => ({ x: jitter ? r[cle] + (frac(i) * 0.5 - 0.25) : r[cle], y: r.hostilite }))
}

const INFO_ECART = {
  titre: "L'écart-mètre H1",
  methodologie:
    "On mesure la force du lien entre l'hostilité et, d'un côté, le fait de se sentir enfermé dans une bulle (Q9), de l'autre la plus forte des deux mesures d'usage (temps passé, exposition aux contenus). Plus ce lien est fort, plus la barre est longue, sur une échelle commune de 0 à 0,3.",
  donnees:
    "Index d'hostilité calculé à partir de 4 questions sur le ressenti envers les personnes en désaccord (Q14a-d). Bulle (Q9), temps passé (Q7), exposition aux contenus polémiques (Q11a-d), tous ramenés sur une échelle de 1 à 5. n = 263.",
}

const INFO_REGRESSION = {
  titre: 'Ce qui pèse vraiment',
  methodologie:
    "On regarde les trois facteurs en même temps (régression linéaire multiple) pour savoir lequel pèse le plus sur l'hostilité une fois les deux autres neutralisés. Les poids (β) sont calculés sur des variables ramenées à la même échelle, donc directement comparables entre eux. Chacun est aussi testé séparément pour savoir s'il est probablement réel ou dû au hasard.",
  donnees:
    "Mêmes variables que l'écart-mètre, restreintes aux répondants ayant répondu aux quatre questions concernées (hostilité, temps, exposition, bulle).",
}

const INFO_ROBUSTESSE = {
  titre: 'H1 est-elle stable selon le profil ?',
  methodologie:
    "Les mêmes liens que ci-dessus sont recalculés séparément sur quatre groupes de répondants : les deux tranches d'âge les plus représentées et les deux bords politiques. Cela permet de vérifier que le résultat principal ne tient pas à un seul profil de répondant. Ces groupes étant plus petits, un lien qui n'apparaît pas clairement significatif dans l'un d'eux peut simplement refléter un échantillon plus réduit, pas l'absence de lien.",
  donnees: 'Mêmes variables que la régression (temps, exposition, bulle, index d\'hostilité), croisées avec l\'âge et le bord politique déclaré.',
}

const INFO_NUAGE = (label) => ({
  titre: `${label} et l'hostilité`,
  methodologie:
    'On trace le lien le plus simple entre cette seule variable et l\'index d\'hostilité, sans tenir compte des deux autres facteurs. La droite orange résume la tendance générale. Un léger décalage aléatoire est ajouté aux points pour rendre visibles ceux qui se superposent ; il ne change rien au calcul.',
  donnees: 'Un point par répondant (n = 263), valeurs ramenées sur une échelle de 1 à 5.',
})

export default function Hypothesis1({ data, respondents = [] }) {
  const { correlations, ecart, regression, scatters, robustesse, lecture } = data

  const nuages = useMemo(
    () =>
      scatters.map((s) => ({
        ...s,
        points: pointsPour(respondents, s.cle, s.cle !== 'exposition'),
        r: correlations.find((c) => c.cle === s.cle)?.r,
        p: correlations.find((c) => c.cle === s.cle)?.p,
      })),
    [scatters, correlations, respondents]
  )

  return (
    <div className="space-y-8">
      <HypoHeader code={data.code} titre={data.titre} enonce={data.enonce} verdict={data.verdict} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle
            info={INFO_ECART}
            sub="Synthèse : le lien avec l'hostilité est quasi nul pour la bulle, plus net pour l'usage."
          >
            L'écart-mètre
          </SectionTitle>
          <div className="mt-5">
            <EcartMetre percu={ecart.percu} reel={ecart.reel} echelle={ecart.echelle} />
          </div>
          <Caption>
            Le pôle orange (perception de bulle) et le pôle vert (intensité d'usage) montrent chacun
            le lien entre ce facteur et l'hostilité mesurée. Plus une barre est longue, plus ce facteur
            est associé à une hostilité forte.
          </Caption>
        </Card>

        <Card>
          <SectionTitle
            info={INFO_REGRESSION}
            sub={`Quel facteur pèse le plus sur l'hostilité une fois les deux autres neutralisés ? n = ${regression.n} ; le modèle explique environ ${Math.round(regression.r2 * 100)} % de l'hostilité observée.`}
          >
            Ce qui pèse vraiment
          </SectionTitle>
          <div className="mt-4 space-y-2">
            {regression.poids.map((w) => (
              <div key={w.cle}>
                <BarRow label={w.label} valeur={Math.abs(w.beta)} echelle={0.3} pole={w.pole} affiche={`β = ${String(w.beta).replace('.', ',')}`} />
                <div className="px-3 pb-2">
                  <Signif p={w.p} />
                </div>
              </div>
            ))}
          </div>
          <Caption>
            Le poids (β) de chaque facteur tient compte des deux autres en même temps, donc on peut les
            comparer directement : plus β est élevé, plus ce facteur pèse sur l'hostilité, à profil
            comparable sur les deux autres. Le détail facteur par facteur suit plus bas.
          </Caption>
        </Card>
      </div>

      <Card>
        <SectionTitle sub="Chaque facteur pris isolément, sans tenir compte des deux autres.">
          Chaque facteur face à l'hostilité
        </SectionTitle>
        <p className="mt-2 font-body text-sm text-ink-soft">
          <strong>r</strong> indique à quel point ce facteur et l'hostilité évoluent ensemble (de -1 à
          1 ; plus le chiffre est éloigné de zéro, plus le lien est fort). <strong>p</strong> indique si
          ce lien a des chances d'être réel plutôt que dû au hasard : en dessous de 0,05, on le
          considère probablement réel.
        </p>
        <div className="mt-6 space-y-8 divide-y divide-line">
          {nuages.map((s) => (
            <div key={s.cle} className="pt-8 first:pt-0">
              <div className="flex items-center gap-2">
                <Eyebrow>{s.label}</Eyebrow>
                <InfoButton {...INFO_NUAGE(s.label)} />
              </div>
              <p className="mt-1 mb-3 font-mono text-xs text-ink-soft">
                r = {String(s.r).replace('.', ',')} · <Signif p={s.p} />
              </p>
              <Nuage
                points={s.points}
                droite={s}
                xLabel={s.label.replace(/ \(.*\)/, '')}
                yLabel="Hostilité ressentie"
                xDomain={s.cle === 'exposition' ? [1, 5] : [0.5, 5.5]}
                xTicks={[1, 2, 3, 4, 5]}
                yTicks={[1, 2, 3, 4, 5]}
                height={300}
              />
              <Caption>
                {s.cle === 'bulle'
                  ? 'Les points sont dispersés sans tendance nette : se sentir enfermé dans une bulle ne va pas de pair avec une hostilité plus ou moins forte.'
                  : 'La droite, bien que peu inclinée, traduit une tendance positive : plus ce facteur est élevé, plus l\'hostilité moyenne tend à l\'être.'}
              </Caption>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle
          info={INFO_ROBUSTESSE}
          sub="Les mêmes corrélations, recalculées séparément par tranche d'âge et par bord politique."
        >
          H1 est-elle stable selon le profil ?
        </SectionTitle>
        <div className="mt-4">
          <TableRobustesse groupes={robustesse.groupes} predicteurs={robustesse.predicteurs} />
        </div>
        <Caption>
          La perception de bulle ne ressort jamais comme significative dans aucun de ces groupes, ce
          qui renforce la conclusion principale. Le lien avec l'usage (temps, exposition) reste positif
          partout, mais n'est net que dans certains groupes : avec moins de répondants par groupe,
          c'est attendu, et ça appelle à la prudence plutôt qu'à remettre en cause le résultat
          principal.
        </Caption>
      </Card>

      <Card>
        <Eyebrow>Lecture</Eyebrow>
        <p className="mt-2 font-body text-sm text-ink-soft">{lecture}</p>
      </Card>
    </div>
  )
}
