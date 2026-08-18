// Injecte des meta og:*/twitter:* spécifiques à un plan dans le index.html statique — les
// robots des réseaux sociaux (LinkedIn, Twitter/X, Facebook, Slack...) ne rendent jamais le
// JavaScript de la SPA, donc les valeurs par défaut du <head> (celles de la page d'accueil)
// sont tout ce qu'ils voient sans cette étape. Un utilisateur humain reçoit exactement le
// même HTML : React démarre normalement et charge le plan côté client comme d'habitude
// (voir parsePrettyShareUrl dans App.jsx).
const BACKEND_URL = 'https://velocity-launch.djelloulabid75.workers.dev'

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function replaceMeta(html, selectorRegex, attr, value) {
  return html.replace(selectorRegex, (full) => full.replace(new RegExp(`(${attr}=")[^"]*(")`), `$1${value}$2`))
}

export function injectPlanMeta(html, { title, description, image, url }) {
  const safeTitle = escapeHtml(title)
  const safeDesc = escapeHtml(description)
  let out = html
  out = out.replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`)
  out = replaceMeta(out, /<meta property="og:title"[^>]*>/, 'content', safeTitle)
  out = replaceMeta(out, /<meta property="og:description"[^>]*>/, 'content', safeDesc)
  out = replaceMeta(out, /<meta property="og:image"[^>]*>/, 'content', image)
  out = replaceMeta(out, /<meta property="og:url"[^>]*>/, 'content', url)
  out = replaceMeta(out, /<meta name="twitter:title"[^>]*>/, 'content', safeTitle)
  out = replaceMeta(out, /<meta name="twitter:description"[^>]*>/, 'content', safeDesc)
  out = replaceMeta(out, /<meta name="twitter:image"[^>]*>/, 'content', image)
  return out
}

// fetchPath : "/shares/:id" ou "/gallery/:id" — les deux renvoient { plan } (voir api.js).
export async function fetchPlanMeta(fetchPath) {
  try {
    const res = await fetch(`${BACKEND_URL}${fetchPath}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.plan || null
  } catch {
    return null
  }
}

export async function servePlanMeta(context, { fetchPath, ogId }) {
  const { request, env } = context
  const plan = await fetchPlanMeta(fetchPath)

  const assetRes = await env.ASSETS.fetch(request)
  const html = await assetRes.text()

  if (!plan) return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } })

  const title = plan.product?.name ? `${plan.product.name} — VelocityLaunch` : 'VelocityLaunch'
  const description = plan.product?.pitch || plan.executiveSummary || 'Plan de lancement produit généré par IA avec VelocityLaunch.'
  const image = `${BACKEND_URL}/og/${ogId}.png`

  const out = injectPlanMeta(html, { title, description, image, url: request.url })
  return new Response(out, { headers: { 'content-type': 'text/html; charset=utf-8' } })
}
