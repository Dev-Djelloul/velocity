import { useEffect, useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { getAllPlans, toggleFavorite } from '../lib/planStorage'
import { IconClipboard, IconSparkle } from './Icons'
import '../styles/GalleryPage.css'

// Galerie privée : vue en grille des plans que l'utilisateur a explicitement épinglés
// (plan.inGallery, bouton "Ajouter à la galerie" dans PlanViewer) — opt-in, pas une liste
// automatique de tous ses plans (voir "Mes plans"/PlansHistory pour ça). Aucune donnée
// n'est exposée publiquement, tout passe par getAllPlans(), scopée par utilisateur+espace
// côté planStorage.
export default function GalleryPage({ lang, onOpenPlan }) {
  const [plans, setPlans] = useState(() => getAllPlans())

  useEffect(() => {
    setPlans(getAllPlans())
  }, [])

  const galleryPlans = useMemo(() => {
    return plans.filter(p => p.inGallery).sort((a, b) => {
      if (!!b.isFavorite !== !!a.isFavorite) return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)
      return (b.updatedAt || b.savedAt || '').localeCompare(a.updatedAt || a.savedAt || '')
    })
  }, [plans])

  const handleToggleFavorite = (e, id) => {
    e.stopPropagation()
    toggleFavorite(id)
    setPlans(getAllPlans())
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

      {!!galleryPlans.length && (
        <div className="gallery-grid">
          {galleryPlans.map(p => (
            <button key={p.id} className={`gallery-card${p.isFavorite ? ' gallery-card-featured' : ''}`} onClick={() => onOpenPlan(p)}>
              <span
                className="gallery-card-favorite-toggle"
                role="button"
                tabIndex={0}
                title={p.isFavorite ? t(lang, 'gallery.favoriteRemove') : t(lang, 'gallery.favoriteAdd')}
                onClick={(e) => handleToggleFavorite(e, p.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleToggleFavorite(e, p.id) }}
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
          ))}
        </div>
      )}
    </div>
  )
}
