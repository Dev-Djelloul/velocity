// Charge les scripts tiers de mesure d'audience / marketing, seulement si l'utilisateur
// y a consenti (bannière cookies, voir CookieConsentBanner.jsx) — jamais avant, jamais par
// défaut. Chaque script n'est injecté qu'une fois (flags module-level) : applyConsent() est
// appelé à chaque décision de consentement (accepter tout / enregistrer la sélection), donc
// idempotent par nature.
const VITE = import.meta.env

let cfLoaded = false
let fbLoaded = false
let linkedinLoaded = false

function loadCloudflareAnalytics() {
  if (cfLoaded) return
  const token = VITE.VITE_CF_BEACON_TOKEN
  if (!token) {
    if (import.meta.env.DEV) console.info('[consent] Statistiques acceptées mais VITE_CF_BEACON_TOKEN absent — Cloudflare Web Analytics non chargé.')
    return
  }
  cfLoaded = true
  const script = document.createElement('script')
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js'
  script.defer = true
  script.setAttribute('data-cf-beacon', JSON.stringify({ token }))
  document.head.appendChild(script)
}

function loadFacebookPixel() {
  if (fbLoaded) return
  const pixelId = VITE.VITE_FB_PIXEL_ID
  if (!pixelId) {
    if (import.meta.env.DEV) console.info('[consent] Marketing accepté mais VITE_FB_PIXEL_ID absent — Meta Pixel non chargé.')
    return
  }
  fbLoaded = true
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */
  window.fbq('init', pixelId)
  window.fbq('track', 'PageView')
}

function loadLinkedInInsight() {
  if (linkedinLoaded) return
  const partnerId = VITE.VITE_LINKEDIN_PARTNER_ID
  if (!partnerId) {
    if (import.meta.env.DEV) console.info('[consent] Marketing accepté mais VITE_LINKEDIN_PARTNER_ID absent — LinkedIn Insight Tag non chargé.')
    return
  }
  linkedinLoaded = true
  window._linkedin_partner_id = partnerId
  window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || []
  window._linkedin_data_partner_ids.push(partnerId)
  const script = document.createElement('script')
  script.type = 'text/javascript'
  script.async = true
  script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js'
  document.head.appendChild(script)
}

// prefs: { statistics: boolean, marketing: boolean } — preferences n'a aucun script
// associé pour l'instant (rien au-delà de langue/thème, déjà couvert par "Essentiels").
export function applyConsent(prefs) {
  if (!prefs) return
  if (prefs.statistics) loadCloudflareAnalytics()
  if (prefs.marketing) {
    loadFacebookPixel()
    loadLinkedInInsight()
  }
}
