import { useId } from 'react'
import { motion } from 'framer-motion'

const POLE = {
  percu: { fill: 'bg-percu', track: 'bg-percu-soft', text: 'text-percu' },
  reel: { fill: 'bg-reel', track: 'bg-reel-soft', text: 'text-reel' },
  neutral: { fill: 'bg-ink-soft', track: 'bg-line', text: 'text-ink' },
}

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
    neutral: 'bg-bg text-ink-soft border-line',
    avertissement: 'bg-percu-soft text-percu border-percu-soft',
    succes: 'bg-reel-soft text-reel border-reel-soft',
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

export function SectionTitle({ children, sub }) {
  return (
    <div className="space-y-1">
      <h2 className="font-display text-lg font-semibold text-ink">{children}</h2>
      {sub && <p className="font-body text-sm text-muted">{sub}</p>}
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

function Track({ valeur, echelle, pole }) {
  const pct = echelle > 0 ? Math.min(100, Math.max(0, (valeur / echelle) * 100)) : 0
  const c = POLE[pole] ?? POLE.neutral
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full ${c.track}`}>
      <motion.div
        className={`h-full rounded-full ${c.fill}`}
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  )
}

function fmt(valeur, unite) {
  if (unite === '%') return `${valeur}%`
  return typeof valeur === 'number' ? valeur.toFixed(2).replace(/\.?0+$/, '') : valeur
}

export function EcartMetre({ titre, percu, reel, echelle, onClick, cible }) {
  const titleId = useId()
  const body = (
    <div className="space-y-4">
      {titre && (
        <h3 id={titleId} className="font-display text-base font-semibold text-ink">
          {titre}
        </h3>
      )}
      {[
        { d: percu, pole: 'percu' },
        { d: reel, pole: 'reel' },
      ].map(({ d, pole }) => (
        <div key={pole} className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-body text-sm text-ink-soft">{d.label}</span>
            <span className={`font-mono text-sm font-medium ${POLE[pole].text}`}>
              {fmt(d.valeur, d.unite)}
            </span>
          </div>
          <Track valeur={d.valeur} echelle={echelle} pole={pole} />
          {d.sous && <p className="font-body text-xs text-muted">{d.sous}</p>}
        </div>
      ))}
      {onClick && (
        <span className="inline-flex items-center gap-1 font-mono text-xs text-ink-soft">
          {cible ? `Voir ${cible}` : 'Voir le détail'} <span aria-hidden="true">→</span>
        </span>
      )}
    </div>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-labelledby={titre ? titleId : undefined}
        className="block w-full rounded-[1.25rem] border border-line bg-panel p-6 text-left shadow-[0_8px_24px_-12px_rgba(21,23,43,0.18)] transition hover:border-ink-soft hover:shadow-[0_12px_28px_-12px_rgba(21,23,43,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {body}
      </button>
    )
  }
  return (
    <div role="group" aria-labelledby={titre ? titleId : undefined}>
      {body}
    </div>
  )
}

export function BarRow({ label, valeur, echelle, pole = 'neutral', sous, affiche, active, onClick }) {
  const c = POLE[pole] ?? POLE.neutral
  const content = (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className={`font-body text-sm ${active ? 'font-semibold text-ink' : 'text-ink-soft'}`}>
          {label}
        </span>
        <span className={`font-mono text-sm font-medium ${c.text}`}>
          {affiche ?? fmt(valeur)}
        </span>
      </div>
      <Track valeur={valeur} echelle={echelle} pole={pole} />
      {sous && <p className="font-body text-xs text-muted">{sous}</p>}
    </div>
  )
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`block w-full rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
          active ? 'border-ink-soft bg-bg' : 'border-transparent hover:bg-bg'
        }`}
      >
        {content}
      </button>
    )
  }
  return <div className="p-3">{content}</div>
}

export function BigStat({ valeur, unite, label, sous, pole = 'neutral' }) {
  const c = POLE[pole] ?? POLE.neutral
  return (
    <div className="space-y-1">
      <div className={`font-display text-4xl font-bold ${c.text}`}>{fmt(valeur, unite)}</div>
      <div className="font-body text-sm font-medium text-ink">{label}</div>
      {sous && <p className="font-body text-xs text-muted">{sous}</p>}
    </div>
  )
}

export function StatTile({ valeur, label }) {
  return (
    <div className="rounded-xl border border-line bg-bg p-4">
      <div className="font-display text-2xl font-bold text-ink">{valeur}%</div>
      <div className="mt-1 font-body text-xs text-muted">{label}</div>
    </div>
  )
}

export function SegmentToggle({ options, value, onChange, label }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex gap-1 rounded-full border border-line bg-bg p-1"
    >
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-3 py-1 font-mono text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              isActive ? 'bg-ink text-bg' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function VerdictBadge({ children }) {
  return <Badge tone="succes">Verdict provisoire : {children}</Badge>
}
