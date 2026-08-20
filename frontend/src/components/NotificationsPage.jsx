import { useEffect, useState } from 'react'
import { t } from '../lib/i18n'
import { useUser, useAuth, useTeam } from '../lib/auth'
import { isPro } from '../lib/creditTracker'
import { createCheckoutSession, isServerConfigured } from '../lib/serverStorage'
import { formatFullDateTime } from '../lib/dateFormat'
import { collectRecentComments, fetchRecentComments } from '../lib/notifications'
import { getReadIds, markCommentsRead, getDismissedIds, dismissComments } from '../lib/commentReads'
import { getPersonalSpace } from '../lib/personalSpace'
import { IconArrowLeft, IconMessageCircle, IconRocket, IconAlertTriangle, IconX } from './Icons'
import PricingCards from './PricingCards'
import { ContactModal } from './CompanyModals'
import NotificationsSection from './NotificationsSection'
import '../styles/AccountPage.css'
import '../styles/SettingsPage.css'
import '../styles/NotificationsPage.css'

// Asset statique servi tel quel depuis public/ (généré par IA), comme les autres fonds de page.
const NOTIFICATIONS_BACKGROUND = '/assets/ai-images/lucid-origin_Abstract_3D_isometric_illustration_representing_speed_and_productivity_for_a_Saa-0.jpg'

// Page dédiée aux notifications : le fil (@mentions/commentaires reçus) ET, depuis leur
// déménagement hors de Paramètres, les préférences email/Slack (NotificationsSection) —
// tout ce qui concerne les notifications vit maintenant au même endroit, plutôt que d'avoir
// la boîte de réception ici et sa configuration ailleurs.
export default function NotificationsPage({ lang, onBack, onOpenNotification }) {
  const { user } = useUser()
  const { userId } = useAuth()
  const team = useTeam()
  const pro = isPro(userId)
  const [notifications, setNotifications] = useState(() => collectRecentComments(userId, lang))
  const [readVersion, setReadVersion] = useState(0)
  const [showClearNotifs, setShowClearNotifs] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(false)

  const readIds = getReadIds(userId)
  const dismissedIds = getDismissedIds(userId)
  const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id))

  const openNotification = (item) => {
    markCommentsRead(userId, [item.id])
    setReadVersion(v => v + 1)
    onOpenNotification?.(item)
  }

  // "Tout effacer" ne supprime jamais le commentaire réel (visible côté plan) — seulement
  // sa présence dans ce fil, pour repartir d'une liste vide quand elle devient trop longue.
  const clearAllNotifications = () => {
    dismissComments(userId, visibleNotifications.map(n => n.id))
    setReadVersion(v => v + 1)
    setShowClearNotifs(false)
  }

  // Polling léger (toutes les 45s tant que cette page est ouverte) : va chercher côté
  // serveur les commentaires postés depuis un autre appareil, sur des espaces jamais
  // ouverts localement dans ce navigateur. Réservé à Pro (voir tarification).
  const teamIdsKey = (team.myTeams || []).map(tm => tm.id).join(',')
  useEffect(() => {
    if (!userId || !pro) return
    const teamIds = teamIdsKey ? teamIdsKey.split(',') : []
    let cancelled = false
    const poll = () => {
      fetchRecentComments(userId, teamIds, lang).then(list => {
        if (!cancelled) setNotifications(list)
      })
    }
    poll()
    const interval = setInterval(poll, 45000)
    return () => { cancelled = true; clearInterval(interval) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, teamIdsKey, lang, pro, readVersion])

  const startCheckout = async (interval) => {
    setCheckoutLoading(true)
    setCheckoutError(false)
    const result = await createCheckoutSession(userId, user?.primaryEmailAddress?.emailAddress, interval)
    if (result?.url) {
      window.location.href = result.url
      return
    }
    setCheckoutLoading(false)
    setCheckoutError(true)
  }

  return (
    <div className="notifications-page-outer">
      <div className="notifications-page-bg" style={{ backgroundImage: `url(${NOTIFICATIONS_BACKGROUND})` }} aria-hidden="true" />
      <div className="account-page notifications-page-inner">
      <button className="account-back-btn" onClick={onBack}>
        <IconArrowLeft width={16} height={16} /> {t(lang, 'settings.backToApp')}
      </button>

      <h2 className="settings-page-title"><IconMessageCircle width={20} height={20} /> {lang === 'fr' ? 'Notifications' : 'Notifications'}</h2>

      <div className="account-section card">
        <h3 className="account-section-title-row">
          <span>{lang === 'fr' ? 'Commentaires récents' : 'Recent comments'}</span>
          {pro && visibleNotifications.length > 0 && (
            <button className="account-clear-btn" onClick={() => setShowClearNotifs(true)}>
              {t(lang, 'account.clearNotifications')}
            </button>
          )}
        </h3>
        {!pro ? (
          <div className="account-locked-teaser">
            <p className="account-empty">{t(lang, 'account.notificationsProNote')}</p>
            <button className="account-pro-cta" onClick={() => setShowUpgrade(true)}>
              <IconRocket width={14} height={14} /> {t(lang, 'account.upgradeCta')}
            </button>
          </div>
        ) : visibleNotifications.length === 0 ? (
          <p className="account-empty">{lang === 'fr' ? 'Aucune notification pour le moment.' : 'No notifications yet.'}</p>
        ) : (
          <div className="account-list">
            {visibleNotifications.map(item => (
              <button
                key={item.id}
                className={`account-notif-item ${readIds.has(item.id) ? '' : 'is-unread'}`}
                onClick={() => openNotification(item)}
              >
                <span className="account-notif-head">
                  <strong>{item.authorName}</strong>
                  {lang === 'fr' ? ' a commenté ' : ' commented on '}
                  <em>{item.planName}</em>
                  <span className="account-notif-space">{item.spaceId ? (item.spaceName || t(lang, 'team.myTeams')) : getPersonalSpace(userId, lang).name}</span>
                </span>
                <span className="account-notif-text">{item.text}</span>
                <span className="account-notif-date">{formatFullDateTime(item.createdAt, lang)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <NotificationsSection lang={lang} userId={userId} />

      {showUpgrade && (
        <div className="modal-backdrop" onClick={() => setShowUpgrade(false)}>
          <div className="pricing-modal-v2" onClick={e => e.stopPropagation()}>
            <button className="upgrade-modal-close" onClick={() => setShowUpgrade(false)} title={t(lang, 'export.close')}>
              <IconX width={16} height={16} />
            </button>
            <h3 className="pricing-modal-v2-title">{t(lang, 'account.upgradeTitle')}</h3>
            <p className="pricing-modal-v2-subtitle">{t(lang, 'account.upgradeBody')}</p>

            {!isServerConfigured && <p className="upgrade-note pricing-modal-v2-note">{t(lang, 'account.upgradeNote')}</p>}
            {checkoutError && <p className="upgrade-note pricing-modal-v2-note">{t(lang, 'account.upgradeError')}</p>}

            <PricingCards
              lang={lang}
              currentTierId={pro ? 'pro' : 'free'}
              proLoading={checkoutLoading || !isServerConfigured}
              onSelectPro={startCheckout}
              onSelectEnterprise={() => { setShowUpgrade(false); setShowContact(true) }}
            />
          </div>
        </div>
      )}

      {showContact && <ContactModal lang={lang} onClose={() => setShowContact(false)} />}

      {showClearNotifs && (
        <div className="confirm-modal-backdrop" onClick={() => setShowClearNotifs(false)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-icon"><IconAlertTriangle width={22} height={22} /></div>
            <h3>{t(lang, 'account.clearNotificationsConfirmTitle')}</h3>
            <p>{t(lang, 'account.clearNotificationsConfirmBody')}</p>
            <div className="confirm-modal-actions">
              <button className="btn-secondary" onClick={() => setShowClearNotifs(false)}>{t(lang, 'plans.cancel')}</button>
              <button className="btn-danger" onClick={clearAllNotifications}>{t(lang, 'account.clearNotifications')}</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
