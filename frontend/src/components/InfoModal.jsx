import '../styles/InfoModal.css'

export default function InfoModal({ icon, title, onClose, children, wide, banner }) {
  return (
    <div className="info-modal-backdrop" onClick={onClose}>
      <div className={`info-modal${wide ? ' wide' : ''}${banner ? ' has-banner' : ''}`} onClick={e => e.stopPropagation()}>
        <button className="info-modal-close" onClick={onClose} aria-label="Fermer">×</button>
        {banner && (
          <div className="info-modal-banner-wrap">
            <img src={banner} alt="" className="info-modal-banner-bg" aria-hidden="true" />
            <img src={banner} alt="" className="info-modal-banner" />
          </div>
        )}
        <div className="info-modal-content">
          <h1><span className="info-modal-icon">{icon}</span><span className="info-modal-title-text">{title}</span></h1>
          {children}
        </div>
      </div>
    </div>
  )
}
