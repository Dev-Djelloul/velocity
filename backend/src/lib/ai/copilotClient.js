import { callOpenRouterTool } from './openrouter'

// Copilote IA conversationnel : l'utilisateur itère sur son plan en langage naturel
// ("réduis le budget marketing de 20%") plutôt que de re-remplir le formulaire. L'IA ne
// reçoit que les sections éditables (pas tout le plan, notamment pas veille/benchmarks/
// éditorial qui sont régénérés en bloc ailleurs) et renvoie, section par section, la
// valeur COMPLÈTE mise à jour — jamais un diff — pour éviter toute divergence de forme
// avec ce qu'attendent PlanViewer et les exports.
const EDITABLE_SECTIONS = [
  'product', 'persona', 'market', 'priorities', 'classification',
  'roadmap', 'marketing', 'kpis', 'financials', 'strategyToolkit',
  'executiveSummary', 'launchDate', 'planStartDate'
]

const COPILOT_TOOL = {
  name: 'apply_plan_edits',
  description: 'Répond à la demande de l\'utilisateur sur son plan de lancement, et applique les modifications nécessaires au plan si la demande en implique.',
  input_schema: {
    type: 'object',
    properties: {
      reply: {
        type: 'string',
        description: 'Réponse conversationnelle courte (2-4 phrases max) expliquant ce qui a été fait, ou pourquoi rien ne l\'a été (question hors périmètre, demande ambiguë, information manquante...)'
      },
      changes: {
        type: 'array',
        description: `Sections du plan modifiées, uniquement si la demande implique un changement concret. Vide si c'est une question ou une demande hors périmètre. Sections valides : ${EDITABLE_SECTIONS.join(', ')}.`,
        items: {
          type: 'object',
          properties: {
            section: { type: 'string', enum: EDITABLE_SECTIONS },
            value: {
              type: 'string',
              description: 'La nouvelle valeur COMPLÈTE de cette section du plan, sérialisée en JSON, avec la même forme que la valeur actuelle et tous les champs non concernés par la demande préservés à l\'identique'
            },
            summary: { type: 'string', description: 'Description courte (5-10 mots) du changement, pour le journal d\'activité du plan' }
          },
          required: ['section', 'value', 'summary']
        }
      }
    },
    required: ['reply', 'changes']
  }
}

function lang(input) {
  return input?.lang === 'en' ? 'en' : 'fr'
}

export async function runCopilotChat(env, input) {
  const l = lang(input)
  const plan = input.plan || {}
  const relevantPlan = {}
  for (const key of EDITABLE_SECTIONS) {
    if (key in plan) relevantPlan[key] = plan[key]
  }

  const historyText = (input.history || [])
    .slice(-8)
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n')

  const systemPrompt = l === 'en'
    ? `You are an assistant embedded in a startup launch plan editor. The user talks to you in natural language to iterate on their plan (e.g. "cut marketing budget by 20%", "add a B2C persona", "make the roadmap 2 weeks shorter"). You can edit these sections: ${EDITABLE_SECTIONS.join(', ')}. Only return a change for a section you are actually modifying, and always return the FULL updated value of that section (not a diff), preserving its existing shape (same fields, same array structure) and every field the user did not ask you to change. Numbers that depend on each other (budgets, percentages, totals) must stay internally consistent after your edit. Never invent data unrelated to the request. If the request is just a question or is ambiguous, answer in "reply" and return an empty changes array.`
    : `Tu es un assistant intégré dans l'éditeur d'un plan de lancement de produit. L'utilisateur te parle en langage naturel pour itérer sur son plan (ex: "réduis le budget marketing de 20%", "ajoute un persona B2C", "raccourcis la roadmap de 2 semaines"). Tu peux éditer ces sections : ${EDITABLE_SECTIONS.join(', ')}. Ne renvoie un changement que pour une section réellement modifiée, et renvoie toujours la valeur COMPLÈTE et mise à jour de cette section (jamais un diff), en conservant sa forme actuelle (mêmes champs, même structure de tableau) et tous les champs que l'utilisateur ne t'a pas demandé de changer. Les nombres qui dépendent les uns des autres (budgets, pourcentages, totaux) doivent rester cohérents entre eux après ta modification. N'invente jamais de donnée sans rapport avec la demande. Si la demande est juste une question ou reste ambiguë, réponds dans "reply" et renvoie un tableau changes vide.`

  const userPrompt = l === 'en'
    ? `Current plan (editable sections only):\n${JSON.stringify(relevantPlan)}\n\n${historyText ? `Conversation so far:\n${historyText}\n\n` : ''}User message: ${input.message}`
    : `Plan actuel (sections éditables uniquement) :\n${JSON.stringify(relevantPlan)}\n\n${historyText ? `Conversation jusqu'ici :\n${historyText}\n\n` : ''}Message de l'utilisateur : ${input.message}`

  const result = await callOpenRouterTool(env, { systemPrompt, userPrompt, tool: COPILOT_TOOL, timeoutMs: 45000 })

  const changes = (result.changes || [])
    .filter(c => c && EDITABLE_SECTIONS.includes(c.section) && typeof c.value === 'string')
    .map(c => {
      try {
        return { section: c.section, value: JSON.parse(c.value), summary: c.summary || '' }
      } catch {
        return null
      }
    })
    .filter(Boolean)

  return { reply: result.reply || '', changes }
}
