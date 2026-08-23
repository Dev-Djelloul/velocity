import { t } from '../lib/i18n'
import { formatMoney } from '../lib/currency'
import { IconCoin, IconTrendingUp, IconTarget } from './Icons'
import '../styles/FinancialsCard.css'

const COST_PALETTE = ['#9184d9', '#06b6d4', '#4ade80', '#fb923c', '#f472b6', '#facc15', '#60a5fa']

export default function FinancialsCard({ financials, lang }) {
  if (!financials) return null

  const { monthlyBurn, runwayMonths, assumedArpu, arpuRationale, breakEvenUsers, breakEvenMonthlyRevenue, costBreakdown } = financials
  const budget = Math.round(monthlyBurn * runwayMonths)
  const monthCount = Math.max(1, Math.ceil(runwayMonths))
  const months = Array.from({ length: monthCount + 1 }, (_, i) => Math.max(0, budget - monthlyBurn * i))
  const bridgeMax = Math.max(monthlyBurn, breakEvenMonthlyRevenue) || 1

  return (
    <div className="financials-card card">
      <div className="financials-header">
        <h3>{t(lang, 'outputs.financials.title')}</h3>
        <p className="financials-subtitle">{t(lang, 'outputs.financials.subtitle')}</p>
      </div>

      <div className="financials-metrics">
        <div className="fin-tile" style={{ '--fin-color': '#9184d9' }}>
          <div className="fin-icon"><IconCoin width={16} height={16} /></div>
          <div className="fin-label">{t(lang, 'outputs.financials.monthlyBurn')}</div>
          <div className="fin-value">{formatMoney(monthlyBurn)}</div>
        </div>
        <div className="fin-tile" style={{ '--fin-color': '#06b6d4' }}>
          <div className="fin-icon"><IconTrendingUp width={16} height={16} /></div>
          <div className="fin-label">{t(lang, 'outputs.financials.runway')}</div>
          <div className="fin-value">{runwayMonths} {t(lang, 'outputs.financials.months')}</div>
        </div>
        <div className="fin-tile" style={{ '--fin-color': '#4ade80' }}>
          <div className="fin-icon"><IconTarget width={16} height={16} /></div>
          <div className="fin-label">{t(lang, 'outputs.financials.breakEven')}</div>
          <div className="fin-value">{breakEvenUsers} <span className="fin-value-unit">{t(lang, 'outputs.financials.clients')}</span></div>
          <div className="fin-sub">{t(lang, 'outputs.financials.breakEvenNote')(breakEvenUsers, breakEvenMonthlyRevenue, assumedArpu)}</div>
        </div>
      </div>

      <div className="financials-runway">
        <h4>{t(lang, 'outputs.financials.runwayChartTitle')}</h4>
        <p className="financials-runway-subtitle">{t(lang, 'outputs.financials.runwayChartSubtitle')}</p>
        <div className="runway-chart">
          {months.map((remaining, i) => {
            const pct = Math.round((remaining / budget) * 100)
            const isDepleted = remaining === 0
            return (
              <div key={i} className="runway-bar-col" title={`M${i} — ${formatMoney(remaining)}`}>
                <div className="runway-bar-track">
                  <div className={`runway-bar-fill ${isDepleted ? 'depleted' : ''}`} style={{ height: `${pct}%` }} />
                </div>
                <span className="runway-bar-label">M{i}</span>
              </div>
            )
          })}
        </div>
        <div className="runway-legend">
          <span className="runway-legend-dot" /> {t(lang, 'outputs.financials.runway')}
          <span className="runway-legend-dot depleted" /> {t(lang, 'outputs.financials.runwayDepleted')}
        </div>
      </div>

      <div className="financials-bridge">
        <h4>{t(lang, 'outputs.financials.bridgeTitle')}</h4>
        <p className="financials-runway-subtitle">{t(lang, 'outputs.financials.bridgeSubtitle')}</p>
        <div className="bridge-rows">
          <div className="bridge-row">
            <span className="bridge-row-label">{t(lang, 'outputs.financials.bridgeCost')}</span>
            <div className="bridge-bar-track">
              <div className="bridge-bar-fill bridge-cost" style={{ width: `${(monthlyBurn / bridgeMax) * 100}%` }} />
            </div>
            <span className="bridge-row-value">{formatMoney(monthlyBurn)}</span>
          </div>
          <div className="bridge-row">
            <span className="bridge-row-label">{t(lang, 'outputs.financials.bridgeRevenue')}</span>
            <div className="bridge-bar-track">
              <div className="bridge-bar-fill bridge-revenue" style={{ width: `${(breakEvenMonthlyRevenue / bridgeMax) * 100}%` }} />
            </div>
            <span className="bridge-row-value">{formatMoney(breakEvenMonthlyRevenue)}</span>
          </div>
        </div>
      </div>

      {arpuRationale && (
        <p className="financials-arpu-rationale">
          <strong>{t(lang, 'outputs.financials.arpuLabel')}</strong> {arpuRationale}
        </p>
      )}

      <div className="financials-breakdown">
        <h4>{t(lang, 'outputs.financials.breakdown')}</h4>
        {costBreakdown.map((line, i) => {
          const color = COST_PALETTE[i % COST_PALETTE.length]
          return (
            <div key={i} className="cost-line" style={{ '--cost-color': color }}>
              <div className="cost-line-header">
                <span>{line.category}</span>
                <span>{formatMoney(line.amount)} · {line.pct}%</span>
              </div>
              <div className="cost-bar"><div className="cost-bar-fill" style={{ width: `${line.pct}%` }} /></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
