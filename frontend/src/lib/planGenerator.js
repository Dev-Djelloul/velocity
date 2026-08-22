import { classifyProduct, classificationLabel, selectMarketingStrategy, strategyLabel, allocateBudget, sprintCapacity, sprintCount, kpiFocus, sectorKpi, primaryTarget, resolveAssignee } from './engine'
import { costFor } from './costMatrix'
import { generatePersona } from './personaGenerator'
import { generateFinancials, generateStrategyToolkit, generateExecutiveSummary } from './extendedGenerator'
import { c } from './contentI18n'
import { budgetFromKey } from './budgetTiers'
import { weeksFromKey } from './timelineTiers'

const STORY_TEMPLATES = [
  { key: 'onboarding', category: 'product', type: 'frontend', effort: 8, assignee: 'Dev' },
  { key: 'positioning', category: 'marketing', type: 'content', effort: 5, assignee: 'Marketing' },
  { key: 'landing', category: 'product', type: 'design', effort: 8, assignee: 'Design' },
  { key: 'stagingDeploy', category: 'product', type: 'backend', effort: 8, assignee: 'Dev' },
  { key: 'teaser', category: 'marketing', type: 'video', effort: 13, assignee: 'Marketing' },
  { key: 'analytics', category: 'ops', type: 'analytics', effort: 5, assignee: 'Dev' },
  { key: 'publicBeta', category: 'product', type: 'backend', effort: 5, assignee: 'Dev' },
  { key: 'paidCampaign', category: 'marketing', type: 'paid_ad', effort: 8, assignee: 'Marketing' },
  { key: 'community', category: 'ops', type: 'community', effort: 5, assignee: 'Product' },
  { key: 'qa', category: 'product', type: 'qa', effort: 5, assignee: 'Dev' },
  { key: 'thoughtLeadership', category: 'marketing', type: 'content', effort: 5, assignee: 'Marketing' },
  { key: 'feedback', category: 'product', type: 'frontend', effort: 8, assignee: 'Dev' }
]

const RULE_PRIORITY = {
  marketingFirst: { marketing: -1, product: 0, ops: 0 },
  designFirst: { design: -1 },
  devFirst: { backend: -1, frontend: -1 },
  mobileFirst: { frontend: -1, design: -1 },
  dataDriven: { ops: -1, analytics: -1 },
  salesLed: { marketing: -1, content: -1 },
  plg: { product: -1, frontend: -1 },
  complianceFirst: { backend: -1, qa: -1 }
}

function applyRules(templates, rulesFlags) {
  if (!rulesFlags?.length) return templates
  const weight = (tmpl) => rulesFlags.reduce((acc, flag) => {
    const rule = RULE_PRIORITY[flag]
    if (!rule) return acc
    return acc + (rule[tmpl.category] ?? rule[tmpl.type] ?? 0)
  }, 0)
  return templates.map((tmpl, idx) => ({ tmpl, idx })).sort((a, b) => weight(a.tmpl) - weight(b.tmpl) || a.idx - b.idx).map(x => x.tmpl)
}

export function generateRoadmap(resources, product, priorities, lang) {
  const dict = c(lang)
  const weeks = weeksFromKey(resources?.timelineWeeks)
  const nbSprints = sprintCount(weeks)
  const capacity = sprintCapacity(resources?.teamSize)
  const risk = dict.riskLabels[priorities?.riskKnown]
  const templates = applyRules(STORY_TEMPLATES, priorities?.rulesFlags)

  const sprints = []
  let storyCounter = 1
  let templateIdx = 0

  for (let i = 0; i < nbSprints; i++) {
    const stories = []
    let used = 0
    while (used < capacity && templateIdx < templates.length * 3) {
      const tmpl = templates[templateIdx % templates.length]
      if (used + tmpl.effort > capacity && stories.length > 0) break
      const id = `US-${String(storyCounter).padStart(3, '0')}`
      stories.push({
        id,
        title: dict.stories[tmpl.key],
        description: dict.storyDescriptions[tmpl.key],
        acceptanceCriteria: dict.storyAcceptance[tmpl.key],
        assignee: (who => dict.assignees[who] || who)(resolveAssignee(tmpl.assignee, resources?.rolesPresent)),
        effort: tmpl.effort,
        cost: costFor(tmpl.category, tmpl.type),
        dependsOn: stories.length > 0 && templateIdx % 3 === 1 ? [stories[stories.length - 1].id] : []
      })
      storyCounter++
      templateIdx++
      used += tmpl.effort
    }

    sprints.push({
      sprintId: i + 1,
      duration: '2 weeks',
      stories,
      estimatedCost: stories.reduce((s, x) => s + x.cost, 0),
      risks: i === 0 && risk ? [risk] : []
    })
  }

  return {
    sprints,
    totalDuration: weeks,
    estimatedCost: sprints.reduce((s, sp) => s + sp.estimatedCost, 0)
  }
}

export function generateMarketingStrategy(market, priorities, budgetKey, lang, category) {
  const budget = budgetFromKey(budgetKey)
  const strategy = selectMarketingStrategy(market, category)
  const channels = allocateBudget(budget, strategy).map(ch => ({
    ...ch,
    goal: goalFor(ch.name, ch.budget, lang),
    cadence: c(lang).cadence,
    contentPillars: contentPillarsFor(ch.name, lang),
    assets: assetsFor(ch.name, lang)
  }))

  const contentCalendar = []
  for (let w = 1; w <= 4; w++) {
    channels.forEach(ch => {
      contentCalendar.push({ week: w, channel: ch.name, content: `${ch.name} post #${w}`, status: 'planned' })
    })
  }

  return {
    strategy: strategyLabel(strategy.key, lang),
    channels,
    contentCalendar,
    totalBudget: budget
  }
}

function goalFor(channel, budget, lang) {
  const dict = c(lang)
  const unit = dict.channelUnits[channel]
  if (!unit) return `${dict.channelGoalGeneric} ${channel}`
  const amount = channel === 'TikTok' ? Math.round(budget / 3)
    : channel === 'YouTube' ? Math.round(budget / 5)
    : channel === 'LinkedIn' ? Math.round(budget / 20)
    : channel === 'Content' ? Math.round(budget / 200)
    : channel === 'Paid' ? Math.round(budget / 15)
    : channel === 'Community' ? Math.round(budget / 10)
    : channel === 'Partnerships' ? Math.round(budget / 500)
    : Math.round(budget / 20)
  return `${amount} ${unit}`
}

function contentPillarsFor(channel, lang) {
  const dict = c(lang)
  return dict.contentPillars[channel] || dict.contentPillarsGeneric
}

function assetsFor(channel, lang) {
  const dict = c(lang)
  return dict.channelAssets[channel] || dict.channelAssetsGeneric
}

export function calculateKPIs(priorities, resources, market, lang, category) {
  const dict = c(lang)
  const focus = kpiFocus(priorities?.focus, lang)
  const target = primaryTarget(market)
  const budget = budgetFromKey(resources?.budgetEur)

  const monthly = lang === 'en' ? 'Monthly' : 'Mensuel'
  const weekly = lang === 'en' ? 'Weekly' : 'Hebdomadaire'

  // La métrique de succès choisie remplace le KPI principal (cible neutralisée pour les métriques monétaires).
  const override = dict.successMetrics?.[priorities?.successMetric]
  const primaryKpi = override
    ? { name: override.name, formula: override.formula, unit: override.unit, target: override.unit === '€' ? null : target, baseline: 0, timeframe: monthly }
    : { name: focus.primary.name, formula: focus.primary.formula, unit: focus.primary.unit, target, baseline: 0, timeframe: monthly }

  // L'engagement requis module l'objectif de contenus publiés.
  const contentTarget = { minimal: 8, moderate: 12, high: 20, community: 24, whiteglove: 14 }[priorities?.engagement] ?? 12

  const kpis = [
    primaryKpi,
    { name: focus.secondary.name, formula: focus.secondary.formula, unit: focus.secondary.unit, target: focus.secondary.name === 'CAC' ? Math.round(budget / target) : null, baseline: 0, timeframe: monthly },
    { name: focus.tertiary.name, formula: focus.tertiary.formula, unit: focus.tertiary.unit, target: null, baseline: 0, timeframe: weekly },
    { name: dict.contentPiecesKpi, formula: dict.contentPiecesFormula, unit: '#', target: contentTarget, baseline: 0, timeframe: weekly }
  ]

  // KPI additionnel propre au secteur (ex : GMV pour une marketplace) — vient s'ajouter
  // aux 4 KPIs génériques plutôt que d'en remplacer un, uniquement si le secteur du produit
  // a un indicateur suffisamment distinct pour justifier un 5e KPI.
  const sector = sectorKpi(category, lang)
  if (sector) kpis.push({ ...sector, target: null, baseline: 0, timeframe: monthly })

  return kpis
}

export function generatePlan(formData) {
  const { product, market, resources, priorities, language } = formData
  const lang = language || 'fr'
  const persona = generatePersona(market, product, priorities, lang)
  const classification = classificationLabel(classifyProduct(product, market), lang)
  const roadmap = generateRoadmap(resources, product, priorities, lang)
  const marketing = generateMarketingStrategy(market, priorities, resources.budgetEur, lang, product?.category)
  const kpis = calculateKPIs(priorities, resources, market, lang, product?.category)
  const financials = generateFinancials(resources, market, lang)
  const strategyToolkit = generateStrategyToolkit(product, market, lang)
  const executiveSummary = generateExecutiveSummary(product, classification, resources, lang)

  const now = new Date()
  const nowIso = now.toISOString()
  // Date de lancement cible = début de prépa + durée choisie au questionnaire (pas "maintenant" :
  // à la génération, le lancement est encore une intention future, pas un fait accompli).
  const targetLaunchMs = now.getTime() + (roadmap.totalDuration || 0) * 7 * 24 * 60 * 60 * 1000
  return {
    product,
    market,
    resources,
    priorities,
    persona,
    classification,
    roadmap,
    marketing,
    kpis,
    financials,
    strategyToolkit,
    executiveSummary,
    language,
    generatedAt: nowIso,
    planStartDate: nowIso,
    launchDate: new Date(targetLaunchMs).toISOString()
  }
}
