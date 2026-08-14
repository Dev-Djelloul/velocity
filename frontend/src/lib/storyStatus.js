// Statut tri-état des user stories, partagé entre RoadmapCard (vue Sprint) et BacklogCard
// (vue liste) — un clic sur le badge de statut fait avancer la story dans ce cycle.
export const STORY_STATUSES = ['todo', 'in_progress', 'done']

export function nextStoryStatus(current) {
  const idx = STORY_STATUSES.indexOf(current || 'todo')
  return STORY_STATUSES[(idx + 1) % STORY_STATUSES.length]
}
