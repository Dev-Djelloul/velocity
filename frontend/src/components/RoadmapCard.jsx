import { t } from '../lib/i18n'

export default function RoadmapCard({ roadmap, lang }) {
  return (
    <div className="card plan-card">
      <h3>{t(lang, 'outputs.roadmap')}</h3>
      <p className="card-subtitle">{roadmap.totalDuration} {t(lang, 'outputs.weeks')} · {roadmap.estimatedCost.toLocaleString()} €</p>

      <div className="sprint-list">
        {roadmap.sprints.map(sprint => (
          <div key={sprint.sprintId} className="sprint">
            <div className="sprint-header">
              <strong>{t(lang, 'outputs.sprint')} {sprint.sprintId}</strong>
              <span>{sprint.estimatedCost.toLocaleString()} €</span>
            </div>
            <ul>
              {sprint.stories.map(story => (
                <li key={story.id}>
                  <span className="story-id">{story.id}</span> {story.title}
                  <span className="story-meta">
                    {story.assignee} · {t(lang, 'outputs.effort')} {story.effort} · {story.cost} €
                    {story.dependsOn.length > 0 && ` · ${t(lang, 'outputs.dependsOn')} ${story.dependsOn.join(', ')}`}
                  </span>
                </li>
              ))}
            </ul>
            {sprint.risks.length > 0 && (
              <div className="sprint-risks">
                {sprint.risks.map((r, i) => (
                  <div key={i}>⚠️ {r.risk} — {r.mitigation}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
