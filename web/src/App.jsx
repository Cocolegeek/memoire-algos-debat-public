import { useEffect, useState } from 'react'
import { Badge, CitationAPA, Eyebrow, TabBar } from './ui.jsx'
import Overview from './sections/Overview.jsx'
import Hypothesis1 from './sections/Hypothesis1.jsx'
import Hypothesis2 from './sections/Hypothesis2.jsx'
import Hypothesis3 from './sections/Hypothesis3.jsx'
import Verbatims from './sections/Verbatims.jsx'
import logoParis1 from './assets/logo-paris1-sorbonne.png'
import logoIMCDS from './assets/logo-master-imcds.jpeg'

const TABS = [
  { id: 'overview', label: 'Vue d’ensemble' },
  { id: 'h1', label: 'H1' },
  { id: 'h2', label: 'H2' },
  { id: 'h3', label: 'H3' },
]

const REPO = 'https://github.com/Cocolegeek/memoire-algos-debat-public'
const SITE = 'https://cocolegeek.github.io/memoire-algos-debat-public/'
const CITATION_APA = `Nicolas, C. (2026). Algorithmes de recommandation et polarisation du débat public [Mémoire de master, Université Paris 1 Panthéon-Sorbonne]. ${SITE}`

export default function App() {
  const [active, setActive] = useState('overview')
  const [data, setData] = useState(null)
  const [respondents, setRespondents] = useState([])
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'results.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch((e) => setErreur(e.message))
    // Jeu par répondant pour les nuages de points (non bloquant).
    fetch(import.meta.env.BASE_URL + 'respondents.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setRespondents(d.repondants ?? []))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="space-y-6 border-b border-line pb-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <img
              src={logoParis1}
              alt="Université Paris 1 Panthéon-Sorbonne"
              className="h-9 w-auto sm:h-11"
            />
            <img
              src={logoIMCDS}
              alt="Master IMCDS, Université Paris 1 Panthéon-Sorbonne"
              className="h-14 w-14 rounded-xl shadow-[0_6px_16px_-6px_rgba(21,23,43,0.35)] sm:h-16 sm:w-16"
            />
          </div>

          <div className="space-y-4">
            <Eyebrow>Mémoire de Master IMCDS · Paris 1 Panthéon-Sorbonne</Eyebrow>
            <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Algorithmes de recommandation et polarisation du débat public
            </h1>
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
            </div>
          </div>

          <div className="space-y-1.5">
            <Eyebrow>Citer cette page (norme APA)</Eyebrow>
            <CitationAPA texte={CITATION_APA} />
          </div>
        </header>

        <div className="py-8">
          <TabBar tabs={TABS} active={active} onChange={setActive} />
        </div>

        <main>
          {erreur && (
            <p className="rounded-xl border border-percu-soft bg-percu-soft p-4 font-body text-sm text-percu">
              Impossible de charger les données ({erreur}).
            </p>
          )}
          {!data && !erreur && <p className="font-body text-sm text-muted">Chargement des données…</p>}
          {data && (
            <>
              {active === 'overview' && <Overview data={data} onNavigate={setActive} />}
              {active === 'h1' && <Hypothesis1 data={data.h1} respondents={respondents} />}
              {active === 'h2' && <Hypothesis2 a={data.h2a} b={data.h2b} respondents={respondents} />}
              {active === 'h3' && <Hypothesis3 data={data.h3} />}
            </>
          )}
        </main>

        {data && <Verbatims data={data} tab={active} />}
      </div>
    </div>
  )
}
