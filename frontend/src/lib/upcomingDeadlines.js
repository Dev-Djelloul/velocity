// Carte "Prochaines échéances" du dashboard : extrait la date de lancement de chaque plan
// (plan.launchDate, seule date de premier ordre fiable — voir planGenerator.js) et ne garde
// que celles dans le futur, triées par proximité. Pas de synchronisation calendrier externe
// (Google/Apple) pour l'instant — décision prise en conversation : trop lourd (OAuth,
// identifiants côté Worker) pour la valeur apportée dans un premier temps.
export function getUpcomingDeadlines(plans, limit = 5) {
  const now = Date.now()
  return (plans || [])
    .filter(p => p.launchDate)
    .map(p => ({ id: p.id, name: p.product?.name || null, launchDate: p.launchDate, time: new Date(p.launchDate).getTime() }))
    .filter(p => Number.isFinite(p.time) && p.time >= now)
    .sort((a, b) => a.time - b.time)
    .slice(0, limit)
}

export function daysUntil(isoDate) {
  const diff = new Date(isoDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.round(diff / 86400000)
}
