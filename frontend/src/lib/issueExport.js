import { downloadBlob, slug, toCSV } from './pdfExport'
import { t } from './i18n'

function allStories(plan) {
  return plan.roadmap.sprints.flatMap(sp =>
    sp.stories.map(s => ({ ...s, sprintId: sp.sprintId }))
  )
}

export function exportGithubIssues(plan) {
  const lang = plan.language || 'fr'
  const issues = allStories(plan).map(s => ({
    title: `[${s.id}] ${s.title}`,
    labels: [s.assignee, `sprint-${s.sprintId}`],
    body: [
      `**${t(lang, 'outputs.effort')}**: ${s.effort} story points`,
      `**${t(lang, 'outputs.cost')}**: ${s.cost} €`,
      `**${t(lang, 'outputs.sprint')}**: ${s.sprintId}`,
      s.dependsOn.length ? `**${t(lang, 'outputs.dependsOn')}**: ${s.dependsOn.join(', ')}` : null
    ].filter(Boolean).join('\n')
  }))

  const blob = new Blob([JSON.stringify({ issues }, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `${slug(plan.product?.name)}-github-issues.json`)
}

export function exportJira(plan) {
  const lang = plan.language || 'fr'
  const header = [
    t(lang, 'outputs.summary'),
    t(lang, 'outputs.issueType'),
    t(lang, 'outputs.sprint'),
    t(lang, 'outputs.storyPoints'),
    t(lang, 'outputs.assignee'),
    t(lang, 'outputs.estimatedCostEur'),
    t(lang, 'outputs.dependsOnCsv')
  ]
  const rows = allStories(plan).map(s => [
    `${s.id}: ${s.title}`,
    'Story',
    `${t(lang, 'outputs.sprint')} ${s.sprintId}`,
    s.effort,
    s.assignee,
    s.cost,
    s.dependsOn.join(';')
  ])

  const csv = toCSV([header, ...rows])

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, `${slug(plan.product?.name)}-jira-import.csv`)
}
