import { useState, useEffect } from 'react'
import { getAllDrafts, deleteDraft, renameDraft } from '../lib/draftStorage'
import { t } from '../lib/i18n'
import { formatDateTime } from '../lib/dateFormat'
import { IconPencil } from './Icons'
import '../styles/DraftsModal.css'

export default function DraftsModal({ lang, onLoadDraft, onClose }) {
  const [drafts, setDrafts] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  useEffect(() => {
    setDrafts(getAllDrafts())
  }, [])

  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce brouillon?')) {
      deleteDraft(id)
      setDrafts(drafts.filter(d => d.id !== id))
    }
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
                <button className="btn-small danger" onClick={() => handleDelete(draft.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-secondary close-btn" onClick={onClose}>Fermer</button>
      </div>
    </div>
  )
}
