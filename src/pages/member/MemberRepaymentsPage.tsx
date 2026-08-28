import EmptyState from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'

export default function MemberRepaymentsPage() {
  return <div><PageHeader title="My Repayments" description="Loan repayment information" /><EmptyState title="Repayments are not available" description="The current backend does not expose a member repayment endpoint. Assistance payments are managed by administrators through the fund ledger." /></div>
}
