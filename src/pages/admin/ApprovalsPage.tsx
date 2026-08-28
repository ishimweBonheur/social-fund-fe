import { useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getApiErrorMessage } from '@/services/api'
import { approveRequest, getApprovals } from '@/services/fundService'

export default function ApprovalsPage() {
  const { data, error, isLoading } = useRemoteData(getApprovals)
  const [actionError, setActionError] = useState('')
  const [approved, setApproved] = useState<string[]>([])
  if (isLoading) return <p className="rounded-xl bg-card p-8 text-center text-sm text-muted-foreground">Loading approvals…</p>
  return (
    <div>
      <PageHeader title="Approvals" description="Requests waiting for administrator review" />
      {(error || actionError) && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error || actionError}</p>}
      <div className="grid gap-3 lg:grid-cols-3">
        {(data ?? []).filter((item) => !approved.includes(item.id)).map((item) => <Card key={item.id}><CardHeader><CardTitle>{item.type}</CardTitle><CardDescription>{item.detail}</CardDescription></CardHeader><CardContent><Button size="sm" onClick={() => void approveRequest(item.id).then(() => setApproved((ids) => [...ids, item.id])).catch((reason) => setActionError(getApiErrorMessage(reason)))}>Approve</Button></CardContent></Card>)}
      </div>
      {!error && (data ?? []).filter((item) => !approved.includes(item.id)).length === 0 && <p className="rounded-xl bg-card p-8 text-center text-sm text-muted-foreground">No pending approvals.</p>}
    </div>
  )
}
