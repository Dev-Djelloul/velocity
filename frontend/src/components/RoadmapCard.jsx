import { useState } from 'react'
import { t } from '../lib/i18n'
import { validateRoadmap } from '../lib/roadmapValidator'
import { IconAlertTriangle, IconTarget, IconUser, IconCoin, IconCircleDot, IconCheckCircle, IconChevronRight } from './Icons'
import '../styles/RoadmapCard.css'

const SPRINT_DAYS = 14

function sprintDates(generatedAt, sprintId) {
  const start = new Date(generatedAt || Date.now())
  start.setDate(start.getDate() + (sprintId - 1) * SPRINT_DAYS)
  const end = new Date(start)
  end.setDate(end.getDate() + SPRINT_DAYS)
  return { start, end }
}

function formatRange(start, end, lang) {
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  const opts = { day: 'numeric', month: 'short' }
  return `${start.toLocaleDateString(locale, opts)} → ${end.toLocaleDateString(locale, opts)}`
}

export default function RoadmapCard({ roadmap, lang, generatedAt, onRoadmapChange }) {
  const [issuesExpanded, setIssuesExpanded] = useState(false)
  const [expandedStories, setExpandedStories] = useState(() => new Set())

  const toggleStoryDetails = (storyId) => {
    setExpandedStories(prev => {
      const next = new Set(prev)
      next.has(storyId) ? next.delete(storyId) : next.add(storyId)
      return next
    })
  }

  if (!roadmap) return null

  const { sprints, totalDuration, estimatedCost } = roadmap
  const now = new Date()
  const issues = validateRoadmap(roadmap)

  const currentSprint = sprints.find(sp => sprintDates(generatedAt, sp.sprintId).end >= now) || sprints[sprints.length - 1]

  const overdue = []
  sprints.forEach(sp => {
    if (sp.sprintId >= currentSprint.sprintId) return
    sp.stories.forEach(story => {
      if (story.status !== 'done') overdue.push({ sprintId: sp.sprintId, story })
    })
  })

  const toggleStory = (sprintId, storyId) => {
    const nextSprints = sprints.map(sp => {
      if (sp.sprintId !== sprintId) return sp
      return {
        ...sp,
        stories: sp.stories.map(s => {
          if (s.id !== storyId) return s
          const nowDone = s.status !== 'done'
          return { ...s, status: nowDone ? 'done' : 'todo', completedAt: nowDone ? new Date().toISOString() : null }
        })
      }
    })
    onRoadmapChange?.({ ...roadmap, sprints: nextSprints })
  }

  const rolloverStory = (fromSprintId, story) => {
    const nextSprints = sprints.map(sp => {
      if (sp.sprintId === fromSprintId) return { ...sp, stories: sp.stories.filter(s => s.id !== story.id) }
      if (sp.sprintId === currentSprint.sprintId) return { ...sp, stories: [...sp.stories, story] }
      return sp
    })
    onRoadmapChange?.({ ...roadmap, sprints: nextSprints })
  }

  return (
    <div className="roadmap-card card">
      <div className="roadmap-header">
        <h3>{t(lang, 'outputs.roadmap')}</h3>
        <p className="roadmap-subtitle">{t(lang, 'outputs.roadmapSubtitle')}</p>
      </div>

      <div className="roadmap-metrics">
        <div className="gauge">
          <div className="gauge-header">
            <span className="gauge-title">{t(lang, 'outputs.duration')}</span>
            <span className="gauge-value">{totalDuration} {t(lang, 'outputs.weeks')}</span>
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

      {issues.length > 0 && (
        <div className="roadmap-issues-banner">
          <button
            type="button"
            className="roadmap-issues-title roadmap-issues-toggle"
            onClick={() => setIssuesExpanded(v => !v)}
          >
            <IconAlertTriangle width={14} height={14} /> {issues.length} · {t(lang, 'roadmapIssues.title')}
            <span className="roadmap-issues-chevron">{issuesExpanded ? '▾' : '▸'}</span>
          </button>
          {issuesExpanded && (
            <div className="roadmap-issues-list">
              {issues.map((issue, i) => (
                <div key={i} className="roadmap-issue-item">
                  <span className={`issue-tag issue-${issue.type}`}>{t(lang, `roadmapIssues.${issue.type}`)}</span>
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {overdue.length > 0 && (
        <div className="rollover-banner">
          <div className="rollover-banner-title">
            <IconAlertTriangle width={14} height={14} /> {overdue.length} · {t(lang, 'outputs.rollover.overdue')}
          </div>
          <div className="rollover-list">
            {overdue.map(({ sprintId, story }) => (
              <div key={story.id} className="rollover-item">
                <span><span className="story-id">{story.id}</span> {story.title}</span>
                <button className="rollover-move-btn" onClick={() => rolloverStory(sprintId, story)}>
                  {t(lang, 'outputs.rollover.moveToCurrent')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="roadmap-timeline">
        {sprints.map((sprint, idx) => {
          const { start, end } = sprintDates(generatedAt, sprint.sprintId)
          const isCurrent = sprint.sprintId === currentSprint.sprintId
          const doneEffort = sprint.stories.filter(s => s.status === 'done').reduce((s, x) => s + x.effort, 0)
          const totalEffort = sprint.stories.reduce((s, x) => s + x.effort, 0)

          return (
            <div key={idx} className={`sprint-item ${isCurrent ? 'sprint-current' : ''}`}>
              <div className="sprint-header">
                <div className="sprint-number">
                  Sprint {sprint.sprintId}
                  {isCurrent && <span className="sprint-current-tag">{t(lang, 'outputs.rollover.current')}</span>}
                </div>
                <div className="sprint-info">
                  <span className="sprint-dates">{formatRange(start, end, lang)}</span>
                  <span className="sprint-velocity">{doneEffort}/{totalEffort}pts {t(lang, 'outputs.rollover.progress')}</span>
                  <span className="sprint-cost">{sprint.estimatedCost.toLocaleString()}€</span>
                </div>
              </div>

              {sprint.risks && sprint.risks.length > 0 && (
                <div className="sprint-risks">
                  <strong><IconAlertTriangle width={14} height={14} /> {t(lang, 'outputs.risksLabel')}:</strong> {sprint.risks.map(r => r.risk).join(', ')}
                  {sprint.risks.some(r => r.mitigation) && (
                    <div className="sprint-risks-mitigation">
                      {sprint.risks.filter(r => r.mitigation).map(r => r.mitigation).join(' · ')}
                    </div>
                  )}
                </div>
              )}

              <div className="sprint-stories">
                {sprint.stories.map((story, sidx) => {
                  const expanded = expandedStories.has(story.id)
                  const hasDetails = story.description || story.acceptanceCriteria?.length > 0
                  return (
                    <div key={sidx} className={`story ${story.status === 'done' ? 'story-done' : ''}`}>
                      <button
                        className="story-status-toggle"
                        onClick={() => toggleStory(sprint.sprintId, story.id)}
                        title={t(lang, story.status === 'done' ? 'outputs.rollover.markTodo' : 'outputs.rollover.markDone')}
                      >
                        {story.status === 'done' ? <IconCheckCircle width={18} height={18} /> : <IconCircleDot width={18} height={18} />}
                      </button>
                      <div className="story-id">{story.id}</div>
                      <button
                        className="story-details"
                        onClick={() => hasDetails && toggleStoryDetails(story.id)}
                        disabled={!hasDetails}
                      >
                        <div className="story-title-row">
                          <div className="story-title">{story.title}</div>
                          {hasDetails && (
                            <IconChevronRight width={14} height={14} className={`story-expand-icon ${expanded ? 'expanded' : ''}`} />
                          )}
                        </div>
                        <div className="story-meta">
                          <span className="story-effort"><IconTarget width={13} height={13} /> {story.effort}pts</span>
                          <span className="story-assignee"><IconUser width={13} height={13} /> {story.assignee}</span>
                          <span className="story-cost"><IconCoin width={13} height={13} /> {story.cost}€</span>
                        </div>
                        {expanded && (
                          <div className="story-expanded">
                            {story.description && <p className="story-description">{story.description}</p>}
                            {story.acceptanceCriteria?.length > 0 && (
                              <ul className="story-acceptance">
                                {story.acceptanceCriteria.map((c, i) => <li key={i}>{c}</li>)}
                              </ul>
                            )}
                          </div>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
