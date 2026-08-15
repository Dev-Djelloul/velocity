import InfoModal from './InfoModal'
import PricingCards from './PricingCards'
import { t } from '../lib/i18n'
import { IconTag, IconFileText, IconCompass } from './Icons'

// Modal marketing (footer "Tarification", accessible sans compte) — mêmes offres que la
// vraie modal d'achat (Mon compte, voir PricingCards), mais les CTA renvoient vers le
// parcours d'inscription/checkout plutôt que d'ouvrir Stripe directement ici : App.jsx
// fournit onSelectPro pour router selon que le visiteur est déjà connecté ou non.
export function PricingModal({ lang, onClose, onContactClick, onSelectPro, currentTierId }) {
  return (
    <InfoModal icon={<IconTag width={26} height={26} />} title={t(lang, 'modals.pricing.title')} onClose={onClose} wide>
      <section>
        <p>{t(lang, 'modals.pricing.intro')}</p>
      </section>

      <PricingCards
        lang={lang}
        currentTierId={currentTierId || 'free'}
        onSelectPro={() => { onClose(); onSelectPro?.() }}
        onSelectEnterprise={() => { onClose(); onContactClick?.() }}
      />
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
