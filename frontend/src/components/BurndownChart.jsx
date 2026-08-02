import { useState } from 'react'
import { t } from '../lib/i18n'
import { IconTrendingUp } from './Icons'
import '../styles/BurndownChart.css'

const SPRINT_DAYS = 14
const CHART_W = 640
const CHART_H = 220
const PAD = { top: 16, right: 16, bottom: 28, left: 36 }

function sprintDates(generatedAt, sprintId) {
  const start = new Date(generatedAt || Date.now())
  start.setDate(start.getDate() + (sprintId - 1) * SPRINT_DAYS)
  const end = new Date(start)
  end.setDate(end.getDate() + SPRINT_DAYS)
  return { start, end }
}

function buildSeries(sprints, generatedAt, scope) {
  const relevant = scope === 'all' ? sprints : sprints.filter(sp => sp.sprintId === scope)
  if (!relevant.length) return null

  const start = sprintDates(generatedAt, relevant[0].sprintId).start
  const end = sprintDates(generatedAt, relevant[relevant.length - 1].sprintId).end
  const totalDays = Math.max(1, Math.round((end - start) / 86400000))
  const totalEffort = relevant.reduce((sum, sp) => sum + sp.stories.reduce((s, x) => s + x.effort, 0), 0)

  const allStories = relevant.flatMap(sp => sp.stories)

  const ideal = Array.from({ length: totalDays + 1 }, (_, day) => ({
    day,
    value: Math.max(0, totalEffort - (totalEffort / totalDays) * day)
  }))

  const actual = Array.from({ length: totalDays + 1 }, (_, day) => {
    const cursor = new Date(start)
    cursor.setDate(cursor.getDate() + day)
    if (cursor > new Date()) return null
    const doneEffort = allStories
      .filter(s => s.status === 'done' && s.completedAt && new Date(s.completedAt) <= cursor)
      .reduce((sum, s) => sum + s.effort, 0)
    return { day, value: Math.max(0, totalEffort - doneEffort) }
  }).filter(Boolean)

  return { totalDays, totalEffort, ideal, actual, start }
}

function toPath(points, totalDays, maxEffort) {
  if (!points.length) return ''
  const w = CHART_W - PAD.left - PAD.right
  const h = CHART_H - PAD.top - PAD.bottom
  const x = (day) => PAD.left + (day / totalDays) * w
  const y = (value) => PAD.top + h - (maxEffort === 0 ? 0 : (value / maxEffort) * h)
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(p.day).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ')
}

export default function BurndownChart({ roadmap, lang, generatedAt }) {
  const [scope, setScope] = useState('all')
  if (!roadmap?.sprints?.length) return null

  const { sprints } = roadmap
  const series = buildSeries(sprints, generatedAt, scope)
  if (!series) return null

  const { totalDays, totalEffort, ideal, actual } = series
  const maxEffort = Math.max(totalEffort, 1)
  const idealPath = toPath(ideal, totalDays, maxEffort)
  const actualPath = toPath(actual, totalDays, maxEffort)
  const currentRemaining = actual.length ? actual[actual.length - 1].value : totalEffort
  const onTrack = currentRemaining <= (ideal.find(p => p.day === (actual.length - 1))?.value ?? totalEffort)

  return (
    <div className="burndown-card card">
      <div className="burndown-header">
        <h3><IconTrendingUp width={16} height={16} /> {t(lang, 'burndown.title')}</h3>
        <select value={scope} onChange={e => setScope(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
          <option value="all">{t(lang, 'burndown.allSprints')}</option>
          {sprints.map(sp => (
            <option key={sp.sprintId} value={sp.sprintId}>{t(lang, 'outputs.sprint')} {sp.sprintId}</option>
          ))}
        </select>
      </div>
      <p className="burndown-subtitle">{t(lang, 'burndown.subtitle')}</p>

      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="burndown-svg" preserveAspectRatio="xMidYMid meet">
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={CHART_H - PAD.bottom} className="burndown-axis" />
        <line x1={PAD.left} y1={CHART_H - PAD.bottom} x2={CHART_W - PAD.right} y2={CHART_H - PAD.bottom} className="burndown-axis" />
        <text x={PAD.left - 8} y={PAD.top + 4} textAnchor="end" className="burndown-axis-label">{maxEffort}</text>
        <text x={PAD.left - 8} y={CHART_H - PAD.bottom} textAnchor="end" className="burndown-axis-label">0</text>
        <path d={idealPath} className="burndown-line-ideal" fill="none" />
        <path d={actualPath} className="burndown-line-actual" fill="none" />
      </svg>

      <div className="burndown-legend">
        <span className="burndown-legend-item"><i className="burndown-swatch ideal" /> {t(lang, 'burndown.ideal')}</span>
        <span className="burndown-legend-item"><i className="burndown-swatch actual" /> {t(lang, 'burndown.actual')}</span>
        <span className={`burndown-status ${onTrack ? 'on-track' : 'behind'}`}>
          {onTrack ? t(lang, 'burndown.onTrack') : t(lang, 'burndown.behind')}
        </span>
      </div>
    </div>
  )
}
