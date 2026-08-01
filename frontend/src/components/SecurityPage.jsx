import InfoModal from './InfoModal'
import { t } from '../lib/i18n'
import { IconLock, IconShield, IconClipboard, IconSave, IconSearch, IconSmartphone, IconHelpCircle, IconCheckCircle } from './Icons'

export default function SecurityPage({ lang, onClose }) {
  return (
    <InfoModal icon={<IconLock width={26} height={26} />} title={t(lang, 'modals.security.title')} onClose={onClose}>
      <section>
        <h2>{t(lang, 'modals.security.protectHeading')}</h2>
        <p>{t(lang, 'modals.security.protectText')}</p>
      </section>

      <section>
        <h2><IconShield width={20} height={20} /> {t(lang, 'modals.security.encryptionHeading')}</h2>
        <p>{t(lang, 'modals.security.encryptionText')}</p>
      </section>

      <section>
        <h2><IconClipboard width={20} height={20} /> {t(lang, 'modals.security.gdprHeading')}</h2>
        <p>{t(lang, 'modals.security.gdprText')}</p>
        <ul>
          <li><strong>{t(lang, 'modals.security.gdprAccessLabel')}</strong> {t(lang, 'modals.security.gdprAccessText')}</li>
          <li><strong>{t(lang, 'modals.security.gdprForgetLabel')}</strong> {t(lang, 'modals.security.gdprForgetText')}</li>
          <li><strong>{t(lang, 'modals.security.gdprPortabilityLabel')}</strong> {t(lang, 'modals.security.gdprPortabilityText')}</li>
          <li><strong>{t(lang, 'modals.security.gdprTransparencyLabel')}</strong> {t(lang, 'modals.security.gdprTransparencyText')}</li>
        </ul>
      </section>

      <section>
        <h2><IconSave width={20} height={20} /> {t(lang, 'modals.security.storageHeading')}</h2>
        <p>{t(lang, 'modals.security.storageText')}</p>
      </section>

      <section>
        <h2><IconSearch width={20} height={20} /> {t(lang, 'modals.security.trackingHeading')}</h2>
        <p>{t(lang, 'modals.security.trackingText')}</p>
      </section>

      <section>
        <h2><IconShield width={20} height={20} /> {t(lang, 'modals.security.infraHeading')}</h2>
        <ul>
          <li>{t(lang, 'modals.security.infraItem1')}</li>
          <li>{t(lang, 'modals.security.infraItem2')}</li>
          <li>{t(lang, 'modals.security.infraItem3')}</li>
          <li>{t(lang, 'modals.security.infraItem4')}</li>
        </ul>
      </section>

      <section>
        <h2><IconSmartphone width={20} height={20} /> {t(lang, 'modals.security.sharingHeading')}</h2>
        <p>{t(lang, 'modals.security.sharingIntro')}</p>
        <ul>
          <li>{t(lang, 'modals.security.sharingItem1')}</li>
          <li>{t(lang, 'modals.security.sharingItem2')}</li>
          <li>{t(lang, 'modals.security.sharingItem3')}</li>
          <li>{t(lang, 'modals.security.sharingItem4')}</li>
        </ul>
      </section>

      <section>
        <h2><IconHelpCircle width={20} height={20} /> {t(lang, 'modals.security.questionsHeading')}</h2>
        <p>{t(lang, 'modals.security.questionsText')} <a href="mailto:security@digitalblueskye.com"><strong>security@digitalblueskye.com</strong></a></p>
      </section>

      <div className="info-badge">
        <p><IconCheckCircle width={18} height={18} /> {t(lang, 'modals.security.badge')}</p>
      </div>
    </InfoModal>
  )
}
