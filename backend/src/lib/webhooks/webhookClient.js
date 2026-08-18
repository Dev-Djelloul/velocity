import * as db from '../db'

// Génère un secret opaque pour signer les livraisons — pas besoin de cryptographiquement
// fort au sens clé privée, juste imprévisible (32 octets hex, comme un token de session).
export function generateSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Livre l'événement à chaque webhook actif de userId souscrit à eventType — signature
// HMAC-SHA256 du corps JSON exact envoyé (header X-VelocityLaunch-Signature), pour que le
// destinataire vérifie l'authenticité sans jamais voir le secret transiter en clair. Best-
// effort et silencieux comme les autres notifications (email/Slack) : une livraison qui
// échoue ne doit jamais faire échouer l'action qui l'a déclenchée.
export async function triggerWebhooks(env, userId, eventType, data) {
  if (!userId) return
  let hooks
  try {
    hooks = await db.getWebhooksForEvent(env, userId, eventType)
  } catch (e) {
    console.log(`[webhooks] lookup error (${eventType}): ${e.message}`)
    return
  }
  if (!hooks.length) return

  const body = JSON.stringify({ event: eventType, data, timestamp: new Date().toISOString() })

  await Promise.allSettled(hooks.map(async (hook) => {
    try {
      const signature = await hmacSha256Hex(hook.secret, body)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      try {
        await fetch(hook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-VelocityLaunch-Event': eventType,
            'X-VelocityLaunch-Signature': `sha256=${signature}`
          },
          body,
          signal: controller.signal
        })
      } finally {
        clearTimeout(timeout)
      }
    } catch (e) {
      console.log(`[webhooks] delivery error (${eventType} → ${hook.url}): ${e.message}`)
    }
  }))
}
