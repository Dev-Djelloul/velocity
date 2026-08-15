// Agrège les commentaires de tous les plans mis en cache localement pour cet utilisateur
// (espace personnel + chaque équipe déjà visitée dans ce navigateur) en une seule liste
// triée par date — sert de flux de notifications dans Mon compte. Ne couvre que les
// espaces déjà chargés localement (pas d'appel serveur dédié), ce qui reste suffisant
// puisque syncPlansFromServer alimente ce cache à chaque connexion/changement d'espace.
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
