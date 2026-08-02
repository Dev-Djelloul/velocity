import { useState } from 'react'
import { t } from '../lib/i18n'
import { IconTrendingUp, IconPlus } from './Icons'
import '../styles/PostLaunchTracking.css'

const CHART_W = 640
const CHART_H = 200
const PAD = { top: 16, right: 16, bottom: 24, left: 40 }

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function buildPath(points, minX, maxX, maxY) {
  if (!points.length) return ''
  const w = CHART_W - PAD.left - PAD.right
  const h = CHART_H - PAD.top - PAD.bottom
  const spanX = Math.max(1, maxX - minX)
  const x = (t) => PAD.left + ((t - minX) / spanX) * w
  const y = (v) => PAD.top + h - (maxY === 0 ? 0 : (v / maxY) * h)
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.t).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ')
}

export default function PostLaunchTracking({ plan, lang, onMetricsChange }) {
  const primaryKpi = plan.kpis?.[0]
  const history = plan.metricsHistory || []
  const [date, setDate] = useState(todayStr())
  const [actualValue, setActualValue] = useState('')

  if (!primaryKpi) return null

  const addSnapshot = () => {
    if (actualValue === '') return
    const next = [...history, { date, value: Number(actualValue) }].sort((a, b) => a.date.localeCompare(b.date))
    onMetricsChange(next)
    setActualValue('')
  }

  const removeSnapshot = (idx) => {
    onMetricsChange(history.filter((_, i) => i !== idx))
  }

  const target = primaryKpi.target || 0
  const times = history.map(h => new Date(h.date).getTime())
  const minT = times.length ? Math.min(...times) : Date.now()
  const maxT = times.length ? Math.max(...times, Date.now()) : Date.now()
  const maxY = Math.max(target, ...history.map(h => h.value), 1)

  const actualPath = buildPath(history.map(h => ({ t: new Date(h.date).getTime(), v: h.value })), minT, maxT, maxY)
  const targetPath = buildPath([{ t: minT, v: target }, { t: maxT, v: target }], minT, maxT, maxY)

  const latest = history[history.length - 1]
  const onTrack = latest ? latest.value >= target * 0.8 : null

  return (
    <div className="tracking-card card">
      <div className="tracking-header">
        <h3><IconTrendingUp width={16} height={16} /> {t(lang, 'tracking.title')}</h3>
        <p className="tracking-subtitle">{t(lang, 'tracking.subtitle')(primaryKpi.name)}</p>
      </div>

      <div className="tracking-form">
        <input type="date" value={date} onChange={e => setDate(e.target.value)} max={todayStr()} />
        <input
          type="number"
          placeholder={`${t(lang, 'tracking.actualValue')} (${primaryKpi.unit})`}
          value={actualValue}
          onChange={e => setActualValue(e.target.value)}
        />
        <button className="btn-primary" onClick={addSnapshot}>
          <IconPlus width={14} height={14} /> {t(lang, 'tracking.addSnapshot')}
        </button>
      </div>

      {history.length > 0 ? (
        <>
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="tracking-svg" preserveAspectRatio="xMidYMid meet">
            <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={CHART_H - PAD.bottom} className="tracking-axis" />
            <line x1={PAD.left} y1={CHART_H - PAD.bottom} x2={CHART_W - PAD.right} y2={CHART_H - PAD.bottom} className="tracking-axis" />
            <text x={PAD.left - 8} y={PAD.top + 4} textAnchor="end" className="tracking-axis-label">{maxY}</text>
            <text x={PAD.left - 8} y={CHART_H - PAD.bottom} textAnchor="end" className="tracking-axis-label">0</text>
            <path d={targetPath} className="tracking-line-target" fill="none" />
            <path d={actualPath} className="tracking-line-actual" fill="none" />
            {history.map((h, i) => {
              const w = CHART_W - PAD.left - PAD.right
              const hgt = CHART_H - PAD.top - PAD.bottom
              const spanX = Math.max(1, maxT - minT)
              const cx = PAD.left + ((new Date(h.date).getTime() - minT) / spanX) * w
              const cy = PAD.top + hgt - (maxY === 0 ? 0 : (h.value / maxY) * hgt)
              return <circle key={i} cx={cx} cy={cy} r="3.5" className="tracking-dot" />
            })}
          </svg>

          <div className="tracking-legend">
            <span className="tracking-legend-item"><i className="tracking-swatch target" /> {t(lang, 'tracking.target')}</span>
            <span className="tracking-legend-item"><i className="tracking-swatch actual" /> {t(lang, 'tracking.actual')}</span>
            {onTrack !== null && (
              <span className={`tracking-status ${onTrack ? 'on-track' : 'behind'}`}>
                {onTrack ? t(lang, 'tracking.onTrack') : t(lang, 'tracking.behind')}
              </span>
            )}
          </div>

          <div className="tracking-history">
            {history.slice().reverse().map((h, i) => (
              <div key={i} className="tracking-history-row">
                <span>{h.date}</span>
                <span>{h.value} {primaryKpi.unit}</span>
                <button onClick={() => removeSnapshot(history.length - 1 - i)}>×</button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="tracking-empty">{t(lang, 'tracking.empty')}</p>
      )}
    </div>
  )
}
