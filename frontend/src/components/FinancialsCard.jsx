import { t } from '../lib/i18n'
import { IconCoin, IconTrendingUp, IconTarget } from './Icons'
import '../styles/FinancialsCard.css'

export default function FinancialsCard({ financials, lang }) {
  if (!financials) return null

  const { monthlyBurn, runwayMonths, assumedArpu, breakEvenUsers, breakEvenMonthlyRevenue, costBreakdown } = financials

  return (
    <div className="financials-card card">
      <div className="financials-header">
        <h3>{t(lang, 'outputs.financials.title')}</h3>
        <p className="financials-subtitle">{t(lang, 'outputs.financials.subtitle')}</p>
      </div>

      <div className="financials-metrics">
        <div className="fin-tile">
          <div className="fin-icon"><IconCoin width={16} height={16} /></div>
          <div className="fin-label">{t(lang, 'outputs.financials.monthlyBurn')}</div>
          <div className="fin-value">{monthlyBurn.toLocaleString()} €</div>
        </div>
        <div className="fin-tile">
          <div className="fin-icon"><IconTrendingUp width={16} height={16} /></div>
          <div className="fin-label">{t(lang, 'outputs.financials.runway')}</div>
          <div className="fin-value">{runwayMonths} {t(lang, 'outputs.financials.months')}</div>
        </div>
        <div className="fin-tile">
          <div className="fin-icon"><IconTarget width={16} height={16} /></div>
          <div className="fin-label">{t(lang, 'outputs.financials.breakEven')}</div>
          <div className="fin-value">{breakEvenUsers} <span className="fin-value-unit">{t(lang, 'outputs.financials.clients')}</span></div>
          <div className="fin-sub">{t(lang, 'outputs.financials.breakEvenNote')(breakEvenUsers, breakEvenMonthlyRevenue, assumedArpu)}</div>
        </div>
      </div>

      <div className="financials-breakdown">
        <h4>{t(lang, 'outputs.financials.breakdown')}</h4>
        {costBreakdown.map((line, i) => (
          <div key={i} className="cost-line">
            <div className="cost-line-header">
              <span>{line.category}</span>
              <span>{line.amount.toLocaleString()} € · {line.pct}%</span>
            </div>
            <div className="cost-bar"><div className="cost-bar-fill" style={{ width: `${line.pct}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}
