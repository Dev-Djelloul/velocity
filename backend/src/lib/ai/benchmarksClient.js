import { callOpenRouterTool } from './openrouter'

const BENCHMARKS_TOOL = {
  name: 'generate_benchmarks',
  description: "Génère des benchmarks sectoriels réalistes pour situer le plan face aux normes du marché : métriques clés (fourchette secteur vs valeur du plan + verdict), repères par canal marketing, et une synthèse actionnable.",
  input_schema: {
    type: 'object',
    properties: {
      metrics: {
        type: 'array',
        description: '4 à 6 métriques clés (conversion, CAC, rétention/churn, ARPU/pricing, activation, LTV...) avec la fourchette typique du secteur et la valeur estimée du plan',
        items: {
          type: 'object',
          properties: {
            metric: { type: 'string', description: 'Nom de la métrique' },
            industry: { type: 'string', description: 'Fourchette ou médiane typique du secteur (ex: "2–5%")' },
            yours: { type: 'string', description: 'Valeur estimée pour ce plan (dérivée du contexte, plausible)' },
            verdict: { type: 'string', enum: ['below', 'onpar', 'above'], description: 'below = sous la norme, onpar = dans la norme, above = au-dessus' }
          },
          required: ['metric', 'industry', 'yours', 'verdict']
        }
      },
      channels: {
        type: 'array',
        description: '3 à 5 repères par canal marketing (CTR, CPC, taux de conversion, CAC par canal...)',
        items: {
          type: 'object',
          properties: {
            channel: { type: 'string', description: 'Canal (SEO, Paid, LinkedIn, Content...)' },
            benchmark: { type: 'string', description: 'Repère chiffré typique du secteur' },
            note: { type: 'string', description: 'Conseil court pour ce canal' }
          },
          required: ['channel', 'benchmark', 'note']
        }
      },
      takeaway: { type: 'string', description: 'Synthèse actionnable en 1 à 2 phrases : où le plan est réaliste, où il doit être ajusté' },
      sources: {
        type: 'array',
        description: "3 à 5 sources RÉELLES et reconnues où aller vérifier/affiner ces ordres de grandeur soi-même (jamais une source inventée, jamais attribuée à une statistique précise citée plus haut — juste des références sectorielles sérieuses pour aller plus loin). Varie la sélection d'une génération à l'autre plutôt que de toujours citer les mêmes noms.",
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Nom de la source' },
            url: { type: 'string', description: 'URL réelle et exacte du site (https://...)' }
          },
          required: ['name', 'url']
        }
      }
    },
    required: ['metrics', 'channels', 'takeaway']
  }
}

function systemPrompt(lang) {
  return lang === 'en'
    ? 'You produce realistic industry benchmarks to help a startup founder sanity-check their launch plan. Use plausible, category-specific ranges. Never invent precise fake statistics as if from a named study; give sensible typical ranges.'
    : "Tu produis des benchmarks sectoriels réalistes pour aider un fondateur à valider son plan de lancement. Utilise des fourchettes plausibles et spécifiques à la catégorie. N'invente pas de statistiques précises attribuées à une étude nommée ; donne des fourchettes typiques raisonnables. Pour \"sources\", ne référence que des sites réels et connus dont tu es certain de l'existence à l'URL donnée — n'invente jamais un domaine."
}

function buildUserPrompt(plan, lang) {
  const p = plan?.product || {}
  const m = plan?.market || {}
  const kpis = (plan?.kpis || []).map(k => `${k.name}${k.target != null ? ` (cible ${k.target}${k.unit || ''})` : ''}`).join(', ')
  const budget = plan?.financials?.totalBudget || plan?.marketing?.totalBudget
  const lines = lang === 'en'
    ? [
        `Product: ${p.name || 'N/A'} — ${p.pitch || ''}`,
        `Category: ${p.category || 'N/A'}, stage: ${p.stage || 'N/A'}, ${m.b2bVsB2c || ''}, target: ${p.targetUser || 'N/A'}`,
        `Market: ${m.segment || 'N/A'}, geography: ${m.geography || 'N/A'}, competition: ${m.competition || 'N/A'}`,
        kpis ? `Plan KPIs: ${kpis}` : '',
        budget ? `Marketing budget: ${budget}€` : '',
        '',
        'Produce benchmarks in English.'
      ]
    : [
        `Produit : ${p.name || 'N/A'} — ${p.pitch || ''}`,
        `Catégorie : ${p.category || 'N/A'}, stade : ${p.stage || 'N/A'}, ${m.b2bVsB2c || ''}, cible : ${p.targetUser || 'N/A'}`,
        `Marché : ${m.segment || 'N/A'}, géographie : ${m.geography || 'N/A'}, concurrence : ${m.competition || 'N/A'}`,
        kpis ? `KPIs du plan : ${kpis}` : '',
        budget ? `Budget marketing : ${budget}€` : '',
        '',
        'Produis les benchmarks en français.'
      ]
  return lines.filter(Boolean).join('\n')
}

export async function generateBenchmarksWithAI(plan, lang, env) {
  return callOpenRouterTool(env, {
    systemPrompt: systemPrompt(lang),
    userPrompt: buildUserPrompt(plan, lang),
    tool: BENCHMARKS_TOOL,
    timeoutMs: 25000
  })
}
