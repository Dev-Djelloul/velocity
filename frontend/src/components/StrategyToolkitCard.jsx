import { t } from '../lib/i18n'
import { IconShield, IconAlertTriangle, IconTarget, IconCompass } from './Icons'
import '../styles/StrategyToolkitCard.css'

const QUADRANTS = [
  { key: 'strengths', Icon: IconShield, tone: 'positive' },
  { key: 'weaknesses', Icon: IconAlertTriangle, tone: 'negative' },
  { key: 'opportunities', Icon: IconTarget, tone: 'positive' },
  { key: 'threats', Icon: IconAlertTriangle, tone: 'negative' }
]

export default function StrategyToolkitCard({ strategyToolkit, lang }) {
  if (!strategyToolkit) return null

  const { swot, competitivePositioning } = strategyToolkit

  return (
    <div className="strategy-card card">
      <div className="strategy-header">
        <h3>{t(lang, 'outputs.strategy.title')}</h3>
        <p className="strategy-subtitle">{t(lang, 'outputs.strategy.subtitle')}</p>
      </div>

      <div className="swot-grid">
        {QUADRANTS.map(({ key, Icon, tone }) => (
          <div key={key} className={`swot-quadrant swot-${tone}`}>
            <div className="swot-quadrant-title">
              <Icon width={15} height={15} /> {t(lang, `outputs.strategy.${key}`)}
            </div>
            <ul>
              {(swot[key] || []).map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <div className="positioning">
        <div className="positioning-title">
          <IconCompass width={15} height={15} /> {t(lang, 'outputs.strategy.positioning')}
        </div>
        <p>{competitivePositioning}</p>
      </div>
    </div>
  )
}
