import { useState, type FormEvent } from 'react'
import { ChevronLeft, ChevronRight, Check, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiErrorMessage } from '@/services/api'
import { createMember } from '@/services/memberService'
import type { ContributionFrequency, MemberInput, ReminderFrequency } from '@/types/app'

const today = () => new Date().toISOString().slice(0, 10)
const frequencies: ContributionFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']
const reminderFrequencies: ReminderFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM']
const steps = ['Member details', 'Contribution plan', 'Reminders & fees', 'Review']

const firstDueDate = (form: MemberInput) => {
  const start = new Date(`${form.contribution.startDate}T00:00:00Z`)
  if (form.contribution.frequency !== 'MONTHLY' || !form.contribution.dueDay) return start
  const dueDay = form.contribution.dueDay
  const makeDueDate = (year: number, month: number) => {
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    return new Date(Date.UTC(year, month, Math.min(dueDay, lastDay)))
  }
  let due = makeDueDate(start.getUTCFullYear(), start.getUTCMonth())
  if (due < start) due = makeDueDate(start.getUTCFullYear(), start.getUTCMonth() + 1)
  return due
}

const initialForm = (): MemberInput => ({
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
  preDueReminder: { enabled: true, startDate: '', frequency: 'DAILY' },
  overdueReminder: { enabled: true, frequency: 'DAILY' },
})

const frequencyField = (
  id: string,
  label: string,
  value: ReminderFrequency,
  onChange: (value: ReminderFrequency) => void,
) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <select
      id={id}
      className="mt-1 h-10 w-full rounded-xl border bg-card px-3 text-sm"
      value={value}
      onChange={(event) => onChange(event.target.value as ReminderFrequency)}
    >
      {reminderFrequencies.map((frequency) => (
        <option key={frequency}>{frequency}</option>
      ))}
    </select>
  </div>
)

export default function NewMemberPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [furthestStep, setFurthestStep] = useState(0)
  const [form, setForm] = useState<MemberInput>(initialForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const validateStep = () => {
    if (step === 0 && (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()))
      return 'Full name, email, and phone are required.'
    if (step === 1) {
      if (Number(form.contribution.amount) <= 0) return 'Contribution amount must be positive.'
      if (!form.contribution.startDate) return 'Contribution start date is required.'
      if (form.contribution.frequency === 'MONTHLY' && !form.contribution.dueDay)
        return 'Monthly due day is required.'
      if (form.contribution.frequency === 'CUSTOM' && !form.contribution.intervalValue)
        return 'Custom contribution interval is required.'
    }
    if (step === 2) {
      if (form.preDueReminder.enabled && !form.preDueReminder.startDate)
        return 'Choose when before-due reminders should start.'
      if (form.preDueReminder.enabled && form.preDueReminder.startDate) {
        const reminderStart = new Date(`${form.preDueReminder.startDate}T00:00:00Z`)
        const due = firstDueDate(form)
        const daysBeforeDue = (due.getTime() - reminderStart.getTime()) / 86_400_000
        if (daysBeforeDue < 0)
          return 'The before-due reminder start date must be on or before the first due date.'
        if (daysBeforeDue > 365)
          return 'The before-due reminder start date cannot be more than 365 days before the first due date.'
      }
      if (
        form.preDueReminder.enabled &&
        form.preDueReminder.frequency === 'CUSTOM' &&
        (!form.preDueReminder.interval || form.preDueReminder.interval < 1)
      )
        return 'Enter a valid custom before-due reminder interval.'
      if (
        form.overdueReminder.enabled &&
        form.overdueReminder.frequency === 'CUSTOM' &&
        (!form.overdueReminder.interval || form.overdueReminder.interval < 1)
      )
        return 'Enter a valid custom overdue reminder interval.'
      if (form.contribution.lateFeeEnabled && !form.contribution.lateFeePercentage)
        return 'Enter the late-fee percentage.'
    }
    return ''
  }

  const continueToNext = () => {
    const message = validateStep()
    if (message) return setError(message)
    setError('')
    setStep((current) => {
      const next = Math.min(current + 1, 3)
      setFurthestStep((furthest) => Math.max(furthest, next))
      return next
    })
  }

  const editStep = (target: number) => {
    setConfirmed(false)
    setError('')
    setStep(target)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!confirmed) return
    setSaving(true)
    setError('')
    try {
      await createMember(form)
      toast.success('Member and contribution plan created successfully.')
      navigate('/admin/members')
    } catch (reason) {
      const message = getApiErrorMessage(reason, 'Unable to create the member.')
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">Register Member</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create the member, contribution schedule, and both reminder schedules.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {steps.map((label, index) => (
          <div
            key={label}
            className="min-w-0"
          >
            <div
              className={`h-1.5 rounded-full ${index <= furthestStep ? 'bg-primary' : 'bg-muted'}`}
            />
            <div className="mt-2 flex items-center gap-1.5">
              {index < furthestStep && index !== step ? (
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="size-3" />
                </span>
              ) : (
                <span
                  className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${index === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  {index + 1}
                </span>
              )}
              <p
                className={`truncate text-xs ${index === step ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}
              >
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submit}>
        <Card>
          <CardHeader>
            <CardTitle>{steps[step]}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {step === 0 && (
              <>
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="amount">Contribution Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.contribution.amount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contribution: { ...form.contribution, amount: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="frequency">Contribution Frequency</Label>
                  <select
                    id="frequency"
                    className="mt-1 h-10 w-full rounded-xl border bg-card px-3 text-sm"
                    value={form.contribution.frequency}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contribution: {
                          ...form.contribution,
                          frequency: e.target.value as ContributionFrequency,
                        },
                      })
                    }
                  >
                    {frequencies.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </div>
                {form.contribution.frequency === 'MONTHLY' && (
                  <div>
                    <Label htmlFor="due-day">Due Day</Label>
                    <Input
                      id="due-day"
                      type="number"
                      min="1"
                      max="31"
                      value={form.contribution.dueDay ?? ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contribution: { ...form.contribution, dueDay: Number(e.target.value) },
                        })
                      }
                    />
                  </div>
                )}
                {form.contribution.frequency === 'CUSTOM' && (
                  <div>
                    <Label htmlFor="plan-interval">Repeat Every (days)</Label>
                    <Input
                      id="plan-interval"
                      type="number"
                      min="1"
                      value={form.contribution.intervalValue ?? ''}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contribution: {
                            ...form.contribution,
                            intervalValue: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="start-date">Contribution Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={form.contribution.startDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contribution: { ...form.contribution, startDate: e.target.value },
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="grace">Grace Period (days)</Label>
                  <Input
                    id="grace"
                    type="number"
                    min="0"
                    value={form.contribution.gracePeriodDays}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contribution: {
                          ...form.contribution,
                          gracePeriodDays: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <section className="space-y-5 rounded-2xl bg-card p-5 shadow-card sm:col-span-2">
                  <div className="flex items-start gap-3">
                    <div>
                      <h2 className="font-semibold">Before-due reminders</h2>
                      <p className="text-xs text-muted-foreground">
                        Sent before the contribution becomes overdue.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.preDueReminder.enabled}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          preDueReminder: { ...form.preDueReminder, enabled: e.target.checked },
                        })
                      }
                    />{' '}
                    Enable before-due reminders
                  </label>
                  {form.preDueReminder.enabled && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="pre-start">Reminder Start Date</Label>
                        <Input
                          id="pre-start"
                          type="date"
                          value={form.preDueReminder.startDate ?? ''}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              preDueReminder: { ...form.preDueReminder, startDate: e.target.value },
                            })
                          }
                        />
                      </div>
                      {frequencyField(
                        'pre-frequency',
                        'Reminder Frequency',
                        form.preDueReminder.frequency,
                        (frequency) =>
                          setForm({
                            ...form,
                            preDueReminder: { ...form.preDueReminder, frequency },
                          }),
                      )}
                      {form.preDueReminder.frequency === 'CUSTOM' && (
                        <div>
                          <Label htmlFor="pre-interval">Custom Interval (days)</Label>
                          <Input
                            id="pre-interval"
                            type="number"
                            min="1"
                            max="365"
                            value={form.preDueReminder.interval ?? ''}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                preDueReminder: {
                                  ...form.preDueReminder,
                                  interval: Number(e.target.value),
                                },
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}
                </section>

                <section className="space-y-5 rounded-2xl bg-card p-5 shadow-card sm:col-span-2">
                  <div className="flex items-start gap-3">
                    <div>
                      <h2 className="font-semibold">Overdue reminders</h2>
                      <p className="text-xs text-muted-foreground">
                        Start after the contribution status becomes overdue.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.overdueReminder.enabled}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          overdueReminder: { ...form.overdueReminder, enabled: e.target.checked },
                        })
                      }
                    />{' '}
                    Enable overdue reminders
                  </label>
                  {form.overdueReminder.enabled && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {frequencyField(
                        'overdue-frequency',
                        'Reminder Frequency',
                        form.overdueReminder.frequency,
                        (frequency) =>
                          setForm({
                            ...form,
                            overdueReminder: { ...form.overdueReminder, frequency },
                          }),
                      )}
                      {form.overdueReminder.frequency === 'CUSTOM' && (
                        <div>
                          <Label htmlFor="overdue-interval">Custom Interval (days)</Label>
                          <Input
                            id="overdue-interval"
                            type="number"
                            min="1"
                            max="365"
                            value={form.overdueReminder.interval ?? ''}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                overdueReminder: {
                                  ...form.overdueReminder,
                                  interval: Number(e.target.value),
                                },
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  )}
                </section>

                <section className="space-y-4 rounded-2xl bg-card p-5 shadow-card sm:col-span-2">
                  <h2 className="font-semibold">Late fee</h2>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.contribution.lateFeeEnabled}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          contribution: { ...form.contribution, lateFeeEnabled: e.target.checked },
                        })
                      }
                    />{' '}
                    Enable late fee when overdue
                  </label>
                  {form.contribution.lateFeeEnabled && (
                    <div className="max-w-xs">
                      <Label htmlFor="late-fee">Late Fee Percentage</Label>
                      <Input
                        id="late-fee"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={form.contribution.lateFeePercentage ?? ''}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            contribution: {
                              ...form.contribution,
                              lateFeePercentage: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  )}
                </section>
              </>
            )}

            {step === 3 && (
              <div className="grid gap-3 sm:col-span-2">
                <Review
                  title="Member"
                  onEdit={() => editStep(0)}
                  rows={[
                    ['Name', form.fullName],
                    ['Email', form.email],
                    ['Phone', form.phone],
                  ]}
                />
                <Review
                  title="Contribution"
                  onEdit={() => editStep(1)}
                  rows={[
                    ['Amount', form.contribution.amount],
                    ['Frequency', form.contribution.frequency],
                    ['Due day', String(form.contribution.dueDay ?? '—')],
                    ['Start date', form.contribution.startDate],
                    ['Grace period', `${form.contribution.gracePeriodDays} day(s)`],
                  ]}
                />
                <Review
                  title="Before due"
                  onEdit={() => editStep(2)}
                  rows={[
                    ['Enabled', form.preDueReminder.enabled ? 'Yes' : 'No'],
                    ['Starts', form.preDueReminder.startDate ?? '—'],
                    ['Frequency', form.preDueReminder.frequency],
                    [
                      'Custom interval',
                      form.preDueReminder.interval ? `${form.preDueReminder.interval} day(s)` : '—',
                    ],
                  ]}
                />
                <Review
                  title="Overdue"
                  onEdit={() => editStep(2)}
                  rows={[
                    ['Enabled', form.overdueReminder.enabled ? 'Yes' : 'No'],
                    ['Frequency', form.overdueReminder.frequency],
                    [
                      'Custom interval',
                      form.overdueReminder.interval
                        ? `${form.overdueReminder.interval} day(s)`
                        : '—',
                    ],
                    [
                      'Late fee',
                      form.contribution.lateFeeEnabled
                        ? `${form.contribution.lateFeePercentage}%`
                        : 'Disabled',
                    ],
                  ]}
                />
                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-primary/5 p-5 shadow-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 accent-primary"
                    checked={confirmed}
                    onChange={(event) => setConfirmed(event.target.checked)}
                  />
                  <span>
                    <span className="block text-sm font-semibold">Confirm member information</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      I have reviewed the member, contribution, reminder, and late-fee settings.
                    </span>
                  </span>
                </label>
              </div>
            )}

            {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          </CardContent>
        </Card>

        <div className={`mt-5 flex ${step === 0 ? 'justify-end' : 'justify-between'}`}>
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft className="size-4" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              type="button"
              onClick={continueToNext}
            >
              Save & Continue <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button disabled={saving || !confirmed}>
              <Check className="size-4" /> {saving ? 'Creating…' : 'Create Member'}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

function Review({
  title,
  rows,
  onEdit,
}: {
  title: string
  rows: Array<[string, string]>
  onEdit: () => void
}) {
  return (
    <section className="rounded-xl bg-card px-5 py-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
        >
          <Pencil className="size-3.5" /> Edit
        </Button>
      </div>
      <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right font-medium">
              {label === 'Enabled' ? (
                <Badge variant={value === 'Yes' ? 'success' : 'default'}>{value}</Badge>
              ) : label === 'Frequency' ? (
                <Badge>{value}</Badge>
              ) : label === 'Late fee' ? (
                <Badge variant={value === 'Disabled' ? 'default' : 'success'}>{value}</Badge>
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
