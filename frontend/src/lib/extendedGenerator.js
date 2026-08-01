// Miroir frontend de backend/src/lib/generator/extendedGenerator.js — utilisé quand
// l'application génère un plan hors-ligne / sans backend (repli local).

const BUDGET = { b2k: 2000, b5k: 5000, b10k: 10000, b25k: 25000, b50k: 50000 }
const TIMELINE_WEEKS = { w4: 4, w8: 8, w12: 12, w26: 26 }
const ARPU_BY_MODEL = { b2b: 99, b2c: 15, hybrid: 40 }

export function generateFinancials(resources, market) {
  const budget = BUDGET[resources?.budgetEur] ?? 5000
  const weeks = TIMELINE_WEEKS[resources?.timelineWeeks] ?? 8
  const months = Math.max(1, weeks / 4.33)

  const monthlyBurn = Math.round(budget / months)
  const runwayMonths = Math.round((budget / monthlyBurn) * 10) / 10
  const assumedArpu = ARPU_BY_MODEL[market?.b2bVsB2c] ?? 40
  const breakEvenUsers = Math.ceil(monthlyBurn / assumedArpu)
  const breakEvenMonthlyRevenue = breakEvenUsers * assumedArpu

  const split = { product: 0.5, marketing: 0.35, ops: 0.15 }
  const costBreakdown = [
    { category: 'Développement', amount: Math.round(budget * split.product), pct: Math.round(split.product * 100) },
    { category: 'Marketing', amount: Math.round(budget * split.marketing), pct: Math.round(split.marketing * 100) },
    { category: 'Opérations', amount: Math.round(budget * split.ops), pct: Math.round(split.ops * 100) }
  ]

  return { monthlyBurn, runwayMonths, assumedArpu, breakEvenUsers, breakEvenMonthlyRevenue, costBreakdown }
}

const SWOT_FR = {
  strengths: {
    prelaunch: 'Page blanche : aucune dette technique ni promesse déjà faite au marché',
    mvp: 'Produit déjà fonctionnel, retours utilisateurs réels disponibles',
    growing: 'Traction existante à exploiter pour accélérer'
  },
  weakness: 'Notoriété de marque encore à construire face à des acteurs installés',
  opportunityLow: 'Peu de concurrence directe identifiée : fenêtre pour occuper le terrain rapidement',
  opportunityHigh: 'Marché déjà éduqué par la concurrence : moins de pédagogie nécessaire côté acquisition',
  threatHigh: 'Concurrents établis avec des budgets d\'acquisition plus importants',
  threatLow: 'Risque qu\'un acteur mieux financé entre sur le segment après validation du marché'
}

const SWOT_EN = {
  strengths: {
    prelaunch: 'Clean slate: no technical debt or existing market promises to walk back',
    mvp: 'Working product already, real user feedback available',
    growing: 'Existing traction to build on for faster growth'
  },
  weakness: 'Brand awareness still to build against established players',
  opportunityLow: 'Little direct competition identified: window to claim the space quickly',
  opportunityHigh: 'Market already educated by competitors: less acquisition groundwork needed',
  threatHigh: 'Established competitors with larger acquisition budgets',
  threatLow: 'Risk of a better-funded player entering once the market is validated'
}

const COMPETITION_LABEL = {
  fr: { none: 'aucune', low: 'faible', moderate: 'modérée', high: 'forte' },
  en: { none: 'no', low: 'low', moderate: 'moderate', high: 'high' }
}

export function generateStrategyToolkit(product, market, lang) {
  const dict = lang === 'en' ? SWOT_EN : SWOT_FR
  const highCompetition = market?.competition === 'high'
  const competitionLabel = COMPETITION_LABEL[lang === 'en' ? 'en' : 'fr'][market?.competition] ?? COMPETITION_LABEL.fr.moderate

  const swot = {
    strengths: [dict.strengths[product?.stage] || dict.strengths.mvp, product?.usp || (lang === 'en' ? 'Distinctive value proposition' : 'Proposition de valeur différenciante')],
    weaknesses: [dict.weakness],
    opportunities: [highCompetition ? dict.opportunityHigh : dict.opportunityLow],
    threats: [highCompetition ? dict.threatHigh : dict.threatLow]
  }

  const competitivePositioning = lang === 'en'
    ? `With ${competitionLabel} competition on this segment, positioning should lean on "${product?.usp || 'the stated differentiator'}" rather than competing on price alone.`
    : `Avec une concurrence ${competitionLabel} sur ce segment, le positionnement doit s'appuyer sur "${product?.usp || 'la différenciation déclarée'}" plutôt que sur le prix seul.`

  return { swot, competitivePositioning }
}

export function generateExecutiveSummary(product, classification, resources, lang) {
  const budget = BUDGET[resources?.budgetEur] ?? 5000
  const weeks = TIMELINE_WEEKS[resources?.timelineWeeks] ?? 8

  return lang === 'en'
    ? `${product?.name || 'This product'} enters a "${classification}" phase over ${weeks} weeks with a ${budget.toLocaleString()} € budget. ${product?.pitch || ''} The plan below breaks that down into sprints, marketing spend and KPIs to track.`
    : `${product?.name || 'Ce produit'} entre en phase "${classification}" sur ${weeks} semaines avec un budget de ${budget.toLocaleString()} €. ${product?.pitch || ''} Le plan ci-dessous détaille cela en sprints, dépenses marketing et KPIs à suivre.`
}
