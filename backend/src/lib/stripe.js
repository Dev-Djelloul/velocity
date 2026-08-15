// Intégration Stripe minimale via l'API REST (fetch), sans SDK — évite les soucis
// de compatibilité Node du package `stripe` en environnement Workers.

const STRIPE_API = 'https://api.stripe.com/v1'

function encodeForm(params, prefix = '') {
  const parts = []
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    const fullKey = prefix ? `${prefix}[${key}]` : key
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        const indexedKey = `${fullKey}[${i}]`
        if (typeof item === 'object') {
          parts.push(...encodeForm(item, indexedKey))
        } else {
          parts.push(`${encodeURIComponent(indexedKey)}=${encodeURIComponent(item)}`)
        }
      })
    } else if (typeof value === 'object') {
      parts.push(...encodeForm(value, fullKey))
    } else {
      parts.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`)
    }
  }
  return parts
}

async function stripeRequest(env, path, params) {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: encodeForm(params).join('&')
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || 'Stripe request failed')
  return data
}

// interval: 'year' utilise le prix annuel (remise affichée côté UI) si configuré côté
// Worker, sinon retombe sur le prix mensuel — évite de casser le paiement si le second
// Price Stripe n'a pas encore été créé/configuré.
export async function createCheckoutSession(env, { userId, email, successUrl, cancelUrl, interval }) {
  const priceId = interval === 'year' && env.STRIPE_PRICE_ID_YEARLY
    ? env.STRIPE_PRICE_ID_YEARLY
    : env.STRIPE_PRICE_ID
  return stripeRequest(env, '/checkout/sessions', {
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: userId,
    customer_email: email
  })
}

// Vérifie la signature d'un événement webhook Stripe (schéma `t=...,v1=...`) avec
// HMAC SHA-256, sans dépendance externe — Workers expose SubtleCrypto nativement.
export async function verifyWebhookSignature(payload, signatureHeader, secret) {
  const parts = Object.fromEntries(
    signatureHeader.split(',').map(p => p.split('='))
  )
  const timestamp = parts.t
  const expectedSig = parts.v1
  if (!timestamp || !expectedSig) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signedPayload = `${timestamp}.${payload}`
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
  const computedSig = [...new Uint8Array(signatureBuffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return computedSig === expectedSig
}
