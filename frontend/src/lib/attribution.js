const STORAGE_KEY = 'plp_signup_attribution'

// Attribution "first-touch" : capturée à la première visite, puis jamais réécrite ensuite —
// un visiteur qui revient plus tard en direct (favori, lien copié) ne doit pas effacer le
// canal qui l'a réellement amené la première fois. Persistée en localStorage (pas
// sessionStorage) : rien n'oblige l'inscription à se faire dans la foulée du premier clic.
// Enregistrée même sans utm_*/referrer (visite directe — favori, URL tapée à la main) :
// sans ça, ces inscriptions "organiques" n'apparaissaient jamais dans /admin/attribution,
// impossible de savoir même juste QUI s'était inscrit (retour utilisateur, table vide alors
// que 3 comptes existaient bien côté Clerk).
export function captureAttribution() {
  if (typeof window === 'undefined') return
  try {
    if (localStorage.getItem(STORAGE_KEY)) return
    const params = new URLSearchParams(window.location.search)
    const data = {
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
      utmContent: params.get('utm_content') || undefined,
      utmTerm: params.get('utm_term') || undefined,
      referrer: document.referrer || undefined,
      landingPage: window.location.pathname
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* localStorage indisponible : tant pis, pas de suivi cette visite */ }
}

// Passée telle quelle en unsafeMetadata à <SignUp> (voir AuthPage.jsx) — Clerk l'attache au
// user.created transmis à notre webhook (voir /webhooks/clerk côté backend).
export function getAttribution() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}
