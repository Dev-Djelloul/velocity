import { t } from '../lib/i18n'
import { formatMoney } from '../lib/currency'
import { resolveBudgetAmount } from '../lib/budgetTiers'
import { IconCoin, IconAlertTriangle } from './Icons'
import InfoModal from './InfoModal'
import FinancialsCard from './FinancialsCard'
import '../styles/PlanFinancialReportModal.css'

// Rapport financier par plan, dans le style d'une vraie feuille de finance à présenter à
// des investisseurs (retour utilisateur explicite : "inspire-toi des meilleurs plans
// financiers du marché") — ouvert depuis "Budget cumulé" (espace d'équipe) en cliquant sur
// un plan. Réutilise FinancialsCard telle quelle pour le détail (burn/runway, seuil de
// rentabilité, répartition des coûts) au lieu de redupliquer ces calculs : seuls l'en-tête
// (identité du plan, budgets bruts) et le disclaimer investisseur sont propres à ce rapport.
export default function PlanFinancialReportModal({ plan, lang, onClose }) {
  if (!plan) return null

  const launchBudget = plan.resources?.totalBudget ? resolveBudgetAmount(plan.resources.totalBudget) : 0
  const marketingBudget = plan.marketing?.totalBudget || 0
  const grandTotal = launchBudget + marketingBudget

  return (
    <InfoModal
      icon={<IconCoin width={22} height={22} />}
      title={t(lang, 'planFinancialReport.title')(plan.product?.name || t(lang, 'plans.untitled'))}
      onClose={onClose}
      wide
    >
      <div className="plan-financial-report">
        <div className="plan-financial-report-meta">
          {plan.classification && <span className="plan-financial-report-tag">{plan.classification}</span>}
          {plan.market?.b2bVsB2c && (
            <span className="plan-financial-report-tag">
              {t(lang, 'market.b2bVsB2cOptions')[plan.market.b2bVsB2c] || plan.market.b2bVsB2c}
            </span>
          )}
        </div>

        <div className="plan-financial-report-totals">
          <div className="plan-financial-report-total">
            <span className="plan-financial-report-total-label">{t(lang, 'planFinancialReport.grandTotal')}</span>
            <span className="plan-financial-report-total-value">{formatMoney(grandTotal)}</span>
          </div>
          <div className="plan-financial-report-total">
            <span className="plan-financial-report-total-label">{t(lang, 'planFinancialReport.launchBudget')}</span>
            <span className="plan-financial-report-total-value">{formatMoney(launchBudget)}</span>
          </div>
          <div className="plan-financial-report-total">
            <span className="plan-financial-report-total-label">{t(lang, 'planFinancialReport.marketingBudget')}</span>
            <span className="plan-financial-report-total-value">{formatMoney(marketingBudget)}</span>
          </div>
        </div>

        {plan.financials ? (
          <FinancialsCard financials={plan.financials} lang={lang} />
        ) : (
          <p className="plan-financial-report-empty">
            <IconAlertTriangle width={16} height={16} />
            {t(lang, 'export.complianceNoFinancials')}
          </p>
        )}

        <p className="plan-financial-report-disclaimer">{t(lang, 'export.complianceDisclaimer')}</p>
      </div>
    </InfoModal>
  )
}
