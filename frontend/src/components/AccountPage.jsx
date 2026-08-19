import { useEffect, useState } from 'react'
import { t } from '../lib/i18n'
import { useUser, useAuth, useTeam, isMockAuth, useOpenSecurity, useAuthProvider } from '../lib/auth'
import { deletePlan, movePlanToTeam, fetchAllPlansAggregated, getAllPlans, toggleFavorite } from '../lib/planStorage'
import { FREE_PLAN_LIMIT, getUsedCredits, isPro, remainingCredits } from '../lib/creditTracker'
import { createCheckoutSession, isServerConfigured } from '../lib/serverStorage'
import { formatFullDateTime } from '../lib/dateFormat'
import { getPersonalSpace } from '../lib/personalSpace'
import { IconUser, IconClipboard, IconRocket, IconArrowLeft, IconTrash, IconShield, IconProviderGoogle, IconProviderApple, IconProviderSlack, IconAlertTriangle, IconX, IconBarChart, IconCrown } from './Icons'

const PROVIDER_ICONS = {
  google: IconProviderGoogle,
  apple: IconProviderApple,
  slack: IconProviderSlack
}
import AvatarPicker from './AvatarPicker'
import PricingCards from './PricingCards'
import { ContactModal } from './CompanyModals'
import ExportBrandingSection from './ExportBrandingSection'
import PrivacySection from './PrivacySection'
import '../styles/AccountPage.css'
import '../styles/SettingsPage.css'
import '../styles/SpacePage.css'

export default function AccountPage({ lang, onBack, onLoadPlan, onCreateTeam, pendingAction, onConsumeAction }) {
  const { user } = useUser()
  const { userId, signOut } = useAuth()
  const openSecurity = useOpenSecurity()
  const authProvider = useAuthProvider()
  const team = useTeam()
  const ProviderIcon = authProvider ? PROVIDER_ICONS[authProvider] : null
  const [plans, setPlans] = useState([])
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(false)
  const [deletePlanTarget, setDeletePlanTarget] = useState(null)
  const [movePlanTarget, setMovePlanTarget] = useState(null)

  const pro = isPro(userId)

  const teamIdsKey = (team.myTeams || []).map(tm => tm.id).join(',')

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

  // Mise à jour optimiste plutôt que refreshPlans() : en Pro, refreshPlans() relance un
  // aller-retour serveur (fetchAllPlansAggregated) dont le résultat peut ne pas encore
  // refléter l'écriture qu'on vient de faire (même risque de course que celui déjà corrigé
  // ailleurs pour la resync auto des plans) — ici la donnée à jour est déjà connue
  // localement, pas besoin de la redemander.
  const handleToggleFavorite = (e, plan) => {
    e.stopPropagation()
    toggleFavorite(plan)
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, isFavorite: !p.isFavorite } : p))
  }

  const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || 'User'
  const email = user?.primaryEmailAddress?.emailAddress

  return (
    <div className="account-page">
      <button className="account-back-btn" onClick={onBack}>
        <IconArrowLeft width={16} height={16} /> {t(lang, 'account.backToApp')}
      </button>

      <h2 className="settings-page-title"><IconUser width={20} height={20} /> {t(lang, 'auth.myAccount')}</h2>

      {!team.teamId && (
        <button className="account-section card space-page-upsell account-collab-cta" onClick={onCreateTeam}>
          <IconBarChart width={20} height={20} />
          <div>
            <h3>{lang === 'fr' ? 'Envie de collaborer ?' : 'Want to collaborate?'}</h3>
            <p>{lang === 'fr'
              ? 'Crée une équipe pour partager tes plans, commenter et assigner des tâches à plusieurs.'
              : 'Create a team to share your plans, comment and assign tasks with others.'}</p>
          </div>
        </button>
      )}

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
          <div className="credits-pro-badge">
            <span className="credits-pro-badge-icon"><IconCrown width={20} height={20} /></span>
            <div>
              <p className="credits-pro-badge-title">{t(lang, 'account.creditsProTitle')}</p>
              <p className="credits-pro-badge-subtitle">{t(lang, 'account.creditsProSubtitle')}</p>
            </div>
          </div>
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
                  <span className="account-list-item-name">
                    {p.product?.name}
                    {(p.isDemo || p.id?.startsWith('demo-')) && <span className="plan-demo-badge">{lang === 'fr' ? 'Démo' : 'Demo'}</span>}
                  </span>
                  <span className="account-list-item-meta">{p.classification}</span>
                  <span className="plan-origin-tag">
                    <span className={`plan-origin-dot ${p.team_id ? 'is-team' : 'is-personal'}`} />
                    {spaceNameFor(p.team_id)}
                    {p.createdByName && ` · ${lang === 'fr' ? 'créé par' : 'created by'} ${p.createdByName}`}
                    {' · '}{formatFullDateTime(p.updatedAt || p.savedAt, lang)}
                  </span>
                </button>
                <button
                  className={`account-list-item-favorite ${p.isFavorite ? 'is-favorite' : ''}`}
                  onClick={(e) => handleToggleFavorite(e, p)}
                  title={p.isFavorite ? t(lang, 'gallery.favoriteRemove') : t(lang, 'gallery.favoriteAdd')}
                >
                  {p.isFavorite ? '⭐' : '☆'}
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

      <ExportBrandingSection lang={lang} userId={userId} isPro={pro} onRequestUpgrade={() => setShowUpgrade(true)} />

      {openSecurity && (
        <div className="account-section account-security card">
          <h3><IconShield width={16} height={16} /> {t(lang, 'account.securityTitle')}</h3>
          <p className="account-security-note">{t(lang, 'account.securityBody')}</p>
          <button className="btn-security" onClick={openSecurity}>{t(lang, 'account.securityCta')}</button>
        </div>
      )}

      <PrivacySection lang={lang} userId={userId} />

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
