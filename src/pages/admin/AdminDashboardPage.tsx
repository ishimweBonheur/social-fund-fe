import { useCallback, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  HandCoins,
  MoreHorizontal,
  UsersRound,
  Wallet,
} from 'lucide-react'
import { DashboardLoading, DashboardTooltip } from '@/components/dashboard/DashboardChart'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRemoteData } from '@/hooks/useRemoteData'
import { chartTheme, formatCompact, formatCurrency } from '@/lib/dashboardChart'
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

export default function AdminDashboardPage() {
  const [months, setMonths] = useState<6 | 12>(6)
  const dashboard = useRemoteData(useCallback(() => getAdminDashboard(months), [months]))
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
  const rate = s.expectedMonth > 0 ? Math.min(100, (s.collectedMonth / s.expectedMonth) * 100) : 0
  const metrics = [
    {
      label: 'Fund balance',
      value: formatCurrency(s.fundBalance),
      note: `${formatCurrency(s.fundInflow)} inflow`,
      icon: Wallet,
      trend: '+8.4%',
      tone: 'bg-primary/10 text-primary',
    },
    {
      label: 'Collected this month',
      value: formatCurrency(s.collectedMonth),
      note: `${rate.toFixed(1)}% of expected`,
      icon: CircleDollarSign,
      trend: '+12.6%',
      tone: 'bg-[#f2a93b]/15 text-[#d58a16]',
    },
    {
      label: 'Active members',
      value: s.membersActive.toLocaleString(),
      note: `${s.membersTotal} total members`,
      icon: UsersRound,
      trend: '+5.7%',
      tone: 'bg-[#4da3ff]/15 text-[#3789db]',
    },
    {
      label: 'Assistance approved',
      value: s.assistanceApproved.toLocaleString(),
      note: `${s.assistancePending} awaiting review`,
      icon: HandCoins,
      trend: '+9.3%',
      tone: 'bg-[#ed5d71]/15 text-[#dc4960]',
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
          <Button
            variant="outline"
            className="h-10"
          >
            <CalendarDays className="h-4 w-4" />
            Last {months} months
          </Button>
          <Button className="h-10">
            <Download className="h-4 w-4" />
            Export report
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, note, icon: Icon, trend, tone }) => (
          <Card
            key={label}
            className="group overflow-hidden shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/25"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex items-center text-xs font-semibold text-primary">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {trend}
                </span>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 truncate text-2xl font-bold tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.75fr)]">
        <Card className="min-w-0 shadow-card">
          <CardHeader className="flex-row items-center justify-between space-y-0 p-5 pb-1">
            <div>
              <CardTitle>Contribution performance</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Expected versus collected contributions
              </p>
            </div>
            <div className="flex rounded-lg bg-muted p-1">
              {([6, 12] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setMonths(value)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${months === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                >
                  {value}M
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="h-[310px] min-w-0 p-3 pt-5 sm:p-5">
            <ResponsiveContainer>
              <AreaChart data={dashboard.data.contributionPerformance}>
                <defs>
                  <linearGradient
                    id="collectedFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={chartTheme.primary}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="100%"
                      stopColor={chartTheme.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke={chartTheme.grid}
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="month"
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
                <Area
                  type="monotone"
                  dataKey="expected"
                  stroke="#f2a93b"
                  strokeWidth={2}
                  fill="transparent"
                  strokeDasharray="5 5"
                />
                <Area
                  type="monotone"
                  dataKey="collected"
                  stroke={chartTheme.primary}
                  strokeWidth={2.5}
                  fill="url(#collectedFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="overflow-hidden shadow-card">
          <CardHeader className="p-5 pb-0">
            <CardTitle>Monthly goal</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Collection target progress</p>
          </CardHeader>
          <CardContent className="p-5">
            <div
              className="relative mx-auto mt-2 grid h-44 w-44 place-items-center rounded-full"
              style={{
                background: `conic-gradient(var(--color-primary) ${rate * 3.6}deg, var(--color-muted) 0deg)`,
              }}
            >
              <div className="grid h-32 w-32 place-items-center rounded-full bg-card text-center">
                <div>
                  <p className="text-3xl font-bold">{rate.toFixed(0)}%</p>
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
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader className="flex-row items-center justify-between space-y-0 p-5 pb-2">
            <CardTitle>Pending contributions</CardTitle>
            <Badge className="border-0 bg-[#f2a93b]/15 text-[#c77d0b] shadow-none">
              {s.pendingContributions} pending
            </Badge>
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            {(pending.data ?? []).map((item, index) => (
              <div
                key={item.id ?? index}
                className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-muted/70"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2a93b]/15 text-[#cf8615]">
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
                  <p className="flex items-center justify-end text-[11px] text-[#c77d0b]">
                    <ArrowDownRight className="h-3 w-3" />
                    Review
                  </p>
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
