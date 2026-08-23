// Accès D1 pour le stockage serveur des plans/brouillons/crédits par utilisateur.
//
// ⚠️ Le userId est actuellement fourni tel quel par le client (aucune clé secrète
// Clerk n'est encore configurée côté Worker pour vérifier le token de session).
// À durcir dès que CLERK_SECRET_KEY est disponible : vérifier le JWT Clerk et en
// extraire le userId côté serveur plutôt que de faire confiance au body de la requête.

function genId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 20)
}

// teamId présent : plans partagés de cette équipe (visibles par tout membre — pas de
// filtre sur user_id, l'appartenance à l'équipe suffit). teamId absent : uniquement les
// plans personnels de userId (team_id IS NULL), pour ne jamais mélanger les deux listes.
export async function listPlans(env, userId, teamId) {
  const query = teamId
    ? env.DB.prepare('SELECT id, data, created_at, updated_at FROM plans WHERE team_id = ? ORDER BY updated_at DESC').bind(teamId)
    : env.DB.prepare('SELECT id, data, created_at, updated_at FROM plans WHERE user_id = ? AND team_id IS NULL ORDER BY updated_at DESC').bind(userId)
  const { results } = await query.all()
  return results.map(row => ({ ...JSON.parse(row.data), id: row.id, savedAt: row.created_at, updatedAt: row.updated_at }))
}

// teamId n'est appliqué qu'à la création (id absent) : une fois un plan créé dans un
// espace, il y reste — changer d'équipe active avant un simple enregistrement ne doit
// jamais faire "migrer" un plan existant vers une autre équipe.
export async function upsertPlan(env, userId, plan, teamId) {
  const id = plan.id || genId()
  const isNew = !plan.id
  const now = new Date().toISOString()
  const effectiveTeamId = isNew ? (teamId || null) : (plan.team_id ?? null)
  await env.DB.prepare(
    `INSERT INTO plans (id, user_id, team_id, data, product_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data, product_name = excluded.product_name,
       updated_at = excluded.updated_at`
  ).bind(id, userId, effectiveTeamId, JSON.stringify({ ...plan, id, team_id: effectiveTeamId }), plan.product?.name || null, now, now).run()
  return { ...plan, id, team_id: effectiveTeamId, savedAt: now, updatedAt: now }
}

// Nombre de versions conservées par plan (voir migration 0019) — au-delà, les plus
// anciennes sont supprimées. Assez pour comparer plusieurs itérations d'un même lancement
// sans laisser le volume de plan_versions grossir indéfiniment sur un plan très actif.
const MAX_VERSIONS_PER_PLAN = 20

// Instantané complet du plan tel qu'il vient d'être enregistré — appelé juste après
// upsertPlan (voir la route POST /plans) plutôt qu'à l'intérieur, pour ne jamais faire
// échouer l'enregistrement lui-même si la capture de version rencontre un problème.
export async function snapshotPlanVersion(env, userId, planId, plan) {
  const id = genId()
  await env.DB.prepare(
    'INSERT INTO plan_versions (id, plan_id, user_id, data, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, planId, userId, JSON.stringify(plan), new Date().toISOString()).run()

  const { results } = await env.DB.prepare(
    'SELECT id FROM plan_versions WHERE plan_id = ? ORDER BY created_at DESC'
  ).bind(planId).all()
  const overflow = results.slice(MAX_VERSIONS_PER_PLAN)
  if (overflow.length) {
    const placeholders = overflow.map(() => '?').join(',')
    await env.DB.prepare(`DELETE FROM plan_versions WHERE id IN (${placeholders})`)
      .bind(...overflow.map(r => r.id)).run()
  }
}

// Liste légère (pas le JSON complet, potentiellement lourd) pour peupler les deux
// sélecteurs de la page de comparaison — product_name et un résumé de la roadmap servent à
// distinguer les versions entre elles sans tout charger.
export async function listPlanVersions(env, planId) {
  const { results } = await env.DB.prepare(
    'SELECT id, created_at, data FROM plan_versions WHERE plan_id = ? ORDER BY created_at DESC'
  ).bind(planId).all()
  return results.map(row => {
    const data = JSON.parse(row.data)
    return {
      id: row.id,
      createdAt: row.created_at,
      productName: data.product?.name || null,
      classification: data.classification || null,
      totalBudget: data.marketing?.totalBudget ?? null
    }
  })
}

export async function getPlanVersion(env, versionId) {
  const row = await env.DB.prepare('SELECT plan_id, data FROM plan_versions WHERE id = ?').bind(versionId).first()
  return row ? { planId: row.plan_id, data: JSON.parse(row.data) } : null
}

// Historique multi-fils du copilote Nova (voir migration 0020) — id fourni par le client
// (généré au premier message d'un nouveau fil, voir CopilotChat.jsx) pour pouvoir upsert la
// même ligne à chaque échange sans aller-retour supplémentaire pour connaître l'id créé.
export async function upsertCopilotConversation(env, userId, planId, conversation) {
  const now = new Date().toISOString()
  await env.DB.prepare(
    `INSERT INTO copilot_conversations (id, plan_id, user_id, title, messages, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET title = excluded.title, messages = excluded.messages, updated_at = excluded.updated_at`
  ).bind(conversation.id, planId, userId, conversation.title || null, JSON.stringify(conversation.messages || []), now, now).run()
  return { id: conversation.id, updatedAt: now }
}

// Liste légère (pas les messages complets) pour peupler le panneau d'historique — titre et
// date de dernière activité suffisent à identifier un fil avant de l'ouvrir.
export async function listCopilotConversations(env, planId) {
  const { results } = await env.DB.prepare(
    'SELECT id, title, created_at, updated_at FROM copilot_conversations WHERE plan_id = ? ORDER BY updated_at DESC'
  ).bind(planId).all()
  return results.map(row => ({ id: row.id, title: row.title, createdAt: row.created_at, updatedAt: row.updated_at }))
}

export async function getCopilotConversation(env, id) {
  const row = await env.DB.prepare('SELECT plan_id, title, messages FROM copilot_conversations WHERE id = ?').bind(id).first()
  return row ? { planId: row.plan_id, title: row.title, messages: JSON.parse(row.messages) } : null
}

export async function deleteCopilotConversation(env, userId, id) {
  await env.DB.prepare('DELETE FROM copilot_conversations WHERE id = ? AND user_id = ?').bind(id, userId).run()
}

// Tous les plans accessibles à userId, tous espaces confondus (personnel + chaque équipe
// listée dans teamIds) — utilisé par "Historique de tous les plans" dans Mon compte, qui
// regroupe volontairement tout au même endroit (contrairement aux tableaux de bord
// d'espace, eux scopés à un seul espace à la fois).
export async function getAllPlansForUser(env, userId, teamIds = []) {
  const clauses = ['(user_id = ? AND team_id IS NULL)']
  const binds = [userId]
  if (teamIds.length) {
    clauses.push(`team_id IN (${teamIds.map(() => '?').join(',')})`)
    binds.push(...teamIds)
  }
  const { results } = await env.DB.prepare(
    `SELECT id, data, created_at, updated_at FROM plans WHERE ${clauses.join(' OR ')} ORDER BY updated_at DESC`
  ).bind(...binds).all()
  return results.map(row => ({ ...JSON.parse(row.data), id: row.id, savedAt: row.created_at, updatedAt: row.updated_at }))
}

// Agrège les commentaires de tous les plans accessibles à userId (son espace personnel +
// chaque équipe listée dans teamIds) — support du polling léger de notifications
// (fetchNotifications côté client). LIMIT 100 plans scannés : largement suffisant à cette
// échelle, à revoir si le nombre de plans par utilisateur grossit significativement.
export async function getRecentComments(env, userId, teamIds = []) {
  const clauses = ['(user_id = ? AND team_id IS NULL)']
  const binds = [userId]
  if (teamIds.length) {
    clauses.push(`team_id IN (${teamIds.map(() => '?').join(',')})`)
    binds.push(...teamIds)
  }
  const { results } = await env.DB.prepare(
    `SELECT id, team_id, data FROM plans WHERE ${clauses.join(' OR ')} ORDER BY updated_at DESC LIMIT 100`
  ).bind(...binds).all()

  const comments = []
  for (const row of results) {
    let plan
    try {
      plan = JSON.parse(row.data)
    } catch {
      continue
    }
    for (const comment of (plan.comments || [])) {
      comments.push({
        ...comment,
        planId: row.id,
        planName: plan.product?.name || null,
        spaceId: row.team_id,
        spaceName: plan.createdSpaceId === row.team_id ? plan.createdSpaceName : null
      })
    }
  }
  comments.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  return comments.slice(0, 30)
}

// Un plan personnel ne peut être supprimé que par son propriétaire (user_id). Un plan
// d'équipe peut l'être par n'importe quel membre actuel de l'équipe (team_id) — la
// vérification de rôle plus fine (ex: réserver aux admins) se fait côté route API, qui
// reçoit le rôle envoyé par le client (même modèle de confiance que le reste de l'app,
// voir la note en tête de fichier sur l'absence de vérification JWT serveur).
// Renvoie le nombre de lignes réellement supprimées de `plans` — un appelant scopé sur le
// mauvais espace (ex. teamId ne correspondant pas à celui du plan) ne matchait jusqu'ici
// aucune ligne mais recevait quand même {ok:true} côté route, un échec invisible identique
// à celui d'un rejet 403 mais sans jamais le signaler (retour utilisateur : suppression
// "réussie" dans l'UI, plan toujours présent partout ailleurs).
export async function deletePlan(env, userId, id, teamId) {
  let changes = 0
  if (teamId) {
    const result = await env.DB.prepare('DELETE FROM plans WHERE id = ? AND team_id = ?').bind(id, teamId).run()
    changes = result.meta?.changes || 0
  } else {
    const result = await env.DB.prepare('DELETE FROM plans WHERE id = ? AND user_id = ? AND team_id IS NULL').bind(id, userId).run()
    changes = result.meta?.changes || 0
  }
  // plan_versions et copilot_conversations n'ont pas de contrainte FK (D1/SQLite) —
  // nettoyage explicite pour ne pas laisser d'instantanés/fils orphelins d'un plan supprimé.
  await env.DB.prepare('DELETE FROM plan_versions WHERE plan_id = ?').bind(id).run()
  await env.DB.prepare('DELETE FROM copilot_conversations WHERE plan_id = ?').bind(id).run()
  return changes > 0
}

// Déplace un plan existant vers un autre espace (personnel <-> équipe, ou équipe <-> équipe).
// fromTeamId doit correspondre à l'espace actuel du plan (vérifié par le WHERE) : un plan
// personnel ne peut être déplacé que par son propriétaire, un plan d'équipe que par un membre
// de cette équipe (la restriction "admin uniquement" pour en sortir est appliquée côté route,
// comme pour deletePlan). Retourne null si le plan n'existe pas dans l'espace source attendu.
export async function movePlan(env, userId, id, fromTeamId, toTeamId) {
  const row = fromTeamId
    ? await env.DB.prepare('SELECT data FROM plans WHERE id = ? AND team_id = ?').bind(id, fromTeamId).first()
    : await env.DB.prepare('SELECT data FROM plans WHERE id = ? AND user_id = ? AND team_id IS NULL').bind(id, userId).first()
  if (!row) return null
  const now = new Date().toISOString()
  const effectiveTeamId = toTeamId || null
  const data = { ...JSON.parse(row.data), team_id: effectiveTeamId }
  await env.DB.prepare('UPDATE plans SET team_id = ?, data = ?, updated_at = ? WHERE id = ?')
    .bind(effectiveTeamId, JSON.stringify(data), now, id).run()
  return { ...data, updatedAt: now }
}

export async function getPlan(env, id) {
  const row = await env.DB.prepare('SELECT data FROM plans WHERE id = ?').bind(id).first()
  return row ? JSON.parse(row.data) : null
}

// user_id est une colonne séparée du blob JSON `data` (voir upsertPlan) — nécessaire pour
// attribuer une notification "quelqu'un a édité votre plan" au bon propriétaire sans
// avoir à supposer qu'un champ userId existe dans le JSON lui-même (ce n'est pas le cas).
export async function getPlanOwnerId(env, id) {
  const row = await env.DB.prepare('SELECT user_id FROM plans WHERE id = ?').bind(id).first()
  return row?.user_id || null
}

export async function getPlanOwnerAndTeam(env, id) {
  const row = await env.DB.prepare('SELECT user_id, team_id FROM plans WHERE id = ?').bind(id).first()
  return row ? { userId: row.user_id, teamId: row.team_id || null } : { userId: null, teamId: null }
}

export async function listDrafts(env, userId) {
  const { results } = await env.DB.prepare(
    'SELECT id, name, data, created_at, updated_at FROM drafts WHERE user_id = ? ORDER BY updated_at DESC'
  ).bind(userId).all()
  return results.map(row => ({ id: row.id, name: row.name, data: JSON.parse(row.data), savedAt: row.created_at, updatedAt: row.updated_at }))
}

export async function upsertDraft(env, userId, draft) {
  const id = draft.id || genId()
  const now = new Date().toISOString()
  await env.DB.prepare(
    `INSERT INTO drafts (id, user_id, name, data, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, data = excluded.data, updated_at = excluded.updated_at`
  ).bind(id, userId, draft.name || null, JSON.stringify(draft.data), now, now).run()
  return { id, name: draft.name, data: draft.data, savedAt: now, updatedAt: now }
}

export async function deleteDraft(env, userId, id) {
  await env.DB.prepare('DELETE FROM drafts WHERE id = ? AND user_id = ?').bind(id, userId).run()
}

export async function createShare(env, planId) {
  const id = genId()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  await env.DB.prepare(
    'INSERT INTO shares (id, plan_id, expires_at) VALUES (?, ?, ?)'
  ).bind(id, planId, expiresAt).run()
  return id
}

export async function resolveShare(env, shareId) {
  const share = await env.DB.prepare('SELECT * FROM shares WHERE id = ?').bind(shareId).first()
  if (!share) return null
  if (new Date(share.expires_at) < new Date()) return null
  await env.DB.prepare('UPDATE shares SET access_count = access_count + 1 WHERE id = ?').bind(shareId).run()
  const plan = await getPlan(env, share.plan_id)
  return plan ? { plan, share } : null
}

export async function getCredits(env, userId) {
  const row = await env.DB.prepare('SELECT used, is_pro FROM credits WHERE user_id = ?').bind(userId).first()
  return row ? { used: row.used, isPro: !!row.is_pro } : { used: 0, isPro: false }
}

export async function consumeCredit(env, userId) {
  await env.DB.prepare(
    `INSERT INTO credits (user_id, used, updated_at) VALUES (?, 1, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET used = used + 1, updated_at = datetime('now')`
  ).bind(userId).run()
}

export async function findUserIdByStripeCustomer(env, stripeCustomerId) {
  const row = await env.DB.prepare('SELECT user_id FROM credits WHERE stripe_customer_id = ?').bind(stripeCustomerId).first()
  return row?.user_id ?? null
}

export async function createAgentTask(env, { id, planId, userId, type, input }) {
  await env.DB.prepare(
    `INSERT INTO agent_tasks (id, plan_id, user_id, type, status, input, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'queued', ?, datetime('now'), datetime('now'))`
  ).bind(id, planId, userId, type, JSON.stringify(input)).run()
}

export async function updateAgentTask(env, id, { status, output, error, attempts }) {
  await env.DB.prepare(
    `UPDATE agent_tasks
     SET status = ?, output = ?, error = ?, attempts = ?, updated_at = datetime('now')
     WHERE id = ?`
  ).bind(
    status,
    output !== undefined ? JSON.stringify(output) : null,
    error ?? null,
    attempts ?? 0,
    id
  ).run()
}

export async function getAgentTask(env, id) {
  const row = await env.DB.prepare('SELECT * FROM agent_tasks WHERE id = ?').bind(id).first()
  if (!row) return null
  return {
    id: row.id,
    planId: row.plan_id,
    userId: row.user_id,
    type: row.type,
    status: row.status,
    input: JSON.parse(row.input),
    output: row.output ? JSON.parse(row.output) : null,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export async function listAgentTasksForPlan(env, planId) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM agent_tasks WHERE plan_id = ? ORDER BY created_at DESC LIMIT 50'
  ).bind(planId).all()
  return results.map(row => ({
    id: row.id,
    planId: row.plan_id,
    userId: row.user_id,
    type: row.type,
    status: row.status,
    input: JSON.parse(row.input),
    output: row.output ? JSON.parse(row.output) : null,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }))
}

// userId requis et vérifié par l'appelant (route API) pour qu'un utilisateur ne puisse
// supprimer que ses propres tâches, jamais celles d'un autre plan/compte.
export async function deleteAgentTask(env, userId, id) {
  const result = await env.DB.prepare(
    'DELETE FROM agent_tasks WHERE id = ? AND user_id = ?'
  ).bind(id, userId).run()
  return result.meta.changes > 0
}

export async function setPro(env, userId, isPro, stripeCustomerId) {
  await env.DB.prepare(
    `INSERT INTO credits (user_id, is_pro, stripe_customer_id, updated_at) VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET is_pro = excluded.is_pro, stripe_customer_id = excluded.stripe_customer_id, updated_at = datetime('now')`
  ).bind(userId, isPro ? 1 : 0, stripeCustomerId || null).run()
}

// --- Jetons OAuth Notion ---

export async function saveNotionToken(env, userId, { accessToken, workspaceName, workspaceId, botId }) {
  await env.DB.prepare(
    `INSERT INTO notion_tokens (user_id, access_token, workspace_name, workspace_id, bot_id, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET access_token = excluded.access_token, workspace_name = excluded.workspace_name,
       workspace_id = excluded.workspace_id, bot_id = excluded.bot_id, created_at = datetime('now')`
  ).bind(userId, accessToken, workspaceName || null, workspaceId || null, botId || null).run()
}

export async function getNotionToken(env, userId) {
  return env.DB.prepare('SELECT access_token, workspace_name FROM notion_tokens WHERE user_id = ?').bind(userId).first()
}

export async function deleteNotionToken(env, userId) {
  await env.DB.prepare('DELETE FROM notion_tokens WHERE user_id = ?').bind(userId).run()
}

// --- Jetons OAuth Jira/Atlassian ---

// Écrit/écrase le token après OAuth (cloud/projet non encore choisis à ce stade).
export async function saveJiraToken(env, userId, { accessToken, refreshToken, expiresAt }) {
  await env.DB.prepare(
    `INSERT INTO jira_tokens (user_id, access_token, refresh_token, expires_at, created_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET access_token = excluded.access_token,
       refresh_token = excluded.refresh_token, expires_at = excluded.expires_at, created_at = datetime('now')`
  ).bind(userId, accessToken, refreshToken, expiresAt).run()
}

// Met à jour uniquement les tokens (après un refresh), sans toucher au site/projet choisi.
export async function updateJiraTokens(env, userId, { accessToken, refreshToken, expiresAt }) {
  await env.DB.prepare(
    'UPDATE jira_tokens SET access_token = ?, refresh_token = ?, expires_at = ? WHERE user_id = ?'
  ).bind(accessToken, refreshToken, expiresAt, userId).run()
}

// Mémorise le site + projet Jira sélectionnés par l'utilisateur.
export async function setJiraTarget(env, userId, { cloudId, siteUrl, siteName, projectKey, projectName }) {
  await env.DB.prepare(
    `UPDATE jira_tokens SET cloud_id = ?, site_url = ?, site_name = ?, project_key = ?, project_name = ? WHERE user_id = ?`
  ).bind(cloudId || null, siteUrl || null, siteName || null, projectKey || null, projectName || null, userId).run()
}

export async function getJiraToken(env, userId) {
  return env.DB.prepare('SELECT * FROM jira_tokens WHERE user_id = ?').bind(userId).first()
}

export async function deleteJiraToken(env, userId) {
  await env.DB.prepare('DELETE FROM jira_tokens WHERE user_id = ?').bind(userId).run()
}

// --- Jetons OAuth GitHub ---

export async function saveGithubToken(env, userId, accessToken) {
  await env.DB.prepare(
    `INSERT INTO github_tokens (user_id, access_token, created_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET access_token = excluded.access_token, created_at = datetime('now')`
  ).bind(userId, accessToken).run()
}

// Mémorise le dépôt GitHub sélectionné par l'utilisateur.
export async function setGithubTarget(env, userId, { owner, repo, repoFullName }) {
  await env.DB.prepare(
    'UPDATE github_tokens SET owner = ?, repo = ?, repo_full_name = ? WHERE user_id = ?'
  ).bind(owner || null, repo || null, repoFullName || null, userId).run()
}

export async function getGithubToken(env, userId) {
  return env.DB.prepare('SELECT * FROM github_tokens WHERE user_id = ?').bind(userId).first()
}

export async function deleteGithubToken(env, userId) {
  await env.DB.prepare('DELETE FROM github_tokens WHERE user_id = ?').bind(userId).run()
}

// --- Clé API Linear ---

export async function saveLinearToken(env, userId, apiKey) {
  await env.DB.prepare(
    `INSERT INTO linear_tokens (user_id, api_key, created_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET api_key = excluded.api_key, created_at = datetime('now')`
  ).bind(userId, apiKey).run()
}

// Mémorise l'équipe Linear sélectionnée par l'utilisateur.
export async function setLinearTarget(env, userId, { teamId, teamKey, teamName }) {
  await env.DB.prepare(
    'UPDATE linear_tokens SET team_id = ?, team_key = ?, team_name = ? WHERE user_id = ?'
  ).bind(teamId || null, teamKey || null, teamName || null, userId).run()
}

export async function getLinearToken(env, userId) {
  return env.DB.prepare('SELECT * FROM linear_tokens WHERE user_id = ?').bind(userId).first()
}

export async function deleteLinearToken(env, userId) {
  await env.DB.prepare('DELETE FROM linear_tokens WHERE user_id = ?').bind(userId).run()
}

// --- Jetons OAuth Google Calendar ---

export async function saveGoogleCalendarToken(env, userId, { accessToken, refreshToken, expiresAt }) {
  await env.DB.prepare(
    `INSERT INTO google_calendar_tokens (user_id, access_token, refresh_token, expires_at, created_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET access_token = excluded.access_token,
       refresh_token = excluded.refresh_token, expires_at = excluded.expires_at, created_at = datetime('now')`
  ).bind(userId, accessToken, refreshToken, expiresAt).run()
}

export async function updateGoogleCalendarTokens(env, userId, { accessToken, expiresAt }) {
  await env.DB.prepare(
    'UPDATE google_calendar_tokens SET access_token = ?, expires_at = ? WHERE user_id = ?'
  ).bind(accessToken, expiresAt, userId).run()
}

// Mémorise le calendrier Google sélectionné par l'utilisateur.
export async function setGoogleCalendarTarget(env, userId, { calendarId, calendarName }) {
  await env.DB.prepare(
    'UPDATE google_calendar_tokens SET calendar_id = ?, calendar_name = ? WHERE user_id = ?'
  ).bind(calendarId || null, calendarName || null, userId).run()
}

export async function getGoogleCalendarToken(env, userId) {
  return env.DB.prepare('SELECT * FROM google_calendar_tokens WHERE user_id = ?').bind(userId).first()
}

export async function deleteGoogleCalendarToken(env, userId) {
  await env.DB.prepare('DELETE FROM google_calendar_tokens WHERE user_id = ?').bind(userId).run()
}

// --- Webhooks sortants ---

export async function listWebhooks(env, userId) {
  const { results } = await env.DB.prepare('SELECT * FROM webhooks WHERE user_id = ? ORDER BY created_at DESC').bind(userId).all()
  return results.map(r => ({ ...r, events: JSON.parse(r.events || '[]'), enabled: !!r.enabled }))
}

export async function createWebhook(env, userId, { url, events, secret }) {
  const id = genId()
  await env.DB.prepare(
    `INSERT INTO webhooks (id, user_id, url, events, secret, enabled, created_at)
     VALUES (?, ?, ?, ?, ?, 1, datetime('now'))`
  ).bind(id, userId, url, JSON.stringify(events || []), secret).run()
  return { id, userId, url, events: events || [], enabled: true }
}

export async function updateWebhookEnabled(env, userId, id, enabled) {
  await env.DB.prepare('UPDATE webhooks SET enabled = ? WHERE id = ? AND user_id = ?').bind(enabled ? 1 : 0, id, userId).run()
}

export async function deleteWebhook(env, userId, id) {
  await env.DB.prepare('DELETE FROM webhooks WHERE id = ? AND user_id = ?').bind(id, userId).run()
}

// Webhooks actifs d'un utilisateur souscrits à un événement donné — filtré en JS après
// lecture (peu de lignes par utilisateur, pas besoin d'indexer le JSON events en SQL).
export async function getWebhooksForEvent(env, userId, eventType) {
  const all = await listWebhooks(env, userId)
  return all.filter(w => w.enabled && w.events.includes(eventType))
}

// --- Centre de notifications (flux persistant dans l'app, cloche du header — distinct
// des préférences email/Slack ci-dessous, qui ne concernent que l'envoi externe) ---

// teamId : espace (Clerk Organization) du plan concerné, ou null pour un plan personnel —
// nécessaire pour que le clic sur la notification puisse y basculer avant d'ouvrir le plan
// (voir handleOpenNotification côté frontend, App.jsx), sinon on ne trouve pas le plan
// dans le cache local (getAllPlans() est scopé à l'espace actif).
export async function createNotification(env, { userId, type, title, detail, planId, teamId }) {
  if (!userId) return null
  const id = genId()
  await env.DB.prepare(
    `INSERT INTO notification_feed (id, user_id, type, title, detail, plan_id, team_id, read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))`
  ).bind(id, userId, type, title, detail || null, planId || null, teamId || null).run()
  return { id, userId, type, title, detail: detail || null, planId: planId || null, teamId: teamId || null, read: false }
}

// SQLite's datetime('now') renvoie "YYYY-MM-DD HH:MM:SS" en UTC mais SANS suffixe "Z" —
// new Date(...) côté client traite alors cette chaîne comme une heure LOCALE (pas UTC),
// d'où le décalage observé (ex: 05:26 affiché au lieu de 07:26 pour un fuseau UTC+2).
// Convertie ici en ISO 8601 non ambigu avant de quitter le serveur.
function toIsoUtc(sqliteDatetime) {
  return sqliteDatetime ? sqliteDatetime.replace(' ', 'T') + 'Z' : sqliteDatetime
}

export async function listNotifications(env, userId, limit = 30) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM notification_feed WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
  ).bind(userId, limit).all()
  return results.map(r => ({ id: r.id, type: r.type, title: r.title, detail: r.detail, planId: r.plan_id, spaceId: r.team_id, read: !!r.read, createdAt: toIsoUtc(r.created_at) }))
}

export async function countUnreadNotifications(env, userId) {
  const row = await env.DB.prepare('SELECT COUNT(*) as n FROM notification_feed WHERE user_id = ? AND read = 0').bind(userId).first()
  return row?.n || 0
}

export async function markNotificationRead(env, userId, id) {
  await env.DB.prepare('UPDATE notification_feed SET read = 1 WHERE id = ? AND user_id = ?').bind(id, userId).run()
}

export async function markAllNotificationsRead(env, userId) {
  await env.DB.prepare('UPDATE notification_feed SET read = 1 WHERE user_id = ? AND read = 0').bind(userId).run()
}

export async function deleteAllNotifications(env, userId) {
  await env.DB.prepare('DELETE FROM notification_feed WHERE user_id = ?').bind(userId).run()
}

// --- Présence d'équipe (dashboard + menu de bascule d'espace, voir migration 0018) ---

const TEAM_PRESENCE_WINDOW_SECONDS = 40

export async function heartbeatTeamPresence(env, { teamId, userId, name, avatar }) {
  if (!teamId || !userId) return
  await env.DB.prepare(
    `INSERT INTO team_presence (team_id, user_id, name, avatar, last_seen)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(team_id, user_id) DO UPDATE SET name = excluded.name, avatar = excluded.avatar, last_seen = excluded.last_seen`
  ).bind(teamId, userId, name || null, avatar || null).run()
}

export async function clearTeamPresence(env, teamId, userId) {
  if (!teamId || !userId) return
  await env.DB.prepare('DELETE FROM team_presence WHERE team_id = ? AND user_id = ?').bind(teamId, userId).run()
}

// Fenêtre glissante plutôt qu'un simple flag "en ligne" : pas d'événement de déconnexion
// fiable pour un onglet fermé brutalement (crash, perte réseau) — une entrée trop vieille
// est juste ignorée, sans jamais avoir besoin d'être nettoyée activement.
export async function listTeamPresence(env, teamId) {
  const { results } = await env.DB.prepare(
    `SELECT user_id, name, avatar FROM team_presence
     WHERE team_id = ? AND last_seen >= datetime('now', '-${TEAM_PRESENCE_WINDOW_SECONDS} seconds')`
  ).bind(teamId).all()
  return results.map(r => ({ userId: r.user_id, name: r.name, avatar: r.avatar }))
}

// --- Préférences de notification par email ---

export async function getNotificationPrefs(env, userId) {
  return env.DB.prepare('SELECT * FROM notification_prefs WHERE user_id = ?').bind(userId).first()
}

// Merge partiel avec la ligne existante : un appelant qui ne touche qu'au toggle email
// (ex: NotificationsSection) ne doit jamais effacer un webhook Slack déjà enregistré, et
// inversement — chaque champ omis (undefined) conserve sa valeur actuelle en base.
export async function setNotificationPrefs(env, userId, patch) {
  const existing = await getNotificationPrefs(env, userId)
  const next = {
    email: patch.email !== undefined ? patch.email : existing?.email,
    agentDone: patch.agentDone !== undefined ? patch.agentDone : !!existing?.agent_done,
    inactivityReminder: patch.inactivityReminder !== undefined ? patch.inactivityReminder : !!existing?.inactivity_reminder,
    slackWebhookUrl: patch.slackWebhookUrl !== undefined ? patch.slackWebhookUrl : existing?.slack_webhook_url,
    slackEnabled: patch.slackEnabled !== undefined ? patch.slackEnabled : !!existing?.slack_enabled,
    veilleAutoRefresh: patch.veilleAutoRefresh !== undefined ? patch.veilleAutoRefresh : !!existing?.veille_auto_refresh,
    mentions: patch.mentions !== undefined ? patch.mentions : (existing ? !!existing.mentions : true),
    weeklyDigest: patch.weeklyDigest !== undefined ? patch.weeklyDigest : !!existing?.weekly_digest
  }
  await env.DB.prepare(
    `INSERT INTO notification_prefs (user_id, email, agent_done, inactivity_reminder, slack_webhook_url, slack_enabled, veille_auto_refresh, mentions, weekly_digest, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET email = excluded.email, agent_done = excluded.agent_done,
       inactivity_reminder = excluded.inactivity_reminder, slack_webhook_url = excluded.slack_webhook_url,
       slack_enabled = excluded.slack_enabled, veille_auto_refresh = excluded.veille_auto_refresh,
       mentions = excluded.mentions, weekly_digest = excluded.weekly_digest, updated_at = datetime('now')`
  ).bind(userId, next.email || null, next.agentDone ? 1 : 0, next.inactivityReminder ? 1 : 0, next.slackWebhookUrl || null, next.slackEnabled ? 1 : 0, next.veilleAutoRefresh ? 1 : 0, next.mentions ? 1 : 0, next.weeklyDigest ? 1 : 0).run()
}

// Plans dont le propriétaire a activé le rafraîchissement hebdomadaire de la veille —
// filtré uniquement sur la préférence utilisateur ici ; c'est le job (generate.js) qui
// vérifie ensuite, plan par plan, que la veille existe déjà (pas de sens à en générer
// une toute neuve en tâche de fond, sans que l'utilisateur l'ait demandée une 1ère fois).
export async function getPlansForVeilleRefresh(env) {
  const res = await env.DB.prepare(
    `SELECT p.id, p.user_id
     FROM plans p
     JOIN notification_prefs n ON n.user_id = p.user_id
     WHERE n.veille_auto_refresh = 1`
  ).all()
  return res.results || []
}

// Remplace uniquement le champ "veille" d'un plan existant, sans toucher au reste —
// utilisé par le rafraîchissement hebdomadaire automatique (tâche de fond, pas une
// sauvegarde utilisateur classique donc pas d'appel à upsertPlan). updated_at n'est
// délibérément PAS touché : un refresh automatique ne doit pas faire paraître un plan
// "actif" et ainsi masquer le rappel d'inactivité (getPlansNeedingInactivityReminder).
export async function updatePlanVeille(env, planId, veille) {
  const row = await env.DB.prepare('SELECT data FROM plans WHERE id = ?').bind(planId).first()
  if (!row) return
  const data = { ...JSON.parse(row.data), veille }
  await env.DB.prepare('UPDATE plans SET data = ? WHERE id = ?').bind(JSON.stringify(data), planId).run()
}

// Plans inactifs depuis >= 14 jours, dont le propriétaire a activé le rappel et dont on
// n'a pas déjà envoyé un rappel pour cette période d'inactivité (reminder_sent_at plus
// récent que updated_at => déjà notifié depuis la dernière modification).
export async function getPlansNeedingInactivityReminder(env) {
  const res = await env.DB.prepare(
    `SELECT p.id, p.user_id, p.product_name, p.updated_at, n.email, n.slack_webhook_url, n.slack_enabled
     FROM plans p
     JOIN notification_prefs n ON n.user_id = p.user_id
     WHERE n.inactivity_reminder = 1
       AND (n.email IS NOT NULL OR (n.slack_enabled = 1 AND n.slack_webhook_url IS NOT NULL))
       AND p.updated_at <= datetime('now', '-14 days')
       AND (p.reminder_sent_at IS NULL OR p.reminder_sent_at < p.updated_at)`
  ).all()
  return res.results || []
}

export async function markReminderSent(env, planId) {
  await env.DB.prepare("UPDATE plans SET reminder_sent_at = datetime('now') WHERE id = ?").bind(planId).run()
}

// Plans "ACTIFS" (par opposition aux plans inactifs ciblés par le rappel ci-dessus) dont le
// propriétaire a activé le résumé hebdomadaire — actif = modifié dans les 14 derniers jours,
// même seuil que le rappel d'inactivité pour que les deux se complètent sans zone morte ni
// chevauchement (un plan est soit inactif, soit éligible au digest, jamais les deux).
export async function getPlansForWeeklyDigest(env) {
  const res = await env.DB.prepare(
    `SELECT p.id, p.data, n.email, n.slack_webhook_url, n.slack_enabled
     FROM plans p
     JOIN notification_prefs n ON n.user_id = p.user_id
     WHERE n.weekly_digest = 1
       AND (n.email IS NOT NULL OR (n.slack_enabled = 1 AND n.slack_webhook_url IS NOT NULL))
       AND p.updated_at > datetime('now', '-14 days')`
  ).all()
  return (res.results || []).map(r => ({ ...r, data: JSON.parse(r.data) }))
}
