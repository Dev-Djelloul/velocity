import { callOpenRouterTool } from './openrouter'

const EDITORIAL_TOOL = {
  name: 'generate_editorial_calendar',
  description: "Génère un calendrier éditorial concret pour les premières semaines de lancement : contenus répartis par semaine et par canal, avec format, titre/sujet, angle et appel à l'action.",
  input_schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        description: '8 à 12 contenus RÉALISTES et spécifiques au produit, répartis sur 4 semaines',
        items: {
          type: 'object',
          properties: {
            week: { type: 'integer', description: 'Numéro de semaine (1 à 4)' },
            channel: { type: 'string', description: 'Canal de diffusion' },
            format: { type: 'string', description: 'Format du contenu (article, vidéo courte, post, newsletter, étude de cas...)' },
            title: { type: 'string', description: 'Titre ou sujet précis du contenu' },
            angle: { type: 'string', description: 'Angle éditorial en une phrase' },
            cta: { type: 'string', description: "Appel à l'action" }
          },
          required: ['week', 'channel', 'format', 'title', 'angle', 'cta']
        }
      }
    },
    required: ['items']
  }
}

function systemPrompt(lang) {
  return lang === 'en'
    ? 'You build a concrete, ready-to-execute editorial calendar for a startup launch. Titles and angles must be specific to the product described — never generic placeholders.'
    : "Tu construis un calendrier éditorial concret et prêt à exécuter pour le lancement d'une startup. Les titres et angles doivent être spécifiques au produit décrit — jamais des placeholders génériques."
}

function buildUserPrompt(plan, lang) {
  const p = plan?.product || {}
  const m = plan?.market || {}
  const channels = (plan?.marketing?.channels || []).map(c => c.name).join(', ')
  const lines = lang === 'en'
    ? [
        `Product: ${p.name || 'N/A'} — ${p.pitch || ''}`,
        p.usp ? `USP: ${p.usp}` : '',
        `Target: ${p.targetUser || 'N/A'}, market: ${m.segment || 'N/A'}, ${m.b2bVsB2c || ''}`,
        channels ? `Prioritized channels: ${channels}` : '',
        '',
        'Produce the editorial calendar in English, spread over 4 weeks.'
      ]
    : [
        `Produit : ${p.name || 'N/A'} — ${p.pitch || ''}`,
        p.usp ? `USP : ${p.usp}` : '',
        `Cible : ${p.targetUser || 'N/A'}, marché : ${m.segment || 'N/A'}, ${m.b2bVsB2c || ''}`,
        channels ? `Canaux prioritaires : ${channels}` : '',
        '',
        'Produis le calendrier éditorial en français, réparti sur 4 semaines.'
      ]
  return lines.filter(Boolean).join('\n')
}

export async function generateEditorialWithAI(plan, lang, env) {
  return callOpenRouterTool(env, {
    systemPrompt: systemPrompt(lang),
    userPrompt: buildUserPrompt(plan, lang),
    tool: EDITORIAL_TOOL,
    timeoutMs: 25000
  })
}
