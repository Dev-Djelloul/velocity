import { callOpenRouterTool } from './openrouter'

// Deux premières actions d'agent : rédiger un brief d'exécution détaillé pour une
// story, et recalculer les cibles KPI à partir de l'avancement réel du roadmap.
// Chaque type a son propre schéma de sortie contraint, comme la génération de plan.

const BRIEF_TOOL = {
  name: 'generate_execution_brief',
  description: 'Rédige un brief d\'exécution détaillé et actionnable pour une story de roadmap',
  input_schema: {
    type: 'object',
    properties: {
      summary: { type: 'string', description: 'Résumé du brief en une phrase' },
      steps: { type: 'array', items: { type: 'string' }, description: '4 à 6 étapes concrètes et ordonnées pour réaliser cette story' },
      resourcesNeeded: { type: 'array', items: { type: 'string' }, description: '2-3 ressources ou outils nécessaires' },
      risks: { type: 'array', items: { type: 'string' }, description: '1-2 blocages potentiels à anticiper' }
    },
    required: ['summary', 'steps', 'resourcesNeeded', 'risks']
  }
}

const RISK_ANALYSIS_TOOL = {
  name: 'analyze_plan_risks',
  description: 'Identifie les risques prioritaires du plan de lancement à date et propose une mitigation concrète pour chacun',
  input_schema: {
    type: 'object',
    properties: {
      risks: {
        type: 'array',
        description: '3 à 5 risques réels et spécifiques à ce plan (pas génériques), triés du plus critique au moins critique',
        items: {
          type: 'object',
          properties: {
            risk: { type: 'string', description: 'Le risque, formulé précisément' },
            severity: { type: 'string', enum: ['high', 'medium', 'low'] },
            mitigation: { type: 'string', description: 'Une action concrète pour le réduire' }
          },
          required: ['risk', 'severity', 'mitigation']
        }
      }
    },
    required: ['risks']
  }
}

const BUDGET_OPTIMIZATION_TOOL = {
  name: 'optimize_marketing_budget',
  description: 'Analyse la répartition actuelle du budget marketing par canal et propose une réallocation argumentée',
  input_schema: {
    type: 'object',
    properties: {
      assessment: { type: 'string', description: 'Verdict en une phrase sur la répartition actuelle' },
      moves: {
        type: 'array',
        description: '2 à 4 mouvements de budget concrets (canal, sens, pourquoi)',
        items: {
          type: 'object',
          properties: {
            channel: { type: 'string' },
            direction: { type: 'string', enum: ['increase', 'decrease', 'maintain'] },
            rationale: { type: 'string' }
          },
          required: ['channel', 'direction', 'rationale']
        }
      }
    },
    required: ['assessment', 'moves']
  }
}

const KPI_RECALC_TOOL = {
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
            rationale: { type: 'string', description: 'Une phrase expliquant l\'ajustement (ou pourquoi inchangé)' }
          },
          required: ['name', 'newTarget', 'rationale']
        }
      }
    },
    required: ['kpis']
  }
}

function lang(input) {
  return input?.lang === 'en' ? 'en' : 'fr'
}

export async function runStoryBrief(env, input) {
  const l = lang(input)
  const systemPrompt = l === 'en'
    ? 'You write clear, actionable execution briefs for startup roadmap stories. Be specific to the product and story described, never generic.'
    : 'Tu rédiges des briefs d\'exécution clairs et actionnables pour des stories de roadmap de startup. Sois spécifique au produit et à la story décrits, jamais générique.'

  const userPrompt = l === 'en'
    ? `Product: ${input.productName} — ${input.productPitch}\nStory: "${input.storyTitle}"\nContext: ${input.storyDescription}\nAssignee role: ${input.assignee}`
    : `Produit : ${input.productName} — ${input.productPitch}\nStory : "${input.storyTitle}"\nContexte : ${input.storyDescription}\nRôle assigné : ${input.assignee}`

  return callOpenRouterTool(env, { systemPrompt, userPrompt, tool: BRIEF_TOOL, timeoutMs: 25000 })
}

export async function runKpiRecalc(env, input) {
  const l = lang(input)
  const systemPrompt = l === 'en'
    ? 'You are a startup operator recalibrating KPI targets based on real progress. Be realistic, not optimistic.'
    : 'Tu es un opérateur startup qui recalibre des cibles KPI à partir de l\'avancement réel. Sois réaliste, pas optimiste.'

  const userPrompt = l === 'en'
    ? `Product: ${input.productName}\nRoadmap progress: ${input.doneStories}/${input.totalStories} stories done, ${input.elapsedWeeks}/${input.totalWeeks} weeks elapsed.\nCurrent KPIs: ${JSON.stringify(input.kpis)}`
    : `Produit : ${input.productName}\nAvancement roadmap : ${input.doneStories}/${input.totalStories} stories terminées, ${input.elapsedWeeks}/${input.totalWeeks} semaines écoulées.\nKPIs actuels : ${JSON.stringify(input.kpis)}`

  return callOpenRouterTool(env, { systemPrompt, userPrompt, tool: KPI_RECALC_TOOL, timeoutMs: 25000 })
}

export async function runRiskAnalysis(env, input) {
  const l = lang(input)
  const systemPrompt = l === 'en'
    ? 'You are a startup operator doing a sober risk assessment of a launch plan. Be specific to what is described, never generic boilerplate risks.'
    : 'Tu es un opérateur startup qui fait une évaluation lucide des risques d\'un plan de lancement. Sois spécifique à ce qui est décrit, jamais des risques génériques passe-partout.'

  const userPrompt = l === 'en'
    ? `Product: ${input.productName} — ${input.productPitch}\nMarket: ${input.market}\nTimeline: ${input.totalWeeks} weeks, team: ${input.teamSize}, budget: €${input.budget}\nRoadmap progress: ${input.doneStories}/${input.totalStories} stories done.`
    : `Produit : ${input.productName} — ${input.productPitch}\nMarché : ${input.market}\nDélai : ${input.totalWeeks} semaines, équipe : ${input.teamSize}, budget : ${input.budget}€\nAvancement roadmap : ${input.doneStories}/${input.totalStories} stories terminées.`

  return callOpenRouterTool(env, { systemPrompt, userPrompt, tool: RISK_ANALYSIS_TOOL, timeoutMs: 25000 })
}

export async function runBudgetOptimization(env, input) {
  const l = lang(input)
  const systemPrompt = l === 'en'
    ? 'You are a growth marketer reviewing a channel budget split. Be pragmatic and justify every move with the goal and channel performance described.'
    : 'Tu es un growth marketer qui revoit une répartition de budget par canal. Sois pragmatique et justifie chaque mouvement par l\'objectif et la performance décrite du canal.'

  const userPrompt = l === 'en'
    ? `Product: ${input.productName}\nTotal marketing budget: €${input.totalBudget}\nChannels: ${JSON.stringify(input.channels)}`
    : `Produit : ${input.productName}\nBudget marketing total : ${input.totalBudget}€\nCanaux : ${JSON.stringify(input.channels)}`

  return callOpenRouterTool(env, { systemPrompt, userPrompt, tool: BUDGET_OPTIMIZATION_TOOL, timeoutMs: 25000 })
}

export const AGENT_RUNNERS = {
  story_brief: runStoryBrief,
  recalc_kpis: runKpiRecalc,
  risk_analysis: runRiskAnalysis,
  budget_optimization: runBudgetOptimization
}
