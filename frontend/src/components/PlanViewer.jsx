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
import { generateMarketingStrategy } from '../lib/planGenerator'
import { savePlan } from '../lib/planStorage'
import { useAuth, useUser, useTeam } from '../lib/auth'
import { t } from '../lib/i18n'
import { formatFullDateTime } from '../lib/dateFormat'
import { diffRoadmapItems, diffKpiItems, describeDateChange, describeMetricsChange, sectionLabel } from '../lib/changeDescriptions'
import { IconSparkle, IconCopy, IconCheckCircle, IconRocket, IconClock, IconCoin, IconUser, IconCompass, IconSave, IconAlertTriangle } from './Icons'
import '../styles/PlanViewer.css'
import '../styles/PlanSidebar.css'

export default function PlanViewer({ plan: initialPlan, justGenerated, onReset, lang, isPro, onRequestUpgrade }) {
  const { userId } = useAuth()
  const { user } = useUser()
  const team = useTeam()
  const [plan, setPlan] = useState(initialPlan)
  const [showExport, setShowExport] = useState(false)
  const [budget, setBudget] = useState(plan.marketing.totalBudget)
  const [disabledChannels, setDisabledChannels] = useState([])
  const [summaryCopied, setSummaryCopied] = useState(false)
  const [pendingChanges, setPendingChanges] = useState([])
  const [justSaved, setJustSaved] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const captureRef = useRef(null)

  const isDirty = pendingChanges.length > 0

  // Avertit avant de fermer/rafraîchir l'onglet s'il reste des modifications non
  // enregistrées — les navigateurs ignorent le texte personnalisé et affichent leur
  // propre message, mais le blocage lui-même fonctionne partout.
  useEffect(() => {
    if (!isDirty) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

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

  const updateGithub = (nextGithub) => {
    const nextPlan = { ...plan, github: nextGithub }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
  }

  const updateNotion = (nextNotion) => {
    const nextPlan = { ...plan, notion: nextNotion }
    setPlan(nextPlan)
    if (plan.id) savePlan(nextPlan)
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
    setPendingChanges([])
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2500)
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
  const addComment = (section, text) => {
    const trimmed = text.trim()
    if (!trimmed || !plan.id) return
    const comment = {
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      section,
      text: trimmed,
      authorId: userId,
      authorName: user?.fullName || user?.firstName || (lang === 'fr' ? 'Anonyme' : 'Anonymous'),
      createdAt: new Date().toISOString()
    }
    const nextPlan = { ...plan, comments: [comment, ...(plan.comments || [])] }
    setPlan(nextPlan)
    savePlan(nextPlan)
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
    <div className="plan-viewer-layout">
      {isDirty && (
        <div className="unsaved-banner" role="status">
          <div className="unsaved-banner-head">
            <IconSave width={15} height={15} className="unsaved-banner-icon" />
            <span className="unsaved-banner-title">{t(lang, 'app.pendingChangesTitle')(pendingChanges.length)}</span>
            <button className="unsaved-banner-save" onClick={handleSave}>{t(lang, 'app.save')}</button>
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
        onAddComment={addComment}
        onDeleteComment={deleteComment}
        currentUserId={userId}
      />
      <div className="plan-viewer plan-viewer-main" ref={captureRef}>
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
              {plan.classification && <span className="plan-badge plan-badge-accent">{plan.classification}</span>}
              {plan.product?.stage && <span className="plan-badge plan-badge-stage">{t(lang, 'product.stageOptions')[plan.product.stage] || plan.product.stage}</span>}
              {plan.product?.category && <span className="plan-badge plan-badge-category">{t(lang, 'product.categoryOptions')[plan.product.category] || plan.product.category}</span>}
            </div>
          </div>

          <div className="plan-header-stats">
            {plan.market?.b2bVsB2c && (
              <span className="plan-stat">
                <IconCompass width={13} height={13} />
                {t(lang, 'market.b2bVsB2cOptions')[plan.market.b2bVsB2c] || plan.market.b2bVsB2c}
                {plan.market?.geography && ` · ${t(lang, 'market.geographyOptions')[plan.market.geography] || plan.market.geography}`}
              </span>
            )}
            {plan.resources?.budgetEur && (
              <span className="plan-stat">
                <IconCoin width={13} height={13} />
                {t(lang, 'resources.budgetOptions')[plan.resources.budgetEur] || plan.resources.budgetEur}
              </span>
            )}
            {plan.resources?.timelineWeeks && (
              <span className="plan-stat">
                <IconClock width={13} height={13} />
                {t(lang, 'resources.timelineOptions')[plan.resources.timelineWeeks] || plan.resources.timelineWeeks}
              </span>
            )}
            {plan.resources?.teamSize && (
              <span className="plan-stat">
                <IconUser width={13} height={13} />
                {t(lang, 'resources.teamSizeOptions')[plan.resources.teamSize] || plan.resources.teamSize}
              </span>
            )}
          </div>
        </div>
        <div className="plan-actions">
          <button className="btn-secondary" onClick={() => setShowExport(true)}>{t(lang, 'app.export')}</button>
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
        <div id="section-dashboard" className="plan-section-anchor"><DashboardBI plan={plan} lang={lang} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.market')}</h2>
        <div id="section-persona" className="plan-section-anchor"><PersonaCard persona={plan.persona} lang={lang} /></div>
        <div id="section-veille" className="plan-section-anchor"><VeilleCard plan={plan} lang={lang} onVeilleChange={updateVeille} /></div>
        <div id="section-strategy" className="plan-section-anchor"><StrategyToolkitCard strategyToolkit={plan.strategyToolkit} lang={lang} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.execution')}</h2>
        <div id="section-calendar" className="plan-section-anchor"><CalendarView plan={plan} roadmap={plan.roadmap} lang={lang} generatedAt={plan.planStartDate || plan.generatedAt} launchDate={plan.launchDate} marketing={plan.marketing} /></div>
        <div id="section-roadmap" className="plan-section-anchor"><RoadmapCard roadmap={plan.roadmap} lang={lang} planStartDate={plan.planStartDate || plan.generatedAt} onPlanStartDateChange={updatePlanStartDate} onRoadmapChange={updateRoadmap} /></div>
        <div id="section-backlog" className="plan-section-anchor"><BacklogCard roadmap={plan.roadmap} lang={lang} onRoadmapChange={updateRoadmapFromBacklog} jira={plan.jira} plan={plan} userId={userId} isPro={isPro} onRequestUpgrade={onRequestUpgrade} onNotionStoriesSynced={updateNotion} teamMembers={team.teamId ? team.members : []} /></div>
        <div id="section-gantt" className="plan-section-anchor"><GanttChart roadmap={plan.roadmap} lang={lang} generatedAt={plan.planStartDate || plan.generatedAt} onRoadmapChange={updateRoadmapFromGantt} /></div>
        <div id="section-burndown" className="plan-section-anchor"><BurndownChart roadmap={plan.roadmap} lang={lang} generatedAt={plan.planStartDate || plan.generatedAt} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.gtm')}</h2>
        <div id="section-marketing" className="plan-section-anchor"><MarketingCard marketing={liveMarketing} lang={lang} disabledChannels={disabledChannels} onToggleChannel={toggleChannel} budget={budget} onBudgetChange={setBudget} /></div>
        <div id="section-gtm-calendar" className="plan-section-anchor"><GtmCalendarCard plan={{ ...plan, marketing: liveMarketing }} lang={lang} onEditorialChange={updateEditorial} onAdvertisingChange={updateAdvertising} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.performance')}</h2>
        <div id="section-kpis" className="plan-section-anchor"><KPIDashboard kpis={plan.kpis} lang={lang} onKpisChange={updateKpis} /></div>
        <div id="section-abtest" className="plan-section-anchor"><ABTestCalculatorCard lang={lang} /></div>
        <div id="section-benchmarks" className="plan-section-anchor"><BenchmarksCard plan={plan} lang={lang} onBenchmarksChange={updateBenchmarks} /></div>
        <div id="section-financials" className="plan-section-anchor"><FinancialsCard financials={plan.financials} lang={lang} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.compliance')}</h2>
        <div id="section-rgpd" className="plan-section-anchor"><RgpdCard plan={plan} lang={lang} onRgpdChange={updateRgpd} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.aitools')}</h2>
        <div id="section-table" className="plan-section-anchor"><GeneratedTable lang={lang} plan={{ ...plan, marketing: liveMarketing }} /></div>
        <div id="section-agents" className="plan-section-anchor"><AgentActivity plan={plan} userId={userId} lang={lang} /></div>

        <h2 className="plan-section-title">{t(lang, 'sidebar.groups.postlaunch')}</h2>
        <div id="section-tracking" className="plan-section-anchor"><PostLaunchTracking plan={plan} lang={lang} onMetricsChange={updateMetricsHistory} onLaunchDateChange={updateLaunchDate} /></div>
        <div id="section-whatif" className="plan-section-anchor"><WhatIfScenarios plan={plan} lang={lang} /></div>
      </div>

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
      </div>
    </div>
  )
}
