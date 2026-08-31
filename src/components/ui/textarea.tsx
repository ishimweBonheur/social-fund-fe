import * as React from 'react'
import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-24 w-full rounded-lg border border-border/90 bg-card px-3 py-2.5 text-sm leading-6 text-foreground shadow-[0_1px_2px_rgba(20,20,40,0.03)] outline-none transition-[border-color,box-shadow]',
        'placeholder:text-muted-foreground/65 hover:border-muted-foreground/40 focus:border-primary focus:ring-3 focus:ring-primary/10 disabled:bg-muted/60',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'

export { Textarea }
