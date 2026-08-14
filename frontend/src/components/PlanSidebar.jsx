import { useCallback, useEffect, useRef, useState } from 'react'
import { t } from '../lib/i18n'
import VelocityLaunchLogo from './VelocityLaunchLogo'
import {
  IconChevronDown, IconBarChart, IconUser, IconClipboard,
  IconCircleDot, IconCalendar, IconTrendingUp, IconClock, IconRocket,
  IconTarget, IconCoin, IconShield, IconSparkle, IconSave, IconPlus, IconCompass, IconRadar, IconGauge, IconMegaphone, IconLock
} from './Icons'
import '../styles/PlanSidebar.css'

const GROUPS = [
  {
    key: 'synthese',
    sections: [
      { id: 'section-dashboard', labelKey: 'dashboardBi.title', Icon: IconBarChart }
    ]
  },
  {
    key: 'market',
    sections: [
      { id: 'section-persona', labelKey: 'sidebar.persona', Icon: IconUser },
      { id: 'section-veille', labelKey: 'veille.title', Icon: IconRadar },
      { id: 'section-strategy', labelKey: 'outputs.strategy.title', Icon: IconShield }
    ]
  },
  {
    key: 'execution',
    sections: [
      { id: 'section-calendar', labelKey: 'calendar.title', Icon: IconClock },
      { id: 'section-roadmap', labelKey: 'outputs.roadmap', Icon: IconClipboard },
      { id: 'section-backlog', labelKey: 'backlog.title', Icon: IconCircleDot },
      { id: 'section-gantt', labelKey: 'gantt.title', Icon: IconCalendar },
      { id: 'section-burndown', labelKey: 'burndown.title', Icon: IconTrendingUp }
    ]
  },
  {
    key: 'gtm',
    sections: [
      { id: 'section-marketing', labelKey: 'outputs.marketing', Icon: IconRocket },
      { id: 'section-gtm-calendar', labelKey: 'gtm.title', Icon: IconMegaphone }
    ]
  },
  {
    key: 'performance',
    sections: [
      { id: 'section-kpis', labelKey: 'outputs.kpis', Icon: IconTarget },
      { id: 'section-abtest', labelKey: 'outputs.abTest', Icon: IconGauge },
      { id: 'section-benchmarks', labelKey: 'benchmarks.title', Icon: IconGauge },
      { id: 'section-financials', labelKey: 'outputs.financials.title', Icon: IconCoin }
    ]
  },
  {
    key: 'compliance',
    sections: [
      { id: 'section-rgpd', labelKey: 'rgpd.title', Icon: IconLock }
    ]
  },
  {
    key: 'aitools',
    sections: [
      { id: 'section-table', labelKey: 'genTable.title', Icon: IconSave },
      { id: 'section-agents', labelKey: 'agents.title', Icon: IconSparkle }
    ]
  },
  {
    key: 'postlaunch',
    sections: [
      { id: 'section-tracking', labelKey: 'tracking.title', Icon: IconTrendingUp },
      { id: 'section-whatif', labelKey: 'whatif.title', Icon: IconCompass }
    ]
  }
]

const FIRST_ID = GROUPS[0].sections[0].id

const RAIL_WIDTH = 60
const MIN_WIDTH = 180
const MAX_WIDTH = 340
const DEFAULT_WIDTH = 244

export default function PlanSidebar({ lang, onNewPlan }) {
  const [collapsed, setCollapsed] = useState(false)
  const [width, setWidth] = useState(() => Number(localStorage.getItem('plp_sidebar_width')) || DEFAULT_WIDTH)
  const [activeId, setActiveId] = useState(FIRST_ID)
  const [resizing, setResizing] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState({})
  const startRef = useRef({ x: 0, width: DEFAULT_WIDTH })
  const itemRefs = useRef({})

  const goTo = (id) => setActiveId(id)
  const toggleGroup = (key) => setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }))

  const groupOf = useCallback((id) => GROUPS.find(g => g.sections.some(s => s.id === id))?.key, [])

  useEffect(() => {
    const targets = GROUPS.flatMap(g => g.sections)
      .map(s => document.getElementById(s.id))
      .filter(Boolean)
    if (!targets.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter(e => e.isIntersecting)
        if (!visible.length) return
        const top = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b))
        const id = top.target.id
        setActiveId(id)
        const key = groupOf(id)
        if (key) setCollapsedGroups(prev => (prev[key] ? { ...prev, [key]: false } : prev))
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: [0, 1] }
    )
    targets.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [groupOf])

  useEffect(() => {
    itemRefs.current[activeId]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeId])

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

  const renderItem = ({ id, labelKey, Icon }) => (
    <a
      key={id}
      ref={el => { itemRefs.current[id] = el }}
      href={`#${id}`}
      className={`plan-sidebar-item ${activeId === id ? 'active' : ''}`}
      onClick={() => goTo(id)}
      title={collapsed ? t(lang, labelKey) : undefined}
    >
      <span className="plan-sidebar-icon"><Icon width={16} height={16} /></span>
      {!collapsed && <span className="plan-sidebar-label">{t(lang, labelKey)}</span>}
    </a>
  )

  return (
    <div
      className={`plan-sidebar ${collapsed ? 'collapsed' : ''} ${resizing ? 'resizing' : ''}`}
      style={{ width: currentWidth }}
    >
      <div className="plan-sidebar-top">
        <VelocityLaunchLogo width={22} height={22} variant="gradient" />
        {!collapsed && <span className="plan-sidebar-title">{t(lang, 'sidebar.title')}</span>}
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
        {collapsed
          ? GROUPS.flatMap(g => g.sections).map(renderItem)
          : GROUPS.map(group => {
              const isCollapsed = collapsedGroups[group.key]
              return (
                <div key={group.key} className="plan-sidebar-group">
                  <button
                    className={`plan-sidebar-group-header ${isCollapsed ? 'collapsed' : ''}`}
                    onClick={() => toggleGroup(group.key)}
                  >
                    <span className="plan-sidebar-group-title">{t(lang, `sidebar.groups.${group.key}`)}</span>
                    <IconChevronDown width={12} height={12} className="plan-sidebar-group-chevron" />
                  </button>
                  {!isCollapsed && (
                    <div className="plan-sidebar-group-items">
                      {group.sections.map(renderItem)}
                    </div>
                  )}
                </div>
              )
            })}
      </nav>

      <div className="plan-sidebar-brand">
        <VelocityLaunchLogo width={collapsed ? 32 : 40} height={collapsed ? 32 : 40} variant="gradient" />
      </div>

      {!collapsed && (
        <div className="plan-sidebar-resize-handle" onMouseDown={startResize} />
      )}

      <button
        className={`plan-sidebar-collapse-handle ${collapsed ? 'is-collapsed' : ''}`}
        onClick={() => setCollapsed(c => !c)}
        onMouseDown={e => e.stopPropagation()}
        title={t(lang, collapsed ? 'sidebar.expand' : 'sidebar.collapse')}
      />
    </div>
  )
}
