import { useMemo, useState } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import DetailDialog from '@/components/shared/DetailDialog'
import EmptyState from '@/components/shared/EmptyState'
import FilterDialog from '@/components/shared/FilterDialog'
import { FundTable } from '@/components/shared/FundTable'
import { PageHeader } from '@/components/shared/PageHeader'
import Pagination from '@/components/shared/Pagination'
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
import { useRemoteData } from '@/hooks/useRemoteData'

interface DataPageProps {
  title: string
  description: string
  columns: string[]
  rows?: string[][]
  loader?: () => Promise<string[][]>
  searchable?: boolean
}
const emptyLoader = async () => [] as string[][]

export default function DataPage({
  title,
  description,
  columns,
  rows,
  loader,
  searchable = true,
}: DataPageProps) {
  const remote = useRemoteData(loader ?? emptyLoader)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [columnFilters, setColumnFilters] = useState<Record<number, string>>({})
  const [selected, setSelected] = useState<string[]>()
  const sourceRows = useMemo(() => rows ?? remote.data ?? [], [rows, remote.data])
  const filterColumns = useMemo(
    () =>
      columns
        .map((column, index) => ({
          column,
          index,
          values: [...new Set(sourceRows.map((row) => row[index]).filter(Boolean))].sort(),
        }))
        .filter(
          ({ column, values }) =>
            /status|type|direction|frequency|method|role|audience|category/i.test(column) &&
            values.length > 1 &&
            values.length <= 20,
        ),
    [columns, sourceRows],
  )
  const filtered = useMemo(
    () =>
      sourceRows.filter(
        (row) =>
          row.some((cell) => cell.toLowerCase().includes(search.toLowerCase())) &&
          Object.entries(columnFilters).every(
            ([index, value]) => !value || row[Number(index)] === value,
          ),
      ),
    [sourceRows, search, columnFilters],
  )
  const displayedRows = filtered.slice((page - 1) * pageSize, page * pageSize)
  const details =
    selected?.map((value, index) => ({
      label: columns[index] ?? `Field ${index + 1}`,
      value,
      status: columns[index]?.toLowerCase() === 'status',
    })) ?? []
  return (
    <div className="min-w-0 space-y-5">
      <PageHeader
        title={title}
        description={description}
      />
      {searchable && !remote.error && (
        <div className="hidden">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 pl-10"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder={`Search ${title.toLowerCase()}…`}
            />
          </div>
          <p className="hidden text-xs font-medium text-muted-foreground sm:block">
            {filtered.length} records
          </p>
        </div>
      )}
      {loader && remote.isLoading ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="h-9 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </CardContent>
        </Card>
      ) : loader && remote.error ? (
        <div className="rounded-2xl border bg-card p-8 text-center">
          <p className="text-sm font-semibold">Unable to load {title.toLowerCase()}.</p>
          <p
            role="alert"
            className="mt-1 text-xs text-red-700"
          >
            {remote.error}
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={remote.reload}
          >
            Retry
          </Button>
        </div>
      ) : displayedRows.length === 0 ? (
        <EmptyState
          title={search ? 'No results found' : `No ${title.toLowerCase()} found`}
          description={
            search
              ? `No ${title.toLowerCase()} match your current search.`
              : `There are currently no ${title.toLowerCase()} to display.`
          }
          action={
            search ? (
              <Button
                variant="outline"
                onClick={() => setSearch('')}
              >
                Clear Search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <FundTable
            columns={columns}
            rows={displayedRows}
            actions={(row) => [{ label: 'View Details', onSelect: () => setSelected(row) }]}
            title={title}
            description={`${filtered.length} records`}
            toolbar={
              searchable ? (
                <div className="flex flex-col gap-2 lg:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="h-10 pl-10"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value)
                        setPage(1)
                      }}
                      placeholder={`Search ${title.toLowerCase()}...`}
                    />
                  </div>
                  {filterColumns.length > 0 && (
                    <FilterDialog
                      activeCount={Object.values(columnFilters).filter(Boolean).length}
                      onReset={() => {
                        setColumnFilters({})
                        setPage(1)
                      }}
                      title={`Filter ${title.toLowerCase()}`}
                    >
                      {filterColumns.map(({ column, index, values }) => (
                        <div key={column}>
                          <p className="mb-2 text-xs font-semibold">{column}</p>
                          <Select
                            value={columnFilters[index] || 'ALL'}
                            onValueChange={(value) => {
                              setColumnFilters((current) => ({
                                ...current,
                                [index]: value === 'ALL' ? '' : value,
                              }))
                              setPage(1)
                            }}
                          >
                            <SelectTrigger className="min-w-36">
                              <SelectValue placeholder={`All ${column.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL">All {column.toLowerCase()}</SelectItem>
                              {values.map((value) => (
                                <SelectItem
                                  key={value}
                                  value={value}
                                >
                                  {value.replaceAll('_', ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </FilterDialog>
                  )}
                  {search && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearch('')
                        setPage(1)
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  )}
                </div>
              ) : undefined
            }
            footer={
              <Pagination
                page={page}
                pageSize={pageSize}
                total={filtered.length}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setPage(1)
                }}
              />
            }
          />
        </>
      )}
      <DetailDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(undefined)
        }}
        title={`${title.replace(/s$/, '')} Details`}
        description="Complete record information"
        items={details}
      />
    </div>
  )
}
