import { fetchPlans, pushPlan, removePlan, createShare as serverCreateShare, resolveShare } from './serverStorage'

const SHARES_KEY = 'plp_plan_shares'

// Défini par App.jsx au login/logout — quand présent, chaque écriture locale est
// répliquée vers le stockage serveur (best-effort, fire-and-forget).
let activeUserId = null

export function setActiveUser(userId) {
  activeUserId = userId
}

// Clé scopée par utilisateur (même principe que creditTracker.js) — sans ça, tous
// les comptes qui se connectent sur ce même navigateur partagent la même liste de
// plans dans localStorage, et voient les plans des uns et des autres.
function plansKey(userId) {
  return `plp_saved_plans_${userId}`
}

export function savePlan(plan) {
  if (!activeUserId) return plan
  const plans = getAllPlans()
  const planWithMeta = {
    ...plan,
    id: plan.id || generateId(),
    savedAt: plan.savedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const existing = plans.findIndex(p => p.id === planWithMeta.id)
  if (existing >= 0) {
    plans[existing] = planWithMeta
  } else {
    plans.push(planWithMeta)
  }

  localStorage.setItem(plansKey(activeUserId), JSON.stringify(plans))
  pushPlan(activeUserId, planWithMeta)
  return planWithMeta
}

// Hydrate le cache local depuis le serveur (multi-appareil) — appelé au login.
// Écrase toujours le cache local (même si le serveur renvoie une liste vide) pour
// qu'un nouveau compte ne se retrouve jamais avec les plans d'un compte précédent.
export async function syncPlansFromServer(userId) {
  const serverPlans = await fetchPlans(userId)
  localStorage.setItem(plansKey(userId), JSON.stringify(serverPlans || []))
}

export function getAllPlans() {
  if (!activeUserId) return []
  try {
    const stored = localStorage.getItem(plansKey(activeUserId))
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
  if (!activeUserId) return
  const plans = getAllPlans()
  const filtered = plans.filter(p => p.id !== id)
  localStorage.setItem(plansKey(activeUserId), JSON.stringify(filtered))
  removePlan(activeUserId, id)
}

export async function createShareLink(planId) {
  // Un lien de partage n'a de sens que côté serveur (consultable depuis un autre
  // appareil/navigateur). Repli local si le backend est indisponible — le lien ne
  // fonctionnera alors que sur ce même navigateur.
  const server = await serverCreateShare(planId)
  if (server?.shareId) return server.shareId

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

export async function getShareLink(shareId) {
  const server = await resolveShare(shareId)
  if (server?.plan) return server

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
