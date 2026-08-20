import { kpiFocus, primaryTarget } from '../engine'
import { c } from '../contentI18n'
import { budgetFromKey } from './budgetTiers'

export function calculateKPIs(priorities, resources, market, lang) {
  const dict = c(lang)
  const focus = kpiFocus(priorities?.focus, lang)
  const target = primaryTarget(market)
  // CAC cible = budget marketing / objectif d'acquisition — reste sur budgetEur (le total
  // du lancement n'est pas la bonne base pour un coût d'acquisition).
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

  return [
    primaryKpi,
    { name: focus.secondary.name, formula: focus.secondary.formula, unit: focus.secondary.unit, target: focus.secondary.name === 'CAC' ? Math.round(budget / target) : null, baseline: 0, timeframe: monthly },
    { name: focus.tertiary.name, formula: focus.tertiary.formula, unit: focus.tertiary.unit, target: null, baseline: 0, timeframe: weekly },
    { name: dict.contentPiecesKpi, formula: dict.contentPiecesFormula, unit: '#', target: contentTarget, baseline: 0, timeframe: weekly }
  ]
}
