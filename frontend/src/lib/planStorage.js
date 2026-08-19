import { fetchPlans, fetchAllPlans, pushPlan, removePlan, movePlan as moveServerPlan, createShare as serverCreateShare, resolveShare } from './serverStorage'

const SHARES_KEY = 'plp_plan_shares'

// Défini par App.jsx au login/logout — quand présent, chaque écriture locale est
// répliquée vers le stockage serveur (best-effort, fire-and-forget).
let activeUserId = null

// Espace actif : null = personnel, sinon l'id de l'équipe (voir lib/auth.jsx useTeam()).
// Défini par App.jsx à chaque changement d'équipe active — détermine quels plans
// savePlan()/getAllPlans() lisent et écrivent.
let activeTeamId = null

// Rôle de l'utilisateur dans l'équipe active ('org:admin' | 'org:member' | null) — mis à
// jour en même temps que activeTeamId. Évite de faire redescendre le rôle en prop dans
// chaque composant qui peut supprimer un plan ; seul deletePlan() en a besoin.
let activeRole = null

// Nom de l'équipe active et de l'auteur courant — utilisés uniquement pour figer une
// origine lisible sur chaque plan à sa création (voir savePlan). Contrairement à team_id,
// jamais réécrits après coup : un plan déplacé garde la trace de where/qui l'a créé.
let activeTeamName = null
let activeCreatorName = null

export function setActiveUser(userId) {
  activeUserId = userId
}

export function setActiveTeam(teamId, role, teamName) {
  activeTeamId = teamId || null
  activeRole = teamId ? (role || null) : null
  activeTeamName = teamId ? (teamName || null) : null
}

export function setActiveCreator(name) {
  activeCreatorName = name || null
}

// Clé scopée par utilisateur ET par espace actif (personnel vs équipe) — sans ça, tous
// les comptes qui se connectent sur ce même navigateur partagent la même liste de plans
// dans localStorage, et changer d'équipe active mélangerait les plans des différents
// espaces au lieu de les garder cloisonnés.
function plansKey(userId, teamId) {
  return `plp_saved_plans_${userId}__${teamId || 'personal'}`
}

export function savePlan(plan) {
  if (!activeUserId) return plan
  const plans = getAllPlans()
  const isNew = !plan.id
  const planWithMeta = {
    ...plan,
    id: plan.id || generateId(),
    // team_id ne se fixe qu'à la création : un plan reste dans l'espace où il est né,
    // même si on change d'équipe active avant un enregistrement ultérieur.
    team_id: isNew ? activeTeamId : (plan.team_id ?? null),
    // Origine figée pour toujours, y compris à travers un déplacement d'espace (qui lui
    // modifie team_id) — sans ça, impossible de savoir après coup qui a créé un plan et
    // dans quel espace, une fois qu'il a changé de main.
    createdSpaceId: isNew ? activeTeamId : (plan.createdSpaceId !== undefined ? plan.createdSpaceId : (plan.team_id ?? null)),
    createdSpaceName: isNew ? activeTeamName : (plan.createdSpaceName ?? null),
    createdByName: isNew ? activeCreatorName : (plan.createdByName ?? null),
    savedAt: plan.savedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const existing = plans.findIndex(p => p.id === planWithMeta.id)
  if (existing >= 0) {
    plans[existing] = planWithMeta
  } else {
    plans.push(planWithMeta)
  }

  localStorage.setItem(plansKey(activeUserId, planWithMeta.team_id), JSON.stringify(plans))
  pushPlan(activeUserId, planWithMeta, planWithMeta.team_id)
  return planWithMeta
}

// Hydrate le cache local depuis le serveur (multi-appareil, et vue à jour des plans
// d'équipe créés par d'autres membres) — appelé au login et à chaque changement d'équipe
// active. Écrase toujours le cache local (même si le serveur renvoie une liste vide) pour
// qu'un nouveau compte/espace ne se retrouve jamais avec les plans d'un contexte précédent.
export async function syncPlansFromServer(userId, teamId) {
  const serverPlans = await fetchPlans(userId, teamId)
  localStorage.setItem(plansKey(userId, teamId), JSON.stringify(serverPlans || []))
}

export function getAllPlans() {
  if (!activeUserId) return []
  try {
    const stored = localStorage.getItem(plansKey(activeUserId, activeTeamId))
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Tous les plans de l'utilisateur, tous espaces confondus (personnel + chaque équipe listée
// dans teamIds) — pour "Historique de tous les plans" dans Mon compte, qui doit tout
// regrouper au même endroit (contrairement aux tableaux de bord d'espace, eux scopés à un
// seul espace). Repli local si le serveur ne répond pas : scanne tous les espaces déjà mis
// en cache dans ce navigateur (mêmes limites que lib/notifications.js).
export async function fetchAllPlansAggregated(userId, teamIds) {
  const remote = await fetchAllPlans(userId, teamIds || [])
  if (remote?.length) return remote

  if (!userId) return []
  const prefix = `plp_saved_plans_${userId}__`
  const seen = new Map()
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith(prefix)) continue
    try {
      const plans = JSON.parse(localStorage.getItem(key) || '[]')
      for (const plan of plans) seen.set(plan.id, plan)
    } catch { /* clé corrompue, on l'ignore */ }
  }
  return [...seen.values()].sort((a, b) => (b.updatedAt || b.savedAt || '').localeCompare(a.updatedAt || a.savedAt || ''))
}

export function getPlanById(id) {
  const plans = getAllPlans()
  return plans.find(p => p.id === id)
}

export function deletePlan(id) {
  if (!activeUserId) return
  const plans = getAllPlans()
  const filtered = plans.filter(p => p.id !== id)
  localStorage.setItem(plansKey(activeUserId, activeTeamId), JSON.stringify(filtered))
  removePlan(activeUserId, id, activeTeamId, activeRole)
}

// Déplace un plan de l'espace actif vers un autre espace (personnel ou une autre équipe).
// Met à jour les deux caches locaux (retrait de l'espace source, ajout dans l'espace cible)
// pour que la liste affichée reste cohérente sans attendre un resync serveur complet.
export async function movePlanToTeam(id, targetTeamId) {
  if (!activeUserId) return null
  const plans = getAllPlans()
  const plan = plans.find(p => p.id === id)
  if (!plan) return null

  const filtered = plans.filter(p => p.id !== id)
  localStorage.setItem(plansKey(activeUserId, activeTeamId), JSON.stringify(filtered))

  const movedPlan = { ...plan, team_id: targetTeamId || null, updatedAt: new Date().toISOString() }
  const destKey = plansKey(activeUserId, targetTeamId)
  const destPlans = (() => {
    try {
      return JSON.parse(localStorage.getItem(destKey) || '[]')
    } catch {
      return []
    }
  })()
  destPlans.unshift(movedPlan)
  localStorage.setItem(destKey, JSON.stringify(destPlans))

  await moveServerPlan(activeUserId, id, activeTeamId, targetTeamId, activeRole)
  return movedPlan
}

export async function createShareLink(planId) {
  // Un lien de partage n'a de sens que côté serveur (consultable depuis un autre
  // appareil/navigateur). Repli local si le backend est indisponible — le lien ne
  // fonctionnera alors que sur ce même navigateur.
  const server = await serverCreateShare(planId)
  if (server?.shareId) return server.shareId

  const shares = getShares()
  const shareId = generateId()
  const shareData = {
    id: shareId,
    planId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    accessCount: 0
  }
  shares.push(shareData)
  localStorage.setItem(SHARES_KEY, JSON.stringify(shares))
  return shareId
}

export function getShares() {
  try {
    const stored = localStorage.getItem(SHARES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export async function getShareLink(shareId) {
  const server = await resolveShare(shareId)
  if (server?.plan) return server

  const shares = getShares()
  const share = shares.find(s => s.id === shareId)
  if (!share) return null

  const expiry = new Date(share.expiresAt)
  if (expiry < new Date()) return null

  share.accessCount++
  localStorage.setItem(SHARES_KEY, JSON.stringify(shares))

  const plan = getPlanById(share.planId)
  return { share, plan }
}

// Classement personnel (utilisable dans toute liste de plans, pas que la galerie privée) :
// bascule plan.isFavorite et resauvegarde tel quel — même circuit que n'importe quelle autre
// modification de plan, pas de champ ni de table dédiés côté serveur (le JSON complet du
// plan est déjà synchronisé). Prend le plan complet plutôt qu'un id : getPlanById()/
// getAllPlans() ne voient que l'espace actuellement actif, donc un id seul échouerait
// silencieusement pour un plan affiché depuis un autre espace (ex. "Mon compte", qui agrège
// tous les espaces) — savePlan() sait lui déjà écrire au bon endroit via plan.team_id.
export function toggleFavorite(plan) {
  if (!plan) return null
  return savePlan({ ...plan, isFavorite: !plan.isFavorite })
}

// Tags transversaux : libres, définis par l'utilisateur, réutilisables dans "Mes plans"
// comme dans "Ma galerie" — même circuit savePlan() que isFavorite/inGallery ci-dessus,
// pas de table ni de taxonomie dédiée côté serveur.
export function addTag(plan, tag) {
  if (!plan) return null
  const trimmed = tag.trim()
  if (!trimmed) return plan
  const existing = plan.tags || []
  if (existing.some(t => t.toLowerCase() === trimmed.toLowerCase())) return plan
  return savePlan({ ...plan, tags: [...existing, trimmed].slice(0, 10) })
}

export function removeTag(plan, tag) {
  if (!plan) return null
  return savePlan({ ...plan, tags: (plan.tags || []).filter(t => t !== tag) })
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

// Duplique un plan existant plutôt que de tout régénérer depuis le formulaire — utile pour
// tester des variations (persona B2C vs B2B, budget différent...) sans perdre l'original.
// Entièrement client-side : on repart du plan déjà chargé et on repasse par savePlan()
// comme n'importe quelle création, pas besoin d'un aller-retour serveur dédié. Retire tout
// ce qui identifie un plan précis plutôt que son contenu : id/dates (nouvelle création),
// espace d'origine (la copie naît dans l'espace ACTUELLEMENT actif, pas forcément celui de
// l'original), historique de changements et commentaires (conversation propre à l'original,
// pas au copie), et les liens providers (Jira/Linear/GitHub/Notion/Google Calendar
// pointent vers des tickets/pages de l'original — les reprendre tel quel romprait la
// synchronisation ou écraserait par erreur les tickets de l'original au prochain export).
export function duplicatePlan(source, lang) {
  const {
    id, savedAt, updatedAt, team_id, createdSpaceId, createdSpaceName, createdByName,
    changeLog, comments, jira, github, notion, linear, googleCalendar, metricsHistory,
    ...rest
  } = source
  const suffix = lang === 'en' ? '(copy)' : '(copie)'
  const duplicated = {
    ...rest,
    product: { ...source.product, name: `${source.product?.name || ''} ${suffix}`.trim() }
  }
  return savePlan(duplicated)
}
