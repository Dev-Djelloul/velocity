import '../styles/InfoModal.css'

export default function InfoModal({ icon, title, onClose, children, wide, banner }) {
  return (
    <div className="info-modal-backdrop" onClick={onClose}>
      <div className={`info-modal${wide ? ' wide' : ''}${banner ? ' has-banner' : ''}`} onClick={e => e.stopPropagation()}>
        <button className="info-modal-close" onClick={onClose} aria-label="Fermer">×</button>
        {banner && <img src={banner} alt="" className="info-modal-banner" />}
        <div className="info-modal-content">
          <h1>{icon}{title}</h1>
          {children}
        </div>
      </div>
    </div>
  )
}
