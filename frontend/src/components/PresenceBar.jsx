import { t } from '../lib/i18n'
import '../styles/PresenceBar.css'

function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?'
}

// Qui d'autre a ce plan ouvert en ce moment (voir lib/collab.js) — pas des curseurs
// live ni une fusion caractère par caractère, juste "vous n'êtes pas seul·e ici".
export default function PresenceBar({ peers, lang }) {
  if (!peers || peers.length === 0) return null
  return (
    <div className="presence-bar" title={t(lang, 'collab.presenceTitle')}>
      {peers.slice(0, 5).map(p => (
        <span key={p.id} className="presence-avatar" style={{ background: p.color }} title={p.name}>
          {initials(p.name)}
        </span>
      ))}
      {peers.length > 5 && <span className="presence-avatar presence-more">+{peers.length - 5}</span>}
      <span className="presence-label">{t(lang, 'collab.viewing')(peers.length)}</span>
    </div>
  )
}
