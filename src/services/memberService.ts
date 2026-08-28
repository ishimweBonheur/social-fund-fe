import { apiClient, type ApiEnvelope } from '@/services/api'
import type { Member, MemberInput, MemberStatus, MemberUpdateInput, UserRole } from '@/types/app'

interface MemberDto {
  id: string
  full_name: string
  email: string
  phone?: string
  role?: UserRole
  status: MemberStatus
  google_id?: string | null
  last_login_at?: string | null
  created_at: string
  updated_at?: string
}
export interface MemberQuery { search?: string; status?: MemberStatus; page?: number; pageSize?: number }
export interface MemberList { members: Member[]; total: number; page: number; pageSize: number }

const mapMember = (member: MemberDto): Member => ({
  id: member.id, fullName: member.full_name, email: member.email, phone: member.phone || '', role: member.role || 'MEMBER',
  status: member.status, googleId: member.google_id, lastLoginAt: member.last_login_at, createdAt: member.created_at, updatedAt: member.updated_at,
})
const updatePayload = (input: MemberUpdateInput) => ({ full_name: input.fullName.trim(), email: input.email.trim().toLowerCase(), phone: input.phone.trim() })
const createPayload = (input: MemberInput) => ({
  ...updatePayload(input),
  contribution: {
    amount: input.contribution.amount,
    frequency: input.contribution.frequency,
    ...(input.contribution.frequency === 'CUSTOM' && { interval_value: input.contribution.intervalValue }),
    ...(input.contribution.frequency === 'MONTHLY' && { due_day: input.contribution.dueDay }),
    start_date: input.contribution.startDate,
    late_fee_enabled: input.contribution.lateFeeEnabled,
    ...(input.contribution.lateFeeEnabled && { late_fee_percentage: input.contribution.lateFeePercentage }),
    grace_period_days: input.contribution.gracePeriodDays,
  },
  reminder: {
    enabled: input.reminder.enabled,
    frequency: input.reminder.frequency,
    ...(input.reminder.enabled && input.reminder.frequency === 'CUSTOM' && { interval: input.reminder.interval }),
  },
})

export async function listMembers(query: MemberQuery = {}): Promise<MemberList> {
  const limit = query.pageSize ?? 20
  const page = query.page ?? 1
  const { data: response } = await apiClient.get<{ data: MemberDto[]; limit: number; offset: number }>('/admin/users/', { params: { search: query.search || undefined, status: query.status, role: 'MEMBER', limit, offset: (page - 1) * limit } })
  return { members: response.data.map(mapMember), total: response.data.length, page, pageSize: response.limit || limit }
}
export async function getMember(id: string) { const { data } = await apiClient.get<MemberDto>(`/admin/users/${id}`); return mapMember(data) }
export async function createMember(input: MemberInput) { const { data } = await apiClient.post<MemberDto>('/admin/users/', createPayload(input)); return mapMember(data) }
export async function updateMember(id: string, input: MemberUpdateInput) { const { data } = await apiClient.patch<ApiEnvelope<MemberDto>>(`/admin/users/${id}`, updatePayload(input)); return mapMember(data.data) }
export async function updateMemberStatus(id: string, status: MemberStatus) {
  if (status === 'INACTIVE') throw new Error('INACTIVE status cannot be set through the backend status endpoints')
  const action = status === 'SUSPENDED' ? 'suspend' : 'activate'
  const { data } = await apiClient.post<ApiEnvelope<{ id: string; status: MemberStatus }>>(`/admin/users/${id}/${action}`)
  return data.data
}
