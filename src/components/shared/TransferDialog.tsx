import { useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
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

interface TransferDialogProps {
  mode: 'send' | 'receive'
}

export function TransferDialog({ mode }: TransferDialogProps) {
  const { sendMoney, receiveMoney } = useApp()
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [party, setParty] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = parseFloat(amount)
    if (!value || value <= 0 || !party.trim()) return
    if (mode === 'send') sendMoney(value, party.trim())
    else receiveMoney(value, party.trim())
    setAmount('')
    setParty('')
    setOpen(false)
  }

  const isSend = mode === 'send'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={
            isSend
              ? 'flex-1 rounded-full bg-[#0F9D58] hover:bg-[#0F9D58]/90'
              : 'flex-1 rounded-full border-border'
          }
          variant={isSend ? 'default' : 'outline'}
        >
          {isSend ? 'Send' : 'Receive'}
          {isSend ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isSend ? 'Send Money' : 'Receive Money'}</DialogTitle>
            <DialogDescription>
              {isSend
                ? 'Transfer funds to a recipient from your primary wallet.'
                : 'Record an incoming payment to your wallet.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor={`${mode}-party`}>{isSend ? 'Recipient' : 'Sender'}</Label>
              <Input
                id={`${mode}-party`}
                placeholder={isSend ? 'Enter recipient name' : 'Enter sender name'}
                value={party}
                onChange={(e) => setParty(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${mode}-amount`}>Amount (USD)</Label>
              <Input
                id={`${mode}-amount`}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0F9D58] hover:bg-[#0F9D58]/90">
              {isSend ? 'Send Now' : 'Confirm Receipt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
