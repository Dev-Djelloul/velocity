export function classifyProduct(product, market) {
  const audienceSize = market?.audienceSize
  if (product?.stage === 'prelaunch' && (audienceSize === 'xs' || audienceSize === 's')) {
    return 'Awareness + Validation'
  }
  if (product?.stage === 'mvp') return 'Acquisition + Product-market fit'
  return 'Growth + Retention'
}

export function selectMarketingStrategy(market) {
  if (market?.b2bVsB2c === 'b2b') {
    return {
      name: 'Enterprise play',
      allocation: { LinkedIn: 0.5, Content: 0.25, Partnerships: 0.15, Paid: 0.10 }
    }
  }

  const smallAudience = market?.audienceSize === 'xs' || market?.audienceSize === 's'
  if (smallAudience || market?.competition === 'high') {
    return {
      name: 'Viral growth strategy',
      allocation: { TikTok: 0.6, YouTube: 0.2, Community: 0.2 }
    }
  }
  if (market?.competition === 'moderate') {
    return {
      name: 'Balanced',
      allocation: { TikTok: 0.4, LinkedIn: 0.3, Content: 0.2, Paid: 0.1 }
    }
  }
  return {
    name: 'Content-driven',
    allocation: { Content: 0.4, LinkedIn: 0.3, Social: 0.2, Paid: 0.1 }
  }
}

export function allocateBudget(budgetEur, strategy) {
  return Object.entries(strategy.allocation).map(([name, pct]) => ({
    name,
    budget: Math.round(budgetEur * pct),
    pct: Math.round(pct * 100)
  }))
}

const TEAM_MULTIPLIER = { solo: 1, small: 2.5, medium: 5, large: 8 }
const BASE_CAPACITY = 8

export function sprintCapacity(teamSize) {
  const mult = TEAM_MULTIPLIER[teamSize] ?? 2.5
  return Math.round(BASE_CAPACITY * mult)
}

export function sprintCount(timelineWeeks) {
  return Math.max(1, Math.ceil(timelineWeeks / 2))
}

export function kpiFocus(priorityFocus) {
  if (priorityFocus === 'retain') {
    return {
      primary: { name: 'DAU/MAU', formula: 'active_users_daily / active_users_monthly', unit: '%' },
      secondary: { name: 'Churn rate', formula: '(churned_users / total_users) × 100', unit: '%' },
      tertiary: { name: 'Engagement score', formula: 'weighted(sessions, actions, duration)', unit: 'pts' }
    }
  }
  if (priorityFocus === 'monetize') {
    return {
      primary: { name: 'ARR', formula: 'Σ(subscription_value × 12)', unit: '€' },
      secondary: { name: 'ARPU', formula: 'total_revenue / total_users', unit: '€' },
      tertiary: { name: 'Expansion rate', formula: 'upsell_revenue / base_revenue', unit: '%' }
    }
  }
  return {
    primary: { name: 'Total Signups', formula: 'Σ(signup_events)', unit: '#' },
    secondary: { name: 'CAC', formula: 'total_budget / total_signups', unit: '€/signup' },
    tertiary: { name: 'Conversion Rate', formula: '(signups / visitors) × 100', unit: '%' }
  }
}

const AUDIENCE_TARGET = { xs: 200, s: 500, m: 2000, l: 8000 }

export function primaryTarget(market) {
  return AUDIENCE_TARGET[market?.audienceSize] ?? 500
}
