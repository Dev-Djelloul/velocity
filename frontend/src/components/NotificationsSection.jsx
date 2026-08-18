import { useEffect, useState } from 'react'
import { t } from '../lib/i18n'
import { fetchNotificationPrefs, saveNotificationPrefs } from '../lib/serverStorage'
import { useUser } from '../lib/auth'

// Préférences de notification par email (agent IA terminé, plan inactif). L'email est
// pris depuis le compte connecté (Clerk) — pas de champ libre pour éviter d'envoyer à
// une adresse non vérifiée.
export default function NotificationsSection({ lang, userId }) {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress || null
  const [prefs, setPrefs] = useState(null) // null = chargement

  useEffect(() => {
    if (!userId) return
    fetchNotificationPrefs(userId).then(r => setPrefs(r || { agentDone: false, inactivityReminder: false }))
  }, [userId])

  const toggle = (key) => {
    if (!prefs || !userId || !email) return
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    saveNotificationPrefs(userId, { email, agentDone: next.agentDone, inactivityReminder: next.inactivityReminder })
  }

  if (!userId || prefs === null) return null

  return (
    <div className="account-section card">
      <h3>{t(lang, 'settings.notificationsTitle')}</h3>
      <p className="account-security-note">{email ? t(lang, 'settings.notificationsBody')(email) : ''}</p>

      <div className="settings-row">
        <div>
          <p className="settings-row-label">{t(lang, 'settings.notifAgentDoneLabel')}</p>
          <p className="account-security-note">{t(lang, 'settings.notifAgentDoneBody')}</p>
        </div>
        <button
          className={`settings-switch ${prefs.agentDone ? 'is-on' : ''}`}
          role="switch"
          aria-checked={prefs.agentDone}
          onClick={() => toggle('agentDone')}
        >
          <span className="settings-switch-thumb" />
        </button>
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row-label">{t(lang, 'settings.notifInactiveLabel')}</p>
          <p className="account-security-note">{t(lang, 'settings.notifInactiveBody')}</p>
        </div>
        <button
          className={`settings-switch ${prefs.inactivityReminder ? 'is-on' : ''}`}
          role="switch"
          aria-checked={prefs.inactivityReminder}
          onClick={() => toggle('inactivityReminder')}
        >
          <span className="settings-switch-thumb" />
        </button>
      </div>
    </div>
  )
}
