import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import DetailRow from '@/components/shared/DetailRow'
import StatusBadge from '@/components/shared/StatusBadge'

export interface DetailItem { label: string; value: string; status?: boolean }
export default function DetailDialog({ open, onOpenChange, title, description, items }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description?: string; items: DetailItem[] }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogHeader><DialogTitle>{title}</DialogTitle>{description && <DialogDescription>{description}</DialogDescription>}</DialogHeader><dl className="overflow-y-auto px-6 py-2">{items.map((item) => <DetailRow key={item.label} label={item.label} value={item.status ? <StatusBadge status={item.value} /> : item.value} />)}</dl><DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter></DialogContent></Dialog>
}
