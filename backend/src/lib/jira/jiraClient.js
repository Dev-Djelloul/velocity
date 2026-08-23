import * as db from '../db'
import { getUserEmail } from '../clerk'

const AUTH_BASE = 'https://auth.atlassian.com'
const API_BASE = 'https://api.atlassian.com'
// Scopes classiques 3LO (couvrent l'API REST v3) + offline_access pour le refresh token,
// + scopes granulaires Jira Software pour l'API Agile (board/sprint natifs — retour
// utilisateur : le panneau de détail Jira affichait "Sprint : Aucun" malgré le
// regroupement par Phase/Epic + label vl-sprint:N). Mixer scopes classiques et granulaires
// dans une même autorisation est accepté par Atlassian tant que l'appli déclarée sur
// developer.atlassian.com a bien ces scopes granulaires activés dans ses permissions
// ("Jira Software API" → Board/Sprint) — à vérifier/activer côté console développeur.
// `read:project:jira` est INDISPENSABLE en plus de read:board-scope:jira-software : sans
// lui, /rest/agile/1.0/board renvoie 401 "Unauthorized; scope does not match" MÊME si le
// token contient bien read:board-scope:jira-software (confirmé en debug live : le scope
// apparaissait dans /oauth/token/accessible-resources mais l'appel échouait quand même —
// cause identifiée via le forum développeur Atlassian, l'API Agile exige ce scope
// supplémentaire non documenté à côté du scope "board").
// Un utilisateur déjà connecté AVANT cet ajout doit se reconnecter (son token actuel n'a
// pas ces scopes) ; toutes les fonctions Agile ci-dessous sont best-effort et se taisent
// silencieusement (repli sur le comportement précédent) tant que ce n'est pas fait.
const SCOPES = 'read:jira-work write:jira-work read:jira-user offline_access read:board-scope:jira-software read:sprint:jira-software write:sprint:jira-software read:project:jira'

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

// Board Scrum du projet (seul type de board qui supporte des sprints natifs — un board
// Kanban n'en a pas). Best-effort : renvoie null aussi bien si le projet n'a pas de board
// scrum que si le token n'a pas encore les scopes Agile (utilisateur pas encore reconnecté
// depuis l'ajout de cette fonctionnalité) — dans les deux cas l'export continue sans sprint
// natif, exactement comme avant.
async function findScrumBoardId(accessToken, cloudId, projectKey) {
  try {
    const res = await agileFetch(accessToken, cloudId, `/board?projectKeyOrId=${encodeURIComponent(projectKey)}&maxResults=50`)
    if (!res.ok) {
      console.error('[jira-sprint] board fetch failed', res.status, await res.text())
      return null
    }
    const data = await res.json()
    const board = (data.values || []).find(b => b.type === 'scrum')
    return board?.id ?? null
  } catch (e) {
    console.error('[jira-sprint] board fetch threw', e?.message)
    return null
  }
}

// Sprints déjà présents sur ce board, indexés par leur nom exact (voir sprintNameFor plus
// bas) — pour ne pas recréer un sprint Jira à chaque resynchronisation du même plan.
async function fetchExistingSprints(accessToken, cloudId, boardId) {
  const map = {}
  try {
    let startAt = 0
    for (;;) {
      const res = await agileFetch(accessToken, cloudId, `/board/${boardId}/sprint?startAt=${startAt}&maxResults=50`)
      if (!res.ok) break
      const data = await res.json()
      for (const s of data.values || []) map[s.name] = s.id
      if (data.isLast || !data.values?.length) break
      startAt += data.values.length
    }
  } catch { /* best-effort */ }
  return map
}

async function createSprint(accessToken, cloudId, boardId, name, startDate, endDate) {
  try {
    const res = await agileFetch(accessToken, cloudId, '/sprint', {
      method: 'POST',
      body: JSON.stringify({
        name,
        originBoardId: boardId,
        ...(startDate ? { startDate: `${startDate}T00:00:00.000Z` } : {}),
        ...(endDate ? { endDate: `${endDate}T00:00:00.000Z` } : {})
      })
    })
    if (!res.ok) {
      console.error('[jira-sprint] createSprint failed', res.status, await res.text())
      return null
    }
    const data = await res.json()
    return data.id ?? null
  } catch (e) {
    console.error('[jira-sprint] createSprint threw', e?.message)
    return null
  }
}

// Affecte des issues à un sprint natif Jira (l'API limite à 50 par appel — une phase
// VelocityLaunch en compte rarement plus, mais on découpe par sécurité).
async function addIssuesToSprint(accessToken, cloudId, sprintId, issueKeys) {
  if (!issueKeys.length) return
  try {
    for (let i = 0; i < issueKeys.length; i += 50) {
      const res = await agileFetch(accessToken, cloudId, `/sprint/${sprintId}/issue`, {
        method: 'POST',
        body: JSON.stringify({ issues: issueKeys.slice(i, i + 50) })
      })
      if (!res.ok) console.error('[jira-sprint] addIssuesToSprint failed', sprintId, res.status, await res.text())
    }
  } catch (e) {
    console.error('[jira-sprint] addIssuesToSprint threw', e?.message)
  }
}

export async function listProjects(accessToken, cloudId) {
  const res = await jiraFetch(accessToken, cloudId, '/project/search?maxResults=50&orderBy=name')
  if (!res.ok) throw new Error(`Jira projects failed: ${res.status}`)
  const data = await res.json()
  return (data.values || []).map(p => ({ key: p.key, name: p.name, id: p.id, style: p.style }))
}

// --- Export ---

// accountId de l'utilisateur connecté (repli d'auto-assignation quand une story n'a pas
// d'assigné réel choisi dans le Backlog — voir resolveAssigneeAccountId ci-dessous).
async function getMyAccountId(accessToken, cloudId) {
  try {
    const res = await jiraFetch(accessToken, cloudId, '/myself')
    if (!res.ok) return null
    return (await res.json()).accountId || null
  } catch { return null }
}

// accountId Jira correspondant à un email — pour assigner le ticket au vrai membre
// d'équipe choisi dans le Backlog (story.assignedToId, un id Clerk résolu en email par
// l'appelant), pas seulement à l'auteur·e du token OAuth. Best-effort : la personne peut
// tout simplement ne pas avoir de compte Jira sur ce site.
async function findAccountIdByEmail(accessToken, cloudId, email) {
  try {
    const res = await jiraFetch(accessToken, cloudId, `/user/search?query=${encodeURIComponent(email)}`)
    if (!res.ok) return null
    const users = await res.json()
    const match = users.find(u => (u.emailAddress || '').toLowerCase() === email.toLowerCase()) || users[0]
    return match?.accountId || null
  } catch { return null }
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
    return {
      storyPoints: find(/story point estimate/i) || find(/story points?/i),
      startDate: find(/^start date$/i) || find(/start date/i) || find(/date de début/i)
    }
  } catch { return {} }
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

// Retourne { ok, retryFields } plutôt qu'un simple booléen — retryFields liste les champs
// (priorité, assigné, points, start date...) retirés par le repli "sous-ensemble sûr" pour
// que l'appelant puisse retenter de les poser via l'écran de transition (voir transitionTo)
// plutôt que de les perdre silencieusement. Cas confirmé (retour utilisateur, capture à
// l'appui, écart de 8 points constaté entre l'app et Jira) : un ticket déjà "Terminé" refuse
// souvent l'édition directe de champs personnalisés (story points inclus) hors écran de
// transition — cette voie PUT simple échouait alors systématiquement pour toute story qui
// avait déjà été marquée Terminée lors d'une synchronisation précédente, silencieusement.
async function updateIssue(accessToken, cloudId, key, fields) {
  const res = await jiraFetch(accessToken, cloudId, `/issue/${key}`, { method: 'PUT', body: JSON.stringify({ fields }) })
  if (res.ok) return { ok: true, retryFields: null }
  // Certains champs (priorité, assigné, start date, story points) peuvent être refusés selon le projet.
  // On retente avec un sous-ensemble sûr pour ne jamais perdre la mise à jour.
  const { priority, assignee, ...safe } = fields
  const retryFields = {}
  if (priority !== undefined) retryFields.priority = priority
  if (assignee !== undefined) retryFields.assignee = assignee
  const safe2 = { ...safe }
  for (const k of Object.keys(safe2)) {
    if (/^customfield_/.test(k)) { retryFields[k] = safe2[k]; delete safe2[k] }
  }
  const res2 = await jiraFetch(accessToken, cloudId, `/issue/${key}`, { method: 'PUT', body: JSON.stringify({ fields: safe2 }) })
  return { ok: res2.ok, retryFields: Object.keys(retryFields).length ? retryFields : null }
}

// Transitionne un ticket vers une catégorie de statut donnée ('done' ou 'new'/'indeterminate').
// Dans Jira le statut ne se met pas via un champ mais via une transition disponible.
// `retryFields` (optionnel) : champs qu'un PUT direct venait de refuser sur ce ticket (voir
// updateIssue) — repassés ICI, dans le corps de la requête de transition elle-même. Jira
// autorise l'édition de champs via l'écran de transition même quand une modification
// directe est refusée sur un ticket déjà clôturé ("Terminé") — c'est le seul moyen de
// récupérer des points/priorité/assigné qui viennent d'être silencieusement perdus.
async function transitionTo(accessToken, cloudId, key, targetCategory, retryFields) {
  if (!targetCategory) return // statut VelocityLaunch absent/inconnu : ne pas toucher au ticket
  try {
    const res = await jiraFetch(accessToken, cloudId, `/issue/${key}/transitions`)
    if (!res.ok) return
    const { transitions = [] } = await res.json()
    const match = transitions.find(tr => tr.to?.statusCategory?.key === targetCategory)
    if (!match) return
    const body = { transition: { id: match.id } }
    if (retryFields) body.fields = retryFields
    await jiraFetch(accessToken, cloudId, `/issue/${key}/transitions`, {
      method: 'POST',
      body: JSON.stringify(body)
    })
  } catch { /* transition best-effort */ }
}

// Catégorie de statut Jira cible pour un statut de story VelocityLaunch. `null` en retour
// (statut absent/inconnu) signifie explicitement "ne pas transitionner" — auparavant un
// statut manquant retombait sur 'new', ce qui repoussait silencieusement un ticket déjà
// avancé (En cours/Terminé) vers "À faire" à chaque resynchronisation dès que la story
// correspondante arrivait sans son champ `status` (retour utilisateur : les statuts
// "à faire/en cours/terminées" n'étaient "pas du tout pris en compte" après un export).
function jiraCategoryFor(status) {
  if (status === 'done') return 'done'
  if (status === 'in_progress') return 'indeterminate'
  if (status === 'todo') return 'new'
  return null
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
export async function exportPlanToJira(accessToken, target, plan, lang, env) {
  const { cloud_id: cloudId, site_url: siteUrl, project_key: projectKey } = target
  const { storyPoints: spField, startDate: startField } = await discoverFields(accessToken, cloudId)
  const managed = await fetchManagedIssues(accessToken, cloudId, projectKey)
  const myAccountId = await getMyAccountId(accessToken, cloudId)
  // Cache Clerk userId -> accountId Jira (ou null si introuvable) : plusieurs stories
  // partagent souvent le même assigné, pas besoin de refaire l'aller-retour Clerk + Jira
  // à chaque fois. Repli sur myAccountId (l'auteur·e de l'export) quand story.assignedToId
  // est absent (aucune personne choisie dans le Backlog) ou ne correspond à aucun compte
  // Jira connu — comportement identique à avant pour ce cas-là.
  const accountIdCache = new Map()
  async function resolveAssigneeAccountId(story) {
    if (!story.assignedToId || !env) return myAccountId
    if (accountIdCache.has(story.assignedToId)) return accountIdCache.get(story.assignedToId) ?? myAccountId
    const email = await getUserEmail(env, story.assignedToId)
    const accountId = email ? await findAccountIdByEmail(accessToken, cloudId, email) : null
    accountIdCache.set(story.assignedToId, accountId)
    return accountId ?? myAccountId
  }
  const base = plan.generatedAt
  // Identifiant qui distingue CE plan dans les labels vl-id:/vl-epic: (voir plus bas) —
  // plan.id peut être absent pour un plan pas encore sauvegardé au moins une fois (voir
  // PlanViewer.jsx, `if (plan.id) savePlan(...)` à plusieurs endroits) ; generatedAt (un
  // timestamp, toujours présent) sert de repli pour ne jamais retomber sur une valeur
  // partagée par deux plans différents.
  // Nettoyé (alphanumérique uniquement) : generatedAt est un timestamp ISO avec des
  // caractères (":", ".") que Jira n'accepte pas forcément dans une valeur de label.
  const planScope = String(plan.id || plan.generatedAt || 'plan').replace(/[^a-zA-Z0-9-]/g, '')

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
  const storyKeysBySprint = {} // sprintId -> [issueKey, ...], pour l'affectation au sprint natif (étape 3)

  const browse = (key) => (siteUrl ? `${siteUrl}/browse/${key}` : null)

  // 1) Epics par phase (= lot de livraison, avec budget ; le regroupement par phase + label vl-sprint:N joue le rôle de sprint)
  for (const sprint of plan.roadmap?.sprints || []) {
    // planId préfixé dans le label (pas juste sprint.sprintId) : sinon deux plans DIFFÉRENTS
    // partagent le même sprintId "1, 2, 3…" (chaque plan repart de 1), et fetchManagedIssues
    // les traite comme la MÊME epic dès qu'ils atterrissent dans le même projet Jira — un
    // nouveau plan mettait alors à jour (et écrasait) les tickets d'un plan précédent
    // (retour utilisateur, confirmé en capture : les tickets d'un ancien plan se
    // retrouvaient réécrits par le nouveau).
    const epicLabel = `vl-epic:${planScope}-${sprint.sprintId}`
    const summary = `${lang === 'en' ? 'Phase' : 'Phase'} ${sprint.sprintId} — ${sprint.estimatedCost} €`
    const fields = withDates({
      project: { key: projectKey },
      summary: summary.slice(0, 240),
      issuetype: { name: 'Epic' },
      labels: ['velocitylaunch', epicLabel]
    }, sprint.sprintId)
    // Total des points de la phase reporté sur l'Epic elle-même (retour utilisateur : le
    // panneau de détail Jira d'une Epic affichait "Story point estimate : Aucun" alors que
    // chaque story enfant portait bien ses propres points). Best-effort : certains types
    // "Epic" refusent ce champ selon la config du projet, updateIssue/createIssue gèrent déjà
    // ce cas via leur repli sur un sous-ensemble de champs sûrs.
    if (spField) {
      const epicPoints = (sprint.stories || []).reduce((sum, s) => sum + (Number.isFinite(s.effort) ? s.effort : 0), 0)
      if (epicPoints > 0) fields[spField] = epicPoints
    }
    const existing = managed[epicLabel]
    if (existing) {
      await updateIssue(accessToken, cloudId, existing, withDates({ summary: fields.summary, ...(spField && fields[spField] != null ? { [spField]: fields[spField] } : {}) }, sprint.sprintId))
      epicKeyBySprint[sprint.sprintId] = existing
      updated++
    } else {
      try {
        const issue = await createIssue(accessToken, cloudId, fields)
        epicKeyBySprint[sprint.sprintId] = issue.key
        created++
      } catch {
        // Le champ story points sur une Epic est refusé par certains templates de projet
        // (ex. projets "Business"/ITSM) : on retente sans lui plutôt que de perdre l'Epic entière.
        if (spField && fields[spField] != null) {
          try {
            const { [spField]: _drop, ...withoutPoints } = fields
            const issue = await createIssue(accessToken, cloudId, withoutPoints)
            epicKeyBySprint[sprint.sprintId] = issue.key
            created++
          } catch { /* Epic peut être indisponible dans certains projets ; on continue sans parent */ }
        }
      }
    }
  }

  // 2) Stories
  for (const sprint of plan.roadmap?.sprints || []) {
    for (const story of sprint.stories || []) {
      // Même correctif que epicLabel ci-dessus : story.id ("US-001", "US-002"…) repart de 1
      // à CHAQUE plan généré (voir roadmapGenerator.js) — sans le planId dans le label, la
      // story US-001 d'un nouveau plan matchait celle d'un ancien plan dans le même projet
      // Jira et écrasait son ticket au lieu d'en créer un nouveau.
      const vlLabel = `vl-id:${planScope}-${story.id}`
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
      // Le vrai membre choisi dans le Backlog (story.assignedToId) plutôt que
      // systématiquement l'auteur·e de l'export (retour utilisateur : l'assignation à une
      // personne précise "n'était pas passée" malgré un choix fait dans le Backlog).
      const assigneeAccountId = await resolveAssigneeAccountId(story)
      if (assigneeAccountId) baseFields.assignee = { accountId: assigneeAccountId }

      const existing = managed[vlLabel]
      if (existing) {
        // retryFields : champs (points, priorité, assigné…) qu'un ticket déjà "Terminé" a
        // refusés en PUT direct — on les repasse via l'écran de transition juste après, seul
        // moyen de les récupérer sans les perdre silencieusement (retour utilisateur : écart
        // de points constaté entre l'app et Jira sur des stories redécochées puis re-syncées).
        const { retryFields } = await updateIssue(accessToken, cloudId, existing, baseFields)
        links[story.id] = { key: existing, url: browse(existing) }
        ;(storyKeysBySprint[sprint.sprintId] ||= []).push(existing)
        await transitionTo(accessToken, cloudId, existing, jiraCategoryFor(story.status), retryFields)
        updated++
        continue
      }

      const createFields = { ...baseFields, project: { key: projectKey }, issuetype: { name: 'Story' } }
      const epicKey = epicKeyBySprint[sprint.sprintId]
      if (epicKey) createFields.parent = { key: epicKey }

      try {
        const issue = await createIssue(accessToken, cloudId, createFields)
        links[story.id] = { key: issue.key, url: browse(issue.key) }
        ;(storyKeysBySprint[sprint.sprintId] ||= []).push(issue.key)
        await transitionTo(accessToken, cloudId, issue.key, jiraCategoryFor(story.status))
        created++
      } catch (e) {
        // Le rattachement à l'Epic (parent) ou le champ story points peuvent être refusés selon le projet.
        // On retente sans parent ni story points pour garantir la création.
        const fallback = { project: { key: projectKey }, summary: baseFields.summary, description: baseFields.description, labels, issuetype: { name: 'Story' } }
        if (baseFields.duedate) fallback.duedate = baseFields.duedate
        try {
          const issue = await createIssue(accessToken, cloudId, fallback)
          links[story.id] = { key: issue.key, url: browse(issue.key) }
          ;(storyKeysBySprint[sprint.sprintId] ||= []).push(issue.key)
          await transitionTo(accessToken, cloudId, issue.key, jiraCategoryFor(story.status))
          created++
        } catch { /* on saute cette story sans casser l'export */ }
      }
    }
  }

  // 3) Sprints natifs Jira (API Agile) : best-effort, entièrement silencieux si le projet n'a
  // pas de board Scrum ou si le token n'a pas encore les scopes Agile (voir SCOPES plus haut) —
  // dans ces cas le regroupement par Phase (Epic) + label vl-sprint:N (déjà posé ci-dessus)
  // reste la seule information de "sprint" disponible, comme avant cet ajout.
  try {
    const boardId = await findScrumBoardId(accessToken, cloudId, projectKey)
    if (boardId) {
      const existingSprints = await fetchExistingSprints(accessToken, cloudId, boardId)
      for (const sprint of plan.roadmap?.sprints || []) {
        const keys = storyKeysBySprint[sprint.sprintId] || []
        if (!keys.length) continue
        // Nom incluant le produit du plan (pas juste "Phase N") : le board Jira est partagé
        // par TOUS les plans synchronisés dans ce projet, et sprint.sprintId repart de 1 à
        // chaque plan (même limite que epicLabel/vlLabel plus haut) — sans ça, "Phase 1" de
        // deux plans différents partagerait le même sprint Jira.
        const sprintName = `${plan.product?.name || (lang === 'en' ? 'Plan' : 'Plan')} · ${lang === 'en' ? 'Phase' : 'Phase'} ${sprint.sprintId}`.slice(0, 60)
        let sprintId = existingSprints[sprintName]
        if (!sprintId) sprintId = await createSprint(accessToken, cloudId, boardId, sprintName, sprintStart(sprint.sprintId), sprintDue(sprint.sprintId))
        if (sprintId) await addIssuesToSprint(accessToken, cloudId, sprintId, keys)
      }
    }
  } catch { /* API Agile indisponible : on garde le regroupement Epic + label existant */ }

  const boardUrl = resolveBoardUrl(siteUrl, projectKey, links)
  return { created, updated, links, boardUrl, projectKey, siteUrl }
}

// URL d'ouverture dans Jira : 1er ticket créé (fiable), sinon page projet.
function resolveBoardUrl(siteUrl, projectKey, links) {
  if (!siteUrl) return null
  const firstKey = Object.values(links)[0]?.key
  if (firstKey) return `${siteUrl}/browse/${firstKey}`
  return `${siteUrl}/jira/software/projects/${projectKey}/summary`
}
