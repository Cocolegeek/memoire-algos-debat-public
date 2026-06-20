import { Eyebrow, VerdictBadge } from '../ui.jsx'

export default function HypoHeader({ code, titre, enonce, verdict }) {
  return (
    <header className="space-y-3">
      <div className="flex items-center gap-3">
        <Eyebrow>Hypothèse {code}</Eyebrow>
        {verdict && <VerdictBadge>{verdict}</VerdictBadge>}
      </div>
      <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">{titre}</h2>
      <p className="max-w-2xl font-body text-sm text-ink-soft">{enonce}</p>
    </header>
  )
}
