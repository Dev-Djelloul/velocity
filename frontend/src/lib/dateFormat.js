export function formatDateTime(iso, lang) {
  if (!iso) return ''
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
}
