import { getContributions } from '@/services/fundService'
import DataPage from '@/pages/shared/DataPage'

export default function ContributionsPage() {
  return (
    <DataPage 
      title="Contributions" 
      description="Track expected and received member contributions" 
      action="Record Contribution" 
      columns={['Member', 'Expected', 'Paid', 'Due Date', 'Payment Date', 'Method', 'Reference', 'Status']} 
      loader={getContributions}
    />
  )
}
