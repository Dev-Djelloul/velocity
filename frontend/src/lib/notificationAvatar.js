// Avatar en petit format pour le centre de notifications et le fil d'activité — aucune
// photo de profil n'est stockée sur ces notifications (le titre est un texte déjà composé
// côté serveur, ex: "Jeanne Dupont a modifié la roadmap"), donc pas de vraie image
// disponible sans changement de schéma côté backend. Repli pragmatique : initiales +
// couleur déterministe extraites du nom déjà présent dans le titre, comme les avatars par
// défaut de Slack/GitHub — pour une notification système (génération IA), l'avatar de Nova.
const ACTOR_PATTERNS = [
  / a modifié la roadmap$/,
  / edited the roadmap$/,
  / vous a mentionné·e$/,
  / mentioned you$/
]

export function extractActorName(title) {
  if (!title) return null
  for (const re of ACTOR_PATTERNS) {
    if (re.test(title)) {
      const stripped = title.replace(re, '').trim()
      // Plusieurs éditeurs listés "A, B, C…" (voir planCollabRoom.js) : un seul avatar
      // représente la notification, pas un par personne — on prend le premier nom.
      const first = stripped.split(',')[0].replace(/…$/, '').trim()
      return first || null
    }
  }
  return null
}

function hashString(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

const PALETTE = ['#9184d9', '#6366f1', '#06b6d4', '#4ade80', '#fb923c', '#f472b6', '#eab308', '#f87171']

export function avatarColorFor(name) {
  return PALETTE[hashString(name) % PALETTE.length]
}

export function initialsFor(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
