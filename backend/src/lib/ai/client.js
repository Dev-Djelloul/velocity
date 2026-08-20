import { PLAN_GENERATION_TOOL } from './planSchema'
import { brandVoicePrompt } from './brandVoice'
import { callOpenRouterTool } from './openrouter'
import { budgetFromKey } from '../generator/budgetTiers'

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
    totalBudget: 'budget total du lancement (tous postes confondus)',
    budget: 'budget marketing (part du budget total dédiée au marketing)',
    team: 'équipe',
    roles: 'Rôles présents',
    priorities: 'Priorités',
    focus: 'focus',
    engagement: 'engagement',
    risk: 'risque connu',
    successMetric: 'Métrique de succès',
    context: 'Contexte additionnel fourni par le fondateur',
    contextDocument: 'Document importé par le fondateur',
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
    totalBudget: 'total launch budget (all costs included)',
    budget: 'marketing budget (share of the total budget dedicated to marketing)',
    team: 'team',
    roles: 'Roles present',
    priorities: 'Priorities',
    focus: 'focus',
    engagement: 'engagement',
    risk: 'known risk',
    successMetric: 'Success metric',
    context: 'Additional context provided by the founder',
    contextDocument: 'Document imported by the founder',
    outputInstruction: 'Generate all plan content (text, labels, descriptions) in English.'
  }
}

// Filet de sécurité côté serveur : le client tronque déjà à l'extraction (documentParser.js,
// ~18k caractères) et l'utilisateur peut éditer/élaguer le texte avant envoi, mais on ne fait
// jamais confiance à ce qui arrive du client pour la taille du prompt (payload forgé, ancien
// build du frontend...).
const MAX_CONTEXT_DOCUMENT_CHARS = 20000

function buildUserPrompt(data, lang) {
  const l = LABELS[lang] || LABELS.fr
  const { product, market, resources, priorities, context, contextDocument } = data
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
    `${l.resources} : ${l.timeline} ${resources?.timelineWeeks}, ${l.totalBudget} ${budgetFromKey(resources?.totalBudget)} €, ${l.budget} ${budgetFromKey(resources?.budgetEur)} €, ${l.team} ${resources?.teamSize}`,
    `${l.roles} : ${(resources?.rolesPresent || []).join(', ')}`,
    '',
    `${l.priorities} : ${l.focus} ${priorities?.focus}, ${l.engagement} ${priorities?.engagement}, ${l.risk} ${priorities?.riskKnown}`,
    `${l.successMetric} : ${priorities?.successMetric}`
  ]

  if (context && context.trim()) {
    lines.push('', `${l.context} : ${context.trim()}`)
  }

  if (contextDocument && contextDocument.trim()) {
    const trimmed = contextDocument.trim()
    const safe = trimmed.length > MAX_CONTEXT_DOCUMENT_CHARS
      ? trimmed.slice(0, MAX_CONTEXT_DOCUMENT_CHARS) + '\n[tronqué]'
      : trimmed
    lines.push('', `${l.contextDocument} :`, safe)
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
