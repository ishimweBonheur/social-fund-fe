import { useCallback, useState } from 'react'
import { Download } from 'lucide-react'
import DetailDialog from '@/components/shared/DetailDialog'
import EmptyState from '@/components/shared/EmptyState'
import FilterDialog from '@/components/shared/FilterDialog'
import Pagination from '@/components/shared/Pagination'
import { PageHeader } from '@/components/shared/PageHeader'
import TableActions from '@/components/shared/TableActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRemoteData } from '@/hooks/useRemoteData'
import { humanizeValue } from '@/lib/utils'
import {
  downloadStatement,
  getMemberFundSummary,
  listMyFundTransactions,
  type FundTransaction,
  type TransactionFilters,
} from '@/services/fundLedgerService'

const PAGE_SIZE = 10
const money = (value?: string) => `RWF ${Number(value ?? 0).toLocaleString()}`
export default function MemberRepaymentsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<FundTransaction>()
  const updateFilters = (next: TransactionFilters) => {
    setFilters(next)
    setPage(1)
  }
  const summary = useRemoteData(getMemberFundSummary)
  const load = useCallback(() => listMyFundTransactions(filters, page, PAGE_SIZE), [filters, page])
  const transactions = useRemoteData(load)
  const items = transactions.data?.items ?? []
  return (
    <div>
      <PageHeader
        title="My Transaction History"
        description="Track completed contributions and assistance received"
        action={
          <Button
            className="gap-2 shadow-sm"
            onClick={() => void downloadStatement(false, filters)}
          >
            <Download className="size-4" />
            Download PDF
          </Button>
        }
      />
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        {[
          ['Total Contributed', summary.data?.totalContributed],
          ['Assistance Received', summary.data?.assistanceReceived],
          ['Net Position', summary.data?.netPosition],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-sm font-normal text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-semibold tracking-tight">{money(value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mb-3 flex justify-end">
        <FilterDialog
          activeCount={Object.values(filters).filter(Boolean).length}
          onReset={() => updateFilters({})}
          title="Filter transactions"
        >
          <div>
            <p className="mb-2 text-xs font-semibold">Transaction type</p>
            <Select
              value={filters.type || 'ALL'}
              onValueChange={(value) =>
                updateFilters({ ...filters, type: value === 'ALL' ? '' : value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All transaction types</SelectItem>
                <SelectItem value="CONTRIBUTION">Contributions</SelectItem>
                <SelectItem value="ASSISTANCE">Assistance received</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold">From date</p>
            <Input
              type="date"
              aria-label="From date"
              value={filters.dateFrom ?? ''}
              onChange={(event) => updateFilters({ ...filters, dateFrom: event.target.value })}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold">To date</p>
            <Input
              type="date"
              aria-label="To date"
              value={filters.dateTo ?? ''}
              onChange={(event) => updateFilters({ ...filters, dateTo: event.target.value })}
            />
          </div>
        </FilterDialog>
      </div>
      {transactions.error || summary.error ? (
        <EmptyState
          title="Unable to load transaction history"
          description={transactions.error || summary.error}
          action={
            <Button
              variant="outline"
              onClick={() => {
                transactions.reload()
                summary.reload()
              }}
            >
              Retry
            </Button>
          }
        />
      ) : transactions.isLoading ? (
        <Card>
          <CardContent className="p-4">Loading transactions...</CardContent>
        </Card>
      ) : items.length === 0 ? (
        <EmptyState
          title="No completed transactions"
          description="Approved contributions and paid assistance will appear here."
        />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      {item.type === 'ASSISTANCE' ? 'Assistance received' : 'Contribution paid'}
                    </TableCell>
                    <TableCell>{money(item.amount)}</TableCell>
                    <TableCell>
                      {item.paymentMethod ? humanizeValue(item.paymentMethod) : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.reference ?? '-'}</TableCell>
                    <TableCell>{humanizeValue(item.status)}</TableCell>
                    <TableCell>
                      <TableActions
                        actions={[{ label: 'View Details', onSelect: () => setSelected(item) }]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={transactions.data?.total ?? 0}
            onPageChange={setPage}
          />
        </Card>
      )}
      <DetailDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(undefined)
        }}
        title="Transaction Details"
        items={
          selected
            ? [
                { label: 'Type', value: selected.type },
                { label: 'Direction', value: selected.direction },
                { label: 'Amount', value: money(selected.amount) },
                { label: 'Payment Method', value: selected.paymentMethod ?? '-' },
                { label: 'Reference', value: selected.reference ?? '-' },
                { label: 'Status', value: selected.status, status: true },
                { label: 'Recorded', value: new Date(selected.createdAt).toLocaleString() },
              ]
            : []
        }
      />
    </div>
  )
}
