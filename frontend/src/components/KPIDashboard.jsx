import { useState } from 'react'
import { t } from '../lib/i18n'

export default function KPIDashboard({ kpis, lang }) {
  const [active, setActive] = useState(null)

  return (
    <div className="card plan-card">
      <h3>{t(lang, 'outputs.kpis')}</h3>
      <div className="kpi-grid">
        {kpis.map(kpi => (
          <button key={kpi.name} className="kpi-tile" onClick={() => setActive(active === kpi.name ? null : kpi.name)}>
            <div className="kpi-name">{kpi.name}</div>
            <div className="kpi-value">{kpi.target != null ? `${kpi.target} ${kpi.unit}` : '—'}</div>
            {active === kpi.name && (
              <div className="kpi-formula">{t(lang, 'outputs.formula')}: {kpi.formula}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
