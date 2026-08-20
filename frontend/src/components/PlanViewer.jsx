import { useState, useRef, useEffect } from 'react'
import PlanSidebar from './PlanSidebar'
import DashboardBI from './DashboardBI'
import PersonaCard from './PersonaCard'
import VeilleCard from './VeilleCard'
import BenchmarksCard from './BenchmarksCard'
import GtmCalendarCard from './GtmCalendarCard'
import RgpdCard from './RgpdCard'
import RoadmapCard from './RoadmapCard'
import BacklogCard from './BacklogCard'
import MarketingCard from './MarketingCard'
import KPIDashboard from './KPIDashboard'
import ABTestCalculatorCard from './ABTestCalculatorCard'
import FinancialsCard from './FinancialsCard'
import StrategyToolkitCard from './StrategyToolkitCard'
import GanttChart from './GanttChart'
import BurndownChart from './BurndownChart'
import CalendarView from './CalendarView'
import GeneratedTable from './GeneratedTable'
import AgentActivity from './AgentActivity'
import PostLaunchTracking from './PostLaunchTracking'
import WhatIfScenarios from './WhatIfScenarios'
import ExportModal from './ExportModal'
import InfoModal from './InfoModal'
import CopilotChat from './CopilotChat'
import CoverPicker from './CoverPicker'
import { generateMarketingStrategy } from '../lib/planGenerator'
import { formatMoney } from '../lib/currency'
import { savePlan as savePlanToStorage } from '../lib/planStorage'
import { notifyMentions } from '../lib/serverStorage'
import { useAuth, useUser, useTeam } from '../lib/auth'
import { t } from '../lib/i18n'
import { formatFullDateTime } from '../lib/dateFormat'
import { diffRoadmapItems, diffKpiItems, describeDateChange, describeMetricsChange, sectionLabel } from '../lib/changeDescriptions'
import { IconSparkle, IconCopy, IconCheckCircle, IconRocket, IconClock, IconCreditCard, IconMegaphone, IconUser, IconCompass, IconSave, IconAlertTriangle, IconChevronLeft, IconChevronRight, IconImage, IconPlus, IconDroplet, IconX } from './Icons'
import '../styles/PlanViewer.css'
import '../styles/PlanSidebar.css'

// Même ordre et mêmes ids que GROUPS dans PlanSidebar.jsx (dupliqué volontairement : les
// deux fichiers ont des besoins différents — ici juste id + libellé pour la navigation
// pas-à-pas mobile, là-bas la structure par groupe pour le sommaire complet). Sert à
// paginer le plan en mode mobile/tablette (voir mobileSectionId ci-dessous) au lieu du
// défilement continu, qui repartait toujours en haut de page sur iOS.
const SECTION_LIST = [
  { id: 'section-dashboard', labelKey: 'dashboardBi.title' },
  { id: 'section-persona', labelKey: 'sidebar.persona' },
  { id: 'section-veille', labelKey: 'veille.title' },
  { id: 'section-strategy', labelKey: 'outputs.strategy.title' },
  { id: 'section-calendar', labelKey: 'calendar.title' },
  { id: 'section-roadmap', labelKey: 'outputs.roadmap' },
  { id: 'section-backlog', labelKey: 'backlog.title' },
  { id: 'section-gantt', labelKey: 'gantt.title' },
  { id: 'section-burndown', labelKey: 'burndown.title' },
  { id: 'section-marketing', labelKey: 'outputs.marketing' },
  { id: 'section-gtm-calendar', labelKey: 'gtm.title' },
  { id: 'section-kpis', labelKey: 'outputs.kpis' },
  { id: 'section-abtest', labelKey: 'outputs.abTest' },
  { id: 'section-benchmarks', labelKey: 'benchmarks.title' },
  { id: 'section-financials', labelKey: 'outputs.financials.title' },
  { id: 'section-rgpd', labelKey: 'rgpd.title' },
  { id: 'section-table', labelKey: 'genTable.title' },
  { id: 'section-agents', labelKey: 'agents.title' },
  { id: 'section-tracking', labelKey: 'tracking.title' },
  { id: 'section-whatif', labelKey: 'whatif.title' }
]

export default function PlanViewer({ plan: initialPlan, justGenerated, onReset, lang, isPro, onRequestUpgrade, readOnly, onDuplicateReadOnly, novaToggle }) {
  // Choke point unique : un plan partagé (lien /s/:id) ouvert par un visiteur
  // connecté avec SON PROPRE compte ne doit jamais pouvoir écraser le plan d'un autre —
  // avant ce garde-fou, n'importe quel visiteur connecté pouvait modifier la roadmap, le
  // budget, activer le Copilote IA, etc. sur le plan de quelqu'un d'autre et voir ça
  // silencieusement persisté côté serveur (le user_id du propriétaire n'était jamais
  // touché, mais le contenu "data" du plan l'était). En "masquant" savePlan ici, tous les
  // appels existants (une quinzaine, un par section éditable) sont neutralisés d'un coup
  // sans avoir à toucher chacun individuellement.
  const savePlan = (p) => (readOnly ? p : savePlanToStorage(p))
  const { userId } = useAuth()
  const { user } = useUser()
  const team = useTeam()
  const [plan, setPlan] = useState(initialPlan)
  // Référence à la dernière version réellement enregistrée (mise à jour dans handleSave),
  // pour pouvoir y revenir depuis handleDiscardChanges — plan lui-même est déjà muté en
  // mémoire à chaque édition (voir plus bas), donc lui seul ne suffit pas à "annuler".
  const lastSavedPlanRef = useRef(initialPlan)
  const [showExport, setShowExport] = useState(false)
  const [showCoverPicker, setShowCoverPicker] = useState(false)
  const [showBgPicker, setShowBgPicker] = useState(false)
  const [budget, setBudget] = useState(plan.marketing.totalBudget)
  const [disabledChannels, setDisabledChannels] = useState([])
  const [summaryCopied, setSummaryCopied] = useState(false)
  const [pendingChanges, setPendingChanges] = useState([])
  const [justSaved, setJustSaved] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [mobileSectionId, setMobileSectionId] = useState(SECTION_LIST[0].id)
  const captureRef = useRef(null)

  const isDirty = pendingChanges.length > 0
  const mobileSectionIndex = SECTION_LIST.findIndex(s => s.id === mobileSectionId)

  // Change de section (sommaire replié en grille d'icônes sur mobile, ou boutons
  // précédent/suivant) — remonte en haut du contenu principal à chaque changement, sinon
  // on resterait scrollé au milieu d'une section qui vient de disparaître.
  const goToMobileSection = (id) => {
    setMobileSectionId(id)
    // Ne force le retour en haut de page qu'en layout mobile/tablette paginé (voir le
    // @media de PlanSidebar.css) — en desktop, le clic vient du sommaire qui gère déjà son
    // propre scroll-vers-la-section via l'ancre native, un window.scrollTo ici l'écraserait.
    if (window.innerWidth < 900) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Avertit avant de fermer/rafraîchir l'onglet s'il reste des modifications non
  // enregistrées — les navigateurs ignorent le texte personnalisé et affichent leur
  // propre message, mais le blocage lui-même fonctionne partout.
  useEffect(() => {
    if (!isDirty) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Le slider de budget marketing (section Stratégie marketing) part d'une copie locale
  // (`budget`) pour rester réactif pendant le drag sans réécrire le plan à chaque pixel —
  // mais ça la déconnecte de `plan.marketing.totalBudget` une fois montée. Sans ce reset,
  // une édition externe (copilote IA, régénération...) restait invisible tant que la page
  // n'était pas rechargée. Se resynchronise donc dès que la valeur source du plan bouge.
  useEffect(() => {
    setBudget(plan.marketing.totalBudget)
  }, [plan.marketing.totalBudget])

  // Une description précise (pas juste le nom de la section) pour chaque modification,
  // calculée au moment du changement pendant qu'on a encore l'ancienne ET la nouvelle
  // valeur sous la main — impossible à reconstituer après coup. `key` identifie l'élément
  // précis modifié (une story, un KPI...) : rééditer le même élément avant d'enregistrer
  // remplace l'entrée en attente au lieu d'en empiler une nouvelle à chaque clic — sinon
  // incrémenter un KPI dix fois de suite crée dix lignes dans le journal.
  const markChanged = (key, section, detail) => {
    setPendingChanges(prev => {
      const idx = prev.findIndex(c => c.key === key)
      if (idx === -1) return [...prev, { key, section, detail }]
      const next = [...prev]
      next[idx] = { key, section, detail }
      return next
    })
  }

  const budgetKeyFor = (value) => {
    if (value <= 3500) return 'b2k'
    if (value <= 7500) return 'b5k'
    if (value <= 17500) return 'b10k'
    if (value <= 37500) return 'b25k'
    return 'b50k'
  }

  const liveMarketing = (() => {
    const base = generateMarketingStrategy(plan.market ?? { b2bVsB2c: 'b2b' }, plan.priorities, budgetKeyFor(budget), plan.language || lang, plan.product?.category)
    const filtered = base.channels.filter(c => !disabledChannels.includes(c.name))
    const totalPct = filtered.reduce((s, c) => s + c.pct, 0) || 1
    const redistributed = filtered.map(c => ({ ...c, budget: Math.round((c.pct / totalPct) * budget) }))
    return { ...base, channels: redistributed, totalBudget: budget }
  })()

  const toggleChannel = (name) => {
    setDisabledChannels(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  // Éditions de contenu : mises à jour en mémoire seulement, l'enregistrement se fait
  // explicitement via le bouton "Enregistrer" (voir handleSave) pour laisser la main à
  // l'utilisateur — avant, chaque régénération (veille, benchmarks...) ou glisser-déposer
  // écrasait silencieusement la version sauvegardée.
  //
  // RoadmapCard, GanttChart et BacklogCard modifient tous la même donnée (roadmap.sprints)
  // mais depuis des vues différentes : on garde une fonction par origine pour que le
  // journal dise "Roadmap · Gantt" plutôt que juste "Roadmap" quand l'édition vient du
  // Gantt, et une entrée par story déplacée/modifiée (voir diffRoadmapItems).
  const updateRoadmapFrom = (section) => (nextRoadmap) => {
    const items = diffRoadmapItems(plan.roadmap, nextRoadmap, lang)
    if (items.length) {
      items.forEach(({ key, detail }) => markChanged(key, section, detail))
    } else {
      markChanged(section, section, lang === 'fr' ? 'Mise à jour' : 'Updated')
    }
    setPlan(p => ({ ...p, roadmap: nextRoadmap }))
  }
  const updateRoadmap = updateRoadmapFrom('roadmap')
  const updateRoadmapFromGantt = updateRoadmapFrom('roadmapGantt')
  const updateRoadmapFromBacklog = updateRoadmapFrom('roadmapBacklog')
  const updateRoadmapFromAgents = updateRoadmapFrom('roadmapAgents')

  const updatePlanStartDate = (dateStr) => {
    const nextIso = dateStr + 'T00:00:00Z'
    markChanged('planStartDate', 'planStartDate', describeDateChange(plan.planStartDate, nextIso, lang))
    setPlan(p => ({ ...p, planStartDate: nextIso }))
  }

  const updateKpis = (nextKpis) => {
    const items = diffKpiItems(plan.kpis, nextKpis, lang)
    if (items.length) {
      items.forEach(({ key, detail }) => markChanged(key, 'kpis', detail))
    } else {
      markChanged('kpis', 'kpis', lang === 'fr' ? 'Mis à jour' : 'Updated')
    }
    setPlan(p => ({ ...p, kpis: nextKpis }))
  }

  const updateMetricsHistory = (nextHistory) => {
    markChanged('metrics', 'metrics', describeMetricsChange(plan.metricsHistory, nextHistory, lang))
    setPlan(p => ({ ...p, metricsHistory: nextHistory }))
  }

  const updateLaunchDate = (dateStr) => {
    const nextIso = dateStr + 'T00:00:00Z'
    markChanged('launchDate', 'launchDate', describeDateChange(plan.launchDate, nextIso, lang))
    setPlan(p => ({ ...p, launchDate: nextIso }))
  }

  // Veille/benchmarks/éditorial/pub/RGPD sont régénérés en bloc par un agent IA (pas
  // d'édition fine) : la description la plus honnête du changement est "régénéré(e)",
  // ça correspond exactement à ce qui vient de se passer.
  const regeneratedLabel = lang === 'fr' ? 'Régénéré' : 'Regenerated'

  const updateVeille = (nextVeille) => {
    markChanged('veille', 'veille', regeneratedLabel)
    setPlan(p => ({ ...p, veille: nextVeille }))
  }

  const updateBenchmarks = (nextBenchmarks) => {
    markChanged('benchmarks', 'benchmarks', regeneratedLabel)
    setPlan(p => ({ ...p, benchmarks: nextBenchmarks }))
  }

  const updateEditorial = (nextEditorial) => {
    markChanged('editorial', 'editorial', regeneratedLabel)
    setPlan(p => ({ ...p, editorial: nextEditorial }))
  }

  const updateAdvertising = (nextAdvertising) => {
    markChanged('advertising', 'advertising', regeneratedLabel)
    setPlan(p => ({ ...p, advertising: nextAdvertising }))
  }

  const updateRgpd = (nextRgpd) => {
    markChanged('rgpd', 'rgpd', regeneratedLabel)
    setPlan(p => ({ ...p, rgpd: nextRgpd }))
  }

  // Jira/GitHub/Notion restent enregistrés immédiatement : ce ne sont pas des éditions de
  // contenu mais des accusés de réception techniques (quelles issues/pages existent déjà
  // côté provider) qui garantissent la synchronisation idempotente. Les laisser en attente
  // d'un clic sur "Enregistrer" risquerait de recréer les mêmes issues en double.
  const updateJira = (nextJira) => {
    const nextPlan = { ...plan, jira: nextJira }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const updateLinear = (nextLinear) => {
    const nextPlan = { ...plan, linear: nextLinear }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  // Image de couverture : même circuit immédiat que la visibilité publique ci-dessus (pas
  // soumise au bouton "Enregistrer"). CoverPicker résout déjà la valeur finale (data URL
  // redimensionnée pour un upload, data URL générée pour un dégradé/couleur de la galerie,
  // ou URL externe telle quelle pour l'onglet Lien) — value est directement stockable, ou
  // null pour supprimer la couverture.
  const updateCoverImage = (value) => {
    const nextPlan = { ...plan, coverImage: value }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const cyclePosition = { top: 'center', center: 'bottom', bottom: 'top' }
  const cycleCoverPosition = () => {
    const next = cyclePosition[plan.coverPosition || 'center']
    const nextPlan = { ...plan, coverPosition: next }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  // Fond de page derrière tout le plan (distinct de la couverture, qui reste une bannière en
  // haut de page) — même circuit immédiat que coverImage ci-dessus. Le flou est activé par
  // défaut (comme les fonds de Mon Espace/Mon compte...) mais désactivable, l'image choisie
  // ici pouvant déjà être discrète (motif, dégradé...) et ne pas en avoir besoin.
  const updatePageBackground = (value) => {
    const nextPlan = { ...plan, pageBackground: value, pageBackgroundBlur: value ? (plan.pageBackgroundBlur ?? true) : plan.pageBackgroundBlur }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const togglePageBackgroundBlur = () => {
    const nextPlan = { ...plan, pageBackgroundBlur: !(plan.pageBackgroundBlur ?? true) }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  // Appartenance à la galerie privée : opt-in explicite (contrairement à l'ancienne version
  // qui listait automatiquement tous les plans) — même circuit immédiat que la couverture
  // ci-dessus, indépendant du bouton "Enregistrer".
  const toggleInGallery = () => {
    if (!plan.id) return
    const nextPlan = { ...plan, inGallery: !plan.inGallery }
    setPlan(nextPlan)
    savePlan(nextPlan)
  }

  const updateGoogleCalendar = (nextGoogleCalendar) => {
    const nextPlan = { ...plan, googleCalendar: nextGoogleCalendar }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const updateGithub = (nextGithub) => {
    const nextPlan = { ...plan, github: nextGithub }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  // Historique du copilote IA : sauvegardé immédiatement comme les commentaires, pas soumis
  // au bouton "Enregistrer" — c'est une conversation, pas une édition de contenu. Plafonné
  // aux 50 derniers messages (même limite que changeLog) pour ne pas alourdir le plan indéfiniment.
  const updateCopilotHistory = (nextMessages) => {
    const nextPlan = { ...plan, copilotHistory: nextMessages.slice(-50) }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const updateNotion = (nextNotion) => {
    const nextPlan = { ...plan, notion: nextNotion }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  // Copilote IA conversationnel (voir CopilotChat.jsx) : chaque section modifiée passe par
  // le même circuit que les autres éditions (markChanged + pendingChanges) plutôt que
  // d'écraser directement le plan sauvegardé — l'utilisateur valide toujours via "Enregistrer".
  const applyCopilotChanges = (changes) => {
    if (!changes?.length) return
    setPlan(p => {
      const next = { ...p }
      changes.forEach(({ section, value }) => { next[section] = value })
      return next
    })
    changes.forEach(({ section, summary }) => {
      markChanged(section, section, summary || (lang === 'fr' ? 'Modifié via le copilote' : 'Edited via copilot'))
    })
  }

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(plan.executiveSummary)
      setSummaryCopied(true)
      setTimeout(() => setSummaryCopied(false), 2000)
    } catch { /* clipboard indisponible, on ignore silencieusement */ }
  }

  const handleSave = () => {
    if (!plan.id || !isDirty) return
    // L'auteur n'a d'intérêt qu'en équipe (plusieurs personnes sur le même plan) mais on
    // le garde aussi pour un plan personnel — coût nul, et ça rend le futur passage d'un
    // plan personnel vers une équipe cohérent rétroactivement.
    const author = user?.fullName || user?.firstName || null
    const nextChangeLog = [
      { date: new Date().toISOString(), author, changes: pendingChanges.map(({ section, detail }) => ({ section, detail })) },
      ...(plan.changeLog || [])
    ].slice(0, 50)
    const savedPlan = savePlan({ ...plan, changeLog: nextChangeLog })
    setPlan(savedPlan)
    lastSavedPlanRef.current = savedPlan
    setPendingChanges([])
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2500)
  }

  // Annule les modifications en attente : revient à la dernière version enregistrée plutôt
  // que de simplement vider le journal, sinon les données déjà mutées en mémoire (roadmap
  // déplacée, KPI édité...) resteraient affichées malgré le bandeau qui disparaît.
  const handleDiscardChanges = () => {
    setPlan(lastSavedPlanRef.current)
    setPendingChanges([])
  }

  // Efface le journal des modifications (pas le plan lui-même) — action immédiate une fois
  // confirmée dans la popup d'avertissement de PlanSidebar, pas soumise au bouton
  // "Enregistrer" : l'utilisateur vient de valider explicitement une suppression définitive.
  const handleClearHistory = () => {
    if (!plan.id) return
    const cleared = { ...plan, changeLog: [] }
    setPlan(cleared)
    savePlan(cleared)
  }

  // Commentaires : postés/supprimés immédiatement (comme Jira/GitHub/Notion plus haut),
  // pas soumis au bouton "Enregistrer" — c'est une conversation, pas une édition de
  // contenu, ça n'a pas de sens de la faire attendre derrière les modifications en cours.
  const addComment = (section, text, mentionedIds) => {
    const trimmed = text.trim()
    if (!trimmed || !plan.id) return
    const comment = {
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      section,
      text: trimmed,
      authorId: userId,
      authorName: user?.fullName || user?.firstName || (lang === 'fr' ? 'Anonyme' : 'Anonymous'),
      createdAt: new Date().toISOString(),
      mentions: mentionedIds?.length ? mentionedIds : undefined
    }
    const nextPlan = { ...plan, comments: [comment, ...(plan.comments || [])] }
    setPlan(nextPlan)
    savePlan(nextPlan)
    // Best-effort, indépendant de la sauvegarde du plan : notifie chaque personne
    // mentionnée selon SA propre préférence (pas celle du propriétaire du plan).
    if (comment.mentions?.length) notifyMentions(plan, comment, comment.mentions, lang, userId)
  }

  const deleteComment = (id) => {
    if (!plan.id) return
    const nextPlan = { ...plan, comments: (plan.comments || []).filter(c => c.id !== id) }
    setPlan(nextPlan)
    savePlan(nextPlan)
  }

  const handleNewPlanClick = () => {
    if (isDirty) {
      setConfirmLeave(true)
      return
    }
    onReset()
  }

  const generatedDateTime = formatFullDateTime(plan.generatedAt || plan.savedAt || plan.updatedAt, lang)

  // Une ligne de changement : compatible avec les entrées enregistrées avant l'ajout du
  // préfixe de section (simples chaînes).
  const ChangeRow = ({ change }) => {
    if (typeof change === 'string') return <li className="change-row"><span className="change-detail">{change}</span></li>
    return (
      <li className="change-row">
        <span className="change-section-tag">{sectionLabel(change.section, lang)}</span>
        <span className="change-detail">{change.detail}</span>
      </li>
    )
  }

  return (
    <div className="plan-page-outer">
      {plan.pageBackground && (
        <div
          className={`plan-page-bg${(plan.pageBackgroundBlur ?? true) ? ' page-bg-blur' : ''}`}
          style={{ backgroundImage: `url(${plan.pageBackground})` }}
          aria-hidden="true"
        />
      )}
    <div className="plan-viewer-layout">
      {readOnly && (
        <div className="readonly-banner" role="status">
          <span>{t(lang, 'app.readOnlyBanner')}</span>
          <button className="btn-primary" onClick={() => onDuplicateReadOnly?.(plan)}>
            <IconCopy width={14} height={14} /> {t(lang, 'app.readOnlyDuplicate')}
          </button>
        </div>
      )}
      {!readOnly && isDirty && (
        <div className="unsaved-banner" role="status">
          <div className="unsaved-banner-head">
            <IconSave width={15} height={15} className="unsaved-banner-icon" />
            <span className="unsaved-banner-title">{t(lang, 'app.pendingChangesTitle')(pendingChanges.length)}</span>
            <button className="unsaved-banner-save" onClick={handleSave}>{t(lang, 'app.save')}</button>
            <button
              type="button"
              className="unsaved-banner-discard"
              onClick={handleDiscardChanges}
              title={t(lang, 'app.discardPendingChanges')}
              aria-label={t(lang, 'app.discardPendingChanges')}
            >
              <IconX width={13} height={13} />
            </button>
          </div>
          <ul className="change-list">
            {pendingChanges.map(change => <ChangeRow key={change.key} change={change} />)}
          </ul>
        </div>
      )}
      <PlanSidebar
        lang={lang}
        onNewPlan={handleNewPlanClick}
        changeLog={plan.changeLog}
        onClearHistory={handleClearHistory}
        comments={plan.comments}
        onAddComment={readOnly ? undefined : addComment}
        onDeleteComment={deleteComment}
        copilotHistory={plan.copilotHistory}
        teamMembers={team.members}
        currentUserId={userId}
        onSectionSelect={goToMobileSection}
        activeSection={mobileSectionId}
      />
      <div className="plan-viewer plan-viewer-main" ref={captureRef}>
      <div className="mobile-section-nav">
        <button
          className="mobile-section-nav-btn"
          disabled={mobileSectionIndex <= 0}
          onClick={() => goToMobileSection(SECTION_LIST[mobileSectionIndex - 1].id)}
          aria-label={lang === 'fr' ? 'Section précédente' : 'Previous section'}
        >
          <IconChevronLeft width={16} height={16} />
        </button>
        <span className="mobile-section-nav-label">
          <span className="mobile-section-nav-index">{mobileSectionIndex + 1}/{SECTION_LIST.length}</span>
          {t(lang, SECTION_LIST[mobileSectionIndex].labelKey)}
        </span>
        <button
          className="mobile-section-nav-btn"
          disabled={mobileSectionIndex >= SECTION_LIST.length - 1}
          onClick={() => goToMobileSection(SECTION_LIST[mobileSectionIndex + 1].id)}
          aria-label={lang === 'fr' ? 'Section suivante' : 'Next section'}
        >
          <IconChevronRight width={16} height={16} />
        </button>
      </div>
      {plan.id && (
        <div className={`plan-cover-banner ${plan.coverImage ? 'has-image' : ''}`}>
          {plan.coverImage && (
            <img
              src={plan.coverImage}
              alt=""
              className="plan-cover-banner-img"
              style={{ objectPosition: `center ${plan.coverPosition || 'center'}` }}
            />
          )}
          {!readOnly && (
            <div className="plan-cover-banner-actions">
              <button className="plan-cover-banner-btn" onClick={() => setShowCoverPicker(true)}>
                <IconImage width={14} height={14} />
                {plan.coverImage ? t(lang, 'app.coverImageChange') : t(lang, 'app.coverImageAdd')}
              </button>
              {plan.coverImage && (
                <button className="plan-cover-banner-btn" onClick={cycleCoverPosition}>
                  {t(lang, 'app.coverReposition')}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {!readOnly && plan.id && (
        <div className="plan-bg-controls">
          <button className="plan-cover-banner-btn" onClick={() => setShowBgPicker(true)}>
            <IconImage width={14} height={14} />
            {plan.pageBackground ? t(lang, 'app.pageBgChange') : t(lang, 'app.pageBgAdd')}
          </button>
          {plan.pageBackground && (
            <button className={`plan-cover-banner-btn${(plan.pageBackgroundBlur ?? true) ? ' active' : ''}`} onClick={togglePageBackgroundBlur}>
              <IconDroplet width={14} height={14} />
              {(plan.pageBackgroundBlur ?? true) ? t(lang, 'app.pageBgBlurOn') : t(lang, 'app.pageBgBlurOff')}
            </button>
          )}
        </div>
      )}

      {generatedDateTime && (
        <div className={`plan-confirmation ${justGenerated ? 'just-generated' : 'loaded'}`}>
          <span className="plan-confirmation-icon" aria-hidden="true">
            {justGenerated ? <IconRocket width={22} height={22} /> : <img src="/assets/icons/icons8-clock.gif" width={22} height={22} alt="" />}
          </span>
          <div className="plan-confirmation-text">
            <h3>{justGenerated ? t(lang, 'outputs.planReadyTitle') : t(lang, 'outputs.planLoadedTitle')}</h3>
            <p>{justGenerated ? t(lang, 'outputs.planReadySubtitle')(generatedDateTime) : t(lang, 'outputs.planLoadedSubtitle')(generatedDateTime)}</p>
          </div>
        </div>
      )}

      <div className="plan-header card">
        <div className="plan-header-main">
          <div className="plan-header-top">
            <h2>{plan.product?.name}</h2>
            <div className="plan-badges">
              {plan.classification && (
                <span className="plan-badge plan-badge-accent plan-stat-tooltip" data-tooltip={t(lang, 'resources.classificationHelp')}>
                  {plan.classification}
                </span>
              )}
              {plan.product?.stage && (
                <span className="plan-badge plan-badge-stage plan-stat-tooltip" data-tooltip={t(lang, 'product.stageGlossary')[plan.product.stage]}>
                  {t(lang, 'product.stageOptions')[plan.product.stage] || plan.product.stage}
                </span>
              )}
              {plan.product?.category && (
                <span className="plan-badge plan-badge-category plan-stat-tooltip" data-tooltip={t(lang, 'product.categoryGlossary')[plan.product.category]}>
                  {t(lang, 'product.categoryOptions')[plan.product.category] || plan.product.category}
                </span>
              )}
            </div>
          </div>

          <div className="plan-header-stats">
            {plan.market?.b2bVsB2c && (
              <span className="plan-stat plan-stat-tooltip" data-tooltip={t(lang, 'market.marketStatHelp')}>
                <IconCompass width={13} height={13} />
                {t(lang, 'market.b2bVsB2cOptions')[plan.market.b2bVsB2c] || plan.market.b2bVsB2c}
                {plan.market?.geography && ` · ${t(lang, 'market.geographyOptions')[plan.market.geography] || plan.market.geography}`}
              </span>
            )}
            {plan.resources?.totalBudget && (
              <span className="plan-stat plan-stat-tooltip" data-tooltip={t(lang, 'resources.totalBudgetHelp')}>
                <IconCreditCard width={13} height={13} />
                {t(lang, 'resources.budgetOptions')[plan.resources.totalBudget] || plan.resources.totalBudget}
              </span>
            )}
            {(plan.marketing?.totalBudget != null || plan.resources?.budgetEur) && (
              <span className="plan-stat plan-stat-tooltip" data-tooltip={t(lang, 'resources.budgetEurHelp')}>
                <IconMegaphone width={13} height={13} />
                {plan.marketing?.totalBudget != null
                  ? formatMoney(plan.marketing.totalBudget)
                  : (t(lang, 'resources.budgetOptions')[plan.resources.budgetEur] || plan.resources.budgetEur)}
              </span>
            )}
            {plan.resources?.timelineWeeks && (
              <span className="plan-stat plan-stat-tooltip" data-tooltip={t(lang, 'resources.timelineWeeksHelp')}>
                <IconClock width={13} height={13} />
                {t(lang, 'resources.timelineOptions')[plan.resources.timelineWeeks] || plan.resources.timelineWeeks}
              </span>
            )}
            {plan.resources?.teamSize && (
              <span className="plan-stat plan-stat-tooltip" data-tooltip={t(lang, 'resources.teamSizeHelp')}>
                <IconUser width={13} height={13} />
                {t(lang, 'resources.teamSizeOptions')[plan.resources.teamSize] || plan.resources.teamSize}
              </span>
            )}
          </div>
        </div>
        <div className="plan-actions">
          {plan.id && !readOnly && (
            <button
              className={`btn-secondary plan-gallery-toggle ${plan.inGallery ? 'is-in-gallery' : ''}`}
              onClick={toggleInGallery}
              title={plan.inGallery ? t(lang, 'gallery.removeFromGallery') : t(lang, 'gallery.addToGallery')}
            >
              {plan.inGallery ? <IconCheckCircle width={14} height={14} /> : <IconPlus width={14} height={14} />}
              {plan.inGallery ? t(lang, 'gallery.inGallery') : t(lang, 'gallery.addToGallery')}
            </button>
          )}
          <button className="btn-secondary" onClick={() => setShowExport(true)}>{t(lang, 'app.export')}</button>
          {!readOnly && (
            <button
              className={`plan-save-btn ${isDirty ? 'is-dirty' : ''} ${justSaved ? 'just-saved' : ''}`}
              onClick={handleSave}
              disabled={!isDirty}
              title={isDirty ? t(lang, 'app.save') : t(lang, 'app.saved')}
            >
              {justSaved
                ? <IconCheckCircle width={14} height={14} className="plan-save-btn-icon" />
                : <IconSave width={14} height={14} className="plan-save-btn-icon" />}
              <span className="plan-save-btn-label">
                {justSaved ? t(lang, 'app.saved') : (isDirty ? t(lang, 'app.save') : t(lang, 'app.saved'))}
              </span>
            </button>
          )}
        </div>
      </div>

      {plan.executiveSummary && (
        <div className="executive-summary card">
          <div className="executive-summary-icon"><IconSparkle width={18} height={18} /></div>
          <div className="executive-summary-body">
            <h3 className="executive-summary-title">{t(lang, 'outputs.executiveSummaryTitle')}</h3>
            <p>{plan.executiveSummary}</p>
          </div>
          <button className="executive-summary-copy" onClick={copySummary} title={t(lang, 'outputs.copySummary')}>
            {summaryCopied ? <IconCheckCircle width={16} height={16} /> : <IconCopy width={16} height={16} />}
          </button>
        </div>
      )}

      <div className="plan-grid">
        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.synthese')}</h2>
        <div id="section-dashboard" className={`plan-section-anchor ${mobileSectionId === 'section-dashboard' ? 'is-active' : ''}`}><DashboardBI plan={plan} lang={lang} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.market')}</h2>
        <div id="section-persona" className={`plan-section-anchor ${mobileSectionId === 'section-persona' ? 'is-active' : ''}`}>
          <div className="persona-cards-row">
            <PersonaCard persona={plan.persona} lang={lang} />
            {(plan.personas || []).map((p, i) => <PersonaCard key={i} persona={p} lang={lang} />)}
          </div>
        </div>
        <div id="section-veille" className={`plan-section-anchor ${mobileSectionId === 'section-veille' ? 'is-active' : ''}`}><VeilleCard plan={plan} lang={lang} onVeilleChange={updateVeille} userId={userId} /></div>
        <div id="section-strategy" className={`plan-section-anchor ${mobileSectionId === 'section-strategy' ? 'is-active' : ''}`}><StrategyToolkitCard strategyToolkit={plan.strategyToolkit} lang={lang} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.execution')}</h2>
        <div id="section-calendar" className={`plan-section-anchor ${mobileSectionId === 'section-calendar' ? 'is-active' : ''}`}><CalendarView plan={plan} roadmap={plan.roadmap} lang={lang} generatedAt={plan.planStartDate || plan.generatedAt} launchDate={plan.launchDate} marketing={plan.marketing} /></div>
        <div id="section-roadmap" className={`plan-section-anchor ${mobileSectionId === 'section-roadmap' ? 'is-active' : ''}`}><RoadmapCard roadmap={plan.roadmap} lang={lang} planStartDate={plan.planStartDate || plan.generatedAt} onPlanStartDateChange={updatePlanStartDate} onRoadmapChange={updateRoadmap} /></div>
        <div id="section-backlog" className={`plan-section-anchor ${mobileSectionId === 'section-backlog' ? 'is-active' : ''}`}><BacklogCard roadmap={plan.roadmap} lang={lang} onRoadmapChange={updateRoadmapFromBacklog} jira={plan.jira} plan={plan} userId={userId} isPro={isPro} onRequestUpgrade={onRequestUpgrade} onNotionStoriesSynced={updateNotion} teamMembers={team.teamId ? team.members : []} /></div>
        <div id="section-gantt" className={`plan-section-anchor ${mobileSectionId === 'section-gantt' ? 'is-active' : ''}`}><GanttChart roadmap={plan.roadmap} lang={lang} generatedAt={plan.planStartDate || plan.generatedAt} onRoadmapChange={updateRoadmapFromGantt} /></div>
        <div id="section-burndown" className={`plan-section-anchor ${mobileSectionId === 'section-burndown' ? 'is-active' : ''}`}><BurndownChart roadmap={plan.roadmap} lang={lang} generatedAt={plan.planStartDate || plan.generatedAt} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.gtm')}</h2>
        <div id="section-marketing" className={`plan-section-anchor ${mobileSectionId === 'section-marketing' ? 'is-active' : ''}`}><MarketingCard marketing={liveMarketing} lang={lang} disabledChannels={disabledChannels} onToggleChannel={toggleChannel} budget={budget} onBudgetChange={setBudget} /></div>
        <div id="section-gtm-calendar" className={`plan-section-anchor ${mobileSectionId === 'section-gtm-calendar' ? 'is-active' : ''}`}><GtmCalendarCard plan={{ ...plan, marketing: liveMarketing }} lang={lang} onEditorialChange={updateEditorial} onAdvertisingChange={updateAdvertising} userId={userId} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.performance')}</h2>
        <div id="section-kpis" className={`plan-section-anchor ${mobileSectionId === 'section-kpis' ? 'is-active' : ''}`}><KPIDashboard kpis={plan.kpis} lang={lang} onKpisChange={updateKpis} /></div>
        <div id="section-abtest" className={`plan-section-anchor ${mobileSectionId === 'section-abtest' ? 'is-active' : ''}`}><ABTestCalculatorCard lang={lang} /></div>
        <div id="section-benchmarks" className={`plan-section-anchor ${mobileSectionId === 'section-benchmarks' ? 'is-active' : ''}`}><BenchmarksCard plan={plan} lang={lang} onBenchmarksChange={updateBenchmarks} userId={userId} /></div>
        <div id="section-financials" className={`plan-section-anchor ${mobileSectionId === 'section-financials' ? 'is-active' : ''}`}><FinancialsCard financials={plan.financials} lang={lang} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.compliance')}</h2>
        <div id="section-rgpd" className={`plan-section-anchor ${mobileSectionId === 'section-rgpd' ? 'is-active' : ''}`}><RgpdCard plan={plan} lang={lang} onRgpdChange={updateRgpd} userId={userId} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.aitools')}</h2>
        <div id="section-table" className={`plan-section-anchor ${mobileSectionId === 'section-table' ? 'is-active' : ''}`}><GeneratedTable lang={lang} plan={{ ...plan, marketing: liveMarketing }} userId={userId} /></div>
        <div id="section-agents" className={`plan-section-anchor ${mobileSectionId === 'section-agents' ? 'is-active' : ''}`}><AgentActivity plan={plan} userId={userId} lang={lang} onRoadmapChange={updateRoadmapFromAgents} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.postlaunch')}</h2>
        <div id="section-tracking" className={`plan-section-anchor ${mobileSectionId === 'section-tracking' ? 'is-active' : ''}`}><PostLaunchTracking plan={plan} lang={lang} onMetricsChange={updateMetricsHistory} onLaunchDateChange={updateLaunchDate} /></div>
        <div id="section-whatif" className={`plan-section-anchor ${mobileSectionId === 'section-whatif' ? 'is-active' : ''}`}><WhatIfScenarios plan={plan} lang={lang} /></div>
      </div>

      {showCoverPicker && (
        <CoverPicker
          lang={lang}
          hasCover={!!plan.coverImage}
          onChange={updateCoverImage}
          onClose={() => setShowCoverPicker(false)}
        />
      )}

      {showBgPicker && (
        <CoverPicker
          lang={lang}
          hasCover={!!plan.pageBackground}
          onChange={updatePageBackground}
          onClose={() => setShowBgPicker(false)}
          title={t(lang, 'app.pageBgTitle')}
          removeLabel={t(lang, 'app.pageBgRemove')}
        />
      )}

      {showExport && (
        <ExportModal
          plan={{ ...plan, marketing: liveMarketing }}
          lang={lang}
          userId={userId}
          isPro={isPro}
          onRequestUpgrade={() => { setShowExport(false); onRequestUpgrade?.() }}
          onClose={() => setShowExport(false)}
          captureRef={captureRef}
          onJiraExported={updateJira}
          onGithubExported={updateGithub}
          onLinearExported={updateLinear}
          onGoogleCalendarExported={updateGoogleCalendar}
        />
      )}

      {confirmLeave && (
        <InfoModal
          icon={<IconAlertTriangle width={22} height={22} />}
          title={t(lang, 'app.unsavedChangesTitle')}
          onClose={() => setConfirmLeave(false)}
        >
          <p className="unsaved-changes-body">{t(lang, 'app.unsavedChangesBody')}</p>
          <div className="unsaved-changes-actions">
            <button className="btn-secondary" onClick={() => { setConfirmLeave(false); onReset() }}>
              {t(lang, 'app.discardChanges')}
            </button>
            <button className="btn-primary" onClick={() => { handleSave(); setConfirmLeave(false); onReset() }}>
              {t(lang, 'app.saveAndContinue')}
            </button>
          </div>
        </InfoModal>
      )}

      {!readOnly && <CopilotChat plan={plan} lang={lang} userId={userId} onApplyChanges={applyCopilotChanges} onHistoryChange={updateCopilotHistory} toggleSignal={novaToggle} />}
      </div>
    </div>
    </div>
  )
}
