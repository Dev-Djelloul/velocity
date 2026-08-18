import { useState, useMemo } from 'react'
import { t } from '../lib/i18n'
import { formatMoney } from '../lib/currency'
import { generateFinancials } from '../lib/extendedGenerator'
import { generateMarketingStrategy } from '../lib/planGenerator'
import { sprintCount } from '../lib/engine'
import { IconCompass } from './Icons'
import '../styles/WhatIfScenarios.css'

const BUDGET_STEPS = [
  { key: 'b2k', weeks: null, label: '2k€', value: 2000 },
  { key: 'b5k', weeks: null, label: '5k€', value: 5000 },
  { key: 'b10k', weeks: null, label: '10k€', value: 10000 },
  { key: 'b25k', weeks: null, label: '25k€', value: 25000 },
  { key: 'b50k', weeks: null, label: '50k€', value: 50000 }
]

const TIMELINE_STEPS = [
  { key: 'w4', weeks: 4, label: '4' },
  { key: 'w8', weeks: 8, label: '8' },
  { key: 'w12', weeks: 12, label: '12' },
  { key: 'w26', weeks: 26, label: '26' }
]

const CHANNEL_PALETTE = ['#9184d9', '#06b6d4', '#4ade80', '#fb923c', '#f472b6', '#eab308']

function closestIndex(steps, currentKey) {
  const idx = steps.findIndex(s => s.key === currentKey)
  return idx >= 0 ? idx : Math.floor(steps.length / 2)
}

export default function WhatIfScenarios({ plan, lang }) {
  const [budgetIdx, setBudgetIdx] = useState(() => closestIndex(BUDGET_STEPS, plan.resources?.budgetEur))
  const [timelineIdx, setTimelineIdx] = useState(() => closestIndex(TIMELINE_STEPS, plan.resources?.timelineWeeks))

  const budgetStep = BUDGET_STEPS[budgetIdx]
  const timelineStep = TIMELINE_STEPS[timelineIdx]

  const simulated = useMemo(() => {
    const resources = { ...plan.resources, budgetEur: budgetStep.key, timelineWeeks: timelineStep.key }
    const financials = generateFinancials(resources, plan.market, lang)
    const marketing = generateMarketingStrategy(plan.market, plan.priorities, budgetStep.key, lang, plan.product?.category)
    const sprints = sprintCount(timelineStep.weeks)
    return { financials, marketing, sprints }
  }, [budgetStep.key, timelineStep.key, timelineStep.weeks, plan.resources, plan.market, plan.priorities, lang])

  const baselineFinancials = plan.financials
  const baselineSprints = plan.roadmap?.sprints?.length || 0

  const delta = (sim, base) => {
    const diff = sim - base
    if (diff === 0) return null
    return { diff, positive: diff > 0 }
  }

  const statRow = (labelKey, simValue, baseValue, unit, formatFn) => {
    const d = delta(simValue, baseValue)
    const fmt = formatFn || ((v) => v.toLocaleString())
    return (
      <div className="sim-stat">
        <span className="sim-stat-label">{t(lang, labelKey)}</span>
        <span className="sim-stat-value">{fmt(simValue)}{unit}</span>
        {d && (
          <span className="sim-stat-delta">
            {d.positive ? '+' : ''}{fmt(d.diff)}{unit} {t(lang, 'whatif.vsCurrent')}
          </span>
        )}
      </div>
    )
  }

  const maxChannelBudget = Math.max(...simulated.marketing.channels.map(c => c.budget), 1)

  return (
    <div className="whatif-card card">
      <div className="whatif-header">
        <h3><IconCompass width={16} height={16} /> {t(lang, 'whatif.title')}</h3>
        <p className="whatif-subtitle">{t(lang, 'whatif.subtitle')}</p>
      </div>

      <div className="sim-sliders">
        <div className="sim-slider">
          <div className="sim-slider-head">
            <span>{t(lang, 'whatif.budgetLabel')}</span>
            <strong>{budgetStep.label}</strong>
          </div>
          <input
            type="range"
            min="0"
            max={BUDGET_STEPS.length - 1}
            step="1"
            value={budgetIdx}
            onChange={e => setBudgetIdx(Number(e.target.value))}
          />
          <div className="sim-slider-ticks">
            {BUDGET_STEPS.map(s => <span key={s.key}>{s.label}</span>)}
          </div>
        </div>

        <div className="sim-slider">
          <div className="sim-slider-head">
            <span>{t(lang, 'whatif.timelineLabel')}</span>
            <strong>{timelineStep.label} {t(lang, 'whatif.weeksUnit')}</strong>
          </div>
          <input
            type="range"
            min="0"
            max={TIMELINE_STEPS.length - 1}
            step="1"
            value={timelineIdx}
            onChange={e => setTimelineIdx(Number(e.target.value))}
          />
          <div className="sim-slider-ticks">
            {TIMELINE_STEPS.map(s => <span key={s.key}>{s.label}</span>)}
          </div>
        </div>
      </div>

      <div className="sim-results">
        <span className="sim-results-label">{t(lang, 'whatif.simulated')}</span>
        <div className="sim-stats-grid">
          {statRow('whatif.burnLabel', simulated.financials.monthlyBurn, baselineFinancials.monthlyBurn, ' €')}
          {statRow('whatif.runwayLabel', simulated.financials.runwayMonths, baselineFinancials.runwayMonths, ` ${t(lang, 'outputs.financials.months')}`)}
          {statRow('whatif.breakEvenLabel', simulated.financials.breakEvenUsers, baselineFinancials.breakEvenUsers, '')}
          {statRow('whatif.sprintsLabel', simulated.sprints, baselineSprints, '')}
        </div>
      </div>

      <div className="sim-channels">
        <h4>{t(lang, 'whatif.channelsTitle')}</h4>
        <div className="sim-channels-list">
          {simulated.marketing.channels.map((c, i) => (
            <div key={i} className="sim-channel-row">
              <span className="sim-channel-name">{c.name}</span>
              <div className="sim-channel-track">
                <div
                  className="sim-channel-fill"
                  style={{ width: `${(c.budget / maxChannelBudget) * 100}%`, background: CHANNEL_PALETTE[i % CHANNEL_PALETTE.length] }}
                />
              </div>
              <span className="sim-channel-value">{formatMoney(c.budget)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
