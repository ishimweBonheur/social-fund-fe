import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg bg-card px-3 py-2 text-sm text-foreground shadow-[0_2px_10px_rgba(33,52,72,0.10)] transition-[box-shadow,background-color] dark:bg-muted/35 dark:shadow-inner',
        'placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20',
        'aria-[invalid=true]:ring-3 aria-[invalid=true]:ring-destructive/20 disabled:cursor-not-allowed disabled:bg-muted/60 disabled:text-muted-foreground read-only:bg-muted/45 read-only:text-muted-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
