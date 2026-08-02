import * as db from '../lib/db'
import { createCheckoutSession, verifyWebhookSignature } from '../lib/stripe'

export const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS_HEADERS })
}

// Route /plans, /drafts, /credits, /shares — stockage serveur par utilisateur
// (remplace le localStorage côté client une fois connecté). Retourne `null` si
// le chemin ne correspond à aucune de ces routes, pour laisser le fetch principal
// retomber sur la génération de plan.
export async function handleApi(request, env, url) {
  const { pathname, searchParams } = url
  const method = request.method

  if (pathname === '/plans' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    return json(await db.listPlans(env, userId))
  }

  if (pathname === '/plans' && method === 'POST') {
    const { userId, plan } = await request.json()
    if (!userId || !plan) return json({ error: 'userId and plan required' }, 400)
    return json(await db.upsertPlan(env, userId, plan))
  }

  const planMatch = pathname.match(/^\/plans\/([^/]+)$/)
  if (planMatch && method === 'DELETE') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.deletePlan(env, userId, planMatch[1])
    return json({ ok: true })
  }

  if (pathname === '/drafts' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    return json(await db.listDrafts(env, userId))
  }

  if (pathname === '/drafts' && method === 'POST') {
    const { userId, draft } = await request.json()
    if (!userId || !draft) return json({ error: 'userId and draft required' }, 400)
    return json(await db.upsertDraft(env, userId, draft))
  }

  const draftMatch = pathname.match(/^\/drafts\/([^/]+)$/)
  if (draftMatch && method === 'DELETE') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.deleteDraft(env, userId, draftMatch[1])
    return json({ ok: true })
  }

  if (pathname === '/credits' && method === 'GET') {
    const userId = searchParams.get('userId')
    if (!userId) return json({ error: 'userId required' }, 400)
    return json(await db.getCredits(env, userId))
  }

  if (pathname === '/credits/consume' && method === 'POST') {
    const { userId } = await request.json()
    if (!userId) return json({ error: 'userId required' }, 400)
    await db.consumeCredit(env, userId)
    return json({ ok: true })
  }

  if (pathname === '/shares' && method === 'POST') {
    const { planId } = await request.json()
    if (!planId) return json({ error: 'planId required' }, 400)
    const shareId = await db.createShare(env, planId)
    return json({ shareId })
  }

  const shareMatch = pathname.match(/^\/shares\/([^/]+)$/)
  if (shareMatch && method === 'GET') {
    const resolved = await db.resolveShare(env, shareMatch[1])
    if (!resolved) return json({ error: 'not found or expired' }, 404)
    return json(resolved)
  }

  if (pathname === '/checkout' && method === 'POST') {
    const { userId, email, successUrl, cancelUrl } = await request.json()
    if (!userId || !successUrl || !cancelUrl) {
      return json({ error: 'userId, successUrl and cancelUrl required' }, 400)
    }
    try {
      const session = await createCheckoutSession(env, { userId, email, successUrl, cancelUrl })
      return json({ url: session.url })
    } catch (err) {
      return json({ error: err.message }, 500)
    }
  }

  // Webhook Stripe : active/désactive le Pro selon l'abonnement. La signature est
  // vérifiée avant tout traitement pour ne faire confiance qu'aux events Stripe réels.
  if (pathname === '/webhooks/stripe' && method === 'POST') {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')
    if (!signature || !(await verifyWebhookSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET))) {
      return json({ error: 'invalid signature' }, 400)
    }

    const event = JSON.parse(payload)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.client_reference_id
      if (userId) await db.setPro(env, userId, true, session.customer)
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const userId = await db.findUserIdByStripeCustomer(env, subscription.customer)
      if (userId) await db.setPro(env, userId, false, subscription.customer)
    }

    return json({ received: true })
  }

  return null
}
