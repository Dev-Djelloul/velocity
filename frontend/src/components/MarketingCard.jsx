import { t } from '../lib/i18n'
import '../styles/MarketingCard.css'

export default function MarketingCard({ marketing, lang, disabledChannels = [], onToggleChannel }) {
  if (!marketing) return null

  const { strategy, channels, totalBudget } = marketing
  const activeChannels = channels.filter(c => !disabledChannels.includes(c.name))
  const totalAllocated = activeChannels.reduce((sum, c) => sum + c.budget, 0)

  return (
    <div className="marketing-card card">
      <div className="marketing-header">
        <h3>{t(lang, 'outputs.marketing')}</h3>
        <p className="marketing-subtitle">Stratégie: {strategy}</p>
      </div>

      <div className="marketing-budget">
        <div className="gauge">
          <div className="gauge-header">
            <span className="gauge-title">{t(lang, 'outputs.totalBudget')}</span>
            <span className="gauge-value">{totalAllocated.toLocaleString()} €</span>
          </div>
          <div className="gauge-bar">
            <div className="gauge-fill" style={{ width: `${(totalAllocated / totalBudget) * 100}%` }} />
          </div>
        </div>
        <p className="budget-note">Budget disponible: {totalBudget.toLocaleString()} €</p>
      </div>

      <div className="marketing-channels">
        <h4>Canaux de marketing</h4>
        <div className="channels-list">
          {channels.map((channel, idx) => (
            <div
              key={idx}
              className={`channel-card ${disabledChannels.includes(channel.name) ? 'disabled' : 'active'}`}
            >
              <div className="channel-header">
                <button
                  className="channel-toggle"
                  onClick={() => onToggleChannel(channel.name)}
                >
                  {disabledChannels.includes(channel.name) ? '○' : '●'}
                </button>
                <span className="channel-name">{channel.name}</span>
              </div>

              {!disabledChannels.includes(channel.name) && (
                <>
                  <div className="channel-budget">
                    <span className="budget-amount">{channel.budget.toLocaleString()} €</span>
                    <span className="budget-pct">{channel.pct}%</span>
                  </div>
                  <div className="channel-goal">
                    <span className="goal-label">{t(lang, 'outputs.goal')}:</span>
                    <span className="goal-value">{channel.goal}</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
