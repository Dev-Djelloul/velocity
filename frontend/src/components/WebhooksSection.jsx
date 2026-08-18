import { useEffect, useState } from 'react'
import { t } from '../lib/i18n'
import { listWebhooks, createWebhook, toggleWebhook, deleteWebhookRequest } from '../lib/serverStorage'
import '../styles/WebhooksSection.css'

const EVENTS = [
  { key: 'generation.completed', labelKey: 'settings.webhookEventGeneration' },
  { key: 'story.completed', labelKey: 'settings.webhookEventStory' }
]

// Webhooks sortants : l'utilisateur branche un outil externe (Zapier, Make, son propre
// backend...) sur les événements du plan. Le secret de signature HMAC n'est renvoyé qu'à
// la création (voir POST /webhooks côté backend) — jamais relisible ensuite, donc affiché
// une seule fois ici dans un encart qu'on ne peut fermer qu'après l'avoir vu.
export default function WebhooksSection({ lang, userId }) {
  const [hooks, setHooks] = useState(null) // null = chargement
  const [url, setUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState([])
  const [justCreated, setJustCreated] = useState(null) // { url, secret }
  const [error, setError] = useState('')

  const refresh = () => {
    if (!userId) return
    listWebhooks(userId).then(r => setHooks(r || []))
  }

  useEffect(() => { refresh() }, [userId])

  const toggleEvent = (key) => {
    setSelectedEvents(prev => prev.includes(key) ? prev.filter(e => e !== key) : [...prev, key])
  }

  const submit = async () => {
    setError('')
    const trimmed = url.trim()
    if (!trimmed || !selectedEvents.length) return
    const res = await createWebhook(userId, trimmed, selectedEvents)
    if (!res?.secret) { setError(t(lang, 'settings.webhookError')); return }
    setJustCreated({ url: trimmed, secret: res.secret })
    setUrl('')
    setSelectedEvents([])
    refresh()
  }

  const handleToggle = async (hook) => {
    await toggleWebhook(userId, hook.id, !hook.enabled)
    refresh()
  }

  const handleDelete = async (hook) => {
    await deleteWebhookRequest(userId, hook.id)
    refresh()
  }

  if (!userId || hooks === null) return null

  return (
    <div className="account-section card">
      <h3>{t(lang, 'settings.webhooksTitle')}</h3>
      <p className="account-security-note">{t(lang, 'settings.webhooksBody')}</p>

      {justCreated && (
        <div className="webhook-secret-callout">
          <p><strong>{t(lang, 'settings.webhookSecretTitle')}</strong></p>
          <p className="account-security-note">{t(lang, 'settings.webhookSecretBody')}</p>
          <code className="webhook-secret-value">{justCreated.secret}</code>
          <button className="btn-secondary" onClick={() => setJustCreated(null)}>{t(lang, 'settings.webhookSecretDismiss')}</button>
        </div>
      )}

      {!!hooks.length && (
        <ul className="webhook-list">
          {hooks.map(hook => (
            <li key={hook.id} className="webhook-list-item">
              <div>
                <p className="settings-row-label webhook-url">{hook.url}</p>
                <p className="account-security-note">
                  {hook.events.map(e => EVENTS.find(ev => ev.key === e)?.labelKey ? t(lang, EVENTS.find(ev => ev.key === e).labelKey) : e).join(' · ')}
                </p>
              </div>
              <div className="webhook-list-actions">
                <button
                  className={`settings-switch ${hook.enabled ? 'is-on' : ''}`}
                  role="switch"
                  aria-checked={hook.enabled}
                  onClick={() => handleToggle(hook)}
                >
                  <span className="settings-switch-thumb" />
                </button>
                <button className="btn-secondary" onClick={() => handleDelete(hook)}>{t(lang, 'settings.webhookDelete')}</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="webhook-form">
        <input
          type="url"
          className="settings-select"
          placeholder="https://hooks.zapier.com/..."
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <div className="webhook-events-picker">
          {EVENTS.map(ev => (
            <label key={ev.key} className="webhook-event-checkbox">
              <input type="checkbox" checked={selectedEvents.includes(ev.key)} onChange={() => toggleEvent(ev.key)} />
              {t(lang, ev.labelKey)}
            </label>
          ))}
        </div>
        <button className="btn-secondary" onClick={submit} disabled={!url.trim() || !selectedEvents.length}>
          {t(lang, 'settings.webhookAdd')}
        </button>
        {error && <p className="export-notion-error">{error}</p>}
      </div>
    </div>
  )
}
