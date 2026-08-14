import { useState, useRef } from 'react'
import PlanSidebar from './PlanSidebar'
import DashboardBI from './DashboardBI'
import PersonaCard from './PersonaCard'
import VeilleCard from './VeilleCard'
import BenchmarksCard from './BenchmarksCard'
import GtmCalendarCard from './GtmCalendarCard'
import RgpdCard from './RgpdCard'
import RoadmapCard from './RoadmapCard'
import BacklogCard from './BacklogCard'
import MarketingCard from './MarketingCard'
import KPIDashboard from './KPIDashboard'
import ABTestCalculatorCard from './ABTestCalculatorCard'
import FinancialsCard from './FinancialsCard'
import StrategyToolkitCard from './StrategyToolkitCard'
import GanttChart from './GanttChart'
import BurndownChart from './BurndownChart'
import CalendarView from './CalendarView'
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
import { IconSparkle, IconCopy, IconCheckCircle, IconRocket, IconClock, IconCoin, IconUser, IconCompass, IconPlus } from './Icons'
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
    const base = generateMarketingStrategy(plan.market ?? { b2bVsB2c: 'b2b' }, plan.priorities, budgetKeyFor(budget), plan.language || lang, plan.product?.category)
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

  const updatePlanStartDate = (dateStr) => {
    const nextPlan = { ...plan, planStartDate: dateStr + 'T00:00:00Z' }
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

  const updateLaunchDate = (dateStr) => {
    const nextPlan = { ...plan, launchDate: dateStr + 'T00:00:00Z' }
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

  const updateJira = (nextJira) => {
    const nextPlan = { ...plan, jira: nextJira }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const updateGithub = (nextGithub) => {
    const nextPlan = { ...plan, github: nextGithub }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const updateNotion = (nextNotion) => {
    const nextPlan = { ...plan, notion: nextNotion }
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
            {justGenerated ? <IconRocket width={22} height={22} /> : <img src="/assets/icons/icons8-clock.gif" width={22} height={22} alt="" />}
          </span>
          <div className="plan-confirmation-text">
            <h3>{justGenerated ? t(lang, 'outputs.planReadyTitle') : t(lang, 'outputs.planLoadedTitle')}</h3>
            <p>{justGenerated ? t(lang, 'outputs.planReadySubtitle')(generatedDateTime) : t(lang, 'outputs.planLoadedSubtitle')(generatedDateTime)}</p>
          </div>
        </div>
      )}

      <div className="plan-header card">
        <div className="plan-header-main">
          <div className="plan-header-top">
            <h2>{plan.product?.name}</h2>
            <div className="plan-badges">
              {plan.classification && <span className="plan-badge plan-badge-accent">{plan.classification}</span>}
              {plan.product?.stage && <span className="plan-badge plan-badge-stage">{t(lang, 'product.stageOptions')[plan.product.stage] || plan.product.stage}</span>}
              {plan.product?.category && <span className="plan-badge plan-badge-category">{t(lang, 'product.categoryOptions')[plan.product.category] || plan.product.category}</span>}
            </div>
          </div>

          <div className="plan-header-stats">
            {plan.market?.b2bVsB2c && (
              <span className="plan-stat">
                <IconCompass width={13} height={13} />
                {t(lang, 'market.b2bVsB2cOptions')[plan.market.b2bVsB2c] || plan.market.b2bVsB2c}
                {plan.market?.geography && ` · ${t(lang, 'market.geographyOptions')[plan.market.geography] || plan.market.geography}`}
              </span>
            )}
            {plan.resources?.budgetEur && (
              <span className="plan-stat">
                <IconCoin width={13} height={13} />
                {t(lang, 'resources.budgetOptions')[plan.resources.budgetEur] || plan.resources.budgetEur}
              </span>
            )}
            {plan.resources?.timelineWeeks && (
              <span className="plan-stat">
                <IconClock width={13} height={13} />
                {t(lang, 'resources.timelineOptions')[plan.resources.timelineWeeks] || plan.resources.timelineWeeks}
              </span>
            )}
            {plan.resources?.teamSize && (
              <span className="plan-stat">
                <IconUser width={13} height={13} />
                {t(lang, 'resources.teamSizeOptions')[plan.resources.teamSize] || plan.resources.teamSize}
              </span>
            )}
          </div>
        </div>
        <div className="plan-actions">
          <button className="btn-secondary" onClick={() => setShowExport(true)}>{t(lang, 'app.export')}</button>
          <button className="plan-new-btn" onClick={onReset}>
            <IconPlus width={14} height={14} className="plan-new-btn-icon" />
            <span className="plan-new-btn-label">{t(lang, 'app.newPlan')}</span>
          </button>
        </div>
      </div>

      {plan.executiveSummary && (
        <div className="executive-summary card">
          <div className="executive-summary-icon"><IconSparkle width={18} height={18} /></div>
          <div className="executive-summary-body">
            <h3 className="executive-summary-title">{t(lang, 'outputs.executiveSummaryTitle')}</h3>
            <p>{plan.executiveSummary}</p>
          </div>
          <button className="executive-summary-copy" onClick={copySummary} title={t(lang, 'outputs.copySummary')}>
            {summaryCopied ? <IconCheckCircle width={16} height={16} /> : <IconCopy width={16} height={16} />}
          </button>
        </div>
      )}

      <div className="plan-grid">
        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.synthese')}</h2>
        <div id="section-dashboard" className="plan-section-anchor"><DashboardBI plan={plan} lang={lang} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.market')}</h2>
        <div id="section-persona" className="plan-section-anchor"><PersonaCard persona={plan.persona} lang={lang} /></div>
        <div id="section-veille" className="plan-section-anchor"><VeilleCard plan={plan} lang={lang} onVeilleChange={updateVeille} /></div>
        <div id="section-strategy" className="plan-section-anchor"><StrategyToolkitCard strategyToolkit={plan.strategyToolkit} lang={lang} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.execution')}</h2>
        <div id="section-calendar" className="plan-section-anchor"><CalendarView plan={plan} roadmap={plan.roadmap} lang={lang} generatedAt={plan.planStartDate || plan.generatedAt} launchDate={plan.launchDate} marketing={plan.marketing} /></div>
        <div id="section-roadmap" className="plan-section-anchor"><RoadmapCard roadmap={plan.roadmap} lang={lang} planStartDate={plan.planStartDate || plan.generatedAt} onPlanStartDateChange={updatePlanStartDate} onRoadmapChange={updateRoadmap} /></div>
        <div id="section-backlog" className="plan-section-anchor"><BacklogCard roadmap={plan.roadmap} lang={lang} onRoadmapChange={updateRoadmap} jira={plan.jira} plan={plan} userId={userId} onNotionStoriesSynced={updateNotion} /></div>
        <div id="section-gantt" className="plan-section-anchor"><GanttChart roadmap={plan.roadmap} lang={lang} generatedAt={plan.planStartDate || plan.generatedAt} onRoadmapChange={updateRoadmap} /></div>
        <div id="section-burndown" className="plan-section-anchor"><BurndownChart roadmap={plan.roadmap} lang={lang} generatedAt={plan.planStartDate || plan.generatedAt} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.gtm')}</h2>
        <div id="section-marketing" className="plan-section-anchor"><MarketingCard marketing={liveMarketing} lang={lang} disabledChannels={disabledChannels} onToggleChannel={toggleChannel} budget={budget} onBudgetChange={setBudget} /></div>
        <div id="section-gtm-calendar" className="plan-section-anchor"><GtmCalendarCard plan={plan} lang={lang} onEditorialChange={updateEditorial} onAdvertisingChange={updateAdvertising} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.performance')}</h2>
        <div id="section-kpis" className="plan-section-anchor"><KPIDashboard kpis={plan.kpis} lang={lang} onKpisChange={updateKpis} /></div>
        <div id="section-abtest" className="plan-section-anchor"><ABTestCalculatorCard lang={lang} /></div>
        <div id="section-benchmarks" className="plan-section-anchor"><BenchmarksCard plan={plan} lang={lang} onBenchmarksChange={updateBenchmarks} /></div>
        <div id="section-financials" className="plan-section-anchor"><FinancialsCard financials={plan.financials} lang={lang} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.compliance')}</h2>
        <div id="section-rgpd" className="plan-section-anchor"><RgpdCard plan={plan} lang={lang} onRgpdChange={updateRgpd} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.aitools')}</h2>
        <div id="section-table" className="plan-section-anchor"><GeneratedTable lang={lang} plan={{ ...plan, marketing: liveMarketing }} /></div>
        <div id="section-agents" className="plan-section-anchor"><AgentActivity plan={plan} userId={userId} lang={lang} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.postlaunch')}</h2>
        <div id="section-tracking" className="plan-section-anchor"><PostLaunchTracking plan={plan} lang={lang} onMetricsChange={updateMetricsHistory} onLaunchDateChange={updateLaunchDate} /></div>
        <div id="section-whatif" className="plan-section-anchor"><WhatIfScenarios plan={plan} lang={lang} /></div>
      </div>

      {showExport && (
        <ExportModal plan={{ ...plan, marketing: liveMarketing }} lang={lang} userId={userId} onClose={() => setShowExport(false)} captureRef={captureRef} onJiraExported={updateJira} onGithubExported={updateGithub} />
      )}
      </div>
    </div>
  )
}
