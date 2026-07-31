import { useState, useEffect } from 'react'
import { getAllPlans, deletePlan, createShareLink, getPlanById } from '../lib/planStorage'
import { t } from '../lib/i18n'
import InfoModal from './InfoModal'
import { IconClipboard, IconDownload, IconCheckCircle } from './Icons'
import '../styles/PlansHistory.css'

export default function PlansHistory({ lang, onLoadPlan, onClose }) {
  const [plans, setPlans] = useState([])
  const [shareLink, setShareLink] = useState(null)
  const [copiedShareId, setCopiedShareId] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  useEffect(() => {
    setPlans(getAllPlans())
  }, [])

  const handleDelete = (id) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id)
      return
    }
    deletePlan(id)
    setPlans(plans.filter(p => p.id !== id))
    setDeleteConfirmId(null)
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
    <InfoModal icon={<IconClipboard width={26} height={26} />} title="Vos plans de lancement" onClose={onClose} wide>
      <p className="plans-intro">Gérez vos plans générés et partagez-les avec votre équipe</p>

      <div className="plans-list">
        {plans.map(plan => (
          <div key={plan.id} className="plan-item">
            <div className="plan-info">
              <h3>{plan.product?.name || 'Plan sans titre'}</h3>
              <p className="plan-meta">
                Créé le {new Date(plan.savedAt).toLocaleDateString('fr-FR')}
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
              <button
                className={`btn-plan-danger ${deleteConfirmId === plan.id ? 'confirm' : ''}`}
                onClick={() => handleDelete(plan.id)}
                onBlur={() => setDeleteConfirmId(null)}
              >
                {deleteConfirmId === plan.id ? 'Confirmer ?' : 'Supprimer'}
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
  )
}
