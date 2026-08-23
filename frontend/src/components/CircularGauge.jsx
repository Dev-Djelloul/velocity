import { useId } from 'react'

// Dégradés par "tone" — le vert par défaut (avancement neutre), + jaune/rouge pour les
// jauges qui portent un jugement (ex: rythme vs calendrier, en retard = rouge) plutôt
// qu'une simple mesure. Retour utilisateur : sans la couleur, "15% dans les temps" ne se
// distinguait pas visuellement d'un vrai retard.
const TONES = {
  good: { track: 'rgba(16, 185, 129, 0.1)', from: 'rgb(16, 185, 129)', to: 'rgb(110, 231, 183)' },
  warning: { track: 'rgba(250, 204, 21, 0.12)', from: 'rgb(217, 119, 6)', to: 'rgb(250, 204, 21)' },
  danger: { track: 'rgba(239, 68, 68, 0.12)', from: 'rgb(220, 38, 38)', to: 'rgb(248, 113, 113)' }
}

export default function CircularGauge({ value, max = 100, label, unit = '', tone = 'good' }) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const percentage = Math.min((value / max) * 100, 100)
  const offset = circumference - (percentage / 100) * circumference
  const gradientId = `gauge-gradient-${useId()}`
  const colors = TONES[tone] || TONES.good

  return (
    <div className="progress-circle-wrap">
      <div className="progress-circle">
        <svg className="progress-circle-svg" width="120" height="120" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={colors.track}
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
          />
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
          </defs>
        </svg>
        <div className="progress-circle-text">
          <div className="progress-circle-value">
            {Math.round(percentage)}%
          </div>
        </div>
      </div>
      {label && <div className="progress-circle-label">{label}</div>}
    </div>
  )
}
