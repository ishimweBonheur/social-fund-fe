import axios from 'axios'
import { apiClient, type ApiEnvelope } from '@/services/api'
import { listMembers } from '@/services/memberService'

type RecordDto = Record<string, unknown>
export interface ChartPoint { month: string; value: number }
export interface DashboardData {
  metrics: Array<[string, string, string]>
  fundGrowth: ChartPoint[]
  fundHealth: Array<[string, string]>
  recentContributions: string[][]
  recentRepayments: string[][]
  nextRepayment?: { loan: string; amount: string; dueDate: string }
}
export interface AdminDashboardData {
  metrics: Array<[string, string, string]>
}
export interface MemberDashboardData {
  metrics: Array<[string, string, string]>
  nextDueDate?: string
  nextExpectedAmount?: string
  planAmount?: string
  planFrequency?: string
  reminderFrequency?: string
  planLateFee?: string
}

const text = (value: unknown, fallback = '—') => value === null || value === undefined || value === '' ? fallback : String(value)
const nestedName = (value: unknown) => typeof value === 'object' && value !== null ? text((value as RecordDto).full_name ?? (value as RecordDto).name) : text(value)
const money = (value: unknown) => {
  const amount = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : Number.NaN
  return Number.isFinite(amount) ? `RWF ${amount.toLocaleString()}` : text(value)
}
const date = (value: unknown) => value ? new Date(String(value)).toLocaleDateString() : '—'
const arrayData = (value: unknown, key: string): RecordDto[] => {
  if (Array.isArray(value)) return value as RecordDto[]
  if (typeof value === 'object' && value !== null && Array.isArray((value as RecordDto)[key])) return (value as RecordDto)[key] as RecordDto[]
  return []
}
export async function getContributionPlans() {
  const { members } = await listMembers({ pageSize: 100 })
  const plans = await Promise.all(members.map(async (member) => {
    try {
      const { data } = await apiClient.get<RecordDto>(`/admin/contribution-plans/users/${member.id}/active`)
      return [member.fullName, money(data.Amount), text(data.Frequency), date(data.StartDate), date(data.EndDate), data.IsActive ? 'ACTIVE' : 'INACTIVE']
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) return [member.fullName, '—', '—', '—', '—', 'NO ACTIVE PLAN']
      throw error
    }
  }))
  return plans
}

function mapDashboard(data: RecordDto): DashboardData {
  const metricsObject = (data.metrics ?? data.summary ?? data) as RecordDto
  const rawMetrics = metricsObject && typeof metricsObject === 'object' ? Object.entries(metricsObject).filter(([, value]) => ['string', 'number'].includes(typeof value)).slice(0, 4) : []
  const metrics = rawMetrics.map(([key, value]) => [key.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()), money(value), 'Current'] as [string, string, string])
  const growth = arrayData(data.fund_growth ?? data.monthly_contributions, 'items').map((item) => ({ month: text(item.month ?? item.label), value: Number(item.value ?? item.amount ?? 0) }))
  return {
    metrics,
    fundGrowth: growth,
    fundHealth: arrayData(data.fund_health, 'items').map((item) => [text(item.label), money(item.value)]),
    recentContributions: arrayData(data.recent_contributions, 'items').map((item) => [nestedName(item.member ?? item.member_name), money(item.expected_amount), money(item.paid_amount), date(item.due_date), date(item.payment_date), text(item.payment_method), text(item.transaction_reference), text(item.status)]),
    recentRepayments: arrayData(data.recent_repayments, 'items').map((item) => [nestedName(item.member ?? item.member_name), text(item.loan_reference ?? item.loan_id), money(item.expected_amount), money(item.paid_amount), date(item.due_date), date(item.payment_date), text(item.status)]),
    nextRepayment: data.next_repayment && typeof data.next_repayment === 'object' ? { loan: text((data.next_repayment as RecordDto).loan_reference), amount: money((data.next_repayment as RecordDto).amount), dueDate: date((data.next_repayment as RecordDto).due_date) } : undefined,
  }
}
export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const { data } = await apiClient.get<ApiEnvelope<RecordDto>>('/admin/dashboard/')
  const value = data.data
  const fields: Array<[string, string, string]> = [
    ['Total Members', text(value.MembersTotal, '0'), `${text(value.MembersActive, '0')} active`],
    ['Inactive Members', text(value.MembersInactive, '0'), `${text(value.MembersSuspended, '0')} suspended`],
    ['Expected This Month', money(value.ExpectedMonth), 'Scheduled contributions'],
    ['Collected This Month', money(value.CollectedMonth), 'Approved contributions'],
    ['Outstanding', money(value.Outstanding), `${text(value.OverdueMembers, '0')} overdue members`],
    ['Pending Approvals', text(value.PendingApprovals, '0'), 'Contribution proofs'],
    ['Fund Balance', money(value.FundBalance), `${money(value.FundIn)} in / ${money(value.FundOut)} out`],
    ['Assistance Requests', text(value.AssistancePending, '0'), `${text(value.AssistanceApproved, '0')} approved`],
    ['Failed Notifications', text(value.NotificationsFailed, '0'), 'Requires attention'],
  ]
  return { metrics: fields }
}
export async function getMemberDashboard(): Promise<MemberDashboardData> {
  const { data } = await apiClient.get<ApiEnvelope<RecordDto>>('/dashboard/')
  const value = data.data
  return {
    metrics: [
      ['Total Contributed', money(value.total_contributed), 'Approved contributions'],
      ['Outstanding', money(value.outstanding_amount), `${text(value.overdue_count, '0')} overdue`],
      ['Contribution Rate', `${text(value.contribution_rate, '0')}%`, `${text(value.approved_count, '0')} approved`],
      ['Pending', text(value.pending_count, '0'), `${text(value.rejected_count, '0')} rejected`],
    ],
    nextDueDate: value.next_due_date ? date(value.next_due_date) : undefined,
    nextExpectedAmount: value.next_expected_amount !== undefined ? money(value.next_expected_amount) : undefined,
    planAmount: value.plan_amount !== undefined ? money(value.plan_amount) : undefined,
    planFrequency: value.plan_frequency ? text(value.plan_frequency) : undefined,
    reminderFrequency: value.reminder_frequency ? text(value.reminder_frequency) : undefined,
    planLateFee: value.plan_late_fee !== undefined ? `${text(value.plan_late_fee)}%` : undefined,
  }
}
export async function getMemberContributionPlan() {
  const dashboard = await getMemberDashboard()
  return [[dashboard.planAmount ?? '—', dashboard.planFrequency ?? '—', dashboard.nextExpectedAmount ?? '—', dashboard.nextDueDate ?? '—', dashboard.reminderFrequency ?? '—', dashboard.planLateFee ?? '—']]
}
export async function getReports() {
  const { data } = await apiClient.get<ApiEnvelope<RecordDto>>('/admin/fund/summary')
  return mapDashboard({ metrics: { total_in: data.data.total_in, total_out: data.data.total_out, balance: data.data.balance }, fund_growth: [] })
}
