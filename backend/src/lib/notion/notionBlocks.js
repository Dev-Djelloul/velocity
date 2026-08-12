// Convertit un plan VelocityLaunch en blocs Notion structurés (page pro).
// Notion limite les enfants à 100 blocs par requête → l'appelant découpe en lots.

const rt = (text) => [{ type: 'text', text: { content: String(text ?? '').slice(0, 1900) } }]

const h2 = (text) => ({ object: 'block', type: 'heading_2', heading_2: { rich_text: rt(text) } })
const h3 = (text) => ({ object: 'block', type: 'heading_3', heading_3: { rich_text: rt(text) } })
const p = (text) => ({ object: 'block', type: 'paragraph', paragraph: { rich_text: rt(text) } })
const bullet = (text) => ({ object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: rt(text) } })
const todo = (text, checked) => ({ object: 'block', type: 'to_do', to_do: { rich_text: rt(text), checked: !!checked } })
const divider = () => ({ object: 'block', type: 'divider', divider: {} })
const quote = (text) => ({ object: 'block', type: 'quote', quote: { rich_text: rt(text) } })

const L = (lang) => (fr, en) => (lang === 'en' ? en : fr)

export function planToBlocks(plan, lang = 'fr') {
  const _ = L(lang)
  const blocks = []

  blocks.push(p(`${plan.product?.name || ''} — ${plan.classification || ''}`))
  if (plan.product?.pitch) blocks.push(p(plan.product.pitch))

  if (plan.executiveSummary) {
    blocks.push(h2(_('Résumé exécutif', 'Executive summary')))
    blocks.push(quote(plan.executiveSummary))
  }

  if (plan.persona) {
    const pe = plan.persona
    blocks.push(h2(_('Persona', 'Persona')))
    blocks.push(p(`${pe.name || ''}${pe.title ? ' — ' + pe.title : ''}`))
    if (pe.quote) blocks.push(quote(pe.quote))
    ;(pe.painPoints || []).forEach(x => blocks.push(bullet(x)))
  }

  if (plan.veille) {
    const v = plan.veille
    blocks.push(h2(_('Veille IA', 'AI Watch')))
    blocks.push(h3(_('Concurrents à surveiller', 'Competitors to watch')))
    ;(v.competitors || []).forEach(c => blocks.push(bullet(`${c.name} — ${c.positioning} (${c.watch})`)))
    if (v.trends?.length) { blocks.push(h3(_('Tendances', 'Trends'))); v.trends.forEach(x => blocks.push(bullet(x))) }
    if (v.signals?.length) { blocks.push(h3(_('Signaux', 'Signals'))); v.signals.forEach(x => blocks.push(bullet(x))) }
    if (v.opportunities?.length) { blocks.push(h3(_('Opportunités', 'Opportunities'))); v.opportunities.forEach(x => blocks.push(bullet(x))) }
    if (v.threats?.length) { blocks.push(h3(_('Menaces', 'Threats'))); v.threats.forEach(x => blocks.push(bullet(x))) }
    if (v.sources?.length) blocks.push(p(`${_('Sources', 'Sources')} : ${v.sources.join(' · ')}`))
  }

  if (plan.roadmap?.sprints?.length) {
    blocks.push(h2(_('Roadmap & sprints', 'Roadmap & sprints')))
    plan.roadmap.sprints.forEach(sp => {
      blocks.push(h3(`${_('Sprint', 'Sprint')} ${sp.sprintId} — ${sp.estimatedCost} €`))
      ;(sp.stories || []).forEach(s => blocks.push(bullet(`${s.id}: ${s.title} — ${s.assignee} (${s.effort} pts)`)))
    })
  }

  if (plan.marketing?.channels?.length) {
    blocks.push(h2(`${_('Stratégie marketing', 'Marketing strategy')} — ${plan.marketing.totalBudget} €`))
    plan.marketing.channels.forEach(ch => blocks.push(bullet(`${ch.name}: ${ch.budget} € (${ch.pct}%) — ${ch.goal}`)))
  }

  if (plan.kpis?.length) {
    blocks.push(h2(_('KPIs', 'KPIs')))
    plan.kpis.forEach(k => blocks.push(bullet(`${k.name}: ${k.target ?? '—'} ${k.unit || ''} — ${k.formula}`)))
  }

  if (plan.benchmarks) {
    blocks.push(h2(_('Benchmarks', 'Benchmarks')))
    ;(plan.benchmarks.metrics || []).forEach(m => blocks.push(bullet(`${m.metric}: ${_('secteur', 'industry')} ${m.industry} / ${_('vous', 'yours')} ${m.yours} (${m.verdict})`)))
    if (plan.benchmarks.takeaway) blocks.push(quote(plan.benchmarks.takeaway))
  }

  if (plan.editorial?.items?.length) {
    blocks.push(h2(_('Calendrier éditorial', 'Editorial calendar')))
    plan.editorial.items.forEach(it => blocks.push(bullet(`S${it.week} · ${it.channel} · ${it.format} — ${it.title} (${it.cta})`)))
  }

  if (plan.advertising?.campaigns?.length) {
    blocks.push(h2(_('Calendrier publicitaire', 'Advertising calendar')))
    plan.advertising.campaigns.forEach(c => blocks.push(bullet(`S${c.week} · ${c.channel} · ${c.objective} — ${c.format} — ${c.budget} € (${c.kpi})`)))
  }

  if (plan.financials) {
    const f = plan.financials
    blocks.push(h2(_('Finances', 'Financials')))
    blocks.push(p(`${_('Burn mensuel', 'Monthly burn')}: ${f.monthlyBurn} € · ${_('Runway', 'Runway')}: ${f.runwayMonths} · ${_('Seuil de rentabilité', 'Break-even')}: ${f.breakEvenUsers}`))
    ;(f.costBreakdown || []).forEach(line => blocks.push(bullet(`${line.category}: ${line.amount} € (${line.pct}%)`)))
  }

  if (plan.strategyToolkit) {
    const { swot, competitivePositioning } = plan.strategyToolkit
    blocks.push(h2(_('Boîte à outils stratégique', 'Strategy toolkit')))
    if (swot) {
      blocks.push(bullet(`${_('Forces', 'Strengths')}: ${(swot.strengths || []).join('; ')}`))
      blocks.push(bullet(`${_('Faiblesses', 'Weaknesses')}: ${(swot.weaknesses || []).join('; ')}`))
      blocks.push(bullet(`${_('Opportunités', 'Opportunities')}: ${(swot.opportunities || []).join('; ')}`))
      blocks.push(bullet(`${_('Menaces', 'Threats')}: ${(swot.threats || []).join('; ')}`))
    }
    if (competitivePositioning) blocks.push(p(competitivePositioning))
  }

  if (plan.rgpd) {
    const r = plan.rgpd
    blocks.push(h2(_('Conformité RGPD', 'GDPR compliance')))
    if (r.applicability) blocks.push(p(r.applicability))
    ;(r.checklist || []).forEach(it => blocks.push(todo(`${it.item} [${it.priority}]`, it.done)))
    if (r.recommendations?.length) { blocks.push(h3(_('Recommandations', 'Recommendations'))); r.recommendations.forEach(x => blocks.push(bullet(x))) }
  }

  blocks.push(divider())
  blocks.push(p(_('Généré avec VelocityLaunch', 'Generated with VelocityLaunch')))

  return blocks
}
