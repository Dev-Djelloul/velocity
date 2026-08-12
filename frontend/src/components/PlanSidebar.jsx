import { useCallback, useEffect, useRef, useState } from 'react'
import { t } from '../lib/i18n'
import VelocityLaunchLogo from './VelocityLaunchLogo'
import {
  IconChevronLeft, IconChevronRight, IconBarChart, IconUser, IconClipboard,
  IconCircleDot, IconCalendar, IconTrendingUp, IconClock, IconRocket,
  IconTarget, IconCoin, IconShield, IconSparkle, IconSave, IconPlus, IconCompass, IconRadar
} from './Icons'
import '../styles/PlanSidebar.css'

const SECTIONS = [
  { id: 'section-dashboard', labelKey: 'dashboardBi.title', Icon: IconBarChart },
  { id: 'section-persona', labelKey: 'sidebar.persona', Icon: IconUser },
  { id: 'section-veille', labelKey: 'veille.title', Icon: IconRadar },
  { id: 'section-roadmap', labelKey: 'outputs.roadmap', Icon: IconClipboard },
  { id: 'section-backlog', labelKey: 'backlog.title', Icon: IconCircleDot },
  { id: 'section-gantt', labelKey: 'gantt.title', Icon: IconCalendar },
  { id: 'section-burndown', labelKey: 'burndown.title', Icon: IconTrendingUp },
  { id: 'section-calendar', labelKey: 'calendar.title', Icon: IconClock },
  { id: 'section-marketing', labelKey: 'outputs.marketing', Icon: IconRocket },
  { id: 'section-kpis', labelKey: 'outputs.kpis', Icon: IconTarget },
  { id: 'section-financials', labelKey: 'outputs.financials.title', Icon: IconCoin },
  { id: 'section-strategy', labelKey: 'outputs.strategy.title', Icon: IconShield },
  { id: 'section-askchart', labelKey: 'askChart.title', Icon: IconSparkle },
  { id: 'section-table', labelKey: 'genTable.title', Icon: IconSave },
  { id: 'section-agents', labelKey: 'agents.title', Icon: IconSparkle },
  { id: 'section-tracking', labelKey: 'tracking.title', Icon: IconTrendingUp },
  { id: 'section-whatif', labelKey: 'whatif.title', Icon: IconCompass }
]

const RAIL_WIDTH = 60
const MIN_WIDTH = 180
const MAX_WIDTH = 340
const DEFAULT_WIDTH = 232

export default function PlanSidebar({ lang, onNewPlan }) {
  const [collapsed, setCollapsed] = useState(false)
  const [width, setWidth] = useState(() => Number(localStorage.getItem('plp_sidebar_width')) || DEFAULT_WIDTH)
  const [activeId, setActiveId] = useState(SECTIONS[0].id)
  const [resizing, setResizing] = useState(false)
  const startRef = useRef({ x: 0, width: DEFAULT_WIDTH })

  const goTo = (id) => setActiveId(id)

  const startResize = (e) => {
    e.preventDefault()
    startRef.current = { x: e.clientX, width }
    setResizing(true)
  }

  const onResizeMove = useCallback((e) => {
    const delta = e.clientX - startRef.current.x
    const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startRef.current.width + delta))
    setWidth(next)
  }, [])

  const stopResize = useCallback(() => {
    setResizing(false)
  }, [])

  useEffect(() => {
    if (!resizing) return
    window.addEventListener('mousemove', onResizeMove)
    window.addEventListener('mouseup', stopResize)
    return () => {
      window.removeEventListener('mousemove', onResizeMove)
      window.removeEventListener('mouseup', stopResize)
    }
  }, [resizing, onResizeMove, stopResize])

  useEffect(() => {
    if (!resizing) localStorage.setItem('plp_sidebar_width', String(width))
  }, [resizing, width])

  const currentWidth = collapsed ? RAIL_WIDTH : width

  return (
    <div
      className={`plan-sidebar ${collapsed ? 'collapsed' : ''} ${resizing ? 'resizing' : ''}`}
      style={{ width: currentWidth }}
    >
      <div className="plan-sidebar-top">
        {!collapsed && <span className="plan-sidebar-title">{t(lang, 'sidebar.title')}</span>}
        <button
          className="plan-sidebar-toggle"
          onClick={() => setCollapsed(c => !c)}
          title={t(lang, collapsed ? 'sidebar.expand' : 'sidebar.collapse')}
        >
          {collapsed ? <IconChevronRight width={12} height={12} /> : <IconChevronLeft width={12} height={12} />}
        </button>
      </div>

      <button
        className="plan-sidebar-item plan-sidebar-new-btn"
        onClick={onNewPlan}
        title={collapsed ? t(lang, 'sidebar.createPlan') : undefined}
      >
        <span className="plan-sidebar-icon plan-sidebar-icon-gradient"><IconPlus width={16} height={16} /></span>
        {!collapsed && <span className="plan-sidebar-label plan-sidebar-label-gradient">{t(lang, 'sidebar.createPlan')}</span>}
      </button>

      <nav className="plan-sidebar-nav">
        {SECTIONS.map(({ id, labelKey, Icon }) => (
          <a
            key={id}
            href={`#${id}`}
            className={`plan-sidebar-item ${activeId === id ? 'active' : ''}`}
            onClick={() => goTo(id)}
            title={collapsed ? t(lang, labelKey) : undefined}
          >
            <span className="plan-sidebar-icon"><Icon width={16} height={16} /></span>
            {!collapsed && <span className="plan-sidebar-label">{t(lang, labelKey)}</span>}
          </a>
        ))}
      </nav>

      <div className="plan-sidebar-brand">
        <VelocityLaunchLogo width={collapsed ? 32 : 40} height={collapsed ? 32 : 40} variant="gradient" />
      </div>

      {!collapsed && (
        <div className="plan-sidebar-resize-handle" onMouseDown={startResize} />
      )}
    </div>
  )
}
