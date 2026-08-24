import { useEffect, useRef, useState } from 'react'
import { t } from '../lib/i18n'
import { IconCheck, IconTrash, IconSettings } from './Icons'
import '../styles/DashboardWidgetGrid.css'

const SIZES = ['small', 'medium', 'large']

// Menu contextuel "Taille" façon macOS (clic droit sur un widget de bureau ou du centre de
// notifications) — rendu en position fixe pour ne jamais être rogné par l'overflow d'une
// carte parente. `onRemove` est optionnel : absent pour les widgets obligatoires
// (calendrier, "Reprendre") qui ne proposent que le redimensionnement.
function WidgetSizeMenu({ lang, x, y, current, onPick, onRemove, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    const onEscape = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEscape)
    }
  }, [onClose])

  // Repositionne dans la fenêtre si le clic droit a eu lieu trop près du bord.
  const style = { left: Math.min(x, window.innerWidth - 200), top: Math.min(y, window.innerHeight - 220) }

  return (
    <div className="widget-size-menu" style={style} ref={ref}>
      <span className="widget-size-menu-label">{t(lang, 'dashboard.widgetSizeLabel')}</span>
      {SIZES.map(size => (
        <button key={size} className="widget-size-menu-item" onClick={() => onPick(size)}>
          <span className="widget-size-menu-check">{current === size && <IconCheck width={12} height={12} />}</span>
          {t(lang, `dashboard.widgetSize.${size}`)}
        </button>
      ))}
      {onRemove && (
        <>
          <span className="widget-size-menu-divider" />
          <button className="widget-size-menu-item widget-size-menu-item-danger" onClick={onRemove}>
            <span className="widget-size-menu-check"><IconTrash width={12} height={12} /></span>
            {t(lang, 'dashboard.widgetRemove')}
          </button>
        </>
      )}
    </div>
  )
}

function WidgetSlot({ id, lang, size, isDragging, isDragOver, removable, onDragStart, onDragEnd, onDragEnter, onDrop, onResize, onRemove, children }) {
  const [menu, setMenu] = useState(null)

  return (
    <div
      className={`dashboard-widget-slot size-${size} ${isDragging ? 'is-dragging' : ''} ${isDragOver ? 'is-drag-over' : ''}`}
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(id) }}
      onDragEnd={onDragEnd}
      // dragOver (pas seulement dragEnter) : sur un widget "Grand" (2x2), le pointeur passe
      // par plusieurs enfants imbriqués en se déplaçant, ce qui redéclenche sans arrêt
      // enter/leave et pouvait faire perdre la cible de dépôt en cours de route (retour
      // utilisateur : le glisser-déposer "ne marche pas" entre deux cartes de tailles très
      // différentes). dragOver se redéclenche en continu tant qu'on survole, bulle
      // pareillement depuis les enfants, et ne se réinitialise jamais sur un simple survol
      // d'un enfant interne — bien plus fiable ici que dragEnter/dragLeave.
      onDragOver={(e) => { e.preventDefault(); onDragEnter(id) }}
      onDrop={(e) => { e.preventDefault(); onDrop(id) }}
      onContextMenu={(e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY }) }}
    >
      <div className="dashboard-widget-slot-content">{children}</div>
      {/* Le clic droit n'existe pas au tactile (mobile/tablette) — sans cet équivalent
          visible, il n'y avait aucun moyen de redimensionner ou retirer un widget sur ces
          appareils (retour utilisateur). Toujours affiché plutôt que révélé au survol,
          pour rester découvrable au tactile où il n'y a pas de "survol". */}
      <button
        type="button"
        className="dashboard-widget-slot-menu-btn"
        aria-label={t(lang, 'dashboard.widgetSizeLabel')}
        onClick={(e) => {
          e.stopPropagation()
          const rect = e.currentTarget.getBoundingClientRect()
          setMenu({ x: rect.right, y: rect.bottom })
        }}
      >
        <IconSettings width={14} height={14} />
      </button>
      {menu && (
        <WidgetSizeMenu
          lang={lang}
          x={menu.x} y={menu.y} current={size}
          onPick={(s) => { onResize(id, s); setMenu(null) }}
          onRemove={removable ? () => { onRemove(id); setMenu(null) } : null}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  )
}

// Grille de widgets déplaçables (glisser-déposer) et redimensionnables (clic droit → Petit/
// Moyen/Grand) — même logique que le centre de notifications ou le bureau macOS. `widgets`
// est un objet { id: node } ; seuls les ids présents dans cet objet ET non masqués
// (layout.hidden, retirés via la bibliothèque de widgets) sont rendus. Cet objet est
// dynamique d'un rendu à l'autre (le nombre d'espaces d'équipe change), donc la liste des
// ids connus est dérivée de ses clés à chaque rendu — jamais figée en dur.
//
// Contrôlé par le parent (`layout`/`onLayoutChange`) plutôt qu'auto-géré : la bibliothèque
// de widgets (DashboardWidgetLibrary) a besoin de lire et modifier la même disposition
// (ajouter/retirer un widget) que cette grille affiche — un seul état source évite deux
// copies désynchronisées de "quels widgets sont visibles".
export default function DashboardWidgetGrid({ lang, widgets, layout, onLayoutChange, mandatoryIds = [] }) {
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  const handleDrop = (targetId) => {
    if (!draggingId || draggingId === targetId) { setDraggingId(null); setDragOverId(null); return }
    const order = layout.order.filter(id => id !== draggingId)
    const targetIndex = order.indexOf(targetId)
    order.splice(targetIndex, 0, draggingId)
    onLayoutChange({ ...layout, order })
    setDraggingId(null)
    setDragOverId(null)
  }

  const handleResize = (id, size) => {
    onLayoutChange({ ...layout, sizes: { ...layout.sizes, [id]: size } })
  }

  const handleRemove = (id) => {
    onLayoutChange({ ...layout, hidden: [...new Set([...(layout.hidden || []), id])] })
  }

  const hidden = layout.hidden || []
  const visibleOrder = layout.order.filter(id => widgets[id] !== undefined && !hidden.includes(id))

  return (
    <div className="dashboard-widget-grid">
      {visibleOrder.map(id => {
        const size = layout.sizes[id] || 'medium'
        // Un widget peut être une fonction (size) => node plutôt qu'un node statique,
        // pour adapter son contenu à sa propre taille (ex: la galerie affiche plus de
        // vignettes en Grand qu'en Petit) — sans ça, chaque widget devrait connaître sa
        // taille par un autre biais.
        const content = typeof widgets[id] === 'function' ? widgets[id](size) : widgets[id]
        return (
          <WidgetSlot
            key={id}
            id={id}
            lang={lang}
            size={size}
            removable={!mandatoryIds.includes(id)}
            isDragging={draggingId === id}
            isDragOver={dragOverId === id && draggingId !== id}
            onDragStart={setDraggingId}
            onDragEnd={() => { setDraggingId(null); setDragOverId(null) }}
            onDragEnter={setDragOverId}
            onDrop={handleDrop}
            onResize={handleResize}
            onRemove={handleRemove}
          >
            {content}
          </WidgetSlot>
        )
      })}
    </div>
  )
}
