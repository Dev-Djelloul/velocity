import { useEffect, useRef, useState } from 'react'
import { t } from '../lib/i18n'
import { formatFullDateTime } from '../lib/dateFormat'
import { fetchNotificationFeed, markNotificationFeedRead, markAllNotificationFeedRead } from '../lib/serverStorage'
import { IconBell, IconCheckCircle } from './Icons'
import '../styles/NotificationBell.css'

const POLL_MS = 20000

// Centre de notifications persistant (cloche du header global) — distinct du toast de
// collaboration éphémère (PresenceBar/PlanViewer, qui disparaît après 5s) : ici, un
// historique consultable pour tout événement notifiable (agents IA, mentions, édition
// collaborative...), qui survit à une navigation ou une fermeture d'onglet.
export default function NotificationBell({ userId, lang }) {
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const pollRef = useRef(null)
  const rootRef = useRef(null)

  const refresh = async () => {
    if (!userId) return
    const res = await fetchNotificationFeed(userId)
    setItems(res.items || [])
    setUnread(res.unread || 0)
  }

  useEffect(() => {
    if (!userId) return
    refresh()
    pollRef.current = setInterval(refresh, POLL_MS)
    return () => clearInterval(pollRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  if (!userId) return null

  // Marque comme lu au clic ; pas de navigation directe vers le plan concerné pour
  // l'instant (les plans s'ouvrent depuis le Dashboard, pas par URL/id direct) — une
  // évolution possible plutôt que d'ajouter une route qui n'existe pas encore ailleurs.
  const openItem = (item) => {
    if (!item.read) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, read: true } : i))
      setUnread(n => Math.max(0, n - 1))
      markNotificationFeedRead(userId, item.id)
    }
  }

  const markAllRead = async (e) => {
    e.stopPropagation()
    setItems(prev => prev.map(i => ({ ...i, read: true })))
    setUnread(0)
    await markAllNotificationFeedRead(userId)
  }

  return (
    <div className="notif-bell-root" ref={rootRef}>
      <button className="notif-bell-btn" onClick={() => setOpen(v => !v)} title={t(lang, 'notifCenter.title')}>
        <IconBell width={18} height={18} />
        {unread > 0 && <span className="notif-bell-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="notif-bell-panel">
          <div className="notif-bell-header">
            <span>{t(lang, 'notifCenter.title')}</span>
            {unread > 0 && <button className="notif-bell-markall" onClick={markAllRead}>{t(lang, 'notifCenter.markAllRead')}</button>}
          </div>
          <div className="notif-bell-list">
            {items.length === 0 && <p className="notif-bell-empty">{t(lang, 'notifCenter.empty')}</p>}
            {items.map(item => (
              <button key={item.id} className={`notif-bell-item ${item.read ? '' : 'is-unread'}`} onClick={() => openItem(item)}>
                <span className="notif-bell-item-title">{item.title}</span>
                {item.detail && <span className="notif-bell-item-detail">{item.detail}</span>}
                <span className="notif-bell-item-date">{formatFullDateTime(item.createdAt, lang)}</span>
                {!item.read && <IconCheckCircle width={12} height={12} className="notif-bell-item-dot" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
