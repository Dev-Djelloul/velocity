import { t } from '../lib/i18n'
import { IconArrowLeft, IconLink } from './Icons'
import IntegrationsPanel from './IntegrationsPanel'
import WebhooksSection from './WebhooksSection'
import integrationsBackground from '../../assets/img/hiw-gallery-crowd.webp'
import '../styles/AccountPage.css'
import '../styles/SettingsPage.css'
import '../styles/IntegrationsPage.css'

// Page dédiée aux connexions vers des outils externes — extraite de Paramètres (qui ne
// garde que les préférences d'affichage pures) : les intégrations tierces (Notion, Jira,
// Linear, Google Calendar) et les webhooks sortants relèvent tous deux du même sujet
// ("connecter VelocityLaunch à autre chose"), sur le même modèle que SettingsPage/
// NotificationsPage (retour + titre à icône).
export default function IntegrationsPage({ lang, userId, onBack }) {
  return (
    <div className="integrations-page">
      <div className="integrations-page-bg" style={{ backgroundImage: `url(${integrationsBackground})` }} aria-hidden="true" />
      <div className="account-page integrations-page-inner">
        <button className="account-back-btn" onClick={onBack}>
          <IconArrowLeft width={16} height={16} /> {t(lang, 'settings.backToApp')}
        </button>

        <h2 className="settings-page-title"><IconLink width={20} height={20} /> {lang === 'fr' ? 'Intégrations' : 'Integrations'}</h2>

        <IntegrationsPanel lang={lang} userId={userId} />
        <WebhooksSection lang={lang} userId={userId} />
      </div>
    </div>
  )
}
