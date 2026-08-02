import { useState } from 'react'
import { t } from '../lib/i18n'
import { generateFinancials } from '../lib/extendedGenerator'
import { generateMarketingStrategy } from '../lib/planGenerator'
import { IconCompass, IconTrash, IconSparkle } from './Icons'
import '../styles/WhatIfScenarios.css'

const BUDGET_OPTIONS = [
  { key: 'b2k', label: '2 000 €' },
  { key: 'b5k', label: '5 000 €' },
  { key: 'b10k', label: '10 000 €' },
  { key: 'b25k', label: '25 000 €' },
  { key: 'b50k', label: '50 000 €' }
]

const TIMELINE_OPTIONS = [
  { key: 'w4', label: '4' },
  { key: 'w8', label: '8' },
  { key: 'w12', label: '12' },
  { key: 'w26', label: '26' }
]

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function WhatIfScenarios({ plan, lang, onScenariosChange }) {
  const [name, setName] = useState('')
  const [budgetKey, setBudgetKey] = useState(plan.resources?.budgetEur || 'b5k')
  const [timelineKey, setTimelineKey] = useState(plan.resources?.timelineWeeks || 'w8')

  const scenarios = plan.scenarios || []

  const runScenario = () => {
    const resources = { ...plan.resources, budgetEur: budgetKey, timelineWeeks: timelineKey }
    const financials = generateFinancials(resources, plan.market, lang)
    const marketing = generateMarketingStrategy(plan.market, plan.priorities, budgetKey, lang)

    const scenario = {
      id: genId(),
      name: name.trim() || `${BUDGET_OPTIONS.find(b => b.key === budgetKey)?.label} · ${TIMELINE_OPTIONS.find(w => w.key === timelineKey)?.label}${lang === 'en' ? 'w' : 'sem'}`,
      budgetKey,
      timelineKey,
      financials,
      totalBudget: marketing.totalBudget,
      createdAt: new Date().toISOString()
    }

    onScenariosChange([scenario, ...scenarios])
    setName('')
  }

  const removeScenario = (id) => {
    onScenariosChange(scenarios.filter(s => s.id !== id))
  }

  const baseline = plan.financials

  return (
    <div className="whatif-card card">
      <div className="whatif-header">
        <h3><IconCompass width={16} height={16} /> {t(lang, 'whatif.title')}</h3>
        <p className="whatif-subtitle">{t(lang, 'whatif.subtitle')}</p>
      </div>

      <div className="whatif-form">
        <input
          type="text"
          placeholder={t(lang, 'whatif.namePlaceholder')}
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <select value={budgetKey} onChange={e => setBudgetKey(e.target.value)}>
          {BUDGET_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
        <select value={timelineKey} onChange={e => setTimelineKey(e.target.value)}>
          {TIMELINE_OPTIONS.map(o => <option key={o.key} value={o.key}>{o.label} {lang === 'en' ? 'weeks' : 'semaines'}</option>)}
        </select>
        <button className="btn-primary" onClick={runScenario}>
          <IconSparkle width={14} height={14} /> {t(lang, 'whatif.compute')}
        </button>
      </div>

      <div className="whatif-baseline">
        <span className="whatif-baseline-label">{t(lang, 'whatif.baseline')}</span>
        <span>{t(lang, 'whatif.burnLabel')} <strong>{baseline.monthlyBurn.toLocaleString()} €</strong></span>
        <span>{t(lang, 'whatif.runwayLabel')} <strong>{baseline.runwayMonths} {t(lang, 'outputs.financials.months')}</strong></span>
        <span>{t(lang, 'whatif.breakEvenLabel')} <strong>{baseline.breakEvenUsers}</strong></span>
      </div>

      {scenarios.length > 0 && (
        <div className="whatif-scenarios">
          {scenarios.map(sc => {
            const burnDelta = sc.financials.monthlyBurn - baseline.monthlyBurn
            const runwayDelta = sc.financials.runwayMonths - baseline.runwayMonths
            return (
              <div key={sc.id} className="whatif-scenario">
                <div className="whatif-scenario-head">
                  <span className="whatif-scenario-name">{sc.name}</span>
                  <button className="whatif-scenario-remove" onClick={() => removeScenario(sc.id)}>
                    <IconTrash width={13} height={13} />
                  </button>
                </div>
                <div className="whatif-scenario-metrics">
                  <div>
                    <span className="whatif-metric-label">{t(lang, 'whatif.burnLabel')}</span>
                    <span className="whatif-metric-value">{sc.financials.monthlyBurn.toLocaleString()} €</span>
                    <span className={`whatif-delta ${burnDelta <= 0 ? 'positive' : 'negative'}`}>
                      {burnDelta > 0 ? '+' : ''}{burnDelta.toLocaleString()} €
                    </span>
                  </div>
                  <div>
                    <span className="whatif-metric-label">{t(lang, 'whatif.runwayLabel')}</span>
                    <span className="whatif-metric-value">{sc.financials.runwayMonths} {t(lang, 'outputs.financials.months')}</span>
                    <span className={`whatif-delta ${runwayDelta >= 0 ? 'positive' : 'negative'}`}>
                      {runwayDelta > 0 ? '+' : ''}{runwayDelta}
                    </span>
                  </div>
                  <div>
                    <span className="whatif-metric-label">{t(lang, 'whatif.breakEvenLabel')}</span>
                    <span className="whatif-metric-value">{sc.financials.breakEvenUsers}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
