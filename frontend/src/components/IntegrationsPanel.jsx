import { useEffect, useState } from 'react'
import { t } from '../lib/i18n'
import { notionStatus, notionDisconnect, jiraStatus, jiraDisconnect, linearStatus, linearDisconnect, googleCalendarStatus, googleCalendarDisconnect } from '../lib/serverStorage'
import { IconCheckCircle, IconCircleDot } from './Icons'
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
  gcal: { icon: '/assets/icons/icons8-google-calendar-64.png', brand: 'gcal' }
}

function StatusBadge({ connected, brand, lang }) {
  return (
    <span className={`integration-badge ${connected ? `is-connected brand-${brand}` : 'is-disconnected'}`}>
      {connected ? <IconCheckCircle width={12} height={12} /> : <IconCircleDot width={12} height={12} />}
      {connected ? t(lang, 'settings.integrationsConnectedBadge') : t(lang, 'settings.integrationsNotConnectedBadge')}
    </span>
  )
}

// Une ligne par service — factorisée pour ne pas répéter 4 fois la même structure (icône,
// nom, badge, détail optionnel, bouton déconnecter). Le détail (workspace/projet/équipe/
// calendrier) ne s'affiche que s'il existe vraiment : avant, un détail vide retombait sur
// "Connecté" tout court, dupliquant l'info déjà donnée par le badge juste au-dessus.
function IntegrationRow({ name, meta, status, detail, onDisconnect, lang, iconClassName = '' }) {
  const connected = !!status?.connected
  return (
    <div className="integration-row">
      <div className="integration-info">
        <img src={meta.icon} alt="" className={`integration-icon ${iconClassName}`} />
        <div>
          <p className="settings-row-label">{name}</p>
          <StatusBadge connected={connected} brand={meta.brand} lang={lang} />
          {connected && detail && <p className="integration-detail">{detail}</p>}
        </div>
      </div>
      {connected && (
        <button className="btn-secondary" onClick={onDisconnect}>{t(lang, 'settings.integrationsDisconnect')}</button>
      )}
    </div>
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

      <div className="integrations-list">
        <IntegrationRow
          name="Notion"
          meta={INTEGRATIONS_META.notion}
          status={notion}
          detail={notion?.workspace}
          onDisconnect={disconnectNotion}
          lang={lang}
        />
        <IntegrationRow
          name="Jira"
          meta={INTEGRATIONS_META.jira}
          status={jira}
          detail={jira?.project ? `${jira.site} · ${jira.project.name}` : jira?.site}
          onDisconnect={disconnectJira}
          lang={lang}
        />
        <IntegrationRow
          name="Linear"
          meta={INTEGRATIONS_META.linear}
          status={linear}
          detail={linear?.team?.name}
          onDisconnect={disconnectLinear}
          lang={lang}
          iconClassName="integration-icon-linear"
        />
        <IntegrationRow
          name="Google Calendar"
          meta={INTEGRATIONS_META.gcal}
          status={gcal}
          detail={gcal?.calendar?.name}
          onDisconnect={disconnectGcal}
          lang={lang}
        />
      </div>
    </div>
  )
}
