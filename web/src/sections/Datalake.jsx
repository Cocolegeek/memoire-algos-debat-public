import { useEffect, useMemo, useRef, useState } from 'react'
import Papa from 'papaparse'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge, BORD_COULEURS, Card, Caption, Eyebrow, SectionTitle, SegmentToggle } from '../ui.jsx'

const CSV_URL = import.meta.env.BASE_URL + 'reponses.csv'
const TICK_STYLE = { fontSize: 11, fontFamily: '"IBM Plex Mono", monospace', fill: '#6B6F80' }

const TYPES = [
  { value: 'barres', label: 'Barres' },
  { value: 'points', label: 'Points' },
  { value: 'histogramme', label: 'Histogramme' },
]

const LABELS_BORD = {
  extreme_gauche: 'Très à gauche',
  gauche: 'Plutôt à gauche',
  centre: 'Plutôt au centre',
  droite: 'Plutôt à droite',
  extreme_droite: 'Très à droite',
  autre: 'Ne se positionne pas',
}

const COULEUR_DONNEE = '#1F8A86'

function deburr(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// Reproduit exactement recode_politique() de analysis/analyse.py, pour que la
// coloration par bord politique dans ce bac à sable reste cohérente avec le
// reste de l'application (mêmes catégories, même palette BORD_COULEURS).
function recodePolitique(v) {
  const s = deburr(v).trim().toLowerCase()
  if (s.includes('centre')) return 'centre'
  if (s.includes('gauche')) return s.includes('plutot') ? 'gauche' : 'extreme_gauche'
  if (s.includes('droite')) return s.includes('plutot') ? 'droite' : 'extreme_droite'
  return 'autre'
}

function codeDe(entete) {
  return entete.split(' -')[0].trim()
}

function labelDe(entete, code) {
  const reste = entete.slice(entete.indexOf('-') + 1).trim()
  return reste || code
}

function estNumerique(v) {
  return /^-?\d+(\.\d+)?$/.test(String(v).trim())
}

function frac(i) {
  const x = Math.sin(i * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function tronque(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

function formatNombre(v) {
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace('.', ',')
}

function TooltipBarres({ active, payload, xLabel, yLabel }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="max-w-xs rounded-xl border border-line bg-panel px-3 py-2 font-mono text-xs shadow-[0_12px_24px_-8px_rgba(21,23,43,0.25)]">
      <div className="text-ink-soft">{d.libelle}</div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="text-muted">{yLabel}</span>
        <span className="font-medium text-ink">{formatNombre(d.valeur)}</span>
      </div>
      <div className="mt-1 text-[10px] text-muted">{xLabel}</div>
    </div>
  )
}

function TooltipPoints({ active, payload, xLabel, yLabel }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-line bg-panel px-3 py-2 font-mono text-xs shadow-[0_12px_24px_-8px_rgba(21,23,43,0.25)]">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted">{xLabel}</span>
        <span className="font-medium text-ink">{formatNombre(d.x)}</span>
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-3">
        <span className="text-muted">{yLabel}</span>
        <span className="font-medium text-ink">{formatNombre(d.y)}</span>
      </div>
    </div>
  )
}

// Exporte le SVG rendu par Recharts en PNG, sans dépendance supplémentaire :
// sérialisation du SVG, dessin sur un canvas à résolution doublée, téléchargement.
function exporterPNG(conteneurRef, nomFichier) {
  const svg = conteneurRef.current?.querySelector('svg')
  if (!svg) return
  const { width, height } = svg.getBoundingClientRect()
  const clone = svg.cloneNode(true)
  clone.setAttribute('width', width)
  clone.setAttribute('height', height)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  const source = new XMLSerializer().serializeToString(clone)
  const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }))
  const img = new Image()
  img.onload = () => {
    const echelle = 2
    const canvas = document.createElement('canvas')
    canvas.width = width * echelle
    canvas.height = height * echelle
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.scale(echelle, echelle)
    ctx.drawImage(img, 0, 0, width, height)
    URL.revokeObjectURL(url)
    canvas.toBlob((blob) => {
      if (!blob) return
      const lien = document.createElement('a')
      lien.href = URL.createObjectURL(blob)
      lien.download = nomFichier
      lien.click()
      URL.revokeObjectURL(lien.href)
    })
  }
  img.src = url
}

function exporterCSV(lignes, colonnes) {
  const objets = lignes.map((r) => {
    const o = {}
    colonnes.forEach((c) => {
      o[`${c.code} - ${c.label}`] = r[c.code]
    })
    return o
  })
  const blob = new Blob([Papa.unparse(objets)], { type: 'text/csv;charset=utf-8' })
  const lien = document.createElement('a')
  lien.href = URL.createObjectURL(blob)
  lien.download = 'reponses_filtrees.csv'
  lien.click()
  URL.revokeObjectURL(lien.href)
}

export default function Datalake() {
  const [lignes, setLignes] = useState([])
  const [colonnes, setColonnes] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)

  const [xVar, setXVar] = useState('Q5')
  const [yVar, setYVar] = useState('compte')
  const [type, setType] = useState('barres')
  const [colorerBord, setColorerBord] = useState(false)
  const [filtres, setFiltres] = useState([])

  const conteneurRef = useRef(null)

  useEffect(() => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const champs = (res.meta.fields ?? []).filter((f) => f !== 'Horodateur')
        const cols = champs.map((f) => {
          const code = codeDe(f)
          return { code, entete: f, label: labelDe(f, code) }
        })
        const data = res.data.map((row) => {
          const out = {}
          champs.forEach((f) => {
            out[codeDe(f)] = (row[f] ?? '').trim()
          })
          return out
        })
        const numeriques = new Set()
        cols.forEach(({ code }) => {
          const vals = data.map((r) => r[code]).filter((v) => v !== '')
          if (vals.length && vals.every(estNumerique)) numeriques.add(code)
        })
        setColonnes(cols.map((c) => ({ ...c, numerique: numeriques.has(c.code) })))
        setLignes(data)
        setChargement(false)
      },
      error: (err) => {
        setErreur(err.message)
        setChargement(false)
      },
    })
  }, [])

  const lignesFiltrees = useMemo(
    () => lignes.filter((r) => filtres.every((f) => !f.code || !f.valeur || r[f.code] === f.valeur)),
    [lignes, filtres]
  )

  const colNumeriques = colonnes.filter((c) => c.numerique)
  const optionsY = useMemo(
    () => [{ code: 'compte', label: 'Comptage (nombre de réponses)' }, ...colNumeriques],
    [colNumeriques]
  )

  const colX = colonnes.find((c) => c.code === xVar)
  const colY = colonnes.find((c) => c.code === yVar)

  const resultat = useMemo(() => {
    if (!colonnes.length) return null

    if (type === 'histogramme') {
      if (!colX?.numerique) {
        return { erreur: 'Choisissez une variable numérique (échelle 1 à 5, par exemple) en abscisse pour un histogramme.' }
      }
      const vals = lignesFiltrees.map((r) => parseFloat(r[xVar])).filter(Number.isFinite)
      if (!vals.length) return { erreur: 'Aucune donnée numérique disponible pour cette variable, avec ces filtres.' }
      const min = Math.min(...vals)
      const max = Math.max(...vals)
      const NB = 8
      const largeur = max > min ? (max - min) / NB : 1
      const bacs = Array.from({ length: NB }, (_, i) => ({
        debut: min + i * largeur,
        fin: min + (i + 1) * largeur,
        valeur: 0,
      }))
      vals.forEach((v) => {
        const idx = max > min ? Math.min(NB - 1, Math.floor((v - min) / largeur)) : 0
        bacs[idx].valeur += 1
      })
      const data = bacs.map((b) => ({
        libelle: `${b.debut.toFixed(1).replace('.', ',')} à ${b.fin.toFixed(1).replace('.', ',')}`,
        valeur: b.valeur,
      }))
      return { type: 'barres-verticales', data, n: vals.length }
    }

    if (type === 'points') {
      if (yVar === 'compte') {
        return { erreur: 'Choisissez une variable numérique en ordonnée (pas un comptage) pour un nuage de points.' }
      }
      if (!colX?.numerique || !colY?.numerique) {
        return { erreur: 'Le nuage de points demande deux variables numériques (échelles 1 à 5, par exemple) en abscisse et en ordonnée.' }
      }
      const points = lignesFiltrees
        .map((r, i) => {
          const x = parseFloat(r[xVar])
          const y = parseFloat(r[yVar])
          return { x: x + (frac(i) * 0.3 - 0.15), y: y + (frac(i + 7) * 0.3 - 0.15), bord: recodePolitique(r.Q5), brut: { x, y } }
        })
        .filter((p) => Number.isFinite(p.brut.x) && Number.isFinite(p.brut.y))
      if (!points.length) return { erreur: 'Aucune paire de valeurs numériques disponible avec ces filtres.' }
      return { type: 'points', data: points, n: points.length }
    }

    // Barres : regroupement par valeur de la variable X.
    const groupes = new Map()
    lignesFiltrees.forEach((r) => {
      const cle = r[xVar] || '(vide)'
      if (!groupes.has(cle)) groupes.set(cle, [])
      groupes.get(cle).push(r)
    })
    let data = Array.from(groupes.entries()).map(([cle, lignesGroupe]) => {
      let valeur
      if (yVar === 'compte') {
        valeur = lignesGroupe.length
      } else {
        const vals = lignesGroupe.map((r) => parseFloat(r[yVar])).filter(Number.isFinite)
        valeur = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
      }
      return { libelle: cle, valeur }
    })
    const tronquees = data.length > 25
    if (colX?.numerique) {
      data.sort((a, b) => parseFloat(a.libelle) - parseFloat(b.libelle))
    } else {
      data.sort((a, b) => b.valeur - a.valeur)
      data = data.slice(0, 25)
    }
    if (!data.length) return { erreur: 'Aucune donnée disponible avec ces filtres.' }
    return { type: 'barres-horizontales', data, tronquees, n: lignesFiltrees.length }
  }, [colonnes, colX, colY, lignesFiltrees, type, xVar, yVar])

  function ajouterFiltre() {
    if (!colonnes.length) return
    setFiltres((f) => [...f, { id: Date.now() + Math.random(), code: colonnes[0].code, valeur: '' }])
  }

  function retirerFiltre(id) {
    setFiltres((f) => f.filter((x) => x.id !== id))
  }

  function majFiltre(id, champ, valeur) {
    setFiltres((f) => f.map((x) => (x.id === id ? { ...x, [champ]: valeur, ...(champ === 'code' ? { valeur: '' } : {}) } : x)))
  }

  function valeursUniques(code) {
    const vals = new Set(lignes.map((r) => r[code]).filter(Boolean))
    return Array.from(vals).sort((a, b) => a.localeCompare(b, 'fr'))
  }

  const selectCls =
    'w-full rounded-lg border border-line bg-bg px-3 py-2 font-mono text-xs text-ink-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

  return (
    <div className="space-y-8">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle sub="Choisissez deux variables, un type de graphe, et des filtres : tout se recalcule dans le navigateur, sans serveur.">
            Explorer les données
          </SectionTitle>
          <Badge>Anonymisé · public</Badge>
        </div>
        <Caption>
          Ce bac à sable charge directement le CSV anonymisé de l'enquête ({lignes.length || '…'} réponses brutes,
          aucune donnée identifiante). C'est un outil d'exploration libre, pas une démonstration statistique : à la
          différence des onglets H1, H2 et H3, aucun verdict n'est calculé ici.
        </Caption>
      </Card>

      {erreur && (
        <p className="rounded-xl border border-percu-soft bg-percu-soft p-4 font-body text-sm text-percu">
          Impossible de charger le CSV ({erreur}).
        </p>
      )}

      {chargement && !erreur && <p className="font-body text-sm text-muted">Chargement du CSV…</p>}

      {!chargement && !erreur && (
        <>
          <Card>
            <Eyebrow>Variables et type de graphe</Eyebrow>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block space-y-1.5">
                <span className="font-mono text-xs text-muted">Abscisse (X)</span>
                <select className={selectCls} value={xVar} onChange={(e) => setXVar(e.target.value)}>
                  {colonnes.map((c) => (
                    <option key={c.code} value={c.code} title={c.label}>
                      {c.code} — {tronque(c.label, 42)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="font-mono text-xs text-muted">Ordonnée (Y)</span>
                <select className={selectCls} value={yVar} onChange={(e) => setYVar(e.target.value)}>
                  {optionsY.map((c) => (
                    <option key={c.code} value={c.code} title={c.label}>
                      {c.code === 'compte' ? c.label : `${c.code} — ${tronque(c.label, 36)}`}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-1.5">
                <span className="block font-mono text-xs text-muted">Type de graphe</span>
                <SegmentToggle options={TYPES} value={type} onChange={setType} label="Type de graphe" />
              </div>
            </div>

            {type === 'points' && (
              <label className="mt-4 flex items-center gap-2 font-mono text-xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={colorerBord}
                  onChange={(e) => setColorerBord(e.target.checked)}
                  className="h-4 w-4 rounded border-line accent-ink"
                />
                Colorer les points par bord politique déclaré (Q5)
              </label>
            )}
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Eyebrow>Filtres par segment</Eyebrow>
              <div className="flex gap-2">
                {filtres.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFiltres([])}
                    className="font-mono text-xs text-muted underline decoration-line decoration-1 underline-offset-4 hover:text-ink"
                  >
                    Tout effacer
                  </button>
                )}
                <button
                  type="button"
                  onClick={ajouterFiltre}
                  className="rounded-full border border-line bg-bg px-3 py-1.5 font-mono text-xs text-ink-soft transition hover:border-ink-soft hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  + Ajouter un filtre
                </button>
              </div>
            </div>

            {filtres.length === 0 ? (
              <p className="mt-3 font-body text-sm text-muted">Aucun filtre actif : le graphe porte sur l'ensemble des réponses.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {filtres.map((f) => (
                  <div key={f.id} className="flex flex-wrap items-center gap-2">
                    <select
                      className={`${selectCls} max-w-[14rem]`}
                      value={f.code}
                      onChange={(e) => majFiltre(f.id, 'code', e.target.value)}
                    >
                      {colonnes.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} — {tronque(c.label, 28)}
                        </option>
                      ))}
                    </select>
                    <select
                      className={`${selectCls} max-w-[14rem]`}
                      value={f.valeur}
                      onChange={(e) => majFiltre(f.id, 'valeur', e.target.value)}
                    >
                      <option value="">Toutes les valeurs</option>
                      {valeursUniques(f.code).map((v) => (
                        <option key={v} value={v}>
                          {tronque(v, 40)}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => retirerFiltre(f.id)}
                      aria-label="Retirer ce filtre"
                      className="rounded-full p-1.5 text-muted transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Eyebrow>Graphe</Eyebrow>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => exporterCSV(lignesFiltrees, colonnes)}
                  className="rounded-full border border-line bg-bg px-3 py-1.5 font-mono text-xs text-ink-soft transition hover:border-ink-soft hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Télécharger le CSV filtré
                </button>
                <button
                  type="button"
                  onClick={() => exporterPNG(conteneurRef, `${xVar}_${yVar}_${type}.png`)}
                  disabled={!!resultat?.erreur}
                  className="rounded-full border border-line bg-bg px-3 py-1.5 font-mono text-xs text-ink-soft transition hover:border-ink-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                >
                  Télécharger l'image (PNG)
                </button>
              </div>
            </div>

            {resultat?.erreur ? (
              <p className="mt-4 rounded-lg bg-bg p-3 font-body text-sm text-muted">{resultat.erreur}</p>
            ) : (
              <div ref={conteneurRef} className="mt-4">
                {resultat?.type === 'barres-horizontales' && (
                  <ResponsiveContainer width="100%" height={Math.max(220, Math.min(620, resultat.data.length * 34 + 50))}>
                    <BarChart data={resultat.data} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                      <CartesianGrid stroke="#D9DBE3" strokeDasharray="3 6" horizontal={false} />
                      <XAxis type="number" tick={TICK_STYLE} stroke="#D9DBE3" tickLine={false} axisLine={{ stroke: '#D9DBE3' }} />
                      <YAxis
                        type="category"
                        dataKey="libelle"
                        width={180}
                        tick={TICK_STYLE}
                        tickLine={false}
                        axisLine={{ stroke: '#D9DBE3' }}
                        tickFormatter={(v) => tronque(String(v), 26)}
                      />
                      <Tooltip
                        content={<TooltipBarres xLabel={colX?.label ?? xVar} yLabel={colY?.label ?? 'Comptage'} />}
                        cursor={{ fill: 'rgba(31,138,134,0.08)' }}
                      />
                      <Bar dataKey="valeur" fill={COULEUR_DONNEE} radius={[0, 6, 6, 0]} isAnimationActive animationDuration={400} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {resultat?.type === 'barres-verticales' && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={resultat.data} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
                      <CartesianGrid stroke="#D9DBE3" strokeDasharray="3 6" vertical={false} />
                      <XAxis dataKey="libelle" tick={TICK_STYLE} tickLine={false} axisLine={{ stroke: '#D9DBE3' }} />
                      <YAxis tick={TICK_STYLE} tickLine={false} axisLine={{ stroke: '#D9DBE3' }} width={32} />
                      <Tooltip
                        content={<TooltipBarres xLabel={colX?.label ?? xVar} yLabel="Comptage" />}
                        cursor={{ fill: 'rgba(31,138,134,0.08)' }}
                      />
                      <Bar dataKey="valeur" fill={COULEUR_DONNEE} radius={[6, 6, 0, 0]} isAnimationActive animationDuration={400} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {resultat?.type === 'points' && (
                  <>
                    <ResponsiveContainer width="100%" height={360}>
                      <ScatterChart margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                        <CartesianGrid stroke="#D9DBE3" strokeDasharray="3 6" vertical={false} />
                        <XAxis
                          type="number"
                          dataKey="x"
                          name={colX?.label}
                          tick={TICK_STYLE}
                          tickLine={false}
                          axisLine={{ stroke: '#D9DBE3' }}
                        />
                        <YAxis
                          type="number"
                          dataKey="y"
                          name={colY?.label}
                          tick={TICK_STYLE}
                          tickLine={false}
                          axisLine={{ stroke: '#D9DBE3' }}
                          width={32}
                        />
                        <Tooltip
                          content={<TooltipPoints xLabel={colX?.label ?? xVar} yLabel={colY?.label ?? yVar} />}
                          cursor={{ stroke: '#6B6F80', strokeDasharray: '3 3' }}
                        />
                        <Scatter
                          data={resultat.data}
                          isAnimationActive
                          animationDuration={400}
                          shape={(props) => {
                            const { cx, cy, payload } = props
                            const fill = colorerBord ? BORD_COULEURS[payload.bord] ?? BORD_COULEURS.autre : COULEUR_DONNEE
                            return <circle cx={cx} cy={cy} r={5} fill={fill} fillOpacity={0.85} stroke="#FFFFFF" strokeWidth={1.2} />
                          }}
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                    {colorerBord && (
                      <div className="mt-3 flex flex-wrap gap-3">
                        {Object.entries(LABELS_BORD).map(([cle, label]) => (
                          <span key={cle} className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: BORD_COULEURS[cle] }} aria-hidden="true" />
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}

                <p className="mt-3 font-mono text-xs text-muted">
                  n = {resultat?.n ?? 0} réponse{(resultat?.n ?? 0) > 1 ? 's' : ''} affichée
                  {(resultat?.n ?? 0) > 1 ? 's' : ''}
                  {resultat?.tronquees && ' · 25 catégories les plus fréquentes affichées sur un plus grand nombre'}
                  {filtres.some((f) => f.valeur) && ' · filtres actifs'}
                </p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
