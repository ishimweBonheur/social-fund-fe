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
        danger.has(value) && 'border-[#213448]/25 bg-[#213448]/10 text-[#213448] dark:border-[#94B4C1]/35 dark:bg-[#94B4C1]/10 dark:text-[#EAE0CF]',
        warning.has(value) && 'border-[#547792]/30 bg-[#94B4C1]/25 text-[#213448] dark:border-[#94B4C1]/35 dark:bg-[#547792]/30 dark:text-[#EAE0CF]',
        success.has(value) && 'border-[#94B4C1]/60 bg-[#94B4C1]/30 text-[#213448] dark:border-[#94B4C1]/45 dark:bg-[#94B4C1]/15 dark:text-[#EAE0CF]',
        className,
      )}
    >
      {humanizeValue(value)}
    </Badge>
  )
}
