import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  UsersRound,
  Wallet,
} from 'lucide-react'
import { DashboardLoading, DashboardTooltip } from '@/components/dashboard/DashboardChart'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TableActions from '@/components/shared/TableActions'
import { useRemoteData } from '@/hooks/useRemoteData'
import { chartTheme, formatCompact, formatCurrency } from '@/lib/dashboardChart'
import { exportAdminReport } from '@/lib/exportReport'
import { listPendingContributions } from '@/services/contributionService'
import { getAdminDashboard } from '@/services/fundService'
import { listMembers } from '@/services/memberService'

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const monthLabel = (value: string) => {
  const [year, month] = value.split('-').map(Number)
  if (!year || !month) return 'Selected month'
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  )
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [targetMonth, setTargetMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const dashboard = useRemoteData(
    useCallback(() => getAdminDashboard(6, targetMonth), [targetMonth]),
  )
  const recentMembers = useRemoteData(useCallback(() => listMembers({ page: 1, pageSize: 4 }), []))
  const pending = useRemoteData(useCallback(() => listPendingContributions(4), []))
  if (dashboard.isLoading) return <DashboardLoading />
  if (dashboard.error || !dashboard.data)
    return (
      <p
        role="alert"
        className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
      >
        {dashboard.error || 'Dashboard data is unavailable.'}
      </p>
    )

  const { summary: s } = dashboard.data
  const rawRate = s.expectedMonth > 0 ? (s.collectedMonth / s.expectedMonth) * 100 : 0
  const rate = Math.min(100, Math.max(0, rawRate))
  const contributionPerformance = dashboard.data.contributionByFrequency.map((item) => ({
    period: item.frequency
      .toLowerCase()
      .replaceAll('_', ' ')
      .replace(/^./, (letter) => letter.toUpperCase()),
    expected: item.expected,
    collected: item.paid,
  }))
  const periodCollected = contributionPerformance.reduce((total, item) => total + item.collected, 0)
  const metrics = [
    {
      label: 'Fund balance',
      value: formatCurrency(s.fundBalance),
      note: `${formatCurrency(s.fundInflow)} inflow`,
      icon: Wallet,
      context: 'Net available',
      to: '/admin/repayments',
      tone: 'bg-primary/10 text-primary',
    },
    {
      label: 'Collected this month',
      value: formatCurrency(s.collectedMonth),
      note: `${rate.toFixed(1)}% of expected`,
      icon: CircleDollarSign,
      context: 'This month',
      to: '/admin/contributions',
      tone: 'bg-[#94B4C1]/25 text-[#547792]',
    },
    {
      label: 'Active members',
      value: s.membersActive.toLocaleString(),
      note: `${s.membersTotal} total members`,
      icon: UsersRound,
      context: s.membersTotal
        ? `${((s.membersActive / s.membersTotal) * 100).toFixed(0)}% active`
        : 'No members',
      to: '/admin/members',
      tone: 'bg-[#547792]/15 text-[#547792]',
    },
    {
      label: 'Overdue members',
      value: s.overdueMembers.toLocaleString(),
      note: `${s.pendingContributions} contribution${s.pendingContributions === 1 ? '' : 's'} awaiting review`,
      icon: Clock3,
      context: s.overdueMembers > 0 ? 'Needs attention' : 'All up to date',
      to: '/admin/contributions',
      tone:
        s.overdueMembers > 0
          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
          : 'bg-primary/10 text-primary',
    },
  ]

  return (
    <div className="min-w-0 space-y-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Overview
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome back, Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here’s what’s happening with your community fund today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={targetMonth}
            onChange={(event) => setTargetMonth(event.target.value)}
            aria-label="Target month"
            className="h-10 rounded-lg bg-card px-3 text-sm shadow-sm outline-none focus:ring-3 focus:ring-primary/20"
          />
          <Button
            className="h-10"
            onClick={() => {
              if (!dashboard.data) return
              exportAdminReport(dashboard.data, { targetMonth })
            }}
          >
            <Download className="h-4 w-4" />
            Export report
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, note, icon: Icon, context, tone, to }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(to)}
            className="text-left"
          >
            <Card className="group h-full overflow-hidden shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{context}</span>
                </div>
                <p className="mt-5 text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 truncate text-2xl font-bold tracking-tight">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{note}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.75fr)]">
        <Card className="min-w-0 shadow-card">
          <CardHeader className="flex-row items-center justify-between space-y-0 p-5 pb-1">
            <div>
              <CardTitle>Contribution plans</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Expected versus collected by payment period
              </p>
              <p className="mt-3 text-xl font-bold">{formatCurrency(periodCollected)}</p>
            </div>
          </CardHeader>
          <CardContent className="h-[310px] min-w-0 p-3 pt-5 sm:p-5">
            {contributionPerformance.length ? (
              <ResponsiveContainer
                width="100%"
                height={275}
              >
                <LineChart
                  data={contributionPerformance}
                  margin={{ top: 8, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    stroke={chartTheme.grid}
                    strokeDasharray="3 5"
                  />
                  <XAxis
                    dataKey="period"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={formatCompact}
                    tick={{ fontSize: 11 }}
                    width={45}
                  />
                  <Tooltip content={<DashboardTooltip currency />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    iconSize={7}
                    wrapperStyle={{ fontSize: 11, paddingBottom: 12 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expected"
                    name="Expected"
                    stroke="#94B4C1"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 3, fill: '#EAE0CF', strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="collected"
                    name="Collected"
                    stroke={chartTheme.primary}
                    strokeWidth={3}
                    dot={{ r: 3.5, fill: '#547792', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center rounded-xl bg-muted/40 px-6 text-center text-sm text-muted-foreground">
                No contribution data yet.
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="overflow-hidden shadow-card">
          <CardHeader className="p-5 pb-0">
            <CardTitle>Monthly goal</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {monthLabel(targetMonth)} contribution target
            </p>
          </CardHeader>
          <CardContent className="p-5">
            <div
              role="progressbar"
              aria-label={`${monthLabel(targetMonth)} collection progress`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(rate)}
              className="relative mx-auto mt-2 grid h-44 w-44 place-items-center rounded-full"
              style={{
                background: `conic-gradient(var(--color-primary) ${rate * 3.6}deg, var(--color-muted) 0deg)`,
              }}
            >
              <div className="grid h-32 w-32 place-items-center rounded-full bg-card text-center">
                <div>
                  <p className="text-3xl font-bold">{rawRate.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">complete</p>
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-muted/70 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Collected</p>
                <p className="mt-0.5 text-sm font-bold">{formatCurrency(s.collectedMonth)}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="mt-0.5 text-sm font-bold">{formatCurrency(s.expectedMonth)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader className="flex-row items-center justify-between space-y-0 p-5 pb-2">
            <CardTitle>Recent members</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/members')}
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            {(recentMembers.data?.members ?? []).map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-muted/70"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-accent text-xs font-bold text-primary">
                    {initials(member.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{member.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                </div>
                <Badge className="border-0 bg-primary/10 text-primary shadow-none">
                  {member.status}
                </Badge>
                <TableActions
                  actions={[
                    {
                      label: 'View member',
                      onSelect: () => navigate('/admin/members', { state: { member } }),
                    },
                  ]}
                />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="flex-row items-center justify-between space-y-0 p-5 pb-2">
            <CardTitle>Pending contributions</CardTitle>
            <Badge className="border-0 bg-[#94B4C1]/25 text-[#547792] shadow-none">
              {s.pendingContributions} pending
            </Badge>
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            {(pending.data ?? []).map((item, index) => (
              <div
                key={item.id ?? index}
                className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-muted/70"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#94B4C1]/25 text-[#547792]">
                  <Clock3 className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {item.memberName ?? 'Member contribution'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted{' '}
                    {item.proofUploadedAt
                      ? new Date(item.proofUploadedAt).toLocaleDateString()
                      : 'recently'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {formatCurrency(Number(item.paidAmount ?? item.totalDue))}
                  </p>
                  <button
                    type="button"
                    onClick={() => item.id && navigate(`/admin/contributions/${item.id}/review`)}
                    className="flex items-center justify-end text-[11px] text-[#547792] hover:underline"
                  >
                    <ArrowDownRight className="h-3 w-3" /> Review
                  </button>
                </div>
              </div>
            ))}
            {!pending.isLoading && (pending.data ?? []).length === 0 && (
              <div className="grid h-40 place-items-center text-center">
                <div>
                  <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-primary" />
                  <p className="text-sm font-medium">All caught up</p>
                  <p className="text-xs text-muted-foreground">No contributions need review.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
