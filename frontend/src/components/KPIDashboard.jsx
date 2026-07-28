import { t } from '../lib/i18n'
import '../styles/KPIDashboard.css'

export default function KPIDashboard({ kpis, lang }) {
  if (!kpis || kpis.length === 0) return null

  const primaryKpi = kpis[0]
  const additionalKpis = kpis.slice(1)

  return (
    <div className="kpi-dashboard card">
      <div className="kpi-dashboard-header">
        <h3>{t(lang, 'outputs.kpis')}</h3>
        <p className="kpi-subtitle">Métriques principales de succès</p>
      </div>

      {/* Primary KPI */}
      <div className="kpi-primary">
        <div className="kpi-tile">
          <div className="kpi-label">{primaryKpi.name}</div>
          <div className="kpi-value">{primaryKpi.target || '—'}</div>
          <div className="kpi-unit">{primaryKpi.unit}</div>
          <div className="kpi-formula">{primaryKpi.formula}</div>
        </div>
      </div>

      {/* Additional KPIs Grid */}
      {additionalKpis.length > 0 && (
        <div className="kpi-grid">
          {additionalKpis.map((kpi, idx) => (
            <div key={idx} className="kpi-tile">
              <div className="kpi-label">{kpi.name}</div>
              <div className="kpi-value">{kpi.target || '—'}</div>
              <div className="kpi-unit">{kpi.unit}</div>
              <div className="kpi-formula">{kpi.formula}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
