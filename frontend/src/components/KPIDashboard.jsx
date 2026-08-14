import { useState } from 'react'
import { t } from '../lib/i18n'
import { IconTarget, IconBarChart, IconClipboard } from './Icons'
import '../styles/KPIDashboard.css'

const KPI_PALETTE = ['#9184d9', '#06b6d4', '#4ade80', '#fb923c', '#f472b6', '#eab308']

export default function KPIDashboard({ kpis, lang, onKpisChange }) {
  const [view, setView] = useState('cards')
  if (!kpis || kpis.length === 0) return null

  const updateTarget = (idx, value) => {
    const next = kpis.map((k, i) => i === idx ? { ...k, target: value === '' ? null : Number(value) } : k)
    onKpisChange?.(next)
  }

  return (
    <div className="kpi-dashboard card">
      <div className="kpi-dashboard-header">
        <div>
          <h3>{t(lang, 'outputs.kpis')}</h3>
          <p className="kpi-subtitle">{t(lang, 'outputs.kpiSubtitle')}</p>
        </div>
        <div className="kpi-view-toggle" role="tablist">
          <button
            className={`kpi-view-btn ${view === 'cards' ? 'active' : ''}`}
            onClick={() => setView('cards')}
            role="tab"
            aria-selected={view === 'cards'}
          >
            <IconBarChart width={13} height={13} /> {t(lang, 'outputs.kpiViewCards')}
          </button>
          <button
            className={`kpi-view-btn ${view === 'table' ? 'active' : ''}`}
            onClick={() => setView('table')}
            role="tab"
            aria-selected={view === 'table'}
          >
            <IconClipboard width={13} height={13} /> {t(lang, 'outputs.kpiViewTable')}
          </button>
        </div>
      </div>

      {view === 'cards' ? (
        <div className="kpi-grid">
          {kpis.map((kpi, idx) => {
            const color = KPI_PALETTE[idx % KPI_PALETTE.length]
            return (
              <div key={idx} className={`kpi-tile ${idx === 0 ? 'kpi-tile-primary' : ''}`} style={{ '--kpi-color': color }}>
                {idx === 0 && <span className="kpi-tile-badge"><IconTarget width={11} height={11} /> {t(lang, 'outputs.kpiPrimaryBadge')}</span>}
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
                {kpi.timeframe && <div className="kpi-timeframe">{kpi.timeframe}</div>}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="kpi-table-wrap">
          <table className="kpi-table">
            <thead>
              <tr>
                <th>{t(lang, 'outputs.kpiTableName')}</th>
                <th>{t(lang, 'outputs.kpiTableTarget')}</th>
                <th>{t(lang, 'outputs.kpiTableFormula')}</th>
                <th>{t(lang, 'outputs.kpiTableFrequency')}</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((kpi, idx) => {
                const color = KPI_PALETTE[idx % KPI_PALETTE.length]
                return (
                  <tr key={idx} className={idx === 0 ? 'kpi-table-primary' : ''} style={{ '--kpi-color': color }}>
                    <td className="kpi-table-name">
                      <span className="kpi-table-dot" />
                      {kpi.name}
                    </td>
                    <td>
                      <input
                        className="kpi-table-input"
                        type="number"
                        value={kpi.target ?? ''}
                        placeholder="—"
                        onChange={e => updateTarget(idx, e.target.value)}
                      />
                      <span className="kpi-unit">{kpi.unit}</span>
                    </td>
                    <td className="kpi-table-formula">{kpi.formula}</td>
                    <td>{kpi.timeframe && <span className="kpi-timeframe">{kpi.timeframe}</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
