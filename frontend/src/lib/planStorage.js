const PLANS_KEY = 'plp_saved_plans'
const SHARES_KEY = 'plp_plan_shares'

export function savePlan(plan) {
  const plans = getAllPlans()
  const planWithMeta = {
    ...plan,
    id: plan.id || generateId(),
    savedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const existing = plans.findIndex(p => p.id === planWithMeta.id)
  if (existing >= 0) {
    plans[existing] = planWithMeta
  } else {
    plans.push(planWithMeta)
  }

  localStorage.setItem(PLANS_KEY, JSON.stringify(plans))
  return planWithMeta
}

export function getAllPlans() {
  try {
    const stored = localStorage.getItem(PLANS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function getPlanById(id) {
  const plans = getAllPlans()
  return plans.find(p => p.id === id)
}

export function deletePlan(id) {
  const plans = getAllPlans()
  const filtered = plans.filter(p => p.id !== id)
  localStorage.setItem(PLANS_KEY, JSON.stringify(filtered))
}

export function createShareLink(planId) {
  const shares = getShares()
  const shareId = generateId()
  const shareData = {
    id: shareId,
    planId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    accessCount: 0
  }
  shares.push(shareData)
  localStorage.setItem(SHARES_KEY, JSON.stringify(shares))
  return shareId
}

export function getShares() {
  try {
    const stored = localStorage.getItem(SHARES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function getShareLink(shareId) {
  const shares = getShares()
  const share = shares.find(s => s.id === shareId)
  if (!share) return null

  const expiry = new Date(share.expiresAt)
  if (expiry < new Date()) return null

  share.accessCount++
  localStorage.setItem(SHARES_KEY, JSON.stringify(shares))

  const plan = getPlanById(share.planId)
  return { share, plan }
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}
