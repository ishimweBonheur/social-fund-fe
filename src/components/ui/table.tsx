import * as React from 'react'
import Pagination from '@/components/shared/Pagination'
import { cn } from '@/lib/utils'

const DEFAULT_PAGE_SIZE = 10

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, children, ...props }, forwardedRef) => {
    const [page, setPage] = React.useState(1)
    const tableRef = React.useRef<HTMLTableElement | null>(null)
    const sections = React.Children.toArray(children)
    const bodyIndex = sections.findIndex(
      (child) =>
        React.isValidElement(child) &&
        (child.type as { displayName?: string }).displayName === 'TableBody',
    )
    const body =
      bodyIndex >= 0
        ? (sections[bodyIndex] as React.ReactElement<{ children?: React.ReactNode }>)
        : undefined
    const rows = body ? React.Children.toArray(body.props.children) : []
    const pageCount = Math.max(1, Math.ceil(rows.length / DEFAULT_PAGE_SIZE))
    const currentPage = Math.min(page, pageCount)
    const start = (currentPage - 1) * DEFAULT_PAGE_SIZE

    React.useEffect(() => {
      if (page > pageCount) setPage(pageCount)
    }, [page, pageCount])
    React.useLayoutEffect(() => {
      const table = tableRef.current
      if (!table) return
      const labels = Array.from(table.querySelectorAll('thead th')).map(
        (cell) => cell.textContent?.trim() || '',
      )
      table.querySelectorAll('tbody tr').forEach((row) => {
        Array.from(row.children).forEach((cell, index) => {
          if (cell instanceof HTMLElement) cell.dataset.label = labels[index] ?? ''
        })
      })
    }, [children, currentPage])

    const visibleSections = body
      ? sections.map((section, index) =>
          index === bodyIndex
            ? React.cloneElement(body, {}, rows.slice(start, start + DEFAULT_PAGE_SIZE))
            : section,
        )
      : sections
    const setRef = (node: HTMLTableElement | null) => {
      tableRef.current = node
      if (typeof forwardedRef === 'function') forwardedRef(node)
      else if (forwardedRef) forwardedRef.current = node
    }

    return (
      <div className="relative w-full">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <table
            ref={setRef}
            className={cn('w-full caption-bottom text-sm font-normal max-sm:block', className)}
            {...props}
          >
            {visibleSections}
          </table>
        </div>
        {/* eslint-disable-next-line no-constant-binary-expression */}
        {false && rows.length > DEFAULT_PAGE_SIZE && (
          <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
            <span>
              Page {currentPage} of {pageCount} · {rows.length} records
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border border-border/80 px-3 py-1.5 font-semibold text-foreground hover:bg-muted disabled:opacity-40"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-md border border-border/80 px-3 py-1.5 font-semibold text-foreground hover:bg-muted disabled:opacity-40"
                disabled={currentPage === pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
        {rows.length > DEFAULT_PAGE_SIZE && (
          <Pagination
            page={currentPage}
            pageSize={DEFAULT_PAGE_SIZE}
            total={rows.length}
            onPageChange={setPage}
          />
        )}
      </div>
    )
  },
)
Table.displayName = 'Table'

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn('bg-muted/45 [&_tr]:border-b [&_tr]:border-border/60 max-sm:hidden', className)}
    {...props}
  />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0 max-sm:block max-sm:space-y-3 max-sm:p-3', className)}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b border-border/40 transition-colors hover:bg-accent/35 data-[state=selected]:bg-accent/50 max-sm:block max-sm:rounded-lg max-sm:border max-sm:bg-card max-sm:p-2',
        className,
      )}
      {...props}
    />
  ),
)
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-11 px-4 text-left align-middle text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground',
      className,
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, colSpan, ...props }, ref) => (
  <td
    ref={ref}
    colSpan={colSpan}
    className={cn(
      'px-4 py-3.5 align-middle text-sm font-medium',
      colSpan && colSpan > 1
        ? 'max-sm:block max-sm:text-left'
        : 'max-sm:flex max-sm:min-h-9 max-sm:items-center max-sm:justify-between max-sm:gap-4 max-sm:px-2 max-sm:py-1.5 max-sm:text-right before:max-sm:shrink-0 before:max-sm:text-left before:max-sm:text-[11px] before:max-sm:font-semibold before:max-sm:text-muted-foreground before:max-sm:content-[attr(data-label)]',
      className,
    )}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
