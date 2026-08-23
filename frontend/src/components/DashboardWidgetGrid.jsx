import { useEffect, useRef, useState } from 'react'
import { t } from '../lib/i18n'
import { loadWidgetLayout, saveWidgetLayout } from '../lib/dashboardWidgets'
import { IconCheck } from './Icons'
import '../styles/DashboardWidgetGrid.css'

const SIZES = ['small', 'medium', 'large']

// Menu contextuel "Taille" façon macOS (clic droit sur un widget de bureau ou du centre de
// notifications) — rendu en position fixe pour ne jamais être rogné par l'overflow d'une
// carte parente.
function WidgetSizeMenu({ lang, x, y, current, onPick, onClose }) {
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
  const style = { left: Math.min(x, window.innerWidth - 200), top: Math.min(y, window.innerHeight - 160) }

  return (
    <div className="widget-size-menu" style={style} ref={ref}>
      <span className="widget-size-menu-label">{t(lang, 'dashboard.widgetSizeLabel')}</span>
      {SIZES.map(size => (
        <button key={size} className="widget-size-menu-item" onClick={() => onPick(size)}>
          <span className="widget-size-menu-check">{current === size && <IconCheck width={12} height={12} />}</span>
          {t(lang, `dashboard.widgetSize.${size}`)}
        </button>
      ))}
    </div>
  )
}

function WidgetSlot({ id, lang, size, isDragging, isDragOver, onDragStart, onDragEnd, onDragEnter, onDrop, onResize, children }) {
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
      {menu && (
        <WidgetSizeMenu
          lang={lang}
          x={menu.x} y={menu.y} current={size}
          onPick={(s) => { onResize(id, s); setMenu(null) }}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  )
}

// Grille de widgets déplaçables (glisser-déposer) et redimensionnables (clic droit → Petit/
// Moyen/Grand) — même logique que le centre de notifications ou le bureau macOS. `widgets`
// est un objet { id: node } ; seuls les ids présents dans cet objet sont rendus (un widget
// absent, ex: pas de plan Pro pour Nova, ou une équipe supprimée, ne laisse pas de trou
// dans la disposition). Cet objet est dynamique d'un rendu à l'autre (le nombre d'espaces
// d'équipe change), donc la liste des ids connus est dérivée de ses clés à chaque rendu —
// jamais figée en dur. `defaultOrder`/`defaultSizes` ne couvrent que les widgets fixes
// (calendrier, échéances...) ; un id absent de ces deux objets (ex: une équipe) prend
// simplement la taille "medium" et vient s'ajouter en fin d'ordre par défaut.
export default function DashboardWidgetGrid({ userId, lang, widgets, defaultOrder, defaultSizes }) {
  const allIds = Object.keys(widgets)
  const idsKey = allIds.slice().sort().join(',')
  const buildDefaults = () => ({
    order: [...(defaultOrder || []).filter(id => allIds.includes(id)), ...allIds.filter(id => !(defaultOrder || []).includes(id))],
    sizes: defaultSizes || {}
  })

  const [layout, setLayout] = useState(() => loadWidgetLayout(userId, allIds, buildDefaults()))
  const [draggingId, setDraggingId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)

  useEffect(() => {
    setLayout(loadWidgetLayout(userId, allIds, buildDefaults()))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, idsKey])

  const persist = (next) => {
    setLayout(next)
    saveWidgetLayout(userId, next)
  }

  const handleDrop = (targetId) => {
    if (!draggingId || draggingId === targetId) { setDraggingId(null); setDragOverId(null); return }
    const order = layout.order.filter(id => id !== draggingId)
    const targetIndex = order.indexOf(targetId)
    order.splice(targetIndex, 0, draggingId)
    persist({ ...layout, order })
    setDraggingId(null)
    setDragOverId(null)
  }

  const handleResize = (id, size) => {
    persist({ ...layout, sizes: { ...layout.sizes, [id]: size } })
  }

  const visibleOrder = layout.order.filter(id => widgets[id] !== undefined)

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
            isDragging={draggingId === id}
            isDragOver={dragOverId === id && draggingId !== id}
            onDragStart={setDraggingId}
            onDragEnd={() => { setDraggingId(null); setDragOverId(null) }}
            onDragEnter={setDragOverId}
            onDrop={handleDrop}
            onResize={handleResize}
          >
            {content}
          </WidgetSlot>
        )
      })}
    </div>
  )
}
