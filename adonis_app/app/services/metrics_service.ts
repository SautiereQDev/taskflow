import { DateTime } from 'luxon'

export type RequestMetric = {
  method: string
  url: string
  status: number
  durationMs: number
  timestamp: DateTime
}

export type MetricsSnapshot = {
  totalRequests: number
  averageDuration: number
  p95Duration: number
  recentRequests: RequestMetric[]
}

const MAX_RECORDS = 50

class MetricsService {
  #recent: RequestMetric[] = []

  public record(metric: RequestMetric) {
    this.#recent.unshift(metric)
    if (this.#recent.length > MAX_RECORDS) {
      this.#recent.pop()
    }
  }

  public getSnapshot(): MetricsSnapshot {
    const durations = this.#recent.map((metric) => metric.durationMs)
    const totalRequests = this.#recent.length
    const averageDuration = totalRequests
      ? Math.round((durations.reduce((acc, value) => acc + value, 0) / totalRequests) * 100) / 100
      : 0
    const p95Duration = this.#computePercentile(durations, 0.95)

    return {
      totalRequests,
      averageDuration,
      p95Duration,
      recentRequests: [...this.#recent],
    }
  }

  public reset() {
    this.#recent = []
  }

  #computePercentile(values: number[], percentile: number): number {
    if (!values.length) {
      return 0
    }

    const sorted = [...values].sort((a, b) => a - b)
    const rank = Math.ceil(percentile * sorted.length) - 1
    return Math.round(sorted[Math.max(0, rank)] * 100) / 100
  }
}

const metricsService = new MetricsService()

export { MetricsService }
export default metricsService
