// Source market — quality check + source management.
// ponytail: quality check is a pure function, testable without DB.

export interface QualityResult {
  avgScore: number
  snr: number
  passes: boolean
  reason: string
}

const QUALITY_THRESHOLD_AVG = 6.0
const QUALITY_THRESHOLD_SNR = 0.3

// Check if source items meet quality bar. Returns pass/fail + metrics.
// avgScore: mean of AI scores. snr: % items scoring >= 7.0 (signal-to-noise ratio).
export function qualityCheck(scores: number[]): QualityResult {
  if (scores.length === 0) {
    return { avgScore: 0, snr: 0, passes: false, reason: 'No items to evaluate' }
  }
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
  const signalCount = scores.filter((s) => s >= 7.0).length
  const snr = signalCount / scores.length
  const passes = avgScore >= QUALITY_THRESHOLD_AVG && snr >= QUALITY_THRESHOLD_SNR
  return {
    avgScore: Math.round(avgScore * 10) / 10,
    snr: Math.round(snr * 100) / 100,
    passes,
    reason: passes
      ? `Avg ${avgScore.toFixed(1)}/10, ${(snr * 100).toFixed(0)}% signal`
      : `Avg ${avgScore.toFixed(1)}/10 (need ≥${QUALITY_THRESHOLD_AVG}), ${(snr * 100).toFixed(0)}% signal (need ≥${(QUALITY_THRESHOLD_SNR * 100).toFixed(0)}%)`,
  }
}
