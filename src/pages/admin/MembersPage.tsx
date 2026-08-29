import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import DetailDialog from '@/components/shared/DetailDialog'
import EmptyState from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import StatusBadge from '@/components/shared/StatusBadge'
import TableActions from '@/components/shared/TableActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const { members, isLoading, error, setError, reload, create, update, find, changeStatus } =
    useMembers()
  const [form, setForm] = useState<MemberInput>(emptyForm)
  const [editingId, setEditingId] = useState<string>()
  const [showForm, setShowForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Member>()
  const [statusTarget, setStatusTarget] = useState<Member>()
  const [fieldError, setFieldError] = useState('')

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
    <div>
      <PageHeader
        title="Members"
        description="Create members with their contribution plan and reminder settings"
        action={
          <Button
            className="rounded-full"
            onClick={() => (showForm ? setShowForm(false) : openCreate())}
          >
            {showForm ? 'Cancel' : 'Add Member'}
          </Button>
        }
      />
      <form
        className="mb-3 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          void reload({ search })
        }}
      >
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search members…"
        />
        <Button
          type="submit"
          variant="outline"
        >
          Search
        </Button>
      </form>
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700"
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
            <div className="grid max-h-[65vh] gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
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
              {fieldError && <p className="text-xs text-red-700 sm:col-span-2">{fieldError}</p>}
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
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
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
                    <TableCell colSpan={6}>
                      <div className="h-8 animate-pulse rounded-lg bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
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
                members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.fullName}</TableCell>
                    <TableCell>{member.email}</TableCell>
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
                { label: 'Member ID', value: selected.id },
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
