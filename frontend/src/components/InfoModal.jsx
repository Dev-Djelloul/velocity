import { cloneElement } from 'react'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'
import '../styles/InfoModal.css'

// Dégradé partagé par toutes les icônes de carte (même formule que --wordmark-gradient,
// dupliquée ici : les stops d'un <linearGradient> SVG ne peuvent pas lire une variable CSS
// définie ailleurs). Un seul <defs> suffit pour toute la page — id fixe, une seule modale
// affichée à la fois (activeModal est un état unique côté App.jsx).
function IconGradientDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <linearGradient id="info-modal-icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9184d9" />
          <stop offset="40%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function InfoModal({ icon, title, onClose, children, wide, banner }) {
  useBodyScrollLock()
  // stroke="currentColor" est posé sur la balise <svg> elle-même (voir Icons.jsx, objet
  // `base`) et hérité par tous les <path> enfants sans qu'ils la redéfinissent — la
  // remplacer une seule fois ici par l'URL du gradient suffit donc à colorer l'icône
  // entière, quelle que soit l'icône passée par chaque modale.
  const gradientIcon = icon ? cloneElement(icon, { stroke: 'url(#info-modal-icon-gradient)' }) : icon

  return (
    <div className="info-modal-backdrop" onClick={onClose}>
      <IconGradientDefs />
      <div className={`info-modal${wide ? ' wide' : ''}${banner ? ' has-banner' : ''}`} onClick={e => e.stopPropagation()}>
        <button className="info-modal-close" onClick={onClose} aria-label="Fermer">×</button>
        {banner && (
          <div className="info-modal-banner-wrap">
            <img src={banner} alt="" className="info-modal-banner-bg" aria-hidden="true" />
            <img src={banner} alt="" className="info-modal-banner" />
          </div>
        )}
        <div className="info-modal-content">
          <h1><span className="info-modal-icon">{gradientIcon}</span><span className="info-modal-title-text">{title}</span></h1>
          {children}
        </div>
      </div>
    </div>
  )
}
