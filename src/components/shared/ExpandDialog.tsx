import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Maximize2 } from 'lucide-react'

interface ExpandDialogProps {
  title: string
  description?: string
  children: ReactNode
}

export function ExpandDialog({ title, description, children }: ExpandDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Maximize2 className="h-3 w-3" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xl gap-3 p-4">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          {description && <DialogDescription className="text-xs">{description}</DialogDescription>}
        </DialogHeader>
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  )
}
