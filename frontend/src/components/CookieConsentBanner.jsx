import { useState } from 'react'
import { t } from '../lib/i18n'
import { IconCookie, IconLock, IconBarChart } from './Icons'
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

function savePrefs(analytics) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ essential: true, analytics, decidedAt: new Date().toISOString() }))
}

export default function CookieConsentBanner({ lang, onOpenPolicy }) {
  const saved = readSavedPrefs()
  // Pas de choix enregistré -> le panneau reste ouvert et bloque un vrai choix (pas de simple
  // croix pour l'ignorer, demandé explicitement : ça doit être un moment de décision, pas un
  // toast qu'on balaie). Une fois décidé, il se replie en pastille toujours réouvrable — le
  // RGPD impose de pouvoir revenir sur son choix à tout moment.
  const [open, setOpen] = useState(!saved)
  const [analytics, setAnalytics] = useState(saved?.analytics ?? false)

  const commit = (value) => {
    savePrefs(value)
    setOpen(false)
  }

  return (
    <div className={`cookie-consent ${open ? 'is-open' : 'is-collapsed'}`}>
      {open ? (
        <div className="cookie-consent-panel">
          <div className="cookie-consent-intro">
            <div className="cookie-consent-icon"><IconCookie width={22} height={22} /></div>
            <div>
              <h3>{t(lang, 'cookieBanner.title')}</h3>
              <p>{t(lang, 'cookieBanner.body')}</p>
              <button className="cookie-consent-link" onClick={onOpenPolicy}>
                {t(lang, 'cookieBanner.learnMore')}
              </button>
            </div>
          </div>

          <div className="cookie-consent-categories">
            <div className="cookie-consent-category is-locked">
              <span className="cookie-consent-category-icon"><IconLock width={14} height={14} /></span>
              <span className="cookie-consent-category-text">
                <strong>{t(lang, 'cookieBanner.essentialTitle')}</strong>
                <em>{t(lang, 'cookieBanner.essentialBody')}</em>
              </span>
              <span className="cookie-consent-switch is-on is-locked" aria-hidden="true">
                <span className="cookie-consent-switch-thumb" />
              </span>
            </div>

            <div className="cookie-consent-category">
              <span className="cookie-consent-category-icon"><IconBarChart width={14} height={14} /></span>
              <span className="cookie-consent-category-text">
                <strong>{t(lang, 'cookieBanner.analyticsTitle')}</strong>
                <em>{t(lang, 'cookieBanner.analyticsBody')}</em>
              </span>
              <button
                type="button"
                className={`cookie-consent-switch ${analytics ? 'is-on' : ''}`}
                role="switch"
                aria-checked={analytics}
                aria-label={t(lang, 'cookieBanner.analyticsTitle')}
                onClick={() => setAnalytics(v => !v)}
              >
                <span className="cookie-consent-switch-thumb" />
              </button>
            </div>
          </div>

          <div className="cookie-consent-actions">
            <button className="btn-primary cookie-consent-accept" onClick={() => commit(true)}>
              {t(lang, 'cookieBanner.acceptAll')}
            </button>
            <button className="btn-secondary cookie-consent-save" onClick={() => commit(analytics)}>
              {t(lang, 'cookieBanner.savePrefs')}
            </button>
            <button className="cookie-consent-reject" onClick={() => commit(false)}>
              {t(lang, 'cookieBanner.rejectAll')}
            </button>
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
