import { motion } from 'framer-motion'
import { ExpandDialog } from '@/components/shared/ExpandDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mandatoryPaymentAvatars } from '@/data/mock-data'

export function MandatoryPaymentsCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Mandatory Payments</CardTitle>
            <CardDescription>Recent payments</CardDescription>
          </div>
          <ExpandDialog title="Mandatory Payments" description="All scheduled mandatory payments">
            <div className="space-y-2">
              {mandatoryPaymentAvatars.map((src, i) => (
                <div key={src} className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={src} alt={`User ${i + 1}`} />
                    <AvatarFallback className="text-[10px]">U{i + 1}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium">Payment #{i + 1}</p>
                    <p className="text-[10px] text-muted-foreground">Due monthly</p>
                  </div>
                </div>
              ))}
            </div>
          </ExpandDialog>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center">
            {mandatoryPaymentAvatars.map((src, i) => (
              <Avatar
                key={src}
                className="h-8 w-8 border-2 border-card"
                style={{ marginLeft: i === 0 ? 0 : -10, zIndex: mandatoryPaymentAvatars.length - i }}
              >
                <AvatarImage src={src} alt={`User ${i + 1}`} />
                <AvatarFallback className="text-[10px]">U{i + 1}</AvatarFallback>
              </Avatar>
            ))}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-[#0F9D58] text-[11px] font-semibold text-white"
              style={{ marginLeft: -10, zIndex: 0 }}
            >
              +2
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
