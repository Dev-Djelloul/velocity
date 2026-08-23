// Disposition des widgets du Dashboard (ordre + taille), à la manière du centre de
// notifications macOS : déplaçables par glisser-déposer, redimensionnables via un clic
// droit ("Petit"/"Moyen"/"Grand"). Persistée en localStorage, par utilisateur — purement
// une préférence d'affichage locale, pas une donnée métier à synchroniser côté serveur.
const STORAGE_PREFIX = 'plp_dashboard_widgets_'

export const WIDGET_IDS = ['resume', 'activity', 'nova', 'calendar', 'deadlines']

export const DEFAULT_LAYOUT = {
  order: ['calendar', 'deadlines', 'activity', 'nova', 'resume'],
  sizes: {
    calendar: 'large',
    deadlines: 'medium',
    activity: 'medium',
    nova: 'medium',
    resume: 'small'
  }
}

function key(userId) {
  return `${STORAGE_PREFIX}${userId}`
}

export function loadWidgetLayout(userId) {
  if (!userId) return DEFAULT_LAYOUT
  try {
    const raw = localStorage.getItem(key(userId))
    if (!raw) return DEFAULT_LAYOUT
    const parsed = JSON.parse(raw)
    // Fusionne avec les valeurs par défaut plutôt que de faire confiance aveuglément au
    // JSON stocké : un widget ajouté depuis la dernière visite (nouvelle fonctionnalité)
    // doit apparaître même si l'utilisateur a déjà une disposition sauvegardée qui ne le
    // connaît pas encore.
    const order = [...(parsed.order || []).filter(id => WIDGET_IDS.includes(id))]
    WIDGET_IDS.forEach(id => { if (!order.includes(id)) order.push(id) })
    const sizes = { ...DEFAULT_LAYOUT.sizes, ...(parsed.sizes || {}) }
    return { order, sizes }
  } catch {
    return DEFAULT_LAYOUT
  }
}

export function saveWidgetLayout(userId, layout) {
  if (!userId) return
  try { localStorage.setItem(key(userId), JSON.stringify(layout)) } catch { /* quota pleine ou stockage indisponible : la disposition reste juste non persistée */ }
}
