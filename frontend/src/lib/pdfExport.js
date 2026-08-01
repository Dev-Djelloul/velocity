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
