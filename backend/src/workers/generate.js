import { generateRoadmap } from '../lib/generator/roadmapGenerator'
import { generateMarketingStrategy } from '../lib/generator/marketingStrategyGenerator'
import { calculateKPIs } from '../lib/generator/kpiCalculator'
import { generateFinancials, generateStrategyToolkit, generateExecutiveSummary } from '../lib/generator/extendedGenerator'
import { generatePersona, classifyProduct, classificationLabel } from '../lib/engine'
import { generatePlanWithAI } from '../lib/ai/client'
import { recordUsage } from '../lib/ai/usageTracker'

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
    financials: generateFinancials(data.resources, data.market),
    strategyToolkit: generateStrategyToolkit(data.product, data.market, lang),
    executiveSummary: generateExecutiveSummary(data.product, classification, data.resources, lang)
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
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
