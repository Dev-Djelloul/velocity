import { useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { IconChevronLeft, IconChevronRight } from './Icons'

function isoDateOnly(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  // Semaine démarrant le lundi (convention FR/EU) : dimanche (0) devient 6, lundi (1) devient 0.
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < leadingBlanks; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

// Widget calendrier mensuel façon Apple Calendar (mois courant, jour du jour souligné, points
// sous les jours qui ont une échéance de lancement de plan) — demandé explicitement pour donner
// au dashboard un vrai repère temporel, plutôt qu'une simple liste de dates.
export default function DashboardCalendar({ lang, deadlines }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const deadlineDays = useMemo(() => {
    const set = new Set()
    for (const d of deadlines || []) {
      set.add(isoDateOnly(new Date(d.date)))
    }
    return set
  }, [deadlines])

  const cells = useMemo(() => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()), [viewDate])
  const todayIso = isoDateOnly(today)
  const weekdayLabels = t(lang, 'dashboard.calendarWeekdays')
  const monthLabel = viewDate.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })

  const goPrev = () => setViewDate(v => new Date(v.getFullYear(), v.getMonth() - 1, 1))
  const goNext = () => setViewDate(v => new Date(v.getFullYear(), v.getMonth() + 1, 1))

  return (
    <div className="dashboard-widget-card dashboard-calendar-card">
      <div className="dashboard-calendar-header">
        <h3 className="dashboard-calendar-month">{monthLabel}</h3>
        <div className="dashboard-calendar-nav">
          <button type="button" onClick={goPrev} aria-label={t(lang, 'dashboard.calendarPrev')}>
            <IconChevronLeft width={14} height={14} />
          </button>
          <button type="button" onClick={goNext} aria-label={t(lang, 'dashboard.calendarNext')}>
            <IconChevronRight width={14} height={14} />
          </button>
        </div>
      </div>
      <div className="dashboard-calendar-weekdays">
        {weekdayLabels.map(w => <span key={w}>{w}</span>)}
      </div>
      <div className="dashboard-calendar-grid">
        {cells.map((date, i) => {
          if (!date) return <span key={`blank-${i}`} className="dashboard-calendar-cell is-blank" />
          const iso = isoDateOnly(date)
          const isToday = iso === todayIso
          const hasDeadline = deadlineDays.has(iso)
          return (
            <span key={iso} className={`dashboard-calendar-cell ${isToday ? 'is-today' : ''}`}>
              <span className="dashboard-calendar-day-num">{date.getDate()}</span>
              {hasDeadline && <span className="dashboard-calendar-dot" aria-hidden="true" />}
            </span>
          )
        })}
      </div>
    </div>
  )
}
