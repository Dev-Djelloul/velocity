// Table partagée clé de tranche (questionnaire, ex. "w8") -> nombre de semaines. Même
// principe que budgetTiers.js : centralisée pour éviter la duplication qui existait entre
// extendedGenerator.js et le slider de délai de lancement (BudgetTimelineCard.jsx).
export const TIMELINE_WEEKS = { w2: 2, w4: 4, w8: 8, w12: 12, w16: 16, w26: 26, w36: 36, w52: 52 }

export function weeksFromKey(key) {
  return TIMELINE_WEEKS[key] ?? 8
}

// Tranches non linéaires (pas de simple seuil comme budgetTiers.budgetFromKey) : on prend
// la tranche dont le nombre de semaines est le plus proche de la valeur brute du slider.
export function weeksKeyFor(value) {
  let closestKey = 'w8'
  let closestDiff = Infinity
  for (const [key, weeks] of Object.entries(TIMELINE_WEEKS)) {
    const diff = Math.abs(weeks - value)
    if (diff < closestDiff) {
      closestDiff = diff
      closestKey = key
    }
  }
  return closestKey
}
