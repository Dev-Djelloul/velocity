import { PLAN_GENERATION_TOOL } from './planSchema'
import { brandVoicePrompt } from './brandVoice'
import { callOpenRouterTool } from './openrouter'

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
  const lang = data.language || 'fr'
  return callOpenRouterTool(env, {
    systemPrompt: brandVoicePrompt(lang),
    userPrompt: buildUserPrompt(data),
    tool: PLAN_GENERATION_TOOL
  })
}
