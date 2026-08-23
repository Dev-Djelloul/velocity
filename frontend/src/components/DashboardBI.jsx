import { t } from '../lib/i18n'
import { formatMoney } from '../lib/currency'
import CircularGauge from './CircularGauge'
import GaugeProgress from './GaugeProgress'
import { IconBarChart, IconClipboard, IconCalendar, IconChevronUp, IconChevronDown, IconMinus } from './Icons'
import '../styles/DashboardBI.css'

const DONUT_COLORS = ['#9184d9', '#06b6d4', '#4ade80', '#fb923c', '#ef4444', '#6366f1', '#f472b6', '#a89fe8']

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
  const doneStoryCount = allStories.filter(s => s.status === 'done').length
  const inProgressStoryCount = allStories.filter(s => s.status === 'in_progress').length
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
  let doneEffort = 0, inProgressEffort = 0, overdueEffort = 0, todoEffort = 0
  sprints.forEach(sp => {
    const sprintEndMs = new Date(scheduleStart || nowMs).getTime() + sp.sprintId * SPRINT_DAYS * 86400000
    const sprintOverdue = sprintEndMs < nowMs
    sp.stories.forEach(s => {
      if (s.status === 'done') doneEffort += s.effort
      else if (sprintOverdue) overdueEffort += s.effort
      else if (s.status === 'in_progress') inProgressEffort += s.effort
      else todoEffort += s.effort
    })
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
          const ringSegments = [
            { key: 'done', labelKey: 'statusDone', color: '#4ade80', value: doneEffort },
            { key: 'overdue', labelKey: 'statusOverdue', color: '#ef4444', value: overdueEffort },
            { key: 'inProgress', labelKey: 'statusInProgress', color: '#facc15', value: inProgressEffort },
            { key: 'todo', labelKey: 'statusTodo', color: 'rgba(255, 255, 255, 0.16)', value: todoEffort }
          ].filter(seg => seg.value > 0)
          const ringTotal = ringSegments.reduce((s, seg) => s + seg.value, 0) || 1
          let cursor = 0
          const stops = ringSegments.map(seg => {
            const pct = (seg.value / ringTotal) * 100
            const stop = `${seg.color} ${cursor}% ${cursor + pct}%`
            cursor += pct
            return stop
          })
          const overallPct = Math.round((progressStoryEffort / (totalStoryEffort || 1)) * 100)
          return (
            <div className="dashboard-bi-tile">
              <h4>{t(lang, 'dashboardBi.overallProgress')}</h4>
              <div className="status-ring-wrap">
                <div className="donut status-ring" style={{ background: `conic-gradient(${stops.join(', ')})` }}>
                  <div className="donut-center">
                    <span className="status-ring-value">{overallPct}%</span>
                  </div>
                </div>
                <div className="status-ring-legend">
                  {ringSegments.map(seg => (
                    <span key={seg.key} className="status-ring-legend-item" title={t(lang, `dashboardBi.${seg.labelKey}`)}>
                      <i className="status-ring-dot" style={{ background: seg.color }} />
                      {Math.round(seg.value)}
                    </span>
                  ))}
                </div>
              </div>
              <p className="dashboard-bi-tile-hint">{t(lang, 'dashboardBi.storiesCompleted')(doneStoryCount, inProgressStoryCount, allStories.length)}</p>
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
              <h4>{t(lang, 'dashboardBi.schedulePace')}</h4>
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
            <h4>{t(lang, 'dashboardBi.costSplit')}</h4>
            <Donut
              segments={financials.costBreakdown.map(c => ({ name: c.category, value: c.amount, display: `${c.pct}%` }))}
              centerValue={formatMoney(financials.monthlyBurn)}
              centerLabel={t(lang, 'dashboardBi.monthlyBurn')}
            />
          </div>
        )}

        {budgetSegments.length > 0 && (
          <div className="dashboard-bi-tile">
            <h4>{t(lang, 'dashboardBi.budgetByChannel')}</h4>
            <Donut
              segments={budgetSegments}
              centerValue={formatMoney(marketing.totalBudget)}
              centerLabel={t(lang, 'dashboardBi.total')}
            />
          </div>
        )}

        {workloadSegments.length > 0 && (
          <div className="dashboard-bi-tile dashboard-bi-tile-half">
            <h4>{t(lang, 'dashboardBi.workloadByRole')}</h4>
            <Donut
              segments={workloadSegments}
              centerValue={`${workloadSegments.reduce((s, seg) => s + seg.value, 0)}pts`}
              centerLabel={t(lang, 'dashboardBi.totalEffort')}
            />
          </div>
        )}

        {sprints.length > 0 && (
          <div className="dashboard-bi-tile dashboard-bi-tile-half">
            <h4>{t(lang, 'dashboardBi.velocityBySprint')}</h4>
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
            <h4>{t(lang, 'dashboardBi.kpiTargets')}</h4>
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
