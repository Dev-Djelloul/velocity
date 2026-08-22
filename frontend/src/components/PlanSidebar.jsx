import { useCallback, useEffect, useRef, useState } from 'react'
import { t } from '../lib/i18n'
import VelocityLaunchLogo from './VelocityLaunchLogo'
import InfoModal from './InfoModal'
import { sectionLabel } from '../lib/changeDescriptions'
import { formatFullDateTime } from '../lib/dateFormat'
import { getReadIds, markCommentsRead } from '../lib/commentReads'
import {
  IconChevronDown, IconChevronLeft, IconChevronRight, IconBarChart, IconUser, IconClipboard,
  IconCircleDot, IconCalendar, IconTrendingUp, IconClock, IconRocket,
  IconTarget, IconCoin, IconShield, IconSparkle, IconSave, IconPlus, IconCompass, IconRadar, IconGauge, IconMegaphone, IconLock,
  IconClock as IconHistory, IconTrash, IconAlertTriangle, IconMessageCircle, IconX
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
      { id: 'section-budget-timeline', labelKey: 'outputs.budgetTimeline.title', Icon: IconCoin },
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

const COMMENT_TOPICS = [
  { key: 'general', fr: 'Général', en: 'General' },
  { key: 'roadmap', fr: 'Roadmap', en: 'Roadmap' },
  { key: 'marketing', fr: 'Marketing', en: 'Marketing' },
  { key: 'kpis', fr: 'KPIs', en: 'KPIs' },
  { key: 'financials', fr: 'Budget', en: 'Budget' }
]

function topicLabel(key, lang) {
  return COMMENT_TOPICS.find(t => t.key === key)?.[lang] || COMMENT_TOPICS[0][lang]
}

const RAIL_WIDTH = 60
const MIN_WIDTH = 180
const MAX_WIDTH = 340
const DEFAULT_WIDTH = 244

export default function PlanSidebar({ lang, onNewPlan, changeLog, onClearHistory, comments, onAddComment, onDeleteComment, currentUserId, onSectionSelect, activeSection, teamMembers, copilotHistory, mobileIndex, mobileTotal, onPrevSection, onNextSection, onCompareVersions }) {
  // Repliée par défaut sous 900px (tablette/mobile) — sur mobile, "repliée" affiche une
  // simple barre (précédent/section active/suivant), "dépliée" ouvre le sommaire complet en
  // feuille modale plutôt qu'en colonne poussant tout le contenu vers le bas (ancien
  // comportement : une grille d'icônes nues, illisible et peu pratique — remplacée ici par
  // une liste groupée avec libellés, identique à la version desktop dépliée).
  const [collapsed, setCollapsed] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900)

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const [width, setWidth] = useState(() => Number(localStorage.getItem('plp_sidebar_width')) || DEFAULT_WIDTH)
  const [activeId, setActiveId] = useState(FIRST_ID)
  const [resizing, setResizing] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState({})
  const [historyOpen, setHistoryOpen] = useState(false)
  const [confirmClearHistory, setConfirmClearHistory] = useState(false)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [novaHistoryOpen, setNovaHistoryOpen] = useState(false)
  const [commentTopic, setCommentTopic] = useState('general')
  const [commentText, setCommentText] = useState('')
  const [mentionedIds, setMentionedIds] = useState([])
  const [mentionQuery, setMentionQuery] = useState(null)
  const [readVersion, setReadVersion] = useState(0)
  const startRef = useRef({ x: 0, width: DEFAULT_WIDTH })
  const itemRefs = useRef({})

  const goTo = (id) => {
    setActiveId(id)
    onSectionSelect?.(id)
    // Choisir une section dans la feuille modale doit la refermer aussitôt (sinon elle
    // recouvre le contenu qu'on vient justement de demander à voir) — sans effet sur
    // desktop, où la sidebar reste dépliée en continu.
    if (isMobile) setCollapsed(true)
  }
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

  // La navigation par les flèches précédent/suivant (mode paginé mobile, voir
  // PlanViewer.jsx) change la section affichée sans passer par goTo() ni déclencher
  // l'IntersectionObserver ci-dessus (les sections inactives sont display:none, jamais
  // "intersecting") — sans cette synchro, l'icône surlignée dans le sommaire restait
  // bloquée sur la première section quel que soit l'endroit réellement affiché.
  useEffect(() => {
    if (activeSection) setActiveId(activeSection)
  }, [activeSection])

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

  const submitComment = () => {
    if (!commentText.trim()) return
    onAddComment?.(commentTopic, commentText, mentionedIds)
    setCommentText('')
    setMentionedIds([])
    setMentionQuery(null)
  }

  // @mentions : détecte un "@" en cours de frappe en fin de texte (pas de gestion fine de
  // la position du curseur — suffisant pour une textarea courte comme celle-ci) et propose
  // les membres de l'équipe active dont le nom correspond. Choisir un membre insère
  // "@Nom " à la place du "@requête" en cours et l'ajoute à mentionedIds, qui accompagne le
  // commentaire jusqu'à onAddComment (voir addComment dans PlanViewer.jsx) pour déclencher
  // une notification ciblée (email/Slack) à cette personne, indépendante de la sauvegarde
  // du plan.
  const handleCommentTextChange = (e) => {
    const value = e.target.value
    setCommentText(value)
    const match = value.match(/(?:^|\s)@(\w*)$/)
    setMentionQuery(match ? match[1] : null)
  }

  const mentionMatches = mentionQuery !== null && teamMembers?.length
    ? teamMembers.filter(m => m.id && m.name?.toLowerCase().includes(mentionQuery.toLowerCase()))
    : []

  const pickMention = (member) => {
    setCommentText(prev => prev.replace(/(?:^|\s)@(\w*)$/, (m) => `${m.startsWith(' ') ? ' ' : ''}@${member.name} `))
    setMentionedIds(prev => prev.includes(member.id) ? prev : [...prev, member.id])
    setMentionQuery(null)
  }

  // Non-lus uniquement (pas le total) — sans ça le badge restait affiché même après avoir
  // ouvert et lu tous les commentaires.
  const readIds = getReadIds(currentUserId)
  const unreadComments = (comments || []).filter(c => !readIds.has(c.id)).length

  // Repliée (grille d'icônes, mobile par défaut — voir plus haut), les panneaux Historique
  // et Commentaires ne peuvent physiquement pas s'afficher : leur contenu n'est rendu que
  // si !collapsed. Un simple toggle de l'état ouvert/fermé ne suffit donc pas depuis cet
  // état — il faut d'abord déplier la sidebar, sinon le tap ne produit visiblement rien.
  const openHistory = () => {
    if (collapsed) {
      setCollapsed(false)
      setHistoryOpen(true)
      return
    }
    setHistoryOpen(v => !v)
  }

  const toggleComments = () => {
    if (collapsed) {
      setCollapsed(false)
      setCommentsOpen(true)
      if (comments?.length) {
        markCommentsRead(currentUserId, comments.map(c => c.id))
        setReadVersion(x => x + 1)
      }
      return
    }
    setCommentsOpen(v => {
      const next = !v
      if (next && comments?.length) {
        markCommentsRead(currentUserId, comments.map(c => c.id))
        setReadVersion(x => x + 1)
      }
      return next
    })
  }

  const toggleNovaHistory = () => {
    if (collapsed) {
      setCollapsed(false)
      setNovaHistoryOpen(true)
      return
    }
    setNovaHistoryOpen(v => !v)
  }

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

  // Sur mobile, la sidebar repliée n'affiche plus une grille d'icônes nues : une barre
  // unique avec précédent/suivant (grands boutons, faciles à taper) + la section active,
  // qui elle-même ouvre le sommaire complet (feuille modale) au tap — voir currentSection.
  const flatSections = GROUPS.flatMap(g => g.sections)
  const currentSection = flatSections.find(s => s.id === activeId) || flatSections[0]

  if (isMobile && collapsed) {
    return (
      <div className="plan-sidebar plan-sidebar-mobile-bar is-mobile collapsed">
        <button
          className="plan-sidebar-mobile-nav-btn"
          disabled={!mobileIndex || mobileIndex <= 0}
          onClick={onPrevSection}
          aria-label={lang === 'fr' ? 'Section précédente' : 'Previous section'}
        >
          <IconChevronLeft width={18} height={18} />
        </button>
        <button className="plan-sidebar-mobile-current" onClick={() => setCollapsed(false)}>
          {currentSection?.Icon && <currentSection.Icon width={15} height={15} className="plan-sidebar-mobile-current-icon" />}
          <span className="plan-sidebar-mobile-current-text">
            <span className="plan-sidebar-mobile-index">{(mobileIndex ?? 0) + 1}/{mobileTotal ?? flatSections.length}</span>
            <span className="plan-sidebar-mobile-label">{t(lang, currentSection?.labelKey)}</span>
          </span>
          <IconChevronDown width={13} height={13} className="plan-sidebar-mobile-chevron" />
        </button>
        <button
          className="plan-sidebar-mobile-nav-btn"
          disabled={mobileIndex == null || mobileTotal == null || mobileIndex >= mobileTotal - 1}
          onClick={onNextSection}
          aria-label={lang === 'fr' ? 'Section suivante' : 'Next section'}
        >
          <IconChevronRight width={18} height={18} />
        </button>
      </div>
    )
  }

  return (
    <>
      {isMobile && <div className="plan-sidebar-mobile-backdrop" onClick={() => setCollapsed(true)} />}
      <div
        className={`plan-sidebar ${collapsed ? 'collapsed' : ''} ${resizing ? 'resizing' : ''} ${isMobile ? 'is-mobile plan-sidebar-mobile-sheet' : ''}`}
        style={isMobile ? undefined : { width: currentWidth }}
      >
      {isMobile && (
        <button className="plan-sidebar-mobile-close" onClick={() => setCollapsed(true)} aria-label={lang === 'fr' ? 'Fermer le sommaire' : 'Close section list'}>
          <IconX width={16} height={16} />
        </button>
      )}
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

      {!!changeLog?.length && (
        <div className="plan-sidebar-history">
          <button
            className={`plan-sidebar-item plan-sidebar-history-toggle ${historyOpen ? 'open' : ''}`}
            onClick={openHistory}
            title={collapsed ? t(lang, 'outputs.historyPanelTitle') : t(lang, historyOpen ? 'outputs.historyCollapse' : 'outputs.historyExpand')}
          >
            <span className="plan-sidebar-icon"><IconHistory width={16} height={16} /></span>
            {!collapsed && (
              <>
                <span className="plan-sidebar-label">{t(lang, 'outputs.historyPanelTitle')}</span>
                <IconChevronDown width={12} height={12} className="plan-sidebar-history-chevron" />
              </>
            )}
          </button>

          {!collapsed && historyOpen && (
            <div className="plan-sidebar-history-panel">
              <div className="plan-sidebar-history-list">
                {changeLog.map((entry, i) => (
                  <div className="plan-sidebar-history-group" key={i}>
                    <span className="plan-sidebar-history-date">
                      {formatFullDateTime(entry.date, lang)}
                      {entry.author && <span className="plan-sidebar-history-author"> · {entry.author}</span>}
                    </span>
                    <ul className="change-list">
                      {(entry.changes || entry.sections || []).map((change, j) => (
                        <li className="change-row" key={j}>
                          {typeof change === 'string' ? (
                            <span className="change-detail">{change}</span>
                          ) : (
                            <>
                              <span className="change-section-tag">{sectionLabel(change.section, lang)}</span>
                              <span className="change-detail">{change.detail}</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="plan-sidebar-history-footer-actions">
                {onCompareVersions && (
                  <button className="plan-sidebar-history-compare" onClick={onCompareVersions}>
                    <IconCompass width={13} height={13} /> {t(lang, 'planVersions.compareLink')}
                  </button>
                )}
                <button className="plan-sidebar-history-clear" onClick={() => setConfirmClearHistory(true)}>
                  <IconTrash width={13} height={13} /> {t(lang, 'outputs.historyClear')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {onAddComment && (
        <div className="plan-sidebar-history">
          <button
            className={`plan-sidebar-item plan-sidebar-history-toggle ${commentsOpen ? 'open' : ''}`}
            onClick={toggleComments}
            title={collapsed ? (lang === 'fr' ? 'Commentaires' : 'Comments') : undefined}
          >
            <span className="plan-sidebar-icon"><IconMessageCircle width={16} height={16} /></span>
            {!collapsed && (
              <>
                <span className="plan-sidebar-label">
                  {lang === 'fr' ? 'Commentaires' : 'Comments'}
                  {unreadComments > 0 && <span className="plan-sidebar-comments-count">{unreadComments}</span>}
                </span>
                <IconChevronDown width={12} height={12} className="plan-sidebar-history-chevron" />
              </>
            )}
          </button>

          {!collapsed && commentsOpen && (
            <div className="plan-sidebar-history-panel">
              <div className="plan-sidebar-comments-composer">
                <select value={commentTopic} onChange={e => setCommentTopic(e.target.value)}>
                  {COMMENT_TOPICS.map(topic => (
                    <option key={topic.key} value={topic.key}>{topic[lang]}</option>
                  ))}
                </select>
                <div className="plan-sidebar-comment-textarea-wrap">
                  <textarea
                    value={commentText}
                    onChange={handleCommentTextChange}
                    placeholder={lang === 'fr' ? 'Écrire un commentaire… (@ pour mentionner)' : 'Write a comment… (@ to mention)'}
                    rows={2}
                  />
                  {!!mentionMatches.length && (
                    <div className="plan-sidebar-mention-dropdown">
                      {mentionMatches.map(m => (
                        <button type="button" key={m.id} onClick={() => pickMention(m)}>
                          {m.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className="plan-sidebar-comments-submit"
                  onClick={submitComment}
                  disabled={!commentText.trim()}
                >
                  {lang === 'fr' ? 'Publier' : 'Post'}
                </button>
              </div>

              {!!comments?.length && (
                <div className="plan-sidebar-history-list">
                  {comments.map(comment => (
                    <div className="plan-sidebar-comment" key={comment.id}>
                      <div className="plan-sidebar-comment-head">
                        <span className="change-section-tag">{topicLabel(comment.section, lang)}</span>
                        <span className="plan-sidebar-history-author">{comment.authorName}</span>
                        <span className="plan-sidebar-history-date">{formatFullDateTime(comment.createdAt, lang)}</span>
                        {comment.authorId === currentUserId && (
                          <button
                            className="plan-sidebar-comment-delete"
                            title={lang === 'fr' ? 'Supprimer' : 'Delete'}
                            onClick={() => onDeleteComment?.(comment.id)}
                          >
                            <IconX width={12} height={12} />
                          </button>
                        )}
                      </div>
                      <p className="plan-sidebar-comment-text">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!!copilotHistory?.length && (
        <div className="plan-sidebar-history">
          <button
            className={`plan-sidebar-item plan-sidebar-history-toggle ${novaHistoryOpen ? 'open' : ''}`}
            onClick={toggleNovaHistory}
            title={collapsed ? (lang === 'fr' ? 'Conversation Nova' : 'Nova conversation') : undefined}
          >
            <span className="plan-sidebar-icon"><IconSparkle width={16} height={16} /></span>
            {!collapsed && (
              <>
                <span className="plan-sidebar-label">{lang === 'fr' ? 'Conversation Nova' : 'Nova conversation'}</span>
                <IconChevronDown width={12} height={12} className="plan-sidebar-history-chevron" />
              </>
            )}
          </button>

          {!collapsed && novaHistoryOpen && (
            <div className="plan-sidebar-history-panel">
              <div className="plan-sidebar-history-list">
                {copilotHistory.map((m, i) => (
                  <div className="plan-sidebar-comment" key={i}>
                    <div className="plan-sidebar-comment-head">
                      <span className="change-section-tag">{m.role === 'user' ? (lang === 'fr' ? 'Vous' : 'You') : 'Nova'}</span>
                      {m.createdAt && <span className="plan-sidebar-history-date">{formatFullDateTime(m.createdAt, lang)}</span>}
                    </div>
                    <p className="plan-sidebar-comment-text">{m.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

      {!isMobile && !collapsed && (
        <div className="plan-sidebar-resize-handle" onMouseDown={startResize} />
      )}

      {!isMobile && (
        <button
          className={`plan-sidebar-collapse-handle ${collapsed ? 'is-collapsed' : ''}`}
          onClick={() => setCollapsed(c => !c)}
          onMouseDown={e => e.stopPropagation()}
          title={t(lang, collapsed ? 'sidebar.expand' : 'sidebar.collapse')}
        />
      )}

      {confirmClearHistory && (
        <InfoModal
          icon={<IconAlertTriangle width={22} height={22} />}
          title={t(lang, 'outputs.historyClearConfirmTitle')}
          onClose={() => setConfirmClearHistory(false)}
        >
          <p className="unsaved-changes-body">{t(lang, 'outputs.historyClearConfirmBody')}</p>
          <div className="unsaved-changes-actions">
            <button className="btn-secondary" onClick={() => setConfirmClearHistory(false)}>
              {t(lang, 'outputs.historyClearCancel')}
            </button>
            <button
              className="btn-primary"
              onClick={() => { setConfirmClearHistory(false); setHistoryOpen(false); onClearHistory?.() }}
            >
              {t(lang, 'outputs.historyClearConfirm')}
            </button>
          </div>
        </InfoModal>
      )}
      </div>
    </>
  )
}
