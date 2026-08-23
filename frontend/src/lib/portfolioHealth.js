// Score de "santé du portefeuille" : dérivé des mêmes statistiques déjà agrégées pour le
// résumé Nova (weeklyStats) et des échéances déjà calculées (upcomingDeadlines.js) —
// aucune donnée supplémentaire, aucun appel serveur. Volontairement une heuristique
// simple (pas un vrai modèle) : lisibilité avant précision pour un indicateur d'ambiance.
export function computePortfolioHealth(weeklyStats) {
  const total = weeklyStats.storiesDone + weeklyStats.storiesInProgress + weeklyStats.storiesTodo
  const upcoming = weeklyStats.upcomingDeadlines || []
  const doneRatio = total ? weeklyStats.storiesDone / total : 0
  const urgentCount = upcoming.filter(d => d.daysUntil <= 1).length
  const soonCount = upcoming.filter(d => d.daysUntil > 1 && d.daysUntil <= 7).length

  let score = total ? Math.round(doneRatio * 100) : 60
  score -= urgentCount * 12
  score -= soonCount * 4
  score = Math.max(0, Math.min(100, score))

  const level = score >= 70 ? 'good' : score >= 40 ? 'medium' : 'low'
  return { score, level, urgentCount, soonCount }
}
