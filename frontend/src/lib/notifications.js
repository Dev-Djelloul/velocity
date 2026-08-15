import { fetchNotifications } from './serverStorage'

// Repli local : agrège les commentaires des plans déjà mis en cache dans ce navigateur
// (espace personnel + équipes déjà visitées ici). Utilisé en attendant la première réponse
// du serveur, ou si celui-ci n'est pas configuré/joignable.
export function collectRecentComments(userId, lang) {
  if (!userId) return []
  const prefix = `plp_saved_plans_${userId}__`
  const items = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(prefix)) continue
    const spaceId = key.slice(prefix.length) === 'personal' ? null : key.slice(prefix.length)
    let plans
    try {
      plans = JSON.parse(localStorage.getItem(key) || '[]')
    } catch {
      continue
    }
    for (const plan of plans) {
      for (const comment of (plan.comments || [])) {
        items.push({
          ...comment,
          planId: plan.id,
          planName: plan.product?.name || (lang === 'fr' ? 'Plan sans titre' : 'Untitled plan'),
          spaceId,
          spaceName: spaceId ? (plan.createdSpaceId === spaceId ? plan.createdSpaceName : null) : null
        })
      }
    }
  }
  return items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
}

// Interroge le serveur (polling léger — voir AccountPage) pour retrouver aussi les
// commentaires postés depuis un autre appareil, sur des espaces jamais ouverts localement
// ici. `teamIds` = toutes les équipes dont l'utilisateur est membre (team.myTeams), pas
// seulement l'équipe active. Repli silencieux sur le cache local si le serveur ne répond
// pas (safeFetch renvoie []).
export async function fetchRecentComments(userId, teamIds, lang) {
  const remote = await fetchNotifications(userId, teamIds)
  if (remote?.length) {
    return remote.map(c => ({ ...c, planName: c.planName || (lang === 'fr' ? 'Plan sans titre' : 'Untitled plan') }))
  }
  return collectRecentComments(userId, lang)
}
