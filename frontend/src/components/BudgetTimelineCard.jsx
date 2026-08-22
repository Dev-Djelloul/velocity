import { t } from '../lib/i18n'
import { formatMoney } from '../lib/currency'
import { IconCreditCard, IconClock } from './Icons'
import '../styles/BudgetTimelineCard.css'

// Carte "Budget & Délai" du Go-to-market : source unique pour le budget total du
// lancement et le délai visé — pilote en retour le Prévisionnel financier (recalculé en
// direct dans PlanViewer), le plafond du slider de budget marketing juste en dessous, et
// les stats de la carte d'identité tout en haut du plan. Demandé explicitement pour que
// "tout se recalcule à partir du budget total", plutôt que d'avoir un budget marketing
// éditable sans référence commune.
export default function BudgetTimelineCard({ lang, totalBudget, onTotalBudgetChange, timelineWeeks, onTimelineWeeksChange, onRegenerateRoadmap }) {
  return (
    <div className="budget-timeline-card card">
      <div className="budget-timeline-header">
        <h3>{t(lang, 'outputs.budgetTimeline.title')}</h3>
        <p className="budget-timeline-subtitle">{t(lang, 'outputs.budgetTimeline.subtitle')}</p>
      </div>

      <div className="budget-timeline-control">
        <label>
          <IconCreditCard width={14} height={14} /> {t(lang, 'outputs.budgetTimeline.budgetLabel')}: <strong>{formatMoney(totalBudget)}</strong>
        </label>
        <input type="range" min="2000" max="100000" step="500" value={totalBudget}
          onChange={e => onTotalBudgetChange(Number(e.target.value))} />
      </div>

      <div className="budget-timeline-control">
        <label>
          <IconClock width={14} height={14} /> {t(lang, 'outputs.budgetTimeline.timelineLabel')}: <strong>{t(lang, 'outputs.budgetTimeline.weeks')(timelineWeeks)}</strong>
        </label>
        <input type="range" min="2" max="52" step="1" value={timelineWeeks}
          onChange={e => onTimelineWeeksChange(Number(e.target.value))} />
      </div>

      <p className="budget-timeline-hint">{t(lang, 'outputs.budgetTimeline.hint')}</p>

      {onRegenerateRoadmap && (
        <button type="button" className="btn-secondary budget-timeline-regenerate" onClick={onRegenerateRoadmap}>
          {t(lang, 'outputs.budgetTimeline.regenerateButton')}
        </button>
      )}
    </div>
  )
}
