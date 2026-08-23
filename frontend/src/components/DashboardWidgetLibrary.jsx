import { useMemo, useState } from 'react'
import { t } from '../lib/i18n'
import { WIDGET_CATALOG, WIDGET_CATEGORIES } from '../lib/widgetCatalog'
import {
  IconSearch, IconCheck, IconPlus, IconCalendar, IconClock, IconActivity,
  IconSparkle, IconClipboard, IconImage, IconGauge, IconFlame, IconCloudSun
} from './Icons'
import '../styles/DashboardWidgetLibrary.css'

const WIDGET_ICONS = {
  calendar: IconCalendar,
  resume: IconClock,
  deadlines: IconCalendar,
  activity: IconActivity,
  nova: IconSparkle,
  history: IconClipboard,
  gallery: IconImage,
  portfolioHealth: IconGauge,
  streak: IconFlame,
  businessWeather: IconCloudSun
}

// Bibliothèque de widgets façon macOS ("+" à côté de "Créer un plan") : barre de recherche,
// catégories à gauche, grille de cartes à droite. Contrairement au menu contextuel "clic
// droit → Petit/Moyen/Grand" (qui ne fait que redimensionner un widget déjà affiché), ce
// panneau ajoute ou retire des widgets de la disposition — click plutôt que glisser-déposer
// depuis la modale : contrairement au bureau macOS, rien n'est visible "derrière" ce panneau
// plein écran vers quoi glisser.
export default function DashboardWidgetLibrary({ lang, availableIds, hidden, pro, onAdd, onRemove, onClose }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const entries = useMemo(() => {
    return WIDGET_CATALOG
      .filter(w => availableIds.includes(w.id))
      .filter(w => !w.proOnly || pro)
      .map(w => ({
        ...w,
        title: t(lang, `dashboard.widgetCatalog.${w.id}.title`),
        desc: t(lang, `dashboard.widgetCatalog.${w.id}.desc`),
        visible: !hidden.includes(w.id)
      }))
  }, [availableIds, hidden, pro, lang])

  const filtered = entries
    .filter(w => category === 'all' || w.category === category)
    .filter(w => !search.trim() || w.title.toLowerCase().includes(search.trim().toLowerCase()))

  return (
    <div className="widget-library-backdrop" onClick={onClose}>
      <div className="widget-library-panel" onClick={e => e.stopPropagation()}>
        <aside className="widget-library-sidebar">
          <div className="widget-library-search">
            <IconSearch width={14} height={14} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t(lang, 'dashboard.widgetLibrary.searchPlaceholder')}
            />
          </div>
          <button
            className={`widget-library-cat ${category === 'all' ? 'is-active' : ''}`}
            onClick={() => setCategory('all')}
          >
            {t(lang, 'dashboard.widgetLibrary.allWidgets')}
          </button>
          {WIDGET_CATEGORIES.map(cat => (
            entries.some(w => w.category === cat) && (
              <button
                key={cat}
                className={`widget-library-cat ${category === cat ? 'is-active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {t(lang, `dashboard.widgetLibrary.categories.${cat}`)}
              </button>
            )
          ))}
        </aside>

        <div className="widget-library-main">
          <div className="widget-library-grid">
            {filtered.length === 0 ? (
              <p className="widget-library-empty">{t(lang, 'dashboard.widgetLibrary.empty')}</p>
            ) : filtered.map(w => {
              const Icon = WIDGET_ICONS[w.id] || IconSparkle
              return (
                <div key={w.id} className={`widget-library-card ${w.visible ? 'is-added' : ''}`}>
                  <div className="widget-library-card-icon"><Icon width={20} height={20} /></div>
                  <div className="widget-library-card-body">
                    <span className="widget-library-card-title">
                      <span className="widget-library-card-title-text">{w.title}</span>
                      {w.isNew && <span className="widget-library-badge widget-library-badge-new">{t(lang, 'dashboard.widgetLibrary.categories.insights')}</span>}
                      {w.proOnly && <span className="widget-library-badge">{t(lang, 'dashboard.widgetLibrary.proOnly')}</span>}
                    </span>
                    <p className="widget-library-card-desc">{w.desc}</p>
                  </div>
                  {w.mandatory ? (
                    <span className="widget-library-status">{t(lang, 'dashboard.widgetLibrary.alwaysShown')}</span>
                  ) : w.visible ? (
                    <button className="widget-library-action is-remove" onClick={() => onRemove(w.id)}>
                      <IconCheck width={14} height={14} />
                      {t(lang, 'dashboard.widgetLibrary.added')}
                    </button>
                  ) : (
                    <button className="widget-library-action" onClick={() => onAdd(w.id)}>
                      <IconPlus width={14} height={14} />
                      {t(lang, 'dashboard.widgetLibrary.add')}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="widget-library-footer">
            <button className="btn-primary" onClick={onClose}>{t(lang, 'dashboard.widgetLibrary.done')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
