import { useEffect, useId, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CartesianGrid,
  Label,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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

export function SectionTitle({ children, sub, info }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-lg font-semibold text-ink">{children}</h2>
        {info && <InfoButton {...info} />}
      </div>
      {sub && <p className="font-body text-sm text-muted">{sub}</p>}
    </div>
  )
}

export function Caption({ children }) {
  return <p className="mt-3 font-body text-sm leading-relaxed text-ink-soft">{children}</p>
}

// Icône info cliquable : ouvre une fenêtre flottante (méthodologie + données
// en entrée), fond flouté, fermeture au clic extérieur ou touche Échap.
export function InfoButton({ titre, methodologie, donnees }) {
  const [open, setOpen] = useState(false)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Méthodologie : ${titre}`}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line font-mono text-[11px] text-muted transition hover:border-ink-soft hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        i
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className="relative z-10 max-w-md rounded-2xl border border-line bg-panel p-6 shadow-[0_24px_48px_-16px_rgba(21,23,43,0.35)]"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18 }}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 id={titleId} className="font-display text-base font-semibold text-ink">
                  {titre}
                </h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fermer"
                  className="shrink-0 rounded-full p-1 text-muted transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  ✕
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div>
                  <Eyebrow>Méthodologie</Eyebrow>
                  <p className="mt-1 font-body text-sm leading-relaxed text-ink-soft">{methodologie}</p>
                </div>
                <div>
                  <Eyebrow>Données en entrée</Eyebrow>
                  <p className="mt-1 font-body text-sm leading-relaxed text-ink-soft">{donnees}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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

export function fmtP(p) {
  if (p == null) return 'p = n/d'
  if (p < 0.001) return 'p < 0,001'
  return 'p = ' + p.toFixed(3).replace('.', ',')
}

export function Signif({ p }) {
  const ok = p != null && p < 0.05
  return (
    <span className={`font-mono text-xs ${ok ? 'text-reel' : 'text-muted'}`}>
      {fmtP(p)} · {ok ? 'significatif' : 'non significatif'}
    </span>
  )
}

function TooltipNuage({ active, payload, xLabel, yLabel }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-line bg-panel px-2 py-1 font-mono text-xs text-ink-soft shadow">
      {xLabel} : {d.x} · {yLabel} : {d.y}
    </div>
  )
}

// Table de robustesse : une corrélation par ligne (prédicteur), recalculée
// dans chaque sous-groupe (colonne). predicteurs: [{label, valeurs: {cle: {r,p,n}}}]
export function TableRobustesse({ groupes, predicteurs }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse font-mono text-xs">
        <thead>
          <tr>
            <th className="border-b border-line py-2 pr-3 text-left font-medium text-muted">Prédicteur</th>
            {groupes.map((g) => (
              <th key={g.cle} className="border-b border-line px-2 py-2 text-right font-medium text-muted">
                {g.label}
                <div className="font-normal">n = {g.n}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {predicteurs.map((p) => (
            <tr key={p.cle}>
              <td className="border-b border-line py-2 pr-3 text-left font-body text-ink-soft">{p.label}</td>
              {groupes.map((g) => {
                const v = p.valeurs[g.cle]
                const ok = v.p != null && v.p < 0.05
                return (
                  <td
                    key={g.cle}
                    className={`border-b border-line px-2 py-2 text-right ${ok ? 'text-reel' : 'text-muted'}`}
                  >
                    {String(v.r).replace('.', ',')}
                    {ok && <span aria-hidden="true">*</span>}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 font-mono text-[11px] text-muted">* p &lt; 0,05</p>
    </div>
  )
}

// Nuage de points 2D avec droite de régression. points: [{x, y}].
export function Nuage({ points, xLabel, yLabel, xDomain = [1, 5], yDomain = [1, 5], droite }) {
  const seg =
    droite &&
    [
      { x: droite.xmin, y: droite.pente * droite.xmin + droite.ordonnee },
      { x: droite.xmax, y: droite.pente * droite.xmax + droite.ordonnee },
    ]
  return (
    <ResponsiveContainer width="100%" height={230}>
      <ScatterChart margin={{ top: 8, right: 12, bottom: 26, left: 0 }}>
        <CartesianGrid stroke="#D9DBE3" strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="x"
          domain={xDomain}
          tick={{ fontSize: 11 }}
          stroke="#6B6F80"
          allowDecimals={false}
        >
          <Label value={xLabel} position="insideBottom" offset={-14} style={{ fontSize: 11, fill: '#6B6F80' }} />
        </XAxis>
        <YAxis type="number" dataKey="y" domain={yDomain} tick={{ fontSize: 11 }} stroke="#6B6F80" width={32} />
        <Tooltip content={<TooltipNuage xLabel={xLabel} yLabel={yLabel} />} cursor={{ strokeDasharray: '3 3' }} />
        <Scatter data={points} fill="#1F8A86" fillOpacity={0.45} />
        {seg && <ReferenceLine segment={seg} stroke="#E06A3B" strokeWidth={2} ifOverflow="extendDomain" />}
      </ScatterChart>
    </ResponsiveContainer>
  )
}
