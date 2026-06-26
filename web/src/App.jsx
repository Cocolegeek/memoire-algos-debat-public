import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Badge, CitationAPA, Eyebrow, FloatingNav, TabBar, ThemeToggle } from './ui.jsx'
import NetworkBackground from './NetworkBackground.jsx'
import LoadingScreen from './LoadingScreen.jsx'
import Overview from './sections/Overview.jsx'
import Hypothesis1 from './sections/Hypothesis1.jsx'
import Hypothesis2 from './sections/Hypothesis2.jsx'
import Hypothesis3 from './sections/Hypothesis3.jsx'
import Donnees from './sections/Donnees.jsx'
import Questionnaire from './sections/Questionnaire.jsx'
import Memoire from './sections/Memoire.jsx'
import Verbatims from './sections/Verbatims.jsx'
import logoParis1 from './assets/logo-paris1-sorbonne.png'
import logoIMCDS from './assets/logo-master-imcds.png'

const TABS = [
  { id: 'overview', label: 'Accueil' },
  { id: 'h1', label: 'H1' },
  { id: 'h2', label: 'H2' },
  { id: 'h3', label: 'H3' },
  { id: 'donnees', label: 'Données' },
  { id: 'questionnaire', label: 'Questionnaire' },
  { id: 'memoire', label: 'Mémoire' },
]

const REPO = 'https://github.com/Cocolegeek/memoire-algos-debat-public'
const SITE = 'https://cocolegeek.github.io/memoire-algos-debat-public/'
const CITATION_APA = `Nicolas, C. (2026). Algorithmes de recommandation et polarisation du débat public [Mémoire de master, Université Paris 1 Panthéon-Sorbonne]. ${SITE}`

export default function App() {
  const [active, setActive] = useState('overview')
  const [data, setData] = useState(null)
  const [respondents, setRespondents] = useState([])
  const [erreur, setErreur] = useState(null)
  const [citationOuverte, setCitationOuverte] = useState(false)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'results.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch((e) => setErreur(e.message))
    // Jeu par répondant pour les nuages de points H1/H2 (non bloquant).
    fetch(import.meta.env.BASE_URL + 'respondents.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setRespondents(d.repondants ?? []))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen">
      <LoadingScreen visible={!data && !erreur} />
      <NetworkBackground />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 h-16 bg-gradient-to-b from-bg via-bg/60 to-transparent sm:h-20" />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-16 bg-gradient-to-t from-bg via-bg/60 to-transparent sm:h-20" />

      <FloatingNav>
        <motion.button
          type="button"
          onClick={() => setActive('overview')}
          aria-label="Aller à l'accueil"
          whileHover={{ scale: 1.06, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.94, transition: { duration: 0.1 } }}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2 py-1 shadow-[0_1px_4px_rgba(21,23,43,0.15)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <img src={logoParis1} alt="" className="h-5 w-auto sm:h-6" />
        </motion.button>
        <TabBar tabs={TABS} active={active} onChange={setActive} />
        <ThemeToggle />
      </FloatingNav>

      <div className="mx-auto max-w-5xl px-4 pb-10 pt-20 sm:px-6 sm:pt-24">
        {active === 'overview' && (
          <header className="space-y-4 border-b border-line pb-5">
            <div className="flex items-center gap-3">
              <img src={logoIMCDS} alt="" className="h-10 w-10 shrink-0 sm:h-12 sm:w-12" />
              <p className="font-mono text-xs text-muted">
                Mémoire de master Management de l'innovation, spécialité Innovation Communication et Data Science, Université Paris 1 Panthéon-Sorbonne.
              </p>
            </div>
            <div className="space-y-2.5">
              <h1 className="font-display text-xl font-semibold text-ink sm:text-2xl">
                Algorithmes de recommandation et polarisation du débat public
              </h1>
              <p className="max-w-2xl font-body text-sm text-ink-soft">
                On reproche souvent aux algorithmes des réseaux sociaux d'enfermer chacun dans ses
                certitudes et de nourrir l'indignation, une idée répandue mais mal démontrée. Cette
                enquête étudie plutôt les représentations : ce que le public perçoit, attribue et
                attend en matière de régulation, à partir des réponses de {data ? data.meta.n : 263}{' '}
                personnes à un questionnaire en ligne.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {data && <Badge>n = {data.meta.n}</Badge>}
                {data?.meta.statut !== 'définitif' && (
                  <Badge tone="avertissement">Chiffres provisoires</Badge>
                )}
                <a
                  href={REPO}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-ink-soft underline decoration-line decoration-1 underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Code source
                </a>
                <button
                  type="button"
                  onClick={() => setCitationOuverte((v) => !v)}
                  aria-expanded={citationOuverte}
                  className="font-mono text-xs text-ink-soft underline decoration-line decoration-1 underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Citer cette page
                </button>
              </div>
            </div>

            {citationOuverte && (
              <div className="space-y-1.5">
                <Eyebrow>Norme APA</Eyebrow>
                <CitationAPA texte={CITATION_APA} />
              </div>
            )}
          </header>
        )}

        <main className={active === 'overview' ? 'pt-6' : ''}>
          {erreur && (
            <p className="rounded-xl border border-percu-soft bg-percu-soft p-4 font-body text-sm text-percu">
              Impossible de charger les données ({erreur}).
            </p>
          )}
          {data && (
            <>
              {active === 'overview' && <Overview data={data} onNavigate={setActive} />}
              {active === 'h1' && <Hypothesis1 data={data.h1} respondents={respondents} />}
              {active === 'h2' && <Hypothesis2 a={data.h2a} b={data.h2b} respondents={respondents} />}
              {active === 'h3' && <Hypothesis3 data={data.h3} />}
              {active === 'donnees' && <Donnees />}
              {active === 'questionnaire' && <Questionnaire />}
              {active === 'memoire' && <Memoire />}
            </>
          )}
        </main>

        {data && <Verbatims data={data} tab={active} />}
      </div>
    </div>
  )
}
