import { t } from '../lib/i18n'
import ABTestCalculator from './ABTestCalculator'

export default function MarketingCard({ marketing, lang, disabledChannels, onToggleChannel }) {
  return (
    <div className="card plan-card">
      <h3>{t(lang, 'outputs.marketing')}</h3>
      <p className="card-subtitle">{marketing.strategy} · {marketing.totalBudget.toLocaleString()} €</p>

      <div className="channel-list">
        {marketing.channels.map(ch => (
          <div key={ch.name} className={`channel ${disabledChannels?.includes(ch.name) ? 'disabled' : ''}`}>
            <div className="channel-header">
              <button className="channel-toggle" onClick={() => onToggleChannel(ch.name)}>
                {disabledChannels?.includes(ch.name) ? '☐' : '☑'} {ch.name}
              </button>
              <span>{ch.budget.toLocaleString()} € ({ch.pct}%)</span>
            </div>
            <div className="channel-details">
              <span>{t(lang, 'outputs.goal')}: {ch.goal}</span>
              <span>{t(lang, 'outputs.cadence')}: {ch.cadence}</span>
            </div>
            <div className="pillars">
              {ch.contentPillars.map(p => <span key={p} className="pillar-tag">{p}</span>)}
            </div>
          </div>
        ))}
      </div>

      <ABTestCalculator lang={lang} />
    </div>
  )
}
