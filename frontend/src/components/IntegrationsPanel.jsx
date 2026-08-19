import { useEffect, useState } from 'react'
import { t } from '../lib/i18n'
import { notionStatus, notionDisconnect, jiraStatus, jiraDisconnect, linearStatus, linearDisconnect, googleCalendarStatus, googleCalendarDisconnect } from '../lib/serverStorage'
import { IconCalendar, IconCheckCircle, IconCircleDot } from './Icons'
import '../styles/IntegrationsPanel.css'

// Récap des intégrations tierces connectées (Notion, Jira, Linear, Google Calendar), avec
// bouton de déconnexion — évite d'avoir à ouvrir chaque modal d'export pour savoir si le
// compte est connecté. Chaque service garde sa propre couleur de marque sur le badge de
// statut (Notion/Jira/Linear/Google) plutôt qu'un vert générique — plus vivant, et ça aide
// à repérer le bon service d'un coup d'œil dans une liste de quatre lignes toutes très
// proches visuellement.
const INTEGRATIONS_META = {
  notion: { icon: '/assets/icons/icons8-notion-32.png', brand: 'notion' },
  jira: { icon: '/assets/icons/icons8-jira-32.png', brand: 'jira' },
  linear: { icon: '/assets/icons/linear-dark.png', brand: 'linear' },
  gcal: { icon: null, brand: 'gcal' }
}

function StatusBadge({ connected, brand, lang }) {
  return (
    <span className={`integration-badge ${connected ? `is-connected brand-${brand}` : 'is-disconnected'}`}>
      {connected ? <IconCheckCircle width={12} height={12} /> : <IconCircleDot width={12} height={12} />}
      {connected ? t(lang, 'settings.integrationsConnectedBadge') : t(lang, 'settings.integrationsNotConnectedBadge')}
    </span>
  )
}

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

      <div className="settings-row integration-row">
        <div className="integration-info">
          <img src={INTEGRATIONS_META.notion.icon} alt="" className="integration-icon" />
          <div>
            <p className="settings-row-label">Notion</p>
            <StatusBadge connected={!!notion?.connected} brand="notion" lang={lang} />
            {notion?.connected && <p className="account-security-note">{t(lang, 'settings.integrationsConnected')(notion.workspace)}</p>}
          </div>
        </div>
        {notion?.connected && (
          <button className="btn-secondary" onClick={disconnectNotion}>{t(lang, 'settings.integrationsDisconnect')}</button>
        )}
      </div>

      <div className="settings-row integration-row">
        <div className="integration-info">
          <img src={INTEGRATIONS_META.jira.icon} alt="" className="integration-icon" />
          <div>
            <p className="settings-row-label">Jira</p>
            <StatusBadge connected={!!jira?.connected} brand="jira" lang={lang} />
            {jira?.connected && <p className="account-security-note">{t(lang, 'settings.integrationsConnected')(jira.project ? `${jira.site} · ${jira.project.name}` : jira.site)}</p>}
          </div>
        </div>
        {jira?.connected && (
          <button className="btn-secondary" onClick={disconnectJira}>{t(lang, 'settings.integrationsDisconnect')}</button>
        )}
      </div>

      <div className="settings-row integration-row">
        <div className="integration-info">
          <img src={INTEGRATIONS_META.linear.icon} alt="" className="integration-icon integration-icon-linear" />
          <div>
            <p className="settings-row-label">Linear</p>
            <StatusBadge connected={!!linear?.connected} brand="linear" lang={lang} />
            {linear?.connected && <p className="account-security-note">{t(lang, 'settings.integrationsConnected')(linear.team?.name)}</p>}
          </div>
        </div>
        {linear?.connected && (
          <button className="btn-secondary" onClick={disconnectLinear}>{t(lang, 'settings.integrationsDisconnect')}</button>
        )}
      </div>

      <div className="settings-row integration-row">
        <div className="integration-info">
          <span className="integration-icon integration-icon-gcal"><IconCalendar width={17} height={17} /></span>
          <div>
            <p className="settings-row-label">Google Calendar</p>
            <StatusBadge connected={!!gcal?.connected} brand="gcal" lang={lang} />
            {gcal?.connected && <p className="account-security-note">{t(lang, 'settings.integrationsConnected')(gcal.calendar?.name)}</p>}
          </div>
        </div>
        {gcal?.connected && (
          <button className="btn-secondary" onClick={disconnectGcal}>{t(lang, 'settings.integrationsDisconnect')}</button>
        )}
      </div>
    </div>
  )
}
