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

// Appel à l'API Agile (sprints, boards) : base différente de l'API REST v3.
function agileFetch(accessToken, cloudId, path, options = {}) {
  return fetch(`${API_BASE}/ex/jira/${cloudId}/rest/agile/1.0${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })
}

// accountId de l'utilisateur connecté (pour l'auto-assignation).
async function getMyAccountId(accessToken, cloudId) {
  try {
    const res = await jiraFetch(accessToken, cloudId, '/myself')
    if (!res.ok) return null
    return (await res.json()).accountId || null
  } catch { return null }
}

// Datetime ISO complet décalé de N semaines (requis par l'API Agile pour les sprints).
function isoDateTimePlusWeeks(baseIso, weeks) {
  const d = baseIso ? new Date(baseIso) : new Date()
  if (isNaN(d.getTime())) return null
  d.setUTCDate(d.getUTCDate() + Math.round(weeks * 7))
  return d.toISOString()
}

// Récupère l'id du board Scrum du projet.
async function getBoardId(accessToken, cloudId, projectKey) {
  try {
    const res = await agileFetch(accessToken, cloudId, `/board?projectKeyOrId=${encodeURIComponent(projectKey)}&maxResults=5`)
    if (!res.ok) { console.log(`[jira] board lookup failed: ${res.status}`); return null }
    const boards = (await res.json()).values || []
    const scrum = boards.find(b => b.type === 'scrum') || boards[0]
    console.log(`[jira] boards=${boards.length} -> boardId=${scrum?.id} type=${scrum?.type}`)
    return scrum?.id || null
  } catch (e) { console.log(`[jira] board error: ${e.message}`); return null }
}

// Crée (ou réutilise) de vrais Sprints Jira avec dates. Retourne { [sprintNum]: sprintId }.
async function ensureSprints(accessToken, cloudId, boardId, plan, base) {
  const byNum = {}
  if (!boardId) return byNum
  let existing = []
  try {
    const res = await agileFetch(accessToken, cloudId, `/board/${boardId}/sprint?maxResults=50`)
    if (res.ok) existing = (await res.json()).values || []
  } catch { /* pas de sprints listés → on tentera de créer */ }

  for (const sprint of plan.roadmap?.sprints || []) {
    const name = `Sprint ${sprint.sprintId}`
    const found = existing.find(s => s.name === name)
    if (found) { byNum[sprint.sprintId] = found.id; continue }
    try {
      const res = await agileFetch(accessToken, cloudId, '/sprint', {
        method: 'POST',
        body: JSON.stringify({
          name,
          startDate: isoDateTimePlusWeeks(base, (sprint.sprintId - 1) * 2),
          endDate: isoDateTimePlusWeeks(base, sprint.sprintId * 2),
          originBoardId: boardId,
          goal: `${(sprint.stories || []).length} stories — ${sprint.estimatedCost} €`
        })
      })
      if (res.ok) byNum[sprint.sprintId] = (await res.json()).id
      else console.log(`[jira] sprint "${name}" create failed: ${res.status} ${(await res.text()).slice(0, 200)}`)
    } catch (e) { console.log(`[jira] sprint create error: ${e.message}`) }
  }
  console.log(`[jira] sprints ready: ${Object.keys(byNum).length}`)
  return byNum
}

// Range les issues dans leur sprint (batch de 50 max par appel Agile).
async function assignIssuesToSprints(accessToken, cloudId, keysBySprint, sprintIdByNum) {
  for (const [num, sprintId] of Object.entries(sprintIdByNum)) {
    const keys = keysBySprint[num] || []
    for (let i = 0; i < keys.length; i += 50) {
      try {
        const res = await agileFetch(accessToken, cloudId, `/sprint/${sprintId}/issue`, {
          method: 'POST',
          body: JSON.stringify({ issues: keys.slice(i, i + 50) })
        })
        if (!res.ok) console.log(`[jira] assign to sprint ${sprintId} failed: ${res.status} ${(await res.text()).slice(0, 200)}`)
      } catch (e) { console.log(`[jira] assign error: ${e.message}`) }
    }
  }
}

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

// Découvre les ids des champs dynamiques (varient selon le type de projet). Best-effort.
async function discoverFields(accessToken, cloudId) {
  try {
    const res = await jiraFetch(accessToken, cloudId, '/field')
    if (!res.ok) return {}
    const fields = await res.json()
    const find = (re) => (fields.find(f => re.test(f.name)) || {}).id
    const result = {
      storyPoints: find(/story point estimate/i) || find(/story points?/i),
      startDate: find(/^start date$/i) || find(/start date/i) || find(/date de début/i)
    }
    console.log(`[jira] fields: storyPoints=${result.storyPoints} startDate=${result.startDate}`)
    return result
  } catch (e) { console.log(`[jira] fields error: ${e.message}`); return {} }
}

// Date au format YYYY-MM-DD, décalée de N semaines depuis la base (generatedAt). 2 semaines/sprint.
function isoDatePlusWeeks(baseIso, weeks) {
  const d = baseIso ? new Date(baseIso) : new Date()
  if (isNaN(d.getTime())) return null
  d.setUTCDate(d.getUTCDate() + Math.round(weeks * 7))
  return d.toISOString().slice(0, 10)
}

// Récupère les issues déjà créées par VelocityLaunch dans ce projet, indexées par leur label vl-id / vl-epic.
async function fetchManagedIssues(accessToken, cloudId, projectKey) {
  const map = {}
  const jql = `project = "${projectKey}" AND labels = velocitylaunch ORDER BY created ASC`
  try {
    // Nouvel endpoint de recherche (l'ancien /search est déprécié par Atlassian).
    let res = await jiraFetch(accessToken, cloudId, '/search/jql', {
      method: 'POST',
      body: JSON.stringify({ jql, maxResults: 200, fields: ['labels'] })
    })
    if (!res.ok) {
      // Fallback ancien endpoint si le nouveau n'est pas dispo.
      res = await jiraFetch(accessToken, cloudId, `/search?jql=${encodeURIComponent(jql)}&maxResults=200&fields=labels`)
    }
    if (!res.ok) { console.log(`[jira] search failed: ${res.status}`); return map }
    const data = await res.json()
    for (const issue of data.issues || []) {
      for (const label of issue.fields?.labels || []) {
        if (label.startsWith('vl-id:') || label.startsWith('vl-epic:')) map[label] = issue.key
      }
    }
    console.log(`[jira] managed issues found: ${Object.keys(map).length}`)
  } catch (e) { console.log(`[jira] search error: ${e.message}`) }
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
  if (res.ok) return true
  // Certains champs (priorité, assigné, start date, story points) peuvent être refusés selon le projet.
  // On retente avec un sous-ensemble sûr pour ne jamais perdre la mise à jour.
  const { priority, assignee, ...safe } = fields
  const safe2 = { ...safe }
  for (const k of Object.keys(safe2)) {
    if (/^customfield_/.test(k)) delete safe2[k]
  }
  const res2 = await jiraFetch(accessToken, cloudId, `/issue/${key}`, { method: 'PUT', body: JSON.stringify({ fields: safe2 }) })
  return res2.ok
}

const CATEGORY_LABELS = { product: 'produit', marketing: 'marketing', ops: 'ops' }

// Priorité dérivée de l'ordre des sprints (les plus tôt = les plus urgents).
function priorityForSprint(n) {
  if (n <= 1) return 'High'
  if (n <= 2) return 'Medium'
  return 'Low'
}

// Étiquette de label sûre (Jira interdit les espaces).
function labelize(prefix, value) {
  return `${prefix}:${String(value || '').replace(/\s+/g, '-')}`
}

// Crée/met à jour les Epics (1/sprint) puis les Stories rattachées. Retourne la carte des liens.
export async function exportPlanToJira(accessToken, target, plan, lang) {
  const { cloud_id: cloudId, site_url: siteUrl, project_key: projectKey } = target
  const { storyPoints: spField, startDate: startField } = await discoverFields(accessToken, cloudId)
  const managed = await fetchManagedIssues(accessToken, cloudId, projectKey)
  const myAccountId = await getMyAccountId(accessToken, cloudId)
  const boardId = await getBoardId(accessToken, cloudId, projectKey)
  const base = plan.generatedAt

  // Dates du sprint (calendrier réel) : début = base + (n-1)*2 sem., échéance = base + n*2 sem.
  const sprintStart = (n) => isoDatePlusWeeks(base, (n - 1) * 2)
  const sprintDue = (n) => isoDatePlusWeeks(base, n * 2)
  const withDates = (fields, n) => {
    const due = sprintDue(n)
    const start = sprintStart(n)
    if (due) fields.duedate = due
    if (startField && start) fields[startField] = start
    return fields
  }

  let created = 0
  let updated = 0
  const links = {} // vlId -> { key, url }
  const epicKeyBySprint = {}
  const keysBySprint = {} // sprintNum -> [issueKeys] (pour l'assignation aux sprints)

  const browse = (key) => (siteUrl ? `${siteUrl}/browse/${key}` : null)
  const track = (sprintNum, key) => { (keysBySprint[sprintNum] ||= []).push(key) }

  // 1) Epics par phase (= lot de livraison avec budget ; les vrais Sprints Jira gèrent le temps)
  for (const sprint of plan.roadmap?.sprints || []) {
    const epicLabel = `vl-epic:${sprint.sprintId}`
    const summary = `${lang === 'en' ? 'Phase' : 'Phase'} ${sprint.sprintId} — ${sprint.estimatedCost} €`
    const fields = withDates({
      project: { key: projectKey },
      summary: summary.slice(0, 240),
      issuetype: { name: 'Epic' },
      labels: ['velocitylaunch', epicLabel]
    }, sprint.sprintId)
    const existing = managed[epicLabel]
    if (existing) {
      await updateIssue(accessToken, cloudId, existing, withDates({ summary: fields.summary }, sprint.sprintId))
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
      if (story.assignee) labels.push(labelize('equipe', story.assignee)) // rôle / équipe concernée

      const baseFields = withDates({
        summary: `${story.id}: ${story.title}`.slice(0, 240),
        description: adf(descParts.join('')),
        labels,
        priority: { name: priorityForSprint(sprint.sprintId) }
      }, sprint.sprintId)
      if (spField && Number.isFinite(story.effort)) baseFields[spField] = story.effort
      if (myAccountId) baseFields.assignee = { accountId: myAccountId }

      const existing = managed[vlLabel]
      if (existing) {
        await updateIssue(accessToken, cloudId, existing, baseFields)
        links[story.id] = { key: existing, url: browse(existing) }
        track(sprint.sprintId, existing)
        updated++
        continue
      }

      const createFields = { ...baseFields, project: { key: projectKey }, issuetype: { name: 'Story' } }
      const epicKey = epicKeyBySprint[sprint.sprintId]
      if (epicKey) createFields.parent = { key: epicKey }

      try {
        const issue = await createIssue(accessToken, cloudId, createFields)
        links[story.id] = { key: issue.key, url: browse(issue.key) }
        track(sprint.sprintId, issue.key)
        created++
      } catch (e) {
        // Le rattachement à l'Epic (parent) ou le champ story points peuvent être refusés selon le projet.
        // On retente sans parent ni story points pour garantir la création.
        const fallback = { project: { key: projectKey }, summary: baseFields.summary, description: baseFields.description, labels, issuetype: { name: 'Story' } }
        if (baseFields.duedate) fallback.duedate = baseFields.duedate
        try {
          const issue = await createIssue(accessToken, cloudId, fallback)
          links[story.id] = { key: issue.key, url: browse(issue.key) }
          track(sprint.sprintId, issue.key)
          created++
        } catch { /* on saute cette story sans casser l'export */ }
      }
    }
  }

  // 3) Vrais Sprints Jira (dates réelles) + assignation des stories à leur sprint
  const sprintIdByNum = await ensureSprints(accessToken, cloudId, boardId, plan, base)
  await assignIssuesToSprints(accessToken, cloudId, keysBySprint, sprintIdByNum)

  const boardUrl = resolveBoardUrl(siteUrl, projectKey, boardId, links)
  return { created, updated, links, boardUrl, projectKey, siteUrl }
}

// URL fiable vers le board (id déjà récupéré). Fallbacks : board → 1er ticket → page projet.
function resolveBoardUrl(siteUrl, projectKey, boardId, links) {
  if (!siteUrl) return null
  if (boardId) return `${siteUrl}/jira/software/projects/${projectKey}/boards/${boardId}`
  const firstKey = Object.values(links)[0]?.key
  if (firstKey) return `${siteUrl}/browse/${firstKey}`
  return `${siteUrl}/jira/software/projects/${projectKey}/summary`
}
