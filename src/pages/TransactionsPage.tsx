import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useApp } from '@/context/AppContext'
import type { PaymentSortKey, SortDirection } from '@/types/dashboard'
import { cn } from '@/lib/utils'

export function TransactionsPage() {
  const { transactions } = useApp()
  const [sortKey, setSortKey] = useState<PaymentSortKey>('date')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')

  const sorted = useMemo(() => {
    const data = [...transactions]
    data.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'date': cmp = new Date(a.date).getTime() - new Date(b.date).getTime(); break
        case 'time': cmp = a.time.localeCompare(b.time); break
        case 'status': cmp = a.status.localeCompare(b.status); break
        case 'amount': cmp = a.amount - b.amount; break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return data
  }, [transactions, sortKey, sortDir])

  const toggleSort = (key: PaymentSortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  return (
    <div>
      <PageHeader
        title="Transactions"
        description={`${transactions.length} transactions recorded`}
      />

      <Card>
        <CardContent className="p-0 sm:p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {(['name', 'date', 'time', 'status', 'amount'] as PaymentSortKey[]).map((key) => (
                  <TableHead key={key}>
                    <button
                      type="button"
                      onClick={() => toggleSort(key)}
                      className="flex items-center gap-1 capitalize hover:text-foreground"
                    >
                      {key}
                      {sortKey === key && (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-muted-foreground">{row.date}</TableCell>
                  <TableCell className="text-muted-foreground">{row.time}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <span className={cn('h-2 w-2 rounded-full', row.status === 'Successful' ? 'bg-[#0F9D58]' : 'bg-amber-400')} />
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell className={cn('font-semibold', row.amount < 0 ? 'text-red-500' : '')}>
                    {row.amount < 0 ? '-' : ''}${Math.abs(row.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
