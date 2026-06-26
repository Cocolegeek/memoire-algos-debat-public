import { QUESTIONNAIRE } from '../data/questionnaire.js'
import { Card, Eyebrow, InfoButton, SectionTitle } from '../ui.jsx'

const INFO = {
  titre: 'Questionnaire diffusé',
  methodologie:
    "Reproduction fidèle du questionnaire diffusé en ligne, pour le consulter indépendamment des réponses collectées et de leur analyse.",
  donnees: "Énoncés et options exacts du formulaire diffusé : 20 questions réparties en 7 sections.",
}

function Options({ q }) {
  if (q.type === 'unique' || q.type === 'multiple') {
    return (
      <ul className="mt-2 space-y-1.5">
        {q.options.map((opt) => (
          <li key={opt} className="flex items-start gap-2 font-body text-sm text-ink-soft">
            <span
              aria-hidden="true"
              className={`mt-1 inline-block h-3 w-3 shrink-0 border border-line ${
                q.type === 'unique' ? 'rounded-full' : 'rounded-sm'
              }`}
            />
            {opt}
          </li>
        ))}
      </ul>
    )
  }
  if (q.type === 'echelle') {
    return (
      <div className="mt-2 flex items-center gap-3 font-mono text-xs text-muted">
        <span className="shrink-0">{q.min}</span>
        <div className="flex flex-1 items-center justify-center gap-2 px-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} aria-hidden="true" className="h-2.5 w-2.5 rounded-full border border-line" />
          ))}
        </div>
        <span className="shrink-0 text-right">{q.max}</span>
      </div>
    )
  }
  return <div aria-hidden="true" className="mt-2 h-16 rounded-lg border border-dashed border-line bg-bg" />
}

export default function Questionnaire() {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <SectionTitle sub="Les libellés et options reprennent mot pour mot le formulaire diffusé.">
            Questionnaire diffusé
          </SectionTitle>
          <InfoButton {...INFO} />
        </div>
      </Card>

      {QUESTIONNAIRE.map((section) => (
        <Card key={section.id}>
          <SectionTitle sub={section.intro}>{section.titre}</SectionTitle>
          <div className="mt-5 space-y-6">
            {section.questions.map((q) => (
              <div key={q.code} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
                <Eyebrow>{q.code}</Eyebrow>
                <p className="mt-1 font-body text-sm font-medium text-ink">{q.texte}</p>
                <Options q={q} />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
