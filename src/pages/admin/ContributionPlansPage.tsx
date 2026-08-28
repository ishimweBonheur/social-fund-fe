import { getContributionPlans } from '@/services/fundService'
import DataPage from '@/pages/shared/DataPage'

export default function ContributionPlansPage() {
  return (
    <DataPage 
      title="Contribution Plans" 
      description="Recurring contribution commitments for all members" 
      action="Create Plan" 
      columns={['Member', 'Amount', 'Frequency', 'Start Date', 'End Date', 'Next Due Date', 'Status']} 
      loader={getContributionPlans}
    />
  )
}
