import { useEffect, useState } from 'react'
import { Badge, Eyebrow, TabBar } from './ui.jsx'
import Overview from './sections/Overview.jsx'
import Hypothesis1 from './sections/Hypothesis1.jsx'
import Hypothesis2 from './sections/Hypothesis2.jsx'
import Hypothesis3 from './sections/Hypothesis3.jsx'
import Datalake from './sections/Datalake.jsx'

const TABS = [
  { id: 'overview', label: 'Vue d’ensemble' },
  { id: 'h1', label: 'H1' },
  { id: 'h2', label: 'H2' },
  { id: 'h3', label: 'H3' },
  { id: 'donnees', label: 'Données' },
]

const REPO = 'https://github.com/Cocolegeek/memoire-algos-debat-public'

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
        <header className="space-y-4 border-b border-line pb-8">
          <Eyebrow>Mémoire de Master · Paris 1 Panthéon-Sorbonne</Eyebrow>
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
              {active === 'donnees' && <Datalake />}
            </>
          )}
        </main>

        {data?.verbatims && (
          <footer className="mt-12 border-t border-line pt-8">
            <Eyebrow>Ce qu'en disent les répondants</Eyebrow>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[...(data.verbatims.q19 ?? []), ...(data.verbatims.q20 ?? [])]
                .slice(0, 4)
                .map((v, i) => (
                  <blockquote
                    key={i}
                    className="rounded-xl border border-line bg-panel p-4 font-body text-sm italic text-ink-soft"
                  >
                    « {v} »
                  </blockquote>
                ))}
            </div>
            <p className="mt-6 font-mono text-xs text-muted">
              {data.meta.source}
            </p>
          </footer>
        )}
      </div>
    </div>
  )
}
