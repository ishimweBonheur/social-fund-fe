import * as React from 'react'
import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-border/90 bg-card px-3 py-2 text-sm text-foreground shadow-[0_1px_2px_rgba(20,20,40,0.03)] transition-[border-color,box-shadow,background-color] dark:bg-muted/35 dark:shadow-inner',
        'placeholder:text-muted-foreground/70 hover:border-muted-foreground/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/10',
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-3 aria-[invalid=true]:ring-destructive/10 disabled:cursor-not-allowed disabled:bg-muted/60 disabled:text-muted-foreground read-only:bg-muted/45 read-only:text-muted-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
