import { downloadBlob, slug } from './pdfExport'

function allStories(plan) {
  return plan.roadmap.sprints.flatMap(sp =>
    sp.stories.map(s => ({ ...s, sprintId: sp.sprintId }))
  )
}

export function exportGithubIssues(plan) {
  const issues = allStories(plan).map(s => ({
    title: `[${s.id}] ${s.title}`,
    labels: [s.assignee, `sprint-${s.sprintId}`],
    body: [
      `**Effort**: ${s.effort} story points`,
      `**Estimated cost**: ${s.cost} €`,
      `**Sprint**: ${s.sprintId}`,
      s.dependsOn.length ? `**Depends on**: ${s.dependsOn.join(', ')}` : null
    ].filter(Boolean).join('\n')
  }))

  const blob = new Blob([JSON.stringify({ issues }, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `${slug(plan.product?.name)}-github-issues.json`)
}

export function exportJira(plan) {
  const header = ['Summary', 'Issue Type', 'Sprint', 'Story Points', 'Assignee', 'Estimated Cost (EUR)', 'Depends On']
  const rows = allStories(plan).map(s => [
    `${s.id}: ${s.title}`,
    'Story',
    `Sprint ${s.sprintId}`,
    s.effort,
    s.assignee,
    s.cost,
    s.dependsOn.join(';')
  ])

  const csv = [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  downloadBlob(blob, `${slug(plan.product?.name)}-jira-import.csv`)
}
