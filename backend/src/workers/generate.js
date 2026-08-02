import { generateRoadmap } from '../lib/generator/roadmapGenerator'
import { generateMarketingStrategy } from '../lib/generator/marketingStrategyGenerator'
import { calculateKPIs } from '../lib/generator/kpiCalculator'
import { generateFinancials, generateStrategyToolkit, generateExecutiveSummary } from '../lib/generator/extendedGenerator'
import { generatePersona, classifyProduct, classificationLabel } from '../lib/engine'
import { generatePlanWithAI } from '../lib/ai/client'
import { recordUsage } from '../lib/ai/usageTracker'
import { AGENT_RUNNERS } from '../lib/ai/agentClient'
import * as db from '../lib/db'
import { handleApi } from './api'

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

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
  } catch (error) {
    await db.updateAgentTask(env, taskId, { status: 'error', error: error.message, attempts: message.attempts })
    throw error // laisse Cloudflare Queues retenter selon max_retries
  }
}

export default {
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
      return new Response('Method not allowed', { status: 405 })
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
