import { useState } from 'react'
import RoadmapCard from './RoadmapCard'
import MarketingCard from './MarketingCard'
import KPIDashboard from './KPIDashboard'
import ExportModal from './ExportModal'
import { generateMarketingStrategy } from '../lib/planGenerator'
import { t } from '../lib/i18n'
import '../styles/PlanViewer.css'

export default function PlanViewer({ plan, onReset, lang }) {
  const [showExport, setShowExport] = useState(false)
  const [budget, setBudget] = useState(plan.marketing.totalBudget)
  const [disabledChannels, setDisabledChannels] = useState([])

  const budgetKeyFor = (value) => {
    if (value <= 3500) return 'b2k'
    if (value <= 7500) return 'b5k'
    if (value <= 17500) return 'b10k'
    if (value <= 37500) return 'b25k'
    return 'b50k'
  }

  const liveMarketing = (() => {
    const base = generateMarketingStrategy(plan.market ?? { b2bVsB2c: 'b2b' }, plan.priorities, budgetKeyFor(budget))
    const filtered = base.channels.filter(c => !disabledChannels.includes(c.name))
    const totalPct = filtered.reduce((s, c) => s + c.pct, 0) || 1
    const redistributed = filtered.map(c => ({ ...c, budget: Math.round((c.pct / totalPct) * budget) }))
    return { ...base, channels: redistributed, totalBudget: budget }
  })()

  const toggleChannel = (name) => {
    setDisabledChannels(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  return (
    <div className="plan-viewer">
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

      <div className="budget-control card">
        <label>
          {t(lang, 'outputs.totalBudget')}: <strong>{budget.toLocaleString()} €</strong>
        </label>
        <input type="range" min="2000" max="50000" step="500" value={budget}
          onChange={e => setBudget(Number(e.target.value))} />
      </div>

      <div className="plan-grid">
        <RoadmapCard roadmap={plan.roadmap} lang={lang} />
        <MarketingCard marketing={liveMarketing} lang={lang} disabledChannels={disabledChannels} onToggleChannel={toggleChannel} />
        <KPIDashboard kpis={plan.kpis} lang={lang} />
      </div>

      {showExport && (
        <ExportModal plan={{ ...plan, marketing: liveMarketing }} lang={lang} onClose={() => setShowExport(false)} />
      )}
    </div>
  )
}
