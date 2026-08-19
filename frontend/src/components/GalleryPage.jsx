import { useEffect, useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { getAllPlans, toggleFavorite } from '../lib/planStorage'
import { IconClipboard, IconSparkle } from './Icons'
import '../styles/GalleryPage.css'

// Galerie privée : vue en grille des propres plans de l'utilisateur connecté (espace
// actif), pour les retrouver et les classer d'un coup d'œil — aucune donnée n'est exposée
// publiquement, tout passe par getAllPlans() (même source que PlansHistory), scopée par
// utilisateur+espace côté planStorage.
export default function GalleryPage({ lang, onOpenPlan }) {
  const [plans, setPlans] = useState(() => getAllPlans())
  const [category, setCategory] = useState('all')

  useEffect(() => {
    setPlans(getAllPlans())
  }, [])

  const categories = useMemo(() => {
    const set = new Set(plans.map(p => p.product?.category).filter(Boolean))
    return [...set]
  }, [plans])

  const categoryLabels = t(lang, 'product.categoryOptions')

  const sortedPlans = useMemo(() => {
    const filtered = category === 'all' ? plans : plans.filter(p => p.product?.category === category)
    return [...filtered].sort((a, b) => {
      if (!!b.isFavorite !== !!a.isFavorite) return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0)
      return (b.updatedAt || b.savedAt || '').localeCompare(a.updatedAt || a.savedAt || '')
    })
  }, [plans, category])

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

      {plans.length === 0 && (
        <div className="gallery-empty-state">
          <IconClipboard width={28} height={28} />
          <p>{t(lang, 'gallery.empty')}</p>
        </div>
      )}

      {!!plans.length && !!categories.length && (
        <div className="gallery-filters">
          <button
            className={`gallery-filter-chip${category === 'all' ? ' active' : ''}`}
            onClick={() => setCategory('all')}
          >
            {t(lang, 'gallery.filterAll')}
          </button>
          {categories.map(c => (
            <button
              key={c}
              className={`gallery-filter-chip${category === c ? ' active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {categoryLabels?.[c] || c}
            </button>
          ))}
        </div>
      )}

      {!!plans.length && sortedPlans.length === 0 && (
        <p className="gallery-empty">{t(lang, 'gallery.filterNoMatch')}</p>
      )}

      {!!sortedPlans.length && (
        <div className="gallery-grid">
          {sortedPlans.map(p => (
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
                <h3>{p.product?.name || t(lang, 'plans.untitled')}</h3>
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
