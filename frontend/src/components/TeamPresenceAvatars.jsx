import { useEffect, useRef, useState } from 'react'
import { fetchTeamPresence } from '../lib/serverStorage'
import { t } from '../lib/i18n'
import '../styles/TeamPresenceAvatars.css'

const POLL_MS = 12000

function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?'
}

// Qui a un plan de cette équipe ouvert en ce moment (heartbeat périodique depuis
// PlanViewer, voir lib/serverStorage.js) — pas lié à un plan précis, contrairement à la
// présence par plan (barre au-dessus du plan, WebSocket). Placé dans le tableau de bord
// d'équipe et le menu de bascule d'espace : plus visible que l'ancien badge unique, un
// anneau dégradé (identique au Wordmark) signale "connecté·e" au premier coup d'œil.
export default function TeamPresenceAvatars({ teamId, lang, excludeUserId }) {
  const [peers, setPeers] = useState([])
  const pollRef = useRef(null)

  useEffect(() => {
    if (!teamId) { setPeers([]); return }
    const refresh = async () => {
      const list = await fetchTeamPresence(teamId)
      setPeers(list.filter(p => p.userId !== excludeUserId))
    }
    refresh()
    pollRef.current = setInterval(refresh, POLL_MS)
    return () => clearInterval(pollRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId, excludeUserId])

  if (!peers.length) return null

  return (
    <div className="team-presence-avatars" title={t(lang, 'collab.presenceTitle')}>
      {peers.slice(0, 5).map(p => (
        <span key={p.userId} className="team-presence-avatar-ring" title={p.name}>
          {p.avatar
            ? <img src={p.avatar} alt="" />
            : <span className="team-presence-avatar-fallback">{initials(p.name)}</span>}
        </span>
      ))}
      {peers.length > 5 && <span className="team-presence-more">+{peers.length - 5}</span>}
    </div>
  )
}
