import { useEffect, useRef, useState } from 'react'
import { t } from '../lib/i18n'
import { formatFullDateTime } from '../lib/dateFormat'
import { fetchNotificationFeed, markNotificationFeedRead, markAllNotificationFeedRead, deleteAllNotificationFeed } from '../lib/serverStorage'
import { IconBell, IconCheckCircle, IconTrash } from './Icons'
import '../styles/NotificationBell.css'

const POLL_MS = 8000

// Centre de notifications persistant (cloche du header global) — distinct du toast de
// collaboration éphémère (PresenceBar/PlanViewer, qui disparaît après 5s) : ici, un
// historique consultable pour tout événement notifiable (agents IA, mentions, édition
// collaborative...), qui survit à une navigation ou une fermeture d'onglet.
// onOpen(item) : réutilise le même mécanisme que les notifications de commentaires
// existantes (App.jsx, handleOpenNotification) pour basculer d'espace si besoin puis
// ouvrir le plan concerné.
export default function NotificationBell({ userId, lang, onOpen }) {
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [confirmingDeleteAll, setConfirmingDeleteAll] = useState(false)
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

  // La bulle de confirmation n'a plus son propre fond assombri cliquable pour se fermer
  // (voir plus bas) — elle se referme avec le panneau, pas indépendamment de lui.
  useEffect(() => { if (!open) setConfirmingDeleteAll(false) }, [open])

  if (!userId) return null

  const openItem = (item) => {
    if (!item.read) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, read: true } : i))
      setUnread(n => Math.max(0, n - 1))
      markNotificationFeedRead(userId, item.id)
    }
    setOpen(false)
    if (item.planId) onOpen?.(item)
  }

  const markAllRead = async (e) => {
    e.stopPropagation()
    setItems(prev => prev.map(i => ({ ...i, read: true })))
    setUnread(0)
    await markAllNotificationFeedRead(userId)
  }

  const askDeleteAll = (e) => {
    e.stopPropagation()
    setConfirmingDeleteAll(true)
  }

  const confirmDeleteAll = async () => {
    setConfirmingDeleteAll(false)
    setItems([])
    setUnread(0)
    await deleteAllNotificationFeed(userId)
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
            <div className="notif-bell-header-actions">
              {unread > 0 && <button className="notif-bell-markall" onClick={markAllRead}>{t(lang, 'notifCenter.markAllRead')}</button>}
              {items.length > 0 && (
                <button className="notif-bell-delete-all" onClick={askDeleteAll} title={t(lang, 'notifCenter.deleteAll')}>
                  <IconTrash width={14} height={14} />
                </button>
              )}
            </div>

            {/* Petite bulle ancrée juste sous l'icône poubelle plutôt qu'une grande modale
                centrée avec fond assombri — supprimer des notifications n'a rien d'un
                avertissement critique (retour utilisateur), pas besoin de l'habillage
                habituel réservé aux actions vraiment destructrices (suppression de plan...). */}
            {confirmingDeleteAll && (
              <div className="notif-delete-confirm" onClick={e => e.stopPropagation()}>
                <p>{t(lang, 'notifCenter.confirmDeleteAll')}</p>
                <div className="notif-delete-confirm-actions">
                  <button className="notif-delete-confirm-cancel" onClick={() => setConfirmingDeleteAll(false)}>{t(lang, 'plans.cancel')}</button>
                  <button className="notif-delete-confirm-ok" onClick={confirmDeleteAll}>{t(lang, 'notifCenter.deleteAll')}</button>
                </div>
              </div>
            )}
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
