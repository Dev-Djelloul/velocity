import { useState } from 'react'
import { t } from '../lib/i18n'
import { IconCookie, IconLock, IconSettings, IconBarChart, IconMegaphone } from './Icons'
import Wordmark from './Wordmark'
import cookieBannerImage from '../../assets/img/hiw-step3-export.webp'
import '../styles/CookieConsentBanner.css'

const STORAGE_KEY = 'plp_cookie_consent'

function readSavedPrefs() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function savePrefs(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, ...prefs, decidedAt: new Date().toISOString() }))
}

function Switch({ checked, locked, label, onToggle }) {
  if (locked) {
    return (
      <span className="cookie-consent-switch is-on is-locked" aria-hidden="true">
        <span className="cookie-consent-switch-thumb" />
      </span>
    )
  }
  return (
    <span
      className={`cookie-consent-switch ${checked ? 'is-on' : ''}`}
      role="switch"
      tabIndex={0}
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <span className="cookie-consent-switch-thumb" />
    </span>
  )
}

export default function CookieConsentBanner({ lang, onOpenPolicy }) {
  const saved = readSavedPrefs()
  // Pas de choix enregistré -> le panneau reste ouvert et bloque un vrai choix (pas de simple
  // croix pour l'ignorer, demandé explicitement : ça doit être un moment de décision, pas un
  // toast qu'on balaie). Une fois décidé, il se replie en pastille toujours réouvrable — le
  // RGPD impose de pouvoir revenir sur son choix à tout moment.
  const [open, setOpen] = useState(!saved)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState(saved?.preferences ?? false)
  const [statistics, setStatistics] = useState(saved?.statistics ?? false)
  const [marketing, setMarketing] = useState(saved?.marketing ?? false)

  const commit = (prefs) => {
    savePrefs(prefs)
    setOpen(false)
    setShowSettings(false)
  }

  const acceptAll = () => {
    setPreferences(true)
    setStatistics(true)
    setMarketing(true)
    commit({ preferences: true, statistics: true, marketing: true })
  }

  const saveSelection = () => commit({ preferences, statistics, marketing })

  const categories = [
    {
      key: 'essential',
      icon: <IconLock width={14} height={14} />,
      title: t(lang, 'cookieBanner.essentialTitle'),
      body: t(lang, 'cookieBanner.essentialBody'),
      locked: true
    },
    {
      key: 'preferences',
      icon: <IconSettings width={14} height={14} />,
      title: t(lang, 'cookieBanner.preferencesTitle'),
      body: t(lang, 'cookieBanner.preferencesBody'),
      checked: preferences,
      onToggle: () => setPreferences(v => !v)
    },
    {
      key: 'statistics',
      icon: <IconBarChart width={14} height={14} />,
      title: t(lang, 'cookieBanner.analyticsTitle'),
      body: t(lang, 'cookieBanner.analyticsBody'),
      checked: statistics,
      onToggle: () => setStatistics(v => !v)
    },
    {
      key: 'marketing',
      icon: <IconMegaphone width={14} height={14} />,
      title: t(lang, 'cookieBanner.marketingTitle'),
      body: t(lang, 'cookieBanner.marketingBody'),
      checked: marketing,
      onToggle: () => setMarketing(v => !v)
    }
  ]

  return (
    <div className={`cookie-consent ${open ? 'is-open' : 'is-collapsed'}`}>
      {open ? (
        <div className="cookie-consent-wrap">
          {showSettings && (
            <div className="cookie-consent-settings">
              <div className="cookie-consent-settings-head">
                <h4>{t(lang, 'cookieBanner.settingsTitle')}</h4>
                <p>{t(lang, 'cookieBanner.settingsBody')}</p>
              </div>
              <div className="cookie-consent-settings-grid">
                {categories.map(cat => (
                  <div key={cat.key} className={`cookie-consent-category ${cat.locked ? 'is-locked' : ''}`}>
                    <div className="cookie-consent-category-head">
                      <span className="cookie-consent-category-icon">{cat.icon}</span>
                      <span className="cookie-consent-category-text">
                        <strong>{cat.title}</strong>
                        <em>{cat.body}</em>
                      </span>
                    </div>
                    <Switch checked={cat.checked} locked={cat.locked} label={cat.title} onToggle={cat.onToggle} />
                  </div>
                ))}
              </div>
              <div className="cookie-consent-settings-actions">
                <button className="btn-secondary cookie-consent-save" onClick={saveSelection}>
                  {t(lang, 'cookieBanner.savePrefs')}
                </button>
              </div>
            </div>
          )}

          <div className="cookie-consent-panel">
            <img className="cookie-consent-photo" src={cookieBannerImage} alt="" aria-hidden="true" />

            <div className="cookie-consent-content">
              <div className="cookie-consent-intro">
                <Wordmark size={20} className="cookie-consent-wordmark" />
                <h3>{t(lang, 'cookieBanner.title')}</h3>
                <p>{t(lang, 'cookieBanner.body')}</p>
                <div className="cookie-consent-links">
                  <button className="cookie-consent-link" onClick={onOpenPolicy}>
                    {t(lang, 'cookieBanner.learnMore')}
                  </button>
                  <span className="cookie-consent-links-sep">·</span>
                  <button className="cookie-consent-link cookie-consent-link-muted" onClick={() => setOpen(false)}>
                    {t(lang, 'cookieBanner.continueWithoutAgreeing')}
                  </button>
                </div>
              </div>

              <div className="cookie-consent-actions">
                <button
                  className={`cookie-consent-settings-toggle ${showSettings ? 'is-active' : ''}`}
                  onClick={() => setShowSettings(v => !v)}
                >
                  <IconSettings width={15} height={15} />
                  {t(lang, 'cookieBanner.settingsTitle')}
                </button>
                <button className="btn-primary cookie-consent-accept" onClick={acceptAll}>
                  {t(lang, 'cookieBanner.acceptAll')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button
          className="cookie-consent-tab"
          onClick={() => setOpen(true)}
          aria-label={t(lang, 'cookieBanner.reopen')}
          title={t(lang, 'cookieBanner.reopen')}
        >
          <IconCookie width={16} height={16} />
        </button>
      )}
    </div>
  )
}
