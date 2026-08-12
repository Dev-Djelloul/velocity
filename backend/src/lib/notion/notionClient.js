import { planToBlocks } from './notionBlocks'

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

  return page.url
}
