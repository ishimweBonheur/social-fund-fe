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

export async function getMetrics(
  query: { search?: string; page?: number; pageSize?: number } = {},
) {
  const page = query.page ?? 1
  const pageSize = query.pageSize ?? 10
  const response = await apiClient.get<string>(`${apiOrigin()}/metrics`, {
    responseType: 'text',
    params: { search: query.search || undefined, limit: pageSize, offset: (page - 1) * pageSize },
  })
  const items = response.data
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const match = line.match(/^([^\s{]+)(?:\{([^}]*)\})?\s+(.+)$/)
      return match
        ? { metric: match[1], labels: match[2] || '—', value: match[3] }
        : { metric: line, labels: '—', value: '—' }
    })
  return { items, total: Number(response.headers['x-total-count'] ?? items.length), page, pageSize }
}
