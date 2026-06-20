import { Card, Eyebrow, SectionTitle } from '../ui.jsx'

export default function Datalake() {
  return (
    <Card>
      <Eyebrow>Module à venir</Eyebrow>
      <div className="mt-2">
        <SectionTitle sub="Un bac à sable pour explorer le jeu de données anonymisé directement dans le navigateur : choix des variables, filtres par segment, export du CSV filtré et de l'image du graphe.">
          Explorer les données
        </SectionTitle>
      </div>
      <p className="mt-4 font-body text-sm text-muted">
        Cet onglet sera construit à l'étape 5, une fois l'analyse définitive en place. Les données
        affichées seront anonymisées et publiques.
      </p>
    </Card>
  )
}
