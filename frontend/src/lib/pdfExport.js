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

// branding : { enabled, logo } (voir lib/exportBranding.js, Pro) — le logo personnalisé
// vient s'AJOUTER en évidence en tête de document, il ne remplace jamais le petit crédit
// "VelocityLaunch" du pied de page (voir footer plus bas) : décision produit assumée, pas
// un vrai marque-blanche qui supprimerait toute trace de VelocityLaunch.
export async function exportPDF(plan, lang, branding) {
  const { default: pdfMake } = await import('pdfmake/build/pdfmake')
  const { default: pdfFonts } = await import('pdfmake/build/vfs_fonts')
  pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs

  const content = []
  if (branding?.enabled && branding.logo) {
    content.push({ image: branding.logo, width: 90, margin: [0, 0, 0, 12] })
  }
  content.push(
    { text: plan.product?.name || 'Launch Plan', style: 'header' },
    { text: plan.classification, style: 'subheader' },
    { text: plan.product?.pitch || '', margin: [0, 0, 0, 10] }
  )

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
      ...(r.checklist || []).map(it => ({ text: `${it.done ? '[x]' : '[ ]'} ${it.item} [${t(lang, `rgpd.priority.${it.priority}`) || it.priority}]`, margin: [0, 1, 0, 1] })),
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

// Document dédié aux investisseurs/due diligence : synthèse financière + conformité RGPD
// en un seul PDF, distinct du plan complet (exportPDF) qui liste toutes les sections. Ne
// dépend pas d'un plan.rgpd déjà généré : si absent, la section l'indique explicitement
// plutôt que d'omettre silencieusement une synthèse censée être exhaustive pour un tiers.
export async function exportComplianceReport(plan, lang, branding) {
  const { default: pdfMake } = await import('pdfmake/build/pdfmake')
  const { default: pdfFonts } = await import('pdfmake/build/vfs_fonts')
  pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs

  const en = lang === 'en'
  const content = []

  if (branding?.enabled && branding.logo) {
    content.push({ image: branding.logo, width: 90, margin: [0, 0, 0, 12] })
  }

  const genDate = new Date().toLocaleDateString(en ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  content.push(
    { text: t(lang, 'export.complianceReport'), style: 'header' },
    { text: plan.product?.name || 'Launch Plan', style: 'subheader' },
    { text: en ? `Generated on ${genDate}` : `Généré le ${genDate}`, fontSize: 9, color: '#9ca3af', margin: [0, 0, 0, 10] }
  )

  if (plan.product?.pitch) {
    content.push({ text: plan.product.pitch, margin: [0, 0, 0, 10], italics: true })
  }

  // ---------- Synthèse financière ----------
  content.push({ text: t(lang, 'outputs.financials.title'), style: 'section' })
  if (plan.financials) {
    const f = plan.financials
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
            `${f.monthlyBurn} €`,
            `${f.runwayMonths} ${t(lang, 'outputs.financials.months')}`,
            `${f.breakEvenUsers} ${t(lang, 'outputs.financials.clients')}`
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 8]
    })
    if (f.costBreakdown?.length) {
      content.push(
        { text: t(lang, 'outputs.financials.breakdown'), bold: true, margin: [0, 0, 0, 4] },
        {
          table: {
            widths: ['*', 'auto', 'auto'],
            body: [
              [
                { text: t(lang, 'outputs.category'), bold: true, fontSize: 9 },
                { text: t(lang, 'outputs.estimatedCostEur'), bold: true, fontSize: 9 },
                { text: '%', bold: true, fontSize: 9 }
              ],
              ...f.costBreakdown.map(line => [line.category, `${line.amount} €`, `${line.pct}%`])
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 4]
        }
      )
    }
    if (f.arpuRationale) {
      content.push({ text: f.arpuRationale, fontSize: 9, italics: true, color: '#6b7280', margin: [0, 2, 0, 0] })
    }
  } else {
    content.push({ text: t(lang, 'export.complianceNoFinancials'), italics: true, color: '#6b7280' })
  }

  // ---------- Conformité RGPD ----------
  content.push({ text: t(lang, 'rgpd.title'), style: 'section' })
  if (plan.rgpd) {
    const r = plan.rgpd
    content.push(
      { text: r.applicability, margin: [0, 0, 0, 6], italics: true },
      { text: `${t(lang, 'rgpd.checklist')}:`, bold: true, margin: [0, 2, 0, 4] },
      {
        // "☑"/"☐" ne sont pas dans la police Roboto embarquée par pdfmake (vfs_fonts) et
        // s'affichaient en carré vide ("tofu") dans le PDF — repli sur des cases ASCII,
        // garanties d'être rendues par n'importe quelle police.
        ul: (r.checklist || []).map(it => `${it.done ? '[x]' : '[ ]'} ${it.item} — ${t(lang, `rgpd.priority.${it.priority}`) || it.priority}`),
        margin: [0, 0, 0, 8]
      }
    )
    if (r.register?.length) {
      content.push(
        { text: `${t(lang, 'rgpd.register')}:`, bold: true, margin: [0, 0, 0, 4] },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: t(lang, 'rgpd.data'), bold: true, fontSize: 9 },
                { text: t(lang, 'rgpd.purpose'), bold: true, fontSize: 9 },
                { text: t(lang, 'rgpd.basis'), bold: true, fontSize: 9 }
              ],
              ...r.register.map(reg => [reg.data, reg.purpose, reg.basis])
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 8]
        }
      )
    }
    if (r.recommendations?.length) {
      content.push(
        { text: `${en ? 'Recommendations' : 'Recommandations'}:`, bold: true, margin: [0, 0, 0, 4] },
        { ul: r.recommendations, margin: [0, 0, 0, 8] }
      )
    }
    content.push({ text: t(lang, 'rgpd.disclaimer'), fontSize: 8, italics: true, color: '#9ca3af' })
  } else {
    content.push({ text: t(lang, 'export.complianceNoRgpd'), italics: true, color: '#6b7280' })
  }

  content.push({
    text: t(lang, 'export.complianceDisclaimer'),
    fontSize: 8,
    italics: true,
    color: '#9ca3af',
    margin: [0, 16, 0, 0]
  })

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

  pdfMake.createPdf(docDefinition).download(`${slug(plan.product?.name)}-compliance-report.pdf`)
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

// pptxgenjs ne fait aucun retour à la ligne automatique de la hauteur d'une zone de texte
// sur sa propre boîte : une zone à hauteur fixe trop courte pour son contenu ne s'agrandit
// jamais, le texte déborde simplement par-dessus tout ce qui est positionné en dessous
// (bug constaté sur la diapo de couverture : le pitch, quand il fait plusieurs phrases,
// recouvrait la ligne USP juste en dessous). Estimation grossière mais suffisante du
// nombre de lignes (largeur de caractère moyenne ≈ fontSize * 0.52 en pt) pour calculer une
// hauteur de boîte réaliste avant de positionner l'élément suivant.
function estimateTextHeight(text, widthIn, fontSize, lineHeightMult = 1.3) {
  const charsPerLine = Math.max(1, Math.floor((widthIn * 72) / (fontSize * 0.52)))
  // Un saut de ligne explicite force une nouvelle ligne quel que soit le nombre de
  // caractères restants — l'ignorer sous-estimait la hauteur nécessaire dès qu'un texte
  // contenait plusieurs paragraphes (cas du pitch produit), d'où le chevauchement constaté
  // avec l'élément positionné juste en dessous.
  const segments = String(text || '').split('\n')
  const lines = segments.reduce((sum, seg) => sum + Math.max(1, Math.ceil(seg.length / charsPerLine)), 0)
  return (lines * fontSize * lineHeightMult) / 72
}

// Tronque au dernier mot complet avant la limite, avec une ellipse — jamais une coupure en
// plein milieu d'un mot comme le faisait un simple .slice() (donnait l'impression d'un
// export cassé, ex: "...pour rassurer sur" qui s'arrêtait net sans explication).
function truncateText(text, maxChars) {
  const str = String(text ?? '')
  if (str.length <= maxChars) return str
  const cut = str.slice(0, maxChars)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…'
}

// pptxgenjs (4.0.1) ne mesure jamais les dimensions réelles de l'image pour calculer un
// recadrage sizing:{type:'cover'|'contain'} — son code initialise la taille "source" avec
// celle de la boîte de destination elle-même, ce qui annule mathématiquement tout calcul de
// recadrage (toujours 0), et produit un <a:stretch/> incomplet que PowerPoint/Keynote/Canva
// interprètent chacun différemment. On recadre donc nous-mêmes côté canvas avant l'insertion,
// et on place l'image obtenue sans option `sizing` (juste w/h = ceux de la boîte).
function loadImageEl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}

async function toDataUrl(url) {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Recadre l'image pour remplir exactement le ratio (boxW/boxH) — équivalent CSS object-fit:cover —
// en la dessinant sur un canvas à la résolution native recadrée (bornée pour rester raisonnable).
async function coverCrop(dataUrl, boxW, boxH) {
  const img = await loadImageEl(dataUrl)
  const targetRatio = boxW / boxH
  const naturalRatio = img.naturalWidth / img.naturalHeight
  let sx, sy, sw, sh
  if (naturalRatio > targetRatio) {
    sh = img.naturalHeight
    sw = sh * targetRatio
    sx = (img.naturalWidth - sw) / 2
    sy = 0
  } else {
    sw = img.naturalWidth
    sh = sw / targetRatio
    sx = 0
    sy = (img.naturalHeight - sh) / 2
  }
  const outW = Math.round(Math.min(sw, 1400))
  const outH = Math.round(outW / targetRatio)
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH)
  return canvas.toDataURL('image/jpeg', 0.86)
}

// { key: [boxW, boxH] } — mêmes dimensions que les boîtes de placement plus bas, pour que
// chaque image soit recadrée une seule fois avant d'être posée sur ses slides.
const IMG_BOX = {
  hero: [10, 5.63],
  problem: [3, 3.4],
  market: [3, 2.6],
  roadmap: [2.5, 1.5],
  gtm: [2.5, 1.5],
  dashboard: [2.9, 1.75]
}

async function preloadImages(imgMap) {
  const entries = await Promise.all(
    Object.entries(imgMap).map(async ([key, url]) => {
      try {
        const raw = await toDataUrl(abs(url))
        const box = IMG_BOX[key]
        const cropped = box ? await coverCrop(raw, box[0], box[1]) : raw
        return [key, cropped]
      } catch {
        return [key, null]
      }
    })
  )
  return Object.fromEntries(entries)
}

// branding : { enabled, logo } (Pro) — ajoute le logo du client en évidence sur les diapos
// de couverture/clôture, en plus du crédit VelocityLaunch déjà présent en pied de chaque
// diapo (stamp()), jamais à sa place — voir la note sur exportPDF ci-dessus.
export async function exportPPTX(plan, lang, branding) {
  const { default: PptxGenJS } = await import('pptxgenjs')
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'VL', width: 10, height: 5.63 })
  pptx.layout = 'VL'

  const en = lang === 'en'
  const BRAND_GRAY = 'C2C3C9'
  const BRAND_CARD = '1E2530'

  const imgData = await preloadImages(IMG)
  const dataOf = (key) => imgData[key]

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

  // En-tête de section : barre d'accent + titre + sous-titre optionnel. Le sous-titre peut
  // faire plus d'une ligne selon sa longueur (ex: positionnement concurrentiel généré par
  // l'IA) — sa hauteur est donc estimée dynamiquement plutôt que figée à 0.3, sans quoi son
  // texte débordait par-dessus le contenu positionné juste en dessous. header() retourne le
  // y à partir duquel ce contenu peut commencer sans risque de chevauchement.
  const header = (s, title, subtitle) => {
    s.background = { color: BRAND_DARK }
    s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.48, w: 0.1, h: 0.5, fill: { color: BRAND_VIOLET }, line: { color: BRAND_VIOLET } })
    s.addText(title, { x: 0.75, y: 0.38, w: 8.6, h: 0.55, fontSize: 22, bold: true, color: 'FFFFFF' })
    let contentY = 1.35
    if (subtitle) {
      const subtitleH = Math.max(0.3, estimateTextHeight(subtitle, 8.6, 11))
      s.addText(subtitle, { x: 0.75, y: 0.9, w: 8.6, h: subtitleH, fontSize: 11, color: BRAND_VIOLET })
      contentY = Math.max(contentY, 0.9 + subtitleH + 0.2)
    }
    stamp(s)
    return contentY
  }
  const bullets = (items, max = 6) => items.filter(Boolean).slice(0, max).map(text => ({
    text: truncateText(text, 220),
    options: { bullet: { code: '2022' }, color: 'FFFFFF', fontSize: 12, paraSpaceAfter: 6 }
  }))
  // Tableau de marque : la hauteur de chaque ligne est calculée à partir du texte réel de
  // chaque cellule (au lieu d'une hauteur fixe pour toutes les lignes) — une ligne fixe trop
  // courte pour son contenu ne s'agrandit jamais avec pptxgenjs, le texte débordant est alors
  // visuellement coupé net sans ellipse (bug constaté sur Marché cible, Roadmap, Benchmarks).
  // Chaque cellule est aussi tronquée proprement (mot entier + ellipse) à une longueur
  // raisonnable, et les lignes en trop pour tenir sur la diapo sont abandonnées plutôt que de
  // déborder hors du cadre.
  const CELL_FONT_SIZE = 9
  const brandTable = (s, head, rows, colW, opts = {}) => {
    const x = opts.x ?? 0.5
    const y = opts.y ?? 1.35
    const headerH = 0.32
    const cellCap = opts.cellCharCap || 200
    const maxBottomY = opts.maxBottomY ?? 5.05
    const candidateRows = rows.slice(0, opts.maxRows || 10).map(r => r.map(text => truncateText(text, cellCap)))
    const rowHeights = candidateRows.map(r =>
      Math.max(opts.rowH || 0.32, ...r.map((text, i) => estimateTextHeight(text, Math.max(0.5, (colW[i] || 1) - 0.2), CELL_FONT_SIZE) + 0.14))
    )
    // N'inclut que les lignes qui tiennent réellement dans l'espace vertical restant sur la
    // diapo, plutôt que de laisser un tableau trop long déborder par-dessus le pied de page.
    const visibleRows = []
    const visibleHeights = []
    let cumulative = y + headerH
    for (let i = 0; i < candidateRows.length; i++) {
      if (cumulative + rowHeights[i] > maxBottomY && visibleRows.length > 0) break
      visibleRows.push(candidateRows[i])
      visibleHeights.push(rowHeights[i])
      cumulative += rowHeights[i]
    }
    s.addTable(
      [
        head.map(text => ({ text, options: { bold: true, color: BRAND_VIOLET, fontSize: 10, fill: { color: BRAND_CARD } } })),
        ...visibleRows.map(r => r.map(text => ({ text, options: { color: 'FFFFFF', fontSize: CELL_FONT_SIZE } })))
      ],
      { x, y, w: opts.w || 9, colW, border: { type: 'solid', color: '2C3340', pt: 0.5 }, rowH: [headerH, ...visibleHeights], valign: 'middle' }
    )
    return { bottomY: cumulative }
  }

  // Place une image "contain" (jamais déformée) centrée dans une boîte — même logique que
  // la diapo Solution plus bas, factorisée ici pour être réutilisée par le logo du client
  // (branding) sans dupliquer le calcul de ratio.
  const addContainImage = async (slide, dataUrl, boxX, boxY, boxW, boxH) => {
    if (!dataUrl) return
    try {
      const img = await loadImageEl(dataUrl)
      const ratio = img.naturalWidth / img.naturalHeight
      const boxRatio = boxW / boxH
      const w = ratio > boxRatio ? boxW : boxH * ratio
      const h = ratio > boxRatio ? boxW / ratio : boxH
      slide.addImage({ data: dataUrl, x: boxX + (boxW - w) / 2, y: boxY + (boxH - h) / 2, w, h })
    } catch { /* logo optionnel */ }
  }
  const customLogo = branding?.enabled && branding.logo ? branding.logo : null

  // ---------- 1. Couverture ----------
  const cover = pptx.addSlide()
  cover.background = { color: BRAND_DARK }
  try { cover.addImage({ data: dataOf('hero'), x: 0, y: 0, w: 10, h: 5.63, transparency: 65 }) } catch { /* image optionnelle */ }
  cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.2, h: 5.63, fill: { color: BRAND_VIOLET }, line: { color: BRAND_VIOLET } })
  // Logo du client : ajouté en évidence à côté du wordmark VelocityLaunch, jamais à sa
  // place (voir note en tête de fonction).
  await addContainImage(cover, customLogo, 7.8, 0.4, 1.6, 0.8)
  cover.addImage({ data: LOGO_DATA, x: 0.6, y: 0.5, w: 0.6, h: 0.6 })
  cover.addText([
    { text: 'elocity', options: { color: 'FFFFFF', bold: true } },
    { text: 'Launch', options: { color: BRAND_VIOLET, bold: true } }
  ], { x: 1.3, y: 0.55, w: 4, h: 0.5, fontSize: 18 })
  cover.addText(plan.product?.name || 'Launch Plan', { x: 0.6, y: 2, w: 8.8, h: 1, fontSize: 40, bold: true, color: 'FFFFFF' })
  cover.addText(plan.classification || '', { x: 0.6, y: 2.95, w: 8.8, h: 0.5, fontSize: 15, color: BRAND_VIOLET, bold: true })
  const pitchY = 3.55
  const pitchW = 8.8
  const pitchFontSize = 13
  const pitchText = plan.product?.pitch || ''
  const pitchH = Math.max(0.4, estimateTextHeight(pitchText, pitchW, pitchFontSize))
  cover.addText(pitchText, { x: 0.6, y: pitchY, w: pitchW, h: pitchH, fontSize: pitchFontSize, color: BRAND_GRAY })
  if (plan.product?.usp) {
    // Plafonné à 4.85 : au-delà, la ligne USP empièterait sur le pied de page (logo/mentions
    // à y=5.24+, voir stamp()) — mieux vaut un chevauchement léger avec un pitch
    // exceptionnellement long que de déborder complètement de la diapo.
    const uspY = Math.min(pitchY + pitchH + 0.15, 4.85)
    cover.addText(`USP — ${plan.product.usp}`, { x: 0.6, y: uspY, w: 8.8, h: 0.5, fontSize: 11, color: 'FFFFFF', italic: true })
  }

  // ---------- 2. Le problème (persona) ----------
  if (plan.persona) {
    const s = pptx.addSlide()
    const contentY = header(s, en ? 'The problem' : 'Le problème', plan.persona.title)
    try { s.addImage({ data: dataOf('problem'), x: 6.4, y: contentY, w: 3, h: 3.4 }) } catch { /* skip */ }
    let cy = contentY
    if (plan.persona.name) {
      s.addText(plan.persona.name, { x: 0.5, y: cy, w: 5.7, h: 0.35, fontSize: 12, bold: true, color: BRAND_VIOLET })
      cy += 0.4
    }
    if (plan.persona.quote) {
      const quoteText = `" ${plan.persona.quote} "`
      const quoteH = Math.max(0.4, estimateTextHeight(quoteText, 5.7, 12))
      s.addText(quoteText, { x: 0.5, y: cy, w: 5.7, h: quoteH, fontSize: 12, italic: true, color: BRAND_GRAY })
      cy += quoteH + 0.2
    }
    s.addText(bullets(plan.persona.painPoints || [], 4), { x: 0.5, y: cy, w: 5.7, h: Math.max(0.5, 5.05 - cy) })
  }

  // ---------- 3. La solution ----------
  const sol = pptx.addSlide()
  header(sol, en ? 'The solution' : 'La solution')
  try {
    if (dataOf('solution')) {
      // "contain" (pas de recadrage) : on centre l'image à son propre ratio dans la boîte,
      // au lieu de compter sur le sizing cassé de pptxgenjs (cf. commentaire plus haut).
      const img = await loadImageEl(dataOf('solution'))
      const boxX = 6.2, boxY = 1.4, boxW = 3.2, boxH = 3.2
      const ratio = img.naturalWidth / img.naturalHeight
      const boxRatio = boxW / boxH
      const w = ratio > boxRatio ? boxW : boxH * ratio
      const h = ratio > boxRatio ? boxW / ratio : boxH
      sol.addImage({ data: dataOf('solution'), x: boxX + (boxW - w) / 2, y: boxY + (boxH - h) / 2, w, h })
    }
  } catch { /* skip */ }
  // La boîte "Ce qui nous différencie" était positionnée à un y fixe (3.25) sans tenir
  // compte de la hauteur réelle du pitch juste au-dessus : un pitch un peu long (plus de
  // ~4 lignes à cette taille) débordait dessus (bug constaté). Sa position est maintenant
  // calculée après le pitch, comme pour la diapo de couverture.
  const solPitchText = plan.product?.pitch || ''
  const solPitchH = Math.max(0.4, estimateTextHeight(solPitchText, 5.5, 14))
  sol.addText(solPitchText, { x: 0.5, y: 1.4, w: 5.5, h: solPitchH, fontSize: 14, color: 'FFFFFF' })
  if (plan.product?.usp) {
    const uspBoxY = Math.min(1.4 + solPitchH + 0.25, 3.6)
    const uspH = Math.max(0.7, estimateTextHeight(plan.product.usp, 5, 12))
    const uspBoxH = Math.min(0.65 + uspH, 5.0 - uspBoxY)
    sol.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: uspBoxY, w: 5.5, h: uspBoxH, fill: { color: BRAND_CARD }, line: { color: BRAND_VIOLET, width: 1 }, rectRadius: 0.08 })
    sol.addText(en ? 'What sets us apart' : 'Ce qui nous différencie', { x: 0.75, y: uspBoxY + 0.15, w: 5, h: 0.35, fontSize: 10, bold: true, color: BRAND_VIOLET })
    sol.addText(plan.product.usp, { x: 0.75, y: uspBoxY + 0.5, w: 5, h: uspBoxH - 0.6, fontSize: 12, color: 'FFFFFF' })
  }

  // ---------- 4. Marché cible ----------
  if (plan.persona || plan.market) {
    const s = pptx.addSlide()
    const contentY = header(s, en ? 'Target market' : 'Marché cible')
    try { s.addImage({ data: dataOf('market'), x: 6.4, y: contentY, w: 3, h: 2.6 }) } catch { /* skip */ }
    const rows = [
      plan.persona?.title && [en ? 'Profile' : 'Profil', plan.persona.title],
      plan.market?.segment && [en ? 'Segment' : 'Segment', plan.market.segment],
      plan.persona?.preferredChannel && [en ? 'Preferred channel' : 'Canal privilégié', plan.persona.preferredChannel],
      plan.persona?.context && [en ? 'Context' : 'Contexte', plan.persona.context]
    ].filter(Boolean)
    let tableBottom = contentY
    if (rows.length) {
      const { bottomY } = brandTable(s, [en ? 'Dimension' : 'Dimension', ''], rows, [1.8, 4], { y: contentY, w: 5.7, rowH: 0.35, maxBottomY: 4.3 })
      tableBottom = bottomY
    }
    if (plan.persona?.buyingTrigger) {
      const triggerY = Math.max(tableBottom + 0.25, 4.45)
      s.addText(`${en ? 'Buying trigger' : 'Déclencheur d\'achat'} : ${plan.persona.buyingTrigger}`, { x: 0.5, y: triggerY, w: 9, h: Math.max(0.4, 5.05 - triggerY), fontSize: 10, italic: true, color: BRAND_GRAY })
    }
  }

  // ---------- 4bis. Positionnement concurrentiel (SWOT) ----------
  if (plan.strategyToolkit?.swot) {
    const { swot, competitivePositioning } = plan.strategyToolkit
    const s = pptx.addSlide()
    const contentY = header(s, t(lang, 'outputs.strategy.title'), competitivePositioning ? truncateText(competitivePositioning, 160) : undefined)
    const colW = 4.35
    const gap = 0.3
    const bulletW = colW - 0.4
    // La hauteur de chaque quadrant s'adapte au texte réel de ses puces plutôt qu'une
    // hauteur fixe (1.85) : avec des puces longues (texte généré par l'IA, longueur
    // variable d'un plan à l'autre), le texte débordait par-dessus le quadrant suivant.
    const quadH = (items) => {
      const list = (items || []).filter(Boolean).slice(0, 3)
      const textH = list.reduce((sum, txt) => sum + estimateTextHeight(truncateText(txt, 220), bulletW, 9.5) + 0.1, 0)
      return Math.max(1.85, 0.55 + textH)
    }
    const draw = (key, label, color, x, y, h) => {
      s.addShape(pptx.ShapeType.roundRect, { x, y, w: colW, h, fill: { color: BRAND_CARD }, line: { color, width: 1 }, rectRadius: 0.06 })
      s.addText(label, { x: x + 0.2, y: y + 0.12, w: 4, h: 0.3, fontSize: 11, bold: true, color })
      s.addText(bullets(swot[key] || [], 3), { x: x + 0.2, y: y + 0.48, w: bulletW, h: h - 0.6, fontSize: 9.5 })
    }
    const row1H = Math.max(quadH(swot.strengths), quadH(swot.weaknesses))
    draw('strengths', t(lang, 'outputs.strategy.strengths'), '4ade80', 0.5, contentY, row1H)
    draw('weaknesses', t(lang, 'outputs.strategy.weaknesses'), 'ef4444', 0.5 + colW + gap, contentY, row1H)
    const row2Y = contentY + row1H + gap
    const row2H = Math.min(Math.max(quadH(swot.opportunities), quadH(swot.threats)), 5.0 - row2Y)
    draw('opportunities', t(lang, 'outputs.strategy.opportunities'), '4ade80', 0.5, row2Y, row2H)
    draw('threats', t(lang, 'outputs.strategy.threats'), 'ef4444', 0.5 + colW + gap, row2Y, row2H)
  }

  // ---------- 5. Roadmap ----------
  if (plan.roadmap?.sprints?.length) {
    const s = pptx.addSlide()
    const contentY = header(s, t(lang, 'outputs.roadmap'), `${plan.roadmap.sprints.length} ${en ? 'sprints' : 'sprints'} · ${plan.roadmap.estimatedCost} €`)
    try { s.addImage({ data: dataOf('roadmap'), x: 7, y: contentY, w: 2.5, h: 1.5 }) } catch { /* skip */ }
    // Largeur réduite à 6.3 (au lieu de 6.8) : à x=0.5, le tableau finissait à x=7.3, soit
    // 0.3 po À L'INTÉRIEUR de l'image posée à x=7 — chevauchement visible sur l'export
    // précédent. Colonnes réduites proportionnellement pour garder les mêmes proportions.
    brandTable(s,
      [t(lang, 'outputs.sprint'), t(lang, 'outputs.summary'), t(lang, 'outputs.estimatedCostEur')],
      plan.roadmap.sprints.map(sp => [sp.sprintId, sp.stories.map(x => x.title).join(', '), `${sp.estimatedCost} €`]),
      [0.55, 4.25, 1.5], { y: contentY, w: 6.3, maxRows: 8, rowH: 0.35 }
    )
  }

  // ---------- 6. Go-to-market ----------
  if (plan.marketing?.channels?.length) {
    const s = pptx.addSlide()
    const contentY = header(s, `${t(lang, 'outputs.marketing')}`, `${en ? 'Total budget' : 'Budget total'} : ${plan.marketing.totalBudget} €`)
    try { s.addImage({ data: dataOf('gtm'), x: 7, y: contentY, w: 2.5, h: 1.5 }) } catch { /* skip */ }
    // Même correctif de largeur que Roadmap ci-dessus (chevauchement avec l'image à x=7).
    brandTable(s,
      [t(lang, 'outputs.channel'), t(lang, 'outputs.estimatedCostEur'), t(lang, 'outputs.goal')],
      plan.marketing.channels.map(ch => [ch.name, `${ch.budget} €`, ch.goal]),
      [1.4, 1.4, 3.5], { y: contentY, w: 6.3, maxRows: 8, rowH: 0.35 }
    )
  }

  // ---------- 7. KPIs ----------
  if (plan.kpis?.length) {
    const s = pptx.addSlide()
    const contentY = header(s, t(lang, 'outputs.kpis'))
    try { s.addImage({ data: dataOf('dashboard'), x: 6.6, y: contentY, w: 2.9, h: 1.75 }) } catch { /* skip */ }
    // Largeur réduite à 5.9 (au lieu de 6.2) : le tableau finissait à x=6.7, dans l'image
    // posée à x=6.6 — même chevauchement corrigé.
    brandTable(s,
      [t(lang, 'outputs.name'), t(lang, 'outputs.target'), t(lang, 'outputs.unit')],
      plan.kpis.map(k => [k.name, k.target ?? '—', k.unit || '']),
      [3.2, 1.35, 1.35], { y: contentY, w: 5.9, maxRows: 8, rowH: 0.35 }
    )
  }

  // ---------- 7bis. Benchmarks sectoriels ----------
  if (plan.benchmarks?.metrics?.length) {
    const b = plan.benchmarks
    const s = pptx.addSlide()
    const contentY = header(s, t(lang, 'benchmarks.title'), t(lang, 'benchmarks.subtitle'))
    const { bottomY } = brandTable(s,
      [t(lang, 'benchmarks.metric'), t(lang, 'benchmarks.industry'), t(lang, 'benchmarks.yours'), t(lang, 'benchmarks.verdictLabel')],
      b.metrics.map(row => [row.metric, row.industry, row.yours, t(lang, `benchmarks.verdict.${row.verdict}`) || row.verdict]),
      [3.1, 2, 2.7, 1.2], { y: contentY, w: 9, maxRows: 5, rowH: 0.4, maxBottomY: 3.5 }
    )
    if (b.takeaway) {
      const takeawayY = bottomY + 0.2
      const takeawayText = truncateText(b.takeaway, 320)
      const takeawayH = Math.min(Math.max(0.9, estimateTextHeight(takeawayText, 8.5, 11) + 0.3), 5.0 - takeawayY)
      s.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: takeawayY, w: 9, h: takeawayH, fill: { color: BRAND_CARD }, line: { color: BRAND_VIOLET, width: 1 }, rectRadius: 0.06 })
      s.addText(takeawayText, { x: 0.75, y: takeawayY + 0.15, w: 8.5, h: takeawayH - 0.3, fontSize: 11, color: 'FFFFFF', italic: true })
    }
  }

  // ---------- 8. Finances ----------
  if (plan.financials) {
    const f = plan.financials
    const s = pptx.addSlide()
    const contentY = header(s, t(lang, 'outputs.financials.title'))
    const stats = [
      [`${f.monthlyBurn} €`, t(lang, 'outputs.financials.monthlyBurn')],
      [`${f.runwayMonths} ${t(lang, 'outputs.financials.months')}`, t(lang, 'outputs.financials.runway')],
      [`${f.breakEvenUsers}`, t(lang, 'outputs.financials.breakEven')]
    ]
    stats.forEach(([value, label], i) => {
      const x = 0.5 + i * 3.05
      s.addShape(pptx.ShapeType.roundRect, { x, y: contentY, w: 2.8, h: 1.3, fill: { color: BRAND_CARD }, line: { color: '2C3340', width: 1 }, rectRadius: 0.08 })
      s.addText(value, { x, y: contentY + 0.15, w: 2.8, h: 0.6, fontSize: 20, bold: true, color: BRAND_VIOLET, align: 'center' })
      s.addText(label, { x, y: contentY + 0.75, w: 2.8, h: 0.4, fontSize: 10, color: BRAND_GRAY, align: 'center' })
    })
    if (f.costBreakdown?.length) {
      const breakdownY = contentY + 1.65
      s.addText(en ? 'Cost breakdown' : 'Répartition des coûts', { x: 0.6, y: breakdownY, w: 8.8, h: 0.3, fontSize: 11, bold: true, color: BRAND_VIOLET })
      s.addText(bullets(f.costBreakdown.map(l => `${l.category}: ${l.amount} € (${l.pct}%)`), 5), { x: 0.6, y: breakdownY + 0.35, w: 8.8, h: Math.max(0.5, 5.05 - (breakdownY + 0.35)) })
    }
  }

  // ---------- 9. Clôture ----------
  const closing = pptx.addSlide()
  closing.background = { color: BRAND_DARK }
  try { closing.addImage({ data: dataOf('hero'), x: 0, y: 0, w: 10, h: 5.63, transparency: 75 }) } catch { /* skip */ }
  closing.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.2, h: 5.63, fill: { color: BRAND_VIOLET }, line: { color: BRAND_VIOLET } })
  closing.addImage({ data: LOGO_DATA, x: 4.5, y: 1.3, w: 1, h: 1 })
  await addContainImage(closing, customLogo, 3.9, 0.35, 2.2, 0.85)
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
  const canvas = await html2canvas(node, {
    backgroundColor: '#0f1419',
    scale: 2,
    useCORS: true,
    // Exclut la pop-up d'export (et tout overlay fixe) de la capture.
    ignoreElements: (el) => el.classList?.contains('modal-backdrop') || el.classList?.contains('export-modal')
  })
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
