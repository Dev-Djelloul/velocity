import * as db from '../db'

const AUTH_BASE = 'https://auth.atlassian.com'
const API_BASE = 'https://api.atlassian.com'
// Scopes classiques 3LO + offline_access pour obtenir un refresh token.
const SCOPES = 'read:jira-work write:jira-work read:jira-user offline_access'

// --- OAuth ---

export function buildAuthorizeUrl(env, state) {
  const params = new URLSearchParams({
    audience: 'api.atlassian.com',
    client_id: env.JIRA_CLIENT_ID,
    scope: SCOPES,
    redirect_uri: env.JIRA_REDIRECT_URI,
    state,
    response_type: 'code',
    prompt: 'consent'
  })
  return `${AUTH_BASE}/authorize?${params.toString()}`
}

async function tokenRequest(env, body) {
  const res = await fetch(`${AUTH_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: env.JIRA_CLIENT_ID, client_secret: env.JIRA_CLIENT_SECRET, ...body })
  })
  if (!res.ok) throw new Error(`Jira token request failed: ${res.status}`)
  const data = await res.json()
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000
  }
}

export function exchangeCode(env, code) {
  return tokenRequest(env, { grant_type: 'authorization_code', code, redirect_uri: env.JIRA_REDIRECT_URI })
}

// Renvoie un access token valide, en rafraîchissant si expiré (marge de 60s), et persiste le nouveau.
export async function ensureAccessToken(env, userId, tokenRow) {
  if (tokenRow.expires_at && Date.now() < tokenRow.expires_at - 60000) {
    return tokenRow.access_token
  }
  const refreshed = await tokenRequest(env, { grant_type: 'refresh_token', refresh_token: tokenRow.refresh_token })
  await db.updateJiraTokens(env, userId, refreshed)
  return refreshed.accessToken
}

// --- Découverte ressources ---

export async function listAccessibleResources(accessToken) {
  const res = await fetch(`${API_BASE}/oauth/token/accessible-resources`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
  })
  if (!res.ok) throw new Error(`Jira resources failed: ${res.status}`)
  return res.json() // [{ id, url, name, scopes }]
}

function jiraFetch(accessToken, cloudId, path, options = {}) {
  return fetch(`${API_BASE}/ex/jira/${cloudId}/rest/api/3${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })
}

export async function listProjects(accessToken, cloudId) {
  const res = await jiraFetch(accessToken, cloudId, '/project/search?maxResults=50&orderBy=name')
  if (!res.ok) throw new Error(`Jira projects failed: ${res.status}`)
  const data = await res.json()
  return (data.values || []).map(p => ({ key: p.key, name: p.name, id: p.id, style: p.style }))
}

// --- Export ---

// ADF (Atlassian Document Format) minimal : un paragraphe par ligne non vide.
function adf(text) {
  const lines = String(text || '').split('\n').filter(l => l.trim())
  return {
    type: 'doc',
    version: 1,
    content: (lines.length ? lines : ['—']).map(line => ({
      type: 'paragraph',
      content: [{ type: 'text', text: line.slice(0, 2000) }]
    }))
  }
}

// Trouve l'id du champ "Story Points" (varie selon le type de projet). Best-effort.
async function findStoryPointsField(accessToken, cloudId) {
  try {
    const res = await jiraFetch(accessToken, cloudId, '/field')
    if (!res.ok) return null
    const fields = await res.json()
    const match = fields.find(f => /story point estimate/i.test(f.name)) || fields.find(f => /story points?/i.test(f.name))
    return match ? match.id : null
  } catch { return null }
}

// Récupère les issues déjà créées par VelocityLaunch dans ce projet, indexées par leur label vl-id / vl-epic.
async function fetchManagedIssues(accessToken, cloudId, projectKey) {
  const map = {}
  try {
    const jql = encodeURIComponent(`project = "${projectKey}" AND labels = velocitylaunch ORDER BY created ASC`)
    const res = await jiraFetch(accessToken, cloudId, `/search?jql=${jql}&maxResults=200&fields=labels`)
    if (!res.ok) return map
    const data = await res.json()
    for (const issue of data.issues || []) {
      for (const label of issue.fields?.labels || []) {
        if (label.startsWith('vl-id:') || label.startsWith('vl-epic:')) map[label] = issue.key
      }
    }
  } catch { /* pas de sync possible → tout sera créé */ }
  return map
}

async function createIssue(accessToken, cloudId, fields) {
  const res = await jiraFetch(accessToken, cloudId, '/issue', { method: 'POST', body: JSON.stringify({ fields }) })
  if (!res.ok) {
    const body = await res.text()
    const err = new Error(`create ${res.status}`)
    err.body = body
    throw err
  }
  return res.json() // { key, id, self }
}

async function updateIssue(accessToken, cloudId, key, fields) {
  const res = await jiraFetch(accessToken, cloudId, `/issue/${key}`, { method: 'PUT', body: JSON.stringify({ fields }) })
  return res.ok
}

const CATEGORY_LABELS = { product: 'produit', marketing: 'marketing', ops: 'ops' }

// Crée/met à jour les Epics (1/sprint) puis les Stories rattachées. Retourne la carte des liens.
export async function exportPlanToJira(accessToken, target, plan, lang) {
  const { cloud_id: cloudId, site_url: siteUrl, project_key: projectKey } = target
  const spField = await findStoryPointsField(accessToken, cloudId)
  const managed = await fetchManagedIssues(accessToken, cloudId, projectKey)

  let created = 0
  let updated = 0
  const links = {} // vlId -> { key, url }
  const epicKeyBySprint = {}

  const browse = (key) => (siteUrl ? `${siteUrl}/browse/${key}` : null)

  // 1) Epics par sprint
  for (const sprint of plan.roadmap?.sprints || []) {
    const epicLabel = `vl-epic:${sprint.sprintId}`
    const summary = `${lang === 'en' ? 'Sprint' : 'Sprint'} ${sprint.sprintId} — ${sprint.estimatedCost} €`
    const fields = {
      project: { key: projectKey },
      summary: summary.slice(0, 240),
      issuetype: { name: 'Epic' },
      labels: ['velocitylaunch', epicLabel]
    }
    const existing = managed[epicLabel]
    if (existing) {
      await updateIssue(accessToken, cloudId, existing, { summary: fields.summary })
      epicKeyBySprint[sprint.sprintId] = existing
      updated++
    } else {
      try {
        const issue = await createIssue(accessToken, cloudId, fields)
        epicKeyBySprint[sprint.sprintId] = issue.key
        created++
      } catch { /* Epic peut être indisponible dans certains projets ; on continue sans parent */ }
    }
  }

  // 2) Stories
  for (const sprint of plan.roadmap?.sprints || []) {
    for (const story of sprint.stories || []) {
      const vlLabel = `vl-id:${story.id}`
      const descParts = [
        story.description || '',
        story.acceptanceCriteria ? `\n${lang === 'en' ? 'Acceptance criteria' : 'Critères d\'acceptation'} : ${story.acceptanceCriteria}` : '',
        `\n${lang === 'en' ? 'Estimated cost' : 'Coût estimé'} : ${story.cost} €`,
        story.assignee ? `\n${lang === 'en' ? 'Suggested assignee' : 'Responsable suggéré'} : ${story.assignee}` : '',
        story.dependsOn?.length ? `\n${lang === 'en' ? 'Depends on' : 'Dépend de'} : ${story.dependsOn.join(', ')}` : ''
      ]
      const labels = ['velocitylaunch', vlLabel, `vl-sprint:${sprint.sprintId}`]
      const cat = CATEGORY_LABELS[story.category]
      if (cat) labels.push(cat)

      const baseFields = {
        summary: `${story.id}: ${story.title}`.slice(0, 240),
        description: adf(descParts.join('')),
        labels
      }
      if (spField && Number.isFinite(story.effort)) baseFields[spField] = story.effort

      const existing = managed[vlLabel]
      if (existing) {
        await updateIssue(accessToken, cloudId, existing, baseFields)
        links[story.id] = { key: existing, url: browse(existing) }
        updated++
        continue
      }

      const createFields = { ...baseFields, project: { key: projectKey }, issuetype: { name: 'Story' } }
      const epicKey = epicKeyBySprint[sprint.sprintId]
      if (epicKey) createFields.parent = { key: epicKey }

      try {
        const issue = await createIssue(accessToken, cloudId, createFields)
        links[story.id] = { key: issue.key, url: browse(issue.key) }
        created++
      } catch (e) {
        // Le rattachement à l'Epic (parent) ou le champ story points peuvent être refusés selon le projet.
        // On retente sans parent ni story points pour garantir la création.
        const fallback = { project: { key: projectKey }, summary: baseFields.summary, description: baseFields.description, labels, issuetype: { name: 'Story' } }
        try {
          const issue = await createIssue(accessToken, cloudId, fallback)
          links[story.id] = { key: issue.key, url: browse(issue.key) }
          created++
        } catch { /* on saute cette story sans casser l'export */ }
      }
    }
  }

  const boardUrl = await resolveBoardUrl(accessToken, cloudId, siteUrl, projectKey, links)
  return { created, updated, links, boardUrl, projectKey, siteUrl }
}

// Construit une URL fiable vers le board du projet. Le format dépend du type de projet
// (team-managed vs company-managed) et requiert l'id du board, récupéré via l'API Agile.
// Fallbacks successifs : board → 1er ticket créé → page projet.
async function resolveBoardUrl(accessToken, cloudId, siteUrl, projectKey, links) {
  if (!siteUrl) return null
  try {
    const res = await fetch(`${API_BASE}/ex/jira/${cloudId}/rest/agile/1.0/board?projectKeyOrId=${encodeURIComponent(projectKey)}&maxResults=1`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
    })
    if (res.ok) {
      const data = await res.json()
      const board = data.values?.[0]
      if (board?.id) return `${siteUrl}/jira/software/projects/${projectKey}/boards/${board.id}`
    }
  } catch { /* on tombe sur un fallback */ }
  const firstKey = Object.values(links)[0]?.key
  if (firstKey) return `${siteUrl}/browse/${firstKey}`
  return `${siteUrl}/jira/software/projects/${projectKey}/summary`
}
