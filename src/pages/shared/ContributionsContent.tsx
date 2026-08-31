import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import ContributionPaymentCard from '@/components/member/ContributionPaymentCard'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import DetailDialog from '@/components/shared/DetailDialog'
import EmptyState from '@/components/shared/EmptyState'
import FilterDialog from '@/components/shared/FilterDialog'
import SupportRequestDialog from '@/components/shared/SupportRequestDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import ServerPagination from '@/components/shared/ServerPagination'
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
  approveContribution,
  getContribution,
  getContributionProof,
  getOutstanding,
  listAdminContributions,
  listMyContributions,
  rejectContribution,
  submitContributionProof,
  type Contribution,
  type ContributionStatus,
} from '@/services/contributionService'

const money = (value?: string) => (value ? `RWF ${Number(value).toLocaleString()}` : '—')
function OutstandingSummary() {
  const remote = useRemoteData(getOutstanding)
  if (!remote.data) return null
  return (
    <div className="mb-3 grid gap-3 sm:grid-cols-2">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-normal text-muted-foreground">Outstanding Amount</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">
            {money(remote.data.outstanding_amount)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-normal text-muted-foreground">Overdue Contributions</p>
          <p className="mt-1 text-xl font-semibold tracking-tight">{remote.data.overdue_count}</p>
        </CardContent>
      </Card>
    </div>
  )
}
export default function ContributionsContent({ admin = false }: { admin?: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | ContributionStatus>('ALL')
  const [page, setPage] = useState(1)
  const [dueFrom, setDueFrom] = useState('')
  const [dueTo, setDueTo] = useState('')
  const [method, setMethod] = useState('ALL')
  const [proof, setProof] = useState<'ALL' | 'WITH' | 'WITHOUT'>('ALL')
  const [paymentState, setPaymentState] = useState<'ALL' | 'PAID' | 'PARTIAL' | 'UNPAID'>('ALL')
  const [lateFee, setLateFee] = useState<'ALL' | 'WITH' | 'WITHOUT'>('ALL')
  const [reference, setReference] = useState<'ALL' | 'WITH' | 'WITHOUT'>('ALL')
  const [paidFrom, setPaidFrom] = useState('')
  const [paidTo, setPaidTo] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const loader = useCallback(
    async () =>
      admin
        ? listAdminContributions({
            search,
            status: status === 'ALL' ? undefined : status,
            dueFrom: dueFrom || undefined,
            dueTo: dueTo || undefined,
            method: method === 'ALL' ? undefined : method,
            proof: proof === 'ALL' ? undefined : proof,
            paymentState: paymentState === 'ALL' ? undefined : paymentState,
            lateFee: lateFee === 'ALL' ? undefined : lateFee,
            reference: reference === 'ALL' ? undefined : reference,
            paidFrom: paidFrom || undefined,
            paidTo: paidTo || undefined,
            amountMin: amountMin || undefined,
            amountMax: amountMax || undefined,
            page,
            pageSize: 10,
          })
        : (() =>
            listMyContributions().then((items) => ({
              items,
              total: items.length,
              page: 1,
              pageSize: 100,
            })))(),
    [
      admin,
      search,
      status,
      dueFrom,
      dueTo,
      method,
      proof,
      paymentState,
      lateFee,
      reference,
      paidFrom,
      paidTo,
      amountMin,
      amountMax,
      page,
    ],
  )
  const remote = useRemoteData(loader)
  const [selected, setSelected] = useState<Contribution>()
  const [approveTarget, setApproveTarget] = useState<Contribution>()
  const [rejectTarget, setRejectTarget] = useState<Contribution>()
  const [paymentTarget, setPaymentTarget] = useState<Contribution>()
  const [supportTarget, setSupportTarget] = useState<Contribution>()
  const [reason, setReason] = useState('')
  const [payment, setPayment] = useState({
    amount: '',
    paymentMethod: 'MOBILE_MONEY',
    transactionReference: '',
    proof: undefined as File | undefined,
  })
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const items = useMemo(() => remote.data?.items ?? [], [remote.data])
  const methods = ['MOBILE_MONEY', 'BANK_TRANSFER', 'CASH']
  const displayedItems = items
  const filterCount = [
    status !== 'ALL',
    Boolean(dueFrom),
    Boolean(dueTo),
    method !== 'ALL',
    proof !== 'ALL',
    paymentState !== 'ALL',
    lateFee !== 'ALL',
    reference !== 'ALL',
    Boolean(paidFrom),
    Boolean(paidTo),
    Boolean(amountMin),
    Boolean(amountMax),
  ].filter(Boolean).length
  const resetFilters = () => {
    setStatus('ALL')
    setDueFrom('')
    setDueTo('')
    setMethod('ALL')
    setProof('ALL')
    setPaymentState('ALL')
    setLateFee('ALL')
    setReference('ALL')
    setPaidFrom('')
    setPaidTo('')
    setAmountMin('')
    setAmountMax('')
    setPage(1)
  }
  const openPayment = useCallback((item: Contribution) => {
    setFormError('')
    setPayment({
      amount: item.totalDue,
      paymentMethod: 'MOBILE_MONEY',
      transactionReference: '',
      proof: undefined,
    })
    setPaymentTarget(item)
  }, [])
  useEffect(() => {
    if (admin || !items.length) return
    const paymentID = searchParams.get('pay')
    if (!paymentID) return
    const target = items.find(
      (item) => item.id === paymentID && ['DUE', 'OVERDUE', 'REJECTED'].includes(item.status),
    )
    const pendingNavigation = window.setTimeout(() => {
      if (target) openPayment(target)
      setSearchParams({}, { replace: true })
    }, 0)
    return () => window.clearTimeout(pendingNavigation)
  }, [admin, items, openPayment, searchParams, setSearchParams])
  useEffect(() => {
    if (!selected?.id) return
    let active = true
    void getContribution(selected.id)
      .then((detail) => {
        if (active) setSelected(detail)
      })
      .catch((error) =>
        toast.error(getApiErrorMessage(error, 'Unable to load contribution details.')),
      )
    return () => {
      active = false
    }
  }, [selected?.id])
  const act = async (action: () => Promise<void>, success: string, close: () => void) => {
    setBusy(true)
    setFormError('')
    try {
      await action()
      toast.success(success)
      close()
      remote.reload()
    } catch (error) {
      const message = getApiErrorMessage(error)
      setFormError(message)
      toast.error(message)
    } finally {
      setBusy(false)
    }
  }
  const submitPayment = (event: FormEvent) => {
    event.preventDefault()
    if (
      !paymentTarget ||
      !payment.proof ||
      !payment.amount ||
      !payment.transactionReference.trim()
    ) {
      setFormError('Amount, transaction reference, and proof are required.')
      return
    }
    void act(
      () => submitContributionProof(paymentTarget.id, { ...payment, proof: payment.proof! }),
      'Payment proof submitted successfully.',
      () => setPaymentTarget(undefined),
    )
  }
  const viewProof = async (item: Contribution) => {
    const tab = window.open('', '_blank')
    try {
      const proof = await getContributionProof(item.id)
      if (tab) tab.location.href = proof.url
      else {
        const link = document.createElement('a')
        link.href = proof.url
        link.target = '_blank'
        link.click()
      }
      if (proof.objectUrl) window.setTimeout(() => URL.revokeObjectURL(proof.url), 60_000)
    } catch (error) {
      tab?.close()
      toast.error(getApiErrorMessage(error))
    }
  }
  return (
    <div className="min-w-0">
      <PageHeader
        title={admin ? 'Contributions' : 'My Contributions'}
        description={
          admin
            ? 'View and manage contributions across every status'
            : 'Pay your contribution, then submit proof for review'
        }
      />
      {!admin && <ContributionPaymentCard />}
      {!admin && <OutstandingSummary />}
      <div className="hidden">
        <Input
          className="max-w-sm"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Search member or reference…"
        />
        {admin && (
          <select
            className="h-10 px-3 text-sm"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as typeof status)
              setPage(1)
            }}
          >
            <option value="ALL">All statuses</option>
            {['UPCOMING', 'DUE', 'OVERDUE', 'PENDING', 'APPROVED', 'REJECTED'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        )}
      </div>
      {formError && (
        <p className="mb-3 rounded-xl bg-[#94B4C1]/25 p-3 text-sm text-[#213448] dark:text-[#EAE0CF]">
          {formError}
        </p>
      )}
      {!admin && items.some((item) => item.status === 'PENDING') && (
        <Card className="mb-3">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold">Payment still pending?</p>
              <p className="text-xs text-muted-foreground">
                Remind the administrator to review a submitted contribution.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {items
                .filter((item) => item.status === 'PENDING')
                .map((item) => (
                  <Button
                    key={item.id}
                    variant="outline"
                    onClick={() => setSupportTarget(item)}
                  >
                    Remind Admin{item.transactionReference ? ` (${item.transactionReference})` : ''}
                  </Button>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
      {remote.isLoading ? (
        <Card className="overflow-hidden shadow-card">
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
          title="Unable to load contributions"
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
          title="No contributions found"
          description={
            search
              ? 'No contributions match your search.'
              : admin
                ? 'There are no payment proofs awaiting review.'
                : 'No contribution records are available.'
          }
        />
      ) : (
        <Card className="overflow-hidden shadow-card">
          <div className="border-b border-border/60 p-4 sm:p-5">
            <div className="mb-4">
              <p className="text-base font-bold">
                {admin ? 'Contribution directory' : 'Contribution history'}
              </p>
              <p className="text-xs text-muted-foreground">{remote.data?.total ?? 0} records</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                className="h-10 flex-1"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search member or reference..."
              />
              {
                <FilterDialog
                  activeCount={filterCount}
                  onReset={resetFilters}
                  title="Filter contributions"
                >
                  <div>
                    <p className="mb-2 text-xs font-semibold">Payment status</p>
                    <Select
                      value={status}
                      onValueChange={(value) => {
                        setStatus(value as typeof status)
                        setPage(1)
                      }}
                    >
                      <SelectTrigger className="min-w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All statuses</SelectItem>
                        {['UPCOMING', 'DUE', 'OVERDUE', 'PENDING', 'APPROVED', 'REJECTED'].map(
                          (value) => (
                            <SelectItem
                              key={value}
                              value={value}
                            >
                              {value}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold">Due from</p>
                    <Input
                      type="date"
                      value={dueFrom}
                      onChange={(event) => {
                        setDueFrom(event.target.value)
                        setPage(1)
                      }}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold">Due to</p>
                    <Input
                      type="date"
                      value={dueTo}
                      onChange={(event) => {
                        setDueTo(event.target.value)
                        setPage(1)
                      }}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold">Payment method</p>
                    <Select
                      value={method}
                      onValueChange={(value) => {
                        setMethod(value)
                        setPage(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All methods</SelectItem>
                        {methods.map((value) => (
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
                  <div>
                    <p className="mb-2 text-xs font-semibold">Payment proof</p>
                    <Select
                      value={proof}
                      onValueChange={(value) => {
                        setProof(value as typeof proof)
                        setPage(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">With or without proof</SelectItem>
                        <SelectItem value="WITH">Proof uploaded</SelectItem>
                        <SelectItem value="WITHOUT">No proof uploaded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold">Payment completion</p>
                    <Select
                      value={paymentState}
                      onValueChange={(value) => {
                        setPaymentState(value as typeof paymentState)
                        setPage(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Any payment completion</SelectItem>
                        <SelectItem value="PAID">Fully paid</SelectItem>
                        <SelectItem value="PARTIAL">Partially paid</SelectItem>
                        <SelectItem value="UNPAID">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold">Late fee</p>
                    <Select
                      value={lateFee}
                      onValueChange={(value) => {
                        setLateFee(value as typeof lateFee)
                        setPage(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">With or without late fee</SelectItem>
                        <SelectItem value="WITH">Late fee applied</SelectItem>
                        <SelectItem value="WITHOUT">No late fee</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold">Transaction reference</p>
                    <Select
                      value={reference}
                      onValueChange={(value) => {
                        setReference(value as typeof reference)
                        setPage(1)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">With or without reference</SelectItem>
                        <SelectItem value="WITH">Reference available</SelectItem>
                        <SelectItem value="WITHOUT">No reference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold">Paid from</p>
                    <Input
                      type="date"
                      value={paidFrom}
                      onChange={(event) => {
                        setPaidFrom(event.target.value)
                        setPage(1)
                      }}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold">Paid to</p>
                    <Input
                      type="date"
                      value={paidTo}
                      onChange={(event) => {
                        setPaidTo(event.target.value)
                        setPage(1)
                      }}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold">Minimum total due</p>
                    <Input
                      type="number"
                      min="0"
                      placeholder="RWF 0"
                      value={amountMin}
                      onChange={(event) => {
                        setAmountMin(event.target.value)
                        setPage(1)
                      }}
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold">Maximum total due</p>
                    <Input
                      type="number"
                      min="0"
                      placeholder="No maximum"
                      value={amountMax}
                      onChange={(event) => {
                        setAmountMax(event.target.value)
                        setPage(1)
                      }}
                    />
                  </div>
                </FilterDialog>
              }
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {admin && <TableHead>Member</TableHead>}
                  <TableHead>Expected</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedItems.map((item) => (
                  <TableRow key={item.id}>
                    {admin && <TableCell>{formatPersonName(item.memberName)}</TableCell>}
                    <TableCell>{money(item.expectedAmount)}</TableCell>
                    <TableCell>{money(item.paidAmount)}</TableCell>
                    <TableCell>{new Date(item.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>{item.transactionReference ?? '—'}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <TableActions
                        actions={[
                          { label: 'View Details', onSelect: () => setSelected(item) },
                          ...(item.proofUploadedAt || item.proofUrl
                            ? [{ label: 'View Proof', onSelect: () => void viewProof(item) }]
                            : []),
                          ...(admin && item.status === 'PENDING'
                            ? [
                                {
                                  label: 'Approve',
                                  onSelect: () => setApproveTarget(item),
                                  separator: true,
                                },
                                {
                                  label: 'Reject',
                                  onSelect: () => {
                                    setReason('')
                                    setRejectTarget(item)
                                  },
                                  destructive: true,
                                },
                              ]
                            : []),
                          ...(!admin && ['DUE', 'OVERDUE', 'REJECTED'].includes(item.status)
                            ? [
                                {
                                  label: 'Submit Payment Proof',
                                  onSelect: () => openPayment(item),
                                  separator: true,
                                },
                              ]
                            : []),
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {displayedItems.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={admin ? 7 : 6}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      No contributions match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          {admin && (
            <ServerPagination
              page={page}
              pageSize={10}
              total={remote.data?.total ?? 0}
              onPageChange={setPage}
            />
          )}
        </Card>
      )}
      <DetailDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(undefined)
        }}
        title="Contribution Details"
        items={
          selected
            ? [
                { label: 'Member', value: selected.memberName ?? 'Current member' },
                { label: 'Expected Amount', value: money(selected.expectedAmount) },
                { label: 'Late Fee', value: money(selected.lateFeeAmount) },
                { label: 'Total Due', value: money(selected.totalDue) },
                { label: 'Paid Amount', value: money(selected.paidAmount) },
                { label: 'Due Date', value: new Date(selected.dueDate).toLocaleDateString() },
                { label: 'Payment Method', value: selected.paymentMethod ?? '—' },
                { label: 'Transaction Reference', value: selected.transactionReference ?? '—' },
                { label: 'Status', value: selected.status, status: true },
              ]
            : []
        }
      />
      <ConfirmDialog
        open={Boolean(approveTarget)}
        onOpenChange={(open) => {
          if (!open) setApproveTarget(undefined)
        }}
        title="Approve Contribution?"
        description={`Approve ${approveTarget?.memberName ?? 'this member'}’s payment of ${money(approveTarget?.paidAmount)}?`}
        confirmLabel="Approve Contribution"
        busy={busy}
        onConfirm={() => {
          if (approveTarget)
            void act(
              () => approveContribution(approveTarget.id),
              'Contribution approved successfully.',
              () => setApproveTarget(undefined),
            )
        }}
      />
      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) setRejectTarget(undefined)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Contribution</DialogTitle>
            <DialogDescription>
              A rejection reason is required and will be stored with the contribution.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 py-5">
            <Label htmlFor="rejection-reason">Reason *</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Explain why this contribution is being rejected"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectTarget(undefined)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#213448] text-[#EAE0CF] hover:bg-[#547792]"
              disabled={busy || !reason.trim()}
              onClick={() => {
                if (rejectTarget)
                  void act(
                    () => rejectContribution(rejectTarget.id, reason),
                    'Contribution rejected.',
                    () => setRejectTarget(undefined),
                  )
              }}
            >
              {busy ? 'Rejecting…' : 'Reject Contribution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(paymentTarget)}
        onOpenChange={(open) => {
          if (!open) setPaymentTarget(undefined)
        }}
      >
        <DialogContent>
          <form onSubmit={submitPayment}>
            <DialogHeader>
              <DialogTitle>Add Contribution Payment</DialogTitle>
              <DialogDescription>
                After paying with the QR or USSD code, provide the payment information and
                supporting JPG, PNG, or PDF.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 px-6 py-5">
              <div className="rounded-xl bg-muted p-3 text-center text-sm">
                <span className="text-muted-foreground">Payment code: </span>
                <strong>*182*1*1*0784963589#</strong>
              </div>
              <div>
                <Label htmlFor="payment-amount">Amount *</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={payment.amount}
                  onChange={(event) => setPayment({ ...payment, amount: event.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="payment-method">Payment Method *</Label>
                <select
                  id="payment-method"
                  className="mt-1 h-10 w-full rounded-xl border bg-card px-3 text-sm"
                  value={payment.paymentMethod}
                  onChange={(event) =>
                    setPayment({ ...payment, paymentMethod: event.target.value })
                  }
                >
                  {['MOBILE_MONEY', 'BANK_TRANSFER', 'CASH', 'OTHER'].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="payment-reference">Transaction Reference *</Label>
                <Input
                  id="payment-reference"
                  value={payment.transactionReference}
                  onChange={(event) =>
                    setPayment({ ...payment, transactionReference: event.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="payment-proof">Proof *</Label>
                <Input
                  id="payment-proof"
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={(event) => setPayment({ ...payment, proof: event.target.files?.[0] })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentTarget(undefined)}
              >
                Cancel
              </Button>
              <Button disabled={busy}>{busy ? 'Submitting…' : 'Add Contribution'}</Button>
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
          contributionId={supportTarget.id}
          defaultMessage={`I submitted payment${supportTarget.transactionReference ? ` with transaction reference ${supportTarget.transactionReference}` : ''}, but the contribution is still pending. Please review it.`}
        />
      )}
    </div>
  )
}
