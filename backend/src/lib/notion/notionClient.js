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
const propDate = (iso) => (iso ? { date: { start: iso } } : { date: null })

// Libellé de statut Notion pour un statut de story VelocityLaunch (tri-état).
function statusLabel(status, en) {
  if (status === 'done') return en ? 'Done' : 'Terminé'
  if (status === 'in_progress') return en ? 'In progress' : 'En cours'
  return en ? 'To do' : 'À faire'
}

// Date = base (planStartDate/generatedAt) décalée de N semaines, au format YYYY-MM-DD (pour vues calendrier/timeline).
function isoDatePlusWeeks(baseIso, weeks) {
  const d = baseIso ? new Date(baseIso) : new Date()
  if (isNaN(d.getTime())) return null
  d.setUTCDate(d.getUTCDate() + Math.round(weeks * 7))
  return d.toISOString().slice(0, 10)
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Notion applique une limite d'environ 3 requêtes/seconde par intégration. Un 429 y est
// attendu sous charge (sync de grands backlogs) : on retente avec le délai indiqué par
// l'API plutôt que de faire échouer toute la synchronisation pour une story.
async function notionRequest(accessToken, path, method, body) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${NOTION_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': NOTION_VERSION
      },
      body: body != null ? JSON.stringify(body) : undefined
    })
    if (res.ok) return res.json()
    if (res.status === 429 && attempt < 2) {
      const retryAfter = Number(res.headers.get('Retry-After')) || 1
      await sleep(retryAfter * 1000)
      continue
    }
    throw new Error(`Notion ${path} failed: ${res.status}`)
  }
}

async function notionFetch(accessToken, path, body) {
  return notionRequest(accessToken, path, 'POST', body)
}

// Traite les items par petits lots concurrents (respecte la limite de débit de Notion tout
// en étant nettement plus rapide qu'un traitement un par un pour un backlog de plusieurs
// dizaines de stories). Chaque item est isolé : un échec ne bloque pas les autres.
async function processInBatches(items, batchSize, handler) {
  const results = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(async (item) => {
      try {
        return { item, value: await handler(item), ok: true }
      } catch (e) {
        return { item, error: e, ok: false }
      }
    }))
    results.push(...batchResults)
  }
  return results
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
  // planStartDate (pas seulement generatedAt) : même correctif que jiraClient.js — c'est le
  // champ que "Modifier la date de démarrage" (RoadmapCard) met à jour, jamais generatedAt
  // qui ne change plus après la génération initiale du plan.
  const base = plan.planStartDate || plan.generatedAt

  // Roadmap → base de tâches (Date = début du sprint : 2 semaines/sprint)
  if (plan.roadmap?.sprints?.length) {
    const stories = plan.roadmap.sprints.flatMap(sp => (sp.stories || []).map(s => ({ ...s, sprint: sp.sprintId })))
    if (stories.length) {
      await createDatabaseWithRows(
        accessToken, parentPageId, _('Roadmap — Backlog', 'Roadmap — Backlog'),
        {
          [_('Story', 'Story')]: { title: {} },
          Sprint: { number: {} },
          [_('Début', 'Start')]: { date: {} },
          [_('Responsable', 'Assignee')]: { rich_text: {} },
          [_('Effort', 'Effort')]: { number: {} },
          [_('Coût (€)', 'Cost (€)')]: { number: {} },
          [_('Statut', 'Status')]: { select: {} }
        },
        stories.map(s => ({
          [_('Story', 'Story')]: propTitle(`${s.id ? s.id + ': ' : ''}${s.title}`),
          Sprint: propNumber(s.sprint),
          [_('Début', 'Start')]: propDate(isoDatePlusWeeks(base, ((s.sprint || 1) - 1) * 2)),
          [_('Responsable', 'Assignee')]: propText(s.assignee),
          [_('Effort', 'Effort')]: propNumber(s.effort),
          [_('Coût (€)', 'Cost (€)')]: propNumber(s.cost),
          [_('Statut', 'Status')]: propSelect(statusLabel(s.status, en))
        }))
      )
    }
  }

  // Calendrier de contenu & publicité → une seule base fusionnant contenu organique et
  // campagnes payantes (comme la vue GTM unifiée de l'app), avec une colonne Type pour
  // distinguer les deux et une colonne Détail qui absorbe les champs propres à chacun
  // (Angle/CTA pour le contenu, Objectif/Budget/KPI pour le payant).
  const contentRows = (plan.editorial?.items || []).map(it => ({
    [_('Élément', 'Item')]: propTitle(it.title),
    [_('Type', 'Type')]: propSelect(_('Contenu organique', 'Organic content')),
    Date: propDate(isoDatePlusWeeks(base, (it.week || 1) - 1)),
    [_('Semaine', 'Week')]: propNumber(it.week),
    [_('Canal', 'Channel')]: propSelect(it.channel),
    [_('Format', 'Format')]: propText(it.format),
    [_('Détail', 'Detail')]: propText(`${_('Angle', 'Angle')} : ${it.angle || '—'} · CTA : ${it.cta || '—'}`)
  }))
  const paidRows = (plan.advertising?.campaigns || []).map(c => ({
    [_('Élément', 'Item')]: propTitle(`${c.channel} — ${c.format}`),
    [_('Type', 'Type')]: propSelect(_('Campagne payante', 'Paid campaign')),
    Date: propDate(isoDatePlusWeeks(base, (c.week || 1) - 1)),
    [_('Semaine', 'Week')]: propNumber(c.week),
    [_('Canal', 'Channel')]: propSelect(c.channel),
    [_('Format', 'Format')]: propText(c.format),
    [_('Détail', 'Detail')]: propText(`${_('Objectif', 'Objective')} : ${c.objective || '—'} · Budget : ${c.budget ?? '—'} € · KPI : ${c.kpi || '—'}`)
  }))
  if (contentRows.length || paidRows.length) {
    await createDatabaseWithRows(
      accessToken, parentPageId, _('Calendrier de contenu & publicité', 'Content & advertising calendar'),
      {
        [_('Élément', 'Item')]: { title: {} },
        [_('Type', 'Type')]: { select: {} },
        Date: { date: {} },
        [_('Semaine', 'Week')]: { number: {} },
        [_('Canal', 'Channel')]: { select: {} },
        [_('Format', 'Format')]: { rich_text: {} },
        [_('Détail', 'Detail')]: { rich_text: {} }
      },
      [...contentRows, ...paidRows]
    )
  }
}

// --- Sync par story (indépendant de l'export page complète) ---

// Base "Backlog" dédiée avec une ligne par user story, avec deep-link individuel — pendant
// Notion du badge Jira par story. Idempotent : si `existingNotion` (plan.notion) référence déjà
// une base et des pages, on les met à jour au lieu d'en recréer à chaque sync.
export async function syncStoriesToNotion(accessToken, plan, lang, existingNotion) {
  const en = lang === 'en'
  const _ = (fr, eng) => (en ? eng : fr)
  const allStories = (plan.roadmap?.sprints || []).flatMap(sp => (sp.stories || []).map(s => ({ ...s, sprint: sp.sprintId })))
  if (!allStories.length) return { created: 0, updated: 0, links: {}, databaseId: null, databaseUrl: null }

  const properties = {
    [_('Story', 'Story')]: { title: {} },
    Sprint: { number: {} },
    [_('Responsable', 'Assignee')]: { rich_text: {} },
    [_('Effort', 'Effort')]: { number: {} },
    [_('Coût (€)', 'Cost (€)')]: { number: {} },
    [_('Statut', 'Status')]: { select: {} }
  }

  const rowFields = (s) => ({
    [_('Story', 'Story')]: propTitle(`${s.id ? s.id + ': ' : ''}${s.title}`),
    Sprint: propNumber(s.sprint),
    [_('Responsable', 'Assignee')]: propText(s.assignee),
    [_('Effort', 'Effort')]: propNumber(s.effort),
    [_('Coût (€)', 'Cost (€)')]: propNumber(s.cost),
    [_('Statut', 'Status')]: propSelect(statusLabel(s.status, en))
  })

  let databaseId = existingNotion?.databaseId
  let databaseUrl = existingNotion?.databaseUrl

  // Vérifie que la base référencée existe encore côté Notion (l'utilisateur a pu la supprimer).
  if (databaseId) {
    const check = await fetch(`${NOTION_API}/databases/${databaseId}`, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Notion-Version': NOTION_VERSION }
    })
    if (!check.ok) databaseId = null
  }

  if (!databaseId) {
    const parentId = await findParentPageId(accessToken)
    const db = await notionFetch(accessToken, '/databases', {
      parent: { type: 'page_id', page_id: parentId },
      is_inline: true,
      title: [{ text: { content: `${plan.product?.name || 'Launch plan'} — ${_('Backlog', 'Backlog')}` } }],
      properties
    })
    databaseId = db.id
    databaseUrl = db.url
  }

  const links = { ...(existingNotion?.links || {}) }

  const results = await processInBatches(allStories, 3, async (story) => {
    const fields = rowFields(story)
    const existingLink = links[story.id]

    if (existingLink?.pageId) {
      try {
        await notionRequest(accessToken, `/pages/${existingLink.pageId}`, 'PATCH', { properties: fields })
        return { storyId: story.id, action: 'updated' }
      } catch {
        // La page a pu être supprimée côté Notion → on retombe sur une création ci-dessous.
      }
    }

    const page = await notionFetch(accessToken, '/pages', { parent: { database_id: databaseId }, properties: fields })
    return { storyId: story.id, action: 'created', pageId: page.id, url: page.url }
  })

  let created = 0
  let updated = 0
  let failed = 0
  for (const r of results) {
    if (!r.ok) { failed++; continue }
    if (r.value.action === 'created') {
      links[r.value.storyId] = { pageId: r.value.pageId, url: r.value.url }
      created++
    } else {
      updated++
    }
  }

  return { created, updated, failed, links, databaseId, databaseUrl }
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
export async function createPlanPage(accessToken, plan, lang, coverUrl) {
  const parentId = await findParentPageId(accessToken)
  const blocks = planToBlocks(plan, lang)
  const first = blocks.slice(0, 100)
  const rest = blocks.slice(100)

  const body = {
    parent: { page_id: parentId },
    icon: { type: 'emoji', emoji: '🚀' },
    properties: {
      title: [{ type: 'text', text: { content: `${plan.product?.name || 'Launch plan'} — VelocityLaunch` } }]
    },
    children: first
  }
  if (coverUrl) body.cover = { type: 'external', external: { url: coverUrl } }

  const res = await fetch(`${NOTION_API}/pages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': NOTION_VERSION
    },
    body: JSON.stringify(body)
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
