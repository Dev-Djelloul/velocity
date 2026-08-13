import { useState } from 'react'
import { t } from '../lib/i18n'
import { IconTrendingUp, IconPlus, IconChevronUp, IconChevronDown } from './Icons'
import '../styles/PostLaunchTracking.css'

const CHART_W = 640
const CHART_H = 200
const PAD = { top: 16, right: 16, bottom: 24, left: 40 }
const DAY_MS = 86400000

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function scales(minX, maxX, maxY) {
  const w = CHART_W - PAD.left - PAD.right
  const h = CHART_H - PAD.top - PAD.bottom
  const spanX = Math.max(1, maxX - minX)
  return {
    x: (v) => PAD.left + ((v - minX) / spanX) * w,
    y: (v) => PAD.top + h - (maxY === 0 ? 0 : (v / maxY) * h)
  }
}

function linePath(points, sc) {
  if (!points.length) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sc.x(p.t).toFixed(1)} ${sc.y(p.v).toFixed(1)}`).join(' ')
}

function areaPath(points, sc) {
  if (!points.length) return ''
  const baseline = sc.y(0)
  const first = sc.x(points[0].t)
  const last = sc.x(points[points.length - 1].t)
  return `${linePath(points, sc)} L ${last.toFixed(1)} ${baseline.toFixed(1)} L ${first.toFixed(1)} ${baseline.toFixed(1)} Z`
}

// Régression linéaire (moindres carrés) sur (jours depuis lancement, valeur) — sert à la
// fois pour la tendance hebdo affichée et pour projeter la date d'atteinte de l'objectif.
function linearRegression(points) {
  const n = points.length
  if (n < 2) return null
  const sumX = points.reduce((s, p) => s + p.x, 0)
  const sumY = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumXX = points.reduce((s, p) => s + p.x * p.x, 0)
  const denom = n * sumXX - sumX * sumX
  if (denom === 0) return null
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

function formatShortDate(ms, lang) {
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  return new Date(ms).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PostLaunchTracking({ plan, lang, onMetricsChange, onLaunchDateChange }) {
  const kpis = plan.kpis || []
  const allHistory = plan.metricsHistory || []
  const launchDate = plan.launchDate || plan.generatedAt || todayStr()
  const launchDateStr = launchDate.split('T')[0]

  const [selectedKpi, setSelectedKpi] = useState(0)
  const [date, setDate] = useState(todayStr())
  const [actualValue, setActualValue] = useState('')
  const [note, setNote] = useState('')
  const [isEditingLaunchDate, setIsEditingLaunchDate] = useState(false)
  const [tempLaunchDate, setTempLaunchDate] = useState(launchDateStr)

  if (!kpis.length) return null
  const kpi = kpis[selectedKpi] || kpis[0]

  // Entrées historiques sans kpiIndex (anciennes données) considérées comme le KPI principal.
  const historyFor = (idx) => allHistory
    .filter(h => (h.kpiIndex ?? 0) === idx)
    .sort((a, b) => a.date.localeCompare(b.date))

  const history = historyFor(selectedKpi)

  const saveLaunchDate = () => {
    if (tempLaunchDate && onLaunchDateChange) onLaunchDateChange(tempLaunchDate)
    setIsEditingLaunchDate(false)
  }

  const addSnapshot = () => {
    if (actualValue === '') return
    const entry = { date, value: Number(actualValue), kpiIndex: selectedKpi }
    if (note.trim()) entry.note = note.trim()
    onMetricsChange([...allHistory, entry])
    setActualValue('')
    setNote('')
  }

  const removeSnapshot = (entry) => {
    onMetricsChange(allHistory.filter(h => h !== entry))
  }

  const target = kpi.target ?? null
  const times = history.map(h => new Date(h.date).getTime())
  const minT = times.length ? Math.min(...times) : new Date(launchDateStr).getTime()
  const maxT = times.length ? Math.max(...times, Date.now()) : Date.now()
  const maxY = Math.max(target || 0, ...history.map(h => h.value), 1)

  const sc = scales(minT, maxT, maxY)
  const actualPoints = history.map(h => ({ t: new Date(h.date).getTime(), v: h.value }))
  const actualLine = linePath(actualPoints, sc)
  const actualArea = areaPath(actualPoints, sc)
  const targetLine = target != null ? linePath([{ t: minT, v: target }, { t: maxT, v: target }], sc) : ''

  const latest = history[history.length - 1]
  const onTrack = latest && target != null ? latest.value >= target * 0.8 : null

  // Tendance + projection, calculées sur les jours écoulés depuis le lancement pour rester
  // cohérentes même si les mesures ne sont pas régulièrement espacées.
  const launchMs = new Date(launchDateStr).getTime()
  const regressionPoints = history.map(h => ({ x: (new Date(h.date).getTime() - launchMs) / DAY_MS, y: h.value }))
  const regression = linearRegression(regressionPoints)
  const weeklyTrend = regression ? regression.slope * 7 : null

  let projectionLabel
  let projectionState = 'neutral'
  if (target == null) {
    projectionLabel = t(lang, 'tracking.projectionNoTarget')
  } else if (latest && latest.value >= target) {
    projectionLabel = t(lang, 'tracking.projectionReached')
    projectionState = 'reached'
  } else if (regression && regression.slope > 0) {
    const daysToTarget = (target - regression.intercept) / regression.slope
    if (Number.isFinite(daysToTarget) && daysToTarget >= 0) {
      projectionLabel = t(lang, 'tracking.projectionOn')(formatShortDate(launchMs + daysToTarget * DAY_MS, lang))
      projectionState = 'ontrack'
    } else {
      projectionLabel = t(lang, 'tracking.projectionNone')
      projectionState = 'atrisk'
    }
  } else if (history.length >= 2) {
    projectionLabel = t(lang, 'tracking.projectionNone')
    projectionState = 'atrisk'
  } else {
    projectionLabel = t(lang, 'tracking.needMorePoints')
  }

  const daysSinceLaunch = Math.max(0, Math.floor((Date.now() - launchMs) / DAY_MS))
  const pctOfTarget = target && latest ? Math.round((latest.value / target) * 100) : null

  return (
    <div className="tracking-card card">
      <div className="tracking-header">
        <div className="tracking-header-title">
          <h3><IconTrendingUp width={16} height={16} /> {t(lang, 'tracking.title')}</h3>
          <p className="tracking-subtitle">{t(lang, 'tracking.subtitle')(kpi.name)}</p>
        </div>
        <div className="tracking-launch-date">
          {isEditingLaunchDate ? (
            <div className="tracking-launch-date-edit">
              <input
                type="date"
                value={tempLaunchDate}
                onChange={e => setTempLaunchDate(e.target.value)}
                max={todayStr()}
              />
              <button className="btn-sm" onClick={saveLaunchDate}>✓</button>
              <button className="btn-sm" onClick={() => setIsEditingLaunchDate(false)}>✕</button>
            </div>
          ) : (
            <div className="tracking-launch-date-display">
              <span className="tracking-launch-label">{t(lang, 'tracking.launchLabel')}</span>
              <span className="tracking-launch-value">{launchDateStr}</span>
              <button className="btn-sm" onClick={() => setIsEditingLaunchDate(true)} title={t(lang, 'tracking.editLaunchDate')}>✎</button>
            </div>
          )}
        </div>
      </div>

      {kpis.length > 1 && (
        <div className="tracking-kpi-tabs">
          {kpis.map((k, idx) => {
            const h = historyFor(idx)
            const lastVal = h[h.length - 1]?.value
            const pct = k.target && lastVal != null ? Math.round((lastVal / k.target) * 100) : null
            return (
              <button
                key={idx}
                className={`tracking-kpi-tab ${idx === selectedKpi ? 'active' : ''}`}
                onClick={() => setSelectedKpi(idx)}
              >
                <span className="tracking-kpi-tab-name">{k.name}</span>
                <span className="tracking-kpi-tab-pct">{pct != null ? `${pct}%` : (h.length ? h[h.length - 1].value : '—')}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="tracking-scorecard">
        <div className="tracking-stat">
          <span className="tracking-stat-label">{t(lang, 'tracking.currentValue')}</span>
          <span className="tracking-stat-value">{latest ? `${latest.value} ${kpi.unit}` : t(lang, 'tracking.noHistoryYet')}</span>
          {pctOfTarget != null && <span className="tracking-stat-sub">{t(lang, 'tracking.ofTargetPct')(pctOfTarget)}</span>}
        </div>
        <div className="tracking-stat">
          <span className="tracking-stat-label">{t(lang, 'tracking.trend')}</span>
          <span className={`tracking-stat-value ${weeklyTrend > 0 ? 'positive' : weeklyTrend < 0 ? 'negative' : ''}`}>
            {weeklyTrend != null ? `${weeklyTrend >= 0 ? '+' : ''}${weeklyTrend.toFixed(1)}` : '—'}
          </span>
          <span className="tracking-stat-sub">{t(lang, 'tracking.perWeek')}</span>
        </div>
        <div className="tracking-stat">
          <span className="tracking-stat-label">{t(lang, 'tracking.projection')}</span>
          <span className={`tracking-stat-value tracking-stat-value-text tracking-projection-${projectionState}`}>{projectionLabel}</span>
        </div>
        <div className="tracking-stat">
          <span className="tracking-stat-label">{t(lang, 'tracking.daysSinceLaunch')}</span>
          <span className="tracking-stat-value">{daysSinceLaunch}</span>
        </div>
      </div>

      <div className="tracking-form">
        <input type="date" className="tracking-date-input" value={date} onChange={e => setDate(e.target.value)} min={launchDateStr} max={todayStr()} />
        <div className="tracking-number-stepper">
          <input
            type="number"
            placeholder={`${t(lang, 'tracking.actualValue')} (${kpi.unit})`}
            value={actualValue}
            onChange={e => setActualValue(e.target.value)}
          />
          <div className="tracking-stepper-arrows">
            <button type="button" onClick={() => setActualValue(String((Number(actualValue) || 0) + 1))} title="+1">
              <IconChevronUp width={11} height={11} />
            </button>
            <button type="button" onClick={() => setActualValue(String((Number(actualValue) || 0) - 1))} title="-1">
              <IconChevronDown width={11} height={11} />
            </button>
          </div>
        </div>
        <input
          type="text"
          className="tracking-note-input"
          placeholder={t(lang, 'tracking.notePh')}
          value={note}
          onChange={e => setNote(e.target.value)}
        />
        <button className="btn-primary" onClick={addSnapshot}>
          <IconPlus width={14} height={14} /> {t(lang, 'tracking.addSnapshot')}
        </button>
      </div>

      {history.length > 0 ? (
        <>
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="tracking-svg" preserveAspectRatio="xMidYMid meet">
            {[0.25, 0.5, 0.75].map(f => (
              <line key={f} x1={PAD.left} x2={CHART_W - PAD.right} y1={sc.y(maxY * f)} y2={sc.y(maxY * f)} className="tracking-gridline" />
            ))}
            <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={CHART_H - PAD.bottom} className="tracking-axis" />
            <line x1={PAD.left} y1={CHART_H - PAD.bottom} x2={CHART_W - PAD.right} y2={CHART_H - PAD.bottom} className="tracking-axis" />
            <text x={PAD.left - 8} y={PAD.top + 4} textAnchor="end" className="tracking-axis-label">{maxY}</text>
            <text x={PAD.left - 8} y={CHART_H - PAD.bottom} textAnchor="end" className="tracking-axis-label">0</text>
            {actualArea && <path d={actualArea} className="tracking-area-actual" stroke="none" />}
            {targetLine && <path d={targetLine} className="tracking-line-target" fill="none" />}
            <path d={actualLine} className="tracking-line-actual" fill="none" />
            {history.map((h, i) => (
              <circle key={i} cx={sc.x(new Date(h.date).getTime())} cy={sc.y(h.value)} r="3.5" className={`tracking-dot ${h.note ? 'has-note' : ''}`}>
                <title>{`${h.date} — ${h.value} ${kpi.unit}${h.note ? ` — ${h.note}` : ''}`}</title>
              </circle>
            ))}
          </svg>

          <div className="tracking-legend">
            {targetLine && <span className="tracking-legend-item"><i className="tracking-swatch target" /> {t(lang, 'tracking.target')}</span>}
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
                <span>{h.value} {kpi.unit}</span>
                {h.note && <span className="tracking-history-note">{h.note}</span>}
                <button onClick={() => removeSnapshot(h)}>×</button>
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
