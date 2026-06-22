// Décor : un maillage de nœuds reliés par des lignes, en écho visuel au sujet
// (réseaux et algorithmes). Généré en SVG pur (positions pseudo-aléatoires à
// graine fixe), donc aucun fichier image, aucune question de licence. Calculé
// une seule fois au chargement du module : c'est un décor statique, pas une
// donnée qui change.
const LARGEUR = 1600
const HAUTEUR = 900
const N_POINTS = 70

function rng(graine) {
  let s = graine
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function genererReseau() {
  const rand = rng(42)
  const points = Array.from({ length: N_POINTS }, () => ({
    x: rand() * LARGEUR,
    y: rand() * HAUTEUR,
  }))

  const aretes = []
  const vues = new Set()
  points.forEach((p, i) => {
    const voisins = points
      .map((q, j) => ({ j, d: i === j ? Infinity : Math.hypot(p.x - q.x, p.y - q.y) }))
      .sort((a, b) => a.d - b.d)
    const nVoisins = rand() < 0.3 ? 3 : 2
    voisins.slice(0, nVoisins).forEach(({ j }) => {
      const cle = i < j ? `${i}-${j}` : `${j}-${i}`
      if (vues.has(cle)) return
      vues.add(cle)
      aretes.push({ cle, x1: p.x, y1: p.y, x2: points[j].x, y2: points[j].y })
    })
  })

  return { points, aretes }
}

const RESEAU = genererReseau()

export default function NetworkBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden text-ink" aria-hidden="true">
      <svg
        viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full opacity-[0.08] dark:opacity-[0.16]"
      >
        {RESEAU.aretes.map((a) => (
          <line key={a.cle} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="currentColor" strokeWidth="1.2" />
        ))}
        {RESEAU.points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4.5" fill="currentColor" />
        ))}
      </svg>
    </div>
  )
}
