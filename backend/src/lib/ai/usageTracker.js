// Compteur d'appels IA par jour, stocké dans le namespace KV AI_USAGE.
// Pose les bases du modèle à crédits prévu en Phase 3 — pas de limite appliquée pour l'instant,
// on se contente de compter pour connaître le volume réel avant de dimensionner des paliers.

function todayKey(date = new Date()) {
  return `usage:${date.toISOString().slice(0, 10)}`
}

const NINETY_DAYS = 60 * 60 * 24 * 90

export async function recordUsage(env) {
  if (!env?.AI_USAGE) return

  const key = todayKey()
  const current = await env.AI_USAGE.get(key)
  const count = current ? parseInt(current, 10) + 1 : 1
  await env.AI_USAGE.put(key, String(count), { expirationTtl: NINETY_DAYS })
}

export async function getUsage(env, date) {
  if (!env?.AI_USAGE) return 0

  const key = date ? `usage:${date}` : todayKey()
  const value = await env.AI_USAGE.get(key)
  return value ? parseInt(value, 10) : 0
}
