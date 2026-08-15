// Couleur stable par équipe (même id -> même couleur à chaque rendu), pour distinguer
// visuellement plusieurs organisations quand aucun logo n'a été uploadé.
const TEAM_COLORS = ['#9184d9', '#6366f1', '#06b6d4', '#f59e0b', '#22c55e', '#ec4899', '#ef4444', '#14b8a6']

export function teamColor(id) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return TEAM_COLORS[hash % TEAM_COLORS.length]
}

// Logo réel de l'équipe si l'admin en a uploadé un (Clerk → Organisation → Mettre à jour
// le profil), sinon la pastille colorée par initiale utilisée jusqu'ici.
export default function TeamAvatar({ id, name, imageUrl, className = '' }) {
  if (imageUrl) {
    return <img className={`header-space-avatar ${className}`} src={imageUrl} alt="" />
  }
  return (
    <span className={`header-space-avatar ${className}`} style={{ background: teamColor(id) }}>
      {(name || '?').trim().charAt(0).toUpperCase()}
    </span>
  )
}
