import { useState } from 'react'
import { t } from '../lib/i18n'
import { buildChartFromQuery } from '../lib/chartQuery'
import { IconBarChart, IconSparkle } from './Icons'
import '../styles/AskChart.css'

const SUGGESTIONS_KEY = 'askChart.suggestions'

export default function AskChart({ plan, lang }) {
  const [query, setQuery] = useState('')
  const [chart, setChart] = useState(null)
  const [tried, setTried] = useState(false)

  const suggestions = t(lang, SUGGESTIONS_KEY) || []

  const run = (q) => {
    const value = q ?? query
    setQuery(value)
    setTried(true)
    setChart(buildChartFromQuery(value, plan, lang))
  }

  const max = chart ? Math.max(...chart.bars.map(b => b.value), 1) : 1

  return (
    <div className="ask-chart card">
      <div className="ask-chart-header">
        <h3><IconSparkle width={16} height={16} /> {t(lang, 'askChart.title')}</h3>
        <p className="ask-chart-subtitle">{t(lang, 'askChart.subtitle')}</p>
      </div>

      <form className="ask-chart-form" onSubmit={e => { e.preventDefault(); run() }}>
        <input
          type="text"
          value={query}
          placeholder={t(lang, 'askChart.placeholder')}
          onChange={e => setQuery(e.target.value)}
        />
        <button type="submit" className="btn-primary">{t(lang, 'askChart.ask')}</button>
      </form>

      <div className="ask-chart-suggestions">
        {suggestions.map((s, i) => (
          <button key={i} type="button" className="chip" onClick={() => run(s)}>{s}</button>
        ))}
      </div>

      {tried && !chart && (
        <p className="ask-chart-empty">{t(lang, 'askChart.noData')}</p>
      )}

      {chart && (
        <div className="ask-chart-result">
          <div className="ask-chart-result-title"><IconBarChart width={14} height={14} /> {chart.title}</div>
          <div className="ask-chart-bars">
            {chart.bars.map((b, i) => (
              <div key={i} className="ask-chart-bar-row">
                <span className="ask-chart-bar-label">{b.label}</span>
                <div className="ask-chart-bar-track">
                  <div className="ask-chart-bar-fill" style={{ width: `${(b.value / max) * 100}%` }} />
                </div>
                <span className="ask-chart-bar-value">{b.value.toLocaleString()}{chart.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
