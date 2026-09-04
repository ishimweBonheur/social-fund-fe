import ProfileForm from '@/components/forms/ProfileForm'
import { Link } from 'react-router-dom'
import { CreditCard, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <Link
        to="/admin/settings/payment-method"
        className="block"
      >
        <Card className="shadow-card transition hover:-translate-y-0.5">
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold">Payment method</p>
              <p className="text-sm text-muted-foreground">
                Configure account name, phone or merchant code, and USSD format.
              </p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
      <ProfileForm admin />
    </div>
  )
}
