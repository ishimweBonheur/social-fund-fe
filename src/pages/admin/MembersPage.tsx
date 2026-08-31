import { useMemo, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Download,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  UserCheck,
  UsersRound,
} from 'lucide-react'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import DetailDialog from '@/components/shared/DetailDialog'
import EmptyState from '@/components/shared/EmptyState'
import FilterDialog from '@/components/shared/FilterDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import Pagination from '@/components/shared/Pagination'
import StatusBadge from '@/components/shared/StatusBadge'
import TableActions from '@/components/shared/TableActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useMembers } from '@/hooks/useMembers'
import { getApiErrorMessage } from '@/services/api'
import { formatPersonName } from '@/lib/utils'
import type {
  ContributionFrequency,
  Member,
  MemberInput,
  MemberUpdateInput,
  ReminderFrequency,
} from '@/types/app'

const today = () => new Date().toISOString().slice(0, 10)
const emptyForm = (): MemberInput => ({
  fullName: '',
  email: '',
  phone: '',
  contribution: {
    amount: '',
    frequency: 'MONTHLY',
    dueDay: 1,
    startDate: today(),
    lateFeeEnabled: false,
    lateFeePercentage: '',
    gracePeriodDays: 0,
  },
  reminder: { enabled: false, frequency: 'DAILY' },
})
const contributionFrequencies: ContributionFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']
const reminderFrequencies: ReminderFrequency[] = ['DAILY', 'WEEKLY', 'CUSTOM']

export default function MembersPage() {
  const location = useLocation()
  const routedMember = (location.state as { member?: Member } | null)?.member
  const [form, setForm] = useState<MemberInput>(emptyForm)
  const [editingId, setEditingId] = useState<string>()
  const [showForm, setShowForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [status, setStatus] = useState<'ALL' | Member['status']>('ALL')
  const [joinedFrom, setJoinedFrom] = useState('')
  const [joinedTo, setJoinedTo] = useState('')
  const memberQuery = useMemo(
    () => ({
      search,
      status: status === 'ALL' ? undefined : status,
      joinedFrom: joinedFrom || undefined,
      joinedTo: joinedTo || undefined,
      page,
      pageSize,
    }),
    [search, status, joinedFrom, joinedTo, page, pageSize],
  )
  const { members, total, isLoading, error, setError, reload, create, update, find, changeStatus } =
    useMembers(memberQuery)
  const [selected, setSelected] = useState<Member | undefined>(routedMember)
  const [statusTarget, setStatusTarget] = useState<Member>()
  const [fieldError, setFieldError] = useState('')
  const filteredMembers = members
  const displayedMembers = members
  const activeCount = members.filter((member) => member.status === 'ACTIVE').length
  const suspendedCount = members.filter((member) => member.status === 'SUSPENDED').length
  const inactiveCount = members.filter((member) => member.status === 'INACTIVE').length
  const exportMembers = () => {
    const csv = [
      'Name,Email,Phone,Status,Joined',
      ...filteredMembers.map((member) =>
        [member.fullName, member.email, member.phone, member.status, member.createdAt]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(','),
      ),
    ].join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = 'social-fund-members.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const openCreate = () => {
    setEditingId(undefined)
    setForm(emptyForm())
    setError('')
    setFieldError('')
    setShowForm(true)
  }
  const openEdit = async (member: Member) => {
    setError('')
    try {
      const detail = await find(member.id)
      setEditingId(detail.id)
      setForm((value) => ({
        ...value,
        fullName: detail.fullName,
        email: detail.email,
        phone: detail.phone,
      }))
      setShowForm(true)
    } catch (reason) {
      setError(getApiErrorMessage(reason, 'Unable to load the member.'))
    }
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      setFieldError('Full name, email, and phone are required.')
      setIsSaving(false)
      return
    }
    if (!editingId && Number(form.contribution.amount) <= 0) {
      setFieldError('Contribution amount must be greater than zero.')
      setIsSaving(false)
      return
    }
    setFieldError('')
    try {
      if (editingId) {
        const input: MemberUpdateInput = {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
        }
        await update(editingId, input)
      } else await create(form)
      toast.success(
        editingId
          ? 'Member updated successfully.'
          : 'Member and contribution plan created successfully.',
      )
      setForm(emptyForm())
      setEditingId(undefined)
      setShowForm(false)
    } catch (reason) {
      const message = getApiErrorMessage(reason, 'Unable to save the member.')
      setError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }
  const changeMemberStatus = async (member: Member) => {
    const next = member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
    setError('')
    try {
      await changeStatus(member.id, next)
      setStatusTarget(undefined)
      toast.success(
        next === 'ACTIVE' ? 'Member activated successfully.' : 'Member suspended successfully.',
      )
    } catch (reason) {
      const message = getApiErrorMessage(reason, 'Unable to change member status.')
      setError(message)
      toast.error(message)
    }
  }

  return (
    <div className="min-w-0 space-y-5">
      <PageHeader
        title="Members"
        description="Manage members, their contribution plans and account access."
        action={
          <Button onClick={() => (showForm ? setShowForm(false) : openCreate())}>
            {!showForm && <Plus className="h-4 w-4" />}
            {showForm ? 'Cancel' : 'Add member'}
          </Button>
        }
      />
      <form
        className="hidden"
        onSubmit={(event) => {
          event.preventDefault()
          void reload({ search })
        }}
      >
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 pl-10"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search members…"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
        >
          Search members
        </Button>
      </form>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            'Total members',
            members.length,
            'All registered accounts',
            UsersRound,
            'bg-primary/10 text-primary',
          ],
          [
            'Active members',
            activeCount,
            members.length
              ? `${((activeCount / members.length) * 100).toFixed(1)}% of total`
              : 'No members yet',
            UserCheck,
            'bg-[#547792]/15 text-[#547792]',
          ],
          [
            'Inactive members',
            inactiveCount,
            'Require attention',
            RefreshCw,
            'bg-[#94B4C1]/25 text-[#547792]',
          ],
          [
            'Suspended members',
            suspendedCount,
            'Access restricted',
            ShieldAlert,
            'bg-rose-500/10 text-rose-600',
          ],
        ].map(([label, value, detail, Icon, tone]) => {
          const MetricIcon = Icon as typeof UsersRound
          return (
            <Card
              key={String(label)}
              className="shadow-card"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${tone}`}>
                  <MetricIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">{label as string}</p>
                  <p className="mt-0.5 text-2xl font-extrabold tracking-tight">{value as number}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{detail as string}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-[#94B4C1]/25 p-3 text-sm text-[#213448] dark:text-[#EAE0CF]"
        >
          {error}
        </p>
      )}
      <Dialog
        open={showForm}
        onOpenChange={setShowForm}
      >
        <DialogContent className="max-w-3xl">
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Member' : 'Add Member'}</DialogTitle>
              <DialogDescription>
                {editingId
                  ? 'Update this member’s account information.'
                  : 'Create a member with an initial contribution plan and reminder settings.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid max-h-[65vh] gap-x-5 gap-y-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
              <div className="border-b border-border/60 pb-3 sm:col-span-2">
                <p className="text-sm font-bold">Member information</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Basic identity and contact details
                </p>
              </div>
              <div>
                <Label htmlFor="member-name">Full Name</Label>
                <Input
                  id="member-name"
                  required
                  value={form.fullName}
                  onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="member-email">Email</Label>
                <Input
                  id="member-email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="member-phone">Phone</Label>
                <Input
                  id="member-phone"
                  required
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </div>
              {!editingId && (
                <>
                  <div className="mt-2 border-b border-border/60 pb-3 sm:col-span-2">
                    <p className="text-sm font-bold">Contribution setup</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Plan schedule, fees and reminders
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="plan-amount">Contribution Amount</Label>
                    <Input
                      id="plan-amount"
                      required
                      min="0.01"
                      step="0.01"
                      type="number"
                      value={form.contribution.amount}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          contribution: { ...form.contribution, amount: event.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="plan-frequency">Contribution Frequency</Label>
                    <select
                      id="plan-frequency"
                      className="mt-1 h-10 w-full rounded-xl border bg-card px-3 text-sm"
                      value={form.contribution.frequency}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          contribution: {
                            ...form.contribution,
                            frequency: event.target.value as ContributionFrequency,
                          },
                        })
                      }
                    >
                      {contributionFrequencies.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </div>
                  {form.contribution.frequency === 'MONTHLY' && (
                    <div>
                      <Label htmlFor="due-day">Due Day</Label>
                      <Input
                        id="due-day"
                        required
                        min="1"
                        max="31"
                        type="number"
                        value={form.contribution.dueDay ?? ''}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            contribution: {
                              ...form.contribution,
                              dueDay: Number(event.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  )}
                  {form.contribution.frequency === 'CUSTOM' && (
                    <div>
                      <Label htmlFor="plan-interval">Interval (days)</Label>
                      <Input
                        id="plan-interval"
                        required
                        min="1"
                        type="number"
                        value={form.contribution.intervalValue ?? ''}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            contribution: {
                              ...form.contribution,
                              intervalValue: Number(event.target.value),
                            },
                          })
                        }
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      required
                      type="date"
                      value={form.contribution.startDate}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          contribution: { ...form.contribution, startDate: event.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="grace-days">Grace Period (days)</Label>
                    <Input
                      id="grace-days"
                      required
                      min="0"
                      type="number"
                      value={form.contribution.gracePeriodDays}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          contribution: {
                            ...form.contribution,
                            gracePeriodDays: Number(event.target.value),
                          },
                        })
                      }
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.contribution.lateFeeEnabled}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          contribution: {
                            ...form.contribution,
                            lateFeeEnabled: event.target.checked,
                          },
                        })
                      }
                    />
                    Enable late fee
                  </label>
                  {form.contribution.lateFeeEnabled && (
                    <div>
                      <Label htmlFor="late-fee">Late Fee Percentage</Label>
                      <Input
                        id="late-fee"
                        required
                        min="0"
                        max="100"
                        step="0.01"
                        type="number"
                        value={form.contribution.lateFeePercentage ?? ''}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            contribution: {
                              ...form.contribution,
                              lateFeePercentage: event.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.reminder.enabled}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          reminder: { ...form.reminder, enabled: event.target.checked },
                        })
                      }
                    />
                    Enable reminders
                  </label>
                  {form.reminder.enabled && (
                    <div>
                      <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
                      <select
                        id="reminder-frequency"
                        className="mt-1 h-10 w-full rounded-xl border bg-card px-3 text-sm"
                        value={form.reminder.frequency}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            reminder: {
                              ...form.reminder,
                              frequency: event.target.value as ReminderFrequency,
                            },
                          })
                        }
                      >
                        {reminderFrequencies.map((value) => (
                          <option key={value}>{value}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {form.reminder.enabled && form.reminder.frequency === 'CUSTOM' && (
                    <div>
                      <Label htmlFor="reminder-interval">Reminder Interval (days)</Label>
                      <Input
                        id="reminder-interval"
                        required
                        min="1"
                        type="number"
                        value={form.reminder.interval ?? ''}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            reminder: { ...form.reminder, interval: Number(event.target.value) },
                          })
                        }
                      />
                    </div>
                  )}
                </>
              )}
              {fieldError && <p className="text-xs text-destructive sm:col-span-2">{fieldError}</p>}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button disabled={isSaving}>
                {isSaving
                  ? editingId
                    ? 'Updating…'
                    : 'Creating…'
                  : editingId
                    ? 'Update Member'
                    : 'Create Member and Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Card className="overflow-hidden shadow-card">
        <div className="flex flex-col gap-4 border-b border-border/60 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-bold">Member directory</p>
              <p className="text-xs text-muted-foreground">{filteredMembers.length} members</p>
            </div>
            <Button
              variant="outline"
              onClick={exportMembers}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault()
              setPage(1)
              void reload({ search, status: status === 'ALL' ? undefined : status })
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-10 pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email or phone..."
              />
            </div>
            <FilterDialog
              activeCount={
                [status !== 'ALL', Boolean(joinedFrom), Boolean(joinedTo)].filter(Boolean).length
              }
              onReset={() => {
                setStatus('ALL')
                setJoinedFrom('')
                setJoinedTo('')
                setPage(1)
              }}
              title="Filter members"
            >
              <div>
                <p className="mb-2 text-xs font-semibold">Account status</p>
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value as typeof status)
                    setPage(1)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold">Joined from</p>
                <Input
                  type="date"
                  aria-label="Joined from"
                  className="sm:w-40"
                  value={joinedFrom}
                  onChange={(event) => {
                    setJoinedFrom(event.target.value)
                    setPage(1)
                  }}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold">Joined to</p>
                <Input
                  type="date"
                  aria-label="Joined to"
                  className="sm:w-40"
                  value={joinedTo}
                  onChange={(event) => {
                    setJoinedTo(event.target.value)
                    setPage(1)
                  }}
                />
              </div>
            </FilterDialog>
            <Button
              type="submit"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            {search && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSearch('')
                  setPage(1)
                  void reload()
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </form>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }, (_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={5}>
                      <div className="h-8 animate-pulse rounded-lg bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="p-0"
                  >
                    <EmptyState
                      title={search ? 'No results found' : 'No members found'}
                      description={
                        search
                          ? 'No members match your search.'
                          : 'There are currently no Social Fund members.'
                      }
                      action={
                        <Button
                          onClick={
                            search
                              ? () => {
                                  setSearch('')
                                  void reload()
                                }
                              : openCreate
                          }
                        >
                          {search ? 'Clear Search' : 'Add Member'}
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                displayedMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-accent text-xs font-bold text-primary">
                            {member.fullName
                              .split(' ')
                              .map((part) => part[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {formatPersonName(member.fullName)}
                          </p>
                          <p className="truncate text-xs font-normal text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{member.phone || '—'}</TableCell>
                    <TableCell>
                      <StatusBadge status={member.status} />
                    </TableCell>
                    <TableCell>
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell>
                      <TableActions
                        actions={[
                          { label: 'View Details', onSelect: () => setSelected(member) },
                          { label: 'Edit Member', onSelect: () => void openEdit(member) },
                          ...(member.status !== 'INACTIVE'
                            ? [
                                {
                                  label:
                                    member.status === 'ACTIVE'
                                      ? 'Suspend Member'
                                      : 'Activate Member',
                                  onSelect: () => setStatusTarget(member),
                                  separator: true,
                                  destructive: member.status === 'ACTIVE',
                                },
                              ]
                            : []),
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {!isLoading && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setPage(1)
            }}
          />
        )}
      </Card>
      <DetailDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(undefined)
        }}
        title="Member Details"
        description="Social Fund member account information"
        items={
          selected
            ? [
                { label: 'Full Name', value: selected.fullName },
                { label: 'Email', value: selected.email },
                { label: 'Phone', value: selected.phone },
                { label: 'Role', value: selected.role },
                { label: 'Status', value: selected.status, status: true },
                { label: 'Created', value: new Date(selected.createdAt).toLocaleString() },
              ]
            : []
        }
      />
      <ConfirmDialog
        open={Boolean(statusTarget)}
        onOpenChange={(open) => {
          if (!open) setStatusTarget(undefined)
        }}
        title={statusTarget?.status === 'ACTIVE' ? 'Suspend Member?' : 'Activate Member?'}
        description={
          statusTarget?.status === 'ACTIVE'
            ? `${statusTarget.fullName} will no longer be able to access Social Fund. Historical records will remain available.`
            : `${statusTarget?.fullName} will regain access to Social Fund.`
        }
        confirmLabel={statusTarget?.status === 'ACTIVE' ? 'Suspend Member' : 'Activate Member'}
        destructive={statusTarget?.status === 'ACTIVE'}
        onConfirm={() => {
          if (statusTarget) void changeMemberStatus(statusTarget)
        }}
      />
    </div>
  )
}
