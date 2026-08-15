import { useState } from 'react'
import { getPricingTiers } from '../lib/pricingTiers'
import { IconCheckCircle } from './Icons'
import '../styles/PricingCards.css'

// Grille de tarification à 3 niveaux, partagée entre la modal marketing (footer, pas
// d'auth requise, CTA Pro = inscription) et la vraie modal d'achat (Mon compte, CTA Pro =
// checkout Stripe). Le mode checkout/marketing ne change que le comportement des CTA —
// le contenu des offres vient d'une source unique (lib/pricingTiers.js).
export default function PricingCards({ lang, currentTierId = 'free', onSelectPro, onSelectEnterprise, proLoading, showYearlyDefault }) {
  const [interval, setInterval_] = useState(showYearlyDefault ? 'year' : 'month')
  const tiers = getPricingTiers(lang)
  const fr = lang !== 'en'

  const formatPrice = (tier) => {
    if (tier.priceLabel) return tier.priceLabel
    const amount = interval === 'year' ? tier.price.yearly : tier.price.monthly
    if (amount === 0) return fr ? '0€' : '€0'
    return `${amount}€`
  }

  return (
    <div className="pricing-cards-wrap">
      <div className="pricing-interval-toggle">
        <button className={interval === 'month' ? 'active' : ''} onClick={() => setInterval_('month')}>
          {fr ? 'Mensuel' : 'Monthly'}
        </button>
        <button className={interval === 'year' ? 'active' : ''} onClick={() => setInterval_('year')}>
          {fr ? 'Annuel' : 'Yearly'}
          <span className="pricing-interval-save">-17%</span>
        </button>
      </div>

      <div className="pricing-cards-grid">
        {tiers.map(tier => {
          const isCurrent = tier.id === currentTierId
          return (
            <div key={tier.id} className={`pricing-card-v2 ${tier.id === 'pro' ? 'is-highlighted' : ''} ${isCurrent ? 'is-current' : ''}`}>
              {tier.badge && !isCurrent && <div className="pricing-card-v2-badge">{tier.badge}</div>}
              {isCurrent && <div className="pricing-card-v2-badge is-current-badge">{fr ? 'Plan actuel' : 'Current plan'}</div>}

              <h3>{tier.name}</h3>
              <p className="pricing-card-v2-tagline">{tier.tagline}</p>

              <div className="pricing-card-v2-price">
                <span className="pricing-card-v2-amount">{formatPrice(tier)}</span>
                {tier.priceSuffix && <span className="pricing-card-v2-suffix">{tier.priceSuffix}</span>}
              </div>
              {tier.yearlyNote && interval === 'year' && (
                <p className="pricing-card-v2-yearly-note">{tier.yearlyNote}</p>
              )}

              <ul className="pricing-card-v2-features">
                {tier.features.map((f, i) => (
                  <li key={i}><IconCheckCircle width={15} height={15} /> {f}</li>
                ))}
              </ul>

              {tier.cta.type === 'current' && (
                <button className="pricing-card-v2-cta secondary" disabled>
                  {isCurrent ? (fr ? 'Plan actuel' : 'Current plan') : (fr ? 'Inclus' : 'Included')}
                </button>
              )}
              {tier.cta.type === 'checkout' && (
                <button
                  className="pricing-card-v2-cta primary"
                  disabled={isCurrent || proLoading}
                  onClick={() => onSelectPro?.(interval)}
                >
                  {isCurrent ? (fr ? 'Plan actuel' : 'Current plan') : proLoading ? (fr ? 'Redirection…' : 'Redirecting…') : (fr ? 'Passer en Pro' : 'Upgrade to Pro')}
                </button>
              )}
              {tier.cta.type === 'contact' && (
                <button className="pricing-card-v2-cta secondary" onClick={onSelectEnterprise}>
                  {fr ? 'Contacter l\'équipe' : 'Contact us'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
