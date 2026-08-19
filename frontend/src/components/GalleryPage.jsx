import { useEffect, useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { fetchGallery } from '../lib/serverStorage'
import { IconClipboard, IconSparkle } from './Icons'
import '../styles/GalleryPage.css'

// Vitrine publique des plans que leurs auteurs ont choisi de rendre visibles
// (plan.isPublic, activé depuis PlanViewer) — accessible sans compte, comme les liens de
// partage. Pas de modération a priori : c'est l'auteur qui contrôle la visibilité de son
// propre plan (toggle réversible à tout moment), pas de file de revue côté équipe pour ce MVP.
export default function GalleryPage({ lang, onOpenPlan }) {
  const [plans, setPlans] = useState(null) // null = chargement
  const [category, setCategory] = useState('all')

  useEffect(() => {
    fetchGallery(48, 0).then(r => setPlans(r || []))
  }, [])

  // Filtrage côté client : volume actuel de la galerie ne justifie pas un paramètre
  // de requête côté GET /gallery (à revoir si le catalogue grossit beaucoup).
  const categories = useMemo(() => {
    if (!plans) return []
    const set = new Set(plans.map(p => p.category).filter(Boolean))
    return [...set]
  }, [plans])

  const categoryLabels = t(lang, 'product.categoryOptions')

  const filteredPlans = useMemo(() => {
    if (!plans) return null
    if (category === 'all') return plans
    return plans.filter(p => p.category === category)
  }, [plans, category])

  return (
    <div className="gallery-page">
      <div className="gallery-page-header">
        <h1><IconSparkle width={22} height={22} /> {t(lang, 'gallery.title')}</h1>
        <p className="gallery-page-subtitle">{t(lang, 'gallery.subtitle')}</p>
      </div>

      {plans === null && <p className="gallery-empty">{t(lang, 'gallery.loading')}</p>}

      {plans?.length === 0 && (
        <div className="gallery-empty-state">
          <IconClipboard width={28} height={28} />
          <p>{t(lang, 'gallery.empty')}</p>
        </div>
      )}

      {!!plans?.length && !!categories.length && (
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

      {!!plans?.length && filteredPlans?.length === 0 && (
        <p className="gallery-empty">{t(lang, 'gallery.filterNoMatch')}</p>
      )}

      {!!filteredPlans?.length && (
        <div className="gallery-grid">
          {filteredPlans.map(p => (
            <button key={p.id} className={`gallery-card${p.isFeatured ? ' gallery-card-featured' : ''}`} onClick={() => onOpenPlan(p.id)}>
              {p.isFeatured && <span className="gallery-card-featured-badge">⭐ {t(lang, 'gallery.featured')}</span>}
              {p.coverImage
                ? <img src={p.coverImage} alt="" className="gallery-card-cover" />
                : <div className="gallery-card-cover gallery-card-cover-placeholder" aria-hidden="true" />}
              <div className="gallery-card-body">
                <h3>{p.productName || t(lang, 'plans.untitled')}</h3>
                {p.classification && <span className="gallery-card-tag">{p.classification}</span>}
                <p className="gallery-card-pitch">{p.pitch || p.executiveSummary || ''}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
