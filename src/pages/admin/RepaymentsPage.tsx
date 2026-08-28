import { getRepayments } from '@/services/fundService'
import DataPage from '@/pages/shared/DataPage'

export default function RepaymentsPage() {
  return (
    <DataPage 
      title="Loan Repayments" 
      description="Monitor scheduled and completed repayments" 
      columns={['Member', 'Loan', 'Expected', 'Paid', 'Due Date', 'Payment Date', 'Status']} 
      loader={getRepayments}
    />
  )
}
