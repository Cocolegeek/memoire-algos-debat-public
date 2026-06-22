import { CartesianGrid, Label, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { BarRow, BigStat, BORD_COULEURS, Caption, Card, Eyebrow, SectionTitle, Signif } from '../ui.jsx'
import { useTheme } from '../theme-context.js'
import { CHART } from '../chart-colors.js'
import HypoHeader from './HypoHeader.jsx'

const ORDRE_BORD = ['extreme_gauche', 'gauche', 'centre', 'droite', 'extreme_droite', 'autre']
const ABBR_BORD = { extreme_gauche: 'TG', gauche: 'G', centre: 'C', droite: 'D', extreme_droite: 'TD', autre: 'NS' }

function TooltipBord({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-line bg-panel px-2 py-1 font-mono text-xs text-ink-soft shadow">
      {d.label} : {String(d.y).replace('.', ',')}/5 · {d.pct}% en accord fort
    </div>
  )
}

const INFO_ECART = {
  titre: 'Le grand écart',
  methodologie:
    "Deux pourcentages calculés indépendamment l'un de l'autre : la part des répondants jugeant la transparence nécessaire (note 4 ou 5 sur 5 à Q18), et la part déclarant connaître précisément le DSA (Q17). Aucun test statistique n'est nécessaire ici, ce sont des proportions descriptives.",
  donnees: 'Q18 (degré d\'accord, 1-5) et Q17 (connaissance du DSA, 3 modalités recodées). n = 263.',
}

const INFO_DSA = {
  titre: 'Connaître le DSA réduit-il la volonté de régulation ?',
  methodologie:
    "Comparaison de la demande moyenne de régulation (Q18) entre deux groupes indépendants : ceux qui déclarent connaître précisément le DSA, et ceux qui le connaissent mal ou pas du tout. Test t pour échantillons indépendants (variances non supposées égales).",
  donnees: 'Q18 (1-5) croisée avec Q17 recodé en deux groupes (precis / vague + non).',
}

const INFO_BORD = {
  titre: 'Une demande consensuelle, mais graduée',
  methodologie:
    "Note moyenne et part de répondants en accord fort (note 4 ou 5 sur 5 à la question Q18), calculées séparément pour chacune des six catégories de positionnement politique (Q5). Présentation descriptive : aucun test global (de type ANOVA) n'est appliqué entre les six groupes.",
  donnees: 'Q18 (1-5) croisée avec Q5 (positionnement politique, 6 modalités).',
}

export default function Hypothesis3({ data }) {
  const { ecart, demande_par_bord, demande_selon_dsa, test_dsa, lecture } = data
  const { dark } = useTheme()
  const couleurs = CHART[dark ? 'dark' : 'light']

  const pointsBord = demande_par_bord.map((d) => ({
    x: ORDRE_BORD.indexOf(d.cle) + 1,
    y: d.note,
    couleur: BORD_COULEURS[d.cle],
    r: 5 + (d.pct - 50) / 5,
    label: d.label,
    pct: d.pct,
  }))

  return (
    <div className="space-y-8">
      <HypoHeader code={data.code} titre={data.titre} enonce={data.enonce} verdict={data.verdict} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle info={INFO_ECART} sub="Une demande de régulation quasi unanime face à une connaissance rare des dispositifs existants.">
            Le grand écart
          </SectionTitle>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <BigStat valeur={ecart.percu.valeur} unite="%" label={ecart.percu.label} sous={ecart.percu.sous} pole="percu" />
            <BigStat valeur={ecart.reel.valeur} unite="%" label={ecart.reel.label} sous={ecart.reel.sous} pole="reel" />
          </div>
          <Caption>
            Les deux chiffres ne portent pas sur la même question : l'un mesure une attente, l'autre
            une connaissance. Leur écart illustre la déconnexion évoquée par l'hypothèse, sans qu'il
            s'agisse d'un lien statistique entre les deux.
          </Caption>
        </Card>

        <Card>
          <SectionTitle info={INFO_DSA} sub="Demande moyenne de régulation (1 à 5) selon la connaissance du DSA.">
            Connaître le DSA réduit-il la volonté de régulation ?
          </SectionTitle>
          <div className="mt-4 space-y-2">
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
                « Une meilleure connaissance du DSA réduit la volonté de régulation » n'est pas établi
                statistiquement.
              </span>
            )}
          </div>
          <Caption>
            Ce test compare directement les deux groupes affichés ci-dessus. Une différence non
            significative signifie que l'écart observé entre les deux barres pourrait être dû au
            hasard de l'échantillonnage, et ne permet pas de conclure à un effet de la connaissance du
            DSA sur la volonté de régulation.
          </Caption>
        </Card>
      </div>

      <Card>
        <SectionTitle
          info={INFO_BORD}
          sub="Part jugeant la transparence nécessaire (note 4 ou 5 sur 5 à la question Q18) et note moyenne, par bord politique. La demande est forte partout, mais graduée."
        >
          Une demande consensuelle, mais graduée
        </SectionTitle>
        <div className="mt-4">
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 8, right: 16, bottom: 36, left: 18 }}>
              <CartesianGrid stroke={couleurs.line} strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                domain={[0.5, 6.5]}
                ticks={[1, 2, 3, 4, 5, 6]}
                tickFormatter={(v) => ABBR_BORD[ORDRE_BORD[v - 1]]}
                tick={{ fontSize: 11 }}
                stroke={couleurs.muted}
              >
                <Label value="Positionnement politique déclaré" position="insideBottom" offset={-20} style={{ fontSize: 11, fill: couleurs.muted }} />
              </XAxis>
              <YAxis type="number" dataKey="y" domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} stroke={couleurs.muted} width={32}>
                <Label
                  value="Demande de régulation (note moyenne)"
                  angle={-90}
                  position="insideLeft"
                  style={{ fontSize: 11, fill: couleurs.muted, textAnchor: 'middle' }}
                />
              </YAxis>
              <Tooltip content={<TooltipBord />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter
                data={pointsBord}
                shape={(props) => {
                  const { cx, cy, payload } = props
                  return (
                    <circle cx={cx} cy={cy} r={payload.r} fill={payload.couleur} fillOpacity={0.85} stroke={couleurs.panel} strokeWidth={1.5} />
                  )
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-3">
            {demande_par_bord.map((d) => (
              <span key={d.cle} className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BORD_COULEURS[d.cle] }} aria-hidden="true" />
                {d.label}
              </span>
            ))}
          </div>
          <p className="mt-2 font-mono text-xs text-muted">
            Couleur = bord politique déclaré. Taille du point = part des répondants en accord fort
            (note 4 ou 5 sur 5).
          </p>
        </div>
        <Caption>
          La demande de régulation reste majoritaire à tous les bords politiques (le critère «
          consensuelle » de l'hypothèse), mais son intensité décroît à droite, et plus nettement à
          l'extrême droite.
        </Caption>
      </Card>

      <Card>
        <Eyebrow>Lecture</Eyebrow>
        <p className="mt-2 font-body text-sm text-ink-soft">{lecture}</p>
      </Card>
    </div>
  )
}
