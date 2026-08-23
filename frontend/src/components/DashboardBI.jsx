import { useEffect, useRef, useState } from 'react'
import { t } from '../lib/i18n'
import { formatMoney } from '../lib/currency'
import CircularGauge from './CircularGauge'
import GaugeProgress from './GaugeProgress'
import { IconBarChart, IconClipboard, IconCalendar, IconChevronUp, IconChevronDown, IconMinus, IconHelpCircle } from './Icons'
import '../styles/DashboardBI.css'

const DONUT_COLORS = ['#9184d9', '#06b6d4', '#4ade80', '#fb923c', '#ef4444', '#6366f1', '#f472b6', '#a89fe8']

// Deux nuances (claire/sombre) par statut de story — alternées d'une story à l'autre sur la
// couronne extérieure de "Avancement global" pour que deux stories voisines du même statut
// restent visuellement deux parts distinctes plutôt qu'un seul bloc continu. "En cours" en
// orange (pas jaune) — retour utilisateur : l'échelle attendue est vert/orange/rouge (+ gris
// sombre pour "pas commencé"), et l'orange #f59e0b est aussi celui déjà utilisé pour ce même
// statut dans le Backlog/la Roadmap du plan et les puces du calendrier — cohérence garantie.
const TICK_COLORS = {
  done: ['#4ade80', '#22c55e'],
  overdue: ['#f87171', '#dc2626'],
  inProgress: ['#fb923c', '#f59e0b'],
  todo: ['rgba(255, 255, 255, 0.26)', 'rgba(255, 255, 255, 0.12)']
}

const STATUS_LABEL_KEYS = { done: 'statusDone', overdue: 'statusOverdue', inProgress: 'statusInProgress', todo: 'statusTodo' }

function polarPoint(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

// Chemin SVG d'une part d'anneau (donut wedge) entre deux rayons et deux angles.
function donutWedgePath(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const large = endAngle - startAngle > 180 ? 1 : 0
  const a0 = polarPoint(cx, cy, rOuter, endAngle)
  const a1 = polarPoint(cx, cy, rOuter, startAngle)
  const b0 = polarPoint(cx, cy, rInner, startAngle)
  const b1 = polarPoint(cx, cy, rInner, endAngle)
  return `M ${a0.x} ${a0.y} A ${rOuter} ${rOuter} 0 ${large} 0 ${a1.x} ${a1.y} L ${b0.x} ${b0.y} A ${rInner} ${rInner} 0 ${large} 1 ${b1.x} ${b1.y} Z`
}

// Répartit une liste de {value, ...} sur 360°, avec un petit espace vide entre les parts.
function layoutRing(segments, gapDeg) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  let angle = 0
  return segments.map(seg => {
    const sweep = (seg.value / total) * 360
    const start = angle + gapDeg / 2
    const end = Math.max(start, angle + sweep - gapDeg / 2)
    angle += sweep
    return { ...seg, start, end }
  })
}

// Anneau interactif en SVG (pas un simple conic-gradient CSS) — retour utilisateur : "quand
// je parlais de survol, je voulais dire sur le camembert lui-même", donc chaque part doit
// être un vrai élément survolable avec sa propre info-bulle, pas juste une icône (?) à côté.
// Deux couronnes concentriques : l'extérieure (une part par story) et l'intérieure (le %
// agrégé par statut), avec un pourcentage au centre.
function StatusDonut({ outerSegments, innerSegments, centerLabel, size = 160 }) {
  const [tooltip, setTooltip] = useState(null)
  const wrapRef = useRef(null)
  const cx = size / 2
  const cy = size / 2
  const outerR2 = size / 2 - 2
  const outerR1 = outerR2 - 11
  const innerR2 = outerR1 - 7
  const innerR1 = innerR2 - 26

  const outerWedges = layoutRing(outerSegments, outerSegments.length > 24 ? 1 : 2.2)
  const innerWedges = layoutRing(innerSegments, 2.5)

  const showTooltip = (e, text) => {
    const rect = wrapRef.current.getBoundingClientRect()
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, text })
  }

  return (
    <div className="status-donut" ref={wrapRef} onMouseLeave={() => setTooltip(null)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {outerWedges.map((seg, i) => (
          <path
            key={`o-${i}`}
            d={donutWedgePath(cx, cy, outerR2, outerR1, seg.start, seg.end)}
            fill={seg.color}
            className="status-donut-wedge"
            onMouseMove={(e) => showTooltip(e, seg.tooltip)}
          />
        ))}
        {innerWedges.map((seg, i) => (
          <path
            key={`i-${i}`}
            d={donutWedgePath(cx, cy, innerR2, innerR1, seg.start, seg.end)}
            fill={seg.color}
            className="status-donut-wedge"
            onMouseMove={(e) => showTooltip(e, seg.tooltip)}
          />
        ))}
      </svg>
      <div className="status-donut-center">{centerLabel}</div>
      {tooltip && (
        <div className="status-donut-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>{tooltip.text}</div>
      )}
    </div>
  )
}

// Icône d'aide sur chaque titre de carte du Dashboard — avant, seule une poignée de cartes
// expliquaient ce qu'elles montraient. Un pur ::after CSS sur :hover (même mécanisme que
// plan-stat-tooltip) ne marche que sur desktop : sur mobile/tactile, il n'y a pas de survol,
// donc "ça ne fonctionnait pas du tout" (retour utilisateur) — remplacé par un vrai bouton
// qui bascule un petit popover au clic/tap, en plus de rester consultable au survol sur
// desktop. Se ferme sur clic extérieur ou Échap.
function CardHelp({ text }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKeyDown = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <span className="card-help-icon" ref={ref}>
      <button
        type="button"
        className="card-help-trigger"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        aria-expanded={open}
      >
        <IconHelpCircle width={13} height={13} />
      </button>
      <span className={`card-help-popover ${open ? 'is-open' : ''}`}>{text}</span>
    </span>
  )
}

function Donut({ segments, centerLabel, centerValue }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  let cursor = 0
  const stops = segments.map((seg, i) => {
    const pct = (seg.value / total) * 100
    const stop = `${DONUT_COLORS[i % DONUT_COLORS.length]} ${cursor}% ${cursor + pct}%`
    cursor += pct
    return stop
  })

  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${stops.join(', ')})` }}>
        <div className="donut-center">
          <span className="donut-center-value">{centerValue}</span>
          <span className="donut-center-label">{centerLabel}</span>
        </div>
      </div>
      <div className="donut-legend">
        {segments.map((seg, i) => (
          <div key={seg.name} className="donut-legend-item">
            <i className="donut-swatch" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
            <span>{seg.name}</span>
            <span className="donut-legend-value">{seg.display}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Dernière mesure trackée pour un KPI donné (même logique que PostLaunchTracking.historyFor) —
// les entrées sans kpiIndex (anciennes données) sont rattachées au KPI principal (index 0).
function latestTrackedValue(metricsHistory, idx) {
  const entries = (metricsHistory || []).filter(h => (h.kpiIndex ?? 0) === idx)
  if (!entries.length) return 0
  return entries.reduce((latest, h) => (!latest || h.date > latest.date ? h : latest), null).value
}

// Regroupe un lot de stories par responsable — vrais membres d'équipe quand on en a
// (story.assignedToId, le travail sans assignation nominative étant réparti à parts égales
// entre eux), sinon repli sur le rôle générique de la story. Factorisé pour être réutilisé
// à la fois par le donut "Charge par responsable" (toutes les stories) et par chaque barre
// de "Vélocité par sprint" (stories du sprint), avec les mêmes couleurs pour les deux.
function computeWorkloadSegments(stories, teamMembers) {
  if (teamMembers?.length) {
    const perMember = new Map(teamMembers.map(m => [m.id, { name: m.name, effort: 0 }]))
    let unassignedEffort = 0
    stories.forEach(s => {
      const entry = s.assignedToId && perMember.get(s.assignedToId)
      if (entry) entry.effort += s.effort
      else unassignedEffort += s.effort
    })
    if (unassignedEffort > 0) {
      const share = unassignedEffort / teamMembers.length
      perMember.forEach(entry => { entry.effort += share })
    }
    return [...perMember.values()].map(({ name, effort }) => ({ name, value: Math.round(effort) }))
  }
  const map = {}
  stories.forEach(s => { map[s.assignee] = (map[s.assignee] || 0) + s.effort })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

export default function DashboardBI({ plan, lang, teamMembers }) {
  if (!plan) return null

  const { roadmap, marketing, kpis, financials, metricsHistory } = plan

  const budgetSegments = (marketing?.channels || []).map(ch => ({
    name: ch.name,
    value: ch.budget,
    display: formatMoney(ch.budget)
  }))

  // "Charge par responsable" doit refléter de vraies personnes, pas des rôles génériques
  // "Dev"/"Marketing" déconnectés de l'équipe réelle (retour utilisateur) — chaque story
  // assignée à un membre réel (BacklogCard, story.assignedToName) compte pour ce membre ;
  // le travail encore sans assignation nominative est réparti à parts égales entre tous les
  // membres de l'équipe, pour que le total corresponde bien à tous les membres plutôt qu'à
  // un panier "rôle" fourre-tout. En espace personnel (pas de teamMembers), on retombe sur
  // le rôle générique de la story faute de mieux.
  const allRoadmapStories = (roadmap?.sprints || []).flatMap(sp => sp.stories)
  const workloadSegments = computeWorkloadSegments(allRoadmapStories, teamMembers)
    .map(seg => ({ ...seg, display: `${seg.value}pts` }))
  // Même couleurs que le donut pour un responsable donné, réutilisées dans les barres de
  // vélocité par sprint (retour utilisateur : les deux graphiques doivent se répondre).
  const workloadColorMap = new Map(workloadSegments.map((seg, i) => [seg.name, DONUT_COLORS[i % DONUT_COLORS.length]]))

  const sprints = roadmap?.sprints || []
  const maxSprintEffort = Math.max(1, ...sprints.map(sp => sp.stories.reduce((s, x) => s + x.effort, 0)))

  const allStories = sprints.flatMap(sp => sp.stories)
  const totalStoryEffort = allStories.reduce((s, x) => s + x.effort, 0)
  // "Terminé" au sens strict sous-représentait l'avancement réel : une story "en cours"
  // valait 0, comme si elle n'avait pas été commencée (retour utilisateur). Elle compte
  // maintenant pour la moitié de son effort — done=100%, in_progress=50%, todo=0%.
  const progressStoryEffort = allStories.reduce((s, x) => {
    const weight = x.status === 'done' ? 1 : x.status === 'in_progress' ? 0.5 : 0
    return s + x.effort * weight
  }, 0)

  // Rythme réel (avancement des stories) vs rythme attendu (position dans le calendrier
  // entre date de début et date de lancement) — permet de voir en un coup d'œil si le plan
  // avance plus vite ou plus lentement que prévu, pas seulement "où on en est".
  const scheduleStart = plan.planStartDate || plan.generatedAt
  const scheduleEnd = plan.launchDate
  let schedulePacePct = null
  if (scheduleStart && scheduleEnd) {
    const startMs = new Date(scheduleStart).getTime()
    const endMs = new Date(scheduleEnd).getTime()
    if (!Number.isNaN(startMs) && !Number.isNaN(endMs) && endMs > startMs) {
      schedulePacePct = Math.round(Math.max(0, Math.min(100, ((Date.now() - startMs) / (endMs - startMs)) * 100)))
    }
  }

  // "Avancement global" doit distinguer terminé / en cours / pas commencé / en retard
  // plutôt qu'une seule couleur (retour utilisateur : c'est la première métrique regardée,
  // elle doit tout dire d'un coup d'œil). "En retard" = story pas terminée dont le sprint
  // est déjà censé être fini — même calcul de fin de sprint que upcomingDeadlines.js/
  // GanttChart.jsx (planStartDate + 14 jours par sprint), pour rester cohérent avec le
  // reste de l'app plutôt que d'inventer une nouvelle notion de retard.
  const SPRINT_DAYS = 14
  const nowMs = Date.now()
  // Source unique pour l'anneau (moyen agrégé) ET pour la couronne extérieure (une part
  // par story, voir plus bas) — évite de recalculer le statut de chaque story deux fois
  // avec un risque de divergence entre les deux.
  const storyStatuses = sprints.flatMap(sp => {
    const sprintEndMs = new Date(scheduleStart || nowMs).getTime() + sp.sprintId * SPRINT_DAYS * 86400000
    const sprintOverdue = sprintEndMs < nowMs
    return sp.stories.map(s => ({
      effort: s.effort,
      title: s.title,
      status: s.status === 'done' ? 'done' : sprintOverdue ? 'overdue' : s.status === 'in_progress' ? 'inProgress' : 'todo'
    }))
  })
  let doneEffort = 0, inProgressEffort = 0, overdueEffort = 0, todoEffort = 0
  let doneCount = 0, inProgressCount = 0, overdueCount = 0, todoCount = 0
  storyStatuses.forEach(s => {
    if (s.status === 'done') { doneEffort += s.effort; doneCount++ }
    else if (s.status === 'overdue') { overdueEffort += s.effort; overdueCount++ }
    else if (s.status === 'inProgress') { inProgressEffort += s.effort; inProgressCount++ }
    else { todoEffort += s.effort; todoCount++ }
  })

  const primaryKpi = kpis?.[0]

  return (
    <div className="dashboard-bi card">
      <div className="dashboard-bi-header">
        <h3><IconBarChart width={16} height={16} /> {t(lang, 'dashboardBi.title')}</h3>
        <p className="dashboard-bi-subtitle">{t(lang, 'dashboardBi.subtitle')}</p>
      </div>

      <div className="dashboard-bi-grid">
        {allStories.length > 0 && (() => {
          const allRingSegments = [
            { key: 'done', labelKey: 'statusDone', color: '#4ade80', value: doneEffort, count: doneCount },
            { key: 'overdue', labelKey: 'statusOverdue', color: '#ef4444', value: overdueEffort, count: overdueCount },
            { key: 'inProgress', labelKey: 'statusInProgress', color: '#f59e0b', value: inProgressEffort, count: inProgressCount },
            { key: 'todo', labelKey: 'statusTodo', color: 'rgba(255, 255, 255, 0.16)', value: todoEffort, count: todoCount }
          ]
          const ringSegments = allRingSegments.filter(seg => seg.value > 0)
          const overallPct = Math.round((progressStoryEffort / (totalStoryEffort || 1)) * 100)

          // Couronne extérieure : une part par story (pas par effort) — retour utilisateur :
          // l'anneau seul ne montrait jamais qu'il y avait "12 stories" au total, deux stories
          // du même statut fusionnaient en un seul bloc de couleur continu. Chaque part est
          // ici discrète (petit espace vide entre deux) et alterne deux nuances de sa couleur
          // de statut (claire/sombre) pour rester distincte de sa voisine même de même statut.
          // Chaque part (des deux couronnes) est un vrai <path> SVG survolable, avec sa
          // propre info-bulle — retour utilisateur : le survol devait porter sur le
          // camembert lui-même, pas seulement sur l'icône (?) à côté du titre.
          const outerDonutSegments = storyStatuses.map((s, i) => ({
            value: 1,
            color: TICK_COLORS[s.status][i % 2],
            tooltip: `${s.title} — ${t(lang, `dashboardBi.${STATUS_LABEL_KEYS[s.status]}`)}`
          }))
          const innerDonutSegments = ringSegments.map(seg => ({
            value: seg.value,
            color: seg.color,
            tooltip: `${t(lang, `dashboardBi.${seg.labelKey}`)} — ${t(lang, 'dashboardBi.storyCount')(seg.count)}`
          }))

          return (
            <div className="dashboard-bi-tile">
              <h4>{t(lang, 'dashboardBi.overallProgress')} <CardHelp text={t(lang, 'dashboardBi.overallProgressHelp')} /></h4>
              <div className="status-ring-wrap">
                <StatusDonut
                  outerSegments={outerDonutSegments}
                  innerSegments={innerDonutSegments}
                  centerLabel={`${overallPct}%`}
                />
                {/* Une ligne par statut, avec le nombre de stories (pas les points, qui
                    n'avaient de sens que pour dessiner l'anneau intérieur) — retour
                    utilisateur : "2/12 · 3 en cours" en une phrase ne disait rien sur le "pas
                    commencé" ni le "en retard", il fallait tout détailler ligne par ligne. */}
                <div className="status-ring-list">
                  {ringSegments.map(seg => (
                    <div key={seg.key} className="status-ring-row">
                      <i className="status-ring-dot" style={{ background: seg.color }} />
                      <span className="status-ring-row-label">{t(lang, `dashboardBi.${seg.labelKey}`)}</span>
                      <span className="status-ring-row-count">{t(lang, 'dashboardBi.storyCount')(seg.count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}

        {schedulePacePct !== null && (() => {
          const workProgressPct = Math.round((progressStoryEffort / (totalStoryEffort || 1)) * 100)
          const gap = workProgressPct - schedulePacePct
          // Seuil de 5 points avant de qualifier l'écart d'avance/retard réel — sous ce seuil,
          // c'est du bruit de mesure, pas un signal.
          const tone = gap >= 5 ? 'good' : gap <= -5 ? 'danger' : 'warning'
          const GapIcon = gap >= 5 ? IconChevronUp : gap <= -5 ? IconChevronDown : IconMinus
          return (
            <div className="dashboard-bi-tile">
              <h4>{t(lang, 'dashboardBi.schedulePace')} <CardHelp text={t(lang, 'dashboardBi.schedulePaceCardHelp')} /></h4>
              <div className="pace-compare">
                <div className="pace-compare-side">
                  <IconClipboard width={20} height={20} />
                  <span className="pace-compare-value">{workProgressPct}%</span>
                  <span className="pace-compare-label">{t(lang, 'dashboardBi.paceStories')}</span>
                </div>
                <div className={`pace-compare-gap pace-compare-gap-${tone}`}>
                  <GapIcon width={22} height={22} />
                </div>
                <div className="pace-compare-side">
                  <IconCalendar width={20} height={20} />
                  <span className="pace-compare-value">{schedulePacePct}%</span>
                  <span className="pace-compare-label">{t(lang, 'dashboardBi.paceCalendar')}</span>
                </div>
              </div>
            </div>
          )
        })()}

        {financials && (
          <div className="dashboard-bi-tile">
            <h4>{t(lang, 'dashboardBi.costSplit')} <CardHelp text={t(lang, 'dashboardBi.costSplitHelp')} /></h4>
            <Donut
              segments={financials.costBreakdown.map(c => ({ name: c.category, value: c.amount, display: `${c.pct}%` }))}
              centerValue={formatMoney(financials.monthlyBurn)}
              centerLabel={t(lang, 'dashboardBi.monthlyBurn')}
            />
          </div>
        )}

        {budgetSegments.length > 0 && (
          <div className="dashboard-bi-tile">
            <h4>{t(lang, 'dashboardBi.budgetByChannel')} <CardHelp text={t(lang, 'dashboardBi.budgetByChannelHelp')} /></h4>
            <Donut
              segments={budgetSegments}
              centerValue={formatMoney(marketing.totalBudget)}
              centerLabel={t(lang, 'dashboardBi.total')}
            />
          </div>
        )}

        {workloadSegments.length > 0 && (
          <div className="dashboard-bi-tile dashboard-bi-tile-half">
            <h4>{t(lang, 'dashboardBi.workloadByRole')} <CardHelp text={t(lang, 'dashboardBi.workloadByRoleHelp')} /></h4>
            <Donut
              segments={workloadSegments}
              centerValue={`${workloadSegments.reduce((s, seg) => s + seg.value, 0)}pts`}
              centerLabel={t(lang, 'dashboardBi.totalEffort')}
            />
          </div>
        )}

        {sprints.length > 0 && (
          <div className="dashboard-bi-tile dashboard-bi-tile-half">
            <h4>{t(lang, 'dashboardBi.velocityBySprint')} <CardHelp text={t(lang, 'dashboardBi.velocityBySprintHelp')} /></h4>
            <div className="velocity-bars">
              {sprints.map(sp => {
                const total = sp.stories.reduce((s, x) => s + x.effort, 0)
                const done = sp.stories.filter(s => s.status === 'done').reduce((s, x) => s + x.effort, 0)
                // Mêmes couleurs par responsable que "Charge par responsable" (retour
                // utilisateur : les deux graphiques doivent se répondre) — ordre fixé sur
                // celui du donut global pour que la couleur d'un responsable donné reste la
                // même d'une barre de sprint à l'autre. Le voile sombre en haut de la barre
                // indique la part encore non terminée, la couleur en dessous indique qui.
                const sprintValueByName = new Map(computeWorkloadSegments(sp.stories, teamMembers).map(seg => [seg.name, seg.value]))
                return (
                  <div key={sp.sprintId} className="velocity-bar-col">
                    <div className="velocity-bar-track" style={{ height: '100%' }}>
                      <div
                        className="velocity-bar-total"
                        style={{ height: `${(total / maxSprintEffort) * 100}%` }}
                        title={`S${sp.sprintId} — ${done}/${total}pts ${t(lang, 'dashboardBi.pointsDone')}`}
                      >
                        {workloadSegments.map(seg => {
                          const value = sprintValueByName.get(seg.name) || 0
                          if (!value) return null
                          return (
                            <div
                              key={seg.name}
                              className="velocity-bar-segment"
                              style={{ height: `${(value / total) * 100}%`, background: workloadColorMap.get(seg.name) }}
                              title={`${seg.name} — ${Math.round(value)}pts`}
                            />
                          )
                        })}
                        <div className="velocity-bar-undone" style={{ height: total ? `${((total - done) / total) * 100}%` : 0 }} />
                      </div>
                    </div>
                    <span className="velocity-bar-label">S{sp.sprintId}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {kpis?.length > 0 && (
          <div className="dashboard-bi-tile dashboard-bi-tile-full">
            <h4>{t(lang, 'dashboardBi.kpiTargets')} <CardHelp text={t(lang, 'dashboardBi.kpiTargetsCardHelp')} /></h4>
            <p className="dashboard-bi-tile-hint">{t(lang, 'dashboardBi.kpiTargetsHint')}</p>
            <div className="dashboard-bi-kpis">
              {primaryKpi && (
                <CircularGauge
                  value={latestTrackedValue(metricsHistory, 0)}
                  max={primaryKpi.target || 100}
                  label={primaryKpi.name}
                  unit={primaryKpi.unit}
                />
              )}
              <div className="dashboard-bi-kpi-bars">
                {kpis.slice(1).map((k, i) => (
                  <GaugeProgress
                    key={i}
                    label={k.name}
                    value={latestTrackedValue(metricsHistory, i + 1)}
                    max={k.target || 100}
                    unit={k.unit}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
