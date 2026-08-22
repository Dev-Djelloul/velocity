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

  // Deux points possibles par jour (lancement / fin de sprint), pas un seul point neutre —
  // demandé explicitement pour qu'un coup d'œil au calendrier dise de quel type d'échéance
  // il s'agit, sans avoir à ouvrir la carte "Prochaines échéances" en dessous.
  const deadlinesByDay = useMemo(() => {
    const map = new Map()
    for (const d of deadlines || []) {
      const iso = isoDateOnly(new Date(d.date))
      if (!map.has(iso)) map.set(iso, new Set())
      map.get(iso).add(d.kind === 'sprint' ? 'sprint' : 'launch')
    }
    return map
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
          const kinds = deadlinesByDay.get(iso)
          const title = kinds && [
            kinds.has('launch') ? t(lang, 'dashboard.calendarLegendLaunch') : null,
            kinds.has('sprint') ? t(lang, 'dashboard.calendarLegendSprint') : null
          ].filter(Boolean).join(' · ')
          return (
            <span key={iso} className={`dashboard-calendar-cell ${isToday ? 'is-today' : ''}`} title={title || undefined}>
              <span className="dashboard-calendar-day-num">{date.getDate()}</span>
              {kinds && (
                <span className="dashboard-calendar-dots" aria-hidden="true">
                  {kinds.has('launch') && <span className="dashboard-calendar-dot dashboard-calendar-dot-launch" />}
                  {kinds.has('sprint') && <span className="dashboard-calendar-dot dashboard-calendar-dot-sprint" />}
                </span>
              )}
            </span>
          )
        })}
      </div>

      <div className="dashboard-calendar-legend">
        <span><span className="dashboard-calendar-dot dashboard-calendar-dot-launch" /> {t(lang, 'dashboard.calendarLegendLaunch')}</span>
        <span><span className="dashboard-calendar-dot dashboard-calendar-dot-sprint" /> {t(lang, 'dashboard.calendarLegendSprint')}</span>
      </div>
    </div>
  )
}
