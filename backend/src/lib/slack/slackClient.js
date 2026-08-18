// Notifications Slack via Incoming Webhook — volontairement plus léger que Notion/Jira/GitHub
// (pas d'OAuth) : l'utilisateur crée son propre webhook dans Slack (Apps > Incoming Webhooks)
// et colle l'URL dans Paramètres. Un seul POST suffit, pas de compte "app" à publier.
export async function sendSlackMessage(webhookUrl, { text, blocks }) {
  if (!webhookUrl) return { skipped: true, reason: 'not_configured' }
  console.log(`[slack] sending to webhook (…${webhookUrl.slice(-8)})`)
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(blocks ? { text, blocks } : { text })
  })
  if (!res.ok) {
    const body = await res.text()
    console.log(`[slack] send failed: ${res.status} ${body}`)
    throw new Error(`Slack send failed: ${res.status} ${body}`)
  }
  console.log('[slack] sent ok')
  return { ok: true }
}

// Construit un message Slack (Block Kit) à partir des mêmes highlights que l'email —
// mêmes données, format adapté (Markdown Slack plutôt que HTML).
export function agentDoneSlackMessage(lang, { productName, taskType, typeLabel, highlights, appUrl }) {
  const en = lang === 'en'
  const title = en
    ? `✅ AI agent finished — ${productName || 'your plan'}`
    : `✅ Ton agent IA a terminé — ${productName || 'ton plan'}`
  const bodyLines = [
    en
      ? `The AI agent finished a *${typeLabel}* on *${productName || 'your plan'}*.`
      : `L'agent IA a terminé un *${typeLabel}* sur *${productName || 'ton plan'}*.`,
    ...(highlights || []).slice(0, 6).map(h => `• ${h}`)
  ]
  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: title, emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: bodyLines.join('\n') } }
  ]
  if (appUrl) {
    blocks.push({
      type: 'actions',
      elements: [{ type: 'button', text: { type: 'plain_text', text: en ? 'Open the plan' : 'Ouvrir le plan' }, url: appUrl }]
    })
  }
  return { text: title, blocks }
}

export function veilleUpdateSlackMessage(lang, { productName, newItems, appUrl }) {
  const en = lang === 'en'
  const title = en
    ? `🔎 New market watch findings — ${productName || 'your plan'}`
    : `🔎 Nouveautés en veille — ${productName || 'ton plan'}`
  const bodyLines = (newItems || []).slice(0, 6).map(h => `• ${h}`)
  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: title, emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: bodyLines.join('\n') || (en ? 'Nothing notable this week.' : 'Rien de notable cette semaine.') } }
  ]
  if (appUrl) {
    blocks.push({
      type: 'actions',
      elements: [{ type: 'button', text: { type: 'plain_text', text: en ? 'Open the plan' : 'Ouvrir le plan' }, url: appUrl }]
    })
  }
  return { text: title, blocks }
}

export function inactivityReminderSlackMessage(lang, { productName, updatedAt, appUrl }) {
  const en = lang === 'en'
  const text = en
    ? `⏰ "${productName || 'Your plan'}" hasn't moved since ${updatedAt}.`
    : `⏰ "${productName || 'Ton plan'}" n'a pas bougé depuis le ${updatedAt}.`
  const blocks = [{ type: 'section', text: { type: 'mrkdwn', text } }]
  if (appUrl) {
    blocks.push({
      type: 'actions',
      elements: [{ type: 'button', text: { type: 'plain_text', text: en ? 'Open the plan' : 'Ouvrir le plan' }, url: appUrl }]
    })
  }
  return { text, blocks }
}
