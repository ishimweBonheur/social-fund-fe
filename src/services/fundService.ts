import { apiClient, type ApiEnvelope } from '@/services/api'

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
export interface Approval { id: string; type: string; detail: string }

const text = (value: unknown, fallback = '—') => value === null || value === undefined || value === '' ? fallback : String(value)
const nestedName = (value: unknown) => typeof value === 'object' && value !== null ? text((value as RecordDto).full_name ?? (value as RecordDto).name) : text(value)
const money = (value: unknown) => typeof value === 'number' ? `RWF ${value.toLocaleString()}` : text(value)
const date = (value: unknown) => value ? new Date(String(value)).toLocaleDateString() : '—'
const arrayData = (value: unknown, key: string): RecordDto[] => {
  if (Array.isArray(value)) return value as RecordDto[]
  if (typeof value === 'object' && value !== null && Array.isArray((value as RecordDto)[key])) return (value as RecordDto)[key] as RecordDto[]
  return []
}
async function collection(path: string, key: string) { const { data } = await apiClient.get<ApiEnvelope<unknown>>(path); return arrayData(data.data, key) }

export async function getContributionPlans() {
  const rows = await collection('/contribution-plans', 'contribution_plans')
  return rows.map((item) => [nestedName(item.member ?? item.member_name), money(item.amount), text(item.frequency), date(item.start_date), date(item.end_date), date(item.next_due_date), text(item.status)])
}
export async function getContributions() {
  const rows = await collection('/contributions', 'contributions')
  return rows.map((item) => [nestedName(item.member ?? item.member_name), money(item.expected_amount), money(item.paid_amount), date(item.due_date), date(item.payment_date), text(item.payment_method), text(item.transaction_reference), text(item.status)])
}
export async function getLoans() {
  const rows = await collection('/loans', 'loans')
  return rows.map((item) => [nestedName(item.member ?? item.member_name), money(item.loan_amount ?? item.requested_amount), date(item.requested_date ?? item.created_at), money(item.approved_amount), money(item.outstanding_balance), text(item.status), nestedName(item.approved_by)])
}
export async function getRepayments() {
  const rows = await collection('/repayments', 'repayments')
  return rows.map((item) => [nestedName(item.member ?? item.member_name), text(item.loan_reference ?? item.loan_id), money(item.expected_amount), money(item.paid_amount), date(item.due_date), date(item.payment_date), text(item.status)])
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
export async function getAdminDashboard() { const { data } = await apiClient.get<ApiEnvelope<RecordDto>>('/admin/dashboard'); return mapDashboard(data.data) }
export async function getMemberDashboard() { const { data } = await apiClient.get<ApiEnvelope<RecordDto>>('/member/dashboard'); return mapDashboard(data.data) }
export async function getReports() { const { data } = await apiClient.get<ApiEnvelope<RecordDto>>('/admin/reports'); return mapDashboard(data.data) }
export async function getApprovals(): Promise<Approval[]> {
  const rows = await collection('/approvals', 'approvals')
  return rows.map((item) => ({ id: text(item.id), type: text(item.type ?? item.request_type), detail: text(item.detail ?? item.description) }))
}
export async function approveRequest(id: string) { await apiClient.post(`/approvals/${id}/approve`) }
export async function getAuditLogs() {
  const rows = await collection('/audit-logs', 'audit_logs')
  return rows.map((item) => [date(item.created_at), nestedName(item.administrator ?? item.user), text(item.action), text(item.resource), text(item.ip_address)])
}
