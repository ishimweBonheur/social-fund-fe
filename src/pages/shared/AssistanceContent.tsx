import { useMemo, useState, type FormEvent } from 'react'
import { HandCoins, RotateCcw, Search } from 'lucide-react'
import { toast } from 'sonner'
import DetailDialog from '@/components/shared/DetailDialog'
import EmptyState from '@/components/shared/EmptyState'
import FilterDialog from '@/components/shared/FilterDialog'
import SupportRequestDialog from '@/components/shared/SupportRequestDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import TableActions from '@/components/shared/TableActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { formatPersonName } from '@/lib/utils'
import { getApiErrorMessage } from '@/services/api'
import {
  approveAssistanceRequest,
  createAssistanceRequest,
  listAdminAssistanceRequests,
  listMyAssistanceRequests,
  payAssistanceRequest,
  rejectAssistanceRequest,
  type AssistanceRequest,
} from '@/services/assistanceService'

const money = (value?: string) => (value ? `RWF ${Number(value).toLocaleString()}` : '—')
type Mode = 'create' | 'approve' | 'reject' | 'pay'
export default function AssistanceContent({ admin = false }: { admin?: boolean }) {
  const remote = useRemoteData(admin ? listAdminAssistanceRequests : listMyAssistanceRequests)
  const [selected, setSelected] = useState<AssistanceRequest>()
  const [target, setTarget] = useState<AssistanceRequest>()
  const [supportTarget, setSupportTarget] = useState<AssistanceRequest>()
  const [mode, setMode] = useState<Mode>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [form, setForm] = useState({
    amount: '',
    reason: '',
    description: '',
    method: 'MOBILE_MONEY',
    reference: '',
  })
  const open = (next: Mode, item?: AssistanceRequest) => {
    setMode(next)
    setTarget(item)
    setError('')
    setForm({
      amount: item?.amountRequested ?? '',
      reason: '',
      description: '',
      method: 'MOBILE_MONEY',
      reference: '',
    })
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if ((mode === 'create' || mode === 'approve' || mode === 'pay') && Number(form.amount) <= 0) {
      setError('Amount must be greater than zero.')
      return
    }
    if ((mode === 'create' || mode === 'reject') && !form.reason.trim()) {
      setError('A reason is required.')
      return
    }
    if (mode === 'pay' && !form.reference.trim()) {
      setError('A disbursement reference is required.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'create')
        await createAssistanceRequest({
          amountRequested: form.amount,
          reason: form.reason,
          description: form.description,
        })
      if (mode === 'approve' && target) await approveAssistanceRequest(target.id, form.amount)
      if (mode === 'reject' && target) await rejectAssistanceRequest(target.id, form.reason)
      if (mode === 'pay' && target)
        await payAssistanceRequest(target.id, {
          amount: form.amount,
          method: form.method,
          reference: form.reference,
        })
      toast.success(
        mode === 'create'
          ? 'Assistance request submitted.'
          : mode === 'approve'
            ? 'Assistance request approved.'
            : mode === 'reject'
              ? 'Assistance request rejected.'
              : 'Assistance payment recorded.',
      )
      setMode(undefined)
      setTarget(undefined)
      remote.reload()
    } catch (reason) {
      const message = getApiErrorMessage(reason)
      setError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }
  const items = useMemo(() => remote.data ?? [], [remote.data])
  const statuses = useMemo(() => [...new Set(items.map((item) => item.status))].sort(), [items])
  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          (statusFilter === 'ALL' || item.status === statusFilter) &&
          (!search ||
            [item.memberName, item.reason, item.status].some((value) =>
              value?.toLowerCase().includes(search.toLowerCase()),
            )),
      ),
    [items, search, statusFilter],
  )
  return (
    <div>
      <PageHeader
        title={admin ? 'Assistance Requests' : 'My Assistance Requests'}
        description={
          admin
            ? 'Review, approve, reject, and disburse member requests'
            : 'Request support from the Social Fund'
        }
        action={
          !admin ? <Button onClick={() => open('create')}>Request Assistance</Button> : undefined
        }
      />
      {remote.isLoading ? (
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
      ) : remote.error ? (
        <EmptyState
          title="Unable to load assistance requests"
          description={remote.error}
          action={
            <Button
              variant="outline"
              onClick={remote.reload}
            >
              Retry
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="No assistance requests"
          description={
            admin
              ? 'There are no member requests to review.'
              : 'You have not submitted an assistance request.'
          }
          action={
            !admin ? <Button onClick={() => open('create')}>Request Assistance</Button> : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden border-border/70 shadow-card">
          <div className="border-b border-border/60 p-4 sm:p-5">
            <div className="mb-4">
              <p className="text-base font-bold">Assistance directory</p>
              <p className="text-xs text-muted-foreground">
                {filteredItems.length} of {items.length} requests
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-10"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search member or reason..."
                />
              </div>
              <FilterDialog
                activeCount={statusFilter === 'ALL' ? 0 : 1}
                onReset={() => setStatusFilter('ALL')}
                title="Filter assistance requests"
              >
                <div>
                  <p className="mb-2 text-xs font-semibold">Request status</p>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All statuses</SelectItem>
                      {statuses.map((status) => (
                        <SelectItem
                          key={status}
                          value={status}
                        >
                          {status.replaceAll('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FilterDialog>
              {search && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearch('')
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {admin && <TableHead>Member</TableHead>}
                  <TableHead>Requested</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    {admin && <TableCell>{formatPersonName(item.memberName)}</TableCell>}
                    <TableCell>{money(item.amountRequested)}</TableCell>
                    <TableCell>{item.reason}</TableCell>
                    <TableCell>{money(item.amountApproved)}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <TableActions
                        actions={[
                          { label: 'View Details', onSelect: () => setSelected(item) },
                          ...(admin && item.status === 'PENDING'
                            ? [
                                {
                                  label: 'Approve',
                                  onSelect: () => open('approve', item),
                                  separator: true,
                                },
                                {
                                  label: 'Reject',
                                  onSelect: () => open('reject', item),
                                  destructive: true,
                                },
                              ]
                            : []),
                          ...(admin && item.status === 'APPROVED'
                            ? [
                                {
                                  label: 'Record Disbursement',
                                  onSelect: () => open('pay', item),
                                  separator: true,
                                },
                              ]
                            : []),
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {!admin && items.some((item) => item.status === 'PENDING' || item.status === 'APPROVED') && (
        <Card className="mb-3">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold">Assistance status not updated?</p>
              <p className="text-xs text-muted-foreground">
                Tell the administrator if money was paid but this status is still pending.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {items
                .filter((item) => item.status === 'PENDING' || item.status === 'APPROVED')
                .map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    onClick={() => setSupportTarget(item)}
                  >
                    Contact Admin ({money(item.amountRequested)})
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
      <DetailDialog
        open={Boolean(selected)}
        onOpenChange={(value) => {
          if (!value) setSelected(undefined)
        }}
        title="Assistance Request Details"
        items={
          selected
            ? [
                { label: 'Member', value: selected.memberName ?? 'Current member' },
                { label: 'Requested Amount', value: money(selected.amountRequested) },
                { label: 'Reason', value: selected.reason },
                { label: 'Description', value: selected.description ?? '—' },
                { label: 'Approved Amount', value: money(selected.amountApproved) },
                { label: 'Disbursed Amount', value: money(selected.amountDisbursed) },
                { label: 'Disbursement Reference', value: selected.disbursementReference ?? '—' },
                { label: 'Status', value: selected.status, status: true },
                { label: 'Created', value: new Date(selected.createdAt).toLocaleString() },
              ]
            : []
        }
      />
      <Dialog
        open={Boolean(mode)}
        onOpenChange={(value) => {
          if (!value) setMode(undefined)
        }}
      >
        <DialogContent className="max-w-xl">
          <form onSubmit={submit}>
            <DialogHeader className="flex flex-row items-start gap-3 border-b-0 pb-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                <HandCoins className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle>
                  {mode === 'create'
                    ? 'Request Assistance'
                    : mode === 'approve'
                      ? 'Approve Assistance Request'
                      : mode === 'reject'
                        ? 'Reject Assistance Request'
                        : 'Record Assistance Payment'}
                </DialogTitle>
                <DialogDescription>
                  {mode === 'create'
                    ? 'Submit a request for Social Fund assistance.'
                    : `${target?.memberName ?? 'Member'} requested ${money(target?.amountRequested)}.`}
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="grid gap-5 px-6 py-5">
              {mode !== 'reject' && (
                <div>
                  <Label htmlFor="assistance-amount">
                    {mode === 'approve'
                      ? 'Approved Amount'
                      : mode === 'pay'
                        ? 'Disbursement Amount'
                        : 'Requested Amount'}{' '}
                    *
                  </Label>
                  <Input
                    id="assistance-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) => setForm({ ...form, amount: event.target.value })}
                  />
                </div>
              )}
              {(mode === 'create' || mode === 'reject') && (
                <div>
                  <Label htmlFor="assistance-reason">Reason *</Label>
                  <Textarea
                    id="assistance-reason"
                    required
                    maxLength={500}
                    placeholder="Briefly explain why you need assistance"
                    value={form.reason}
                    onChange={(event) => setForm({ ...form, reason: event.target.value })}
                  />
                </div>
              )}
              {mode === 'create' && (
                <div>
                  <Label htmlFor="assistance-description">Description</Label>
                  <Textarea
                    id="assistance-description"
                    className="min-h-28"
                    maxLength={2000}
                    placeholder="Add any helpful context or supporting details"
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                  />
                </div>
              )}
              {mode === 'pay' && (
                <>
                  <div>
                    <Label htmlFor="disbursement-method">Method *</Label>
                    <select
                      id="disbursement-method"
                      className="mt-1 h-10 w-full rounded-xl border bg-card px-3 text-sm"
                      value={form.method}
                      onChange={(event) => setForm({ ...form, method: event.target.value })}
                    >
                      {['MOBILE_MONEY', 'BANK_TRANSFER', 'CASH', 'OTHER'].map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="disbursement-reference">Reference *</Label>
                    <Input
                      id="disbursement-reference"
                      value={form.reference}
                      onChange={(event) => setForm({ ...form, reference: event.target.value })}
                    />
                  </div>
                </>
              )}
              {error && <p className="text-xs text-red-700">{error}</p>}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode(undefined)}
              >
                Cancel
              </Button>
              <Button
                disabled={busy || (mode === 'reject' && !form.reason.trim())}
                className={mode === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {busy
                  ? 'Submitting…'
                  : mode === 'create'
                    ? 'Submit Request'
                    : mode === 'approve'
                      ? 'Approve Request'
                      : mode === 'reject'
                        ? 'Reject Request'
                        : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {supportTarget && (
        <SupportRequestDialog
          open
          onOpenChange={(open) => {
            if (!open) setSupportTarget(undefined)
          }}
          defaultCategory="ASSISTANCE_PENDING"
          defaultMessage={`My assistance request for ${money(supportTarget.amountRequested)} still shows ${supportTarget.status}. Please check whether the payment or status needs to be updated.`}
        />
      )}
    </div>
  )
}
