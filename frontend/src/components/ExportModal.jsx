import { useState } from 'react'
import { t } from '../lib/i18n'
import { exportJSON, exportCSV, exportPDF, exportPPTX, exportImage } from '../lib/pdfExport'
import { exportGithubIssues } from '../lib/issueExport'
import {
  notionExport, notionAuthorizeUrl, notionStatus,
  jiraExport, jiraAuthorizeUrl, jiraStatus, jiraProjects, jiraSelect
} from '../lib/serverStorage'
import '../styles/ExportModal.css'

// Attend qu'une connexion OAuth (via popup) aboutisse, en pollant le statut.
function waitForConnection(statusFn, userId, popup) {
  return new Promise((resolve) => {
    let elapsed = 0
    const timer = setInterval(async () => {
      elapsed += 2000
      const status = await statusFn(userId)
      if (status?.connected) {
        clearInterval(timer)
        try { popup && popup.close() } catch { /* cross-origin */ }
        resolve(true)
      } else if (elapsed >= 120000 || (popup && popup.closed)) {
        clearInterval(timer)
        resolve(false)
      }
    }, 2000)
  })
}

export default function ExportModal({ plan, lang, userId, onClose, captureRef, onJiraExported }) {
  // Notion
  const [notionState, setNotionState] = useState('idle')
  const [notionUrl, setNotionUrl] = useState(null)
  const [notionMsg, setNotionMsg] = useState('')

  // Jira
  const [jiraState, setJiraState] = useState('idle') // idle | working | connecting | choosingProject | done | error
  const [jiraSites, setJiraSites] = useState([])
  const [jiraPick, setJiraPick] = useState({ cloudId: '', projectKey: '' })
  const [jiraResult, setJiraResult] = useState(null)
  const [jiraMsg, setJiraMsg] = useState('')

  // ---------- Notion ----------
  const runNotionExport = async () => {
    const res = await notionExport(userId, plan, lang)
    if (res?.url) {
      setNotionUrl(res.url); setNotionState('done'); window.open(res.url, '_blank', 'noopener'); return true
    }
    if (res?.error === 'no_parent') { setNotionMsg(t(lang, 'export.notionNoParent')); setNotionState('error'); return true }
    return res
  }

  const handleNotion = async () => {
    if (!userId) { setNotionMsg(t(lang, 'export.notionSignIn')); setNotionState('error'); return }
    setNotionState('working'); setNotionMsg(''); setNotionUrl(null)
    try {
      const res = await runNotionExport()
      if (res === true) return
      if (res && res.needsAuth) {
        const auth = await notionAuthorizeUrl(userId)
        if (!auth?.url) { setNotionMsg(t(lang, 'export.notionUnavailable')); setNotionState('error'); return }
        setNotionState('connecting')
        const popup = window.open(auth.url, 'notion-oauth', 'width=640,height=760')
        const connected = await waitForConnection(notionStatus, userId, popup)
        if (!connected) { setNotionMsg(t(lang, 'export.notionCancelled')); setNotionState('error'); return }
        setNotionState('working')
        const done = await runNotionExport()
        if (done !== true) { setNotionMsg(t(lang, 'export.notionUnavailable')); setNotionState('error') }
      } else { setNotionMsg(t(lang, 'export.notionUnavailable')); setNotionState('error') }
    } catch { setNotionMsg(t(lang, 'export.notionUnavailable')); setNotionState('error') }
  }

  const notionLabel = notionState === 'working' ? t(lang, 'export.notionExporting')
    : notionState === 'connecting' ? t(lang, 'export.notionConnecting')
    : t(lang, 'export.notion')

  // ---------- Jira ----------
  const finishJiraExport = async () => {
    const res = await jiraExport(userId, plan, lang)
    if (res?.boardUrl !== undefined && res.error === undefined && !res.needsAuth && !res.needsProject) {
      setJiraResult(res); setJiraState('done')
      if (onJiraExported) onJiraExported({ siteUrl: res.siteUrl, projectKey: res.projectKey, links: res.links || {} })
      if (res.boardUrl) window.open(res.boardUrl, '_blank', 'noopener')
      return true
    }
    return res
  }

  const loadProjects = async () => {
    const res = await jiraProjects(userId)
    const sites = res?.sites || []
    if (!sites.length) { setJiraMsg(t(lang, 'export.jiraNoProjects')); setJiraState('error'); return }
    setJiraSites(sites)
    const firstSite = sites.find(s => s.projects?.length) || sites[0]
    setJiraPick({ cloudId: firstSite.cloudId, projectKey: firstSite.projects?.[0]?.key || '' })
    setJiraState('choosingProject')
  }

  const handleJira = async () => {
    if (!userId) { setJiraMsg(t(lang, 'export.jiraSignIn')); setJiraState('error'); return }
    setJiraState('working'); setJiraMsg(''); setJiraResult(null)
    try {
      const res = await finishJiraExport()
      if (res === true) return
      if (res && res.needsAuth) {
        const auth = await jiraAuthorizeUrl(userId)
        if (!auth?.url) { setJiraMsg(t(lang, 'export.jiraUnavailable')); setJiraState('error'); return }
        setJiraState('connecting')
        const popup = window.open(auth.url, 'jira-oauth', 'width=720,height=800')
        const connected = await waitForConnection(jiraStatus, userId, popup)
        if (!connected) { setJiraMsg(t(lang, 'export.jiraCancelled')); setJiraState('error'); return }
        await loadProjects()
      } else if (res && res.needsProject) {
        await loadProjects()
      } else { setJiraMsg(t(lang, 'export.jiraUnavailable')); setJiraState('error') }
    } catch { setJiraMsg(t(lang, 'export.jiraUnavailable')); setJiraState('error') }
  }

  const confirmProject = async () => {
    const site = jiraSites.find(s => s.cloudId === jiraPick.cloudId)
    const project = site?.projects?.find(p => p.key === jiraPick.projectKey)
    if (!site || !project) return
    setJiraState('working')
    try {
      await jiraSelect(userId, {
        cloudId: site.cloudId, siteUrl: site.siteUrl, siteName: site.siteName,
        projectKey: project.key, projectName: project.name
      })
      const done = await finishJiraExport()
      if (done !== true) { setJiraMsg(t(lang, 'export.jiraUnavailable')); setJiraState('error') }
    } catch { setJiraMsg(t(lang, 'export.jiraUnavailable')); setJiraState('error') }
  }

  const jiraLabel = jiraState === 'working' ? t(lang, 'export.jiraExporting')
    : jiraState === 'connecting' ? t(lang, 'export.jiraConnecting')
    : t(lang, 'export.jira')

  const currentSite = jiraSites.find(s => s.cloudId === jiraPick.cloudId)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card export-modal" onClick={e => e.stopPropagation()}>
        <h3>{t(lang, 'export.title')}</h3>
        <div className="modal-actions">
          <button className="btn-primary" onClick={() => exportPDF(plan, lang)}>{t(lang, 'export.pdf')}</button>
          <button className="btn-primary" onClick={() => exportPPTX(plan, lang)}>{t(lang, 'export.pptx')}</button>
          <button className="btn-primary" onClick={() => exportCSV(plan, lang)}>{t(lang, 'export.csv')}</button>
          <button className="btn-secondary" onClick={() => exportJSON(plan)}>{t(lang, 'export.json')}</button>
          <button className="btn-secondary" onClick={() => exportImage(captureRef?.current, plan)}>{t(lang, 'export.image')}</button>
          <button className="btn-secondary export-btn-with-icon" onClick={() => exportGithubIssues(plan)}>
            <img className="export-btn-icon" src="/assets/icons/icons8-github-logo-32.png" alt="" aria-hidden="true" />
            {t(lang, 'export.github')}
          </button>
        </div>

        <div className="export-integrations">
          <span className="export-integrations-label">{t(lang, 'export.integrations')}</span>

          <button className="btn-integration btn-notion" onClick={handleNotion} disabled={notionState === 'working' || notionState === 'connecting'}>
            <img className="btn-notion-icon" src="/assets/icons/icons8-notion-32.png" alt="" aria-hidden="true" />
            {notionLabel}
          </button>
          {notionState === 'done' && notionUrl && (
            <a className="export-notion-link" href={notionUrl} target="_blank" rel="noopener noreferrer">{t(lang, 'export.notionOpen')}</a>
          )}
          {notionState === 'error' && notionMsg && <span className="export-notion-error">{notionMsg}</span>}

          <button className="btn-integration btn-jira" onClick={handleJira} disabled={jiraState === 'working' || jiraState === 'connecting'}>
            <img className="btn-notion-icon" src="/assets/icons/icons8-jira-32.png" alt="" aria-hidden="true" />
            {jiraLabel}
          </button>

          {jiraState === 'choosingProject' && (
            <div className="jira-picker">
              <label className="jira-picker-field">
                <span>{t(lang, 'export.jiraSite')}</span>
                <select value={jiraPick.cloudId} onChange={e => {
                  const s = jiraSites.find(x => x.cloudId === e.target.value)
                  setJiraPick({ cloudId: e.target.value, projectKey: s?.projects?.[0]?.key || '' })
                }}>
                  {jiraSites.map(s => <option key={s.cloudId} value={s.cloudId}>{s.siteName}</option>)}
                </select>
              </label>
              <label className="jira-picker-field">
                <span>{t(lang, 'export.jiraProject')}</span>
                <select value={jiraPick.projectKey} onChange={e => setJiraPick(p => ({ ...p, projectKey: e.target.value }))}>
                  {(currentSite?.projects || []).map(p => <option key={p.key} value={p.key}>{p.name} ({p.key})</option>)}
                </select>
              </label>
              <button className="btn-integration btn-jira" onClick={confirmProject} disabled={!jiraPick.projectKey}>
                {t(lang, 'export.jiraConfirm')}
              </button>
            </div>
          )}

          {jiraState === 'done' && jiraResult && (
            <div className="jira-result">
              <span className="export-notion-link">{t(lang, 'export.jiraDone')(jiraResult.created, jiraResult.updated)}</span>
              {jiraResult.boardUrl && <a className="export-notion-link" href={jiraResult.boardUrl} target="_blank" rel="noopener noreferrer">{t(lang, 'export.jiraOpen')}</a>}
            </div>
          )}
          {jiraState === 'error' && jiraMsg && <span className="export-notion-error">{jiraMsg}</span>}
        </div>

        <button className="btn-secondary close-btn" onClick={onClose}>{t(lang, 'export.close')}</button>
      </div>
    </div>
  )
}
