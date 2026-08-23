// Streak de jours d'activité consécutifs — purement local (comme dashboardWidgets.js),
// aucune synchronisation serveur. Un jour "compte" dès que le Dashboard est ouvert ce
// jour-là (pas besoin d'action précise) : c'est un indicateur de régularité ludique, pas
// une mesure de productivité fine.
const STORAGE_PREFIX = 'plp_streak_'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayStr() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export function recordVisitAndGetStreak(userId) {
  if (!userId) return { count: 0 }
  const key = STORAGE_PREFIX + userId
  let data = {}
  try { data = JSON.parse(localStorage.getItem(key)) || {} } catch { data = {} }

  const today = todayStr()
  if (data.lastDate === today) return { count: data.count || 1 }

  const count = data.lastDate === yesterdayStr() ? (data.count || 0) + 1 : 1
  try { localStorage.setItem(key, JSON.stringify({ lastDate: today, count })) } catch { /* stockage indisponible : streak simplement non persisté */ }
  return { count }
}
