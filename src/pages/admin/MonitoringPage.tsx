import { useCallback, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'
import { FundTable } from '@/components/shared/FundTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getHealth, getMetrics } from '@/services/monitoringService'

export default function MonitoringPage() {
  const loadHealth = useCallback(() => getHealth(), [])
  const loadMetrics = useCallback(() => getMetrics(), [])
  const health = useRemoteData(loadHealth)
  const metrics = useRemoteData(loadMetrics)
  const [search, setSearch] = useState('')
  const filteredMetrics = useMemo(
    () =>
      (metrics.data ?? []).filter((item) =>
        [item.metric, item.labels, item.value].some((value) =>
          String(value).toLowerCase().includes(search.toLowerCase()),
        ),
      ),
    [metrics.data, search],
  )
  const reload = () => {
    health.reload()
    metrics.reload()
  }

  return (
    <div>
      <PageHeader
        title="System Monitoring"
        description="Backend health, database readiness, and Prometheus operational metrics"
        action={
          <Button
            variant="outline"
            onClick={reload}
          >
            Refresh
          </Button>
        }
      />
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">API Health</p>
            <p className="mt-1 text-xl font-bold uppercase">
              {health.isLoading ? 'Checking…' : health.error ? 'Unavailable' : health.data?.status}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Database</p>
            <p className="mt-1 text-xl font-bold uppercase">
              {health.isLoading
                ? 'Checking…'
                : health.error
                  ? 'Unknown'
                  : (health.data?.database ?? 'Connected')}
            </p>
          </CardContent>
        </Card>
      </div>
      {health.error && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          Health check: {health.error}
        </p>
      )}
      {metrics.isLoading ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="h-9 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </CardContent>
        </Card>
      ) : metrics.error ? (
        <EmptyState
          title="Unable to load metrics"
          description={metrics.error}
          action={
            <Button
              variant="outline"
              onClick={metrics.reload}
            >
              Retry
            </Button>
          }
        />
      ) : (
        <FundTable
          columns={['Metric', 'Labels', 'Value']}
          rows={filteredMetrics.map((item) => [item.metric, item.labels, item.value])}
          title="Operational metrics"
          description={`${filteredMetrics.length} metrics`}
          toolbar={
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter metrics or labels..."
              />
            </div>
          }
        />
      )}
    </div>
  )
}
