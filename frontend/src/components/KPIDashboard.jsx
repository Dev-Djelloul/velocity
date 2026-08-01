import { t } from '../lib/i18n'
import ABTestCalculator from './ABTestCalculator'
import '../styles/KPIDashboard.css'

export default function KPIDashboard({ kpis, lang, onKpisChange }) {
  if (!kpis || kpis.length === 0) return null

  const updateTarget = (idx, value) => {
    const next = kpis.map((k, i) => i === idx ? { ...k, target: value === '' ? null : Number(value) } : k)
    onKpisChange?.(next)
  }

  const renderTile = (kpi, idx) => (
    <div key={idx} className="kpi-tile">
      <div className="kpi-label">{kpi.name}</div>
      <input
        className="kpi-value-input"
        type="number"
        value={kpi.target ?? ''}
        placeholder="—"
        onChange={e => updateTarget(idx, e.target.value)}
      />
      <div className="kpi-unit">{kpi.unit}</div>
      <div className="kpi-formula">{kpi.formula}</div>
    </div>
  )

  return (
    <div className="kpi-dashboard card">
      <div className="kpi-dashboard-header">
        <h3>{t(lang, 'outputs.kpis')}</h3>
        <p className="kpi-subtitle">Métriques principales de succès</p>
      </div>

      <div className="kpi-primary">{renderTile(kpis[0], 0)}</div>

      {kpis.length > 1 && (
        <div className="kpi-grid">
          {kpis.slice(1).map((kpi, idx) => renderTile(kpi, idx + 1))}
        </div>
      )}

      <ABTestCalculator lang={lang} />
    </div>
  )
}
