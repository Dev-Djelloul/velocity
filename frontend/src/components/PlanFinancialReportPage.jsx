import { useState } from 'react'
import { t } from '../lib/i18n'
import { formatMoney } from '../lib/currency'
import { resolveBudgetAmount } from '../lib/budgetTiers'
import { IconArrowLeft, IconCoin, IconTrendingUp, IconTarget, IconAlertTriangle } from './Icons'
import financialReportBackground from '../../assets/img/financial-plan-velocity.webp'
import '../styles/TeamPage.css'
import '../styles/PlanVersionsPage.css'
import '../styles/FinancialsCard.css'
import '../styles/PlanFinancialReportPage.css'

const COST_PALETTE = ['#9184d9', '#06b6d4', '#4ade80', '#fb923c', '#f472b6', '#facc15', '#60a5fa']

function polarPoint(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function donutWedgePath(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const large = endAngle - startAngle > 180 ? 1 : 0
  const a0 = polarPoint(cx, cy, rOuter, endAngle)
  const a1 = polarPoint(cx, cy, rOuter, startAngle)
  const b0 = polarPoint(cx, cy, rInner, startAngle)
  const b1 = polarPoint(cx, cy, rInner, endAngle)
  return `M ${a0.x} ${a0.y} A ${rOuter} ${rOuter} 0 ${large} 0 ${a1.x} ${a1.y} L ${b0.x} ${b0.y} A ${rInner} ${rInner} 0 ${large} 1 ${b1.x} ${b1.y} Z`
}

// Vraie page dédiée au rapport financier (pas une modale, demandé explicitement) — un
// one-pager investisseurs avec de vrais graphiques (projection de trésorerie en courbe,
// répartition des coûts en camembert), pas juste une reprise de FinancialsCard telle
// quelle. Ouverte depuis "Budget cumulé" (espace d'équipe, voir SpacePage.jsx) via
// App.jsx (handleOpenFinancialReport), même mécanisme que "Bibliothèque de versions".
export default function PlanFinancialReportPage({ plan, lang, onBack }) {
  const [hoverCash, setHoverCash] = useState(null)
  const [hoverWedge, setHoverWedge] = useState(null)

  const financials = plan?.financials
  const launchBudget = plan?.resources?.totalBudget ? resolveBudgetAmount(plan.resources.totalBudget) : 0
  const marketingBudget = plan?.marketing?.totalBudget || 0
  const grandTotal = launchBudget + marketingBudget

  // --- Projection de trésorerie (courbe) : même calcul que FinancialsCard (budget - burn *
  // mois), mais rendue en vraie courbe SVG avec points survolables plutôt qu'en barres. ---
  let cashPoints = []
  let linePath = ''
  let areaPath = ''
  let maxCash = 1
  const chartW = 640
  const chartH = 220
  const padL = 60
  const padR = 16
  const padT = 16
  const padB = 26

  if (financials) {
    const budget = Math.round(financials.monthlyBurn * financials.runwayMonths)
    const monthCount = Math.max(1, Math.ceil(financials.runwayMonths))
    cashPoints = Array.from({ length: monthCount + 1 }, (_, i) => Math.max(0, budget - financials.monthlyBurn * i))
    maxCash = Math.max(...cashPoints, 1)
    const xFor = (i) => padL + (i / monthCount) * (chartW - padL - padR)
    const yFor = (v) => padT + (1 - v / maxCash) * (chartH - padT - padB)
    const coords = cashPoints.map((v, i) => ({ x: xFor(i), y: yFor(v), i, v }))
    linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
    areaPath = `${linePath} L ${coords[coords.length - 1].x} ${yFor(0)} L ${coords[0].x} ${yFor(0)} Z`
    cashPoints = coords
  }

  // --- Répartition des coûts (camembert) : mêmes données que costBreakdown, en vrais
  // wedges SVG survolables plutôt qu'en barres empilées. ---
  let wedges = []
  if (financials?.costBreakdown?.length) {
    const total = financials.costBreakdown.reduce((s, l) => s + l.amount, 0) || 1
    let angle = 0
    wedges = financials.costBreakdown.map((line, i) => {
      const sweep = (line.amount / total) * 360
      const start = angle + 1.4
      const end = Math.max(start, angle + sweep - 1.4)
      angle += sweep
      return { ...line, color: COST_PALETTE[i % COST_PALETTE.length], start, end }
    })
  }

  return (
    <div className="plan-financial-report-page-outer">
      <div className="plan-financial-report-page-bg" style={{ backgroundImage: `url(${financialReportBackground})` }} aria-hidden="true" />
      <div className="plan-financial-report-page-inner">
        <div className="plan-financial-report-page">
          <div className="plan-versions-header">
            <button className="team-back-btn" onClick={onBack}>
              <IconArrowLeft width={16} height={16} /> {t(lang, 'planVersions.back')}
            </button>
            <div className="plan-versions-title">
              <IconCoin width={22} height={22} />
              <div>
                <h1>{t(lang, 'planFinancialReport.title')(plan?.product?.name || t(lang, 'plans.untitled'))}</h1>
                <p>
                  {plan?.classification}
                  {plan?.market?.b2bVsB2c && ` · ${t(lang, 'market.b2bVsB2cOptions')[plan.market.b2bVsB2c] || plan.market.b2bVsB2c}`}
                </p>
              </div>
            </div>
          </div>

          <div className="fin-report-totals card">
            <div className="fin-report-total fin-report-total-grand">
              <span className="fin-report-total-label">{t(lang, 'planFinancialReport.grandTotal')}</span>
              <span className="fin-report-total-value fin-report-total-value-grand">{formatMoney(grandTotal)}</span>
            </div>
            <div className="fin-report-total">
              <span className="fin-report-total-label">{t(lang, 'planFinancialReport.launchBudget')}</span>
              <span className="fin-report-total-value">{formatMoney(launchBudget)}</span>
            </div>
            <div className="fin-report-total">
              <span className="fin-report-total-label">{t(lang, 'planFinancialReport.marketingBudget')}</span>
              <span className="fin-report-total-value">{formatMoney(marketingBudget)}</span>
            </div>
          </div>

          {!financials ? (
            <p className="fin-report-empty card">
              <IconAlertTriangle width={16} height={16} />
              {t(lang, 'export.complianceNoFinancials')}
            </p>
          ) : (
            <>
              <div className="financials-metrics fin-report-kpis">
                <div className="fin-tile" style={{ '--fin-color': '#9184d9' }}>
                  <div className="fin-icon"><IconCoin width={16} height={16} /></div>
                  <div className="fin-label">{t(lang, 'outputs.financials.monthlyBurn')}</div>
                  <div className="fin-value">{formatMoney(financials.monthlyBurn)}</div>
                </div>
                <div className="fin-tile" style={{ '--fin-color': '#06b6d4' }}>
                  <div className="fin-icon"><IconTrendingUp width={16} height={16} /></div>
                  <div className="fin-label">{t(lang, 'outputs.financials.runway')}</div>
                  <div className="fin-value">{financials.runwayMonths} {t(lang, 'outputs.financials.months')}</div>
                </div>
                <div className="fin-tile" style={{ '--fin-color': '#4ade80' }}>
                  <div className="fin-icon"><IconTarget width={16} height={16} /></div>
                  <div className="fin-label">{t(lang, 'outputs.financials.breakEven')}</div>
                  <div className="fin-value">{financials.breakEvenUsers} <span className="fin-value-unit">{t(lang, 'outputs.financials.clients')}</span></div>
                </div>
              </div>

              <div className="fin-report-charts">
                <div className="fin-report-chart-card card">
                  <h3>{t(lang, 'planFinancialReport.cashProjection')}</h3>
                  <p className="fin-report-chart-subtitle">{t(lang, 'planFinancialReport.cashProjectionSubtitle')}</p>
                  <svg viewBox={`0 0 ${chartW} ${chartH}`} className="fin-report-line-chart" onMouseLeave={() => setHoverCash(null)}>
                    {[0.25, 0.5, 0.75, 1].map(f => (
                      <g key={f}>
                        <line
                          x1={padL} x2={chartW - padR}
                          y1={padT + (1 - f) * (chartH - padT - padB)}
                          y2={padT + (1 - f) * (chartH - padT - padB)}
                          className="fin-report-gridline"
                        />
                        <text
                          x={padL - 8}
                          y={padT + (1 - f) * (chartH - padT - padB) + 3}
                          textAnchor="end"
                          className="fin-report-axis-y-label"
                        >
                          {formatMoney(Math.round(maxCash * f))}
                        </text>
                      </g>
                    ))}
                    <path d={areaPath} className="fin-report-area" />
                    <path d={linePath} className="fin-report-line" />
                    {cashPoints.map(c => (
                      <circle
                        key={c.i}
                        cx={c.x} cy={c.y} r={hoverCash?.i === c.i ? 5 : 3}
                        className="fin-report-line-dot"
                        onMouseEnter={() => setHoverCash(c)}
                      />
                    ))}
                    {cashPoints.map((c, idx) => {
                      const showLabel = cashPoints.length <= 8 || idx === 0 || idx === cashPoints.length - 1 || idx % 2 === 0
                      if (!showLabel) return null
                      const anchor = idx === 0 ? 'start' : idx === cashPoints.length - 1 ? 'end' : 'middle'
                      return (
                        <text key={c.i} x={c.x} y={chartH - 6} textAnchor={anchor} className="fin-report-axis-label">
                          {t(lang, 'planFinancialReport.monthShort')(c.i)}
                        </text>
                      )
                    })}
                  </svg>
                  {hoverCash && (
                    <div className="fin-report-chart-tooltip">
                      {t(lang, 'planFinancialReport.monthShort')(hoverCash.i)} — {formatMoney(hoverCash.v)}
                    </div>
                  )}
                  <div className="fin-report-chart-legend">
                    <span className="fin-report-chart-legend-item">
                      <i className="fin-report-chart-legend-swatch" />
                      {t(lang, 'planFinancialReport.cashLegendRemaining')}
                    </span>
                    <span className="fin-report-chart-legend-item fin-report-chart-legend-muted">
                      {t(lang, 'planFinancialReport.cashLegendBurn')(formatMoney(financials.monthlyBurn))}
                    </span>
                  </div>
                </div>

                <div className="fin-report-chart-card card">
                  <h3>{t(lang, 'outputs.financials.breakdown')}</h3>
                  <p className="fin-report-chart-subtitle">{t(lang, 'planFinancialReport.costBreakdownSubtitle')}</p>
                  <div className="fin-report-donut-wrap">
                    <svg viewBox="0 0 160 160" className="fin-report-donut" onMouseLeave={() => setHoverWedge(null)}>
                      {wedges.map((w, i) => (
                        <path
                          key={i}
                          d={donutWedgePath(80, 80, 78, 50, w.start, w.end)}
                          fill={w.color}
                          className="fin-report-donut-wedge"
                          onMouseEnter={() => setHoverWedge(w)}
                        />
                      ))}
                    </svg>
                    <div className="fin-report-donut-center">
                      {hoverWedge ? (
                        <>
                          <span className="fin-report-donut-center-value">{hoverWedge.pct}%</span>
                          <span className="fin-report-donut-center-label">{hoverWedge.category}</span>
                        </>
                      ) : (
                        <>
                          <span className="fin-report-donut-center-value">{formatMoney(financials.monthlyBurn)}</span>
                          <span className="fin-report-donut-center-label">{t(lang, 'outputs.financials.monthlyBurn')}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="fin-report-donut-legend">
                    {wedges.map((w, i) => (
                      <div key={i} className="fin-report-donut-legend-item">
                        <i style={{ background: w.color }} />
                        <span>{w.category}</span>
                        <strong>{w.pct}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="fin-report-bridge card">
                <h3>{t(lang, 'outputs.financials.bridgeTitle')}</h3>
                <p className="fin-report-chart-subtitle">{t(lang, 'outputs.financials.bridgeSubtitle')}</p>
                <div className="bridge-rows">
                  <div className="bridge-row">
                    <span className="bridge-row-label">{t(lang, 'outputs.financials.bridgeCost')}</span>
                    <div className="bridge-bar-track">
                      <div
                        className="bridge-bar-fill bridge-cost"
                        style={{ width: `${(financials.monthlyBurn / Math.max(financials.monthlyBurn, financials.breakEvenMonthlyRevenue, 1)) * 100}%` }}
                      />
                    </div>
                    <span className="bridge-row-value">{formatMoney(financials.monthlyBurn)}</span>
                  </div>
                  <div className="bridge-row">
                    <span className="bridge-row-label">{t(lang, 'outputs.financials.bridgeRevenue')}</span>
                    <div className="bridge-bar-track">
                      <div
                        className="bridge-bar-fill bridge-revenue"
                        style={{ width: `${(financials.breakEvenMonthlyRevenue / Math.max(financials.monthlyBurn, financials.breakEvenMonthlyRevenue, 1)) * 100}%` }}
                      />
                    </div>
                    <span className="bridge-row-value">{formatMoney(financials.breakEvenMonthlyRevenue)}</span>
                  </div>
                </div>
                {financials.arpuRationale && (
                  <p className="fin-report-arpu-rationale">
                    <strong>{t(lang, 'outputs.financials.arpuLabel')}</strong> {financials.arpuRationale}
                  </p>
                )}
              </div>
            </>
          )}

          <p className="fin-report-disclaimer">{t(lang, 'export.complianceDisclaimer')}</p>
        </div>
      </div>
    </div>
  )
}
