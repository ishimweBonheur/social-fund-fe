import { getContributionPlans } from '@/services/fundService'
import DataPage from '@/pages/shared/DataPage'

export default function MemberPlanPage() {
  return (
    <DataPage 
      title="My Contribution Plan" 
      description="Your current recurring contribution commitment" 
      columns={['Member', 'Amount', 'Frequency', 'Start Date', 'End Date', 'Next Due Date', 'Status']} 
      loader={getContributionPlans}
    />
  )
}
