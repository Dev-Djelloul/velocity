import { useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { IconClipboard, IconCheckCircle, IconCircleDot, IconClock, IconUser, IconCoin, IconTarget } from './Icons'
import { notionSyncStories, notionAuthorizeUrl, notionStatus } from '../lib/serverStorage'
import { waitForConnection } from '../lib/oauthConnect'
import { nextStoryStatus } from '../lib/storyStatus'
import '../styles/BacklogCard.css'

const STATUS_ICONS = { todo: IconCircleDot, in_progress: IconClock, done: IconCheckCircle }
const STATUS_I18N_KEY = { todo: 'todo', in_progress: 'inProgress', done: 'done' }

export default function BacklogCard({ roadmap, lang, onRoadmapChange, jira, plan, userId, onNotionStoriesSynced }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [search, setSearch] = useState('')

  // Sync Notion : une base dédiée avec une ligne par story, ouverte en un clic (pas de
  // deep-link par story — une page Notion individuelle par ligne est peu lisible seule).
  const [notionState, setNotionState] = useState('idle') // idle | working | connecting | error
  const [notionMsg, setNotionMsg] = useState('')

  const runNotionSync = async () => {
    const res = await notionSyncStories(userId, plan, lang)
    if (res && res.error === undefined && !res.needsAuth) {
      if (onNotionStoriesSynced) onNotionStoriesSynced({ databaseId: res.databaseId, databaseUrl: res.databaseUrl, links: res.links || {} })
      if (res.databaseUrl) window.open(res.databaseUrl, '_blank', 'noopener')
      if (res.failed > 0) {
        setNotionMsg(t(lang, 'export.notionPartial')(res.failed))
        setNotionState('error')
      } else {
        setNotionState('idle')
      }
      return true
    }
    if (res?.error === 'no_parent') { setNotionMsg(t(lang, 'export.notionNoParent')); setNotionState('error'); return true }
    return res
  }

  const handleNotionSync = async () => {
    if (!userId) { setNotionMsg(t(lang, 'export.notionSignIn')); setNotionState('error'); return }
    setNotionState('working'); setNotionMsg('')
    try {
      const res = await runNotionSync()
      if (res === true) return
      if (res && res.needsAuth) {
        const auth = await notionAuthorizeUrl(userId)
        if (!auth?.url) { setNotionMsg(t(lang, 'export.notionUnavailable')); setNotionState('error'); return }
        setNotionState('connecting')
        const popup = window.open(auth.url, 'notion-oauth', 'width=640,height=760')
        const connected = await waitForConnection(notionStatus, userId, popup)
        if (!connected) { setNotionMsg(t(lang, 'export.notionCancelled')); setNotionState('error'); return }
        setNotionState('working')
        const done = await runNotionSync()
        if (done !== true) { setNotionMsg(t(lang, 'export.notionUnavailable')); setNotionState('error') }
      } else { setNotionMsg(t(lang, 'export.notionUnavailable')); setNotionState('error') }
    } catch { setNotionMsg(t(lang, 'export.notionUnavailable')); setNotionState('error') }
  }

  const notionSyncLabel = notionState === 'working' ? t(lang, 'export.notionSyncing')
    : notionState === 'connecting' ? t(lang, 'export.notionConnecting')
    : t(lang, 'export.notionSync')

  if (!roadmap) return null

  const { sprints } = roadmap

  const allStories = useMemo(() => sprints.flatMap(sp =>
    sp.stories.map(story => ({ ...story, sprintId: sp.sprintId }))
  ), [sprints])

  const assignees = useMemo(() => [...new Set(allStories.map(s => s.assignee))], [allStories])

  const filtered = allStories.filter(s => {
    if (statusFilter !== 'all' && (s.status || 'todo') !== statusFilter) return false
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
          const next = nextStoryStatus(s.status)
          return { ...s, status: next, completedAt: next === 'done' ? new Date().toISOString() : null }
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
        <p className="backlog-subtitle">
          {t(lang, 'backlog.subtitle')(doneCount, allStories.length)}
          {' · '}
          <button className="backlog-notion-sync-link" onClick={handleNotionSync} disabled={notionState === 'working' || notionState === 'connecting'}>
            <img src="/assets/icons/icons8-notion-32.png" alt="" width={12} height={12} /> {notionSyncLabel}
          </button>
          {notionState === 'error' && notionMsg && <span className="backlog-notion-sync-error"> — {notionMsg}</span>}
        </p>
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
          <option value="in_progress">{t(lang, 'backlog.filterInProgress')}</option>
          <option value="done">{t(lang, 'backlog.filterDone')}</option>
        </select>
        <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)}>
          <option value="all">{t(lang, 'backlog.filterAllAssignees')}</option>
          {assignees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="backlog-list">
        {filtered.length === 0 && <p className="backlog-empty">{t(lang, 'backlog.empty')}</p>}
        {filtered.map(story => {
          const status = story.status || 'todo'
          const StatusIcon = STATUS_ICONS[status] || STATUS_ICONS.todo
          return (
          <div key={story.id} className={`backlog-row backlog-row-${status.replace('_', '-')}`}>
            <button
              className="backlog-status-toggle"
              onClick={() => toggleStatus(story.sprintId, story.id)}
              title={t(lang, `outputs.rollover.status.${STATUS_I18N_KEY[status]}`)}
            >
              <StatusIcon width={17} height={17} />
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
          )
        })}
      </div>
    </div>
  )
}
