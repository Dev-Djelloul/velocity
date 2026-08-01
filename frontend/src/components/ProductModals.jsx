import InfoModal from './InfoModal'
import { t } from '../lib/i18n'
import { IconTag, IconFileText, IconCompass, IconMail } from './Icons'

export function PricingModal({ lang, onClose, onContactClick }) {
  const currentFeatures = t(lang, 'modals.pricing.currentFeatures')
  const soonFeatures = t(lang, 'modals.pricing.soonFeatures')

  return (
    <InfoModal icon={<IconTag width={26} height={26} />} title={t(lang, 'modals.pricing.title')} onClose={onClose} wide>
      <section>
        <p>{t(lang, 'modals.pricing.intro')}</p>
      </section>

      <div className="pricing-grid">
        <div className="pricing-card active">
          <div className="pricing-badge">{t(lang, 'modals.pricing.currentBadge')}</div>
          <h3>{t(lang, 'modals.pricing.currentTitle')}</h3>
          <div className="pricing-amount">{t(lang, 'modals.pricing.currentPrice')}</div>
          <ul>
            {currentFeatures.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </div>

        <div className="pricing-card">
          <div className="pricing-badge soon">{t(lang, 'modals.pricing.soonBadge')}</div>
          <h3>{t(lang, 'modals.pricing.soonTitle')}</h3>
          <div className="pricing-amount">{t(lang, 'modals.pricing.soonPrice')}</div>
          <ul>
            {soonFeatures.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
          <button className="btn-secondary" onClick={onContactClick}>
            <IconMail width={16} height={16} /> {t(lang, 'modals.pricing.notifyMe')}
          </button>
        </div>
      </div>
    </InfoModal>
  )
}

export function ChangelogModal({ lang, onClose }) {
  const entries = t(lang, 'modals.changelog.entries')

  return (
    <InfoModal icon={<IconFileText width={26} height={26} />} title={t(lang, 'modals.changelog.title')} onClose={onClose}>
      {entries.map((entry, i) => (
        <section key={i}>
          <h2>{entry.title}</h2>
          <p className="changelog-date">{entry.date}</p>
          <ul>
            {entry.items.map((item, j) => <li key={j}>{item}</li>)}
          </ul>
        </section>
      ))}
    </InfoModal>
  )
}

export function RoadmapModal({ lang, onClose }) {
  const columns = t(lang, 'modals.roadmap.columns')

  return (
    <InfoModal icon={<IconCompass width={26} height={26} />} title={t(lang, 'modals.roadmap.title')} onClose={onClose} wide>
      <section>
        <p>{t(lang, 'modals.roadmap.intro')}</p>
      </section>
      <div className="roadmap-columns">
        {columns.map((col, i) => (
          <div key={i} className="roadmap-column">
            <h3>{col.label}</h3>
            <ul>
              {col.items.map((item, j) => <li key={j}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </InfoModal>
  )
}
