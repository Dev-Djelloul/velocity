import { useState, useEffect } from 'react'
import { t } from '../lib/i18n'
import { IconCookie, IconLock, IconSettings, IconBarChart, IconMegaphone } from './Icons'
import Wordmark from './Wordmark'
import { applyConsent } from '../lib/consentScripts'
import { CONSENT_STORAGE_KEY, readCookieConsent } from '../lib/cookieConsent'
import { PREFERENCE_STORAGE_KEYS, PREFERENCES_GRANTED_EVENT } from '../lib/preferenceStorage'
import cookieBannerImage from '../../assets/img/hiw-step3-export.webp'
import '../styles/CookieConsentBanner.css'

const readSavedPrefs = readCookieConsent

function savePrefs(prefs) {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ essential: true, ...prefs, decidedAt: new Date().toISOString() }))
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

  // Un choix déjà enregistré (visite précédente) doit charger les scripts consentis dès
  // l'arrivée sur le site, sans attendre une nouvelle décision — sinon un utilisateur ayant
  // déjà accepté les statistiques ne serait jamais mesuré tant qu'il ne rouvre pas la
  // bannière. Rien n'est chargé tant qu'aucun choix n'a été fait (saved est alors null).
  useEffect(() => {
    if (saved) applyConsent(saved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const commit = (prefs) => {
    savePrefs(prefs)
    applyConsent(prefs)
    // "Préférences" gouverne la mémorisation du thème, de la langue, du fuseau horaire et
    // des réglages d'accessibilité (voir App.jsx) — sur un refus explicite, on purge ce qui
    // était déjà enregistré (repart sur les valeurs par défaut à la prochaine visite) ; sur
    // un accord, on notifie App.jsx pour qu'il sauvegarde tout de suite l'état en cours,
    // sans attendre que l'utilisateur change activement un réglage après coup.
    if (prefs.preferences) {
      window.dispatchEvent(new Event(PREFERENCES_GRANTED_EVENT))
    } else {
      PREFERENCE_STORAGE_KEYS.forEach(key => localStorage.removeItem(key))
    }
    setOpen(false)
    setShowSettings(false)
  }

  // "Continuer sans accepter" se contentait de fermer le bandeau (setOpen(false)) sans
  // jamais appeler commit() : aucun choix n'était enregistré, les interrupteurs gardaient
  // l'état d'une décision précédente (ou restaient à leur valeur par défaut) au lieu de
  // refléter un vrai refus (retour utilisateur). Traité maintenant comme "Tout accepter",
  // mais avec les 3 catégories optionnelles explicitement désactivées.
  const continueWithoutAccepting = () => {
    setPreferences(false)
    setStatistics(false)
    setMarketing(false)
    commit({ preferences: false, statistics: false, marketing: false })
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
                <Wordmark size={30} className="cookie-consent-wordmark" />
                <h3>{t(lang, 'cookieBanner.title')}</h3>
                <p>{t(lang, 'cookieBanner.body')}</p>
                <div className="cookie-consent-links">
                  <button className="cookie-consent-link" onClick={onOpenPolicy}>
                    {t(lang, 'cookieBanner.learnMore')}
                  </button>
                  <span className="cookie-consent-links-sep">·</span>
                  <button className="cookie-consent-link cookie-consent-link-muted" onClick={continueWithoutAccepting}>
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
