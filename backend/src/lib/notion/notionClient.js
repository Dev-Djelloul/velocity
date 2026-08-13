import { planToBlocks, footerBlocks } from './notionBlocks'

const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

// Construit l'URL d'autorisation OAuth Notion. `state` = userId (associé au token au retour).
export function buildAuthorizeUrl(env, state) {
  const params = new URLSearchParams({
    client_id: env.NOTION_CLIENT_ID,
    redirect_uri: env.NOTION_REDIRECT_URI,
    response_type: 'code',
    owner: 'user',
    state
  })
  return `${NOTION_API}/oauth/authorize?${params.toString()}`
}

// Échange le code d'autorisation contre un token d'accès (auth Basic client_id:client_secret).
export async function exchangeCode(env, code) {
  const basic = btoa(`${env.NOTION_CLIENT_ID}:${env.NOTION_CLIENT_SECRET}`)
  const res = await fetch(`${NOTION_API}/oauth/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.NOTION_REDIRECT_URI
    })
  })
  if (!res.ok) throw new Error(`Notion token exchange failed: ${res.status}`)
  const data = await res.json()
  return {
    accessToken: data.access_token,
    workspaceName: data.workspace_name,
    workspaceId: data.workspace_id,
    botId: data.bot_id
  }
}

// Trouve une page parente accessible par l'intégration (celle que l'utilisateur a partagée).
async function findParentPageId(accessToken) {
  const res = await fetch(`${NOTION_API}/search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION
    },
    body: JSON.stringify({ filter: { property: 'object', value: 'page' }, page_size: 5 })
  })
  if (!res.ok) throw new Error(`Notion search failed: ${res.status}`)
  const data = await res.json()
  const page = (data.results || []).find(r => r.object === 'page')
  if (!page) throw new Error('no_parent')
  return page.id
}

// --- Bases de données Notion (roadmap + calendriers) ---

const propTitle = (v) => ({ title: [{ text: { content: String(v ?? '').slice(0, 1900) } }] })
const propText = (v) => ({ rich_text: [{ text: { content: String(v ?? '').slice(0, 1900) } }] })
const propNumber = (v) => { const n = Number(v); return { number: Number.isFinite(n) ? n : null } }
const propSelect = (v) => (v ? { select: { name: String(v).slice(0, 100).replace(/,/g, ' ') } } : { select: null })

async function notionFetch(accessToken, path, body) {
  const res = await fetch(`${NOTION_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION
    },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`Notion ${path} failed: ${res.status}`)
  return res.json()
}

// Crée une base inline sous la page et y insère les lignes (séquentiel, cap de sécurité).
async function createDatabaseWithRows(accessToken, parentPageId, titleText, properties, rows) {
  const db = await notionFetch(accessToken, '/databases', {
    parent: { type: 'page_id', page_id: parentPageId },
    is_inline: true,
    title: [{ text: { content: titleText } }],
    properties
  })
  for (const row of rows.slice(0, 80)) {
    await notionFetch(accessToken, '/pages', { parent: { database_id: db.id }, properties: row })
  }
}

async function buildDatabases(accessToken, parentPageId, plan, lang) {
  const en = lang === 'en'
  const _ = (fr, eng) => (en ? eng : fr)

  // Roadmap → base de tâches
  if (plan.roadmap?.sprints?.length) {
    const stories = plan.roadmap.sprints.flatMap(sp => (sp.stories || []).map(s => ({ ...s, sprint: sp.sprintId })))
    if (stories.length) {
      await createDatabaseWithRows(
        accessToken, parentPageId, _('Roadmap — Backlog', 'Roadmap — Backlog'),
        {
          [_('Story', 'Story')]: { title: {} },
          Sprint: { number: {} },
          [_('Responsable', 'Assignee')]: { rich_text: {} },
          [_('Effort', 'Effort')]: { number: {} },
          [_('Coût (€)', 'Cost (€)')]: { number: {} },
          [_('Statut', 'Status')]: { select: {} }
        },
        stories.map(s => ({
          [_('Story', 'Story')]: propTitle(`${s.id ? s.id + ': ' : ''}${s.title}`),
          Sprint: propNumber(s.sprint),
          [_('Responsable', 'Assignee')]: propText(s.assignee),
          [_('Effort', 'Effort')]: propNumber(s.effort),
          [_('Coût (€)', 'Cost (€)')]: propNumber(s.cost),
          [_('Statut', 'Status')]: propSelect(s.status === 'done' ? _('Terminé', 'Done') : _('À faire', 'To do'))
        }))
      )
    }
  }

  // Calendrier éditorial → base datée par semaine
  if (plan.editorial?.items?.length) {
    await createDatabaseWithRows(
      accessToken, parentPageId, _('Calendrier éditorial', 'Editorial calendar'),
      {
        [_('Contenu', 'Content')]: { title: {} },
        [_('Semaine', 'Week')]: { number: {} },
        [_('Canal', 'Channel')]: { select: {} },
        [_('Format', 'Format')]: { rich_text: {} },
        [_('Angle', 'Angle')]: { rich_text: {} },
        CTA: { rich_text: {} }
      },
      plan.editorial.items.map(it => ({
        [_('Contenu', 'Content')]: propTitle(it.title),
        [_('Semaine', 'Week')]: propNumber(it.week),
        [_('Canal', 'Channel')]: propSelect(it.channel),
        [_('Format', 'Format')]: propText(it.format),
        [_('Angle', 'Angle')]: propText(it.angle),
        CTA: propText(it.cta)
      }))
    )
  }

  // Calendrier publicitaire → base des campagnes
  if (plan.advertising?.campaigns?.length) {
    await createDatabaseWithRows(
      accessToken, parentPageId, _('Calendrier publicitaire', 'Advertising calendar'),
      {
        [_('Campagne', 'Campaign')]: { title: {} },
        [_('Semaine', 'Week')]: { number: {} },
        [_('Canal', 'Channel')]: { select: {} },
        [_('Objectif', 'Objective')]: { select: {} },
        [_('Budget (€)', 'Budget (€)')]: { number: {} },
        KPI: { rich_text: {} }
      },
      plan.advertising.campaigns.map(c => ({
        [_('Campagne', 'Campaign')]: propTitle(`${c.channel} — ${c.format}`),
        [_('Semaine', 'Week')]: propNumber(c.week),
        [_('Canal', 'Channel')]: propSelect(c.channel),
        [_('Objectif', 'Objective')]: propSelect(c.objective),
        [_('Budget (€)', 'Budget (€)')]: propNumber(c.budget),
        KPI: propText(c.kpi)
      }))
    )
  }
}

async function appendChildren(accessToken, pageId, children) {
  const res = await fetch(`${NOTION_API}/blocks/${pageId}/children`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION
    },
    body: JSON.stringify({ children })
  })
  if (!res.ok) throw new Error(`Notion append failed: ${res.status}`)
}

// Crée une page structurée du plan dans l'espace Notion de l'utilisateur. Retourne l'URL.
export async function createPlanPage(accessToken, plan, lang) {
  const parentId = await findParentPageId(accessToken)
  const blocks = planToBlocks(plan, lang)
  const first = blocks.slice(0, 100)
  const rest = blocks.slice(100)

  const res = await fetch(`${NOTION_API}/pages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION
    },
    body: JSON.stringify({
      parent: { page_id: parentId },
      icon: { type: 'emoji', emoji: '🚀' },
      properties: {
        title: [{ type: 'text', text: { content: `${plan.product?.name || 'Launch plan'} — VelocityLaunch` } }]
      },
      children: first
    })
  })
  if (!res.ok) throw new Error(`Notion page creation failed: ${res.status}`)
  const page = await res.json()

  // Blocs restants par lots de 100
  for (let i = 0; i < rest.length; i += 100) {
    await appendChildren(accessToken, page.id, rest.slice(i, i + 100))
  }

  // Roadmap + calendriers en bases de données inline (best-effort : ne casse pas l'export)
  try {
    await buildDatabases(accessToken, page.id, plan, lang)
  } catch { /* les bases sont un bonus ; la page reste valide sans elles */ }

  // Pied de page ajouté en dernier, après les bases
  try {
    await appendChildren(accessToken, page.id, footerBlocks(lang))
  } catch { /* cosmétique */ }

  return page.url
}
