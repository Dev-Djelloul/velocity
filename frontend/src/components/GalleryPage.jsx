import { useEffect, useMemo, useRef, useState } from 'react'
import { t } from '../lib/i18n'
import { getAllPlans, toggleFavorite, savePlan, createShareLink, duplicatePlan, deletePlan } from '../lib/planStorage'
import { IconClipboard, IconSparkle, IconExternalLink, IconLink, IconCopy, IconTrash, IconX, IconAlertTriangle, IconPencil, IconSearch } from './Icons'
import PlanTags from './PlanTags'
import '../styles/GalleryPage.css'
import '../styles/PlansHistory.css'

// Galerie privée : vue en grille des plans que l'utilisateur a explicitement épinglés
// (plan.inGallery, bouton "Ajouter à la galerie" dans PlanViewer) — opt-in, pas une liste
// automatique de tous ses plans (voir "Mes plans"/PlansHistory pour ça). Aucune donnée
// n'est exposée publiquement, tout passe par getAllPlans(), scopée par utilisateur+espace
// côté planStorage.
export default function GalleryPage({ lang, onOpenPlan }) {
  const [plans, setPlans] = useState(() => getAllPlans())
  const [contextMenu, setContextMenu] = useState(null) // { plan, x, y }
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState(null)
  const [renameTarget, setRenameTarget] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTag, setActiveTag] = useState(null)
  const menuRef = useRef(null)

  useEffect(() => {
    setPlans(getAllPlans())
  }, [])

  const galleryPlans = useMemo(() => {
    return plans.filter(p => p.inGallery).sort((a, b) => {
      if (!!b.isFavorite !== !!a.isFavorite) return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)
      return (b.updatedAt || b.savedAt || '').localeCompare(a.updatedAt || a.savedAt || '')
    })
  }, [plans])

  const allTags = useMemo(() => {
    const set = new Set()
    galleryPlans.forEach(p => (p.tags || []).forEach(tag => set.add(tag)))
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [galleryPlans])

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const visibleGalleryPlans = useMemo(() => {
    return galleryPlans.filter(p => {
      if (activeTag && !(p.tags || []).includes(activeTag)) return false
      if (!normalizedQuery) return true
      const name = p.product?.name || t(lang, 'plans.untitled')
      return name.toLowerCase().includes(normalizedQuery)
        || p.classification?.toLowerCase().includes(normalizedQuery)
        || (p.tags || []).some(tag => tag.toLowerCase().includes(normalizedQuery))
    })
  }, [galleryPlans, normalizedQuery, activeTag, lang])

  const handleTagsChange = (updatedPlan) => {
    if (!updatedPlan) return
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p))
  }

  // Ferme le menu contextuel au premier clic ailleurs, à l'échappement, ou si la fenêtre
  // défile/redimensionne — sans ça il resterait affiché à des coordonnées qui ne
  // correspondent plus à rien.
  useEffect(() => {
    if (!contextMenu) return
    // mousedown (pas click) : un clic sur un item du menu déclenche d'abord mousedown, qui
    // fermerait le menu et démonterait le bouton avant que son propre onClick n'ait la
    // moindre chance de se déclencher — d'où le "stopPropagation()" sur l'onClick du menu
    // (voir plus bas) qui ne suffisait pas. On ignore ici tout mousedown qui tombe dans le
    // menu lui-même (menuRef), et on ne ferme que pour un clic réellement extérieur.
    const close = (e) => {
      if (menuRef.current && e && menuRef.current.contains(e.target)) return
      setContextMenu(null)
    }
    const onKeyDown = (e) => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [contextMenu])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(timer)
  }, [toast])

  const openContextMenu = (e, plan) => {
    e.preventDefault()
    // Le menu se dessine hors-écran une frame pour mesurer sa vraie taille (largeur/hauteur
    // variables selon la langue), sinon impossible de le caler proprement contre les bords
    // droit/bas de la fenêtre pour un clic proche d'un coin.
    setContextMenu({ plan, x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    if (!contextMenu || !menuRef.current) return
    const menu = menuRef.current
    const { innerWidth, innerHeight } = window
    const rect = menu.getBoundingClientRect()
    let x = contextMenu.x
    let y = contextMenu.y
    if (x + rect.width > innerWidth - 8) x = innerWidth - rect.width - 8
    if (y + rect.height > innerHeight - 8) y = innerHeight - rect.height - 8
    menu.style.left = `${Math.max(8, x)}px`
    menu.style.top = `${Math.max(8, y)}px`
  }, [contextMenu])

  const handleToggleFavorite = (e, plan) => {
    e.stopPropagation()
    toggleFavorite(plan)
    setPlans(getAllPlans())
  }

  const closeMenu = () => setContextMenu(null)

  const handleShare = async (plan) => {
    closeMenu()
    const shareId = await createShareLink(plan.id)
    if (!shareId) return
    const url = `${window.location.origin}/s/${shareId}`
    try {
      await navigator.clipboard.writeText(url)
      setToast(t(lang, 'gallery.linkCopied'))
    } catch { /* clipboard indisponible, on ignore silencieusement */ }
  }

  const handleDuplicate = (plan) => {
    closeMenu()
    duplicatePlan(plan, lang)
    setPlans(getAllPlans())
    setToast(t(lang, 'gallery.duplicated'))
  }

  const handleRemoveFromGallery = (plan) => {
    closeMenu()
    savePlan({ ...plan, inGallery: false })
    setPlans(getAllPlans())
  }

  const confirmDelete = () => {
    deletePlan(deleteTarget.id)
    setPlans(getAllPlans())
    setDeleteTarget(null)
  }

  // Renommer passe par une modale dédiée (déclenchée depuis le menu contextuel) plutôt
  // qu'une édition inline directement dans la carte : la carte entière est un <button>
  // (pour le clic = ouvrir le plan), et un <input> imbriqué dans un <button> se comporte de
  // façon peu fiable selon les navigateurs — le clic pour lancer l'édition finissait par
  // aussi déclencher l'ouverture du plan. Un menu contextuel externe n'a pas ce problème.
  const openRenameModal = (plan) => {
    closeMenu()
    setRenameTarget(plan)
    setEditValue(plan.product?.name || '')
  }

  const commitRename = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== renameTarget.product?.name) {
      savePlan({ ...renameTarget, product: { ...renameTarget.product, name: trimmed } })
      setPlans(getAllPlans())
    }
    setRenameTarget(null)
  }

  return (
    <div className="gallery-page">
      <div className="gallery-page-header">
        <h1><IconSparkle width={22} height={22} /> {t(lang, 'gallery.title')}</h1>
        <p className="gallery-page-subtitle">{t(lang, 'gallery.subtitle')}</p>
      </div>

      {galleryPlans.length === 0 && (
        <div className="gallery-empty-state">
          <IconClipboard width={28} height={28} />
          <p>{t(lang, 'gallery.empty')}</p>
        </div>
      )}

      {galleryPlans.length > 3 && (
        <div className="plans-search gallery-search">
          <IconSearch width={15} height={15} className="plans-search-icon" />
          <input
            type="text"
            className="plans-search-input"
            placeholder={t(lang, 'plans.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="plans-search-clear" onClick={() => setSearchQuery('')} title={t(lang, 'plans.cancel')}>
              <IconX width={13} height={13} />
            </button>
          )}
        </div>
      )}

      {allTags.length > 0 && (
        <div className="tag-filter-row gallery-search">
          <button
            type="button"
            className={`tag-filter-chip${!activeTag ? ' active' : ''}`}
            onClick={() => setActiveTag(null)}
          >
            {t(lang, 'tags.filterAll')}
          </button>
          {allTags.map(tag => (
            <button
              type="button"
              key={tag}
              className={`tag-filter-chip${activeTag === tag ? ' active' : ''}`}
              onClick={() => setActiveTag(prev => prev === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {!!galleryPlans.length && visibleGalleryPlans.length === 0 && (
        <p className="plans-empty-state">{t(lang, 'plans.noSearchResults')}</p>
      )}

      {!!visibleGalleryPlans.length && (
        <div className="gallery-grid">
          {visibleGalleryPlans.map(p => (
            <div key={p.id} className="gallery-card-wrap">
              <button
                className={`gallery-card${p.isFavorite ? ' gallery-card-featured' : ''}`}
                onClick={() => onOpenPlan(p)}
                onContextMenu={(e) => openContextMenu(e, p)}
              >
                <span
                  className="gallery-card-favorite-toggle"
                  role="button"
                  tabIndex={0}
                  title={p.isFavorite ? t(lang, 'gallery.favoriteRemove') : t(lang, 'gallery.favoriteAdd')}
                  onClick={(e) => handleToggleFavorite(e, p)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleToggleFavorite(e, p) }}
                >
                  {p.isFavorite ? '⭐' : '☆'}
                </span>
                {p.coverImage
                  ? <img src={p.coverImage} alt="" className="gallery-card-cover" />
                  : <div className="gallery-card-cover gallery-card-cover-placeholder" aria-hidden="true" />}
                <div className="gallery-card-body">
                  <h3>
                    {p.product?.name || t(lang, 'plans.untitled')}
                    {(p.isDemo || p.id?.startsWith('demo-')) && <span className="plan-demo-badge">{lang === 'fr' ? 'Démo' : 'Demo'}</span>}
                  </h3>
                  {p.classification && <span className="gallery-card-tag">{p.classification}</span>}
                  <p className="gallery-card-pitch">{p.product?.pitch || p.executiveSummary || ''}</p>
                </div>
              </button>
              <PlanTags plan={p} lang={lang} onChange={handleTagsChange} compact />
            </div>
          ))}
        </div>
      )}

      {contextMenu && (
        <div
          className="gallery-context-menu"
          ref={menuRef}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="gallery-context-item" onClick={() => { closeMenu(); onOpenPlan(contextMenu.plan) }}>
            <IconExternalLink width={14} height={14} /> {t(lang, 'gallery.open')}
          </button>
          <button className="gallery-context-item" onClick={(e) => handleToggleFavorite(e, contextMenu.plan)}>
            <span className="gallery-context-star">{contextMenu.plan.isFavorite ? '⭐' : '☆'}</span>
            {contextMenu.plan.isFavorite ? t(lang, 'gallery.favoriteRemove') : t(lang, 'gallery.favoriteAdd')}
          </button>
          <button className="gallery-context-item" onClick={() => openRenameModal(contextMenu.plan)}>
            <IconPencil width={14} height={14} /> {lang === 'fr' ? 'Renommer' : 'Rename'}
          </button>
          <button className="gallery-context-item" onClick={() => handleShare(contextMenu.plan)}>
            <IconLink width={14} height={14} /> {t(lang, 'plans.share')}
          </button>
          <button className="gallery-context-item" onClick={() => handleDuplicate(contextMenu.plan)}>
            <IconCopy width={14} height={14} /> {t(lang, 'plans.duplicate')}
          </button>
          <button className="gallery-context-item" onClick={() => handleRemoveFromGallery(contextMenu.plan)}>
            <IconX width={14} height={14} /> {t(lang, 'gallery.removeFromGallery')}
          </button>
          <div className="gallery-context-divider" />
          <button
            className="gallery-context-item gallery-context-item-danger"
            onClick={() => { setDeleteTarget(contextMenu.plan); closeMenu() }}
          >
            <IconTrash width={14} height={14} /> {t(lang, 'plans.delete')}
          </button>
        </div>
      )}

      {toast && <div className="gallery-toast">{toast}</div>}

      {renameTarget && (
        <div className="confirm-modal-backdrop" onClick={() => setRenameTarget(null)}>
          <div className="confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="confirm-modal-icon"><IconPencil width={22} height={22} /></div>
            <h3>{lang === 'fr' ? 'Renommer le plan' : 'Rename plan'}</h3>
            <input
              type="text"
              className="gallery-rename-input"
              value={editValue}
              autoFocus
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitRename() }
                if (e.key === 'Escape') { e.preventDefault(); setRenameTarget(null) }
              }}
            />
            <div className="confirm-modal-actions">
              <button className="btn-secondary" onClick={() => setRenameTarget(null)}>{t(lang, 'plans.cancel')}</button>
              <button className="btn-primary" onClick={commitRename} disabled={!editValue.trim()}>{t(lang, 'app.save')}</button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  )
}
