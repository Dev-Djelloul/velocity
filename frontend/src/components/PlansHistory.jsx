import { useState, useEffect } from 'react'
import { getAllPlans, deletePlan, createShareLink, getPlanById } from '../lib/planStorage'
import { t } from '../lib/i18n'
import '../styles/PlansHistory.css'

export default function PlansHistory({ lang, onLoadPlan, onClose }) {
  const [plans, setPlans] = useState([])
  const [shareLink, setShareLink] = useState(null)
  const [copiedShareId, setCopiedShareId] = useState(null)

  useEffect(() => {
    setPlans(getAllPlans())
  }, [])

  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plan?')) {
      deletePlan(id)
      setPlans(plans.filter(p => p.id !== id))
    }
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
      <div className="modal-backdrop" onClick={onClose}>
        <div className="plans-modal card" onClick={e => e.stopPropagation()}>
          <h2>Historique des plans</h2>
          <p className="empty-state">Vous n'avez pas encore générée de plans. Commencez par en créer un!</p>
          <button className="btn-primary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="plans-modal card" onClick={e => e.stopPropagation()}>
        <div className="plans-modal-header">
          <h2>Vos plans de lancement</h2>
          <p>Gérez vos plans générés et partagez-les avec votre équipe</p>
        </div>

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
                <button className="btn-small" onClick={() => handleLoad(plan)}>
                  Charger
                </button>
                <button className="btn-small" onClick={() => handleShare(plan.id)}>
                  Partager
                </button>
                <button className="btn-small danger" onClick={() => handleDelete(plan.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {shareLink && (
          <div className="share-section">
            <h3>Lien de partage</h3>
            <div className="share-link-group">
              <input type="text" value={shareLink.url} readOnly />
              <button
                className="btn-small"
                onClick={() => copyToClipboard(shareLink.url)}
              >
                {copiedShareId === shareLink.url ? '✓ Copié' : 'Copier'}
              </button>
            </div>
            <p className="share-note">Ce lien expire dans 30 jours</p>
          </div>
        )}

        <button className="btn-secondary close-btn" onClick={onClose}>Fermer</button>
      </div>
    </div>
  )
}
