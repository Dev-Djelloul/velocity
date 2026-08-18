import { useEffect, useState } from 'react'
import { t } from '../lib/i18n'
import { fetchNotificationPrefs, saveNotificationPrefs } from '../lib/serverStorage'
import { useUser } from '../lib/auth'

const SLACK_WEBHOOK_DOCS_URL = 'https://api.slack.com/messaging/webhooks'

// Préférences de notification : email (agent IA terminé, plan inactif) et Slack (même
// déclencheurs, canal indépendant — un utilisateur peut n'activer que l'un des deux).
// L'email est pris depuis le compte connecté (Clerk) ; Slack passe par un Incoming
// Webhook que l'utilisateur crée lui-même côté Slack (pas d'app à publier/OAuth).
export default function NotificationsSection({ lang, userId }) {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress || null
  const [prefs, setPrefs] = useState(null) // null = chargement
  const [webhookInput, setWebhookInput] = useState('')
  const [webhookSaved, setWebhookSaved] = useState(false)

  useEffect(() => {
    if (!userId) return
    fetchNotificationPrefs(userId).then(r => {
      const next = r || { agentDone: false, inactivityReminder: false, slackWebhookUrl: null, slackEnabled: false, veilleAutoRefresh: false, mentions: true, weeklyDigest: false }
      setPrefs(next)
      setWebhookInput(next.slackWebhookUrl || '')
    })
  }, [userId])

  const persist = (patch) => {
    if (!userId) return
    const next = { ...prefs, ...patch }
    setPrefs(next)
    saveNotificationPrefs(userId, {
      email,
      agentDone: next.agentDone,
      inactivityReminder: next.inactivityReminder,
      slackWebhookUrl: next.slackWebhookUrl,
      slackEnabled: next.slackEnabled,
      veilleAutoRefresh: next.veilleAutoRefresh,
      mentions: next.mentions,
      weeklyDigest: next.weeklyDigest
    })
  }

  const toggle = (key) => {
    if (!prefs || !userId) return
    persist({ [key]: !prefs[key] })
  }

  const saveWebhook = () => {
    if (!prefs || !userId) return
    setWebhookSaved(true)
    persist({ slackWebhookUrl: webhookInput.trim() || null })
    setTimeout(() => setWebhookSaved(false), 2000)
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

      <div className="settings-row">
        <div>
          <p className="settings-row-label">{t(lang, 'settings.notifVeilleAutoLabel')}</p>
          <p className="account-security-note">{t(lang, 'settings.notifVeilleAutoBody')}</p>
        </div>
        <button
          className={`settings-switch ${prefs.veilleAutoRefresh ? 'is-on' : ''}`}
          role="switch"
          aria-checked={prefs.veilleAutoRefresh}
          onClick={() => toggle('veilleAutoRefresh')}
        >
          <span className="settings-switch-thumb" />
        </button>
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row-label">{t(lang, 'settings.notifMentionsLabel')}</p>
          <p className="account-security-note">{t(lang, 'settings.notifMentionsBody')}</p>
        </div>
        <button
          className={`settings-switch ${prefs.mentions ? 'is-on' : ''}`}
          role="switch"
          aria-checked={prefs.mentions}
          onClick={() => toggle('mentions')}
        >
          <span className="settings-switch-thumb" />
        </button>
      </div>

      <div className="settings-row">
        <div>
          <p className="settings-row-label">{t(lang, 'settings.notifWeeklyDigestLabel')}</p>
          <p className="account-security-note">{t(lang, 'settings.notifWeeklyDigestBody')}</p>
        </div>
        <button
          className={`settings-switch ${prefs.weeklyDigest ? 'is-on' : ''}`}
          role="switch"
          aria-checked={prefs.weeklyDigest}
          onClick={() => toggle('weeklyDigest')}
        >
          <span className="settings-switch-thumb" />
        </button>
      </div>

      <div className="settings-row notif-slack-row">
        <div className="notif-slack-field">
          <p className="settings-row-label">{t(lang, 'settings.notifSlackLabel')}</p>
          <p className="account-security-note">
            {t(lang, 'settings.notifSlackBody')} <a href={SLACK_WEBHOOK_DOCS_URL} target="_blank" rel="noopener noreferrer">{t(lang, 'settings.notifSlackDocsLink')}</a>
          </p>
          <div className="notif-slack-input-row">
            <input
              type="url"
              className="settings-select"
              placeholder="https://hooks.slack.com/services/…"
              value={webhookInput}
              onChange={e => setWebhookInput(e.target.value)}
            />
            <button className="btn-secondary" onClick={saveWebhook}>
              {webhookSaved ? t(lang, 'settings.notifSlackSaved') : t(lang, 'settings.notifSlackSave')}
            </button>
          </div>
        </div>
        <button
          className={`settings-switch ${prefs.slackEnabled ? 'is-on' : ''}`}
          role="switch"
          aria-checked={prefs.slackEnabled}
          onClick={() => toggle('slackEnabled')}
        >
          <span className="settings-switch-thumb" />
        </button>
      </div>
    </div>
  )
}
