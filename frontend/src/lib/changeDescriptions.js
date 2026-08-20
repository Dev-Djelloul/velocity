// Génère une description humaine précise de chaque modification apportée au plan — pas
// juste "Roadmap a changé", mais "« Landing page » déplacée du Sprint 1 au Sprint 2" quand
// c'est calculable. Chaque fonction renvoie une liste d'items { key, detail } : un item
// par élément réellement modifié (une story, un KPI...), avec une clé stable qui permet à
// PlanViewer de fusionner les éditions successives du même élément en une seule entrée en
// attente au lieu d'empiler une entrée par clic (ex: incrémenter un KPI dix fois de suite).
import { t } from './i18n'
import { formatDateShort } from './dateFormat'

export const SECTION_LABELS = {
  roadmap: { fr: 'Roadmap', en: 'Roadmap' },
  roadmapGantt: { fr: 'Roadmap · Gantt', en: 'Roadmap · Gantt' },
  roadmapBacklog: { fr: 'Roadmap · Backlog', en: 'Roadmap · Backlog' },
  roadmapAgents: { fr: 'Roadmap · Agents IA', en: 'Roadmap · AI agents' },
  planStartDate: { fr: 'Date de démarrage', en: 'Start date' },
  kpis: { fr: 'KPIs', en: 'KPIs' },
  metrics: { fr: 'Suivi post-lancement', en: 'Post-launch tracking' },
  launchDate: { fr: 'Date de lancement', en: 'Launch date' },
  veille: { fr: 'Veille IA', en: 'AI market watch' },
  benchmarks: { fr: 'Benchmarks', en: 'Benchmarks' },
  editorial: { fr: 'Calendrier éditorial', en: 'Editorial calendar' },
  advertising: { fr: 'Calendrier publicitaire', en: 'Ad calendar' },
  rgpd: { fr: 'RGPD', en: 'GDPR' }
}

export function sectionLabel(key, lang) {
  return SECTION_LABELS[key]?.[lang] || SECTION_LABELS[key]?.fr || key
}

function flattenStories(roadmap) {
  return (roadmap?.sprints || []).flatMap(sp => sp.stories.map(s => ({ ...s, sprintId: sp.sprintId })))
}

// Un item par story réellement modifiée (déplacement de sprint ou changement de statut),
// clé par id de story pour que déplacer deux fois la même story avant d'enregistrer ne
// garde que le dernier état.
export function diffRoadmapItems(oldRoadmap, newRoadmap, lang) {
  const oldById = new Map(flattenStories(oldRoadmap).map(s => [s.id, s]))
  const items = []
  for (const story of flattenStories(newRoadmap)) {
    const prev = oldById.get(story.id)
    if (!prev) continue
    if (prev.sprintId !== story.sprintId) {
      items.push({
        key: `story:${story.id}`,
        detail: lang === 'fr'
          ? `« ${story.title} » déplacée de ${prev.sprintId} à ${story.sprintId}`
          : `"${story.title}" moved from ${prev.sprintId} to ${story.sprintId}`
      })
    } else if (prev.status !== story.status) {
      const statusKey = { todo: 'todo', in_progress: 'inProgress', done: 'done' }[story.status] || story.status
      const statusLabel = t(lang, 'outputs.rollover.status')[statusKey] || story.status
      items.push({
        key: `story:${story.id}`,
        detail: lang === 'fr'
          ? `« ${story.title} » : statut → ${statusLabel}`
          : `"${story.title}": status → ${statusLabel}`
      })
    }
  }
  return items
}

// Un item par KPI dont la cible a changé, clé par nom de KPI.
export function diffKpiItems(oldKpis, newKpis, lang) {
  const oldByName = new Map((oldKpis || []).map(k => [k.name, k]))
  const items = []
  for (const kpi of newKpis || []) {
    const prev = oldByName.get(kpi.name)
    if (prev && prev.target !== kpi.target) {
      items.push({
        key: `kpi:${kpi.name}`,
        detail: lang === 'fr'
          ? `« ${kpi.name} » : cible ${prev.target ?? '—'} → ${kpi.target ?? '—'}`
          : `"${kpi.name}": target ${prev.target ?? '—'} → ${kpi.target ?? '—'}`
      })
    }
  }
  return items
}

export function describeDateChange(oldIso, newIso, lang) {
  const oldDate = formatDateShort(oldIso, lang)
  const newDate = formatDateShort(newIso, lang)
  if (!oldDate) return newDate
  return `${oldDate} → ${newDate}`
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
  return lang === 'fr' ? 'Mis à jour' : 'Updated'
}
