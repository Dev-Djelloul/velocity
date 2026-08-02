import { useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { IconChevronLeft, IconChevronRight, IconCalendar } from './Icons'
import '../styles/CalendarView.css'

const SPRINT_DAYS = 14

function sprintStart(generatedAt, sprintId) {
  const start = new Date(generatedAt || Date.now())
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() + (sprintId - 1) * SPRINT_DAYS)
  return start
}

function dateKey(date) {
  return date.toISOString().slice(0, 10)
}

// Répartit les stories d'un sprint sur ses 14 jours, dans l'ordre, pour donner
// une date concrète à chacune — recalculé à chaque rendu à partir de `roadmap`,
// donc tout déplacement (Gantt, rollover) se reflète immédiatement ici.
function buildEventsByDate(roadmap, generatedAt) {
  const map = new Map()
  if (!roadmap?.sprints) return map
  roadmap.sprints.forEach(sp => {
    const start = sprintStart(generatedAt, sp.sprintId)
    const n = sp.stories.length || 1
    sp.stories.forEach((story, idx) => {
      const dayOffset = Math.floor((idx / n) * SPRINT_DAYS)
      const date = new Date(start)
      date.setDate(date.getDate() + dayOffset)
      const key = dateKey(date)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push({ ...story, sprintId: sp.sprintId })
    })
  })
  return map
}

function monthLabel(date, lang) {
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
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

export default function CalendarView({ roadmap, lang, generatedAt }) {
  const [monthOffset, setMonthOffset] = useState(0)

  const eventsByDate = useMemo(() => buildEventsByDate(roadmap, generatedAt), [roadmap, generatedAt])

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

  return (
    <div className="calendar-view card">
      <div className="calendar-header">
        <h3><IconCalendar width={16} height={16} /> {t(lang, 'calendar.title')}</h3>
        <p className="calendar-subtitle">{t(lang, 'calendar.subtitle')}</p>
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
          return (
            <div key={i} className={`calendar-cell ${isToday ? 'calendar-cell-today' : ''}`}>
              <span className="calendar-day-num">{date.getDate()}</span>
              <div className="calendar-events">
                {events.slice(0, 3).map(ev => (
                  <span key={ev.id} className="calendar-event" title={`${ev.id} — ${ev.title}`}>
                    {ev.id}
                  </span>
                ))}
                {events.length > 3 && <span className="calendar-event-more">+{events.length - 3}</span>}
              </div>
            </div>
          )
        })}
      </div>

      <p className="calendar-hint">{t(lang, 'calendar.autoSyncHint')}</p>
    </div>
  )
}
