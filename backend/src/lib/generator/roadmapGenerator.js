import { costFor, sprintCapacity, sprintCount, resolveAssignee } from '../engine'
import { c } from '../contentI18n'
import { BUDGET } from './budgetTiers'

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

const TIMELINE_WEEKS = { w2: 2, w4: 4, w8: 8, w12: 12, w16: 16, w26: 26, w36: 36, w52: 52 }

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
        assignee: (who => dict.assignees[who] || who)(resolveAssignee(tmpl.assignee, resources?.rolesPresent)),
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
      risks: i === 0 && risk ? [risk] : []
    })
  }

  // Coûts bruts (costFor) mis à l'échelle du vrai budget produit/ops du plan (budget total
  // moins le budget marketing, déjà géré séparément) — sinon "coût estimé" reste toujours
  // proche du même montant peu importe le budget déclaré. Voir le miroir frontend
  // (planGenerator.js) pour le contexte complet.
  const allStories = sprints.flatMap(sp => sp.stories)
  const rawTotal = allStories.reduce((s, x) => s + x.cost, 0)
  const totalBudget = BUDGET[resources?.totalBudget]
  const marketingBudget = BUDGET[resources?.budgetEur] ?? 0
  const devOpsBudget = totalBudget != null ? Math.max(0, totalBudget - marketingBudget) : null
  if (devOpsBudget != null && rawTotal > 0) {
    const scale = devOpsBudget / rawTotal
    let allocated = 0
    allStories.forEach((story, idx) => {
      const isLast = idx === allStories.length - 1
      story.cost = isLast ? Math.max(0, devOpsBudget - allocated) : Math.max(0, Math.round(story.cost * scale))
      allocated += story.cost
    })
  }

  for (const sp of sprints) {
    sp.estimatedCost = sp.stories.reduce((s, x) => s + x.cost, 0)
  }

  return {
    sprints,
    totalDuration: weeks,
    estimatedCost: sprints.reduce((s, sp) => s + sp.estimatedCost, 0)
  }
}

// Filet de sécurité pour la roadmap générée par IA (planSchema.js demande déjà à l'IA de
// garder le coût des stories cohérent avec le budget déclaré, mais une instruction de
// prompt reste indicative) — remet à l'échelle tous les coûts de stories après coup pour
// que leur somme corresponde exactement au budget produit/ops réel (budget total moins
// budget marketing), en conservant les proportions relatives déjà proposées par le modèle.
export function reconcileRoadmapCosts(roadmap, resources) {
  if (!roadmap?.sprints?.length) return roadmap
  const totalBudget = BUDGET[resources?.totalBudget]
  const marketingBudget = BUDGET[resources?.budgetEur] ?? 0
  if (totalBudget == null) return roadmap
  const devOpsBudget = Math.max(0, totalBudget - marketingBudget)
  const allStories = roadmap.sprints.flatMap(sp => sp.stories || [])
  const rawTotal = allStories.reduce((s, x) => s + (x.cost || 0), 0)
  if (!rawTotal) return roadmap
  const scale = devOpsBudget / rawTotal
  let allocated = 0
  allStories.forEach((story, idx) => {
    const isLast = idx === allStories.length - 1
    story.cost = isLast ? Math.max(0, devOpsBudget - allocated) : Math.max(0, Math.round(story.cost * scale))
    allocated += story.cost
  })
  const nextSprints = roadmap.sprints.map(sp => ({ ...sp, estimatedCost: (sp.stories || []).reduce((s, x) => s + x.cost, 0) }))
  return { ...roadmap, sprints: nextSprints, estimatedCost: nextSprints.reduce((s, sp) => s + sp.estimatedCost, 0) }
}
