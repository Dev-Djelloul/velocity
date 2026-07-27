export function exportJSON(plan) {
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `${slug(plan.product?.name)}-launch-plan.json`)
}

export async function exportPDF(plan, lang) {
  const { default: pdfMake } = await import('pdfmake/build/pdfmake')
  const { default: pdfFonts } = await import('pdfmake/build/vfs_fonts')
  pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs

  const docDefinition = {
    content: [
      { text: plan.product?.name || 'Launch Plan', style: 'header' },
      { text: plan.classification, style: 'subheader' },
      { text: plan.product?.pitch || '', margin: [0, 0, 0, 10] },

      { text: 'Roadmap', style: 'section' },
      ...plan.roadmap.sprints.map(sp => ({
        text: `Sprint ${sp.sprintId} — ${sp.estimatedCost} € — ${sp.stories.map(s => s.title).join(', ')}`,
        margin: [0, 2, 0, 2]
      })),

      { text: 'Marketing', style: 'section' },
      ...plan.marketing.channels.map(ch => ({
        text: `${ch.name}: ${ch.budget} € — ${ch.goal}`,
        margin: [0, 2, 0, 2]
      })),

      { text: 'KPIs', style: 'section' },
      ...plan.kpis.map(k => ({
        text: `${k.name}: ${k.target ?? '—'} ${k.unit}`,
        margin: [0, 2, 0, 2]
      }))
    ],
    styles: {
      header: { fontSize: 20, bold: true, color: '#1e3a8a' },
      subheader: { fontSize: 12, color: '#6b7280', margin: [0, 0, 0, 10] },
      section: { fontSize: 14, bold: true, color: '#1e3a8a', margin: [0, 12, 0, 6] }
    }
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
