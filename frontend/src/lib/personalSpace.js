// Nom et avatar de l'espace personnel — contrairement à une équipe (nom/logo gérés par
// Clerk Organization), l'espace personnel n'a pas d'identité propre côté Clerk : on la
// stocke nous-mêmes, par utilisateur, pour la rendre personnalisable indépendamment de la
// photo de profil du compte (Clerk) que l'utilisateur peut déjà changer par ailleurs.
function key(userId) {
  return `plp_personal_space_${userId}`
}

export function defaultPersonalSpaceName(lang) {
  return lang === 'fr' ? 'Mon Espace Velocity' : 'My Velocity Space'
}

export function getPersonalSpace(userId, lang) {
  if (!userId) return { name: defaultPersonalSpaceName(lang), avatar: null }
  try {
    const raw = localStorage.getItem(key(userId))
    if (raw) {
      const parsed = JSON.parse(raw)
      return { name: parsed.name || defaultPersonalSpaceName(lang), avatar: parsed.avatar || null }
    }
  } catch { /* clé corrompue, on retombe sur le défaut */ }
  return { name: defaultPersonalSpaceName(lang), avatar: null }
}

export function savePersonalSpace(userId, { name, avatar }) {
  if (!userId) return
  localStorage.setItem(key(userId), JSON.stringify({ name, avatar }))
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
