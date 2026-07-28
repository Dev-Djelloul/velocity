import { selectMarketingStrategy, strategyLabel, allocateBudget } from '../engine'
import { c } from '../contentI18n'

const BUDGET = { b2k: 2000, b5k: 5000, b10k: 10000, b25k: 25000, b50k: 50000 }

export function generateMarketingStrategy(market, priorities, budgetKey, lang) {
  const budget = BUDGET[budgetKey] ?? 5000
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

  return { strategy: strategyLabel(strategy.key, lang), channels, contentCalendar, totalBudget: budget }
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
