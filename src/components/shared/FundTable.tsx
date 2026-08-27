import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const statuses = ['Active', 'Paid', 'Pending', 'Overdue', 'Approved', 'Rejected']

export function FundTable({ columns, rows }: { columns: string[]; rows: string[][] }) {
  return (
    <Card>
      <CardContent className="overflow-x-auto p-0">
        <Table>
          <TableHeader><TableRow>{columns.map((column) => <TableHead key={column} className="whitespace-nowrap">{column}</TableHead>)}</TableRow></TableHeader>
          <TableBody>{rows.map((row, rowIndex) => (
            <TableRow key={`${row[0]}-${rowIndex}`}>{row.map((cell, index) => (
              <TableCell key={`${cell}-${index}`} className="whitespace-nowrap">
                {index === row.length - 1 && statuses.includes(cell) ? (
                  <Badge variant="outline" className={cell === 'Overdue' || cell === 'Rejected' ? 'bg-red-50 text-red-700' : cell === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}>{cell}</Badge>
                ) : cell}
              </TableCell>
            ))}</TableRow>
          ))}</TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
