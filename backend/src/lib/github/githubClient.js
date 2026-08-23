const AUTH_BASE = 'https://github.com/login/oauth'
const API_BASE = 'https://api.github.com'
// `repo` = accès complet aux dépôts privés/publics (créer issues, labels, milestones).
const SCOPES = 'repo'

// --- OAuth ---
// GitHub OAuth App classique : le token d'accès n'expire pas par défaut, pas de refresh token.

export function buildAuthorizeUrl(env, state) {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: env.GITHUB_REDIRECT_URI,
    scope: SCOPES,
    state,
    allow_signup: 'false'
  })
  return `${AUTH_BASE}/authorize?${params.toString()}`
}

export async function exchangeCode(env, code) {
  const res = await fetch(`${AUTH_BASE}/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: env.GITHUB_REDIRECT_URI
    })
  })
  if (!res.ok) throw new Error(`GitHub token exchange failed: ${res.status}`)
  const data = await res.json()
  if (!data.access_token) throw new Error(`GitHub token exchange error: ${data.error || 'unknown'}`)
  return data.access_token
}

// GitHub rejette avec 403 toute requête sans User-Agent — le fetch natif de Cloudflare
// Workers n'en envoie pas par défaut, contrairement à un navigateur.
function ghFetch(accessToken, path, opts = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'VelocityLaunch',
      ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
      ...opts.headers
    }
  })
}

// --- Découverte ---

// Dépôts sur lesquels l'utilisateur peut créer des issues (owner + collaborateur), triés par
// activité récente. GitHub pagine par 100 max ; une seule page suffit pour un cas d'usage solo/PME.
export async function listRepos(accessToken) {
  const res = await ghFetch(accessToken, '/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator,organization_member')
  if (!res.ok) throw new Error(`GitHub repos failed: ${res.status}`)
  const data = await res.json()
  // Le champ `permissions` n'est pas toujours renvoyé de façon fiable par cet endpoint
  // (dépend du contexte d'auth) — on ne filtre que les dépôts archivés. Si l'utilisateur
  // choisit un dépôt sur lequel il n'a pas les droits d'écriture, la création d'issue
  // échouera simplement pour cette story, sans bloquer le reste de la synchro.
  return data
    .filter(r => !r.archived)
    .map(r => ({ owner: r.owner.login, repo: r.name, fullName: r.full_name, private: r.private, url: r.html_url }))
}

// --- Sync du plan ---

// Crée le label s'il n'existe pas encore (404 → on le crée ; toute autre erreur est ignorée,
// la création de l'issue retombera simplement sans ce label si le dépôt le refuse).
async function ensureLabel(accessToken, owner, repo, name, color) {
  const check = await ghFetch(accessToken, `/repos/${owner}/${repo}/labels/${encodeURIComponent(name)}`)
  if (check.ok) return
  await ghFetch(accessToken, `/repos/${owner}/${repo}/labels`, {
    method: 'POST',
    body: JSON.stringify({ name, color })
  }).catch(() => {})
}

// Date au format YYYY-MM-DD, décalée de N semaines depuis la base (planStartDate/generatedAt) —
// même calcul que jiraClient.js/notionClient.js. 2 semaines/sprint.
function isoDatePlusWeeks(baseIso, weeks) {
  const d = baseIso ? new Date(baseIso) : new Date()
  if (isNaN(d.getTime())) return null
  d.setUTCDate(d.getUTCDate() + Math.round(weeks * 7))
  return d.toISOString().slice(0, 10)
}

// Milestones GitHub : pas de recherche par titre, il faut lister puis matcher soi-même.
// `dueOn` (échéance du sprint, voir isoDatePlusWeeks) est le seul endroit où GitHub expose
// nativement une "due date" — les issues elles-mêmes n'ont pas ce champ (retour utilisateur :
// aucune échéance visible sur les issues GitHub, contrairement à Jira/Notion) ; posée aussi
// en toutes lettres dans le corps de chaque issue (storyBody) pour qu'elle soit visible sans
// avoir à ouvrir le milestone.
async function ensureMilestone(accessToken, owner, repo, title, dueOn, cache) {
  if (cache.has(title)) return cache.get(title)
  const list = await ghFetch(accessToken, `/repos/${owner}/${repo}/milestones?state=all&per_page=100`)
  const existing = list.ok ? (await list.json()).find(m => m.title === title) : null
  const dueOnIso = dueOn ? `${dueOn}T00:00:00Z` : undefined
  if (existing) {
    if (dueOnIso && existing.due_on !== dueOnIso) {
      await ghFetch(accessToken, `/repos/${owner}/${repo}/milestones/${existing.number}`, {
        method: 'PATCH',
        body: JSON.stringify({ due_on: dueOnIso })
      }).catch(() => {})
    }
    cache.set(title, existing.number)
    return existing.number
  }
  const created = await ghFetch(accessToken, `/repos/${owner}/${repo}/milestones`, {
    method: 'POST',
    body: JSON.stringify({ title, ...(dueOnIso ? { due_on: dueOnIso } : {}) })
  })
  if (!created.ok) { cache.set(title, null); return null }
  const num = (await created.json()).number
  cache.set(title, num)
  return num
}

// Issues déjà créées par VelocityLaunch, indexées par leur label caché vl-id:<storyId>.
async function fetchManagedIssues(accessToken, owner, repo) {
  const map = {}
  const res = await ghFetch(accessToken, `/repos/${owner}/${repo}/issues?labels=velocitylaunch&state=all&per_page=100`)
  if (!res.ok) return map
  const issues = await res.json()
  for (const issue of issues) {
    const vlLabel = (issue.labels || []).map(l => (typeof l === 'string' ? l : l.name)).find(n => n?.startsWith('vl-id:'))
    if (vlLabel) map[vlLabel.slice('vl-id:'.length)] = issue.number
  }
  return map
}

function storyBody(story, sprintId, lang, dueOn) {
  const en = lang === 'en'
  return [
    story.description || '',
    story.acceptanceCriteria ? `\n**${en ? 'Acceptance criteria' : 'Critères d\'acceptation'}** : ${story.acceptanceCriteria}` : '',
    `\n**${en ? 'Effort' : 'Effort'}** : ${story.effort} story points`,
    `\n**${en ? 'Estimated cost' : 'Coût estimé'}** : ${story.cost} €`,
    dueOn ? `\n**${en ? 'Due date' : 'Date d\'échéance'}** : ${dueOn}` : '',
    story.assignee ? `\n**${en ? 'Suggested assignee' : 'Responsable suggéré'}** : ${story.assignee}` : '',
    story.dependsOn?.length ? `\n**${en ? 'Depends on' : 'Dépend de'}** : ${story.dependsOn.join(', ')}` : ''
  ].filter(Boolean).join('\n')
}

// Idempotent : une story déjà synchronisée (label vl-id:<id> trouvé) est mise à jour plutôt
// que recréée, comme pour Notion/Jira — on peut relancer la sync sans jamais dupliquer.
export async function exportPlanToGithub(accessToken, target, plan, lang) {
  const { owner, repo } = target
  const managed = await fetchManagedIssues(accessToken, owner, repo)
  const milestoneCache = new Map()
  // planStartDate (pas seulement generatedAt) : même correctif que jiraClient.js/notionClient.js
  // — c'est le champ que "Modifier la date de démarrage" (RoadmapCard) met à jour.
  const base = plan.planStartDate || plan.generatedAt

  await ensureLabel(accessToken, owner, repo, 'velocitylaunch', '9184D9')

  let created = 0
  let updated = 0
  const links = {}

  for (const sprint of plan.roadmap?.sprints || []) {
    const milestoneTitle = `${lang === 'en' ? 'Sprint' : 'Sprint'} ${sprint.sprintId}`
    const dueOn = isoDatePlusWeeks(base, sprint.sprintId * 2)
    const milestoneNumber = await ensureMilestone(accessToken, owner, repo, milestoneTitle, dueOn, milestoneCache)

    for (const story of sprint.stories || []) {
      const vlLabel = `vl-id:${story.id}`
      await ensureLabel(accessToken, owner, repo, vlLabel, 'C2C3C9')

      const labels = ['velocitylaunch', vlLabel, `sprint-${sprint.sprintId}`, story.assignee].filter(Boolean)
      const payload = {
        title: `[${story.id}] ${story.title}`,
        body: storyBody(story, sprint.sprintId, lang, dueOn),
        labels,
        ...(milestoneNumber ? { milestone: milestoneNumber } : {})
      }

      const existingNumber = managed[story.id]
      if (existingNumber) {
        const res = await ghFetch(accessToken, `/repos/${owner}/${repo}/issues/${existingNumber}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        })
        if (res.ok) {
          links[story.id] = { number: existingNumber, url: `https://github.com/${owner}/${repo}/issues/${existingNumber}` }
          updated++
          continue
        }
        // L'issue a pu être supprimée côté GitHub → on retombe sur une création ci-dessous.
      }

      const res = await ghFetch(accessToken, `/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const issue = await res.json()
        links[story.id] = { number: issue.number, url: issue.html_url }
        created++
      }
    }
  }

  return { created, updated, links, repoUrl: `https://github.com/${owner}/${repo}/issues` }
}
