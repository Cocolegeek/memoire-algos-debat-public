import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { Card, Eyebrow, SectionTitle } from '../ui.jsx'

// Dégradé politique, convention française : rouge à gauche, bleu à droite.
const COULEURS = {
  extreme_gauche: '#c81e3a',
  gauche: '#e8705f',
  centre: '#ececf2',
  droite: '#5b8ed6',
  extreme_droite: '#1f49c4',
  autre: '#8a8f9e',
}
const ORDRE = ['extreme_gauche', 'gauche', 'centre', 'droite', 'extreme_droite', 'autre']

// Variables continues mobilisables sur les axes (échelles 1 à 5).
const VARIABLES = {
  hostilite: { label: 'Hostilité', min: 1, max: 5 },
  exposition: { label: 'Exposition', min: 1, max: 5 },
  temps: { label: 'Temps passé', min: 1, max: 5, discret: true },
  bulle: { label: 'Perception de bulle', min: 1, max: 5, discret: true },
  demande: { label: 'Demande de régulation', min: 1, max: 5, discret: true },
}

const TAILLE = 6 // côté du cube de données, centré sur l'origine
const DEMI = TAILLE / 2

// Jitter déterministe (stable au re-render) pour décoller les valeurs discrètes.
function jitter(i, sel) {
  const x = Math.sin(i * 12.9898 + sel * 78.233) * 43758.5453
  return (x - Math.floor(x) - 0.5) * 0.55
}

function coord(valeur, varDef, i, sel) {
  const t = (valeur - varDef.min) / (varDef.max - varDef.min)
  let c = t * TAILLE - DEMI
  if (varDef.discret) c += jitter(i, sel)
  return c
}

function Cadre() {
  const geom = useMemo(() => new THREE.BoxGeometry(TAILLE, TAILLE, TAILLE), [])
  const edges = useMemo(() => new THREE.EdgesGeometry(geom), [geom])
  return (
    <lineSegments geometry={edges}>
      <lineBasicMaterial color="#33374e" />
    </lineSegments>
  )
}

function Graduations({ axe, varDef }) {
  // 5 repères numériques le long d'une arête du cube
  const elems = []
  for (let v = varDef.min; v <= varDef.max; v += 1) {
    const t = (v - varDef.min) / (varDef.max - varDef.min)
    const p = t * TAILLE - DEMI
    let pos
    if (axe === 'x') pos = [p, -DEMI - 0.35, DEMI]
    else if (axe === 'y') pos = [-DEMI - 0.35, p, DEMI]
    else pos = [DEMI, -DEMI - 0.35, p]
    elems.push(
      <Text key={`${axe}-${v}`} position={pos} fontSize={0.26} color="#7c8197" anchorX="center" anchorY="middle">
        {String(v)}
      </Text>
    )
  }
  return <>{elems}</>
}

function Labels({ ax }) {
  return (
    <>
      <Text position={[0, -DEMI - 1, DEMI]} fontSize={0.4} color="#aeb2c4" anchorX="center">
        {VARIABLES[ax.x].label}
      </Text>
      <Text position={[-DEMI - 1, 0, DEMI]} rotation={[0, 0, Math.PI / 2]} fontSize={0.4} color="#aeb2c4" anchorX="center">
        {VARIABLES[ax.y].label}
      </Text>
      <Text position={[DEMI, -DEMI - 1, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.4} color="#aeb2c4" anchorX="center">
        {VARIABLES[ax.z].label}
      </Text>
    </>
  )
}

function Points({ points, onHover }) {
  const geom = useMemo(() => new THREE.SphereGeometry(0.11, 16, 16), [])
  return (
    <>
      {points.map((p) => (
        <mesh
          key={p.i}
          geometry={geom}
          position={p.pos}
          onPointerOver={(e) => {
            e.stopPropagation()
            onHover(p)
          }}
          onPointerOut={() => onHover(null)}
        >
          <meshStandardMaterial
            color={COULEURS[p.politique] ?? COULEURS.autre}
            emissive={COULEURS[p.politique] ?? COULEURS.autre}
            emissiveIntensity={0.22}
            roughness={0.45}
          />
        </mesh>
      ))}
    </>
  )
}

function Selecteur({ axe, valeur, onChange }) {
  return (
    <label className="flex items-center gap-2 font-mono text-xs text-ink-soft">
      <span className="text-muted">{axe}</span>
      <select
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-line bg-panel px-2 py-1 font-mono text-xs text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        {Object.entries(VARIABLES).map(([k, v]) => (
          <option key={k} value={k}>
            {v.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function Nuage3D() {
  const [data, setData] = useState(null)
  const [erreur, setErreur] = useState(null)
  const [ax, setAx] = useState({ x: 'exposition', y: 'hostilite', z: 'temps' })
  const [masques, setMasques] = useState(() => new Set())
  const [hover, setHover] = useState(null)
  const hoverRef = useRef(null)
  hoverRef.current = hover

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'respondents.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch((e) => setErreur(e.message))
  }, [])

  const labels = data?.labels?.politique ?? {}

  const points = useMemo(() => {
    if (!data) return []
    const vx = VARIABLES[ax.x]
    const vy = VARIABLES[ax.y]
    const vz = VARIABLES[ax.z]
    const out = []
    data.repondants.forEach((r, i) => {
      if (masques.has(r.politique)) return
      const x = r[ax.x]
      const y = r[ax.y]
      const z = r[ax.z]
      if (x == null || y == null || z == null) return
      out.push({
        i,
        politique: r.politique,
        donnees: r,
        pos: [coord(x, vx, i, 1), coord(y, vy, i, 2), coord(z, vz, i, 3)],
      })
    })
    return out
  }, [data, ax, masques])

  function toggle(cat) {
    setMasques((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Eyebrow>Exploration multivariée</Eyebrow>
      </div>
      <SectionTitle sub="Chaque point est un répondant, coloré selon son bord politique. Tournez le nuage à la souris, choisissez les variables des trois axes, cliquez la légende pour filtrer.">
        Nuage 3D des répondants
      </SectionTitle>

      <Card className="!p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <Selecteur axe="X" valeur={ax.x} onChange={(v) => setAx((a) => ({ ...a, x: v }))} />
            <Selecteur axe="Y" valeur={ax.y} onChange={(v) => setAx((a) => ({ ...a, y: v }))} />
            <Selecteur axe="Z" valeur={ax.z} onChange={(v) => setAx((a) => ({ ...a, z: v }))} />
          </div>
          <span className="font-mono text-xs text-muted">{points.length} points affichés</span>
        </div>

        <div className="relative h-[520px] overflow-hidden rounded-xl bg-[#0b0c14]">
          {erreur && (
            <p className="p-4 font-mono text-xs text-percu">Données indisponibles ({erreur}).</p>
          )}
          {!data && !erreur && (
            <p className="p-4 font-mono text-xs text-[#7c8197]">Chargement du nuage…</p>
          )}
          {data && (
            <Canvas camera={{ position: [9, 7, 9], fov: 45 }} dpr={[1, 2]}>
              <color attach="background" args={['#0b0c14']} />
              <ambientLight intensity={0.7} />
              <directionalLight position={[8, 12, 6]} intensity={1.1} />
              <Cadre />
              <Graduations axe="x" varDef={VARIABLES[ax.x]} />
              <Graduations axe="y" varDef={VARIABLES[ax.y]} />
              <Graduations axe="z" varDef={VARIABLES[ax.z]} />
              <Labels ax={ax} />
              <Points points={points} onHover={setHover} />
              <OrbitControls enableDamping enablePan={false} minDistance={6} maxDistance={26} />
            </Canvas>
          )}

          {hover && (
            <div className="pointer-events-none absolute right-3 top-3 max-w-[200px] rounded-lg border border-[#2a2d40] bg-[#11131f]/95 p-3 font-mono text-[11px] text-[#d7d9e6]">
              <div className="mb-1 font-semibold" style={{ color: COULEURS[hover.politique] }}>
                {labels[hover.politique] ?? hover.politique}
              </div>
              <div>{hover.donnees.age} · {hover.donnees.geo}</div>
              <div className="mt-1 text-[#8a8f9e]">
                {VARIABLES[ax.x].label} : {fmtVal(hover.donnees[ax.x])}
                <br />
                {VARIABLES[ax.y].label} : {fmtVal(hover.donnees[ax.y])}
                <br />
                {VARIABLES[ax.z].label} : {fmtVal(hover.donnees[ax.z])}
              </div>
            </div>
          )}
        </div>

        {/* Légende cliquable */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {ORDRE.map((cat) => {
            const masque = masques.has(cat)
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggle(cat)}
                aria-pressed={!masque}
                className={`flex items-center gap-1.5 font-mono text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  masque ? 'text-muted line-through' : 'text-ink-soft'
                }`}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full border border-line"
                  style={{ backgroundColor: masque ? 'transparent' : COULEURS[cat] }}
                />
                {labels[cat] ?? cat}
              </button>
            )
          })}
        </div>
      </Card>

      <p className="font-mono text-xs text-muted">
        Données anonymisées et publiques. Les axes discrets (temps, perception de bulle, demande)
        reçoivent une légère dispersion aléatoire pour décoller les points superposés.
      </p>
    </div>
  )
}

function fmtVal(v) {
  if (v == null) return '—'
  return typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(2)) : v
}
