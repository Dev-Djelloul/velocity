export default function GaugeProgress({ label, value, max = 100, unit = '' }) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="gauge">
      <div className="gauge-header">
        <span className="gauge-title">{label}</span>
        <span className="gauge-value">
          {value}{unit && ` ${unit}`}
        </span>
      </div>
      <div className="gauge-bar">
        <div className="gauge-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
