import { callOpenRouterTool } from './openrouter'

// Résumé hebdomadaire cross-plans pour la carte "Nova" du Dashboard principal — ne reçoit
// que des statistiques agrégées déjà calculées côté client (compte de stories par statut,
// sprints en retard, échéances à venir, budgets), jamais les plans complets : ce résumé
// couvre potentiellement plusieurs espaces à la fois, envoyer chaque plan en entier serait
// à la fois inutilement lourd et hors sujet (Nova n'a pas besoin du persona ou de la veille
// pour dire "2 sprints en retard cette semaine").
function weeklySummaryTool(l) {
  return l === 'en' ? {
    name: 'produce_weekly_summary',
    description: 'Writes a short executive summary of the week across all of the user\'s launch plans',
    input_schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: '3-4 sentences IN ENGLISH, direct and concrete: what moved forward, what is at risk or overdue, what needs attention next — never generic filler, always grounded in the numbers provided.'
        }
      },
      required: ['summary']
    }
  } : {
    name: 'produce_weekly_summary',
    description: 'Rédige un court résumé exécutif de la semaine sur l\'ensemble des plans de lancement de l\'utilisateur',
    input_schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: '3 à 4 phrases EN FRANÇAIS, directes et concrètes : ce qui a avancé, ce qui est en retard ou à risque, ce qui mérite attention ensuite — jamais de généralité vague, toujours ancré dans les chiffres fournis.'
        }
      },
      required: ['summary']
    }
  }
}

const SYSTEM_PROMPT_FR = 'Tu es Nova, le copilote IA de VelocityLaunch. Tu écris un résumé exécutif hebdomadaire cross-plans pour un fondateur ou une équipe produit, à partir de statistiques agrégées (jamais le détail des plans). Ton direct, factuel, orienté action — pas de compliment vague ni de synthèse creuse. Si les chiffres sont bons, dis-le brièvement ; si quelque chose est en retard ou à risque, nomme-le précisément.'
const SYSTEM_PROMPT_EN = 'You are Nova, VelocityLaunch\'s AI copilot. You write a weekly executive summary across all plans for a founder or product team, from aggregated stats (never full plan detail). Direct, factual, action-oriented tone — no vague praise, no empty synthesis. If the numbers are good, say so briefly; if something is late or at risk, name it precisely.'

function buildUserPrompt(stats, lang) {
  return lang === 'en'
    ? `Aggregated stats for the week, across the user's plans:\n${JSON.stringify(stats, null, 2)}\n\nWrite the summary.`
    : `Statistiques agrégées de la semaine, tous plans confondus :\n${JSON.stringify(stats, null, 2)}\n\nRédige le résumé.`
}

export async function generateWeeklySummary(env, { stats, lang }) {
  const l = lang === 'en' ? 'en' : 'fr'
  return callOpenRouterTool(env, {
    systemPrompt: l === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_FR,
    userPrompt: buildUserPrompt(stats, l),
    tool: weeklySummaryTool(l),
    timeoutMs: 25000
  })
}
