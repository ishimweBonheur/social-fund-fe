import DashboardMetrics from '@/components/shared/DashboardMetrics'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getMemberDashboard } from '@/services/fundService'

const Detail = ({ label, value }: { label: string; value?: string }) => <div className="flex justify-between border-b pb-3 text-sm last:border-0"><span className="text-muted-foreground">{label}</span><strong>{value ?? '—'}</strong></div>

export default function MemberDashboardPage() {
  const { currentUser } = useApp()
  const { data, error, isLoading } = useRemoteData(getMemberDashboard)
  if (isLoading) return <p className="rounded-xl bg-card p-8 text-center text-sm text-muted-foreground">Loading dashboard…</p>
  if (error || !data) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error || 'CLIENT_ERROR: Dashboard data is unavailable.'}</p>
  return (
    <div className="min-w-0 space-y-3">
      <PageHeader title="Member Dashboard" description={`Welcome back, ${currentUser?.fullName ?? 'Member'}.`} />
      <DashboardMetrics items={data.metrics} />
      <div className="grid gap-3 md:grid-cols-2">
        <Card><CardHeader><CardTitle>Next Contribution</CardTitle></CardHeader><CardContent className="space-y-3"><Detail label="Expected Amount" value={data.nextExpectedAmount} /><Detail label="Due Date" value={data.nextDueDate} /></CardContent></Card>
        <Card><CardHeader><CardTitle>Active Contribution Plan</CardTitle></CardHeader><CardContent className="space-y-3"><Detail label="Amount" value={data.planAmount} /><Detail label="Frequency" value={data.planFrequency} /><Detail label="Reminder" value={data.reminderFrequency} /><Detail label="Late Fee" value={data.planLateFee} /></CardContent></Card>
      </div>
    </div>
  )
}
