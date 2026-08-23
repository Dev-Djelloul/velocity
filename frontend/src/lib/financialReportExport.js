import { t } from './i18n'
import { formatMoney as formatMoneyDisplay } from './currency'
import { resolveBudgetAmount } from './budgetTiers'
import { downloadBlob, slug, toDataUrl } from './pdfExport'

// formatMoney() sépare les milliers avec un espace fine insécable (U+202F, via
// toLocaleString('fr-FR')) : parfait à l'écran, mais absent de la police Roboto embarquée
// par pdfmake et mal géré par certains moteurs de rendu .docx — il s'affichait en carré
// vide ("tofu") dans les exports PDF/Word du rapport (retour utilisateur). On retombe sur
// une espace normale, invisible à l'oeil mais garantie d'être rendue partout.
function formatMoney(amount) {
  return formatMoneyDisplay(amount).replace(/ /g, ' ')
}

// Récupère une image distante en bytes pour un ImageRun docx (qui exige un `type` PNG/JPG
// explicite, contrairement à pdfmake qui accepte n'importe quelle data URL) — un format
// non supporté (webp, svg) échoue ici, à charge de l'appelant de l'ignorer.
async function fetchImageForDocx(url) {
  const res = await fetch(url)
  const bytes = new Uint8Array(await res.arrayBuffer())
  const contentType = res.headers.get('content-type') || ''
  const type = (contentType.includes('png') || url.toLowerCase().endsWith('.png')) ? 'png' : 'jpg'
  return { bytes, type }
}

// docx a besoin des dimensions pixel exactes pour poser une transformation width/height
// qui respecte le ratio d'origine — pas d'API de décodage d'image côté docx, on passe par
// une <img> le temps de lire naturalWidth/naturalHeight.
function imagePixelSize(bytes, type) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([bytes], { type: `image/${type === 'jpg' ? 'jpeg' : type}` })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve({ width: img.naturalWidth, height: img.naturalHeight }) }
    img.onerror = (e) => { URL.revokeObjectURL(url); reject(e) }
    img.src = url
  })
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

  if (plan?.coverImage) {
    try {
      const coverDataUrl = await toDataUrl(plan.coverImage)
      content.push({ image: coverDataUrl, width: 515, margin: [0, 0, 0, 14] })
    } catch { /* image indisponible : on continue sans bannière */ }
  }

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
    Document, Packer, Paragraph, Table, TableRow, TableCell,
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

  // Bannière de couverture du plan en pleine largeur en tête de document, façon page de
  // couverture Notion — jamais bloquante : une image indisponible ou dans un format non
  // supporté par docx (webp, svg) est simplement ignorée.
  if (plan?.coverImage) {
    try {
      const { bytes, type } = await fetchImageForDocx(plan.coverImage)
      const { width: iw, height: ih } = await imagePixelSize(bytes, type)
      const targetW = 600
      const targetH = Math.round((ih / iw) * targetW)
      children.push(new Paragraph({ children: [new ImageRun({ data: bytes, type, transformation: { width: targetW, height: targetH } })], spacing: { after: 200 } }))
    } catch { /* image indisponible ou format non supporté : on continue sans bannière */ }
  }

  if (branding?.enabled && branding.logo) {
    try {
      const base64 = branding.logo.split(',')[1]
      const bin = atob(base64)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      const type = branding.logo.startsWith('data:image/png') ? 'png' : 'jpg'
      children.push(new Paragraph({ children: [new ImageRun({ data: bytes, type, transformation: { width: 90, height: 40 } })] }))
    } catch { /* logo mal formé : on continue sans */ }
  }

  children.push(
    // Taille fixée explicitement plutôt que via HeadingLevel.TITLE : ce style hérite du
    // thème par défaut de Word (~56pt), démesuré à côté du reste du document — retour
    // utilisateur ("les titres sont très gros").
    new Paragraph({
      children: [new TextRun({ text: t(lang, 'planFinancialReport.title')(plan?.product?.name || t(lang, 'plans.untitled')), color: '6366F1', bold: true, size: 30 })]
    }),
    new Paragraph({
      children: [new TextRun({
        text: [plan?.classification, plan?.market?.b2bVsB2c && (t(lang, 'market.b2bVsB2cOptions')[plan.market.b2bVsB2c] || plan.market.b2bVsB2c)].filter(Boolean).join(' · '),
        bold: true, color: '6B7280', size: 22
      })]
    }),
    new Paragraph({
      children: [new TextRun({ text: en ? `Generated on ${genDate}` : `Généré le ${genDate}`, size: 18, color: '9CA3AF', italics: true })],
      spacing: { after: 200, before: 60 }
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
      new Paragraph({ children: [new TextRun({ text: t(lang, 'outputs.financials.title'), color: '9184D9', bold: true, size: 24 })], spacing: { before: 200, after: 100 } }),
      dataTable(
        [t(lang, 'outputs.financials.monthlyBurn'), t(lang, 'outputs.financials.runway'), t(lang, 'outputs.financials.breakEven')],
        [[formatMoney(financials.monthlyBurn), `${financials.runwayMonths} ${t(lang, 'outputs.financials.months')}`, `${financials.breakEvenUsers} ${t(lang, 'outputs.financials.clients')}`]]
      ),
      new Paragraph({ text: '', spacing: { after: 200 } }),

      new Paragraph({ children: [new TextRun({ text: t(lang, 'planFinancialReport.cashProjection'), color: '9184D9', bold: true, size: 24 })], spacing: { before: 100, after: 40 } }),
      new Paragraph({ children: [new TextRun({ text: t(lang, 'planFinancialReport.cashProjectionSubtitle'), italics: true, color: '6B7280', size: 18 })], spacing: { after: 100 } }),
      dataTable(
        [en ? 'Month' : 'Mois', en ? 'Remaining cash' : 'Trésorerie restante'],
        cashRows.map(r => [t(lang, 'planFinancialReport.monthShort')(r.month), formatMoney(r.remaining)])
      ),
      new Paragraph({ text: '', spacing: { after: 200 } })
    )

    if (financials.costBreakdown?.length) {
      children.push(
        new Paragraph({ children: [new TextRun({ text: t(lang, 'outputs.financials.breakdown'), color: '9184D9', bold: true, size: 24 })], spacing: { before: 100, after: 40 } }),
        new Paragraph({ children: [new TextRun({ text: t(lang, 'planFinancialReport.costBreakdownSubtitle'), italics: true, color: '6B7280', size: 18 })], spacing: { after: 100 } }),
        dataTable(
          [t(lang, 'outputs.category'), t(lang, 'outputs.estimatedCostEur'), '%'],
          financials.costBreakdown.map(line => [line.category, formatMoney(line.amount), `${line.pct}%`])
        ),
        new Paragraph({ text: '', spacing: { after: 200 } })
      )
    }

    children.push(
      new Paragraph({ children: [new TextRun({ text: t(lang, 'outputs.financials.bridgeTitle'), color: '9184D9', bold: true, size: 24 })], spacing: { before: 100, after: 40 } }),
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

const COST_PALETTE = ['#9184d9', '#06b6d4', '#4ade80', '#fb923c', '#f472b6', '#facc15', '#60a5fa']

function polarPoint(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutWedgePath(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const large = endAngle - startAngle > 180 ? 1 : 0
  const a0 = polarPoint(cx, cy, rOuter, endAngle)
  const a1 = polarPoint(cx, cy, rOuter, startAngle)
  const b0 = polarPoint(cx, cy, rInner, startAngle)
  const b1 = polarPoint(cx, cy, rInner, endAngle)
  return `M ${a0.x} ${a0.y} A ${rOuter} ${rOuter} 0 ${large} 0 ${a1.x} ${a1.y} L ${b0.x} ${b0.y} A ${rInner} ${rInner} 0 ${large} 1 ${b1.x} ${b1.y} Z`
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

// Export HTML autonome (une seule page, CSS inline, aucune dépendance externe) qui
// reprend l'identité visuelle de la page rapport financier — fond sombre, halos dégradés
// violet/cyan, cartes en verre dépoli — pour un document consultable dans n'importe quel
// navigateur et fidèle au produit, pas un tableau brut.
export function exportFinancialReportHtml(plan, lang, branding) {
  const { en, financials, launchBudget, marketingBudget, grandTotal, cashRows } = buildFinancialReportModel(plan, lang)
  const genDate = new Date().toLocaleDateString(en ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  const title = t(lang, 'planFinancialReport.title')(plan?.product?.name || t(lang, 'plans.untitled'))
  const subtitle = [plan?.classification, plan?.market?.b2bVsB2c && (t(lang, 'market.b2bVsB2cOptions')[plan.market.b2bVsB2c] || plan.market.b2bVsB2c)].filter(Boolean).join(' · ')

  const chartW = 640
  const chartH = 220
  const padL = 60, padR = 16, padT = 16, padB = 26
  let linePath = '', areaPath = '', cashDots = '', cashLabels = ''
  if (financials) {
    const maxCash = Math.max(...cashRows.map(r => r.remaining), 1)
    const xFor = (i) => padL + (i / Math.max(1, cashRows.length - 1)) * (chartW - padL - padR)
    const yFor = (v) => padT + (1 - v / maxCash) * (chartH - padT - padB)
    const coords = cashRows.map(r => ({ x: xFor(r.month), y: yFor(r.remaining), ...r }))
    linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
    areaPath = `${linePath} L ${coords[coords.length - 1].x} ${yFor(0)} L ${coords[0].x} ${yFor(0)} Z`
    cashDots = coords.map(c => `<circle cx="${c.x}" cy="${c.y}" r="3.5" fill="#0f1419" stroke="#6366f1" stroke-width="2"/>`).join('')
    cashLabels = coords.map((c, i) => {
      const anchor = i === 0 ? 'start' : i === coords.length - 1 ? 'end' : 'middle'
      return `<text x="${c.x}" y="${chartH - 6}" text-anchor="${anchor}" class="axis-label">${escapeHtml(t(lang, 'planFinancialReport.monthShort')(c.month))}</text>`
    }).join('')
  }

  let wedgesSvg = '', legendHtml = ''
  if (financials?.costBreakdown?.length) {
    const total = financials.costBreakdown.reduce((s, l) => s + l.amount, 0) || 1
    let angle = 0
    const wedges = financials.costBreakdown.map((line, i) => {
      const sweep = (line.amount / total) * 360
      const start = angle + 1.4
      const end = Math.max(start, angle + sweep - 1.4)
      angle += sweep
      return { ...line, color: COST_PALETTE[i % COST_PALETTE.length], start, end }
    })
    wedgesSvg = wedges.map(w => `<path d="${donutWedgePath(80, 80, 78, 50, w.start, w.end)}" fill="${w.color}"/>`).join('')
    legendHtml = wedges.map(w => `
      <div class="legend-item"><i style="background:${w.color}"></i><span>${escapeHtml(w.category)}</span><strong>${w.pct}%</strong></div>
    `).join('')
  }

  const logoHtml = branding?.enabled && branding.logo
    ? `<img src="${branding.logo}" alt="" class="brand-logo" />`
    : ''

  // Bannière de couverture en pleine largeur, façon page de couverture Notion — l'URL
  // d'origine (Pexels, upload, lien) est utilisée directement, l'HTML n'a pas besoin de
  // la convertir contrairement au PDF/Word.
  const coverHtml = plan?.coverImage
    ? `<img src="${escapeHtml(plan.coverImage)}" alt="" class="cover-banner" />`
    : ''

  const kpisHtml = financials ? `
    <div class="kpis">
      <div class="kpi" style="--c:#9184d9"><div class="kpi-label">${escapeHtml(t(lang, 'outputs.financials.monthlyBurn'))}</div><div class="kpi-value">${escapeHtml(formatMoney(financials.monthlyBurn))}</div></div>
      <div class="kpi" style="--c:#06b6d4"><div class="kpi-label">${escapeHtml(t(lang, 'outputs.financials.runway'))}</div><div class="kpi-value">${financials.runwayMonths} ${escapeHtml(t(lang, 'outputs.financials.months'))}</div></div>
      <div class="kpi" style="--c:#4ade80"><div class="kpi-label">${escapeHtml(t(lang, 'outputs.financials.breakEven'))}</div><div class="kpi-value">${financials.breakEvenUsers} <span>${escapeHtml(t(lang, 'outputs.financials.clients'))}</span></div></div>
    </div>
  ` : `<p class="empty">${escapeHtml(t(lang, 'export.complianceNoFinancials'))}</p>`

  const chartsHtml = financials ? `
    <div class="charts">
      <div class="card chart-card">
        <h3>${escapeHtml(t(lang, 'planFinancialReport.cashProjection'))}</h3>
        <p class="subtitle">${escapeHtml(t(lang, 'planFinancialReport.cashProjectionSubtitle'))}</p>
        <svg viewBox="0 0 ${chartW} ${chartH}" class="line-chart">
          <path d="${areaPath}" fill="rgba(99,102,241,0.14)"/>
          <path d="${linePath}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          ${cashDots}
          ${cashLabels}
        </svg>
        <div class="legend-row">
          <span class="legend-item"><i style="background:#6366f1;width:18px;height:3px;border-radius:2px"></i>${escapeHtml(t(lang, 'planFinancialReport.cashLegendRemaining'))}</span>
          <span class="muted">${escapeHtml(t(lang, 'planFinancialReport.cashLegendBurn')(formatMoney(financials.monthlyBurn)))}</span>
        </div>
      </div>
      <div class="card chart-card">
        <h3>${escapeHtml(t(lang, 'outputs.financials.breakdown'))}</h3>
        <p class="subtitle">${escapeHtml(t(lang, 'planFinancialReport.costBreakdownSubtitle'))}</p>
        <div class="donut-wrap">
          <svg viewBox="0 0 160 160" class="donut">${wedgesSvg}</svg>
          <div class="donut-center"><span class="donut-value">${escapeHtml(formatMoney(financials.monthlyBurn))}</span><span class="donut-label">${escapeHtml(t(lang, 'outputs.financials.monthlyBurn'))}</span></div>
        </div>
        <div class="legend">${legendHtml}</div>
      </div>
    </div>
    <div class="card bridge-card">
      <h3>${escapeHtml(t(lang, 'outputs.financials.bridgeTitle'))}</h3>
      <p class="subtitle">${escapeHtml(t(lang, 'outputs.financials.bridgeSubtitle'))}</p>
      <div class="bridge-row">
        <span>${escapeHtml(t(lang, 'outputs.financials.bridgeCost'))}</span>
        <div class="bar-track"><div class="bar-fill cost" style="width:${(financials.monthlyBurn / Math.max(financials.monthlyBurn, financials.breakEvenMonthlyRevenue, 1)) * 100}%"></div></div>
        <strong>${escapeHtml(formatMoney(financials.monthlyBurn))}</strong>
      </div>
      <div class="bridge-row">
        <span>${escapeHtml(t(lang, 'outputs.financials.bridgeRevenue'))}</span>
        <div class="bar-track"><div class="bar-fill revenue" style="width:${(financials.breakEvenMonthlyRevenue / Math.max(financials.monthlyBurn, financials.breakEvenMonthlyRevenue, 1)) * 100}%"></div></div>
        <strong>${escapeHtml(formatMoney(financials.breakEvenMonthlyRevenue))}</strong>
      </div>
      ${financials.arpuRationale ? `<p class="arpu"><strong>${escapeHtml(t(lang, 'outputs.financials.arpuLabel'))}</strong> ${escapeHtml(financials.arpuRationale)}</p>` : ''}
    </div>
  ` : ''

  const html = `<!doctype html>
<html lang="${lang === 'en' ? 'en' : 'fr'}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: #0b0e14; color: #f3f4f6;
    background-image:
      radial-gradient(600px 400px at 10% -10%, rgba(145,132,217,0.25), transparent 60%),
      radial-gradient(600px 400px at 100% 0%, rgba(6,182,212,0.18), transparent 60%);
    background-attachment: fixed;
  }
  /* Pleine largeur de la fenêtre (pas limitée aux 900px du contenu), image entière sans
     recadrage (pas d'object-fit:cover) — demandé explicitement. */
  .cover-banner { display: block; width: 100%; height: auto; }
  .page { max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem 5rem; display: flex; flex-direction: column; gap: 1.5rem; }
  .brand-logo { width: 90px; margin-bottom: 0.75rem; border-radius: 6px; }
  h1 { font-size: 1.9rem; margin: 0 0 0.25rem; background: linear-gradient(135deg, #c4b5fd, #67e8f9); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .header-sub { color: #9ca3af; font-weight: 600; margin: 0 0 0.15rem; }
  .header-date { color: #6b7280; font-size: 0.8rem; margin: 0 0 1rem; }
  .card {
    background: rgba(26, 31, 46, 0.65); border: 1px solid rgba(145, 132, 217, 0.18);
    border-radius: 16px; padding: 1.5rem; backdrop-filter: blur(8px);
  }
  .totals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;
    border: 1.5px solid transparent;
    background:
      linear-gradient(rgba(26,31,46,0.85), rgba(26,31,46,0.85)) padding-box,
      linear-gradient(135deg, #9184d9, #6366f1, #06b6d4) border-box;
  }
  .total-label { display: block; font-size: 0.75rem; color: #9ca3af; margin-bottom: 0.35rem; }
  .total-value { display: block; font-size: 1.5rem; font-weight: 700; }
  .total-value.grand { color: #a78bfa; font-size: 1.75rem; }
  .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
  .kpi { background: rgba(26,31,46,0.65); border: 1px solid rgba(145,132,217,0.18); border-left: 3px solid var(--c); border-radius: 12px; padding: 1rem 1.25rem; }
  .kpi-label { font-size: 0.75rem; color: #9ca3af; margin-bottom: 0.35rem; }
  .kpi-value { font-size: 1.3rem; font-weight: 700; color: var(--c); }
  .kpi-value span { font-size: 0.8rem; color: #9ca3af; font-weight: 500; }
  .charts { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.25rem; }
  .chart-card h3, .bridge-card h3 { margin: 0 0 0.2rem; font-size: 1.05rem; }
  .subtitle { color: #9ca3af; font-size: 0.78rem; margin: 0 0 1rem; }
  .line-chart { width: 100%; height: auto; overflow: visible; }
  .axis-label { font-size: 9px; fill: #9ca3af; }
  .legend-row { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 0.75rem; padding-top: 0.6rem; border-top: 1px solid rgba(145,132,217,0.15); font-size: 0.75rem; color: #d1d5db; flex-wrap: wrap; }
  .legend-row .muted { color: #9ca3af; }
  .legend-row .legend-item { display: inline-flex; align-items: center; gap: 0.4rem; }
  .donut-wrap { position: relative; width: 160px; height: 160px; margin: 0 auto; }
  .donut { width: 100%; height: 100%; }
  .donut-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
  .donut-value { font-size: 1rem; font-weight: 700; }
  .donut-label { font-size: 0.62rem; color: #9ca3af; max-width: 80px; }
  .legend { margin-top: 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
  .legend-item { display: flex; align-items: center; gap: 0.45rem; font-size: 0.78rem; color: #d1d5db; }
  .legend-item i { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .legend-item span { flex: 1; }
  .legend-item strong { color: #f3f4f6; }
  .bridge-row { display: grid; grid-template-columns: 140px 1fr 90px; align-items: center; gap: 0.75rem; margin-bottom: 0.6rem; }
  .bar-track { height: 10px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 999px; }
  .bar-fill.cost { background: linear-gradient(90deg, #fb923c, #f87171); }
  .bar-fill.revenue { background: linear-gradient(90deg, #4ade80, #06b6d4); }
  .arpu { margin: 1rem 0 0; padding-top: 0.85rem; border-top: 1px solid rgba(145,132,217,0.15); font-size: 0.85rem; color: #d1d5db; }
  .empty { color: #9ca3af; }
  .disclaimer { color: #6b7280; font-size: 0.75rem; text-align: center; margin-top: 1rem; }
  @media (max-width: 760px) {
    .totals, .kpis, .charts { grid-template-columns: 1fr; }
    .bridge-row { grid-template-columns: 1fr; text-align: left; }
  }
</style>
</head>
<body>
  ${coverHtml}
  <div class="page">
    ${logoHtml}
    <div>
      <h1>${escapeHtml(title)}</h1>
      <p class="header-sub">${escapeHtml(subtitle)}</p>
      <p class="header-date">${en ? `Generated on ${genDate}` : `Généré le ${genDate}`}</p>
    </div>

    <div class="card totals">
      <div><span class="total-label">${escapeHtml(t(lang, 'planFinancialReport.grandTotal'))}</span><span class="total-value grand">${escapeHtml(formatMoney(grandTotal))}</span></div>
      <div><span class="total-label">${escapeHtml(t(lang, 'planFinancialReport.launchBudget'))}</span><span class="total-value">${escapeHtml(formatMoney(launchBudget))}</span></div>
      <div><span class="total-label">${escapeHtml(t(lang, 'planFinancialReport.marketingBudget'))}</span><span class="total-value">${escapeHtml(formatMoney(marketingBudget))}</span></div>
    </div>

    ${kpisHtml}
    ${chartsHtml}

    <p class="disclaimer">${escapeHtml(t(lang, 'export.complianceDisclaimer'))}</p>
  </div>
</body>
</html>`

  downloadBlob(new Blob([html], { type: 'text/html' }), `${slug(plan?.product?.name)}-rapport-financier.html`)
}
