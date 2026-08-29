import { useCallback, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import DetailDialog from '@/components/shared/DetailDialog'
import EmptyState from '@/components/shared/EmptyState'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRemoteData } from '@/hooks/useRemoteData'
import { getApiErrorMessage } from '@/services/api'
import {
  listContributionPlansPage,
  updateContributionPlan,
  type ContributionPlan,
  type ContributionPlanInput,
} from '@/services/contributionPlanService'
import type { ContributionFrequency, ReminderFrequency } from '@/types/app'

const frequencies: ContributionFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']
const reminderFrequencies: ReminderFrequency[] = ['DAILY', 'WEEKLY', 'CUSTOM']
const inputFrom = (plan: ContributionPlan): ContributionPlanInput => ({
  amount: plan.amount,
  frequency: plan.frequency,
  intervalValue: plan.intervalValue,
  dueDay: plan.dueDay,
  reminderEnabled: plan.reminderEnabled,
  reminderFrequency: plan.reminderFrequency ?? 'DAILY',
  reminderInterval: plan.reminderInterval,
  lateFeeEnabled: plan.lateFeeEnabled,
  lateFeePercentage: plan.lateFeePercentage,
  gracePeriodDays: plan.gracePeriodDays,
})

export default function ContributionPlansPage() {
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [page, setPage] = useState(1)
  const loader = useCallback(
    () =>
      listContributionPlansPage({
        search,
        active: active === 'ALL' ? undefined : active === 'ACTIVE',
        page,
        pageSize: 10,
      }),
    [search, active, page],
  )
  const remote = useRemoteData(loader)
  const [selected, setSelected] = useState<ContributionPlan>()
  const [editing, setEditing] = useState<ContributionPlan>()
  const [form, setForm] = useState<ContributionPlanInput>()
  const [fieldError, setFieldError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const plans = remote.data?.items ?? []
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
    <div>
      <PageHeader
        title="Contribution Plans"
        description="Manage all member contribution plans"
      />
      <div className="mb-3 flex flex-wrap gap-2">
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
          className="h-10 rounded-xl border bg-card px-3 text-sm"
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
      <ServerPagination
        page={page}
        pageSize={10}
        total={remote.data?.total ?? 0}
        onPageChange={setPage}
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
        <div className="rounded-2xl border bg-card p-8 text-center">
          <p className="text-sm font-semibold">Unable to load contribution plans.</p>
          <p className="mt-1 text-xs text-red-700">{remote.error}</p>
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
        <Card>
          <CardContent className="overflow-x-auto p-0">
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
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.memberName}</TableCell>
                    <TableCell>RWF {Number(plan.amount).toLocaleString()}</TableCell>
                    <TableCell>{plan.frequency}</TableCell>
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
              </TableBody>
            </Table>
          </CardContent>
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
                    ? (selected.reminderFrequency ?? 'Enabled')
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
                  Reminders enabled
                </label>
                {form.reminderEnabled && (
                  <div>
                    <Label htmlFor="edit-reminder-frequency">Reminder Frequency</Label>
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
                {fieldError && <p className="text-xs text-red-700 sm:col-span-2">{fieldError}</p>}
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
