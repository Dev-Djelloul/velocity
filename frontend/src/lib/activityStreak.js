// Streak de jours consécutifs avec une VRAIE action sur un plan (création, sauvegarde,
// édition) — pas juste avoir ouvert le Dashboard ce jour-là (retour utilisateur : la
// version précédente ne mesurait rien de réel). Dérivé directement des horodatages déjà
// présents sur les plans (updatedAt/savedAt/generatedAt), eux-mêmes synchronisés côté
// serveur : contrairement à un compteur en localStorage, ce streak est donc identique quel
// que soit l'appareil ou le navigateur utilisé.
function dayKey(iso) {
  return iso ? iso.slice(0, 10) : null
}

function toDateAtMidnightUTC(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function computeActivityStreak(plans) {
  const activeDays = new Set(
    (plans || [])
      .map(p => dayKey(p.updatedAt || p.savedAt || p.generatedAt))
      .filter(Boolean)
  )
  if (!activeDays.size) return 0

  const today = toDateAtMidnightUTC(new Date())
  const todayKey = today.toISOString().slice(0, 10)
  const yesterday = new Date(today)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayKey = yesterday.toISOString().slice(0, 10)

  // Le streak "tient" tant qu'hier a une activité, même si rien n'a encore été fait
  // aujourd'hui — sans ça, il retomberait à 0 chaque matin avant la première action du
  // jour, ce qui serait trompeur (retour utilisateur implicite : un streak ne devrait pas
  // sembler "cassé" juste parce qu'on n'a pas encore rouvert l'app aujourd'hui).
  let cursor
  if (activeDays.has(todayKey)) cursor = today
  else if (activeDays.has(yesterdayKey)) cursor = yesterday
  else return 0

  let count = 0
  while (activeDays.has(cursor.toISOString().slice(0, 10))) {
    count++
    cursor = new Date(cursor)
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return count
}
