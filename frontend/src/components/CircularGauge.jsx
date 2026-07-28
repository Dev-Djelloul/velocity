export default function CircularGauge({ value, max = 100, label, unit = '' }) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const percentage = Math.min((value / max) * 100, 100)
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="progress-circle">
      <svg className="progress-circle-svg" width="120" height="120" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(16, 185, 129, 0.1)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(16, 185, 129)" />
            <stop offset="100%" stopColor="rgb(110, 231, 183)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="progress-circle-text">
        <div className="progress-circle-value">
          {Math.round(percentage)}%
        </div>
        <div className="progress-circle-label">{label}</div>
      </div>
    </div>
  )
}
