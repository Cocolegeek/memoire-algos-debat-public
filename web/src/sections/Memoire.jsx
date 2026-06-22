import { useEffect, useState } from 'react'
import { Card, Eyebrow, SectionTitle } from '../ui.jsx'

export default function Memoire() {
  const [disponible, setDisponible] = useState(false)
  const url = import.meta.env.BASE_URL + 'memoire.pdf'

  useEffect(() => {
    fetch(url, { method: 'HEAD' })
      .then((r) => setDisponible(r.ok))
      .catch(() => setDisponible(false))
  }, [url])

  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle sub="Le texte intégral du mémoire de master, déposé ici une fois finalisé.">
          Mémoire
        </SectionTitle>
      </Card>

      <Card className="overflow-hidden p-0">
        {disponible ? (
          <iframe title="Mémoire (PDF)" src={url} className="h-[80vh] w-full" />
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-2 p-6 text-center">
            <Eyebrow>En préparation</Eyebrow>
            <p className="max-w-md font-body text-sm text-muted">
              Le mémoire complet sera intégré ici dès qu'il sera finalisé et déposé dans le projet.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
