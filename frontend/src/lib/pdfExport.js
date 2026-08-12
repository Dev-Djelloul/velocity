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

export async function exportPPTX(plan, lang) {
  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'VL', width: 10, height: 5.63 })
  pptx.layout = 'VL'

  const titleSlide = pptx.addSlide()
  titleSlide.background = { color: BRAND_DARK }
  titleSlide.addText(plan.product?.name || 'Launch Plan', { x: 0.5, y: 1.8, w: 9, h: 1, fontSize: 32, bold: true, color: 'FFFFFF' })
  titleSlide.addText(plan.classification || '', { x: 0.5, y: 2.7, w: 9, h: 0.6, fontSize: 16, color: BRAND_VIOLET })
  titleSlide.addText(plan.product?.pitch || '', { x: 0.5, y: 3.3, w: 9, h: 1, fontSize: 12, color: 'C2C3C9' })
  titleSlide.addText('VelocityLaunch', { x: 0.5, y: 5.2, w: 4, h: 0.3, fontSize: 9, color: BRAND_VIOLET, bold: true })

  if (plan.executiveSummary) {
    const s = pptx.addSlide()
    s.background = { color: BRAND_DARK }
    s.addText(t(lang, 'outputs.executiveSummary'), { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 20, bold: true, color: BRAND_VIOLET })
    s.addText(plan.executiveSummary, { x: 0.5, y: 1.3, w: 9, h: 3.5, fontSize: 14, color: 'FFFFFF', italic: true })
  }

  const roadmapSlide = pptx.addSlide()
  roadmapSlide.background = { color: BRAND_DARK }
  roadmapSlide.addText(t(lang, 'outputs.roadmap'), { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 20, bold: true, color: BRAND_VIOLET })
  roadmapSlide.addTable(
    [
      [t(lang, 'outputs.sprint'), t(lang, 'outputs.summary'), t(lang, 'outputs.estimatedCostEur')].map(text => ({ text, options: { bold: true, color: BRAND_VIOLET, fontSize: 10 } })),
      ...plan.roadmap.sprints.map(sp => [
        { text: `${sp.sprintId}` },
        { text: sp.stories.map(s => s.title).join(', ') },
        { text: `${sp.estimatedCost} €` }
      ].map(cell => ({ ...cell, options: { color: 'FFFFFF', fontSize: 9 } })))
    ],
    { x: 0.5, y: 1.2, w: 9, colW: [1, 6, 2], border: { type: 'solid', color: BRAND_VIOLET, pt: 0.5 } }
  )

  const marketingSlide = pptx.addSlide()
  marketingSlide.background = { color: BRAND_DARK }
  marketingSlide.addText(t(lang, 'outputs.marketing'), { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 20, bold: true, color: BRAND_VIOLET })
  marketingSlide.addTable(
    [
      [t(lang, 'outputs.channel'), t(lang, 'outputs.estimatedCostEur'), t(lang, 'outputs.goal')].map(text => ({ text, options: { bold: true, color: BRAND_VIOLET, fontSize: 10 } })),
      ...plan.marketing.channels.map(ch => [
        { text: ch.name }, { text: `${ch.budget} €` }, { text: ch.goal }
      ].map(cell => ({ ...cell, options: { color: 'FFFFFF', fontSize: 9 } })))
    ],
    { x: 0.5, y: 1.2, w: 9, colW: [2, 2, 5], border: { type: 'solid', color: BRAND_VIOLET, pt: 0.5 } }
  )

  const kpiSlide = pptx.addSlide()
  kpiSlide.background = { color: BRAND_DARK }
  kpiSlide.addText(t(lang, 'outputs.kpis'), { x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 20, bold: true, color: BRAND_VIOLET })
  kpiSlide.addTable(
    [
      [t(lang, 'outputs.name'), t(lang, 'outputs.target'), t(lang, 'outputs.unit')].map(text => ({ text, options: { bold: true, color: BRAND_VIOLET, fontSize: 10 } })),
      ...plan.kpis.map(k => [
        { text: k.name }, { text: `${k.target ?? '—'}` }, { text: k.unit }
      ].map(cell => ({ ...cell, options: { color: 'FFFFFF', fontSize: 9 } })))
    ],
    { x: 0.5, y: 1.2, w: 9, colW: [4, 3, 2], border: { type: 'solid', color: BRAND_VIOLET, pt: 0.5 } }
  )

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
