import { useState } from 'react'
import { t } from '../lib/i18n'
import {
  IconChevronLeft, IconChevronRight, IconBarChart, IconUser, IconClipboard,
  IconCircleDot, IconCalendar, IconTrendingUp, IconClock, IconRocket,
  IconTarget, IconCoin, IconShield, IconSparkle, IconSave
} from './Icons'
import '../styles/PlanSidebar.css'

const SECTIONS = [
  { id: 'section-dashboard', labelKey: 'dashboardBi.title', Icon: IconBarChart },
  { id: 'section-persona', labelKey: 'sidebar.persona', Icon: IconUser },
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
  { id: 'section-table', labelKey: 'genTable.title', Icon: IconSave }
]

export default function PlanSidebar({ lang }) {
  const [collapsed, setCollapsed] = useState(false)
  const [activeId, setActiveId] = useState(SECTIONS[0].id)

  const goTo = (id) => {
    setActiveId(id)
    const wrapper = document.getElementById(id)
    const target = wrapper?.firstElementChild || wrapper
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`plan-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button
        className="plan-sidebar-toggle"
        onClick={() => setCollapsed(c => !c)}
        title={t(lang, collapsed ? 'sidebar.expand' : 'sidebar.collapse')}
      >
        {collapsed ? <IconChevronRight width={14} height={14} /> : <IconChevronLeft width={14} height={14} />}
      </button>

      {!collapsed && <div className="plan-sidebar-title">{t(lang, 'sidebar.title')}</div>}

      <nav className="plan-sidebar-nav">
        {SECTIONS.map(({ id, labelKey, Icon }) => (
          <button
            key={id}
            className={`plan-sidebar-item ${activeId === id ? 'active' : ''}`}
            onClick={() => goTo(id)}
            title={collapsed ? t(lang, labelKey) : undefined}
          >
            <Icon width={16} height={16} />
            {!collapsed && <span>{t(lang, labelKey)}</span>}
          </button>
        ))}
      </nav>
    </div>
  )
}
