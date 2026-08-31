import { useCallback } from 'react'
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
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  HandCoins,
  ReceiptText,
  WalletCards,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardLoading, DashboardTooltip } from '@/components/dashboard/DashboardChart'
import StatusBadge from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'
import { useRemoteData } from '@/hooks/useRemoteData'
import { chartTheme, formatCompact, formatCurrency } from '@/lib/dashboardChart'
import { formatPersonName, humanizeValue } from '@/lib/utils'
import { getMemberDashboard } from '@/services/fundService'

const displayDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Not scheduled'

export default function MemberDashboardPage() {
  const { currentUser } = useApp()
  const remote = useRemoteData(useCallback(() => getMemberDashboard(), []))
  if (remote.isLoading) return <DashboardLoading />
  if (remote.error || !remote.data)
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
      >
        {remote.error || 'Dashboard data is unavailable.'}
      </p>
    )

  const data = remote.data
  const s = data.summary
  const rate = s.expectedMonth > 0 ? Math.min(100, (s.paidMonth / s.expectedMonth) * 100) : 0
  const metrics = [
    {
      label: 'Total contributed',
      value: formatCurrency(s.totalContributed),
      note: 'Lifetime approved payments',
      icon: WalletCards,
      tone: 'bg-primary/10 text-primary',
      to: '/member/contributions',
    },
    {
      label: 'Paid this month',
      value: formatCurrency(s.paidMonth),
      note: `${rate.toFixed(0)}% of monthly target`,
      icon: CheckCircle2,
      tone: 'bg-[#547792]/15 text-[#547792]',
      to: '/member/contributions',
    },
    {
      label: 'Outstanding',
      value: formatCurrency(s.outstanding),
      note: s.overdueCount
        ? `${s.overdueCount} overdue payment${s.overdueCount === 1 ? '' : 's'}`
        : 'You are up to date',
      icon: Clock3,
      tone: 'bg-[#94B4C1]/25 text-[#547792]',
      to: '/member/contributions',
    },
    {
      label: 'Assistance received',
      value: formatCurrency(s.assistanceReceived),
      note: `${s.pendingCount} request${s.pendingCount === 1 ? '' : 's'} pending`,
      icon: HandCoins,
      tone: 'bg-[#213448]/10 text-[#547792]',
      to: '/member/loans',
    },
  ]

  return (
    <div className="min-w-0 space-y-5">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Member overview
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome back, {formatPersonName(currentUser?.fullName)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your contributions, upcoming payment and assistance activity.
          </p>
        </div>
        <Button asChild>
          <Link to="/member/contributions">
            <CircleDollarSign className="h-4 w-4" />
            Make a contribution
          </Link>
        </Button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, note, icon: Icon, tone, to }) => (
          <Link
            key={label}
            to={to}
            className="block"
          >
            <Card className="h-full shadow-card transition-all hover:-translate-y-0.5 hover:shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <span className={`grid h-10 w-10 place-items-center rounded-lg ${tone}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-5 text-sm font-medium text-muted-foreground">{label}</p>
                <p className="mt-1 truncate text-2xl font-extrabold tracking-tight">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{note}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.75fr)]">
        <Card className="min-w-0 shadow-card">
          <CardHeader className="flex-row items-center justify-between space-y-0 p-5 pb-1">
            <div>
              <CardTitle>Contribution performance</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Expected compared with approved payments
              </p>
            </div>
            <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              {rate.toFixed(0)}% paid
            </span>
          </CardHeader>
          <CardContent className="h-78.75 min-w-0 p-3 pt-5 sm:p-5">
            {data.contributionHistory.length ? (
              <ResponsiveContainer
                width="100%"
                height={280}
              >
                <AreaChart data={data.contributionHistory}>
                  <defs>
                    <linearGradient
                      id="memberPaidFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={chartTheme.primary}
                        stopOpacity={0.28}
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
                    stroke="#94B4C1"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="transparent"
                  />
                  <Area
                    type="monotone"
                    dataKey="paid"
                    stroke={chartTheme.primary}
                    strokeWidth={2.5}
                    fill="url(#memberPaidFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center rounded-xl bg-muted/40 px-6 text-center text-sm text-muted-foreground">
                No contribution history yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden shadow-card">
          <CardHeader className="p-5 pb-0">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <CalendarClock className="h-5 w-5" />
              </span>
              <span className="text-xs font-semibold text-muted-foreground">Next payment</span>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Expected amount</p>
            <p className="mt-1 text-3xl font-extrabold tracking-tight">
              {data.nextExpectedAmount === undefined
                ? 'Not scheduled'
                : formatCurrency(data.nextExpectedAmount)}
            </p>
            <div className="my-5 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${rate}%` }}
              />
            </div>
            <div className="space-y-3">
              {[
                ['Due date', displayDate(data.nextDueDate)],
                [
                  'Grace period',
                  data.gracePeriodDays === undefined
                    ? 'Not configured'
                    : `${data.gracePeriodDays} days`,
                ],
                [
                  'Plan',
                  data.planAmount === undefined
                    ? humanizeValue(data.planFrequency || 'Not configured')
                    : `${formatCurrency(data.planAmount)} · ${humanizeValue(data.planFrequency || '')}`,
                ],
                ['Late fee', data.planLateFee === undefined ? 'Disabled' : `${data.planLateFee}%`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <strong className="text-right text-sm">{value}</strong>
                </div>
              ))}
            </div>
            <Button
              asChild
              variant="outline"
              className="mt-5 w-full"
            >
              <Link to="/member/contribution-plan">
                View contribution plan <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          {
            title: 'Payment status',
            description: 'Your contributions by status',
            items: data.paymentStatuses,
            icon: ReceiptText,
            empty: 'No payment records yet.',
          },
          {
            title: 'Assistance requests',
            description: 'Your requests by status',
            items: data.assistanceStatuses,
            icon: HandCoins,
            empty: 'No assistance requests yet.',
          },
        ].map(({ title, description, items, icon: Icon, empty }) => (
          <Card
            key={title}
            className="shadow-card"
          >
            <CardHeader className="flex-row items-center gap-3 space-y-0 p-5 pb-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <CardTitle>{title}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 p-5 pt-2">
              {items.length ? (
                items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between border-b border-border/50 py-2.5 last:border-0"
                  >
                    <StatusBadge status={item.name} />
                    <strong className="text-sm">{item.count}</strong>
                  </div>
                ))
              ) : (
                <p className="py-7 text-center text-sm text-muted-foreground">{empty}</p>
              )}
            </CardContent>
          </Card>
        ))}

        <Card className="shadow-card">
          <CardHeader className="flex-row items-center justify-between space-y-0 p-5 pb-3">
            <div>
              <CardTitle>Recent contributions</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Your latest scheduled payments</p>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
            >
              <Link to="/member/contributions">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            {data.recentContributions.length ? (
              data.recentContributions.slice(0, 5).map((item) => (
                <div
                  key={`${item.dueDate}-${item.status}`}
                  className="flex items-center gap-3 rounded-lg p-3 transition hover:bg-muted/60"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                    <ReceiptText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{formatCurrency(item.paid)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Due {displayDate(item.dueDate)} · Expected {formatCurrency(item.expected)}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No contribution records yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
