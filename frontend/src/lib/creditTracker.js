// Compteur de crédits de génération — palier gratuit à 3 plans, illimité en Pro.
// Stocké par utilisateur (userId Clerk ou mock) pour ne pas mélanger les comptes.
export const FREE_PLAN_LIMIT = 3

function storageKey(userId) {
  return `plp_credits_${userId}`
}

function proKey(userId) {
  return `plp_pro_${userId}`
}

export function getUsedCredits(userId) {
  if (!userId) return 0
  return Number(localStorage.getItem(storageKey(userId)) || 0)
}

export function isPro(userId) {
  if (!userId) return false
  return localStorage.getItem(proKey(userId)) === 'true'
}

export function setPro(userId, value) {
  if (!userId) return
  localStorage.setItem(proKey(userId), value ? 'true' : 'false')
}

export function canGenerate(userId) {
  if (!userId) return false
  if (isPro(userId)) return true
  return getUsedCredits(userId) < FREE_PLAN_LIMIT
}

export function consumeCredit(userId) {
  if (!userId || isPro(userId)) return
  const used = getUsedCredits(userId)
  localStorage.setItem(storageKey(userId), String(used + 1))
}

export function remainingCredits(userId) {
  if (!userId) return 0
  if (isPro(userId)) return Infinity
  return Math.max(0, FREE_PLAN_LIMIT - getUsedCredits(userId))
}
