import { apiClient, type ApiEnvelope } from '@/services/api'

export interface FundSummary {
  totalIn: string
  totalOut: string
  balance: string
}
export interface MemberFundSummary {
  totalContributed: string
  netPosition: string
}
interface TransactionDto {
  id: string
  user_id: string
  user_name?: string
  type: string
  direction: string
  amount: string
  status: string
  payment_method?: string
  contribution_id?: string
  reference?: string
  description?: string
  recorded_by: string
  created_at: string
}
export interface FundTransaction {
  id: string
  userId: string
  userName?: string
  type: string
  direction: string
  amount: string
  status: string
  paymentMethod?: string
  contributionId?: string
  reference?: string
  description?: string
  recordedBy: string
  createdAt: string
}
export interface TransactionFilters {
  userId?: string
  type?: string
  direction?: string
  dateFrom?: string
  dateTo?: string
}

const params = (filters: TransactionFilters) => ({
  user_id: filters.userId,
  type: filters.type,
  direction: filters.direction,
  date_from: filters.dateFrom,
  date_to: filters.dateTo,
})
const mapTransaction = (value: TransactionDto): FundTransaction => ({
  id: value.id,
  userId: value.user_id,
  userName: value.user_name,
  type: value.type,
  direction: value.direction,
  amount: value.amount,
  status: value.status,
  paymentMethod: value.payment_method,
  contributionId: value.contribution_id,
  reference: value.reference,
  description: value.description,
  recordedBy: value.recorded_by,
  createdAt: value.created_at,
})

export async function getFundSummary(): Promise<FundSummary> {
  const { data } =
    await apiClient.get<ApiEnvelope<{ total_in: string; total_out: string; balance: string }>>(
      '/admin/fund/summary',
    )
  return { totalIn: data.data.total_in, totalOut: data.data.total_out, balance: data.data.balance }
}
export async function getMemberFundSummary(): Promise<MemberFundSummary> {
  const { data } =
    await apiClient.get<ApiEnvelope<{ total_contributed: string; net_position: string }>>(
      '/fund/summary',
    )
  return {
    totalContributed: data.data.total_contributed,
    netPosition: data.data.net_position,
  }
}
export interface TransactionPage {
  items: FundTransaction[]
  total: number
  limit: number
  offset: number
}
async function listTransactions(
  path: string,
  filters: TransactionFilters,
  page: number,
  pageSize: number,
): Promise<TransactionPage> {
  const { data } = await apiClient.get<{
    data: TransactionDto[]
    total: number
    limit: number
    offset: number
  }>(path, { params: { ...params(filters), limit: pageSize, offset: (page - 1) * pageSize } })
  return {
    items: data.data.map(mapTransaction),
    total: data.total,
    limit: data.limit,
    offset: data.offset,
  }
}
export async function listFundTransactions(
  filters: TransactionFilters = {},
  page = 1,
  pageSize = 10,
) {
  return listTransactions('/admin/fund/transactions', filters, page, pageSize)
}
export async function listMyFundTransactions(
  filters: TransactionFilters = {},
  page = 1,
  pageSize = 10,
) {
  return listTransactions('/fund/transactions', filters, page, pageSize)
}
export async function downloadStatement(admin: boolean, filters: TransactionFilters = {}) {
  const response = await apiClient.get(
    admin ? '/admin/fund/statement.pdf' : '/fund/statement.pdf',
    { params: params(filters), responseType: 'blob' },
  )
  const url = URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = url
  link.download = `transaction-statement-${new Date().toISOString().slice(0, 10)}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
