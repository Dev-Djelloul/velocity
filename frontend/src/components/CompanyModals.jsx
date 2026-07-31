import { useState } from 'react'
import InfoModal from './InfoModal'
import { IconUser, IconTarget, IconMail, IconSend, IconBriefcase, IconExternalLink, IconCheckCircle, IconAlertTriangle } from './Icons'

const BLOG_URL = 'https://www.digitalblueskye.com/blog/digital/blogarticles'
const CONTACT_EMAIL = 'digitalblueskye@gmail.com'
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'

export function AboutModal({ onClose }) {
  return (
    <InfoModal icon={<IconUser width={26} height={26} />} title="À propos" onClose={onClose}>
      <section>
        <h2><IconUser width={20} height={20} /> digitalblueskye</h2>
        <p>VelocityLaunch est conçu et développé par digitalblueskye, maker indépendant. Le principe est simple : construire des outils qui font gagner du temps, sans jargon inutile ni fonctionnalités superflues.</p>
        <p>Retrouvez d'autres réflexions sur le produit et le développement sur <a href={BLOG_URL} target="_blank" rel="noopener noreferrer">le blog <IconExternalLink width={13} height={13} /></a>.</p>
      </section>

      <section>
        <h2><IconTarget width={20} height={20} /> Notre mission</h2>
        <p>Trop de lancements produit s'enlisent dans des heures de planning avant même la première ligne de code. VelocityLaunch existe pour inverser ça : transformer une idée en roadmap, stratégie marketing et KPIs actionnables en quelques minutes, pas en plusieurs jours.</p>
      </section>

      <section>
        <h2>Ce qui compte pour nous</h2>
        <ul>
          <li><strong>Rapidité :</strong> un plan complet en 5 minutes, pas une usine à gaz</li>
          <li><strong>Clarté :</strong> pas de jargon, des résultats directement exploitables</li>
          <li><strong>Confidentialité :</strong> vos données vous appartiennent, par défaut en local</li>
        </ul>
      </section>
    </InfoModal>
  )
}

export function CareersModal({ onClose, onContactClick }) {
  return (
    <InfoModal icon={<IconBriefcase width={26} height={26} />} title="Nous rejoindre" onClose={onClose}>
      <section>
        <h2>Pas de poste ouvert pour le moment</h2>
        <p>VelocityLaunch est aujourd'hui un projet indépendant. Il n'y a pas de fiche de poste à pourvoir actuellement.</p>
      </section>
      <section>
        <h2>Mais toujours curieux</h2>
        <p>Si vous êtes développeur·se, designer ou growth marketer et que ce type de projet vous parle, n'hésitez pas à vous manifester. Les bonnes rencontres ont rarement lieu au bon moment.</p>
        <button className="btn-secondary" onClick={onContactClick}>
          <IconMail width={16} height={16} /> Nous contacter
        </button>
      </section>
    </InfoModal>
  )
}

export function ContactModal({ onClose }) {
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
      <InfoModal icon={<IconMail width={26} height={26} />} title="Contact" onClose={onClose}>
        <div className="info-badge">
          <p><IconCheckCircle width={18} height={18} /> Message envoyé, merci ! Réponse sous peu.</p>
        </div>
      </InfoModal>
    )
  }

  return (
    <InfoModal icon={<IconMail width={26} height={26} />} title="Contact" onClose={onClose}>
      <section>
        <p>Une question, une idée, un bug à signaler ? Ce formulaire envoie directement le message, sans ouvrir votre client mail.</p>
      </section>

      <form onSubmit={handleSubmit} className="contact-form">
        <label className="contact-field">
          <span>Nom</span>
          <input type="text" value={form.name} onChange={handleChange('name')} required />
        </label>
        <label className="contact-field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={handleChange('email')} required />
        </label>
        <label className="contact-field">
          <span>Message</span>
          <textarea rows={4} value={form.message} onChange={handleChange('message')} required />
        </label>
        <button type="submit" className="btn-primary" disabled={status === 'sending'}>
          <IconSend width={16} height={16} /> {status === 'sending' ? 'Envoi…' : 'Envoyer'}
        </button>
        {status === 'error' && (
          <p className="contact-form-error">
            <IconAlertTriangle width={14} height={14} /> L'envoi a échoué. Écrivez-nous directement à <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        )}
      </form>
    </InfoModal>
  )
}
