import * as React from 'react'
import { cn } from '@/lib/utils'

const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<'label'>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'mb-2 block text-xs font-semibold leading-none tracking-[0.01em] text-foreground',
        className,
      )}
      {...props}
    />
  ),
)
Label.displayName = 'Label'

export { Label }
