import { useState, Fragment } from 'react'
import { t } from '../lib/i18n'
import { IconTarget, IconUser, IconCoin, IconAlertTriangle, IconCheckCircle, IconClock, IconCircleDot } from './Icons'
import '../styles/GanttChart.css'

const SPRINT_DAYS = 14
// Palette réutilisée telle quelle depuis DashboardBI (donuts) — une couleur par responsable,
// cohérente avec le reste de l'app plutôt que d'inventer une nouvelle palette.
const GROUP_COLORS = ['#9184d9', '#06b6d4', '#4ade80', '#fb923c', '#ef4444', '#6366f1', '#f472b6', '#a89fe8']
const STATUS_ICONS = { todo: IconCircleDot, in_progress: IconClock, done: IconCheckCircle }
const STATUS_I18N_KEY = { todo: 'todo', in_progress: 'inProgress', done: 'done' }

function sprintDates(planStartDate, sprintId) {
  const start = new Date(planStartDate || Date.now())
  start.setDate(start.getDate() + (sprintId - 1) * SPRINT_DAYS)
  const end = new Date(start)
  end.setDate(end.getDate() + SPRINT_DAYS)
  return { start, end }
}

function formatShort(date, lang) {
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}

function monthLabel(date, lang) {
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
}

function currentSprintId(sprints, planStartDate) {
  const now = new Date()
  const current = sprints.find(sp => sprintDates(planStartDate, sp.sprintId).end >= now) || sprints[sprints.length - 1]
  return current.sprintId
}

export default function GanttChart({ roadmap, lang, generatedAt, onRoadmapChange }) {
  const [expandedId, setExpandedId] = useState(null)
  const [error, setError] = useState(null)

  if (!roadmap?.sprints?.length) return null

  const { sprints } = roadmap
  const planStartDate = generatedAt
  const minSprintId = currentSprintId(sprints, planStartDate)

  const flashError = (message) => {
    setError(message)
    setTimeout(() => setError(null), 3000)
  }

  // --- Colonnes du calendrier : un sprint = une colonne, regroupées par mois pour l'entête ---
  const cols = sprints.map(sp => ({ sprintId: sp.sprintId, ...sprintDates(planStartDate, sp.sprintId) }))
  const monthBands = []
  cols.forEach(col => {
    const key = `${col.start.getFullYear()}-${col.start.getMonth()}`
    const last = monthBands[monthBands.length - 1]
    if (last && last.key === key) last.span++
    else monthBands.push({ key, label: monthLabel(col.start, lang), span: 1 })
  })

  // --- Regroupement en swim-lanes par responsable, comme un Gantt d'équipe classique ---
  const groups = []
  const groupIndexByAssignee = new Map()
  sprints.forEach(sp => sp.stories.forEach(story => {
    const key = story.assignee || '—'
    if (!groupIndexByAssignee.has(key)) {
      groupIndexByAssignee.set(key, groups.length)
      groups.push({ assignee: key, stories: [], minSprint: sp.sprintId, maxSprint: sp.sprintId })
    }
    const g = groups[groupIndexByAssignee.get(key)]
    g.stories.push({ ...story, sprintId: sp.sprintId })
    g.minSprint = Math.min(g.minSprint, sp.sprintId)
    g.maxSprint = Math.max(g.maxSprint, sp.sprintId)
  }))
  groups.forEach(g => g.stories.sort((a, b) => a.sprintId - b.sprintId))

  // Aplatit groupe+stories en lignes numérotées (2 lignes d'entête d'abord).
  const rows = []
  groups.forEach((g, gi) => {
    rows.push({ type: 'group', group: g, colorIdx: gi })
    g.stories.forEach(story => rows.push({ type: 'story', story, group: g, colorIdx: gi }))
  })

  const sprintOf = new Map()
  const storyById = new Map()
  sprints.forEach(sp => sp.stories.forEach(s => {
    sprintOf.set(s.id, sp.sprintId)
    storyById.set(s.id, s)
  }))

  const moveStory = (storyId, fromSprintId, toSprintId) => {
    if (fromSprintId === toSprintId) return
    if (toSprintId < minSprintId) {
      flashError(t(lang, 'gantt.errors.pastSprint'))
      return
    }

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

      <div className="gantt-scroll">
        <div
          className="gantt-timeline"
          style={{ '--gantt-sprint-count': sprints.length }}
        >
          {monthBands.map((mb, i) => {
            const startCol = 2 + monthBands.slice(0, i).reduce((s, m) => s + m.span, 0)
            return (
              <div key={mb.key} className="gantt-month-header" style={{ gridRow: 1, gridColumn: `${startCol} / span ${mb.span}` }}>
                {mb.label}
              </div>
            )
          })}

          {cols.map((col, i) => {
            const locked = col.sprintId < minSprintId
            return (
              <div key={col.sprintId} className={`gantt-sprint-header ${locked ? 'locked' : ''}`} style={{ gridRow: 2, gridColumn: 2 + i }}>
                <span>Sprint {col.sprintId}</span>
                <span className="gantt-sprint-header-dates">{formatShort(col.start, lang)} → {formatShort(col.end, lang)}</span>
              </div>
            )
          })}

          {cols.map((col, i) => {
            const locked = col.sprintId < minSprintId
            return (
              <div
                key={`dz-${col.sprintId}`}
                className={`gantt-dropzone ${locked ? 'locked' : ''} ${i % 2 === 1 ? 'alt' : ''}`}
                style={{ gridRow: `3 / span ${rows.length}`, gridColumn: 2 + i }}
                onDragOver={e => !locked && e.preventDefault()}
                onDrop={e => !locked && handleDrop(e, col.sprintId)}
              />
            )
          })}

          {rows.map((r, i) => {
            const gridRow = 3 + i
            const color = GROUP_COLORS[r.colorIdx % GROUP_COLORS.length]

            if (r.type === 'group') {
              const g = r.group
              return (
                <Fragment key={`group-${g.assignee}`}>
                  <div className="gantt-sidebar-cell gantt-sidebar-group" style={{ gridRow, gridColumn: 1 }}>
                    <span className="gantt-group-dot" style={{ background: color }} />
                    {g.assignee}
                  </div>
                  <div
                    className="gantt-bar gantt-bar-group"
                    style={{ gridRow, gridColumn: `${2 + (g.minSprint - 1)} / ${2 + g.maxSprint}`, background: color }}
                  >
                    {g.assignee}
                  </div>
                </Fragment>
              )
            }

            const story = r.story
            const status = story.status || 'todo'
            const StatusIcon = STATUS_ICONS[status] || STATUS_ICONS.todo
            const isExpanded = expandedId === story.id

            return (
              <Fragment key={story.id}>
                <div className="gantt-sidebar-cell gantt-sidebar-story" style={{ gridRow, gridColumn: 1 }} title={story.title}>
                  <span className="gantt-connector" style={{ borderColor: color }} />
                  {story.title}
                </div>
                <div
                  className={`gantt-bar gantt-bar-story status-${status}`}
                  style={{ gridRow, gridColumn: 2 + (story.sprintId - 1), '--group-color': color }}
                  draggable
                  onDragStart={e => e.dataTransfer.setData('text/plain', `${story.id}::${story.sprintId}`)}
                  onClick={() => setExpandedId(isExpanded ? null : story.id)}
                >
                  <StatusIcon width={12} height={12} className="gantt-bar-status-icon" />
                  <span className="gantt-bar-story-id">{story.id}</span>

                  {isExpanded && (
                    <div className="gantt-detail" onClick={e => e.stopPropagation()}>
                      <div className="gantt-detail-title">{story.title}</div>
                      {story.description && <p className="gantt-detail-desc">{story.description}</p>}
                      <div className="gantt-detail-meta">
                        <span><StatusIcon width={12} height={12} /> {t(lang, `outputs.rollover.status.${STATUS_I18N_KEY[status]}`)}</span>
                        <span><IconTarget width={12} height={12} /> {story.effort}pts</span>
                        <span><IconUser width={12} height={12} /> {story.assignee}</span>
                        <span><IconCoin width={12} height={12} /> {story.cost}€</span>
                      </div>
                      {story.dependsOn?.length > 0 && (
                        <p className="gantt-detail-deps">{t(lang, 'outputs.dependsOn')}: {story.dependsOn.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>
      <p className="gantt-hint">{t(lang, 'gantt.dragHint')}</p>
    </div>
  )
}
