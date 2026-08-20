// Miroir de frontend/src/lib/budgetTiers.js — table partagée clé de tranche -> montant en
// euros, utilisée par les générateurs de repli (marketing, financials, KPIs).
export const BUDGET = { b500: 500, b1k: 1000, b2k: 2000, b5k: 5000, b10k: 10000, b25k: 25000, b50k: 50000, b100k: 100000 }

export function budgetFromKey(key) {
  return BUDGET[key] ?? 5000
}
