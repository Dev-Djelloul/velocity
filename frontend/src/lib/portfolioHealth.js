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
  return { score, level, doneRatio, urgentCount, soonCount }
}

// Classe le niveau (bon/moyen/faible) ET la tendance (hausse/stable/baisse vs il y a ~7
// jours) en un seul état météo — sans la tendance, "Météo business" n'était qu'un second
// affichage du même score que la jauge de santé, sans rien y ajouter (retour utilisateur).
// `trend` est un delta de score (ou null si aucun historique encore disponible pour cet
// appareil — voir portfolioHealthHistory.js) ; ±5 points sert de seuil de "stable" pour
// ignorer le bruit d'un score qui oscille de 1-2 points d'une visite à l'autre.
export function classifyWeather(level, trend) {
  const trendDir = trend == null ? 'flat' : trend > 5 ? 'up' : trend < -5 ? 'down' : 'flat'
  return { level, trendDir, key: `${level}_${trendDir}` }
}
