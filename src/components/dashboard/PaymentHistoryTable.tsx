import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { ExpandDialog } from '@/components/shared/ExpandDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

function PaymentIcon({ type, color }: { type: string; color: string }) {
  if (type === 'dribbble') {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
    )
  }
  if (type === 'google') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: color }}>
        G
      </div>
    )
  }
  if (type === 'amazon') {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-black" style={{ backgroundColor: color }}>
        a
      </div>
    )
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: color }}>
      $
    </div>
  )
}

function SortableHead({
  label,
  sortKey,
  currentKey,
  direction,
  onSort,
}: {
  label: string
  sortKey: PaymentSortKey
  currentKey: PaymentSortKey
  direction: SortDirection
  onSort: (key: PaymentSortKey) => void
}) {
  const isActive = currentKey === sortKey
  return (
    <TableHead>
      <button type="button" onClick={() => onSort(sortKey)} className="flex items-center gap-1 transition-colors hover:text-foreground">
        {label}
        {isActive && (direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
      </button>
    </TableHead>
  )
}

export function PaymentHistoryTable() {
  const { transactions } = useApp()
  const [sortKey, setSortKey] = useState<PaymentSortKey>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (key: PaymentSortKey) => {
    if (sortKey === key) setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDirection('asc') }
  }

  const sortedData = useMemo(() => {
    const data = [...transactions]
    data.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break
        case 'date': cmp = new Date(a.date).getTime() - new Date(b.date).getTime(); break
        case 'time': cmp = a.time.localeCompare(b.time); break
        case 'status': cmp = a.status.localeCompare(b.status); break
        case 'amount': cmp = Math.abs(a.amount) - Math.abs(b.amount); break
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
    return data
  }, [transactions, sortKey, sortDirection])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>Recent payments history</CardDescription>
          </div>
          <ExpandDialog title="Payment History" description="All recent payments">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>${Math.abs(row.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ExpandDialog>
        </CardHeader>
        <CardContent className="px-1 pb-3 sm:px-3">
          <div className="overflow-x-auto scrollbar-hide">
          <Table className="min-w-[36rem]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <SortableHead label="Name" sortKey="name" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortableHead label="Date" sortKey="date" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortableHead label="Time" sortKey="time" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortableHead label="Status" sortKey="status" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
                <SortableHead label="Amount" sortKey="amount" currentKey={sortKey} direction={sortDirection} onSort={handleSort} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <PaymentIcon type={row.icon} color={row.iconColor} />
                      <span className="font-medium">{row.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.date}</TableCell>
                  <TableCell className="text-muted-foreground">{row.time}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#0F9D58]" />
                      <span className={cn('text-sm', row.status === 'Successful' && 'text-[#0F9D58]')}>
                        {row.status}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {Math.abs(row.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
