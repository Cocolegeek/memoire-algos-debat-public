import { Fragment, useMemo, useState } from 'react'
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { BORD_COULEURS, Card, Eyebrow, InfoButton, SectionTitle } from '../ui.jsx'

const DSA_LABELS = {
  precis: 'Connaît précisément',
  vague: 'Connaît vaguement',
  non: "Découvre à l'instant",
}

const BORD_LABELS = { gauche: 'Gauche', droite: 'Droite' }

const INFO = {
  titre: 'Tableau des données par répondant',
  methodologie:
    "Une ligne par répondant (n = 263), recodages déjà appliqués (cf. analyse.py) : échelles 1-5 inchangées, bord politique et connaissance du DSA regroupés, indice d'hostilité et décalage individus/structures calculés. Le regroupement calcule la moyenne des colonnes numériques visibles par catégorie, comme un tableau croisé.",
  donnees: 'respondents.json, jeu anonymisé par répondant généré par analyse.py (même source que les graphes H1/H2/H3).',
}

function colonnes(labels) {
  return [
    { id: 'politique', label: 'Position politique', type: 'cat', texte: (v) => labels?.politique?.[v] ?? v },
    {
      id: 'bord',
      label: 'Bord (regroupé)',
      type: 'cat',
      texte: (v) => BORD_LABELS[v] ?? '—',
      couleur: (v) => BORD_COULEURS[v],
    },
    { id: 'age', label: 'Âge', type: 'cat', texte: (v) => v },
    { id: 'geo', label: 'Territoire', type: 'cat', texte: (v) => labels?.geo?.[v] ?? v },
    { id: 'dsa', label: 'Connaissance du DSA', type: 'cat', texte: (v) => DSA_LABELS[v] ?? v },
    { id: 'temps', label: 'Temps passé (1-5)', type: 'num' },
    { id: 'bulle', label: 'Perception de bulle (1-5)', type: 'num' },
    { id: 'exposition', label: 'Exposition aux contenus polémiques (1-5)', type: 'num' },
    { id: 'hostilite', label: "Indice d'hostilité (1-5)", type: 'num' },
    { id: 'individus', label: 'Responsabilité individuelle (1-5)', type: 'num' },
    { id: 'structures', label: 'Responsabilité structurelle (1-5)', type: 'num' },
    { id: 'decalage', label: 'Décalage individus - structures', type: 'num' },
    { id: 'demande', label: 'Demande de régulation (1-5)', type: 'num' },
  ]
}

function fmtNum(v) {
  if (v == null) return '—'
  return Number(v).toFixed(2).replace(/\.?0+$/, '')
}

function csvEscape(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function telecharger(nomFichier, contenu) {
  const blob = new Blob([contenu], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomFichier
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function appliquerFiltres(rows, filtres, cols) {
  return rows.filter((r) =>
    cols.every((c) => {
      const f = filtres[c.id]
      if (!f) return true
      if (c.type === 'cat') return !f.valeur || f.valeur === 'tous' || String(r[c.id]) === f.valeur
      const v = r[c.id]
      if (v == null) return f.min === '' && f.max === ''
      if (f.min !== '' && v < parseFloat(f.min)) return false
      if (f.max !== '' && v > parseFloat(f.max)) return false
      return true
    }),
  )
}

const inputCls =
  'rounded-lg border border-line bg-bg px-2 py-1 font-mono text-xs text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

function FiltreColonne({ col, valeur, onChange, valeursPossibles }) {
  if (col.type === 'cat') {
    return (
      <select className={inputCls} value={valeur?.valeur ?? 'tous'} onChange={(e) => onChange({ valeur: e.target.value })}>
        <option value="tous">Tous</option>
        {valeursPossibles.map((v) => (
          <option key={v} value={v}>
            {col.texte ? col.texte(v) : v}
          </option>
        ))}
      </select>
    )
  }
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        placeholder="min"
        className={`${inputCls} w-16`}
        value={valeur?.min ?? ''}
        onChange={(e) => onChange({ ...valeur, min: e.target.value })}
      />
      <span className="text-muted">–</span>
      <input
        type="number"
        placeholder="max"
        className={`${inputCls} w-16`}
        value={valeur?.max ?? ''}
        onChange={(e) => onChange({ ...valeur, max: e.target.value })}
      />
    </div>
  )
}

export default function Donnees({ respondents, labels }) {
  const cols = useMemo(() => colonnes(labels), [labels])
  const [visibles, setVisibles] = useState(() => Object.fromEntries(cols.map((c) => [c.id, true])))
  const [filtres, setFiltres] = useState({})
  const [groupBy, setGroupBy] = useState('')
  const [expanded, setExpanded] = useState(() => new Set())
  const [sorting, setSorting] = useState([])

  const colsVisibles = cols.filter((c) => visibles[c.id])
  const colsNumVisibles = colsVisibles.filter((c) => c.type === 'num')

  const valeursParColonne = useMemo(() => {
    const m = {}
    for (const c of cols) {
      if (c.type === 'cat') m[c.id] = [...new Set(respondents.map((r) => r[c.id]).filter((v) => v != null))].sort()
    }
    return m
  }, [respondents, cols])

  const filtrees = useMemo(() => appliquerFiltres(respondents, filtres, cols), [respondents, filtres, cols])

  const tableCols = useMemo(
    () =>
      colsVisibles.map((c) => ({
        accessorKey: c.id,
        header: c.label,
        cell: (info) => {
          const v = info.getValue()
          if (c.type === 'cat') {
            const couleur = c.couleur?.(v)
            return <span style={couleur ? { color: couleur } : undefined}>{c.texte ? c.texte(v) : v ?? '—'}</span>
          }
          return fmtNum(v)
        },
      })),
    [colsVisibles],
  )

  const table = useReactTable({
    data: filtrees,
    columns: tableCols,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const groupes = useMemo(() => {
    if (!groupBy) return null
    const col = cols.find((c) => c.id === groupBy)
    const map = new Map()
    for (const r of filtrees) {
      const cle = r[groupBy]
      if (!map.has(cle)) map.set(cle, [])
      map.get(cle).push(r)
    }
    return [...map.entries()]
      .map(([cle, membres]) => ({
        cle,
        label: col.texte ? col.texte(cle) : cle ?? '—',
        couleur: col.couleur?.(cle),
        n: membres.length,
        membres,
        moyennes: Object.fromEntries(
          colsNumVisibles.map((c) => [c.id, membres.reduce((s, r) => s + (r[c.id] ?? 0), 0) / membres.length]),
        ),
      }))
      .sort((a, b) => b.n - a.n)
  }, [groupBy, filtrees, cols, colsNumVisibles])

  function toggleExpand(cle) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(cle) ? next.delete(cle) : next.add(cle)
      return next
    })
  }

  function exporter() {
    if (groupes) {
      const colGroupe = cols.find((c) => c.id === groupBy)
      const header = [colGroupe.label, 'Effectif', ...colsNumVisibles.map((c) => c.label)]
      const lignes = groupes.map((g) => [g.label, g.n, ...colsNumVisibles.map((c) => fmtNum(g.moyennes[c.id]))])
      telecharger('donnees_groupees.csv', [header, ...lignes].map((l) => l.map(csvEscape).join(',')).join('\n'))
    } else {
      const header = colsVisibles.map((c) => c.label)
      const lignes = filtrees.map((r) => colsVisibles.map((c) => (c.type === 'cat' ? (c.texte ? c.texte(r[c.id]) : r[c.id]) : r[c.id])))
      telecharger('donnees_filtrees.csv', [header, ...lignes].map((l) => l.map(csvEscape).join(',')).join('\n'))
    }
  }

  if (!respondents?.length) return null

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <SectionTitle sub="Une ligne par répondant, filtrable et regroupable, à réutiliser librement.">
            Données par répondant
          </SectionTitle>
          <div className="flex items-center gap-2">
            <InfoButton {...INFO} />
            <button
              type="button"
              onClick={exporter}
              className="rounded-full border border-line bg-panel px-3 py-1.5 font-mono text-xs text-ink-soft transition hover:border-ink-soft hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              Exporter en CSV
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <Eyebrow>Colonnes affichées</Eyebrow>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {cols.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={visibles[c.id]}
                  onClick={() => setVisibles((v) => ({ ...v, [c.id]: !v[c.id] }))}
                  className={`rounded-full border px-3 py-1 font-mono text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    visibles[c.id] ? 'border-ink-soft bg-ink text-bg' : 'border-line text-muted hover:text-ink'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Filtres</Eyebrow>
              <div className="mt-2 flex flex-wrap gap-3">
                {colsVisibles.map((c) => (
                  <label key={c.id} className="flex flex-col gap-1">
                    <span className="font-mono text-[11px] text-muted">{c.label}</span>
                    <FiltreColonne
                      col={c}
                      valeur={filtres[c.id]}
                      valeursPossibles={valeursParColonne[c.id]}
                      onChange={(v) => setFiltres((f) => ({ ...f, [c.id]: v }))}
                    />
                  </label>
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-1">
              <span className="font-mono text-[11px] text-muted">Regrouper par</span>
              <select className={inputCls} value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                <option value="">Aucun regroupement</option>
                {cols
                  .filter((c) => c.type === 'cat')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <p className="font-mono text-xs text-muted">
            {filtrees.length} répondant{filtrees.length > 1 ? 's' : ''} sur {respondents.length}
            {groupes ? `, regroupés en ${groupes.length} catégories` : ''}
          </p>
        </div>
      </Card>

      <Card className="overflow-x-auto">
        {groupes ? (
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr>
                <th className="border-b border-line py-2 pr-3 text-left font-medium text-muted">
                  {cols.find((c) => c.id === groupBy).label}
                </th>
                <th className="border-b border-line px-3 py-2 text-right font-medium text-muted">Effectif</th>
                {colsNumVisibles.map((c) => (
                  <th key={c.id} className="border-b border-line px-3 py-2 text-right font-medium text-muted">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupes.map((g) => (
                <Fragment key={String(g.cle)}>
                  <tr
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleExpand(g.cle)}
                    onKeyDown={(e) => e.key === 'Enter' && toggleExpand(g.cle)}
                    className="cursor-pointer hover:bg-bg"
                  >
                    <td className="border-b border-line py-2.5 pr-3 text-left font-body text-ink-soft" style={g.couleur ? { color: g.couleur } : undefined}>
                      <span aria-hidden="true">{expanded.has(g.cle) ? '▾' : '▸'}</span> {g.label}
                    </td>
                    <td className="border-b border-line px-3 py-2.5 text-right text-ink">{g.n}</td>
                    {colsNumVisibles.map((c) => (
                      <td key={c.id} className="border-b border-line px-3 py-2.5 text-right text-ink-soft">
                        {fmtNum(g.moyennes[c.id])}
                      </td>
                    ))}
                  </tr>
                  {expanded.has(g.cle) &&
                    g.membres.map((r, i) => (
                      <tr key={i} className="bg-bg/60">
                        <td className="border-b border-line py-1.5 pr-3 pl-6 text-left text-muted" colSpan={1}>
                          Répondant {i + 1}
                        </td>
                        <td className="border-b border-line px-3 py-1.5 text-right text-muted">—</td>
                        {colsNumVisibles.map((c) => (
                          <td key={c.id} className="border-b border-line px-3 py-1.5 text-right text-muted">
                            {fmtNum(r[c.id])}
                          </td>
                        ))}
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      onClick={h.column.getToggleSortingHandler()}
                      className="cursor-pointer select-none border-b border-line py-2 px-3 text-left font-medium text-muted hover:text-ink"
                    >
                      {h.column.columnDef.header}
                      {{ asc: ' ↑', desc: ' ↓' }[h.column.getIsSorted()] ?? ''}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="border-b border-line py-2 px-3 text-left text-ink-soft">
                      {cell.column.columnDef.cell(cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
