import { selectMarketingStrategy, allocateBudget } from '../engine'

const BUDGET = { b2k: 2000, b5k: 5000, b10k: 10000, b25k: 25000, b50k: 50000 }

export function generateMarketingStrategy(market, priorities, budgetKey) {
  const budget = BUDGET[budgetKey] ?? 5000
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

  return { strategy: strategy.name, channels, contentCalendar, totalBudget: budget }
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
