import { useState } from 'react'
import { t } from '../lib/i18n'
import { generateBenchmarks } from '../lib/serverStorage'
import { generateBenchmarksFallback } from '../lib/benchmarksFallback'
import { IconGauge, IconSparkle, IconRocket } from './Icons'
import '../styles/BenchmarksCard.css'

const CHANNEL_PALETTE = ['#9184d9', '#06b6d4', '#4ade80', '#fb923c', '#f472b6', '#eab308']

export default function BenchmarksCard({ plan, lang, onBenchmarksChange }) {
  const [loading, setLoading] = useState(false)
  const benchmarks = plan.benchmarks

  const generate = async () => {
    if (loading) return
    setLoading(true)
    try {
      const result = await generateBenchmarks(plan, lang)
      onBenchmarksChange(result || generateBenchmarksFallback(plan, lang))
    } catch {
      onBenchmarksChange(generateBenchmarksFallback(plan, lang))
    } finally {
      setLoading(false)
    }
  }

  const verdictLabel = (v) => t(lang, `benchmarks.verdict.${v}`) || v

  return (
    <div className="benchmarks-card card">
      <div className="benchmarks-header">
        <div>
          <h3><IconGauge width={18} height={18} /> {t(lang, 'benchmarks.title')}</h3>
          <p className="benchmarks-subtitle">{t(lang, 'benchmarks.subtitle')}</p>
        </div>
        <button className="btn-primary benchmarks-generate-btn" onClick={generate} disabled={loading}>
          <IconSparkle width={14} height={14} />
          {loading ? t(lang, 'benchmarks.generating') : benchmarks ? t(lang, 'benchmarks.regenerate') : t(lang, 'benchmarks.generate')}
        </button>
      </div>

      {!benchmarks && !loading && (
        <p className="benchmarks-empty">{t(lang, 'benchmarks.empty')}</p>
      )}

      {benchmarks && (
        <div className="benchmarks-body">
          <div className="benchmarks-table-scroll">
            <table className="benchmarks-table">
              <thead>
                <tr>
                  <th>{t(lang, 'benchmarks.metric')}</th>
                  <th>{t(lang, 'benchmarks.industry')}</th>
                  <th>{t(lang, 'benchmarks.yours')}</th>
                  <th>{t(lang, 'benchmarks.verdictLabel')}</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.metrics?.map((row, i) => (
                  <tr key={i} className={`benchmark-row verdict-row-${row.verdict}`}>
                    <td>{row.metric}</td>
                    <td>{row.industry}</td>
                    <td>{row.yours}</td>
                    <td><span className={`benchmark-verdict verdict-${row.verdict}`}>{verdictLabel(row.verdict)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="benchmarks-channels">
            <h4><IconRocket width={15} height={15} /> {t(lang, 'benchmarks.channels')}</h4>
            <div className="benchmarks-channel-list">
              {benchmarks.channels?.map((c, i) => (
                <div key={i} className="benchmarks-channel" style={{ '--channel-color': CHANNEL_PALETTE[i % CHANNEL_PALETTE.length] }}>
                  <div className="benchmarks-channel-head">
                    <span className="benchmarks-channel-name">{c.channel}</span>
                    <span className="benchmarks-channel-value">{c.benchmark}</span>
                  </div>
                  <div className="benchmarks-channel-note">{c.note}</div>
                </div>
              ))}
            </div>
          </div>

          {benchmarks.takeaway && (
            <p className="benchmarks-takeaway"><IconSparkle width={14} height={14} /> {benchmarks.takeaway}</p>
          )}

          {benchmarks.source && (
            <p className="benchmarks-origin">{benchmarks.source === 'ai' ? t(lang, 'benchmarks.byAi') : t(lang, 'benchmarks.byRules')}</p>
          )}
        </div>
      )}
    </div>
  )
}
