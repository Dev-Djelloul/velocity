// Miroir frontend de backend/src/lib/generator/extendedGenerator.js — utilisé quand
// l'application génère un plan hors-ligne / sans backend (repli local).

import { resolveBudgetAmount } from './budgetTiers'
import { TIMELINE_WEEKS } from './timelineTiers'

const ARPU_BY_MODEL = { b2b: 99, b2c: 15, hybrid: 40 }

const COST_CATEGORY_LABELS = {
  fr: { product: 'Développement', marketing: 'Marketing', ops: 'Opérations' },
  en: { product: 'Development', marketing: 'Marketing', ops: 'Operations' }
}

const MODEL_LABEL = {
  fr: { b2b: 'B2B (vente à d\'autres entreprises)', b2c: 'B2C (vente directe aux particuliers)', hybrid: 'hybride B2B/B2C' },
  en: { b2b: 'B2B (selling to other businesses)', b2c: 'B2C (direct-to-consumer)', hybrid: 'hybrid B2B/B2C' }
}

function arpuRationaleFor(model, arpu, lang) {
  const labels = MODEL_LABEL[lang] || MODEL_LABEL.fr
  const label = labels[model] || labels.hybrid
  return lang === 'en'
    ? `${arpu} €/month reflects a typical ARPU for a ${label} product at this stage — adjust once real pricing is validated.`
    : `${arpu} €/mois correspond à un ARPU typique pour un modèle ${label} à ce stade — à ajuster une fois le prix réel validé.`
}

export function generateFinancials(resources, market, lang, marketingBudget) {
  // totalBudget (enveloppe globale du lancement) pilote le prévisionnel financier — pas
  // budgetEur, qui n'est que la part marketing. Repli sur budgetEur pour les plans/brouillons
  // générés avant l'introduction de ce champ distinct.
  const budget = resources?.totalBudget != null ? resolveBudgetAmount(resources.totalBudget) : resolveBudgetAmount(resources?.budgetEur)
  const weeks = TIMELINE_WEEKS[resources?.timelineWeeks] ?? 8
  const months = Math.max(1, weeks / 4.33)

  const monthlyBurn = Math.round(budget / months)
  const runwayMonths = Math.round((budget / monthlyBurn) * 10) / 10
  const assumedArpu = ARPU_BY_MODEL[market?.b2bVsB2c] ?? 40
  const breakEvenUsers = Math.ceil(monthlyBurn / assumedArpu)
  const breakEvenMonthlyRevenue = breakEvenUsers * assumedArpu

  const labels = COST_CATEGORY_LABELS[lang] || COST_CATEGORY_LABELS.fr
  // Le marketing de la "Répartition du budget" doit être LE MÊME chiffre que le budget
  // marketing réel (slider Stratégie marketing / carte Budget & Délai), pas une part fixe
  // de 35% inventée indépendamment — sinon les deux budgets marketing affichés dans le
  // plan divergent (retour utilisateur, capture à l'appui). Le reste (dev + ops) se
  // répartit sur ce qu'il reste du budget total, dans le même ratio relatif qu'avant
  // (50/15, soit environ 77%/23% de ce qui reste une fois le marketing retiré).
  const marketing = Math.min(marketingBudget ?? Math.round(budget * 0.35), budget)
  const remainder = Math.max(0, budget - marketing)
  const product = Math.round(remainder * (0.5 / 0.65))
  const ops = Math.max(0, remainder - product)
  const costBreakdown = [
    { category: labels.product, amount: product, pct: budget ? Math.round((product / budget) * 100) : 0 },
    { category: labels.marketing, amount: marketing, pct: budget ? Math.round((marketing / budget) * 100) : 0 },
    { category: labels.ops, amount: ops, pct: budget ? Math.round((ops / budget) * 100) : 0 }
  ]

  const arpuRationale = arpuRationaleFor(market?.b2bVsB2c, assumedArpu, lang)

  return { monthlyBurn, runwayMonths, assumedArpu, arpuRationale, breakEvenUsers, breakEvenMonthlyRevenue, costBreakdown }
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
  threatLow: 'Risque qu\'un acteur mieux financé entre sur le segment après validation du marché',
  sectorRisk: {
    fintech: 'Contraintes réglementaires fortes (KYC/AML, agrément) pouvant ralentir le lancement',
    healthtech: 'Exigences de conformité sur les données de santé (hébergement agréé, consentement) à cadrer tôt',
    marketplace: 'Problème de démarrage à froid : les deux côtés de la marketplace doivent s\'amorcer simultanément',
    edtech: 'Cycles de décision longs côté institutions, budget souvent annuel et contraint',
    ecommerce: 'Marges compressées par les coûts d\'acquisition payante et la logistique',
    devtools: 'Adoption dépendante de la confiance de la communauté développeur, difficile à acheter'
  }
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
  threatLow: 'Risk of a better-funded player entering once the market is validated',
  sectorRisk: {
    fintech: 'Heavy regulatory constraints (KYC/AML, licensing) that can slow down launch',
    healthtech: 'Health data compliance requirements (approved hosting, consent) to scope early',
    marketplace: 'Cold-start problem: both sides of the marketplace need to bootstrap at once',
    edtech: 'Long institutional decision cycles, often tied to an annual, constrained budget',
    ecommerce: 'Margins squeezed by paid acquisition costs and logistics',
    devtools: 'Adoption depends on developer-community trust, which can\'t simply be bought'
  }
}

const COMPETITION_LABEL = {
  fr: { none: 'aucune', low: 'faible', moderate: 'modérée', high: 'forte' },
  en: { none: 'no', low: 'low', moderate: 'moderate', high: 'high' }
}

export function generateStrategyToolkit(product, market, lang) {
  const dict = lang === 'en' ? SWOT_EN : SWOT_FR
  const highCompetition = market?.competition === 'high'
  const competitionLabel = COMPETITION_LABEL[lang === 'en' ? 'en' : 'fr'][market?.competition] ?? COMPETITION_LABEL.fr.moderate

  const sectorThreat = dict.sectorRisk?.[product?.category]

  const swot = {
    strengths: [dict.strengths[product?.stage] || dict.strengths.mvp, product?.usp || (lang === 'en' ? 'Distinctive value proposition' : 'Proposition de valeur différenciante')],
    weaknesses: [dict.weakness],
    opportunities: [highCompetition ? dict.opportunityHigh : dict.opportunityLow],
    threats: sectorThreat ? [highCompetition ? dict.threatHigh : dict.threatLow, sectorThreat] : [highCompetition ? dict.threatHigh : dict.threatLow]
  }

  const competitivePositioning = lang === 'en'
    ? `With ${competitionLabel} competition on this segment, positioning should lean on "${product?.usp || 'the stated differentiator'}" rather than competing on price alone.`
    : `Avec une concurrence ${competitionLabel} sur ce segment, le positionnement doit s'appuyer sur "${product?.usp || 'la différenciation déclarée'}" plutôt que sur le prix seul.`

  return { swot, competitivePositioning }
}

export function generateExecutiveSummary(product, classification, resources, lang) {
  const budget = resources?.totalBudget != null ? resolveBudgetAmount(resources.totalBudget) : resolveBudgetAmount(resources?.budgetEur)
  const weeks = TIMELINE_WEEKS[resources?.timelineWeeks] ?? 8

  return lang === 'en'
    ? `${product?.name || 'This product'} enters a "${classification}" phase over ${weeks} weeks with a ${budget.toLocaleString()} € budget. ${product?.pitch || ''} The plan below breaks that down into sprints, marketing spend and KPIs to track.`
    : `${product?.name || 'Ce produit'} entre en phase "${classification}" sur ${weeks} semaines avec un budget de ${budget.toLocaleString()} €. ${product?.pitch || ''} Le plan ci-dessous détaille cela en sprints, dépenses marketing et KPIs à suivre.`
}
