// Détection de conflits de dépendances et de goulots de capacité dans une roadmap.
export function validateRoadmap(roadmap) {
  if (!roadmap?.sprints?.length) return []

  const issues = []
  const sprintOf = new Map()
  const storyById = new Map()
  roadmap.sprints.forEach(sp => {
    sp.stories.forEach(story => {
      sprintOf.set(story.id, sp.sprintId)
      storyById.set(story.id, story)
    })
  })

  const efforts = roadmap.sprints.map(sp => sp.stories.reduce((s, x) => s + x.effort, 0))
  const median = efforts.slice().sort((a, b) => a - b)[Math.floor(efforts.length / 2)] || 0
  const overloadThreshold = median * 1.5

  roadmap.sprints.forEach(sp => {
    const totalEffort = sp.stories.reduce((s, x) => s + x.effort, 0)

    if (median > 0 && totalEffort > overloadThreshold) {
      issues.push({
        type: 'bottleneck',
        sprintId: sp.sprintId,
        message: `Sprint ${sp.sprintId} : ${totalEffort}pts, nettement au-dessus de la charge habituelle (${Math.round(median)}pts)`
      })
    }

    sp.stories.forEach(story => {
      (story.dependsOn || []).forEach(depId => {
        if (!storyById.has(depId)) {
          issues.push({
            type: 'missing-dependency',
            sprintId: sp.sprintId,
            storyId: story.id,
            message: `${story.id} dépend de ${depId}, introuvable dans la roadmap`
          })
          return
        }
        const depSprint = sprintOf.get(depId)
        if (depSprint > sp.sprintId) {
          issues.push({
            type: 'dependency-conflict',
            sprintId: sp.sprintId,
            storyId: story.id,
            message: `${story.id} (sprint ${sp.sprintId}) dépend de ${depId}, planifié plus tard (sprint ${depSprint})`
          })
        } else if (depSprint === sp.sprintId) {
          issues.push({
            type: 'same-sprint-dependency',
            sprintId: sp.sprintId,
            storyId: story.id,
            message: `${story.id} dépend de ${depId} dans le même sprint (${sp.sprintId}) — risque de blocage`
          })
        }
      })
    })
  })

  return issues
}
