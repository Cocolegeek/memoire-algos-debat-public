import { useId } from 'react'
import { motion } from 'framer-motion'

export function Eyebrow({ children, className = '' }) {
  return (
    <span
      className={`font-mono text-xs uppercase tracking-wider text-muted ${className}`}
    >
      {children}
    </span>
  )
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-panel text-ink-soft border-line',
    avertissement: 'bg-percu-soft text-percu border-percu-soft',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-mono text-xs ${tones[tone]}`}
    >
      {children}
    </span>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-[1.25rem] border border-line bg-panel p-6 shadow-[0_8px_24px_-12px_rgba(21,23,43,0.18)] ${className}`}
    >
      {children}
    </div>
  )
}

export function TabBar({ tabs, active, onChange }) {
  return (
    <nav
      role="tablist"
      aria-label="Sections du tableau de bord"
      className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-panel p-1"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative rounded-full px-4 py-2 font-display text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              isActive ? 'text-bg' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: 'spring', duration: 0.4, bounce: 0.2 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function Bar({ valeur, echelle, color, track }) {
  const pct = echelle > 0 ? Math.min(100, Math.max(0, (valeur / echelle) * 100)) : 0
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full ${track}`}>
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}

function formatValeur(valeur, unite) {
  if (unite === '%') return `${valeur}%`
  return typeof valeur === 'number' ? valeur.toFixed(2).replace(/\.00$/, '') : valeur
}

export function EcartMetre({ titre, percu, reel, echelle }) {
  const titleId = useId()
  return (
    <div role="group" aria-labelledby={titre ? titleId : undefined} className="space-y-4">
      {titre && (
        <h3 id={titleId} className="font-display text-base font-semibold text-ink">
          {titre}
        </h3>
      )}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-body text-sm text-ink-soft">{percu.label}</span>
          <span className="font-mono text-sm font-medium text-percu">
            {formatValeur(percu.valeur, percu.unite)}
          </span>
        </div>
        <Bar valeur={percu.valeur} echelle={echelle} color="bg-percu" track="bg-percu-soft" />
        {percu.sous && <p className="font-body text-xs text-muted">{percu.sous}</p>}
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-body text-sm text-ink-soft">{reel.label}</span>
          <span className="font-mono text-sm font-medium text-reel">
            {formatValeur(reel.valeur, reel.unite)}
          </span>
        </div>
        <Bar valeur={reel.valeur} echelle={echelle} color="bg-reel" track="bg-reel-soft" />
        {reel.sous && <p className="font-body text-xs text-muted">{reel.sous}</p>}
      </div>
    </div>
  )
}
