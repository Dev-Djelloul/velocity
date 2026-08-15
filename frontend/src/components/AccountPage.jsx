import { useEffect, useState } from 'react'
import { t } from '../lib/i18n'
import { useUser, useAuth, useTeam, isMockAuth, useOpenSecurity, useAuthProvider } from '../lib/auth'
import { deletePlan, movePlanToTeam, fetchAllPlansAggregated, getAllPlans } from '../lib/planStorage'
import { FREE_PLAN_LIMIT, getUsedCredits, isPro, remainingCredits } from '../lib/creditTracker'
import { createCheckoutSession, isServerConfigured } from '../lib/serverStorage'
import { formatFullDateTime } from '../lib/dateFormat'
import { collectRecentComments, fetchRecentComments } from '../lib/notifications'
import { getReadIds, markCommentsRead, getDismissedIds, dismissComments } from '../lib/commentReads'
import { getPersonalSpace } from '../lib/personalSpace'
import { IconUser, IconClipboard, IconRocket, IconArrowLeft, IconTrash, IconShield, IconProviderGoogle, IconProviderApple, IconProviderSlack, IconAlertTriangle, IconX, IconMessageCircle } from './Icons'

const PROVIDER_ICONS = {
  google: IconProviderGoogle,
  apple: IconProviderApple,
  slack: IconProviderSlack
}
import AvatarPicker from './AvatarPicker'
import PricingCards from './PricingCards'
import { ContactModal } from './CompanyModals'
import '../styles/AccountPage.css'

export default function AccountPage({ lang, onBack, onLoadPlan, onOpenNotification, pendingAction, onConsumeAction }) {
  const { user } = useUser()
  const { userId, signOut } = useAuth()
  const openSecurity = useOpenSecurity()
  const authProvider = useAuthProvider()
  const team = useTeam()
  const ProviderIcon = authProvider ? PROVIDER_ICONS[authProvider] : null
  const [plans, setPlans] = useState([])
  const [notifications, setNotifications] = useState(() => collectRecentComments(userId, lang))
  const [readVersion, setReadVersion] = useState(0)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(false)
  const [deletePlanTarget, setDeletePlanTarget] = useState(null)
  const [movePlanTarget, setMovePlanTarget] = useState(null)
  const [showClearNotifs, setShowClearNotifs] = useState(false)

  const pro = isPro(userId)
  const readIds = getReadIds(userId)
  const dismissedIds = getDismissedIds(userId)
  const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id))
  const unreadNotifications = visibleNotifications.filter(n => !readIds.has(n.id)).length

  const openNotification = (item) => {
    markCommentsRead(userId, [item.id])
    setReadVersion(v => v + 1)
    onOpenNotification?.(item)
  }

  // "Tout effacer" ne supprime jamais le commentaire réel (visible côté plan) — seulement
  // sa présence dans CE flux de notifications, pour repartir d'une liste vide quand elle
  // devient trop longue à parcourir.
  const clearAllNotifications = () => {
    dismissComments(userId, visibleNotifications.map(n => n.id))
    setReadVersion(v => v + 1)
    setShowClearNotifs(false)
  }

  // Polling léger (toutes les 45s tant que cette page est ouverte) : va chercher côté
  // serveur les commentaires postés depuis un autre appareil, sur des espaces jamais
  // ouverts localement dans ce navigateur — sans ça, un commentaire posté ailleurs
  // resterait invisible ici tant qu'on n'a pas soi-même rouvert cet espace. Réservé à Pro
  // (voir tarification) : inutile d'interroger le serveur pour un flux qu'on n'affiche pas.
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
  }, [userId, teamIdsKey, lang, pro])

  // "Historique de tous les plans" regroupe tous les espaces — réservé à Pro (voir
  // tarification). En gratuit, on reste utile (gérer ses propres plans reste possible)
  // mais scopé au seul espace actif, sans agrégation cross-espaces ni appel serveur dédié.
  const refreshPlans = () => {
    if (!pro) { setPlans(getAllPlans()); return }
    const teamIds = teamIdsKey ? teamIdsKey.split(',') : []
    fetchAllPlansAggregated(userId, teamIds).then(setPlans)
  }
  useEffect(() => {
    if (!userId) return
    refreshPlans()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, teamIdsKey, pro])

  // Action différée demandée depuis ailleurs dans l'app (ex: la modal "limite de plans
  // gratuits atteinte") — ouvrir directement la modal Pro, ou défiler jusqu'à la liste des
  // plans, plutôt que de systématiquement atterrir en haut de la page (illisible : il
  // fallait scroller soi-même pour comprendre où était passé le crédit consommé).
  useEffect(() => {
    if (!pendingAction) return
    if (pendingAction === 'upgrade') {
      setShowUpgrade(true)
    } else if (pendingAction === 'plans') {
      setTimeout(() => {
        document.getElementById('account-plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
    onConsumeAction?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAction])

  // Le nom d'affichage d'un espace peut être celui actif (team.teamName) ou une autre
  // équipe dont on est membre (team.myTeams) — un plan de l'historique peut appartenir à
  // n'importe laquelle, pas seulement celle actuellement affichée dans le switcher.
  const spaceNameFor = (teamId) => {
    if (!teamId) return getPersonalSpace(userId, lang).name
    if (teamId === team.teamId) return team.teamName
    return team.myTeams?.find(tm => tm.id === teamId)?.name || t(lang, 'team.myTeams')
  }

  // Sortir un plan de son équipe active est réservé aux admins (même règle que la
  // suppression) ; le déplacer depuis le personnel n'a pas cette contrainte.
  const canMoveOut = !team.teamId || team.isAdmin
  const moveTargets = [
    ...(team.teamId ? [{ id: null, name: t(lang, 'plans.movePersonal') }] : []),
    ...(team.myTeams || []).filter(tm => tm.id !== team.teamId).map(tm => ({ id: tm.id, name: tm.name }))
  ]

  const confirmMovePlan = async (targetTeamId) => {
    const plan = movePlanTarget
    setMovePlanTarget(null)
    await movePlanToTeam(plan.id, targetTeamId)
    refreshPlans()
  }

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

  const used = getUsedCredits(userId)
  const remaining = remainingCredits(userId)

  const confirmRemovePlan = () => {
    deletePlan(deletePlanTarget.id)
    refreshPlans()
    setDeletePlanTarget(null)
  }

  const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || 'User'
  const email = user?.primaryEmailAddress?.emailAddress

  return (
    <div className="account-page">
      <button className="account-back-btn" onClick={onBack}>
        <IconArrowLeft width={16} height={16} /> {t(lang, 'account.backToApp')}
      </button>

      <div className="account-header card">
        <div className="account-avatar-wrap">
          <button className="account-avatar account-avatar-btn" onClick={() => setShowAvatarPicker(true)} title={t(lang, 'account.avatarChangeCta')}>
            {user?.imageUrl ? <img src={user.imageUrl} alt="" /> : <IconUser width={38} height={38} />}
          </button>
          {ProviderIcon && (
            <span className="account-provider-badge" title={authProvider}>
              <ProviderIcon width={14} height={14} />
            </span>
          )}
        </div>
        <div className="account-identity">
          <h2>{displayName}</h2>
          {email && <p className="account-email">{email}</p>}
          {isMockAuth && <span className="account-demo-badge">{t(lang, 'account.demoBadge')}</span>}
          <button className="account-avatar-cta" onClick={() => setShowAvatarPicker(true)}>{t(lang, 'account.avatarChangeCta')}</button>
        </div>
        <button className="btn-secondary" onClick={signOut}>{t(lang, 'auth.signOut')}</button>
      </div>

      {showAvatarPicker && <AvatarPicker lang={lang} onClose={() => setShowAvatarPicker(false)} />}

      {isMockAuth && <p className="account-demo-notice">{t(lang, 'auth.demoModeNotice')}</p>}

      <div className="account-credits card">
        <h3>{t(lang, 'account.creditsTitle')}</h3>
        {pro ? (
          <p className="credits-pro">{t(lang, 'account.creditsPro')}</p>
        ) : (
          <>
            <div className="credits-gauge">
              <div className="credits-gauge-bar">
                <div className="credits-gauge-fill" style={{ width: `${(used / FREE_PLAN_LIMIT) * 100}%` }} />
              </div>
              <span>{t(lang, 'account.creditsFree')(used, FREE_PLAN_LIMIT)}</span>
            </div>
            {remaining === 0 && (
              <>
                <p className="credits-exhausted">{t(lang, 'account.creditsExhausted')}</p>
                <button className="account-pro-cta" onClick={() => setShowUpgrade(true)}>
                  <IconRocket width={14} height={14} /> {t(lang, 'account.upgradeCta')}
                </button>
              </>
            )}
          </>
        )}
      </div>

      <div className="account-section card" id="account-notifications">
        <h3 className="account-section-title-row">
          <span>
            <IconMessageCircle width={16} height={16} /> {lang === 'fr' ? 'Notifications' : 'Notifications'}
            {!pro && <span className="export-pro-badge">PRO</span>}
            {pro && unreadNotifications > 0 && <span className="account-notif-count">{unreadNotifications}</span>}
          </span>
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
            {visibleNotifications.slice(0, 8).map(item => (
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

      <div className="account-section card" id="account-plans">
        <h3>
          <IconClipboard width={16} height={16} /> {t(lang, 'account.plansSectionTitle')}
          {!pro && <span className="export-pro-badge">PRO</span>}
        </h3>
        {!pro && <p className="account-security-note">{t(lang, 'account.plansFreeNote')}</p>}
        {plans.length === 0 ? (
          <p className="account-empty">{t(lang, 'account.noPlans')}</p>
        ) : (
          <div className="account-list">
            {plans.map(p => (
              <div key={p.id} className="account-list-item">
                <button className="account-list-item-main" onClick={() => onLoadPlan(p)}>
                  <span className="account-list-item-name">{p.product?.name}</span>
                  <span className="account-list-item-meta">{p.classification}</span>
                  <span className="plan-origin-tag">
                    <span className={`plan-origin-dot ${p.team_id ? 'is-team' : 'is-personal'}`} />
                    {spaceNameFor(p.team_id)}
                    {p.createdByName && ` · ${lang === 'fr' ? 'créé par' : 'created by'} ${p.createdByName}`}
                    {' · '}{formatFullDateTime(p.updatedAt || p.savedAt, lang)}
                  </span>
                </button>
                {(p.team_id || null) === (team.teamId || null) ? (
                  <>
                    {canMoveOut && moveTargets.length > 0 && (
                      <button className="account-list-item-move" onClick={() => setMovePlanTarget(p)} title={t(lang, 'plans.move')}>
                        {t(lang, 'plans.move')}
                      </button>
                    )}
                    <button className="account-list-item-delete" onClick={() => setDeletePlanTarget(p)} title="Delete">
                      <IconTrash width={14} height={14} />
                    </button>
                  </>
                ) : (
                  <span className="account-list-item-hint">
                    {lang === 'fr' ? 'Changez d\'espace pour gérer' : 'Switch space to manage'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {openSecurity && (
        <div className="account-section account-security card">
          <h3><IconShield width={16} height={16} /> {t(lang, 'account.securityTitle')}</h3>
          <p className="account-security-note">{t(lang, 'account.securityBody')}</p>
          <button className="btn-security" onClick={openSecurity}>{t(lang, 'account.securityCta')}</button>
        </div>
      )}

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

      {deletePlanTarget && (
        <div className="confirm-modal-backdrop" onClick={() => setDeletePlanTarget(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-icon"><IconAlertTriangle width={22} height={22} /></div>
            <h3>{t(lang, 'plans.deleteConfirmTitle')}</h3>
            <p><strong>{deletePlanTarget.product?.name || t(lang, 'plans.defaultPlanName')}</strong> {t(lang, 'plans.deleteConfirmSuffix')}</p>
            <div className="confirm-modal-actions">
              <button className="btn-secondary" onClick={() => setDeletePlanTarget(null)}>{t(lang, 'plans.cancel')}</button>
              <button className="btn-danger" onClick={confirmRemovePlan}>{t(lang, 'plans.delete')}</button>
            </div>
          </div>
        </div>
      )}

      {movePlanTarget && (
        <div className="confirm-modal-backdrop" onClick={() => setMovePlanTarget(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>{t(lang, 'plans.moveTitle')}</h3>
            <p><strong>{movePlanTarget.product?.name || t(lang, 'plans.defaultPlanName')}</strong></p>
            <p>{t(lang, 'plans.moveBody')}</p>
            <div className="move-target-list">
              {moveTargets.map(target => (
                <button key={target.id ?? 'personal'} className="move-target-btn" onClick={() => confirmMovePlan(target.id)}>
                  {target.name}
                </button>
              ))}
            </div>
            <div className="confirm-modal-actions">
              <button className="btn-secondary" onClick={() => setMovePlanTarget(null)}>{t(lang, 'plans.cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
