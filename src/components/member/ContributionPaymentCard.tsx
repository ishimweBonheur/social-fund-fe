import { Phone } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const ussdCode = '*182*1*1*0784963589#'
const dialUrl = 'tel:*182*1*1*0784963589%23'

export default function ContributionPaymentCard() {
  return (
    <Card className="mb-3">
      <CardContent className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:items-center">
        <div className="shrink-0 rounded-xl border bg-white p-2">
          <QRCodeSVG value={dialUrl} size={112} level="M" title="Dial contribution payment code" />
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-sm font-semibold">Pay your contribution</p>
          <p className="mt-1 text-xs text-muted-foreground">Scan the QR code with your phone to open the dialer, or use the button below on this device.</p>
          <code className="mt-2 inline-block rounded-lg bg-muted px-3 py-2 text-sm font-semibold">{ussdCode}</code>
        </div>
        <Button asChild className="shrink-0">
          <a href={dialUrl}><Phone className="h-4 w-4" />Dial on this device</a>
        </Button>
      </CardContent>
    </Card>
  )
}
