// Sample size per variant for a two-proportion z-test (95% confidence, 80% power)
const Z_ALPHA = 1.96
const Z_BETA = 0.84

export function sampleSizePerVariant(baselineRate, minimumDetectableEffect) {
  const p1 = baselineRate
  const p2 = baselineRate * (1 + minimumDetectableEffect)
  const pBar = (p1 + p2) / 2
  const numerator = Math.pow(Z_ALPHA * Math.sqrt(2 * pBar * (1 - pBar)) + Z_BETA * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2)
  const denominator = Math.pow(p2 - p1, 2)
  if (denominator === 0) return Infinity
  return Math.ceil(numerator / denominator)
}

export function estimatedDurationDays(sampleSizePerVariant, dailyVisitorsPerVariant) {
  if (!dailyVisitorsPerVariant) return null
  return Math.ceil((sampleSizePerVariant * 2) / dailyVisitorsPerVariant)
}
