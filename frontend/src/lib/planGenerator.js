import { classifyProduct, classificationLabel, selectMarketingStrategy, strategyLabel, allocateBudget, sprintCapacity, sprintCount, kpiFocus, primaryTarget } from './engine'
import { costFor } from './costMatrix'
import { generatePersona } from './personaGenerator'
import { c } from './contentI18n'

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

function timelineWeeksFromKey(key) {
  return { w4: 4, w8: 8, w12: 12, w26: 26 }[key] ?? 8
}

function budgetFromKey(key) {
  return { b2k: 2000, b5k: 5000, b10k: 10000, b25k: 25000, b50k: 50000 }[key] ?? 5000
}

export function generateRoadmap(resources, product, priorities, lang) {
  const dict = c(lang)
  const weeks = timelineWeeksFromKey(resources?.timelineWeeks)
  const nbSprints = sprintCount(weeks)
  const capacity = sprintCapacity(resources?.teamSize)
  const risk = dict.riskLabels[priorities?.riskKnown]

  const sprints = []
  let storyCounter = 1
  let templateIdx = 0

  for (let i = 0; i < nbSprints; i++) {
    const stories = []
    let used = 0
    while (used < capacity && templateIdx < STORY_TEMPLATES.length * 3) {
      const tmpl = STORY_TEMPLATES[templateIdx % STORY_TEMPLATES.length]
      if (used + tmpl.effort > capacity && stories.length > 0) break
      const id = `US-${String(storyCounter).padStart(3, '0')}`
      stories.push({
        id,
        title: dict.stories[tmpl.key],
        assignee: dict.assignees[tmpl.assignee] || tmpl.assignee,
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

export function generateMarketingStrategy(market, priorities, budgetKey, lang) {
  const budget = budgetFromKey(budgetKey)
  const strategy = selectMarketingStrategy(market)
  const channels = allocateBudget(budget, strategy).map(ch => ({
    ...ch,
    goal: goalFor(ch.name, ch.budget, lang),
    cadence: c(lang).cadence,
    contentPillars: contentPillarsFor(ch.name, lang)
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

export function calculateKPIs(priorities, resources, market, lang) {
  const dict = c(lang)
  const focus = kpiFocus(priorities?.focus, lang)
  const target = primaryTarget(market)
  const budget = budgetFromKey(resources?.budgetEur)

  return [
    { name: focus.primary.name, formula: focus.primary.formula, unit: focus.primary.unit, target, baseline: 0 },
    { name: focus.secondary.name, formula: focus.secondary.formula, unit: focus.secondary.unit, target: focus.secondary.name === 'CAC' ? Math.round(budget / target) : null, baseline: 0 },
    { name: focus.tertiary.name, formula: focus.tertiary.formula, unit: focus.tertiary.unit, target: null, baseline: 0 },
    { name: dict.contentPiecesKpi, formula: dict.contentPiecesFormula, unit: '#', target: 12, baseline: 0 }
  ]
}

export function generatePlan(formData) {
  const { product, market, resources, priorities, language } = formData
  const lang = language || 'fr'
  const persona = generatePersona(market, product, priorities, lang)
  const classification = classificationLabel(classifyProduct(product, market), lang)
  const roadmap = generateRoadmap(resources, product, priorities, lang)
  const marketing = generateMarketingStrategy(market, priorities, resources.budgetEur, lang)
  const kpis = calculateKPIs(priorities, resources, market, lang)

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
    language,
    generatedAt: new Date().toISOString()
  }
}
