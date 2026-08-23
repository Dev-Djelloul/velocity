// Catalogue des widgets du Dashboard pour la bibliothèque ("+" à côté de "Créer un plan"),
// façon galerie de widgets macOS. Distinct de la disposition (dashboardWidgets.js) : ce
// fichier décrit QUELS widgets existent et comment les présenter dans la bibliothèque
// (catégorie, obligatoire ou non), pas où ils sont placés ni leur taille actuelle. Les
// cartes d'espace (`space:*`) et "Créer une équipe" ne sont pas dans ce catalogue : elles
// sont dynamiques (une par espace) et toujours affichées, pas gérables individuellement.
export const WIDGET_CATEGORIES = ['essentials', 'organisation', 'insights']

export const WIDGET_CATALOG = [
  { id: 'calendar', category: 'essentials', mandatory: true },
  { id: 'resume', category: 'essentials', mandatory: true },
  { id: 'deadlines', category: 'essentials' },
  { id: 'activity', category: 'essentials' },
  { id: 'nova', category: 'essentials', proOnly: true },
  { id: 'history', category: 'organisation' },
  { id: 'gallery', category: 'organisation' },
  { id: 'portfolioHealth', category: 'insights', isNew: true },
  { id: 'streak', category: 'insights', isNew: true },
  { id: 'businessWeather', category: 'insights', isNew: true }
]

export function catalogEntriesFor(availableIds) {
  return WIDGET_CATALOG.filter(w => availableIds.includes(w.id))
}
