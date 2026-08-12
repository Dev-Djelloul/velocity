import { callOpenRouterTool } from './openrouter'

const ADVERTISING_TOOL = {
  name: 'generate_advertising_calendar',
  description: "Génère un calendrier publicitaire (média payant) pour les premières semaines de lancement : campagnes réparties par semaine et par canal, avec objectif, format, audience ciblée, budget indicatif et KPI attendu.",
  input_schema: {
    type: 'object',
    properties: {
      campaigns: {
        type: 'array',
        description: '6 à 10 campagnes RÉALISTES réparties sur 4 semaines, cohérentes avec le budget total et les canaux du plan',
        items: {
          type: 'object',
          properties: {
            week: { type: 'integer', description: 'Numéro de semaine (1 à 4)' },
            channel: { type: 'string', description: 'Canal payant (Paid, Meta Ads, Google Ads, LinkedIn Ads, TikTok Ads...)' },
            objective: { type: 'string', enum: ['awareness', 'consideration', 'conversion'], description: "Objectif de l'entonnoir" },
            format: { type: 'string', description: 'Format publicitaire (vidéo, carrousel, search, display, lead gen...)' },
            audience: { type: 'string', description: 'Audience ciblée en une phrase' },
            budget: { type: 'integer', description: 'Budget indicatif en euros pour cette campagne' },
            kpi: { type: 'string', description: 'KPI principal attendu (CPL, CPA, ROAS, CTR...)' }
          },
          required: ['week', 'channel', 'objective', 'format', 'audience', 'budget', 'kpi']
        }
      },
      totalBudget: { type: 'integer', description: 'Somme des budgets des campagnes' }
    },
    required: ['campaigns']
  }
}

function systemPrompt(lang) {
  return lang === 'en'
    ? 'You build a concrete paid-media (advertising) calendar for a startup launch. Campaigns must fit the given total budget and channels, moving from awareness to conversion over time. Be specific, never generic.'
    : "Tu construis un calendrier publicitaire (média payant) concret pour le lancement d'une startup. Les campagnes doivent respecter le budget total et les canaux fournis, en passant de la notoriété à la conversion dans le temps. Sois spécifique, jamais générique."
}

function buildUserPrompt(plan, lang) {
  const p = plan?.product || {}
  const m = plan?.market || {}
  const budget = plan?.marketing?.totalBudget || plan?.financials?.totalBudget
  const channels = (plan?.marketing?.channels || []).map(c => `${c.name} (${c.budget || 0}€)`).join(', ')
  const lines = lang === 'en'
    ? [
        `Product: ${p.name || 'N/A'} — ${p.pitch || ''}`,
        `Target: ${p.targetUser || 'N/A'}, market: ${m.segment || 'N/A'}, ${m.b2bVsB2c || ''}`,
        budget ? `Total marketing budget: ${budget}€` : '',
        channels ? `Channels & budgets: ${channels}` : '',
        '',
        'Produce the advertising calendar in English, spread over 4 weeks.'
      ]
    : [
        `Produit : ${p.name || 'N/A'} — ${p.pitch || ''}`,
        `Cible : ${p.targetUser || 'N/A'}, marché : ${m.segment || 'N/A'}, ${m.b2bVsB2c || ''}`,
        budget ? `Budget marketing total : ${budget}€` : '',
        channels ? `Canaux & budgets : ${channels}` : '',
        '',
        'Produis le calendrier publicitaire en français, réparti sur 4 semaines.'
      ]
  return lines.filter(Boolean).join('\n')
}

export async function generateAdvertisingWithAI(plan, lang, env) {
  return callOpenRouterTool(env, {
    systemPrompt: systemPrompt(lang),
    userPrompt: buildUserPrompt(plan, lang),
    tool: ADVERTISING_TOOL,
    timeoutMs: 25000
  })
}
