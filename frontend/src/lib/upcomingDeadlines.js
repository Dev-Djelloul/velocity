// Carte "Prochaines échéances" du dashboard : rassemble deux types d'échéance par plan —
// la date de lancement (plan.launchDate) et la fin du sprint en cours (dérivée de
// planStartDate + cadence de 14 jours, même calcul que RoadmapCard.jsx/GanttChart.jsx, qui
// ne stockent pas de date de sprint en dur). Pas de synchronisation calendrier externe
// (Google/Apple) pour l'instant — décision prise en conversation : trop lourd (OAuth,
// identifiants côté Worker) pour la valeur apportée dans un premier temps.
const SPRINT_DAYS = 14

function sprintEndDate(planStartDate, sprintId) {
  const start = new Date(planStartDate || Date.now())
  start.setDate(start.getDate() + (sprintId - 1) * SPRINT_DAYS)
  const end = new Date(start)
  end.setDate(end.getDate() + SPRINT_DAYS)
  return end
}

// Le sprint "à venir" d'un plan : le premier dont la date de fin n'est pas encore passée.
function nextSprint(plan) {
  const sprints = plan.roadmap?.sprints || []
  const planStart = plan.planStartDate || plan.generatedAt
  const now = Date.now()
  for (const sprint of sprints) {
    const end = sprintEndDate(planStart, sprint.sprintId)
    if (end.getTime() >= now) return { sprintId: sprint.sprintId, end }
  }
  return null
}

// Échéances d'UN plan (date de lancement + fin du sprint en cours) — factorisé hors de
// getUpcomingDeadlines pour être réutilisable par plan isolément (voir
// portfolioHealth.js, computePlanHealth : la santé par plan a besoin des mêmes échéances
// mais sans le plafond `limit` global qui, appliqué à tous les plans confondus, aurait pu
// masquer les échéances d'un plan précis derrière celles d'un autre).
export function getPlanDeadlines(p, now = Date.now()) {
  const name = p.product?.name || null
  // coverImage transmise pour que le dashboard puisse afficher une vignette par échéance
  // (retour utilisateur : sans repère visuel, une liste de plusieurs plans se ressemble
  // trop pour distinguer lequel est lequel d'un coup d'œil).
  const coverImage = p.coverImage || null
  const items = []

  if (p.launchDate) {
    const time = new Date(p.launchDate).getTime()
    if (Number.isFinite(time) && time >= now) {
      items.push({ id: `${p.id}:launch`, kind: 'launch', name, coverImage, date: p.launchDate, time, plan: p })
    }
  }

  const sprint = nextSprint(p)
  if (sprint) {
    // Points restants du sprint (stories pas encore "done") — pour répondre directement
    // à "il reste combien de travail avant cette échéance ?" sans avoir à rouvrir le plan
    // (retour utilisateur).
    const sprintData = (p.roadmap?.sprints || []).find(s => s.sprintId === sprint.sprintId)
    const remainingPoints = (sprintData?.stories || [])
      .filter(s => s.status !== 'done')
      .reduce((sum, s) => sum + (s.effort || 0), 0)
    items.push({ id: `${p.id}:sprint`, kind: 'sprint', name, coverImage, sprintId: sprint.sprintId, remainingPoints, date: sprint.end.toISOString(), time: sprint.end.getTime(), plan: p })
  }

  return items
}

export function getUpcomingDeadlines(plans, limit = 5) {
  const now = Date.now()
  const items = (plans || []).flatMap(p => getPlanDeadlines(p, now))
  return items.sort((a, b) => a.time - b.time).slice(0, limit)
}

export function daysUntil(isoDate) {
  const diff = new Date(isoDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.round(diff / 86400000)
}
