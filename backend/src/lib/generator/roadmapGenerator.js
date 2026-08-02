import { costFor, sprintCapacity, sprintCount } from '../engine'
import { c } from '../contentI18n'

const STORY_TEMPLATES = [
  { key: 'onboarding', category: 'product', type: 'frontend', effort: 8, assignee: 'Dev' },
  { key: 'positioning', category: 'marketing', type: 'content', effort: 5, assignee: 'Marketing' },
  { key: 'landing', category: 'product', type: 'design', effort: 8, assignee: 'Design' },
  { key: 'stagingDeploy', category: 'product', type: 'backend', effort: 8, assignee: 'Dev' },
  { key: 'teaser', category: 'marketing', type: 'video', effort: 13, assignee: 'Marketing' },
  { key: 'analytics', category: 'ops', type: 'analytics', effort: 5, assignee: 'Dev' },
  { key: 'publicBeta', category: 'product', type: 'backend', effort: 5, assignee: 'Dev' },
  { key: 'paidCampaign', category: 'marketing', type: 'paid_ad', effort: 8, assignee: 'Marketing' },
  { key: 'community', category: 'ops', type: 'community', effort: 5, assignee: 'Product' },
  { key: 'qa', category: 'product', type: 'qa', effort: 5, assignee: 'Dev' },
  { key: 'thoughtLeadership', category: 'marketing', type: 'content', effort: 5, assignee: 'Marketing' },
  { key: 'feedback', category: 'product', type: 'frontend', effort: 8, assignee: 'Dev' }
]

const TIMELINE_WEEKS = { w4: 4, w8: 8, w12: 12, w26: 26 }

export function generateRoadmap(resources, product, priorities, lang) {
  const dict = c(lang)
  const weeks = TIMELINE_WEEKS[resources?.timelineWeeks] ?? 8
  const nbSprints = sprintCount(weeks)
  const capacity = sprintCapacity(resources?.teamSize)
  const risk = dict.riskLabels[priorities?.riskKnown]

  const sprints = []
  let storyCounter = 1
  let templateIdx = 0

  for (let i = 0; i < nbSprints; i++) {
    const stories = []
    let used = 0
    while (used < capacity && templateIdx < STORY_TEMPLATES.length * 3) {
      const tmpl = STORY_TEMPLATES[templateIdx % STORY_TEMPLATES.length]
      if (used + tmpl.effort > capacity && stories.length > 0) break
      const id = `US-${String(storyCounter).padStart(3, '0')}`
      stories.push({
        id,
        title: dict.stories[tmpl.key],
        description: dict.storyDescriptions[tmpl.key],
        acceptanceCriteria: dict.storyAcceptance[tmpl.key],
        assignee: dict.assignees[tmpl.assignee] || tmpl.assignee,
        effort: tmpl.effort,
        cost: costFor(tmpl.category, tmpl.type),
        dependsOn: stories.length > 0 && templateIdx % 3 === 1 ? [stories[stories.length - 1].id] : []
      })
      storyCounter++
      templateIdx++
      used += tmpl.effort
    }

    sprints.push({
      sprintId: i + 1,
      duration: '2 weeks',
      stories,
      estimatedCost: stories.reduce((s, x) => s + x.cost, 0),
      risks: i === 0 && risk ? [risk] : []
    })
  }

  return {
    sprints,
    totalDuration: weeks,
    estimatedCost: sprints.reduce((s, sp) => s + sp.estimatedCost, 0)
  }
}
