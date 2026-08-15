import * as db from '../lib/db'
import { createCheckoutSession, verifyWebhookSignature } from '../lib/stripe'
import { generateTableWithAI } from '../lib/ai/tableClient'
import { generateTableFromPrompt } from '../lib/generator/tableFallback'
import { generateVeilleWithAI } from '../lib/ai/veilleClient'
import { generateVeilleFallback } from '../lib/generator/veilleFallback'
import { generateBenchmarksWithAI } from '../lib/ai/benchmarksClient'
import { generateBenchmarksFallback } from '../lib/generator/benchmarksFallback'
import { generateEditorialWithAI } from '../lib/ai/editorialClient'
import { generateEditorialFallback } from '../lib/generator/editorialFallback'
import { generateAdvertisingWithAI } from '../lib/ai/advertisingClient'
import { generateAdvertisingFallback } from '../lib/generator/advertisingFallback'
import { generateRgpdWithAI } from '../lib/ai/rgpdClient'
import { generateRgpdFallback } from '../lib/generator/rgpdFallback'
import { AGENT_RUNNERS } from '../lib/ai/agentClient'
import { buildAuthorizeUrl, exchangeCode, createPlanPage, syncStoriesToNotion } from '../lib/notion/notionClient'
import * as jira from '../lib/jira/jiraClient'
import * as github from '../lib/github/githubClient'

const AGENT_TASK_TYPES = Object.keys(AGENT_RUNNERS)

function genTaskId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 20)
}

export const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS })
}

// Route /plans, /drafts, /credits, /shares — stockage serveur par utilisateur
// (remplace le localStorage côté client une fois connecté). Retourne `null` si
// le chemin ne correspond à aucune de ces routes, pour laisser le fetch principal
// retomber sur la génération de plan.
export async function handleApi(request, env, url) {
  const { pathname, searchParams } = url
  const method = request.method

  if (pathname === '/plans' && method === 'GET') {
    const userId = searchParams.get('userId')
    const teamId = searchParams.get('teamId') || null
    if (!userId) return json({ error: 'userId required' }, 400)
    return json(await db.listPlans(env, userId, teamId))
  }

  if (pathname === '/plans' && method === 'POST') {
    const { userId, plan, teamId } = await request.json()
    if (!userId || !plan) return json({ error: 'userId and plan required' }, 400)
    return json(await db.upsertPlan(env, userId, plan, teamId || null))
  }

  const planMatch = pathname.match(/^\/plans\/([^/]+)$/)
  if (planMatch && method === 'DELETE') {
    const userId = searchParams.get('userId')
    const teamId = searchParams.get('teamId') || null
    const role = searchParams.get('role') || null
    if (!userId) return json({ error: 'userId required' }, 400)
    // Un plan d'équipe ne peut être supprimé que par un admin — un membre simple peut
    // créer/éditer mais pas supprimer. Le rôle vient du client (voir la note de confiance
    // en tête de db.js) : suffisant pour ce produit, à durcir avec la vérification JWT.
    if (teamId && role !== 'org:admin') return json({ error: 'forbidden' }, 403)
    await db.deletePlan(env, userId, planMatch[1], teamId)
    return json({ ok: true })
  }

  const planMoveMatch = pathname.match(/^\/plans\/([^/]+)\/move$/)
  if (planMoveMatch && method === 'POST') {
    const { userId, fromTeamId, toTeamId, role } = await request.json()
    if (!userId) return json({ error: 'userId required' }, 400)
    // Sortir un plan d'une équipe est réservé aux admins de cette équipe (même règle que
    // la suppression) ; entrer dans une équipe ou rester en personnel n'a pas cette contrainte.
    if (fromTeamId && role !== 'org:admin') return json({ error: 'forbidden' }, 403)
    const moved = await db.movePlan(env, userId, planMoveMatch[1], fromTeamId || null, toTeamId || null)
    if (!moved) return json({ error: 'not found' }, 404)
    return json(moved)
  }

  if (pathname === '/drafts' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    return json(await db.listDrafts(env, userId))
  }

  if (pathname === '/drafts' && method === 'POST') {
    const { userId, draft } = await request.json()
    if (!userId || !draft) return json({ error: 'userId and draft required' }, 400)
    return json(await db.upsertDraft(env, userId, draft))
  }

  const draftMatch = pathname.match(/^\/drafts\/([^/]+)$/)
  if (draftMatch && method === 'DELETE') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.deleteDraft(env, userId, draftMatch[1])
    return json({ ok: true })
  }

  if (pathname === '/credits' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    return json(await db.getCredits(env, userId))
  }

  if (pathname === '/credits/consume' && method === 'POST') {
    const { userId } = await request.json()
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.consumeCredit(env, userId)
    return json({ ok: true })
  }

  if (pathname === '/shares' && method === 'POST') {
    const { planId } = await request.json()
    if (!planId) return json({ error: 'planId required' }, 400)
    const shareId = await db.createShare(env, planId)
    return json({ shareId })
  }

  const shareMatch = pathname.match(/^\/shares\/([^/]+)$/)
  if (shareMatch && method === 'GET') {
    const resolved = await db.resolveShare(env, shareMatch[1])
    if (!resolved) return json({ error: 'not found or expired' }, 404)
    return json(resolved)
  }

  if (pathname === '/generate-table' && method === 'POST') {
    const { prompt, plan, lang } = await request.json()
    if (!prompt) return json({ error: 'prompt required' }, 400)
    try {
      const table = await generateTableWithAI(prompt, plan, lang || 'fr', env)
      return json({ ...table, source: 'ai' })
    } catch {
      return json({ ...generateTableFromPrompt(prompt), source: 'rules' })
    }
  }

  if (pathname === '/generate-veille' && method === 'POST') {
    const { plan, lang } = await request.json()
    try {
      const veille = await generateVeilleWithAI(plan, lang || 'fr', env)
      return json({ ...veille, source: 'ai' })
    } catch {
      return json({ ...generateVeilleFallback(plan, lang || 'fr'), source: 'rules' })
    }
  }

  if (pathname === '/generate-benchmarks' && method === 'POST') {
    const { plan, lang } = await request.json()
    try {
      const benchmarks = await generateBenchmarksWithAI(plan, lang || 'fr', env)
      return json({ ...benchmarks, source: 'ai' })
    } catch {
      return json({ ...generateBenchmarksFallback(plan, lang || 'fr'), source: 'rules' })
    }
  }

  if (pathname === '/generate-editorial' && method === 'POST') {
    const { plan, lang } = await request.json()
    try {
      const editorial = await generateEditorialWithAI(plan, lang || 'fr', env)
      return json({ ...editorial, source: 'ai' })
    } catch {
      return json({ ...generateEditorialFallback(plan, lang || 'fr'), source: 'rules' })
    }
  }

  if (pathname === '/generate-advertising' && method === 'POST') {
    const { plan, lang } = await request.json()
    try {
      const advertising = await generateAdvertisingWithAI(plan, lang || 'fr', env)
      return json({ ...advertising, source: 'ai' })
    } catch {
      return json({ ...generateAdvertisingFallback(plan, lang || 'fr'), source: 'rules' })
    }
  }

  if (pathname === '/generate-rgpd' && method === 'POST') {
    const { plan, lang } = await request.json()
    try {
      const rgpd = await generateRgpdWithAI(plan, lang || 'fr', env)
      return json({ ...rgpd, source: 'ai' })
    } catch {
      return json({ ...generateRgpdFallback(plan, lang || 'fr'), source: 'rules' })
    }
  }

  // --- Intégration Notion (OAuth + export de page) ---

  if (pathname === '/notion/status' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    const token = await db.getNotionToken(env, userId)
    return json({ connected: !!token, workspace: token?.workspace_name || null })
  }

  if (pathname === '/notion/authorize-url' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    if (!env.NOTION_CLIENT_ID) return json({ error: 'notion_not_configured' }, 500)
    return json({ url: buildAuthorizeUrl(env, userId) })
  }

  if (pathname === '/notion/callback' && method === 'GET') {
    const code = searchParams.get('code')
    const state = searchParams.get('state') // = userId
    const appUrl = env.APP_URL || '/'
    if (!code || !state) {
      return Response.redirect(`${appUrl}?notion=error`, 302)
    }
    try {
      const tokenData = await exchangeCode(env, code)
      await db.saveNotionToken(env, state, tokenData)
      return Response.redirect(`${appUrl}?notion=connected`, 302)
    } catch {
      return Response.redirect(`${appUrl}?notion=error`, 302)
    }
  }

  if (pathname === '/notion/disconnect' && method === 'POST') {
    const { userId } = await request.json()
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.deleteNotionToken(env, userId)
    return json({ ok: true })
  }

  if (pathname === '/notion/export' && method === 'POST') {
    const { userId, plan, lang } = await request.json()
    if (!userId || !plan) return json({ error: 'userId and plan required' }, 400)
    const token = await db.getNotionToken(env, userId)
    if (!token) return json({ needsAuth: true })
    try {
      const url = await createPlanPage(token.access_token, plan, lang || 'fr', env.NOTION_COVER_URL)
      return json({ url })
    } catch (e) {
      if (String(e.message).includes('no_parent')) return json({ error: 'no_parent' }, 400)
      return json({ error: 'export_failed' }, 500)
    }
  }

  // Sync par story (base dédiée, deep-links individuels) — indépendant de l'export page ci-dessus.
  if (pathname === '/notion/sync-stories' && method === 'POST') {
    const { userId, plan, lang } = await request.json()
    if (!userId || !plan) return json({ error: 'userId and plan required' }, 400)
    const token = await db.getNotionToken(env, userId)
    if (!token) return json({ needsAuth: true })
    try {
      const result = await syncStoriesToNotion(token.access_token, plan, lang || 'fr', plan.notion)
      return json(result)
    } catch (e) {
      if (String(e.message).includes('no_parent')) return json({ error: 'no_parent' }, 400)
      return json({ error: 'sync_failed' }, 500)
    }
  }

  // --- Intégration Jira (OAuth 3LO + création Epics/Stories) ---

  if (pathname === '/jira/status' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    const token = await db.getJiraToken(env, userId)
    return json({
      connected: !!token,
      site: token?.site_name || null,
      project: token?.project_key ? { key: token.project_key, name: token.project_name } : null
    })
  }

  if (pathname === '/jira/authorize-url' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    if (!env.JIRA_CLIENT_ID) return json({ error: 'jira_not_configured' }, 500)
    return json({ url: jira.buildAuthorizeUrl(env, userId) })
  }

  if (pathname === '/jira/callback' && method === 'GET') {
    const code = searchParams.get('code')
    const state = searchParams.get('state') // = userId
    const appUrl = env.APP_URL || '/'
    if (!code || !state) return Response.redirect(`${appUrl}?jira=error`, 302)
    try {
      const tokenData = await jira.exchangeCode(env, code)
      await db.saveJiraToken(env, state, tokenData)
      return Response.redirect(`${appUrl}?jira=connected`, 302)
    } catch {
      return Response.redirect(`${appUrl}?jira=error`, 302)
    }
  }

  if (pathname === '/jira/disconnect' && method === 'POST') {
    const { userId } = await request.json()
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.deleteJiraToken(env, userId)
    return json({ ok: true })
  }

  // Liste les sites + projets accessibles, pour que l'utilisateur choisisse sa cible.
  if (pathname === '/jira/projects' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    const token = await db.getJiraToken(env, userId)
    if (!token) return json({ needsAuth: true })
    try {
      const accessToken = await jira.ensureAccessToken(env, userId, token)
      const sites = await jira.listAccessibleResources(accessToken)
      const result = []
      for (const site of sites) {
        const projects = await jira.listProjects(accessToken, site.id)
        result.push({ cloudId: site.id, siteUrl: site.url, siteName: site.name, projects })
      }
      return json({ sites: result })
    } catch {
      return json({ error: 'jira_projects_failed' }, 500)
    }
  }

  // Mémorise le site + projet choisis.
  if (pathname === '/jira/select' && method === 'POST') {
    const { userId, cloudId, siteUrl, siteName, projectKey, projectName } = await request.json()
    if (!userId || !cloudId || !projectKey) return json({ error: 'userId, cloudId and projectKey required' }, 400)
    await db.setJiraTarget(env, userId, { cloudId, siteUrl, siteName, projectKey, projectName })
    return json({ ok: true })
  }

  if (pathname === '/jira/export' && method === 'POST') {
    const { userId, plan, lang } = await request.json()
    if (!userId || !plan) return json({ error: 'userId and plan required' }, 400)
    const token = await db.getJiraToken(env, userId)
    if (!token) return json({ needsAuth: true })
    if (!token.project_key) return json({ needsProject: true })
    try {
      const accessToken = await jira.ensureAccessToken(env, userId, token)
      const result = await jira.exportPlanToJira(accessToken, token, plan, lang || 'fr')
      return json(result)
    } catch {
      return json({ error: 'jira_export_failed' }, 500)
    }
  }

  // --- Intégration GitHub (OAuth + création/mise à jour d'issues) ---

  if (pathname === '/github/status' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    const token = await db.getGithubToken(env, userId)
    return json({
      connected: !!token,
      repo: token?.repo_full_name ? { fullName: token.repo_full_name, owner: token.owner, repo: token.repo } : null
    })
  }

  if (pathname === '/github/authorize-url' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    if (!env.GITHUB_CLIENT_ID) return json({ error: 'github_not_configured' }, 500)
    return json({ url: github.buildAuthorizeUrl(env, userId) })
  }

  if (pathname === '/github/callback' && method === 'GET') {
    const code = searchParams.get('code')
    const state = searchParams.get('state') // = userId
    const appUrl = env.APP_URL || '/'
    if (!code || !state) return Response.redirect(`${appUrl}?github=error`, 302)
    try {
      const accessToken = await github.exchangeCode(env, code)
      await db.saveGithubToken(env, state, accessToken)
      return Response.redirect(`${appUrl}?github=connected`, 302)
    } catch {
      return Response.redirect(`${appUrl}?github=error`, 302)
    }
  }

  if (pathname === '/github/disconnect' && method === 'POST') {
    const { userId } = await request.json()
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.deleteGithubToken(env, userId)
    return json({ ok: true })
  }

  if (pathname === '/github/repos' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    const token = await db.getGithubToken(env, userId)
    if (!token) return json({ needsAuth: true })
    try {
      const repos = await github.listRepos(token.access_token)
      return json({ repos })
    } catch {
      return json({ error: 'github_repos_failed' }, 500)
    }
  }

  if (pathname === '/github/select' && method === 'POST') {
    const { userId, owner, repo } = await request.json()
    if (!userId || !owner || !repo) return json({ error: 'userId, owner and repo required' }, 400)
    await db.setGithubTarget(env, userId, { owner, repo, repoFullName: `${owner}/${repo}` })
    return json({ ok: true })
  }

  if (pathname === '/github/export' && method === 'POST') {
    const { userId, plan, lang } = await request.json()
    if (!userId || !plan) return json({ error: 'userId and plan required' }, 400)
    const token = await db.getGithubToken(env, userId)
    if (!token) return json({ needsAuth: true })
    if (!token.repo) return json({ needsRepo: true })
    try {
      const result = await github.exportPlanToGithub(token.access_token, token, plan, lang || 'fr')
      return json(result)
    } catch {
      return json({ error: 'github_export_failed' }, 500)
    }
  }

  // Agents IA asynchrones — la requête ne fait qu'empiler le message sur la queue
  // et retourne immédiatement ; le traitement réel se fait dans le consumer (queue()
  // dans generate.js), potentiellement bien après la fin de cette requête HTTP.
  if (pathname === '/agents/enqueue' && method === 'POST') {
    const { planId, userId, type, input } = await request.json()
    if (!planId || !userId || !type || !input) {
      return json({ error: 'planId, userId, type and input required' }, 400)
    }
    if (!AGENT_TASK_TYPES.includes(type)) {
      return json({ error: `unknown agent type: ${type}` }, 400)
    }
    const id = genTaskId()
    await db.createAgentTask(env, { id, planId, userId, type, input })
    await env.AGENT_TASKS_QUEUE.send({ taskId: id })
    return json({ id, status: 'queued' })
  }

  if (pathname === '/agents/tasks' && method === 'GET') {
    const planId = searchParams.get('planId')
    if (!planId) return json({ error: 'planId required' }, 400)
    return json(await db.listAgentTasksForPlan(env, planId))
  }

  const agentTaskMatch = pathname.match(/^\/agents\/tasks\/([^/]+)$/)
  if (agentTaskMatch && method === 'DELETE') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    const deleted = await db.deleteAgentTask(env, userId, agentTaskMatch[1])
    if (!deleted) return json({ error: 'not found' }, 404)
    return json({ ok: true })
  }

  if (pathname === '/checkout' && method === 'POST') {
    const { userId, email, successUrl, cancelUrl } = await request.json()
    if (!userId || !successUrl || !cancelUrl) {
      return json({ error: 'userId, successUrl and cancelUrl required' }, 400)
    }
    try {
      const session = await createCheckoutSession(env, { userId, email, successUrl, cancelUrl })
      return json({ url: session.url })
    } catch (err) {
      return json({ error: err.message }, 500)
    }
  }

  // Webhook Stripe : active/désactive le Pro selon l'abonnement. La signature est
  // vérifiée avant tout traitement pour ne faire confiance qu'aux events Stripe réels.
  if (pathname === '/webhooks/stripe' && method === 'POST') {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')
    if (!signature || !(await verifyWebhookSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET))) {
      return json({ error: 'invalid signature' }, 400)
    }

    const event = JSON.parse(payload)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.client_reference_id
      if (userId) await db.setPro(env, userId, true, session.customer)
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const userId = await db.findUserIdByStripeCustomer(env, subscription.customer)
      if (userId) await db.setPro(env, userId, false, subscription.customer)
    }

    return json({ received: true })
  }

  return null
}
