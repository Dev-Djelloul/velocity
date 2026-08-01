import { useState } from 'react'
import { t } from '../lib/i18n'
import { IconTarget, IconUser, IconAlertTriangle, IconCheckCircle } from './Icons'
import '../styles/GanttChart.css'

const SPRINT_DAYS = 14

function sprintDates(generatedAt, sprintId) {
  const start = new Date(generatedAt || Date.now())
  start.setDate(start.getDate() + (sprintId - 1) * SPRINT_DAYS)
  const end = new Date(start)
  end.setDate(end.getDate() + SPRINT_DAYS)
  return { start, end }
}

function formatShort(date, lang) {
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

function currentSprintId(sprints, generatedAt) {
  const now = new Date()
  const current = sprints.find(sp => sprintDates(generatedAt, sp.sprintId).end >= now) || sprints[sprints.length - 1]
  return current.sprintId
}

export default function GanttChart({ roadmap, lang, generatedAt, onRoadmapChange }) {
  const [editingStoryId, setEditingStoryId] = useState(null)
  const [expandedIds, setExpandedIds] = useState(() => new Set())
  const [error, setError] = useState(null)

  if (!roadmap?.sprints?.length) return null

  const { sprints } = roadmap
  const minSprintId = currentSprintId(sprints, generatedAt)

  const flashError = (message) => {
    setError(message)
    setTimeout(() => setError(null), 3000)
  }

  const toggleExpanded = (storyId) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(storyId)) next.delete(storyId)
      else next.add(storyId)
      return next
    })
  }

  const moveStory = (storyId, fromSprintId, toSprintId) => {
    if (fromSprintId === toSprintId) return

    if (toSprintId < minSprintId) {
      flashError(t(lang, 'gantt.errors.pastSprint'))
      return
    }

    const sprintOf = new Map()
    const storyById = new Map()
    sprints.forEach(sp => sp.stories.forEach(s => {
      sprintOf.set(s.id, sp.sprintId)
      storyById.set(s.id, s)
    }))

    const story = storyById.get(storyId)
    if (!story) return

    for (const depId of story.dependsOn || []) {
      const depSprint = sprintOf.get(depId)
      if (depSprint != null && toSprintId < depSprint) {
        flashError(t(lang, 'gantt.errors.beforeDependency').replace('{dep}', depId))
        return
      }
    }

    for (const [otherId, otherSprint] of sprintOf.entries()) {
      const other = storyById.get(otherId)
      if (other?.dependsOn?.includes(storyId) && toSprintId > otherSprint) {
        flashError(t(lang, 'gantt.errors.afterDependent').replace('{dep}', otherId))
        return
      }
    }

    let moved = null
    const withoutStory = sprints.map(sp => {
      if (sp.sprintId !== fromSprintId) return sp
      const found = sp.stories.find(s => s.id === storyId)
      moved = found
      return { ...sp, stories: sp.stories.filter(s => s.id !== storyId) }
    })
    if (!moved) return
    const nextSprints = withoutStory.map(sp => {
      if (sp.sprintId !== toSprintId) return sp
      return { ...sp, stories: [...sp.stories, moved] }
    })
    onRoadmapChange?.({ ...roadmap, sprints: nextSprints })
    setError(null)
    setEditingStoryId(storyId)
    setExpandedIds(prev => new Set(prev).add(storyId))
  }

  const updateStoryField = (storyId, field, value) => {
    const nextSprints = sprints.map(sp => ({
      ...sp,
      stories: sp.stories.map(s => s.id === storyId ? { ...s, [field]: value } : s)
    }))
    onRoadmapChange?.({ ...roadmap, sprints: nextSprints })
  }

  const handleDrop = (e, toSprintId) => {
    e.preventDefault()
    const data = e.dataTransfer.getData('text/plain')
    if (!data) return
    const [storyId, fromSprintId] = data.split('::')
    moveStory(storyId, Number(fromSprintId), toSprintId)
  }

  return (
    <div className="gantt-chart card">
      <div className="gantt-header">
        <h3>{t(lang, 'gantt.title')}</h3>
        <p className="gantt-subtitle">{t(lang, 'gantt.subtitle')}</p>
      </div>

      {error && (
        <div className="gantt-error">
          <IconAlertTriangle width={14} height={14} /> {error}
        </div>
      )}

      <div className="gantt-grid" style={{ '--gantt-cols': sprints.length }}>
        {sprints.map(sp => {
          const { start, end } = sprintDates(generatedAt, sp.sprintId)
          const locked = sp.sprintId < minSprintId
          return (
            <div key={sp.sprintId} className={`gantt-col-header ${locked ? 'locked' : ''}`}>
              <div className="gantt-sprint-label">Sprint {sp.sprintId}</div>
              <div className="gantt-sprint-dates">{formatShort(start, lang)} → {formatShort(end, lang)}</div>
            </div>
          )
        })}

        {sprints.map(sp => {
          const locked = sp.sprintId < minSprintId
          return (
            <div
              key={`col-${sp.sprintId}`}
              className={`gantt-col ${locked ? 'locked' : ''}`}
              onDragOver={e => !locked && e.preventDefault()}
              onDrop={e => !locked && handleDrop(e, sp.sprintId)}
            >
              {sp.stories.map(story => {
                const isEditing = editingStoryId === story.id
                const isExpanded = expandedIds.has(story.id) || isEditing

                return (
                  <div
                    key={story.id}
                    className={`gantt-bar ${story.dependsOn?.length ? 'has-deps' : ''} ${isExpanded ? 'expanded' : ''} ${isEditing ? 'editing' : ''}`}
                    draggable={!isEditing}
                    onDragStart={e => e.dataTransfer.setData('text/plain', `${story.id}::${sp.sprintId}`)}
                    title={!isExpanded ? story.title : undefined}
                  >
                    <div className="gantt-bar-top">
                      <span className="gantt-bar-id">{story.id}</span>
                      <button
                        type="button"
                        className="gantt-bar-expand"
                        onClick={() => toggleExpanded(story.id)}
                        title={isExpanded ? t(lang, 'gantt.collapse') : t(lang, 'gantt.expand')}
                      >
                        {isExpanded ? '▾' : '▸'}
                      </button>
                    </div>

                    {isEditing ? (
                      <div className="gantt-bar-edit">
                        <input
                          type="text"
                          value={story.title}
                          onChange={e => updateStoryField(story.id, 'title', e.target.value)}
                        />
                        <div className="gantt-bar-edit-row">
                          <label>
                            <IconTarget width={11} height={11} />
                            <input
                              type="number"
                              min="1"
                              value={story.effort}
                              onChange={e => updateStoryField(story.id, 'effort', Number(e.target.value) || 0)}
                            />
                          </label>
                          <label>
                            <IconUser width={11} height={11} />
                            <input
                              type="text"
                              value={story.assignee}
                              onChange={e => updateStoryField(story.id, 'assignee', e.target.value)}
                            />
                          </label>
                        </div>
                        <button type="button" className="gantt-bar-done" onClick={() => setEditingStoryId(null)}>
                          <IconCheckCircle width={12} height={12} /> {t(lang, 'gantt.done')}
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="gantt-bar-title">{story.title}</span>
                        <span className="gantt-bar-effort"><IconTarget width={11} height={11} /> {story.effort}pts</span>
                        {isExpanded && (
                          <>
                            <span className="gantt-bar-assignee"><IconUser width={11} height={11} /> {story.assignee}</span>
                            {story.dependsOn?.length > 0 && (
                              <span className="gantt-bar-deps">{t(lang, 'outputs.dependsOn')}: {story.dependsOn.join(', ')}</span>
                            )}
                            <button type="button" className="gantt-bar-edit-btn" onClick={() => setEditingStoryId(story.id)}>
                              {t(lang, 'gantt.edit')}
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
      <p className="gantt-hint">{t(lang, 'gantt.dragHint')}</p>
    </div>
  )
}
