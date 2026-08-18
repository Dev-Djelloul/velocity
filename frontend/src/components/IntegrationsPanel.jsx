import { useEffect, useState } from 'react'
import { t } from '../lib/i18n'
import { notionStatus, notionDisconnect, jiraStatus, jiraDisconnect } from '../lib/serverStorage'

// Récap des intégrations tierces connectées (Notion, Jira), avec bouton de déconnexion —
// évite d'avoir à ouvrir chaque modal d'export pour savoir si le compte est connecté.
export default function IntegrationsPanel({ lang, userId }) {
  const [notion, setNotion] = useState(null) // null = chargement
  const [jira, setJira] = useState(null)

  useEffect(() => {
    if (!userId) { setNotion({ connected: false }); setJira({ connected: false }); return }
    notionStatus(userId).then(r => setNotion(r || { connected: false }))
    jiraStatus(userId).then(r => setJira(r || { connected: false }))
  }, [userId])

  const disconnectNotion = async () => {
    await notionDisconnect(userId)
    setNotion({ connected: false })
  }

  const disconnectJira = async () => {
    await jiraDisconnect(userId)
    setJira({ connected: false })
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
    </div>
  )
}
