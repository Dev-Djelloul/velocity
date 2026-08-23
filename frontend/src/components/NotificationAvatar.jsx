import { extractActorName, avatarColorFor, initialsFor } from '../lib/notificationAvatar'
import '../styles/NotificationAvatar.css'

const NOVA_AVATAR = '/assets/icons/icons8-woman-32.png'

// Petit avatar à gauche d'une notification/ligne d'activité — initiales colorées quand un
// nom de personne est repérable dans le titre, avatar de Nova sinon (génération IA,
// notification système sans acteur humain). Voir notificationAvatar.js pour le pourquoi
// (pas de vraie photo de profil stockée sur ces notifications).
export default function NotificationAvatar({ title }) {
  const name = extractActorName(title)
  if (!name) {
    return (
      <span className="notification-avatar notification-avatar-system">
        <img src={NOVA_AVATAR} alt="" />
      </span>
    )
  }
  return (
    <span className="notification-avatar" style={{ background: avatarColorFor(name) }}>
      {initialsFor(name)}
    </span>
  )
}
