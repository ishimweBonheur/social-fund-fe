import { getRepayments } from '@/services/fundService'
import DataPage from '@/pages/shared/DataPage'

export default function MemberRepaymentsPage() {
  return (
    <DataPage 
      title="My Repayments" 
      description="Your upcoming and completed loan repayments" 
      columns={['Member', 'Loan', 'Expected', 'Paid', 'Due Date', 'Payment Date', 'Status']} 
      loader={getRepayments}
    />
  )
}
