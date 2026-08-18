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

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
function extractHighlights(taskType, output, en) {
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
