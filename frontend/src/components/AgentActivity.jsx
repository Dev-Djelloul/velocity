import { useEffect, useRef, useState } from 'react'
import { t } from '../lib/i18n'
import { enqueueAgentTask, fetchAgentTasks, removeAgentTask } from '../lib/serverStorage'
import { IconSparkle, IconCheckCircle, IconAlertTriangle, IconClock, IconClipboard, IconTarget, IconShield, IconCoin, IconTrash } from './Icons'
import '../styles/AgentActivity.css'

const POLL_MS = 2500

function allStories(roadmap) {
  return (roadmap?.sprints || []).flatMap(sp => sp.stories)
}

export default function AgentActivity({ plan, userId, lang, onRoadmapChange }) {
  const [tasks, setTasks] = useState([])
  const [selectedStoryId, setSelectedStoryId] = useState('')
  const [busy, setBusy] = useState(false)
  const [appliedIds, setAppliedIds] = useState(() => new Set())
  const pollRef = useRef(null)
  // Ids supprimés localement mais dont un refresh() déjà en vol (poll précédent) peut
  // encore renvoyer une version pré-suppression — sans ce filtre, cette réponse tardive
  // réinjecte la tâche dans l'état juste après le clic "Supprimer", qui semble alors
  // n'avoir rien fait (et reste ainsi si le polling s'arrête juste après).
  const deletedIdsRef = useRef(new Set())

  const planId = plan.id

  const refresh = async () => {
    if (!planId) return
    const next = await fetchAgentTasks(planId)
    setTasks(next.filter(t => !deletedIdsRef.current.has(t.id)))
  }

  useEffect(() => { refresh() }, [planId])

  useEffect(() => {
    const hasPending = tasks.some(t => t.status === 'queued' || t.status === 'running')
    if (hasPending && !pollRef.current) {
      pollRef.current = setInterval(refresh, POLL_MS)
    }
    if (!hasPending && pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [tasks])

  useEffect(() => () => pollRef.current && clearInterval(pollRef.current), [])

  if (!planId || !userId) return null

  const stories = allStories(plan.roadmap)

  const runBrief = async () => {
    const story = stories.find(s => s.id === selectedStoryId)
    if (!story || busy) return
    setBusy(true)
    await enqueueAgentTask(planId, userId, 'story_brief', {
      lang,
      productName: plan.product?.name,
      productPitch: plan.product?.pitch,
      storyTitle: story.title,
      storyDescription: story.description || story.title,
      assignee: story.assignee
    })
    await refresh()
    setBusy(false)
  }

  const runKpiRecalc = async () => {
    if (busy) return
    setBusy(true)
    const stories2 = allStories(plan.roadmap)
    const doneStories = stories2.filter(s => s.status === 'done').length
    await enqueueAgentTask(planId, userId, 'recalc_kpis', {
      lang,
      productName: plan.product?.name,
      doneStories,
      totalStories: stories2.length,
      elapsedWeeks: 0,
      totalWeeks: plan.roadmap?.totalDuration || 0,
      kpis: (plan.kpis || []).map(k => ({ name: k.name, target: k.target, baseline: k.baseline }))
    })
    await refresh()
    setBusy(false)
  }

  const runRiskAnalysis = async () => {
    if (busy) return
    setBusy(true)
    const stories2 = allStories(plan.roadmap)
    const doneStories = stories2.filter(s => s.status === 'done').length
    await enqueueAgentTask(planId, userId, 'risk_analysis', {
      lang,
      productName: plan.product?.name,
      productPitch: plan.product?.pitch,
      market: plan.market?.segment || plan.market?.b2bVsB2c,
      totalWeeks: plan.roadmap?.totalDuration || 0,
      teamSize: plan.resources?.teamSize,
      budget: plan.resources?.budgetEur,
      doneStories,
      totalStories: stories2.length
    })
    await refresh()
    setBusy(false)
  }

  const runBudgetOptimization = async () => {
    if (busy || !plan.marketing?.channels?.length) return
    setBusy(true)
    await enqueueAgentTask(planId, userId, 'budget_optimization', {
      lang,
      productName: plan.product?.name,
      totalBudget: plan.marketing.totalBudget,
      channels: plan.marketing.channels.map(c => ({ name: c.name, budget: c.budget, pct: c.pct, goal: c.goal }))
    })
    await refresh()
    setBusy(false)
  }

  const runDynamicReschedule = async () => {
    if (busy) return
    setBusy(true)
    const sprints = plan.roadmap?.sprints || []
    const currentSprint = sprints.find(sp => sp.stories.some(s => s.status !== 'done'))?.sprintId || sprints[sprints.length - 1]?.sprintId || 1
    await enqueueAgentTask(planId, userId, 'dynamic_reschedule', {
      lang,
      productName: plan.product?.name,
      currentSprint,
      totalSprints: sprints.length,
      sprints: sprints.map(sp => ({
        sprintId: sp.sprintId,
        stories: sp.stories.map(s => ({ id: s.id, title: s.title, effort: s.effort, status: s.status || 'todo', dependsOn: s.dependsOn || [] }))
      }))
    })
    await refresh()
    setBusy(false)
  }

  const runExternalPrioritization = async () => {
    if (busy) return
    setBusy(true)
    const backlogStories = stories.filter(s => (s.status || 'todo') !== 'done')
    await enqueueAgentTask(planId, userId, 'external_signal_prioritization', {
      lang,
      productName: plan.product?.name,
      productPitch: plan.product?.pitch,
      market: plan.market?.segment || plan.market?.b2bVsB2c,
      stories: backlogStories.map(s => ({ id: s.id, title: s.title, description: s.description }))
    })
    await refresh()
    setBusy(false)
  }

  const applyReschedule = (task) => {
    if (!onRoadmapChange || !plan.roadmap) return
    const moves = new Map((task.output?.moves || []).map(m => [m.storyId, m.toSprint]))
    if (!moves.size) return
    const allSprints = plan.roadmap.sprints
    const storiesById = new Map()
    allSprints.forEach(sp => sp.stories.forEach(s => storiesById.set(s.id, s)))
    const nextSprints = allSprints.map(sp => ({
      ...sp,
      stories: sp.stories.filter(s => !moves.has(s.id) || moves.get(s.id) === sp.sprintId)
    }))
    moves.forEach((toSprint, storyId) => {
      const story = storiesById.get(storyId)
      const target = nextSprints.find(sp => sp.sprintId === toSprint)
      if (story && target && !target.stories.some(s => s.id === storyId)) {
        target.stories.push(story)
      }
    })
    onRoadmapChange({ ...plan.roadmap, sprints: nextSprints })
    setAppliedIds(prev => new Set(prev).add(task.id))
  }

  const applyPrioritization = (task) => {
    if (!onRoadmapChange || !plan.roadmap) return
    const priorities = new Map((task.output?.priorities || []).map(p => [p.storyId, p]))
    if (!priorities.size) return
    const nextSprints = plan.roadmap.sprints.map(sp => ({
      ...sp,
      stories: sp.stories.map(s => priorities.has(s.id)
        ? { ...s, priorityScore: priorities.get(s.id).score, prioritySignal: priorities.get(s.id).signal, priorityRationale: priorities.get(s.id).rationale }
        : s)
    }))
    onRoadmapChange({ ...plan.roadmap, sprints: nextSprints })
    setAppliedIds(prev => new Set(prev).add(task.id))
  }

  const deleteTask = async (taskId) => {
    deletedIdsRef.current.add(taskId)
    setTasks(prev => prev.filter(task => task.id !== taskId))
    const ok = await removeAgentTask(userId, taskId)
    if (!ok) {
      deletedIdsRef.current.delete(taskId)
      await refresh() // échec silencieux côté serveur : on resynchronise pour ne pas rester désynchro
    }
  }

  const statusIcon = (status) => {
    if (status === 'done') return <IconCheckCircle width={14} height={14} className="agent-status-done" />
    if (status === 'error') return <IconAlertTriangle width={14} height={14} className="agent-status-error" />
    return <IconClock width={14} height={14} className="agent-status-pending" />
  }

  return (
    <div className="agent-activity card">
      <div className="agent-activity-header">
        <h3><IconSparkle width={16} height={16} /> {t(lang, 'agents.title')}</h3>
        <p className="agent-activity-subtitle">{t(lang, 'agents.subtitle')}</p>
      </div>

      <div className="agent-triggers">
        <div className="agent-trigger">
          <div className="agent-trigger-label"><IconClipboard width={14} height={14} /> {t(lang, 'agents.briefLabel')}</div>
          <p className="agent-trigger-desc">{t(lang, 'agents.briefDesc')}</p>
          <div className="agent-trigger-row">
            <select value={selectedStoryId} onChange={e => setSelectedStoryId(e.target.value)} disabled={busy}>
              <option value="">{t(lang, 'agents.selectStory')}</option>
              {stories.map(s => <option key={s.id} value={s.id}>{s.id} — {s.title}</option>)}
            </select>
            <button className="btn-ai-generate" onClick={runBrief} disabled={!selectedStoryId || busy}>
              <span className="btn-ai-generate-label">{t(lang, 'agents.run')}</span>
            </button>
          </div>
        </div>

        <div className="agent-trigger">
          <div className="agent-trigger-label"><IconTarget width={14} height={14} /> {t(lang, 'agents.kpiLabel')}</div>
          <p className="agent-trigger-desc">{t(lang, 'agents.kpiDesc')}</p>
          <div className="agent-trigger-row">
            <button className="btn-ai-generate" onClick={runKpiRecalc} disabled={busy}>
              <span className="btn-ai-generate-label">{t(lang, 'agents.run')}</span>
            </button>
          </div>
        </div>

        <div className="agent-trigger">
          <div className="agent-trigger-label"><IconShield width={14} height={14} /> {t(lang, 'agents.riskLabel')}</div>
          <p className="agent-trigger-desc">{t(lang, 'agents.riskDesc')}</p>
          <div className="agent-trigger-row">
            <button className="btn-ai-generate" onClick={runRiskAnalysis} disabled={busy}>
              <span className="btn-ai-generate-label">{t(lang, 'agents.run')}</span>
            </button>
          </div>
        </div>

        <div className="agent-trigger">
          <div className="agent-trigger-label"><IconCoin width={14} height={14} /> {t(lang, 'agents.budgetLabel')}</div>
          <p className="agent-trigger-desc">{t(lang, 'agents.budgetDesc')}</p>
          <div className="agent-trigger-row">
            <button className="btn-ai-generate" onClick={runBudgetOptimization} disabled={busy || !plan.marketing?.channels?.length}>
              <span className="btn-ai-generate-label">{t(lang, 'agents.run')}</span>
            </button>
          </div>
        </div>

        <div className="agent-trigger">
          <div className="agent-trigger-label"><IconClock width={14} height={14} /> {t(lang, 'agents.rescheduleLabel')}</div>
          <p className="agent-trigger-desc">{t(lang, 'agents.rescheduleDesc')}</p>
          <div className="agent-trigger-row">
            <button className="btn-ai-generate" onClick={runDynamicReschedule} disabled={busy}>
              <span className="btn-ai-generate-label">{t(lang, 'agents.run')}</span>
            </button>
          </div>
        </div>

        <div className="agent-trigger">
          <div className="agent-trigger-label"><IconTarget width={14} height={14} /> {t(lang, 'agents.prioritizeLabel')}</div>
          <p className="agent-trigger-desc">{t(lang, 'agents.prioritizeDesc')}</p>
          <div className="agent-trigger-row">
            <button className="btn-ai-generate" onClick={runExternalPrioritization} disabled={busy}>
              <span className="btn-ai-generate-label">{t(lang, 'agents.run')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="agent-log">
        <h4>{t(lang, 'agents.logTitle')}</h4>
        {tasks.length === 0 && <p className="agent-log-empty">{t(lang, 'agents.logEmpty')}</p>}
        {tasks.map(task => (
          <div key={task.id} className="agent-log-item">
            <div className="agent-log-item-head">
              {statusIcon(task.status)}
              <span className="agent-log-type">{t(lang, `agents.type.${task.type}`)}</span>
              <span className="agent-log-status">{t(lang, `agents.status.${task.status}`)}</span>
              <button
                className="agent-log-delete"
                onClick={() => deleteTask(task.id)}
                title={t(lang, 'agents.deleteTask')}
                aria-label={t(lang, 'agents.deleteTask')}
              >
                <IconTrash width={13} height={13} />
              </button>
            </div>

            {task.status === 'done' && task.type === 'story_brief' && task.output && (
              <div className="agent-log-result">
                <p className="agent-log-summary">{task.output.summary}</p>
                <ul>{task.output.steps?.map((s, i) => <li key={i}>{s}</li>)}</ul>
                {task.output.risks?.length > 0 && (
                  <p className="agent-log-risks">⚠ {task.output.risks.join(' · ')}</p>
                )}
              </div>
            )}

            {task.status === 'done' && task.type === 'recalc_kpis' && task.output && (
              <div className="agent-log-result">
                {task.output.kpis?.map((k, i) => (
                  <p key={i}><strong>{k.name}:</strong> {k.newTarget ?? '='} — {k.rationale}</p>
                ))}
              </div>
            )}

            {task.status === 'done' && task.type === 'risk_analysis' && task.output && (
              <div className="agent-log-result">
                {task.output.risks?.map((r, i) => (
                  <div key={i} className={`agent-risk-item severity-${r.severity}`}>
                    <div className="agent-risk-head">
                      <span className={`agent-risk-severity severity-${r.severity}`}>{t(lang, `agents.severity.${r.severity}`)}</span>
                      <span className="agent-risk-title">{r.risk}</span>
                    </div>
                    <p className="agent-risk-mitigation">{r.mitigation}</p>
                  </div>
                ))}
              </div>
            )}

            {task.status === 'done' && task.type === 'budget_optimization' && task.output && (
              <div className="agent-log-result">
                <p className="agent-log-summary">{task.output.assessment}</p>
                {task.output.moves?.map((m, i) => (
                  <p key={i} className={`agent-budget-move direction-${m.direction}`}>
                    <strong>{m.channel}</strong> — {t(lang, `agents.direction.${m.direction}`)} : {m.rationale}
                  </p>
                ))}
              </div>
            )}

            {task.status === 'done' && task.type === 'dynamic_reschedule' && task.output && (
              <div className="agent-log-result">
                <p className="agent-log-summary">{task.output.summary}</p>
                {task.output.moves?.map((m, i) => (
                  <p key={i}><strong>{m.storyId}</strong> → sprint {m.toSprint} — {m.rationale}</p>
                ))}
                {task.output.moves?.length > 0 && onRoadmapChange && (
                  <button className="btn-ai-generate" onClick={() => applyReschedule(task)} disabled={appliedIds.has(task.id)}>
                    <span className="btn-ai-generate-label">{t(lang, appliedIds.has(task.id) ? 'agents.applied' : 'agents.apply')}</span>
                  </button>
                )}
              </div>
            )}

            {task.status === 'done' && task.type === 'external_signal_prioritization' && task.output && (
              <div className="agent-log-result">
                <p className="agent-log-summary">{task.output.summary}</p>
                {task.output.priorities?.slice().sort((a, b) => (b.score || 0) - (a.score || 0)).map((p, i) => (
                  <p key={i}><strong>{p.storyId}</strong> [{p.score}/10 · {t(lang, `agents.signal.${p.signal}`)}] — {p.rationale}</p>
                ))}
                {task.output.priorities?.length > 0 && onRoadmapChange && (
                  <button className="btn-ai-generate" onClick={() => applyPrioritization(task)} disabled={appliedIds.has(task.id)}>
                    <span className="btn-ai-generate-label">{t(lang, appliedIds.has(task.id) ? 'agents.applied' : 'agents.apply')}</span>
                  </button>
                )}
              </div>
            )}

            {task.status === 'error' && (
              <p className="agent-log-error">{task.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
