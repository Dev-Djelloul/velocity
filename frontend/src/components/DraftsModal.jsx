import { useState, useEffect } from 'react'
import { getAllDrafts, deleteDraft, renameDraft } from '../lib/draftStorage'
import { t } from '../lib/i18n'
import { formatDateTime } from '../lib/dateFormat'
import { IconPencil, IconAlertTriangle } from './Icons'
import '../styles/DraftsModal.css'

export default function DraftsModal({ lang, onLoadDraft, onClose }) {
  const [drafts, setDrafts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    setDrafts(getAllDrafts())
  }, [])

  const confirmDelete = () => {
    deleteDraft(deleteTarget.id)
    setDrafts(drafts.filter(d => d.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const handleRename = (id) => {
    if (editingName.trim()) {
      renameDraft(id, editingName)
      const updated = getAllDrafts()
      setDrafts(updated)
    }
    setEditingId(null)
  }

  const handleLoad = (draft) => {
    if (onLoadDraft) onLoadDraft(draft.data)
    onClose()
  }

  if (drafts.length === 0) {
    return (
      <div className="drafts-modal-backdrop" onClick={onClose}>
        <div className="drafts-modal" onClick={e => e.stopPropagation()}>
          <button className="drafts-modal-close" onClick={onClose} aria-label="Fermer">×</button>
          <h2>Mes brouillons</h2>
          <p className="empty-state">Aucun brouillon sauvegardé. Créez-en un pour continuer plus tard!</p>
          <button className="btn-primary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    )
  }

  return (
    <div className="drafts-modal-backdrop" onClick={onClose}>
      <div className="drafts-modal" onClick={e => e.stopPropagation()}>
        <button className="drafts-modal-close" onClick={onClose} aria-label="Fermer">×</button>
        <div className="drafts-modal-header">
          <h2>Mes brouillons</h2>
          <p>Continuez vos réponses là où vous les aviez laissées</p>
        </div>

        <div className="drafts-list">
          {drafts.map(draft => (
            <div key={draft.id} className="draft-item">
              <div className="draft-info">
                {editingId === draft.id ? (
                  <div className="draft-edit">
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleRename(draft.id)}
                      autoFocus
                    />
                    <button className="btn-small" onClick={() => handleRename(draft.id)}>✓</button>
                    <button className="btn-small" onClick={() => setEditingId(null)}>✕</button>
                  </div>
                ) : (
                  <>
                    <h3>{draft.name}</h3>
                    <p className="draft-meta">
                      Modifié le {formatDateTime(draft.updatedAt, lang)}
                    </p>
                  </>
                )}
              </div>

              <div className="draft-actions">
                <button className="btn-small" onClick={() => handleLoad(draft)}>
                  Charger
                </button>
                <button className="btn-small" onClick={() => {
                  setEditingId(draft.id)
                  setEditingName(draft.name)
                }}>
                  <IconPencil width={14} height={14} /> Renommer
                </button>
                <button className="btn-small danger" onClick={() => setDeleteTarget(draft)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-secondary close-btn" onClick={onClose}>Fermer</button>
      </div>

      {deleteTarget && (
        <div className="confirm-modal-backdrop" onClick={e => { e.stopPropagation(); setDeleteTarget(null) }}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-icon"><IconAlertTriangle width={22} height={22} /></div>
            <h3>Supprimer ce brouillon ?</h3>
            <p><strong>{deleteTarget.name}</strong> sera définitivement supprimé. Cette action est irréversible.</p>
            <div className="confirm-modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button className="btn-danger" onClick={confirmDelete}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
