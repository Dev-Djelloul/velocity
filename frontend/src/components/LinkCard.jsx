import '../styles/LinkCard.css'

// Favicon Google public (aucune clé requise) — donne un vrai visuel de marque au lien sans
// dépendre d'un service de capture d'écran externe (payant/à authentifier). Toujours
// disponible tant que le domaine existe, quel que soit le site.
function faviconUrl(url) {
  try {
    const { hostname } = new URL(url)
    return `https://www.google.com/s2/favicons?sz=64&domain=${hostname}`
  } catch {
    return null
  }
}

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

// Carte de lien "à la Notion" (favicon + titre + domaine, pas juste du texte souligné) —
// réutilisée par la Veille, les Benchmarks, le RGPD et le calendrier GTM partout où l'IA
// (ou une liste organisée) référence une vraie source externe.
export default function LinkCard({ url, label, className = '' }) {
  if (!url) return null
  const favicon = faviconUrl(url)
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={`link-card ${className}`}>
      <span className="link-card-favicon">
        {favicon ? <img src={favicon} alt="" /> : <span className="link-card-favicon-fallback" aria-hidden="true" />}
      </span>
      <span className="link-card-text">
        <span className="link-card-label">{label || domainOf(url)}</span>
        <span className="link-card-domain">{domainOf(url)}</span>
      </span>
    </a>
  )
}
