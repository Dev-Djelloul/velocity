import { costFor, sprintCapacity, sprintCount } from '../engine'

const STORY_TEMPLATES = [
  { title: 'Finalize onboarding flow', category: 'product', type: 'frontend', effort: 8, assignee: 'Dev' },
  { title: 'Create brand positioning doc', category: 'marketing', type: 'content', effort: 5, assignee: 'Marketing' },
  { title: 'Build landing page mockups', category: 'product', type: 'design', effort: 8, assignee: 'Design' },
  { title: 'Deploy MVP to staging', category: 'product', type: 'backend', effort: 8, assignee: 'Dev' },
  { title: 'Film launch teaser videos', category: 'marketing', type: 'video', effort: 13, assignee: 'Marketing' },
  { title: 'Set up analytics tracking', category: 'ops', type: 'analytics', effort: 5, assignee: 'Dev' },
  { title: 'Launch public beta', category: 'product', type: 'backend', effort: 5, assignee: 'Dev' },
  { title: 'Run paid acquisition campaign', category: 'marketing', type: 'paid_ad', effort: 8, assignee: 'Marketing' },
  { title: 'Set up community channel', category: 'ops', type: 'community', effort: 5, assignee: 'Product' },
  { title: 'QA regression pass', category: 'product', type: 'qa', effort: 5, assignee: 'Dev' },
  { title: 'Publish thought-leadership content', category: 'marketing', type: 'content', effort: 5, assignee: 'Marketing' },
  { title: 'Iterate on user feedback', category: 'product', type: 'frontend', effort: 8, assignee: 'Dev' }
]

const RISK_LABELS = {
  none: null,
  notready: { risk: 'Product not fully ready', mitigation: 'Add QA buffer sprint before launch' },
  pmf: { risk: 'Market fit unclear', mitigation: 'Validate with 10 beta users before scaling spend' },
  budget: { risk: 'Budget limits reach', mitigation: 'Prioritize highest-ROI channel first' }
}

const TIMELINE_WEEKS = { w4: 4, w8: 8, w12: 12, w26: 26 }

export function generateRoadmap(resources, product, priorities) {
  const weeks = TIMELINE_WEEKS[resources?.timelineWeeks] ?? 8
  const nbSprints = sprintCount(weeks)
  const capacity = sprintCapacity(resources?.teamSize)
  const risk = RISK_LABELS[priorities?.riskKnown]

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
        title: tmpl.title,
        assignee: tmpl.assignee,
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
