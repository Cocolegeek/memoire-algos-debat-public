import { BarRow, BigStat, Caption, Card, Eyebrow, SectionTitle, Signif } from '../ui.jsx'
import HypoHeader from './HypoHeader.jsx'

const INFO_ECART = {
  titre: 'Le grand écart',
  methodologie:
    "Deux pourcentages calculés indépendamment l'un de l'autre : la part des répondants jugeant la transparence nécessaire (note 4 ou 5 sur 5 à Q18), et la part déclarant connaître précisément le DSA (Q17). Aucun test statistique n'est nécessaire ici, ce sont des proportions descriptives.",
  donnees: 'Q18 (degré d\'accord, 1-5) et Q17 (connaissance du DSA, 3 modalités recodées). n = 263.',
}

const INFO_DSA = {
  titre: 'Connaître change-t-il la demande ?',
  methodologie:
    "Comparaison de la demande moyenne de régulation (Q18) entre deux groupes indépendants : ceux qui déclarent connaître précisément le DSA, et ceux qui le connaissent mal ou pas du tout. Test t pour échantillons indépendants (variances non supposées égales).",
  donnees: 'Q18 (1-5) croisée avec Q17 recodé en deux groupes (precis / vague + non).',
}

const INFO_BORD = {
  titre: 'Une demande consensuelle, mais graduée',
  methodologie:
    "Note moyenne et part de répondants en accord fort (Q18 ∈ {4,5}), calculées séparément pour chacune des six catégories de positionnement politique (Q5). Présentation descriptive : aucun test global (de type ANOVA) n'est appliqué entre les six groupes.",
  donnees: 'Q18 (1-5) croisée avec Q5 (positionnement politique, 6 modalités).',
}

export default function Hypothesis3({ data }) {
  const { ecart, demande_par_bord, demande_selon_dsa, test_dsa, lecture } = data

  return (
    <div className="space-y-6">
      <HypoHeader code={data.code} titre={data.titre} enonce={data.enonce} verdict={data.verdict} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle info={INFO_ECART} sub="Une demande quasi unanime face à une connaissance rare du dispositif européen.">
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
          <Caption>
            Ce test compare directement les deux groupes affichés ci-dessus. Une différence non
            significative signifie que l'écart observé entre les deux barres pourrait être dû au
            hasard de l'échantillonnage, et ne permet pas de conclure à un effet de la connaissance du
            DSA sur la demande de régulation.
          </Caption>
        </Card>
      </div>

      <Card>
        <SectionTitle
          info={INFO_BORD}
          sub="Part jugeant la transparence nécessaire (Q18 ∈ {4,5}) et note moyenne, par bord politique. La demande est forte partout, mais graduée."
        >
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
        <Caption>
          La demande reste majoritaire à tous les bords politiques (le critère « consensuelle » de
          l'hypothèse), mais son intensité décroît à droite, et plus nettement à l'extrême droite.
        </Caption>
      </Card>

      <Card>
        <Eyebrow>Lecture</Eyebrow>
        <p className="mt-2 font-body text-sm text-ink-soft">{lecture}</p>
      </Card>
    </div>
  )
}
