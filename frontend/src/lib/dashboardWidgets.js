// Disposition des widgets du Dashboard (ordre + taille), à la manière du centre de
// notifications macOS : déplaçables par glisser-déposer, redimensionnables via un clic
// droit ("Petit"/"Moyen"/"Grand"). Persistée en localStorage, par utilisateur — purement
// une préférence d'affichage locale, pas une donnée métier à synchroniser côté serveur.
//
// La liste des widgets n'est PAS figée : les espaces d'équipe (une carte = un widget) sont
// dynamiques d'un utilisateur à l'autre et changent dans le temps (création d'une équipe).
// `loadWidgetLayout` reçoit donc la liste des ids réellement affichés à cet instant
// (`allIds`, dérivée par l'appelant de l'objet `widgets` qu'il rend) plutôt qu'une liste
// figée ici — un id absent de la disposition sauvegardée (nouvelle équipe, nouveau widget
// ajouté par une mise à jour du produit) est simplement ajouté à la fin.
const STORAGE_PREFIX = 'plp_dashboard_widgets_'

function key(userId) {
  return `${STORAGE_PREFIX}${userId}`
}

export function loadWidgetLayout(userId, allIds, defaults) {
  const fallback = { order: defaults?.order || allIds, sizes: defaults?.sizes || {} }
  if (!userId) return fallback
  try {
    const raw = localStorage.getItem(key(userId))
    const parsed = raw ? JSON.parse(raw) : {}
    const order = [...(parsed.order || []).filter(id => allIds.includes(id))]
    // D'abord les ids par défaut manquants dans l'ordre attendu, puis tout id vraiment
    // nouveau (ex: une équipe tout juste créée) — pour qu'un nouveau widget apparaisse à
    // une position sensée plutôt que systématiquement en toute fin de grille.
    ;(fallback.order || []).forEach(id => { if (allIds.includes(id) && !order.includes(id)) order.push(id) })
    allIds.forEach(id => { if (!order.includes(id)) order.push(id) })
    const sizes = { ...fallback.sizes, ...(parsed.sizes || {}) }
    return { order, sizes }
  } catch {
    return fallback
  }
}

export function saveWidgetLayout(userId, layout) {
  if (!userId) return
  try { localStorage.setItem(key(userId), JSON.stringify(layout)) } catch { /* quota pleine ou stockage indisponible : la disposition reste juste non persistée */ }
}
