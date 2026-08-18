import * as db from '../db'

// OAuth 2.0 classique Google (même structure que jiraClient.js) — un seul scope Calendar
// suffit (lecture/écriture des calendriers + de leurs événements).
const AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const API_BASE = 'https://www.googleapis.com/calendar/v3'
const SCOPE = 'https://www.googleapis.com/auth/calendar'

export function buildAuthorizeUrl(env, state) {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CALENDAR_CLIENT_ID,
    redirect_uri: env.GOOGLE_CALENDAR_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent', // sinon Google ne renvoie un refresh_token qu'à la toute première autorisation
    state
  })
  return `${AUTH_BASE}?${params.toString()}`
}

async function tokenRequest(env, body) {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CALENDAR_CLIENT_ID,
      client_secret: env.GOOGLE_CALENDAR_CLIENT_SECRET,
      ...body
    })
  })
  if (!res.ok) throw new Error(`Google token request failed: ${res.status}`)
  return res.json()
}

export async function exchangeCode(env, code) {
  const data = await tokenRequest(env, {
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.GOOGLE_CALENDAR_REDIRECT_URI
  })
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000
  }
}

// Renvoie un access token valide, en rafraîchissant si expiré (marge de 60s) — Google ne
// renvoie pas de nouveau refresh_token sur un refresh classique, donc updateGoogleCalendarTokens
// ne touche que l'access_token (contrairement à Jira qui reçoit un refresh_token à chaque fois).
export async function ensureAccessToken(env, userId, tokenRow) {
  if (tokenRow.expires_at && Date.now() < tokenRow.expires_at - 60000) {
    return tokenRow.access_token
  }
  const data = await tokenRequest(env, { grant_type: 'refresh_token', refresh_token: tokenRow.refresh_token })
  const expiresAt = Date.now() + (data.expires_in || 3600) * 1000
  await db.updateGoogleCalendarTokens(env, userId, { accessToken: data.access_token, expiresAt })
  return data.access_token
}

function gcalFetch(accessToken, path, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })
}

export async function listCalendars(accessToken) {
  const res = await gcalFetch(accessToken, '/users/me/calendarList?maxResults=250')
  if (!res.ok) throw new Error(`Google calendarList failed: ${res.status}`)
  const data = await res.json()
  return (data.items || [])
    .filter(c => c.accessRole === 'owner' || c.accessRole === 'writer')
    .map(c => ({ id: c.id, name: c.summaryOverride || c.summary, primary: !!c.primary }))
}

// Lundi de la semaine N après le début du plan (même logique que weekStartDate dans
// frontend/src/components/GtmCalendarCard.jsx, dupliquée ici côté serveur).
function weekStartDate(planStartDate, week) {
  const base = planStartDate ? new Date(planStartDate) : new Date()
  const start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()))
  start.setUTCDate(start.getUTCDate() + Math.max(0, (week || 1) - 1) * 7)
  return start
}

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date, n) {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + n)
  return d
}

// Récupère les événements déjà créés par VelocityLaunch dans ce calendrier (propriété privée
// vlSource=velocitylaunch), indexés par leur vlId — pour ré-exporter en mise à jour plutôt
// qu'en doublon (même logique que les labels vl-id:X côté Jira/Linear).
async function fetchManagedEvents(accessToken, calendarId) {
  const map = {}
  try {
    const res = await gcalFetch(accessToken,
      `/calendars/${encodeURIComponent(calendarId)}/events?privateExtendedProperty=${encodeURIComponent('vlSource=velocitylaunch')}&maxResults=250&showDeleted=false`)
    if (!res.ok) return map
    const data = await res.json()
    for (const event of data.items || []) {
      const vlId = event.extendedProperties?.private?.vlId
      if (vlId) map[vlId] = event.id
    }
  } catch { /* pas de sync possible → tout sera créé */ }
  return map
}

async function upsertEvent(accessToken, calendarId, managed, vlId, fields) {
  const body = { ...fields, extendedProperties: { private: { vlSource: 'velocitylaunch', vlId } } }
  const existingId = managed[vlId]
  if (existingId) {
    const res = await gcalFetch(accessToken, `/calendars/${encodeURIComponent(calendarId)}/events/${existingId}`, {
      method: 'PATCH', body: JSON.stringify(body)
    })
    return { ok: res.ok, created: false, id: existingId }
  }
  const res = await gcalFetch(accessToken, `/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: 'POST', body: JSON.stringify(body)
  })
  if (!res.ok) return { ok: false, created: false }
  const data = await res.json()
  return { ok: true, created: true, id: data.id }
}

// Synchronise la date de lancement + le calendrier éditorial + le calendrier publicitaire
// vers Google Calendar, en événements "journée entière" idempotents (ré-exporter met à jour
// plutôt que de dupliquer). Slug court et déterministe par item, dérivé de son contenu — les
// calendriers éditorial/pub n'ont pas d'id stable contrairement aux stories de la roadmap,
// donc régénérer entièrement un calendrier avant de re-synchroniser créera de nouveaux
// événements plutôt que de mettre à jour les anciens (limitation connue, voir NEXT_FEATURES.md).
export async function syncPlanToCalendar(accessToken, target, plan, lang) {
  const calendarId = target.calendar_id || 'primary'
  const managed = await fetchManagedEvents(accessToken, calendarId)
  const productName = plan.product?.name || (lang === 'en' ? 'the plan' : 'le plan')

  let created = 0
  let updated = 0

  const track = (res) => {
    if (!res.ok) return
    if (res.created) created++
    else updated++
  }

  if (plan.launchDate) {
    const day = new Date(plan.launchDate)
    const res = await upsertEvent(accessToken, calendarId, managed, 'launch-date', {
      summary: `🚀 ${lang === 'en' ? 'Launch' : 'Lancement'} — ${productName}`,
      description: plan.executiveSummary || '',
      start: { date: isoDate(day) },
      end: { date: isoDate(addDays(day, 1)) }
    })
    track(res)
  }

  for (const item of plan.editorial?.items || []) {
    const start = weekStartDate(plan.planStartDate, item.week)
    const vlId = `editorial:${item.week}:${item.channel}:${(item.title || '').slice(0, 40)}`
    const res = await upsertEvent(accessToken, calendarId, managed, vlId, {
      summary: `📝 ${item.channel} — ${item.title}`.slice(0, 250),
      description: [item.format, item.angle, item.cta].filter(Boolean).join('\n\n'),
      start: { date: isoDate(start) },
      end: { date: isoDate(addDays(start, 1)) }
    })
    track(res)
  }

  for (const campaign of plan.advertising?.campaigns || []) {
    const start = weekStartDate(plan.planStartDate, campaign.week)
    const end = addDays(start, 7)
    const vlId = `advertising:${campaign.week}:${campaign.channel}`
    const res = await upsertEvent(accessToken, calendarId, managed, vlId, {
      summary: `📣 ${campaign.channel} — ${campaign.objective}`.slice(0, 250),
      description: [
        `${lang === 'en' ? 'Format' : 'Format'} : ${campaign.format}`,
        `${lang === 'en' ? 'Audience' : 'Audience'} : ${campaign.audience}`,
        `${lang === 'en' ? 'Budget' : 'Budget'} : ${campaign.budget} €`,
        `KPI : ${campaign.kpi}`
      ].join('\n'),
      start: { date: isoDate(start) },
      end: { date: isoDate(end) }
    })
    track(res)
  }

  // Lien vers la vue générale de l'agenda, jamais vers un événement précis (voir commit
  // précédent : un lien d'événement ne se résout que sous le même compte Google que celui
  // utilisé pour l'export) ni vers ?cid=<calendarId> (ce paramètre déclenche un flux
  // "s'abonner à cet agenda" côté Google — utile pour ajouter le calendrier de quelqu'un
  // d'autre, pas pour ouvrir un agenda qu'on possède déjà, ce qui produit une popup "Ajouter
  // un agenda" au lieu de naviguer dedans). Le calendrier choisi appartient déjà à
  // l'utilisateur et apparaît par défaut dans "Mes agendas" — la vue racine suffit.
  return { created, updated, calendarUrl: 'https://calendar.google.com/calendar/u/0/r' }
}
