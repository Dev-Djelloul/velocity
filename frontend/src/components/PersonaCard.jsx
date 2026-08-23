import { t } from '../lib/i18n'
import { IconUser, IconAlertTriangle, IconTarget, IconCompass, IconSparkle } from './Icons'
import femaleAvatar1 from '../assets/persona-avatars/female-1.png'
import femaleAvatar2 from '../assets/persona-avatars/female-2.png'
import femaleAvatar3 from '../assets/persona-avatars/female-3.png'
import femaleAvatar4 from '../assets/persona-avatars/female-4.png'
import maleAvatar1 from '../assets/persona-avatars/male-1.png'
import maleAvatar2 from '../assets/persona-avatars/male-2.png'
import maleAvatar3 from '../assets/persona-avatars/male-3.png'
import '../styles/PersonaCard.css'

const AVATARS_BY_GENDER = {
  female: [femaleAvatar1, femaleAvatar2, femaleAvatar3, femaleAvatar4],
  male: [maleAvatar1, maleAvatar2, maleAvatar3]
}

// Choix déterministe (basé sur le prénom) parmi les photos disponibles pour ce genre,
// pour varier un peu d'un persona à l'autre sans dépendre d'un tirage aléatoire.
function avatarFor(gender, name) {
  const options = AVATARS_BY_GENDER[gender]
  if (!options?.length) return null
  const hash = (name || '').split('').reduce((h, ch) => h + ch.charCodeAt(0), 0)
  return options[hash % options.length]
}

export default function PersonaCard({ persona, lang }) {
  if (!persona) return null

  const { name, gender, title, ageRange, context, painPoints, goals, quote, preferredChannel, buyingTrigger } = persona
  const avatarSrc = avatarFor(gender, name)

  return (
    <div className="persona-card card">
      <div className="persona-card-header">
        <div className={`persona-avatar ${avatarSrc ? 'persona-avatar-photo' : ''}`}>
          {avatarSrc ? <img src={avatarSrc} alt="" className="persona-avatar-img" /> : <IconUser width={22} height={22} />}
        </div>
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
