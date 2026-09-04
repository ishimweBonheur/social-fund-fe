import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/services/api'
import { submitSupportRequest } from '@/services/notificationService'

export default function SupportRequestDialog({
  open,
  onOpenChange,
  contributionId,
  defaultCategory,
  defaultMessage,
  onSent,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  contributionId?: string
  defaultCategory?: string
  defaultMessage?: string
  onSent?: () => void
}) {
  const [category, setCategory] = useState(
    defaultCategory ?? (contributionId ? 'CONTRIBUTION_PENDING' : 'GENERAL_SUPPORT'),
  )
  const [message, setMessage] = useState(defaultMessage ?? '')
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!message.trim()) return
    setBusy(true)
    try {
      await submitSupportRequest({ category, message: message.trim(), contributionId })
      toast.success('Your message was sent to the administrator.')
      onOpenChange(false)
      setMessage('')
      onSent?.()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to send your message.'))
    } finally {
      setBusy(false)
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>
              {contributionId ? 'Remind Admin About Payment' : 'Request Support'}
            </DialogTitle>
            <DialogDescription>
              Send a message to the administrator for review. It will appear in Notifications and be
              delivered by email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 px-6 py-5">
            <div>
              <Label htmlFor="support-category">Problem type</Label>
              <select
                id="support-category"
                className="mt-1 h-10 w-full rounded-xl border bg-card px-3 text-sm"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="GENERAL_SUPPORT">General system problem</option>
                <option value="CONTRIBUTION_PENDING">Contribution still pending</option>
                <option value="ACCOUNT_PROBLEM">Account problem</option>
              </select>
            </div>
            <div>
              <Label htmlFor="support-message">Message *</Label>
              <Textarea
                id="support-message"
                required
                maxLength={4000}
                className="min-h-32"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Explain what happened and include any useful payment reference."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button disabled={busy || !message.trim()}>
              {busy ? 'Sending…' : 'Send to Admin'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
