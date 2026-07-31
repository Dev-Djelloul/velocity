import '../styles/InfoModal.css'

export default function InfoModal({ icon, title, onClose, children, wide }) {
  return (
    <div className="info-modal-backdrop" onClick={onClose}>
      <div className={`info-modal${wide ? ' wide' : ''}`} onClick={e => e.stopPropagation()}>
        <button className="info-modal-close" onClick={onClose} aria-label="Fermer">×</button>
        <div className="info-modal-content">
          <h1>{icon}{title}</h1>
          {children}
        </div>
      </div>
    </div>
  )
}
