import { fetchTeamPresence } from '../lib/serverStorage'
import { useTeamPresence } from '../lib/useTeamPresence'
import { t } from '../lib/i18n'
import '../styles/TeamPresenceAvatars.css'

// Compat : certains appelants passaient déjà par fetchTeamPresence pour le nom/avatar des
// pairs en ligne (menu de bascule d'espace) — gardé séparé du hook useTeamPresence (qui ne
// renvoie que les ids, utilisé par la carte "Membres" du tableau de bord).
import { useEffect, useRef, useState } from 'react'

const POLL_MS = 12000

function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?'
}

// Qui a un plan de cette équipe ouvert en ce moment — menu de bascule d'espace (header).
// Pour la carte "Membres" du tableau de bord d'équipe, voir MembersPresenceCard ci-dessous
// à la place : celle-ci liste tout le monde (pas que les personnes en ligne).
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

function memberInitials(name) {
  const parts = String(name || '?').trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?'
}

// Carte "Membres" du tableau de bord d'équipe : un avatar par membre de l'équipe (pas
// seulement ceux en ligne, contrairement à TeamPresenceAvatars ci-dessus) — les membres
// actuellement connectés (heartbeat actif, voir PlanViewer.jsx) se distinguent par
// l'anneau dégradé du Wordmark ET une lueur verte ; les autres restent en gris neutre.
export function MembersPresenceRow({ teamId, members, lang }) {
  const onlineIds = useTeamPresence(teamId)
  if (!members?.length) return null

  return (
    <div className="members-presence-row">
      {members.map(m => {
        const online = onlineIds.has(m.id)
        return (
          <span
            key={m.id}
            className={`members-presence-avatar ${online ? 'is-online' : ''}`}
            title={online ? `${m.name} · ${t(lang, 'collab.onlineSuffix')}` : m.name}
          >
            {m.imageUrl
              ? <img src={m.imageUrl} alt="" />
              : <span className="members-presence-fallback">{memberInitials(m.name)}</span>}
          </span>
        )
      })}
    </div>
  )
}
