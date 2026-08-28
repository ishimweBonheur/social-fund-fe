import { Bell } from 'lucide-react'
import DashboardMetrics from '@/components/shared/DashboardMetrics'
import { FundTable } from '@/components/shared/FundTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getMemberDashboard } from '@/services/fundService'

export default function MemberDashboardPage() {
  const { currentUser } = useApp()
  const { data, error, isLoading } = useRemoteData(getMemberDashboard)
  if (isLoading) return <p className="rounded-xl bg-card p-8 text-center text-sm text-muted-foreground">Loading dashboard…</p>
  if (error || !data) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error || 'Dashboard data is unavailable.'}</p>

  return (
    <div className="min-w-0 space-y-3">
      <PageHeader title="Member Dashboard" description={`Welcome back, ${currentUser?.fullName ?? 'Member'}. Here is your Social Fund overview.`} />
      <DashboardMetrics items={data.metrics} />
      <div className="grid min-w-0 gap-3 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2"><CardHeader><CardTitle>Recent Contributions</CardTitle></CardHeader><CardContent className="p-0"><FundTable columns={['Member', 'Expected', 'Paid', 'Due Date', 'Payment Date', 'Method', 'Reference', 'Status']} rows={data.recentContributions} /></CardContent></Card>
        <Card className="min-w-0"><CardHeader><CardTitle>Next Repayment</CardTitle><CardDescription>Loan {data.nextRepayment?.loan ?? '—'}</CardDescription></CardHeader><CardContent>
          <p className="text-2xl font-bold">{data.nextRepayment?.amount ?? '—'}</p><p className="mt-1 text-sm text-muted-foreground">Due {data.nextRepayment?.dueDate ?? '—'}</p>
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-accent p-3 text-sm text-primary"><Bell className="h-4 w-4 shrink-0" />Reminder enabled</div>
        </CardContent></Card>
      </div>
      <div className="min-w-0"><h2 className="mb-2 text-sm font-semibold">Recent Repayments</h2><FundTable columns={['Member', 'Loan', 'Expected', 'Paid', 'Due Date', 'Payment Date', 'Status']} rows={data.recentRepayments} /></div>
    </div>
  )
}
