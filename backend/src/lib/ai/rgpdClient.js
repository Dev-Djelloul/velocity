import { callOpenRouterTool } from './openrouter'

const RGPD_TOOL = {
  name: 'generate_gdpr_readiness',
  description: "Génère une évaluation de conformité RGPD/GDPR adaptée au produit : applicabilité, checklist d'actions concrètes, ébauche de registre de traitement, et recommandations. Ce n'est pas un avis juridique.",
  input_schema: {
    type: 'object',
    properties: {
      applicability: { type: 'string', description: "1 à 2 phrases : dans quelle mesure le RGPD s'applique à ce produit et pourquoi" },
      checklist: {
        type: 'array',
        description: "6 à 9 actions de conformité concrètes et priorisées",
        items: {
          type: 'object',
          properties: {
            item: { type: 'string', description: "Action de conformité concrète" },
            priority: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Priorité' }
          },
          required: ['item', 'priority']
        }
      },
      register: {
        type: 'array',
        description: "3 à 6 lignes de registre de traitement plausibles pour ce produit",
        items: {
          type: 'object',
          properties: {
            data: { type: 'string', description: 'Type de données personnelles collectées' },
            purpose: { type: 'string', description: 'Finalité du traitement' },
            basis: { type: 'string', description: 'Base légale (consentement, contrat, intérêt légitime...)' }
          },
          required: ['data', 'purpose', 'basis']
        }
      },
      recommendations: { type: 'array', items: { type: 'string' }, description: '2 à 4 recommandations prioritaires' }
    },
    required: ['applicability', 'checklist', 'register', 'recommendations']
  }
}

function systemPrompt(lang) {
  return lang === 'en'
    ? 'You produce a practical, product-specific GDPR readiness assessment for a startup founder. Be concrete and actionable. Always make clear this is guidance, not legal advice.'
    : "Tu produis une évaluation de conformité RGPD pratique et spécifique au produit pour un fondateur de startup. Sois concret et actionnable. Précise toujours qu'il s'agit d'une aide, pas d'un avis juridique."
}

function buildUserPrompt(plan, lang) {
  const p = plan?.product || {}
  const m = plan?.market || {}
  const lines = lang === 'en'
    ? [
        `Product: ${p.name || 'N/A'} — ${p.pitch || ''}`,
        `Category: ${p.category || 'N/A'}, target: ${p.targetUser || 'N/A'}, ${m.b2bVsB2c || ''}`,
        `Market: ${m.segment || 'N/A'}, geography: ${m.geography || 'N/A'}`,
        '',
        'Produce the GDPR readiness assessment in English.'
      ]
    : [
        `Produit : ${p.name || 'N/A'} — ${p.pitch || ''}`,
        `Catégorie : ${p.category || 'N/A'}, cible : ${p.targetUser || 'N/A'}, ${m.b2bVsB2c || ''}`,
        `Marché : ${m.segment || 'N/A'}, géographie : ${m.geography || 'N/A'}`,
        '',
        'Produis l\'évaluation de conformité RGPD en français.'
      ]
  return lines.filter(Boolean).join('\n')
}

export async function generateRgpdWithAI(plan, lang, env) {
  return callOpenRouterTool(env, {
    systemPrompt: systemPrompt(lang),
    userPrompt: buildUserPrompt(plan, lang),
    tool: RGPD_TOOL,
    timeoutMs: 25000
  })
}
