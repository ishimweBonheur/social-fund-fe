import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Search, Users, Wallet } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useApp } from '@/context/AppContext'

const quickLinks = [
  { label: 'Dashboard', path: '/' },
  { label: 'Reports', path: '/reports' },
  { label: 'Wallet', path: '/wallet' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Messages', path: '/messages' },
  { label: 'Documents', path: '/documents' },
  { label: 'History', path: '/history' },
  { label: 'Contacts', path: '/contacts' },
  { label: 'Settings', path: '/settings' },
]

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate()
  const { wallets, contacts, documents, transactions } = useApp()
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return quickLinks.map((l) => ({ type: 'page' as const, ...l }))

    const items: Array<{ type: string; label: string; path?: string; detail?: string }> = []

    quickLinks
      .filter((l) => l.label.toLowerCase().includes(q))
      .forEach((l) => items.push({ type: 'page', ...l }))

    wallets
      .filter((w) => w.name.toLowerCase().includes(q))
      .forEach((w) =>
        items.push({ type: 'wallet', label: w.name, path: '/wallet', detail: `$${w.balance.toLocaleString()}` })
      )

    contacts
      .filter((c) => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q))
      .forEach((c) =>
        items.push({ type: 'contact', label: c.name, path: '/contacts', detail: c.company })
      )

    documents
      .filter((d) => d.name.toLowerCase().includes(q))
      .forEach((d) =>
        items.push({ type: 'document', label: d.name, path: '/documents', detail: d.type })
      )

    transactions
      .filter((t) => t.name.toLowerCase().includes(q))
      .forEach((t) =>
        items.push({
          type: 'transaction',
          label: t.name,
          path: '/transactions',
          detail: `$${Math.abs(t.amount).toLocaleString()}`,
        })
      )

    return items.slice(0, 8)
  }, [query, wallets, contacts, documents, transactions])

  const handleSelect = (path?: string) => {
    if (path) {
      navigate(path)
      onOpenChange(false)
      setQuery('')
    }
  }

  const iconFor = (type: string) => {
    switch (type) {
      case 'wallet':
        return <Wallet className="h-4 w-4 text-primary" />
      case 'contact':
        return <Users className="h-4 w-4 text-primary" />
      case 'document':
        return <FileText className="h-4 w-4 text-primary" />
      default:
        return <Search className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b border-border p-4">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search pages, wallets, contacts..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </DialogHeader>
        <div className="max-h-72 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No results found</p>
          ) : (
            results.map((item, i) => (
              <button
                key={`${item.type}-${item.label}-${i}`}
                type="button"
                onClick={() => handleSelect(item.path)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted"
              >
                {iconFor(item.type)}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.label}</p>
                  {'detail' in item && item.detail && (
                    <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
