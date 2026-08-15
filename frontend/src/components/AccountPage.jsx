import { useState } from 'react'
import { t } from '../lib/i18n'
import { useUser, useAuth, useTeam, isMockAuth, useOpenSecurity, useAuthProvider } from '../lib/auth'
import { getAllPlans, deletePlan, movePlanToTeam } from '../lib/planStorage'
import { getAllDrafts, deleteDraft } from '../lib/draftStorage'
import { FREE_PLAN_LIMIT, getUsedCredits, isPro, remainingCredits } from '../lib/creditTracker'
import { createCheckoutSession, isServerConfigured } from '../lib/serverStorage'
import { IconUser, IconClipboard, IconSave, IconRocket, IconArrowLeft, IconTrash, IconShield, IconProviderGoogle, IconProviderApple, IconProviderSlack, IconAlertTriangle } from './Icons'

const PROVIDER_ICONS = {
  google: IconProviderGoogle,
  apple: IconProviderApple,
  slack: IconProviderSlack
}
import AvatarPicker from './AvatarPicker'
import '../styles/AccountPage.css'

export default function AccountPage({ lang, onBack, onLoadPlan, onLoadDraft }) {
  const { user } = useUser()
  const { userId, signOut } = useAuth()
  const openSecurity = useOpenSecurity()
  const authProvider = useAuthProvider()
  const team = useTeam()
  const ProviderIcon = authProvider ? PROVIDER_ICONS[authProvider] : null
  const [plans, setPlans] = useState(getAllPlans)
  const [drafts, setDrafts] = useState(getAllDrafts)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(false)
  const [deletePlanTarget, setDeletePlanTarget] = useState(null)
  const [deleteDraftTarget, setDeleteDraftTarget] = useState(null)
  const [movePlanTarget, setMovePlanTarget] = useState(null)

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
    setPlans(getAllPlans())
  }

  const startCheckout = async () => {
    setCheckoutLoading(true)
    setCheckoutError(false)
    const result = await createCheckoutSession(userId, user?.primaryEmailAddress?.emailAddress)
    if (result?.url) {
      window.location.href = result.url
      return
    }
    setCheckoutLoading(false)
    setCheckoutError(true)
  }

  const pro = isPro(userId)
  const used = getUsedCredits(userId)
  const remaining = remainingCredits(userId)

  const confirmRemovePlan = () => {
    deletePlan(deletePlanTarget.id)
    setPlans(getAllPlans())
    setDeletePlanTarget(null)
  }

  const confirmRemoveDraft = () => {
    deleteDraft(deleteDraftTarget.id)
    setDrafts(getAllDrafts())
    setDeleteDraftTarget(null)
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
            {remaining === 0 && <p className="credits-exhausted">{t(lang, 'account.creditsExhausted')}</p>}
            <button className="btn-primary upgrade-btn" onClick={() => setShowUpgrade(true)}>
              <IconRocket width={14} height={14} /> {t(lang, 'account.upgradeCta')}
            </button>
          </>
        )}
      </div>

      <div className="account-section card">
        <h3><IconClipboard width={16} height={16} /> {t(lang, 'account.plansSectionTitle')}</h3>
        {plans.length === 0 ? (
          <p className="account-empty">{t(lang, 'account.noPlans')}</p>
        ) : (
          <div className="account-list">
            {plans.map(p => (
              <div key={p.id} className="account-list-item">
                <button className="account-list-item-main" onClick={() => onLoadPlan(p)}>
                  <span className="account-list-item-name">{p.product?.name}</span>
                  <span className="account-list-item-meta">{p.classification}</span>
                </button>
                {canMoveOut && moveTargets.length > 0 && (
                  <button className="account-list-item-move" onClick={() => setMovePlanTarget(p)} title={t(lang, 'plans.move')}>
                    {t(lang, 'plans.move')}
                  </button>
                )}
                <button className="account-list-item-delete" onClick={() => setDeletePlanTarget(p)} title="Delete">
                  <IconTrash width={14} height={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="account-section card">
        <h3><IconSave width={16} height={16} /> {t(lang, 'account.draftsSectionTitle')}</h3>
        {drafts.length === 0 ? (
          <p className="account-empty">{t(lang, 'account.noDrafts')}</p>
        ) : (
          <div className="account-list">
            {drafts.map(d => (
              <div key={d.id} className="account-list-item">
                <button className="account-list-item-main" onClick={() => onLoadDraft(d.data)}>
                  <span className="account-list-item-name">{d.name}</span>
                </button>
                <button className="account-list-item-delete" onClick={() => setDeleteDraftTarget(d)} title="Delete">
                  <IconTrash width={14} height={14} />
                </button>
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
          <div className="modal card" onClick={e => e.stopPropagation()}>
            <h3>{t(lang, 'account.upgradeTitle')}</h3>
            <p>{t(lang, 'account.upgradeBody')}</p>
            {!isServerConfigured && <p className="upgrade-note">{t(lang, 'account.upgradeNote')}</p>}
            {checkoutError && <p className="upgrade-note">{t(lang, 'account.upgradeError')}</p>}
            <div className="modal-actions">
              <button
                className="btn-primary"
                disabled={!isServerConfigured || checkoutLoading}
                onClick={startCheckout}
              >
                {checkoutLoading ? t(lang, 'account.upgradeLoading') : t(lang, 'account.upgradeConfirm')}
              </button>
            </div>
            <button className="btn-secondary close-btn" onClick={() => setShowUpgrade(false)}>
              {t(lang, 'export.close')}
            </button>
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

      {deleteDraftTarget && (
        <div className="confirm-modal-backdrop" onClick={() => setDeleteDraftTarget(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-icon"><IconAlertTriangle width={22} height={22} /></div>
            <h3>{t(lang, 'plans.deleteDraftConfirmTitle')}</h3>
            <p><strong>{deleteDraftTarget.name || t(lang, 'plans.defaultDraftName')}</strong> {t(lang, 'plans.deleteDraftConfirmSuffix')}</p>
            <div className="confirm-modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteDraftTarget(null)}>{t(lang, 'plans.cancel')}</button>
              <button className="btn-danger" onClick={confirmRemoveDraft}>{t(lang, 'plans.delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
