import { useEffect, useRef, useState } from 'react'
import { t } from '../lib/i18n'
import { enqueueAgentTask, fetchAgentTasks } from '../lib/serverStorage'
import { IconSparkle, IconCheckCircle, IconAlertTriangle, IconClock, IconClipboard, IconTarget, IconShield, IconCoin } from './Icons'
import '../styles/AgentActivity.css'

const POLL_MS = 2500

function allStories(roadmap) {
  return (roadmap?.sprints || []).flatMap(sp => sp.stories)
}

export default function AgentActivity({ plan, userId, lang }) {
  const [tasks, setTasks] = useState([])
  const [selectedStoryId, setSelectedStoryId] = useState('')
  const [busy, setBusy] = useState(false)
  const pollRef = useRef(null)

  const planId = plan.id

  const refresh = async () => {
    if (!planId) return
    const next = await fetchAgentTasks(planId)
    setTasks(next)
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
            <button className="btn-primary" onClick={runBrief} disabled={!selectedStoryId || busy}>
              {t(lang, 'agents.run')}
            </button>
          </div>
        </div>

        <div className="agent-trigger">
          <div className="agent-trigger-label"><IconTarget width={14} height={14} /> {t(lang, 'agents.kpiLabel')}</div>
          <p className="agent-trigger-desc">{t(lang, 'agents.kpiDesc')}</p>
          <div className="agent-trigger-row">
            <button className="btn-primary" onClick={runKpiRecalc} disabled={busy}>
              {t(lang, 'agents.run')}
            </button>
          </div>
        </div>

        <div className="agent-trigger">
          <div className="agent-trigger-label"><IconShield width={14} height={14} /> {t(lang, 'agents.riskLabel')}</div>
          <p className="agent-trigger-desc">{t(lang, 'agents.riskDesc')}</p>
          <div className="agent-trigger-row">
            <button className="btn-primary" onClick={runRiskAnalysis} disabled={busy}>
              {t(lang, 'agents.run')}
            </button>
          </div>
        </div>

        <div className="agent-trigger">
          <div className="agent-trigger-label"><IconCoin width={14} height={14} /> {t(lang, 'agents.budgetLabel')}</div>
          <p className="agent-trigger-desc">{t(lang, 'agents.budgetDesc')}</p>
          <div className="agent-trigger-row">
            <button className="btn-primary" onClick={runBudgetOptimization} disabled={busy || !plan.marketing?.channels?.length}>
              {t(lang, 'agents.run')}
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

            {task.status === 'error' && (
              <p className="agent-log-error">{task.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
