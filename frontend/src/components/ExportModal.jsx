import { useState } from 'react'
import { t } from '../lib/i18n'
import { exportJSON, exportCSV, exportPDF, exportPPTX, exportImage } from '../lib/pdfExport'
import {
  notionExport, notionAuthorizeUrl, notionStatus,
  jiraExport, jiraAuthorizeUrl, jiraStatus, jiraProjects, jiraSelect, jiraDisconnect,
  githubExport, githubAuthorizeUrl, githubStatus, githubRepos, githubSelect, githubDisconnect
} from '../lib/serverStorage'
import { waitForConnection } from '../lib/oauthConnect'
import '../styles/ExportModal.css'

export default function ExportModal({ plan, lang, userId, onClose, captureRef, onJiraExported, onGithubExported }) {
  // Notion (export page complète)
  const [notionState, setNotionState] = useState('idle')
  const [notionUrl, setNotionUrl] = useState(null)
  const [notionMsg, setNotionMsg] = useState('')

  // Jira
  const [jiraState, setJiraState] = useState('idle') // idle | working | connecting | choosingProject | done | error
  const [jiraSites, setJiraSites] = useState([])
  const [jiraPick, setJiraPick] = useState({ cloudId: '', projectKey: '' })
  const [jiraResult, setJiraResult] = useState(null)
  const [jiraMsg, setJiraMsg] = useState('')

  // GitHub
  const [githubState, setGithubState] = useState('idle') // idle | working | connecting | choosingRepo | done | error
  const [githubRepoList, setGithubRepoList] = useState([])
  const [githubPick, setGithubPick] = useState('') // "owner/repo"
  const [githubResult, setGithubResult] = useState(null)
  const [githubMsg, setGithubMsg] = useState('')

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

  const reconnectJira = async () => {
    if (!userId) return
    setJiraState('working'); setJiraMsg('')
    try { await jiraDisconnect(userId) } catch { /* ignore */ }
    await handleJira()
  }

  const jiraLabel = jiraState === 'working' ? t(lang, 'export.jiraExporting')
    : jiraState === 'connecting' ? t(lang, 'export.jiraConnecting')
    : t(lang, 'export.jira')

  // ---------- GitHub ----------
  const finishGithubExport = async () => {
    const res = await githubExport(userId, plan, lang)
    if (res?.repoUrl !== undefined && res.error === undefined && !res.needsAuth && !res.needsRepo) {
      setGithubResult(res); setGithubState('done')
      if (onGithubExported) onGithubExported({ links: res.links || {} })
      if (res.repoUrl) window.open(res.repoUrl, '_blank', 'noopener')
      return true
    }
    return res
  }

  const loadRepos = async () => {
    const res = await githubRepos(userId)
    const repos = res?.repos || []
    if (!repos.length) { setGithubMsg(t(lang, 'export.githubNoRepos')); setGithubState('error'); return }
    setGithubRepoList(repos)
    setGithubPick(repos[0].fullName)
    setGithubState('choosingRepo')
  }

  const handleGithub = async () => {
    if (!userId) { setGithubMsg(t(lang, 'export.githubSignIn')); setGithubState('error'); return }
    setGithubState('working'); setGithubMsg(''); setGithubResult(null)
    try {
      const res = await finishGithubExport()
      if (res === true) return
      if (res && res.needsAuth) {
        const auth = await githubAuthorizeUrl(userId)
        if (!auth?.url) { setGithubMsg(t(lang, 'export.githubUnavailable')); setGithubState('error'); return }
        setGithubState('connecting')
        const popup = window.open(auth.url, 'github-oauth', 'width=720,height=800')
        const connected = await waitForConnection(githubStatus, userId, popup)
        if (!connected) { setGithubMsg(t(lang, 'export.githubCancelled')); setGithubState('error'); return }
        await loadRepos()
      } else if (res && res.needsRepo) {
        await loadRepos()
      } else { setGithubMsg(t(lang, 'export.githubUnavailable')); setGithubState('error') }
    } catch { setGithubMsg(t(lang, 'export.githubUnavailable')); setGithubState('error') }
  }

  const confirmRepo = async () => {
    const repo = githubRepoList.find(r => r.fullName === githubPick)
    if (!repo) return
    setGithubState('working')
    try {
      await githubSelect(userId, { owner: repo.owner, repo: repo.repo })
      const done = await finishGithubExport()
      if (done !== true) { setGithubMsg(t(lang, 'export.githubUnavailable')); setGithubState('error') }
    } catch { setGithubMsg(t(lang, 'export.githubUnavailable')); setGithubState('error') }
  }

  const reconnectGithub = async () => {
    if (!userId) return
    setGithubState('working'); setGithubMsg('')
    try { await githubDisconnect(userId) } catch { /* ignore */ }
    await handleGithub()
  }

  const githubLabel = githubState === 'working' ? t(lang, 'export.githubSyncing')
    : githubState === 'connecting' ? t(lang, 'export.githubConnecting')
    : t(lang, 'export.github')

  const currentSite = jiraSites.find(s => s.cloudId === jiraPick.cloudId)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card export-modal" onClick={e => e.stopPropagation()}>
        <h3>{t(lang, 'export.title')}</h3>
        <div className="modal-actions">
          <button className="btn-primary" onClick={() => exportPDF(plan, lang)}>{t(lang, 'export.pdf')}</button>
          <button className="btn-primary" onClick={() => exportPPTX(plan, lang)}>{t(lang, 'export.pptx')}</button>
          <button className="btn-primary" onClick={() => exportCSV(plan, lang)}>{t(lang, 'export.csv')}</button>
          <button className="btn-primary" onClick={() => exportJSON(plan)}>{t(lang, 'export.json')}</button>
          <button className="btn-primary" onClick={() => exportImage(captureRef?.current, plan)}>{t(lang, 'export.image')}</button>
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
          {jiraState === 'error' && jiraMsg && (
            <>
              <span className="export-notion-error">{jiraMsg}</span>
              <button className="export-reconnect-link" onClick={reconnectJira}>
                {t(lang, 'export.jiraReconnect')}
              </button>
            </>
          )}

          <button className="btn-integration btn-github" onClick={handleGithub} disabled={githubState === 'working' || githubState === 'connecting'}>
            <img className="btn-notion-icon" src="/assets/icons/icons8-github-logo-32.png" alt="" aria-hidden="true" />
            {githubLabel}
          </button>

          {githubState === 'choosingRepo' && (
            <div className="jira-picker">
              <label className="jira-picker-field">
                <span>{t(lang, 'export.githubRepo')}</span>
                <select value={githubPick} onChange={e => setGithubPick(e.target.value)}>
                  {githubRepoList.map(r => <option key={r.fullName} value={r.fullName}>{r.fullName}</option>)}
                </select>
              </label>
              <button className="btn-integration btn-github" onClick={confirmRepo} disabled={!githubPick}>
                {t(lang, 'export.githubConfirm')}
              </button>
            </div>
          )}

          {githubState === 'done' && githubResult && (
            <div className="jira-result">
              <span className="export-notion-link">{t(lang, 'export.githubDone')(githubResult.created, githubResult.updated)}</span>
              {githubResult.repoUrl && <a className="export-notion-link" href={githubResult.repoUrl} target="_blank" rel="noopener noreferrer">{t(lang, 'export.githubOpen')}</a>}
            </div>
          )}
          {githubState === 'error' && githubMsg && (
            <>
              <span className="export-notion-error">{githubMsg}</span>
              <button className="export-reconnect-link" onClick={reconnectGithub}>
                {t(lang, 'export.githubReconnect')}
              </button>
            </>
          )}
        </div>

        <button className="btn-secondary close-btn" onClick={onClose}>{t(lang, 'export.close')}</button>
      </div>
    </div>
  )
}
