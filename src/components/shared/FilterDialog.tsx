import { useState, type ReactNode } from 'react'
import { Filter, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function FilterDialog({
  children,
  activeCount = 0,
  onReset,
  onApply,
  title = 'Filter records',
  description = 'Narrow the table using the options below.',
}: {
  children: ReactNode
  activeCount?: number
  onReset: () => void
  onApply?: () => void
  title?: string
  description?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative"
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader className="flex flex-row items-start gap-3 border-b-0 pb-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </DialogHeader>
          <div className="grid max-h-[60vh] grid-cols-1 gap-x-5 gap-y-4 overflow-y-auto px-6 pb-6 sm:grid-cols-2 [&>div]:min-w-0 [&_input]:h-10 [&_input]:w-full [&_[role=combobox]]:h-10 [&_[role=combobox]]:w-full">
            {children}
          </div>
          <DialogFooter className="bg-muted/30">
            {activeCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={onReset}
                className="sm:mr-auto"
              >
                <RotateCcw className="h-4 w-4" />
                Reset all
              </Button>
            )}
            <DialogClose asChild>
              <Button
                type="button"
                onClick={onApply}
              >
                Apply filters
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
