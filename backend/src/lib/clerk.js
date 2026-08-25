// Intégration Clerk côté serveur : vérification des webhooks (format Svix) + appels
// à la Backend API pour appliquer les limites d'espaces d'équipe par plan (voir
// TEAM_SPACE_LIMITS côté frontend, frontend/src/lib/pricingTiers.js — dupliqué ici
// volontairement plutôt que partagé, un Worker et un bundle Vite n'important pas
// le même graphe de modules).
export const TEAM_SPACE_LIMITS = { free: 1, pro: 5 }

const CLERK_API = 'https://api.clerk.com/v1'

// Vérifie la signature Svix d'un webhook Clerk (HMAC SHA-256, secret base64 préfixé
// "whsec_"). Contenu signé : "{svix-id}.{svix-timestamp}.{payload brut}". L'en-tête
// svix-signature peut porter plusieurs versions séparées par des espaces ("v1,xxx v1,yyy") ;
// une seule doit matcher.
export async function verifyClerkWebhook(payload, headers, secret) {
  const svixId = headers.get('svix-id')
  const svixTimestamp = headers.get('svix-timestamp')
  const svixSignature = headers.get('svix-signature')
  if (!svixId || !svixTimestamp || !svixSignature || !secret) return false

  const secretBytes = base64Decode(secret.replace(/^whsec_/, ''))
  const key = await crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signedContent = `${svixId}.${svixTimestamp}.${payload}`
  const sigBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedContent))
  const expected = base64Encode(new Uint8Array(sigBuffer))

  return svixSignature.split(' ').some(part => {
    const [, sig] = part.split(',')
    return sig === expected
  })
}

function base64Decode(b64) {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function base64Encode(bytes) {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

async function clerkRequest(env, path, options = {}) {
  const res = await fetch(`${CLERK_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.CLERK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  if (!res.ok) throw new Error(`Clerk API ${path} failed: ${res.status}`)
  return res.status === 204 ? null : res.json()
}

// Toutes les organisations (espaces d'équipe) dont l'utilisateur est membre, tous rôles
// confondus — reflète ce que le switcher d'espace affiche côté client (team.myTeams).
export async function listUserOrganizationMemberships(env, userId) {
  const data = await clerkRequest(env, `/users/${userId}/organization_memberships?limit=100`)
  return data?.data || []
}

// Membres d'un espace d'équipe (id + nom d'affichage), pour notifier tout le monde sauf
// l'auteur·e d'une édition collaborative (voir planCollabRoom.js) — un plan d'équipe n'a
// pas de "propriétaire" unique pertinent pour ça, contrairement à un plan personnel.
export async function listOrganizationMembers(env, organizationId) {
  const data = await clerkRequest(env, `/organizations/${organizationId}/memberships?limit=100`)
  return (data?.data || []).map(m => ({
    userId: m.public_user_data?.user_id,
    name: [m.public_user_data?.first_name, m.public_user_data?.last_name].filter(Boolean).join(' ') || m.public_user_data?.identifier
  })).filter(m => m.userId)
}

export async function deleteOrganization(env, organizationId) {
  await clerkRequest(env, `/organizations/${organizationId}`, { method: 'DELETE' })
}

// Email principal d'un utilisateur — nécessaire pour retrouver son compte Jira/Linear par
// email lors d'un export (voir jiraClient.js/linearClient.js) : `story.assignedToId` (choisi
// dans le menu déroulant du Backlog, voir BacklogCard.jsx) n'est qu'un id Clerk, jamais une
// adresse email — celle-ci n'est exposée nulle part côté client (publicUserData/
// listOrganizationMembers ci-dessus l'omettent volontairement, restriction Clerk), donc pas
// d'autre choix que ce second appel à la Backend API. Best-effort : jamais bloquant pour
// l'export si Clerk est indisponible ou l'utilisateur introuvable.
export async function getUserEmail(env, userId) {
  const profile = await getUserProfile(env, userId)
  return profile?.email || null
}

// Profil minimal pour les outils d'administration : les données sont récupérées à la
// demande depuis Clerk plutôt que recopiées dans D1, afin que les changements de nom,
// avatar ou dernière connexion restent à jour.
export async function getUserProfile(env, userId) {
  try {
    const data = await clerkRequest(env, `/users/${userId}`)
    const emails = data?.email_addresses || []
    const primary = emails.find(e => e.id === data?.primary_email_address_id) || emails[0]
    const external = data?.external_accounts?.[0]
    return {
      email: primary?.email_address || null,
      name: [data?.first_name, data?.last_name].filter(Boolean).join(' ') || null,
      provider: external?.provider || (external ? 'social' : 'email'),
      avatarUrl: data?.image_url || null,
      lastSignInAt: data?.last_sign_in_at || null
    }
  } catch { return null }
}
