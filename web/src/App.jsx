import { useState } from 'react'
import { Badge, Card, EcartMetre, Eyebrow, TabBar } from './ui.jsx'

const TABS = [
  { id: 'overview', label: 'Vue d’ensemble' },
  { id: 'h1', label: 'H1' },
  { id: 'h2', label: 'H2' },
  { id: 'h3', label: 'H3' },
  { id: 'donnees', label: 'Données' },
]

const DEMO = {
  overview: {
    titre: 'Aperçu de l’écart',
    percu: { label: 'Perception du public', valeur: 0.62, sous: 'Donnée de démonstration' },
    reel: { label: 'Réalité mesurée', valeur: 0.28, sous: 'Donnée de démonstration' },
    echelle: 1,
  },
  h1: {
    titre: 'Bulle perçue vs intensité d’usage',
    percu: { label: 'Perception de bulle (Q9)', valeur: 0.03, sous: 'Corrélation avec l’index d’hostilité' },
    reel: { label: 'Intensité d’usage', valeur: 0.18, sous: 'Corrélation avec l’index d’hostilité' },
    echelle: 0.3,
  },
  h2: {
    titre: 'Individus vs structures',
    percu: { label: 'Responsabilité individuelle', valeur: 3.8, sous: 'Moyenne Q16 (producteurs, partageurs)' },
    reel: { label: 'Responsabilité structurelle', valeur: 2.6, sous: 'Moyenne Q16 (plateformes, État, médias)' },
    echelle: 5,
  },
  h3: {
    titre: 'Demande de transparence vs connaissance du DSA',
    percu: { label: 'Demande de transparence', valeur: 78, unite: '%', sous: 'Part de Q18 ∈ {4,5}' },
    reel: { label: 'Connaissance précise du DSA', valeur: 15, unite: '%', sous: 'Part de Q17 = "précisément"' },
    echelle: 100,
  },
}

function App() {
  const [active, setActive] = useState('overview')
  const demo = DEMO[active] ?? DEMO.overview

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="space-y-4 border-b border-line pb-8">
          <Eyebrow>Mémoire de Master · Paris 1 Panthéon-Sorbonne</Eyebrow>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Algorithmes de recommandation et polarisation du débat public
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>n = 265</Badge>
            <Badge tone="avertissement">Chiffres provisoires</Badge>
            <a
              href="https://github.com/Cocolegeek/memoire-algos-debat-public"
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
          <Card className="max-w-md">
            <EcartMetre {...demo} />
          </Card>
          <p className="mt-4 font-body text-sm text-muted">
            Aperçu du système de design (étape 2). Le tableau de bord complet par onglet
            arrive à l’étape 3, avec les vraies données à l’étape 4.
          </p>
        </main>
      </div>
    </div>
  )
}

export default App
