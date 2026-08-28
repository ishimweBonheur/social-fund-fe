import { getLoans } from '@/services/fundService'
import DataPage from '@/pages/shared/DataPage'

export default function MemberLoansPage() {
  return (
    <DataPage 
      title="My Loans" 
      description="Your loan applications and balances" 
      action="Request Loan" 
      columns={['Member', 'Requested Amount', 'Requested Date', 'Approved Amount', 'Outstanding', 'Status', 'Approved By']} 
      loader={getLoans}
    />
  )
}
