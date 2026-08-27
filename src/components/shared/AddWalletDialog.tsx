import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useApp } from '@/context/AppContext'

interface AddWalletDialogProps {
  trigger?: React.ReactNode
}

export function AddWalletDialog({ trigger }: AddWalletDialogProps) {
  const { addWallet } = useApp()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [type, setType] = useState<'checking' | 'savings' | 'credit'>('checking')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    addWallet({
      name: name.trim(),
      balance: parseFloat(balance) || 0,
      currency: 'USD',
      type,
      lastFour: String(Math.floor(1000 + Math.random() * 9000)),
    })
    setName('')
    setBalance('')
    setType('checking')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="rounded-full border-border bg-card font-medium shadow-sm">
            <Plus className="h-4 w-4" />
            Add New Wallet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Wallet</DialogTitle>
            <DialogDescription>Create a new wallet to manage your funds.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="wallet-name">Wallet Name</Label>
              <Input
                id="wallet-name"
                placeholder="e.g. Travel Fund"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wallet-balance">Initial Balance (USD)</Label>
              <Input
                id="wallet-balance"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wallet-type">Account Type</Label>
              <select
                id="wallet-type"
                value={type}
                onChange={(e) => setType(e.target.value as typeof type)}
                className="flex h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0F9D58] hover:bg-[#0F9D58]/90">
              Create Wallet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
