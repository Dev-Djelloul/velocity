// Helper bas niveau partagé pour tout appel OpenRouter à sortie contrainte (tool calling) —
// utilisé par la génération de plan et par les mini-outils IA (tableaux, etc.).
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
export const DEFAULT_MODEL = 'anthropic/claude-sonnet-5'

export async function callOpenRouterTool(env, { systemPrompt, userPrompt, tool, timeoutMs = 55000 }) {
  if (!env?.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY missing')
  }

  const model = env.OPENROUTER_MODEL || DEFAULT_MODEL
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: { name: tool.name, description: tool.description, parameters: tool.input_schema }
        }],
        tool_choice: { type: 'function', function: { name: tool.name } }
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
    call => call.function?.name === tool.name
  )

  if (!toolCall?.function?.arguments) {
    throw new Error('No tool call in OpenRouter response')
  }

  return JSON.parse(toolCall.function.arguments)
}
