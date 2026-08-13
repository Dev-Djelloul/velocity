import { useState } from 'react'
import { t } from '../lib/i18n'
import { exportJSON, exportCSV, exportPDF, exportPPTX, exportImage } from '../lib/pdfExport'
import { exportGithubIssues, exportJira } from '../lib/issueExport'
import { notionExport, notionAuthorizeUrl, notionStatus } from '../lib/serverStorage'
import '../styles/ExportModal.css'

export default function ExportModal({ plan, lang, userId, onClose, captureRef }) {
  const [notionState, setNotionState] = useState('idle') // idle | working | connecting | done | error
  const [notionUrl, setNotionUrl] = useState(null)
  const [notionMsg, setNotionMsg] = useState('')

  const runExport = async () => {
    const res = await notionExport(userId, plan, lang)
    if (res?.url) {
      setNotionUrl(res.url)
      setNotionState('done')
      window.open(res.url, '_blank', 'noopener')
      return true
    }
    if (res?.error === 'no_parent') {
      setNotionMsg(t(lang, 'export.notionNoParent'))
      setNotionState('error')
      return true
    }
    return res // may be {needsAuth:true} or null
  }

  const waitForConnection = (popup) => new Promise((resolve) => {
    let elapsed = 0
    const timer = setInterval(async () => {
      elapsed += 2000
      const status = await notionStatus(userId)
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

  const handleNotion = async () => {
    if (!userId) { setNotionMsg(t(lang, 'export.notionSignIn')); setNotionState('error'); return }
    setNotionState('working')
    setNotionMsg('')
    setNotionUrl(null)
    try {
      const res = await runExport()
      if (res === true) return
      if (res && res.needsAuth) {
        const auth = await notionAuthorizeUrl(userId)
        if (!auth?.url) { setNotionMsg(t(lang, 'export.notionUnavailable')); setNotionState('error'); return }
        setNotionState('connecting')
        const popup = window.open(auth.url, 'notion-oauth', 'width=640,height=760')
        const connected = await waitForConnection(popup)
        if (!connected) { setNotionMsg(t(lang, 'export.notionCancelled')); setNotionState('error'); return }
        setNotionState('working')
        const done = await runExport()
        if (done !== true) { setNotionMsg(t(lang, 'export.notionUnavailable')); setNotionState('error') }
      } else {
        setNotionMsg(t(lang, 'export.notionUnavailable'))
        setNotionState('error')
      }
    } catch {
      setNotionMsg(t(lang, 'export.notionUnavailable'))
      setNotionState('error')
    }
  }

  const notionLabel = notionState === 'working' ? t(lang, 'export.notionExporting')
    : notionState === 'connecting' ? t(lang, 'export.notionConnecting')
    : t(lang, 'export.notion')

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" onClick={e => e.stopPropagation()}>
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
          <button className="btn-secondary" onClick={() => exportJira(plan)}>{t(lang, 'export.jira')}</button>
        </div>

        <div className="export-notion">
          <button className="btn-notion" onClick={handleNotion} disabled={notionState === 'working' || notionState === 'connecting'}>
            <img className="btn-notion-icon" src="/assets/icons/icons8-notion-32.png" alt="" aria-hidden="true" />
            {notionLabel}
          </button>
          {notionState === 'done' && notionUrl && (
            <a className="export-notion-link" href={notionUrl} target="_blank" rel="noopener noreferrer">{t(lang, 'export.notionOpen')}</a>
          )}
          {notionState === 'error' && notionMsg && (
            <span className="export-notion-error">{notionMsg}</span>
          )}
        </div>

        <button className="btn-secondary close-btn" onClick={onClose}>{t(lang, 'export.close')}</button>
      </div>
    </div>
  )
}
