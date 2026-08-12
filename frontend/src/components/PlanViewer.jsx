import { useState, useRef } from 'react'
import PlanSidebar from './PlanSidebar'
import DashboardBI from './DashboardBI'
import PersonaCard from './PersonaCard'
import VeilleCard from './VeilleCard'
import BenchmarksCard from './BenchmarksCard'
import EditorialCalendarCard from './EditorialCalendarCard'
import AdvertisingCalendarCard from './AdvertisingCalendarCard'
import RgpdCard from './RgpdCard'
import RoadmapCard from './RoadmapCard'
import BacklogCard from './BacklogCard'
import MarketingCard from './MarketingCard'
import KPIDashboard from './KPIDashboard'
import FinancialsCard from './FinancialsCard'
import StrategyToolkitCard from './StrategyToolkitCard'
import GanttChart from './GanttChart'
import BurndownChart from './BurndownChart'
import CalendarView from './CalendarView'
import AskChart from './AskChart'
import GeneratedTable from './GeneratedTable'
import AgentActivity from './AgentActivity'
import PostLaunchTracking from './PostLaunchTracking'
import WhatIfScenarios from './WhatIfScenarios'
import ExportModal from './ExportModal'
import { generateMarketingStrategy } from '../lib/planGenerator'
import { savePlan } from '../lib/planStorage'
import { useAuth } from '../lib/auth'
import { t } from '../lib/i18n'
import { formatFullDateTime } from '../lib/dateFormat'
import { IconSparkle, IconCopy, IconCheckCircle, IconRocket, IconClock } from './Icons'
import '../styles/PlanViewer.css'
import '../styles/PlanSidebar.css'

export default function PlanViewer({ plan: initialPlan, justGenerated, onReset, lang }) {
  const { userId } = useAuth()
  const [plan, setPlan] = useState(initialPlan)
  const [showExport, setShowExport] = useState(false)
  const [budget, setBudget] = useState(plan.marketing.totalBudget)
  const [disabledChannels, setDisabledChannels] = useState([])
  const [summaryCopied, setSummaryCopied] = useState(false)
  const captureRef = useRef(null)

  const budgetKeyFor = (value) => {
    if (value <= 3500) return 'b2k'
    if (value <= 7500) return 'b5k'
    if (value <= 17500) return 'b10k'
    if (value <= 37500) return 'b25k'
    return 'b50k'
  }

  const liveMarketing = (() => {
    const base = generateMarketingStrategy(plan.market ?? { b2bVsB2c: 'b2b' }, plan.priorities, budgetKeyFor(budget), plan.language || lang)
    const filtered = base.channels.filter(c => !disabledChannels.includes(c.name))
    const totalPct = filtered.reduce((s, c) => s + c.pct, 0) || 1
    const redistributed = filtered.map(c => ({ ...c, budget: Math.round((c.pct / totalPct) * budget) }))
    return { ...base, channels: redistributed, totalBudget: budget }
  })()

  const toggleChannel = (name) => {
    setDisabledChannels(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  const updateRoadmap = (nextRoadmap) => {
    const nextPlan = { ...plan, roadmap: nextRoadmap }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const updateKpis = (nextKpis) => {
    const nextPlan = { ...plan, kpis: nextKpis }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const updateMetricsHistory = (nextHistory) => {
    const nextPlan = { ...plan, metricsHistory: nextHistory }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const updateScenarios = (nextScenarios) => {
    const nextPlan = { ...plan, scenarios: nextScenarios }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const updateVeille = (nextVeille) => {
    const nextPlan = { ...plan, veille: nextVeille }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const updateBenchmarks = (nextBenchmarks) => {
    const nextPlan = { ...plan, benchmarks: nextBenchmarks }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const updateEditorial = (nextEditorial) => {
    const nextPlan = { ...plan, editorial: nextEditorial }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const updateAdvertising = (nextAdvertising) => {
    const nextPlan = { ...plan, advertising: nextAdvertising }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const updateRgpd = (nextRgpd) => {
    const nextPlan = { ...plan, rgpd: nextRgpd }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(plan.executiveSummary)
      setSummaryCopied(true)
      setTimeout(() => setSummaryCopied(false), 2000)
    } catch { /* clipboard indisponible, on ignore silencieusement */ }
  }

  const generatedDateTime = formatFullDateTime(plan.generatedAt || plan.savedAt || plan.updatedAt, lang)

  return (
    <div className="plan-viewer-layout">
      <PlanSidebar lang={lang} onNewPlan={onReset} />
      <div className="plan-viewer plan-viewer-main" ref={captureRef}>
      {generatedDateTime && (
        <div className={`plan-confirmation ${justGenerated ? 'just-generated' : 'loaded'}`}>
          <span className="plan-confirmation-icon" aria-hidden="true">
            {justGenerated ? <IconRocket width={22} height={22} /> : <IconClock width={22} height={22} />}
          </span>
          <div className="plan-confirmation-text">
            <h3>{justGenerated ? t(lang, 'outputs.planReadyTitle') : t(lang, 'outputs.planLoadedTitle')}</h3>
            <p>{justGenerated ? t(lang, 'outputs.planReadySubtitle')(generatedDateTime) : t(lang, 'outputs.planLoadedSubtitle')(generatedDateTime)}</p>
          </div>
        </div>
      )}

      <div className="plan-header card">
        <div>
          <h2>{plan.product?.name} — {plan.classification}</h2>
        </div>
        <div className="plan-actions">
          <button className="btn-secondary" onClick={() => setShowExport(true)}>{t(lang, 'app.export')}</button>
          <button className="btn-primary" onClick={onReset}>{t(lang, 'app.newPlan')}</button>
        </div>
      </div>

      {plan.executiveSummary && (
        <div className="executive-summary card">
          <div className="executive-summary-icon"><IconSparkle width={18} height={18} /></div>
          <p>{plan.executiveSummary}</p>
          <button className="executive-summary-copy" onClick={copySummary} title={t(lang, 'outputs.copySummary')}>
            {summaryCopied ? <IconCheckCircle width={16} height={16} /> : <IconCopy width={16} height={16} />}
          </button>
        </div>
      )}

      <div className="budget-control card">
        <label>
          {t(lang, 'outputs.totalBudget')}: <strong>{budget.toLocaleString()} €</strong>
        </label>
        <input type="range" min="2000" max="50000" step="500" value={budget}
          onChange={e => setBudget(Number(e.target.value))} />
      </div>

      <div className="plan-grid">
        <div id="section-dashboard" className="plan-section-anchor"><DashboardBI plan={plan} lang={lang} /></div>
        <div id="section-persona" className="plan-section-anchor"><PersonaCard persona={plan.persona} lang={lang} /></div>
        <div id="section-veille" className="plan-section-anchor"><VeilleCard plan={plan} lang={lang} onVeilleChange={updateVeille} /></div>
        <div id="section-roadmap" className="plan-section-anchor"><RoadmapCard roadmap={plan.roadmap} lang={lang} generatedAt={plan.generatedAt} onRoadmapChange={updateRoadmap} /></div>
        <div id="section-backlog" className="plan-section-anchor"><BacklogCard roadmap={plan.roadmap} lang={lang} onRoadmapChange={updateRoadmap} /></div>
        <div id="section-gantt" className="plan-section-anchor"><GanttChart roadmap={plan.roadmap} lang={lang} generatedAt={plan.generatedAt} onRoadmapChange={updateRoadmap} /></div>
        <div id="section-burndown" className="plan-section-anchor"><BurndownChart roadmap={plan.roadmap} lang={lang} generatedAt={plan.generatedAt} /></div>
        <div id="section-calendar" className="plan-section-anchor"><CalendarView roadmap={plan.roadmap} lang={lang} generatedAt={plan.generatedAt} /></div>
        <div id="section-marketing" className="plan-section-anchor"><MarketingCard marketing={liveMarketing} lang={lang} disabledChannels={disabledChannels} onToggleChannel={toggleChannel} /></div>
        <div id="section-editorial" className="plan-section-anchor"><EditorialCalendarCard plan={plan} lang={lang} onEditorialChange={updateEditorial} /></div>
        <div id="section-advertising" className="plan-section-anchor"><AdvertisingCalendarCard plan={plan} lang={lang} onAdvertisingChange={updateAdvertising} /></div>
        <div id="section-kpis" className="plan-section-anchor"><KPIDashboard kpis={plan.kpis} lang={lang} onKpisChange={updateKpis} /></div>
        <div id="section-benchmarks" className="plan-section-anchor"><BenchmarksCard plan={plan} lang={lang} onBenchmarksChange={updateBenchmarks} /></div>
        <div id="section-financials" className="plan-section-anchor"><FinancialsCard financials={plan.financials} lang={lang} /></div>
        <div id="section-strategy" className="plan-section-anchor"><StrategyToolkitCard strategyToolkit={plan.strategyToolkit} lang={lang} /></div>
        <div id="section-rgpd" className="plan-section-anchor"><RgpdCard plan={plan} lang={lang} onRgpdChange={updateRgpd} /></div>
        <div id="section-askchart" className="plan-section-anchor"><AskChart plan={{ ...plan, marketing: liveMarketing }} lang={lang} /></div>
        <div id="section-table" className="plan-section-anchor"><GeneratedTable lang={lang} plan={plan} /></div>
        <div id="section-agents" className="plan-section-anchor"><AgentActivity plan={plan} userId={userId} lang={lang} /></div>
        <div id="section-tracking" className="plan-section-anchor"><PostLaunchTracking plan={plan} lang={lang} onMetricsChange={updateMetricsHistory} /></div>
        <div id="section-whatif" className="plan-section-anchor"><WhatIfScenarios plan={plan} lang={lang} onScenariosChange={updateScenarios} /></div>
      </div>

      {showExport && (
        <ExportModal plan={{ ...plan, marketing: liveMarketing }} lang={lang} userId={userId} onClose={() => setShowExport(false)} captureRef={captureRef} />
      )}
      </div>
    </div>
  )
}
