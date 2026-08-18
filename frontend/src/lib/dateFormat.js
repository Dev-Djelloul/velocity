const TIMEZONE_KEY = 'plp_timezone'
const DATE_FORMAT_KEY = 'plp_date_format'

// 'auto' (par défaut) suit la langue de l'app (fr -> JJ/MM, en -> MM/JJ). L'utilisateur
// peut forcer un ordre fixe indépendamment de la langue (ex: équipe US qui utilise
// l'app en français mais veut MM/JJ/AAAA partout).
export function getDateFormat() {
  return localStorage.getItem(DATE_FORMAT_KEY) || 'auto'
}

export function setDateFormat(fmt) {
  localStorage.setItem(DATE_FORMAT_KEY, fmt || 'auto')
}

function resolveLocale(lang) {
  const pref = getDateFormat()
  if (pref === 'dmy') return 'fr-FR'
  if (pref === 'mdy') return 'en-US'
  return lang === 'en' ? 'en-US' : 'fr-FR'
}

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
  const locale = resolveLocale(lang)
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short', ...tzOption() })
}

// Date seule, sans heure ni jour de semaine — pour les descriptions de changement compactes
// (ex: "Date de lancement : 13 août 2026 → 20 août 2026").
export function formatDateShort(iso, lang) {
  if (!iso) return ''
  const locale = resolveLocale(lang)
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric', ...tzOption() })
}

// Version longue avec le jour de la semaine, pour les messages plus personnels (bannière de plan).
export function formatFullDateTime(iso, lang) {
  if (!iso) return ''
  const locale = resolveLocale(lang)
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const opts = tzOption()
  const datePart = date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', ...opts })
  const timePart = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', ...opts })
  const connector = lang === 'en' ? 'at' : 'à'
  return `${datePart} ${connector} ${timePart}`
}

// Date numérique courte (ex: 13/08/2026 ou 08/13/2026) — pour les tableaux, calendriers
// et exports où le format JJ/MM vs MM/JJ importe vraiment (contrairement aux dates en
// toutes lettres ci-dessus, ambiguës nulle part).
export function formatDateNumeric(iso, lang) {
  if (!iso) return ''
  const locale = resolveLocale(lang)
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', ...tzOption() })
}
