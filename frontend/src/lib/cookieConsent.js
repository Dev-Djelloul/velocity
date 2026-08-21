// Source unique du consentement cookies (clé localStorage + lecture), partagée entre
// CookieConsentBanner.jsx (écrit le choix) et App.jsx (lit le consentement "Préférences"
// pour décider si les réglages d'affichage — thème, langue, accessibilité... — doivent être
// mémorisés d'une visite à l'autre ou repartir sur leurs valeurs par défaut).
export const CONSENT_STORAGE_KEY = 'plp_cookie_consent'

export function readCookieConsent() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function hasPreferencesConsent() {
  return !!readCookieConsent()?.preferences
}
