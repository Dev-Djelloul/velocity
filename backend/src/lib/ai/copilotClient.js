import { callOpenRouterTool } from './openrouter'

// Copilote IA conversationnel : l'utilisateur itère sur son plan en langage naturel
// ("réduis le budget marketing de 20%") plutôt que de re-remplir le formulaire. L'IA ne
// reçoit que les sections éditables (pas tout le plan, notamment pas veille/benchmarks/
// éditorial qui sont régénérés en bloc ailleurs) et renvoie, section par section, la
// valeur COMPLÈTE mise à jour — jamais un diff — pour éviter toute divergence de forme
// avec ce qu'attendent PlanViewer et les exports.
const EDITABLE_SECTIONS = [
  'product', 'persona', 'personas', 'market', 'priorities', 'classification',
  'resources', 'roadmap', 'marketing', 'kpis', 'financials', 'strategyToolkit',
  'executiveSummary', 'launchDate', 'planStartDate'
]

// Forme attendue par section — PersonaCard, RoadmapCard, etc. lisent ces champs avec une
// forme fixe (ex: PersonaCard.jsx détruit directement les props d'un objet unique) ; un
// changement dont la forme ne correspond pas casserait silencieusement l'affichage (persona
// envoyé comme liste, kpis envoyé comme objet...). On le rejette ici plutôt que de laisser
// l'IA corrompre le plan, quoi qu'elle ait promis dans "reply". "persona" reste l'unique
// persona principal (objet, forme historique inchangée — exports PDF/PPTX/Notion s'y
// appuient) ; "personas" est un tableau optionnel de personas additionnels, chacun avec la
// même forme, affiché par PlanViewer à côté du persona principal.
const SECTION_SHAPE = {
  product: 'object',
  persona: 'object',
  personas: 'array',
  market: 'object',
  priorities: 'object',
  classification: 'string',
  resources: 'object',
  roadmap: 'object',
  marketing: 'object',
  kpis: 'array',
  financials: 'object',
  strategyToolkit: 'object',
  executiveSummary: 'string',
  launchDate: 'string',
  planStartDate: 'string'
}

function shapeMatches(section, value) {
  const expected = SECTION_SHAPE[section]
  if (!expected) return true
  if (expected === 'array') return Array.isArray(value)
  if (expected === 'object') return !!value && typeof value === 'object' && !Array.isArray(value)
  if (expected === 'string') return typeof value === 'string'
  return true
}

// Le schéma de l'outil est lui-même envoyé au modèle comme partie du prompt — le laisser
// toujours en français biaisait la langue de "reply"/"summary" même quand le system prompt
// était en anglais (lang === 'en'). Généré par langue pour rester cohérent avec l'UI.
function copilotTool(l) {
  return l === 'en' ? {
    name: 'apply_plan_edits',
    description: 'Responds to the user\'s request about their launch plan, and applies the necessary changes to the plan if the request implies any.',
    input_schema: {
      type: 'object',
      properties: {
        reply: {
          type: 'string',
          description: 'Short conversational reply (2-4 sentences max) IN ENGLISH explaining what was done, or why nothing was — never write this field in any other language.'
        },
        changes: {
          type: 'array',
          description: `Plan sections that were modified, only if the request implies a concrete change. Empty if it's a question or an out-of-scope request. Valid sections: ${EDITABLE_SECTIONS.join(', ')}.`,
          items: {
            type: 'object',
            properties: {
              section: { type: 'string', enum: EDITABLE_SECTIONS },
              value: {
                type: 'string',
                description: 'The new, COMPLETE value of this plan section, serialized as JSON, with the same shape as the current value and every field not concerned by the request preserved as-is'
              },
              summary: { type: 'string', description: 'Short description (5-10 words) IN ENGLISH of the change, for the plan\'s activity log — never write this field in any other language.' }
            },
            required: ['section', 'value', 'summary']
          }
        }
      },
      required: ['reply', 'changes']
    }
  } : {
    name: 'apply_plan_edits',
    description: 'Répond à la demande de l\'utilisateur sur son plan de lancement, et applique les modifications nécessaires au plan si la demande en implique.',
    input_schema: {
      type: 'object',
      properties: {
        reply: {
          type: 'string',
          description: 'Réponse conversationnelle courte (2-4 phrases max) EN FRANÇAIS expliquant ce qui a été fait, ou pourquoi rien ne l\'a été — n\'écris jamais ce champ dans une autre langue.'
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
              summary: { type: 'string', description: 'Description courte (5-10 mots) EN FRANÇAIS du changement, pour le journal d\'activité du plan — n\'écris jamais ce champ dans une autre langue.' }
            },
            required: ['section', 'value', 'summary']
          }
        }
      },
      required: ['reply', 'changes']
    }
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
    ? `You are an assistant embedded in a startup launch plan editor. The user talks to you in natural language to iterate on their plan (e.g. "cut marketing budget by 20%", "add a B2C persona", "make the roadmap 2 weeks shorter", "set the team to 10 people"). You can edit these sections: ${EDITABLE_SECTIONS.join(', ')}. Only return a change for a section you are actually modifying, and always return the FULL updated value of that section (not a diff), preserving its existing shape EXACTLY: "persona" is the single primary persona object (never turn it into a list — keep it as-is unless the user explicitly asks to change or replace the primary persona), "personas" is a separate array for ADDITIONAL personas (each item has the same fields as "persona": name, gender, title, ageRange, context, painPoints, goals, quote, preferredChannel, buyingTrigger) — when asked to add a persona, append a new full object to "personas" (creating the array if it doesn't exist yet) and leave "persona" untouched, "kpis" is an array, "resources" is an object with fields timelineWeeks (one of: w2, w4, w8, w12, w16, w26, w36, w52 — respectively 2, 4, 8, 12, 16 weeks, 6, 9, 12 months), totalBudget and budgetEur (each one of: b500, b1k, b2k, b5k, b10k, b25k, b50k, b100k — respectively €500, €1k, €2k, €5k, €10k, €25k, €50k, €100k+), teamSize (one of: solo, small [2-3], medium [4-6], large [7+], xlarge [10-20], xxlarge [20+]), and rolesPresent (array of strings) — always pick the CLOSEST valid key to what the user asked for, never invent a new key or use a raw number for these four fields, all other sections are a single object or string as given. Keep every field the user did not ask you to change, and every field the current value already has. Numbers that depend on each other (budgets, percentages, totals) must stay internally consistent after your edit — in particular, "marketing.totalBudget" is only the marketing share of the launch (a plain number in euros, unlike "resources.budgetEur" which is an enum key), while "financials.costBreakdown" must sum to the TOTAL launch budget (all cost categories included); if you change "resources.totalBudget" or "marketing.totalBudget", check whether "financials.costBreakdown" needs a matching update to stay coherent; likewise, if you change "resources.timelineWeeks", check whether "roadmap" durations need adjusting to still fit the new timeline. Never invent data unrelated to the request. If the request is just a question or is ambiguous, answer in "reply" and return an empty changes array. IMPORTANT: write "reply" and every "summary" in ENGLISH, regardless of the language the user wrote their message in.`
    : `Tu es un assistant intégré dans l'éditeur d'un plan de lancement de produit. L'utilisateur te parle en langage naturel pour itérer sur son plan (ex: "réduis le budget marketing de 20%", "ajoute un persona B2C", "raccourcis la roadmap de 2 semaines", "passe l'équipe à 10 personnes"). Tu peux éditer ces sections : ${EDITABLE_SECTIONS.join(', ')}. Ne renvoie un changement que pour une section réellement modifiée, et renvoie toujours la valeur COMPLÈTE et mise à jour de cette section (jamais un diff), en conservant EXACTEMENT sa forme actuelle : "persona" est l'unique persona principal, un objet (ne le transforme jamais en liste — laisse-le inchangé sauf si l'utilisateur demande explicitement de modifier ou remplacer le persona principal), "personas" est un tableau SÉPARÉ pour les personas ADDITIONNELS (chaque élément a les mêmes champs que "persona" : name, gender, title, ageRange, context, painPoints, goals, quote, preferredChannel, buyingTrigger) — quand on te demande d'ajouter un persona, ajoute un objet complet au tableau "personas" (crée le tableau s'il n'existe pas encore) et laisse "persona" inchangé, "kpis" est un tableau, "resources" est un objet avec les champs timelineWeeks (une valeur parmi : w2, w4, w8, w12, w16, w26, w36, w52 — respectivement 2, 4, 8, 12, 16 semaines, 6, 9, 12 mois), totalBudget et budgetEur (une valeur parmi : b500, b1k, b2k, b5k, b10k, b25k, b50k, b100k — respectivement 500€, 1k€, 2k€, 5k€, 10k€, 25k€, 50k€, 100k€+), teamSize (une valeur parmi : solo, small [2-3], medium [4-6], large [7+], xlarge [10-20], xxlarge [20+]), et rolesPresent (tableau de chaînes) — choisis toujours la clé valide la PLUS PROCHE de ce que demande l'utilisateur, n'invente jamais de nouvelle clé et n'utilise jamais un nombre brut pour ces quatre champs, toutes les autres sections sont un objet unique ou une chaîne comme fourni. Conserve tous les champs que l'utilisateur ne t'a pas demandé de changer, et tous ceux déjà présents dans la valeur actuelle. Les nombres qui dépendent les uns des autres (budgets, pourcentages, totaux) doivent rester cohérents entre eux après ta modification — en particulier, "marketing.totalBudget" n'est que la part marketing du lancement (un nombre brut en euros, contrairement à "resources.budgetEur" qui est une clé énumérée), tandis que "financials.costBreakdown" doit sommer au budget TOTAL du lancement (tous postes confondus) ; si tu modifies "resources.totalBudget" ou "marketing.totalBudget", vérifie si "financials.costBreakdown" doit être ajusté en cohérence ; de même, si tu modifies "resources.timelineWeeks", vérifie si les durées de "roadmap" doivent être adaptées pour rester cohérentes avec le nouveau délai. N'invente jamais de donnée sans rapport avec la demande. Si la demande est juste une question ou reste ambiguë, réponds dans "reply" et renvoie un tableau changes vide. IMPORTANT : écris "reply" et chaque "summary" EN FRANÇAIS, quelle que soit la langue utilisée par l'utilisateur dans son message.`

  const userPrompt = l === 'en'
    ? `Current plan (editable sections only):\n${JSON.stringify(relevantPlan)}\n\n${historyText ? `Conversation so far:\n${historyText}\n\n` : ''}User message: ${input.message}`
    : `Plan actuel (sections éditables uniquement) :\n${JSON.stringify(relevantPlan)}\n\n${historyText ? `Conversation jusqu'ici :\n${historyText}\n\n` : ''}Message de l'utilisateur : ${input.message}`

  const result = await callOpenRouterTool(env, { systemPrompt, userPrompt, tool: copilotTool(l), timeoutMs: 45000 })

  const rejectedSections = []
  const changes = (result.changes || [])
    .filter(c => c && EDITABLE_SECTIONS.includes(c.section) && typeof c.value === 'string')
    .map(c => {
      let parsed
      try {
        parsed = JSON.parse(c.value)
      } catch {
        return null
      }
      if (!shapeMatches(c.section, parsed)) {
        rejectedSections.push(c.section)
        return null
      }
      return { section: c.section, value: parsed, summary: c.summary || '' }
    })
    .filter(Boolean)

  let reply = result.reply || ''
  if (rejectedSections.length) {
    reply += l === 'en'
      ? ` (I could not apply the change to ${rejectedSections.join(', ')} — its shape didn't match what this app expects, so I left it untouched to avoid breaking your plan.)`
      : ` (Je n'ai pas pu appliquer le changement sur ${rejectedSections.join(', ')} — sa forme ne correspondait pas à ce qu'attend l'application, je l'ai laissé inchangé pour ne pas casser votre plan.)`
  }

  return { reply, changes }
}
