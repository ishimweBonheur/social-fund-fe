import { AmountOfCreditCard } from './AmountOfCreditCard'
import { CreditCardWidget } from './CreditCardWidget'
import { EngagementChart } from './EngagementChart'
import { MandatoryPaymentsCard } from './MandatoryPaymentsCard'
import { PaymentGoalChart } from './PaymentGoalChart'
import { PaymentHistoryTable } from './PaymentHistoryTable'
import { WeeklyRevenueCard } from './WeeklyRevenueCard'
import { WelcomeSection } from './WelcomeSection'

export function DashboardGrid() {
  return (
    <div className="space-y-3">
      <WelcomeSection />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12">
        <div className="flex flex-col gap-3 md:col-span-1 lg:col-span-3">
          <CreditCardWidget />
          <WeeklyRevenueCard />
        </div>

        <div className="md:col-span-1 lg:col-span-5">
          <EngagementChart />
        </div>

        <div className="flex flex-col gap-3 md:col-span-2 lg:col-span-4">
          <PaymentGoalChart />
          <AmountOfCreditCard />
        </div>

        <div className="md:col-span-2 lg:col-span-8">
          <PaymentHistoryTable />
        </div>
        <div className="md:col-span-2 lg:col-span-4">
          <MandatoryPaymentsCard />
        </div>
      </div>
    </div>
  )
}
