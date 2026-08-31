import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { humanizeValue } from '@/lib/utils'

const danger = new Set(['OVERDUE', 'REJECTED', 'CANCELLED', 'SUSPENDED', 'FAILED', 'VOID'])
const warning = new Set(['PENDING', 'INACTIVE', 'DUE', 'PARTIALLY_PAID', 'UPCOMING'])
const success = new Set(['ACTIVE', 'PAID', 'APPROVED', 'COMPLETED', 'READ'])

export default function StatusBadge({ status, className }: { status: string; className?: string }) {
  const value = status.toUpperCase()
  return (
    <Badge
      variant="outline"
      className={cn(
        danger.has(value) &&
          'border-red-200/70 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300',
        warning.has(value) &&
          'border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300',
        success.has(value) &&
          'border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300',
        className,
      )}
    >
      {humanizeValue(value)}
    </Badge>
  )
}
