import { generateRoadmap } from '../lib/generator/roadmapGenerator'
import { generateMarketingStrategy } from '../lib/generator/marketingStrategyGenerator'
import { calculateKPIs } from '../lib/generator/kpiCalculator'
import { generateFinancials, generateStrategyToolkit, generateExecutiveSummary } from '../lib/generator/extendedGenerator'
import { generatePersona, classifyProduct, classificationLabel } from '../lib/engine'
import { generatePlanWithAI } from '../lib/ai/client'
import { recordUsage } from '../lib/ai/usageTracker'
import { AGENT_RUNNERS } from '../lib/ai/agentClient'
import { generateVeilleWithAI } from '../lib/ai/veilleClient'
import * as db from '../lib/db'
import { handleApi, CORS_HEADERS } from './api'
import { sendEmail, agentDoneEmail, inactivityReminderEmail, veilleUpdateEmail, weeklyDigestEmail, extractHighlights, AGENT_TYPE_LABELS } from '../lib/email/resendClient'
import { sendSlackMessage, agentDoneSlackMessage, inactivityReminderSlackMessage, veilleUpdateSlackMessage, weeklyDigestSlackMessage } from '../lib/slack/slackClient'
import { triggerWebhooks } from '../lib/webhooks/webhookClient'
import { PlanCollabRoom } from '../durable/planCollabRoom'

// Réexportée pour que Wrangler trouve la classe Durable Object depuis ce module "main"
// (un seul Worker dans ce projet — pas de script_name distinct pour la binding).
export { PlanCollabRoom }

function generateWithRules(data, lang) {
  const classification = classificationLabel(classifyProduct(data.product, data.market), lang)
  return {
    persona: generatePersona(data.market, data.product, data.priorities, lang),
    classification,
    roadmap: generateRoadmap(data.resources, data.product, data.priorities, lang),
    marketing: generateMarketingStrategy(data.market, data.priorities, data.resources?.budgetEur, lang),
    kpis: calculateKPIs(data.priorities, data.resources, data.market, lang),
    financials: generateFinancials(data.resources, data.market, lang),
    strategyToolkit: generateStrategyToolkit(data.product, data.market, lang),
    executiveSummary: generateExecutiveSummary(data.product, classification, data.resources, lang)
  }
}

// Consumer de la queue d'agents IA — tourne indépendamment de toute requête HTTP.
// Un message ne porte que l'id ; toute la donnée utile est relue depuis D1, pour
// pouvoir reprendre correctement même si le Worker a été redéployé entre-temps.
async function processAgentTask(message, env) {
  const { taskId } = message.body
  const task = await db.getAgentTask(env, taskId)
  if (!task) return

  const runner = AGENT_RUNNERS[task.type]
  if (!runner) {
    await db.updateAgentTask(env, taskId, { status: 'error', error: `unknown agent type: ${task.type}`, attempts: message.attempts })
    return
  }

  await db.updateAgentTask(env, taskId, { status: 'running', attempts: message.attempts })

  try {
    const output = await runner(env, task.input)
    await db.updateAgentTask(env, taskId, { status: 'done', output, attempts: message.attempts })
    await notifyAgentDone(env, task, output)
  } catch (error) {
    await db.updateAgentTask(env, taskId, { status: 'error', error: error.message, attempts: message.attempts })
    throw error // laisse Cloudflare Queues retenter selon max_retries
  }
}

// Email best-effort à la fin d'une tâche agent — ne doit jamais faire échouer la tâche
// elle-même (déjà marquée "done" en base à ce stade).
async function notifyAgentDone(env, task, output) {
  // getAgentTask() renvoie des clés camelCase (userId/planId), pas les colonnes SQL brutes.
  const plan = await db.getPlan(env, task.planId)
  const lang = plan?.language || 'fr'

  // Les webhooks sont un canal indépendant des préférences email/Slack (pas de ligne
  // notification_prefs nécessaire pour en profiter) — déclenchés avant le early-return
  // ci-dessous, sinon un utilisateur sans préférence email/Slack configurée ne recevrait
  // jamais ses webhooks non plus.
  await triggerWebhooks(env, task.userId, 'generation.completed', {
    taskType: task.type,
    planId: task.planId,
    productName: plan?.product?.name || null
  })

  const prefs = await db.getNotificationPrefs(env, task.userId).catch(() => null)
  if (!prefs) { console.log(`[notify] skipped (agent:${task.type}): no prefs for userId=${task.userId}`); return }

  if (prefs.agent_done && prefs.email) {
    try {
      const { subject, html } = agentDoneEmail(lang, {
        productName: plan?.product?.name,
        classification: plan?.classification,
        taskType: task.type,
        output,
        appUrl: env.APP_URL
      })
      await sendEmail(env, { to: prefs.email, subject, html })
    } catch (e) { console.log(`[notify] email error (agent:${task.type}): ${e.message}`) }
  }

  if (prefs.slack_enabled && prefs.slack_webhook_url) {
    try {
      const en = lang === 'en'
      const typeLabel = AGENT_TYPE_LABELS[task.type]?.[en ? 'en' : 'fr'] || task.type
      const highlights = extractHighlights(task.type, output, en)
      const msg = agentDoneSlackMessage(lang, { productName: plan?.product?.name, taskType: task.type, typeLabel, highlights, appUrl: env.APP_URL })
      await sendSlackMessage(prefs.slack_webhook_url, msg)
    } catch (e) { console.log(`[notify] slack error (agent:${task.type}): ${e.message}`) }
  }
}

// Cron quotidien (voir wrangler.toml [triggers]) — envoie un rappel pour chaque plan
// inactif depuis 14 jours dont le propriétaire a activé ce rappel, puis marque l'envoi
// pour ne pas relancer tant que le plan reste inchangé.
async function sendInactivityReminders(env) {
  const plans = await db.getPlansNeedingInactivityReminder(env)
  for (const row of plans) {
    try {
      const plan = await db.getPlan(env, row.id)
      const lang = plan?.language || 'fr'
      const updatedAt = new Date(row.updated_at).toLocaleDateString('fr-FR')

      if (row.email) {
        const { subject, html } = inactivityReminderEmail(lang, { productName: row.product_name, updatedAt })
        await sendEmail(env, { to: row.email, subject, html }).catch(e => console.log(`[notify] reminder email error: ${e.message}`))
      }
      if (row.slack_enabled && row.slack_webhook_url) {
        const msg = inactivityReminderSlackMessage(lang, { productName: row.product_name, updatedAt, appUrl: env.APP_URL })
        await sendSlackMessage(row.slack_webhook_url, msg).catch(e => console.log(`[notify] reminder slack error: ${e.message}`))
      }
      await db.markReminderSent(env, row.id)
    } catch { /* on continue avec les plans suivants même si un envoi échoue */ }
  }
}

// Compare deux veilles et retourne les libellés apparus dans la nouvelle mais absents de
// l'ancienne (concurrents, tendances, signaux, opportunités, menaces confondus) — c'est
// cette liste qui décide si le rafraîchissement hebdomadaire mérite une notification.
function diffVeilleItems(oldVeille, newVeille) {
  const flatten = (v) => new Set([
    ...(v?.competitors || []).map(c => c.name),
    ...(v?.trends || []),
    ...(v?.signals || []),
    ...(v?.opportunities || []),
    ...(v?.threats || [])
  ].filter(Boolean))
  const before = flatten(oldVeille)
  const after = flatten(newVeille)
  return [...after].filter(item => !before.has(item))
}

// Cron hebdomadaire (voir wrangler.toml [triggers]) — ne régénère la veille QUE pour les
// plans qui en ont déjà une (générée manuellement au moins une fois) et dont le
// propriétaire a explicitement activé le rafraîchissement automatique. N'envoie une
// notification que si du contenu réellement nouveau apparaît, pour ne pas spammer chaque
// semaine sans raison. Ne touche jamais updated_at (voir db.updatePlanVeille).
async function refreshVeilleForSubscribedPlans(env) {
  const candidates = await db.getPlansForVeilleRefresh(env)
  for (const row of candidates) {
    try {
      const plan = await db.getPlan(env, row.id)
      if (!plan?.veille) continue // jamais générée manuellement : rien à rafraîchir en tâche de fond
      const lang = plan.language || 'fr'
      const fresh = await generateVeilleWithAI(plan, lang, env).catch(() => null)
      if (!fresh) continue

      const newItems = diffVeilleItems(plan.veille, fresh)
      await db.updatePlanVeille(env, row.id, fresh)
      if (!newItems.length) continue

      const prefs = await db.getNotificationPrefs(env, row.user_id)
      if (prefs?.agent_done && prefs.email) {
        const { subject, html } = veilleUpdateEmail(lang, { productName: plan.product?.name, newItems, appUrl: env.APP_URL })
        await sendEmail(env, { to: prefs.email, subject, html }).catch(e => console.log(`[notify] veille email error: ${e.message}`))
      }
      if (prefs?.slack_enabled && prefs.slack_webhook_url) {
        const msg = veilleUpdateSlackMessage(lang, { productName: plan.product?.name, newItems, appUrl: env.APP_URL })
        await sendSlackMessage(prefs.slack_webhook_url, msg).catch(e => console.log(`[notify] veille slack error: ${e.message}`))
      }
    } catch (e) { console.log(`[notify] veille refresh error (plan ${row.id}): ${e.message}`) }
  }
}

function flattenStories(roadmap) {
  return (roadmap?.sprints || []).flatMap(sp => sp.stories || [])
}

// Heuristique volontairement simple pour compter les stories terminées CETTE semaine :
// scanne le changeLog (rempli côté client par markChanged() dans PlanViewer.jsx) sur les 7
// derniers jours, à la recherche d'entrées "story:ID" dont le détail contient un passage de
// statut vers Terminé/Done. Peut compter deux fois une même story si son statut a été
// modifié plusieurs fois dans la semaine (ex: Done → À faire → Done) — acceptable pour un
// digest indicatif, pas une source de vérité comptable.
function countStoriesCompletedThisWeek(changeLog, sevenDaysAgo) {
  let count = 0
  for (const entry of changeLog || []) {
    if (!entry.date || new Date(entry.date) < sevenDaysAgo) continue
    for (const change of entry.changes || entry.sections || []) {
      if (typeof change === 'string') continue
      if (change.section?.startsWith('story:') && /→\s*(Terminé|Done)/i.test(change.detail || '')) count++
    }
  }
  return count
}

// Cron hebdomadaire (voir wrangler.toml [triggers]) — digest actif pour les plans modifiés
// récemment (par opposition au rappel d'inactivité, qui cible l'inverse). Purement
// informatif : ne touche jamais updated_at ni reminder_sent_at.
async function sendWeeklyDigests(env) {
  const plans = await db.getPlansForWeeklyDigest(env)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  for (const row of plans) {
    try {
      const plan = row.data
      const lang = plan.language || 'fr'
      const stories = flattenStories(plan.roadmap)
      const doneStories = stories.filter(s => s.status === 'done')
      const totalCost = stories.reduce((sum, s) => sum + (s.cost || 0), 0)
      const doneCost = doneStories.reduce((sum, s) => sum + (s.cost || 0), 0)
      const budgetPct = totalCost > 0 ? Math.round((doneCost / totalCost) * 100) : null
      const storiesCompletedThisWeek = countStoriesCompletedThisWeek(plan.changeLog, sevenDaysAgo)
      const commentsThisWeek = (plan.comments || []).filter(c => c.createdAt && new Date(c.createdAt) >= sevenDaysAgo).length

      // Rien à raconter cette semaine (plan "actif" au sens updated_at mais sans mouvement
      // concret sur roadmap/commentaires) : un digest vide serait juste du bruit.
      if (!stories.length && !commentsThisWeek) continue

      const payload = {
        productName: plan.product?.name,
        doneStories: doneStories.length,
        totalStories: stories.length,
        storiesCompletedThisWeek,
        budgetPct,
        commentsThisWeek,
        appUrl: env.APP_URL
      }

      if (row.email) {
        const { subject, html } = weeklyDigestEmail(lang, payload)
        await sendEmail(env, { to: row.email, subject, html }).catch(e => console.log(`[notify] digest email error: ${e.message}`))
      }
      if (row.slack_enabled && row.slack_webhook_url) {
        const msg = weeklyDigestSlackMessage(lang, payload)
        await sendSlackMessage(row.slack_webhook_url, msg).catch(e => console.log(`[notify] digest slack error: ${e.message}`))
      }
    } catch (e) { console.log(`[notify] digest error (plan ${row.id}): ${e.message}`) }
  }
}

export default {
  async scheduled(event, env) {
    // Trois crons distincts (voir wrangler.toml [triggers]) partagent ce handler ;
    // event.cron correspond exactement à l'expression qui a déclenché l'appel.
    if (event.cron === '0 8 * * 1') {
      await refreshVeilleForSubscribedPlans(env)
      return
    }
    if (event.cron === '0 9 * * 1') {
      await sendWeeklyDigests(env)
      return
    }
    await sendInactivityReminders(env)
  },

  async queue(batch, env) {
    for (const message of batch.messages) {
      try {
        await processAgentTask(message, env)
        message.ack()
      } catch {
        message.retry()
      }
    }
  },

  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    const url = new URL(request.url)

    // Collaboration temps réel : une Durable Object par plan (adressée par nom = planId),
    // qui relaie les mises à jour Yjs entre tous les clients connectés — voir
    // src/durable/planCollabRoom.js. Interceptée avant handleApi() car c'est un upgrade
    // WebSocket, pas une requête JSON classique.
    if (url.pathname.startsWith('/collab/')) {
      const planId = url.pathname.slice('/collab/'.length)
      if (!planId) return new Response('planId required', { status: 400 })
      const roomUrl = new URL(request.url)
      roomUrl.searchParams.set('planId', planId)
      const id = env.PLAN_COLLAB.idFromName(planId)
      return env.PLAN_COLLAB.get(id).fetch(new Request(roomUrl, request))
    }

    if (url.pathname !== '/' && url.pathname !== '') {
      const apiResponse = await handleApi(request, env, url)
      if (apiResponse) return apiResponse
    }

    if (request.method !== 'POST') {
      // Sans les en-têtes CORS ici, toute route GET non reconnue (ex: appelée avant son
      // déploiement, ou tout simplement inexistante) échoue côté navigateur avec une
      // erreur CORS opaque au lieu du vrai code 405 — piégeant à déboguer.
      return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
    }

    try {
      const data = await request.json()
      const lang = data.language || 'fr'

      // L'IA est le chemin par défaut ; le moteur à règles est le filet de sécurité
      // (clé API absente, erreur réseau, timeout, sortie invalide).
      let generated
      let source = 'rules'
      try {
        generated = await generatePlanWithAI(data, env)
        source = 'ai'
      } catch (aiError) {
        generated = generateWithRules(data, lang)
      }

      if (source === 'ai') {
        try { await recordUsage(env) } catch { /* le suivi d'usage ne doit jamais faire échouer la génération */ }
      }

      return new Response(JSON.stringify({
        product: data.product,
        market: data.market,
        resources: data.resources,
        priorities: data.priorities,
        ...generated,
        language: lang,
        generatedAt: new Date().toISOString(),
        generatedBy: source
      }), { headers: CORS_HEADERS })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: CORS_HEADERS
      })
    }
  }
}
