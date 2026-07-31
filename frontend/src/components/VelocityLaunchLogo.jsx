export default function VelocityLaunchLogo({ width = 40, height = 40, animated = false, variant = 'gradient' }) {
  const isMono = variant === 'mono'
  const strokeLeft = isMono ? '#e9e9ed' : '#9184d9'
  const strokeRight = isMono ? '#e9e9ed' : '#6366f1'
  const strokeSpine = isMono ? '#e9e9ed' : '#06b6d4'
  const fillTip = isMono ? '#e9e9ed' : '#06b6d4'

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {animated && (
        <defs>
          <style>{`
            @keyframes vl-tip-glow {
              0%, 100% { opacity: 0.7; }
              50% { opacity: 1; }
            }
            .vl-tip {
              animation: vl-tip-glow 2.4s ease-in-out infinite;
              transform-origin: 100px 62px;
            }
          `}</style>
        </defs>
      )}

      <path d="M 70 60 L 100 130" stroke={strokeLeft} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M 130 60 L 100 130" stroke={strokeRight} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M 100 130 L 100 70" stroke={strokeSpine} strokeWidth="3" fill="none" strokeLinecap="round" />
      <polygon
        className={animated ? 'vl-tip' : ''}
        points="100,55 95,68 105,68"
        fill={fillTip}
      />

      <circle cx="100" cy="100" r="85" fill="none" stroke={isMono ? 'rgba(233,233,237,0.12)' : 'rgba(6, 182, 212, 0.1)'} strokeWidth="1" />
    </svg>
  )
}
