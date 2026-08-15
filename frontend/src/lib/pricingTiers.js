// Source unique des 3 offres, consommée par la modal marketing (footer "Tarification",
// pas d'auth requise) et par la vraie modal d'achat (Mon compte, checkout Stripe). Garder
// les deux synchronisées manuellement serait une source de bugs à la première mise à jour.
//
// Le prix annuel correspond à 2 mois offerts (10 mois facturés / 12) — remise usuelle en
// SaaS, assez généreuse pour inciter à l'annuel sans casser la marge sur un produit à 9€/mois.
const PRO_MONTHLY = 9
const PRO_YEARLY_MONTHLY_EQUIVALENT = Math.round((PRO_MONTHLY * 10 / 12) * 100) / 100

// Nombre d'espaces d'équipe (Clerk Organizations) qu'un compte peut rejoindre/créer.
// Entreprise = illimité, cohérent avec son positionnement "sur devis" plutôt qu'un
// plafond fixe qu'il faudrait justifier en négociation commerciale.
export const TEAM_SPACE_LIMITS = { free: 1, pro: 5, enterprise: Infinity }

export function getPricingTiers(lang) {
  const fr = lang !== 'en'

  return [
    {
      id: 'free',
      name: fr ? 'Gratuit' : 'Free',
      tagline: fr ? 'Pour tester le générateur sans engagement.' : 'To try the generator, no strings attached.',
      price: { monthly: 0, yearly: 0 },
      priceSuffix: null,
      cta: { type: 'current' },
      features: fr ? [
        '3 plans générés',
        'Espace personnel + 1 espace d\'équipe',
        'Export PDF & CSV',
        'Partage par lien',
        'Sections IA à la demande (veille, benchmarks, RGPD…)'
      ] : [
        '3 generated plans',
        'Personal space + 1 team space',
        'PDF & CSV export',
        'Shareable link',
        'On-demand AI sections (market watch, benchmarks, GDPR…)'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      badge: fr ? 'Le plus populaire' : 'Most popular',
      tagline: fr ? 'Pour lancer plusieurs produits, en équipe.' : 'For launching multiple products, as a team.',
      price: { monthly: PRO_MONTHLY, yearly: PRO_YEARLY_MONTHLY_EQUIVALENT },
      priceSuffix: fr ? '/ mois' : '/ month',
      yearlyNote: fr
        ? `soit ${Math.round(PRO_YEARLY_MONTHLY_EQUIVALENT * 12)}€/an, 2 mois offerts`
        : `billed ${Math.round(PRO_YEARLY_MONTHLY_EQUIVALENT * 12)}€/year, 2 months free`,
      cta: { type: 'checkout' },
      features: fr ? [
        'Générations de plans illimitées',
        'Jusqu\'à 5 espaces d\'équipe',
        'Intégrations Notion, Jira & GitHub',
        'Export avancé (présentation PPTX)',
        'Historique complet & notifications d\'équipe',
        'Support prioritaire par email'
      ] : [
        'Unlimited plan generations',
        'Up to 5 team spaces',
        'Notion, Jira & GitHub integrations',
        'Advanced export (PPTX presentation)',
        'Full history & team notifications',
        'Priority email support'
      ]
    },
    {
      id: 'enterprise',
      name: fr ? 'Entreprise' : 'Enterprise',
      tagline: fr ? 'Pour les organisations avec des besoins spécifiques.' : 'For organizations with specific needs.',
      price: { monthly: null, yearly: null },
      priceLabel: fr ? 'Sur devis' : 'Custom',
      cta: { type: 'contact' },
      features: fr ? [
        'Tout Pro, plus :',
        'Espaces d\'équipe illimités',
        'Accompagnement à l\'onboarding',
        'SSO / SAML sur demande',
        'Facturation centralisée multi-équipes',
        'SLA & support dédié',
        'Déploiement et intégrations sur mesure'
      ] : [
        'Everything in Pro, plus:',
        'Unlimited team spaces',
        'Guided onboarding',
        'SSO / SAML on request',
        'Centralized multi-team billing',
        'SLA & dedicated support',
        'Custom deployment & integrations'
      ]
    }
  ]
}
