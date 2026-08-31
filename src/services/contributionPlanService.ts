import { apiClient, type ApiEnvelope } from '@/services/api'
import type { ContributionFrequency, ReminderFrequency } from '@/types/app'

interface PlanDto {
  ID: string
  UserID: string
  Amount: string
  Frequency: ContributionFrequency
  IntervalValue?: number
  DueDay?: number
  StartDate: string
  EndDate?: string
  ReminderEnabled: boolean
  ReminderFrequency?: ReminderFrequency
  ReminderInterval?: number
  LateFeeEnabled: boolean
  LateFeePercentage?: string
  GracePeriodDays: number
  IsActive: boolean
  CreatedAt: string
  UpdatedAt: string
}
export interface ContributionPlan {
  id: string
  userId: string
  memberName: string
  amount: string
  frequency: ContributionFrequency
  intervalValue?: number
  dueDay?: number
  startDate: string
  endDate?: string
  reminderEnabled: boolean
  reminderFrequency?: ReminderFrequency
  reminderInterval?: number
  lateFeeEnabled: boolean
  lateFeePercentage?: string
  gracePeriodDays: number
  isActive: boolean
}
export type ContributionPlanInput = Omit<
  ContributionPlan,
  'id' | 'userId' | 'memberName' | 'startDate' | 'endDate' | 'isActive'
>
const map = (dto: PlanDto, memberName: string): ContributionPlan => ({
  id: dto.ID,
  userId: dto.UserID,
  memberName,
  amount: dto.Amount,
  frequency: dto.Frequency,
  intervalValue: dto.IntervalValue,
  dueDay: dto.DueDay,
  startDate: dto.StartDate,
  endDate: dto.EndDate,
  reminderEnabled: dto.ReminderEnabled,
  reminderFrequency: dto.ReminderFrequency,
  reminderInterval: dto.ReminderInterval,
  lateFeeEnabled: dto.LateFeeEnabled,
  lateFeePercentage: dto.LateFeePercentage,
  gracePeriodDays: dto.GracePeriodDays,
  isActive: dto.IsActive,
})
interface PlanListDto extends PlanDto {
  member_name: string
}
export async function listContributionPlansPage(
  query: {
    search?: string
    active?: boolean
    frequency?: string
    reminderEnabled?: boolean
    lateFeeEnabled?: boolean
    dueDay?: string
    amountMin?: string
    amountMax?: string
    page?: number
    pageSize?: number
  } = {},
) {
  const limit = query.pageSize ?? 10
  const page = query.page ?? 1
  const { data } = await apiClient.get<{ data: PlanListDto[]; total: number }>(
    '/contribution-plans/',
    {
      params: {
        search: query.search || undefined,
        active: query.active,
        frequency: query.frequency,
        reminder_enabled: query.reminderEnabled,
        late_fee_enabled: query.lateFeeEnabled,
        due_day: query.dueDay || undefined,
        amount_min: query.amountMin || undefined,
        amount_max: query.amountMax || undefined,
        limit,
        offset: (page - 1) * limit,
      },
    },
  )
  return {
    items: data.data.map((item) => map(item, item.member_name)),
    total: data.total,
    page,
    pageSize: limit,
  }
}
export async function listContributionPlans() {
  return (await listContributionPlansPage({ pageSize: 100 })).items
}
export async function updateContributionPlan(plan: ContributionPlan, input: ContributionPlanInput) {
  const payload = {
    Amount: input.amount,
    Frequency: input.frequency,
    IntervalValue: input.frequency === 'CUSTOM' ? input.intervalValue : null,
    DueDay: input.frequency === 'MONTHLY' ? input.dueDay : null,
    ReminderEnabled: input.reminderEnabled,
    ReminderFrequency: input.reminderEnabled ? input.reminderFrequency : null,
    ReminderInterval:
      input.reminderEnabled && input.reminderFrequency === 'CUSTOM' ? input.reminderInterval : null,
    LateFeeEnabled: input.lateFeeEnabled,
    LateFeePercentage: input.lateFeeEnabled ? input.lateFeePercentage : null,
    GracePeriodDays: input.gracePeriodDays,
  }
  const { data } = await apiClient.patch<ApiEnvelope<PlanDto>>(
    `/contribution-plans/${plan.id}`,
    payload,
  )
  return map(data.data, plan.memberName)
}
