// Heuristique locale : transforme une question en langage naturel en config de graphique
// à partir des données déjà présentes dans le plan (pas d'appel réseau).
function normalize(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function buildChartFromQuery(query, plan, lang) {
  const q = normalize(query)
  const isSprintQuery = /sprint/.test(q)
  const isKpiQuery = /kpi/.test(q)
  const isCostQuery = /cout|cost|depense|budget/.test(q)
  const isEffortQuery = /effort|point|pts|charge/.test(q)

  if (isKpiQuery && plan.kpis?.length) {
    return {
      title: lang === 'en' ? 'KPI targets' : 'Cibles des KPI',
      unit: '',
      bars: plan.kpis.filter(k => typeof k.target === 'number').map(k => ({ label: k.name, value: k.target }))
    }
  }

  if (isSprintQuery && isEffortQuery && plan.roadmap?.sprints) {
    return {
      title: lang === 'en' ? 'Effort per sprint (pts)' : 'Effort par sprint (pts)',
      unit: 'pts',
      bars: plan.roadmap.sprints.map(sp => ({
        label: `Sprint ${sp.sprintId}`,
        value: sp.stories.reduce((s, x) => s + x.effort, 0)
      }))
    }
  }

  if (isSprintQuery && plan.roadmap?.sprints) {
    return {
      title: lang === 'en' ? 'Cost per sprint (€)' : 'Coût par sprint (€)',
      unit: '€',
      bars: plan.roadmap.sprints.map(sp => ({ label: `Sprint ${sp.sprintId}`, value: sp.estimatedCost }))
    }
  }

  if (isCostQuery && plan.marketing?.channels) {
    return {
      title: lang === 'en' ? 'Budget per channel (€)' : 'Budget par canal (€)',
      unit: '€',
      bars: plan.marketing.channels.map(ch => ({ label: ch.name, value: ch.budget }))
    }
  }

  if (/mois|month/.test(q) && plan.marketing?.channels) {
    const monthlyTotal = Math.round((plan.marketing.totalBudget || 0) / Math.max(1, Math.round((plan.roadmap?.totalDuration || 4) / 4)))
    const monthsCount = Math.max(1, Math.round((plan.roadmap?.totalDuration || 4) / 4))
    return {
      title: lang === 'en' ? 'Budget per month (€)' : 'Budget par mois (€)',
      unit: '€',
      bars: Array.from({ length: monthsCount }, (_, i) => ({ label: `${lang === 'en' ? 'Month' : 'Mois'} ${i + 1}`, value: monthlyTotal }))
    }
  }

  // Repli par défaut : budget par canal
  if (plan.marketing?.channels) {
    return {
      title: lang === 'en' ? 'Budget per channel (€)' : 'Budget par canal (€)',
      unit: '€',
      bars: plan.marketing.channels.map(ch => ({ label: ch.name, value: ch.budget }))
    }
  }

  return null
}
