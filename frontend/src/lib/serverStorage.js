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

// Tous les plans de l'utilisateur, tous espaces confondus — pour "Historique de tous les
// plans" dans Mon compte (contrairement à fetchPlans, scopé à un seul espace à la fois).
export function fetchAllPlans(userId, teamIds) {
  const query = `?userId=${encodeURIComponent(userId)}${teamIds?.length ? `&teamIds=${encodeURIComponent(teamIds.join(','))}` : ''}`
  return safeFetch(`/plans/all${query}`).then(r => r || [])
}

// Bibliothèque de versions "avant/après" (voir PlanVersionsPage.jsx) : une entrée légère
// (sans le JSON complet) par instantané enregistré à chaque sauvegarde du plan — voir
// db.snapshotPlanVersion côté backend.
export function fetchPlanVersions(planId) {
  return safeFetch(`/plan-versions?planId=${encodeURIComponent(planId)}`).then(r => r || [])
}

export function fetchPlanVersion(versionId) {
  return safeFetch(`/plan-versions/${encodeURIComponent(versionId)}`)
}

// Recherche de photos Pexels pour la couverture d'un plan (voir CoverPicker.jsx) — proxy
// serveur, la clé API n'est jamais exposée au navigateur.
export function searchPexels(query, page = 1) {
  return safeFetch(`/pexels/search?query=${encodeURIComponent(query)}&page=${page}`)
}

// Conseil du jour du dashboard — généré par IA côté serveur, mis en cache 2h (voir
// /tip-of-the-day dans api.js). null si le backend n'est pas configuré ou injoignable ;
// DashboardHome.jsx retombe alors sur le texte statique de secours.
export function fetchDailyTip() {
  return safeFetch('/tip-of-the-day')
}

// Historique multi-fils du copilote Nova (voir CopilotChat.jsx) — un fil par conversation
// distincte, contrairement à l'ancien plan.copilotHistory qui n'en gardait qu'une seule.
export function fetchCopilotConversations(planId) {
  return safeFetch(`/copilot/conversations?planId=${encodeURIComponent(planId)}`).then(r => r || [])
}

export function fetchCopilotConversation(id) {
  return safeFetch(`/copilot/conversations/${encodeURIComponent(id)}`)
}

export function pushCopilotConversation(userId, planId, conversation) {
  return safeFetch('/copilot/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, planId, conversation })
  })
}

export function deleteCopilotConversation(userId, id) {
  return safeFetch(`/copilot/conversations/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' })
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

export function generateTable(prompt, plan, lang, userId) {
  return safeFetch('/generate-table', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, plan, lang, userId })
  })
}

export function notifyMentions(plan, comment, mentionedUserIds, lang, authorId) {
  return safeFetch('/comments/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, comment, mentionedUserIds, lang, authorId })
  })
}

export function listWebhooks(userId) {
  return safeFetch(`/webhooks?userId=${encodeURIComponent(userId)}`)
}

export function createWebhook(userId, url, events) {
  return safeFetch('/webhooks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, url, events })
  })
}

export function toggleWebhook(userId, id, enabled) {
  return safeFetch(`/webhooks/${encodeURIComponent(id)}/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, enabled })
  })
}

export function deleteWebhookRequest(userId, id) {
  return safeFetch(`/webhooks/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' })
}

export function copilotChat(plan, message, history, lang, userId) {
  return safeFetch('/copilot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, message, history, lang, userId })
  })
}

export function generateVeille(plan, lang, userId) {
  return safeFetch('/generate-veille', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, lang, userId })
  })
}

export function generateBenchmarks(plan, lang, userId) {
  return safeFetch('/generate-benchmarks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, lang, userId })
  })
}

export function generateEditorial(plan, lang, userId) {
  return safeFetch('/generate-editorial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, lang, userId })
  })
}

export function generateAdvertising(plan, lang, userId) {
  return safeFetch('/generate-advertising', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, lang, userId })
  })
}

export function generateRgpd(plan, lang, userId) {
  return safeFetch('/generate-rgpd', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, lang, userId })
  })
}

export function notionStatus(userId) {
  return safeFetch(`/notion/status?userId=${encodeURIComponent(userId)}`)
}

export function notionAuthorizeUrl(userId) {
  return safeFetch(`/notion/authorize-url?userId=${encodeURIComponent(userId)}`)
}

export function notionDisconnect(userId) {
  return safeFetch('/notion/disconnect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
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

export function linearStatus(userId) {
  return safeFetch(`/linear/status?userId=${encodeURIComponent(userId)}`)
}

export function linearConnect(userId, apiKey) {
  return safeFetch('/linear/connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, apiKey })
  })
}

export function linearTeams(userId) {
  return safeFetch(`/linear/teams?userId=${encodeURIComponent(userId)}`)
}

export function linearSelect(userId, target) {
  return safeFetch('/linear/select', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...target })
  })
}

export function linearDisconnect(userId) {
  return safeFetch('/linear/disconnect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
}

export function linearExport(userId, plan, lang) {
  return safeFetch('/linear/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, plan, lang })
  })
}

export function googleCalendarStatus(userId) {
  return safeFetch(`/google-calendar/status?userId=${encodeURIComponent(userId)}`)
}

export function googleCalendarAuthorizeUrl(userId) {
  return safeFetch(`/google-calendar/authorize-url?userId=${encodeURIComponent(userId)}`)
}

export function googleCalendarCalendars(userId) {
  return safeFetch(`/google-calendar/calendars?userId=${encodeURIComponent(userId)}`)
}

export function googleCalendarSelect(userId, target) {
  return safeFetch('/google-calendar/select', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...target })
  })
}

export function googleCalendarDisconnect(userId) {
  return safeFetch('/google-calendar/disconnect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
}

export function googleCalendarExport(userId, plan, lang) {
  return safeFetch('/google-calendar/export', {
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

export function fetchNotificationPrefs(userId) {
  return safeFetch(`/notifications/prefs?userId=${encodeURIComponent(userId)}`)
}

export function saveNotificationPrefs(userId, { email, agentDone, inactivityReminder, slackWebhookUrl, slackEnabled, veilleAutoRefresh, mentions }) {
  return safeFetch('/notifications/prefs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email, agentDone, inactivityReminder, slackWebhookUrl, slackEnabled, veilleAutoRefresh, mentions })
  })
}

export function enqueueAgentTask(planId, userId, type, input) {
  return safeFetch('/agents/enqueue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, userId, type, input })
  })
}

// Centre de notifications (cloche du header global) — distinct de fetchNotifications
// ci-dessus (notifications de commentaires calculées à la volée depuis les plans) et des
// préférences email/Slack (NotificationsSection) : un flux d'événements persistant en
// base, consultable même après coup.
export function fetchNotificationFeed(userId) {
  return safeFetch(`/notification-feed?userId=${encodeURIComponent(userId)}`).then(r => r || { items: [], unread: 0 })
}

export function markNotificationFeedRead(userId, id) {
  return safeFetch(`/notification-feed/${encodeURIComponent(id)}/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
}

export function markAllNotificationFeedRead(userId) {
  return safeFetch('/notification-feed/read-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
}

export function deleteAllNotificationFeed(userId) {
  return safeFetch(`/notification-feed?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' })
}

export function fetchAgentTasks(planId) {
  return safeFetch(`/agents/tasks?planId=${encodeURIComponent(planId)}`).then(r => r || [])
}

export function removeAgentTask(userId, id) {
  return safeFetch(`/agents/tasks/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' })
}

// Présence d'équipe (dashboard + menu de bascule d'espace) — heartbeat léger par polling,
// distinct de la présence par plan (WebSocket, voir lib/collab.js) qui n'a de sens que sur
// un plan précis ouvert.
export function sendTeamPresenceHeartbeat(teamId, userId, name, avatar) {
  return safeFetch('/team-presence/heartbeat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId, userId, name, avatar })
  })
}

export function fetchTeamPresence(teamId) {
  return safeFetch(`/team-presence?teamId=${encodeURIComponent(teamId)}`).then(r => r || [])
}

export function clearTeamPresence(teamId, userId) {
  return safeFetch(`/team-presence?teamId=${encodeURIComponent(teamId)}&userId=${encodeURIComponent(userId)}`, { method: 'DELETE' })
}

export function createCheckoutSession(userId, email, interval) {
  return safeFetch('/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      email,
      interval,
      successUrl: `${window.location.origin}${window.location.pathname}?upgraded=1`,
      cancelUrl: window.location.href
    })
  })
}
