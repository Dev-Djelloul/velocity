import { useState } from 'react'
import { t } from '../lib/i18n'
import { formatMoney } from '../lib/currency'
import { IconChevronDown } from './Icons'
import '../styles/MarketingCard.css'

const CHANNEL_PALETTE = ['#9184d9', '#06b6d4', '#f59e0b', '#22c55e', '#ec4899', '#6366f1', '#eab308', '#f97316']

export default function MarketingCard({ marketing, lang, disabledChannels = [], onToggleChannel, budget, onBudgetChange, maxBudget }) {
  const [expanded, setExpanded] = useState({})
  if (!marketing) return null

  const { strategy, channels, totalBudget } = marketing
  const activeChannels = channels.filter(c => !disabledChannels.includes(c.name))
  const totalAllocated = activeChannels.reduce((sum, c) => sum + c.budget, 0)
  const remaining = totalBudget - totalAllocated

  const toggleExpanded = (name) => setExpanded(prev => ({ ...prev, [name]: !prev[name] }))

  return (
    <div className="marketing-card card">
      <div className="marketing-header">
        <h3>{t(lang, 'outputs.marketing')}</h3>
        <p className="marketing-subtitle">{t(lang, 'outputs.strategyLabel')}: {strategy}</p>
      </div>

      {onBudgetChange && (
        <div className="marketing-budget-control">
          <label>
            {t(lang, 'outputs.marketingBudgetLabel')}: <strong>{formatMoney(budget)}</strong>
          </label>
          {/* Plafonné au budget total du lancement (le marketing n'en est qu'une part, voir
              carte Prévisionnel financier) plutôt qu'à un maximum fixe de 50 000€. */}
          <input type="range" min="2000" max={Math.max(2000, maxBudget || 50000)} step="500" value={budget}
            onChange={e => onBudgetChange(Number(e.target.value))} />
          {maxBudget != null && (
            <p className="marketing-budget-cap-hint">{t(lang, 'outputs.marketingBudgetCapHint')(formatMoney(maxBudget))}</p>
          )}
        </div>
      )}

      <div className="marketing-budget">
        <div className="budget-allocation-bar" role="img" aria-label={t(lang, 'outputs.allocatedLabel')}>
          {activeChannels.map((channel, idx) => (
            <div
              key={channel.name}
              className="budget-allocation-segment"
              style={{ width: `${(channel.budget / totalBudget) * 100}%`, background: CHANNEL_PALETTE[idx % CHANNEL_PALETTE.length] }}
              title={`${channel.name} — ${formatMoney(channel.budget)} (${channel.pct}%)`}
            />
          ))}
          {remaining > 0 && (
            <div className="budget-allocation-segment budget-allocation-remaining" style={{ width: `${(remaining / totalBudget) * 100}%` }} />
          )}
        </div>
        <div className="budget-summary-row">
          <span className="budget-summary-allocated">{t(lang, 'outputs.allocatedLabel')} : <strong>{formatMoney(totalAllocated)}</strong></span>
          <span className="budget-summary-total">{t(lang, 'outputs.budgetAvailable')(formatMoney(totalBudget))}</span>
        </div>
      </div>

      <div className="marketing-channels">
        <h4>{t(lang, 'outputs.marketingChannelsTitle')}</h4>
        <div className="channels-list">
          {channels.map((channel, idx) => {
            const isDisabled = disabledChannels.includes(channel.name)
            const isExpanded = !!expanded[channel.name]
            const color = CHANNEL_PALETTE[idx % CHANNEL_PALETTE.length]
            const hasAssets = channel.assets && (channel.assets.postBrief || channel.assets.emailSubject || channel.assets.landingTagline)
            return (
              <div
                key={idx}
                className={`channel-card ${isDisabled ? 'disabled' : 'active'}`}
                style={!isDisabled ? { '--channel-color': color } : undefined}
              >
                <div className="channel-row-main">
                  <button
                    className="channel-toggle"
                    style={!isDisabled ? { color } : undefined}
                    onClick={() => onToggleChannel(channel.name)}
                    title={isDisabled ? t(lang, 'outputs.enableChannel') : t(lang, 'outputs.disableChannel')}
                  >
                    {isDisabled ? '○' : '●'}
                  </button>
                  <div className="channel-identity">
                    <span className="channel-name">{channel.name}</span>
                    {!isDisabled && <span className="channel-goal-inline">{channel.goal}</span>}
                  </div>
                  {!isDisabled && (
                    <div className="channel-amount-block">
                      <span className="budget-amount">{formatMoney(channel.budget)}</span>
                      <span className="budget-pct" style={{ color, background: `${color}26` }}>{channel.pct}%</span>
                    </div>
                  )}
                </div>

                {!isDisabled && (
                  <>
                    <div className="channel-share-bar">
                      <div className="channel-share-fill" style={{ width: `${channel.pct}%`, background: color }} />
                    </div>

                    {hasAssets && (
                      <button className={`channel-assets-toggle ${isExpanded ? 'open' : ''}`} onClick={() => toggleExpanded(channel.name)}>
                        {t(lang, 'outputs.viewAssets')}
                        <IconChevronDown width={12} height={12} />
                      </button>
                    )}

                    {hasAssets && isExpanded && (
                      <div className="channel-assets">
                        {channel.assets.postBrief && (
                          <p><strong>{t(lang, 'outputs.assets.post')}:</strong> {channel.assets.postBrief}</p>
                        )}
                        {channel.assets.emailSubject && (
                          <p><strong>{t(lang, 'outputs.assets.email')}:</strong> {channel.assets.emailSubject}</p>
                        )}
                        {channel.assets.landingTagline && (
                          <p><strong>{t(lang, 'outputs.assets.landing')}:</strong> {channel.assets.landingTagline}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
