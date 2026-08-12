import { c } from './contentI18n'

export function classifyProduct(product, market) {
  const audienceSize = market?.audienceSize
  const stage = product?.stage
  if (stage === 'idea') return 'awareness'
  if (stage === 'prelaunch' && (audienceSize === 'xs' || audienceSize === 's')) {
    return 'awareness'
  }
  if (stage === 'mvp' || stage === 'beta') return 'acquisition'
  return 'growth'
}

export function classificationLabel(key, lang) {
  return c(lang).classification[key] || key
}

export function selectMarketingStrategy(market) {
  if (market?.b2bVsB2c === 'b2b' || market?.b2bVsB2c === 'b2g') {
    return {
      key: 'enterprise',
      allocation: { LinkedIn: 0.5, Content: 0.25, Partnerships: 0.15, Paid: 0.10 }
    }
  }

  const smallAudience = market?.audienceSize === 'xs' || market?.audienceSize === 's'
  if (smallAudience || market?.competition === 'high' || market?.competition === 'saturated') {
    return {
      key: 'viral',
      allocation: { TikTok: 0.6, YouTube: 0.2, Community: 0.2 }
    }
  }
  if (market?.competition === 'moderate' || market?.b2bVsB2c === 'b2b2c') {
    return {
      key: 'balanced',
      allocation: { TikTok: 0.4, LinkedIn: 0.3, Content: 0.2, Paid: 0.1 }
    }
  }
  return {
    key: 'content',
    allocation: { Content: 0.4, LinkedIn: 0.3, Social: 0.2, Paid: 0.1 }
  }
}

export function strategyLabel(key, lang) {
  return c(lang).strategyNames[key] || key
}

export function allocateBudget(budgetEur, strategy) {
  return Object.entries(strategy.allocation).map(([name, pct]) => ({
    name,
    budget: Math.round(budgetEur * pct),
    pct: Math.round(pct * 100)
  }))
}

const TEAM_MULTIPLIER = { solo: 1, small: 2.5, medium: 5, large: 8, xlarge: 12, xxlarge: 18 }
const BASE_CAPACITY = 8

export function sprintCapacity(teamSize) {
  const mult = TEAM_MULTIPLIER[teamSize] ?? 2.5
  return Math.round(BASE_CAPACITY * mult)
}

export function sprintCount(timelineWeeks) {
  return Math.max(1, Math.ceil(timelineWeeks / 2))
}

export function kpiFocus(priorityFocus, lang) {
  const focus = c(lang).kpiFocus
  if (priorityFocus === 'retain' || priorityFocus === 'churn') return focus.retain
  if (priorityFocus === 'monetize' || priorityFocus === 'fundraise') return focus.monetize
  return focus.acquire
}

const AUDIENCE_TARGET = { xs: 200, s: 500, m: 2000, l: 8000, xl: 20000 }

export function primaryTarget(market) {
  return AUDIENCE_TARGET[market?.audienceSize] ?? 500
}

// Réaffecte une story à un rôle présent dans l'équipe si son rôle prévu est absent.
const ASSIGNEE_ROLE = { Dev: 'dev', Marketing: 'marketing', Design: 'design', Product: 'product' }
const ROLE_FALLBACK = {
  Design: ['Dev', 'Product', 'Marketing'],
  Marketing: ['Product', 'Dev'],
  Dev: ['Product', 'Design'],
  Product: ['Dev', 'Marketing']
}

export function resolveAssignee(intended, rolesPresent) {
  if (!rolesPresent || rolesPresent.length === 0) return intended
  const roleKey = ASSIGNEE_ROLE[intended]
  if (!roleKey || rolesPresent.includes(roleKey)) return intended
  for (const fb of ROLE_FALLBACK[intended] || []) {
    if (rolesPresent.includes(ASSIGNEE_ROLE[fb])) return fb
  }
  return intended
}
