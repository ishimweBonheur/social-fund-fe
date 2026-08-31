import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import DetailRow from '@/components/shared/DetailRow'
import StatusBadge from '@/components/shared/StatusBadge'

export interface DetailItem {
  label: string
  value: string
  status?: boolean
}
export default function DetailDialog({
  open,
  onOpenChange,
  title,
  description,
  items,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  items: DetailItem[]
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader className="flex flex-row items-start gap-3 border-b-0 pb-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 pt-0.5">
            <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
            <DialogDescription>
              {description || 'Review the complete information for this record.'}
            </DialogDescription>
          </div>
        </DialogHeader>
        <dl className="grid max-h-[60vh] grid-cols-1 gap-2 overflow-y-auto px-6 pb-6 sm:grid-cols-2">
          {items.map((item) => (
            <DetailRow
              key={item.label}
              label={item.label}
              value={item.status ? <StatusBadge status={item.value} /> : item.value}
            />
          ))}
        </dl>
        <DialogFooter className="bg-muted/30 py-3">
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
