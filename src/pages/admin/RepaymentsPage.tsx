import { useState } from 'react'
import DetailDialog from '@/components/shared/DetailDialog'
import EmptyState from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import TableActions from '@/components/shared/TableActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getFundSummary, listFundTransactions, type FundTransaction } from '@/services/fundLedgerService'

const money = (value?: string) => `RWF ${Number(value ?? 0).toLocaleString()}`
export default function RepaymentsPage() {
  const summary = useRemoteData(getFundSummary)
  const transactions = useRemoteData(listFundTransactions)
  const [selected, setSelected] = useState<FundTransaction>()
  const [search, setSearch] = useState('')
  const items = (transactions.data ?? []).filter((item) => [item.userName, item.reference, item.type].some((value) => value?.toLowerCase().includes(search.toLowerCase())))
  return <div><PageHeader title="Fund Ledger" description="Review derived fund totals and immutable financial transactions" /><div className="mb-3 grid gap-3 sm:grid-cols-3">{[['Total In', summary.data?.totalIn], ['Total Out', summary.data?.totalOut], ['Balance', summary.data?.balance]].map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold">{money(value)}</p></CardContent></Card>)}</div><Input className="mb-3 max-w-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search member, reference, or type…" />{summary.error || transactions.error ? <EmptyState title="Unable to load fund ledger" description={summary.error || transactions.error} action={<Button variant="outline" onClick={() => { summary.reload(); transactions.reload() }}>Retry</Button>} /> : transactions.isLoading ? <Card><CardContent className="space-y-3 p-4">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-9 animate-pulse rounded-xl bg-muted" />)}</CardContent></Card> : items.length === 0 ? <EmptyState title="No fund transactions" description="No transactions match the current filters." /> : <Card><CardContent className="overflow-x-auto p-0"><Table><TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Type</TableHead><TableHead>Direction</TableHead><TableHead>Amount</TableHead><TableHead>Reference</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{items.map((item) => <TableRow key={item.id}><TableCell>{item.userName ?? item.userId}</TableCell><TableCell>{item.type}</TableCell><TableCell>{item.direction}</TableCell><TableCell>{money(item.amount)}</TableCell><TableCell>{item.reference ?? '—'}</TableCell><TableCell>{new Date(item.createdAt).toLocaleString()}</TableCell><TableCell><TableActions actions={[{ label: 'View Details', onSelect: () => setSelected(item) }]} /></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>}<DetailDialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(undefined) }} title="Fund Transaction Details" items={selected ? [{ label: 'Member', value: selected.userName ?? selected.userId }, { label: 'Type', value: selected.type }, { label: 'Direction', value: selected.direction }, { label: 'Amount', value: money(selected.amount) }, { label: 'Reference', value: selected.reference ?? '—' }, { label: 'Description', value: selected.description ?? '—' }, { label: 'Recorded', value: new Date(selected.createdAt).toLocaleString() }] : []} /></div>
}
