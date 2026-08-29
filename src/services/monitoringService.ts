import { apiClient } from '@/services/api'

export interface HealthStatus {
  status: string
  database?: string
  details: Record<string, unknown>
}
export interface MetricSample {
  metric: string
  labels: string
  value: string
}

const apiOrigin = () =>
  new URL(apiClient.defaults.baseURL || '/api/v1', window.location.origin).origin

export async function getHealth(): Promise<HealthStatus> {
  const { data } = await apiClient.get<Record<string, unknown>>(`${apiOrigin()}/healthz`)
  return {
    status: String(data.status ?? data.Status ?? 'healthy'),
    database: data.database
      ? String(data.database)
      : data.Database
        ? String(data.Database)
        : undefined,
    details: data,
  }
}

export async function getMetrics(): Promise<MetricSample[]> {
  const { data } = await apiClient.get<string>(`${apiOrigin()}/metrics`, { responseType: 'text' })
  return data
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const match = line.match(/^([^\s{]+)(?:\{([^}]*)\})?\s+(.+)$/)
      return match
        ? { metric: match[1], labels: match[2] || '—', value: match[3] }
        : { metric: line, labels: '—', value: '—' }
    })
}
