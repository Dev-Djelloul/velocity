import { generateRoadmap } from '../lib/generator/roadmapGenerator'
import { generateMarketingStrategy } from '../lib/generator/marketingStrategyGenerator'
import { calculateKPIs } from '../lib/generator/kpiCalculator'
import { generateFinancials, generateStrategyToolkit, generateExecutiveSummary } from '../lib/generator/extendedGenerator'
import { generatePersona, classifyProduct, classificationLabel } from '../lib/engine'
import { generatePlanWithAI } from '../lib/ai/client'
import { recordUsage } from '../lib/ai/usageTracker'
import { AGENT_RUNNERS } from '../lib/ai/agentClient'
import * as db from '../lib/db'
import { handleApi, CORS_HEADERS } from './api'
import { sendEmail, agentDoneEmail, inactivityReminderEmail } from '../lib/email/resendClient'

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
    await notifyAgentDone(env, task)
  } catch (error) {
    await db.updateAgentTask(env, taskId, { status: 'error', error: error.message, attempts: message.attempts })
    throw error // laisse Cloudflare Queues retenter selon max_retries
  }
}

// Email best-effort à la fin d'une tâche agent — ne doit jamais faire échouer la tâche
// elle-même (déjà marquée "done" en base à ce stade).
async function notifyAgentDone(env, task) {
  try {
    const prefs = await db.getNotificationPrefs(env, task.user_id)
    if (!prefs?.agent_done || !prefs.email) {
      console.log(`[notify] skipped (agent:${task.type}): user_id=${task.user_id} agent_done=${prefs?.agent_done} email=${prefs?.email}`)
      return
    }
    const plan = await db.getPlan(env, task.plan_id)
    const { subject, html } = agentDoneEmail(plan?.language || 'fr', {
      productName: plan?.product?.name,
      taskType: task.type
    })
    await sendEmail(env, { to: prefs.email, subject, html })
  } catch (e) { console.log(`[notify] error (agent:${task.type}): ${e.message}`) }
}

// Cron quotidien (voir wrangler.toml [triggers]) — envoie un rappel pour chaque plan
// inactif depuis 14 jours dont le propriétaire a activé ce rappel, puis marque l'envoi
// pour ne pas relancer tant que le plan reste inchangé.
async function sendInactivityReminders(env) {
  const plans = await db.getPlansNeedingInactivityReminder(env)
  for (const row of plans) {
    try {
      const plan = await db.getPlan(env, row.id)
      const { subject, html } = inactivityReminderEmail(plan?.language || 'fr', {
        productName: row.product_name,
        updatedAt: new Date(row.updated_at).toLocaleDateString('fr-FR')
      })
      await sendEmail(env, { to: row.email, subject, html })
      await db.markReminderSent(env, row.id)
    } catch { /* on continue avec les plans suivants même si un envoi échoue */ }
  }
}

export default {
  async scheduled(event, env) {
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
