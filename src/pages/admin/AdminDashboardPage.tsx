import DashboardMetrics from '@/components/shared/DashboardMetrics'
import { PageHeader } from '@/components/shared/PageHeader'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getAdminDashboard } from '@/services/fundService'

export default function AdminDashboardPage() {
  const { data, error, isLoading } = useRemoteData(getAdminDashboard)
  if (isLoading) return <p className="rounded-xl bg-card p-8 text-center text-sm text-muted-foreground">Loading dashboard…</p>
  if (error || !data) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error || 'CLIENT_ERROR: Dashboard data is unavailable.'}</p>
  return <div className="space-y-3"><PageHeader title="Admin Dashboard" description="Live operational totals returned by the Social Fund backend" /><DashboardMetrics items={data.metrics} /></div>
}
