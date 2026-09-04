import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import DetailDialog from '@/components/shared/DetailDialog'
import EmptyState from '@/components/shared/EmptyState'
import FilterDialog from '@/components/shared/FilterDialog'
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
import { getApiErrorMessage } from '@/services/api'
import {
  listContributionPlansPage,
  updateContributionPlan,
  type ContributionPlan,
  type ContributionPlanInput,
} from '@/services/contributionPlanService'
import type { ContributionFrequency, ReminderFrequency } from '@/types/app'

const frequencies: ContributionFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']
const reminderFrequencies: ReminderFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']
const inputFrom = (plan: ContributionPlan): ContributionPlanInput => ({
  amount: plan.amount,
  frequency: plan.frequency,
  intervalValue: plan.intervalValue,
  dueDay: plan.dueDay,
  reminderEnabled: plan.reminderEnabled,
  reminderFrequency: plan.reminderFrequency ?? 'DAILY',
  reminderInterval: plan.reminderInterval,
  preDueReminderEnabled: plan.preDueReminderEnabled,
  preDueReminderFrequency: plan.preDueReminderFrequency ?? 'DAILY',
  preDueReminderInterval: plan.preDueReminderInterval,
  preDueReminderDaysBeforeDue: plan.preDueReminderDaysBeforeDue,
  lateFeeEnabled: plan.lateFeeEnabled,
  lateFeePercentage: plan.lateFeePercentage,
  gracePeriodDays: plan.gracePeriodDays,
})

export default function ContributionPlansPage() {
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [frequency, setFrequency] = useState<'ALL' | ContributionFrequency>('ALL')
  const [reminders, setReminders] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL')
  const [lateFees, setLateFees] = useState<'ALL' | 'ENABLED' | 'DISABLED'>('ALL')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [dueDay, setDueDay] = useState('')
  const [page, setPage] = useState(1)
  const loader = useCallback(
    () =>
      listContributionPlansPage({
        search,
        active: active === 'ALL' ? undefined : active === 'ACTIVE',
        frequency: frequency === 'ALL' ? undefined : frequency,
        reminderEnabled: reminders === 'ALL' ? undefined : reminders === 'ENABLED',
        lateFeeEnabled: lateFees === 'ALL' ? undefined : lateFees === 'ENABLED',
        dueDay: dueDay || undefined,
        amountMin: amountMin || undefined,
        amountMax: amountMax || undefined,
        page,
        pageSize: 10,
      }),
    [search, active, frequency, reminders, lateFees, dueDay, amountMin, amountMax, page],
  )
  const remote = useRemoteData(loader)
  const [selected, setSelected] = useState<ContributionPlan>()
  const [editing, setEditing] = useState<ContributionPlan>()
  const [form, setForm] = useState<ContributionPlanInput>()
  const [fieldError, setFieldError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const plans = useMemo(() => remote.data?.items ?? [], [remote.data])
  const displayedPlans = plans
  const filterCount = [
    active !== 'ALL',
    frequency !== 'ALL',
    reminders !== 'ALL',
    lateFees !== 'ALL',
    Boolean(amountMin),
    Boolean(amountMax),
    Boolean(dueDay),
  ].filter(Boolean).length
  const resetFilters = () => {
    setActive('ALL')
    setFrequency('ALL')
    setReminders('ALL')
    setLateFees('ALL')
    setAmountMin('')
    setAmountMax('')
    setDueDay('')
    setPage(1)
  }
  const openEdit = (plan: ContributionPlan) => {
    setEditing(plan)
    setForm(inputFrom(plan))
    setFieldError('')
  }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!editing || !form) return
    if (Number(form.amount) <= 0) {
      setFieldError('Amount must be greater than zero.')
      return
    }
    if (form.frequency === 'MONTHLY' && (!form.dueDay || form.dueDay < 1 || form.dueDay > 31)) {
      setFieldError('Due day must be between 1 and 31.')
      return
    }
    setIsSaving(true)
    setFieldError('')
    try {
      await updateContributionPlan(editing, form)
      toast.success('Contribution plan updated successfully.')
      setEditing(undefined)
      remote.reload()
    } catch (reason) {
      const message = getApiErrorMessage(reason, 'Unable to update contribution plan.')
      toast.error(message)
      setFieldError(message)
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <div className="min-w-0">
      <PageHeader
        title="Contribution Plans"
        description="Manage all member contribution plans"
      />
      <div className="hidden">
        <Input
          className="max-w-sm"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Search members…"
        />
        <select
          className="h-10 px-3 text-sm"
          value={active}
          onChange={(event) => {
            setActive(event.target.value as typeof active)
            setPage(1)
          }}
        >
          <option value="ALL">All plans</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>
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
        <div className="rounded-2xl border bg-card p-8 text-center">
          <p className="text-sm font-semibold">Unable to load contribution plans.</p>
          <p className="mt-1 text-xs text-destructive">{remote.error}</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={remote.reload}
          >
            Retry
          </Button>
        </div>
      ) : plans.length === 0 ? (
        <EmptyState
          title={search ? 'No results found' : 'No contribution plans found'}
          description={
            search
              ? 'No plans match the current search.'
              : 'Contribution plans are created when a member account is added.'
          }
        />
      ) : (
        <Card className="overflow-hidden shadow-card">
          <div className="border-b border-border/60 p-4 sm:p-5">
            <div className="mb-4">
              <p className="text-base font-bold">Contribution plans</p>
              <p className="text-xs text-muted-foreground">{remote.data?.total ?? 0} plans</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                className="h-10 flex-1"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
                placeholder="Search members..."
              />
              <FilterDialog
                activeCount={filterCount}
                onReset={resetFilters}
                title="Filter contribution plans"
              >
                <div>
                  <p className="mb-2 text-xs font-semibold">Plan status</p>
                  <Select
                    value={active}
                    onValueChange={(value) => {
                      setActive(value as typeof active)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All plans</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold">Frequency</p>
                  <Select
                    value={frequency}
                    onValueChange={(value) => {
                      setFrequency(value as typeof frequency)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All frequencies</SelectItem>
                      {frequencies.map((value) => (
                        <SelectItem
                          key={value}
                          value={value}
                        >
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold">Reminders</p>
                  <Select
                    value={reminders}
                    onValueChange={(value) => {
                      setReminders(value as typeof reminders)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Any reminder setting</SelectItem>
                      <SelectItem value="ENABLED">Enabled</SelectItem>
                      <SelectItem value="DISABLED">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold">Late fees</p>
                  <Select
                    value={lateFees}
                    onValueChange={(value) => {
                      setLateFees(value as typeof lateFees)
                      setPage(1)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Any late-fee setting</SelectItem>
                      <SelectItem value="ENABLED">Enabled</SelectItem>
                      <SelectItem value="DISABLED">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold">Due day</p>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Any day"
                    value={dueDay}
                    onChange={(event) => {
                      setDueDay(event.target.value)
                      setPage(1)
                    }}
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold">Minimum amount</p>
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
                  <p className="mb-2 text-xs font-semibold">Maximum amount</p>
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
            </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Due Day</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedPlans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {formatPersonName(plan.memberName)}
                    </TableCell>
                    <TableCell>RWF {Number(plan.amount).toLocaleString()}</TableCell>
                    <TableCell>{humanizeValue(plan.frequency)}</TableCell>
                    <TableCell>{plan.dueDay ?? '—'}</TableCell>
                    <TableCell>
                      <StatusBadge status={plan.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </TableCell>
                    <TableCell>
                      <TableActions
                        actions={[
                          { label: 'View Plan', onSelect: () => setSelected(plan) },
                          { label: 'Edit Plan', onSelect: () => openEdit(plan) },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {displayedPlans.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      No plans match the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <ServerPagination
            page={page}
            pageSize={10}
            total={remote.data?.total ?? 0}
            onPageChange={setPage}
          />
        </Card>
      )}
      <DetailDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(undefined)
        }}
        title="Contribution Plan Details"
        items={
          selected
            ? [
                { label: 'Member', value: selected.memberName },
                { label: 'Amount', value: `RWF ${Number(selected.amount).toLocaleString()}` },
                { label: 'Frequency', value: selected.frequency },
                { label: 'Due Day', value: String(selected.dueDay ?? '—') },
                { label: 'Start Date', value: new Date(selected.startDate).toLocaleDateString() },
                {
                  label: 'Reminder',
                  value: selected.reminderEnabled
                    ? `Overdue: ${selected.reminderFrequency ?? 'Enabled'}`
                    : 'Disabled',
                },
                {
                  label: 'Before-due reminder',
                  value: selected.preDueReminderEnabled
                    ? `${selected.preDueReminderDaysBeforeDue} day(s) before · ${selected.preDueReminderFrequency}`
                    : 'Disabled',
                },
                {
                  label: 'Late Fee',
                  value: selected.lateFeeEnabled
                    ? `${selected.lateFeePercentage ?? 0}%`
                    : 'Disabled',
                },
                { label: 'Status', value: selected.isActive ? 'ACTIVE' : 'INACTIVE', status: true },
              ]
            : []
        }
      />
      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(undefined)
        }}
      >
        <DialogContent>
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle>Edit Contribution Plan</DialogTitle>
              <DialogDescription>
                Update future contribution settings for {editing?.memberName}.
              </DialogDescription>
            </DialogHeader>
            {form && (
              <div className="grid max-h-[65vh] gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="edit-plan-amount">Amount *</Label>
                  <Input
                    id="edit-plan-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) => setForm({ ...form, amount: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-plan-frequency">Frequency *</Label>
                  <select
                    id="edit-plan-frequency"
                    className="mt-1 h-10 w-full rounded-xl border bg-card px-3 text-sm"
                    value={form.frequency}
                    onChange={(event) =>
                      setForm({ ...form, frequency: event.target.value as ContributionFrequency })
                    }
                  >
                    {frequencies.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </div>
                {form.frequency === 'MONTHLY' && (
                  <div>
                    <Label htmlFor="edit-plan-due">Due Day *</Label>
                    <Input
                      id="edit-plan-due"
                      type="number"
                      min="1"
                      max="31"
                      value={form.dueDay ?? ''}
                      onChange={(event) => setForm({ ...form, dueDay: Number(event.target.value) })}
                    />
                  </div>
                )}
                {form.frequency === 'CUSTOM' && (
                  <div>
                    <Label htmlFor="edit-plan-interval">Interval *</Label>
                    <Input
                      id="edit-plan-interval"
                      type="number"
                      min="1"
                      value={form.intervalValue ?? ''}
                      onChange={(event) =>
                        setForm({ ...form, intervalValue: Number(event.target.value) })
                      }
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="edit-plan-grace">Grace Period Days *</Label>
                  <Input
                    id="edit-plan-grace"
                    type="number"
                    min="0"
                    value={form.gracePeriodDays}
                    onChange={(event) =>
                      setForm({ ...form, gracePeriodDays: Number(event.target.value) })
                    }
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.reminderEnabled}
                    onChange={(event) =>
                      setForm({ ...form, reminderEnabled: event.target.checked })
                    }
                  />
                  Overdue reminders enabled
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.preDueReminderEnabled}
                    onChange={(event) =>
                      setForm({ ...form, preDueReminderEnabled: event.target.checked })
                    }
                  />
                  Before-due reminders enabled
                </label>
                {form.preDueReminderEnabled && (
                  <div>
                    <Label htmlFor="edit-reminder-days-before">Start Before Due (days)</Label>
                    <Input
                      id="edit-reminder-days-before"
                      type="number"
                      min="0"
                      max="365"
                      required
                      value={form.preDueReminderDaysBeforeDue}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          preDueReminderDaysBeforeDue: Number(event.target.value),
                        })
                      }
                    />
                  </div>
                )}
                {form.preDueReminderEnabled && (
                  <div>
                    <Label htmlFor="edit-pre-reminder-frequency">Before-due Frequency</Label>
                    <select
                      id="edit-pre-reminder-frequency"
                      className="mt-1 h-10 w-full rounded-xl border bg-card px-3 text-sm"
                      value={form.preDueReminderFrequency}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          preDueReminderFrequency: event.target.value as ReminderFrequency,
                        })
                      }
                    >
                      {reminderFrequencies.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </div>
                )}
                {form.preDueReminderEnabled && form.preDueReminderFrequency === 'CUSTOM' && (
                  <div>
                    <Label htmlFor="edit-pre-reminder-interval">Repeat Every (days)</Label>
                    <Input
                      id="edit-pre-reminder-interval"
                      type="number"
                      min="1"
                      max="365"
                      required
                      value={form.preDueReminderInterval ?? ''}
                      onChange={(event) =>
                        setForm({ ...form, preDueReminderInterval: Number(event.target.value) })
                      }
                    />
                  </div>
                )}
                {form.reminderEnabled && (
                  <div>
                    <Label htmlFor="edit-reminder-frequency">Overdue Frequency</Label>
                    <select
                      id="edit-reminder-frequency"
                      className="mt-1 h-10 w-full rounded-xl border bg-card px-3 text-sm"
                      value={form.reminderFrequency}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          reminderFrequency: event.target.value as ReminderFrequency,
                        })
                      }
                    >
                      {reminderFrequencies.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </div>
                )}
                {form.reminderEnabled && form.reminderFrequency === 'CUSTOM' && (
                  <div>
                    <Label htmlFor="edit-reminder-interval">Repeat Every (days)</Label>
                    <Input
                      id="edit-reminder-interval"
                      type="number"
                      min="1"
                      max="365"
                      required
                      value={form.reminderInterval ?? ''}
                      onChange={(event) =>
                        setForm({ ...form, reminderInterval: Number(event.target.value) })
                      }
                    />
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.lateFeeEnabled}
                    onChange={(event) => setForm({ ...form, lateFeeEnabled: event.target.checked })}
                  />
                  Late fee enabled
                </label>
                {form.lateFeeEnabled && (
                  <div>
                    <Label htmlFor="edit-late-fee">Late Fee Percentage *</Label>
                    <Input
                      id="edit-late-fee"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.lateFeePercentage ?? ''}
                      onChange={(event) =>
                        setForm({ ...form, lateFeePercentage: event.target.value })
                      }
                    />
                  </div>
                )}
                {fieldError && (
                  <p className="text-xs text-destructive sm:col-span-2">{fieldError}</p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setEditing(undefined)}
              >
                Cancel
              </Button>
              <Button disabled={isSaving}>{isSaving ? 'Updating…' : 'Update Plan'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
