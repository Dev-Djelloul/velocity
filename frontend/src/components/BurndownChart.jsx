import { useState } from 'react'
import { t } from '../lib/i18n'
import { IconTrendingUp } from './Icons'
import '../styles/BurndownChart.css'

const SPRINT_DAYS = 14
const CHART_W = 640
const CHART_H = 240
const PAD = { top: 28, right: 20, bottom: 34, left: 42 }

function sprintDates(generatedAt, sprintId) {
  const start = new Date(generatedAt || Date.now())
  start.setDate(start.getDate() + (sprintId - 1) * SPRINT_DAYS)
  const end = new Date(start)
  end.setDate(end.getDate() + SPRINT_DAYS)
  return { start, end }
}

function formatShort(date, lang) {
  const locale = lang === 'en' ? 'en-US' : 'fr-FR'
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
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

  const doneEffortAsOf = (cursor) => allStories
    .filter(s => s.status === 'done' && s.completedAt && new Date(s.completedAt) <= cursor)
    .reduce((sum, s) => sum + s.effort, 0)

  const now = new Date()
  const daysElapsed = Math.max(0, Math.min(totalDays, (now - start) / 86400000))
  const wholeDaysElapsed = Math.min(totalDays, Math.floor(daysElapsed))

  // Ancre toujours la courbe "réel" au même point de départ que l'idéal (jour 0,
  // effort total restant) : un sprint tout juste démarré n'a sinon qu'un seul point
  // possible (aujourd'hui) et aucune ligne ne peut être tracée, ce qui rendait le
  // graphique figé quel que soit le nombre de stories cochées.
  const actual = [{ day: 0, value: totalEffort }]
  for (let day = 1; day <= wholeDaysElapsed; day++) {
    const cursor = new Date(start)
    cursor.setDate(cursor.getDate() + day)
    actual.push({ day, value: Math.max(0, totalEffort - doneEffortAsOf(cursor)) })
  }
  // Point "maintenant" en position fractionnaire (pas seulement en jours entiers) :
  // reflète l'état courant en plein milieu d'une journée, pour que cocher une story
  // fasse bouger la ligne visiblement, même sans attendre le lendemain.
  if (daysElapsed > wholeDaysElapsed || wholeDaysElapsed === 0) {
    actual.push({ day: daysElapsed, value: Math.max(0, totalEffort - doneEffortAsOf(now)) })
  }

  return { totalDays, totalEffort, ideal, actual, start, daysElapsed }
}

function scales(totalDays, maxEffort) {
  const w = CHART_W - PAD.left - PAD.right
  const h = CHART_H - PAD.top - PAD.bottom
  return {
    x: (day) => PAD.left + (day / totalDays) * w,
    y: (value) => PAD.top + h - (maxEffort === 0 ? 0 : (value / maxEffort) * h)
  }
}

function linePath(points, sc) {
  if (!points.length) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sc.x(p.day).toFixed(1)} ${sc.y(p.value).toFixed(1)}`).join(' ')
}

function areaPath(points, sc) {
  if (!points.length) return ''
  const baseline = sc.y(0)
  const first = sc.x(points[0].day)
  const last = sc.x(points[points.length - 1].day)
  return `${linePath(points, sc)} L ${last.toFixed(1)} ${baseline.toFixed(1)} L ${first.toFixed(1)} ${baseline.toFixed(1)} Z`
}

export default function BurndownChart({ roadmap, lang, generatedAt }) {
  const [scope, setScope] = useState('all')
  if (!roadmap?.sprints?.length) return null

  const { sprints } = roadmap
  const series = buildSeries(sprints, generatedAt, scope)
  if (!series) return null

  const { totalDays, totalEffort, ideal, actual, start, daysElapsed } = series
  const maxEffort = Math.max(totalEffort, ideal[0]?.value || 0, 1)
  const sc = scales(totalDays, maxEffort)
  const idealPath = linePath(ideal, sc)
  const actualPath = linePath(actual, sc)
  const actualArea = areaPath(actual, sc)

  const lastActual = actual[actual.length - 1]
  const currentRemaining = lastActual.value
  const idealNow = Math.max(0, totalEffort - (totalEffort / totalDays) * lastActual.day)
  const gap = Math.round(idealNow - currentRemaining)
  const onTrack = gap >= 0
  const daysLeft = Math.max(0, Math.ceil(totalDays - lastActual.day))

  // Repères de dates sur l'axe X (5 max, jamais d'abstraction "jour N" seul).
  const tickCount = Math.min(5, totalDays + 1)
  const tickDays = Array.from({ length: tickCount }, (_, i) => Math.round((totalDays * i) / Math.max(1, tickCount - 1)))
  const dateAt = (day) => new Date(start.getTime() + day * 86400000)

  // Marqueur "Aujourd'hui" : seulement si on est franchement entre le début et la fin
  // (sinon il se superpose aux badges Début/Fin, redondant).
  const showToday = daysElapsed > totalDays * 0.03 && daysElapsed < totalDays * 0.97

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

      <div className="burndown-stats">
        <div className="burndown-stat">
          <span className="burndown-stat-label">{t(lang, 'burndown.remaining')}</span>
          <span className="burndown-stat-value">{Math.round(currentRemaining)} pts</span>
        </div>
        <div className="burndown-stat">
          <span className="burndown-stat-label">{t(lang, 'burndown.gap')}</span>
          <span className={`burndown-stat-value ${gap >= 0 ? 'positive' : 'negative'}`}>
            {gap >= 0 ? t(lang, 'burndown.ahead')(gap) : t(lang, 'burndown.late')(-gap)}
          </span>
        </div>
        <div className="burndown-stat">
          <span className="burndown-stat-label">{t(lang, 'burndown.daysLeft')(daysLeft)}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="burndown-svg" preserveAspectRatio="xMidYMid meet">
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={PAD.left} x2={CHART_W - PAD.right} y1={sc.y(maxEffort * f)} y2={sc.y(maxEffort * f)} className="burndown-gridline" />
        ))}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={CHART_H - PAD.bottom} className="burndown-axis" />
        <line x1={PAD.left} y1={CHART_H - PAD.bottom} x2={CHART_W - PAD.right} y2={CHART_H - PAD.bottom} className="burndown-axis" />
        <text x={PAD.left - 8} y={PAD.top + 4} textAnchor="end" className="burndown-axis-label">{Math.round(maxEffort)}</text>
        <text x={PAD.left - 8} y={CHART_H - PAD.bottom} textAnchor="end" className="burndown-axis-label">0</text>

        {tickDays.map(day => (
          <text key={day} x={sc.x(day)} y={CHART_H - PAD.bottom + 16} textAnchor="middle" className="burndown-axis-label">
            {formatShort(dateAt(day), lang)}
          </text>
        ))}

        {showToday && (
          <>
            <line x1={sc.x(daysElapsed)} y1={PAD.top} x2={sc.x(daysElapsed)} y2={CHART_H - PAD.bottom} className="burndown-today-line" />
            <text x={sc.x(daysElapsed)} y={PAD.top - 10} textAnchor="middle" className="burndown-today-label">{t(lang, 'burndown.today')}</text>
          </>
        )}

        {actualArea && <path d={actualArea} className="burndown-area-actual" stroke="none" />}
        <path d={idealPath} className="burndown-line-ideal" fill="none" />
        <path d={actualPath} className="burndown-line-actual" fill="none" />

        {actual.map((p, i) => (
          <circle key={i} cx={sc.x(p.day)} cy={sc.y(p.value)} r="3" className="burndown-dot">
            <title>{`${formatShort(dateAt(p.day), lang)} — ${Math.round(p.value)} pts`}</title>
          </circle>
        ))}

        <g className="burndown-badge burndown-badge-start" transform={`translate(${sc.x(0)}, ${sc.y(ideal[0].value)})`}>
          <rect x="2" y="-11" width="46" height="18" rx="4" />
          <text x="25" y="2" textAnchor="middle">{t(lang, 'burndown.start')}</text>
        </g>
        <g className="burndown-badge burndown-badge-finish" transform={`translate(${sc.x(totalDays)}, ${sc.y(0)})`}>
          <rect x="-48" y="-11" width="46" height="18" rx="4" />
          <text x="-25" y="2" textAnchor="middle">{t(lang, 'burndown.finish')}</text>
        </g>
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
