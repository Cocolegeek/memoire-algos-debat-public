import { Fragment, useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Card, Eyebrow, InfoButton, SectionTitle } from '../ui.jsx'

const SEUIL_CATEGORIEL = 20

const INFO = {
  titre: 'Tableau des données brutes',
  methodologie:
    "Une ligne par réponse au questionnaire (export Google Forms brut, reponses.csv, sans exclusion ni recodage). Chaque colonne du CSV est analysée automatiquement : numérique (filtre min/max), catégorielle si elle a peu de valeurs distinctes (filtre par liste, éligible au regroupement), sinon texte libre (filtre par contenu). Le regroupement calcule la moyenne des colonnes numériques visibles par catégorie.",
  donnees: "reponses.csv, export brut du questionnaire (toutes les colonnes Q1 à Q20, y compris les réponses libres Q19/Q20).",
}

function detecterColonnes(rows, fields) {
  return fields.map((header) => {
    const code = header.split(' -')[0].trim()
    const valeurs = rows.map((r) => (r[header] ?? '').trim()).filter((v) => v !== '')
    const uniques = [...new Set(valeurs)]
    const numerique = valeurs.length > 0 && valeurs.every((v) => Number.isFinite(Number(v.replace(',', '.'))))
    const type = numerique ? 'num' : uniques.length > 0 && uniques.length <= SEUIL_CATEGORIEL ? 'cat' : 'texte'
    return { id: header, code, titre: header, type, valeursPossibles: type === 'cat' ? uniques.sort() : null }
  })
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
      const brut = r[c.id]
      if (c.type === 'cat') return !f.valeur || f.valeur === 'tous' || brut === f.valeur
      if (c.type === 'texte') return !f.texte || (brut ?? '').toLowerCase().includes(f.texte.toLowerCase())
      const v = brut === '' || brut == null ? null : Number(String(brut).replace(',', '.'))
      if (v == null) return f.min === '' && f.max === ''
      if (f.min !== '' && v < parseFloat(f.min)) return false
      if (f.max !== '' && v > parseFloat(f.max)) return false
      return true
    }),
  )
}

const inputCls =
  'w-full rounded-lg border border-line bg-bg px-2 py-1 font-mono text-xs text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

function FiltreColonne({ col, valeur, onChange }) {
  if (col.type === 'cat') {
    return (
      <select className={inputCls} value={valeur?.valeur ?? 'tous'} onChange={(e) => onChange({ valeur: e.target.value })}>
        <option value="tous">Tous</option>
        {col.valeursPossibles.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    )
  }
  if (col.type === 'texte') {
    return (
      <input
        type="text"
        placeholder="contient…"
        className={inputCls}
        value={valeur?.texte ?? ''}
        onChange={(e) => onChange({ texte: e.target.value })}
      />
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

function PanneauFiltres({ ouvert, onToggle, cols, visibles, setVisibles, filtres, setFiltres, groupBy, setGroupBy }) {
  return (
    <aside className={`shrink-0 transition-all duration-300 ${ouvert ? 'w-full sm:w-72' : 'w-full sm:w-12'}`}>
      <Card className="sm:sticky sm:top-24">
        <div className="flex items-center justify-between gap-2">
          {ouvert && <SectionTitle>Paramètres</SectionTitle>}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={ouvert}
            aria-label={ouvert ? 'Replier les paramètres' : 'Déplier les paramètres'}
            className="ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft transition hover:border-ink-soft hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <span aria-hidden="true">{ouvert ? '‹' : '›'}</span>
          </button>
        </div>

        {ouvert && (
          <div className="mt-4 space-y-5">
            <div>
              <Eyebrow>Colonnes affichées</Eyebrow>
              <div className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
                {cols.map((c) => (
                  <label key={c.id} className="flex items-start gap-2 font-mono text-xs leading-snug text-ink-soft">
                    <input
                      type="checkbox"
                      checked={!!visibles[c.id]}
                      onChange={() => setVisibles((v) => ({ ...v, [c.id]: !v[c.id] }))}
                      className="mt-0.5 accent-ink"
                    />
                    <span>{c.titre}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Eyebrow>Filtres</Eyebrow>
              <div className="mt-2 space-y-3">
                {cols
                  .filter((c) => visibles[c.id])
                  .map((c) => (
                    <label key={c.id} className="flex flex-col gap-1">
                      <span className="font-mono text-[11px] leading-snug text-muted">{c.titre}</span>
                      <FiltreColonne col={c} valeur={filtres[c.id]} onChange={(v) => setFiltres((f) => ({ ...f, [c.id]: v }))} />
                    </label>
                  ))}
              </div>
            </div>

            <label className="flex flex-col gap-1">
              <Eyebrow>Regrouper par</Eyebrow>
              <select className={`${inputCls} mt-2`} value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                <option value="">Aucun regroupement</option>
                {cols
                  .filter((c) => c.type === 'cat')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.titre}
                    </option>
                  ))}
              </select>
            </label>
          </div>
        )}
      </Card>
    </aside>
  )
}

export default function Donnees() {
  const [rows, setRows] = useState(null)
  const [fields, setFields] = useState([])
  const [erreur, setErreur] = useState(null)
  const [sidebarOuvert, setSidebarOuvert] = useState(true)
  const [visibles, setVisibles] = useState({})
  const [filtres, setFiltres] = useState({})
  const [groupBy, setGroupBy] = useState('')
  const [expanded, setExpanded] = useState(() => new Set())
  const [sorting, setSorting] = useState([])

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'reponses.csv')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.text()
      })
      .then((texte) => {
        const { data, meta } = Papa.parse(texte, { header: true, skipEmptyLines: true })
        setRows(data)
        setFields(meta.fields ?? [])
        setVisibles(Object.fromEntries((meta.fields ?? []).map((f) => [f, true])))
      })
      .catch((e) => setErreur(e.message))
  }, [])

  const cols = useMemo(() => (rows ? detecterColonnes(rows, fields) : []), [rows, fields])
  const colsVisibles = cols.filter((c) => visibles[c.id])
  const colsNumVisibles = colsVisibles.filter((c) => c.type === 'num')

  const filtrees = useMemo(() => appliquerFiltres(rows ?? [], filtres, cols), [rows, filtres, cols])

  const tableCols = useMemo(
    () =>
      colsVisibles.map((c) => ({
        accessorKey: c.id,
        header: c.titre,
        sortingFn: c.type === 'num' ? (a, b) => Number(a.getValue(c.id) || 0) - Number(b.getValue(c.id) || 0) : undefined,
        cell: (info) => info.getValue() || '—',
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
    const map = new Map()
    for (const r of filtrees) {
      const cle = r[groupBy] || '—'
      if (!map.has(cle)) map.set(cle, [])
      map.get(cle).push(r)
    }
    return [...map.entries()]
      .map(([cle, membres]) => ({
        cle,
        n: membres.length,
        membres,
        moyennes: Object.fromEntries(
          colsNumVisibles.map((c) => [
            c.id,
            membres.reduce((s, r) => s + (Number(String(r[c.id]).replace(',', '.')) || 0), 0) / membres.length,
          ]),
        ),
      }))
      .sort((a, b) => b.n - a.n)
  }, [groupBy, filtrees, colsNumVisibles])

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
      const header = [colGroupe?.titre ?? groupBy, 'Effectif', ...colsNumVisibles.map((c) => c.titre)]
      const lignes = groupes.map((g) => [g.cle, g.n, ...colsNumVisibles.map((c) => g.moyennes[c.id].toFixed(2))])
      telecharger('donnees_groupees.csv', [header, ...lignes].map((l) => l.map(csvEscape).join(',')).join('\n'))
    } else {
      const header = colsVisibles.map((c) => c.titre)
      const lignes = filtrees.map((r) => colsVisibles.map((c) => r[c.id]))
      telecharger('donnees_filtrees.csv', [header, ...lignes].map((l) => l.map(csvEscape).join(',')).join('\n'))
    }
  }

  if (erreur) {
    return (
      <p className="rounded-xl border border-percu-soft bg-percu-soft p-4 font-body text-sm text-percu">
        Impossible de charger les données brutes ({erreur}).
      </p>
    )
  }
  if (!rows) return <p className="font-body text-sm text-muted">Chargement des données…</p>

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <PanneauFiltres
        ouvert={sidebarOuvert}
        onToggle={() => setSidebarOuvert((v) => !v)}
        cols={cols}
        visibles={visibles}
        setVisibles={setVisibles}
        filtres={filtres}
        setFiltres={setFiltres}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
      />

      <div className="min-w-0 flex-1 space-y-4">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <SectionTitle sub="Toutes les colonnes du CSV brut, sans recodage. Défilement horizontal pour les colonnes hors champ.">
              Données brutes
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
          <p className="mt-3 font-mono text-xs text-muted">
            {filtrees.length} réponse{filtrees.length > 1 ? 's' : ''} sur {rows.length}
            {groupes ? `, regroupées en ${groupes.length} catégories` : ''}
          </p>
        </Card>

        <Card className="overflow-x-auto">
          {groupes ? (
            <table className="border-collapse font-mono text-xs">
              <thead>
                <tr>
                  <th className="whitespace-nowrap border-b border-line py-2 pr-3 text-left font-medium text-muted">
                    {cols.find((c) => c.id === groupBy)?.titre ?? groupBy}
                  </th>
                  <th className="whitespace-nowrap border-b border-line px-3 py-2 text-right font-medium text-muted">Effectif</th>
                  {colsNumVisibles.map((c) => (
                    <th key={c.id} className="whitespace-nowrap border-b border-line px-3 py-2 text-right font-medium text-muted">
                      {c.titre}
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
                      <td className="whitespace-nowrap border-b border-line py-2.5 pr-3 text-left font-body text-ink-soft">
                        <span aria-hidden="true">{expanded.has(g.cle) ? '▾' : '▸'}</span> {g.cle}
                      </td>
                      <td className="whitespace-nowrap border-b border-line px-3 py-2.5 text-right text-ink">{g.n}</td>
                      {colsNumVisibles.map((c) => (
                        <td key={c.id} className="whitespace-nowrap border-b border-line px-3 py-2.5 text-right text-ink-soft">
                          {g.moyennes[c.id].toFixed(2)}
                        </td>
                      ))}
                    </tr>
                    {expanded.has(g.cle) &&
                      g.membres.map((r, i) => (
                        <tr key={i} className="bg-bg/60">
                          <td className="whitespace-nowrap border-b border-line py-1.5 pr-3 pl-6 text-left text-muted">Réponse {i + 1}</td>
                          <td className="whitespace-nowrap border-b border-line px-3 py-1.5 text-right text-muted">—</td>
                          {colsNumVisibles.map((c) => (
                            <td key={c.id} className="whitespace-nowrap border-b border-line px-3 py-1.5 text-right text-muted">
                              {r[c.id] || '—'}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="border-collapse font-mono text-xs">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        onClick={h.column.getToggleSortingHandler()}
                        className="cursor-pointer select-none whitespace-nowrap border-b border-line px-3 py-2 text-left font-medium text-muted hover:text-ink"
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
                      <td
                        key={cell.id}
                        title={cell.getValue() || undefined}
                        className="max-w-xs truncate whitespace-nowrap border-b border-line px-3 py-2 text-left text-ink-soft"
                      >
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
    </div>
  )
}
