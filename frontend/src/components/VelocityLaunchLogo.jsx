export default function VelocityLaunchLogo({ width = 40, height = 40, animated = true }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      {animated && (
        <defs>
          <style>{`
            @keyframes rocketLaunch {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
              100% { transform: translateY(0px); }
            }
            @keyframes particleShine {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; }
            }
            .rocket-animate {
              animation: rocketLaunch 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
              transform-origin: center;
            }
            .particle-1 {
              animation: particleShine 1.5s ease-in-out infinite;
            }
            .particle-2 {
              animation: particleShine 1.5s ease-in-out infinite 0.2s;
            }
            .particle-3 {
              animation: particleShine 1.5s ease-in-out infinite 0.4s;
            }
          `}</style>
          <linearGradient id="rocketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#4c3a94" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      )}

      {/* Main rocket body */}
      <g className={animated ? 'rocket-animate' : ''}>
        {/* Nose cone */}
        <path
          d="M 50 12 L 56 26 L 44 26 Z"
          fill="url(#accentGradient)"
          stroke="white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Main body */}
        <rect
          x="44"
          y="26"
          width="12"
          height="28"
          rx="1.5"
          fill="url(#rocketGradient)"
          stroke="white"
          strokeWidth="1.5"
        />

        {/* Window */}
        <circle
          cx="50"
          cy="32"
          r="2.5"
          fill="white"
          opacity="0.7"
        />

        {/* Left stabilizer */}
        <path
          d="M 44 48 L 36 60 L 42 56 Z"
          fill="#8b5cf6"
          opacity="0.9"
        />

        {/* Right stabilizer */}
        <path
          d="M 56 48 L 64 60 L 58 56 Z"
          fill="#ec4899"
          opacity="0.9"
        />
      </g>

      {/* Speed lines - left */}
      <g opacity="0.6">
        <line x1="36" y1="38" x2="24" y2="36" stroke="url(#rocketGradient)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="34" y1="45" x2="20" y2="44" stroke="url(#rocketGradient)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* Speed lines - right */}
      <g opacity="0.6">
        <line x1="64" y1="38" x2="76" y2="36" stroke="url(#accentGradient)" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="66" y1="45" x2="80" y2="44" stroke="url(#accentGradient)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      </g>

      {/* Launch particles */}
      {animated && (
        <g>
          <circle cx="48" cy="62" r="1.2" fill="#ec4899" className="particle-1" />
          <circle cx="50" cy="66" r="1" fill="#8b5cf6" className="particle-2" />
          <circle cx="52" cy="62" r="1.2" fill="#ec4899" className="particle-3" />
        </g>
      )}

      {/* Glow background circle */}
      <circle
        cx="50"
        cy="50"
        r="48"
        fill="none"
        stroke="url(#rocketGradient)"
        strokeWidth="0.8"
        opacity="0.15"
      />
    </svg>
  )
}
