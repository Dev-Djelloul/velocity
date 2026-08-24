import { t } from '../lib/i18n'
import { IconLock, IconArrowLeft } from './Icons'
import '../styles/InfoModal.css'
import '../styles/LegalPage.css'

const CONTACT_EMAIL = 'contact@digitalblueskye.com'

// Page publique dédiée (pas une modale) — requise par Google Play Console, qui demande une
// URL directe et crawlable vers la politique de confidentialité plutôt qu'un contenu
// accessible seulement via une interaction JS (voir modals.privacy.* pour le même contenu,
// utilisé aussi par PrivacyModal via le footer de l'app).
export default function PrivacyPage({ lang, onBack }) {
  return (
    <div className="legal-page">
      {onBack && (
        <button className="legal-page-back" onClick={onBack}>
          <IconArrowLeft width={16} height={16} /> {t(lang, 'auth.backToHome')}
        </button>
      )}
      <div className="legal-page-card card">
        <div className="legal-page-title">
          <span className="legal-page-icon"><IconLock width={26} height={26} /></span>
          <h1>{t(lang, 'modals.privacy.title')}</h1>
        </div>
        <div className="info-modal-content">
          <section>
            <p>{t(lang, 'modals.privacy.updated')}</p>
          </section>

          <section>
            <h2>{t(lang, 'modals.privacy.dataHeading')}</h2>
            <p>{t(lang, 'modals.privacy.dataText')}</p>
          </section>

          <section>
            <h2>{t(lang, 'modals.privacy.accountHeading')}</h2>
            <p>{t(lang, 'modals.privacy.accountText')}</p>
          </section>

          <section>
            <h2>{t(lang, 'modals.privacy.aiHeading')}</h2>
            <p>{t(lang, 'modals.privacy.aiText')}</p>
          </section>

          <section>
            <h2>{t(lang, 'modals.privacy.integrationsHeading')}</h2>
            <p>{t(lang, 'modals.privacy.integrationsText')}</p>
          </section>

          <section>
            <h2>{t(lang, 'modals.privacy.paymentHeading')}</h2>
            <p>{t(lang, 'modals.privacy.paymentText')}</p>
          </section>

          <section>
            <h2>{t(lang, 'modals.privacy.usageHeading')}</h2>
            <p>{t(lang, 'modals.privacy.usageText')}</p>
          </section>

          <section>
            <h2>{t(lang, 'modals.privacy.rightsHeading')}</h2>
            <ul>
              <li><strong>{t(lang, 'modals.privacy.rightAccessLabel')}</strong> {t(lang, 'modals.privacy.rightAccessText')}</li>
              <li><strong>{t(lang, 'modals.privacy.rightDeleteLabel')}</strong> {t(lang, 'modals.privacy.rightDeleteText')}</li>
              <li><strong>{t(lang, 'modals.privacy.rightPortabilityLabel')}</strong> {t(lang, 'modals.privacy.rightPortabilityText')}</li>
              <li><strong>{t(lang, 'modals.privacy.rightOppositionLabel')}</strong> {t(lang, 'modals.privacy.rightOppositionText')}</li>
            </ul>
          </section>

          <section>
            <h2>{t(lang, 'modals.privacy.contactHeading')}</h2>
            <p>{t(lang, 'modals.privacy.contactText')} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
          </section>

          <p className="info-modal-note">{t(lang, 'modals.privacy.note')}</p>
        </div>
      </div>
    </div>
  )
}
