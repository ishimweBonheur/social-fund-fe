import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const danger = new Set(['OVERDUE', 'REJECTED', 'CANCELLED', 'SUSPENDED', 'FAILED', 'VOID'])
const warning = new Set(['PENDING', 'INACTIVE', 'DUE', 'PARTIALLY_PAID', 'UPCOMING'])
const success = new Set(['ACTIVE', 'PAID', 'APPROVED', 'COMPLETED', 'READ'])

export default function StatusBadge({ status, className }: { status: string; className?: string }) {
  const value = status.toUpperCase()
  return (
    <Badge
      variant="outline"
      className={cn(
        danger.has(value) && 'bg-red-50 text-red-700',
        warning.has(value) && 'bg-amber-50 text-amber-700',
        success.has(value) && 'bg-emerald-50 text-emerald-700',
        className,
      )}
    >
      {value.replaceAll('_', ' ')}
    </Badge>
  )
}
