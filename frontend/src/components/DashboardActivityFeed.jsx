import { useEffect, useState } from 'react'
import { t } from '../lib/i18n'
import { formatFullDateTime } from '../lib/dateFormat'
import { fetchNotificationFeed, markNotificationFeedRead } from '../lib/serverStorage'
import { IconActivity, IconCheckCircle } from './Icons'

const POLL_MS = 15000
const MAX_ITEMS = 5

// Version compacte du centre de notifications (NotificationBell), pensée pour vivre en
// permanence sur le Dashboard plutôt que derrière un clic sur la cloche — les 5 derniers
// événements tous espaces confondus (édition de roadmap, génération IA, agent terminé),
// pour voir ce qui bouge sans ouvrir chaque plan un par un.
export default function DashboardActivityFeed({ userId, lang, onOpen }) {
  const [items, setItems] = useState([])

  useEffect(() => {
    if (!userId) return
    const refresh = () => fetchNotificationFeed(userId).then(res => setItems((res.items || []).slice(0, MAX_ITEMS)))
    refresh()
    const interval = setInterval(refresh, POLL_MS)
    return () => clearInterval(interval)
  }, [userId])

  const openItem = (item) => {
    if (!item.read) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, read: true } : i))
      markNotificationFeedRead(userId, item.id)
    }
    if (item.planId) onOpen?.(item)
  }

  return (
    <div className="dashboard-widget-card dashboard-activity-card">
      <div className="dashboard-widget-header">
        <IconActivity width={16} height={16} />
        <h3>{t(lang, 'dashboard.activityTitle')}</h3>
      </div>
      {items.length === 0 ? (
        <p className="dashboard-activity-empty">{t(lang, 'dashboard.activityEmpty')}</p>
      ) : (
        <div className="dashboard-activity-list">
          {items.map(item => (
            <button key={item.id} className={`dashboard-activity-item ${item.read ? '' : 'is-unread'}`} onClick={() => openItem(item)}>
              <span className="dashboard-activity-item-title">{item.title}</span>
              {item.detail && <span className="dashboard-activity-item-detail">{item.detail}</span>}
              <span className="dashboard-activity-item-date">{formatFullDateTime(item.createdAt, lang)}</span>
              {!item.read && <IconCheckCircle width={11} height={11} className="dashboard-activity-item-dot" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
