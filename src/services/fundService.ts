import axios from 'axios'
import { apiClient, type ApiEnvelope } from '@/services/api'
import { listMembers } from '@/services/memberService'

type RecordDto = Record<string, unknown>
export interface ChartPoint {
  month: string
  value: number
}
export interface DashboardData {
  metrics: Array<[string, string, string]>
  fundGrowth: ChartPoint[]
  fundHealth: Array<[string, string]>
  recentContributions: string[][]
  recentRepayments: string[][]
  nextRepayment?: { loan: string; amount: string; dueDate: string }
}
export interface AdminDashboardData {
  summary: {
    membersTotal: number
    membersActive: number
    membersInactive: number
    membersSuspended: number
    expectedMonth: number
    collectedMonth: number
    outstanding: number
    pendingContributions: number
    overdueMembers: number
    fundInflow: number
    fundOutflow: number
    fundBalance: number
    assistancePending: number
    assistanceApproved: number
    notificationsFailed: number
  }
  contributionPerformance: Array<{ month: string; expected: number; collected: number }>
  fundMovement: Array<{ month: string; inflow: number; outflow: number }>
  memberStatuses: Array<{ name: string; count: number }>
  assistanceStatuses: Array<{ name: string; count: number }>
  overdueBuckets: Array<{ name: string; count: number }>
  contributionByFrequency: Array<{
    frequency: string
    expected: number
    paid: number
    outstanding: number
    total: number
    approved: number
    pending: number
    overdue: number
    rejected: number
  }>
}
export interface MemberDashboardData {
  summary: {
    totalContributed: number
    outstanding: number
    expectedMonth: number
    paidMonth: number
    contributionRate: number
    pendingCount: number
    overdueCount: number
    assistanceReceived: number
  }
  nextDueDate?: string
  nextExpectedAmount?: number
  planAmount?: number
  planFrequency?: string
  reminderFrequency?: string
  planLateFee?: number
  gracePeriodDays?: number
  effectiveOverdueDate?: string
  contributionHistory: Array<{ month: string; expected: number; paid: number }>
  paymentStatuses: Array<{ name: string; count: number }>
  assistanceStatuses: Array<{ name: string; count: number }>
  recentContributions: Array<{ dueDate: string; expected: number; paid: number; status: string }>
  contributionByFrequency: Array<{
    frequency: string
    expected: number
    paid: number
    outstanding: number
    total: number
    approved: number
    pending: number
    overdue: number
    rejected: number
  }>
}

const text = (value: unknown, fallback = '—') =>
  value === null || value === undefined || value === '' ? fallback : String(value)
const nestedName = (value: unknown) =>
  typeof value === 'object' && value !== null
    ? text((value as RecordDto).full_name ?? (value as RecordDto).name)
    : text(value)
const money = (value: unknown) => {
  const amount =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : Number.NaN
  return Number.isFinite(amount) ? `RWF ${amount.toLocaleString()}` : text(value)
}
const date = (value: unknown) => (value ? new Date(String(value)).toLocaleDateString() : '—')
const arrayData = (value: unknown, key: string): RecordDto[] => {
  if (Array.isArray(value)) return value as RecordDto[]
  if (typeof value === 'object' && value !== null && Array.isArray((value as RecordDto)[key]))
    return (value as RecordDto)[key] as RecordDto[]
  return []
}
export async function getContributionPlans() {
  const { members } = await listMembers({ pageSize: 100 })
  const plans = await Promise.all(
    members.map(async (member) => {
      try {
        const { data } = await apiClient.get<RecordDto>(
          `/admin/contribution-plans/users/${member.id}/active`,
        )
        return [
          member.fullName,
          money(data.Amount),
          text(data.Frequency),
          date(data.StartDate),
          date(data.EndDate),
          data.IsActive ? 'ACTIVE' : 'INACTIVE',
        ]
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404)
          return [member.fullName, '—', '—', '—', '—', 'NO ACTIVE PLAN']
        throw error
      }
    }),
  )
  return plans
}

function mapDashboard(data: RecordDto): DashboardData {
  const metricsObject = (data.metrics ?? data.summary ?? data) as RecordDto
  const rawMetrics =
    metricsObject && typeof metricsObject === 'object'
      ? Object.entries(metricsObject)
          .filter(([, value]) => ['string', 'number'].includes(typeof value))
          .slice(0, 4)
      : []
  const metrics = rawMetrics.map(
    ([key, value]) =>
      [
        key.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
        money(value),
        'Current',
      ] as [string, string, string],
  )
  const growth = arrayData(data.fund_growth ?? data.monthly_contributions, 'items').map((item) => ({
    month: text(item.month ?? item.label),
    value: Number(item.value ?? item.amount ?? 0),
  }))
  return {
    metrics,
    fundGrowth: growth,
    fundHealth: arrayData(data.fund_health, 'items').map((item) => [
      text(item.label),
      money(item.value),
    ]),
    recentContributions: arrayData(data.recent_contributions, 'items').map((item) => [
      nestedName(item.member ?? item.member_name),
      money(item.expected_amount),
      money(item.paid_amount),
      date(item.due_date),
      date(item.payment_date),
      text(item.payment_method),
      text(item.transaction_reference),
      text(item.status),
    ]),
    recentRepayments: arrayData(data.recent_repayments, 'items').map((item) => [
      nestedName(item.member ?? item.member_name),
      text(item.loan_reference ?? item.loan_id),
      money(item.expected_amount),
      money(item.paid_amount),
      date(item.due_date),
      date(item.payment_date),
      text(item.status),
    ]),
    nextRepayment:
      data.next_repayment && typeof data.next_repayment === 'object'
        ? {
            loan: text((data.next_repayment as RecordDto).loan_reference),
            amount: money((data.next_repayment as RecordDto).amount),
            dueDate: date((data.next_repayment as RecordDto).due_date),
          }
        : undefined,
  }
}
const number = (value: unknown) => {
  if (value === undefined || value === null || value === '')
    throw new Error('Dashboard response is missing a required numeric field.')
  const parsed = Number(value)
  if (!Number.isFinite(parsed))
    throw new Error('Dashboard response contains an invalid numeric field.')
  return parsed
}
const counts = (value: unknown) =>
  arrayData(value, 'items').map((item) => ({ name: text(item.name), count: number(item.count) }))
const frequencies = (value: unknown) =>
  arrayData(value, 'items').map((item) => ({
    frequency: text(item.frequency),
    expected: number(item.expected),
    paid: number(item.collected),
    outstanding: number(item.outstanding),
    total: number(item.total),
    approved: number(item.approved),
    pending: number(item.pending),
    overdue: number(item.overdue),
    rejected: number(item.rejected),
  }))
export async function getAdminDashboard(months: 6 | 12 = 6): Promise<AdminDashboardData> {
  const { data } = await apiClient.get<ApiEnvelope<RecordDto>>('/admin/dashboard/', {
    params: { months },
  })
  const value = data.data
  const summary = value.summary as RecordDto
  return {
    summary: {
      membersTotal: number(summary.members_total),
      membersActive: number(summary.members_active),
      membersInactive: number(summary.members_inactive),
      membersSuspended: number(summary.members_suspended),
      expectedMonth: number(summary.expected_this_month),
      collectedMonth: number(summary.collected_this_month),
      outstanding: number(summary.outstanding_amount),
      pendingContributions: number(summary.pending_contributions),
      overdueMembers: number(summary.overdue_members),
      fundInflow: number(summary.fund_inflow),
      fundOutflow: number(summary.fund_outflow),
      fundBalance: number(summary.fund_balance),
      assistancePending: number(summary.assistance_pending),
      assistanceApproved: number(summary.assistance_approved),
      notificationsFailed: number(summary.notifications_failed),
    },
    contributionPerformance: frequencies(value.contribution_by_frequency).map((item) => ({
      month: item.frequency,
      expected: item.expected,
      collected: item.paid,
    })),
    fundMovement: arrayData(value.fund_movement, 'items').map((item) => ({
      month: text(item.month),
      inflow: number(item.inflow),
      outflow: number(item.outflow),
    })),
    memberStatuses: counts(value.member_statuses),
    assistanceStatuses: counts(value.assistance_statuses),
    overdueBuckets: counts(value.overdue_buckets),
    contributionByFrequency: frequencies(value.contribution_by_frequency),
  }
}
export async function getMemberDashboard(): Promise<MemberDashboardData> {
  const { data } = await apiClient.get<ApiEnvelope<RecordDto>>('/dashboard/')
  const value = data.data
  const summary = value.summary as RecordDto
  return {
    summary: {
      totalContributed: number(summary.total_contributed),
      outstanding: number(summary.outstanding_amount),
      expectedMonth: number(summary.expected_this_month),
      paidMonth: number(summary.paid_this_month),
      contributionRate: number(summary.contribution_rate),
      pendingCount: number(summary.pending_count),
      overdueCount: number(summary.overdue_count),
      assistanceReceived: number(summary.assistance_received),
    },
    nextDueDate: summary.next_due_date ? text(summary.next_due_date) : undefined,
    nextExpectedAmount:
      summary.next_expected_amount !== undefined ? number(summary.next_expected_amount) : undefined,
    planAmount: summary.plan_amount !== undefined ? number(summary.plan_amount) : undefined,
    planFrequency: summary.plan_frequency ? text(summary.plan_frequency) : undefined,
    reminderFrequency: summary.reminder_frequency ? text(summary.reminder_frequency) : undefined,
    planLateFee: summary.plan_late_fee !== undefined ? number(summary.plan_late_fee) : undefined,
    gracePeriodDays:
      summary.grace_period_days !== undefined ? number(summary.grace_period_days) : undefined,
    effectiveOverdueDate: summary.effective_overdue_date
      ? text(summary.effective_overdue_date)
      : undefined,
    contributionHistory: frequencies(value.contribution_by_frequency).map((item) => ({
      month: item.frequency,
      expected: item.expected,
      paid: item.paid,
    })),
    paymentStatuses: counts(value.payment_statuses),
    assistanceStatuses: counts(value.assistance_statuses),
    recentContributions: arrayData(value.recent_contributions, 'items').map((item) => ({
      dueDate: text(item.due_date),
      expected: number(item.expected),
      paid: number(item.paid),
      status: text(item.status),
    })),
    contributionByFrequency: frequencies(value.contribution_by_frequency),
  }
}
export async function getMemberContributionPlan() {
  const dashboard = await getMemberDashboard()
  return [
    [
      dashboard.planAmount === undefined ? '—' : money(dashboard.planAmount),
      dashboard.planFrequency ?? '—',
      dashboard.nextExpectedAmount === undefined ? '—' : money(dashboard.nextExpectedAmount),
      dashboard.nextDueDate ? date(dashboard.nextDueDate) : '—',
      dashboard.reminderFrequency ?? '—',
      dashboard.planLateFee === undefined ? '—' : `${dashboard.planLateFee}%`,
    ],
  ]
}
export async function getReports() {
  const { data } = await apiClient.get<ApiEnvelope<RecordDto>>('/admin/fund/summary')
  return mapDashboard({
    metrics: {
      total_in: data.data.total_in,
      total_out: data.data.total_out,
      balance: data.data.balance,
    },
    fund_growth: [],
  })
}
