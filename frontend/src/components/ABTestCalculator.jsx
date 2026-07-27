import { useState } from 'react'
import { sampleSizePerVariant, estimatedDurationDays } from '../lib/abTestCalculator'
import { t } from '../lib/i18n'

export default function ABTestCalculator({ lang }) {
  const [open, setOpen] = useState(false)
  const [baseline, setBaseline] = useState(3)
  const [mde, setMde] = useState(20)
  const [dailyVisitors, setDailyVisitors] = useState(200)

  const perVariant = sampleSizePerVariant(baseline / 100, mde / 100)
  const days = estimatedDurationDays(perVariant, dailyVisitors)

  return (
    <div className="ab-test-calc">
      <button className="ab-toggle" onClick={() => setOpen(o => !o)}>
        {open ? '▾' : '▸'} {t(lang, 'outputs.abTest')}
      </button>

      {open && (
        <div className="ab-body">
          <label>
            {t(lang, 'outputs.abBaseline')}
            <input type="number" min="0.1" step="0.1" value={baseline} onChange={e => setBaseline(Number(e.target.value))} />
          </label>
          <label>
            {t(lang, 'outputs.abMde')}
            <input type="number" min="1" step="1" value={mde} onChange={e => setMde(Number(e.target.value))} />
          </label>
          <label>
            {t(lang, 'outputs.abVisitors')}
            <input type="number" min="1" step="10" value={dailyVisitors} onChange={e => setDailyVisitors(Number(e.target.value))} />
          </label>

          <div className="ab-result">
            <div>{t(lang, 'outputs.abSampleSize')}: <strong>{Number.isFinite(perVariant) ? perVariant.toLocaleString() : '—'}</strong> / {t(lang, 'outputs.abVariant')}</div>
            {days != null && <div>{t(lang, 'outputs.abDuration')}: <strong>{days}</strong> {t(lang, 'outputs.days')}</div>}
          </div>
        </div>
      )}
    </div>
  )
}
