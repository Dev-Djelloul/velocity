import { t } from '../lib/i18n'
import { IconTarget } from './Icons'
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

export default function GanttChart({ roadmap, lang, generatedAt, onRoadmapChange }) {
  if (!roadmap?.sprints?.length) return null

  const { sprints } = roadmap

  const moveStory = (storyId, fromSprintId, toSprintId) => {
    if (fromSprintId === toSprintId) return
    let moved = null
    const withoutStory = sprints.map(sp => {
      if (sp.sprintId !== fromSprintId) return sp
      const story = sp.stories.find(s => s.id === storyId)
      moved = story
      return { ...sp, stories: sp.stories.filter(s => s.id !== storyId) }
    })
    if (!moved) return
    const nextSprints = withoutStory.map(sp => {
      if (sp.sprintId !== toSprintId) return sp
      return { ...sp, stories: [...sp.stories, moved] }
    })
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

      <div className="gantt-grid" style={{ '--gantt-cols': sprints.length }}>
        {sprints.map(sp => {
          const { start, end } = sprintDates(generatedAt, sp.sprintId)
          return (
            <div key={sp.sprintId} className="gantt-col-header">
              <div className="gantt-sprint-label">Sprint {sp.sprintId}</div>
              <div className="gantt-sprint-dates">{formatShort(start, lang)} → {formatShort(end, lang)}</div>
            </div>
          )
        })}

        {sprints.map(sp => (
          <div
            key={`col-${sp.sprintId}`}
            className="gantt-col"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, sp.sprintId)}
          >
            {sp.stories.map(story => (
              <div
                key={story.id}
                className={`gantt-bar ${story.dependsOn?.length ? 'has-deps' : ''}`}
                draggable
                onDragStart={e => e.dataTransfer.setData('text/plain', `${story.id}::${sp.sprintId}`)}
                title={story.dependsOn?.length ? `${t(lang, 'outputs.dependsOn')}: ${story.dependsOn.join(', ')}` : story.title}
              >
                <span className="gantt-bar-id">{story.id}</span>
                <span className="gantt-bar-title">{story.title}</span>
                <span className="gantt-bar-effort"><IconTarget width={11} height={11} /> {story.effort}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="gantt-hint">{t(lang, 'gantt.dragHint')}</p>
    </div>
  )
}
