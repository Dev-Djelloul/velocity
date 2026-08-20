// Table partagée clé de tranche (questionnaire) -> montant en euros. Utilisée à la fois pour
// le budget marketing (resources.budgetEur) et le budget total du lancement
// (resources.totalBudget) — mêmes tranches, deux champs distincts. Centralisée ici pour éviter
// la duplication qui existait entre planGenerator.js et extendedGenerator.js.
export const BUDGET = { b500: 500, b1k: 1000, b2k: 2000, b5k: 5000, b10k: 10000, b25k: 25000, b50k: 50000, b100k: 100000 }

export function budgetFromKey(key) {
  return BUDGET[key] ?? 5000
}
