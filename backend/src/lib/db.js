// Accès D1 pour le stockage serveur des plans/brouillons/crédits par utilisateur.
//
// ⚠️ Le userId est actuellement fourni tel quel par le client (aucune clé secrète
// Clerk n'est encore configurée côté Worker pour vérifier le token de session).
// À durcir dès que CLERK_SECRET_KEY est disponible : vérifier le JWT Clerk et en
// extraire le userId côté serveur plutôt que de faire confiance au body de la requête.

function genId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 20)
}

export async function listPlans(env, userId) {
  const { results } = await env.DB.prepare(
    'SELECT id, data, created_at, updated_at FROM plans WHERE user_id = ? ORDER BY updated_at DESC'
  ).bind(userId).all()
  return results.map(row => ({ ...JSON.parse(row.data), id: row.id, savedAt: row.created_at, updatedAt: row.updated_at }))
}

export async function upsertPlan(env, userId, plan) {
  const id = plan.id || genId()
  const now = new Date().toISOString()
  await env.DB.prepare(
    `INSERT INTO plans (id, user_id, data, product_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data, product_name = excluded.product_name, updated_at = excluded.updated_at`
  ).bind(id, userId, JSON.stringify({ ...plan, id }), plan.product?.name || null, now, now).run()
  return { ...plan, id, savedAt: now, updatedAt: now }
}

export async function deletePlan(env, userId, id) {
  await env.DB.prepare('DELETE FROM plans WHERE id = ? AND user_id = ?').bind(id, userId).run()
}

export async function getPlan(env, id) {
  const row = await env.DB.prepare('SELECT data FROM plans WHERE id = ?').bind(id).first()
  return row ? JSON.parse(row.data) : null
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
