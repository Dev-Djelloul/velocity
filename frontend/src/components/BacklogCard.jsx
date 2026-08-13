import { useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { IconClipboard, IconCheckCircle, IconCircleDot, IconUser, IconCoin, IconTarget } from './Icons'
import '../styles/BacklogCard.css'

export default function BacklogCard({ roadmap, lang, onRoadmapChange, jira }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [search, setSearch] = useState('')

  if (!roadmap) return null

  const { sprints } = roadmap

  const allStories = useMemo(() => sprints.flatMap(sp =>
    sp.stories.map(story => ({ ...story, sprintId: sp.sprintId }))
  ), [sprints])

  const assignees = useMemo(() => [...new Set(allStories.map(s => s.assignee))], [allStories])

  const filtered = allStories.filter(s => {
    if (statusFilter === 'todo' && s.status === 'done') return false
    if (statusFilter === 'done' && s.status !== 'done') return false
    if (assigneeFilter !== 'all' && s.assignee !== assigneeFilter) return false
    if (search.trim() && !s.title.toLowerCase().includes(search.trim().toLowerCase())) return false
    return true
  })

  const toggleStatus = (sprintId, storyId) => {
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

  const moveToSprint = (story, targetSprintId) => {
    if (targetSprintId === story.sprintId) return
    const { sprintId, ...storyWithoutSprint } = story
    const nextSprints = sprints.map(sp => {
      if (sp.sprintId === sprintId) return { ...sp, stories: sp.stories.filter(s => s.id !== story.id) }
      if (sp.sprintId === targetSprintId) return { ...sp, stories: [...sp.stories, storyWithoutSprint] }
      return sp
    })
    onRoadmapChange?.({ ...roadmap, sprints: nextSprints })
  }

  const doneCount = allStories.filter(s => s.status === 'done').length

  return (
    <div className="backlog-card card">
      <div className="backlog-header">
        <h3><IconClipboard width={16} height={16} /> {t(lang, 'backlog.title')}</h3>
        <p className="backlog-subtitle">{t(lang, 'backlog.subtitle')(doneCount, allStories.length)}</p>
      </div>

      <div className="backlog-filters">
        <input
          type="text"
          className="backlog-search"
          placeholder={t(lang, 'backlog.searchPlaceholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">{t(lang, 'backlog.filterAll')}</option>
          <option value="todo">{t(lang, 'backlog.filterTodo')}</option>
          <option value="done">{t(lang, 'backlog.filterDone')}</option>
        </select>
        <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}>
          <option value="all">{t(lang, 'backlog.filterAllAssignees')}</option>
          {assignees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="backlog-list">
        {filtered.length === 0 && <p className="backlog-empty">{t(lang, 'backlog.empty')}</p>}
        {filtered.map(story => (
          <div key={story.id} className={`backlog-row ${story.status === 'done' ? 'backlog-row-done' : ''}`}>
            <button
              className="backlog-status-toggle"
              onClick={() => toggleStatus(story.sprintId, story.id)}
              title={t(lang, story.status === 'done' ? 'outputs.rollover.markTodo' : 'outputs.rollover.markDone')}
            >
              {story.status === 'done' ? <IconCheckCircle width={17} height={17} /> : <IconCircleDot width={17} height={17} />}
            </button>
            <span className="backlog-id">{story.id}</span>
            <div className="backlog-title-block">
              <span className="backlog-title">{story.title}</span>
              {story.description && <span className="backlog-description">{story.description}</span>}
            </div>
            <span className="backlog-meta"><IconTarget width={12} height={12} /> {story.effort}pts</span>
            <span className="backlog-meta"><IconUser width={12} height={12} /> {story.assignee}</span>
            <span className="backlog-meta"><IconCoin width={12} height={12} /> {story.cost}€</span>
            {jira?.links?.[story.id]?.url && (
              <a className="backlog-jira-link" href={jira.links[story.id].url} target="_blank" rel="noopener noreferrer" title={jira.links[story.id].key}>
                <img src="/assets/icons/icons8-jira-32.png" alt="Jira" width={13} height={13} /> {jira.links[story.id].key}
              </a>
            )}
            <select
              className="backlog-sprint-select"
              value={story.sprintId}
              onChange={e => moveToSprint(story, Number(e.target.value))}
            >
              {sprints.map(sp => (
                <option key={sp.sprintId} value={sp.sprintId}>
                  {t(lang, 'outputs.sprint')} {sp.sprintId}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
