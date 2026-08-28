import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

export default function EmptyState({ title = 'No records found', description = 'There are currently no records to display.', action }: { title?: string; description?: string; action?: ReactNode }) {
  return <div className="grid place-items-center rounded-2xl border bg-card px-4 py-12 text-center"><span className="mb-3 rounded-xl bg-muted p-3 text-muted-foreground"><Inbox className="h-5 w-5" /></span><p className="text-sm font-semibold">{title}</p><p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>{action && <div className="mt-4">{action}</div>}</div>
}
