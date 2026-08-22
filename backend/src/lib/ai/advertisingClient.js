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

// Filet de sécurité budgétaire : le prompt demande déjà à l'IA de respecter le budget
// marketing réel (buildUserPrompt ci-dessus), mais le schéma ne contraint `budget`/
// `totalBudget` que par une description en prose — le modèle peut renvoyer des chiffres
// totalement déconnectés (ex. 5000€ de CPM cible sur un budget réel de 41 000€, signalé par
// l'utilisateur). Recalé après coup : chaque budget de campagne est mis à l'échelle pour que
// leur somme corresponde exactement au vrai budget marketing, en conservant la répartition
// relative déjà proposée par le modèle entre semaines/canaux.
export function reconcileAdvertisingBudget(advertising, marketingBudget) {
  if (!advertising?.campaigns?.length || marketingBudget == null) return advertising
  const rawTotal = advertising.campaigns.reduce((s, c) => s + (c.budget || 0), 0)
  if (!rawTotal) return advertising
  const scale = marketingBudget / rawTotal
  let allocated = 0
  const nextCampaigns = advertising.campaigns.map((c, idx) => {
    const isLast = idx === advertising.campaigns.length - 1
    const budget = isLast ? Math.max(0, marketingBudget - allocated) : Math.max(0, Math.round((c.budget || 0) * scale))
    allocated += budget
    return { ...c, budget }
  })
  return { ...advertising, campaigns: nextCampaigns, totalBudget: marketingBudget }
}
