import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import DetailDialog from '@/components/shared/DetailDialog'
import EmptyState from '@/components/shared/EmptyState'
import { FundTable } from '@/components/shared/FundTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useRemoteData } from '@/hooks/useRemoteData'

interface DataPageProps { title: string; description: string; columns: string[]; rows?: string[][]; loader?: () => Promise<string[][]>; searchable?: boolean }
const emptyLoader = async () => [] as string[][]

export default function DataPage({ title, description, columns, rows, loader, searchable = true }: DataPageProps) {
  const remote = useRemoteData(loader ?? emptyLoader)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string[]>()
  const filtered = useMemo(() => (rows ?? remote.data ?? []).filter((row) => row.some((cell) => cell.toLowerCase().includes(search.toLowerCase()))), [rows, remote.data, search])
  const pageSize = 10
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const displayedRows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const details = selected?.map((value, index) => ({ label: columns[index] ?? `Field ${index + 1}`, value, status: columns[index]?.toLowerCase() === 'status' })) ?? []
  return (
    <div>
      <PageHeader title={title} description={description} />
      {searchable && !remote.error && <div className="relative mb-3 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder={`Search ${title.toLowerCase()}…`} /></div>}
      {loader && remote.isLoading ? <Card><CardContent className="space-y-3 p-4">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-9 animate-pulse rounded-xl bg-muted" />)}</CardContent></Card> : loader && remote.error ? <div className="rounded-2xl border bg-card p-8 text-center"><p className="text-sm font-semibold">Unable to load {title.toLowerCase()}.</p><p role="alert" className="mt-1 text-xs text-red-700">{remote.error}</p><Button className="mt-4" variant="outline" onClick={remote.reload}>Retry</Button></div> : displayedRows.length === 0 ? <EmptyState title={search ? 'No results found' : `No ${title.toLowerCase()} found`} description={search ? `No ${title.toLowerCase()} match your current search.` : `There are currently no ${title.toLowerCase()} to display.`} action={search ? <Button variant="outline" onClick={() => setSearch('')}>Clear Search</Button> : undefined} /> : <>
        <FundTable columns={columns} rows={displayedRows} actions={(row) => [{ label: 'View Details', onSelect: () => setSelected(row) }]} />
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page === pages} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div>
      </>}
      <DetailDialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(undefined) }} title={`${title.replace(/s$/, '')} Details`} description="Complete record information" items={details} />
    </div>
  )
}
