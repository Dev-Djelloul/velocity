// Génère une description humaine précise de chaque modification apportée au plan — pas
// juste "Roadmap a changé", mais "« Landing page » déplacée du Sprint 1 au Sprint 2" quand
// c'est calculable. Utilisé par PlanViewer pour peupler la bannière de changements en
// attente et le journal affiché sur la carte "Ravi de te revoir".
import { t } from './i18n'
import { formatDateShort } from './dateFormat'

const MAX_ITEMS = 3

function joinChanges(items, lang) {
  if (items.length <= MAX_ITEMS) return items.join(' · ')
  const rest = items.length - MAX_ITEMS
  return `${items.slice(0, MAX_ITEMS).join(' · ')} (${lang === 'fr' ? `+${rest} autre${rest > 1 ? 's' : ''}` : `+${rest} more`})`
}

function flattenStories(roadmap) {
  return (roadmap?.sprints || []).flatMap(sp => sp.stories.map(s => ({ ...s, sprintId: sp.sprintId })))
}

export function describeRoadmapChange(oldRoadmap, newRoadmap, lang) {
  const oldById = new Map(flattenStories(oldRoadmap).map(s => [s.id, s]))
  const changes = []
  for (const story of flattenStories(newRoadmap)) {
    const prev = oldById.get(story.id)
    if (!prev) continue
    if (prev.sprintId !== story.sprintId) {
      changes.push(
        lang === 'fr'
          ? `« ${story.title} » déplacée de ${prev.sprintId} à ${story.sprintId}`
          : `"${story.title}" moved from ${prev.sprintId} to ${story.sprintId}`
      )
    } else if (prev.status !== story.status) {
      const statusKey = { todo: 'todo', in_progress: 'inProgress', done: 'done' }[story.status] || story.status
      changes.push(
        lang === 'fr'
          ? `« ${story.title} » : statut → ${t(lang, 'outputs.rollover.status')[statusKey] || story.status}`
          : `"${story.title}": status → ${t(lang, 'outputs.rollover.status')[statusKey] || story.status}`
      )
    }
  }
  if (!changes.length) return lang === 'fr' ? 'Roadmap mise à jour' : 'Roadmap updated'
  return joinChanges(changes, lang)
}

export function describeKpisChange(oldKpis, newKpis, lang) {
  const oldByName = new Map((oldKpis || []).map(k => [k.name, k]))
  const changes = []
  for (const kpi of newKpis || []) {
    const prev = oldByName.get(kpi.name)
    if (prev && prev.target !== kpi.target) {
      changes.push(
        lang === 'fr'
          ? `KPI « ${kpi.name} » : cible ${prev.target ?? '—'} → ${kpi.target ?? '—'}`
          : `KPI "${kpi.name}": target ${prev.target ?? '—'} → ${kpi.target ?? '—'}`
      )
    }
  }
  if (!changes.length) return lang === 'fr' ? 'KPIs mis à jour' : 'KPIs updated'
  return joinChanges(changes, lang)
}

export function describeDateChange(oldIso, newIso, label, lang) {
  const oldDate = formatDateShort(oldIso, lang)
  const newDate = formatDateShort(newIso, lang)
  if (!oldDate) return `${label} : ${newDate}`
  return `${label} : ${oldDate} → ${newDate}`
}

export function describeMetricsChange(oldHistory, newHistory, lang) {
  const oldLen = (oldHistory || []).length
  const newLen = (newHistory || []).length
  if (newLen > oldLen) {
    const added = newHistory[newHistory.length - 1]
    const date = formatDateShort(added?.date, lang)
    return lang === 'fr' ? `Point de suivi ajouté${date ? ` (${date})` : ''}` : `Tracking point added${date ? ` (${date})` : ''}`
  }
  if (newLen < oldLen) return lang === 'fr' ? 'Point de suivi supprimé' : 'Tracking point removed'
  return lang === 'fr' ? 'Suivi post-lancement mis à jour' : 'Post-launch tracking updated'
}
