// Historique local du score de "Santé du portefeuille", pour donner un vrai signal de
// tendance au widget "Météo business" (mieux/moins bien qu'il y a une semaine) plutôt
// qu'un simple re-habillage visuel du même score sans mémoire. Comme dashboardWidgets.js
// et streakTracker.js : purement local par appareil/navigateur, aucune synchronisation
// serveur — un indicateur d'ambiance n'a pas besoin d'une vraie infra de séries temporelles.
const STORAGE_PREFIX = 'plp_health_history_'
const HISTORY_DAYS = 30
const TREND_WINDOW_DAYS = 7

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function recordAndGetTrend(userId, score) {
  if (!userId) return { trend: null, previousScore: null }
  const key = STORAGE_PREFIX + userId
  let history = []
  try { history = JSON.parse(localStorage.getItem(key)) || [] } catch { history = [] }

  const today = todayStr()
  // Un seul point par jour (écrase la valeur du jour à chaque revisite) : sinon plusieurs
  // ouvertures du Dashboard le même jour, à des moments où le score a bougé, pollueraient
  // l'historique avec plusieurs points pour un même jour.
  const idx = history.findIndex(h => h.date === today)
  if (idx >= 0) history[idx].score = score
  else history.push({ date: today, score })

  const cutoff = Date.now() - HISTORY_DAYS * 86400000
  history = history.filter(h => new Date(h.date).getTime() >= cutoff)
  try { localStorage.setItem(key, JSON.stringify(history)) } catch { /* stockage indisponible : tendance simplement non calculable */ }

  // Point le plus proche d'il y a 7 jours (hors aujourd'hui) — un utilisateur n'ouvre pas
  // forcément le Dashboard tous les jours, donc "il y a exactement 7 jours" n'existe pas
  // toujours dans l'historique.
  const targetTime = Date.now() - TREND_WINDOW_DAYS * 86400000
  let closest = null
  let closestDiff = Infinity
  history.forEach(h => {
    if (h.date === today) return
    const diff = Math.abs(new Date(h.date).getTime() - targetTime)
    if (diff < closestDiff) { closestDiff = diff; closest = h }
  })

  if (!closest) return { trend: null, previousScore: null }
  return { trend: score - closest.score, previousScore: closest.score }
}
