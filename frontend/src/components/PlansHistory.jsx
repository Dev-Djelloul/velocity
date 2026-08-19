import { useState, useEffect } from 'react'
import { getAllPlans, deletePlan, createShareLink, getPlanById, duplicatePlan, savePlan } from '../lib/planStorage'
import { t } from '../lib/i18n'
import { formatDateTime } from '../lib/dateFormat'
import InfoModal from './InfoModal'
import { IconClipboard, IconDownload, IconCheckCircle, IconAlertTriangle, IconCopy, IconPencil } from './Icons'
import '../styles/PlansHistory.css'

export default function PlansHistory({ lang, onLoadPlan, onClose }) {
  const [plans, setPlans] = useState([])
  const [shareLink, setShareLink] = useState(null)
  const [copiedShareId, setCopiedShareId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    setPlans(getAllPlans())
  }, [])

  const confirmDelete = () => {
    deletePlan(deleteTarget.id)
    setPlans(plans.filter(p => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const handleShare = async (planId) => {
    const shareId = await createShareLink(planId)
    // URL "jolie" /s/:id (plutôt que ?share=) : interceptée par une Cloudflare Pages
    // Function (voir frontend/functions/s/[id].js) qui injecte les meta og:image/og:title
    // avant que les robots LinkedIn/Twitter (qui n'exécutent jamais le JS) ne lisent le HTML.
    const url = `${window.location.origin}/s/${shareId}`
    setShareLink({ planId, shareId, url })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedShareId(text)
    setTimeout(() => setCopiedShareId(null), 2000)
  }

  const handleLoad = (plan) => {
    if (onLoadPlan) onLoadPlan(plan)
    onClose()
  }

  const handleDuplicate = (plan) => {
    const copy = duplicatePlan(plan, lang)
    setPlans(getAllPlans())
    if (onLoadPlan) onLoadPlan(copy)
    onClose()
  }

  const startRename = (plan) => {
    setEditingId(plan.id)
    setEditValue(plan.product?.name || '')
  }

  const commitRename = (plan) => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== plan.product?.name) {
      savePlan({ ...plan, product: { ...plan.product, name: trimmed } })
      setPlans(getAllPlans())
    }
    setEditingId(null)
  }

  if (plans.length === 0) {
    return (
      <InfoModal icon={<IconClipboard width={26} height={26} />} title={t(lang, 'plans.emptyTitle')} onClose={onClose}>
        <p className="plans-empty-state">{t(lang, 'plans.emptyText')}</p>
      </InfoModal>
    )
  }

  return (
    <>
    <InfoModal icon={<IconClipboard width={26} height={26} />} title={t(lang, 'plans.title')} onClose={onClose} wide>
      <p className="plans-intro">{t(lang, 'plans.intro')}</p>

      <div className="plans-list">
        {plans.map(plan => (
          <div key={plan.id} className="plan-item">
            <div className="plan-item-lead">
            {plan.coverImage
              ? <img src={plan.coverImage} alt="" className="plan-item-thumb" />
              : <div className="plan-item-thumb plan-item-thumb-placeholder" aria-hidden="true" />}
            <div className="plan-info">
              {editingId === plan.id ? (
                <input
                  type="text"
                  className="plan-name-input"
                  value={editValue}
                  autoFocus
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => commitRename(plan)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); commitRename(plan) }
                    if (e.key === 'Escape') { e.preventDefault(); setEditingId(null) }
                  }}
                />
              ) : (
                <h3 className="plan-name-row">
                  <span className="plan-name-text">{plan.product?.name || t(lang, 'plans.untitled')}</span>
                  <button className="plan-rename-btn" title={lang === 'fr' ? 'Renommer' : 'Rename'} onClick={() => startRename(plan)}>
                    <IconPencil width={12} height={12} />
                  </button>
                  {(plan.isDemo || plan.id?.startsWith('demo-')) && <span className="plan-demo-badge">{lang === 'fr' ? 'Démo' : 'Demo'}</span>}
                </h3>
              )}
              <p className="plan-meta">
                {t(lang, 'plans.createdAtPrefix')} {formatDateTime(plan.savedAt, lang)}
              </p>
              {plan.classification && (
                <p className="plan-type">{plan.classification}</p>
              )}
            </div>
            </div>

            <div className="plan-actions">
              <button className="btn-secondary" onClick={() => handleLoad(plan)}>
                {t(lang, 'plans.load')}
              </button>
              <button className="btn-secondary" onClick={() => handleShare(plan.id)}>
                {t(lang, 'plans.share')}
              </button>
              <button className="btn-secondary" onClick={() => handleDuplicate(plan)}>
                <IconCopy width={13} height={13} /> {t(lang, 'plans.duplicate')}
              </button>
              <button className="btn-plan-danger" onClick={() => setDeleteTarget(plan)}>
                {t(lang, 'plans.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {shareLink && (
        <div className="share-section">
          <h3><IconDownload width={16} height={16} /> {t(lang, 'plans.shareLinkHeading')}</h3>
          <div className="share-link-group">
            <input type="text" value={shareLink.url} readOnly />
            <button
              className="btn-secondary"
              onClick={() => copyToClipboard(shareLink.url)}
            >
              {copiedShareId === shareLink.url ? <><IconCheckCircle width={14} height={14} /> {t(lang, 'plans.copied')}</> : t(lang, 'plans.copy')}
            </button>
          </div>
          <p className="share-note">{t(lang, 'plans.shareExpiry')}</p>
        </div>
      )}
    </InfoModal>

    {deleteTarget && (
      <div className="confirm-modal-backdrop" onClick={() => setDeleteTarget(null)}>
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
          <div className="confirm-modal-icon"><IconAlertTriangle width={22} height={22} /></div>
          <h3>{t(lang, 'plans.deleteConfirmTitle')}</h3>
          <p><strong>{deleteTarget.product?.name || t(lang, 'plans.defaultPlanName')}</strong> {t(lang, 'plans.deleteConfirmSuffix')}</p>
          <div className="confirm-modal-actions">
            <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>{t(lang, 'plans.cancel')}</button>
            <button className="btn-danger" onClick={confirmDelete}>{t(lang, 'plans.delete')}</button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
