import { kpiFocus, primaryTarget } from '../engine'
import { c } from '../contentI18n'

const BUDGET = { b2k: 2000, b5k: 5000, b10k: 10000, b25k: 25000, b50k: 50000 }

export function calculateKPIs(priorities, resources, market, lang) {
  const dict = c(lang)
  const focus = kpiFocus(priorities?.focus, lang)
  const target = primaryTarget(market)
  const budget = BUDGET[resources?.budgetEur] ?? 5000

  return [
    { name: focus.primary.name, formula: focus.primary.formula, unit: focus.primary.unit, target, baseline: 0 },
    { name: focus.secondary.name, formula: focus.secondary.formula, unit: focus.secondary.unit, target: focus.secondary.name === 'CAC' ? Math.round(budget / target) : null, baseline: 0 },
    { name: focus.tertiary.name, formula: focus.tertiary.formula, unit: focus.tertiary.unit, target: null, baseline: 0 },
    { name: dict.contentPiecesKpi, formula: dict.contentPiecesFormula, unit: '#', target: 12, baseline: 0 }
  ]
}
