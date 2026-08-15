const TIMEZONE_KEY = 'plp_timezone'

// 'auto' (par défaut) laisse Intl utiliser le fuseau du navigateur — la préférence n'est
// transmise aux options Intl que si l'utilisateur a explicitement choisi un fuseau fixe
// (utile pour une équipe distribuée qui veut voir les dates dans un fuseau commun).
export function getTimezone() {
  return localStorage.getItem(TIMEZONE_KEY) || 'auto'
}

export function setTimezone(tz) {
  localStorage.setItem(TIMEZONE_KEY, tz || 'auto')
}

function tzOption() {
  const tz = getTimezone()
  return tz === 'auto' ? {} : { timeZone: tz }
}

export function formatDateTime(iso, lang) {
  if (!iso) return ''
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short', ...tzOption() })
}

// Date seule, sans heure ni jour de semaine — pour les descriptions de changement compactes
// (ex: "Date de lancement : 13 août 2026 → 20 août 2026").
export function formatDateShort(iso, lang) {
  if (!iso) return ''
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', ...tzOption() })
}

// Version longue avec le jour de la semaine, pour les messages plus personnels (bannière de plan).
export function formatFullDateTime(iso, lang) {
  if (!iso) return ''
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const opts = tzOption()
  const datePart = date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', ...opts })
  const timePart = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', ...opts })
  const connector = lang === 'en' ? 'at' : 'à'
  return `${datePart} ${connector} ${timePart}`
}
