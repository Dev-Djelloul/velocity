import { t } from '../lib/i18n'
import CircularGauge from './CircularGauge'
import GaugeProgress from './GaugeProgress'
import { IconBarChart } from './Icons'
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

export default function DashboardBI({ plan, lang }) {
  if (!plan) return null

  const { roadmap, marketing, kpis, financials, metricsHistory } = plan

  const budgetSegments = (marketing?.channels || []).map(ch => ({
    name: ch.name,
    value: ch.budget,
    display: `${ch.budget.toLocaleString()} €`
  }))

  const workloadMap = {}
  ;(roadmap?.sprints || []).forEach(sp => sp.stories.forEach(s => {
    workloadMap[s.assignee] = (workloadMap[s.assignee] || 0) + s.effort
  }))
  const workloadSegments = Object.entries(workloadMap).map(([name, value]) => ({
    name, value, display: `${value}pts`
  }))

  const sprints = roadmap?.sprints || []
  const maxSprintEffort = Math.max(1, ...sprints.map(sp => sp.stories.reduce((s, x) => s + x.effort, 0)))

  const primaryKpi = kpis?.[0]

  return (
    <div className="dashboard-bi card">
      <div className="dashboard-bi-header">
        <h3><IconBarChart width={16} height={16} /> {t(lang, 'dashboardBi.title')}</h3>
        <p className="dashboard-bi-subtitle">{t(lang, 'dashboardBi.subtitle')}</p>
      </div>

      <div className="dashboard-bi-grid">
        {budgetSegments.length > 0 && (
          <div className="dashboard-bi-tile">
            <h4>{t(lang, 'dashboardBi.budgetByChannel')}</h4>
            <Donut
              segments={budgetSegments}
              centerValue={`${marketing.totalBudget.toLocaleString()} €`}
              centerLabel={t(lang, 'dashboardBi.total')}
            />
          </div>
        )}

        {workloadSegments.length > 0 && (
          <div className="dashboard-bi-tile">
            <h4>{t(lang, 'dashboardBi.workloadByRole')}</h4>
            <Donut
              segments={workloadSegments}
              centerValue={`${Object.values(workloadMap).reduce((a, b) => a + b, 0)}pts`}
              centerLabel={t(lang, 'dashboardBi.totalEffort')}
            />
          </div>
        )}

        {financials && (
          <div className="dashboard-bi-tile">
            <h4>{t(lang, 'dashboardBi.costSplit')}</h4>
            <Donut
              segments={financials.costBreakdown.map(c => ({ name: c.category, value: c.amount, display: `${c.pct}%` }))}
              centerValue={`${(financials.monthlyBurn).toLocaleString()} €`}
              centerLabel={t(lang, 'dashboardBi.monthlyBurn')}
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
