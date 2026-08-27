import { useState } from 'react'
import { ArrowLeft, Send } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useApp } from '@/context/AppContext'
import { cn } from '@/lib/utils'

export function MessagesPage() {
  const { messages, contacts, toggleMessageRead, sendMessage } = useApp()
  const [selectedId, setSelectedId] = useState(messages[0]?.id ?? '')
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [draft, setDraft] = useState('')

  const selected = messages.find((m) => m.id === selectedId)
  const contact = contacts.find((c) => c.name === selected?.sender)

  const handleSelect = (id: string, unread: boolean) => {
    setSelectedId(id)
    setMobileDetailOpen(true)
    if (unread) toggleMessageRead(id)
  }

  const handleSend = () => {
    if (!draft.trim() || !contact) return
    sendMessage(contact.id, draft.trim())
    setDraft('')
  }

  return (
    <div className="min-w-0">
      <PageHeader title="Messages" description="Communicate with your contacts and team" />

      <div className="grid min-w-0 gap-4 lg:grid-cols-5">
        <Card className={cn('min-w-0 lg:col-span-2', mobileDetailOpen && 'hidden lg:block')}>
          <CardContent className="max-h-[70vh] overflow-y-auto p-2 scrollbar-hide lg:max-h-none">
            {messages.map((msg) => (
              <button
                key={msg.id}
                type="button"
                onClick={() => handleSelect(msg.id, msg.unread)}
                className={cn(
                  'flex w-full min-w-0 items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted',
                  selectedId === msg.id && 'bg-muted'
                )}
              >
                <Avatar className="h-9 w-9 shrink-0 sm:h-10 sm:w-10">
                  <AvatarImage src={msg.avatar} alt={msg.sender} />
                  <AvatarFallback>{msg.sender[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('truncate text-sm', msg.unread && 'font-semibold')}>{msg.sender}</p>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{msg.time}</span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{msg.preview}</p>
                </div>
                {msg.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-[#0F9D58]" />}
              </button>
            ))}
          </CardContent>
        </Card>

        <Card
          className={cn(
            'flex min-h-[24rem] min-w-0 flex-col lg:col-span-3',
            !mobileDetailOpen && 'hidden lg:flex'
          )}
        >
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b border-border p-3 sm:p-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full lg:hidden"
                  onClick={() => setMobileDetailOpen(false)}
                  aria-label="Back to messages"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-9 w-9 shrink-0 sm:h-10 sm:w-10">
                  <AvatarImage src={selected.avatar} alt={selected.sender} />
                  <AvatarFallback>{selected.sender[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{selected.sender}</p>
                  <p className="text-xs text-muted-foreground">Active now</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted px-4 py-3 sm:max-w-[80%]">
                  <p className="text-sm break-words">{selected.preview}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{selected.time}</p>
                </div>
              </div>
              <div className="flex gap-2 border-t border-border p-3 sm:p-4">
                <Input
                  className="min-w-0 flex-1"
                  placeholder="Type a message..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button
                  onClick={handleSend}
                  className="shrink-0 bg-[#0F9D58] hover:bg-[#0F9D58]/90"
                  disabled={!contact}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
              Select a conversation
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
