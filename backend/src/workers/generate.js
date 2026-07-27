import { generateRoadmap } from '../lib/generator/roadmapGenerator'
import { generateMarketingStrategy } from '../lib/generator/marketingStrategyGenerator'
import { calculateKPIs } from '../lib/generator/kpiCalculator'
import { generatePersona, classifyProduct } from '../lib/engine'

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    try {
      const data = await request.json()

      const persona = generatePersona(data.market, data.product, data.priorities)
      const classification = classifyProduct(data.product, data.market)
      const roadmap = generateRoadmap(data.resources, data.product, data.priorities)
      const marketing = generateMarketingStrategy(data.market, data.priorities, data.resources?.budgetEur)
      const kpis = calculateKPIs(data.priorities, data.resources, data.market)

      return new Response(JSON.stringify({
        product: data.product,
        market: data.market,
        resources: data.resources,
        priorities: data.priorities,
        persona,
        classification,
        roadmap,
        marketing,
        kpis,
        language: data.language || 'fr',
        generatedAt: new Date().toISOString()
      }), { headers: CORS_HEADERS })
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: CORS_HEADERS
      })
    }
  }
}
