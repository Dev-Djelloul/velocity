import { useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { exportCalendarICS } from '../lib/icsExport'
import {
  IconChevronLeft, IconChevronRight, IconCalendar, IconRocket, IconDownload,
  IconCircleDot, IconClock, IconCheckCircle, IconMegaphone
} from './Icons'
import '../styles/CalendarView.css'

const SPRINT_DAYS = 14
const STATUS_ICONS = { todo: IconCircleDot, in_progress: IconClock, done: IconCheckCircle }
const STATUS_I18N_KEY = { todo: 'todo', in_progress: 'inProgress', done: 'done' }

function sprintStart(generatedAt, sprintId) {
  const start = new Date(generatedAt || Date.now())
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() + (sprintId - 1) * SPRINT_DAYS)
  return start
}

// Semaine 1 du calendrier de contenu marketing = début de la prépa (même base que les sprints).
function marketingWeekDate(generatedAt, week) {
  const start = new Date(generatedAt || Date.now())
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() + Math.max(0, (week || 1) - 1) * 7)
  return start
}

// toISOString() convertit en UTC — mais `date` est ici toujours construit en heure LOCALE
// (new Date(year, month, day), ou sprintStart/marketingWeekDate qui appellent .setHours(0)
// en local, pas .setUTCHours). Pour un fuseau en avance sur UTC (France, UTC+1/+2), minuit
// local se traduit en UTC par la VEILLE ~22h-23h : toISOString().slice(0,10) renvoyait donc
// systématiquement la date de la veille, un jour plus tôt que celle affichée par
// date.getDate() sur la même cellule (retour utilisateur : la story du 28 juillet
// s'ouvrait sous l'étiquette "27 juillet"). Clé construite ici à partir des mêmes accesseurs
// LOCAUX que l'affichage, pour que les deux s'accordent toujours.
function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// Répartit les stories d'un sprint sur ses 14 jours, dans l'ordre, pour donner
// une date concrète à chacune — recalculé à chaque rendu à partir de `roadmap`,
// donc tout déplacement (Gantt, rollover) se reflète immédiatement ici. Le
// calendrier de contenu marketing est fusionné dans la même vue.
function buildEventsByDate(roadmap, generatedAt, marketing) {
  const map = new Map()
  const push = (key, ev) => {
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(ev)
  }

  ;(roadmap?.sprints || []).forEach(sp => {
    const start = sprintStart(generatedAt, sp.sprintId)
    const n = sp.stories.length || 1
    sp.stories.forEach((story, idx) => {
      const dayOffset = Math.floor((idx / n) * SPRINT_DAYS)
      const date = new Date(start)
      date.setDate(date.getDate() + dayOffset)
      push(dateKey(date), {
        type: 'story', key: `s-${story.id}`, id: story.id, title: story.title,
        status: story.status || 'todo', assignee: story.assignee, sprintId: sp.sprintId, date
      })
    })
  })

  ;(marketing?.contentCalendar || []).forEach((item, i) => {
    const date = marketingWeekDate(generatedAt, item.week)
    push(dateKey(date), { type: 'marketing', key: `m-${i}`, id: `m-${i}`, title: item.content, channel: item.channel, date })
  })

  return map
}

function monthLabel(date, lang) {
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
}

function fullDayLabel(date, lang) {
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  return date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function weekdayLabels(lang) {
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  const base = new Date(2024, 0, 1) // lundi
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    return d.toLocaleDateString(locale, { weekday: 'short' })
  })
}

export default function CalendarView({ plan, roadmap, lang, generatedAt, launchDate, marketing }) {
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedKey, setSelectedKey] = useState(null)

  const eventsByDate = useMemo(() => buildEventsByDate(roadmap, generatedAt, marketing), [roadmap, generatedAt, marketing])

  if (!roadmap?.sprints?.length) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = (firstOfMonth.getDay() + 6) % 7 // lundi = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  // dateKey(new Date(...)), pas launchDate.split('T')[0] : ce dernier prenait la date telle
  // qu'écrite dans le timestamp UTC stocké, alors que toutes les autres clés de ce fichier
  // sont désormais en calendrier LOCAL — même décalage potentiel d'un jour que le bug
  // dateKey() corrigé plus haut, ici sur le badge/mise en évidence du jour de lancement.
  const launchKey = launchDate ? dateKey(new Date(launchDate)) : null
  const launchTitle = t(lang, 'calendar.launchEventTitle')(plan?.product?.name)

  const handleExportIcs = () => {
    const events = []
    eventsByDate.forEach(evs => evs.forEach(ev => {
      events.push({
        id: ev.key,
        date: ev.date,
        title: ev.type === 'story' ? `${ev.id}: ${ev.title}` : `${ev.channel}: ${ev.title}`,
        description: ev.type === 'story' ? `${t(lang, 'outputs.rollover.status.' + STATUS_I18N_KEY[ev.status])} — ${ev.assignee}` : undefined
      })
    }))
    if (launchKey) events.push({ id: 'launch', date: new Date(`${launchKey}T00:00:00`), title: launchTitle })
    exportCalendarICS(plan, events, lang)
  }

  const selectedDate = selectedKey ? new Date(`${selectedKey}T00:00:00`) : null
  const selectedEvents = selectedKey ? (eventsByDate.get(selectedKey) || []) : []
  const selectedIsLaunch = selectedKey && selectedKey === launchKey

  return (
    <div className="calendar-view card">
      <div className="calendar-header">
        <div>
          <h3><IconCalendar width={16} height={16} /> {t(lang, 'calendar.title')}</h3>
          <p className="calendar-subtitle">{t(lang, 'calendar.subtitle')}</p>
        </div>
        <button type="button" className="calendar-export-btn" onClick={handleExportIcs}>
          <IconDownload width={13} height={13} /> {t(lang, 'calendar.exportIcs')}
        </button>
      </div>

      <div className="calendar-nav">
        <button type="button" onClick={() => setMonthOffset(o => o - 1)} aria-label={t(lang, 'calendar.prevMonth')}>
          <IconChevronLeft width={16} height={16} />
        </button>
        <span className="calendar-month-label">{monthLabel(viewDate, lang)}</span>
        <button type="button" onClick={() => setMonthOffset(o => o + 1)} aria-label={t(lang, 'calendar.nextMonth')}>
          <IconChevronRight width={16} height={16} />
        </button>
        {monthOffset !== 0 && (
          <button type="button" className="calendar-today-btn" onClick={() => setMonthOffset(0)}>
            {t(lang, 'calendar.today')}
          </button>
        )}
      </div>

      <div className="calendar-grid">
        {weekdayLabels(lang).map((w, i) => (
          <div key={i} className="calendar-weekday">{w}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={i} className="calendar-cell calendar-cell-empty" />
          const key = dateKey(date)
          const events = eventsByDate.get(key) || []
          const isToday = date.getTime() === today.getTime()
          const isLaunch = key === launchKey
          const isSelected = key === selectedKey
          return (
            <button
              type="button"
              key={i}
              className={`calendar-cell ${isToday ? 'calendar-cell-today' : ''} ${isLaunch ? 'calendar-cell-launch' : ''} ${isSelected ? 'calendar-cell-selected' : ''}`}
              onClick={() => setSelectedKey(isSelected ? null : key)}
            >
              <span className="calendar-day-top">
                <span className="calendar-day-num">{date.getDate()}</span>
                {isLaunch && <IconRocket width={11} height={11} className="calendar-launch-icon" title={t(lang, 'calendar.launchBadge')} />}
              </span>
              <div className="calendar-events">
                {events.slice(0, 3).map(ev => (
                  <span
                    key={ev.key}
                    className={`calendar-event calendar-event-${ev.type} ${ev.type === 'story' ? `status-${ev.status}` : ''}`}
                    title={ev.type === 'story' ? `${ev.id} — ${ev.title}` : `${ev.channel} — ${ev.title}`}
                  >
                    {ev.type === 'story' ? ev.id : <IconMegaphone width={9} height={9} />}
                  </span>
                ))}
                {events.length > 3 && <span className="calendar-event-more">+{events.length - 3}</span>}
              </div>
            </button>
          )
        })}
      </div>

      {selectedKey && (
        <div className="calendar-day-detail">
          <div className="calendar-day-detail-header">
            <strong>{fullDayLabel(selectedDate, lang)}</strong>
            <button type="button" className="calendar-day-detail-close" onClick={() => setSelectedKey(null)}>✕</button>
          </div>

          {selectedIsLaunch && (
            <div className="calendar-day-detail-item launch">
              <IconRocket width={14} height={14} /> {launchTitle}
            </div>
          )}

          {selectedEvents.length === 0 && !selectedIsLaunch && (
            <p className="calendar-empty">{t(lang, 'calendar.dayDetailEmpty')}</p>
          )}

          {selectedEvents.map(ev => {
            if (ev.type === 'marketing') {
              return (
                <div key={ev.key} className="calendar-day-detail-item marketing">
                  <IconMegaphone width={13} height={13} />
                  <span><strong>{ev.channel}</strong> — {ev.title}</span>
                </div>
              )
            }
            const StatusIcon = STATUS_ICONS[ev.status] || STATUS_ICONS.todo
            return (
              <div key={ev.key} className={`calendar-day-detail-item story status-${ev.status}`}>
                <StatusIcon width={13} height={13} />
                <span><strong>{ev.id}</strong> — {ev.title} <em>({ev.assignee})</em></span>
              </div>
            )
          })}
        </div>
      )}

      <p className="calendar-hint">{t(lang, 'calendar.autoSyncHint')}</p>
    </div>
  )
}
