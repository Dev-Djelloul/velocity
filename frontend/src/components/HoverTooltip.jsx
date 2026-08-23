import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import '../styles/HoverTooltip.css'

// Infobulle rendue via portail dans document.body plutôt qu'en CSS pur (::after) : les
// widgets du Dashboard vivent dans des conteneurs à coins arrondis avec overflow:hidden
// (.dashboard-space-card) ou overflow-y:auto (.dashboard-widget-card — qui force aussi
// overflow-x:auto, impossible à éviter en CSS pur sur le même élément), qui rognaient
// systématiquement l'infobulle dès que la vignette survolée était proche du bord (retour
// utilisateur, capture à l'appui, sur la galerie publique et les aperçus de plans des
// cartes d'espace). En position:fixed hors de la carte, elle échappe à tout overflow
// ancêtre — même recette que le menu contextuel "Taille" (voir DashboardWidgetGrid.jsx,
// WidgetSizeMenu).
export default function HoverTooltip({ label, children, as: Tag = 'span', className = '', ...rest }) {
  const [pos, setPos] = useState(null)
  const ref = useRef(null)

  const show = () => {
    if (!label) return
    const r = ref.current?.getBoundingClientRect()
    if (r) setPos({ x: r.left + r.width / 2, y: r.top })
  }
  const hide = () => setPos(null)

  return (
    <Tag
      ref={ref}
      className={className}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      {...rest}
    >
      {children}
      {pos && createPortal(
        <div className="hover-tooltip" style={{ left: pos.x, top: pos.y }}>{label}</div>,
        document.body
      )}
    </Tag>
  )
}
