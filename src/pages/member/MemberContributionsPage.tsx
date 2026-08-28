import { getContributions } from '@/services/fundService'
import DataPage from '@/pages/shared/DataPage'

export default function MemberContributionsPage() {
  return (
    <DataPage 
      title="My Contributions" 
      description="Your complete contribution history" 
      columns={['Member', 'Expected', 'Paid', 'Due Date', 'Payment Date', 'Method', 'Reference', 'Status']} 
      loader={getContributions}
    />
  )
}
