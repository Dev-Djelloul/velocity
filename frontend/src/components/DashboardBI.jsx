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
  let workloadSegments
  if (teamMembers?.length) {
    const perMember = new Map(teamMembers.map(m => [m.id, { name: m.name, effort: 0 }]))
    let unassignedEffort = 0
    allRoadmapStories.forEach(s => {
      const entry = s.assignedToId && perMember.get(s.assignedToId)
      if (entry) entry.effort += s.effort
      else unassignedEffort += s.effort
    })
    if (unassignedEffort > 0) {
      const share = unassignedEffort / teamMembers.length
      perMember.forEach(entry => { entry.effort += share })
    }
    workloadSegments = [...perMember.values()].map(({ name, effort }) => ({
      name, value: Math.round(effort), display: `${Math.round(effort)}pts`
    }))
  } else {
    const workloadMap = {}
    allRoadmapStories.forEach(s => { workloadMap[s.assignee] = (workloadMap[s.assignee] || 0) + s.effort })
    workloadSegments = Object.entries(workloadMap).map(([name, value]) => ({
      name, value, display: `${value}pts`
    }))
  }

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

  const primaryKpi = kpis?.[0]

  return (
    <div className="dashboard-bi card">
      <div className="dashboard-bi-header">
        <h3><IconBarChart width={16} height={16} /> {t(lang, 'dashboardBi.title')}</h3>
        <p className="dashboard-bi-subtitle">{t(lang, 'dashboardBi.subtitle')}</p>
      </div>

      <div className="dashboard-bi-grid">
        {allStories.length > 0 && (() => {
          // Vert seulement si tout est vraiment terminé ; jaune dès qu'il y a du travail "en
          // cours" (retour utilisateur : une story à moitié faite ne doit pas paraître aussi
          // aboutie qu'une story terminée) ; neutre (vert) si rien n'a encore démarré, pour ne
          // pas alarmer sur un plan qui n'a simplement pas commencé.
          const allDone = doneStoryCount === allStories.length
          const overallTone = allDone ? 'good' : inProgressStoryCount > 0 ? 'warning' : 'good'
          return (
            <div className="dashboard-bi-tile">
              <h4>{t(lang, 'dashboardBi.overallProgress')}</h4>
              <div className="dashboard-bi-progress-wrap">
                <CircularGauge
                  value={progressStoryEffort}
                  max={totalStoryEffort || 1}
                  tone={overallTone}
                  label={t(lang, 'dashboardBi.storiesCompleted')(doneStoryCount, inProgressStoryCount, allStories.length)}
                />
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
          <div className="dashboard-bi-tile dashboard-bi-tile-full">
            <h4>{t(lang, 'dashboardBi.workloadByRole')}</h4>
            <Donut
              segments={workloadSegments}
              centerValue={`${workloadSegments.reduce((s, seg) => s + seg.value, 0)}pts`}
              centerLabel={t(lang, 'dashboardBi.totalEffort')}
            />
          </div>
        )}

        {sprints.length > 0 && (
          <div className="dashboard-bi-tile dashboard-bi-tile-full">
            <h4>{t(lang, 'dashboardBi.velocityBySprint')}</h4>
            <div className="velocity-bars">
              {sprints.map(sp => {
                const total = sp.stories.reduce((s, x) => s + x.effort, 0)
                const done = sp.stories.filter(s => s.status === 'done').reduce((s, x) => s + x.effort, 0)
                return (
                  <div key={sp.sprintId} className="velocity-bar-col">
                    <div className="velocity-bar-track" style={{ height: '100%' }}>
                      <div className="velocity-bar-total" style={{ height: `${(total / maxSprintEffort) * 100}%` }}>
                        <div className="velocity-bar-done" style={{ height: total ? `${(done / total) * 100}%` : 0 }} />
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
