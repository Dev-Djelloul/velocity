import { classifyProduct, selectMarketingStrategy, allocateBudget, sprintCapacity, sprintCount, kpiFocus, primaryTarget } from './engine'
import { costFor } from './costMatrix'
import { generatePersona } from './personaGenerator'

const STORY_TEMPLATES = [
  { title: 'Finalize onboarding flow', category: 'product', type: 'frontend', effort: 8, assignee: 'Dev' },
  { title: 'Create brand positioning doc', category: 'marketing', type: 'content', effort: 5, assignee: 'Marketing' },
  { title: 'Build landing page mockups', category: 'product', type: 'design', effort: 8, assignee: 'Design' },
  { title: 'Deploy MVP to staging', category: 'product', type: 'backend', effort: 8, assignee: 'Dev' },
  { title: 'Film launch teaser videos', category: 'marketing', type: 'video', effort: 13, assignee: 'Marketing' },
  { title: 'Set up analytics tracking', category: 'ops', type: 'analytics', effort: 5, assignee: 'Dev' },
  { title: 'Launch public beta', category: 'product', type: 'backend', effort: 5, assignee: 'Dev' },
  { title: 'Run paid acquisition campaign', category: 'marketing', type: 'paid_ad', effort: 8, assignee: 'Marketing' },
  { title: 'Set up community channel', category: 'ops', type: 'community', effort: 5, assignee: 'Product' },
  { title: 'QA regression pass', category: 'product', type: 'qa', effort: 5, assignee: 'Dev' },
  { title: 'Publish thought-leadership content', category: 'marketing', type: 'content', effort: 5, assignee: 'Marketing' },
  { title: 'Iterate on user feedback', category: 'product', type: 'frontend', effort: 8, assignee: 'Dev' }
]

const RISK_LABELS = {
  none: null,
  notready: { risk: 'Product not fully ready', mitigation: 'Add QA buffer sprint before launch' },
  pmf: { risk: 'Market fit unclear', mitigation: 'Validate with 10 beta users before scaling spend' },
  budget: { risk: 'Budget limits reach', mitigation: 'Prioritize highest-ROI channel first' }
}

function timelineWeeksFromKey(key) {
  return { w4: 4, w8: 8, w12: 12, w26: 26 }[key] ?? 8
}

function budgetFromKey(key) {
  return { b2k: 2000, b5k: 5000, b10k: 10000, b25k: 25000, b50k: 50000 }[key] ?? 5000
}

export function generateRoadmap(resources, product, priorities) {
  const weeks = timelineWeeksFromKey(resources?.timelineWeeks)
  const nbSprints = sprintCount(weeks)
  const capacity = sprintCapacity(resources?.teamSize)
  const risk = RISK_LABELS[priorities?.riskKnown]

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
        title: tmpl.title,
        assignee: tmpl.assignee,
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

export function generateMarketingStrategy(market, priorities, budgetKey) {
  const budget = budgetFromKey(budgetKey)
  const strategy = selectMarketingStrategy(market)
  const channels = allocateBudget(budget, strategy).map(ch => ({
    ...ch,
    goal: goalFor(ch.name, ch.budget),
    cadence: '3x/week',
    contentPillars: contentPillarsFor(ch.name)
  }))

  const contentCalendar = []
  for (let w = 1; w <= 4; w++) {
    channels.forEach(ch => {
      contentCalendar.push({ week: w, channel: ch.name, content: `${ch.name} post #${w}`, status: 'planned' })
    })
  }

  return {
    strategy: strategy.name,
    channels,
    contentCalendar,
    totalBudget: budget
  }
}

function goalFor(channel, budget) {
  const goals = {
    TikTok: `${Math.round(budget / 3)}k views`,
    YouTube: `${Math.round(budget / 5)} subscribers`,
    LinkedIn: `${Math.round(budget / 20)} leads`,
    Content: `${Math.round(budget / 200)} articles`,
    Paid: `${Math.round(budget / 15)} conversions`,
    Community: `${Math.round(budget / 10)} members`,
    Partnerships: `${Math.round(budget / 500)} partners`,
    Social: `${Math.round(budget / 20)} followers`
  }
  return goals[channel] || `Growth via ${channel}`
}

function contentPillarsFor(channel) {
  const pillars = {
    TikTok: ['Product demos', 'Behind the scenes', 'User stories'],
    LinkedIn: ['Thought leadership', 'Case studies', 'Product updates'],
    Content: ['SEO guides', 'Comparisons', 'Tutorials'],
    YouTube: ['Deep dives', 'Tutorials'],
    Paid: ['Retargeting', 'Lookalike audiences'],
    Community: ['Q&A', 'Feature requests'],
    Partnerships: ['Co-marketing', 'Integrations'],
    Social: ['Announcements', 'UGC']
  }
  return pillars[channel] || ['General content']
}

export function calculateKPIs(priorities, resources, market) {
  const focus = kpiFocus(priorities?.focus)
  const target = primaryTarget(market)
  const budget = budgetFromKey(resources?.budgetEur)

  return [
    { name: focus.primary.name, formula: focus.primary.formula, unit: focus.primary.unit, target, baseline: 0 },
    { name: focus.secondary.name, formula: focus.secondary.formula, unit: focus.secondary.unit, target: focus.secondary.name === 'CAC' ? Math.round(budget / target) : null, baseline: 0 },
    { name: focus.tertiary.name, formula: focus.tertiary.formula, unit: focus.tertiary.unit, target: null, baseline: 0 },
    { name: 'Content Pieces', formula: 'published articles + videos', unit: '#', target: 12, baseline: 0 }
  ]
}

export function generatePlan(formData) {
  const { product, market, resources, priorities, language } = formData
  const persona = generatePersona(market, product, priorities)
  const classification = classifyProduct(product, market)
  const roadmap = generateRoadmap(resources, product, priorities)
  const marketing = generateMarketingStrategy(market, priorities, resources.budgetEur)
  const kpis = calculateKPIs(priorities, resources, market)

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
