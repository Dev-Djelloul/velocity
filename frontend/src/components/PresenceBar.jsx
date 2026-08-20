import { t } from '../lib/i18n'
import '../styles/PresenceBar.css'

function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?'
}

// Qui d'autre a ce plan ouvert en ce moment (voir lib/collab.js) — pas des curseurs
// live ni une fusion caractère par caractère, juste "vous n'êtes pas seul·e ici". Vrai
// avatar (photo Clerk) quand disponible, sinon initiales sur fond coloré déterministe.
export default function PresenceBar({ peers, lang }) {
  if (!peers || peers.length === 0) return null
  const shown = peers.slice(0, 3)
  const extra = peers.length - shown.length
  return (
    <div className="presence-bar" title={t(lang, 'collab.presenceTitle')}>
      {shown.map(p => (
        <span key={p.id} className="presence-person">
          {p.avatar
            ? <img className="presence-avatar-img" src={p.avatar} alt="" />
            : <span className="presence-avatar" style={{ background: p.color }}>{initials(p.name)}</span>}
          <span className="presence-name">{p.name} {t(lang, 'collab.onlineSuffix')}</span>
        </span>
      ))}
      {extra > 0 && <span className="presence-more">{t(lang, 'collab.moreOnline')(extra)}</span>}
    </div>
  )
}
