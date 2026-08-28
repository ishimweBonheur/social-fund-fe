import { getMemberContributionPlan } from '@/services/fundService'
import DataPage from '@/pages/shared/DataPage'

export default function MemberPlanPage() {
  return (
    <DataPage 
      title="My Contribution Plan" 
      description="Your current recurring contribution commitment" 
      searchable={false}
      columns={['Plan Amount', 'Frequency', 'Next Amount', 'Next Due Date', 'Reminder', 'Late Fee']}
      loader={getMemberContributionPlan}
    />
  )
}
