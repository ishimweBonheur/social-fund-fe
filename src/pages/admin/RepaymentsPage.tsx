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
import { formatPersonName, humanizeValue } from '@/lib/utils'
import {
  downloadStatement,
  getFundSummary,
  listFundTransactions,
  type FundTransaction,
  type TransactionFilters,
} from '@/services/fundLedgerService'
import { listMembers } from '@/services/memberService'

const PAGE_SIZE = 10
const money = (value?: string) => `RWF ${Number(value ?? 0).toLocaleString()}`
export default function RepaymentsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({})
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<FundTransaction>()
  const updateFilters = (next: TransactionFilters) => {
    setFilters(next)
    setPage(1)
  }
  const summary = useRemoteData(getFundSummary)
  const members = useRemoteData(useCallback(() => listMembers({ pageSize: 100 }), []))
  const load = useCallback(() => listFundTransactions(filters, page, PAGE_SIZE), [filters, page])
  const transactions = useRemoteData(load)
  const items = transactions.data?.items ?? []
  return (
    <div>
      <PageHeader
        title="Fund Transaction History"
        description="Review completed transactions for every member"
        action={
          <Button
            className="gap-2 shadow-sm"
            onClick={() => void downloadStatement(true, filters)}
          >
            <Download className="size-4" />
            Download PDF
          </Button>
        }
      />
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        {[
          ['Total In', summary.data?.totalIn],
          ['Total Out', summary.data?.totalOut],
          ['Current Fund Balance', summary.data?.balance],
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
            <p className="mb-2 text-xs font-semibold">Member</p>
            <Select
              value={filters.userId || 'ALL'}
              onValueChange={(value) =>
                updateFilters({ ...filters, userId: value === 'ALL' ? '' : value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All members</SelectItem>
                {members.data?.members.map((member) => (
                  <SelectItem
                    key={member.id}
                    value={member.id}
                  >
                    {member.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                <SelectItem value="ALL">All types</SelectItem>
                <SelectItem value="CONTRIBUTION">Contribution</SelectItem>
                <SelectItem value="ASSISTANCE">Assistance</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                <SelectItem value="REFUND">Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold">Direction</p>
            <Select
              value={filters.direction || 'ALL'}
              onValueChange={(value) =>
                updateFilters({ ...filters, direction: value === 'ALL' ? '' : value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All directions</SelectItem>
                <SelectItem value="IN">Money in</SelectItem>
                <SelectItem value="OUT">Money out</SelectItem>
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
      {summary.error || transactions.error ? (
        <EmptyState
          title="Unable to load fund transactions"
          description={summary.error || transactions.error}
          action={
            <Button
              variant="outline"
              onClick={() => {
                summary.reload()
                transactions.reload()
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
          title="No fund transactions"
          description="No completed transactions match the current filters."
        />
      ) : (
        <Card>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.userName ? formatPersonName(item.userName) : item.userId}
                    </TableCell>
                    <TableCell>{humanizeValue(item.type)}</TableCell>
                    <TableCell>
                      {item.direction === 'IN'
                        ? 'Money In'
                        : item.direction === 'OUT'
                          ? 'Money Out'
                          : humanizeValue(item.direction)}
                    </TableCell>
                    <TableCell>{money(item.amount)}</TableCell>
                    <TableCell>
                      {item.paymentMethod ? humanizeValue(item.paymentMethod) : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.reference ?? '-'}</TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell>
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
        title="Fund Transaction Details"
        items={
          selected
            ? [
                { label: 'Member', value: selected.userName ?? selected.userId },
                { label: 'Type', value: selected.type },
                { label: 'Direction', value: selected.direction },
                { label: 'Amount', value: money(selected.amount) },
                { label: 'Method', value: selected.paymentMethod ?? '-' },
                { label: 'Reference', value: selected.reference ?? '-' },
                { label: 'Description', value: selected.description ?? '-' },
                { label: 'Status', value: selected.status, status: true },
                { label: 'Recorded', value: new Date(selected.createdAt).toLocaleString() },
              ]
            : []
        }
      />
    </div>
  )
}
