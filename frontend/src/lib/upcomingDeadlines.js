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

export function getUpcomingDeadlines(plans, limit = 5) {
  const now = Date.now()
  const items = []

  for (const p of plans || []) {
    const name = p.product?.name || null

    if (p.launchDate) {
      const time = new Date(p.launchDate).getTime()
      if (Number.isFinite(time) && time >= now) {
        items.push({ id: `${p.id}:launch`, kind: 'launch', name, date: p.launchDate, time })
      }
    }

    const sprint = nextSprint(p)
    if (sprint) {
      items.push({ id: `${p.id}:sprint`, kind: 'sprint', name, sprintId: sprint.sprintId, date: sprint.end.toISOString(), time: sprint.end.getTime() })
    }
  }

  return items.sort((a, b) => a.time - b.time).slice(0, limit)
}

export function daysUntil(isoDate) {
  const diff = new Date(isoDate).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.round(diff / 86400000)
}
