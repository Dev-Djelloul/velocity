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

function dynamicRescheduleTool(l) {
  return l === 'en' ? {
    name: 'reschedule_roadmap',
    description: 'Proposes sprint moves to keep the roadmap realistic given real progress, blocked dependencies and remaining capacity',
    input_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'One-sentence verdict on whether the current schedule still holds, IN ENGLISH.' },
        moves: {
          type: 'array',
          description: '0 to 6 concrete story moves between sprints (only for unfinished stories), IN ENGLISH.',
          items: {
            type: 'object',
            properties: {
              storyId: { type: 'string' },
              toSprint: { type: 'number', description: 'Target sprint number for this story.' },
              rationale: { type: 'string', description: 'Why this move, IN ENGLISH.' }
            },
            required: ['storyId', 'toSprint', 'rationale']
          }
        }
      },
      required: ['summary', 'moves']
    }
  } : {
    name: 'reschedule_roadmap',
    description: 'Propose des déplacements de sprint pour garder la roadmap réaliste vu l\'avancement réel, les dépendances bloquées et la capacité restante',
    input_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'Verdict en une phrase sur la tenue du planning actuel, EN FRANÇAIS.' },
        moves: {
          type: 'array',
          description: '0 à 6 déplacements concrets de stories entre sprints (uniquement les stories non terminées), EN FRANÇAIS.',
          items: {
            type: 'object',
            properties: {
              storyId: { type: 'string' },
              toSprint: { type: 'number', description: 'Numéro du sprint cible pour cette story.' },
              rationale: { type: 'string', description: 'Pourquoi ce déplacement, EN FRANÇAIS.' }
            },
            required: ['storyId', 'toSprint', 'rationale']
          }
        }
      },
      required: ['summary', 'moves']
    }
  }
}

function externalSignalPrioritizationTool(l) {
  return l === 'en' ? {
    name: 'prioritize_backlog_signals',
    description: 'Scores backlog stories by urgency using external market signals (competition, trends, user demand)',
    input_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'One-sentence verdict on what should move up given the market context, IN ENGLISH.' },
        priorities: {
          type: 'array',
          description: 'One entry per story provided, IN ENGLISH.',
          items: {
            type: 'object',
            properties: {
              storyId: { type: 'string' },
              score: { type: 'number', description: 'Priority score from 1 (low) to 10 (urgent).' },
              signal: { type: 'string', enum: ['market_trend', 'competitor_move', 'user_demand', 'regulatory'], description: 'Type of external signal driving this score.' },
              rationale: { type: 'string', description: 'One sentence justifying the score from that signal, IN ENGLISH.' }
            },
            required: ['storyId', 'score', 'signal', 'rationale']
          }
        }
      },
      required: ['summary', 'priorities']
    }
  } : {
    name: 'prioritize_backlog_signals',
    description: 'Note les stories du backlog par urgence à partir de signaux marché externes (concurrence, tendances, demande utilisateurs)',
    input_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string', description: 'Verdict en une phrase sur ce qui doit remonter vu le contexte marché, EN FRANÇAIS.' },
        priorities: {
          type: 'array',
          description: 'Une entrée par story fournie, EN FRANÇAIS.',
          items: {
            type: 'object',
            properties: {
              storyId: { type: 'string' },
              score: { type: 'number', description: 'Score de priorité de 1 (faible) à 10 (urgent).' },
              signal: { type: 'string', enum: ['market_trend', 'competitor_move', 'user_demand', 'regulatory'], description: 'Type de signal externe à l\'origine de ce score.' },
              rationale: { type: 'string', description: 'Une phrase justifiant le score à partir de ce signal, EN FRANÇAIS.' }
            },
            required: ['storyId', 'score', 'signal', 'rationale']
          }
        }
      },
      required: ['summary', 'priorities']
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

export async function runDynamicReschedule(env, input) {
  const l = lang(input)
  const systemPrompt = l === 'en'
    ? 'You are a delivery lead doing dynamic re-scheduling of a startup roadmap. Only move unfinished stories, respect stated dependencies, and never propose more moves than necessary. Write every text field in ENGLISH.'
    : 'Tu es un delivery lead qui replanifie dynamiquement une roadmap de startup. Ne déplace que des stories non terminées, respecte les dépendances indiquées, et ne propose jamais plus de mouvements que nécessaire. Écris chaque champ texte EN FRANÇAIS.'

  const userPrompt = l === 'en'
    ? `Product: ${input.productName}\nCurrent sprint: ${input.currentSprint}/${input.totalSprints}\nSprints: ${JSON.stringify(input.sprints)}`
    : `Produit : ${input.productName}\nSprint actuel : ${input.currentSprint}/${input.totalSprints}\nSprints : ${JSON.stringify(input.sprints)}`

  return callOpenRouterTool(env, { systemPrompt, userPrompt, tool: dynamicRescheduleTool(l), timeoutMs: 25000 })
}

export async function runExternalSignalPrioritization(env, input) {
  const l = lang(input)
  const systemPrompt = l === 'en'
    ? 'You are a product strategist prioritizing a backlog using external market signals (competitor moves, market trends, user demand, regulation). Be specific to the product and market described, never generic. Write every text field in ENGLISH.'
    : 'Tu es un product strategist qui priorise un backlog à partir de signaux marché externes (mouvements concurrents, tendances marché, demande utilisateurs, réglementation). Sois spécifique au produit et au marché décrits, jamais générique. Écris chaque champ texte EN FRANÇAIS.'

  const userPrompt = l === 'en'
    ? `Product: ${input.productName} — ${input.productPitch}\nMarket: ${input.market}\nBacklog stories: ${JSON.stringify(input.stories)}`
    : `Produit : ${input.productName} — ${input.productPitch}\nMarché : ${input.market}\nStories du backlog : ${JSON.stringify(input.stories)}`

  return callOpenRouterTool(env, { systemPrompt, userPrompt, tool: externalSignalPrioritizationTool(l), timeoutMs: 25000 })
}

export const AGENT_RUNNERS = {
  story_brief: runStoryBrief,
  recalc_kpis: runKpiRecalc,
  risk_analysis: runRiskAnalysis,
  budget_optimization: runBudgetOptimization,
  dynamic_reschedule: runDynamicReschedule,
  external_signal_prioritization: runExternalSignalPrioritization
}
