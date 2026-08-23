// Points max retirés par catégorie d'échéance, atteints seulement quand le nombre
// d'échéances de cette catégorie égale ou dépasse le nombre de plans — voir la note sous
// URGENT_PENALTY_MAX plus bas.
const URGENT_PENALTY_MAX = 35
const SOON_PENALTY_MAX = 15

// Score de "santé du portefeuille" : dérivé des mêmes statistiques déjà agrégées pour le
// résumé Nova (weeklyStats) et des échéances déjà calculées (upcomingDeadlines.js) —
// aucune donnée supplémentaire, aucun appel serveur. Volontairement une heuristique
// simple (pas un vrai modèle) : lisibilité avant précision pour un indicateur d'ambiance.
//
// La pénalité par échéance est proportionnelle au nombre DE PLANS, pas un forfait fixe
// par échéance (retour utilisateur : 2 échéances urgentes retiraient 24 points identiques
// qu'on ait 1 seul plan ou 10 en cours — une urgence sur 10 plans est bien moins alarmante
// que la même urgence sur un portefeuille d'un seul plan). Le ratio (échéances / plans),
// plafonné à 1, est donc appliqué à un budget de points max par catégorie plutôt qu'un
// montant fixe par échéance : 1 plan + 1 échéance urgente = pénalité max ; 10 plans + 1
// échéance urgente = un dixième de cette pénalité.
export function computePortfolioHealth(weeklyStats) {
  const total = weeklyStats.storiesDone + weeklyStats.storiesInProgress + weeklyStats.storiesTodo
  const upcoming = weeklyStats.upcomingDeadlines || []
  const doneRatio = total ? weeklyStats.storiesDone / total : 0
  const urgentCount = upcoming.filter(d => d.daysUntil <= 1).length
  const soonCount = upcoming.filter(d => d.daysUntil > 1 && d.daysUntil <= 7).length
  const planCount = Math.max(weeklyStats.planCount || 0, 1)

  const urgentPenalty = Math.round(Math.min(1, urgentCount / planCount) * URGENT_PENALTY_MAX)
  const soonPenalty = Math.round(Math.min(1, soonCount / planCount) * SOON_PENALTY_MAX)

  let score = total ? Math.round(doneRatio * 100) : 60
  score -= urgentPenalty
  score -= soonPenalty
  score = Math.max(0, Math.min(100, score))

  const level = score >= 70 ? 'good' : score >= 40 ? 'medium' : 'low'
  return { score, level, doneRatio, urgentCount, soonCount, urgentPenalty, soonPenalty }
}

// Santé d'UN plan pris isolément, même formule que computePortfolioHealth avec
// planCount=1 (retour utilisateur : "Santé du portefeuille" agrégeait tout ensemble, sans
// pouvoir dire QUEL plan tire le score vers le bas — la ventilation par plan répond à ça).
// `deadlines` : le résultat de getPlanDeadlines(plan) (upcomingDeadlines.js), pas la liste
// globale plafonnée à 5 échéances tous plans confondus, pour ne pas fausser le calcul d'un
// plan précis avec le plafond pensé pour l'affichage global.
export function computePlanHealth(plan, deadlines) {
  const sprints = plan.roadmap?.sprints || []
  let storiesDone = 0, storiesInProgress = 0, storiesTodo = 0
  sprints.forEach(sp => (sp.stories || []).forEach(s => {
    if (s.status === 'done') storiesDone++
    else if (s.status === 'in_progress') storiesInProgress++
    else storiesTodo++
  }))
  const upcomingDeadlines = (deadlines || []).map(d => ({ daysUntil: Math.round((d.time - Date.now()) / 86400000) }))
  return computePortfolioHealth({ storiesDone, storiesInProgress, storiesTodo, planCount: 1, upcomingDeadlines })
}

// Découpe l'arc de la jauge (demi-cercle rayon 44, centre (50,50), viewBox 100x56 — même
// géométrie que le tracé de fond en dur dans DashboardHome.jsx) en `count` segments égaux,
// un par plan, avec un petit espace visuel entre segments adjacents — pour que la jauge
// elle-même montre quels plans plombent le score plutôt qu'un seul arc uniforme (retour
// utilisateur : "séparer la jauge par couleur et par plan concerné"). Chaque valeur
// renvoyée est un `d` de <path> SVG prêt à l'emploi.
export function computeGaugeSegments(count, gap = 0.06) {
  if (!count || count <= 0) return []
  const point = (theta) => ({
    x: (50 + 44 * Math.cos(theta)).toFixed(2),
    y: (50 - 44 * Math.sin(theta)).toFixed(2)
  })
  const segments = []
  for (let i = 0; i < count; i++) {
    const rawStart = Math.PI - (i / count) * Math.PI
    const rawEnd = Math.PI - ((i + 1) / count) * Math.PI
    const start = rawStart - (i === 0 ? 0 : gap / 2)
    const end = rawEnd + (i === count - 1 ? 0 : gap / 2)
    const p1 = point(start)
    const p2 = point(end)
    segments.push(`M ${p1.x} ${p1.y} A 44 44 0 0 1 ${p2.x} ${p2.y}`)
  }
  return segments
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
