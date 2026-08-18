import { useEffect, useState } from 'react'
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

  useEffect(() => {
    fetchGallery(48, 0).then(r => setPlans(r || []))
  }, [])

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

      {!!plans?.length && (
        <div className="gallery-grid">
          {plans.map(p => (
            <button key={p.id} className="gallery-card" onClick={() => onOpenPlan(p.id)}>
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
