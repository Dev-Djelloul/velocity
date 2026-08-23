// Convertit un plan VelocityLaunch en blocs Notion structurés (page pro).
// Notion limite les enfants à 100 blocs par requête → l'appelant découpe en lots.

const rt = (text) => [{ type: 'text', text: { content: String(text ?? '').slice(0, 1900) } }]

// Variante de rt() pour une ligne "Label1 · Label2 · ..." où chaque item porte un vrai lien
// Notion (rich_text.text.link.url) — items: [{ label, url }]. Un item sans url reste du
// texte simple, pas un lien cassé. Utilisée pour les sources Veille/Benchmarks et les
// ressources officielles RGPD, qui portaient jusqu'ici seulement le nom, jamais l'URL
// (retour utilisateur : les liens web n'apparaissaient pas du tout dans l'export Notion).
const rtLinks = (prefix, items) => {
  const runs = [{ type: 'text', text: { content: `${prefix} : ` } }]
  items.forEach((it, i) => {
    if (i > 0) runs.push({ type: 'text', text: { content: ' · ' } })
    runs.push({
      type: 'text',
      text: { content: String(it.label ?? '').slice(0, 1900), link: it.url ? { url: it.url } : null }
    })
  })
  return runs
}

const h2 = (text) => ({ object: 'block', type: 'heading_2', heading_2: { rich_text: rt(text) } })
const h3 = (text) => ({ object: 'block', type: 'heading_3', heading_3: { rich_text: rt(text) } })
const p = (text) => ({ object: 'block', type: 'paragraph', paragraph: { rich_text: rt(text) } })
const pLinks = (prefix, items) => ({ object: 'block', type: 'paragraph', paragraph: { rich_text: rtLinks(prefix, items) } })
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
    // "sources" est un tableau d'objets {name,url} depuis l'ajout des cartes de lien —
    // chaque nom devient un vrai lien Notion cliquable (rich_text.link), pas juste un
    // libellé (retour utilisateur : l'URL n'apparaissait nulle part dans l'export).
    if (v.sources?.length) blocks.push(pLinks(_('Sources', 'Sources'), v.sources.map(s => typeof s === 'string' ? { label: s } : { label: s.name, url: s.url })))
  }

  // Roadmap, calendrier éditorial et calendrier publicitaire sont rendus comme
  // des bases de données Notion (voir notionClient), pas comme des listes ici.

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
    if (plan.benchmarks.sources?.length) blocks.push(pLinks(_('Pour aller plus loin', 'Go further'), plan.benchmarks.sources.map(s => ({ label: s.name, url: s.url }))))
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
    // "resources" (ressources officielles CNIL/EDPB/...) n'est pas persisté dans plan.rgpd
    // — calculé côté client à l'affichage (voir rgpdResources.js) — donc attaché ici par
    // l'appelant juste avant l'export (voir ExportModal.jsx, runNotionExport) plutôt que
    // recalculé côté serveur, qui n'a pas accès au pool i18n frontend.
    if (r.resources?.length) blocks.push(pLinks(_('Ressources officielles', 'Official resources'), r.resources.map(res => ({ label: res.label, url: res.url }))))
  }

  return blocks
}

// Pied de page ajouté APRÈS les bases de données (voir notionClient).
export function footerBlocks(lang = 'fr') {
  const _ = L(lang)
  return [divider(), p(_('Généré avec VelocityLaunch', 'Generated with VelocityLaunch'))]
}
