// Client GraphQL minimal pour Linear (https://developers.linear.app) — pas d'OAuth,
// l'utilisateur colle sa propre clé API personnelle (Settings > API > Personal API keys
// côté Linear), envoyée telle quelle en header Authorization (pas de préfixe "Bearer",
// contrairement à la plupart des API REST).
import { getUserEmail } from '../clerk'

const API_URL = 'https://api.linear.app/graphql'

async function graphql(apiKey, query, variables) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Linear API error ${res.status}: ${body.slice(0, 300)}`)
  }
  const data = await res.json()
  if (data.errors?.length) throw new Error(`Linear GraphQL error: ${data.errors[0]?.message || 'unknown'}`)
  return data.data
}

// Valide la clé en récupérant l'utilisateur courant — lève si la clé est invalide/révoquée.
export async function validateApiKey(apiKey) {
  const data = await graphql(apiKey, 'query { viewer { id name email } }')
  return data.viewer
}

export async function listTeams(apiKey) {
  const data = await graphql(apiKey, 'query { teams(first: 100) { nodes { id name key } } }')
  return data.teams?.nodes || []
}

// urlKey de l'organisation — nécessaire pour reconstruire une URL d'équipe utilisable
// (linear.app/{urlKey}/team/{teamKey}/active), l'API ne renvoie pas d'URL directe pour une équipe.
async function getOrganizationUrlKey(apiKey) {
  const data = await graphql(apiKey, 'query { organization { urlKey } }')
  return data.organization?.urlKey || null
}

// id Linear correspondant à un email — pour assigner l'issue au vrai membre d'équipe
// choisi dans le Backlog (story.assignedToId, un id Clerk résolu en email par l'appelant).
// Best-effort : la personne peut ne pas avoir de compte sur cette instance Linear.
async function findUserIdByEmail(apiKey, email) {
  try {
    const data = await graphql(apiKey,
      `query($email: String!) { users(filter: { email: { eq: $email } }, first: 1) { nodes { id } } }`,
      { email })
    return data.users?.nodes?.[0]?.id || null
  } catch { return null }
}

async function getTeamStates(apiKey, teamId) {
  const data = await graphql(apiKey,
    `query($teamId: String!) { team(id: $teamId) { states(first: 50) { nodes { id name type } } } }`,
    { teamId })
  return data.team?.states?.nodes || []
}

// Une valeur de statut Linear (type de workflow state) pour un statut de story VelocityLaunch.
// `null` pour un statut absent/inconnu — voir pickState ci-dessous : sans distinction, un
// statut manquant retombait sur "backlog/unstarted" et repoussait silencieusement une
// issue déjà avancée vers l'arrière à chaque resynchronisation (même bug que jiraClient.js,
// jiraCategoryFor).
function stateTypeFor(status) {
  if (status === 'done') return 'completed'
  if (status === 'in_progress') return 'started'
  if (status === 'todo') return ['backlog', 'unstarted']
  return null
}

// Renvoie `null` (pas d'état à appliquer) plutôt que `states[0]` en dernier recours quand
// le statut VelocityLaunch est inconnu — un repli "premier état de la liste" forcerait
// quand même une transition non voulue.
function pickState(states, status) {
  const wanted = stateTypeFor(status)
  if (!wanted) return null
  const types = Array.isArray(wanted) ? wanted : [wanted]
  for (const type of types) {
    const match = states.find(s => s.type === type)
    if (match) return match
  }
  return null
}

async function getOrCreateLabels(apiKey, teamId, names) {
  const data = await graphql(apiKey,
    `query($teamId: String!) { team(id: $teamId) { labels(first: 250) { nodes { id name } } } }`,
    { teamId })
  const existing = data.team?.labels?.nodes || []
  const byName = {}
  for (const l of existing) byName[l.name] = l.id

  for (const name of names) {
    if (byName[name]) continue
    try {
      const created = await graphql(apiKey,
        `mutation($input: IssueLabelCreateInput!) { issueLabelCreate(input: $input) { success issueLabel { id name } } }`,
        { input: { name, teamId } })
      const label = created.issueLabelCreate?.issueLabel
      if (label) byName[label.name] = label.id
    } catch { /* nom déjà pris par une race entre deux créations concurrentes — on relit ensuite */ }
  }
  return byName
}

// Priorité Linear (0-4 : Aucune/Urgente/Haute/Moyenne/Basse) dérivée de l'ordre des sprints.
function priorityForSprint(n) {
  if (n <= 1) return 2 // High
  if (n <= 2) return 3 // Medium
  return 4 // Low
}

// Récupère les issues déjà créées par VelocityLaunch dans cette équipe (label "velocitylaunch"),
// indexées par leur label vl-id:X — pour ré-exporter en mise à jour plutôt qu'en doublon.
async function fetchManagedIssues(apiKey, teamId) {
  const map = {}
  try {
    const data = await graphql(apiKey,
      `query($teamId: String!) {
        issues(filter: { team: { id: { eq: $teamId } }, labels: { name: { eq: "velocitylaunch" } } }, first: 250) {
          nodes { id identifier url labels(first: 20) { nodes { name } } }
        }
      }`,
      { teamId })
    for (const issue of data.issues?.nodes || []) {
      for (const label of issue.labels?.nodes || []) {
        if (label.name.startsWith('vl-id:')) map[label.name] = issue
      }
    }
  } catch { /* pas de sync possible → tout sera créé */ }
  return map
}

// Exporte le plan comme issues Linear plates (pas d'équivalent Epic manipulable par API
// dans une équipe standard) : un label vl-sprint:N par phase joue le rôle de regroupement,
// comme vl-sprint:N pour Jira. MVP volontairement simple (voir NEXT_FEATURES.md).
export async function exportPlanToLinear(apiKey, target, plan, lang, env) {
  const { team_id: teamId, team_key: teamKey } = target
  const [states, orgUrlKey] = await Promise.all([
    getTeamStates(apiKey, teamId),
    getOrganizationUrlKey(apiKey).catch(() => null)
  ])

  // Cache Clerk userId -> id Linear (ou null si introuvable) — voir resolveAssigneeAccountId
  // dans jiraClient.js pour la même idée : plusieurs stories partagent souvent le même
  // assigné, éviter de refaire Clerk + Linear à chaque story. Contrairement à Jira, aucun
  // repli "assigner à l'auteur·e de l'export" n'existait avant ce correctif (retour
  // utilisateur : "l'assignation à une personne" n'était jamais envoyée à Linear).
  const assigneeIdCache = new Map()
  async function resolveAssigneeId(story) {
    if (!story.assignedToId || !env) return null
    if (assigneeIdCache.has(story.assignedToId)) return assigneeIdCache.get(story.assignedToId)
    const email = await getUserEmail(env, story.assignedToId)
    const linearUserId = email ? await findUserIdByEmail(apiKey, email) : null
    assigneeIdCache.set(story.assignedToId, linearUserId)
    return linearUserId
  }

  // planScope distingue CE plan dans le label vl-id: (voir plus bas) — sans lui, deux plans
  // différents dont les stories repartent toutes deux à "US-001" (voir roadmapGenerator.js)
  // partagent le même label dans la même équipe Linear, et fetchManagedIssues traite la
  // story d'un nouveau plan comme "déjà exportée" : elle met à jour (et écrase) l'issue de
  // l'ANCIEN plan au lieu d'en créer une nouvelle (même bug que jiraClient.js, retour
  // utilisateur confirmé côté Jira).
  const planScope = String(plan.id || plan.generatedAt || 'plan').replace(/[^a-zA-Z0-9-]/g, '')
  const sprintIds = (plan.roadmap?.sprints || []).map(s => s.sprintId)
  const storyIds = (plan.roadmap?.sprints || []).flatMap(s => (s.stories || []).map(story => story.id))
  const wantedLabels = ['velocitylaunch', ...sprintIds.map(n => `vl-sprint:${n}`), ...storyIds.map(id => `vl-id:${planScope}-${id}`)]
  const labelIdByName = await getOrCreateLabels(apiKey, teamId, wantedLabels)
  const managed = await fetchManagedIssues(apiKey, teamId)

  let created = 0
  let updated = 0
  const links = {}

  for (const sprint of plan.roadmap?.sprints || []) {
    const sprintLabelId = labelIdByName[`vl-sprint:${sprint.sprintId}`]
    for (const story of sprint.stories || []) {
      const vlLabel = `vl-id:${planScope}-${story.id}`
      const descParts = [
        story.description || '',
        story.acceptanceCriteria ? `\n\n**${lang === 'en' ? 'Acceptance criteria' : 'Critères d\'acceptation'}** : ${story.acceptanceCriteria}` : '',
        `\n\n**${lang === 'en' ? 'Estimated cost' : 'Coût estimé'}** : ${story.cost} €`,
        story.assignee ? `\n\n**${lang === 'en' ? 'Suggested assignee' : 'Responsable suggéré'}** : ${story.assignee}` : '',
        story.dependsOn?.length ? `\n\n**${lang === 'en' ? 'Depends on' : 'Dépend de'}** : ${story.dependsOn.join(', ')}` : ''
      ]
      const labelIds = [labelIdByName.velocitylaunch, labelIdByName[vlLabel], sprintLabelId].filter(Boolean)
      const state = pickState(states, story.status)
      const assigneeId = await resolveAssigneeId(story)

      const fields = {
        title: `${story.id}: ${story.title}`.slice(0, 255),
        description: descParts.join(''),
        priority: priorityForSprint(sprint.sprintId),
        labelIds,
        ...(state ? { stateId: state.id } : {}),
        ...(assigneeId ? { assigneeId } : {})
      }

      const existing = managed[vlLabel]
      if (existing) {
        try {
          await graphql(apiKey,
            `mutation($id: String!, $input: IssueUpdateInput!) { issueUpdate(id: $id, input: $input) { success } }`,
            { id: existing.id, input: fields })
          links[story.id] = { key: existing.identifier, url: existing.url }
          updated++
        } catch { /* on saute cette mise à jour sans casser l'export */ }
        continue
      }

      try {
        const res = await graphql(apiKey,
          `mutation($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { id identifier url } } }`,
          { input: { ...fields, teamId } })
        const issue = res.issueCreate?.issue
        if (issue) {
          links[story.id] = { key: issue.identifier, url: issue.url }
          created++
        }
      } catch { /* on saute cette story sans casser l'export */ }
    }
  }

  const boardUrl = orgUrlKey && teamKey ? `https://linear.app/${orgUrlKey}/team/${teamKey}/active` : null

  return { created, updated, links, boardUrl, teamKey }
}
