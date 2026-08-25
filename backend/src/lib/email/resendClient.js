// Client minimal pour l'API REST Resend (https://resend.com) — pas de SDK, un simple
// fetch suffit et évite une dépendance de plus dans le Worker. Nécessite RESEND_API_KEY
// (secret) et RESEND_FROM (var, ex: "VelocityLaunch <notifications@digitalblueskye.com>",
// le domaine doit être vérifié dans Resend).
export async function sendEmail(env, { to, subject, html, text }) {
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
    body: JSON.stringify({ from: env.RESEND_FROM, to: [to], subject, html, ...(text ? { text } : {}) })
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

// Logo officiel (chevron dégradé), hébergé sur le site — un data URI serait filtré par
// Gmail, qui n'affiche que les images distantes (https) dans le corps des emails.
const LOGO_URL = 'https://velocity.digitalblueskye.com/favicon.svg'

// Pied de page de marque : logo + wordmark (deux teintes solides — les dégradés CSS via
// background-clip:text ne sont pas fiables dans les clients email, contrairement au web).
function brandSignature() {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:32px;border-top:1px solid #e5e7eb;padding-top:16px">
      <tr>
        <td style="vertical-align:middle;padding-right:8px">
          <img src="${LOGO_URL}" width="20" height="20" alt="VelocityLaunch" style="display:block" />
        </td>
        <td style="vertical-align:middle;font-size:13px;font-weight:600">
          <span style="color:#1a1a1a">elocity</span><span style="color:#6366f1">Launch</span>
        </td>
      </tr>
    </table>`
}

export const AGENT_TYPE_LABELS = {
  story_brief: { fr: "brief d'exécution", en: 'execution brief' },
  recalc_kpis: { fr: 'recalcul des KPIs', en: 'KPI recalculation' },
  risk_analysis: { fr: 'analyse des risques', en: 'risk analysis' },
  budget_optimization: { fr: 'optimisation budgétaire', en: 'budget optimization' },
  dynamic_reschedule: { fr: 'replanification dynamique', en: 'dynamic reschedule' },
  external_signal_prioritization: { fr: 'priorisation par signaux externes', en: 'external signal prioritization' },
  veille: { fr: 'veille IA', en: 'AI market watch' },
  benchmarks: { fr: 'benchmarks', en: 'benchmarks' },
  editorial: { fr: 'calendrier éditorial', en: 'editorial calendar' },
  advertising: { fr: 'calendrier publicitaire', en: 'advertising calendar' },
  rgpd: { fr: 'conformité RGPD', en: 'GDPR compliance' },
  table: { fr: 'tableau IA', en: 'AI table' }
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function betaFeedbackEmail(feedback) {
  const name = truncate(feedback.name, 120) || 'Testeur anonyme'
  const email = truncate(feedback.email, 160)
  const entries = Object.entries(feedback)
    .filter(([key]) => !['website', 'name', 'email'].includes(key) && feedback[key] !== '')
    .map(([key, value]) => `<tr><th style="text-align:left;vertical-align:top;padding:8px;background:#f3f4f6;color:#374151">${esc(key)}</th><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#1a1a1a;white-space:pre-wrap">${esc(Array.isArray(value) ? value.join(', ') : value)}</td></tr>`)
    .join('')
  const text = Object.entries(feedback)
    .filter(([key]) => !['website'].includes(key) && feedback[key] !== '')
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join('\n')
  return {
    subject: `Retour beta VelocityLaunch — ${name}`,
    text,
    html: `<div style="font-family:sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#1a1a1a"><h2 style="color:#6366f1;margin-bottom:4px">Retour test beta</h2><p style="color:#6b7280">${esc(name)}${email ? ` · ${esc(email)}` : ''}</p><table style="border-collapse:collapse;width:100%;font-size:13px">${entries}</table>${brandSignature()}</div>`
  }
}

function truncate(s, max) {
  const str = String(s ?? '')
  return str.length > max ? `${str.slice(0, max - 1)}…` : str
}

// Aperçu HTML du tableau IA généré : un vrai <table> (en-têtes + 4 premières lignes) plutôt
// qu'une simple liste de noms de colonnes — bien plus lisible pour un contenu tabulaire.
function tablePreviewHtml(output) {
  if (!output?.columns?.length || !output?.rows?.length) return ''
  const th = (s) => `<th style="text-align:left;padding:6px 10px;background:#f3f4f6;border:1px solid #e5e7eb;font-size:12px;color:#374151">${esc(s)}</th>`
  const td = (s) => `<td style="padding:6px 10px;border:1px solid #e5e7eb;font-size:12px;color:#1a1a1a">${esc(truncate(s, 40))}</td>`
  const headerRow = `<tr>${output.columns.map(th).join('')}</tr>`
  const bodyRows = output.rows.slice(0, 4).map(row => `<tr>${row.map(td).join('')}</tr>`).join('')
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:16px 0;width:100%">${headerRow}${bodyRows}</table>`
}

// Extrait quelques faits marquants du contenu généré, propres à chaque type — c'est ce
// qui transforme l'email de "tâche terminée" (creux) en aperçu utile du résultat, sans
// avoir à ouvrir l'app pour savoir si ça vaut le coup de regarder.
// Titre + premier aperçu pour une entrée du centre de notifications in-app (cloche du
// header) — même source que l'email (AGENT_TYPE_LABELS, extractHighlights) pour rester
// cohérent, mais un format court adapté à une liste plutôt qu'à un message complet.
export function feedNotificationContent(taskType, output, lang) {
  const en = lang === 'en'
  const typeLabel = AGENT_TYPE_LABELS[taskType]?.[en ? 'en' : 'fr'] || taskType
  const title = en ? `${typeLabel} ready` : `${typeLabel} généré·e`
  const highlights = extractHighlights(taskType, output, en)
  return { title, detail: highlights[0] || null }
}

export function extractHighlights(taskType, output, en) {
  if (!output) return []
  const L = (fr, e) => (en ? e : fr)
  try {
    switch (taskType) {
      case 'veille': {
        const lines = []
        if (output.competitors?.length) lines.push(`${L('Concurrents identifiés', 'Competitors identified')}: ${output.competitors.slice(0, 3).map(c => c.name).join(', ')}`)
        if (output.trends?.length) lines.push(`${L('Tendance clé', 'Key trend')}: ${output.trends[0]}`)
        if (output.signals?.length) lines.push(`${L('Signal à surveiller', 'Signal to watch')}: ${output.signals[0]}`)
        if (output.opportunities?.length) lines.push(`${L('Opportunité', 'Opportunity')}: ${output.opportunities[0]}`)
        if (output.threats?.length) lines.push(`${L('Menace', 'Threat')}: ${output.threats[0]}`)
        return lines
      }
      case 'benchmarks': {
        const lines = []
        if (output.metrics?.length) lines.push(`${L(`${output.metrics.length} métriques comparées au secteur`, `${output.metrics.length} metrics compared to industry`)}`)
        if (output.metrics?.[0]) lines.push(`${output.metrics[0].label || output.metrics[0].name}: ${output.metrics[0].verdict || output.metrics[0].you || ''}`)
        if (output.takeaway) lines.push(`${L('À retenir', 'Takeaway')}: ${output.takeaway}`)
        return lines
      }
      case 'editorial': {
        const lines = []
        if (output.items?.length) lines.push(L(`${output.items.length} contenus planifiés`, `${output.items.length} content pieces planned`))
        output.items?.slice(0, 4).forEach(it => {
          lines.push(`${L('S', 'W')}${it.week} — ${it.channel}${it.format ? ` (${it.format})` : ''} : ${truncate(it.title, 70)}`)
        })
        return lines
      }
      case 'advertising': {
        const lines = []
        if (output.campaigns?.length) lines.push(L(`${output.campaigns.length} campagnes planifiées`, `${output.campaigns.length} campaigns planned`))
        if (output.totalBudget != null) lines.push(`${L('Budget total', 'Total budget')}: ${output.totalBudget} €`)
        output.campaigns?.slice(0, 4).forEach(c => {
          lines.push(`${L('S', 'W')}${c.week} — ${c.channel} (${c.objective})${c.budget != null ? ` — ${c.budget} €` : ''}`)
        })
        return lines
      }
      case 'rgpd': {
        const lines = []
        if (output.applicability) lines.push(output.applicability)
        if (output.checklist?.length) {
          const high = output.checklist.filter(c => c.priority === 'high').length
          lines.push(L(`${output.checklist.length} points de conformité identifiés (${high} prioritaires)`, `${output.checklist.length} compliance items identified (${high} high priority)`))
        }
        if (output.recommendations?.[0]) lines.push(`${L('Recommandation', 'Recommendation')}: ${output.recommendations[0]}`)
        return lines
      }
      case 'table': {
        const lines = []
        if (output.title) lines.push(`${L('Titre', 'Title')}: ${output.title}`)
        if (output.columns?.length && output.rows?.length) lines.push(L(`${output.rows.length} lignes × ${output.columns.length} colonnes`, `${output.rows.length} rows × ${output.columns.length} columns`))
        return lines
      }
      case 'story_brief': {
        const lines = []
        if (output.summary) lines.push(output.summary)
        if (output.steps?.length) lines.push(`${L('Étapes', 'Steps')}: ${output.steps.slice(0, 3).join(' → ')}`)
        if (output.risks?.length) lines.push(`${L('Risque', 'Risk')}: ${output.risks[0]}`)
        return lines
      }
      case 'recalc_kpis': {
        const lines = []
        const adjusted = (output.kpis || []).filter(k => k.newTarget != null)
        if (adjusted.length) lines.push(L(`${adjusted.length} cible(s) ajustée(s)`, `${adjusted.length} target(s) adjusted`))
        adjusted.slice(0, 3).forEach(k => lines.push(`${k.name}: → ${k.newTarget} — ${k.rationale || ''}`))
        return lines
      }
      case 'risk_analysis': {
        const lines = []
        const sevLabel = { high: L('Élevé', 'High'), medium: L('Moyen', 'Medium'), low: L('Faible', 'Low') }
        ;(output.risks || []).slice(0, 4).forEach(r => {
          lines.push(`[${sevLabel[r.severity] || r.severity}] ${r.risk} — ${r.mitigation}`)
        })
        return lines
      }
      case 'budget_optimization': {
        const lines = []
        if (output.assessment) lines.push(output.assessment)
        const dirLabel = { increase: L('↑ augmenter', '↑ increase'), decrease: L('↓ réduire', '↓ decrease'), maintain: L('= maintenir', '= maintain') }
        ;(output.moves || []).slice(0, 4).forEach(m => {
          lines.push(`${m.channel} (${dirLabel[m.direction] || m.direction}) — ${m.rationale}`)
        })
        return lines
      }
      case 'dynamic_reschedule': {
        const lines = []
        if (output.summary) lines.push(output.summary)
        ;(output.moves || []).slice(0, 4).forEach(m => {
          lines.push(`${m.storyId} → ${L('sprint', 'sprint')} ${m.toSprint} — ${m.rationale}`)
        })
        return lines
      }
      case 'external_signal_prioritization': {
        const lines = []
        if (output.summary) lines.push(output.summary)
        ;(output.priorities || []).slice().sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 4).forEach(p => {
          lines.push(`${p.storyId} (${p.score}/10) — ${p.rationale}`)
        })
        return lines
      }
      default:
        return []
    }
  } catch {
    return [] // aperçu best-effort : une forme de donnée inattendue ne doit jamais faire échouer l'email
  }
}

export function agentDoneEmail(lang, { productName, taskType, classification, output, appUrl }) {
  const en = lang === 'en'
  const typeLabel = AGENT_TYPE_LABELS[taskType]?.[en ? 'en' : 'fr'] || taskType
  const highlights = extractHighlights(taskType, output, en)
  const subject = en
    ? `Your AI agent finished — ${productName || 'your plan'}`
    : `Ton agent IA a terminé — ${productName || 'ton plan'}`

  const highlightsHtml = highlights.length
    ? `<ul style="margin:16px 0;padding-left:20px;color:#1a1a1a;line-height:1.6">${highlights.map(h => `<li style="margin-bottom:6px">${esc(h)}</li>`).join('')}</ul>`
    : ''
  const tableHtml = taskType === 'table' ? tablePreviewHtml(output) : ''

  const ctaHtml = appUrl
    ? `<p style="margin-top:28px"><a href="${esc(appUrl)}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600">${en ? 'Open the plan' : 'Ouvrir le plan'}</a></p>`
    : ''

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1a1a">
      <h2 style="color:#6366f1;margin-bottom:4px">${en ? 'Task completed' : 'Tâche terminée'}</h2>
      <p style="color:#6b7280;font-size:13px;margin-top:0">${esc(productName || (en ? 'Your plan' : 'Ton plan'))}${classification ? ` — ${esc(classification)}` : ''}</p>
      <p>${en
        ? `The AI agent finished a <strong>${typeLabel}</strong> on <strong>${esc(productName || 'your plan')}</strong>.`
        : `L'agent IA a terminé un <strong>${typeLabel}</strong> sur <strong>${esc(productName || 'ton plan')}</strong>.`}</p>
      ${highlightsHtml}
      ${tableHtml}
      ${ctaHtml}
      ${brandSignature()}
    </div>`
  return { subject, html }
}

export function veilleUpdateEmail(lang, { productName, newItems, appUrl }) {
  const en = lang === 'en'
  const subject = en
    ? `New market watch findings — ${productName || 'your plan'}`
    : `Nouveautés en veille — ${productName || 'ton plan'}`
  const listHtml = newItems.length
    ? `<ul style="margin:16px 0;padding-left:20px;color:#1a1a1a;line-height:1.6">${newItems.slice(0, 6).map(h => `<li style="margin-bottom:6px">${esc(h)}</li>`).join('')}</ul>`
    : ''
  const ctaHtml = appUrl
    ? `<p style="margin-top:28px"><a href="${esc(appUrl)}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600">${en ? 'Open the plan' : 'Ouvrir le plan'}</a></p>`
    : ''
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1a1a">
      <h2 style="color:#6366f1;margin-bottom:4px">${en ? 'New in your market watch' : 'Nouveau dans ta veille'}</h2>
      <p style="color:#6b7280;font-size:13px;margin-top:0">${esc(productName || (en ? 'Your plan' : 'Ton plan'))}</p>
      <p>${en
        ? `The weekly market watch refresh on <strong>${esc(productName || 'your plan')}</strong> found something new.`
        : `Le rafraîchissement hebdomadaire de la veille sur <strong>${esc(productName || 'ton plan')}</strong> a trouvé du nouveau.`}</p>
      ${listHtml}
      ${ctaHtml}
      ${brandSignature()}
    </div>`
  return { subject, html }
}

export function mentionEmail(lang, { productName, authorName, commentText, appUrl }) {
  const en = lang === 'en'
  const who = authorName || (en ? 'Someone' : 'Quelqu\'un')
  const subject = en
    ? `${who} mentioned you — ${productName || 'a plan'}`
    : `${who} t'a mentionné(e) — ${productName || 'un plan'}`
  const ctaHtml = appUrl
    ? `<p style="margin-top:28px"><a href="${esc(appUrl)}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600">${en ? 'View the comment' : 'Voir le commentaire'}</a></p>`
    : ''
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1a1a">
      <h2 style="color:#6366f1;margin-bottom:4px">${en ? 'You were mentioned' : 'Tu as été mentionné(e)'}</h2>
      <p style="color:#6b7280;font-size:13px;margin-top:0">${esc(productName || (en ? 'A plan' : 'Un plan'))}</p>
      <p>${en
        ? `<strong>${esc(who)}</strong> mentioned you in a comment:`
        : `<strong>${esc(who)}</strong> t'a mentionné(e) dans un commentaire :`}</p>
      <blockquote style="margin:12px 0;padding:12px 16px;border-left:3px solid #6366f1;background:#f5f5ff;color:#1a1a1a;font-style:italic">${esc(commentText || '')}</blockquote>
      ${ctaHtml}
      ${brandSignature()}
    </div>`
  return { subject, html }
}

export function weeklyDigestEmail(lang, { productName, doneStories, totalStories, storiesCompletedThisWeek, budgetPct, commentsThisWeek, appUrl }) {
  const en = lang === 'en'
  const subject = en
    ? `Weekly digest — ${productName || 'your plan'}`
    : `Résumé de la semaine — ${productName || 'ton plan'}`
  const lines = [
    storiesCompletedThisWeek > 0
      ? (en ? `${storiesCompletedThisWeek} stor${storiesCompletedThisWeek === 1 ? 'y' : 'ies'} completed this week` : `${storiesCompletedThisWeek} story(ies) terminée(s) cette semaine`)
      : null,
    en ? `${doneStories}/${totalStories} stories done overall (${Math.round((doneStories / (totalStories || 1)) * 100)}%)` : `${doneStories}/${totalStories} stories terminées au total (${Math.round((doneStories / (totalStories || 1)) * 100)}%)`,
    budgetPct !== null ? (en ? `~${budgetPct}% of estimated budget committed` : `~${budgetPct}% du budget estimé engagé`) : null,
    commentsThisWeek > 0 ? (en ? `${commentsThisWeek} new comment${commentsThisWeek === 1 ? '' : 's'} this week` : `${commentsThisWeek} nouveau(x) commentaire(s) cette semaine`) : null
  ].filter(Boolean)
  const listHtml = `<ul style="margin:16px 0;padding-left:20px;color:#1a1a1a;line-height:1.7">${lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>`
  const ctaHtml = appUrl
    ? `<p style="margin-top:28px"><a href="${esc(appUrl)}" style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600">${en ? 'Open the plan' : 'Ouvrir le plan'}</a></p>`
    : ''
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1a1a1a">
      <h2 style="color:#6366f1;margin-bottom:4px">${en ? 'This week on your plan' : 'Cette semaine sur ton plan'}</h2>
      <p style="color:#6b7280;font-size:13px;margin-top:0">${esc(productName || (en ? 'Your plan' : 'Ton plan'))}</p>
      ${listHtml}
      ${ctaHtml}
      ${brandSignature()}
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
      ${brandSignature()}
    </div>`
  return { subject, html }
}
