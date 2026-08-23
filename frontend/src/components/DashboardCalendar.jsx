import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { t } from '../lib/i18n'
import { IconChevronLeft, IconChevronRight, IconCircleDot, IconClock, IconCheckCircle } from './Icons'

const SPRINT_DAYS = 14
const STATUS_ICONS = { todo: IconCircleDot, in_progress: IconClock, done: IconCheckCircle }
const STATUS_I18N_KEY = { todo: 'todo', in_progress: 'inProgress', done: 'done' }
// Une couleur par sprint (pas juste une teinte cyan uniforme pour tout sprint actif) —
// pour distinguer d'un coup d'œil plusieurs sprints qui se chevauchent sur le calendrier
// (retour utilisateur), même palette que BenchmarksCard.jsx.
const SPRINT_PALETTE = ['#9184d9', '#06b6d4', '#4ade80', '#fb923c', '#f472b6', '#eab308']

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
//
// Rendu via portail dans document.body, en position:fixed à partir de `anchorRect` (plutôt
// qu'ancré en position:absolute dans la cellule du jour) — la carte de widget ancêtre a un
// overflow-y:auto (nécessaire pour son propre défilement), qui force aussi overflow-x:auto
// (impossible à éviter en CSS pur sur un même élément). Un popover positionné en absolute
// dans une cellule proche du bord GAUCHE de la grille se faisait donc rogner par ce clip
// dès qu'il débordait vers la gauche — invisible/non scrollable côté gauche, correct côté
// droit où le débordement se faisait plutôt vers la droite, à l'intérieur de la carte
// (retour utilisateur, capture à l'appui). Même recette que HoverTooltip.jsx et le menu
// contextuel "Taille" (DashboardWidgetGrid.jsx) pour le même problème structurel.
function DayPopover({ date, lang, sprintEntries, launchEntries, onOpenPlan, onClose, anchorRect }) {
  const ref = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    // Fermer au scroll plutôt que de suivre : le popover est en position:fixed (voir plus
    // haut, pour échapper à l'overflow de la carte de widget), donc il ne défile PAS avec
    // la page — en le laissant ouvert, il restait figé à son ancien endroit à l'écran
    // pendant que la page défilait sous lui, donnant l'impression qu'il "se déplaçait dans
    // toute la page" (retour utilisateur, capture à l'appui). Un scroll d'un ascendant ne
    // "bubble" pas en JS, mais la phase de capture sur window intercepte bien l'événement
    // quel que soit le conteneur qui défile réellement.
    // Le popover a lui-même un overflow-y:auto (liste de stories) : un scroll À L'INTÉRIEUR
    // de son propre contenu déclenche aussi cet événement en phase de capture, fermant le
    // popover dès la première tentative de défilement interne (retour utilisateur : "on ne
    // peut même plus scroller que la popup disparaît"). On ignore donc les scrolls dont la
    // cible est le popover ou l'un de ses descendants — seul un scroll d'un vrai ascendant
    // de la page doit encore le fermer.
    const onScroll = (e) => {
      if (ref.current && e.target instanceof Node && ref.current.contains(e.target)) return
      onClose()
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', onScroll, { capture: true })
    }
  }, [onClose])

  const dateLabel = date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })

  // Centré sous la cellule, mais rabattu pour ne jamais sortir du viewport (bord gauche ou
  // droit de l'écran, pas seulement de la carte) — largeur du popover fixe (360px, voir
  // CSS) donc calculable ici sans mesurer le DOM après coup.
  const POPOVER_WIDTH = 360
  const MARGIN = 8
  const centerX = anchorRect.left + anchorRect.width / 2
  const left = Math.min(
    Math.max(centerX - POPOVER_WIDTH / 2, MARGIN),
    window.innerWidth - POPOVER_WIDTH - MARGIN
  )
  const style = { position: 'fixed', top: anchorRect.bottom + 6, left, width: POPOVER_WIDTH }

  return createPortal(
    <div className="dashboard-calendar-day-popover" ref={ref} style={style} onClick={(e) => e.stopPropagation()}>
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
            {/* Repère de couleur du sprint (même couleur que sa ligne continue sur la
                grille du calendrier) accolé au libellé "Sprint N" — permet de relier d'un
                coup d'œil les stories affichées ici à leur ligne sur le calendrier
                au-dessus (retour utilisateur). */}
            <span className="dashboard-calendar-popover-sprint-swatch" style={{ background: entry.color }} aria-hidden="true" />
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
    </div>,
    document.body
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

  // Une couleur stable par sprint (planId + sprintId), attribuée dans l'ordre de première
  // rencontre — stable d'un rendu à l'autre tant que la liste de plans ne change pas,
  // pour que la ligne colorée d'un sprint reste la même couleur tous les mois où on la
  // recroise.
  const sprintColorMap = useMemo(() => {
    const map = new Map()
    let i = 0
    for (const plan of plans || []) {
      for (const sp of (plan.roadmap?.sprints || [])) {
        const key = `${plan.id}:${sp.sprintId}`
        if (!map.has(key)) { map.set(key, SPRINT_PALETTE[i % SPRINT_PALETTE.length]); i++ }
      }
    }
    return map
  }, [plans])

  // Étale chaque sprint de chaque plan sur toute sa fenêtre de 14 jours (pas juste son jour
  // de fin) — "on aura une vue globale" : la période active de tous les sprints, tous plans
  // confondus, se voit directement sur le calendrier plutôt qu'un seul point par plan.
  // `isStart`/`isEnd` et `color` permettent de dessiner une ligne continue colorée par
  // sprint (coins arrondis seulement aux deux bouts) plutôt qu'une simple teinte uniforme
  // qui ne distinguait pas deux sprints actifs en même temps (retour utilisateur).
  const sprintsByDay = useMemo(() => {
    const map = new Map()
    for (const plan of plans || []) {
      const sprints = plan.roadmap?.sprints || []
      if (!sprints.length) continue
      const base = new Date(plan.planStartDate || plan.generatedAt || Date.now())
      for (const sp of sprints) {
        const start = new Date(base)
        start.setDate(start.getDate() + (sp.sprintId - 1) * SPRINT_DAYS)
        const key = `${plan.id}:${sp.sprintId}`
        for (let i = 0; i < SPRINT_DAYS; i++) {
          const day = new Date(start)
          day.setDate(day.getDate() + i)
          const iso = isoDateOnly(day)
          if (!map.has(iso)) map.set(iso, [])
          map.get(iso).push({
            key,
            planId: plan.id,
            planName: plan.product?.name || null,
            sprintId: sp.sprintId,
            stories: sp.stories || [],
            plan,
            color: sprintColorMap.get(key),
            isStart: i === 0,
            isEnd: i === SPRINT_DAYS - 1
          })
        }
      }
    }
    // Ordre stable (par clé sprint) pour que la même barre reste au même "étage" d'un jour
    // à l'autre quand plusieurs sprints se chevauchent — sans ça, la ligne semblerait
    // sauter de position au fil des jours.
    map.forEach(entries => entries.sort((a, b) => a.key.localeCompare(b.key)))
    return map
  }, [plans, sprintColorMap])

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
              onClick={(e) => {
                if (!hasActivity) return
                const rect = e.currentTarget.getBoundingClientRect()
                setOpenDay(o => (o?.iso === iso ? null : { iso, rect }))
              }}
              onKeyDown={(e) => {
                if (!hasActivity) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  const rect = e.currentTarget.getBoundingClientRect()
                  setOpenDay(o => (o?.iso === iso ? null : { iso, rect }))
                }
              }}
              aria-expanded={hasActivity ? openDay?.iso === iso : undefined}
            >
              <span className="dashboard-calendar-day-num">{date.getDate()}</span>
              {sprintEntries.length > 0 && (
                <span className="dashboard-calendar-sprint-bars" aria-hidden="true">
                  {sprintEntries.slice(0, 3).map(entry => (
                    <span
                      key={entry.key}
                      className={`dashboard-calendar-sprint-bar ${entry.isStart ? 'is-start' : ''} ${entry.isEnd ? 'is-end' : ''}`}
                      style={{ background: entry.color }}
                    />
                  ))}
                </span>
              )}
              {kinds && (
                <span className="dashboard-calendar-dots" aria-hidden="true">
                  {kinds.has('launch') && <span className="dashboard-calendar-dot dashboard-calendar-dot-launch" />}
                  {kinds.has('sprint') && <span className="dashboard-calendar-dot dashboard-calendar-dot-sprint" />}
                </span>
              )}
              {openDay?.iso === iso && (
                <DayPopover
                  date={date}
                  lang={lang}
                  sprintEntries={sprintEntries}
                  launchEntries={launchEntries}
                  onOpenPlan={onOpenPlan}
                  onClose={() => setOpenDay(null)}
                  anchorRect={openDay.rect}
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
