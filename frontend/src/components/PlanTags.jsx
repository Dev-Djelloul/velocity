import { useState, useRef, useEffect } from 'react'
import { addTag, removeTag } from '../lib/planStorage'
import { t } from '../lib/i18n'
import { IconX } from './Icons'
import '../styles/PlanTags.css'

// Éditeur de tags réutilisé dans "Mes plans" (PlansHistory) et "Ma galerie" (GalleryPage) —
// même donnée (plan.tags), même circuit savePlan() qu'isFavorite/inGallery, pas de composant
// dédié par écran pour éviter que les deux dérivent avec le temps.
export default function PlanTags({ plan, lang, onChange, compact }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  const commit = () => {
    const value = draft.trim()
    if (value) {
      const updated = addTag(plan, value)
      onChange?.(updated)
    }
    setDraft('')
    setEditing(false)
  }

  const handleRemove = (e, tag) => {
    e.preventDefault()
    e.stopPropagation()
    const updated = removeTag(plan, tag)
    onChange?.(updated)
  }

  const tags = plan.tags || []

  return (
    <div className={`plan-tags${compact ? ' plan-tags-compact' : ''}`} onClick={e => e.stopPropagation()}>
      {tags.map(tag => (
        <span className="plan-tag-chip" key={tag}>
          {tag}
          <button type="button" className="plan-tag-remove" onClick={(e) => handleRemove(e, tag)} aria-label={t(lang, 'tags.remove')}>
            <IconX width={9} height={9} />
          </button>
        </span>
      ))}
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          className="plan-tag-input"
          value={draft}
          maxLength={24}
          placeholder={t(lang, 'tags.addPlaceholder')}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Enter') { e.preventDefault(); commit() }
            if (e.key === 'Escape') { e.preventDefault(); setDraft(''); setEditing(false) }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        tags.length < 10 && (
          <button type="button" className="plan-tag-add" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditing(true) }}>
            + {t(lang, 'tags.add')}
          </button>
        )
      )}
    </div>
  )
}
