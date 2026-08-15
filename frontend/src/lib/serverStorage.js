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

// teamId absent : plans personnels de userId. teamId fourni : plans partagés de cette
// équipe (visibles par tout membre) — voir backend/src/lib/db.js pour la logique de scope.
export function fetchPlans(userId, teamId) {
  const query = teamId ? `?userId=${encodeURIComponent(userId)}&teamId=${encodeURIComponent(teamId)}` : `?userId=${encodeURIComponent(userId)}`
  return safeFetch(`/plans${query}`).then(r => r || [])
}

export function pushPlan(userId, plan, teamId) {
  return safeFetch('/plans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, plan, teamId: teamId || null })
  })
}

// role : requis pour supprimer un plan d'équipe (seuls les admins peuvent), ignoré pour
// un plan personnel — voir la vérification côté backend/src/workers/api.js.
export function removePlan(userId, id, teamId, role) {
  const params = new URLSearchParams({ userId })
  if (teamId) { params.set('teamId', teamId); if (role) params.set('role', role) }
  return safeFetch(`/plans/${encodeURIComponent(id)}?${params.toString()}`, { method: 'DELETE' })
}

// role : requis pour déplacer un plan hors d'une équipe (seuls les admins peuvent), ignoré
// quand fromTeamId est absent (déplacement depuis le personnel) — voir backend/src/workers/api.js.
export function movePlan(userId, id, fromTeamId, toTeamId, role) {
  return safeFetch(`/plans/${encodeURIComponent(id)}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, fromTeamId: fromTeamId || null, toTeamId: toTeamId || null, role })
  })
}

// Polling léger de notifications (voir lib/notifications.js) : userId personnel + toutes
// les équipes dont l'utilisateur est membre, pour retrouver un commentaire posté depuis un
// autre appareil sans avoir à ouvrir cet espace localement au préalable.
export function fetchNotifications(userId, teamIds) {
  const query = `?userId=${encodeURIComponent(userId)}${teamIds?.length ? `&teamIds=${encodeURIComponent(teamIds.join(','))}` : ''}`
  return safeFetch(`/notifications${query}`).then(r => r || [])
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

export function generateTable(prompt, plan, lang) {
  return safeFetch('/generate-table', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, plan, lang })
  })
}

export function generateVeille(plan, lang) {
  return safeFetch('/generate-veille', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, lang })
  })
}

export function generateBenchmarks(plan, lang) {
  return safeFetch('/generate-benchmarks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, lang })
  })
}

export function generateEditorial(plan, lang) {
  return safeFetch('/generate-editorial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, lang })
  })
}

export function generateAdvertising(plan, lang) {
  return safeFetch('/generate-advertising', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, lang })
  })
}

export function generateRgpd(plan, lang) {
  return safeFetch('/generate-rgpd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, lang })
  })
}

export function notionStatus(userId) {
  return safeFetch(`/notion/status?userId=${encodeURIComponent(userId)}`)
}

export function notionAuthorizeUrl(userId) {
  return safeFetch(`/notion/authorize-url?userId=${encodeURIComponent(userId)}`)
}

export function notionExport(userId, plan, lang) {
  return safeFetch('/notion/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, plan, lang })
  })
}

export function notionSyncStories(userId, plan, lang) {
  return safeFetch('/notion/sync-stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, plan, lang })
  })
}

export function jiraStatus(userId) {
  return safeFetch(`/jira/status?userId=${encodeURIComponent(userId)}`)
}

export function jiraAuthorizeUrl(userId) {
  return safeFetch(`/jira/authorize-url?userId=${encodeURIComponent(userId)}`)
}

export function jiraProjects(userId) {
  return safeFetch(`/jira/projects?userId=${encodeURIComponent(userId)}`)
}

export function jiraSelect(userId, target) {
  return safeFetch('/jira/select', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...target })
  })
}

export function jiraDisconnect(userId) {
  return safeFetch('/jira/disconnect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
}

export function jiraExport(userId, plan, lang) {
  return safeFetch('/jira/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, plan, lang })
  })
}

export function githubStatus(userId) {
  return safeFetch(`/github/status?userId=${encodeURIComponent(userId)}`)
}

export function githubAuthorizeUrl(userId) {
  return safeFetch(`/github/authorize-url?userId=${encodeURIComponent(userId)}`)
}

export function githubRepos(userId) {
  return safeFetch(`/github/repos?userId=${encodeURIComponent(userId)}`)
}

export function githubSelect(userId, target) {
  return safeFetch('/github/select', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...target })
  })
}

export function githubDisconnect(userId) {
  return safeFetch('/github/disconnect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
}

export function githubExport(userId, plan, lang) {
  return safeFetch('/github/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, plan, lang })
  })
}

export function enqueueAgentTask(planId, userId, type, input) {
  return safeFetch('/agents/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, userId, type, input })
  })
}

export function fetchAgentTasks(planId) {
  return safeFetch(`/agents/tasks?planId=${encodeURIComponent(planId)}`).then(r => r || [])
}

export function removeAgentTask(userId, id) {
  return safeFetch(`/agents/tasks/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' })
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
