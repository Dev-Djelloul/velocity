import { useState } from 'react'
import { sampleSizePerVariant, estimatedDurationDays } from '../lib/abTestCalculator'
import { t } from '../lib/i18n'
import { IconGauge, IconUser, IconClock } from './Icons'
import '../styles/ABTestCalculatorCard.css'

export default function ABTestCalculatorCard({ lang }) {
  const [baseline, setBaseline] = useState(3)
  const [mde, setMde] = useState(20)
  const [dailyVisitors, setDailyVisitors] = useState(200)

  const perVariant = sampleSizePerVariant(baseline / 100, mde / 100)
  const days = estimatedDurationDays(perVariant, dailyVisitors)

  return (
    <div className="abtest-card card">
      <div className="abtest-header">
        <h3><IconGauge width={18} height={18} /> {t(lang, 'outputs.abTest')}</h3>
        <p className="abtest-subtitle">{t(lang, 'outputs.abSubtitle')}</p>
      </div>

      <div className="abtest-body">
        <div className="abtest-inputs">
          <label className="abtest-field">
            <span className="abtest-field-label">{t(lang, 'outputs.abBaseline')}</span>
            <input type="number" min="0.1" step="0.1" value={baseline} onChange={e => setBaseline(Number(e.target.value))} />
            <span className="abtest-field-hint">{t(lang, 'outputs.abBaselineHint')}</span>
          </label>
          <label className="abtest-field">
            <span className="abtest-field-label">{t(lang, 'outputs.abMde')}</span>
            <input type="number" min="1" step="1" value={mde} onChange={e => setMde(Number(e.target.value))} />
            <span className="abtest-field-hint">{t(lang, 'outputs.abMdeHint')}</span>
          </label>
          <label className="abtest-field">
            <span className="abtest-field-label">{t(lang, 'outputs.abVisitors')}</span>
            <input type="number" min="1" step="10" value={dailyVisitors} onChange={e => setDailyVisitors(Number(e.target.value))} />
            <span className="abtest-field-hint">{t(lang, 'outputs.abVisitorsHint')}</span>
          </label>
        </div>

        <div className="abtest-result">
          <p className="abtest-result-caption">{t(lang, 'outputs.abResultCaption')}</p>
          <div className="abtest-result-stats">
            <div className="abtest-stat">
              <span className="abtest-stat-icon"><IconUser width={16} height={16} /></span>
              <div>
                <div className="abtest-stat-value">{Number.isFinite(perVariant) ? perVariant.toLocaleString() : '—'}</div>
                <div className="abtest-stat-label">{t(lang, 'outputs.abSampleSize')} / {t(lang, 'outputs.abVariant')}</div>
              </div>
            </div>
            <div className="abtest-stat">
              <span className="abtest-stat-icon"><IconClock width={16} height={16} /></span>
              <div>
                <div className="abtest-stat-value">{days != null ? days : '—'} {days != null && t(lang, 'outputs.days')}</div>
                <div className="abtest-stat-label">{t(lang, 'outputs.abDuration')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
