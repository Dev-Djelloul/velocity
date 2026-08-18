// Client minimal pour l'API REST Resend (https://resend.com) — pas de SDK, un simple
// fetch suffit et évite une dépendance de plus dans le Worker. Nécessite RESEND_API_KEY
// (secret) et RESEND_FROM (var, ex: "VelocityLaunch <notifications@digitalblueskye.com>",
// le domaine doit être vérifié dans Resend).
export async function sendEmail(env, { to, subject, html }) {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM) {
    console.log('[resend] skipped: not_configured (missing RESEND_API_KEY or RESEND_FROM)')
    return { skipped: true, reason: 'not_configured' }
  }
  console.log(`[resend] sending to=${to} from=${env.RESEND_FROM} subject="${subject}"`)
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: env.RESEND_FROM, to: [to], subject, html })
  })
  if (!res.ok) {
    const body = await res.text()
    console.log(`[resend] send failed: ${res.status} ${body}`)
    throw new Error(`Resend send failed: ${res.status} ${body}`)
  }
  const data = await res.json()
  console.log(`[resend] sent ok id=${data.id}`)
  return data
}

const AGENT_TYPE_LABELS = {
  story_brief: { fr: "brief d'exécution", en: 'execution brief' },
  recalc_kpis: { fr: 'recalcul des KPIs', en: 'KPI recalculation' },
  veille: { fr: 'veille IA', en: 'AI market watch' },
  benchmarks: { fr: 'benchmarks', en: 'benchmarks' },
  editorial: { fr: 'calendrier éditorial', en: 'editorial calendar' },
  advertising: { fr: 'calendrier publicitaire', en: 'advertising calendar' },
  rgpd: { fr: 'conformité RGPD', en: 'GDPR compliance' },
  table: { fr: 'tableau IA', en: 'AI table' }
}

export function agentDoneEmail(lang, { productName, taskType }) {
  const en = lang === 'en'
  const typeLabel = AGENT_TYPE_LABELS[taskType]?.[en ? 'en' : 'fr'] || taskType
  const subject = en
    ? `Your AI agent finished — ${productName || 'your plan'}`
    : `Ton agent IA a terminé — ${productName || 'ton plan'}`
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a">
      <h2 style="color:#6366f1">${en ? 'Task completed' : 'Tâche terminée'}</h2>
      <p>${en
        ? `The AI agent finished a ${typeLabel} on <strong>${productName || 'your plan'}</strong>.`
        : `L'agent IA a terminé un ${typeLabel} sur <strong>${productName || 'ton plan'}</strong>.`}</p>
      <p style="color:#6b7280;font-size:13px;margin-top:32px">VelocityLaunch</p>
    </div>`
  return { subject, html }
}

export function inactivityReminderEmail(lang, { productName, updatedAt }) {
  const en = lang === 'en'
  const subject = en
    ? `Still there? "${productName || 'Your plan'}" hasn't moved in a while`
    : `Toujours là ? "${productName || 'Ton plan'}" n'a pas bougé depuis un moment`
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a">
      <h2 style="color:#6366f1">${en ? 'Inactive plan' : 'Plan inactif'}</h2>
      <p>${en
        ? `<strong>${productName || 'Your plan'}</strong> hasn't been updated since ${updatedAt}. Pick it back up whenever you're ready.`
        : `<strong>${productName || 'Ton plan'}</strong> n'a pas été mis à jour depuis le ${updatedAt}. Reprends-le quand tu veux.`}</p>
      <p style="color:#6b7280;font-size:13px;margin-top:32px">VelocityLaunch</p>
    </div>`
  return { subject, html }
}
