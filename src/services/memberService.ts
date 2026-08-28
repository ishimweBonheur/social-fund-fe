import { apiClient, type ApiEnvelope } from '@/services/api'
import type { Member, MemberInput, MemberStatus, UserRole } from '@/types/app'

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
interface MemberListData { members: MemberDto[]; total?: number; page?: number; page_size?: number }
export interface MemberQuery { search?: string; status?: MemberStatus; page?: number; pageSize?: number }
export interface MemberList { members: Member[]; total: number; page: number; pageSize: number }

const mapMember = (member: MemberDto): Member => ({
  id: member.id, fullName: member.full_name, email: member.email, phone: member.phone || '', role: member.role || 'MEMBER',
  status: member.status, googleId: member.google_id, lastLoginAt: member.last_login_at, createdAt: member.created_at, updatedAt: member.updated_at,
})
const payload = (input: MemberInput) => ({ full_name: input.fullName.trim(), email: input.email.trim().toLowerCase(), phone: input.phone.trim(), ...(input.status && { status: input.status }) })

export async function listMembers(query: MemberQuery = {}): Promise<MemberList> {
  const { data: response } = await apiClient.get<ApiEnvelope<MemberListData | MemberDto[]>>('/members', { params: { search: query.search || undefined, status: query.status, page: query.page, page_size: query.pageSize } })
  const data = response.data
  const records = Array.isArray(data) ? data : data.members
  return { members: records.map(mapMember), total: Array.isArray(data) ? records.length : data.total ?? records.length, page: Array.isArray(data) ? 1 : data.page ?? 1, pageSize: Array.isArray(data) ? records.length : data.page_size ?? records.length }
}
export async function getMember(id: string) { const { data } = await apiClient.get<ApiEnvelope<MemberDto>>(`/members/${id}`); return mapMember(data.data) }
export async function createMember(input: MemberInput) { const { data } = await apiClient.post<ApiEnvelope<MemberDto>>('/members', payload(input)); return mapMember(data.data) }
export async function updateMember(id: string, input: MemberInput) { const { data } = await apiClient.put<ApiEnvelope<MemberDto>>(`/members/${id}`, payload(input)); return mapMember(data.data) }
export async function updateMemberStatus(id: string, status: MemberStatus) { const { data } = await apiClient.patch<ApiEnvelope<MemberDto>>(`/members/${id}/status`, { status }); return mapMember(data.data) }
export async function deleteMember(id: string) { await apiClient.delete(`/members/${id}`) }
