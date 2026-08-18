import { useEffect, useState } from 'react'
import { t } from '../lib/i18n'
import { notionStatus, notionDisconnect, jiraStatus, jiraDisconnect, linearStatus, linearDisconnect, googleCalendarStatus, googleCalendarDisconnect } from '../lib/serverStorage'

// Récap des intégrations tierces connectées (Notion, Jira, Linear, Google Calendar), avec
// bouton de déconnexion — évite d'avoir à ouvrir chaque modal d'export pour savoir si le
// compte est connecté.
export default function IntegrationsPanel({ lang, userId }) {
  const [notion, setNotion] = useState(null) // null = chargement
  const [jira, setJira] = useState(null)
  const [linear, setLinear] = useState(null)
  const [gcal, setGcal] = useState(null)

  useEffect(() => {
    if (!userId) { setNotion({ connected: false }); setJira({ connected: false }); setLinear({ connected: false }); setGcal({ connected: false }); return }
    notionStatus(userId).then(r => setNotion(r || { connected: false }))
    jiraStatus(userId).then(r => setJira(r || { connected: false }))
    linearStatus(userId).then(r => setLinear(r || { connected: false }))
    googleCalendarStatus(userId).then(r => setGcal(r || { connected: false }))
  }, [userId])

  const disconnectNotion = async () => {
    await notionDisconnect(userId)
    setNotion({ connected: false })
  }

  const disconnectJira = async () => {
    await jiraDisconnect(userId)
    setJira({ connected: false })
  }

  const disconnectLinear = async () => {
    await linearDisconnect(userId)
    setLinear({ connected: false })
  }

  const disconnectGcal = async () => {
    await googleCalendarDisconnect(userId)
    setGcal({ connected: false })
  }

  if (!userId) return null

  return (
    <div className="account-section card">
      <h3>{t(lang, 'settings.integrationsTitle')}</h3>
      <p className="account-security-note">{t(lang, 'settings.integrationsBody')}</p>

      <div className="settings-row">
        <div>
          <p className="settings-row-label">Notion</p>
          <p className="account-security-note">
            {notion === null
              ? t(lang, 'settings.integrationsLoading')
              : notion.connected
                ? t(lang, 'settings.integrationsConnected')(notion.workspace)
                : t(lang, 'settings.integrationsNotConnected')}
          </p>
        </div>
        {notion?.connected && (
          <button className="btn-secondary" onClick={disconnectNotion}>{t(lang, 'settings.integrationsDisconnect')}</button>
        )}
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row-label">Jira</p>
          <p className="account-security-note">
            {jira === null
              ? t(lang, 'settings.integrationsLoading')
              : jira.connected
                ? t(lang, 'settings.integrationsConnected')(jira.project ? `${jira.site} · ${jira.project.name}` : jira.site)
                : t(lang, 'settings.integrationsNotConnected')}
          </p>
        </div>
        {jira?.connected && (
          <button className="btn-secondary" onClick={disconnectJira}>{t(lang, 'settings.integrationsDisconnect')}</button>
        )}
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row-label">Linear</p>
          <p className="account-security-note">
            {linear === null
              ? t(lang, 'settings.integrationsLoading')
              : linear.connected
                ? t(lang, 'settings.integrationsConnected')(linear.team?.name)
                : t(lang, 'settings.integrationsNotConnected')}
          </p>
        </div>
        {linear?.connected && (
          <button className="btn-secondary" onClick={disconnectLinear}>{t(lang, 'settings.integrationsDisconnect')}</button>
        )}
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row-label">Google Calendar</p>
          <p className="account-security-note">
            {gcal === null
              ? t(lang, 'settings.integrationsLoading')
              : gcal.connected
                ? t(lang, 'settings.integrationsConnected')(gcal.calendar?.name)
                : t(lang, 'settings.integrationsNotConnected')}
          </p>
        </div>
        {gcal?.connected && (
          <button className="btn-secondary" onClick={disconnectGcal}>{t(lang, 'settings.integrationsDisconnect')}</button>
        )}
      </div>
    </div>
  )
}
