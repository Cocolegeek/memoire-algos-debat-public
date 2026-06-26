import { BarRow, Caption, Eyebrow, InfoButton } from '../ui.jsx'

const INFO = {
  titre: 'Analyse sémantique des réponses libres',
  methodologie:
    "Chaque réponse ouverte est classée dans un thème par détection de mots-clés (pour Q19 : algorithmes/réseaux sociaux, médias, acteurs politiques, individus ; pour Q20 : régulation, transparence des sources, éducation). Les pourcentages portent sur l'ensemble des réponses non vides ; les citations affichées en sont un échantillon illustratif, pas un résultat statistique.",
  donnees: 'Q19 (cause perçue de la polarisation) et Q20 (mesure concrète proposée), réponses facultatives en texte libre.',
}

// Quel bloc (q19/q20) et quel(s) thème(s) servent chaque onglet : la sélection
// reste au service de l'hypothèse de la page, pas une simple décoration.
const CONFIG = {
  overview: {
    cle: 'q19',
    themes: null,
    titre: "Ce qu'en disent les répondants",
    lecture: "Aperçu des causes citées spontanément par les répondants, toutes catégories confondues.",
  },
  h1: {
    cle: 'q19',
    themes: ['algorithmes_reseaux'],
    titre: 'Quand les répondants citent eux-mêmes les algorithmes et réseaux sociaux',
    lecture: "Échantillon des réponses qui parlent d'algorithmes et de réseaux sociaux, en écho à l'intensité d'usage de H1.",
  },
  h2: {
    cle: 'q19',
    themes: ['individus', 'politique', 'medias'],
    titre: 'Responsabilité individuelle ou structurelle, dans les mots des répondants',
    lecture: "Trois thèmes mis en regard : le comportement des individus (responsabilité individuelle) face aux acteurs politiques et aux médias (plus proches de la responsabilité structurelle évoquée en H2.a).",
  },
  h3: {
    cle: 'q20',
    themes: ['regulation'],
    titre: 'Les mesures de régulation proposées, dans les mots des répondants',
    lecture: "Échantillon des réponses qui parlent de régulation, de contrôle ou de sanctions, en écho à la demande de régulation de H3.",
  },
}

export default function Verbatims({ data, tab }) {
  const cfg = CONFIG[tab]
  if (!cfg || !data?.verbatims) return null
  const bloc = data.verbatims[cfg.cle]
  const groupes = cfg.themes
    ? cfg.themes.map((t) => ({
        theme: bloc.themes.find((x) => x.cle === t),
        citations: bloc.citations.filter((c) => c.theme === t).slice(0, 2),
      }))
    : [{ theme: null, citations: bloc.citations.slice(0, 4) }]

  return (
    <footer className="mt-12 border-t border-line pt-8">
      <div className="flex items-center gap-2">
        <Eyebrow>{cfg.titre}</Eyebrow>
        <InfoButton {...INFO} />
      </div>

      {tab !== 'overview' && (
        <div className="mt-4 space-y-2">
          {bloc.themes.map((t) => (
            <BarRow key={t.cle} label={t.label} valeur={t.pct} echelle={100} affiche={`${t.pct}%`} />
          ))}
        </div>
      )}

      <div className="mt-6 space-y-5">
        {groupes.map((g, i) => (
          <div key={g.theme?.cle ?? i}>
            {g.theme && (
              <Eyebrow className="block">
                {g.theme.label} ({g.theme.pct}%)
              </Eyebrow>
            )}
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {g.citations.map((c, j) => (
                <blockquote
                  key={j}
                  className="rounded-xl border border-line bg-panel p-4 font-body text-sm italic text-ink-soft"
                >
                  « {c.texte} »
                </blockquote>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Caption>{cfg.lecture}</Caption>
      <p className="mt-4 font-mono text-xs text-muted">{data.meta.source}</p>
    </footer>
  )
}
