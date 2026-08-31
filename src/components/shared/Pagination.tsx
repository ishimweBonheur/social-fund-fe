import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type PageItem = number | 'ellipsis-left' | 'ellipsis-right'
function pageItems(page: number, pages: number): PageItem[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, index) => index + 1)
  const items: PageItem[] = [1]
  if (page > 4) items.push('ellipsis-left')
  for (let value = Math.max(2, page - 1); value <= Math.min(pages - 1, page + 1); value += 1)
    items.push(value)
  if (page < pages - 3) items.push('ellipsis-right')
  items.push(pages)
  return items
}

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (total === 0) return null
  return (
    <div className="flex flex-col gap-3 border-t border-border/60 bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          Showing{' '}
          <strong className="font-semibold text-foreground">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
          </strong>{' '}
          of <strong className="font-semibold text-foreground">{total}</strong>
        </span>
        {onPageSizeChange && (
          <label className="hidden items-center gap-2 md:flex">
            Rows{' '}
            <Select
              value={String(pageSize)}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 min-w-16 px-2 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map((size) => (
                  <SelectItem
                    key={size}
                    value={String(size)}
                  >
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        )}
      </div>
      <nav
        aria-label="Pagination"
        className="flex items-center gap-1"
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pageItems(page, pages).map((item) =>
          typeof item === 'number' ? (
            <Button
              key={item}
              variant={item === page ? 'default' : 'ghost'}
              size="icon"
              className={cn('h-8 w-8', item === page && 'shadow-none')}
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
            >
              {item}
            </Button>
          ) : (
            <span
              key={item}
              className="grid h-8 w-8 place-items-center text-xs text-muted-foreground"
            >
              •••
            </span>
          ),
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  )
}
