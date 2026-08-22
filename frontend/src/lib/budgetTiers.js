// Table partagée clé de tranche (questionnaire) -> montant en euros. Utilisée à la fois pour
// le budget marketing (resources.budgetEur) et le budget total du lancement
// (resources.totalBudget) — mêmes tranches, deux champs distincts. Centralisée ici pour éviter
// la duplication qui existait entre planGenerator.js et extendedGenerator.js.
export const BUDGET = { b500: 500, b1k: 1000, b2k: 2000, b5k: 5000, b10k: 10000, b25k: 25000, b50k: 50000, b100k: 100000 }

export function budgetFromKey(key) {
  return BUDGET[key] ?? 5000
}

// Un budget édité après génération (sliders Budget & Délai / Stratégie marketing) est
// désormais stocké tel quel, en euros — plus jamais rebucketé dans une tranche fixe
// (b500..b100k), dont le plafond à 100 000€ écrasait silencieusement tout montant saisi
// au-delà (retour utilisateur, capture à l'appui : 64 000€ ramenés à 50 000€). Les
// tranches restent utilisées uniquement pour les plans plus anciens ou jamais retouchés,
// où seule la clé de tranche du questionnaire est connue.
export function resolveBudgetAmount(value, fallback = 5000) {
  if (typeof value === 'number') return value
  return BUDGET[value] ?? fallback
}
