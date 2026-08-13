import { t } from './i18n'

export function exportJSON(plan) {
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `${slug(plan.product?.name)}-launch-plan.json`)
}

export function toCSV(rows) {
  return rows
    .map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

export function exportCSV(plan, lang) {
  const rows = []

  if (plan.executiveSummary) {
    rows.push([t(lang, 'outputs.executiveSummary')])
    rows.push([plan.executiveSummary])
    rows.push([])
  }

  rows.push([t(lang, 'outputs.roadmap')])
  rows.push([t(lang, 'outputs.sprint'), t(lang, 'outputs.summary'), t(lang, 'outputs.assignee'), t(lang, 'outputs.effort'), t(lang, 'outputs.estimatedCostEur'), t(lang, 'outputs.dependsOnCsv')])
  plan.roadmap.sprints.forEach(sp => {
    sp.stories.forEach(s => {
      rows.push([sp.sprintId, `${s.id}: ${s.title}`, s.assignee, s.effort, s.cost, s.dependsOn.join(';')])
    })
  })
  rows.push([])

  rows.push([`${t(lang, 'outputs.marketing')} — ${t(lang, 'outputs.totalBudget')}: ${plan.marketing.totalBudget} €`])
  rows.push([t(lang, 'outputs.channel'), t(lang, 'outputs.estimatedCostEur'), '%', t(lang, 'outputs.goal')])
  plan.marketing.channels.forEach(ch => {
    rows.push([ch.name, ch.budget, ch.pct, ch.goal])
  })
  rows.push([])

  rows.push([t(lang, 'outputs.kpis')])
  rows.push([t(lang, 'outputs.name'), t(lang, 'outputs.formula'), t(lang, 'outputs.unit'), t(lang, 'outputs.target'), t(lang, 'outputs.baseline')])
  plan.kpis.forEach(k => {
    rows.push([k.name, k.formula, k.unit, k.target ?? '', k.baseline ?? ''])
  })

  if (plan.financials) {
    const f = plan.financials
    rows.push([])
    rows.push([t(lang, 'outputs.financials.title')])
    rows.push([t(lang, 'outputs.financials.monthlyBurn'), `${f.monthlyBurn} €`])
    rows.push([t(lang, 'outputs.financials.runway'), `${f.runwayMonths} ${t(lang, 'outputs.financials.months')}`])
    rows.push([t(lang, 'outputs.financials.breakEven'), `${f.breakEvenUsers} ${t(lang, 'outputs.financials.clients')}`])
    rows.push([])
    rows.push([t(lang, 'outputs.financials.breakdown')])
    rows.push([t(lang, 'outputs.category'), t(lang, 'outputs.estimatedCostEur'), '%'])
    f.costBreakdown.forEach(line => rows.push([line.category, line.amount, line.pct]))
  }

  if (plan.strategyToolkit) {
    const { swot, competitivePositioning } = plan.strategyToolkit
    rows.push([])
    rows.push([t(lang, 'outputs.strategy.title')])
    rows.push([t(lang, 'outputs.strategy.strengths'), swot.strengths.join(' / ')])
    rows.push([t(lang, 'outputs.strategy.weaknesses'), swot.weaknesses.join(' / ')])
    rows.push([t(lang, 'outputs.strategy.opportunities'), swot.opportunities.join(' / ')])
    rows.push([t(lang, 'outputs.strategy.threats'), swot.threats.join(' / ')])
    rows.push([t(lang, 'outputs.strategy.positioning'), competitivePositioning])
  }

  if (plan.veille) {
    const v = plan.veille
    rows.push([])
    rows.push([t(lang, 'veille.title')])
    rows.push([t(lang, 'veille.competitors')])
    ;(v.competitors || []).forEach(c => rows.push([c.name, c.positioning, c.watch]))
    rows.push([t(lang, 'veille.trends'), ...(v.trends || [])])
    rows.push([t(lang, 'veille.signals'), ...(v.signals || [])])
    rows.push([t(lang, 'veille.opportunities'), ...(v.opportunities || [])])
    rows.push([t(lang, 'veille.threats'), ...(v.threats || [])])
    rows.push([t(lang, 'veille.sources'), ...(v.sources || [])])
  }

  if (plan.benchmarks) {
    const b = plan.benchmarks
    rows.push([])
    rows.push([t(lang, 'benchmarks.title')])
    rows.push([t(lang, 'benchmarks.metric'), t(lang, 'benchmarks.industry'), t(lang, 'benchmarks.yours'), t(lang, 'benchmarks.verdictLabel')])
    ;(b.metrics || []).forEach(mrow => rows.push([mrow.metric, mrow.industry, mrow.yours, t(lang, `benchmarks.verdict.${mrow.verdict}`) || mrow.verdict]))
    if (b.takeaway) rows.push([b.takeaway])
  }

  if (plan.editorial) {
    rows.push([])
    rows.push([t(lang, 'editorial.title')])
    rows.push([t(lang, 'editorial.week'), t(lang, 'outputs.channel'), 'Format', t(lang, 'genTable.title'), 'Angle', t(lang, 'editorial.cta')])
    ;(plan.editorial.items || []).forEach(it => rows.push([it.week, it.channel, it.format, it.title, it.angle, it.cta]))
  }

  if (plan.advertising) {
    rows.push([])
    rows.push([t(lang, 'advertising.title')])
    rows.push([t(lang, 'advertising.week'), t(lang, 'outputs.channel'), t(lang, 'advertising.objective.awareness'), 'Format', 'Audience', t(lang, 'outputs.estimatedCostEur'), 'KPI'])
    ;(plan.advertising.campaigns || []).forEach(c => rows.push([c.week, c.channel, t(lang, `advertising.objective.${c.objective}`) || c.objective, c.format, c.audience, c.budget, c.kpi]))
  }

  if (plan.rgpd) {
    const r = plan.rgpd
    rows.push([])
    rows.push([t(lang, 'rgpd.title')])
    rows.push([r.applicability])
    rows.push([t(lang, 'rgpd.checklist')])
    ;(r.checklist || []).forEach(it => rows.push([it.done ? '[x]' : '[ ]', it.item, t(lang, `rgpd.priority.${it.priority}`) || it.priority]))
    rows.push([t(lang, 'rgpd.register')])
    rows.push([t(lang, 'rgpd.data'), t(lang, 'rgpd.purpose'), t(lang, 'rgpd.basis')])
    ;(r.register || []).forEach(reg => rows.push([reg.data, reg.purpose, reg.basis]))
  }

  const blob = new Blob(['﻿' + toCSV(rows)], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, `${slug(plan.product?.name)}-launch-plan.csv`)
}

export async function exportPDF(plan, lang) {
  const { default: pdfMake } = await import('pdfmake/build/pdfmake')
  const { default: pdfFonts } = await import('pdfmake/build/vfs_fonts')
  pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs

  const content = [
    { text: plan.product?.name || 'Launch Plan', style: 'header' },
    { text: plan.classification, style: 'subheader' },
    { text: plan.product?.pitch || '', margin: [0, 0, 0, 10] }
  ]

  if (plan.executiveSummary) {
    content.push(
      { text: t(lang, 'outputs.executiveSummary'), style: 'section' },
      { text: plan.executiveSummary, margin: [0, 0, 0, 6], italics: true }
    )
  }

  content.push(
    { text: t(lang, 'outputs.roadmap'), style: 'section' },
    ...plan.roadmap.sprints.map(sp => ({
      text: `${t(lang, 'outputs.sprint')} ${sp.sprintId} — ${sp.estimatedCost} € — ${sp.stories.map(s => s.title).join(', ')}`,
      margin: [0, 2, 0, 2]
    })),

    { text: t(lang, 'outputs.marketing'), style: 'section' },
    ...plan.marketing.channels.map(ch => ({
      text: `${ch.name}: ${ch.budget} € — ${ch.goal}`,
      margin: [0, 2, 0, 2]
    })),

    { text: t(lang, 'outputs.kpis'), style: 'section' },
    ...plan.kpis.map(k => ({
      text: `${k.name}: ${k.target ?? '—'} ${k.unit}`,
      margin: [0, 2, 0, 2]
    }))
  )

  if (plan.financials) {
    const f = plan.financials
    content.push(
      { text: t(lang, 'outputs.financials.title'), style: 'section' },
      { text: `${t(lang, 'outputs.financials.monthlyBurn')}: ${f.monthlyBurn} € — ${t(lang, 'outputs.financials.runway')}: ${f.runwayMonths} ${t(lang, 'outputs.financials.months')} — ${t(lang, 'outputs.financials.breakEven')}: ${f.breakEvenUsers} ${t(lang, 'outputs.financials.clients')}`, margin: [0, 0, 0, 4] },
      ...f.costBreakdown.map(line => ({ text: `${line.category}: ${line.amount} € (${line.pct}%)`, margin: [0, 1, 0, 1] }))
    )
  }

  if (plan.strategyToolkit) {
    const { swot, competitivePositioning } = plan.strategyToolkit
    content.push(
      { text: t(lang, 'outputs.strategy.title'), style: 'section' },
      { text: `${t(lang, 'outputs.strategy.strengths')}: ${swot.strengths.join('; ')}`, margin: [0, 1, 0, 1] },
      { text: `${t(lang, 'outputs.strategy.weaknesses')}: ${swot.weaknesses.join('; ')}`, margin: [0, 1, 0, 1] },
      { text: `${t(lang, 'outputs.strategy.opportunities')}: ${swot.opportunities.join('; ')}`, margin: [0, 1, 0, 1] },
      { text: `${t(lang, 'outputs.strategy.threats')}: ${swot.threats.join('; ')}`, margin: [0, 1, 0, 1] },
      { text: `${t(lang, 'outputs.strategy.positioning')}: ${competitivePositioning}`, margin: [0, 4, 0, 0], italics: true }
    )
  }

  if (plan.veille) {
    const v = plan.veille
    content.push(
      { text: t(lang, 'veille.title'), style: 'section' },
      { text: `${t(lang, 'veille.competitors')}:`, bold: true, margin: [0, 2, 0, 1] },
      ...(v.competitors || []).map(c => ({ text: `• ${c.name} — ${c.positioning} (${c.watch})`, margin: [0, 1, 0, 1] })),
      { text: `${t(lang, 'veille.trends')}: ${(v.trends || []).join('; ')}`, margin: [0, 2, 0, 1] },
      { text: `${t(lang, 'veille.signals')}: ${(v.signals || []).join('; ')}`, margin: [0, 1, 0, 1] },
      { text: `${t(lang, 'veille.opportunities')}: ${(v.opportunities || []).join('; ')}`, margin: [0, 1, 0, 1] },
      { text: `${t(lang, 'veille.threats')}: ${(v.threats || []).join('; ')}`, margin: [0, 1, 0, 1] },
      { text: `${t(lang, 'veille.sources')}: ${(v.sources || []).join('; ')}`, margin: [0, 1, 0, 1] }
    )
  }

  if (plan.benchmarks) {
    const b = plan.benchmarks
    content.push(
      { text: t(lang, 'benchmarks.title'), style: 'section' },
      ...(b.metrics || []).map(mrow => ({ text: `${mrow.metric}: ${t(lang, 'benchmarks.industry')} ${mrow.industry} — ${t(lang, 'benchmarks.yours')} ${mrow.yours} (${t(lang, `benchmarks.verdict.${mrow.verdict}`) || mrow.verdict})`, margin: [0, 1, 0, 1] })),
      ...(b.takeaway ? [{ text: b.takeaway, margin: [0, 3, 0, 0], italics: true }] : [])
    )
  }

  if (plan.editorial) {
    content.push(
      { text: t(lang, 'editorial.title'), style: 'section' },
      ...(plan.editorial.items || []).map(it => ({ text: `S${it.week} · ${it.channel} · ${it.format} — ${it.title} (${it.cta})`, margin: [0, 1, 0, 1] }))
    )
  }

  if (plan.advertising) {
    content.push(
      { text: t(lang, 'advertising.title'), style: 'section' },
      ...(plan.advertising.campaigns || []).map(c => ({ text: `S${c.week} · ${c.channel} · ${t(lang, `advertising.objective.${c.objective}`) || c.objective} — ${c.format} — ${c.budget} € (${c.kpi})`, margin: [0, 1, 0, 1] }))
    )
  }

  if (plan.rgpd) {
    const r = plan.rgpd
    content.push(
      { text: t(lang, 'rgpd.title'), style: 'section' },
      { text: r.applicability, margin: [0, 0, 0, 3], italics: true },
      { text: `${t(lang, 'rgpd.checklist')}:`, bold: true, margin: [0, 2, 0, 1] },
      ...(r.checklist || []).map(it => ({ text: `${it.done ? '☑' : '☐'} ${it.item} [${t(lang, `rgpd.priority.${it.priority}`) || it.priority}]`, margin: [0, 1, 0, 1] })),
      { text: t(lang, 'rgpd.disclaimer'), margin: [0, 3, 0, 0], italics: true, fontSize: 8 }
    )
  }

  const docDefinition = {
    content,
    styles: {
      header: { fontSize: 20, bold: true, color: '#6366f1' },
      subheader: { fontSize: 12, color: '#6b7280', margin: [0, 0, 0, 10] },
      section: { fontSize: 14, bold: true, color: '#9184d9', margin: [0, 12, 0, 6] }
    },
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: 'VelocityLaunch', margin: [40, 0, 0, 0], fontSize: 8, color: '#9184d9', bold: true },
        { text: `${currentPage} / ${pageCount}`, alignment: 'right', margin: [0, 0, 40, 0], fontSize: 8, color: '#9ca3af' }
      ]
    })
  }

  pdfMake.createPdf(docDefinition).download(`${slug(plan.product?.name)}-launch-plan.pdf`)
}

const BRAND_VIOLET = '9184D9'
const BRAND_DARK = '141922'

// Logo SVG VelocityLaunch encodé en base64, réutilisé sur chaque slide en pied de page
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <path d="M 70 60 L 100 130" stroke="#9184d9" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M 130 60 L 100 130" stroke="#6366f1" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M 100 130 L 100 70" stroke="#06b6d4" stroke-width="3" fill="none" stroke-linecap="round"/>
  <polygon points="100,55 95,68 105,68" fill="#06b6d4"/>
  <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(6,182,212,0.1)" stroke-width="1"/>
</svg>`
const LOGO_DATA = 'data:image/svg+xml;base64,' + btoa(LOGO_SVG)

// Images de marque (servies statiquement par Vite/Netlify). Base URL absolue reconstruite
// à l'export pour que pptxgenjs puisse fetcher côté client.
const IMG = {
  hero: '/assets/ai-images/lucid-origin_a_surreal_and_vibrant_cinematic_photo_of_Abstract_tech_hero_image_geometric_shap-0.jpg',
  problem: '/assets/ai-images/lucid-origin_a_cinematic_photo_of_Professional_man_at_modern_desk_using_laptop_with_glowing_q-0.jpg',
  solution: '/assets/ai-images/isometric-3d-concept-of-an-ai-transforming-raw-not.png',
  market: '/assets/ai-images/lucid-origin_a_cinematic_photo_of_Group_of_diverse_founders_and_startup_entrepreneurs_celebra-0.jpg',
  roadmap: '/assets/ai-images/gpt-image-2_Product_launch_workflow_visualization_digital_strategy_diagram_with_5_steps_flow-0.jpg',
  gtm: '/assets/ai-images/lucid-origin_Abstract_3D_isometric_illustration_representing_speed_and_productivity_for_a_Saa-0.jpg',
  dashboard: '/assets/ai-images/modern-saas-dashboard-dark-mode-ui-preview--isomet.png'
}
const abs = (path) => (typeof window !== 'undefined' ? window.location.origin + path : path)

export async function exportPPTX(plan, lang) {
  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'VL', width: 10, height: 5.63 })
  pptx.layout = 'VL'

  const en = lang === 'en'
  const BRAND_GRAY = 'C2C3C9'
  const BRAND_CARD = '1E2530'

  // Pied de page : logo + wordmark, sur chaque slide (hors couverture/clôture qui l'affichent en grand)
  const stamp = (s) => {
    s.addImage({ data: LOGO_DATA, x: 0.5, y: 5.25, w: 0.28, h: 0.28 })
    s.addText([
      { text: 'elocity', options: { color: 'FFFFFF', bold: true } },
      { text: 'Launch', options: { color: BRAND_VIOLET, bold: true } }
    ], { x: 0.82, y: 5.24, w: 2.5, h: 0.3, fontSize: 10 })
    s.addText(en ? 'Generated with VelocityLaunch' : 'Généré avec VelocityLaunch',
      { x: 6.5, y: 5.28, w: 3, h: 0.25, fontSize: 8, color: BRAND_GRAY, italic: true, align: 'right' })
  }

  // En-tête de section : barre d'accent + titre + sous-titre optionnel. Réserve la zone y=1.15+ pour le contenu.
  const header = (s, title, subtitle) => {
    s.background = { color: BRAND_DARK }
    s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.48, w: 0.1, h: 0.5, fill: { color: BRAND_VIOLET }, line: { color: BRAND_VIOLET } })
    s.addText(title, { x: 0.75, y: 0.38, w: 8.6, h: 0.55, fontSize: 22, bold: true, color: 'FFFFFF' })
    if (subtitle) s.addText(subtitle, { x: 0.75, y: 0.9, w: 8.6, h: 0.3, fontSize: 11, color: BRAND_VIOLET })
    stamp(s)
  }
  const bullets = (items, max = 6) => items.filter(Boolean).slice(0, max).map(text => ({
    text: String(text).slice(0, 220),
    options: { bullet: { code: '2022' }, color: 'FFFFFF', fontSize: 12, paraSpaceAfter: 6 }
  }))
  const brandTable = (s, head, rows, colW, opts = {}) => s.addTable(
    [
      head.map(text => ({ text, options: { bold: true, color: BRAND_VIOLET, fontSize: 10, fill: { color: BRAND_CARD } } })),
      ...rows.slice(0, opts.maxRows || 10).map(r => r.map(text => ({ text: String(text ?? '').slice(0, 140), options: { color: 'FFFFFF', fontSize: 9 } })))
    ],
    { x: opts.x || 0.5, y: opts.y || 1.35, w: opts.w || 9, colW, border: { type: 'solid', color: '2C3340', pt: 0.5 }, rowH: opts.rowH || 0.32, valign: 'middle' }
  )

  // ---------- 1. Couverture ----------
  const cover = pptx.addSlide()
  cover.background = { color: BRAND_DARK }
  try { cover.addImage({ path: abs(IMG.hero), x: 0, y: 0, w: 10, h: 5.63, sizing: { type: 'cover', w: 10, h: 5.63 }, transparency: 65 }) } catch { /* image optionnelle */ }
  cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.2, h: 5.63, fill: { color: BRAND_VIOLET }, line: { color: BRAND_VIOLET } })
  cover.addImage({ data: LOGO_DATA, x: 0.6, y: 0.5, w: 0.6, h: 0.6 })
  cover.addText([
    { text: 'elocity', options: { color: 'FFFFFF', bold: true } },
    { text: 'Launch', options: { color: BRAND_VIOLET, bold: true } }
  ], { x: 1.3, y: 0.55, w: 4, h: 0.5, fontSize: 18 })
  cover.addText(plan.product?.name || 'Launch Plan', { x: 0.6, y: 2, w: 8.8, h: 1, fontSize: 40, bold: true, color: 'FFFFFF' })
  cover.addText(plan.classification || '', { x: 0.6, y: 2.95, w: 8.8, h: 0.5, fontSize: 15, color: BRAND_VIOLET, bold: true })
  cover.addText(plan.product?.pitch || '', { x: 0.6, y: 3.55, w: 8.8, h: 1, fontSize: 13, color: BRAND_GRAY })
  if (plan.product?.usp) cover.addText(`USP — ${plan.product.usp}`, { x: 0.6, y: 4.55, w: 8.8, h: 0.5, fontSize: 11, color: 'FFFFFF', italic: true })

  // ---------- 2. Le problème (persona) ----------
  if (plan.persona) {
    const s = pptx.addSlide()
    header(s, en ? 'The problem' : 'Le problème', plan.persona.title)
    try { s.addImage({ path: abs(IMG.problem), x: 6.4, y: 1.4, w: 3, h: 3.4, sizing: { type: 'cover', w: 3, h: 3.4 } }) } catch { /* skip */ }
    if (plan.persona.name) s.addText(plan.persona.name, { x: 0.5, y: 1.35, w: 5.7, h: 0.35, fontSize: 12, bold: true, color: BRAND_VIOLET })
    if (plan.persona.quote) s.addText(`" ${plan.persona.quote} "`, { x: 0.5, y: 1.75, w: 5.7, h: 0.9, fontSize: 12, italic: true, color: BRAND_GRAY })
    s.addText(bullets(plan.persona.painPoints || [], 4), { x: 0.5, y: 2.8, w: 5.7, h: 2.2 })
  }

  // ---------- 3. La solution ----------
  const sol = pptx.addSlide()
  header(sol, en ? 'The solution' : 'La solution')
  try { sol.addImage({ path: abs(IMG.solution), x: 6.2, y: 1.4, w: 3.2, h: 3.2, sizing: { type: 'contain', w: 3.2, h: 3.2 } }) } catch { /* skip */ }
  sol.addText(plan.product?.pitch || '', { x: 0.5, y: 1.4, w: 5.5, h: 1.6, fontSize: 14, color: 'FFFFFF' })
  if (plan.product?.usp) {
    sol.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 3.25, w: 5.5, h: 1.6, fill: { color: BRAND_CARD }, line: { color: BRAND_VIOLET, width: 1 }, rectRadius: 0.08 })
    sol.addText(en ? 'What sets us apart' : 'Ce qui nous différencie', { x: 0.75, y: 3.4, w: 5, h: 0.35, fontSize: 10, bold: true, color: BRAND_VIOLET })
    sol.addText(plan.product.usp, { x: 0.75, y: 3.75, w: 5, h: 1, fontSize: 12, color: 'FFFFFF' })
  }

  // ---------- 4. Marché cible ----------
  if (plan.persona || plan.market) {
    const s = pptx.addSlide()
    header(s, en ? 'Target market' : 'Marché cible')
    try { s.addImage({ path: abs(IMG.market), x: 6.4, y: 1.4, w: 3, h: 2.6, sizing: { type: 'cover', w: 3, h: 2.6 } }) } catch { /* skip */ }
    const rows = [
      plan.persona?.title && [en ? 'Profile' : 'Profil', plan.persona.title],
      plan.market?.segment && [en ? 'Segment' : 'Segment', plan.market.segment],
      plan.persona?.preferredChannel && [en ? 'Preferred channel' : 'Canal privilégié', plan.persona.preferredChannel],
      plan.persona?.context && [en ? 'Context' : 'Contexte', plan.persona.context]
    ].filter(Boolean)
    if (rows.length) brandTable(s, [en ? 'Dimension' : 'Dimension', ''], rows, [1.8, 4], { w: 5.7, rowH: 0.35 })
    if (plan.persona?.buyingTrigger) s.addText(`${en ? 'Buying trigger' : 'Déclencheur d\'achat'} : ${plan.persona.buyingTrigger}`, { x: 0.5, y: 4.45, w: 9, h: 0.5, fontSize: 10, italic: true, color: BRAND_GRAY })
  }

  // ---------- 5. Roadmap ----------
  if (plan.roadmap?.sprints?.length) {
    const s = pptx.addSlide()
    header(s, t(lang, 'outputs.roadmap'), `${plan.roadmap.sprints.length} ${en ? 'sprints' : 'sprints'} · ${plan.roadmap.estimatedCost} €`)
    try { s.addImage({ path: abs(IMG.roadmap), x: 7, y: 1.35, w: 2.5, h: 1.5, sizing: { type: 'cover', w: 2.5, h: 1.5 } }) } catch { /* skip */ }
    brandTable(s,
      [t(lang, 'outputs.sprint'), t(lang, 'outputs.summary'), t(lang, 'outputs.estimatedCostEur')],
      plan.roadmap.sprints.map(sp => [sp.sprintId, sp.stories.map(x => x.title).join(', '), `${sp.estimatedCost} €`]),
      [0.6, 4.6, 1.6], { w: 6.8, maxRows: 8, rowH: 0.35 }
    )
  }

  // ---------- 6. Go-to-market ----------
  if (plan.marketing?.channels?.length) {
    const s = pptx.addSlide()
    header(s, `${t(lang, 'outputs.marketing')}`, `${en ? 'Total budget' : 'Budget total'} : ${plan.marketing.totalBudget} €`)
    try { s.addImage({ path: abs(IMG.gtm), x: 7, y: 1.35, w: 2.5, h: 1.5, sizing: { type: 'cover', w: 2.5, h: 1.5 } }) } catch { /* skip */ }
    brandTable(s,
      [t(lang, 'outputs.channel'), t(lang, 'outputs.estimatedCostEur'), t(lang, 'outputs.goal')],
      plan.marketing.channels.map(ch => [ch.name, `${ch.budget} €`, ch.goal]),
      [1.5, 1.5, 3.8], { w: 6.8, maxRows: 8, rowH: 0.35 }
    )
  }

  // ---------- 7. KPIs ----------
  if (plan.kpis?.length) {
    const s = pptx.addSlide()
    header(s, t(lang, 'outputs.kpis'))
    try { s.addImage({ path: abs(IMG.dashboard), x: 6.6, y: 1.35, w: 2.9, h: 1.75, sizing: { type: 'cover', w: 2.9, h: 1.75 } }) } catch { /* skip */ }
    brandTable(s,
      [t(lang, 'outputs.name'), t(lang, 'outputs.target'), t(lang, 'outputs.unit')],
      plan.kpis.map(k => [k.name, k.target ?? '—', k.unit || '']),
      [3.4, 1.4, 1.4], { w: 6.2, maxRows: 8, rowH: 0.35 }
    )
  }

  // ---------- 8. Finances ----------
  if (plan.financials) {
    const f = plan.financials
    const s = pptx.addSlide()
    header(s, t(lang, 'outputs.financials.title'))
    const stats = [
      [`${f.monthlyBurn} €`, t(lang, 'outputs.financials.monthlyBurn')],
      [`${f.runwayMonths} ${t(lang, 'outputs.financials.months')}`, t(lang, 'outputs.financials.runway')],
      [`${f.breakEvenUsers}`, t(lang, 'outputs.financials.breakEven')]
    ]
    stats.forEach(([value, label], i) => {
      const x = 0.5 + i * 3.05
      s.addShape(pptx.ShapeType.roundRect, { x, y: 1.4, w: 2.8, h: 1.3, fill: { color: BRAND_CARD }, line: { color: '2C3340', width: 1 }, rectRadius: 0.08 })
      s.addText(value, { x, y: 1.55, w: 2.8, h: 0.6, fontSize: 20, bold: true, color: BRAND_VIOLET, align: 'center' })
      s.addText(label, { x, y: 2.15, w: 2.8, h: 0.4, fontSize: 10, color: BRAND_GRAY, align: 'center' })
    })
    if (f.costBreakdown?.length) {
      s.addText(en ? 'Cost breakdown' : 'Répartition des coûts', { x: 0.6, y: 3.05, w: 8.8, h: 0.3, fontSize: 11, bold: true, color: BRAND_VIOLET })
      s.addText(bullets(f.costBreakdown.map(l => `${l.category}: ${l.amount} € (${l.pct}%)`), 5), { x: 0.6, y: 3.4, w: 8.8, h: 1.65 })
    }
  }

  // ---------- 9. Clôture ----------
  const closing = pptx.addSlide()
  closing.background = { color: BRAND_DARK }
  try { closing.addImage({ path: abs(IMG.hero), x: 0, y: 0, w: 10, h: 5.63, sizing: { type: 'cover', w: 10, h: 5.63 }, transparency: 75 }) } catch { /* skip */ }
  closing.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.2, h: 5.63, fill: { color: BRAND_VIOLET }, line: { color: BRAND_VIOLET } })
  closing.addImage({ data: LOGO_DATA, x: 4.5, y: 1.3, w: 1, h: 1 })
  closing.addText(en ? 'Ready to launch' : 'Prêt à lancer', { x: 0.6, y: 2.5, w: 8.8, h: 0.9, fontSize: 32, bold: true, color: 'FFFFFF', align: 'center' })
  closing.addText(plan.product?.name ? `${plan.product.name}${plan.classification ? ' — ' + plan.classification : ''}` : '', { x: 0.6, y: 3.4, w: 8.8, h: 0.5, fontSize: 14, color: BRAND_VIOLET, align: 'center' })
  closing.addText([
    { text: 'elocity', options: { color: 'FFFFFF', bold: true } },
    { text: 'Launch', options: { color: BRAND_VIOLET, bold: true } }
  ], { x: 0.6, y: 5.1, w: 4, h: 0.3, fontSize: 11 })

  await pptx.writeFile({ fileName: `${slug(plan.product?.name)}-pitch-deck.pptx` })
}

export async function exportImage(node, plan) {
  if (!node) return
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(node, { backgroundColor: '#0f1419', scale: 2, useCORS: true })
  canvas.toBlob(blob => downloadBlob(blob, `${slug(plan.product?.name)}-launch-plan.png`))
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function slug(name) {
  return (name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
