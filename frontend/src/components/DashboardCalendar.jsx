import { useEffect, useMemo, useRef, useState } from 'react'
import { t } from '../lib/i18n'
import { IconChevronLeft, IconChevronRight, IconCircleDot, IconClock, IconCheckCircle } from './Icons'

const SPRINT_DAYS = 14
const STATUS_ICONS = { todo: IconCircleDot, in_progress: IconClock, done: IconCheckCircle }
const STATUS_I18N_KEY = { todo: 'todo', in_progress: 'inProgress', done: 'done' }

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

// Popover d'un jour du calendrier — clic/tap (pas seulement survol, voir CardHelp dans
// DashboardBI.jsx : le survol seul ne marche pas sur mobile). Liste les sprints actifs ce
// jour-là tous plans confondus, avec leurs stories ; cliquer un plan y redirige directement.
function DayPopover({ date, lang, sprintEntries, launchEntries, onOpenPlan, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  const dateLabel = date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="dashboard-calendar-day-popover" ref={ref} onClick={(e) => e.stopPropagation()}>
      <div className="dashboard-calendar-day-popover-date">{dateLabel}</div>

      {launchEntries.map(entry => (
        <button key={`launch-${entry.planId}`} className="dashboard-calendar-day-popover-plan" onClick={() => onOpenPlan(entry.plan)}>
          <span className="dashboard-calendar-dot dashboard-calendar-dot-launch" />
          <span className="dashboard-calendar-day-popover-plan-name">{entry.planName || t(lang, 'dashboard.deadlinesUntitled')}</span>
          <span className="dashboard-calendar-day-popover-plan-tag">{t(lang, 'dashboard.calendarLegendLaunch')}</span>
        </button>
      ))}

      {sprintEntries.map(entry => (
        <div key={`${entry.planId}-${entry.sprintId}`} className="dashboard-calendar-day-popover-sprint">
          <button className="dashboard-calendar-day-popover-plan" onClick={() => onOpenPlan(entry.plan)}>
            <span className="dashboard-calendar-dot dashboard-calendar-dot-sprint" />
            <span className="dashboard-calendar-day-popover-plan-name">{entry.planName || t(lang, 'dashboard.deadlinesUntitled')}</span>
            <span className="dashboard-calendar-day-popover-plan-tag">{t(lang, 'dashboard.calendarSprintLabel')(entry.sprintId)}</span>
          </button>
          {!!entry.stories.length && (
            <div className="dashboard-calendar-day-popover-stories">
              {entry.stories.slice(0, 8).map(story => {
                const StatusIcon = STATUS_ICONS[story.status] || IconCircleDot
                const statusKey = STATUS_I18N_KEY[story.status] || 'todo'
                return (
                  <span
                    key={story.id}
                    className={`dashboard-calendar-story-chip is-${story.status || 'todo'}`}
                    title={t(lang, `outputs.rollover.status.${statusKey}`)}
                  >
                    <StatusIcon width={10} height={10} />
                    <span>{story.title}</span>
                  </span>
                )
              })}
              {entry.stories.length > 8 && (
                <span className="dashboard-calendar-day-popover-more">
                  {t(lang, 'dashboard.calendarMoreStories')(entry.stories.length - 8)}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Widget calendrier mensuel façon Apple Calendar (mois courant, jour du jour souligné). Les
// sprints de TOUS les plans sont mis en évidence sur toute leur durée (pas seulement le jour
// de fin) — vue d'ensemble demandée explicitement — et cliquer un jour concerné ouvre le
// détail (plan, sprint, stories) avec accès direct au plan.
export default function DashboardCalendar({ lang, deadlines, plans, onOpenPlan }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [openDay, setOpenDay] = useState(null)

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

  // Étale chaque sprint de chaque plan sur toute sa fenêtre de 14 jours (pas juste son jour
  // de fin) — "on aura une vue globale" : la période active de tous les sprints, tous plans
  // confondus, se voit directement sur le calendrier plutôt qu'un seul point par plan.
  const sprintsByDay = useMemo(() => {
    const map = new Map()
    for (const plan of plans || []) {
      const sprints = plan.roadmap?.sprints || []
      if (!sprints.length) continue
      const base = new Date(plan.planStartDate || plan.generatedAt || Date.now())
      for (const sp of sprints) {
        const start = new Date(base)
        start.setDate(start.getDate() + (sp.sprintId - 1) * SPRINT_DAYS)
        for (let i = 0; i < SPRINT_DAYS; i++) {
          const day = new Date(start)
          day.setDate(day.getDate() + i)
          const iso = isoDateOnly(day)
          if (!map.has(iso)) map.set(iso, [])
          map.get(iso).push({
            planId: plan.id,
            planName: plan.product?.name || null,
            sprintId: sp.sprintId,
            stories: sp.stories || [],
            plan
          })
        }
      }
    }
    return map
  }, [plans])

  const launchesByDay = useMemo(() => {
    const map = new Map()
    for (const plan of plans || []) {
      if (!plan.launchDate) continue
      const iso = isoDateOnly(new Date(plan.launchDate))
      if (!map.has(iso)) map.set(iso, [])
      map.get(iso).push({ planId: plan.id, planName: plan.product?.name || null, plan })
    }
    return map
  }, [plans])

  const cells = useMemo(() => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()), [viewDate])
  const todayIso = isoDateOnly(today)
  const weekdayLabels = t(lang, 'dashboard.calendarWeekdays')
  const monthLabel = viewDate.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })

  const goPrev = () => { setOpenDay(null); setViewDate(v => new Date(v.getFullYear(), v.getMonth() - 1, 1)) }
  const goNext = () => { setOpenDay(null); setViewDate(v => new Date(v.getFullYear(), v.getMonth() + 1, 1)) }
  const goToday = () => { setOpenDay(null); setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)) }
  const isCurrentMonth = viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth()

  return (
    <div className="dashboard-widget-card dashboard-calendar-card">
      <div className="dashboard-calendar-header">
        <h3 className="dashboard-calendar-month">{monthLabel}</h3>
        <div className="dashboard-calendar-nav">
          {/* Repère "aujourd'hui" cliquable — ramène directement au mois courant sans avoir à
              cliquer plusieurs fois sur les flèches si on a navigué loin (retour utilisateur). */}
          <button
            type="button"
            className="dashboard-calendar-today-btn"
            onClick={goToday}
            disabled={isCurrentMonth}
          >
            {t(lang, 'dashboard.calendarToday')}
          </button>
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
          const sprintEntries = sprintsByDay.get(iso) || []
          const launchEntries = launchesByDay.get(iso) || []
          const hasActivity = sprintEntries.length > 0 || launchEntries.length > 0
          const title = kinds && [
            kinds.has('launch') ? t(lang, 'dashboard.calendarLegendLaunch') : null,
            kinds.has('sprint') ? t(lang, 'dashboard.calendarLegendSprint') : null
          ].filter(Boolean).join(' · ')
          return (
            // Un <div> plutôt qu'un <button> : le popover du jour contient lui-même des
            // boutons cliquables (plan, story) — un <button> imbriqué dans un <button> est
            // invalide en HTML et casse le rendu. role="button" + clavier gardent
            // l'accessibilité sans cette contrainte.
            <div
              key={iso}
              role={hasActivity ? 'button' : undefined}
              tabIndex={hasActivity ? 0 : undefined}
              className={`dashboard-calendar-cell ${isToday ? 'is-today' : ''} ${sprintEntries.length ? 'has-sprint' : ''} ${hasActivity ? 'is-clickable' : ''}`}
              title={title || undefined}
              onClick={() => hasActivity && setOpenDay(o => (o === iso ? null : iso))}
              onKeyDown={(e) => {
                if (!hasActivity) return
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenDay(o => (o === iso ? null : iso)) }
              }}
              aria-expanded={hasActivity ? openDay === iso : undefined}
            >
              <span className="dashboard-calendar-day-num">{date.getDate()}</span>
              {kinds && (
                <span className="dashboard-calendar-dots" aria-hidden="true">
                  {kinds.has('launch') && <span className="dashboard-calendar-dot dashboard-calendar-dot-launch" />}
                  {kinds.has('sprint') && <span className="dashboard-calendar-dot dashboard-calendar-dot-sprint" />}
                </span>
              )}
              {openDay === iso && (
                <DayPopover
                  date={date}
                  lang={lang}
                  sprintEntries={sprintEntries}
                  launchEntries={launchEntries}
                  onOpenPlan={onOpenPlan}
                  onClose={() => setOpenDay(null)}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="dashboard-calendar-legend">
        <span><span className="dashboard-calendar-dot dashboard-calendar-dot-launch" /> {t(lang, 'dashboard.calendarLegendLaunch')}</span>
        <span><span className="dashboard-calendar-dot dashboard-calendar-dot-sprint" /> {t(lang, 'dashboard.calendarLegendSprint')}</span>
        <span><span className="dashboard-calendar-sprint-swatch" /> {t(lang, 'dashboard.calendarLegendActiveSprint')}</span>
      </div>
    </div>
  )
}
