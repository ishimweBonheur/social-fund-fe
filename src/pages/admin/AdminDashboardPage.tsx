import { useCallback, useState } from 'react'
import {
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  DashboardChartCard,
  DashboardLoading,
  DashboardTooltip,
} from '@/components/dashboard/DashboardChart'
import DashboardMetrics from '@/components/shared/DashboardMetrics'
import { FundTable } from '@/components/shared/FundTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRemoteData } from '@/hooks/useRemoteData'
import { chartTheme, formatCompact, formatCurrency } from '@/lib/dashboardChart'
import { listPendingContributions } from '@/services/contributionService'
import { getAdminDashboard } from '@/services/fundService'
import { listMembers } from '@/services/memberService'

export default function AdminDashboardPage() {
  const [months, setMonths] = useState<6 | 12>(6)
  const dashboard = useRemoteData(useCallback(() => getAdminDashboard(months), [months]))
  const recentMembers = useRemoteData(useCallback(() => listMembers({ page: 1, pageSize: 5 }), []))
  const pending = useRemoteData(useCallback(() => listPendingContributions(5), []))
  if (dashboard.isLoading) return <DashboardLoading />
  if (dashboard.error || !dashboard.data)
    return (
      <p
        role="alert"
        className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
      >
        {dashboard.error || 'Dashboard data is unavailable.'}
      </p>
    )
  const data = dashboard.data,
    s = data.summary,
    rate = s.expectedMonth > 0 ? Math.min(100, (s.collectedMonth / s.expectedMonth) * 100) : 0
  const metrics: Array<[string, string, string]> = [
    ['Total Members', String(s.membersTotal), `${s.membersActive} active`],
    ['Collected This Month', formatCurrency(s.collectedMonth), 'Approved payments'],
    ['Expected This Month', formatCurrency(s.expectedMonth), 'Scheduled contributions'],
    ['Fund Balance', formatCurrency(s.fundBalance), 'Current ledger balance'],
    ['Outstanding', formatCurrency(s.outstanding), `${s.overdueMembers} overdue members`],
    ['Overdue Members', String(s.overdueMembers), 'Past grace period'],
    ['Pending Contributions', String(s.pendingContributions), 'Awaiting review'],
    ['Pending Assistance', String(s.assistancePending), 'Awaiting decision'],
  ]
  return (
    <div className="min-w-0 space-y-3">
      <PageHeader
        title="Admin Dashboard"
        description="Fund performance and items requiring attention"
      />
      <DashboardMetrics items={metrics} />
      <div className="grid gap-3 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <DashboardChartCard
            title="Contribution Performance"
            description="Expected versus collected contributions"
            empty={data.contributionPerformance.length === 0}
            emptyMessage="No contribution history is available yet."
          >
            <ResponsiveContainer>
              <LineChart data={data.contributionPerformance}>
                <CartesianGrid
                  vertical={false}
                  stroke={chartTheme.grid}
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCompact}
                />
                <Tooltip content={<DashboardTooltip currency />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="expected"
                  stroke={chartTheme.secondary}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="collected"
                  stroke={chartTheme.primary}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </DashboardChartCard>
        </div>
        <div className="space-y-3 xl:col-span-5">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Collection Progress</CardTitle>
              <CardDescription>This month’s approved collections</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(s.collectedMonth)}</p>
              <p className="text-xs text-muted-foreground">of {formatCurrency(s.expectedMonth)}</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${rate}%` }}
                />
              </div>
              <p className="mt-2 text-sm font-semibold">{rate.toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Needs Attention</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                ['Failed notifications', s.notificationsFailed],
                [
                  'Rejected contributions',
                  data.assistanceStatuses.find((item) => item.name === 'REJECTED')?.count ?? 0,
                ],
                ['Inactive members', s.membersInactive],
                ['Suspended members', s.membersSuspended],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl bg-muted p-3"
                >
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={months === 6 ? 'default' : 'outline'}
              onClick={() => setMonths(6)}
            >
              6 months
            </Button>
            <Button
              size="sm"
              variant={months === 12 ? 'default' : 'outline'}
              onClick={() => setMonths(12)}
            >
              12 months
            </Button>
          </div>
        </div>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        <div>
          <h2 className="mb-2 text-sm font-semibold">Recent Members</h2>
          {recentMembers.error ? (
            <p className="text-sm text-red-700">Unable to load recent members.</p>
          ) : (
            <FundTable
              columns={['Member', 'Joined', 'Status']}
              rows={(recentMembers.data?.members ?? []).map((item) => [
                item.fullName,
                new Date(item.createdAt).toLocaleDateString(),
                item.status,
              ])}
            />
          )}
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold">Pending Contributions</h2>
          {pending.error ? (
            <p className="text-sm text-red-700">Unable to load pending contributions.</p>
          ) : (
            <FundTable
              columns={['Member', 'Amount', 'Submitted', 'Status']}
              rows={(pending.data ?? []).map((item) => [
                item.memberName ?? '—',
                formatCurrency(Number(item.paidAmount ?? item.totalDue)),
                item.proofUploadedAt ? new Date(item.proofUploadedAt).toLocaleDateString() : '—',
                item.status,
              ])}
            />
          )}
        </div>
      </div>
    </div>
  )
}
