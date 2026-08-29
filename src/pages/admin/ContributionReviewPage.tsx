import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  approveContribution,
  rejectContribution,
  validateContributionReviewToken,
} from '@/services/contributionService'
import { getApiErrorMessage } from '@/services/api'

type Review = Awaited<ReturnType<typeof validateContributionReviewToken>>
export default function ContributionReviewPage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const action = params.get('action') as 'approve' | 'reject'
  const token = params.get('token') ?? ''
  const [review, setReview] = useState<Review>()
  const [error, setError] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const invalid = !id || !token || !['approve', 'reject'].includes(action)
  useEffect(() => {
    if (invalid) return
    void validateContributionReviewToken(id, token, action)
      .then(setReview)
      .catch((value) =>
        setError(getApiErrorMessage(value, 'This review link is invalid or expired.')),
      )
  }, [id, token, action, invalid])
  const confirm = async () => {
    if (action === 'reject' && !reason.trim()) return
    setBusy(true)
    try {
      if (action === 'approve') await approveContribution(id)
      else await rejectContribution(id, reason.trim())
      toast.success(`Contribution ${action === 'approve' ? 'approved' : 'rejected'} successfully.`)
      navigate('/admin/contributions', { replace: true })
    } catch (value) {
      toast.error(getApiErrorMessage(value))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div>
      <PageHeader
        title="Review Contribution"
        description="Confirm the action requested from the contribution email"
      />
      {invalid ? (
        <Card>
          <CardContent className="p-6 text-sm text-red-700">
            This review link is invalid.
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-sm text-red-700">{error}</CardContent>
        </Card>
      ) : !review ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Validating review link…
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <p>
                <span className="text-sm text-muted-foreground">Member</span>
                <br />
                <strong>{review.member_name}</strong>
              </p>
              <p>
                <span className="text-sm text-muted-foreground">Paid amount</span>
                <br />
                <strong>RWF {Number(review.PaidAmount ?? 0).toLocaleString()}</strong>
              </p>
              <p>
                <span className="text-sm text-muted-foreground">Method</span>
                <br />
                <strong>{review.PaymentMethod ?? '—'}</strong>
              </p>
              <p>
                <span className="text-sm text-muted-foreground">Reference</span>
                <br />
                <strong>{review.TransactionReference ?? '—'}</strong>
              </p>
            </div>
            {action === 'reject' && (
              <div>
                <Label htmlFor="review-reason">Rejection reason *</Label>
                <textarea
                  id="review-reason"
                  className="mt-1 min-h-28 w-full rounded-xl border bg-card p-3 text-sm"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/contributions')}
              >
                Cancel
              </Button>
              <Button
                disabled={busy || (action === 'reject' && !reason.trim())}
                className={action === 'reject' ? 'bg-red-600 hover:bg-red-700' : ''}
                onClick={() => void confirm()}
              >
                {busy
                  ? 'Processing…'
                  : action === 'approve'
                    ? 'Confirm Approval'
                    : 'Confirm Rejection'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
