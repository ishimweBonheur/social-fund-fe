import axios from 'axios'
import { apiClient, type ApiEnvelope } from '@/services/api'
import { listMembers } from '@/services/memberService'
import type { ContributionFrequency, ReminderFrequency } from '@/types/app'

interface PlanDto { ID: string; UserID: string; Amount: string; Frequency: ContributionFrequency; IntervalValue?: number; DueDay?: number; StartDate: string; EndDate?: string; ReminderEnabled: boolean; ReminderFrequency?: ReminderFrequency; ReminderInterval?: number; LateFeeEnabled: boolean; LateFeePercentage?: string; GracePeriodDays: number; IsActive: boolean; CreatedAt: string; UpdatedAt: string }
export interface ContributionPlan { id: string; userId: string; memberName: string; amount: string; frequency: ContributionFrequency; intervalValue?: number; dueDay?: number; startDate: string; endDate?: string; reminderEnabled: boolean; reminderFrequency?: ReminderFrequency; reminderInterval?: number; lateFeeEnabled: boolean; lateFeePercentage?: string; gracePeriodDays: number; isActive: boolean }
export type ContributionPlanInput = Omit<ContributionPlan, 'id' | 'userId' | 'memberName' | 'startDate' | 'endDate' | 'isActive'>
const map = (dto: PlanDto, memberName: string): ContributionPlan => ({ id: dto.ID, userId: dto.UserID, memberName, amount: dto.Amount, frequency: dto.Frequency, intervalValue: dto.IntervalValue, dueDay: dto.DueDay, startDate: dto.StartDate, endDate: dto.EndDate, reminderEnabled: dto.ReminderEnabled, reminderFrequency: dto.ReminderFrequency, reminderInterval: dto.ReminderInterval, lateFeeEnabled: dto.LateFeeEnabled, lateFeePercentage: dto.LateFeePercentage, gracePeriodDays: dto.GracePeriodDays, isActive: dto.IsActive })
export async function listContributionPlans() {
  const { members } = await listMembers({ pageSize: 100 })
  const plans = await Promise.all(members.map(async (member) => {
    try { const { data } = await apiClient.get<PlanDto>(`/admin/contribution-plans/users/${member.id}/active`); return map(data, member.fullName) }
    catch (error) { if (axios.isAxiosError(error) && error.response?.status === 404) return undefined; throw error }
  }))
  return plans.filter((plan): plan is ContributionPlan => Boolean(plan))
}
export async function updateContributionPlan(plan: ContributionPlan, input: ContributionPlanInput) {
  const payload = { Amount: input.amount, Frequency: input.frequency, IntervalValue: input.frequency === 'CUSTOM' ? input.intervalValue : null, DueDay: input.frequency === 'MONTHLY' ? input.dueDay : null, ReminderEnabled: input.reminderEnabled, ReminderFrequency: input.reminderEnabled ? input.reminderFrequency : null, ReminderInterval: input.reminderEnabled && input.reminderFrequency === 'CUSTOM' ? input.reminderInterval : null, LateFeeEnabled: input.lateFeeEnabled, LateFeePercentage: input.lateFeeEnabled ? input.lateFeePercentage : null, GracePeriodDays: input.gracePeriodDays }
  const { data } = await apiClient.patch<ApiEnvelope<PlanDto>>(`/admin/contribution-plans/${plan.id}`, payload)
  return map(data.data, plan.memberName)
}
