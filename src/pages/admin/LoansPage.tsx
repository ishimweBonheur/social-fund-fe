import { getLoans } from '@/services/fundService'
import DataPage from '@/pages/shared/DataPage'

export default function LoansPage() {
  return (
    <DataPage 
      title="Loans" 
      description="Review the fund's complete loan portfolio" 
      action="New Loan" 
      columns={['Member', 'Requested Amount', 'Requested Date', 'Approved Amount', 'Outstanding', 'Status', 'Approved By']} 
      loader={getLoans}
    />
  )
}
