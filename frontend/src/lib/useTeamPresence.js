import { useEffect, useRef, useState } from 'react'
import { fetchTeamPresence } from './serverStorage'

const POLL_MS = 12000

// Ensemble des userId ayant un plan de cette équipe ouvert en ce moment (heartbeat
// périodique depuis PlanViewer.jsx) — extrait en hook pour être réutilisé à la fois par
// TeamPresenceAvatars (menu de bascule d'espace) et par la carte "Membres" du tableau de
// bord d'équipe (chaque membre affiché, ceux en ligne mis en évidence).
export function useTeamPresence(teamId) {
  const [onlineIds, setOnlineIds] = useState(() => new Set())
  const pollRef = useRef(null)

  useEffect(() => {
    if (!teamId) { setOnlineIds(new Set()); return }
    const refresh = async () => {
      const list = await fetchTeamPresence(teamId)
      setOnlineIds(new Set(list.map(p => p.userId)))
    }
    refresh()
    pollRef.current = setInterval(refresh, POLL_MS)
    return () => clearInterval(pollRef.current)
  }, [teamId])

  return onlineIds
}
