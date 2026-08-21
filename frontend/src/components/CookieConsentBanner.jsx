import { useEffect, useState } from 'react'
import { t } from '../lib/i18n'
import { IconCookie, IconX, IconChevronLeft } from './Icons'
import '../styles/CookieConsentBanner.css'

const STORAGE_KEY = 'plp_cookie_consent'

export default function CookieConsentBanner({ lang, onOpenPolicy }) {
  // 'pending' (jamais répondu, panneau ouvert) -> 'accepted'/'closed' (replié en pastille,
  // toujours réouvrable — RGPD impose de pouvoir revenir sur son choix à tout moment, pas
  // juste de le poser une fois). Le choix "accepté" est mémorisé ; un simple repli (X) ne
  // l'est pas, pour reproposer la bannière à la prochaine visite tant qu'aucun choix réel
  // n'a été fait.
  const [status, setStatus] = useState(() => (
    typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'accepted' ? 'accepted' : 'pending'
  ))
  const [open, setOpen] = useState(status !== 'accepted')

  useEffect(() => {
    if (status === 'accepted') localStorage.setItem(STORAGE_KEY, 'accepted')
  }, [status])

  const accept = () => {
    setStatus('accepted')
    setOpen(false)
  }

  return (
    <div className={`cookie-consent ${open ? 'is-open' : 'is-collapsed'}`}>
      {open ? (
        <div className="cookie-consent-panel">
          <div className="cookie-consent-icon"><IconCookie width={20} height={20} /></div>
          <h3>{t(lang, 'cookieBanner.title')}</h3>
          <p>{t(lang, 'cookieBanner.body')}</p>
          <div className="cookie-consent-actions">
            <button className="btn-primary cookie-consent-accept" onClick={accept}>
              {t(lang, 'cookieBanner.accept')}
            </button>
            <button className="cookie-consent-link" onClick={onOpenPolicy}>
              {t(lang, 'cookieBanner.learnMore')}
            </button>
          </div>
          <button
            className="cookie-consent-close"
            onClick={() => setOpen(false)}
            aria-label={t(lang, 'cookieBanner.collapse')}
            title={t(lang, 'cookieBanner.collapse')}
          >
            <IconX width={14} height={14} />
          </button>
        </div>
      ) : (
        <button
          className="cookie-consent-tab"
          onClick={() => setOpen(true)}
          aria-label={t(lang, 'cookieBanner.reopen')}
          title={t(lang, 'cookieBanner.reopen')}
        >
          <IconChevronLeft width={14} height={14} />
          <IconCookie width={16} height={16} />
        </button>
      )}
    </div>
  )
}
