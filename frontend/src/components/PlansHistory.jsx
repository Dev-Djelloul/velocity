import { useState, useEffect } from 'react'
import { getAllPlans, deletePlan, createShareLink, getPlanById } from '../lib/planStorage'
import { t } from '../lib/i18n'
import { formatDateTime } from '../lib/dateFormat'
import InfoModal from './InfoModal'
import { IconClipboard, IconDownload, IconCheckCircle, IconAlertTriangle } from './Icons'
import '../styles/PlansHistory.css'

export default function PlansHistory({ lang, onLoadPlan, onClose }) {
  const [plans, setPlans] = useState([])
  const [shareLink, setShareLink] = useState(null)
  const [copiedShareId, setCopiedShareId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    setPlans(getAllPlans())
  }, [])

  const confirmDelete = () => {
    deletePlan(deleteTarget.id)
    setPlans(plans.filter(p => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const handleShare = (planId) => {
    const shareId = createShareLink(planId)
    const url = `${window.location.origin}${window.location.pathname}?share=${shareId}`
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

  if (plans.length === 0) {
    return (
      <InfoModal icon={<IconClipboard width={26} height={26} />} title="Historique des plans" onClose={onClose}>
        <p className="plans-empty-state">Vous n'avez pas encore généré de plan. Commencez par en créer un !</p>
      </InfoModal>
    )
  }

  return (
    <>
    <InfoModal icon={<IconClipboard width={26} height={26} />} title="Vos plans de lancement" onClose={onClose} wide>
      <p className="plans-intro">Gérez vos plans générés et partagez-les avec votre équipe</p>

      <div className="plans-list">
        {plans.map(plan => (
          <div key={plan.id} className="plan-item">
            <div className="plan-info">
              <h3>{plan.product?.name || 'Plan sans titre'}</h3>
              <p className="plan-meta">
                Créé le {formatDateTime(plan.savedAt, lang)}
              </p>
              {plan.classification && (
                <p className="plan-type">{plan.classification}</p>
              )}
            </div>

            <div className="plan-actions">
              <button className="btn-secondary" onClick={() => handleLoad(plan)}>
                Charger
              </button>
              <button className="btn-secondary" onClick={() => handleShare(plan.id)}>
                Partager
              </button>
              <button className="btn-plan-danger" onClick={() => setDeleteTarget(plan)}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {shareLink && (
        <div className="share-section">
          <h3><IconDownload width={16} height={16} /> Lien de partage</h3>
          <div className="share-link-group">
            <input type="text" value={shareLink.url} readOnly />
            <button
              className="btn-secondary"
              onClick={() => copyToClipboard(shareLink.url)}
            >
              {copiedShareId === shareLink.url ? <><IconCheckCircle width={14} height={14} /> Copié</> : 'Copier'}
            </button>
          </div>
          <p className="share-note">Ce lien expire dans 30 jours</p>
        </div>
      )}
    </InfoModal>

    {deleteTarget && (
      <div className="confirm-modal-backdrop" onClick={() => setDeleteTarget(null)}>
        <div className="confirm-modal" onClick={e => e.stopPropagation()}>
          <div className="confirm-modal-icon"><IconAlertTriangle width={22} height={22} /></div>
          <h3>Supprimer ce plan ?</h3>
          <p><strong>{deleteTarget.product?.name || 'Ce plan'}</strong> sera définitivement supprimé. Cette action est irréversible.</p>
          <div className="confirm-modal-actions">
            <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Annuler</button>
            <button className="btn-danger" onClick={confirmDelete}>Supprimer</button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
