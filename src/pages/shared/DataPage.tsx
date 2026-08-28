import { FundTable } from '@/components/shared/FundTable'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'

interface DataPageProps {
  title: string
  description: string
  columns: string[]
  rows?: string[][]
  loader?: () => Promise<string[][]>
  action?: string
}

import { useRemoteData } from '@/hooks/useRemoteData'

const emptyLoader = async () => [] as string[][]

export default function DataPage({ title, description, columns, rows, loader, action }: DataPageProps) {
  const remote = useRemoteData(loader ?? emptyLoader)
  const displayedRows = rows ?? remote.data ?? []
  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={action ? <Button className="rounded-full">{action}</Button> : undefined}
      />
      {loader && remote.isLoading ? <p className="rounded-xl bg-card p-8 text-center text-sm text-muted-foreground">Loading…</p> : loader && remote.error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{remote.error}</p> : <FundTable columns={columns} rows={displayedRows} />}
    </div>
  )
}
