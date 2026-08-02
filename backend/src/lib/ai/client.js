import { PLAN_GENERATION_TOOL } from './planSchema'
import { brandVoicePrompt } from './brandVoice'

// OpenRouter — API compatible OpenAI (chat completions + function calling),
// donne accès à Claude et à d'autres modèles via une seule clé et un seul provider.
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'anthropic/claude-sonnet-5'
// La génération complète (roadmap + marketing + KPIs, sortie structurée volumineuse)
// prend régulièrement 30-45s avec ce modèle — marge au-delà de ce qui est observé en pratique.
const REQUEST_TIMEOUT_MS = 55000

function buildUserPrompt(data) {
  const { product, market, resources, priorities, context } = data
  const lines = [
    'Génère le plan de lancement pour ce produit, à partir de ces réponses au questionnaire :',
    '',
    `Produit : ${product?.name} (stade : ${product?.stage}, catégorie : ${product?.category})`,
    `Pitch : ${product?.pitch}`,
    `USP : ${product?.usp}`,
    `Cible : ${product?.targetUser}`,
    '',
    `Marché : ${market?.geography}, ${market?.b2bVsB2c}, segment "${market?.segment}"`,
    `Taille d'audience : ${market?.audienceSize}, concurrence : ${market?.competition}`,
    '',
    `Ressources : timeline ${resources?.timelineWeeks}, budget ${resources?.budgetEur}, équipe ${resources?.teamSize}`,
    `Rôles présents : ${(resources?.rolesPresent || []).join(', ')}`,
    '',
    `Priorités : focus ${priorities?.focus}, engagement ${priorities?.engagement}, risque connu ${priorities?.riskKnown}`,
    `Métrique de succès : ${priorities?.successMetric}`
  ]

  if (context && context.trim()) {
    lines.push('', `Contexte additionnel fourni par le fondateur : ${context.trim()}`)
  }

  return lines.join('\n')
}

export async function generatePlanWithAI(data, env) {
  if (!env?.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY missing')
  }

  const lang = data.language || 'fr'
  const model = env.OPENROUTER_MODEL || DEFAULT_MODEL

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response
  try {
    response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://velocity.digitalblueskye.com',
        'X-Title': 'VelocityLaunch'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: brandVoicePrompt(lang) },
          { role: 'user', content: buildUserPrompt(data) }
        ],
        tools: [{
          type: 'function',
          function: {
            name: PLAN_GENERATION_TOOL.name,
            description: PLAN_GENERATION_TOOL.description,
            parameters: PLAN_GENERATION_TOOL.input_schema
          }
        }],
        tool_choice: { type: 'function', function: { name: PLAN_GENERATION_TOOL.name } }
      }),
      signal: controller.signal
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`OpenRouter API error ${response.status}: ${body.slice(0, 300)}`)
  }

  const result = await response.json()
  const toolCall = result.choices?.[0]?.message?.tool_calls?.find(
    call => call.function?.name === PLAN_GENERATION_TOOL.name
  )

  if (!toolCall?.function?.arguments) {
    throw new Error('No tool call in OpenRouter response')
  }

  return JSON.parse(toolCall.function.arguments)
}
