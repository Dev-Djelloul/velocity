import { callOpenRouterTool } from './openrouter'

// Deux premières actions d'agent : rédiger un brief d'exécution détaillé pour une
// story, et recalculer les cibles KPI à partir de l'avancement réel du roadmap.
// Chaque type a son propre schéma de sortie contraint, comme la génération de plan.

// Comme pour copilotClient.js : le schéma de l'outil fait partie du prompt envoyé au
// modèle, donc le laisser toujours en français biaisait la langue des textes générés
// (summary, steps, risks, rationale...) même quand le system prompt était en anglais.
// Généré par langue pour rester cohérent avec l'UI — ces textes finissent en commentaires,
// entrées d'historique et suggestions de changement affichés à l'utilisateur.
function briefTool(l) {
  return l === 'en' ? {
    name: 'generate_execution_brief',
    description: 'Writes a detailed, actionable execution brief for a roadmap story',
    input_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'One-sentence summary of the brief, IN ENGLISH.' },
        steps: { type: 'array', items: { type: 'string' }, description: '4 to 6 concrete, ordered steps to complete this story, IN ENGLISH.' },
        resourcesNeeded: { type: 'array', items: { type: 'string' }, description: '2-3 resources or tools needed, IN ENGLISH.' },
        risks: { type: 'array', items: { type: 'string' }, description: '1-2 potential blockers to anticipate, IN ENGLISH.' }
      },
      required: ['summary', 'steps', 'resourcesNeeded', 'risks']
    }
  } : {
    name: 'generate_execution_brief',
    description: 'Rédige un brief d\'exécution détaillé et actionnable pour une story de roadmap',
    input_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'Résumé du brief en une phrase, EN FRANÇAIS.' },
        steps: { type: 'array', items: { type: 'string' }, description: '4 à 6 étapes concrètes et ordonnées pour réaliser cette story, EN FRANÇAIS.' },
        resourcesNeeded: { type: 'array', items: { type: 'string' }, description: '2-3 ressources ou outils nécessaires, EN FRANÇAIS.' },
        risks: { type: 'array', items: { type: 'string' }, description: '1-2 blocages potentiels à anticiper, EN FRANÇAIS.' }
      },
      required: ['summary', 'steps', 'resourcesNeeded', 'risks']
    }
  }
}

function riskAnalysisTool(l) {
  return l === 'en' ? {
    name: 'analyze_plan_risks',
    description: 'Identifies the launch plan\'s top current risks and proposes a concrete mitigation for each',
    input_schema: {
      type: 'object',
      properties: {
        risks: {
          type: 'array',
          description: '3 to 5 real risks specific to this plan (not generic), IN ENGLISH, sorted from most to least critical',
          items: {
            type: 'object',
            properties: {
              risk: { type: 'string', description: 'The risk, precisely worded, IN ENGLISH.' },
              severity: { type: 'string', enum: ['high', 'medium', 'low'] },
              mitigation: { type: 'string', description: 'One concrete action to reduce it, IN ENGLISH.' }
            },
            required: ['risk', 'severity', 'mitigation']
          }
        }
      },
      required: ['risks']
    }
  } : {
    name: 'analyze_plan_risks',
    description: 'Identifie les risques prioritaires du plan de lancement à date et propose une mitigation concrète pour chacun',
    input_schema: {
      type: 'object',
      properties: {
        risks: {
          type: 'array',
          description: '3 à 5 risques réels et spécifiques à ce plan (pas génériques), EN FRANÇAIS, triés du plus critique au moins critique',
          items: {
            type: 'object',
            properties: {
              risk: { type: 'string', description: 'Le risque, formulé précisément, EN FRANÇAIS.' },
              severity: { type: 'string', enum: ['high', 'medium', 'low'] },
              mitigation: { type: 'string', description: 'Une action concrète pour le réduire, EN FRANÇAIS.' }
            },
            required: ['risk', 'severity', 'mitigation']
          }
        }
      },
      required: ['risks']
    }
  }
}

function budgetOptimizationTool(l) {
  return l === 'en' ? {
    name: 'optimize_marketing_budget',
    description: 'Analyzes the current marketing budget split by channel and proposes a justified reallocation',
    input_schema: {
      type: 'object',
      properties: {
        assessment: { type: 'string', description: 'One-sentence verdict on the current split, IN ENGLISH.' },
        moves: {
          type: 'array',
          description: '2 to 4 concrete budget moves (channel, direction, why), IN ENGLISH.',
          items: {
            type: 'object',
            properties: {
              channel: { type: 'string' },
              direction: { type: 'string', enum: ['increase', 'decrease', 'maintain'] },
              rationale: { type: 'string', description: 'IN ENGLISH.' }
            },
            required: ['channel', 'direction', 'rationale']
          }
        }
      },
      required: ['assessment', 'moves']
    }
  } : {
    name: 'optimize_marketing_budget',
    description: 'Analyse la répartition actuelle du budget marketing par canal et propose une réallocation argumentée',
    input_schema: {
      type: 'object',
      properties: {
        assessment: { type: 'string', description: 'Verdict en une phrase sur la répartition actuelle, EN FRANÇAIS.' },
        moves: {
          type: 'array',
          description: '2 à 4 mouvements de budget concrets (canal, sens, pourquoi), EN FRANÇAIS.',
          items: {
            type: 'object',
            properties: {
              channel: { type: 'string' },
              direction: { type: 'string', enum: ['increase', 'decrease', 'maintain'] },
              rationale: { type: 'string', description: 'EN FRANÇAIS.' }
            },
            required: ['channel', 'direction', 'rationale']
          }
        }
      },
      required: ['assessment', 'moves']
    }
  }
}

function kpiRecalcTool(l) {
  return l === 'en' ? {
    name: 'recalculate_kpi_targets',
    description: 'Reassesses KPI targets based on the roadmap\'s real progress (stories done, time elapsed)',
    input_schema: {
      type: 'object',
      properties: {
        kpis: {
          type: 'array',
          description: 'One object per existing KPI, in the same order as provided',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              newTarget: { type: ['number', 'null'], description: 'New adjusted target, or null if unchanged' },
              rationale: { type: 'string', description: 'One sentence explaining the adjustment (or why unchanged), IN ENGLISH.' }
            },
            required: ['name', 'newTarget', 'rationale']
          }
        }
      },
      required: ['kpis']
    }
  } : {
    name: 'recalculate_kpi_targets',
    description: 'Réévalue les cibles KPI à partir de l\'avancement réel du roadmap (stories terminées, temps écoulé)',
    input_schema: {
      type: 'object',
      properties: {
        kpis: {
          type: 'array',
          description: 'Un objet par KPI existant, dans le même ordre que fourni',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              newTarget: { type: ['number', 'null'], description: 'Nouvelle cible ajustée, ou null si inchangée' },
              rationale: { type: 'string', description: 'Une phrase expliquant l\'ajustement (ou pourquoi inchangé), EN FRANÇAIS.' }
            },
            required: ['name', 'newTarget', 'rationale']
          }
        }
      },
      required: ['kpis']
    }
  }
}

function lang(input) {
  return input?.lang === 'en' ? 'en' : 'fr'
}

export async function runStoryBrief(env, input) {
  const l = lang(input)
  const systemPrompt = l === 'en'
    ? 'You write clear, actionable execution briefs for startup roadmap stories. Be specific to the product and story described, never generic. Write every text field in ENGLISH, regardless of the language of the product/story description.'
    : 'Tu rédiges des briefs d\'exécution clairs et actionnables pour des stories de roadmap de startup. Sois spécifique au produit et à la story décrits, jamais générique. Écris chaque champ texte EN FRANÇAIS, quelle que soit la langue de la description du produit/de la story.'

  const userPrompt = l === 'en'
    ? `Product: ${input.productName} — ${input.productPitch}\nStory: "${input.storyTitle}"\nContext: ${input.storyDescription}\nAssignee role: ${input.assignee}`
    : `Produit : ${input.productName} — ${input.productPitch}\nStory : "${input.storyTitle}"\nContexte : ${input.storyDescription}\nRôle assigné : ${input.assignee}`

  return callOpenRouterTool(env, { systemPrompt, userPrompt, tool: briefTool(l), timeoutMs: 25000 })
}

export async function runKpiRecalc(env, input) {
  const l = lang(input)
  const systemPrompt = l === 'en'
    ? 'You are a startup operator recalibrating KPI targets based on real progress. Be realistic, not optimistic. Write every text field in ENGLISH.'
    : 'Tu es un opérateur startup qui recalibre des cibles KPI à partir de l\'avancement réel. Sois réaliste, pas optimiste. Écris chaque champ texte EN FRANÇAIS.'

  const userPrompt = l === 'en'
    ? `Product: ${input.productName}\nRoadmap progress: ${input.doneStories}/${input.totalStories} stories done, ${input.elapsedWeeks}/${input.totalWeeks} weeks elapsed.\nCurrent KPIs: ${JSON.stringify(input.kpis)}`
    : `Produit : ${input.productName}\nAvancement roadmap : ${input.doneStories}/${input.totalStories} stories terminées, ${input.elapsedWeeks}/${input.totalWeeks} semaines écoulées.\nKPIs actuels : ${JSON.stringify(input.kpis)}`

  return callOpenRouterTool(env, { systemPrompt, userPrompt, tool: kpiRecalcTool(l), timeoutMs: 25000 })
}

export async function runRiskAnalysis(env, input) {
  const l = lang(input)
  const systemPrompt = l === 'en'
    ? 'You are a startup operator doing a sober risk assessment of a launch plan. Be specific to what is described, never generic boilerplate risks. Write every text field in ENGLISH.'
    : 'Tu es un opérateur startup qui fait une évaluation lucide des risques d\'un plan de lancement. Sois spécifique à ce qui est décrit, jamais des risques génériques passe-partout. Écris chaque champ texte EN FRANÇAIS.'

  const userPrompt = l === 'en'
    ? `Product: ${input.productName} — ${input.productPitch}\nMarket: ${input.market}\nTimeline: ${input.totalWeeks} weeks, team: ${input.teamSize}, budget: €${input.budget}\nRoadmap progress: ${input.doneStories}/${input.totalStories} stories done.`
    : `Produit : ${input.productName} — ${input.productPitch}\nMarché : ${input.market}\nDélai : ${input.totalWeeks} semaines, équipe : ${input.teamSize}, budget : ${input.budget}€\nAvancement roadmap : ${input.doneStories}/${input.totalStories} stories terminées.`

  return callOpenRouterTool(env, { systemPrompt, userPrompt, tool: riskAnalysisTool(l), timeoutMs: 25000 })
}

export async function runBudgetOptimization(env, input) {
  const l = lang(input)
  const systemPrompt = l === 'en'
    ? 'You are a growth marketer reviewing a channel budget split. Be pragmatic and justify every move with the goal and channel performance described. Write every text field in ENGLISH.'
    : 'Tu es un growth marketer qui revoit une répartition de budget par canal. Sois pragmatique et justifie chaque mouvement par l\'objectif et la performance décrite du canal. Écris chaque champ texte EN FRANÇAIS.'

  const userPrompt = l === 'en'
    ? `Product: ${input.productName}\nTotal marketing budget: €${input.totalBudget}\nChannels: ${JSON.stringify(input.channels)}`
    : `Produit : ${input.productName}\nBudget marketing total : ${input.totalBudget}€\nCanaux : ${JSON.stringify(input.channels)}`

  return callOpenRouterTool(env, { systemPrompt, userPrompt, tool: budgetOptimizationTool(l), timeoutMs: 25000 })
}

export const AGENT_RUNNERS = {
  story_brief: runStoryBrief,
  recalc_kpis: runKpiRecalc,
  risk_analysis: runRiskAnalysis,
  budget_optimization: runBudgetOptimization
}
