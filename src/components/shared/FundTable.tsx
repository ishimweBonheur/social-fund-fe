import { Card, CardContent } from '@/components/ui/card'
import type { ReactNode } from 'react'
import { humanizeValue } from '@/lib/utils'
import StatusBadge from '@/components/shared/StatusBadge'
import TableActions, { type TableAction } from '@/components/shared/TableActions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const statuses = new Set([
  'ACTIVE',
  'INACTIVE',
  'PAID',
  'PENDING',
  'OVERDUE',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'PARTIALLY_PAID',
  'SUSPENDED',
  'DUE',
  'UPCOMING',
  'FAILED',
])

export function FundTable({
  columns,
  rows,
  actions,
  title,
  description,
  toolbar,
  footer,
}: {
  columns: string[]
  rows: string[][]
  actions?: (row: string[], index: number) => TableAction[]
  title?: string
  description?: string
  toolbar?: ReactNode
  footer?: ReactNode
}) {
  return (
    <Card className="overflow-hidden shadow-card">
      {(title || toolbar) && (
        <div className="p-4 shadow-[0_8px_20px_-22px_rgba(33,52,72,.7)] sm:p-5">
          {title && (
            <div className="mb-4">
              <p className="text-base font-bold">{title}</p>
              {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
            </div>
          )}
          {toolbar}
        </div>
      )}
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column}
                  className="whitespace-nowrap"
                >
                  {column}
                </TableHead>
              ))}
              {actions && <TableHead className="w-14 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={`${row[0]}-${rowIndex}`}>
                {row.map((cell, index) => (
                  <TableCell
                    key={`${cell}-${index}`}
                    className={
                      index === 0
                        ? 'whitespace-nowrap font-semibold text-foreground'
                        : 'whitespace-nowrap text-muted-foreground'
                    }
                  >
                    {statuses.has(cell.toUpperCase()) ? (
                      <StatusBadge status={cell} />
                    ) : (
                      humanizeValue(cell)
                    )}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">
                    <TableActions actions={actions(row, rowIndex)} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {footer}
    </Card>
  )
}
