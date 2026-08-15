// Suivi des commentaires déjà lus par utilisateur — un simple Set d'ids en localStorage.
// Consulté par PlanSidebar pour n'afficher un badge que sur les commentaires non lus, et
// mis à jour dès que le panneau Commentaires est ouvert.
function key(userId) {
  return `plp_read_comments_${userId}`
}

export function getReadIds(userId) {
  if (!userId) return new Set()
  try {
    return new Set(JSON.parse(localStorage.getItem(key(userId)) || '[]'))
  } catch {
    return new Set()
  }
}

export function markCommentsRead(userId, ids) {
  if (!userId || !ids?.length) return
  const set = getReadIds(userId)
  ids.forEach(id => set.add(id))
  localStorage.setItem(key(userId), JSON.stringify([...set]))
}
