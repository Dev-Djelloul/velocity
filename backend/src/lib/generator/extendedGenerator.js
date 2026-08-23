// Générateurs de repli (règles) pour les blocs ajoutés en Phase 1 — financials, strategyToolkit,
// executiveSummary. Moins riches que la génération IA, mais gardent le filet de sécurité complet :
// aucune section ne doit manquer selon que le plan vient de l'IA ou des règles.

import { BUDGET } from './budgetTiers'

const TIMELINE_WEEKS = { w2: 2, w4: 4, w8: 8, w12: 12, w16: 16, w26: 26, w36: 36, w52: 52 }
const ARPU_BY_MODEL = { b2b: 99, b2c: 15, hybrid: 40 }

// Postes de dépense du budget de lancement (hors marketing, additif — voir generateFinancials)
// — les poids somment à 1 et pilotent la répartition détaillée demandée en retour utilisateur
// (avant : seulement Développement/Opérations, jugé trop grossier).
const COST_CATEGORY_LABELS_FR = {
  product: 'Développement produit', design: 'Design & UX', infra: 'Infrastructure & outils',
  ops: 'Opérations & support', legal: 'Légal & conformité', reserve: 'Réserve pour imprévus', marketing: 'Marketing'
}
const COST_CATEGORY_LABELS_EN = {
  product: 'Product development', design: 'Design & UX', infra: 'Infrastructure & tools',
  ops: 'Operations & support', legal: 'Legal & compliance', reserve: 'Contingency reserve', marketing: 'Marketing'
}
const COST_WEIGHTS = [
  { key: 'product', w: 0.45 },
  { key: 'design', w: 0.10 },
  { key: 'infra', w: 0.10 },
  { key: 'ops', w: 0.20 },
  { key: 'legal', w: 0.05 },
  { key: 'reserve', w: 0.10 }
]

// Répartit `amount` selon des poids qui somment à 1, en assignant l'écart d'arrondi à la
// première catégorie (la plus grosse) pour que la somme retombe exactement sur `amount`.
function distributeByWeights(amount, weights) {
  const amounts = weights.map(x => Math.round(amount * x.w))
  const diff = amount - amounts.reduce((s, a) => s + a, 0)
  amounts[0] += diff
  return amounts
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

export function generateFinancials(resources, market, lang = 'fr', marketingBudget) {
  // totalBudget (enveloppe globale) pilote le prévisionnel — pas budgetEur, qui n'est que la
  // part marketing. Repli sur budgetEur pour les plans générés avant ce champ distinct.
  const budget = BUDGET[resources?.totalBudget] ?? BUDGET[resources?.budgetEur] ?? 5000
  const weeks = TIMELINE_WEEKS[resources?.timelineWeeks] ?? 8
  const months = Math.max(1, weeks / 4.33)

  const monthlyBurn = Math.round(budget / months)
  const runwayMonths = Math.round((budget / monthlyBurn) * 10) / 10
  const assumedArpu = ARPU_BY_MODEL[market?.b2bVsB2c] ?? 40
  const breakEvenUsers = Math.ceil(monthlyBurn / assumedArpu)
  const breakEvenMonthlyRevenue = breakEvenUsers * assumedArpu

  // Le marketing s'AJOUTE au budget de lancement, il n'en fait pas partie (même convention
  // que le tableau de bord équipe : budget cumulé = budget de lancement + budget marketing,
  // voir SpacePage.jsx) — avant ce correctif, la Répartition du budget affichait le marketing
  // comme une part DU budget total, ce qui gonflait artificiellement les 100% affichés et
  // sous-évaluait développement/opérations (retour utilisateur, capture à l'appui).
  const marketing = Math.max(0, marketingBudget ?? Math.round(budget * 0.35))
  const grandTotal = budget + marketing
  const labels = lang === 'en' ? COST_CATEGORY_LABELS_EN : COST_CATEGORY_LABELS_FR
  const amounts = distributeByWeights(budget, COST_WEIGHTS)
  const costBreakdown = [
    ...COST_WEIGHTS.map((entry, i) => ({
      category: labels[entry.key],
      amount: amounts[i],
      pct: grandTotal ? Math.round((amounts[i] / grandTotal) * 100) : 0
    })),
    { category: labels.marketing, amount: marketing, pct: grandTotal ? Math.round((marketing / grandTotal) * 100) : 0 }
  ]

  const arpuRationale = arpuRationaleFor(market?.b2bVsB2c, assumedArpu, lang)

  return { monthlyBurn, runwayMonths, assumedArpu, arpuRationale, breakEvenUsers, breakEvenMonthlyRevenue, costBreakdown }
}

// Filet de sécurité pour le plan généré par IA (planSchema.js demande déjà explicitement à
// l'IA de garder la ligne "Marketing" cohérente avec marketing.totalBudget et de traiter le
// marketing comme additif au budget de lancement, mais une instruction de prompt reste
// indicative, pas garantie) — recale costBreakdown après coup pour que : (1) la ligne
// Marketing corresponde À COUP SÛR au budget marketing réel, (2) les autres lignes somment
// exactement au budget de lancement déclaré (launchBudget) plutôt qu'à "total - marketing",
// qui présupposait à tort que le marketing faisait partie du budget total (retour
// utilisateur — le marketing s'ajoute au budget de lancement, il n'en fait pas partie).
export function reconcileFinancialsWithMarketing(financials, marketingBudget, launchBudget) {
  if (!financials?.costBreakdown?.length || marketingBudget == null) return financials
  const marketingLine = financials.costBreakdown.find(l => /marketing/i.test(l.category))
  const others = financials.costBreakdown.filter(l => l !== marketingLine)
  if (!marketingLine || !others.length) return financials
  const marketing = Math.max(0, marketingBudget)
  const othersTotal = others.reduce((s, l) => s + (l.amount || 0), 0) || 1
  const targetOthers = launchBudget != null ? launchBudget : othersTotal
  const grandTotal = targetOthers + marketing
  const nextCostBreakdown = financials.costBreakdown.map(line => {
    if (line === marketingLine) {
      return { ...line, amount: marketing, pct: grandTotal ? Math.round((marketing / grandTotal) * 100) : 0 }
    }
    const amount = Math.round(targetOthers * ((line.amount || 0) / othersTotal))
    return { ...line, amount, pct: grandTotal ? Math.round((amount / grandTotal) * 100) : 0 }
  })
  return { ...financials, costBreakdown: nextCostBreakdown }
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
  const budget = BUDGET[resources?.totalBudget] ?? BUDGET[resources?.budgetEur] ?? 5000
  const weeks = TIMELINE_WEEKS[resources?.timelineWeeks] ?? 8

  return lang === 'en'
    ? `${product?.name || 'This product'} enters a "${classification}" phase over ${weeks} weeks with a ${budget.toLocaleString()} € budget. ${product?.pitch || ''} The plan below breaks that down into sprints, marketing spend and KPIs to track.`
    : `${product?.name || 'Ce produit'} entre en phase "${classification}" sur ${weeks} semaines avec un budget de ${budget.toLocaleString()} €. ${product?.pitch || ''} Le plan ci-dessous détaille cela en sprints, dépenses marketing et KPIs à suivre.`
}
