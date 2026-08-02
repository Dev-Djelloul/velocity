import { t } from '../lib/i18n'
import { IconUser, IconAlertTriangle, IconTarget, IconCompass, IconSparkle } from './Icons'
import '../styles/PersonaCard.css'

export default function PersonaCard({ persona, lang }) {
  if (!persona) return null

  const { name, title, ageRange, context, painPoints, goals, quote, preferredChannel, buyingTrigger } = persona

  return (
    <div className="persona-card card">
      <div className="persona-card-header">
        <div className="persona-avatar"><IconUser width={22} height={22} /></div>
        <div>
          <h3>{name}{ageRange ? `, ${ageRange}` : ''}</h3>
          <p className="persona-title">{title}</p>
        </div>
      </div>

      {context && <p className="persona-context">{context}</p>}

      {quote && (
        <blockquote className="persona-quote">
          <IconSparkle width={13} height={13} /> « {quote} »
        </blockquote>
      )}

      <div className="persona-grid">
        {painPoints?.length > 0 && (
          <div className="persona-block persona-block-negative">
            <div className="persona-block-title">
              <IconAlertTriangle width={14} height={14} /> {t(lang, 'outputs.persona.painPoints')}
            </div>
            <ul>{painPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
        )}
        {goals?.length > 0 && (
          <div className="persona-block persona-block-positive">
            <div className="persona-block-title">
              <IconTarget width={14} height={14} /> {t(lang, 'outputs.persona.goals')}
            </div>
            <ul>{goals.map((g, i) => <li key={i}>{g}</li>)}</ul>
          </div>
        )}
      </div>

      {(preferredChannel || buyingTrigger) && (
        <div className="persona-meta">
          {preferredChannel && (
            <div className="persona-meta-item">
              <IconCompass width={13} height={13} />
              <span><strong>{t(lang, 'outputs.persona.channel')}:</strong> {preferredChannel}</span>
            </div>
          )}
          {buyingTrigger && (
            <div className="persona-meta-item">
              <IconSparkle width={13} height={13} />
              <span><strong>{t(lang, 'outputs.persona.trigger')}:</strong> {buyingTrigger}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
