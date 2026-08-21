import * as db from '../lib/db'
import { createCheckoutSession, verifyWebhookSignature } from '../lib/stripe'
import { verifyClerkWebhook, listUserOrganizationMemberships, deleteOrganization, TEAM_SPACE_LIMITS } from '../lib/clerk'
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
import { runCopilotChat } from '../lib/ai/copilotClient'
import { buildAuthorizeUrl, exchangeCode, createPlanPage, syncStoriesToNotion } from '../lib/notion/notionClient'
import * as jira from '../lib/jira/jiraClient'
import * as linear from '../lib/linear/linearClient'
import * as googleCalendar from '../lib/google/googleCalendarClient'
import * as github from '../lib/github/githubClient'
import { sendEmail, agentDoneEmail, extractHighlights, AGENT_TYPE_LABELS, mentionEmail, feedNotificationContent } from '../lib/email/resendClient'
import { sendSlackMessage, agentDoneSlackMessage, mentionSlackMessage } from '../lib/slack/slackClient'
import { triggerWebhooks, generateSecret } from '../lib/webhooks/webhookClient'
import { generatePlanOgImage } from '../lib/og/ogImage'

// Email + Slack best-effort à la fin d'une génération IA (veille, benchmarks, calendriers,
// RGPD, tableau IA, ou agent async) — deux canaux indépendants (un utilisateur peut n'activer
// que l'un des deux) ; n'échoue jamais la réponse HTTP, même si un envoi rate.
async function createFeedNotification(env, userId, lang, taskType, plan, output) {
  const { title, detail } = feedNotificationContent(taskType, output, lang)
  const { teamId } = plan?.id ? await db.getPlanOwnerAndTeam(env, plan.id) : { teamId: null }
  await db.createNotification(env, { userId, type: taskType, title, detail, planId: plan?.id || null, teamId })
}

async function notifyGenerationDone(env, userId, plan, lang, taskType, output) {
  if (!userId) { console.log(`[notify] skipped (${taskType}): no userId`); return }
  const resolvedLang = lang || plan?.language || 'fr'

  // Canal indépendant des préférences email/Slack ci-dessous (pas de ligne notification_prefs
  // nécessaire) — déclenché avant le early-return sur prefs manquantes.
  await triggerWebhooks(env, userId, 'generation.completed', {
    taskType,
    planId: plan?.id || null,
    productName: plan?.product?.name || null
  })

  // Centre de notifications in-app : toujours créé, indépendamment des préférences
  // email/Slack ci-dessous (celles-ci ne gouvernent que l'envoi externe).
  await createFeedNotification(env, userId, resolvedLang, taskType, plan, output).catch(() => {})

  const prefs = await db.getNotificationPrefs(env, userId).catch(() => null)
  if (!prefs) { console.log(`[notify] skipped (${taskType}): no prefs`); return }

  if (prefs.agent_done && prefs.email) {
    try {
      const { subject, html } = agentDoneEmail(resolvedLang, {
        productName: plan?.product?.name,
        classification: plan?.classification,
        taskType,
        output,
        appUrl: env.APP_URL
      })
      await sendEmail(env, { to: prefs.email, subject, html })
    } catch (e) { console.log(`[notify] email error (${taskType}): ${e.message}`) }
  }

  if (prefs.slack_enabled && prefs.slack_webhook_url) {
    try {
      const en = resolvedLang === 'en'
      const typeLabel = AGENT_TYPE_LABELS[taskType]?.[en ? 'en' : 'fr'] || taskType
      const highlights = extractHighlights(taskType, output, en)
      const msg = agentDoneSlackMessage(resolvedLang, { productName: plan?.product?.name, taskType, typeLabel, highlights, appUrl: env.APP_URL })
      await sendSlackMessage(prefs.slack_webhook_url, msg)
    } catch (e) { console.log(`[notify] slack error (${taskType}): ${e.message}`) }
  }
}

function flattenStories(roadmap) {
  return (roadmap?.sprints || []).flatMap(sp => sp.stories || [])
}

function flattenDoneStoryIds(roadmap) {
  return flattenStories(roadmap).filter(s => s.status === 'done').map(s => s.id)
}

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
    // Diff roadmap avant/après pour l'événement webhook story.completed — coût d'une lecture
    // supplémentaire seulement si l'utilisateur a effectivement un webhook sur cet événement,
    // pour ne pas ralentir l'enregistrement (le chemin chaud) dans le cas commun sans webhook.
    if (plan.id) {
      const storyHooks = await db.getWebhooksForEvent(env, userId, 'story.completed').catch(() => [])
      if (storyHooks.length) {
        const previous = await db.getPlan(env, plan.id).catch(() => null)
        const doneBefore = new Set(flattenDoneStoryIds(previous?.roadmap))
        for (const story of flattenStories(plan.roadmap)) {
          if (story.status === 'done' && !doneBefore.has(story.id)) {
            await triggerWebhooks(env, userId, 'story.completed', {
              planId: plan.id,
              productName: plan.product?.name || null,
              storyId: story.id,
              storyTitle: story.title
            })
          }
        }
      }
    }
    const saved = await db.upsertPlan(env, userId, plan, teamId || null)
    // Best-effort, comme la vérification de webhooks ci-dessus : un instantané raté ne doit
    // jamais faire échouer l'enregistrement lui-même (le chemin chaud).
    await db.snapshotPlanVersion(env, userId, saved.id, saved).catch(() => {})
    return json(saved)
  }

  // Recherche de photos libres de droit (couverture de plan, voir CoverPicker.jsx) — proxy
  // côté serveur pour ne jamais exposer PEXELS_API_KEY au navigateur. Ne renvoie que ce dont
  // le sélecteur a besoin (pas la réponse Pexels brute) : url d'aperçu, url pleine résolution
  // à utiliser comme couverture, et l'attribution (nom + lien du photographe), obligatoire
  // par les conditions d'utilisation de Pexels.
  if (pathname === '/pexels/search' && method === 'GET') {
    if (!env.PEXELS_API_KEY) return json({ error: 'pexels_not_configured' }, 501)
    const query = searchParams.get('query')
    if (!query) return json({ error: 'query required' }, 400)
    const page = searchParams.get('page') || '1'
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=24&page=${page}&orientation=landscape`,
      { headers: { Authorization: env.PEXELS_API_KEY } }
    )
    if (!res.ok) return json({ error: 'pexels_request_failed' }, 502)
    const data = await res.json()
    return json({
      page: data.page,
      totalResults: data.total_results,
      photos: (data.photos || []).map(p => ({
        id: p.id,
        thumbUrl: p.src.medium,
        fullUrl: p.src.large2x,
        width: p.width,
        height: p.height,
        alt: p.alt || '',
        photographer: p.photographer,
        photographerUrl: p.photographer_url
      }))
    })
  }

  if (pathname === '/plan-versions' && method === 'GET') {
    const planId = searchParams.get('planId')
    if (!planId) return json({ error: 'planId required' }, 400)
    return json(await db.listPlanVersions(env, planId))
  }

  const planVersionMatch = pathname.match(/^\/plan-versions\/([^/]+)$/)
  if (planVersionMatch && method === 'GET') {
    const version = await db.getPlanVersion(env, planVersionMatch[1])
    if (!version) return json({ error: 'not found' }, 404)
    return json(version)
  }

  // Historique multi-fils du copilote Nova — voir CopilotChat.jsx.
  if (pathname === '/copilot/conversations' && method === 'GET') {
    const planId = searchParams.get('planId')
    if (!planId) return json({ error: 'planId required' }, 400)
    return json(await db.listCopilotConversations(env, planId))
  }

  if (pathname === '/copilot/conversations' && method === 'POST') {
    const { userId, planId, conversation } = await request.json()
    if (!userId || !planId || !conversation?.id) return json({ error: 'userId, planId and conversation.id required' }, 400)
    return json(await db.upsertCopilotConversation(env, userId, planId, conversation))
  }

  const copilotConversationMatch = pathname.match(/^\/copilot\/conversations\/([^/]+)$/)
  if (copilotConversationMatch && method === 'GET') {
    const conversation = await db.getCopilotConversation(env, copilotConversationMatch[1])
    if (!conversation) return json({ error: 'not found' }, 404)
    return json(conversation)
  }
  if (copilotConversationMatch && method === 'DELETE') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.deleteCopilotConversation(env, userId, copilotConversationMatch[1])
    return json({ ok: true })
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

  if (pathname === '/plans/all' && method === 'GET') {
    const userId = searchParams.get('userId')
    const teamIds = (searchParams.get('teamIds') || '').split(',').map(s => s.trim()).filter(Boolean)
    if (!userId) return json({ error: 'userId required' }, 400)
    return json(await db.getAllPlansForUser(env, userId, teamIds))
  }

  if (pathname === '/notifications' && method === 'GET') {
    const userId = searchParams.get('userId')
    const teamIds = (searchParams.get('teamIds') || '').split(',').map(s => s.trim()).filter(Boolean)
    if (!userId) return json({ error: 'userId required' }, 400)
    return json(await db.getRecentComments(env, userId, teamIds))
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

  // Image de partage (og:image) pour un plan partagé — id d'un shareId (lien de partage
  // classique, 30 jours). Générée à la volée, jamais stockée (voir generatePlanOgImage).
  const ogMatch = pathname.match(/^\/og\/([^/]+)\.png$/)
  if (ogMatch && (method === 'GET' || method === 'HEAD')) {
    const id = ogMatch[1]
    const shared = await db.resolveShare(env, id).catch(() => null)
    const plan = shared?.plan
    if (!plan) return json({ error: 'not found' }, 404)
    // LinkedIn/Facebook/Slack envoient d'abord un HEAD sur og:image pour vérifier son
    // type avant de faire le GET réel — un 405 sur ce HEAD (avant ce correctif, seul GET
    // était géré) leur faisait abandonner sans jamais récupérer l'image ("No image found"
    // dans LinkedIn Post Inspector alors que l'image répondait très bien en GET direct).
    // Réponse légère sans regénérer l'image pour un simple HEAD.
    if (method === 'HEAD') {
      return new Response(null, { headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=3600' } })
    }
    try {
      return await generatePlanOgImage(plan)
    } catch (e) {
      console.log(`[og] generation error: ${e.message}`)
      return json({ error: 'og_generation_failed' }, 500)
    }
  }

  if (pathname === '/generate-table' && method === 'POST') {
    const { prompt, plan, lang, userId } = await request.json()
    if (!prompt) return json({ error: 'prompt required' }, 400)
    let result
    try {
      result = { ...(await generateTableWithAI(prompt, plan, lang || 'fr', env)), source: 'ai' }
    } catch {
      result = { ...generateTableFromPrompt(prompt), source: 'rules' }
    }
    await notifyGenerationDone(env, userId, plan, lang, 'table', result)
    return json(result)
  }

  // @mentions dans les commentaires : notification ciblée à chaque personne mentionnée
  // (indépendant de notifyGenerationDone plus haut, qui notifie le propriétaire du plan —
  // ici c'est la préférence du membre MENTIONNÉ qui compte, pas celle de l'auteur du plan).
  // Best-effort, comme les autres notifications : n'échoue jamais la requête HTTP.
  if (pathname === '/comments/notify' && method === 'POST') {
    const { plan, comment, mentionedUserIds, lang, authorId } = await request.json()
    if (!Array.isArray(mentionedUserIds) || !mentionedUserIds.length) return json({ ok: true })
    const resolvedLang = lang || plan?.language || 'fr'
    const productName = plan?.product?.name
    const { teamId } = plan?.id ? await db.getPlanOwnerAndTeam(env, plan.id) : { teamId: null }
    const results = await Promise.allSettled(mentionedUserIds
      .filter(uid => uid && uid !== authorId)
      .map(async (uid) => {
        await db.createNotification(env, {
          userId: uid,
          type: 'mention',
          title: resolvedLang === 'en' ? `${comment?.authorName || 'Someone'} mentioned you` : `${comment?.authorName || 'Quelqu\'un'} vous a mentionné·e`,
          detail: comment?.text || null,
          planId: plan?.id || null,
          teamId
        }).catch(() => {})

        const prefs = await db.getNotificationPrefs(env, uid).catch(() => null)
        if (!prefs || !prefs.mentions) return
        if (prefs.email) {
          const { subject, html } = mentionEmail(resolvedLang, {
            productName, authorName: comment?.authorName, commentText: comment?.text, appUrl: env.APP_URL
          })
          await sendEmail(env, { to: prefs.email, subject, html }).catch(e => console.log(`[notify] mention email error: ${e.message}`))
        }
        if (prefs.slack_enabled && prefs.slack_webhook_url) {
          const msg = mentionSlackMessage(resolvedLang, {
            productName, authorName: comment?.authorName, commentText: comment?.text, appUrl: env.APP_URL
          })
          await sendSlackMessage(prefs.slack_webhook_url, msg).catch(e => console.log(`[notify] mention slack error: ${e.message}`))
        }
      }))
    return json({ ok: true, notified: results.length })
  }

  if (pathname === '/copilot/chat' && method === 'POST') {
    const { plan, message, history, lang } = await request.json()
    if (!plan || !message) return json({ error: 'plan and message required' }, 400)
    try {
      const result = await runCopilotChat(env, { plan, message, history, lang })
      return json(result)
    } catch (e) {
      console.log(`[copilot] error: ${e.message}`)
      return json({ error: 'copilot_failed' }, 502)
    }
  }

  if (pathname === '/generate-veille' && method === 'POST') {
    const { plan, lang, userId } = await request.json()
    let result
    try {
      result = { ...(await generateVeilleWithAI(plan, lang || 'fr', env)), source: 'ai' }
    } catch {
      result = { ...generateVeilleFallback(plan, lang || 'fr'), source: 'rules' }
    }
    await notifyGenerationDone(env, userId, plan, lang, 'veille', result)
    return json(result)
  }

  if (pathname === '/generate-benchmarks' && method === 'POST') {
    const { plan, lang, userId } = await request.json()
    let result
    try {
      result = { ...(await generateBenchmarksWithAI(plan, lang || 'fr', env)), source: 'ai' }
    } catch {
      result = { ...generateBenchmarksFallback(plan, lang || 'fr'), source: 'rules' }
    }
    await notifyGenerationDone(env, userId, plan, lang, 'benchmarks', result)
    return json(result)
  }

  if (pathname === '/generate-editorial' && method === 'POST') {
    const { plan, lang, userId } = await request.json()
    let result
    try {
      result = { ...(await generateEditorialWithAI(plan, lang || 'fr', env)), source: 'ai' }
    } catch {
      result = { ...generateEditorialFallback(plan, lang || 'fr'), source: 'rules' }
    }
    await notifyGenerationDone(env, userId, plan, lang, 'editorial', result)
    return json(result)
  }

  if (pathname === '/generate-advertising' && method === 'POST') {
    const { plan, lang, userId } = await request.json()
    let result
    try {
      result = { ...(await generateAdvertisingWithAI(plan, lang || 'fr', env)), source: 'ai' }
    } catch {
      result = { ...generateAdvertisingFallback(plan, lang || 'fr'), source: 'rules' }
    }
    await notifyGenerationDone(env, userId, plan, lang, 'advertising', result)
    return json(result)
  }

  if (pathname === '/generate-rgpd' && method === 'POST') {
    const { plan, lang, userId } = await request.json()
    let result
    try {
      result = { ...(await generateRgpdWithAI(plan, lang || 'fr', env)), source: 'ai' }
    } catch {
      result = { ...generateRgpdFallback(plan, lang || 'fr'), source: 'rules' }
    }
    await notifyGenerationDone(env, userId, plan, lang, 'rgpd', result)
    return json(result)
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
    if (!(await db.getCredits(env, userId)).isPro) return json({ error: 'pro_required' }, 403)
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
    if (!(await db.getCredits(env, userId)).isPro) return json({ error: 'pro_required' }, 403)
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
    if (!(await db.getCredits(env, userId)).isPro) return json({ error: 'pro_required' }, 403)
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

  // --- Intégration Linear (clé API personnelle, pas d'OAuth + création/mise à jour d'issues) ---

  if (pathname === '/linear/status' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    const token = await db.getLinearToken(env, userId)
    return json({
      connected: !!token,
      team: token?.team_key ? { key: token.team_key, name: token.team_name } : null
    })
  }

  // Pas de popup OAuth pour Linear : l'utilisateur colle sa clé API personnelle, validée
  // ici en un appel avant d'être enregistrée.
  if (pathname === '/linear/connect' && method === 'POST') {
    const { userId, apiKey } = await request.json()
    if (!userId || !apiKey) return json({ error: 'userId and apiKey required' }, 400)
    try {
      await linear.validateApiKey(apiKey)
      await db.saveLinearToken(env, userId, apiKey)
      return json({ ok: true })
    } catch {
      return json({ error: 'invalid_api_key' }, 400)
    }
  }

  if (pathname === '/linear/disconnect' && method === 'POST') {
    const { userId } = await request.json()
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.deleteLinearToken(env, userId)
    return json({ ok: true })
  }

  if (pathname === '/linear/teams' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    const token = await db.getLinearToken(env, userId)
    if (!token) return json({ needsAuth: true })
    try {
      const teams = await linear.listTeams(token.api_key)
      return json({ teams })
    } catch {
      return json({ error: 'linear_teams_failed' }, 500)
    }
  }

  if (pathname === '/linear/select' && method === 'POST') {
    const { userId, teamId, teamKey, teamName } = await request.json()
    if (!userId || !teamId) return json({ error: 'userId and teamId required' }, 400)
    await db.setLinearTarget(env, userId, { teamId, teamKey, teamName })
    return json({ ok: true })
  }

  if (pathname === '/linear/export' && method === 'POST') {
    const { userId, plan, lang } = await request.json()
    if (!userId || !plan) return json({ error: 'userId and plan required' }, 400)
    if (!(await db.getCredits(env, userId)).isPro) return json({ error: 'pro_required' }, 403)
    const token = await db.getLinearToken(env, userId)
    if (!token) return json({ needsAuth: true })
    if (!token.team_id) return json({ needsProject: true })
    try {
      const result = await linear.exportPlanToLinear(token.api_key, token, plan, lang || 'fr')
      return json(result)
    } catch {
      return json({ error: 'linear_export_failed' }, 500)
    }
  }

  // --- Intégration Google Calendar (OAuth + sync calendrier éditorial/pub + date de lancement) ---

  if (pathname === '/google-calendar/status' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    const token = await db.getGoogleCalendarToken(env, userId)
    return json({
      connected: !!token,
      calendar: token?.calendar_id ? { id: token.calendar_id, name: token.calendar_name } : null
    })
  }

  if (pathname === '/google-calendar/authorize-url' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    if (!env.GOOGLE_CALENDAR_CLIENT_ID) return json({ error: 'google_calendar_not_configured' }, 500)
    return json({ url: googleCalendar.buildAuthorizeUrl(env, userId) })
  }

  if (pathname === '/google-calendar/callback' && method === 'GET') {
    const code = searchParams.get('code')
    const state = searchParams.get('state') // = userId
    const appUrl = env.APP_URL || '/'
    if (!code || !state) return Response.redirect(`${appUrl}?googleCalendar=error`, 302)
    try {
      const tokenData = await googleCalendar.exchangeCode(env, code)
      if (!tokenData.refreshToken) return Response.redirect(`${appUrl}?googleCalendar=error`, 302)
      await db.saveGoogleCalendarToken(env, state, tokenData)
      return Response.redirect(`${appUrl}?googleCalendar=connected`, 302)
    } catch {
      return Response.redirect(`${appUrl}?googleCalendar=error`, 302)
    }
  }

  if (pathname === '/google-calendar/disconnect' && method === 'POST') {
    const { userId } = await request.json()
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.deleteGoogleCalendarToken(env, userId)
    return json({ ok: true })
  }

  if (pathname === '/google-calendar/calendars' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    const token = await db.getGoogleCalendarToken(env, userId)
    if (!token) return json({ needsAuth: true })
    try {
      const accessToken = await googleCalendar.ensureAccessToken(env, userId, token)
      const calendars = await googleCalendar.listCalendars(accessToken)
      return json({ calendars })
    } catch {
      return json({ error: 'google_calendar_list_failed' }, 500)
    }
  }

  if (pathname === '/google-calendar/select' && method === 'POST') {
    const { userId, calendarId, calendarName } = await request.json()
    if (!userId || !calendarId) return json({ error: 'userId and calendarId required' }, 400)
    await db.setGoogleCalendarTarget(env, userId, { calendarId, calendarName })
    return json({ ok: true })
  }

  if (pathname === '/google-calendar/export' && method === 'POST') {
    const { userId, plan, lang } = await request.json()
    if (!userId || !plan) return json({ error: 'userId and plan required' }, 400)
    if (!(await db.getCredits(env, userId)).isPro) return json({ error: 'pro_required' }, 403)
    const token = await db.getGoogleCalendarToken(env, userId)
    if (!token) return json({ needsAuth: true })
    if (!token.calendar_id) return json({ needsProject: true })
    try {
      const accessToken = await googleCalendar.ensureAccessToken(env, userId, token)
      const result = await googleCalendar.syncPlanToCalendar(accessToken, token, plan, lang || 'fr')
      return json(result)
    } catch {
      return json({ error: 'google_calendar_export_failed' }, 500)
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
    if (!(await db.getCredits(env, userId)).isPro) return json({ error: 'pro_required' }, 403)
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

  // --- Préférences de notification par email ---

  if (pathname === '/notifications/prefs' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    const prefs = await db.getNotificationPrefs(env, userId)
    return json({
      email: prefs?.email || null,
      agentDone: !!prefs?.agent_done,
      inactivityReminder: !!prefs?.inactivity_reminder,
      slackWebhookUrl: prefs?.slack_webhook_url || null,
      slackEnabled: !!prefs?.slack_enabled,
      veilleAutoRefresh: !!prefs?.veille_auto_refresh,
      mentions: prefs ? !!prefs.mentions : true,
      weeklyDigest: !!prefs?.weekly_digest
    })
  }

  if (pathname === '/notifications/prefs' && method === 'POST') {
    const { userId, email, agentDone, inactivityReminder, slackWebhookUrl, slackEnabled, veilleAutoRefresh, mentions, weeklyDigest } = await request.json()
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.setNotificationPrefs(env, userId, { email, agentDone, inactivityReminder, slackWebhookUrl, slackEnabled, veilleAutoRefresh, mentions, weeklyDigest })
    return json({ ok: true })
  }

  // --- Webhooks sortants (Zapier, Make, backend perso...) ---

  const VALID_WEBHOOK_EVENTS = ['generation.completed', 'story.completed']

  if (pathname === '/webhooks' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    const hooks = await db.listWebhooks(env, userId)
    // Le secret n'est renvoyé qu'à la création (voir POST ci-dessous) — jamais relu ensuite,
    // même par son propriétaire, pour limiter la fenêtre d'exposition si le compte est compromis.
    return json(hooks.map(({ secret, ...rest }) => rest))
  }

  if (pathname === '/webhooks' && method === 'POST') {
    const { userId, url, events } = await request.json()
    if (!userId || !url) return json({ error: 'userId and url required' }, 400)
    let parsedUrl
    try { parsedUrl = new URL(url) } catch { return json({ error: 'invalid_url' }, 400) }
    if (parsedUrl.protocol !== 'https:') return json({ error: 'https_required' }, 400)
    const validEvents = (Array.isArray(events) ? events : []).filter(e => VALID_WEBHOOK_EVENTS.includes(e))
    if (!validEvents.length) return json({ error: 'at_least_one_event_required' }, 400)
    const secret = generateSecret()
    const hook = await db.createWebhook(env, userId, { url, events: validEvents, secret })
    return json({ ...hook, secret }) // seule occasion où le secret est renvoyé en clair
  }

  const webhookToggleMatch = pathname.match(/^\/webhooks\/([^/]+)\/toggle$/)
  if (webhookToggleMatch && method === 'POST') {
    const { userId, enabled } = await request.json()
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.updateWebhookEnabled(env, userId, webhookToggleMatch[1], !!enabled)
    return json({ ok: true })
  }

  const webhookMatch = pathname.match(/^\/webhooks\/([^/]+)$/)
  if (webhookMatch && method === 'DELETE') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.deleteWebhook(env, userId, webhookMatch[1])
    return json({ ok: true })
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

  // Centre de notifications (cloche du header) : flux persistant, distinct de la route
  // /notifications ci-dessus (notifications de commentaires calculées à la volée depuis
  // les plans, pas de table dédiée) et des routes /notification-prefs qui ne gèrent que
  // l'envoi email/Slack.
  if (pathname === '/notification-feed' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    const [items, unread] = await Promise.all([
      db.listNotifications(env, userId),
      db.countUnreadNotifications(env, userId)
    ])
    return json({ items, unread })
  }

  const notifReadMatch = pathname.match(/^\/notification-feed\/([^/]+)\/read$/)
  if (notifReadMatch && method === 'POST') {
    const { userId } = await request.json()
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.markNotificationRead(env, userId, notifReadMatch[1])
    return json({ ok: true })
  }

  if (pathname === '/notification-feed/read-all' && method === 'POST') {
    const { userId } = await request.json()
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.markAllNotificationsRead(env, userId)
    return json({ ok: true })
  }

  // Présence d'équipe (dashboard + menu de bascule d'espace) — heartbeat périodique côté
  // client tant qu'un plan de l'équipe est ouvert, voir PlanViewer.jsx.
  if (pathname === '/team-presence/heartbeat' && method === 'POST') {
    const { teamId, userId, name, avatar } = await request.json()
    if (!teamId || !userId) return json({ error: 'teamId and userId required' }, 400)
    await db.heartbeatTeamPresence(env, { teamId, userId, name, avatar })
    return json({ ok: true })
  }

  if (pathname === '/team-presence' && method === 'GET') {
    const teamId = searchParams.get('teamId')
    if (!teamId) return json({ error: 'teamId required' }, 400)
    return json(await db.listTeamPresence(env, teamId))
  }

  if (pathname === '/team-presence' && method === 'DELETE') {
    const teamId = searchParams.get('teamId')
    const userId = searchParams.get('userId')
    if (!teamId || !userId) return json({ error: 'teamId and userId required' }, 400)
    await db.clearTeamPresence(env, teamId, userId)
    return json({ ok: true })
  }

  if (pathname === '/checkout' && method === 'POST') {
    const { userId, email, successUrl, cancelUrl, interval } = await request.json()
    if (!userId || !successUrl || !cancelUrl) {
      return json({ error: 'userId, successUrl and cancelUrl required' }, 400)
    }
    try {
      const session = await createCheckoutSession(env, { userId, email, successUrl, cancelUrl, interval })
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

  // Webhook Clerk : applique côté serveur la limite d'espaces d'équipe par plan (le
  // bouton "Créer une équipe" bloque déjà côté client, mais rien n'empêchait jusqu'ici
  // d'appeler l'API Clerk directement pour la contourner). Réagit à organization.created
  // uniquement — rejoindre une équipe via invitation n'est pas limité, on ne pénalise pas
  // quelqu'un pour un espace qu'il n'a pas créé lui-même.
  if (pathname === '/webhooks/clerk' && method === 'POST') {
    const payload = await request.text()
    if (!(await verifyClerkWebhook(payload, request.headers, env.CLERK_WEBHOOK_SECRET))) {
      return json({ error: 'invalid signature' }, 400)
    }

    const event = JSON.parse(payload)

    if (event.type === 'organization.created') {
      const org = event.data
      const creatorId = org.created_by
      if (creatorId && env.CLERK_SECRET_KEY) {
        try {
          const isPro = (await db.getCredits(env, creatorId)).isPro
          const limit = isPro ? TEAM_SPACE_LIMITS.pro : TEAM_SPACE_LIMITS.free
          const memberships = await listUserOrganizationMemberships(env, creatorId)
          if (memberships.length > limit) {
            await deleteOrganization(env, org.id)
          }
        } catch (err) {
          // Best-effort : une erreur d'appel Clerk (clé mal configurée, API indisponible)
          // ne doit pas faire échouer le webhook — Clerk réessaierait indéfiniment sinon.
          console.error('clerk webhook: team limit check failed', err)
        }
      }
    }

    return json({ received: true })
  }

  return null
}
