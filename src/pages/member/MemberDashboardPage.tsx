import { useCallback } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DashboardChartCard, DashboardLoading, DashboardTooltip } from '@/components/dashboard/DashboardChart'
import DashboardMetrics from '@/components/shared/DashboardMetrics'
import { PageHeader } from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { useRemoteData } from '@/hooks/useRemoteData'
import { chartTheme, formatCompact, formatCurrency } from '@/lib/dashboardChart'
import { getMemberDashboard } from '@/services/fundService'

const displayDate = (value?: string) => value ? new Date(value).toLocaleDateString() : '—'
const Detail = ({ label, value }: { label: string; value?: string }) => <div className="flex justify-between gap-4 border-b pb-3 text-sm last:border-0"><span className="text-muted-foreground">{label}</span><strong className="text-right">{value ?? '—'}</strong></div>
const CountList = ({ title, description, items, empty }: { title: string; description: string; items: Array<{ name: string; count: number }>; empty: string }) => <Card className="shadow-card"><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent className="space-y-2">{items.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p> : items.map((item) => <div key={item.name} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2"><span className="text-xs font-medium">{item.name.replaceAll('_', ' ')}</span><strong className="text-sm">{item.count}</strong></div>)}</CardContent></Card>

export default function MemberDashboardPage() {
  const { currentUser } = useApp()
  const remote = useRemoteData(useCallback(() => getMemberDashboard(), []))
  if (remote.isLoading) return <DashboardLoading />
  if (remote.error || !remote.data) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{remote.error || 'Dashboard data is unavailable.'}</p>
  const data = remote.data
  const s = data.summary
  const metrics: Array<[string, string, string]> = [
    ['Expected This Month', formatCurrency(s.expectedMonth), 'From your contribution schedule'],
    ['Paid This Month', formatCurrency(s.paidMonth), 'Approved payments'],
    ['Outstanding', formatCurrency(s.outstanding), `${s.overdueCount} overdue`],
    ['Total Contributed', formatCurrency(s.totalContributed), 'All approved contributions'],
  ]

  return <div className="min-w-0 space-y-3">
    <PageHeader title={`Welcome back, ${currentUser?.fullName ?? 'Member'}`} description="Your contribution and assistance overview" />
    <DashboardMetrics items={metrics} />

    <div className="grid gap-3 xl:grid-cols-12">
      <div className="xl:col-span-7"><DashboardChartCard title="My Contribution History" description="Expected versus approved payments" empty={data.contributionHistory.length === 0} emptyMessage="No contribution history is available yet."><ResponsiveContainer><LineChart data={data.contributionHistory}><CartesianGrid vertical={false} stroke={chartTheme.grid} strokeDasharray="3 5" /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} tickFormatter={formatCompact} /><Tooltip content={<DashboardTooltip currency />} /><Legend /><Line type="monotone" dataKey="expected" stroke={chartTheme.secondary} strokeWidth={2} dot={false} activeDot={{ r: 4 }} /><Line type="monotone" dataKey="paid" stroke={chartTheme.primary} strokeWidth={2} dot={false} activeDot={{ r: 4 }} /></LineChart></ResponsiveContainer></DashboardChartCard></div>
      <Card className="shadow-card xl:col-span-5"><CardHeader><CardTitle>Next Contribution</CardTitle><CardDescription>Your next scheduled payment</CardDescription></CardHeader><CardContent className="space-y-3"><Detail label="Expected Amount" value={data.nextExpectedAmount === undefined ? '—' : formatCurrency(data.nextExpectedAmount)} /><Detail label="Due Date" value={displayDate(data.nextDueDate)} /><Detail label="Grace Period" value={data.gracePeriodDays === undefined ? '—' : `${data.gracePeriodDays} days`} /><Detail label="Effective Overdue Date" value={displayDate(data.effectiveOverdueDate)} /><Detail label="Plan" value={data.planAmount === undefined ? data.planFrequency : `${formatCurrency(data.planAmount)} · ${data.planFrequency ?? ''}`} /><Detail label="Late Fee" value={data.planLateFee === undefined ? 'Disabled' : `${data.planLateFee}%`} /></CardContent></Card>
    </div>

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <CountList title="Payment Status" description="Your contributions by status" items={data.paymentStatuses} empty="No payment records yet." />
      <CountList title="Assistance Requests" description="Your requests by status" items={data.assistanceStatuses} empty="No assistance requests yet." />
      <Card className="shadow-card md:col-span-2 xl:col-span-1"><CardHeader><CardTitle>Recent Contributions</CardTitle><CardDescription>Your five latest scheduled payments</CardDescription></CardHeader><CardContent className="space-y-3">{data.recentContributions.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No contribution records yet.</p> : data.recentContributions.map((item) => <div key={`${item.dueDate}-${item.status}`} className="flex items-center justify-between gap-3 border-b pb-3 last:border-0"><div><p className="text-sm font-semibold">{formatCurrency(item.paid)}</p><p className="text-xs text-muted-foreground">Expected {formatCurrency(item.expected)} · {displayDate(item.dueDate)}</p></div><StatusBadge status={item.status} /></div>)}</CardContent></Card>
    </div>
  </div>
}
