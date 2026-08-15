// Suivi des commentaires déjà lus / effacés par utilisateur — deux simples Sets d'ids en
// localStorage. "Lu" sert au badge non-lu (PlanSidebar, header) ; "effacé" sert au bouton
// "Tout effacer" des notifications (Mon compte) — on ne supprime jamais le commentaire
// réel, seulement sa présence dans le flux de notifications de cet utilisateur.
function readKey(userId) {
  return `plp_read_comments_${userId}`
}

function dismissedKey(userId) {
  return `plp_dismissed_comments_${userId}`
}

export function getReadIds(userId) {
  if (!userId) return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(readKey(userId)) || '[]'))
  } catch {
    return new Set()
  }
}

export function markCommentsRead(userId, ids) {
  if (!userId || !ids?.length) return
  const set = getReadIds(userId)
  ids.forEach(id => set.add(id))
  localStorage.setItem(readKey(userId), JSON.stringify([...set]))
}

export function getDismissedIds(userId) {
  if (!userId) return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(dismissedKey(userId)) || '[]'))
  } catch {
    return new Set()
  }
}

export function dismissComments(userId, ids) {
  if (!userId || !ids?.length) return
  const set = getDismissedIds(userId)
  ids.forEach(id => set.add(id))
  localStorage.setItem(dismissedKey(userId), JSON.stringify([...set]))
}
