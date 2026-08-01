export function formatDateTime(iso, lang) {
  if (!iso) return ''
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
}

// Version longue avec le jour de la semaine, pour les messages plus personnels (bannière de plan).
export function formatFullDateTime(iso, lang) {
  if (!iso) return ''
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const datePart = date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const timePart = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  const connector = lang === 'en' ? 'at' : 'à'
  return `${datePart} ${connector} ${timePart}`
}
