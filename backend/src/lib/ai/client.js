import { PLAN_GENERATION_TOOL } from './planSchema'
import { brandVoicePrompt } from './brandVoice'
import { callOpenRouterTool } from './openrouter'

// Le prompt utilisateur (données brutes du questionnaire) doit être dans la langue cible :
// le modèle suit surtout la langue du texte qu'il a sous les yeux, pas seulement les
// instructions du system prompt. Un prompt utilisateur toujours en français, même avec un
// system prompt en anglais, produisait un plan en français malgré lang === 'en'.
const LABELS = {
  fr: {
    intro: 'Génère le plan de lancement pour ce produit, à partir de ces réponses au questionnaire :',
    product: 'Produit',
    stage: 'stade',
    category: 'catégorie',
    pitch: 'Pitch',
    usp: 'USP',
    target: 'Cible',
    market: 'Marché',
    segment: 'segment',
    audienceSize: 'Taille d\'audience',
    competition: 'concurrence',
    resources: 'Ressources',
    timeline: 'timeline',
    budget: 'budget',
    team: 'équipe',
    roles: 'Rôles présents',
    priorities: 'Priorités',
    focus: 'focus',
    engagement: 'engagement',
    risk: 'risque connu',
    successMetric: 'Métrique de succès',
    context: 'Contexte additionnel fourni par le fondateur',
    outputInstruction: 'Génère tout le contenu du plan (texte, libellés, descriptions) en français.'
  },
  en: {
    intro: 'Generate the launch plan for this product, based on these questionnaire answers:',
    product: 'Product',
    stage: 'stage',
    category: 'category',
    pitch: 'Pitch',
    usp: 'USP',
    target: 'Target user',
    market: 'Market',
    segment: 'segment',
    audienceSize: 'Audience size',
    competition: 'competition',
    resources: 'Resources',
    timeline: 'timeline',
    budget: 'budget',
    team: 'team',
    roles: 'Roles present',
    priorities: 'Priorities',
    focus: 'focus',
    engagement: 'engagement',
    risk: 'known risk',
    successMetric: 'Success metric',
    context: 'Additional context provided by the founder',
    outputInstruction: 'Generate all plan content (text, labels, descriptions) in English.'
  }
}

function buildUserPrompt(data, lang) {
  const l = LABELS[lang] || LABELS.fr
  const { product, market, resources, priorities, context } = data
  const lines = [
    l.intro,
    '',
    `${l.product} : ${product?.name} (${l.stage} : ${product?.stage}, ${l.category} : ${product?.category})`,
    `${l.pitch} : ${product?.pitch}`,
    `${l.usp} : ${product?.usp}`,
    `${l.target} : ${product?.targetUser}`,
    '',
    `${l.market} : ${market?.geography}, ${market?.b2bVsB2c}, ${l.segment} "${market?.segment}"`,
    `${l.audienceSize} : ${market?.audienceSize}, ${l.competition} : ${market?.competition}`,
    '',
    `${l.resources} : ${l.timeline} ${resources?.timelineWeeks}, ${l.budget} ${resources?.budgetEur}, ${l.team} ${resources?.teamSize}`,
    `${l.roles} : ${(resources?.rolesPresent || []).join(', ')}`,
    '',
    `${l.priorities} : ${l.focus} ${priorities?.focus}, ${l.engagement} ${priorities?.engagement}, ${l.risk} ${priorities?.riskKnown}`,
    `${l.successMetric} : ${priorities?.successMetric}`
  ]

  if (context && context.trim()) {
    lines.push('', `${l.context} : ${context.trim()}`)
  }

  lines.push('', l.outputInstruction)

  return lines.join('\n')
}

export async function generatePlanWithAI(data, env) {
  const lang = data.language || 'fr'
  return callOpenRouterTool(env, {
    systemPrompt: brandVoicePrompt(lang),
    userPrompt: buildUserPrompt(data, lang),
    tool: PLAN_GENERATION_TOOL
  })
}
