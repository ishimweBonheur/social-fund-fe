import { motion } from 'framer-motion'
import { Wifi } from 'lucide-react'
import { ExpandDialog } from '@/components/shared/ExpandDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'

function CreditCardVisual({ balance, lastFour }: { balance: number; lastFour: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-3.5 text-white"
      style={{ background: 'linear-gradient(135deg, #0F9D58 0%, #16A34A 100%)' }}
    >
      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
      <div className="relative flex items-start justify-between">
        <div>
          <span className="text-sm font-bold italic tracking-wider">VISA</span>
          <p className="text-[10px] text-white/80">Credit Card</p>
        </div>
        <Wifi className="h-4 w-4 rotate-90 text-white/70" />
      </div>
      <p className="relative mt-4 text-lg font-bold tracking-tight">
        $ {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
      <div className="relative mt-3 flex items-end justify-between text-[10px]">
        <div>
          <p className="uppercase tracking-wider text-white/60">Card Number</p>
          <p className="mt-0.5 font-mono text-xs tracking-widest">•••• {lastFour}</p>
        </div>
        <div className="text-right">
          <p className="uppercase tracking-wider text-white/60">Exp</p>
          <p className="mt-0.5 text-xs font-medium">09/26</p>
        </div>
      </div>
    </div>
  )
}

export function CreditCardWidget() {
  const { wallets } = useApp()
  const creditWallet = wallets.find((w) => w.type === 'credit') ?? wallets[1]

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Payment Goal</CardTitle>
            <CardDescription>Total amount goal</CardDescription>
          </div>
          <ExpandDialog title="Credit Card" description="Full card details">
            <CreditCardVisual balance={creditWallet?.balance ?? 78989.09} lastFour={creditWallet?.lastFour ?? '9090'} />
          </ExpandDialog>
        </CardHeader>
        <CardContent className="pt-0">
          <CreditCardVisual
            balance={creditWallet?.balance ?? 78989.09}
            lastFour={creditWallet?.lastFour ?? '9090'}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
