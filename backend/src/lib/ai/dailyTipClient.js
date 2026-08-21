import { callOpenRouterTool } from './openrouter'

const THEMES = ['positioning', 'pricing', 'onboarding', 'retention', 'acquisition', 'legal', 'team_org']

const DAILY_TIP_TOOL = {
  name: 'produce_tip',
  description: 'Produit un conseil court et concret pour un fondateur de startup tech qui prépare ou vient de lancer un produit',
  input_schema: {
    type: 'object',
    properties: {
      theme: { type: 'string', enum: THEMES, description: 'Thème du conseil' },
      tip_fr: { type: 'string', description: '1 à 2 phrases, en français, concret et actionnable — jamais de généralité vague' },
      tip_en: { type: 'string', description: 'Same tip, in English, 1-2 sentences, concrete and actionable — never vague' }
    },
    required: ['theme', 'tip_fr', 'tip_en']
  }
}

const SYSTEM_PROMPT = 'Tu écris des conseils courts (1 à 2 phrases), concrets et actionnables pour des fondateurs de startup tech qui préparent ou viennent de lancer un produit. Style direct, pas de jargon creux, pas de formule toute faite. Chaque conseil doit pouvoir être appliqué le jour même. Fournis systématiquement la version française ET la version anglaise, avec le même contenu.'

function buildUserPrompt() {
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)]
  return `Écris un nouveau conseil sur le thème "${theme}", dans l'esprit du lancement produit tech (positionnement, pricing, onboarding, rétention, acquisition, légal, organisation d'équipe). Évite les évidences déjà mille fois entendues ("connaissez vos clients") — vise quelque chose de spécifique et immédiatement utile.`
}

export async function generateDailyTip(env) {
  return callOpenRouterTool(env, {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(),
    tool: DAILY_TIP_TOOL,
    timeoutMs: 20000
  })
}
