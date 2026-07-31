import VelocityLaunchLogo from './VelocityLaunchLogo'

export default function Wordmark({ size = 34, animated = false, variant = 'gradient', className = '' }) {
  return (
    <span className={`brand-lockup ${className}`}>
      <VelocityLaunchLogo width={size} height={size} animated={animated} variant={variant} />
      <span className="wordmark">
        <span className="wordmark-elocity">elocity</span><span className="wordmark-launch">Launch</span>
      </span>
    </span>
  )
}
