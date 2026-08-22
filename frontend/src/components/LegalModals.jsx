import InfoModal from './InfoModal'
import { t } from '../lib/i18n'
import { IconLock, IconFileText, IconCookie } from './Icons'

const CONTACT_EMAIL = 'contact@digitalblueskye.com'

export function PrivacyModal({ lang, onClose }) {
  return (
    <InfoModal icon={<IconLock width={26} height={26} />} title={t(lang, 'modals.privacy.title')} onClose={onClose}>
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
    </InfoModal>
  )
}

export function TermsModal({ lang, onClose }) {
  return (
    <InfoModal icon={<IconFileText width={26} height={26} />} title={t(lang, 'modals.terms.title')} onClose={onClose}>
      <section>
        <p>{t(lang, 'modals.terms.updated')}</p>
      </section>

      <section>
        <h2>{t(lang, 'modals.terms.serviceHeading')}</h2>
        <p>{t(lang, 'modals.terms.serviceText')}</p>
      </section>

      <section>
        <h2>{t(lang, 'modals.terms.usageHeading')}</h2>
        <ul>
          <li>{t(lang, 'modals.terms.usageItem1')}</li>
          <li>{t(lang, 'modals.terms.usageItem2')}</li>
          <li>{t(lang, 'modals.terms.usageItem3')}</li>
        </ul>
      </section>

      <section>
        <h2>{t(lang, 'modals.terms.aiHeading')}</h2>
        <p>{t(lang, 'modals.terms.aiText')}</p>
      </section>

      <section>
        <h2>{t(lang, 'modals.terms.teamHeading')}</h2>
        <p>{t(lang, 'modals.terms.teamText')}</p>
      </section>

      <section>
        <h2>{t(lang, 'modals.terms.subscriptionHeading')}</h2>
        <p>{t(lang, 'modals.terms.subscriptionText')}</p>
      </section>

      <section>
        <h2>{t(lang, 'modals.terms.availabilityHeading')}</h2>
        <p>{t(lang, 'modals.terms.availabilityText')}</p>
      </section>

      <section>
        <h2>{t(lang, 'modals.terms.terminationHeading')}</h2>
        <p>{t(lang, 'modals.terms.terminationText')}</p>
      </section>

      <section>
        <h2>{t(lang, 'modals.terms.contactHeading')}</h2>
        <p>{t(lang, 'modals.terms.contactText')} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
      </section>

      <p className="info-modal-note">{t(lang, 'modals.terms.note')}</p>
    </InfoModal>
  )
}

export function CookiesModal({ lang, onClose }) {
  return (
    <InfoModal icon={<IconCookie width={26} height={26} />} title={t(lang, 'modals.cookies.title')} onClose={onClose}>
      <section>
        <p>{t(lang, 'modals.cookies.intro')}</p>
      </section>

      <section>
        <h2>{t(lang, 'modals.cookies.storageHeading')}</h2>
        <p>{t(lang, 'modals.cookies.storageText')}</p>
      </section>

      <section>
        <h2>{t(lang, 'modals.cookies.preferencesHeading')}</h2>
        <p>{t(lang, 'modals.cookies.preferencesText')}</p>
      </section>

      <section>
        <h2>{t(lang, 'modals.cookies.analyticsHeading')}</h2>
        <p>{t(lang, 'modals.cookies.analyticsText')}</p>
      </section>

      <section>
        <h2>{t(lang, 'modals.cookies.marketingHeading')}</h2>
        <p>{t(lang, 'modals.cookies.marketingText')}</p>
      </section>

      <section>
        <h2>{t(lang, 'modals.cookies.manageHeading')}</h2>
        <p>{t(lang, 'modals.cookies.manageText')}</p>
      </section>

      <p className="info-modal-note">{t(lang, 'modals.cookies.note')}</p>
    </InfoModal>
  )
}
