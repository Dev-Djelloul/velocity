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
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  useEffect(() => {
    setDrafts(getAllDrafts())
  }, [])

  const handleDelete = (id) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id)
      return
    }
    deleteDraft(id)
    setDrafts(drafts.filter(d => d.id !== id))
    setDeleteConfirmId(null)
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
    // _draftId voyage avec les données pour que Questionnaire sache quel brouillon mettre à
    // jour au prochain "Continuer plus tard", plutôt que d'en recréer un nouveau.
    if (onLoadDraft) onLoadDraft({ ...draft.data, _draftId: draft.id })
    onClose()
  }

  if (drafts.length === 0) {
    return (
      <div className="drafts-modal-backdrop" onClick={onClose}>
        <div className="drafts-modal" onClick={e => e.stopPropagation()}>
          <button className="drafts-modal-close" onClick={onClose} aria-label={t(lang, 'drafts.close')}>×</button>
          <div className="drafts-modal-empty">
            <h2>{t(lang, 'drafts.title')}</h2>
            <p className="empty-state">{t(lang, 'drafts.emptyText')}</p>
            <button className="btn-primary" onClick={onClose}>{t(lang, 'drafts.close')}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="drafts-modal-backdrop" onClick={onClose}>
      <div className="drafts-modal" onClick={e => e.stopPropagation()}>
        <button className="drafts-modal-close" onClick={onClose} aria-label={t(lang, 'drafts.close')}>×</button>
        <div className="drafts-modal-header">
          <h2>{t(lang, 'drafts.title')}</h2>
          <p>{t(lang, 'drafts.subtitle')}</p>
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
                      {t(lang, 'drafts.updatedAtPrefix')} {formatDateTime(draft.updatedAt, lang)}
                    </p>
                  </>
                )}
              </div>

              {editingId !== draft.id && (
                <div className="draft-actions">
                  <button className="btn-small" onClick={() => handleLoad(draft)}>
                    {t(lang, 'drafts.load')}
                  </button>
                  <button className="btn-small" onClick={() => {
                    setEditingId(draft.id)
                    setEditingName(draft.name)
                  }}>
                    <IconPencil width={14} height={14} /> {t(lang, 'drafts.rename')}
                  </button>
                  <button
                    className={`btn-small danger ${deleteConfirmId === draft.id ? 'confirm' : ''}`}
                    onClick={() => handleDelete(draft.id)}
                    onBlur={() => setDeleteConfirmId(null)}
                  >
                    {deleteConfirmId === draft.id ? t(lang, 'drafts.confirmDelete') : t(lang, 'drafts.delete')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="btn-secondary close-btn" onClick={onClose}>{t(lang, 'drafts.close')}</button>
      </div>
    </div>
  )
}
