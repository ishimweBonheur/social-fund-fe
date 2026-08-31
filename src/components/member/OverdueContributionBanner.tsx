import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '@/context/AppContext'
import {
  getOutstanding,
  listMyContributions,
  type Contribution,
} from '@/services/contributionService'

interface OverdueSummary {
  amount: string
  count: number
  paymentTarget?: Contribution
}

const money = (value: string) =>
  new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(Number(value))

export default function OverdueContributionBanner() {
  const { currentUser } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const [summary, setSummary] = useState<OverdueSummary>()
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (currentUser?.role !== 'MEMBER') return
    setLoading(true)
    try {
      const [outstanding, contributions] = await Promise.all([
        getOutstanding(),
        listMyContributions(),
      ])
      const paymentTarget = contributions
        .filter((item) => item.status === 'OVERDUE' || item.status === 'REJECTED')
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]
      setSummary({
        amount: outstanding.outstanding_amount,
        count: outstanding.overdue_count,
        paymentTarget,
      })
    } catch {
      // The page remains usable if the non-critical warning request fails.
    } finally {
      setLoading(false)
    }
  }, [currentUser?.role])

  useEffect(() => {
    const initial = window.setTimeout(() => void refresh(), 0)
    const interval = window.setInterval(() => void refresh(), 60_000)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(interval)
    }
  }, [refresh, location.pathname])

  if (currentUser?.role !== 'MEMBER' || !summary || summary.count < 1) return null

  const openPayment = () => {
    const query = summary.paymentTarget ? `?pay=${summary.paymentTarget.id}` : ''
    navigate(`/member/contributions${query}`)
  }

  return (
    <section
      aria-label="Overdue contribution warning"
      className="mb-4 overflow-hidden rounded-2xl border border-amber-700/35 bg-amber-50 text-amber-950 shadow-[0_10px_30px_-20px_rgba(146,64,14,.7)] dark:border-amber-400/45 dark:bg-amber-950 dark:text-amber-50"
    >
      <button
        type="button"
        onClick={openPayment}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-amber-600/35 dark:hover:bg-amber-900 sm:px-5"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-600 text-white dark:bg-amber-400 dark:text-amber-950">
          <AlertTriangle
            className="size-5"
            aria-hidden="true"
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold sm:text-base">
            Overdue contribution: {money(summary.amount)}
          </span>
          <span className="mt-0.5 block text-xs font-medium text-amber-900/80 dark:text-amber-100/85 sm:text-sm">
            {summary.count} overdue {summary.count === 1 ? 'payment' : 'payments'}, including late
            penalties. please make a payment to avoid further penalties and potential suspension of your membership.
          </span>
        </span>
        {loading ? (
          <RefreshCw
            className="size-5 shrink-0 animate-spin"
            aria-label="Updating amount"
          />
        ) : (
          <ArrowRight
            className="size-5 shrink-0"
            aria-hidden="true"
          />
        )}
      </button>
    </section>
  )
}
