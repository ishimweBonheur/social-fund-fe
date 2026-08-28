import { Card, CardContent } from '@/components/ui/card'
import StatusBadge from '@/components/shared/StatusBadge'
import TableActions, { type TableAction } from '@/components/shared/TableActions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const statuses = new Set(['ACTIVE', 'INACTIVE', 'PAID', 'PENDING', 'OVERDUE', 'APPROVED', 'REJECTED', 'CANCELLED', 'PARTIALLY_PAID', 'SUSPENDED', 'DUE', 'UPCOMING', 'FAILED'])

export function FundTable({ columns, rows, actions }: { columns: string[]; rows: string[][]; actions?: (row: string[], index: number) => TableAction[] }) {
  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader><TableRow>{columns.map((column) => <TableHead key={column} className="whitespace-nowrap">{column}</TableHead>)}{actions && <TableHead className="w-14 text-right">Actions</TableHead>}</TableRow></TableHeader>
          <TableBody>{rows.map((row, rowIndex) => (
            <TableRow key={`${row[0]}-${rowIndex}`}>{row.map((cell, index) => (
              <TableCell key={`${cell}-${index}`} className="whitespace-nowrap">
                {statuses.has(cell.toUpperCase()) ? <StatusBadge status={cell} /> : cell}
              </TableCell>
            ))}{actions && <TableCell className="text-right"><TableActions actions={actions(row, rowIndex)} /></TableCell>}</TableRow>
          ))}</TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
