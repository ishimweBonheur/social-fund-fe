import { CalendarDays, HandCoins, Users, WalletCards } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardMetrics({ items }: { items: Array<[string, string, string]> }) {
  const icons = [WalletCards, Users, HandCoins, CalendarDays]

  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, value, detail], index) => {
        const Icon = icons[index % icons.length]
        return (
          <Card
            key={label}
            className="min-w-0"
          >
            <CardContent className="flex min-w-0 items-start justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="text-sm font-normal text-muted-foreground">{label}</p>
                <p className="mt-1 break-words text-2xl font-semibold tracking-tight">{value}</p>
                <p className="mt-1 text-sm font-normal text-muted-foreground">{detail}</p>
              </div>
              <span className="shrink-0 rounded-xl bg-accent p-2 text-primary">
                <Icon className="h-4 w-4" />
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
