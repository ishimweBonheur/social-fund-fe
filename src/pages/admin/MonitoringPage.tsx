import { useCallback, useState } from 'react'
import { Search } from 'lucide-react'
import EmptyState from '@/components/shared/EmptyState'
import { FundTable } from '@/components/shared/FundTable'
import { PageHeader } from '@/components/shared/PageHeader'
import Pagination from '@/components/shared/Pagination'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getHealth, getMetrics } from '@/services/monitoringService'

export default function MonitoringPage() {
  const loadHealth = useCallback(() => getHealth(), [])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const loadMetrics = useCallback(
    () => getMetrics({ search, page, pageSize }),
    [search, page, pageSize],
  )
  const health = useRemoteData(loadHealth)
  const metrics = useRemoteData(loadMetrics)
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
          className="mb-3 rounded-xl bg-[#94B4C1]/25 p-3 text-sm text-[#213448] dark:text-[#EAE0CF]"
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
          rows={(metrics.data?.items ?? []).map((item) => [item.metric, item.labels, item.value])}
          title="Operational metrics"
          description={`${metrics.data?.total ?? 0} metrics`}
          toolbar={
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Filter metrics or labels..."
              />
            </div>
          }
          footer={
            <Pagination
              page={page}
              pageSize={pageSize}
              total={metrics.data?.total ?? 0}
              onPageChange={setPage}
              onPageSizeChange={(value) => {
                setPageSize(value)
                setPage(1)
              }}
            />
          }
        />
      )}
    </div>
  )
}
