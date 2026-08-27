import { CreditCard, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { AddWalletDialog } from '@/components/shared/AddWalletDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '@/context/AppContext'

export function WalletPage() {
  const { wallets } = useApp()
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0)

  return (
    <div>
      <PageHeader
        title="Wallet"
        description="Manage your wallets and account balances"
        action={
          <AddWalletDialog
            trigger={
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-[#0F9D58] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0F9D58]/90"
              >
                <Plus className="h-4 w-4" />
                Add Wallet
              </button>
            }
          />
        }
      />

      <Card className="mb-4">
        <CardContent className="flex items-center justify-between p-3.5">
          <div>
            <p className="text-xs text-muted-foreground">Total Balance</p>
            <p className="text-xl font-bold">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F9D58]/10">
            <CreditCard className="h-5 w-5 text-[#0F9D58]" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {wallets.map((wallet) => (
          <Card key={wallet.id}>
            <CardHeader>
              <CardTitle className="text-base">{wallet.name}</CardTitle>
              <CardDescription className="capitalize">{wallet.type} · •••• {wallet.lastFour}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">
                ${wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{wallet.currency}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
