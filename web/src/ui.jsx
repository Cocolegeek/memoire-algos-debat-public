import { useEffect, useId, useState } from 'react'
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion'
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
import { useTheme } from './theme-context.js'
import { CHART } from './chart-colors.js'

const POLE = {
  percu: { fill: 'bg-percu', track: 'bg-percu-soft', text: 'text-percu' },
  reel: { fill: 'bg-reel', track: 'bg-reel-soft', text: 'text-reel' },
  neutral: { fill: 'bg-ink-soft', track: 'bg-line', text: 'text-ink' },
}

// Palette du bord politique, utilisée partout où un graphe distingue gauche
// et droite (tableau de robustesse H1, contrastes H2.a, demande par bord H3).
export const BORD_COULEURS = {
  extreme_gauche: '#c81e3a',
  gauche: '#e8705f',
  centre: '#9aa0b4',
  droite: '#5b8ed6',
  extreme_droite: '#1f49c4',
  autre: '#8a8f9e',
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

// Espace de copie d'une référence prête à l'emploi (note de bas de page,
// bibliographie), pour quiconque réutilise les résultats hors de cette page.
export function CitationAPA({ texte }) {
  const [copie, setCopie] = useState(false)

  async function copier() {
    try {
      await navigator.clipboard.writeText(texte)
      setCopie(true)
      setTimeout(() => setCopie(false), 1800)
    } catch {
      // Clipboard indisponible (contexte non sécurisé) : pas de repli nécessaire.
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-line bg-panel/60 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <p className="font-mono text-xs leading-relaxed text-ink-soft">{texte}</p>
      <button
        type="button"
        onClick={copier}
        className="shrink-0 self-start rounded-full border border-line bg-panel px-3 py-1.5 font-mono text-xs text-ink-soft transition hover:border-ink-soft hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:self-auto"
      >
        {copie ? 'Copié ✓' : 'Copier la référence'}
      </button>
    </div>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-[1.25rem] border border-line bg-panel/75 p-6 shadow-[0_8px_24px_-12px_rgba(21,23,43,0.18)] backdrop-blur-xl ${className}`}
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
              className="relative z-10 max-w-md rounded-2xl border border-line bg-panel/95 p-6 shadow-[0_24px_48px_-16px_rgba(21,23,43,0.35)] backdrop-blur-2xl"
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

// Barre flottante ancrée en haut du viewport (position fixed, hors du flux),
// avec un effet de défilement discret : la pilule se resserre et s'opacifie
// une fois qu'on a quitté le tout haut de la page, pour rester lisible sans
// jamais bouger brutalement.
export function FloatingNav({ children }) {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 16))

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-3 sm:pt-4">
      <motion.div
        className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center justify-center gap-2 rounded-full border-2 bg-panel/90 p-1.5 backdrop-blur-lg sm:flex-nowrap sm:justify-between sm:gap-4"
        animate={{
          boxShadow: scrolled
            ? '0 14px 32px -14px rgba(21,23,43,0.4)'
            : '0 8px 20px -14px rgba(21,23,43,0.22)',
          scale: scrolled ? 0.98 : 1,
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{ borderColor: 'var(--color-line)' }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export function TabBar({ tabs, active, onChange }) {
  return (
    <nav
      role="tablist"
      aria-label="Sections du tableau de bord"
      className="inline-flex flex-wrap gap-1"
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
            className={`relative rounded-full px-3 py-1.5 font-display text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:px-4 sm:py-2 ${
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

export function ThemeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      aria-pressed={dark}
      className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-ink-soft transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={dark ? 'dark' : 'light'}
          aria-hidden="true"
          className="block text-base"
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {dark ? '☾' : '☀'}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

function Track({ valeur, echelle, pole, couleur }) {
  const pct = echelle > 0 ? Math.min(100, Math.max(0, (valeur / echelle) * 100)) : 0
  const c = POLE[pole] ?? POLE.neutral
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full ${couleur ? 'bg-line' : c.track}`}>
      <motion.div
        className={`h-full rounded-full ${couleur ? '' : c.fill}`}
        style={couleur ? { backgroundColor: couleur } : undefined}
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
        className="block w-full rounded-[1.25rem] border border-line bg-panel/75 p-6 text-left shadow-[0_8px_24px_-12px_rgba(21,23,43,0.18)] backdrop-blur-xl transition hover:border-ink-soft hover:shadow-[0_12px_28px_-12px_rgba(21,23,43,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
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

export function BarRow({ label, valeur, echelle, pole = 'neutral', couleur, sous, affiche, active, onClick }) {
  const c = POLE[pole] ?? POLE.neutral
  const content = (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className={`font-body text-sm ${active ? 'font-semibold text-ink' : 'text-ink-soft'}`}>
          {label}
        </span>
        <span
          className={`font-mono text-sm font-medium ${couleur ? '' : c.text}`}
          style={couleur ? { color: couleur } : undefined}
        >
          {affiche ?? fmt(valeur)}
        </span>
      </div>
      <Track valeur={valeur} echelle={echelle} pole={pole} couleur={couleur} />
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
  return <Badge tone="succes">Verdict : {children}</Badge>
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
    <div className="rounded-xl border border-line bg-panel px-3 py-2 font-mono text-xs shadow-[0_12px_24px_-8px_rgba(21,23,43,0.25)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted">{xLabel}</span>
        <span className="font-medium text-ink">{d.x}</span>
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-3">
        <span className="text-muted">{yLabel}</span>
        <span className="font-medium text-ink">{d.y}</span>
      </div>
    </div>
  )
}

const TICK_FONT = { fontSize: 11, fontFamily: '"IBM Plex Mono", monospace' }

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
              <th
                key={g.cle}
                className="border-b border-line px-3 py-2 text-right font-medium"
                style={BORD_COULEURS[g.cle] ? { color: BORD_COULEURS[g.cle] } : undefined}
              >
                <span className={BORD_COULEURS[g.cle] ? '' : 'text-muted'}>{g.label}</span>
                <div className="font-normal text-muted">n = {g.n}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {predicteurs.map((p) => (
            <tr key={p.cle}>
              <td className="border-b border-line py-2.5 pr-3 text-left font-body text-ink-soft">{p.label}</td>
              {groupes.map((g) => {
                const v = p.valeurs[g.cle]
                const ok = v.p != null && v.p < 0.05
                return (
                  <td
                    key={g.cle}
                    className={`border-b border-line px-3 py-2.5 text-right ${ok ? 'text-reel' : 'text-muted'}`}
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

// Diagramme à points avec droite de tendance. points: [{x, y, couleur?, r?}].
// Axes systématiquement légendés et segmentés par des graduations explicites
// (lisible sans ouvrir la méthodologie). couleur/r par point permettent de
// réutiliser ce composant pour un nuage catégoriel (ex. bord politique).
export function Nuage({
  points,
  xLabel,
  yLabel,
  xDomain = [1, 5],
  yDomain = [1, 5],
  xTicks,
  yTicks,
  xTickFormatter,
  droite,
  refX,
  refXLabel,
  height = 250,
}) {
  const seg =
    droite &&
    [
      { x: droite.xmin, y: droite.pente * droite.xmin + droite.ordonnee },
      { x: droite.xmax, y: droite.pente * droite.xmax + droite.ordonnee },
    ]
  const gradientId = useId()
  const { dark } = useTheme()
  const c = dark ? CHART.dark : CHART.light
  const tick = { ...TICK_FONT, fill: c.muted }
  return (
    // Hauteur fluide entre mobile et desktop : évite un graphe écrasé en
    // portrait et un graphe disproportionné en paysage, sans JS de resize.
    <div className="w-full" style={{ height: `clamp(240px, 62vw, ${height}px)` }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 20, bottom: 32, left: 20 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={c.percu} stopOpacity={0.5} />
              <stop offset="50%" stopColor={c.percu} stopOpacity={1} />
              <stop offset="100%" stopColor={c.percu} stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={c.line} strokeDasharray="3 6" vertical={false} />
          <XAxis
            type="number"
            dataKey="x"
            domain={xDomain}
            ticks={xTicks}
            tickFormatter={xTickFormatter}
            tick={tick}
            tickLine={false}
            axisLine={{ stroke: c.line }}
            allowDecimals={xTicks ? undefined : false}
          >
            <Label value={xLabel} position="insideBottom" offset={-22} style={{ ...TICK_FONT, fill: c.muted }} />
          </XAxis>
          <YAxis
            type="number"
            dataKey="y"
            domain={yDomain}
            ticks={yTicks}
            tick={tick}
            tickLine={false}
            axisLine={{ stroke: c.line }}
            width={36}
          >
            <Label
              value={yLabel}
              angle={-90}
              position="insideLeft"
              style={{ ...TICK_FONT, fill: c.muted, textAnchor: 'middle' }}
            />
          </YAxis>
          <Tooltip content={<TooltipNuage xLabel={xLabel} yLabel={yLabel} />} cursor={{ stroke: c.muted, strokeDasharray: '3 3' }} />
          <Scatter
            data={points}
            isAnimationActive
            animationDuration={500}
            shape={(props) => {
              const { cx, cy, payload } = props
              const couleur = payload.couleur
              const r = payload.r ?? 5.5
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={couleur ?? c.reel}
                  fillOpacity={couleur ? 0.88 : 0.5}
                  stroke={couleur ?? c.reel}
                  strokeOpacity={0.9}
                  strokeWidth={1}
                />
              )
            }}
            activeShape={(props) => {
              const { cx, cy, payload } = props
              const couleur = payload.couleur ?? c.reel
              const r = (payload.r ?? 5.5) + 2.5
              return <circle cx={cx} cy={cy} r={r} fill={couleur} fillOpacity={0.95} stroke="var(--color-panel)" strokeWidth={2} />
            }}
          />
          {seg && (
            <ReferenceLine
              segment={seg}
              stroke={`url(#${gradientId})`}
              strokeWidth={2.5}
              strokeLinecap="round"
              ifOverflow="extendDomain"
            />
          )}
          {refX != null && (
            <ReferenceLine x={refX} stroke={c.muted} strokeDasharray="4 4">
              {refXLabel && (
                <Label
                  value={refXLabel}
                  position="insideTopRight"
                  style={{ fontSize: 10, fontFamily: '"IBM Plex Mono", monospace', fill: c.muted }}
                />
              )}
            </ReferenceLine>
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
