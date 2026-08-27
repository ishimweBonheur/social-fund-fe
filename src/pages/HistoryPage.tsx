import { Clock } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'

export function HistoryPage() {
  const { history } = useApp()

  return (
    <div>
      <PageHeader title="History" description="Activity log of all account actions" />

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {history.map((entry) => (
            <div key={entry.id} className="flex items-start gap-4 p-5 transition-colors hover:bg-muted/40">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F9D58]/10">
                <Clock className="h-5 w-5 text-[#0F9D58]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{entry.action}</p>
                <p className="text-sm text-muted-foreground">{entry.detail}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{entry.date}</p>
                <p>{entry.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
