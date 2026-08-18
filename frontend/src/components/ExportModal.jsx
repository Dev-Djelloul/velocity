import { useState } from 'react'
import { t } from '../lib/i18n'
import { exportJSON, exportCSV, exportPDF, exportPPTX, exportImage } from '../lib/pdfExport'
import {
  notionExport, notionAuthorizeUrl, notionStatus,
  jiraExport, jiraAuthorizeUrl, jiraStatus, jiraProjects, jiraSelect, jiraDisconnect,
  githubExport, githubAuthorizeUrl, githubStatus, githubRepos, githubSelect, githubDisconnect,
  linearExport, linearConnect, linearTeams, linearSelect, linearDisconnect,
  googleCalendarExport, googleCalendarAuthorizeUrl, googleCalendarStatus, googleCalendarCalendars, googleCalendarSelect, googleCalendarDisconnect
} from '../lib/serverStorage'
import { waitForConnection } from '../lib/oauthConnect'
import '../styles/ExportModal.css'

// Logo Google officiel ("G" multicolore) — pas de fichier image dédié dans le repo, et un
// SVG inline évite d'ajouter un asset juste pour ça.
function GoogleGIcon(props) {
  return (
    <svg viewBox="0 0 48 48" {...props}>
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  )
}

export default function ExportModal({ plan, lang, userId, isPro, onRequestUpgrade, onClose, captureRef, onJiraExported, onGithubExported, onLinearExported, onGoogleCalendarExported }) {
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

  // Linear (pas d'OAuth : clé API personnelle collée par l'utilisateur)
  const [linearState, setLinearState] = useState('idle') // idle | working | enteringKey | choosingTeam | done | error
  const [linearKeyInput, setLinearKeyInput] = useState('')
  const [linearTeamList, setLinearTeamList] = useState([])
  const [linearPick, setLinearPick] = useState('')
  const [linearResult, setLinearResult] = useState(null)
  const [linearMsg, setLinearMsg] = useState('')

  // Google Calendar
  const [gcalState, setGcalState] = useState('idle') // idle | working | connecting | choosingCalendar | done | error
  const [gcalList, setGcalList] = useState([])
  const [gcalPick, setGcalPick] = useState('')
  const [gcalResult, setGcalResult] = useState(null)
  const [gcalMsg, setGcalMsg] = useState('')

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
    if (!isPro) { onRequestUpgrade?.(); return }
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
    if (!isPro) { onRequestUpgrade?.(); return }
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

  // ---------- Linear ----------
  const finishLinearExport = async () => {
    const res = await linearExport(userId, plan, lang)
    if (res?.boardUrl !== undefined && res.error === undefined && !res.needsAuth && !res.needsProject) {
      setLinearResult(res); setLinearState('done')
      if (onLinearExported) onLinearExported({ teamKey: res.teamKey, links: res.links || {} })
      if (res.boardUrl) window.open(res.boardUrl, '_blank', 'noopener')
      return true
    }
    return res
  }

  const loadLinearTeams = async () => {
    const res = await linearTeams(userId)
    const teamList = res?.teams || []
    if (!teamList.length) { setLinearMsg(t(lang, 'export.linearNoTeams')); setLinearState('error'); return }
    setLinearTeamList(teamList)
    setLinearPick(teamList[0].id)
    setLinearState('choosingTeam')
  }

  const handleLinear = async () => {
    if (!isPro) { onRequestUpgrade?.(); return }
    if (!userId) { setLinearMsg(t(lang, 'export.linearSignIn')); setLinearState('error'); return }
    setLinearState('working'); setLinearMsg(''); setLinearResult(null)
    try {
      const res = await finishLinearExport()
      if (res === true) return
      if (res && res.needsAuth) {
        setLinearKeyInput('')
        setLinearState('enteringKey')
      } else if (res && res.needsProject) {
        await loadLinearTeams()
      } else { setLinearMsg(t(lang, 'export.linearUnavailable')); setLinearState('error') }
    } catch { setLinearMsg(t(lang, 'export.linearUnavailable')); setLinearState('error') }
  }

  const confirmLinearKey = async () => {
    const key = linearKeyInput.trim()
    if (!key) return
    setLinearState('working'); setLinearMsg('')
    const res = await linearConnect(userId, key)
    if (!res?.ok) { setLinearMsg(t(lang, 'export.linearInvalidKey')); setLinearState('error'); return }
    await loadLinearTeams()
  }

  const confirmTeam = async () => {
    const team = linearTeamList.find(t => t.id === linearPick)
    if (!team) return
    setLinearState('working')
    try {
      await linearSelect(userId, { teamId: team.id, teamKey: team.key, teamName: team.name })
      const done = await finishLinearExport()
      if (done !== true) { setLinearMsg(t(lang, 'export.linearUnavailable')); setLinearState('error') }
    } catch { setLinearMsg(t(lang, 'export.linearUnavailable')); setLinearState('error') }
  }

  const reconnectLinear = async () => {
    if (!userId) return
    setLinearState('working'); setLinearMsg('')
    try { await linearDisconnect(userId) } catch { /* ignore */ }
    await handleLinear()
  }

  const linearLabel = linearState === 'working' ? t(lang, 'export.linearExporting')
    : t(lang, 'export.linear')

  // ---------- Google Calendar ----------
  const finishGcalExport = async () => {
    const res = await googleCalendarExport(userId, plan, lang)
    if (res?.calendarUrl !== undefined && res.error === undefined && !res.needsAuth && !res.needsProject) {
      setGcalResult(res); setGcalState('done')
      if (onGoogleCalendarExported) onGoogleCalendarExported({ calendarId: res.calendarId })
      if (res.calendarUrl) window.open(res.calendarUrl, '_blank', 'noopener')
      return true
    }
    return res
  }

  const loadCalendars = async () => {
    const res = await googleCalendarCalendars(userId)
    const calendars = res?.calendars || []
    if (!calendars.length) { setGcalMsg(t(lang, 'export.gcalNoCalendars')); setGcalState('error'); return }
    setGcalList(calendars)
    setGcalPick((calendars.find(c => c.primary) || calendars[0]).id)
    setGcalState('choosingCalendar')
  }

  const handleGcal = async () => {
    if (!isPro) { onRequestUpgrade?.(); return }
    if (!userId) { setGcalMsg(t(lang, 'export.gcalSignIn')); setGcalState('error'); return }
    setGcalState('working'); setGcalMsg(''); setGcalResult(null)
    try {
      const res = await finishGcalExport()
      if (res === true) return
      if (res && res.needsAuth) {
        const auth = await googleCalendarAuthorizeUrl(userId)
        if (!auth?.url) { setGcalMsg(t(lang, 'export.gcalUnavailable')); setGcalState('error'); return }
        setGcalState('connecting')
        const popup = window.open(auth.url, 'google-calendar-oauth', 'width=520,height=680')
        const connected = await waitForConnection(googleCalendarStatus, userId, popup)
        if (!connected) { setGcalMsg(t(lang, 'export.gcalCancelled')); setGcalState('error'); return }
        await loadCalendars()
      } else if (res && res.needsProject) {
        await loadCalendars()
      } else { setGcalMsg(t(lang, 'export.gcalUnavailable')); setGcalState('error') }
    } catch { setGcalMsg(t(lang, 'export.gcalUnavailable')); setGcalState('error') }
  }

  const confirmCalendar = async () => {
    const cal = gcalList.find(c => c.id === gcalPick)
    if (!cal) return
    setGcalState('working')
    try {
      await googleCalendarSelect(userId, { calendarId: cal.id, calendarName: cal.name })
      const done = await finishGcalExport()
      if (done !== true) { setGcalMsg(t(lang, 'export.gcalUnavailable')); setGcalState('error') }
    } catch { setGcalMsg(t(lang, 'export.gcalUnavailable')); setGcalState('error') }
  }

  const reconnectGcal = async () => {
    if (!userId) return
    setGcalState('working'); setGcalMsg('')
    try { await googleCalendarDisconnect(userId) } catch { /* ignore */ }
    await handleGcal()
  }

  const gcalLabel = gcalState === 'working' ? t(lang, 'export.gcalExporting')
    : gcalState === 'connecting' ? t(lang, 'export.gcalConnecting')
    : t(lang, 'export.gcal')

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
    if (!isPro) { onRequestUpgrade?.(); return }
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
          <button
            className="btn-primary"
            onClick={() => isPro ? exportPPTX(plan, lang) : onRequestUpgrade?.()}
          >
            {t(lang, 'export.pptx')} {!isPro && <span className="export-pro-badge">PRO</span>}
          </button>
          <button className="btn-primary" onClick={() => exportCSV(plan, lang)}>{t(lang, 'export.csv')}</button>
          <button className="btn-primary" onClick={() => exportJSON(plan)}>{t(lang, 'export.json')}</button>
          <button className="btn-primary" onClick={() => exportImage(captureRef?.current, plan)}>{t(lang, 'export.image')}</button>
        </div>

        <div className="export-integrations">
          <span className="export-integrations-label">
            {t(lang, 'export.integrations')} {!isPro && <span className="export-pro-badge">PRO</span>}
          </span>

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

          <button className="btn-integration btn-jira" onClick={handleLinear} disabled={linearState === 'working'}>
            <img className="btn-notion-icon" src="/assets/icons/linear-dark.png" alt="" aria-hidden="true" />
            {linearLabel}
          </button>

          {linearState === 'enteringKey' && (
            <div className="jira-picker">
              <label className="jira-picker-field">
                <span>{t(lang, 'export.linearApiKey')}</span>
                <input
                  type="password"
                  value={linearKeyInput}
                  onChange={e => setLinearKeyInput(e.target.value)}
                  placeholder="lin_api_…"
                />
              </label>
              <p className="account-security-note">
                {t(lang, 'export.linearApiKeyHelp')} <a href="https://linear.app/settings/account/security" target="_blank" rel="noopener noreferrer">{t(lang, 'export.linearApiKeyLink')}</a>
              </p>
              <button className="btn-integration btn-jira" onClick={confirmLinearKey} disabled={!linearKeyInput.trim()}>
                {t(lang, 'export.linearConnect')}
              </button>
            </div>
          )}

          {linearState === 'choosingTeam' && (
            <div className="jira-picker">
              <label className="jira-picker-field">
                <span>{t(lang, 'export.linearTeam')}</span>
                <select value={linearPick} onChange={e => setLinearPick(e.target.value)}>
                  {linearTeamList.map(team => <option key={team.id} value={team.id}>{team.name} ({team.key})</option>)}
                </select>
              </label>
              <button className="btn-integration btn-jira" onClick={confirmTeam} disabled={!linearPick}>
                {t(lang, 'export.linearConfirm')}
              </button>
            </div>
          )}

          {linearState === 'done' && linearResult && (
            <div className="jira-result">
              <span className="export-notion-link">{t(lang, 'export.linearDone')(linearResult.created, linearResult.updated)}</span>
              {linearResult.boardUrl && <a className="export-notion-link" href={linearResult.boardUrl} target="_blank" rel="noopener noreferrer">{t(lang, 'export.linearOpen')}</a>}
            </div>
          )}
          {linearState === 'error' && linearMsg && (
            <>
              <span className="export-notion-error">{linearMsg}</span>
              <button className="export-reconnect-link" onClick={reconnectLinear}>
                {t(lang, 'export.linearReconnect')}
              </button>
            </>
          )}

          <button className="btn-integration btn-jira" onClick={handleGcal} disabled={gcalState === 'working' || gcalState === 'connecting'}>
            <GoogleGIcon width={16} height={16} className="btn-notion-icon" />
            {gcalLabel}
          </button>

          {gcalState === 'choosingCalendar' && (
            <div className="jira-picker">
              <label className="jira-picker-field">
                <span>{t(lang, 'export.gcalCalendar')}</span>
                <select value={gcalPick} onChange={e => setGcalPick(e.target.value)}>
                  {gcalList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <button className="btn-integration btn-jira" onClick={confirmCalendar} disabled={!gcalPick}>
                {t(lang, 'export.gcalConfirm')}
              </button>
            </div>
          )}

          {gcalState === 'done' && gcalResult && (
            <div className="jira-result">
              <span className="export-notion-link">{t(lang, 'export.gcalDone')(gcalResult.created, gcalResult.updated)}</span>
              {gcalResult.calendarUrl && <a className="export-notion-link" href={gcalResult.calendarUrl} target="_blank" rel="noopener noreferrer">{t(lang, 'export.gcalOpen')}</a>}
            </div>
          )}
          {gcalState === 'error' && gcalMsg && (
            <>
              <span className="export-notion-error">{gcalMsg}</span>
              <button className="export-reconnect-link" onClick={reconnectGcal}>
                {t(lang, 'export.gcalReconnect')}
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
