import { t } from './i18n'
import { formatMoney as formatMoneyDisplay } from './currency'
import { resolveBudgetAmount } from './budgetTiers'
import { downloadBlob, slug } from './pdfExport'

// formatMoney() sépare les milliers avec un espace fine insécable (U+202F, via
// toLocaleString('fr-FR')) : parfait à l'écran, mais absent de la police Roboto embarquée
// par pdfmake et mal géré par certains moteurs de rendu .docx — il s'affichait en carré
// vide ("tofu") dans les exports PDF/Word du rapport (retour utilisateur). On retombe sur
// une espace normale, invisible à l'oeil mais garantie d'être rendue partout.
function formatMoney(amount) {
  return formatMoneyDisplay(amount).replace(/ /g, ' ')
}

// Exports dédiés au rapport financier par plan (PlanFinancialReportPage) : un vrai
// document PDF (pdfmake, même moteur que le rapport de conformité) et un vrai .docx
// (librairie `docx`) — pas une capture d'écran de la page — pensés pour être remis tels
// quels à un investisseur : synthèse, courbe de trésorerie en tableau mois par mois,
// répartition des coûts, pont coûts/revenus au seuil de rentabilité.
function buildFinancialReportModel(plan, lang) {
  const en = lang === 'en'
  const financials = plan?.financials
  const launchBudget = plan?.resources?.totalBudget ? resolveBudgetAmount(plan.resources.totalBudget) : 0
  const marketingBudget = plan?.marketing?.totalBudget || 0
  const grandTotal = launchBudget + marketingBudget

  let cashRows = []
  if (financials) {
    const budget = Math.round(financials.monthlyBurn * financials.runwayMonths)
    const monthCount = Math.max(1, Math.ceil(financials.runwayMonths))
    cashRows = Array.from({ length: monthCount + 1 }, (_, i) => ({
      month: i,
      remaining: Math.max(0, budget - financials.monthlyBurn * i)
    }))
  }

  return { en, financials, launchBudget, marketingBudget, grandTotal, cashRows }
}

export async function exportFinancialReportPdf(plan, lang, branding) {
  const { default: pdfMake } = await import('pdfmake/build/pdfmake')
  const { default: pdfFonts } = await import('pdfmake/build/vfs_fonts')
  pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs

  const { en, financials, launchBudget, marketingBudget, grandTotal, cashRows } = buildFinancialReportModel(plan, lang)
  const content = []

  if (branding?.enabled && branding.logo) {
    content.push({ image: branding.logo, width: 90, margin: [0, 0, 0, 12] })
  }

  const genDate = new Date().toLocaleDateString(en ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  content.push(
    { text: t(lang, 'planFinancialReport.title')(plan?.product?.name || t(lang, 'plans.untitled')), style: 'header' },
    {
      text: [plan?.classification, plan?.market?.b2bVsB2c && (t(lang, 'market.b2bVsB2cOptions')[plan.market.b2bVsB2c] || plan.market.b2bVsB2c)].filter(Boolean).join(' · '),
      style: 'subheader'
    },
    { text: en ? `Generated on ${genDate}` : `Généré le ${genDate}`, fontSize: 9, color: '#9ca3af', margin: [0, 0, 0, 12] }
  )

  content.push({
    table: {
      widths: ['*', '*', '*'],
      body: [
        [
          { text: t(lang, 'planFinancialReport.grandTotal'), bold: true, fontSize: 9, color: '#6b7280' },
          { text: t(lang, 'planFinancialReport.launchBudget'), bold: true, fontSize: 9, color: '#6b7280' },
          { text: t(lang, 'planFinancialReport.marketingBudget'), bold: true, fontSize: 9, color: '#6b7280' }
        ],
        [
          { text: formatMoney(grandTotal), fontSize: 15, bold: true, color: '#9184d9' },
          { text: formatMoney(launchBudget), fontSize: 13, bold: true },
          { text: formatMoney(marketingBudget), fontSize: 13, bold: true }
        ]
      ]
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 14]
  })

  if (!financials) {
    content.push({ text: t(lang, 'export.complianceNoFinancials'), italics: true, color: '#6b7280' })
  } else {
    content.push({ text: t(lang, 'outputs.financials.title'), style: 'section' })
    content.push({
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            { text: t(lang, 'outputs.financials.monthlyBurn'), bold: true, fontSize: 9 },
            { text: t(lang, 'outputs.financials.runway'), bold: true, fontSize: 9 },
            { text: t(lang, 'outputs.financials.breakEven'), bold: true, fontSize: 9 }
          ],
          [
            formatMoney(financials.monthlyBurn),
            `${financials.runwayMonths} ${t(lang, 'outputs.financials.months')}`,
            `${financials.breakEvenUsers} ${t(lang, 'outputs.financials.clients')}`
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    })

    content.push({ text: t(lang, 'planFinancialReport.cashProjection'), style: 'section' })
    content.push({ text: t(lang, 'planFinancialReport.cashProjectionSubtitle'), fontSize: 9, italics: true, color: '#6b7280', margin: [0, 0, 0, 6] })
    content.push({
      table: {
        widths: ['*', '*'],
        body: [
          [
            { text: en ? 'Month' : 'Mois', bold: true, fontSize: 9 },
            { text: en ? 'Remaining cash' : 'Trésorerie restante', bold: true, fontSize: 9 }
          ],
          ...cashRows.map(r => [t(lang, 'planFinancialReport.monthShort')(r.month), formatMoney(r.remaining)])
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 12]
    })

    if (financials.costBreakdown?.length) {
      content.push({ text: t(lang, 'outputs.financials.breakdown'), style: 'section' })
      content.push({ text: t(lang, 'planFinancialReport.costBreakdownSubtitle'), fontSize: 9, italics: true, color: '#6b7280', margin: [0, 0, 0, 6] })
      content.push({
        table: {
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: t(lang, 'outputs.category'), bold: true, fontSize: 9 },
              { text: t(lang, 'outputs.estimatedCostEur'), bold: true, fontSize: 9 },
              { text: '%', bold: true, fontSize: 9 }
            ],
            ...financials.costBreakdown.map(line => [line.category, formatMoney(line.amount), `${line.pct}%`])
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 12]
      })
    }

    content.push({ text: t(lang, 'outputs.financials.bridgeTitle'), style: 'section' })
    content.push({ text: t(lang, 'outputs.financials.bridgeSubtitle'), fontSize: 9, italics: true, color: '#6b7280', margin: [0, 0, 0, 6] })
    content.push({
      table: {
        widths: ['*', '*'],
        body: [
          [
            { text: t(lang, 'outputs.financials.bridgeCost'), bold: true, fontSize: 9 },
            { text: t(lang, 'outputs.financials.bridgeRevenue'), bold: true, fontSize: 9 }
          ],
          [formatMoney(financials.monthlyBurn), formatMoney(financials.breakEvenMonthlyRevenue)]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 8]
    })

    if (financials.arpuRationale) {
      content.push({ text: [{ text: `${t(lang, 'outputs.financials.arpuLabel')} `, bold: true }, financials.arpuRationale], fontSize: 9, color: '#6b7280', margin: [0, 0, 0, 8] })
    }
  }

  content.push({ text: t(lang, 'export.complianceDisclaimer'), fontSize: 8, italics: true, color: '#9ca3af', margin: [0, 16, 0, 0] })

  const docDefinition = {
    content,
    styles: {
      header: { fontSize: 20, bold: true, color: '#6366f1' },
      subheader: { fontSize: 13, bold: true, color: '#6b7280', margin: [0, 2, 0, 0] },
      section: { fontSize: 14, bold: true, color: '#9184d9', margin: [0, 14, 0, 6] }
    },
    footer: (currentPage, pageCount) => ({
      columns: [
        { text: 'VelocityLaunch', margin: [40, 0, 0, 0], fontSize: 8, color: '#9184d9', bold: true },
        { text: `${currentPage} / ${pageCount}`, alignment: 'right', margin: [0, 0, 40, 0], fontSize: 8, color: '#9ca3af' }
      ]
    })
  }

  pdfMake.createPdf(docDefinition).download(`${slug(plan?.product?.name)}-rapport-financier.pdf`)
}

export async function exportFinancialReportDocx(plan, lang, branding) {
  const {
    Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell,
    WidthType, TextRun, BorderStyle, ImageRun, ShadingType
  } = await import('docx')

  const { en, financials, launchBudget, marketingBudget, grandTotal, cashRows } = buildFinancialReportModel(plan, lang)
  const genDate = new Date().toLocaleDateString(en ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  const cellBorders = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER }

  // Largeur totale utile d'une page A4 avec marges normales, en dxa (1/20e de point) —
  // sans largeur de colonne explicite en dxa, Pages/LibreOffice ignorent le pourcentage et
  // retombent sur un auto-fit qui écrase chaque colonne à la largeur de son contenu le plus
  // étroit (une lettre par ligne, cf. retour utilisateur) là où Word s'en sortait à peu près.
  const PAGE_WIDTH_DXA = 9026

  function headerCell(text, widthDxa) {
    return new TableCell({
      borders: cellBorders,
      width: { size: widthDxa, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: 'F3F1FB' },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18, color: '6B7280' })] })]
    })
  }

  function cell(text, widthDxa, opts = {}) {
    return new TableCell({
      borders: cellBorders,
      width: { size: widthDxa, type: WidthType.DXA },
      margins: { top: 100, bottom: 100, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: String(text), bold: !!opts.bold, size: opts.size || 20, color: opts.color })] })]
    })
  }

  function dataTable(headerLabels, rows) {
    const colCount = headerLabels.length
    const colWidth = Math.floor(PAGE_WIDTH_DXA / colCount)
    return new Table({
      width: { size: PAGE_WIDTH_DXA, type: WidthType.DXA },
      columnWidths: new Array(colCount).fill(colWidth),
      rows: [
        new TableRow({ children: headerLabels.map(h => headerCell(h, colWidth)) }),
        ...rows.map(r => new TableRow({ children: r.map(v => cell(v, colWidth)) }))
      ]
    })
  }

  const children = []

  if (branding?.enabled && branding.logo) {
    try {
      const base64 = branding.logo.split(',')[1]
      const bin = atob(base64)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      children.push(new Paragraph({ children: [new ImageRun({ data: bytes, transformation: { width: 90, height: 40 } })] }))
    } catch { /* logo mal formé : on continue sans */ }
  }

  children.push(
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: t(lang, 'planFinancialReport.title')(plan?.product?.name || t(lang, 'plans.untitled')), color: '6366F1', bold: true })]
    }),
    new Paragraph({
      children: [new TextRun({
        text: [plan?.classification, plan?.market?.b2bVsB2c && (t(lang, 'market.b2bVsB2cOptions')[plan.market.b2bVsB2c] || plan.market.b2bVsB2c)].filter(Boolean).join(' · '),
        bold: true, color: '6B7280'
      })]
    }),
    new Paragraph({
      children: [new TextRun({ text: en ? `Generated on ${genDate}` : `Généré le ${genDate}`, size: 18, color: '9CA3AF', italics: true })],
      spacing: { after: 200 }
    })
  )

  children.push(
    dataTable(
      [t(lang, 'planFinancialReport.grandTotal'), t(lang, 'planFinancialReport.launchBudget'), t(lang, 'planFinancialReport.marketingBudget')],
      [[formatMoney(grandTotal), formatMoney(launchBudget), formatMoney(marketingBudget)]]
    ),
    new Paragraph({ text: '', spacing: { after: 200 } })
  )

  if (!financials) {
    children.push(new Paragraph({ children: [new TextRun({ text: t(lang, 'export.complianceNoFinancials'), italics: true, color: '6B7280' })] }))
  } else {
    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t(lang, 'outputs.financials.title'), color: '9184D9', bold: true })], spacing: { before: 200, after: 100 } }),
      dataTable(
        [t(lang, 'outputs.financials.monthlyBurn'), t(lang, 'outputs.financials.runway'), t(lang, 'outputs.financials.breakEven')],
        [[formatMoney(financials.monthlyBurn), `${financials.runwayMonths} ${t(lang, 'outputs.financials.months')}`, `${financials.breakEvenUsers} ${t(lang, 'outputs.financials.clients')}`]]
      ),
      new Paragraph({ text: '', spacing: { after: 200 } }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t(lang, 'planFinancialReport.cashProjection'), color: '9184D9', bold: true })], spacing: { before: 100, after: 40 } }),
      new Paragraph({ children: [new TextRun({ text: t(lang, 'planFinancialReport.cashProjectionSubtitle'), italics: true, color: '6B7280', size: 18 })], spacing: { after: 100 } }),
      dataTable(
        [en ? 'Month' : 'Mois', en ? 'Remaining cash' : 'Trésorerie restante'],
        cashRows.map(r => [t(lang, 'planFinancialReport.monthShort')(r.month), formatMoney(r.remaining)])
      ),
      new Paragraph({ text: '', spacing: { after: 200 } })
    )

    if (financials.costBreakdown?.length) {
      children.push(
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t(lang, 'outputs.financials.breakdown'), color: '9184D9', bold: true })], spacing: { before: 100, after: 40 } }),
        new Paragraph({ children: [new TextRun({ text: t(lang, 'planFinancialReport.costBreakdownSubtitle'), italics: true, color: '6B7280', size: 18 })], spacing: { after: 100 } }),
        dataTable(
          [t(lang, 'outputs.category'), t(lang, 'outputs.estimatedCostEur'), '%'],
          financials.costBreakdown.map(line => [line.category, formatMoney(line.amount), `${line.pct}%`])
        ),
        new Paragraph({ text: '', spacing: { after: 200 } })
      )
    }

    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t(lang, 'outputs.financials.bridgeTitle'), color: '9184D9', bold: true })], spacing: { before: 100, after: 40 } }),
      new Paragraph({ children: [new TextRun({ text: t(lang, 'outputs.financials.bridgeSubtitle'), italics: true, color: '6B7280', size: 18 })], spacing: { after: 100 } }),
      dataTable(
        [t(lang, 'outputs.financials.bridgeCost'), t(lang, 'outputs.financials.bridgeRevenue')],
        [[formatMoney(financials.monthlyBurn), formatMoney(financials.breakEvenMonthlyRevenue)]]
      )
    )

    if (financials.arpuRationale) {
      children.push(new Paragraph({
        spacing: { before: 200 },
        children: [
          new TextRun({ text: `${t(lang, 'outputs.financials.arpuLabel')} `, bold: true, size: 18, color: '6B7280' }),
          new TextRun({ text: financials.arpuRationale, size: 18, color: '6B7280' })
        ]
      }))
    }
  }

  children.push(new Paragraph({
    spacing: { before: 400 },
    children: [new TextRun({ text: t(lang, 'export.complianceDisclaimer'), italics: true, size: 16, color: '9CA3AF' })]
  }))

  const doc = new Document({
    sections: [{ properties: {}, children }]
  })

  const blob = await Packer.toBlob(doc)
  downloadBlob(blob, `${slug(plan?.product?.name)}-rapport-financier.docx`)
}
