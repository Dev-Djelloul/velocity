import { callOpenRouterTool } from './openrouter'

const TABLE_GENERATION_TOOL = {
  name: 'generate_table',
  description: 'Génère un mini-tableau structuré (colonnes + lignes de départ pré-remplies) à partir d\'une demande en langage naturel et du contexte du produit',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Titre court du tableau' },
      columns: { type: 'array', items: { type: 'string' }, description: '3 à 6 colonnes pertinentes pour ce type de suivi' },
      rows: {
        type: 'array',
        description: '3 à 6 lignes de départ RÉALISTES et pré-remplies (pas de cellules vides), spécifiques au produit et au marché décrits — pas des placeholders génériques',
        items: { type: 'array', items: { type: 'string' } }
      }
    },
    required: ['title', 'columns', 'rows']
  }
}

function systemPrompt(lang) {
  return lang === 'en'
    ? 'You generate small, immediately useful tracking tables for startup founders. Rows must contain concrete, plausible example data related to the product described — never empty cells or generic placeholders like "Name" or "TBD".'
    : 'Tu génères de petits tableaux de suivi immédiatement utiles pour des fondateurs de startup. Les lignes doivent contenir des données d\'exemple concrètes et plausibles, liées au produit décrit — jamais de cellules vides ni de placeholders génériques comme "Nom" ou "À définir".'
}

function buildUserPrompt(prompt, plan, lang) {
  const lines = [
    lang === 'en' ? `Table request: "${prompt}"` : `Demande de tableau : "${prompt}"`
  ]
  if (plan?.product) {
    lines.push(
      '',
      lang === 'en' ? 'Product context:' : 'Contexte produit :',
      `${plan.product.name} — ${plan.product.pitch || ''}`,
      plan.market?.segment ? (lang === 'en' ? `Market segment: ${plan.market.segment}` : `Segment de marché : ${plan.market.segment}`) : ''
    )
  }
  return lines.filter(Boolean).join('\n')
}

export async function generateTableWithAI(prompt, plan, lang, env) {
  return callOpenRouterTool(env, {
    systemPrompt: systemPrompt(lang),
    userPrompt: buildUserPrompt(prompt, plan, lang),
    tool: TABLE_GENERATION_TOOL,
    timeoutMs: 25000
  })
}
