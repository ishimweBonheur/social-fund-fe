import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { CreditCard } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRemoteData } from '@/hooks/useRemoteData'
import {
  getPaymentSettings,
  updatePaymentSettings,
  type PaymentSettings,
} from '@/services/paymentSettingsService'

export default function PaymentSettingsPage() {
  const remote = useRemoteData(useCallback(() => getPaymentSettings(true), []))
  if (!remote.data)
    return <p className="text-sm text-muted-foreground">Loading payment settings…</p>
  return <PaymentSettingsForm initial={remote.data} />
}
function PaymentSettingsForm({ initial }: { initial: PaymentSettings }) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const save = async () => {
    setSaving(true)
    try {
      setForm(await updatePaymentSettings(form))
      toast.success('Payment settings updated.')
    } catch {
      toast.error('Unable to update payment settings.')
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="w-full space-y-5">
      <PageHeader
        title="Payment method"
        description="Configure the account and USSD code shown to members."
      />
      <Card className="shadow-card">
        <CardContent className="grid gap-5 p-6 md:grid-cols-2">
          <div>
            <Label htmlFor="account">Account name</Label>
            <Input
              id="account"
              value={form.accountName}
              onChange={(e) => setForm({ ...form, accountName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="type">Payment type</Label>
            <select
              id="type"
              className="mt-1 h-10 w-full rounded-xl bg-card px-3 text-sm shadow-sm"
              value={form.paymentType}
              onChange={(e) =>
                setForm({ ...form, paymentType: e.target.value as PaymentSettings['paymentType'] })
              }
            >
              <option value="PHONE">Phone transfer</option>
              <option value="MERCHANT">Merchant payment</option>
            </select>
          </div>
          {form.paymentType === 'PHONE' ? (
            <div>
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                value={form.phoneNumber ?? ''}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>
          ) : (
            <div>
              <Label htmlFor="merchant">Merchant code</Label>
              <Input
                id="merchant"
                value={form.merchantCode ?? ''}
                onChange={(e) => setForm({ ...form, merchantCode: e.target.value })}
              />
            </div>
          )}
          <div>
            <Label htmlFor="ussd">USSD format</Label>
            <Input
              id="ussd"
              value={form.ussdTemplate}
              onChange={(e) => setForm({ ...form, ussdTemplate: e.target.value })}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Use {form.paymentType === 'PHONE' ? '{phone_number}' : '{merchant_code}'} where the
              configured value belongs.
            </p>
          </div>
          <div className="rounded-xl bg-muted/60 p-4 md:col-span-2">
            <p className="text-xs text-muted-foreground">Member preview</p>
            <div className="mt-2 flex items-center gap-3">
              <CreditCard className="size-5 text-primary" />
              <div>
                <p className="font-semibold">{form.accountName}</p>
                <code className="text-sm">
                  {form.ussdTemplate
                    .replace('{phone_number}', form.phoneNumber ?? '')
                    .replace('{merchant_code}', form.merchantCode ?? '')}
                </code>
              </div>
            </div>
          </div>
          <div className="flex justify-end md:col-span-2">
            <Button
              disabled={saving}
              onClick={() => void save()}
            >
              {saving ? 'Saving…' : 'Save payment settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
