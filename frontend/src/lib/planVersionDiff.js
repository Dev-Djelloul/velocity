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

const PERSONA_FIELDS = [
  { key: 'title', fr: 'Poste', en: 'Role' },
  { key: 'ageRange', fr: 'Âge', en: 'Age' },
  { key: 'context', fr: 'Contexte', en: 'Context' },
  { key: 'preferredChannel', fr: 'Canal préféré', en: 'Preferred channel' },
  { key: 'buyingTrigger', fr: 'Déclencheur d\'achat', en: 'Buying trigger' }
]

// Personas n'ont pas d'id stable (voir PersonaCard.jsx) : on clé par nom, comme diffKpiItems
// le fait déjà pour les KPIs.
function diffPersonas(oldPersonas, newPersonas, lang) {
  const oldByName = new Map((oldPersonas || []).map(p => [p.name, p]))
  const newByName = new Map((newPersonas || []).map(p => [p.name, p]))
  const added = (newPersonas || []).filter(p => !oldByName.has(p.name))
  const removed = (oldPersonas || []).filter(p => !newByName.has(p.name))
  const changed = []
  for (const persona of newPersonas || []) {
    const prev = oldByName.get(persona.name)
    if (!prev) continue
    for (const field of PERSONA_FIELDS) {
      const oldV = prev[field.key] || ''
      const newV = persona[field.key] || ''
      if (oldV !== newV) {
        changed.push({
          key: `persona:${persona.name}:${field.key}`,
          detail: lang === 'fr'
            ? `« ${persona.name} » — ${field.fr} : ${oldV || '—'} → ${newV || '—'}`
            : `"${persona.name}" — ${field.en}: ${oldV || '—'} → ${newV || '—'}`
        })
      }
    }
  }
  return { added, removed, changed }
}

const FINANCIALS_FIELDS = [
  { key: 'monthlyBurn', fr: 'Dépenses mensuelles', en: 'Monthly burn', money: true },
  { key: 'runwayMonths', fr: 'Trésorerie (mois)', en: 'Runway (months)' },
  { key: 'assumedArpu', fr: 'ARPU estimé', en: 'Assumed ARPU', money: true },
  { key: 'breakEvenUsers', fr: 'Utilisateurs au seuil de rentabilité', en: 'Break-even users' },
  { key: 'breakEvenMonthlyRevenue', fr: 'Revenu mensuel au seuil de rentabilité', en: 'Break-even monthly revenue', money: true }
]

function fmtFinancialValue(value, lang, money) {
  if (value == null) return '—'
  const formatted = value.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')
  return money ? `${formatted} €` : formatted
}

// financials est un objet unique (pas une liste) : on compare directement ses champs clés,
// plus costBreakdown (la seule sous-liste), clée par catégorie faute d'id.
function diffFinancials(oldFinancials, newFinancials, lang) {
  const changed = []
  for (const field of FINANCIALS_FIELDS) {
    const oldV = oldFinancials?.[field.key]
    const newV = newFinancials?.[field.key]
    if (oldV !== newV && (oldV != null || newV != null)) {
      changed.push({
        key: `financials:${field.key}`,
        detail: `${lang === 'fr' ? field.fr : field.en} : ${fmtFinancialValue(oldV, lang, field.money)} → ${fmtFinancialValue(newV, lang, field.money)}`
      })
    }
  }
  const oldByCategory = new Map((oldFinancials?.costBreakdown || []).map(c => [c.category, c]))
  for (const cost of newFinancials?.costBreakdown || []) {
    const prev = oldByCategory.get(cost.category)
    if (prev && prev.amount !== cost.amount) {
      changed.push({
        key: `financials:cost:${cost.category}`,
        detail: `${cost.category} : ${fmtFinancialValue(prev.amount, lang, true)} → ${fmtFinancialValue(cost.amount, lang, true)}`
      })
    }
  }
  return changed
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
    personas: diffPersonas(oldPlan?.personas, newPlan?.personas, lang),
    financials: diffFinancials(oldPlan?.financials, newPlan?.financials, lang),
    marketingBudget: { old: oldPlan?.marketing?.totalBudget ?? null, new: newPlan?.marketing?.totalBudget ?? null },
    executiveSummary: { old: oldPlan?.executiveSummary || '', new: newPlan?.executiveSummary || '' },
    classification: { old: oldPlan?.classification || '', new: newPlan?.classification || '' }
  }
}
