import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-24 w-full rounded-lg bg-card px-3 py-2.5 text-sm leading-6 text-foreground shadow-[0_2px_10px_rgba(33,52,72,0.10)] outline-none transition-shadow',
        'placeholder:text-muted-foreground/65 focus:ring-3 focus:ring-primary/20 disabled:bg-muted/60',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export { Textarea }
