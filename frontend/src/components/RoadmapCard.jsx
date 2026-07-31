import { t } from '../lib/i18n'
import { IconAlertTriangle, IconTarget, IconUser, IconCoin } from './Icons'
import '../styles/RoadmapCard.css'

export default function RoadmapCard({ roadmap, lang }) {
  if (!roadmap) return null

  const { sprints, totalDuration, estimatedCost } = roadmap

  return (
    <div className="roadmap-card card">
      <div className="roadmap-header">
        <h3>{t(lang, 'outputs.roadmap')}</h3>
        <p className="roadmap-subtitle">Plan d'exécution par sprints</p>
      </div>

      <div className="roadmap-metrics">
        <div className="gauge">
          <div className="gauge-header">
            <span className="gauge-title">{t(lang, 'outputs.duration')}</span>
            <span className="gauge-value">{totalDuration} semaines</span>
          </div>
          <div className="gauge-bar">
            <div className="gauge-fill" style={{ width: `${(totalDuration / 26) * 100}%` }} />
          </div>
        </div>
        <div className="gauge">
          <div className="gauge-header">
            <span className="gauge-title">{t(lang, 'outputs.estimatedCost')}</span>
            <span className="gauge-value">{estimatedCost.toLocaleString()} €</span>
          </div>
          <div className="gauge-bar">
            <div className="gauge-fill" style={{ width: `${Math.min((estimatedCost / 50000) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="roadmap-timeline">
        {sprints.map((sprint, idx) => (
          <div key={idx} className="sprint-item">
            <div className="sprint-header">
              <div className="sprint-number">Sprint {sprint.sprintId}</div>
              <div className="sprint-info">
                <span className="sprint-duration">{sprint.duration}</span>
                <span className="sprint-cost">{sprint.estimatedCost.toLocaleString()}€</span>
              </div>
            </div>

            {sprint.risks && sprint.risks.length > 0 && (
              <div className="sprint-risks">
                <strong><IconAlertTriangle width={14} height={14} /> Risques:</strong> {sprint.risks.join(', ')}
              </div>
            )}

            <div className="sprint-stories">
              {sprint.stories.map((story, sidx) => (
                <div key={sidx} className="story">
                  <div className="story-id">{story.id}</div>
                  <div className="story-details">
                    <div className="story-title">{story.title}</div>
                    <div className="story-meta">
                      <span className="story-effort"><IconTarget width={13} height={13} /> {story.effort}pts</span>
                      <span className="story-assignee"><IconUser width={13} height={13} /> {story.assignee}</span>
                      <span className="story-cost"><IconCoin width={13} height={13} /> {story.cost}€</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
