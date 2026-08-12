import { callOpenRouterTool } from './openrouter'

const VEILLE_TOOL = {
  name: 'generate_veille',
  description: "Génère une veille stratégique 360° (concurrents à surveiller, tendances marché, signaux à guetter, opportunités & menaces, sources & mots-clés) à partir du contexte produit et marché.",
  input_schema: {
    type: 'object',
    properties: {
      competitors: {
        type: 'array',
        description: '3 à 5 concurrents ou catégories de concurrents PLAUSIBLES à surveiller, spécifiques au marché décrit',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Nom du concurrent ou de la catégorie' },
            positioning: { type: 'string', description: 'Positionnement en une phrase' },
            watch: { type: 'string', description: 'Ce qu\'il faut surveiller chez lui' }
          },
          required: ['name', 'positioning', 'watch']
        }
      },
      trends: { type: 'array', items: { type: 'string' }, description: '3 à 5 tendances de fond du marché' },
      signals: { type: 'array', items: { type: 'string' }, description: '3 à 5 signaux ou déclencheurs concrets à guetter (annonces, levées, changements réglementaires...)' },
      opportunities: { type: 'array', items: { type: 'string' }, description: '2 à 4 opportunités à saisir' },
      threats: { type: 'array', items: { type: 'string' }, description: '2 à 4 menaces à anticiper' },
      sources: { type: 'array', items: { type: 'string' }, description: '4 à 6 sources, publications ou mots-clés à suivre' }
    },
    required: ['competitors', 'trends', 'signals', 'opportunities', 'threats', 'sources']
  }
}

function systemPrompt(lang) {
  return lang === 'en'
    ? 'You produce a sharp, concrete competitive & market intelligence briefing for a startup founder. Every item must be specific and plausible for the described product and market — never generic filler.'
    : "Tu produis une veille concurrentielle et marché nette et concrète pour un fondateur de startup. Chaque élément doit être spécifique et plausible pour le produit et le marché décrits — jamais du remplissage générique."
}

function buildUserPrompt(plan, lang) {
  const p = plan?.product || {}
  const m = plan?.market || {}
  const lines = lang === 'en'
    ? [
        `Product: ${p.name || 'N/A'} — ${p.pitch || ''}`,
        p.usp ? `USP: ${p.usp}` : '',
        `Category: ${p.category || 'N/A'}, stage: ${p.stage || 'N/A'}, target: ${p.targetUser || 'N/A'}`,
        `Market: ${m.segment || 'N/A'}, ${m.b2bVsB2c || ''}, geography: ${m.geography || 'N/A'}, competition: ${m.competition || 'N/A'}`,
        '',
        'Produce the intelligence briefing in English.'
      ]
    : [
        `Produit : ${p.name || 'N/A'} — ${p.pitch || ''}`,
        p.usp ? `USP : ${p.usp}` : '',
        `Catégorie : ${p.category || 'N/A'}, stade : ${p.stage || 'N/A'}, cible : ${p.targetUser || 'N/A'}`,
        `Marché : ${m.segment || 'N/A'}, ${m.b2bVsB2c || ''}, géographie : ${m.geography || 'N/A'}, concurrence : ${m.competition || 'N/A'}`,
        '',
        'Produis la veille en français.'
      ]
  return lines.filter(Boolean).join('\n')
}

export async function generateVeilleWithAI(plan, lang, env) {
  return callOpenRouterTool(env, {
    systemPrompt: systemPrompt(lang),
    userPrompt: buildUserPrompt(plan, lang),
    tool: VEILLE_TOOL,
    timeoutMs: 25000
  })
}
