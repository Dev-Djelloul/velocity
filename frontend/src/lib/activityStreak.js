// Streak de jours consécutifs avec une VRAIE action sur un plan (création, sauvegarde,
// édition) — pas juste avoir ouvert le Dashboard ce jour-là (retour utilisateur). Dérivé
// directement des horodatages déjà présents sur les plans (updatedAt/savedAt/generatedAt),
// eux-mêmes synchronisés côté serveur : contrairement à un compteur en localStorage, ce
// streak est donc identique quel que soit l'appareil ou le navigateur utilisé.
function dayKey(iso) {
  return iso ? iso.slice(0, 10) : null
}

function toDateAtMidnightUTC(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

// Renvoie le streak EN COURS et le meilleur streak JAMAIS ATTEINT (retour utilisateur) —
// les deux dérivés du même ensemble de jours actifs, sans stockage séparé : le record est
// simplement le plus long enchaînement consécutif trouvé dans tout l'historique des plans,
// pas seulement celui qui se termine aujourd'hui/hier.
export function computeActivityStreaks(plans) {
  const activeDays = [...new Set(
    (plans || []).map(p => dayKey(p.updatedAt || p.savedAt || p.generatedAt)).filter(Boolean)
  )].sort()

  if (!activeDays.length) return { current: 0, best: 0 }

  let best = 1
  let run = 1
  for (let i = 1; i < activeDays.length; i++) {
    const diff = Math.round((new Date(activeDays[i]) - new Date(activeDays[i - 1])) / 86400000)
    run = diff === 1 ? run + 1 : 1
    if (run > best) best = run
  }

  const activeSet = new Set(activeDays)
  const today = toDateAtMidnightUTC(new Date())
  const todayKey = today.toISOString().slice(0, 10)
  const yesterday = new Date(today)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayKey = yesterday.toISOString().slice(0, 10)

  // Le streak "tient" tant qu'hier a une activité, même si rien n'a encore été fait
  // aujourd'hui — sans ça, il retomberait à 0 chaque matin avant la première action du
  // jour, ce qui serait trompeur.
  let cursor
  if (activeSet.has(todayKey)) cursor = today
  else if (activeSet.has(yesterdayKey)) cursor = yesterday
  else return { current: 0, best }

  let current = 0
  while (activeSet.has(cursor.toISOString().slice(0, 10))) {
    current++
    cursor = new Date(cursor)
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }

  return { current, best: Math.max(best, current) }
}

// Palier visuel (retour utilisateur : "récompense" par palier plutôt qu'un chiffre inerte)
// — purement cosmétique (couleur/icône du widget), aucun impact sur le calcul lui-même.
export function streakTier(count) {
  if (count >= 30) return 'blazing'
  if (count >= 7) return 'hot'
  if (count >= 1) return 'warm'
  return 'none'
}
