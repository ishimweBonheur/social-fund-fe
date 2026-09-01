import { apiClient, type ApiEnvelope } from '@/services/api'

export type ContributionStatus =
  | 'UPCOMING'
  | 'DUE'
  | 'OVERDUE'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'FROZEN'
interface ContributionDto {
  ID: string
  UserID: string
  ContributionPlanID: string
  ExpectedAmount: string
  LateFeePercentage?: string
  LateFeeAmount: string
  OverdueAt?: string
  DueDate: string
  PaidAmount?: string
  PaymentDate?: string
  PaymentMethod?: string
  TransactionReference?: string
  ProofURL?: string
  ProofUploadedAt?: string
  Status: ContributionStatus
  RejectionReason?: string
  ApprovedBy?: string
  ApprovedAt?: string
  Notes?: string
  CreatedAt: string
  UpdatedAt: string
  member_name?: string
  member_email?: string
  total_due?: string
}
export interface Contribution {
  id: string
  userId: string
  memberName?: string
  memberEmail?: string
  expectedAmount: string
  lateFeeAmount: string
  totalDue: string
  dueDate: string
  paidAmount?: string
  paymentDate?: string
  paymentMethod?: string
  transactionReference?: string
  proofUrl?: string
  proofUploadedAt?: string
  status: ContributionStatus
  rejectionReason?: string
  notes?: string
}
const map = (value: ContributionDto): Contribution => ({
  id: value.ID,
  userId: value.UserID,
  memberName: value.member_name,
  memberEmail: value.member_email,
  expectedAmount: value.ExpectedAmount,
  lateFeeAmount: value.LateFeeAmount,
  totalDue: value.total_due ?? String(Number(value.ExpectedAmount) + Number(value.LateFeeAmount)),
  dueDate: value.DueDate,
  paidAmount: value.PaidAmount,
  paymentDate: value.PaymentDate,
  paymentMethod: value.PaymentMethod,
  transactionReference: value.TransactionReference,
  proofUrl: value.ProofURL,
  proofUploadedAt: value.ProofUploadedAt,
  status: value.Status,
  rejectionReason: value.RejectionReason,
  notes: value.Notes,
})
export async function listMyContributions() {
  const { data } = await apiClient.get<{ data: ContributionDto[] }>('/contributions/', {
    params: { limit: 100 },
  })
  return data.data.map(map)
}
export async function listPendingContributions(limit = 100) {
  const { data } = await apiClient.get<{ data: ContributionDto[] }>(
    '/admin/contributions/pending',
    { params: { limit } },
  )
  return data.data.map(map)
}
export async function listAdminContributions(
  query: {
    search?: string
    status?: ContributionStatus
    dueFrom?: string
    dueTo?: string
    method?: string
    proof?: string
    paymentState?: string
    lateFee?: string
    reference?: string
    paidFrom?: string
    paidTo?: string
    amountMin?: string
    amountMax?: string
    page?: number
    pageSize?: number
  } = {},
) {
  const limit = query.pageSize ?? 10
  const page = query.page ?? 1
  const { data } = await apiClient.get<{ data: ContributionDto[]; total: number }>(
    '/admin/contributions/',
    {
      params: {
        search: query.search || undefined,
        status: query.status,
        due_from: query.dueFrom,
        due_to: query.dueTo,
        method: query.method,
        proof: query.proof,
        payment_state: query.paymentState,
        late_fee: query.lateFee,
        reference: query.reference,
        paid_from: query.paidFrom,
        paid_to: query.paidTo,
        amount_min: query.amountMin,
        amount_max: query.amountMax,
        limit,
        offset: (page - 1) * limit,
      },
    },
  )
  return { items: data.data.map(map), total: data.total, page, pageSize: limit }
}
export async function getContribution(id: string) {
  const { data } = await apiClient.get<ApiEnvelope<ContributionDto>>(`/contributions/${id}`)
  return map(data.data)
}
export async function getOutstanding() {
  const { data } = await apiClient.get<
    ApiEnvelope<{ outstanding_amount: string; overdue_count: number }>
  >('/contributions/outstanding')
  return data.data
}
export async function submitContributionProof(
  id: string,
  input: { amount: string; paymentMethod: string; transactionReference: string; proof: File },
) {
  const body = new FormData()
  body.set('amount', input.amount)
  body.set('payment_method', input.paymentMethod)
  body.set('transaction_reference', input.transactionReference)
  body.set('proof', input.proof)
  await apiClient.post(`/contributions/${id}/proof`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
export async function getContributionProof(id: string) {
  const { data } = await apiClient.get<
    ApiEnvelope<{
      url?: string
      URL?: string
      proof_url?: string
      ProofURL?: string
      expires_in?: number
      ExpiresIn?: number
    }>
  >(`/contributions/${id}/proof`)
  const suppliedUrl = data.data.url ?? data.data.URL ?? data.data.proof_url ?? data.data.ProofURL
  if (!suppliedUrl) throw new Error('The uploaded proof file is not available.')

  const apiBase = new URL(apiClient.defaults.baseURL || '/api/v1', window.location.origin)
  const proofUrl = new URL(suppliedUrl, apiBase.origin).toString()
  const suppliedProofUrl = new URL(proofUrl)
  const isManagedUpload = suppliedProofUrl.pathname.startsWith('/uploads/')

  // Signed storage links should be opened directly. Fetching them first can be
  // rejected by the storage provider's CORS policy even when the link is valid.
  if (suppliedProofUrl.origin !== apiBase.origin && !isManagedUpload) {
    return {
      url: proofUrl,
      expiresIn: data.data.expires_in ?? data.data.ExpiresIn,
      objectUrl: false,
    }
  }

  const candidates = [proofUrl]
  const apiPath = apiBase.pathname.replace(/\/$/, '')
  const suppliedPath = suppliedProofUrl.pathname
  if (!suppliedPath.startsWith(`${apiPath}/`)) {
    candidates.push(
      new URL(`${apiPath}/${suppliedPath.replace(/^\//, '')}`, suppliedProofUrl.origin).toString(),
    )
  }

  for (const candidate of candidates) {
    try {
      const proof = await apiClient.get<Blob>(candidate, { responseType: 'blob' })
      if (!proof.data.type.includes('json')) {
        return {
          url: URL.createObjectURL(proof.data),
          expiresIn: data.data.expires_in ?? data.data.ExpiresIn,
          objectUrl: true,
        }
      }
    } catch {
      // Some backends expose uploaded files at the API prefix while others use
      // the server root. Continue through the compatible candidates.
    }
  }

  throw new Error(
    'The payment proof file could not be found on the server. Please upload it again.',
  )
}
export async function approveContribution(id: string, notes?: string) {
  await apiClient.post(`/contributions/${id}/approve`, { notes: notes || undefined })
}
export async function rejectContribution(id: string, reason: string) {
  await apiClient.post(`/contributions/${id}/reject`, { reason })
}
export async function validateContributionReviewToken(
  id: string,
  token: string,
  action: 'approve' | 'reject',
) {
  const { data } = await apiClient.post<
    ApiEnvelope<{
      valid: boolean
      action: string
      id: string
      member_name: string
      ExpectedAmount: string
      LateFeeAmount: string
      PaidAmount?: string
      PaymentMethod?: string
      TransactionReference?: string
    }>
  >(`/contributions/${id}/review-token/validate`, { token, action })
  return data.data
}
