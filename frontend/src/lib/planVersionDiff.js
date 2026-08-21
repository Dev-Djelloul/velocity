// Différence structurée entre deux instantanés du même plan (voir PlanVersionsPage.jsx) —
// réutilise les mêmes détecteurs que le changelog en cours d'édition (changeDescriptions.js,
// stories déplacées/statut changé, cibles de KPI modifiées) et y ajoute ce qui manquait pour
// une vraie comparaison "avant/après" : stories ajoutées/retirées, deltas budgétaires,
// résumé exécutif.
import { diffRoadmapItems, diffKpiItems } from './changeDescriptions'

function flattenStories(roadmap) {
  return (roadmap?.sprints || []).flatMap(sp => sp.stories.map(s => ({ ...s, sprintId: sp.sprintId })))
}

function diffAddedRemoved(oldRoadmap, newRoadmap) {
  const oldIds = new Set(flattenStories(oldRoadmap).map(s => s.id))
  const newIds = new Set(flattenStories(newRoadmap).map(s => s.id))
  return {
    added: flattenStories(newRoadmap).filter(s => !oldIds.has(s.id)),
    removed: flattenStories(oldRoadmap).filter(s => !newIds.has(s.id))
  }
}

export function diffPlanVersions(oldPlan, newPlan, lang) {
  const { added, removed } = diffAddedRemoved(oldPlan?.roadmap, newPlan?.roadmap)
  return {
    roadmap: {
      added,
      removed,
      changed: diffRoadmapItems(oldPlan?.roadmap, newPlan?.roadmap, lang)
    },
    kpis: diffKpiItems(oldPlan?.kpis, newPlan?.kpis, lang),
    marketingBudget: { old: oldPlan?.marketing?.totalBudget ?? null, new: newPlan?.marketing?.totalBudget ?? null },
    executiveSummary: { old: oldPlan?.executiveSummary || '', new: newPlan?.executiveSummary || '' },
    classification: { old: oldPlan?.classification || '', new: newPlan?.classification || '' }
  }
}
