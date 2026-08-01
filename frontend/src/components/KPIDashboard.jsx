import { t } from '../lib/i18n'
import ABTestCalculator from './ABTestCalculator'
import { IconTarget } from './Icons'
import '../styles/KPIDashboard.css'

export default function KPIDashboard({ kpis, lang, onKpisChange }) {
  if (!kpis || kpis.length === 0) return null

  const updateTarget = (idx, value) => {
    const next = kpis.map((k, i) => i === idx ? { ...k, target: value === '' ? null : Number(value) } : k)
    onKpisChange?.(next)
  }

  const [primary, ...secondary] = kpis

  const renderTile = (kpi, idx) => (
    <div key={idx} className="kpi-tile">
      <div className="kpi-tile-label">{kpi.name}</div>
      <div className="kpi-tile-value-row">
        <input
          className="kpi-value-input"
          type="number"
          value={kpi.target ?? ''}
          placeholder="—"
          onChange={e => updateTarget(idx, e.target.value)}
        />
        <span className="kpi-unit">{kpi.unit}</span>
      </div>
      <div className="kpi-formula">{kpi.formula}</div>
    </div>
  )

  return (
    <div className="kpi-dashboard card">
      <div className="kpi-dashboard-header">
        <h3>{t(lang, 'outputs.kpis')}</h3>
        <p className="kpi-subtitle">{t(lang, 'outputs.kpiSubtitle')}</p>
      </div>

      <div className="kpi-hero">
        <div className="kpi-hero-icon"><IconTarget width={24} height={24} /></div>
        <div className="kpi-hero-body">
          <div className="kpi-hero-label">{primary.name}</div>
          <div className="kpi-hero-value-row">
            <input
              className="kpi-hero-input"
              type="number"
              value={primary.target ?? ''}
              placeholder="—"
              onChange={e => updateTarget(0, e.target.value)}
            />
            <span className="kpi-hero-unit">{primary.unit}</span>
          </div>
          <div className="kpi-hero-formula">{primary.formula}</div>
        </div>
      </div>

      {secondary.length > 0 && (
        <div className="kpi-grid">
          {secondary.map((kpi, idx) => renderTile(kpi, idx + 1))}
        </div>
      )}

      <ABTestCalculator lang={lang} />
    </div>
  )
}
