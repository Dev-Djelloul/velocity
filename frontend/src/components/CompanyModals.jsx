import { useState } from 'react'
import InfoModal from './InfoModal'
import { t } from '../lib/i18n'
import { IconUser, IconTarget, IconMail, IconSend, IconBriefcase, IconExternalLink, IconCheckCircle, IconAlertTriangle } from './Icons'

const BLOG_URL = 'https://www.digitalblueskye.com/blog/digital/blogarticles'
const CONTACT_EMAIL = 'digitalblueskye@gmail.com'
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

export function AboutModal({ lang, onClose }) {
  return (
    <InfoModal icon={<IconUser width={26} height={26} />} title={t(lang, 'modals.about.title')} onClose={onClose}>
      <section>
        <h2><IconUser width={20} height={20} /> {t(lang, 'modals.about.authorHeading')}</h2>
        <p>{t(lang, 'modals.about.authorText')}</p>
        <p>{t(lang, 'modals.about.blogPrefix')} <a href={BLOG_URL} target="_blank" rel="noopener noreferrer">{t(lang, 'modals.about.blogLink')} <IconExternalLink width={13} height={13} /></a>.</p>
      </section>

      <section>
        <h2><IconTarget width={20} height={20} /> {t(lang, 'modals.about.missionHeading')}</h2>
        <p>{t(lang, 'modals.about.missionText')}</p>
      </section>

      <section>
        <h2>{t(lang, 'modals.about.valuesHeading')}</h2>
        <ul>
          <li><strong>{t(lang, 'modals.about.valueSpeedLabel')}</strong> {t(lang, 'modals.about.valueSpeedText')}</li>
          <li><strong>{t(lang, 'modals.about.valueClarityLabel')}</strong> {t(lang, 'modals.about.valueClarityText')}</li>
          <li><strong>{t(lang, 'modals.about.valuePrivacyLabel')}</strong> {t(lang, 'modals.about.valuePrivacyText')}</li>
        </ul>
      </section>
    </InfoModal>
  )
}

export function CareersModal({ lang, onClose, onContactClick }) {
  return (
    <InfoModal icon={<IconBriefcase width={26} height={26} />} title={t(lang, 'modals.careers.title')} onClose={onClose}>
      <section>
        <h2>{t(lang, 'modals.careers.noPositionHeading')}</h2>
        <p>{t(lang, 'modals.careers.noPositionText')}</p>
      </section>
      <section>
        <h2>{t(lang, 'modals.careers.curiousHeading')}</h2>
        <p>{t(lang, 'modals.careers.curiousText')}</p>
        <button className="btn-secondary" onClick={onContactClick}>
          <IconMail width={16} height={16} /> {t(lang, 'modals.careers.contactBtn')}
        </button>
      </section>
    </InfoModal>
  )
}

export function ContactModal({ lang, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!WEB3FORMS_ACCESS_KEY) {
      setStatus('error')
      return
    }

    setStatus('sending')
    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `Contact VelocityLaunch — ${form.name || 'sans nom'}`,
          name: form.name,
          email: form.email,
          message: form.message
        })
      })
      const result = await response.json()
      setStatus(result.success ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <InfoModal icon={<IconMail width={26} height={26} />} title={t(lang, 'modals.contact.title')} onClose={onClose}>
        <div className="info-badge">
          <p><IconCheckCircle width={18} height={18} /> {t(lang, 'modals.contact.successMsg')}</p>
        </div>
      </InfoModal>
    )
  }

  return (
    <InfoModal icon={<IconMail width={26} height={26} />} title={t(lang, 'modals.contact.title')} onClose={onClose}>
      <section>
        <p>{t(lang, 'modals.contact.intro')}</p>
      </section>

      <form onSubmit={handleSubmit} className="contact-form">
        <label className="contact-field">
          <span>{t(lang, 'modals.contact.name')}</span>
          <input type="text" value={form.name} onChange={handleChange('name')} required />
        </label>
        <label className="contact-field">
          <span>{t(lang, 'modals.contact.email')}</span>
          <input type="email" value={form.email} onChange={handleChange('email')} required />
        </label>
        <label className="contact-field">
          <span>{t(lang, 'modals.contact.message')}</span>
          <textarea rows={4} value={form.message} onChange={handleChange('message')} required />
        </label>
        <button type="submit" className="btn-primary" disabled={status === 'sending'}>
          <IconSend width={16} height={16} /> {status === 'sending' ? t(lang, 'modals.contact.sending') : t(lang, 'modals.contact.send')}
        </button>
        {status === 'error' && (
          <p className="contact-form-error">
            <IconAlertTriangle width={14} height={14} /> {t(lang, 'modals.contact.errorPrefix')} <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        )}
      </form>
    </InfoModal>
  )
}
