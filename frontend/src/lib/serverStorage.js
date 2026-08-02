// Client HTTP vers les routes /plans, /drafts, /credits, /shares du Worker Cloudflare
// (backend/src/workers/api.js). Best-effort : si VITE_BACKEND_URL n'est pas configurée,
// ou si le réseau échoue, on se contente du localStorage local (voir planStorage.js /
// draftStorage.js / creditTracker.js qui appellent ces fonctions en fire-and-forget).
const BASE = import.meta.env.VITE_BACKEND_URL

export const isServerConfigured = !!BASE

async function safeFetch(path, options) {
  if (!BASE) return null
  try {
    const res = await fetch(`${BASE}${path}`, options)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export function fetchPlans(userId) {
  return safeFetch(`/plans?userId=${encodeURIComponent(userId)}`).then(r => r || [])
}

export function pushPlan(userId, plan) {
  return safeFetch('/plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, plan })
  })
}

export function removePlan(userId, id) {
  return safeFetch(`/plans/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' })
}

export function fetchDrafts(userId) {
  return safeFetch(`/drafts?userId=${encodeURIComponent(userId)}`).then(r => r || [])
}

export function pushDraft(userId, draft) {
  return safeFetch('/drafts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, draft })
  })
}

export function removeDraft(userId, id) {
  return safeFetch(`/drafts/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' })
}

export function fetchCredits(userId) {
  return safeFetch(`/credits?userId=${encodeURIComponent(userId)}`)
}

export function pushConsumeCredit(userId) {
  return safeFetch('/credits/consume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
}

export function createShare(planId) {
  return safeFetch('/shares', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId })
  })
}

export function resolveShare(shareId) {
  return safeFetch(`/shares/${encodeURIComponent(shareId)}`)
}

export function createCheckoutSession(userId, email) {
  return safeFetch('/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      email,
      successUrl: `${window.location.origin}${window.location.pathname}?upgraded=1`,
      cancelUrl: window.location.href
    })
  })
}
