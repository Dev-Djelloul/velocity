import { useState, useRef } from 'react'
import RoadmapCard from './RoadmapCard'
import MarketingCard from './MarketingCard'
import KPIDashboard from './KPIDashboard'
import FinancialsCard from './FinancialsCard'
import StrategyToolkitCard from './StrategyToolkitCard'
import GanttChart from './GanttChart'
import AskChart from './AskChart'
import GeneratedTable from './GeneratedTable'
import ExportModal from './ExportModal'
import { generateMarketingStrategy } from '../lib/planGenerator'
import { savePlan } from '../lib/planStorage'
import { t } from '../lib/i18n'
import { formatDateTime } from '../lib/dateFormat'
import { IconSparkle, IconCopy, IconCheckCircle } from './Icons'
import '../styles/PlanViewer.css'

export default function PlanViewer({ plan: initialPlan, justGenerated, onReset, lang }) {
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

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(plan.executiveSummary)
      setSummaryCopied(true)
      setTimeout(() => setSummaryCopied(false), 2000)
    } catch { /* clipboard indisponible, on ignore silencieusement */ }
  }

  const generatedDateTime = formatDateTime(plan.generatedAt || plan.savedAt || plan.updatedAt, lang)

  return (
    <div className="plan-viewer" ref={captureRef}>
      {generatedDateTime && (
        <div className={`plan-confirmation ${justGenerated ? 'just-generated' : 'loaded'}`}>
          <span className="plan-confirmation-icon" aria-hidden="true">{justGenerated ? '🎉' : '👋'}</span>
          <div className="plan-confirmation-text">
            <h3>{justGenerated ? t(lang, 'outputs.planReadyTitle') : t(lang, 'outputs.planLoadedTitle')}</h3>
            <p>{justGenerated ? t(lang, 'outputs.planReadySubtitle')(generatedDateTime) : t(lang, 'outputs.planLoadedSubtitle')(generatedDateTime)}</p>
          </div>
        </div>
      )}

      <div className="plan-header card">
        <div>
          <h2>{plan.product?.name} — {plan.classification}</h2>
          {plan.persona && (
            <p className="persona-line">
              {t(lang, 'outputs.persona')}: <strong>{plan.persona.name}</strong>, {plan.persona.title}
            </p>
          )}
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
        <RoadmapCard roadmap={plan.roadmap} lang={lang} generatedAt={plan.generatedAt} onRoadmapChange={updateRoadmap} />
        <GanttChart roadmap={plan.roadmap} lang={lang} generatedAt={plan.generatedAt} onRoadmapChange={updateRoadmap} />
        <MarketingCard marketing={liveMarketing} lang={lang} disabledChannels={disabledChannels} onToggleChannel={toggleChannel} />
        <KPIDashboard kpis={plan.kpis} lang={lang} onKpisChange={updateKpis} />
        <FinancialsCard financials={plan.financials} lang={lang} />
        <StrategyToolkitCard strategyToolkit={plan.strategyToolkit} lang={lang} />
        <AskChart plan={{ ...plan, marketing: liveMarketing }} lang={lang} />
        <GeneratedTable lang={lang} />
      </div>

      {showExport && (
        <ExportModal plan={{ ...plan, marketing: liveMarketing }} lang={lang} onClose={() => setShowExport(false)} captureRef={captureRef} />
      )}
    </div>
  )
}
